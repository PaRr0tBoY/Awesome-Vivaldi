(function () {
  "use strict";

  const ESSENTIAL_CONFIG = {
    maxCols: 4,
    defaultCols: 3,
    defaultRows: 3,
    maxTabs: 9,
    storageKey: "vivaldi-essential-tabs",
    storageVersion: 2,
  };

  const SELECTORS = {
    TABS_CONTAINER: "#tabs-container",
    RESIZE: "#tabs-container .resize",
    TAB_STRIP: "#tabs-container .tab-strip",
    TAB_POSITION: ".tab-position",
    TAB_WRAPPER: ".tab-wrapper",
    ESSENTIAL_WRAPPER: "#essential-wrapper",
  };

  class EssentialManager {
    constructor() {
      this.wrapper = null;
      this._maxCols = ESSENTIAL_CONFIG.defaultCols;
      this._maxRows = ESSENTIAL_CONFIG.defaultRows;
      this._outerObserver = null;
      this._innerObserver = null;
      this._ready = false;

      this._loadConfig();
      this._init();
    }

    _init() {
      this._injectWrapper();
      if (!this.wrapper) return;

      this._applyCssVars();
      this._syncEssentialTabs();

      this._ready = true;
      this._bindOuterObserver();
      this._bindInnerObserver();
    }

    _injectWrapper() {
      const existing = document.querySelector(SELECTORS.ESSENTIAL_WRAPPER);
      if (existing) {
        this.wrapper = existing;
        return;
      }

      const resize = document.querySelector(SELECTORS.RESIZE);
      if (!resize) return;

      const wrapper = document.createElement("div");
      wrapper.id = "essential-wrapper";
      wrapper.setAttribute("role", "toolbar");
      wrapper.setAttribute("aria-label", "Essential Tabs");
      resize.before(wrapper);
      this.wrapper = wrapper;
    }

    _bindOuterObserver() {
      const container = document.querySelector(SELECTORS.TABS_CONTAINER);
      if (!container) return;

      this._outerObserver?.disconnect();

      this._outerObserver = new MutationObserver(() => {
        if (!this._ready) return;

        // wrapper 丢失了，重新注入
        if (!document.querySelector(SELECTORS.ESSENTIAL_WRAPPER)) {
          this.wrapper = null;
          this._injectWrapper();
          this._applyCssVars();
        }

        if (this.wrapper) {
          this._syncEssentialTabs();
        }
      });

      this._outerObserver.observe(container, {
        childList: true,
        subtree: true,
      });
    }

    _bindInnerObserver() {
      const resize = document.querySelector(SELECTORS.RESIZE);
      if (!resize) return;

      this._innerObserver?.disconnect();

      this._innerObserver = new MutationObserver(() => {
        if (!this._ready) return;
        this._syncEssentialTabs();
      });

      this._innerObserver.observe(resize, { childList: true, subtree: true });
    }

    _loadConfig() {
      try {
        const raw = localStorage.getItem(ESSENTIAL_CONFIG.storageKey);
        if (!raw) return;
        const cfg = JSON.parse(raw);
        if (cfg.version !== ESSENTIAL_CONFIG.storageVersion) return;

        let cols = cfg.cols || ESSENTIAL_CONFIG.defaultCols;
        let rows = cfg.rows || ESSENTIAL_CONFIG.defaultRows;
        if (cols > ESSENTIAL_CONFIG.maxCols) cols = ESSENTIAL_CONFIG.maxCols;

        this._maxCols = cols;
        this._maxRows = rows;
      } catch (e) {
        // ignore
      }
    }

    _saveConfig() {
      try {
        if (!this.wrapper) return;

        const tabs = this._getEssentialTabPositions().map((tp) => {
          const w = tp.querySelector(SELECTORS.TAB_WRAPPER);
          const titleEl = tp.querySelector(".title");
          const ariaLabel = tp.getAttribute("aria-label") || "";
          let url = "";
          if (ariaLabel.includes(" | ")) {
            url = ariaLabel.split(" | ").pop().trim();
          }
          return {
            id: w?.dataset.id || "",
            url,
            title: titleEl?.textContent?.trim() || "",
          };
        });

        localStorage.setItem(
          ESSENTIAL_CONFIG.storageKey,
          JSON.stringify({
            version: ESSENTIAL_CONFIG.storageVersion,
            cols: this._maxCols,
            rows: this._maxRows,
            tabs,
          }),
        );
      } catch (e) {
        // ignore
      }
    }

    _applyCssVars() {
      try {
        document.documentElement.style.setProperty(
          "--essential-cols",
          this._maxCols,
        );
        document.documentElement.style.setProperty(
          "--essential-rows",
          this._maxRows,
        );
      } catch (e) {
        // ignore
      }
    }

    _isTabStack(tp) {
      if (!tp) return false;
      return (
        tp.classList.contains("is-substack") ||
        tp.classList.contains("accordion") ||
        tp.querySelector(".svg-tab-stack") !== null
      );
    }

    _isAccordionChild(tp) {
      if (!tp) return false;
      return (
        tp.classList.contains("in-accordion") ||
        tp.querySelector(".tab.in-accordion") !== null
      );
    }

    _getCandidateTabPositions() {
      try {
        const resize = document.querySelector(SELECTORS.RESIZE);
        if (!resize) return [];

        const all = resize.querySelectorAll(SELECTORS.TAB_POSITION);
        return Array.from(all).filter((tp) => {
          if (this._isTabStack(tp)) return false;
          if (this._isAccordionChild(tp)) return false;
          return true;
        });
      } catch (e) {
        return [];
      }
    }

    _getEssentialTabPositions() {
      if (!this.wrapper) return [];
      try {
        return Array.from(
          this.wrapper.querySelectorAll(SELECTORS.TAB_POSITION),
        );
      } catch (e) {
        return [];
      }
    }

    _syncEssentialTabs() {
      if (!this.wrapper) return;

      // 操作 DOM 前先断开 observer，防止死循环
      this._outerObserver?.disconnect();
      this._innerObserver?.disconnect();

      const candidates = this._getCandidateTabPositions();
      const targetCount = Math.min(candidates.length, ESSENTIAL_CONFIG.maxTabs);
      const targetSet = new Set(candidates.slice(0, targetCount));
      const currentSet = new Set(this._getEssentialTabPositions());

      const toMoveOut = [...currentSet].filter((tp) => !targetSet.has(tp));
      const toMoveIn = [...targetSet].filter(
        (tp) => !currentSet.has(tp) && tp.parentElement !== this.wrapper,
      );

      toMoveOut.forEach((tp) => this._moveTabOut(tp));
      toMoveIn.forEach((tp) => this._moveTabIn(tp));
      this._reorderWrapper();

      this._saveConfig();

      // 微任务里重连，rAF 动画类变更不会触发
      Promise.resolve().then(() => {
        this._bindOuterObserver();
        this._bindInnerObserver();
      });
    }

    _moveTabIn(tp) {
      if (!this.wrapper || !tp) return;

      // 强制清除 Vivaldi 的内联绝对定位，改为 grid 布局
      tp.style.cssText = "";
      tp.removeAttribute("style");

      const w = tp.querySelector(SELECTORS.TAB_WRAPPER);
      if (w) {
        w.dataset.essential = "true";
        w.style.cssText = "";
        w.removeAttribute("style");
      }

      // 入场动画
      tp.classList.add("inserting");

      const candidates = this._getCandidateTabPositions();
      const currentInWrapper = this._getEssentialTabPositions();
      const insertIdx = candidates.indexOf(tp);

      let insertBefore = null;
      for (const cur of currentInWrapper) {
        const curIdx = candidates.indexOf(cur);
        if (curIdx !== -1 && curIdx > insertIdx) {
          insertBefore = cur;
          break;
        }
      }

      if (insertBefore) {
        insertBefore.before(tp);
      } else {
        this.wrapper.appendChild(tp);
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          tp.classList.remove("inserting");
          tp.classList.add("inserted");
          setTimeout(() => tp.classList.remove("inserted"), 220);
        });
      });
    }

    _moveTabOut(tp) {
      if (!tp) return;

      const w = tp.querySelector(SELECTORS.TAB_WRAPPER);
      if (w) delete w.dataset.essential;

      tp.classList.add("inserting");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          tp.classList.remove("inserting");
        });
      });

      const tabStrip = document.querySelector(SELECTORS.TAB_STRIP);
      if (tabStrip) {
        tabStrip.appendChild(tp);
        // 让 Vivaldi 的 JS 重新管理这个标签的定位
        // 通过短暂移除再恢复触发 Vivaldi 的位置计算
        tp.style.cssText = "";
        tp.removeAttribute("style");
      }
    }

    _reorderWrapper() {
      if (!this.wrapper) return;

      const candidates = this._getCandidateTabPositions();
      const current = this._getEssentialTabPositions();

      current.sort((a, b) => {
        const aIdx = candidates.indexOf(a);
        const bIdx = candidates.indexOf(b);
        if (aIdx === -1) return 1;
        if (bIdx === -1) return -1;
        return aIdx - bIdx;
      });

      current.forEach((tp) => this.wrapper.appendChild(tp));
    }

    destroy() {
      this._ready = false;
      this._outerObserver?.disconnect();
      this._innerObserver?.disconnect();
    }
  }

  function init() {
    const check = () => {
      const resize = document.querySelector(SELECTORS.RESIZE);
      if (!resize) {
        setTimeout(check, 200);
        return;
      }
      window.essentialManager = new EssentialManager();
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", check);
    } else {
      check();
    }
  }

  init();
})();
