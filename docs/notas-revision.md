# Notas de revisión · Studia-IA

Héctor revisa lo que llega a `main` y deja aquí lo que falta o se puede mejorar.
**Cada persona lee solo su sección** antes de empezar. Si no aparece tu nombre,
no tienes nada pendiente.

Última revisión: tras el PR #4 de Carles (versión 0.3.1).

---

## Carles · Calendario y Horario

**Verificado y correcto (no rehacer):**
- Horario `L–D`: cabecera y columnas quedan alineadas al píxel (7/7).
- Botones de editar/eliminar a 36 px en móvil: correcto.
- Estado vacío de la agenda: el botón "Añadir evento" funciona.

**Pendiente / fallos:**
- [ ] **FALLO (PR #4)**: el botón "Eliminar evento" del formulario de edición
      **no aparece nunca**. En `ui.js`, `formModal` fija su propio `onOpen` al
      final del objeto (`onOpen: function (api) { m = api; }`), así que el
      `onOpen` tuyo de `openEventForm` se sobrescribe y no llega a ejecutarse.
      Opciones: meter el botón dentro de `body:` (envuelve el `form` en un
      contenedor junto al botón) **o** añadir en `core/ui.js` una opción tipo
      `headerBody`/`beforeBody` a `formModal` (avisa a Héctor si prefieres
      esta, porque toca `core/`).
- [ ] **FALLO (PR #4)**: `removeEvent(e)` desde la lista de eventos ahora deja
      el modal de edición abierto encima (no se entera del borrado, porque el
      `refresh()` pasa antes de que el confirm se resuelva). Cierra los
      modales abiertos al confirmar (p. ej. `ui.closeAllModals()` en `core/`,
      cosa de Héctor) o reabrir menos cosas.
- [ ] El botón de "Añadir evento" solo está en el estado vacío de la agenda;
      en móvil el panel del día queda con "Sin eventos este día." sin botón
      (a 390 px el calendario es de puntos y no se ve). Añádelo también ahí.
- [ ] Mensajes de commit **en español** (lo pide `AGENTS.md`).

---

## Alex · Tareas, Asignaturas, Comunidad y Premium

**Verificado y correcto (no rehacer):**
- Filtro por prioridad: funciona (oculta las demás prioridades).
- Posponer vencida 7 días: funciona y actualiza la fecha.
- Guard `inited`: evita suscriptores duplicados al volver a la vista.

**Pendiente / sugerencias:**
- [ ] **Bug de CSS**: en `assets/css/views.css:454`, el selector
      `.task-filters .segmented` no aplica nunca porque el propio elemento
      tiene las dos clases. Cámbialo a `.segmented.task-filters` (o `.task-filters`).
- [ ] El `<select>` de prioridad no tiene `aria-label`: añádelo
      (`'aria-label': 'Filtrar por prioridad'`).
- [ ] `premium.js`: sigue diciendo "Activar Premium" / "Volver a Gratis".
      Ahora estamos en **modo creadores** (premium por defecto): deja claro
      que es acceso completo y quita o desactiva la opción de bajar a Gratis.
- [ ] (Opcional) Reindentar el bloque de filtros en `tasks.js`; hay líneas
      que han perdido la sangría.

---

## Joan · Estudio y Progreso

**Estado:** la rama `joan` todavía no tiene commits propios.

**Para empezar:**
- [ ] `git checkout main && git pull` y luego `git checkout joan`.
- [ ] `git merge main` para traer los últimos cambios (tareas, calendario...).
- [ ] Empieza por lo de `docs/roles-y-tareas.md`: pomodoro (arrancar, pausar,
      recargar, cerrar pestaña) y estados con 0 sesiones en `progress.js`.
- [ ] Prueba el pomodoro en un móvil real o en DevTools a 390 px.

---

## General

- Antes de cada push: `node tools/check.js` en verde.
- Si tocas `core/`: abre además `tests.html` y confirma que pasa.
- Al abrir un PR, avisa a Héctor. No fusiones tú a `main`.
- No toques archivos de otra persona: si hace falta un cambio ahí, avisa.
