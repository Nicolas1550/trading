# QUANTUM ULTIMATE — Integrated preview

## Start
Copy your own `.env.local` into `quantum-v7` (never share secrets). Run `npm.cmd install`, `npm.cmd run dev` on Windows. Open `/pro` or click **QUANTUM ULTIMATE** from the main terminal.

## Implemented in this build
- `/pro` Multi-Chart: 1/2/4/8 independent chart slots, symbol selection, common timeframe and technical overlays, preferences in browser localStorage.
- Screener: computes RSI 14, SMA 20 and price change from the current supported symbol catalog and fetched OHLCV.
- Strategy Lab: illustrative SMA crossover backtest, configurable fast/slow lengths, fee and starting cash, equity curve, max drawdown.
- Market Insights: rule-based RSI/SMA interpretation. Explicitly **not** a generative AI model.
- Existing V10 terminal and paper-trading interfaces remain available on `/`.

## Not yet implemented / caveats
- New Neon tables (14 from migrations) are not wired into this `/pro` preview; browser preferences are local only.
- 8 charts can be expensive; market provider limits may apply and the market endpoint falls back to synthetic data, labeled in the UI.
- Not all possible indicators are implemented. Existing ProChart supports EMA/SMA, Bollinger, RSI, MACD, ATR and Stochastic. EMA 200 with fewer than 200 candles is not fully warmed up; do not rely on it for trading.
- Strategy backtest is educational only; no slippage, taxes, corporate actions, or realistic order fill simulation.
- No LLM integration, autonomous execution, scheduled stop monitoring or broker trading. These require secure server-side development.
- The existing portfolio API still needs a server-validated execution price and unified ledger; do not deploy it as a real-money trading service.

## Security
Never upload `.env.local`, API keys or Neon credentials. Rotate any previously exposed keys. Set `TWELVEDATA_API_KEY` only server-side.
