import {expect, test} from '@playwright/test';
import {ROUTE_META} from '../../src/router/RouterContext';
import {
  ALL_ROUTES,
  EXPECTED_H1_BY_ROUTE,
  attachErrorCollectors,
  getBuiltSiteOrigin,
} from './helpers';

const siteOrigin = getBuiltSiteOrigin();

test.describe('All nine routes, 404, SEO metadata & responsive layout', () => {
  for (const route of ALL_ROUTES) {
    test(`Route ${route} loads cleanly with valid SEO metadata and layout`, async ({page}) => {
      const {consoleErrors, pageErrors} = attachErrorCollectors(page);

      const response = await page.goto(route, {waitUntil: 'domcontentloaded'});
      expect(response?.status()).toBe(200);

      await page.waitForFunction(() => (window as unknown as {__AXOM_HYDRATED__?: boolean}).__AXOM_HYDRATED__ === true);

      const meta = ROUTE_META[route];
      await expect(page).toHaveTitle(meta.title);

      const h1s = page.locator('h1');
      await expect(h1s).toHaveCount(1);
      await expect(h1s.first()).toHaveText(EXPECTED_H1_BY_ROUTE[route]);
      await expect(h1s.first()).toBeVisible();

      // Footer must not contain H2 headings
      await expect(page.locator('footer h2')).toHaveCount(0);

      // Meta tags & canonical URL
      const headMeta = await page.evaluate(() => ({
        description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
        ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '',
        ogDescription:
          document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '',
        ogUrl: document.querySelector('meta[property="og:url"]')?.getAttribute('content') || '',
        robots: document.querySelector('meta[name="robots"]')?.getAttribute('content') || '',
      }));

      expect(headMeta.description).toBe(meta.description);
      expect(headMeta.canonical).toBe(`${siteOrigin}${route}`);
      expect(headMeta.ogTitle).toBe(meta.title);
      expect(headMeta.ogDescription).toBe(meta.description);
      expect(headMeta.ogUrl).toBe(`${siteOrigin}${route}`);
      expect(headMeta.robots).toContain('index');

      // No horizontal overflow
      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth
      );
      expect(hasHorizontalOverflow).toBe(false);

      // All images loaded cleanly
      const brokenImages = await page.evaluate(() =>
        [...document.images]
          .filter((img) => !img.complete || img.naturalWidth === 0)
          .map((img) => img.src)
      );
      expect(brokenImages).toEqual([]);

      // Zero hydration or runtime errors
      const hydrationErrors = await page.evaluate(
        () => (window as unknown as {__AXOM_HYDRATION_ERRORS__?: string[]}).__AXOM_HYDRATION_ERRORS__ || []
      );
      expect(hydrationErrors).toEqual([]);
      expect(consoleErrors).toEqual([]);
      expect(pageErrors).toEqual([]);
    });
  }

  test('Unknown route returns real HTTP 404 with noindex and zero canonical', async ({page}) => {
    const {consoleErrors, pageErrors} = attachErrorCollectors(page);

    const response = await page.goto('/nonexistent-qa-route', {waitUntil: 'domcontentloaded'});
    expect(response?.status()).toBe(404);

    await page.waitForFunction(() => (window as unknown as {__AXOM_HYDRATED__?: boolean}).__AXOM_HYDRATED__ === true);
    await expect(page).toHaveTitle('Page Not Found — Axom Hub');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('This page could not be found.');

    const robots = await page.locator('meta[name="robots"]').getAttribute('content');
    expect(robots).toBe('noindex');
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(hasOverflow).toBe(false);

    const unexpectedConsoleErrors = consoleErrors.filter(
      (msg) => !msg.includes('status of 404 (Not Found)')
    );
    const hydrationErrors = await page.evaluate(
      () => (window as unknown as {__AXOM_HYDRATION_ERRORS__?: string[]}).__AXOM_HYDRATION_ERRORS__ || []
    );
    expect(hydrationErrors).toEqual([]);
    expect(unexpectedConsoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test('Interactive navigation and ContactForm remain usable on desktop and mobile', async ({
    page,
  }, testInfo) => {
    const {consoleErrors, pageErrors} = attachErrorCollectors(page);

    await page.goto('/contact', {waitUntil: 'domcontentloaded'});
    await page.waitForFunction(() => (window as unknown as {__AXOM_HYDRATED__?: boolean}).__AXOM_HYDRATED__ === true);

    // Empty submit triggers accessible validation alerts and focuses first invalid field
    await page.getByRole('button', {name: /Request Free Demo/i}).click();
    await expect(page.locator('#contact-name')).toBeFocused();
    await expect(page.locator('#contact-name-error')).toBeVisible();

    // Fill valid values -> triggers unconfigured validated brief status when no endpoint is set
    await page.fill('#contact-name', 'Ananya Das');
    await page.fill('#contact-business', 'Dispur Diagnostics');
    await page.fill('#contact-phone', '+91 9864012345');
    await page.fill('#contact-email', 'ananya@dispurclinic.in');
    await page.fill(
      '#contact-description',
      'Need WhatsApp appointment booking and automated diagnostic report alerts.'
    );
    await page.getByRole('button', {name: /Request Free Demo/i}).click();

    await expect(page.locator('[role="status"]')).toContainText(
      'Enquiry validated — direct inbox delivery is awaiting owner activation'
    );
    await expect(page.getByRole('button', {name: /Copy enquiry brief/i})).toBeVisible();

    if (testInfo.project.name === 'mobile') {
      await page.getByRole('button', {name: 'Open navigation menu'}).click();
      await expect(page.getByRole('dialog', {name: 'Mobile navigation'})).toBeVisible();
      await page.getByRole('button', {name: 'Close navigation menu'}).click();
      await expect(page.getByRole('dialog', {name: 'Mobile navigation'})).toHaveCount(0);
    }

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });
});
