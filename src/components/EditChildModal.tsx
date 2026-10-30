'use client';

import React, { useState } from 'react';
import { Calendar, Check, Trash2, X } from 'lucide-react';
import { RECITERS } from '@/lib/quran-metadata';
import type { ChildProfile } from '@/lib/db';

interface EditChildModalProps {
  child: ChildProfile;
  canDelete: boolean;
  onSave: (updated: {
    name: string;
    birthDate: string;
    startDate: string;
    preferredReciterId: string;
  }) => Promise<void>;
  onDelete: () => Promise<void>;
  onClose: () => void;
}

export function EditChildModal({
  child,
  canDelete,
  onSave,
  onDelete,
  onClose,
}: EditChildModalProps) {
  const [name, setName] = useState(child.name);
  const [birthDate, setBirthDate] = useState(child.birthDate);
  const [startDate, setStartDate] = useState(child.startDate);
  const [preferredReciterId, setPreferredReciterId] = useState(
    child.preferredReciterId || 'al_husary'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama anak tidak boleh kosong.');
      return;
    }
    if (!birthDate) {
      setErrorMsg('Tanggal lahir wajib diisi.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await onSave({
        name: name.trim(),
        birthDate,
        startDate: startDate || birthDate,
        preferredReciterId,
      });
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menyimpan perubahan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await onDelete();
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menghapus profil.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-[#1E4C40]/10 bg-[#FFFCF5] p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E4C40]/8">
          <div>
            <p className="text-[9.5px] font-extrabold uppercase tracking-[0.2em] text-[#C89B4E]">
              Kelola Profil
            </p>
            <h3 className="text-[16px] font-extrabold text-[#15231E]">Edit Profil Anak</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E4C40]/6 text-[#6B7A72] transition hover:bg-[#1E4C40]/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 rounded-xl bg-[#B4483D]/10 p-2.5 text-[11px] font-semibold text-[#A03A31]">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold text-[#15231E]">Nama Panggilan Anak</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Muhammad"
              required
              className="mt-1 w-full rounded-xl border border-[#1E4C40]/15 bg-white px-3 py-2 text-[13px] text-[#15231E] shadow-sm outline-none focus:border-[#2F6B5B] focus:ring-1 focus:ring-[#2F6B5B]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-[#15231E]">Tanggal Lahir</label>
              <div className="relative mt-1">
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#1E4C40]/15 bg-white px-2.5 py-2 text-[12px] text-[#15231E] shadow-sm outline-none focus:border-[#2F6B5B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#15231E]">Mulai Siklus Talaqqi</label>
              <div className="relative mt-1">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#1E4C40]/15 bg-white px-2.5 py-2 text-[12px] text-[#15231E] shadow-sm outline-none focus:border-[#2F6B5B]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#15231E]">Pilihan Qari Utama</label>
            <select
              value={preferredReciterId}
              onChange={(e) => setPreferredReciterId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#1E4C40]/15 bg-white px-3 py-2 text-[12px] text-[#15231E] shadow-sm outline-none focus:border-[#2F6B5B]"
            >
              {RECITERS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.style})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex items-center justify-between gap-2">
            {canDelete ? (
              confirmDelete ? (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => void handleDelete()}
                    className="rounded-xl bg-[#B4483D] px-3 py-2 text-[10.5px] font-extrabold text-white shadow-sm transition hover:bg-[#8f322a] active:scale-95 disabled:opacity-50"
                  >
                    Yakin Hapus?
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="rounded-xl border border-[#1E4C40]/15 px-2.5 py-2 text-[10.5px] font-bold text-[#6B7A72]"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1 rounded-xl border border-[#B4483D]/25 px-2.5 py-2 text-[11px] font-bold text-[#B4483D] transition hover:bg-[#B4483D]/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Hapus
                </button>
              )
            ) : (
              <span className="text-[10px] text-[#8A968F] italic">Minimal 1 profil aktif</span>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#1E4C40]/15 px-3 py-2 text-[11px] font-bold text-[#6B7A72] transition hover:bg-[#1E4C40]/5"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 rounded-xl bg-[#1E4C40] px-4 py-2 text-[11px] font-extrabold text-[#F3E7CB] shadow transition hover:bg-[#163a31] active:scale-95 disabled:opacity-60"
              >
                <Check className="h-3.5 w-3.5" />
                Simpan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
