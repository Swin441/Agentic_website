import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {SITE_URL} from '../src/config/site.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const serverEntryPath = path.join(rootDir, 'dist-server', 'entry-server.js');
const normalizedSiteUrl = SITE_URL.replace(/\/+$/, '');

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function serializeJsonLd(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

function replaceMetaTag(html, attrName, attrValue, content) {
  const escaped = escapeHtml(content);
  const regex = new RegExp(`<meta\\s+[^>]*${attrName}=["']${attrValue}["'][^>]*>`, 'i');
  if (!regex.test(html)) {
    throw new Error(`Expected <meta ${attrName}="${attrValue}"> tag in dist/index.html template`);
  }
  return html.replace(regex, () => `<meta ${attrName}="${attrValue}" content="${escaped}" />`);
}

function getStructuredData(routePath, ROUTE_META) {
  const organization = {
    '@type': 'Organization',
    name: 'Axom Hub',
    url: `${normalizedSiteUrl}/`,
    logo: `${normalizedSiteUrl}/assets/aistudio/axom-hub-logo_2d483273.svg`,
    description: ROUTE_META['/'].description,
    areaServed: 'India',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Guwahati',
      addressRegion: 'Assam',
      addressCountry: 'IN',
    },
  };

  if (routePath === '/') {
    return {
      '@context': 'https://schema.org',
      ...organization,
    };
  }

  if (
    routePath === '/services/ai-agents' ||
    routePath === '/services/automation' ||
    routePath === '/services/software'
  ) {
    const meta = ROUTE_META[routePath];
    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: meta.title,
      description: meta.description,
      url: `${normalizedSiteUrl}${routePath}`,
      areaServed: 'India',
      provider: organization,
    };
  }

  return null;
}

function buildHeadTags(routePath, isNotFound, jsonLd) {
  const ogImageUrl = `${normalizedSiteUrl}/og-image.png`;
  const tags = [];

  if (isNotFound) {
    tags.push('<meta name="robots" content="noindex" />');
  } else {
    const pageUrl = `${normalizedSiteUrl}${routePath}`;
    tags.push(`<link rel="canonical" href="${escapeHtml(pageUrl)}" />`);
    tags.push(`<meta property="og:url" content="${escapeHtml(pageUrl)}" />`);
    tags.push('<meta name="robots" content="index, follow, max-image-preview:large" />');
  }

  tags.push(`<meta property="og:site_name" content="Axom Hub" />`);
  tags.push(`<meta property="og:image" content="${escapeHtml(ogImageUrl)}" />`);
  tags.push(`<meta name="twitter:image" content="${escapeHtml(ogImageUrl)}" />`);

  if (jsonLd) {
    tags.push(`<script type="application/ld+json">${serializeJsonLd(jsonLd)}</script>`);
  }

  return tags.map((tag) => `    ${tag}`).join('\n');
}

function buildPageHtml(template, routePath, meta, renderFn, {isNotFound = false, jsonLd = null} = {}) {
  const appHtml = renderFn(routePath);
  const rootPattern = /<div id="root">\s*<\/div>/;
  if (!rootPattern.test(template)) {
    throw new Error('Expected <div id="root"></div> placeholder in dist/index.html template');
  }

  let html = template.replace(rootPattern, () => `<div id="root">${appHtml}</div>`);
  html = html.replace(/<title>[\s\S]*?<\/title>/i, () => `<title>${escapeHtml(meta.title)}</title>`);
  html = replaceMetaTag(html, 'name', 'description', meta.description);
  html = replaceMetaTag(html, 'property', 'og:title', meta.title);
  html = replaceMetaTag(html, 'property', 'og:description', meta.description);

  const headTags = buildHeadTags(routePath, isNotFound, jsonLd);
  html = html.replace(/<\/head>/i, () => `${headTags}\n  </head>`);
  return html;
}

function buildSitemapXml(routePaths, lastmod) {
  const urls = routePaths
    .map((routePath) => {
      const loc = escapeXml(`${normalizedSiteUrl}${routePath}`);
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function syncCrawlerTextFiles() {
  for (const fileName of ['robots.txt', 'llms.txt']) {
    const filePath = path.join(distDir, fileName);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const updated = content.replaceAll('https://REPLACE-WITH-MY-DOMAIN', normalizedSiteUrl);
      if (updated !== content) {
        fs.writeFileSync(filePath, updated, 'utf-8');
      }
    }
  }
}

function assertNoPlaceholderDomains() {
  const scanExtensions = new Set(['.html', '.xml', '.txt']);
  const pending = [distDir];

  while (pending.length > 0) {
    const current = pending.pop();
    for (const entry of fs.readdirSync(current, {withFileTypes: true})) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        pending.push(fullPath);
        continue;
      }

      if (!scanExtensions.has(path.extname(entry.name).toLowerCase())) {
        continue;
      }

      const content = fs.readFileSync(fullPath, 'utf-8');
      if (/REPLACE-WITH-MY-DOMAIN|your-domain\.(com|example)|example\.(com|org|net)/i.test(content)) {
        throw new Error(`Placeholder domain found in generated file: ${path.relative(distDir, fullPath)}`);
      }
    }
  }
}

async function main() {
  const templatePath = path.join(distDir, 'index.html');
  const template = fs.readFileSync(templatePath, 'utf-8');
  const {render, ROUTE_META} = await import(serverEntryPath);

  const routes = Object.entries(ROUTE_META);
  for (const [routePath, meta] of routes) {
    const jsonLd = getStructuredData(routePath, ROUTE_META);
    const html = buildPageHtml(template, routePath, meta, render, {jsonLd});
    const outPath =
      routePath === '/'
        ? path.join(distDir, 'index.html')
        : path.join(distDir, routePath.replace(/^\/+/, ''), 'index.html');

    fs.mkdirSync(path.dirname(outPath), {recursive: true});
    fs.writeFileSync(outPath, html, 'utf-8');
  }

  const notFoundHtml = buildPageHtml(
    template,
    '/404',
    {
      title: 'Page Not Found — Axom Hub',
      description: 'The requested page could not be found on Axom Hub.',
    },
    render,
    {isNotFound: true}
  );
  fs.writeFileSync(path.join(distDir, '404.html'), notFoundHtml, 'utf-8');

  const buildDate = new Date().toISOString().slice(0, 10);
  const sitemapXml = buildSitemapXml(Object.keys(ROUTE_META), buildDate);
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf-8');

  syncCrawlerTextFiles();
  assertNoPlaceholderDomains();

  console.log(`Prerendered ${routes.length} routes, 404.html, and sitemap.xml into dist/`);
}

main().catch((err) => {
  console.error('Prerender failed:', err);
  process.exit(1);
});
