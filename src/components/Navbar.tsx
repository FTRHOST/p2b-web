import { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'motion/react';
import { defaultNavItems } from '../data/defaultNav';
import { CmsNavItem, SiteSettings } from '../types/cms';
import { CardCornerPattern } from './CardCornerPattern';

export type NavPageTarget =
  | 'home'
  | 'about'
  | 'visi-misi'
  | 'struktur-organisasi'
  | 'kerjasama'
  | 'tarif-layanan'
  | 'magang'
  | 'magang-register'
  | 'all-news'
  | 'news-detail'
  | 'not-found';

const DEFAULT_LOGO_URL =
  'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/Logo.webp';

interface NavbarProps {
  currentPage: NavPageTarget;
  currentPath: string;
  navItems?: CmsNavItem[];
  settings?: SiteSettings;
  onNavigatePage: (page: NavPageTarget) => void;
  onNavigateTarget: (target: string) => void;
}

function normalizeTargetPath(raw: string): string {
  const cleaned = raw.trim().replace(/\/+$/, '');
  return cleaned || '/';
}

export function Navbar({
  currentPage,
  currentPath,
  navItems = defaultNavItems,
  settings,
  onNavigatePage,
  onNavigateTarget,
}: NavbarProps) {
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedId, setMobileExpandedId] = useState<number | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  const [activeModal, setActiveModal] = useState<'contact' | null>(null);

  const resolvedLogoUrl = settings?.header_logo_url?.trim() || DEFAULT_LOGO_URL;
  const resolvedBrandText = settings?.header_brand_text?.trim() || 'P2B UIN Salatiga';
  const resolvedLogoTarget = settings?.header_logo_target?.trim() || '/';
  const resolvedCtaLabel = settings?.header_cta_label?.trim() || 'Kontak';
  const resolvedCtaAction = settings?.header_cta_action?.trim() || 'modal_contact';
  const resolvedCtaTarget = settings?.header_cta_target?.trim() || '';
  const resolvedPhone = settings?.contact_phone?.trim() || '0811-2520-4371';
  const resolvedPhoneHref = `tel:${resolvedPhone.replace(/[^0-9+]/g, '').replace(/^0/, '+62')}`;
  const resolvedWhatsapp = settings?.contact_whatsapp?.trim() || '0811-2520-4371';
  const whatsappDigits = resolvedWhatsapp.replace(/[^0-9]/g, '');
  const resolvedWhatsappIntl = whatsappDigits.startsWith('0')
    ? `62${whatsappDigits.slice(1)}`
    : whatsappDigits.startsWith('62')
      ? whatsappDigits
      : `62${whatsappDigits}`;
  const resolvedWhatsappHref = `https://wa.me/${resolvedWhatsappIntl}`;
  const resolvedEmail = settings?.contact_email?.trim() || 'p2b@uinsalatiga.ac.id';
  const resolvedAddress =
    settings?.location_address?.trim() ||
    'P2B UIN Salatiga, Gedung Auditorium & Student Center Prof. Dr. H. Achmadi, Jl. Lingkar Selatan Km. 02, Pulutan, Sidorejo, Kota Salatiga, Jawa Tengah 50716.';

  useEffect(() => {
    setLogoFailed(false);
  }, [resolvedLogoUrl]);

  useEffect(() => {
    setHeaderVisible(true);
    setScrolled(window.scrollY > 24);
    lastScrollYRef.current = Math.max(window.scrollY, 0);
  }, [currentPage, currentPath]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      setMobileExpandedId(null);
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    const onScroll = () => {
      const currentY = Math.max(window.scrollY, 0);
      const delta = currentY - lastScrollYRef.current;

      setScrolled(currentY > 24);

      if (currentY <= 24) {
        setHeaderVisible(true);
      } else if (delta > 8 && currentY > 120) {
        setHeaderVisible(false);
        setOpenDropdownId(null);
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

  const sourceNav = navItems.length > 0 ? navItems : defaultNavItems;
  const activeNav = sourceNav.filter((item) => item.isActive !== false);
  const topLevelItems = activeNav
    .filter((item) => item.parentId === null)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);

  const getChildrenFor = (parentId: number) =>
    activeNav
      .filter((item) => item.parentId === parentId)
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);

  const isTargetCurrent = (item: CmsNavItem): boolean => {
    if (item.actionType !== 'page' && item.actionType !== 'url') return false;
    if (!item.target.trim().startsWith('/')) return false;
    const normalized = normalizeTargetPath(item.target);
    const currentNormalized = normalizeTargetPath(currentPath);
    if (normalized === '/' && item.parentId !== null) return false;
    if (normalized === '/magang' && currentNormalized === '/magang/daftar') {
      return true;
    }
    if (
      normalized === '/tarif-layanan/penunjang-akademik' &&
      currentNormalized === '/tarif-layanan'
    ) {
      return true;
    }
    return normalized === currentNormalized;
  };

  const handleOpenContact = () => {
    setActiveModal('contact');
  };

  const executeNavAction = (item: CmsNavItem) => {
    setOpenDropdownId(null);
    setMobileMenuOpen(false);

    if (item.actionType === 'modal_contact') {
      handleOpenContact();
      return;
    }

    if (item.actionType === 'modal_service') {
      onNavigateTarget('/');
      return;
    }

    const rawTarget = item.target.trim();
    if (!rawTarget) {
      onNavigatePage('home');
      return;
    }

    onNavigateTarget(rawTarget);
  };

  const handleDirectLogo = () => {
    setOpenDropdownId(null);
    setMobileMenuOpen(false);
    const target = resolvedLogoTarget || '/';
    if (target === '/' && currentPage === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    onNavigateTarget(target);
  };

  const renderExternalLinkOrButton = (
    item: CmsNavItem,
    className: string,
    children: React.ReactNode
  ) => {
    const isExternalNewTab =
      item.openNewTab && /^(https?:\/\/|mailto:|tel:)/i.test(item.target.trim());

    if (isExternalNewTab) {
      return (
        <a
          href={item.target.trim()}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            setOpenDropdownId(null);
            setMobileMenuOpen(false);
          }}
          className={className}
        >
          {children}
        </a>
      );
    }

    return (
      <button
        type="button"
        onClick={() => executeNavAction(item)}
        className={className}
      >
        {children}
      </button>
    );
  };

  const ctaIsExternal =
    resolvedCtaAction === 'url' &&
    /^(https?:\/\/|mailto:|tel:)/i.test(resolvedCtaTarget);

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
          {/* Desktop Left: Unboxed Logo */}
          <div className="flex-1 hidden md:flex items-center">
            <button
              type="button"
              onClick={handleDirectLogo}
              aria-label={resolvedBrandText}
              className="inline-flex items-center bg-transparent border-0 p-0 cursor-pointer shrink-0 hover:opacity-90 transition-opacity"
            >
              {!logoFailed && resolvedLogoUrl ? (
                <img
                  src={resolvedLogoUrl}
                  alt={resolvedBrandText}
                  referrerPolicy="no-referrer"
                  onError={() => setLogoFailed(true)}
                  className="h-9 lg:h-10 w-auto object-contain"
                />
              ) : (
                <span className="text-base font-normal tracking-tight text-[#FAF8F3] whitespace-nowrap">
                  {resolvedBrandText}
                </span>
              )}
            </button>
          </div>

          {/* Desktop Center Dynamic Navigation */}
          <ul className="hidden md:flex items-center gap-4 lg:gap-6 xl:gap-8 text-[#FAF8F3] font-normal text-xs lg:text-sm">
            {topLevelItems.map((item) => {
              const children = getChildrenFor(item.id);
              const hasDropdown =
                item.actionType === 'dropdown' || children.length > 0;
              const isActive =
                isTargetCurrent(item) ||
                children.some((child) => isTargetCurrent(child));

              return (
                <li
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => hasDropdown && setOpenDropdownId(item.id)}
                  onMouseLeave={() => hasDropdown && setOpenDropdownId(null)}
                >
                  {hasDropdown ? (
                    <button
                      type="button"
                      aria-expanded={openDropdownId === item.id}
                      aria-haspopup="true"
                      onClick={() => {
                        if (
                          item.target.trim() &&
                          (item.actionType !== 'dropdown' ||
                            openDropdownId === item.id)
                        ) {
                          executeNavAction(item);
                        } else {
                          setOpenDropdownId((prev) =>
                            prev === item.id ? null : item.id
                          );
                        }
                      }}
                      className={`cursor-pointer hover:text-[#F4D993] transition-colors flex items-center gap-1 group whitespace-nowrap shrink-0 bg-transparent border-0 p-0 font-normal ${
                        isActive ? 'text-[#F4D993]' : 'text-[#FAF8F3]'
                      }`}
                    >
                      <span>{item.label}</span>
                      <Icon
                        icon="mdi:chevron-right"
                        className={`w-4 h-4 text-[#F4D993] transition-transform ${
                          openDropdownId === item.id
                            ? 'rotate-90'
                            : 'group-hover:translate-x-0.5'
                        }`}
                      />
                    </button>
                  ) : (
                    renderExternalLinkOrButton(
                      item,
                      `cursor-pointer hover:text-[#F4D993] transition-colors flex items-center gap-1 group whitespace-nowrap shrink-0 bg-transparent border-0 p-0 font-normal ${
                        isActive ? 'text-[#F4D993]' : 'text-[#FAF8F3]'
                      }`,
                      <span>{item.label}</span>
                    )
                  )}

                  <AnimatePresence>
                    {hasDropdown && openDropdownId === item.id && children.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.18 }}
                        className="absolute left-0 top-full pt-3 z-30"
                      >
                        <div className="w-72 rounded-2xl bg-white/92 backdrop-blur-xl border border-[#C9A45A]/30 p-2 shadow-lg flex flex-col gap-1">
                          {children.map((sub) => {
                            const subActive = isTargetCurrent(sub);
                            return (
                              <div key={sub.id}>
                                {renderExternalLinkOrButton(
                                  sub,
                                  `w-full block text-left px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                                    subActive ? 'bg-[#F6F3EC]' : 'hover:bg-[#F6F3EC]'
                                  }`,
                                  <>
                                    <div className="text-xs font-normal text-[#164234] flex items-center justify-between">
                                      <span>{sub.label}</span>
                                      {subActive && (
                                        <span className="text-[10px] text-[#8F6D26]">
                                          Aktif
                                        </span>
                                      )}
                                    </div>
                                    {sub.subtitle && (
                                      <div className="text-[11px] font-normal text-[#3E544B]/75 mt-0.5">
                                        {sub.subtitle}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
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
              {mobileMenuOpen ? (
                <Icon icon="mdi:close" className="w-4 h-4" />
              ) : (
                <Icon icon="mdi:menu" className="w-4 h-4" />
              )}
            </button>
            <button
              type="button"
              onClick={handleDirectLogo}
              aria-label={resolvedBrandText}
              className="inline-flex items-center bg-transparent border-0 p-0 cursor-pointer shrink-0"
            >
              {!logoFailed && resolvedLogoUrl ? (
                <img
                  src={resolvedLogoUrl}
                  alt={resolvedBrandText}
                  referrerPolicy="no-referrer"
                  onError={() => setLogoFailed(true)}
                  className="h-7 w-auto object-contain"
                />
              ) : (
                <span className="font-normal tracking-tight text-base text-[#FAF8F3] whitespace-nowrap">
                  {resolvedBrandText}
                </span>
              )}
            </button>
          </div>

          {/* Right: Dynamic CTA Pill */}
          <div className="flex-1 flex justify-end">
            {ctaIsExternal ? (
              <motion.a
                href={resolvedCtaTarget}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center bg-[#FAF8F3]/95 text-[#164234] rounded-full pl-2 pr-4 md:pr-6 py-1.5 md:py-2 gap-2 md:gap-3 border border-[#F4D993]/60 hover:bg-white transition-colors group cursor-pointer whitespace-nowrap shrink-0 shadow-sm"
              >
                <div className="bg-[#164234] p-1 md:p-1.5 rounded-full flex items-center justify-center">
                  <Icon icon="mdi:arrow-top-right" className="w-4 h-4 md:w-5 md:h-5 text-[#F4D993]" />
                </div>
                <span className="text-xs md:text-sm font-normal">{resolvedCtaLabel}</span>
              </motion.a>
            ) : (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (resolvedCtaAction === 'url' && resolvedCtaTarget) {
                    onNavigateTarget(resolvedCtaTarget);
                  } else {
                    handleOpenContact();
                  }
                }}
                className="flex items-center bg-[#FAF8F3]/95 text-[#164234] rounded-full pl-2 pr-4 md:pr-6 py-1.5 md:py-2 gap-2 md:gap-3 border border-[#F4D993]/60 hover:bg-white transition-colors group cursor-pointer whitespace-nowrap shrink-0 shadow-sm"
              >
                <div className="bg-[#164234] p-1 md:p-1.5 rounded-full flex items-center justify-center">
                  <Icon icon="mdi:arrow-top-right" className="w-4 h-4 md:w-5 md:h-5 text-[#F4D993]" />
                </div>
                <span className="text-xs md:text-sm font-normal">{resolvedCtaLabel}</span>
              </motion.button>
            )}
          </div>

          {/* Mobile Dropdown Navigation */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="md:hidden absolute top-full left-0 right-0 mt-2 max-h-[calc(100dvh-5.5rem)] overflow-y-auto overscroll-contain rounded-2xl bg-white/95 backdrop-blur-xl border border-[#C9A45A]/30 p-3 sm:p-4 shadow-lg z-30 flex flex-col gap-1"
              >
                {topLevelItems.map((item) => {
                  const children = getChildrenFor(item.id);
                  const hasDropdown =
                    item.actionType === 'dropdown' || children.length > 0;
                  const isExpanded = mobileExpandedId === item.id;
                  const isActive =
                    isTargetCurrent(item) ||
                    children.some((child) => isTargetCurrent(child));

                  return (
                    <div key={item.id} className="flex flex-col">
                      {hasDropdown && children.length > 0 ? (
                        <>
                          <button
                            type="button"
                            aria-expanded={isExpanded}
                            onClick={() =>
                              setMobileExpandedId((prev) =>
                                prev === item.id ? null : item.id
                              )
                            }
                            className={`w-full flex items-center justify-between gap-2 text-left text-sm font-normal py-2.5 px-3 rounded-xl transition-colors cursor-pointer ${
                              isExpanded || isActive
                                ? 'bg-[#F6F3EC] text-[#164234]'
                                : 'text-[#164234] hover:bg-[#F6F3EC]'
                            }`}
                          >
                            <span className="truncate">{item.label}</span>
                            <Icon
                              icon="mdi:chevron-down"
                              className={`w-4 h-4 text-[#8F6D26] shrink-0 transition-transform duration-200 ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </button>

                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: 'easeOut' }}
                                className="overflow-hidden"
                              >
                                <div className="flex flex-col gap-1 ml-3 pl-2.5 py-1.5 border-l-2 border-[#C9A45A]/35">
                                  {children.map((sub) => {
                                    const subActive = isTargetCurrent(sub);
                                    return (
                                      <div key={sub.id}>
                                        {renderExternalLinkOrButton(
                                          sub,
                                          `w-full block text-left py-2 px-2.5 rounded-xl transition-colors cursor-pointer ${
                                            subActive
                                              ? 'bg-[#F6F3EC]'
                                              : 'hover:bg-[#F6F3EC]'
                                          }`,
                                          <>
                                            <div className="text-[13px] font-normal text-[#164234] flex items-center justify-between gap-2">
                                              <span className="break-words">{sub.label}</span>
                                              {subActive && (
                                                <span className="text-[10px] text-[#8F6D26] shrink-0">
                                                  Aktif
                                                </span>
                                              )}
                                            </div>
                                            {sub.subtitle && (
                                              <div className="text-[11px] font-normal text-[#3E544B]/75 mt-0.5 leading-snug">
                                                {sub.subtitle}
                                              </div>
                                            )}
                                          </>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      ) : (
                        renderExternalLinkOrButton(
                          item,
                          `w-full flex items-center justify-between text-left text-sm font-normal py-2.5 px-3 rounded-xl transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-[#F6F3EC] text-[#164234]'
                              : 'text-[#164234] hover:bg-[#F6F3EC]'
                          }`,
                          <>
                            <span className="truncate">{item.label}</span>
                            {isActive && (
                              <span className="text-[10px] text-[#8F6D26] shrink-0">
                                Aktif
                              </span>
                            )}
                          </>
                        )
                      )}
                    </div>
                  );
                })}
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
              className="group relative overflow-hidden w-full max-w-lg rounded-3xl bg-[#FAF8F3]/95 backdrop-blur-2xl border border-[#C9A45A]/30 p-6 md:p-8 text-[#164234] shadow-lg"
            >
              {activeModal === 'contact' && (
                <CardCornerPattern
                  index={0}
                  position="bottom-right"
                  sizeClassName="w-40 h-40 sm:w-44 sm:h-44"
                  opacityClassName="opacity-[0.16] group-hover:opacity-[0.24]"
                />
              )}

              <button
                type="button"
                onClick={() => setActiveModal(null)}
                aria-label="Tutup modal"
                className="absolute top-5 right-5 z-20 w-8 h-8 rounded-full bg-[rgba(22,66,52,0.08)] hover:bg-[rgba(22,66,52,0.15)] flex items-center justify-center transition-colors cursor-pointer"
              >
                <Icon icon="mdi:close" className="w-4 h-4 text-[#164234]" />
              </button>

              {activeModal === 'contact' && (
                <div className="relative z-10">
                  <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                    {resolvedBrandText}
                  </span>
                  <h2 className="text-2xl font-normal tracking-tight mt-1 mb-2">
                    Hubungi Kami
                  </h2>
                  <p className="text-sm text-[#3E544B] mb-5">
                    Informasi kontak resmi layanan sewa aset, Gedung Auditorium, Klinik Mitra Insani, kemitraan, maupun program magang mahasiswa.
                  </p>

                  {/* Official Institutional Contact Details */}
                  <div className="mb-6 rounded-2xl bg-white/80 border border-[#C9A45A]/25 p-4 flex flex-col gap-3 text-xs sm:text-sm text-[#164234]">
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5">
                      <a
                        href={resolvedPhoneHref}
                        className="inline-flex items-center gap-2 hover:text-[#8F6D26] transition-colors"
                      >
                        <Icon icon="mdi:phone-outline" className="w-4 h-4 text-[#8F6D26] shrink-0" />
                        <span>{resolvedPhone}</span>
                      </a>
                      <a
                        href={resolvedWhatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 hover:text-[#8F6D26] transition-colors"
                      >
                        <Icon icon="mdi:whatsapp" className="w-4 h-4 text-[#8F6D26] shrink-0" />
                        <span>WhatsApp: {resolvedWhatsapp}</span>
                      </a>
                      <a
                        href={`mailto:${resolvedEmail}`}
                        className="inline-flex items-center gap-2 hover:text-[#8F6D26] transition-colors"
                      >
                        <Icon icon="mdi:email-outline" className="w-4 h-4 text-[#8F6D26] shrink-0" />
                        <span>{resolvedEmail}</span>
                      </a>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-[#3E544B] leading-relaxed pt-2.5 border-t border-[#C9A45A]/20">
                      <Icon icon="mdi:map-marker-outline" className="w-4 h-4 text-[#8F6D26] shrink-0 mt-0.5" />
                      <span>{resolvedAddress}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2.5">
                    <a
                      href={resolvedWhatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] border border-[#C9A45A]/40 text-sm font-normal transition-colors"
                    >
                      <Icon icon="mdi:whatsapp" className="w-4 h-4 text-[#F4D993]" />
                      <span>Chat WhatsApp</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="px-6 py-2.5 rounded-full bg-[rgba(22,66,52,0.08)] hover:bg-[rgba(22,66,52,0.14)] text-[#164234] border border-[#C9A45A]/30 text-sm font-normal transition-colors cursor-pointer"
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
