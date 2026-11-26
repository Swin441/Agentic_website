import React from 'react';
import {renderToString} from 'react-dom/server';
import App from './App';
export {ROUTE_META} from './router/RouterContext';
export {BUYER_FAQS} from './data/siteData';

export function render(path: string): string {
  return renderToString(<App initialPath={path} />);
}
