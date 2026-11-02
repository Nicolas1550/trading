-- Run once on Neon SQL Editor. Isolated paper-trading ledger; no real money.
CREATE TABLE IF NOT EXISTS quantum_demo_positions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 portfolio_id uuid NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
 asset_id uuid NOT NULL REFERENCES assets(id),
 direction text NOT NULL CHECK (direction IN ('long','short')),
 quantity numeric(22,8) NOT NULL CHECK(quantity>0),
 entry_price numeric(22,8) NOT NULL CHECK(entry_price>0),
 exit_price numeric(22,8),
 stop_loss numeric(22,8),
 take_profit numeric(22,8),
 margin_reserved numeric(22,8) NOT NULL,
 status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','closed')),
 opened_at timestamptz NOT NULL DEFAULT now(),
 closed_at timestamptz,
 close_reason text,
 data_source text NOT NULL DEFAULT 'demo'
);
CREATE INDEX IF NOT EXISTS quantum_demo_positions_portfolio_idx ON quantum_demo_positions(portfolio_id,status);
