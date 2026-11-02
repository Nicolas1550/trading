# QUANTUM V15.1 — Runtime hotfix

Se corrigió un `ReferenceError: Cannot access favoriteSymbols before initialization` en `components/V14Terminal.tsx`.

Causa: `watchAssets=useMemo(...)` leía `favoriteSymbols` antes de su `useState`.

Solución: mover la declaración de `favoriteSymbols` antes de `watchAssets`. No se modifica la base Neon ni las claves de API.

## Ejecutar en PowerShell

```powershell
npm.cmd install
npm.cmd test
npm.cmd run build
npm.cmd run dev
```

Si la instalación anterior seguía funcionando, no es necesario volver a instalar dependencias.

## Pruebas realizadas

- `npm test`: PASS 34 indicators, feeds y market-stats.
- No pudo verificarse el build completo de Next.js en este entorno.
