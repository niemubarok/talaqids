'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Sparkles,
  X,
} from 'lucide-react';

export interface GuideStep {
  id: string;
  targetSelector: string;
  tab?: 'audio' | 'mushaf' | 'insights';
  badge: string;
  title: string;
  description: string;
  tips?: string;
  placement?: 'top' | 'bottom' | 'center';
}

const GUIDE_STEPS: GuideStep[] = [
  {
    id: 'cycle',
    targetSelector: '[data-guide="dashboard-cycle"]',
    tab: 'audio',
    badge: 'Langkah 1/5 · Siklus Otomatis',
    title: 'Perhitungan Siklus 30 Juz Otomatis',
    description:
      'Talaqids secara cerdas menghitung Juz aktif anak berdasarkan tanggal lahir (1 Juz per bulan selama 30 bulan pertama). Di sini Ayah & Bunda bisa melihat progres hari serta berganti Juz kapan saja.',
    tips: 'Ketuk "Ganti Juz" di kartu ini jika ingin memutar Juz pilihan di luar jadwal otomatis.',
    placement: 'bottom',
  },
  {
    id: 'routine',
    targetSelector: '[data-guide="dashboard-routine"]',
    tab: 'audio',
    badge: 'Langkah 2/5 · Rutinitas Harian',
    title: 'Target Simak 60 Menit per Hari',
    description:
      'Sesuai metode talaqqi para pakar, perdengarkan lantunan Al-Qur\'an minimal 60 menit per hari saat anak santai, bermain, atau menjelang tidur untuk menstimulasi memori auditori sejak dini.',
    tips: 'Setiap menit pemutaran audio akan otomatis tercatat dan memperbarui statistik capaian harian.',
    placement: 'bottom',
  },
  {
    id: 'player',
    targetSelector: '[data-guide="now-playing-dock"]',
    tab: 'audio',
    badge: 'Langkah 3/5 · Audio Player',
    title: 'Audio Ramah Bayi & Sleep Timer',
    description:
      'Pemutar audio mengambang selalu dapat diakses di bagian bawah layar. Dilengkapi batas aman volume telinga bayi (maksimal 60%), timer tidur otomatis (15m, 30m, 60m), dan unduhan offline.',
    tips: 'Ketuk bilah audio untuk membuka tampilan penuh (Now Playing Sheet) dengan daftar ayat lengkap.',
    placement: 'top',
  },
  {
    id: 'mushaf',
    targetSelector: '[data-guide="mushaf-page"]',
    tab: 'mushaf',
    badge: 'Langkah 4/5 · Mushaf Talaqqi',
    title: 'Mushaf Madinah & Catatan Ortu',
    description:
      'Masuk ke tab Mushaf saat ingin membacakan langsung ke anak. Halaman mushaf otomatis membalik mengikuti lantunan qari dan menyorot ayat yang sedang aktif.',
    tips: 'Jika Anda membuka halaman lain secara manual, akan muncul tombol untuk kembali ke halaman audio qari.',
    placement: 'bottom',
  },
  {
    id: 'sync',
    targetSelector: '[data-guide="header-actions"]',
    tab: 'audio',
    badge: 'Langkah 5/5 · Cloud & Profil',
    title: 'Sinkronisasi Google Drive & Profil',
    description:
      'Sinkronkan data anak ke HP kedua orang tua via Google Drive pribadi tanpa server. Dukung kelangsungan aplikasi lewat Infaq sukarela (Tier Muhsinin) untuk membuka 30 Juz dan pilihan qari.',
    tips: 'Data 100% aman dan privat karena tersimpan di folder khusus Google Drive pribadi Anda.',
    placement: 'bottom',
  },
];

interface OnboardingGuideProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: string;
  onNavigateTab?: (tab: 'audio' | 'mushaf' | 'insights') => void;
}

