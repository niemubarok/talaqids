'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Check,
  Cloud,
  Compass,
  Crown,
  HeartHandshake,
  Info,
  Loader2,
  Lock,
  LogOut,
  MessageCircle,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserPlus,
  Volume2,
} from 'lucide-react';
import { Pencil } from 'lucide-react';
import { EditChildModal } from '@/components/EditChildModal';
import { updateChildProfile, deleteChildProfile } from '@/lib/db';
import { RECITERS, type Reciter } from '@/lib/quran-metadata';
import { ReciterProfileModal } from '@/components/ReciterProfileModal';
import { GoogleDriveIcon } from '@/components/GoogleDriveIcon';
import {
  activateMuhsininTier,
  db,
  notifyLocalDataMutated,
  type AppSettings,
  type ChildProfile,
} from '@/lib/db';
import {
  disconnectGoogleDrive,
  formatRelativeSyncTime,
} from '@/lib/google-drive-sync';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

interface InfaqSettingsViewProps {
  settings: AppSettings;
  childrenList: ChildProfile[];
  activeChild: ChildProfile;
  onSelectChild: (childId: string) => void;
  onAddChildClick: () => void;
  isSyncingCloud?: boolean;
  cloudError?: string | null;
  onManualSyncCloud?: () => Promise<void>;
  onOpenGuide?: () => void;
}

const INFAQ_OPTIONS = [
  {
    amount: 35000,
    label: 'Rp35.000',
    title: 'Pemeliharaan',
    desc: 'Bantu biaya pemeliharaan aplikasi & domain.',
  },
  {
    amount: 75000,
    label: 'Rp75.000',
    title: 'Disarankan',
    desc: 'Dukungan penuh pengembangan fitur & bandwidth audio.',
    popular: true,
  },
  {
    amount: 150000,
    label: 'Rp150.000+',
    title: 'Wakaf Server',
    desc: 'Pahala jariyah dari setiap ayat yang didengar bayi lain.',
  },
];

