/* =========================================================
   Studia-IA · modules/study.js
   Módulo de estudio: temporizador pomodoro, registro de
   sesiones, objetivo diario y racha.
   ========================================================= */
(function (global) {
  'use strict';

  var Studia = global.Studia = global.Studia || {};
  var U = Studia.utils, store = Studia.store, ui = Studia.ui;

  var timer = {
    mode: 'work',            // work | short | long
    remaining: 25 * 60,
    total: 25 * 60,
    running: false,
    endAt: null,
    cycle: 0,
    subjectId: null,
    taskId: null,
    notes: '',
    tick: null,
    lastFinishedEndAt: null
  };

  var MODES = {
    work: { label: 'Enfoque', color: 'var(--brand-500)' },
    short: { label: 'Descanso corto', color: 'var(--mint-500)' },
    long: { label: 'Descanso largo', color: 'var(--sky-500)' }
  };

  /* ---------------- Timer ---------------- */
  function settings() { return store.get().settings.pomodoro; }

  /* Guarda el estado del pomodoro para que sobreviva a recargas. No se
     llama en cada tick: con `running` + `endAt` basta para recalcular. */
  function saveTimer(extra) {
    store.update(function (s) {
      var prev = s.timer || {};
      s.timer = {
        mode: timer.mode,
        total: timer.total,
        remaining: timer.remaining,
        running: timer.running,
        endAt: timer.running ? timer.endAt : null,
        cycle: timer.cycle,
        subjectId: timer.subjectId,
        taskId: timer.taskId,
        notes: timer.notes,
        lastFinishedEndAt: prev.lastFinishedEndAt || null
      };
      if (extra && extra.lastFinishedEndAt) s.timer.lastFinishedEndAt = extra.lastFinishedEndAt;
    });
  }

  function secondsFor(mode) {
    var p = settings();
    if (mode === 'work') return p.work * 60;
    if (mode === 'short') return p.short * 60;
    return p.long * 60;
  }

  function setMode(mode, autostart) {
    stop();
    timer.mode = mode;
    timer.total = secondsFor(mode);
    timer.remaining = timer.total;
    if (autostart) start();
    refresh();
    updateChip();
    saveTimer();
  }

  function start() {
    if (timer.running) return;
    timer.running = true;
    timer.endAt = Date.now() + timer.remaining * 1000;
    timer.tick = setInterval(onTick, 250);
    refresh();
    updateChip();
    saveTimer();
  }

  function pause() {
    if (!timer.running) return;
    timer.remaining = Math.max(0, Math.round((timer.endAt - Date.now()) / 1000));
    stop();
    refresh();
    updateChip();
    saveTimer();
  }

  function stop() {
    timer.running = false;
    if (timer.tick) clearInterval(timer.tick);
    timer.tick = null;
  }

  function reset() {
    stop();
    timer.remaining = timer.total;
    refresh();
    updateChip();
    saveTimer();
  }

  function onTick() {
    timer.remaining = Math.max(0, Math.round((timer.endAt - Date.now()) / 1000));
    if (timer.remaining <= 0) finish();
    paint();
    updateChip();
  }

  function finish() {
    var endedAt = timer.endAt || Date.now();
    stop();
    beep();
    if (timer.mode === 'work') {
      var p = settings();
      var result = store.addSession({
        date: U.toISO(new Date(endedAt)),
        minutes: p.work,
        subjectId: timer.subjectId,
        taskId: timer.taskId,
        mode: 'pomodoro',
        notes: timer.notes
      });
      timer.cycle += 1;
      var isLong = timer.cycle % (p.cycle || 4) === 0;
      var next = isLong ? 'long' : 'short';
      timer.mode = next;
      timer.total = secondsFor(next);
      timer.remaining = timer.total;

      var info = result.streak;
      ui.toast('¡Sesión completada! +' + result.xp + ' XP · racha de ' + info.current + ' días', 'success', 4200);
      notifyUser('Sesión de estudio completada', 'Has estudiado ' + p.work + ' minutos. Racha: ' + info.current + ' días.');
      checkMilestones(info);

      if (timer.taskId) {
        var task = store.find('tasks', timer.taskId);
        if (task) {
          store.updateRow('tasks', task.id, { done: true, completedAt: U.today() });
          ui.toast('Tarea marcada como completada ✓', 'success');
        }
      }
    } else {
      timer.mode = 'work';
      timer.total = secondsFor('work');
      timer.remaining = timer.total;
      ui.toast('¡Descanso terminado! Vuelve al estudio.', 'info');
    }
    refresh();
    updateChip();
    saveTimer({ lastFinishedEndAt: endedAt });
  }

  function checkMilestones(info) {
    var claimed = store.get().rewards.claimed || [];
    Studia.rewards.MILESTONES.forEach(function (m) {
      if (info.current >= m.days && claimed.indexOf(m.id) === -1) {
        ui.toast('🏅 Hito desbloqueado: ' + m.name + ' (' + m.desc + ')', 'success', 5000);
        store.update(function (s) {
          s.rewards.claimed = (s.rewards.claimed || []).concat([m.id]);
          s.xp = (s.xp || 0) + m.xp;
        });
      }
    });
  }

  function beep() {
    try {
      var ctx = new (global.AudioContext || global.webkitAudioContext)();
      var notes = [880, 1174.66];
      notes.forEach(function (f, i) {
        var osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.type = 'sine'; osc.frequency.value = f;
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.22);
        osc.stop(ctx.currentTime + i * 0.22 + 0.4);
      });
    } catch (e) { /* sin audio: no es crítico */ }
  }

  function notifyUser(title, body) {
    try {
      if (global.Notification && Notification.permission === 'granted') {
        new Notification(title, { body: body, icon: 'assets/img/favicon.svg' });
      }
    } catch (e) { /* sin permisos de notificación */ }
  }

  /* ---------------- Chip del topbar ---------------- */
  function updateChip() {
    var chip = document.getElementById('timerChip');
    if (!chip) return;
    if (!timer.running && timer.mode === 'work' && timer.remaining === timer.total) { chip.hidden = true; return; }
    chip.hidden = false;
    var label = U.fmtClock(timer.remaining);
    chip.querySelector('[data-timer-time]').textContent = label;
    chip.querySelector('[data-timer-mode]').textContent = MODES[timer.mode].label;
  }

  /* ---------------- Render ---------------- */
  function render(root) {
    U.clear(root);
    var today = U.today();
    var goal = store.get().settings.dailyGoal || 120;
    var done = store.minutesOn(today);

    root.appendChild(U.h('div.grid.grid--split', [
      U.h('div.col.gap-2', [
        timerCard(),
        goalCard(done, goal),
        sessionsCard(today)
      ]),
      U.h('div.col.gap-2', [
        setupCard(),
        focusCard(),
        streakCard()
      ])
    ]));
  }

  function timerCard() {
    var p = settings();
    var subjects = store.get().subjects;
    var mode = MODES[timer.mode];
    var pct = timer.total ? (timer.remaining / timer.total) : 0;
    var R = 118, C = 2 * Math.PI * R;

    var ring = U.h('div.timer__ring', [
      U.h('svg', { viewBox: '0 0 268 268', width: '268', height: '268' }, [
        U.h('defs', [
          U.h('linearGradient', { id: 'timerGrad', x1: '0', y1: '0', x2: '1', y2: '1' }, [
            U.h('stop', { offset: '0%', 'stop-color': 'var(--brand-500)' }),
            U.h('stop', { offset: '100%', 'stop-color': 'var(--violet-500)' })
          ])
        ]),
        U.h('circle', { class: 'timer__track', cx: '134', cy: '134', r: R, 'stroke-width': '14' }),
        U.h('circle', {
          class: 'timer__prog', cx: '134', cy: '134', r: R, 'stroke-width': '14',
          'stroke-dasharray': C, 'stroke-dashoffset': C * (1 - pct)
        })
      ]),
      U.h('div.timer__center', [
        U.h('div.timer__time', { 'data-timer-display': '' }, U.fmtClock(timer.remaining)),
        U.h('div.timer__mode', { 'data-timer-mode-label': '' }, mode.label),
        U.h('div.timer__subject', timer.subjectId ? store.subjectName(timer.subjectId) : 'Sin asignatura')
      ])
    ]);

    var subjectSelect = U.h('select.select.select--sm', { onchange: function () { timer.subjectId = subjectSelect.value || null; updateChip(); saveTimer(); } }, [
      U.h('option', { value: '' }, 'Sin asignatura')
    ].concat(subjects.map(function (s) {
      var o = U.h('option', { value: s.id }, s.name);
      if (timer.subjectId === s.id) o.selected = true;
      return o;
    })));

    var openTasks = store.openTasks();
    var taskSelect = U.h('select.select.select--sm', { onchange: function () { timer.taskId = taskSelect.value || null; } }, [
      U.h('option', { value: '' }, 'Sin tarea asociada')
    ].concat(openTasks.map(function (t) {
      var o = U.h('option', { value: t.id }, t.title);
      if (timer.taskId === t.id) o.selected = true;
      return o;
    })));

    return U.h('div.card', [
      U.h('div.timer', [
        ring,
        U.h('div.row.gap-2.row--wrap', { style: { justifyContent: 'center' } }, [
          subjectSelect, taskSelect
        ]),
        U.h('div.timer__controls', [
          U.h('button.icon-btn', { onclick: function () { setMode('work'); }, title: 'Modo enfoque' }, U.icon('play')),
          timer.running
            ? U.h('button.btn.btn--primary.btn--lg', { onclick: pause }, [U.icon('pause'), 'Pausar'])
            : U.h('button.btn.btn--primary.btn--lg', { onclick: start }, [U.icon('play'), timer.remaining < timer.total ? 'Continuar' : 'Empezar']),
          U.h('button.icon-btn', { onclick: reset, title: 'Reiniciar' }, U.icon('reset')),
          U.h('button.icon-btn', { onclick: function () { setMode(timer.mode === 'work' ? 'short' : 'work'); }, title: 'Cambiar modo' }, U.icon('timer'))
        ]),
        U.h('div.timer__mode-tabs', ['work', 'short', 'long'].map(function (k) {
          return U.h('button.btn.btn--sm' + (timer.mode === k ? '.btn--soft' : '.btn--ghost'), {
            onclick: function () { setMode(k); }
          }, MODES[k].label);
        })),
        U.h('p.tiny.soft', 'Ciclo ' + (timer.cycle % (p.cycle || 4)) + ' de ' + (p.cycle || 4) + ' · al completar se guarda la sesión y sube tu racha')
      ])
    ]);
  }

  function goalCard(done, goal) {
    var pct = Math.min(100, Math.round(done / goal * 100));
    return U.h('div.card', [
      U.h('div.card__head', [
        U.h('div', [U.h('h3', 'Objetivo diario'), U.h('p', goal + ' min de estudio al día')]),
        U.h('span.badge' + (done >= goal ? '.badge--mint' : '.badge--brand'), done + ' / ' + goal + ' min')
      ]),
      U.h('div.progress' + (done >= goal ? '.progress--mint' : ''), U.h('div.progress__bar', { style: { width: pct + '%' } })),
      U.h('p.tiny.soft.mt-1', done >= goal ? '¡Objetivo cumplido! Mantén la racha para conseguir el hito de esta semana.' : 'Te faltan ' + (goal - done) + ' minutos para cumplirlo hoy.')
    ]);
  }

  function sessionsCard(today) {
    var sessions = U.sortBy(store.get().sessions.filter(function (s) { return s.date === today; }), function (s) { return s.id; });
    return U.h('div.card', [
      U.h('div.card__head', [
        U.h('h3', 'Sesiones de hoy'),
        U.h('span.badge', sessions.length)
      ]),
      sessions.length ? U.h('div.pomo-sessions', sessions.map(function (s) {
        return U.h('div.pomo-session', [
          U.h('span.pomo-session__dot', { style: { background: store.subjectColor(s.subjectId) } }),
          U.h('span.grow', store.subjectName(s.subjectId)),
          U.h('span.badge', s.mode === 'pomodoro' ? 'Pomodoro' : 'Libre'),
          U.h('span.small.strong', s.minutes + ' min')
        ]);
      })) : U.h('p.small.soft', 'Todavía no has estudiado hoy. Arranca un pomodoro de 25 minutos.')
    ]);
  }

  function setupCard() {
    var p = settings();
    function num(label, key, min, max) {
      var input = U.h('input.input.input--sm', { type: 'number', min: min, max: max, value: p[key] });
      input.addEventListener('change', function () {
        var v = U.clamp(+input.value || p[key], min, max);
        input.value = v;
        store.update(function (s) { s.settings.pomodoro[key] = v; });
        if (timer.mode === key || (key === 'work' && timer.mode === 'work')) {
          timer.total = secondsFor(timer.mode);
          if (!timer.running) timer.remaining = timer.total;
        }
        refresh();
      });
      return U.h('div.field', [U.h('label.field__label', label), input]);
    }
    return U.h('div.card', [
      U.h('h3.mb-2', 'Ajustes del temporizador'),
      U.h('div.col.gap-2', [
        num('Foco (min)', 'work', 5, 90),
        num('Descanso corto (min)', 'short', 1, 30),
        num('Descanso largo (min)', 'long', 5, 60),
        num('Ciclos antes del descanso largo', 'cycle', 2, 8)
      ])
    ]);
  }

  function focusCard() {
    var exam = store.nextExam();
    var days = exam ? U.daysBetween(new Date(), exam.date) : null;
    return U.h('div.card', [
      U.h('h3.mb-2', 'Próximo examen'),
      exam ? U.h('div', [
        U.h('div.row.gap-2', [
          U.h('span.dot-color', { style: { background: store.subjectColor(exam.subjectId) } }),
          U.h('strong', exam.title)
        ]),
        U.h('p.small.muted.mt-1', U.fmtDate(exam.date, { weekday: true }) + (exam.start ? ' · ' + exam.start.slice(0, 5) : '')),
        days !== null ? U.h('p.small.mt-1', days === 0 ? '¡Es hoy!' : 'Quedan ' + days + ' días') : null
      ]) : U.h('p.small.soft', 'No hay exámenes programados.')
    ]);
  }

  function streakCard() {
    var info = store.streakInfo();
    var levels = Studia.rewards.status(info, store.get().rewards.claimed);
    var next = levels.filter(function (l) { return !l.unlocked; })[0];
    return U.h('div.card', [
      U.h('div.card__head', [U.h('h3', 'Racha'), U.h('span.badge.badge--amber', info.current + ' días')]),
      U.h('p.small.muted', 'Mejor racha: ' + info.best + ' días · ' + info.total + ' días estudiados en total'),
      next ? U.h('div.mt-2', [
        U.h('div.row.row--between.tiny.mb-1', [
          U.h('span.soft', 'Siguiente hito: ' + next.milestone.name),
          U.h('span.strong', Math.max(0, next.milestone.days - info.current) + ' días')
        ]),
        U.h('div.progress.progress--amber.progress--thin', U.h('div.progress__bar', { style: { width: (info.current / next.milestone.days * 100) + '%' } }))
      ]) : U.h('p.small.mt-2', '¡Has desbloqueado todos los hitos! Eres una leyenda.')
    ]);
  }

  /* ---------------- Auxiliares ---------------- */
  function paint() {
    var display = document.querySelector('[data-timer-display]');
    if (display) display.textContent = U.fmtClock(timer.remaining);
    var label = document.querySelector('[data-timer-mode-label]');
    if (label) label.textContent = MODES[timer.mode].label;
    var ring = document.querySelector('.timer__prog');
    if (ring) {
      var C = 2 * Math.PI * 118;
      var pct = timer.total ? (timer.remaining / timer.total) : 0;
      ring.setAttribute('stroke-dashoffset', C * (1 - pct));
    }
  }

  function refresh() {
    var main = document.getElementById('appMain');
    if (main && Studia.router.current() === 'study') render(main);
  }

  /* Recupera el pomodoro guardado. Devuelve false si no había ninguno. */
  function restoreTimer() {
    var saved = store.get().timer;
    if (!saved) return false;
    timer.mode = MODES[saved.mode] ? saved.mode : 'work';
    timer.total = saved.total || secondsFor(timer.mode);
    timer.cycle = saved.cycle || 0;
    timer.subjectId = saved.subjectId || null;
    timer.taskId = saved.taskId || null;
    timer.notes = saved.notes || '';
    timer.lastFinishedEndAt = saved.lastFinishedEndAt || null;

    if (saved.running && saved.endAt) {
      var left = Math.round((saved.endAt - Date.now()) / 1000);
      if (left > 0) {
        timer.remaining = left;
        start();                       // reanuda y recalcula endAt
        return true;
      }
      timer.endAt = saved.endAt;
      if (saved.endAt !== saved.lastFinishedEndAt) {
        timer.remaining = 0;
        finish();                      // terminó mientras la app estaba cerrada
        return true;
      }
      timer.remaining = timer.total;
    } else {
      timer.remaining = Math.min(saved.remaining || timer.total, timer.total);
    }
    refresh();
    updateChip();
    return true;
  }

  function init() {
    if (!restoreTimer()) {
      timer.subjectId = store.get().subjects.length ? store.get().subjects[0].id : null;
      timer.total = secondsFor('work');
      timer.remaining = timer.total;
    }
    store.subscribe(function () {
      if (Studia.router.current() === 'study') refresh();
    });
  }

  Studia.modules = Studia.modules || {};
  Studia.modules.study = {
    init: init, render: render,
    state: function () { return timer; },
    setMode: setMode, start: start, pause: pause, reset: reset
  };
  Studia.router.register('study', {
    title: 'Estudio',
    subtitle: 'Temporizador pomodoro, sesiones y objetivo diario',
    render: render
  });
})(window);
