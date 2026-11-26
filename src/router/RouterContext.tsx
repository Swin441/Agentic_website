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
    title: 'Axom Hub — Your Business. Upgraded with AI.',
    description:
      'Practical AI agents, business automation, custom software, websites, and applications for small and medium businesses across India.',
  },
  '/services': {
    title: 'Services — Axom Hub',
    description:
      'Explore Axom Hub capabilities: AI Agents, Business Automation, Custom Software, and Websites & Applications built for Indian SMBs.',
  },
  '/services/ai-agents': {
    title: 'AI Agents for Business — Axom Hub',
    description:
      'Deploy practical AI agents for WhatsApp, website inquiries, appointment scheduling, and customer follow-ups without enterprise complexity.',
  },
  '/services/automation': {
    title: 'Business Automation — Axom Hub',
    description:
      'Connect your leads, billing, spreadsheets, WhatsApp messages, and daily team follow-ups into reliable automated workflows.',
  },
  '/services/software': {
    title: 'Custom Software & Applications — Axom Hub',
    description:
      'Custom web portals, internal dashboards, mobile apps, and business websites engineered around how your team actually works.',
  },
  '/industries': {
    title: 'Industries We Serve — Axom Hub',
    description:
      'Tailored AI agents, automation, and software workflows for coaching institutes, clinics, retail & distribution, real estate, and local services.',
  },
  '/work': {
    title: 'Work & Concept Demos — Axom Hub',
    description:
      'Inspect interactive concept demos and product prototypes showing how Axom Hub upgrades daily Indian business workflows.',
  },
  '/about': {
    title: 'About Axom Hub — Practical AI & Business Technology',
    description:
      'Learn about Axom Hub’s purpose, practical engineering approach, target businesses, and step-by-step delivery process.',
  },
  '/contact': {
    title: 'Book a Free Demo — Contact Axom Hub',
    description:
      'Share your business workflow and schedule a practical walkthrough with Axom Hub for AI agents, automation, or custom software.',
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

export function RouterProvider({children}: {children: React.ReactNode}) {
  const [currentPath, setCurrentPath] = useState<string>(() =>
    typeof window !== 'undefined' ? normalizePath(window.location.pathname) : '/'
  );

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
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({behavior: 'smooth'});
        }
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
