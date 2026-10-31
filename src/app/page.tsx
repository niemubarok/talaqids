'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useLiveQuery } from 'dexie-react-hooks';
import { BookOpen, ChevronDown, HeartHandshake, LayoutDashboard, Lock, Menu, RefreshCw, Sparkles } from 'lucide-react';
import {
  db,
  DEFAULT_APP_SETTINGS,
  ensureAppSettings,
  getTodayDateStr,
  notifyLocalDataMutated,
} from '@/lib/db';
import {
  disconnectGoogleDrive,
  formatRelativeSyncTime,
  getConfiguredGoogleClientId,
  getStoredAccessToken,
  syncWithGoogleDrive,
} from '@/lib/google-drive-sync';
import { calculateCycleStatus } from '@/lib/cycle-math';
import { useAudioPlayer, useAudioSessionConfig } from '@/hooks/useAudioPlayer';
import { OnboardingModal } from '@/components/OnboardingModal';
import { DashboardAudioView } from '@/components/DashboardAudioView';
import { MushafManualView } from '@/components/MushafManualView';
import { InsightsView } from '@/components/InsightsView';
import { NowPlayingBar } from '@/components/NowPlayingBar';
import { NowPlayingSheet } from '@/components/NowPlayingSheet';
import { PwaInstallBanner } from '@/components/PwaInstallBanner';
import { PwaUpdatePrompt } from '@/components/PwaUpdatePrompt';
import { GoogleDriveIcon } from '@/components/GoogleDriveIcon';
import { OnboardingGuide } from '@/components/OnboardingGuide';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { ManageChildrenModal } from '@/components/ManageChildrenModal';
import { RecitersModal } from '@/components/RecitersModal';
import { InfaqModal } from '@/components/InfaqModal';
import { GoogleDriveSyncModal } from '@/components/GoogleDriveSyncModal';
import { AboutModal } from '@/components/AboutModal';

type ActiveTab = 'audio' | 'mushaf' | 'insights';

