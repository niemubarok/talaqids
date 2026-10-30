'use client';

import React, { useState } from 'react';
import {
  Baby,
  BookOpenCheck,
  Brain,
  CheckCircle2,
  Clock,
  Ear,
  Heart,
  Lightbulb,
  Moon,
  Repeat,
  ShieldCheck,
  Sparkles,
  Sun,
  Volume2,
} from 'lucide-react';
import type { ChildProfile } from '@/lib/db';
import type { CycleStatus } from '@/lib/cycle-math';

interface InsightsViewProps {
  child: ChildProfile;
  cycle: CycleStatus;
  onOpenMushaf: () => void;
  onOpenAudio: () => void;
}

type CategoryFilter = 'semua' | 'metode' | 'parenting' | 'sains' | 'rutinitas';

interface InsightArticle {
  id: string;
  category: Exclude<CategoryFilter, 'semua'>;
  categoryLabel: string;
  title: string;
  subtitle: string;
  readTime: string;
  arabicQuote?: {
    arabic: string;
    translation: string;
    source: string;
  };
  points: string[];
  takeaway: string;
}

const CATEGORIES: { id: CategoryFilter; label: string }[] = [
  { id: 'semua', label: 'Semua' },
  { id: 'metode', label: 'Metode 30 Bulan' },
  { id: 'parenting', label: 'Parenting Islami' },
  { id: 'sains', label: 'Manfaat & Sains' },
  { id: 'rutinitas', label: 'Tips Harian' },
];

