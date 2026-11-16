import { useRef, useState } from 'react';
import { X, Check } from 'lucide-react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'motion/react';
import { Navbar } from './Navbar';
import { BottomRightCorner } from './BottomRightCorner';

type ModalType = 'contact' | 'section' | null;

const sectionDetails: Record<string, { title: string; summary: string; points: string[] }> = {
  'Profil · Tentang': {
    title: 'Tentang P2B UIN Salatiga',
    summary:
      'Pusat Pengembangan Bisnis (P2B) Universitas Islam Negeri (UIN) Salatiga merupakan unit strategis universitas yang berperan dalam mengembangkan, mengelola, dan mengoptimalkan potensi bisnis serta layanan komersial universitas dalam mendukung penguatan kelembagaan sebagai Perguruan Tinggi Negeri Badan Layanan Umum (PTN BLU).',
    points: [
      'Penggerak pengembangan bisnis melalui pengelolaan aset, layanan, kemitraan, dan inovasi.',
      'Membangun ekosistem entrepreneurial university yang profesional dan berkelanjutan.',
      'Tata kelola transparan, akuntabel, dan berorientasi pada kepuasan pengguna layanan.',
    ],
  },
  'Profil · Visi Misi': {
    title: 'Visi & Misi P2B UIN Salatiga',
    summary:
      'Menjadi pusat pengembangan bisnis perguruan tinggi yang mandiri, inovatif, akuntabel, dan memberi nilai tambah nyata bagi universitas, sivitas akademika, serta masyarakat.',
    points: [
      'Mengoptimalkan pemanfaatan aset universitas agar bernilai ekonomi dan manfaat lebih besar.',
      'Mengembangkan unit bisnis serta layanan komersial berbasis kebutuhan pengguna.',
      'Membuka kemitraan strategis dengan industri, pemerintah, alumni, dan masyarakat.',
    ],
  },
  'Profil · Struktur Organisasi': {
    title: 'Struktur Organisasi P2B',
    summary:
      'Dikelola dengan prinsip tata kelola PTN BLU yang profesional, memisahkan fungsi perencanaan strategis, operasional unit usaha, pengembangan kemitraan, dan pelaporan keuangan.',
    points: [
      'Pengarah & Pimpinan Universitas (UIN Salatiga)',
      'Kepala Pusat Pengembangan Bisnis & Manajemen Operasional',
      'Divisi Aset & Layanan Komersial, Kemitraan, serta Inkubasi Talenta Mahasiswa',
    ],
  },
};

interface HeroProps {
  onOpenAbout?: () => void;
}

