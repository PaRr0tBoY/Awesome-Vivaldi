// ==UserScript==
// @name         SplitScreen Tab Connector
// @description  Flawless stack sync for split-screen tabs
// @version      22
// @author       wyrtensi
// ==UserScript==
(function () {
  "use strict";
  const TAG = "[SplitConn]";

  const PALETTE = [
    { h: 220, s: 72, l: 58 }, { h: 155, s: 58, l: 45 },
    { h: 275, s: 55, l: 60 }, { h: 25, s: 78, l: 50 },
    { h: 345, s: 62, l: 55 }, { h: 185, s: 58, l: 42 },
  ];
  function colorIndex(ids) {
    const k = [...ids].sort().join(",");
    let h = 0;
    for (let i = 0; i < k.length; i++) h = ((h << 5) - h + k.charCodeAt(i)) | 0;
    return Math.abs(h) % PALETTE.length;
  }

  /* ═══ State ═══ */
  let groups = []; // { ids: Set }
  let lastGroupHash = "";
  let skipVisualObs = false;
  let moveBlockUntil = 0;
  let activeMoveId = null;

  let stateTimer = null;
  let visualTimer = null;
  let snapTimer = null;
  let visualUpdateSeq = 0;

  /* ═══ API helpers ═══ */
  const queryTabs = () => new Promise(r => chrome.tabs.query({ currentWindow: true }, t => r(chrome.runtime.lastError ? [] : t)));

  function parseExt(tab) {
    if (!tab || !tab.vivExtData) return {};
    try { return typeof tab.vivExtData === "string" ? JSON.parse(tab.vivExtData) : tab.vivExtData; }
    catch (_) { return {}; }
  }

  function buildVisualMap(allTabs) {
    const map = new Map();
    const add = (id, el) => {
      if (!map.has(id)) map.set(id, new Set());
      map.get(id).add(el);
    };

    const tps = document.querySelectorAll(".tab-position");
    tps.forEach(tp => {
      // Ignore ghost/drag tabs so the bridge doesn't stretch or leave traces
      if (tp.classList.contains("dragging") || tp.classList.contains("is-dragging") || tp.closest("#drag-image")) return;

      const w = tp.querySelector(".tab-wrapper[data-id]");
      if (!w) return;
      const raw = w.getAttribute("data-id")?.replace("tab-", "")?.replace("group-", "")?.replace("page-", "");
      if (!raw) return;

      const isTop = !tp.closest("#tabs-subcontainer");
      const numMatch = /^\d+$/.test(raw);

      if (numMatch) {
        const tab = allTabs.find(t => String(t.id) === raw);
        if (!tab) return;
        if (isTop) {
          const grp = parseExt(tab).group;
          if (grp) {
            allTabs.filter(t => parseExt(t).group === grp).forEach(t => add(String(t.id), tp));
          } else {
            add(raw, tp);
          }
        } else {
          // Sub-level tab
          add(raw, tp);
        }
      } else {
        if (isTop) {
          const stackTabs = allTabs.filter(t => parseExt(t).group === raw);
          stackTabs.forEach(t => add(String(t.id), tp));
        }
      }
    });
    return map;
  }

  /* ═══ Group detection ═══ */
  function detectGroups() {
    const stack = document.getElementById("webpage-stack");
    if (!stack) return [];

    const res = [];
    stack.querySelectorAll(":scope > .tiled").forEach(c => {
      const views = c.querySelectorAll(".webpageview[data-id]");
      if (views.length < 2) return;
      const ids = new Set();
      views.forEach(v => ids.add(v.getAttribute("data-id")?.replace("page-", "")?.replace("tab-", "")));
      res.push({ ids, colorIdx: colorIndex(ids) });
    });

    // Dedup colors
    const used = new Set();
    for (const g of res) {
      while (used.has(g.colorIdx)) g.colorIdx = (g.colorIdx + 1) % PALETTE.length;
      used.add(g.colorIdx);
    }
    return res;
  }

  function hashGroups(gs) {
    return gs.map(g => [...g.ids].sort().join(",")).sort().join("|");
  }

  /* ═══ Snap Logic (The Brain) ═══ */
  // Breaks tabs into rigid "Blocks" (either a single standalone tab, or a whole Stack of tabs)
  function getBlocks(allTabs, tilingIdsSet) {
    const blocksMap = new Map();
    const standalone = [];

    for (const t of allTabs) {
      const id = String(t.id);
      const isTiled = tilingIdsSet.has(id);
      const grp = parseExt(t).group;

      if (grp) {
        if (!blocksMap.has(grp)) blocksMap.set(grp, { id: grp, isStack: true, tabs: [], tCount: 0 });
        blocksMap.get(grp).tabs.push(t);
        if (isTiled) blocksMap.get(grp).tCount++;
      } else if (isTiled) {
        standalone.push({ id, isStack: false, tabs: [t], min: t.index, max: t.index });
      }
    }

    const blocks = [...standalone];
    for (const b of blocksMap.values()) {
      if (b.tCount > 0) { // Include the stack block if at least one tab is in this split screen
        b.tabs.sort((a, b) => a.index - b.index);
        b.min = b.tabs[0].index;
        b.max = b.tabs[b.tabs.length - 1].index;
        blocks.push(b);
      }
    }
    blocks.sort((a, b) => a.min - b.min);
    return blocks;
  }

  function isContiguous(blocks) {
    if (blocks.length <= 1) return true;
    for (let i = 1; i < blocks.length; i++) {
      if (blocks[i].min - blocks[i - 1].max !== 1) return false;
    }
    return true;
  }

  async function executeSnap() {
    let allTabs = await queryTabs();
    let madeMoves = false;

    for (const g of groups) {
      let blocks = getBlocks(allTabs, g.ids);
      if (blocks.length < 2) continue;
      if (isContiguous(blocks)) continue;

      // Find anchor block based on recent dragging
      let anchor = blocks[0];
      if (activeMoveId) {
        const trg = blocks.find(b => b.tabs.some(t => String(t.id) === String(activeMoveId)));
        if (trg) anchor = trg;
      }

      // Vacuum blocks toward the anchor iteratively until perfectly contiguous
      for (let loop = 0; loop < blocks.length; loop++) {
        blocks = getBlocks(allTabs, g.ids);
        if (isContiguous(blocks)) break;

        anchor = blocks.find(b => b.id === anchor.id) || blocks[0];
        const aIdx = blocks.indexOf(anchor);
        let snapped = false;

        // Try absorbing leftwards (pulling right-side blocks towards center)
        for (let i = aIdx; i < blocks.length - 1; i++) {
          const l = blocks[i], r = blocks[i + 1];
          if (r.min - l.max > 1) { // Large gap exists!
            const tIdx = l.max + 1; // Insert R immediately after L
            const ids = r.tabs.map(t => t.id);
            moveBlockUntil = Date.now() + 1000;
            await new Promise(res => chrome.tabs.move(ids, { index: tIdx }, res));
            snapped = true; break;
          }
        }
        if (snapped) { allTabs = await queryTabs(); madeMoves = true; continue; }

        // Try absorbing rightwards (pulling left-side blocks towards center)
        for (let i = aIdx; i > 0; i--) {
          const r = blocks[i], l = blocks[i - 1];
          if (r.min - l.max > 1) { // Large gap exists!
            const tIdx = r.min - l.tabs.length; // Insert L immediately before R
            const ids = l.tabs.map(t => t.id);
            moveBlockUntil = Date.now() + 1000;
            await new Promise(res => chrome.tabs.move(ids, { index: tIdx }, res));
            snapped = true; break;
          }
        }
        if (snapped) { allTabs = await queryTabs(); madeMoves = true; }
      }
    }

    if (madeMoves) setTimeout(() => scheduleState(50), 300);
  }

  function scheduleSnap(delay) {
    clearTimeout(snapTimer);
    snapTimer = setTimeout(executeSnap, delay);
  }

  /* ═══ State refresh ═══ */
  async function refreshState() {
    const newGroups = detectGroups();
    const hash = hashGroups(newGroups);
    if (hash !== lastGroupHash) {
      lastGroupHash = hash;
      groups = newGroups;
    }

    scheduleVisuals(20);
    if (groups.length > 0) scheduleSnap(400); // 400ms debounce allows dragging UI to settle
  }

  function scheduleState(delay) {
    clearTimeout(stateTimer);
    stateTimer = setTimeout(refreshState, delay || 200);
  }

  /* ═══ Visual update ═══ */
  function scheduleVisuals(delay) {
    clearTimeout(visualTimer);
    visualTimer = setTimeout(updateVisuals, delay || 16);
  }

  async function updateVisuals() {
    const seq = ++visualUpdateSeq;
    skipVisualObs = true;

    if (groups.length === 0) {
      // Reset styles
      document.querySelectorAll(".tab-position.is-tiled-connector").forEach(el => {
        el.classList.remove("is-tiled-connector", "is-tiled-active", "tiled-left", "tiled-middle", "tiled-right", "tiled-solo");
      });
      document.querySelectorAll(".tiled-bridge-overlay").forEach(el => el.remove());
      setTimeout(() => { skipVisualObs = false; }, 60); 
      return; 
    }

    const allTabs = await queryTabs();
    if (seq !== visualUpdateSeq) return; // Prevent async race condition leaving orphan traces

    // Synchronous cleanup immediately before redraw eliminates flicker and race conditions
    document.querySelectorAll(".tab-position.is-tiled-connector").forEach(el => {
      el.classList.remove("is-tiled-connector", "is-tiled-active", "tiled-left", "tiled-middle", "tiled-right", "tiled-solo");
    });
    document.querySelectorAll(".tiled-bridge-overlay").forEach(el => el.remove());

    const activeApi = allTabs.find(t => t.active);
    const activeId = activeApi ? String(activeApi.id) : null;

    const visualMap = buildVisualMap(allTabs);

    for (const g of groups) {
      const pal = PALETTE[g.colorIdx];
      const isActive = activeId && g.ids.has(activeId);

      const matchedTop = new Set();
      const matchedSub = new Set();
      for (const id of g.ids) {
        const els = visualMap.get(id);
        if (els) {
          els.forEach(el => {
            if (el.closest("#tabs-subcontainer")) matchedSub.add(el);
            else matchedTop.add(el);
          });
        }
      }

      function applyToPlane(matchedSet) {
        if (matchedSet.size < 1) return;
        const els = [...matchedSet];
        const parent = els[0].closest(".tab-strip");
        if (!parent) return;

        let allTps = [...parent.querySelectorAll(":scope > span > .tab-position, :scope > .tab-position")];
        if (allTps.length === 0) allTps = [...parent.querySelectorAll(".tab-position")]; // fallback

        const matched = els.map(el => ({ el, idx: allTps.indexOf(el) })).filter(m => m.idx > -1);
        matched.sort((a, b) => a.idx - b.idx);

        let adjacent = matched.length >= 2;
        for (let i = 1; i < matched.length; i++) {
          if (matched[i].idx - matched[i - 1].idx !== 1) { adjacent = false; break; }
        }

        matched.forEach((m, i) => {
          m.el.classList.add("is-tiled-connector");
          if (isActive) m.el.classList.add("is-tiled-active");

          if (adjacent) {
            if (i === 0) m.el.classList.add("tiled-left");
            else if (i === matched.length - 1) m.el.classList.add("tiled-right");
            else m.el.classList.add("tiled-middle");
          } else {
            m.el.classList.add("tiled-solo");
          }
          m.el.style.setProperty("--tg-h", String(pal.h));
          m.el.style.setProperty("--tg-s", pal.s + "%");
          m.el.style.setProperty("--tg-l", pal.l + "%");
          m.el.style.setProperty("--tg-active", isActive ? "1" : "0.35");
        });

        console.log(TAG, "applyToPlane adjacent:", adjacent, "matched:", matched.map(m => m.idx));

        if (adjacent) drawBridge(matched.map(m => m.el), pal, isActive);
      }

      applyToPlane(matchedTop);
      applyToPlane(matchedSub);
    }
    setTimeout(() => { skipVisualObs = false; }, 60);
  }

  function drawBridge(els, pal, isActive) {
    if (!els || els.length === 0) return;
    const strip = els[0].closest(".tab-strip");
    if (!strip) return;

    const br = strip.getBoundingClientRect();
    const rs = els.map(e => {
      const tabNode = e.querySelector('.tab') || e;
      return { node: tabNode, rect: tabNode.getBoundingClientRect() };
    }).filter(r => r.rect.width > 0 && r.rect.height > 0);
    if (rs.length === 0) return;

    // Find the top-most row to ensure the bridge doesn't stretch over empty space for pinned/small tabs
    const minTop = Math.min(...rs.map(r => r.rect.top));
    const topRow = rs.filter(r => Math.abs(r.rect.top - minTop) <= 5).sort((a, b) => a.rect.left - b.rect.left);

    // Read corner radii dynamically from edge tabs in the top row
    const rTL = getComputedStyle(topRow[0].node).borderTopLeftRadius;
    const rTR = getComputedStyle(topRow[topRow.length - 1].node).borderTopRightRadius;

    const l = topRow[0].rect.left - br.left + strip.scrollLeft;
    const t = minTop - br.top + strip.scrollTop;
    const w = topRow[topRow.length - 1].rect.right - topRow[0].rect.left;
    const h = Math.max(...topRow.map(r => r.rect.height));
    if (w <= 0) return;

    const el = document.createElement("div");
    el.className = "tiled-bridge-overlay";
    el.style.cssText = `position:absolute;pointer-events:none;z-index:100;left:${l}px;top:${t}px;width:${w}px;height:${h}px;box-shadow:inset 0 3px 0 0 hsla(${pal.h},${pal.s}%,${pal.l}%,${isActive ? 1 : 0.45});border-radius:${rTL} ${rTR} 0 0;`;
    if (getComputedStyle(strip).position === "static") strip.style.position = "relative";
    strip.appendChild(el);
  }

  /* ═══ Init ═══ */
  function init() {
    if (!document.getElementById("browser")) { setTimeout(init, 300); return; }
    console.log(TAG, "v22 init");

    const ws = document.getElementById("webpage-stack");
    if (ws) new MutationObserver(() => scheduleState(200)).observe(ws, { childList: true, subtree: true });

    const tc = document.getElementById("tabs-container");
    if (tc) {
      const strip = tc.querySelector(".tab-strip");
      if (strip) new MutationObserver(() => { if (!skipVisualObs && groups.length > 0) scheduleVisuals(40); }).observe(strip, { childList: true, subtree: true, attributes: true, attributeFilter: ["style"] });
    }

    const tb = document.getElementById("tabs-tabbar-container");
    if (tb) new ResizeObserver(() => { if (groups.length > 0) scheduleVisuals(40); }).observe(tb);
    window.addEventListener("resize", () => { if (groups.length > 0) scheduleVisuals(40); }, { passive: true });

    try {
      chrome.tabs.onRemoved.addListener(() => scheduleState(200));
      chrome.tabs.onActivated.addListener(() => scheduleState(100));
      chrome.tabs.onUpdated.addListener(tId => { if (groups.some(g => g.ids.has(String(tId)))) scheduleState(200); });
      chrome.tabs.onMoved.addListener((tId) => {
        if (Date.now() < moveBlockUntil) return;
        activeMoveId = tId;
        if (groups.length > 0) { scheduleState(100); scheduleSnap(500); }
      });
    } catch (_) { }

    scheduleState(100);
  }

  setTimeout(init, 500);
})();
