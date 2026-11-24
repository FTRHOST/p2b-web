import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { gsap } from '../lib/gsap';
import { ScrollWordTitle } from './ScrollWordTitle';

interface PageHeroProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  imageSrc?: string;
  imageAlt?: string;
  cornerLabel: string;
  cornerActionLabel: string;
  cornerHref: string;
  onCornerClick: () => void;
}

const DEFAULT_HERO_IMAGE =
  'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/Auditorium-Student-Centre-di-Salatiga.png';

export function PageHero({
  eyebrow,
  title,
  subtitle,
  imageSrc = DEFAULT_HERO_IMAGE,
  imageAlt = 'Pusat Pengembangan Bisnis UIN Salatiga',
  cornerLabel,
  cornerActionLabel,
  cornerHref,
  onCornerClick,
}: PageHeroProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const heroWrapRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setImgFailed(false);
  }, [imageSrc]);

  useLayoutEffect(() => {
    const wrap = heroWrapRef.current;
    if (!wrap) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        if (imgRef.current) {
          gsap.fromTo(
            imgRef.current,
            { y: 0, scale: 1 },
            {
              y: 36,
              scale: 1.06,
              ease: 'none',
              scrollTrigger: {
                trigger: wrap,
                start: 'top top',
                end: 'bottom top',
                scrub: true,
              },
            }
          );
        }
        if (contentRef.current) {
          gsap.fromTo(
            contentRef.current,
            { y: 0, opacity: 1 },
            {
              y: 26,
              opacity: 0.2,
              ease: 'none',
              scrollTrigger: {
                trigger: wrap,
                start: 'top top',
                end: 'bottom 15%',
                scrub: true,
              },
            }
          );
        }
      });
      return () => mm.revert();
    }, wrap);

    return () => ctx.revert();
  }, [imgFailed, title]);

  return (
    <div ref={heroWrapRef} className="w-full flex justify-center px-3 md:px-5 pt-3 md:pt-5 bg-[#F6F3EC]">
      <section className="relative w-full max-w-[1536px] min-h-[440px] sm:min-h-[500px] md:min-h-[540px] rounded-[1.5rem] md:rounded-[3rem] overflow-hidden flex flex-col items-center justify-center border border-[#C9A45A]/20">
        {/* Emerald fallback */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B261D] via-[#164234] to-[#1E5644] z-0" />

        {!imgFailed && (
          <img
            ref={imgRef}
            src={imageSrc}
            alt={imageAlt}
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="absolute inset-0 w-full h-full object-cover z-0 will-change-transform"
          />
        )}

        {/* Deep emerald gradient scrim matching Homepage Hero */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A241B]/90 via-[#164234]/72 to-[#164234]/38 z-0 pointer-events-none" />

        {/* Centered Hero Copy with top offset for floating header */}
        <div
          ref={contentRef}
          className="relative z-10 w-full max-w-4xl px-6 pt-16 md:pt-20 pb-12 flex flex-col items-center text-center gap-3 will-change-transform"
        >
          <span className="text-xs md:text-sm font-normal text-[#F4D993] uppercase tracking-[0.16em]">
            {eyebrow}
          </span>
          <ScrollWordTitle
            as="h1"
            text={title}
            start="top 95%"
            stagger={0.075}
            duration={0.72}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-[64px] font-normal text-[#FAF8F3] tracking-tight leading-[1.06] text-balance drop-shadow-sm"
          />
          <p className="text-sm sm:text-base md:text-lg text-[#F6F3EC]/90 leading-relaxed max-w-2xl font-normal">
            {subtitle}
          </p>
        </div>

        {/* Bottom-Right Faux-Cutout Corner Link (single small arrow) */}
        <a
          href={cornerHref}
          onClick={(e) => {
            e.preventDefault();
            onCornerClick();
          }}
          className="absolute bottom-0 right-0 px-6 py-4 pt-5 pl-8 sm:px-7 sm:py-5 sm:pt-6 sm:pl-10 md:px-9 md:py-6 md:pt-8 md:pl-12 bg-[#F6F3EC] rounded-tl-[1.5rem] sm:rounded-tl-[2rem] md:rounded-tl-[3.5rem] flex items-center z-10 group cursor-pointer"
        >
          {/* Top intersection mask */}
          <div className="absolute -top-[1.5rem] sm:-top-[2rem] md:-top-[3.5rem] right-0 w-[1.5rem] sm:w-[2rem] md:w-[3.5rem] h-[1.5rem] sm:h-[2rem] md:h-[3.5rem] pointer-events-none">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 56 56"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M56 56V0C56 30.9279 30.9279 56 0 56H56Z" fill="#F6F3EC" />
            </svg>
          </div>

          {/* Left intersection mask */}
          <div className="absolute bottom-0 -left-[1.5rem] sm:-left-[2rem] md:-left-[3.5rem] w-[1.5rem] sm:w-[2rem] md:w-[3.5rem] h-[1.5rem] sm:h-[2rem] md:h-[3.5rem] pointer-events-none">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 56 56"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M56 56H0C30.9279 56 56 30.9279 56 0V56Z" fill="#F6F3EC" />
            </svg>
          </div>

          <div className="flex flex-col">
            <span className="text-[15px] md:text-[19px] font-normal text-[#164234] whitespace-nowrap">
              {cornerLabel}
            </span>
            <div className="flex items-center gap-1 text-[#8F6D26] group-hover:text-[#164234] transition-colors">
              <span className="text-[12px] md:text-[14px] font-normal whitespace-nowrap">
                {cornerActionLabel}
              </span>
              <Icon icon="mdi:chevron-right" className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </a>
      </section>
    </div>
  );
}
