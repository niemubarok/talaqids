/**
 * Metadata map for 30 Juz, Surahs, and page ranges in Quran (Madinah Mushaf 604 pages).
 */

export interface SurahMeta {
  number: number;
  name: string;
  arabicName: string;
  totalAyah: number;
}

export interface JuzMeta {
  juz: number;
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
  startPage: number;
  endPage: number;
  surahList: number[];
  nameArabic: string;
  nameTransliteration: string;
}

export interface Reciter {
  id: string;
  name: string;
  style: string;
  bitrate: '64kbps' | '128kbps';
  subfolder: string;
  isPro: boolean;
}

export const RECITERS: Reciter[] = [
  {
    id: 'al_husary',
    name: 'Syaikh Mahmud Khalil Al-Husary',
    style: 'Murattal (Tartil Jelas & Tenang)',
    bitrate: '64kbps',
    subfolder: 'Husary_64kbps',
    isPro: false, // Free default reciter
  },
  {
    id: 'al_minshawi',
    name: 'Syaikh Muhammad Siddiq Al-Minshawi',
    style: 'Murattal (Khas Khusyu)',
    bitrate: '128kbps',
    subfolder: 'Minshawy_Murattal_128kbps',
    isPro: true,
  },
  {
    id: 'alafasy',
    name: 'Syaikh Mishary Rashid Alafasy',
    style: 'Murattal (Melodius Berirama)',
    bitrate: '128kbps',
    subfolder: 'Alafasy_128kbps',
    isPro: true,
  },
  {
    id: 'abdul_basit',
    name: 'Syaikh Abdul Basit Abdul Samad',
    style: 'Murattal (Artikulasi Kuat)',
    bitrate: '64kbps',
    subfolder: 'Abdul_Basit_Murattal_64kbps',
    isPro: true,
  },
];

