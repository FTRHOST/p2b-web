import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, ChevronRight, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type NavPageTarget =
  | 'home'
  | 'about'
  | 'visi-misi'
  | 'struktur-organisasi'
  | 'all-news';

interface NavDropdownItem {
  title: string;
  subtitle: string;
  page?: NavPageTarget;
}

interface NavItem {
  label: string;
  hasDropdown?: boolean;
  dropdownItems?: NavDropdownItem[];
}

const navItems: NavItem[] = [
  { label: 'Beranda' },
  {
    label: 'Profil',
    hasDropdown: true,
    dropdownItems: [
      { title: 'Tentang', subtitle: 'Mengenal unit usaha & layanan kami', page: 'about' },
      { title: 'Visi Misi', subtitle: 'Arah strategis dan komitmen layanan', page: 'visi-misi' },
      {
        title: 'Struktur Organisasi',
        subtitle: 'Susunan pengurus dan manajemen unit',
        page: 'struktur-organisasi',
      },
    ],
  },
  {
    label: 'Layanan',
    hasDropdown: true,
    dropdownItems: [
      { title: 'Air Mineral', subtitle: 'Produksi dan distribusi air minum' },
      { title: 'Gedung Auditorium', subtitle: 'Sewa ruang acara dan konferensi' },
      { title: 'Pelayanan Sewa Aset', subtitle: 'Pengelolaan dan penyewaan fasilitas' },
      { title: 'Klinik UIN SAGA', subtitle: 'Layanan kesehatan civitas dan umum' },
      { title: 'Kantin', subtitle: 'Area kuliner higienis dan terjangkau' },
      { title: 'Tiket', subtitle: 'Pemesanan tiket acara dan layanan' },
    ],
  },
];

const LOGO_URL = 'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/Logo.webp';

interface NavbarProps {
  currentPage: NavPageTarget;
  onNavigatePage: (page: NavPageTarget) => void;
}

