# Studia-IA

Prototipo v0 de la web/app para estudiantes de la ECF (organización, estudio, racha y progresión).
Construido a partir del documento de ideas del grupo.

> **Estado: prototipo navegable.** Todos los datos se guardan en el navegador
> (`localStorage`). La capa de persistencia ya está preparada para connectarse a
> Supabase (ver *Datos y persistencia*).

---

## 1. Cómo abrir la app

Cualquiera de estas tres opciones funciona:

| Opción | Pasos |
|---|---|
| **Doble clic** | Abre `index.html` en el navegador. Funciona sin servidor. |
| **XAMPP / Apache** | Copia la carpeta a `htdocs` (ya está en `htdocs_hecpiqbel/proyecto_grupo_prog`) y entra en `http://localhost/htdocs_hecpiqbel/proyecto_grupo_prog/`. |
| **Servidor propio** | `python3 -m http.server 8000` dentro de la carpeta y abre `http://localhost:8000`. |

No hay `npm install`, ni build, ni dependencias: es HTML + CSS + JavaScript plano.
Eso es deliberado para que cada miembro del equipo pueda trabajar su módulo
sin romper a los demás.

### Atajos de teclado

| Atajo | Acción |
|---|---|
| `/` | Ir al buscador global |
| `t` | Vista Estudio (pomodoro) |
| `c` | Vista Calendario |
| `h` | Vista Horario |

---

## 2. Qué hay dentro

| Módulo | Ruta | Qué hace |
|---|---|---|
| **Panel** | `#/dashboard` | Resumen del día, agenda, tareas, progreso y accesos rápidos. |
| **Calendario** | `#/calendar` | Vista mensual + agenda. Eventos (examen, clase, entrega, bloque de estudio), días festivos por comunidad, CRUD completo. |
| **Horario** | `#/schedule` | Rejilla semanal L–V (o L–D), clases y laboratorios, detección de solapamientos, reparto de horas por asignatura. |
| **Estudio** | `#/study` | Pomodoro configurable (foco/descansos/ciclos), registro de sesiones, objetivo diario, avisos de fin de sesión. |
| **Progresión** | `#/progress` | Línea de progresión (gráfico de minutos/día), reparto por asignatura, mapa de calor de 16 semanas, hitos y recompensas por racha, nivel y XP. |
| **Asignaturas** | `#/subjects` | Asignaturas, apuntes, enlaces directos a Word/Excel, subida de documentos y vídeos. |
| **Tareas** | `#/tasks` | Listado por estado/asignatura, prioridad, fecha de entrega, vencimientos. |
| **Luna (IA)** | `#/ai` | Chat con memoria de tu contexto, motor de respuestas local, test inicial de conocimientos, personalización del robot. |
| **Social** | `#/social` | Foro de clase: publicar, compartir apuntes, me gusta y respuestas. |
| **Premium** | `#/premium` | Comparativa Gratis/Premium y activación en modo demo. |

### Racha y recompensas

Un día cuenta como estudiado si se registra al menos 1 minuto. La racha actual
empieza a contar desde ayer si todavía no has estudiado hoy. Los hitos
(3, 7, 14, 30, 60 y 100 días) están definidos en `assets/js/data/rewards.js` y
se desbloquean automáticamente al completar sesiones.

---

## 3. Estructura del proyecto

```
proyecto_grupo_prog/
├── index.html                 # esqueleto de la app + sprite de iconos SVG
├── assets/
│   ├── css/
│   │   ├── base.css           # variables, reset, tipografía, utilidades
│   │   ├── layout.css         # sidebar, topbar, rejillas, responsive
│   │   ├── components.css     # tarjetas, botones, formularios, modales…
│   │   └── views.css          # estilos de cada módulo (calendario, horario…)
│   ├── js/
│   │   ├── core/
│   │   │   ├── utils.js       # DOM (h), fechas, formato  ← base de todo
│   │   │   ├── ui.js          # modales, toasts, formularios
│   │   │   ├── db.js          # persistencia (local ↔ supabase)
│   │   │   ├── store.js       # estado central + selectores
│   │   │   └── router.js      # enrutado por hash
│   │   ├── data/
│   │   │   ├── holidays.js    # festivos y cálculo de la pascua
│   │   │   ├── rewards.js     # hitos por racha
│   │   │   └── seed.js        # datos de demostración
│   │   ├── modules/           # un archivo por módulo (¡aquí se reparte el trabajo!)
│   │   │   ├── dashboard.js   calendar.js  schedule.js  study.js  progress.js
│   │   │   ├── subjects.js    tasks.js     ai.js        social.js  premium.js
│   │   ├── main.js            # arranque: tema, buscador, recordatorios, atajos
│   └── img/favicon.svg
└── README.md
```

**Regla de oro:** cada módulo es un archivo autónomo dentro de `assets/js/modules/`
y se registra en el router con una línea:

