// VModToast.js
// Lightweight toast notification system for VivaldiModpack.

(() => {
  "use strict";

  const CONTAINER_ID = "vmod-toast-container";
  const DEBUG = true;
  const LOG_PREFIX = "[VModToast]";
  const FEATURE_CONFIG = {
    backgroundTabToast: true,
    backgroundTabToastId: "vmod-background-tab-opened",
  };
  const I18N = {
    zh: {
      backgroundTabOpened: "新的后台标签页已打开",
      undo: "撤销",
    },
    en: {
      backgroundTabOpened: "New background tab opened",
      undo: "Undo",
    },
  };

  const DURATIONS = {
    error: 5000,
    warning: 4000,
    success: 2500,
    info: 2000,
  };

  const ICONS = {
    info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>`,
    success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  };

  function getLanguageKey() {
    const lang = globalThis.chrome?.i18n?.getUILanguage?.() || navigator.language || "";
    return String(lang).toLowerCase().startsWith("zh") ? "zh" : "en";
  }

  function t(key) {
    const lang = getLanguageKey();
    return I18N[lang]?.[key] || I18N.zh[key] || key;
  }

  let container = null;
  let positionObserver = null;
  let domObserver = null;
  let resizeListening = false;
  let lastPositionLogKey = "";
  const observedPositionTargets = new WeakSet();
  const timeouts = new Map();

  function getToastHost() {
    return document.getElementById("webview-container") || document.body || document.documentElement;
  }

  function ensureToastHost() {
    const host = getToastHost();
    if (!host) return null;
    if (host.id === "webview-container") {
      const position = getComputedStyle(host).position;
      if (position === "static") {
        host.style.position = "relative";
      }
    }
    return host;
  }

  function ensureContainer() {
    const host = ensureToastHost();
    if (!host) return null;
    if (!container) {
      container = document.createElement("div");
      container.id = CONTAINER_ID;
    }
    if (container.parentElement !== host) {
      host.appendChild(container);
    }
    updateToastPosition();
    return container;
  }

  function classText(el) {
    return el?.className || "";
  }

  function rectInfo(el) {
    const rect = el?.getBoundingClientRect?.();
    if (!rect) return null;
    return {
      left: Math.round(rect.left),
      right: Math.round(rect.right),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    };
  }

  function getPositionSnapshot() {
    const browser = document.getElementById("browser");
    const tabbar = document.getElementById("tabs-tabbar-container");
    const wrapper = tabbar?.closest(".auto-hide-wrapper");
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    const tabbarRect = rectInfo(tabbar);
    let tabSide = null;
    let source = "none";

    if (tabbar?.classList.contains("left")) {
      tabSide = "left";
      source = "tabbar.left";
    } else if (tabbar?.classList.contains("right")) {
      tabSide = "right";
      source = "tabbar.right";
    } else if (wrapper?.classList.contains("left")) {
      tabSide = "left";
      source = "wrapper.left";
    } else if (wrapper?.classList.contains("right")) {
      tabSide = "right";
      source = "wrapper.right";
    } else if (browser?.classList.contains("tabs-left")) {
      tabSide = "left";
      source = "browser.tabs-left";
    } else if (browser?.classList.contains("tabs-right")) {
      tabSide = "right";
      source = "browser.tabs-right";
    } else if (tabbarRect?.width && tabbarRect?.height && tabbarRect.height > tabbarRect.width) {
      tabSide = viewportWidth && tabbarRect.left > viewportWidth / 2 ? "right" : "left";
      source = "tabbar-rect";
    }

    const toastSide = tabSide === "right" ? "left" : "right";
    const computed = container ? getComputedStyle(container) : null;

    return {
      source,
      tabSide,
      toastSide,
      browserClass: classText(browser),
      tabbarClass: classText(tabbar),
      wrapperClass: classText(wrapper),
      tabbarRect,
      viewportWidth,
      containerClass: classText(container),
      containerInline: container ? { left: container.style.left, right: container.style.right } : null,
      containerComputed: computed ? { left: computed.left, right: computed.right } : null,
      containerParent: container?.parentElement?.id || container?.parentElement?.tagName || null,
      themeVars: computed ? {
        colorHighlightBg: computed.getPropertyValue("--colorHighlightBg").trim(),
        colorAccentBg: computed.getPropertyValue("--colorAccentBg").trim(),
      } : null,
    };
  }

  function logPositionSnapshot(reason, force = false) {
    if (!DEBUG) return;
    const snapshot = getPositionSnapshot();
    const key = JSON.stringify({
      source: snapshot.source,
      tabSide: snapshot.tabSide,
      toastSide: snapshot.toastSide,
      browserClass: snapshot.browserClass,
      tabbarClass: snapshot.tabbarClass,
      wrapperClass: snapshot.wrapperClass,
      containerClass: snapshot.containerClass,
      containerComputed: snapshot.containerComputed,
    });

    if (!force && key === lastPositionLogKey) return;
    lastPositionLogKey = key;
    console.info(`${LOG_PREFIX} position ${reason}`, snapshot);
  }

  function updateToastPosition() {
    if (!container) return;
    const { toastSide } = getPositionSnapshot();
    container.classList.remove("vmod-toast-left", "vmod-toast-right");
    container.classList.add(`vmod-toast-${toastSide}`);
    logPositionSnapshot("updated");
  }

  function observePositionTarget(target) {
    if (!target || observedPositionTargets.has(target)) return;
    observedPositionTargets.add(target);
    positionObserver.observe(target, { attributes: true, attributeFilter: ["class", "style"] });
  }

  function refreshPositionObservers() {
    const browser = document.getElementById("browser");
    const tabbar = document.getElementById("tabs-tabbar-container");
    observePositionTarget(browser);
    observePositionTarget(tabbar);
    observePositionTarget(tabbar?.closest(".auto-hide-wrapper"));
    if (container) ensureContainer();
    updateToastPosition();
  }

  function detectPosition() {
    if (!positionObserver) {
      positionObserver = new MutationObserver(refreshPositionObservers);
    }

    if (!domObserver) {
      domObserver = new MutationObserver(refreshPositionObservers);
      domObserver.observe(document.documentElement, { childList: true, subtree: true });
    }

    if (!resizeListening) {
      resizeListening = true;
      window.addEventListener("resize", updateToastPosition, { passive: true });
    }

    refreshPositionObservers();
  }

  function findExisting(id) {
    if (!container) return null;
    const items = container.children;
    for (let i = items.length - 1; i >= 0; i--) {
      const el = items[i];
      if (el._vmodToastId === id) return el;
    }
    return null;
  }

  function reuseToast(el, options) {
    clearTimeout(timeouts.get(el));
    applyToastContent(el, options);
    el.style.animation = "vmod-toast-bounce 0.15s ease";
    el.addEventListener("animationend", () => {
      el.style.animation = "";
    }, { once: true });
    startTimer(el);
  }

  function startTimer(el) {
    const duration = el._vmodDuration;
    timeouts.set(el, setTimeout(() => dismiss(el), duration));
  }

  function dismiss(el) {
    clearTimeout(timeouts.get(el));
    timeouts.delete(el);
    el.style.animation = "vmod-toast-exit 0.2s ease-in forwards";
    el.addEventListener("animationend", () => el.remove(), { once: true });
  }

  function runAction(action, event, toast) {
    if (typeof action !== "function") return;
    try {
      action(event, toast);
    } catch (err) {
      console.error(`${LOG_PREFIX} toast action failed`, err);
    }
  }

  function makeButtonOption(options) {
    if (options.button) return options.button;
    if (options.undo) {
      return {
        text: options.undoText || "撤销",
        action: options.undo,
      };
    }
    return null;
  }

  function applyToastContent(toast, options) {
    const {
      type = "info",
      module = "",
      title = module,
      message = "",
      description = "",
      descriptionHtml = "",
      messageHtml = "",
      onClick = null,
      tabId = null,
      copyText = null,
    } = options;
    const button = makeButtonOption(options);

    toast.className = `vmod-toast vmod-toast-${type}`;
    if (onClick || tabId || copyText) toast.classList.add("vmod-toast-clickable");
    toast._vmodDuration = options.duration ?? options.timeout ?? DURATIONS[type] ?? DURATIONS.info;
    toast._vmodClickAction = onClick || (tabId ? () => activateTab(tabId, options.windowId) : null);
    toast._vmodCopyText = copyText;

    toast.innerHTML = `
      <div class="vmod-toast-icon">${ICONS[type] || ICONS.info}</div>
      <div class="vmod-toast-body">
        ${title ? `<div class="vmod-toast-title">${escapeHtml(title)}</div>` : ""}
        <div class="vmod-toast-message">${messageHtml || escapeHtml(message)}</div>
        ${description || descriptionHtml ? `<div class="vmod-toast-description">${descriptionHtml || escapeHtml(description)}</div>` : ""}
      </div>
      ${button ? `<button class="vmod-toast-action" type="button">${escapeHtml(button.text || "")}</button>` : ""}
    `;

    if (button) {
      toast.querySelector(".vmod-toast-action").addEventListener("click", (e) => {
        e.stopPropagation();
        dismiss(toast);
        runAction(button.action || button.command, e, toast);
      });
    }
  }

  function createToast(message, options = {}) {
    const normalized = {
      ...options,
      message,
    };
    const id = normalized.id || normalized.messageId || `${normalized.module || ""}\n${message}`;

    const existing = findExisting(id);
    if (existing) {
      reuseToast(existing, normalized);
      return existing;
    }

    ensureContainer();

    const toast = document.createElement("div");
    toast._vmodToastId = id;
    applyToastContent(toast, normalized);

    toast.addEventListener("click", (e) => {
      if (e.target.closest(".vmod-toast-action")) return;
      if (toast._vmodCopyText) {
        navigator.clipboard.writeText(toast._vmodCopyText).then(() => {
          const msgEl = toast.querySelector(".vmod-toast-message");
          const orig = msgEl.textContent;
          msgEl.textContent = "已复制";
          setTimeout(() => {
            if (toast.parentNode) msgEl.textContent = orig;
          }, 500);
        });
        return;
      }
      runAction(toast._vmodClickAction, e, toast);
      if (toast._vmodClickAction) dismiss(toast);
    });

    toast.addEventListener("mouseenter", () => {
      clearTimeout(timeouts.get(toast));
    });
    toast.addEventListener("mouseleave", () => {
      startTimer(toast);
    });

    container.prepend(toast);

    toast.style.animation = "vmod-toast-enter 0.25s ease-out forwards";

    startTimer(toast);
    return toast;
  }

  function activateTab(tabId, windowId) {
    const api = globalThis.chrome;
    if (!api?.tabs?.update || !tabId) return;
    api.tabs.update(tabId, { active: true }, () => {
      if (api.runtime?.lastError) return;
      if (windowId && api.windows?.update) {
        api.windows.update(windowId, { focused: true }, () => {});
      }
    });
  }

  function removeTab(tabId) {
    const api = globalThis.chrome;
    if (!api?.tabs?.remove || !tabId) return;
    api.tabs.remove(tabId, () => {});
  }

  function showBackgroundTabToast(tab) {
    if (!tab?.id || tab.active) return;
    if (window.__vmodSuppressTabToast) return;
    createToast(t("backgroundTabOpened"), {
      id: FEATURE_CONFIG.backgroundTabToastId,
      module: "Tabs",
      type: "info",
      timeout: 3000,
      tabId: tab.id,
      windowId: tab.windowId,
      undo: () => removeTab(tab.id),
      undoText: t("undo"),
    });
  }

  function initTabNotifications() {
    if (!FEATURE_CONFIG.backgroundTabToast) return;
    const api = globalThis.chrome;
    if (!api?.tabs?.onCreated?.addListener) return;
    api.tabs.onCreated.addListener((tab) => {
      showBackgroundTabToast(tab);
    });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // Expose globally
  window.VModToast = {
    show: createToast,
    showBackgroundTab: showBackgroundTabToast,
    activateTab,
    dismiss,
    debugPosition: () => logPositionSnapshot("manual", true),
  };

  // Init position detection
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", detectPosition);
  } else {
    detectPosition();
  }
  initTabNotifications();
})();
