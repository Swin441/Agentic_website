export const DEFAULT_WHATSAPP_MESSAGE =
  'Hello Axom Hub, I would like to discuss AI agents, business automation or custom software for my business.';

export interface ContactConfig {
  /**
   * Optional public form endpoint (e.g., Formspree URL or server-side /api/contact route).
   * Configured via VITE_CONTACT_ENDPOINT in environment variables.
   * Never store private provider API keys or secrets in VITE_* variables.
   */
  formEndpoint: string;
  /**
   * Optional direct business contact channels configured via environment variables.
   * Left empty when not supplied so placeholder details are never fabricated.
   */
  contactEmail: string;
  whatsappDisplay: string;
  whatsappHref: string;
  officeLocation: string;
}

const ENDPOINT_PLACEHOLDER_PATTERNS = [
  /your[-_]?form[-_]?endpoint/i,
  /replace[-_]?with/i,
  /placeholder/i,
  /changeme/i,
  /\/form_id$/i,
  /^https?:\/\/(?:www\.)?example\.(?:com|org|net)(?:\/|$)/i,
];

const EMAIL_PLACEHOLDER_PATTERNS = [
  /replace[-_]?with/i,
  /placeholder/i,
  /changeme/i,
  /@example\.(?:com|org|net)$/i,
  /@axomhub\.example$/i,
  /@yourbusiness\.in$/i,
];

const PHONE_PLACEHOLDER_PATTERNS = [/x{3,}/i, /^0+$/, /^(\d)\1{9,}$/];

const TRUSTED_WHATSAPP_HOSTS = new Set(['wa.me', 'www.wa.me', 'api.whatsapp.com']);

export function sanitizeFormEndpoint(raw?: string): string {
  const value = raw?.trim() || '';
  if (!value || /\s/.test(value)) return '';

  for (const pattern of ENDPOINT_PLACEHOLDER_PATTERNS) {
    if (pattern.test(value)) return '';
  }

  if (value.startsWith('/') && !value.startsWith('//')) {
    return value;
  }

  try {
    const parsed = new URL(value);
    if (parsed.username || parsed.password) return '';
    if (
      parsed.protocol === 'https:' ||
      (parsed.protocol === 'http:' &&
        (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1'))
    ) {
      return parsed.toString();
    }
  } catch {
    return '';
  }

  return '';
}

export function sanitizeContactEmail(raw?: string): string {
  const value = raw?.trim() || '';
  if (!value || /[\r\n\s]/.test(value)) return '';

  for (const pattern of EMAIL_PLACEHOLDER_PATTERNS) {
    if (pattern.test(value)) return '';
  }

  return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/.test(value) ? value : '';
}

export function sanitizeWhatsAppDisplay(raw?: string): string {
  const value = raw?.trim() || '';
  if (!value) return '';

  for (const pattern of PHONE_PLACEHOLDER_PATTERNS) {
    if (pattern.test(value)) return '';
  }

  const digits = value.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) return '';
  for (const pattern of PHONE_PLACEHOLDER_PATTERNS) {
    if (pattern.test(digits)) return '';
  }

  return value;
}

function isValidPhoneDigits(digits: string): boolean {
  if (!/^\d{10,15}$/.test(digits)) return false;
  for (const pattern of PHONE_PLACEHOLDER_PATTERNS) {
    if (pattern.test(digits)) return false;
  }
  return true;
}

function appendPrefilledMessage(urlString: string, prefillMessage: string): string {
  const parsed = new URL(urlString);
  if (!parsed.searchParams.has('text') && prefillMessage.trim()) {
    const separator = parsed.search ? '&' : '?';
    return `${parsed.toString()}${separator}text=${encodeURIComponent(prefillMessage)}`;
  }
  return parsed.toString();
}

export function sanitizeWhatsAppHref(
  rawUrl?: string,
  rawPhone?: string,
  prefillMessage: string = DEFAULT_WHATSAPP_MESSAGE
): string {
  const urlValue = rawUrl?.trim() || '';

  if (urlValue) {
    if (/\s/.test(urlValue)) return '';
    try {
      const parsed = new URL(urlValue);
      if (parsed.protocol !== 'https:') return '';
      if (parsed.username || parsed.password) return '';

      const host = parsed.hostname.toLowerCase();
      if (!TRUSTED_WHATSAPP_HOSTS.has(host)) return '';

      if (host === 'wa.me' || host === 'www.wa.me') {
        const digits = parsed.pathname.replace(/^\/+|\/+$/g, '');
        if (!isValidPhoneDigits(digits)) return '';
        parsed.pathname = `/${digits}`;
        return appendPrefilledMessage(parsed.toString(), prefillMessage);
      }

      if (host === 'api.whatsapp.com') {
        const cleanPath = parsed.pathname.replace(/\/+$/, '');
        if (cleanPath !== '/send') return '';
        const phoneParam = (parsed.searchParams.get('phone') || '').replace(/\D/g, '');
        if (!isValidPhoneDigits(phoneParam)) return '';
        return appendPrefilledMessage(parsed.toString(), prefillMessage);
      }
    } catch {
      return '';
    }
    return '';
  }

  const cleanDisplay = sanitizeWhatsAppDisplay(rawPhone);
  if (!cleanDisplay) return '';

  const digits = cleanDisplay.replace(/\D/g, '');
  if (!isValidPhoneDigits(digits)) return '';
  return appendPrefilledMessage(`https://wa.me/${digits}`, prefillMessage);
}

const hasViteEnv = typeof import.meta !== 'undefined' && typeof import.meta.env !== 'undefined';

export const CONTACT_CONFIG: ContactConfig = {
  formEndpoint: sanitizeFormEndpoint(
    hasViteEnv ? import.meta.env.VITE_CONTACT_ENDPOINT : undefined
  ),
  contactEmail: sanitizeContactEmail(
    hasViteEnv ? import.meta.env.VITE_CONTACT_EMAIL : undefined
  ),
  whatsappDisplay: sanitizeWhatsAppDisplay(
    hasViteEnv ? import.meta.env.VITE_CONTACT_WHATSAPP : undefined
  ),
  whatsappHref: sanitizeWhatsAppHref(
    hasViteEnv ? import.meta.env.VITE_CONTACT_WHATSAPP_URL : undefined,
    hasViteEnv ? import.meta.env.VITE_CONTACT_WHATSAPP : undefined
  ),
  officeLocation:
    (hasViteEnv ? import.meta.env.VITE_OFFICE_LOCATION?.trim() : '') ||
    'Guwahati, Assam · Serving SMBs across India',
};