export function InfaqSettingsView({
  settings,
  childrenList,
  activeChild,
  onSelectChild,
  onAddChildClick,
  isSyncingCloud = false,
  cloudError = null,
  onManualSyncCloud,
  onOpenGuide,
}: InfaqSettingsViewProps) {
  const { clearPreviousJuzCaches } = useAudioPlayer();
  const [selectedNominal, setSelectedNominal] = useState(75000);
  const [prayerBanner, setPrayerBanner] = useState(false);
  const [cacheClearedMsg, setCacheClearedMsg] = useState<string | null>(null);
  const [selectedProfileReciter, setSelectedProfileReciter] = useState<Reciter | null>(null);
  const [editingChild, setEditingChild] = useState<ChildProfile | null>(null);

  const handleHonorActivation = async () => {
    await activateMuhsininTier(selectedNominal);
    setPrayerBanner(true);
  };

  const handleSelectReciter = async (reciterId: string, isProReciter: boolean) => {
    if (isProReciter && !settings.isProUser) return;
    await db.children.update(activeChild.id, {
      preferredReciterId: reciterId,
      updatedAt: new Date().toISOString(),
    });
    notifyLocalDataMutated();
  };

  const handleDisconnectDrive = async () => {
    await disconnectGoogleDrive();
  };

  const handleCleanOldCache = async () => {
    const count = await clearPreviousJuzCaches();
    setCacheClearedMsg(
      count > 0
        ? `${count} cache Juz bulan sebelumnya berhasil dibersihkan.`
        : 'Penyimpanan sudah bersih (hanya Juz aktif yang tersimpan).'
    );
  };

  const whatsappUrl = `https://wa.me/6285524914191?text=${encodeURIComponent(
    `Assalamu'alaikum Admin talaQids, saya telah berinfaq sebesar Rp${selectedNominal.toLocaleString(
      'id-ID'
    )} untuk mendukung dakwah aplikasi talaQids (Anak: ${activeChild.name}). Mohon doa keberkahannya.`
  )}`;

  return (
    <div className="space-y-4">
      {/* ── Muhsinin / Tier hero ────────────────────────────────────── */}
      <section
        id="infaq-section"
        className={`rise relative overflow-hidden rounded-[30px] p-5 transition-colors ${
          settings.isProUser
            ? 'gold-gradient border border-[#C89B4E]/45 text-[#12211C] shadow-[0_32px_70px_-42px_rgba(156,115,48,0.65)]'
            : 'hero-surface ring-line text-white shadow-[0_36px_80px_-46px_rgba(13,40,34,0.85)]'
        }`}
      >
        <div
          className={`pointer-events-none absolute -right-14 -top-16 h-52 w-52 rounded-full border ${
            settings.isProUser ? 'border-[#1E4C40]/15' : 'border-[#EAD8AF]/20'
          }`}
        />
        <div
          className={`pointer-events-none absolute -right-2 top-10 h-24 w-24 rounded-full border ${
            settings.isProUser ? 'border-[#1E4C40]/10' : 'border-[#EAD8AF]/15'
          }`}
        />

        <div
          className={`relative inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.16em] ${
            settings.isProUser
              ? 'bg-[#1E4C40] text-[#F7EFD9]'
              : 'bg-[#EAD8AF] text-[#15231E]'
          }`}
        >
          <Crown
            className={`h-3 w-3 ${settings.isProUser ? 'text-[#EAD8AF]' : 'text-[#1E4C40]'}`}
          />
          {settings.isProUser ? 'Tier Muhsinin Aktif' : 'Free Tier'}
        </div>

        <h2
          className={`relative mt-3 max-w-[16rem] text-[24px] font-extrabold leading-[1.15] tracking-tight ${
            settings.isProUser ? 'text-[#12211C]' : 'text-[#FFFCF5]'
          }`}
        >
          Tumbuhkan cinta Al-Qur&apos;an sejak dini.
        </h2>
        <p
          className={`relative mt-2 max-w-[20rem] text-[11.5px] font-semibold leading-relaxed ${
            settings.isProUser ? 'text-[#1F352D]' : 'text-[#F3E7CB]/95'
          }`}
        >
          Seluruh 30 Juz terbuka gratis, tanpa iklan, tanpa paywall ayat. Infaq sukarela Anda
          menjaga server tetap hidup dan membuka fitur ekstra Tier Muhsinin.
        </p>

        <div className="relative mt-4 flex flex-wrap gap-1.5">
          {(settings.isProUser
            ? ['30 Juz terbuka', 'Tanpa iklan', 'Audio offline aktif', 'Sinkronisasi Cloud']
            : ['30 Juz terbuka', 'Tanpa iklan', 'Streaming online']
          ).map((item) => (
            <span
              key={item}
              className={`rounded-full px-2.5 py-1 text-[9.5px] font-extrabold ${
                settings.isProUser
                  ? 'bg-[#FFFCF5]/90 text-[#15231E] ring-1 ring-[#1E4C40]/20'
                  : 'bg-white/15 text-[#FFFCF5] ring-1 ring-white/25'
              }`}
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      {prayerBanner && (
        <div className="surface rise border-[#2F6B5B]/25 p-4">
          <p className="flex items-center gap-2 text-[12px] font-extrabold text-[#1E4C40]">
            <HeartHandshake className="h-4 w-4 text-[#2F6B5B]" />
            Jazakumullahu Khairan Katsiran
          </p>
          <p dir="rtl" className="mt-2 text-right font-arabic text-lg leading-loose text-[#1E4C40]">
            آجَرَكَ اللَّهُ فِيمَا أَعْطَيْتَ، وَبَارَكَ فِيمَا أَبْقَيْتَ
          </p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-[#6B7A72]">
            &ldquo;Semoga Allah memberi pahala atas apa yang engkau berikan dan memberkahi harta
            yang engkau sisakan.&rdquo; Seluruh fitur <strong>Muhsinin</strong> kini aktif.
          </p>
        </div>
      )}

      {/* ── Children profiles ───────────────────────────────────────── */}
      <section className="surface rise p-4 [animation-delay:60ms]">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-[#8A968F]">
              Profil
            </p>
            <h3 className="mt-0.5 text-[15px] font-extrabold tracking-tight text-[#15231E]">
              Buah hati
            </h3>
          </div>
          {(settings.isProUser || childrenList.length < 1) && childrenList.length < 5 && (
            <button
              type="button"
              onClick={onAddChildClick}
              className="flex items-center gap-1 rounded-full bg-[#1E4C40] px-3 py-1.5 text-[10px] font-extrabold text-[#F3E7CB] transition active:scale-95"
            >
              <UserPlus className="h-3 w-3" />
              Tambah
            </button>
          )}
        </div>

        <p className="mt-1 text-[10px] text-[#8A968F]">
          {settings.isProUser
            ? `Tier Muhsinin · ${childrenList.length}/5 profil`
            : 'Free tier · maksimal 1 profil anak'}
        </p>

        <div className="mt-3 space-y-1.5">
          {childrenList.map((item) => {
            const isSelected = item.id === activeChild.id;
            return (
              <div
                key={item.id}
                className={`flex w-full items-center justify-between gap-2 rounded-2xl border p-2.5 transition ${
                  isSelected
                    ? 'border-[#1E4C40]/30 bg-[#1E4C40]/5'
                    : 'border-[#1E4C40]/8 bg-[#FBF6EC]/60 hover:bg-[#F6F0E4]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectChild(item.id)}
                  className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-extrabold ${
                      isSelected
                        ? 'bg-[#1E4C40] text-[#F3E7CB]'
                        : 'bg-[#F6F0E4] text-[#6B7A72]'
                    }`}
                  >
                    {item.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-extrabold text-[#15231E]">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-[#8A968F]">Lahir {item.birthDate}</p>
                  </div>
                </button>

                <div className="flex shrink-0 items-center gap-1.5">
                  {isSelected && (
                    <span className="rounded-full bg-[#1E4C40]/10 px-2 py-0.5 text-[9px] font-extrabold text-[#1E4C40]">
                      Aktif
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setEditingChild(item)}
                    title={`Edit profil ${item.name}`}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1E4C40]/8 text-[#1E4C40] transition hover:bg-[#1E4C40]/15"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Reciters ────────────────────────────────────────────────── */}
      <section className="surface rise p-4 [animation-delay:90ms]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#1E4C40]/8 text-[#1E4C40]">
              <Volume2 className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-[#8A968F]">
                Qari Murottal
              </p>
              <h3 className="text-[13px] font-extrabold text-[#15231E]">Pilihan murottal talaqqi</h3>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-[#8A968F]">
            Ketuk &apos;Profil&apos; untuk biografi
          </span>
        </div>

        <div className="mt-3 space-y-2">
          {RECITERS.map((reciter) => {
            const isSelected = activeChild.preferredReciterId === reciter.id;
            const locked = reciter.isPro && !settings.isProUser;
            return (
              <div
                key={reciter.id}
                className={`group flex items-center justify-between gap-3 rounded-2xl border p-2.5 transition ${
                  isSelected
                    ? 'border-[#C89B4E]/70 bg-[#C89B4E]/10 ring-1 ring-[#C89B4E]/30'
                    : locked
                      ? 'border-[#1E4C40]/8 bg-[#FBF6EC]/60 opacity-70'
                      : 'border-[#1E4C40]/8 bg-[#FFFCF5] hover:bg-[#FBF6EC]'
                }`}
              >
                {/* Clickable selector part */}
                <button
                  type="button"
                  onClick={() => {
                    if (locked) {
                      setSelectedProfileReciter(reciter);
                      return;
                    }
                    void handleSelectReciter(reciter.id, reciter.isPro);
                  }}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[#1E4C40]/15 bg-[#15352C] shadow-xs">
                    <Image
                      src={reciter.photoUrl}
                      alt={reciter.name}
                      fill
                      sizes="48px"
                      className="object-cover object-top"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-[12px] font-extrabold text-[#15231E]">
                        {reciter.name}
                      </p>
                    </div>
                    <p className="truncate text-[10px] text-[#6B7A72]">
                      {reciter.style} · {reciter.bitrate}
                    </p>
                    <p className="truncate text-[9px] font-semibold text-[#8A968F]">
                      {reciter.origin} · {reciter.period}
                    </p>
                  </div>
                </button>

                {/* Actions & status */}
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedProfileReciter(reciter)}
                    title={`Lihat profil ${reciter.name}`}
                    className="flex h-8 items-center gap-1 rounded-xl border border-[#1E4C40]/10 bg-white/90 px-2 text-[10px] font-bold text-[#1E4C40] transition hover:bg-[#1E4C40]/8 active:scale-95"
                  >
                    <Info className="h-3.5 w-3.5 text-[#2F6B5B]" />
                    <span>Profil</span>
                  </button>

                  {isSelected ? (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1E4C40] text-[#F3E7CB]">
                      <Check className="h-4 w-4" />
                    </span>
                  ) : locked ? (
                    <button
                      type="button"
                      onClick={() => setSelectedProfileReciter(reciter)}
                      className="shrink-0 rounded-full bg-[#C89B4E]/15 px-2 py-0.5 text-[9px] font-extrabold text-[#9C7330]"
                    >
                      Muhsinin
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Infaq ───────────────────────────────────────────────────── */}
      <section className="surface rise p-4 [animation-delay:120ms]">
        <p className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-[#C89B4E]">
          Infaq kejujuran
        </p>
        <h3 className="mt-0.5 text-[15px] font-extrabold tracking-tight text-[#15231E]">
          Pilih nominal terbaik
        </h3>

        <div className="mt-3 space-y-2">
          {INFAQ_OPTIONS.map((option) => {
            const isSelected = selectedNominal === option.amount;
            return (
              <button
                key={option.amount}
                type="button"
                onClick={() => setSelectedNominal(option.amount)}
                className={`relative w-full rounded-2xl border p-3.5 text-left transition ${
                  isSelected
                    ? 'border-[#1E4C40]/40 bg-[#1E4C40]/5 ring-1 ring-[#1E4C40]/20'
                    : 'border-[#1E4C40]/8 bg-[#FFFCF5] hover:bg-[#FBF6EC]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[15px] font-extrabold tracking-tight text-[#1E4C40]">
                    {option.label}
                  </span>
                  {option.popular ? (
                    <span className="rounded-full bg-[#C89B4E] px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.12em] text-[#2A2110]">
                      Terfavorit
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-[#9AA79F]">{option.title}</span>
                  )}
                </div>
                <p className="mt-1 text-[10px] leading-relaxed text-[#6B7A72]">{option.desc}</p>
              </button>
            );
          })}
        </div>

        {/* QRIS */}
        <div className="mt-3 rounded-2xl border border-dashed border-[#1E4C40]/20 bg-[#FBF6EC]/70 p-4 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#1E4C40]/10 bg-[#FFFCF5] px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-[0.12em] text-[#1E4C40]">
            <QrCode className="h-3 w-3 text-[#C89B4E]" />
            QRIS Statis · Yayasan talaQids
          </div>

          <div className="mx-auto mt-3 flex h-40 w-40 items-center justify-center rounded-2xl border border-[#1E4C40]/10 bg-white p-3 shadow-[0_18px_35px_-30px_rgba(16,46,39,0.8)]">
            <svg viewBox="0 0 120 120" className="h-full w-full text-[#1E4C40]" aria-hidden>
              <rect x="8" y="8" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="6" />
              <rect x="18" y="18" width="12" height="12" fill="currentColor" />
              <rect x="80" y="8" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="6" />
              <rect x="90" y="18" width="12" height="12" fill="currentColor" />
              <rect x="8" y="80" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="6" />
              <rect x="18" y="90" width="12" height="12" fill="currentColor" />
              <rect x="48" y="16" width="8" height="8" fill="currentColor" />
              <rect x="60" y="28" width="8" height="16" fill="currentColor" />
              <rect x="48" y="48" width="24" height="24" rx="5" fill="#C89B4E" />
              <rect x="16" y="52" width="16" height="8" fill="currentColor" />
              <rect x="84" y="52" width="20" height="8" fill="currentColor" />
              <rect x="52" y="84" width="16" height="20" fill="currentColor" />
              <rect x="80" y="80" width="12" height="12" fill="currentColor" />
              <rect x="96" y="96" width="16" height="16" fill="currentColor" />
            </svg>
          </div>

          <p className="mt-2.5 text-[9px] leading-relaxed text-[#8A968F]">
            Scan dengan GoPay, OVO, Dana, ShopeePay, BSI Mobile, atau m-Banking apa pun.
          </p>
        </div>

        <div className="mt-3 space-y-2">
          <button
            type="button"
            onClick={() => void handleHonorActivation()}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-[#1E4C40] text-[12px] font-extrabold text-[#F3E7CB] shadow-[0_20px_40px_-24px_rgba(16,46,39,0.9)] transition active:scale-[0.99]"
          >
            <HeartHandshake className="h-4 w-4" />
            Saya sudah berinfaq, buka Muhsinin
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border border-[#1E4C40]/15 bg-[#FFFCF5] text-[11px] font-extrabold text-[#1E4C40] transition hover:bg-[#1E4C40]/5"
          >
            <MessageCircle className="h-4 w-4 text-[#2F6B5B]" />
            Konfirmasi bukti via WhatsApp
          </a>
        </div>
      </section>

      {/* ── Storage & User-Owned Cloud Sync (Google Drive appDataFolder) ── */}
      <section className="surface rise space-y-3.5 p-4 [animation-delay:150ms]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="mt-0.5 text-[14px] font-extrabold text-[#15231E]">
                Sinkronisasi HP Ayah &amp; Bunda
              </h3>
              {!settings.isProUser && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#C89B4E]/15 px-2 py-0.5 text-[9px] font-extrabold text-[#9C7330]">
                  <Lock className="h-2.5 w-2.5" />
                  Muhsinin
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[10px] leading-relaxed text-[#6B7A72]">
              Data disimpan di folder tersembunyi Google Drive pribadi Anda (<code className="font-mono text-[9.5px] text-[#1E4C40]">talaqids_data.json</code>). Privasi terjaga 100%.
            </p>
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#FFFCF5] shadow-xs ring-1 ring-[#1E4C40]/10">
            <div className="relative flex items-center justify-center">
              <GoogleDriveIcon className="h-5 w-5 shrink-0" />
              {!settings.isProUser && (
                <span className="absolute -bottom-1 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#C89B4E] text-[#15231E] shadow-xs ring-1 ring-[#FFFCF5]">
                  <Lock className="h-2 w-2 stroke-[2.8]" />
                </span>
              )}
            </div>
          </span>
        </div>

        <div
          className={`rounded-2xl p-3 ring-1 ${
            settings.isProUser
              ? 'bg-[#F6F0E4]/80 ring-[#1E4C40]/8'
              : 'bg-[#FBF6EC]/60 opacity-75 ring-[#C89B4E]/20'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold text-[#15231E]">
                {!settings.isProUser
                  ? 'Fitur Terkunci (Khusus Tier Muhsinin)'
                  : settings.googleDriveEmail
                    ? `Terhubung: ${settings.googleDriveEmail}`
                    : settings.googleDriveLastSyncedAt
                      ? 'Terhubung ke Google Drive'
                      : 'Belum terhubung ke Google Drive'}
              </p>
              <p className="mt-0.5 text-[9.5px] font-semibold text-[#6B7A72]">
                {!settings.isProUser
                  ? 'Aktifkan Tier Muhsinin di atas untuk sinkronisasi otomatis antar perangkat'
                  : `Terakhir sinkron: ${formatRelativeSyncTime(settings.googleDriveLastSyncedAt)}`}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={!settings.isProUser || isSyncingCloud}
                onClick={() => void onManualSyncCloud?.()}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-extrabold shadow-sm transition ${
                  settings.isProUser
                    ? 'bg-[#1E4C40] text-[#F3E7CB] hover:bg-[#163a31] active:scale-95 disabled:opacity-60'
                    : 'cursor-not-allowed bg-[#C89B4E]/20 text-[#9C7330]'
                }`}
              >
                <div className="relative flex shrink-0 items-center justify-center">
                  <GoogleDriveIcon className="h-3.5 w-3.5 shrink-0" />
                  {!settings.isProUser ? (
                    <span className="absolute -bottom-1 -right-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-[#C89B4E] text-[#15231E] ring-1 ring-white">
                      <Lock className="h-1.5 w-1.5 stroke-[2.8]" />
                    </span>
                  ) : isSyncingCloud ? (
                    <span className="absolute -bottom-1 -right-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-[#1E4C40] text-white">
                      <Loader2 className="h-1.5 w-1.5 animate-spin" />
                    </span>
                  ) : null}
                </div>
                {!settings.isProUser
                  ? 'Terkunci'
                  : isSyncingCloud
                    ? 'Menyinkronkan...'
                    : settings.googleDriveLastSyncedAt
                      ? 'Sinkronkan'
                      : 'Hubungkan Google Drive'}
              </button>

              {settings.isProUser && (settings.googleDriveEmail || settings.googleDriveLastSyncedAt) && (
                <button
                  type="button"
                  onClick={() => void handleDisconnectDrive()}
                  title="Putuskan akun Google Drive"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[#B4483D]/10 text-[#A03A31] transition hover:bg-[#B4483D]/20"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-between border-t border-[#1E4C40]/8 pt-2 text-[9.5px] text-[#6B7A72]">
            <span className="flex items-center gap-1 font-semibold">
              <ShieldCheck className="h-3 w-3 text-[#2F6B5B]" />
              Folder khusus aplikasi (<code className="font-mono">appDataFolder</code>) — tidak mencampuri file Drive Anda
            </span>
          </div>

          {cloudError && (
            <p className="mt-2 rounded-xl bg-[#B4483D]/10 p-2 text-[10px] font-semibold text-[#A03A31]">
              {cloudError}
            </p>
          )}
        </div>

        <div className="flex items-start justify-between gap-3 border-t border-[#1E4C40]/8 pt-3">
          <div>
            <p className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-[#8A968F]">
              Penyimpanan Lokal
            </p>
            <h3 className="mt-0.5 text-[13px] font-extrabold text-[#15231E]">Cache offline</h3>
            <p className="mt-0.5 text-[10px] leading-relaxed text-[#8A968F]">
              Bersihkan audio Juz bulan sebelumnya untuk menghemat memori.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleCleanOldCache()}
            className="flex shrink-0 items-center gap-1 rounded-full bg-[#B4483D]/8 px-2.5 py-1.5 text-[9px] font-extrabold text-[#A03A31] transition hover:bg-[#B4483D]/12"
          >
            <Trash2 className="h-3 w-3" />
            Bersihkan
          </button>
        </div>
        {cacheClearedMsg && (
          <p className="mt-2 rounded-xl bg-[#2F6B5B]/10 p-2.5 text-[10px] font-semibold text-[#1E4C40]">
            {cacheClearedMsg}
          </p>
        )}
      </section>

      {/* ── Bantuan & Panduan Aplikasi ── */}
      {onOpenGuide && (
        <section className="surface rise p-4 [animation-delay:180ms]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#C89B4E]/15 text-[#8A6220]">
                <Compass className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-[12px] font-extrabold text-[#15231E]">
                  Panduan Fitur Aplikasi (Tour)
                </h3>
                <p className="text-[10px] text-[#6B7A72]">
                  Pelajari siklus 30 juz, volume aman bayi, mushaf, dan sinkronisasi.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenGuide}
              className="shrink-0 rounded-full border border-[#1E4C40]/15 bg-[#FFFCF5] px-3.5 py-1.5 text-[10.5px] font-extrabold text-[#1E4C40] shadow-xs transition hover:bg-[#1E4C40]/8 active:scale-95"
            >
              Mulai Tur
            </button>
          </div>
        </section>
      )}

      {/* ── Reciter Profile Modal ────────────────────────────────────── */}
      <ReciterProfileModal
        reciter={selectedProfileReciter}
        activeReciterId={activeChild.preferredReciterId}
        isProUser={settings.isProUser}
        onClose={() => setSelectedProfileReciter(null)}
        onSelectReciter={(r) => void handleSelectReciter(r.id, r.isPro)}
        onUnlockRequest={() => {
          const el = document.getElementById('infaq-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* ── Edit Child Modal ─────────────────────────────────────────── */}
      {editingChild && (
        <EditChildModal
          child={editingChild}
          canDelete={childrenList.length > 1}
          onSave={async (updated) => {
            await updateChildProfile(editingChild.id, updated);
          }}
          onDelete={async () => {
            await deleteChildProfile(editingChild.id);
          }}
          onClose={() => setEditingChild(null)}
        />
      )}
    </div>
  );
}
