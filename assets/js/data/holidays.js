/* =========================================================
   Studia-IA · data/holidays.js
   Festivos por comunidad (2025-2027) + pascua calculada
   ========================================================= */
(function (global) {
  'use strict';

  var Studia = global.Studia = global.Studia || {};

  var REGIONS = {
    espanya: { label: 'España (nacional)', color: 'var(--rose-500)' },
    catalunya: { label: 'Cataluña', color: 'var(--amber-500)' },
    valenciana: { label: 'Comunidad Valenciana', color: 'var(--sky-500)' },
    euskadi: { label: 'País Vasco', color: 'var(--mint-500)' }
  };

  /* --- Festivos comunes (nacionales) --- */
  var BASE = [
    { m: 1, d: 1, name: 'Año Nuevo', regions: ['espanya', 'catalunya', 'valenciana', 'euskadi'] },
    { m: 1, d: 6, name: 'Epifanía del Señor', regions: ['espanya', 'catalunya', 'valenciana', 'euskadi'] },
    { m: 5, d: 1, name: 'Fiesta del Trabajo', regions: ['espanya', 'catalunya', 'valenciana', 'euskadi'] },
    { m: 8, d: 15, name: 'Asunción de la Virgen', regions: ['espanya', 'catalunya', 'valenciana', 'euskadi'] },
    { m: 10, d: 12, name: 'Fiesta Nacional de España', regions: ['espanya', 'catalunya', 'valenciana', 'euskadi'] },
    { m: 12, d: 8, name: 'Inmaculada Concepción', regions: ['espanya', 'catalunya', 'valenciana', 'euskadi'] },
    { m: 12, d: 25, name: 'Navidad', regions: ['espanya', 'catalunya', 'valenciana', 'euskadi'] }
  ];

  var BY_REGION = {
    catalunya: [
      { m: 6, d: 24, name: 'San Juan' },
      { m: 9, d: 11, name: 'Diada Nacional de Cataluña' },
      { m: 11, d: 1, name: 'Todos los Santos' },
      { m: 12, d: 6, name: 'San Nicolás' },
      { m: 12, d: 26, name: 'San Esteban' }
    ],
    valenciana: [
      { m: 3, d: 19, name: 'San José' },
      { m: 4, d: 9, name: 'San Vicente Ferrer' },
      { m: 6, d: 24, name: 'San Juan' },
      { m: 10, d: 9, name: 'Día de la Comunidad Valenciana' }
    ],
    euskadi: [
      { m: 7, d: 25, name: 'Santiago Apóstol' },
      { m: 10, d: 25, name: 'Día del País Vasco' }
    ]
  };

  /* --- Cálculo de la pascua (algoritmo gregoriano) --- */
  function easter(year) {
    var a = year % 19,
      b = Math.floor(year / 100),
      c = year % 100,
      d = Math.floor(b / 4),
      e = b % 4,
      f = Math.floor((b + 8) / 25),
      g = Math.floor((b - f + 1) / 3),
      hh = (19 * a + b - d - g + 15) % 30,
      i = Math.floor(c / 4),
      k = c % 4,
      l = (32 + 2 * e + 2 * i - hh - k) % 7,
      m = Math.floor((a + 11 * hh + 22 * l) / 451),
      month = Math.floor((hh + l - 7 * m + 114) / 31),
      day = ((hh + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
  }

  function iso(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  /** Festivos de un año: { '2026-10-12': [{name, region}] } */
  function forYear(year) {
    var out = {};
    function push(date, name, region) {
      out[date] = out[date] || [];
      out[date].push({ name: name, region: region });
    }
    BASE.forEach(function (f) {
      f.regions.forEach(function (r) {
        push(year + '-' + String(f.m).padStart(2, '0') + '-' + String(f.d).padStart(2, '0'), f.name, r);
      });
    });
    Object.keys(BY_REGION).forEach(function (region) {
      BY_REGION[region].forEach(function (f) {
        push(year + '-' + String(f.m).padStart(2, '0') + '-' + String(f.d).padStart(2, '0'), f.name, region);
      });
    });
    var e = easter(year);
    var all = ['espanya', 'catalunya', 'valenciana', 'euskadi'];
    all.forEach(function (r) {
      push(iso(new Date(e.getFullYear(), e.getMonth(), e.getDate() - 2)), 'Viernes Santo', r);
      push(iso(new Date(e.getFullYear(), e.getMonth(), e.getDate() + 1)), 'Lunes de Pascua', r);
    });
    return out;
  }

  var cache = {};

  /** Festivos filtrados por las regiones activas. */
  function active(regions, year) {
    year = year || new Date().getFullYear();
    var key = year;
    if (!cache[key]) cache[key] = forYear(year);
    var list = cache[key];
    var allowed = (regions && regions.length) ? regions : ['espanya'];
    var out = {};
    Object.keys(list).forEach(function (date) {
      var items = list[date].filter(function (it) { return allowed.indexOf(it.region) !== -1; });
      if (items.length) out[date] = items;
    });
    return out;
  }

  Studia.holidays = {
    REGIONS: REGIONS,
    easter: easter,
    forYear: forYear,
    active: active,
    on: function (dateISO, regions) {
      var all = active(regions, +dateISO.slice(0, 4));
      return all[dateISO] || [];
    }
  };
})(window);
