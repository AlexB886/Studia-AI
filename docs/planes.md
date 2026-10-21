# Planes Gratis y Premium: opciones para decidir

Base de partida: la tabla que sale del documento de ideas del grupo. Aquí está
reorganizada para poder **decidir en una reunión** qué entra en cada plan,
qué se deja fuera y qué precio se le pone.

> La app ya tiene la vista "Premium" montada con esta comparativa. Cuando
> decidamos, se actualiza `assets/js/modules/premium.js` y ya está.

---

## 1. Lo que dice el documento original

| Gratis | Premium |
|---|---|
| Calendario integrado → seleccionar festivos | Parte social (foro, chats privados) |
| Recordatorios | IA (con memoria) |
| Racha | Enlaces directos a Word, Excel |
| Línea de progresión | Subir vídeos |
| Organización del tiempo | Sin anuncios / Con anuncios |
| Horario | Creación de documentos completos |
| Test inicial para saber los conocimientos | Prueba gratuita de la IA |
| | Simular exámenes |
| | Recompensas por racha |
| | Buscar exámenes anteriores de una asignatura |
| | Personalizar tu robot IA |
| | Estudios aparte para verano o vacaciones |
| | Estudios para aprender idiomas |
| | Opción de cancelar la suscripción en cualquier momento |
| | Recomendaciones a futuro |

---

## 2. Tres reglas para decidir bien

1. **Lo que la app hace bien tiene que estar en el plan Gratis.** Si el
   calendario o la racha solo funcionan pagando, nadie llega a probarlo y no
   hay conversión. Lo gratis se usa **completo**, no recortado.
2. **Lo Premium debe resolver un problema, no ser "lo mismo con más cosas".**
   Ejemplo: en vez de "IA completa", "la IA te dice qué estudiar hoy según tus
   exámenes y tu racha".
3. **El plan gratis tiene que ser Autosuficiente para el estudiante** y
   limitarse a lo que no cuesta dinero a nosotros (servidores, IA, vídeo).

---

## 3. Propuesta de reparto (para discutir)

### Plan Gratis — "todo lo esencial"

| Función | Estado | Comentario |
|---|---|---|
| Calendario con festivos | Ya hecho | Es la base del producto |
| Recordatorios | Ya hecho | |
| Racha y recompensas | Ya hecho | Genera hábito → es lo que engancha |
| Línea de progresión | Ya hecho | |
| Organización del tiempo | Ya hecho | |
| Horario | Ya hecho | |
| Test inicial de conocimientos | Ya hecho | Además es el mejor gancho para la IA |
| Tareas y entregas | Ya hecho | |
| 1 normativa de la IA al mes | Propuesta | Antes de que la IA sea de pago, que la prueben |

### Plan Premium — "el que te ahorra tiempo"

| Función | Por qué es de pago | Coste para nosotros |
|---|---|---|
| **IA con memoria** (Luna) | Coste por tokens de IA | 💸 API de IA |
| **Simulador de exámenes** | Contenido + corrección + IA | 💸 IA y tiempo invertido |
| **Subir vídeos y apuntes** | Almacenamiento y ancho de banda | 💸 Espacio en la nube |
| **Foro y chats privados** | Moderación + tiempo | 🕐 Mantenimiento |
| **Recomendaciones a futuro** | Solo tiene sentido con IA | 💸 API de IA |
| **Estudios de verano / idiomas** | Es un producto aparte | 🕐 Contenido |
| **Personalizar el robot IA** | Refuerza la identidad de marca | 🕐 Diseño |
| **Buscar exámenes anteriores** | Contenido (banco de preguntas) | 🕐 Contenido |
| **Crear documentos completos** | Generación de PDFs | 💸 Servidor |
| **Sin anuncios** | Lo que paga el usuario es esto | — |
| **Cancelar cuando quieras** | Confianza | — |

---

## 4. Lo que hay que decidir (checklist de la reunión)

- [ ] ¿Qué funciones van **exactamente** en Premium? (la lista de arriba es
      una propuesta, no un cierre)
- [ ] **Precio**: ¿4,99 €/mes? ¿9,99 €/mes? ¿pago único por curso (39 €)?
- [ ] ¿**Probar Premium gratis** 7 o 14 días? (es lo que más convierte y es
      un Requirements que ya pusimos en la web)
- [ ] ¿Hay **plan anual**? Suele dar menos problemas de bajas y más ingreso.
- [ ] ¿**Descuento para estudiantes** o para el universidad? (el ODT menciona
      "estudios aparte para verano o vacaciones": puede ser un producto
      independiente, no un plan)
- [ ] ¿Se **cobra en la app** (Stripe) o se paga fuera (Bizum/transferencia)
      hasta que haya cuenta de usuario?
- [ ] ¿Con **anuncios** en el plan gratis? Decidlo pronto: poner anuncios y
      quitarlos después molesta más que no ponerlos.
- [ ] ¿Qué pasa con los datos si alguien cancela? (la respuesta fácil: se
      quedan en la cuenta, en plan gratis)

---

## 5. Sobre el tema "con anuncios" del documento

El ODT lo tenía en la columna Premium como "Sin anuncios / Con anuncios" (con
anuncios en el Gratis). Recomendación del grupo: **no pongáis anuncios** en un
producto para estudiantes, aunque sea un prototipo de grado. Las alternativas
baratas y sin anuncios:

- El plan gratis es **completo** y el Premium aporta IA y almacenamiento.
- Marca de agua discreta en los PDF generados.
- Límite generoso (3 vídeos, 100 MB) en vez de un muro de anuncios.

---

## 6. Nota legal rápida

Si vais a cobrar de verdad (aunque sea 1 €), en España hay que:

- Tener **identificación fiscal** y hacer factura (o usar una plataforma que
  lo gestione, como Stripe, que hace factura y se queda un % ).
- Aceptar **condiciones de uso y política de privacidad** (RGPD).
- Dar **derecho de baja** (un botón "cancelar suscripción" en la cuenta).
- El RGPD se aplica igual si no cobras: es el mismo tratamiento de datos.

Todo esto es lo que hace el botón "Opción de cancelar la suscripción en
cualquier momento" del documento: no es un detalle de marketing, es una
obligación.
