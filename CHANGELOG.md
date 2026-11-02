# Cambios

## 0.1.0 · 2026-11-02

Primera versión de la propuesta.

- Prototipo navegable: inventario, ficha con historial, entrega con firma y carta de resguardo, devolución parcial, baja en tres pasos con postulación a El Trueque, solicitudes, Mi equipo y bajas por confirmar; entrar y estados de carga, error y 404.
- Esquema `custodia` en la base de Chispa: equipos con ciclo de vida, resguardos en cabecera y detalle, evidencia como archivo con sha256, solicitudes, historial, bajas y RLS; bucket privado de evidencias.
- Integración con El Trueque: postular equipo dado de baja y sacarlo del inventario al canjearse.
- Prueba del esquema con PGlite (30 reglas).
