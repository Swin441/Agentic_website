# Google Search Console Setup Guide — Axom Hub

This guide covers domain verification, sitemap submission, and indexing checks for the Axom Hub website once your final production domain (`SITE_URL`) is active and deployed.

> **Note:** DNS verification and Search Console submission require access to your Google account and your domain registrar/DNS provider. These steps cannot be completed automatically before the production domain is live.

## 1. Confirm Production Build Settings

Before verifying Search Console, confirm your hosting provider is configured with:

- **Build command:** `npm run build`
- **Publish / output directory:** `dist`
- **Environment variable:** `SITE_URL=https://YOUR-REAL-DOMAIN` (exact HTTPS origin, no query string or trailing path)
- **Optional environment variable:** `GOOGLE_SITE_VERIFICATION` (only needed if using HTML meta-tag verification instead of DNS TXT)

Verify that `https://<YOUR-REAL-DOMAIN>/sitemap.xml`, `https://<YOUR-REAL-DOMAIN>/robots.txt`, `https://<YOUR-REAL-DOMAIN>/llms.txt`, and `https://<YOUR-REAL-DOMAIN>/og-image.png` all load over HTTPS with status `200`, and an unknown URL returns HTTP `404`.

## 2. Create a Google Search Console Property

1. Sign in to [Google Search Console](https://search.google.com/search-console).
2. Open the property selector and choose **Add property**.
3. Prefer the **Domain** property type (recommended) and enter your apex domain without `https://` or paths (for example, `yourdomain.in`).

## 3. Verify Ownership via DNS TXT Record (Recommended)

1. Copy the Google verification `TXT` record string provided by Search Console (`google-site-verification=...`).
2. Open your domain registrar or DNS provider (Cloudflare, Route 53, GoDaddy, Namecheap, etc.).
3. Add a new `TXT` record on the root (`@`) host with the copied verification value.
4. Wait for DNS propagation and click **Verify** in Google Search Console.

### Alternative: HTML Meta Tag (`GOOGLE_SITE_VERIFICATION`)

If DNS access is temporarily unavailable and you use a **URL prefix** property (`https://<YOUR-REAL-DOMAIN>`):

1. Copy only the token value from the `content="..."` attribute of Google's HTML meta tag.
2. Set `GOOGLE_SITE_VERIFICATION=<token>` in your hosting provider's build environment variables.
3. Trigger a fresh production build (`npm run build`) and deploy `dist/`.
4. Confirm `<meta name="google-site-verification" content="..." />` appears in the rendered `<head>`, then click **Verify**.

## 4. Submit `/sitemap.xml`

1. Inside your verified Search Console property, open **Indexing -> Sitemaps**.
2. Enter `sitemap.xml` (resolving to `https://<YOUR-REAL-DOMAIN>/sitemap.xml`).
3. Click **Submit** and verify Search Console reads all **9** discovered URLs without errors.

## 5. Inspect Homepage & Key Service Routes

Use **URL Inspection** in Search Console to test live URLs and request indexing for:

- `/`
- `/services`
- `/services/ai-agents`
- `/services/automation`
- `/services/software`
- `/industries`
- `/work`
- `/about`
- `/contact`

Confirm each page shows the expected canonical URL (`https://<YOUR-REAL-DOMAIN><route>`) and crawls cleanly.

## 6. Monitor Indexing & Coverage

- Review **Indexing -> Pages** after initial crawl to confirm all 9 pages are indexed and any non-existent URLs remain excluded (`404` / `noindex`).
- Check **Enhancements** / Rich Results for `Organization`, `FAQPage` (`/`), and `Service` (`/services/ai-agents`, `/services/automation`, `/services/software`) structured data.
