'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ArrowLeftRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Languages,
  Loader2,
  Sparkles,
  Users,
  Volume2,
} from 'lucide-react';
import { getJuzMeta, SURAHS } from '@/lib/quran-metadata';
import { fetchVersesByPage, QURAN_SOURCES, type QuranSourceEdition, type QuranVerseText } from '@/lib/quran-api';
import {
  computeParentRoleCounts,
  markPagesCompletedByAudio,
  togglePageCompleted,
  type ChildProfile,
  type DailyProgress,
} from '@/lib/db';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

interface MushafManualViewProps {
  child: ChildProfile;
  activeJuz: number;
  progressToday: DailyProgress | undefined;
  allProgress: DailyProgress[];
  isPro: boolean;
}

export function MushafManualView({
  child,
  activeJuz,
  progressToday,
  allProgress,
  isPro,
}: MushafManualViewProps) {
  const {
    state: audioState,
    playSpecificAyah,
  } = useAudioPlayer();

  const juzMeta = getJuzMeta(activeJuz);
  const totalPagesInJuz = juzMeta.endPage - juzMeta.startPage + 1;

  const isAudioInThisJuz = audioState.activeJuz === activeJuz;
  const currentAudioTrack = isAudioInThisJuz
    ? audioState.tracks[audioState.currentTrackIndex]
    : null;
  const audioRelativePage = currentAudioTrack?.relativePage || 1;

  const [relativePage, setRelativePage] = useState<number>(() => {
    if (isAudioInThisJuz && audioRelativePage >= 1 && audioRelativePage <= totalPagesInJuz) {
      return audioRelativePage;
    }
    return 1;
  });
  const [followAudio, setFollowAudio] = useState<boolean>(true);
  const [readerRole, setReaderRole] = useState<'Ayah' | 'Ibu' | 'Bersama'>(
    progressToday?.readerRole || 'Ibu'
  );
  const [verses, setVerses] = useState<QuranVerseText[]>([]);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const [quranSource, setQuranSource] = useState<QuranSourceEdition>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('talaqids_quran_source');
      if (saved && QURAN_SOURCES.some((s) => s.id === saved)) {
        return saved as QuranSourceEdition;
      }
    }
    return 'quran-uthmani';
  });
  const [isSourceMenuOpen, setIsSourceMenuOpen] = useState(false);
  const sourceSelectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutsideSource(event: MouseEvent) {
      if (sourceSelectorRef.current && !sourceSelectorRef.current.contains(event.target as Node)) {
        setIsSourceMenuOpen(false);
      }
    }
    if (isSourceMenuOpen) {
      document.addEventListener('mousedown', handleClickOutsideSource);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideSource);
    };
  }, [isSourceMenuOpen]);

  const handleChangeSource = (newSource: QuranSourceEdition) => {
    setQuranSource(newSource);
    setIsSourceMenuOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('talaqids_quran_source', newSource);
    }
  };


  const activeAyahRef = useRef<HTMLDivElement | null>(null);

    const currentSourceMeta = useMemo(() => {
    return QURAN_SOURCES.find((s) => s.id === quranSource) || QURAN_SOURCES[0];
  }, [quranSource]);

  const actualMushafPage = juzMeta.startPage + relativePage - 1;
  const isCurrentPageDone = progressToday?.pagesCompleted.includes(relativePage) ?? false;
  const manualReaderForPage = progressToday?.pageReaders?.[relativePage];

  // Automatically follow audio player's page when followAudio is enabled
  useEffect(() => {
    if (followAudio && isAudioInThisJuz && audioRelativePage >= 1 && audioRelativePage <= totalPagesInJuz) {
      setRelativePage(audioRelativePage);
    }
  }, [followAudio, isAudioInThisJuz, audioRelativePage, totalPagesInJuz]);

  // Fetch verses for current page
  useEffect(() => {
    let cancelled = false;
    setIsLoadingPage(true);
    fetchVersesByPage(actualMushafPage, quranSource)
      .then((res) => {
        if (!cancelled) {
          setVerses(res);
          setIsLoadingPage(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoadingPage(false);
      });
    return () => {
      cancelled = true;
    };
  }, [actualMushafPage, quranSource]);

  // Auto-scroll active verse into view smoothly when it changes or after page load
  useEffect(() => {
    if (!isLoadingPage && activeAyahRef.current) {
      activeAyahRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentAudioTrack?.surahNumber, currentAudioTrack?.ayahNumber, isLoadingPage]);

  // Exact verse-level check: if audio has already passed the last verse on this Mushaf page, mark page progress completed!
  useEffect(() => {
    if (!currentAudioTrack || verses.length === 0) return;
    const lastVerse = verses[verses.length - 1];
    if (!lastVerse) return;

    const hasAudioPassedThisPage =
      currentAudioTrack.surahNumber > lastVerse.surah ||
      (currentAudioTrack.surahNumber === lastVerse.surah &&
        currentAudioTrack.ayahNumber > lastVerse.ayah) ||
      currentAudioTrack.relativePage > relativePage;

    if (hasAudioPassedThisPage && !isCurrentPageDone) {
      void markPagesCompletedByAudio({
        childId: child.id,
        juzNumber: activeJuz,
        maxRelativePage: relativePage,
      });
    }
  }, [
    currentAudioTrack,
    verses,
    relativePage,
    isCurrentPageDone,
    child.id,
    activeJuz,
  ]);

  const pageSelectorRef = useRef<HTMLDivElement>(null);

  // Close page selector popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pageSelectorRef.current && !pageSelectorRef.current.contains(event.target as Node)) {
        setIsNavExpanded(false);
      }
    }
    if (isNavExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNavExpanded]);

  const handlePlayAyah = (surah: number, ayah: number) => {
    setFollowAudio(true);
    void playSpecificAyah(surah, ayah);
  };

  const handleToggleComplete = async () => {
    await togglePageCompleted({
      childId: child.id,
      juzNumber: activeJuz,
      relativePage,
      readerRole,
    });
  };

  const handleCycleReaderRole = (event: React.MouseEvent) => {
    event.stopPropagation();
    const order: ('Ibu' | 'Ayah' | 'Bersama')[] = ['Ibu', 'Ayah', 'Bersama'];
    const nextIndex = (order.indexOf(readerRole) + 1) % order.length;
    setReaderRole(order[nextIndex]);
  };

  // Compute parent analytics strictly from manual completions
  const roleCounts = computeParentRoleCounts(allProgress);

  const completedPagesCount = progressToday?.pagesCompleted.length || 0;
  const progressPercent = Math.min(
    100,
    Math.round((completedPagesCount / totalPagesInJuz) * 100)
  );

  return (
    <div className="space-y-4">
      {/* ── Compact Minimal Top Bar (Ikon Peran, Halaman, Arti & Progress) ── */}
      <section className="rise relative z-20 rounded-2xl border border-[#1E4C40]/10 bg-gradient-to-b from-[#FFFDF9] to-[#FBF6EC] px-3 py-2 shadow-xs">
        <div className="flex items-center justify-between gap-1.5">
          {/* 1. Ikon Ayah (Man), Ibu (Woman), Bersama (Icon-only, compact) */}
          <div className="flex items-center gap-0.5 rounded-full border border-[#1E4C40]/8 bg-white/80 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setReaderRole('Ayah')}
              title="Dibacakan oleh Ayah"
              aria-label="Ayah"
              aria-pressed={readerRole === 'Ayah'}
              className={`flex h-7 w-7 items-center justify-center rounded-full transition-all active:scale-95 ${
                readerRole === 'Ayah'
                  ? 'bg-[#1E4C40] text-[#F3E7CB] shadow-xs'
                  : 'text-[#6B7A72] hover:bg-[#1E4C40]/8 hover:text-[#1E4C40]'
              }`}
            >
              {/* Man Icon */}
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="7" r="4" />
                <path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => setReaderRole('Ibu')}
              title="Dibacakan oleh Ibu"
              aria-label="Ibu"
              aria-pressed={readerRole === 'Ibu'}
              className={`flex h-7 w-7 items-center justify-center rounded-full transition-all active:scale-95 ${
                readerRole === 'Ibu'
                  ? 'bg-[#8A4B22] text-[#FFF4ED] shadow-xs'
                  : 'text-[#6B7A72] hover:bg-[#8A4B22]/10 hover:text-[#8A4B22]'
              }`}
            >
              {/* Woman Icon */}
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3a5 5 0 0 0-5 5v3a5 5 0 0 0 10 0V8a5 5 0 0 0-5-5z" />
                <path d="M6 21v-2a6 6 0 0 1 12 0v2" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => setReaderRole('Bersama')}
              title="Dibacakan Bersama"
              aria-label="Bersama"
              aria-pressed={readerRole === 'Bersama'}
              className={`flex h-7 w-7 items-center justify-center rounded-full transition-all active:scale-95 ${
                readerRole === 'Bersama'
                  ? 'bg-[#C89B4E] text-[#15231E] shadow-xs'
                  : 'text-[#6B7A72] hover:bg-[#C89B4E]/15 hover:text-[#8A6220]'
              }`}
            >
              <Users className="h-4 w-4 stroke-[2.2]" />
            </button>
          </div>

          {/* 2. Floating Dropdown Halaman, Quick Audio Jump & 3. Tombol Arti */}
          <div className="flex items-center gap-1.5">
            {isAudioInThisJuz && relativePage !== audioRelativePage && (
              <button
                type="button"
                onClick={() => {
                  setFollowAudio(true);
                  if (audioRelativePage >= 1 && audioRelativePage <= totalPagesInJuz) {
                    setRelativePage(audioRelativePage);
                  }
                }}
                title={`Lompat ke audio di Hal. ${audioRelativePage}`}
                className="inline-flex h-7 items-center gap-1 rounded-full border border-[#C89B4E]/40 bg-[#C89B4E]/20 px-2 text-[10px] font-extrabold text-[#8A6220] transition hover:bg-[#C89B4E]/30 active:scale-95"
              >
                <Headphones className="h-3 w-3" />
                <span>{audioRelativePage}</span>
              </button>
            )}

            {/* Halaman Button (Floating Popover Trigger) */}
            <div className="relative" ref={pageSelectorRef}>
              <button
                type="button"
                onClick={() => setIsNavExpanded((prev) => !prev)}
                aria-expanded={isNavExpanded}
                title="Pilih halaman (klik untuk membuka daftar)"
                className={`inline-flex h-7 shrink-0 items-center gap-1 rounded-full border px-2 text-[10px] font-extrabold whitespace-nowrap transition-all active:scale-95 ${
                  isNavExpanded
                    ? 'border-[#C89B4E] bg-[#C89B4E] text-[#15231E] shadow-xs'
                    : 'border-[#1E4C40]/12 bg-white text-[#15231E] hover:border-[#1E4C40]/30 shadow-2xs'
                }`}
              >
                <BookOpen className="h-3 w-3 shrink-0 text-[#C89B4E]" />
                <span className="whitespace-nowrap">Hal. {relativePage}/{totalPagesInJuz}</span>
                <ChevronDown
                  className={`h-2.5 w-2.5 shrink-0 text-[#6B7A72] transition-transform duration-200 ${
                    isNavExpanded ? 'rotate-180 text-inherit' : ''
                  }`}
                />
              </button>

              {/* Floating Dropdown / Popover (Absolute overlay, tidak menggeser halaman) */}
              {isNavExpanded && (
                <div className="absolute left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 top-full mt-2 w-72 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-[#1E4C40]/15 bg-[#FFFDF9] p-3 shadow-2xl backdrop-blur-sm z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="mb-2.5 flex items-center justify-between border-b border-[#1E4C40]/8 pb-2">
                    <button
                      type="button"
                      disabled={relativePage <= 1}
                      onClick={() => {
                        setFollowAudio(false);
                        setRelativePage((p) => Math.max(1, p - 1));
                      }}
                      className="flex items-center gap-1 rounded-full border border-[#1E4C40]/10 bg-white px-2 py-0.5 text-[10px] font-bold text-[#1E4C40] transition hover:bg-[#F4ECE1] disabled:opacity-30"
                    >
                      <ChevronLeft className="h-3 w-3" />
                      <span>Prev</span>
                    </button>

                    <div className="flex items-center gap-1 text-[10.5px] font-extrabold text-[#1E4C40]">
                      <BookOpen className="h-3.5 w-3.5 text-[#C89B4E]" />
                      <span>Pilih Halaman</span>
                    </div>

                    <button
                      type="button"
                      disabled={relativePage >= totalPagesInJuz}
                      onClick={() => {
                        setFollowAudio(false);
                        setRelativePage((p) => Math.min(totalPagesInJuz, p + 1));
                      }}
                      className="flex items-center gap-1 rounded-full border border-[#1E4C40]/10 bg-white px-2 py-0.5 text-[10px] font-bold text-[#1E4C40] transition hover:bg-[#F4ECE1] disabled:opacity-30"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-56 overflow-y-auto p-1">
                    {Array.from({ length: totalPagesInJuz }, (_, idx) => idx + 1).map((page) => {
                      const completed = progressToday?.pagesCompleted.includes(page);
                      const active = relativePage === page;
                      const isAudioHere = isAudioInThisJuz && audioRelativePage === page;
                      return (
                        <button
                          key={page}
                          type="button"
                          onClick={() => {
                            setFollowAudio(false);
                            setRelativePage(page);
                            setIsNavExpanded(false);
                          }}
                          className={`relative flex h-8 items-center justify-center rounded-xl text-[11px] font-extrabold transition-all active:scale-90 ${
                            active
                              ? 'bg-[#1E4C40] text-[#F3E7CB] shadow-xs border-2 border-[#C89B4E]'
                              : completed
                                ? 'border border-[#2F6B5B]/30 bg-[#2F6B5B]/15 text-[#1E4C40]'
                                : isAudioHere
                                  ? 'border border-[#C89B4E]/60 bg-[#C89B4E]/25 text-[#8A6220] ring-1 ring-[#C89B4E]'
                                  : 'border border-[#1E4C40]/8 bg-white text-[#6B7A72] hover:bg-[#F6F0E4] hover:text-[#1E4C40]'
                          }`}
                        >
                          {page}
                          {isAudioHere && (
                            <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-[#C89B4E] ring-1.5 ring-white" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            
            {/* Sumber Mushaf Selector (Floating Popover) */}
            <div className="relative" ref={sourceSelectorRef}>
              <button
                type="button"
                onClick={() => setIsSourceMenuOpen((prev) => !prev)}
                aria-expanded={isSourceMenuOpen}
                title={`Sumber: ${currentSourceMeta.name} (klik untuk ganti sumber)`}
                className={`inline-flex h-7 items-center gap-1 rounded-full border px-2 text-[10px] font-extrabold transition-all active:scale-95 ${
                  isSourceMenuOpen
                    ? 'border-[#C89B4E] bg-[#C89B4E] text-[#15231E] shadow-xs'
                    : 'border-[#1E4C40]/12 bg-white text-[#1E4C40] hover:border-[#1E4C40]/30 shadow-2xs'
                }`}
              >
                <span className="max-w-[85px] sm:max-w-none truncate">{currentSourceMeta.badge}</span>
                <ChevronDown
                  className={`h-3 w-3 text-[#6B7A72] transition-transform duration-200 ${
                    isSourceMenuOpen ? 'rotate-180 text-inherit' : ''
                  }`}
                />
              </button>

              {isSourceMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-[#1E4C40]/15 bg-[#FFFDF9] p-2.5 shadow-2xl backdrop-blur-sm z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="mb-2 flex items-center justify-between border-b border-[#1E4C40]/8 px-1 pb-2">
                    <span className="text-[10.5px] font-extrabold text-[#1E4C40]">
                      Pilihan Sumber Mushaf
                    </span>
                    <span className="text-[9px] text-[#8A968F]">{QURAN_SOURCES.length} Sumber</span>
                  </div>

                  <div className="space-y-1 max-h-64 overflow-y-auto pr-0.5">
                    {QURAN_SOURCES.map((s) => {
                      const isSelected = s.id === quranSource;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => handleChangeSource(s.id)}
                          className={`flex w-full items-start justify-between rounded-xl p-2 text-left transition ${
                            isSelected
                              ? 'bg-[#1E4C40] text-[#F3E7CB] shadow-xs'
                              : 'text-[#15231E] hover:bg-[#1E4C40]/6'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-extrabold leading-tight">
                                {s.name}
                              </span>
                            </div>
                            <p
                              className={`mt-0.5 text-[9px] leading-relaxed ${
                                isSelected ? 'text-[#F3E7CB]/80' : 'text-[#6B7A72]'
                              }`}
                            >
                              {s.description}
                            </p>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#C89B4E] mt-0.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Tombol Arti (Icon Languages / Terjemahan, compact tanpa overlap) */}
            <button
              type="button"
              onClick={() => setShowTranslation(!showTranslation)}
              title={showTranslation ? 'Sembunyikan terjemahan ayat' : 'Tampilkan terjemahan ayat'}
              aria-label="Toggle Terjemahan"
              aria-pressed={showTranslation}
              className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all active:scale-95 ${
                showTranslation
                  ? 'border-[#1E4C40] bg-[#1E4C40] text-[#F3E7CB] shadow-xs'
                  : 'border-[#1E4C40]/12 bg-white text-[#6B7A72] hover:text-[#1E4C40] hover:border-[#1E4C40]/30 shadow-2xs'
              }`}
            >
              <Languages className="h-3.5 w-3.5 stroke-[2.2]" />
            </button>
          </div>
        </div>

        {/* 4. Progress (Ultra compact inline progress bar) */}
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#1E4C40]/8">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full rounded-full bg-gradient-to-r from-[#2F6B5B] to-[#C89B4E] transition-all duration-300"
            />
          </div>
          <span className="shrink-0 text-[8.5px] font-bold text-[#8A968F]">
            {completedPagesCount}/{totalPagesInJuz} hal. ({progressPercent}%)
          </span>
        </div>
      </section>

      {/* ── Mushaf reader — cardless, reads straight on the page ─────── */}
      <section
        data-guide="mushaf-page"
        className="rise relative [animation-delay:60ms]"
      >
        {/* Ornamental separator */}
        <div className="mb-4 flex items-center gap-3 px-1">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#C89B4E]/30" />
          <div className="text-center">
            <p className="text-[8.5px] font-extrabold uppercase tracking-[0.25em] text-[#8A968F]">
              {currentSourceMeta.name}
            </p>
          </div>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#C89B4E]/30" />
        </div>

        {isLoadingPage ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-[#8A968F]">
            <Loader2 className="h-6 w-6 animate-spin text-[#C89B4E]" />
            <p className="text-[10px] font-semibold">
              Memuat Rasm Utsmani halaman {actualMushafPage}...
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-[46rem]">
            {verses.map((verse, index) => {
              const surahInfo = SURAHS[verse.surah];
              const isFirstAyahOfSurah = verse.ayah === 1;
              const isCurrentAudioAyah =
                isAudioInThisJuz &&
                currentAudioTrack?.surahNumber === verse.surah &&
                currentAudioTrack?.ayahNumber === verse.ayah;
              const isPlayingThisAyah = isCurrentAudioAyah && audioState.isPlaying;

              return (
                <div
                  key={`${verse.surah}-${verse.ayah}-${index}`}
                  ref={isCurrentAudioAyah ? activeAyahRef : null}
                  className={`transition-all duration-300 ${
                    isCurrentAudioAyah
                      ? 'my-3 rounded-2xl border-2 border-[#C89B4E] bg-gradient-to-br from-[#FFF9EE] via-[#FCF7ED] to-[#F5EEDD] p-3.5 sm:p-5 shadow-[0_6px_25px_rgba(200,155,78,0.22)] ring-4 ring-[#C89B4E]/25'
                      : 'relative py-2.5 px-1'
                  }`}
                >
                  {/* Active Ayah Header Banner */}
                  {isCurrentAudioAyah && (
                    <div className="mb-3 flex items-center justify-between border-b border-[#C89B4E]/30 pb-2.5">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-[#1E4C40] px-3 py-1 text-[10.5px] font-extrabold text-[#F3E7CB] shadow-xs">
                        <span className="relative flex h-2 w-2">
                          {isPlayingThisAyah && (
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C89B4E] opacity-75" />
                          )}
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#C89B4E]" />
                        </span>
                        <Volume2
                          className={`h-3.5 w-3.5 text-[#C89B4E] ${isPlayingThisAyah ? 'animate-pulse' : ''}`}
                        />
                        <span>{isPlayingThisAyah ? 'Ayat Sedang Diputar' : 'Ayat Terpilih'}</span>
                      </div>
                      <span className="text-[11px] font-extrabold text-[#8A6220]">
                        QS. {surahInfo?.name} : {verse.ayah}
                      </span>
                    </div>
                  )}

                  {isFirstAyahOfSurah && (
                    <div className="my-4 flex items-center gap-3">
                      <span className="h-px flex-1 bg-[#1E4C40]/12" />
                      <span className="flex items-baseline gap-2 rounded-full border border-[#C89B4E]/30 bg-[#C89B4E]/10 px-3 py-1">
                        <span className="text-[9.5px] font-extrabold uppercase tracking-[0.2em] text-[#9C7330]">
                          {surahInfo?.name}
                        </span>
                        <span
                          dir="rtl"
                          className="font-arabic text-[15px] leading-none text-[#1E4C40]"
                        >
                          {surahInfo?.arabicName}
                        </span>
                      </span>
                      <span className="h-px flex-1 bg-[#1E4C40]/12" />
                    </div>
                  )}

                  <div dir="rtl" className="px-1 text-right sm:px-2">
                    <p
                      className={`select-text font-arabic leading-[2.3] transition ${
                        isCurrentAudioAyah
                          ? 'text-[29px] sm:text-[33px] font-bold text-[#0D382E]'
                          : 'text-[27px] sm:text-[30px] text-[#15231E]'
                      }`}
                    >
                      {verse.textArabic}{' '}
                      <button
                        type="button"
                        onClick={() => handlePlayAyah(verse.surah, verse.ayah)}
                        title={`Putar QS. ${surahInfo?.name}: ${verse.ayah}`}
                        className={`mx-1 inline-flex h-8 min-w-8 items-center justify-center rounded-full border px-2 align-middle font-sans text-[11px] font-extrabold transition active:scale-95 ${
                          isCurrentAudioAyah
                            ? 'border-[#C89B4E] bg-[#1E4C40] text-[#F3E7CB] shadow-md ring-2 ring-[#C89B4E]/70 scale-105'
                            : 'border-[#C89B4E]/50 bg-[#C89B4E]/15 text-[#9C7330] hover:bg-[#C89B4E]/25'
                        }`}
                      >
                        {verse.ayah}
                      </button>
                    </p>
                  </div>

                  {showTranslation && (
                    <div
                      className={`mt-2 flex items-start justify-between gap-3 px-1 sm:px-2 transition ${
                        isCurrentAudioAyah
                          ? 'rounded-xl border-l-4 border-[#C89B4E] bg-white/75 p-2.5 shadow-xs'
                          : ''
                      }`}
                    >
                      <p
                        className={`text-[11px] leading-relaxed ${
                          isCurrentAudioAyah
                            ? 'text-[#15231E] font-medium'
                            : 'border-l-2 border-[#C89B4E]/50 pl-3 text-[#6B7A72]'
                        }`}
                      >
                        <span className="mr-1 font-extrabold text-[#1E4C40]">
                          [{verse.surah}:{verse.ayah}]
                        </span>
                        {verse.textIndo}
                      </p>
                      <button
                        type="button"
                        onClick={() => handlePlayAyah(verse.surah, verse.ayah)}
                        className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-extrabold transition active:scale-95 ${
                          isCurrentAudioAyah
                            ? 'bg-[#1E4C40] text-[#F3E7CB] ring-1 ring-[#C89B4E]/50 shadow-xs'
                            : 'bg-[#1E4C40]/6 text-[#1E4C40] hover:bg-[#C89B4E]/20'
                        }`}
                      >
                        <Volume2
                          className={`h-3 w-3 ${isPlayingThisAyah ? 'animate-pulse text-[#C89B4E]' : ''}`}
                        />
                        {isPlayingThisAyah ? 'Memutar' : 'Putar'}
                      </button>
                    </div>
                  )}

                  {!isCurrentAudioAyah && index < verses.length - 1 && (
                    <div className="flex items-center justify-center gap-2 py-3" aria-hidden>
                      <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#C89B4E]/30" />
                      <span className="h-1 w-1 rotate-45 bg-[#C89B4E]/50" />
                      <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#C89B4E]/30" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Mark complete + navigation — cardless action stack */}
        <div className="mx-auto mt-6 max-w-[46rem] space-y-2.5 px-1">
          <button
            type="button"
            onClick={() => void handleToggleComplete()}
            className={`flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full text-[12px] font-extrabold shadow-[0_16px_30px_-20px_rgba(16,46,39,0.8)] transition active:scale-[0.99] ${
              manualReaderForPage
                ? 'bg-[#2F6B5B] text-white'
                : 'bg-[#1E4C40] text-[#F3E7CB]'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            {manualReaderForPage
              ? `Alhamdulillah, halaman ${relativePage} selesai dibaca (${manualReaderForPage})`
              : `Tandai halaman ${relativePage} selesai (${readerRole})`}
          </button>

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              disabled={relativePage <= 1}
              onClick={() => {
                setFollowAudio(false);
                setRelativePage((page) => Math.max(1, page - 1));
              }}
              className="flex min-h-[42px] flex-1 items-center justify-center gap-1 rounded-full border border-[#1E4C40]/12 bg-white/45 text-[10px] font-extrabold text-[#5C6B63] backdrop-blur transition hover:bg-white/70 disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Sebelumnya
            </button>
            <button
              type="button"
              disabled={relativePage >= totalPagesInJuz}
              onClick={() => {
                setFollowAudio(false);
                setRelativePage((page) => Math.min(totalPagesInJuz, page + 1));
              }}
              className="flex min-h-[42px] flex-1 items-center justify-center gap-1 rounded-full border border-[#1E4C40]/12 bg-white/45 text-[10px] font-extrabold text-[#5C6B63] backdrop-blur transition hover:bg-white/70 disabled:opacity-40"
            >
              Berikutnya
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Parent talaqqi analytics ────────────────────────────────── */}
      <section className="surface rise p-4 [animation-delay:120ms]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[#1E4C40]" />
            <h3 className="text-[11px] font-extrabold text-[#15231E]">
              Statistik Talaqqi Orang Tua
            </h3>
          </div>
          {isPro && (
            <span className="flex items-center gap-1 rounded-full bg-[#C89B4E]/15 px-2 py-0.5 text-[9px] font-extrabold text-[#9C7330]">
              <Sparkles className="h-2.5 w-2.5" /> Muhsinin
            </span>
          )}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {(
            [
              { key: 'Ibu', label: 'Ibu', color: 'bg-[#F3D9C4] text-[#8A4B22]' },
              { key: 'Ayah', label: 'Ayah', color: 'bg-[#D5E4DD] text-[#1E4C40]' },
              { key: 'Bersama', label: 'Bersama', color: 'bg-[#EAD8AF] text-[#7A5A1F]' },
            ] as const
          ).map((item) => (
            <div
              key={item.key}
              className="rounded-2xl border border-[#1E4C40]/8 bg-[#FBF6EC]/70 p-3 text-center"
            >
              <span
                className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-extrabold ${item.color}`}
              >
                {item.label.charAt(0)}
              </span>
              <p className="mt-1.5 text-lg font-extrabold leading-none text-[#15231E]">
                {roleCounts[item.key]}
              </p>
              <p className="text-[9px] font-semibold text-[#8A968F]">{item.label} · hlm</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
