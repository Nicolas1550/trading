# QUANTUM V15 · Changelog

## UX / diseño
- Comando global Ctrl+K, presets de análisis, barra de métricas compacta, nuevo sistema visual con capas, tipografía y estados de foco.
- Watchlist con favoritos, búsqueda y estados diferenciados de fuente, cotización e historial.
- Exportación de gráfico SVG, ayuda incorporada, portada con cuatro módulos funcionales.
- Panel de análisis técnico contextual y calculadora de riesgo/beneficio estimado.

## Datos y lógica
- Comparativos de mercado calculados sobre el período seleccionado (warmup conservado para indicadores).
- Alineación temporal de operaciones: no se pintan compras o ventas de otra fecha fuera del historial.
- ClipPath SVG con identificador único para evitar conflictos entre gráficos simultáneos.
- Guardado de layouts admite símbolos externos validados que provienen de búsqueda remota.
- Twelve Data solicita UTC para reducir ambigüedades al interpretar las fechas intradía.

## Endpoints
- Protección básica del origen de peticiones de autenticación y endpoints de inteligencia.
- Modelo del Copilot configurable con default documentado `gpt-4.1-mini` (disponibilidad y costos según proveedor).

## Pruebas
- smoke de 34 indicadores, feed Coinbase/Twelve Data con respuestas de prueba, estadísticas por período y marcador de trades.
- Falta validación completa del build y pruebas end-to-end con tus proveedores y tu Neon.
