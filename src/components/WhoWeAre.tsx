import { useState } from 'react';
import { ArrowUpRight, ChevronRight, Layers, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FocusCardData {
  id: string;
  title: string;
  subtitle: string;
  linkLabel: string;
  href: string;
  image: string;
  description: string;
  highlights: string[];
}

const focusCards: FocusCardData[] = [
  {
    id: 'aset-layanan',
    title: 'Optimalisasi Aset & Layanan',
    subtitle: 'Auditorium, Sewa Aset, Klinik UIN SAGA & Kantin',
    linkLabel: 'Jelajahi Aset & Layanan',
    href: '#layanan-aset',
    image: 'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/uin-water.webp',
    description:
      'P2B UIN Salatiga mengelola aset dan unit layanan komersial universitas—mulai dari Gedung Auditorium, fasilitas sewa ruang, produk Air Mineral, hingga Klinik UIN SAGA dan Kantin—dengan tata kelola PTN BLU yang transparan dan berorientasi kepuasan pelanggan.',
    highlights: [
      'Pemanfaatan fasilitas, gedung auditorium, dan sarana pendukung kegiatan',
      'Klinik UIN SAGA, Kantin kampus, dan produk Air Mineral terstandar',
      'Sistem pemesanan sewa aset & tiket yang akuntabel',
    ],
  },
  {
    id: 'kemitraan-talenta',
    title: 'Kemitraan & Talenta Mahasiswa',
    subtitle: 'Kolaborasi strategis & magang profesional',
    linkLabel: 'Lihat Program Kemitraan',
    href: '#kemitraan-talenta',
    image: 'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2025/01/2025-Slider-2.png',
    description:
      'Sebagai penggerak ekosistem entrepreneurial university, P2B menjembatani kolaborasi bersama dunia industri, pemerintah, alumni, dan masyarakat sekaligus menghadirkan ruang praktik nyata bagi mahasiswa UIN Salatiga.',
    highlights: [
      'Kemitraan strategis bersama industri, pemerintah, dan alumni',
      'Program magang profesional & keterlibatan langsung di unit bisnis',
      'Pengembangan kompetensi IT, komunikasi, pemasaran digital, bisnis & akuntansi',
    ],
  },
];

export function WhoWeAre() {
  const [selectedCard, setSelectedCard] = useState<FocusCardData | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  return (
    <section
      id="who-we-are"
      className="w-full flex justify-center px-3 md:px-5 pt-8 md:pt-14 pb-12 md:pb-20 bg-[#F6F3EC]"
    >
      <div className="w-full max-w-[1536px] flex flex-col gap-10 md:gap-14">
        {/* Intro Header & Tentang P2B */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="px-3 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start"
        >
          <div className="lg:col-span-5 flex flex-col gap-2">
            <span className="text-xs md:text-sm font-normal text-[#8F6D26] uppercase tracking-wider">
              Tentang P2B · UIN Salatiga
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-normal text-[#164234] tracking-tight leading-[1.08]">
              Penggerak Ekosistem Bisnis PTN BLU
            </h2>
          </div>

          <div className="lg:col-span-7 flex flex-col gap-4 text-sm sm:text-base text-[#3E544B] leading-relaxed font-normal">
            <p>
              Pusat Pengembangan Bisnis (P2B) Universitas Islam Negeri (UIN) Salatiga merupakan unit strategis universitas yang berperan dalam mengembangkan, mengelola, dan mengoptimalkan potensi bisnis serta layanan komersial universitas dalam mendukung penguatan kelembagaan sebagai Perguruan Tinggi Negeri Badan Layanan Umum (PTN BLU).
            </p>
            <p>
              Sebagai bagian dari ekosistem <em>entrepreneurial university</em>, P2B hadir melalui pengelolaan aset, pengembangan layanan, pembangunan kemitraan, dan penciptaan inovasi bisnis secara transparan, akuntabel, profesional, serta berkelanjutan untuk mendukung kemandirian universitas dan memperluas manfaat bagi sivitas akademika maupun masyarakat.
            </p>
          </div>
        </motion.div>

        {/* 2 Featured Product/Service Cards matching Hero architecture */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {focusCards.map((card, index) => (
            <motion.a
              key={card.id}
              href={card.href}
              onClick={(e) => {
                e.preventDefault();
                setSelectedCard(card);
              }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: index * 0.12, ease: 'easeOut' }}
              className="relative w-full aspect-[4/3] rounded-[1.5rem] md:rounded-[3rem] overflow-hidden bg-white/40 border border-[#C9A45A]/25 group block cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#164234]"
            >
              {/* Fallback gradient mesh if image fails */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#EAE5D7] via-[#E1E7DF] to-[#D4DED6] flex flex-col items-center justify-center gap-2 text-[#164234]/60">
                <Layers className="w-8 h-8" />
                <span className="text-sm font-normal">{card.title}</span>
              </div>

              {!failedImages[card.id] && (
                <img
                  src={card.image}
                  alt={card.title}
                  referrerPolicy="no-referrer"
                  onError={() =>
                    setFailedImages((prev) => ({ ...prev, [card.id]: true }))
                  }
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              )}

              {/* Subtle warm cream-emerald tint */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#164234]/12 via-transparent to-[#F6F3EC]/15 pointer-events-none" />

              {/* Faux-Cutout Bottom-Right Corner with Arrow Redirect Cue */}
              <div className="absolute bottom-0 right-0 px-5 py-3.5 pt-4 pl-7 sm:px-6 sm:py-4 sm:pt-5 sm:pl-9 md:px-7 md:py-5 md:pt-6 md:pl-11 bg-[#F6F3EC] rounded-tl-[1.5rem] sm:rounded-tl-[2rem] md:rounded-tl-[3rem] flex items-center z-10">
                {/* Top intersection mask */}
                <div className="absolute -top-[1.5rem] sm:-top-[2rem] md:-top-[3rem] right-0 w-[1.5rem] sm:w-[2rem] md:w-[3rem] h-[1.5rem] sm:h-[2rem] md:h-[3rem] pointer-events-none">
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 56 56"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M56 56V0C56 30.9279 30.9279 56 0 56H56Z" fill="#F6F3EC" />
                  </svg>
                </div>

                {/* Left intersection mask */}
                <div className="absolute bottom-0 -left-[1.5rem] sm:-left-[2rem] md:-left-[3rem] w-[1.5rem] sm:w-[2rem] md:w-[3rem] h-[1.5rem] sm:h-[2rem] md:h-[3rem] pointer-events-none">
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 56 56"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M56 56H0C30.9279 56 56 30.9279 56 0V56Z" fill="#F6F3EC" />
                  </svg>
                </div>

                <div className="flex flex-col pr-1">
                  <span className="text-[14px] md:text-[17px] font-normal text-[#164234] whitespace-nowrap">
                    {card.title}
                  </span>
                  <div className="flex items-center gap-0.5 text-[#8F6D26] group-hover:text-[#164234] transition-colors">
                    <span className="text-[11px] md:text-[13px] font-normal whitespace-nowrap">
                      {card.linkLabel}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>

      {/* Focus Card Detail Modal */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCard(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0E2A21]/25 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-3xl bg-[#FAF8F3]/95 backdrop-blur-2xl border border-[#C9A45A]/30 p-6 md:p-8 text-[#164234] shadow-lg relative"
            >
              <button
                type="button"
                onClick={() => setSelectedCard(null)}
                aria-label="Tutup detail"
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[rgba(22,66,52,0.08)] hover:bg-[rgba(22,66,52,0.15)] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-[#164234]" />
              </button>

              <span className="text-xs font-normal text-[#8F6D26] uppercase tracking-wider">
                P2B UIN Salatiga
              </span>
              <h3 className="text-2xl md:text-3xl font-normal tracking-tight mt-1 mb-2">
                {selectedCard.title}
              </h3>
              <p className="text-sm text-[#3E544B] leading-relaxed mb-5">
                {selectedCard.description}
              </p>

              <ul className="flex flex-col gap-2.5 mb-6">
                {selectedCard.highlights.map((item) => (
                  <li
                    key={item}
                    className="text-sm text-[#164234] px-4 py-2.5 rounded-2xl bg-white/75 border border-[#C9A45A]/25"
                  >
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedCard(null)}
                  className="px-5 py-2.5 rounded-full bg-[rgba(22,66,52,0.08)] hover:bg-[rgba(22,66,52,0.14)] text-[#164234] text-sm font-normal transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                <a
                  href={selectedCard.href}
                  onClick={(e) => {
                    e.preventDefault();
                    window.history.replaceState(null, '', selectedCard.href);
                    setSelectedCard(null);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] border border-[#C9A45A]/40 text-sm font-normal transition-colors cursor-pointer"
                >
                  <span>{selectedCard.linkLabel}</span>
                  <ArrowUpRight className="w-4 h-4 text-[#F4D993]" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
