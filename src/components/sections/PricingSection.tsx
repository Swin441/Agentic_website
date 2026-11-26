import React from 'react';
import {ArrowRight} from 'lucide-react';
import {INR_PRICING_SCOPES} from '../../data/siteData';
import {SectionHeading} from '../ui/SectionHeading';
import {PrimaryButton} from '../ui/Buttons';
import {Link} from '../../router/RouterContext';

export function PricingSection() {
  return (
    <section id="pricing" className="py-16 lg:py-24 border-t border-[#203C30]">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <SectionHeading
            kicker="INR Scoping & Quotations"
            title="Custom INR (₹) quotations matched to your workflow scope"
            description="We do not lock small and medium businesses into inflated enterprise packages. Every project is quoted transparently in Indian Rupees (₹) after a free 30-minute workflow audit."
          />
          <PrimaryButton to="/contact">Request Custom INR Quote</PrimaryButton>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {INR_PRICING_SCOPES.map((tier) => (
            <article
              key={tier.number}
              data-swarm-target="leaf"
              className="bg-[#101C18] border border-[#203C30] rounded-xl p-6 sm:p-7 flex flex-col justify-between axom-card-hover"
            >
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <span className="font-mono text-xs text-[#AEF830] tabular-nums">
                    {tier.number}
                  </span>
                  <span className="font-mono text-[11px] text-[#53685E]">INR Quotation</span>
                </div>

                <h3 className="text-xl font-semibold text-white tracking-[-0.02em]">
                  {tier.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#A6B4AC] mt-2 leading-relaxed">
                  {tier.bestFor}
                </p>

                <div className="mt-5 pt-4 border-t border-[#203C30]">
                  <p className="font-mono text-xs text-[#AEF830]">{tier.quotationBasis}</p>
                </div>

                <ul className="mt-4 space-y-2.5 mb-6">
                  {tier.scopeFactors.map((factor) => (
                    <li
                      key={factor}
                      className="text-xs sm:text-sm text-[#D8E6DE] flex items-start gap-2.5"
                    >
                      <span className="text-[#AEF830] font-mono mt-0.5" aria-hidden="true">
                        —
                      </span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-[#203C30] flex items-center justify-between gap-4">
                <Link
                  to={tier.route}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#AEF830] hover:text-[#B5FF38] transition-colors whitespace-nowrap"
                >
                  <span>Inspect scope details</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/contact"
                  className="font-mono text-xs text-[#A6B4AC] hover:text-white transition-colors whitespace-nowrap"
                >
                  Get quote →
                </Link>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-6 text-xs text-[#A6B4AC] leading-relaxed max-w-3xl">
          Ongoing third-party costs—such as official WhatsApp Business API messaging, cloud hosting,
          or AI model API usage—are separated clearly from one-time build fees in your written
          proposal before work begins.
        </p>
      </div>
    </section>
  );
}
