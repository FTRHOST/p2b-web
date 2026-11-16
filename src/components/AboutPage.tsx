import { Building2, Handshake, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { PageHero } from './PageHero';
import { Footer } from './Footer';

interface AboutPageProps {
  onOpenVisiMisi: () => void;
  onNavigateSection: (target: 'top' | 'who-we-are' | 'news-updates' | 'lokasi-p2b') => void;
}

const governanceValues = [
  {
    icon: ShieldCheck,
    title: 'Transparan & Akuntabel',
    description:
      'Setiap pengelolaan unit bisnis, tarif layanan, dan optimalisasi aset dijalankan sesuai standar tata kelola PTN BLU yang terukur dan dapat dipertanggungjawabkan.',
  },
  {
    icon: Sparkles,
    title: 'Inovasi & Kewirausahaan',
    description:
      'Membangun ekosistem entrepreneurial university yang mendorong budaya inovasi, kolaborasi lintas unit, serta penciptaan nilai tambah berkelanjutan.',
  },
  {
    icon: Building2,
    title: 'Profesional & Berorientasi Layanan',
    description:
      'Mengembangkan layanan komersial berbasis kebutuhan nyata sivitas akademika dan masyarakat dengan mengutamakan mutu serta kepuasan pelanggan.',
  },
  {
    icon: Handshake,
    title: 'Kolaborasi Strategis',
    description:
      'Membuka kemitraan produktif bersama dunia industri, pemerintah, alumni, dan masyarakat sekaligus menghadirkan ruang praktik magang profesional mahasiswa.',
  },
];

export function AboutPage({ onOpenVisiMisi, onNavigateSection }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-[#F6F3EC] flex flex-col">
      <PageHero
        eyebrow="Tentang Kami · Profil Resmi"
        title="Pusat Pengembangan Bisnis"
        subtitle="Penggerak pengembangan bisnis, optimalisasi aset, layanan komersial, serta ekosistem entrepreneurial university UIN Salatiga."
        cornerLabel="Arah Strategis"
        cornerActionLabel="Visi & Misi P2B"
        cornerHref="#visi-misi"
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
            className="rounded-[1.5rem] md:rounded-[3rem] bg-white/60 backdrop-blur-xl border border-[#C9A45A]/30 p-6 sm:p-10 md:p-14 flex flex-col gap-8"
          >
            <div className="flex flex-col gap-2 max-w-4xl">
              <span className="text-xs md:text-sm font-normal text-[#8F6D26] uppercase tracking-wider">
                Profil Kelembagaan · PTN BLU
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal text-[#164234] tracking-tight leading-[1.12]">
                Mengenal Pusat Pengembangan Bisnis (P2B) UIN Salatiga
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 text-sm sm:text-base md:text-[17px] text-[#3E544B] leading-relaxed">
              <div className="flex flex-col gap-4">
                <p>
                  Pusat Pengembangan Bisnis (P2B) Universitas Islam Negeri (UIN) Salatiga merupakan unit strategis universitas yang berperan dalam mengembangkan, mengelola, dan mengoptimalkan potensi bisnis serta layanan komersial universitas dalam mendukung penguatan kelembagaan sebagai Perguruan Tinggi Negeri Badan Layanan Umum (PTN BLU).
                </p>
                <p>
                  P2B hadir sebagai penggerak pengembangan bisnis universitas melalui pengelolaan aset, pengembangan layanan, pembangunan kemitraan, serta penciptaan inovasi bisnis yang memberikan nilai tambah bagi universitas, sivitas akademika, dan masyarakat.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <p>
                  Sebagai bagian dari ekosistem <em>entrepreneurial university</em>, P2B tidak hanya berorientasi pada pengembangan pendapatan universitas, tetapi juga berperan dalam membangun budaya inovasi, kewirausahaan, kolaborasi, dan pemanfaatan potensi universitas secara profesional dan berkelanjutan.
                </p>
                <p>
                  Melalui tata kelola yang transparan, akuntabel, profesional, dan berorientasi layanan, P2B mengembangkan berbagai unit bisnis dan layanan komersial yang mendukung kemandirian universitas serta memperluas manfaat keberadaan UIN Salatiga bagi masyarakat.
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
                src="https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/uin-water.webp"
                alt="Optimalisasi Aset & Fasilitas P2B UIN Salatiga"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] rounded-[1.5rem] md:rounded-[3rem] overflow-hidden border border-[#C9A45A]/25 bg-[#EAE5D7]">
              <img
                src="https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2025/01/2025-Slider-2.png"
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
                Prinsip & Tata Kelola
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal text-[#164234] tracking-tight">
                Nilai Pengelolaan Bisnis Universitas
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {governanceValues.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-[1.5rem] md:rounded-[2.25rem] bg-white/60 backdrop-blur-xl border border-[#C9A45A]/25 p-6 md:p-8 flex flex-col gap-3"
                  >
                    <div className="w-11 h-11 rounded-full bg-[rgba(201,164,90,0.16)] border border-[#C9A45A]/35 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#164234]" />
                    </div>
                    <h3 className="text-xl font-normal text-[#164234] tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-sm md:text-base text-[#3E544B] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                );
              })}
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
