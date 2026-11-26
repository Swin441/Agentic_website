import {expect, test} from '@playwright/test';
import {EXPECTED_H1_BY_ROUTE, attachErrorCollectors} from './helpers';

test.describe('Swarm Foreground Overlay Integrity', () => {
  test('Swarm canvas mounts post-hydration as a non-blocking z-30 fixed viewport foreground overlay', async ({
    page,
    request,
  }) => {
    const {consoleErrors, pageErrors} = attachErrorCollectors(page);

    // Confirm raw SSR HTML does NOT contain <canvas>
    const rawHtmlResponse = await request.get('/');
    expect(rawHtmlResponse.status()).toBe(200);
    const rawHtml = await rawHtmlResponse.text();
    expect(rawHtml).not.toContain('<canvas');

    await page.goto('/', {waitUntil: 'domcontentloaded'});
    await page.waitForFunction(
      () => (window as unknown as {__AXOM_HYDRATED__?: boolean}).__AXOM_HYDRATED__ === true
    );

    // 1. Exactly one Swarm canvas mounts after hydration in normal-motion mode
    const canvas = page.locator('canvas[aria-hidden="true"]');
    await expect(canvas).toHaveCount(1);

    // 2-6. Verify fixed viewport overlay, z-index 30, pointer-events none, outside #main-content
    const metrics = await page.evaluate(() => {
      const el = document.querySelector('canvas[aria-hidden="true"]') as HTMLCanvasElement | null;
      const main = document.getElementById('main-content');
      if (!el || !main) return null;
      const cs = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        position: cs.position,
        zIndex: cs.zIndex,
        pointerEvents: cs.pointerEvents,
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        insideMain: main.contains(el),
        overflowX: document.documentElement.scrollWidth > window.innerWidth,
      };
    });

    expect(metrics).not.toBeNull();
    expect(metrics!.position).toBe('fixed');
    expect(metrics!.zIndex).toBe('30');
    expect(metrics!.pointerEvents).toBe('none');
    expect(metrics!.left).toBe(0);
    expect(metrics!.top).toBe(0);
    expect(metrics!.width).toBeGreaterThanOrEqual(metrics!.viewportWidth - 1);
    expect(metrics!.height).toBeGreaterThanOrEqual(metrics!.viewportHeight - 1);
    expect(metrics!.insideMain).toBe(false);
    expect(metrics!.overflowX).toBe(false);

    // 7 & 9. Website content remains readable and CTAs/links remain clickable through overlay
    const heroH1 = page.locator('h1');
    await expect(heroH1).toBeVisible();
    await expect(heroH1).toHaveText(EXPECTED_H1_BY_ROUTE['/']);

    const ctaLink = page.locator('main a[href="/contact"]').first();
    await expect(ctaLink).toBeVisible();
    await ctaLink.click();

    await expect(page).toHaveURL(/\/contact$/);
    await expect(page.locator('h1')).toHaveText(EXPECTED_H1_BY_ROUTE['/contact']);

    // Form input must remain interactive beneath the fixed z-30 overlay
    await page.fill('#contact-name', 'Rohan Bora');
    await expect(page.locator('#contact-name')).toHaveValue('Rohan Bora');

    // Swarm remains single and non-blocking across route changes
    await expect(page.locator('canvas[aria-hidden="true"]')).toHaveCount(1);
    const postNavOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(postNavOverflow).toBe(false);

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test('Swarm skips animations under prefers-reduced-motion: reduce without hiding content', async ({
    page,
  }) => {
    const {consoleErrors, pageErrors} = attachErrorCollectors(page);

    await page.emulateMedia({reducedMotion: 'reduce'});
    await page.goto('/', {waitUntil: 'domcontentloaded'});
    await page.waitForFunction(
      () => (window as unknown as {__AXOM_HYDRATED__?: boolean}).__AXOM_HYDRATED__ === true
    );

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1')).toHaveText(EXPECTED_H1_BY_ROUTE['/']);
    await expect(page.locator('[data-swarm]')).toHaveCount(0);

    const h1Opacity = await page.locator('h1').evaluate((el) => getComputedStyle(el).opacity);
    expect(Number(h1Opacity)).toBe(1);

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });
});
