import React from 'react';
import {motion, useReducedMotion} from 'motion/react';
import {PrimaryButton, SecondaryButton} from '../ui/Buttons';

interface PageHeroProps {
  kicker: string;
  title: string;
  description: string;
  primaryCtaLabel?: string;
  primaryCtaTo?: string;
  secondaryCtaLabel?: string;
  secondaryCtaTo?: string;
  visual: React.ReactNode;
  footnote?: string;
}

export function PageHero({
  kicker,
  title,
  description,
  primaryCtaLabel,
  primaryCtaTo,
  secondaryCtaLabel,
  secondaryCtaTo,
  visual,
  footnote,
}: PageHeroProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative pt-10 pb-16 lg:pt-16 lg:pb-24 overflow-hidden">
      {/* Subtle architectural background grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 axom-grid-bg opacity-35 [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]"
      />

      <div className="relative max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Left Copy Column */}
          <motion.div
            initial={prefersReducedMotion ? false : {opacity: 0, y: 12}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.35, ease: [0.16, 1, 0.3, 1]}}
            className="lg:col-span-6 flex flex-col justify-center"
          >
            <p
              data-swarm-target="text"
              className="font-mono text-xs font-medium tracking-[0.06em] text-[#AEF830] mb-4"
            >
              {kicker}
            </p>

            <h1
              data-swarm-target="text"
              className="text-[clamp(2.25rem,4.2vw,3.5rem)] leading-[1.1] font-bold tracking-[-0.035em] text-white"
            >
              {title}
            </h1>

            <p
              data-swarm-target="text"
              className="mt-5 text-base sm:text-lg leading-[1.65] text-[#A6B4AC] max-w-xl"
            >
              {description}
            </p>

            {(primaryCtaLabel || secondaryCtaLabel) && (
              <div data-swarm-target="leaf" className="mt-8 flex flex-wrap items-center gap-4">
                {primaryCtaLabel && primaryCtaTo && (
                  <PrimaryButton to={primaryCtaTo}>{primaryCtaLabel}</PrimaryButton>
                )}
                {secondaryCtaLabel && secondaryCtaTo && (
                  <SecondaryButton to={secondaryCtaTo}>{secondaryCtaLabel}</SecondaryButton>
                )}
              </div>
            )}

            {footnote && (
              <p data-swarm-target="text" className="mt-6 font-mono text-xs text-[#53685E]">
                {footnote}
              </p>
            )}
          </motion.div>

          {/* Right Dedicated Isolated Visual Column */}
          <motion.div
            data-swarm-target="leaf"
            initial={prefersReducedMotion ? false : {opacity: 0, y: 14}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.4, delay: 0.06, ease: [0.16, 1, 0.3, 1]}}
            className="lg:col-span-6 flex"
          >
            {visual}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
