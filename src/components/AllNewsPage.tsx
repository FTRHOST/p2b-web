import { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { motion } from 'motion/react';
import { ScrollTrigger } from '../lib/gsap';
import {
  allNewsArticles,
  DEFAULT_NEWS_CATEGORIES,
  NewsArticle,
  NewsCategory,
} from '../data/news';
import { PageHero } from './PageHero';
import { Footer } from './Footer';
import { EditorialNewsCard } from './EditorialNewsCard';

const ITEMS_PER_PAGE = 6;

function getPageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, idx) => idx + 1);
  }
  const pages: (number | 'ellipsis')[] = [1];
  if (currentPage > 3) pages.push('ellipsis');

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let p = start; p <= end; p++) {
    pages.push(p);
  }

  if (currentPage < totalPages - 2) pages.push('ellipsis');
  pages.push(totalPages);
  return pages;
}

interface AllNewsPageProps {
  articles?: NewsArticle[];
  categories?: string[];
  onBackHome: () => void;
  onSelectArticle: (articleId: string) => void;
  onNavigateSection: (target: 'top' | 'who-we-are' | 'news-updates' | 'lokasi-p2b') => void;
}

export function AllNewsPage({
  articles = allNewsArticles,
  categories: customCategories,
  onBackHome,
  onSelectArticle,
  onNavigateSection,
}: AllNewsPageProps) {
  const archiveSectionRef = useRef<HTMLElement | null>(null);
  const [activeCategory, setActiveCategory] = useState<NewsCategory>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const baseCategories =
    customCategories && customCategories.length > 0
      ? customCategories
      : DEFAULT_NEWS_CATEGORIES;
  const categories: NewsCategory[] = [
    'Semua',
    ...Array.from(
      new Set([
        ...baseCategories,
        ...articles.map((item) => item.category).filter(Boolean),
      ])
    ),
  ];
  const safeActiveCategory = categories.includes(activeCategory)
    ? activeCategory
    : 'Semua';

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredArticles = articles.filter((article) => {
    const matchesCategory =
      safeActiveCategory === 'Semua' || article.category === safeActiveCategory;
    const matchesQuery =
      !normalizedQuery ||
      article.title.toLowerCase().includes(normalizedQuery) ||
      article.excerpt.toLowerCase().includes(normalizedQuery) ||
      article.category.toLowerCase().includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });

  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
  const safePage = Math.min(currentPage, Math.max(totalPages, 1));
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedArticles = filteredArticles.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );
  const pageNumbers = getPageNumbers(safePage, totalPages);

  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [safeActiveCategory, normalizedQuery, safePage, filteredArticles.length]);

  const handleCategoryChange = (category: NewsCategory) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === safePage) return;
    setCurrentPage(nextPage);
    archiveSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-[#F6F3EC] flex flex-col">
      <PageHero
        eyebrow="Arsip Berita Resmi · P2B UIN Salatiga"
        title="Semua Berita & Update"
        subtitle="Kumpulan lengkap rilis kegiatan, pengembangan fasilitas, inovasi layanan komersial, serta program kemitraan Pusat Pengembangan Bisnis UIN Salatiga."
        cornerLabel="Beranda Utama"
        cornerActionLabel="Kembali ke Beranda"
        cornerHref="#top"
        onCornerClick={onBackHome}
      />

      {/* Main Archive Content */}
      <section
        ref={archiveSectionRef}
        className="w-full flex justify-center px-3 md:px-5 pt-10 md:pt-14 pb-12 md:pb-20 flex-1 scroll-mt-24"
      >
        <div className="w-full max-w-[1536px] flex flex-col gap-8 md:gap-10">
          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="px-3 md:px-6 flex flex-col gap-4"
          >
            {/* Filter & Search Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div
                role="tablist"
                aria-label="Filter kategori arsip berita"
                className="flex items-center gap-1 p-1.5 rounded-full bg-white/70 backdrop-blur-md border border-[#C9A45A]/30 w-fit overflow-x-auto max-w-full"
              >
                {categories.map((category) => {
                  const isActive = safeActiveCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => handleCategoryChange(category)}
                      className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-normal transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-[#164234] text-[#F6F3EC]'
                          : 'text-[#3E544B] hover:text-[#164234] hover:bg-[#F6F3EC]/70'
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/75 backdrop-blur-md border border-[#C9A45A]/30 focus-within:border-[#164234] w-full sm:w-72 md:w-80 transition-colors">
                <Icon icon="mdi:magnify" className="w-4 h-4 text-[#B89242] shrink-0" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Cari berita atau layanan..."
                  aria-label="Cari berita"
                  className="w-full bg-transparent text-sm text-[#164234] placeholder:text-[#3E544B]/50 focus:outline-none min-w-0"
                />
              </div>
            </div>
          </motion.div>

          {/* All News Cards Grid (Max 6 per page) */}
          {filteredArticles.length === 0 ? (
            <div className="rounded-[1.5rem] md:rounded-[2.5rem] bg-white/55 backdrop-blur-xl border border-[#C9A45A]/25 p-10 text-center flex flex-col items-center gap-3">
              <Icon icon="mdi:newspaper-variant-outline" className="w-8 h-8 text-[#B89242]" />
              <p className="text-base text-[#164234]">
                Tidak ada berita yang cocok dengan kata kunci pencarian Anda.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('Semua');
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="px-5 py-2 rounded-full bg-[#164234] text-[#F6F3EC] text-sm cursor-pointer"
              >
                Tampilkan Semua Berita
              </button>
            </div>
          ) : (
            <>
              <ul className="nup-grid">
                {paginatedArticles.map((article, index) => (
                  <EditorialNewsCard
                    key={article.id}
                    article={article}
                    index={index}
                    imageFailed={Boolean(failedImages[article.id])}
                    onImageError={(id) =>
                      setFailedImages((prev) => ({ ...prev, [id]: true }))
                    }
                    onSelectArticle={onSelectArticle}
                    headingAs="h2"
                    animateOnMount
                  />
                ))}
              </ul>

              {/* Pagination Navigation (rendered when total articles exceed 6) */}
              {totalPages > 1 && (
                <nav
                  aria-label="Navigasi halaman berita"
                  className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 px-3 md:px-6"
                >
                  <span className="text-xs sm:text-sm text-[#3E544B] tabular-nums">
                    Menampilkan {startIndex + 1}–
                    {Math.min(startIndex + ITEMS_PER_PAGE, filteredArticles.length)}{' '}
                    dari {filteredArticles.length} berita
                  </span>

                  <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/75 backdrop-blur-xl border border-[#C9A45A]/30">
                    <button
                      type="button"
                      onClick={() => handlePageChange(safePage - 1)}
                      disabled={safePage === 1}
                      aria-label="Halaman sebelumnya"
                      className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-[#164234] hover:bg-[#F6F3EC] disabled:opacity-35 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <Icon icon="mdi:chevron-left" className="w-4 h-4" />
                    </button>

                    {pageNumbers.map((pageItem, idx) =>
                      pageItem === 'ellipsis' ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="w-8 text-center text-sm text-[#3E544B]/60 select-none"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={pageItem}
                          type="button"
                          onClick={() => handlePageChange(pageItem)}
                          aria-label={`Halaman ${pageItem}`}
                          aria-current={pageItem === safePage ? 'page' : undefined}
                          className={`inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-sm font-normal tabular-nums transition-colors cursor-pointer ${
                            pageItem === safePage
                              ? 'bg-[#164234] text-[#F6F3EC]'
                              : 'text-[#164234] hover:bg-[#F6F3EC]'
                          }`}
                        >
                          {pageItem}
                        </button>
                      )
                    )}

                    <button
                      type="button"
                      onClick={() => handlePageChange(safePage + 1)}
                      disabled={safePage === totalPages}
                      aria-label="Halaman berikutnya"
                      className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-[#164234] hover:bg-[#F6F3EC] disabled:opacity-35 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <Icon icon="mdi:chevron-right" className="w-4 h-4" />
                    </button>
                  </div>
                </nav>
              )}
            </>
          )}
        </div>
      </section>

      <Footer
        onNavigate={(target) => {
          if (target === 'news-updates') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }
          onNavigateSection(target);
        }}
      />
    </div>
  );
}
