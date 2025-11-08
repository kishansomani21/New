# 🚀 Automated Client Onboarding System

**Complete automation for UK accounting firms - from initial contact to fully onboarded client!**

## What This System Does

Starting with just **3 inputs** (Name, Email, Phone), this system automatically:

### ✅ Automated Workflow

1. **Sends Google Form** → Client fills detailed information
2. **Generates 64-8 PDF** → Auto-filled HMRC tax agent authorization form
3. **Sends Engagement Letter** → Via Zoho Sign for e-signature
4. **Creates Payment Link** → GoCardless Direct Debit setup
5. **Adds to Google Contacts** → Automatically with all tax info
6. **Updates Google Sheets** → Complete client tracking spreadsheet
7. **Generates BrightPay CSV** → For PAYE-registered clients (manual upload)
8. **Requests VAT Authorization** → Via HMRC API for VAT-registered clients
9. **Handles Missing Info** → Automatically emails for UTR, auth codes, etc.

## 🎯 Quick Start

### 1. Install Dependencies ✓ (Already Done!)

```bash
npm install  # Already completed
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Then fill in your API credentials in `.env`. See **ONBOARDING_SETUP.md** for detailed setup instructions.

### 3. Run Development Server

```bash
npm run dev
```

### 4. Access Onboarding Dashboard

Navigate to: **http://localhost:3000/onboarding**

Enter:
- Client Name
- Email Address
- Phone Number

Click **"Start Onboarding"** - the rest is automatic!

## 📁 Project Structure

```
New/
├── app/
│   ├── api/
│   │   ├── onboarding/
│   │   │   ├── initiate/route.ts          # Start onboarding
│   │   │   └── form-response/route.ts     # Handle form submissions
│   │   └── webhooks/
│   │       └── zoho-sign/route.ts         # Handle signature events
│   └── onboarding/
│       └── page.tsx                        # Admin dashboard UI
├── lib/
│   ├── services/
│   │   ├── gmail.ts                        # Email automation
│   │   ├── googleContacts.ts               # Contact management
│   │   ├── clientSheets.ts                 # Spreadsheet tracking
│   │   ├── zohoSign.ts                     # E-signature integration
│   │   ├── goCardless.ts                   # Payment links
│   │   ├── pdfFiller.ts                    # 64-8 & engagement letter PDFs
│   │   ├── brightPay.ts                    # Payroll CSV export
│   │   └── hmrcAgent.ts                    # VAT authorization API
│   ├── types/
│   │   └── onboarding.ts                   # TypeScript interfaces
│   └── workflows/
│       └── onboardingOrchestrator.ts       # Main workflow coordinator
├── ONBOARDING_SETUP.md                     # Complete setup guide
└── .env.example                             # Environment template
```

## 🔑 Required API Keys

You'll need accounts and API keys for:

| Service | Purpose | Sign Up Link |
|---------|---------|--------------|
| **Google Cloud** | Gmail, Sheets, Contacts, Forms | [console.cloud.google.com](https://console.cloud.google.com) |
| **Zoho Sign** | E-signature for engagement letters | [zoho.com/sign](https://www.zoho.com/sign) |
| **GoCardless** | Direct Debit payment setup | [gocardless.com](https://gocardless.com) |
| **HMRC Agent** | VAT agent authorization | [developer.service.hmrc.gov.uk](https://developer.service.hmrc.gov.uk) |

> **See ONBOARDING_SETUP.md for step-by-step setup instructions for each service.**

## 📊 What Gets Created

### Google Sheet Structure

| Column | Description |
|--------|-------------|
| Client ID | Unique identifier |
| Name, Email, Phone | Contact info |
| Company Details | Name, address, business type |
| Tax Registration | PAYE, VAT, CIS status |
| Tax IDs | UTR, VAT number, PAYE reference |
| Workflow Status | Progress tracking |
| Completion Dates | Timestamps for each step |

### Generated Files

- **64-8 Form PDF** → Sent to client for manual signature or via post to HMRC
- **Engagement Letter PDF** → Sent via Zoho Sign for e-signature
- **BrightPay CSV** → Saved in `/temp/` for manual import to BrightPay Desktop

### Emails Sent

1. **Initial** → Google Form link
2. **Engagement Letter** → Zoho Sign link
3. **Payment Setup** → GoCardless link
4. **Missing Info** → Request for UTR/auth codes if not provided

## 🎬 Demo Workflow

**Input:**
```json
{
  "name": "John Smith",
  "email": "john@example.com",
  "phone": "+44 20 1234 5678"
}
```

**What Happens:**

```
1. [Immediate] Email sent with Google Form link
2. [User] Client completes form with:
   - Company details
   - Tax registration info (PAYE/VAT/CIS)
   - UTR number
   - Bank details
3. [Automatic] System processes form:
   ✓ Creates Google Contact
   ✓ Adds to tracking sheet
   ✓ Generates 64-8 PDF
   ✓ Creates & sends engagement letter
   ✓ Creates GoCardless payment link
   ✓ Generates BrightPay CSV (if PAYE)
   ✓ Requests VAT authorization (if VAT registered)
