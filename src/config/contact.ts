export interface ContactConfig {
  /**
   * Optional form endpoint (e.g., Formspree, custom API webhook, or serverless route).
   * Configured via VITE_CONTACT_ENDPOINT in environment variables.
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

export const CONTACT_CONFIG: ContactConfig = {
  formEndpoint: import.meta.env.VITE_CONTACT_ENDPOINT?.trim() || '',
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL?.trim() || '',
  whatsappDisplay: import.meta.env.VITE_CONTACT_WHATSAPP?.trim() || '',
  whatsappHref: import.meta.env.VITE_CONTACT_WHATSAPP_URL?.trim() || '',
  officeLocation: import.meta.env.VITE_OFFICE_LOCATION?.trim() || 'Guwahati, Assam · Serving SMBs across India',
};
