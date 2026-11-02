# QUANTUM V16 — Portfolio Intelligence

## Nuevo en V16

- `/portfolio`: resumen total de cartera demo, ganancia/pérdida total, realizada y no realizada, exposición, cash, patrimonio y listado detallado por activo.
- La lista incluye activos abiertos y cerrados. El historial conserva las últimas 40 transacciones mostradas.
- P&L visible en `/terminal` (banda superior, ticket del símbolo elegido, pestaña Cartera y enlace a vista completa).
- Endpoint GET autenticado `/api/portfolio-analytics` consulta únicamente la cartera de la sesión.
- Cálculo de costo promedio ponderado, ventas parciales y comisiones en `lib/portfolio-pnl.ts`.
- Cotizaciones desde las APIs existentes (Twelve Data para acciones/ETF, Coinbase para USD crypto); si no están disponibles, se busca un último cierre histórico del proveedor almacenado en `market_prices` y se identifica como tal.
- Si falta cotización o se detectan transacciones inconsistentes NO se muestra un total engañoso. La ganancia realizada sigue visible.

## Instalación (PowerShell)

Copiar `.env.local` actual desde la versión anterior al directorio `quantum-v7` de este ZIP. No publicar claves ni incluir `.env.local` en Git.

```powershell
npm.cmd install
npm.cmd test
npm.cmd run build
npm.cmd run dev
```

Rutas: `http://localhost:3000/terminal` y `http://localhost:3000/portfolio`.

No hace falta una migración adicional a Neon: se usan `users`, `sessions`, `portfolios`, `transactions`, `assets`, `market_prices` ya existentes. Para cartera demo aún vacía, se puede crear desde el terminal o la nueva página.

## Criterios contables

- `cash = initial_balance - compras - sus comisiones + ventas - sus comisiones`.
- Costo de cada compra = importe más comisión.
- Cada venta retira costo promedio de las unidades vendidas. P&L realizado = ingreso neto menos costo retirado.
- P&L no realizado = unidades abiertas × precio de mercado - costo remanente.
- Equity = efectivo + valor actual de posiciones. Total P&L = realizado + no realizado = equity - capital inicial, si todas las posiciones pueden valorarse.
- Historial con precios sintéticos produce resultados **solo ilustrativos**; las cotizaciones de cartera no usan datos sintéticos como precios actuales.
- Cierres históricos del proveedor se identifican como "caché/cierre histórico" y no equivalen a precio en tiempo real.
- No incluye todavía el módulo separado `quantum_demo_positions` de operaciones apalancadas, ni los futuros depósitos/retiros manuales de `account_ledger`. Para un motor contable único habrá que migrar esas fuentes.
- Las P&L son de posiciones LONG de `transactions`; no son recomendaciones financieras ni cálculos de impuestos.

## Verificación

```powershell
npm.cmd run test:pnl
npm.cmd test
npm.cmd run build
```

Escenarios automatizados: compra, venta parcial, costo promedio, comisiones, liquidación total de posición, precio ausente, activo sin precio y venta sin tenencia.

En el entorno de generación se ejecutaron las pruebas unitarias y una comprobación de sintaxis TS/TSX, pero **no fue posible completar `next build`** porque el registro npm no era accesible desde ese entorno. Ejecutar `npm.cmd run build` en la PC y corregir cualquier error de producción antes de desplegar.
