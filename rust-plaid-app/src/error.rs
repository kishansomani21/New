use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;

/// Application error type
#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("Plaid API error: {0}")]
    PlaidApi(String),

    #[error("HTTP client error: {0}")]
    HttpClient(#[from] reqwest::Error),

    #[error("Template rendering error: {0}")]
    Template(#[from] tera::Error),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Bad request: {0}")]
    BadRequest(String),

    #[error("Internal error: {0}")]
    Internal(String),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, error_message) = match &self {
            AppError::Database(e) => {
                tracing::error!("Database error: {:?}", e);
                (StatusCode::INTERNAL_SERVER_ERROR, "Database error occurred")
            }
            AppError::PlaidApi(msg) => {
                tracing::error!("Plaid API error: {}", msg);
                (StatusCode::BAD_GATEWAY, msg.as_str())
            }
            AppError::HttpClient(e) => {
                tracing::error!("HTTP client error: {:?}", e);
                (StatusCode::BAD_GATEWAY, "External service error")
            }
            AppError::Template(e) => {
                tracing::error!("Template error: {:?}", e);
                (StatusCode::INTERNAL_SERVER_ERROR, "Template rendering error")
            }
            AppError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.as_str()),
            AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.as_str()),
            AppError::Internal(msg) => {
                tracing::error!("Internal error: {}", msg);
                (StatusCode::INTERNAL_SERVER_ERROR, msg.as_str())
            }
        };

        let body = Json(json!({
            "error": error_message,
            "status": status.as_u16()
        }));

        (status, body).into_response()
    }
}

pub type AppResult<T> = Result<T, AppError>;
