# BlixToys — Design-led Product Manufacturing Website

A responsive, multi-page website concept for a modern product design and manufacturing company. The visual direction is clean, editorial and design-led, with a muted green palette, lime accents, generous whitespace, responsive navigation and product-focused imagery.

## Pages
- `index.html` — Home
- `products.html` — Product catalogue with category filters
- `about.html` — Company story and values
- `manufacturing.html` — Process, capabilities and quality approach
- `contact.html` — Project enquiry form and FAQs

## Run locally
Open `index.html` in a browser. No build tools or package installation are required.

## Before publishing
1. Replace BlixToys with the real company name and logo.
2. Replace example product categories, descriptions, images and contact details with verified company inBlixToystion.
3. The images currently load from Unsplash and require an internet connection. Replace them with approved product/factory photos for production.
4. The contact form is front-end demo only. Connect it to an email service, CRM, Shopify form, or backend endpoint to receive submissions.
5. Add the company's actual certifications, manufacturing capacity, machinery, quality standards and legal pages. Do not publish placeholder claims as facts.
6. Add analytics, consent management and SEO/social metadata as appropriate.

## Tech
HTML5, CSS3, vanilla JavaScript. No framework or dependency required.


## Cloudflare Worker + Google Sheets enquiry form

The contact page now posts the project enquiry form to a Cloudflare Worker. The Worker validates the submission and appends it to a Google Sheet using a Google Cloud service account. No Google credentials are exposed in the browser.

### 1. Prepare the Google Sheet
1. Create a Google Sheet and add a tab named **Enquiries**.
2. Add these column headers in row 1 (A–K): `Timestamp`, `Name`, `Company`, `Email`, `Phone`, `Project Type`, `Estimated Quantity`, `Project Message`, `Contact Consent`, `Client IP`, `User Agent`.
3. In Google Cloud Console, create/select a project and enable **Google Sheets API**.
4. Create a service account and generate a JSON key. Keep the JSON key private.
5. Copy the service account email from the JSON key and share the Google Sheet with that email as an **Editor**.
6. Copy the spreadsheet ID from the Google Sheet URL (the part between `/d/` and `/edit`).

### 2. Deploy the Worker
Prerequisite: install Node.js and Wrangler (`npm install -g wrangler`), then sign in (`wrangler login`).

1. Open a terminal in `cloudflare-worker`.
2. Set `ALLOWED_ORIGIN` in `wrangler.toml` to the exact website origin, e.g. `https://www.example.com`. Do not include a path or trailing slash. For local testing, use a separate development value such as `http://localhost:8000`.
3. Add secrets (use values from the service account JSON):
   ```sh
   npx wrangler secret put GOOGLE_SERVICE_ACCOUNT_EMAIL
   npx wrangler secret put GOOGLE_PRIVATE_KEY
   npx wrangler secret put GOOGLE_SHEET_ID
   ```
   Paste the service account `client_email` for the first secret, the complete `private_key` value for the second (including the BEGIN/END lines), and the spreadsheet ID for the third. Wrangler securely stores these as secrets.
4. Deploy:
   ```sh
   npx wrangler deploy
   ```
5. Copy the deployed Worker URL, such as `https://BlixToys-enquiry-api.<your-subdomain>.workers.dev`.

### 3. Connect the website form
1. Open `contact.html`.
2. Find `data-worker-url="https://YOUR-WORKER-NAME.YOUR-SUBDOMAIN.workers.dev"` on the enquiry form and replace the URL with the deployed Worker URL.
3. Deploy the updated website.
4. Submit a test enquiry and verify a new row appears in the `Enquiries` tab.

### Local testing
If serving the site locally at `http://localhost:8000`, set `ALLOWED_ORIGIN = "http://localhost:8000"` while testing and use a local HTTP server (for example `python -m http.server 8000`). Before production, change the origin to your real HTTPS domain and redeploy the Worker. The website's exact origin must match the Worker setting.

### Security and production notes
- Never put the service account JSON, private key, or spreadsheet ID in frontend JavaScript.
- This Worker checks the website origin, validates fields, limits payload size, and includes a honeypot field. CORS is not authentication; add Cloudflare Turnstile and/or rate limiting before relying on this publicly.
- The Worker records the client's IP and user agent for basic abuse diagnostics. Remove those columns from the Worker if you do not need them, and update your privacy notice accordingly.
- Configure a real contact email and update the privacy policy before launch. Do not collect sensitive personal inBlixToystion in the project message.
- The contact form only reports success after Google Sheets confirms that the row was appended.
