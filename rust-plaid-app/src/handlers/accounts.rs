use axum::{
    extract::{Path, Query, State},
    Json,
};
use serde::Deserialize;

use crate::error::{AppError, AppResult};
use crate::models::*;
use crate::AppState;

#[derive(Debug, Deserialize)]
pub struct PaginationParams {
    pub limit: Option<i32>,
    pub offset: Option<i32>,
}

/// List all connected accounts
pub async fn list_accounts(State(state): State<AppState>) -> AppResult<Json<Vec<AccountSummary>>> {
    let accounts = state.db.get_account_summaries().await?;
    Ok(Json(accounts))
}

/// Get a specific account by ID
pub async fn get_account(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> AppResult<Json<AccountSummary>> {
    let account = state
        .db
        .get_account(&id)
        .await?
        .ok_or_else(|| AppError::NotFound("Account not found".to_string()))?;

    // Get the plaid item for institution info
    let item = state.db.get_plaid_item(&account.plaid_item_id).await?;

    Ok(Json(AccountSummary {
        id: account.id,
        name: account.name,
        official_name: account.official_name,
        account_type: account.account_type,
        subtype: account.subtype,
        mask: account.mask,
        current_balance: account.current_balance,
        available_balance: account.available_balance,
        currency: account.currency,
        institution_name: item.and_then(|i| i.institution_name),
        last_synced: None,
    }))
}

/// Get transactions for a specific account
pub async fn get_account_transactions(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Query(params): Query<PaginationParams>,
) -> AppResult<Json<Vec<Transaction>>> {
    // Verify account exists
    let _ = state
        .db
        .get_account(&id)
        .await?
        .ok_or_else(|| AppError::NotFound("Account not found".to_string()))?;

    let limit = params.limit.unwrap_or(50);
    let offset = params.offset.unwrap_or(0);

    let transactions = state.db.get_account_transactions(&id, limit, offset).await?;
    Ok(Json(transactions))
}
