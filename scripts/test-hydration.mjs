import assert from 'node:assert/strict';
import {execFile, execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';
import {escapeHtml} from './prerender.mjs';

const execFileAsync = promisify(execFile);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const serverEntryPath = path.join(rootDir, 'dist-server', 'entry-server.js');

const EXPECTED_ROUTE_HEADINGS = {
  '/': 'Your Business. Upgraded with AI.',
  '/services': 'AI agents, automation, and custom software shaped around your operations.',
  '/services/ai-agents': 'AI Agents built to handle real customer conversations cleanly.',
  '/services/automation': 'WhatsApp and business automation that removes repetitive desk work.',
  '/services/software': 'Custom software, websites, portals, and AI integrations built for daily speed.',
  '/industries': 'Built for coaching institutes, showrooms, clinics, and distributors across India.',
  '/work': 'Concept demos and prototypes for everyday business workflows.',
  '/about': 'An AI and business technology agency in Guwahati built for real Indian SMBs.',
  '/contact': 'Book a practical walkthrough for your business.',
};

function runStaticHydrationChecks(render, ROUTE_META) {
  console.log('1. Checking src/main.tsx uses hydrateRoot and does not clear #root...');
  const mainSource = fs.readFileSync(path.join(rootDir, 'src', 'main.tsx'), 'utf-8');
  assert.match(mainSource, /\bhydrateRoot\s*\(/, 'src/main.tsx must initialize with hydrateRoot()');
  assert.doesNotMatch(
    mainSource,
    /innerHTML\s*=|replaceChildren\s*\(/,
    'src/main.tsx must not clear prerendered #root HTML'
  );
  assert.doesNotMatch(
    mainSource,
    /suppressHydrationWarning/,
    'Do not mask hydration errors with suppressHydrationWarning'
  );

  console.log('2. Checking prerendered HTML parity & determinism across all 9 routes + 404...');
  for (const [routePath, meta] of Object.entries(ROUTE_META)) {
    const htmlFile =
      routePath === '/'
        ? path.join(distDir, 'index.html')
        : path.join(distDir, routePath.replace(/^\/+/, ''), 'index.html');
    assert(fs.existsSync(htmlFile), `Missing prerendered HTML for ${routePath}: ${htmlFile}`);

    const html = fs.readFileSync(htmlFile, 'utf-8');
    const rootMatch = html.match(/<div id="root">([\s\S]*?)<\/div>\s*<\/body>/i);
    assert(rootMatch && rootMatch[1].trim().length > 100, `${routePath}: #root HTML was cleared or empty`);

    const ssrPass1 = render(routePath);
    const ssrPass2 = render(routePath);
    assert.equal(ssrPass1, ssrPass2, `${routePath}: SSR output is non-deterministic`);
    assert.equal(
      rootMatch[1],
      ssrPass1,
      `${routePath}: dist HTML #root markup diverged from render(route)`
    );
    assert(!ssrPass1.includes('<canvas'), `${routePath}: SwarmCanvas must not render during SSR`);
    assert(html.includes(`<title>${escapeHtml(meta.title)}</title>`), `${routePath}: <title> mismatch`);

    const expectedH1 = EXPECTED_ROUTE_HEADINGS[routePath];
    assert(expectedH1, `Missing expected H1 mapping for ${routePath}`);
    assert(ssrPass1.includes(expectedH1), `${routePath}: missing expected H1 "${expectedH1}"`);
    console.log(`   PASS static SSR/hydration parity: ${routePath}`);
  }

  const notFoundFile = path.join(distDir, '404.html');
  assert(fs.existsSync(notFoundFile), 'Missing dist/404.html');
  const notFoundHtml = fs.readFileSync(notFoundFile, 'utf-8');
  assert(notFoundHtml.includes('404') && notFoundHtml.includes('Page not found'));
  console.log('   PASS static SSR/hydration parity: /404');
}

function startStrictProbeServer(port = 4175) {
  const mime = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.xml': 'application/xml; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8',
  };

  const probeScript = `<script>window.__SSR_H1_NODE__=document.querySelector('#root h1');window.__SSR_MAIN_NODE__=document.getElementById('main-content');window.__SSR_HEADER_NODE__=document.querySelector('header');window.__SSR_TEXT_LEN__=(document.getElementById('root')?.innerText||'').trim().length;</script>`;

  const injectProbe = (html) => html.replace('</body>', `${probeScript}</body>`);

  const server = http.createServer((req, res) => {
    const reqPath = decodeURIComponent((req.url || '/').split('?')[0]);
    const clean = reqPath.replace(/^\/+/, '');
    const fileTarget = path.join(distDir, clean);

    if (fs.existsSync(fileTarget) && fs.statSync(fileTarget).isFile()) {
      const ext = path.extname(fileTarget);
      if (ext === '.html') {
        const html = fs.readFileSync(fileTarget, 'utf-8');
        res.writeHead(200, {'Content-Type': mime['.html']});
        res.end(injectProbe(html));
      } else {
        res.writeHead(200, {'Content-Type': mime[ext] || 'application/octet-stream'});
        fs.createReadStream(fileTarget).pipe(res);
      }
      return;
    }

    const routeHtml =
      reqPath === '/'
        ? path.join(distDir, 'index.html')
        : path.join(distDir, clean, 'index.html');

    if (fs.existsSync(routeHtml) && fs.statSync(routeHtml).isFile()) {
      const html = fs.readFileSync(routeHtml, 'utf-8');
      res.writeHead(200, {'Content-Type': mime['.html']});
      res.end(injectProbe(html));
      return;
    }

    const notFoundHtml = fs.readFileSync(path.join(distDir, '404.html'), 'utf-8');
    res.writeHead(404, {'Content-Type': mime['.html']});
    res.end(injectProbe(notFoundHtml));
  });

  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

function hasPlaywrightCli() {
  try {
    execFileSync('playwright-cli', ['--version'], {stdio: 'ignore'});
    return true;
  } catch {
    return false;
  }
}

async function pw(session, args) {
  const {stdout} = await execFileAsync('playwright-cli', [`-s=${session}`, ...args], {
    cwd: rootDir,
    encoding: 'utf-8',
  });
  return stdout;
}

function parsePwEval(rawOutput) {
  const match = rawOutput.match(/### Result\s+([\s\S]*?)\s+### Ran Playwright code/);
  if (!match) {
    throw new Error(`Unexpected playwright-cli output:\n${rawOutput}`);
  }
  return JSON.parse(match[1]);
}

async function runBrowserHydrationChecks(ROUTE_META) {
  if (!hasPlaywrightCli()) {
    console.log('SKIP browser hydration suite: playwright-cli not installed in this environment.');
    return;
  }

  console.log('3. Running real Chromium hydration & navigation verification across all 9 routes...');
  const port = 4175;
  const server = await startStrictProbeServer(port);
  const session = `axom-hydration-${process.pid}`;

  try {
    await pw(session, ['open', `http://127.0.0.1:${port}/`]);
    await pw(session, ['resize', '1440', '900']);

    for (const [routePath, meta] of Object.entries(ROUTE_META)) {
      await pw(session, ['goto', `http://127.0.0.1:${port}${routePath}`]);
      await new Promise((r) => setTimeout(r, 350));

      const result = parsePwEval(
        await pw(session, [
          'eval',
          `() => ({
            path: window.location.pathname,
            title: document.title,
            hydratedFlag: Boolean(window.__AXOM_HYDRATED__),
            hydrationErrors: window.__AXOM_HYDRATION_ERRORS__ || [],
            sameH1Node: Boolean(window.__SSR_H1_NODE__) && document.querySelector('#root h1') === window.__SSR_H1_NODE__,
            sameMainNode: Boolean(window.__SSR_MAIN_NODE__) && document.getElementById('main-content') === window.__SSR_MAIN_NODE__,
            ssrTextLen: window.__SSR_TEXT_LEN__ || 0,
            currentTextLen: (document.getElementById('root')?.innerText || '').trim().length,
            h1Text: document.querySelector('#root h1')?.textContent?.trim() || '',
            canvasMounted: document.querySelectorAll('canvas').length,
            overflowX: document.documentElement.scrollWidth > window.innerWidth
          })`,
        ])
      );

      assert.equal(result.path, routePath, `Path mismatch on ${routePath}`);
      assert.equal(result.title, meta.title, `Title mismatch on ${routePath}`);
      assert.equal(result.hydratedFlag, true, `Hydration flag not set on ${routePath}`);
      assert.deepEqual(result.hydrationErrors, [], `Hydration errors on ${routePath}: ${result.hydrationErrors.join('; ')}`);
      assert.equal(result.sameH1Node, true, `${routePath}: <h1> DOM node was replaced instead of hydrated in place!`);
      assert.equal(result.sameMainNode, true, `${routePath}: <main> DOM node was replaced instead of hydrated in place!`);
      assert(result.ssrTextLen > 200 && result.currentTextLen >= result.ssrTextLen, `${routePath}: prerendered content missing`);
      assert.equal(result.h1Text, EXPECTED_ROUTE_HEADINGS[routePath], `${routePath}: H1 mismatch`);
      assert.equal(result.canvasMounted, 1, `${routePath}: SwarmCanvas did not mount post-hydration`);
      assert.equal(result.overflowX, false, `${routePath}: horizontal overflow detected`);
      console.log(`   PASS browser hydration (in-place DOM preserved, 0 errors): ${routePath}`);
    }

    // Verify navigation + browser Back / Forward after hydration without full reload
    await pw(session, ['goto', `http://127.0.0.1:${port}/`]);
    await new Promise((r) => setTimeout(r, 350));

    const navForward = parsePwEval(
      await pw(session, [
        'eval',
        `async () => {
          const initialHeader = window.__SSR_HEADER_NODE__;
          const clickLink = (href) => {
            const link = [...document.querySelectorAll('header nav a')].find(a => a.getAttribute('href') === href);
            if (!link) throw new Error('Missing header nav link: ' + href);
            link.click();
          };
          clickLink('/services');
          await new Promise(r => setTimeout(r, 150));
          const step1 = { path: location.pathname, h1: document.querySelector('h1')?.textContent?.trim(), sameHeader: document.querySelector('header') === initialHeader };

          clickLink('/work');
          await new Promise(r => setTimeout(r, 150));
          const step2 = { path: location.pathname, h1: document.querySelector('h1')?.textContent?.trim(), sameHeader: document.querySelector('header') === initialHeader };

          history.back();
          await new Promise(r => setTimeout(r, 150));
          const backStep = { path: location.pathname, h1: document.querySelector('h1')?.textContent?.trim(), sameHeader: document.querySelector('header') === initialHeader };

          history.forward();
          await new Promise(r => setTimeout(r, 150));
          const fwdStep = { path: location.pathname, h1: document.querySelector('h1')?.textContent?.trim(), sameHeader: document.querySelector('header') === initialHeader };

          return { step1, step2, backStep, fwdStep };
        }`,
      ])
    );

    assert.equal(navForward.step1.path, '/services');
    assert.equal(navForward.step1.sameHeader, true);
    assert.equal(navForward.step2.path, '/work');
    assert.equal(navForward.step2.sameHeader, true);
    assert.equal(navForward.backStep.path, '/services');
    assert.equal(navForward.backStep.sameHeader, true);
    assert.equal(navForward.fwdStep.path, '/work');
    assert.equal(navForward.fwdStep.sameHeader, true);
    console.log('   PASS client navigation + browser back/forward preserved hydrated SPA shell');

    // Verify 404 route hydration
    await pw(session, ['goto', `http://127.0.0.1:${port}/nonexistent-route-check`]);
    await new Promise((r) => setTimeout(r, 300));
    const notFoundRes = parsePwEval(
      await pw(session, [
        'eval',
        `() => ({
          hydratedFlag: Boolean(window.__AXOM_HYDRATED__),
          hydrationErrors: window.__AXOM_HYDRATION_ERRORS__ || [],
          sameH1Node: Boolean(window.__SSR_H1_NODE__) && document.querySelector('#root h1') === window.__SSR_H1_NODE__,
          h1Text: document.querySelector('#root h1')?.textContent?.trim() || ''
        })`,
      ])
    );
    assert.equal(notFoundRes.hydratedFlag, true);
    assert.deepEqual(notFoundRes.hydrationErrors, []);
    assert.equal(notFoundRes.sameH1Node, true);
    assert.match(notFoundRes.h1Text, /This page could not be found/i);
    console.log('   PASS /404 hydration (in-place DOM preserved, 0 errors)');

    // Verify reduced-motion hydration + SwarmCanvas skip
    await pw(session, ['set-reduced-motion', 'reduce']);
    await pw(session, ['goto', `http://127.0.0.1:${port}/`]);
    await new Promise((r) => setTimeout(r, 350));
    const reducedRes = parsePwEval(
      await pw(session, [
        'eval',
        `() => ({
          reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
          hydrationErrors: window.__AXOM_HYDRATION_ERRORS__ || [],
          sameH1Node: Boolean(window.__SSR_H1_NODE__) && document.querySelector('#root h1') === window.__SSR_H1_NODE__,
          hiddenTargets: document.querySelectorAll('[data-swarm]').length
        })`,
      ])
    );
    assert.equal(reducedRes.reducedMotion, true);
    assert.deepEqual(reducedRes.hydrationErrors, []);
    assert.equal(reducedRes.sameH1Node, true);
    assert.equal(reducedRes.hiddenTargets, 0);
    await pw(session, ['clear-reduced-motion']);
    console.log('   PASS reduced-motion hydration & SwarmCanvas skip');

    // Verify mobile layout (390x844)
    await pw(session, ['resize', '390', '844']);
    for (const mobileRoute of ['/', '/services', '/work', '/contact']) {
      await pw(session, ['goto', `http://127.0.0.1:${port}${mobileRoute}`]);
      await new Promise((r) => setTimeout(r, 300));
      const mRes = parsePwEval(
        await pw(session, [
          'eval',
          `() => ({
            hydrationErrors: window.__AXOM_HYDRATION_ERRORS__ || [],
            sameH1Node: Boolean(window.__SSR_H1_NODE__) && document.querySelector('#root h1') === window.__SSR_H1_NODE__,
            overflowX: document.documentElement.scrollWidth > window.innerWidth
          })`,
        ])
      );
      assert.deepEqual(mRes.hydrationErrors, []);
      assert.equal(mRes.sameH1Node, true);
      assert.equal(mRes.overflowX, false, `Mobile overflow on ${mobileRoute}`);
    }
    console.log('   PASS mobile 390x844 hydration & layout checks');

    const consoleOutput = await pw(session, ['console', 'error']);
    assert(!consoleOutput.includes('[error]'), `Browser console errors detected:\n${consoleOutput}`);
    console.log('   PASS zero browser console errors');
  } finally {
    try {
      await pw(session, ['close']);
    } catch {
      // ignore close errors
    }
    server.close();
  }
}

async function main() {
  assert(fs.existsSync(serverEntryPath), 'Missing dist-server/entry-server.js. Run npm run build first.');
  const {render, ROUTE_META} = await import(serverEntryPath);
  runStaticHydrationChecks(render, ROUTE_META);
  await runBrowserHydrationChecks(ROUTE_META);
  console.log('\nALL HYDRATION REGRESSION CHECKS PASSED.');
}

main().catch((err) => {
  console.error('Hydration regression test failed:', err);
  process.exit(1);
});
