// ==UserScript==
// @name         Awesome Vivaldi Mod Loader
// @description  Dynamically loads CSS and JS mods from user_mods/ directory.
// @version      2026.7.7
// @author       Ryan (Acid)
// ==/UserScript==

// injectMods.js
// Injected into Vivaldi's window.html by the Awesome Vivaldi installer.
// Dynamically discovers and loads CSS/JS mods from user_mods/ at runtime.
//
// CSS: Loads Import.css, which uses @import to chain all other CSS files.
// JS:  Lists user_mods/js/ via chrome.runtime.getPackageDirectoryEntry,
//      loads ModConfig.js first, then the rest alphabetically.
//      async=false preserves execution order.

(function () {
  "use strict";

  const IMPORT_CSS = "Import.css";
  const CSS_DIR = "user_mods/css/";
  const JS_DIR = "user_mods/js/";
  const PRIORITY_JS = ["ModConfig.js"];

  const LOG_PREFIX = "[AwesomeVivaldi]";

  function log(msg) {
    console.log(LOG_PREFIX, msg);
  }

  function warn(msg) {
    console.warn(LOG_PREFIX, msg);
  }

  // ── CSS ──────────────────────────────────────────────────────────

  function loadCSS() {
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = CSS_DIR + IMPORT_CSS;
    link.onload = function () {
      log("CSS mods loaded via Import.css");
    };
    link.onerror = function () {
      warn("Failed to load Import.css — CSS mods may not be active");
    };
    document.head.appendChild(link);
  }

  // ── JS discovery ─────────────────────────────────────────────────

  function listJSFiles() {
    return new Promise(function (resolve) {
      if (!chrome.runtime || !chrome.runtime.getPackageDirectoryEntry) {
        warn("chrome.runtime.getPackageDirectoryEntry unavailable — JS mods skipped");
        resolve([]);
        return;
      }

      chrome.runtime.getPackageDirectoryEntry(function (rootDir) {
        rootDir.getDirectory(
          JS_DIR,
          { create: false },
          function (jsDir) {
            var reader = jsDir.createReader();
            var allEntries = [];

            function readBatch() {
              reader.readEntries(function (batch) {
                if (batch.length === 0) {
                  var files = allEntries
                    .filter(function (e) {
                      return e.isFile && /\.js$/.test(e.name);
                    })
                    .map(function (e) {
                      return e.name;
                    })
                    .sort();
                  resolve(files);
                } else {
                  allEntries = allEntries.concat(Array.prototype.slice.call(batch));
                  readBatch();
                }
              });
            }

            readBatch();
          },
          function () {
            // Directory doesn't exist — not an error, just no JS mods installed
            log("JS mods directory not found, skipping JS mods");
            resolve([]);
          }
        );
      });
    });
  }

  // ── JS loading ───────────────────────────────────────────────────

  function sortJSFiles(files) {
    var priority = [];
    var rest = [];

    for (var i = 0; i < files.length; i++) {
      if (PRIORITY_JS.indexOf(files[i]) !== -1) {
        priority.push(files[i]);
      } else {
        rest.push(files[i]);
      }
    }

    // Keep PRIORITY_JS order, then alphabetical for the rest
    var ordered = PRIORITY_JS.filter(function (p) {
      return priority.indexOf(p) !== -1;
    });
    return ordered.concat(rest);
  }

  function loadAllJS(files) {
    var sorted = sortJSFiles(files);
    log("Loading " + sorted.length + " JS mods: " + sorted.join(", "));

    for (var i = 0; i < sorted.length; i++) {
      var script = document.createElement("script");
      script.src = JS_DIR + sorted[i];
      script.async = false; // Preserve execution order (critical: ModConfig before AI mods)
      script.onerror = function (filename) {
        return function () {
          warn("Failed to load JS mod: " + filename);
        };
      }(sorted[i]);
      document.body.appendChild(script);
    }
  }

  // ── Init ─────────────────────────────────────────────────────────

  function init() {
    log("Awesome Vivaldi mod loader initializing…");

    // CSS is non-blocking — browser loads Import.css in parallel
    loadCSS();

    // JS loads sequentially via async=false to respect dependency order
    listJSFiles().then(function (files) {
      if (files.length > 0) {
        loadAllJS(files);
      } else {
        log("No JS mods found");
      }
    });
  }

  // Run as soon as possible (script is in <body>, DOM is available)
  if (document.body) {
    init();
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