```js
Studia.router.register('mi-modulo', {
  title: 'Mi módulo',
  subtitle: 'Descripción corta',
  render: function (root) { /* pintar aquí */ }
});
```

Si dos personas tocan el mismo archivo, se producirán conflictos. **Por eso
cada quien trabaja en su rama.**

---

## 4. Datos y persistencia

Ahora mismo todo vive en `localStorage` bajo la clave `studia.db.v1`:

```js
{
  profile:   { name, university, plan: 'free'|'premium', ... },
  settings:  { theme, dailyGoal, pomodoro:{work,short,long,cycle}, holidayRegions[] },
  subjects:  [ { id, code, name, color, teacher, credits } ],
  tasks:     [ { id, subjectId, title, due, priority, done } ],
  events:    [ { id, type:'exam'|'class'|'deadline'|'study'|'other', date, start, end } ],
  timetable: [ { id, day:0..4, start:'08:00', end:'09:30', subjectId, room } ],
  sessions:  [ { id, date, minutes, subjectId, mode:'pomodoro'|'free' } ],
  notes:     [ { id, subjectId, type:'link'|'file'|'video', title, url } ],
  forum:     [ { id, author, text, likes, replies[] } ],
  streak:    { history: { '2026-10-21': 95 }, best },
  xp:        780
}
```

### Cómo conectar Supabase en el futuro

`assets/js/core/db.js` ya define la interfaz que usan los módulos:
`load()`, `save()`, `select()`, `insert()`, `update()`, `remove()`.
Para migrar a Supabase basta con rellenar el `supabaseAdapter` (ya está escrito
como esqueleto) y llamar a `Studia.db.use('supabase')` + `Studia.db.configureSupabase(cliente)`.
**Los módulos no necesitan cambiar.**

### Detalle de la IA

El chat de Luna usa un motor de respuestas **local** (`assets/js/modules/ai.js`)
que consulta tus propios datos (tareas, exámenes, racha, apuntes). Cuando exista
la API real (la del proyecto "Luna" que menciona el documento), se sustituye la
función `reply()` por una llamada al backend y se mantiene la interfaz tal cual.

---

## 5. Plan de ramas

Ramas creadas a partir de este prototipo:

| Rama | Responsable | Contenido |
|---|---|---|
| `main` | todos | Prototipo v0 (esta base) |
| `feature/calendar` | — | Mejoras del calendario (semana, arrastrar y soltar, exportar) |
| `feature/schedule` | — | Horario (importar desde la universidad, avisos de cambios) |
| `feature/study` | — | Pomodoro (notificaciones reales, música, resúmenes) |
| `feature/progress` | — | Progresión (más métricas, exportar, comparar con el aula) |
| `feature/ai` | — | Conectar la API real de IA + memoria persistente |
| `feature/social` | — | Chat privado en tiempo real, subida real de ficheros |
| `feature/premium` | — | Pagos (Stripe) y control de anuncios |
| `feature/supabase` | — | Migrar la persistencia a Supabase |

### Flujo de trabajo

```bash
git clone <repo> && cd proyecto_grupo_prog
git checkout feature/calendar        # o el módulo que te toque
# ... trabajas tu módulo ...
git add assets/js/modules/calendar.js
git commit -m "feat(calendar): vista semanal y exportar a .ics"
git push origin feature/calendar
# y se abre una Pull Request hacia main
```

Reglas para evitar conflictos:
1. **Un módulo = una rama.** No toques archivos de otros módulos.
2. Si necesitas tocar `core/` (utils, store, ui), avisa antes en el chat del grupo:
   son los ficheros que todo el mundo usa.
3. Los estilos de un módulo van en `assets/css/views.css`, en su bloque commented.
4. Antes de fusionar: `git pull origin main` y vuelve a probar la app entera.

---

## 6. Ideas del documento que aún no están implementadas

Pendientes para las próximas iteraciones:

- [ ] Subida real de ficheros y vídeos (hoy solo se guarda la referencia).
- [ ] Chats privados en tiempo real y notificaciones push.
- [ ] Compartir contenido de redes sociales (importar notas de Instagram/TikTok).
- [ ] Plan de verano/vacaciones y plan de idiomas (el motor de Luna ya los menciona).
- [ ] Recomendaciones automáticas a futuro.
- [ ] Modo "examen" a pantalla completa con cronómetro y corrección.
- [ ] Buscador de exámenes anteriores por asignatura (banco de preguntas ampliable:
      el que ya hay en `ai.js` es la base).

---

## 7. Limitaciones conocidas del prototipo

- Los datos son **locales al navegador**: si borras los datos del navegador, se pierde todo.
- No hay usuarios ni contraseñas: el perfil es único y local.
- La IA es local (no consume tokens ni llama a ningún servidor).
- Los ficheros "subidos" no se guardan: solo la ficha del apunte.
