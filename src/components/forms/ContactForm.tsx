import React, {useState} from 'react';
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

function validate(values: ContactFormValues): FormErrors {
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

export function ContactForm() {
  const [values, setValues] = useState<ContactFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<
    'idle' | 'submitting' | 'submitted' | 'unconfigured' | 'error'
  >('idle');
  const [serverError, setServerError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleChange = (
    field: keyof ContactFormValues,
    value: string
  ) => {
    setValues((prev) => ({...prev, [field]: value}));
    if (errors[field]) {
      setErrors((prev) => ({...prev, [field]: undefined}));
    }
    if (status === 'error' || status === 'unconfigured') {
      setStatus('idle');
    }
  };

  const formattedSummary = [
    `Axom Hub Demo Enquiry`,
    `Name: ${values.name.trim()}`,
    `Business: ${values.businessName.trim()}`,
    `Phone / WhatsApp: ${values.phone.trim()}`,
    `Email: ${values.email.trim()}`,
    `Service Interest: ${values.serviceInterest}`,
    `Estimated Budget: ${values.budget || 'Not specified'}`,
    `Workflow / Project Description: ${values.description.trim()}`,
  ].join('\n');

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(formattedSummary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (!CONTACT_CONFIG.formEndpoint) {
      setStatus('unconfigured');
      return;
    }

    setStatus('submitting');
    setServerError('');

    try {
      const response = await fetch(CONTACT_CONFIG.formEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(`Submission failed (${response.status})`);
      }

      setStatus('submitted');
      setValues(INITIAL_VALUES);
    } catch (err) {
      setStatus('error');
      setServerError(
        err instanceof Error
          ? err.message
          : 'Unable to send right now. You can copy your enquiry brief below.'
      );
    }
  };

  const inputBaseClass =
    'w-full rounded-lg bg-[#07130F] border px-4 py-3 text-sm text-white placeholder-[#53685E] transition-colors focus:outline-none focus:border-[#AEF830]';

  if (status === 'submitted') {
    return (
      <div className="bg-[#101C18] border border-[#203C30] rounded-2xl p-6 sm:p-8">
        <div className="w-11 h-11 rounded-lg bg-[#AEF830]/15 border border-[#AEF830]/40 flex items-center justify-center mb-5">
          <Check className="w-5 h-5 text-[#AEF830]" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-semibold text-white">Enquiry received</h3>
        <p className="mt-2 text-sm text-[#A6B4AC] leading-relaxed">
          Thank you for sharing your business details. We will review your workflow notes and
          reach out to schedule your demo walkthrough.
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
            <p id="contact-name-error" className="mt-1.5 text-xs text-[#ffb4ab]">
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
            <p id="contact-business-error" className="mt-1.5 text-xs text-[#ffb4ab]">
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
            <p id="contact-phone-error" className="mt-1.5 text-xs text-[#ffb4ab]">
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
            <p id="contact-email-error" className="mt-1.5 text-xs text-[#ffb4ab]">
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
            value={values.serviceInterest}
            onChange={(e) => handleChange('serviceInterest', e.target.value)}
            aria-invalid={Boolean(errors.serviceInterest)}
            aria-describedby={errors.serviceInterest ? 'contact-service-error' : undefined}
            className={`${inputBaseClass} ${
              errors.serviceInterest ? 'border-[#ffb4ab]' : 'border-[#203C30]'
            }`}
          >
            <option value="AI Agents">AI Agents (WhatsApp & Web)</option>
            <option value="Business Automation">Business Automation</option>
            <option value="Custom Software">Custom Software & Portals</option>
            <option value="Websites & Applications">Websites & Applications</option>
            <option value="Complete Business Upgrade">Not sure yet / Complete upgrade</option>
          </select>
          {errors.serviceInterest && (
            <p id="contact-service-error" className="mt-1.5 text-xs text-[#ffb4ab]">
              {errors.serviceInterest}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="contact-budget" className="block text-xs font-mono text-[#A6B4AC] mb-2">
            Estimated Budget (Optional)
          </label>
          <select
            id="contact-budget"
            name="budget"
            value={values.budget}
            onChange={(e) => handleChange('budget', e.target.value)}
            className={`${inputBaseClass} border-[#203C30]`}
          >
            <option value="">Prefer to discuss on call</option>
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
          <p id="contact-description-error" className="mt-1.5 text-xs text-[#ffb4ab]">
            {errors.description}
          </p>
        )}
      </div>

      {status === 'unconfigured' && (
        <div
          role="status"
          className="rounded-xl bg-[#07130F] border border-[#AEF830]/50 p-4 space-y-3"
        >
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-[#AEF830] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-white">
                Enquiry validated — live submission endpoint not configured yet
              </p>
              <p className="text-xs text-[#A6B4AC] mt-1 leading-relaxed">
                This website is ready to connect to a form backend via{' '}
                <code className="font-mono text-white">VITE_CONTACT_ENDPOINT</code>. Because no
                live backend endpoint is connected in this preview, your details were not sent
                over the network. Copy your structured enquiry brief below to share it directly.
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
                  `Axom Hub Demo Request — ${values.businessName}`
                )}&body=${encodeURIComponent(formattedSummary)}`}
                className="text-xs font-mono text-[#AEF830] hover:underline"
              >
                Open in email client →
              </a>
            )}
          </div>
        </div>
      )}

      {status === 'error' && (
        <div
          role="alert"
          className="rounded-xl bg-[#07130F] border border-[#ffb4ab]/60 p-4 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-[#ffb4ab] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-xs text-[#A6B4AC] space-y-2">
            <p className="text-sm font-medium text-white">Could not submit form</p>
            <p>{serverError}</p>
            <button
              type="button"
              onClick={handleCopySummary}
              className="text-[#AEF830] font-mono hover:underline cursor-pointer"
            >
              {copied ? 'Copied enquiry brief' : 'Copy enquiry brief instead'}
            </button>
          </div>
        </div>
      )}

      <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PrimaryButton type="submit" disabled={status === 'submitting'}>
          <Send className="w-4 h-4" aria-hidden="true" />
          <span>{status === 'submitting' ? 'Sending...' : 'Request Free Demo'}</span>
        </PrimaryButton>
        <p className="text-xs text-[#53685E]">
          No automated spam. Used solely to prepare your walkthrough.
        </p>
      </div>
    </form>
  );
}
