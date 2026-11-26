import fs from 'node:fs';
import path from 'node:path';
import type {Page} from '@playwright/test';
import {ROUTE_META, type AppRoute} from '../../src/router/RouterContext';

export const EXPECTED_H1_BY_ROUTE: Record<AppRoute, string> = {
  '/': 'Your Business. Upgraded with AI.',
  '/services': 'AI agents, automation, and custom software shaped around your operations.',
  '/services/ai-agents': 'AI Agents built to handle real customer conversations cleanly.',
  '/services/automation': 'WhatsApp and business automation that removes repetitive desk work.',
  '/services/software':
    'Custom software, websites, portals, and AI integrations built for daily speed.',
  '/industries':
    'Built for coaching institutes, showrooms, clinics, and distributors across India.',
  '/work': 'Concept demos and prototypes for everyday business workflows.',
  '/about': 'An AI and business technology agency in Guwahati built for real Indian SMBs.',
  '/contact': 'Book a practical walkthrough for your business.',
};

export const ALL_ROUTES = Object.keys(ROUTE_META) as AppRoute[];

export function getBuiltSiteOrigin(): string {
  if (process.env.SITE_URL) {
    return new URL(process.env.SITE_URL).origin;
  }
  const sitemapPath = path.resolve(process.cwd(), 'dist', 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    const xml = fs.readFileSync(sitemapPath, 'utf-8');
    const match = xml.match(/<loc>(https:\/\/[^/<]+)/);
    if (match) return match[1];
  }
  throw new Error('Cannot determine built site origin. Build dist/ with SITE_URL first.');
}

export function attachErrorCollectors(page: Page) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    pageErrors.push(err.message);
  });

  return {consoleErrors, pageErrors};
}
