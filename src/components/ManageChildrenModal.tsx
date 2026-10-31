'use client';

import React, { useState } from 'react';
import { Baby, Check, Pencil, Plus, UserPlus, X } from 'lucide-react';
import { formatChildAge } from '@/lib/cycle-math';
import { EditChildModal } from '@/components/EditChildModal';
import { updateChildProfile, deleteChildProfile, type ChildProfile } from '@/lib/db';

interface ManageChildrenModalProps {
  isOpen: boolean;
  onClose: () => void;
  childrenList: ChildProfile[];
  activeChild: ChildProfile;
  onSelectChild: (childId: string) => void;
  onAddChildClick: () => void;
}

export function ManageChildrenModal({
  isOpen,
  onClose,
  childrenList,
  activeChild,
  onSelectChild,
  onAddChildClick,
}: ManageChildrenModalProps) {
  const [editingChild, setEditingChild] = useState<ChildProfile | null>(null);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="manage-children-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0B1F1A]/70 p-4 backdrop-blur-md"
    >
      <div className="rise my-auto w-full max-w-md overflow-hidden rounded-[28px] border border-[#C89B4E]/30 bg-[#FFFDF9] shadow-[0_30px_90px_-25px_rgba(11,31,26,0.6)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E4C40]/8 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#1E4C40]/10 text-[#1E4C40]">
              <Baby className="h-4 w-4" />
            </span>
            <div>
              <h2 id="manage-children-title" className="text-[15px] font-extrabold text-[#15231E]">
                Profil &amp; Data Anak
              </h2>
              <p className="text-[10px] text-[#6B7A72]">
                Kelola profil anak dan beralih jadwal talaqqi
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
        <div className="max-h-[70vh] space-y-3 overflow-y-auto p-5">
          <div className="space-y-2">
            {childrenList.map((c) => {
              const isActive = c.id === activeChild.id;
              return (
                <div
                  key={c.id}
                  className={`flex items-center justify-between gap-3 rounded-2xl border p-3 transition ${
                    isActive
                      ? 'border-[#C89B4E] bg-gradient-to-r from-[#FFF8ED] to-[#FBF6EC] shadow-xs ring-1 ring-[#C89B4E]/30'
                      : 'border-[#1E4C40]/8 bg-[#FBF6EC]/50 hover:bg-[#FBF6EC]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelectChild(c.id);
                    }}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold shadow-xs ${
                        isActive
                          ? 'bg-[#1E4C40] text-[#F3E7CB]'
                          : 'bg-[#C89B4E]/20 text-[#8A6220]'
                      }`}
                    >
                      {c.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-[13px] font-extrabold text-[#15231E]">{c.name}</p>
                        {isActive && (
                          <span className="shrink-0 rounded-full bg-[#1E4C40] px-2 py-0.5 text-[8.5px] font-extrabold text-[#F3E7CB]">
                            Aktif
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[10px] font-semibold text-[#8A968F]">
                        {formatChildAge(c.birthDate)}
                      </p>
                    </div>
                  </button>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingChild(c)}
                      title={`Edit data ${c.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E4C40]/6 text-[#1E4C40] transition hover:bg-[#C89B4E]/20 hover:text-[#8A6220] active:scale-95"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {isActive && (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E4C40] text-[#F3E7CB]">
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onAddChildClick();
            }}
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#1E4C40]/25 bg-white/60 py-2.5 text-[11px] font-extrabold text-[#1E4C40] transition hover:border-[#1E4C40]/40 hover:bg-[#1E4C40]/5 active:scale-98"
          >
            <UserPlus className="h-4 w-4" />
            Tambah Profil Anak Lain
          </button>
        </div>
      </div>

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
