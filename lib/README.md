# QUANTUM — Financial Intelligence Terminal

A premium **Next.js + TypeScript** financial terminal, ready to run locally. V1 includes interactive price charts, asset search, responsive dashboard, a persistent watchlist, timeframe selection, CSV export, market snapshot, and a server-side market API with an optional Twelve Data integration.

## Run locally (Windows / macOS / Linux)

Requirements: Node.js **22+** and npm.

```bash
npm install
npm run dev
```

Visit http://localhost:3000

On Windows PowerShell, if scripts are blocked, use `npm.cmd install` and `npm.cmd run dev` instead.

## Market data: transparency first

**By default, the entire application uses synthetic demo data** — this is deliberate, so the project works immediately with no API key, and to avoid displaying stale fictional prices as live prices. The chart data is deterministic per asset and timeframe within a session, but the timestamps are relative to the current time. The sidebar's quick-access and watchlist prices are illustrative constants and **do not update with the provider**. They are explicitly labeled as demo figures.

To request provider data:

1. Copy `.env.example` to `.env.local`.
2. Set `TWELVEDATA_API_KEY=your_key_here`.
3. Restart the dev server.

The API route `/api/market?symbol=NVDA&range=1M` fetches historical candles from Twelve Data server-side. It automatically falls back to clearly labeled synthetic data if the provider is unavailable, rate-limited, or has no data for that symbol. Supported timeframes: `1D`, `1W`, `1M`, `3M`, `1Y`. Real data availability and delay depend on your provider plan, markets, and licensing. Do not expose your API key in client code.

## V1 scope

- Premium responsive trading terminal layout
- Symbol search across curated equities, ETFs and crypto pairs
- Interactive price charts, selectable timeframes and simple trend visualization
- Period high/low, total volume, period price change
- Watchlist saved in localStorage (no account needed)
- CSV export of displayed candle data
- API route with input validation and 8-second upstream timeout
- Clear data-source status and fallback disclosure
- Placeholder navigation for future features (not represented as implemented)

The chart's alternate "candle" button currently shows a **simplified close-price bar/trend visualization**, not a true OHLC candlestick chart. A full OHLC chart is planned for V2 using Lightweight Charts.

## Architecture

```text
app/
  api/market/route.ts    Server-side provider adapter, validation, demo fallback
  globals.css            Design system, responsive layouts
  layout.tsx             Metadata and root layout
  page.tsx               Terminal entry point
components/
  Terminal.tsx           Client-side terminal, charts, search, watchlist
lib/
  market.ts              Asset catalog, types, deterministic demo series
```

## Roadmap / professional production considerations

- **V2**: Auth.js, Prisma + PostgreSQL, server-side watchlists, paper-trading ledger, portfolio accounting, full OHLC candlestick chart.
- **V3**: AI analysis with citations and explicit model uncertainty, alert rules, background jobs and notifications.
- **V4**: Backtesting with transaction costs, slippage, benchmark comparison, prevention of look-ahead bias.
- **V5**: Automated tests, accessibility review, observability, CI/CD, and deployment hardening.

For production, add a provider-specific rate-limit strategy, robust cache, time-zone/calendar handling, corporate actions, standardized instrument IDs, proper licensing, historical-data consistency, and financial-data audit logs. This V1 is a portfolio demo, **not a brokerage or investment-advice product**.

## Security

Never commit `.env.local` or real API keys. `.gitignore` excludes them. API keys are only accessed server-side.

## Commands

```bash
npm run dev
npm run build
npm start
npm run typecheck
```
