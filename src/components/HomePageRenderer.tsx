import { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { motion } from 'motion/react';
import { NewsArticle } from '../data/news';
import {
  AboutIntroBlockConfig,
  BuilderPageSlug,
  DualBannersBlockConfig,
  GovernanceValueEntry,
  GovernanceValuesBlockConfig,
  HomeBlockItem,
  HomeCtaBannerBlockConfig,
  HomeEditorialSplitBlockConfig,
  HomeFeatureCardEntry,
  HomeFeatureCardsBlockConfig,
  HomeHeroBlockConfig,
  HomeLocationBlockConfig,
  HomeLogoMarqueeBlockConfig,
  HomeNewsBlockConfig,
  HomeStatEntry,
  HomeStatsRowBlockConfig,
  HomeVisiBlockConfig,
  HomeWhoWeAreBlockConfig,
  MagangGalleryBlockConfig,
  MagangPositionsBlockConfig,
  MisiGridBlockConfig,
  MisiItemEntry,
  OrgChartBlockConfig,
  PageHeroBlockConfig,
  UnitDivisionEntry,
  UnitDivisionsBlockConfig,
  getDefaultBlocksWithIds,
  sanitizeBuilderHref,
  sanitizeBuilderMediaUrl,
} from '../data/homeBuilderDefaults';
import {
  MagangGalleryItem,
  MagangPositionItem,
  PartnerLogoItem,
  SiteSettings,
} from '../types/cms';
import { Hero } from './Hero';
import { PageHero } from './PageHero';
import { LogoMarqueeSection } from './LogoMarqueeSection';
import { WhoWeAre } from './WhoWeAre';
import { NewsSection } from './NewsSection';
import { LocationSection } from './LocationSection';
import { VisiCard } from './VisiCard';
import { OrgChartSection } from './OrgChartSection';
import { CardCornerPattern } from './CardCornerPattern';
import { ScrollWordTitle } from './ScrollWordTitle';
import { Footer } from './Footer';

interface HomePageRendererProps {
  pageSlug?: BuilderPageSlug;
  blocks: HomeBlockItem[];
  settings: SiteSettings;
  newsArticles: NewsArticle[];
  newsCategories: string[];
  partnerLogos: PartnerLogoItem[];
  magangGallery?: MagangGalleryItem[];
  magangPositions?: MagangPositionItem[];
  onOpenAbout: () => void;
  onNavigateTarget: (target: string) => void;
  onViewAllNews: () => void;
  onSelectArticle: (articleId: string) => void;
}

const GOV_EMBLEM_ICONS: Record<'ledger' | 'prism' | 'pillar' | 'bridge', string> = {
  ledger: 'mdi:shield-check-outline',
  prism: 'mdi:cube-outline',
  pillar: 'mdi:office-building-outline',
  bridge: 'mdi:handshake-outline',
};

function BuilderActionLink({
  label,
  href,
  variant = 'primary',
  onNavigateTarget,
}: {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary' | 'dark-primary' | 'dark-secondary';
  onNavigateTarget: (target: string) => void;
}) {
  const safeHref = sanitizeBuilderHref(href);
  if (!label.trim() || !safeHref) return null;
  const isExternal = /^https?:\/\//i.test(safeHref);

  const classMap = {
    primary:
      'inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] border border-[#C9A45A]/45 text-sm font-normal transition-colors whitespace-nowrap shrink-0',
    secondary:
      'inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-[#F6F3EC] text-[#164234] border border-[#C9A45A]/40 text-sm font-normal transition-colors whitespace-nowrap shrink-0',
    'dark-primary':
      'inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F4D993] hover:bg-[#FAF8F3] text-[#164234] text-sm font-normal transition-colors whitespace-nowrap shrink-0',
    'dark-secondary':
      'inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF8F3] border border-[#F4D993]/40 text-sm font-normal transition-colors whitespace-nowrap shrink-0',
  };

  return (
    <a
      href={safeHref}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      onClick={(e) => {
        if (
          isExternal ||
          safeHref.startsWith('mailto:') ||
          safeHref.startsWith('tel:') ||
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey ||
          e.button !== 0
        ) {
          return;
        }
        e.preventDefault();
        onNavigateTarget(safeHref);
      }}
      className={classMap[variant]}
    >
      <span>{label}</span>
      <Icon
        icon="mdi:arrow-top-right"
        className={`w-4 h-4 ${
          variant === 'primary'
            ? 'text-[#F4D993]'
            : variant === 'dark-primary'
              ? 'text-[#164234]'
              : ''
        }`}
      />
    </a>
  );
}

export function HomePageRenderer({
  pageSlug = 'home',
  blocks,
  settings,
  newsArticles,
  newsCategories,
  partnerLogos,
  magangGallery = [],
  magangPositions = [],
  onOpenAbout,
  onNavigateTarget,
  onViewAllNews,
  onSelectArticle,
}: HomePageRendererProps) {
  const [failedMedia, setFailedMedia] = useState<Record<string, boolean>>({});

  const visibleBlocks = useMemo(() => {
    const source =
      blocks.length > 0 ? blocks : getDefaultBlocksWithIds(pageSlug);
    return source
      .filter((b) => b.isVisible !== false)
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
  }, [blocks, pageSlug]);

  const firstBlockIsHero =
    visibleBlocks[0]?.blockType === 'hero' ||
    visibleBlocks[0]?.blockType === 'page_hero';

  let seenWhoWeAre = false;
  let seenNews = false;
  let seenLocation = false;

  return (
    <main className="min-h-screen bg-[#F6F3EC] flex flex-col">
      <div
        className={`flex-1 flex flex-col ${
          !firstBlockIsHero ? 'pt-24 md:pt-28' : ''
        }`}
      >
        {visibleBlocks.map((block, blockIndex) => {
          const cfg = (block.config || {}) as Record<string, unknown>;

          if (block.blockType === 'hero') {
            const heroCfg = cfg as Partial<HomeHeroBlockConfig>;
            const safeCornerHref =
              sanitizeBuilderHref(heroCfg.cornerHref) || '/tentang-kami';
            return (
              <Hero
                key={`hb-${block.id}`}
                title={heroCfg.title || settings.hero_title}
                subtitle={heroCfg.subtitle || settings.hero_subtitle}
                imageUrl={
                  sanitizeBuilderMediaUrl(heroCfg.imageUrl) ||
                  settings.hero_image_url
                }
                cornerLabel={heroCfg.cornerLabel || 'Profil P2B'}
                cornerActionLabel={heroCfg.cornerActionLabel || 'Tentang Kami'}
                cornerHref={safeCornerHref}
                onOpenAbout={() => {
                  if (safeCornerHref === '/tentang-kami') {
                    onOpenAbout();
                  } else {
                    onNavigateTarget(safeCornerHref);
                  }
                }}
              />
            );
          }

          if (block.blockType === 'page_hero') {
            const phCfg = cfg as Partial<PageHeroBlockConfig>;
            const safeCornerHref =
              sanitizeBuilderHref(phCfg.cornerHref) || '/visi-misi';
            const topPadAfterPrev = blockIndex > 0 ? 'mt-4 md:mt-6' : '';
            return (
              <div key={`hb-${block.id}`} className={`${topPadAfterPrev} mb-8 md:mb-12`}>
                <PageHero
                  eyebrow={phCfg.eyebrow?.trim() || 'Profil Resmi · P2B UIN Salatiga'}
                  title={phCfg.title?.trim() || 'Pusat Pengembangan Bisnis'}
                  subtitle={
                    phCfg.subtitle?.trim() ||
                    'Penggerak pengembangan bisnis, optimalisasi aset, dan layanan komersial UIN Salatiga.'
                  }
                  imageSrc={
                    sanitizeBuilderMediaUrl(phCfg.imageUrl) ||
                    'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/Auditorium-Student-Centre-di-Salatiga.png'
                  }
                  imageAlt={phCfg.imageAlt?.trim() || phCfg.title?.trim()}
                  cornerLabel={phCfg.cornerLabel?.trim() || 'Arah Strategis'}
                  cornerActionLabel={phCfg.cornerActionLabel?.trim() || 'Selengkapnya'}
                  cornerHref={safeCornerHref}
                  onCornerClick={() => onNavigateTarget(safeCornerHref)}
                />
              </div>
            );
          }

          if (block.blockType === 'logo_marquee') {
            const marqueeCfg = cfg as Partial<HomeLogoMarqueeBlockConfig>;
            return (
              <LogoMarqueeSection
                key={`hb-${block.id}`}
                logos={partnerLogos}
                ariaLabel={
                  marqueeCfg.ariaLabel?.trim() ||
                  'Logo Mitra & Unit P2B UIN Salatiga'
                }
              />
            );
          }

          if (block.blockType === 'who_we_are') {
            const sectionId = seenWhoWeAre
              ? `who-we-are-${block.id}`
              : 'who-we-are';
            seenWhoWeAre = true;
            return (
              <WhoWeAre
                key={`hb-${block.id}`}
                sectionId={sectionId}
                settings={settings}
                blockConfig={cfg as Partial<HomeWhoWeAreBlockConfig>}
                onNavigateTarget={onNavigateTarget}
              />
            );
          }

          if (block.blockType === 'about_intro') {
            const introCfg = cfg as Partial<AboutIntroBlockConfig>;
            return (
              <section
                key={`hb-${block.id}`}
                id={`section-${block.id}`}
                className="w-full flex justify-center px-3 md:px-5 pb-10 md:pb-14 bg-[#F6F3EC]"
              >
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full max-w-[1536px] group relative overflow-hidden rounded-[1.5rem] md:rounded-[3rem] bg-white/60 backdrop-blur-xl border border-[#C9A45A]/30 p-6 sm:p-10 md:p-14 flex flex-col gap-8"
                >
                  <CardCornerPattern
                    index={2}
                    position="top-right"
                    sizeClassName="w-48 h-48 sm:w-56 sm:h-56"
                    opacityClassName="opacity-[0.14] group-hover:opacity-[0.22]"
                  />
                  <div className="relative z-10 flex flex-col gap-2 max-w-4xl">
                    {introCfg.eyebrow?.trim() && (
                      <span className="text-xs md:text-sm font-normal text-[#8F6D26] uppercase tracking-wider">
                        {introCfg.eyebrow.trim()}
                      </span>
                    )}
                    <ScrollWordTitle
                      as="h2"
                      text={
                        introCfg.heading?.trim() ||
                        'Mengenal Pusat Pengembangan Bisnis (P2B) UIN Salatiga'
                      }
                      className="text-2xl sm:text-3xl md:text-4xl font-normal text-[#164234] tracking-tight leading-[1.12]"
                    />
                  </div>

                  <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 text-sm sm:text-base md:text-[17px] text-[#3E544B] leading-relaxed">
                    <div className="flex flex-col gap-4">
                      {introCfg.p1?.trim() && <p>{introCfg.p1.trim()}</p>}
                      {introCfg.p2?.trim() && <p>{introCfg.p2.trim()}</p>}
                    </div>
                    <div className="flex flex-col gap-4">
                      {introCfg.p3?.trim() && <p>{introCfg.p3.trim()}</p>}
                      {introCfg.p4?.trim() && <p>{introCfg.p4.trim()}</p>}
                    </div>
                  </div>
                </motion.div>
              </section>
            );
          }

          if (block.blockType === 'dual_banners') {
            const banCfg = cfg as Partial<DualBannersBlockConfig>;
            const img1 = sanitizeBuilderMediaUrl(banCfg.image1Url);
            const img2 = sanitizeBuilderMediaUrl(banCfg.image2Url);
            const key1 = `db1-${block.id}`;
            const key2 = `db2-${block.id}`;

            return (
              <section
                key={`hb-${block.id}`}
                id={`section-${block.id}`}
                className="w-full flex justify-center px-3 md:px-5 pb-10 md:pb-14 bg-[#F6F3EC]"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full max-w-[1536px] grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6"
                >
                  <div className="relative aspect-[4/3] rounded-[1.5rem] md:rounded-[3rem] overflow-hidden border border-[#C9A45A]/25 bg-[#EAE5D7]">
                    {img1 && !failedMedia[key1] ? (
                      <img
                        src={img1}
                        alt={banCfg.image1Alt?.trim() || 'Fasilitas P2B UIN Salatiga'}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setFailedMedia((prev) => ({ ...prev, [key1]: true }))
                        }
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm text-[#3E544B]">
                        {banCfg.image1Alt || 'Foto Banner 1'}
                      </div>
                    )}
                  </div>

                  <div className="relative aspect-[4/3] rounded-[1.5rem] md:rounded-[3rem] overflow-hidden border border-[#C9A45A]/25 bg-[#EAE5D7]">
                    {img2 && !failedMedia[key2] ? (
                      <img
                        src={img2}
                        alt={banCfg.image2Alt?.trim() || 'Kolaborasi P2B UIN Salatiga'}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setFailedMedia((prev) => ({ ...prev, [key2]: true }))
                        }
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm text-[#3E544B]">
                        {banCfg.image2Alt || 'Foto Banner 2'}
                      </div>
                    )}
                  </div>
                </motion.div>
              </section>
            );
          }

          if (block.blockType === 'governance_values') {
            const govCfg = cfg as Partial<GovernanceValuesBlockConfig>;
            const items = Array.isArray(govCfg.items)
              ? (govCfg.items as GovernanceValueEntry[])
              : [];

            return (
              <section
                key={`hb-${block.id}`}
                id={`section-${block.id}`}
                className="w-full flex justify-center px-3 md:px-5 pb-12 md:pb-20 bg-[#F6F3EC]"
              >
                <div className="w-full max-w-[1536px] flex flex-col gap-6">
                  <div className="px-3 md:px-6 flex flex-col gap-1.5">
                    {govCfg.eyebrow?.trim() && (
                      <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                        {govCfg.eyebrow.trim()}
                      </span>
                    )}
                    {govCfg.heading?.trim() && (
                      <ScrollWordTitle
                        as="h2"
                        text={govCfg.heading.trim()}
                        className="text-2xl sm:text-3xl md:text-4xl font-normal text-[#164234] tracking-tight"
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                    {items.map((item, idx) => {
                      const safeHref =
                        sanitizeBuilderHref(item.linkHref) || '/visi-misi';
                      const emblemIcon =
                        GOV_EMBLEM_ICONS[item.emblem] || GOV_EMBLEM_ICONS.ledger;
                      const isExternal = /^https?:\/\//i.test(safeHref);
                      return (
                        <div
                          key={item.id || `gv-${idx}`}
                          className="group relative bg-[#FAF8F3]/95 rounded-[30px] border border-[#C9A45A]/30 hover:border-[#C9A45A]/65 min-h-[280px] flex flex-col justify-between p-7 sm:p-8 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_44px_-22px_rgba(22,66,52,0.2)] overflow-hidden"
                        >
                          <CardCornerPattern
                            index={idx}
                            position="bottom-right"
                            sizeClassName="w-44 h-44 sm:w-48 sm:h-48"
                            opacityClassName="opacity-[0.18] group-hover:opacity-[0.28]"
                          />

                          <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full bg-radial from-[#C9A45A]/12 via-[#C9A45A]/4 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-500"
                          />

                          <div className="relative z-10 flex items-start justify-between gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#EAE3D2]/75 border border-[#C9A45A]/35 flex items-center justify-center text-[#164234] transition-transform duration-300 group-hover:scale-105">
                              <Icon icon={emblemIcon} className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-normal tracking-[0.18em] text-[#8F6D26]/80 tabular-nums pt-1">
                              {item.number || String(idx + 1).padStart(2, '0')}
                            </span>
                          </div>

                          <div className="relative z-10 mt-6 mb-7 text-left">
                            <ScrollWordTitle
                              as="h3"
                              text={item.title || `Nilai ${idx + 1}`}
                              start="top 92%"
                              duration={0.58}
                              className="text-xl sm:text-2xl font-normal text-[#164234] tracking-tight leading-snug"
                            />
                            {item.description?.trim() && (
                              <p className="mt-2.5 text-sm sm:text-[15px] text-[#3E544B] leading-relaxed max-w-xl">
                                {item.description.trim()}
                              </p>
                            )}
                          </div>

                          {item.linkLabel?.trim() && (
                            <div className="relative z-10 flex items-center justify-between">
                              <a
                                href={safeHref}
                                target={isExternal ? '_blank' : undefined}
                                rel={isExternal ? 'noopener noreferrer' : undefined}
                                onClick={(e) => {
                                  if (
                                    isExternal ||
                                    e.metaKey ||
                                    e.ctrlKey ||
                                    e.shiftKey ||
                                    e.altKey ||
                                    e.button !== 0
                                  ) {
                                    return;
                                  }
                                  e.preventDefault();
                                  onNavigateTarget(safeHref);
                                }}
                                aria-label={`Pelajari ${item.title}`}
                                className="inline-flex items-center gap-3 group/link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#164234] rounded-full"
                              >
                                <span className="w-10 h-10 rounded-full bg-[#EAE3D2] text-[#164234] group-hover:bg-[#164234] group-hover:text-[#FAF8F3] flex items-center justify-center ring-0 group-hover:ring-4 ring-[#C9A45A]/25 transition-all duration-500 ease-out">
                                  <Icon
                                    icon="mdi:arrow-top-right"
                                    className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
                                  />
                                </span>
                                <span className="text-xs font-medium tracking-wide text-[#8F6D26] opacity-0 -translate-x-1.5 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                  {item.linkLabel.trim()}
                                </span>
                              </a>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          }

          if (block.blockType === 'misi_grid') {
            const misiCfg = cfg as Partial<MisiGridBlockConfig>;
            const items = Array.isArray(misiCfg.items)
              ? (misiCfg.items as MisiItemEntry[])
              : [];
            return (
              <section
                key={`hb-${block.id}`}
                id={`section-${block.id}`}
                className="w-full flex justify-center px-3 md:px-5 pb-12 md:pb-20 bg-[#F6F3EC]"
              >
                <div className="w-full max-w-[1536px] flex flex-col gap-6">
                  <div className="px-3 md:px-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex flex-col gap-1.5">
                      {misiCfg.eyebrow?.trim() && (
                        <span className="text-xs uppercase tracking-wider text-[#8F6D26] inline-flex items-center gap-1.5">
                          <Icon icon="mdi:target" className="w-3.5 h-3.5" />
                          <span>{misiCfg.eyebrow.trim()}</span>
                        </span>
                      )}
                      <ScrollWordTitle
                        as="h2"
                        text={
                          misiCfg.heading?.trim() ||
                          'Lima Fokus Misi Pengembangan Bisnis'
                        }
                        className="text-2xl sm:text-3xl md:text-4xl font-normal text-[#164234] tracking-tight"
                      />
                    </div>

                    {misiCfg.description?.trim() && (
                      <p className="text-sm sm:text-base text-[#3E544B] max-w-md leading-relaxed">
                        {misiCfg.description.trim()}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {items.map((misi, idx) => (
                      <div
                        key={misi.id || `misi-${idx}`}
                        className="group relative overflow-hidden rounded-[1.5rem] md:rounded-[2.25rem] bg-white/65 backdrop-blur-xl border border-[#C9A45A]/25 hover:border-[#C9A45A]/55 p-6 md:p-8 flex flex-col gap-3 transition-colors"
                      >
                        <CardCornerPattern
                          index={idx}
                          position={idx % 2 === 0 ? 'bottom-right' : 'top-right'}
                          sizeClassName="w-36 h-36 sm:w-40 sm:h-40"
                          opacityClassName="opacity-[0.15] group-hover:opacity-[0.25]"
                        />
                        <span className="relative z-10 text-xs font-normal tracking-widest text-[#8F6D26] tabular-nums">
                          MISI {misi.number || String(idx + 1).padStart(2, '0')}
                        </span>
                        <ScrollWordTitle
                          as="h3"
                          text={misi.title || `Misi ${idx + 1}`}
                          start="top 92%"
                          duration={0.58}
                          className="relative z-10 text-xl font-normal text-[#164234] tracking-tight leading-snug"
                        />
                        {misi.description?.trim() && (
                          <p className="relative z-10 text-sm md:text-base text-[#3E544B] leading-relaxed">
                            {misi.description.trim()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          }

          if (block.blockType === 'org_chart') {
            const orgCfg = cfg as Partial<OrgChartBlockConfig>;
            return (
              <div
                key={`hb-${block.id}`}
                id={`section-${block.id}`}
                className="w-full flex justify-center px-3 md:px-5 pb-10 md:pb-14 bg-[#F6F3EC]"
              >
                <div className="w-full max-w-[1536px]">
                  <OrgChartSection
                    eyebrow={orgCfg.eyebrow}
                    heading={orgCfg.heading}
                    legalEyebrow={orgCfg.legalEyebrow}
                    legalTitle={orgCfg.legalTitle}
                    decreeLabel={orgCfg.decreeLabel}
                    pdfUrl={orgCfg.pdfUrl}
                  />
                </div>
              </div>
            );
          }

          if (block.blockType === 'unit_divisions') {
            const divCfg = cfg as Partial<UnitDivisionsBlockConfig>;
            const items = Array.isArray(divCfg.items)
              ? (divCfg.items as UnitDivisionEntry[])
              : [];

            return (
              <section
                key={`hb-${block.id}`}
                id={`section-${block.id}`}
                className="w-full flex justify-center px-3 md:px-5 pb-12 md:pb-20 bg-[#F6F3EC]"
              >
                <div className="w-full max-w-[1536px] flex flex-col gap-6">
                  <div className="px-3 md:px-6 flex flex-col gap-1.5">
                    {divCfg.eyebrow?.trim() && (
                      <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                        {divCfg.eyebrow.trim()}
                      </span>
                    )}
                    {divCfg.heading?.trim() && (
                      <ScrollWordTitle
                        as="h2"
                        text={divCfg.heading.trim()}
                        className="text-2xl sm:text-3xl md:text-4xl font-normal text-[#164234] tracking-tight"
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {items.map((div, idx) => (
                      <div
                        key={div.id || `div-${idx}`}
                        className="group relative overflow-hidden rounded-[1.5rem] md:rounded-[2.25rem] bg-white/75 border border-[#C9A45A]/25 hover:border-[#C9A45A]/55 p-6 md:p-8 flex flex-col gap-4 transition-colors"
                      >
                        <CardCornerPattern
                          index={idx}
                          position="bottom-right"
                          sizeClassName="w-44 h-44 sm:w-48 sm:h-48"
                          opacityClassName="opacity-[0.14] group-hover:opacity-[0.24]"
                        />
                        <div className="relative z-10 flex items-center justify-between gap-3">
                          <div className="w-11 h-11 rounded-xl bg-[rgba(201,164,90,0.16)] border border-[#C9A45A]/35 flex items-center justify-center shrink-0">
                            <Icon
                              icon={div.icon || 'mdi:office-building-outline'}
                              className="w-5 h-5 text-[#164234]"
                            />
                          </div>
                          <span className="text-xs tracking-widest text-[#8F6D26] tabular-nums">
                            {div.code || `UNIT ${String(idx + 1).padStart(2, '0')}`}
                          </span>
                        </div>

                        <ScrollWordTitle
                          as="h3"
                          text={div.title || `Unit ${idx + 1}`}
                          start="top 92%"
                          duration={0.58}
                          className="relative z-10 text-xl font-normal text-[#164234] tracking-tight"
                        />

                        {Array.isArray(div.responsibilities) &&
                          div.responsibilities.length > 0 && (
                            <ul className="relative z-10 flex flex-col gap-2 text-sm text-[#3E544B] leading-relaxed">
                              {div.responsibilities.map((item, rIdx) => (
                                <li
                                  key={`${div.id || idx}-r-${rIdx}`}
                                  className="px-3.5 py-2.5 rounded-2xl bg-[#F6F3EC]/85 border border-[#C9A45A]/20"
                                >
                                  {item}
                                </li>
                              ))}
                            </ul>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          }

          if (block.blockType === 'news_updates') {
            const newsCfg = cfg as Partial<HomeNewsBlockConfig>;
            const sectionId = seenNews
              ? `news-updates-${block.id}`
              : 'news-updates';
            seenNews = true;
            return (
              <NewsSection
                key={`hb-${block.id}`}
                sectionId={sectionId}
                articles={newsArticles}
                categories={newsCategories}
                eyebrow={newsCfg.eyebrow}
                heading={newsCfg.heading}
                ctaLabel={newsCfg.ctaLabel}
                maxItems={newsCfg.maxItems}
                onViewAllNews={onViewAllNews}
                onSelectArticle={onSelectArticle}
              />
            );
          }

          if (block.blockType === 'location_map') {
            const sectionId = seenLocation
              ? `lokasi-p2b-${block.id}`
              : 'lokasi-p2b';
            seenLocation = true;
            return (
              <LocationSection
                key={`hb-${block.id}`}
                sectionId={sectionId}
                addressText={settings.location_address}
                settings={settings}
                blockConfig={cfg as Partial<HomeLocationBlockConfig>}
              />
            );
          }

          if (block.blockType === 'visi_card') {
            return (
              <div
                key={`hb-${block.id}`}
                className="w-full flex justify-center px-3 md:px-5 pb-10 md:pb-14 bg-[#F6F3EC]"
              >
                <div className="w-full max-w-[1536px]">
                  <VisiCard
                    settings={settings}
                    blockConfig={cfg as Partial<HomeVisiBlockConfig>}
                  />
                </div>
              </div>
            );
          }

          if (block.blockType === 'magang_gallery') {
            const mgCfg = cfg as Partial<MagangGalleryBlockConfig>;
            const maxItems = Math.max(1, Math.min(12, Number(mgCfg.maxItems ?? 6)));
            const items = magangGallery.slice(0, maxItems);
            return (
              <section
                key={`hb-${block.id}`}
                id={`section-${block.id}`}
                className="w-full flex justify-center px-3 md:px-5 pb-12 md:pb-20 bg-[#F6F3EC]"
              >
                <div className="w-full max-w-[1536px] flex flex-col gap-6">
                  <div className="px-3 md:px-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex flex-col gap-1.5">
                      {mgCfg.eyebrow?.trim() && (
                        <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                          {mgCfg.eyebrow.trim()}
                        </span>
                      )}
                      <ScrollWordTitle
                        as="h2"
                        text={mgCfg.heading?.trim() || 'Keseharian Tim & Mahasiswa Magang'}
                        className="text-2xl sm:text-3xl md:text-4xl font-normal text-[#164234] tracking-tight"
                      />
                    </div>
                    {mgCfg.description?.trim() && (
                      <p className="text-sm text-[#3E544B] max-w-md">
                        {mgCfg.description.trim()}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {items.map((item) => (
                      <article
                        key={item.id}
                        className="rounded-[1.5rem] bg-[#FAF8F3] border border-[#C9A45A]/30 overflow-hidden flex flex-col"
                      >
                        <div className="aspect-[16/10] bg-[#EAE5D7] overflow-hidden">
                          <img
                            src={item.imageUrl}
                            alt={item.altText || item.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-5 flex flex-col gap-1">
                          <h3 className="text-base sm:text-lg font-normal text-[#164234]">
                            {item.title}
                          </h3>
                          {item.caption && (
                            <p className="text-xs sm:text-sm text-[#3E544B] leading-relaxed">
                              {item.caption}
                            </p>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            );
          }

          if (block.blockType === 'magang_positions') {
            const mpCfg = cfg as Partial<MagangPositionsBlockConfig>;
            return (
              <section
                key={`hb-${block.id}`}
                id={`section-${block.id}`}
                className="w-full flex justify-center px-3 md:px-5 pb-12 md:pb-20 bg-[#F6F3EC]"
              >
                <div className="w-full max-w-[1536px] flex flex-col gap-6">
                  <div className="px-3 md:px-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex flex-col gap-1.5">
                      {mpCfg.eyebrow?.trim() && (
                        <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                          {mpCfg.eyebrow.trim()}
                        </span>
                      )}
                      <ScrollWordTitle
                        as="h2"
                        text={mpCfg.heading?.trim() || 'Bidang & Posisi Magang P2B'}
                        className="text-2xl sm:text-3xl md:text-4xl font-normal text-[#164234] tracking-tight"
                      />
                      {mpCfg.description?.trim() && (
                        <p className="text-sm text-[#3E544B] max-w-xl">
                          {mpCfg.description.trim()}
                        </p>
                      )}
                    </div>

                    {mpCfg.ctaLabel?.trim() && mpCfg.ctaHref?.trim() && (
                      <BuilderActionLink
                        label={mpCfg.ctaLabel}
                        href={mpCfg.ctaHref}
                        variant="primary"
                        onNavigateTarget={onNavigateTarget}
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {magangPositions.map((pos) => (
                      <article
                        key={pos.id}
                        className="rounded-[1.5rem] bg-[#FAF8F3] border border-[#C9A45A]/30 p-6 flex flex-col justify-between gap-4"
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="uppercase tracking-wider text-[#8F6D26]">
                              {pos.division}
                            </span>
                            <span
                              className={
                                pos.isAvailable
                                  ? 'text-[#164234]'
                                  : 'text-[#9b2c2c]'
                              }
                            >
                              {pos.isAvailable ? 'Dibuka' : 'Penuh'}
                            </span>
                          </div>
                          <h3 className="text-xl font-normal text-[#164234]">
                            {pos.title}
                          </h3>
                          <p className="text-sm text-[#3E544B] leading-relaxed">
                            {pos.description}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-[#C9A45A]/20">
                          <BuilderActionLink
                            label="Detail & Pendaftaran"
                            href="/magang"
                            variant="secondary"
                            onNavigateTarget={onNavigateTarget}
                          />
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            );
          }

          if (block.blockType === 'editorial_split') {
            const splitCfg = cfg as Partial<HomeEditorialSplitBlockConfig>;
            const safeImg = sanitizeBuilderMediaUrl(splitCfg.imageUrl);
            const imgKey = `split-${block.id}`;
            const imgLeft = splitCfg.imagePosition === 'left';
            const paragraphs = String(splitCfg.body || '')
              .split(/\n\s*\n/)
              .map((p) => p.trim())
              .filter(Boolean);

            return (
              <section
                key={`hb-${block.id}`}
                id={`section-${block.id}`}
                className="w-full flex justify-center px-3 md:px-5 pb-12 md:pb-20 bg-[#F6F3EC]"
              >
                <div className="w-full max-w-[1536px] rounded-[1.5rem] md:rounded-[3rem] bg-[#FAF8F3] border border-[#C9A45A]/30 p-6 sm:p-9 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
                  <div
                    className={`lg:col-span-6 flex flex-col justify-between gap-6 ${
                      imgLeft ? 'lg:order-2' : 'lg:order-1'
                    }`}
                  >
                    <div className="flex flex-col gap-3">
                      {splitCfg.eyebrow?.trim() && (
                        <span className="text-xs md:text-sm font-normal text-[#8F6D26] uppercase tracking-wider">
                          {splitCfg.eyebrow.trim()}
                        </span>
                      )}
                      <ScrollWordTitle
                        as="h2"
                        text={
                          splitCfg.heading?.trim() ||
                          'Sinergi Layanan & Program P2B'
                        }
                        className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-normal text-[#164234] tracking-tight leading-[1.12] text-balance"
                      />
                      <div className="flex flex-col gap-3 text-sm sm:text-base text-[#3E544B] leading-relaxed mt-1">
                        {paragraphs.map((p, idx) => (
                          <p key={`${block.id}-p-${idx}`}>{p}</p>
                        ))}
                      </div>
                    </div>

                    {splitCfg.ctaLabel?.trim() && splitCfg.ctaHref?.trim() && (
                      <div className="pt-2">
                        <BuilderActionLink
                          label={splitCfg.ctaLabel}
                          href={splitCfg.ctaHref}
                          variant="primary"
                          onNavigateTarget={onNavigateTarget}
                        />
                      </div>
                    )}
                  </div>

                  <div
                    className={`lg:col-span-6 relative min-h-[260px] sm:min-h-[340px] rounded-[1.25rem] md:rounded-[2rem] overflow-hidden border border-[#C9A45A]/25 bg-gradient-to-br from-[#EAE5D7] via-[#E1E7DF] to-[#D4DED6] ${
                      imgLeft ? 'lg:order-1' : 'lg:order-2'
                    }`}
                  >
                    {safeImg && !failedMedia[imgKey] ? (
                      <img
                        src={safeImg}
                        alt={
                          splitCfg.imageAlt?.trim() ||
                          splitCfg.heading?.trim() ||
                          'Ilustrasi P2B UIN Salatiga'
                        }
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setFailedMedia((prev) => ({ ...prev, [imgKey]: true }))
                        }
                        className="w-full h-full object-cover lg:absolute lg:inset-0"
                      />
                    ) : (
                      <div className="w-full h-full min-h-[260px] flex flex-col items-center justify-center gap-2 text-[#164234]/60 p-6">
                        <Icon icon="mdi:layers-outline" className="w-9 h-9" />
                        <span className="text-sm text-center">
                          {splitCfg.heading?.trim() || 'P2B UIN Salatiga'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            );
          }

          if (block.blockType === 'feature_cards') {
            const fcCfg = cfg as Partial<HomeFeatureCardsBlockConfig>;
            const cards = Array.isArray(fcCfg.cards)
              ? (fcCfg.cards as HomeFeatureCardEntry[])
              : [];
            const gridCols =
              fcCfg.columns === 2
                ? 'grid-cols-1 md:grid-cols-2'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

            return (
              <section
                key={`hb-${block.id}`}
                id={`section-${block.id}`}
                className="w-full flex justify-center px-3 md:px-5 pb-12 md:pb-20 bg-[#F6F3EC]"
              >
                <div className="w-full max-w-[1536px] flex flex-col gap-8">
                  {(fcCfg.eyebrow?.trim() ||
                    fcCfg.heading?.trim() ||
                    fcCfg.description?.trim()) && (
                    <div className="px-3 md:px-6 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-12">
                      <div className="flex flex-col gap-2">
                        {fcCfg.eyebrow?.trim() && (
                          <span className="text-xs md:text-sm font-normal text-[#8F6D26] uppercase tracking-wider">
                            {fcCfg.eyebrow.trim()}
                          </span>
                        )}
                        {fcCfg.heading?.trim() && (
                          <ScrollWordTitle
                            as="h2"
                            text={fcCfg.heading.trim()}
                            className="text-3xl sm:text-4xl md:text-5xl font-normal text-[#164234] tracking-tight leading-[1.08]"
                          />
                        )}
                      </div>
                      {fcCfg.description?.trim() && (
                        <p className="text-sm sm:text-base text-[#3E544B] leading-relaxed max-w-xl">
                          {fcCfg.description.trim()}
                        </p>
                      )}
                    </div>
                  )}

                  <div className={`grid ${gridCols} gap-4 md:gap-6`}>
                    {cards.map((card, idx) => {
                      const cardImg = sanitizeBuilderMediaUrl(card.imageUrl);
                      const cardImgKey = `fc-${block.id}-${card.id || idx}`;
                      const safeHref = sanitizeBuilderHref(card.linkHref);
                      const isExternal = /^https?:\/\//i.test(safeHref);
                      return (
                        <article
                          key={card.id || `fc-card-${idx}`}
                          className="rounded-[1.5rem] md:rounded-[2rem] bg-[#FAF8F3] border border-[#C9A45A]/30 overflow-hidden flex flex-col justify-between p-6 sm:p-7 gap-5"
                        >
                          <div className="flex flex-col gap-4">
                            {cardImg && !failedMedia[cardImgKey] && (
                              <div className="aspect-[16/9] rounded-2xl overflow-hidden border border-[#C9A45A]/20 bg-[#EAE5D7]">
                                <img
                                  src={cardImg}
                                  alt={card.title || 'Layanan P2B'}
                                  referrerPolicy="no-referrer"
                                  onError={() =>
                                    setFailedMedia((prev) => ({
                                      ...prev,
                                      [cardImgKey]: true,
                                    }))
                                  }
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}

                            <div className="flex flex-col gap-2">
                              {card.kicker?.trim() && (
                                <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                                  {card.kicker.trim()}
                                </span>
                              )}
                              <h3 className="text-xl sm:text-2xl font-normal text-[#164234] leading-snug">
                                {card.title?.trim() || `Kartu ${idx + 1}`}
                              </h3>
                              {card.description?.trim() && (
                                <p className="text-sm text-[#3E544B] leading-relaxed">
                                  {card.description.trim()}
                                </p>
                              )}
                            </div>
                          </div>

                          {card.linkLabel?.trim() && safeHref && (
                            <div className="pt-2 border-t border-[#C9A45A]/20">
                              <a
                                href={safeHref}
                                target={isExternal ? '_blank' : undefined}
                                rel={
                                  isExternal ? 'noopener noreferrer' : undefined
                                }
                                onClick={(e) => {
                                  if (
                                    isExternal ||
                                    safeHref.startsWith('mailto:') ||
                                    safeHref.startsWith('tel:') ||
                                    e.metaKey ||
                                    e.ctrlKey ||
                                    e.shiftKey ||
                                    e.altKey ||
                                    e.button !== 0
                                  ) {
                                    return;
                                  }
                                  e.preventDefault();
                                  onNavigateTarget(safeHref);
                                }}
                                className="inline-flex items-center gap-1.5 text-sm text-[#164234] hover:text-[#8F6D26] transition-colors"
                              >
                                <span>{card.linkLabel.trim()}</span>
                                <Icon
                                  icon="mdi:arrow-top-right"
                                  className="w-4 h-4"
                                />
                              </a>
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          }

          if (block.blockType === 'cta_banner') {
            const ctaCfg = cfg as Partial<HomeCtaBannerBlockConfig>;
            return (
              <section
                key={`hb-${block.id}`}
                id={`section-${block.id}`}
                className="w-full flex justify-center px-3 md:px-5 pb-12 md:pb-16 bg-[#F6F3EC]"
              >
                <div className="w-full max-w-[1536px] group relative overflow-hidden rounded-[1.5rem] md:rounded-[3rem] bg-gradient-to-br from-[#0F3126] via-[#164234] to-[#1D5442] border border-[#C9A45A]/35 p-7 sm:p-10 md:p-14 text-[#FAF8F3] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <CardCornerPattern
                    index={2}
                    position="top-right"
                    sizeClassName="w-48 h-48 sm:w-64 sm:h-64"
                    opacityClassName="opacity-[0.14] group-hover:opacity-[0.22]"
                  />
                  <div className="relative z-10 flex flex-col gap-3 max-w-3xl">
                    {ctaCfg.eyebrow?.trim() && (
                      <span className="text-xs md:text-sm uppercase tracking-[0.16em] text-[#F4D993]">
                        {ctaCfg.eyebrow.trim()}
                      </span>
                    )}
                    <ScrollWordTitle
                      as="h2"
                      text={
                        ctaCfg.heading?.trim() ||
                        'Kolaborasi & Layanan P2B UIN Salatiga'
                      }
                      className="text-2xl sm:text-3xl md:text-4xl font-normal tracking-tight leading-[1.16] text-balance"
                    />
                    {ctaCfg.description?.trim() && (
                      <p className="text-sm sm:text-base text-[#F6F3EC]/85 leading-relaxed">
                        {ctaCfg.description.trim()}
                      </p>
                    )}
                  </div>

                  <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
                    {ctaCfg.primaryLabel?.trim() &&
                      ctaCfg.primaryHref?.trim() && (
                        <BuilderActionLink
                          label={ctaCfg.primaryLabel}
                          href={ctaCfg.primaryHref}
                          variant="dark-primary"
                          onNavigateTarget={onNavigateTarget}
                        />
                      )}
                    {ctaCfg.secondaryLabel?.trim() &&
                      ctaCfg.secondaryHref?.trim() && (
                        <BuilderActionLink
                          label={ctaCfg.secondaryLabel}
                          href={ctaCfg.secondaryHref}
                          variant="dark-secondary"
                          onNavigateTarget={onNavigateTarget}
                        />
                      )}
                  </div>
                </div>
              </section>
            );
          }

          if (block.blockType === 'stats_row') {
            const statsCfg = cfg as Partial<HomeStatsRowBlockConfig>;
            const stats = Array.isArray(statsCfg.stats)
              ? (statsCfg.stats as HomeStatEntry[])
              : [];
            return (
              <section
                key={`hb-${block.id}`}
                id={`section-${block.id}`}
                className="w-full flex justify-center px-3 md:px-5 pb-12 md:pb-20 bg-[#F6F3EC]"
              >
                <div className="w-full max-w-[1536px] rounded-[1.5rem] md:rounded-[2.5rem] bg-[#FAF8F3] border border-[#C9A45A]/30 p-6 sm:p-9 md:p-11 flex flex-col gap-6">
                  {(statsCfg.eyebrow?.trim() || statsCfg.heading?.trim()) && (
                    <div className="flex flex-col gap-1.5 border-b border-[#C9A45A]/20 pb-5">
                      {statsCfg.eyebrow?.trim() && (
                        <span className="text-xs uppercase tracking-wider text-[#8F6D26]">
                          {statsCfg.eyebrow.trim()}
                        </span>
                      )}
                      {statsCfg.heading?.trim() && (
                        <h2 className="text-2xl sm:text-3xl font-normal text-[#164234] tracking-tight">
                          {statsCfg.heading.trim()}
                        </h2>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {stats.map((stat, idx) => (
                      <div
                        key={stat.id || `stat-${idx}`}
                        className="flex flex-col gap-1.5"
                      >
                        <span className="text-3xl sm:text-4xl md:text-5xl font-normal text-[#164234] tabular-nums tracking-tight">
                          {stat.value?.trim() || '—'}
                        </span>
                        <span className="text-sm sm:text-base font-medium text-[#164234]">
                          {stat.label?.trim() || `Metrik ${idx + 1}`}
                        </span>
                        {stat.note?.trim() && (
                          <p className="text-xs sm:text-sm text-[#3E544B] leading-relaxed">
                            {stat.note.trim()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          }

          return null;
        })}
      </div>

      <Footer
        settings={settings}
        onNavigate={(target) => {
          if (target === 'who-we-are') {
            onOpenAbout();
            return;
          }
          if (target === 'top') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }
          document
            .getElementById(target)
            ?.scrollIntoView({ behavior: 'smooth' });
        }}
      />
    </main>
  );
}
