# QUANTUM V2 — Neon Full Stack

This release extends V1 without changing its market visualization.

## Setup

1. Use the existing Neon SQL schema (12 tables) in your `neondb` database.
2. `npm install`
3. Create `.env.local` with `DATABASE_URL="postgresql://..."` (copy your own connection URL from Neon). Never commit this file.
4. `npm run dev` then open http://localhost:3000.
5. Click the **Q** avatar in the top right or **Portfolio** in the sidebar to register/login and use a virtual portfolio.

## API

- `GET/POST/DELETE /api/auth` — session / register-login / logout.
- `GET/POST /api/watchlist` — personal watchlist, authenticated.
- `GET/POST /api/portfolio` — portfolio, positions, simulated trades.
- `GET /api/market` — V1 market chart, provider or synthetic data.

## Important boundaries

- This is a portfolio demo, **not** a brokerage. Trades are simulated at manually entered prices, not provider-executed or live prices.
- Virtual cash and positions are computed from transactions. Transaction creation uses a PostgreSQL row lock on the portfolio to prevent simultaneous overspending.
- Account passwords are hashed with bcrypt; session tokens are hashed in PostgreSQL and cookies are HttpOnly.
- No rate limiting, email verification, password reset or production monitoring yet. Add these before public deployment.
- Existing V1 market quick-access numbers remain illustrative.
- `.env.local` is ignored by Git. Rotate any previously shared Neon credentials before deployment.
