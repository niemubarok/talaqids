'use client';

import React from 'react';
import Image from 'next/image';
import {
  BookOpen,
  Code2,
  ExternalLink,
  Flame,
  Globe2,
  Heart,
  HeartHandshake,
  Info,
  Layers,
  ShieldCheck,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import { QURAN_SOURCES } from '@/lib/quran-api';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInfaq?: () => void;
}

export function AboutModal({ isOpen, onClose, onOpenInfaq }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0B1F1A]/70 p-4 backdrop-blur-md"
    >
      <div className="rise my-auto w-full max-w-lg overflow-hidden rounded-[28px] border border-[#C89B4E]/30 bg-[#FFFDF9] shadow-[0_30px_90px_-25px_rgba(11,31,26,0.6)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E4C40]/8 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#1E4C40]/10 text-[#1E4C40]">
              <Info className="h-4 w-4" />
            </span>
            <div>
              <h2 id="about-modal-title" className="text-[15px] font-extrabold text-[#15231E]">
                Tentang talaQids
              </h2>
              <p className="text-[10px] text-[#6B7A72]">
                Siklus 30 Bulan Khatam Al-Qur&apos;an untuk Generasi Qur&apos;ani
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E4C40]/6 text-[#1E4C40] transition hover:bg-[#1E4C40]/14 active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[75vh] space-y-4 overflow-y-auto p-5 text-[#15231E]">
          {/* Hero Branding */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1E4C40] via-[#163B32] to-[#0E2822] p-4 text-white shadow-md">
            <div className="flex items-start gap-3">
              <div className="relative shrink-0">
                <Image
                  src="/icons/icon-192.png"
                  alt="talaQids Logo"
                  width={52}
                  height={52}
                  className="rounded-xl shadow-xs ring-2 ring-[#C89B4E]/40"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[14px] font-extrabold tracking-wide text-[#F3E7CB]">
                    talaQids
                  </span>
                  <span className="rounded-full bg-[#C89B4E]/25 px-2 py-0.5 text-[8.5px] font-extrabold uppercase text-[#EAD8AF]">
                    v1.0 • PWA
                  </span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-[#F3E7CB]/85">
                  Aplikasi pendamping talaqqi harian anak dengan siklus bertahap 1 Juz per bulan
                  (khatam 30 bulan), audio murottal berkualitas tinggi, dan lembar mushaf interaktif.
                </p>
              </div>
            </div>
          </div>

          {/* Sumber Teks Al-Qur'an (Mushaf Sources) */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-[#C89B4E]" />
              <h3 className="text-[12.5px] font-extrabold text-[#15231E]">
                Sumber Data Mushaf &amp; Teks Al-Qur&apos;an
              </h3>
            </div>
            <p className="text-[10.5px] leading-relaxed text-[#6B7A72]">
              talaQids menyediakan beragam pilihan edisi khat Mushaf Al-Qur&apos;an yang dapat dipilih
              sesuai kenyamanan membaca anak dan orang tua. Seluruh sumber diverifikasi dan di-cache
              secara offline:
            </p>

            <div className="space-y-2 pt-1">
              {QURAN_SOURCES.map((source) => (
                <div
                  key={source.id}
                  className="rounded-xl border border-[#1E4C40]/10 bg-[#FFFDF9] p-3 shadow-2xs transition hover:border-[#C89B4E]/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11.5px] font-extrabold text-[#1E4C40]">
                      {source.name}
                    </span>
                    <span className="rounded-full bg-[#1E4C40]/8 px-2 py-0.5 text-[9px] font-bold text-[#1E4C40]">
                      {source.provider}
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] leading-relaxed text-[#55655D]">
                    {source.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Sumber Terjemahan & Audio */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-1.5">
              <Volume2 className="h-4 w-4 text-[#C89B4E]" />
              <h3 className="text-[12.5px] font-extrabold text-[#15231E]">
                Sumber Audio Murottal &amp; Terjemahan
              </h3>
            </div>
            <div className="rounded-xl border border-[#1E4C40]/10 bg-[#FBF6ED]/60 p-3 space-y-2">
              <div className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#2F6B5B] mt-0.5" />
                <div className="text-[10px] leading-relaxed text-[#55655D]">
                  <strong className="text-[#15231E]">Terjemahan Bahasa Indonesia:</strong> Menggunakan
                  terjemahan resmi dari Kementerian Agama Republik Indonesia (Kemenag RI) edisi
                  terstandar.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Globe2 className="h-4 w-4 shrink-0 text-[#2F6B5B] mt-0.5" />
                <div className="text-[10px] leading-relaxed text-[#55655D]">
                  <strong className="text-[#15231E]">Audio Murottal CDN:</strong> Disediakan melalui
                  jaringan EveryAyah &amp; Islamic Network CDN (MP3 bit-rate ramah anak dan jernih)
                  dengan qari terkemuka seperti Syaikh Mahmud Khalil Al-Husary, Misyari Rasyid
                  Al-Afasy, Abdullah Basfar, dll.
                </div>
              </div>
            </div>
          </div>

          {/* Kebijakan Data & Privasi */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-[#C89B4E]" />
              <h3 className="text-[12.5px] font-extrabold text-[#15231E]">
                Privasi &amp; Arsitektur Local-First
              </h3>
            </div>
            <p className="text-[10px] leading-relaxed text-[#6B7A72]">
              talaQids dibangun dengan prinsip <strong>Local-First</strong>. Seluruh profil anak,
              riwayat hafalan, dan catatan perkembangan disimpan di browser HP Anda (IndexedDB). Jika
              fitur sinkronisasi diaktifkan, data dicadangkan langsung ke Google Drive pribadi Anda
              tanpa melalui perantara server pihak ketiga.
            </p>
          </div>

          {/* Dukungan Dakwah / Infaq Footer */}
          <div className="rounded-2xl border border-[#C89B4E]/30 bg-gradient-to-r from-[#FFFDF9] to-[#FBF6ED] p-3.5 shadow-2xs">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#C89B4E]/15 text-[#8A6220]">
                  <HeartHandshake className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[11px] font-extrabold text-[#15231E]">
                    Dukung Keberlanjutan talaQids
                  </p>
                  <p className="text-[9px] text-[#6B7A72]">
                    Aplikasi ini 100% bebas iklan komersial.
                  </p>
                </div>
              </div>
              {onOpenInfaq && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenInfaq();
                  }}
                  className="rounded-full bg-[#1E4C40] px-3 py-1.5 text-[10px] font-extrabold text-[#F3E7CB] shadow-xs transition hover:bg-[#163B32] active:scale-95"
                >
                  Infaq
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
