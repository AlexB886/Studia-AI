/* =========================================================
   Studia-IA · modules/social.js
   Foro de la comunidad: compartir apuntes, dudas y avisos
   ========================================================= */
(function (global) {
  'use strict';

  var Studia = global.Studia = global.Studia || {};
  var U = Studia.utils, store = Studia.store, ui = Studia.ui;

  var COLORS = ['#6366f1', '#10b981', '#f59e0b', '#0ea5e9', '#f43f5e', '#8b5cf6'];

  function initialsOf(name) {
    return name.split(/\s+/).map(function (p) { return p[0]; }).join('').slice(0, 2).toUpperCase();
  }

  function colorOf(name) {
    var sum = 0;
    for (var i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return COLORS[sum % COLORS.length];
  }

  function timeAgo(iso) {
    var d = new Date(iso);
    var mins = Math.round((Date.now() - d.getTime()) / 60000);
    if (mins < 1) return 'ahora';
    if (mins < 60) return 'hace ' + mins + ' min';
    var hours = Math.round(mins / 60);
    if (hours < 24) return 'hace ' + hours + ' h';
    var days = Math.round(hours / 24);
    if (days < 7) return 'hace ' + days + ' días';
    return U.fmtDate(d, { short: true, day: true });
  }

  function render(root) {
    U.clear(root);
    var posts = U.sortBy(store.get().forum, function (p) { return p.createdAt; }, 'desc');
    var profile = store.get().profile;

    root.appendChild(U.h('div.grid', { style: { gridTemplateColumns: 'minmax(0,1fr) 320px', alignItems: 'start' } }, [
      U.h('div.col.gap-2', [
        composer(),
        U.h('div.card', posts.length ? U.h('div', posts.map(post)) : U.h('div.empty', [
          U.h('div.empty__icon', U.icon('users')),
          U.h('h4', 'El foro está vacío'),
          U.h('p', 'Sé la primera persona en compartir algo con el grupo.')
        ]))
      ]),
      U.h('div.col.gap-2', [
        U.h('div.card', [
          U.h('div.row.gap-2.mb-2', [
            U.h('div.post__avatar', { style: { background: colorOf(profile.name) } }, profile.initials || 'ES'),
            U.h('div.grow', [
              U.h('strong.small', profile.name),
              U.h('p.tiny.soft', profile.university || '')
            ])
          ]),
          U.h('p.small.muted', 'Comparte apuntes, pregunta dudas o ajuda a otros compañeros de clase.'),
          U.h('button.btn.btn--soft.btn--sm.btn--block.mt-2', { onclick: shareNote }, [U.icon('file'), 'Compartir un apunte'])
        ]),
        U.h('div.card', [
          U.h('div.card__head', [U.h('h3', 'Compañeros')]),
          U.h('div.col.gap-2', [
            ['Núria Bosch', '#8b5cf6', 'Álgebra Lineal'],
            ['Pau Ferrer', '#10b981', 'Programación I'],
            ['Laia Serra', '#f43f5e', 'Cálculo'],
            ['Ivan Costa', '#0ea5e9', 'Bases de Datos']
          ].map(function (p) {
            return U.h('div.row.gap-2', [
              U.h('div.post__avatar', { style: { background: p[1], width: '32px', height: '32px', fontSize: '.72rem' } }, initialsOf(p[0])),
              U.h('div.grow', [U.h('div.small.strong', p[0]), U.h('div.tiny.soft', p[2])]),
              U.h('button.icon-btn', { onclick: function () { ui.toast('Chat privado (próxima entrega)', 'info'); }, title: 'Chat privado' }, U.icon('send'))
            ]);
          }))
        ])
      ])
    ]));
  }

  function composer() {
    var input = U.h('textarea.textarea', { placeholder: 'Comparte una duda, un apunte o un aviso…', rows: '3' });
    var subjectSelect = U.h('select.select.select--sm', { style: { width: 'auto' } }, [
      U.h('option', { value: '' }, 'Sin etiqueta')
    ].concat(store.get().subjects.map(function (s) {
      var o = U.h('option', { value: s.id }, s.name);
      return o;
    })));
    return U.h('div.card', [
      U.h('div.row.gap-2.mb-2', [
        U.h('div.post__avatar', { style: { background: colorOf(store.get().profile.name), width: '36px', height: '36px', fontSize: '.78rem' } }, store.get().profile.initials || 'ES'),
        U.h('strong.small', 'Publicar en el foro')
      ]),
      input,
      U.h('div.row.row--between.mt-2', [
        subjectSelect,
        U.h('button.btn.btn--primary.btn--sm', {
          onclick: function () {
            var text = input.value.trim();
            if (!text) { ui.toast('Escribe algo antes de publicar', 'warn'); return; }
            var p = store.get().profile;
            store.add('forum', {
              author: p.name, initials: p.initials || initialsOf(p.name), color: colorOf(p.name),
              subjectId: subjectSelect.value, text: text, likes: 0,
              createdAt: new Date().toISOString(), replies: []
            });
            input.value = '';
            ui.toast('Publicado en el foro', 'success');
          }
        }, [U.icon('send'), 'Publicar'])
      ])
    ]);
  }

  function post(p) {
    var liked = (p.likesBy || []).indexOf(store.get().profile.name) !== -1;
    var replyBox = U.h('div.hidden', { style: { marginTop: '10px' } });
    var replies = U.h('div.replies', (p.replies || []).map(function (r) {
      return U.h('div.reply', [
        U.h('span.reply__author', r.author + ': '),
        U.h('span', r.text)
      ]);
    }));

    function toggleReply() {
      replyBox.classList.toggle('hidden');
      if (!replyBox.classList.contains('hidden') && !replyBox.dataset.ready) {
        replyBox.dataset.ready = '1';
        var input = U.h('input.input.input--sm', { placeholder: 'Escribe una respuesta…' });
        input.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') {
            var v = input.value.trim();
            if (!v) return;
            var list = store.find('forum', p.id).replies || [];
            list.push({ author: store.get().profile.name, text: v });
            store.updateRow('forum', p.id, { replies: list });
          }
        });
        replyBox.appendChild(input);
      }
    }

    return U.h('div.post', [
      U.h('div.post__avatar', { style: { background: p.color || colorOf(p.author) } }, p.initials || initialsOf(p.author)),
      U.h('div.post__body', [
        U.h('div.post__head', [
          U.h('span.post__author', p.author),
          U.h('span.post__time', timeAgo(p.createdAt)),
          p.subjectId ? U.h('span.badge.badge--brand', store.subjectName(p.subjectId)) : null
        ]),
        U.h('div.post__text', p.text),
        U.h('div.post__actions', [
          U.h('button.post__action' + (liked ? '.is-liked' : ''), {
            onclick: function () {
              var by = (store.find('forum', p.id).likesBy || []).slice();
              var i = by.indexOf(store.get().profile.name);
              if (i === -1) by.push(store.get().profile.name);
              else by.splice(i, 1);
              store.updateRow('forum', p.id, { likesBy: by, likes: by.length });
            }
          }, [U.icon('star'), (p.likes || 0) + ' me gusta']),
          U.h('button.post__action', { onclick: toggleReply }, [U.icon('send'), (p.replies || []).length + ' respuestas']),
          U.h('button.post__action', { onclick: function () { ui.toast('Compartir (próxima entrega)', 'info'); } }, [U.icon('layers'), 'Compartir'])
        ]),
        replies,
        replyBox
      ])
    ]);
  }

  function shareNote() {
    var notes = store.get().notes;
    if (!notes.length) { ui.toast('No tienes apuntes para compartir todavía', 'warn'); return; }
    var body = U.h('div.col.gap-1', notes.map(function (n) {
      return U.h('button.quiz-option', {
        onclick: function () {
          var p = store.get().profile;
          store.add('forum', {
            author: p.name, initials: p.initials, color: colorOf(p.name), subjectId: n.subjectId,
            text: 'Comparto un apunte: ' + n.title + (n.url ? '\n' + n.url : ''),
            likes: 0, createdAt: new Date().toISOString(), replies: []
          });
          ui.toast('Apunte compartido en el foro', 'success');
          document.querySelectorAll('.modal-backdrop').forEach(function (b) { b.remove(); });
        }
      }, [
        U.h('span.quiz-option__key', U.icon('file')),
        U.h('span', [U.h('strong', n.title), U.h('div.tiny.soft', store.subjectName(n.subjectId))])
      ]);
    }));
    ui.modal({ title: 'Compartir un apunte', subtitle: 'Elige el material que quieres publicar en el foro', body: body, wide: true });
  }

  function refresh() {
    var main = document.getElementById('appMain');
    if (main && Studia.router.current() === 'social') render(main);
  }

  function init() {
    store.subscribe(function () {
      if (Studia.router.current() === 'social') refresh();
    });
  }

  Studia.modules = Studia.modules || {};
  Studia.modules.social = { init: init, render: render };
  Studia.router.register('social', {
    title: 'Social',
    subtitle: 'Foro de clase, apuntes compartidos y chats',
    render: render
  });
})(window);
