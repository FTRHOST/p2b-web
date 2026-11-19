export const CARD_CORNER_PATTERNS = [
  '/assets/aistudio/elemen-1_6ec2843d.webp',
  '/assets/aistudio/elemen-2_83d885f6.webp',
  '/assets/aistudio/elemen-3_19840800.webp',
  '/assets/aistudio/elemen-4_cb318bf6.webp',
] as const;

interface CardCornerPatternProps {
  index?: number;
  position?: 'bottom-right' | 'top-right';
  sizeClassName?: string;
  opacityClassName?: string;
}

export function CardCornerPattern({
  index = 0,
  position = 'bottom-right',
  sizeClassName = 'w-40 h-40 sm:w-44 sm:h-44',
  opacityClassName = 'opacity-[0.18] group-hover:opacity-[0.28]',
}: CardCornerPatternProps) {
  const safeIdx =
    ((index % CARD_CORNER_PATTERNS.length) + CARD_CORNER_PATTERNS.length) %
    CARD_CORNER_PATTERNS.length;
  const src = CARD_CORNER_PATTERNS[safeIdx];
  const placement =
    position === 'top-right'
      ? '-top-8 -right-8 rotate-[16deg] group-hover:rotate-[10deg]'
      : '-bottom-8 -right-8 -rotate-[14deg] group-hover:-rotate-[8deg]';

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none absolute inset-0 rounded-[inherit] overflow-hidden z-0"
    >
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        className={`absolute ${placement} ${sizeClassName} ${opacityClassName} object-contain scale-[1.18] group-hover:scale-[1.28] transition-all duration-500 ease-out`}
      />
    </div>
  );
}
