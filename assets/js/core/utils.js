/* =========================================================
   Studia-IA · core/utils.js
   Utilidades de DOM, fechas y formato
   ========================================================= */
(function (global) {
  'use strict';

  var Studia = global.Studia = global.Studia || {};

  /* ---------------- DOM ---------------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /**
   * Crea un elemento.
   * h('div.card#id', { onclick: fn, dataset: {...} }, [hijo, 'texto'])
   */
  function h(tag, props, children) {
    // Permite h('div', [hijo, 'texto']) sin objeto de propiedades
    if (props !== null && props !== undefined && typeof props !== 'object' ||
        Array.isArray(props) || props instanceof Node) {
      children = props;
      props = null;
    }
    var parts = String(tag).split(/(?=[.#])/);
    var node = document.createElement(parts[0] || 'div');
    for (var i = 1; i < parts.length; i++) {
      if (parts[i][0] === '.') node.classList.add(parts[i].slice(1));
      else if (parts[i][0] === '#') node.id = parts[i].slice(1);
    }
    if (props) {
      Object.keys(props).forEach(function (key) {
        var val = props[key];
        if (val === null || val === undefined || val === false) return;
        if (key === 'class' || key === 'className') {
          String(val).split(/\s+/).filter(Boolean).forEach(function (c) { node.classList.add(c); });
        } else if (key === 'html') {
          node.innerHTML = val;
        } else if (key === 'text') {
          node.textContent = val;
        } else if (key === 'dataset') {
          Object.keys(val).forEach(function (k) { node.dataset[k] = val[k]; });
        } else if (key === 'style' && typeof val === 'object') {
          Object.keys(val).forEach(function (k) {
            if (k.indexOf('--') === 0) node.style.setProperty(k, val[k]);
            else node.style[k] = val[k];
          });
        } else if (key.slice(0, 2) === 'on' && typeof val === 'function') {
          node.addEventListener(key.slice(2).toLowerCase(), val);
        } else if (key === 'value' && (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA' || node.tagName === 'SELECT')) {
          node.value = val;
        } else if (val === true) {
          node.setAttribute(key, '');
        } else {
          node.setAttribute(key, val);
        }
      });
    }
    appendChildren(node, children);
    return node;
  }

  function appendChildren(node, children) {
    if (children === null || children === undefined || children === false) return;
    if (Array.isArray(children)) {
      children.forEach(function (c) { appendChildren(node, c); });
      return;
    }
    if (children instanceof Node) { node.appendChild(children); return; }
    node.appendChild(document.createTextNode(String(children)));
  }

  /** Icono SVG a partir del sprite. */
  function icon(name, cls) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'icon ' + (cls || ''));
    var use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#i-' + name);
    svg.appendChild(use);
    return svg;
  }

  function clear(node) { while (node && node.firstChild) node.removeChild(node.firstChild); return node; }
  function on(root, evt, sel, handler) {
    root.addEventListener(evt, function (e) {
      var target = e.target.closest(sel);
      if (target && root.contains(target)) handler(e, target);
    });
  }
  function debounce(fn, wait) {
    var t;
    return function () {
      var args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, wait || 200);
    };
  }

  /* ---------------- IDs y números ---------------- */
  function uid(prefix) {
    return (prefix || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
  function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }
  function sum(arr, fn) {
    return arr.reduce(function (acc, item, i) { return acc + (fn ? fn(item, i) : item); }, 0);
  }
  function groupBy(arr, fn) {
    return arr.reduce(function (acc, item) {
      var key = fn(item);
      (acc[key] = acc[key] || []).push(item);
      return acc;
    }, {});
  }
  function sortBy(arr, fn, dir) {
    var sign = dir === 'desc' ? -1 : 1;
    return arr.slice().sort(function (a, b) {
      var va = fn(a), vb = fn(b);
      if (va < vb) return -1 * sign;
      if (va > vb) return 1 * sign;
      return 0;
    });
  }

  /* ---------------- Fechas ---------------- */
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  var DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  var DIAS_CORTOS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  var DIAS_MINI = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  function toDate(value) {
    if (value instanceof Date) return new Date(value.getTime());
    if (typeof value === 'number') return new Date(value);
    if (typeof value === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        var p = value.split('-');
        return new Date(+p[0], +p[1] - 1, +p[2]);
      }
      return new Date(value);
    }
    return new Date();
  }
  function toISO(d) {
    var x = toDate(d);
    var m = String(x.getMonth() + 1).padStart(2, '0');
    var day = String(x.getDate()).padStart(2, '0');
    return x.getFullYear() + '-' + m + '-' + day;
  }
  function today() { return toISO(new Date()); }
  function now() { return new Date(); }
  function addDays(d, n) {
    var x = toDate(d);
    x.setDate(x.getDate() + n);
    return x;
  }
  function addMonths(d, n) {
    var x = toDate(d);
    var day = x.getDate();
    x.setDate(1);
    x.setMonth(x.getMonth() + n);
    x.setDate(Math.min(day, daysInMonth(x.getFullYear(), x.getMonth())));
    return x;
  }
  function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
  function startOfWeek(d, firstDay) {
    var x = toDate(d);
    var diff = (x.getDay() - (firstDay === undefined ? 1 : firstDay) + 7) % 7;
    x.setDate(x.getDate() - diff);
    x.setHours(0, 0, 0, 0);
    return x;
  }
  function startOfMonth(d) { var x = toDate(d); x.setDate(1); x.setHours(0, 0, 0, 0); return x; }
  function endOfMonth(d) { var x = toDate(d); x.setMonth(x.getMonth() + 1, 0); x.setHours(23, 59, 59, 999); return x; }
  function isSameDay(a, b) { return toISO(a) === toISO(b); }
  function isToday(d) { return toISO(d) === today(); }
  function dayIndex(d) { return (toDate(d).getDay() + 6) % 7; } // 0 = lunes
  function weekNumber(d) {
    var t = new Date(toDate(d).getFullYear(), toDate(d).getMonth(), toDate(d).getDate());
    t.setDate(t.getDate() + 3 - ((t.getDay() + 6) % 7));
    var week1 = new Date(t.getFullYear(), 0, 4);
    return 1 + Math.round(((t - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  }
  function daysBetween(a, b) {
    var x = toDate(a), y = toDate(b);
    x.setHours(0, 0, 0, 0); y.setHours(0, 0, 0, 0);
    return Math.round((y - x) / 86400000);
  }
  /** Matriz de 6 semanas x 7 días (lunes a domingo) del mes de `d`. */
  function monthMatrix(d, firstDay) {
    var first = startOfMonth(d);
    var start = startOfWeek(first, firstDay === undefined ? 1 : firstDay);
    var cells = [];
    for (var i = 0; i < 42; i++) {
      var day = addDays(start, i);
      cells.push({ date: day, iso: toISO(day), inMonth: day.getMonth() === first.getMonth() });
    }
    return cells;
  }
  function fmtDate(d, opts) {
    var x = toDate(d);
    var o = opts || {};
    var m = o.short ? MESES_CORTOS[x.getMonth()] : MESES[x.getMonth()];
    if (o.day) return x.getDate() + ' ' + m;
    if (o.full) return x.getDate() + ' de ' + m + ' de ' + x.getFullYear();
    if (o.weekday) return DIAS[dayIndex(x)] + ', ' + x.getDate() + ' ' + m;
    if (o.numeric) return pad(x.getDate()) + '/' + pad(x.getMonth() + 1) + '/' + x.getFullYear();
    return x.getDate() + ' ' + m + ' ' + x.getFullYear();
  }
  function fmtRelative(d) {
    var diff = daysBetween(new Date(), d);
    if (diff === 0) return 'hoy';
    if (diff === 1) return 'mañana';
    if (diff === -1) return 'ayer';
    if (diff > 1 && diff < 7) return 'en ' + diff + ' días';
    if (diff < -1 && diff > -7) return 'hace ' + Math.abs(diff) + ' días';
    return fmtDate(d, { short: true, day: true });
  }
  function fmtMinutes(min) {
    var m = Math.round(min || 0);
    if (m < 60) return m + ' min';
    var h = Math.floor(m / 60), r = m % 60;
    return r ? h + ' h ' + r + ' min' : h + ' h';
  }
  function fmtHours(min) { return ((min || 0) / 60).toFixed(1).replace('.0', '') + ' h'; }
  function fmtClock(sec) {
    var s = Math.max(0, Math.round(sec));
    return pad(Math.floor(s / 60)) + ':' + pad(s % 60);
  }
  function fmtTime(hhmm) {
    if (!hhmm) return '';
    return hhmm.slice(0, 5);
  }
  function pad(n) { return String(n).padStart(2, '0'); }
  function minutesBetween(start, end) {
    var a = start.split(':'), b = end.split(':');
    return (+b[0] * 60 + +b[1]) - (+a[0] * 60 + +a[1]);
  }
  function timeToMinutes(t) { var p = String(t || '0:0').split(':'); return (+p[0]) * 60 + (+p[1]); }
  function minutesToTime(m) { return pad(Math.floor(m / 60)) + ':' + pad(m % 60); }

  Studia.utils = {
    $: $, $$: $$, h: h, icon: icon, clear: clear, on: on, debounce: debounce,
    uid: uid, clamp: clamp, sum: sum, groupBy: groupBy, sortBy: sortBy,
    toDate: toDate, toISO: toISO, today: today, now: now,
    addDays: addDays, addMonths: addMonths, daysInMonth: daysInMonth,
    startOfWeek: startOfWeek, startOfMonth: startOfMonth, endOfMonth: endOfMonth,
    isSameDay: isSameDay, isToday: isToday, dayIndex: dayIndex, weekNumber: weekNumber,
    daysBetween: daysBetween, monthMatrix: monthMatrix,
    fmtDate: fmtDate, fmtRelative: fmtRelative, fmtMinutes: fmtMinutes, fmtHours: fmtHours,
    fmtClock: fmtClock, fmtTime: fmtTime, pad: pad,
    minutesBetween: minutesBetween, timeToMinutes: timeToMinutes, minutesToTime: minutesToTime,
    MESES: MESES, MESES_CORTOS: MESES_CORTOS, DIAS: DIAS, DIAS_CORTOS: DIAS_CORTOS, DIAS_MINI: DIAS_MINI
  };
})(window);
