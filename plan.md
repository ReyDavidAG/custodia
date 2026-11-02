# Plan · Custodia

Qué sigue y en qué orden. Cada fase se aprueba antes de empezarla. El avance real vive en `state.md`.

## Fase 0 · Propuesta visual · lista para aprobar

Prototipo en `propuesta/` con datos de ejemplo (rutas con `#`).

| Ruta | Pantalla | Quién | Para qué |
|---|---|---|---|
| `/sign-in` | Entrar | Todos | Número de trabajador → "¿Eres tú?". |
| `/inventory` | Inventario | Soporte, contabilidad | Conteos por estado, búsqueda (folio, serie, modelo, persona), filtros, etiquetas. |
| `/assets/:folio` | Ficha | Todos (el colaborador sólo lo suyo) | Datos, quién lo tiene, carta, faltantes, historial y acciones. |
| `/handover` | Nueva entrega | Soporte | Persona → equipos → firma o foto; carta en vivo. Desde una solicitud llega precargada. |
| `/letters/:res` | Carta de resguardo | Todos (el colaborador sólo las suyas) | Documento con firma y sello; imprimir o guardar PDF. |
| `/assets/:folio/return` | Devolución | Soporte | Qué regresó, en qué estado y firma. |
| `/assets/:folio/retire` | Baja | Soporte, contabilidad | IT → contabilidad → El Trueque. |
| `/requests` | Solicitudes | Colaborador, soporte | Pedir equipo; aprobar y entregar o rechazar. |
| `/mine` | Mi equipo | Colaborador | Sus etiquetas, sus cartas, pedir y reportar fallas. |
| `/retirements` | Bajas por confirmar | Contabilidad | Cola de bajas. |

Estados: arranque, esqueletos, sin conexión, 404, vacíos.

## Fase 1 · Web de demostración (`custodia.client`)

### Base de datos (lista en `supabase/`)

Esquema `custodia` sobre el mismo Supabase. Orden en el proyecto:

1. Ya aplicadas: Chispa. Antes que esto: El Trueque (`trueque_init.sql` y su `seed.sql`).
2. SQL Editor: `supabase/migrations/20261103100000_custodia_init.sql`.
3. SQL Editor: `supabase/migrations/20261103110000_custodia_storage.sql` (bucket privado `custodia-evidence`).
4. Opcional: `supabase/seed_demo.sql` (área Sistemas de la organización de ejemplo, tipos y equipos).
5. **Project Settings → API → Exposed schemas**: agregar `custodia`.
6. Asignar roles: filas en `custodia.staff` (área administradora, persona) y `custodia.accountants`.

Detalle en `docs/database.md`.

### Librerías

Las mismas versiones fijas de `chispa.client` y su `.npmrc`. Fuentes con fontsource: Barlow Condensed, Figtree, IBM Plex Mono. Para la firma en pantalla, un `<canvas>` propio (sin librería); la evidencia se sube a Storage y se registra con su sha256 (`crypto.subtle.digest`).

### Estructura (la de `chispa.client`)

```
custodia.client/src/
  router/app_router.tsx
  layouts/{auth,protected}/                   el inicio depende del rol (mine · inventory · retirements)
  context/session/                            la misma sesión de Chispa
  pages/<module>/<feature>/<feature>_page.tsx inventory/list · assets/detail · handover/new · letters/detail · assets/return · assets/retire · requests/list · mine · retirements
  components/ui/                              combobox, asset_tag, barcode, signature_pad, evidence_field, stepper, stamp…
  components/<module>/                        inventory/kpis · assets/timeline · handover/person_picker · handover/letter_preview…
  hooks/<domain>/use_<name>.tsx               use_assets, use_custodies, use_requests, use_retirements, use_evidence
  schemas/<module>/<feature>/<name>.schema.ts handover, return, retire, request
  services/api/unit_of_services.ts
  constants/ · types/ · utils/ · styles/
```

| Repositorio | Lee | Escribe |
|---|---|---|
| `AssetRepository` | `custodia.asset_cards`, `asset_parts`, `asset_events` | alta y datos (`assets`, `asset_parts`), `rpc('set_repair')` |
| `CustodyRepository` | `custodies`, `custody_items`, `missing_parts` | `rpc('handover')`, `rpc('receive_return')` |
| `EvidenceRepository` | `evidences` + URL firmada de Storage | Storage + `evidences` |
| `RequestRepository` | `requests` | `requests` (colaborador), `rpc('reject_request')` |
| `RetirementRepository` | `retirements` | `rpc('retire')`, `rpc('confirm_write_off')`, `rpc('propose_to_trueque')`, `rpc('suggested_cacaos')` |

### Orden de trabajo

1. `feature/client-setup` · 2. `feature/inventory` · 3. `feature/handover` (firma, evidencia, carta) · 4. `feature/returns` · 5. `feature/requests` · 6. `feature/retirements` · 7. `/frontend-review`, pruebas con los tres roles, `release/0.2.0` y Vercel.

## Fase 2 · Producto (API .NET)

```
Custodia.Api/            Controllers V2 (Assets, Custodies, Evidences, Requests, Retirements)
Custodia.Application/    Features/<Entity>/{Commands,Queries,Handlers,Validators}
Custodia.Domain/
Custodia.Infrastructure/ EF Core sobre SQL Server; se extiende el módulo de activos existente y se migran sus registros
```

Las cartas viejas (evidencia en base64) se migran a archivos con su sha256. Auth0 sustituye la sesión simulada.

## Preguntas abiertas

1. ¿Se extiende el módulo de activos existente o se hace uno nuevo y se migra? ¿Qué aplicación lo llena hoy?
2. Evidencia: ¿basta firma en pantalla o se exige además la hoja firmada?
3. ¿Hay préstamos temporales (proyector por un día) además de resguardos?
4. ¿Qué pasa con el equipo de quien deja la empresa? (Propuesta: aviso a soporte con la lista de su carta, incluidas licencias.)
