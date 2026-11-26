import React from 'react';
import {PageHero} from '../components/hero/PageHero';
import {AboutHeroVisual} from '../components/hero/AboutHeroVisual';
import {SectionHeading} from '../components/ui/SectionHeading';
import {CtaSection} from '../components/sections/CtaSection';
import {CORE_SERVICES, INDUSTRIES, PROCESS_STEPS} from '../data/siteData';

export function AboutPage() {
  return (
    <>
      <PageHero
        kicker="About Axom Hub"
        title="Practical AI and software built for real Indian businesses."
        description="Axom Hub is an AI and business technology agency focused on helping small and medium businesses adopt clear, dependable systems—without corporate complexity or technical jargon."
        primaryCtaLabel="Book a Free Demo"
        primaryCtaTo="/contact"
        secondaryCtaLabel="Explore Services"
        secondaryCtaTo="/services"
        visual={<AboutHeroVisual />}
      />

      <section className="py-16 lg:py-24 border-t border-[#203C30]">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
            <div className="lg:col-span-5">
              <SectionHeading
                kicker="Purpose & approach"
                title="Technology should remove daily friction, not add another tool to manage."
              />
            </div>

            <div className="lg:col-span-7 space-y-5 text-base text-[#A6B4AC] leading-[1.7]">
              <p>
                Most AI tools and enterprise software suites are built for large corporations with
                dedicated IT departments. Small and medium businesses in India—coaching centres,
                clinics, distributors, real estate offices, and local service teams—need something
                much more direct.
              </p>
              <p>
                At Axom Hub, we start with how your team already works on WhatsApp, phone calls,
                spreadsheets, and websites. We build focused AI agents, automations, and custom
                software that solve concrete problems: responding faster to customer enquiries,
                reducing manual data entry, and keeping follow-ups consistent.
              </p>
              <p className="text-white font-medium">
                We communicate in plain business language, show working prototypes early, and stay
                hands-on until your staff is comfortable using the system every day.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 border-t border-[#203C30] bg-[#101C18]/35">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <SectionHeading
            kicker="What we focus on"
            title="Capabilities and businesses we serve"
          />

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#101C18] border border-[#203C30] rounded-xl p-6 sm:p-7">
              <h3 className="text-lg font-semibold text-white mb-4">Core Capabilities</h3>
              <ul className="space-y-3">
                {CORE_SERVICES.map((s) => (
                  <li key={s.id} className="border-b border-[#203C30] pb-3 last:border-b-0 last:pb-0">
                    <p className="text-sm font-medium text-white">
                      {s.number}. {s.title}
                    </p>
                    <p className="text-xs text-[#A6B4AC] mt-1">{s.outcome}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#101C18] border border-[#203C30] rounded-xl p-6 sm:p-7">
              <h3 className="text-lg font-semibold text-white mb-4">Target Audience</h3>
              <ul className="space-y-3">
                {INDUSTRIES.map((ind) => (
                  <li
                    key={ind.id}
                    className="border-b border-[#203C30] pb-3 last:border-b-0 last:pb-0"
                  >
                    <p className="text-sm font-medium text-white">{ind.name}</p>
                    <p className="text-xs text-[#A6B4AC] mt-1">{ind.audience}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 border-t border-[#203C30]">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <SectionHeading
            kicker="Working process"
            title="How every engagement progresses"
          />

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS_STEPS.map((step) => (
              <div
                key={step.number}
                className="bg-[#101C18] border border-[#203C30] rounded-xl p-6"
              >
                <span className="font-mono text-xs text-[#AEF830] tabular-nums">
                  {step.number}
                </span>
                <h3 className="text-base font-semibold text-white mt-2 mb-2">{step.title}</h3>
                <p className="text-sm text-[#A6B4AC] leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
