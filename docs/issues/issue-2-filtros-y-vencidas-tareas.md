# Issue 2 · Filtros y vencidas en Tareas

**Asignada a:** Alex
**Labels:** `sprint-1`, `feature`

## Qué hay que hacer

En `assets/js/modules/tasks.js`:

1. **Filtros** por estado (pendiente/hecha), prioridad y asignatura.
2. Marcar automáticamente las tareas **vencidas** (fecha pasada y no hecha)
   con un estilo visible (por ejemplo, etiqueta "Vencida" en rojo).

## Criterios de aceptación

- [ ] Los tres filtros funcionan solos y combinados, y se pueden limpiar.
- [ ] Una tarea con fecha ayer y estado pendiente se ve como vencida.
- [ ] El filtro elegido se mantiene al volver a la vista (no se pierde).
- [ ] Sin `innerHTML`: usar `U.h()` del núcleo.
- [ ] `node tools/check.js` en verde y PR desde la rama `alex` hacia `main`.
