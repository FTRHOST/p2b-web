import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'motion/react';
import { SiteSettings } from '../types/cms';

const DEFAULT_HEADER_LOGO_URL =
  'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/Logo.webp';

interface LegalDoc {
  title: string;
  updated: string;
  summary: string;
  sections: { heading: string; body: string }[];
}

const legalDocs: Record<string, LegalDoc> = {
  'Tata Kelola PTN BLU': {
    title: 'Tata Kelola PTN BLU',
    updated: 'Pembaruan November 2026',
    summary:
      'Pedoman tata kelola Pusat Pengembangan Bisnis (P2B) UIN Salatiga dalam menjalankan pengelolaan aset dan layanan komersial secara transparan dan akuntabel.',
    sections: [
      {
        heading: '1. Prinsip Transparansi & Akuntabilitas',
        body: 'Seluruh pengelolaan unit bisnis, tarif layanan, serta pelaporan keuangan mengacu pada standar tata kelola Badan Layanan Umum (PTN BLU) UIN Salatiga.',
      },
      {
        heading: '2. Orientasi Nilai Tambah',
        body: 'Optimalisasi aset dan unit komersial ditujukan untuk mendukung kemandirian universitas serta memperluas manfaat bagi sivitas akademika dan masyarakat.',
      },
    ],
  },
  'Standar Layanan': {
    title: 'Standar Layanan Komersial',
    updated: 'Pembaruan November 2026',
    summary:
      'Komitmen mutu pelayanan P2B UIN Salatiga pada unit Gedung Auditorium, Sewa Aset, Klinik Mitra Insani, UINSAGA Water, Kantin, dan Tiket.',
    sections: [
      {
        heading: '1. Profesionalitas & Kepuasan Pelanggan',
        body: 'Setiap unit layanan dikelola berbasis kebutuhan pengguna dengan mengutamakan kejelasan prosedur, kenyamanan fasilitas, dan ketepatan waktu.',
      },
      {
        heading: '2. Evaluasi Berkala',
        body: 'P2B melakukan kajian kelayakan dan evaluasi layanan secara rutin untuk menjaga mutu operasional setiap unit bisnis.',
      },
    ],
  },
  'Kebijakan Privasi': {
    title: 'Kebijakan Privasi',
    updated: 'Pembaruan November 2026',
    summary:
      'Penjelasan mengenai perlindungan data pemohon layanan dan mitra kerja sama di lingkungan Pusat Pengembangan Bisnis (P2B) UIN Salatiga.',
    sections: [
      {
        heading: '1. Penggunaan Data Pemohon',
        body: 'Informasi kontak dan korespondensi resmi hanya digunakan untuk koordinasi layanan dan informasi resmi P2B UIN Salatiga.',
      },
      {
        heading: '2. Kerahasiaan Dokumen Kemitraan',
        body: 'Dokumen pengajuan kerja sama dengan industri, pemerintah, alumni, dan masyarakat dijaga kerahasiaannya sesuai ketentuan universitas.',
      },
    ],
  },
  'Panduan Kemitraan': {
    title: 'Panduan Kemitraan & Magang',
    updated: 'Pembaruan November 2026',
    summary:
      'Alur kerja sama strategis serta program magang profesional mahasiswa di lingkungan Pusat Pengembangan Bisnis UIN Salatiga.',
    sections: [
      {
        heading: '1. Kolaborasi Eksternal',
        body: 'P2B terbuka terhadap kerja sama pemanfaatan aset, pengembangan produk, maupun kemitraan komersial yang saling memberi manfaat.',
      },
      {
        heading: '2. Pengembangan Talenta Mahasiswa',
        body: 'Mahasiswa UIN Salatiga dapat terlibat dalam praktik bisnis, magang di bidang IT, komunikasi, pemasaran digital, bisnis, dan akuntansi.',
      },
    ],
  },
};

const serviceItems = [
  {
    label: 'UINSAGA Water',
    description:
      'Layanan Air Mineral dikelola oleh Pusat Pengembangan Bisnis (P2B) UIN Salatiga dengan proses filtrasi terstandar higienis untuk civitas dan mitra.',
  },
  {
    label: 'Gedung Auditorium',
    description:
      'Gedung Auditorium Student Centre UIN Salatiga siap mendukung penyelenggaraan seminar nasional, wisuda, dan konferensi dengan sistem akustik modern.',
  },
  {
    label: 'Pelayanan Sewa Aset',
    description:
      'Optimalisasi penyewaan ruang rapat, studio, dan fasilitas pendukung universitas dengan prosedur transparan sesuai tata kelola PTN BLU.',
  },
  {
    label: 'Klinik Mitra Insani',
    description:
      'Klinik Mitra Insani melayani konsultasi kesehatan, pemeriksaan preventif, serta layanan kesehatan umum bagi mahasiswa, pegawai, dan masyarakat.',
  },
  {
    label: 'Kantin',
    description:
      'Area Kantin kampus P2B menghadirkan beragam kuliner higienis, bersertifikat halal, dan mendukung transaksi nontunai QRIS.',
  },
  {
    label: 'Tiket',
    description:
      'Layanan Tiket terpadu P2B memudahkan pemesanan akses acara kampus, seminar, serta layanan operasional universitas secara tertib.',
  },
];

