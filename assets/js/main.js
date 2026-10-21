/* =========================================================
   Studia-IA · main.js
   Arranque de la aplicación: tema, barra superior, búsqueda,
   recordatorios y navegación.
   ========================================================= */
(function (global) {
  'use strict';

  var Studia = global.Studia;
  var U = Studia.utils, store = Studia.store, ui = Studia.ui;

  /* ---------------- Tema ---------------- */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
  }

  function toggleTheme() {
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    store.update(function (s) { s.settings.theme = next; });
  }

  /* ---------------- Barra lateral ---------------- */
  function wireSidebar() {
    var sidebar = document.getElementById('sidebar');
    var scrim = document.getElementById('sidebarScrim');
    function open() { sidebar.classList.add('is-open'); scrim.classList.add('is-open'); }
    function close() { sidebar.classList.remove('is-open'); scrim.classList.remove('is-open'); }
    document.getElementById('btnOpenSidebar').addEventListener('click', open);
    document.getElementById('btnCloseSidebar').addEventListener('click', close);
    scrim.addEventListener('click', close);
    U.$$('.nav__item[data-nav]').forEach(function (a) {
      a.addEventListener('click', function () { if (global.innerWidth <= 1024) close(); });
    });
  }

  /* ---------------- Búsqueda global ---------------- */
  function wireSearch() {
    var input = document.getElementById('globalSearch');
    var results = document.getElementById('searchResults');

    function close() { results.hidden = true; }

    function run() {
      var q = input.value.trim().toLowerCase();
      if (q.length < 2) { close(); return; }
      var state = store.get();
      var found = [];

      state.subjects.forEach(function (s) {
        if ((s.name + ' ' + (s.code || '') + ' ' + (s.teacher || '')).toLowerCase().indexOf(q) !== -1) {
          found.push({ group: 'Asignaturas', icon: 'book', title: s.name, sub: s.teacher || '', action: function () { Studia.router.go('subjects'); } });
        }
      });
      state.tasks.forEach(function (t) {
        if (t.title.toLowerCase().indexOf(q) !== -1) {
          found.push({ group: 'Tareas', icon: 'check', title: t.title, sub: store.subjectName(t.subjectId), action: function () { Studia.router.go('tasks'); } });
        }
      });
      state.notes.forEach(function (n) {
        if (n.title.toLowerCase().indexOf(q) !== -1) {
          found.push({ group: 'Apuntes', icon: 'file', title: n.title, sub: store.subjectName(n.subjectId), action: function () { Studia.router.go('subjects'); } });
        }
      });
      state.events.forEach(function (e) {
        if (e.title.toLowerCase().indexOf(q) !== -1) {
          found.push({ group: 'Calendario', icon: 'calendar', title: e.title, sub: U.fmtDate(e.date, { short: true, day: true }), action: function () { Studia.router.go('calendar'); } });
        }
      });
      state.forum.forEach(function (p) {
        if (p.text.toLowerCase().indexOf(q) !== -1) {
          found.push({ group: 'Foro', icon: 'users', title: p.text.slice(0, 60), sub: p.author, action: function () { Studia.router.go('social'); } });
        }
      });

      U.clear(results);
      if (!found.length) {
        results.appendChild(U.h('div.search-results__item.soft', 'Sin resultados para «' + q + '»'));
      } else {
        var groups = U.groupBy(found, function (f) { return f.group; });
        Object.keys(groups).forEach(function (g) {
          results.appendChild(U.h('div.search-results__group', g));
          groups[g].slice(0, 5).forEach(function (f) {
            results.appendChild(U.h('button.search-results__item', {
              onclick: function () { close(); input.value = ''; f.action(); }
            }, [
              U.icon(f.icon),
              U.h('div.grow', [U.h('div', f.title), U.h('div.tiny.soft', f.sub || '')])
            ]));
          });
        });
      }
      results.hidden = false;
    }

    input.addEventListener('input', U.debounce(run, 180));
    input.addEventListener('focus', function () { if (input.value.trim().length >= 2) run(); });
    document.addEventListener('click', function (e) {
      if (!results.contains(e.target) && e.target !== input) close();
    });
  }

  /* ---------------- Recordatorios ---------------- */
  function wireBell() {
    var btn = document.getElementById('btnBell');
    var popover = document.getElementById('bellPopover');

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (!popover.hidden) { popover.hidden = true; return; }
      drawReminders(popover);
      popover.hidden = false;
      setTimeout(function () {
        document.addEventListener('click', function h(ev) {
          if (!popover.contains(ev.target) && ev.target !== btn) { popover.hidden = true; document.removeEventListener('click', h); }
        });
      }, 0);
    });
  }

  function drawReminders(popover) {
    U.clear(popover);
    var today = U.today();
    var soon = U.sortBy(store.get().events.filter(function (e) {
      return e.date >= today && U.daysBetween(today, e.date) <= 3;
    }), function (e) { return e.date + (e.start || ''); });

    var overdue = store.overdueTasks();

    popover.appendChild(U.h('div.row.row--between.mb-2', [
      U.h('strong.small', 'Recordatorios'),
      U.h('span.badge', soon.length + overdue.length)
    ]));

    if (overdue.length) {
      popover.appendChild(U.h('p.field__label.mb-1', 'Tareas vencidas'));
      overdue.forEach(function (t) {
        popover.appendChild(U.h('button.search-results__item', {
          onclick: function () { popover.hidden = true; Studia.router.go('tasks'); }
        }, [U.icon('check'), U.h('div.grow', [U.h('div.tiny.strong', t.title), U.h('div.tiny.soft', 'Vencía ' + U.fmtRelative(t.due))])]));
      });
    }

    if (soon.length) {
      popover.appendChild(U.h('p.field__label.mb-1', 'Próximos 3 días'));
      soon.forEach(function (e) {
        popover.appendChild(U.h('button.search-results__item', {
          onclick: function () { popover.hidden = true; Studia.router.go('calendar'); }
        }, [U.icon('calendar'), U.h('div.grow', [U.h('div.tiny.strong', e.title), U.h('div.tiny.soft', U.fmtRelative(e.date) + (e.start ? ' · ' + e.start.slice(0, 5) : ''))])]));
      });
    }

    if (!soon.length && !overdue.length) {
      popover.appendChild(U.h('p.small.soft.pad-2', 'Nada urgente. Disfruta del día 🎉'));
    }

    var enabled = store.get().settings.notifications;
    popover.appendChild(U.h('div.row.row--between.mt-2', { style: { borderTop: '1px solid var(--border)', paddingTop: '10px' } }, [
      U.h('span.small', 'Avisos del navegador'),
      (function () {
        var input = U.h('input', { type: 'checkbox' });
        input.checked = enabled;
        input.addEventListener('change', function () {
          if (input.checked && global.Notification && Notification.permission === 'default') {
            Notification.requestPermission().then(function (perm) {
              store.update(function (s) { s.settings.notifications = perm === 'granted'; });
              ui.toast(perm === 'granted' ? 'Avisos activados' : 'Permiso de notificaciones denegado', perm === 'granted' ? 'success' : 'warn');
            });
          } else {
            store.update(function (s) { s.settings.notifications = input.checked; });
          }
        });
        return U.h('label.switch', [input, U.h('span.switch__track')]);
      })()
    ]));
  }

  /* ---------------- Perfil y ajustes ---------------- */
  function wireProfile() {
    document.getElementById('btnProfile').addEventListener('click', function (e) {
      e.stopPropagation();
      var p = store.get().profile;
      ui.popover(document.getElementById('btnProfile'), U.h('div.col.gap-2', { style: { padding: '6px' } }, [
        U.h('div', [U.h('strong.small', p.name), U.h('p.tiny.soft', p.university || '')]),
        U.h('button.btn.btn--ghost.btn--sm.btn--block', { onclick: function () { openSettings(); } }, [U.icon('settings'), 'Ajustes']),
        U.h('button.btn.btn--ghost.btn--sm.btn--block', {
          onclick: function () {
            ui.confirm({ title: '¿Restablecer los datos de demostración?', message: 'Se borrarán tus tareas, sesiones y ajustes y volverán los datos de ejemplo.', okLabel: 'Restablecer', danger: true })
              .then(function (ok) {
                if (!ok) return;
                store.reset();
                applyTheme('light');
                ui.toast('Datos restablecidos', 'info');
                Studia.router.go('dashboard');
              });
          }
        }, [U.icon('reset'), 'Restablecer demo'])
      ]));
    });
  }

  function openSettings() {
    var s = store.get().settings;
    var p = store.get().profile;
    var nameInput = U.h('input.input', { value: p.name });
    var uniInput = U.h('input.input', { value: p.university || '' });
    var goalInput = U.h('input.input.input--sm', { type: 'number', min: 15, step: 15, value: s.dailyGoal || 120 });
    var firstDaySelect = U.h('select.select.select--sm', {}, [
      U.h('option', { value: '1' }, 'Lunes'),
      U.h('option', { value: '0' }, 'Domingo')
    ]);
    firstDaySelect.value = String(s.firstDay === undefined ? 1 : s.firstDay);

    var regions = (s.holidayRegions || []).slice();
    ui.modal({
      title: 'Ajustes',
      subtitle: 'Preferencias de tu cuenta',
      body: U.h('div.col.gap-3', [
        U.h('div.field', [U.h('label.field__label', 'Nombre'), nameInput]),
        U.h('div.field', [U.h('label.field__label', 'Universidad'), uniInput]),
        U.h('div.field', [U.h('label.field__label', 'Objetivo de estudio diario (min)'), goalInput]),
        U.h('div.field', [U.h('label.field__label', 'Primer día de la semana'), firstDaySelect]),
        U.h('div.field', [
          U.h('label.field__label', 'Festivos visibles'),
          U.h('div.col.gap-1', Object.keys(Studia.holidays.REGIONS).map(function (key) {
            var input = U.h('input', { type: 'checkbox' });
            input.checked = regions.indexOf(key) !== -1;
            input.addEventListener('change', function () {
              var i = regions.indexOf(key);
              if (input.checked && i === -1) regions.push(key);
              if (!input.checked && i !== -1) regions.splice(i, 1);
            });
            return U.h('label.switch', [input, U.h('span.switch__track'), U.h('span.small', Studia.holidays.REGIONS[key].label)]);
          }))
        ])
      ]),
      actions: [
        { label: 'Cancelar', variant: 'ghost' },
        {
          label: 'Guardar', variant: 'primary', onClick: function () {
            store.update(function (st) {
              st.profile.name = nameInput.value.trim() || 'Estudiante';
              st.profile.initials = st.profile.name.split(/\s+/).map(function (x) { return x[0]; }).join('').slice(0, 2).toUpperCase();
              st.profile.university = uniInput.value;
              st.settings.dailyGoal = U.clamp(+goalInput.value || 120, 15, 600);
              st.settings.firstDay = +firstDaySelect.value;
              st.settings.holidayRegions = regions;
            });
            ui.toast('Ajustes guardados', 'success');
          }
        }
      ]
    });
  }

  /* ---------------- Elementos de la interfaz ---------------- */
  function updateChrome() {
    var state = store.get();
    var info = store.streakInfo();
    var level = store.levelInfo();

    var topStreak = document.getElementById('topStreakValue');
    if (topStreak) topStreak.textContent = info.current;

    var mini = document.getElementById('streakMiniValue');
    if (mini) mini.textContent = info.current + (info.current === 1 ? ' día' : ' días');
    var best = document.getElementById('streakMiniBest');
    if (best) best.textContent = info.best;

    var badgeTasks = document.getElementById('navBadgeTasks');
    if (badgeTasks) {
      var open = store.openTasks().length;
      badgeTasks.textContent = open;
      badgeTasks.hidden = !open;
    }

    var badgeCal = document.getElementById('navBadgeCalendar');
    if (badgeCal) {
      var today = U.today();
      var count = state.events.filter(function (e) { return e.date === today; }).length;
      badgeCal.textContent = count;
      badgeCal.hidden = !count;
    }

    var plan = document.getElementById('brandPlan');
    if (plan) plan.textContent = state.profile.plan === 'premium' ? 'Plan Premium ✨' : 'Plan gratuito';

    var initials = document.getElementById('avatarInitials');
    if (initials) initials.textContent = state.profile.initials || 'ES';

    var bellDot = document.getElementById('bellDot');
    if (bellDot) {
      var urgent = store.overdueTasks().length + state.events.filter(function (e) {
        return e.date >= U.today() && U.daysBetween(U.today(), e.date) <= 1;
      }).length;
      bellDot.hidden = !urgent;
    }
  }

  function mountTimerChip() {
    var actions = document.querySelector('.topbar__actions');
    if (!actions || document.getElementById('timerChip')) return;
    var chip = U.h('div.chip#timerChip', { hidden: true, style: { borderColor: 'var(--brand-200)', background: 'var(--brand-50)', color: 'var(--brand-600)' } }, [
      U.icon('timer'),
      U.h('span', { 'data-timer-time': '' }, '25:00'),
      U.h('span.tiny', { 'data-timer-mode': '' }, 'Enfoque')
    ]);
    chip.addEventListener('click', function () { Studia.router.go('study'); });
    actions.insertBefore(chip, actions.firstChild);
  }

  /* ---------------- Atajos de teclado ---------------- */
  function wireShortcuts() {
    document.addEventListener('keydown', function (e) {
      if (e.target.matches('input, textarea, select')) return;
      if (e.key === '/') { e.preventDefault(); document.getElementById('globalSearch').focus(); }
      if (e.key === 't') Studia.router.go('study');
      if (e.key === 'c') Studia.router.go('calendar');
      if (e.key === 'h') Studia.router.go('schedule');
    });
  }

  /* ---------------- Arranque ---------------- */
  function boot() {
    store.load();
    applyTheme(store.get().settings.theme);

    Object.keys(Studia.modules).forEach(function (key) {
      if (Studia.modules[key] && typeof Studia.modules[key].init === 'function') Studia.modules[key].init();
    });

    mountTimerChip();
    wireSidebar();
    wireSearch();
    wireBell();
    wireProfile();
    wireShortcuts();
    document.getElementById('btnTheme').addEventListener('click', toggleTheme);
    document.getElementById('btnSettings').addEventListener('click', openSettings);

    store.subscribe(updateChrome);
    updateChrome();

    Studia.router.start();
    document.body.classList.add('is-ready');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
