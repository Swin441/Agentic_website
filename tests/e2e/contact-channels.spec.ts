import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {expect, test} from '@playwright/test';
import {
  DEFAULT_WHATSAPP_MESSAGE,
  sanitizeContactEmail,
  sanitizeFormEndpoint,
  sanitizeWhatsAppDisplay,
  sanitizeWhatsAppHref,
} from '../../src/config/contact';
import {createContactWorkerHandler} from '../../cloudflare/contact-worker/src/index.js';
import {attachErrorCollectors} from './helpers';

const TEST_ENDPOINT = 'https://contact-relay.axom-hub-test.example/';
const APPS_SCRIPT_TEST_URL = 'https://script.google.com/macros/s/AKfycbTestDeployment123/exec';
const TEST_EMAIL = 'contact@axom-hub-test.example';
const TEST_WHATSAPP_DISPLAY = '+91 98640 00000';
const TEST_WHATSAPP_URL = 'https://wa.me/919864000000';

const SAMPLE_ENQUIRY = {
  name: 'Pranjal Kalita',
  businessName: 'Brahmaputra MedTech',
  phone: '+91 9864012345',
  email: 'pranjal@brahmaputramed.in',
  serviceInterest: 'WhatsApp Automation',
  budget: '₹50,000 – ₹1,50,000',
  description: 'Automate patient diagnostic report alerts and appointment confirmations on WhatsApp.',
};

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
};

function startStaticServer(rootDir: string): Promise<{server: http.Server; baseUrl: string}> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const reqUrl = new URL(req.url || '/', 'http://127.0.0.1');
      const pathname = decodeURIComponent(reqUrl.pathname);

      let targetPath = path.join(rootDir, pathname.replace(/^\/+/, ''));
      if (pathname === '/' || !path.extname(pathname)) {
        const candidateDirIndex = path.join(rootDir, pathname.replace(/^\/+/, ''), 'index.html');
        targetPath = fs.existsSync(candidateDirIndex)
          ? candidateDirIndex
          : path.join(rootDir, 'index.html');
      }

      const resolvedRoot = path.resolve(rootDir);
      const resolvedTarget = path.resolve(targetPath);
      if (resolvedTarget !== resolvedRoot && !resolvedTarget.startsWith(resolvedRoot + path.sep)) {
        res.statusCode = 403;
        res.end('Forbidden');
        return;
      }

      if (!fs.existsSync(resolvedTarget) || fs.statSync(resolvedTarget).isDirectory()) {
        res.statusCode = 404;
        res.end('Not found');
        return;
      }

      const ext = path.extname(resolvedTarget).toLowerCase();
      res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
      res.statusCode = 200;
      fs.createReadStream(resolvedTarget).pipe(res);
    });

    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('Failed to bind ephemeral port'));
        return;
      }
      resolve({server, baseUrl: `http://127.0.0.1:${address.port}`});
    });
  });
}

async function fillValidForm(page: import('@playwright/test').Page) {
  await page.fill('#contact-name', SAMPLE_ENQUIRY.name);
  await page.fill('#contact-business', SAMPLE_ENQUIRY.businessName);
  await page.fill('#contact-phone', SAMPLE_ENQUIRY.phone);
  await page.fill('#contact-email', SAMPLE_ENQUIRY.email);
  await page.selectOption('#contact-service', SAMPLE_ENQUIRY.serviceInterest);
  await page.selectOption('#contact-budget', SAMPLE_ENQUIRY.budget);
  await page.fill('#contact-description', SAMPLE_ENQUIRY.description);
}

async function assertSampleValuesPreserved(page: import('@playwright/test').Page) {
  await expect(page.locator('#contact-name')).toHaveValue(SAMPLE_ENQUIRY.name);
  await expect(page.locator('#contact-business')).toHaveValue(SAMPLE_ENQUIRY.businessName);
  await expect(page.locator('#contact-phone')).toHaveValue(SAMPLE_ENQUIRY.phone);
  await expect(page.locator('#contact-email')).toHaveValue(SAMPLE_ENQUIRY.email);
  await expect(page.locator('#contact-service')).toHaveValue(SAMPLE_ENQUIRY.serviceInterest);
  await expect(page.locator('#contact-budget')).toHaveValue(SAMPLE_ENQUIRY.budget);
  await expect(page.locator('#contact-description')).toHaveValue(SAMPLE_ENQUIRY.description);
}

