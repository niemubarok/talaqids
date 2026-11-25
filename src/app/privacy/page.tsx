import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Database, HardDrive, Lock, Mail, ShieldCheck, Trash2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi — talaQids',
  description:
    'Kebijakan Privasi aplikasi talaQids terkait penyimpanan lokal (IndexedDB) dan sinkronisasi opsional Google Drive appDataFolder.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="app-canvas min-h-dvh">
      <div className="app-grain min-h-dvh px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-2xl">
          {/* Top Navigation */}
          <div className="mb-6 flex items-center justify-between gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-[#1E4C40]/15 bg-[#FFFDF9]/90 px-4 py-2 text-xs font-bold text-[#1E4C40] shadow-xs transition hover:bg-[#1E4C40] hover:text-[#F3E7CB]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali ke talaQids
            </Link>
            <Link
              href="/terms"
              className="text-xs font-semibold text-[#1E4C40] underline decoration-[#C89B4E]/60 underline-offset-4 hover:text-[#0F2C25]"
            >
              Syarat &amp; Ketentuan
            </Link>
          </div>

          {/* Main Card */}
          <article className="surface p-6 sm:p-8 text-[#15231E]">
            <header className="border-b border-[#1E4C40]/10 pb-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#1E4C40]/10 px-3 py-1 text-[11px] font-extrabold text-[#1E4C40]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Privacy Policy
              </div>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[#0F2C25] sm:text-3xl">
                Kebijakan Privasi talaQids
              </h1>
              <p className="mt-1.5 text-xs text-[#6B7A72]">
                Berlaku efektif: 25 November 2026 &bull; Domain resmi:{' '}
                <span className="font-semibold text-[#1E4C40]">https://talaqids.vercel.app</span>
              </p>
            </header>

            <div className="mt-6 space-y-6 text-sm leading-relaxed text-[#2C3B34]">
              <section className="space-y-2">
                <p>
                  <strong>talaQids</strong> adalah aplikasi web progresif (PWA) pendamping orang tua
                  untuk membimbing hafalan dan talaqqi Al-Qur&apos;an anak dengan metode siklus 30
                  Juz. Kami sangat menghormati privasi Anda dan keluarga. Aplikasi ini dirancang
                  dengan arsitektur <strong>Local-First</strong> dan 100% bebas iklan komersial.
                </p>
              </section>

              <section className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-[#C89B4E]" />
                  <h2 className="text-base font-extrabold text-[#0F2C25]">
                    1. Data yang Disimpan Secara Lokal
                  </h2>
                </div>
                <p>
                  Secara default, seluruh data aplikasi disimpan langsung di perangkat Anda
                  menggunakan penyimpanan browser (<strong>IndexedDB</strong> dan{' '}
                  <strong>localStorage</strong>), bukan di server kami. Data tersebut meliputi:
                </p>
                <ul className="list-disc space-y-1 pl-5 text-[13px]">
                  <li>Profil anak (nama panggilan, tanggal mulai siklus, pilihan qari favorit).</li>
                  <li>Riwayat progres harian talaqqi dan halaman mushaf yang telah dibaca.</li>
                  <li>Pengaturan aplikasi (batas volume ramah anak, preferensi tampilan, status infaq).</li>
                </ul>
              </section>

              <section className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-[#C89B4E]" />
                  <h2 className="text-base font-extrabold text-[#0F2C25]">
                    2. Integrasi Google OAuth &amp; Google Drive (Opsional)
                  </h2>
                </div>
                <p>
                  Jika Anda memilih untuk mengaktifkan fitur pencadangan &amp; sinkronisasi lintas
                  perangkat melalui Google Drive, talaQids akan meminta izin OAuth dengan ruang
                  lingkup terbatas berikut:
                </p>
                <ul className="list-disc space-y-1 pl-5 text-[13px]">
                  <li>
                    <code className="rounded bg-[#1E4C40]/8 px-1.5 py-0.5 text-xs font-semibold text-[#1E4C40]">
                      https://www.googleapis.com/auth/drive.appdata
                    </code>{' '}
                    — Hanya digunakan untuk membaca dan menyimpan satu file cadangan tersembunyi (
                    <code className="rounded bg-[#1E4C40]/8 px-1.5 py-0.5 text-xs">
                      talaqids_data.json
                    </code>
                    ) di folder khusus aplikasi (<em>Application Data Folder</em>) pada Google Drive
                    pribadi Anda. talaQids <strong>tidak dapat</strong> melihat, membaca, mengubah,
                    atau menghapus file lain di Google Drive Anda.
                  </li>
                  <li>
                    <code className="rounded bg-[#1E4C40]/8 px-1.5 py-0.5 text-xs font-semibold text-[#1E4C40]">
                      https://www.googleapis.com/auth/userinfo.email
                    </code>{' '}
                    — Hanya digunakan untuk menampilkan alamat email akun Google yang sedang
                    terhubung di antarmuka aplikasi.
                  </li>
                </ul>
                <div className="rounded-xl border border-[#1E4C40]/12 bg-[#FBF6ED] p-3.5 text-[13px]">
                  <strong>Kepatuhan Kebijakan Data Pengguna Google API:</strong> Penggunaan dan
                  transfer informasi yang diterima dari Google API oleh talaQids mematuhi{' '}
                  <em>Google API Services User Data Policy</em>, termasuk persyaratan{' '}
                  <em>Limited Use</em>. Data Anda tidak pernah dikirim ke server pihak ketiga, tidak
                  dijual, dan tidak digunakan untuk iklan atau pelatihan model AI.
                </div>
              </section>

              <section className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[#C89B4E]" />
                  <h2 className="text-base font-extrabold text-[#0F2C25]">
                    3. Layanan Pihak Ketiga &amp; Analitik
                  </h2>
                </div>
                <ul className="list-disc space-y-1 pl-5 text-[13px]">
                  <li>
                    <strong>Audio &amp; Teks Al-Qur&apos;an:</strong> Aplikasi mengambil teks mushaf,
                    terjemahan Kemenag RI, dan audio murottal dari jaringan CDN publik (seperti
                    EveryAyah dan Islamic Network) serta menyimpannya sementara di perangkat untuk
                    dukungan offline.
                  </li>
                  <li>
                    <strong>Vercel Analytics:</strong> Kami menggunakan analitik web anonim yang
                    tidak menggunakan cookie pelacak pribadi untuk memantau performa dan stabilitas
                    aplikasi secara agregat.
                  </li>
                </ul>
              </section>

              <section className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#C89B4E]" />
                  <h2 className="text-base font-extrabold text-[#0F2C25]">
                    4. Privasi Anak
                  </h2>
                </div>
                <p>
                  talaQids ditujukan untuk digunakan oleh <strong>orang tua atau wali</strong> dalam
                  mendampingi aktivitas belajar Al-Qur&apos;an anak. Kami tidak mengumpulkan data
                  identitas sensitif anak di server kami dan tidak menampilkan iklan pihak ketiga.
                </p>
              </section>

              <section className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-[#C89B4E]" />
                  <h2 className="text-base font-extrabold text-[#0F2C25]">
                    5. Penghapusan &amp; Kendali Data
                  </h2>
                </div>
                <p>Anda memiliki kendali penuh atas data Anda:</p>
                <ul className="list-disc space-y-1 pl-5 text-[13px]">
                  <li>
                    Menghapus data lokal kapan saja melalui menu pengaturan browser (Clear Site Data
                    / IndexedDB).
                  </li>
                  <li>
                    Memutuskan koneksi Google Drive langsung dari menu{' '}
                    <strong>Sinkronisasi Google Drive</strong> di dalam aplikasi.
                  </li>
                  <li>
                    Mencabut akses OAuth talaQids kapan saja melalui halaman{' '}
                    <a
                      href="https://myaccount.google.com/permissions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#1E4C40] underline decoration-[#C89B4E]/60 underline-offset-2"
                    >
                      Google Account Permissions
                    </a>
                    .
                  </li>
                </ul>
              </section>

              <section className="space-y-2 border-t border-[#1E4C40]/10 pt-5">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#C89B4E]" />
                  <h2 className="text-base font-extrabold text-[#0F2C25]">6. Kontak</h2>
                </div>
                <p className="text-[13px]">
                  Jika Anda memiliki pertanyaan mengenai Kebijakan Privasi ini atau ingin mengajukan
                  permintaan terkait data, silakan hubungi pengembang melalui halaman aplikasi{' '}
                  <Link
                    href="/"
                    className="font-semibold text-[#1E4C40] underline decoration-[#C89B4E]/60 underline-offset-2"
                  >
                    talaQids
                  </Link>
                  .
                </p>
              </section>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
