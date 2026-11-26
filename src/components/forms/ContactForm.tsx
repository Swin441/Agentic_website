import React, {useEffect, useRef, useState} from 'react';
import {AlertCircle, Check, Copy, Info, Send} from 'lucide-react';
import {CONTACT_CONFIG} from '../../config/contact';
import {PrimaryButton, SecondaryButton} from '../ui/Buttons';

export interface ContactFormValues {
  name: string;
  businessName: string;
  phone: string;
  email: string;
  serviceInterest: string;
  description: string;
  budget: string;
}

const INITIAL_VALUES: ContactFormValues = {
  name: '',
  businessName: '',
  phone: '',
  email: '',
  serviceInterest: 'AI Agents',
  description: '',
  budget: '',
};

type FormErrors = Partial<Record<keyof ContactFormValues, string>>;

const FIELD_INPUT_IDS: Record<keyof ContactFormValues, string> = {
  name: 'contact-name',
  businessName: 'contact-business',
  phone: 'contact-phone',
  email: 'contact-email',
  serviceInterest: 'contact-service',
  budget: 'contact-budget',
  description: 'contact-description',
};

const SUBMIT_TIMEOUT_MS = 15000;

export function validateContactForm(values: ContactFormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Please enter your name.';
  }

  if (!values.businessName.trim()) {
    errors.businessName = 'Please enter your business or organization name.';
  }

  const digitsOnly = values.phone.replace(/\D/g, '');
  if (!values.phone.trim()) {
    errors.phone = 'Please enter a phone or WhatsApp number.';
  } else if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    errors.phone = 'Enter a valid 10 to 15 digit phone or WhatsApp number.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!values.email.trim()) {
    errors.email = 'Please enter your email address.';
  } else if (!emailRegex.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!values.serviceInterest.trim()) {
    errors.serviceInterest = 'Please select what you are interested in.';
  }

  if (!values.description.trim()) {
    errors.description = 'Briefly describe your business workflow or what you want to build.';
  } else if (values.description.trim().length < 15) {
    errors.description = 'Please add a bit more detail (at least 15 characters).';
  }

  return errors;
}

export interface ContactFormProps {
  endpointOverride?: string;
}

