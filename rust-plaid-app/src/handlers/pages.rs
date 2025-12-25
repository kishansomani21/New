use axum::{
    extract::{Path, State},
    response::Html,
};
use tera::Context;

use crate::error::AppResult;
use crate::AppState;

/// Home page - landing page with connect bank option
pub async fn home(State(state): State<AppState>) -> AppResult<Html<String>> {
    let mut context = Context::new();
    context.insert("title", "Rust Plaid Banking");
    context.insert("plaid_env", &state.config.plaid_env);

    let html = state.templates.render("home.html", &context)?;
    Ok(Html(html))
}

/// Dashboard - main dashboard showing connected accounts
pub async fn dashboard(State(state): State<AppState>) -> AppResult<Html<String>> {
    let accounts = state.db.get_account_summaries().await?;
    let transaction_count = state.db.get_transaction_count(None).await?;

    let mut context = Context::new();
    context.insert("title", "Dashboard - Rust Plaid Banking");
    context.insert("accounts", &accounts);
    context.insert("transaction_count", &transaction_count);
    context.insert("plaid_env", &state.config.plaid_env);

    let html = state.templates.render("dashboard.html", &context)?;
    Ok(Html(html))
}

/// Accounts page - list all connected accounts
pub async fn accounts(State(state): State<AppState>) -> AppResult<Html<String>> {
    let accounts = state.db.get_account_summaries().await?;

    let mut context = Context::new();
    context.insert("title", "Accounts - Rust Plaid Banking");
    context.insert("accounts", &accounts);
    context.insert("plaid_env", &state.config.plaid_env);

    let html = state.templates.render("accounts.html", &context)?;
    Ok(Html(html))
}

/// Transactions page - list all transactions
pub async fn transactions(State(state): State<AppState>) -> AppResult<Html<String>> {
    let transactions = state.db.get_all_transactions_with_accounts(100, 0).await?;
    let accounts = state.db.get_account_summaries().await?;

    let mut context = Context::new();
    context.insert("title", "Transactions - Rust Plaid Banking");
    context.insert("transactions", &transactions);
    context.insert("accounts", &accounts);

    let html = state.templates.render("transactions.html", &context)?;
    Ok(Html(html))
}

/// Account transactions page - transactions for a specific account
pub async fn account_transactions(
    State(state): State<AppState>,
    Path(account_id): Path<String>,
) -> AppResult<Html<String>> {
    let account = state.db.get_account(&account_id).await?;
    let transactions = state.db.get_account_transactions(&account_id, 100, 0).await?;

    let mut context = Context::new();
    context.insert("title", "Account Transactions - Rust Plaid Banking");
    context.insert("account", &account);
    context.insert("transactions", &transactions);

    let html = state.templates.render("account_transactions.html", &context)?;
    Ok(Html(html))
}
