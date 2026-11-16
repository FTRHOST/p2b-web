import { useState } from 'react';
import { ArrowUpRight, ChevronRight, Newspaper, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type NewsCategory = 'Semua' | 'Fasilitas' | 'Layanan' | 'Produk';

interface NewsArticle {
  id: string;
  category: Exclude<NewsCategory, 'Semua'>;
  date: string;
  readTime: string;
  title: string;
  excerpt: string;
  image: string;
  content: string[];
}

const articles: NewsArticle[] = [
  {
    id: 'auditorium-modernisasi',
    category: 'Fasilitas',
    date: '14 Nov 2026',
    readTime: '3 mnt baca',
    title: 'Modernisasi Sistem Akustik & Reservasi Digital Gedung Auditorium Salatiga',
    excerpt:
      'Peningkatan tata suara dan sistem pemesanan terpadu kini memudahkan penyelenggaraan seminar nasional hingga wisuda dengan konfirmasi jadwal real-time.',
    image: '/src/assets/images/news_auditorium_launch_1794836860155.jpg',
    content: [
      'Gedung Auditorium Student Centre di Salatiga resmi mengoperasikan pembaruan panel akustik arsitektural serta sistem pencahayaan panggung hemat energi untuk mendukung beragam agenda akademik maupun publik.',
      'Melalui kanal Pelayanan Sewa Aset dan Tiket terpadu, panitia acara maupun mitra eksternal kini dapat meninjau ketersediaan tanggal, kapasitas ruang, serta paket dukungan teknis secara transparan.',
      'Langkah ini menjadi bagian dari komitmen berkelanjutan dalam menghadirkan infrastruktur kegiatan berstandar profesional bagi civitas dan masyarakat luas.',
    ],
  },
  {
    id: 'klinik-uin-saga',
    category: 'Layanan',
    date: '09 Nov 2026',
    readTime: '4 mnt baca',
    title: 'Klinik UIN SAGA Perluas Jam Layanan Konsultasi & Pemeriksaan Preventif',
    excerpt:
      'Penambahan jadwal praktik dokter umum dan layanan skrining kesehatan berkala hadir untuk meningkatkan akses kesehatan civitas serta warga sekitar.',
    image: '/src/assets/images/news_klinik_service_1794836860824.jpg',
    content: [
      'Klinik UIN SAGA membuka perluasan jam operasional layanan rawat jalan dan pemeriksaan preventif guna menjawab meningkatnya kebutuhan konsultasi kesehatan harian.',
      'Area tunggu dan ruang konsultasi dirancang ulang dengan partisi kaca higienis dan alur pendaftaran digital agar pasien memperoleh pengalaman layanan yang tenang dan efisien.',
      'Civitas akademika maupun masyarakat umum dapat memanfaatkan layanan pemeriksaan dasar, konsultasi gizi, serta rujukan terstruktur setiap hari kerja.',
    ],
  },
  {
    id: 'produk-air-mineral',
    category: 'Produk',
    date: '02 Nov 2026',
    readTime: '3 mnt baca',
    title: 'Distribusi Air Mineral Kemasan Ramah Lingkungan Resmi Menjangkau Area Kantin',
    excerpt:
      'Inisiatif produksi air mineral berstandar higienis tinggi mulai dipasok ke seluruh unit kantin dan kegiatan resmi auditorium kampus.',
    image: '/src/assets/images/news_air_mineral_1794836860880.jpg',
    content: [
      'Unit produksi Air Mineral resmi meluncurkan lini kemasan terbarunya yang mengedepankan proses filtrasi berlapis dan pengawasan mutu laboratorium berkala.',
      'Seluruh gerai Kantin serta penyelenggaraan acara di Gedung Auditorium kini memperoleh pasokan langsung dengan skema distribusi yang lebih ringkas dan terjangkau.',
      'Program ini turut mendukung pengurangan limbah kemasan sekali pakai melalui sistem pengumpulan ulang di titik-titik layanan utama.',
    ],
  },
];

const categories: NewsCategory[] = ['Semua', 'Fasilitas', 'Layanan', 'Produk'];

export function NewsSection() {
  const [activeCategory, setActiveCategory] = useState<NewsCategory>('Semua');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const filteredArticles =
    activeCategory === 'Semua'
      ? articles
      : articles.filter((item) => item.category === activeCategory);

  return (
    <section
      id="news-updates"
      className="w-full flex justify-center px-3 md:px-5 pb-12 md:pb-20 bg-[#f0f0f0]"
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
            <span className="text-xs md:text-sm font-normal text-[rgba(30,50,90,0.6)] uppercase tracking-wider">
              Berita & Informasi
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-normal text-[#5E6470] tracking-tight leading-[1.06]">
              News & Update
            </h2>
          </div>

          <div
            role="tablist"
            aria-label="Filter kategori berita"
            className="flex items-center gap-1 p-1.5 rounded-full bg-white/55 backdrop-blur-md border border-white/60 w-fit overflow-x-auto"
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
                      ? 'bg-[rgba(30,50,90,0.85)] text-white'
                      : 'text-[rgba(30,50,90,0.75)] hover:text-[rgba(30,50,90,1)] hover:bg-white/60'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* News Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {filteredArticles.map((article, index) => (
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
              className="rounded-[1.5rem] md:rounded-[2.5rem] bg-white/45 backdrop-blur-xl border border-white/60 p-3.5 md:p-4 flex flex-col gap-4 group cursor-pointer hover:bg-white/65 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(30,50,90,0.5)]"
            >
              {/* Image Container */}
              <div className="relative w-full aspect-[4/3] rounded-[1.15rem] md:rounded-[1.85rem] overflow-hidden bg-gradient-to-br from-[#e2e6ec] via-[#d7dde6] to-[#cfd7e3]">
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[rgba(30,50,90,0.45)]">
                  <Newspaper className="w-7 h-7" />
                  <span className="text-xs">{article.category}</span>
                </div>

                {!failedImages[article.id] && (
                  <img
                    src={article.image}
                    alt={article.title}
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setFailedImages((prev) => ({ ...prev, [article.id]: true }))
                    }
                    className="relative z-10 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                )}

                <div className="absolute bottom-3 right-3 z-20 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-white/60 flex items-center justify-center group-hover:bg-[rgba(30,50,90,0.9)] transition-colors duration-300">
                  <ArrowUpRight className="w-4 h-4 text-[rgba(30,50,90,0.9)] group-hover:text-white transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>

              {/* Card Body */}
              <div className="px-2 pb-2 flex flex-col gap-2.5 flex-1 justify-between">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs text-[rgba(30,50,90,0.58)] font-normal">
                    <span>{article.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{article.date}</span>
                    <span aria-hidden="true">·</span>
                    <span>{article.readTime}</span>
                  </div>

                  <h3 className="text-lg md:text-xl font-normal text-[rgba(30,50,90,0.95)] tracking-tight leading-snug">
                    {article.title}
                  </h3>

                  <p className="text-sm text-[#5E6470] opacity-85 leading-relaxed line-clamp-2">
                    {article.excerpt}
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-1 text-xs md:text-sm text-[rgba(30,50,90,0.75)] group-hover:text-[rgba(30,50,90,1)] transition-colors">
                  <span>Baca Selengkapnya</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </motion.article>
          ))}
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-3xl bg-white/92 backdrop-blur-2xl border border-white/60 p-5 sm:p-7 md:p-8 text-[rgba(30,50,90,0.95)] shadow-lg relative"
            >
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                aria-label="Tutup berita"
                className="absolute top-5 right-5 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white border border-[rgba(30,50,90,0.1)] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-[rgba(30,50,90,0.85)]" />
              </button>

              {!failedImages[selectedArticle.id] && (
                <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden mb-5 bg-[#e2e6ec]">
                  <img
                    src={selectedArticle.image}
                    alt={selectedArticle.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-[rgba(30,50,90,0.58)] mb-2">
                <span>{selectedArticle.category}</span>
                <span aria-hidden="true">·</span>
                <span>{selectedArticle.date}</span>
                <span aria-hidden="true">·</span>
                <span>{selectedArticle.readTime}</span>
              </div>

              <h3 className="text-xl sm:text-2xl md:text-3xl font-normal tracking-tight leading-snug mb-4">
                {selectedArticle.title}
              </h3>

              <div className="flex flex-col gap-3 text-sm md:text-base text-[rgba(30,50,90,0.78)] leading-relaxed mb-6">
                {selectedArticle.content.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="px-6 py-2.5 rounded-full bg-[rgba(30,50,90,0.85)] hover:bg-[rgba(30,50,90,1)] text-white text-sm font-normal transition-colors cursor-pointer"
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
