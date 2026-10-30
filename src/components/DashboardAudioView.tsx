'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Headphones,
  Pause,
  Play,
  Repeat,
  Sliders,
  Sparkles,
  Users,
} from 'lucide-react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { getJuzMeta, RECITERS, SURAHS, type Reciter } from '@/lib/quran-metadata';
import { ReciterProfileModal } from '@/components/ReciterProfileModal';
import {
  computeParentRoleCounts,
  type ChildProfile,
  type DailyProgress,
} from '@/lib/db';
import { calculateCycleStatus, type CycleStatus } from '@/lib/cycle-math';

interface DashboardAudioViewProps {
  child: ChildProfile;
  cycle: CycleStatus;
  progressToday: DailyProgress | undefined;
  allProgress?: DailyProgress[];
  isPro: boolean;
  onOpenMushaf: () => void;
  onOverrideJuz: (newJuz: number | null) => void;
  onOpenInfaq: () => void;
  onOpenPlayer: () => void;
}

export function DashboardAudioView({
  child,
  cycle,
  progressToday,
  allProgress = [],
  isPro,
  onOpenMushaf,
  onOverrideJuz,
  onOpenInfaq,
  onOpenPlayer,
}: DashboardAudioViewProps) {
  const { state, restartFromBeginning, togglePlay } = useAudioPlayer();

  const [showOverrideMenu, setShowOverrideMenu] = useState(false);
  const [showReciterProfile, setShowReciterProfile] = useState(false);

  const juzMeta = getJuzMeta(cycle.currentJuz);
  const startSurah = SURAHS[juzMeta.startSurah];
  const endSurah = SURAHS[juzMeta.endSurah];
  const dayProgress = Math.min(100, (cycle.dayInCurrentCycle / 30) * 100);
  const ringCircumference = 2 * Math.PI * 38;
  const nextJuz = (cycle.currentJuz % 30) + 1;
  const pagesDone = progressToday?.pagesCompleted.length || 0;
  const listenToday = Math.round(progressToday?.listenMinutes || 0);
  const dailyTargetMinutes = 45;
  const listenTodayPct = Math.min(100, Math.round((listenToday / dailyTargetMinutes) * 100));
  const reciter = RECITERS.find((item) => item.id === state.reciterId) ?? RECITERS[0];

  const totalListenMinutes = Math.round(
    allProgress.reduce((acc, curr) => acc + (curr.listenMinutes || 0), 0)
  );
  const totalCompletedPagesCount = allProgress.reduce(
    (acc, curr) => acc + (curr.pagesCompleted?.length || 0),
    0
  );
  const activeDaysCount = allProgress.filter(
    (item) => (item.listenMinutes || 0) > 0 || (item.pagesCompleted?.length || 0) > 0
  ).length;

  const roleCounts = computeParentRoleCounts(allProgress);

  return (
    <div className="space-y-4">
      {/* ── Siklus hero ─────────────────────────────────────────────── */}
      <section className="rise relative overflow-hidden rounded-[30px] hero-surface p-5 text-white shadow-[0_36px_80px_-46px_rgba(16,46,39,0.95)]">
        <div className="pointer-events-none absolute -right-14 -top-20 h-56 w-56 rounded-full border border-[#EAD8AF]/15" />
        <div className="pointer-events-none absolute -right-4 top-8 h-28 w-28 rounded-full border border-[#EAD8AF]/10" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-[#C89B4E]/10 blur-2xl" />

        <div className="relative flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold tracking-wide ring-1 ring-white/15">
            <span className="h-1.5 w-1.5 rounded-full bg-[#EAD8AF]" />
            Bulan {cycle.currentMonth} · Hari {cycle.dayInCurrentCycle}/30
          </div>
          {isPro && (
            <span className="rounded-full bg-[#C89B4E]/25 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#F0DDB4] ring-1 ring-[#EAD8AF]/30">
              Muhsinin
            </span>
          )}
        </div>

        <div className="relative mt-4 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#EAD8AF]/70">
              Assalamu&apos;alaikum
            </p>
            <h1 className="mt-1 truncate text-[26px] font-extrabold leading-tight tracking-tight">
              {child.name}
            </h1>
            <p className="mt-1 text-[11px] font-medium text-white/60">
              {cycle.isConsolidationPhase
                ? "Fase Muroja'ah · Rotasi Cepat"
                : 'Fase Pengondisian Auditori'}
            </p>
          </div>

          <div className="relative h-[88px] w-[88px] shrink-0">
            <svg viewBox="0 0 96 96" className="h-full w-full -rotate-90" aria-hidden>
              <circle
                cx="48"
                cy="48"
                r="38"
                fill="none"
                stroke="rgba(255,255,255,0.13)"
                strokeWidth="5"
              />
              <circle
                cx="48"
                cy="48"
                r="38"
                fill="none"
                stroke="#E4C486"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${(dayProgress / 100) * ringCircumference} ${ringCircumference}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span dir="rtl" className="font-arabic text-xl leading-none text-[#EAD8AF]">
                {juzMeta.nameArabic}
              </span>
              <span className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.18em] text-white/55">
                Juz {cycle.currentJuz}
              </span>
            </div>
          </div>
        </div>

        <div className="relative mt-5">
          <div className="flex items-center justify-between text-[10px] font-medium text-white/55">
            <span>Progres siklus bulan ini</span>
            <span>{cycle.daysRemainingInMonth} hari menuju Juz {nextJuz}</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#C89B4E] to-[#EAD8AF] transition-all duration-700"
              style={{ width: `${dayProgress}%` }}
            />
          </div>
        </div>

        <div className="relative mt-4 flex items-center justify-between border-t border-white/10 pt-3">
          <div className="flex min-w-0 items-center gap-1.5 text-[10px] font-medium text-white/60">
            {cycle.isManuallyOverridden ? (
              <>
                <Sliders className="h-3.5 w-3.5 shrink-0 text-[#EAD8AF]" />
                <span className="truncate text-[#EAD8AF]">Juz dikunci manual</span>
              </>
            ) : (
              <span className="truncate">Jadwal otomatis berjalan</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowOverrideMenu((value) => !value)}
            className="flex min-h-[32px] shrink-0 items-center gap-1 rounded-full px-2 text-[10px] font-extrabold text-[#EAD8AF] transition hover:bg-white/10"
          >
            {showOverrideMenu ? 'Tutup' : 'Ganti Juz'}
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>

        {showOverrideMenu && (
          <div className="relative mt-2 rounded-2xl bg-[#0B241E]/70 p-3 ring-1 ring-white/10">
            <p className="mb-2 text-[10px] font-semibold text-white/55">
              Pilih Juz yang diputar hari ini
            </p>
            <div className="no-scrollbar grid max-h-36 grid-cols-6 gap-1 overflow-y-auto pr-0.5">
              {Array.from({ length: 30 }, (_, index) => index + 1).map((juzNumber) => (
                <button
                  key={juzNumber}
                  type="button"
                  onClick={() => {
                    onOverrideJuz(juzNumber);
                    setShowOverrideMenu(false);
                  }}
                  className={`flex h-8 items-center justify-center rounded-lg text-[11px] font-bold transition ${
                    cycle.currentJuz === juzNumber
                      ? 'bg-[#E4C486] text-[#15231E]'
                      : 'bg-white/5 text-white/75 hover:bg-white/10'
                  }`}
                >
                  {juzNumber}
                </button>
              ))}
            </div>
            {cycle.isManuallyOverridden && (
              <button
                type="button"
                onClick={() => {
                  onOverrideJuz(null);
                  setShowOverrideMenu(false);
                }}
                className="mt-2 w-full rounded-xl border border-[#EAD8AF]/25 py-2 text-[10px] font-bold text-[#EAD8AF] transition hover:bg-white/5"
              >
                Kembali otomatis (Juz {calculateCycleStatus(child.startDate).currentJuz})
              </button>
            )}
          </div>
        )}
      </section>

      {/* ── Today & Cumulative Stats ────────────────────────────────── */}
      <div className="rise grid grid-cols-2 gap-3 [animation-delay:60ms]">
        <div className="surface p-4">
          <div className="flex items-center justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#1E4C40]/8 text-[#1E4C40]">
              <Headphones className="h-4 w-4" />
            </span>
            <span className="rounded-full bg-[#1E4C40]/8 px-2 py-0.5 text-[9px] font-extrabold text-[#1E4C40]">
              Target {dailyTargetMinutes}m
            </span>
          </div>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8A968F]">
            Simak Hari Ini
          </p>
          <p className="mt-1 text-[26px] font-extrabold leading-none tracking-tight text-[#15231E]">
            {listenToday}
            <span className="ml-1 text-xs font-semibold text-[#8A968F]">menit</span>
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#1E4C40]/10">
            <div
              className="h-full rounded-full bg-[#1E4C40] transition-all duration-500"
              style={{ width: `${listenTodayPct}%` }}
            />
          </div>
          <p className="mt-1.5 text-[10px] font-medium text-[#6B7A72]">
            Total akumulasi: <strong className="font-bold text-[#15231E]">{totalListenMinutes} mnt</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenMushaf}
          className="surface group p-4 text-left transition hover:border-[#C89B4E]/40"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#C89B4E]/15 text-[#9C7330]">
              <BookOpen className="h-4 w-4" />
            </span>
            <span className="flex items-center gap-0.5 text-[9.5px] font-extrabold text-[#9C7330] transition-transform group-hover:translate-x-0.5">
              Buka <ArrowRight className="h-3 w-3" />
            </span>
          </div>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8A968F]">
            Talaqqi Mushaf
          </p>
          <p className="mt-1 text-[26px] font-extrabold leading-none tracking-tight text-[#15231E]">
            {pagesDone}
            <span className="ml-1 text-xs font-semibold text-[#8A968F]">/ 20 hlm</span>
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#1E4C40]/10">
            <div
              className="h-full rounded-full bg-[#C89B4E] transition-all duration-500"
              style={{ width: `${Math.min(100, (pagesDone / 20) * 100)}%` }}
            />
          </div>
          <p className="mt-1.5 text-[10px] font-medium text-[#6B7A72]">
            Total dibacakan: <strong className="font-bold text-[#15231E]">{totalCompletedPagesCount} hlm</strong>
          </p>
        </button>
      </div>

      {/* ── Detail Fokus Juz Aktif ──────────────────────────────────── */}
      <section className="surface rise p-4 [animation-delay:110ms]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[9.5px] font-extrabold uppercase tracking-[0.2em] text-[#C89B4E]">
              Fokus Kurikulum Bulan Ini
            </p>
            <h2 className="mt-0.5 text-base font-extrabold text-[#15231E]">
              Juz {cycle.currentJuz} · {juzMeta.nameTransliteration}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void togglePlay()}
              className="flex items-center gap-1.5 rounded-full bg-[#1E4C40] px-3 py-1.5 text-xs font-bold text-[#F7EFD9] shadow-[0_8px_18px_-6px_rgba(16,46,39,0.7)] transition hover:bg-[#275E50] active:scale-95"
              aria-label={state.isPlaying ? 'Jeda Murottal' : 'Putar Murottal'}
            >
              {state.isPlaying ? (
                <>
                  <Pause className="h-3.5 w-3.5 fill-current" />
                  <span>Jeda</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 translate-x-[0.5px] fill-current" />
                  <span>Putar</span>
                </>
              )}
            </button>
            <span
              dir="rtl"
              className="rounded-xl bg-[#F6F0E4] px-2.5 py-1 font-arabic text-base text-[#1E4C40]"
            >
              {juzMeta.nameArabic}
            </span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="surface-soft px-3 py-2">
            <p className="text-[9px] font-bold uppercase tracking-wider text-[#8A968F]">
              Cakupan Surah
            </p>
            <p className="mt-0.5 truncate text-[11px] font-extrabold text-[#15231E]">
              {startSurah?.name} – {endSurah?.name}
            </p>
            <p className="text-[9.5px] text-[#6B7A72]">
              {juzMeta.surahList.length} surah · {state.tracks.length} ayat
            </p>
          </div>

          <div className="surface-soft px-3 py-2">
            <p className="text-[9px] font-bold uppercase tracking-wider text-[#8A968F]">
              Mushaf Madinah
            </p>
            <p className="mt-0.5 text-[11px] font-extrabold text-[#15231E]">
              Hal. {juzMeta.startPage}–{juzMeta.endPage}
            </p>
            <p className="text-[9.5px] text-[#6B7A72]">20 halaman standar</p>
          </div>

          <button
            type="button"
            onClick={() => setShowReciterProfile(true)}
            className="surface-soft flex items-center gap-2.5 px-3 py-2 text-left transition hover:bg-[#1E4C40]/5 active:scale-98"
          >
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-[#1E4C40]/15 bg-[#15352C] shadow-2xs">
              <Image
                src={reciter.photoUrl}
                alt={reciter.name}
                fill
                sizes="36px"
                className="object-cover object-top"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#8A968F]">
                Qari Murottal
              </p>
              <p className="truncate text-[11px] font-extrabold text-[#15231E]">
                {reciter.shortName}
              </p>
              <p className="truncate text-[9.5px] font-semibold text-[#2F6B5B]">
                Lihat profil &gt;
              </p>
            </div>
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-[#1E4C40]/8 pt-2.5">
          <span className="text-[10px] font-medium text-[#6B7A72]">
            {isPro
              ? `Offline tersimpan: ${state.offlineCachedCount}/${state.tracks.length} ayat`
              : 'Mode pemutaran: Streaming Online'}
          </span>
          <button
            type="button"
            onClick={() => void restartFromBeginning()}
            className="inline-flex items-center gap-1 rounded-full bg-[#1E4C40]/8 px-2.5 py-1 text-[10px] font-extrabold text-[#1E4C40] transition hover:bg-[#1E4C40]/14 active:scale-95"
          >
            <Repeat className="h-3 w-3" />
            Ulang Juz dari Ayat 1
          </button>
        </div>
      </section>

      {/* ── Keterlibatan Orang Tua & Konsistensi ────────────────────── */}
      <section className="surface rise p-4 [animation-delay:150ms]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-[#1E4C40]" />
            <h2 className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#15231E]">
              Kolaborasi Talaqqi Orang Tua
            </h2>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#2F6B5B]/12 px-2.5 py-0.5 text-[9.5px] font-extrabold text-[#1E4C40]">
            <Calendar className="h-3 w-3" />
            {activeDaysCount} hari aktif
          </span>
        </div>

        <p className="mt-1 text-[10.5px] leading-relaxed text-[#6B7A72]">
          Rekap halaman Mushaf yang telah dibacakan langsung kepada {child.name}:
        </p>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="surface-soft p-2.5 text-center">
            <p className="text-[9px] font-bold uppercase tracking-wider text-[#8A968F]">Ibu</p>
            <p className="mt-0.5 text-lg font-extrabold text-[#1E4C40]">{roleCounts.Ibu}</p>
            <p className="text-[9px] text-[#8A968F]">halaman</p>
          </div>
          <div className="surface-soft p-2.5 text-center">
            <p className="text-[9px] font-bold uppercase tracking-wider text-[#8A968F]">Ayah</p>
            <p className="mt-0.5 text-lg font-extrabold text-[#1E4C40]">{roleCounts.Ayah}</p>
            <p className="text-[9px] text-[#8A968F]">halaman</p>
          </div>
          <div className="surface-soft p-2.5 text-center">
            <p className="text-[9px] font-bold uppercase tracking-wider text-[#8A968F]">Bersama</p>
            <p className="mt-0.5 text-lg font-extrabold text-[#1E4C40]">{roleCounts.Bersama}</p>
            <p className="text-[9px] text-[#8A968F]">halaman</p>
          </div>
        </div>
      </section>

      {/* ── Peta Kurikulum 30 Juz ───────────────────────────────────── */}
      <section className="surface rise p-4 [animation-delay:190ms]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9.5px] font-extrabold uppercase tracking-[0.2em] text-[#6B7A72]">
              Peta Perjalanan 30 Bulan
            </p>
            <h2 className="mt-0.5 text-sm font-extrabold text-[#15231E]">
              Progres Siklus 30 Juz
            </h2>
          </div>
          <span className="text-[10px] font-bold text-[#1E4C40]">
            Hari ke-{(cycle.totalDays ?? 0) + 1} / 900
          </span>
        </div>

        <div className="mt-3 grid grid-cols-10 gap-1.5">
          {Array.from({ length: 30 }, (_, idx) => idx + 1).map((juzNum) => {
            const isCurrent = juzNum === cycle.currentJuz;
            const isPassed = juzNum < cycle.currentMonth;
            return (
              <div
                key={juzNum}
                className={`flex h-7 items-center justify-center rounded-lg text-[10px] font-extrabold transition ${
                  isCurrent
                    ? 'bg-[#C89B4E] text-[#15231E] ring-2 ring-[#1E4C40]'
                    : isPassed
                      ? 'bg-[#1E4C40] text-[#F3E7CB]'
                      : 'bg-[#F6F0E4] text-[#8A968F]'
                }`}
                title={`Juz ${juzNum}`}
              >
                {isPassed && !isCurrent ? <CheckCircle2 className="h-3 w-3" /> : juzNum}
              </div>
            );
          })}
        </div>

        <div className="mt-2.5 flex items-center justify-between text-[9.5px] font-semibold text-[#8A968F]">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-[#1E4C40]" /> Selesai ({Math.max(0, cycle.currentMonth - 1)} Juz)
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-[#C89B4E]" /> Aktif (Juz {cycle.currentJuz})
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-[#E5DEC9]" /> Berikutnya ({Math.max(0, 30 - cycle.currentMonth)} Juz)
          </span>
        </div>
      </section>

      {/* ── Phase note ──────────────────────────────────────────────── */}
      <div className="rise surface-soft flex items-start gap-3 p-4 [animation-delay:230ms]">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#1E4C40]/8 text-[#1E4C40]">
          <Sparkles className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[11px] font-extrabold text-[#15231E]">
            {cycle.isConsolidationPhase ? 'Muroja\u2019ah rotasi cepat' : 'Pengondisian auditori'}
          </p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-[#6B7A72]">
            {cycle.isConsolidationPhase
              ? 'Fokus mengulang hafalan yang sudah dikuasai agar melekat kuat sebelum naik ke Juz berikutnya.'
              : 'Anak mendengar murottal satu Juz secara berulang selama 30 hari untuk menumbuhkan kecintaan pada Al-Qur\u2019an.'}
          </p>
        </div>
      </div>

      {/* Reciter Profile Modal */}
      <ReciterProfileModal
        reciter={showReciterProfile ? reciter : null}
        activeReciterId={state.reciterId}
        isProUser={isPro}
        onClose={() => setShowReciterProfile(false)}
        onUnlockRequest={onOpenInfaq}
      />
    </div>
  );
}
