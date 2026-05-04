// ==UserScript==
// @name         Interaction Feedback
// @description  Mouse gesture trails, tiled tab indicators with Zen-style merge, drag-to-split avoidance animation, and auto-hide tabbar pulse.
// @requirements InteractionFeedback.css
// @version      2026.5.4
// @author       PaRr0tBoY
// ==/UserScript==

(() => {
  "use strict";

  const LOG = "[InteractionFeedback]";

  // ═══════════════════════════════════════════════════════════════════
  // Feature Toggles — set enabled: true/false to turn features on/off
  // ═══════════════════════════════════════════════════════════════════
  const CONFIG = {
    gestureTrail: {
      enabled: false,          // 右键拖拽轨迹
      strokeColor: "rgba(120, 160, 255, 0.7)",
      strokeWidth: 3,
      fadeDurationMs: 300,
      maxPoints: 200,
    },
    tiledTabIndicator: {
      enabled: false,          // 分屏标签合并样式
      autoPinMixedGroups: true,
    },
    dragAvoidance: {
      enabled: false,          // 拖拽分屏回避动画
      edgeThreshold: 0.25,
      animationDurationMs: 150,
    },
    autoHidePulse: {
      enabled: true,           // 自动隐藏标签栏脉冲提示
      showDurationMs: 1000,
      cooldownMs: 1500,
    },
  };

  // ═══════════════════════════════════════════════════════════════════
  // Helpers
  // ═══════════════════════════════════════════════════════════════════

  function queryTabs() {
    return new Promise((resolve) => {
      chrome.tabs.query({ currentWindow: true }, (tabs) =>
        resolve(chrome.runtime.lastError ? [] : tabs || [])
      );
    });
  }

  function parseExtData(tab) {
    if (!tab || !tab.vivExtData) return {};
    try {
      return typeof tab.vivExtData === "string"
        ? JSON.parse(tab.vivExtData)
        : tab.vivExtData;
    } catch {
      return {};
    }
  }

  function getTabWrapper(tabId) {
    return document.querySelector(`.tab-wrapper[data-id="tab-${tabId}"]`);
  }

  function isVerticalTabBar() {
    const bar = document.getElementById("tabs-tabbar-container");
    return bar?.classList.contains("left") || bar?.classList.contains("right");
  }


  // ═══════════════════════════════════════════════════════════════════
  // Feature 1: Tiled Tab Detection & Zen-Style Merge
  // ═══════════════════════════════════════════════════════════════════
  //
  // Vivaldi positions .tab-position via --PositionX/--PositionY.
  // We do NOT override these — only add visual styling classes.
  // Tiled tabs already appear side-by-side in the tab strip;
  // we just make them look like one merged container.
  // ═══════════════════════════════════════════════════════════════════

  const TiledFeature = (() => {
    const CONN_CLASS = "if-tiled-connector";
    const ACTIVE_CLASS = "if-tiled-active";
    const POS_CLASSES = ["if-tiled-first", "if-tiled-middle", "if-tiled-last"];
    const BG_CLASS = "if-tiled-bg";
    let currentGroups = new Map();
    let lastHash = "";
    let skipObserver = false;
    let rendering = false;

    function detectGroupsFromDOM() {
      const stack = document.getElementById("webpage-stack");
      if (!stack) return new Map();
      const groups = new Map();
      const tiledContainers = stack.querySelectorAll(":scope > .tiled");
      for (const container of tiledContainers) {
        const views = container.querySelectorAll(".webpageview[data-id]");
        if (views.length < 2) continue;
        const tabIds = new Set();
        for (const view of views) {
          const raw = view.getAttribute("data-id")?.replace("page-", "")?.replace("tab-", "");
          if (raw) tabIds.add(raw);
        }
        if (tabIds.size >= 2) {
          const key = [...tabIds].sort().join(",");
          groups.set(key, { tabIds, source: "dom" });
        }
      }
      return groups;
    }

    async function detectGroupsFromAPI() {
      const tabs = await queryTabs();
      const groups = new Map();
      for (const tab of tabs) {
        const viv = parseExtData(tab);
        const tiling = viv.tiling;
        if (!tiling || !tiling.id) continue;
        if (!groups.has(tiling.id)) {
          groups.set(tiling.id, { tabIds: new Set(), layout: tiling.layout || "row", source: "api" });
        }
        groups.get(tiling.id).tabIds.add(String(tab.id));
      }
      for (const [key, group] of groups) {
        if (group.tabIds.size < 2) groups.delete(key);
      }
      return groups;
    }

    async function detectAllGroups() {
      const domGroups = detectGroupsFromDOM();
      const apiGroups = await detectGroupsFromAPI();
      const merged = new Map();
      for (const [id, group] of apiGroups) merged.set(id, group);
      for (const [key, group] of domGroups) {
        if (!merged.has(key)) merged.set(key, group);
      }
      return merged;
    }

    function hashGroups(groups) {
      return [...groups.keys()].sort().join("|");
    }

    async function fixMixedPinnedGroups(groups) {
      if (!CONFIG.tiledTabIndicator.autoPinMixedGroups) return;
      const tabs = await queryTabs();
      const tabMap = new Map(tabs.map((t) => [String(t.id), t]));
      for (const [, group] of groups) {
        const members = [...group.tabIds].map((id) => tabMap.get(id)).filter(Boolean);
        const hasPinned = members.some((t) => t.pinned);
        const hasUnpinned = members.some((t) => !t.pinned);
        if (hasPinned && hasUnpinned) {
          for (const tab of members) {
            if (!tab.pinned) {
              try {
                await new Promise((resolve) => chrome.tabs.update(tab.id, { pinned: true }, resolve));
                console.log(LOG, `Auto-pinned tab ${tab.id}`);
              } catch (e) {
                console.warn(LOG, `Failed to pin tab ${tab.id}:`, e);
              }
            }
          }
        }
      }
    }

    // Apply visual merge styling — does NOT touch --PositionX/--PositionY
    async function renderMergeIndicators(groups) {
      if (!CONFIG.tiledTabIndicator.enabled) return;
      if (rendering) return;
      rendering = true;
      skipObserver = true;

      cleanupMergeIndicators();

      try {
        const tabs = await queryTabs();
        const tabMap = new Map(tabs.map((t) => [String(t.id), t]));
        const tabStrip = document.querySelector(".tab-strip");
        if (!tabStrip) return;

        for (const [groupId, group] of groups) {
          const members = [...group.tabIds].map((id) => tabMap.get(id)).filter(Boolean);
          if (members.length < 2) continue;

          const positions = [];
          for (const tab of members) {
            const wrapper = getTabWrapper(tab.id);
            if (wrapper) {
              const pos = wrapper.closest(".tab-position");
              if (pos) positions.push({ tab, pos, wrapper });
            }
          }
          if (positions.length < 2) continue;

          // Sort by DOM order
          const allPositions = [...tabStrip.querySelectorAll(":scope > span > .tab-position")];
          positions.sort((a, b) => allPositions.indexOf(a.pos) - allPositions.indexOf(b.pos));

          // Check contiguous
          const indices = positions.map((p) => allPositions.indexOf(p.pos));
          const isContiguous = indices.every((idx, i) => i === 0 || idx === indices[i - 1] + 1);
          if (!isContiguous) continue;

          // Apply classes
          positions.forEach((item, i) => {
            const { tab, pos } = item;
            pos.classList.add(CONN_CLASS);
            pos.setAttribute("data-if-tiled-group", groupId);

            const posClass = positions.length === 2
              ? (i === 0 ? "if-tiled-first" : "if-tiled-last")
              : (i === 0 ? "if-tiled-first" : i === positions.length - 1 ? "if-tiled-last" : "if-tiled-middle");
            pos.classList.add(posClass);

            if (tab.active) pos.classList.add(ACTIVE_CLASS);
          });

          // Inject container background into first tab-position
          const firstPos = positions[0].pos;
          const firstRect = firstPos.getBoundingClientRect();
          const lastRect = positions[positions.length - 1].pos.getBoundingClientRect();
          const isVert = isVerticalTabBar();

          const bgEl = document.createElement("div");
          bgEl.className = BG_CLASS;
          if (isVert) {
            bgEl.style.setProperty("--if-tiled-total-h", (lastRect.bottom - firstRect.top) + "px");
          } else {
            bgEl.style.setProperty("--if-tiled-total-w", (lastRect.right - firstRect.left) + "px");
          }
          firstPos.appendChild(bgEl);
        }
      } finally {
        skipObserver = false;
        rendering = false;
      }
    }

    function cleanupMergeIndicators() {
      document.querySelectorAll(`.${BG_CLASS}`).forEach((el) => el.remove());
      document.querySelectorAll(`.${CONN_CLASS}`).forEach((el) => {
        el.classList.remove(CONN_CLASS, ACTIVE_CLASS, ...POS_CLASSES);
        el.removeAttribute("data-if-tiled-group");
      });
    }

    let refreshing = false;

    async function refreshState() {
      if (refreshing) return;
      refreshing = true;
      try {
        const newGroups = await detectAllGroups();
        const hash = hashGroups(newGroups);
        if (hash !== lastHash) {
          currentGroups = newGroups;
          await fixMixedPinnedGroups(currentGroups);
          await renderMergeIndicators(currentGroups);
          lastHash = hash;
        }
      } finally {
        refreshing = false;
      }
    }

    function init() {
      if (!CONFIG.tiledTabIndicator.enabled) return;

      chrome.tabs.onCreated.addListener(refreshState);
      chrome.tabs.onRemoved.addListener(refreshState);
      chrome.tabs.onActivated.addListener(refreshState);
      chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
        if (changeInfo.vivExtData || changeInfo.pinned !== undefined) refreshState();
      });

      // Re-apply on DOM rebuild — skipObserver prevents our own DOM changes
      // from re-triggering; refreshing flag prevents concurrent refreshes
      const root = document.getElementById("browser") || document.body;
      new MutationObserver(() => {
        if (skipObserver || refreshing) return;
        const tabStrip = document.querySelector(".tab-strip");
        if (tabStrip) refreshState();
      }).observe(root, { childList: true, subtree: true });

      const webpageStack = document.getElementById("webpage-stack");
      if (webpageStack) {
        new MutationObserver(() => {
          if (skipObserver || refreshing) return;
          refreshState();
        }).observe(webpageStack, { childList: true, subtree: true });
      }

      setTimeout(refreshState, 500);
    }

    return { init };
  })();

  // ═══════════════════════════════════════════════════════════════════
  // Feature 2: Mouse Gesture Trail (right-click drag)
  // ═══════════════════════════════════════════════════════════════════
  //
  // Shows trail WHILE right mouse button is held and dragging.
  // Fades out on release. Uses capture phase to get events before
  // Vivaldi's gesture system.
  // ═══════════════════════════════════════════════════════════════════

  const GestureTrailFeature = (() => {
    const injectedTabIds = new Set();
    const INJECT_FLAG = "__ifGestureTrailInjected";

    function isScriptableUrl(url) {
      const s = String(url || "");
      if (!s) return false;
      if (
        s.startsWith("chrome://") || s.startsWith("vivaldi://") ||
        s.startsWith("chrome-extension://") || s.startsWith("devtools://") ||
        s === "about:blank" || s === "about:srcdoc" || s.startsWith("data:")
      ) return false;
      return true;
    }

    function injectGestureTrail(flag, config) {
      if (window[flag]) return;
      window[flag] = true;

      let canvas = null;
      let ctx = null;
      let points = [];
      let isDrawing = false;
      let animId = null;

      function ensureCanvas() {
        if (canvas) return;
        canvas = document.createElement("canvas");
        canvas.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:99999;";
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx = canvas.getContext("2d");
        document.documentElement.appendChild(canvas);
        window.addEventListener("resize", () => {
          if (canvas) { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
        });
      }

      function render() {
        if (!ctx || !canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (points.length >= 2) {
          ctx.strokeStyle = config.strokeColor;
          ctx.lineWidth = config.strokeWidth;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
          ctx.stroke();
        }
      }

      function loop() {
        if (!isDrawing) return;
        render();
        animId = requestAnimationFrame(loop);
      }

      function start(x, y) {
        ensureCanvas();
        points = [{ x, y }];
        isDrawing = true;
        canvas.style.opacity = "1";
        if (animId) cancelAnimationFrame(animId);
        animId = requestAnimationFrame(loop);
      }

      function move(x, y) {
        if (!isDrawing) return;
        points.push({ x, y });
        if (points.length > config.maxPoints) points = points.slice(-config.maxPoints);
      }

      function stop() {
        isDrawing = false;
        if (animId) { cancelAnimationFrame(animId); animId = null; }
        render(); // final render
        // Fade out
        if (canvas) {
          const t0 = performance.now();
          const dur = config.fadeDurationMs;
          (function fade(now) {
            const p = Math.min((now - t0) / dur, 1);
            canvas.style.opacity = String(1 - p);
            if (p < 1) requestAnimationFrame(fade);
            else { canvas.remove(); canvas = null; ctx = null; }
          })(t0);
        }
      }

      // Track mouse position continuously via polling.
      // Vivaldi's gesture system intercepts mousemove during right-click drag,
      // so event-based collection fails. Polling with rAF bypasses this.
      let pollAnimId = null;

      function pollPosition() {
        if (!isDrawing) return;
        move(lastX, lastY);
        pollAnimId = requestAnimationFrame(pollPosition);
      }

      let lastX = 0, lastY = 0;

      // High-priority mousemove captures actual coordinates when events fire
      document.addEventListener("mousemove", (e) => {
        lastX = e.clientX;
        lastY = e.clientY;
        if (isDrawing) move(e.clientX, e.clientY);
      }, true);

      document.addEventListener("mousedown", (e) => {
        if (e.button !== 2) return;
        lastX = e.clientX;
        lastY = e.clientY;
        start(e.clientX, e.clientY);
        // Start polling as fallback for Vivaldi gesture suppression
        pollAnimId = requestAnimationFrame(pollPosition);
      }, true);

      document.addEventListener("mouseup", (e) => {
        if (e.button !== 2 || !isDrawing) return;
        if (pollAnimId) { cancelAnimationFrame(pollAnimId); pollAnimId = null; }
        stop();
      }, true);

      document.addEventListener("contextmenu", () => {
        if (!isDrawing) return;
        if (pollAnimId) { cancelAnimationFrame(pollAnimId); pollAnimId = null; }
        stop();
      }, true);
    }

    async function ensureInjection(tabId) {
      if (tabId == null || tabId < 0) return;
      if (injectedTabIds.has(tabId)) return;
      const tab = await new Promise((resolve) =>
        chrome.tabs.get(tabId, (t) => resolve(chrome.runtime.lastError ? null : t))
      );
      if (!tab || !isScriptableUrl(tab.url || tab.pendingUrl)) return;
      try {
        await chrome.scripting.executeScript({
          target: { tabId },
          world: "MAIN",
          func: injectGestureTrail,
          args: [INJECT_FLAG, CONFIG.gestureTrail],
        });
        injectedTabIds.add(tabId);
      } catch (_) {}
    }

    function init() {
      if (!CONFIG.gestureTrail.enabled) return;
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs?.[0]) ensureInjection(tabs[0].id);
      });
      chrome.tabs.onActivated.addListener((info) => ensureInjection(info.tabId));
      chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
        if (changeInfo.status === "complete") { injectedTabIds.delete(tabId); ensureInjection(tabId); }
      });
      chrome.tabs.onRemoved.addListener((tabId) => injectedTabIds.delete(tabId));
    }

    return { init };
  })();

  // ═══════════════════════════════════════════════════════════════════
  // Feature 3: Drag-to-Split Avoidance Animation
  // ═══════════════════════════════════════════════════════════════════

  const DragAvoidanceFeature = (() => {
    let fakeOverlay = null;
    let isActive = false;

    function calculateDropSide(event, rect) {
      const { clientX, clientY } = event;
      const { width, height } = rect;
      const t = CONFIG.dragAvoidance.edgeThreshold;
      const edges = [
        { side: "left", dist: clientX - rect.left, limit: width * t },
        { side: "right", dist: rect.right - clientX, limit: width * t },
        { side: "top", dist: clientY - rect.top, limit: height * t },
        { side: "bottom", dist: rect.bottom - clientY, limit: height * t },
      ];
      let closest = null, minDist = Infinity;
      for (const edge of edges) {
        if (edge.dist < edge.limit && edge.dist < minDist) { minDist = edge.dist; closest = edge; }
      }
      return closest?.side || null;
    }

    function createFakeOverlay(side, rect) {
      removeFakeOverlay();
      fakeOverlay = document.createElement("div");
      fakeOverlay.className = "if-drag-avoidance-overlay";
      const { width, height } = rect;
      const halfW = width / 2, halfH = height / 2;
      const dur = CONFIG.dragAvoidance.animationDurationMs;
      const base = "position:absolute;pointer-events:none;z-index:99998;";
      switch (side) {
        case "left":
          fakeOverlay.style.cssText = `${base}top:0;left:0;width:${halfW}px;height:100%;background:linear-gradient(to right,rgba(100,150,255,0.15),transparent);border-right:2px solid rgba(100,150,255,0.4);animation:if-slide-in-left ${dur}ms ease-out;`; break;
        case "right":
          fakeOverlay.style.cssText = `${base}top:0;right:0;width:${halfW}px;height:100%;background:linear-gradient(to left,rgba(100,150,255,0.15),transparent);border-left:2px solid rgba(100,150,255,0.4);animation:if-slide-in-right ${dur}ms ease-out;`; break;
        case "top":
          fakeOverlay.style.cssText = `${base}top:0;left:0;width:100%;height:${halfH}px;background:linear-gradient(to bottom,rgba(100,150,255,0.15),transparent);border-bottom:2px solid rgba(100,150,255,0.4);animation:if-slide-in-top ${dur}ms ease-out;`; break;
        case "bottom":
          fakeOverlay.style.cssText = `${base}bottom:0;left:0;width:100%;height:${halfH}px;background:linear-gradient(to top,rgba(100,150,255,0.15),transparent);border-top:2px solid rgba(100,150,255,0.4);animation:if-slide-in-bottom ${dur}ms ease-out;`; break;
      }
      const webpageStack = document.getElementById("webpage-stack");
      if (webpageStack) {
        webpageStack.style.position = "relative";
        webpageStack.appendChild(fakeOverlay);
      }
    }

    function removeFakeOverlay() {
      if (fakeOverlay) { fakeOverlay.remove(); fakeOverlay = null; }
    }

    function isTabDragging() {
      return (
        document.querySelector(".tab-position.dragging") !== null ||
        document.querySelector(".tab-position.is-dragging") !== null ||
        document.querySelector("#drag-image") !== null
      );
    }

    function init() {
      if (!CONFIG.dragAvoidance.enabled) return;
      const webpageStack = document.getElementById("webpage-stack");
      if (!webpageStack) return;
      let lastSide = null;

      webpageStack.addEventListener("dragover", (e) => {
        if (!isTabDragging()) {
          if (isActive) { removeFakeOverlay(); isActive = false; }
          return;
        }
        const rect = webpageStack.getBoundingClientRect();
        const side = calculateDropSide(e, rect);
        if (side) {
          if (side !== lastSide) { createFakeOverlay(side, rect); lastSide = side; isActive = true; }
        } else {
          removeFakeOverlay(); lastSide = null; isActive = false;
        }
      });
      webpageStack.addEventListener("dragleave", () => { removeFakeOverlay(); lastSide = null; isActive = false; });
      webpageStack.addEventListener("drop", () => { removeFakeOverlay(); lastSide = null; isActive = false; });
      document.addEventListener("dragend", () => { removeFakeOverlay(); lastSide = null; isActive = false; });
    }

    return { init };
  })();

  // ═══════════════════════════════════════════════════════════════════
  // Feature 4: Auto-Hide Tabbar Pulse
  // ═══════════════════════════════════════════════════════════════════

  const AutoHidePulseFeature = (() => {
    let lastPulseTime = 0;

    function triggerPulse() {
      if (!CONFIG.autoHidePulse.enabled) return;
      if (window.__arcPeekOpening) return;
      const now = Date.now();
      if (now - lastPulseTime < CONFIG.autoHidePulse.cooldownMs) return;
      const wrapper = document.querySelector(".auto-hide-wrapper.has-tabbar");
      if (!wrapper || wrapper.matches(":hover")) return;
      lastPulseTime = now;
      wrapper.classList.add("show");
      setTimeout(() => wrapper.classList.remove("show"), CONFIG.autoHidePulse.showDurationMs);
    }

    function init() {
      if (!CONFIG.autoHidePulse.enabled) return;
      chrome.tabs.onCreated.addListener(triggerPulse);
      chrome.tabs.onRemoved.addListener(triggerPulse);
      chrome.tabs.onActivated.addListener(triggerPulse);
      chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
        if (changeInfo.pinned !== undefined) triggerPulse();
      });
    }

    return { init };
  })();

  // ═══════════════════════════════════════════════════════════════════
  // Init
  // ═══════════════════════════════════════════════════════════════════

  function init() {
    console.log(LOG, "Initializing");
    TiledFeature.init();
    GestureTrailFeature.init();
    DragAvoidanceFeature.init();
    AutoHidePulseFeature.init();
    console.log(LOG, "Ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
