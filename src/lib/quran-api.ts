/**
 * Fetcher for Quran text from multiple verified sources & Indonesian translation.
 * Local-first cached in browser Cache API & fallback to CDN.
 */

export type QuranSourceEdition =
  | 'quran-uthmani' // AlQuran Cloud Madinah Uthmani
  | 'quran-com-uthmani' // Quran.com API v4 Uthmani Script
  | 'quran-com-indopak' // Quran.com API v4 IndoPak Script (Naskh 15/16 baris)
  | 'quran-simple'; // AlQuran Cloud Simple Clean Text

export interface QuranSourceMeta {
  id: QuranSourceEdition;
  name: string;
  shortName: string;
  provider: 'AlQuran Cloud' | 'Quran.com API v4';
  description: string;
  badge: string;
}

export const QURAN_SOURCES: QuranSourceMeta[] = [
  {
    id: 'quran-uthmani',
    name: 'Mushaf Madinah Rasm Utsmani',
    shortName: 'Madinah Uthmani',
    provider: 'AlQuran Cloud',
    description: 'Standar Rasm Utsmani Kompleks Percetakan Al-Qur’an Raja Fahd (Madinah) dengan tanda waqaf lengkap.',
    badge: 'Madinah',
  },
  {
    id: 'quran-com-uthmani',
    name: 'Quran.com V4 Uthmani',
    shortName: 'Quran.com V4',
    provider: 'Quran.com API v4',
    description: 'Teks Rasm Utsmani resmi dari Quran Foundation / Quran.com API v4 dengan terjemahan standar Kemenag RI.',
    badge: 'Quran.com',
  },
  {
    id: 'quran-com-indopak',
    name: 'Mushaf IndoPak (Naskh Tebal)',
    shortName: 'IndoPak',
    provider: 'Quran.com API v4',
    description: 'Khat Naskh Asia Selatan & Nusantara yang sangat familiar, tebal, dan mudah dibaca oleh anak-anak.',
    badge: 'IndoPak',
  },
  {
    id: 'quran-simple',
    name: 'Rasm Sederhana (Simple Clean)',
    shortName: 'Simple',
    provider: 'AlQuran Cloud',
    description: 'Teks Arab berharakat bersih tanpa tanda waqaf rumit, memudahkan anak dalam proses pengenalan huruf dan harakat.',
    badge: 'Simple',
  },
];

export interface QuranVerseText {
  surah: number;
  ayah: number;
  textArabic: string;
  textIndo: string;
  pageNumber: number;
}

const QURAN_API_CACHE = 'talaqids-quran-text-v2';

/**
 * Fetch verses for a specific page of Quran (1-604) from the selected edition source
 */
export async function fetchVersesByPage(
  pageNumber: number,
  source: QuranSourceEdition = 'quran-uthmani'
): Promise<QuranVerseText[]> {
  const cacheKey = `https://api.talaqids.local/page/${pageNumber}/${source}`;
  
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
    let result: QuranVerseText[] = [];

    if (source === 'quran-com-uthmani') {
      // Quran.com API v4 with Indonesian translation (resource_id 33 = Kemenag RI)
      const res = await fetch(
        `https://api.quran.com/api/v4/verses/by_page/${pageNumber}?words=false&translations=33&fields=text_uthmani`
      );
      const data = await res.json();
      const rawVerses = data.verses || [];
      result = rawVerses.map((v: { verse_key: string; text_uthmani: string; translations?: { text: string }[] }) => {
        const [s, a] = v.verse_key.split(':').map(Number);
        const rawIndo = v.translations?.[0]?.text || '';
        const cleanIndo = rawIndo.replace(/<[^>]*>?/gm, '').trim();
        return {
          surah: s,
          ayah: a,
          textArabic: v.text_uthmani,
          textIndo: cleanIndo,
          pageNumber,
        };
      });
    } else if (source === 'quran-com-indopak') {
      // Quran.com API v4 with IndoPak script
      const res = await fetch(
        `https://api.quran.com/api/v4/verses/by_page/${pageNumber}?words=false&translations=33&fields=text_indopak`
      );
      const data = await res.json();
      const rawVerses = data.verses || [];
      result = rawVerses.map((v: { verse_key: string; text_indopak: string; translations?: { text: string }[] }) => {
        const [s, a] = v.verse_key.split(':').map(Number);
        const rawIndo = v.translations?.[0]?.text || '';
        const cleanIndo = rawIndo.replace(/<[^>]*>?/gm, '').trim();
        return {
          surah: s,
          ayah: a,
          textArabic: v.text_indopak,
          textIndo: cleanIndo,
          pageNumber,
        };
      });
    } else {
      // AlQuran Cloud (quran-uthmani or quran-simple)
      const editionSlug = source === 'quran-simple' ? 'quran-simple' : 'quran-uthmani';
      const res = await fetch(`https://api.alquran.cloud/v1/page/${pageNumber}/${editionSlug}`);
      const data = await res.json();
      
      // Also fetch Indonesian translation
      const resIndo = await fetch(`https://api.alquran.cloud/v1/page/${pageNumber}/id.indonesian`);
      const dataIndo = await resIndo.json();

      const arabicAyahs = data.data?.ayahs || [];
      const indoAyahs = dataIndo.data?.ayahs || [];

      result = arabicAyahs.map((item: { surah: { number: number }; numberInSurah: number; text: string }, idx: number) => {
        const indo = indoAyahs[idx]?.text || '';
        return {
          surah: item.surah.number,
          ayah: item.numberInSurah,
          textArabic: item.text,
          textIndo: indo,
          pageNumber,
        };
      });
    }

    if (result.length > 0 && typeof window !== 'undefined' && 'caches' in window) {
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
        textIndo: 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang. (Hubungkan internet sekali untuk memuat dan menyimpan teks halaman ini).',
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
