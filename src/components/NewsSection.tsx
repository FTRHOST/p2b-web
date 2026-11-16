import { useState } from 'react';
import { ArrowUpRight, ChevronRight, Newspaper, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { allNewsArticles, NewsArticle, NewsCategory } from '../data/news';

const categories: NewsCategory[] = ['Semua', 'Fasilitas', 'Layanan', 'Produk'];

interface NewsSectionProps {
  onViewAllNews: () => void;
}

export function NewsSection({ onViewAllNews }: NewsSectionProps) {
  const [activeCategory, setActiveCategory] = useState<NewsCategory>('Semua');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const filteredArticles =
    activeCategory === 'Semua'
      ? allNewsArticles
      : allNewsArticles.filter((item) => item.category === activeCategory);

  // Tampilkan maksimal 3 berita terbaru di beranda
  const latestArticles = filteredArticles.slice(0, 3);

  return (
    <section
      id="news-updates"
      className="w-full flex justify-center px-3 md:px-5 pb-12 md:pb-20 bg-[#F6F3EC]"
    >
      <div className="w-full max-w-[1536px] flex flex-col gap-8 md:gap-10">
        {/* Header & Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="px-3 md:px-6 flex flex-col md:flex-row md:items-end justify-between gap-5"
        >
          <div className="flex flex-col gap-2">
            <span className="text-xs md:text-sm font-normal text-[#8F6D26] uppercase tracking-wider">
              Berita & Informasi Terbaru
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-normal text-[#164234] tracking-tight leading-[1.06]">
              News & Update
            </h2>
          </div>

          <div
            role="tablist"
            aria-label="Filter kategori berita"
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
        </motion.div>

        {/* Max 3 Latest News Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {latestArticles.map((article, index) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: index * 0.08, ease: 'easeOut' }}
              onClick={() => setSelectedArticle(article)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedArticle(article);
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

                  <h3 className="text-lg md:text-xl font-normal text-[#164234] tracking-tight leading-snug">
                    {article.title}
                  </h3>

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

        {/* Link to Dedicated All News Page */}
        <div className="flex justify-center pt-2">
          <motion.a
            href="#semua-berita"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.preventDefault();
              onViewAllNews();
            }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/75 backdrop-blur-xl border border-[#C9A45A]/35 hover:bg-[#164234] text-[#164234] hover:text-[#F6F3EC] transition-colors group cursor-pointer whitespace-nowrap"
          >
            <span className="text-sm font-normal">
              Lihat Semua Berita ({allNewsArticles.length})
            </span>
            <ArrowUpRight className="w-4 h-4 text-[#8F6D26] group-hover:text-[#F4D993] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </motion.a>
        </div>
      </div>

      {/* Article Reader Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedArticle(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0E2A21]/25 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-3xl bg-[#FAF8F3]/95 backdrop-blur-2xl border border-[#C9A45A]/30 p-5 sm:p-7 md:p-8 text-[#164234] shadow-lg relative"
            >
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                aria-label="Tutup berita"
                className="absolute top-5 right-5 z-10 w-8 h-8 rounded-full bg-white/85 hover:bg-white border border-[#C9A45A]/30 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-[#164234]" />
              </button>

              {!failedImages[selectedArticle.id] && (
                <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden mb-5 bg-gradient-to-br from-[#F4EFE3] via-[#EAE5D7] to-[#D9E2DA] flex items-center justify-center">
                  <img
                    src={selectedArticle.image}
                    alt={selectedArticle.title}
                    referrerPolicy="no-referrer"
                    className={
                      selectedArticle.isLogoPlaceholder
                        ? 'max-h-28 sm:max-h-36 w-auto object-contain p-4'
                        : 'w-full h-full object-cover'
                    }
                  />
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-[#8F6D26] mb-2">
                <span>{selectedArticle.category}</span>
                <span aria-hidden="true">·</span>
                <span>{selectedArticle.date}</span>
                <span aria-hidden="true">·</span>
                <span>{selectedArticle.readTime}</span>
              </div>

              <h3 className="text-xl sm:text-2xl md:text-3xl font-normal tracking-tight leading-snug mb-4">
                {selectedArticle.title}
              </h3>

              <div className="flex flex-col gap-3 text-sm md:text-base text-[#3E544B] leading-relaxed mb-6">
                {selectedArticle.content.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="px-6 py-2.5 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] border border-[#C9A45A]/40 text-sm font-normal transition-colors cursor-pointer"
              >
                Tutup Artikel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
