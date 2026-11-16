import { ArrowLeft, ArrowUpRight, Building2, Handshake, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Footer } from './Footer';

interface AboutPageProps {
  onBackHome: () => void;
  onNavigateSection: (target: 'top' | 'who-we-are' | 'news-updates' | 'lokasi-p2b') => void;
  onOpenAllNews: () => void;
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

export function AboutPage({
  onBackHome,
  onNavigateSection,
  onOpenAllNews,
}: AboutPageProps) {
  return (
    <div className="min-h-screen bg-[#F6F3EC] flex flex-col">
      {/* Top Glassmorphism Bar */}
      <header className="w-full flex justify-center px-3 md:px-5 pt-3 md:pt-5">
        <div className="w-full max-w-[1536px] rounded-[1.5rem] md:rounded-[2.5rem] bg-white/65 backdrop-blur-xl border border-[#C9A45A]/30 px-5 sm:px-8 py-4 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(22,66,52,0.08)] hover:bg-[#164234] text-[#164234] hover:text-[#F6F3EC] text-xs sm:text-sm font-normal transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </button>

          <button
            type="button"
            onClick={onBackHome}
            aria-label="Beranda P2B UIN Salatiga"
            className="hidden sm:inline-flex items-center cursor-pointer shrink-0"
          >
            <img
              src="https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/Logo.webp"
              alt="Logo Pusat Pengembangan Bisnis UIN Salatiga"
              referrerPolicy="no-referrer"
              className="h-8 md:h-9 w-auto object-contain"
            />
          </button>

          <a
            href="#semua-berita"
            onClick={(e) => {
              e.preventDefault();
              onOpenAllNews();
            }}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#8F6D26] hover:text-[#164234] font-normal transition-colors whitespace-nowrap shrink-0"
          >
            <span>News & Update</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full flex justify-center px-3 md:px-5 pt-10 md:pt-14 pb-12 md:pb-20 flex-1">
        <div className="w-full max-w-[1536px] flex flex-col gap-10 md:gap-14">
          {/* Intro Editorial Section */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[1.5rem] md:rounded-[3rem] bg-white/60 backdrop-blur-xl border border-[#C9A45A]/30 p-6 sm:p-10 md:p-14 flex flex-col gap-8"
          >
            <div className="flex flex-col gap-3 max-w-4xl">
              <span className="text-xs md:text-sm font-normal text-[#8F6D26] uppercase tracking-wider">
                Tentang Kami · Profil Resmi
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[60px] font-normal text-[#164234] tracking-tight leading-[1.06] text-balance">
                Pusat Pengembangan Bisnis (P2B) UIN Salatiga
              </h1>
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
                src="/src/assets/images/p2b_optimalisasi_aset_1794837551755.jpg"
                alt="Optimalisasi Aset & Fasilitas P2B UIN Salatiga"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] rounded-[1.5rem] md:rounded-[3rem] overflow-hidden border border-[#C9A45A]/25 bg-[#EAE5D7]">
              <img
                src="/src/assets/images/p2b_kemitraan_talenta_1794837552853.jpg"
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
