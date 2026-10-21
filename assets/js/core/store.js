/* =========================================================
   Studia-IA · core/store.js
   Estado central de la aplicación + selectores derivados
   ========================================================= */
(function (global) {
  'use strict';

  var Studia = global.Studia = global.Studia || {};
  var U = Studia.utils;

  var state = null;
  var listeners = [];
  var saveTimer = null;

  /* ---------------- Base de estado ---------------- */
  function defaults() {
    return {
      version: 1,
      profile: {
        name: 'Estudiante',
        initials: 'ES',
        university: 'Mi universidad',
        course: '1º curso',
        plan: 'free',
        avatar: '🎓',
        joinedAt: U.today()
      },
      settings: {
        theme: 'light',
        firstDay: 1,
        dailyGoal: 120,
        notifications: false,
        holidayRegions: ['catalunya', 'espanya'],
        showAds: true,
        pomodoro: { work: 25, short: 5, long: 15, cycle: 4 }
      },
      subjects: [],
      tasks: [],
      events: [],
      timetable: [],
      sessions: [],
      notes: [],
      forum: [],
      rewards: { claimed: [] },
      ai: {
        name: 'Luna',
        avatar: '🤖',
        tone: 'motivador',
        lang: 'es',
        messages: [],
        knowledge: null
      },
      streak: { history: {}, best: 0 },
      xp: 0
    };
  }

  function merge(base, extra) {
    var out = Object.assign({}, base);
    Object.keys(extra || {}).forEach(function (k) {
      if (extra[k] && typeof extra[k] === 'object' && !Array.isArray(extra[k]) && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) {
        out[k] = merge(base[k], extra[k]);
      } else {
        out[k] = extra[k];
      }
    });
    return out;
  }

  function load() {
    var saved = null;
    try { saved = JSON.parse(global.localStorage.getItem(Studia.db.KEY) || 'null'); } catch (e) { saved = null; }
    if (!saved || !saved.profile) {
      state = merge(defaults(), Studia.seed.build());
    } else {
      state = merge(defaults(), saved);
    }
    return state;
  }

  function persist() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      Studia.db.save(state);
    }, 120);
  }

  function notify() {
    persist();
    listeners.forEach(function (fn) {
      try { fn(state); } catch (e) { console.error('[Studia] Error en suscriptor:', e); }
    });
  }

  /* ---------------- API ---------------- */
  var store = {
    get: function () { return state; },

    /** Carga (o crea) el estado inicial desde la persistencia. */
    load: function () {
      load();
      return state;
    },

    /** update(fn) → muta el estado y notifica. */
    update: function (fn) {
      if (typeof fn === 'function') fn(state);
      else state = merge(state, fn);
      notify();
      return state;
    },

    subscribe: function (fn) {
      listeners.push(fn);
      return function () { listeners = listeners.filter(function (f) { return f !== fn; }); };
    },

    reset: function () {
      state = merge(defaults(), Studia.seed.build());
      notify();
    },

    /* --------------- Selectores --------------- */
    subjectById: function (id) {
      return state.subjects.filter(function (s) { return s.id === id; })[0] || null;
    },
    subjectName: function (id) {
      var s = store.subjectById(id);
      return s ? s.name : 'Sin asignatura';
    },
    subjectColor: function (id) {
      var s = store.subjectById(id);
      return s ? s.color : 'var(--brand-500)';
    },

    tasks: function (filter) {
      var list = state.tasks.slice();
      if (filter) list = list.filter(filter);
      return list;
    },
    openTasks: function () {
      return U.sortBy(state.tasks.filter(function (t) { return !t.done; }), function (t) { return (t.due || '9999') + (t.priority === 'alta' ? '0' : t.priority === 'media' ? '1' : '2'); });
    },
    overdueTasks: function () {
      var t = U.today();
      return state.tasks.filter(function (x) { return !x.done && x.due && x.due < t; });
    },

    eventsOn: function (iso) {
      return state.events.filter(function (e) { return e.date === iso; })
        .sort(function (a, b) { return (a.start || '') < (b.start || '') ? -1 : 1; });
    },
    eventsBetween: function (from, to) {
      return state.events.filter(function (e) { return e.date >= from && e.date <= to; });
    },
    upcomingEvents: function (limit) {
      var t = U.today();
      return U.sortBy(state.events.filter(function (e) { return e.date >= t; }), function (e) { return e.date + (e.start || ''); })
        .slice(0, limit || 6);
    },
    nextExam: function () {
      var t = U.today();
      return U.sortBy(state.events.filter(function (e) { return e.type === 'exam' && e.date >= t; }), function (e) { return e.date; })[0] || null;
    },

    /** Horario semanal completo. */
    timetable: function () { return state.timetable; },

    classAt: function (dayIndex, time) {
      var m = U.timeToMinutes(time);
      return state.timetable.filter(function (c) {
        return c.day === dayIndex && U.timeToMinutes(c.start) <= m && U.timeToMinutes(c.end) > m;
      })[0] || null;
    },
    todayClasses: function () {
      return U.sortBy(state.timetable.filter(function (c) { return c.day === U.dayIndex(new Date()); }), function (c) { return c.start; });
    },

    /* --------------- Estudio / racha --------------- */
    sessionsOn: function (iso) {
      return state.sessions.filter(function (s) { return s.date === iso; });
    },
    minutesOn: function (iso) {
      return U.sum(state.sessions.filter(function (s) { return s.date === iso; }), function (s) { return s.minutes; });
    },
    minutesBetween: function (from, to) {
      return U.sum(state.sessions.filter(function (s) { return s.date >= from && s.date <= to; }), function (s) { return s.minutes; });
    },
    /** Racha actual, mejor racha y días estudiados. */
    streakInfo: function () {
      var history = state.streak.history || {};
      var days = Object.keys(history).filter(function (d) { return history[d] > 0; }).sort();
      var current = 0;
      var cursor = U.today();
      // Si hoy todavía no se ha estudiado, la racha cuenta desde ayer
      if (!history[cursor]) cursor = U.toISO(U.addDays(cursor, -1));
      while (history[cursor] && history[cursor] > 0) {
        current++;
        cursor = U.toISO(U.addDays(cursor, -1));
      }
      var best = state.streak.best || 0;
      // Recalcular el mejor racha a partir del histórico
      var run = 0;
      days.forEach(function (d, i) {
        if (i > 0 && U.daysBetween(days[i - 1], d) === 1) run++;
        else run = 1;
        if (run > best) best = run;
      });
      return { current: current, best: best, total: days.length, history: history, days: days };
    },

    /** XP y nivel. */
    levelInfo: function () {
      var xp = state.xp || 0;
      var level = Math.floor(Math.sqrt(xp / 60)) + 1;
      var base = Math.pow(level - 1, 2) * 60;
      var next = Math.pow(level, 2) * 60;
      var current = xp - base;
      var needed = next - base;
      return {
        xp: xp,
        level: level,
        current: current,
        needed: needed,
        percent: Math.min(100, Math.round((current / needed) * 100)),
        next: next
      };
    },

    /** Registra una sesión de estudio y actualiza racha, XP e hitos. */
    addSession: function (session) {
      var s = Object.assign({
        id: U.uid('ses'),
        date: U.today(),
        minutes: 0,
        subjectId: null,
        taskId: null,
        mode: 'pomodoro',
        notes: ''
      }, session);
      state.sessions.push(s);

      var history = state.streak.history || (state.streak.history = {});
      history[s.date] = (history[s.date] || 0) + s.minutes;
      var info = store.streakInfo();
      if (info.current > (state.streak.best || 0)) state.streak.best = info.current;

      var gained = Math.round(s.minutes * 0.6) + (s.mode === 'pomodoro' ? 15 : 0);
      state.xp = (state.xp || 0) + gained;

      notify();
      return { session: s, xp: gained, streak: store.streakInfo() };
    },

    removeSession: function (id) {
      state.sessions = state.sessions.filter(function (s) { return s.id !== id; });
      notify();
    },

    /* --------------- Colecciones genéricas --------------- */
    add: function (collection, row) {
      var item = Object.assign({ id: U.uid(collection.slice(0, 3)) }, row);
      state[collection] = (state[collection] || []).concat([item]);
      notify();
      return item;
    },
    updateRow: function (collection, id, patch) {
      state[collection] = (state[collection] || []).map(function (r) {
        return r.id === id ? Object.assign({}, r, patch) : r;
      });
      notify();
    },
    remove: function (collection, id) {
      state[collection] = (state[collection] || []).filter(function (r) { return r.id !== id; });
      notify();
    },
    find: function (collection, id) {
      return (state[collection] || []).filter(function (r) { return r.id === id; })[0] || null;
    }
  };

  Studia.store = store;
})(window);
