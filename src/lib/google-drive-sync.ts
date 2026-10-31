import {
  db,
  DEFAULT_APP_SETTINGS,
  ensureAppSettings,
  type AppSettings,
  type ChildProfile,
  type DailyProgress,
  type ReaderRole,
} from './db';

const DRIVE_FILE_NAME = 'talaqids_data.json';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/userinfo.email';
const TOKEN_STORAGE_KEY = 'talaqids_gdrive_token';

interface StoredToken {
  accessToken: string;
  expiresAt: number;
}

export interface CloudBackupPayload {
  schemaVersion: 1;
  updatedAt: string;
  deletedChildIds?: string[];
  children: ChildProfile[];
  progress: Omit<DailyProgress, 'id'>[];
  settings: {
    isProUser: boolean;
    infaqActivatedAt?: string;
    infaqNominal?: number;
    maxVolumeCap: number;
    enableBackgroundWakeLock: boolean;
    activeChildId?: string;
    deletedChildIds?: string[];
  };
}

interface GoogleTokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

interface GoogleTokenClient {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: GoogleTokenResponse) => void;
            error_callback?: (err: { type?: string; message?: string }) => void;
          }) => GoogleTokenClient;
          revoke: (token: string, done?: () => void) => void;
        };
      };
    };
  }
}

let gisScriptPromise: Promise<void> | null = null;

function loadGoogleIdentityScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window tidak tersedia'));
  }
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve();
  }
  if (gisScriptPromise) {
    return gisScriptPromise;
  }

  gisScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () =>
        reject(new Error('Gagal memuat Google Identity Services'))
      );
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      gisScriptPromise = null;
      reject(new Error('Gagal memuat script login Google'));
    };
    document.head.appendChild(script);
  });

  return gisScriptPromise;
}

export function getConfiguredGoogleClientId(): string {
  return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || '';
}

export function getStoredAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredToken;
    // Give 60 seconds buffer before expiry
    if (!parsed.accessToken || Date.now() >= parsed.expiresAt - 60_000) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      return null;
    }
    return parsed.accessToken;
  } catch {
    return null;
  }
}

function saveAccessToken(accessToken: string, expiresInSeconds: number): void {
  if (typeof window === 'undefined') return;
  const payload: StoredToken = {
    accessToken,
    expiresAt: Date.now() + expiresInSeconds * 1000,
  };
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota issues
  }
}

export function clearStoredAccessToken(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // Ignore
  }
}

export async function requestGoogleDriveToken(options: {
  clientId: string;
  interactive: boolean;
}): Promise<string> {
  const cached = getStoredAccessToken();
  if (cached) return cached;

  await loadGoogleIdentityScript();

  const oauth2 = window.google?.accounts?.oauth2;
  if (!oauth2) {
    throw new Error('Layanan autentikasi Google belum siap.');
  }

  return new Promise<string>((resolve, reject) => {
    const client = oauth2.initTokenClient({
      client_id: options.clientId,
      scope: DRIVE_SCOPE,
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(
            new Error(
              response.error_description ||
                response.error ||
                'Gagal mendapatkan token akses Google Drive.'
            )
          );
          return;
        }
        saveAccessToken(response.access_token, response.expires_in || 3599);
        resolve(response.access_token);
      },
      error_callback: (err) => {
        reject(new Error(err.message || err.type || 'Login Google dibatalkan.'));
      },
    });

    client.requestAccessToken({
      prompt: options.interactive ? 'consent' : '',
    });
  });
}

async function fetchUserEmail(accessToken: string): Promise<string | undefined> {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return undefined;
    const data = (await res.json()) as { email?: string };
    return data.email;
  } catch {
    return undefined;
  }
}

/**
 * Deterministic CRDT-style merge of local and remote datasets:
 * - Children: merged by `id`, taking the newest `updatedAt`.
 * - Progress: merged by `[childId+date]`, unioning `pagesCompleted`
 *   (`Array.from(new Set([...localPages, ...remotePages]))`) and taking max `listenMinutes`.
 * - Settings: preserves Pro/Muhsinin status if unlocked on either device.
 */
