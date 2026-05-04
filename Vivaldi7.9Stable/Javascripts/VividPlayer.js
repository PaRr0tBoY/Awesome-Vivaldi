// ==UserScript==
// @name         VividPlayer
// @description  Sidebar bottom media controller inspired by Zen Browser.
// @version      2026.5.4.1
// @author       Codex
// ==/UserScript==

(() => {
  'use strict';

  const VIVID_PLAYER_CONFIG = {
    theme: 'theme', // 'theme' | 'classic'
    compactMinWidth: 150,
    hideAnimationMs: 260,
    stackTransitionMs: 320,
    backCardTransitionMs: 420,
    stackGap: 6,
    stackCollapsedOffset1: 7,
    stackCollapsedOffset2: 13,
    stackCollapsedInset1: 3,
    stackCollapsedInset2: 6,
    noteSpawnMinMs: 540,
    noteSpawnMaxMs: 980,
    noteMaxConcurrent: 2,
    autoPipOnSwitch: true,   // 切换标签页时自动对上一个 tab 触发 PiP
    minMediaDurationSec: 8,  // 总时长低于此值视为非主要内容（UI音效/广告片段）
    minVideoArea: 30000,     // 视频面积低于此值视为装饰性（头像/图标/广告条）
  };

  const MESSAGE_TYPE = 'vivid-player';
  const ROOT_ID = 'vivid-player';
  const INJECT_MAIN_FLAG = '__vividPlayerMainInjected';
  const INJECT_BRIDGE_FLAG = '__vividPlayerBridgeInjected';
  const NOTE_CHARS = ['♪', '♫', '♩', '♬'];
  const stateByTabId = new Map();
  const injectedTabIds = new Set();

  const state = {
    currentWindowId: null,
    activeTabId: null,
    mountedContainer: null,
    root: null,
    // 多卡片 slots（最多3个），每个包含该 card 的全部 DOM refs
    cardSlots: [],
    // 当前最多3个活跃音频源的 tabId 数组（index 0 为最新）
    activeSources: [],
    // 向后兼容：指向 cardSlots[0] 的 DOM refs
    titleEl: null,
    subtitleEl: null,
    currentTimeEl: null,
    durationEl: null,
    progressEl: null,
    playPauseButton: null,
    muteButton: null,
    pipButton: null,
    focusButton: null,
    focusIconEl: null,
    closeButton: null,
    prevButton: null,
    nextButton: null,
    currentSourceTabId: null,
    clearSourceTimer: null,
    mountObserver: null,
    containerResizeObserver: null,
    hideTimer: null,
    disposeListeners: [],
    suppressSync: false,
    noteTimer: null,
    noteNodes: new Set(),
    isHovered: false,   // true while mouse is over the stack → block note animation restart
    stackLayoutRaf: null,
    stackExpanded: false,
    stackAnimations: [],
    stackTransitionTimer: null,
    stackTransitioning: false,
    syncUiRaf: null,
  };

  const transportDebugState = {
    recentEvents: [],
    maxRecentEvents: 20,
  };

  const icons = {
    focus:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6h5v2H8v3H6V6Zm7 0h5v5h-2V8h-3V6ZM6 13h2v3h3v2H6v-5Zm10 0h2v5h-5v-2h3v-3Z"/></svg>',
    close:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7.41 6 4.59 4.59L16.59 6 18 7.41 13.41 12 18 16.59 16.59 18 12 13.41 7.41 18 6 16.59 10.59 12 6 7.41 7.41 6Z"/></svg>',
    play:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.14v13.72L19 12 8 5.14Z"/></svg>',
    pause:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7V5Zm6 0h4v14h-4V5Z"/></svg>',
    mute:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5.23v2.06c2.89.86 5 3.54 5 6.71 0 3.17-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77ZM3.27 2 2 3.27l4.73 4.73H3v8h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.96 8.96 0 0 0 3.66-1.8L20.73 22 22 20.73 12 10.73 3.27 2ZM12 4 9.91 6.09 12 8.18V4Z"/></svg>',
    unmute:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3c0-1.77-1-3.29-2.5-4.03v8.05A4.47 4.47 0 0 0 16.5 12Zm-2.5-9.77v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77Z"/></svg>',
    pip:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 7H5v10h14V7Zm0-2c1.11 0 2 .89 2 2v10c0 1.11-.89 2-2 2H5c-1.11 0-2-.89-2-2V7c0-1.11.89-2 2-2h14Zm-1 7h-6v4h6v-4Z"/></svg>',
    prev:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6h2v12H6V6Zm3.5 6L18 18V6l-8.5 6Z"/></svg>',
    next:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 6h2v12h-2V6Zm-1.5 6L6 18V6l8.5 6Z"/></svg>',
  };

  // ─── 基础工具 ───────────────────────────────────────────────────────────────

  function callApi(fn, ...args) {
    return new Promise((resolve, reject) => {
      try {
        fn(...args, (result) => {
          const error = chrome.runtime && chrome.runtime.lastError;
          if (error) { reject(error); return; }
          resolve(result);
        });
      } catch (error) { reject(error); }
    });
  }

  function pushTransportDebug(event, payload = {}) {
    const entry = { stamp: new Date().toISOString(), event, payload };
    transportDebugState.recentEvents.push(entry);
    if (transportDebugState.recentEvents.length > transportDebugState.maxRecentEvents) {
      transportDebugState.recentEvents.shift();
    }
    window.__vividPlayerTransportDebug = { recentEvents: transportDebugState.recentEvents.slice() };
    console.log('[VividPlayer transport]', event, payload);
  }

  async function getCurrentWindowId() {
    if (!vivaldi?.windowPrivate?.getCurrentId) return window.vivaldiWindowId ?? null;
    try {
      return await vivaldi.windowPrivate.getCurrentId();
    } catch (_error) {
      try {
        return await callApi(vivaldi.windowPrivate.getCurrentId.bind(vivaldi.windowPrivate));
      } catch (__error) { return window.vivaldiWindowId ?? null; }
    }
  }

  async function getTab(tabId) {
    try { return await chrome.tabs.get(tabId); }
    catch (_error) {
      try { return await callApi(chrome.tabs.get.bind(chrome.tabs), tabId); }
      catch (__error) { return null; }
    }
  }

  async function getTabsInCurrentWindow() {
    try { return await chrome.tabs.query({ windowId: state.currentWindowId }); }
    catch (_error) {
      try { return await callApi(chrome.tabs.query.bind(chrome.tabs), { windowId: state.currentWindowId }); }
      catch (__error) { return []; }
    }
  }

  async function getTabPrivate(tabId) {
    if (!vivaldi?.tabsPrivate?.get) return {};
    try { return (await vivaldi.tabsPrivate.get(tabId)) || {}; }
    catch (_error) {
      try { return (await callApi(vivaldi.tabsPrivate.get.bind(vivaldi.tabsPrivate), tabId)) || {}; }
      catch (__error) { return {}; }
    }
  }

  function getTabState(tabId) {
    if (!stateByTabId.has(tabId)) {
      stateByTabId.set(tabId, {
        tabId, windowId: null, title: '', url: '', favIconUrl: '',
        audible: false, active: false, discarded: false,
        alertStates: new Set(), lastMediaAt: 0, suppressed: false,
        awaitingQuietAfterSuppress: false, pendingPip: false,
        metadata: null, frameId: 0, canPip: false, pictureInPicture: false,
        hasAudibleMedia: false, mediaSessionActive: false, ended: false,
      });
    }
    return stateByTabId.get(tabId);
  }

  function isVerticalTabsMode() {
    const browser = document.getElementById('browser');
    return !!browser && (browser.classList.contains('tabs-left') || browser.classList.contains('tabs-right'));
  }

  function createButton(className, label, iconMarkup) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'vivid-player-button ' + className;
    button.setAttribute('aria-label', label);
    button.innerHTML = iconMarkup;
    return button;
  }

  function updateCompactMode() {
    if (!state.root || !state.mountedContainer) return;
    const width = state.mountedContainer.clientWidth || 0;
    state.root.dataset.compact = width > 0 && width < VIVID_PLAYER_CONFIG.compactMinWidth ? 'true' : 'false';
  }

  function scheduleHiddenState() {
    if (!state.root) return;
    if (state.hideTimer) { clearTimeout(state.hideTimer); state.hideTimer = null; }
    state.root.classList.add('vivid-player-leaving');
    state.hideTimer = setTimeout(() => {
      state.hideTimer = null;
      if (!state.root) return;
      state.root.hidden = true;
      state.root.setAttribute('aria-hidden', 'true');
      state.root.classList.add('vivid-player-hidden');
      state.root.classList.remove('vivid-player-visible', 'vivid-player-leaving');
    }, VIVID_PLAYER_CONFIG.hideAnimationMs);
  }

  // ─── 叠卡 CSS 注入 ────────────────────────────────────────────────────────

  function ensureStackStyles() {
    const STYLE_ID = 'vivid-player-stack-styles';
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .vivid-player-stack {
        position: relative;
        isolation: isolate;
        overflow: visible !important;
      }
      .vivid-player-stack-hover-hitbox {
        position: absolute;
        top: -20px;
        left: -8px;
        right: -8px;
        bottom: -10px;
        z-index: 0;
        background: transparent;
      }
      .vivid-player-card {
        overflow: visible !important;
      }
      .vivid-player-card[data-slot="1"],
      .vivid-player-card[data-slot="2"] {
        transition:
          transform ${VIVID_PLAYER_CONFIG.backCardTransitionMs}px cubic-bezier(0.22, 1, 0.36, 1),
          left ${VIVID_PLAYER_CONFIG.backCardTransitionMs}px cubic-bezier(0.22, 1, 0.36, 1),
          right ${VIVID_PLAYER_CONFIG.backCardTransitionMs}px cubic-bezier(0.22, 1, 0.36, 1),
          opacity ${VIVID_PLAYER_CONFIG.backCardTransitionMs}px cubic-bezier(0.22, 1, 0.36, 1) !important;
      }
      .vivid-player-measure-card,
      .vivid-player-measure-card * {
        animation: none !important;
        transition: none !important;
      }
      .vivid-player-card[data-slot="0"] {
        position: relative;
        z-index: 3;
        overflow: visible !important;
      }
      .vivid-player-note-layer {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        overflow: visible;
        z-index: 20;
      }
      /* 音符 keyframe */
      @keyframes vivid-note-float {
        0%   { opacity: 0;   transform: translateY(0)     rotate(var(--note-rot, 0deg)) scale(1); }
        15%  { opacity: 0.85; }
        100% { opacity: 0;   transform: translateY(-22px) rotate(var(--note-rot, 0deg)) scale(0.7); }
      }
      .vivid-player-note-dynamic {
        position: absolute;
        pointer-events: none;
        font-size: var(--note-size, 13px);
        color: var(--colorAccentFg, currentColor);
        opacity: 0;
        animation: vivid-note-float var(--note-dur, 1.4s) ease-out forwards;
        will-change: transform, opacity;
        user-select: none;
      }
    `;
    document.head.appendChild(style);
  }

  // ─── 单个 Card Slot 创建 ──────────────────────────────────────────────────

  /**
   * 创建一个完整的 card slot，返回包含所有 DOM refs 和当前绑定 tabId 的对象。
   * 每个 slot 的按钮事件处理器通过闭包引用 refs.tabId，无需外部传入。
   */
  function createCardSlot(slotIndex) {
    const card = document.createElement('div');
    card.className = 'vivid-player-card';
    card.dataset.slot = String(slotIndex);
    card.style.display = 'none';

    card.innerHTML =
      '<div class="vivid-player-hover-row vivid-player-top-row">' +
        '<div class="vivid-player-text">' +
          '<div class="vivid-player-title" title=""></div>' +
          '<div class="vivid-player-subtitle" title=""></div>' +
        '</div>' +
        '<div class="vivid-player-endcaps"></div>' +
      '</div>' +
      '<div class="vivid-player-hover-row vivid-player-progress-row">' +
        '<span class="vivid-player-time vivid-player-current-time">0:00</span>' +
        '<input class="vivid-player-progress" type="range" min="0" max="100" step="0.1" value="0" disabled tabindex="-1" />' +
        '<span class="vivid-player-time vivid-player-duration">0:00</span>' +
      '</div>' +
      '<div class="vivid-player-controls-row">' +
        '<div class="vivid-player-left-controls"></div>' +
        '<div class="vivid-player-center-controls"></div>' +
        '<div class="vivid-player-right-controls"></div>' +
      '</div>';

    const endcaps = card.querySelector('.vivid-player-endcaps');
    const leftControls = card.querySelector('.vivid-player-left-controls');
    const centerControls = card.querySelector('.vivid-player-center-controls');
    const rightControls = card.querySelector('.vivid-player-right-controls');

    const focusButton = createButton('vivid-player-focus', 'Focus source tab', icons.focus);
    const prevButton = createButton('vivid-player-prev', 'Previous track', icons.prev);
    const playPauseButton = createButton('vivid-player-playpause', 'Play or pause', icons.play);
    const nextButton = createButton('vivid-player-next', 'Next track', icons.next);
    const muteButton = createButton('vivid-player-mute', 'Mute or unmute', icons.unmute);
    const pipButton = createButton('vivid-player-pip', 'Toggle picture in picture', icons.pip);
    const closeButton = createButton('vivid-player-close', 'Pause and hide', icons.close);

    leftControls.append(focusButton);
    centerControls.append(prevButton, playPauseButton, nextButton);
    rightControls.append(muteButton);
    endcaps.append(pipButton, closeButton);

    const refs = {
      card,
      titleEl: card.querySelector('.vivid-player-title'),
      subtitleEl: card.querySelector('.vivid-player-subtitle'),
      currentTimeEl: card.querySelector('.vivid-player-current-time'),
      durationEl: card.querySelector('.vivid-player-duration'),
      progressEl: card.querySelector('.vivid-player-progress'),
      playPauseButton, muteButton, pipButton,
      focusButton, closeButton, prevButton, nextButton,
      focusIconEl: focusButton.querySelector('svg'),
      tabId: null,       // 当前绑定的 tabId，由 syncUi 写入
      suppressSync: false,
    };

    // ── 按钮事件处理（通过闭包引用 refs.tabId，无需外部注入） ──

    focusButton.addEventListener('click', () => {
      if (!refs.tabId) return;
      const source = stateByTabId.get(refs.tabId);
      if (!source) return;
      chrome.tabs.update(source.tabId, { active: true }).catch(() => {});
      sendCommand(source.tabId, source.frameId, { action: 'scroll-into-view', frameId: source.frameId });
    });

    playPauseButton.addEventListener('click', () => {
      if (!refs.tabId) return;
      const source = stateByTabId.get(refs.tabId);
      if (!source) return;
      const action = source.metadata?.paused ? 'play' : 'pause';
      sendCommand(source.tabId, source.frameId, { action });
    });

    muteButton.addEventListener('click', () => {
      if (!refs.tabId) return;
      const source = stateByTabId.get(refs.tabId);
      if (!source) return;
      sendCommand(source.tabId, source.frameId, { action: 'muted' });
    });

    pipButton.addEventListener('click', () => {
      if (!refs.tabId) return;
      const source = stateByTabId.get(refs.tabId);
      if (!source) return;
      sendCommand(source.tabId, source.frameId, { action: 'picture-in-picture' });
    });

    closeButton.addEventListener('click', () => {
      if (!refs.tabId) return;
      const source = stateByTabId.get(refs.tabId);
      if (!source) return;
      markSourceSuppressed(source, true);
      sendCommand(source.tabId, source.frameId, { action: 'close' });
      chooseCandidateSource();
    });

    prevButton.addEventListener('click', () => {
      if (!refs.tabId) return;
      const source = stateByTabId.get(refs.tabId);
      if (!source) return;
      pushTransportDebug('ui-click', { action: 'previous-track', tabId: refs.tabId });
      sendCommand(source.tabId, source.frameId, { action: 'previous-track' });
    });

    nextButton.addEventListener('click', () => {
      if (!refs.tabId) return;
      const source = stateByTabId.get(refs.tabId);
      if (!source) return;
      pushTransportDebug('ui-click', { action: 'next-track', tabId: refs.tabId });
      sendCommand(source.tabId, source.frameId, { action: 'next-track' });
    });

    return refs;
  }

  // ─── Root 创建 ────────────────────────────────────────────────────────────

  function createRoot() {
    ensureStackStyles();

    const root = document.createElement('div');
    root.id = ROOT_ID;
    root.hidden = true;
    root.setAttribute('aria-hidden', 'true');

    const stack = document.createElement('div');
    stack.className = 'vivid-player-stack';

    // DOM 顺序：slot=2（最底层，z-index 最低），slot=1，slot=0（主卡，z-index 最高）
    // 这样在 stacking context 内，slot=0 会遮住 slot=1/2
    for (let i = 2; i >= 0; i--) {
      const refs = createCardSlot(i);
      state.cardSlots[i] = refs;
      stack.appendChild(refs.card);
    }
    root.appendChild(stack);

    // 音符层挂在 stack 上，覆盖主卡（card[slot=0]）区域
    const hoverHitbox = document.createElement('div');
    hoverHitbox.className = 'vivid-player-stack-hover-hitbox';
    hoverHitbox.setAttribute('aria-hidden', 'true');
    stack.appendChild(hoverHitbox);

    const noteLayer = document.createElement('div');
    noteLayer.className = 'vivid-player-note-layer';
    noteLayer.setAttribute('aria-hidden', 'true');
    stack.appendChild(noteLayer);

    // Hover 展开/折叠（多卡时才展开）；同时控制音符动画
    stack.addEventListener('mouseenter', () => {
      state.isHovered = true;
      syncHoveredClass();
      stopNoteAnimation(); // hover 期间停止音符动画（设计要求）
      if (state.activeSources.length > 1) {
        animateStackTransition(true);
      }
    });
    stack.addEventListener('mouseleave', () => {
      state.isHovered = false;
      syncHoveredClass();
      animateStackTransition(false);
      // 离开后，如果主卡仍在播放则恢复音符动画
      const primarySource = stateByTabId.get(state.activeSources[0]);
      if (isPrimarySourceAudible(primarySource)) {
        startNoteAnimation();
      }
    });

    // ── Root 级事件（bubble 阶段，让 button 先处理，再截断传往 Vivaldi）──
    // 不用 capture:true，因为 capture 阶段在 root 上 stopPropagation 会把事件截断在
    // 到达 button 之前，导致按钮无反应。改用 bubble：button 先处理，再由 root 截断。
    root.addEventListener('click', onRootClick);
    root.addEventListener('mousedown', onRootPointerDown);
    root.addEventListener('pointerdown', onRootPointerDown);
    root.addEventListener('dblclick', onRootDoubleClick);
    root.addEventListener('auxclick', onRootAuxClick);
    root.addEventListener('contextmenu', onRootAuxClick);

    // 向后兼容：state.* 指向 slot=0 的 refs
    const primary = state.cardSlots[0];
    state.titleEl = primary.titleEl;
    state.subtitleEl = primary.subtitleEl;
    state.currentTimeEl = primary.currentTimeEl;
    state.durationEl = primary.durationEl;
    state.progressEl = primary.progressEl;
    state.playPauseButton = primary.playPauseButton;
    state.muteButton = primary.muteButton;
    state.pipButton = primary.pipButton;
    state.focusButton = primary.focusButton;
    state.focusIconEl = primary.focusIconEl;
    state.closeButton = primary.closeButton;
    state.prevButton = primary.prevButton;
    state.nextButton = primary.nextButton;

    return root;
  }

  // ─── 叠卡布局（折叠时的 ghost 定位） ────────────────────────────────────

  function resetGhostCardStyle(card) {
    if (!card) return;
    card.style.position = '';
    card.style.bottom = '';
    card.style.top = '';
    card.style.left = '';
    card.style.right = '';
    card.style.height = '';
    card.style.overflow = '';
    card.style.zIndex = '';
    card.style.opacity = '';
    card.style.transform = '';
    card.style.transformOrigin = '';
    card.style.pointerEvents = '';
  }

  function getStackElement() {
    return state.root?.querySelector('.vivid-player-stack') || null;
  }

  function getVisibleStackEntries() {
    return [2, 1, 0]
      .map((slotIndex) => ({ slotIndex, refs: state.cardSlots[slotIndex] }))
      .filter(({ refs }) => refs?.card && refs.card.style.display !== 'none');
  }

  function applyCardLayout(card, layout, instant = false) {
    if (!card) return;
    const previousTransition = card.style.transition;
    if (instant) {
      card.style.transition = 'none';
    }
    card.style.position = layout.position || 'absolute';
    card.style.bottom = layout.bottom == null ? '' : `${layout.bottom}px`;
    card.style.top = layout.top == null ? '' : `${layout.top}px`;
    card.style.left = layout.left == null ? '' : `${layout.left}px`;
    card.style.right = layout.right == null ? '' : `${layout.right}px`;
    card.style.height = layout.height == null ? '' : `${layout.height}px`;
    card.style.opacity = String(layout.opacity);
    card.style.pointerEvents = layout.pointerEvents;
    card.style.zIndex = String(layout.zIndex);
    card.style.overflow = layout.overflow || 'hidden';
    card.style.transform = layout.transform || 'none';
    if (instant) {
      card.offsetHeight;
      card.style.transition = previousTransition;
    }
  }

  function syncHoveredClass() {
    if (!state.root) return;
    state.root.classList.toggle('vivid-player-hovered', state.isHovered);
  }

  function cancelStackAnimations() {
    for (const animation of state.stackAnimations) {
      try { animation.cancel(); } catch (_error) {}
    }
    state.stackAnimations = [];
    if (state.stackTransitionTimer != null) {
      clearTimeout(state.stackTransitionTimer);
      state.stackTransitionTimer = null;
    }
    state.stackTransitioning = false;
    for (const { refs } of getVisibleStackEntries()) {
      const card = refs?.card;
      if (!card) continue;
      card.style.willChange = '';
      card.style.transformOrigin = '';
    }
  }

  function computeStackLayouts(expanded, primaryHeightOverride = null) {
    const stack = getStackElement();
    if (!stack) return { height: 0, layouts: new Map() };

    const visibleEntries = getVisibleStackEntries();
    const primaryCard = state.cardSlots[0]?.card;
    const primaryHeight = primaryHeightOverride ||
      primaryCard?.offsetHeight ||
      visibleEntries[0]?.refs?.card?.offsetHeight ||
      0;
    const layouts = new Map();

    if (!visibleEntries.length || !primaryHeight) {
      return { height: 0, layouts };
    }

    if (visibleEntries.length === 1) {
      layouts.set(0, {
        position: 'relative',
        bottom: null,
        top: null,
        left: null,
        right: null,
        height: null,
        opacity: 1,
        pointerEvents: 'auto',
        zIndex: 3,
        overflow: 'visible',
        transform: 'none',
      });
      return { height: 0, layouts };
    }

    if (expanded) {
      const expandedEntries = visibleEntries.slice().sort((a, b) => a.slotIndex - b.slotIndex);
      const expandedCardHeights = new Map(expandedEntries.map(({ slotIndex, refs }) => [
        slotIndex,
        Math.max(refs.card.scrollHeight || 0, refs.card.offsetHeight || 0, primaryHeight),
      ]));
      let currentStackHeight = 0;
      expandedEntries.forEach(({ slotIndex }) => {
        const expandedCardHeight = expandedCardHeights.get(slotIndex) || primaryHeight;
        const collapsedBottom = slotIndex === 1
          ? VIVID_PLAYER_CONFIG.stackCollapsedOffset1
          : slotIndex === 2
            ? VIVID_PLAYER_CONFIG.stackCollapsedOffset2
            : 0;
        const travel = Math.max(0, currentStackHeight - collapsedBottom);
        layouts.set(slotIndex, {
          position: slotIndex === 0 ? 'relative' : 'absolute',
          bottom: slotIndex === 0 ? null : collapsedBottom,
          top: null,
          left: slotIndex === 0 ? null : 0,
          right: slotIndex === 0 ? null : 0,
          height: null,
          opacity: 1,
          pointerEvents: 'auto',
          zIndex: 3 - slotIndex,
          overflow: 'visible',
          transform: slotIndex === 0 ? 'none' : `translateY(-${travel}px)`,
        });
        currentStackHeight += expandedCardHeight + VIVID_PLAYER_CONFIG.stackGap;
      });
      return { height: 0, layouts };
    }

    visibleEntries.forEach(({ slotIndex }) => {
      let bottom = 0;
      let left = 0;
      let right = 0;
      let opacity = 1;
      let zIndex = 3;
      let pointerEvents = 'auto';

      if (slotIndex === 1) {
        bottom = VIVID_PLAYER_CONFIG.stackCollapsedOffset1;
        left = VIVID_PLAYER_CONFIG.stackCollapsedInset1;
        right = VIVID_PLAYER_CONFIG.stackCollapsedInset1;
        opacity = 0.72;
        zIndex = 2;
        pointerEvents = 'none';
      } else if (slotIndex === 2) {
        bottom = VIVID_PLAYER_CONFIG.stackCollapsedOffset2;
        left = VIVID_PLAYER_CONFIG.stackCollapsedInset2;
        right = VIVID_PLAYER_CONFIG.stackCollapsedInset2;
        opacity = 0.45;
        zIndex = 1;
        pointerEvents = 'none';
      }

      layouts.set(slotIndex, {
        position: slotIndex === 0 ? 'relative' : 'absolute',
        bottom: slotIndex === 0 ? null : bottom,
        top: null,
        left: slotIndex === 0 ? null : left,
        right: slotIndex === 0 ? null : right,
        height: null,
        opacity,
        pointerEvents,
        zIndex,
        overflow: slotIndex === 0 ? 'visible' : 'hidden',
        transform: 'none',
      });
    });

    return {
      height: primaryHeight,
      layouts,
    };
  }

  function measurePrimaryHeight(expanded) {
    const stack = getStackElement();
    const primaryCard = state.cardSlots[0]?.card;
    if (!stack || !primaryCard || primaryCard.style.display === 'none') {
      return primaryCard?.offsetHeight || 0;
    }

    const clone = primaryCard.cloneNode(true);
    const width = primaryCard.getBoundingClientRect().width || primaryCard.offsetWidth || 0;
    clone.classList.add('vivid-player-measure-card');
    clone.setAttribute('aria-hidden', 'true');
    clone.style.position = 'absolute';
    clone.style.left = '-100000px';
    clone.style.top = '0';
    clone.style.right = 'auto';
    clone.style.height = 'auto';
    clone.style.opacity = '0';
    clone.style.pointerEvents = 'none';
    clone.style.zIndex = '-1';
    clone.style.transform = 'none';
    clone.style.overflow = 'visible';
    clone.style.width = width > 0 ? `${width}px` : '100%';
    if (expanded) {
      clone.querySelectorAll('.vivid-player-top-row, .vivid-player-progress-row').forEach((row) => {
        row.style.maxHeight = '44px';
        row.style.opacity = '1';
        row.style.transform = 'translateY(0)';
        row.style.pointerEvents = 'auto';
      });
      const topRow = clone.querySelector('.vivid-player-top-row');
      const progressRow = clone.querySelector('.vivid-player-progress-row');
      if (topRow) topRow.style.marginBottom = '8px';
      if (progressRow) progressRow.style.marginBottom = '8px';
    }
    stack.appendChild(clone);
    const measuredHeight = clone.offsetHeight || primaryCard.offsetHeight || 0;
    clone.remove();
    return measuredHeight;
  }

  function applyCollapsedStackLayout(instant = false, primaryHeightOverride = null) {
    const stack = getStackElement();
    if (!stack) return;
    stack.classList.remove('vivid-player-expanded');
    const { layouts } = computeStackLayouts(false, primaryHeightOverride);
    state.stackExpanded = false;
    stack.style.paddingTop = '';
    stack.style.paddingBottom = '';

    for (const { slotIndex, refs } of [2, 1, 0].map((slotIndex) => ({ slotIndex, refs: state.cardSlots[slotIndex] }))) {
      const card = refs?.card;
      if (!card || card.style.display === 'none') {
        resetGhostCardStyle(card);
        continue;
      }
      const layout = layouts.get(slotIndex);
      if (layout) {
        applyCardLayout(card, layout, instant);
      }
    }
  }

  function applyExpandedStackLayout(instant = false, primaryHeightOverride = null) {
    const stack = getStackElement();
    if (!stack) return;
    stack.classList.add('vivid-player-expanded');
    const { layouts } = computeStackLayouts(true, primaryHeightOverride);
    state.stackExpanded = true;
    stack.style.paddingTop = '';
    stack.style.paddingBottom = '';

    for (const { slotIndex, refs } of [2, 1, 0].map((slotIndex) => ({ slotIndex, refs: state.cardSlots[slotIndex] }))) {
      const card = refs?.card;
      if (!card || card.style.display === 'none') {
        resetGhostCardStyle(card);
        continue;
      }
      const layout = layouts.get(slotIndex);
      if (layout) {
        applyCardLayout(card, layout, instant);
      }
    }
  }

  function animateStackTransition(expanded) {
    const stack = getStackElement();
    if (!stack) return;
    syncHoveredClass();
    if (expanded === state.stackExpanded) {
      if (expanded) {
        applyExpandedStackLayout(true);
      } else {
        applyCollapsedStackLayout(true);
      }
      return;
    }

    cancelStackAnimations();
    const entries = getVisibleStackEntries();
    if (entries.length <= 1) {
      if (expanded) {
        applyExpandedStackLayout(true);
      } else {
        applyCollapsedStackLayout(true);
      }
      return;
    }
    state.stackTransitioning = true;
    if (state.stackTransitionTimer != null) {
      clearTimeout(state.stackTransitionTimer);
    }
    state.stackTransitionTimer = setTimeout(() => {
      state.stackTransitionTimer = null;
      state.stackTransitioning = false;
    }, Math.max(VIVID_PLAYER_CONFIG.stackTransitionMs, VIVID_PLAYER_CONFIG.backCardTransitionMs) + 80);
    const targetPrimaryHeight = measurePrimaryHeight(expanded);
    void stack.offsetHeight;
    if (expanded) {
      applyExpandedStackLayout(false, targetPrimaryHeight);
    } else {
      applyCollapsedStackLayout(false, targetPrimaryHeight);
    }
  }

  function updateStackLayout() {
    if (!state.root) return;
    if (state.stackTransitioning) return;
    cancelStackAnimations();
    if (state.isHovered && state.activeSources.length > 1) {
      applyExpandedStackLayout(true);
      return;
    }
    applyCollapsedStackLayout(true);

    if (state.stackLayoutRaf != null) cancelAnimationFrame(state.stackLayoutRaf);
    state.stackLayoutRaf = requestAnimationFrame(() => {
      state.stackLayoutRaf = null;
      if (state.isHovered && state.activeSources.length > 1) {
        applyExpandedStackLayout(true);
      } else {
        applyCollapsedStackLayout(true);
      }
    });
  }

  // ─── 音符动画 ─────────────────────────────────────────────────────────────

  function isPrimarySourceAudible(source = stateByTabId.get(state.activeSources[0])) {
    if (!source || source.discarded) return false;
    if (source.metadata) {
      return !source.metadata.paused && !source.metadata.muted && Number(source.metadata.volume ?? 1) > 0;
    }
    return !!source.hasAudibleMedia;
  }

  function spawnNote() {
    if (!state.root) return;
    if (!isPrimarySourceAudible()) return;
    const noteLayer = state.root.querySelector('.vivid-player-note-layer');
    if (!noteLayer) return;
    if (state.noteNodes.size >= VIVID_PLAYER_CONFIG.noteMaxConcurrent) return;

    // 音符从主卡的 focusButton（网站图标按钮）上方飞出
    const focusButton = state.cardSlots[0]?.focusButton;
    if (!focusButton) return;

    const layerRect = noteLayer.getBoundingClientRect();
    const btnRect = focusButton.getBoundingClientRect();
    if (btnRect.width === 0 || layerRect.width === 0) return;

    // 以按钮中心为基准，±10px 内随机水平抖动
    const btnCenterX = (btnRect.left + btnRect.right) / 2 - layerRect.left;
    const xOffset = btnCenterX + (Math.random() - 0.5) * 20;
    // 从按钮中心开始向上飞，产生从图标内部冒出的感觉
    const btnCenterY = (btnRect.top + btnRect.bottom) / 2;
    const yFromBottom = layerRect.bottom - btnCenterY;

    const note = document.createElement('span');
    const char = NOTE_CHARS[Math.floor(Math.random() * NOTE_CHARS.length)];
    const size = 10 + Math.floor(Math.random() * 9); // 10–18px
    const rot = (Math.random() - 0.5) * 40;          // ±20°
    const dur = 1.1 + Math.random() * 0.9;

    note.textContent = char;
    note.className = 'vivid-player-note-dynamic';
    note.style.setProperty('--note-rot', `${rot}deg`);
    note.style.setProperty('--note-size', `${size}px`);
    note.style.setProperty('--note-dur', `${dur}s`);
    note.style.left = `${xOffset}px`;
    note.style.bottom = `${yFromBottom}px`;

    noteLayer.appendChild(note);
    state.noteNodes.add(note);
    const cleanup = () => {
      state.noteNodes.delete(note);
      note.remove();
    };
    note.addEventListener('animationend', cleanup, { once: true });
  }

  function startNoteAnimation() {
    if (state.isHovered || !isPrimarySourceAudible()) return;   // hover 展开时不播放音符
    if (state.noteTimer != null) return;
    spawnNote();
    function scheduleNext() {
      const delay = VIVID_PLAYER_CONFIG.noteSpawnMinMs +
        Math.random() * (VIVID_PLAYER_CONFIG.noteSpawnMaxMs - VIVID_PLAYER_CONFIG.noteSpawnMinMs);
      state.noteTimer = setTimeout(() => {
        if (state.noteTimer == null) return;
        if (!isPrimarySourceAudible()) {
          stopNoteAnimation();
          return;
        }
        spawnNote();
        scheduleNext();
      }, delay);
    }
    scheduleNext();
  }

  function stopNoteAnimation() {
    if (state.noteTimer != null) {
      clearTimeout(state.noteTimer);
      state.noteTimer = null;
    }
    for (const note of Array.from(state.noteNodes)) {
      note.remove();
    }
    state.noteNodes.clear();
    state.root?.querySelectorAll('.vivid-player-note-dynamic').forEach((n) => n.remove());
  }

  // ─── 挂载管理 ─────────────────────────────────────────────────────────────

  function ensureMounted() {
    if (!isVerticalTabsMode()) { unmountRoot(); return; }

    const container = document.querySelector('#tabs-container');
    if (!container) return;

    if (!state.root) {
      state.root = createRoot();
    }

    if (state.mountedContainer !== container || !container.contains(state.root)) {
      container.append(state.root);
      state.mountedContainer = container;
      if (state.containerResizeObserver) state.containerResizeObserver.disconnect();
      state.containerResizeObserver = new ResizeObserver(() => updateCompactMode());
      state.containerResizeObserver.observe(container);
    }
    updateCompactMode();
  }

  function unmountRoot() {
    if (state.containerResizeObserver) {
      state.containerResizeObserver.disconnect();
      state.containerResizeObserver = null;
    }
    if (state.hideTimer) { clearTimeout(state.hideTimer); state.hideTimer = null; }
    stopNoteAnimation();
    if (state.root?.parentNode) state.root.parentNode.removeChild(state.root);
    state.mountedContainer = null;
  }

  // ─── 工具函数 ─────────────────────────────────────────────────────────────

  function formatTime(value) {
    if (!Number.isFinite(value) || value < 0) return '0:00';
    const totalSeconds = Math.floor(value);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return hours + ':' + String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
    }
    return minutes + ':' + String(seconds).padStart(2, '0');
  }

  function getHostname(url) {
    if (!url) return '';
    try { return new URL(url).hostname; }
    catch (_error) { return ''; }
  }

  function getDisplayTitle(tabState) {
    return tabState?.metadata?.title || tabState?.title || 'Playing media';
  }

  function getDisplaySubtitle(tabState) {
    return tabState?.metadata?.artist || getHostname(tabState?.url) || 'Background media';
  }

  function getCurrentSourceState() {
    if (state.currentSourceTabId == null) return null;
    return stateByTabId.get(state.currentSourceTabId) || null;
  }

  function markSourceSuppressed(tabState, awaitQuiet = true) {
    if (!tabState) return;
    tabState.suppressed = true;
    tabState.awaitingQuietAfterSuppress = awaitQuiet;
  }

  function reconcileSuppressedState(tabState, audibleNow) {
    if (!tabState?.suppressed) return;
    if (tabState.awaitingQuietAfterSuppress) {
      if (!audibleNow) {
        tabState.awaitingQuietAfterSuppress = false;
      }
      return;
    }
    if (audibleNow) {
      tabState.suppressed = false;
    }
  }

  function isMetadataAudible(tabState) {
    if (!tabState?.metadata) return false;
    return !tabState.metadata.paused && !tabState.metadata.muted && Number(tabState.metadata.volume ?? 1) > 0;
  }

  function isAudioPlaying(tabState) {
    if (!tabState || tabState.discarded) return false;
    if (tabState.mediaSessionActive) return true;
    if (tabState.alertStates.has('playing') || tabState.audible) return true;
    if (tabState.hasAudibleMedia || isMetadataAudible(tabState)) return true;
    return false;
  }

  function setHidden(hidden) {
    if (!state.root) return;
    if (hidden) { scheduleHiddenState(); return; }
    if (state.hideTimer) { clearTimeout(state.hideTimer); state.hideTimer = null; }
    state.root.hidden = false;
    state.root.setAttribute('aria-hidden', 'false');
    state.root.classList.remove('vivid-player-hidden', 'vivid-player-leaving');
    state.root.classList.add('vivid-player-visible');
  }

  function cancelPendingSourceClear() {
    if (state.clearSourceTimer) { clearTimeout(state.clearSourceTimer); state.clearSourceTimer = null; }
  }

  // ─── UI 同步 ───────────────────────────────────────────────────────────────

  /** 同步单个 card slot 的内容 */
  function syncCardSlot(refs, source) {
    if (!source) return;

    const title = getDisplayTitle(source);
    const subtitle = getDisplaySubtitle(source);
    const duration = Number.isFinite(source.metadata?.duration) ? source.metadata.duration : 0;
    const currentTime = Number.isFinite(source.metadata?.currentTime) ? source.metadata.currentTime : 0;
    const paused = !!source.metadata?.paused;
    const muted = !!source.metadata?.muted || (source.metadata?.volume === 0);
    const percent = duration > 0 ? Math.max(0, Math.min(100, (currentTime / duration) * 100)) : 0;

    refs.card.dataset.playing = paused ? 'false' : 'true';
    refs.card.dataset.canPip = source.canPip ? 'true' : 'false';
    refs.card.dataset.themeMode = VIVID_PLAYER_CONFIG.theme === 'classic' ? 'classic' : 'theme';

    refs.titleEl.textContent = title;
    refs.titleEl.title = title;
    refs.subtitleEl.textContent = subtitle;
    refs.subtitleEl.title = subtitle;
    refs.currentTimeEl.textContent = formatTime(currentTime);
    refs.durationEl.textContent = formatTime(duration);
    if (!refs.suppressSync) refs.progressEl.value = String(percent);
    refs.progressEl.disabled = true;
    refs.playPauseButton.innerHTML = paused ? icons.play : icons.pause;
    refs.playPauseButton.setAttribute('aria-label', paused ? 'Play' : 'Pause');
    refs.muteButton.innerHTML = muted ? icons.mute : icons.unmute;
    refs.muteButton.setAttribute('aria-label', muted ? 'Unmute' : 'Mute');
    refs.pipButton.hidden = !source.canPip;

    // favicon
    const iconUrl = source?.favIconUrl || '';
    refs.focusButton.classList.toggle('has-favicon', !!iconUrl);
    if (iconUrl) {
      refs.focusButton.style.setProperty('--vivid-player-favicon', 'url("' + iconUrl.replace(/"/g, '\\"') + '")');
    } else {
      refs.focusButton.style.removeProperty('--vivid-player-favicon');
    }
  }

  function scheduleSyncUi() {
    if (state.syncUiRaf != null) return;
    state.syncUiRaf = requestAnimationFrame(() => {
      state.syncUiRaf = null;
      syncUi();
    });
  }

  function syncUi() {
    ensureMounted();
    if (!state.root || !isVerticalTabsMode()) return;

    const sources = state.activeSources;
    if (!sources.length) {
      setHidden(true);
      stopNoteAnimation();
      return;
    }

    state.root.dataset.themeMode = VIVID_PLAYER_CONFIG.theme === 'classic' ? 'classic' : 'theme';
    updateCompactMode();

    // 同步各 slot
    for (let i = 0; i < 3; i++) {
      const refs = state.cardSlots[i];
      if (!refs) continue;
      const tabId = sources[i];
      if (tabId != null) {
        const source = stateByTabId.get(tabId);
        if (source) {
          refs.tabId = tabId;
          refs.card.style.display = '';
          syncCardSlot(refs, source);
        } else {
          refs.tabId = null;
          refs.card.style.display = 'none';
        }
      } else {
        refs.tabId = null;
        refs.card.style.display = 'none';
      }
    }

    state.root.dataset.stackSize = String(sources.length);
    setHidden(false);

    // 音符动画跟随主卡播放状态
    const primarySource = stateByTabId.get(sources[0]);
    if (isPrimarySourceAudible(primarySource)) {
      startNoteAnimation();
    } else {
      stopNoteAnimation();
    }

    updateStackLayout();
  }

  function clearCurrentSource() {
    cancelPendingSourceClear();
    state.currentSourceTabId = null;
    state.activeSources = [];
    scheduleSyncUi();
  }

  // ─── 候选源选择 ───────────────────────────────────────────────────────────

  /**
   * 收集所有满足条件的音频源，选最多3个。
   * 稳定排序——已在 activeSources 中的 tab 保持原有顺序，
   * 只把新出现的 tab 插到最前面。
   *
   * 可见条件（"有媒体"）：tab 有 metadata（曾经播放过），即使当前暂停/静音也显示。
   * 只有以下情况才消失：tab 被关闭、用户切换到该 tab、用户点击关闭按钮（suppressed）、
   * 或 tab 导航到新页面（metadata 被重置）。
   */
  function hasMedia(tabState) {
    if (!tabState || tabState.discarded) return false;
    // 有 metadata = 曾经播放过媒体
    return tabState.metadata !== null && tabState.metadata !== undefined;
  }

  function chooseCandidateSource() {
    const playingSet = new Set();
    for (const tabState of stateByTabId.values()) {
      if (tabState.windowId !== state.currentWindowId) continue;
      if (!hasMedia(tabState) && !isAudioPlaying(tabState)) continue; // 既无 metadata 也无音频
      if (tabState.active || tabState.tabId === state.activeTabId) continue;
      if (tabState.alertStates.has('pip') || tabState.pictureInPicture || tabState.pendingPip) continue;
      if (tabState.suppressed) continue;
      playingSet.add(tabState.tabId);
    }

    // 保留已有顺序中仍在播放的 tab
    const retained = state.activeSources.filter((id) => playingSet.has(id));
    const retainedSet = new Set(retained);

    // 新增的 tab（按 lastMediaAt 降序插入到最前）
    const newTabs = Array.from(playingSet)
      .filter((id) => !retainedSet.has(id))
      .map((id) => stateByTabId.get(id))
      .filter(Boolean)
      .sort((a, b) => b.lastMediaAt - a.lastMediaAt)
      .map((t) => t.tabId);

    const combined = [...newTabs, ...retained];
    const top3 = combined.slice(0, 3);
    // 超出3个的暂停
    for (const id of combined.slice(3)) {
      const excess = stateByTabId.get(id);
      if (excess) {
        markSourceSuppressed(excess, true);
        sendCommand(excess.tabId, excess.frameId, { action: 'pause' }).catch?.(() => {});
      }
    }

    state.activeSources = top3;
    state.currentSourceTabId = top3[0] ?? null;
    cancelPendingSourceClear();
    scheduleSyncUi();
  }

  // ─── 事件处理器 ──────────────────────────────────────────────────────────

  /**
   * bubble 阶段的 mousedown/pointerdown 拦截器。
   * button/input：事件已经到达并触发了按钮自己的处理器，这里只需 stopPropagation
   * 阻止事件继续冒泡到 Vivaldi 的祖先元素即可。
   * 其他区域：preventDefault + stopPropagation 完全阻断。
   */
  function onRootPointerDown(event) {
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === 'function') {
      event.stopImmediatePropagation();
    }
    if (!event.target.closest('button, input')) {
      event.preventDefault();
    }
  }

  function onRootDoubleClick(event) {
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === 'function') {
      event.stopImmediatePropagation();
    }
  }

  function onRootAuxClick(event) {
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === 'function') {
      event.stopImmediatePropagation();
    }
  }

  function onRootClick(event) {
    // bubble 阶段：button 已经处理完毕，这里统一截断冒泡
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === 'function') {
      event.stopImmediatePropagation();
    }
    if (event.target.closest('button, input')) return;
    // 点击非按钮区域：聚焦对应 card 的源标签
    event.preventDefault();
    const card = event.target.closest('.vivid-player-card');
    if (card) {
      const slotIndex = parseInt(card.dataset.slot, 10);
      const refs = state.cardSlots[slotIndex];
      if (refs?.tabId) {
        const source = stateByTabId.get(refs.tabId);
        if (source) {
          chrome.tabs.update(source.tabId, { active: true }).catch(() => {});
          sendCommand(source.tabId, source.frameId, { action: 'scroll-into-view', frameId: source.frameId });
        }
      }
    }
  }

  // ─── Tab 快照 ─────────────────────────────────────────────────────────────

  async function refreshTabSnapshot(tabId) {
    const [tab, tabPrivate] = await Promise.all([getTab(tabId), getTabPrivate(tabId)]);
    const tabState = getTabState(tabId);

    if (!tab) {
      stateByTabId.delete(tabId);
      if (state.currentSourceTabId === tabId) clearCurrentSource();
      return;
    }

    tabState.windowId = tab.windowId;
    tabState.title = tab.title || '';
    tabState.url = tab.url || tab.pendingUrl || '';
    tabState.favIconUrl = tab.favIconUrl || '';
    tabState.audible = !!tab.audible;
    tabState.active = !!tab.active;
    tabState.discarded = !!tab.discarded || !!tabPrivate.discarded;
    if (tabState.active) state.activeTabId = tabId;

    if (tabState.discarded) {
      tabState.awaitingQuietAfterSuppress = false;
      tabState.hasAudibleMedia = false;
      tabState.mediaSessionActive = false;
      tabState.metadata = null;
      tabState.pictureInPicture = false;
      tabState.ended = true;
    }
  }

  // ─── 命令发送 ─────────────────────────────────────────────────────────────

  function sendCommand(tabId, frameId, command) {
    return new Promise((resolve) => {
      try {
        const message = {
          type: MESSAGE_TYPE,
          action: 'command',
          command: { ...command, frameId },
        };
        chrome.tabs.sendMessage(
          tabId,
          message,
          frameId ? { frameId } : undefined,
          () => { resolve(); }
        );
      } catch (_error) { resolve(); }
    });
  }

  async function sendCommandToCurrentSource(command) {
    const source = getCurrentSourceState();
    if (!source) return;
    await sendCommand(source.tabId, source.frameId, command);
  }

  /**
   * 尝试对指定 tab 触发 PiP。
   * 返回 true 表示命令已发送（不代表 PiP 一定成功）。
   */
  function tryAutoPip(tabId) {
    if (!VIVID_PLAYER_CONFIG.autoPipOnSwitch) return false;
    const source = stateByTabId.get(tabId);
    if (!source) return false;
    if (source.pictureInPicture) return false; // 已在 PiP 中
    // 标记 pending：PiP 激活前跳过 miniplayer 源选择，避免闪烁
    source.pendingPip = true;
    setTimeout(() => { if (source.pendingPip) source.pendingPip = false; }, 2000);
    sendCommand(source.tabId, source.frameId, { action: 'picture-in-picture' });
    return true;
  }

  // ─── 页面注入 ─────────────────────────────────────────────────────────────

  function injectBridge(messageType, bridgeFlag) {
    if (window[bridgeFlag]) return;
    window[bridgeFlag] = true;

    chrome.runtime.onMessage.addListener((info, _sender, sendResponse) => {
      if (!info || info.type !== messageType || info.action !== 'command') return;
      window.postMessage({ type: messageType + '-internal', data: info.command });
      sendResponse({});
    });

    window.addEventListener('message', (event) => {
      if (event.source !== window || !event.data || event.data.type !== messageType) return;
      chrome.runtime.sendMessage(event.data.data);
    });
  }

  function injectMain(messageType, mainFlag) {
    if (window[mainFlag]) return;
    window[mainFlag] = true;

    const observedFlag = 'vividPlayerObserved';
    let currentMedia = null;

    // ── MediaSession handler 劫持 ──────────────────────────────────────────
    // 保存页面注册的 previoustrack/nexttrack handler，直接调用比发 MediaKey 事件可靠得多。
    const _savedMsHandlers = {};
    if (navigator.mediaSession && typeof navigator.mediaSession.setActionHandler === 'function') {
      const _origSetActionHandler = navigator.mediaSession.setActionHandler.bind(navigator.mediaSession);
      navigator.mediaSession.setActionHandler = function (action, handler) {
        _savedMsHandlers[action] = handler;
        return _origSetActionHandler(action, handler);
      };
    }

    // ── 媒体元素劫持 ──────────────────────────────────────────────────────

    const playVideoOriginal = HTMLVideoElement.prototype.play;
    HTMLVideoElement.prototype.play = function () {
      if (!this[observedFlag]) attachMedia(this);
      return playVideoOriginal.apply(this, arguments);
    };

    const playAudioOriginal = HTMLAudioElement.prototype.play;
    HTMLAudioElement.prototype.play = function () {
      if (!this[observedFlag]) attachMedia(this);
      return playAudioOriginal.apply(this, arguments);
    };

    const addEventListenerVideoOriginal = HTMLVideoElement.prototype.addEventListener;
    HTMLVideoElement.prototype.addEventListener = function () {
      if (!this[observedFlag]) attachMedia(this);
      return addEventListenerVideoOriginal.apply(this, arguments);
    };

    const addEventListenerAudioOriginal = HTMLAudioElement.prototype.addEventListener;
    HTMLAudioElement.prototype.addEventListener = function () {
      if (!this[observedFlag]) attachMedia(this);
      return addEventListenerAudioOriginal.apply(this, arguments);
    };

    function hasAudio(media) {
      return !!(media && (
        media.webkitAudioDecodedByteCount ||
        media.mozHasAudio ||
        media.audioTracks?.length ||
        media.tagName === 'AUDIO'
      ));
    }

    function hasVideo(media) {
      return !!(media && (
        media.webkitVideoDecodedByteCount ||
        media.videoWidth > 0 ||
        media.videoHeight > 0 ||
        media.tagName === 'VIDEO'
      ));
    }

    function canPip(media) {
      return !!(
        media &&
        media.tagName === 'VIDEO' &&
        document.pictureInPictureEnabled &&
        !media.disablePictureInPicture &&
        hasVideo(media)
      );
    }

    /** 判断媒体元素是否属于页面主体内容（排除 iframe 内嵌、零尺寸、完全离屏的媒体） */
    function isEmbeddedMedia(media) {
      if (!media) return true;
      // iframe 内的媒体（广告、第三方嵌入）
      try {
        if (media.ownerDocument !== document) return true;
      } catch (_e) { return true; }
      // 零尺寸（display:none、visibility:hidden 等）
      const rect = media.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return true;
      // 完全离屏（上下左右均超出视口）
      if (rect.bottom <= 0 || rect.top >= window.innerHeight ||
          rect.right <= 0 || rect.left >= window.innerWidth) return true;
      return false;
    }

    // ── 媒体显著性评分 ──────────────────────────────────────────────────
    // 借鉴 Zen 的控制器映射思路，通过多维评分过滤非主要内容：
    // 1. 总时长 <8s → 很可能是 UI 音效或广告片段
    // 2. 视频面积太小 → 头像动画、装饰元素
    // 3. 综合评分 <0 → 非显著媒体，优先选择更高评分的源

    function computeMediaSignificance(media) {
      let score = 0;
      // 视频面积：大尺寸 = 主要内容
      if (media.tagName === 'VIDEO') {
        const area = (media.videoWidth || 0) * (media.videoHeight || 0);
        if (area >= VIVID_PLAYER_CONFIG.minVideoArea) score += 4;
        else if (area > 0) score += 1;
      }
      // controls 属性 = 用户主动嵌入的内容
      if (media.controls) score += 3;
      // MediaSession = 页面自身认定的主媒体
      if (navigator.mediaSession?.metadata?.title) score += 3;
      // 总时长评分
      const dur = media.duration;
      if (Number.isFinite(dur)) {
        if (dur > 300) score += 3;        // >5min: 音乐/播客
        else if (dur > 60) score += 2;    // >1min: 视频内容
        else if (dur > 15) score += 1;    // >15s: 可能是有意义的内容
        else if (dur < VIVID_PLAYER_CONFIG.minMediaDurationSec) score -= 2; // <8s: 音效/广告
      }
      // 纯音频且无 MediaSession → 背景音乐/通知音，降低权重
      if (media.tagName === 'AUDIO' && !navigator.mediaSession?.metadata?.title) score -= 1;
      return score;
    }

    function isSignificantMedia(media) {
      if (!media || media.ended) return false;
      return computeMediaSignificance(media) >= 0;
    }

    function isTrackable(media) { return !!media && !media.ended; }
    function isAudible(media) {
      return !!media && hasAudio(media) && !media.paused && !media.ended && !media.muted && media.volume > 0;
    }
    function isPlayable(media) { return !!media && !media.paused && !media.ended; }

    function getMediaTitle() { return navigator.mediaSession?.metadata?.title || document.title || ''; }
    function getMediaArtist() { return navigator.mediaSession?.metadata?.artist || ''; }

    function getMediaImage(media) {
      if (media?.poster) return media.poster;
      const artwork = navigator.mediaSession?.metadata?.artwork;
      if (Array.isArray(artwork) && artwork.length) return artwork[0].src || '';
      const icon = document.querySelector('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]');
      return icon?.href || '';
    }

    function getCurrentMedia(preferredMedia) {
      if (preferredMedia && isAudible(preferredMedia) && !isEmbeddedMedia(preferredMedia) && isSignificantMedia(preferredMedia)) return preferredMedia;
      const medias = Array.from(document.querySelectorAll('video, audio'));
      // 优先选择显著媒体（大尺寸、长时长、有 MediaSession）
      for (let index = medias.length - 1; index >= 0; index -= 1) {
        if (!isEmbeddedMedia(medias[index]) && isAudible(medias[index]) && isSignificantMedia(medias[index])) return medias[index];
      }
      for (let index = medias.length - 1; index >= 0; index -= 1) {
        if (!isEmbeddedMedia(medias[index]) && isPlayable(medias[index]) && isSignificantMedia(medias[index])) return medias[index];
      }
      // fallback：无显著媒体时仍检测（兼容无 MediaSession 的自定义播放器）
      for (let index = medias.length - 1; index >= 0; index -= 1) {
        if (!isEmbeddedMedia(medias[index]) && isAudible(medias[index])) return medias[index];
      }
      for (let index = medias.length - 1; index >= 0; index -= 1) {
        if (!isEmbeddedMedia(medias[index]) && isPlayable(medias[index])) return medias[index];
      }
      return null;
    }

    function getCommandMedia(preferredMedia) {
      if (preferredMedia && isTrackable(preferredMedia) && !isEmbeddedMedia(preferredMedia)) return preferredMedia;
      const medias = Array.from(document.querySelectorAll('video, audio'));
      for (let index = medias.length - 1; index >= 0; index -= 1) {
        if (!isEmbeddedMedia(medias[index]) && isTrackable(medias[index])) return medias[index];
      }
      return null;
    }

    function postMediaUpdate(eventType, media) {
      const nextMedia = getCurrentMedia(media);
      currentMedia = nextMedia;

      if (!nextMedia) {
        window.postMessage({
          type: messageType,
          data: { type: messageType, ended: true, hasAudibleMedia: false, eventType },
        });
        return;
      }

      window.postMessage({
        type: messageType,
        data: {
          type: messageType, eventType,
          title: getMediaTitle(), artist: getMediaArtist(),
          image: getMediaImage(nextMedia),
          paused: nextMedia.paused, muted: nextMedia.muted,
          volume: nextMedia.volume, duration: nextMedia.duration,
          currentTime: nextMedia.currentTime,
          pictureInPicture: !!document.pictureInPictureElement,
          audioOnly: !hasVideo(nextMedia),
          hasAudibleMedia: isAudible(nextMedia),
          canPip: canPip(nextMedia),
        },
      });
    }

    function handlePlaybackEvent(event) {
      if (!isTrackable(event.target)) return;
      if (isEmbeddedMedia(event.target)) return;
      postMediaUpdate(event.type, event.target);
    }

    function attachMedia(media) {
      if (!media || media[observedFlag]) return;
      media[observedFlag] = true;
      ['play', 'playing', 'pause', 'ended', 'timeupdate', 'volumechange',
       'enterpictureinpicture', 'leavepictureinpicture', 'loadedmetadata', 'durationchange',
      ].forEach((eventName) => {
        media.addEventListener(eventName, handlePlaybackEvent);
      });
    }

    function scanExistingMedia() {
      const allMedia = Array.from(document.querySelectorAll('video, audio'));
      const mainMedia = allMedia.filter((m) => !isEmbeddedMedia(m));
      mainMedia.forEach(attachMedia);
      const media = getCurrentMedia(currentMedia);
      if (media) postMediaUpdate('scan', media);
    }

    function triggerMediaKey(key) {
      const eventInit = { key, code: key, bubbles: true, cancelable: true, composed: true };
      const targets = [document.activeElement, document.body, document.documentElement, window];
      for (const target of targets) {
        if (!target?.dispatchEvent) continue;
        target.dispatchEvent(new KeyboardEvent('keydown', eventInit));
        target.dispatchEvent(new KeyboardEvent('keyup', eventInit));
      }
    }

    function describeElement(element) {
      if (!element) return null;
      const text = (
        element.getAttribute?.('aria-label') ||
        element.getAttribute?.('title') ||
        element.textContent ||
        ''
      ).replace(/\s+/g, ' ').trim();
      return {
        tag: element.tagName || '',
        id: element.id || '',
        className: typeof element.className === 'string' ? element.className.slice(0, 160) : '',
        ariaLabel: element.getAttribute?.('aria-label') || '',
        title: element.getAttribute?.('title') || '',
        text: text.slice(0, 120),
        disabled: !!element.disabled || element.getAttribute?.('aria-disabled') === 'true',
      };
    }

    function getTransportSelectors(action) {
      return action === 'previous-track'
        ? [
            '[data-testid*="previous" i]', '[data-test*="previous" i]',
            '[aria-label*="previous" i]', '[aria-label*="prev" i]',
            '[title*="previous" i]', '[title*="prev" i]',
            '[class*="previous" i]', '[class*="prev" i]',
            '[id*="previous" i]', '[id*="prev" i]',
          ]
        : [
            '[data-testid*="next" i]', '[data-test*="next" i]',
            '[aria-label*="next" i]', '[title*="next" i]',
            '[class*="next" i]', '[id*="next" i]',
          ];
    }

    function getTransportLabels(action) {
      return action === 'previous-track'
        ? ['上一首', '上一曲', '上一個', '上一个', 'prev', 'previous', 'back']
        : ['下一首', '下一曲', '下一個', '下一个', 'next', 'forward'];
    }

    function collectTransportDiagnostics(action) {
      const media = getCommandMedia(currentMedia);
      const msAction = action === 'previous-track' ? 'previoustrack' : 'nexttrack';
      const selectors = getTransportSelectors(action);
      const labels = getTransportLabels(action);
      const selectorSnapshots = [];

      selectors.forEach((selector) => {
        const candidates = Array.from(document.querySelectorAll(selector)).slice(0, 8);
        if (!candidates.length) return;
        selectorSnapshots.push({
          selector,
          count: document.querySelectorAll(selector).length,
          candidates: candidates.map((element) => {
            const described = describeElement(element) || {};
            const haystack = (
              element.getAttribute?.('aria-label') ||
              element.getAttribute?.('title') ||
              element.textContent ||
              ''
            ).toLowerCase();
            return Object.assign(described, {
              labelMatch: labels.some((label) => haystack.includes(label.toLowerCase())),
            });
          }),
        });
      });

      return {
        action,
        location: window.location.href,
        title: document.title || '',
        mediaSession: {
          hasHandler: typeof _savedMsHandlers[msAction] === 'function',
          registeredHandlers: Object.keys(_savedMsHandlers).sort(),
          metadataTitle: navigator.mediaSession?.metadata?.title || '',
          metadataArtist: navigator.mediaSession?.metadata?.artist || '',
          playbackState: navigator.mediaSession?.playbackState || '',
        },
        currentMedia: media ? {
          tagName: media.tagName || '',
          currentSrc: media.currentSrc || media.src || '',
          paused: !!media.paused,
          muted: !!media.muted,
          volume: Number.isFinite(media.volume) ? media.volume : null,
          currentTime: Number.isFinite(media.currentTime) ? media.currentTime : null,
          duration: Number.isFinite(media.duration) ? media.duration : null,
        } : null,
        activeElement: describeElement(document.activeElement),
        selectorSnapshots,
      };
    }

    function clickTransportButton(action) {
      const labels = getTransportLabels(action);
      const selectors = getTransportSelectors(action);
      for (const selector of selectors) {
        const candidates = Array.from(document.querySelectorAll(selector));
        const match =
          candidates.find((element) => {
            if (!element || typeof element.click !== 'function') return false;
            if (element.disabled || element.getAttribute('aria-disabled') === 'true') return false;
            const text = (
              element.getAttribute('aria-label') ||
              element.getAttribute('title') ||
              element.textContent || ''
            ).toLowerCase();
            return labels.some((label) => text.includes(label.toLowerCase()));
          }) ||
          candidates.find((element) => (
            element &&
            typeof element.click === 'function' &&
            !element.disabled &&
            element.getAttribute('aria-disabled') !== 'true'
          ));
        if (match) {
          match.click();
          return {
            clicked: true,
            selector,
            matchedText: (
              match.getAttribute('aria-label') ||
              match.getAttribute('title') ||
              match.textContent || ''
            ).trim().slice(0, 80),
          };
        }
      }
      return { clicked: false, selector: null, matchedText: '' };
    }

    /**
     * 切换上一曲/下一曲的策略（优先级从高到低）：
     * 1. 直接调用页面通过 setActionHandler 注册的 MediaSession handler（最可靠）
     * 2. 触发 MediaTrackPrevious/Next 键盘事件（部分桌面播放器响应）
     * 3. DOM 点击页面上的 prev/next 按钮（作为最后的 fallback）
     */
    function triggerTransportAction(action) {
      const msAction = action === 'previous-track' ? 'previoustrack' : 'nexttrack';
      const mediaKey = action === 'previous-track' ? 'MediaTrackPrevious' : 'MediaTrackNext';
      const diagnostics = collectTransportDiagnostics(action);

      // 策略1：MediaSession handler（YouTube Music、Spotify、网易云等现代网站均注册）
      if (typeof _savedMsHandlers[msAction] === 'function') {
        try {
          _savedMsHandlers[msAction]({ action: msAction });
          const result = { clicked: true, selector: 'mediaSession', matchedText: msAction };
          window.postMessage({
            type: messageType,
            data: {
              type: messageType, eventType: 'transport-debug',
              transportAction: action,
              transportDebug: {
                mediaKey: 'mediaSession-handler',
                strategy: 'mediaSession-handler',
                buttonResult: result,
                mediaTitle: getMediaTitle(),
                diagnostics,
              },
            },
          });
          return true;
        } catch (_e) { /* 继续下一个策略 */ }
      }

      // 策略2+3：MediaKey 事件 + DOM 按钮点击
      triggerMediaKey(mediaKey);
      const buttonResult = clickTransportButton(action);

      window.postMessage({
        type: messageType,
        data: {
          type: messageType, eventType: 'transport-debug',
          transportAction: action,
          transportDebug: {
            mediaKey,
            strategy: buttonResult.clicked ? 'media-key+dom-click' : 'media-key-only',
            buttonResult,
            mediaTitle: getMediaTitle(),
            diagnostics,
          },
        },
      });
      return buttonResult.clicked;
    }

    window.__vividPlayerDebug = Object.assign(window.__vividPlayerDebug || {}, {
      collectTransportDiagnostics,
      triggerTransportAction,
      clickTransportButton,
      triggerMediaKey,
      getSavedMediaSessionHandlers: () => Object.keys(_savedMsHandlers).sort(),
    });

    window.addEventListener('message', (event) => {
      if (
        event.source !== window ||
        !event.data ||
        event.data.type !== messageType + '-internal' ||
        !event.data.data?.action
      ) return;

      const info = event.data.data;
      currentMedia = getCommandMedia(currentMedia);
      if (!currentMedia) return;

      switch (info.action) {
        case 'play':
          currentMedia.play().catch(() => {});
          break;
        case 'pause':
          currentMedia.pause();
          break;
        case 'muted':
          currentMedia.muted = !currentMedia.muted;
          if (!currentMedia.muted && currentMedia.volume === 0) currentMedia.volume = 1;
          break;
        case 'picture-in-picture':
          if (document.pictureInPictureEnabled && canPip(currentMedia)) {
            if (document.pictureInPictureElement) {
              document.exitPictureInPicture().catch(() => {});
            } else {
              currentMedia.requestPictureInPicture().catch(() => {});
            }
          }
          break;
        case 'scroll-into-view':
          if (document.pictureInPictureEnabled && document.pictureInPictureElement) {
            document.exitPictureInPicture().catch(() => {});
          }
          currentMedia.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'center' });
          break;
        case 'close':
          if (document.pictureInPictureEnabled && document.pictureInPictureElement) {
            document.exitPictureInPicture().catch(() => {});
          }
          currentMedia.pause();
          break;
        case 'previous-track':
          triggerTransportAction('previous-track');
          break;
        case 'next-track':
          triggerTransportAction('next-track');
          break;
      }
    });

    scanExistingMedia();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node?.nodeType !== Node.ELEMENT_NODE) return;
          if (node.matches?.('video, audio')) attachMedia(node);
          node.querySelectorAll?.('video, audio').forEach(attachMedia);
        });
      });
    });
    observer.observe(document, { childList: true, subtree: true });
  }

  // ─── 注入执行 ─────────────────────────────────────────────────────────────

  async function ensureInjection(tabId, frameIds) {
    if (tabId == null || tabId < 0) return;
    const target = frameIds?.length ? { tabId, frameIds } : { tabId, allFrames: true };
    try {
      await chrome.scripting.executeScript({
        target,
        world: 'MAIN',
        func: injectMain,
        args: [MESSAGE_TYPE, INJECT_MAIN_FLAG],
      });
      await chrome.scripting.executeScript({
        target,
        func: injectBridge,
        args: [MESSAGE_TYPE, INJECT_BRIDGE_FLAG],
      });
      injectedTabIds.add(tabId);
    } catch (_error) {
      // Ignore pages that cannot be injected.
    }
  }

  // ─── 窗口/标签快照 ────────────────────────────────────────────────────────

  async function refreshWindowSnapshot() {
    const tabs = await getTabsInCurrentWindow();
    const seenTabIds = new Set();

    await Promise.all(tabs.map(async (tab) => {
      seenTabIds.add(tab.id);
      const tabState = getTabState(tab.id);
      tabState.windowId = tab.windowId;
      tabState.title = tab.title || '';
      tabState.url = tab.url || tab.pendingUrl || '';
      tabState.favIconUrl = tab.favIconUrl || '';
      tabState.audible = !!tab.audible;
      tabState.active = !!tab.active;
      tabState.discarded = !!tab.discarded;
      if (tab.active) state.activeTabId = tab.id;
      await ensureInjection(tab.id);
    }));

    for (const tabId of Array.from(stateByTabId.keys())) {
      const tabState = stateByTabId.get(tabId);
      if (tabState.windowId === state.currentWindowId && !seenTabIds.has(tabId)) {
        stateByTabId.delete(tabId);
      }
    }

    chooseCandidateSource();
  }

  async function handleMediaStateChanged(tabId, windowId, tabStates) {
    const tabState = getTabState(tabId);
    tabState.windowId = windowId;
    tabState.alertStates = new Set(Array.isArray(tabStates) ? tabStates : []);
    const audibleNow = tabState.alertStates.has('playing') || tabState.hasAudibleMedia || isMetadataAudible(tabState);
    if (tabState.alertStates.has('playing')) {
      tabState.lastMediaAt = Date.now();
    }
    reconcileSuppressedState(tabState, audibleNow);
    if (!tabState.alertStates.has('playing')) tabState.audible = false;

    if (windowId === state.currentWindowId) {
      await refreshTabSnapshot(tabId);
      await ensureInjection(tabId);
      chooseCandidateSource();
    }
  }

  async function handleRuntimeMessage(info, sender) {
    if (!info || !sender.tab) return;
    if (info.type !== MESSAGE_TYPE) return;

    const tabId = sender.tab.id;
    const tabState = getTabState(tabId);
    tabState.windowId = sender.tab.windowId;
    tabState.title = sender.tab.title || tabState.title;
    tabState.url = sender.tab.url || tabState.url;
    tabState.favIconUrl = sender.tab.favIconUrl || tabState.favIconUrl;
    tabState.audible = !!sender.tab.audible;
    tabState.frameId = sender.frameId || 0;
    if (!tabState.lastMediaAt) tabState.lastMediaAt = Date.now();

    if (info.eventType === 'transport-debug') {
      pushTransportDebug('page-result', {
        action: info.transportAction,
        tabId,
        frameId: sender.frameId || 0,
        mediaKey: info.transportDebug?.mediaKey,
        strategy: info.transportDebug?.strategy || '',
        clicked: !!info.transportDebug?.buttonResult?.clicked,
        selector: info.transportDebug?.buttonResult?.selector || null,
        matchedText: info.transportDebug?.buttonResult?.matchedText || '',
        mediaTitle: info.transportDebug?.mediaTitle || '',
        diagnostics: info.transportDebug?.diagnostics || null,
      });
      return;
    }

    if (!info.ended && info.paused !== undefined) {
      tabState.metadata = {
        title: info.title || tabState.metadata?.title || '',
        artist: info.artist || '',
        image: info.image || '',
        paused: !!info.paused,
        muted: !!info.muted,
        volume: Number.isFinite(info.volume) ? info.volume : 1,
        duration: Number.isFinite(info.duration) ? info.duration : 0,
        currentTime: Number.isFinite(info.currentTime) ? info.currentTime : 0,
      };
      tabState.hasAudibleMedia = !!info.hasAudibleMedia;
      tabState.mediaSessionActive = !info.paused;
      tabState.canPip = info.audio === undefined ? !!info.canPip : !info.audio;
      tabState.pictureInPicture = !!info.pictureInPicture;
      tabState.pendingPip = false; // PiP 状态已确认（激活或关闭），清除 pending
      tabState.ended = false;
      reconcileSuppressedState(tabState, tabState.hasAudibleMedia);
    }

    if (info.eventType === 'play' || info.eventType === 'playing') {
      tabState.lastMediaAt = Date.now();
    }

    if (!info.ended && info.eventType !== 'pause' && tabState.metadata) {
      tabState.lastMediaAt = Date.now();
    }

    if (info.ended) {
      tabState.hasAudibleMedia = false;
      tabState.mediaSessionActive = false;
      tabState.canPip = false;
      tabState.pictureInPicture = false;
      tabState.ended = true;
      tabState.metadata = tabState.metadata && { ...tabState.metadata, paused: true };
      reconcileSuppressedState(tabState, false);
    }

    if (sender.tab.windowId === state.currentWindowId) chooseCandidateSource();
  }

  // ─── 监听注册 ─────────────────────────────────────────────────────────────

  function registerListener(target, method, handler) {
    if (!target?.[method]?.addListener) return;
    target[method].addListener(handler);
    state.disposeListeners.push(() => target[method].removeListener(handler));
  }

  function observeMounts() {
    if (state.mountObserver) state.mountObserver.disconnect();
    state.mountObserver = new MutationObserver(() => ensureMounted());
    state.mountObserver.observe(document.documentElement, {
      childList: true, subtree: true, attributes: true, attributeFilter: ['class'],
    });
  }

  // ─── 初始化 ───────────────────────────────────────────────────────────────

  async function init() {
    state.currentWindowId = await getCurrentWindowId();
    if (state.currentWindowId == null) return;

    ensureMounted();
    observeMounts();

    registerListener(vivaldi.windowPrivate, 'onActivated', async (windowId, activated) => {
      if (!activated || windowId !== state.currentWindowId) return;
      await refreshWindowSnapshot();
    });

    registerListener(vivaldi.tabsPrivate, 'onMediaStateChanged', (tabId, windowId, tabStates) => {
      void handleMediaStateChanged(tabId, windowId, tabStates);
    });

    registerListener(chrome.tabs, 'onActivated', async (activeInfo) => {
      if (activeInfo.windowId !== state.currentWindowId) return;
      const previousTabId = state.activeTabId;
      state.activeTabId = activeInfo.tabId;
      await refreshTabSnapshot(activeInfo.tabId);
      // 切换前对上一个 tab 尝试自动 PiP（如果是视频）
      if (previousTabId != null && previousTabId !== activeInfo.tabId) {
        tryAutoPip(previousTabId);
      }
      chooseCandidateSource();
      // PiP 请求异步，延迟后重新判断（如果 PiP 成功，tab 会被排除）
      setTimeout(() => { chooseCandidateSource(); }, 300);
      setTimeout(() => { void refreshWindowSnapshot(); }, 250);
    });

    registerListener(chrome.tabs, 'onUpdated', (tabId, changeInfo, tab) => {
      if (tab.windowId !== state.currentWindowId) return;
      const tabState = getTabState(tabId);
      tabState.windowId = tab.windowId;
      if (changeInfo.title != null) tabState.title = changeInfo.title;
      if (changeInfo.audible != null) tabState.audible = changeInfo.audible;
      if (changeInfo.favIconUrl != null) tabState.favIconUrl = changeInfo.favIconUrl;
      if (changeInfo.discarded) {
        tabState.awaitingQuietAfterSuppress = false;
        tabState.hasAudibleMedia = false;
        tabState.metadata = null;
      }
      if (changeInfo.status === 'loading' || changeInfo.status === 'complete') {
        void ensureInjection(tabId);
      }
      chooseCandidateSource();
    });

    registerListener(chrome.tabs, 'onRemoved', (tabId) => {
      stateByTabId.delete(tabId);
      if (state.activeSources.includes(tabId)) {
        state.activeSources = state.activeSources.filter((id) => id !== tabId);
        state.currentSourceTabId = state.activeSources[0] ?? null;
        chooseCandidateSource();
      } else {
        chooseCandidateSource();
      }
    });

    registerListener(chrome.tabs, 'onReplaced', (addedTabId, removedTabId) => {
      stateByTabId.delete(removedTabId);
      void refreshTabSnapshot(addedTabId).then(() => chooseCandidateSource());
    });

    registerListener(chrome.webNavigation, 'onCommitted', async (details) => {
      const tab = await getTab(details.tabId);
      if (!tab || tab.windowId !== state.currentWindowId) return;
      // 主框架导航 = 新页面，重置媒体状态和 suppressed（新内容新会话）
      if (details.frameId === 0) {
        const tabState = stateByTabId.get(details.tabId);
        if (tabState) {
          tabState.suppressed = false;
          tabState.awaitingQuietAfterSuppress = false;
          tabState.metadata = null;
          tabState.hasAudibleMedia = false;
          tabState.mediaSessionActive = false;
          tabState.ended = false;
          tabState.lastMediaAt = 0;
        }
      }
      await ensureInjection(details.tabId, [details.frameId]);
      chooseCandidateSource();
    });

    chrome.runtime.onMessage.addListener((info, sender, sendResponse) => {
      void handleRuntimeMessage(info, sender);
      sendResponse({});
    });

    await refreshWindowSnapshot();
  }

  void init();
})();
