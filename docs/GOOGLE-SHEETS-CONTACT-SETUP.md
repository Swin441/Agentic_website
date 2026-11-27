# Google Sheets & Apps Script Enquiry Setup — Axom Hub

This guide walks through setting up your private Google Sheet and Google Apps Script Web App (`google-apps-script/Code.gs`) to store Axom Hub website enquiries and send email notifications via `MailApp`.

> **Privacy & Access Warning:** Keep your enquiry Google Sheet **private** (`Restricted` sharing). Only the business owner and explicitly authorized team members should have access to customer names, phone numbers, emails, and enquiry notes.

---

## Step 1: Create the Private Google Sheet

1. Sign in to Google Sheets using the business owner Google account.
2. Create a new blank spreadsheet (for example, `Axom Hub Website Enquiries`).
3. Rename the first tab at the bottom from `Sheet1` to **`Enquiries`**.
4. Add the exact header columns in Row 1 (`A1:J1`):

| Column | Header |
|---|---|
| A | `Timestamp` |
| B | `Name` |
| C | `Business Name` |
| D | `Phone` |
| E | `Email` |
| F | `Service Interest` |
| G | `Budget` |
| H | `Description` |
| I | `Source` |
| J | `Submission ID` |

5. Copy the **Spreadsheet ID** from the browser URL bar:
   - In `https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit`, copy `<SPREADSHEET_ID>`.
6. Confirm sharing settings in the top-right **Share** button remain **Restricted** (never set to "Anyone with the link").

---

## Step 2: Add `Code.gs` via Extensions → Apps Script

1. Inside your Google Sheet, open **Extensions → Apps Script**.
2. Delete any starter `myFunction` code inside `Code.gs`.
3. Copy the entire contents of `google-apps-script/Code.gs` from this repository and paste it into `Code.gs`.
4. Save the project (Ctrl+S / Cmd+S) and give it a clear name such as `Axom Hub Enquiry Backend`.

---

## Step 3: Configure Script Properties

Do not hardcode your Spreadsheet ID or notification inbox in source code. Configure them via **Script Properties**:

1. In the Apps Script editor left sidebar, click **Project Settings** (gear icon).
2. Scroll to **Script Properties** and click **Add script property** twice:
   - Property 1:
     - **Property:** `SPREADSHEET_ID`
     - **Value:** `<paste your Google Sheet ID>`
   - Property 2:
     - **Property:** `NOTIFICATION_EMAIL`
     - **Value:** `<your real business inbox email address>`
3. Click **Save script properties**.

---

## Step 4: Authorize Permissions & Deploy as a Web App

1. Click **Deploy → New deployment** in the top-right of the Apps Script editor.
2. Next to *Select type*, click the gear icon and choose **Web app**.
3. Configure deployment settings carefully:
   - **Description:** `Axom Hub Enquiry Relay v1`
   - **Execute as:** **`Me`** (your Google account — required so the script can write to your private Sheet and send email alerts)
   - **Who has access:** **`Anyone`** (allows your Cloudflare Worker relay to POST to this endpoint over HTTPS; customers never see this URL because it stays in Cloudflare Worker secrets)
4. Click **Deploy**.
5. When prompted, click **Authorize access**, choose your Google account, and approve the requested permissions:
   - View and manage spreadsheets (`SpreadsheetApp`)
   - Send email as you (`MailApp`)
   - *(If Google displays an "App isn't verified" warning for your personal/Workspace script, open **Advanced → Go to Axom Hub Enquiry Backend (unsafe)** to approve your own script.)*
6. Copy the generated **Web app URL** (`https://script.google.com/macros/s/.../exec`).

> **Important:** Whenever you edit `Code.gs` later, create a **New deployment** (or update an existing deployment to a new version via **Deploy → Manage deployments**) so changes take effect.

---

## Step 5: Connect to Cloudflare Worker

Keep your Apps Script Web App URL secret. Next, follow `docs/CLOUDFLARE-CONTACT-WORKER-SETUP.md` to store it as `APPS_SCRIPT_URL` inside the Cloudflare Worker relay and test a live submission before publishing.
