import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { Download, ExternalLink, FileText, Maximize2, Minimize2 } from 'lucide-react';
import { PageHero } from './PageHero';
import { Footer } from './Footer';
import {
  DEFAULT_TARIF_CORNER_ACTION,
  DEFAULT_TARIF_CORNER_LABEL,
  DEFAULT_TARIF_EYEBROW,
  DEFAULT_TARIF_HERO_IMAGE,
  DEFAULT_TARIF_ITEMS,
  DEFAULT_TARIF_SUBTITLE,
  DEFAULT_TARIF_TITLE,
  TarifCategorySlug,
  TarifItem,
  getTarifItemBySlug,
  resolvePdfSource,
} from '../data/tarifDefaults';
import { SiteSettings } from '../types/cms';

interface TarifLayananPageProps {
  settings?: SiteSettings;
  tarifItems?: TarifItem[];
  activeCategorySlug?: TarifCategorySlug;
  onSelectCategory: (slug: TarifCategorySlug) => void;
  onNavigateSection: (
    target: 'top' | 'who-we-are' | 'news-updates' | 'lokasi-p2b'
  ) => void;
}

export function TarifLayananPage({
  settings,
  tarifItems,
  activeCategorySlug,
  onSelectCategory,
  onNavigateSection,
}: TarifLayananPageProps) {
  const [expandedHeight, setExpandedHeight] = useState(false);
  const [sourceMode, setSourceMode] = useState<'configured' | 'local'>('configured');

  const activeItems = useMemo(() => {
    if (tarifItems === undefined) return DEFAULT_TARIF_ITEMS;
    return tarifItems
      .filter((t) => t.isActive !== false)
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
  }, [tarifItems]);

  const activeCategory = useMemo(
    () => (activeItems.length > 0 ? getTarifItemBySlug(activeItems, activeCategorySlug) : null),
    [activeItems, activeCategorySlug]
  );

  useEffect(() => {
    setSourceMode('configured');
  }, [activeCategory?.slug, settings]);

  const heroEyebrow =
    settings?.page_tarif_eyebrow?.trim() || DEFAULT_TARIF_EYEBROW;
  const heroTitle = settings?.page_tarif_title?.trim() || DEFAULT_TARIF_TITLE;
  const heroSubtitle =
    settings?.page_tarif_subtitle?.trim() || DEFAULT_TARIF_SUBTITLE;
  const heroImage =
    settings?.page_tarif_image?.trim() || DEFAULT_TARIF_HERO_IMAGE;
  const cornerLabel =
    settings?.page_tarif_corner_label?.trim() || DEFAULT_TARIF_CORNER_LABEL;
  const cornerAction =
    settings?.page_tarif_corner_action?.trim() || DEFAULT_TARIF_CORNER_ACTION;

  const configuredPdf = useMemo(
    () => resolvePdfSource(activeCategory?.pdfUrl || ''),
    [activeCategory?.pdfUrl]
  );

  const localFallbackPdf = useMemo(
    () =>
      activeCategory?.localFallbackPdfUrl
        ? resolvePdfSource(activeCategory.localFallbackPdfUrl)
        : null,
    [activeCategory?.localFallbackPdfUrl]
  );

  const canSwitchToLocal =
    Boolean(localFallbackPdf?.hasSource) &&
    configuredPdf.hasSource &&
    configuredPdf.rawUrl !== activeCategory?.localFallbackPdfUrl;

  const activePdf =
    sourceMode === 'local' && localFallbackPdf?.hasSource
      ? localFallbackPdf
      : configuredPdf.hasSource
        ? configuredPdf
        : localFallbackPdf;

  const resolvedPhone = settings?.contact_phone?.trim() || '0811-2520-4371';
  const resolvedWhatsapp =
    settings?.contact_whatsapp?.trim() || '0811-2520-4371';
  const whatsappDigits = resolvedWhatsapp.replace(/[^0-9]/g, '');
  const whatsappIntl = whatsappDigits.startsWith('0')
    ? `62${whatsappDigits.slice(1)}`
    : whatsappDigits.startsWith('62')
      ? whatsappDigits
      : `62${whatsappDigits}`;

  return (
    <div className="min-h-screen bg-[#F6F3EC] flex flex-col">
      <PageHero
        eyebrow={heroEyebrow}
        title={heroTitle}
        subtitle={heroSubtitle}
        imageSrc={heroImage}
        imageAlt={heroTitle}
        cornerLabel={cornerLabel}
        cornerActionLabel={cornerAction}
        cornerHref="#pdf-viewer-tarif"
        onCornerClick={() => {
          document
            .getElementById('pdf-viewer-tarif')
            ?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <main
        id="pdf-viewer-tarif"
        className="w-full flex justify-center px-3 md:px-5 pt-10 md:pt-14 pb-12 md:pb-20 flex-1"
      >
        <div className="w-full max-w-[1536px] flex flex-col gap-6 md:gap-8">
          {activeItems.length === 0 || !activeCategory ? (
            <section className="rounded-[1.5rem] md:rounded-[2.25rem] bg-[#FAF8F3] border border-[#C9A45A]/35 p-8 sm:p-12 flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[rgba(201,164,90,0.16)] border border-[#C9A45A]/35 flex items-center justify-center">
                <Icon
                  icon="mdi:file-document-outline"
                  className="w-6 h-6 text-[#164234]"
                />
              </div>
              <div className="flex flex-col gap-1 max-w-xl">
                <h2 className="text-xl sm:text-2xl font-normal text-[#164234]">
                  Belum Ada Dokumen Tarif Layanan Aktif
                </h2>
                <p className="text-sm text-[#3E544B] leading-relaxed">
                  Daftar kategori tarif layanan sedang diperbarui oleh pengelola. Silakan hubungi tim P2B UIN Salatiga untuk informasi tarif terbaru.
                </p>
              </div>
              <a
                href={`https://wa.me/${whatsappIntl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] text-xs sm:text-sm transition-colors"
              >
                <Icon icon="mdi:whatsapp" className="w-4 h-4 text-[#F4D993]" />
                <span>Hubungi WhatsApp · {resolvedPhone}</span>
              </a>
            </section>
          ) : (
            <>
              {/* Dynamic Category Switcher */}
              <div className="rounded-[1.5rem] md:rounded-[2rem] bg-[#FAF8F3] border border-[#C9A45A]/30 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {activeItems.map((cat) => {
                    const active = cat.slug === activeCategory.slug;
                    return (
                      <button
                        key={cat.id || cat.slug}
                        type="button"
                        onClick={() => onSelectCategory(cat.slug)}
                        className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap ${
                          active
                            ? 'bg-[#164234] text-[#F6F3EC]'
                            : 'bg-white hover:bg-[#F6F3EC] text-[#164234] border border-[#C9A45A]/30'
                        }`}
                      >
                        <FileText
                          className={`w-4 h-4 shrink-0 ${
                            active ? 'text-[#F4D993]' : 'text-[#8F6D26]'
                          }`}
                        />
                        <span>{cat.navLabel}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="px-2 text-xs text-[#3E544B] hidden lg:block tabular-nums">
                  {activeItems.length} Kategori Tarif Resmi P2B UIN Salatiga
                </div>
              </div>

              {/* Document Details + Embedded PDF Viewer */}
              <section className="rounded-[1.5rem] md:rounded-[2.25rem] bg-[#FAF8F3] border border-[#C9A45A]/35 p-5 sm:p-7 md:p-9 flex flex-col gap-6">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 pb-5 border-b border-[#C9A45A]/20">
                  <div className="flex flex-col gap-1.5 max-w-3xl">
                    <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                      {activeCategory.docNumber || 'Dokumen Tarif Resmi P2B'}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-normal text-[#164234] tracking-tight leading-snug">
                      {activeCategory.title || activeCategory.navLabel}
                    </h2>
                    {activeCategory.description && (
                      <p className="text-sm text-[#3E544B] leading-relaxed mt-0.5">
                        {activeCategory.description}
                      </p>
                    )}
                  </div>

                  {activePdf?.hasSource && (
                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      {canSwitchToLocal && (
                        <div className="inline-flex items-center rounded-xl bg-white border border-[#C9A45A]/35 p-1">
                          <button
                            type="button"
                            onClick={() => setSourceMode('configured')}
                            className={`px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                              sourceMode === 'configured'
                                ? 'bg-[#164234] text-[#F6F3EC]'
                                : 'text-[#3E544B] hover:text-[#164234]'
                            }`}
                          >
                            Sumber Utama
                          </button>
                          <button
                            type="button"
                            onClick={() => setSourceMode('local')}
                            className={`px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                              sourceMode === 'local'
                                ? 'bg-[#164234] text-[#F6F3EC]'
                                : 'text-[#3E544B] hover:text-[#164234]'
                            }`}
                          >
                            Salinan PDF Lokal
                          </button>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setExpandedHeight((prev) => !prev)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white hover:bg-[#F6F3EC] text-[#164234] border border-[#C9A45A]/40 text-xs sm:text-sm transition-colors cursor-pointer"
                      >
                        {expandedHeight ? (
                          <Minimize2 className="w-3.5 h-3.5 text-[#8F6D26]" />
                        ) : (
                          <Maximize2 className="w-3.5 h-3.5 text-[#8F6D26]" />
                        )}
                        <span>{expandedHeight ? 'Ukuran Normal' : 'Perbesar Viewer'}</span>
                      </button>

                      <a
                        href={activePdf.openUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white hover:bg-[#164234] text-[#164234] hover:text-[#F6F3EC] border border-[#C9A45A]/40 text-xs sm:text-sm transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Buka di Tab Baru</span>
                      </a>

                      <a
                        href={activePdf.downloadUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] border border-[#C9A45A]/45 text-xs sm:text-sm transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-[#F4D993]" />
                        <span>Unduh PDF</span>
                      </a>
                    </div>
                  )}
                </div>

                {activePdf?.hasSource ? (
                  <div className="flex flex-col gap-3">
                    <div className="w-full rounded-2xl overflow-hidden border border-[#C9A45A]/35 bg-white shadow-sm">
                      <iframe
                        key={activePdf.embedUrl}
                        src={activePdf.embedUrl}
                        title={activeCategory.title || activeCategory.navLabel}
                        allow="autoplay"
                        className={`w-full border-0 transition-[height] duration-300 ${
                          expandedHeight
                            ? 'h-[82vh] min-h-[760px]'
                            : 'h-[560px] sm:h-[680px] lg:h-[760px]'
                        }`}
                      />
                    </div>

                    {activePdf.isGoogleDrive && (
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#3E544B] px-1">
                        <span>
                          Menampilkan dokumen melalui pratinjau Google Drive. Jika pratinjau tidak muncul pada browser Anda, silakan buka langsung di tab baru{canSwitchToLocal ? ' atau beralih ke Salinan PDF Lokal' : ''}.
                        </span>
                        {canSwitchToLocal && sourceMode === 'configured' && (
                          <button
                            type="button"
                            onClick={() => setSourceMode('local')}
                            className="text-[#164234] hover:text-[#8F6D26] underline underline-offset-4 cursor-pointer bg-transparent border-0 p-0"
                          >
                            Buka dengan Salinan PDF Lokal
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl bg-white/85 border border-[#C9A45A]/30 p-8 sm:p-12 flex flex-col items-center text-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[rgba(201,164,90,0.16)] border border-[#C9A45A]/35 flex items-center justify-center">
                      <Icon
                        icon="mdi:file-document-outline"
                        className="w-6 h-6 text-[#164234]"
                      />
                    </div>
                    <div className="flex flex-col gap-1 max-w-xl">
                      <h3 className="text-lg sm:text-xl font-normal text-[#164234]">
                        Dokumen PDF Belum Ditautkan
                      </h3>
                      <p className="text-xs sm:text-sm text-[#3E544B] leading-relaxed">
                        Berkas PDF untuk <strong>{activeCategory.navLabel}</strong> belum diunggah atau ditautkan di panel CMS. Anda dapat menghubungi layanan resmi P2B UIN Salatiga untuk informasi tarif terbaru.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                      <a
                        href={`https://wa.me/${whatsappIntl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] text-xs sm:text-sm transition-colors"
                      >
                        <Icon icon="mdi:whatsapp" className="w-4 h-4 text-[#F4D993]" />
                        <span>Hubungi WhatsApp · {resolvedPhone}</span>
                      </a>
                    </div>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>

      <Footer settings={settings} onNavigate={onNavigateSection} />
    </div>
  );
}
