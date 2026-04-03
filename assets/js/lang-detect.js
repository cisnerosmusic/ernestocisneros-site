/* Language detection & redirect for ernestocisneros.art
   - Checks browser language on first visit
   - Redirects Spanish speakers to /es/ version
   - Respects manual choice stored in localStorage
   - Flag switcher toggles between /es/ and root */

(function() {
  // If user has manually chosen a language, respect that
  var chosen = localStorage.getItem('lang');
  if (chosen) return;

  // Detect browser language
  var lang = navigator.language || navigator.languages && navigator.languages[0] || '';
  lang = lang.toLowerCase();

  // If Spanish speaker and currently on English (root) version, redirect to /es/
  if (lang.startsWith('es') && window.location.pathname.indexOf('/es/') === -1) {
    var path = window.location.pathname;
    // Build the /es/ equivalent path
    var esPath = '/es' + (path === '/' ? '/index.html' : path);
    // Check if the Spanish version exists before redirecting
    var xhr = new XMLHttpRequest();
    xhr.open('HEAD', esPath, true);
    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 400) {
        window.location.replace(esPath);
      }
    };
    xhr.send();
  }
})();