export function Hero({ onOpenAbout }: HeroProps) {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [bgFailed, setBgFailed] = useState(false);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [0, 48]);
  const bgScale = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [1, 1] : [1, 1.06]);
  const contentY = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [0, 36]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.85], prefersReducedMotion ? [1, 1] : [1, 0.15]);

  const handleOpenContact = () => {
    setContactSubmitted(false);
    setContactEmail('');
    setContactMessage('');
    setActiveModal('contact');
  };

  const handleSelectSection = (label: string) => {
    if (label === 'Profil · Tentang') {
      onOpenAbout?.();
      return;
    }
    setSelectedSection(label);
    setActiveModal('section');
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail.trim()) return;
    setContactSubmitted(true);
  };

  const activeSectionDetail = sectionDetails[selectedSection];

  return (
    <div
      ref={heroRef}
      className="w-full h-screen flex items-center justify-center p-3 md:p-5 bg-[#F6F3EC]"
    >
      <motion.section
        initial={{ opacity: 0, scale: 0.99 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.05 }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[1536px] h-full rounded-[1.5rem] md:rounded-[3rem] overflow-hidden shadow-none flex flex-col items-center bg-white/20 border border-[#C9A45A]/20 group"
      >
        {/* Fallback backdrop if image fails to load */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B261D] via-[#164234] to-[#1E5644] z-0" />

        {!bgFailed && (
          <motion.div
            style={{ y: bgY, scale: bgScale }}
            className="absolute inset-0 w-full h-full z-0 will-change-transform"
          >
            <motion.img
              initial={{ opacity: 0, scale: 1.05 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.05 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              src="https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/Auditorium-Student-Centre-di-Salatiga.png"
              alt="Auditorium Student Centre UIN Salatiga"
              referrerPolicy="no-referrer"
              onError={() => setBgFailed(true)}
              className="w-full h-full object-cover object-[65%] lg:object-center"
            />
          </motion.div>
        )}

        {/* Deep emerald green gradient scrim for high-contrast white/cream typography */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A241B]/90 via-[#164234]/68 to-[#164234]/28 z-0 pointer-events-none" />

        <div className="relative z-10 w-full h-full flex flex-col items-center">
          <Navbar
            onContact={handleOpenContact}
            onSelectSection={handleSelectSection}
          />

          <div className="flex-1 w-full flex items-center justify-center px-6 pb-14 md:pb-20">
            <motion.div
              style={{ y: contentY, opacity: contentOpacity }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.12,
                    delayChildren: 0.08,
                  },
                },
              }}
              className="w-full flex flex-col items-center text-center max-w-4xl will-change-transform"
            >
              <motion.h1
                variants={{
                  hidden: { opacity: 0, y: 24, scale: 0.98 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-[74px] font-normal text-[#FAF8F3] drop-shadow-sm mb-3 tracking-tight leading-[1.06] text-balance"
              >
                Pusat Pengembangan Bisnis
              </motion.h1>

              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 18 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
                className="text-sm sm:text-base md:text-lg text-[#F6F3EC]/90 leading-relaxed max-w-2xl font-normal"
              >
                Unit strategis UIN Salatiga dalam optimalisasi aset, layanan komersial, kemitraan, dan inovasi bisnis mendukung kemandirian PTN BLU yang profesional serta berkelanjutan.
              </motion.p>
            </motion.div>
          </div>

          <BottomRightCorner onOpenProfile={onOpenAbout} />
        </div>
      </motion.section>

      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0E2A21]/25 backdrop-blur-sm"
            onClick={() => setActiveModal(null)}
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
                onClick={() => setActiveModal(null)}
                aria-label="Tutup modal"
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[rgba(22,66,52,0.08)] hover:bg-[rgba(22,66,52,0.15)] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-[#164234]" />
              </button>

              {activeModal === 'contact' && (
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                    P2B UIN Salatiga
                  </span>
                  <h2 className="text-2xl font-normal tracking-tight mt-1 mb-2">
                    Hubungi Kami
                  </h2>
                  <p className="text-sm text-[#3E544B] mb-6">
                    Kirimkan pertanyaan terkait layanan sewa aset, Gedung Auditorium, Klinik UIN SAGA, kemitraan, maupun program magang mahasiswa.
                  </p>

                  {contactSubmitted ? (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-[rgba(22,66,52,0.06)] border border-[#C9A45A]/25 text-sm">
                      <div className="w-8 h-8 rounded-full bg-[#164234] text-[#F4D993] flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                      <span>
                        Pesan dari <strong>{contactEmail}</strong> telah diterima. Tim P2B UIN Salatiga akan segera menghubungi Anda.
                      </span>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="flex flex-col gap-3">
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="email@anda.com"
                        className="w-full px-4 py-3 rounded-2xl bg-white/85 border border-[#C9A45A]/30 text-sm text-[#164234] placeholder:text-[#3E544B]/50 focus:outline-none focus:border-[#164234]"
                      />
                      <textarea
                        rows={3}
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="Tulis kebutuhan layanan atau proposal kemitraan Anda..."
                        className="w-full px-4 py-3 rounded-2xl bg-white/85 border border-[#C9A45A]/30 text-sm text-[#164234] placeholder:text-[#3E544B]/50 focus:outline-none focus:border-[#164234] resize-none"
                      />
                      <button
                        type="submit"
                        className="w-full py-3 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] border border-[#C9A45A]/40 text-sm font-normal transition-colors cursor-pointer"
                      >
                        Kirim Pesan
                      </button>
                    </form>
                  )}
                </div>
              )}

              {activeModal === 'section' && (
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                    P2B UIN Salatiga
                  </span>
                  <h2 className="text-2xl font-normal tracking-tight mt-1 mb-2">
                    {activeSectionDetail ? activeSectionDetail.title : selectedSection}
                  </h2>
                  <p className="text-sm text-[#3E544B] leading-relaxed mb-4">
                    {activeSectionDetail
                      ? activeSectionDetail.summary
                      : `Layanan ${selectedSection.replace('Layanan · ', '')} dikelola oleh Pusat Pengembangan Bisnis (P2B) UIN Salatiga dengan standar tata kelola PTN BLU yang transparan, profesional, dan berorientasi pada kepuasan pengguna.`}
                  </p>

                  {activeSectionDetail && (
                    <ul className="flex flex-col gap-2 mb-5">
                      {activeSectionDetail.points.map((pt) => (
                        <li
                          key={pt}
                          className="text-xs sm:text-sm text-[#164234] px-3.5 py-2.5 rounded-2xl bg-white/80 border border-[#C9A45A]/25"
                        >
                          {pt}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveModal('contact')}
                      className="px-5 py-2.5 rounded-full bg-[rgba(22,66,52,0.08)] hover:bg-[rgba(22,66,52,0.14)] text-[#164234] text-sm font-normal transition-colors cursor-pointer"
                    >
                      Hubungi Tim P2B
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="px-6 py-2.5 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] border border-[#C9A45A]/40 text-sm font-normal transition-colors cursor-pointer"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
