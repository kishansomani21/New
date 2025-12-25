use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};

/// User model representing a client who connects bank accounts
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct User {
    pub id: String,
    pub email: Option<String>,
    pub name: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Plaid Item represents a connection to a financial institution
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct PlaidItem {
    pub id: String,
    pub user_id: String,
    pub plaid_item_id: String,
    pub access_token: String,
    pub institution_id: Option<String>,
    pub institution_name: Option<String>,
    pub status: String,
    pub last_synced: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Bank account linked through Plaid
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Account {
    pub id: String,
    pub plaid_item_id: String,
    pub plaid_account_id: String,
    pub name: String,
    pub official_name: Option<String>,
    pub account_type: String,
    pub subtype: Option<String>,
    pub mask: Option<String>,
    pub current_balance: Option<f64>,
    pub available_balance: Option<f64>,
    pub currency: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Transaction from a linked bank account
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Transaction {
    pub id: String,
    pub account_id: String,
    pub plaid_transaction_id: String,
    pub date: NaiveDate,
    pub name: String,
    pub merchant_name: Option<String>,
    pub amount: f64,
    pub currency: String,
    pub category: Option<String>,
    pub pending: bool,
    pub transaction_type: Option<String>,
    pub created_at: DateTime<Utc>,
}

// ============ Request/Response DTOs ============

/// Request body for exchanging Plaid public token
#[derive(Debug, Deserialize)]
pub struct ExchangeTokenRequest {
    pub public_token: String,
    pub user_id: Option<String>,
}

/// Request body for syncing transactions
#[derive(Debug, Deserialize)]
pub struct SyncTransactionsRequest {
    pub item_id: String,
}

/// Response for link token creation
#[derive(Debug, Serialize)]
pub struct LinkTokenResponse {
    pub link_token: String,
    pub expiration: String,
}

/// Response after exchanging token
#[derive(Debug, Serialize)]
pub struct ExchangeTokenResponse {
    pub item_id: String,
    pub accounts: Vec<AccountSummary>,
}

/// Summary of an account for API responses
#[derive(Debug, Serialize, Deserialize)]
pub struct AccountSummary {
    pub id: String,
    pub name: String,
    pub official_name: Option<String>,
    pub account_type: String,
    pub subtype: Option<String>,
    pub mask: Option<String>,
    pub current_balance: Option<f64>,
    pub available_balance: Option<f64>,
    pub currency: String,
    pub institution_name: Option<String>,
    pub last_synced: Option<DateTime<Utc>>,
}

/// Transaction summary for API responses
#[derive(Debug, Serialize, Deserialize)]
pub struct TransactionSummary {
    pub id: String,
    pub account_id: String,
    pub date: NaiveDate,
    pub name: String,
    pub merchant_name: Option<String>,
    pub amount: f64,
    pub currency: String,
    pub category: Option<String>,
    pub pending: bool,
    pub account_name: Option<String>,
}

/// Sync result response
#[derive(Debug, Serialize)]
pub struct SyncResult {
    pub added: usize,
    pub modified: usize,
    pub removed: usize,
    pub accounts_updated: usize,
}

// ============ Plaid API Types ============

/// Plaid Link Token Create Request
#[derive(Debug, Serialize)]
pub struct PlaidLinkTokenRequest {
    pub client_id: String,
    pub secret: String,
    pub user: PlaidUser,
    pub client_name: String,
    pub products: Vec<String>,
    pub country_codes: Vec<String>,
    pub language: String,
}

#[derive(Debug, Serialize)]
pub struct PlaidUser {
    pub client_user_id: String,
}

/// Plaid Link Token Response
#[derive(Debug, Deserialize)]
pub struct PlaidLinkTokenResponse {
    pub link_token: String,
    pub expiration: String,
    pub request_id: String,
}

/// Plaid Token Exchange Request
#[derive(Debug, Serialize)]
pub struct PlaidExchangeRequest {
    pub client_id: String,
    pub secret: String,
    pub public_token: String,
}

/// Plaid Token Exchange Response
#[derive(Debug, Deserialize)]
pub struct PlaidExchangeResponse {
    pub access_token: String,
    pub item_id: String,
    pub request_id: String,
}

/// Plaid Accounts Request
#[derive(Debug, Serialize)]
pub struct PlaidAccountsRequest {
    pub client_id: String,
    pub secret: String,
    pub access_token: String,
}

/// Plaid Account Balance
#[derive(Debug, Deserialize)]
pub struct PlaidBalance {
    pub available: Option<f64>,
    pub current: Option<f64>,
    pub iso_currency_code: Option<String>,
    pub unofficial_currency_code: Option<String>,
}

/// Plaid Account from API
#[derive(Debug, Deserialize)]
pub struct PlaidAccount {
    pub account_id: String,
    pub name: String,
    pub official_name: Option<String>,
    #[serde(rename = "type")]
    pub account_type: String,
    pub subtype: Option<String>,
    pub mask: Option<String>,
    pub balances: PlaidBalance,
}

/// Plaid Accounts Response
#[derive(Debug, Deserialize)]
pub struct PlaidAccountsResponse {
    pub accounts: Vec<PlaidAccount>,
    pub item: PlaidItem_,
    pub request_id: String,
}

#[derive(Debug, Deserialize)]
pub struct PlaidItem_ {
    pub item_id: String,
    pub institution_id: Option<String>,
}

/// Plaid Transactions Request
#[derive(Debug, Serialize)]
pub struct PlaidTransactionsRequest {
    pub client_id: String,
    pub secret: String,
    pub access_token: String,
    pub start_date: String,
    pub end_date: String,
    pub options: PlaidTransactionsOptions,
}

#[derive(Debug, Serialize)]
pub struct PlaidTransactionsOptions {
    pub count: i32,
    pub offset: i32,
}

/// Plaid Transaction from API
#[derive(Debug, Deserialize)]
pub struct PlaidTransaction {
    pub transaction_id: String,
    pub account_id: String,
    pub date: String,
    pub name: String,
    pub merchant_name: Option<String>,
    pub amount: f64,
    pub iso_currency_code: Option<String>,
    pub unofficial_currency_code: Option<String>,
    pub category: Option<Vec<String>>,
    pub pending: bool,
    pub transaction_type: Option<String>,
}

/// Plaid Transactions Response
#[derive(Debug, Deserialize)]
pub struct PlaidTransactionsResponse {
    pub accounts: Vec<PlaidAccount>,
    pub transactions: Vec<PlaidTransaction>,
    pub total_transactions: i32,
    pub request_id: String,
}

/// Plaid Institution Request
#[derive(Debug, Serialize)]
pub struct PlaidInstitutionRequest {
    pub client_id: String,
    pub secret: String,
    pub institution_id: String,
    pub country_codes: Vec<String>,
}

/// Plaid Institution
#[derive(Debug, Deserialize)]
pub struct PlaidInstitution {
    pub institution_id: String,
    pub name: String,
}

/// Plaid Institution Response
#[derive(Debug, Deserialize)]
pub struct PlaidInstitutionResponse {
    pub institution: PlaidInstitution,
    pub request_id: String,
}

/// Plaid Error Response
#[derive(Debug, Deserialize)]
pub struct PlaidError {
    pub error_type: String,
    pub error_code: String,
    pub error_message: String,
    pub display_message: Option<String>,
}
