# QUANTUM V11.1 — Primera integración sobre V10

Esta entrega conserva la funcionalidad de V10 y agrega:
- Acceso de cuenta explícito: «Iniciar sesión / Registrarse» en lugar de Q.
- Preferencias de indicadores persistidas en localStorage de este navegador.

**No** implementa aún el nuevo motor de órdenes, los indicadores adicionales, ni sincronización de layouts con Neon. Las 14 tablas V11 existentes no se modifican ni se usan todavía.

Instalación: copiar `.env.local` de tu proyecto local de forma privada; `npm.cmd install`; `npm.cmd run build`; `npm.cmd run dev`.

Advertencia: el gráfico de V10 usa datos demo cuando la API no responde; los stops no se ejecutan automáticamente y el precio de operaciones es suministrado por el cliente. No utilizar para trading real.
