import React from 'react';
import {PageHero} from '../components/hero/PageHero';
import {ServicesHeroVisual} from '../components/hero/ServicesHeroVisual';
import {SectionHeading} from '../components/ui/SectionHeading';
import {ServiceCard} from '../components/ui/Cards';
import {PricingSection} from '../components/sections/PricingSection';
import {CtaSection} from '../components/sections/CtaSection';
import {CORE_SERVICES} from '../data/siteData';

export function ServicesPage() {
  return (
    <>
      <PageHero
        kicker="Services Overview · Guwahati & Pan-India"
        title="AI agents, automation, and custom software shaped around your operations."
        description="Based in Guwahati, Assam, Axom Hub builds practical AI agents, WhatsApp automation, business automation, custom software, websites and applications, and AI integrations for growing Indian SMBs."
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
            title="Six pillars of the Axom Hub business upgrade"
            description="Adopt one focused workflow first, or combine AI agents, WhatsApp automation, and custom software as your operations grow."
          />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                Handle WhatsApp and website questions instantly, collect student, patient, or
                showroom buyer details, and schedule callbacks without hiring extra night-shift
                staff.
              </p>
            </div>
            <div className="bg-[#101C18] border border-[#203C30] rounded-xl p-6">
              <p className="font-mono text-xs text-[#AEF830] mb-2">If staff repeats manual updates</p>
              <h3 className="text-lg font-semibold text-white mb-2">
                Start with WhatsApp &amp; Automation
              </h3>
              <p className="text-sm text-[#A6B4AC] leading-relaxed">
                Connect your lead forms, WhatsApp Business messages, Google Sheets, and reminders so
                records stay accurate automatically.
              </p>
            </div>
            <div className="bg-[#101C18] border border-[#203C30] rounded-xl p-6">
              <p className="font-mono text-xs text-[#AEF830] mb-2">If spreadsheets are breaking</p>
              <h3 className="text-lg font-semibold text-white mb-2">
                Start with Software &amp; AI Integrations
              </h3>
              <p className="text-sm text-[#A6B4AC] leading-relaxed">
                Move batch tracking, clinic queues, showroom quotes, or dealer orders into a clean
                web portal or connect AI directly into your existing tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      <PricingSection />

      <CtaSection />
    </>
  );
}
