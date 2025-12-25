# Rust Plaid Banking Application

A secure, modern web application built in Rust that allows clients to connect their bank accounts and view transactions using Plaid.

## Features

- **Secure Bank Connection**: Connect bank accounts using Plaid Link
- **View-Only Access**: Read-only access to bank account data
- **Transaction History**: View and filter transactions across all connected accounts
- **Real-Time Balances**: See current and available balances
- **Multi-Account Support**: Connect multiple bank accounts from different institutions
- **Modern UI**: Dark-themed, responsive interface built with Tailwind CSS

## Tech Stack

- **Backend**: Rust with Axum web framework
- **Database**: SQLite with SQLx
- **Templates**: Tera template engine
- **Frontend**: HTML, Tailwind CSS, JavaScript
- **Bank Integration**: Plaid API

## Prerequisites

- Rust 1.70+ (install from https://rustup.rs)
- Plaid API credentials (sign up at https://dashboard.plaid.com)

## Quick Start

1. **Clone and setup**:
   ```bash
   cd rust-plaid-app
   cp .env.example .env
   ```

2. **Configure environment**:
   Edit `.env` and add your Plaid credentials:
   ```
   PLAID_CLIENT_ID=your_client_id
   PLAID_SECRET=your_secret
   PLAID_ENV=sandbox
   ```

3. **Run the application**:
   ```bash
   cargo run
   ```

4. **Open in browser**:
   Navigate to http://localhost:3000

## Project Structure

```
rust-plaid-app/
├── src/
│   ├── main.rs           # Application entry point
│   ├── config.rs         # Configuration management
│   ├── db.rs             # Database operations
│   ├── error.rs          # Error handling
│   ├── models.rs         # Data models
│   ├── plaid.rs          # Plaid API client
│   └── handlers/
│       ├── mod.rs        # Handler module exports
│       ├── accounts.rs   # Account API handlers
│       ├── pages.rs      # HTML page handlers
│       ├── plaid.rs      # Plaid API handlers
│       └── transactions.rs # Transaction API handlers
├── templates/
│   ├── base.html         # Base template with navigation
│   ├── home.html         # Landing page
│   ├── dashboard.html    # Main dashboard
│   ├── accounts.html     # Accounts list
│   ├── transactions.html # All transactions
│   └── account_transactions.html # Single account transactions
├── Cargo.toml            # Rust dependencies
├── .env.example          # Environment template
└── README.md
```

## API Endpoints

### Pages
- `GET /` - Landing page
- `GET /dashboard` - Main dashboard
- `GET /accounts` - View all accounts
- `GET /transactions` - View all transactions
- `GET /transactions/:account_id` - View account transactions

### Plaid Integration
- `POST /api/plaid/create-link-token` - Create Plaid Link token
- `POST /api/plaid/exchange-token` - Exchange public token for access token
- `POST /api/plaid/sync-transactions` - Sync transactions from Plaid

### Account & Transaction APIs
- `GET /api/accounts` - List all accounts
- `GET /api/accounts/:id` - Get single account
- `GET /api/accounts/:id/transactions` - Get account transactions
- `GET /api/transactions` - List all transactions

## Using with Plaid Sandbox

The sandbox environment provides test credentials for development:

1. When connecting a bank, use:
   - **Username**: `user_good`
   - **Password**: `pass_good`

2. Select any institution from the list

3. The sandbox will generate sample accounts and transactions

## Security Notes

- Access tokens are stored securely in the database
- Credentials are never stored - only Plaid tokens
- All bank communication goes through Plaid's encrypted API
- The application uses view-only access (transactions product)

## Production Deployment

For production:

1. Set `PLAID_ENV=production` in your environment
2. Use a production database (PostgreSQL recommended)
3. Enable HTTPS
4. Add user authentication
5. Implement proper session management

## License

MIT License
