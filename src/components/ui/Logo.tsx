import React from 'react';

interface LogoProps {
  variant?: 'light' | 'dark';
  showWordmark?: boolean;
  className?: string;
}

/**
 * Approved Axom Hub abstract angular geometric emblem.
 * Strictly black-and-white / canvas-matched variants.
 */
export function AxomLogoMark({
  className = 'h-7 w-auto',
}: {
  variant?: 'light' | 'dark';
  className?: string;
}) {
  return (
    <img
      src="/assets/aistudio/axom-hub-logo_2d483273.svg"
      alt=""
      aria-hidden="true"
      className={`object-contain select-none ${className}`}
    />
  );
}

export function Logo({variant = 'light', showWordmark = true, className = ''}: LogoProps) {
  const textColor = variant === 'light' ? 'text-white' : 'text-[#07130F]';

  return (
    <span className={`inline-flex items-center gap-2.5 shrink-0 select-none ${className}`}>
      <AxomLogoMark variant={variant} className="h-7 w-auto shrink-0" />
      {showWordmark && (
        <span className={`text-lg font-semibold tracking-tight whitespace-nowrap ${textColor}`}>
          Axom Hub
        </span>
      )}
    </span>
  );
}
