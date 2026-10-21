/* =========================================================
   Studia-IA · core/db.js
   Capa de persistencia.

   Hoy guarda en localStorage. La interfaz está preparada para
   cambiar a Supabase (ver `supabaseAdapter`) sin tocar los
   módulos de la aplicación: solo hay que implementar las
   mismas cinco funciones.
   ========================================================= */
(function (global) {
  'use strict';

  var Studia = global.Studia = global.Studia || {};
  var KEY = 'studia.db.v1';
  var COLLECTIONS = ['subjects', 'tasks', 'events', 'timetable', 'sessions', 'notes', 'forum', 'rewards', 'ai'];

  function read() {
    try {
      var raw = global.localStorage.getItem(KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('[Studia] No se pudo leer el almacenamiento local:', e);
      return null;
    }
  }

  function write(data) {
    try {
      global.localStorage.setItem(KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('[Studia] No se pudo guardar (¿cuota agotada?):', e);
      if (Studia.ui) Studia.ui.toast('No se pudo guardar el progreso en este navegador.', 'error');
      return false;
    }
  }

  /* ---------------- Adaptador local (desarrollo / prototipo) ---------------- */
  var localAdapter = {
    name: 'local',
    load: function () { return Promise.resolve(read()); },
    save: function (data) { return Promise.resolve(write(data)); },
    clear: function () {
      global.localStorage.removeItem(KEY);
      return Promise.resolve(true);
    },
    select: function (collection, filter) {
      var db = read() || {};
      var rows = db[collection] || [];
      if (filter) rows = rows.filter(filter);
      return Promise.resolve(rows);
    },
    insert: function (collection, row) {
      var db = read() || {};
      db[collection] = db[collection] || [];
      db[collection].push(row);
      write(db);
      return Promise.resolve(row);
    },
    update: function (collection, id, patch) {
      var db = read() || {};
      db[collection] = db[collection] || [];
      db[collection] = db[collection].map(function (r) { return r.id === id ? Object.assign({}, r, patch) : r; });
      write(db);
      return Promise.resolve(true);
    },
    remove: function (collection, id) {
      var db = read() || {};
      db[collection] = (db[collection] || []).filter(function (r) { return r.id !== id; });
      write(db);
      return Promise.resolve(true);
    }
  };

  /* ---------------- Adaptor Supabase (futuro) ----------------
     Placeholder: cuando exista el proyecto en Supabase basta con
     rellenar estas funciones con el cliente oficial.
     -------------------------------------------------------------- */
  var supabaseAdapter = {
    name: 'supabase',
    client: null,
    _ensure: function () {
      if (!this.client) {
        console.warn('[Studia] Supabase no configurado: se usará el almacenamiento local.');
        return null;
      }
      return this.client;
    },
    load: function () { return this._ensure() ? Promise.resolve(null) : localAdapter.load(); },
    save: function () { return Promise.resolve(false); },
    clear: function () { return localAdapter.clear(); },
    select: function () { return localAdapter.select.apply(localAdapter, arguments); },
    insert: function () { return localAdapter.insert.apply(localAdapter, arguments); },
    update: function () { return localAdapter.update.apply(localAdapter, arguments); },
    remove: function () { return localAdapter.remove.apply(localAdapter, arguments); }
  };

  var adapter = localAdapter;

  Studia.db = {
    COLLECTIONS: COLLECTIONS,
    KEY: KEY,
    get adapter() { return adapter; },
    /** Cambia de backend de persistencia (local ↔ supabase). */
    use: function (name) {
      adapter = name === 'supabase' ? supabaseAdapter : localAdapter;
      return adapter;
    },
    configureSupabase: function (client) { supabaseAdapter.client = client; },
    load: function () { return adapter.load(); },
    save: function (data) { return adapter.save(data); },
    clear: function () { return adapter.clear(); },
    select: function (c, f) { return adapter.select(c, f); },
    insert: function (c, r) { return adapter.insert(c, r); },
    update: function (c, id, p) { return adapter.update(c, id, p); },
    remove: function (c, id) { return adapter.remove(c, id); }
  };
})(window);
