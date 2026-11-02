-- QUANTUM V15.2: named, reusable personal indicator presets.
-- Safe additive migration: run once in Neon SQL Editor (Primary > neondb).
-- Existing chart_layouts, user_indicators, portfolios and trades are untouched.
CREATE TABLE IF NOT EXISTS indicator_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name varchar(75) NOT NULL,
  kind varchar(10) NOT NULL CHECK(kind IN ('MACD','EMA','SMA','RSI')),
  code varchar(40) NOT NULL,
  params jsonb NOT NULL DEFAULT '{}'::jsonb CHECK(jsonb_typeof(params)='object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS indicator_presets_user_name_idx ON indicator_presets(user_id,lower(name));
CREATE UNIQUE INDEX IF NOT EXISTS indicator_presets_user_code_idx ON indicator_presets(user_id,code);
CREATE INDEX IF NOT EXISTS indicator_presets_user_updated_idx ON indicator_presets(user_id,updated_at DESC);
-- Verification: SELECT name,kind,params FROM indicator_presets ORDER BY updated_at DESC;
