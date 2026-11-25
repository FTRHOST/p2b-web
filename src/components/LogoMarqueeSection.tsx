import { useMemo, useState, type CSSProperties } from 'react';
import { PartnerLogoItem } from '../types/cms';

interface LogoMarqueeSectionProps {
  logos: PartnerLogoItem[];
  ariaLabel?: string;
}

export function LogoMarqueeSection({
  logos,
  ariaLabel = 'Logo Mitra & Unit P2B UIN Salatiga',
}: LogoMarqueeSectionProps) {
  const [failedIds, setFailedIds] = useState<Record<number, boolean>>({});

  const visibleLogos = useMemo(
    () => logos.filter((item) => item.isActive && item.logoUrl?.trim() && !failedIds[item.id]),
    [logos, failedIds]
  );

  // Repeat items so each marquee track always fills wide desktop viewports (>= 24 logos per track)
  const repeatedTrack = useMemo(() => {
    if (visibleLogos.length === 0) return [];
    const repeatCount = Math.max(2, Math.ceil(24 / visibleLogos.length));
    const result: { item: PartnerLogoItem; key: string }[] = [];
    for (let r = 0; r < repeatCount; r++) {
      for (const item of visibleLogos) {
        result.push({ item, key: `${r}-${item.id}` });
      }
    }
    return result;
  }, [visibleLogos]);

  if (visibleLogos.length === 0) {
    return null;
  }

  const durationSeconds = Math.max(36, repeatedTrack.length * 2.5);

  const marqueeContainerStyle = {
    '--rfm-fade-color': '#F6F3EC',
    '--rfm-fade-width': '11%',
    '--rfm-duration': `${durationSeconds}s`,
  } as CSSProperties;

  const renderTrack = (ariaHidden = false) => (
    <div className="rfm-marquee rfm-marquee--seamless" aria-hidden={ariaHidden || undefined}>
      <div className="rfm-initial-child-container">
        {repeatedTrack.map(({ item, key }) => {
          const cleanLink = item.linkUrl?.trim();
          const hasValidLink =
            cleanLink &&
            (cleanLink.startsWith('https://') ||
              cleanLink.startsWith('http://') ||
              cleanLink.startsWith('/'));

          const imgEl = (
            <img
              src={item.logoUrl}
              alt={ariaHidden ? '' : `${item.name} logo`}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={() =>
                setFailedIds((prev) =>
                  prev[item.id] ? prev : { ...prev, [item.id]: true }
                )
              }
              className="max-w-[120px] md:max-w-[155px] h-9 md:h-11 w-auto object-contain opacity-35 hover:opacity-85 grayscale hover:grayscale-0 transition-all duration-300 select-none"
            />
          );

          return (
            <div key={key} className="rfm-child rfm-child--logo">
              {hasValidLink ? (
                <a
                  href={cleanLink}
                  target={cleanLink.startsWith('http') ? '_blank' : undefined}
                  rel={cleanLink.startsWith('http') ? 'noopener noreferrer' : undefined}
                  tabIndex={ariaHidden ? -1 : undefined}
                  aria-label={ariaHidden ? undefined : item.name}
                  title={item.name}
                  className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#164234]/40"
                >
                  {imgEl}
                </a>
              ) : (
                <span title={item.name} className="block">
                  {imgEl}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <section
      aria-label={ariaLabel}
      className="w-full bg-[#F6F3EC] px-3 md:px-5 pt-3 pb-6 md:pt-4 md:pb-8 flex justify-center"
    >
      <div className="w-full max-w-[1536px] border-b border-[#C9A45A]/20 pb-6 md:pb-8">
        <div
          className="rfm-marquee-container rfm-marquee-container--pausable items-center"
          style={marqueeContainerStyle}
        >
          <div className="rfm-overlay" />
          {renderTrack(false)}
          {renderTrack(true)}
        </div>
      </div>
    </section>
  );
}
