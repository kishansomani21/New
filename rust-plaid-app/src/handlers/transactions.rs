use axum::{extract::{Query, State}, Json};
use serde::Deserialize;

use crate::error::AppResult;
use crate::models::TransactionSummary;
use crate::AppState;

#[derive(Debug, Deserialize)]
pub struct TransactionParams {
    pub limit: Option<i32>,
    pub offset: Option<i32>,
}

/// List all transactions across all accounts
pub async fn list_all_transactions(
    State(state): State<AppState>,
    Query(params): Query<TransactionParams>,
) -> AppResult<Json<Vec<TransactionSummary>>> {
    let limit = params.limit.unwrap_or(100);
    let offset = params.offset.unwrap_or(0);

    let transactions = state
        .db
        .get_all_transactions_with_accounts(limit, offset)
        .await?;

    Ok(Json(transactions))
}