export function mergeCloudAndLocalData(
  local: CloudBackupPayload,
  remote: CloudBackupPayload
): CloudBackupPayload {
  // 0. Collect all deleted children tombstones across local and remote
  const allDeletedChildIds = new Set<string>([
    ...(local.deletedChildIds || local.settings?.deletedChildIds || []),
    ...(remote.deletedChildIds || remote.settings?.deletedChildIds || []),
  ]);

  // 1. Merge and Deduplicate Children
  // Match by UUID first, then fallback to normalized name + birthDate
  // to avoid duplicates if the same child was registered on multiple devices before sync.
  const childrenMap = new Map<string, ChildProfile>();
  const idAliases = new Map<string, string>(); // aliasId -> canonicalId
  const fingerprintToId = new Map<string, string>();

  const getChildFingerprint = (c: ChildProfile) =>
    `${(c.name || '').trim().toLowerCase()}__${c.birthDate}`;

  const pickNewestPlayback = (c1?: ChildProfile, c2?: ChildProfile) => {
    if (!c1?.lastPlayback) return c2?.lastPlayback;
    if (!c2?.lastPlayback) return c1?.lastPlayback;
    const t1 = Date.parse(c1.lastPlayback.updatedAt || '1970-01-01');
    const t2 = Date.parse(c2.lastPlayback.updatedAt || '1970-01-01');
    return t1 >= t2 ? c1.lastPlayback : c2.lastPlayback;
  };

  const processChild = (child: ChildProfile) => {
    // If child is marked as deleted on either device, do not merge or restore!
    if (allDeletedChildIds.has(child.id)) {
      return;
    }

    const fp = getChildFingerprint(child);
    const existingIdByFp = fingerprintToId.get(fp);

    if (existingIdByFp && allDeletedChildIds.has(existingIdByFp)) {
      return;
    }

    if (childrenMap.has(child.id)) {
      const existing = childrenMap.get(child.id)!;
      const childTime = Date.parse(child.updatedAt || child.createdAt || '1970-01-01');
      const existingTime = Date.parse(existing.updatedAt || existing.createdAt || '1970-01-01');
      const winning = childTime >= existingTime ? child : existing;
      const newestPlayback = pickNewestPlayback(child, existing);
      childrenMap.set(child.id, {
        ...winning,
        lastPlayback: newestPlayback || winning.lastPlayback,
      });
      fingerprintToId.set(fp, child.id);
    } else if (existingIdByFp && childrenMap.has(existingIdByFp)) {
      // Same child name & birthdate, but different UUID generated on another device
      const canonicalId = existingIdByFp;
      idAliases.set(child.id, canonicalId);
      const existing = childrenMap.get(canonicalId)!;
      const childTime = Date.parse(child.updatedAt || child.createdAt || '1970-01-01');
      const existingTime = Date.parse(existing.updatedAt || existing.createdAt || '1970-01-01');
      const winning = childTime >= existingTime ? child : existing;
      const newestPlayback = pickNewestPlayback(child, existing);
      childrenMap.set(canonicalId, {
        ...winning,
        id: canonicalId,
        lastPlayback: newestPlayback || winning.lastPlayback,
      });
    } else {
      childrenMap.set(child.id, child);
      fingerprintToId.set(fp, child.id);
    }
  };

  for (const child of remote.children || []) {
    processChild(child);
  }
  for (const localChild of local.children || []) {
    processChild(localChild);
  }

  // 2. Merge Daily Progress by `${childId}__${date}`
  // Resolve childId aliases from deduplicated children, and discard progress of deleted children
  const progressMap = new Map<string, Omit<DailyProgress, 'id'>>();
  for (const item of remote.progress || []) {
    const resolvedChildId = idAliases.get(item.childId) || item.childId;
    if (allDeletedChildIds.has(resolvedChildId)) continue;

    const key = `${resolvedChildId}__${item.date}`;
    progressMap.set(key, {
      childId: resolvedChildId,
      date: item.date,
      juzNumber: item.juzNumber,
      listenMinutes: item.listenMinutes || 0,
      pagesCompleted: Array.from(new Set(item.pagesCompleted || [])).sort((a, b) => a - b),
      pageReaders: item.pageReaders ? { ...item.pageReaders } : undefined,
      readerRole: item.readerRole,
      notes: item.notes,
      updatedAt: item.updatedAt,
    });
  }

  for (const localItem of local.progress || []) {
    const resolvedChildId = idAliases.get(localItem.childId) || localItem.childId;
    if (allDeletedChildIds.has(resolvedChildId)) continue;

    const key = `${resolvedChildId}__${localItem.date}`;
    const remoteItem = progressMap.get(key);
    if (!remoteItem) {
      progressMap.set(key, {
        childId: resolvedChildId,
        date: localItem.date,
        juzNumber: localItem.juzNumber,
        listenMinutes: localItem.listenMinutes || 0,
        pagesCompleted: Array.from(new Set(localItem.pagesCompleted || [])).sort((a, b) => a - b),
        pageReaders: localItem.pageReaders ? { ...localItem.pageReaders } : undefined,
        readerRole: localItem.readerRole,
        notes: localItem.notes,
        updatedAt: localItem.updatedAt,
      });
    } else {
      const unionPages = Array.from(
        new Set([...(localItem.pagesCompleted || []), ...(remoteItem.pagesCompleted || [])])
      ).sort((a, b) => a - b);

      const localTime = Date.parse(localItem.updatedAt || '1970-01-01');
      const remoteTime = Date.parse(remoteItem.updatedAt || '1970-01-01');
      const newer = localTime >= remoteTime ? localItem : remoteItem;

      // Merge per-page manual reader attribution strictly from pageReaders
      const mergedPageReaders: Record<number, ReaderRole> = {};
      const manualPages = new Set([
        ...Object.keys(localItem.pageReaders || {}).map(Number),
        ...Object.keys(remoteItem.pageReaders || {}).map(Number),
      ]);
      for (const page of manualPages) {
        const localRole = localItem.pageReaders?.[page];
        const remoteRole = remoteItem.pageReaders?.[page];

        if (localRole && remoteRole && localRole !== remoteRole) {
          mergedPageReaders[page] = 'Bersama';
        } else if (localRole || remoteRole) {
          mergedPageReaders[page] = (localRole || remoteRole)!;
        }
      }

      // If one device marked Ayah and the other marked Ibu on the same day, combine to 'Bersama'
      let mergedRole = newer.readerRole || localItem.readerRole || remoteItem.readerRole;
      if (
        localItem.readerRole &&
        remoteItem.readerRole &&
        localItem.readerRole !== remoteItem.readerRole
      ) {
        mergedRole = 'Bersama';
      }

      progressMap.set(key, {
        childId: resolvedChildId,
        date: localItem.date,
        juzNumber: newer.juzNumber,
        listenMinutes: Math.max(localItem.listenMinutes || 0, remoteItem.listenMinutes || 0),
        pagesCompleted: unionPages,
        pageReaders: Object.keys(mergedPageReaders).length > 0 ? mergedPageReaders : undefined,
        readerRole: mergedRole,
        notes: newer.notes || localItem.notes || remoteItem.notes,
        updatedAt:
          localTime >= remoteTime
            ? localItem.updatedAt || remoteItem.updatedAt
            : remoteItem.updatedAt || localItem.updatedAt,
      });
    }
  }

  // 3. Merge Settings
  const isProUser = Boolean(local.settings.isProUser || remote.settings.isProUser);
  const mergedChildren = Array.from(childrenMap.values());
  let preferredActiveChildId =
    (local.settings.activeChildId && idAliases.get(local.settings.activeChildId)) ||
    local.settings.activeChildId ||
    (remote.settings.activeChildId && idAliases.get(remote.settings.activeChildId)) ||
    remote.settings.activeChildId;

  if (preferredActiveChildId && allDeletedChildIds.has(preferredActiveChildId)) {
    preferredActiveChildId = undefined;
  }
  if (!preferredActiveChildId) {
    preferredActiveChildId = mergedChildren[0]?.id;
  }

  const combinedDeletedList = Array.from(allDeletedChildIds);

  return {
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    deletedChildIds: combinedDeletedList,
    children: mergedChildren,
    progress: Array.from(progressMap.values()),
    settings: {
      isProUser,
      infaqActivatedAt: local.settings.infaqActivatedAt || remote.settings.infaqActivatedAt,
      infaqNominal: Math.max(local.settings.infaqNominal || 0, remote.settings.infaqNominal || 0) || undefined,
      maxVolumeCap: local.settings.maxVolumeCap ?? remote.settings.maxVolumeCap ?? 0.6,
      enableBackgroundWakeLock:
        local.settings.enableBackgroundWakeLock ??
        remote.settings.enableBackgroundWakeLock ??
        true,
      activeChildId: preferredActiveChildId,
      deletedChildIds: combinedDeletedList,
    },
  };
}

