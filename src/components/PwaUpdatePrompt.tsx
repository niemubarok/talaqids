'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { RefreshCw, Sparkles, X } from 'lucide-react';

export function PwaUpdatePrompt() {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const waitingWorkerRef = useRef<ServiceWorker | null>(null);

  const applyUpdate = useCallback(async () => {
    setIsUpdating(true);

    try {
      // 1. Tell the waiting worker to activate immediately
      const waiting = waitingWorkerRef.current || registrationRef.current?.waiting;
      if (waiting) {
        waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      // 2. Ensure all stale caches are purged
      if ('caches' in window) {
        try {
          const cacheKeys = await caches.keys();
          await Promise.all(cacheKeys.map((name) => caches.delete(name)));
        } catch {
          // Ignore cache deletion error
        }
      }

      // 3. Fallback reload timer in case controllerchange takes too long
      const reloadTimeout = setTimeout(() => {
        window.location.reload();
      }, 800);

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener(
          'controllerchange',
          () => {
            clearTimeout(reloadTimeout);
            window.location.reload();
          },
          { once: true }
        );
      }
    } catch {
      window.location.reload();
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    let isMounted = true;

    const handleWaitingWorker = (worker: ServiceWorker) => {
      waitingWorkerRef.current = worker;
      if (isMounted) {
        setHasUpdate(true);
      }
    };

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        if (!isMounted) return;
        registrationRef.current = reg;

        // If a service worker is already waiting, trigger update prompt immediately
        if (reg.waiting) {
          handleWaitingWorker(reg.waiting);
          return;
        }

        // Listen for new service worker installation
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              handleWaitingWorker(newWorker);
            }
          });
        });

        // Periodic check for new versions every 15 minutes
        const updateInterval = setInterval(() => {
          reg.update().catch(() => {});
        }, 15 * 60 * 1000);

        // Check on window focus and online events
        const handleFocus = () => {
          reg.update().catch(() => {});
        };
        const handleOnline = () => {
          reg.update().catch(() => {});
        };

        window.addEventListener('focus', handleFocus);
        window.addEventListener('online', handleOnline);

        return () => {
          clearInterval(updateInterval);
          window.removeEventListener('focus', handleFocus);
          window.removeEventListener('online', handleOnline);
        };
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  if (!hasUpdate || isDismissed) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed inset-x-3 top-3 z-50 mx-auto max-w-md animate-bounce-subtle select-none"
    >
      <div className="overflow-hidden rounded-[24px] border border-[#C89B4E]/40 bg-gradient-to-r from-[#1E4C40] via-[#173F35] to-[#123129] p-3.5 text-[#F6F0E4] shadow-[0_20px_45px_-18px_rgba(16,46,39,0.85),0_0_24px_rgba(200,155,78,0.25)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#C89B4E]/20 text-[#EAD8AF] ring-1 ring-[#EAD8AF]/30">
              <RefreshCw
                className={`h-5 w-5 ${isUpdating ? 'animate-spin' : 'animate-[spin_4s_linear_infinite]'}`}
              />
              <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#EAD8AF] opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#EAD8AF]" />
              </span>
            </span>

            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#C89B4E]/25 px-2 py-0.5 text-[8.5px] font-extrabold uppercase tracking-[0.16em] text-[#F0DDB4]">
                <Sparkles className="h-2.5 w-2.5" />
                Pembaruan Aplikasi
              </div>
              <h4 className="mt-1 text-[13px] font-extrabold leading-snug text-white">
                Versi Baru talaQids Tersedia
              </h4>
              <p className="mt-0.5 text-[10.5px] leading-relaxed text-[#EAD8AF]/90">
                Pembaruan telah siap. Muat ulang sekarang untuk menerapkan fitur &amp; memperbarui cache.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            aria-label="Tutup notifikasi pembaruan"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#EAD8AF]/60 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-end gap-2 border-t border-white/10 pt-2.5">
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            disabled={isUpdating}
            className="rounded-full px-3 py-1.5 text-[11px] font-bold text-[#EAD8AF]/80 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
          >
            Nanti Saja
          </button>

          <button
            type="button"
            onClick={() => void applyUpdate()}
            disabled={isUpdating}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#C89B4E] to-[#deb367] px-4 py-1.5 text-[11px] font-extrabold text-[#15231E] shadow-sm transition hover:brightness-105 active:scale-95 disabled:opacity-60"
          >
            <RefreshCw className={`h-3 w-3 ${isUpdating ? 'animate-spin' : ''}`} />
            {isUpdating ? 'Memperbarui...' : 'Perbarui Sekarang'}
          </button>
        </div>
      </div>
    </div>
  );
}
