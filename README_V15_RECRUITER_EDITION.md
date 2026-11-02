# QUANTUM V15 — Recruiter Edition

QUANTUM es una aplicación educativa Full Stack de investigación y **paper trading**. No conecta con brokers ni ejecuta órdenes reales. **No constituye asesoramiento financiero**.

## Qué tiene esta entrega

### Terminal
- Vista **Chart First**, un gráfico por defecto y Multi-Chart opcional (1/2/3 activos).
- Pan y zoom con mouse/rueda; escalado vertical al arrastrar precios, horizontal al arrastrar fechas; Focus y pantalla completa.
- Biblioteca flotante con 34 indicadores técnicos calculados localmente; períodos configurables EMA/SMA/RSI 2–500. Se necesitan suficientes velas para cada indicador.
- Plantillas «Intradía», «Swing» e «Inversor» aplicables al gráfico activo.
- Búsqueda global con **Ctrl+K** de activos, secciones, presets y layouts.
- Barra superior con máximo, mínimo, volumen y tipo de datos del período solicitado.
- Watchlist con categorías y favoritos locales, sin inventar precios cuando el proveedor no devuelve una cotización.
- Dibujos horizontales y de tendencia, exportación SVG del gráfico principal, guía de controles con `?`.
- Panel contextual con RSI, máximo reciente y comparación frente a EMA 200, mostrando la ausencia de datos cuando corresponda.
- Panel de trading con riesgo/beneficio estimado y **stops exclusivamente visuales**.

### Datos, autenticación y Neon
- Twelve Data para acciones estadounidenses y ETF; Coinbase para criptomonedas spot. La actualización depende de cuotas, red, plan y disponibilidad del proveedor. Cotizaciones pueden estar diferidas.
- Neon PostgreSQL para usuarios, sesiones, carteras, transacciones, layouts, indicadores, órdenes y contabilidad demo. Se requieren las migraciones V11 de los tres bloques ya aplicadas a la base.
- El precio de las operaciones simuladas lo determina el servidor, no el navegador; se etiqueta el origen del precio.
- Corrección de estadísticas: la variación, máximo, mínimo y volumen se calculan sobre el **período solicitado**, no sobre el historial precargado para medias móviles.
- Corrección de marcadores: una operación fuera del historial no se adhiere falsamente a la primera ni última vela.
- Comprobación adicional de origen HTTP para autenticación y endpoints de escritura de inteligencia.

### Investigación
- Screener y Strategy Lab educativos existentes de V14, sin presentarlos como motores institucionales.
- Market Insights determinístico; Copilot generativo opcional si el servidor tiene una clave de API y el modelo configurado está disponible.

## Instalación (Windows PowerShell)

1. Extraé el ZIP y abrí PowerShell **dentro de `quantum-v7`**.
2. Copiá tu `.env.local` existente allí. Nunca publiques ese archivo.
3. Corré:

```powershell
npm.cmd install
npm.cmd test
npm.cmd run build
npm.cmd run dev
```

4. Abrí `http://localhost:3000` para portada o `http://localhost:3000/terminal` para la terminal.

Ejemplo de variables requeridas en `.env.example`: `DATABASE_URL`, `TWELVE_DATA_API_KEY`. Para utilizar IA generativa: `OPENAI_API_KEY` y `OPENAI_MODEL` (opcional). Todas son **variables privadas de servidor**. No utilizar `NEXT_PUBLIC_` para ninguna clave.

## Atajos y funcionalidades

| Acción | Control |
|---|---|
| Buscador global | `Ctrl + K` / `Cmd + K` |
| Ayuda | `?` fuera de campos de entrada |
| Cerrar ventanas | `Esc` |
| Zoom gráfico | Rueda del mouse |
| Pan temporal | Arrastrar sobre las velas |
| Escala de precios / fechas | Arrastrar sobre el eje respectivo |
| Exportar SVG | Botón «Exportar» arriba del gráfico |
| Ajustar altura | Slider inferior |
| Guardar espacio en Neon | Iniciar sesión → «Guardar espacio» |
| Layout clásico/doble/triple | «Multi-Chart» |
| Favoritos | Panel derecho → Watchlist → estrella |

## Límites importantes para publicar

**NO se han integrado** órdenes bursátiles reales, motor de ejecución en tiempo real, liquidación automática de stops, ejecución de Pine Script ni la totalidad de los indicadores propietarios de TradingView. El backtesting simplificado puede tener sesgos de ejecución y no demuestra rentabilidad futura. El control de cuotas API es local al proceso; una instalación distribuida debería utilizar un rate limiter compartido y un feed licenciado.

- Para operar en demo con los activos nuevos del catálogo, puede ser necesario ejecutar `QUANTUM_V14_6_OPTIONAL_ASSET_SEED.sql` en tu base Neon, con respaldo y comprobando la rama.
- Si Twelve Data o Coinbase no responden, el gráfico puede entrar en modo sintético, siempre identificado. **No publiques una captura de datos sintéticos como cotización actual.**
- Antes de exponer el proyecto a usuarios reales, implementar verificación de correo, recuperación de contraseña, límites de intentos distribuidos, políticas de seguridad, monitoreo y pruebas end-to-end.
- Rotá las API keys o contraseñas que hayas compartido alguna vez en capturas o chats.

## Calidad comprobada en esta entrega

- `npm test`: comprobación matemática de 34 indicadores, adaptadores de datos con respuestas simuladas y estadísticas por rango / posicionamiento de operaciones.
- Verificación de sintaxis TypeScript/TSX a través de `typescript.transpileModule`.
- Verificación de archivo ZIP. **No equivale a build de producción**: debe ejecutarse `npm.cmd run build` en una máquina con las dependencias instaladas. No se ha conectado en estas pruebas con tu Neon real, Twelve Data ni Coinbase.

## Arquitectura resumida

- `components/V14Terminal.tsx`: orquestación del workspace.
- `components/V14Chart.tsx`: dibujo SVG, cursores y escalas.
- `components/QuantumCommand.tsx`: buscador global.
- `lib/indicators.ts`: biblioteca de estudios.
- `lib/market-stats.ts`: estadísticas por período.
- `lib/trade-placement.ts`: marcador temporal de las ejecuciones.
- `lib/market-feed.ts`: adaptadores de datos públicos.
- `app/api/*`: endpoints Next.js / servidor.
- `app/v15.css`: estilos de V15, aislados de versiones anteriores.

## Plan de demostración para LinkedIn

1. Abrí la portada en modo incógnito y elegí «Explorar como invitado».
2. Mostrá `Ctrl+K`, buscá AAPL o BTC/USD y seleccioná un activo.
3. Cambiá entre velas y línea, aplicá el preset Swing, buscá EMA 200.
4. Mostrá el zoom con rueda, las herramientas de dibujo y Multi-Chart.
5. Mostrá la watchlist con NYSE/Nasdaq/ETF/cripto y la etiqueta del origen de datos.
6. Iniciá sesión con **una cuenta demo sin datos personales reales**, mostrá la cartera y una operación virtual, luego exportá un SVG para la publicación.
7. Cerrá con Screener, Strategy Lab y una explicación transparente de limitaciones y decisiones de arquitectura.
