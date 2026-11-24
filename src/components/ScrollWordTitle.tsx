export interface ScrollWordTitleProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  id?: string;
  className?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
  yOffset?: number;
  start?: string;
  resetOnLeave?: boolean;
  inlineGroup?: boolean;
}

export function ScrollWordTitle({
  text,
  as: Tag = 'h2',
  id,
  className = '',
}: ScrollWordTitleProps) {
  return (
    <Tag id={id} className={className}>
      {text}
    </Tag>
  );
}
