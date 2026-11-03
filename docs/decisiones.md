# Decisiones · Studia-IA

Documento corto y verdadero: por qué esta idea y con qué la construimos.
Lo ampliamos en el sprint 1 con una entrada por decisión relevante
(contexto → decisión → consecuencia).

## 1. Por qué esta idea

- **El problema es real y lo vemos cerca:** nuestros compañeros de clase y de
  ciclos formativos procrastinan, no saben cómo organizar el estudio y usan
  métodos ineficaces (releer y memorizar). El cliente inicial del README ("Juan",
  grado medio de Mecánica) es un retrato de estudiantes reales de nuestro
  entorno (ECF).
- **Tenemos la ventaja del asistente:** casi ninguna app de organización
  gratuita explica *qué estudiar y cómo*; Luna (IA) es lo que nos diferencia
  de un simple planificador.
- **Podemos construirlo nosotros:** es una web con HTML/CSS/JS, sin backend al
  principio, algo asumible en un curso con cuatro personas y agentes de IA.
- **El coste de intentar es casi nulo:** alojamiento estático gratuito y
  ~12–14 €/mes de costes estimados (ver README, modelo de ingresos), por lo
  que podemos validar antes de invertir.

## 2. Con qué la vamos a construir

| Decisión | Por qué |
|---|---|
| **HTML + CSS + JavaScript clásico (IIFE)** sin framework ni build | Debe funcionar con doble clic (`file://`), en XAMPP y publicado, sin dependencias ni `npm install`. Cualquiera del grupo puede editar cualquier archivo. |
| **Persistencia en `localStorage`** con capa `db.js` preparada para Supabase | Validamos la app sin backend ni login; cuando toque, cambiar solo `db.js`, no toda la app. Ver [`backend.md`](backend.md). |
| **Una vista por módulo** (`assets/js/modules/*.js`) registrado en el router | Cada miembro trabaja en sus archivos sin pisar a los demás → menos conflictos en Git. |
| **Git + GitHub con ramas por persona y PR a `main`** + CI con `node tools/check.js` | El trabajo del agente de IA queda revisable; nada entra en `main` sin pasar los comprobadores (anti-XSS, sintaxis, versiones de caché). |
| **Desarrollo asistido con opencode y ChatGPT**, con `AGENTS.md` como contrato del agente | Cuatro agentes trabajando en el mismo repo necesitan reglas duras: solo tu zona, check en verde, sin dependencias nuevas. |
| **Publicación en hosting estático gratuito** (Netlify/Cloudflare) | Entrega rápida y enlace de preview en cada PR, coste 0 € durante la validación. |
| **IA (Luna) simulada al principio, API real después** | El mayor riesgo es que no aporte ayuda real; lo validamos con estudiantes antes de pagar una API. |

## 3. Qué queda fuera del MVP (decidido)

- App móvil nativa (solo web adaptable a móvil).
- Pagos reales ni suscripciones activas (el premium es el modo de los creadores).
- Registro e inicio de sesión.
- API externa de IA hasta validar la utilidad con estudiantes.
- Demasiadas funciones nuevas antes de comprobar que las actuales funcionan.

El detalle del MVP está en el [README](../README.md), sección 6.

## 4. Pendientes de decidir en el sprint 1

- Proveedor final de alojamiento y dominio.
- Qué API de IA usará Luna y su presupuesto real.
- Modelo de login y migración a Supabase (momento premium real).