const navigationLinks: {
  label: string;
  href: string;
  target: 'top' | 'who-we-are' | 'news-updates' | 'lokasi-p2b';
}[] = [
  { label: 'Beranda', href: '#top', target: 'top' },
  { label: 'Tentang P2B', href: '#who-we-are', target: 'who-we-are' },
  { label: 'News & Update', href: '#news-updates', target: 'news-updates' },
  { label: 'Lokasi P2B', href: '#lokasi-p2b', target: 'lokasi-p2b' },
];

const profileLinks = [
  { label: 'Tentang Kami', path: '/tentang-kami' },
  { label: 'Visi & Misi', path: '/visi-misi' },
  { label: 'Struktur Organisasi', path: '/struktur-organisasi' },
  { label: 'Kerjasama', path: '/kerjasama' },
  { label: 'Tarif Layanan', path: '/tarif-layanan' },
  { label: 'Magang di P2B', path: '/magang' },
  { label: 'Semua Berita', path: '/semua-berita' },
];

const marqueePhrases = [
  'P2B UIN Salatiga.',
  'PTN BLU.',
  'UINSAGA Water.',
  'Auditorium.',
  'Klinik Mitra Insani.',
  'Kemitraan.',
];

interface FooterProps {
  settings?: SiteSettings;
  onNavigate?: (target: 'top' | 'who-we-are' | 'news-updates' | 'lokasi-p2b') => void;
}

