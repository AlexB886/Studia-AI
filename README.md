# Studia-IA — Ficha del proyecto v0

**Equipo:** Héctor (coordinación y Luna IA), Alex (tareas, asignaturas, comunidad y premium), Joan (estudio y progreso), Carles (calendario y horarios).

**Fecha:** 27/10/2026

## 1. El problema (en una frase)

Los estudiantes pierden tiempo y se agobian al estudiar porque procrastinan y no saben cómo organizarse ni cómo repasar los contenidos de forma eficaz.

## 2. Para quién (el primer cliente)

Nuestro primer cliente es **Juan**, un joven que estudia un grado medio de Mecánica. Procrastina mucho porque utiliza métodos tradicionales de estudio. Cuando se sienta a revisar los apuntes, se agobia porque no tiene claro qué está repasando, qué debe aprender ni cómo organizar el estudio.

## 3. Cómo lo resuelve hoy (la alternativa actual)

Juan utiliza apuntes, libros y métodos tradicionales, como releer y memorizar los contenidos. Sin embargo, le cuesta mantener la concentración, organizarse y comprobar si realmente está entendiendo lo que estudia.

## 4. Nuestra solución (en una frase)

Studia-IA es una aplicación web que ayuda a los estudiantes a organizar sus tareas y estudios, planificar su tiempo y repasar los contenidos con la ayuda de un asistente inteligente.

## 5. Modelo de ingresos

- **Quién paga:** los estudiantes que quieran utilizar las funciones avanzadas.
- **Por qué paga:** para organizar mejor su estudio, ahorrar tiempo y aprovechar herramientas adicionales de aprendizaje.
- **Cómo y cuánto:** modelo freemium, con funciones básicas gratuitas y una suscripción Premium propuesta de 4,99 €/mes.

### Las cuentas del mantenimiento

Estimación inicial para una versión web sencilla:

- **Servidor y alojamiento:** 0 €/mes usando alojamiento estático gratuito.
- **Dominio propio:** aproximadamente 2–4 €/mes, según proveedor y renovación.
- **Base de datos:** 0 €/mes mientras sea suficiente un plan gratuito.
- **IA mediante API:** presupuesto estimado de 10 €/mes para empezar, dependiendo del uso.
- **Otros costes:** 0 € inicialmente, sin contar posibles gastos adicionales.

**Coste mensual estimado:** 12–14 €.

Para hacer los cálculos, tomamos como referencia un coste de 14 €/mes.

- **Opción 1 — Suscripción Premium:** 4,99 €/mes. Descontando una comisión orientativa de Stripe del 1,5 % + 0,25 €, quedarían aproximadamente 4,66 € por suscriptor. Necesitaríamos **3 suscriptores** para cubrir 14 €.
- **Opción 2 — Paquetes de créditos de IA:** paquetes de 1,99 €. Con la misma comisión orientativa, quedarían aproximadamente 1,71 € por paquete. Necesitaríamos **9 paquetes al mes**.
- **Opción 3 — Patrocinio:** un patrocinador que aportase 15 €/mes cubriría los costes estimados.

Estas cifras son orientativas y deben comprobarse con las tarifas reales de cada proveedor. Actualmente, la demo utiliza almacenamiento local y no necesita una API externa para funcionar.

## 6. El MVP: lo mínimo que alguien usaría

1. Crear y gestionar tareas y asignaturas.
2. Organizar exámenes, horarios y sesiones de estudio mediante el calendario.
3. Utilizar a Luna, el asistente de Studia-IA, para recibir ayuda con la organización y el estudio.

**Lo que NO hacemos en la primera versión:**

- Crear una aplicación móvil nativa.
- Implementar pagos reales o suscripciones.
- Desarrollar un sistema completo de registro e inicio de sesión.
- Integrar una API externa de IA sin haber validado primero la utilidad del producto.
- Añadir muchas funciones nuevas antes de comprobar que las actuales funcionan correctamente.

## 7. Validación esta semana

- Enseñar la demo a cinco estudiantes, incluyendo estudiantes de ciclos formativos.
- Preguntarles cómo organizan sus tareas y cómo estudian actualmente.
- Pedirles que prueben a crear una tarea, organizar un examen y planificar una sesión de estudio.
- Comprobar si entienden cómo utilizar la aplicación y si les ayuda a organizarse.
- Objetivo inicial: que al menos cuatro de cinco reconozcan el problema y que tres de cinco quieran volver a utilizarla.

Estos números son objetivos de validación, no resultados obtenidos todavía.

## 8. El mayor riesgo (y cómo lo comprobaremos esta semana)

El principal riesgo es que los estudiantes prueben Studia-IA una vez, pero no vuelvan a utilizarla, o que Luna no les aporte suficiente ayuda para estudiar.

Lo comprobaremos observando cómo utilizan la demo, preguntándoles qué funciones les resultan útiles y proponiéndoles que vuelvan a utilizarla durante varios días. Después recogeremos sus opiniones para decidir qué debemos mejorar.

## Tecnologías y herramientas

- HTML, CSS y JavaScript.
- Git y GitHub para gestionar el código.
- Visual Studio Code y OpenCode para desarrollar.
- ChatGPT como apoyo durante el desarrollo.
- Almacenamiento local del navegador mediante `localStorage`.
- Posible integración futura con Supabase y una API externa de IA, pendiente de decidir.

## Objetivo actual

Conseguir una demo estable, adaptable a móviles y ordenadores, probarla con estudiantes reales y mejorarla a partir de sus opiniones antes de invertir dinero en servicios adicionales.
