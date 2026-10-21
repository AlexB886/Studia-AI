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
      console.error('[Studia] Error al renderizar la vista "' + name + '":', e);
      main.appendChild(U.h('div.card', [
        U.h('h3', 'Algo ha ido mal al pintar esta vista'),
        U.h('p.muted.small.mt-1', e.message),
        U.h('button.btn.btn--primary.mt-2', { onclick: function () { global.location.reload(); } }, 'Recargar')
      ]));
    }

    // Navegación activa
    U.$$('.nav__item[data-nav]').forEach(function (a) {
      a.classList.toggle('is-active', a.dataset.nav === name);
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
