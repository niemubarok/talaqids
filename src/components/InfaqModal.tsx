'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Check, Copy, Crown, HeartHandshake, Landmark, MessageCircle, QrCode, Shield, Sparkles, X } from 'lucide-react';
import { activateMuhsininTier } from '@/lib/db';

interface InfaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  isProUser: boolean;
  activeChildName: string;
}

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  logoSrc?: string;
  badge?: string;
}

function getBankAccounts(): BankAccount[] {
  const accounts: BankAccount[] = [];

  const bcaNumber = process.env.NEXT_PUBLIC_BANK_BCA_NUMBER || '0678123148';
  const bcaHolder = process.env.NEXT_PUBLIC_BANK_BCA_HOLDER || 'Husni Mubarok';
  const bcaName = process.env.NEXT_PUBLIC_BANK_BCA_NAME || 'Bank Central Asia (BCA)';

  if (bcaNumber) {
    accounts.push({
      id: 'bca',
      bankName: bcaName,
      accountNumber: bcaNumber,
      accountHolder: bcaHolder,
      logoSrc: '/logo-bca.svg',
      badge: 'BCA',
    });
  }

  const bsnNumber =
    process.env.NEXT_PUBLIC_BANK_BSN_NUMBER ||
    process.env.NEXT_PUBLIC_BANK_BSI_NUMBER ||
    '2003136724';
  const bsnHolder =
    process.env.NEXT_PUBLIC_BANK_BSN_HOLDER ||
    process.env.NEXT_PUBLIC_BANK_BSI_HOLDER ||
    'Husni Mubarok';
  const bsnName =
    process.env.NEXT_PUBLIC_BANK_BSN_NAME ||
    process.env.NEXT_PUBLIC_BANK_BSI_NAME ||
    'Bank Syariah Nasional (BSN)';

  if (bsnNumber) {
    accounts.push({
      id: 'bsn',
      bankName: bsnName,
      accountNumber: bsnNumber,
      accountHolder: bsnHolder,
      logoSrc: '/logo-bsn.svg',
      badge: 'Syariah',
    });
  }

  const mandiriNumber = process.env.NEXT_PUBLIC_BANK_MANDIRI_NUMBER;
  if (mandiriNumber) {
    accounts.push({
      id: 'mandiri',
      bankName: process.env.NEXT_PUBLIC_BANK_MANDIRI_NAME || 'Bank Mandiri',
      accountNumber: mandiriNumber,
      accountHolder: process.env.NEXT_PUBLIC_BANK_MANDIRI_HOLDER || 'Husni Mubarok',
      badge: 'Mandiri',
    });
  }

  return accounts;
}

const INFAQ_OPTIONS = [
  {
    amount: 35000,
    label: 'Rp35.000',
    title: 'Pemeliharaan',
    desc: 'Bantu biaya pemeliharaan aplikasi & domain.',
  },
  {
    amount: 75000,
    label: 'Rp75.000',
    title: 'Disarankan',
    desc: 'Dukungan penuh pengembangan fitur & bandwidth audio.',
    popular: true,
  },
  {
    amount: 150000,
    label: 'Rp150.000+',
    title: 'Wakaf Server',
    desc: 'Pahala jariyah dari setiap ayat yang didengar bayi lain.',
  },
];

