import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {escapeHtml} from './prerender.mjs';

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

let passed = 0;
let failed = 0;
const skipped = 0;

function check(name, fn) {
  try {
    fn();
    passed++;
    console.log(`   PASS: ${name}`);
  } catch (err) {
    failed++;
    console.error(`   FAIL: ${name} -> ${err instanceof Error ? err.message : err}`);
  }
}

async function main() {
  assert(fs.existsSync(serverEntryPath), 'Missing dist-server/entry-server.js. Run npm run build first.');
  assert(fs.existsSync(distDir), 'Missing dist/. Run npm run build first.');

  const {render, ROUTE_META} = await import(serverEntryPath);

  console.log('Running static SSR & hydration-readiness regression tests...');

  check('src/main.tsx uses hydrateRoot() without clearing #root or using suppressHydrationWarning', () => {
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
  });

  check('Production client bundle embeds hydrateRoot and omits SwarmCanvas from initial SSR chunk', () => {
    const assetsDir = path.join(distDir, 'assets');
    const jsFiles = fs.readdirSync(assetsDir).filter((f) => f.endsWith('.js'));
    const entryJs = jsFiles.find((f) => f.startsWith('index-'));
    assert(entryJs, 'Missing client entry JS bundle in dist/assets/');
    const entryContent = fs.readFileSync(path.join(assetsDir, entryJs), 'utf-8');
    assert(entryContent.includes('__AXOM_HYDRATION_ERRORS__'), 'Client entry missing hydration tracking');
    assert(entryContent.includes('__AXOM_HYDRATED__'), 'Client entry missing hydration state flag');
  });

  for (const [routePath, meta] of Object.entries(ROUTE_META)) {
    check(`SSR & static hydration parity for ${routePath}`, () => {
      const htmlFile =
        routePath === '/'
          ? path.join(distDir, 'index.html')
          : path.join(distDir, routePath.replace(/^\/+/, ''), 'index.html');
      assert(fs.existsSync(htmlFile), `Missing prerendered HTML: ${htmlFile}`);

      const html = fs.readFileSync(htmlFile, 'utf-8');
      const rootMatch = html.match(/<div id="root">([\s\S]*?)<\/div>\s*<\/body>/i);
      assert(
        rootMatch && rootMatch[1].trim().length > 100,
        `${routePath}: #root HTML was cleared or empty`
      );

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
    });
  }

  check('SSR & static hydration parity for /404', () => {
    const notFoundFile = path.join(distDir, '404.html');
    assert(fs.existsSync(notFoundFile), 'Missing dist/404.html');
    const html = fs.readFileSync(notFoundFile, 'utf-8');
    const rootMatch = html.match(/<div id="root">([\s\S]*?)<\/div>\s*<\/body>/i);
    assert(rootMatch && rootMatch[1].trim().length > 100, '/404: #root HTML empty');
    const ssr404 = render('/404');
    assert.equal(rootMatch[1], ssr404, '/404: dist HTML diverged from render("/404")');
    assert(!ssr404.includes('<canvas'), '/404: SwarmCanvas must not render during SSR');
    assert(ssr404.includes('This page could not be found.'));
  });

  console.log(`\nStatic Hydration Test Summary -> Passed: ${passed}, Failed: ${failed}, Skipped: ${skipped}`);
  if (failed > 0 || skipped > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Static hydration regression test failed:', err);
  process.exit(1);
});
