/* =========================================================
   Studia-IA · modules/premium.js
   Planes Gratis / Premium (según el documento del grupo) y
   activación de prueba en modo demo.
   ========================================================= */
(function (global) {
  'use strict';

  var Studia = global.Studia = global.Studia || {};
  var U = Studia.utils, store = Studia.store, ui = Studia.ui;

  var FREE = [
    'Calendario integrado con días festivos',
    'Recordatorios de tareas y exámenes',
    'Racha y recompensas básicas',
    'Línea de progresión del estudio',
    'Organización del tiempo y horario',
    'Prueba gratuita de la IA (Luna)',
    'Simulador de exámenes básico',
    'Horarios y apuntes por asignatura'
  ];

  var PREMIUM = [
    'Todo lo del plan Gratis',
    'Parte social completa: foro, chat privado y compartir',
    'IA sin límites con memoria y personalización total',
    'Enlaces directos a Word, Excel y Drive ilimitados',
    'Subida de vídeos y apuntes sin límite de tamaño',
    'Sin anuncios',
    'Creación de documentos completos',
    'Simulador de exámenes avanzado con correção',
    'Banco de exámenes anteriores por asignatura',
    'Personalización total de tu robot de IA',
    'Planes de verano, vacaciones e idiomas',
    'Test inicial de conocimientos detallado',
    'Cancelar la suscripción cuando quieras',
    'Recomendaciones personalizadas a futuro'
  ];

  var COMPARE = [
    ['Calendario con festivos', true, true],
    ['Recordatorios', true, true],
    ['Racha y recompensas', true, true],
    ['Línea de progresión', true, true],
    ['Horario de clases', true, true],
    ['Prueba gratuita de la IA', true, true],
    ['Simular exámenes', 'básico', true],
    ['Parte social (foro y chat)', false, true],
    ['IA con memoria', 'limitada', true],
    ['Enlaces a Word / Excel', '3 por asignatura', true],
    ['Subir vídeos', false, true],
    ['Sin anuncios', false, true],
    ['Documentos completos', false, true],
    ['Exámenes anteriores', false, true],
    ['Robot IA personalizable', 'básico', true],
    ['Planes de verano / idiomas', false, true],
    ['Test inicial detallado', false, true],
    ['Cancelar en cualquier momento', false, true]
  ];

  function isPremium() { return store.get().profile.plan === 'premium'; }

  function render(root) {
    U.clear(root);
    var premium = isPremium();

    root.appendChild(U.h('div.col.gap-2', [
      U.h('div.grid.grid-2', [
        planCard('Gratis', 'free', FREE, premium ? false : true),
        planCard('Premium', 'premium', PREMIUM, premium)
      ]),
      U.h('div.card', [
        U.h('div.card__head', [
          U.h('div', [U.h('h3', 'Comparativa completa'), U.h('p', 'Qué incluye cada plan')]),
          U.h('span.badge' + (premium ? '.badge--amber' : ''), premium ? 'Estás en Premium' : 'Estás en Gratis')
        ]),
        U.h('div', { style: { overflowX: 'auto' } }, [
          U.h('table.compare', [
            U.h('thead', U.h('tr', [U.h('th', 'Función'), U.h('th', 'Gratis'), U.h('th', 'Premium')])),
            U.h('tbody', COMPARE.map(function (row) {
              return U.h('tr', [
                U.h('td', row[0]),
                U.h('td', cell(row[1])),
                U.h('td', cell(row[2]))
              ]);
            }))
          ])
        ])
      ]),
      U.h('div.card', [
        U.h('div.card__head', [U.h('h3', 'Gestión de la suscripción')]),
        U.h('div.row.row--between.row--wrap.gap-2', [
          U.h('div', [
            U.h('strong.small', premium ? 'Suscripción Premium activa' : 'Suscripción gratuita'),
            U.h('p.tiny.soft', 'Puedes cambiar de plan o cancelar cuando quieras: no hay permanencia.')
          ]),
          U.h('div.row.gap-1', [
            premium
              ? U.h('button.btn.btn--danger.btn--sm', { onclick: cancel }, 'Cancelar suscripción')
              : U.h('button.btn.btn--primary.btn--sm', { onclick: subscribe }, [U.icon('crown'), 'Activar Premium (demo)'])
          ])
        ])
      ])
    ]));
  }

  function cell(v) {
    if (v === true) return U.h('span.yes', '✓');
    if (v === false) return U.h('span.no', '—');
    return U.h('span.small', String(v));
  }

  function planCard(name, key, features, active) {
    var premium = key === 'premium';
    return U.h('div.plan' + (active ? '.plan--active' : '') + (premium ? '.plan--premium' : ''), [
      premium ? U.h('span.plan__tag', 'Recomendado') : null,
      U.h('div', [
        U.h('h3', name),
        U.h('div.plan__price', premium ? [U.h('span', '3,99 €'), U.h('small', ' / mes')] : [U.h('span', '0 €'), U.h('small', ' para siempre')])
      ]),
      U.h('p.small', premium ? 'Desbloquea la parte social, la IA completa y todos los extras.' : 'Todo lo esencial para organizarte y estudiar.'),
      U.h('div.plan__features', features.map(function (f) {
        return U.h('div.plan__feature', [U.icon('check'), U.h('span', f)]);
      })),
      U.h('div.spacer'),
      active
        ? U.h('button.btn.btn--block' + (premium ? '.btn--amber' : '.btn--ghost'), { disabled: true }, 'Tu plan actual')
        : (premium
          ? U.h('button.btn.btn--amber.btn--block', { onclick: subscribe }, [U.icon('crown'), 'Probar Premium'])
          : U.h('button.btn.btn--ghost.btn--block', { onclick: function () { store.update(function (s) { s.profile.plan = 'free'; }); ui.toast('Has vuelto al plan Gratis', 'info'); } }, 'Volver al plan Gratis'))
    ]);
  }

  function subscribe() {
    ui.confirm({
      title: 'Activar Premium (modo demo)',
      message: 'En esta versión no se cobra nada: simplemente se activa el plan premium en tu navegador. El pago real (Stripe) se integrará en la rama feature/premium.',
      okLabel: 'Activar Premium',
      cancelLabel: 'Ahora no'
    }).then(function (ok) {
      if (!ok) return;
      store.update(function (s) { s.profile.plan = 'premium'; s.settings.showAds = false; });
      ui.toast('¡Ya eres Premium! 🎉', 'success');
    });
  }

  function cancel() {
    ui.confirm({
      title: '¿Cancelar la suscripción?',
      message: 'Volverás al plan Gratis y perderás las funciones premium, pero conservarás tus datos.',
      okLabel: 'Cancelar suscripción',
      danger: true
    }).then(function (ok) {
      if (!ok) return;
      store.update(function (s) { s.profile.plan = 'free'; s.settings.showAds = true; });
      ui.toast('Suscripción cancelada. Tus datos siguen aquí.', 'info');
    });
  }

  function refresh() {
    var main = document.getElementById('appMain');
    if (main && Studia.router.current() === 'premium') render(main);
  }

  function init() {
    store.subscribe(function () {
      if (Studia.router.current() === 'premium') refresh();
    });
  }

  Studia.modules = Studia.modules || {};
  Studia.modules.premium = { init: init, render: render };
  Studia.router.register('premium', {
    title: 'Premium',
    subtitle: 'Elige el plan que encaja contigo',
    render: render
  });
})(window);