export function InfaqModal({
  isOpen,
  onClose,
  isProUser,
  activeChildName,
}: InfaqModalProps) {
  const isQrisEnabled =
    process.env.NEXT_PUBLIC_ENABLE_QRIS !== 'false' &&
    process.env.NEXT_PUBLIC_ENABLE_QRIS !== '0';
  const isWaConfirmationEnabled =
    process.env.NEXT_PUBLIC_ENABLE_WHATSAPP_CONFIRMATION !== 'false' &&
    process.env.NEXT_PUBLIC_ENABLE_WHATSAPP_CONFIRMATION !== '0';
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6285524914191';

  const bankAccounts = getBankAccounts();
  const [selectedNominal, setSelectedNominal] = useState(75000);
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'bank'>(() =>
    isQrisEnabled ? 'qris' : 'bank'
  );
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [prayerBanner, setPrayerBanner] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async (accountNumber: string) => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopiedAccount(accountNumber);
      setTimeout(() => setCopiedAccount(null), 2000);
    } catch {
      // ignore clipboard error
    }
  };

  const handleHonorActivation = async () => {
    setIsActivating(true);
    try {
      await activateMuhsininTier(selectedNominal);
      setPrayerBanner(true);
    } finally {
      setIsActivating(false);
    }
  };

  const cleanWaNumber = waNumber.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(
    `Assalamu'alaikum Admin talaQids, saya telah berinfaq sebesar Rp${selectedNominal.toLocaleString(
      'id-ID'
    )} melalui ${
      isQrisEnabled && paymentMethod === 'qris' ? 'QRIS' : 'Transfer Bank'
    } untuk mendukung dakwah aplikasi talaQids (Anak: ${activeChildName}). Mohon doa keberkahannya.`
  )}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="infaq-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0B1F1A]/70 p-4 backdrop-blur-md"
    >
      <div className="rise my-auto w-full max-w-lg overflow-hidden rounded-[28px] border border-[#C89B4E]/30 bg-[#FFFDF9] shadow-[0_30px_90px_-25px_rgba(11,31,26,0.6)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E4C40]/8 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#C89B4E]/15 text-[#8A6220]">
              <HeartHandshake className="h-4 w-4" />
            </span>
            <div>
              <h2 id="infaq-modal-title" className="text-[15px] font-extrabold text-[#15231E]">
                Infaq &amp; Tier Muhsinin
              </h2>
              <p className="text-[10px] text-[#6B7A72]">
                Dukung keberlanjutan dakwah &amp; buka fitur Pro
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E4C40]/6 text-[#1E4C40] transition hover:bg-[#1E4C40]/14 active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[75vh] space-y-4 overflow-y-auto p-5">
          {/* Hero Banner */}
          <div
            className={`relative overflow-hidden rounded-[24px] p-4 text-white shadow-md ${
              isProUser
                ? 'gold-gradient border border-[#C89B4E]/50 text-[#12211C]'
                : 'hero-surface'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
                  isProUser ? 'bg-[#1E4C40] text-[#F3E7CB]' : 'bg-[#EAD8AF] text-[#15231E]'
                }`}
              >
                {isProUser ? (
                  <Crown className="h-3 w-3 text-[#EAD8AF]" />
                ) : (
                  <Shield className="h-3 w-3 text-[#1E4C40]" />
                )}
                {isProUser ? 'Tier Muhsinin Aktif' : 'Free Tier'}
              </span>
            </div>
            <h3
              className={`mt-2 text-[18px] font-extrabold leading-tight ${
                isProUser ? 'text-[#12211C]' : 'text-white'
              }`}
            >
              Tumbuhkan cinta Al-Qur&apos;an sejak dini
            </h3>
            <p
              className={`mt-1 text-[11px] leading-relaxed ${
                isProUser ? 'text-[#1F352D]' : 'text-[#F3E7CB]/90'
              }`}
            >
              Seluruh 30 Juz terbuka bebas iklan. Infaq sukarela Anda mendukung operasional server dan
              membuka sinkronisasi cloud Google Drive, pilihan edisi mushaf &amp; seluruh qari pilihan.
            </p>
          </div>

          {prayerBanner && (
            <div className="rounded-2xl border border-[#2F6B5B]/30 bg-[#2F6B5B]/10 p-4">
              <p className="flex items-center gap-2 text-[12px] font-extrabold text-[#1E4C40]">
                <HeartHandshake className="h-4 w-4 text-[#2F6B5B]" />
                Jazakumullahu Khairan Katsiran
              </p>
              <p dir="rtl" className="mt-1.5 text-right font-arabic text-base leading-loose text-[#1E4C40]">
                آجَرَكَ اللَّهُ فِيمَا أَعْطَيْتَ، وَبَارَكَ فِيمَا أَبْقَيْتَ
              </p>
              <p className="mt-1 text-[10.5px] text-[#6B7A72]">
                Seluruh fitur <strong>Tier Muhsinin</strong> kini aktif. Semoga menjadi amal jariyah.
              </p>
            </div>
          )}

          {/* Nominal Options */}
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8A968F]">
              Pilih Nominal Infaq Sukarela
            </p>
            <div className="mt-2 space-y-2">
              {INFAQ_OPTIONS.map((option) => {
                const isSelected = selectedNominal === option.amount;
                return (
                  <button
                    key={option.amount}
                    type="button"
                    onClick={() => setSelectedNominal(option.amount)}
                    className={`flex w-full items-center justify-between rounded-2xl border p-3 text-left transition ${
                      isSelected
                        ? 'border-[#1E4C40] bg-[#1E4C40]/5 ring-1 ring-[#1E4C40]/20'
                        : 'border-[#1E4C40]/10 bg-white hover:bg-[#FBF6EC]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-extrabold text-[#1E4C40]">
                          {option.label}
                        </span>
                        {option.popular && (
                          <span className="rounded-full bg-[#C89B4E]/15 px-2 py-0.5 text-[8.5px] font-extrabold text-[#8A6220]">
                            Disarankan
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#6B7A72]">{option.desc}</p>
                    </div>
                    {isSelected && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1E4C40] text-[#F3E7CB]">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Method Switcher Tabs (show if QRIS is enabled & bank accounts exist) */}
          {isQrisEnabled && bankAccounts.length > 0 && (
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8A968F]">
                Pilih Metode Infaq
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2 rounded-2xl bg-[#1E4C40]/6 p-1">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('qris')}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2 text-[11px] font-extrabold transition-all duration-200 ${
                    paymentMethod === 'qris'
                      ? 'bg-white text-[#1E4C40] shadow-xs'
                      : 'text-[#6B7A72] hover:text-[#1E4C40]'
                  }`}
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>QRIS Instant</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank')}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2 text-[11px] font-extrabold transition-all duration-200 ${
                    paymentMethod === 'bank'
                      ? 'bg-white text-[#1E4C40] shadow-xs'
                      : 'text-[#6B7A72] hover:text-[#1E4C40]'
                  }`}
                >
                  <Landmark className="h-3.5 w-3.5" />
                  <span>Transfer Bank</span>
                </button>
              </div>
            </div>
          )}

          {/* Payment Details */}
          {isQrisEnabled && paymentMethod === 'qris' ? (
            <div className="rounded-2xl border border-[#C89B4E]/30 bg-[#FFFDF9] p-4 text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#C89B4E]/15 px-3 py-1 text-[10px] font-extrabold text-[#8A6220]">
                <QrCode className="h-3.5 w-3.5" />
                <span>Scan QRIS Semua Bank &amp; E-Wallet</span>
              </div>
              <div className="relative mx-auto mt-3 h-52 w-52 overflow-hidden rounded-2xl border border-[#1E4C40]/15 bg-white p-2 shadow-xs">
                <Image
                  src="/qris-infaq.jpg"
                  alt="QRIS Infaq talaQids"
                  fill
                  sizes="208px"
                  className="object-contain p-1"
                />
              </div>
              <p className="mt-2 text-[10.5px] font-semibold text-[#8A968F]">
                NMID: ID1024345719958 · Lazismu / Talaqids
              </p>
              <p className="mt-0.5 text-[9.5px] text-[#6B7A72]">
                Mendukung BCA, Mandiri, BSI, BRI, GoPay, OVO, Dana, ShopeePay, dll.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {!isQrisEnabled && (
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8A968F]">
                  Transfer ke Rekening Bank
                </p>
              )}
              {bankAccounts.map((bank) => {
                const isCopied = copiedAccount === bank.accountNumber;
                return (
                  <div
                    key={bank.id}
                    className="rounded-2xl border border-[#1E4C40]/10 bg-white p-3.5 shadow-xs transition hover:border-[#C89B4E]/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        {bank.logoSrc ? (
                          <div className="relative flex h-8 w-14 shrink-0 items-center justify-center rounded-lg border border-[#1E4C40]/10 bg-white p-1 shadow-xs">
                            <Image
                              src={bank.logoSrc}
                              alt={bank.bankName}
                              width={56}
                              height={28}
                              className="max-h-6 w-auto object-contain"
                            />
                          </div>
                        ) : (
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E4C40]/8 text-[#1E4C40]">
                            <Landmark className="h-4 w-4" />
                          </span>
                        )}
                        <div>
                          <p className="text-[12px] font-extrabold text-[#15231E]">
                            {bank.bankName}
                          </p>
                          <p className="text-[9.5px] text-[#6B7A72]">
                            a.n.{' '}
                            <span className="font-semibold text-[#1E4C40]">
                              {bank.accountHolder}
                            </span>
                          </p>
                        </div>
                      </div>
                      {bank.badge && (
                        <span className="rounded-full bg-[#C89B4E]/15 px-2 py-0.5 text-[8.5px] font-extrabold text-[#8A6220]">
                          {bank.badge}
                        </span>
                      )}
                    </div>

                    <div className="mt-2.5 flex items-center justify-between rounded-xl bg-[#FBF6EC] px-3 py-2">
                      <div>
                        <p className="text-[8.5px] font-semibold text-[#8A968F]">
                          Nomor Rekening
                        </p>
                        <p className="font-mono text-[13px] font-black tracking-wider text-[#15231E]">
                          {bank.accountNumber}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleCopy(bank.accountNumber)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-extrabold transition active:scale-95 ${
                          isCopied
                            ? 'bg-[#2F6B5B] text-white'
                            : 'border border-[#1E4C40]/12 bg-white text-[#1E4C40] shadow-xs hover:bg-[#1E4C40]/5'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-3 w-3" />
                            <span>Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="rounded-xl border border-[#C89B4E]/25 bg-[#C89B4E]/10 p-2.5 text-center">
                <p className="text-[10px] text-[#8A6220]">
                  💡 Berita transfer disarankan:{' '}
                  <strong className="text-[#15231E]">Infaq {activeChildName}</strong>
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2 pt-1">
            {isWaConfirmationEnabled && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[#25D366] text-[11px] font-extrabold text-white shadow-xs transition hover:brightness-105 active:scale-98"
              >
                <MessageCircle className="h-4 w-4" />
                Konfirmasi via WhatsApp
              </a>
            )}

            {!isProUser && (
              <button
                type="button"
                disabled={isActivating}
                onClick={handleHonorActivation}
                className="flex min-h-[42px] w-full items-center justify-center gap-2 rounded-full border border-[#1E4C40]/20 bg-white text-[11px] font-extrabold text-[#1E4C40] transition hover:bg-[#1E4C40]/5 active:scale-98"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#C89B4E]" />
                Saya Sudah Infaq (Aktifkan Sekarang)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
