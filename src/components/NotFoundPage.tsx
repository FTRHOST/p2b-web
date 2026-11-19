import { useState } from 'react';
import { Icon } from '@iconify/react';
import { motion } from 'motion/react';
import { BottomRightCorner } from './BottomRightCorner';
import { Footer } from './Footer';
import { SiteSettings } from '../types/cms';

interface NotFoundPageProps {
  path?: string;
  settings?: SiteSettings;
  onBackHome: () => void;
  onOpenAllNews: () => void;
  onNavigateSection: (target: 'top' | 'who-we-are' | 'news-updates' | 'lokasi-p2b') => void;
}

const DEFAULT_HERO_IMAGE =
  'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/Auditorium-Student-Centre-di-Salatiga.png';

export function NotFoundPage({
  path,
  settings,
  onBackHome,
  onOpenAllNews,
  onNavigateSection,
}: NotFoundPageProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const resolvedImage = settings?.hero_image_url?.trim() || DEFAULT_HERO_IMAGE;
  const bgFailed = failedUrl === resolvedImage;

  return (
    <div className="min-h-screen bg-[#F6F3EC] flex flex-col">
      <div className="w-full min-h-[calc(100vh-1rem)] md:h-screen flex items-center justify-center p-3 md:p-5 bg-[#F6F3EC]">
        <motion.section
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-[1536px] h-full min-h-[540px] rounded-[1.5rem] md:rounded-[3rem] overflow-hidden shadow-none flex flex-col items-center justify-center bg-white/20 border border-[#C9A45A]/20 group"
        >
          {/* Fallback emerald gradient matching Homepage Hero */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B261D] via-[#164234] to-[#1E5644] z-0" />

          {!bgFailed && (
            <div className="absolute inset-0 w-full h-full z-0">
              <motion.img
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                src={resolvedImage}
                alt="Auditorium Student Centre UIN Salatiga"
                referrerPolicy="no-referrer"
                onError={() => setFailedUrl(resolvedImage)}
                className="w-full h-full object-cover object-[65%] lg:object-center"
              />
            </div>
          )}

          {/* Deep emerald green gradient scrim matching Hero */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A241B]/90 via-[#164234]/75 to-[#164234]/38 z-0 pointer-events-none" />

          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6 pt-20 pb-24 sm:pb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col items-center text-center max-w-3xl"
            >
              <span className="inline-flex items-center gap-2 text-xs md:text-sm font-normal text-[#F4D993] uppercase tracking-[0.18em] mb-3">
                <Icon icon="mdi:compass-outline" className="w-4 h-4" />
                Kesalahan 404 · P2B UIN Salatiga
              </span>

              <div
                aria-hidden="true"
                className="text-7xl sm:text-8xl md:text-9xl font-normal text-[#F4D993] tracking-tight leading-none mb-2 drop-shadow-sm select-none"
              >
                404
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-[56px] font-normal text-[#FAF8F3] drop-shadow-sm mb-3 tracking-tight leading-[1.08] text-balance">
                Halaman Tidak Ditemukan
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-[#F6F3EC]/90 leading-relaxed max-w-2xl font-normal mb-7">
                Maaf, alamat yang Anda tuju
                {path && path !== '/' ? (
                  <>
                    {' '}
                    (<span className="font-mono text-[#F4D993] break-all">{path}</span>)
                  </>
                ) : null}{' '}
                tidak tersedia, telah dipindahkan, atau sudah dihapus dari portal resmi Pusat Pengembangan Bisnis UIN Salatiga.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onBackHome}
                  className="inline-flex items-center gap-2 rounded-full bg-[#FAF8F3] text-[#164234] hover:bg-[#F4D993] px-6 py-3 text-sm font-medium transition-colors cursor-pointer"
                >
                  <Icon icon="mdi:arrow-left" className="w-4 h-4" />
                  Kembali ke Beranda
                </button>
                <button
                  type="button"
                  onClick={onOpenAllNews}
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 text-[#FAF8F3] border border-white/25 hover:bg-white/20 backdrop-blur-md px-6 py-3 text-sm font-normal transition-colors cursor-pointer"
                >
                  <Icon icon="mdi:newspaper-variant-outline" className="w-4 h-4" />
                  Semua Berita
                </button>
              </div>
            </motion.div>

            <BottomRightCorner
              label="Beranda Utama"
              actionLabel="Kembali ke Beranda"
              href="/"
              onOpenProfile={onBackHome}
            />
          </div>
        </motion.section>
      </div>

      <Footer settings={settings} onNavigate={onNavigateSection} />
    </div>
  );
}
