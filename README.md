# 🏦 BankSync - Superhuman Banking Template

A beautiful, modern web application that connects your bank accounts to Google Sheets through Plaid, GoCardless, or TrueLayer. Built with Next.js, TypeScript, and Tailwind CSS featuring a Superhuman-inspired design.

## ✨ Features

- 🎨 **Superhuman-inspired UI** - Beautiful gradient design with smooth animations
- 🏦 **Multiple Bank Providers** - Support for Plaid, GoCardless, and TrueLayer
- 📊 **Google Sheets Integration** - Automatic transaction synchronization
- 🔐 **Bank-level Security** - OAuth 2.0 and encrypted connections
- ⚡ **Real-time Sync** - Keep your spreadsheets up-to-date automatically
- 🌍 **Global Coverage** - Thousands of banks across North America and Europe

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Bank API credentials (Plaid, GoCardless, or TrueLayer)
- Google Cloud Platform account with Sheets API enabled

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

### Plaid Setup

1. Sign up at [Plaid Dashboard](https://dashboard.plaid.com/)
2. Create a new application
3. Get your `client_id` and `secret` (use sandbox for testing)
4. Add to `.env`:
   ```
   PLAID_CLIENT_ID=your_client_id
   PLAID_SECRET=your_secret
   PLAID_ENV=sandbox
   NEXT_PUBLIC_PLAID_ENV=sandbox
   ```

### GoCardless Setup

1. Sign up at [GoCardless](https://manage.gocardless.com/)
2. Navigate to Developers → Bank Account Data
3. Get your access token
4. Add to `.env`:
   ```
   GOCARDLESS_ACCESS_TOKEN=your_access_token
   GOCARDLESS_ENV=sandbox
   ```

### TrueLayer Setup

1. Sign up at [TrueLayer Console](https://console.truelayer.com/)
2. Create a new application
3. Get your `client_id` and `client_secret`
4. Add redirect URI: `http://localhost:3000/api/truelayer/callback`
5. Add to `.env`:
   ```
   TRUELAYER_CLIENT_ID=your_client_id
   TRUELAYER_CLIENT_SECRET=your_client_secret
   TRUELAYER_REDIRECT_URI=http://localhost:3000/api/truelayer/callback
   ```

### Google Sheets API Setup

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project

2. **Enable Google Sheets API**
   - In your project, go to "APIs & Services" → "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

3. **Create a Service Account**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "Service Account"
   - Fill in the details and create
   - Click on the created service account
   - Go to "Keys" tab → "Add Key" → "Create new key"
   - Choose JSON format and download

4. **Configure Environment Variables**
   - Open the downloaded JSON file
   - Add to `.env`:
   ```
   GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

5. **Create a Google Sheet**
   - Create a new Google Sheet
   - Share it with your service account email (the `GOOGLE_CLIENT_EMAIL`)
   - Give it "Editor" permissions
   - Copy the Sheet ID from the URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
   - Add to `.env`:
   ```
   GOOGLE_SHEET_ID=your_sheet_id
   ```

### Application Settings

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production, change this to your deployed URL.

## 📖 Usage

### Connecting a Bank Account

1. Navigate to the Dashboard
2. Choose your preferred provider (Plaid, GoCardless, or TrueLayer)
3. Follow the OAuth flow to connect your bank
4. Your account will appear in the dashboard

### Syncing to Google Sheets

1. Once an account is connected, click "Sync to Sheets"
2. Transactions will be automatically exported to your configured Google Sheet
3. The sheet will have columns: Transaction ID, Date, Description, Amount, Category, Merchant, Status

### Managing Multiple Accounts

- You can connect multiple bank accounts
- Each account can be synced independently
- All transactions go to the same Google Sheet (or you can modify the code to use different sheets)

## 🏗️ Project Structure

```
├── app/
│   ├── api/                    # API routes
│   │   ├── plaid/             # Plaid integration endpoints
│   │   ├── gocardless/        # GoCardless integration endpoints
│   │   ├── truelayer/         # TrueLayer integration endpoints
│   │   └── sync-to-sheets/    # Google Sheets sync endpoint
│   ├── dashboard/             # Dashboard page
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Landing page
├── components/
│   └── PlaidLink.tsx          # Plaid Link component
├── lib/
│   └── googleSheets.ts        # Google Sheets utilities
├── .env.example               # Environment variables template
├── package.json               # Dependencies
└── README.md                  # This file
```

## 🔒 Security Notes

- **Never commit your `.env` file** - It contains sensitive API credentials
- **Access tokens** - In production, store access tokens securely in a database with encryption
- **User authentication** - Add user authentication before deploying (e.g., NextAuth.js)
- **API routes** - Protect API routes with authentication middleware
- **Rate limiting** - Implement rate limiting for API endpoints
- **HTTPS only** - Always use HTTPS in production

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

This Next.js app can be deployed to:
- Netlify
- Railway
- Render
- AWS Amplify
- Your own server with Node.js

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Bank APIs**: Plaid, GoCardless, TrueLayer
- **Sheets API**: Google Sheets API (googleapis)
- **UI Library**: React 18

## 📝 Customization

### Changing Colors

Edit the gradient colors in `app/globals.css`:

```css
.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  /* Change these hex values */
}
```

### Adding More Providers

1. Create API routes in `app/api/[provider]/`
2. Add provider button in `app/dashboard/page.tsx`
3. Update the sync logic in `app/api/sync-to-sheets/route.ts`

### Custom Sheet Format

Modify the `appendTransactionsToSheet` function in `lib/googleSheets.ts` to change the spreadsheet structure.

## 🐛 Troubleshooting

### "Failed to create link token"
- Check your Plaid credentials in `.env`
- Ensure `PLAID_ENV` matches your credential type (sandbox/development/production)

### "Google Sheets sync failed"
- Verify your service account email has access to the sheet
- Check the private key format in `.env` (should include `\n` for newlines)
- Ensure Google Sheets API is enabled in your GCP project

### "GoCardless/TrueLayer connection failed"
- Verify your access tokens and credentials
- Check the redirect URIs match exactly
- Ensure you're using the correct environment (sandbox vs production)

## 📄 License

MIT License - feel free to use this template for your projects!

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 💡 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API provider documentation
3. Open a GitHub issue

---

Built with ❤️ using Next.js and bank-grade security