// 114 Surahs Basic Metadata
export const SURAHS: Record<number, SurahMeta> = {
  1: { number: 1, name: 'Al-Fatihah', arabicName: 'الفاتحة', totalAyah: 7 },
  2: { number: 2, name: 'Al-Baqarah', arabicName: 'البقرة', totalAyah: 286 },
  3: { number: 3, name: 'Ali Imran', arabicName: 'آل عمران', totalAyah: 200 },
  4: { number: 4, name: 'An-Nisa', arabicName: 'النساء', totalAyah: 176 },
  5: { number: 5, name: 'Al-Maidah', arabicName: 'المائدة', totalAyah: 120 },
  6: { number: 6, name: 'Al-Anam', arabicName: 'الأنعام', totalAyah: 165 },
  7: { number: 7, name: 'Al-Araf', arabicName: 'الأعراف', totalAyah: 206 },
  8: { number: 8, name: 'Al-Anfal', arabicName: 'الأنفال', totalAyah: 75 },
  9: { number: 9, name: 'At-Taubah', arabicName: 'التوبة', totalAyah: 129 },
  10: { number: 10, name: 'Yunus', arabicName: 'يونس', totalAyah: 109 },
  11: { number: 11, name: 'Hud', arabicName: 'هود', totalAyah: 123 },
  12: { number: 12, name: 'Yusuf', arabicName: 'يوسف', totalAyah: 111 },
  13: { number: 13, name: 'Ar-Rad', arabicName: 'الرعد', totalAyah: 43 },
  14: { number: 14, name: 'Ibrahim', arabicName: 'إبراهيم', totalAyah: 52 },
  15: { number: 15, name: 'Al-Hijr', arabicName: 'الحجر', totalAyah: 99 },
  16: { number: 16, name: 'An-Nahl', arabicName: 'النحل', totalAyah: 128 },
  17: { number: 17, name: 'Al-Isra', arabicName: 'الإسراء', totalAyah: 111 },
  18: { number: 18, name: 'Al-Kahf', arabicName: 'الكهف', totalAyah: 110 },
  19: { number: 19, name: 'Maryam', arabicName: 'مريم', totalAyah: 98 },
  20: { number: 20, name: 'Taha', arabicName: 'طه', totalAyah: 135 },
  21: { number: 21, name: 'Al-Anbiya', arabicName: 'الأنبياء', totalAyah: 112 },
  22: { number: 22, name: 'Al-Hajj', arabicName: 'الحج', totalAyah: 78 },
  23: { number: 23, name: 'Al-Muminun', arabicName: 'المؤمنون', totalAyah: 118 },
  24: { number: 24, name: 'An-Nur', arabicName: 'النور', totalAyah: 64 },
  25: { number: 25, name: 'Al-Furqan', arabicName: 'الفرقان', totalAyah: 77 },
  26: { number: 26, name: 'Asy-Syuara', arabicName: 'الشعراء', totalAyah: 227 },
  27: { number: 27, name: 'An-Naml', arabicName: 'النمل', totalAyah: 93 },
  28: { number: 28, name: 'Al-Qasas', arabicName: 'القصص', totalAyah: 88 },
  29: { number: 29, name: 'Al-Ankabut', arabicName: 'العنكبوت', totalAyah: 69 },
  30: { number: 30, name: 'Ar-Rum', arabicName: 'الروم', totalAyah: 60 },
  31: { number: 31, name: 'Luqman', arabicName: 'لقمان', totalAyah: 34 },
  32: { number: 32, name: 'As-Sajdah', arabicName: 'السجدة', totalAyah: 30 },
  33: { number: 33, name: 'Al-Ahzab', arabicName: 'الأحزاب', totalAyah: 73 },
  34: { number: 34, name: 'Saba', arabicName: 'سبأ', totalAyah: 54 },
  35: { number: 35, name: 'Fatir', arabicName: 'فاطر', totalAyah: 45 },
  36: { number: 36, name: 'Yasin', arabicName: 'يس', totalAyah: 83 },
  37: { number: 37, name: 'As-Saffat', arabicName: 'الصافات', totalAyah: 182 },
  38: { number: 38, name: 'Sad', arabicName: 'ص', totalAyah: 88 },
  39: { number: 39, name: 'Az-Zumar', arabicName: 'الزمر', totalAyah: 75 },
  40: { number: 40, name: 'Ghafir', arabicName: 'غافر', totalAyah: 85 },
  41: { number: 41, name: 'Fussilat', arabicName: 'فصلت', totalAyah: 54 },
  42: { number: 42, name: 'Asy-Syura', arabicName: 'الشورى', totalAyah: 53 },
  43: { number: 43, name: 'Az-Zukhruf', arabicName: 'الزخرف', totalAyah: 89 },
  44: { number: 44, name: 'Ad-Dukhan', arabicName: 'الدخان', totalAyah: 59 },
  45: { number: 45, name: 'Al-Jasiyah', arabicName: 'الجاثية', totalAyah: 37 },
  46: { number: 46, name: 'Al-Ahqaf', arabicName: 'الأحقاف', totalAyah: 35 },
  47: { number: 47, name: 'Muhammad', arabicName: 'محمد', totalAyah: 38 },
  48: { number: 48, name: 'Al-Fath', arabicName: 'الفتح', totalAyah: 29 },
  49: { number: 49, name: 'Al-Hujurat', arabicName: 'الحجرات', totalAyah: 18 },
  50: { number: 50, name: 'Qaf', arabicName: 'ق', totalAyah: 45 },
  51: { number: 51, name: 'Az-Zariyat', arabicName: 'الذاريات', totalAyah: 60 },
  52: { number: 52, name: 'At-Tur', arabicName: 'الطور', totalAyah: 49 },
  53: { number: 53, name: 'An-Najm', arabicName: 'النجم', totalAyah: 62 },
  54: { number: 54, name: 'Al-Qamar', arabicName: 'القمر', totalAyah: 55 },
  55: { number: 55, name: 'Ar-Rahman', arabicName: 'الرحمن', totalAyah: 78 },
  56: { number: 56, name: 'Al-Waqiah', arabicName: 'الواقعة', totalAyah: 96 },
  57: { number: 57, name: 'Al-Hadid', arabicName: 'الحديد', totalAyah: 29 },
  58: { number: 58, name: 'Al-Mujadilah', arabicName: 'المجادلة', totalAyah: 22 },
  59: { number: 59, name: 'Al-Hasyr', arabicName: 'الحشر', totalAyah: 24 },
  60: { number: 60, name: 'Al-Mumtahanah', arabicName: 'الممتحنة', totalAyah: 13 },
  61: { number: 61, name: 'As-Saff', arabicName: 'الصف', totalAyah: 14 },
  62: { number: 62, name: 'Al-Jumuah', arabicName: 'الجمعة', totalAyah: 11 },
  63: { number: 63, name: 'Al-Munafiqun', arabicName: 'المنافقون', totalAyah: 11 },
  64: { number: 64, name: 'At-Taghabun', arabicName: 'التغابن', totalAyah: 18 },
  65: { number: 65, name: 'At-Talaq', arabicName: 'الطلاق', totalAyah: 12 },
  66: { number: 66, name: 'At-Tahrim', arabicName: 'التحريم', totalAyah: 12 },
  67: { number: 67, name: 'Al-Mulk', arabicName: 'الملك', totalAyah: 30 },
  68: { number: 68, name: 'Al-Qalam', arabicName: 'القلم', totalAyah: 52 },
  69: { number: 69, name: 'Al-Haqqah', arabicName: 'الحاقة', totalAyah: 52 },
  70: { number: 70, name: 'Al-Marij', arabicName: 'المعارج', totalAyah: 44 },
  71: { number: 71, name: 'Nuh', arabicName: 'نوح', totalAyah: 28 },
  72: { number: 72, name: 'Al-Jinn', arabicName: 'الجن', totalAyah: 28 },
  73: { number: 73, name: 'Al-Muzzammil', arabicName: 'المزمل', totalAyah: 20 },
  74: { number: 74, name: 'Al-Muddassir', arabicName: 'المدثر', totalAyah: 56 },
  75: { number: 75, name: 'Al-Qiyamah', arabicName: 'القيامة', totalAyah: 40 },
  76: { number: 76, name: 'Al-Insan', arabicName: 'الإنسان', totalAyah: 31 },
  77: { number: 77, name: 'Al-Mursalat', arabicName: 'المرسلات', totalAyah: 50 },
  78: { number: 78, name: 'An-Naba', arabicName: 'النبأ', totalAyah: 40 },
  79: { number: 79, name: 'An-Naziat', arabicName: 'النازعات', totalAyah: 46 },
  80: { number: 80, name: 'Abasa', arabicName: 'عبس', totalAyah: 42 },
  81: { number: 81, name: 'At-Takwir', arabicName: 'التكوير', totalAyah: 29 },
  82: { number: 82, name: 'Al-Infitar', arabicName: 'الانفطار', totalAyah: 19 },
  83: { number: 83, name: 'Al-Mutaffifin', arabicName: 'المطففين', totalAyah: 36 },
  84: { number: 84, name: 'Al-Insyiqaq', arabicName: 'الانشقاق', totalAyah: 25 },
  85: { number: 85, name: 'Al-Buruj', arabicName: 'البروج', totalAyah: 22 },
  86: { number: 86, name: 'At-Tariq', arabicName: 'الطارق', totalAyah: 17 },
  87: { number: 87, name: 'Al-Ala', arabicName: 'الأعلى', totalAyah: 19 },
  88: { number: 88, name: 'Al-Ghasyiyah', arabicName: 'الغاشية', totalAyah: 26 },
  89: { number: 89, name: 'Al-Fajr', arabicName: 'الفجر', totalAyah: 30 },
  90: { number: 90, name: 'Al-Balad', arabicName: 'البلد', totalAyah: 20 },
  91: { number: 91, name: 'Asy-Syams', arabicName: 'الشمس', totalAyah: 15 },
  92: { number: 92, name: 'Al-Lail', arabicName: 'الليل', totalAyah: 21 },
  93: { number: 93, name: 'Ad-Duha', arabicName: 'الضحى', totalAyah: 11 },
  94: { number: 94, name: 'Asy-Syarh', arabicName: 'الشرح', totalAyah: 8 },
  95: { number: 95, name: 'At-Tin', arabicName: 'التين', totalAyah: 8 },
  96: { number: 96, name: 'Al-Alaq', arabicName: 'العلق', totalAyah: 19 },
  97: { number: 97, name: 'Al-Qadr', arabicName: 'القدر', totalAyah: 5 },
  98: { number: 98, name: 'Al-Bayyinah', arabicName: 'البينة', totalAyah: 8 },
  99: { number: 99, name: 'Az-Zalzalah', arabicName: 'الزلزلة', totalAyah: 8 },
  100: { number: 100, name: 'Al-Adiyat', arabicName: 'العاديات', totalAyah: 11 },
  101: { number: 101, name: 'Al-Qariah', arabicName: 'القارعة', totalAyah: 11 },
  102: { number: 102, name: 'At-Takasur', arabicName: 'التكاثر', totalAyah: 8 },
  103: { number: 103, name: 'Al-Asr', arabicName: 'العصر', totalAyah: 3 },
  104: { number: 104, name: 'Al-Humazah', arabicName: 'الهمزة', totalAyah: 9 },
  105: { number: 105, name: 'Al-Fil', arabicName: 'الفيل', totalAyah: 5 },
  106: { number: 106, name: 'Quraisy', arabicName: 'قريش', totalAyah: 4 },
  107: { number: 107, name: 'Al-Maun', arabicName: 'الماعون', totalAyah: 7 },
  108: { number: 108, name: 'Al-Kausar', arabicName: 'الكوثر', totalAyah: 3 },
  109: { number: 109, name: 'Al-Kafirun', arabicName: 'الكافرون', totalAyah: 6 },
  110: { number: 110, name: 'An-Nasr', arabicName: 'النصر', totalAyah: 3 },
  111: { number: 111, name: 'Al-Lahab', arabicName: 'اللهب', totalAyah: 5 },
  112: { number: 112, name: 'Al-Ikhlas', arabicName: 'الإخلاص', totalAyah: 4 },
  113: { number: 113, name: 'Al-Falaq', arabicName: 'الفلق', totalAyah: 5 },
  114: { number: 114, name: 'An-Nas', arabicName: 'الناس', totalAyah: 6 },
};

