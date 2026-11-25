import { useState } from 'react';
import { Icon } from '@iconify/react';
import { allNewsArticles, NewsArticle } from '../data/news';
import { EditorialNewsCard } from './EditorialNewsCard';
import { ScrollWordTitle } from './ScrollWordTitle';

interface NewsSectionProps {
  articles?: NewsArticle[];
  categories?: string[];
  sectionId?: string;
  eyebrow?: string;
  heading?: string;
  ctaLabel?: string;
  maxItems?: number;
  onViewAllNews: () => void;
  onSelectArticle: (articleId: string) => void;
}

export function NewsSection({
  articles = allNewsArticles,
  sectionId = 'news-updates',
  eyebrow = 'Berita & Informasi Terbaru',
  heading = 'News & Update',
  ctaLabel = 'Lihat Semua Berita',
  maxItems = 3,
  onViewAllNews,
  onSelectArticle,
}: NewsSectionProps) {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const safeLimit =
    Number.isFinite(Number(maxItems)) && Number(maxItems) > 0
      ? Math.min(12, Number(maxItems))
      : 3;
  const latestArticles = articles.slice(0, safeLimit);

  return (
    <section
      id={sectionId}
      className="w-full flex justify-center px-3 md:px-5 pb-12 md:pb-20 bg-[#F6F3EC]"
    >
      <div className="w-full max-w-[1536px] flex flex-col gap-8 md:gap-10">
        {/* Header & Direct All News CTA */}
        <div className="px-3 md:px-6 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <div className="flex flex-col gap-2">
            <span className="text-xs md:text-sm font-normal text-[#8F6D26] uppercase tracking-wider">
              {eyebrow.trim() || 'Berita & Informasi Terbaru'}
            </span>
            <ScrollWordTitle
              as="h2"
              text={heading.trim() || 'News & Update'}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-normal text-[#164234] tracking-tight leading-[1.06]"
            />
          </div>

          <div className="shrink-0">
            <a
              href="/semua-berita"
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
                  return;
                }
                e.preventDefault();
                onViewAllNews();
              }}
              className="nup-cta"
            >
              <span className="nup-cta__label">
                {ctaLabel.trim() || 'Lihat Semua Berita'}
              </span>
              <span className="nup-cta__icon" aria-hidden="true">
                <Icon icon="mdi:arrow-right" className="w-full h-full" />
              </span>
            </a>
          </div>
        </div>

        {/* Max 3 Latest News Cards 12-Col Grid */}
        <ul className="nup-grid">
          {latestArticles.map((article, index) => (
            <EditorialNewsCard
              key={article.id}
              article={article}
              index={index}
              imageFailed={Boolean(failedImages[article.id])}
              onImageError={(id) =>
                setFailedImages((prev) => ({ ...prev, [id]: true }))
              }
              onSelectArticle={onSelectArticle}
              headingAs="h3"
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
