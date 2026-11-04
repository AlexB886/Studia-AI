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

- [x] El pomodoro en marcha sobrevive a recargar y a cerrar la pestaña.
- [x] Pausar y resetear se comportan como se espera (sin horas fantasma).
- [x] Progreso con 0 sesiones muestra estados vacíos, no errores ni huecos.
- [x] El `dashboard.js` de Héctor muestra bien racha/nivel/XP tras las pruebas.
- [x] Resultados de las pruebas anotados en esta Issue (capturas si hay fallos).
- [x] `node tools/check.js` en verde y PR desde la rama `joan` hacia `main`.

## Resultados de la revisión · 4 nov 2026

Rama `joan` actualizada con `main` (0.4.0, rediseño de la interfaz). La revisión
no encontró fallos en pomodoro ni en el panel; sí dos mejoras de consistencia en
Progreso, ya aplicadas en `progress.js`.

**Comprobaciones automáticas**
- `node tools/check.js`: verde.
- `tests.html`: 20/20 comprobaciones del núcleo.
- Pruebas de esta Issue con un arnés temporal (sin tocar el proyecto), en
  Chromium headless y con `localStorage` real.

**Pomodoro**
- Arrancar guarda `running` y `endAt`; recargar conserva el tiempo restante (no
  vuelve a 25:00) y el botón pasa a "Continuar".
- Pausar conserva el tiempo y no crea sesiones; reset vuelve al total y no deja
  horas fantasma.
- Pomodoro terminado con la app cerrada: al abrir registra **1** sesión de 25
  min, pasa al descanso corto y suma la racha. Al recargar otra vez **no** se
  duplica.
- Nota de comportamiento: al recargar/cerrar, `pagehide` deja el pomodoro en
  pausa con el tiempo restante (no sigue contando en segundo plano). Es lo que
  hace hoy el código; si se quiere que siga corriendo, habría que cambiarlo.
- **Arreglado:** el anillo del temporizador se creaba con `U.h` (nodos HTML) y
  el navegador no pintaba los círculos. Ahora `study.js` usa el namespace SVG,
  igual que los gráficos de Progreso.

**Progreso**
- Con 0 sesiones: el gráfico avisa "Aún no hay sesiones en este periodo", el
  reparto muestra su estado vacío, el total sale en minutos ("0 min", no "0 h")
  y no aparece ningún `NaN`/`undefined`.
- Con 120 sesiones repartidas en 88 días: pinta línea, 30 puntos, 5 barras por
  asignatura y el mapa de calor completo (16 × 7 = 112 celdas), sin errores.
- Los ids de degradado de los SVG son únicos al renderizar dos gráficos.
- **Arreglado:** los gráficos se creaban con `U.h`, que genera nodos HTML; dentro
  de un `<svg>` el navegador solo pintaba las etiquetas y se saltaba la línea y
  las barras. Ahora `progress.js` crea los nodos SVG con `createElementNS`: se
  ven la línea de progresión y las barras por asignatura.
- **Arreglado:** las sesiones sin asignatura ya entran en "Reparto por
  asignatura" con una barra "Sin asignatura". Antes desaparecían y las barras no
  sumaban el total del rango.
- **Arreglado:** el mapa de calor se calcula desde las sesiones (no solo desde
  `streak.history`) y la última columna es la semana actual. Antes podía acabar
  hasta 6 días antes de hoy y no pintar las sesiones de esta semana.

**Panel**
- Racha, nivel y XP coinciden con el `store` (nivel 41 y mejor racha 88 en los
  datos de prueba) y no hay `NaN`/`undefined`.

**Móvil (DevTools/CDP, viewport real)**
- Estudio y Progresión a **390 px** y **360 px**: sin scroll horizontal de
  página, sin elementos desbordados y sin excepciones en consola.
