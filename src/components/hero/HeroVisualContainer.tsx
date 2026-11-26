import React from 'react';

interface HeroVisualContainerProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Isolated component boundary for page hero visuals.
 * Designed so custom React interfaces, Canvas animations, or Three.js / rigged robot scenes
 * can be mounted or swapped cleanly without affecting page layout or typography columns.
 */
export function HeroVisualContainer({
  label,
  children,
  className = '',
}: HeroVisualContainerProps) {
  return (
    <div
      aria-label={label}
      className={`relative w-full h-full min-h-[360px] lg:min-h-[440px] rounded-2xl bg-[#101C18] border border-[#203C30] overflow-hidden flex flex-col justify-between ${className}`}
    >
      {/* Subtle top ambient radial highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#AEF830]/[0.06] blur-3xl"
      />
      <div className="relative z-10 w-full h-full flex flex-col">{children}</div>
    </div>
  );
}
