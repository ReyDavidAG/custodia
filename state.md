# Estado · Custodia

Última actualización: 2026-11-02

## Dónde vamos

**Fase 0 · Propuesta visual: lista.** Prototipo completo en `propuesta/`.
**Fase 1 · Web de demostración: lista (v0.2.0).** Esquema `custodia` y bucket aplicados en Supabase y `custodia.client` probado en Chrome con los tres roles. Falta publicarlo en Vercel.

## Hecho

- Propuesta visual (`propuesta/`): inventario, ficha, entrega con firma, carta, devolución, baja en tres pasos, solicitudes, Mi equipo, bajas por confirmar y estados.
- Base de datos (`supabase/`): esquema `custodia` (área administradora, tipos, equipos, accesorios, evidencia con sha256, resguardo en cabecera y detalle, faltantes, solicitudes, historial y bajas), funciones, bucket privado `custodia-evidence`, RLS e integración con El Trueque. Prueba PGlite: 30 reglas en verde.
- `custodia.client`:
  - Entrar con la sesión compartida; inicio por rol (Mi equipo · Inventario · Bajas) y rutas protegidas por rol.
  - Inventario con conteos, búsqueda sin acentos con debounce y filtros por tipo y estado.
  - Ficha con datos, quién lo tiene, carta, historial y acciones (entregar, recibir, reparación, baja).
  - Nueva entrega: persona, equipos y firma en `<canvas>` o foto/PDF; precarga desde una solicitud o un equipo; la evidencia sube a Storage con su sha256 y se emite la carta.
  - Carta de resguardo con sello, firma por URL firmada e impresión.
  - Devolución con faltantes y estado; con daños va a reparación.
  - Solicitudes: pedir (Zod), aprobar y entregar, rechazar con motivo.
  - Baja en tres pasos con Zod; precio sugerido en cacaos y postulación a El Trueque.
  - Metadatos OG, íconos y manifiesto.
  - Revisado con `/frontend-review`; prettier, eslint y build en verde.
  - Probado en Chrome de punta a punta: entrega RES-0003 y RES-0004 con firma, devolución con cargador faltante, rechazo y aprobación de solicitudes, baja por IT, confirmación de contabilidad y postulación que aparece en el panel de RH de El Trueque. Sin desbordes de 320 a 768 px; consola limpia.

## Decisiones tomadas

- IT primero y extensible por área administradora; hardware y licencias en el mismo inventario.
- El estado del equipo sólo cambia con funciones que dejan carta, evidencia e historial.
- Un equipo sólo puede estar en una carta abierta.
- Baja: IT (datos borrados y cuentas retiradas) → contabilidad → El Trueque.
- Firma con `<canvas>` propio, sin librería.

## Pendiente

- Publicar en Vercel (raíz `custodia.client`, variables `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` y `VITE_SITE_URL`).
- Las cartas de la semilla no tienen archivo en Storage: muestran "La evidencia no está disponible".
- Sesión entre apps: entrar en otra app del ecosistema cierra la sesión de aquí (una sesión anónima por persona). Se resuelve con Auth0 en fase 2 o con sesiones por persona.
- "Reportar una falla" es un aviso; falta el flujo de incidencias.
