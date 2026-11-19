import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import DOMPurify from 'dompurify';
import { AnimatePresence, motion } from 'motion/react';
import { allNewsArticles, NewsArticle } from '../data/news';
import { PageHero } from './PageHero';
import { Footer } from './Footer';
import { EditorialNewsCard } from './EditorialNewsCard';
import { CardCornerPattern } from './CardCornerPattern';
import { SiteSettings } from '../types/cms';

function getPatternSeed(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface NewsDetailPageProps {
  article: NewsArticle;
  articles?: NewsArticle[];
  settings?: SiteSettings;
  onOpenAllNews: () => void;
  onSelectArticle: (articleId: string) => void;
  onNavigateSection: (target: 'top' | 'who-we-are' | 'news-updates' | 'lokasi-p2b') => void;
}

export function NewsDetailPage({
  article,
  articles = allNewsArticles,
  settings,
  onOpenAllNews,
  onSelectArticle,
  onNavigateSection,
}: NewsDetailPageProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [previewPdfId, setPreviewPdfId] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [failedRelatedImages, setFailedRelatedImages] = useState<Record<string, boolean>>({});

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2400);
    } catch {
      setLinkCopied(false);
    }
  };

  useEffect(() => {
    setImgFailed(false);
    setLightboxIndex(null);
    setPreviewPdfId(null);
  }, [article.id]);

  const relatedArticles = articles
    .filter((item) => item.id !== article.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F6F3EC] flex flex-col">
      <PageHero
        eyebrow={`${article.category} · ${article.date}`}
        title={article.title}
        subtitle={article.excerpt}
        imageSrc={article.isLogoPlaceholder ? undefined : article.image}
        imageAlt={article.title}
        cornerLabel="Arsip Berita"
        cornerActionLabel="Semua Berita"
        cornerHref="/semua-berita"
        onCornerClick={onOpenAllNews}
      />

      <main className="w-full flex justify-center px-3 md:px-5 pt-10 md:pt-14 pb-12 md:pb-20 flex-1">
        <div className="w-full max-w-[1536px] flex flex-col gap-10 md:gap-14">
          {/* Article Body Card */}
          <motion.article
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-[1.5rem] md:rounded-[3rem] bg-white/65 backdrop-blur-xl border border-[#C9A45A]/30 p-6 sm:p-10 md:p-14 flex flex-col gap-8"
          >
            {/* Top Navigation & Meta Row */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#C9A45A]/25">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={onOpenAllNews}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(22,66,52,0.08)] hover:bg-[#164234] text-[#164234] hover:text-[#F6F3EC] text-xs sm:text-sm font-normal transition-colors cursor-pointer w-fit whitespace-nowrap"
                >
                  <Icon icon="mdi:arrow-left" className="w-4 h-4" />
                  <span>Kembali ke Semua Berita</span>
                </button>

                <button
                  type="button"
                  onClick={() => void handleCopyShareLink()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-[#164234] text-[#164234] hover:text-[#F6F3EC] border border-[#C9A45A]/35 text-xs sm:text-sm font-normal transition-colors cursor-pointer w-fit whitespace-nowrap"
                >
                  {linkCopied ? (
                    <>
                      <Icon icon="mdi:check" className="w-3.5 h-3.5 text-[#8F6D26]" />
                      <span>Tautan Disalin</span>
                    </>
                  ) : (
                    <>
                      <Icon icon="mdi:share-variant-outline" className="w-3.5 h-3.5 text-[#B89242]" />
                      <span>Salin Tautan</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-[#3E544B]">
                <span className="inline-flex items-center gap-1.5 text-[#8F6D26]">
                  <Icon icon="mdi:tag-outline" className="w-3.5 h-3.5" />
                  <span>{article.category}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Icon icon="mdi:calendar-outline" className="w-3.5 h-3.5 text-[#B89242]" />
                  <span>{article.date}</span>
                </span>
              </div>
            </div>

            {/* Cover Image or Centered Logo Placeholder */}
            {!imgFailed && (
              <div className="relative z-10 w-full max-w-4xl mx-auto aspect-[16/9] rounded-[1.25rem] md:rounded-[2rem] overflow-hidden border border-[#C9A45A]/25 bg-gradient-to-br from-[#F4EFE3] via-[#EAE5D7] to-[#D9E2DA] flex items-center justify-center">
                <img
                  src={article.image}
                  alt={article.title}
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                  className={
                    article.isLogoPlaceholder
                      ? 'max-h-28 sm:max-h-36 md:max-h-44 w-auto object-contain p-6'
                      : 'w-full h-full object-cover'
                  }
                />
              </div>
            )}

            {/* Editorial Text (TinyMCE Rich HTML or plain paragraphs fallback) */}
            {article.contentHtml?.trim() ? (
              <div
                className="relative z-10 w-full max-w-3xl mx-auto text-base sm:text-[17px] md:text-lg text-[#3E544B] leading-relaxed [&_p]:mb-5 [&_p]:text-justify [&_h1]:text-2xl [&_h1]:sm:text-3xl [&_h1]:text-[#164234] [&_h1]:font-normal [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:sm:text-2xl [&_h2]:text-[#164234] [&_h2]:font-normal [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:sm:text-xl [&_h3]:text-[#164234] [&_h3]:font-normal [&_h3]:mt-5 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-5 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-5 [&_ol]:space-y-1.5 [&_blockquote]:border-l-2 [&_blockquote]:border-[#C9A45A] [&_blockquote]:pl-4 [&_blockquote]:py-1 [&_blockquote]:my-5 [&_blockquote]:italic [&_blockquote]:text-[#164234] [&_a]:text-[#164234] [&_a]:underline [&_a]:underline-offset-2 [&_img]:rounded-2xl [&_img]:my-6 [&_img]:mx-auto [&_img]:max-w-full [&_img]:h-auto [&_table]:w-full [&_table]:my-6 [&_table]:border-collapse [&_th]:border [&_th]:border-[#C9A45A]/30 [&_th]:p-2.5 [&_th]:bg-[#F6F3EC] [&_th]:text-[#164234] [&_th]:text-left [&_td]:border [&_td]:border-[#C9A45A]/25 [&_td]:p-2.5 [&_hr]:border-[#C9A45A]/30 [&_hr]:my-6"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(article.contentHtml, {
                    ADD_ATTR: ['target', 'rel', 'style'],
                  }),
                }}
              />
            ) : (
              <div className="relative z-10 w-full max-w-3xl mx-auto flex flex-col gap-5 text-base sm:text-[17px] md:text-lg text-[#3E544B] leading-relaxed text-justify">
                {article.content.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            )}

            {/* Dokumentasi Foto (> 1 Foto) */}
            {article.gallery && article.gallery.length > 0 && (
              <div className="relative z-10 w-full max-w-4xl mx-auto pt-6 border-t border-[#C9A45A]/25 flex flex-col gap-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-wider text-[#8F6D26] inline-flex items-center gap-1.5">
                      <Icon icon="mdi:image-multiple-outline" className="w-3.5 h-3.5" />
                      <span>Galeri Kegiatan</span>
                    </span>
                    <h2 className="text-xl sm:text-2xl font-normal text-[#164234] tracking-tight">
                      Dokumentasi Foto ({article.gallery.length})
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {article.gallery.map((photo, idx) => (
                    <button
                      key={`${photo.url}-${idx}`}
                      type="button"
                      onClick={() => setLightboxIndex(idx)}
                      className="text-left rounded-2xl bg-[#F6F3EC]/80 border border-[#C9A45A]/25 overflow-hidden group cursor-pointer hover:border-[#C9A45A]/60 transition-all flex flex-col"
                    >
                      <div className="w-full aspect-[4/3] overflow-hidden bg-[#EAE5D7]">
                        <img
                          src={photo.url}
                          alt={photo.caption || `${article.title} - Dokumentasi ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                      </div>
                      {photo.caption && (
                        <div className="px-3.5 py-2.5 text-xs text-[#3E544B] leading-relaxed">
                          {photo.caption}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Lampiran Dokumen PDF */}
            {article.attachments && article.attachments.length > 0 && (
              <div className="relative z-10 w-full max-w-4xl mx-auto pt-6 border-t border-[#C9A45A]/25 flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-wider text-[#8F6D26] inline-flex items-center gap-1.5">
                    <Icon icon="mdi:file-document-outline" className="w-3.5 h-3.5" />
                    <span>Berkas Pendukung</span>
                  </span>
                  <h2 className="text-xl sm:text-2xl font-normal text-[#164234] tracking-tight">
                    Lampiran Dokumen PDF ({article.attachments.length})
                  </h2>
                </div>

                <div className="flex flex-col gap-3">
                  {article.attachments.map((att, idx) => {
                    const isPreviewOpen = previewPdfId === att.id;
                    const downloadHref = att.url.startsWith('/api/media/')
                      ? `${att.url}?download=1`
                      : att.url;
                    const attSeed = getPatternSeed(`${article.id}-${att.id || idx}`);

                    return (
                      <div
                        key={att.id}
                        className="group relative overflow-hidden rounded-2xl bg-[#F6F3EC]/80 border border-[#C9A45A]/25 p-4 flex flex-col gap-4"
                      >
                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start sm:items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-[rgba(201,164,90,0.18)] border border-[#C9A45A]/35 flex items-center justify-center shrink-0">
                              <Icon icon="mdi:file-document-outline" className="w-5 h-5 text-[#164234]" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm sm:text-base font-normal text-[#164234] truncate">
                                {att.title}
                              </span>
                              <span className="text-xs text-[#3E544B]">
                                Dokumen PDF
                                {att.sizeBytes ? ` · ${formatBytes(att.sizeBytes)}` : ''}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewPdfId((prev) =>
                                  prev === att.id ? null : att.id
                                )
                              }
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-[#164234] text-[#164234] hover:text-[#F6F3EC] border border-[#C9A45A]/35 text-xs transition-colors cursor-pointer"
                            >
                              <Icon icon="mdi:eye-outline" className="w-3.5 h-3.5" />
                              <span>{isPreviewOpen ? 'Tutup Pratinjau' : 'Lihat PDF'}</span>
                            </button>
                            <a
                              href={downloadHref}
                              download={att.fileName || `${att.title}.pdf`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] border border-[#C9A45A]/40 text-xs transition-colors whitespace-nowrap"
                            >
                              <Icon icon="mdi:download-outline" className="w-3.5 h-3.5 text-[#F4D993]" />
                              <span>Unduh</span>
                            </a>
                          </div>
                        </div>

                        {isPreviewOpen && (
                          <div className="relative z-10 w-full rounded-xl overflow-hidden border border-[#C9A45A]/30 bg-white">
                            <iframe
                              src={att.url}
                              title={att.title}
                              className="w-full h-[520px] border-0"
                            />
                          </div>
                        )}

                        <CardCornerPattern
                          index={attSeed}
                          position={attSeed % 2 === 0 ? 'bottom-right' : 'top-right'}
                          sizeClassName="w-28 h-28 sm:w-32 sm:h-32"
                          opacityClassName="opacity-[0.14] group-hover:opacity-[0.24]"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <CardCornerPattern
              index={getPatternSeed(article.id)}
              position={getPatternSeed(article.id) % 2 === 0 ? 'top-right' : 'bottom-right'}
              sizeClassName="w-52 h-52 sm:w-64 sm:h-64 md:w-72 md:h-72"
              opacityClassName="opacity-[0.10]"
            />
          </motion.article>

          {/* Related News */}
          <section className="flex flex-col gap-6">
            <div className="px-3 md:px-6 flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                  Baca Juga
                </span>
                <h2 className="text-2xl sm:text-3xl font-normal text-[#164234] tracking-tight">
                  Berita P2B Lainnya
                </h2>
              </div>

              <button
                type="button"
                onClick={onOpenAllNews}
                className="inline-flex items-center gap-1 text-sm text-[#8F6D26] hover:text-[#164234] transition-colors cursor-pointer bg-transparent border-0 p-0 whitespace-nowrap"
              >
                <span>Semua Berita</span>
                <Icon icon="mdi:chevron-right" className="w-4 h-4" />
              </button>
            </div>

            <ul className="nup-grid">
              {relatedArticles.map((item, index) => (
                <EditorialNewsCard
                  key={item.id}
                  article={item}
                  index={index}
                  imageFailed={Boolean(failedRelatedImages[item.id])}
                  onImageError={(id) =>
                    setFailedRelatedImages((prev) => ({ ...prev, [id]: true }))
                  }
                  onSelectArticle={onSelectArticle}
                  headingAs="h3"
                />
              ))}
            </ul>
          </section>
        </div>
      </main>

      <Footer settings={settings} onNavigate={onNavigateSection} />

      {/* Gallery Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && article.gallery && article.gallery[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIndex(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A241B]/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl flex flex-col gap-3 relative"
            >
              <div className="flex items-center justify-between text-[#FAF8F3] px-1">
                <span className="text-xs sm:text-sm tabular-nums text-[#F4D993]">
                  Dokumentasi {lightboxIndex + 1} / {article.gallery.length}
                </span>
                <button
                  type="button"
                  onClick={() => setLightboxIndex(null)}
                  aria-label="Tutup galeri"
                  className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-[#FAF8F3] flex items-center justify-center cursor-pointer transition-colors"
                >
                  <Icon icon="mdi:close" className="w-4 h-4" />
                </button>
              </div>

              <div className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-[#0E2A21] border border-[#C9A45A]/30 flex items-center justify-center max-h-[76vh]">
                <img
                  src={article.gallery[lightboxIndex].url}
                  alt={
                    article.gallery[lightboxIndex].caption ||
                    `${article.title} - Foto ${lightboxIndex + 1}`
                  }
                  referrerPolicy="no-referrer"
                  className="max-h-[75vh] w-auto max-w-full object-contain"
                />

                {article.gallery.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setLightboxIndex((prev) =>
                          prev === null
                            ? null
                            : (prev - 1 + article.gallery!.length) %
                              article.gallery!.length
                        )
                      }
                      aria-label="Foto sebelumnya"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#0A241B]/75 hover:bg-[#164234] border border-[#F4D993]/40 text-[#FAF8F3] flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <Icon icon="mdi:chevron-left" className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setLightboxIndex((prev) =>
                          prev === null ? null : (prev + 1) % article.gallery!.length
                        )
                      }
                      aria-label="Foto berikutnya"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#0A241B]/75 hover:bg-[#164234] border border-[#F4D993]/40 text-[#FAF8F3] flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <Icon icon="mdi:chevron-right" className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {article.gallery[lightboxIndex].caption && (
                <p className="text-center text-xs sm:text-sm text-[#FAF8F3]/90 px-4">
                  {article.gallery[lightboxIndex].caption}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
