# Cloudflare Worker Contact Relay Setup — Axom Hub

The Cloudflare Worker (`cloudflare/contact-worker/src/index.js`) acts as a small HTTPS relay between the Axom Hub website and your Google Apps Script Web App. It enforces an explicit CORS origin allowlist, validates payloads, prevents burst/duplicate submissions, follows Google's `ContentService` redirect cleanly, and hides your private Apps Script Web App URL from browser visitors.

> **Security & Abuse Notice:** Because website visitors submit enquiries without logging in, the deployed Cloudflare Worker is an **unauthenticated public submission endpoint**. Basic input validation, origin checks, and honeypot protection reduce accidental errors and simple bots, **but they do not eliminate spam or targeted abuse**. If you later experience automated spam, add Cloudflare WAF Rate Limiting rules or Cloudflare Turnstile verification in front of the Worker.

---

## Prerequisites

- Completed `docs/GOOGLE-SHEETS-CONTACT-SETUP.md` and copied your Apps Script Web App URL (`https://script.google.com/macros/s/.../exec`).
- A Cloudflare account and Node.js 20+ installed locally.
- Note: Setting up and testing the Worker **does not require** your final production domain yet. You can deploy the Worker now and update `ALLOWED_ORIGINS` once your production domain is active.

---

## Step 1: Authenticate Wrangler

From the repository root, change into the Worker directory or run Wrangler via `npx`:

```bash
cd cloudflare/contact-worker
npx wrangler login
```

Complete the browser login prompt to authorize Wrangler with your Cloudflare account.

---

## Step 2: Configure `ALLOWED_ORIGINS` (No Wildcards)

Open `cloudflare/contact-worker/wrangler.toml` (or manage variables in the Cloudflare Dashboard -> Workers & Pages -> `axom-hub-contact-relay` -> Settings -> Variables and Secrets).

Set `ALLOWED_ORIGINS` to a comma-separated list of **exact HTTPS origins** that host your website (never use `*`):

```toml
[vars]
ALLOWED_ORIGINS = "https://<YOUR-REAL-DOMAIN>,https://www.<YOUR-REAL-DOMAIN>"
```

- If you want to test from an AI Studio preview or staging URL before purchasing the domain, add that exact `https://` preview origin to `ALLOWED_ORIGINS` temporarily and remove it after launch.

---

## Step 3: Store `APPS_SCRIPT_URL` as a Secret

Never commit your Google Apps Script deployment URL to `wrangler.toml` or `VITE_*` variables. Store it as an encrypted Cloudflare Worker secret:

```bash
npx wrangler secret put APPS_SCRIPT_URL
```

When prompted, paste your Apps Script Web App URL (`https://script.google.com/macros/s/.../exec`).

---

## Step 4: Deploy the Worker

Deploy from `cloudflare/contact-worker`:

```bash
npx wrangler deploy
```

Wrangler prints your deployed Worker URL (for example, `https://axom-hub-contact-relay.<your-subdomain>.workers.dev`).

---

## Step 5: Connect the Website (`VITE_CONTACT_ENDPOINT`)

1. In your website build environment (local `.env` or your hosting provider's build settings), set:
   ```bash
   VITE_CONTACT_ENDPOINT=https://axom-hub-contact-relay.<your-subdomain>.workers.dev
   ```
2. Run a fresh production build (`npm run build` with `SITE_URL` set) and deploy `dist/`.
3. **Verify a real live test enquiry** from `/contact` (on an origin listed in `ALLOWED_ORIGINS`):
   - Confirm the form shows **"Enquiry received"**.
   - Confirm a new row appears in your private Google Sheet (`Enquiries` tab) with an IST timestamp and `Submission ID`.
   - Confirm the notification email arrives at `NOTIFICATION_EMAIL`.
   - Confirm that a disallowed origin receives HTTP `403` and fails CORS checks.
