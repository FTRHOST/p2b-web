import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  MessageSquare,
  Send,
  Tag,
  User,
} from 'lucide-react';
import { motion } from 'motion/react';
import { allNewsArticles, NewsArticle } from '../data/news';
import { PageHero } from './PageHero';
import { Footer } from './Footer';

interface CommentItem {
  id: string;
  author: string;
  role: string;
  date: string;
  message: string;
}

const initialTemplateComments: CommentItem[] = [
  {
    id: 'tpl-1',
    author: 'Ahmad Fauzi',
    role: 'Sivitas Akademika UIN Salatiga',
    date: '15 Nov 2026',
    message:
      'Informasi yang sangat membantu. Semoga pembaruan layanan P2B ini semakin memudahkan koordinasi kegiatan akademik maupun kemitraan di kampus.',
  },
  {
    id: 'tpl-2',
    author: 'Nadia Kusuma',
    role: 'Mitra Eksternal',
    date: '14 Nov 2026',
    message:
      'Prosedur dan keterbukaan informasi tarif PTN BLU sangat jelas. Kami berencana mengajukan kerja sama untuk agenda seminar bulan depan.',
  },
];

interface NewsDetailPageProps {
  article: NewsArticle;
  onOpenAllNews: () => void;
  onSelectArticle: (articleId: string) => void;
  onNavigateSection: (target: 'top' | 'who-we-are' | 'news-updates' | 'lokasi-p2b') => void;
}

