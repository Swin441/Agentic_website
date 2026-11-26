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
        kicker="Industries We Serve · Guwahati & Across India"
        title="Built for coaching institutes, showrooms, clinics, and distributors across India."
        description="Different sectors face different daily bottlenecks—missed admission calls, showroom walk-in follow-ups, reception queues, unstructured WhatsApp orders, or cold site-visit leads. From Guwahati, Assam to cities across India, we build practical AI and software around your business."
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
            title="How Axom Hub upgrades operations across six core SMB segments"
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
        title="Running a different type of Indian SMB?"
        description="We work with growing businesses across services, retail, trading, hospitality, and healthcare in Assam and across India. Tell us how your team handles daily enquiries and follow-ups."
      />
    </>
  );
}
