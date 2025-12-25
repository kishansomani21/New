use chrono::{NaiveDate, Utc};
use sqlx::{sqlite::SqlitePoolOptions, Pool, Sqlite};
use uuid::Uuid;

use crate::error::AppResult;
use crate::models::*;

/// Database wrapper for SQLite operations
#[derive(Clone)]
pub struct Database {
    pool: Pool<Sqlite>,
}

impl Database {
    /// Create a new database connection pool
    pub async fn new(database_url: &str) -> AppResult<Self> {
        // Ensure data directory exists
        if let Some(path) = database_url.strip_prefix("sqlite:") {
            if let Some(dir_path) = path.split('?').next() {
                if let Some(parent) = std::path::Path::new(dir_path).parent() {
                    std::fs::create_dir_all(parent).ok();
                }
            }
        }

        let pool = SqlitePoolOptions::new()
            .max_connections(5)
            .connect(database_url)
            .await?;

        Ok(Self { pool })
    }

    /// Run database migrations
    pub async fn run_migrations(&self) -> AppResult<()> {
        // Create tables
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT,
                name TEXT,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                updated_at TEXT NOT NULL DEFAULT (datetime('now'))
            )
            "#,
        )
        .execute(&self.pool)
        .await?;

        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS plaid_items (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                plaid_item_id TEXT NOT NULL UNIQUE,
                access_token TEXT NOT NULL,
                institution_id TEXT,
                institution_name TEXT,
                status TEXT NOT NULL DEFAULT 'active',
                last_synced TEXT,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
            "#,
        )
        .execute(&self.pool)
        .await?;

        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS accounts (
                id TEXT PRIMARY KEY,
                plaid_item_id TEXT NOT NULL,
                plaid_account_id TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                official_name TEXT,
                account_type TEXT NOT NULL,
                subtype TEXT,
                mask TEXT,
                current_balance REAL,
                available_balance REAL,
                currency TEXT NOT NULL DEFAULT 'USD',
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY (plaid_item_id) REFERENCES plaid_items(id)
            )
            "#,
        )
        .execute(&self.pool)
        .await?;

        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS transactions (
                id TEXT PRIMARY KEY,
                account_id TEXT NOT NULL,
                plaid_transaction_id TEXT NOT NULL UNIQUE,
                date TEXT NOT NULL,
                name TEXT NOT NULL,
                merchant_name TEXT,
                amount REAL NOT NULL,
                currency TEXT NOT NULL DEFAULT 'USD',
                category TEXT,
                pending INTEGER NOT NULL DEFAULT 0,
                transaction_type TEXT,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY (account_id) REFERENCES accounts(id)
            )
            "#,
        )
        .execute(&self.pool)
        .await?;

        // Create indexes
        sqlx::query(
            r#"CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id)"#,
        )
        .execute(&self.pool)
        .await?;

        sqlx::query(
            r#"CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC)"#,
        )
        .execute(&self.pool)
        .await?;

        sqlx::query(r#"CREATE INDEX IF NOT EXISTS idx_accounts_plaid_item_id ON accounts(plaid_item_id)"#)
            .execute(&self.pool)
            .await?;

        Ok(())
    }

    // ============ User Operations ============

    /// Create or get a default user (for demo purposes)
    pub async fn get_or_create_default_user(&self) -> AppResult<User> {
        let user_id = "default-user";

        // Try to get existing user
        let existing: Option<User> = sqlx::query_as(
            "SELECT id, email, name, created_at, updated_at FROM users WHERE id = ?",
        )
        .bind(user_id)
        .fetch_optional(&self.pool)
        .await?;

        if let Some(user) = existing {
            return Ok(user);
        }

        // Create new user
        let now = Utc::now();
        sqlx::query(
            "INSERT INTO users (id, email, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
        )
        .bind(user_id)
        .bind("demo@example.com")
        .bind("Demo User")
        .bind(now.to_rfc3339())
        .bind(now.to_rfc3339())
        .execute(&self.pool)
        .await?;

        Ok(User {
            id: user_id.to_string(),
            email: Some("demo@example.com".to_string()),
            name: Some("Demo User".to_string()),
            created_at: now,
            updated_at: now,
        })
    }

    // ============ Plaid Item Operations ============

    /// Create a new Plaid item
    pub async fn create_plaid_item(
        &self,
        user_id: &str,
        plaid_item_id: &str,
        access_token: &str,
        institution_id: Option<&str>,
        institution_name: Option<&str>,
    ) -> AppResult<String> {
        let id = Uuid::new_v4().to_string();
        let now = Utc::now().to_rfc3339();

        sqlx::query(
            r#"
            INSERT INTO plaid_items (id, user_id, plaid_item_id, access_token, institution_id, institution_name, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)
            "#,
        )
        .bind(&id)
        .bind(user_id)
        .bind(plaid_item_id)
        .bind(access_token)
        .bind(institution_id)
        .bind(institution_name)
        .bind(&now)
        .bind(&now)
        .execute(&self.pool)
        .await?;

        Ok(id)
    }

    /// Get a Plaid item by ID
    pub async fn get_plaid_item(&self, id: &str) -> AppResult<Option<PlaidItem>> {
        let item: Option<PlaidItem> = sqlx::query_as(
            r#"
            SELECT id, user_id, plaid_item_id, access_token, institution_id, institution_name, status, last_synced, created_at, updated_at
            FROM plaid_items WHERE id = ?
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await?;

        Ok(item)
    }

    /// Get all Plaid items for a user
    pub async fn get_user_plaid_items(&self, user_id: &str) -> AppResult<Vec<PlaidItem>> {
        let items: Vec<PlaidItem> = sqlx::query_as(
            r#"
            SELECT id, user_id, plaid_item_id, access_token, institution_id, institution_name, status, last_synced, created_at, updated_at
            FROM plaid_items WHERE user_id = ? ORDER BY created_at DESC
            "#,
        )
        .bind(user_id)
        .fetch_all(&self.pool)
        .await?;

        Ok(items)
    }

    /// Update last synced timestamp for a Plaid item
    pub async fn update_item_last_synced(&self, id: &str) -> AppResult<()> {
        let now = Utc::now().to_rfc3339();
        sqlx::query("UPDATE plaid_items SET last_synced = ?, updated_at = ? WHERE id = ?")
            .bind(&now)
            .bind(&now)
            .bind(id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    // ============ Account Operations ============

    /// Create or update an account
    pub async fn upsert_account(
        &self,
        plaid_item_id: &str,
        plaid_account: &PlaidAccount,
    ) -> AppResult<String> {
        // Check if account exists
        let existing: Option<(String,)> = sqlx::query_as(
            "SELECT id FROM accounts WHERE plaid_account_id = ?",
        )
        .bind(&plaid_account.account_id)
        .fetch_optional(&self.pool)
        .await?;

        let now = Utc::now().to_rfc3339();
        let currency = plaid_account
            .balances
            .iso_currency_code
            .clone()
            .or(plaid_account.balances.unofficial_currency_code.clone())
            .unwrap_or_else(|| "USD".to_string());

        if let Some((id,)) = existing {
            // Update existing account
            sqlx::query(
                r#"
                UPDATE accounts SET
                    name = ?, official_name = ?, account_type = ?, subtype = ?, mask = ?,
                    current_balance = ?, available_balance = ?, currency = ?, updated_at = ?
                WHERE id = ?
                "#,
            )
            .bind(&plaid_account.name)
            .bind(&plaid_account.official_name)
            .bind(&plaid_account.account_type)
            .bind(&plaid_account.subtype)
            .bind(&plaid_account.mask)
            .bind(plaid_account.balances.current)
            .bind(plaid_account.balances.available)
            .bind(&currency)
            .bind(&now)
            .bind(&id)
            .execute(&self.pool)
            .await?;

            Ok(id)
        } else {
            // Create new account
            let id = Uuid::new_v4().to_string();
            sqlx::query(
                r#"
                INSERT INTO accounts (id, plaid_item_id, plaid_account_id, name, official_name, account_type, subtype, mask, current_balance, available_balance, currency, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                "#,
            )
            .bind(&id)
            .bind(plaid_item_id)
            .bind(&plaid_account.account_id)
            .bind(&plaid_account.name)
            .bind(&plaid_account.official_name)
            .bind(&plaid_account.account_type)
            .bind(&plaid_account.subtype)
            .bind(&plaid_account.mask)
            .bind(plaid_account.balances.current)
            .bind(plaid_account.balances.available)
            .bind(&currency)
            .bind(&now)
            .bind(&now)
            .execute(&self.pool)
            .await?;

            Ok(id)
        }
    }

    /// Get all accounts
    pub async fn get_all_accounts(&self) -> AppResult<Vec<Account>> {
        let accounts: Vec<Account> = sqlx::query_as(
            r#"
            SELECT id, plaid_item_id, plaid_account_id, name, official_name, account_type, subtype, mask, current_balance, available_balance, currency, created_at, updated_at
            FROM accounts ORDER BY name
            "#,
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(accounts)
    }

    /// Get account by ID
    pub async fn get_account(&self, id: &str) -> AppResult<Option<Account>> {
        let account: Option<Account> = sqlx::query_as(
            r#"
            SELECT id, plaid_item_id, plaid_account_id, name, official_name, account_type, subtype, mask, current_balance, available_balance, currency, created_at, updated_at
            FROM accounts WHERE id = ?
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await?;

        Ok(account)
    }

    /// Get account by Plaid account ID
    pub async fn get_account_by_plaid_id(&self, plaid_account_id: &str) -> AppResult<Option<Account>> {
        let account: Option<Account> = sqlx::query_as(
            r#"
            SELECT id, plaid_item_id, plaid_account_id, name, official_name, account_type, subtype, mask, current_balance, available_balance, currency, created_at, updated_at
            FROM accounts WHERE plaid_account_id = ?
            "#,
        )
        .bind(plaid_account_id)
        .fetch_optional(&self.pool)
        .await?;

        Ok(account)
    }

    /// Get accounts with institution info for summaries
    pub async fn get_account_summaries(&self) -> AppResult<Vec<AccountSummary>> {
        let rows: Vec<(String, String, Option<String>, String, Option<String>, Option<String>, Option<f64>, Option<f64>, String, Option<String>, Option<String>)> = sqlx::query_as(
            r#"
            SELECT a.id, a.name, a.official_name, a.account_type, a.subtype, a.mask,
                   a.current_balance, a.available_balance, a.currency,
                   p.institution_name, p.last_synced
            FROM accounts a
            JOIN plaid_items p ON a.plaid_item_id = p.id
            ORDER BY a.name
            "#,
        )
        .fetch_all(&self.pool)
        .await?;

        let summaries = rows
            .into_iter()
            .map(|(id, name, official_name, account_type, subtype, mask, current_balance, available_balance, currency, institution_name, last_synced)| {
                AccountSummary {
                    id,
                    name,
                    official_name,
                    account_type,
                    subtype,
                    mask,
                    current_balance,
                    available_balance,
                    currency,
                    institution_name,
                    last_synced: last_synced.and_then(|s| chrono::DateTime::parse_from_rfc3339(&s).ok()).map(|dt| dt.with_timezone(&Utc)),
                }
            })
            .collect();

        Ok(summaries)
    }

    // ============ Transaction Operations ============

    /// Create or update a transaction
    pub async fn upsert_transaction(
        &self,
        account_id: &str,
        plaid_transaction: &PlaidTransaction,
    ) -> AppResult<(String, bool)> {
        // Check if transaction exists
        let existing: Option<(String,)> = sqlx::query_as(
            "SELECT id FROM transactions WHERE plaid_transaction_id = ?",
        )
        .bind(&plaid_transaction.transaction_id)
        .fetch_optional(&self.pool)
        .await?;

        let currency = plaid_transaction
            .iso_currency_code
            .clone()
            .or(plaid_transaction.unofficial_currency_code.clone())
            .unwrap_or_else(|| "USD".to_string());

        let category = plaid_transaction
            .category
            .as_ref()
            .map(|cats| cats.join(", "));

        if let Some((id,)) = existing {
            // Update existing transaction
            sqlx::query(
                r#"
                UPDATE transactions SET
                    date = ?, name = ?, merchant_name = ?, amount = ?, currency = ?,
                    category = ?, pending = ?, transaction_type = ?
                WHERE id = ?
                "#,
            )
            .bind(&plaid_transaction.date)
            .bind(&plaid_transaction.name)
            .bind(&plaid_transaction.merchant_name)
            .bind(plaid_transaction.amount)
            .bind(&currency)
            .bind(&category)
            .bind(plaid_transaction.pending)
            .bind(&plaid_transaction.transaction_type)
            .bind(&id)
            .execute(&self.pool)
            .await?;

            Ok((id, false)) // false = not new
        } else {
            // Create new transaction
            let id = Uuid::new_v4().to_string();
            let now = Utc::now().to_rfc3339();

            sqlx::query(
                r#"
                INSERT INTO transactions (id, account_id, plaid_transaction_id, date, name, merchant_name, amount, currency, category, pending, transaction_type, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                "#,
            )
            .bind(&id)
            .bind(account_id)
            .bind(&plaid_transaction.transaction_id)
            .bind(&plaid_transaction.date)
            .bind(&plaid_transaction.name)
            .bind(&plaid_transaction.merchant_name)
            .bind(plaid_transaction.amount)
            .bind(&currency)
            .bind(&category)
            .bind(plaid_transaction.pending)
            .bind(&plaid_transaction.transaction_type)
            .bind(&now)
            .execute(&self.pool)
            .await?;

            Ok((id, true)) // true = new transaction
        }
    }

    /// Get transactions for an account
    pub async fn get_account_transactions(
        &self,
        account_id: &str,
        limit: i32,
        offset: i32,
    ) -> AppResult<Vec<Transaction>> {
        let transactions: Vec<Transaction> = sqlx::query_as(
            r#"
            SELECT id, account_id, plaid_transaction_id, date, name, merchant_name, amount, currency, category, pending, transaction_type, created_at
            FROM transactions
            WHERE account_id = ?
            ORDER BY date DESC, created_at DESC
            LIMIT ? OFFSET ?
            "#,
        )
        .bind(account_id)
        .bind(limit)
        .bind(offset)
        .fetch_all(&self.pool)
        .await?;

        Ok(transactions)
    }

    /// Get all transactions with account names
    pub async fn get_all_transactions_with_accounts(
        &self,
        limit: i32,
        offset: i32,
    ) -> AppResult<Vec<TransactionSummary>> {
        let rows: Vec<(String, String, String, String, Option<String>, f64, String, Option<String>, bool, String)> = sqlx::query_as(
            r#"
            SELECT t.id, t.account_id, t.date, t.name, t.merchant_name, t.amount, t.currency, t.category, t.pending, a.name
            FROM transactions t
            JOIN accounts a ON t.account_id = a.id
            ORDER BY t.date DESC, t.created_at DESC
            LIMIT ? OFFSET ?
            "#,
        )
        .bind(limit)
        .bind(offset)
        .fetch_all(&self.pool)
        .await?;

        let summaries = rows
            .into_iter()
            .map(|(id, account_id, date, name, merchant_name, amount, currency, category, pending, account_name)| {
                TransactionSummary {
                    id,
                    account_id,
                    date: NaiveDate::parse_from_str(&date, "%Y-%m-%d").unwrap_or_else(|_| NaiveDate::from_ymd_opt(2000, 1, 1).unwrap()),
                    name,
                    merchant_name,
                    amount,
                    currency,
                    category,
                    pending,
                    account_name: Some(account_name),
                }
            })
            .collect();

        Ok(summaries)
    }

    /// Get transaction count for an account
    pub async fn get_transaction_count(&self, account_id: Option<&str>) -> AppResult<i64> {
        let count: (i64,) = if let Some(acc_id) = account_id {
            sqlx::query_as("SELECT COUNT(*) FROM transactions WHERE account_id = ?")
                .bind(acc_id)
                .fetch_one(&self.pool)
                .await?
        } else {
            sqlx::query_as("SELECT COUNT(*) FROM transactions")
                .fetch_one(&self.pool)
                .await?
        };

        Ok(count.0)
    }
}
