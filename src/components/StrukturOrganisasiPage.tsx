import { Icon } from '@iconify/react';
import { motion } from 'motion/react';
import { PageHero } from './PageHero';
import { Footer } from './Footer';
import { CardCornerPattern } from './CardCornerPattern';
import { SiteSettings } from '../types/cms';

interface StrukturOrganisasiPageProps {
  settings?: SiteSettings;
  onOpenAbout: () => void;
  onNavigateSection: (target: 'top' | 'who-we-are' | 'news-updates' | 'lokasi-p2b') => void;
}

const SK_PDF_URL = '/assets/aistudio/56-_SK_Struktur_Organisasi_P2b-BLU-UIN_9b2304d4.PDF';

function SkStaticBox({
  heading,
  subheading,
  variant = 'standard',
  minHeightClass = 'min-h-[84px]',
}: {
  heading: string;
  subheading?: string;
  variant?: 'primary' | 'standard' | 'coordinate';
  minHeightClass?: string;
}) {
  const baseStyles =
    variant === 'primary'
      ? 'bg-[#164234] text-[#FAF8F3] border-[#C9A45A]/55 shadow-[0_14px_30px_-18px_rgba(11,38,29,0.45)]'
      : 'bg-white text-[#164234] border-[#164234]/45';

  const subheadingColor =
    variant === 'primary' ? 'text-[#F6F3EC]/90' : 'text-[#3E544B]';

  return (
    <div
      className={`w-full ${minHeightClass} rounded-xl border px-4 py-3 text-center flex flex-col items-center justify-center gap-1 ${baseStyles}`}
    >
      <span
        className={
          variant === 'coordinate'
            ? 'text-xs sm:text-[13px] font-normal leading-snug tracking-normal'
            : 'text-xs sm:text-[13px] font-medium uppercase tracking-[0.06em] leading-snug'
        }
      >
        {heading}
      </span>

      {subheading && (
        <span className={`text-xs sm:text-[13px] font-normal leading-snug ${subheadingColor}`}>
          {subheading}
        </span>
      )}
    </div>
  );
}

const divisions = [
  {
    icon: 'mdi:office-building-outline',
    code: 'UNIT 01',
    title: 'Optimalisasi Aset & Fasilitas',
    responsibilities: [
      'Pengelolaan reservasi Gedung Auditorium Student Centre dan ruang pertemuan kampus.',
      'Inventarisasi serta pemanfaatan aset fisik universitas agar memiliki nilai tambah ekonomi.',
      'Pemeliharaan standar kelayakan sarana pendukung kegiatan internal maupun eksternal.',
    ],
  },
  {
    icon: 'mdi:briefcase-outline',
    code: 'UNIT 02',
    title: 'Layanan Komersial & Unit Usaha',
    responsibilities: [
      'Operasional Klinik Mitra Insani, Kantin kampus higienis, produk Air Mineral, dan layanan Tiket.',
      'Pengembangan unit bisnis baru melalui kajian kelayakan serta evaluasi kinerja berkala.',
      'Penjaminan mutu pelayanan dan kepuasan pelanggan sesuai tata kelola PTN BLU.',
    ],
  },
  {
    icon: 'mdi:handshake-outline',
    code: 'UNIT 03',
    title: 'Kemitraan Strategis & Pemasaran',
    responsibilities: [
      'Menjalin kerja sama produktif dengan dunia industri, pemerintah, alumni, dan masyarakat.',
      'Penyusunan skema kolaborasi usaha yang memberikan manfaat bersama secara transparan.',
      'Pengelolaan komunikasi publik dan pemasaran layanan komersial P2B UIN Salatiga.',
    ],
  },
  {
    icon: 'mdi:school-outline',
    code: 'UNIT 04',
    title: 'Talenta, Magang & Inovasi Mahasiswa',
    responsibilities: [
      'Penyelenggaraan program magang profesional mahasiswa pada unit bisnis P2B.',
      'Pendampingan praktik bidang teknologi informasi, komunikasi, pemasaran digital, bisnis, dan akuntansi.',
      'Inkubasi ide kewirausahaan untuk memperkuat ekosistem entrepreneurial university.',
    ],
  },
];

