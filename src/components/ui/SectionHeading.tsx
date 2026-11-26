import React from 'react';

interface SectionHeadingProps {
  kicker?: string;
  title: string;
  description?: string;
  as?: 'h1' | 'h2' | 'h3';
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeading({
  kicker,
  title,
  description,
  as = 'h2',
  align = 'left',
  className = '',
}: SectionHeadingProps) {
  const HeadingTag = as;
  const alignment = align === 'center' ? 'text-center mx-auto' : 'text-left';

  const headingSize =
    as === 'h1'
      ? 'text-[clamp(2.25rem,4.2vw,3.5rem)] leading-[1.12] font-bold tracking-[-0.035em]'
      : as === 'h2'
        ? 'text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.18] font-semibold tracking-[-0.03em]'
        : 'text-xl sm:text-2xl leading-snug font-semibold tracking-[-0.02em]';

  return (
    <div className={`max-w-2xl ${alignment} ${className}`}>
      {kicker && (
        <p className="font-mono text-xs font-medium tracking-[0.06em] text-[#AEF830] mb-3">
          {kicker}
        </p>
      )}
      <HeadingTag className={`${headingSize} text-white`}>{title}</HeadingTag>
      {description && (
        <p className="mt-4 text-base sm:text-[17px] leading-[1.65] text-[#A6B4AC]">
          {description}
        </p>
      )}
    </div>
  );
}
