# Issue 3 · Probar el pomodoro a fondo y estados de Progreso

**Asignada a:** Joan
**Labels:** `sprint-1`, `qa`, `polish`

## Qué hay que hacer

1. **Pomodoro (`study.js`)**: probar el ciclo completo y confirmar que la
   sesión se recupera bien: arrancar → recargar página → cerrar pestaña →
   volver → pausar → resetear. Anotar en la Issue cualquier caso roto.
2. **Progreso (`progress.js`)**: comprobar que mapa de calor, gráfico diario,
   horas por asignatura, racha e hitos se ven bien con **0 sesiones** y con
   muchas sesiones (100+ registros de prueba).

## Criterios de aceptación

- [ ] El pomodoro en marcha sobrevive a recargar y a cerrar la pestaña.
- [ ] Pausar y resetear se comportan como se espera (sin horas fantasma).
- [ ] Progreso con 0 sesiones muestra estados vacíos, no errores ni huecos.
- [ ] El `dashboard.js` de Héctor muestra bien racha/nivel/XP tras las pruebas.
- [ ] Resultados de las pruebas anotados en esta Issue (capturas si hay fallos).
- [ ] `node tools/check.js` en verde y PR desde la rama `joan` hacia `main`.
