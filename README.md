# talaQids — Pendamping Anak Hafiz Al-Qur'an Sejak Dini

**talaQids** (*dibaca: talaqqids*) adalah aplikasi **Progressive Web App (PWA)** *local-first* yang dirancang untuk membantu orang tua mencetak anak hafiz Al-Qur'an sejak usia emas (0–3 tahun) melalui pengondisian auditori berulang (*repetitive auditory sensory conditioning*) berdasarkan kurikulum **Metode 30 Bulan Ustaz Adi Hidayat (UAH)**.

---

## Fitur Utama

### 1. Engine Penjadwalan Siklus 30 Juz Otomatis (`cycle-math`)
- **1 Bulan = 1 Juz:** Menjadwalkan secara deterministik 1 Juz Al-Qur'an yang sama untuk diputar berulang setiap hari selama 30 hari penuh sebelum berpindah ke Juz berikutnya.
- **Fase Muroja'ah Otomatis:** Saat usia program melewati 30 bulan ($> 2{,}5$ tahun), sistem otomatis masuk ke fase rotasi muroja'ah.
- **Override Juz Manual:** Orang tua dapat memilih Juz tertentu secara manual kapan saja tanpa merusak perhitungan dasar tanggal lahir/mulai anak.

### 2. Pemutar Audio Latar Belakang & Baby-Safe Limiter (`useAudioPlayer`)
- **Singleton Audio Engine:** Terpusat tanpa duplikasi instance `Audio` di komponen UI.
- **Baby-Safe Volume Limiter (Maks. 60%):** Batas volume perangkat lunak (*software gain cap* `0.6`) untuk melindungi saraf pendengaran bayi.
- **Continuous Juz Looping:** Otomatis memutar ayat demi ayat dan surah demi surah dalam Juz aktif, lalu kembali ke awal Juz tanpa jeda iklan.
- **Lock-Screen Controls (`MediaSession API`):** Tetap berjalan saat layar terkunci lengkap dengan info Juz, Surah/Ayat, nama Qari, dan tombol navigasi di *lockscreen*.
- **Sleep Timer:** Pilihan berhenti otomatis setelah 15 menit, 30 menit, 60 menit, atau saat selesai 1 siklus Juz.
- **One-Click Offline Juz Download:** Simpan seluruh audio 1 Juz aktif ke penyimpanan `Cache API` perangkat agar bisa diputar tanpa kuota/internet.

### 3. Mushaf Manual Rasm Utsmani & Pelacak Progres Orang Tua
- **Filter 20 Halaman Juz Aktif:** Menampilkan teks Al-Qur'an **Rasm Utsmani (`dir="rtl"`)** beserta terjemahan Bahasa Indonesia (Kemenag RI) khusus untuk 20 halaman pada Juz yang sedang berjalan.
- **Tagging Peran Orang Tua:** Tandai halaman selesai dibacakan oleh **Ibu**, **Ayah**, atau **Bersama**, lengkap dengan statistik kolaborasi talaqqi orang tua.

### 4. Model Infaq Berbasis Kejujuran (*Honor-System QRIS*)
- **100% Bebas Paywall Ayat:** Seluruh 30 Juz Al-Qur'an dapat diakses gratis tanpa iklan.
- **Tier Muhsinin (Pro):** Dibuka melalui infaq sukarela via **QRIS Statis** dengan **Aktivasi Mandiri (Honor-System)** atau konfirmasi via WhatsApp untuk membuka fitur ekstra:
  - Unduh 1 Juz penuh untuk pemutaran *offline*
  - Pilihan Multi-Qari (*Al-Husary*, *Al-Minshawi*, *Mishary Alafasy*, *Abdul Basit*)
  - Hingga 5 profil anak dalam 1 perangkat
  - Statistik kolaborasi bacaan Ayah & Ibu

---

## Arsitektur & Teknologi