export async function buildLocalBackupPayload(): Promise<CloudBackupPayload> {
  const [children, progressRows, currentSettings] = await Promise.all([
    db.children.toArray(),
    db.progress.toArray(),
    ensureAppSettings(),
  ]);

  const cleanProgress: Omit<DailyProgress, 'id'>[] = progressRows.map(
    ({ id: _id, ...rest }) => rest
  );

  return {
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    deletedChildIds: currentSettings.deletedChildIds || [],
    children,
    progress: cleanProgress,
    settings: {
      isProUser: currentSettings.isProUser,
      infaqActivatedAt: currentSettings.infaqActivatedAt,
      infaqNominal: currentSettings.infaqNominal,
      maxVolumeCap: currentSettings.maxVolumeCap,
      enableBackgroundWakeLock: currentSettings.enableBackgroundWakeLock,
      activeChildId: currentSettings.activeChildId,
      deletedChildIds: currentSettings.deletedChildIds || [],
    },
  };
}

export async function applyMergedPayloadToLocalDb(
  merged: CloudBackupPayload,
  extraMeta?: {
    googleDriveEmail?: string;
    googleDriveFileId?: string;
    googleDriveLastSyncedAt?: string;
  }
): Promise<void> {
  await db.transaction('rw', db.children, db.progress, db.settings, async () => {
    // Replace all children with the deduplicated and non-deleted children list
    await db.children.clear();
    if (merged.children.length > 0) {
      await db.children.bulkPut(merged.children);
    }

    // Purge progress records belonging to deleted children
    for (const delId of merged.deletedChildIds || []) {
      await db.progress.where('childId').equals(delId).delete();
    }

    for (const item of merged.progress) {
      const existing = await db.progress
        .where('[childId+date]')
        .equals([item.childId, item.date])
        .first();

      if (existing?.id !== undefined) {
        await db.progress.put({ ...item, id: existing.id });
      } else {
        await db.progress.add(item);
      }
    }

    const currentSettings = (await db.settings.get('app_config')) || DEFAULT_APP_SETTINGS;
    const combinedDeleted = Array.from(
      new Set([
        ...(currentSettings.deletedChildIds || []),
        ...(merged.deletedChildIds || []),
      ])
    );
    await db.settings.put({
      ...currentSettings,
      ...merged.settings,
      key: 'app_config',
      deletedChildIds: combinedDeleted,
      googleDriveEmail: extraMeta?.googleDriveEmail ?? currentSettings.googleDriveEmail,
      googleDriveFileId: extraMeta?.googleDriveFileId ?? currentSettings.googleDriveFileId,
      googleDriveLastSyncedAt:
        extraMeta?.googleDriveLastSyncedAt ?? currentSettings.googleDriveLastSyncedAt,
    });
  });
}