export function ContactForm({endpointOverride}: ContactFormProps = {}) {
  const [values, setValues] = useState<ContactFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<
    'idle' | 'submitting' | 'submitted' | 'unconfigured' | 'error'
  >('idle');
  const [serverError, setServerError] = useState('');
  const [copied, setCopied] = useState(false);

  const submittingRef = useRef(false);
  const successRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  const activeEndpoint = (endpointOverride ?? CONTACT_CONFIG.formEndpoint).trim();

  useEffect(() => {
    if (status === 'submitted') {
      successRef.current?.focus();
    } else if (status === 'error') {
      errorRef.current?.focus();
    }
  }, [status]);

  const handleChange = (field: keyof ContactFormValues, value: string) => {
    if (submittingRef.current) return;
    setValues((prev) => ({...prev, [field]: value}));
    if (errors[field]) {
      setErrors((prev) => ({...prev, [field]: undefined}));
    }
    if (status === 'error' || status === 'unconfigured') {
      setStatus('idle');
      setServerError('');
    }
  };

  const formattedSummary = [
    'Axom Hub Demo Enquiry',
    `Name: ${values.name.trim()}`,
    `Business: ${values.businessName.trim()}`,
    `Phone / WhatsApp: ${values.phone.trim()}`,
    `Email: ${values.email.trim()}`,
    `Service Interest: ${values.serviceInterest}`,
    `Estimated Budget: ${values.budget || 'Custom INR quotation requested'}`,
    `Workflow / Project Description: ${values.description.trim()}`,
  ].join('\n');

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(formattedSummary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current || status === 'submitting') {
      return;
    }

    const validationErrors = validateContactForm(values);
    setErrors(validationErrors);

    const firstInvalidField = (Object.keys(FIELD_INPUT_IDS) as (keyof ContactFormValues)[]).find(
      (key) => Boolean(validationErrors[key])
    );

    if (firstInvalidField) {
      if (typeof document !== 'undefined') {
        document.getElementById(FIELD_INPUT_IDS[firstInvalidField])?.focus();
      }
      return;
    }

    if (!activeEndpoint) {
      setStatus('unconfigured');
      return;
    }

    submittingRef.current = true;
    setStatus('submitting');
    setServerError('');

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS);

    try {
      const response = await fetch(activeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          name: values.name.trim(),
          businessName: values.businessName.trim(),
          phone: values.phone.trim(),
          email: values.email.trim(),
          serviceInterest: values.serviceInterest,
          budget: values.budget,
          description: values.description.trim(),
          source: 'axom-hub-contact-form',
        }),
      });

      const contentType = (response.headers.get('content-type') || '').toLowerCase();
      let payload: Record<string, unknown> | null = null;
      if (contentType.includes('json')) {
        try {
          payload = (await response.json()) as Record<string, unknown>;
        } catch {
          payload = null;
        }
      }

      if (!response.ok) {
        const providerMsg =
          (typeof payload?.error === 'string' && payload.error) ||
          (typeof payload?.message === 'string' && payload.message) ||
          `Delivery failed with status ${response.status}.`;
        throw new Error(providerMsg);
      }

      if (response.status !== 204 && contentType.includes('text/html')) {
        throw new Error(
          'The enquiry endpoint returned an HTML page instead of a delivery confirmation.'
        );
      }

      if (
        payload &&
        (payload.ok === false ||
          payload.success === false ||
          (Array.isArray(payload.errors) && payload.errors.length > 0))
      ) {
        const providerMsg =
          (typeof payload.error === 'string' && payload.error) ||
          (typeof payload.message === 'string' && payload.message) ||
          'The enquiry provider rejected this submission.';
        throw new Error(providerMsg);
      }

      setStatus('submitted');
      setValues(INITIAL_VALUES);
      setErrors({});
    } catch (err) {
      setStatus('error');
      if (err instanceof DOMException && err.name === 'AbortError') {
        setServerError(
          'The request timed out before delivery could be confirmed. Please retry or copy your enquiry brief below.'
        );
      } else {
        setServerError(
          err instanceof Error && err.message
            ? `${err.message} Your details were preserved—please retry or copy your enquiry brief below.`
            : 'Network error while sending your enquiry. Please retry or copy your enquiry brief below.'
        );
      }
    } finally {
      window.clearTimeout(timeoutId);
      submittingRef.current = false;
    }
  };

  const inputBaseClass =
    'w-full rounded-lg bg-[#07130F] border px-4 py-3 text-sm text-white placeholder-[#53685E] transition-colors focus:outline-none focus:border-[#AEF830] disabled:opacity-70';

  const isSubmitting = status === 'submitting';

  if (status === 'submitted') {
    return (
      <div
        ref={successRef}
        role="status"
        aria-live="polite"
        tabIndex={-1}
        className="bg-[#101C18] border border-[#203C30] rounded-2xl p-6 sm:p-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#AEF830]"
      >
        <div className="w-11 h-11 rounded-lg bg-[#AEF830]/15 border border-[#AEF830]/40 flex items-center justify-center mb-5">
          <Check className="w-5 h-5 text-[#AEF830]" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-semibold text-white">Enquiry received</h3>
        <p className="mt-2 text-sm text-[#A6B4AC] leading-relaxed">
          Thank you for sharing your business details. Your enquiry has been delivered and our team
          will review your workflow notes to schedule your demo walkthrough.
        </p>
        <div className="mt-6">
          <SecondaryButton onClick={() => setStatus('idle')}>
            Send another enquiry
          </SecondaryButton>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-busy={isSubmitting}
      className="bg-[#101C18] border border-[#203C30] rounded-2xl p-6 sm:p-8 space-y-5"
    >
      <div className="border-b border-[#203C30] pb-4">
        <h2 className="text-xl font-semibold text-white tracking-[-0.02em]">
          Book a Free Demo
        </h2>
        <p className="mt-1 text-sm text-[#A6B4AC]">
          Share what takes up manual time in your business. Fields marked with * are required.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="contact-name" className="block text-xs font-mono text-[#A6B4AC] mb-2">
            Your Name *
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            disabled={isSubmitting}
            value={values.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Rahul Sharma"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'contact-name-error' : undefined}
            className={`${inputBaseClass} ${
              errors.name ? 'border-[#ffb4ab]' : 'border-[#203C30]'
            }`}
          />
          {errors.name && (
            <p id="contact-name-error" role="alert" className="mt-1.5 text-xs text-[#ffb4ab]">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="contact-business"
            className="block text-xs font-mono text-[#A6B4AC] mb-2"
          >
            Business Name *
          </label>
          <input
            id="contact-business"
            name="businessName"
            type="text"
            autoComplete="organization"
            disabled={isSubmitting}
            value={values.businessName}
            onChange={(e) => handleChange('businessName', e.target.value)}
            placeholder="e.g., Pragati Coaching Centre"
            aria-invalid={Boolean(errors.businessName)}
            aria-describedby={errors.businessName ? 'contact-business-error' : undefined}
            className={`${inputBaseClass} ${
              errors.businessName ? 'border-[#ffb4ab]' : 'border-[#203C30]'
            }`}
          />
          {errors.businessName && (
            <p id="contact-business-error" role="alert" className="mt-1.5 text-xs text-[#ffb4ab]">
              {errors.businessName}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="contact-phone" className="block text-xs font-mono text-[#A6B4AC] mb-2">
            Phone / WhatsApp *
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            disabled={isSubmitting}
            value={values.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="e.g., +91 98XXXXXXXX"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'contact-phone-error' : undefined}
            className={`${inputBaseClass} ${
              errors.phone ? 'border-[#ffb4ab]' : 'border-[#203C30]'
            }`}
          />
          {errors.phone && (
            <p id="contact-phone-error" role="alert" className="mt-1.5 text-xs text-[#ffb4ab]">
              {errors.phone}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="contact-email" className="block text-xs font-mono text-[#A6B4AC] mb-2">
            Email Address *
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            disabled={isSubmitting}
            value={values.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="e.g., owner@yourbusiness.in"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'contact-email-error' : undefined}
            className={`${inputBaseClass} ${
              errors.email ? 'border-[#ffb4ab]' : 'border-[#203C30]'
            }`}
          />
          {errors.email && (
            <p id="contact-email-error" role="alert" className="mt-1.5 text-xs text-[#ffb4ab]">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="contact-service" className="block text-xs font-mono text-[#A6B4AC] mb-2">
            Service Interest *
          </label>
          <select
            id="contact-service"
            name="serviceInterest"
            disabled={isSubmitting}
            value={values.serviceInterest}
            onChange={(e) => handleChange('serviceInterest', e.target.value)}
            aria-invalid={Boolean(errors.serviceInterest)}
            aria-describedby={errors.serviceInterest ? 'contact-service-error' : undefined}
            className={`${inputBaseClass} ${
              errors.serviceInterest ? 'border-[#ffb4ab]' : 'border-[#203C30]'
            }`}
          >
            <option value="AI Agents">AI Agents (WhatsApp &amp; Web)</option>
            <option value="WhatsApp Automation">WhatsApp Automation</option>
            <option value="Business Automation">Business Automation</option>
            <option value="Custom Software">Custom Software &amp; Portals</option>
            <option value="Websites & Applications">Websites &amp; Applications</option>
            <option value="AI Integrations">AI Integrations</option>
            <option value="Complete Business Upgrade">Not sure yet / Complete upgrade</option>
          </select>
          {errors.serviceInterest && (
            <p id="contact-service-error" role="alert" className="mt-1.5 text-xs text-[#ffb4ab]">
              {errors.serviceInterest}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="contact-budget" className="block text-xs font-mono text-[#A6B4AC] mb-2">
            Estimated INR Scope (Optional)
          </label>
          <select
            id="contact-budget"
            name="budget"
            disabled={isSubmitting}
            value={values.budget}
            onChange={(e) => handleChange('budget', e.target.value)}
            className={`${inputBaseClass} border-[#203C30]`}
          >
            <option value="">Request custom INR quotation</option>
            <option value="Under ₹50,000">Under ₹50,000</option>
            <option value="₹50,000 – ₹1,50,000">₹50,000 – ₹1,50,000</option>
            <option value="₹1,50,000 – ₹3,50,000">₹1,50,000 – ₹3,50,000</option>
            <option value="₹3,50,000+">₹3,50,000+</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="contact-description" className="block text-xs font-mono text-[#A6B4AC] mb-2">
          Business or Project Description *
        </label>
        <textarea
          id="contact-description"
          name="description"
          rows={4}
          disabled={isSubmitting}
          value={values.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe your business type, daily enquiry volume, or manual processes you want to improve..."
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? 'contact-description-error' : undefined}
          className={`${inputBaseClass} resize-y min-h-[112px] ${
            errors.description ? 'border-[#ffb4ab]' : 'border-[#203C30]'
          }`}
        />
        {errors.description && (
          <p id="contact-description-error" role="alert" className="mt-1.5 text-xs text-[#ffb4ab]">
            {errors.description}
          </p>
        )}
      </div>

      {status === 'unconfigured' && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl bg-[#07130F] border border-[#AEF830]/50 p-4 space-y-3"
        >
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-[#AEF830] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-white">
                Enquiry validated — direct inbox delivery is awaiting owner activation
              </p>
              <p className="text-xs text-[#A6B4AC] mt-1 leading-relaxed">
                Your enquiry details passed validation, but online form delivery is not connected
                to a live inbox yet. No network submission was sent. Copy your structured enquiry
                brief below to save or send via your email or WhatsApp channel once active.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <SecondaryButton onClick={handleCopySummary} className="text-xs py-2 px-3.5">
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#AEF830]" aria-hidden="true" />
                  <span>Copied enquiry brief</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Copy enquiry brief</span>
                </>
              )}
            </SecondaryButton>

            {CONTACT_CONFIG.contactEmail && (
              <a
                href={`mailto:${CONTACT_CONFIG.contactEmail}?subject=${encodeURIComponent(
                  `Axom Hub Demo Request — ${values.businessName.trim()}`
                )}&body=${encodeURIComponent(formattedSummary)}`}
                className="text-xs font-mono text-[#AEF830] hover:underline"
              >
                Open in email client →
              </a>
            )}

            {CONTACT_CONFIG.whatsappHref && (
              <a
                href={CONTACT_CONFIG.whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-[#AEF830] hover:underline"
              >
                Open WhatsApp →
              </a>
            )}
          </div>
        </div>
      )}

      {status === 'error' && (
        <div
          ref={errorRef}
          role="alert"
          aria-live="assertive"
          tabIndex={-1}
          className="rounded-xl bg-[#07130F] border border-[#ffb4ab]/60 p-4 flex items-start gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb4ab]"
        >
          <AlertCircle className="w-5 h-5 text-[#ffb4ab] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-xs text-[#A6B4AC] space-y-2">
            <p className="text-sm font-medium text-white">Could not submit form</p>
            <p>{serverError}</p>
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                type="button"
                onClick={handleCopySummary}
                className="text-[#AEF830] font-mono hover:underline cursor-pointer"
              >
                {copied ? 'Copied enquiry brief' : 'Copy enquiry brief instead'}
              </button>
              {CONTACT_CONFIG.contactEmail && (
                <a
                  href={`mailto:${CONTACT_CONFIG.contactEmail}?subject=${encodeURIComponent(
                    `Axom Hub Demo Request — ${values.businessName.trim()}`
                  )}&body=${encodeURIComponent(formattedSummary)}`}
                  className="text-[#AEF830] font-mono hover:underline"
                >
                  Send via email →
                </a>
              )}
              {CONTACT_CONFIG.whatsappHref && (
                <a
                  href={CONTACT_CONFIG.whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#AEF830] font-mono hover:underline"
                >
                  Open WhatsApp →
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PrimaryButton type="submit" disabled={isSubmitting}>
          <Send className="w-4 h-4" aria-hidden="true" />
          <span>{isSubmitting ? 'Sending...' : 'Request Free Demo'}</span>
        </PrimaryButton>
        <p className="text-xs text-[#53685E]">
          No automated spam. Used solely to prepare your walkthrough.
        </p>
      </div>
    </form>
  );
}
