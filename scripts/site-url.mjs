import {SITE_URL as CONFIGURED_SITE_URL} from '../src/config/site.ts';

const PLACEHOLDER_TOKENS = [
  'replace-with-my-domain',
  'yourdomain',
  'your-domain',
  'mydomain',
  'my-domain',
  'placeholder',
  'changeme',
  'example.com',
  'example.org',
  'example.net',
  'example.in',
  'domain.com',
  'website.com',
  'localhost',
];

function isPrivateOrLoopbackHost(hostname) {
  const host = hostname.toLowerCase();
  if (host === 'localhost' || host === '::1' || host === '[::1]') return true;
  if (/^127\./.test(host)) return true;
  if (/^0\.0\.0\.0$/.test(host)) return true;
  if (/^10\./.test(host)) return true;
  if (/^192\.168\./.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return true;
  return false;
}

export function validateSiteUrl(rawUrl) {
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) {
    throw new Error(
      'SITE_URL is required for production prerendering. Set SITE_URL to a real https:// origin (for example: https://axomhub.in).'
    );
  }

  const trimmed = rawUrl.trim();
  if (/\s/.test(trimmed)) {
    throw new Error(`Invalid SITE_URL "${trimmed}": URL must not contain whitespace.`);
  }

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(`Invalid SITE_URL "${trimmed}": unable to parse as a URL.`);
  }

  if (parsed.protocol !== 'https:') {
    throw new Error(
      `Invalid SITE_URL "${trimmed}": production builds require an https:// origin (received ${parsed.protocol}).`
    );
  }

  if (parsed.username || parsed.password) {
    throw new Error(`Invalid SITE_URL "${trimmed}": credentials are not allowed in SITE_URL.`);
  }

  if (parsed.search || parsed.hash) {
    throw new Error(`Invalid SITE_URL "${trimmed}": query strings and fragments are not allowed.`);
  }

  if (parsed.pathname !== '/' && parsed.pathname !== '') {
    throw new Error(
      `Invalid SITE_URL "${trimmed}": must be an origin without a base path (received path "${parsed.pathname}").`
    );
  }

  const hostname = parsed.hostname.toLowerCase();
  if (!hostname || !hostname.includes('.') || hostname.startsWith('.') || hostname.endsWith('.')) {
    throw new Error(`Invalid SITE_URL "${trimmed}": hostname "${hostname}" is not a valid domain.`);
  }

  if (isPrivateOrLoopbackHost(hostname)) {
    throw new Error(`Invalid SITE_URL "${trimmed}": local/private IP addresses are not allowed.`);
  }

  for (const token of PLACEHOLDER_TOKENS) {
    if (hostname === token || hostname.includes(token)) {
      throw new Error(
        `Invalid SITE_URL "${trimmed}": placeholder domain ("${token}") cannot be used in production output.`
      );
    }
  }

  return parsed.origin;
}

export function resolveSiteUrl(overrideUrl) {
  const candidate = overrideUrl !== undefined ? overrideUrl : process.env.SITE_URL ?? CONFIGURED_SITE_URL;
  return validateSiteUrl(candidate);
}
