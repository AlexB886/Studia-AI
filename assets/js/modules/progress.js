/* =========================================================
   Studia-IA · modules/progress.js
   Línea de progresión, estadísticas, mapa de calor y
   recompensas por racha.
   ========================================================= */
(function (global) {
  'use strict';

  var Studia = global.Studia = global.Studia || {};
  var U = Studia.utils, store = Studia.store, ui = Studia.ui;

  var view = { range: 30 };

  /* ---------------- Estadísticas ---------------- */
  function stats(range) {
    var from = U.toISO(U.addDays(new Date(), -(range - 1)));
    var to = U.today();
    var inRange = store.get().sessions.filter(function (s) { return s.date >= from && s.date <= to; });
    var total = U.sum(inRange, function (s) { return s.minutes; });

    var weekFrom = U.toISO(U.addDays(new Date(), -6));
    var week = U.sum(store.get().sessions.filter(function (s) { return s.date >= weekFrom; }), function (s) { return s.minutes; });

    var activeDays = {};
    inRange.forEach(function (s) { activeDays[s.date] = true; });
    var days = Object.keys(activeDays).length;
    var avg = days ? Math.round(total / days) : 0;

    var bySubject = {};
    inRange.forEach(function (s) {
      if (!s.subjectId) return;
      bySubject[s.subjectId] = (bySubject[s.subjectId] || 0) + s.minutes;
    });

    return {
      total: total,
      week: week,
      avg: avg,
      activeDays: days,
      bySubject: Object.keys(bySubject).map(function (id) {
        return { subjectId: id, minutes: bySubject[id] };
      }).sort(function (a, b) { return b.minutes - a.minutes; }),
      inRange: inRange
    };
  }

  function series(range) {
    var out = [];
    for (var i = range - 1; i >= 0; i--) {
      var d = U.addDays(new Date(), -i);
      out.push({ date: d, iso: U.toISO(d), minutes: store.minutesOn(U.toISO(d)) });
    }
    return out;
  }

  /* ---------------- Gráficos ---------------- */
  function lineChart(data, range) {
    var W = 760, H = 240, padL = 42, padR = 12, padT = 16, padB = 28;
    var max = Math.max(60, Math.max.apply(null, data.map(function (d) { return d.minutes; })));
    max = Math.ceil(max / 30) * 30;
    var innerW = W - padL - padR, innerH = H - padT - padB;
    var step = innerW / Math.max(1, data.length - 1);

    function x(i) { return padL + i * step; }
    function y(v) { return padT + innerH - (v / max) * innerH; }

    var svg = U.h('svg.chart', { viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'none', style: { height: '260px' } });

    svg.appendChild(U.h('defs', [
      U.h('linearGradient', { id: 'areaGrad', x1: '0', y1: '0', x2: '0', y2: '1' }, [
        U.h('stop', { offset: '0%', 'stop-color': 'var(--brand-500)', 'stop-opacity': '.28' }),
        U.h('stop', { offset: '100%', 'stop-color': 'var(--brand-500)', 'stop-opacity': '0' })
      ])
    ]));

    /* rejilla y eje Y */
    for (var g = 0; g <= 4; g++) {
      var v = (max / 4) * g;
      svg.appendChild(U.h('line', { class: 'chart__grid', x1: padL, x2: W - padR, y1: y(v), y2: y(v) }));
      svg.appendChild(U.h('text', { class: 'chart__label', x: padL - 8, y: y(v) + 4, 'text-anchor': 'end' }, String(Math.round(v))));
    }

    var pts = data.map(function (d, i) { return [x(i), y(d.minutes)]; });
    var linePath = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
    var areaPath = linePath + ' L' + x(data.length - 1).toFixed(1) + ' ' + (padT + innerH) + ' L' + padL + ' ' + (padT + innerH) + ' Z';

    svg.appendChild(U.h('path', { class: 'chart__area', d: areaPath }));
    svg.appendChild(U.h('path', { class: 'chart__line', d: linePath }));

    pts.forEach(function (p, i) {
      var d = data[i];
      svg.appendChild(U.h('circle', { class: 'chart__dot', cx: p[0], cy: p[1], r: 3.4, opacity: d.minutes ? 1 : 0 }));
      var title = U.h('title');
      title.textContent = U.fmtDate(d.iso, { short: true, day: true }) + ': ' + d.minutes + ' min';
      svg.appendChild(title);
    });

    /* eje X */
    var every = Math.ceil(data.length / 10);
    data.forEach(function (d, i) {
      if (i % every !== 0 && i !== data.length - 1) return;
      svg.appendChild(U.h('text', { class: 'chart__label', x: x(i), y: H - 8, 'text-anchor': 'middle' }, U.fmtDate(d.iso, { short: true, day: true })));
    });

    return svg;
  }

  function barChart(items) {
    var W = 760, H = 210, padL = 42, padR = 12, padT = 14, padB = 34;
    var max = Math.max(30, Math.max.apply(null, items.map(function (i) { return i.minutes; })));
    var innerW = W - padL - padR, innerH = H - padT - padB;
    var bw = Math.min(70, (innerW / Math.max(1, items.length)) * 0.55);
    var gap = (innerW - bw * items.length) / Math.max(1, items.length);

    var svg = U.h('svg.chart', { viewBox: '0 0 ' + W + ' ' + H, style: { height: '230px' } });
    for (var g = 0; g <= 4; g++) {
      var v = (max / 4) * g;
      var yy = padT + innerH - (v / max) * innerH;
      svg.appendChild(U.h('line', { class: 'chart__grid', x1: padL, x2: W - padR, y1: yy, y2: yy }));
      svg.appendChild(U.h('text', { class: 'chart__label', x: padL - 8, y: yy + 4, 'text-anchor': 'end' }, String(Math.round(v))));
    }

    items.forEach(function (it, i) {
      var x = padL + gap * (i + 1) + bw * i;
      var h = (it.minutes / max) * innerH;
      var y = padT + innerH - h;
      var rect = U.h('rect', { class: 'chart__bar', x: x, y: y, width: bw, height: Math.max(3, h), fill: store.subjectColor(it.subjectId) });
      var t = U.h('title');
      t.textContent = store.subjectName(it.subjectId) + ': ' + U.fmtMinutes(it.minutes);
      rect.appendChild(t);
      svg.appendChild(rect);
      svg.appendChild(U.h('text', { class: 'chart__label', x: x + bw / 2, y: y - 6, 'text-anchor': 'middle' }, U.fmtMinutes(it.minutes)));
      var label = store.subjectName(it.subjectId);
      svg.appendChild(U.h('text', { class: 'chart__label', x: x + bw / 2, y: H - 12, 'text-anchor': 'middle' }, label.length > 14 ? label.slice(0, 13) + '…' : label));
    });

    return svg;
  }

  function heatmap() {
    var weeks = 16;
    var cells = [];
    var start = U.startOfWeek(U.addDays(new Date(), -(weeks * 7 - 1)), 1);
    var history = store.get().streak.history || {};
    for (var i = 0; i < weeks * 7; i++) {
      var d = U.addDays(start, i);
      var iso = U.toISO(d);
      var mins = history[iso] || 0;
      var level = mins === 0 ? 0 : mins < 30 ? 1 : mins < 60 ? 2 : mins < 120 ? 3 : 4;
      cells.push({ iso: iso, level: level, future: d > new Date() });
    }
    var grid = U.h('div.heat');
    cells.forEach(function (c) {
      var cell = U.h('div.heat__cell' + (c.level ? '.heat__cell--l' + c.level : ''), {
        title: c.iso + ': ' + (c.level ? 'estudiado' : 'sin estudiar'),
        style: c.future ? { opacity: '.35' } : null
      });
      grid.appendChild(cell);
    });
    return grid;
  }

  /* ---------------- Render ---------------- */
  function render(root) {
    U.clear(root);
    var s = stats(view.range);
    var info = store.streakInfo();
    var lvl = store.levelInfo();
    var data = series(view.range);

    root.appendChild(U.h('div.col.gap-2', [
      U.h('div.grid.grid-4', [
        statCard('timer', 'var(--brand-500)', U.fmtHours(s.total), 'Tiempo total', 'Últimos ' + view.range + ' días', 'brand'),
        statCard('chart', 'var(--mint-500)', U.fmtHours(s.week), 'Esta semana', 'Últimos 7 días', 'mint'),
        statCard('fire', 'var(--amber-500)', info.current + ' días', 'Racha actual', 'Mejor: ' + info.best + ' días', 'amber'),
        statCard('star', 'var(--violet-500)', 'Nivel ' + lvl.level, lvl.xp + ' XP', 'Para el siguiente: ' + (lvl.needed - lvl.current) + ' XP', 'violet')
      ]),

      U.h('div.card', [
        U.h('div.card__head', [
          U.h('div', [U.h('h3', 'Línea de progresión'), U.h('p', 'Minutos de estudio por día')]),
          U.h('div.segmented', [14, 30, 90].map(function (r) {
            return U.h('button', { class: view.range === r ? 'is-active' : '', onclick: function () { view.range = r; refresh(); } }, r + ' d');
          }))
        ]),
        lineChart(data, view.range),
        U.h('div.row.row--between.row--wrap.gap-2.mt-2', [
          U.h('span.tiny.soft', s.activeDays + ' días activos de ' + view.range + ' · media de ' + s.avg + ' min por día activo'),
          U.h('span.tiny.soft', 'Objetivo diario: ' + (store.get().settings.dailyGoal || 120) + ' min')
        ])
      ]),

      U.h('div.grid.grid--split', [
        U.h('div.col.gap-2', [
          U.h('div.card', [
            U.h('div.card__head', [U.h('div', [U.h('h3', 'Reparto por asignatura'), U.h('p', 'Dónde se va tu tiempo')])]),
            s.bySubject.length ? barChart(s.bySubject) : U.h('p.small.soft', 'Aún no hay sesiones en este periodo.')
          ]),
          U.h('div.card', [
            U.h('div.card__head', [
              U.h('div', [U.h('h3', 'Mapa de actividad'), U.h('p', 'Últimas 16 semanas')]),
              U.h('div.heat__legend', [
                U.h('span', 'menos'),
                U.h('span.heat__cell'), U.h('span.heat__cell.heat__cell--l1'), U.h('span.heat__cell.heat__cell--l2'),
                U.h('span.heat__cell.heat__cell--l3'), U.h('span.heat__cell.heat__cell--l4'),
                U.h('span', 'más')
              ])
            ]),
            heatmap()
          ])
        ]),
        U.h('div.col.gap-2', [
          levelCard(lvl),
          rewardsCard(info)
        ])
      ])
    ]));
  }

  function statCard(ic, color, value, label, sub, tone) {
    return U.h('div.stat', [
      U.h('div.stat__icon' + (tone ? '.stat__icon--' + tone : ''), { style: { color: color } }, U.icon(ic)),
      U.h('div.stat__body', [
        U.h('span.stat__value', value),
        U.h('span.stat__label', label),
        U.h('span.tiny.soft', sub)
      ])
    ]);
  }

  function levelCard(lvl) {
    return U.h('div.card', [
      U.h('div.card__head', [U.h('h3', 'Nivel de estudiante'), U.h('span.badge.badge--violet', 'Nivel ' + lvl.level)]),
      U.h('div.progress.progress--thin', U.h('div.progress__bar', { style: { width: lvl.percent + '%' } })),
      U.h('p.tiny.soft.mt-1', lvl.current + ' / ' + lvl.needed + ' XP para el nivel ' + (lvl.level + 1)),
      U.h('p.tiny.soft.mt-2', 'Ganas XP por cada minuto de estudio y por completar pomodoros.')
    ]);
  }

  function rewardsCard(info) {
    var list = Studia.rewards.status(info, store.get().rewards.claimed);
    return U.h('div.card', [
      U.h('div.card__head', [U.h('h3', 'Recompensas por racha'), U.h('span.badge.badge--amber', list.filter(function (l) { return l.unlocked; }).length + '/' + list.length)]),
      U.h('div.col.gap-2', list.map(function (l) {
        var cls = l.claimed ? '.reward--claimed' : (l.unlocked ? '.reward--unlocked' : '');
        return U.h('div.reward' + cls, [
          U.h('div.reward__icon', U.icon(l.claimed ? 'check' : (l.unlocked ? 'trophy' : (l.milestone.icon || 'star')))),
          U.h('div.grow', [
            U.h('div.small.strong', l.milestone.name),
            U.h('div.tiny.soft', l.milestone.desc + ' · +' + l.milestone.xp + ' XP')
          ]),
          l.claimed ? U.h('span.badge.badge--mint', 'Reclamada') : (l.unlocked ? U.h('span.badge.badge--amber', 'Lista') : U.h('span.badge', 'Bloqueada'))
        ]);
      }))
    ]);
  }

  function refresh() {
    var main = document.getElementById('appMain');
    if (main && Studia.router.current() === 'progress') render(main);
  }

  function init() {
    store.subscribe(function () {
      if (Studia.router.current() === 'progress') refresh();
    });
  }

  Studia.modules = Studia.modules || {};
  Studia.modules.progress = { init: init, render: render };
  Studia.router.register('progress', {
    title: 'Progresión',
    subtitle: 'Tu línea de progresión, estadísticas y recompensas',
    render: render
  });
})(window);
