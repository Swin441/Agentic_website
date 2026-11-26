import React from 'react';
import {ArrowRight} from 'lucide-react';
import {PageHero} from '../components/hero/PageHero';
import {AutomationHeroVisual} from '../components/hero/AutomationHeroVisual';
import {SectionHeading} from '../components/ui/SectionHeading';
import {CtaSection} from '../components/sections/CtaSection';
import {AUTOMATION_CATEGORIES} from '../data/siteData';
import {Link} from '../router/RouterContext';

export function AutomationPage() {
  return (
    <>
      <PageHero
        kicker="Services · WhatsApp & Business Automation"
        title="WhatsApp and business automation that removes repetitive desk work."
        description="We connect your WhatsApp Business replies, enquiry forms, Google Sheets, calendars, and billing notifications so daily follow-ups happen reliably behind the scenes for your team."
        primaryCtaLabel="Book a Free Demo"
        primaryCtaTo="/contact"
        secondaryCtaLabel="Explore Custom Software"
        secondaryCtaTo="/services/software"
        visual={<AutomationHeroVisual />}
      />

      <section className="py-16 lg:py-24 border-t border-[#203C30]">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <SectionHeading
            kicker="Automation workflows"
            title="Practical automations that save hours every week"
            description="Each workflow starts from a real event in your business and completes the routine steps your staff otherwise does manually."
          />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {AUTOMATION_CATEGORIES.map((category) => (
              <article
                key={category.number}
                className="bg-[#101C18] border border-[#203C30] rounded-xl p-6 sm:p-7 flex flex-col justify-between"
              >
                <div>
                  <span className="font-mono text-xs text-[#AEF830] tabular-nums">
                    {category.number}
                  </span>
                  <h3 className="text-xl font-semibold text-white mt-2 mb-3">
                    {category.title}
                  </h3>

                  <div className="rounded-lg bg-[#07130F] border border-[#203C30] p-3.5 mb-5">
                    <p className="font-mono text-[11px] text-[#53685E]">Starts when</p>
                    <p className="text-sm text-white mt-0.5">{category.trigger}</p>
                  </div>

                  <ul className="space-y-2 mb-5">
                    {category.actions.map((action) => (
                      <li
                        key={action}
                        className="text-sm text-[#A6B4AC] flex items-start gap-2.5"
                      >
                        <span className="text-[#AEF830] font-mono" aria-hidden="true">
                          —
                        </span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-[#203C30]">
                  <p className="font-mono text-[11px] text-[#AEF830] mb-1">Business benefit</p>
                  <p className="text-sm text-white leading-relaxed">{category.benefit}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 border-t border-[#203C30] bg-[#101C18]/35">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <SectionHeading
            kicker="Connected tools"
            title="Works with the tools your team already uses"
            description="You do not have to throw away your spreadsheets or switch every tool overnight. We connect into your existing workflow first."
          />

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              'WhatsApp Business',
              'Google Sheets',
              'Google Calendar',
              'Website Lead Forms',
              'Email & Notifications',
              'Custom Portals & APIs',
            ].map((tool) => (
              <div
                key={tool}
                className="bg-[#101C18] border border-[#203C30] rounded-xl p-4 text-center flex items-center justify-center min-h-[76px]"
              >
                <span className="text-xs sm:text-sm font-medium text-white">{tool}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm">
            <Link
              to="/services/ai-agents"
              className="inline-flex items-center gap-1.5 text-[#AEF830] hover:underline"
            >
              <span>Add AI Agents to qualify leads first</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              to="/industries"
              className="inline-flex items-center gap-1.5 text-[#A6B4AC] hover:text-white"
            >
              <span>See sector-specific workflows</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