export function Navbar({ currentPage, onNavigatePage }: NavbarProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  const [activeModal, setActiveModal] = useState<'contact' | 'service' | null>(null);
  const [selectedService, setSelectedService] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  useEffect(() => {
    setHeaderVisible(true);
    setScrolled(window.scrollY > 24);
    lastScrollYRef.current = Math.max(window.scrollY, 0);
  }, [currentPage]);

  useEffect(() => {
    const onScroll = () => {
      const currentY = Math.max(window.scrollY, 0);
      const delta = currentY - lastScrollYRef.current;

      setScrolled(currentY > 24);

      if (currentY <= 24) {
        setHeaderVisible(true);
      } else if (delta > 8 && currentY > 120) {
        setHeaderVisible(false);
        setOpenDropdown(null);
        setMobileMenuOpen(false);
      } else if (delta < -4) {
        setHeaderVisible(true);
      }

      lastScrollYRef.current = currentY;
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isProfileActive =
    currentPage === 'about' ||
    currentPage === 'visi-misi' ||
    currentPage === 'struktur-organisasi';

  const handleOpenContact = () => {
    setContactSubmitted(false);
    setContactEmail('');
    setContactMessage('');
    setActiveModal('contact');
  };

  const handleSelectDropdownItem = (itemLabel: string, sub: NavDropdownItem) => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
    if (sub.page) {
      onNavigatePage(sub.page);
      return;
    }
    setSelectedService(`${itemLabel} · ${sub.title}`);
    setActiveModal('service');
  };

  const handleDirectBeranda = () => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
    if (currentPage === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onNavigatePage('home');
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail.trim()) return;
    setContactSubmitted(true);
  };

  return (
    <>
      <header className="fixed top-3 md:top-5 left-0 right-0 z-40 px-3 md:px-5 flex justify-center pointer-events-none">
        <motion.nav
          initial={{ opacity: 0, y: -12 }}
          animate={headerVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: -110 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          aria-label="Navigasi utama P2B UIN Salatiga"
          className={`w-full max-w-[1536px] flex items-center justify-between transition-[background-color,border-color,box-shadow,padding,border-radius] duration-300 relative ${
            headerVisible ? 'pointer-events-auto' : 'pointer-events-none'
          } ${
            scrolled
              ? 'rounded-[1.25rem] md:rounded-[2rem] px-4 sm:px-6 md:px-8 py-2.5 md:py-3 bg-[#0B261D]/90 backdrop-blur-xl border border-[#C9A45A]/35 shadow-[0_12px_36px_rgba(10,36,27,0.22)]'
              : 'rounded-[1.5rem] md:rounded-[3rem] px-5 md:px-10 py-5 md:py-6 bg-transparent border border-transparent shadow-none'
          }`}
        >
          {/* Desktop Left: Unboxed Logo with high contrast on dark emerald glass */}
          <div className="flex-1 hidden md:flex items-center">
            <button
              type="button"
              onClick={handleDirectBeranda}
              aria-label="Beranda P2B UIN Salatiga"
              className="inline-flex items-center bg-transparent border-0 p-0 cursor-pointer shrink-0 hover:opacity-90 transition-opacity"
            >
              {!logoFailed ? (
                <img
                  src={LOGO_URL}
                  alt="Logo Pusat Pengembangan Bisnis UIN Salatiga"
                  referrerPolicy="no-referrer"
                  onError={() => setLogoFailed(true)}
                  className="h-9 lg:h-10 w-auto object-contain"
                />
              ) : (
                <span className="text-base font-normal tracking-tight text-[#FAF8F3] whitespace-nowrap">
                  P2B UIN Salatiga
                </span>
              )}
            </button>
          </div>

          {/* Desktop Center Navigation */}
          <ul className="hidden md:flex items-center gap-8 text-[#FAF8F3] font-normal text-sm">
            {navItems.map((item) => {
              const isActive =
                (item.label === 'Beranda' && currentPage === 'home') ||
                (item.label === 'Profil' && isProfileActive);

              return (
                <li
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.hasDropdown && setOpenDropdown(item.label)}
                  onMouseLeave={() => item.hasDropdown && setOpenDropdown(null)}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (item.hasDropdown) {
                        setOpenDropdown((prev) => (prev === item.label ? null : item.label));
                      } else {
                        handleDirectBeranda();
                      }
                    }}
                    className={`cursor-pointer hover:text-[#F4D993] transition-colors flex items-center gap-1 group whitespace-nowrap shrink-0 bg-transparent border-0 p-0 font-normal ${
                      isActive ? 'text-[#F4D993]' : 'text-[#FAF8F3]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.hasDropdown && (
                      <ChevronRight
                        className={`w-4 h-4 text-[#F4D993] transition-transform ${
                          openDropdown === item.label
                            ? 'rotate-90'
                            : 'group-hover:translate-x-0.5'
                        }`}
                      />
                    )}
                  </button>

                  <AnimatePresence>
                    {item.hasDropdown && openDropdown === item.label && item.dropdownItems && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.18 }}
                        className="absolute left-0 top-full pt-3 z-30"
                      >
                        <div className="w-72 rounded-2xl bg-white/92 backdrop-blur-xl border border-[#C9A45A]/30 p-2 shadow-lg flex flex-col gap-1">
                          {item.dropdownItems.map((sub) => {
                            const subActive = sub.page && currentPage === sub.page;
                            return (
                              <button
                                key={sub.title}
                                type="button"
                                onClick={() => handleSelectDropdownItem(item.label, sub)}
                                className={`text-left px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                                  subActive ? 'bg-[#F6F3EC]' : 'hover:bg-[#F6F3EC]'
                                }`}
                              >
                                <div className="text-xs font-normal text-[#164234] flex items-center justify-between">
                                  <span>{sub.title}</span>
                                  {subActive && (
                                    <span className="text-[10px] text-[#8F6D26]">Aktif</span>
                                  )}
                                </div>
                                <div className="text-[11px] font-normal text-[#3E544B]/75 mt-0.5">
                                  {sub.subtitle}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>

          {/* Mobile Left: Menu Toggle + Unboxed Logo */}
          <div className="md:hidden flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md border border-[#F4D993]/40 flex items-center justify-center text-[#FAF8F3] cursor-pointer shrink-0"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={handleDirectBeranda}
              aria-label="Beranda P2B UIN Salatiga"
              className="inline-flex items-center bg-transparent border-0 p-0 cursor-pointer shrink-0"
            >
              {!logoFailed ? (
                <img
                  src={LOGO_URL}
                  alt="Logo P2B UIN Salatiga"
                  referrerPolicy="no-referrer"
                  onError={() => setLogoFailed(true)}
                  className="h-7 w-auto object-contain"
                />
              ) : (
                <span className="font-normal tracking-tight text-base text-[#FAF8F3] whitespace-nowrap">
                  P2B UIN Salatiga
                </span>
              )}
            </button>
          </div>

          {/* Right: Kontak Pill (with circular arrow kept as requested) */}
          <div className="flex-1 flex justify-end">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleOpenContact}
              className="flex items-center bg-[#FAF8F3]/95 text-[#164234] rounded-full pl-2 pr-4 md:pr-6 py-1.5 md:py-2 gap-2 md:gap-3 border border-[#F4D993]/60 hover:bg-white transition-colors group cursor-pointer whitespace-nowrap shrink-0 shadow-sm"
            >
              <div className="bg-[#164234] p-1 md:p-1.5 rounded-full flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 text-[#F4D993]" />
              </div>
              <span className="text-xs md:text-sm font-normal">Kontak</span>
            </motion.button>
          </div>

          {/* Mobile Dropdown Navigation */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="md:hidden absolute top-full left-0 right-0 mt-2 rounded-2xl bg-white/95 backdrop-blur-xl border border-[#C9A45A]/30 p-4 shadow-lg z-30 flex flex-col gap-3"
              >
                {navItems.map((item) => (
                  <div key={item.label} className="flex flex-col gap-1.5">
                    {item.hasDropdown && item.dropdownItems ? (
                      <>
                        <span className="text-xs uppercase tracking-wider text-[#8F6D26] px-2">
                          {item.label}
                        </span>
                        <div className="flex flex-col gap-1 pl-2">
                          {item.dropdownItems.map((sub) => (
                            <button
                              key={sub.title}
                              type="button"
                              onClick={() => handleSelectDropdownItem(item.label, sub)}
                              className="text-left text-sm text-[#164234] py-1.5 px-2 rounded-lg hover:bg-[#F6F3EC] transition-colors cursor-pointer"
                            >
                              {sub.title}
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={handleDirectBeranda}
                        className="text-left text-sm text-[#164234] py-1.5 px-2 rounded-lg hover:bg-[#F6F3EC] transition-colors cursor-pointer"
                      >
                        {item.label}
                      </button>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      </header>

      {/* Global Header Modals (Kontak & Layanan Preview) */}
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

              {activeModal === 'service' && (
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                    Layanan P2B UIN Salatiga
                  </span>
                  <h2 className="text-2xl font-normal tracking-tight mt-1 mb-2">
                    {selectedService.replace('Layanan · ', '')}
                  </h2>
                  <p className="text-sm text-[#3E544B] leading-relaxed mb-6">
                    Layanan {selectedService.replace('Layanan · ', '')} dikelola oleh Pusat Pengembangan Bisnis (P2B) UIN Salatiga dengan standar tata kelola PTN BLU yang transparan, profesional, dan berorientasi pada kepuasan pengguna.
                  </p>

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
    </>
  );
}
