'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Baby, Calendar, CheckCircle2, Cloud, Loader2, Sparkles, Volume2 } from 'lucide-react';
import { calculateCycleStatus, formatChildAge } from '@/lib/cycle-math';
import { getJuzMeta, RECITERS } from '@/lib/quran-metadata';
import { createChildProfile } from '@/lib/db';
import { syncWithGoogleDrive } from '@/lib/google-drive-sync';

interface OnboardingModalProps {
  onCompleted: () => void;
  isAdditionalChild?: boolean;
  onCancel?: () => void;
}

export function OnboardingModal({
  onCompleted,
  isAdditionalChild = false,
  onCancel,
}: OnboardingModalProps) {
  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState(todayStr);
  const [useCustomStart, setUseCustomStart] = useState(false);
  const [startDate, setStartDate] = useState(todayStr);
  const [reciterId, setReciterId] = useState('al_husary');
  const [isSaving, setIsSaving] = useState(false);
  const [isRestoringCloud, setIsRestoringCloud] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const handleRestoreFromDrive = async () => {
    setIsRestoringCloud(true);
    setRestoreError(null);
    try {
      await syncWithGoogleDrive({ interactive: true });
      onCompleted();
    } catch (err) {
      setRestoreError(
        err instanceof Error ? err.message : 'Gagal memulihkan data dari Google Drive'
      );
    } finally {
      setIsRestoringCloud(false);
    }
  };

  const effectiveStartDate = useCustomStart ? startDate : birthDate;

  const previewCycle = useMemo(() => {
    return calculateCycleStatus(effectiveStartDate);
  }, [effectiveStartDate]);

  const previewJuzMeta = useMemo(() => {
    return getJuzMeta(previewCycle.currentJuz);
  }, [previewCycle.currentJuz]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await createChildProfile({
        name: name.trim(),
        birthDate,
        startDate: effectiveStartDate,
        preferredReciterId: reciterId,
      });
      onCompleted();
    } finally {
      setIsSaving(false);
    }
  };

  const labelClass =
    'mb-1.5 block text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#8A968F]';
  const inputClass =
    'w-full min-h-[48px] rounded-2xl border border-[#1E4C40]/12 bg-[#FFFCF5] px-4 py-3 text-sm font-semibold text-[#15231E] placeholder:text-[#9AA79F] focus:border-[#C89B4E]/60 focus:outline-none focus:ring-2 focus:ring-[#C89B4E]/25';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0B1F1A]/65 p-4 backdrop-blur-md">
      <div className="rise my-auto w-full max-w-md overflow-hidden rounded-[30px] border border-white/30 bg-[#F9F4EA] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.6)]">
        <div className="hero-surface relative overflow-hidden px-6 pb-6 pt-6 text-white">
          <div className="pointer-events-none absolute -right-14 -top-16 h-52 w-52 rounded-full border border-[#EAD8AF]/15" />
          <div className="pointer-events-none absolute -right-4 top-12 h-24 w-24 rounded-full border border-[#EAD8AF]/10" />

          <div className="relative flex items-center justify-between gap-3">
            <div className="inline-flex items-center rounded-2xl bg-[#FFFCF5] px-3 py-2 shadow-sm">
              <Image
                src="/logo-wordmark.png"
                alt="talaQids"
                width={816}
                height={207}
                className="h-5 w-auto"
                priority
              />
            </div>
            <span className="flex items-center gap-1 rounded-full border border-[#EAD8AF]/30 bg-[#EAD8AF]/10 px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-[0.14em] text-[#EAD8AF]">
              <Sparkles className="h-2.5 w-2.5" />
              30 bulan
            </span>
          </div>

          <h2 className="relative mt-4 text-[24px] font-extrabold leading-tight tracking-tight">
            {isAdditionalChild ? 'Tambah profil buah hati' : 'Selamat datang di talaQids'}
          </h2>
          <p className="relative mt-1.5 max-w-[20rem] text-[11px] leading-relaxed text-white/60">
            Pendamping otomatis stimulasi pendengaran Al-Qur&apos;an — satu bulan, satu Juz —
            sejak hari pertama.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div>
            <label className={labelClass} htmlFor="child-name">
              Nama panggilan anak
            </label>
            <div className="relative">
              <Baby className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C89B4E]" />
              <input
                id="child-name"
                type="text"
                required
                placeholder="Contoh: Muhammad Fatih"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="child-birth">
              Tanggal lahir anak
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C89B4E]" />
              <input
                id="child-birth"
                type="date"
                required
                max={todayStr}
                value={birthDate}
                onChange={(e) => {
                  setBirthDate(e.target.value);
                  if (!useCustomStart) setStartDate(e.target.value);
                }}
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[#1E4C40]/10 bg-[#FBF6EC]/80 p-3.5">
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={useCustomStart}
                onChange={(e) => setUseCustomStart(e.target.checked)}
                className="h-4 w-4 rounded accent-[#1E4C40]"
              />
              <span className="text-[11px] font-semibold leading-snug text-[#5C6B63]">
                Mulai program dari tanggal khusus (bukan tanggal lahir)
              </span>
            </label>

            {useCustomStart && (
              <div className="mt-3">
                <label className="mb-1 block text-[9px] font-bold uppercase tracking-[0.14em] text-[#8A968F]">
                  Tanggal mulai siklus Juz 1
                </label>
                <input
                  type="date"
                  required
                  max={todayStr}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-[#C89B4E]/40 bg-[#FFFCF5] px-3 py-2.5 text-sm font-semibold text-[#15231E]"
                />
              </div>
            )}
          </div>

          {/* Live deterministic preview */}
          <div className="rounded-2xl border border-[#1E4C40]/10 bg-[#1E4C40]/5 p-3.5">
            <div className="flex items-center justify-between text-[10px] font-semibold text-[#6B7A72]">
              <span>
                Usia anak: <strong className="text-[#15231E]">{formatChildAge(birthDate)}</strong>
              </span>
              <span>
                Hari <strong className="text-[#1E4C40]">{previewCycle.dayInCurrentCycle}</strong>/30
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-[#1E4C40]/10 pt-2">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8A968F]">
                  Target bulan ke-{previewCycle.currentMonth}
                </p>
                <p className="text-[15px] font-extrabold text-[#1E4C40]">
                  Juz {previewCycle.currentJuz}{' '}
                  <span className="text-[11px] font-semibold text-[#6B7A72]">
                    ({previewJuzMeta.nameTransliteration})
                  </span>
                </p>
              </div>
              <span
                dir="rtl"
                className="font-arabic rounded-xl bg-[#EAD8AF]/60 px-3 py-1 text-2xl text-[#7A5A1F]"
              >
                {previewJuzMeta.nameArabic}
              </span>
            </div>
          </div>

          <div>
            <label className={labelClass}>Qari utama (ramah pendengaran bayi)</label>
            <div className="flex items-center gap-3 rounded-2xl border border-[#1E4C40]/10 bg-[#FFFCF5] p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1E4C40]/8 text-[#1E4C40]">
                <Volume2 className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-extrabold text-[#15231E]">
                  {RECITERS.find((r) => r.id === reciterId)?.name || RECITERS[0].name}
                </p>
                <p className="text-[10px] text-[#8A968F]">
                  {RECITERS.find((r) => r.id === reciterId)?.style || RECITERS[0].style}
                </p>
              </div>
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#2F6B5B]" />
            </div>
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="min-h-[48px] flex-1 rounded-2xl border border-[#1E4C40]/15 bg-[#FFFCF5] text-[12px] font-extrabold text-[#5C6B63] transition hover:bg-[#1E4C40]/5"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="min-h-[48px] flex-1 rounded-2xl bg-[#1E4C40] text-[12px] font-extrabold text-[#F3E7CB] shadow-[0_20px_40px_-24px_rgba(16,46,39,0.9)] transition active:scale-[0.99] disabled:opacity-50"
            >
              {isSaving ? 'Menyimpan...' : "Mulai siklus Al-Qur'an"}
            </button>
          </div>

          {!isAdditionalChild && (
            <div className="border-t border-[#1E4C40]/10 pt-3 text-center">
              <button
                type="button"
                disabled={isRestoringCloud}
                onClick={() => void handleRestoreFromDrive()}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#1E4C40]/8 px-3.5 py-2 text-[10.5px] font-extrabold text-[#1E4C40] transition hover:bg-[#1E4C40]/14 disabled:opacity-60"
              >
                {isRestoringCloud ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Cloud className="h-3.5 w-3.5 text-[#2F6B5B]" />
                )}
                Sudah ada data di HP pasangan? Pulihkan dari Google Drive
              </button>
              {restoreError && (
                <p className="mt-1.5 text-[10px] font-semibold text-[#A03A31]">
                  {restoreError}
                </p>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
