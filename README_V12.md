# QUANTUM V12 — Unified Trading Platform (integración inicial)

## Rutas
- `/`: nueva landing de presentación con enlaces a acceso de cuenta e invitado.
- `/pro`: espacio principal Multi-Chart (1, 2, 4, 8), Screener, Strategy Lab y análisis técnico por reglas.
- `/overview`: terminal original con autenticación, cartera y operaciones demo.

## Cambios de V12
- Nueva portada responsive, con CTA para cuenta y exploración sin cuenta.
- Multi-Chart destacado en `/pro`, botones de velas/línea y modo Focus.
- Selector de indicadores con búsqueda y categorías ampliadas.
- Nuevos cálculos y gráficos: VWAP, WMA20/50, Donchian20, ROC12, OBV, Williams %R y CCI20, además de indicadores existentes (EMA/SMA, Bollinger, RSI, MACD, ATR, Stochastic).
- Las preferencias de Multi-Chart siguen almacenadas en localStorage, no en Neon.

## Limitaciones conocidas
- La biblioteca muestra herramientas adicionales (Keltner, Supertrend, MFI, CMF) como catálogo futuro; sus cálculos no están integrados todavía. No se deben interpretar como activos.
- No hay un motor compatible con Pine Script ni paridad total con TradingView.
- La sesión y operaciones siguen en el terminal `/overview`; `/pro` es un entorno de análisis sin ejecución de órdenes.
- Los marcadores de operaciones reales del usuario no se sincronizan todavía con `/pro`.
- No hay ejecución automática de stop-loss o take-profit.
- La ruta `/overview` contiene tanto el acceso a cuenta como el dashboard heredado; no es una pantalla exclusiva de login.
- Las preferencias no se sincronizan con las nuevas tablas Neon.
- No se validó la compilación de producción en este entorno (instalación de dependencias no finalizada).

## Instalación
1. Extraer ZIP.
2. Copiar `.env.local` localmente (nunca compartir claves).
3. `npm.cmd install`
4. `npm.cmd run build`
5. `npm.cmd run dev`
6. Abrir `http://localhost:3000`.

Datos de mercado: verificar origen de datos; la aplicación usa fallback sintético. Las cotizaciones de proveedor pueden estar retrasadas. Operaciones siempre virtuales.
