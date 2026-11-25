'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Check,
  Copy,
  Download,
  Eye,
  EyeOff,
  Share2,
  Sparkles,
  X,
} from 'lucide-react';
import type { ChildProfile, DailyProgress } from '@/lib/db';
import type { CycleStatus } from '@/lib/cycle-math';
import {
  buildShareCaption,
  renderShareProgressCard,
  type ShareCardFormat,
  type ShareCardTheme,
  type ShareProgressPayload,
} from '@/lib/share-card-renderer';

interface ShareProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: ChildProfile;
  cycle: CycleStatus;
  allProgress: DailyProgress[];
}

const FORMAT_OPTIONS: { id: ShareCardFormat; label: string; hint: string }[] = [
  { id: 'story', label: 'Story (9:16)', hint: 'IG Story / WA Status' },
  { id: 'square', label: 'Feed (1:1)', hint: 'IG Feed / X / FB' },
];

const THEME_OPTIONS: { id: ShareCardTheme; label: string; swatch: string }[] = [
  { id: 'emerald', label: 'Emerald', swatch: 'bg-[#1E4C40]' },
  { id: 'parchment', label: 'Cream', swatch: 'bg-[#F6F0E4] border border-[#1E4C40]/25' },
  { id: 'gold', label: 'Gold', swatch: 'bg-[#E5C687]' },
];