async function findAppDataFile(accessToken: string): Promise<{ id: string; modifiedTime?: string } | null> {
  const query = encodeURIComponent(`name = '${DRIVE_FILE_NAME}' and trashed = false`);
  const url = `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${query}&fields=files(id,name,modifiedTime)&pageSize=1`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 401) {
    clearStoredAccessToken();
    throw new Error('Sesi Google Drive berakhir. Silakan klik Sinkronkan untuk menyambung ulang.');
  }

  if (!res.ok) {
    throw new Error(`Gagal mengecek Google Drive (${res.status})`);
  }

  const data = (await res.json()) as { files?: { id: string; modifiedTime?: string }[] };
  return data.files?.[0] || null;
}

async function downloadAppDataFile(
  accessToken: string,
  fileId: string
): Promise<CloudBackupPayload | null> {
  const url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  try {
    return (await res.json()) as CloudBackupPayload;
  } catch {
    return null;
  }
}

async function uploadAppDataFile(
  accessToken: string,
  payload: CloudBackupPayload,
  existingFileId?: string
): Promise<string> {
  const metadata = existingFileId
    ? { name: DRIVE_FILE_NAME }
    : { name: DRIVE_FILE_NAME, parents: ['appDataFolder'] };

  const boundary = 'talaqids_drive_boundary_' + Date.now();
  const body =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(payload)}\r\n` +
    `--${boundary}--`;

  const url = existingFileId
    ? `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(existingFileId)}?uploadType=multipart&fields=id`
    : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id`;

  const method = existingFileId ? 'PATCH' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  });

  if (res.status === 401) {
    clearStoredAccessToken();
    throw new Error('Sesi Google Drive berakhir.');
  }

  if (!res.ok) {
    throw new Error(`Gagal mengunggah ke Google Drive (${res.status})`);
  }

  const data = (await res.json()) as { id: string };
  return data.id;
}

