/* =========================================================
   Studia-IA · core/router.js
   Enrutador por hash: #/dashboard, #/calendar, ...
   ========================================================= */
(function (global) {
  'use strict';

  var Studia = global.Studia = global.Studia || {};
  var U = Studia.utils;

  var routes = {};
  var current = null;

  function register(name, def) {
    routes[name] = def;
  }

  function parse() {
    var hash = (global.location.hash || '').replace(/^#\/?/, '').split('?')[0];
    return hash || 'dashboard';
  }

  function render() {
    var name = parse();
    var route = routes[name] || routes['dashboard'];
    if (!route) return;

    var main = document.getElementById('appMain');
    if (!main) return;

    U.clear(main);
    var ctx = { params: {} };
    try {
      route.render(main, ctx);
    } catch (e) {
      if (Studia.captureError) Studia.captureError('vista:' + name, e.message, e.stack);
      U.clear(main);
      main.appendChild(U.h('div.card', [
        U.h('div.row.gap-2', { style: { alignItems: 'center' } }, [
          U.h('span', { style: { color: 'var(--rose-500)', display: 'flex' } }, U.icon('alert')),
          U.h('h3', 'Esta vista no se ha podido cargar')
        ]),
        U.h('p.muted.small.mt-1', 'El resto de la app sigue funcionando. Puedes volver al panel o copiar el error para avisar al equipo.'),
        U.h('pre.diag.mt-2', (e && (e.stack || e.message)) || 'Error desconocido'),
        U.h('div.row.row--wrap.gap-2.mt-2', [
          U.h('button.btn.btn--primary', {
            onclick: function () { Studia.router.go('dashboard'); }
          }, 'Volver al panel'),
          U.h('button.btn.btn--ghost', {
            onclick: function () {
              var text = Studia.diagnostics ? Studia.diagnostics() : String(e);
              U.copy(text).then(function () { Studia.ui.toast('Error copiado', 'success'); })
                .catch(function () { Studia.ui.toast('No se pudo copiar', 'warn'); });
            }
          }, [U.icon('file'), 'Copiar error']),
          U.h('button.btn.btn--ghost', {
            onclick: function () { global.location.reload(); }
          }, 'Recargar')
        ])
      ]));
    }

    // Navegación activa
    U.$$('.nav__item[data-nav]').forEach(function (a) {
      var active = a.dataset.nav === name;
      a.classList.toggle('is-active', active);
      if (active) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });

    // Título
    if (route.title) {
      var t = document.getElementById('viewTitle');
      var s = document.getElementById('viewSubtitle');
      if (t) t.textContent = route.title;
      if (s) s.textContent = route.subtitle || '';
    }

    current = name;
    if (global.scrollTo) global.scrollTo({ top: 0, behavior: 'instant' in document.body.style ? 'instant' : 'auto' });
  }

  function go(name) {
    if (('#/' + name) === global.location.hash) render();
    else global.location.hash = '#/' + name;
  }

  function start() {
    global.addEventListener('hashchange', render);
    render();
  }

  Studia.router = { register: register, render: render, go: go, start: start, routes: routes, current: function () { return current; } };
})(window);
