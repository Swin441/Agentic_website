import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {resolveGoogleSiteVerification, resolveSiteUrl} from './site-url.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const serverEntryPath = path.join(rootDir, 'dist-server', 'entry-server.js');

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function escapeXml(value) {
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

export function getStructuredDataList(routePath, ROUTE_META, siteOrigin, buyerFaqs = []) {
  const organization = {
    '@type': 'Organization',
    name: 'Axom Hub',
    url: `${siteOrigin}/`,
    logo: `${siteOrigin}/assets/aistudio/axom-hub-logo_2d483273.svg`,
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
    const blocks = [
      {
        '@context': 'https://schema.org',
        ...organization,
      },
    ];

    if (Array.isArray(buyerFaqs) && buyerFaqs.length > 0) {
      blocks.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: buyerFaqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      });
    }

    return blocks;
  }

  if (
    routePath === '/services/ai-agents' ||
    routePath === '/services/automation' ||
    routePath === '/services/software'
  ) {
    const meta = ROUTE_META[routePath];
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: meta.title,
        description: meta.description,
        url: `${siteOrigin}${routePath}`,
        areaServed: 'India',
        provider: organization,
      },
    ];
  }

  return [];
}

function buildHeadTags(
  routePath,
  meta,
  siteOrigin,
  isNotFound,
  jsonLdBlocks,
  googleVerificationToken = null
) {
  const ogImageUrl = `${siteOrigin}/og-image.png`;
  const ogImageAlt = 'Axom Hub — AI Agents & Automation for Indian Businesses';
  const tags = [];

  if (isNotFound) {
    tags.push('<meta name="robots" content="noindex" />');
  } else {
    const pageUrl = `${siteOrigin}${routePath}`;
    tags.push(`<link rel="canonical" href="${escapeHtml(pageUrl)}" />`);
    tags.push(`<meta property="og:url" content="${escapeHtml(pageUrl)}" />`);
    tags.push('<meta name="robots" content="index, follow, max-image-preview:large" />');
    if (googleVerificationToken) {
      tags.push(
        `<meta name="google-site-verification" content="${escapeHtml(googleVerificationToken)}" />`
      );
    }
  }

  tags.push('<meta property="og:site_name" content="Axom Hub" />');
  tags.push(`<meta property="og:image" content="${escapeHtml(ogImageUrl)}" />`);
  tags.push('<meta property="og:image:width" content="1200" />');
  tags.push('<meta property="og:image:height" content="630" />');
  tags.push(`<meta property="og:image:alt" content="${escapeHtml(ogImageAlt)}" />`);
  tags.push(`<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`);
  tags.push(`<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`);
  tags.push(`<meta name="twitter:image" content="${escapeHtml(ogImageUrl)}" />`);
  tags.push(`<meta name="twitter:image:alt" content="${escapeHtml(ogImageAlt)}" />`);

  for (const block of jsonLdBlocks) {
    tags.push(`<script type="application/ld+json">${serializeJsonLd(block)}</script>`);
  }

  return tags.map((tag) => `    ${tag}`).join('\n');
}

function buildPageHtml(
  template,
  routePath,
  meta,
  renderFn,
  siteOrigin,
  {isNotFound = false, jsonLdBlocks = [], googleVerificationToken = null} = {}
) {
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

  const headTags = buildHeadTags(
    routePath,
    meta,
    siteOrigin,
    isNotFound,
    jsonLdBlocks,
    googleVerificationToken
  );
  html = html.replace(/<\/head>/i, () => `${headTags}\n  </head>`);
  return html;
}

export function buildSitemapXml(routePaths, siteOrigin, lastmod) {
  const urls = routePaths
    .map((routePath) => {
      const loc = escapeXml(`${siteOrigin}${routePath}`);
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function syncCrawlerTextFiles(siteOrigin) {
  for (const fileName of ['robots.txt', 'llms.txt']) {
    const filePath = path.join(distDir, fileName);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const updated = content.replaceAll('https://REPLACE-WITH-MY-DOMAIN', siteOrigin);
      if (updated !== content) {
        fs.writeFileSync(filePath, updated, 'utf-8');
      }
    }
  }
}

function assertCleanDomainsInDist(routePaths, siteOrigin) {
  const filesToCheck = [
    path.join(distDir, 'sitemap.xml'),
    path.join(distDir, 'robots.txt'),
    path.join(distDir, 'llms.txt'),
    path.join(distDir, '404.html'),
    ...routePaths.map((r) =>
      r === '/'
        ? path.join(distDir, 'index.html')
        : path.join(distDir, r.replace(/^\/+/, ''), 'index.html')
    ),
  ];

  for (const filePath of filesToCheck) {
    const content = fs.readFileSync(filePath, 'utf-8');
    if (/REPLACE-WITH-MY-DOMAIN|YOUR-REAL-DOMAIN/i.test(content)) {
      throw new Error(`Placeholder domain leaked into production output: ${filePath}`);
    }
    if (siteOrigin !== 'https://axom-hub-test.example' && /axom-hub-test\.example/i.test(content)) {
      throw new Error(`Temporary CI domain leaked into production output: ${filePath}`);
    }
  }
}

export async function prerender(overrideUrl, overrideVerificationToken) {
  const siteOrigin = resolveSiteUrl(overrideUrl);
  const googleVerificationToken = resolveGoogleSiteVerification(overrideVerificationToken);

  const templatePath = path.join(distDir, 'index.html');
  const template = fs.readFileSync(templatePath, 'utf-8');
  const {render, ROUTE_META, BUYER_FAQS} = await import(serverEntryPath);

  const routes = Object.entries(ROUTE_META);
  const routePaths = Object.keys(ROUTE_META);

  for (const [routePath, meta] of routes) {
    const jsonLdBlocks = getStructuredDataList(routePath, ROUTE_META, siteOrigin, BUYER_FAQS);
    const html = buildPageHtml(template, routePath, meta, render, siteOrigin, {
      jsonLdBlocks,
      googleVerificationToken,
    });
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
    siteOrigin,
    {isNotFound: true}
  );
  fs.writeFileSync(path.join(distDir, '404.html'), notFoundHtml, 'utf-8');

  const buildDate = new Date().toISOString().slice(0, 10);
  const sitemapXml = buildSitemapXml(routePaths, siteOrigin, buildDate);
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf-8');

  syncCrawlerTextFiles(siteOrigin);
  assertCleanDomainsInDist(routePaths, siteOrigin);

  console.log(
    `Prerendered ${routes.length} routes, 404.html, and sitemap.xml for ${siteOrigin} into dist/`
  );
}

const isCliEntry = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCliEntry) {
  if (process.argv.includes('--check')) {
    const origin = resolveSiteUrl();
    console.log(`Validated SITE_URL: ${origin}`);
  } else {
    prerender().catch((err) => {
      console.error('Prerender failed:', err instanceof Error ? err.message : err);
      process.exit(1);
    });
  }
}