export function OnboardingGuide({
  isOpen,
  onClose,
  currentTab,
  onNavigateTab,
}: OnboardingGuideProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentStep = GUIDE_STEPS[currentStepIndex];
  const totalSteps = GUIDE_STEPS.length;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  // Measure and position spotlight bounding box around target element
  const updateBoundingRect = useCallback(() => {
    if (!isOpen || !currentStep) return false;

    const el = document.querySelector(currentStep.targetSelector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
      return true;
    } else {
      setTargetRect(null);
      return false;
    }
  }, [isOpen, currentStep]);

  // Handle step change, tab synchronization, and robust element polling
  useEffect(() => {
    if (!isOpen || !currentStep) return;

    setIsTransitioning(true);

    // Switch tab if step belongs to a different tab
    if (currentStep.tab && currentStep.tab !== currentTab && onNavigateTab) {
      onNavigateTab(currentStep.tab);
    }

    // Poll until DOM element of the tab is mounted and measured
    let attempts = 0;
    const maxAttempts = 12;
    const interval = setInterval(() => {
      attempts++;
      const el = document.querySelector(currentStep.targetSelector);
      if (el) {
        el.scrollIntoView({
          behavior: 'smooth',
          block: currentStep.id === 'mushaf' ? 'start' : 'nearest',
        });
        setTargetRect(el.getBoundingClientRect());
        setIsTransitioning(false);
        clearInterval(interval);
      } else if (attempts >= maxAttempts) {
        setTargetRect(null);
        setIsTransitioning(false);
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isOpen, currentStepIndex, currentStep, currentStep?.tab, onNavigateTab]);

  // Window resize & scroll listeners to keep bounding box pinned
  useEffect(() => {
    if (!isOpen) return;

    const handleWindowChange = () => {
      updateBoundingRect();
    };

    window.addEventListener('resize', handleWindowChange);
    window.addEventListener('scroll', handleWindowChange, true);

    return () => {
      window.removeEventListener('resize', handleWindowChange);
      window.removeEventListener('scroll', handleWindowChange, true);
    };
  }, [isOpen, updateBoundingRect]);

  // Keyboard navigation (Esc to exit, Arrow keys to navigate)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && !isLastStep) {
        setCurrentStepIndex((prev) => prev + 1);
      } else if (e.key === 'ArrowLeft' && !isFirstStep) {
        setCurrentStepIndex((prev) => prev - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFirstStep, isLastStep, onClose]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  // Padding & radius around spotlight bounding box
  const padding = 8;
  const radius = 22;

  // Calculate smart tooltip popover positioning
  const popoverStyle: React.CSSProperties = (() => {
    if (!targetRect) {
      // Fallback: center in viewport
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'calc(100vw - 24px)',
        maxWidth: '420px',
      };
    }

    const viewportHeight = window.innerHeight;
    const isTargetVeryTall = targetRect.height > viewportHeight * 0.55;

    // For tall elements (such as the Mushaf reader sheet), dock safely at bottom
    if (isTargetVeryTall) {
      return {
        bottom: '24px',
        left: '12px',
        right: '12px',
        margin: '0 auto',
        maxWidth: '420px',
        maxHeight: 'calc(100dvh - 48px)',
      };
    }

    const spaceBelow = viewportHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;
    const shouldPlaceAbove =
      currentStep.placement === 'top' || (spaceBelow < 260 && spaceAbove > 260);

    if (shouldPlaceAbove) {
      const bottomPx = Math.max(12, viewportHeight - targetRect.top + padding + 10);
      return {
        bottom: `${bottomPx}px`,
        left: '12px',
        right: '12px',
        margin: '0 auto',
        maxWidth: '420px',
        maxHeight: 'calc(100dvh - 32px)',
      };
    }

    const topPx = Math.max(12, targetRect.bottom + padding + 10);
    if (topPx + 260 > viewportHeight) {
      return {
        bottom: '24px',
        left: '12px',
        right: '12px',
        margin: '0 auto',
        maxWidth: '420px',
        maxHeight: 'calc(100dvh - 48px)',
      };
    }

    return {
      top: `${topPx}px`,
      left: '12px',
      right: '12px',
      margin: '0 auto',
      maxWidth: '420px',
      maxHeight: 'calc(100dvh - 32px)',
    };
  })();

  return (
    <aside
      role="dialog"
      aria-label="Panduan Fitur Aplikasi"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* ── SVG Spotlight Backdrop (Darkened canvas with transparent cutout) ── */}
      <svg
        className="pointer-events-none fixed inset-0 z-50 h-full w-full transition-opacity duration-300"
        aria-hidden="true"
      >
        <defs>
          <mask id="guide-spotlight-mask">
            {/* White reveals the dark overlay */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black cuts out the spotlight window */}
            {targetRect && (
              <rect
                x={targetRect.left - padding}
                y={targetRect.top - padding}
                width={targetRect.width + padding * 2}
                height={targetRect.height + padding * 2}
                rx={radius}
                ry={radius}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(11, 31, 26, 0.76)"
          mask="url(#guide-spotlight-mask)"
        />
      </svg>

      {/* ── Glowing Animated Bounding Box Frame ── */}
      {targetRect && (
        <div
          style={{
            left: targetRect.left - padding,
            top: targetRect.top - padding,
            width: targetRect.width + padding * 2,
            height: targetRect.height + padding * 2,
            borderRadius: radius,
          }}
          className={`pointer-events-none fixed z-50 border-2 border-[#C89B4E] shadow-[0_0_30px_rgba(200,155,78,0.55)] ring-4 ring-[#C89B4E]/30 transition-all duration-300 ease-out ${
            isTransitioning ? 'scale-[0.98] opacity-60' : 'scale-100 opacity-100'
          }`}
          aria-hidden="true"
        >
          {/* Animated beacon badge at top-right corner */}
          <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C89B4E] opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-[#C89B4E] ring-2 ring-white shadow-sm" />
          </span>
        </div>
      )}

      {/* ── Interactive Guide Popover Card ── */}
      <div
        style={popoverStyle}
        className={`fixed z-50 transition-all duration-300 ${
          isTransitioning ? 'translate-y-2 opacity-50' : 'translate-y-0 opacity-100'
        }`}
      >
        <div className="overflow-hidden rounded-[24px] border border-[#C89B4E]/40 bg-[#FFFDF9] p-4 sm:p-5 shadow-[0_25px_60px_-15px_rgba(11,31,26,0.55),0_0_0_1px_rgba(200,155,78,0.2)]">
          {/* Top header: Badge + Lewati + Close Button */}
          <div className="flex items-center justify-between gap-2 border-b border-[#1E4C40]/8 pb-2.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1E4C40] text-[#F3E7CB]">
                <Sparkles className="h-3 w-3" />
              </span>
              <span className="truncate rounded-full bg-[#C89B4E]/15 px-2 py-0.5 text-[9px] font-extrabold text-[#8A6220] ring-1 ring-[#C89B4E]/30">
                {currentStep.badge}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-2 py-1 text-[10.5px] font-bold text-[#8A968F] transition hover:text-[#15231E]"
              >
                Lewati
              </button>
              <button
                type="button"
                onClick={onClose}
                title="Tutup panduan"
                aria-label="Tutup panduan"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1E4C40]/6 text-[#1E4C40] transition hover:bg-[#1E4C40]/14 active:scale-95"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Body: Title, Description & Tip */}
          <div className="mt-3 space-y-2">
            <h3 className="text-[15px] sm:text-[16px] font-extrabold leading-snug tracking-tight text-[#15231E]">
              {currentStep.title}
            </h3>

            <p className="text-[11.5px] sm:text-[12px] leading-relaxed text-[#5C6B63]">
              {currentStep.description}
            </p>

            {currentStep.tips && (
              <div className="mt-2 flex items-start gap-2 rounded-xl bg-[#C89B4E]/10 p-2.5 text-[10.5px] leading-relaxed text-[#8A6220] ring-1 ring-[#C89B4E]/25">
                <Lightbulb className="h-3.5 w-3.5 shrink-0 text-[#C89B4E] mt-0.5" />
                <span>
                  <strong className="font-bold">Tips:</strong> {currentStep.tips}
                </span>
              </div>
            )}
          </div>

          {/* Footer: Step progress dots + Action buttons (Clean responsive layout) */}
          <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#1E4C40]/8 pt-3">
            {/* Step progress dots */}
            <div className="flex items-center gap-1 shrink-0" aria-hidden="true">
              {GUIDE_STEPS.map((step, idx) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setCurrentStepIndex(idx)}
                  title={`Lompat ke ${step.title}`}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentStepIndex
                      ? 'w-5 bg-[#1E4C40]'
                      : 'w-1.5 bg-[#1E4C40]/20 hover:bg-[#1E4C40]/40'
                  }`}
                />
              ))}
            </div>

            {/* Navigation buttons: Fits comfortably on slender screens */}
            <div className="flex items-center gap-1.5 shrink-0">
              {!isFirstStep && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex h-8 items-center gap-1 rounded-full border border-[#1E4C40]/15 bg-[#FFFCF5] px-2.5 sm:px-3 text-[11px] font-extrabold text-[#1E4C40] transition hover:bg-[#1E4C40]/5 active:scale-95"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Kembali</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="flex h-8 items-center gap-1 rounded-full bg-[#1E4C40] px-3.5 sm:px-4 text-[11px] font-extrabold text-[#F3E7CB] shadow-md transition hover:bg-[#163B32] active:scale-95"
              >
                {isLastStep ? (
                  <>
                    <span>Selesai</span>
                    <Check className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    <span>Lanjut</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
