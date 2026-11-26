import React, {useEffect, useRef, useState} from 'react';
import {ChevronDown, Menu} from 'lucide-react';
import {Link, useRouter} from '../../router/RouterContext';
import {Logo} from '../ui/Logo';
import {PrimaryButton} from '../ui/Buttons';
import {MobileNav} from './MobileNav';

const SERVICE_SUBLINKS = [
  {
    label: 'All Services',
    description: 'Overview of AI, automation, and software',
    to: '/services',
  },
  {
    label: 'AI Agents',
    description: 'WhatsApp & web enquiry assistants',
    to: '/services/ai-agents',
  },
  {
    label: 'Automation',
    description: 'Connected leads, reminders, and sheets',
    to: '/services/automation',
  },
  {
    label: 'Software & Applications',
    description: 'Custom portals, dashboards, and websites',
    to: '/services/software',
  },
];

export function Header() {
  const {isActive} = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const linkClass = (active: boolean) =>
    `text-sm font-medium transition-colors whitespace-nowrap shrink-0 py-1 ${
      active ? 'text-[#AEF830]' : 'text-[#A6B4AC] hover:text-white'
    }`;

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#07130F]/85 backdrop-blur-md border-b border-[#203C30]">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 h-16 lg:h-[72px] flex items-center justify-between gap-8">
          {/* Zone 1: Brand Logo */}
          <Link to="/" aria-label="Axom Hub Home" className="shrink-0">
            <Logo variant="light" />
          </Link>

          {/* Zone 2: Desktop Navigation */}
          <nav
            className="hidden lg:flex items-center gap-7"
            aria-label="Primary navigation"
          >
            <Link to="/" className={linkClass(isActive('/', true))}>
              Home
            </Link>

            {/* Services Dropdown */}
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <div className="flex items-center gap-1">
                <Link to="/services" className={linkClass(isActive('/services'))}>
                  Services
                </Link>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="menu"
                  aria-label="Toggle Services menu"
                  className={`p-1 rounded transition-colors cursor-pointer ${
                    isActive('/services') ? 'text-[#AEF830]' : 'text-[#A6B4AC] hover:text-white'
                  }`}
                >
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-150 ${
                      dropdownOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
              </div>

              {dropdownOpen && (
                <div
                  role="menu"
                  aria-label="Services submenu"
                  className="absolute left-0 top-full pt-3 w-72 z-50"
                >
                  <div className="bg-[#101C18] border border-[#203C30] rounded-xl p-2 shadow-2xl">
                    {SERVICE_SUBLINKS.map((item) => {
                      const active = isActive(item.to, true);
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          role="menuitem"
                          onClick={() => setDropdownOpen(false)}
                          className={`block rounded-lg px-3.5 py-2.5 transition-colors ${
                            active
                              ? 'bg-[#16221E] text-[#AEF830]'
                              : 'text-white hover:bg-[#16221E]'
                          }`}
                        >
                          <div className="text-sm font-medium">{item.label}</div>
                          <div className="text-xs text-[#A6B4AC] mt-0.5">{item.description}</div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <Link to="/industries" className={linkClass(isActive('/industries', true))}>
              Industries
            </Link>
            <Link to="/work" className={linkClass(isActive('/work', true))}>
              Work
            </Link>
            <Link to="/about" className={linkClass(isActive('/about', true))}>
              About
            </Link>
            <Link to="/contact" className={linkClass(isActive('/contact', true))}>
              Contact
            </Link>
          </nav>

          {/* Zone 3: Primary Action + Mobile Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:block">
              <PrimaryButton to="/contact" className="py-2 px-4 text-xs sm:text-sm">
                Book a Free Demo
              </PrimaryButton>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden w-11 h-11 flex items-center justify-center rounded-lg border border-[#203C30] bg-[#101C18] text-white hover:border-[#AEF830] hover:text-[#AEF830] transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <MobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
