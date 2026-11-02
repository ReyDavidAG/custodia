# Estado · Custodia

Última actualización: 2026-11-02

## Dónde vamos

**Fase 0 · Propuesta visual: lista para aprobar.** Prototipo completo en `propuesta/`.
**Fase 1 · Base de datos: lista.** Esquema `custodia` sobre el mismo Supabase, bucket de evidencias, semilla y prueba en verde (30 reglas). Falta aplicarlo y construir `custodia.client`.

## Hecho

- Propuesta visual (`propuesta/`):
  - Inventario, ficha con historial, nueva entrega con firma en pantalla y carta de resguardo en vivo, carta con sello, devolución parcial, baja en tres pasos con postulación a El Trueque, solicitudes, Mi equipo, bajas por confirmar.
  - Entrar, arranque, esqueletos, sin conexión, 404; tres roles.
- Base de datos (`supabase/`):
  - Esquema `custodia`: área administradora y su personal, tipos (hardware y licencias), equipos con ciclo de vida, accesorios, evidencia como archivo con sha256, solicitudes, resguardo en cabecera y detalle (como el módulo de activos existente), faltantes, historial y bajas.
  - Funciones: `handover`, `receive_return`, `set_repair`, `retire`, `confirm_write_off`, `suggested_cacaos`, `propose_to_trueque`, `reject_request`.
  - Integración con El Trueque: un equipo dado de baja se postula como producto; al canjearse su cupón, sale del inventario.
  - Bucket privado `custodia-evidence` con políticas.
  - RLS por rol y `docs/database.md`.
  - Prueba PGlite que aplica Chispa + El Trueque + Custodia: 30 reglas en verde.

## Decisiones tomadas

- IT primero y extensible por área administradora; hardware y licencias en el mismo inventario.
- El estado del equipo sólo cambia con funciones que dejan carta, evidencia e historial.
- Un equipo sólo puede estar en una carta abierta.
- Baja: IT (datos borrados y cuentas retiradas) → contabilidad → El Trueque.

## Siguiente

1. Aprobar la propuesta visual.
2. Aplicar (después de El Trueque) las dos migraciones en Supabase y exponer el esquema `custodia` (pasos en `plan.md`).
3. `custodia.client` según `plan.md`.
