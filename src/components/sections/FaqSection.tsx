import React from 'react';
import {BUYER_FAQS} from '../../data/siteData';
import {SectionHeading} from '../ui/SectionHeading';
import {SecondaryButton} from '../ui/Buttons';

export function FaqSection() {
  return (
    <section id="faq" className="py-16 lg:py-24 border-t border-[#203C30]">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <SectionHeading
            kicker="Frequently asked questions"
            title="Clear answers before you book a walkthrough"
            description="Straightforward details on how AI agents, WhatsApp automation, custom INR scoping, data protection, and human handoff work for Indian SMBs."
          />
          <SecondaryButton to="/contact">Ask About Your Workflow</SecondaryButton>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {BUYER_FAQS.map((item, idx) => (
            <article
              key={item.question}
              data-swarm-target="leaf"
              className="bg-[#101C18] border border-[#203C30] rounded-xl p-6 sm:p-7 flex flex-col justify-between"
            >
              <div>
                <span className="font-mono text-xs text-[#AEF830] tabular-nums">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <h3 className="text-lg font-semibold text-white mt-2 mb-3">{item.question}</h3>
                <p className="text-sm sm:text-[15px] text-[#A6B4AC] leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
