export interface ChildPlaybackCheckpoint {
  juzNumber: number;
  surahNumber: number;
  ayahNumber: number;
  trackIndex: number;
  currentTime: number;
  updatedAt: string; // ISO string
}

import Dexie, { type Table } from 'dexie';

export interface ChildProfile {
  id: string; // UUID v4
  name: string;
  birthDate: string; // YYYY-MM-DD
  startDate: string; // YYYY-MM-DD
  preferredReciterId: string; // Default: 'al_husary'
  isConsolidationMode: boolean; // default: false
  manualJuzOverride?: number | null; // Optional manual Juz override (1-30)
  customMaxVolume?: number; // default 0.6
  lastPlayback?: ChildPlaybackCheckpoint;
  createdAt: string;
  updatedAt: string;
}

export type ReaderRole = 'Ayah' | 'Ibu' | 'Bersama';

export interface DailyProgress {
  id?: number; // Auto-increment
  childId: string;
  date: string; // YYYY-MM-DD
  juzNumber: number;
  listenMinutes: number;
  pagesCompleted: number[]; // Array halaman mushaf yang dibaca manual (1-20)
  pageReaders?: Record<number, ReaderRole>; // Pemetaan halaman (1-20) -> pembaca manual
  readerRole?: ReaderRole;
  notes?: string;
  updatedAt?: string;
}

export interface AppSettings {
  key: string; // 'app_config'
  isProUser: boolean; // Status tier Muhsinin
  infaqActivatedAt?: string;
  infaqNominal?: number;
  maxVolumeCap: number; // Default: 0.6
  enableBackgroundWakeLock: boolean;
  activeChildId?: string;
  deletedChildIds?: string[];
  googleDriveEmail?: string;
  googleDriveLastSyncedAt?: string;
  googleDriveFileId?: string;
  preferredQuranSource?: string;
}

export function notifyLocalDataMutated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('talaqids:local-mutated'));
  }
}

export class TalaQidsDB extends Dexie {
  children!: Table<ChildProfile, string>;
  progress!: Table<DailyProgress, number>;
  settings!: Table<AppSettings, string>;

  constructor() {
    super('talaQidsDB');
    this.version(1).stores({
      children: 'id, birthDate, startDate',
      progress: '++id, [childId+date], childId, date, juzNumber',
      settings: 'key',
    });
  }
}

export const db = new TalaQidsDB();

export const DEFAULT_APP_SETTINGS: AppSettings = {
  key: 'app_config',
  isProUser: false,
  maxVolumeCap: 0.6,
  enableBackgroundWakeLock: true,
};

export function getTodayDateStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export async function ensureAppSettings(): Promise<AppSettings> {
  const existing = await db.settings.get('app_config');
  if (existing) return existing;
  await db.settings.put(DEFAULT_APP_SETTINGS);
  return DEFAULT_APP_SETTINGS;
}

