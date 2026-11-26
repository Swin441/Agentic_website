import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';

export type AppRoute =
  | '/'
  | '/services'
  | '/services/ai-agents'
  | '/services/automation'
  | '/services/software'
  | '/industries'
  | '/work'
  | '/about'
  | '/contact';

export interface RouteMeta {
  title: string;
  description: string;
}

export const ROUTE_META: Record<AppRoute, RouteMeta> = {
  '/': {
    title: 'Axom Hub — AI Agents, Automation & Software | Guwahati, India',
    description:
      'AI and business technology agency in Guwahati, Assam serving Indian SMBs with AI agents, WhatsApp automation, custom software, websites, and AI integrations.',
  },
  '/services': {
    title: 'AI Agents, Automation & Custom Software Services — Axom Hub',
    description:
      'Explore Axom Hub services from Guwahati for SMBs across India: AI agents, WhatsApp automation, business automation, custom software, websites, and AI integrations.',
  },
  '/services/ai-agents': {
    title: 'AI Agents for WhatsApp & Business Enquiries — Axom Hub',
    description:
      'Custom AI agents for Indian coaching institutes, clinics, showrooms, and SMBs—answering WhatsApp and web enquiries, qualifying leads, and booking appointments.',
  },
  '/services/automation': {
    title: 'WhatsApp & Business Automation Workflows — Axom Hub',
    description:
      'Connect WhatsApp Business, enquiry forms, Google Sheets, billing updates, and daily follow-ups into reliable business automation for Indian SMBs.',
  },
  '/services/software': {
    title: 'Custom Software, Websites & AI Integrations — Axom Hub',
    description:
      'Custom operations portals, business websites, mobile-friendly apps, and AI integrations engineered in Guwahati for growing businesses across India.',
  },
  '/industries': {
    title: 'Industries We Serve Across India — Axom Hub',
    description:
      'Tailored AI agents, WhatsApp automation, and custom software for coaching institutes, retailers and showrooms, clinics, distributors, real estate, and SMBs.',
  },
  '/work': {
    title: 'Interactive Concept Demos & Prototypes — Axom Hub',
    description:
      'Inspect interactive concept demos and product prototypes showing how Axom Hub upgrades enquiry handling, WhatsApp follow-ups, and daily Indian SMB operations.',
  },
  '/about': {
    title: 'About Axom Hub — AI & Business Technology Agency, Guwahati',
    description:
      'Based in Guwahati, Assam, Axom Hub helps small and medium businesses across India adopt practical AI agents, WhatsApp automation, custom software, and integrations.',
  },
  '/contact': {
    title: 'Book a Free Demo — Contact Axom Hub, Guwahati',
    description:
      'Schedule a 30-minute workflow walkthrough and custom INR quotation with Axom Hub in Guwahati or online for AI agents, automation, or custom software.',
  },
};

const VALID_ROUTES = new Set<string>(Object.keys(ROUTE_META));

export function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  const cleaned = pathname.replace(/\/+$/, '');
  return cleaned || '/';
}

export function isValidRoute(pathname: string): pathname is AppRoute {
  return VALID_ROUTES.has(normalizePath(pathname));
}

interface RouterContextValue {
  currentPath: string;
  isNotFound: boolean;
  navigate: (to: string) => void;
  isActive: (path: string, exact?: boolean) => boolean;
}

const RouterContext = createContext<RouterContextValue | null>(null);

function updateDocumentMeta(path: string) {
  const normalized = normalizePath(path);
  const meta = isValidRoute(normalized)
    ? ROUTE_META[normalized]
    : {
        title: 'Page Not Found — Axom Hub',
        description: 'The requested page could not be found on Axom Hub.',
      };

  document.title = meta.title;

  const setMeta = (selector: string, content: string) => {
    const el = document.querySelector<HTMLMetaElement>(selector);
    if (el) {
      el.setAttribute('content', content);
    }
  };

  setMeta('meta[name="description"]', meta.description);
  setMeta('meta[property="og:title"]', meta.title);
  setMeta('meta[property="og:description"]', meta.description);
}

export function RouterProvider({
  children,
  initialPath,
}: {
  children: React.ReactNode;
  initialPath?: string;
}) {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (initialPath !== undefined) {
      return normalizePath(initialPath);
    }
    return typeof window !== 'undefined' ? normalizePath(window.location.pathname) : '/';
  });

  useEffect(() => {
    updateDocumentMeta(currentPath);
  }, [currentPath]);

  useEffect(() => {
    const handlePopState = () => {
      const next = normalizePath(window.location.pathname);
      setCurrentPath(next);
      window.scrollTo({top: 0, behavior: 'auto'});
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((to: string) => {
    const [rawPath, hash] = to.split('#');
    const targetPath = normalizePath(rawPath || '/');
    const current = normalizePath(window.location.pathname);

    if (targetPath !== current) {
      window.history.pushState({}, '', hash ? `${targetPath}#${hash}` : targetPath);
      setCurrentPath(targetPath);
    }

    if (hash) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const el = document.getElementById(hash);
          if (el) {
            el.scrollIntoView({behavior: 'smooth'});
          }
        });
      });
    } else {
      window.scrollTo({top: 0, behavior: 'auto'});
    }
  }, []);

  const isActive = useCallback(
    (path: string, exact = false) => {
      const normalizedTarget = normalizePath(path);
      if (exact) {
        return currentPath === normalizedTarget;
      }
      if (normalizedTarget === '/') {
        return currentPath === '/';
      }
      return currentPath === normalizedTarget || currentPath.startsWith(`${normalizedTarget}/`);
    },
    [currentPath]
  );

  const isNotFound = !isValidRoute(currentPath);

  const value = useMemo(
    () => ({
      currentPath,
      isNotFound,
      navigate,
      isActive,
    }),
    [currentPath, isNotFound, navigate, isActive]
  );

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) {
    throw new Error('useRouter must be used inside RouterProvider');
  }
  return ctx;
}

interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string;
  children: React.ReactNode;
}

export function Link({to, onClick, children, ...rest}: LinkProps) {
  const {navigate} = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      e.button !== 0 ||
      rest.target === '_blank'
    ) {
      onClick?.(e);
      return;
    }

    e.preventDefault();
    onClick?.(e);
    navigate(to);
  };

  return (
    <a href={to} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
