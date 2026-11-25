import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, BookOpen, FileText, HeartHandshake, Scale, ShieldAlert } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan — talaQids',
  description:
    'Syarat dan Ketentuan penggunaan aplikasi pendamping hafalan Al-Qur’an anak talaQids.',
};

export default function TermsOfServicePage() {
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
              href="/privacy"
              className="text-xs font-semibold text-[#1E4C40] underline decoration-[#C89B4E]/60 underline-offset-4 hover:text-[#0F2C25]"
            >
              Kebijakan Privasi
            </Link>
          </div>

          {/* Main Card */}
          <article className="surface p-6 sm:p-8 text-[#15231E]">
            <header className="border-b border-[#1E4C40]/10 pb-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#1E4C40]/10 px-3 py-1 text-[11px] font-extrabold text-[#1E4C40]">
                <FileText className="h-3.5 w-3.5" />
                Terms of Service
              </div>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[#0F2C25] sm:text-3xl">
                Syarat &amp; Ketentuan talaQids
              </h1>
              <p className="mt-1.5 text-xs text-[#6B7A72]">
                Berlaku efektif: 25 November 2026 &bull; Domain resmi:{' '}
                <span className="font-semibold text-[#1E4C40]">https://talaqids.vercel.app</span>
              </p>
            </header>

            <div className="mt-6 space-y-6 text-sm leading-relaxed text-[#2C3B34]">
              <section className="space-y-2">
                <p>
                  Dengan mengakses atau menggunakan aplikasi <strong>talaQids</strong> (
                  <span className="font-medium">https://talaqids.vercel.app</span>), Anda setuju
                  untuk terikat oleh Syarat &amp; Ketentuan berikut. Apabila Anda tidak menyetujui
                  bagian mana pun dari ketentuan ini, mohon untuk tidak menggunakan layanan ini.
                </p>
              </section>

              <section className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#C89B4E]" />
                  <h2 className="text-base font-extrabold text-[#0F2C25]">
                    1. Deskripsi Layanan
                  </h2>
                </div>
                <p>
                  talaQids adalah aplikasi web progresif (PWA) yang membantu orang tua dan wali
                  mendampingi anak dalam program talaqqi serta hafalan Al-Qur&apos;an secara
                  bertahap (siklus 30 Juz). Aplikasi ini menyediakan pemutar audio murottal, lembar
                  mushaf digital, pelacakan progres harian, serta fitur sinkronisasi cadangan
                  opsional ke Google Drive pribadi pengguna.
                </p>
              </section>

              <section className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-[#C89B4E]" />
                  <h2 className="text-base font-extrabold text-[#0F2C25]">
                    2. Penggunaan yang Diperbolehkan &amp; Tanggung Jawab Pengguna
                  </h2>
                </div>
                <ul className="list-disc space-y-1 pl-5 text-[13px]">
                  <li>
                    Aplikasi ini ditujukan untuk penggunaan pribadi, keluarga, dan pendidikan Islam
                    di bawah pengawasan orang tua atau wali.
                  </li>
                  <li>
                    Karena aplikasi menggunakan arsitektur penyimpanan lokal (<em>Local-First</em>),
                    Anda bertanggung jawab untuk menjaga perangkat Anda atau mengaktifkan fitur
                    cadangan Google Drive apabila ingin mengamankan riwayat progres lintas
                    perangkat.
                  </li>
                  <li>
                    Anda dilarang menyalahgunakan aplikasi, mengganggu ketersediaan layanan, atau
                    melakukan tindakan otomatis yang membebani penyedia CDN audio/teks pihak ketiga.
                  </li>
                </ul>
              </section>

              <section className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#C89B4E]" />
                  <h2 className="text-base font-extrabold text-[#0F2C25]">
                    3. Sumber Konten &amp; Kekayaan Intelektual
                  </h2>
                </div>
                <p>
                  Teks Al-Qur&apos;an, terjemahan resmi Kementerian Agama RI, dan rekaman audio
                  murottal disediakan melalui sumber publik tepercaya (seperti EveryAyah dan Islamic
                  Network) untuk tujuan ibadah dan pendidikan non-komersial. Hak cipta masing-masing
                  sumber tetap menjadi milik penyedia atau pemegang hak terkait.
                </p>
              </section>

              <section className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <HeartHandshake className="h-4 w-4 text-[#C89B4E]" />
                  <h2 className="text-base font-extrabold text-[#0F2C25]">
                    4. Infaq &amp; Dukungan Sukarela
                  </h2>
                </div>
                <p>
                  talaQids beroperasi tanpa iklan komersial. Dukungan infaq yang tersedia di dalam
                  aplikasi bersifat sukarela untuk membantu biaya operasional dan pengembangan
                  berkelanjutan.
                </p>
              </section>

              <section className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-[#C89B4E]" />
                  <h2 className="text-base font-extrabold text-[#0F2C25]">
                    5. Batasan Tanggung Jawab
                  </h2>
                </div>
                <p>
                  Layanan disediakan sebagaimana adanya (<em>&ldquo;as is&rdquo;</em>). Kami
                  berupaya menjaga akurasi teks, audio, dan keandalan sinkronisasi, namun tidak
                  memberikan jaminan bebas gangguan atau kehilangan data yang disebabkan oleh
                  kerusakan perangkat, penghapusan cache browser, maupun gangguan layanan pihak
                  ketiga (seperti Google Drive atau CDN eksternal).
                </p>
              </section>

              <section className="space-y-2 border-t border-[#1E4C40]/10 pt-5">
                <h2 className="text-base font-extrabold text-[#0F2C25]">
                  6. Perubahan Ketentuan
                </h2>
                <p className="text-[13px]">
                  Kami dapat memperbarui Syarat &amp; Ketentuan ini dari waktu ke waktu. Perubahan
                  akan ditampilkan di halaman ini beserta tanggal berlaku terbaru. Silakan tinjau
                  juga{' '}
                  <Link
                    href="/privacy"
                    className="font-semibold text-[#1E4C40] underline decoration-[#C89B4E]/60 underline-offset-2"
                  >
                    Kebijakan Privasi
                  </Link>{' '}
                  kami untuk memahami bagaimana data Anda dikelola.
                </p>
              </section>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
