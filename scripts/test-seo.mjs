import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {resolveSiteUrl} from './site-url.mjs';
import {escapeHtml, escapeXml} from './prerender.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const serverEntryPath = path.join(rootDir, 'dist-server', 'entry-server.js');

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
  const siteOrigin = resolveSiteUrl();
  assert(fs.existsSync(distDir), 'Missing dist/ directory. Run npm run build first.');
  assert(fs.existsSync(serverEntryPath), 'Missing dist-server/entry-server.js. Run npm run build first.');

  const {ROUTE_META, BUYER_FAQS} = await import(serverEntryPath);
  const routes = Object.keys(ROUTE_META);
  const routeSet = new Set(routes);

  console.log(`Running SEO & crawler output tests against ${siteOrigin}...`);

  // 1. sitemap.xml
  const sitemapPath = path.join(distDir, 'sitemap.xml');
  const sitemap = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath, 'utf-8') : '';

  check('sitemap.xml exists and has valid XML declaration + urlset', () => {
    assert(fs.existsSync(sitemapPath), 'dist/sitemap.xml missing');
    assert(sitemap.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
    assert(sitemap.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'));
    assert(sitemap.trim().endsWith('</urlset>'));
  });

  check('sitemap.xml contains all 9 routes, excludes 404, uses test origin, no placeholders', () => {
    assert(!/REPLACE-WITH-MY-DOMAIN/i.test(sitemap), 'Placeholder domain found in sitemap.xml');
    assert(!sitemap.includes('/404'), '404 must not appear in sitemap.xml');
    const locs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
    assert.equal(locs.length, routes.length, `Expected ${routes.length} <loc> entries, got ${locs.length}`);
    for (const route of routes) {
      const expectedLoc = escapeXml(`${siteOrigin}${route}`);
      assert(locs.includes(expectedLoc), `Missing route in sitemap.xml: ${expectedLoc}`);
    }
    const lastmods = [...sitemap.matchAll(/<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/g)];
    assert.equal(lastmods.length, routes.length, 'Every <url> must have YYYY-MM-DD <lastmod>');
  });

  // 2. robots.txt
  const robotsPath = path.join(distDir, 'robots.txt');
  const robots = fs.existsSync(robotsPath) ? fs.readFileSync(robotsPath, 'utf-8') : '';

  check('robots.txt exists, allows crawlers, has synced Sitemap URL, no placeholder', () => {
    assert(fs.existsSync(robotsPath), 'dist/robots.txt missing');
    assert(!/REPLACE-WITH-MY-DOMAIN/i.test(robots), 'Placeholder domain found in robots.txt');
    assert(robots.includes('User-agent: *'));
    assert(robots.includes(`Sitemap: ${siteOrigin}/sitemap.xml`));
  });

  // 3. llms.txt
  const llmsPath = path.join(distDir, 'llms.txt');
  const llms = fs.existsSync(llmsPath) ? fs.readFileSync(llmsPath, 'utf-8') : '';

  check('llms.txt exists, references all 9 canonical routes, states concept demos, no placeholder', () => {
    assert(fs.existsSync(llmsPath), 'dist/llms.txt missing');
    assert(!/REPLACE-WITH-MY-DOMAIN/i.test(llms), 'Placeholder domain found in llms.txt');
    assert(/concept demos and product prototypes/i.test(llms), 'Must state demos are concept demos/prototypes');
    for (const route of routes) {
      assert(llms.includes(`(${siteOrigin}${route})`), `llms.txt missing canonical link for ${route}`);
    }
  });

  // 4. 404.html
  const notFoundPath = path.join(distDir, '404.html');
  const notFoundHtml = fs.existsSync(notFoundPath) ? fs.readFileSync(notFoundPath, 'utf-8') : '';

  check('404.html exists with noindex and no canonical link', () => {
    assert(fs.existsSync(notFoundPath), 'dist/404.html missing');
    assert(!/REPLACE-WITH-MY-DOMAIN/i.test(notFoundHtml), 'Placeholder domain found in 404.html');
    assert(notFoundHtml.includes('<meta name="robots" content="noindex"'));
    assert(!notFoundHtml.includes('rel="canonical"'));
  });

  // 5. All 9 prerendered routes: unique title/description, canonical, OG/Twitter, JSON-LD, no fabricated contacts
  const seenTitles = new Set();
  const seenDescriptions = new Set();

  for (const route of routes) {
    const meta = ROUTE_META[route];
    const htmlPath =
      route === '/' ? path.join(distDir, 'index.html') : path.join(distDir, route.replace(/^\/+/, ''), 'index.html');

    check(`Route ${route}: prerendered HTML, unique meta, canonical, OG/Twitter, JSON-LD & clean facts`, () => {
      assert(fs.existsSync(htmlPath), `Missing prerendered HTML: ${htmlPath}`);
      const html = fs.readFileSync(htmlPath, 'utf-8');
      assert(!/REPLACE-WITH-MY-DOMAIN/i.test(html), `Placeholder domain leaked into ${route}`);
      assert(html.includes(`<title>${escapeHtml(meta.title)}</title>`), 'Title mismatch');
      assert(
        html.includes(`<meta name="description" content="${escapeHtml(meta.description)}"`),
        'Meta description mismatch'
      );
      assert(
        html.includes(`<link rel="canonical" href="${escapeHtml(`${siteOrigin}${route}`)}"`),
        'Canonical mismatch'
      );
      assert(
        html.includes(`<meta property="og:title" content="${escapeHtml(meta.title)}"`),
        'og:title mismatch'
      );
      assert(
        html.includes(`<meta property="og:description" content="${escapeHtml(meta.description)}"`),
        'og:description mismatch'
      );
      assert(
        html.includes(`<meta property="og:url" content="${escapeHtml(`${siteOrigin}${route}`)}"`),
        'og:url mismatch'
      );
      assert(
        html.includes(`<meta property="og:image" content="${escapeHtml(`${siteOrigin}/og-image.png`)}"`),
        'og:image mismatch'
      );
      assert(
        html.includes(`<meta name="twitter:image" content="${escapeHtml(`${siteOrigin}/og-image.png`)}"`),
        'twitter:image mismatch'
      );

      assert(!seenTitles.has(meta.title), `Duplicate title: ${meta.title}`);
      assert(!seenDescriptions.has(meta.description), `Duplicate description: ${meta.description}`);
      seenTitles.add(meta.title);
      seenDescriptions.add(meta.description);

      // Parse all JSON-LD blocks & verify zero fabricated phone/social/street address
      const jsonLdMatches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
      const parsedBlocks = jsonLdMatches.map((m) => JSON.parse(m[1]));

      if (route === '/') {
        assert.equal(parsedBlocks.length, 2, 'Home should contain Organization + FAQPage JSON-LD');
        assert.equal(parsedBlocks[0]['@type'], 'Organization');
        assert.equal(parsedBlocks[0].telephone, undefined, 'Must not invent telephone');
        assert.equal(parsedBlocks[0].sameAs, undefined, 'Must not invent social profiles');
        assert.equal(parsedBlocks[0].address?.streetAddress, undefined, 'Must not invent streetAddress');
        assert.equal(parsedBlocks[1]['@type'], 'FAQPage');
        assert.equal(parsedBlocks[1].mainEntity.length, BUYER_FAQS.length);
      } else if (
        route === '/services/ai-agents' ||
        route === '/services/automation' ||
        route === '/services/software'
      ) {
        assert.equal(parsedBlocks.length, 1, `${route} should contain Service JSON-LD`);
        assert.equal(parsedBlocks[0]['@type'], 'Service');
        assert.equal(parsedBlocks[0].provider?.name, 'Axom Hub');
      }

      // Guard against fabricated tel: links or placeholder phone numbers in HTML
      assert(!/href="tel:/i.test(html), 'Must not include fabricated tel: links');
      assert(!/98XXXXXXXX/i.test(html.replace(/placeholder="[^"]*"/g, '')), 'Placeholder phone outside input placeholder');

      // Check internal links resolve
      for (const m of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
        const target = m[1];
        if (routeSet.has(target)) continue;
        const diskPath = path.join(distDir, target.replace(/^\/+/, ''));
        assert(fs.existsSync(diskPath), `Broken internal reference in ${route}: ${target}`);
      }
    });
  }

  console.log(`\nSEO Test Summary -> Passed: ${passed}, Failed: ${failed}, Skipped: ${skipped}`);
  if (failed > 0 || skipped > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('SEO test runner crashed:', err);
  process.exit(1);
});
