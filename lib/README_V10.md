QUANTUM V10 — TRADING WORKSPACE PREVIEW

1. Copy your existing .env.local (DATABASE_URL, TWELVE_DATA_API_KEY) to this project. Never share it or commit it.
2. In Neon SQL Editor run QUANTUM_RISK_LEVELS_MIGRATION.sql once.
3. npm.cmd install
4. npm.cmd run build
5. npm.cmd run dev
6. Sign in and create a demo portfolio in Portfolio if you have not already.
7. On the main dashboard choose a symbol and Buy/Sell. Trades are recorded in Neon and markers B/S are shown on the chart.
8. The indicator picker enables EMA 9/20/50/100/200, SMA 20/50/200, Bollinger, RSI, MACD, ATR, Stochastic.

IMPORTANT LIMITATIONS:
- PAPER TRADING ONLY. Demo source trades use synthetic prices, clearly labeled.
- Stop-loss and take-profit levels are saved and displayed, but automatic execution and margin liquidation are NOT implemented. No automatic balance deduction from stop levels.
- Trade markers outside the currently displayed history are pinned to the nearest edge with lower opacity. Expand the history to see exact time position.
- Some indicator options (VWAP) are listed but not yet implemented in this preview; they must not be interpreted as functional.
- Price-based execution is user-submitted and is not a trusted live exchange fill; production would require server-side price verification.
- Run a production build locally before deployment; dependency installation may be required.
