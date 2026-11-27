# Contact Channel Setup Guide — Axom Hub

This guide explains how to connect live Google Sheets + email enquiry delivery (`VITE_CONTACT_ENDPOINT`), public business email links (`VITE_CONTACT_EMAIL`), and WhatsApp click-to-chat (`VITE_CONTACT_WHATSAPP`, `VITE_CONTACT_WHATSAPP_URL`) for Axom Hub without storing any private credentials in the repository.

> **Note:** All `VITE_CONTACT_*` variables are optional and blank by default. Until the business owner sets them in the build environment, the website hides unconfigured email/WhatsApp links and shows an honest validation-only notice when someone submits the demo enquiry form.

---

## A. Google Sheets + Email Delivery (`VITE_CONTACT_ENDPOINT`)

The contact form submits validated JSON over HTTPS `POST` (with `Accept: application/json`) to a Cloudflare Worker relay, which forwards enquiries to a private Google Apps Script Web App (`google-apps-script/Code.gs`) backed by Google Sheets and `MailApp`.

1. Follow **`docs/GOOGLE-SHEETS-CONTACT-SETUP.md`** to create the private Google Sheet (`Enquiries`), deploy `google-apps-script/Code.gs`, and set `SPREADSHEET_ID` and `NOTIFICATION_EMAIL` in Apps Script Properties.
2. Follow **`docs/CLOUDFLARE-CONTACT-WORKER-SETUP.md`** to deploy `cloudflare/contact-worker`, store `APPS_SCRIPT_URL` as a Worker secret, and set `ALLOWED_ORIGINS`.
3. Set your deployed Cloudflare Worker URL in your website build environment:
   ```bash
   VITE_CONTACT_ENDPOINT=https://<your-worker-url>
   ```
4. Rebuild (`npm run build` with `SITE_URL`) and test one real enquiry from `/contact` to confirm both the Google Sheet row and notification email succeed.

**Security reminder:** Never place Google Apps Script URLs, Spreadsheet IDs, SMTP passwords, or private API keys into any `VITE_*` variable—those variables are compiled into the public browser bundle.

---

## B. Public Business Email Setup (`VITE_CONTACT_EMAIL`)

1. Configure your public business email in your build environment:
   ```bash
   VITE_CONTACT_EMAIL=<your-public-business-email>
   ```
2. Rebuild and test the `mailto:` links on `/contact` and in the footer on desktop and mobile.
3. When `VITE_CONTACT_EMAIL` is unset or empty, email CTAs remain hidden automatically.

---

## C. WhatsApp Click-to-Chat Setup (`VITE_CONTACT_WHATSAPP` & `VITE_CONTACT_WHATSAPP_URL`)

The website implements click-to-chat only (visitors explicitly choose to open WhatsApp; customer form data is never sent to WhatsApp automatically). Only trusted `https://wa.me/...` and `https://api.whatsapp.com/send?...` destinations are accepted.

1. Use your official business WhatsApp number in international format:
   ```bash
   VITE_CONTACT_WHATSAPP=<international display number>
   VITE_CONTACT_WHATSAPP_URL=https://wa.me/<country-code-and-digits>
   ```
2. Rebuild and verify **Chat on WhatsApp** opens in a new tab with `rel="noopener noreferrer"` and the prefilled introductory message on desktop and mobile.

---

## D. Production Deployment & Domain Independence

- **Domain independence:** The real production domain is **not required** to build or test this integration.
- When deploying to your hosting provider next week, configure `SITE_URL` alongside `VITE_CONTACT_ENDPOINT`, `VITE_CONTACT_EMAIL`, `VITE_CONTACT_WHATSAPP`, `VITE_CONTACT_WHATSAPP_URL`, and optional `VITE_OFFICE_LOCATION` before running `npm run build`.