// 30 Juz Reference Definition (standard Madinah Mushaf)
export const JUZ_LIST: JuzMeta[] = [
  { juz: 1, startSurah: 1, startAyah: 1, endSurah: 2, endAyah: 141, startPage: 1, endPage: 21, surahList: [1, 2], nameArabic: 'الم', nameTransliteration: 'Alif Lam Mim' },
  { juz: 2, startSurah: 2, startAyah: 142, endSurah: 2, endAyah: 252, startPage: 22, endPage: 41, surahList: [2], nameArabic: 'سيقول', nameTransliteration: 'Sayaqulu' },
  { juz: 3, startSurah: 2, startAyah: 253, endSurah: 3, endAyah: 92, startPage: 42, endPage: 61, surahList: [2, 3], nameArabic: 'تلك الرسل', nameTransliteration: 'Tilkar Rusul' },
  { juz: 4, startSurah: 3, startAyah: 93, endSurah: 4, endAyah: 23, startPage: 62, endPage: 81, surahList: [3, 4], nameArabic: 'لن تنالوا', nameTransliteration: 'Lan Tanaalu' },
  { juz: 5, startSurah: 4, startAyah: 24, endSurah: 4, endAyah: 147, startPage: 82, endPage: 101, surahList: [4], nameArabic: 'والمحصنات', nameTransliteration: 'Wal Muhsanat' },
  { juz: 6, startSurah: 4, startAyah: 148, endSurah: 5, endAyah: 81, startPage: 102, endPage: 121, surahList: [4, 5], nameArabic: 'لا يحب الله', nameTransliteration: 'La Yuhibbullah' },
  { juz: 7, startSurah: 5, startAyah: 82, endSurah: 6, endAyah: 110, startPage: 122, endPage: 141, surahList: [5, 6], nameArabic: 'وإذا سمعوا', nameTransliteration: 'Wa Iza Samiu' },
  { juz: 8, startSurah: 6, startAyah: 111, endSurah: 7, endAyah: 87, startPage: 142, endPage: 161, surahList: [6, 7], nameArabic: 'ولو أننا', nameTransliteration: 'Wa Lau Annana' },
  { juz: 9, startSurah: 7, startAyah: 88, endSurah: 8, endAyah: 40, startPage: 162, endPage: 181, surahList: [7, 8], nameArabic: 'قال الملأ', nameTransliteration: 'Qalal Mala-u' },
  { juz: 10, startSurah: 8, startAyah: 41, endSurah: 9, endAyah: 92, startPage: 182, endPage: 201, surahList: [8, 9], nameArabic: 'واعلموا', nameTransliteration: 'Walamu' },
  { juz: 11, startSurah: 9, startAyah: 93, endSurah: 11, endAyah: 5, startPage: 202, endPage: 221, surahList: [9, 10, 11], nameArabic: 'يعتذرون', nameTransliteration: 'Yatazirun' },
  { juz: 12, startSurah: 11, startAyah: 6, endSurah: 12, endAyah: 52, startPage: 222, endPage: 241, surahList: [11, 12], nameArabic: 'وما من دابة', nameTransliteration: 'Wa Ma Min Dabbah' },
  { juz: 13, startSurah: 12, startAyah: 53, endSurah: 14, endAyah: 52, startPage: 242, endPage: 261, surahList: [12, 13, 14], nameArabic: 'وما أبرئ', nameTransliteration: 'Wa Ma Ubarriu' },
  { juz: 14, startSurah: 15, startAyah: 1, endSurah: 16, endAyah: 128, startPage: 262, endPage: 281, surahList: [15, 16], nameArabic: 'ربما', nameTransliteration: 'Rubama' },
  { juz: 15, startSurah: 17, startAyah: 1, endSurah: 18, endAyah: 74, startPage: 282, endPage: 301, surahList: [17, 18], nameArabic: 'سبحان الذي', nameTransliteration: 'Subhanallazi' },
  { juz: 16, startSurah: 18, startAyah: 75, endSurah: 20, endAyah: 135, startPage: 302, endPage: 321, surahList: [18, 19, 20], nameArabic: 'قال ألم', nameTransliteration: 'Qala Alam' },
  { juz: 17, startSurah: 21, startAyah: 1, endSurah: 22, endAyah: 78, startPage: 322, endPage: 341, surahList: [21, 22], nameArabic: 'اقترب', nameTransliteration: 'Iqtaraba' },
  { juz: 18, startSurah: 23, startAyah: 1, endSurah: 25, endAyah: 20, startPage: 342, endPage: 361, surahList: [23, 24, 25], nameArabic: 'قد أفلح', nameTransliteration: 'Qad Aflaha' },
  { juz: 19, startSurah: 25, startAyah: 21, endSurah: 27, endAyah: 55, startPage: 362, endPage: 381, surahList: [25, 26, 27], nameArabic: 'وقال الذين', nameTransliteration: 'Wa Qalallazina' },
  { juz: 20, startSurah: 27, startAyah: 56, endSurah: 29, endAyah: 45, startPage: 382, endPage: 401, surahList: [27, 28, 29], nameArabic: 'فما كان', nameTransliteration: 'Fama Kana' },
  { juz: 21, startSurah: 29, startAyah: 46, endSurah: 33, endAyah: 30, startPage: 402, endPage: 421, surahList: [29, 30, 31, 32, 33], nameArabic: 'ولا تجادلوا', nameTransliteration: 'Wa La Tujadilu' },
  { juz: 22, startSurah: 33, startAyah: 31, endSurah: 36, endAyah: 27, startPage: 422, endPage: 441, surahList: [33, 34, 35, 36], nameArabic: 'ومن يقنت', nameTransliteration: 'Wa Man Yaqnut' },
  { juz: 23, startSurah: 36, startAyah: 28, endSurah: 39, endAyah: 31, startPage: 442, endPage: 461, surahList: [36, 37, 38, 39], nameArabic: 'وما أنزلنا', nameTransliteration: 'Wa Ma Anzalna' },
  { juz: 24, startSurah: 39, startAyah: 32, endSurah: 41, endAyah: 46, startPage: 462, endPage: 481, surahList: [39, 40, 41], nameArabic: 'فمن أظلم', nameTransliteration: 'Faman Azlamu' },
  { juz: 25, startSurah: 41, startAyah: 47, endSurah: 45, endAyah: 37, startPage: 482, endPage: 501, surahList: [41, 42, 43, 44, 45], nameArabic: 'إليه يرد', nameTransliteration: 'Ilaihi Yuraddu' },
  { juz: 26, startSurah: 46, startAyah: 1, endSurah: 51, endAyah: 30, startPage: 502, endPage: 521, surahList: [46, 47, 48, 49, 50, 51], nameArabic: 'حم', nameTransliteration: 'Ha Mim' },
  { juz: 27, startSurah: 51, startAyah: 31, endSurah: 57, endAyah: 29, startPage: 522, endPage: 541, surahList: [51, 52, 53, 54, 55, 56, 57], nameArabic: 'قال فما خطبكم', nameTransliteration: 'Qala Fama Khatbukum' },
  { juz: 28, startSurah: 58, startAyah: 1, endSurah: 66, endAyah: 12, startPage: 542, endPage: 561, surahList: [58, 59, 60, 61, 62, 63, 64, 65, 66], nameArabic: 'قد سمع الله', nameTransliteration: 'Qad Sami Allah' },
  { juz: 29, startSurah: 67, startAyah: 1, endSurah: 77, endAyah: 50, startPage: 562, endPage: 581, surahList: [67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77], nameArabic: 'تبارك الذي', nameTransliteration: 'Tabarakallazi' },
  { juz: 30, startSurah: 78, startAyah: 1, endSurah: 114, endAyah: 6, startPage: 582, endPage: 604, surahList: [78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114], nameArabic: 'عم', nameTransliteration: 'Amma' },
];

