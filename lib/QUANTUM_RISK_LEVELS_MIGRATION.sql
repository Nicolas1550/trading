-- Run once in Neon SQL Editor. Paper-trading risk levels only.
CREATE TABLE IF NOT EXISTS quantum_risk_levels (
 portfolio_id uuid NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
 asset_id uuid NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
 stop_loss numeric(22,8),
 take_profit numeric(22,8),
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (portfolio_id, asset_id),
 CONSTRAINT valid_risk_levels CHECK ((stop_loss IS NULL OR stop_loss > 0) AND (take_profit IS NULL OR take_profit > 0))
);
