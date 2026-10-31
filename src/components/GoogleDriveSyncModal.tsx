'use client';

import React from 'react';
import { Loader2, Lock, LogOut, RefreshCw, ShieldCheck, Sparkles, X } from 'lucide-react';
import { GoogleDriveIcon } from '@/components/GoogleDriveIcon';
import { formatRelativeSyncTime } from '@/lib/google-drive-sync';

interface GoogleDriveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  isProUser: boolean;
  isSyncing: boolean;
  lastSyncedAt?: string;
  driveEmail?: string;
  error?: string | null;
  onManualSync: () => Promise<void>;
  onDisconnect: () => Promise<void>;
  onUnlockRequest?: () => void;
}

export function GoogleDriveSyncModal({
  isOpen,
  onClose,
  isProUser,
  isSyncing,
  lastSyncedAt,
  driveEmail,
  error,
  onManualSync,
  onDisconnect,
  onUnlockRequest,
}: GoogleDriveSyncModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drive-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0B1F1A]/70 p-4 backdrop-blur-md"
    >
      <div className="rise my-auto w-full max-w-md overflow-hidden rounded-[28px] border border-[#C89B4E]/30 bg-[#FFFDF9] shadow-[0_30px_90px_-25px_rgba(11,31,26,0.6)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E4C40]/8 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#FFFCF5] shadow-xs ring-1 ring-[#1E4C40]/10">
              <GoogleDriveIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 id="drive-modal-title" className="text-[15px] font-extrabold text-[#15231E]">
                Sinkronisasi Google Drive
              </h2>
              <p className="text-[10px] text-[#6B7A72]">
                Sinkronkan data HP Ayah &amp; Ibu tanpa server
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
        <div className="space-y-4 p-5">
          {/* Status Box */}
          <div className="rounded-2xl border border-[#1E4C40]/10 bg-[#FBF6EC]/70 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-extrabold text-[#15231E]">
                  {!isProUser
                    ? 'Fitur Khusus Tier Muhsinin'
                    : driveEmail
                      ? `Terhubung: ${driveEmail}`
                      : lastSyncedAt
                        ? 'Terhubung ke Google Drive'
                        : 'Belum Terhubung ke Google Drive'}
                </p>
                <p className="mt-1 text-[10.5px] text-[#6B7A72]">
                  {!isProUser
                    ? 'Dukung aplikasi lewat Infaq untuk membuka fitur sinkronisasi otomatis antar HP orang tua.'
                    : `Terakhir sinkron: ${formatRelativeSyncTime(lastSyncedAt)}`}
                </p>
              </div>

              {!isProUser && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#C89B4E]/15 px-2.5 py-1 text-[9px] font-extrabold text-[#9C7330]">
                  <Lock className="h-2.5 w-2.5" />
                  Muhsinin
                </span>
              )}
            </div>

            {error && (
              <p className="mt-2 rounded-xl bg-[#B4483D]/10 p-2 text-[10px] font-semibold text-[#A03A31]">
                {error}
              </p>
            )}
          </div>

          {/* Privacy Note */}
          <div className="flex items-start gap-2 rounded-2xl bg-[#1E4C40]/5 p-3 text-[10.5px] leading-relaxed text-[#5C6B63]">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#2F6B5B] mt-0.5" />
            <span>
              Data disimpan privat di folder khusus aplikasi (<code className="font-mono text-[#1E4C40]">appDataFolder</code>) pada Google Drive Anda sendiri. Tidak ada pihak lain yang bisa membaca.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            {!isProUser ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onUnlockRequest?.();
                }}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[#1E4C40] text-[11px] font-extrabold text-[#F3E7CB] shadow-md transition hover:bg-[#163B32] active:scale-98"
              >
                <Sparkles className="h-4 w-4 text-[#C89B4E]" />
                Buka Sinkronisasi via Infaq
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={() => void onManualSync()}
                  className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full bg-[#1E4C40] text-[11px] font-extrabold text-[#F3E7CB] shadow-sm transition hover:bg-[#163B32] active:scale-98 disabled:opacity-60"
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-[#C89B4E]" />
                      <span>Sedang Menyinkronkan...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 text-[#C89B4E]" />
                      <span>{lastSyncedAt ? 'Sinkronkan Sekarang' : 'Hubungkan Akun Drive'}</span>
                    </>
                  )}
                </button>

                {(driveEmail || lastSyncedAt) && (
                  <button
                    type="button"
                    onClick={() => void onDisconnect()}
                    title="Putuskan akun Google Drive"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#B4483D]/20 bg-[#B4483D]/10 text-[#A03A31] transition hover:bg-[#B4483D]/20 active:scale-95"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
