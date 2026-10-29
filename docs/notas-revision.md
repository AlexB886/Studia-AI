# Notas de revisión · Studia-IA

Héctor revisa lo que llega a `main` y deja aquí lo que falta o se puede mejorar.
**Cada persona lee solo su sección** antes de empezar. Si no aparece tu nombre,
no tienes nada pendiente.

Última revisión: tras fusionar los PR de Carles y Alex (versión 0.3.1).

---

## Carles · Calendario y Horario

**Verificado y correcto (no rehacer):**
- Borrar evento con confirmación: funciona y desaparece del calendario.
- Horario `L–D`: cabecera y columnas quedan alineadas al píxel (7/7).

**Pendiente / sugerencias:**
- [ ] Mensajes de commit **en español** (lo pide `AGENTS.md`). Ejemplo:
      `fix(schedule): alinear los días de lunes a domingo`.
- [ ] Los botones de editar/eliminar del evento miden 28 px. En móvil se
      quedan pequeños: súbelos a **34–36 px** (o añade una regla en
      `views.css` para pantallas táctiles). Comprueba que no rompe la fila.
- [ ] Prueba rápida en móvil (360 px): crear, editar y borrar un evento.

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