export function ShareProgressModal({
  isOpen,
  onClose,
  child,
  cycle,
  allProgress,
}: ShareProgressModalProps) {
  const [mounted, setMounted] = useState(false);
  const [format, setFormat] = useState<ShareCardFormat>('story');
  const [theme, setTheme] = useState<ShareCardTheme>('emerald');
  const [showChildName, setShowChildName] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [isRendering, setIsRendering] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const stats = useMemo(() => {
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

    return {
      totalListenMinutes,
      totalCompletedPagesCount,
      activeDaysCount,
    };
  }, [allProgress]);

  const payload: ShareProgressPayload = useMemo(
    () => ({
      childName: child.name,
      birthDate: child.birthDate,
      cycle,
      activeDaysCount: stats.activeDaysCount,
      totalListenMinutes: stats.totalListenMinutes,
      totalCompletedPagesCount: stats.totalCompletedPagesCount,
      format,
      theme,
      showChildName,
      showStats,
    }),
    [child.name, child.birthDate, cycle, stats, format, theme, showChildName, showStats]
  );

  const captionText = useMemo(() => buildShareCaption(payload), [payload]);

  useEffect(() => {
    if (!isOpen || !mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    setIsRendering(true);
    void renderShareProgressCard(canvas, payload).finally(() => {
      if (!cancelled) {
        setIsRendering(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isOpen, mounted, payload]);

  const showTempFeedback = useCallback((msg: string) => {
    setStatusFeedback(msg);
    setTimeout(() => {
      setStatusFeedback((prev) => (prev === msg ? null : prev));
    }, 2600);
  }, []);

  const exportCanvasBlob = useCallback(async (): Promise<Blob | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png', 1.0);
    });
  }, []);

  const handleDownloadPng = useCallback(async () => {
    const blob = await exportCanvasBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `talaqids-progres-juz-${cycle.currentJuz}-${format}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showTempFeedback('Gambar berhasil disimpan!');
  }, [exportCanvasBlob, cycle.currentJuz, format, showTempFeedback]);

  const handleCopyCaption = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(captionText);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
      showTempFeedback('Caption tersalin ke clipboard!');
    } catch {
      showTempFeedback('Gagal menyalin caption');
    }
  }, [captionText, showTempFeedback]);

  const handleNativeShare = useCallback(async () => {
    setIsSharing(true);
    try {
      const blob = await exportCanvasBlob();
      if (!blob) return;

      const fileName = `talaqids-progres-juz-${cycle.currentJuz}-${format}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      if (
        typeof navigator !== 'undefined' &&
        'share' in navigator &&
        navigator.canShare?.({ files: [file] })
      ) {
        await navigator.share({
          title: `Progres Al-Qur'an di talaQids`,
          text: captionText,
          files: [file],
        });
        showTempFeedback('Berhasil dibagikan!');
      } else {
        await handleDownloadPng();
        await navigator.clipboard?.writeText(captionText).catch(() => {});
        showTempFeedback('Gambar diunduh & caption disalin!');
      }
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        await handleDownloadPng();
      }
    } finally {
      setIsSharing(false);
    }
  }, [exportCanvasBlob, cycle.currentJuz, format, captionText, handleDownloadPng, showTempFeedback]);

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-[#0D1E19]/75 p-0 backdrop-blur-xs sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-progress-title"
    >
      <div
        className="relative flex max-h-[92dvh] w-full max-w-[460px] flex-col overflow-hidden rounded-t-[30px] border border-[#1E4C40]/15 bg-[#FFFCF5] shadow-[0_-24px_64px_rgba(13,30,25,0.4)] sm:rounded-[30px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E4C40]/10 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#1E4C40]/10 text-[#1E4C40]">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h2 id="share-progress-title" className="text-sm font-extrabold text-[#15231E]">
                Bagikan Progres ke Medsos
              </h2>
              <p className="text-[11px] text-[#6B7A72]">
                Buat kartu capaian Juz {cycle.currentJuz} siap posting
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E4C40]/8 text-[#1E4C40] transition hover:bg-[#1E4C40]/15"
            aria-label="Tutup modal bagikan"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {/* Live Canvas Preview */}
          <div className="flex flex-col items-center justify-center rounded-2xl bg-[#EFE8D8]/60 p-3 ring-1 ring-[#1E4C40]/8">
            <div
              className={`relative overflow-hidden rounded-2xl shadow-[0_18px_40px_-16px_rgba(16,46,39,0.45)] transition-all ${
                format === 'story' ? 'w-[200px] aspect-[9/16]' : 'w-[260px] aspect-square'
              }`}
            >
              <canvas
                ref={canvasRef}
                className={`h-full w-full object-contain transition-opacity duration-200 ${
                  isRendering ? 'opacity-70' : 'opacity-100'
                }`}
              />
            </div>
            {statusFeedback && (
              <span className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-[#1E4C40] px-3 py-1 text-[10px] font-bold text-[#F3E7CB]">
                <Check className="h-3 w-3" />
                {statusFeedback}
              </span>
            )}
          </div>

          {/* Format Selector */}
          <div>
            <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#6B7A72]">
              Ukuran Kartu
            </p>
            <div className="grid grid-cols-2 gap-2">
              {FORMAT_OPTIONS.map((opt) => {
                const active = format === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormat(opt.id)}
                    className={`rounded-2xl border px-3 py-2 text-left transition ${
                      active
                        ? 'border-[#1E4C40] bg-[#1E4C40] text-[#F3E7CB] shadow-xs'
                        : 'border-[#1E4C40]/12 bg-white text-[#15231E] hover:border-[#1E4C40]/30'
                    }`}
                  >
                    <p className="text-xs font-extrabold">{opt.label}</p>
                    <p
                      className={`text-[10px] ${
                        active ? 'text-[#F3E7CB]/75' : 'text-[#6B7A72]'
                      }`}
                    >
                      {opt.hint}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme Selector */}
          <div>
            <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#6B7A72]">
              Tema Warna
            </p>
            <div className="grid grid-cols-3 gap-2">
              {THEME_OPTIONS.map((opt) => {
                const active = theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTheme(opt.id)}
                    className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 text-xs font-bold transition ${
                      active
                        ? 'border-[#1E4C40] bg-[#1E4C40]/8 text-[#1E4C40]'
                        : 'border-[#1E4C40]/12 bg-white text-[#6B7A72] hover:border-[#1E4C40]/25'
                    }`}
                  >
                    <span className={`h-4 w-4 shrink-0 rounded-full ${opt.swatch}`} />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Privacy & Content Toggles */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setShowChildName((v) => !v)}
              className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left text-[11px] font-bold transition ${
                showChildName
                  ? 'border-[#1E4C40]/25 bg-[#1E4C40]/5 text-[#15231E]'
                  : 'border-[#1E4C40]/10 bg-white text-[#6B7A72]'
              }`}
            >
              <span>Nama Anak</span>
              {showChildName ? (
                <Eye className="h-3.5 w-3.5 text-[#1E4C40]" />
              ) : (
                <EyeOff className="h-3.5 w-3.5 text-[#8A968F]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowStats((v) => !v)}
              className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left text-[11px] font-bold transition ${
                showStats
                  ? 'border-[#1E4C40]/25 bg-[#1E4C40]/5 text-[#15231E]'
                  : 'border-[#1E4C40]/10 bg-white text-[#6B7A72]'
              }`}
            >
              <span>Statistik</span>
              {showStats ? (
                <Eye className="h-3.5 w-3.5 text-[#1E4C40]" />
              ) : (
                <EyeOff className="h-3.5 w-3.5 text-[#8A968F]" />
              )}
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-[#1E4C40]/10 bg-[#FAF5EB] px-5 py-3.5 space-y-2">
          <button
            type="button"
            disabled={isSharing || isRendering}
            onClick={() => void handleNativeShare()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1E4C40] px-4 py-3 text-xs font-extrabold text-[#F7EFD9] shadow-[0_10px_24px_-8px_rgba(16,46,39,0.65)] transition hover:bg-[#275E50] active:scale-[0.99] disabled:opacity-60"
          >
            <Share2 className="h-4 w-4" />
            <span>{isSharing ? 'Menyiapkan gambar...' : 'Bagikan Sekarang'}</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isRendering}
              onClick={() => void handleDownloadPng()}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-[#1E4C40]/20 bg-white px-3 py-2.5 text-[11px] font-bold text-[#1E4C40] transition hover:bg-[#1E4C40]/5 active:scale-[0.99] disabled:opacity-60"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Simpan PNG</span>
            </button>

            <button
              type="button"
              onClick={() => void handleCopyCaption()}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-[#1E4C40]/20 bg-white px-3 py-2.5 text-[11px] font-bold text-[#1E4C40] transition hover:bg-[#1E4C40]/5 active:scale-[0.99]"
            >
              {copiedCaption ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#1E4C40]" />
                  <span>Caption Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Salin Caption</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
