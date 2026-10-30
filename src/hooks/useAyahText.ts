'use client';

import { useEffect, useState } from 'react';
import { fetchVerseByAyah, fetchVersesByPage, type QuranVerseText } from '@/lib/quran-api';

interface AyahRef {
  surahNumber: number;
  ayahNumber: number;
  mushafPage: number;
}

const pageCache = new Map<number, QuranVerseText[]>();
const ayahCache = new Map<string, QuranVerseText>();
const inFlight = new Map<number, Promise<QuranVerseText[]>>();

function findInCachedPages(surah: number, ayah: number): QuranVerseText | null {
  const key = `${surah}:${ayah}`;
  const direct = ayahCache.get(key);
  if (direct) return direct;

  for (const verses of pageCache.values()) {
    const match = verses.find((item) => item.surah === surah && item.ayah === ayah);
    if (match) {
      ayahCache.set(key, match);
      return match;
    }
  }
  return null;
}

function loadPage(page: number): Promise<QuranVerseText[]> {
  const cached = pageCache.get(page);
  if (cached) return Promise.resolve(cached);

  const pending = inFlight.get(page);
  if (pending) return pending;

  const request = fetchVersesByPage(page)
    .then((verses) => {
      pageCache.set(page, verses);
      for (const v of verses) {
        ayahCache.set(`${v.surah}:${v.ayah}`, v);
      }
      inFlight.delete(page);
      return verses;
    })
    .catch((error) => {
      inFlight.delete(page);
      throw error;
    });

  inFlight.set(page, request);
  return request;
}

async function resolveAyahText(
  surahNumber: number,
  ayahNumber: number,
  hintPage: number
): Promise<QuranVerseText | null> {
  const cached = findInCachedPages(surahNumber, ayahNumber);
  if (cached) return cached;

  // Try the estimated page first
  try {
    const pageVerses = await loadPage(hintPage);
    const match = pageVerses.find(
      (item) => item.surah === surahNumber && item.ayah === ayahNumber
    );
    if (match) return match;
  } catch {
    // continue to direct ayah lookup
  }

  // Fallback: fetch exact surah:ayah and preload its actual Madinah Mushaf page
  const exactVerse = await fetchVerseByAyah(surahNumber, ayahNumber);
  if (exactVerse) {
    ayahCache.set(`${surahNumber}:${ayahNumber}`, exactVerse);
    if (exactVerse.pageNumber && exactVerse.pageNumber !== hintPage) {
      void loadPage(exactVerse.pageNumber);
    }
    return exactVerse;
  }

  return null;
}

/**
 * Resolves the text (Rasm Utsmani + terjemahan) for the ayah that is currently
 * being recited. Pages and individual ayahs are cached automatically.
 */
export function useAyahText(track: AyahRef | undefined) {
  const [verse, setVerse] = useState<QuranVerseText | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const surahNumber = track?.surahNumber;
  const ayahNumber = track?.ayahNumber;
  const mushafPage = track?.mushafPage;

  useEffect(() => {
    if (!surahNumber || !ayahNumber || !mushafPage) {
      setVerse(null);
      return;
    }

    const immediate = findInCachedPages(surahNumber, ayahNumber);
    if (immediate) {
      setVerse(immediate);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    resolveAyahText(surahNumber, ayahNumber, mushafPage)
      .then((resolved) => {
        if (cancelled) return;
        setVerse(resolved);
        setIsLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setVerse(null);
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [surahNumber, ayahNumber, mushafPage]);

  return { verse, isLoading };
}
