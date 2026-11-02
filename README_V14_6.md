# QUANTUM V14.6 — NYSE, Nasdaq, ETF del S&P 500 y criptomonedas

## Cambio que corrige la watchlist

La V14.5 únicamente solicitaba cotizaciones para los gráficos activos. En la pestaña Watchlist, los demás activos mostraban «Sin cotización cargada». V14.6 integra `GET /api/quotes` con precios independientes del gráfico seleccionado.

- **Acciones y ETF de EE. UU.**: Twelve Data `/quote`, usando `TWELVE_DATA_API_KEY` exclusivamente en el servidor. Etiquetas de mercado NASDAQ, NYSE, NYSE ARCA. Para seguir al S&P 500 se ofrecen ETF SPY, VOO e IVV (no se confunden con el índice S&P 500).
- **Criptomonedas**: API pública de Coinbase Advanced Trade para productos USD (`BTC-USD`, `ETH-USD`, `SOL-USD`, `ADA-USD`, `DOGE-USD`, `LTC-USD`, etc.) y velas de Coinbase cuando esté disponible.
- **Descubrimiento**: búsqueda local y endpoint `/api/assets/search` que utiliza `symbol_search` de Twelve Data cuando la API key está configurada. Puede descubrir instrumentos adicionales; cotizaciones de nuevas altas requieren acceso del proveedor. El registro de un activo en la base de datos es independiente del descubrimiento.
- **Sin cifras inventadas en Watchlist**: devuelve `pending`, `unavailable` o último precio de Neon con su fecha y aviso si no hay respuesta del proveedor. Los gráficos mantienen el modo demo explícitamente marcado cuando el proveedor falla.
- **Protección de cuota**: caché del lado del servidor y un máximo interno de seis llamadas individuales `/quote` a Twelve Data por minuto por proceso, con auto-reintentos del lado del navegador cada 70 segundos. No es una cuota global entre instancias de Vercel; para tráfico de producción se necesita una caché centralizada y un plan/permiso de redistribución apropiado.

## Instalación

1. Extraé el ZIP y copiá tu `.env.local` desde el proyecto anterior (no lo compartas ni lo incluyas en Git).
2. `npm.cmd install`
3. `npm.cmd run build`
4. `npm.cmd run dev`
5. Abrí `http://localhost:3000/terminal`, pulsá **Watchlist** y filtrá por «Destacados», «NASDAQ», «NYSE», «S&P 500», «ETF» o «Cripto».

### Probar APIs desde tu navegador (con el servidor corriendo)

- `/api/quotes?symbols=AAPL,MSFT,JPM,SPY,BTC/USD,ETH/USD` — cada elemento incluye `price`, `source`, `status` y `asOf`.
- `/api/market?symbol=BTC%2FUSD&range=1M` — velas del par BTC-USD desde Coinbase cuando está disponible.
- `/api/assets/search?q=costco` — búsqueda de símbolos.

## Nota sobre Neon y operaciones demo

La consulta de valores no requiere nuevas tablas. Si querés operar virtualmente **nuevos** símbolos, sus registros deben existir en `assets`. Incluimos el SQL opcional `QUANTUM_V14_6_OPTIONAL_ASSET_SEED.sql` para popular el catálogo adicional. No modifica posiciones ni transacciones existentes. Las búsquedas remotas de activos que no están en Neon todavía no pueden garantizar operaciones demo hasta registrarse en `assets`.

## Límites conocidos

- La cuota Basic de Twelve Data es limitada (8 créditos por minuto, 800 por día); algunos instrumentos pueden aparecer «Límite API» y actualizarse más tarde. No equivale a traer en tiempo real todo el NYSE/Nasdaq; la interfaz hace descubrimiento, pero los símbolos que puede consultar dependen del proveedor, de la API key y de sus licencias. Los datos pueden estar retrasados o ser históricos.
- Coinbase puede bloquear el acceso o limitar consultas desde algunas redes/países. En ese caso se muestra «no disponible» o, en gráficos, demo explícitamente señalado.
- Las cotizaciones de Watchlist se mantienen diferenciadas de las simulaciones utilizadas al operar con dinero virtual. Los niveles stop/take profit siguen siendo visuales y no ejecutan cierres automáticos.
- Recomendado: rotar las credenciales expuestas anteriormente y mantener `TWELVE_DATA_API_KEY` en el backend (nunca `NEXT_PUBLIC_`).
