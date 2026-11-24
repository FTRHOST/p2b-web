import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'motion/react';
import { PageHero } from './PageHero';
import { Footer } from './Footer';
import { CardCornerPattern } from './CardCornerPattern';
import {
  DEFAULT_MAGANG_BENEFITS,
  DEFAULT_MAGANG_GALLERY,
  DEFAULT_MAGANG_HERO_IMAGE,
  DEFAULT_MAGANG_POSITIONS,
} from '../data/magangDefaults';
import {
  MagangGalleryItem,
  MagangPositionItem,
  SiteSettings,
} from '../types/cms';

interface MagangPageProps {
  settings?: SiteSettings;
  galleryItems?: MagangGalleryItem[];
  positions?: MagangPositionItem[];
  onOpenRegisterPage: () => void;
  onNavigateSection: (
    target: 'top' | 'who-we-are' | 'news-updates' | 'lokasi-p2b'
  ) => void;
}

function getGallerySpanClass(index: number, total: number): string {
  if (total <= 1) return 'lg:col-span-12';
  if (total === 2) return 'lg:col-span-6';
  if (total % 2 === 1 && index === total - 1) return 'lg:col-span-12';
  return index % 4 === 0 || index % 4 === 3 ? 'lg:col-span-7' : 'lg:col-span-5';
}