| Komponen | Teknologi |
| :--- | :--- |
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router, Client-First PWA) |
| **Runtime & Package Manager** | [Bun](https://bun.sh/) |
| **Bahasa** | TypeScript (Strict Mode) |
| **Styling** | Tailwind CSS v4 (Mobile-First, Warm Parenting UI) |
| **Local Database** | [Dexie.js](https://dexie.org/) (IndexedDB) + `Cache API` |
| **Sumber Data Al-Qur'an** | EveryAyah CDN (`64kbps`/`128kbps` MP3) & Rasm Utsmani + Terjemahan Kemenag |

---

## Struktur Direktori

```text
talaqids/
├── public/
│   ├── icons/                    # Ikon PWA (any & maskable, apple-touch, favicon)
│   ├── logo-wordmark.png         # Logo wordmark talaQids (header)
│   ├── manifest.json             # Web App Manifest
│   └── sw.js                     # Service Worker untuk Offline Shell
├── src/
│   ├── app/
│   │   ├── globals.css           # Konfigurasi tema & tipografi Arab (Amiri)
│   │   ├── layout.tsx            # Root layout & metadata PWA
│   │   └── page.tsx              # Shell utama aplikasi & navigasi bawah
│   ├── components/
│   │   ├── OnboardingModal.tsx   # Form profil anak & preview kalkulasi Juz
│   │   ├── NowPlayingBar.tsx     # Mini player mengambang di atas bottom nav (swipe-up)
│   │   ├── NowPlayingSheet.tsx   # Sheet ayat aktif: teks, terjemahan & kontrol lengkap
│   │   ├── DashboardAudioView.tsx# Ring siklus, kontrol sesi, limiter 60%, sleep timer
│   │   ├── MushafManualView.tsx  # Rasm Utsmani 20 halaman Juz aktif & tracker
│   │   └── InfaqSettingsView.tsx # Infaq QRIS Honor-System, multi-qari & manajemen cache
│   ├── hooks/
│   │   ├── useAyahText.ts        # Resolusi teks ayat yang sedang diputar (cache per halaman)
│   │   └── useAudioPlayer.ts     # Singleton Audio Engine, MediaSession & Cache API
│   └── lib/
│       ├── cycle-math.ts         # Fungsi murni kalkulasi siklus 30 hari & Juz aktif
│       ├── db.ts                 # Skema Dexie.js (children, progress, settings)
│       ├── quran-metadata.ts     # Peta statis 114 Surah, 30 Juz, 604 halaman & Qari
│       └── quran-api.ts          # Fetcher & local cache teks Rasm Utsmani + terjemahan
├── PRD.md                        # Product Requirement Document
└── package.json
```

---

## Cara Menjalankan di Lokal

Pastikan [Bun](https://bun.sh/) sudah terinstal di perangkat Anda.

```powershell
# 1. Instal seluruh dependensi
bun install

# 2. Jalankan server development
bun run dev
```

Buka `http://localhost:3000` di browser (disarankan menggunakan tampilan mobile atau menginstal sebagai PWA melalui menu **"Add to Home Screen"**).

### Build untuk Produksi

```powershell
bun run build
bun run start
```

---

## Rumus Deterministik Siklus 30 Juz

$$\text{Total Hari} = \max\left(0, \left\lfloor \frac{\text{Tanggal Hari Ini} - \text{Tanggal Mulai}}{86.400.000} \right\rfloor\right)$$

$$\text{Bulan Siklus} = \left\lfloor \frac{\text{Total Hari}}{30} \right\rfloor + 1$$

$$\text{Juz Aktif} = \begin{cases}
\text{Bulan Siklus}, & \text{jika } \text{Bulan Siklus} \le 30 \\
((\text{Bulan Siklus} - 1) \pmod{30}) + 1, & \text{jika } \text{Bulan Siklus} > 30 \text{ (Fase Muroja'ah)}
\end{cases}$$
