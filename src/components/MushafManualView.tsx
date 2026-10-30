'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeftRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { getJuzMeta, SURAHS } from '@/lib/quran-metadata';
import { fetchVersesByPage, type QuranVerseText } from '@/lib/quran-api';
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
  const totalPagesInJuz = Math.min(20, juzMeta.endPage - juzMeta.startPage + 1);

  const currentAudioTrack = audioState.tracks[audioState.currentTrackIndex];
  const audioRelativePage = currentAudioTrack?.relativePage || 1;

  const [relativePage, setRelativePage] = useState<number>(() => audioRelativePage);
  const [followAudio, setFollowAudio] = useState<boolean>(true);
  const [readerRole, setReaderRole] = useState<'Ayah' | 'Ibu' | 'Bersama'>(
    progressToday?.readerRole || 'Ibu'
  );
  const [verses, setVerses] = useState<QuranVerseText[]>([]);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [isNavExpanded, setIsNavExpanded] = useState(false);

  const actualMushafPage = juzMeta.startPage + relativePage - 1;
  const isCurrentPageDone = progressToday?.pagesCompleted.includes(relativePage) ?? false;
  const manualReaderForPage = progressToday?.pageReaders?.[relativePage];

  // Automatically follow audio player's page when followAudio is enabled
  useEffect(() => {
    if (followAudio && audioRelativePage >= 1 && audioRelativePage <= totalPagesInJuz) {
      setRelativePage(audioRelativePage);
    }
  }, [followAudio, audioRelativePage, totalPagesInJuz]);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingPage(true);
    fetchVersesByPage(actualMushafPage)
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
  }, [actualMushafPage]);

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

  return (
    <div className="space-y-4">
      {/* ── Compact collapsible page navigator ──────────────────────── */}
      <section className="surface rise px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setIsNavExpanded((prev) => !prev)}
              className="flex items-baseline gap-1.5 text-left"
            >
              <h2 className="text-[16px] font-extrabold leading-tight tracking-tight text-[#15231E]">
                Halaman {relativePage}
                <span className="ml-0.5 text-xs font-semibold text-[#8A968F]">
                  /{totalPagesInJuz}
                </span>
              </h2>
              <span className="text-[10px] font-bold text-[#C89B4E]">
                • Juz {activeJuz}
              </span>
            </button>

            <div className="mt-1 flex items-center gap-1.5 whitespace-nowrap text-[10px] font-medium text-[#6B7A72]">
              <span className="shrink-0">Hal. {actualMushafPage}</span>
              <span className="shrink-0">•</span>
              <button
                type="button"
                onClick={handleCycleReaderRole}
                title="Klik untuk ganti pembaca (Ibu / Ayah / Bersama)"
                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#C89B4E]/15 px-2 py-0.5 text-[10px] font-extrabold text-[#8A6220] ring-1 ring-[#C89B4E]/30 transition hover:bg-[#C89B4E]/25 active:scale-95"
              >
                <span>Dibacakan: {readerRole}</span>
                <ArrowLeftRight className="h-2.5 w-2.5 shrink-0" />
              </button>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowTranslation(!showTranslation)}
              className="rounded-full border border-[#1E4C40]/12 bg-[#FFFCF5] px-2.5 py-1.5 text-[10px] font-extrabold text-[#1E4C40] transition hover:bg-[#1E4C40]/5"
            >
              {showTranslation ? 'Tutup arti' : 'Lihat arti'}
            </button>

            <button
              type="button"
              onClick={() => setIsNavExpanded((prev) => !prev)}
              aria-expanded={isNavExpanded}
              aria-label={isNavExpanded ? 'Tutup navigasi halaman' : 'Buka navigasi halaman'}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E4C40]/8 text-[#1E4C40] transition hover:bg-[#1E4C40]/14"
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  isNavExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {isNavExpanded && (
          <div className="mt-3 border-t border-[#1E4C40]/8 pt-3">
            {/* 20 page pills */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-[10px] font-bold text-[#6B7A72]">Navigasi halaman</p>
                <div className="flex items-center gap-2.5 text-[8px] font-semibold text-[#8A968F]">
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2F6B5B]" /> Selesai
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#C89B4E]" /> Audio
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-10 gap-1">
                {Array.from({ length: totalPagesInJuz }, (_, idx) => idx + 1).map((page) => {
                  const completed = progressToday?.pagesCompleted.includes(page);
                  const active = relativePage === page;
                  const isAudioHere = audioRelativePage === page;
                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() => {
                        setFollowAudio(false);
                        setRelativePage(page);
                      }}
                      className={`relative flex h-7 items-center justify-center rounded-lg text-[10px] font-bold transition ${
                        active
                          ? 'bg-[#1E4C40] text-[#F3E7CB] ring-2 ring-[#C89B4E]'
                          : completed
                            ? 'bg-[#2F6B5B]/15 text-[#1E4C40]'
                            : isAudioHere
                              ? 'bg-[#C89B4E]/20 text-[#9C7330] ring-1 ring-[#C89B4E]/60'
                              : 'bg-[#F6F0E4] text-[#6B7A72] hover:bg-[#1E4C40]/8'
                      }`}
                    >
                      {page}
                      {isAudioHere && (
                        <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-[#C89B4E] ring-2 ring-[#FFFCF5]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Mushaf reader ───────────────────────────────────────────── */}
      <section className="rise relative overflow-hidden rounded-[30px] border border-[#C89B4E]/30 bg-[#FFFCF5] shadow-[0_34px_70px_-52px_rgba(16,46,39,0.75)] [animation-delay:60ms]">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#1E4C40] via-[#C89B4E] to-[#1E4C40]" />

        <div className="p-5">
          {isLoadingPage ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-[#8A968F]">
              <Loader2 className="h-6 w-6 animate-spin text-[#C89B4E]" />
              <p className="text-[10px] font-semibold">
                Memuat Rasm Utsmani halaman {actualMushafPage}...
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {verses.map((verse, index) => {
                const surahInfo = SURAHS[verse.surah];
                const isFirstAyahOfSurah = verse.ayah === 1;
                const isActiveAudioAyah =
                  currentAudioTrack?.surahNumber === verse.surah &&
                  currentAudioTrack?.ayahNumber === verse.ayah;

                return (
                  <div
                    key={`${verse.surah}-${verse.ayah}-${index}`}
                    className={`space-y-3 rounded-2xl p-3 transition ${
                      isActiveAudioAyah
                        ? 'bg-[#C89B4E]/10 ring-1 ring-[#C89B4E]/40'
                        : 'border-b border-[#1E4C40]/8 pb-4 last:border-none'
                    }`}
                  >
                    {isFirstAyahOfSurah && (
                      <div className="my-1 flex items-center justify-center gap-2 rounded-2xl bg-[#1E4C40] px-4 py-2.5 text-[#EAD8AF]">
                        <span className="text-[11px] font-extrabold">
                          Surah {surahInfo?.name}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-[#EAD8AF]/50" />
                        <span dir="rtl" className="font-arabic text-base">
                          {surahInfo?.arabicName}
                        </span>
                      </div>
                    )}

                    <div dir="rtl" className="text-right">
                      <p className="select-text font-arabic text-[27px] leading-[2.2] text-[#15231E]">
                        {verse.textArabic}{' '}
                        <button
                          type="button"
                          onClick={() => void playSpecificAyah(verse.surah, verse.ayah)}
                          title={`Putar QS. ${surahInfo?.name}: ${verse.ayah}`}
                          className={`mx-1 inline-flex h-8 min-w-8 items-center justify-center rounded-full border px-2 align-middle font-sans text-[11px] font-bold transition ${
                            isActiveAudioAyah
                              ? 'border-[#1E4C40] bg-[#1E4C40] text-[#F3E7CB]'
                              : 'border-[#C89B4E]/50 bg-[#C89B4E]/15 text-[#9C7330] hover:bg-[#C89B4E]/25'
                          }`}
                        >
                          {verse.ayah}
                        </button>
                      </p>
                    </div>

                    {showTranslation && (
                      <div className="flex items-start justify-between gap-2">
                        <p className="border-l-2 border-[#C89B4E]/50 pl-3 text-[11px] leading-relaxed text-[#6B7A72]">
                          <span className="mr-1 font-extrabold text-[#1E4C40]">
                            [{verse.surah}:{verse.ayah}]
                          </span>
                          {verse.textIndo}
                        </p>
                        <button
                          type="button"
                          onClick={() => void playSpecificAyah(verse.surah, verse.ayah)}
                          className="flex shrink-0 items-center gap-1 rounded-full bg-[#F6F0E4] px-2.5 py-1 text-[9px] font-extrabold text-[#1E4C40] transition hover:bg-[#C89B4E]/20"
                        >
                          <Volume2 className="h-3 w-3" />
                          Putar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Mark complete + navigation */}
        <div className="space-y-2.5 border-t border-[#C89B4E]/20 bg-[#FBF6EC]/60 p-4">
          <button
            type="button"
            onClick={() => void handleToggleComplete()}
            className={`flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl text-[12px] font-extrabold shadow-[0_16px_30px_-20px_rgba(16,46,39,0.8)] transition active:scale-[0.99] ${
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
              className="flex min-h-[42px] flex-1 items-center justify-center gap-1 rounded-xl bg-[#F6F0E4] text-[10px] font-extrabold text-[#5C6B63] transition hover:bg-[#1E4C40]/8 disabled:opacity-40"
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
              className="flex min-h-[42px] flex-1 items-center justify-center gap-1 rounded-xl bg-[#F6F0E4] text-[10px] font-extrabold text-[#5C6B63] transition hover:bg-[#1E4C40]/8 disabled:opacity-40"
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
