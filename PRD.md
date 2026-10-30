# Product Requirement Document (PRD): talaQids

- **Project Name:** talaQids (dibaca: *talaqqids*)
- **Platform:** Progressive Web App (PWA) — Mobile-First, Responsive Tablet/Desktop
- **Target Audience:** Orang tua dengan bayi baru lahir hingga balita usia emas (0–3 tahun)
- **Methodology Foundation:** Metode 30 Siklus Juz Al-Qur'an (Ustaz Adi Hidayat) via pengondisian auditori berulang (*repetitive auditory sensory conditioning*)

---

## 1. Executive Summary & Value Proposition

### 1.1 Problem Statement
1. Orang tua muslim ingin menanamkan Al-Qur'an sejak dini agar anak menjadi hafiz, namun kesulitan menjaga konsistensi memutar audio murottal 1 juz secara teratur setiap hari.
2. Memutar audio via aplikasi streaming konvensional (YouTube, Spotify) menimbulkan distorsi: iklan, algoritma video acak, konsumsi baterai/layar menyala, serta ketiadaan pelacak siklus bulanan otomatis.
3. Aplikasi komersial sering membatasi ayat di balik paywall langganan kaku yang memicu resistensi kultural ("membeli firman Allah").

### 1.2 Solution: talaQids
Aplikasi web progresif (PWA) lokal-pertama (*local-first*) yang secara otomatis menjadwalkan dan memutar 1 juz Al-Qur'an yang sama setiap hari selama 30 hari penuh sebelum beralih ke juz berikutnya. Dilengkapi dengan kontrol audio latar belakang ramah bayi, antarmuka bacaan manual untuk orang tua, dan model infaq berbasis kejujuran (*honor-system QRIS*).

---

## 2. User Personas & Core Journeys

### 2.1 Personas
* **Ayah/Ibu Bayi Baru Lahir (Usia 0–12 Bulan):** Membutuhkan pemutar audio otomatis di kamar bayi, tanpa layar menyala, volume aman, dan minim interaksi layar.
* **Orang Tua Balita Aktif (Usia 2–3 Tahun):** Membutuhkan pemutar murottal harian plus mushaf digital untuk mendampingi anak menyimak dan meniru lafal secara aktif.

### 2.2 Core User Flows
1. **Onboarding:**
   - Input Nama Anak & Tanggal Lahir (atau Custom Start Date).
   - Sistem mengkalkulasi posisi hari ke-N dan menetapkan Juz aktif.
2. **Daily Routine (Audio Streaming/Loop):**
   - Buka Dashboard $\rightarrow$ Klik tombol "Mulai Sesi Hari Ini".
   - Audio berputar secara continuous loop untuk juz aktif.
   - Layar dimatikan $\rightarrow$ Kontrol audio tetap aktif di lockscreen via Media Session API.
3. **Manual Reading (Ortu Membaca):**
   - Masuk ke tab "Mushaf". Teks ayat Rasm Utsmani langsung terfilter pada Juz aktif.
   - Klik checklist per halaman (1–20) yang telah dibacakan ke anak.
   - Pilih penanda pembaca ("Dibacakan oleh Ayah / Ibu").
4. **Dukungan Infaq (Buka Fitur Muhsinin):**
   - Masuk ke menu "Dukung talaQids".
   - Muncul QRIS Statis dengan pilihan nominal infaq sukarela.
   - Pengguna memilih "Aktivasi Mandiri (Honor System)" atau "Konfirmasi via WhatsApp".
   - Status aplikasi berubah ke mode *Muhsinin / Pro*.

---

## 3. Functional Specifications