export function MagangPage({
  settings,
  galleryItems = DEFAULT_MAGANG_GALLERY,
  positions = DEFAULT_MAGANG_POSITIONS,
  onOpenRegisterPage,
  onNavigateSection,
}: MagangPageProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const activeGallery = useMemo(
    () => galleryItems.filter((item) => item.isActive !== false),
    [galleryItems]
  );

  const activePositions = useMemo(
    () => positions.filter((item) => item.isActive !== false),
    [positions]
  );

  const availablePositions = useMemo(
    () => activePositions.filter((item) => item.isAvailable !== false),
    [activePositions]
  );

  const heroImageSrc =
    settings?.page_magang_image?.trim() || DEFAULT_MAGANG_HERO_IMAGE;
  const deadlineText =
    settings?.magang_deadline?.trim() || 'Kamis, 22 Oktober 2026';
  const periodText =
    settings?.magang_period?.trim() || 'Sampai dengan 30 April 2027';

  useEffect(() => {
    if (lightboxIndex === null) return;
    if (activeGallery.length === 0) {
      setLightboxIndex(null);
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev + 1) % activeGallery.length
        );
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev === null
            ? null
            : (prev - 1 + activeGallery.length) % activeGallery.length
        );
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIndex, activeGallery.length]);

  const activePhoto =
    lightboxIndex !== null ? activeGallery[lightboxIndex] ?? null : null;

  return (
    <div className="min-h-screen bg-[#F6F3EC] flex flex-col">
      <PageHero
        eyebrow={
          settings?.page_magang_eyebrow?.trim() ||
          'Open Recruitment · Talenta Mahasiswa'
        }
        title="Magang di P2B"
        subtitle={
          settings?.page_magang_subtitle?.trim() ||
          'Pusat Pengembangan Bisnis (P2B) UIN Salatiga membuka kesempatan magang untuk merasakan pengalaman kerja nyata di unit usaha dan layanan profesional universitas.'
        }
        imageSrc={heroImageSrc}
        imageAlt="Suasana kolaborasi tim mahasiswa magang di P2B UIN Salatiga"
        cornerLabel="Pendaftaran Dibuka"
        cornerActionLabel="Daftar Sekarang"
        cornerHref="/magang/daftar"
        onCornerClick={onOpenRegisterPage}
      />

      <main className="w-full flex justify-center px-3 md:px-5 pt-10 md:pt-14 pb-12 md:pb-20 flex-1">
        <div className="w-full max-w-[1536px] flex flex-col gap-12 md:gap-16">
          {/* Section 1: Galeri Foto Anak Magang (Dinamis dari CMS) */}
          <section className="flex flex-col gap-6 md:gap-8">
            <div className="px-3 md:px-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs md:text-sm font-normal text-[#8F6D26] uppercase tracking-wider">
                  Dokumentasi Kegiatan
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-normal text-[#164234] tracking-tight leading-[1.1]">
                  Galeri Foto Anak Magang
                </h2>
              </div>
              <p className="text-sm sm:text-base text-[#3E544B] leading-relaxed max-w-xl">
                Potret aktivitas keseharian, kolaborasi lintas divisi, dan
                kontribusi nyata mahasiswa magang dalam mendukung unit bisnis
                P2B UIN Salatiga.
              </p>
            </div>

            {activeGallery.length === 0 ? (
              <div className="rounded-[1.5rem] md:rounded-[2.5rem] bg-[#FAF8F3] border border-[#C9A45A]/30 p-10 text-center text-sm text-[#3E544B]">
                Galeri foto anak magang akan segera diperbarui melalui CMS P2B
                UIN Salatiga.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
                {activeGallery.map((photo, index) => {
                  const failKey = `gallery-${photo.id}-${photo.imageUrl}`;
                  const failed =
                    !photo.imageUrl?.trim() || Boolean(failedImages[failKey]);
                  const spanClass = getGallerySpanClass(
                    index,
                    activeGallery.length
                  );
                  return (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => setLightboxIndex(index)}
                      className={`${spanClass} group relative w-full h-[270px] sm:h-[330px] lg:h-[370px] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border border-[#C9A45A]/30 bg-[#EAE5D7] text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#164234]`}
                    >
                      {failed ? (
                        <div className="absolute inset-0 z-[1] bg-gradient-to-br from-[#EAE5D7] via-[#E1E7DF] to-[#D4DED6] flex flex-col items-center justify-center gap-2 text-[#164234]/70">
                          <Icon
                            icon="mdi:image-multiple-outline"
                            className="w-8 h-8"
                          />
                          <span className="text-sm font-normal">
                            {photo.title}
                          </span>
                        </div>
                      ) : (
                        <img
                          src={photo.imageUrl}
                          alt={photo.altText || photo.title}
                          referrerPolicy="no-referrer"
                          onError={() =>
                            setFailedImages((prev) => ({
                              ...prev,
                              [failKey]: true,
                            }))
                          }
                          className="absolute inset-0 z-[1] w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                        />
                      )}

                      <div className="absolute inset-0 z-[2] bg-gradient-to-t from-[#0A241B]/85 via-[#0A241B]/25 to-transparent pointer-events-none" />

                      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 flex items-end justify-between gap-4 z-10">
                        <div className="flex flex-col gap-1 max-w-xl">
                          <h3 className="text-lg sm:text-xl font-normal text-[#FAF8F3] tracking-tight leading-snug">
                            {photo.title}
                          </h3>
                          {photo.caption && (
                            <p className="text-xs sm:text-sm text-[#F6F3EC]/85 leading-relaxed line-clamp-2">
                              {photo.caption}
                            </p>
                          )}
                        </div>
                        <span className="w-10 h-10 rounded-full bg-[#FAF8F3]/90 text-[#164234] group-hover:bg-[#F4D993] flex items-center justify-center shrink-0 transition-colors">
                          <Icon icon="mdi:arrow-top-right" className="w-4 h-4" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Section 2: Posisi Magang yang Dibuka (Dinamis dari CMS, tanpa tombol daftar per card) */}
          <section className="flex flex-col gap-6 md:gap-8">
            <div className="px-3 md:px-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div className="flex flex-col gap-1.5 max-w-2xl">
                <span className="text-xs md:text-sm font-normal text-[#8F6D26] uppercase tracking-wider tabular-nums">
                  Open Recruitment · {activePositions.length} Posisi Dibuka
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-normal text-[#164234] tracking-tight leading-[1.1] text-balance">
                  Posisi Magang P2B UIN Salatiga
                </h2>
              </div>
              <p className="text-sm sm:text-base text-[#3E544B] leading-relaxed max-w-xl">
                Pusat Pengembangan Bisnis (P2B) UIN Salatiga membuka open
                recruitment magang dengan batas pendaftaran{' '}
                <span className="text-[#164234] font-medium">
                  {deadlineText}
                </span>
                . Pemilihan posisi dilakukan pada formulir pendaftaran.
              </p>
            </div>

            {activePositions.length === 0 ? (
              <div className="rounded-[1.5rem] md:rounded-[2.25rem] bg-[#FAF8F3] border border-[#C9A45A]/30 p-10 text-center text-sm text-[#3E544B]">
                Belum ada posisi magang aktif yang ditampilkan saat ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
                {activePositions.map((pos, idx) => {
                  const failKey = `position-${pos.id}-${pos.imageUrl}`;
                  const failed =
                    !pos.imageUrl?.trim() || Boolean(failedImages[failKey]);
                  const numberLabel = String(idx + 1).padStart(2, '0');

                  return (
                    <article
                      key={pos.id}
                      className="group relative rounded-[1.5rem] md:rounded-[2.25rem] bg-[#FAF8F3] border border-[#C9A45A]/30 hover:border-[#C9A45A]/65 transition-colors duration-200 overflow-hidden flex flex-col"
                    >
                      <CardCornerPattern
                        index={idx}
                        position="bottom-right"
                        sizeClassName="w-36 h-36 sm:w-44 sm:h-44"
                        opacityClassName="opacity-[0.14] group-hover:opacity-[0.24]"
                      />

                      <div className="relative z-10 w-full aspect-[4/3] bg-[#EAE5D7] overflow-hidden">
                        {failed ? (
                          <div className="w-full h-full bg-gradient-to-br from-[#EAE5D7] via-[#E1E7DF] to-[#D4DED6] flex flex-col items-center justify-center gap-2 text-[#164234]/70">
                            <Icon
                              icon="mdi:briefcase-outline"
                              className="w-8 h-8"
                            />
                            <span className="text-sm font-normal">
                              {pos.title}
                            </span>
                          </div>
                        ) : (
                          <img
                            src={pos.imageUrl}
                            alt={`Mahasiswa magang posisi ${pos.title} P2B UIN Salatiga`}
                            referrerPolicy="no-referrer"
                            onError={() =>
                              setFailedImages((prev) => ({
                                ...prev,
                                [failKey]: true,
                              }))
                            }
                            className="relative z-[1] w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                          />
                        )}
                      </div>

                      <div className="relative z-10 p-6 sm:p-7 flex flex-col flex-1 gap-3">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#8F6D26] tabular-nums">
                          <span>{numberLabel}</span>
                          {pos.division && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{pos.division}</span>
                            </>
                          )}
                          <span aria-hidden="true">·</span>
                          <span
                            className={
                              pos.isAvailable === false
                                ? 'text-[#9b2c2c]'
                                : 'text-[#164234]'
                            }
                          >
                            {pos.isAvailable === false
                              ? 'Tidak Tersedia'
                              : 'Tersedia'}
                          </span>
                        </div>

                        <h3 className="text-2xl font-normal text-[#164234] tracking-tight">
                          {pos.title}
                        </h3>

                        <p className="text-sm text-[#3E544B] leading-relaxed">
                          {pos.description}
                        </p>

                        {pos.tasks && pos.tasks.length > 0 && (
                          <ul className="mt-1 pt-3 border-t border-[#164234]/10 flex flex-col gap-2 text-xs sm:text-[13px] text-[#3E544B]">
                            {pos.tasks.map((task, tIdx) => (
                              <li
                                key={`${pos.id}-task-${tIdx}`}
                                className="flex items-start gap-2 leading-relaxed"
                              >
                                <Icon
                                  icon="mdi:check"
                                  className="w-4 h-4 text-[#8F6D26] shrink-0 mt-0.5"
                                />
                                <span>{task}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* Section 3: Benefit & Jadwal + CTA Pendaftaran */}
          <section
            id="pendaftaran-magang"
            className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 items-stretch"
          >
            {/* Left: Apa yang akan kamu dapatkan? */}
            <div className="lg:col-span-7 group relative overflow-hidden rounded-[1.5rem] md:rounded-[3rem] bg-white/75 backdrop-blur-xl border border-[#C9A45A]/30 p-6 sm:p-10 md:p-12 flex flex-col justify-between gap-6">
              <CardCornerPattern
                index={2}
                position="top-right"
                sizeClassName="w-44 h-44 sm:w-52 sm:h-52"
                opacityClassName="opacity-[0.12] group-hover:opacity-[0.2]"
              />

              <div className="relative z-10 flex flex-col gap-2">
                <span className="text-xs md:text-sm font-normal text-[#8F6D26] uppercase tracking-wider">
                  Pengalaman &amp; Pengembangan Diri
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal text-[#164234] tracking-tight leading-[1.12] text-balance">
                  Apa yang Akan Kamu Dapatkan?
                </h2>
                <p className="text-sm sm:text-base text-[#3E544B] leading-relaxed mt-1">
                  Selama periode magang ({periodText.toLowerCase()}), peserta
                  terlibat aktif dalam proyek nyata bersama tim Pusat
                  Pengembangan Bisnis UIN Salatiga.
                </p>
              </div>

              <ul className="relative z-10 flex flex-col divide-y divide-[#164234]/10 border-t border-b border-[#164234]/10">
                {DEFAULT_MAGANG_BENEFITS.map((benefit, idx) => (
                  <li
                    key={benefit}
                    className="py-4 flex items-start gap-3.5 text-sm sm:text-[15px] text-[#164234] leading-relaxed"
                  >
                    <span className="w-7 h-7 rounded-full bg-[#EAE3D2] text-[#164234] flex items-center justify-center shrink-0 mt-0.5">
                      <Icon
                        icon="mdi:check"
                        className="w-4 h-4 text-[#164234]"
                      />
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-[#8F6D26] tabular-nums">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span>{benefit}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Jadwal Rekrutmen & CTA Link Pendaftaran */}
            <div className="lg:col-span-5 group relative overflow-hidden rounded-[1.5rem] md:rounded-[3rem] bg-gradient-to-br from-[#0F3126] via-[#164234] to-[#1D5442] border border-[#C9A45A]/35 p-6 sm:p-10 md:p-12 text-[#FAF8F3] flex flex-col justify-between gap-8">
              <CardCornerPattern
                index={1}
                position="top-right"
                sizeClassName="w-48 h-48 sm:w-56 sm:h-56"
                opacityClassName="opacity-[0.14] group-hover:opacity-[0.22]"
              />

              <div className="relative z-10 flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs uppercase tracking-[0.16em] text-[#F4D993]">
                    Jadwal &amp; Pendaftaran
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-normal tracking-tight leading-snug text-balance">
                    Informasi Rekrutmen Magang P2B
                  </h3>
                </div>

                <div className="flex flex-col divide-y divide-white/15 border-t border-b border-white/15 text-sm">
                  <div className="py-3.5 flex flex-col gap-1">
                    <span className="text-xs text-[#F4D993]/85">
                      Batas Akhir Pendaftaran
                    </span>
                    <span className="text-base sm:text-lg font-normal text-[#FAF8F3] tabular-nums">
                      {deadlineText}
                    </span>
                  </div>

                  <div className="py-3.5 flex flex-col gap-1">
                    <span className="text-xs text-[#F4D993]/85">
                      Periode Magang
                    </span>
                    <span className="text-base sm:text-lg font-normal text-[#FAF8F3] tabular-nums">
                      {periodText}
                    </span>
                  </div>

                  <div className="py-3.5 flex flex-col gap-1.5">
                    <span className="text-xs text-[#F4D993]/85">
                      Posisi Tersedia
                    </span>
                    <span className="text-sm sm:text-base font-normal text-[#FAF8F3] leading-relaxed">
                      {availablePositions.length > 0
                        ? availablePositions.map((pos) => pos.title).join(' · ')
                        : 'Seluruh posisi sedang ditutup sementara'}
                    </span>
                    <span className="text-xs text-[#F6F3EC]/70 leading-relaxed">
                      Pemilihan posisi diminati dilakukan langsung pada formulir pendaftaran.
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex flex-col gap-3">
                <a
                  href="/magang/daftar"
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenRegisterPage();
                  }}
                  className="w-full py-3.5 px-6 rounded-full bg-[#F4D993] hover:bg-[#FAF8F3] text-[#164234] text-sm sm:text-base font-medium transition-colors flex items-center justify-center gap-2.5 cursor-pointer whitespace-nowrap"
                >
                  <span>Daftar Magang Sekarang</span>
                  <Icon icon="mdi:arrow-top-right" className="w-4 h-4" />
                </a>
                <p className="text-xs text-[#F6F3EC]/75 text-center leading-relaxed">
                  Klik tombol di atas untuk membuka halaman formulir resmi
                  pendaftaran magang P2B UIN Salatiga.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer
        settings={settings}
        onNavigate={(target) => {
          onNavigateSection(target);
        }}
      />

      {/* Interactive Gallery Lightbox Modal */}
      <AnimatePresence>
        {activePhoto && lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIndex(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0E2A21]/75 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl rounded-3xl bg-[#FAF8F3] border border-[#C9A45A]/35 overflow-hidden shadow-xl"
            >
              <div className="relative aspect-[4/3] bg-[#EAE5D7]">
                <img
                  src={activePhoto.imageUrl}
                  alt={activePhoto.altText || activePhoto.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setLightboxIndex(null)}
                  aria-label="Tutup galeri"
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#0E2A21]/75 hover:bg-[#0E2A21] text-[#FAF8F3] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Icon icon="mdi:close" className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[#164234]">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-[#8F6D26] tabular-nums">
                    Foto {lightboxIndex + 1} dari {activeGallery.length}
                  </span>
                  <h3 className="text-lg sm:text-xl font-normal">
                    {activePhoto.title}
                  </h3>
                  {activePhoto.caption && (
                    <p className="text-xs sm:text-sm text-[#3E544B]">
                      {activePhoto.caption}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex(
                        (lightboxIndex - 1 + activeGallery.length) %
                          activeGallery.length
                      )
                    }
                    aria-label="Foto sebelumnya"
                    className="w-10 h-10 rounded-full bg-[#EAE3D2] hover:bg-[#164234] text-[#164234] hover:text-[#FAF8F3] flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Icon icon="mdi:chevron-left" className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex(
                        (lightboxIndex + 1) % activeGallery.length
                      )
                    }
                    aria-label="Foto berikutnya"
                    className="w-10 h-10 rounded-full bg-[#EAE3D2] hover:bg-[#164234] text-[#164234] hover:text-[#FAF8F3] flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Icon icon="mdi:chevron-right" className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
