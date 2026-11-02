# QUANTUM V14.5 — Interactive Charts + Multi-Chart

Esta actualización conserva las rutas, servicios y estructura de QUANTUM V14.4. **No requiere ninguna migración nueva en Neon.**

## Cambios

- Rueda sobre el gráfico: zoom horizontal centrado cerca del cursor.
- Arrastrar dentro del área de velas: desplazar el historial (pan).
- Arrastrar los rótulos del eje inferior (fechas): ampliar o reducir la escala temporal.
- Arrastrar el eje derecho (precios): ampliar o reducir la escala vertical.
- Rueda directamente sobre el eje de precios: zoom vertical.
- `+`, `−`, deslizador y «Restablecer» siguen disponibles en el pie del gráfico.
- Se evita la selección accidental del texto de precios/fechas cuando se arrastra.
- Autoescala basada en las velas **visibles** y las líneas de indicadores cercanas al precio; operaciones antiguas y stops alejados ya no comprimen las velas. Un marcador o una entrada fuera de escala se identifica explícitamente, sin presentarlo a una cotización falsa.
- Botón visible **Multi-Chart** en el toolbar, con selector ilustrado de 1, 2 y 3 gráficos. Al activar 2 o 3 se colapsa el panel derecho para priorizar las velas; «Panel» lo vuelve a abrir.
- Cada panel tiene su selector de activo independiente; los indicadores de cada panel también se pueden configurar de manera independiente.
- Los layouts siguen persistiendo en el navegador y se pueden guardar en Neon desde «Guardar espacio».

## Instalar en Windows (PowerShell)

1. Extraer el ZIP.
2. Copiar el `.env.local` de QUANTUM anterior a la carpeta `quantum-v7` (no incluir la clave en repositorios ni enviarla por chat).
3. Ejecutar en `quantum-v7`:

```powershell
npm.cmd install
npm.cmd run build
npm.cmd run dev
```

4. Abrir http://localhost:3000/terminal

## Prueba manual sugerida

1. Elegir un activo con datos suficientes y mover la rueda encima de la zona de velas: deben cambiar la cantidad de velas visibles, no el tamaño de letra del navegador.
2. Arrastrar horizontalmente sobre las velas: deben desplazarse las fechas sin seleccionar el texto.
3. Arrastrar sobre los nombres de los meses/días en el eje inferior: deben cambiar el ancho de las velas.
4. Arrastrar sobre los precios del eje derecho: debe cambiar la escala vertical y la altura aparente de las velas.
5. Seleccionar «Multi-Chart», activar 2 gráficos y elegir símbolos diferentes en cada uno. Cambiar a 3 y volver a 1.
6. Comprobar el tooltip de marcadores B/S y la banda de entrada, particularmente si la compra está lejos del rango visible.
7. Cambiar el tamaño de pantalla y comprobar la distribución adaptable.

## Estado de validación

- Se verificó la estructura del ZIP y la sintaxis de los 34 archivos TypeScript/TSX con TypeScript transpile.
- La prueba existente de 34 indicadores (`npm run test:indicators`) pasó con 300 velas OHLCV.
- **No se validó el build de Next.js** en este entorno porque `npm install` no pudo alcanzar `registry.npmjs.org` (`EAI_AGAIN`). Ejecutar `npm.cmd run build` en Windows y comunicar cualquier error.
- La funcionalidad de trading sigue siendo *paper trading*; los stops visuales no cierran automáticamente las posiciones. Las cotizaciones pueden ser diferidas o sintéticas según la disponibilidad de Twelve Data.