const NAV_ITEMS: { id: ActiveTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'audio', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'mushaf', label: 'Mushaf', icon: BookOpen },
  { id: 'insights', label: 'Insights', icon: Sparkles },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('audio');
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showManageChildrenModal, setShowManageChildrenModal] = useState(false);
  const [showRecitersModal, setShowRecitersModal] = useState(false);
  const [showInfaqModal, setShowInfaqModal] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [, setRelativeTimeTick] = useState(0);
  const syncingRef = useRef(false);
  const lastSyncFinishedAtRef = useRef(0);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const configureSession = useAudioSessionConfig();
  const { clearPreviousJuzCaches } = useAudioPlayer();

  // Register PWA Service Worker
  useEffect(() => {
    void ensureAppSettings();
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Ignore SW registration error in dev
      });
    }
  }, []);

  const childrenList = useLiveQuery(() => db.children.toArray(), []);
  const settings = useLiveQuery(() => db.settings.get('app_config'), []) || DEFAULT_APP_SETTINGS;

  const activeChild = useMemo(() => {
    if (!childrenList || childrenList.length === 0) return null;
    if (settings.activeChildId) {
      const found = childrenList.find((c) => c.id === settings.activeChildId);
      if (found) return found;
    }
    return childrenList[0];
  }, [childrenList, settings.activeChildId]);

  const todayStr = getTodayDateStr();

  const progressToday = useLiveQuery(
    async () => {
      if (!activeChild) return undefined;
      return db.progress
        .where('[childId+date]')
        .equals([activeChild.id, todayStr])
        .first();
    },
    [activeChild?.id, todayStr]
  );

  const allChildProgress = useLiveQuery(
    async () => {
      if (!activeChild) return [];
      return db.progress.where('childId').equals(activeChild.id).toArray();
    },
    [activeChild?.id]
  ) || [];

  const cycle = useMemo(() => {
    if (!activeChild) return null;
    return calculateCycleStatus(
      activeChild.startDate,
      activeChild.manualJuzOverride
    );
  }, [activeChild]);

  // Keep singleton audio engine synced with active child & active Juz
  useEffect(() => {
    if (!activeChild || !cycle) return;
    configureSession({
      juz: cycle.currentJuz,
      reciterId: activeChild.preferredReciterId || 'al_husary',
      childId: activeChild.id,
      cycleMonth: cycle.currentMonth,
      lastPlayback: activeChild.lastPlayback,
    });
  }, [
    activeChild,
    cycle,
    configureSession,
  ]);

  const handleOverrideJuz = async (newJuz: number | null) => {
    if (!activeChild) return;
    await db.children.update(activeChild.id, {
      manualJuzOverride: newJuz,
      updatedAt: new Date().toISOString(),
    });
    notifyLocalDataMutated();
  };

  const handleSelectChild = async (childId: string) => {
    await db.settings.put({
      ...settings,
      activeChildId: childId,
    });
    notifyLocalDataMutated();
  };

  const handleSelectReciter = async (reciterId: string, isProReciter: boolean) => {
    if (isProReciter && !settings.isProUser) {
      setShowInfaqModal(true);
      return;
    }
    if (!activeChild) return;
    await db.children.update(activeChild.id, {
      preferredReciterId: reciterId,
      updatedAt: new Date().toISOString(),
    });
    notifyLocalDataMutated();
  };

  const handleCleanOldCache = async () => {
    const count = await clearPreviousJuzCaches();
    if ('caches' in window) {
      try {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((name) => caches.delete(name)));
      } catch {
        // Ignore cache deletion error
      }
    }
    alert(
      count > 0
        ? `${count} cache audio Juz dan cache aplikasi berhasil dibersihkan.`
        : 'Penyimpanan & cache aplikasi telah dibersihkan dan diperbarui.'
    );
    window.location.reload();
  };

  // Launch onboarding guide for first-time user
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (activeChild && !localStorage.getItem('talaqids_tour_seen')) {
      const timer = setTimeout(() => {
        setIsGuideOpen(true);
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [activeChild]);

  const handleCloseGuide = () => {
    setIsGuideOpen(false);
    try {
      localStorage.setItem('talaqids_tour_seen', 'true');
    } catch {
      // ignore storage error
    }
  };

  const triggerCloudSync = useCallback(async (interactive: boolean) => {
    if (!settings.isProUser) {
      if (interactive) {
        setShowInfaqModal(true);
      }
      return;
    }
    if (syncingRef.current) return;
    syncingRef.current = true;
    setIsSyncingCloud(true);
    if (interactive) {
      setCloudError(null);
    }
    try {
      await syncWithGoogleDrive({ interactive });
      setCloudError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal sinkronisasi Google Drive';
      if (interactive && msg !== 'TOKEN_EXPIRED_SILENT') {
        setCloudError(msg);
      }
    } finally {
      lastSyncFinishedAtRef.current = Date.now();
      syncingRef.current = false;
      setIsSyncingCloud(false);
    }
  }, [settings.isProUser]);

  // Refresh "Terakhir sinkron: X menit lalu" label every 30s
  useEffect(() => {
    const timer = window.setInterval(() => {
      setRelativeTimeTick((t) => t + 1);
    }, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  // Auto-sync triggers:
  // 1. On app open + window focus / visibilitychange
  // 2. Background polling every 5 minutes while active
  // 3. Debounced push after local IndexedDB mutations
  useEffect(() => {
    const canSilentSync = () =>
      Boolean(settings.isProUser && getConfiguredGoogleClientId() && getStoredAccessToken());

    if (canSilentSync()) {
      void triggerCloudSync(false);
    }

    const handleVisibilityOrFocus = () => {
      if (Date.now() - lastSyncFinishedAtRef.current < 15_000) return;
      if (document.visibilityState === 'visible' && canSilentSync()) {
        void triggerCloudSync(false);
      }
    };

    let debounceTimer: number | null = null;
    const handleLocalMutated = () => {
      if (!canSilentSync()) return;
      if (debounceTimer) window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(() => {
        void triggerCloudSync(false);
      }, 2500);
    };

    const pollInterval = window.setInterval(() => {
      if (document.visibilityState === 'visible' && canSilentSync()) {
        void triggerCloudSync(false);
      }
    }, 5 * 60 * 1000);

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('talaqids:local-mutated', handleLocalMutated);

    return () => {
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('talaqids:local-mutated', handleLocalMutated);
      window.clearInterval(pollInterval);
      if (debounceTimer) window.clearTimeout(debounceTimer);
    };
  }, [settings.isProUser, triggerCloudSync]);

  const isLoadingInitial = childrenList === undefined;

  if (isLoadingInitial) {
    return (
      <div className="app-canvas flex min-h-dvh flex-col items-center justify-center gap-5">
        <div className="relative">
          <span className="breathe absolute inset-0 -z-10 rounded-full bg-[#C89B4E]/30 blur-2xl" />
          <Image
            src="/icons/icon-192.png"
            alt="talaQids"
            width={192}
            height={192}
            priority
            className="h-16 w-16"
          />
        </div>
        <div className="text-center">
          <p dir="rtl" className="font-arabic text-xl text-[#1E4C40]">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <p className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.32em] text-[#8A968F]">
            Menyiapkan siklus
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-canvas relative flex min-h-dvh flex-col">
      <div className="app-grain pointer-events-none fixed inset-0 z-0" aria-hidden />

      {/* PWA Update Notification */}
      <PwaUpdatePrompt />

      {/* Top App Bar */}
      <header className="sticky top-0 z-30 w-full border-b border-[#1E4C40]/8 bg-[#F6F0E4]/80 backdrop-blur-xl">
        <div
          className={`mx-auto flex w-full items-center justify-between gap-3 px-4 py-3 transition-all duration-300 ${
            activeTab === 'mushaf' ? 'max-w-4xl' : 'max-w-lg'
          }`}
        >
          <Image
            src="/logo-wordmark.png"
            alt="talaQids"
            width={816}
            height={207}
            priority
            className="h-7 w-auto min-w-0 shrink"
          />

          {activeChild && (
            <div
              data-guide="header-actions"
              className="flex min-w-0 items-center gap-1 sm:gap-1.5"
            >
              <button
                type="button"
                onClick={() => {
                  if (!settings.isProUser) {
                    setShowInfaqModal(true);
                  } else {
                    void triggerCloudSync(true);
                  }
                }}
                disabled={isSyncingCloud}
                title={
                  !settings.isProUser
                    ? 'Sinkronisasi Google Drive (Fitur Muhsinin)'
                    : settings.googleDriveLastSyncedAt
                      ? `Terakhir sinkron: ${formatRelativeSyncTime(settings.googleDriveLastSyncedAt)}`
                      : 'Sinkronkan ke Google Drive'
                }
                aria-label="Sinkronisasi Google Drive"
                className="relative flex h-9 w-9 shrink-0 items-center justify-center text-[#1E4C40] transition hover:text-[#C89B4E] active:scale-90 disabled:opacity-60"
              >
                <GoogleDriveIcon className="h-[21px] w-[21px] shrink-0" />
                {!settings.isProUser ? (
                  <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#C89B4E] text-[#15231E] shadow-xs ring-1.5 ring-[#F6F0E4]">
                    <Lock className="h-2 w-2 stroke-[2.8]" />
                  </span>
                ) : isSyncingCloud ? (
                  <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#1E4C40] text-[#F3E7CB] shadow-xs ring-1.5 ring-[#F6F0E4]">
                    <RefreshCw className="h-2 w-2 animate-spin stroke-[2.8]" />
                  </span>
                ) : settings.googleDriveLastSyncedAt ? (
                  <span className="absolute bottom-0.5 right-0.5 h-2 w-2 rounded-full bg-[#2F6B5B] ring-1.5 ring-[#F6F0E4]" />
                ) : null}
              </button>

              <button
                type="button"
                onClick={() => setShowInfaqModal(true)}
                title={
                  settings.isProUser
                    ? 'Status Muhsinin Aktif • Barakallahu fiikum'
                    : 'Infaq & Dukung talaQids'
                }
                aria-label="Infaq & Muhsinin"
                className={`relative flex h-9 w-9 shrink-0 items-center justify-center transition active:scale-90 ${
                  settings.isProUser
                    ? 'text-[#C89B4E] hover:text-[#8A6220]'
                    : 'text-[#1E4C40] hover:text-[#C89B4E]'
                }`}
              >
                <HeartHandshake className="h-[22px] w-[22px] shrink-0 stroke-[2.2]" />
                {settings.isProUser && (
                  <span className="absolute bottom-0.5 right-0.5 h-2 w-2 rounded-full bg-[#C89B4E] ring-1.5 ring-[#F6F0E4]" />
                )}
              </button>

              <div className="relative">
                <button
                  ref={menuButtonRef}
                  type="button"
                  onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                  aria-expanded={isProfileDropdownOpen}
                  aria-haspopup="menu"
                  title="Menu Aplikasi"
                  aria-label="Menu Aplikasi"
                  className={`relative flex h-9 w-9 shrink-0 items-center justify-center transition active:scale-90 ${
                    isProfileDropdownOpen
                      ? 'text-[#C89B4E]'
                      : 'text-[#1E4C40] hover:text-[#C89B4E]'
                  }`}
                >
                  <Menu className="h-[22px] w-[22px] shrink-0 stroke-[2.2]" />
                </button>

                <ProfileDropdown
                  isOpen={isProfileDropdownOpen}
                  onClose={() => setIsProfileDropdownOpen(false)}
                  triggerRef={menuButtonRef}
                  activeChild={activeChild}
                  childrenList={childrenList ?? []}
                  isProUser={settings.isProUser}
                  onSelectChild={(id) => void handleSelectChild(id)}
                  onOpenManageChildren={() => setShowManageChildrenModal(true)}
                  onOpenReciters={() => setShowRecitersModal(true)}
                  onOpenInfaq={() => setShowInfaqModal(true)}
                  onOpenGoogleDrive={() => setShowDriveModal(true)}
                  onOpenGuide={() => setIsGuideOpen(true)}
                  onOpenAbout={() => setShowAboutModal(true)}
                  onClearCache={() => void handleCleanOldCache()}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Container (Fluid full-width for Mushaf view, compact for other tabs) */}
      <main
        className={`relative z-10 mx-auto w-full flex-1 pb-36 pt-3 transition-all duration-300 ${
          activeTab === 'mushaf'
            ? 'max-w-4xl px-2 sm:px-4 md:px-6'
            : 'max-w-lg px-4'
        }`}
      >
        <PwaInstallBanner />
        {activeChild && cycle && (
          <>
            {activeTab === 'audio' && (
              <DashboardAudioView
                child={activeChild}
                cycle={cycle}
                progressToday={progressToday}
                allProgress={allChildProgress}
                isPro={settings.isProUser}
                onOpenMushaf={() => setActiveTab('mushaf')}
                onOverrideJuz={(j) => void handleOverrideJuz(j)}
                onOpenInfaq={() => setShowInfaqModal(true)}
                onOpenPlayer={() => setIsPlayerOpen(true)}
              />
            )}

            {activeTab === 'mushaf' && (
              <MushafManualView
                child={activeChild}
                activeJuz={cycle.currentJuz}
                progressToday={progressToday}
                allProgress={allChildProgress}
                isPro={settings.isProUser}
              />
            )}

            {activeTab === 'insights' && (
              <InsightsView
                child={activeChild}
                cycle={cycle}
                onOpenMushaf={() => setActiveTab('mushaf')}
                onOpenAudio={() => setActiveTab('audio')}
              />
            )}
          </>
        )}
      </main>

      {(!activeChild || !cycle) && <OnboardingModal onCompleted={() => {}} />}

      {showAddChildModal && (
        <OnboardingModal
          isAdditionalChild
          onCompleted={() => setShowAddChildModal(false)}
          onCancel={() => setShowAddChildModal(false)}
        />
      )}

      {/* Unified Floating Dock: mini player + bottom navigation in one cohesive capsule */}
      {activeChild && (
        <div
          className={`pointer-events-none fixed inset-x-0 bottom-0 z-40 mx-auto w-full px-3 pb-[max(0.65rem,env(safe-area-inset-bottom))] transition-all duration-300 ease-out ${
            activeTab === 'mushaf' ? 'max-w-xl' : 'max-w-lg'
          } ${
            isPlayerOpen ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
          }`}
          aria-hidden={isPlayerOpen}
        >
          <div
            data-guide="now-playing-dock"
            className="pointer-events-auto overflow-hidden rounded-[22px] border border-white/85 bg-gradient-to-b from-[#FFFCF5]/80 via-[#FFFCF5]/60 to-[#F6F0E4]/15 shadow-[0_20px_45px_-18px_rgba(16,46,39,0.35),inset_0_1.5px_1px_rgba(255,255,255,0.95)] backdrop-blur-2xl backdrop-saturate-150"
          >
            <NowPlayingBar isPro={settings.isProUser} onExpand={() => setIsPlayerOpen(true)} />

            <nav
              data-guide="nav-tabs"
              aria-label="Navigasi utama"
              className="border-t border-[#1E4C40]/6 px-1.5 py-1"
            >
              <div className="grid grid-cols-3 gap-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTab(item.id)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex h-[34px] items-center justify-center gap-1.5 rounded-full transition-all duration-200 active:scale-95 ${
                        isActive
                          ? 'bg-[#1E4C40] text-[#F3E7CB] shadow-[0_4px_12px_-4px_rgba(16,46,39,0.6)] font-bold'
                          : 'text-[#6B7A72] hover:text-[#1E4C40] hover:bg-[#1E4C40]/5 font-medium'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="text-[10px] tracking-tight">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>
      )}

      <NowPlayingSheet
        open={isPlayerOpen}
        isPro={settings.isProUser}
        onClose={() => setIsPlayerOpen(false)}
        onOpenMushaf={() => setActiveTab('mushaf')}
        onOpenInfaq={() => setShowInfaqModal(true)}
      />

      {/* Profile Modals */}
      {activeChild && (
        <>
          <ManageChildrenModal
            isOpen={showManageChildrenModal}
            onClose={() => setShowManageChildrenModal(false)}
            childrenList={childrenList ?? []}
            activeChild={activeChild}
            onSelectChild={(id) => void handleSelectChild(id)}
            onAddChildClick={() => setShowAddChildModal(true)}
          />

          <RecitersModal
            isOpen={showRecitersModal}
            onClose={() => setShowRecitersModal(false)}
            activeReciterId={activeChild.preferredReciterId || 'husary'}
            isProUser={settings.isProUser}
            onSelectReciter={(id, isPro) => void handleSelectReciter(id, isPro)}
            onUnlockRequest={() => setShowInfaqModal(true)}
          />

          <InfaqModal
            isOpen={showInfaqModal}
            onClose={() => setShowInfaqModal(false)}
            isProUser={settings.isProUser}
            activeChildName={activeChild.name}
          />

          <GoogleDriveSyncModal
            isOpen={showDriveModal}
            onClose={() => setShowDriveModal(false)}
            isProUser={settings.isProUser}
            isSyncing={isSyncingCloud}
            lastSyncedAt={settings.googleDriveLastSyncedAt}
            error={cloudError}
            onManualSync={() => triggerCloudSync(true)}
            onDisconnect={async () => {
              await disconnectGoogleDrive();
              notifyLocalDataMutated();
            }}
            onUnlockRequest={() => setShowInfaqModal(true)}
          />

          <OnboardingGuide
            isOpen={isGuideOpen}
            onClose={handleCloseGuide}
            currentTab={activeTab}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />

          <AboutModal
            isOpen={showAboutModal}
            onClose={() => setShowAboutModal(false)}
            onOpenInfaq={() => setShowInfaqModal(true)}
          />
        </>
      )}
    </div>
  );
}
