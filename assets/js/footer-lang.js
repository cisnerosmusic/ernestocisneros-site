/* Footer Language Links — Layer 3 of the Hybrid Language Model
   Renders discreet language links in the footer for languages
   NOT shown in the header (header handles EN/ES only).

   This script auto-detects which page we're on and which
   translations are available, then injects a small link row.

   To add a new language:
   1. Add it to LANGUAGES array
   2. Add the page paths to TRANSLATED_PAGES
   3. Create the /xx/ directory with translated pages
*/

(function () {
  'use strict';

  // ── Configuration ──────────────────────────────────────────
  // Languages available beyond header (EN/ES are in the header)
  var EXTRA_LANGUAGES = [
    { code: 'fr', label: 'Français', dir: '/fr/' },
    { code: 'ja', label: '日本語',    dir: '/ja/' }
  ];

  // All languages including header ones (for rendering full row)
  var ALL_LANGUAGES = [
    { code: 'en', label: 'English',   dir: '/' },
    { code: 'es', label: 'Español',   dir: '/es/' },
    { code: 'fr', label: 'Français',  dir: '/fr/' },
    { code: 'ja', label: '日本語',     dir: '/ja/' }
  ];

  // Pages that have FR/JA translations (normalized base paths)
  var MULTILINGUAL_PAGES = [
    'index.html',
    'biography.html',
    'music.html',
    'books.html',
    'contact.html',
    'music/glacial-paths.html',
    'music/atlas-of-fragmented-light.html',
    'music/mare-incognitum.html',
    'nft.html',
    'nft/eth-collection.html',
    'nft/tez-collection.html',
    'nft/marketplaces.html',
    'nft/btc-ordinals.html',
    'nft/gift-from-community.html'
  ];

  // ── Detect current context ─────────────────────────────────
  var path = window.location.pathname;
  var currentLang = 'en';
  var basePath = path;

  // Determine current language and strip prefix
  if (path.indexOf('/es/') === 0) {
    currentLang = 'es';
    basePath = path.replace(/^\/es\//, '/');
  } else if (path.indexOf('/fr/') === 0) {
    currentLang = 'fr';
    basePath = path.replace(/^\/fr\//, '/');
  } else if (path.indexOf('/ja/') === 0) {
    currentLang = 'ja';
    basePath = path.replace(/^\/ja\//, '/');
  }

  // Normalize: "/" → "index.html", "/biography.html" → "biography.html"
  var normalizedBase = basePath.replace(/^\//, '');
  if (normalizedBase === '' || normalizedBase === '/') {
    normalizedBase = 'index.html';
  }

  // Check if this page has multilingual versions
  var hasMultilingual = false;
  for (var i = 0; i < MULTILINGUAL_PAGES.length; i++) {
    if (normalizedBase === MULTILINGUAL_PAGES[i]) {
      hasMultilingual = true;
      break;
    }
  }

  // Only show footer links if extra languages exist for this page
  if (!hasMultilingual) return;

  // ── Build the link row ─────────────────────────────────────
  var container = document.createElement('div');
  container.className = 'footer-lang-links';
  container.setAttribute('role', 'navigation');
  container.setAttribute('aria-label', 'Language');

  var label = document.createElement('span');
  label.className = 'footer-lang-label';
  label.textContent = currentLang === 'es' ? 'También disponible en: '
                     : currentLang === 'fr' ? 'Aussi disponible en : '
                     : currentLang === 'ja' ? '他の言語: '
                     : 'Also available in: ';
  container.appendChild(label);

  var links = [];
  for (var j = 0; j < ALL_LANGUAGES.length; j++) {
    var lang = ALL_LANGUAGES[j];
    if (lang.code === currentLang) continue; // skip current

    var targetPath = lang.dir;
    if (normalizedBase !== 'index.html') {
      targetPath += normalizedBase;
    }

    var a = document.createElement('a');
    a.href = targetPath;
    a.className = 'footer-lang-link';
    a.setAttribute('hreflang', lang.code);
    a.textContent = lang.label;
    a.onclick = (function (code) {
      return function () { localStorage.setItem('lang', code); };
    })(lang.code);

    links.push(a);
  }

  // Join links with " · " separators
  for (var k = 0; k < links.length; k++) {
    container.appendChild(links[k]);
    if (k < links.length - 1) {
      var sep = document.createElement('span');
      sep.className = 'footer-lang-sep';
      sep.textContent = ' · ';
      container.appendChild(sep);
    }
  }

  // ── Inject into footer ─────────────────────────────────────
  var footer = document.querySelector('footer');
  if (footer) {
    footer.appendChild(container);
  }

  // ── Inject minimal styles ──────────────────────────────────
  var style = document.createElement('style');
  style.textContent = [
    '.footer-lang-links {',
    '  text-align: center;',
    '  padding: 1rem 0 0.5rem;',
    '  font-family: var(--font-mono, "Space Mono", monospace);',
    '  font-size: 0.6rem;',
    '  letter-spacing: 0.1em;',
    '}',
    '.footer-lang-label {',
    '  color: var(--text-dim, rgba(180,140,80,0.5));',
    '}',
    '.footer-lang-link {',
    '  color: var(--text-dim, rgba(180,140,80,0.5));',
    '  text-decoration: none;',
    '  transition: color 0.2s ease;',
    '}',
    '.footer-lang-link:hover {',
    '  color: var(--gold, #d4a030);',
    '}',
    '.footer-lang-sep {',
    '  color: var(--text-dim, rgba(180,140,80,0.3));',
    '}'
  ].join('\n');
  document.head.appendChild(style);
})();
