import { useState } from 'react';
import { ArrowUpRight, Check, Mail, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
      'Komitmen mutu pelayanan P2B UIN Salatiga pada unit Gedung Auditorium, Sewa Aset, Klinik UIN SAGA, Air Mineral, Kantin, dan Tiket.',
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
      'Penjelasan mengenai perlindungan data pemohon layanan, mitra kerja sama, dan pelanggan buletin informasi P2B UIN Salatiga.',
    sections: [
      {
        heading: '1. Penggunaan Data Pemohon',
        body: 'Informasi kontak yang dikirimkan melalui formulir kontak maupun buletin hanya digunakan untuk koordinasi layanan dan informasi resmi P2B.',
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

const socialLinks = [
  { label: 'Instagram', handle: '@p2b.uinsalatiga', href: '#social-instagram' },
  { label: 'YouTube', handle: 'UIN Salatiga Official', href: '#social-youtube' },
  { label: 'LinkedIn', handle: 'P2B UIN Salatiga', href: '#social-linkedin' },
  { label: 'Portal UIN', handle: 'uinsalatiga.ac.id', href: '#social-portal' },
];

const navigationLinks = [
  { label: 'Beranda', href: '#top' },
  { label: 'Tentang P2B', href: '#who-we-are' },
  { label: 'News & Update', href: '#news-updates' },
  { label: 'Lokasi P2B', href: '#lokasi-p2b' },
];

interface FooterProps {
  onNavigate?: (target: 'top' | 'who-we-are' | 'news-updates' | 'lokasi-p2b') => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [subscribedEmail, setSubscribedEmail] = useState<string | null>(null);
  const [activeLegal, setActiveLegal] = useState<LegalDoc | null>(null);
  const [activeSocial, setActiveSocial] = useState<{ label: string; handle: string } | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

    if (!isValid) {
      setError('Mohon masukkan alamat email yang valid.');
      return;
    }

    setError('');
    setSubscribedEmail(trimmed);
    setEmail('');
  };

  return (
    <footer className="w-full flex justify-center px-3 md:px-5 pb-4 md:pb-6 bg-[#F6F3EC]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-[1536px] rounded-[1.5rem] md:rounded-[3rem] bg-white/60 backdrop-blur-xl border border-[#C9A45A]/30 p-6 sm:p-10 md:p-14 text-[#164234]"
      >
        {/* Upper Footer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 pb-10 border-b border-[#C9A45A]/20">
          {/* Brand + Newsletter Signup */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-2 max-w-md">
              <span className="text-2xl font-normal tracking-tight text-[#164234]">
                P2B UIN Salatiga
              </span>
              <p className="text-sm md:text-base text-[#3E544B] leading-relaxed font-normal">
                Pusat Pengembangan Bisnis Universitas Islam Negeri Salatiga — Mengoptimalkan aset, layanan komersial, kemitraan, dan inovasi bisnis mendukung PTN BLU.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 max-w-md">
              <span className="text-xs font-normal text-[#8F6D26] uppercase tracking-wider">
                Buletin & Pembaruan P2B
              </span>

              {subscribedEmail ? (
                <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white/80 backdrop-blur-md border border-[#C9A45A]/30 text-sm">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-[#164234] text-[#F4D993] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[#164234] truncate">
                      Terdaftar dengan {subscribedEmail}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubscribedEmail(null)}
                    className="text-xs text-[#8F6D26] hover:text-[#164234] underline underline-offset-2 shrink-0 cursor-pointer"
                  >
                    Ubah
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} noValidate className="flex flex-col gap-2">
                  <div className="flex items-center bg-white/80 backdrop-blur-md border border-[#C9A45A]/30 focus-within:border-[#164234] rounded-full p-1.5 pl-4 gap-2 transition-colors">
                    <Mail className="w-4 h-4 text-[#B89242] shrink-0" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="Masukkan email untuk info layanan & berita"
                      aria-label="Alamat email untuk buletin"
                      className="w-full bg-transparent text-sm text-[#164234] placeholder:text-[#3E544B]/50 focus:outline-none min-w-0"
                    />
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] rounded-full px-4 py-2 gap-1.5 border border-[#C9A45A]/40 transition-colors shrink-0 cursor-pointer whitespace-nowrap"
                    >
                      <span className="text-xs md:text-sm font-normal">Langganan</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#F4D993]" />
                    </motion.button>
                  </div>
                  {error && (
                    <span className="text-xs text-[#9b2c2c] pl-4">{error}</span>
                  )}
                </form>
              )}
            </div>
          </div>

          {/* Link Columns */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Navigation */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-normal text-[#8F6D26] uppercase tracking-wider">
                Navigasi
              </span>
              <ul className="flex flex-col gap-2.5 text-sm">
                {navigationLinks.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        const target = item.href.slice(1) as
                          | 'top'
                          | 'who-we-are'
                          | 'news-updates'
                          | 'lokasi-p2b';
                        if (onNavigate) {
                          onNavigate(target);
                          return;
                        }
                        if (target === 'top') {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        } else {
                          document
                            .getElementById(target)
                            ?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="text-[#3E544B] hover:text-[#164234] transition-colors whitespace-nowrap"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social Media */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-normal text-[#8F6D26] uppercase tracking-wider">
                Media Sosial
              </span>
              <ul className="flex flex-col gap-2.5 text-sm">
                {socialLinks.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveSocial({ label: item.label, handle: item.handle });
                      }}
                      className="inline-flex items-center gap-1 text-[#3E544B] hover:text-[#164234] transition-colors group whitespace-nowrap"
                    >
                      <span>{item.label}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#B89242] opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal & Governance */}
            <div className="flex flex-col gap-3 col-span-2 sm:col-span-1">
              <span className="text-xs font-normal text-[#8F6D26] uppercase tracking-wider">
                Dokumen Resmi
              </span>
              <ul className="flex flex-col gap-2.5 text-sm">
                {Object.keys(legalDocs).map((docKey) => (
                  <li key={docKey}>
                    <button
                      type="button"
                      onClick={() => setActiveLegal(legalDocs[docKey])}
                      className="text-left text-[#3E544B] hover:text-[#164234] transition-colors cursor-pointer whitespace-nowrap bg-transparent border-0 p-0"
                    >
                      {docKey}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Row */}
        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#3E544B]/80">
          <span>© 2026 Pusat Pengembangan Bisnis (P2B) UIN Salatiga. Hak cipta dilindungi.</span>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setActiveLegal(legalDocs['Tata Kelola PTN BLU'])}
              className="hover:text-[#164234] transition-colors cursor-pointer bg-transparent border-0 p-0"
            >
              Tata Kelola
            </button>
            <button
              type="button"
              onClick={() => setActiveLegal(legalDocs['Kebijakan Privasi'])}
              className="hover:text-[#164234] transition-colors cursor-pointer bg-transparent border-0 p-0"
            >
              Privasi
            </button>
            <button
              type="button"
              onClick={() => setActiveLegal(legalDocs['Standar Layanan'])}
              className="hover:text-[#164234] transition-colors cursor-pointer bg-transparent border-0 p-0"
            >
              Standar Layanan
            </button>
          </div>
        </div>
      </motion.div>

      {/* Legal Documentation Modal */}
      <AnimatePresence>
        {activeLegal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveLegal(null)}
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
                onClick={() => setActiveLegal(null)}
                aria-label="Tutup dokumen"
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[rgba(22,66,52,0.08)] hover:bg-[rgba(22,66,52,0.15)] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-[#164234]" />
              </button>

              <span className="text-xs text-[#8F6D26]">
                {activeLegal.updated}
              </span>
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

      {/* Social Channel Modal */}
      <AnimatePresence>
        {activeSocial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveSocial(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0E2A21]/25 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl bg-[#FAF8F3]/95 backdrop-blur-2xl border border-[#C9A45A]/30 p-6 text-[#164234] shadow-lg relative"
            >
              <button
                type="button"
                onClick={() => setActiveSocial(null)}
                aria-label="Tutup kanal sosial"
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[rgba(22,66,52,0.08)] hover:bg-[rgba(22,66,52,0.15)] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-[#164234]" />
              </button>

              <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                Kanal Resmi P2B
              </span>
              <h3 className="text-xl font-normal tracking-tight mt-1 mb-1">
                {activeSocial.label}
              </h3>
              <p className="text-sm text-[#3E544B] mb-5">
                Akun: {activeSocial.handle}
              </p>

              <button
                type="button"
                onClick={() => setActiveSocial(null)}
                className="w-full py-2.5 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] border border-[#C9A45A]/40 text-sm font-normal transition-colors cursor-pointer"
              >
                Selesai
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}
