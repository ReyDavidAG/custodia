# Cambios

## 0.2.0 · 2026-11-02

Web de demostración (`custodia.client`).

- React 19 + Vite + TypeScript + Tailwind v4 sobre el mismo Supabase, con la sesión compartida de Chispa e inicio según el rol.
- Inventario con conteos, búsqueda sin acentos y filtros; ficha con historial y acciones por rol.
- Entrega con firma en pantalla o foto/PDF: la evidencia sube a Storage con su sha256 y sale la carta de resguardo con sello.
- Devolución con faltantes y estado (con daños va a reparación).
- Solicitudes: el colaborador pide, soporte aprueba y entrega o rechaza con motivo.
- Baja en tres pasos (IT, contabilidad, El Trueque) y cola de contabilidad.
- Metadatos para compartir, íconos y manifiesto.
- Probado en Chrome con los tres roles y de 320 a 768 px sin desbordes.

## 0.1.0 · 2026-11-02

Primera versión de la propuesta.

- Prototipo navegable: inventario, ficha con historial, entrega con firma y carta de resguardo, devolución parcial, baja en tres pasos con postulación a El Trueque, solicitudes, Mi equipo y bajas por confirmar; entrar y estados de carga, error y 404.
- Esquema `custodia` en la base de Chispa: equipos con ciclo de vida, resguardos en cabecera y detalle, evidencia como archivo con sha256, solicitudes, historial, bajas y RLS; bucket privado de evidencias.
- Integración con El Trueque: postular equipo dado de baja y sacarlo del inventario al canjearse.
- Prueba del esquema con PGlite (30 reglas).
