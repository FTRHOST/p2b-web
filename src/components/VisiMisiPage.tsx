import { Icon } from '@iconify/react';
import { motion } from 'motion/react';
import { PageHero } from './PageHero';
import { Footer } from './Footer';
import { CardCornerPattern } from './CardCornerPattern';

import { SiteSettings } from '../types/cms';

interface VisiMisiPageProps {
  settings?: SiteSettings;
  onOpenStruktur: () => void;
  onNavigateSection: (target: 'top' | 'who-we-are' | 'news-updates' | 'lokasi-p2b') => void;
}

const misiStrategis = [
  {
    number: '01',
    title: 'Tata Kelola Bisnis Profesional',
    description:
      'Mengembangkan tata kelola bisnis universitas yang profesional, transparan, dan akuntabel.',
  },
  {
    number: '02',
    title: 'Optimalisasi Aset & Potensi',
    description:
      'Mengoptimalkan aset dan potensi universitas menjadi layanan dan produk bernilai tambah.',
  },
  {
    number: '03',
    title: 'Inovasi Bisnis & Layanan',
    description:
      'Mengembangkan inovasi bisnis dan layanan berbasis kebutuhan masyarakat.',
  },
  {
    number: '04',
    title: 'Kemitraan Strategis',
    description:
      'Membangun kemitraan strategis dengan berbagai pihak.',
  },
  {
    number: '05',
    title: 'Kewirausahaan & Kompetensi Mahasiswa',
    description:
      'Mendukung pengembangan budaya kewirausahaan dan kompetensi profesional mahasiswa.',
  },
];

export function VisiMisiPage({
  settings,
  onOpenStruktur,
  onNavigateSection,
}: VisiMisiPageProps) {
  return (
    <div className="min-h-screen bg-[#F6F3EC] flex flex-col">
      <PageHero
        eyebrow={settings?.page_visimisi_eyebrow?.trim() || 'Profil P2B · Arah Strategis'}
        title={settings?.page_visimisi_title?.trim() || 'Visi & Misi P2B UIN Salatiga'}
        subtitle={
          settings?.page_visimisi_subtitle?.trim() ||
          'Komitmen kelembagaan dalam membangun kemandirian PTN BLU, budaya inovasi kewirausahaan, dan layanan komersial unggul.'
        }
        imageSrc={
          settings?.page_visimisi_image?.trim() ||
          'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/uin-water.webp'
        }
        imageAlt="Fasilitas dan Aset Strategis P2B UIN Salatiga"
        cornerLabel="Tata Kelola"
        cornerActionLabel="Struktur Organisasi"
        cornerHref="/struktur-organisasi"
        onCornerClick={onOpenStruktur}
      />

      <main className="w-full flex justify-center px-3 md:px-5 pt-10 md:pt-14 pb-12 md:pb-20 flex-1">
        <div className="w-full max-w-[1536px] flex flex-col gap-10 md:gap-14">
          {/* Visi Card */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="group relative overflow-hidden rounded-[1.5rem] md:rounded-[3rem] bg-gradient-to-br from-[#0F3126] via-[#164234] to-[#1D5442] border border-[#C9A45A]/35 p-7 sm:p-10 md:p-14 text-[#FAF8F3] flex flex-col gap-5"
          >
            <CardCornerPattern
              index={3}
              position="top-right"
              sizeClassName="w-52 h-52 sm:w-64 sm:h-64"
              opacityClassName="opacity-[0.14] group-hover:opacity-[0.22]"
            />
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#F4D993]/15 border border-[#F4D993]/40 flex items-center justify-center shrink-0">
                <Icon icon="mdi:compass-outline" className="w-5 h-5 text-[#F4D993]" />
              </div>
              <span className="text-xs md:text-sm uppercase tracking-[0.16em] text-[#F4D993]">
                {settings?.page_visimisi_visi_label?.trim() || 'Visi P2B'}
              </span>
            </div>

            <h2 className="relative z-10 text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-normal tracking-tight leading-[1.2] max-w-5xl text-balance">
              {settings?.page_visimisi_visi_text?.trim() ||
                'Menjadi pusat pengembangan bisnis universitas yang profesional, inovatif, dan berkelanjutan dalam mendukung kemandirian serta peningkatan nilai tambah kelembagaan UIN Salatiga.'}
            </h2>

            <p className="relative z-10 text-sm sm:text-base text-[#F6F3EC]/85 max-w-3xl leading-relaxed">
              {settings?.page_visimisi_visi_subtext?.trim() ||
                'Sebagai bagian dari ekosistem entrepreneurial university PTN BLU, P2B menyelaraskan pertumbuhan pendapatan universitas dengan peningkatan kualitas layanan publik serta pengembangan kompetensi generasi muda.'}
            </p>
          </motion.section>

          {/* Misi Strategis Grid */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-6"
          >
            <div className="px-3 md:px-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs uppercase tracking-wider text-[#8F6D26] inline-flex items-center gap-1.5">
                  <Icon icon="mdi:target" className="w-3.5 h-3.5" />
                  <span>Misi P2B</span>
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal text-[#164234] tracking-tight">
                  Lima Fokus Misi Pengembangan Bisnis
                </h2>
              </div>

              <p className="text-sm sm:text-base text-[#3E544B] max-w-md leading-relaxed">
                Langkah operasional yang dijalankan P2B dalam menggerakkan potensi aset, unit usaha, kemitraan, dan inovasi kampus.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {misiStrategis.map((misi, idx) => (
                <div
                  key={misi.number}
                  className="group relative overflow-hidden rounded-[1.5rem] md:rounded-[2.25rem] bg-white/65 backdrop-blur-xl border border-[#C9A45A]/25 hover:border-[#C9A45A]/55 p-6 md:p-8 flex flex-col gap-3 transition-colors"
                >
                  <CardCornerPattern
                    index={idx}
                    position={idx % 2 === 0 ? 'bottom-right' : 'top-right'}
                    sizeClassName="w-36 h-36 sm:w-40 sm:h-40"
                    opacityClassName="opacity-[0.15] group-hover:opacity-[0.25]"
                  />
                  <span className="relative z-10 text-xs font-normal tracking-widest text-[#8F6D26] tabular-nums">
                    MISI {misi.number}
                  </span>
                  <h3 className="relative z-10 text-xl font-normal text-[#164234] tracking-tight leading-snug">
                    {misi.title}
                  </h3>
                  <p className="relative z-10 text-sm md:text-base text-[#3E544B] leading-relaxed">
                    {misi.description}
                  </p>
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
