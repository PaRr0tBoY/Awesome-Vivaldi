// RSS Feed Icons for Vivaldi 7.6+ (Compact Memory-Safe Version)
// Replaces generic RSS icons with website favicons in the sidebar
// Updated for Vivaldi 7.6+ compatibility with memory leak prevention
// Original concept by Tam710562 - Enhanced for modern Vivaldi versions

(function () {
  "use strict";

  // Memory cleanup registry to prevent leaks during long browser sessions
  const cleanup = {
    obs: new Set(), // MutationObserver instances
    tmr: new Set(), // setTimeout/setInterval IDs
    add(type, item) {
      this[type].add(item);
    },
    clear() {
      // Disconnect all DOM observers
      this.obs.forEach((o) => o?.disconnect?.());
      // Clear all pending timers
      this.tmr.forEach((t) => clearTimeout(t));
      this.obs.clear();
      this.tmr.clear();
    },
  };

  // Global state variables
  let feeds = null, // Map of RSS feed settings from Vivaldi API
    loaded = false, // Whether feed settings have been loaded
    init = false; // Whether initialization is complete

  // Create favicon image element with fallback handling
  const createIcon = (url) => {
    if (!url) return null;
    try {
      const origin = new URL(url).origin;
      if (origin === "null") return null;

      // Create img element with proper attributes
      const img = document.createElement("img");
      Object.assign(img, {
        width: 16,
        height: 16,
        loading: "lazy",
        src: `chrome://favicon/size/16@1x/${origin}`,
        srcset: `chrome://favicon/size/16@1x/${origin} 1x, chrome://favicon/size/16@2x/${origin} 2x`,
      });

      // Apply CSS styling to match Vivaldi's design
      Object.assign(img.style, {
        width: "16px",
        height: "16px",
        margin: "auto auto auto 16px",
        borderRadius: "2px",
        flexShrink: "0",
        display: "inline-block",
      });

      // Handle favicon loading errors with graceful fallbacks
      img.addEventListener("error", function handler() {
        if (this.src.includes(origin)) {
          // First fallback: try full URL instead of origin
          this.src = `chrome://favicon/size/16@1x/${url}`;
        } else {
          // Final fallback: hide icon if favicon unavailable
          this.style.display = "none";
          this.removeEventListener("error", handler);
        }
      });
      return img;
    } catch {
      return null;
    }
  };

  // Replace SVG icon with website favicon
  const replaceIcon = (el, url) => {
    // Skip if already processed or invalid parameters
    if (!el || !url || !el.parentNode || el.dataset.feedIconProcessed)
      return false;

    // Find the first SVG icon (Vivaldi 7.6+ uses SVG instead of .folder-icon)
    const svg = el.querySelector("svg:first-of-type");
    const icon = svg?.parentNode && createIcon(url);

    if (!icon) return false;

    try {
      // Replace SVG with favicon image
      svg.parentNode.replaceChild(icon, svg);
      // Mark element as processed to avoid duplicate processing
      el.dataset.feedIconProcessed = "true";
      return true;
    } catch (e) {
      // Cleanup on error to prevent DOM pollution
      icon.parentNode?.removeChild(icon);
      return false;
    }
  };

  // Load RSS feed settings from Vivaldi's internal API
  const loadSettings = () =>
    new Promise((resolve) => {
      if (typeof vivaldi?.prefs?.get !== "function") return resolve();

      vivaldi.prefs.get("vivaldi.rss.settings", (settings) => {
        if (Array.isArray(settings)) {
          // Clear existing data and create fresh Map
          feeds?.clear?.() || (feeds = new Map());
          // Process each feed setting (Vivaldi 7.6+ uses feedId instead of path)
          settings.forEach((f) => f.feedId && f.url && feeds.set(f.feedId, f));
          loaded = true;
        }
        resolve();
      });
    });

  // Process all RSS elements in the container
  const processElements = async (container) => {
    if (!container?.querySelectorAll) return;

    // Find unprocessed RSS elements using updated selectors for Vivaldi 7.6+
    const elements = Array.from(
      container.querySelectorAll(
        '.tree-item[data-id^="FEEDS_LABELS_"]:not([data-feed-icon-processed])',
      ),
    );

    if (!elements.length) return;

    // Load settings if not already loaded
    !loaded && (await loadSettings());
    if (!feeds) return;

    // Process each RSS element
    elements.forEach((el) => {
      try {
        // Extract feedId from data-id attribute
        const id = el.dataset.id?.replace("FEEDS_LABELS_", "");
        const feed = id && feeds.get(id);
        // Replace icon if feed settings found
        feed?.url && replaceIcon(el, feed.url);
      } catch {}
    });
  };

  // Memory-safe timeout wrapper with cleanup registration
  const safeTimeout = (fn, delay) => {
    const id = setTimeout(() => {
      cleanup.tmr.delete(id);
      fn();
    }, delay);
    cleanup.add("tmr", id);
    return id;
  };

  // Memory-safe DOM observer with automatic cleanup registration
  const observe = (target, callback) => {
    if (!target?.nodeType) return null;

    // Create observer that triggers on DOM additions
    const observer = new MutationObserver((mutations) => {
      mutations.some((m) => m.addedNodes.length) && callback();
    });

    try {
      observer.observe(target, { childList: true, subtree: true });
      cleanup.add("obs", observer);
      return observer;
    } catch {
      return null;
    }
  };

  // Main initialization function with panel detection
  const initialize = () => {
    if (init) return;

    // Search for RSS panels using multiple selectors for compatibility
    const panel = [
      "#panels-container",
      "#panels",
      "#ui-region-panel",
      "#mail_panel",
    ]
      .map((s) => document.querySelector(s))
      .find(Boolean);

    if (panel) {
      init = true;
      // Load settings and process existing elements
      loadSettings().then(() => processElements(panel));

      // Set up DOM observer with throttling to prevent excessive processing
      let timeout;
      observe(panel, () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => processElements(panel), 300);
      });
    } else {
      // Retry initialization if panels not found yet
      safeTimeout(() => initialize(), 3000);
    }
  };

  // Wait for Vivaldi browser interface to be ready
  const waitBrowser = (fn, delay = 300) => {
    safeTimeout(function check() {
      const browser = document.getElementById("browser");
      browser ? fn() : waitBrowser(fn);
    }, delay);
  };

  // Cleanup all resources when page unloads to prevent memory leaks
  window.addEventListener("beforeunload", () => {
    cleanup.clear();
    feeds?.clear();
    feeds = null;
    loaded = init = false;
  });

  // Start script execution with proper error handling
  try {
    // Initial startup with delay for interface loading
    waitBrowser(() => safeTimeout(initialize, 1500));
    // Fallback initialization attempt if first one fails
    safeTimeout(() => !init && waitBrowser(initialize), 8000);
  } catch (e) {
    console.error("RSS Feed Icons error:", e);
  }
})();