export function StrukturOrganisasiPage({
  settings,
  onOpenAbout,
  onNavigateSection,
}: StrukturOrganisasiPageProps) {
  return (
    <div className="min-h-screen bg-[#F6F3EC] flex flex-col">
      <PageHero
        eyebrow="Profil P2B · SK Rektor No. 56 Tahun 2026"
        title="Struktur Organisasi P2B"
        subtitle="Susunan tata kelola statis Pusat Pengembangan Bisnis Badan Layanan Umum UIN Salatiga berdasarkan Keputusan Rektor UIN Salatiga Nomor 56 Tahun 2026."
        imageSrc={
          settings?.page_org_image?.trim() ||
          'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2025/01/2025-Slider-2.png'
        }
        imageAlt="Tim Kolaborasi dan Manajemen P2B UIN Salatiga"
        cornerLabel="Profil Lengkap"
        cornerActionLabel="Tentang Kami"
        cornerHref="/tentang-kami"
        onCornerClick={onOpenAbout}
      />

      <main className="w-full flex justify-center px-3 md:px-5 pt-10 md:pt-14 pb-12 md:pb-20 flex-1">
        <div className="w-full max-w-[1536px] flex flex-col gap-10 md:gap-14">
          {/* Official Static SK 56/2026 Org Chart Diagram */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.08 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-6 px-1 sm:px-3 md:px-6"
          >
            <div className="flex flex-col gap-1.5 text-center items-center max-w-3xl mx-auto">
              <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                Lampiran Keputusan Rektor Nomor 56 Tahun 2026
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal text-[#164234] tracking-tight uppercase">
                Struktur Organisasi Pusat Pengembangan Bisnis
              </h2>
            </div>

            {/* Chart Architectural Canvas */}
            <div className="rounded-[1.5rem] md:rounded-[2.25rem] bg-[#FAF8F3] border border-[#C9A45A]/35 p-5 sm:p-8 lg:p-10 xl:p-12 shadow-[0_18px_46px_-28px_rgba(11,38,29,0.16)]">
              {/* Desktop Exact Diagram (lg and up) */}
              <div className="hidden lg:flex flex-col items-center w-full max-w-[1120px] mx-auto">
                {/* UPPER ZONE: PENGAWAS + PENANGGUNG JAWAB + KOORDINATIF + KETUA */}
                <div className="w-full grid grid-cols-[1fr_270px_1fr] xl:grid-cols-[1fr_300px_1fr] grid-rows-[1fr_84px_1fr] items-stretch">
                  {/* Top-Left: PENGAWAS (Ketua SPI) */}
                  <div className="col-start-1 row-start-1 flex items-end justify-start pr-6">
                    <div className="w-[215px] xl:w-[235px]">
                      <SkStaticBox
                        heading="PENGAWAS"
                        subheading="Ketua SPI"
                        minHeightClass="min-h-[82px]"
                      />
                    </div>
                  </div>

                  {/* Top-Center: PENANGGUNG JAWAB (Rektor) */}
                  <div className="col-start-2 row-start-1 flex items-end justify-center">
                    <SkStaticBox
                      heading="PENANGGUNG JAWAB"
                      subheading="Rektor"
                      variant="primary"
                      minHeightClass="min-h-[96px]"
                    />
                  </div>

                  {/* Middle-Left Junction: Dashed drop from PENGAWAS + Horizontal Dashed labeled "Pengawas" */}
                  <div className="col-start-1 row-start-2 relative">
                    <div
                      aria-hidden="true"
                      className="absolute top-0 bottom-1/2 left-[107px] xl:left-[117px] right-0 border-l-2 border-b-2 border-dashed border-[#164234]/60"
                    />
                    <span className="absolute right-6 xl:right-8 bottom-[calc(50%+8px)] text-xs font-medium tracking-wide text-[#3E544B] select-none">
                      Pengawas
                    </span>
                  </div>

                  {/* Middle-Center Junction: Solid Vertical Spine + Continuous Horizontal Dashed Line */}
                  <div className="col-start-2 row-start-2 relative flex items-center justify-center">
                    <div
                      aria-hidden="true"
                      className="w-[2px] h-full bg-[#164234]/80 relative z-10"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-[#164234]/60"
                    />
                  </div>

                  {/* Bottom-Center of Upper Zone: KETUA (Kepala Pusat Pengembangan Bisnis) */}
                  <div className="col-start-2 row-start-3 flex items-start justify-center">
                    <SkStaticBox
                      heading="KETUA"
                      subheading="Kepala Pusat Pengembangan Bisnis"
                      variant="primary"
                      minHeightClass="min-h-[96px]"
                    />
                  </div>

                  {/* Right Span (Rows 1..3): Dashed "Koordinatif" + Bracket + 2 Stacked University Leaders */}
                  <div className="col-start-3 row-start-1 row-span-3 flex items-center">
                    <div className="w-full flex items-center">
                      {/* Horizontal dashed connector from center spine with "Koordinatif" label */}
                      <div className="flex-1 min-w-[68px] relative flex items-center">
                        <div
                          aria-hidden="true"
                          className="w-full border-t-2 border-dashed border-[#164234]/60"
                        />
                        <span className="absolute inset-x-0 bottom-2 text-center text-xs font-medium tracking-wide text-[#3E544B] select-none">
                          Koordinatif
                        </span>
                      </div>

                      {/* Dashed Vertical T-Bracket branching to the 2 stacked boxes */}
                      <div className="w-[255px] xl:w-[295px] shrink-0 flex flex-col gap-5">
                        <div className="relative pl-6 flex items-center">
                          <div
                            aria-hidden="true"
                            className="absolute left-0 top-1/2 w-6 border-t-2 border-dashed border-[#164234]/60"
                          />
                          <div
                            aria-hidden="true"
                            className="absolute left-0 top-1/2 -bottom-2.5 border-l-2 border-dashed border-[#164234]/60"
                          />
                          <SkStaticBox
                            heading="Wakil Rektor Bidang Administrasi Umum, Perencanaan, dan Keuangan"
                            variant="coordinate"
                            minHeightClass="min-h-[88px]"
                          />
                        </div>

                        <div className="relative pl-6 flex items-center">
                          <div
                            aria-hidden="true"
                            className="absolute left-0 top-1/2 w-6 border-t-2 border-dashed border-[#164234]/60"
                          />
                          <div
                            aria-hidden="true"
                            className="absolute left-0 -top-2.5 bottom-1/2 border-l-2 border-dashed border-[#164234]/60"
                          />
                          <SkStaticBox
                            heading="Kepala Biro Umum, Akademik Perencanaan, dan Keuangan"
                            variant="coordinate"
                            minHeightClass="min-h-[88px]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Solid Spine from KETUA down to SEKRETARIS / BENDAHARA cross junction */}
                <div aria-hidden="true" className="w-[2px] h-8 bg-[#164234]/80" />

                {/* SEKRETARIS & BENDAHARA SIDE-BY-SIDE CROSS JUNCTION */}
                <div className="w-full max-w-[650px] xl:max-w-[700px] grid grid-cols-[1fr_64px_1fr] items-stretch">
                  <div className="flex items-center">
                    <SkStaticBox
                      heading="SEKRETARIS"
                      subheading="Sekretaris Pusat Pengembangan Bisnis"
                      minHeightClass="min-h-[92px]"
                    />
                  </div>

                  <div className="relative flex items-center justify-center">
                    <div aria-hidden="true" className="w-[2px] h-full bg-[#164234]/80" />
                    <div
                      aria-hidden="true"
                      className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#164234]/80"
                    />
                  </div>

                  <div className="flex items-center">
                    <SkStaticBox
                      heading="BENDAHARA"
                      subheading="Bendahara Pusat Pengembangan Bisnis"
                      minHeightClass="min-h-[92px]"
                    />
                  </div>
                </div>

                {/* LOWER VERTICAL CHAIN: MANAGER -> KEPALA UNIT USAHA -> KARYAWAN/STAF */}
                <div aria-hidden="true" className="w-[2px] h-8 bg-[#164234]/80" />

                <div className="w-[270px] xl:w-[300px]">
                  <SkStaticBox heading="MANAGER" minHeightClass="min-h-[78px]" />
                </div>

                <div aria-hidden="true" className="w-[2px] h-7 bg-[#164234]/80" />

                <div className="w-[270px] xl:w-[300px]">
                  <SkStaticBox heading="KEPALA UNIT USAHA" minHeightClass="min-h-[78px]" />
                </div>

                <div aria-hidden="true" className="w-[2px] h-7 bg-[#164234]/80" />

                <div className="w-[270px] xl:w-[300px]">
                  <SkStaticBox heading="KARYAWAN/STAF" minHeightClass="min-h-[78px]" />
                </div>
              </div>

              {/* Mobile & Tablet Clean Hierarchical Diagram (< lg) */}
              <div className="lg:hidden flex flex-col items-center gap-4 w-full max-w-xl mx-auto">
                <div className="w-full max-w-sm">
                  <SkStaticBox
                    heading="PENANGGUNG JAWAB"
                    subheading="Rektor"
                    variant="primary"
                  />
                </div>

                <div className="w-full rounded-2xl border border-dashed border-[#164234]/45 bg-[#F6F3EC]/70 p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-[0.16em] text-[#8F6D26]">
                    <span>Garis Pengawasan & Koordinatif</span>
                    <span>Garis Putus-Putus</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] uppercase tracking-wider text-[#3E544B]">
                      Pengawas
                    </span>
                    <SkStaticBox
                      heading="PENGAWAS"
                      subheading="Ketua SPI"
                      minHeightClass="min-h-[72px]"
                    />
                  </div>

                  <div className="flex flex-col gap-2 pt-1">
                    <span className="text-[11px] uppercase tracking-wider text-[#3E544B]">
                      Koordinatif
                    </span>
                    <SkStaticBox
                      heading="Wakil Rektor Bidang Administrasi Umum, Perencanaan, dan Keuangan"
                      variant="coordinate"
                      minHeightClass="min-h-[72px]"
                    />
                    <SkStaticBox
                      heading="Kepala Biro Umum, Akademik Perencanaan, dan Keuangan"
                      variant="coordinate"
                      minHeightClass="min-h-[72px]"
                    />
                  </div>
                </div>

                <div aria-hidden="true" className="w-[2px] h-5 bg-[#164234]/75" />

                <div className="w-full max-w-sm">
                  <SkStaticBox
                    heading="KETUA"
                    subheading="Kepala Pusat Pengembangan Bisnis"
                    variant="primary"
                  />
                </div>

                <div aria-hidden="true" className="w-[2px] h-5 bg-[#164234]/75" />

                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <SkStaticBox
                    heading="SEKRETARIS"
                    subheading="Sekretaris Pusat Pengembangan Bisnis"
                  />
                  <SkStaticBox
                    heading="BENDAHARA"
                    subheading="Bendahara Pusat Pengembangan Bisnis"
                  />
                </div>

                <div aria-hidden="true" className="w-[2px] h-5 bg-[#164234]/75" />

                <div className="w-full max-w-sm">
                  <SkStaticBox heading="MANAGER" minHeightClass="min-h-[72px]" />
                </div>

                <div aria-hidden="true" className="w-[2px] h-5 bg-[#164234]/75" />

                <div className="w-full max-w-sm">
                  <SkStaticBox heading="KEPALA UNIT USAHA" minHeightClass="min-h-[72px]" />
                </div>

                <div aria-hidden="true" className="w-[2px] h-5 bg-[#164234]/75" />

                <div className="w-full max-w-sm">
                  <SkStaticBox heading="KARYAWAN/STAF" minHeightClass="min-h-[72px]" />
                </div>
              </div>

              {/* Legend + Official Legal Basis Reference */}
              <div className="mt-10 pt-6 border-t border-[#C9A45A]/30 flex flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-[#3E544B]">
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className="inline-block w-8 border-t-2 border-solid border-[#164234]/80"
                      />
                      <span>Garis Pertanggungjawaban & Operasional</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className="inline-block w-8 border-t-2 border-dashed border-[#164234]/65"
                      />
                      <span>Garis Pengawasan & Koordinatif</span>
                    </div>
                  </div>
                  <span className="text-[#8F6D26] tabular-nums">
                    SK Rektor UIN Salatiga No. 56 Tahun 2026
                  </span>
                </div>

                <div className="rounded-2xl bg-[#F6F3EC]/90 border border-[#C9A45A]/25 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#164234]/10 border border-[#C9A45A]/30 flex items-center justify-center shrink-0">
                      <Icon
                        icon="mdi:file-document-outline"
                        className="w-5 h-5 text-[#164234]"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                        Dasar Penetapan Resmi · 02 Januari 2026
                      </span>
                      <p className="text-sm text-[#164234]">
                        Keputusan Rektor UIN Salatiga Nomor 56 Tahun 2026 tentang Struktur
                        Organisasi Pusat Pengembangan Bisnis BLU
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <a
                      href={SK_PDF_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] text-xs transition-colors"
                    >
                      <Icon icon="mdi:open-in-new" className="w-3.5 h-3.5 text-[#F4D993]" />
                      <span>Lihat Dokumen SK</span>
                    </a>
                    <a
                      href={SK_PDF_URL}
                      download="SK-Rektor-56-2026-Struktur-Organisasi-P2B-UIN-Salatiga.pdf"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#FAF8F3] text-[#164234] border border-[#C9A45A]/40 text-xs transition-colors"
                    >
                      <Icon icon="mdi:download-outline" className="w-3.5 h-3.5 text-[#8F6D26]" />
                      <span>Unduh PDF</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* 4 Operational Business Units Overview */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-6"
          >
            <div className="px-3 md:px-6 flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                Diktum Kedua · Pengembangan Unit Bisnis
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal text-[#164234] tracking-tight">
                Ruang Lingkup Layanan & Unit Usaha P2B
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {divisions.map((div, idx) => (
                <div
                  key={div.code}
                  className="group relative overflow-hidden rounded-[1.5rem] md:rounded-[2.25rem] bg-white/75 border border-[#C9A45A]/25 hover:border-[#C9A45A]/55 p-6 md:p-8 flex flex-col gap-4 transition-colors"
                >
                  <CardCornerPattern
                    index={idx}
                    position="bottom-right"
                    sizeClassName="w-44 h-44 sm:w-48 sm:h-48"
                    opacityClassName="opacity-[0.14] group-hover:opacity-[0.24]"
                  />
                  <div className="relative z-10 flex items-center justify-between gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[rgba(201,164,90,0.16)] border border-[#C9A45A]/35 flex items-center justify-center shrink-0">
                      <Icon icon={div.icon} className="w-5 h-5 text-[#164234]" />
                    </div>
                    <span className="text-xs tracking-widest text-[#8F6D26] tabular-nums">
                      {div.code}
                    </span>
                  </div>

                  <h3 className="relative z-10 text-xl font-normal text-[#164234] tracking-tight">
                    {div.title}
                  </h3>

                  <ul className="relative z-10 flex flex-col gap-2 text-sm text-[#3E544B] leading-relaxed">
                    {div.responsibilities.map((item) => (
                      <li
                        key={item}
                        className="px-3.5 py-2.5 rounded-2xl bg-[#F6F3EC]/85 border border-[#C9A45A]/20"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.section>
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
