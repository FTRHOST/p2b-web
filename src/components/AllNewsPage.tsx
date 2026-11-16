import { useState } from 'react';
import { ChevronRight, Newspaper, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { allNewsArticles, NewsCategory } from '../data/news';
import { PageHero } from './PageHero';
import { Footer } from './Footer';

const categories: NewsCategory[] = ['Semua', 'Fasilitas', 'Layanan', 'Produk'];

interface AllNewsPageProps {
  onBackHome: () => void;
  onSelectArticle: (articleId: string) => void;
  onNavigateSection: (target: 'top' | 'who-we-are' | 'news-updates' | 'lokasi-p2b') => void;
}

export function AllNewsPage({
  onBackHome,
  onSelectArticle,
  onNavigateSection,
}: AllNewsPageProps) {
  const [activeCategory, setActiveCategory] = useState<NewsCategory>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredArticles = allNewsArticles.filter((article) => {
    const matchesCategory =
      activeCategory === 'Semua' || article.category === activeCategory;
    const matchesQuery =
      !normalizedQuery ||
      article.title.toLowerCase().includes(normalizedQuery) ||
      article.excerpt.toLowerCase().includes(normalizedQuery) ||
      article.category.toLowerCase().includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });

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
      <section className="w-full flex justify-center px-3 md:px-5 pt-10 md:pt-14 pb-12 md:pb-20 flex-1">
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
                className="flex items-center gap-1 p-1.5 rounded-full bg-white/70 backdrop-blur-md border border-[#C9A45A]/30 w-fit overflow-x-auto"
              >
                {categories.map((category) => {
                  const isActive = activeCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveCategory(category)}
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
                <Search className="w-4 h-4 text-[#B89242] shrink-0" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari berita atau layanan..."
                  aria-label="Cari berita"
                  className="w-full bg-transparent text-sm text-[#164234] placeholder:text-[#3E544B]/50 focus:outline-none min-w-0"
                />
              </div>
            </div>
          </motion.div>

          {/* All News Cards Grid */}
          {filteredArticles.length === 0 ? (
            <div className="rounded-[1.5rem] md:rounded-[2.5rem] bg-white/55 backdrop-blur-xl border border-[#C9A45A]/25 p-10 text-center flex flex-col items-center gap-3">
              <Newspaper className="w-8 h-8 text-[#B89242]" />
              <p className="text-base text-[#164234]">
                Tidak ada berita yang cocok dengan kata kunci pencarian Anda.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('Semua');
                  setSearchQuery('');
                }}
                className="px-5 py-2 rounded-full bg-[#164234] text-[#F6F3EC] text-sm cursor-pointer"
              >
                Tampilkan Semua Berita
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {filteredArticles.map((article, index) => (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.55,
                    delay: index * 0.05,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  onClick={() => onSelectArticle(article.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectArticle(article.id);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  className="rounded-[1.5rem] md:rounded-[2.5rem] bg-white/60 backdrop-blur-xl border border-[#C9A45A]/25 p-3.5 md:p-4 flex flex-col gap-4 group cursor-pointer hover:bg-white/80 hover:border-[#C9A45A]/50 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#164234]"
                >
                  {/* Image Container */}
                  <div className="relative w-full aspect-[4/3] rounded-[1.15rem] md:rounded-[1.85rem] overflow-hidden bg-gradient-to-br from-[#F4EFE3] via-[#EAE5D7] to-[#D9E2DA] flex items-center justify-center">
                    {failedImages[article.id] ? (
                      <div className="flex flex-col items-center justify-center gap-2 text-[#164234]/50">
                        <Newspaper className="w-7 h-7" />
                        <span className="text-xs">{article.category}</span>
                      </div>
                    ) : article.isLogoPlaceholder ? (
                      <div className="w-full h-full flex items-center justify-center p-8 md:p-10">
                        <img
                          src={article.image}
                          alt={article.title}
                          referrerPolicy="no-referrer"
                          onError={() =>
                            setFailedImages((prev) => ({ ...prev, [article.id]: true }))
                          }
                          className="max-h-24 sm:max-h-28 md:max-h-32 w-auto object-contain transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                        />
                      </div>
                    ) : (
                      <img
                        src={article.image}
                        alt={article.title}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setFailedImages((prev) => ({ ...prev, [article.id]: true }))
                        }
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="px-2 pb-2 flex flex-col gap-2.5 flex-1 justify-between">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-xs text-[#8F6D26] font-normal">
                        <span>{article.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{article.date}</span>
                        <span aria-hidden="true">·</span>
                        <span>{article.readTime}</span>
                      </div>

                      <h2 className="text-lg md:text-xl font-normal text-[#164234] tracking-tight leading-snug">
                        {article.title}
                      </h2>

                      <p className="text-sm text-[#3E544B] leading-relaxed line-clamp-2">
                        {article.excerpt}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center gap-1 text-xs md:text-sm text-[#164234]/80 group-hover:text-[#164234] transition-colors">
                      <span>Baca Selengkapnya</span>
                      <ChevronRight className="w-4 h-4 text-[#B89242] transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
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
