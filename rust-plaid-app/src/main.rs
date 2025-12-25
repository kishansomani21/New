use axum::{
    routing::{get, post},
    Router,
};
use std::sync::Arc;
use tower_http::{
    cors::{Any, CorsLayer},
    services::ServeDir,
    trace::TraceLayer,
};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod config;
mod db;
mod error;
mod handlers;
mod models;
mod plaid;

use config::Config;
use db::Database;

/// Application state shared across all handlers
#[derive(Clone)]
pub struct AppState {
    pub db: Database,
    pub config: Arc<Config>,
    pub plaid_client: plaid::PlaidClient,
    pub templates: Arc<tera::Tera>,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing for logging
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "rust_plaid_banking=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    tracing::info!("Starting Rust Plaid Banking Application...");

    // Load configuration
    dotenvy::dotenv().ok();
    let config = Config::from_env()?;
    tracing::info!("Configuration loaded. Plaid environment: {}", config.plaid_env);

    // Initialize database
    let db = Database::new(&config.database_url).await?;
    db.run_migrations().await?;
    tracing::info!("Database initialized and migrations applied");

    // Initialize Plaid client
    let plaid_client = plaid::PlaidClient::new(
        config.plaid_client_id.clone(),
        config.plaid_secret.clone(),
        config.plaid_env.clone(),
    );

    // Initialize templates
    let templates = tera::Tera::new("templates/**/*.html")?;
    tracing::info!("Templates loaded");

    // Build application state
    let state = AppState {
        db,
        config: Arc::new(config.clone()),
        plaid_client,
        templates: Arc::new(templates),
    };

    // Build CORS layer
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build router
    let app = Router::new()
        // Page routes
        .route("/", get(handlers::pages::home))
        .route("/dashboard", get(handlers::pages::dashboard))
        .route("/accounts", get(handlers::pages::accounts))
        .route("/transactions", get(handlers::pages::transactions))
        .route("/transactions/:account_id", get(handlers::pages::account_transactions))
        // Plaid API routes
        .route("/api/plaid/create-link-token", post(handlers::plaid::create_link_token))
        .route("/api/plaid/exchange-token", post(handlers::plaid::exchange_token))
        .route("/api/plaid/sync-transactions", post(handlers::plaid::sync_transactions))
        // Account API routes
        .route("/api/accounts", get(handlers::accounts::list_accounts))
        .route("/api/accounts/:id", get(handlers::accounts::get_account))
        .route("/api/accounts/:id/transactions", get(handlers::accounts::get_account_transactions))
        .route("/api/transactions", get(handlers::transactions::list_all_transactions))
        // Static files
        .nest_service("/static", ServeDir::new("static"))
        // Add middleware
        .layer(TraceLayer::new_for_http())
        .layer(cors)
        .with_state(state);

    // Start server
    let addr = format!("{}:{}", config.host, config.port);
    let listener = tokio::net::TcpListener::bind(&addr).await?;
    tracing::info!("🚀 Server running at http://{}", addr);

    axum::serve(listener, app).await?;

    Ok(())
}
