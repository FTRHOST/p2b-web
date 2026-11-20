import { Icon } from '@iconify/react';
import { motion } from 'motion/react';
import { PageHero } from './PageHero';
import { Footer } from './Footer';
import { CardCornerPattern } from './CardCornerPattern';

import { SiteSettings } from '../types/cms';

interface AboutPageProps {
  settings?: SiteSettings;
  onOpenVisiMisi: () => void;
  onNavigateSection: (target: 'top' | 'who-we-are' | 'news-updates' | 'lokasi-p2b') => void;
}

const EMBLEM_ICONS: Record<'ledger' | 'prism' | 'pillar' | 'bridge', string> = {
  ledger: 'mdi:shield-check-outline',
  prism: 'mdi:cube-outline',
  pillar: 'mdi:office-building-outline',
  bridge: 'mdi:handshake-outline',
};

function GovernanceEmblem({ variant }: { variant: 'ledger' | 'prism' | 'pillar' | 'bridge' }) {
  return (
    <div className="w-12 h-12 rounded-2xl bg-[#EAE3D2]/75 border border-[#C9A45A]/35 flex items-center justify-center text-[#164234]">
      <Icon icon={EMBLEM_ICONS[variant]} className="w-6 h-6" />
    </div>
  );
}

const governanceValues: {
  number: string;
  emblem: 'ledger' | 'prism' | 'pillar' | 'bridge';
  title: string;
  description: string;
}[] = [
  {
    number: '01',
    emblem: 'ledger',
    title: 'Transparan & Akuntabel',
    description:
      'Setiap pengelolaan unit bisnis, tarif layanan, dan optimalisasi aset dijalankan sesuai standar tata kelola PTN BLU yang terukur dan dapat dipertanggungjawabkan.',
  },
  {
    number: '02',
    emblem: 'prism',
    title: 'Inovasi & Kewirausahaan',
    description:
      'Membangun ekosistem entrepreneurial university yang mendorong budaya inovasi, kolaborasi lintas unit, serta penciptaan nilai tambah berkelanjutan.',
  },
  {
    number: '03',
    emblem: 'pillar',
    title: 'Profesional & Berorientasi Layanan',
    description:
      'Mengembangkan layanan komersial berbasis kebutuhan nyata sivitas akademika dan masyarakat dengan mengutamakan mutu serta kepuasan pelanggan.',
  },
  {
    number: '04',
    emblem: 'bridge',
    title: 'Kolaborasi Strategis',
    description:
      'Membuka kemitraan produktif bersama dunia industri, pemerintah, alumni, dan masyarakat sekaligus menghadirkan ruang praktik magang profesional mahasiswa.',
  },
];

