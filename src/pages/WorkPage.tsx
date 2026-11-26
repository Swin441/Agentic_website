import React, {useState} from 'react';
import {PageHero} from '../components/hero/PageHero';
import {WorkHeroVisual} from '../components/hero/WorkHeroVisual';
import {SectionHeading} from '../components/ui/SectionHeading';
import {ProjectDemoCard} from '../components/ui/Cards';
import {PrimaryButton, SecondaryButton} from '../components/ui/Buttons';
import {CtaSection} from '../components/sections/CtaSection';
import {CONCEPT_DEMOS, type DemoItem} from '../data/siteData';

type DemoFilter = 'All' | 'Concept Demo' | 'Product Prototype';

const SCENARIO_DETAILS: Record<
  DemoItem['interactiveScenarioKey'],
  {
    steps: {step: string; title: string; output: string}[];
  }
> = {
  coaching: {
    steps: [
      {
        step: 'Step 01',
        title: 'Enquiry received on WhatsApp',
        output: 'Parent asks about Class 11 Science timings, location, and fee structure.',
      },
      {
        step: 'Step 02',
        title: 'AI agent qualifies & shares brochure',
        output: 'Captures student name, board, and preferred batch timing; sends fee overview.',
      },
      {
        step: 'Step 03',
        title: 'Demo slot confirmed & logged',
        output: 'Saturday counselling slot booked; admissions sheet updated for counsellor call.',
      },
    ],
  },
  clinic: {
    steps: [
      {
        step: 'Step 01',
        title: 'Patient requests appointment',
        output: 'Checks specialist availability without waiting on busy reception phone lines.',
      },
      {
        step: 'Step 02',
        title: 'Slot confirmed with prep note',
        output: 'Sends clinic location pin and instructions on bringing past prescriptions.',
      },
      {
        step: 'Step 03',
        title: 'Automated visit reminder',
        output: 'Morning-of WhatsApp reminder confirms attendance or frees slot if rescheduled.',
      },
    ],
  },
  distribution: {
    steps: [
      {
        step: 'Step 01',
        title: 'Retailer opens reorder portal',
        output: 'Selects required pack sizes and quantities from a clean mobile SKU list.',
      },
      {
        step: 'Step 02',
        title: 'Order synced to dispatch sheet',
        output: 'Eliminates manual re-typing from unstructured chat voice notes or photos.',
      },
      {
        step: 'Step 03',
        title: 'Dispatch confirmation sent',
        output: 'Retailer receives automated WhatsApp notification once vehicle leaves warehouse.',
      },
    ],
  },
  realestate: {
    steps: [
      {
        step: 'Step 01',
        title: 'Buyer enquires from ad or site',
        output: 'Receives project floor plans, configurations, and starting price range immediately.',
      },
      {
        step: 'Step 02',
        title: 'Budget & timeline captured',
        output: 'Agent records 2BHK/3BHK preference and purchase timeline cleanly.',
      },
      {
        step: 'Step 03',
        title: 'Weekend site visit scheduled',
        output: 'Sales advisor receives organized brief prior to the customer arriving on site.',
      },
    ],
  },
};

export function WorkPage() {
  const [filter, setFilter] = useState<DemoFilter>('All');
  const [activePreviewId, setActivePreviewId] = useState<string>(CONCEPT_DEMOS[0].id);

  const filteredDemos =
    filter === 'All' ? CONCEPT_DEMOS : CONCEPT_DEMOS.filter((d) => d.kind === filter);

  const activeDemo =
    CONCEPT_DEMOS.find((d) => d.id === activePreviewId) ?? CONCEPT_DEMOS[0];
  const activeFlow = SCENARIO_DETAILS[activeDemo.interactiveScenarioKey];

  return (
    <>
      <PageHero
        kicker="Work & Concept Demos"
        title="Concept demos and prototypes for everyday business workflows."
        description="Review our interactive concept demos and product prototypes below. Each build is clearly labelled to distinguish concept demonstrations from verified client deployments."
        primaryCtaLabel="Request a Tailored Demo"
        primaryCtaTo="/contact"
        secondaryCtaLabel="View Services & INR Scoping"
        secondaryCtaTo="/services"
        visual={<WorkHeroVisual />}
      />

      <section className="py-16 lg:py-24 border-t border-[#203C30]">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <SectionHeading
              kicker="Concept library"
              title="Concept demos and product prototypes"
              description="We do not publish fabricated client logos, testimonials, or unverified metrics. Inspect how these workflows operate step by step."
            />

            {/* Interactive Filter Control */}
            <div
              role="group"
              aria-label="Filter demos by type"
              className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#101C18] border border-[#203C30] self-start lg:self-auto"
            >
              {(['All', 'Concept Demo', 'Product Prototype'] as DemoFilter[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilter(tab)}
                  className={`px-3.5 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    filter === tab
                      ? 'bg-[#AEF830] text-[#07130F]'
                      : 'text-[#A6B4AC] hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDemos.map((demo) => (
              <ProjectDemoCard
                key={demo.id}
                kind={demo.kind}
                sector={demo.sector}
                title={demo.title}
                summary={demo.summary}
                highlights={demo.highlights}
                relatedServiceRoute={demo.relatedServiceRoute}
                isActivePreview={demo.id === activeDemo.id}
                onPreview={() => {
                  setActivePreviewId(demo.id);
                  const panel = document.getElementById('demo-inspector');
                  if (panel) {
                    panel.scrollIntoView({behavior: 'smooth', block: 'nearest'});
                  }
                }}
              />
            ))}
          </div>

          {/* Interactive Flow Inspector */}
          <div
            id="demo-inspector"
            className="mt-12 rounded-2xl bg-[#101C18] border border-[#203C30] p-6 sm:p-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#203C30]">
              <div>
                <div className="flex items-center gap-2 font-mono text-xs mb-2">
                  <span className="text-[#AEF830]">{activeDemo.kind}</span>
                  <span className="text-[#53685E]" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-[#A6B4AC]">{activeDemo.sector}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-white">
                  {activeDemo.title} — Step-by-Step Walkthrough
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <SecondaryButton to={activeDemo.relatedServiceRoute}>
                  Related Service
                </SecondaryButton>
                <PrimaryButton to="/contact">Adapt for Your Business</PrimaryButton>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              {activeFlow.steps.map((item) => (
                <div
                  key={item.step}
                  className="rounded-xl bg-[#07130F] border border-[#203C30] p-5"
                >
                  <span className="font-mono text-xs text-[#AEF830]">{item.step}</span>
                  <h4 className="text-base font-semibold text-white mt-2 mb-2">{item.title}</h4>
                  <p className="text-sm text-[#A6B4AC] leading-relaxed">{item.output}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
