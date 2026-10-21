/* =========================================================
   Studia-IA · data/seed.js
   Datos de demostración para el primer prototipo.
   Se generan con fechas relativas a "hoy" para que el
   prototipo siempre se vea vivo.
   ========================================================= */
(function (global) {
  'use strict';

  var Studia = global.Studia = global.Studia || {};
  var U = Studia.utils;

  /* PRNG determinista para que la demo sea estable */
  function rng(seed) {
    var s = seed || 42;
    return function () {
      s = (s * 1664525 + 1013904223) % 4294967296;
      return s / 4294967296;
    };
  }

  function rel(days) { return U.toISO(U.addDays(new Date(), days)); }

  function build() {
    var rand = rng(20261021);

    var subjects = [
      { id: 'sub_pr1', code: 'PR1', name: 'Programación I', color: '#6366f1', teacher: 'Dra. M. Ribas', credits: 6, room: 'A-204' },
      { id: 'sub_alg', code: 'ALG', name: 'Álgebra Lineal', color: '#10b981', teacher: 'Dr. J. Puig', credits: 6, room: 'B-110' },
      { id: 'sub_cal', code: 'CAL', name: 'Cálculo Diferencial', color: '#f59e0b', teacher: 'Dra. A. Serra', credits: 6, room: 'B-212' },
      { id: 'sub_bbd', code: 'BBD', name: 'Bases de Datos', color: '#0ea5e9', teacher: 'Dr. P. Oliver', credits: 4.5, room: 'Lab. 3' },
      { id: 'sub_his', code: 'HIS', name: 'Historia Contemporánea', color: '#f43f5e', teacher: 'Dr. N. Bosch', credits: 4.5, room: 'C-007' },
      { id: 'sub_ing', code: 'ING', name: 'Inglés Técnico', color: '#8b5cf6', teacher: 'Ms. L. Ferrer', credits: 3, room: 'A-101' }
    ];

    var timetable = [
      { id: 'tt_01', day: 0, start: '08:00', end: '09:30', subjectId: 'sub_pr1', room: 'A-204', type: 'class' },
      { id: 'tt_02', day: 0, start: '10:00', end: '11:30', subjectId: 'sub_alg', room: 'B-110', type: 'class' },
      { id: 'tt_03', day: 0, start: '12:00', end: '13:30', subjectId: 'sub_cal', room: 'B-212', type: 'class' },
      { id: 'tt_04', day: 0, start: '16:00', end: '17:00', subjectId: 'sub_ing', room: 'A-101', type: 'class' },

      { id: 'tt_05', day: 1, start: '08:00', end: '09:30', subjectId: 'sub_alg', room: 'B-110', type: 'class' },
      { id: 'tt_06', day: 1, start: '10:00', end: '11:30', subjectId: 'sub_bbd', room: 'Lab. 3', type: 'class' },
      { id: 'tt_07', day: 1, start: '12:00', end: '13:30', subjectId: 'sub_pr1', room: 'A-204', type: 'class' },
      { id: 'tt_08', day: 1, start: '17:00', end: '18:30', subjectId: 'sub_his', room: 'C-007', type: 'class' },

      { id: 'tt_09', day: 2, start: '08:00', end: '09:30', subjectId: 'sub_cal', room: 'B-212', type: 'class' },
      { id: 'tt_10', day: 2, start: '10:00', end: '11:30', subjectId: 'sub_pr1', room: 'A-204', type: 'class' },
      { id: 'tt_11', day: 2, start: '12:00', end: '13:30', subjectId: 'sub_bbd', room: 'Lab. 3', type: 'class' },
      { id: 'tt_12', day: 2, start: '15:00', end: '16:30', subjectId: 'sub_alg', room: 'B-110', type: 'class' },

      { id: 'tt_13', day: 3, start: '08:00', end: '09:30', subjectId: 'sub_his', room: 'C-007', type: 'class' },
      { id: 'tt_14', day: 3, start: '10:00', end: '11:30', subjectId: 'sub_ing', room: 'A-101', type: 'class' },
      { id: 'tt_15', day: 3, start: '12:00', end: '13:30', subjectId: 'sub_cal', room: 'B-212', type: 'class' },
      { id: 'tt_16', day: 3, start: '15:00', end: '16:30', subjectId: 'sub_bbd', room: 'Lab. 3', type: 'class' },

      { id: 'tt_17', day: 4, start: '08:00', end: '09:30', subjectId: 'sub_pr1', room: 'A-204', type: 'class' },
      { id: 'tt_18', day: 4, start: '10:00', end: '11:30', subjectId: 'sub_alg', room: 'B-110', type: 'class' },
      { id: 'tt_19', day: 4, start: '15:00', end: '17:00', subjectId: 'sub_pr1', room: 'Lab. 1', type: 'lab' }
    ];

    var tasks = [
      { id: 'tk_01', subjectId: 'sub_alg', title: 'Ejercicios 4–7: espacios vectoriales', due: rel(1), priority: 'alta', done: false, notes: 'Los del 6 y 7 son los que entran en el examen.' },
      { id: 'tk_02', subjectId: 'sub_pr1', title: 'Leer apuntes de punteros y arrays', due: rel(0), priority: 'media', done: false, notes: '' },
      { id: 'tk_03', subjectId: 'sub_his', title: 'Preparar el ensayo del siglo XX', due: rel(2), priority: 'alta', done: false, notes: 'Mínimo 1.500 palabras.' },
      { id: 'tk_04', subjectId: 'sub_bbd', title: 'Modelo relacional y normalización', due: rel(4), priority: 'media', done: false, notes: '' },
      { id: 'tk_05', subjectId: 'sub_cal', title: 'Límites y derivadas: hoja 3', due: rel(3), priority: 'baja', done: false, notes: '' },
      { id: 'tk_06', subjectId: 'sub_ing', title: 'Vocabulario Unit 4 (writing)', due: rel(6), priority: 'baja', done: false, notes: '' },
      { id: 'tk_07', subjectId: 'sub_pr1', title: 'Ver el vídeo de estructuras de datos', due: rel(-2), priority: 'baja', done: true, notes: '' }
    ];

    var events = [
      { id: 'ev_01', subjectId: 'sub_his', title: 'Examen Historia Contemporánea', type: 'exam', date: rel(3), start: '09:00', end: '10:30', location: 'C-007', notes: 'Tema 4-6 + mapa conceptual' },
      { id: 'ev_02', subjectId: 'sub_bbd', title: 'Entrega práctica 3 (SQL)', type: 'deadline', date: rel(5), start: '23:00', end: '', location: 'Aula virtual', notes: '' },
      { id: 'ev_03', subjectId: 'sub_pr1', title: 'Examen Programación I', type: 'exam', date: rel(7), start: '10:00', end: '11:30', location: 'A-204', notes: 'Todo el temario' },
      { id: 'ev_04', subjectId: 'sub_cal', title: 'Simulación de examen (Cálculo)', type: 'study', date: rel(2), start: '17:00', end: '18:30', location: 'Biblioteca', notes: '' },
      { id: 'ev_05', subjectId: 'sub_alg', title: 'Examen Álgebra Lineal', type: 'exam', date: rel(12), start: '09:00', end: '10:30', location: 'B-110', notes: '' },
      { id: 'ev_06', subjectId: 'sub_cal', title: 'Examen Cálculo Diferencial', type: 'exam', date: rel(17), start: '11:00', end: '12:30', location: 'B-212', notes: '' },
      { id: 'ev_07', subjectId: '', title: 'Junta de evaluación del primer trimestre', type: 'other', date: rel(20), start: '12:00', end: '13:00', location: 'Sala de actos', notes: '' }
    ];

    var notes = [
      { id: 'nt_01', subjectId: 'sub_pr1', title: 'Apuntes tema 3 · Estructuras de control', type: 'link', url: 'https://docs.google.com/document/d/ejemplo-programacion-t3', size: '' },
      { id: 'nt_02', subjectId: 'sub_pr1', title: 'Hoja de ejercicios (Excel)', type: 'file', url: '', size: '1,2 MB' },
      { id: 'nt_03', subjectId: 'sub_pr1', title: 'Vídeo clase: punteros', type: 'video', url: '', size: '18 min' },
      { id: 'nt_04', subjectId: 'sub_alg', title: 'Formulario de determinantes', type: 'file', url: '', size: '740 KB' },
      { id: 'nt_05', subjectId: 'sub_alg', title: 'Hoja 4 de ejercicios', type: 'link', url: 'https://docs.google.com/spreadsheets/d/ejemplo-algebra-hoja4', size: '' },
      { id: 'nt_06', subjectId: 'sub_cal', title: 'Resumen de derivadas', type: 'link', url: 'https://docs.google.com/document/d/ejemplo-calculo-derivadas', size: '' },
      { id: 'nt_07', subjectId: 'sub_bbd', title: 'Diagrama ER · biblioteca', type: 'file', url: '', size: '2,1 MB' },
      { id: 'nt_08', subjectId: 'sub_his', title: 'Cronología siglo XX', type: 'link', url: 'https://docs.google.com/document/d/ejemplo-historia-cronologia', size: '' },
      { id: 'nt_09', subjectId: 'sub_ing', title: 'Writing Unit 4 (model answer)', type: 'file', url: '', size: '320 KB' }
    ];

    /* Sesiones de estudio de las últimas 8 semanas */
    var sessions = [];
    var subjectsCycle = ['sub_pr1', 'sub_alg', 'sub_cal', 'sub_bbd', 'sub_his', 'sub_pr1', 'sub_alg'];
    for (var back = 55; back >= 0; back--) {
      var date = U.addDays(new Date(), -back);
      var dow = U.dayIndex(date);
      var isWeekend = dow >= 5;
      var minutes = 0;
      if (back <= 8) {
        minutes = 45 + Math.floor(rand() * 70);           // racha actual: 9 días
      } else if (isWeekend) {
        minutes = rand() < 0.55 ? 20 + Math.floor(rand() * 50) : 0;
      } else {
        minutes = rand() < 0.85 ? 35 + Math.floor(rand() * 80) : 0;
      }
      if (!minutes) continue;
      var count = minutes > 90 ? 2 : 1;
      for (var s = 0; s < count; s++) {
        sessions.push({
          id: 'ses_' + back + '_' + s,
          date: U.toISO(date),
          minutes: Math.round(minutes / count),
          subjectId: subjectsCycle[(back + s) % subjectsCycle.length],
          taskId: null,
          mode: rand() < 0.75 ? 'pomodoro' : 'free',
          notes: ''
        });
      }
    }

    var forum = [
      {
        id: 'fp_01', author: 'Núria Bosch', initials: 'NB', color: '#8b5cf6', subjectId: 'sub_alg',
        text: '¿Alguien más tiene la hoja 4 de álgebra? He llegado al ejercicio 6 y no me cuadra el resultado.',
        likes: 4, createdAt: rel(-1) + 'T18:20', replies: [
          { author: 'Marc Vidal', text: 'A mí también me pasa en el 6. Revisa que el rango sea 1..n y no 0..n.' }
        ]
      },
      {
        id: 'fp_02', author: 'Pau Ferrer', initials: 'PF', color: '#10b981', subjectId: 'sub_pr1',
        text: 'He hecho un resumen de punteros en una sola página. Si os sirve, lo subo a la sección de apuntes.',
        likes: 11, createdAt: rel(-2) + 'T09:12', replies: []
      },
      {
        id: 'fp_03', author: 'Laia Serra', initials: 'LS', color: '#f43f5e', subjectId: 'sub_cal',
        text: 'Recommendation: hacer simulaciones de examen con cronómetro. A mí me cambió el ritmo de la última hora.',
        likes: 7, createdAt: rel(-3) + 'T21:05', replies: [
          { author: 'Ivan Costa', text: 'Coincido, la semana pasada aprobé gracias a eso.' },
          { author: 'Núria Bosch', text: '¿Cuántas horas de simulacro hicisteis?' }
        ]
      }
    ];

    var history = {};
    sessions.forEach(function (s) {
      history[s.date] = (history[s.date] || 0) + s.minutes;
    });

    return {
      profile: {
        name: 'Estudiante',
        initials: 'ES',
        university: 'Universitat del Centre',
        course: '1º de Grado en Ingeniería Informática',
        plan: 'free',
        avatar: '🎓',
        joinedAt: rel(-55)
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
      subjects: subjects,
      tasks: tasks,
      events: events,
      timetable: timetable,
      sessions: sessions,
      notes: notes,
      forum: forum,
      rewards: { claimed: ['r_3'] },
      ai: { name: 'Luna', avatar: '🤖', tone: 'motivador', lang: 'es', messages: [], knowledge: null },
      streak: { history: history, best: 14 },
      xp: 780
    };
  }

  Studia.seed = { build: build };
})(window);