export function NewsDetailPage({
  article,
  onOpenAllNews,
  onSelectArticle,
  onNavigateSection,
}: NewsDetailPageProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const [commentsByArticle, setCommentsByArticle] = useState<
    Record<string, CommentItem[]>
  >({});
  const [authorName, setAuthorName] = useState('');
  const [authorRole, setAuthorRole] = useState('');
  const [commentBody, setCommentBody] = useState('');
  const [formError, setFormError] = useState('');
  const [submittedNotice, setSubmittedNotice] = useState(false);

  useEffect(() => {
    setImgFailed(false);
    setFormError('');
    setSubmittedNotice(false);
  }, [article.id]);

  const activeComments = commentsByArticle[article.id] ?? initialTemplateComments;

  const relatedArticles = allNewsArticles
    .filter((item) => item.id !== article.id)
    .slice(0, 3);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = authorName.trim();
    const trimmedBody = commentBody.trim();

    if (!trimmedName || !trimmedBody) {
      setFormError('Mohon lengkapi nama dan isi komentar terlebih dahulu.');
      return;
    }

    const newComment: CommentItem = {
      id: `cmt-${Date.now()}`,
      author: trimmedName,
      role: authorRole.trim() || 'Pembaca',
      date: 'Baru saja',
      message: trimmedBody,
    };

    setCommentsByArticle((prev) => ({
      ...prev,
      [article.id]: [newComment, ...(prev[article.id] ?? initialTemplateComments)],
    }));

    setAuthorName('');
    setAuthorRole('');
    setCommentBody('');
    setFormError('');
    setSubmittedNotice(true);
    window.setTimeout(() => setSubmittedNotice(false), 3500);
  };

  return (
    <div className="min-h-screen bg-[#F6F3EC] flex flex-col">
      <PageHero
        eyebrow={`${article.category} · ${article.date} · ${article.readTime}`}
        title={article.title}
        subtitle={article.excerpt}
        imageSrc={article.isLogoPlaceholder ? undefined : article.image}
        imageAlt={article.title}
        cornerLabel="Arsip Berita"
        cornerActionLabel="Semua Berita"
        cornerHref="#semua-berita"
        onCornerClick={onOpenAllNews}
      />

      <main className="w-full flex justify-center px-3 md:px-5 pt-10 md:pt-14 pb-12 md:pb-20 flex-1">
        <div className="w-full max-w-[1536px] flex flex-col gap-10 md:gap-14">
          {/* Article Body Card */}
          <motion.article
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[1.5rem] md:rounded-[3rem] bg-white/65 backdrop-blur-xl border border-[#C9A45A]/30 p-6 sm:p-10 md:p-14 flex flex-col gap-8"
          >
            {/* Top Navigation & Meta Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#C9A45A]/25">
              <button
                type="button"
                onClick={onOpenAllNews}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(22,66,52,0.08)] hover:bg-[#164234] text-[#164234] hover:text-[#F6F3EC] text-xs sm:text-sm font-normal transition-colors cursor-pointer w-fit whitespace-nowrap"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Semua Berita</span>
              </button>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-[#3E544B]">
                <span className="inline-flex items-center gap-1.5 text-[#8F6D26]">
                  <Tag className="w-3.5 h-3.5" />
                  <span>{article.category}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#B89242]" />
                  <span>{article.date}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#B89242]" />
                  <span>{article.readTime}</span>
                </span>
              </div>
            </div>

            {/* Cover Image or Centered Logo Placeholder */}
            {!imgFailed && (
              <div className="w-full max-w-4xl mx-auto aspect-[16/9] rounded-[1.25rem] md:rounded-[2rem] overflow-hidden border border-[#C9A45A]/25 bg-gradient-to-br from-[#F4EFE3] via-[#EAE5D7] to-[#D9E2DA] flex items-center justify-center">
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

            {/* Editorial Text */}
            <div className="w-full max-w-3xl mx-auto flex flex-col gap-5 text-base sm:text-[17px] md:text-lg text-[#3E544B] leading-relaxed">
              {article.content.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </motion.article>

          {/* Comment Section Template */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            aria-labelledby="komentar-heading"
            className="rounded-[1.5rem] md:rounded-[3rem] bg-white/60 backdrop-blur-xl border border-[#C9A45A]/30 p-6 sm:p-10 md:p-12 flex flex-col gap-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs uppercase tracking-wider text-[#8F6D26] inline-flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Diskusi & Tanggapan</span>
                </span>
                <h2
                  id="komentar-heading"
                  className="text-2xl sm:text-3xl font-normal text-[#164234] tracking-tight"
                >
                  Komentar Pembaca ({activeComments.length})
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#3E544B] max-w-md">
                Sampaikan pertanyaan, masukan, atau tanggapan Anda terkait berita dan layanan P2B UIN Salatiga.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Comment Form */}
              <form
                onSubmit={handleCommentSubmit}
                noValidate
                className="lg:col-span-5 rounded-[1.5rem] bg-[#F6F3EC]/85 border border-[#C9A45A]/25 p-5 sm:p-6 flex flex-col gap-4"
              >
                <h3 className="text-lg font-normal text-[#164234]">
                  Tulis Komentar
                </h3>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="comment-name"
                    className="text-xs text-[#3E544B]"
                  >
                    Nama Lengkap
                  </label>
                  <input
                    id="comment-name"
                    type="text"
                    value={authorName}
                    onChange={(e) => {
                      setAuthorName(e.target.value);
                      if (formError) setFormError('');
                    }}
                    placeholder="Masukkan nama Anda"
                    className="w-full px-4 py-2.5 rounded-2xl bg-white/90 border border-[#C9A45A]/30 text-sm text-[#164234] placeholder:text-[#3E544B]/45 focus:outline-none focus:border-[#164234]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="comment-role"
                    className="text-xs text-[#3E544B]"
                  >
                    Kategori / Instansi (Opsional)
                  </label>
                  <input
                    id="comment-role"
                    type="text"
                    value={authorRole}
                    onChange={(e) => setAuthorRole(e.target.value)}
                    placeholder="Contoh: Mahasiswa, Dosen, Mitra, Umum"
                    className="w-full px-4 py-2.5 rounded-2xl bg-white/90 border border-[#C9A45A]/30 text-sm text-[#164234] placeholder:text-[#3E544B]/45 focus:outline-none focus:border-[#164234]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="comment-body"
                    className="text-xs text-[#3E544B]"
                  >
                    Isi Komentar
                  </label>
                  <textarea
                    id="comment-body"
                    rows={4}
                    value={commentBody}
                    onChange={(e) => {
                      setCommentBody(e.target.value);
                      if (formError) setFormError('');
                    }}
                    placeholder="Tulis tanggapan atau pertanyaan Anda di sini..."
                    className="w-full px-4 py-3 rounded-2xl bg-white/90 border border-[#C9A45A]/30 text-sm text-[#164234] placeholder:text-[#3E544B]/45 focus:outline-none focus:border-[#164234] resize-none"
                  />
                </div>

                {formError && (
                  <p className="text-xs text-[#9b2c2c]">{formError}</p>
                )}

                {submittedNotice && (
                  <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[rgba(22,66,52,0.08)] border border-[#C9A45A]/30 text-xs text-[#164234]">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Komentar Anda berhasil ditambahkan.</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-full bg-[#164234] hover:bg-[#1E5644] text-[#F6F3EC] border border-[#C9A45A]/40 text-sm font-normal transition-colors cursor-pointer"
                >
                  <span>Kirim Komentar</span>
                  <Send className="w-3.5 h-3.5 text-[#F4D993]" />
                </button>
              </form>

              {/* Comments List */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                {activeComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-[1.5rem] bg-white/80 border border-[#C9A45A]/25 p-5 sm:p-6 flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[rgba(201,164,90,0.16)] border border-[#C9A45A]/35 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-[#164234]" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm sm:text-base font-normal text-[#164234]">
                            {comment.author}
                          </span>
                          <span className="text-xs text-[#8F6D26]">
                            {comment.role}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-[#3E544B]/70 whitespace-nowrap shrink-0">
                        {comment.date}
                      </span>
                    </div>

                    <p className="text-sm sm:text-base text-[#3E544B] leading-relaxed">
                      {comment.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

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
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
              {relatedArticles.map((item) => (
                <article
                  key={item.id}
                  onClick={() => onSelectArticle(item.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectArticle(item.id);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  className="rounded-[1.5rem] md:rounded-[2.25rem] bg-white/60 backdrop-blur-xl border border-[#C9A45A]/25 p-5 sm:p-6 flex flex-col justify-between gap-4 group cursor-pointer hover:bg-white/85 hover:border-[#C9A45A]/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#164234]"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs text-[#8F6D26]">
                      <span>{item.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.date}</span>
                    </div>
                    <h3 className="text-lg font-normal text-[#164234] tracking-tight leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#3E544B] leading-relaxed line-clamp-2">
                      {item.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-xs md:text-sm text-[#164234]/80 group-hover:text-[#164234] transition-colors">
                    <span>Baca Selengkapnya</span>
                    <ChevronRight className="w-4 h-4 text-[#B89242] transition-transform group-hover:translate-x-0.5" />
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer onNavigate={onNavigateSection} />
    </div>
  );
}
