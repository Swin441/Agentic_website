import {expect, test, type Page} from '@playwright/test';
import {ALL_ROUTES, EXPECTED_H1_BY_ROUTE, attachErrorCollectors} from './helpers';

async function installSsrDomProbe(page: Page) {
  await page.addInitScript(() => {
    const win = window as unknown as {
      __SSR_H1_NODE__?: Element | null;
      __SSR_MAIN_NODE__?: Element | null;
      __SSR_HEADER_NODE__?: Element | null;
      __SSR_TEXT_LEN__?: number;
      __ROOT_CLEARED__?: boolean;
    };

    const captureNodes = () => {
      const root = document.getElementById('root');
      if (!root) return false;
      if (!win.__SSR_H1_NODE__) win.__SSR_H1_NODE__ = root.querySelector('h1');
      if (!win.__SSR_MAIN_NODE__) win.__SSR_MAIN_NODE__ = document.getElementById('main-content');
      if (!win.__SSR_HEADER_NODE__) win.__SSR_HEADER_NODE__ = document.querySelector('header');
      if (!win.__SSR_TEXT_LEN__) {
        win.__SSR_TEXT_LEN__ = (root.textContent || '').trim().length;
      }
      return Boolean(win.__SSR_H1_NODE__ && win.__SSR_MAIN_NODE__);
    };

    const observer = new MutationObserver((mutations) => {
      if (!win.__SSR_H1_NODE__ || !win.__SSR_MAIN_NODE__ || !win.__SSR_HEADER_NODE__) {
        captureNodes();
      }
      for (const m of mutations) {
        for (const removed of Array.from(m.removedNodes)) {
          if (removed === win.__SSR_MAIN_NODE__ || removed === win.__SSR_H1_NODE__) {
            win.__ROOT_CLEARED__ = true;
          }
        }
      }
    });

    observer.observe(document, {childList: true, subtree: true});
    document.addEventListener('DOMContentLoaded', captureNodes, {once: true});
  });
}

test.describe('React 19 SSR Hydration & SPA Navigation', () => {
  for (const route of ALL_ROUTES) {
    test(`Hydrates ${route} in place without clearing SSR DOM or throwing hydration errors`, async ({
      page,
    }) => {
      const {consoleErrors, pageErrors} = attachErrorCollectors(page);
      await installSsrDomProbe(page);

      await page.goto(route, {waitUntil: 'domcontentloaded'});
      await page.waitForFunction(
        () => (window as unknown as {__AXOM_HYDRATED__?: boolean}).__AXOM_HYDRATED__ === true
      );

      // Ensure lazy-loaded SwarmCanvas mounts post-hydration
      await expect(page.locator('canvas[aria-hidden="true"]')).toHaveCount(1);

      const state = await page.evaluate(() => {
        const win = window as unknown as {
          __SSR_H1_NODE__?: Element | null;
          __SSR_MAIN_NODE__?: Element | null;
          __SSR_TEXT_LEN__?: number;
          __ROOT_CLEARED__?: boolean;
          __AXOM_HYDRATION_ERRORS__?: string[];
        };
        const currentH1 = document.querySelector('#root h1');
        const currentMain = document.getElementById('main-content');
        return {
          sameH1Node: Boolean(win.__SSR_H1_NODE__) && currentH1 === win.__SSR_H1_NODE__,
          sameMainNode: Boolean(win.__SSR_MAIN_NODE__) && currentMain === win.__SSR_MAIN_NODE__,
          rootCleared: Boolean(win.__ROOT_CLEARED__),
          ssrTextLen: win.__SSR_TEXT_LEN__ || 0,
          currentTextLen: (document.getElementById('root')?.textContent || '').trim().length,
          h1Text: currentH1?.textContent?.trim() || '',
          hydrationErrors: win.__AXOM_HYDRATION_ERRORS__ || [],
        };
      });

      expect(state.rootCleared).toBe(false);
      expect(state.sameH1Node).toBe(true);
      expect(state.sameMainNode).toBe(true);
      expect(state.ssrTextLen).toBeGreaterThan(200);
      expect(state.currentTextLen).toBeGreaterThanOrEqual(state.ssrTextLen);
      expect(state.h1Text).toBe(EXPECTED_H1_BY_ROUTE[route]);
      expect(state.hydrationErrors).toEqual([]);
      expect(consoleErrors).toEqual([]);
      expect(pageErrors).toEqual([]);
    });
  }

  test('Client-side navigation, Back, Forward, and unknown route work after hydration', async ({
    page,
  }, testInfo) => {
    const {consoleErrors, pageErrors} = attachErrorCollectors(page);
    await installSsrDomProbe(page);

    await page.goto('/', {waitUntil: 'domcontentloaded'});
    await page.waitForFunction(
      () => (window as unknown as {__AXOM_HYDRATED__?: boolean}).__AXOM_HYDRATED__ === true
    );

    if (testInfo.project.name === 'mobile') {
      await page.getByRole('button', {name: 'Open navigation menu'}).click();
      await page.getByRole('dialog', {name: 'Mobile navigation'}).getByRole('link', {name: 'Services', exact: true}).click();
    } else {
      await page.locator('header nav').getByRole('link', {name: 'Services', exact: true}).click();
    }

    await expect(page).toHaveURL(/\/services$/);
    await expect(page.locator('h1')).toHaveText(EXPECTED_H1_BY_ROUTE['/services']);

    if (testInfo.project.name === 'mobile') {
      await page.getByRole('button', {name: 'Open navigation menu'}).click();
      await page.getByRole('dialog', {name: 'Mobile navigation'}).getByRole('link', {name: /Work/i}).click();
    } else {
      await page.locator('header nav').getByRole('link', {name: 'Work', exact: true}).click();
    }

    await expect(page).toHaveURL(/\/work$/);
    await expect(page.locator('h1')).toHaveText(EXPECTED_H1_BY_ROUTE['/work']);

    // Header shell node remains identical (SPA transition without reload)
    const headerPreserved = await page.evaluate(() => {
      const win = window as unknown as {__SSR_HEADER_NODE__?: Element | null};
      return Boolean(win.__SSR_HEADER_NODE__) && document.querySelector('header') === win.__SSR_HEADER_NODE__;
    });
    expect(headerPreserved).toBe(true);

    // Browser Back & Forward
    await page.goBack();
    await expect(page).toHaveURL(/\/services$/);
    await expect(page.locator('h1')).toHaveText(EXPECTED_H1_BY_ROUTE['/services']);

    await page.goForward();
    await expect(page).toHaveURL(/\/work$/);
    await expect(page.locator('h1')).toHaveText(EXPECTED_H1_BY_ROUTE['/work']);

    // Unknown route direct navigation hydrates 404 in place
    const res404 = await page.goto('/does-not-exist-hydration-check', {waitUntil: 'domcontentloaded'});
    expect(res404?.status()).toBe(404);
    await page.waitForFunction(
      () => (window as unknown as {__AXOM_HYDRATED__?: boolean}).__AXOM_HYDRATED__ === true
    );
    const same404H1 = await page.evaluate(() => {
      const win = window as unknown as {__SSR_H1_NODE__?: Element | null};
      return Boolean(win.__SSR_H1_NODE__) && document.querySelector('#root h1') === win.__SSR_H1_NODE__;
    });
    expect(same404H1).toBe(true);

    const unexpectedConsoleErrors = consoleErrors.filter(
      (msg) => !msg.includes('status of 404 (Not Found)')
    );
    expect(unexpectedConsoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });
});
