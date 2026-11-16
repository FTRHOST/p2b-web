import { useState } from 'react';
import { ArrowUpRight, ChevronRight, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavDropdownItem {
  title: string;
  subtitle: string;
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
      { title: 'Tentang', subtitle: 'Mengenal unit usaha & layanan kami' },
      { title: 'Visi Misi', subtitle: 'Arah strategis dan komitmen layanan' },
      { title: 'Struktur Organisasi', subtitle: 'Susunan pengurus dan manajemen unit' },
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
  onContact?: () => void;
  onSelectSection?: (label: string) => void;
}

export function Navbar({ onContact, onSelectSection }: NavbarProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const handleDirectClick = (label: string) => {
    if (label === 'Beranda') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    onSelectSection?.(label);
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center justify-between py-5 md:py-6 px-5 md:px-10 w-full relative z-20"
    >
      <div className="flex-1 hidden md:flex items-center">
        <button
          type="button"
          onClick={() => handleDirectClick('Beranda')}
          aria-label="Beranda P2B UIN Salatiga"
          className="inline-flex items-center bg-transparent border-0 p-0 cursor-pointer shrink-0 hover:opacity-90 transition-opacity"
        >
          {!logoFailed ? (
            <img
              src={LOGO_URL}
              alt="Logo Pusat Pengembangan Bisnis UIN Salatiga"
              referrerPolicy="no-referrer"
              onError={() => setLogoFailed(true)}
              className="h-9 lg:h-11 w-auto object-contain"
            />
          ) : (
            <span className="text-base font-normal tracking-tight text-[#FAF8F3] whitespace-nowrap">
              P2B UIN Salatiga
            </span>
          )}
        </button>
      </div>

      <ul className="hidden md:flex items-center gap-8 text-[#FAF8F3] font-normal text-sm">
        {navItems.map((item) => (
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
                  handleDirectClick(item.label);
                }
              }}
              className="cursor-pointer hover:text-[#F4D993] transition-colors flex items-center gap-1 group whitespace-nowrap shrink-0 bg-transparent border-0 p-0 text-inherit font-normal"
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
                  <div className="w-68 rounded-2xl bg-white/88 backdrop-blur-xl border border-[#C9A45A]/30 p-2 shadow-sm flex flex-col gap-1">
                    {item.dropdownItems.map((sub) => (
                      <button
                        key={sub.title}
                        type="button"
                        onClick={() => {
                          setOpenDropdown(null);
                          onSelectSection?.(`${item.label} · ${sub.title}`);
                        }}
                        className="text-left px-3 py-2 rounded-xl hover:bg-[#F6F3EC] transition-colors cursor-pointer"
                      >
                        <div className="text-xs font-normal text-[#164234]">
                          {sub.title}
                        </div>
                        <div className="text-[11px] font-normal text-[#3E544B]/75 mt-0.5">
                          {sub.subtitle}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        ))}
      </ul>

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
          onClick={() => handleDirectClick('Beranda')}
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

      <div className="flex-1 flex justify-end">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onContact}
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
            className="md:hidden absolute top-full left-4 right-4 mt-1 rounded-2xl bg-white/92 backdrop-blur-xl border border-[#C9A45A]/30 p-4 shadow-md z-30 flex flex-col gap-3"
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
                          onClick={() => {
                            setMobileMenuOpen(false);
                            onSelectSection?.(`${item.label} · ${sub.title}`);
                          }}
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
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleDirectClick(item.label);
                    }}
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
  );
}
