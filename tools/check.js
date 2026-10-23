#!/usr/bin/env node
/* =========================================================
   Studia-IA · comprobaciones estáticas (sin dependencias)
   Uso:  node tools/check.js
   También corre en CI. Sale con código 1 si algo falla.
   ========================================================= */
'use strict';

var fs = require('fs');
var path = require('path');
var cp = require('child_process');

var ROOT = path.resolve(__dirname, '..');
var errors = [];
var warnings = [];

function fail(msg) { errors.push(msg); }
function warn(msg) { warnings.push(msg); }
function abs(p) { return path.join(ROOT, p); }
function exists(p) { return fs.existsSync(abs(p)); }
function read(p) { return fs.readFileSync(abs(p), 'utf8'); }

function walk(dir, out) {
  var full = abs(dir);
  if (!fs.existsSync(full)) return out;
  fs.readdirSync(full, { withFileTypes: true }).forEach(function (entry) {
    var rel = dir + '/' + entry.name;
    if (entry.isDirectory()) walk(rel, out);
    else if (/\.js$/.test(entry.name)) out.push(rel);
  });
  return out;
}

/* 1. Sintaxis de todo el JavaScript */
var scripts = walk('assets/js', []).concat(walk('tools', []));
scripts.forEach(function (file) {
  var res = cp.spawnSync(process.execPath, ['--check', abs(file)], { encoding: 'utf8' });
  if (res.status !== 0) fail('Sintaxis en ' + file + ':\n' + (res.stderr || '').trim());
});

/* 2. Assets referenciados desde el HTML */
var pages = ['index.html', 'tests.html'].filter(exists);
var assetRefs = [];
pages.forEach(function (page) {
  var html = read(page);
  var re = /(?:src|href)="([^"]+)"/g;
  var m;
  while ((m = re.exec(html))) {
    var url = m[1];
    if (/^(https?:|data:|#|mailto:)/.test(url)) continue;
    var clean = url.split('?')[0].split('#')[0];
    if (!clean) continue;
    assetRefs.push({ page: page, url: url, clean: clean });
    if (!exists(clean)) fail(page + ' apunta a un archivo que no existe: ' + clean);
  }
});

/* 3. Una sola versión de caché (?v=) en todo */
var versions = {};
assetRefs.forEach(function (r) {
  var m = /[?&]v=([^&]+)/.exec(r.url);
  if (m) versions[m[1]] = (versions[m[1]] || 0) + 1;
});
var versionList = Object.keys(versions);
if (versionList.length > 1) fail('Hay varias versiones en ?v=: ' + versionList.join(', '));
else if (versionList.length === 1) {
  var v = versionList[0];
  var meta = /<meta\s+name="app-version"\s+content="([^"]+)"/.exec(read('index.html'));
  if (meta && meta[1] !== v) fail('app-version (' + meta[1] + ') no coincide con ?v=' + v);
  var mainJs = read('assets/js/main.js');
  var appVersion = /APP_VERSION\s*=\s*'([^']+)'/.exec(mainJs);
  if (appVersion && appVersion[1] !== v) fail('APP_VERSION (' + appVersion[1] + ') no coincide con ?v=' + v);
  var pkg = JSON.parse(read('package.json'));
  if (pkg.version !== v) warn('package.json (' + pkg.version + ') y ?v= (' + v + ') no coinciden');
} else {
  warn('No hay ?v= en los assets: recuerda invalidar la caché al publicar.');
}

/* 4. Todos los iconos usados existen en el sprite SVG */
var indexHtml = read('index.html');
var sprite = {};
var iconIdRe = /id="i-([\w-]+)"/g;
var im;
while ((im = iconIdRe.exec(indexHtml))) sprite[im[1]] = true;
var usedIcons = {};
scripts.filter(function (f) { return f !== 'assets/js/tests.js'; }).forEach(function (file) {
  var src = read(file);
  var re = /(?:U\.)?icon\('([\w-]+)'/g;
  var m;
  while ((m = re.exec(src))) {
    usedIcons[m[1]] = file;
    if (!sprite[m[1]]) fail('Falta el icono "i-' + m[1] + '" en el sprite SVG de index.html (usado en ' + file + ')');
  }
});

/* 5. Nada de HTML construido a mano (anti-XSS) */
scripts.forEach(function (file) {
  if (file.indexOf('assets/js/') !== 0) return;
  if (file === 'assets/js/tests.js') return;
  var src = read(file);
  ['innerHTML', 'outerHTML', 'insertAdjacentHTML', 'document.write', 'eval('].forEach(function (bad) {
    if (src.indexOf(bad) !== -1) fail(file + ' usa ' + bad + ' (usa h() y texto, no HTML)');
  });
});
if (/key\s*===\s*'html'/.test(read('assets/js/core/utils.js'))) {
  fail("utils.js todavía acepta la opción 'html' en h()");
}

/* 6. Cada vista del menú tiene su ruta registrada */
var navNames = [];
var navRe = /data-nav="([\w-]+)"/g;
var nm;
while ((nm = navRe.exec(indexHtml))) navNames.push(nm[1]);
var routes = {};
var routeRe = /router\.register\('([\w-]+)'/g;
scripts.forEach(function (file) {
  var m;
  while ((m = routeRe.exec(read(file)))) routes[m[1]] = true;
});
navNames.forEach(function (name) {
  if (!routes[name]) fail('El menú enlaza a #/' + name + ' pero no hay router.register(\'' + name + '\')');
});
if (!navNames.length) warn('No se encontraron enlaces data-nav en index.html');

/* 7. Manifest e iconos de la PWA */
if (!exists('manifest.webmanifest')) {
  fail('Falta manifest.webmanifest');
} else {
  try {
    var manifest = JSON.parse(read('manifest.webmanifest'));
    if (!manifest.start_url) fail('El manifest no tiene start_url');
    (manifest.icons || []).forEach(function (icon) {
      if (!exists(icon.src)) fail('El manifest apunta a un icono que no existe: ' + icon.src);
    });
  } catch (e) {
    fail('manifest.webmanifest no es JSON válido: ' + e.message);
  }
}

/* 8. Los tests de navegador deben cargar los mismos módulos que la app */
if (exists('tests.html')) {
  var appModules = scripts.filter(function (f) { return f.indexOf('assets/js/modules/') === 0; });
  var testsHtml = read('tests.html');
  appModules.forEach(function (file) {
    if (testsHtml.indexOf(file) === -1) warn('tests.html no carga ' + file);
  });
}

/* ---------------- Resumen ---------------- */
var green = function (s) { return '\u001b[32m' + s + '\u001b[0m'; };
var red = function (s) { return '\u001b[31m' + s + '\u001b[0m'; };
var yellow = function (s) { return '\u001b[33m' + s + '\u001b[0m'; };

console.log('\nStudia-IA · comprobaciones\n');
console.log('  ' + scripts.length + ' archivos JS revisados');
console.log('  ' + Object.keys(sprite).length + ' iconos en el sprite, ' + Object.keys(usedIcons).length + ' usados');
console.log('  ' + navNames.length + ' vistas en el menú, ' + Object.keys(routes).length + ' rutas registradas');
console.log('');

warnings.forEach(function (w) { console.log(yellow('  ! ') + w); });
errors.forEach(function (e) { console.log(red('  x ') + e); });

if (errors.length) {
  console.log('\n' + red(errors.length + ' error(es)') + (warnings.length ? ', ' + warnings.length + ' aviso(s)' : '') + '\n');
  process.exit(1);
}
console.log(green('  ✓ Todo correcto') + (warnings.length ? ' (' + warnings.length + ' aviso(s))' : '') + '\n');
