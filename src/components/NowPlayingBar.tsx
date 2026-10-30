'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronUp, Loader2, Pause, Play, SkipForward } from 'lucide-react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { RECITERS } from '@/lib/quran-metadata';

interface NowPlayingBarProps {
  isPro?: boolean;
  onExpand: () => void;
}

export function NowPlayingBar({ isPro = false, onExpand }: NowPlayingBarProps) {
  const { state, togglePlay, nextTrack } = useAudioPlayer();
  const track = state.tracks[state.currentTrackIndex];
  const reciter = RECITERS.find((r) => r.id === state.reciterId) || RECITERS[0];

  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef<number | null>(null);
  const moved = useRef(false);

  const progress =
    state.duration > 0 ? Math.min(100, (state.currentTime / state.duration) * 100) : 0;

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button')) return;
    startY.current = event.clientY;
    moved.current = false;
    setIsDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (startY.current === null) return;
    const delta = event.clientY - startY.current;
    if (Math.abs(delta) > 8) moved.current = true;
    setDragY(Math.max(-56, Math.min(0, delta)));
  };

  const finishGesture = () => {
    if (dragY <= -40) {
      onExpand();
    }
    startY.current = null;
    setDragY(0);
    setIsDragging(false);
  };

  const handleActivate = (event: React.MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button')) return;
    if (moved.current) return;
    onExpand();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Buka pemutar ayat"
      onClick={handleActivate}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onExpand();
        }
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishGesture}
      onPointerCancel={finishGesture}
      style={{
        transform: `translateY(${dragY}px)`,
        transition: isDragging ? 'none' : 'transform 240ms cubic-bezier(.22,.61,.36,1)',
      }}
      className="pointer-events-auto relative touch-none select-none overflow-hidden outline-none transition-colors hover:bg-[#1E4C40]/[0.02] focus-visible:ring-2 focus-visible:ring-[#C89B4E]"
    >
      {/* playback progress hairline */}
      <div className="absolute inset-x-0 top-0 h-[2.5px] bg-[#1E4C40]/10">
        <div
          className="h-full rounded-r-full bg-gradient-to-r from-[#C89B4E] to-[#E4C486] transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center gap-2.5 px-3.5 py-2">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-[#15352C] ring-1 ring-[#1E4C40]/10 shadow-xs">
          <Image
            src={reciter.photoUrl}
            alt={reciter.name}
            fill
            sizes="40px"
            className="object-cover object-top"
          />
          {state.isPlaying && (
            <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5 items-end justify-center gap-[1.5px] rounded-full bg-[#1E4C40] px-[2px] pb-[2px]">
              <span className="eq-bar h-1.5 w-[1.5px] rounded-full bg-[#EAD8AF]" />
              <span className="eq-bar h-2 w-[1.5px] rounded-full bg-[#EAD8AF] [animation-delay:120ms]" />
              <span className="eq-bar h-1 w-[1.5px] rounded-full bg-[#EAD8AF] [animation-delay:240ms]" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-[13px] font-extrabold leading-tight tracking-tight text-[#15231E]">
              {track ? `QS. ${track.surahName} · ${track.ayahNumber}` : 'Menyiapkan murottal...'}
            </p>
            {!isPro && (
              <span className="shrink-0 rounded-full bg-[#C89B4E]/15 px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider text-[#9C7330]">
                Streaming
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-[10.5px] font-medium text-[#6B7A72]">
            {reciter.shortName} • Juz {state.activeJuz} • Hlm. {track?.mushafPage ?? 1}
          </p>
        </div>

        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            void togglePlay();
          }}
          aria-label={state.isPlaying ? 'Jeda' : 'Putar'}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1E4C40] text-[#F7EFD9] shadow-[0_8px_20px_-8px_rgba(16,46,39,0.8)] transition hover:bg-[#255D4E] active:scale-95"
        >
          {state.isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : state.isPlaying ? (
            <Pause className="h-3.5 w-3.5 fill-current" />
          ) : (
            <Play className="h-3.5 w-3.5 translate-x-[0.5px] fill-current" />
          )}
        </button>

        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            void nextTrack();
          }}
          aria-label="Ayat berikutnya"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#5C6B63] transition hover:bg-[#1E4C40]/8"
        >
          <SkipForward className="h-4 w-4 fill-current" />
        </button>

        <ChevronUp className="h-4 w-4 shrink-0 text-[#9AA79F]" aria-hidden />
      </div>
    </div>
  );
}
