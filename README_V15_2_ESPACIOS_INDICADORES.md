# QUANTUM V15.2 — Mis espacios e indicadores personalizados

Esta versión corrige una limitación de V15.1: antes, el endpoint `/api/layouts` guardaba siempre sobre un solo espacio y solo recuperaba uno. Ahora permite **crear, listar, abrir, renombrar al guardar, eliminar y activar múltiples espacios** de la cuenta. Los datos se guardan en las tablas **ya existentes** `chart_layouts`, `user_indicators` y `chart_drawings`.

## Instalación en Neon — una tabla nueva

En Neon > SQL Editor (Primary > neondb), ejecutá el archivo **`QUANTUM_V15_2_INDICATOR_PRESETS.sql`**. Crea la tabla `indicator_presets`, dedicada a guardar fórmulas personalizadas con nombre. No borra tablas ni operaciones existentes.

La biblioteca de espacios no necesita ninguna migración adicional: utiliza las tablas creadas en QUANTUM V11 — Bloque 1.

## Ejecutar en Windows / PowerShell

1. Descomprimí este ZIP.
2. Copiá tu `.env.local` existente a `quantum-v7` (no compartas API keys).
3. Desde esa carpeta ejecutá:

```powershell
npm.cmd install
npm.cmd test
npm.cmd run build
npm.cmd run dev
```

Entrá a `http://localhost:3000/terminal` e iniciá sesión.

## Abrir tus espacios guardados

- En el encabezado del Terminal hacé clic en **Mis espacios**.
- Elegí **Abrir** para recuperar el gráfico, temporalidad, indicadores por gráfico y dibujos del espacio.
- Para crear otro, escribí un nombre y usá **Guardar como nuevo**.
- **Guardar espacio** actualiza únicamente el espacio actualmente abierto.
- El espacio que abrís o guardás pasa a ser el predeterminado para la próxima sesión.

**Limitación histórica:** V15.1 sobrescribía repetidamente el mismo registro al guardar. Si lo sobrescribiste, los estados anteriores ya no pueden recuperarse desde este código sin una copia o backup externo de Neon. A partir de V15.2, cada espacio creado por separado se conserva.

## Crear «Peter», un MACD personalizado

1. Abrí **Indicadores**.
2. En **Mis indicadores guardados**, buscá **Crear indicador con nombre**.
3. Nombre: `Peter`; tipo: `MACD`; rápida: `8`; lenta: `21`; señal: `5` (o tus parámetros).
4. Pulsá **Guardar indicador en Neon y aplicar**.
5. «Peter» aparece en la lista para ponerlo o quitarlo de cada gráfico; se recupera al volver a iniciar sesión.
6. Para conservar que esté *activo* en un determinado espacio, usá **Guardar espacio**.

También podés guardar EMA, SMA y RSI con un período personalizado. Los parámetros deben ser enteros entre 2 y 500; para MACD, rápida < lenta. Dos presets distintos no pueden compartir exactamente el mismo conjunto de parámetros en una cuenta, para evitar identificadores ambiguos en el gráfico.

## Comprobación de Neon

```sql
SELECT name, is_default, updated_at
FROM chart_layouts
ORDER BY updated_at DESC;

SELECT name, kind, code, params
FROM indicator_presets
ORDER BY updated_at DESC;
```

Las consultas anteriores inspeccionan datos. Para evitar mostrar espacios de otros usuarios en SQL Editor, filtrá por `user_id` si compartís la base con otras cuentas. En la aplicación, las API sí filtran estrictamente por el usuario autenticado.

## Alcance y pruebas

- Persistencia y recuperación de layouts: PostgreSQL/Neon, sesiones requeridas.
- Biblioteca de indicadores: tabla adicional `indicator_presets` y cálculos locales para EMA/SMA/RSI/MACD personalizables.
- Los indicadores creados son combinaciones parametrizadas de estos cálculos; no es todavía un editor de fórmulas arbitrarias ni compatibilidad Pine Script.
- No se incluyen credenciales ni `.env.local`.
- Los endpoints han sido revisados en código; **no se probó la conexión a tu Neon real ni un build Next.js completo en este entorno**.