export function AboutPage({
  settings,
  onOpenVisiMisi,
  onNavigateSection,
}: AboutPageProps) {
  return (
    <div className="min-h-screen bg-[#F6F3EC] flex flex-col">
      <PageHero
        eyebrow={settings?.page_about_eyebrow?.trim() || 'Tentang Kami · Profil Resmi'}
        title={settings?.page_about_title?.trim() || 'Pusat Pengembangan Bisnis'}
        subtitle={
          settings?.page_about_subtitle?.trim() ||
          'Penggerak pengembangan bisnis, optimalisasi aset, layanan komersial, serta ekosistem entrepreneurial university UIN Salatiga.'
        }
        imageSrc={
          settings?.page_about_image?.trim() ||
          'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/Auditorium-Student-Centre-di-Salatiga.png'
        }
        cornerLabel="Arah Strategis"
        cornerActionLabel="Visi & Misi P2B"
        cornerHref="/visi-misi"
        onCornerClick={onOpenVisiMisi}
      />

      {/* Main Content */}
      <main className="w-full flex justify-center px-3 md:px-5 pt-10 md:pt-14 pb-12 md:pb-20 flex-1">
        <div className="w-full max-w-[1536px] flex flex-col gap-10 md:gap-14">
          {/* Intro Editorial Section */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="group relative overflow-hidden rounded-[1.5rem] md:rounded-[3rem] bg-white/60 backdrop-blur-xl border border-[#C9A45A]/30 p-6 sm:p-10 md:p-14 flex flex-col gap-8"
          >
            <CardCornerPattern
              index={2}
              position="top-right"
              sizeClassName="w-48 h-48 sm:w-56 sm:h-56"
              opacityClassName="opacity-[0.14] group-hover:opacity-[0.22]"
            />
            <div className="relative z-10 flex flex-col gap-2 max-w-4xl">
              <span className="text-xs md:text-sm font-normal text-[#8F6D26] uppercase tracking-wider">
                Profil Kelembagaan · PTN BLU
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal text-[#164234] tracking-tight leading-[1.12]">
                {settings?.page_about_intro_heading?.trim() ||
                  'Mengenal Pusat Pengembangan Bisnis (P2B) UIN Salatiga'}
              </h2>
            </div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 text-sm sm:text-base md:text-[17px] text-[#3E544B] leading-relaxed">
              <div className="flex flex-col gap-4">
                <p>
                  {settings?.page_about_p1?.trim() ||
                    'Pusat Pengembangan Bisnis (P2B) Universitas Islam Negeri (UIN) Salatiga merupakan unit strategis universitas yang berperan dalam mengembangkan, mengelola, dan mengoptimalkan potensi bisnis serta layanan komersial universitas dalam mendukung penguatan kelembagaan sebagai Perguruan Tinggi Negeri Badan Layanan Umum (PTN BLU).'}
                </p>
                <p>
                  {settings?.page_about_p2?.trim() ||
                    'P2B hadir sebagai penggerak pengembangan bisnis universitas melalui pengelolaan aset, pengembangan layanan, pembangunan kemitraan, serta penciptaan inovasi bisnis yang memberikan nilai tambah bagi universitas, sivitas akademika, dan masyarakat.'}
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <p>
                  {settings?.page_about_p3?.trim() ||
                    'Sebagai bagian dari ekosistem entrepreneurial university, P2B tidak hanya berorientasi pada pengembangan pendapatan universitas, tetapi juga berperan dalam membangun budaya inovasi, kewirausahaan, kolaborasi, dan pemanfaatan potensi universitas secara profesional dan berkelanjutan.'}
                </p>
                <p>
                  {settings?.page_about_p4?.trim() ||
                    'Melalui tata kelola yang transparan, akuntabel, profesional, dan berorientasi layanan, P2B mengembangkan berbagai unit bisnis dan layanan komersial yang mendukung kemandirian universitas serta memperluas manfaat keberadaan UIN Salatiga bagi masyarakat.'}
                </p>
              </div>
            </div>
          </motion.section>

          {/* Architectural Feature Banner */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6"
          >
            <div className="relative aspect-[4/3] rounded-[1.5rem] md:rounded-[3rem] overflow-hidden border border-[#C9A45A]/25 bg-[#EAE5D7]">
              <img
                src={
                  settings?.page_about_banner_1?.trim() ||
                  'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/uin-water.webp'
                }
                alt="Optimalisasi Aset & Fasilitas P2B UIN Salatiga"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] rounded-[1.5rem] md:rounded-[3rem] overflow-hidden border border-[#C9A45A]/25 bg-[#EAE5D7]">
              <img
                src={
                  settings?.page_about_banner_2?.trim() ||
                  'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2025/01/2025-Slider-2.png'
                }
                alt="Kolaborasi & Talenta Mahasiswa P2B UIN Salatiga"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.section>

          {/* Governance & Ecosystem Values */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-6"
          >
            <div className="px-3 md:px-6 flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                Prinsip &amp; Tata Kelola
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal text-[#164234] tracking-tight">
                Nilai Pengelolaan Bisnis Universitas
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              {governanceValues.map((item, idx) => (
                <div
                  key={item.title}
                  className="group relative bg-[#FAF8F3]/95 rounded-[30px] border border-[#C9A45A]/30 hover:border-[#C9A45A]/65 min-h-[280px] flex flex-col justify-between p-7 sm:p-8 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_44px_-22px_rgba(22,66,52,0.2)] overflow-hidden"
                >
                  {/* Decorative tilted & zoomed corner pattern */}
                  <CardCornerPattern
                    index={idx}
                    position="bottom-right"
                    sizeClassName="w-44 h-44 sm:w-48 sm:h-48"
                    opacityClassName="opacity-[0.18] group-hover:opacity-[0.28]"
                  />

                  {/* Subtle authentic architectural corner glow */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full bg-radial from-[#C9A45A]/12 via-[#C9A45A]/4 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-500"
                  />

                  <div className="relative z-10 flex items-start justify-between gap-4">
                    <div className="w-12 h-12 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                      <GovernanceEmblem variant={item.emblem} />
                    </div>
                    <span className="text-xs font-normal tracking-[0.18em] text-[#8F6D26]/80 tabular-nums pt-1">
                      {item.number}
                    </span>
                  </div>

                  <div className="relative z-10 mt-6 mb-7 text-left">
                    <h3 className="text-xl sm:text-2xl font-normal text-[#164234] tracking-tight leading-snug">
                      {item.title}
                    </h3>
                    <p className="mt-2.5 text-sm sm:text-[15px] text-[#3E544B] leading-relaxed max-w-xl">
                      {item.description}
                    </p>
                  </div>

                  <div className="relative z-10 flex items-center justify-between">
                    <a
                      href="/visi-misi"
                      onClick={(e) => {
                        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
                          return;
                        }
                        e.preventDefault();
                        onOpenVisiMisi();
                      }}
                      aria-label={`Pelajari arah strategis terkait ${item.title}`}
                      className="inline-flex items-center gap-3 group/link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#164234] rounded-full"
                    >
                      <span className="w-10 h-10 rounded-full bg-[#EAE3D2] text-[#164234] group-hover:bg-[#164234] group-hover:text-[#FAF8F3] flex items-center justify-center ring-0 group-hover:ring-4 ring-[#C9A45A]/25 transition-all duration-500 ease-out">
                        <Icon
                          icon="mdi:arrow-top-right"
                          className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
                        />
                      </span>
                      <span className="text-xs font-medium tracking-wide text-[#8F6D26] opacity-0 -translate-x-1.5 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        Visi &amp; Misi P2B
                      </span>
                    </a>
                  </div>
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
