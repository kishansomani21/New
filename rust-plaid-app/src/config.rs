use anyhow::{Context, Result};

/// Application configuration loaded from environment variables
#[derive(Clone, Debug)]
pub struct Config {
    // Server settings
    pub host: String,
    pub port: u16,
    pub app_url: String,

    // Plaid settings
    pub plaid_client_id: String,
    pub plaid_secret: String,
    pub plaid_env: String,

    // Database
    pub database_url: String,
}

impl Config {
    /// Load configuration from environment variables
    pub fn from_env() -> Result<Self> {
        Ok(Self {
            // Server settings with defaults
            host: std::env::var("HOST").unwrap_or_else(|_| "127.0.0.1".to_string()),
            port: std::env::var("PORT")
                .unwrap_or_else(|_| "3000".to_string())
                .parse()
                .context("Invalid PORT")?,
            app_url: std::env::var("APP_URL")
                .unwrap_or_else(|_| "http://localhost:3000".to_string()),

            // Plaid credentials (required)
            plaid_client_id: std::env::var("PLAID_CLIENT_ID")
                .context("PLAID_CLIENT_ID is required")?,
            plaid_secret: std::env::var("PLAID_SECRET")
                .context("PLAID_SECRET is required")?,
            plaid_env: std::env::var("PLAID_ENV")
                .unwrap_or_else(|_| "sandbox".to_string()),

            // Database with default SQLite path
            database_url: std::env::var("DATABASE_URL")
                .unwrap_or_else(|_| "sqlite:data/banking.db?mode=rwc".to_string()),
        })
    }

    /// Get the Plaid API base URL based on environment
    pub fn plaid_base_url(&self) -> &str {
        match self.plaid_env.as_str() {
            "production" => "https://production.plaid.com",
            "development" => "https://development.plaid.com",
            _ => "https://sandbox.plaid.com",
        }
    }
}
