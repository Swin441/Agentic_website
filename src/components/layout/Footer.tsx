import React from 'react';
import {Link} from '../../router/RouterContext';
import {Logo} from '../ui/Logo';
import {CONTACT_CONFIG} from '../../config/contact';

export function Footer() {
  const hasEmail = Boolean(CONTACT_CONFIG.contactEmail);
  const hasWhatsApp = Boolean(CONTACT_CONFIG.whatsappHref);

  return (
    <footer className="border-t border-[#203C30] bg-[#07130F]">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          {/* Brand Summary */}
          <div className="md:col-span-5">
            <Link to="/" aria-label="Axom Hub Home" className="inline-block">
              <Logo variant="light" />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-[#A6B4AC] max-w-sm">
              Your Business. Upgraded with AI. We build practical AI agents, business automation,
              and custom software for small and medium businesses across India.
            </p>
            <p className="mt-4 font-mono text-xs text-[#53685E]">
              {CONTACT_CONFIG.officeLocation}
            </p>
          </div>

          {/* Services Links */}
          <nav aria-labelledby="footer-services-heading" className="md:col-span-2">
            <p id="footer-services-heading" className="font-mono text-xs font-medium text-white mb-4">
              Services
            </p>
            <ul className="space-y-2.5 text-sm text-[#A6B4AC]">
              <li>
                <Link to="/services" className="hover:text-[#AEF830] transition-colors">
                  Services Overview
                </Link>
              </li>
              <li>
                <Link to="/services/ai-agents" className="hover:text-[#AEF830] transition-colors">
                  AI Agents
                </Link>
              </li>
              <li>
                <Link to="/services/automation" className="hover:text-[#AEF830] transition-colors">
                  WhatsApp &amp; Automation
                </Link>
              </li>
              <li>
                <Link to="/services/software" className="hover:text-[#AEF830] transition-colors">
                  Software &amp; AI Integrations
                </Link>
              </li>
            </ul>
          </nav>

          {/* Company Links */}
          <nav aria-labelledby="footer-explore-heading" className="md:col-span-2">
            <p id="footer-explore-heading" className="font-mono text-xs font-medium text-white mb-4">
              Explore
            </p>
            <ul className="space-y-2.5 text-sm text-[#A6B4AC]">
              <li>
                <Link to="/industries" className="hover:text-[#AEF830] transition-colors">
                  Industries
                </Link>
              </li>
              <li>
                <Link to="/work" className="hover:text-[#AEF830] transition-colors">
                  Work &amp; Demos
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#AEF830] transition-colors">
                  About Axom Hub
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#AEF830] transition-colors">
                  Book a Free Demo
                </Link>
              </li>
            </ul>
          </nav>

          {/* Direct Contact */}
          <div className="md:col-span-3">
            <p className="font-mono text-xs font-medium text-white mb-4">Start a conversation</p>
            <p className="text-sm text-[#A6B4AC] leading-relaxed mb-4">
              Tell us what takes up your team’s time every day. We will walk you through a tailored
              live demo.
            </p>
            <div className="space-y-2.5 text-sm">
              {hasEmail && (
                <div>
                  <a
                    href={`mailto:${CONTACT_CONFIG.contactEmail}`}
                    className="text-white hover:text-[#AEF830] transition-colors break-all"
                  >
                    Email: {CONTACT_CONFIG.contactEmail}
                  </a>
                </div>
              )}
              {hasWhatsApp && (
                <div>
                  <a
                    href={CONTACT_CONFIG.whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-white hover:text-[#AEF830] transition-colors"
                  >
                    <span>
                      {CONTACT_CONFIG.whatsappDisplay
                        ? `Chat on WhatsApp (${CONTACT_CONFIG.whatsappDisplay})`
                        : 'Chat on WhatsApp'}
                    </span>
                  </a>
                </div>
              )}
              <div>
                <Link
                  to="/contact"
                  className="font-mono text-xs text-[#AEF830] hover:text-[#B5FF38] transition-colors"
                >
                  Open enquiry form →
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#203C30] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#53685E]">
          <p>© {new Date().getFullYear()} Axom Hub. Practical AI & Business Technology.</p>
          <p className="font-mono">Built for Indian SMBs</p>
        </div>
      </div>
    </footer>
  );
}
