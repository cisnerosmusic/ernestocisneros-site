/**
 * Schema Loader — Ernesto Cisneros Cino
 * ========================================
 * CRITICAL INFRASTRUCTURE — DO NOT REMOVE OR MODIFY
 *
 * This script injects JSON-LD structured data from external files
 * into every page. Schemas are stored in /assets/schemas/ as .json
 * files to protect them from being accidentally deleted during
 * HTML refactoring by AI agents or manual edits.
 *
 * How it works:
 *   1. Reads data-schema attribute from its own <script> tag
 *   2. Fetches /assets/schemas/global-person.json (shared identity)
 *   3. Fetches the page-specific schema file
 *   4. Injects both as <script type="application/ld+json"> in <head>
 *
 * Usage in HTML:
 *   <script src="/assets/js/schema-loader.js" data-schema="books" defer></script>
 *   → loads global-person.json + books.json
 *
 * For pages that only need the global Person schema:
 *   <script src="/assets/js/schema-loader.js" data-schema="none" defer></script>
 *
 * @version 1.0.0
 * @author Ernesto Cisneros Cino
 */

(function () {
  'use strict';

  // Determine base path relative to current page depth
  function getBasePath() {
    var scripts = document.querySelectorAll('script[data-schema]');
    var current = scripts[scripts.length - 1];
    var src = current.getAttribute('src') || '';
    // Extract base from src: "/assets/js/schema-loader.js" → "/assets/schemas/"
    // Or relative: "assets/js/schema-loader.js" → "assets/schemas/"
    // Or "../assets/js/schema-loader.js" → "../assets/schemas/"
    var base = src.replace(/js\/schema-loader\.js.*$/, 'schemas/');
    return base;
  }

  function injectSchema(data) {
    if (!data) return;
    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  function fetchAndInject(url) {
    return fetch(url)
      .then(function (res) {
        if (!res.ok) {
          console.warn('[Schema Loader] Failed to load:', url, res.status);
          return null;
        }
        return res.json();
      })
      .then(function (data) {
        if (!data) return;
        // If the JSON is an array, inject each item separately
        if (Array.isArray(data)) {
          data.forEach(function (item) { injectSchema(item); });
        } else {
          injectSchema(data);
        }
      })
      .catch(function (err) {
        console.warn('[Schema Loader] Error loading:', url, err);
      });
  }

  function init() {
    var scripts = document.querySelectorAll('script[data-schema]');
    if (scripts.length === 0) return;

    var current = scripts[scripts.length - 1];
    var schemaName = current.getAttribute('data-schema');
    var basePath = getBasePath();

    // Always load the global Person schema
    var promises = [fetchAndInject(basePath + 'global-person.json')];

    // Load page-specific schema if not "none"
    if (schemaName && schemaName !== 'none') {
      promises.push(fetchAndInject(basePath + schemaName + '.json'));
    }

    Promise.all(promises);
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
