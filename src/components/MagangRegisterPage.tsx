import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'motion/react';
import { PageHero } from './PageHero';
import { Footer } from './Footer';
import { CardCornerPattern } from './CardCornerPattern';
import {
  DEFAULT_MAGANG_HERO_IMAGE,
  DEFAULT_MAGANG_POSITIONS,
  MAGANG_FACULTIES,
} from '../data/magangDefaults';
import { MagangPositionItem, SiteSettings } from '../types/cms';

interface MagangRegisterPageProps {
  settings?: SiteSettings;
  positions?: MagangPositionItem[];
  onBackToMagang: () => void;
  onNavigateSection: (
    target: 'top' | 'who-we-are' | 'news-updates' | 'lokasi-p2b'
  ) => void;
}

interface SubmissionReceipt {
  registrationCode: string;
  positionTitle: string;
  fullName: string;
  email: string;
}

export function MagangRegisterPage({
  settings,
  positions = DEFAULT_MAGANG_POSITIONS,
  onBackToMagang,
  onNavigateSection,
}: MagangRegisterPageProps) {
  const activePositions = useMemo(
    () => positions.filter((p) => p.isActive !== false),
    [positions]
  );
  const availablePositions = useMemo(
    () => activePositions.filter((p) => p.isAvailable !== false),
    [activePositions]
  );

  const heroImageSrc =
    settings?.page_magang_image?.trim() || DEFAULT_MAGANG_HERO_IMAGE;
  const deadlineText =
    settings?.magang_deadline?.trim() || 'Kamis, 22 Oktober 2026';
  const periodText =
    settings?.magang_period?.trim() || 'Sampai dengan 30 April 2027';

  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(
    null
  );
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [studyProgram, setStudyProgram] = useState('');
  const [faculty, setFaculty] = useState('');
  const [aboutP2b, setAboutP2b] = useState('');
  const [interestReason, setInterestReason] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState('');
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [expectations, setExpectations] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [receipt, setReceipt] = useState<SubmissionReceipt | null>(null);
  const [failedPreviewImg, setFailedPreviewImg] = useState<
    Record<string, boolean>
  >({});

  // Sync selected position automatically from CMS available options
  useEffect(() => {
    setSelectedPositionId((prev) => {
      if (prev && availablePositions.some((p) => p.id === prev)) {
        return prev;
      }
      return availablePositions[0]?.id ?? null;
    });
  }, [availablePositions]);

  const selectedPosition = useMemo(
    () =>
      activePositions.find((p) => p.id === selectedPositionId) ??
      availablePositions[0] ??
      null,
    [activePositions, availablePositions, selectedPositionId]
  );

  const previewImageSrc = selectedPosition?.imageUrl?.trim() || heroImageSrc;
  const previewTitle = selectedPosition?.title || 'Magang di P2B UIN Salatiga';
  const previewKey = `${selectedPosition?.id ?? 'hero'}-${previewImageSrc}`;
  const previewFailed = Boolean(failedPreviewImg[previewKey]);

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setStudyProgram('');
    setFaculty('');
    setAboutP2b('');
    setInterestReason('');
    setResumeFile(null);
    setResumeUrl('');
    setPortfolioFile(null);
    setPortfolioUrl('');
    setExpectations('');
    setFormError('');
    setReceipt(null);
    setSelectedPositionId(availablePositions[0]?.id ?? null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedPosition || selectedPosition.isAvailable === false) {
      setFormError(
        'Silakan pilih salah satu posisi magang yang masih tersedia.'
      );
      return;
    }

    if (
      !fullName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !studyProgram.trim() ||
      !faculty.trim() ||
      !aboutP2b.trim() ||
      !interestReason.trim() ||
      !expectations.trim()
    ) {
      setFormError('Mohon lengkapi seluruh kolom wajib pada formulir.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError('Format alamat email tidak valid.');
      return;
    }

    if (phone.replace(/[^0-9]/g, '').length < 8) {
      setFormError('Nomor telepon minimal terdiri dari 8 digit angka.');
      return;
    }

    if (!resumeFile && !resumeUrl.trim()) {
      setFormError(
        'Mohon unggah berkas atau masukkan tautan surat lamaran / resume Anda.'
      );
      return;
    }

    if (!portfolioFile && !portfolioUrl.trim()) {
      setFormError(
        'Mohon unggah berkas atau masukkan tautan portofolio Anda.'
      );
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('fullName', fullName.trim());
      formData.append('email', email.trim());
      formData.append('phone', phone.trim());
      formData.append('studyProgram', studyProgram.trim());
      formData.append('faculty', faculty.trim());
      formData.append('aboutP2b', aboutP2b.trim());
      formData.append('positionId', String(selectedPosition.id));
      formData.append('interestReason', interestReason.trim());
      if (resumeFile) {
        formData.append('resumeFile', resumeFile);
      }
      if (resumeUrl.trim()) {
        formData.append('resumeUrl', resumeUrl.trim());
      }
      if (portfolioFile) {
        formData.append('portfolioFile', portfolioFile);
      }
      if (portfolioUrl.trim()) {
        formData.append('portfolioUrl', portfolioUrl.trim());
      }
      formData.append('expectations', expectations.trim());

      const res = await fetch('/api/public/magang/apply', {
        method: 'POST',
        body: formData,
      });

      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        registrationCode?: string;
        positionTitle?: string;
      };

      if (!res.ok || !data.ok) {
        setFormError(
          data.message || 'Gagal mengirim formulir pendaftaran magang.'
        );
        return;
      }

      setReceipt({
        registrationCode: data.registrationCode || 'MGG-2026',
        positionTitle: data.positionTitle || selectedPosition.title,
        fullName: fullName.trim(),
        email: email.trim(),
      });
      window.scrollTo({ top: 380, behavior: 'smooth' });
    } catch {
      setFormError(
        'Tidak dapat terhubung ke server. Silakan periksa koneksi Anda dan coba kembali.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F3EC] flex flex-col">
      <PageHero
        eyebrow="Open Recruitment · Formulir Pendaftaran"
        title="Daftar Magang di P2B"
        subtitle="Lengkapi identitas diri, pilih posisi magang yang tersedia, dan kirimkan surat lamaran serta portofolio terbaik Anda untuk bergabung bersama tim P2B UIN Salatiga."
        imageSrc={heroImageSrc}
        imageAlt="Pendaftaran Program Magang P2B UIN Salatiga"
        cornerLabel="Informasi Program"
        cornerActionLabel="Kembali ke Magang"
        cornerHref="/magang"
        onCornerClick={onBackToMagang}
      />

      <main className="w-full flex justify-center px-3 md:px-5 pt-10 md:pt-14 pb-12 md:pb-20 flex-1">
        <div className="w-full max-w-[1536px] flex flex-col gap-6 md:gap-8">
          {/* Top Breadcrumb & Schedule Info */}
          <div className="px-2 sm:px-4 flex flex-wrap items-center justify-between gap-3">
            <a
              href="/magang"
              onClick={(e) => {
                e.preventDefault();
                onBackToMagang();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 hover:bg-[#164234] text-[#164234] hover:text-[#FAF8F3] border border-[#C9A45A]/35 text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              <Icon icon="mdi:arrow-left" className="w-4 h-4" />
              <span>Kembali ke Informasi Magang</span>
            </a>

            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#8F6D26] tabular-nums">
              <span>Batas Akhir: {deadlineText}</span>
              <span aria-hidden="true">·</span>
              <span>Periode: {periodText}</span>
            </div>
          </div>

          {/* Two-Column P2B Editorial Card Layout with CardCornerPattern */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 items-start">
            {/* Left Card: Form Inputs (Cream Glass Card matching About & Magang Pages) */}
            <section className="lg:col-span-7 group relative overflow-hidden rounded-[1.5rem] md:rounded-[3rem] bg-white/75 backdrop-blur-xl border border-[#C9A45A]/30 p-6 sm:p-10 md:p-12">
              <CardCornerPattern
                index={0}
                position="top-right"
                sizeClassName="w-44 h-44 sm:w-56 sm:h-56"
                opacityClassName="opacity-[0.12] group-hover:opacity-[0.2]"
              />

              <div className="relative z-10">
                {receipt ? (
                  <div className="min-h-[420px] flex flex-col justify-center gap-6 py-4">
                    <div className="w-14 h-14 rounded-full bg-[#164234] text-[#F4D993] flex items-center justify-center">
                      <Icon icon="mdi:check" className="w-7 h-7" />
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="text-xs uppercase tracking-[0.18em] text-[#8F6D26]">
                        Pendaftaran Terkirim · {receipt.registrationCode}
                      </span>
                      <h2 className="text-2xl sm:text-4xl font-normal tracking-tight text-[#164234] text-balance">
                        Terima kasih, {receipt.fullName}
                      </h2>
                      <p className="text-sm sm:text-base text-[#3E544B] leading-relaxed max-w-xl">
                        Berkas lamaran dan portofolio Anda untuk posisi{' '}
                        <span className="text-[#164234] font-medium">
                          {receipt.positionTitle}
                        </span>{' '}
                        telah tercatat oleh tim Pusat Pengembangan Bisnis (P2B)
                        UIN Salatiga. Informasi tahap seleksi berikutnya akan
                        dikirimkan melalui email ({receipt.email}) atau nomor
                        telepon Anda.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/30 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-[#8F6D26]">
                          Kode Pendaftaran
                        </span>
                        <span className="font-mono tabular-nums text-[#164234]">
                          {receipt.registrationCode}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-[#8F6D26]">
                          Posisi Dipilih
                        </span>
                        <span className="text-[#164234]">
                          {receipt.positionTitle}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={onBackToMagang}
                        className="px-6 py-3 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#FAF8F3] text-sm font-medium transition-colors cursor-pointer"
                      >
                        Kembali ke Halaman Magang
                      </button>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-5 py-3 rounded-full bg-[#EAE3D2] hover:bg-[#DFD5BE] text-[#164234] text-sm transition-colors cursor-pointer"
                      >
                        Daftar Posisi Lain
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5 border-b border-[#164234]/10 pb-5">
                      <span className="text-xs uppercase tracking-[0.16em] text-[#8F6D26]">
                        Formulir Kandidat · Open Recruitment
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-[#164234] text-balance">
                        Lengkapi Data &amp; Berkas Lamaran
                      </h2>
                      <p className="text-xs sm:text-sm text-[#3E544B] leading-relaxed">
                        Pastikan seluruh isian data diri, pemahaman mengenai P2B,
                        serta dokumen pendukung diisi dengan benar sebelum
                        dikirim.
                      </p>
                    </div>

                    {/* 1. Nama Lengkap */}
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="magang-full-name"
                        className="text-xs sm:text-sm text-[#164234]"
                      >
                        Nama Lengkap <span className="text-[#8F6D26]">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <Icon
                          icon="mdi:account-outline"
                          className="w-4 h-4 text-[#8F6D26] absolute left-4 pointer-events-none"
                        />
                        <input
                          id="magang-full-name"
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Masukkan nama lengkap Anda"
                          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/35 text-sm text-[#164234] placeholder-[#3E544B]/50 focus:outline-none focus:border-[#164234] transition-colors"
                        />
                      </div>
                    </div>

                    {/* 2. Email & 3. Nomor Telepon */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="magang-email"
                          className="text-xs sm:text-sm text-[#164234]"
                        >
                          Email <span className="text-[#8F6D26]">*</span>
                        </label>
                        <div className="relative flex items-center">
                          <Icon
                            icon="mdi:email-outline"
                            className="w-4 h-4 text-[#8F6D26] absolute left-4 pointer-events-none"
                          />
                          <input
                            id="magang-email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="nama@email.com"
                            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/35 text-sm text-[#164234] placeholder-[#3E544B]/50 focus:outline-none focus:border-[#164234] transition-colors"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="magang-phone"
                          className="text-xs sm:text-sm text-[#164234]"
                        >
                          Nomor Telepon / WhatsApp{' '}
                          <span className="text-[#8F6D26]">*</span>
                        </label>
                        <div className="relative flex items-center">
                          <Icon
                            icon="mdi:phone-outline"
                            className="w-4 h-4 text-[#8F6D26] absolute left-4 pointer-events-none"
                          />
                          <input
                            id="magang-phone"
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="08xxxxxxxxxx"
                            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/35 text-sm text-[#164234] placeholder-[#3E544B]/50 focus:outline-none focus:border-[#164234] transition-colors tabular-nums"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 4. Program Studi & 5. Fakultas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="magang-prodi"
                          className="text-xs sm:text-sm text-[#164234]"
                        >
                          Program Studi{' '}
                          <span className="text-[#8F6D26]">*</span>
                        </label>
                        <div className="relative flex items-center">
                          <Icon
                            icon="mdi:school-outline"
                            className="w-4 h-4 text-[#8F6D26] absolute left-4 pointer-events-none"
                          />
                          <input
                            id="magang-prodi"
                            type="text"
                            required
                            value={studyProgram}
                            onChange={(e) => setStudyProgram(e.target.value)}
                            placeholder="Contoh: Ekonomi Syariah"
                            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/35 text-sm text-[#164234] placeholder-[#3E544B]/50 focus:outline-none focus:border-[#164234] transition-colors"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="magang-faculty"
                          className="text-xs sm:text-sm text-[#164234]"
                        >
                          Fakultas <span className="text-[#8F6D26]">*</span>
                        </label>
                        <select
                          id="magang-faculty"
                          required
                          value={faculty}
                          onChange={(e) => setFaculty(e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/35 text-sm text-[#164234] focus:outline-none focus:border-[#164234] transition-colors cursor-pointer"
                        >
                          <option value="" disabled>
                            Pilih Fakultas
                          </option>
                          {MAGANG_FACULTIES.map((fac) => (
                            <option key={fac} value={fac}>
                              {fac}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* 6. Posisi apa yang anda minati? (Auto-detected dari CMS & cek ketersediaan) */}
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="text-xs sm:text-sm text-[#164234]">
                          Posisi apa yang anda minati?{' '}
                          <span className="text-[#8F6D26]">*</span>
                        </span>
                        <span className="text-xs text-[#8F6D26]">
                          Klik posisi untuk melihat foto &amp; detail tugas
                        </span>
                      </div>

                      {activePositions.length === 0 ? (
                        <div className="rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/30 px-4 py-3 text-xs text-[#3E544B]">
                          Saat ini belum ada posisi magang yang dibuka.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {activePositions.map((pos) => {
                            const available = pos.isAvailable !== false;
                            const isSelected =
                              available && selectedPosition?.id === pos.id;
                            return (
                              <button
                                key={pos.id}
                                type="button"
                                disabled={!available}
                                onClick={() => {
                                  if (!available) return;
                                  setSelectedPositionId(pos.id);
                                  setFormError('');
                                }}
                                className={`text-left rounded-2xl px-4 py-3.5 border transition-all flex items-center justify-between gap-3 ${
                                  !available
                                    ? 'bg-[#EAE5D7]/60 border-[#C9A45A]/20 text-[#3E544B]/55 cursor-not-allowed'
                                    : isSelected
                                      ? 'bg-[#164234] border-[#164234] text-[#FAF8F3] cursor-pointer shadow-sm'
                                      : 'bg-[#FAF8F3] border-[#C9A45A]/35 hover:border-[#164234]/60 text-[#164234] cursor-pointer'
                                }`}
                              >
                                <div className="flex flex-col min-w-0">
                                  <span className="text-sm font-medium truncate">
                                    {pos.title}
                                  </span>
                                  <span
                                    className={`text-xs truncate ${
                                      !available
                                        ? 'text-[#9b2c2c]/80'
                                        : isSelected
                                          ? 'text-[#F4D993]'
                                          : 'text-[#8F6D26]'
                                    }`}
                                  >
                                    {available
                                      ? pos.division || 'Tersedia'
                                      : 'Tidak Tersedia · Kuota Penuh'}
                                  </span>
                                </div>
                                <span
                                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                                    !available
                                      ? 'border-[#3E544B]/25'
                                      : isSelected
                                        ? 'border-[#F4D993] bg-[#F4D993] text-[#164234]'
                                        : 'border-[#C9A45A]/60'
                                  }`}
                                >
                                  {isSelected && (
                                    <Icon
                                      icon="mdi:check"
                                      className="w-3.5 h-3.5"
                                    />
                                  )}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* 7. Apa yang kamu ketahui tentang P2B UIN Salatiga */}
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="magang-about-p2b"
                        className="text-xs sm:text-sm text-[#164234]"
                      >
                        Apa yang kamu ketahui tentang Pusat Pengembangan Bisnis
                        (P2B) UIN Salatiga?{' '}
                        <span className="text-[#8F6D26]">*</span>
                      </label>
                      <textarea
                        id="magang-about-p2b"
                        rows={3}
                        required
                        value={aboutP2b}
                        onChange={(e) => setAboutP2b(e.target.value)}
                        placeholder="Tuliskan pemahaman singkat Anda mengenai unit usaha, layanan, atau peran P2B UIN Salatiga..."
                        className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/35 text-sm text-[#164234] placeholder-[#3E544B]/50 focus:outline-none focus:border-[#164234] transition-colors"
                      />
                    </div>

                    {/* 8. Kenapa anda tertarik pada posisi ini? */}
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="magang-interest-reason"
                        className="text-xs sm:text-sm text-[#164234]"
                      >
                        Kenapa anda tertarik pada posisi ini?{' '}
                        <span className="text-[#8F6D26]">*</span>
                      </label>
                      <textarea
                        id="magang-interest-reason"
                        rows={3}
                        required
                        value={interestReason}
                        onChange={(e) => setInterestReason(e.target.value)}
                        placeholder={
                          selectedPosition
                            ? `Ceritakan ketertarikan serta keahlian Anda untuk posisi ${selectedPosition.title}...`
                            : 'Ceritakan alasan ketertarikan dan pengalaman relevan Anda...'
                        }
                        className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/35 text-sm text-[#164234] placeholder-[#3E544B]/50 focus:outline-none focus:border-[#164234] transition-colors"
                      />
                    </div>

                    {/* 9. Surat lamaran/resume & 10. Portofolio */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/30 p-4 flex flex-col gap-2.5">
                        <label className="text-xs sm:text-sm text-[#164234] leading-snug">
                          Kirimkan surat lamaran atau resume Anda.{' '}
                          <span className="text-[#8F6D26]">*</span>
                        </label>
                        <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#EAE3D2]/60 border border-dashed border-[#C9A45A]/60 text-xs text-[#164234] cursor-pointer transition-colors">
                          <Icon
                            icon="mdi:upload-outline"
                            className="w-4 h-4 text-[#8F6D26] shrink-0"
                          />
                          <span className="truncate">
                            {resumeFile
                              ? resumeFile.name
                              : 'Unggah PDF / DOC / Gambar'}
                          </span>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,image/jpeg,image/png,image/webp"
                            onChange={(e) =>
                              setResumeFile(e.target.files?.[0] || null)
                            }
                            className="hidden"
                          />
                        </label>
                        {resumeFile && (
                          <button
                            type="button"
                            onClick={() => setResumeFile(null)}
                            className="text-[11px] text-[#9b2c2c] hover:underline self-start cursor-pointer"
                          >
                            Hapus berkas terpilih
                          </button>
                        )}
                        <div className="relative flex items-center">
                          <Icon
                            icon="mdi:link-variant"
                            className="w-3.5 h-3.5 text-[#8F6D26] absolute left-3 pointer-events-none"
                          />
                          <input
                            type="url"
                            value={resumeUrl}
                            onChange={(e) => setResumeUrl(e.target.value)}
                            placeholder="Atau tempel tautan Drive CV..."
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-xs text-[#164234] placeholder-[#3E544B]/50 focus:outline-none focus:border-[#164234]"
                          />
                        </div>
                      </div>

                      <div className="rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/30 p-4 flex flex-col gap-2.5">
                        <label className="text-xs sm:text-sm text-[#164234] leading-snug">
                          Kirimkan portofolio Anda.{' '}
                          <span className="text-[#8F6D26]">*</span>
                        </label>
                        <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#EAE3D2]/60 border border-dashed border-[#C9A45A]/60 text-xs text-[#164234] cursor-pointer transition-colors">
                          <Icon
                            icon="mdi:file-document-outline"
                            className="w-4 h-4 text-[#8F6D26] shrink-0"
                          />
                          <span className="truncate">
                            {portfolioFile
                              ? portfolioFile.name
                              : 'Unggah PDF / DOC / Gambar'}
                          </span>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,image/jpeg,image/png,image/webp"
                            onChange={(e) =>
                              setPortfolioFile(e.target.files?.[0] || null)
                            }
                            className="hidden"
                          />
                        </label>
                        {portfolioFile && (
                          <button
                            type="button"
                            onClick={() => setPortfolioFile(null)}
                            className="text-[11px] text-[#9b2c2c] hover:underline self-start cursor-pointer"
                          >
                            Hapus berkas terpilih
                          </button>
                        )}
                        <div className="relative flex items-center">
                          <Icon
                            icon="mdi:link-variant"
                            className="w-3.5 h-3.5 text-[#8F6D26] absolute left-3 pointer-events-none"
                          />
                          <input
                            type="url"
                            value={portfolioUrl}
                            onChange={(e) => setPortfolioUrl(e.target.value)}
                            placeholder="Atau tautan Behance/Drive/IG..."
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#C9A45A]/30 text-xs text-[#164234] placeholder-[#3E544B]/50 focus:outline-none focus:border-[#164234]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 11. Harapan selama magang */}
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="magang-expectations"
                        className="text-xs sm:text-sm text-[#164234]"
                      >
                        Harapan selama magang{' '}
                        <span className="text-[#8F6D26]">*</span>
                      </label>
                      <p className="text-xs text-[#3E544B] leading-relaxed">
                        Jelaskan apa saja yang kamu harapkan selama periode
                        magang berlangsung bersama Pusat Pengembangan Bisnis
                        (P2B) UIN Salatiga
                      </p>
                      <textarea
                        id="magang-expectations"
                        rows={3}
                        required
                        value={expectations}
                        onChange={(e) => setExpectations(e.target.value)}
                        placeholder="Tuliskan target pembelajaran, kontribusi, serta pengalaman yang ingin Anda capai..."
                        className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F3] border border-[#C9A45A]/35 text-sm text-[#164234] placeholder-[#3E544B]/50 focus:outline-none focus:border-[#164234] transition-colors"
                      />
                    </div>

                    {formError && (
                      <div
                        role="alert"
                        className="px-4 py-3 rounded-2xl bg-[#9b2c2c]/10 border border-[#9b2c2c]/30 text-xs sm:text-sm text-[#9b2c2c]"
                      >
                        {formError}
                      </div>
                    )}

                    <div className="pt-2 flex flex-col gap-2">
                      <button
                        type="submit"
                        disabled={submitting || availablePositions.length === 0}
                        className="w-full py-3.5 px-6 rounded-full bg-[#164234] hover:bg-[#1E5644] disabled:opacity-50 text-[#FAF8F3] text-sm sm:text-base font-medium transition-colors flex items-center justify-center gap-2.5 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        <span>
                          {submitting
                            ? 'Mengirim Pendaftaran...'
                            : 'Kirim Pendaftaran Magang'}
                        </span>
                        <Icon
                          icon="mdi:send-outline"
                          className="w-4 h-4 text-[#F4D993]"
                        />
                      </button>
                      {availablePositions.length === 0 && (
                        <p className="text-xs text-[#9b2c2c] text-center">
                          Semua posisi magang saat ini sedang ditutup atau penuh.
                        </p>
                      )}
                    </div>
                  </form>
                )}
              </div>
            </section>

            {/* Right Card: Dark Emerald Sticky Preview Card with CardCornerPattern & Dynamic Position Image */}
            <aside className="hidden lg:flex lg:col-span-5 lg:sticky lg:top-24 group relative overflow-hidden rounded-[1.5rem] md:rounded-[3rem] bg-gradient-to-br from-[#0F3126] via-[#164234] to-[#1D5442] border border-[#C9A45A]/35 p-6 sm:p-8 md:p-10 text-[#FAF8F3] flex-col gap-6">
              <CardCornerPattern
                index={1}
                position="bottom-right"
                sizeClassName="w-48 h-48 sm:w-56 sm:h-56"
                opacityClassName="opacity-[0.14] group-hover:opacity-[0.24]"
              />

              {/* Dynamic Rounded Position Photo Showcase */}
              <div className="relative z-10 w-full aspect-[4/3] rounded-[1.75rem] overflow-hidden border border-[#C9A45A]/30 bg-[#081C15]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={previewKey}
                    initial={{ opacity: 0.35, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0.35 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full h-full"
                  >
                    {previewFailed ? (
                      <div className="w-full h-full bg-gradient-to-br from-[#103327] via-[#164234] to-[#0B261D] flex flex-col items-center justify-center gap-3 text-[#F4D993]/80">
                        <Icon
                          icon="mdi:image-multiple-outline"
                          className="w-12 h-12"
                        />
                        <span className="text-base">{previewTitle}</span>
                      </div>
                    ) : (
                      <img
                        src={previewImageSrc}
                        alt={previewTitle}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setFailedPreviewImg((prev) => ({
                            ...prev,
                            [previewKey]: true,
                          }))
                        }
                        className="w-full h-full object-cover"
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-[#061812]/55 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Position Details & Tasks */}
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs uppercase tracking-[0.16em] text-[#F4D993]">
                    {selectedPosition
                      ? `${selectedPosition.division || 'Posisi Magang'} · Tersedia`
                      : 'Rekrutmen Magang P2B'}
                  </span>
                  <h3 className="text-2xl xl:text-3xl font-normal text-[#FAF8F3] tracking-tight leading-snug">
                    {previewTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#F6F3EC]/85 leading-relaxed">
                    {selectedPosition?.description ||
                      'Pilih salah satu posisi magang pada formulir di samping untuk melihat fokus kegiatan serta pratinjau peran Anda di P2B UIN Salatiga.'}
                  </p>
                </div>

                {selectedPosition?.tasks && selectedPosition.tasks.length > 0 && (
                  <ul className="pt-4 border-t border-white/15 flex flex-col gap-2 text-xs sm:text-[13px] text-[#F6F3EC]/90">
                    {selectedPosition.tasks.map((task, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                        <Icon
                          icon="mdi:check"
                          className="w-4 h-4 text-[#F4D993] shrink-0 mt-0.5"
                        />
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="pt-4 border-t border-white/15 flex flex-col gap-2 text-xs text-[#F6F3EC]/80 tabular-nums">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#F4D993]/85">Batas Pendaftaran</span>
                    <span className="text-[#FAF8F3]">{deadlineText}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#F4D993]/85">Periode Magang</span>
                    <span className="text-[#FAF8F3]">{periodText}</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer
        settings={settings}
        onNavigate={(target) => {
          onNavigateSection(target);
        }}
      />
    </div>
  );
}