export async function createChildProfile(input: {
  name: string;
  birthDate: string;
  startDate: string;
  preferredReciterId?: string;
}): Promise<ChildProfile> {
  const nowIso = new Date().toISOString();
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `child-${Date.now()}`;

  const profile: ChildProfile = {
    id,
    name: input.name.trim(),
    birthDate: input.birthDate,
    startDate: input.startDate || input.birthDate,
    preferredReciterId: input.preferredReciterId || 'al_husary',
    isConsolidationMode: false,
    manualJuzOverride: null,
    customMaxVolume: 0.6,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  await db.transaction('rw', db.children, db.settings, async () => {
    await db.children.put(profile);
    const settings = (await db.settings.get('app_config')) || DEFAULT_APP_SETTINGS;
    await db.settings.put({
      ...settings,
      activeChildId: profile.id,
    });
  });

  notifyLocalDataMutated();
  return profile;
}

export async function updateChildProfile(
  childId: string,
  input: {
    name: string;
    birthDate: string;
    startDate?: string;
    preferredReciterId?: string;
    manualJuzOverride?: number | null;
  }
): Promise<ChildProfile | null> {
  const existing = await db.children.get(childId);
  if (!existing) return null;

  const nowIso = new Date().toISOString();
  const updated: ChildProfile = {
    ...existing,
    name: input.name.trim(),
    birthDate: input.birthDate,
    startDate: input.startDate || existing.startDate,
    preferredReciterId: input.preferredReciterId || existing.preferredReciterId,
    manualJuzOverride:
      input.manualJuzOverride !== undefined
        ? input.manualJuzOverride
        : existing.manualJuzOverride,
    updatedAt: nowIso,
  };

  await db.children.put(updated);
  notifyLocalDataMutated();
  return updated;
}

export async function deleteChildProfile(childId: string): Promise<boolean> {
  return await db.transaction('rw', db.children, db.progress, db.settings, async () => {
    const existing = await db.children.get(childId);
    if (!existing) return false;

    // Delete child profile
    await db.children.delete(childId);

    // Delete related progress data
    await db.progress.where('childId').equals(childId).delete();

    // Reassign activeChildId if the deleted child was currently active
    const settings = (await db.settings.get('app_config')) || DEFAULT_APP_SETTINGS;
    if (settings.activeChildId === childId) {
      const remainingChildren = await db.children.toArray();
      await db.settings.put({
        ...settings,
        activeChildId: remainingChildren[0]?.id || undefined,
      });
    }

    notifyLocalDataMutated();
    return true;
  });
}

export async function togglePageCompleted(params: {
  childId: string;
  juzNumber: number;
  relativePage: number; // 1-20 within Juz
  readerRole: ReaderRole;
  notes?: string;
}): Promise<DailyProgress> {
  const date = getTodayDateStr();
  const nowIso = new Date().toISOString();
  const result = await db.transaction('rw', db.progress, async () => {
    const existing = await db.progress
      .where('[childId+date]')
      .equals([params.childId, date])
      .first();

    if (!existing) {
      const entry: DailyProgress = {
        childId: params.childId,
        date,
        juzNumber: params.juzNumber,
        listenMinutes: 0,
        pagesCompleted: [params.relativePage],
        pageReaders: { [params.relativePage]: params.readerRole },
        readerRole: params.readerRole,
        notes: params.notes,
        updatedAt: nowIso,
      };
      const id = await db.progress.add(entry);
      return { ...entry, id };
    }

    const pagesSet = new Set(existing.pagesCompleted);
    const pageReaders: Record<number, ReaderRole> = { ...(existing.pageReaders || {}) };
    const existingManualRole = pageReaders[params.relativePage];

    if (existingManualRole) {
      if (existingManualRole === params.readerRole) {
        // Clicking again with same role unmarks manual completion
        delete pageReaders[params.relativePage];
        pagesSet.delete(params.relativePage);
      } else {
        // Switching role updates the reader for this page
        pageReaders[params.relativePage] = params.readerRole;
        pagesSet.add(params.relativePage);
      }
    } else {
      // Page was either not completed or only completed via audio -> record manual parent reader!
      pagesSet.add(params.relativePage);
      pageReaders[params.relativePage] = params.readerRole;
    }

    const updatedPages = Array.from(pagesSet).sort((a, b) => a - b);
    const updated: DailyProgress = {
      ...existing,
      juzNumber: params.juzNumber,
      pagesCompleted: updatedPages,
      pageReaders,
      readerRole: params.readerRole,
      notes: params.notes ?? existing.notes,
      updatedAt: nowIso,
    };

    await db.progress.put(updated);
    return updated;
  });
  notifyLocalDataMutated();
  return result;
}

/**
 * Automatically marks pages 1..maxRelativePage as completed in `pagesCompleted`
 * when audio playback has passed those pages, WITHOUT adding to `pageReaders`
 * so parent Talaqqi stats only count manual clicks.
 */
export async function markPagesCompletedByAudio(params: {
  childId: string;
  juzNumber: number;
  maxRelativePage: number;
}): Promise<void> {
  if (params.maxRelativePage < 1) return;
  const clampedMax = Math.min(20, params.maxRelativePage);
  const date = getTodayDateStr();
  const nowIso = new Date().toISOString();
  let changed = false;

  await db.transaction('rw', db.progress, async () => {
    const existing = await db.progress
      .where('[childId+date]')
      .equals([params.childId, date])
      .first();

    const pagesToEnsure = Array.from({ length: clampedMax }, (_, i) => i + 1);

    if (!existing) {
      await db.progress.add({
        childId: params.childId,
        date,
        juzNumber: params.juzNumber,
        listenMinutes: 0,
        pagesCompleted: pagesToEnsure,
        updatedAt: nowIso,
      });
      changed = true;
      return;
    }

    const merged = new Set([...existing.pagesCompleted, ...pagesToEnsure]);
    if (merged.size === existing.pagesCompleted.length) {
      return; // No change needed
    }

    const sortedPages = Array.from(merged).sort((a, b) => a - b);
    await db.progress.update(existing.id!, {
      juzNumber: params.juzNumber,
      pagesCompleted: sortedPages,
      updatedAt: nowIso,
    });
    changed = true;
  });

  if (changed) {
    notifyLocalDataMutated();
  }
}

export function computeParentRoleCounts(
  allProgress: DailyProgress[]
): Record<ReaderRole, number> {
  return allProgress.reduce(
    (acc, item) => {
      if (!item.pageReaders) return acc;
      for (const role of Object.values(item.pageReaders)) {
        if (role === 'Ayah') acc.Ayah += 1;
        else if (role === 'Ibu') acc.Ibu += 1;
        else if (role === 'Bersama') acc.Bersama += 1;
      }
      return acc;
    },
    { Ayah: 0, Ibu: 0, Bersama: 0 }
  );
}

export async function incrementListenMinutes(
  childId: string,
  juzNumber: number,
  minutesToAdd: number
): Promise<void> {
  const date = getTodayDateStr();
  const nowIso = new Date().toISOString();
  await db.transaction('rw', db.progress, async () => {
    const existing = await db.progress
      .where('[childId+date]')
      .equals([childId, date])
      .first();

    if (!existing) {
      await db.progress.add({
        childId,
        date,
        juzNumber,
        listenMinutes: Math.round(minutesToAdd * 10) / 10,
        pagesCompleted: [],
        updatedAt: nowIso,
      });
    } else {
      await db.progress.update(existing.id!, {
        juzNumber,
        listenMinutes: Math.round((existing.listenMinutes + minutesToAdd) * 10) / 10,
        updatedAt: nowIso,
      });
    }
  });
  notifyLocalDataMutated();
}

export async function activateMuhsininTier(nominal: number): Promise<void> {
  const settings = await ensureAppSettings();
  await db.settings.put({
    ...settings,
    isProUser: true,
    infaqActivatedAt: new Date().toISOString(),
    infaqNominal: nominal,
  });
  notifyLocalDataMutated();
}