/**
 * Returns metadata for a Juz (1-30)
 */
export function getJuzMeta(juz: number): JuzMeta {
  const meta = JUZ_LIST.find((j) => j.juz === juz);
  if (!meta) throw new Error(`Invalid Juz number: ${juz}`);
  return meta;
}

/**
 * Build EveryAyah MP3 CDN URL
 * @param reciterId id of the reciter from RECITERS
 * @param surahNumber 1-114
 * @param ayahNumber 1-N
 */
export function buildAyahAudioUrl(reciterId: string, surahNumber: number, ayahNumber: number): string {
  const reciter = RECITERS.find((r) => r.id === reciterId) || RECITERS[0];
  const sStr = String(surahNumber).padStart(3, '0');
  const aStr = String(ayahNumber).padStart(3, '0');
  return `https://everyayah.com/data/${reciter.subfolder}/${sStr}${aStr}.mp3`;
}

/**
 * Generate full list of Ayahs in a given Juz
 */
export interface AyahTrackItem {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  arabicName: string;
  audioUrl: string;
  relativePage: number; // 1 to 20 within active Juz
  mushafPage: number; // 1 to 604 in Madinah Mushaf
}

export function getJuzAyahTracks(juz: number, reciterId: string): AyahTrackItem[] {
  const meta = getJuzMeta(juz);
  const rawTracks: Omit<AyahTrackItem, 'relativePage' | 'mushafPage'>[] = [];

  for (let s = meta.startSurah; s <= meta.endSurah; s++) {
    const surah = SURAHS[s];
    if (!surah) continue;
    const startA = s === meta.startSurah ? meta.startAyah : 1;
    const endA = s === meta.endSurah ? meta.endAyah : surah.totalAyah;

    for (let a = startA; a <= endA; a++) {
      rawTracks.push({
        surahNumber: s,
        ayahNumber: a,
        surahName: surah.name,
        arabicName: surah.arabicName,
        audioUrl: buildAyahAudioUrl(reciterId, s, a),
      });
    }
  }

  const totalPages = Math.min(20, meta.endPage - meta.startPage + 1);
  const totalTracks = Math.max(1, rawTracks.length);

  return rawTracks.map((item, idx) => {
    const relativePage = Math.min(
      totalPages,
      Math.floor((idx / totalTracks) * totalPages) + 1
    );
    const mushafPage = meta.startPage + relativePage - 1;
    return {
      ...item,
      relativePage,
      mushafPage,
    };
  });
}
