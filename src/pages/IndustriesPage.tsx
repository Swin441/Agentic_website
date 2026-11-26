import React from 'react';
import {PageHero} from '../components/hero/PageHero';
import {IndustriesHeroVisual} from '../components/hero/IndustriesHeroVisual';
import {SectionHeading} from '../components/ui/SectionHeading';
import {IndustryCard} from '../components/ui/Cards';
import {CtaSection} from '../components/sections/CtaSection';
import {INDUSTRIES} from '../data/siteData';

export function IndustriesPage() {
  return (
    <>
      <PageHero
        kicker="Industries We Serve"
        title="Built for how Indian businesses actually operate."
        description="Different industries deal with different daily bottlenecks—missed admission calls, reception queues, unstructured WhatsApp orders, or cold site-visit leads. We configure practical AI and software around your sector."
        primaryCtaLabel="Book a Free Demo"
        primaryCtaTo="/contact"
        secondaryCtaLabel="Explore Concept Demos"
        secondaryCtaTo="/work"
        visual={<IndustriesHeroVisual />}
      />

      <section className="py-16 lg:py-24 border-t border-[#203C30]">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <SectionHeading
            kicker="Sector breakdown"
            title="How Axom Hub upgrades operations across five core SMB sectors"
            description="Every implementation focuses on reducing manual desk effort and improving enquiry response consistency."
          />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {INDUSTRIES.map((industry) => (
              <IndustryCard
                key={industry.id}
                number={industry.number}
                name={industry.name}
                audience={industry.audience}
                bottleneck={industry.bottleneck}
                solution={industry.solution}
                workflows={industry.workflows}
              />
            ))}
          </div>
        </div>
      </section>

      <CtaSection
        title="Don’t see your exact business category listed?"
        description="We work with growing Indian SMBs across services, trading, hospitality, and healthcare. Tell us how your team handles daily enquiries and follow-ups."
      />
    </>
  );
}
