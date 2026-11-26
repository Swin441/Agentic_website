import React from 'react';
import {PrimaryButton, SecondaryButton} from '../ui/Buttons';

interface CtaSectionProps {
  kicker?: string;
  title?: string;
  description?: string;
  primaryLabel?: string;
  primaryTo?: string;
  secondaryLabel?: string;
  secondaryTo?: string;
}

export function CtaSection({
  kicker = 'Ready when you are',
  title = 'See how AI and automation fit your daily operations.',
  description = 'Book a free 30-minute walkthrough. We look at your real enquiries, follow-ups, or manual spreadsheets and show you a practical setup—no jargon, no pressure.',
  primaryLabel = 'Book a Free Demo',
  primaryTo = '/contact',
  secondaryLabel = 'Inspect Concept Demos',
  secondaryTo = '/work',
}: CtaSectionProps) {
  return (
    <section className="py-16 lg:py-24 border-t border-[#203C30]">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="bg-[#101C18] border border-[#203C30] rounded-2xl p-8 sm:p-12 lg:p-14 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-medium tracking-[0.06em] text-[#AEF830] mb-3">
              {kicker}
            </p>
            <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.18] font-semibold tracking-[-0.03em] text-white">
              {title}
            </h2>
            <p className="mt-4 text-base text-[#A6B4AC] leading-relaxed">{description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <PrimaryButton to={primaryTo}>{primaryLabel}</PrimaryButton>
            <SecondaryButton to={secondaryTo}>{secondaryLabel}</SecondaryButton>
          </div>
        </div>
      </div>
    </section>
  );
}