export function Footer({ settings, onNavigate }: FooterProps) {
  const [activeLegal, setActiveLegal] = useState<LegalDoc | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);

  const resolvedLogoUrl = settings?.header_logo_url?.trim() || DEFAULT_HEADER_LOGO_URL;
  const resolvedBrandTitle = settings?.footer_brand_title?.trim() || 'P2B UIN Salatiga';
  const resolvedDescription =
    settings?.footer_description?.trim() ||
    'Pusat Pengembangan Bisnis Universitas Islam Negeri Salatiga — Mengoptimalkan aset, layanan komersial, kemitraan, dan inovasi bisnis mendukung PTN BLU.';
  const resolvedSocialLabel = settings?.footer_social_label?.trim() || 'Instagram';
  const resolvedSocialUrl =
    settings?.footer_social_url?.trim() || 'https://www.instagram.com/p2b.uinsalatiga';
  const resolvedTiktokUrl =
    settings?.footer_tiktok_url?.trim() || 'https://www.tiktok.com/@p2b.uin.salatiga';
  const resolvedMapsUrl =
    settings?.location_maps_url?.trim() ||
    'https://www.google.com/maps/search/?api=1&query=-7.311415209978375,110.47916197054059';
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

  const navigateSection = (target: 'top' | 'who-we-are' | 'news-updates' | 'lokasi-p2b') => {
    if (onNavigate) {
      onNavigate(target);
      return;
    }
    if (target === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
  };

  const navigateSpaPath = (path: string) => {
    window.history.pushState(null, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-10 md:mt-16 w-full bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:pt-16 md:pb-10">
        {/* Top Section: Navigation Columns & Brand/Socials */}
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between lg:gap-16">
          {/* Navigation Links (4 Columns) */}
          <nav
            aria-label="Navigasi footer"
            className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:flex lg:flex-1 lg:justify-between lg:gap-8"
          >
            {/* Column 1: Layanan P2B */}
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold leading-[36px] text-white">
                Layanan P2B
              </h3>
              <ul className="mt-2 flex flex-col gap-2 text-base font-medium leading-6 text-white/75">
                {serviceItems.map((service) => (
                  <li key={service.label}>
                    <a
                      href="/"
                      onClick={(e) => {
                        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
                          return;
                        }
                        e.preventDefault();
                        navigateSection('top');
                      }}
                      className="hover:text-white transition-colors"
                    >
                      {service.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Profil & Berita */}
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold leading-[36px] text-white">
                Profil & Berita
              </h3>
              <ul className="mt-2 flex flex-col gap-2 text-base font-medium leading-6 text-white/75">
                {profileLinks.map((item) => (
                  <li key={item.path}>
                    <a
                      href={item.path}
                      onClick={(e) => {
                        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
                          return;
                        }
                        e.preventDefault();
                        navigateSpaPath(item.path);
                      }}
                      className="hover:text-white transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Navigasi */}
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold leading-[36px] text-white">
                Navigasi
              </h3>
              <ul className="mt-2 flex flex-col gap-2 text-base font-medium leading-6 text-white/75">
                {navigationLinks.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        navigateSection(item.target);
                      }}
                      className="hover:text-white transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Dokumen Resmi */}
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold leading-[36px] text-white">
                Dokumen Resmi
              </h3>
              <ul className="mt-2 flex flex-col gap-2 text-base font-medium leading-6 text-white/75">
                {Object.keys(legalDocs).map((docKey) => (
                  <li key={docKey}>
                    <button
                      type="button"
                      onClick={() => setActiveLegal(legalDocs[docKey])}
                      className="text-left hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0"
                    >
                      {docKey}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Social Icons & Header Logo */}
          <div className="flex flex-col items-center gap-5 lg:items-end lg:max-w-[330px]">
            <ul className="flex flex-row gap-2">
              {/* Instagram */}
              <li>
                <a
                  title={resolvedSocialLabel}
                  aria-label={`Ikuti P2B UIN Salatiga di ${resolvedSocialLabel}`}
                  className="group block size-14 border-b-[3px] border-neutral-800 p-3 opacity-80 transition-all duration-300 ease-in-out hover:rounded-2xl hover:bg-neutral-800 hover:opacity-100"
                  href={resolvedSocialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="block opacity-65 transition-opacity duration-300 group-hover:opacity-100">
                    <Icon icon="mdi:instagram" className="w-8 h-8 text-white" />
                  </span>
                </a>
              </li>

              {/* TikTok */}
              <li>
                <a
                  title="TikTok"
                  aria-label="Ikuti P2B UIN Salatiga di TikTok"
                  className="group block size-14 border-b-[3px] border-neutral-800 p-3 opacity-80 transition-all duration-300 ease-in-out hover:rounded-2xl hover:bg-neutral-800 hover:opacity-100"
                  href={resolvedTiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="block opacity-65 transition-opacity duration-300 group-hover:opacity-100">
                    <Icon icon="mdi:tiktok" className="w-8 h-8 text-white" />
                  </span>
                </a>
              </li>

              {/* Peta Lokasi Google Maps */}
              <li>
                <a
                  title="Lokasi Kampus P2B UIN Salatiga"
                  aria-label="Buka lokasi P2B UIN Salatiga di Google Maps"
                  className="group block size-14 border-b-[3px] border-neutral-800 p-3 opacity-80 transition-all duration-300 ease-in-out hover:rounded-2xl hover:bg-neutral-800 hover:opacity-100"
                  href={resolvedMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="block opacity-65 transition-opacity duration-300 group-hover:opacity-100">
                    <Icon icon="mdi:map-marker-outline" className="w-8 h-8 text-white" />
                  </span>
                </a>
              </li>

              {/* Portal Berita */}
              <li>
                <a
                  title="Portal Berita P2B"
                  aria-label="Lihat semua berita P2B UIN Salatiga"
                  className="group block size-14 border-b-[3px] border-neutral-800 p-3 opacity-80 transition-all duration-300 ease-in-out hover:rounded-2xl hover:bg-neutral-800 hover:opacity-100"
                  href="/semua-berita"
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
                      return;
                    }
                    e.preventDefault();
                    navigateSpaPath('/semua-berita');
                  }}
                >
                  <span className="block opacity-65 transition-opacity duration-300 group-hover:opacity-100">
                    <Icon icon="mdi:newspaper-variant-outline" className="w-8 h-8 text-white" />
                  </span>
                </a>
              </li>
            </ul>

            {/* Logo dari Header + Deskripsi Instansi */}
            <div className="flex flex-col items-center lg:items-end gap-3">
              <a
                href="/"
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
                    return;
                  }
                  e.preventDefault();
                  navigateSection('top');
                }}
                aria-label={resolvedBrandTitle}
                className="inline-flex items-center hover:opacity-90 transition-opacity"
              >
                {!logoFailed && resolvedLogoUrl ? (
                  <img
                    src={resolvedLogoUrl}
                    alt={resolvedBrandTitle}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                    onError={() => setLogoFailed(true)}
                    className="h-12 md:h-14 w-auto object-contain"
                  />
                ) : (
                  <span className="text-xl font-semibold tracking-tight text-white">
                    {resolvedBrandTitle}
                  </span>
                )}
              </a>
              <p className="text-xs sm:text-sm text-white/65 leading-relaxed text-center lg:text-right">
                {resolvedDescription}
              </p>

              {/* Kontak Resmi & Alamat Kantor P2B */}
              <div className="mt-1 flex flex-col items-center lg:items-end gap-1.5 text-xs text-white/75 text-center lg:text-right">
                <a
                  href={resolvedPhoneHref}
                  className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Icon icon="mdi:phone-outline" className="w-3.5 h-3.5 text-[#eab308] shrink-0" />
                  <span>{resolvedPhone}</span>
                </a>
                <a
                  href={resolvedWhatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Icon icon="mdi:whatsapp" className="w-3.5 h-3.5 text-[#eab308] shrink-0" />
                  <span>WhatsApp · {resolvedWhatsapp}</span>
                </a>
                <a
                  href={`mailto:${resolvedEmail}`}
                  className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Icon icon="mdi:email-outline" className="w-3.5 h-3.5 text-[#eab308] shrink-0" />
                  <span>{resolvedEmail}</span>
                </a>
                <div className="inline-flex items-start justify-center lg:justify-end gap-1.5 text-white/60 leading-relaxed max-w-xs">
                  <Icon icon="mdi:map-marker-outline" className="w-3.5 h-3.5 text-[#eab308] shrink-0 mt-0.5" />
                  <span>{resolvedAddress}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright & Underlined Legal Links */}
        <div className="mt-8 flex flex-col items-center gap-2 text-center md:mt-10 md:flex-row md:justify-center md:gap-2">
          <span className="text-[15px] md:text-[16px] font-normal leading-[150%] text-white/70">
            {settings?.footer_copyright?.trim() ||
              '© 2026 Pusat Pengembangan Bisnis (P2B) UIN Salatiga. Hak cipta dilindungi.'}
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2 text-[15px] md:text-[16px]">
            <button
              type="button"
              onClick={() => setActiveLegal(legalDocs['Tata Kelola PTN BLU'])}
              className="text-white/70 decoration-[#eab308] underline underline-offset-[25%] transition-colors hover:text-white cursor-pointer bg-transparent border-0 p-0"
            >
              Tata Kelola
            </button>
            <span className="text-white/70" aria-hidden="true">
              ·
            </span>
            <button
              type="button"
              onClick={() => setActiveLegal(legalDocs['Kebijakan Privasi'])}
              className="text-white/70 decoration-[#eab308] underline underline-offset-[25%] transition-colors hover:text-white cursor-pointer bg-transparent border-0 p-0"
            >
              Privasi
            </button>
            <span className="text-white/70" aria-hidden="true">
              ·
            </span>
            <button
              type="button"
              onClick={() => setActiveLegal(legalDocs['Standar Layanan'])}
              className="text-white/70 decoration-[#eab308] underline underline-offset-[25%] transition-colors hover:text-white cursor-pointer bg-transparent border-0 p-0"
            >
              Standar Layanan
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Marquee Banner */}
      <div aria-hidden="true">
        <div className="rfm-marquee-container overflow-hidden pb-12 md:pb-16">
          <div className="rfm-overlay" />
          <div className="rfm-marquee">
            <div className="rfm-initial-child-container">
              {marqueePhrases.map((phrase, idx) => (
                <div key={`m1-${idx}`} className="rfm-child">
                  <p className="text-[64px] sm:text-[110px] md:text-[160px] lg:text-[200px] font-semibold leading-[110%] text-[#6b6b6b] whitespace-nowrap m-0">
                    {phrase}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="rfm-marquee">
            {marqueePhrases.map((phrase, idx) => (
              <div key={`m2-${idx}`} className="rfm-child">
                <p className="text-[64px] sm:text-[110px] md:text-[160px] lg:text-[200px] font-semibold leading-[110%] text-[#6b6b6b] whitespace-nowrap m-0">
                  {phrase}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legal Documentation Modal */}
      <AnimatePresence>
        {activeLegal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveLegal(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0E2A21]/45 backdrop-blur-sm"
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
                onClick={() => setActiveLegal(null)}
                aria-label="Tutup dokumen"
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[rgba(22,66,52,0.08)] hover:bg-[rgba(22,66,52,0.15)] flex items-center justify-center transition-colors cursor-pointer"
              >
                <Icon icon="mdi:close" className="w-4 h-4 text-[#164234]" />
              </button>

              <span className="text-xs text-[#8F6D26]">{activeLegal.updated}</span>
              <h3 className="text-2xl font-normal tracking-tight mt-1 mb-2">
                {activeLegal.title}
              </h3>
              <p className="text-sm text-[#3E544B] leading-relaxed mb-5">
                {activeLegal.summary}
              </p>

              <div className="flex flex-col gap-3 mb-6">
                {activeLegal.sections.map((section) => (
                  <div
                    key={section.heading}
                    className="p-4 rounded-2xl bg-white/75 border border-[#C9A45A]/25"
                  >
                    <h4 className="text-sm font-normal text-[#164234] mb-1">
                      {section.heading}
                    </h4>
                    <p className="text-xs text-[#3E544B] leading-relaxed">
                      {section.body}
                    </p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setActiveLegal(null)}
                className="w-full py-2.5 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] border border-[#C9A45A]/40 text-sm font-normal transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}
