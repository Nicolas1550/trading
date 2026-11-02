# QUANTUM V9 — Technical Charts Preview

Based on QUANTUM V8. Adds a custom SVG OHLC candlestick renderer, real high/low wicks, volume, RSI(14), MACD(12,26,9), EMA(20), Bollinger Bands(20,2), and buy/sell markers at transaction execution price and nearest candle timestamp. Marker click shows exact execution time, quantity, price. Toggle indicators above chart. Candle view is the default; area view remains available.

## Start
1. Copy your own `.env.local` to this folder (never share it).
2. `npm.cmd install`
3. `npm.cmd run dev`
4. Open `http://localhost:3000` and choose an asset. Sign in and create a simulated portfolio to trade.

## Notes
- Prototype uses an SVG renderer, **not** TradingView Lightweight Charts yet. This is a functional first stage, not parity with TradingView.
- RSI uses a rolling-window gain/loss calculation; it is not Wilder's smoothed RSI. EMA/MACD need enough warmup history for stable values. Intraday data availability depends on Twelve Data plan.
- Trades are virtual. The original portfolio endpoint accepts a client-provided price; do not use for real money or security-critical settlement. Server-validated quotes and stronger controls remain future work.
- Markers are shown only if the nearest candle is within the queried time window. In 1D mode, a prior day's trade will not be shown; switch to a wider range.
- The project has not been verified by a full `npm run build` in this environment because dependency installation was unavailable.
