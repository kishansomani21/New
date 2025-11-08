# Client Onboarding Automation - Setup Guide

This guide will help you set up the complete automated client onboarding system.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [API Setup](#api-setup)
4. [Configuration](#configuration)
5. [Google Form Setup](#google-form-setup)
6. [Testing](#testing)
7. [Production Deployment](#production-deployment)

## Overview

This system automates the complete client onboarding workflow:

1. **Input**: Name, Email, Phone Number
2. **Automated Steps**:
   - Send Google Form for detailed information
   - Generate and auto-fill 64-8 PDF form
   - Create and send engagement letter via Zoho Sign
   - Create GoCardless payment link
   - Add to Google Contacts
   - Update Google Sheets tracking
   - Generate BrightPay CSV (for PAYE clients)
   - Request HMRC VAT agent authorization (for VAT clients)

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Google Cloud Platform account
- Zoho Sign account
- GoCardless account
- HMRC Agent Services account (for VAT authorization)
- Gmail account with API access

## API Setup

### 1. Gmail API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Gmail API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/gmail/callback`
5. Download credentials and note:
   - `GMAIL_CLIENT_ID`
   - `GMAIL_CLIENT_SECRET`
6. Generate refresh token:
   ```bash
   # Use OAuth Playground or run this Node script
   node scripts/get-gmail-token.js
   ```

### 2. Google Sheets & Contacts API

1. In the same Google Cloud project
2. Enable:
   - Google Sheets API
   - Google People API (for Contacts)
3. Create Service Account:
   - Go to IAM & Admin → Service Accounts
   - Create service account
   - Generate JSON key
   - Copy `client_email` and `private_key` to `.env`
4. Create Google Sheet:
   - Create new sheet named "Clients"
   - Share with service account email (Editor access)
   - Copy Sheet ID from URL

### 3. Google Forms Setup

1. Create a new Google Form
2. Add the following fields (exact names matter for webhook):
   - Client ID (short answer) - Hidden field
   - Full Name (short answer)
   - Email (short answer)
   - Phone (short answer)
   - Company Name (short answer)
   - Business Address (paragraph)
   - Postcode (short answer)
   - Business Type (multiple choice: Sole Trader, Limited Company, Partnership)
   - UTR Number (short answer)
   - VAT Number (short answer) - optional
   - PAYE Reference (short answer) - optional
   - Are you PAYE registered? (Yes/No)
   - Are you VAT registered? (Yes/No)
   - Are you CIS registered? (Yes/No)
   - HMRC Authentication Code (short answer)
   - Additional Notes (paragraph)

3. Set up form submission webhook:
   - Extensions → Apps Script
   - Add this code:
   ```javascript
   function onFormSubmit(e) {
     const responses = e.namedValues;

     const payload = {
       clientId: responses['Client ID'][0],
       name: responses['Full Name'][0],
       email: responses['Email'][0],
       phone: responses['Phone'][0],
       companyName: responses['Company Name'][0],
       address: responses['Business Address'][0],
       postcode: responses['Postcode'][0],
       businessType: responses['Business Type'][0],
       utr: responses['UTR Number'][0],
       vatNumber: responses['VAT Number'][0],
       payeReference: responses['PAYE Reference'][0],
       isPAYERegistered: responses['Are you PAYE registered?'][0],
       isVATRegistered: responses['Are you VAT registered?'][0],
       isCISRegistered: responses['Are you CIS registered?'][0],
       authenticationCode: responses['HMRC Authentication Code'][0],
       notes: responses['Additional Notes'][0]
     };

     const url = 'https://YOUR_DOMAIN.com/api/onboarding/form-response';

     UrlFetchApp.fetch(url, {
       method: 'post',
       contentType: 'application/json',
       payload: JSON.stringify(payload)
     });
   }
   ```
   - Set trigger: Edit → Current project's triggers → Add Trigger
   - Function: onFormSubmit
   - Event type: On form submit

4. Copy form URL to `.env` as `GOOGLE_FORM_URL`

### 4. Zoho Sign Setup

1. Sign up at [Zoho Sign](https://www.zoho.com/sign/)
2. Go to Settings → API
3. Generate API Key/OAuth token
4. Copy to `.env` as `ZOHO_SIGN_ACCESS_TOKEN`
5. Set up webhook:
   - Settings → Webhooks
   - Add webhook URL: `https://YOUR_DOMAIN.com/api/webhooks/zoho-sign`
   - Events: Document Completed, Document Declined

### 5. GoCardless Setup

1. Sign up at [GoCardless](https://manage.gocardless.com/)
2. Go to Developers → API Keys
3. Copy access token to `.env`
4. For production:
   - Complete merchant verification
   - Switch `GOCARDLESS_ENV` to `production`

### 6. HMRC Agent Services Setup

1. Register as an agent at [HMRC Agent Services](https://www.gov.uk/guidance/get-an-hmrc-agent-services-account)
2. Get your Agent Reference Number (ARN)
3. Register for API access:
   - [HMRC Developer Hub](https://developer.service.hmrc.gov.uk/)
   - Create application
   - Subscribe to Agent Authorisation API
4. Copy credentials to `.env`:
   - `HMRC_CLIENT_ID`
   - `HMRC_CLIENT_SECRET`
   - `HMRC_AGENT_REFERENCE_NUMBER`

## Configuration

1. Clone repository and install dependencies:
   ```bash
   git clone <your-repo>
   cd New
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Fill in all environment variables in `.env`

4. Initialize Google Sheets:
   ```bash
   # The system will auto-create headers on first run
   npm run dev
   ```

## Testing

### Test Onboarding Flow

1. Start development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/onboarding`

3. Enter test client details:
   - Name: Test Client
   - Email: test@example.com
   - Phone: +44 20 1234 5678

4. Click "Start Onboarding"

5. Check:
   - Email received with Google Form link
   - Client added to Google Sheets
   - Status: "form-sent"

6. Complete Google Form

7. Verify automated actions:
   - Engagement letter sent via Zoho Sign
   - GoCardless payment link sent
   - Google Contact created
   - Sheets updated with full details
   - BrightPay CSV generated (if PAYE)
   - VAT authorization requested (if VAT registered)

### Test Individual Components

```bash
# Test Gmail sending
curl -X POST http://localhost:3000/api/test/gmail

# Test GoCardless
curl -X POST http://localhost:3000/api/test/gocardless

# Test Zoho Sign
curl -X POST http://localhost:3000/api/test/zoho-sign
```

## BrightPay CSV Import

1. After onboarding a PAYE-registered client:
   - CSV file generated in `/temp/` directory
   - File name: `brightpay_import_YYYYMMDD_HHMMSS.csv`

2. Import to BrightPay:
   - Open BrightPay Desktop
   - Employees → Import Employees
   - Select CSV file
   - Map columns (should auto-map)
   - Review and import

3. Manual steps required:
   - Add National Insurance numbers
   - Set gross pay amounts
   - Add bank details
   - Upload P45 if applicable

## Production Deployment

### Vercel Deployment

1. Push to GitHub:
   ```bash
   git add .
   git commit -m "Client onboarding automation setup"
   git push origin main
   ```

2. Deploy to Vercel:
   - Import project in Vercel dashboard
   - Add all environment variables
   - Update URLs in `.env`:
     - `NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app`
     - Gmail redirect URI
     - Webhook URLs

3. Update webhook URLs:
   - Google Form script: Update `url` variable
   - Zoho Sign: Update webhook URL in settings
   - GoCardless: Update redirect URI if using

### Post-Deployment

1. Test complete flow with real email
2. Monitor logs for errors
3. Set up error notifications (optional):
   - Sentry integration
   - Email alerts

## Troubleshooting

### Gmail not sending

- Check OAuth refresh token is valid
- Verify Gmail API is enabled
- Check daily sending limits

### Google Sheets errors

- Verify service account has Editor access
- Check sheet ID is correct
- Ensure sheet name is "Clients"

### Zoho Sign failing

- Check access token validity
- Verify webhook URL is accessible
- Check PDF is valid base64

### GoCardless errors

- Verify you're in correct environment (sandbox vs production)
- Check access token
- Ensure redirect URLs match

### HMRC API errors

- Verify ARN is correct
- Check client credentials (VRN, NINO, etc.)
- Ensure using correct environment

## Support

For issues or questions:
1. Check logs in Vercel dashboard
2. Review API documentation for each service
3. Contact respective support teams

## Security Notes

- Never commit `.env` file
- Rotate API keys regularly
- Use environment variables in production
- Enable 2FA on all accounts
- Monitor API usage for anomalies
- Set up rate limiting for public endpoints

## Next Steps

1. Customize engagement letter template
2. Download official 64-8 PDF from HMRC
3. Add custom branding to emails
4. Set up automated reminders
5. Create client portal for document access
6. Implement full tracking dashboard

---

Built with Next.js, TypeScript, and multiple API integrations for complete accounting firm automation.
