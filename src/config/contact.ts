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

function sanitizeFormEndpoint(raw?: string): string {
  const value = raw?.trim() || '';
  if (!value) return '';
  if (value.startsWith('/') && !value.startsWith('//')) {
    return value;
  }
  try {
    const parsed = new URL(value);
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

function sanitizeWhatsAppHref(raw?: string): string {
  const value = raw?.trim() || '';
  if (!value) return '';
  try {
    const parsed = new URL(value);
    if (parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    return '';
  }
  return '';
}

function sanitizeEmail(raw?: string): string {
  const value = raw?.trim() || '';
  if (!value) return '';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : '';
}

export const CONTACT_CONFIG: ContactConfig = {
  formEndpoint: sanitizeFormEndpoint(import.meta.env.VITE_CONTACT_ENDPOINT),
  contactEmail: sanitizeEmail(import.meta.env.VITE_CONTACT_EMAIL),
  whatsappDisplay: import.meta.env.VITE_CONTACT_WHATSAPP?.trim() || '',
  whatsappHref: sanitizeWhatsAppHref(import.meta.env.VITE_CONTACT_WHATSAPP_URL),
  officeLocation:
    import.meta.env.VITE_OFFICE_LOCATION?.trim() ||
    'Guwahati, Assam · Serving SMBs across India',
};
