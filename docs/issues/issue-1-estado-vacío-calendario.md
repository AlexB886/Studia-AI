# Issue 1 · Estado vacío en el calendario

**Asignada a:** Carles
**Labels:** `sprint-1`, `feature`, `mobile`

## Qué hay que hacer

En `assets/js/modules/calendar.js`, cuando no haya eventos en la semana
mostrada, la vista no debe quedarse en blanco: hay que añadir un **estado
vacío con acción**, por ejemplo:

> "No hay eventos esta semana. **Añadir evento**" (botón que abre el modal
> de creación de evento).

## Criterios de aceptación

- [ ] Semana sin eventos → se ve el mensaje y el botón, no un hueco vacío.
- [ ] El botón abre el modal de crear evento y al guardar, el evento aparece.
- [ ] Revisado en móvil a 360 px y 390 px sin scroll horizontal de página.
- [ ] Sin `innerHTML`: usar `U.h()` del núcleo.
- [ ] `node tools/check.js` en verde y PR desde la rama `carles` hacia `main`.
