/* Language detection & redirect for ernestocisneros.art
   3-Layer Hybrid Language Detection Model:

   Layer 1 (Automatic): Browser language detection
   - Detects user's browser language preference
   - Redirects to matching language directory if available
   - Respects manual language choice stored in localStorage

   Layer 2 (Header): EN/ES flag switcher in header nav
   - Handled in HTML; this script doesn't touch it

   Layer 3 (Footer): Footer language links
   - Handled in HTML; this script doesn't touch it
*/

(function() {
  // ========== LAYER 1: AUTOMATIC DETECTION ==========

  // Configuration: Supported languages and their paths
  // Easy to extend with new languages
  var SUPPORTED_LANGS = [
    { code: 'es', path: '/es/' },
    { code: 'fr', path: '/fr/' },
    { code: 'ja', path: '/ja/' }
  ];

  // If user has manually chosen a language, respect that choice
  var chosen = localStorage.getItem('lang');
  if (chosen) return;

  // Check if already in a language-specific directory
  // (e.g., /es/, /fr/, /ja/)
  var currentPath = window.location.pathname;
  for (var i = 0; i < SUPPORTED_LANGS.length; i++) {
    if (currentPath.indexOf(SUPPORTED_LANGS[i].path) === 0) {
      // Already in a language directory, don't redirect
      return;
    }
  }

  // Detect browser language (first 2 characters)
  var browserLang = navigator.language || (navigator.languages && navigator.languages[0]) || '';
  browserLang = browserLang.toLowerCase().substring(0, 2);

  // Find matching language from supported list (first match wins)
  var targetLang = null;
  for (var i = 0; i < SUPPORTED_LANGS.length; i++) {
    if (SUPPORTED_LANGS[i].code === browserLang) {
      targetLang = SUPPORTED_LANGS[i];
      break;
    }
  }

  // If a matching language was found, check if page exists and redirect
  if (targetLang) {
    var targetPath = targetLang.path + (currentPath === '/' ? 'index.html' : currentPath);

    // Do a HEAD request to verify the target page exists before redirecting
    var xhr = new XMLHttpRequest();
    xhr.open('HEAD', targetPath, true);
    xhr.onload = function() {
      // Only redirect if page exists (status 200-399)
      if (xhr.status >= 200 && xhr.status < 400) {
        window.location.replace(targetPath);
      }
    };
    xhr.onerror = function() {
      // Silently fail if request errors; stay on current page
    };
    xhr.send();
  }
})();
