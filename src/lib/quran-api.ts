/**
 * Fetcher for Quran text (Rasm Utsmani) & Indonesian translation (Kemenag).
 * Local-first cached in browser Cache API & fallback to CDN.
 */

export interface QuranVerseText {
  surah: number;
  ayah: number;
  textArabic: string;
  textIndo: string;
  pageNumber: number;
}

const QURAN_API_CACHE = 'talaqids-quran-text-v1';

/**
 * Fetch verses for a specific page of Quran (1-604)
 */
export async function fetchVersesByPage(pageNumber: number): Promise<QuranVerseText[]> {
  const cacheKey = `https://api.talaqids.local/page/${pageNumber}`;
  
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const cache = await caches.open(QURAN_API_CACHE);
      const cached = await cache.match(cacheKey);
      if (cached) {
        return (await cached.json()) as QuranVerseText[];
      }
    } catch {
      // ignore cache failure
    }
  }

  try {
    // We use Quran.com API v4 / AlQuran Cloud API which provides Madinah Mushaf per page
    const res = await fetch(`https://api.alquran.cloud/v1/page/${pageNumber}/quran-uthmani`);
    const data = await res.json();
    
    // Also fetch Indonesian translation
    const resIndo = await fetch(`https://api.alquran.cloud/v1/page/${pageNumber}/id.indonesian`);
    const dataIndo = await resIndo.json();

    const arabicAyahs = data.data?.ayahs || [];
    const indoAyahs = dataIndo.data?.ayahs || [];

    const result: QuranVerseText[] = arabicAyahs.map((item: { surah: { number: number }; numberInSurah: number; text: string }, idx: number) => {
      const indo = indoAyahs[idx]?.text || '';
      return {
        surah: item.surah.number,
        ayah: item.numberInSurah,
        textArabic: item.text,
        textIndo: indo,
        pageNumber,
      };
    });

    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        const cache = await caches.open(QURAN_API_CACHE);
        await cache.put(cacheKey, new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } }));
      } catch {
        // ignore cache write error
      }
    }

    return result;
  } catch {
    // If offline and not in cache, generate a structured graceful fallback
    return [
      {
        surah: 1,
        ayah: 1,
        textArabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        textIndo: 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang. (Buka online sekali untuk menyimpan teks lengkap).',
        pageNumber,
      },
    ];
  }
}

/**
 * Fetch a specific verse by surah and ayah number directly (with exact Madinah Mushaf page number).
 */
export async function fetchVerseByAyah(
  surahNumber: number,
  ayahNumber: number
): Promise<QuranVerseText | null> {
  const cacheKey = `https://api.talaqids.local/ayah/${surahNumber}:${ayahNumber}`;

  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const cache = await caches.open(QURAN_API_CACHE);
      const cached = await cache.match(cacheKey);
      if (cached) {
        return (await cached.json()) as QuranVerseText;
      }
    } catch {
      // ignore cache failure
    }
  }

  try {
    const res = await fetch(
      `https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/editions/quran-uthmani,id.indonesian`
    );
    const json = await res.json();
    const editions = Array.isArray(json?.data) ? json.data : [];
    const arabicData = editions[0];
    const indoData = editions[1];

    if (!arabicData?.text) return null;

    const verse: QuranVerseText = {
      surah: surahNumber,
      ayah: ayahNumber,
      textArabic: arabicData.text,
      textIndo: indoData?.text || '',
      pageNumber: arabicData.page || 1,
    };

    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        const cache = await caches.open(QURAN_API_CACHE);
        await cache.put(
          cacheKey,
          new Response(JSON.stringify(verse), { headers: { 'Content-Type': 'application/json' } })
        );
      } catch {
        // ignore cache write error
      }
    }

    return verse;
  } catch {
    return null;
  }
}
