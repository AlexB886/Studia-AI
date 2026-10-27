# AGENTS.md · Studia-IA

Guía de trabajo para los agentes de IA del grupo. **Léela antes de tocar código.**
También sirve a las personas: si algo no encaja, habladlo.

---

## 0. Qué es este proyecto

**Studia-IA** es una web/app para estudiantes de la ECF: organización, pomodoro,
calendario, tareas, progreso, foro y un asistente ("Luna").

- Stack: **HTML + CSS + JavaScript clásico** (IIFE, `window.Studia`), **sin build
  y sin dependencias** en runtime.
- Debe funcionar con **doble clic (`file://`)**, con **XAMPP**
  (`http://localhost/htdocs_hecpiqbel/proyecto_grupo_prog/`) y publicado.
- Todo en **español** (textos, nombres de commits, documentación).
- Persistencia: `localStorage` (`studia.db.v1`), con capa `db.js` preparada para
  Supabase. **No** introduzcas dependencias ni frameworks.
- No hay login todavía: el plan "premium" es el modo de los creadores.

---

## 1. Lo primero: identifica tu rol

El miembro del grupo te dirá **"Soy Héctor"**, **"Soy Carles"**, **"Soy Joan"**
o **"Soy Alex"**. Si no lo dice, **pregunta antes de hacer nada**.

| Persona | Rama | Archivos asignados | Rol |
|---|---|---|---|
| **Héctor** | `hector` | `index.html`, `assets/js/main.js`, `assets/js/modules/ai.js`, `assets/js/modules/dashboard.js` + núcleo (`core/`) | Coordinación, publicación, Luna (IA) y Panel |
| **Carles** | `carles` | `assets/js/modules/calendar.js`, `assets/js/modules/schedule.js` | Calendario y Horario |
| **Joan** | `joan` | `assets/js/modules/study.js`, `assets/js/modules/progress.js` | Estudio (pomodoro) y Progreso |
| **Alex** | `alex` | `assets/js/modules/tasks.js`, `assets/js/modules/subjects.js`, `assets/js/modules/social.js`, `assets/js/modules/premium.js` | Tareas, Asignaturas, Comunidad y Premium |

Las tareas concretas de cada uno están en **`docs/roles-y-tareas.md`**. Léelo
completo al empezar y trabaja solo en tu parte.

---

## 2. Reglas duras (no negociables)

1. **Solo tocas tus archivos.** Si necesitas cambiar otro módulo, `core/` o
   `index.html`, **no lo hagas**: avisa a la persona y propón el cambio (Issue,
   comentario o mensaje). Así nadie pisa el trabajo de otro.
2. **`core/` es de Héctor** (`utils.js`, `ui.js`, `db.js`, `store.js`,
   `router.js`). Cualquier cambio ahí lo revisa él y exige `tests.html` en verde.
3. **Nunca subas directamente a `main`.** Trabaja en tu rama (`hector`,
   `carles`, `joan`, `alex`) y abre un **Pull Request** hacia `main`.
4. **Antes de proponer un commit**, ejecuta:

   ```bash
   node tools/check.js
   ```

   Debe salir en verde. Si tocas el núcleo, abre además **`tests.html`** en el
   navegador y comprueba que pasan las comprobaciones.
5. **Nada de `innerHTML` ni HTML construido a mano.** Usa `U.h()` con texto y
   `U.esc()` si hiciera falta. `tools/check.js` falla si aparece.
6. **No añadas librerías, CDNs ni `npm install`.** El proyecto es deliberadamente
   sin dependencias.
7. **Si cambias CSS o JS que carga `index.html`, sube la versión de caché**
   (`?v=...`, `<meta name="app-version">`, `APP_VERSION` en `main.js` y
   `package.json`). `node tools/check.js` avisa si no coinciden.

---

## 3. Cómo queremos trabajar con el agente

- **Ten ideas.** Si ves una mejora de UX, rendimiento o accesibilidad, proponla
  con una explicación breve y su coste/beneficio.
- **Pregunta si tienes dudas.** Antes de inventar comportamiento, pregunta a la
  persona; es preferible una pregunta a una funcionalidad que no querían.
- **Comenta las sugerencias** (en el PR, en la Issue o en el chat) para que el
  grupo decida. No apliques cambios grandes por tu cuenta.
- **Explica lo que haces**: qué archivos tocas, por qué, y cómo comprobarlo.
- **Nada de refactors masivos** sin pedirlo antes. Preferimos cambios pequeños,
  revisables y que no rompan la base `Web Base`.
- **Si encuentras un bug fuera de tu módulo**, no lo arregles: descríbelo y avisa.

---

## 4. Cómo comprobar tu trabajo

```bash
node tools/check.js        # sintaxis, assets, versiones, iconos, rutas, anti-XSS
```

Y en el navegador:

- `tests.html` → tests del núcleo (migraciones, copia de seguridad, racha, nivel,
  pomodoro, IA). Úsalo si tocas `core/` o algo relacionado.
- `index.html` → navega por **todas** las vistas y revisa la consola (F12).
- **Móvil**: DevTools → modo dispositivo a **360 px** y **390 px**. No debe haber
  scroll horizontal de página. (El horario sí tiene scroll interno a propósito.)
- Si publicas: la web debe abrir sin errores también desde `file://`.

**Definición de "hecho":** `check` en verde, sin errores de consola, bien en
escritorio y en móvil, y sin tocar archivos de otra persona.

---

## 5. Flujo de trabajo

```bash
git checkout main
git pull origin main
git checkout hector        # tu rama (o créala: git checkout -b hector)
# ... trabajar ...
node tools/check.js
git add .
git commit -m "feat(calendar): estado vacío cuando no hay eventos"
git push
# Abrir Pull Request hacia main
```

Formato de commit: `feat(<zona>): ...`, `fix(<zona>): ...`, `docs: ...`.
En español y explicando el "qué".

---

## 6. Mapa rápido del código

- `assets/js/core/utils.js`: `h()` (crear DOM), fechas, formato, `norm()`, `esc()`.
- `assets/js/core/store.js`: estado central, `update`, `subscribe`, migraciones,
  copia de seguridad, pomodoro persistido.
- `assets/js/core/router.js`: rutas `#/vista`; pinta en `#appMain`.
- `assets/js/core/ui.js`: modales, toasts, formularios, confirmaciones.
- `assets/js/core/db.js`: persistencia (local ⇄ Supabase).
- `assets/js/modules/*.js`: una vista por archivo; se registran con
  `Studia.router.register('nombre', { title, subtitle, render })`.
- `assets/js/data/seed.js`: datos de demostración.
- `docs/roles-y-tareas.md`: reparto y tareas actuales.
- `docs/backend.md`: plan para Supabase cuando toque.

---

## 7. Objetivo del grupo

Llegar a **junio de 2027** con la web publicada y algún ingreso, aunque sea
simbólico. Ahora mismo la prioridad es **pulir la app y publicarla**, no
rehacerla. Primero que se vea completa y funcione en móvil; después, login, base
de datos y cobro.
