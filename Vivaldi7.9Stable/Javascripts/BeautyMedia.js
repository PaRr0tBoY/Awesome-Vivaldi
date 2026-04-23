// ==UserScript==
// @name         BeautyMedia
// @description  Universal high-stability media controller for Vivaldi.
// @version      2026.4.21.14
// @author       wyrtensi
// @credits      Special thanks to:
//               - tam710562 (Global Media Controls architecture)
//               - AstronGlitch (Tabs animated gradient logic)
//               - wysh3 (Quietify logic)
//               - PaRr0tBoy (Quietify logic, current player inspiration by vividplayer)
// Double click on tab that is playing your music to activate player.
// ==/UserScript==

(() => {
  'use strict';

  const DEFAULT_SETTINGS = {
    enabled: true,
    showPlayer: true,
    showTabsIcon: true,
    showTabGradient: true,
    defaultOnlyAccent: false,
    defaultOnlyGradient: false,
    defaultOnlyIcon: false,
    defaultAccent: '#3366ff',
    defaultIconColor: '#ffffff',
    defaultGradient1: '#7ef29d',
    defaultGradient2: '#52c2c0',
    defaultGradient3: '#39a8d3',
    defaultGradient4: '#2693e2',
    defaultGradient1_enabled: true,
    defaultGradient2_enabled: true,
    defaultGradient3_enabled: true,
    defaultGradient4_enabled: true,
    playerOpacity: 1.0,
    showPlayerShadow: true,
    playerShadowSize: 30,
    playerTheme: 'dark',
    services: [
      { id: '1', name: 'Yandex Music', host: 'yandex', accent: '#ffcc00', icon: '#ffcc00', grad1: '#ffcc00', grad2: '#ffb300', grad3: '#ff9900', grad4: '#ff8000', grad1_enabled: true, grad2_enabled: true, grad3_enabled: true, grad4_enabled: true },
      { id: '2', name: 'Spotify', host: 'spotify', accent: '#1db954', icon: '#1db954', grad1: '#1db954', grad2: '#189945', grad3: '#128236', grad4: '#0d6629', grad1_enabled: true, grad2_enabled: true, grad3_enabled: true, grad4_enabled: true },
      { id: '3', name: 'YouTube', host: 'youtube', accent: '#ff0000', icon: '#ff0000', grad1: '#ff0000', grad2: '#cc0000', grad3: '#b30000', grad4: '#990000', grad1_enabled: true, grad2_enabled: true, grad3_enabled: true, grad4_enabled: true },
      { id: '4', name: 'Deezer', host: 'deezer', accent: '#ef5464', icon: '#ef5464', grad1: '#ef5464', grad2: '#d44957', grad3: '#a63a45', grad4: '#8c3039', grad1_enabled: true, grad2_enabled: true, grad3_enabled: true, grad4_enabled: true },
      { id: '5', name: 'SoundCloud', host: 'soundcloud', accent: '#ff5500', icon: '#ff5500', grad1: '#ff5500', grad2: '#e64d00', grad3: '#b33c00', grad4: '#993300', grad1_enabled: true, grad2_enabled: true, grad3_enabled: true, grad4_enabled: true },
      { id: '6', name: 'Apple Music', host: 'apple', accent: '#fa243c', icon: '#fa243c', grad1: '#fa243c', grad2: '#d61e33', grad3: '#a81828', grad4: '#8a1320', grad1_enabled: true, grad2_enabled: true, grad3_enabled: true, grad4_enabled: true }
    ]
  };

  const state = {
    instances: new Map(), // hostname -> PlayerInstance
    persisted: {},       // hostname -> { visible, x, y }
    settings: { ...DEFAULT_SETTINGS }
  };

  const STORAGE_KEY = 'draggable-player-instances';
  const SETTINGS_KEY = 'beautymedia-settings';
  const GMC_TYPE = 'global-media-controls';
  const NAME_ATTR = 'draggable-player-active';

  // --- INTERNAL MONITOR SCRIPTS ---

  function isInjectable(url) {
    // Inject into all standard web pages universally, just like GlobalMediaControls
    return url && typeof url === 'string' && url.startsWith('http');
  }

  // Bridge Script: Runs in Isolated World to use chrome.runtime
  function bridgeScript(type) {
    if (window._dpBridgeInjected) return;
    window._dpBridgeInjected = true;

    window.addEventListener('message', (e) => {
      if (e.source !== window || !e.data || e.data.type !== type) return;
      if (e.data.isInternalMsg) return;
      chrome.runtime.sendMessage(e.data.data);
    });

    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type !== type) return;
      window.postMessage({ type: type + '-internal', data: msg, isInternalMsg: true }, '*');
    });
  }

  // Page Script: Runs in Main World to access media prototypes universally
  function monitorScript(type, attr) {
    if (window._dpMonitorInjected) return;
    window._dpMonitorInjected = true;

    let currentMedia = null;

    // 1. Intercept MediaSession Handlers (Required for universal Next/Prev track skipping)
    const _savedMsHandlers = {};
    if (navigator.mediaSession && typeof navigator.mediaSession.setActionHandler === 'function') {
      const _origSet = navigator.mediaSession.setActionHandler.bind(navigator.mediaSession);
      navigator.mediaSession.setActionHandler = function (action, handler) {
        _savedMsHandlers[action] = handler;
        return _origSet(action, handler);
      };
    }

    function getMetadata() {
      const ms = navigator.mediaSession?.metadata;
      let artwork = currentMedia?.poster || '';
      if (ms?.artwork?.length) artwork = Array.isArray(ms.artwork) ? ms.artwork[0].src : ms.artwork;
      return {
        title: ms?.title || document.title,
        artist: ms?.artist || '',
        image: artwork
      };
    }

    // 2. Pure HTML5 Reporter
    function report(media, eventType) {
      if (!media) return;

      window.postMessage({
        type: type,
        data: {
          type: type,
          mediaId: media._dpId,
          ...getMetadata(),
          paused: media.paused,
          muted: media.muted,
          volume: media.volume,
          duration: media.duration || 0, // NaN will gracefully become 0
          currentTime: media.currentTime || 0,
          eventType: eventType
        }
      }, '*');
    }

    // --- GMC Specific Media Handlers ---
    // This perfectly replicates how GlobalMediaControls filters out dummy audio tags
    function onTimeUpdate(event) {
      const media = event.target;
      let enable = media.getAttribute(attr);
      if (!media.muted) {
        enable = 'on';
        media.setAttribute(attr, enable);
      }
      if (enable) {
        // GMC Magic: Verify actual audio is being decoded. Skips Spotify's dummy tags.
        if (media.paused && !media.webkitAudioDecodedByteCount && !media.webkitVideoDecodedByteCount) {
          currentMedia = null;
        } else if (!media.paused) {
          currentMedia = media;
          report(currentMedia, event.type);
        }
      }
    }

    function onPause(event) {
      const media = event.target;
      if (media.getAttribute(attr)) {
        if (!media.webkitAudioDecodedByteCount && !media.webkitVideoDecodedByteCount) {
          currentMedia = null;
        } else {
          currentMedia = media;
          report(currentMedia, event.type);
        }
      }
    }

    function onVolumeChange(event) {
      if (currentMedia === event.target) {
        report(currentMedia, event.type);
      }
    }

    // 3. GMC-Style Prototype Hooks
    function setup(media) {
      if (!media || media._dpObserved) return;
      media._dpObserved = true;
      media._dpId = Math.random().toString(36).slice(2);
      media.setAttribute(attr, '');

      const addOrig = HTMLMediaElement.prototype.addEventListener;
      addOrig.call(media, 'play', onTimeUpdate);
      addOrig.call(media, 'timeupdate', onTimeUpdate);
      addOrig.call(media, 'playing', onTimeUpdate);
      addOrig.call(media, 'pause', onPause);
      addOrig.call(media, 'volumechange', onVolumeChange);
    }

    const playVideoOrig = HTMLVideoElement.prototype.play;
    HTMLVideoElement.prototype.play = function () {
      setup(this);
      return playVideoOrig.apply(this, arguments);
    };

    const playAudioOrig = HTMLAudioElement.prototype.play;
    HTMLAudioElement.prototype.play = function () {
      setup(this);
      return playAudioOrig.apply(this, arguments);
    };

    const addVideoOrig = HTMLVideoElement.prototype.addEventListener;
    HTMLVideoElement.prototype.addEventListener = function () {
      setup(this);
      return addVideoOrig.apply(this, arguments);
    };

    const addAudioOrig = HTMLAudioElement.prototype.addEventListener;
    HTMLAudioElement.prototype.addEventListener = function () {
      setup(this);
      return addAudioOrig.apply(this, arguments);
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach(m => m.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          if (node.tagName === 'VIDEO' || node.tagName === 'AUDIO') setup(node);
          node.querySelectorAll?.('video:not([' + attr + ']), audio:not([' + attr + '])').forEach(setup);
        }
      }));
    });
    observer.observe(document, { childList: true, subtree: true });
    document.querySelectorAll('video:not([' + attr + ']), audio:not([' + attr + '])').forEach(setup);

    // 4. Action Receiver
    window.addEventListener('message', (e) => {
      if (!e.data || e.data.type !== type + '-internal' || !e.data.data) return;
      const msg = e.data.data;

      // Transport Actions (Next/Prev)
      if (msg.action === 'next-track' || msg.action === 'previous-track') {
        const msAction = msg.action === 'next-track' ? 'nexttrack' : 'previoustrack';
        if (typeof _savedMsHandlers[msAction] === 'function') {
          try { _savedMsHandlers[msAction]({ action: msAction }); return; } catch (err) { }
        }
        const key = msg.action === 'next-track' ? 'MediaTrackNext' : 'MediaTrackPrevious';
        const init = { key, code: key, bubbles: true, cancelable: true, composed: true };
        document.dispatchEvent(new KeyboardEvent('keydown', init));
        document.dispatchEvent(new KeyboardEvent('keyup', init));
        return;
      }

      // Standard Actions (Play/Pause/Seek/Volume) applied directly to native media
      if (!currentMedia) return;
      switch (msg.action) {
        case 'play': currentMedia.play().catch(() => { }); break;
        case 'pause': currentMedia.pause(); break;
        case 'seekTo': if (!isNaN(msg.time)) currentMedia.currentTime = msg.time; break;
        case 'muted':
          if (currentMedia.volume === 0) {
            currentMedia.muted = false;
            currentMedia.volume = 1;
          } else {
            currentMedia.muted = !currentMedia.muted;
          }
          break;
        case 'volume':
          currentMedia.volume = Math.max(0, Math.min(1, msg.volume));
          currentMedia.muted = false;
          break;
      }
    });
  }

  class PlayerInstance {
    constructor(hostname, initialPos = { x: 80, y: 80, isDocked: true }) {
      this.hostname = hostname;
      this.id = `dp-instance-${hostname.replace(/[^a-z0-9]/gi, '-')}`;
      this.tabId = null;
      this.frameId = null;
      this.mediaId = null;
      this._lockedTabId = null;
      this.position = initialPos;
      this.isVisible = false;
      this.manuallyClosed = initialPos.manuallyClosed || false;
      this.hiddenByTabClose = initialPos.hiddenByTabClose || false;
      this.isDocked = initialPos.isDocked !== false; // Default to true if not set
      this.mediaData = { title: '', artist: '', poster: '', paused: true, windowId: null };

      this._suppressUpdateUntil = 0;
      this._manualSeekTargetTime = null;
      this._lastSeekRequestId = 0;
      this._trackChangeTimestamp = 0;
      this._previousTrackKey = null;

      this.createDom();
      this.initDraggable();
    }

    createDom() {
      if (document.getElementById(this.id)) return;

      const root = document.createElement('div');
      root.id = this.id;
      root.className = 'draggable-player-root';
      root.dataset.visible = 'false';
      root.innerHTML = `
        <div class="draggable-player-poster"></div>
        <div class="draggable-player-content">
          <div class="dp-nano-header">
            <div class="dp-provider-info">
              <div class="dp-favicon"></div>
              <div class="dp-provider-badge">${this.getFriendlyName(this.hostname)}</div>
            </div>
            <button class="draggable-player-close-btn" title="Close">${icons.close}</button>
          </div>
          <div class="dp-main-row">
            <div class="dp-album-art"></div>
            <div class="dp-info-stack">
              <div class="draggable-player-title">—</div>
              <div class="draggable-player-artist">...</div>
            </div>
            <div class="dp-controls-stack">
              <button class="dp-btn dp-btn-playpause playpause" title="Play/Pause">${icons.play}</button>
              <div class="draggable-player-time">0:00 / 0:00</div>
            </div>
          </div>
          <div class="dp-expanded-row">
            <div class="dp-nav-container">
              <button class="dp-btn dp-nav prev" title="Prev">${icons.prev}</button>
              <div class="draggable-player-progress-bar mid"><div class="draggable-player-progress-fill"></div></div>
              <button class="dp-btn dp-nav next" title="Next">${icons.next}</button>
            </div>
            <div class="dp-volume-container">
              <button class="dp-btn dp-small-btn unmute">${icons.mute}</button>
              <input type="range" class="dp-volume-slider" min="0" max="1" step="0.01" value="1">
            </div>
          </div>
        </div>
        <div class="draggable-player-progress-bar bot"><div class="draggable-player-progress-fill"></div></div>
      `;

      document.body.appendChild(root);
      this.el = root;
      this.el.style.setProperty('--dp-service-accent', this.getServiceAccent(this.hostname));
      this.setupListeners();
      this.applyPosition();
    }

    setupListeners() {
      const q = (s) => this.el.querySelector(s);

      this.el.addEventListener('mouseenter', () => requestAnimationFrame(autoArrangePlayers));
      this.el.addEventListener('mouseleave', () => requestAnimationFrame(autoArrangePlayers));

      q('.draggable-player-close-btn').onclick = () => this.setVisible(false, true);
      q('.playpause').onclick = () => this.togglePlay();
      q('.prev').onclick = () => this.skip(-1);
      q('.next').onclick = () => this.skip(1);
      q('.unmute').onclick = () => this.sendGmcAction('muted');

      const vol = q('.dp-volume-slider');
      if (vol) {
        vol.oninput = () => {
          const value = parseFloat(vol.value);
          this.updateVolumeVisual(value);
          this.sendGmcAction('volume', value);
        };
        this.updateVolumeVisual(parseFloat(vol.value));
      }

      const bars = this.el.querySelectorAll('.draggable-player-progress-bar');
      bars.forEach(bar => {
        const fill = bar.querySelector('.draggable-player-progress-fill');
        let seeking = false;
        let pointerId = null;

        const updateFillFromEvent = (e) => {
          const rect = bar.getBoundingClientRect();
          const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
          if (fill) fill.style.width = `${percent * 100}%`;
          return percent;
        };

        const onPointerMove = (e) => {
          if (!seeking) return;
          updateFillFromEvent(e);
        };

        const onPointerUp = (e) => {
          if (!seeking) return;
          seeking = false;
          try { bar.releasePointerCapture(pointerId); } catch (err) { }
          document.removeEventListener('pointermove', onPointerMove);
          document.removeEventListener('pointerup', onPointerUp);
          const duration = this.mediaData.duration;
          if (!duration || isNaN(duration)) return;
          const percent = updateFillFromEvent(e);
          const time = Math.max(0, Math.min(duration, percent * duration));

          this._manualSeekTargetTime = time;
          this._suppressUpdateUntil = Date.now() + 1200;
          this._lastSeekRequestId = (this._lastSeekRequestId || 0) + 1;
          this.sendGmcAction('seekTo', time);
        };

        bar.addEventListener('pointerdown', (e) => {
          if (e.button !== 0) return;
          e.stopPropagation();
          const duration = this.mediaData.duration;
          if (!duration || isNaN(duration)) return;
          seeking = true;
          pointerId = e.pointerId;
          try { bar.setPointerCapture(pointerId); } catch (err) { }
          document.addEventListener('pointermove', onPointerMove);
          document.addEventListener('pointerup', onPointerUp);
          updateFillFromEvent(e);
        });
      });
    }

    updateVolumeVisual(value) {
      const q = (s) => this.el.querySelector(s);
      const slider = q('.dp-volume-slider');
      if (!slider) return;

      const accent = this.getServiceAccent(this.hostname) || '#3366ff';
      const clamped = Math.max(0, Math.min(1, Number(value) || 0));
      this.el.style.setProperty('--dp-active-accent', accent);
      slider.style.setProperty('--dp-volume-level', clamped);
      slider.style.background = `linear-gradient(90deg, ${accent} ${clamped * 100}%, rgba(255,255,255,0.08) ${clamped * 100}%)`;
      if (accent && !accent.startsWith('var')) {
        try { slider.style.accentColor = accent; } catch (e) { }
      }
      this.updateVolumeIcon(clamped, this.mediaData.muted);
    }

    updateVolumeIcon(value, muted) {
      const btn = this.el.querySelector('.unmute');
      if (!btn) return;

      let icon = icons.volMid;
      if (muted) icon = icons.volMute;
      else if (value <= 0) icon = icons.vol0;
      else if (value < 0.33) icon = icons.volLow;
      else if (value < 0.67) icon = icons.volMid;
      else icon = icons.volHigh;

      btn.innerHTML = icon;
    }

    initDraggable() {
      const draggerAreas = this.el.querySelectorAll('.dp-nano-header, .dp-main-row, .dp-info-stack');
      let isDragging = false;
      let startX, startY;

      draggerAreas.forEach(area => {
        area.onpointerdown = (e) => {
          if (e.button !== 0 || e.target.closest('button, input, .draggable-player-progress-bar, .dp-favicon, .dp-provider-badge')) return;
          isDragging = true;
          this.isDocked = false; // User dragged it
          startX = e.clientX - this.position.x;
          startY = e.clientY - this.position.y;
          this.el.setPointerCapture(e.pointerId);
          e.stopPropagation();
        };
      });

      this.el.onpointermove = (e) => {
        if (!isDragging) return;
        this.position.x = e.clientX - startX;
        this.position.y = e.clientY - startY;
        this.applyPosition();
      };

      this.el.onpointerup = (e) => {
        if (!isDragging) return;
        isDragging = false;
        this.el.releasePointerCapture(e.pointerId);
        this.saveState();
      };

      const tabTriggers = this.el.querySelectorAll('.dp-favicon, .dp-provider-badge');
      tabTriggers.forEach(el => {
        el.onclick = (e) => {
          e.stopPropagation();
          this.focusTab();
        };
      });
    }

    focusTab() {
      if (this.tabId) {
        chrome.tabs.update(this.tabId, { active: true });
        if (this.mediaData.windowId) {
          chrome.windows.update(this.mediaData.windowId, { focused: true }).catch(() => { });
        }
        return;
      }
      chrome.tabs.query({}, (tabs) => {
        if (chrome.runtime.lastError) return;
        const host = this.hostname;
        for (const t of tabs) {
          try {
            if (!t.url) continue;
            const u = new URL(t.url);
            const h = u.hostname.replace(/^www\./i, '');
            if (h.includes(host)) {
              chrome.tabs.update(t.id, { active: true });
              if (t.windowId) chrome.windows.update(t.windowId, { focused: true }).catch(() => { });
              return;
            }
          } catch (e) { continue; }
        }
      });
    }

    getServiceConfig(host) {
      if (!host) return null;
      const h = host.toLowerCase();
      return state.settings.services.find(s => s.host && s.host.trim() !== '' && h.includes(s.host.trim().toLowerCase())) || null;
    }

    getFriendlyName(host) {
      const conf = this.getServiceConfig(host);
      return conf ? conf.name : host.toUpperCase();
    }

    getServiceAccent(host) {
      if (state.settings.defaultOnlyAccent) return state.settings.defaultAccent;
      const conf = this.getServiceConfig(host);
      return conf ? conf.accent : state.settings.defaultAccent;
    }

    getServiceIconColor(host) {
      if (state.settings.defaultOnlyIcon) return state.settings.defaultIconColor;
      const conf = this.getServiceConfig(host);
      return conf ? conf.icon : state.settings.defaultIconColor;
    }

    getServiceGradient(host) {
      let grad1 = state.settings.defaultGradient1;
      let grad2 = state.settings.defaultGradient2;
      let grad3 = state.settings.defaultGradient3;
      let grad4 = state.settings.defaultGradient4;

      let e1 = state.settings.defaultGradient1_enabled !== false;
      let e2 = state.settings.defaultGradient2_enabled !== false;
      let e3 = state.settings.defaultGradient3_enabled !== false;
      let e4 = state.settings.defaultGradient4_enabled !== false;

      if (!state.settings.defaultOnlyGradient) {
        const conf = this.getServiceConfig(host);
        if (conf) {
          grad1 = conf.grad1;
          grad2 = conf.grad2;
          grad3 = conf.grad3;
          grad4 = conf.grad4;

          e1 = conf.grad1_enabled !== false;
          e2 = conf.grad2_enabled !== false;
          e3 = conf.grad3_enabled !== false;
          e4 = conf.grad4_enabled !== false;
        }
      }

      const activeColors = [];
      if (e1 && grad1) activeColors.push(grad1);
      if (e2 && grad2) activeColors.push(grad2);
      if (e3 && grad3) activeColors.push(grad3);
      if (e4 && grad4) activeColors.push(grad4);

      // Ensure we always have at least 2 colors for a gradient to work
      if (activeColors.length === 0) activeColors.push('#7ef29d', '#2693e2');
      if (activeColors.length === 1) activeColors.push(activeColors[0]);

      // Calculate evenly spaced stops + closing loop
      activeColors.push(activeColors[0]); // Complete the loop
      const count = activeColors.length;

      const stops = activeColors.map((color, idx) => {
          const percent = (idx / (count - 1)) * 100;
          return `${color} ${percent}%`;
      }).join(', ');

      return stops;
    }

    applyServiceStyles(tabId) {
      if (!this.el) return;
      const accent = this.getServiceAccent(this.hostname);
      const iconColor = this.getServiceIconColor(this.hostname);
      const gradientStops = this.getServiceGradient(this.hostname);

      // Apply to player UI
      this.el.style.setProperty('--dp-service-accent', accent);
      this.el.style.setProperty('--dp-active-accent', accent);
      const fills = this.el.querySelectorAll('.draggable-player-progress-fill');
      fills.forEach(f => f.style.background = accent);

      // Apply to tab UI via tabId ONLY
      if (tabId) {
        const tabEl = document.querySelector(`.tab-wrapper[data-id="tab-${tabId}"]`) || document.querySelector(`#tab-${tabId}`);
        if (tabEl) {
          tabEl.style.setProperty('--bm-icon-color', iconColor);
          tabEl.style.setProperty('--bm-icon-color-hover', iconColor);

          let styleTag = document.getElementById(`bm-style-tab-${tabId}`);
          if (!styleTag) {
              styleTag = document.createElement('style');
              styleTag.id = `bm-style-tab-${tabId}`;
              document.head.appendChild(styleTag);
          }

          // Target the ::after of the tab-position containing this tab by leveraging CSS :has to match the unique tab ID inside the generic position node
          const tabPosition = tabEl.closest('.tab-position');

          const isAudioOn = tabEl.classList.contains('audio-on') || tabEl.querySelector('.audio-on');

          if (isAudioOn) {
              if (tabPosition) {
                  // Use both id and data-id to account for vivaldi recycling wrappers
                  styleTag.textContent = `
                      html.beautymedia-tabs-animation-enabled .tab-position:has([id="tab-${tabId}"].audio-on):not(:has(.active))::after,
                      html.beautymedia-tabs-animation-enabled .tab-position:has([id="tab-${tabId}"] .audio-on):not(:has(.active))::after,
                      html.beautymedia-tabs-animation-enabled .tab-position:has([data-id="tab-${tabId}"].audio-on):not(:has(.active))::after,
                      html.beautymedia-tabs-animation-enabled .tab-position:has([data-id="tab-${tabId}"] .audio-on):not(:has(.active))::after {
                          background: conic-gradient(from var(--dp-deg) at center, ${gradientStops}) !important;
                      }
                  `;
              } else {
                  styleTag.textContent = `
                      html.beautymedia-tabs-animation-enabled .tab[id="tab-${tabId}"].audio-on:not(.active)::after,
                      html.beautymedia-tabs-animation-enabled .tab[data-id="tab-${tabId}"].audio-on:not(.active)::after,
                      html.beautymedia-tabs-animation-enabled .tab-wrapper[id="tab-${tabId}"].audio-on:not(.active)::after,
                      html.beautymedia-tabs-animation-enabled .tab-wrapper[data-id="tab-${tabId}"].audio-on:not(.active)::after {
                          background: conic-gradient(from var(--dp-deg) at center, ${gradientStops}) !important;
                      }
                  `;
              }
          } else {
              styleTag.textContent = '';
          }
        }
      }
    }

    resetToDefaultPosition() {
      if (!this.el) return;
      this.isDocked = true;
      this.saveState();
      autoArrangePlayers();
    }

    applyPosition(skipTransition = false) {
      if (!this.el) return;

      if (skipTransition) {
        this.el.style.transition = 'none';
      }

      const w = 360;
      const h = 100;

      const maxX = window.innerWidth - w;
      const maxY = window.innerHeight - h;

      const x = Math.max(0, Math.min(maxX, this.position.x));
      const y = Math.max(0, Math.min(maxY, this.position.y));

      this.position.x = x;
      this.position.y = y;

      this.el.style.left = `${x}px`;
      
      if (y > window.innerHeight / 2) {
        this.el.style.top = 'auto';
        this.el.style.bottom = `${window.innerHeight - y - h}px`;
      } else {
        this.el.style.top = `${y}px`;
        this.el.style.bottom = 'auto';
      }

      if (skipTransition) {
        clearTimeout(this._transitionTimeout);
        this._transitionTimeout = setTimeout(() => {
          if (this.el) this.el.style.transition = '';
        }, 50);
      }
    }

    setVisible(visible, manual = false, skipTransition = false) {
      this.isVisible = visible;
      this.el.dataset.visible = visible ? 'true' : 'false';
      if (manual && !visible) {
        this.manuallyClosed = true;
        this.hiddenByTabClose = false;
      } else if (visible) {
        this.manuallyClosed = false;
        this.hiddenByTabClose = false;
      }
      this.saveState();
      if (visible) {
          if (this.isDocked) autoArrangePlayers(skipTransition);
          else this.applyPosition(skipTransition);
      } else {
          autoArrangePlayers();
      }
    }

    update(data, tabId, frameId, windowId) {
      if (this._lockedTabId && tabId !== this._lockedTabId) return;

      const now = Date.now();
      const q = (s) => this.el.querySelector(s);
      const trackKey = (data.title || data.artist) ? `${data.title || ''}|${data.artist || ''}` : null;
      const currentKey = `${this.mediaData.title || ''}|${this.mediaData.artist || ''}`;

      // CRITICAL FIX: Ignore empty 'virtual-audio' heartbeats from the top frame 
      // if we are already successfully tracking a real hidden <audio> tag.
      if (data.mediaId === 'virtual-audio' && this.mediaId && this.mediaId !== 'virtual-audio') {
        if (trackKey === currentKey) return; // Discard ghost heartbeat
      }

      if (this.mediaId && data.mediaId && data.mediaId !== this.mediaId) {
        if (this._mediaIdChangeTimestamp && (now - this._mediaIdChangeTimestamp < 3000)) return;
      }
      if (trackKey && this._previousTrackKey === trackKey && (now - this._trackChangeTimestamp < 3000)) return;

      let isHardTrackChange = (trackKey && trackKey !== currentKey) || (data.mediaId && data.mediaId !== this.mediaId);

      if (isHardTrackChange) {
        this.mediaId = data.mediaId;
        this._mediaIdChangeTimestamp = now;
        this._previousTrackKey = currentKey;
        this._trackChangeTimestamp = now;
        this._manualSeekTargetTime = null;
        this._suppressUpdateUntil = 0;
        this.mediaData.currentTime = 0;
        this.mediaData.duration = data.duration || 0;
        const fills = this.el.querySelectorAll('.draggable-player-progress-fill');
        fills.forEach(fill => fill.style.width = '0%');
        const timeEl = q('.draggable-player-time');
        if (timeEl) timeEl.textContent = '0:00 / 0:00';
      }

      this.tabId = tabId;
      this.frameId = frameId;
      this.mediaData = { ...this.mediaData, ...data, windowId };

      const titleEl = q('.draggable-player-title');
      if (titleEl) titleEl.textContent = this.mediaData.title || '—';
      const artistEl = q('.draggable-player-artist');
      if (artistEl) artistEl.textContent = this.mediaData.artist || (this.mediaData.title ? this.hostname : 'Waiting for media...');

      if (data.paused !== undefined) {
        const pp = q('.playpause');
        if (pp) pp.innerHTML = data.paused ? icons.play : icons.pause;

        if (!data.paused && this.hiddenByTabClose && !this.manuallyClosed) {
            this.hiddenByTabClose = false;
            this.setVisible(true);
        }
      }
      if (data.muted !== undefined) {
        this.updateVolumeIcon(this.mediaData.volume, data.muted);
      }
      if (data.volume !== undefined) {
        const slider = q('.dp-volume-slider');
        if (slider && !slider.matches(':active')) slider.value = data.volume;
        this.updateVolumeVisual(data.volume);
      }

      if (this.mediaData.currentTime !== undefined && this.mediaData.duration) {
        const timeEl = q('.draggable-player-time');
        if (this._suppressUpdateUntil && now < this._suppressUpdateUntil) {
          const displayTime = (this._manualSeekTargetTime !== null && !isNaN(this._manualSeekTargetTime)) ? this._manualSeekTargetTime : this.mediaData.currentTime;
          const percent = (displayTime / this.mediaData.duration) * 100;
          const fills = this.el.querySelectorAll('.draggable-player-progress-fill');
          fills.forEach(fill => fill.style.width = `${percent}%`);
          if (timeEl) timeEl.textContent = `${this.formatTime(displayTime)} / ${this.formatTime(this.mediaData.duration)}`;
        } else {
          const percent = (this.mediaData.currentTime / this.mediaData.duration) * 100;
          const fills = this.el.querySelectorAll('.draggable-player-progress-fill');
          fills.forEach(fill => fill.style.width = `${percent}%`);
          if (timeEl) timeEl.textContent = `${this.formatTime(this.mediaData.currentTime)} / ${this.formatTime(this.mediaData.duration)}`;
          this._manualSeekTargetTime = null;
          this._suppressUpdateUntil = 0;
        }
      }

      if (data.image) {
        const poster = q('.draggable-player-poster');
        const art = q('.dp-album-art');
        if (poster) poster.style.backgroundImage = `url(${data.image})`;
        if (art) art.style.backgroundImage = `url(${data.image})`;
      }

      this.applyServiceStyles(tabId);

      if (tabId) {
        chrome.tabs.get(tabId, (tab) => {
          if (chrome.runtime.lastError || !tab || !tab.favIconUrl) return;
          const fav = q('.dp-favicon');
          if (fav) fav.style.backgroundImage = `url(${tab.favIconUrl})`;
        });
      }
    }

    formatTime(seconds) {
      if (!seconds || isNaN(seconds)) return '0:00';
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${m}:${s.toString().padStart(2, '0')}`;
    }

    togglePlay() {
      this.sendGmcAction(this.mediaData.paused ? 'play' : 'pause');
    }

    skip(direction) {
      this.sendGmcAction(direction > 0 ? 'next-track' : 'previous-track');
    }

    sendGmcAction(action, value = null) {
      if (!this.tabId) return;

      const payload = {
        type: GMC_TYPE,
        action: action,
        tabId: this.tabId,
        frameId: this.frameId,
        volume: value,
        time: (action === 'seekTo') ? value : null
      };

      // Next and Previous tracks are Web App commands. They go to the top frame (0).
      if (action === 'next-track' || action === 'previous-track') {
        chrome.tabs.sendMessage(this.tabId, payload, { frameId: 0 });
      }
      // Play, Pause, Seek, and Volume are Media commands. They go straight to the audio's specific iframe.
      else {
        if (this.frameId !== null && this.frameId !== undefined) {
          chrome.tabs.sendMessage(this.tabId, payload, { frameId: this.frameId });
        } else {
          chrome.tabs.sendMessage(this.tabId, payload);
        }
      }
    }

    saveState() {
      state.persisted[this.hostname] = {
        visible: this.isVisible,
        x: parseInt(this.el.style.left),
        y: parseInt(this.el.style.top),
        manuallyClosed: this.manuallyClosed,
        hiddenByTabClose: this.hiddenByTabClose
      };
      chrome.storage.local.set({ [STORAGE_KEY]: state.persisted });
    }

    hideForTabClose() {
      this.hiddenByTabClose = true;
      this.tabId = null;
      this._lockedTabId = null;
      this.setVisible(false);
    }
  }

  const icons = {
    play: '<svg viewBox="0 0 24 24"><path d="M8,5.14V19.14L19,12.14L8,5.14Z"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M14,19H18V5H14M6,19H10V5H6V19Z"/></svg>',
    prev: '<svg viewBox="0 0 24 24"><path d="M6,18V6H8V18H6M9.5,12L18,6V18L9.5,12Z"/></svg>',
    next: '<svg viewBox="0 0 24 24"><path d="M16,18H18V6H16V18M6,18L14.5,12L6,6V18Z"/></svg>',
    volMute: '<svg viewBox="0 0 24 24"><path d="M12,4L9.91,6.09L12,8.18M4.27,3L3,4.27L7.73,9H3V15H7L12,20V13.27L16.25,17.53C15.58,18.04 14.83,18.46 14,18.7V20.77C15.38,20.45 16.63,19.82 17.68,18.96L19.73,21L21,19.73L12,10.73M19,12C19,12.94 18.8,13.82 18.46,14.64L19.97,16.15C20.62,14.91 21,13.5 21,12C21,7.72 18,4.14 14,3.23V5.29C16.89,6.15 19,8.83 19,12M16.5,12C16.5,10.23 15.5,8.71 14,7.97V10.18L16.45,12.63C16.5,12.43 16.5,12.21 16.5,12Z"/></svg>',
    vol0: '<svg viewBox="0 0 24 24"><path d="M3,9V15H7L12,20V4L7,9H3Z"/></svg>',
    volLow: '<svg viewBox="0 0 24 24"><path d="M3,9V15H7L12,20V4L7,9H3M14,10.5 c0.8,0.8,0.8,2.2,0,3l0.7,0.7c1.2-1.2,1.2-3.2,0-4.4 Z"/></svg>',
    volMid: '<svg viewBox="0 0 24 24"><path d="M3,9V15H7L12,20V4L7,9H3M14,10.5c0.8,0.8,0.8,2.2,0,3l0.7,0.7c1.2-1.2,1.2-3.2,0-4.4zM16.5,8.5c1.9,1.9,1.9,5.1,0,7l0.7,0.7c2.3-2.3,2.3-6.1,0-8.4z"/></svg>',
    volHigh: '<svg viewBox="0 0 24 24"><path d="M3,9V15H7L12,20V4L7,9H3M14,10.5c0.8,0.8,0.8,2.2,0,3l0.7,0.7c1.2-1.2,1.2-3.2,0-4.4zM16.5,8.5c1.9,1.9,1.9,5.1,0,7l0.7,0.7c2.3-2.3,2.3-6.1,0-8.4zM19,6.5c2.9,2.9,2.9,8.1,0,11l0.7,0.7c3.3-3.3,3.3-9.1,0-12.4z"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/></svg>'
  };

  function getGlobalGradientStops() {
      const s = state.settings;
      let grad1 = s.defaultGradient1;
      let grad2 = s.defaultGradient2;
      let grad3 = s.defaultGradient3;
      let grad4 = s.defaultGradient4;

      let e1 = s.defaultGradient1_enabled !== false;
      let e2 = s.defaultGradient2_enabled !== false;
      let e3 = s.defaultGradient3_enabled !== false;
      let e4 = s.defaultGradient4_enabled !== false;

      const activeColors = [];
      if (e1 && grad1) activeColors.push(grad1);
      if (e2 && grad2) activeColors.push(grad2);
      if (e3 && grad3) activeColors.push(grad3);
      if (e4 && grad4) activeColors.push(grad4);

      if (activeColors.length === 0) activeColors.push('#7ef29d', '#2693e2');
      if (activeColors.length === 1) activeColors.push(activeColors[0]);

      activeColors.push(activeColors[0]);
      const count = activeColors.length;

      return activeColors.map((color, idx) => {
          const percent = (idx / (count - 1)) * 100;
          return `${color} ${percent}%`;
      }).join(', ');
  }

  function applySettings() {
    const root = document.documentElement;
    const s = state.settings;
    if (s.enabled) {
      root.classList.add('beautymedia-enabled');
    } else {
      root.classList.remove('beautymedia-enabled');
    }

    if (s.enabled && s.showPlayer) {
      root.classList.add('beautymedia-player-enabled');
    } else {
      root.classList.remove('beautymedia-player-enabled');
    }

    if (s.enabled && s.showTabsIcon) {
      root.classList.add('beautymedia-tabs-icon-enabled');
    } else {
      root.classList.remove('beautymedia-tabs-icon-enabled');
    }

    if (s.enabled && s.showTabGradient) {
      root.classList.add('beautymedia-tabs-animation-enabled');
    } else {
      root.classList.remove('beautymedia-tabs-animation-enabled');
    }

    // Apply global default styles
    root.style.setProperty('--bm-icon-color', s.defaultIconColor || '#ffffff');
    root.style.setProperty('--bm-icon-color-hover', s.defaultIconColor || '#ffffff');
    root.style.setProperty('--bm-player-opacity', s.playerOpacity !== undefined ? s.playerOpacity : 1.0);

    let shadowVal = 'none';
    if (s.showPlayerShadow !== false) {
        const size = s.playerShadowSize !== undefined ? s.playerShadowSize : 30;
        shadowVal = `0 12px ${size}px rgba(0, 0, 0, 0.6)`;
    }
    root.style.setProperty('--bm-player-shadow', shadowVal);

    let isLight = false;
    if (s.playerTheme === 'light') {
        isLight = true;
    } else if (s.playerTheme === 'system') {
        isLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    }

    if (isLight) {
        root.style.setProperty('--bm-dp-glass-bg', 'rgba(255, 255, 255, 0.90)');
        root.style.setProperty('--bm-dp-glass-border', 'rgba(0, 0, 0, 0.12)');
        root.style.setProperty('--bm-dp-text', '#000000');
        root.style.setProperty('--bm-dp-text-dim', 'rgba(0, 0, 0, 0.6)');
        root.style.setProperty('--bm-dp-progress-bg', 'rgba(0, 0, 0, 0.15)');
    } else {
        root.style.setProperty('--bm-dp-glass-bg', 'rgba(18, 20, 26, 0.96)');
        root.style.setProperty('--bm-dp-glass-border', 'rgba(255, 255, 255, 0.12)');
        root.style.setProperty('--bm-dp-text', '#ffffff');
        root.style.setProperty('--bm-dp-text-dim', 'rgba(255, 255, 255, 0.5)');
        root.style.setProperty('--bm-dp-progress-bg', 'rgba(255, 255, 255, 0.15)');
    }

    let styleTag = document.getElementById('bm-style-global');
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'bm-style-global';
        document.head.appendChild(styleTag);
    }
    const globalStops = getGlobalGradientStops();
    styleTag.textContent = `html.beautymedia-tabs-animation-enabled .tab-position:has(.tab.audio-on):not(:has(.active))::after { background: conic-gradient(from var(--dp-deg) at center, ${globalStops}) !important; }`;

    if (!s.enabled || !s.showPlayer) {
      state.instances.forEach(inst => {
        if (inst.isVisible) inst.setVisible(false);
      });
    }

    state.instances.forEach(inst => {
      inst.applyServiceStyles(inst.tabId);
    });
  }
function saveSettings() {
    chrome.storage.local.set({ [SETTINGS_KEY]: state.settings });
  }

  function loadFromStorage() {
    chrome.storage.local.get([STORAGE_KEY, SETTINGS_KEY], (res) => {
      state.persisted = res[STORAGE_KEY] || {};
      state.settings = { ...DEFAULT_SETTINGS, ...(res[SETTINGS_KEY] || {}) };

      // Data migration: ensure missing gradient colors and toggles are filled
      if (state.settings.services) {
          state.settings.services.forEach(srv => {
              if (srv.grad1 === undefined || srv.grad1 === '') srv.grad1 = state.settings.defaultGradient1;
              if (srv.grad2 === undefined || srv.grad2 === '') srv.grad2 = state.settings.defaultGradient2;
              if (srv.grad3 === undefined || srv.grad3 === '') srv.grad3 = state.settings.defaultGradient3;
              if (srv.grad4 === undefined || srv.grad4 === '') srv.grad4 = state.settings.defaultGradient4;

              if (srv.grad1_enabled === undefined) srv.grad1_enabled = true;
              if (srv.grad2_enabled === undefined) srv.grad2_enabled = true;
              if (srv.grad3_enabled === undefined) srv.grad3_enabled = true;
              if (srv.grad4_enabled === undefined) srv.grad4_enabled = true;
          });
      }

      // Also migrate default enablements if missing
      if (state.settings.defaultGradient1_enabled === undefined) state.settings.defaultGradient1_enabled = true;
      if (state.settings.defaultGradient2_enabled === undefined) state.settings.defaultGradient2_enabled = true;
      if (state.settings.defaultGradient3_enabled === undefined) state.settings.defaultGradient3_enabled = true;
      if (state.settings.defaultGradient4_enabled === undefined) state.settings.defaultGradient4_enabled = true;
      if (state.settings.playerOpacity === undefined) state.settings.playerOpacity = 1.0;
      if (state.settings.showPlayerShadow === undefined) state.settings.showPlayerShadow = true;
      if (state.settings.playerShadowSize === undefined) state.settings.playerShadowSize = 30;
      if (state.settings.playerTheme === undefined) state.settings.playerTheme = 'dark';
      if (state.settings.defaultPlayerPosition === undefined) state.settings.defaultPlayerPosition = 'bottom-right';

      applySettings();

      if (state.settings.enabled && state.settings.showPlayer) {
        Object.keys(state.persisted).forEach(host => {
          if (state.persisted[host].visible) getInstanceForHost(host).setVisible(true, false, true);
        });
      }
    });
  }

  function injectBeautyMediaSettings(targetSection) {
    if (!targetSection || document.querySelector('.bm-setting-group')) return;

    const group = document.createElement('div');
    group.className = 'setting-section bm-setting-group';

    const s = state.settings;

    group.innerHTML = `
      <style>
        .bm-setting-group { margin-top: 24px; border-top: 1px solid var(--colorBorderSubtle); padding-top: 18px; font-size: 13px; color: var(--colorFg); width: 100%; box-sizing: border-box; max-width: 100%; overflow-x: hidden; }
        .bm-title { font-size: 15px; font-weight: 600; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
        .bm-section { margin-bottom: 24px; }
        .bm-section-header { font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--colorFgFaded); margin-bottom: 8px; border-bottom: 1px solid var(--colorBorderSubtle); padding-bottom: 4px; }
        .bm-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--colorBorderSubtle); gap: 16px; }
        .bm-row:last-child { border-bottom: none; }
        .bm-row-label { flex: 1; min-width: 120px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 8px; }
        .bm-row-controls { display: flex; align-items: center; gap: 12px; }
        .bm-row-controls label { display: flex; align-items: center; gap: 6px; cursor: pointer; white-space: nowrap; margin: 0; }
        .bm-input-text, .bm-select { background: var(--colorBgDark); border: 1px solid var(--colorBorderSubtle); color: var(--colorFg); padding: 4px 8px; border-radius: var(--radius); font-size: 12px; box-sizing: border-box; height: 26px; }
        .bm-select { padding: 4px 6px; }
        .bm-color { width: 24px; height: 24px; padding: 0; border: 1px solid var(--colorBorder); border-radius: 4px; cursor: pointer; background: transparent; flex-shrink: 0; }
        .bm-range { width: 100px; margin: 0; }
        .bm-btn { background: var(--colorBgDark); border: 1px solid var(--colorBorderSubtle); color: var(--colorFg); padding: 4px 12px; border-radius: var(--radius); cursor: pointer; font-size: 12px; font-weight: 600; }
        .bm-btn:hover { background: var(--colorBgDarker); }
        .bm-btn-primary { background: var(--colorHighlightBg); color: var(--colorHighlightFg); border: none; }
        .bm-btn-primary:hover { opacity: 0.9; }
        .bm-btn-danger { color: #ff5555; border-color: rgba(255,85,85,0.3); }
        .bm-btn-danger:hover { background: rgba(255, 85, 85, 0.1); border-color: #ff5555; }

        .bm-table-wrap { overflow-y: auto; overflow-x: hidden; max-height: 400px; max-width: 100%; border: 1px solid var(--colorBorderSubtle); border-radius: var(--radius); margin-top: 8px; padding-right: 4px; box-sizing: border-box; }
        .bm-sites-grid { display: grid; grid-template-columns: minmax(40px, 1fr) minmax(50px, 1.5fr) 24px 24px 90px 40px; gap: 4px; align-items: center; width: 100%; }
        .bm-sites-header { padding: 8px; font-size: 10px; color: var(--colorFgFaded); text-transform: uppercase; border-bottom: 1px solid var(--colorBorderSubtle); font-weight: 600; background: var(--colorBgDark); }
        .bm-site-row { padding: 4px; border-bottom: 1px solid var(--colorBorderSubtle); }
        .bm-site-row:last-child { border-bottom: none; }
        .bm-site-row input[type="text"] { width: 100%; box-sizing: border-box; min-width: 0; font-size: 11px; padding: 2px; }
        .bm-grad-cell { display: flex; gap: 4px; align-items: center; justify-content: flex-start; }
        .bm-grad-stack { display: flex; flex-direction: column; align-items: center; gap: 2px; }
        .bm-grad-stack input[type="checkbox"] { margin: 0; }
        .bm-grad-stack input[type="color"] { width: 18px; height: 18px; padding: 0; border: 1px solid var(--colorBorder); border-radius: 4px; cursor: pointer; background: transparent; }
        </style>      
      <div class="bm-title">
        <span>Beauty Media Settings</span>
        <span id="bm-save-indicator" style="font-size: 12px; opacity: 0; transition: opacity 0.3s; color: var(--colorHighlightBg); font-weight: normal;">Saved</span>
      </div>

      <div class="bm-section">
        <div class="bm-section-header">Global Behavior</div>
        <div class="bm-row">
          <div class="bm-row-label">Enable Beauty Media</div>
          <div class="bm-row-controls"><input type="checkbox" id="bm-setting-enabled" ${s.enabled ? 'checked' : ''}></div>
        </div>
        <div class="bm-row">
          <div class="bm-row-label">Show media player</div>
          <div class="bm-row-controls"><input type="checkbox" id="bm-setting-show-player" ${s.showPlayer ? 'checked' : ''}></div>
        </div>
        <div class="bm-row">
          <div class="bm-row-label">Tab audio icon colors</div>
          <div class="bm-row-controls"><input type="checkbox" id="bm-setting-tabs-icon" ${s.showTabsIcon ? 'checked' : ''}></div>
        </div>
        <div class="bm-row">
          <div class="bm-row-label">Tab animated gradient</div>
          <div class="bm-row-controls"><input type="checkbox" id="bm-setting-tabs-gradient" ${s.showTabGradient ? 'checked' : ''}></div>
        </div>
        <div class="bm-row">
          <div class="bm-row-label">Player theme</div>
          <div class="bm-row-controls">
            <select id="bm-setting-player-theme" class="bm-select">
                <option value="system" ${s.playerTheme === 'system' ? 'selected' : ''}>System</option>
                <option value="dark" ${s.playerTheme === 'dark' ? 'selected' : ''}>Dark</option>
                <option value="light" ${s.playerTheme === 'light' ? 'selected' : ''}>Light</option>
            </select>
          </div>
        </div>
        <div class="bm-row">
          <div class="bm-row-label">Default position</div>
          <div class="bm-row-controls">
            <select id="bm-setting-def-pos" class="bm-select">
                <option value="top-left" ${s.defaultPlayerPosition === 'top-left' ? 'selected' : ''}>Top Left</option>
                <option value="top-center" ${s.defaultPlayerPosition === 'top-center' ? 'selected' : ''}>Top Center</option>
                <option value="top-right" ${s.defaultPlayerPosition === 'top-right' ? 'selected' : ''}>Top Right</option>
                <option value="middle-left" ${s.defaultPlayerPosition === 'middle-left' ? 'selected' : ''}>Middle Left</option>
                <option value="center" ${s.defaultPlayerPosition === 'center' ? 'selected' : ''}>Center</option>
                <option value="middle-right" ${s.defaultPlayerPosition === 'middle-right' ? 'selected' : ''}>Middle Right</option>
                <option value="bottom-left" ${s.defaultPlayerPosition === 'bottom-left' ? 'selected' : ''}>Bottom Left</option>
                <option value="bottom-center" ${s.defaultPlayerPosition === 'bottom-center' ? 'selected' : ''}>Bottom Center</option>
                <option value="bottom-right" ${s.defaultPlayerPosition === 'bottom-right' ? 'selected' : ''}>Bottom Right (Default)</option>
            </select>
          </div>
        </div>
        <div class="bm-row">
          <div class="bm-row-label">Idle opacity (<span id="bm-opacity-val">${s.playerOpacity}</span>)</div>
          <div class="bm-row-controls"><input type="range" id="bm-setting-player-opacity" class="bm-range" min="0" max="1" step="0.05" value="${s.playerOpacity}"></div>
        </div>
        <div class="bm-row">
          <div class="bm-row-label">Player shadow</div>
          <div class="bm-row-controls"><input type="checkbox" id="bm-setting-show-shadow" ${s.showPlayerShadow ? 'checked' : ''}></div>
        </div>
        <div class="bm-row" style="${!s.showPlayerShadow ? 'opacity: 0.5; pointer-events: none;' : ''}" id="bm-shadow-size-container">
          <div class="bm-row-label">Shadow size (<span id="bm-shadow-size-val">${s.playerShadowSize}px</span>)</div>
          <div class="bm-row-controls"><input type="range" id="bm-setting-player-shadow-size" class="bm-range" min="0" max="100" step="1" value="${s.playerShadowSize}"></div>
        </div>
      </div>

      <div class="bm-section">
        <div class="bm-section-header">Default Colors (Fallback)</div>
        <div class="bm-row">
          <div class="bm-row-label">Default Accent</div>
          <div class="bm-row-controls">
            <label><input type="checkbox" id="bm-setting-def-only-accent" ${s.defaultOnlyAccent ? 'checked' : ''}> Force</label>
            <input type="color" class="bm-color" id="bm-setting-def-accent" value="${s.defaultAccent}">
          </div>
        </div>
        <div class="bm-row">
          <div class="bm-row-label">Default Tab Icon</div>
          <div class="bm-row-controls">
            <label><input type="checkbox" id="bm-setting-def-only-icon" ${s.defaultOnlyIcon ? 'checked' : ''}> Force</label>
            <input type="color" class="bm-color" id="bm-setting-def-icon" value="${s.defaultIconColor}">
          </div>
        </div>
        <div class="bm-row">
          <div class="bm-row-label">Default Gradient</div>
          <div class="bm-row-controls">
            <label style="margin-right: 8px;"><input type="checkbox" id="bm-setting-def-only-gradient" ${s.defaultOnlyGradient ? 'checked' : ''}> Force</label>
            <div class="bm-grad-cell">
                <div class="bm-grad-stack"><input type="color" id="bm-setting-def-grad1" value="${s.defaultGradient1}"><input type="checkbox" id="bm-setting-def-grad1-en" ${s.defaultGradient1_enabled ? 'checked' : ''}></div>
                <div class="bm-grad-stack"><input type="color" id="bm-setting-def-grad2" value="${s.defaultGradient2}"><input type="checkbox" id="bm-setting-def-grad2-en" ${s.defaultGradient2_enabled ? 'checked' : ''}></div>
                <div class="bm-grad-stack"><input type="color" id="bm-setting-def-grad3" value="${s.defaultGradient3}"><input type="checkbox" id="bm-setting-def-grad3-en" ${s.defaultGradient3_enabled ? 'checked' : ''}></div>
                <div class="bm-grad-stack"><input type="color" id="bm-setting-def-grad4" value="${s.defaultGradient4}"><input type="checkbox" id="bm-setting-def-grad4-en" ${s.defaultGradient4_enabled ? 'checked' : ''}></div>
            </div>
          </div>
        </div>
      </div>

      <div class="bm-section">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div class="bm-section-header" style="margin: 0; border: none; padding: 0;">Domain Manager</div>
          <button id="bm-add-service-btn" class="bm-btn bm-btn-primary">+ Add Site</button>
        </div>
        
        <div class="bm-table-wrap">
          <div class="bm-sites-grid bm-sites-header">
            <div>Name</div>
            <div>Domain</div>
            <div title="Accent">Acc</div>
            <div title="Tab Icon">Ico</div>
            <div>Gradients</div>
            <div></div>
          </div>
          <div id="bm-services-container"></div>
        </div>
      </div>

      <div style="text-align: right; margin-top: 32px;">
          <button id="bm-reset-settings-btn" class="bm-btn bm-btn-danger">Reset to Defaults</button>
      </div>
    `;

    targetSection.appendChild(group);

    const indicator = group.querySelector('#bm-save-indicator');
    const showSaveIndicator = () => {
      if (!indicator) return;
      indicator.style.opacity = '1';
      setTimeout(() => {
        if (indicator) indicator.style.opacity = '0';
      }, 1000);
    };

    const updateCheck = (id, key) => {
      const el = group.querySelector(`#${id}`);
      if (!el) return;
      el.addEventListener('change', (e) => {
        state.settings[key] = e.target.checked;
        saveSettings();
        applySettings();
        showSaveIndicator();
      });
    };

    const updateColor = (id, key) => {
      const el = group.querySelector(`#${id}`);
      if (!el) return;
      el.addEventListener('input', (e) => {
        state.settings[key] = e.target.value;
        applySettings();
      });
      el.addEventListener('change', (e) => {
        state.settings[key] = e.target.value;
        saveSettings();
        applySettings();
        showSaveIndicator();
      });
    };

    updateCheck('bm-setting-enabled', 'enabled');
    updateCheck('bm-setting-show-player', 'showPlayer');
    updateCheck('bm-setting-tabs-icon', 'showTabsIcon');
    updateCheck('bm-setting-tabs-gradient', 'showTabGradient');

    const themeSelect = group.querySelector('#bm-setting-player-theme');
    if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
            state.settings.playerTheme = e.target.value;
            saveSettings();
            applySettings();
            showSaveIndicator();
        });
    }

    const posSelect = group.querySelector('#bm-setting-def-pos');
    if (posSelect) {
        posSelect.addEventListener('change', (e) => {
            state.settings.defaultPlayerPosition = e.target.value;
            saveSettings();
            showSaveIndicator();
        });
    }

    const opacityRange = group.querySelector('#bm-setting-player-opacity');
    const opacityVal = group.querySelector('#bm-opacity-val');
    if (opacityRange) {
        opacityRange.addEventListener('input', (e) => {
            if (opacityVal) opacityVal.textContent = e.target.value;
        });
        opacityRange.addEventListener('change', (e) => {
            state.settings.playerOpacity = parseFloat(e.target.value);
            saveSettings();
            applySettings();
            showSaveIndicator();
        });
    }

    const shadowCheck = group.querySelector('#bm-setting-show-shadow');
    const shadowContainer = group.querySelector('#bm-shadow-size-container');
    if (shadowCheck) {
        shadowCheck.addEventListener('change', (e) => {
            state.settings.showPlayerShadow = e.target.checked;
            if (shadowContainer) {
                shadowContainer.style.opacity = e.target.checked ? '1' : '0.5';
                shadowContainer.style.pointerEvents = e.target.checked ? 'auto' : 'none';
            }
            saveSettings();
            applySettings();
            showSaveIndicator();
        });
    }

    const shadowSizeRange = group.querySelector('#bm-setting-player-shadow-size');
    const shadowSizeVal = group.querySelector('#bm-shadow-size-val');
    if (shadowSizeRange) {
        shadowSizeRange.addEventListener('input', (e) => {
            if (shadowSizeVal) shadowSizeVal.textContent = e.target.value + 'px';
        });
        shadowSizeRange.addEventListener('change', (e) => {
            state.settings.playerShadowSize = parseInt(e.target.value, 10);
            saveSettings();
            applySettings();
            showSaveIndicator();
        });
    }
    updateCheck('bm-setting-def-only-accent', 'defaultOnlyAccent');
    updateCheck('bm-setting-def-only-icon', 'defaultOnlyIcon');
    updateCheck('bm-setting-def-only-gradient', 'defaultOnlyGradient');

    updateColor('bm-setting-def-accent', 'defaultAccent');
    updateColor('bm-setting-def-icon', 'defaultIconColor');
    updateCheck('bm-setting-def-grad1-en', 'defaultGradient1_enabled');
    updateCheck('bm-setting-def-grad2-en', 'defaultGradient2_enabled');
    updateCheck('bm-setting-def-grad3-en', 'defaultGradient3_enabled');
    updateCheck('bm-setting-def-grad4-en', 'defaultGradient4_enabled');

    updateColor('bm-setting-def-grad1', 'defaultGradient1');
    updateColor('bm-setting-def-grad2', 'defaultGradient2');
    updateColor('bm-setting-def-grad3', 'defaultGradient3');
    updateColor('bm-setting-def-grad4', 'defaultGradient4');


    const resetBtn = group.querySelector('#bm-reset-settings-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:999999;display:flex;align-items:center;justify-content:center;';

            const modal = document.createElement('div');
            modal.style.cssText = 'background:var(--colorBgDark, #2d2d2d) !important;border:1px solid var(--colorBorderSubtle, rgba(255,255,255,0.2)) !important;border-radius:8px !important;padding:20px !important;max-width:400px !important;box-shadow:0 10px 30px rgba(0,0,0,0.8) !important;';
            modal.innerHTML = `
                <h3 style="margin-top:0 !important;margin-bottom:15px !important;font-size:16px !important;color:var(--colorFg, #ffffff) !important;font-weight:bold !important;line-height:1.2 !important;">Reset BeautyMedia Settings</h3>
                <p style="margin-bottom:20px !important;font-size:13px !important;color:var(--colorFgFaded, #cccccc) !important;line-height:1.5 !important;">Are you sure you want to reset BeautyMedia to default settings? All custom site colors will be permanently lost.</p>
                <div style="display:flex !important;justify-content:flex-end !important;gap:10px !important;">
                    <button id="bm-modal-cancel" style="background:transparent !important;border:1px solid var(--colorBorderSubtle, rgba(255,255,255,0.3)) !important;color:var(--colorFg, #ffffff) !important;padding:6px 12px !important;border-radius:4px !important;cursor:pointer !important;">Cancel</button>
                    <button id="bm-modal-confirm" style="background:var(--colorHighlightBg, #ff5555) !important;border:none !important;color:var(--colorHighlightFg, #fff) !important;padding:6px 12px !important;border-radius:4px !important;cursor:pointer !important;font-weight:bold !important;">Reset Settings</button>
                </div>
            `;

            overlay.appendChild(modal);
            document.body.appendChild(overlay);

            overlay.querySelector('#bm-modal-cancel').onclick = () => overlay.remove();
            overlay.querySelector('#bm-modal-confirm').onclick = () => {
                state.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
                saveSettings();
                applySettings();
                group.remove();
                overlay.remove();
                injectBeautyMediaSettings(targetSection);
            };
        });
    }

    renderServicesList(group.querySelector('#bm-services-container'), showSaveIndicator);
  }

  function renderServicesList(container, showSaveIndicator) {
    const s = state.settings;

    const render = () => {
        let html = '';

        s.services.forEach((srv, idx) => {
            html += `
              <div class="bm-sites-grid bm-site-row">
                  <div><input type="text" class="bm-srv-input bm-input-text" data-idx="${idx}" data-field="name" value="${srv.name}" placeholder="Name"></div>
                  <div><input type="text" class="bm-srv-input bm-input-text" data-idx="${idx}" data-field="host" value="${srv.host}" placeholder="Domain"></div>
                  <div><input type="color" class="bm-color bm-srv-color" data-idx="${idx}" data-field="accent" value="${srv.accent}" title="Accent"></div>
                  <div><input type="color" class="bm-color bm-srv-color" data-idx="${idx}" data-field="icon" value="${srv.icon}" title="Tab Icon"></div>
                  <div class="bm-grad-cell">
                      <div class="bm-grad-stack"><input type="color" class="bm-color bm-srv-color" data-idx="${idx}" data-field="grad1" value="${srv.grad1}"><input type="checkbox" class="bm-srv-check" data-idx="${idx}" data-field="grad1_enabled" ${srv.grad1_enabled ? 'checked' : ''}></div>
                      <div class="bm-grad-stack"><input type="color" class="bm-color bm-srv-color" data-idx="${idx}" data-field="grad2" value="${srv.grad2}"><input type="checkbox" class="bm-srv-check" data-idx="${idx}" data-field="grad2_enabled" ${srv.grad2_enabled ? 'checked' : ''}></div>
                      <div class="bm-grad-stack"><input type="color" class="bm-color bm-srv-color" data-idx="${idx}" data-field="grad3" value="${srv.grad3}"><input type="checkbox" class="bm-srv-check" data-idx="${idx}" data-field="grad3_enabled" ${srv.grad3_enabled ? 'checked' : ''}></div>
                      <div class="bm-grad-stack"><input type="color" class="bm-color bm-srv-color" data-idx="${idx}" data-field="grad4" value="${srv.grad4}"><input type="checkbox" class="bm-srv-check" data-idx="${idx}" data-field="grad4_enabled" ${srv.grad4_enabled ? 'checked' : ''}></div>
                  </div>
                  <div><button class="bm-btn bm-btn-danger bm-del-service-btn" data-idx="${idx}" style="padding: 4px; width: 100%; box-sizing: border-box;">Del</button></div>
              </div>
            `;
        });
        
        if (s.services.length === 0) {
            html = '<div style="text-align: center; color: var(--colorFgFaded); padding: 12px; font-size: 12px;">No custom sites added.</div>';
        }

        container.innerHTML = html;

        const parent = container.closest('.bm-section');
        const addBtn = parent ? parent.querySelector('#bm-add-service-btn') : document.querySelector('#bm-add-service-btn');
        if (addBtn) {
            addBtn.onclick = () => {
                s.services.unshift({ id: Date.now().toString(), name: 'New Site', host: 'example.com', accent: s.defaultAccent, icon: s.defaultIconColor, grad1: s.defaultGradient1, grad2: s.defaultGradient2, grad3: s.defaultGradient3, grad4: s.defaultGradient4, grad1_enabled: true, grad2_enabled: true, grad3_enabled: true, grad4_enabled: true });
                saveSettings();
                applySettings();
                showSaveIndicator();
                render();
            };
        }

        container.querySelectorAll('.bm-del-service-btn').forEach(btn => {
            btn.onclick = (e) => {
                const idx = parseInt(e.target.dataset.idx, 10);
                s.services.splice(idx, 1);
                saveSettings();
                applySettings();
                showSaveIndicator();
                render();
            };
        });

        container.querySelectorAll('.bm-srv-input').forEach(inp => {
            inp.onchange = (e) => {
                const idx = parseInt(e.target.dataset.idx, 10);
                const field = e.target.dataset.field;
                s.services[idx][field] = e.target.value;
                saveSettings();
                applySettings();
                showSaveIndicator();
            };
        });

        container.querySelectorAll('.bm-srv-check').forEach(inp => {
            inp.onchange = (e) => {
                const idx = parseInt(e.target.dataset.idx, 10);
                const field = e.target.dataset.field;
                s.services[idx][field] = e.target.checked;
                saveSettings();
                applySettings();
                showSaveIndicator();
            };
        });

        container.querySelectorAll('.bm-srv-color').forEach(inp => {
            inp.oninput = (e) => {
                const idx = parseInt(e.target.dataset.idx, 10);
                const field = e.target.dataset.field;
                s.services[idx][field] = e.target.value;
                applySettings();
            };
            inp.onchange = (e) => {
                const idx = parseInt(e.target.dataset.idx, 10);
                const field = e.target.dataset.field;
                s.services[idx][field] = e.target.value;
                saveSettings();
                applySettings();
                showSaveIndicator();
            };
        });
    };

    render();
  }

  function initSettingsObserver() {
    const getCustomUiSection = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
      let node;
      while ((node = walker.nextNode())) {
        if (node.nodeValue && node.nodeValue.toLowerCase().includes('restart to apply')) {
          const container = node.parentElement.closest('.setting-group, .setting-section, .setting-single') || node.parentElement;
          return container.parentElement || container;
        }
      }

      const heading = Array.from(document.querySelectorAll('h2, h3')).find(el => /custom ui modifications|custom ui mods|css ui mods/i.test(el.textContent));
      if (heading) return heading.closest('.setting-group') || heading.closest('.setting-section') || heading.parentElement;
      return null;
    };

    const observer = new MutationObserver(() => {
      if (document.querySelector('.beautymedia-setting-group')) return;
      const section = getCustomUiSection();
      if (section) injectBeautyMediaSettings(section);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function autoArrangePlayers(skipTransition = false) {
      const docked = Array.from(state.instances.values()).filter(p => p.isVisible && p.isDocked);
      if (!docked.length) return;

      const pos = state.settings.defaultPlayerPosition || 'bottom-right';
      docked.sort((a, b) => a.id.localeCompare(b.id));

      const padding = 20;
      const spacing = 10;
      const w = 360;
      const baseH = 100;

      let currentX = padding;
      if (pos.includes('right')) currentX = window.innerWidth - w - padding;
      else if (pos.includes('center')) currentX = (window.innerWidth - w) / 2;

      let currentY = padding;
      let currentBottom = padding;

      const isBottom = pos.includes('bottom');
      const isTop = pos.includes('top');
      const isCenter = !isBottom && !isTop;

      if (isCenter) {
          currentY = (window.innerHeight - baseH) / 2 - ((docked.length - 1) * (baseH + spacing)) / 2;
      }

      for (let p of docked) {
          const isHovered = p.el && p.el.matches(':hover');
          const actualH = isHovered ? 200 : baseH;

          p.position.x = currentX;
          if (isBottom) {
              p.position.y = window.innerHeight - currentBottom - baseH;
              currentBottom += actualH + spacing;
          } else {
              p.position.y = currentY;
              currentY += actualH + spacing;
          }
          p.applyPosition(skipTransition);
      }
  }

  function getInstanceForHost(hostname) {
    if (!state.instances.has(hostname)) {
      const saved = state.persisted[hostname] || { x: 80, y: 80, isDocked: true };
      state.instances.set(hostname, new PlayerInstance(hostname, { 
        x: saved.x, y: saved.y, manuallyClosed: saved.manuallyClosed, hiddenByTabClose: saved.hiddenByTabClose, isDocked: saved.isDocked 
      }));
    }
    return state.instances.get(hostname);
  }

  function normalizeHostname(urlStr) {
    try {
      const url = new URL(urlStr);
      let host = url.hostname.replace(/^www\./i, '');
      if (host.includes('youtube.com')) return 'youtube.com';
      if (host.includes('spotify.com')) return 'spotify.com';
      return host;
    } catch (e) { return ''; }
  }

  function findTabElement(target) {
    const wrapper = target.closest('.tab-wrapper[data-id^="tab-"]');
    return wrapper || target.closest('.tab-header') || target.closest('.tab');
  }

  function parseTabId(el) {
    if (!el) return null;
    const idStr = el.id || el.dataset.id || el.getAttribute('data-id');
    if (!idStr) return null;
    const rawId = idStr.replace(/^tab-/, '');
    if (rawId.includes('-')) return null;
    const tabId = parseInt(rawId, 10);
    return isNaN(tabId) ? null : tabId;
  }

  function setupActivation() {
    let lastClickTime = 0;
    let clickTimer = null;

    // THE ULTIMATE CLICK BUFFER: Perfectly separates Mute from Player Activation
    window.addEventListener('click', (e) => {
      if (!state.settings.enabled || !state.settings.showPlayer) return;
      const target = e.target.closest('.tab-audio, .audio-icon, .audioicon, .audio-indicator');
      if (!target || e._dp_ignore) return;

      // Stop everything immediately
      e.stopImmediatePropagation();
      e.preventDefault();

      const now = Date.now();
      if (now - lastClickTime < 250) {
        // --- DOUBLE CLICK DETECTED ---
        clearTimeout(clickTimer);
        lastClickTime = 0;

        const tabEl = findTabElement(target);
        const tabId = parseTabId(tabEl);
        if (tabId) {
          chrome.tabs.get(tabId, (tab) => {
            if (chrome.runtime.lastError || !tab) return;
            const host = normalizeHostname(tab.url);
            if (!host) return;
            const inst = getInstanceForHost(host);
            inst._lockedTabId = tabId;
            inst.resetToDefaultPosition();
            inst.setVisible(true);
          });
        }
      } else {
        // --- SINGLE CLICK CANDIDATE ---
        lastClickTime = now;
        clickTimer = setTimeout(() => {
          // Re-dispatch a real click for Vivaldi to handle as a Mute action
          const evt = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window,
            detail: 1
          });
          evt._dp_ignore = true; // Flag to prevent our own interceptor from catching it again
          target.dispatchEvent(evt);
          lastClickTime = 0;
        }, 200);
      }
    }, { capture: true });
  }

  function setupGmcListener() {
    chrome.runtime.onMessage.addListener((msg, sender) => {
      if (msg.type !== GMC_TYPE || !sender.tab) return;
      const host = normalizeHostname(sender.tab.url);
      if (!host) return;
      getInstanceForHost(host).update(msg, sender.tab.id, sender.frameId || 0, sender.tab.windowId);
    });
  }

  function injectMonitor(tabId) {
    if (!tabId || !state.settings.enabled) return;
    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError || !tab || !isInjectable(tab.url)) return;
      const target = { tabId, allFrames: true };
      chrome.scripting.executeScript({ target, func: bridgeScript, args: [GMC_TYPE] }).catch(() => { });
      chrome.scripting.executeScript({ target, world: 'MAIN', func: monitorScript, args: [GMC_TYPE, NAME_ATTR] }).catch(() => { });
    });
  }

  function setupAutoInjection() {
    chrome.tabs.query({}, (tabs) => tabs.forEach(t => { if (isInjectable(t.url)) injectMonitor(t.id); }));
    if (window.vivaldi?.tabsPrivate?.onMediaStateChanged) {
      vivaldi.tabsPrivate.onMediaStateChanged.addListener((tabId, winId, state) => {
        if (state && state.length > 0) injectMonitor(tabId);
      });
    }
    chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
      if (isInjectable(tab.url) && (info.status === 'complete' || info.url || info.audible)) injectMonitor(tabId);
    });
    chrome.webNavigation.onCommitted.addListener((details) => {
      if (details.frameId === 0 && isInjectable(details.url)) injectMonitor(details.tabId);
    });
    chrome.tabs.onRemoved.addListener((tabId) => {
      const styleTag = document.getElementById(`bm-style-tab-${tabId}`);
      if (styleTag) styleTag.remove();

      state.instances.forEach(inst => {
        if (inst.tabId === tabId) {
          inst.hideForTabClose();
        }
      });
    });
  }

  function init() {
    loadFromStorage();
    setupActivation();
    setupGmcListener();
    setupAutoInjection();
    initSettingsObserver();
    window.addEventListener('resize', () => {
        state.instances.forEach(inst => {
            if (inst.isVisible && !inst.isDocked) inst.applyPosition(true);
        });
        autoArrangePlayers(true);
    });
    console.log('[BeautyMedia] Stability Engine Active.');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
