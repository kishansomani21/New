use crate::error::{AppError, AppResult};
use crate::models::*;
use reqwest::Client;

/// Plaid API client for interacting with Plaid services
#[derive(Clone)]
pub struct PlaidClient {
    client: Client,
    client_id: String,
    secret: String,
    base_url: String,
}

impl PlaidClient {
    /// Create a new Plaid client
    pub fn new(client_id: String, secret: String, env: String) -> Self {
        let base_url = match env.as_str() {
            "production" => "https://production.plaid.com",
            "development" => "https://development.plaid.com",
            _ => "https://sandbox.plaid.com",
        }
        .to_string();

        Self {
            client: Client::new(),
            client_id,
            secret,
            base_url,
        }
    }

    /// Create a link token for Plaid Link initialization
    pub async fn create_link_token(&self, user_id: &str) -> AppResult<PlaidLinkTokenResponse> {
        let request = PlaidLinkTokenRequest {
            client_id: self.client_id.clone(),
            secret: self.secret.clone(),
            user: PlaidUser {
                client_user_id: user_id.to_string(),
            },
            client_name: "Rust Plaid Banking".to_string(),
            products: vec!["transactions".to_string()],
            country_codes: vec!["US".to_string(), "CA".to_string()],
            language: "en".to_string(),
        };

        let response = self
            .client
            .post(format!("{}/link/token/create", self.base_url))
            .json(&request)
            .send()
            .await?;

        if response.status().is_success() {
            let result: PlaidLinkTokenResponse = response.json().await?;
            Ok(result)
        } else {
            let error: PlaidError = response.json().await?;
            Err(AppError::PlaidApi(format!(
                "{}: {}",
                error.error_code, error.error_message
            )))
        }
    }

    /// Exchange a public token for an access token
    pub async fn exchange_public_token(
        &self,
        public_token: &str,
    ) -> AppResult<PlaidExchangeResponse> {
        let request = PlaidExchangeRequest {
            client_id: self.client_id.clone(),
            secret: self.secret.clone(),
            public_token: public_token.to_string(),
        };

        let response = self
            .client
            .post(format!("{}/item/public_token/exchange", self.base_url))
            .json(&request)
            .send()
            .await?;

        if response.status().is_success() {
            let result: PlaidExchangeResponse = response.json().await?;
            Ok(result)
        } else {
            let error: PlaidError = response.json().await?;
            Err(AppError::PlaidApi(format!(
                "{}: {}",
                error.error_code, error.error_message
            )))
        }
    }

    /// Get accounts for an access token
    pub async fn get_accounts(&self, access_token: &str) -> AppResult<PlaidAccountsResponse> {
        let request = PlaidAccountsRequest {
            client_id: self.client_id.clone(),
            secret: self.secret.clone(),
            access_token: access_token.to_string(),
        };

        let response = self
            .client
            .post(format!("{}/accounts/get", self.base_url))
            .json(&request)
            .send()
            .await?;

        if response.status().is_success() {
            let result: PlaidAccountsResponse = response.json().await?;
            Ok(result)
        } else {
            let error: PlaidError = response.json().await?;
            Err(AppError::PlaidApi(format!(
                "{}: {}",
                error.error_code, error.error_message
            )))
        }
    }

    /// Get transactions for an access token within a date range
    pub async fn get_transactions(
        &self,
        access_token: &str,
        start_date: &str,
        end_date: &str,
        count: i32,
        offset: i32,
    ) -> AppResult<PlaidTransactionsResponse> {
        let request = PlaidTransactionsRequest {
            client_id: self.client_id.clone(),
            secret: self.secret.clone(),
            access_token: access_token.to_string(),
            start_date: start_date.to_string(),
            end_date: end_date.to_string(),
            options: PlaidTransactionsOptions { count, offset },
        };

        let response = self
            .client
            .post(format!("{}/transactions/get", self.base_url))
            .json(&request)
            .send()
            .await?;

        if response.status().is_success() {
            let result: PlaidTransactionsResponse = response.json().await?;
            Ok(result)
        } else {
            let error: PlaidError = response.json().await?;
            Err(AppError::PlaidApi(format!(
                "{}: {}",
                error.error_code, error.error_message
            )))
        }
    }

    /// Get institution information
    pub async fn get_institution(&self, institution_id: &str) -> AppResult<PlaidInstitution> {
        let request = PlaidInstitutionRequest {
            client_id: self.client_id.clone(),
            secret: self.secret.clone(),
            institution_id: institution_id.to_string(),
            country_codes: vec!["US".to_string(), "CA".to_string()],
        };

        let response = self
            .client
            .post(format!("{}/institutions/get_by_id", self.base_url))
            .json(&request)
            .send()
            .await?;

        if response.status().is_success() {
            let result: PlaidInstitutionResponse = response.json().await?;
            Ok(result.institution)
        } else {
            let error: PlaidError = response.json().await?;
            Err(AppError::PlaidApi(format!(
                "{}: {}",
                error.error_code, error.error_message
            )))
        }
    }
}
