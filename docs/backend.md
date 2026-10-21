# Base de datos: qué es, qué opciones hay y cuál elegimos

Documento para decidir en grupo. **No hace falta tocar nada de esto para seguir
desarrollando el prototipo**: hoy la app funciona sin servidor y sin coste.

---

## 1. Dónde viven los datos ahora mismo

Ahora todo se guarda en el **navegador** (`localStorage`, clave `studia.db.v1`):

```
Datos en el navegador          →  se pierden al borrar el historial
Un solo dispositivo             →  no se ven en el móvil y en el portátil a la vez
Un solo usuario                 →  no hay contraseñas ni perfiles
El foro y el chat son "ficticios"→  solo los ve quien abre esa misma copia
```

Esto está **perfectamente bien para un prototipo**: cero costes, cero cuentas,
cero configuración, y se demuestra la idea en 5 minutos.

En cuanto queramos que la app sea "de verdad" (que la use alguien en su
móvil, que se cree una cuenta, que el foro sea compartido) necesitamos un
**backend**: una base de datos en la nube + algo que la consulte.

---

## 2. Las tres piezas de un backend

| Pieza | Para qué sirve | Ejemplo en nuestra app |
|---|---|---|
| **Base de datos** | Guardar las tablas (asignaturas, tareas, sesiones...) | `sessions`, `tasks`, `events` |
| **Autenticación** | Saber quién es el usuario (registro/login) | "Iniciar sesión con mi correo" |
| **Almacenamiento de ficheros** | Guardar PDFs, vídeos y apuntes subidos | Apuntes de Cálculo |

También hará falta una **API** (puerta de entrada) para que el navegador
pregunte y reciba datos. Con Supabase esa API ya viene hecha, es lo que se
llama "REST" y funciona con `fetch` normal.

---

## 3. Opciones (y por qué no las otras)

| Opción | Coste | Ventajas | Inconvenientes |
|---|---|---|---|
| **Seguir con `localStorage`** | 0 € | Ya está hecho, sin mantenimiento | No hay cuentas ni datos compartidos |
| **PHP + MySQL (XAMPP)** | 0 € en local, hosting desde ~5 €/mes | Lo aprendéis en clase, control total, ya lo tenéis instalado | Tenéis que escribir y **asegurar** el backend a mano (contraseñas, inyecciones SQL). En XAMPP solo funciona en el portátil: para publicarlo necesitáis un servidor de verdad |
| **Supabase** (PostgreSQL + auth + ficheros) | 0 € hasta ~500 MB; luego ~10-25 €/mes con pausa | Base de datos **estándar y real**, login ya hecho, subida de ficheros ya hecha, panel visual para ver los datos, hosting web gratis incluido | Hay que crearse una cuenta y conectar la clave (es un rato de trabajo) |
| **Firebase** (Google) | 0 € con límites muy bajos ya | Muy rápido de montar | Los datos se guardan en "documentos" y no en tablas: en cuanto hacen falta consultas o informes, se complica. Cobrar es caro y salir de Firebase también |
| **Moodle / Nextcloud ya instalado** | depende | Reutilizar lo que ya hay | Es reinventar la rueda; los alumnos no quieren studying en otra plataforma |

### Recomendación: **Supabase**, cuando llegue el momento

Motivos:

1. **Gratis al principio.** 500 MB de base de datos, 1 GB de ficheros, 50 000
   usuarios al mes, 2 proyectos. Para un grupo de 100-300 estudiantes cabe de
   sobra. Y tiene **"pausar proyecto"**: si no lo usáis un mes, no se cobra.
2. **Sin mantenimiento.** No hay que contratar un servidor ni actualizar
   parches: ellos lo hacen.
3. **SQL de verdad.** Lo que aprendáis sirve para cualquier otra web (y si
   mañana queréis cambiar, os lleváis los datos tal cual).
4. **Resuelve las tres piezas de golpe**: tablas, login y ficheros.
5. **Datos en la UE** (región de Fráncfort), importante si vais a publicar en
   España por el RGPD.

