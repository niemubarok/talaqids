'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Download, PlusSquare, Share, Smartphone, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface Window {
    __deferredPwaPrompt?: BeforeInstallPromptEvent | null;
  }
}

const DISMISS_STORAGE_KEY = 'talaqids_pwa_banner_dismissed_until';
const DISMISS_DURATION_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(true);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if temporarily dismissed
    const dismissedUntil = Number(localStorage.getItem(DISMISS_STORAGE_KEY) || '0');
    if (dismissedUntil > Date.now()) {
      setIsDismissed(true);
    }

    // Check if already running as installed standalone PWA
    const checkStandalone = () => {
      const standaloneMatch = window.matchMedia('(display-mode: standalone)').matches;
      const iosStandalone = Boolean(
        (window.navigator as Navigator & { standalone?: boolean }).standalone
      );
      return standaloneMatch || iosStandalone;
    };

    if (checkStandalone()) {
      setIsInstalled(true);
      return;
    }

    setIsInstalled(false);

    // Pick up any prompt captured early in <head> before React mounted
    if (window.__deferredPwaPrompt) {
      setDeferredPrompt(window.__deferredPwaPrompt);
    }

    // Detect iOS Safari/WebKit (avoid false positive when Chrome DevTools emulates iPhone/iPad on Mac/Windows)
    const ua = window.navigator.userAgent.toLowerCase();
    const isCriOSOrFxiOS = /crios|fxios|edgios|opios/.test(ua);
    const isSafariEngine = /safari/.test(ua) && !/chrome|chromium|edg|opr/.test(ua);
    const iosDevice =
      (/iphone|ipad|ipod/.test(ua) && (isSafariEngine || isCriOSOrFxiOS)) &&
      !('BeforeInstallPromptEvent' in window);
    setIsIos(iosDevice);

    const handleBeforeInstallPrompt = (event: Event) => {
      const promptEvent = event as BeforeInstallPromptEvent;
      window.__deferredPwaPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstalled(false);
    };

    const handlePromptReady = () => {
      if (window.__deferredPwaPrompt) {
        setDeferredPrompt(window.__deferredPwaPrompt);
        setIsInstalled(false);
      }
    };

    const handleAppInstalled = () => {
      window.__deferredPwaPrompt = null;
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsInstalled(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-prompt-ready', handlePromptReady);
    window.addEventListener('appinstalled', handleAppInstalled);
    mediaQuery.addEventListener('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-prompt-ready', handlePromptReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    setShowIosGuide(false);
    try {
      localStorage.setItem(
        DISMISS_STORAGE_KEY,
        String(Date.now() + DISMISS_DURATION_MS)
      );
    } catch {
      // Ignore storage error
    }
  };

  const handleInstallClick = async () => {
    const promptEvent = deferredPrompt || window.__deferredPwaPrompt;
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choiceResult = await promptEvent.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
        }
      } catch {
        // Fallback to manual guide if prompt fails
        setShowIosGuide(true);
      } finally {
        window.__deferredPwaPrompt = null;
        setDeferredPrompt(null);
      }
      return;
    }

    setShowIosGuide((prev) => !prev);
  };

  if (isInstalled || isDismissed) {
    return null;
  }

  return (
    <div className="mb-3 overflow-hidden rounded-[22px] border border-[#C89B4E]/35 bg-gradient-to-r from-[#1E4C40] via-[#1A4338] to-[#13332B] p-3 text-[#F6F0E4] shadow-[0_18px_38px_-22px_rgba(16,46,39,0.85)]">
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FFFCF5] p-1.5 shadow-sm ring-1 ring-[#C89B4E]/40">
            <Image
              src="/icons/icon-192.png"
              alt="talaQids"
              width={64}
              height={64}
              className="h-full w-full object-contain"
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="rounded-full bg-[#C89B4E]/25 px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.18em] text-[#EAD8AF]">
                Aplikasi Offline
              </span>
            </div>
            <p className="mt-0.5 truncate text-[12px] font-extrabold text-white">
              Pasang talaQids di Layar Utama
            </p>
            <p className="truncate text-[10px] text-[#EAD8AF]/85">
              Putar murottal latar belakang lebih stabil & hemat baterai
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => void handleInstallClick()}
            className="flex items-center gap-1.5 rounded-full bg-[#C89B4E] px-3 py-1.5 text-[10px] font-extrabold text-[#15231E] shadow-sm transition hover:bg-[#d3a75c] active:scale-95"
          >
            <Download className="h-3 w-3" />
            {deferredPrompt ? 'Install' : isIos ? 'Cara Pasang' : 'Install'}
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Tutup banner install"
            className="flex h-7 w-7 items-center justify-center rounded-full text-[#EAD8AF]/70 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {showIosGuide && !deferredPrompt && (
        <div className="mt-2.5 rounded-2xl border border-white/12 bg-black/20 p-3 text-[10px] leading-relaxed text-[#EAD8AF]">
          {isIos ? (
            <div className="space-y-1.5">
              <p className="font-extrabold text-white">
                Cara pasang di iPhone / iPad (Safari):
              </p>
              <p className="flex items-center gap-1.5">
                <Share className="h-3.5 w-3.5 shrink-0 text-[#C89B4E]" />
                <span>
                  1. Ketuk ikon <strong>Bagikan (Share)</strong> di bilah bawah browser.
                </span>
              </p>
              <p className="flex items-center gap-1.5">
                <PlusSquare className="h-3.5 w-3.5 shrink-0 text-[#C89B4E]" />
                <span>
                  2. Pilih <strong>&ldquo;Tambah ke Layar Utama&rdquo; (Add to Home Screen)</strong>.
                </span>
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="flex items-center gap-1.5 font-extrabold text-white">
                <Smartphone className="h-3.5 w-3.5 shrink-0 text-[#C89B4E]" />
                Cara pasang di Android / Desktop:
              </p>
              <p>
                Buka menu browser (ikon titik tiga <strong>⋮</strong> di pojok kanan atas), lalu pilih{' '}
                <strong>&ldquo;Instal aplikasi&rdquo;</strong> atau{' '}
                <strong>&ldquo;Tambahkan ke Layar Utama&rdquo;</strong>.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
