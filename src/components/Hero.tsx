import { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from '../lib/gsap';
import { BottomRightCorner } from './BottomRightCorner';
import { ScrollWordTitle } from './ScrollWordTitle';

interface HeroProps {
  onOpenAbout?: () => void;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  cornerLabel?: string;
  cornerActionLabel?: string;
  cornerHref?: string;
}

const DEFAULT_HERO_TITLE = 'Pusat Pengembangan Bisnis';
const DEFAULT_HERO_SUBTITLE =
  'Unit strategis UIN Salatiga dalam optimalisasi aset, layanan komersial, kemitraan, dan inovasi bisnis mendukung kemandirian PTN BLU yang profesional serta berkelanjutan.';
const DEFAULT_HERO_IMAGE =
  'https://pusatbisnis.uinsalatiga.ac.id/wp-content/uploads/2026/11/Auditorium-Student-Centre-di-Salatiga.png';

export function Hero({
  onOpenAbout,
  title,
  subtitle,
  imageUrl,
  cornerLabel,
  cornerActionLabel,
  cornerHref,
}: HeroProps) {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const bgParallaxRef = useRef<HTMLDivElement | null>(null);
  const contentParallaxRef = useRef<HTMLDivElement | null>(null);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const resolvedImage = imageUrl?.trim() || DEFAULT_HERO_IMAGE;
  const bgFailed = failedUrl === resolvedImage;

  useLayoutEffect(() => {
    const heroEl = heroRef.current;
    if (!heroEl) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        if (bgParallaxRef.current) {
          gsap.fromTo(
            bgParallaxRef.current,
            { y: 0, scale: 1 },
            {
              y: 52,
              scale: 1.07,
              ease: 'none',
              scrollTrigger: {
                trigger: heroEl,
                start: 'top top',
                end: 'bottom top',
                scrub: true,
              },
            }
          );
        }

        if (contentParallaxRef.current) {
          gsap.fromTo(
            contentParallaxRef.current,
            { y: 0, opacity: 1 },
            {
              y: 38,
              opacity: 0.15,
              ease: 'none',
              scrollTrigger: {
                trigger: heroEl,
                start: 'top top',
                end: 'bottom 15%',
                scrub: true,
              },
            }
          );
        }
      });

      return () => mm.revert();
    }, heroEl);

    return () => ctx.revert();
  }, [bgFailed]);

  return (
    <div
      ref={heroRef}
      className="w-full h-screen flex items-center justify-center p-3 md:p-5 bg-[#F6F3EC]"
    >
      <section className="relative w-full max-w-[1536px] h-full rounded-[1.5rem] md:rounded-[3rem] overflow-hidden shadow-none flex flex-col items-center justify-center bg-white/20 border border-[#C9A45A]/20 group">
        {/* Fallback backdrop if image fails to load */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B261D] via-[#164234] to-[#1E5644] z-0" />

        {!bgFailed && (
          <div
            ref={bgParallaxRef}
            className="absolute inset-0 w-full h-full z-0 will-change-transform"
          >
            <img
              src={resolvedImage}
              alt="Auditorium Student Centre UIN Salatiga"
              referrerPolicy="no-referrer"
              onError={() => setFailedUrl(resolvedImage)}
              className="w-full h-full object-cover object-[65%] lg:object-center"
            />
          </div>
        )}

        {/* Deep emerald green gradient scrim for high-contrast white/cream typography */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A241B]/90 via-[#164234]/68 to-[#164234]/28 z-0 pointer-events-none" />

        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6 pt-16 md:pt-20 pb-12">
          <div
            ref={contentParallaxRef}
            className="w-full flex flex-col items-center text-center max-w-4xl will-change-transform"
          >
            <ScrollWordTitle
              as="h1"
              text={title?.trim() || DEFAULT_HERO_TITLE}
              start="top 95%"
              stagger={0.08}
              duration={0.78}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[74px] font-normal text-[#FAF8F3] drop-shadow-sm mb-3 tracking-tight leading-[1.06] text-balance"
            />

            <p className="text-sm sm:text-base md:text-lg text-[#F6F3EC]/90 leading-relaxed max-w-2xl font-normal">
              {subtitle?.trim() || DEFAULT_HERO_SUBTITLE}
            </p>
          </div>

          <BottomRightCorner
            label={cornerLabel?.trim() || 'Profil P2B'}
            actionLabel={cornerActionLabel?.trim() || 'Tentang Kami'}
            href={cornerHref?.trim() || '/tentang-kami'}
            onOpenProfile={onOpenAbout}
          />
        </div>
      </section>
    </div>
  );
}
