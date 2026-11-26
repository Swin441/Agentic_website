import 'dotenv/config';

const configuredSiteUrl = process.env.SITE_URL?.trim();

if (!configuredSiteUrl) {
  throw new Error('SITE_URL is required for production prerendering. Set it to the real HTTPS website origin.');
}

let parsedSiteUrl: URL;
try {
  parsedSiteUrl = new URL(configuredSiteUrl);
} catch {
  throw new Error('SITE_URL must be a valid absolute HTTPS URL.');
}

if (parsedSiteUrl.protocol !== 'https:') {
  throw new Error('SITE_URL must use HTTPS for production.');
}

if (
  parsedSiteUrl.username ||
  parsedSiteUrl.password ||
  parsedSiteUrl.search ||
  parsedSiteUrl.hash ||
  parsedSiteUrl.pathname !== '/' ||
  /replace[-_ ]?with|your[-_ ]?domain|placeholder|example\.(com|org|net)/i.test(configuredSiteUrl)
) {
  throw new Error('SITE_URL must be the real website origin only, with no credentials, path, query, fragment or placeholder value.');
}

export const SITE_URL = parsedSiteUrl.origin;
