import React from 'react';
import {ArrowRight} from 'lucide-react';
import {PageHero} from '../components/hero/PageHero';
import {HomeHeroVisual} from '../components/hero/HomeHeroVisual';
import {SectionHeading} from '../components/ui/SectionHeading';
import {ServiceCard} from '../components/ui/Cards';
import {PrimaryButton, SecondaryButton} from '../components/ui/Buttons';
import {FaqSection} from '../components/sections/FaqSection';
import {CtaSection} from '../components/sections/CtaSection';
import {Link} from '../router/RouterContext';
import {
  AI_AGENT_ROLES,
  BUSINESS_PROBLEMS,
  CORE_SERVICES,
  INDUSTRIES,
  PROCESS_STEPS,
} from '../data/siteData';

export function HomePage() {
  return (
    <>
      {/* 1. Hero */}
      <PageHero
        kicker="AI & Business Technology Agency · Guwahati, Assam"
        title="Your Business. Upgraded with AI."
        description="Axom Hub is an AI and business technology agency based in Guwahati, Assam, serving small and medium businesses across India. We build practical AI agents, WhatsApp automation, custom software, websites, and AI integrations so your team replies faster and runs cleaner operations."
        primaryCtaLabel="Book a Free Demo"
        primaryCtaTo="/contact"
        secondaryCtaLabel="Explore Services"
        secondaryCtaTo="/services"
        footnote="Built for coaching institutes, retailers and showrooms, clinics, distributors, real estate, and growing Indian SMBs."
        visual={<HomeHeroVisual />}
      />

      {/* 2. Business Problems */}
      <section className="py-16 lg:py-24 border-t border-[#203C30]">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <SectionHeading
            kicker="Everyday bottlenecks"
            title="Where growing businesses lose enquiries and team hours"
            description="Most small and medium businesses do not need complex dashboards. They need reliable systems that handle enquiries, WhatsApp follow-ups, and daily records cleanly."
          />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {BUSINESS_PROBLEMS.map((problem) => (
              <div
                key={problem.number}
                data-swarm-target="leaf"
                className="bg-[#101C18] border border-[#203C30] rounded-xl p-6 sm:p-7 flex flex-col justify-between gap-5"
              >
                <div>
                  <span className="font-mono text-xs text-[#AEF830] tabular-nums">
                    {problem.number}
                  </span>
                  <h3 className="text-xl font-semibold text-white mt-2 mb-2.5">
                    {problem.title}
                  </h3>
                  <p className="text-sm sm:text-[15px] text-[#A6B4AC] leading-relaxed">
                    {problem.description}
                  </p>
                </div>
                <div className="pt-4 border-t border-[#203C30]">
                  <p className="font-mono text-[11px] text-[#AEF830] mb-1">Practical upgrade</p>
                  <p className="text-sm text-white leading-relaxed">{problem.upgrade}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. AI Team / Agent Capabilities */}
      <section className="py-16 lg:py-24 border-t border-[#203C30] bg-[#101C18]/35">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <SectionHeading
              kicker="AI Agents"
              title="Practical digital assistants trained on your business rules"
              description="Each AI agent handles one clear responsibility—answering enquiries accurately, qualifying leads, booking slots, or helping your staff look up information."
            />
            <SecondaryButton to="/services/ai-agents">Explore AI Agents</SecondaryButton>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {AI_AGENT_ROLES.map((agent) => (
              <div
                key={agent.number}
                data-swarm-target="leaf"
                className="bg-[#101C18] border border-[#203C30] rounded-xl p-6 flex flex-col justify-between axom-card-hover"
              >
                <div>
                  <div className="font-mono text-xs text-[#AEF830] tabular-nums mb-2">
                    {agent.number}
                  </div>
                  <p className="font-mono text-[11px] text-[#53685E] mb-2">{agent.channels}</p>
                  <h3 className="text-lg font-semibold text-white mb-2">{agent.role}</h3>
                  <p className="text-sm text-[#A6B4AC] leading-relaxed mb-4">
                    {agent.description}
                  </p>
                </div>
                <ul className="space-y-1.5 pt-4 border-t border-[#203C30]">
                  {agent.tasks.map((task) => (
                    <li key={task} className="text-xs text-[#D8E6DE] flex items-start gap-2">
                      <span className="text-[#AEF830] font-mono" aria-hidden="true">
                        —
                      </span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Connected Workflow */}
      <section className="py-16 lg:py-24 border-t border-[#203C30]">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <SectionHeading
              kicker="Connected workflow"
              title="From incoming message to organized team action"
              description="Instead of separate disconnected tools, WhatsApp automation and AI integrations pass clean customer details forward automatically."
            />
            <Link
              to="/services/automation"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#AEF830] hover:text-[#B5FF38] whitespace-nowrap"
            >
              <span>See how WhatsApp &amp; business automation connect</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-5">
            {[
              {
                step: '01',
                title: 'Customer reaches out',
                detail: 'Message arrives via WhatsApp, website form, or ad enquiry at any hour.',
              },
              {
                step: '02',
                title: 'AI agent responds & qualifies',
                detail: 'Shares accurate details, answers FAQs, and captures key requirements.',
              },
              {
                step: '03',
                title: 'Automation updates records',
                detail: 'Logs lead in your sheet or portal, schedules slot, and alerts assigned staff.',
              },
              {
                step: '04',
                title: 'Your team closes with context',
                detail: 'Staff picks up warm, organized enquiries instead of chasing missed calls.',
              },
            ].map((item) => (
              <div
                key={item.step}
                data-swarm-target="leaf"
                className="bg-[#101C18] border border-[#203C30] rounded-xl p-6"
              >
                <span className="font-mono text-xs text-[#AEF830] tabular-nums">{item.step}</span>
                <h3 className="text-base font-semibold text-white mt-3 mb-2">{item.title}</h3>
                <p className="text-sm text-[#A6B4AC] leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Industries */}
      <section className="py-16 lg:py-24 border-t border-[#203C30] bg-[#101C18]/35">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <SectionHeading
              kicker="Industries we serve"
              title="Tailored for Indian small and medium businesses"
              description="From Guwahati and Assam to growing cities across India, every sector has its own enquiry rhythm and follow-up habits. We build around how your customers communicate."
            />
            <SecondaryButton to="/industries">View All Industries</SecondaryButton>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {INDUSTRIES.map((industry) => (
              <div
                key={industry.id}
                data-swarm-target="leaf"
                className="bg-[#101C18] border border-[#203C30] rounded-xl p-6 flex flex-col justify-between axom-card-hover"
              >
                <div>
                  <span className="font-mono text-xs text-[#AEF830] tabular-nums">
                    {industry.number}
                  </span>
                  <h3 className="text-lg font-semibold text-white mt-2">{industry.name}</h3>
                  <p className="text-xs text-[#53685E] mt-1 mb-4">{industry.audience}</p>
                  <p className="text-sm text-[#A6B4AC] leading-relaxed">{industry.solution}</p>
                </div>
                <div className="mt-5 pt-4 border-t border-[#203C30]">
                  <Link
                    to="/industries"
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-[#AEF830] hover:underline"
                  >
                    <span>Explore {industry.name} workflows</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Services */}
      <section className="py-16 lg:py-24 border-t border-[#203C30]">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <SectionHeading
              kicker="Services"
              title="Six practical ways we upgrade your operations"
              description="Start with a focused AI agent or WhatsApp automation workflow, or combine custom software, websites, and AI integrations—quoted in INR after a workflow audit."
            />
            <SecondaryButton to="/services">Services &amp; INR Scoping</SecondaryButton>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CORE_SERVICES.map((service) => (
              <div key={service.id} data-swarm-target="leaf" className="h-full">
                <ServiceCard
                  number={service.number}
                  title={service.title}
                  summary={service.summary}
                  outcome={service.outcome}
                  route={service.route}
                  deliverables={service.deliverables}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Process */}
      <section className="py-16 lg:py-24 border-t border-[#203C30] bg-[#101C18]/35">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <SectionHeading
              kicker="How we work"
              title="Clear steps from first conversation to team handover"
              description="We keep implementation grounded, transparent, and easy for your staff to adopt."
            />
            <PrimaryButton to="/work">Inspect Concept Demos</PrimaryButton>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS_STEPS.map((step) => (
              <div
                key={step.number}
                data-swarm-target="leaf"
                className="bg-[#101C18] border border-[#203C30] rounded-xl p-6 flex flex-col justify-between"
              >
                <div>
                  <span className="font-mono text-xs text-[#AEF830] tabular-nums">
                    {step.number}
                  </span>
                  <h3 className="text-lg font-semibold text-white mt-2 mb-2.5">{step.title}</h3>
                  <p className="text-sm text-[#A6B4AC] leading-relaxed">{step.description}</p>
                </div>
                <div className="mt-5 pt-4 border-t border-[#203C30]">
                  <p className="font-mono text-[11px] text-[#53685E]">Deliverable</p>
                  <p className="text-xs text-white mt-1">{step.deliverable}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Buyer FAQ */}
      <FaqSection />

      {/* 9. Final CTA */}
      <CtaSection />
    </>
  );
}