test.describe('Contact Channel Sanitizers & Unconfigured Default Build', () => {
  test('Validates WhatsApp, email, and form endpoint URLs safely', () => {
    expect(sanitizeWhatsAppHref('https://wa.me/919864000000')).toBe(
      `https://wa.me/919864000000?text=${encodeURIComponent(DEFAULT_WHATSAPP_MESSAGE)}`
    );
    expect(sanitizeWhatsAppHref('https://api.whatsapp.com/send?phone=919864000000')).toBe(
      `https://api.whatsapp.com/send?phone=919864000000&text=${encodeURIComponent(
        DEFAULT_WHATSAPP_MESSAGE
      )}`
    );
    expect(sanitizeWhatsAppHref('', '+91 98640 00000')).toBe(
      `https://wa.me/919864000000?text=${encodeURIComponent(DEFAULT_WHATSAPP_MESSAGE)}`
    );

    // Unsafe or placeholder WhatsApp destinations must fail closed
    expect(sanitizeWhatsAppHref('http://wa.me/919864000000')).toBe('');
    expect(sanitizeWhatsAppHref('javascript:alert(1)')).toBe('');
    expect(sanitizeWhatsAppHref('https://evil.example/919864000000')).toBe('');
    expect(sanitizeWhatsAppHref('https://wa.me/91XXXXXXXXXX')).toBe('');
    expect(sanitizeWhatsAppHref('https://wa.me/0000000000')).toBe('');
    expect(sanitizeWhatsAppHref('https://api.whatsapp.com/evil?phone=919864000000')).toBe('');
    expect(sanitizeWhatsAppHref('https://evil.example', '+91 98640 00000')).toBe('');
    expect(sanitizeWhatsAppDisplay('+91 XXXXX XXXXX')).toBe('');

    // Email & endpoint sanitizers reject placeholders and unsafe schemes
    expect(sanitizeContactEmail('hello@axomhub.example')).toBe('');
    expect(sanitizeContactEmail('bad\n@axomhub.in')).toBe('');
    expect(sanitizeContactEmail(TEST_EMAIL)).toBe(TEST_EMAIL);

    expect(sanitizeFormEndpoint('javascript:alert(1)')).toBe('');
    expect(sanitizeFormEndpoint('http://formspree.io/f/abc12345')).toBe('');
    expect(sanitizeFormEndpoint('https://formspree.io/f/FORM_ID')).toBe('');
    expect(sanitizeFormEndpoint('https://your-form-endpoint.example/submit')).toBe('');
    expect(sanitizeFormEndpoint(TEST_ENDPOINT)).toBe(TEST_ENDPOINT);
  });

  test('Default unconfigured build hides Email/WhatsApp CTAs, validates fields, and copies brief', async ({
    page,
    context,
  }) => {
    const {consoleErrors, pageErrors} = attachErrorCollectors(page);
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto('/contact', {waitUntil: 'domcontentloaded'});
    await page.waitForFunction(
      () => (window as unknown as {__AXOM_HYDRATED__?: boolean}).__AXOM_HYDRATED__ === true
    );

    // Email and WhatsApp CTAs must stay hidden when unconfigured
    await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
    await expect(page.getByRole('link', {name: /Chat on WhatsApp/i})).toHaveCount(0);
    await expect(page.locator('footer a[href*="wa.me"]')).toHaveCount(0);
    await expect(page.locator('footer a[href^="mailto:"]')).toHaveCount(0);

    // Privacy reminder is visible without invented privacy policy URLs
    await expect(
      page.getByText(
        'Your details will be used to respond to this enquiry. Please do not submit passwords or sensitive financial information.'
      )
    ).toBeVisible();

    // 1. Required field validation
    await page.getByRole('button', {name: /Request Free Demo/i}).click();
    await expect(page.locator('#contact-name-error')).toHaveText('Please enter your name.');
    await expect(page.locator('#contact-business-error')).toHaveText(
      'Please enter your business or organization name.'
    );
    await expect(page.locator('#contact-phone-error')).toHaveText(
      'Please enter a phone or WhatsApp number.'
    );
    await expect(page.locator('#contact-email-error')).toHaveText(
      'Please enter your email address.'
    );
    await expect(page.locator('#contact-description-error')).toContainText(
      'Briefly describe your business workflow'
    );

    // 2 & 3. Invalid email and invalid phone number
    await fillValidForm(page);
    await page.fill('#contact-phone', '12345');
    await page.fill('#contact-email', 'not-an-email');
    await page.getByRole('button', {name: /Request Free Demo/i}).click();

    await expect(page.locator('#contact-phone-error')).toHaveText(
      'Enter a valid 10 to 15 digit phone or WhatsApp number.'
    );
    await expect(page.locator('#contact-email-error')).toHaveText(
      'Please enter a valid email address.'
    );

    // Valid values on unconfigured build trigger honest unconfigured notice + copy brief
    await fillValidForm(page);
    await page.getByRole('button', {name: /Request Free Demo/i}).click();

    await expect(page.locator('[role="status"]')).toContainText(
      'Enquiry validated — direct inbox delivery is awaiting owner activation'
    );

    await page.getByRole('button', {name: /Copy enquiry brief/i}).click();
    await expect(page.getByRole('button', {name: /Copied enquiry brief/i})).toBeVisible();
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain(`Name: ${SAMPLE_ENQUIRY.name}`);
    expect(clipboardText).toContain(`Business: ${SAMPLE_ENQUIRY.businessName}`);
    expect(clipboardText).toContain(`Email: ${SAMPLE_ENQUIRY.email}`);
    expect(clipboardText).toContain(`Service Interest: ${SAMPLE_ENQUIRY.serviceInterest}`);
    expect(clipboardText).toContain(`Estimated Budget: ${SAMPLE_ENQUIRY.budget}`);
    expect(clipboardText).toContain(SAMPLE_ENQUIRY.description);

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(hasOverflow).toBe(false);
    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });
});

