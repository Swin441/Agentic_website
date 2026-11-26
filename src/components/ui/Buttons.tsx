import React from 'react';
import {Link} from '../../router/RouterContext';

interface BaseButtonProps {
  children: React.ReactNode;
  className?: string;
  to?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  disabled?: boolean;
  ariaLabel?: string;
}

const primaryStyles =
  'inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold tracking-[-0.01em] rounded-lg bg-[#AEF830] text-[#07130F] transition-all duration-150 hover:bg-[#B5FF38] hover:shadow-[0_0_24px_rgba(174,248,48,0.28)] active:scale-[0.99] whitespace-nowrap shrink-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

const secondaryStyles =
  'inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium tracking-[-0.01em] rounded-lg bg-[#101C18] text-white border border-[#203C30] transition-all duration-150 hover:border-[#AEF830] hover:text-[#AEF830] active:scale-[0.99] whitespace-nowrap shrink-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

export function PrimaryButton({
  children,
  className = '',
  to,
  type = 'button',
  onClick,
  disabled,
  ariaLabel,
}: BaseButtonProps) {
  if (to) {
    return (
      <Link to={to} onClick={onClick} className={`${primaryStyles} ${className}`} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`${primaryStyles} ${className}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  className = '',
  to,
  type = 'button',
  onClick,
  disabled,
  ariaLabel,
}: BaseButtonProps) {
  if (to) {
    return (
      <Link to={to} onClick={onClick} className={`${secondaryStyles} ${className}`} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`${secondaryStyles} ${className}`}
    >
      {children}
    </button>
  );
}
