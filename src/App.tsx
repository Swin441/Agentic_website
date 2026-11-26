/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, {useEffect, useState} from 'react';
import {RouterProvider, useRouter} from './router/RouterContext';
import {Header} from './components/layout/Header';
import {Footer} from './components/layout/Footer';
import {HomePage} from './pages/HomePage';
import {ServicesPage} from './pages/ServicesPage';
import {AiAgentsPage} from './pages/AiAgentsPage';
import {AutomationPage} from './pages/AutomationPage';
import {SoftwarePage} from './pages/SoftwarePage';
import {IndustriesPage} from './pages/IndustriesPage';
import {WorkPage} from './pages/WorkPage';
import {AboutPage} from './pages/AboutPage';
import {ContactPage} from './pages/ContactPage';
import {NotFoundPage} from './pages/NotFoundPage';
import {SwarmCanvas} from './components/swarm/SwarmCanvas';

function RouteView() {
  const {currentPath} = useRouter();

  switch (currentPath) {
    case '/':
      return <HomePage />;
    case '/services':
      return <ServicesPage />;
    case '/services/ai-agents':
      return <AiAgentsPage />;
    case '/services/automation':
      return <AutomationPage />;
    case '/services/software':
      return <SoftwarePage />;
    case '/industries':
      return <IndustriesPage />;
    case '/work':
      return <WorkPage />;
    case '/about':
      return <AboutPage />;
    case '/contact':
      return <ContactPage />;
    default:
      return <NotFoundPage />;
  }
}

function AppShell() {
  const {currentPath} = useRouter();
  const [mounted, setMounted] = useState(false);
  const showSwarmDevHud = import.meta.env.VITE_SWARM_HUD === 'true';

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#07130F] text-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[#AEF830] focus:text-[#07130F] focus:font-semibold"
      >
        Skip to content
      </a>
      <Header />
      <main id="main-content" className="flex-1">
        <RouteView />
      </main>
      <Footer />
      {mounted && (
        <SwarmCanvas
          routeKey={currentPath}
          preloader={false}
          preloaderOnNavigate={false}
          speed={1}
          maxConcurrent={3}
          staggerMs={240}
          hud={showSwarmDevHud}
          reducedMotion="skip"
        />
      )}
    </div>
  );
}

export default function App({initialPath}: {initialPath?: string} = {}) {
  return (
    <RouterProvider initialPath={initialPath}>
      <AppShell />
    </RouterProvider>
  );
}
