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

interface NavbarProps {
  onContact?: () => void;
  onSelectSection?: (label: string) => void;
}

export function Navbar({ onContact, onSelectSection }: NavbarProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleDirectClick = (label: string) => {
    if (label === 'Beranda') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    onSelectSection?.(label);
  };

  return (
    <nav className="flex items-center justify-between py-6 px-6 md:px-10 w-full relative z-20">
      <div className="flex-1 hidden md:block" />

      <ul className="hidden md:flex items-center gap-8 text-[rgb(45,45,45)] font-normal text-sm">
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
              className="cursor-pointer hover:opacity-70 transition-opacity flex items-center gap-1 group whitespace-nowrap shrink-0 bg-transparent border-0 p-0 text-inherit font-normal"
            >
              <span>{item.label}</span>
              {item.hasDropdown && (
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
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
                  <div className="w-68 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/50 p-2 shadow-sm flex flex-col gap-1">
                    {item.dropdownItems.map((sub) => (
                      <button
                        key={sub.title}
                        type="button"
                        onClick={() => {
                          setOpenDropdown(null);
                          onSelectSection?.(`${item.label} · ${sub.title}`);
                        }}
                        className="text-left px-3 py-2 rounded-xl hover:bg-white/80 transition-colors cursor-pointer"
                      >
                        <div className="text-xs font-normal text-[rgba(30,50,90,0.95)]">
                          {sub.title}
                        </div>
                        <div className="text-[11px] font-normal text-[rgba(30,50,90,0.6)] mt-0.5">
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

      <div className="md:hidden flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          className="w-9 h-9 rounded-full bg-white/60 backdrop-blur-md border border-white/40 flex items-center justify-center text-[rgba(30,50,90,0.9)] cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
        <span className="font-regular tracking-tighter text-xl text-[rgba(30,50,90,0.9)]">
          RIVR
        </span>
      </div>

      <div className="flex-1 flex justify-end">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onContact}
          className="flex items-center bg-[rgba(30,50,90,0.8)] text-white rounded-full pl-2 pr-4 md:pr-6 py-1.5 md:py-2 gap-2 md:gap-3 hover:bg-[rgba(30,50,90,1)] transition-colors group cursor-pointer whitespace-nowrap shrink-0"
        >
          <div className="bg-white/20 p-1 md:p-1.5 rounded-full flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 text-white" />
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
            className="md:hidden absolute top-full left-4 right-4 mt-1 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/60 p-4 shadow-md z-30 flex flex-col gap-3"
          >
            {navItems.map((item) => (
              <div key={item.label} className="flex flex-col gap-1.5">
                {item.hasDropdown && item.dropdownItems ? (
                  <>
                    <span className="text-xs uppercase tracking-wider text-[rgba(30,50,90,0.55)] px-2">
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
                          className="text-left text-sm text-[rgba(30,50,90,0.9)] py-1.5 px-2 rounded-lg hover:bg-white/70 transition-colors cursor-pointer"
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
                    className="text-left text-sm text-[rgba(30,50,90,0.95)] py-1.5 px-2 rounded-lg hover:bg-white/70 transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
