'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useLiveQuery } from 'dexie-react-hooks';
import { BookOpen, ChevronDown, Cloud, LayoutDashboard, Lock, RefreshCw, Sparkles } from 'lucide-react';
import {
  db,
  DEFAULT_APP_SETTINGS,
  ensureAppSettings,
  getTodayDateStr,
  notifyLocalDataMutated,
} from '@/lib/db';
import {
  formatRelativeSyncTime,
  getConfiguredGoogleClientId,
  getStoredAccessToken,
  syncWithGoogleDrive,
} from '@/lib/google-drive-sync';
import { calculateCycleStatus } from '@/lib/cycle-math';
import { useAudioSessionConfig } from '@/hooks/useAudioPlayer';
import { OnboardingModal } from '@/components/OnboardingModal';
import { DashboardAudioView } from '@/components/DashboardAudioView';
import { MushafManualView } from '@/components/MushafManualView';
import { InsightsView } from '@/components/InsightsView';
import { InfaqSettingsView } from '@/components/InfaqSettingsView';
import { NowPlayingBar } from '@/components/NowPlayingBar';
import { NowPlayingSheet } from '@/components/NowPlayingSheet';
import { PwaInstallBanner } from '@/components/PwaInstallBanner';

type ActiveTab = 'audio' | 'mushaf' | 'insights' | 'infaq';

const NAV_ITEMS: { id: Exclude<ActiveTab, 'infaq'>; label: string; icon: typeof LayoutDashboard }[] = [
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
  const [, setRelativeTimeTick] = useState(0);
  const syncingRef = useRef(false);
  const lastSyncFinishedAtRef = useRef(0);
  const configureSession = useAudioSessionConfig();

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

  const triggerCloudSync = useCallback(async (interactive: boolean) => {
    if (!settings.isProUser) {
      if (interactive) {
        setActiveTab('infaq');
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

      {/* Top App Bar */}
      <header className="sticky top-0 z-30 w-full border-b border-[#1E4C40]/8 bg-[#F6F0E4]/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-lg items-center justify-between gap-3 px-4 py-3">
          <Image
            src="/logo-wordmark.png"
            alt="talaQids"
            width={816}
            height={207}
            priority
            className="h-7 w-auto min-w-0 shrink"
          />

          {activeChild && (
            <div className="flex min-w-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => void triggerCloudSync(true)}
                disabled={isSyncingCloud}
                title={
                  !settings.isProUser
                    ? 'Fitur sinkronisasi khusus Tier Muhsinin — klik untuk membuka'
                    : settings.googleDriveLastSyncedAt
                      ? `Terakhir sinkron: ${formatRelativeSyncTime(settings.googleDriveLastSyncedAt)}`
                      : 'Sinkronkan ke Google Drive (HP Ayah & Ibu)'
                }
                className={`flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-left shadow-[0_10px_24px_-18px_rgba(16,46,39,0.8)] transition active:scale-[0.99] disabled:opacity-65 ${
                  settings.isProUser
                    ? 'border-[#1E4C40]/10 bg-[#FFFCF5]/90 hover:border-[#2F6B5B]/40'
                    : 'border-[#C89B4E]/30 bg-[#FBF6EC]/80 opacity-80 hover:border-[#C89B4E]/50'
                }`}
              >
                {!settings.isProUser ? (
                  <Lock className="h-3.5 w-3.5 shrink-0 text-[#9C7330]" />
                ) : isSyncingCloud ? (
                  <RefreshCw className="h-3.5 w-3.5 shrink-0 animate-spin text-[#1E4C40]" />
                ) : (
                  <Cloud
                    className={`h-3.5 w-3.5 shrink-0 ${
                      settings.googleDriveLastSyncedAt ? 'text-[#2F6B5B]' : 'text-[#8A968F]'
                    }`}
                  />
                )}
                <div className="leading-tight">
                  <p className="text-[9.5px] font-extrabold text-[#15231E]">Sinkronkan</p>
                  <p
                    className={`text-[8px] font-semibold ${
                      !settings.isProUser ? 'font-extrabold text-[#9C7330]' : 'text-[#6B7A72]'
                    }`}
                  >
                    {!settings.isProUser
                      ? 'Muhsinin'
                      : isSyncingCloud
                        ? 'Menyinkronkan...'
                        : settings.googleDriveLastSyncedAt
                          ? formatRelativeSyncTime(settings.googleDriveLastSyncedAt)
                          : 'Google Drive'}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('infaq')}
                aria-current={activeTab === 'infaq' ? 'page' : undefined}
                className={`flex min-h-[38px] min-w-0 items-center gap-2 rounded-full border py-1 pl-1 pr-2.5 text-left shadow-[0_10px_24px_-18px_rgba(16,46,39,0.8)] transition active:scale-[0.99] ${
                  activeTab === 'infaq'
                    ? 'border-[#C89B4E] bg-[#1E4C40] text-[#F3E7CB]'
                    : 'border-[#1E4C40]/10 bg-[#FFFCF5]/90 hover:border-[#C89B4E]/40'
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold ${
                    activeTab === 'infaq'
                      ? 'bg-[#C89B4E] text-[#15231E]'
                      : 'bg-[#1E4C40] text-[#F3E7CB]'
                  }`}
                >
                  {activeChild.name.charAt(0).toUpperCase()}
                </span>
                <span
                  className={`max-w-[78px] truncate text-[11px] font-extrabold ${
                    activeTab === 'infaq' ? 'text-[#F3E7CB]' : 'text-[#15231E]'
                  }`}
                >
                  {activeChild.name}
                </span>
                {settings.isProUser ? (
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#C89B4E]" />
                ) : (
                  <ChevronDown
                    className={`h-3.5 w-3.5 shrink-0 ${
                      activeTab === 'infaq' ? 'text-[#EAD8AF]' : 'text-[#8A968F]'
                    }`}
                  />
                )}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Container (Mobile-First Fluid Max-Width) */}
      <main className="relative z-10 mx-auto w-full max-w-lg flex-1 px-4 pb-36 pt-3">
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
                onOpenInfaq={() => setActiveTab('infaq')}
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

            {activeTab === 'infaq' && (
              <InfaqSettingsView
                settings={settings}
                childrenList={childrenList}
                activeChild={activeChild}
                onSelectChild={(id) => void handleSelectChild(id)}
                onAddChildClick={() => setShowAddChildModal(true)}
                isSyncingCloud={isSyncingCloud}
                cloudError={cloudError}
                onManualSyncCloud={() => triggerCloudSync(true)}
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
          className={`pointer-events-none fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-lg px-3 pb-[max(0.65rem,env(safe-area-inset-bottom))] transition-all duration-300 ease-out ${
            isPlayerOpen ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
          }`}
          aria-hidden={isPlayerOpen}
        >
          <div className="pointer-events-auto overflow-hidden rounded-[22px] border border-white/85 bg-gradient-to-b from-[#FFFCF5]/80 via-[#FFFCF5]/60 to-[#F6F0E4]/15 shadow-[0_20px_45px_-18px_rgba(16,46,39,0.35),inset_0_1.5px_1px_rgba(255,255,255,0.95)] backdrop-blur-2xl backdrop-saturate-150">
            <NowPlayingBar isPro={settings.isProUser} onExpand={() => setIsPlayerOpen(true)} />

            <nav
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
        onOpenInfaq={() => setActiveTab('infaq')}
      />
    </div>
  );
}
