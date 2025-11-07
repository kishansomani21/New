# 🏦 MTD ITSA Financial Analyzer

**Your Tax Return, Made Simple**

An AI-powered financial statement analyzer that makes UK tax returns easy for self-employed individuals and landlords. Simply upload your bank statements or rental income documents, and get instant tax calculations ready for MTD ITSA (Making Tax Digital for Income Tax Self Assessment) compliance.

## ✨ Features

- 📸 **Photo Upload** - Take a photo of your statement with your phone
- 🤖 **AI-Powered Extraction** - Claude AI reads and categorizes all transactions
- 💰 **Automatic Tax Calculation** - Income Tax and National Insurance calculated instantly
- 📊 **Quarterly Summaries** - MTD ITSA compliant quarterly updates
- ☁️ **Google Drive Storage** - All documents securely saved for HMRC compliance
- 🎯 **HMRC Compliant** - Categories align with HMRC allowable expenses
- 🔒 **Bank-Level Security** - Encrypted storage and secure processing

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- **Anthropic API Key** (for Claude AI) - [Get one here](https://console.anthropic.com/)
- **Google Cloud Project** with Drive & Sheets API enabled
- A Google Service Account with credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd New
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Then fill in your API credentials (see Configuration section below).

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Anthropic Claude AI Setup (REQUIRED)

1. Sign up at [Anthropic Console](https://console.anthropic.com/)
2. Create an API key
3. Add to `.env`:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

### Google Drive & Sheets API Setup (REQUIRED)

#### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (e.g., "MTD ITSA Analyzer")

#### Step 2: Enable APIs

1. In your project, go to "APIs & Services" → "Library"
2. Search for and enable:
   - **Google Drive API**
   - **Google Sheets API**

#### Step 3: Create a Service Account

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Fill in the details:
   - Name: "MTD ITSA Service Account"
   - Description: "For document storage and processing"
4. Click "Create and Continue"
5. Grant the service account the "Editor" role
6. Click "Continue" and then "Done"

#### Step 4: Create a Key

1. Click on your newly created service account
2. Go to the "Keys" tab
3. Click "Add Key" → "Create new key"
4. Choose "JSON" format
5. Download the JSON file (keep it secure!)

#### Step 5: Configure Environment Variables

Open the downloaded JSON file and add to `.env`:

```
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Important:** The private key must include `\n` characters for newlines.

#### Step 6: Create Google Drive Folder (Optional)

The app will automatically create a folder called "MTD ITSA Financial Documents" in Google Drive.

If you want to use a specific folder:
1. Create a folder in Google Drive
2. Share it with your service account email (give Editor access)
3. Copy the folder ID from the URL
4. Add to `.env`:
   ```
   GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
   ```

### Application Settings

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production, change this to your deployed URL.

## 📖 How to Use

### For Users

1. **Visit the App**
   - Go to [http://localhost:3000](http://localhost:3000)
   - Click "Start Your Tax Return Now"

2. **Upload a Document**
   - Take a photo with your phone camera, OR
   - Drag and drop a PDF/image file
   - Supported: Bank statements, rental income statements

3. **Review Extracted Transactions**
   - AI automatically extracts all transactions
   - Each transaction is categorized according to HMRC rules
   - Review for accuracy

4. **View Tax Calculation**
   - See your Income Tax breakdown
   - View National Insurance contributions
   - Check quarterly summaries (MTD ITSA compliant)
   - Get your total tax bill

5. **Access Documents in Google Drive**
   - All documents are saved in Google Drive
   - Organized by tax year and quarter
   - Ready for HMRC inspections

### Document Types Supported

- **Bank Statements** (Personal or Business)
- **Estate Agent Statements** (Rental Income)
- **Business Receipts**
- **Property Management Reports**

### File Formats

- Images: JPG, JPEG, PNG, WebP
- Documents: PDF
- Maximum size: 10MB per file

## 🎯 MTD ITSA Compliance

This app is designed to help with **Making Tax Digital for Income Tax Self Assessment** (MTD ITSA) requirements.

### What is MTD ITSA?

MTD ITSA requires businesses and landlords to:
- Keep **digital records** of income and expenses
- Submit **quarterly updates** to HMRC
- Maintain records with **date, amount, and category** for each transaction

### Implementation Timeline

- **April 2026**: Mandatory for income over £50,000
- **April 2027**: Mandatory for income over £30,000
- **April 2028**: Mandatory for income over £20,000

### How This App Helps

✅ **Digital Records** - All transactions stored digitally in Google Drive
✅ **Date, Amount, Category** - AI extracts all required information
✅ **Quarterly Summaries** - Automatic calculation of cumulative quarterly figures
✅ **HMRC Categories** - All expenses categorized according to HMRC allowable expenses
✅ **Tax Calculations** - Income Tax and NI calculated using current HMRC rates

### UK Tax Categories

The app categorizes transactions into HMRC-compliant categories:

**Income Categories:**
- Self-Employment Income
- Property Rental Income
- Other Business Income

**Expense Categories:**
- Cost of Goods Sold
- Wages and Salaries
- Car, Van, and Travel Expenses
- Rent, Rates, Power
- Phone, Internet, Stationery
- Repairs and Renewals (NOT improvements)
- Accountancy and Legal Fees
- Insurance
- Bank Charges and Interest
- Advertising and Marketing
- Capital Allowances
- Property-specific expenses (agent fees, maintenance, etc.)

### Tax Calculations

**Income Tax (2024-25 / 2025-26):**
- Personal Allowance: £12,570
- Basic Rate (20%): £12,571 - £50,270
- Higher Rate (40%): £50,271 - £125,140
- Additional Rate (45%): Over £125,140

**National Insurance (Class 4 - Self-Employed):**
- 9% on profits: £12,570 - £50,270
- 2% on profits above: £50,270

**National Insurance (Class 2):**
- £3.45 per week if profits > £12,570

## 🏗️ Project Structure

```
├── app/
│   ├── api/
│   │   ├── upload-document/      # Document upload endpoint
│   │   ├── calculate-tax/         # Tax calculation endpoint
│   │   └── generate-qr/           # QR code generation
│   ├── analyzer/                  # Main analyzer page
│   ├── page.tsx                   # Landing page
│   └── layout.tsx                 # Root layout
├── components/
│   ├── DocumentUploader.tsx       # File upload component
│   └── TaxResultsDashboard.tsx    # Results display
├── lib/
│   ├── mtd-types.ts              # TypeScript type definitions
│   ├── hmrc-categories.ts        # HMRC category system
│   ├── tax-periods.ts            # UK tax year utilities
│   ├── tax-calculator.ts         # Tax calculation engine
│   ├── claude-extractor.ts       # Claude AI integration
│   ├── googleDrive.ts            # Google Drive integration
│   ├── googleSheets.ts           # Google Sheets utilities
│   └── quarterly-calculator.ts   # Quarterly summary calculator
├── .env.example                   # Environment variables template
├── package.json                   # Dependencies
└── README.md                      # This file
```

## 🔒 Security & Privacy

### Data Security

- **Encryption** - All documents encrypted at rest in Google Drive
- **HTTPS** - All API calls use HTTPS encryption
- **No Storage** - Banking credentials never stored
- **Service Account** - Secure Google API authentication

### Data Privacy

- **Your Data** - All documents stored in YOUR Google Drive
- **No Sharing** - Documents not shared with third parties
- **GDPR Compliant** - Data processing follows GDPR guidelines
- **Deletion** - You can delete documents anytime from Google Drive

### Important Security Notes

- **Never commit your `.env` file** - Contains sensitive API credentials
- **Rotate API keys** - Regularly update your Anthropic and Google credentials
- **Access Control** - Restrict service account permissions to minimum required
- **Production Security** - Use HTTPS only, enable rate limiting, add authentication

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `ANTHROPIC_API_KEY`
   - `GOOGLE_CLIENT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
   - `GOOGLE_DRIVE_FOLDER_ID` (optional)
   - `GOOGLE_SHEET_ID` (optional)
   - `NEXT_PUBLIC_APP_URL`
4. Deploy!

### Other Platforms

This Next.js app can be deployed to:
- Netlify
- Railway
- Render
- AWS Amplify
- Your own server with Node.js

### Environment Variables for Production

Make sure to set all required environment variables in your deployment platform.

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **AI**: Anthropic Claude Sonnet 4.5
- **Storage**: Google Drive API
- **Sheets**: Google Sheets API
- **Styling**: Tailwind CSS
- **UI**: React 18

## 🐛 Troubleshooting

### "ANTHROPIC_API_KEY not found"
- Check your `.env` file has the correct API key
- Restart the development server after changing `.env`

### "Google Drive credentials not found"
- Verify `GOOGLE_CLIENT_EMAIL` and `GOOGLE_PRIVATE_KEY` in `.env`
- Ensure the private key includes `\n` for newlines
- Check the service account has access to Google Drive API

### "Failed to extract transactions"
- Ensure the document is clear and readable
- Try a higher quality image
- Check the Anthropic API key is valid and has credits

### "Failed to upload to Google Drive"
- Verify the service account has Drive API enabled
- Check the folder permissions (if using custom folder)
- Ensure the service account email has Editor access

### Documents Not Appearing in Google Drive
- The app creates a folder called "MTD ITSA Financial Documents"
- Check your Google Drive for this folder
- Documents are organized by tax year and quarter

## 📝 Roadmap

### Coming Soon

- [ ] **Mobile App** - Native iOS and Android apps
- [ ] **HMRC API Integration** - Direct submission to HMRC
- [ ] **Multi-Currency Support** - For international businesses
- [ ] **Expense Receipt Scanner** - Scan individual receipts
- [ ] **Mileage Tracker** - Automatic mileage logging
- [ ] **VAT Support** - MTD for VAT compliance
- [ ] **Accountant Collaboration** - Share with your accountant
- [ ] **Historical Data Import** - Import previous years' data

### Future Enhancements

- Automatic bank feed integration
- Real-time tax estimates
- Tax-saving recommendations
- Multi-user support (for accountants)
- Dashboard with charts and graphs
- Export to CSV/Excel
- Recurring transaction detection
- Smart expense categorization learning

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this for your projects!

## 💡 Support & Help

### For Technical Issues
- Check the troubleshooting section above
- Review API provider documentation
- Open a GitHub issue

### For Tax Questions
- Consult with a qualified accountant
- Visit [HMRC Website](https://www.gov.uk/government/organisations/hm-revenue-customs)
- Use HMRC's helpline for tax queries

### Resources

- [MTD ITSA Guide (HMRC)](https://www.gov.uk/guidance/check-if-youre-eligible-for-making-tax-digital-for-income-tax)
- [Anthropic Documentation](https://docs.anthropic.com/)
- [Google Drive API](https://developers.google.com/drive)
- [HMRC Allowable Expenses](https://www.gov.uk/expenses-if-youre-self-employed)

## ⚠️ Disclaimer

**This app is a tool to help with tax calculations. It does NOT replace professional accounting advice.**

- Always review extracted transactions for accuracy
- Consult with a qualified accountant for complex tax situations
- The app calculates estimates based on current HMRC rates
- Tax laws change - ensure you're using current rates
- You are responsible for the accuracy of your tax returns

---

**Built with ❤️ for UK Self-Employed Individuals and Landlords**

Making Tax Digital compliance made simple - even grandad can do it!
