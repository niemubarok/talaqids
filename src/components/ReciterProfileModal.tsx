'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import {
  Award,
  Check,
  CheckCircle2,
  Globe2,
  Lock,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import { RECITERS, type Reciter } from '@/lib/quran-metadata';

interface ReciterProfileModalProps {
  reciter: Reciter | null;
  activeReciterId?: string;
  isProUser?: boolean;
  onClose: () => void;
  onSelectReciter?: (reciter: Reciter) => void;
  onUnlockRequest?: () => void;
}

export function ReciterProfileModal({
  reciter,
  activeReciterId,
  isProUser = false,
  onClose,
  onSelectReciter,
  onUnlockRequest,
}: ReciterProfileModalProps) {
  const [mounted, setMounted] = useState(false);
  const [viewedReciter, setViewedReciter] = useState<Reciter | null>(reciter);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setViewedReciter(reciter);
  }, [reciter]);

  useEffect(() => {
    if (!viewedReciter) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewedReciter, onClose]);

  // Lock background scrolling when modal is open
  useEffect(() => {
    if (!viewedReciter) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [viewedReciter]);

  if (!mounted || !viewedReciter) return null;

  const isSelected = activeReciterId === viewedReciter.id;
  const isLocked = viewedReciter.isPro && !isProUser;

  const modalContent = (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-[#0D1E19]/75 p-0 backdrop-blur-xs sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reciter-profile-title"
    >
      <div
        className="relative flex max-h-[90dvh] w-full max-w-[440px] flex-col overflow-hidden rounded-t-[30px] border border-[#1E4C40]/15 bg-[#FFFCF5] shadow-[0_-24px_64px_rgba(13,30,25,0.4)] sm:rounded-[30px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Hero Banner (Fixed at top of modal) */}
        <div className="hero-surface relative shrink-0 overflow-hidden px-5 pb-4 pt-5 text-white">
          <div className="pointer-events-none absolute -right-12 -top-14 h-44 w-44 rounded-full border border-[#EAD8AF]/15" />
          <div className="pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-[#C89B4E]/15 blur-2xl" />

          <div className="relative flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-[0.18em] text-[#EAD8AF] ring-1 ring-white/15">
              <Award className="h-3 w-3 text-[#C89B4E]" />
              Profil Qari Murottal
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup profil qari"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/85 transition hover:bg-white/20 active:scale-95"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Reciter Switcher Thumbnails (Scrollbar completely hidden) */}
          <div
            className="no-scrollbar relative mt-3 flex items-center gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {RECITERS.map((item) => {
              const activeTab = item.id === viewedReciter.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setViewedReciter(item)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full p-1 pr-2.5 text-left transition ${
                    activeTab
                      ? 'bg-[#EAD8AF] text-[#12211C] shadow-xs'
                      : 'bg-white/10 text-white/80 hover:bg-white/15'
                  }`}
                >
                  <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full border border-white/25">
                    <Image
                      src={item.photoUrl}
                      alt={item.name}
                      fill
                      sizes="20px"
                      className="object-cover"
                    />
                  </div>
                  <span className="text-[10px] font-extrabold">
                    {item.shortName.replace('Syaikh ', '')}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Main Portrait & Identity */}
          <div className="relative mt-3.5 flex items-start gap-3.5">
            <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-2xl border-2 border-[#EAD8AF]/80 bg-[#15352C] shadow-[0_12px_28px_rgba(0,0,0,0.35)]">
              <Image
                src={viewedReciter.photoUrl}
                alt={viewedReciter.name}
                fill
                sizes="72px"
                className="object-cover object-top"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p
                dir="rtl"
                className="font-arabic text-right text-base leading-snug text-[#EAD8AF]"
              >
                {viewedReciter.arabicName}
              </p>
              <h3
                id="reciter-profile-title"
                className="mt-0.5 text-[14px] font-extrabold leading-snug text-white"
              >
                {viewedReciter.name}
              </h3>
              <p className="mt-0.5 text-[10.5px] font-semibold leading-relaxed text-[#EAD8AF]/90">
                {viewedReciter.roleTitle}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[9px] font-bold text-white/80">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5">
                  <Globe2 className="h-2.5 w-2.5 text-[#EAD8AF]" />
                  {viewedReciter.origin}
                </span>
                <span className="rounded-full bg-white/10 px-2 py-0.5">
                  {viewedReciter.period}
                </span>
                <span className="rounded-full bg-[#C89B4E]/25 px-2 py-0.5 text-[#EAD8AF]">
                  {viewedReciter.bitrate}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Body Content with generous bottom clearance */}
        <div className="no-scrollbar flex-1 space-y-3.5 overflow-y-auto p-5 pb-12 sm:pb-8">
          {/* Style badge */}
          <div className="flex items-center justify-between rounded-2xl border border-[#1E4C40]/10 bg-[#FBF6EC] px-3.5 py-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#1E4C40]/10 text-[#1E4C40]">
                <Volume2 className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#8A968F]">
                  Gaya Lantunan
                </p>
                <p className="text-[11.5px] font-extrabold text-[#15231E]">
                  {viewedReciter.style}
                </p>
              </div>
            </div>
            {viewedReciter.isPro ? (
              <span className="rounded-full bg-[#C89B4E]/18 px-2.5 py-0.5 text-[9.5px] font-extrabold text-[#9C7330]">
                Qari Muhsinin
              </span>
            ) : (
              <span className="rounded-full bg-[#2F6B5B]/15 px-2.5 py-0.5 text-[9.5px] font-extrabold text-[#1E4C40]">
                Qari Utama (Gratis)
              </span>
            )}
          </div>

          {/* Biografi Singkat */}
          <div className="rounded-2xl border border-[#1E4C40]/10 bg-white p-3.5">
            <p className="text-[9.5px] font-extrabold uppercase tracking-[0.16em] text-[#8A968F]">
              Biografi & Riwayat Keilmuan
            </p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-[#3F4E47]">
              {viewedReciter.bio}
            </p>
          </div>

          {/* Manfaat Stimulasi Auditori Bayi */}
          <div className="rounded-2xl border border-[#C89B4E]/35 bg-[#C89B4E]/10 p-3.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#9C7330]" />
              <p className="text-[9.5px] font-extrabold uppercase tracking-[0.16em] text-[#7A5A1F]">
                Manfaat Stimulasi Pendengaran Anak
              </p>
            </div>
            <p className="mt-1.5 text-[11.5px] leading-relaxed font-medium text-[#3F3116]">
              {viewedReciter.methodologyNote}
            </p>
          </div>

          {/* Karakteristik Utama */}
          <div className="rounded-2xl border border-[#1E4C40]/10 bg-white p-3.5">
            <p className="text-[9.5px] font-extrabold uppercase tracking-[0.16em] text-[#8A968F]">
              Karakteristik Audio & Tajwid
            </p>
            <ul className="mt-2 space-y-1.5">
              {viewedReciter.characteristics.map((point, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-[11.5px] leading-snug text-[#15231E]"
                >
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2F6B5B]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Footer (with extra padding at the bottom for thumb reach) */}
          <div className="pt-2 pb-6 sm:pb-2">
            {isSelected ? (
              <div className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-2xl border border-[#1E4C40]/20 bg-[#1E4C40]/10 px-4 py-2.5 text-xs font-extrabold text-[#1E4C40]">
                <Check className="h-4 w-4" />
                Qari Aktif Saat Ini
              </div>
            ) : isLocked ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onUnlockRequest?.();
                }}
                className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-2xl gold-gradient px-4 py-2.5 text-xs font-extrabold text-[#12211C] shadow-sm transition active:scale-[0.99]"
              >
                <Lock className="h-3.5 w-3.5" />
                Aktifkan Apresiasi Muhsinin untuk Memilih Qari Ini
              </button>
            ) : onSelectReciter ? (
              <button
                type="button"
                onClick={() => {
                  onSelectReciter(viewedReciter);
                  onClose();
                }}
                className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-2xl bg-[#1E4C40] px-4 py-2.5 text-xs font-extrabold text-[#F3E7CB] shadow-sm transition hover:bg-[#163A30] active:scale-[0.99]"
              >
                <Check className="h-4 w-4" />
                Pilih {viewedReciter.shortName}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
