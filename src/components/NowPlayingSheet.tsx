'use client';

import React, { useEffect, useRef, useState } from 'react';
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
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;
    setPanel(null);
    setDragY(0);
  }, [open]);

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
  const volumePercent = Math.round((state.volume / maxSafeVolume) * 100);
  const sleepLabel =
    state.sleepTimerMode === 'off'
      ? 'Timer'
      : state.sleepRemainingSeconds !== null
        ? `${Math.ceil(state.sleepRemainingSeconds / 60)}m`
        : 'Akhir Juz';

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
    <div className="fixed inset-0 z-50 flex flex-col justify-end" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Tutup pemutar"
        onClick={onClose}
        className="absolute inset-0 bg-[#081a15]/60 backdrop-blur-[5px]"
      />

      <div
        className="sheet-up relative mx-auto flex max-h-[94dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[34px] border-t border-white/40 bg-[#F9F4EA] shadow-[0_-30px_80px_-20px_rgba(8,26,21,0.7)]"
        style={{
          transform: `translateY(${dragY}px)`,
          transition: isDragging ? 'none' : 'transform 280ms cubic-bezier(.22,.61,.36,1)',
        }}
      >
        {/* Drag handle + header */}
        <div
          className="shrink-0 touch-none px-5 pt-2.5"
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <div className="mx-auto h-1.5 w-12 rounded-full bg-[#1E4C40]/15" />
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C89B4E]" />
              <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#6B7A72]">
                Sedang Diputar
              </span>
              {!isPro && (
                <span className="rounded-full border border-[#C89B4E]/30 bg-[#C89B4E]/15 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-[#9C7330]">
                  Streaming Online
                </span>
              )}
            </div>
            <button
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={onClose}
              aria-label="Tutup"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1E4C40]/8 text-[#1E4C40] transition active:scale-95"
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-4 pt-4">
          <article className="relative rounded-[26px] border border-[#1E4C40]/10 bg-[#FFFCF5] shadow-[0_30px_70px_-50px_rgba(16,46,39,0.7)]">
            <div className="hero-surface relative overflow-hidden rounded-t-[26px] px-5 py-4 text-white">
              <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full border border-[#EAD8AF]/20" />
              <div className="pointer-events-none absolute -right-2 -top-2 h-16 w-16 rounded-full border border-[#EAD8AF]/15" />
              <div className="relative flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#EAD8AF]/80">
                    QS. {track?.surahName ?? '—'}
                  </p>
                  <p className="mt-1 text-lg font-extrabold tracking-tight">
                    Ayat {track?.ayahNumber ?? '—'}
                  </p>
                </div>
                <span dir="rtl" className="font-arabic text-2xl text-[#EAD8AF]">
                  {track?.arabicName}
                </span>
              </div>
            </div>

            <div className="px-5 py-5">
              {isLoading ? (
                <div className="space-y-3 py-2" aria-hidden>
                  <div className="ml-auto h-5 w-11/12 animate-pulse rounded-full bg-[#1E4C40]/10" />
                  <div className="ml-auto h-5 w-9/12 animate-pulse rounded-full bg-[#1E4C40]/10" />
                  <div className="ml-auto h-5 w-10/12 animate-pulse rounded-full bg-[#1E4C40]/10" />
                  <div className="mt-6 h-3 w-full animate-pulse rounded-full bg-[#1E4C40]/8" />
                  <div className="h-3 w-8/12 animate-pulse rounded-full bg-[#1E4C40]/8" />
                </div>
              ) : verse ? (
                <>
                  <p
                    dir="rtl"
                    className="text-right font-arabic text-[27px] leading-[2.15] text-[#15231E]"
                  >
                    {verse.textArabic}
                  </p>

                  <div className="my-4 flex items-center gap-3">
                    <span className="h-px flex-1 bg-[#1E4C40]/10" />
                    <span className="h-1.5 w-1.5 rotate-45 bg-[#C89B4E]/70" />
                    <span className="h-px flex-1 bg-[#1E4C40]/10" />
                  </div>

                  <p className="text-[13px] leading-relaxed text-[#5D6B64]">{verse.textIndo}</p>
                </>
              ) : (
                <p className="py-6 text-center text-xs font-medium text-[#6B7A72]">
                  Teks ayat belum tersimpan di perangkat. Buka halaman Mushaf sekali saat online
                  agar terjemahan tersedia offline.
                </p>
              )}

              <div className="relative mt-4 flex items-center justify-between gap-3 border-t border-dashed border-[#1E4C40]/15 pt-3">
                {panel === 'reciter' && (
                  <div className="surface absolute inset-x-0 bottom-full z-30 mb-2.5 max-h-[340px] overflow-y-auto border border-[#1E4C40]/15 bg-[#FFFCF5] p-3 shadow-[0_-14px_34px_-8px_rgba(21,35,30,0.24)]">
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
                )}

                <button
                  type="button"
                  onClick={() => setPanel(panel === 'reciter' ? null : 'reciter')}
                  className="inline-flex min-w-0 items-center gap-2 rounded-full bg-[#1E4C40]/8 px-2.5 py-1 text-left text-[11px] font-bold text-[#1E4C40] transition hover:bg-[#1E4C40]/14 active:scale-95"
                >
                  <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full border border-[#1E4C40]/20 bg-[#15352C]">
                    <Image
                      src={reciter.photoUrl}
                      alt={reciter.name}
                      fill
                      sizes="20px"
                      className="object-cover object-top"
                    />
                  </div>
                  <span className="truncate">{reciter.shortName}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                      panel === 'reciter' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A968F]">
                  Hlm. {verse?.pageNumber ?? track?.mushafPage ?? 1}
                </span>
              </div>
            </div>
          </article>

          {/* Quick info tiles */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="surface-soft px-3 py-2.5 text-center">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#8A968F]">
                Juz
              </p>
              <p className="mt-0.5 text-base font-extrabold text-[#1E4C40]">{state.activeJuz}</p>
            </div>
            <div className="surface-soft px-3 py-2.5 text-center">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#8A968F]">
                Halaman
              </p>
              <p className="mt-0.5 text-base font-extrabold text-[#1E4C40]">
                {track?.relativePage ?? 1}
                <span className="text-[11px] font-semibold text-[#8A968F]">/20</span>
              </p>
            </div>
            <div className="surface-soft px-3 py-2.5 text-center">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#8A968F]">
                {isPro ? 'Offline' : 'Mode Audio'}
              </p>
              {isPro ? (
                <p className="mt-0.5 text-base font-extrabold text-[#1E4C40]">
                  {state.offlineCachedCount}
                  <span className="text-[11px] font-semibold text-[#8A968F]">
                    /{state.tracks.length}
                  </span>
                </p>
              ) : (
                <p className="mt-1 text-[11px] font-extrabold text-[#9C7330]">
                  Streaming Online
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenMushaf();
            }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#1E4C40]/15 bg-[#FFFCF5] py-3 text-xs font-bold text-[#1E4C40] transition hover:bg-[#1E4C40]/5"
          >
            <BookOpen className="h-4 w-4" />
            Buka di Mushaf Manual
          </button>
        </div>

        {/* Persistent transport controls */}
        <div className="shrink-0 border-t border-[#1E4C40]/10 bg-[#F9F4EA]/95 px-5 pb-[max(0.9rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="w-9 text-[10px] font-bold tabular-nums text-[#8A968F]">
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
            <span className="w-9 text-right text-[10px] font-bold tabular-nums text-[#8A968F]">
              {formatSeconds(state.duration)}
            </span>
          </div>

          <div className="mt-2.5 flex items-center justify-center gap-7">
            <button
              type="button"
              onClick={() => void previousTrack()}
              aria-label="Ayat sebelumnya"
              className="flex h-12 w-12 items-center justify-center rounded-full text-[#1E4C40] transition hover:bg-[#1E4C40]/8"
            >
              <SkipBack className="h-6 w-6 fill-current" />
            </button>

            <button
              type="button"
              onClick={() => void togglePlay()}
              disabled={state.isLoading}
              aria-label={state.isPlaying ? 'Jeda' : 'Putar'}
              className="flex h-[66px] w-[66px] items-center justify-center rounded-full bg-[#1E4C40] text-[#F3E7CB] shadow-[0_18px_40px_-16px_rgba(16,46,39,0.9)] ring-4 ring-[#C89B4E]/30 transition active:scale-95 disabled:opacity-60"
            >
              {state.isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : state.isPlaying ? (
                <Pause className="h-6 w-6 fill-current" />
              ) : (
                <Play className="h-6 w-6 translate-x-[2px] fill-current" />
              )}
            </button>

            <button
              type="button"
              onClick={() => void nextTrack()}
              aria-label="Ayat berikutnya"
              className="flex h-12 w-12 items-center justify-center rounded-full text-[#1E4C40] transition hover:bg-[#1E4C40]/8"
            >
              <SkipForward className="h-6 w-6 fill-current" />
            </button>
          </div>

          <div className="relative mt-2.5">
            {/* Floating panels directly above action buttons */}
            {panel === 'sleep' && (
              <div className="surface absolute inset-x-0 bottom-full z-20 mb-2.5 border border-[#1E4C40]/15 bg-[#FFFCF5] p-3.5 shadow-[0_-14px_34px_-8px_rgba(21,35,30,0.24)]">
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
              <div className="surface absolute inset-x-0 bottom-full z-20 mb-2.5 border border-[#1E4C40]/15 bg-[#FFFCF5] p-3.5 shadow-[0_-14px_34px_-8px_rgba(21,35,30,0.24)]">
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#2F6B5B]" />
                    <p className="text-xs font-extrabold text-[#15231E]">Volume Aman Anak</p>
                  </div>
                  <span className="text-[11px] font-extrabold text-[#1E4C40]">
                    {volumePercent}%
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
                    background: `linear-gradient(to right, #C89B4E ${volumePercent}%, rgba(30,76,64,0.12) ${volumePercent}%)`,
                  }}
                  aria-label="Volume"
                />
                <p className="mt-2 text-[10px] leading-relaxed text-[#8A968F]">
                  Dibatasi maksimal 60% untuk menjaga kenyamanan pendengaran anak.
                </p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPanel(panel === 'sleep' ? null : 'sleep')}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-bold transition ${
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
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-bold transition ${
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
                className="flex items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-bold text-[#6B7A72] transition hover:bg-[#1E4C40]/5 disabled:opacity-60"
              >
                {state.isDownloadingJuz ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {state.downloadProgress}%
                  </>
                ) : state.offlineCachedCount >= state.tracks.length ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#2F6B5B]" />
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
                className="flex items-center justify-center gap-1.5 rounded-xl bg-[#C89B4E]/12 py-2 text-[11px] font-bold text-[#9C7330] transition hover:bg-[#C89B4E]/20 active:scale-95"
              >
                <Lock className="h-3 w-3" />
                Muhsinin
              </button>
            )}
            </div>
          </div>
        </div>
      </div>

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
