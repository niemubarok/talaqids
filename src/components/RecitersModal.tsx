'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Check, Info, Lock, Volume2, X } from 'lucide-react';
import { RECITERS, type Reciter } from '@/lib/quran-metadata';
import { ReciterProfileModal } from '@/components/ReciterProfileModal';

interface RecitersModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeReciterId: string;
  isProUser: boolean;
  onSelectReciter: (reciterId: string, isPro: boolean) => void;
  onUnlockRequest?: () => void;
}

export function RecitersModal({
  isOpen,
  onClose,
  activeReciterId,
  isProUser,
  onSelectReciter,
  onUnlockRequest,
}: RecitersModalProps) {
  const [selectedProfileReciter, setSelectedProfileReciter] = useState<Reciter | null>(null);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reciters-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0B1F1A]/70 p-4 backdrop-blur-md"
    >
      <div className="rise my-auto w-full max-w-md overflow-hidden rounded-[28px] border border-[#C89B4E]/30 bg-[#FFFDF9] shadow-[0_30px_90px_-25px_rgba(11,31,26,0.6)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E4C40]/8 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#1E4C40]/10 text-[#1E4C40]">
              <Volume2 className="h-4 w-4" />
            </span>
            <div>
              <h2 id="reciters-modal-title" className="text-[15px] font-extrabold text-[#15231E]">
                Pilihan Qari Talaqqi
              </h2>
              <p className="text-[10px] text-[#6B7A72]">
                Pilih gaya murattal &amp; qari standar talaqqi
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

        {/* List of Reciters */}
        <div className="max-h-[70vh] space-y-2.5 overflow-y-auto p-5">
          {RECITERS.map((reciter) => {
            const isSelected = activeReciterId === reciter.id;
            const locked = reciter.isPro && !isProUser;

            return (
              <div
                key={reciter.id}
                className={`flex items-center justify-between gap-3 rounded-2xl border p-3 transition ${
                  isSelected
                    ? 'border-[#C89B4E] bg-gradient-to-r from-[#FFF8ED] to-[#FBF6EC] shadow-xs ring-1 ring-[#C89B4E]/30'
                    : locked
                      ? 'border-[#1E4C40]/8 bg-[#FBF6EC]/50 opacity-75'
                      : 'border-[#1E4C40]/8 bg-[#FFFCF5] hover:bg-[#FBF6EC]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (locked) {
                      setSelectedProfileReciter(reciter);
                      return;
                    }
                    onSelectReciter(reciter.id, reciter.isPro);
                    onClose();
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
                    <p className="truncate text-[10px] font-medium text-[#6B7A72]">
                      {reciter.style} · {reciter.bitrate}
                    </p>
                    <p className="truncate text-[9px] font-semibold text-[#8A968F]">
                      {reciter.origin} · {reciter.period}
                    </p>
                  </div>
                </button>

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
                      className="inline-flex items-center gap-1 rounded-full bg-[#C89B4E]/15 px-2 py-0.5 text-[9px] font-extrabold text-[#9C7330]"
                    >
                      <Lock className="h-2.5 w-2.5" />
                      Muhsinin
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedProfileReciter && (
        <ReciterProfileModal
          reciter={selectedProfileReciter}
          activeReciterId={activeReciterId}
          isProUser={isProUser}
          onClose={() => setSelectedProfileReciter(null)}
          onSelectReciter={(r) => {
            onSelectReciter(r.id, r.isPro);
            setSelectedProfileReciter(null);
            onClose();
          }}
          onUnlockRequest={() => {
            setSelectedProfileReciter(null);
            onClose();
            onUnlockRequest?.();
          }}
        />
      )}
    </div>
  );
}
