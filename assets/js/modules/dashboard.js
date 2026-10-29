/* =========================================================
   Studia-IA · modules/dashboard.js
   Panel principal: resumen del día, agenda, tareas y accesos
   ========================================================= */
(function (global) {
  'use strict';

  var Studia = global.Studia = global.Studia || {};
  var U = Studia.utils, store = Studia.store, ui = Studia.ui;

  function greeting() {
    var hh = new Date().getHours();
    if (hh < 6) return 'Buenas noches';
    if (hh < 13) return 'Buenos días';
    if (hh < 21) return 'Buenas tardes';
    return 'Buenas noches';
  }

  function render(root) {
    U.clear(root);
    var today = U.today();
    var goal = store.get().settings.dailyGoal || 120;
    var minutes = store.minutesOn(today);
    var info = store.streakInfo();
    var open = store.openTasks();
    var exam = store.nextExam();
    var classes = store.todayClasses();
    var level = store.levelInfo();

    root.appendChild(U.h('div.col.gap-2', [
      hero(minutes, goal, level, info),
      U.h('div.grid.grid-4', [
        stat('fire', 'amber', info.current, 'días de racha', 'Mejor: ' + info.best),
        stat('timer', 'brand', U.fmtMinutes(minutes), 'estudiado hoy', 'Objetivo: ' + goal + ' min'),
        stat('check', 'sky', open.length, 'tareas pendientes', open.filter(function (t) { return t.due && t.due < today; }).length + ' vencidas'),
        stat('target', 'rose', exam ? U.fmtRelative(exam.date) : '—', 'próximo examen', exam ? exam.title : 'Nada programado')
      ]),
      U.h('div.grid.grid--split', [
        U.h('div.col.gap-2', [agendaCard(classes), tasksCard(open), progressCard()]),
        U.h('div.col.gap-2', [weekCard(), lunaCard(), subjectsCard()])
      ])
    ]));
  }

  function hero(minutes, goal, level, info) {
    var pct = Math.min(1, minutes / goal);
    var R = 40, C = 2 * Math.PI * R;
    return U.h('div.hero', [
      U.h('div.hero__inner', [
        U.h('div', [
          U.h('h2', greeting() + ', ' + store.get().profile.name),
          U.h('p', minutes > 0
            ? 'Ya has estudiado ' + U.fmtMinutes(minutes) + ' hoy. ' + (minutes >= goal ? '¡Objetivo cumplido!' : 'Te quedan ' + (goal - minutes) + ' min.')
            : '¿Empezamos? Un pomodoro de 25 minutos y empiezas el día con ventaja.'),
          U.h('div.hero__streak', { title: info.best ? 'Mejor racha: ' + info.best + ' días' : '' }, [
            U.icon('fire'),
            U.h('span', info.current === 1 ? '1 día de racha' : info.current + ' días de racha')
          ]),
          U.h('div.hero__actions.mt-3', [
            U.h('button.btn.btn--primary', { onclick: function () { Studia.router.go('study'); } }, [U.icon('play'), 'Empezar a estudiar']),
            U.h('button.btn.btn--ghost', { onclick: function () { Studia.router.go('calendar'); } }, [U.icon('calendar'), 'Ver calendario']),
            U.h('button.btn.btn--ghost', { onclick: function () { Studia.router.go('ai'); } }, [U.icon('sparkles'), 'Preguntar a Luna'])
          ])
        ]),
        U.h('div.hero__ring', [
          U.h('svg', { viewBox: '0 0 92 92' }, [
            U.h('circle', { cx: '46', cy: '46', r: R, fill: 'none', stroke: 'rgba(255,255,255,.28)', 'stroke-width': '9' }),
            U.h('circle', {
              cx: '46', cy: '46', r: R, fill: 'none', stroke: '#fff', 'stroke-width': '9', 'stroke-linecap': 'round',
              'stroke-dasharray': C, 'stroke-dashoffset': C * (1 - pct),
              transform: 'rotate(-90 46 46)'
            })
          ]),
          U.h('div', [
            U.h('div.bold', { style: { fontSize: '1.2rem' } }, Math.round(pct * 100) + '%'),
            U.h('div.tiny', { style: { opacity: .85 } }, 'objetivo diario')
          ])
        ])
      ])
    ]);
  }

  function stat(ic, tone, value, label, sub) {
    return U.h('div.stat', [
      U.h('div.stat__icon.stat__icon--' + tone, U.icon(ic)),
      U.h('div.stat__body', [
        U.h('span.stat__value', value),
        U.h('span.stat__label', label),
        U.h('span.tiny.soft', sub)
      ])
    ]);
  }

  function agendaCard(classes) {
    var today = U.today();
    var events = store.eventsOn(today);
    var items = classes.map(function (c) {
      return { time: c.start, title: store.subjectName(c.subjectId), sub: c.room || 'Clase', type: 'class', id: c.id };
    }).concat(events.map(function (e) {
      return { time: e.start || '', title: e.title, sub: e.location || (e.subjectId ? store.subjectName(e.subjectId) : ''), type: e.type, id: e.id };
    })).sort(function (a, b) { return (a.time || '99:99') < (b.time || '99:99') ? -1 : 1; });

    function goCreate() {
      Studia.router.go('calendar');
      setTimeout(function () {
        var btn = [...document.querySelectorAll('button')].find(function (b) { return b.textContent.trim() === 'Evento'; });
        if (btn) btn.click();
      }, 120);
    }

    return U.h('div.card', [
      U.h('div.card__head', [
        U.h('div', [U.h('h3', 'Tu agenda de hoy'), U.h('p', U.fmtDate(today, { weekday: true, numeric: true }))]),
        U.h('button.btn.btn--ghost.btn--sm', { onclick: function () { Studia.router.go('calendar'); } }, 'Calendario')
      ]),
      items.length ? U.h('div.timeline', items.map(function (it, i) {
        return U.h('div.timeline__item', [
          U.h('div.timeline__rail', [
            U.h('span.timeline__dot', { style: { background: it.type === 'exam' ? 'var(--rose-500)' : it.type === 'class' ? 'var(--sky-500)' : 'var(--brand-500)' } }),
            i < items.length - 1 ? U.h('span.timeline__line') : null
          ]),
          U.h('div.timeline__body', [
            U.h('div.timeline__time', it.time ? it.time.slice(0, 5) : 'Todo el día'),
            U.h('div.timeline__title', it.title),
            it.sub ? U.h('div.timeline__sub', it.sub) : null
          ])
        ]);
      })) : U.h('div.empty.empty--sm', [
        U.h('div.empty__icon', U.icon('calendar')),
        U.h('h4', 'Agenda libre hoy'),
        U.h('p', 'No tienes clases ni eventos. Un bloque de estudio corto hoy mantiene viva la racha.'),
        U.h('button.btn.btn--primary.btn--sm', { onclick: goCreate }, [U.icon('plus'), 'Añadir evento'])
      ])
    ]);
  }

  function tasksCard(open) {
    function goCreateTask() {
      Studia.router.go('tasks');
      setTimeout(function () {
        var btn = [...document.querySelectorAll('button')].find(function (b) { return /Nueva tarea/.test(b.textContent); });
        if (btn) btn.click();
      }, 120);
    }

    return U.h('div.card', [
      U.h('div.card__head', [
        U.h('div', [U.h('h3', 'Próximas tareas'), U.h('p', open.length + ' pendientes')]),
        U.h('button.btn.btn--ghost.btn--sm', { onclick: function () { Studia.router.go('tasks'); } }, 'Ver todas')
      ]),
      open.length ? U.h('div.col.gap-1', open.slice(0, 5).map(function (t) {
        var overdue = t.due && t.due < U.today();
        return U.h('div.task', [
          U.h('button.task__check', {
            onclick: function () {
              store.updateRow('tasks', t.id, { done: true, completedAt: U.today() });
              ui.toast('Tarea completada ✓', 'success');
            },
            'aria-label': 'Completar'
          }, U.icon('check')),
          U.h('div.grow', [
            U.h('div.task__title', t.title),
            U.h('div.task__meta', [
              U.h('span.tiny', { style: { color: store.subjectColor(t.subjectId) } }, store.subjectName(t.subjectId)),
              t.due ? U.h('span.tiny' + (overdue ? '.due--over' : ''), U.fmtRelative(t.due)) : null,
              U.h('span.prio.prio--' + (t.priority || 'media'), t.priority || 'media')
            ])
          ])
        ]);
      })) : U.h('div.empty.empty--sm', [
        U.h('div.empty__icon', U.icon('check')),
        U.h('h4', 'Nada pendiente'),
        U.h('p', 'Tu lista está a cero. Apunta lo que tengas que entregar para no perderle la pista.'),
        U.h('button.btn.btn--primary.btn--sm', { onclick: goCreateTask }, [U.icon('plus'), 'Añadir tarea'])
      ])
    ]);
  }

  function progressCard() {
    var s = store.streakInfo();
    var lvl = store.levelInfo();
    var week = store.minutesBetween(U.toISO(U.addDays(new Date(), -6)), U.today());
    return U.h('div.card', [
      U.h('div.card__head', [U.h('h3', 'Tu progreso')]),
      U.h('div.grid.grid-3', [
        U.h('div', [U.h('div.bold', { style: { fontSize: '1.3rem' } }, U.fmtHours(week)), U.h('span.tiny.soft', 'esta semana')]),
        U.h('div', [U.h('div.bold', { style: { fontSize: '1.3rem' } }, lvl.level), U.h('span.tiny.soft', 'nivel actual')]),
        U.h('div', [U.h('div.bold', { style: { fontSize: '1.3rem' } }, s.best), U.h('span.tiny.soft', 'mejor racha')])
      ]),
      U.h('button.btn.btn--ghost.btn--sm.btn--block.mt-3', { onclick: function () { Studia.router.go('progress'); } }, 'Ver la línea de progresión')
    ]);
  }

  function weekCard() {
    var start = U.startOfWeek(new Date(), 1);
    var days = [];
    for (var i = 0; i < 7; i++) {
      var d = U.addDays(start, i);
      var iso = U.toISO(d);
      var has = store.minutesOn(iso) > 0;
      var events = store.eventsOn(iso).length > 0;
      days.push({ date: d, iso: iso, has: has, events: events });
    }
    return U.h('div.card', [
      U.h('div.card__head', [U.h('h3', 'Esta semana'), U.h('span.badge.badge--brand', 'Sem ' + U.weekNumber(new Date()))]),
      U.h('div.mini-cal', [
        U.h('div.mini-cal__row', U.DIAS_MINI.map(function (d) { return U.h('span.mini-cal__dow', d); })),
        U.h('div.mini-cal__row', days.map(function (d) {
          var cls = 'mini-cal__day';
          if (d.has) cls += ' mini-cal__day--has';
          if (U.isToday(d.date)) cls += ' mini-cal__day--today';
          if (d.date > new Date()) cls += ' mini-cal__day--out';
          return U.h('button', { class: cls, title: d.iso, onclick: function () { Studia.router.go('calendar'); } }, String(d.date.getDate()));
        }))
      ]),
      U.h('p.tiny.soft.mt-2', 'Días con estudio confirmado en verde. Las tareas pendientes aparecen en el calendario.')
    ]);
  }

  function lunaCard() {
    var ai = store.get().ai;
    return U.h('div.card', [
      U.h('div.row.gap-2', [
        U.h('div.stat__icon.stat__icon--violet', { style: { fontSize: '1.3rem' } }, ai.avatar || '🤖'),
        U.h('div.grow', [
          U.h('h3', ai.name || 'Luna'),
          U.h('p.tiny.soft', 'Tu asistente de estudio con IA')
        ])
      ]),
      U.h('p.small.muted.mt-2', 'Pregúntale qué estudiar, pídele un plan para el examen de la semana o un resumen de tus apuntes.'),
      U.h('button.btn.btn--soft.btn--sm.btn--block.mt-2', { onclick: function () { Studia.router.go('ai'); } }, [U.icon('sparkles'), 'Abrir el chat'])
    ]);
  }

  function subjectsCard() {
    var subjects = store.get().subjects;
    var minutes = {};
    var from = U.toISO(U.addDays(new Date(), -29));
    store.get().sessions.filter(function (s) { return s.date >= from; }).forEach(function (s) {
      if (!s.subjectId) return;
      minutes[s.subjectId] = (minutes[s.subjectId] || 0) + s.minutes;
    });
    var total = Object.keys(minutes).reduce(function (a, k) { return a + minutes[k]; }, 0) || 1;
    var list = U.sortBy(subjects, function (s) { return (minutes[s.id] || 0); }).slice(0, 5);
    return U.h('div.card', [
      U.h('div.card__head', [U.h('h3', 'Asignaturas'), U.h('span.badge', subjects.length)]),
      U.h('div.col.gap-2', list.map(function (s) {
        var pct = Math.round((minutes[s.id] || 0) / total * 100);
        return U.h('div.goal', [
          U.h('div.goal__row', [
            U.h('span.row.gap-2', [U.h('span.dot-color', { style: { background: s.color } }), U.h('span.small.truncate', s.name)]),
            U.h('span.tiny.soft', pct + '%')
          ]),
          U.h('div.progress.progress--thin', U.h('div.progress__bar', { style: { width: pct + '%', background: s.color } }))
        ]);
      }))
    ]);
  }

  function refresh() {
    var main = document.getElementById('appMain');
    if (main && Studia.router.current() === 'dashboard') render(main);
  }

  function init() {
    store.subscribe(function () {
      if (Studia.router.current() === 'dashboard') refresh();
    });
  }

  Studia.modules = Studia.modules || {};
  Studia.modules.dashboard = { init: init, render: render };
  Studia.router.register('dashboard', {
    title: 'Panel',
    subtitle: 'Tu resumen de estudio de hoy',
    render: render
  });
})(window);