/**
 * Full 2-way sync with Google Drive `appDataFolder`:
 * 1. Checks `talaqids_data.json` in `appDataFolder`
 * 2. Downloads & merges remote + local (union of pagesCompleted per date, latest child profile)
 * 3. Saves merged state to local IndexedDB and uploads updated JSON back to Drive
 */
export async function syncWithGoogleDrive(options?: {
  interactive?: boolean;
  allowRestore?: boolean;
}): Promise<{ syncedAt: string; email?: string; fileId: string }> {
  const settings = await ensureAppSettings();
  const allowRestore = options?.allowRestore ?? false;

  const clientId = getConfiguredGoogleClientId();
  if (!clientId) {
    throw new Error(
      'Layanan Google Drive belum dikonfigurasi (NEXT_PUBLIC_GOOGLE_CLIENT_ID belum diatur di .env.local).'
    );
  }

  const interactive = options?.interactive ?? false;
  let accessToken = getStoredAccessToken();

  if (!accessToken) {
    if (!interactive) {
      throw new Error('TOKEN_EXPIRED_SILENT');
    }
    accessToken = await requestGoogleDriveToken({ clientId, interactive: true });
  }

  const [remoteFile, localPayload, email] = await Promise.all([
    findAppDataFile(accessToken),
    buildLocalBackupPayload(),
    settings.googleDriveEmail ? Promise.resolve(settings.googleDriveEmail) : fetchUserEmail(accessToken),
  ]);

  if (!remoteFile) {
    if (allowRestore) {
      throw new Error(
        'Belum ada data backup talaQids yang ditemukan di Google Drive akun ini.'
      );
    }
    if (!settings.isProUser) {
      throw new Error('Fitur sinkronisasi Google Drive khusus untuk Tier Muhsinin.');
    }
  }

  let finalPayload = localPayload;
  if (remoteFile) {
    const remotePayload = await downloadAppDataFile(accessToken, remoteFile.id);
    if (remotePayload && remotePayload.schemaVersion === 1) {
      finalPayload = mergeCloudAndLocalData(localPayload, remotePayload);
    }
  }

  // Check Pro / Muhsinin entitlement after reading cloud payload (cloud might already be Muhsinin)
  const isEntitledPro = Boolean(settings.isProUser || finalPayload.settings?.isProUser);
  if (!isEntitledPro && !allowRestore) {
    throw new Error('Fitur sinkronisasi Google Drive khusus untuk Tier Muhsinin.');
  }

  // Upload back merged data only if user is Muhsinin or in regular sync mode
  let fileId = remoteFile?.id || '';
  if (isEntitledPro || !remoteFile) {
    fileId = await uploadAppDataFile(accessToken, finalPayload, remoteFile?.id);
  }

  const syncedAt = new Date().toISOString();

  await applyMergedPayloadToLocalDb(finalPayload, {
    googleDriveEmail: email,
    googleDriveFileId: fileId,
    googleDriveLastSyncedAt: syncedAt,
  });

  return { syncedAt, email, fileId };
}

export async function disconnectGoogleDrive(): Promise<void> {
  const token = getStoredAccessToken();
  if (token && typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
    try {
      window.google.accounts.oauth2.revoke(token);
    } catch {
      // Ignore revoke error
    }
  }
  clearStoredAccessToken();
  const settings = await ensureAppSettings();
  await db.settings.put({
    ...settings,
    googleDriveEmail: undefined,
    googleDriveFileId: undefined,
  });
}

export function formatRelativeSyncTime(isoString?: string): string {
  if (!isoString) return 'Belum pernah sinkron';
  const diffSec = Math.max(0, Math.floor((Date.now() - Date.parse(isoString)) / 1000));
  if (diffSec < 45) return 'Baru saja';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} mnt lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay} hari lalu`;
}
