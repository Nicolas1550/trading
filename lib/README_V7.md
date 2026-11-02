# QUANTUM V7 — Financial Intelligence Workspace

## Install
1. Copy `.env.example` to `.env.local` and set your **newly rotated** Neon `DATABASE_URL` (never commit secrets).
2. Execute the previously supplied 12-table SQL schema in Neon.
3. Run `npm install`, `npm run dev`; open `http://localhost:3000`.
4. Register via the Q button, then open `/workspace`.

## Database table usage
- `users`, `sessions`: account login/session
- `assets`, `market_prices`: catalog and stored historical candles
- `watchlists`, `watchlist_items`: saved watchlists
- `portfolios`, `transactions`: virtual portfolios and simulated orders
- `price_alerts`: saved price thresholds (no delivery worker yet)
- `strategies`: configurable SMA crossover
- `backtest_runs`: persisted historical SMA simulations; requires historical market data
- `ai_reports`: stored deterministic research reports; no external AI connected

## Limitations
This is a development prototype, **not** production-ready despite the V7 project label. Market data ingestion, alert evaluation/delivery, a licensed market feed, live quotes, an AI provider, email verification, rate limiting, robust CSRF protections, full automated tests, and deployment monitoring are not included. Historical backtesting is educational and simplified, with optimistic execution assumptions. Simulated trading uses manually entered prices and is not brokerage trading.

## Security
Keep `.env.local` out of version control. Rotate previously exposed database credentials. Run `npm audit` and `npm run build` before deployment. Restrict production usage until auth hardening and security review are complete.
