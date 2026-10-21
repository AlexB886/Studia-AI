/* =========================================================
   Studia-IA · core/ui.js
   Modales, avisos (toast), confirmaciones y pequeños widgets
   ========================================================= */
(function (global) {
  'use strict';

  var Studia = global.Studia = global.Studia || {};
  var U = Studia.utils;

  /* ---------------- Toast ---------------- */
  var TOAST_ICON = { success: 'check', error: 'close', warn: 'bell', info: 'sparkles' };

  function toast(message, type, ms) {
    var root = document.getElementById('toastRoot');
    if (!root) return;
    type = type || 'info';
    var node = U.h('div.toast.toast--' + type, [
      U.h('span.toast__icon', U.icon(TOAST_ICON[type] || 'sparkles')),
      U.h('div.grow', message)
    ]);
    root.appendChild(node);
    setTimeout(function () {
      node.classList.add('is-out');
      setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, 220);
    }, ms || 3200);
  }

  /* ---------------- Modal ---------------- */
  var openModals = [];

  /**
   * modal({ title, subtitle, body: Node, actions: [{label, variant, onClick}],
   *        wide, onOpen })
   */
  function modal(opts) {
    var root = document.getElementById('modalRoot');
    var backdrop = U.h('div.modal-backdrop');
    var box = U.h('div.modal' + (opts.wide ? '.modal--wide' : ''));

    var close = function () {
      backdrop.remove();
      openModals = openModals.filter(function (m) { return m !== api; });
      if (!openModals.length) document.body.style.overflow = '';
    };

    var head = U.h('div.modal__head', [
      U.h('div', [U.h('h3', opts.title || ''), opts.subtitle ? U.h('p', opts.subtitle) : null]),
      U.h('button.icon-btn', { onclick: close, 'aria-label': 'Cerrar' }, U.icon('close'))
    ]);
    var body = U.h('div.modal__body');
    U.appendChildrenSafe(body, opts.body);
    box.appendChild(head);
    box.appendChild(body);

    if (opts.actions && opts.actions.length) {
      var foot = U.h('div.modal__foot' + (opts.actions.some(function (a) { return a.align === 'left'; }) ? '.modal__foot--between' : ''));
      opts.actions.forEach(function (a) {
        if (a.align === 'left') {
          foot.appendChild(U.h('button.btn.btn--' + (a.variant || 'ghost'), {
            onclick: function () { if (!a.onClick || a.onClick() !== false) close(); }
          }, a.label));
        }
      });
      var right = U.h('div.row.gap-1');
      opts.actions.forEach(function (a) {
        if (a.align === 'left') return;
        right.appendChild(U.h('button.btn.btn--' + (a.variant || 'ghost'), {
          onclick: function () {
            var res = a.onClick ? a.onClick() : undefined;
            if (res !== false) close();
          }
        }, a.label));
      });
      foot.appendChild(right);
      box.appendChild(foot);
    }

    backdrop.appendChild(box);
    backdrop.addEventListener('mousedown', function (e) {
      if (e.target === backdrop && opts.dismissable !== false) close();
    });
    root.appendChild(backdrop);
    document.body.style.overflow = 'hidden';
    openModals.push(api);

    var api = { close: close, root: box, body: body };
    if (opts.onOpen) opts.onOpen(api);
    var firstInput = box.querySelector('input, textarea, select');
    if (firstInput && opts.autofocus !== false) setTimeout(function () { firstInput.focus(); }, 40);
    return api;
  }

  /* Utilidad interna: appendChild seguro de strings/nodos */
  U.appendChildrenSafe = function (node, children) {
    if (children === null || children === undefined) return;
    if (Array.isArray(children)) { children.forEach(function (c) { U.appendChildrenSafe(node, c); }); return; }
    if (children instanceof Node) { node.appendChild(children); return; }
    node.appendChild(document.createTextNode(String(children)));
  };

  function confirm(opts) {
    return new Promise(function (resolve) {
      modal({
        title: opts.title || '¿Confirmas la acción?',
        subtitle: opts.message || '',
        body: null,
        dismissable: true,
        actions: [
          { label: opts.cancelLabel || 'Cancelar', variant: 'ghost', onClick: function () { resolve(false); } },
          { label: opts.okLabel || 'Sí, continuar', variant: opts.danger ? 'danger' : 'primary', onClick: function () { resolve(true); } }
        ]
      });
      var backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.addEventListener('mousedown', function (e) {
          if (e.target === backdrop) resolve(false);
        });
      }
    });
  }

  /* ---------------- Popover simple ---------------- */
  function popover(anchor, content, opts) {
    var wrap = anchor.closest('.popover-wrap') || anchor.parentNode;
    var pop = wrap.querySelector('.popover');
    if (!pop) {
      pop = U.h('div.popover');
      wrap.appendChild(pop);
    }
    U.clear(pop);
    U.appendChildrenSafe(pop, content);
    pop.hidden = false;
    setTimeout(function () {
      document.addEventListener('click', function h(e) {
        if (!pop.contains(e.target) && !anchor.contains(e.target)) {
          pop.hidden = true;
          document.removeEventListener('click', h);
        }
      });
    }, 0);
    return pop;
  }

  /* ---------------- Formulario rápido ---------------- */
  /**
   * formModal({ title, fields: [{name,label,type,value,options,required,hint,placeholder,min,max,step}],
   *             submitLabel, onSubmit(values) })
   */
  function formModal(opts) {
    var inputs = {};
    var form = U.h('form', { onsubmit: function (e) { e.preventDefault(); submit(); } });

    (opts.fields || []).forEach(function (f) {
      var input;
      if (f.type === 'select') {
        input = U.h('select.select', { name: f.name });
        (f.options || []).forEach(function (o) {
          var opt = U.h('option', { value: o.value }, o.label);
          if (String(o.value) === String(f.value)) opt.selected = true;
          input.appendChild(opt);
        });
      } else if (f.type === 'textarea') {
        input = U.h('textarea.textarea', { name: f.name, placeholder: f.placeholder || '', rows: f.rows || 3 });
        input.value = f.value || '';
      } else if (f.type === 'checkbox') {
        input = U.h('input', { type: 'checkbox', name: f.name });
        input.checked = !!f.value;
      } else {
        input = U.h('input.input', {
          type: f.type || 'text', name: f.name,
          placeholder: f.placeholder || '',
          min: f.min, max: f.max, step: f.step,
          required: f.required ? true : null
        });
        input.value = f.value === undefined || f.value === null ? '' : f.value;
      }
      inputs[f.name] = input;
      var field = U.h('div.field', [
        f.label ? U.h('label.field__label', f.label) : null,
        input,
        f.hint ? U.h('span.field__hint', f.hint) : null
      ]);
      if (f.half) field.classList.add('half');
      form.appendChild(field);
    });

    function submit() {
      var values = {};
      Object.keys(inputs).forEach(function (k) {
        var input = inputs[k];
        values[k] = input.type === 'checkbox' ? input.checked : input.value;
      });
      for (var i = 0; i < (opts.fields || []).length; i++) {
        var f = opts.fields[i];
        if (f.required && !String(values[f.name] || '').trim()) {
          toast('Rellena «' + f.label + '»', 'warn');
          inputs[f.name].focus();
          return;
        }
      }
      if (opts.onSubmit(values) !== false) m.close();
    }

    var m = modal({
      title: opts.title,
      subtitle: opts.subtitle,
      body: form,
      actions: [
        { label: opts.cancelLabel || 'Cancelar', variant: 'ghost' },
        { label: opts.submitLabel || 'Guardar', variant: 'primary', onClick: submit }
      ],
      onOpen: function (api) { m = api; }
    });
    return m;
  }

  Studia.ui = { toast: toast, modal: modal, confirm: confirm, popover: popover, formModal: formModal };
})(window);
