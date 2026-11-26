import {createRoot, hydrateRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

declare global {
  interface Window {
    __AXOM_HYDRATION_ERRORS__?: string[];
    __AXOM_HYDRATED__?: boolean;
  }
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to initialize Axom Hub: root element "#root" was not found.');
}

window.__AXOM_HYDRATION_ERRORS__ = [];

function handleRecoverableError(error: unknown, errorInfo: {componentStack?: string}) {
  const message = error instanceof Error ? error.message : String(error);
  window.__AXOM_HYDRATION_ERRORS__ = [
    ...(window.__AXOM_HYDRATION_ERRORS__ ?? []),
    message,
  ];
  console.error('React hydration recoverable error:', error, errorInfo);
}

try {
  // Vite dev server serves an empty #root container without prerendering.
  // In production builds, import.meta.env.DEV is false so hydrateRoot always executes.
  if (import.meta.env.DEV && !rootElement.hasChildNodes()) {
    createRoot(rootElement).render(<App />);
  } else {
    hydrateRoot(rootElement, <App />, {
      onRecoverableError: handleRecoverableError,
    });
  }
  window.__AXOM_HYDRATED__ = true;
} catch (error) {
  console.error('Failed to hydrate Axom Hub application:', error);
  throw error;
}