const INSIGHT_ARTICLES: InsightArticle[] = [
  {
    id: 'metode-30-bulan',
    category: 'metode',
    categoryLabel: 'Metode 30 Bulan',
    title: 'Mengapa 1 Juz Diputar Berulang Selama 30 Hari Penuh?',
    subtitle:
      'Rahasia kurikulum auditori 30 bulan yang terinspirasi dari penjelasan Ustaz Adi Hidayat.',
    readTime: '3 mnt baca',
    arabicQuote: {
      arabic: 'وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ',
      translation:
        'Dan sungguh, telah Kami mudahkan Al-Qur’an untuk peringatan (dihafal dan dipahami), maka adakah orang yang mau mengambil pelajaran?',
      source: 'QS. Al-Qamar: 17',
    },
    points: [
      'Selama 30 hari penuh, bayi menyimak 1 Juz yang sama setiap hari hingga pola ritme, makhraj, dan urutan ayat terekam kuat di memori bawah sadar.',
      'Dalam waktu 30 bulan (2,5 tahun), anak telah menuntaskan seluruh 30 Juz Al-Qur’an secara bertahap tanpa tekanan kognitif.',
      'Ketika anak mulai fasih berbicara di usia 2,5–3 tahun, ia tidak sedang "menghafal dari nol", melainkan memanggil kembali rekaman suara yang sudah akrab di telinganya.',
    ],
    takeaway:
      'Konsistensi jauh lebih utama daripada durasi yang dipaksakan. Biarkan siklus 30 hari bekerja secara alami.',
  },
  {
    id: 'sains-pendengaran-bayi',
    category: 'sains',
    categoryLabel: 'Manfaat & Sains',
    title: 'Indra Pendengaran: Pintu Belajar Pertama Sejak Lahir',
    subtitle:
      'Mengapa Al-Qur’an selalu mendahulukan kata "As-Sam’a" (pendengaran) sebelum "Al-Abshar" (penglihatan).',
    readTime: '3 mnt baca',
    arabicQuote: {
      arabic: 'وَجَعَلَ لَكُمُ السَّمْعَ وَالْأَبْصَارَ وَالْأَفْئِدَةَ ۙ لَعَلَّكُمْ تَشْكُرُونَ',
      translation:
        'Dan Dia memberi kamu pendengaran, penglihatan, dan hati nurani, agar kamu bersyukur.',
      source: 'QS. An-Nahl: 78',
    },
    points: [
      'Secara neurosains, korteks auditori bayi adalah indra yang paling matang saat lahir dibandingkan penglihatan yang masih buram.',
      'Usia 0–3 tahun adalah periode keemasan (Golden Age) di mana miliaran sinapsis otak terbentuk melalui rangsangan suara yang berulang dan menenangkan.',
      'Lantunan murottal tartil dengan tempo stabil membantu menurunkan hormon kortisol (stres) pada bayi dan menciptakan rasa aman (secure attachment).',
    ],
    takeaway:
      'Setiap ayat yang diputar di kamar anak adalah nutrisi neuro-spiritual yang membangun fondasi kecerdasan dan ketenangan jiwa.',
  },
  {
    id: 'keamanan-audio-layar',
    category: 'sains',
    categoryLabel: 'Manfaat & Sains',
    title: 'Bebas Distraksi Layar & Batas Volume Aman 60%',
    subtitle:
      'Keunggulan mendengarkan lewat talaQids dibanding platform video atau streaming umum.',
    readTime: '2 mnt baca',
    points: [
      'Koklea (rumah siput) pada telinga bayi jauh lebih sensitif. talaQids mengunci batas maksimal volume perangkat lunak di angka 60% agar tetap lembut dan aman.',
      'Tanpa kejutan iklan bervolume keras atau algoritma video acak yang dapat mengejutkan tidur bayi (startle reflex).',
      '100% bebas paparan cahaya biru (screen-free) karena pemutaran berjalan di latar belakang saat layar ponsel terkunci.',
    ],
    takeaway:
      'Letakkan perangkat minimal 1,5–2 meter dari kepala bayi dengan volume lembut seperti bisikan yang menenangkan.',
  },
  {
    id: 'adab-orang-tua-talaqqi',
    category: 'parenting',
    categoryLabel: 'Parenting Islami',
    title: 'Suara Ayah & Bunda Adalah Murottal Terbaik bagi Anak',
    subtitle:
      'Memadukan pemutar murottal otomatis dengan kehadiran hangat orang tua lewat fitur Mushaf Harian.',
    readTime: '4 mnt baca',
    arabicQuote: {
      arabic: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
      translation:
        'Sebaik-baik kalian adalah orang yang mempelajari Al-Qur’an dan mengajarkannya.',
      source: 'HR. Bukhari',
    },
    points: [
      'Audio murottal berfungsi menjaga lingkungan suara (bi’ah qur’aniyah), namun ikatan batin terkuat tetap lahir dari lantunan suara orang tua sendiri.',
      'Gunakan tab Mushaf untuk membaca 1 halaman per hari (20 halaman = 1 Juz tuntas dalam sebulan) sambil memangku atau menyusui si kecil.',
      'Bayi sangat mengenali frekuensi suara ibu dan ayahnya; mendengar orang tuanya membaca ayat yang sama dengan audio harian akan melipatgandakan daya rekamnya.',
    ],
    takeaway:
      'Tidak perlu menunggu bacaan sempurna. Niat tulus dan kebersamaan hangat bersama anak adalah teladan terbaik.',
  },
  {
    id: 'waktu-terbaik-memutar',
    category: 'rutinitas',
    categoryLabel: 'Tips Harian',
    title: '4 Waktu Emas Memperdengarkan Murottal Setiap Hari',
    subtitle:
      'Cara membangun jadwal harian yang ringan, tenang, dan menyatu dengan ritme biologis bayi.',
    readTime: '3 mnt baca',
    points: [
      'Saat Menjelang Tidur (Fase Gelombang Alfa–Theta): Otak anak sangat reseptif menyerap memori jangka panjang. Gunakan fitur Sleep Timer 30 atau 60 menit.',
      'Waktu Pagi Setelah Subuh: Udara segar dan kondisi otak yang baru bangun tidur membantu membangun suasana hati yang damai sepanjang hari.',
      'Saat Menyusui atau Menggendong: Mengasosiasikan lantunan ayat suci dengan dekapan hangat, rasa kenyang, dan kasih sayang ibu.',
      'Saat Bermain Tenang (Tummy Time): Menjadikan Al-Qur’an sebagai latar suara alami di rumah tanpa menghalangi interaksi bicara orang tua.',
    ],
    takeaway:
      'Gunakan fitur "Akhir Juz" atau Sleep Timer 30 menit agar pemutaran berhenti otomatis saat si kecil sudah terlelap dalam.',
  },
  {
    id: 'doa-dan-keikhlasan',
    category: 'parenting',
    categoryLabel: 'Parenting Islami',
    title: 'Menjaga Lurusnya Niat: Bukan Perlombaan, Melainkan Ibadah',
    subtitle:
      'Mendidik generasi cinta Al-Qur’an dengan kelembutan, kesabaran, dan doa yang tak terputus.',
    readTime: '3 mnt baca',
    arabicQuote: {
      arabic: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
      translation:
        'Ya Tuhan kami, anugerahkanlah kepada kami pasangan kami dan keturunan kami sebagai penyenang hati (kami), dan jadikanlah kami pemimpin bagi orang-orang yang bertakwa.',
      source: 'QS. Al-Furqan: 74',
    },
    points: [
      'Setiap anak memiliki garis waktu tumbuh kembang yang unik. Jangan membandingkan capaian anak kita dengan anak lain.',
      'Tujuan utama bukan sekadar cepat hafal di usia dini, melainkan menumbuhkan rasa cinta dan rindu terhadap kalam Allah sepanjang hidupnya.',
      'Iringi ikhtiar memutar murottal dengan doa saat anak tertidur dan menjaga kehalalan rezeki yang masuk ke tubuh buah hati.',
    ],
    takeaway:
      'talaQids hanyalah alat bantu ikhtiar; keberkahan sejati datang dari doa dan keteladanan akhlak Ayah & Bunda di rumah.',
  },
];

