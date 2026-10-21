/* =========================================================
   Studia-IA · data/rewards.js
   Hitos y recompensas por racha (definición compartida)
   ========================================================= */
(function (global) {
  'use strict';

  var Studia = global.Studia = global.Studia || {};

  var MILESTONES = [
    { id: 'r_3', days: 3, name: 'Constancia', desc: '3 días seguidos', xp: 50, icon: 'star' },
    { id: 'r_7', days: 7, name: 'Una semana', desc: '7 días seguidos', xp: 120, icon: 'trophy' },
    { id: 'r_14', days: 14, name: 'Dos semanas', desc: '14 días seguidos', xp: 250, icon: 'fire' },
    { id: 'r_30', days: 30, name: 'Un mes entero', desc: '30 días seguidos', xp: 500, icon: 'crown' },
    { id: 'r_60', days: 60, name: 'Racha imparable', desc: '60 días seguidos', xp: 900, icon: 'flame' },
    { id: 'r_100', days: 100, name: 'Leyenda del campus', desc: '100 días seguidos', xp: 1800, icon: 'trophy' }
  ];

  function byId(id) {
    return MILESTONES.filter(function (m) { return m.id === id; })[0] || null;
  }

  /**
   * Estado de cada hito según la racha actual y el mejor histórico.
   * Un hito está "desbloqueado" si se ha alcanzado alguna vez.
   */
  function status(streakInfo, claimed) {
    claimed = claimed || [];
    return MILESTONES.map(function (m) {
      var reached = Math.max(streakInfo.current, streakInfo.best) >= m.days;
      return {
        milestone: m,
        unlocked: reached,
        claimed: claimed.indexOf(m.id) !== -1
      };
    });
  }

  Studia.rewards = { MILESTONES: MILESTONES, byId: byId, status: status };
})(window);