### F-01: Engine Penjadwalan Siklus (Cycle Math Engine)
* **Kalkulasi Deterministik:**
  $$\text{Total Hari} = \max(0, \lfloor(\text{Tanggal Hari Ini} - \text{Tanggal Mulai}) / 86400000\rfloor)$$
  $$\text{Bulan Siklus} = \lfloor\text{Total Hari} / 30\rfloor + 1$$
  $$\text{Juz Aktif} = \begin{cases} 
  \text{Bulan Siklus}, & \text{jika Bulan Siklus} \le 30 \\ 
  ((\text{Bulan Siklus} - 1) \pmod{30}) + 1, & \text{jika Bulan Siklus} > 30 \text{ (Fase Muroja'ah)}
  \end{cases}$$
* **Fleksibilitas Jadwal:** Orang tua dapat melakukan *override* manual jika ingin mengulang juz tertentu di luar kalkulasi otomatis.

### F-02: Audio Player & Baby Safety Control
* **Continuous Looping:** Memutar surah demi surah dalam 1 juz secara berkesinambungan. Saat surah terakhir juz tersebut selesai, audio otomatis kembali ke awal juz.
* **Baby-Safe Decibel Limiter:**
  - Pembatas volume perangkat lunak (*software volume cap*) maksimum di angka 60% (gain 0.6) untuk mencegah cidera pendengaran bayi.
  - Peringatan visual jika volume fisik perangkat dinaikkan terlalu tinggi.
* **Lock-Screen Playback (Media Session API):**
  - Metadata: Judul Juz, Nama Qari (Default: Syaikh Mahmud Khalil Al-Hushari), Nomor Siklus Bulan.
  - Action Handlers: `play`, `pause`, `previoustrack`, `nexttrack`, `seekto`.
* **Sleep Timer:** Otomatis mati setelah 15 menit, 30 menit, 60 menit, atau saat 1 siklus juz berakhir.

### F-03: Mushaf Manual & Progress Tracking
* **Rasm Utsmani Viewer:** Menampilkan teks Al-Qur'an terfilter khusus untuk 20 halaman juz berjalan.
* **Progress Logger:**
  - Menandai halaman/ayat selesai.
  - Menghitung akumulasi menit dengar harian.
  - Menyimpan label pembaca (*Ayah / Ibu*).
* **Streak & Habit Visualization:** Kalender aktivitas harian tanpa sistem penalti atau *streak loss* yang membuat frustrasi.

### F-04: Offline Caching (Service Worker + Cache API)
* Tidak mengunduh 30 juz sekaligus.
* Fitur *One-Click Juz Download*: Menyimpan file audio 1 juz berjalan ($\approx 40-60\text{ MB}$) ke Cache API browser.
* Manajemen Penyimpanan: Notifikasi pembersihan file cache juz bulan sebelumnya untuk membebaskan ruang memori perangkat.

---

## 4. Monetization & Infaq Architecture (Opsi A + QRIS Statis)

### 4.1 Tiering Fitur
| Fitur | Free Tier | Tier Muhsinin (Pro) |
| :--- | :--- | :--- |
| Akses 30 Juz Al-Qur'an (Online) | Ya (Lengkap) | Ya (Lengkap) |
| Continuous Audio Looping | Ya | Ya |
| Teks Mushaf Per-Juz | Ya | Ya |
| Baby-Safe Volume Limiter | Ya | Ya |
| **Offline Audio Download (Cache 1 Juz)** | Terbatas / Tidak | **Ya (Bebas Kuota)** |
| **Multi-Qari Audio Selection** | 1 Qari Standar | **Bebas Pilih Qari** |
| **Smart Sleep Timer & Routine Alarms** | Standar | **Kustom Penuh** |
| **Multi-Child Profile** | 1 Profil | **Hingga 5 Profil** |
| **Parent Reading Analytics & Tagging** | Terbatas | **Lengkap (Ayah vs Ibu)** |

### 4.2 Mekanisme Transaksi Infaq
1. **Model:** Infaq / Wakaf Fitur Sukarela (Bukan Langganan Berulang).
2. **Channel Pembayaran:** Gambar QRIS Statis (Bebas MDR UMi).
3. **Pilihan Nominal:**
   - Rp35.000 (Infaq Pemeliharaan)
   - Rp75.000 (Infaq Disarankan / Terfavorit)
   - Rp150.000+ (Infaq Muhsinin + Wakaf Server)
4. **Metode Aktivasi Ganda:**
   - **Metode A (Honor-System / Mandiri):** Pengguna menekan tombol *"Saya Sudah Berinfaq, Buka Fitur"* $\rightarrow$ Sistem mengubah flag `is_pro: true` di penyimpanan lokal disertai doa tulus.
   - **Metode B (Verifikasi via WhatsApp):** Tombol membuka WhatsApp langsung ke admin dengan pesan template konfirmasi bukti transfer jika pengguna menghendaki verifikasi resmi atau kode token lisensi cadangan.

---

## 5. Data Architecture (Local-First IndexedDB via Dexie.js)

```typescript
// Database Name: talaQidsDB (Version 1)

export interface ChildProfile {
  id: string; // UUID v4
  name: string;
  birthDate: string; // YYYY-MM-DD
  startDate: string; // YYYY-MM-DD
  preferredReciterId: string; // Default: 'al_husary'
  isConsolidationMode: boolean; // default: false
  createdAt: string;
  updatedAt: string;
}

export interface DailyProgress {
  id?: number; // Auto-increment
  childId: string;
  date: string; // YYYY-MM-DD
  juzNumber: number;
  listenMinutes: number;
  pagesCompleted: number[]; // Array halaman mushaf yang dibaca (1-20)
  readerRole?: 'Ayah' | 'Ibu' | 'Bersama';
  notes?: string;
}

export interface AppSettings {
  key: string; // 'app_config'
  isProUser: boolean; // Status tier Muhsinin
  infaqActivatedAt?: string;
  maxVolumeCap: number; // Default: 0.6
  enableBackgroundWakeLock: boolean;
}