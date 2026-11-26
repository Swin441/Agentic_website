import React from 'react';
import {ArrowRight} from 'lucide-react';
import {PageHero} from '../components/hero/PageHero';
import {AiAgentsHeroVisual} from '../components/hero/AiAgentsHeroVisual';
import {SectionHeading} from '../components/ui/SectionHeading';
import {CtaSection} from '../components/sections/CtaSection';
import {AI_AGENT_ROLES} from '../data/siteData';
import {Link} from '../router/RouterContext';

export function AiAgentsPage() {
  return (
    <>
      <PageHero
        kicker="Services · AI Agents"
        title="AI Agents built to handle real customer conversations cleanly."
        description="Trained strictly on your timings, services, fee structures, and booking rules—so your business replies promptly on WhatsApp and web chat across Guwahati and India while your team focuses on closing and delivery."
        primaryCtaLabel="Book a Free Demo"
        primaryCtaTo="/contact"
        secondaryCtaLabel="See Concept Demos"
        secondaryCtaTo="/work"
        visual={<AiAgentsHeroVisual />}
      />

      <section className="py-16 lg:py-24 border-t border-[#203C30]">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <SectionHeading
            kicker="Agent capabilities"
            title="Four practical AI agent roles for Indian SMBs"
            description="Every agent is designed for clear, everyday business tasks—never open-ended guesswork."
          />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {AI_AGENT_ROLES.map((agent) => (
              <article
                key={agent.number}
                className="bg-[#101C18] border border-[#203C30] rounded-xl p-6 sm:p-7 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <span className="font-mono text-xs text-[#AEF830] tabular-nums">
                      {agent.number}
                    </span>
                    <span className="font-mono text-xs text-[#A6B4AC]">{agent.channels}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white">{agent.role}</h3>
                  <p className="text-sm text-[#AEF830] mt-1 mb-3">{agent.title}</p>
                  <p className="text-sm sm:text-[15px] text-[#A6B4AC] leading-relaxed mb-5">
                    {agent.description}
                  </p>
                </div>

                <ul className="space-y-2 pt-4 border-t border-[#203C30]">
                  {agent.tasks.map((task) => (
                    <li key={task} className="text-sm text-[#D8E6DE] flex items-start gap-2.5">
                      <span className="text-[#AEF830] font-mono" aria-hidden="true">
                        —
                      </span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 border-t border-[#203C30] bg-[#101C18]/35">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <SectionHeading
            kicker="Safety & human control"
            title="Your business rules stay in charge"
            description="Business owners worry—rightly—about AI saying something inaccurate to a customer. We build clear boundaries into every deployment."
          />

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#101C18] border border-[#203C30] rounded-xl p-6">
              <h3 className="text-base font-semibold text-white mb-2">
                Approved knowledge only
              </h3>
              <p className="text-sm text-[#A6B4AC] leading-relaxed">
                Agents answer from your verified fee cards, service lists, schedules, and FAQs
                rather than making up offers or policies.
              </p>
            </div>
            <div className="bg-[#101C18] border border-[#203C30] rounded-xl p-6">
              <h3 className="text-base font-semibold text-white mb-2">
                Clean human handoff
              </h3>
              <p className="text-sm text-[#A6B4AC] leading-relaxed">
                Whenever a customer asks for custom negotiation, an urgent medical question, or
                complex support, the conversation routes straight to your staff.
              </p>
            </div>
            <div className="bg-[#101C18] border border-[#203C30] rounded-xl p-6">
              <h3 className="text-base font-semibold text-white mb-2">
                Structured records
              </h3>
              <p className="text-sm text-[#A6B4AC] leading-relaxed">
                Every qualified enquiry is summarized neatly into your Google Sheet or portal so
                your team never has to read long chat histories to follow up.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm">
            <Link
              to="/services/automation"
              className="inline-flex items-center gap-1.5 text-[#AEF830] hover:underline"
            >
              <span>Pair with WhatsApp &amp; Business Automation</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              to="/services#pricing"
              className="inline-flex items-center gap-1.5 text-[#A6B4AC] hover:text-white"
            >
              <span>See how custom INR quotations work</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <CtaSection
        title="Want to see an AI agent trained on your own FAQs?"
        description="Book a free demo and bring your common WhatsApp customer questions. We will walk you through how a practical agent handles them."
      />
    </>
  );
}