4. [User] Client signs engagement letter
5. [Automatic] Status updated to "completed"
6. [Manual] Import BrightPay CSV if needed
```

## 🔧 API Endpoints

### Start Onboarding

```bash
POST /api/onboarding/initiate
Content-Type: application/json

{
  "name": "John Smith",
  "email": "john@example.com",
  "phone": "+44 20 1234 5678"
}
```

**Response:**
```json
{
  "success": true,
  "clientId": "CLIENT-1699123456789-ABC123",
  "status": "form-sent",
  "nextSteps": [
    "Google Form sent to client email",
    "Client will complete detailed information form",
    "System will automatically process the rest"
  ]
}
```

### Process Form Response (Webhook)

```bash
POST /api/onboarding/form-response
Content-Type: application/json

{
  "clientId": "CLIENT-1699123456789-ABC123",
  "name": "John Smith",
  "email": "john@example.com",
  "phone": "+44 20 1234 5678",
  "companyName": "Smith Ltd",
  "businessType": "limited-company",
  "isPAYERegistered": true,
  "isVATRegistered": true,
  "utr": "1234567890",
  "vatNumber": "GB123456789",
  ...
}
```

## 🌐 Google Form Setup

The system needs a Google Form with these fields:

1. **Client ID** (hidden - auto-filled from URL)
2. **Full Name**
3. **Email**
4. **Phone**
5. **Company Name**
6. **Business Address**
7. **Postcode**
8. **Business Type** (Sole Trader / Limited Company / Partnership)
9. **UTR Number**
10. **VAT Number** (optional)
11. **PAYE Reference** (optional)
12. **Are you PAYE registered?** (Yes/No)
13. **Are you VAT registered?** (Yes/No)
14. **Are you CIS registered?** (Yes/No)
15. **HMRC Authentication Code**
16. **Additional Notes**

**See ONBOARDING_SETUP.md for the Apps Script code to connect the form to your API.**

## 🛠️ BrightPay Integration

Since BrightPay has no public API, the system generates a CSV file that you can manually import:

1. After onboarding a PAYE client, check `/temp/brightpay_import_*.csv`
2. Open BrightPay Desktop
3. Go to: Employees → Import Employees
4. Select the CSV file
5. Review and import

The CSV includes:
- Name, email, phone
- Address, postcode
- Payroll ID (auto-generated)
- Tax code (default 1257L)
- Start date
- UTR, PAYE reference

You'll need to manually add:
- National Insurance number
- Gross pay amounts
- Bank details

## 🚨 Important Notes

### Security
- **Never commit `.env` file** - contains sensitive API keys
- Use environment variables in production
- Rotate API keys regularly
- Enable 2FA on all service accounts

### Limitations
- BrightPay requires manual CSV import (no API)
- 64-8 form is simplified - replace with official HMRC PDF
- Gmail has sending limits (check quotas)
- HMRC sandbox has test data only

### Production Checklist

Before going live:

- [ ] Replace dummy engagement letter with your template
- [ ] Download official 64-8 PDF from HMRC
- [ ] Set all APIs to production mode
- [ ] Update redirect URIs to production domain
- [ ] Test complete flow with real email
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure webhook URLs
- [ ] Verify HMRC agent authorization works

## 📚 Documentation

- **ONBOARDING_SETUP.md** - Complete setup guide with API instructions
- **README.md** - Original project documentation
- This file - Quick reference guide

## 🐛 Troubleshooting

### "Failed to send email"
→ Check Gmail OAuth token is valid
→ Verify daily sending limits not exceeded

### "Google Sheets error"
→ Ensure service account has Editor access
→ Check sheet ID is correct

### "Zoho Sign failed"
→ Verify access token validity
→ Check webhook URL is publicly accessible

### "HMRC API error"
→ Confirm Agent Reference Number (ARN)
→ Verify client credentials (VRN, VAT reg date)

## 🎯 Next Steps

1. Follow **ONBOARDING_SETUP.md** to configure all APIs
2. Create your Google Form
3. Test with a dummy client
4. Customize email templates (in `lib/services/gmail.ts`)
5. Replace engagement letter template
6. Deploy to production

## 💡 Customization

### Email Templates
Edit in: `lib/services/gmail.ts`
- `sendGoogleFormEmail()`
- `sendEngagementLetterEmail()`
- `sendGoCardlessEmail()`

### PDF Templates
Edit in: `lib/services/pdfFiller.ts`
- `createEngagementLetter()`
- `fill648Form()`

### Workflow Logic
Edit in: `lib/workflows/onboardingOrchestrator.ts`
- `initiateOnboarding()`
- `processFormResponse()`

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review ONBOARDING_SETUP.md
3. Check API service status pages
4. Review error logs in console

---

**Built with Next.js 14, TypeScript, and 7+ API integrations for complete UK accounting firm automation.**

All files have been created and dependencies installed. Ready to configure APIs and start onboarding clients! 🎉
