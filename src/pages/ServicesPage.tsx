import React from 'react';
import {PageHero} from '../components/hero/PageHero';
import {ServicesHeroVisual} from '../components/hero/ServicesHeroVisual';
import {SectionHeading} from '../components/ui/SectionHeading';
import {ServiceCard} from '../components/ui/Cards';
import {CtaSection} from '../components/sections/CtaSection';
import {CORE_SERVICES} from '../data/siteData';

export function ServicesPage() {
  return (
    <>
      <PageHero
        kicker="Services Overview"
        title="Practical technology built around how your business operates."
        description="Whether you need an AI assistant on WhatsApp, automated lead and billing follow-ups, or custom software to replace messy spreadsheets, every capability works together cleanly."
        primaryCtaLabel="Book a Free Demo"
        primaryCtaTo="/contact"
        secondaryCtaLabel="Inspect Concept Demos"
        secondaryCtaTo="/work"
        visual={<ServicesHeroVisual />}
      />

      <section className="py-16 lg:py-24 border-t border-[#203C30]">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <SectionHeading
            kicker="Core capabilities"
            title="Four pillars of the Axom Hub business upgrade"
            description="Adopt one focused solution first, or combine them as your operations grow."
          />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {CORE_SERVICES.map((service) => (
              <ServiceCard
                key={service.id}
                number={service.number}
                title={service.title}
                summary={service.summary}
                outcome={service.outcome}
                route={service.route}
                deliverables={service.deliverables}
                actionLabel={`Open ${service.title}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 border-t border-[#203C30] bg-[#101C18]/35">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <SectionHeading
            kicker="Choosing a starting point"
            title="Start with the bottleneck costing you the most time today"
          />

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#101C18] border border-[#203C30] rounded-xl p-6">
              <p className="font-mono text-xs text-[#AEF830] mb-2">If enquiries go unanswered</p>
              <h3 className="text-lg font-semibold text-white mb-2">Start with AI Agents</h3>
              <p className="text-sm text-[#A6B4AC] leading-relaxed">
                Handle WhatsApp and website questions instantly, collect student or patient details,
                and schedule callbacks without hiring extra night-shift desk staff.
              </p>
            </div>
            <div className="bg-[#101C18] border border-[#203C30] rounded-xl p-6">
              <p className="font-mono text-xs text-[#AEF830] mb-2">If staff repeats manual updates</p>
              <h3 className="text-lg font-semibold text-white mb-2">Start with Automation</h3>
              <p className="text-sm text-[#A6B4AC] leading-relaxed">
                Connect your lead forms, WhatsApp messages, Google Sheets, and reminders so records
                stay accurate automatically.
              </p>
            </div>
            <div className="bg-[#101C18] border border-[#203C30] rounded-xl p-6">
              <p className="font-mono text-xs text-[#AEF830] mb-2">If spreadsheets are breaking</p>
              <h3 className="text-lg font-semibold text-white mb-2">Start with Custom Software</h3>
              <p className="text-sm text-[#A6B4AC] leading-relaxed">
                Move batch tracking, clinic queues, dealer orders, or customer bookings into a clean
                web application built for your team.
              </p>
            </div>
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
