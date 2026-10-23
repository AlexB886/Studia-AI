/* =========================================================
   Studia-IA · tests.js
   Comprobaciones del núcleo, sin dependencias ni framework.
   Se abren con `tests.html` (doble clic o servidor).

   Hace una copia de tus datos en localStorage y la restaura
   al terminar, así que no borra nada.
   ========================================================= */
(function (global) {
  'use strict';

  var Studia = global.Studia;
  var U = Studia.utils;
  var store = Studia.store;

  var KEY = Studia.db.KEY;
  var snapshot = null;
  try { snapshot = global.localStorage.getItem(KEY); } catch (e) { /* sin storage */ }

  var results = [];

  function assert(cond, msg) {
    if (!cond) throw new Error(msg || 'comprobación fallida');
  }
  function eq(a, b, msg) {
    if (a !== b) throw new Error((msg ? msg + ': ' : '') + 'esperado ' + JSON.stringify(b) + ', recibido ' + JSON.stringify(a));
  }

  /* ---------------- Utilidades ---------------- */
  var tests = [
    ['esc() escapa HTML', function () {
      var out = U.esc('<img src=x onerror="alert(1)">');
      assert(out.indexOf('<') === -1 && out.indexOf('&lt;') === 0, out);
    }],
    ['h() no interpreta html', function () {
      var n = U.h('div', { html: '<b>x</b>' });
      eq(n.innerHTML, '', 'innerHTML');
    }],
    ['norm() quita tildes y mayúsculas', function () {
      eq(U.norm('Cálculo  Diferencial'), 'calculo  diferencial');
    }],
    ['fmtClock()', function () {
      eq(U.fmtClock(0), '00:00');
      eq(U.fmtClock(65), '01:05');
      eq(U.fmtClock(1500), '25:00');
    }],
    ['minutos y horas', function () {
      eq(U.timeToMinutes('09:30'), 570);
      eq(U.minutesToTime(570), '09:30');
      eq(U.fmtMinutes(90), '1 h 30 min');
    }],
    ['daysBetween() cruza el cambio de hora', function () {
      eq(U.daysBetween('2026-03-28', '2026-03-30'), 2);
      eq(U.daysBetween('2026-10-24', '2026-10-26'), 2);
    }],
    ['monthMatrix() son 6 semanas y empieza en lunes', function () {
      var m = U.monthMatrix(new Date(2026, 0, 15), 1);
      eq(m.length, 42);
      eq(m[0].date.getDay(), 1);
      assert(m[21].inMonth, 'la tercera semana debe ser del mes');
    }],
    ['weekNumber()', function () {
      eq(U.weekNumber('2026-01-01'), 1);
    }],

    /* ---------------- Datos ---------------- */
    ['el seed carga asignaturas y tareas', function () {
      assert(store.get().subjects.length > 0, 'sin asignaturas');
      assert(store.get().tasks.length > 0, 'sin tareas');
    }],
    ['el esquema está versionado', function () {
      eq(store.SCHEMA, 2);
      eq(store.get().version, 2);
    }],
    ['migra datos de la versión 1', function () {
      store.importData({
        state: {
          version: 1,
          profile: { name: 'Prueba' },
          subjects: [{ id: 's1', name: 'Mates' }],
          tasks: [], events: [], timetable: [], sessions: [], notes: [], forum: []
        }
      });
      eq(store.get().version, 2, 'versión migrada');
      eq(store.get().timer, null, 'timer por defecto');
    }],
    ['exportar + importar conserva los datos', function () {
      store.reset();
      store.add('tasks', { title: 'Tarea de prueba', done: false });
      var copy = JSON.parse(JSON.stringify(store.exportData()));
      store.reset();
      eq(store.get().tasks.filter(function (t) { return t.title === 'Tarea de prueba'; }).length, 0);
      store.importData(copy);
      eq(store.get().tasks.filter(function (t) { return t.title === 'Tarea de prueba'; }).length, 1);
    }],
    ['importar un archivo inválido avisa', function () {
      var threw = false;
      try { store.importData({ hola: 'mundo' }); } catch (e) { threw = true; }
      assert(threw, 'debería lanzar error');
    }],
    ['tareas vencidas y abiertas', function () {
      store.reset();
      store.add('tasks', { title: 'Vencida', done: false, due: U.toISO(U.addDays(U.today(), -2)) });
      store.add('tasks', { title: 'Hecha', done: true, due: U.toISO(U.addDays(U.today(), -2)) });
      var over = store.overdueTasks().filter(function (t) { return t.title === 'Vencida'; });
      eq(over.length, 1);
    }],
    ['racha con dos días seguidos', function () {
      store.reset();
      store.addSession({ date: U.toISO(U.addDays(U.today(), -1)), minutes: 30 });
      store.addSession({ date: U.today(), minutes: 30 });
      assert(store.streakInfo().current >= 2, 'racha=' + store.streakInfo().current);
    }],
    ['nivel y XP', function () {
      store.update(function (s) { s.xp = 0; });
      eq(store.levelInfo().level, 1);
      store.update(function (s) { s.xp = 60; });
      eq(store.levelInfo().level, 2);
      eq(store.levelInfo().percent, 0);
    }],

    /* ---------------- Módulos ---------------- */
    ['las 10 vistas están registradas', function () {
      var names = ['dashboard', 'calendar', 'schedule', 'study', 'progress', 'subjects', 'tasks', 'ai', 'social', 'premium'];
      names.forEach(function (n) { assert(Studia.router.routes[n], 'falta la ruta ' + n); });
    }],
    ['el pomodoro se guarda al arrancar', function () {
      store.reset();
      Studia.modules.study.init();
      Studia.modules.study.start();
      var saved = store.get().timer;
      assert(saved && saved.running === true, 'no se guardó como activo');
      assert(saved.endAt > Date.now(), 'endAt debe estar en el futuro');
      Studia.modules.study.pause();
      assert(store.get().timer.running === false, 'debe quedar en pausa');
      assert(store.get().timer.remaining > 0, 'debe conservar el tiempo');
    }],
    ['el motor de la IA es intercambiable', function () {
      eq(Studia.ai.engine().name, 'local');
      var fake = { name: 'fake', ask: function () { return Promise.resolve({ text: 'ok' }); } };
      Studia.ai.setEngine(fake);
      eq(Studia.ai.engine().name, 'fake');
      Studia.ai.setEngine(null);
      eq(Studia.ai.engine().name, 'local');
    }]
  ];

  /* ---------------- Runner ---------------- */
  function runOne(test) {
    try {
      test[1]();
      results.push({ name: test[0], ok: true });
    } catch (e) {
      results.push({ name: test[0], ok: false, error: e.message });
    }
  }

  function render() {
    var pass = results.filter(function (r) { return r.ok; }).length;
    var fail = results.length - pass;
    var box = document.getElementById('results');
    var summary = document.getElementById('summary');

    if (summary) {
      summary.textContent = fail ? pass + ' ok · ' + fail + ' fallos' : 'Todo correcto: ' + pass + ' comprobaciones';
      summary.className = fail ? 'summary summary--fail' : 'summary summary--ok';
    }
    if (box) {
      box.textContent = '';
      results.forEach(function (r) {
        var row = document.createElement('div');
        row.className = 'test ' + (r.ok ? 'test--ok' : 'test--fail');
        row.textContent = (r.ok ? '✓ ' : '✗ ') + r.name + (r.error ? ' — ' + r.error : '');
        box.appendChild(row);
      });
    }
    global.__studiaTests = { pass: pass, fail: fail, results: results };
  }

  function finish() {
    store.flush().then(function () {
      try {
        if (snapshot === null) global.localStorage.removeItem(KEY);
        else global.localStorage.setItem(KEY, snapshot);
      } catch (e) { /* sin storage */ }
    });
  }

  function run() {
    store.reset();
    tests.forEach(runOne);

    /* Test asíncrono del motor local (responde en ~620 ms). */
    Studia.ai.ask('hola')
      .then(function (res) {
        try {
          assert(res && typeof res.text === 'string' && res.text.length > 0, 'respuesta vacía');
          results.push({ name: 'la IA local responde', ok: true });
        } catch (e) {
          results.push({ name: 'la IA local responde', ok: false, error: e.message });
        }
      })
      .catch(function (e) {
        results.push({ name: 'la IA local responde', ok: false, error: e.message });
      })
      .then(function () {
        render();
        finish();
      });
  }

  global.addEventListener('load', function () {
    store.load().then(run, function () { run(); });
  });
})(window);
