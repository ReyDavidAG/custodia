# CLAUDE.md

Guía para Claude Code en este repositorio. Es la fuente de verdad del proyecto; `plan.md` dice **qué sigue** y `state.md` dice **dónde vamos**.

## Qué es Custodia

El inventario y préstamo de equipo: qué tiene la empresa, **quién lo tiene, desde cuándo y con qué evidencia**. Cada entrega sale con su **carta de resguardo** firmada; cada devolución, total o parcial, queda anotada; el colaborador pide equipo desde aquí; y un equipo dado de baja que todavía sirve se **postula a El Trueque**.

Es parte de un ecosistema de tres apps que comparten base de datos y personas:

| App | Repo | Qué hace |
|---|---|---|
| **Chispa** | `chispa` | Feria de innovación (retos y chispas). |
| **El Trueque** | `trueque` | Tienda de cacaos y cupones. Recibe los equipos dados de baja. |
| **Custodia** | este | Inventario, resguardos, solicitudes y bajas. |

Es una propuesta personal para presentar a la dirección. **No es un sistema oficial todavía** y no corre en servidores de la empresa. Nunca datos de personas reales. El contexto interno vive en `CLAUDE.local.md` (no se publica).

### Objetivos

1. Saber en segundos quién tiene cada equipo, con su carta y su firma.
2. Que una entrega tome menos de 2 minutos: persona → equipos → firma.
3. Que ninguna devolución se pierda: lo que falta queda anotado y lo dañado va a reparación.
4. Que una baja no se salte pasos: IT borra datos y retira cuentas → contabilidad da la baja del activo → si sirve, El Trueque.
5. Que el colaborador vea lo que tiene a su nombre y pida lo que necesita.

### Vocabulario

| Pantalla | Código | Qué es |
|---|---|---|
| Equipo | `asset` | Hardware o licencia. Folio `EQ-0000` / `LIC-0000`. |
| Etiqueta | `asset_tag` (UI) | La tarjeta del equipo, como la etiqueta de inventario física. |
| Carta de resguardo | `custody` | La entrega a una persona, con uno o más equipos. Folio `RES-0000`. |
| Evidencia | `evidence` | Firma en pantalla, foto o PDF de la hoja firmada. |
| Solicitud | `request` | Lo que pide un colaborador. Folio `SOL-0000`. |
| Baja | `retirement` | Fin de vida útil, en tres pasos. |
| Área administradora | `asset_area` | Quien administra los equipos (hoy Sistemas). |

Estados del equipo: `stock` (En almacén) · `assigned` (Asignado) · `repair` (En reparación) · `retired` (Dado de baja) · `trueque` (En El Trueque) · `disposed` (Salió del inventario).

### Roles

| Rol | Puede |
|---|---|
| Colaborador | Ver su equipo y sus cartas, pedir equipo, reportar fallas. |
| Soporte (área administradora) | Inventario de su área, entregas, devoluciones, reparación, solicitudes, baja técnica y postular a El Trueque. |
| Contabilidad | Ver el inventario y confirmar la baja del activo. |

### Decisiones tomadas

- **IT primero, extensible**: los equipos cuelgan de un área administradora, como el módulo de activos existente, para que después entren otras áreas sin rehacer nada.
- Hardware **y licencias/cuentas** en el mismo inventario (son lo que más se olvida en una baja de personal).
- La evidencia es **archivo** (Storage) con su sha256, no base64 en la tabla.
- La baja a El Trueque la autorizan **IT y luego contabilidad**.

## Fases

| Fase | Qué | Dónde corre |
|---|---|---|
| 0 · Propuesta visual | Prototipo navegable en HTML/CSS/JS sin compilación. | `propuesta/` local |
| 1 · Web de demostración | `custodia.client` (React + Vite + Tailwind) sobre el mismo Supabase. | Vercel + Supabase |
| 2 · Producto | API .NET + SQL Server + Auth0; se extiende el módulo de activos existente. | Por definir |

Login simulado igual que Chispa (número de 5+ dígitos y "¿Eres tú?"), misma sesión. Datos detrás de repositorios con interfaz.

## Estructura

```
./
  CLAUDE.md  plan.md  state.md
  propuesta/                  Fase 0: prototipo estático
  supabase/migrations/        Esquema custodia (requiere Chispa y El Trueque) + bucket de evidencias
  supabase/tests/             Prueba con PGlite: aplica Chispa + El Trueque + Custodia (npm run check)
  docs/database.md            Por qué cada tabla, RLS, integración y paso a SQL Server
  custodia.client/            Fase 1 (aún no existe)
  Custodia.Api/ .Application/ .Domain/ .Infrastructure/   Fase 2 (aún no existe)
```

```bash
cd propuesta && python3 -m http.server 5184          # prototipo
cd supabase/tests && npm install --ignore-scripts && npm run check   # busca ../Chispa y ../Trueque (CHISPA_DIR, TRUEQUE_DIR)
```

## Convenciones

Las mismas de Chispa y El Trueque:
- Respuestas en español; código en inglés.
- Sin comentarios en el código.
- Commits de una línea.
- `/frontend-review` antes de cada commit de front.
- Rutas en inglés.
- Una migración nueva por cambio, con su explicación y la prueba en verde.
- Todo vive en el esquema `custodia`; de `public` sólo se lee. Hacia El Trueque sólo se llama `trueque.create_product_from_asset`.

### Diseño

- Móvil primero (320 a 1280 px), tokens para todo color y tipografía, sin `<select>` nativo, AA y foco visible.
- Tipografía: **Barlow Condensed** (títulos en mayúsculas, rotulación de almacén), **Figtree**, **IBM Plex Mono**.
- Piezas de identidad: la **etiqueta de activo** manila con perforación, folio y código de barras; la **carta de resguardo** con firma y sello.
- Sobria: un acento (añil) y color por estado.

## Cómo se trabaja y Git

Igual que Chispa: se acuerda en `plan.md`, se actualiza `state.md`, se prueba en el navegador. Gitflow (`main`, `develop`, `feature/*`, `release/*`, `hotfix/*`). Repo **público**: nada interno; lo privado en `CLAUDE.local.md`, `docs/local/` y `.git/info/exclude`.
