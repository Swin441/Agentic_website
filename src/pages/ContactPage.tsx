import React from 'react';
import {Mail, MapPin, MessageSquare} from 'lucide-react';
import {PageHero} from '../components/hero/PageHero';
import {ContactHeroVisual} from '../components/hero/ContactHeroVisual';
import {ContactForm} from '../components/forms/ContactForm';
import {CONTACT_CONFIG} from '../config/contact';
import {Link} from '../router/RouterContext';

export function ContactPage() {
  return (
    <>
      <PageHero
        kicker="Contact · Guwahati, Assam & Online"
        title="Book a practical walkthrough for your business."
        description="Tell us about your daily enquiries, WhatsApp follow-ups, custom software, or AI integration needs. We will prepare a focused 30-minute walkthrough and custom INR quotation tailored to your business."
        visual={<ContactHeroVisual />}
      />

      <section className="py-12 pb-20 lg:py-16 lg:pb-24 border-t border-[#203C30]">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Form Column */}
            <div className="lg:col-span-7">
              <ContactForm />
            </div>

            {/* Direct Information Column */}
            <aside className="lg:col-span-5 space-y-6">
              <div className="bg-[#101C18] border border-[#203C30] rounded-2xl p-6 sm:p-7 space-y-5">
                <div>
                  <p className="font-mono text-xs text-[#AEF830] mb-2">Direct channels</p>
                  <h2 className="text-xl font-semibold text-white">Axom Hub Consultation</h2>
                </div>

                <div className="space-y-4 pt-2 border-t border-[#203C30]">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-[#AEF830] shrink-0 mt-1" aria-hidden="true" />
                    <div>
                      <p className="text-xs font-mono text-[#53685E]">Region</p>
                      <p className="text-sm text-white mt-0.5">{CONTACT_CONFIG.officeLocation}</p>
                    </div>
                  </div>

                  {CONTACT_CONFIG.contactEmail ? (
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-[#AEF830] shrink-0 mt-1" aria-hidden="true" />
                      <div>
                        <p className="text-xs font-mono text-[#53685E]">Email</p>
                        <a
                          href={`mailto:${CONTACT_CONFIG.contactEmail}`}
                          className="text-sm text-white hover:text-[#AEF830] transition-colors mt-0.5 block"
                        >
                          {CONTACT_CONFIG.contactEmail}
                        </a>
                      </div>
                    </div>
                  ) : null}

                  {CONTACT_CONFIG.whatsappDisplay && CONTACT_CONFIG.whatsappHref ? (
                    <div className="flex items-start gap-3">
                      <MessageSquare
                        className="w-4 h-4 text-[#AEF830] shrink-0 mt-1"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-xs font-mono text-[#53685E]">WhatsApp</p>
                        <a
                          href={CONTACT_CONFIG.whatsappHref}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-white hover:text-[#AEF830] transition-colors mt-0.5 block"
                        >
                          {CONTACT_CONFIG.whatsappDisplay}
                        </a>
                      </div>
                    </div>
                  ) : null}

                  {!CONTACT_CONFIG.contactEmail && !CONTACT_CONFIG.whatsappDisplay && (
                    <div className="rounded-xl bg-[#07130F] border border-[#203C30] p-4">
                      <p className="font-mono text-[11px] text-[#A6B4AC]">
                        Consultation availability
                      </p>
                      <p className="text-xs text-[#A6B4AC] mt-1 leading-relaxed">
                        Walkthroughs are available in Guwahati, Assam or online for businesses
                        across India. Direct phone, email, and WhatsApp links will appear here once
                        published—use the enquiry form on this page to generate your brief.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-[#101C18] border border-[#203C30] rounded-2xl p-6 sm:p-7 space-y-4">
                <h3 className="text-base font-semibold text-white">
                  Common questions before booking
                </h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-medium text-white">
                      Do I need technical staff to use this?
                    </p>
                    <p className="text-[#A6B4AC] mt-1 leading-relaxed">
                      No. Everything is designed for everyday front-desk staff, counsellors, and
                      owners—and we walk your team through using it.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#203C30]">
                    <p className="font-medium text-white">Can we start with just one workflow?</p>
                    <p className="text-[#A6B4AC] mt-1 leading-relaxed">
                      Yes. Most businesses begin with one high-impact setup—like WhatsApp enquiry
                      handling or automated follow-ups—quoted clearly in INR before expanding.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#203C30] flex flex-wrap items-center gap-4">
                    <Link
                      to="/work"
                      className="font-mono text-xs text-[#AEF830] hover:underline"
                    >
                      Inspect concept demos →
                    </Link>
                    <Link
                      to="/#faq"
                      className="font-mono text-xs text-[#A6B4AC] hover:text-white"
                    >
                      Read buyer FAQs →
                    </Link>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
