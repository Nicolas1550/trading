# QUANTUM V14.4 — Unified Professional Trading Workspace

## Instalación (Windows PowerShell)

1. Extraé el ZIP y abrí la carpeta `quantum-v7`.
2. Copiá tu propio `.env.local` (el ZIP no incluye contraseñas ni claves).
3. Ejecutá:

```powershell
npm.cmd install
npm.cmd run build
npm.cmd run dev
```

4. Entrá a **http://localhost:3000** para la portada o **http://localhost:3000/terminal** para la terminal. `/pro` es un alias para mantener tus marcadores antiguos.

Si aparece un error de build, compartí el primer error de consola (SIN secretos). La compilación de producción no pudo validarse en el entorno donde se generó el ZIP por falta de acceso al registro de npm; se verificó la sintaxis TypeScript y el motor de indicadores con pruebas numéricas.

## Configuración de entorno (servidor; nunca usar `NEXT_PUBLIC_` para secretos)

```env
DATABASE_URL="postgresql://..."
TWELVE_DATA_API_KEY="tu_clave_privada"
# Opcional para el chatbot de AI Copilot en Strategy / Market Insights
OPENAI_API_KEY="tu_clave_privada"
OPENAI_MODEL="gpt-6-luna"
```

También se acepta `TWELVEDATA_API_KEY` por compatibilidad con versiones anteriores. Nunca subas `.env.local` a GitHub o a un ZIP público. Regenerá las claves que se hayan publicado en capturas o chats.

## Neon

Necesitás las tablas de los **Bloques V11 1, 2 y 3** que ya instalaste. No recrees esas tablas. El botón **Guardar espacio** utiliza `chart_layouts`, `user_indicators`, `indicator_definitions` y `chart_drawings`. La migración opcional `QUANTUM_V14_4_INDICATORS_SEED.sql` precarga el catálogo completo, pero **no es obligatoria**: el backend también registra los indicadores usados al guardar un espacio. Las operaciones demo tipo market utilizan `transactions`, `trading_orders` y `account_ledger` dentro de una sola transacción SQL.

Los SL/TP dibujados se guardan en `quantum_risk_levels`, que requiere la migración existente `QUANTUM_RISK_LEVELS_MIGRATION.sql` si todavía no la aplicaste. **Importante: esos niveles NO cierran órdenes automáticamente.**

## Qué incluye V14.4

- Portada con iniciar sesión, crear cuenta y explorar sin registro.
- `/terminal` con **un gráfico inicial**, opción a 2 gráficos laterales o 3 (uno principal y dos secundarios), panel derecho, dock inferior y modo Focus/fullscreen real.
- Biblioteca flotante de **34 indicadores calculados**: medias móviles, momentum, volumen, volatilidad. Incluye EMA y SMA con períodos personalizados de 2 a 500, RSI personalizado, zoom horizontal y exploración del historial.
- Marcadores B/S basados en `transactions`, precio promedio de entrada, zonas verdes/rojas, líneas de SL y TP, información OHLC al pasar el cursor.
- Herramientas de dibujo: línea horizontal y línea de tendencia; guardado en Neon después de iniciar sesión.
- Cuenta invitada con análisis público; para guardar, crear alertas y operar con saldo demo hace falta cuenta.
- Trading spot demo de **compra/venta de activos que ya tenés**, sin dinero real; el **servidor** determina el precio a utilizar. Se registra la orden y el asiento contable sin confiar en el precio enviado por el navegador. Incluye idempotency key por orden.
- Ventanas de screener, backtesting educativo y Market Insights heredadas, accesibles desde la barra superior (`/research?view=screener`, `?view=strategy`, `?view=copilot`).
- QUANTUM AI Copilot **opcional**: un chat contextual (autenticación necesaria) que utiliza una clave `OPENAI_API_KEY` de servidor. Sin esa clave permanece operativo Market Insights basado en reglas; el chat muestra explícitamente que no está habilitado.
- Cuando hay clave Twelve Data, carga datos del proveedor y los inserta por lotes en Neon. Si falla el proveedor, señala el uso de datos sintéticos.

## Límites importantes (no afirmamos equivalencia con TradingView)

- **No implementa Pine Script**, todos los indicadores propietarios ni un lenguaje completo para programar indicadores arbitrarios. Los indicadores custom permiten modificar períodos de EMA/SMA/RSI. Algunas fórmulas complejas (Supertrend, ADX, PSAR) son aproximaciones educativas y deben contrastarse con una referencia antes de usarlas en una estrategia sensible.
- **No hay market-depth/order book en vivo**, profundidad de mercado, ejecución real, ni operaciones contra una bolsa; es paper trading.
- **No hay motor de stops/trailing automático en segundo plano** ni liquidación de margen/shorts unificados. El módulo legacy de posiciones demo de V10 continúa separado. El saldo del Portfolio se calcula desde `transactions`; el ledger registra nuevos movimientos, pero los datos históricos aún necesitan conciliación contable antes de que el ledger sea la única fuente de verdad.
- Strategy Lab sigue siendo un backtest educativo simplificado (no simula todo tipo de orden, deslizamiento, dividendos ni condiciones intravela). Market Insights determinístico no es IA generativa.
- El catálogo de activos es el conjunto existente; una plataforma pública requeriría una fuente con licencia, controles de cuotas, almacenamiento cacheado y programación de tareas.
- La IA opcional tiene control temporal básico por instancia, no cuotas persistentes distribuidas. Agregar autenticación reforzada, rate limiting persistente, control de costos, trazas, pruebas E2E y revisión de seguridad antes de producción pública.

## Comprobaciones rápidas

- Con `npm.cmd run dev`, visitá `/terminal`: confirmá un gráfico.
- Indicadores: buscá `EMA200`, agregalo; elegí `RSI`, `MACD`, etc. Los osciladores se añaden bajo el precio.
- Cambiá a 2 y 3 gráficos; probá Focus y el ícono de fullscreen.
- Entrá como invitado: las operaciones deben solicitar inicio de sesión.
- Iniciá sesión, creá cartera demo si hace falta, ejecutá una operación, revisá Historial y los marcadores.
- Guardá espacio; recargá `/terminal` y comprobá que vuelve a cargar tu configuración desde Neon.
- Para una integración real con Vercel, configurá las variables de entorno en Vercel y redeployá.

> Todos los precios y ejemplos demo son educativos. QUANTUM no proporciona asesoramiento de inversión ni órdenes bursátiles reales.
