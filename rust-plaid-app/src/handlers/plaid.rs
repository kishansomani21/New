use axum::{extract::State, Json};
use chrono::{Duration, Utc};

use crate::error::{AppError, AppResult};
use crate::models::*;
use crate::AppState;

/// Create a Plaid Link token for initializing Plaid Link
pub async fn create_link_token(State(state): State<AppState>) -> AppResult<Json<LinkTokenResponse>> {
    // Get or create default user
    let user = state.db.get_or_create_default_user().await?;

    // Create link token via Plaid
    let response = state.plaid_client.create_link_token(&user.id).await?;

    Ok(Json(LinkTokenResponse {
        link_token: response.link_token,
        expiration: response.expiration,
    }))
}

/// Exchange a public token from Plaid Link for an access token
pub async fn exchange_token(
    State(state): State<AppState>,
    Json(request): Json<ExchangeTokenRequest>,
) -> AppResult<Json<ExchangeTokenResponse>> {
    // Get or create default user
    let user = state.db.get_or_create_default_user().await?;

    // Exchange public token for access token
    let exchange_response = state
        .plaid_client
        .exchange_public_token(&request.public_token)
        .await?;

    // Get accounts from Plaid
    let accounts_response = state
        .plaid_client
        .get_accounts(&exchange_response.access_token)
        .await?;

    // Get institution name if available
    let institution_name = if let Some(ref inst_id) = accounts_response.item.institution_id {
        match state.plaid_client.get_institution(inst_id).await {
            Ok(inst) => Some(inst.name),
            Err(_) => None,
        }
    } else {
        None
    };

    // Store Plaid item in database
    let item_id = state
        .db
        .create_plaid_item(
            &user.id,
            &exchange_response.item_id,
            &exchange_response.access_token,
            accounts_response.item.institution_id.as_deref(),
            institution_name.as_deref(),
        )
        .await?;

    // Store accounts in database
    let mut account_summaries = Vec::new();
    for plaid_account in &accounts_response.accounts {
        let account_id = state.db.upsert_account(&item_id, plaid_account).await?;

        let currency = plaid_account
            .balances
            .iso_currency_code
            .clone()
            .or(plaid_account.balances.unofficial_currency_code.clone())
            .unwrap_or_else(|| "USD".to_string());

        account_summaries.push(AccountSummary {
            id: account_id,
            name: plaid_account.name.clone(),
            official_name: plaid_account.official_name.clone(),
            account_type: plaid_account.account_type.clone(),
            subtype: plaid_account.subtype.clone(),
            mask: plaid_account.mask.clone(),
            current_balance: plaid_account.balances.current,
            available_balance: plaid_account.balances.available,
            currency,
            institution_name: institution_name.clone(),
            last_synced: None,
        });
    }

    tracing::info!(
        "Successfully linked {} accounts from {}",
        account_summaries.len(),
        institution_name.as_deref().unwrap_or("Unknown Institution")
    );

    Ok(Json(ExchangeTokenResponse {
        item_id,
        accounts: account_summaries,
    }))
}

/// Sync transactions for a Plaid item
pub async fn sync_transactions(
    State(state): State<AppState>,
    Json(request): Json<SyncTransactionsRequest>,
) -> AppResult<Json<SyncResult>> {
    // Get the Plaid item
    let item = state
        .db
        .get_plaid_item(&request.item_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Plaid item not found".to_string()))?;

    // Calculate date range (last 30 days)
    let end_date = Utc::now().format("%Y-%m-%d").to_string();
    let start_date = (Utc::now() - Duration::days(30))
        .format("%Y-%m-%d")
        .to_string();

    // Fetch transactions from Plaid
    let mut total_added = 0;
    let mut total_modified = 0;
    let mut offset = 0;
    let count = 500;

    loop {
        let response = state
            .plaid_client
            .get_transactions(&item.access_token, &start_date, &end_date, count, offset)
            .await?;

        // Update accounts with latest balances
        for plaid_account in &response.accounts {
            state.db.upsert_account(&item.id, plaid_account).await?;
        }

        // Store transactions
        for plaid_transaction in &response.transactions {
            // Get account ID from our database
            if let Some(account) = state
                .db
                .get_account_by_plaid_id(&plaid_transaction.account_id)
                .await?
            {
                let (_, is_new) = state
                    .db
                    .upsert_transaction(&account.id, plaid_transaction)
                    .await?;

                if is_new {
                    total_added += 1;
                } else {
                    total_modified += 1;
                }
            }
        }

        // Check if we've fetched all transactions
        offset += response.transactions.len() as i32;
        if offset >= response.total_transactions {
            break;
        }
    }

    // Update last synced timestamp
    state.db.update_item_last_synced(&item.id).await?;

    tracing::info!(
        "Synced transactions: {} added, {} modified",
        total_added,
        total_modified
    );

    Ok(Json(SyncResult {
        added: total_added,
        modified: total_modified,
        removed: 0,
        accounts_updated: 1,
    }))
}