const APP_BENEFITS = [
  {
    icon: Repeat,
    title: 'Siklus 30 Hari Otomatis',
    desc: 'Tidak perlu repot mencatat tanggal. Aplikasi otomatis mengganti Juz setiap 30 hari sesuai usia siklus anak.',
  },
  {
    icon: ShieldCheck,
    title: 'Volume Limiter 60%',
    desc: 'Melindungi pendengaran sensitif bayi dengan batas volume aman yang terkunci secara perangkat lunak.',
  },
  {
    icon: Ear,
    title: 'Murottal Tartil Mujawwad',
    desc: 'Pilihan qari dengan artikulasi makhraj jelas & tempo tenang (Syaikh Al-Husary, Al-Minshawi, Mishary).',
  },
  {
    icon: BookOpenCheck,
    title: 'Sinergi Audio & Mushaf',
    desc: 'Satu-satunya pendamping yang memadukan pengondisian pasif (audio) dan talaqqi aktif (bacaan 1 halaman/hari).',
  },
];

export function InsightsView({
  child,
  cycle,
  onOpenMushaf,
  onOpenAudio,
}: InsightsViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('semua');
  const [expandedId, setExpandedId] = useState<string>('metode-30-bulan');

  const filteredArticles =
    selectedCategory === 'semua'
      ? INSIGHT_ARTICLES
      : INSIGHT_ARTICLES.filter((article) => article.category === selectedCategory);

  const stageInsight =
    cycle.currentMonth <= 6
      ? {
          phase: 'Fase Adaptasi & Fondasi Auditori',
          tip: `Di bulan ke-${cycle.currentMonth} ini, fokuskan pemutaran Juz ${cycle.currentJuz} dengan volume lembut (30–50%) saat ${child.name} menjelang tidur dan bangun pagi.`,
        }
      : cycle.currentMonth <= 18
        ? {
            phase: 'Fase Penyerapan & Imitasi Bunyi',
            tip: `${child.name} mulai peka terhadap pola suku kata. Dampingi pemutaran Juz ${cycle.currentJuz} dengan membacakan 1 halaman Mushaf di depannya agar ia melihat gerak bibir Ayah/Bunda.`,
          }
        : {
            phase: 'Fase Artikulasi & Penguatan Memori',
            tip: `Memasuki bulan ke-${cycle.currentMonth}, ${child.name} sudah merekam banyak pola ayat. Ajak ia menyambung ujung ayat Juz ${cycle.currentJuz} dengan suasana bermain yang menyenangkan.`,
          };

  return (
    <div className="space-y-4">
      {/* ── Hero: Personalised Stage & Philosophy ────────────────────── */}
      <section className="hero-surface rise relative overflow-hidden rounded-[28px] p-5 text-[#F6F0E4]">
        <div
          className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[#C89B4E]/20 blur-2xl"
          aria-hidden
        />

        <div className="relative flex items-start justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.22em] text-[#EAD8AF] ring-1 ring-white/15">
              <Sparkles className="h-3 w-3 text-[#C89B4E]" />
              Insights & Parenting Islami
            </span>
            <h1 className="mt-2.5 text-[19px] font-extrabold leading-snug tracking-tight text-white">
              Menanam Kalamullah di Usia Emas {child.name}
            </h1>
            <p className="mt-1 text-[11px] leading-relaxed text-[#EAD8AF]/85">
              Panduan ilmiah dan adab parenting Islami untuk memaksimalkan metode 30 siklus Juz Al-Qur’an di rumah.
            </p>
          </div>
        </div>

        {/* Personalised child phase card */}
        <div className="relative mt-4 rounded-2xl border border-white/12 bg-black/20 p-3.5 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#EAD8AF]">
              <Baby className="h-3.5 w-3.5 text-[#C89B4E]" />
              {stageInsight.phase}
            </span>
            <span className="rounded-full bg-[#C89B4E]/20 px-2 py-0.5 text-[9px] font-extrabold text-[#EAD8AF]">
              Bulan {cycle.currentMonth} · Juz {cycle.currentJuz}
            </span>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-[#F6F0E4]/90">
            {stageInsight.tip}
          </p>
        </div>
      </section>

      {/* ── Core Benefits of talaQids ───────────────────────────────── */}
      <section className="surface rise p-4 [animation-delay:60ms]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-[#8A968F]">
              Mengapa talaQids
            </p>
            <h2 className="mt-0.5 text-[15px] font-extrabold tracking-tight text-[#15231E]">
              Dirancang Khusus untuk Fitrah Bayi & Anak
            </h2>
          </div>
          <Brain className="h-4 w-4 text-[#1E4C40]" />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {APP_BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="rounded-2xl bg-[#F6F0E4]/75 p-3 ring-1 ring-[#1E4C40]/6"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#1E4C40] text-[#F3E7CB]">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <h3 className="mt-2 text-[11px] font-extrabold text-[#15231E]">
                  {benefit.title}
                </h3>
                <p className="mt-1 text-[10px] leading-relaxed text-[#6B7A72]">
                  {benefit.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Daily Routine Guide ─────────────────────────────────────── */}
      <section className="surface rise p-4 [animation-delay:100ms]">
        <p className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-[#8A968F]">
          Pola Harian Ideal
        </p>
        <h2 className="mt-0.5 text-[15px] font-extrabold tracking-tight text-[#15231E]">
          3 Waktu Terbaik Pengondisian Murottal
        </h2>

        <div className="mt-3 space-y-2">
          <div className="flex items-start gap-3 rounded-2xl bg-[#F6F0E4]/70 p-3 ring-1 ring-[#1E4C40]/6">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#C89B4E]/18 text-[#9C7330]">
              <Sun className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[11px] font-extrabold text-[#15231E]">
                Pagi Hari (Bakda Subuh – 07.00)
              </p>
              <p className="mt-0.5 text-[10px] leading-relaxed text-[#6B7A72]">
                Putar Juz {cycle.currentJuz} saat pikiran anak baru terbangun dan segar untuk membangun ketenangan emosi sepanjang hari.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-[#F6F0E4]/70 p-3 ring-1 ring-[#1E4C40]/6">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#2F6B5B]/15 text-[#1E4C40]">
              <Heart className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[11px] font-extrabold text-[#15231E]">
                Waktu Dekapan & Talaqqi (Siang / Sore)
              </p>
              <p className="mt-0.5 text-[10px] leading-relaxed text-[#6B7A72]">
                Bacakan 1 halaman Mushaf Juz {cycle.currentJuz} secara langsung dengan suara Ayah/Bunda sambil menggendong atau menyusui.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-[#F6F0E4]/70 p-3 ring-1 ring-[#1E4C40]/6">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#1E4C40]/12 text-[#1E4C40]">
              <Moon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[11px] font-extrabold text-[#15231E]">
                Menjelang Tidur Malam (Gelombang Alfa–Theta)
              </p>
              <p className="mt-0.5 text-[10px] leading-relaxed text-[#6B7A72]">
                Aktifkan Sleep Timer 30 menit dengan volume lembut (30–40%) agar ayat terserap ke memori bawah sadar saat anak terlelap.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Filterable Parenting & Methodology Articles ─────────────── */}
      <section className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <div>
            <p className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-[#8A968F]">
              Pustaka Ilmu
            </p>
            <h2 className="mt-0.5 text-[15px] font-extrabold tracking-tight text-[#15231E]">
              Artikel Parenting & Metodologi
            </h2>
          </div>
          <span className="rounded-full bg-[#1E4C40]/8 px-2.5 py-1 text-[10px] font-extrabold text-[#1E4C40]">
            {filteredArticles.length} bahasan
          </span>
        </div>

        {/* Category Pills */}
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[10px] font-extrabold transition ${
                  active
                    ? 'bg-[#1E4C40] text-[#F3E7CB] shadow-sm'
                    : 'bg-[#FFFCF5] text-[#5C6B63] ring-1 ring-[#1E4C40]/10 hover:bg-[#1E4C40]/5'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Articles Accordion List */}
        <div className="space-y-2.5">
          {filteredArticles.map((article) => {
            const isExpanded = expandedId === article.id;
            return (
              <article
                key={article.id}
                className="surface overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(isExpanded ? '' : article.id)
                  }
                  className="flex w-full items-start justify-between gap-3 p-4 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#C89B4E]/15 px-2.5 py-0.5 text-[9px] font-extrabold text-[#9C7330]">
                        {article.categoryLabel}
                      </span>
                      <span className="flex items-center gap-1 text-[9px] font-bold text-[#8A968F]">
                        <Clock className="h-2.5 w-2.5" />
                        {article.readTime}
                      </span>
                    </div>
                    <h3 className="mt-1.5 text-[13px] font-extrabold leading-snug text-[#15231E]">
                      {article.title}
                    </h3>
                    <p className="mt-1 text-[11px] leading-relaxed text-[#6B7A72]">
                      {article.subtitle}
                    </p>
                  </div>
                  <span
                    className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold transition ${
                      isExpanded
                        ? 'bg-[#1E4C40] text-[#F3E7CB]'
                        : 'bg-[#1E4C40]/8 text-[#1E4C40]'
                    }`}
                  >
                    {isExpanded ? '−' : '+'}
                  </span>
                </button>

                {isExpanded && (
                  <div className=" space-y-3 border-t border-[#1E4C40]/8 bg-[#F6F0E4]/50 px-4 pb-4 pt-3.5">
                    {article.arabicQuote && (
                      <div className="rounded-2xl bg-[#FFFCF5] p-3.5 ring-1 ring-[#1E4C40]/8">
                        <p
                          dir="rtl"
                          className="text-right font-arabic text-lg leading-loose text-[#1E4C40]"
                        >
                          {article.arabicQuote.arabic}
                        </p>
                        <p className="mt-1.5 text-[10px] italic leading-relaxed text-[#5C6B63]">
                          &ldquo;{article.arabicQuote.translation}&rdquo;
                        </p>
                        <p className="mt-1 text-[9px] font-extrabold uppercase tracking-wider text-[#9C7330]">
                          — {article.arabicQuote.source}
                        </p>
                      </div>
                    )}

                    <ul className="space-y-2">
                      {article.points.map((point, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-[11px] leading-relaxed text-[#15231E]"
                        >
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2F6B5B]" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex items-start gap-2.5 rounded-2xl bg-[#1E4C40]/8 p-3">
                      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[#9C7330]" />
                      <p className="text-[10px] font-bold leading-relaxed text-[#1E4C40]">
                        {article.takeaway}
                      </p>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* ── Quick Action Callout ────────────────────────────────────── */}
      <section className="surface rise flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold text-[#15231E]">
            Siap melanjutkan ikhtiar hari ini?
          </p>
          <p className="mt-0.5 text-[10px] text-[#6B7A72]">
            Putar murottal Juz {cycle.currentJuz} atau baca 1 halaman Mushaf bersama {child.name}.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenAudio}
            className="flex items-center gap-1 rounded-full bg-[#1E4C40] px-3 py-2 text-[10px] font-extrabold text-[#F3E7CB] transition active:scale-95"
          >
            <Volume2 className="h-3 w-3" />
            Putar
          </button>
          <button
            type="button"
            onClick={onOpenMushaf}
            className="rounded-full bg-[#1E4C40]/8 px-3 py-2 text-[10px] font-extrabold text-[#1E4C40] transition hover:bg-[#1E4C40]/12 active:scale-95"
          >
            Mushaf
          </button>
        </div>
      </section>
    </div>
  );
}
