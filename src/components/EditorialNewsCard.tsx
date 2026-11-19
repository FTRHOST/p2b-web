import type { MouseEvent } from 'react';
import { Icon } from '@iconify/react';
import { motion } from 'motion/react';
import { NewsArticle } from '../data/news';
import { CardCornerPattern } from './CardCornerPattern';

interface EditorialNewsCardProps {
  article: NewsArticle;
  index: number;
  imageFailed: boolean;
  onImageError: (articleId: string) => void;
  onSelectArticle: (articleId: string) => void;
  headingAs?: 'h2' | 'h3' | 'h4';
  animateOnMount?: boolean;
  wide?: boolean;
}

export function EditorialNewsCard({
  article,
  index,
  imageFailed,
  onImageError,
  onSelectArticle,
  headingAs = 'h3',
  animateOnMount = false,
  wide = false,
}: EditorialNewsCardProps) {
  const articleHref = `/berita/${encodeURIComponent(article.id)}`;
  const titleId = `news-card-title-${article.id}`;

  const handleNavigate = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }
    e.preventDefault();
    onSelectArticle(article.id);
  };

  const HeadingTag = headingAs;

  const cardBody = (
    <article className="nup-card group" aria-labelledby={titleId}>
      {/* Gambar 3:2 menempel penuh ke tepi kartu */}
      <div className="nup-card__image">
        <a
          href={articleHref}
          tabIndex={-1}
          aria-hidden="true"
          onClick={handleNavigate}
        >
          {imageFailed ? (
            <div className="flex flex-col items-center justify-center gap-2 text-[#164234]/50 p-6">
              <Icon icon="mdi:newspaper-variant-outline" className="w-7 h-7" />
              <span className="text-xs">{article.category}</span>
            </div>
          ) : article.isLogoPlaceholder ? (
            <div className="w-full h-full flex items-center justify-center p-8 md:p-10">
              <img
                src={article.image}
                alt={article.title}
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
                onError={() => onImageError(article.id)}
                className="nup-card__logo-img"
              />
            </div>
          ) : (
            <img
              src={article.image}
              alt={article.title}
              referrerPolicy="no-referrer"
              loading="lazy"
              decoding="async"
              onError={() => onImageError(article.id)}
              className="nup-card__img"
            />
          )}
        </a>
      </div>

      {/* Isi kartu */}
      <div className="nup-card__content relative overflow-hidden rounded-b-[var(--nup-radius-card)]">
        <CardCornerPattern
          index={index}
          position="bottom-right"
          sizeClassName="w-36 h-36 sm:w-40 sm:h-40"
          opacityClassName="opacity-[0.15] group-hover:opacity-[0.25]"
        />
        <div className="nup-card__body relative z-[1]">
          <div className="nup-card__meta">
            <span>{article.category}</span>
            <span aria-hidden="true">·</span>
            <span>{article.date}</span>
          </div>

          <a
            className="nup-card__link"
            href={articleHref}
            onClick={handleNavigate}
          >
            <HeadingTag id={titleId} className="nup-card__headline">
              {article.title}
            </HeadingTag>
          </a>

          <p className="nup-card__summary">{article.excerpt}</p>
        </div>

        <div className="nup-card__footer relative z-[1]">
          <a
            className="nup-cta"
            href={articleHref}
            onClick={handleNavigate}
            aria-label={`Baca artikel: ${article.title}`}
          >
            <span className="nup-cta__label">Baca artikel</span>
            <span className="nup-cta__icon" aria-hidden="true">
              <Icon icon="mdi:arrow-right" className="w-full h-full" />
            </span>
          </a>
        </div>
      </div>
    </article>
  );

  if (animateOnMount) {
    return (
      <motion.li
        className={`nup-item${wide ? ' nup-item--wide' : ''}`}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.45,
          delay: index * 0.05,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {cardBody}
      </motion.li>
    );
  }

  return (
    <motion.li
      className={`nup-item${wide ? ' nup-item--wide' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: 'easeOut' }}
    >
      {cardBody}
    </motion.li>
  );
}
