import React from 'react';
import {PageHero} from '../components/hero/PageHero';
import {SoftwareHeroVisual} from '../components/hero/SoftwareHeroVisual';
import {SectionHeading} from '../components/ui/SectionHeading';
import {CtaSection} from '../components/sections/CtaSection';
import {SOFTWARE_CAPABILITIES} from '../data/siteData';

export function SoftwarePage() {
  return (
    <>
      <PageHero
        kicker="Services · Software & Applications"
        title="Custom software, websites, and portals shaped around your business."
        description="When generic tools feel bloated or multi-tab spreadsheets keep breaking, we design focused web portals, mobile-friendly applications, and high-trust business websites built for daily speed."
        primaryCtaLabel="Book a Free Demo"
        primaryCtaTo="/contact"
        secondaryCtaLabel="View Concept Demos"
        secondaryCtaTo="/work"
        visual={<SoftwareHeroVisual />}
      />

      <section className="py-16 lg:py-24 border-t border-[#203C30]">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <SectionHeading
            kicker="What we build"
            title="Focused software without unnecessary enterprise bloat"
            description="Every screen, form, and report is built specifically for your team and customers."
          />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {SOFTWARE_CAPABILITIES.map((cap) => (
              <article
                key={cap.number}
                className="bg-[#101C18] border border-[#203C30] rounded-xl p-6 sm:p-7 flex flex-col justify-between"
              >
                <div>
                  <span className="font-mono text-xs text-[#AEF830] tabular-nums">
                    {cap.number}
                  </span>
                  <h3 className="text-xl font-semibold text-white mt-2 mb-3">{cap.title}</h3>
                  <p className="text-sm sm:text-[15px] text-[#A6B4AC] leading-relaxed mb-5">
                    {cap.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#203C30]">
                  <p className="font-mono text-[11px] text-[#53685E] mb-2.5">Common builds</p>
                  <ul className="space-y-2">
                    {cap.examples.map((example) => (
                      <li
                        key={example}
                        className="text-sm text-[#D8E6DE] flex items-start gap-2.5"
                      >
                        <span className="text-[#AEF830] font-mono" aria-hidden="true">
                          —
                        </span>
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 border-t border-[#203C30] bg-[#101C18]/35">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <SectionHeading
            kicker="Engineering standards"
            title="Built for reliability on mobile and desktop"
          />

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#101C18] border border-[#203C30] rounded-xl p-6">
              <h3 className="text-base font-semibold text-white mb-2">
                Mobile-first usability
              </h3>
              <p className="text-sm text-[#A6B4AC] leading-relaxed">
                Designed so field staff, retail partners, parents, and patients can complete
                actions smoothly on everyday Android phones.
              </p>
            </div>
            <div className="bg-[#101C18] border border-[#203C30] rounded-xl p-6">
              <h3 className="text-base font-semibold text-white mb-2">
                Role-appropriate views
              </h3>
              <p className="text-sm text-[#A6B4AC] leading-relaxed">
                Front-desk staff sees daily tasks, managers see branch status, and owners see
                summaries—without cluttering every screen.
              </p>
            </div>
            <div className="bg-[#101C18] border border-[#203C30] rounded-xl p-6">
              <h3 className="text-base font-semibold text-white mb-2">
                Connected to AI & Automation
              </h3>
              <p className="text-sm text-[#A6B4AC] leading-relaxed">
                Your website and custom portal feed directly into WhatsApp confirmations, sheets,
                and AI enquiry agents.
              </p>
            </div>
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
