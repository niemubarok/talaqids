'use client';

import React, { useEffect, useRef } from 'react';
import {
  Baby,
  Check,
  ChevronRight,
  Compass,
  Crown,
  HeartHandshake,
  Info,
  Lock,
  Plus,
  Shield,
  Sparkles,
  Trash2,
  Users,
  Volume2,
} from 'lucide-react';
import { GoogleDriveIcon } from '@/components/GoogleDriveIcon';
import { formatChildAge } from '@/lib/cycle-math';
import type { ChildProfile } from '@/lib/db';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
  activeChild: ChildProfile;
  childrenList: ChildProfile[];
  isProUser: boolean;
  onSelectChild: (childId: string) => void;
  onOpenManageChildren: () => void;
  onOpenReciters: () => void;
  onOpenInfaq: () => void;
  onOpenGoogleDrive: () => void;
  onOpenGuide: () => void;
  onOpenAbout: () => void;
  onClearCache: () => void;
}

export function ProfileDropdown({
  isOpen,
  onClose,
  triggerRef,
  activeChild,
  childrenList,
  isProUser,
  onSelectChild,
  onOpenManageChildren,
  onOpenReciters,
  onOpenInfaq,
  onOpenGoogleDrive,
  onOpenGuide,
  onOpenAbout,
  onClearCache,
}: ProfileDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        (!triggerRef?.current || !triggerRef.current.contains(target))
      ) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      role="menu"
      aria-label="Menu Aplikasi"
      className="rise absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-[#1E4C40]/12 bg-[#FFFDF9] shadow-[0_20px_60px_-15px_rgba(11,31,26,0.35)] backdrop-blur-md z-50 animate-in fade-in zoom-in-95 duration-150"
    >
      {/* ── Section A: Profil Anak Aktif & Switcher ── */}
      <div className="border-b border-[#1E4C40]/8 bg-[#FBF6ED]/60 p-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8A968F]">
            Profil Anak
          </span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenManageChildren();
            }}
            className="flex items-center gap-1 text-[10px] font-bold text-[#1E4C40] hover:text-[#C89B4E] transition"
          >
            <Users className="h-3 w-3" />
            <span>Kelola</span>
          </button>
        </div>

        {/* List Anak (Quick Switcher) */}
        <div className="mt-2 space-y-1 max-h-36 overflow-y-auto pr-0.5">
          {childrenList.map((c) => {
            const isSelected = c.id === activeChild.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onSelectChild(c.id);
                  onClose();
                }}
                className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left transition ${
                  isSelected
                    ? 'bg-[#1E4C40] text-[#F3E7CB] shadow-xs'
                    : 'text-[#15231E] hover:bg-[#1E4C40]/6'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                      isSelected
                        ? 'bg-[#C89B4E] text-[#15231E]'
                        : 'bg-[#1E4C40]/10 text-[#1E4C40]'
                    }`}
                  >
                    {c.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-extrabold leading-tight">{c.name}</p>
                    <p
                      className={`text-[9px] ${
                        isSelected ? 'text-[#F3E7CB]/80' : 'text-[#8A968F]'
                      }`}
                    >
                      {formatChildAge(c.birthDate)}
                    </p>
                  </div>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-[#C89B4E]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Section B: Menu Opsi Navigasi ── */}
      <div className="p-2 space-y-0.5">
        {/* 1. Kelola Anak (Tambah / Edit) */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenManageChildren();
          }}
          className="flex w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-left transition hover:bg-[#1E4C40]/5 active:scale-[0.98]"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1E4C40]/8 text-[#1E4C40]">
              <Baby className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-[11.5px] font-extrabold text-[#15231E]">Kelola Profil Anak</p>
              <p className="text-[9px] text-[#8A968F]">Tambah anak, ubah tanggal lahir &amp; juz</p>
            </div>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-[#8A968F]" />
        </button>

        {/* 2. Pilihan Qari / Murottal */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenReciters();
          }}
          className="flex w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-left transition hover:bg-[#1E4C40]/5 active:scale-[0.98]"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1E4C40]/8 text-[#1E4C40]">
              <Volume2 className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-[11.5px] font-extrabold text-[#15231E]">Pilihan Qari (Murottal)</p>
              <p className="text-[9px] text-[#8A968F]">Al-Husary, Misyari, Basfar, dll</p>
            </div>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-[#8A968F]" />
        </button>

        {/* 3. Infaq & Tier Muhsinin */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenInfaq();
          }}
          className="flex w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-left transition hover:bg-[#C89B4E]/10 active:scale-[0.98]"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#C89B4E]/15 text-[#8A6220]">
              <HeartHandshake className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-[11.5px] font-extrabold text-[#15231E]">Infaq &amp; Muhsinin</p>
              <p className="flex items-center gap-1 text-[9px] text-[#8A6220]">
                {isProUser ? (
                  <>
                    <Crown className="h-2.5 w-2.5 text-[#8A6220]" />
                    <span>Tier Muhsinin Aktif</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-2.5 w-2.5 text-[#8A6220]" />
                    <span>Free Tier · Buka 30 Juz</span>
                  </>
                )}
              </p>
            </div>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-[#8A968F]" />
        </button>

        {/* 4. Sinkronisasi Google Drive */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenGoogleDrive();
          }}
          className="flex w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-left transition hover:bg-[#1E4C40]/5 active:scale-[0.98]"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FFFCF5] shadow-2xs ring-1 ring-[#1E4C40]/10">
              <GoogleDriveIcon className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-[11.5px] font-extrabold text-[#15231E]">Sinkronisasi Drive</p>
              <p className="text-[9px] text-[#8A968F]">Cadangan &amp; HP orang tua</p>
            </div>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-[#8A968F]" />
        </button>

        {/* Divider */}
        <div className="my-1 border-t border-[#1E4C40]/8" />

        {/* 5. Tentang Aplikasi (About App) */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenAbout();
          }}
          className="flex w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-left transition hover:bg-[#1E4C40]/5 active:scale-[0.98]"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#C89B4E]/15 text-[#8A6220]">
              <Info className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-[11.5px] font-extrabold text-[#15231E]">Tentang talaQids</p>
              <p className="text-[9px] text-[#8A968F]">Keterangan sumber mushaf &amp; dakwah</p>
            </div>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-[#8A968F]" />
        </button>

        {/* 6. Panduan Fitur Aplikasi (Tour) */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenGuide();
          }}
          className="flex w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-left transition hover:bg-[#1E4C40]/5 active:scale-[0.98]"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1E4C40]/8 text-[#1E4C40]">
              <Compass className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-[11.5px] font-extrabold text-[#15231E]">Panduan Aplikasi</p>
              <p className="text-[9px] text-[#8A968F]">Mulai tur fitur talaQids</p>
            </div>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-[#8A968F]" />
        </button>

        {/* 7. Bersihkan Cache */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onClearCache();
          }}
          className="flex w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-left transition hover:bg-[#B4483D]/8 active:scale-[0.98]"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#B4483D]/10 text-[#A03A31]">
              <Trash2 className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-[11.5px] font-extrabold text-[#A03A31]">Bersihkan Cache</p>
              <p className="text-[9px] text-[#8A968F]">Hapus audio offline lama</p>
            </div>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-[#8A968F]" />
        </button>
      </div>
    </div>
  );
}