El ODT ya mencionaba Supabase, así que el camino natural es ese. Además
**la app ya está preparada**: el módulo `assets/js/core/db.js` tiene un
adaptador de Supabase escrito, así que la migración no toca los módulos.

---

## 4. Qué habría que cambiar en el código

Hoy los módulos hablan con `store`, y `store` habla con `db`. Al migrar:

```
ahora:     módulo → store → db → localStorage
después:   módulo → store → db → Supabase
                                   ↑
                    (solo cambia este fichero)
```

```js
// assets/js/core/db.js (extracto del esqueleto ya existente)
Studia.db.configureSupabase({
  url: 'https://tuproyecto.supabase.co',
  key: 'CLAVE_PUBLICA_ANON'
});
Studia.db.use('supabase');
```

Los módulos (`calendar.js`, `study.js`...) **no se tocan**.

Añadir el login es otra cosa (una pantalla de entrada + guardar el token),
pero el resto de la app no cambia.

---

## 5. Tablas que necesita el proyecto

```sql
-- Un registro por alumno
profiles (id uuid pk, email text unique, nombre text, universidad text,
          plan text default 'free', avatar text, creado_en timestamptz)

-- El contenido académico
asignaturas (id uuid pk, profile_id uuid fk, codigo text, nombre text,
             color text, profesor text, creditos numeric)
tareas (id uuid pk, profile_id uuid fk, asignatura_id uuid, titulo text,
        fecha_entrega date, prioridad text, hecha boolean)
eventos (id uuid pk, profile_id uuid fk, tipo text, titulo text,
         fecha date, hora_inicio time, hora_fin time)
horario (id uuid pk, profile_id uuid fk, asignatura_id uuid,
         dia smallint, hora_inicio time, hora_fin time, aula text)
sesiones (id uuid pk, profile_id uuid fk, asignatura_id uuid, fecha date,
          minutos int, modo text)
apuntes (id uuid pk, profile_id uuid fk, asignatura_id uuid, titulo text,
         tipo text, url text)
racha (profile_id uuid pk, mejor int, historial jsonb)
foro (id uuid pk, perfil_id uuid fk, texto text, likes int, creado_en timestamptz)
respuestas (id uuid pk, post_id uuid fk, perfil_id uuid fk, texto text)

-- La tabla "profiles" solo es visible por su propio dueño (política de seguridad)
```

Reglas de seguridad en Supabase (importantísimas):

- Cada tabla con `profile_id` tiene una política: `select` y `update` solo
  sobre las filas propias (`auth.uid() = profile_id`).
- El foro y los apuntes compartidos: `select` para todos, escritura solo del autor.
- La clave pública `anon` va en el JS; la clave de servicio **nunca** en el
  navegador (se usaría solo en un servidor propio).

---

## 6. Checklist para cuando decidamos dar el salto

- [ ] Crear el proyecto en [supabase.com](https://supabase.com) (región UE).
- [ ] Crear las tablas con el SQL de arriba.
- [ ] Configurar el login por correo (magic link o contraseña).
- [ ] Poner la URL y la clave pública en `assets/js/core/db.js`.
- [ ] Migrar los datos de la demo (`assets/js/data/seed.js`) como datos de prueba.
- [ ] Cambiar el login: añadir la pantalla de acceso y quitar el perfil local.
- [ ] Subida real de ficheros (vídeos y apuntes) al Storage de Supabase.
- [ ] Revisar la política de privacidad (obligatorio si se publica en la UE).
- [ ] Vigilar el uso: la app tiene un panel de uso y de facturación.

## 7. Datos y privacidad (RGPD)

Si la app se publica en España, hay que cumplir el RGPD:

- Hay que saber **quién es el responsable** del tratamiento (el grupo/universidad).
- Los datos de los alumnos (nombre, correo, notas, horarios) son **datos personales**.
- Hace falta una **política de privacidad** visible en la web y un modo de
  **borrar la cuenta y todos sus datos**.
- Con Supabase en la UE, los datos no salen de Europa.

Esto no es un detalle menor: es lo que diferencia un proyecto de grado de un
proyecto que no se puede publicar.
