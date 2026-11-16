import { Compass, Layers, Target } from 'lucide-react';
import { motion } from 'motion/react';
import { PageHero } from './PageHero';
import { Footer } from './Footer';

interface VisiMisiPageProps {
  onOpenStruktur: () => void;
  onNavigateSection: (target: 'top' | 'who-we-are' | 'news-updates' | 'lokasi-p2b') => void;
}

const misiStrategis = [
  {
    number: '01',
    title: 'Optimalisasi Aset Universitas',
    description:
      'Mengelola dan mengembangkan pemanfaatan aset universitas agar memiliki nilai ekonomi dan manfaat yang lebih besar, meliputi fasilitas, ruang, sarana pendukung kegiatan, serta potensi aset strategis lainnya.',
  },
  {
    number: '02',
    title: 'Pengembangan Layanan Komersial',
    description:
      'Menghadirkan layanan komersial berbasis kebutuhan pengguna dengan mengutamakan mutu pelayanan, profesionalitas SDM, transparansi tarif, dan kepuasan pelanggan.',
  },
  {
    number: '03',
    title: 'Pengembangan Unit Bisnis',
    description:
      'Melakukan identifikasi peluang, kajian kelayakan, perintisan, serta evaluasi unit bisnis baru universitas berdasarkan prinsip tata kelola bisnis yang baik dan akuntabel.',
  },
  {
    number: '04',
    title: 'Pengembangan Kemitraan Strategis',
    description:
      'Membuka peluang kerja sama produktif bersama dunia industri, pemerintah, alumni, masyarakat, dan sivitas akademika untuk menciptakan kolaborasi yang memberikan manfaat bersama.',
  },
  {
    number: '05',
    title: 'Pengembangan Talenta & Inovasi Mahasiswa',
    description:
      'Menjadi ruang pembelajaran praktik melalui keterlibatan mahasiswa dalam kegiatan bisnis universitas, program magang profesional, serta pengembangan kompetensi IT, komunikasi, pemasaran digital, bisnis, dan akuntansi.',
  },
];

const tataKelolaPillars = [
  {
    title: 'Transparan',
    detail: 'Prosedur, tarif layanan, dan kerja sama bisnis terpublikasi jelas.',
  },
  {
    title: 'Akuntabel',
    detail: 'Pelaporan kinerja unit usaha sesuai regulasi keuangan PTN BLU.',
  },
  {
    title: 'Profesional',
    detail: 'Standar layanan modern yang berfokus pada mutu dan ketepatan.',
  },
  {
    title: 'Berkelanjutan',
    detail: 'Penguatan kemandirian universitas jangka panjang bagi masyarakat.',
  },
];

export function VisiMisiPage({
  onOpenStruktur,
  onNavigateSection,
}: VisiMisiPageProps) {
  return (
    <div className="min-h-screen bg-[#F6F3EC] flex flex-col">
      <PageHero
        eyebrow="Profil P2B · Arah Strategis"
        title="Visi & Misi P2B UIN Salatiga"
        subtitle="Komitmen kelembagaan dalam membangun kemandirian PTN BLU, budaya inovasi kewirausahaan, dan layanan komersial unggul."
        imageSrc="https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/uin-water.webp"
        imageAlt="Fasilitas dan Aset Strategis P2B UIN Salatiga"
        cornerLabel="Tata Kelola"
        cornerActionLabel="Struktur Organisasi"
        cornerHref="#struktur-organisasi"
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
            className="rounded-[1.5rem] md:rounded-[3rem] bg-gradient-to-br from-[#0F3126] via-[#164234] to-[#1D5442] border border-[#C9A45A]/35 p-7 sm:p-10 md:p-14 text-[#FAF8F3] flex flex-col gap-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#F4D993]/15 border border-[#F4D993]/40 flex items-center justify-center shrink-0">
                <Compass className="w-5 h-5 text-[#F4D993]" />
              </div>
              <span className="text-xs md:text-sm uppercase tracking-[0.16em] text-[#F4D993]">
                Visi Utama P2B
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-normal tracking-tight leading-[1.2] max-w-5xl text-balance">
              Menjadi pusat pengembangan bisnis perguruan tinggi yang mandiri, inovatif, akuntabel, serta mampu menciptakan nilai tambah berkelanjutan bagi UIN Salatiga, sivitas akademika, dan masyarakat.
            </h2>

            <p className="text-sm sm:text-base text-[#F6F3EC]/85 max-w-3xl leading-relaxed">
              Sebagai bagian dari ekosistem <em>entrepreneurial university</em> PTN BLU, P2B menyelaraskan pertumbuhan pendapatan universitas dengan peningkatan kualitas layanan publik serta pengembangan kompetensi generasi muda.
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
                  <Target className="w-3.5 h-3.5" />
                  <span>Misi Strategis</span>
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal text-[#164234] tracking-tight">
                  Lima Fokus Pengembangan Bisnis
                </h2>
              </div>

              <p className="text-sm sm:text-base text-[#3E544B] max-w-md leading-relaxed">
                Langkah operasional yang dijalankan P2B dalam menggerakkan potensi aset, unit usaha, kemitraan, dan inovasi kampus.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {misiStrategis.map((misi) => (
                <div
                  key={misi.number}
                  className="rounded-[1.5rem] md:rounded-[2.25rem] bg-white/65 backdrop-blur-xl border border-[#C9A45A]/25 p-6 md:p-8 flex flex-col gap-3"
                >
                  <span className="text-xs font-normal tracking-widest text-[#8F6D26] tabular-nums">
                    MISI {misi.number}
                  </span>
                  <h3 className="text-xl font-normal text-[#164234] tracking-tight leading-snug">
                    {misi.title}
                  </h3>
                  <p className="text-sm md:text-base text-[#3E544B] leading-relaxed">
                    {misi.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Tata Kelola Strip */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[1.5rem] md:rounded-[2.5rem] bg-white/55 backdrop-blur-xl border border-[#C9A45A]/30 p-6 sm:p-8 md:p-10 flex flex-col gap-6"
          >
            <div className="flex items-center gap-2.5 text-[#164234]">
              <Layers className="w-5 h-5 text-[#8F6D26]" />
              <h2 className="text-xl sm:text-2xl font-normal tracking-tight">
                Komitmen Tata Kelola PTN BLU
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {tataKelolaPillars.map((pillar) => (
                <div
                  key={pillar.title}
                  className="rounded-2xl bg-[#F6F3EC]/80 border border-[#C9A45A]/25 p-5 flex flex-col gap-1.5"
                >
                  <span className="text-base font-normal text-[#164234]">
                    {pillar.title}
                  </span>
                  <p className="text-xs sm:text-sm text-[#3E544B] leading-relaxed">
                    {pillar.detail}
                  </p>
                </div>
              ))}
            </div>
          </motion.section>
        </div>
      </main>

      <Footer
        onNavigate={(target) => {
          onNavigateSection(target);
        }}
      />
    </div>
  );
}
