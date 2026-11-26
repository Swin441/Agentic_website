import React, {useEffect, useState} from 'react';
import {ChevronDown, X} from 'lucide-react';
import {Link, useRouter} from '../../router/RouterContext';
import {Logo} from '../ui/Logo';
import {PrimaryButton} from '../ui/Buttons';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({isOpen, onClose}: MobileNavProps) {
  const {isActive} = useRouter();
  const [servicesExpanded, setServicesExpanded] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navLinkClass = (active: boolean) =>
    `block py-3 text-base font-medium border-b border-[#203C30]/70 transition-colors ${
      active ? 'text-[#AEF830]' : 'text-white hover:text-[#AEF830]'
    }`;

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden bg-[#07130F]/95 backdrop-blur-md flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-between h-16 px-5 border-b border-[#203C30]">
        <Link to="/" onClick={onClose} aria-label="Axom Hub Home">
          <Logo variant="light" />
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation menu"
          className="w-11 h-11 flex items-center justify-center rounded-lg border border-[#203C30] bg-[#101C18] text-white hover:border-[#AEF830] hover:text-[#AEF830] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-5 py-6 space-y-1" aria-label="Mobile menu">
        <Link to="/" onClick={onClose} className={navLinkClass(isActive('/', true))}>
          Home
        </Link>

        <div className="border-b border-[#203C30]/70">
          <div className="flex items-center justify-between">
            <Link
              to="/services"
              onClick={onClose}
              className={`py-3 text-base font-medium transition-colors ${
                isActive('/services') ? 'text-[#AEF830]' : 'text-white hover:text-[#AEF830]'
              }`}
            >
              Services
            </Link>
            <button
              type="button"
              onClick={() => setServicesExpanded((prev) => !prev)}
              aria-expanded={servicesExpanded}
              aria-label="Toggle Services sub-menu"
              className="w-11 h-11 flex items-center justify-center text-[#A6B4AC] hover:text-white cursor-pointer"
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-150 ${
                  servicesExpanded ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </button>
          </div>

          {servicesExpanded && (
            <div className="pl-4 pb-3 space-y-1">
              <Link
                to="/services"
                onClick={onClose}
                className={`block py-2 text-sm transition-colors ${
                  isActive('/services', true)
                    ? 'text-[#AEF830]'
                    : 'text-[#A6B4AC] hover:text-white'
                }`}
              >
                All Services Overview
              </Link>
              <Link
                to="/services/ai-agents"
                onClick={onClose}
                className={`block py-2 text-sm transition-colors ${
                  isActive('/services/ai-agents', true)
                    ? 'text-[#AEF830]'
                    : 'text-[#A6B4AC] hover:text-white'
                }`}
              >
                AI Agents
              </Link>
              <Link
                to="/services/automation"
                onClick={onClose}
                className={`block py-2 text-sm transition-colors ${
                  isActive('/services/automation', true)
                    ? 'text-[#AEF830]'
                    : 'text-[#A6B4AC] hover:text-white'
                }`}
              >
                Business Automation
              </Link>
              <Link
                to="/services/software"
                onClick={onClose}
                className={`block py-2 text-sm transition-colors ${
                  isActive('/services/software', true)
                    ? 'text-[#AEF830]'
                    : 'text-[#A6B4AC] hover:text-white'
                }`}
              >
                Software & Applications
              </Link>
            </div>
          )}
        </div>

        <Link
          to="/industries"
          onClick={onClose}
          className={navLinkClass(isActive('/industries', true))}
        >
          Industries
        </Link>
        <Link to="/work" onClick={onClose} className={navLinkClass(isActive('/work', true))}>
          Work / Demos
        </Link>
        <Link to="/about" onClick={onClose} className={navLinkClass(isActive('/about', true))}>
          About
        </Link>
        <Link
          to="/contact"
          onClick={onClose}
          className={navLinkClass(isActive('/contact', true))}
        >
          Contact
        </Link>
      </nav>

      <div className="p-5 border-t border-[#203C30]">
        <PrimaryButton to="/contact" onClick={onClose} className="w-full justify-center py-3">
          Book a Free Demo
        </PrimaryButton>
      </div>
    </div>
  );
}
