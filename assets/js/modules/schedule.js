/* =========================================================
   Studia-IA · modules/schedule.js
   Horario semanal: clases, laboratorios, detección de
   solapamientos y resumen de horas por asignatura.
   ========================================================= */
(function (global) {
  'use strict';

  var Studia = global.Studia = global.Studia || {};
  var U = Studia.utils, store = Studia.store, ui = Studia.ui;

  var HOUR_H = 56;          // px por hora
  var START_H = 8;
  var END_H = 21;
  var WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  var COLORS = ['var(--brand-500)', 'var(--mint-500)', 'var(--amber-500)', 'var(--rose-500)', 'var(--sky-500)', 'var(--violet-500)'];

  var view = { showWeekend: false, selectedDay: null };

  /* ---------------- Detección de conflictos ---------------- */
  function conflictsOf(day) {
    var list = store.get().timetable.filter(function (c) { return c.day === day; });
    var pairs = [];
    for (var i = 0; i < list.length; i++) {
      for (var j = i + 1; j < list.length; j++) {
        var a = list[i], b = list[j];
        var aS = U.timeToMinutes(a.start), aE = U.timeToMinutes(a.end);
        var bS = U.timeToMinutes(b.start), bE = U.timeToMinutes(b.end);
        if (aS < bE && bS < aE) pairs.push([a.id, b.id]);
      }
    }
    return pairs;
  }

  function isConflicting(id) {
    return conflictsOf(store.find('timetable', id).day)
      .some(function (p) { return p[0] === id || p[1] === id; });
  }

  /* ---------------- Resumen ---------------- */
  function weeklySummary() {
    var bySubject = {};
    store.get().timetable.forEach(function (c) {
      var mins = U.minutesBetween(c.start, c.end);
      bySubject[c.subjectId] = (bySubject[c.subjectId] || 0) + mins;
    });
    return Object.keys(bySubject).map(function (id) {
      return { subjectId: id, minutes: bySubject[id], hours: (bySubject[id] / 60).toFixed(1) };
    }).sort(function (a, b) { return b.minutes - a.minutes; });
  }

  /* ---------------- Render ---------------- */
  function render(root) {
    U.clear(root);
    root.appendChild(U.h('div.grid.grid--split', { style: { '--split': '320px' } }, [
      scheduleCard(),
      sideColumn()
    ]));
  }

  function scheduleCard() {
    var days = view.showWeekend ? 7 : 5;
    var todayIdx = U.dayIndex(new Date());
    var gridTpl = '64px repeat(' + days + ', minmax(0, 1fr))';

    var head = U.h('div.tt__head', { style: { gridTemplateColumns: gridTpl } }, [U.h('div.tt__corner', 'Hora')]);
    for (var d = 0; d < days; d++) {
      head.appendChild(U.h('div.tt__day' + (d === todayIdx ? '.tt__day--today' : ''), U.DIAS[d].slice(0, 3) + (d === todayIdx ? ' · hoy' : '')));
    }

    var body = U.h('div.tt__body', { style: { gridTemplateColumns: gridTpl } });

    /* Columna de horas */
    var hours = U.h('div.tt__hours');
    for (var hh = START_H; hh < END_H; hh++) {
      hours.appendChild(U.h('div.tt__hour', U.pad(hh) + ':00'));
    }
    body.appendChild(hours);

    /* Columnas de días */
    for (var day = 0; day < days; day++) {
      (function (day) {
        var col = U.h('div.tt__col' + (day === todayIdx ? '.tt__col--today' : ''));
        for (var line = START_H; line < END_H; line++) {
          col.appendChild(U.h('div.tt__grid-line', { style: { top: ((line - START_H) * HOUR_H) + 'px' } }));
        }
        col.addEventListener('click', function (ev) {
          if (ev.target !== col) return;
          var rect = col.getBoundingClientRect();
          var minutes = START_H * 60 + Math.round((ev.clientY - rect.top) / HOUR_H * 60 / 15) * 15;
          minutes = U.clamp(minutes, START_H * 60, (END_H - 1) * 60);
          openForm(null, { day: day, start: U.minutesToTime(minutes), end: U.minutesToTime(Math.min(minutes + 90, END_H * 60)) });
        });

        store.get().timetable.filter(function (c) { return c.day === day; }).forEach(function (c) {
          var s = U.timeToMinutes(c.start), e = U.timeToMinutes(c.end);
          var top = (s - START_H * 60) / 60 * HOUR_H;
          var height = Math.max(26, (e - s) / 60 * HOUR_H - 3);
          var color = store.subjectColor(c.subjectId);
          col.appendChild(U.h('button.tt__class' + (isConflicting(c.id) ? '.tt__class--conflict' : ''), {
            style: { top: top + 'px', height: height + 'px', borderLeftColor: color, background: 'color-mix(in srgb, ' + color + ' 12%, var(--surface))' },
            onclick: function (ev) { ev.stopPropagation(); openForm(c); },
            title: c.start + '–' + c.end + ' · ' + store.subjectName(c.subjectId)
          }, [
            U.h('strong', store.subjectName(c.subjectId)),
            U.h('span', c.start.slice(0, 5) + '–' + c.end.slice(0, 5) + (c.room ? ' · ' + c.room : ''))
          ]));
        });

        /* Línea de "ahora" */
        if (day === todayIdx) {
          var now = new Date();
          var nowMin = now.getHours() * 60 + now.getMinutes();
          if (nowMin >= START_H * 60 && nowMin <= END_H * 60) {
            col.appendChild(U.h('div.tt__now', { style: { top: ((nowMin - START_H * 60) / 60 * HOUR_H) + 'px' } }));
          }
        }
        body.appendChild(col);
      })(day);
    }

    return U.h('div.card.card--flush', [
      U.h('div.row.row--between.row--wrap.gap-2', { style: { padding: '16px 18px' } }, [
        U.h('div', [
          U.h('h3', 'Horario semanal'),
          U.h('p.tiny.soft', 'Haz clic en una franja para crear una clase · clic en una clase para editarla')
        ]),
        U.h('div.row.gap-1', [
          U.h('div.segmented', [
            U.h('button', { class: view.showWeekend ? '' : 'is-active', onclick: function () { view.showWeekend = false; refresh(); } }, 'L–V'),
            U.h('button', { class: view.showWeekend ? 'is-active' : '', onclick: function () { view.showWeekend = true; refresh(); } }, 'L–D')
          ]),
          U.h('button.btn.btn--primary.btn--sm', { onclick: function () { openForm(null, { day: U.dayIndex(new Date()), start: '09:00', end: '10:30' }); } }, [U.icon('plus'), 'Clase'])
        ])
      ]),
      U.h('div.tt', [head, body]),
      U.h('p.tt-hint.tiny.soft', 'Desliza en horizontal para ver toda la semana')
    ]);
  }

  function sideColumn() {
    var summary = weeklySummary();
    var conflicts = [];
    for (var d = 0; d < 7; d++) {
      conflictsOf(d).forEach(function (p) { conflicts.push({ day: d, ids: p }); });
    }
    var today = store.todayClasses();

    return U.h('div.col.gap-2', [
      U.h('div.card', [
        U.h('div.card__head', [U.h('h3', 'Hoy en clase'), U.h('span.badge.badge--brand', today.length + ' clases')]),
        today.length ? U.h('div.col.gap-1', today.map(function (c) {
          return U.h('div.row.gap-2', [
            U.h('span.mono.small.soft.nowrap', c.start.slice(0, 5)),
            U.h('span.dot-color', { style: { background: store.subjectColor(c.subjectId) } }),
            U.h('span.small.grow.truncate', store.subjectName(c.subjectId)),
            U.h('span.tiny.soft.nowrap', c.room || '')
          ]);
        })) : U.h('p.small.soft', 'Hoy no tienes clases registradas.')
      ]),
      U.h('div.card', [
        U.h('div.card__head', [U.h('h3', 'Horas por asignatura'), U.h('span.tiny.soft', 'semanales')]),
        U.h('div.col.gap-2', summary.length ? summary.map(function (s) {
          var total = summary.reduce(function (a, b) { return a + b.minutes; }, 0);
          return U.h('div.goal', [
            U.h('div.goal__row', [
              U.h('span.row.gap-2', [U.h('span.dot-color', { style: { background: store.subjectColor(s.subjectId) } }), U.h('span.small', store.subjectName(s.subjectId))]),
              U.h('span.small.strong', s.hours + ' h')
            ]),
            U.h('div.progress.progress--thin', U.h('div.progress__bar', { style: { width: (s.minutes / total * 100) + '%', background: store.subjectColor(s.subjectId) } }))
          ]);
        }) : U.h('p.small.soft', 'Añade clases para ver el reparto de horas.'))
      ]),
      conflicts.length ? U.h('div.card', { style: { borderColor: 'rgba(244,63,94,.4)' } }, [
        U.h('div.card__head', [U.h('h3', 'Solapamientos'), U.h('span.badge.badge--rose', conflicts.length)]),
        U.h('div.col.gap-1', conflicts.map(function (c) {
          var a = store.find('timetable', c.ids[0]), b = store.find('timetable', c.ids[1]);
          return U.h('p.small', [
            U.h('strong', U.DIAS[c.day] + ': '),
            store.subjectName(a.subjectId) + ' y ' + store.subjectName(b.subjectId) + ' se pisan.'
          ]);
        }))
      ]) : null
    ]);
  }

  /* ---------------- CRUD ---------------- */
  function openForm(existing, defaults) {
    var isNew = !existing;
    var c = existing || Object.assign({ subjectId: '', day: 0, start: '09:00', end: '10:30', room: '', type: 'class' }, defaults || {});
    var subjectOptions = store.get().subjects.map(function (s) { return { value: s.id, label: s.name }; });

    ui.formModal({
      title: isNew ? 'Nueva clase' : 'Editar clase',
      subtitle: 'El horario se actualiza al instante y avisa de solapamientos.',
      fields: [
        { name: 'subjectId', label: 'Asignatura', type: 'select', value: c.subjectId, options: subjectOptions, required: true },
        { name: 'day', label: 'Día', type: 'select', value: c.day, options: U.DIAS.map(function (d, i) { return { value: i, label: d }; }) },
        { name: 'start', label: 'Hora de inicio', type: 'time', value: c.start, required: true },
        { name: 'end', label: 'Hora de fin', type: 'time', value: c.end, required: true },
        { name: 'room', label: 'Aula', value: c.room, placeholder: 'B-204, Lab. 3…' },
        { name: 'type', label: 'Tipo', type: 'select', value: c.type, options: [
          { value: 'class', label: 'Clase' }, { value: 'lab', label: 'Laboratorio' }, { value: 'study', label: 'Sesión de estudio' }
        ] }
      ],
      submitLabel: isNew ? 'Añadir al horario' : 'Guardar',
      onSubmit: function (v) {
        if (U.timeToMinutes(v.end) <= U.timeToMinutes(v.start)) {
          ui.toast('La hora de fin debe ser posterior a la de inicio', 'warn');
          return false;
        }
        var payload = {
          subjectId: v.subjectId, day: +v.day, start: v.start, end: v.end, room: v.room, type: v.type
        };
        if (isNew) {
          store.add('timetable', payload);
          ui.toast('Clase añadida al horario', 'success');
        } else {
          store.updateRow('timetable', c.id, payload);
          ui.toast('Clase actualizada', 'success');
        }
        refresh();
      }
    });
  }

  function refresh() {
    var main = document.getElementById('appMain');
    if (main && Studia.router.current() === 'schedule') render(main);
  }

  function init() {
    store.subscribe(function () {
      if (Studia.router.current() === 'schedule') refresh();
    });
  }

  Studia.modules = Studia.modules || {};
  Studia.modules.schedule = { init: init, render: render };
  Studia.router.register('schedule', {
    title: 'Horario',
    subtitle: 'Tus clases, laboratorios y sesiones de la semana',
    render: render
  });
})(window);
