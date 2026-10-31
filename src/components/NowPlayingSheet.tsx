'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Download,
  Info,
  Loader2,
  Lock,
  Moon,
  Pause,
  Play,
  ShieldCheck,
  SkipBack,
  SkipForward,
  Volume2,
} from 'lucide-react';
import { RECITERS, type Reciter } from '@/lib/quran-metadata';
import { ReciterProfileModal } from '@/components/ReciterProfileModal';
import { useAudioPlayer, type SleepTimerMode } from '@/hooks/useAudioPlayer';
import { useAyahText } from '@/hooks/useAyahText';

interface NowPlayingSheetProps {
  open: boolean;
  isPro: boolean;
  onClose: () => void;
  onOpenMushaf: () => void;
  onOpenInfaq: () => void;
}

const SLEEP_OPTIONS: { mode: SleepTimerMode; label: string }[] = [
  { mode: 'off', label: 'Nonaktif' },
  { mode: '15m', label: '15 mnt' },
  { mode: '30m', label: '30 mnt' },
  { mode: '60m', label: '60 mnt' },
  { mode: 'end_of_juz', label: 'Akhir Juz' },
];

function formatSeconds(seconds: number) {
  if (!Number.isFinite(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

export function NowPlayingSheet({
  open,
  isPro,
  onClose,
  onOpenMushaf,
  onOpenInfaq,
}: NowPlayingSheetProps) {
  const {
    state,
    maxSafeVolume,
    togglePlay,
    nextTrack,
    previousTrack,
    seekTo,
    setVolume,
    setSleepTimer,
    setReciter,
    downloadActiveJuzForOffline,
  } = useAudioPlayer();

  const track = state.tracks[state.currentTrackIndex];
  const reciter = RECITERS.find((item) => item.id === state.reciterId) ?? RECITERS[0];
  const { verse, isLoading } = useAyahText(track);

  const [panel, setPanel] = useState<'sleep' | 'volume' | 'reciter' | null>(null);
  const [selectedProfileReciter, setSelectedProfileReciter] = useState<Reciter | null>(null);
  const [reciterMenuStyle, setReciterMenuStyle] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);
  const reciterTriggerRef = useRef<HTMLButtonElement>(null);
  const verseScrollRef = useRef<HTMLDivElement>(null);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef<number | null>(null);

  // Keep the floating qari menu anchored to its trigger without affecting layout.
  useEffect(() => {
    if (panel !== 'reciter') {
      setReciterMenuStyle(null);
      return;
    }

    const updatePosition = () => {
      const trigger = reciterTriggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const width = Math.min(360, viewportWidth - 24);
      const left = Math.min(
        Math.max(12, rect.left),
        Math.max(12, viewportWidth - width - 12),
      );
      const spaceAbove = rect.top - 24;
      const spaceBelow = viewportHeight - rect.bottom - 24;
      const openBelow = spaceAbove < 200 && spaceBelow > spaceAbove;
      setReciterMenuStyle({
        ...(openBelow
          ? { top: rect.bottom + 10 }
          : { bottom: viewportHeight - rect.top + 10 }),
        left,
        width,
        maxHeight: Math.max(160, openBelow ? spaceBelow : spaceAbove),
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [panel]);

  useEffect(() => {
    if (!open) return;
    setPanel(null);
    setDragY(0);
  }, [open]);

  // Always start a new ayah at the top of the verse viewport.
  useEffect(() => {
    if (!open) return;
    verseScrollRef.current?.scrollTo({ top: 0 });
  }, [open, track?.surahNumber, track?.ayahNumber]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const progress = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;
  // Actual device volume (0–60%). The slider fill is separate so the track still
  // reads as "full" at the 60% safety cap.
  const volumePercent = Math.round(state.volume * 100);
  const volumeFillPercent = Math.round((state.volume / maxSafeVolume) * 100);
  const maxVolumePercent = Math.round(maxSafeVolume * 100);
  const sleepLabel =
    state.sleepTimerMode === 'off'
      ? 'Timer'
      : state.sleepRemainingSeconds !== null
        ? `${Math.ceil(state.sleepRemainingSeconds / 60)}m`
        : 'Akhir Juz';
  const pageNumber = verse?.pageNumber ?? track?.mushafPage ?? 1;
  const isJuzComplete = state.offlineCachedCount >= state.tracks.length;

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button')) return;
    startY.current = event.clientY;
    setIsDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (startY.current === null) return;
    setDragY(Math.max(0, event.clientY - startY.current));
  };

  const endDrag = () => {
    if (dragY > 110) {
      onClose();
    }
    setDragY(0);
    setIsDragging(false);
    startY.current = null;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Pemutar murottal"
    >
      <button
        type="button"
        aria-label="Tutup pemutar"
        onClick={onClose}
        className="absolute inset-0 bg-[#081a15]/65 backdrop-blur-[6px]"
      />

      {/*
        Fixed-height stage: the verse card below is the only flexible region and
        scrolls internally, so long and short ayahs never resize the sheet.
      */}
      <div
        className="sheet-up relative mx-auto flex h-[94dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[32px] border border-white/50 border-b-0 bg-[#F7F1E6] shadow-[0_-30px_80px_-20px_rgba(8,26,21,0.75)] sm:mb-4 sm:h-[min(90dvh,880px)] sm:rounded-[32px] sm:border-b"
        style={{
          transform: `translateY(${dragY}px)`,
          transition: isDragging ? 'none' : 'transform 280ms cubic-bezier(.22,.61,.36,1)',
        }}
      >
        {/* Ambient wash */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#C89B4E]/14 blur-3xl" />
          <div className="absolute -left-24 top-1/3 h-64 w-64 rounded-full bg-[#2F6B5B]/12 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#F2EADB] to-transparent" />
        </div>

        {/* Drag handle + header */}
        <div
          className="relative shrink-0 touch-none px-5 pt-2"
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <div className="mx-auto h-1 w-10 rounded-full bg-[#1E4C40]/20" />
          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C89B4E]/60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#C89B4E]" />
              </span>
              <div className="min-w-0">
                <p className="text-[8.5px] font-extrabold uppercase tracking-[0.28em] text-[#6B7A72]">
                  Sedang Diputar
                </p>
                <p className="mt-0.5 truncate text-[9.5px] font-bold text-[#1E4C40]">
                  Juz {state.activeJuz} · {state.tracks.length} ayat
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              {!isPro && (
                <span className="rounded-full border border-[#C89B4E]/30 bg-[#C89B4E]/15 px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.12em] text-[#9C7330]">
                  Streaming
                </span>
              )}
              <button
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={onClose}
                aria-label="Tutup"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#1E4C40]/10 bg-white/70 text-[#1E4C40] shadow-sm backdrop-blur transition hover:bg-white active:scale-95"
              >
                <ChevronDown className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>
        </div>

        {/* Hero: surah identity + qari selector */}
        <div className="hero-surface relative mx-5 mt-2 shrink-0 overflow-hidden rounded-[20px] px-3.5 py-2.5 text-white">
          <div className="pointer-events-none absolute -right-10 -top-14 h-32 w-32 rounded-full border border-[#EAD8AF]/20" />
          <div className="pointer-events-none absolute -right-2 -top-4 h-16 w-16 rounded-full border border-[#EAD8AF]/12" />
          <div className="pointer-events-none absolute -bottom-10 -left-8 h-24 w-24 rounded-full bg-[#C89B4E]/10 blur-2xl" />

          <div className="relative flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[8px] font-bold uppercase tracking-[0.26em] text-[#EAD8AF]/75">
                QS. {track?.surahName ?? '—'}
              </p>
              <p className="mt-0.5 flex items-baseline gap-1.5">
                <span className="text-[23px] font-extrabold leading-none tracking-tight">
                  {track?.ayahNumber ?? '—'}
                </span>
                <span className="text-[8.5px] font-bold uppercase tracking-[0.2em] text-[#EAD8AF]/70">
                  Ayat
                </span>
              </p>
            </div>
            <span
              dir="rtl"
              className="shrink-0 font-arabic text-[19px] leading-tight text-[#EAD8AF]"
            >
              {track?.arabicName}
            </span>
          </div>

          <div className="relative mt-2 flex items-center justify-between gap-2 border-t border-white/12 pt-2">
            <button
              type="button"
              ref={reciterTriggerRef}
              aria-haspopup="dialog"
              aria-expanded={panel === 'reciter'}
              onClick={() => setPanel(panel === 'reciter' ? null : 'reciter')}
              className="inline-flex min-w-0 max-w-[76%] items-center gap-1.5 rounded-full border border-white/15 bg-white/10 py-0.5 pl-0.5 pr-2 text-left backdrop-blur transition hover:bg-white/16 active:scale-[0.98]"
            >
              <span className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full ring-1 ring-[#EAD8AF]/45">
                <Image
                  src={reciter.photoUrl}
                  alt={reciter.name}
                  fill
                  sizes="20px"
                  className="object-cover object-top"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[10px] font-bold leading-tight text-[#F7F0E1]">
                  {reciter.shortName}
                </span>
                <span className="block truncate text-[7.5px] font-semibold uppercase tracking-[0.14em] text-[#EAD8AF]/65">
                  Qari Murottal
                </span>
              </span>
              <ChevronDown
                className={`h-3 w-3 shrink-0 text-[#EAD8AF]/80 transition-transform duration-200 ${
                  panel === 'reciter' ? 'rotate-180' : ''
                }`}
              />
            </button>

            <span className="shrink-0 rounded-full border border-white/15 bg-white/8 px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.14em] text-[#EAD8AF]/85">
              Hlm. {pageNumber}
            </span>
          </div>
        </div>

        {/* Verse — cardless, flows directly on the sheet paper */}
        <div className="relative mx-5 mt-3 flex min-h-0 flex-1 flex-col">
          <div className="flex shrink-0 items-center justify-between px-1 pb-1.5 pt-1">
            <span className="text-[8px] font-extrabold uppercase tracking-[0.24em] text-[#8A968F]">
              Teks Ayat
            </span>
            <span className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.14em] text-[#C89B4E]">
              <span className="h-1 w-1 rotate-45 bg-[#C89B4E]/60" />
              Mushaf Madinah
            </span>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#C89B4E]/35 to-transparent" />

          <div className="relative min-h-0 flex-1">
            <div
              ref={verseScrollRef}
              className="no-scrollbar h-full overflow-y-auto overscroll-contain px-2 pb-5 pt-3.5 sm:px-3 [-webkit-mask-image:linear-gradient(to_bottom,transparent_0,black_12px,black_calc(100%_-_20px),transparent_100%)] [mask-image:linear-gradient(to_bottom,transparent_0,black_12px,black_calc(100%_-_20px),transparent_100%)]"
            >
              {isLoading ? (
                <div className="space-y-3 py-2" aria-hidden>
                  <div className="ml-auto h-5 w-11/12 animate-pulse rounded-full bg-[#1E4C40]/10" />
                  <div className="ml-auto h-5 w-9/12 animate-pulse rounded-full bg-[#1E4C40]/10" />
                  <div className="ml-auto h-5 w-10/12 animate-pulse rounded-full bg-[#1E4C40]/10" />
                  <div className="mt-6 h-3 w-full animate-pulse rounded-full bg-[#1E4C40]/8" />
                  <div className="h-3 w-8/12 animate-pulse rounded-full bg-[#1E4C40]/8" />
                </div>
              ) : verse ? (
                <div key={`${track?.surahNumber}-${track?.ayahNumber}`} className="rise">
                  <p
                    dir="rtl"
                    className="text-right font-arabic text-[26px] leading-[1.95] text-[#15231E]"
                  >
                    {verse.textArabic}
                  </p>

                  <div className="my-3 flex items-center gap-3">
                    <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#C89B4E]/45" />
                    <span className="h-1.5 w-1.5 rotate-45 border border-[#C89B4E]/60 bg-[#C89B4E]/20" />
                    <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#C89B4E]/45" />
                  </div>

                  <p className="border-l-2 border-[#C89B4E]/40 pl-3 text-[12px] leading-[1.8] text-[#5D6B64]">
                    {verse.textIndo}
                  </p>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1E4C40]/8 text-[#1E4C40]">
                    <BookOpen className="h-5 w-5" />
                  </span>
                  <p className="text-[11.5px] leading-relaxed text-[#6B7A72]">
                    Teks ayat belum tersimpan di perangkat. Buka halaman Mushaf sekali saat
                    online agar terjemahan tersedia offline.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transport console */}
        <div className="relative shrink-0 px-5 pb-[max(0.7rem,env(safe-area-inset-bottom))] pt-2">
          <div className="flex items-center gap-2">
            <span className="w-8 text-[9.5px] font-bold tabular-nums text-[#8A968F]">
              {formatSeconds(state.currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={state.duration || 100}
              value={state.currentTime}
              onChange={(event) => seekTo(Number(event.target.value))}
              className="brand-range flex-1"
              style={{
                background: `linear-gradient(to right, #C89B4E ${progress}%, rgba(30,76,64,0.12) ${progress}%)`,
              }}
              aria-label="Posisi audio"
            />
            <span className="w-8 text-right text-[9.5px] font-bold tabular-nums text-[#8A968F]">
              {formatSeconds(state.duration)}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-center gap-7">
            <button
              type="button"
              onClick={() => void previousTrack()}
              aria-label="Ayat sebelumnya"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1E4C40]/10 bg-white/60 text-[#1E4C40] shadow-sm backdrop-blur transition hover:bg-white active:scale-95"
            >
              <SkipBack className="h-[18px] w-[18px] fill-current" />
            </button>

            <button
              type="button"
              onClick={() => void togglePlay()}
              disabled={state.isLoading}
              aria-label={state.isPlaying ? 'Jeda' : 'Putar'}
              className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-[#1E4C40] text-[#F3E7CB] shadow-[0_18px_40px_-16px_rgba(16,46,39,0.95)] ring-4 ring-[#C89B4E]/30 transition active:scale-95 disabled:opacity-60"
            >
              {state.isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : state.isPlaying ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : (
                <Play className="h-5 w-5 translate-x-[2px] fill-current" />
              )}
            </button>

            <button
              type="button"
              onClick={() => void nextTrack()}
              aria-label="Ayat berikutnya"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1E4C40]/10 bg-white/60 text-[#1E4C40] shadow-sm backdrop-blur transition hover:bg-white active:scale-95"
            >
              <SkipForward className="h-[18px] w-[18px] fill-current" />
            </button>
          </div>

          <div className="relative mt-2">
            {/* Floating panels directly above the action rail */}
            {panel === 'sleep' && (
              <div className="surface pop-in absolute inset-x-0 bottom-full z-20 mb-2.5 border border-[#1E4C40]/15 bg-[#FFFCF5] p-3.5">
                <div className="mb-2.5 flex items-center gap-2">
                  <Moon className="h-4 w-4 text-[#1E4C40]" />
                  <p className="text-xs font-extrabold text-[#15231E]">Timer Tidur</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SLEEP_OPTIONS.map((option) => (
                    <button
                      key={option.mode}
                      type="button"
                      onClick={() => setSleepTimer(option.mode)}
                      className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
                        state.sleepTimerMode === option.mode
                          ? 'bg-[#1E4C40] text-[#F3E7CB]'
                          : 'bg-[#1E4C40]/6 text-[#5C6B63] hover:bg-[#1E4C40]/10'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {panel === 'volume' && (
              <div className="surface pop-in absolute inset-x-0 bottom-full z-20 mb-2.5 border border-[#1E4C40]/15 bg-[#FFFCF5] p-3.5">
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#2F6B5B]" />
                    <p className="text-xs font-extrabold text-[#15231E]">Volume Aman Anak</p>
                  </div>
                  <span className="text-[11px] font-extrabold text-[#1E4C40]">
                    {volumePercent}%
                    <span className="ml-0.5 text-[9.5px] font-semibold text-[#8A968F]">
                      / {maxVolumePercent}%
                    </span>
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={maxSafeVolume}
                  step={0.02}
                  value={state.volume}
                  onChange={(event) => setVolume(Number(event.target.value))}
                  className="brand-range"
                  style={{
                    background: `linear-gradient(to right, #C89B4E ${volumeFillPercent}%, rgba(30,76,64,0.12) ${volumeFillPercent}%)`,
                  }}
                  aria-label={`Volume ${volumePercent}% dari maksimum ${maxVolumePercent}%`}
                />
                <p className="mt-2 text-[10px] leading-relaxed text-[#8A968F]">
                  Dibatasi maksimal 60% untuk menjaga kenyamanan pendengaran anak.
                </p>
              </div>
            )}

            <div className="grid grid-cols-4 gap-1">
              <button
                type="button"
                onClick={() => setPanel(panel === 'sleep' ? null : 'sleep')}
                className={`flex flex-col items-center gap-0.5 rounded-xl py-1 text-[8.5px] font-bold transition ${
                  panel === 'sleep' || state.sleepTimerMode !== 'off'
                    ? 'bg-[#1E4C40]/10 text-[#1E4C40]'
                    : 'text-[#6B7A72] hover:bg-[#1E4C40]/5'
                }`}
              >
                <Moon className="h-3.5 w-3.5" />
                {sleepLabel}
              </button>

              <button
                type="button"
                onClick={() => setPanel(panel === 'volume' ? null : 'volume')}
                className={`flex flex-col items-center gap-0.5 rounded-xl py-1 text-[8.5px] font-bold transition ${
                  panel === 'volume'
                    ? 'bg-[#1E4C40]/10 text-[#1E4C40]'
                    : 'text-[#6B7A72] hover:bg-[#1E4C40]/5'
                }`}
              >
                <Volume2 className="h-3.5 w-3.5" />
                {volumePercent}%
              </button>

              {isPro ? (
                <button
                  type="button"
                  onClick={() => void downloadActiveJuzForOffline()}
                  disabled={state.isDownloadingJuz}
                  className={`flex flex-col items-center gap-0.5 rounded-xl py-1 text-[8.5px] font-bold transition disabled:opacity-60 ${
                    isJuzComplete
                      ? 'text-[#2F6B5B]'
                      : 'text-[#6B7A72] hover:bg-[#1E4C40]/5'
                  }`}
                >
                  {state.isDownloadingJuz ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      {state.downloadProgress}%
                    </>
                  ) : isJuzComplete ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Lengkap
                    </>
                  ) : (
                    <>
                      <Download className="h-3.5 w-3.5" />
                      Unduh
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenInfaq();
                  }}
                  title="Unduh audio offline — khusus Muhsinin"
                  aria-label="Unduh audio offline, khusus Muhsinin"
                  className="flex flex-col items-center gap-0.5 rounded-xl py-1 text-[8.5px] font-bold text-[#6B7A72] transition hover:bg-[#C89B4E]/12 hover:text-[#9C7330] active:scale-95"
                >
                  <span className="relative">
                    <Download className="h-3.5 w-3.5" />
                    <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-[#C89B4E] text-[#FFFCF5] shadow-sm">
                      <Lock className="h-1.5 w-1.5" />
                    </span>
                  </span>
                  Unduh
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenMushaf();
                }}
                className="flex flex-col items-center gap-0.5 rounded-xl py-1 text-[8.5px] font-bold text-[#6B7A72] transition hover:bg-[#1E4C40]/5"
              >
                <BookOpen className="h-3.5 w-3.5" />
                Mushaf
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating qari picker: portaled so it never shifts the sheet layout */}
      {panel === 'reciter' &&
        reciterMenuStyle &&
        typeof document !== 'undefined' &&
        createPortal(
          <>
            <button
              type="button"
              aria-label="Tutup pilihan qari"
              onClick={() => setPanel(null)}
              className="fixed inset-0 z-[55] cursor-default bg-transparent"
            />
            <div
              role="dialog"
              aria-label="Pilih Qari Murottal"
              className="pop-in fixed z-[60] overflow-y-auto overscroll-contain rounded-[22px] border border-[#1E4C40]/15 bg-[#FFFCF5] p-3 shadow-[0_-18px_44px_-12px_rgba(21,35,30,0.35)]"
              style={{
                top: reciterMenuStyle.top,
                bottom: reciterMenuStyle.bottom,
                left: reciterMenuStyle.left,
                width: reciterMenuStyle.width,
                maxHeight: reciterMenuStyle.maxHeight,
              }}
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#6B7A72]">
                  Pilih Qari Murottal
                </p>
                <span className="text-[9.5px] font-semibold text-[#8A968F]">
                  Ketuk ikon info untuk profil
                </span>
              </div>
              <div className="space-y-1.5">
                {RECITERS.map((item) => {
                  const isSelected = item.id === state.reciterId;
                  const isLocked = item.isPro && !isPro;
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between gap-2 rounded-2xl p-1.5 transition ${
                        isSelected
                          ? 'bg-[#1E4C40] text-[#F3E7CB]'
                          : 'bg-[#F6F0E4]/80 text-[#15231E] hover:bg-[#1E4C40]/8'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (isLocked) {
                            setSelectedProfileReciter(item);
                            setPanel(null);
                            return;
                          }
                          setReciter(item.id);
                          setPanel(null);
                        }}
                        className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                      >
                        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-white/20 bg-[#15352C]">
                          <Image
                            src={item.photoUrl}
                            alt={item.name}
                            fill
                            sizes="36px"
                            className="object-cover object-top"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11.5px] font-extrabold">
                            {item.shortName}
                          </p>
                          <p
                            className={`truncate text-[9.5px] font-medium ${
                              isSelected ? 'text-[#F3E7CB]/75' : 'text-[#6B7A72]'
                            }`}
                          >
                            {item.style} • {item.bitrate}
                          </p>
                        </div>
                      </button>

                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProfileReciter(item);
                            setPanel(null);
                          }}
                          title="Lihat profil qari"
                          className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
                            isSelected
                              ? 'bg-white/15 text-[#F3E7CB] hover:bg-white/25'
                              : 'bg-black/5 text-[#1E4C40] hover:bg-black/10'
                          }`}
                        >
                          <Info className="h-3.5 w-3.5" />
                        </button>

                        {isLocked ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProfileReciter(item);
                              setPanel(null);
                            }}
                            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#C89B4E]/25 px-2 py-0.5 text-[9px] font-extrabold text-[#9C7330]"
                          >
                            <Lock className="h-2.5 w-2.5" />
                            Muhsinin
                          </button>
                        ) : isSelected ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#EAD8AF]" />
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>,
          document.body,
        )}

      {/* Reciter Profile Modal */}
      <ReciterProfileModal
        reciter={selectedProfileReciter}
        activeReciterId={state.reciterId}
        isProUser={isPro}
        onClose={() => setSelectedProfileReciter(null)}
        onSelectReciter={(r) => {
          setReciter(r.id);
          setPanel(null);
        }}
        onUnlockRequest={() => {
          setPanel(null);
          onClose();
          onOpenInfaq();
        }}
      />
    </div>
  );
}