test.describe('Configured Contact Channels, Delivery States & Swarm Overlay', () => {
  test.describe.configure({mode: 'serial'});

  let tmpRootDir = '';
  let tmpBuildDir = '';
  let server: http.Server | null = null;
  let configuredBaseUrl = '';

  test.beforeAll(async () => {
    tmpRootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'axom-contact-e2e-'));
    fs.writeFileSync(path.join(tmpRootDir, 'package.json'), '{"type":"module"}\n', 'utf-8');
    fs.symlinkSync(
      path.resolve(process.cwd(), 'node_modules'),
      path.join(tmpRootDir, 'node_modules'),
      'dir'
    );
    tmpBuildDir = path.join(tmpRootDir, 'dist');
    const tmpServerDir = path.join(tmpRootDir, 'dist-server');
    const viteBin = path.resolve(process.cwd(), 'node_modules', 'vite', 'bin', 'vite.js');
    const buildEnv = {
      ...process.env,
      NODE_ENV: 'production',
      VITE_CONTACT_ENDPOINT: TEST_ENDPOINT,
      VITE_CONTACT_EMAIL: TEST_EMAIL,
      VITE_CONTACT_WHATSAPP: TEST_WHATSAPP_DISPLAY,
      VITE_CONTACT_WHATSAPP_URL: TEST_WHATSAPP_URL,
    };

    execFileSync(process.execPath, [viteBin, 'build', '--outDir', tmpBuildDir], {
      cwd: process.cwd(),
      stdio: 'pipe',
      env: buildEnv,
    });
    execFileSync(
      process.execPath,
      [viteBin, 'build', '--ssr', 'src/entry-server.tsx', '--outDir', tmpServerDir],
      {
        cwd: process.cwd(),
        stdio: 'pipe',
        env: buildEnv,
      }
    );

    const {render} = await import(path.join(tmpServerDir, 'entry-server.js'));
    const template = fs.readFileSync(path.join(tmpBuildDir, 'index.html'), 'utf-8');
    const contactHtml = template.replace(
      /<div id="root">\s*<\/div>/,
      () => `<div id="root">${render('/contact')}</div>`
    );
    fs.mkdirSync(path.join(tmpBuildDir, 'contact'), {recursive: true});
    fs.writeFileSync(path.join(tmpBuildDir, 'contact', 'index.html'), contactHtml, 'utf-8');

    const started = await startStaticServer(tmpBuildDir);
    server = started.server;
    configuredBaseUrl = started.baseUrl;
  });

  test.afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve) => server!.close(() => resolve()));
    }
    if (tmpRootDir && fs.existsSync(tmpRootDir)) {
      fs.rmSync(tmpRootDir, {recursive: true, force: true});
    }
  });

  test('Displays Email & WhatsApp CTAs cleanly on Contact page and Footer under Swarm overlay', async ({
    page,
  }) => {
    const {consoleErrors, pageErrors} = attachErrorCollectors(page);
    await page.goto(`${configuredBaseUrl}/contact`, {waitUntil: 'domcontentloaded'});
    await page.waitForFunction(
      () => (window as unknown as {__AXOM_HYDRATED__?: boolean}).__AXOM_HYDRATED__ === true
    );
    const hydrationErrors = await page.evaluate(
      () => (window as unknown as {__AXOM_HYDRATION_ERRORS__?: string[]}).__AXOM_HYDRATION_ERRORS__ || []
    );
    expect(hydrationErrors).toEqual([]);

    // Email CTA on Contact page & Footer
    const contactEmailCta = page.locator('main').getByRole('link', {name: /Email Axom Hub/i});
    await expect(contactEmailCta).toBeVisible();
    await expect(contactEmailCta).toHaveAttribute(
      'href',
      `mailto:${TEST_EMAIL}?subject=${encodeURIComponent('Axom Hub Business Enquiry')}`
    );

    const footerEmailLink = page.locator(`footer a[href="mailto:${TEST_EMAIL}"]`);
    await expect(footerEmailLink).toBeVisible();

    // WhatsApp CTA on Contact page & Footer
    const contactWaCta = page.locator('main').getByRole('link', {name: /Chat on WhatsApp/i});
    await expect(contactWaCta).toBeVisible();
    await expect(contactWaCta).toHaveAttribute('target', '_blank');
    await expect(contactWaCta).toHaveAttribute('rel', 'noopener noreferrer');

    const waHref = await contactWaCta.getAttribute('href');
    expect(waHref).toBeTruthy();
    const parsedWa = new URL(waHref!);
    expect(parsedWa.protocol).toBe('https:');
    expect(parsedWa.hostname).toBe('wa.me');
    expect(parsedWa.pathname).toBe('/919864000000');
    expect(parsedWa.searchParams.get('text')).toBe(DEFAULT_WHATSAPP_MESSAGE);

    const footerWaCta = page.locator('footer').getByRole('link', {name: /Chat on WhatsApp/i});
    await expect(footerWaCta).toBeVisible();
    await expect(footerWaCta).toHaveAttribute('target', '_blank');
    await expect(footerWaCta).toHaveAttribute('rel', 'noopener noreferrer');

    // Swarm overlay remains z-30 fixed pointer-events-none above page and never blocks interactions
    const canvas = page.locator('canvas[aria-hidden="true"]');
    await expect(canvas).toHaveCount(1);
    const swarmMetrics = await canvas.evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        position: cs.position,
        zIndex: cs.zIndex,
        pointerEvents: cs.pointerEvents,
      };
    });
    expect(swarmMetrics).toEqual({
      position: 'fixed',
      zIndex: '30',
      pointerEvents: 'none',
    });

    // Interactive form fields and buttons remain clickable beneath Swarm overlay
    await page.fill('#contact-name', 'Swarm Check');
    await expect(page.locator('#contact-name')).toHaveValue('Swarm Check');

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(hasOverflow).toBe(false);
    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  async function routeThroughWorker(
    page: import('@playwright/test').Page,
    worker: ReturnType<typeof createContactWorkerHandler>,
    env: Record<string, string>
  ) {
    await page.route(TEST_ENDPOINT, async (route) => {
      const req = route.request();
      const headers = new Headers();
      for (const [k, v] of Object.entries(req.headers())) {
        headers.set(k, v);
      }
      const method = req.method();
      const workerReq = new Request(req.url(), {
        method,
        headers,
        body: method === 'GET' || method === 'HEAD' || method === 'OPTIONS' ? undefined : req.postData() || undefined,
      });
      const workerRes = await worker.fetch(workerReq, env);
      const resHeaders: Record<string, string> = {};
      workerRes.headers.forEach((value, key) => {
        resHeaders[key] = value;
      });
      const bodyText = await workerRes.text();
      await route.fulfill({
        status: workerRes.status,
        headers: resHeaders,
        body: bodyText,
      });
    });
  }

  test('Successful Worker relay submission saves to Google Sheets, sends email, and prevents rapid duplicate clicks', async ({
    page,
  }) => {
    const {consoleErrors, pageErrors} = attachErrorCollectors(page);
    let capturedBody: Record<string, unknown> = {};
    let capturedHeaders: Record<string, string> = {};
    let upstreamBody = '';
    let requestCount = 0;

    const worker = createContactWorkerHandler({
      fetchImpl: async (_url: string | URL | Request, init?: RequestInit) => {
        upstreamBody = String(init?.body || '');
        await new Promise((r) => setTimeout(r, 150));
        return new Response(
          JSON.stringify({
            ok: true,
            saved: true,
            emailSent: true,
            code: 'saved_and_notified',
          }),
          {status: 200, headers: {'Content-Type': 'application/json'}}
        );
      },
    });

    await page.route(TEST_ENDPOINT, async (route) => {
      const req = route.request();
      const method = req.method();
      if (method === 'POST') {
        requestCount++;
        capturedHeaders = req.headers();
        capturedBody = (req.postDataJSON() || {}) as Record<string, unknown>;
      }
      const headers = new Headers();
      for (const [k, v] of Object.entries(req.headers())) {
        headers.set(k, v);
      }
      const workerRes = await worker.fetch(
        new Request(req.url(), {
          method,
          headers,
          body: method === 'OPTIONS' ? undefined : req.postData() || undefined,
        }),
        {ALLOWED_ORIGINS: configuredBaseUrl, APPS_SCRIPT_URL: APPS_SCRIPT_TEST_URL}
      );
      const resHeaders: Record<string, string> = {};
      workerRes.headers.forEach((value, key) => {
        resHeaders[key] = value;
      });
      await route.fulfill({
        status: workerRes.status,
        headers: resHeaders,
        body: await workerRes.text(),
      });
    });

    await page.goto(`${configuredBaseUrl}/contact`, {waitUntil: 'domcontentloaded'});
    await fillValidForm(page);

    const submitBtn = page.getByRole('button', {name: /Request Free Demo/i});
    await submitBtn.click();

    // Loading state and duplicate click prevention while request is in flight
    await expect(page.getByRole('button', {name: /Sending\.\.\./i})).toBeDisabled();
    await page.locator('form button[type="submit"]').click({force: true});

    await expect(page.locator('[role="status"]')).toContainText('Enquiry received');
    expect(requestCount).toBe(1);
    expect(capturedHeaders['content-type']).toContain('application/json');
    expect(capturedHeaders['accept']).toContain('application/json');
    expect(capturedBody).toMatchObject({
      name: SAMPLE_ENQUIRY.name,
      businessName: SAMPLE_ENQUIRY.businessName,
      phone: SAMPLE_ENQUIRY.phone,
      email: SAMPLE_ENQUIRY.email,
      serviceInterest: SAMPLE_ENQUIRY.serviceInterest,
      budget: SAMPLE_ENQUIRY.budget,
      description: SAMPLE_ENQUIRY.description,
      source: 'axom-hub-contact-form',
      website: '',
    });
    expect(String(capturedBody.submissionId)).toMatch(/^[A-Za-z0-9_-]{8,100}$/);

    const forwardedParams = new URLSearchParams(upstreamBody);
    expect(forwardedParams.get('name')).toBe(SAMPLE_ENQUIRY.name);
    expect(forwardedParams.get('submissionId')).toBe(String(capturedBody.submissionId));

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test('Shows distinct status when Google Sheets saves enquiry but email notification fails', async ({
    page,
  }) => {
    const {consoleErrors, pageErrors} = attachErrorCollectors(page);
    const worker = createContactWorkerHandler({
      fetchImpl: async () =>
        new Response(
          JSON.stringify({
            ok: true,
            saved: true,
            emailSent: false,
            code: 'saved_email_failed',
          }),
          {status: 200, headers: {'Content-Type': 'application/json'}}
        ),
    });

    await routeThroughWorker(page, worker, {
      ALLOWED_ORIGINS: configuredBaseUrl,
      APPS_SCRIPT_URL: APPS_SCRIPT_TEST_URL,
    });

    await page.goto(`${configuredBaseUrl}/contact`, {waitUntil: 'domcontentloaded'});
    await fillValidForm(page);
    await page.getByRole('button', {name: /Request Free Demo/i}).click();

    const statusBox = page.locator('[role="status"]');
    await expect(statusBox).toContainText('Enquiry saved — email alert delayed');
    await expect(statusBox).toContainText('saved to our Google Sheet');
    await expect(statusBox.getByRole('button', {name: /Copy enquiry brief/i})).toBeVisible();

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test('Handles spreadsheet save failure, duplicate 409 rejection, and retry cleanly', async ({
    page,
  }) => {
    const {consoleErrors, pageErrors} = attachErrorCollectors(page);
    let upstreamMode: 'sheet-fail' | 'duplicate' | 'save-ok' = 'sheet-fail';
    const worker = createContactWorkerHandler({
      fetchImpl: async () => {
        if (upstreamMode === 'sheet-fail') {
          return new Response(
            JSON.stringify({ok: false, saved: false, emailSent: false, code: 'sheet_write_failed'}),
            {status: 200, headers: {'Content-Type': 'application/json'}}
          );
        }
        if (upstreamMode === 'duplicate') {
          return new Response(
            JSON.stringify({
              ok: false,
              saved: false,
              duplicate: true,
              code: 'duplicate_submission',
            }),
            {status: 200, headers: {'Content-Type': 'application/json'}}
          );
        }
        return new Response(
          JSON.stringify({ok: true, saved: true, emailSent: true, code: 'saved_and_notified'}),
          {status: 200, headers: {'Content-Type': 'application/json'}}
        );
      },
    });

    await routeThroughWorker(page, worker, {
      ALLOWED_ORIGINS: configuredBaseUrl,
      APPS_SCRIPT_URL: APPS_SCRIPT_TEST_URL,
    });

    await page.goto(`${configuredBaseUrl}/contact`, {waitUntil: 'domcontentloaded'});
    await fillValidForm(page);

    // 1. Spreadsheet write fails -> must NOT report success and must preserve values
    await page.getByRole('button', {name: /Request Free Demo/i}).click();
    await expect(page.locator('[role="alert"]').last()).toContainText(
      'could not confirm that your enquiry was saved'
    );
    await assertSampleValuesPreserved(page);

    // 2. Retry succeeds cleanly once Apps Script saves
    upstreamMode = 'save-ok';
    await page.getByRole('button', {name: /Retry submission/i}).click();
    await expect(page.locator('[role="status"]')).toContainText('Enquiry received');

    // 3. Duplicate rejection (409) when Apps Script flags an existing submissionId
    await page.getByRole('button', {name: /Send another enquiry/i}).click();
    await fillValidForm(page);
    upstreamMode = 'duplicate';
    await page.getByRole('button', {name: /Request Free Demo/i}).click();
    await expect(page.locator('[role="alert"]').last()).toContainText('already submitted');
    await assertSampleValuesPreserved(page);

    const unexpectedErrors = consoleErrors.filter(
      (msg) =>
        !msg.includes('Failed to load resource') &&
        !msg.includes('status of 502') &&
        !msg.includes('status of 409')
    );
    expect(unexpectedErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test('Handles HTTP error, malformed response, network failure, and preserves values for retry', async ({
    page,
  }) => {
    const {consoleErrors, pageErrors} = attachErrorCollectors(page);
    let mode: 'http-500' | 'malformed-html' | 'network-fail' | 'success' = 'http-500';

    await page.route(TEST_ENDPOINT, async (route) => {
      if (mode === 'http-500') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({error: 'Internal provider error'}),
        });
        return;
      }
      if (mode === 'malformed-html') {
        await route.fulfill({
          status: 200,
          contentType: 'text/html',
          body: '<html><body>Unexpected HTML gateway page</body></html>',
        });
        return;
      }
      if (mode === 'network-fail') {
        await route.abort('failed');
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ok: true}),
      });
    });

    await page.goto(`${configuredBaseUrl}/contact`, {waitUntil: 'domcontentloaded'});
    await fillValidForm(page);

    // 1. Failed HTTP 500
    await page.getByRole('button', {name: /Request Free Demo/i}).click();
    await expect(page.locator('[role="alert"]').last()).toContainText('Delivery failed (status 500)');
    await assertSampleValuesPreserved(page);

    // 2. Retry into malformed HTML 200 response
    mode = 'malformed-html';
    await page.getByRole('button', {name: /Retry submission/i}).click();
    await expect(page.locator('[role="alert"]').last()).toContainText('unexpected response');
    await assertSampleValuesPreserved(page);

    // 3. Retry into network failure
    mode = 'network-fail';
    await page.getByRole('button', {name: /Retry submission/i}).click();
    await expect(page.locator('[role="alert"]').last()).toContainText('Network error');
    await assertSampleValuesPreserved(page);

    // 4. Retry succeeds once provider recovers
    mode = 'success';
    await page.getByRole('button', {name: /Retry submission/i}).click();
    await expect(page.locator('[role="status"]')).toContainText('Enquiry received');

    // Ignore expected Chromium network error console logs from simulated HTTP 500 / net::ERR_FAILED
    const unexpectedErrors = consoleErrors.filter(
      (msg) =>
        !msg.includes('Failed to load resource') &&
        !msg.includes('ERR_FAILED') &&
        !msg.includes('status of 500')
    );
    expect(unexpectedErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test('Handles request timeout and allows retry without losing form values', async ({page}) => {
    const {consoleErrors, pageErrors} = attachErrorCollectors(page);
    await page.clock.install();

    let shouldHang = true;
    await page.route(TEST_ENDPOINT, async (route) => {
      if (shouldHang) {
        // Leave request pending so the 15s AbortController triggers
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ok: true}),
      });
    });

    await page.goto(`${configuredBaseUrl}/contact`, {waitUntil: 'domcontentloaded'});
    await fillValidForm(page);

    await page.getByRole('button', {name: /Request Free Demo/i}).click();
    await page.clock.fastForward(15_500);

    await expect(page.locator('[role="alert"]').last()).toContainText('timed out');
    await assertSampleValuesPreserved(page);

    shouldHang = false;
    await page.getByRole('button', {name: /Retry submission/i}).click();
    await expect(page.locator('[role="status"]')).toContainText('Enquiry received');

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test('Honeypot field blocks bot submissions without sending any network request', async ({
    page,
  }) => {
    const {consoleErrors, pageErrors} = attachErrorCollectors(page);
    let requestsSent = 0;

    await page.route(TEST_ENDPOINT, async (route) => {
      requestsSent++;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ok: true}),
      });
    });

    await page.goto(`${configuredBaseUrl}/contact`, {waitUntil: 'domcontentloaded'});
    await fillValidForm(page);
    await page.fill('#contact-website', 'https://spam-bot.invalid', {force: true});
    await page.getByRole('button', {name: /Request Free Demo/i}).click();

    await expect(page.locator('[role="alert"]').last()).toContainText(
      'Submission could not be processed'
    );
    expect(requestsSent).toBe(0);
    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });
});
