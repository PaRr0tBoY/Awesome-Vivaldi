// ==UserScript==
// @name         Text Helper & Translator
// @description  Instant translation for selected text and customizable context menus.
// @version      2.1.0
// @author       Wyrtensi, based on Simple Translate by sienori
// @source       https://github.com/sienori/simple-translate
// ==/UserScript==
// @LICENSE      MPL-2.0 (see Javascripts/texthelper-LICENSE.txt)
// texthelper is a port for vivaldi browser from https://github.com/sienori/simple-translate
// Modification

(() => {
  const CONFIG = {
    defaultTargetLang: "en",
    defaultSecondLang: "ru",
    translationApi: "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl={tl}&dt=t&q={q}",
    iconTranslate: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="m12.87 15.07-2.54-2.51.03-.03A17.52 17.52 0 0 0 14.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04M18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12m-2.62 7 1.62-4.33L19.12 17h-3.24Z"/></svg>`
  };

  const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Russian' },
    { code: 'de', name: 'German' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'it', name: 'Italian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh-CN', name: 'Chinese (Simplified)' },
    { code: 'zh-TW', name: 'Chinese (Traditional)' },
    { code: 'tr', name: 'Turkish' },
    { code: 'pl', name: 'Polish' },
    { code: 'nl', name: 'Dutch' }
  ];

  class TextHelperMod {
    constructor() {
      this.settings = {
        targetLang: CONFIG.defaultTargetLang,
        secondLang: CONFIG.defaultSecondLang,
        enabled: true,
        autoTranslate: false,
        pairDetect: false,
        waitTime: 400,
        modifierKey: 'none',
        disableInTextFields: false,
        disableInCode: false,
        panelWidth: 260,
        fontSize: 12,
        panelOpacity: 1.0,
        adaptiveSize: true,
        hideLoading: false,
        excludeUrls: ""
      };

      this.loadSettings();
      this.currentSelection = null;
      this.selectionTimeout = null;
      this.lastTranslated = null;

      this.initOverlay();
      this.initSelectionDetection();
      this.initSettingsObserver();

      this.lastSelectionRect = null;
    }

    async loadSettings() {
      try {
        // 1. Try Chrome Storage (Preferred)
        const chromeData = await new Promise(resolve => {
          if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.get("textHelperSettings", (data) => resolve(data.textHelperSettings || null));
          } else resolve(null);
        });

        if (chromeData) {
          this.settings = { ...this.settings, ...chromeData };
        } else {
          // 2. Fallback to LocalStorage (Migration)
          const stored = window.localStorage.getItem("textHelperSettings");
          if (stored) {
            this.settings = { ...this.settings, ...JSON.parse(stored) };
          }
        }

        // Ensure numbers are numbers
        this.settings.fontSize = Number(this.settings.fontSize) || 12;
        this.settings.panelWidth = Number(this.settings.panelWidth) || 260;
        this.settings.panelOpacity = Number(this.settings.panelOpacity) || 1.0;
        this.settings.adaptiveSize = this.settings.adaptiveSize !== false; // Default to true if not specified

        this.applyStyles();
      } catch (error) {
        console.warn('TextHelper: Settings load failed', error);
      }
    }

    saveSettings() {
      try {
        // Save to Chrome Storage (Async)
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ "textHelperSettings": this.settings });
        }
        // Save to LocalStorage (Sync Fallback)
        if (window.localStorage) {
          window.localStorage.setItem("textHelperSettings", JSON.stringify(this.settings));
        }
        this.applyStyles();
      } catch (error) { }
    }

    applyStyles() {
      let styleEl = document.getElementById('th-dynamic-styles');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'th-dynamic-styles';
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = `
        :root {
          --th-panel-width: ${this.settings.panelWidth}px !important;
          --th-font-size: ${this.settings.fontSize}px !important;
          --th-panel-opacity: ${this.settings.panelOpacity} !important;
        }
        #texthelper-overlay .th-panel-body, 
        #texthelper-overlay .th-translated, 
        #texthelper-overlay .th-panel {
          font-size: ${this.settings.fontSize}px !important;
        }
      `;
    }

    // =========================================================================
    // UI Elements
    // =========================================================================
    initOverlay() {
      this.overlay = document.createElement("div");
      this.overlay.id = "texthelper-overlay";

      this.widget = document.createElement("div");
      this.widget.className = "th-floating-widget";

      this.button = document.createElement("button");
      this.button.className = "th-btn-trigger";
      this.button.innerHTML = CONFIG.iconTranslate;
      this.button.title = "Translate";
      this.button.addEventListener("click", () => this.handleTranslateClick());

      this.panel = document.createElement("div");
      this.panel.className = "th-panel";
      this.panel.style.display = "none";

      this.panelHeader = document.createElement("div");
      this.panelHeader.className = "th-panel-header";
      this.panelHeader.style.display = "none";

      this.panelBody = document.createElement("div");
      this.panelBody.className = "th-panel-body";

      this.panelFooter = document.createElement("div");
      this.panelFooter.className = "th-panel-footer";
      this.panelFooter.style.display = "none";

      // small insert/replace icon (absolute positioned in CSS)
      this.insertBtn = document.createElement('button');
      this.insertBtn.className = 'th-insert-icon';
      this.insertBtn.title = 'Replace selection with translation';
      this.insertBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M12 6V9L16 5L12 1V4C7.58 4 4 7.58 4 12C4 13.46 4.39 14.82 5.07 16L6.5 14.5C6.18 13.73 6 12.89 6 12C6 8.69 8.69 6 12 6M12 18V15L8 19L12 23V20C16.42 20 20 16.42 20 12c0-1.46-.39-2.82-1.07-4L17.5 9.5c.32.77.5 1.61.5 2.5 0 3.31-2.69 6-6 6"></path></svg>`;
      this.insertBtn.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Prevent button from taking focus away from webview
        if (this.lastTranslated) this.replaceSelectionInActiveWebview(this.lastTranslated);
      });

      this.panel.appendChild(this.panelHeader);
      this.panel.appendChild(this.panelBody);
      this.panel.appendChild(this.panelFooter);
      this.panel.appendChild(this.insertBtn);

      this.widget.appendChild(this.button);
      this.widget.appendChild(this.panel);
      this.overlay.appendChild(this.widget);

      document.body.appendChild(this.overlay);
      this.applyStyles();
    }

    // =========================================================================
    // Webview Execution
    // =========================================================================
    getActiveWebview() {
      return document.querySelector(".active.visible.webpageview webview");
    }
    initSelectionDetection() {
      const handler = (e) => {
        if (this.selectionTimeout) clearTimeout(this.selectionTimeout);
        this.selectionTimeout = setTimeout(() => this.checkActiveWebviewSelection(e), 50);
      };

      setInterval(() => {
        const visible = this.widget.classList.contains('th-visible');
        this.checkActiveWebviewSelection();
      }, 500); // Poll faster

      document.addEventListener('mouseup', handler, true);
      document.addEventListener('keyup', handler, true);

      // Auto-hide on interaction/tab change
      window.addEventListener('blur', () => this.hideFloatingWidget());
      window.addEventListener('resize', () => this.hideFloatingWidget());
      document.addEventListener('wheel', (e) => {
        if (this.widget.classList.contains('th-visible') && !this.widget.contains(e.target)) {
          this.hideFloatingWidget();
        }
      }, { passive: true, capture: true });

      document.addEventListener('mousedown', (e) => {
        if (this.widget.classList.contains('th-visible') && !this.widget.contains(e.target)) {
          this.hideFloatingWidget();
        }
      }, true);

      // Tab change observer: watch for the browser window class changes which happen on tab switch
      const tabObserver = new MutationObserver(() => this.hideFloatingWidget());
      const browser = document.getElementById('browser');
      if (browser) {
        tabObserver.observe(browser, { attributes: true, attributeFilter: ['class'], subtree: true });
      }

      // Storage sync across windows/contexts
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
        chrome.storage.onChanged.addListener((changes, area) => {
          if (area === 'local' && changes.textHelperSettings) {
            this.settings = { ...this.settings, ...changes.textHelperSettings.newValue };
            this.applyStyles();
          }
        });
      }
    }

    checkActiveWebviewSelection(event = null) {
      if (!this.settings.enabled) {
        this.hideFloatingWidget();
        return;
      }

      const activeWebview = this.getActiveWebview();
      if (!activeWebview) {
        this.hideFloatingWidget();
        return;
      }

      const src = activeWebview.src || "";
      if (src.startsWith('chrome://') || src.startsWith('devtools://') || src.startsWith('vivaldi://')) {
        this.hideFloatingWidget();
        return;
      }

      // URL Exclusion check
      if (this.settings.excludeUrls) {
        const lines = this.settings.excludeUrls.split('\n').map(l => l.trim()).filter(l => l);
        for (const line of lines) {
          try {
            const regex = new RegExp(line.replace(/\*/g, '.*'));
            if (regex.test(src)) {
              this.hideFloatingWidget();
              return;
            }
          } catch (e) { }
        }
      }

      // Modifier key check
      if (this.settings.modifierKey !== 'none' && event) {
        const isPressed = (this.settings.modifierKey === 'shift' && event.shiftKey) ||
          (this.settings.modifierKey === 'ctrl' && (event.ctrlKey || event.metaKey)) ||
          (this.settings.modifierKey === 'alt' && event.altKey);
        if (!isPressed) {
          this.hideFloatingWidget();
          return;
        }
      }

      const selectionCode = `(function(){
        try {
          const selection = window.getSelection();
          if (!selection || selection.rangeCount === 0) return null;
          
          const activeEl = document.activeElement;
          const isInput = activeEl && (['INPUT', 'TEXTAREA'].includes(activeEl.tagName) || activeEl.isContentEditable);
          const isCode = !!selection.anchorNode.parentElement.closest('pre, code');
          
          if (${this.settings.disableInTextFields} && isInput) return null;
          if (${this.settings.disableInCode} && isCode) return null;

          const text = selection.toString().trim();
          if (!text || text.length < 1) return null;
          
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect ? range.getBoundingClientRect() : (range.getClientRects().length ? range.getClientRects()[0] : null);
          if (!rect) return null;
          
          // Get the exact end point for the floating button
          const endRange = range.cloneRange();
          endRange.collapse(false);
          const endRect = endRange.getBoundingClientRect();
          
          return {
            text: text,
            rect: { top: rect.top, left: rect.left, bottom: rect.bottom, right: rect.right, width: rect.width, height: rect.height },
            endRect: { top: endRect.top, left: endRect.left, bottom: endRect.bottom, right: endRect.right }
          };
        } catch (e) {
          return null;
        }
      })();`;

      try {
        const callback = (results) => {
          if (chrome.runtime.lastError) return;
          const result = Array.isArray(results) ? results[0] : results;

          if (result && result.text) {
            // SCROLL DETECTION: Hide if selection moved
            if (this.widget.classList.contains('th-visible') && this.lastSelectionRect) {
              const dx = Math.abs(result.rect.left - this.lastSelectionRect.left);
              const dy = Math.abs(result.rect.top - this.lastSelectionRect.top);
              if (dx > 3 || dy > 3) {
                this.hideFloatingWidget();
                return;
              }
            }

            this.lastSelectionRect = result.rect;

            if (this.settings.autoTranslate) {
              if (this.currentSelection === result.text && this.widget.classList.contains("th-visible")) return;
              this.currentSelection = result.text;
              this.positionWidget(result.rect, result.endRect);
              this.handleTranslateClick();
            } else {
              this.showFloatingButton(result.text, result.rect, result.endRect);
            }
          } else {
            this.hideFloatingWidget();
          }
        };

        if (typeof activeWebview.executeScript === 'function') {
          activeWebview.executeScript({ code: selectionCode }, callback);
        } else if (typeof activeWebview.executeJavaScript === 'function') {
          activeWebview.executeJavaScript(selectionCode).then(callback).catch(() => { });
        }
      } catch (err) { }
    }

    positionWidget(selectionRect, endRect = null) {
      const activeWebview = this.getActiveWebview();
      if (!activeWebview) return;

      const webviewRect = activeWebview.getBoundingClientRect();
      const refRect = (this.button.style.display !== "none" && endRect) ? endRect : selectionRect;

      // use panel width from settings but constrain to viewport
      let panelW = parseInt(this.settings.panelWidth) || 260;

      if (this.settings.adaptiveSize && this.currentSelection) {
        panelW = this.calculateSmartWidth(this.currentSelection);
      }

      panelW = Math.min(window.innerWidth - 40, Math.max(220, panelW));

      const spaceRight = window.innerWidth - (webviewRect.left + refRect.right);
      const spaceLeft = webviewRect.left + refRect.left;

      let absLeft, absTop;

      // prefer showing to the right of the reference point (end of text or bounding box)
      if (spaceRight > panelW + 24) {
        absLeft = webviewRect.left + refRect.right + 8;
        absTop = webviewRect.top + refRect.top - 5;
        if (absTop + this.panel.offsetHeight > window.innerHeight) {
          absTop = Math.max(12, window.innerHeight - this.panel.offsetHeight - 12);
        }
      } else if (spaceLeft > panelW + 24) {
        absLeft = webviewRect.left + refRect.left - panelW - 12;
        absTop = webviewRect.top + refRect.top - 5;
        if (absTop + this.panel.offsetHeight > window.innerHeight) {
          absTop = Math.max(12, window.innerHeight - this.panel.offsetHeight - 12);
        }
      } else {
        absLeft = webviewRect.left + refRect.left + ((refRect.width || 0) / 2) - (panelW / 2);
        if (absLeft > window.innerWidth - panelW - 16) absLeft = window.innerWidth - panelW - 16;
        if (absLeft < 16) absLeft = 16;

        absTop = webviewRect.top + refRect.bottom + 8;
        if (absTop + this.panel.offsetHeight > window.innerHeight) {
          absTop = webviewRect.top + refRect.top - this.panel.offsetHeight - 8;
        }
      }

      // apply width and position
      this.panel.style.width = `${panelW}px`;
      const centerOfRef = webviewRect.left + refRect.left + ((refRect.width || 0) / 2);
      const arrowLeft = Math.min(Math.max(centerOfRef - absLeft - 6, 12), panelW - 12);
      this.panel.style.setProperty('--th-arrow-left', `${arrowLeft}px`);

      this.widget.style.top = `${absTop}px`;
      this.widget.style.left = `${absLeft}px`;
      this.widget.classList.add("th-visible");
    }

    calculateSmartWidth(text) {
      const len = text ? text.length : 0;
      if (len === 0) return 200;

      // Volumetric growth: Base 180 + (Sqrt * scaling)
      // We aim for 26+ scaling factor to ensure good reading width
      const targetW = 180 + (Math.sqrt(len) * 26);

      // Hard cap: Screen width
      const screenCap = window.innerWidth - 60;

      // Soft cap: User's preferred width is treated as a "Comfortable Max"
      // but for long text, we allow it to expand up to the screen cap.
      const userMax = parseInt(this.settings.panelWidth) || 400;
      const flexMax = len > 300 ? Math.max(userMax, screenCap) : userMax;

      return Math.min(screenCap, Math.max(180, Math.min(flexMax, targetW)));
    }

    showFloatingButton(text, selectionRect, endRect) {
      // Do not show floating button when auto-translate mode is enabled
      if (this.settings.autoTranslate) {
        this.hideFloatingWidget();
        return;
      }
      if (this.currentSelection === text && this.widget.classList.contains("th-visible")) return;
      this.currentSelection = text;

      this.positionWidget(selectionRect, endRect);

      this.button.style.display = "flex";
      this.panel.style.display = "none";
    }

    hideFloatingWidget() {
      this.widget.classList.remove("th-visible");
      this.currentSelection = null;
      this.lastSelectionRect = null;
    }

    async handleTranslateClick(lang = null) {
      if (!this.currentSelection) return;

      const initialTarget = lang || this.settings.targetLang;

      this.button.style.display = "none";

      // If quiet mode is OFF, show the panel immediately with loading state
      if (!this.settings.hideLoading) {
        this.panel.style.display = "flex";
        this.panelHeader.style.display = 'none';
        this.panelFooter.style.display = 'none';
        this.panelBody.innerHTML = `<div class="th-loading">Fetching translation...</div>`;
      }
      this.lastTranslated = '';

      try {
        const safeText = this.currentSelection.length > 2000 ? this.currentSelection.substring(0, 2000) + "..." : this.currentSelection;

        const fetchTranslation = async (tl) => {
          const url = CONFIG.translationApi.replace("{tl}", tl).replace("{q}", encodeURIComponent(safeText));
          const response = await fetch(url);
          if (!response.ok) throw new Error('Network error');
          const data = await response.json();
          let translated = '';
          if (data && data[0]) data[0].forEach(seg => { if (seg[0]) translated += seg[0]; });
          const detected = (data && data[2]) ? data[2].toLowerCase() : null;
          return { translated, detected, raw: data };
        };

        // initial request to primary (or passed) target
        let result = await fetchTranslation(initialTarget);
        let finalTranslated = result.translated;
        const detected = result.detected;

        // pair detect logic: if enabled and secondary configured, and detected is the primary,
        // then translate to secondary instead
        if (this.settings.pairDetect && this.settings.secondLang) {
          const primary = (this.settings.targetLang || '').toLowerCase();
          const secondary = (this.settings.secondLang || '').toLowerCase();
          if (detected && primary && detected === primary && secondary && secondary !== primary) {
            // re-fetch translation to secondary language
            const secondResult = await fetchTranslation(this.settings.secondLang);
            finalTranslated = secondResult.translated;
          }
        }

        this.lastTranslated = finalTranslated || '';

        // show only translated text
        this.panelBody.innerHTML = '';
        const tdiv = document.createElement('div');
        tdiv.className = 'th-translated';
        tdiv.style.fontSize = `${this.settings.fontSize}px`;
        tdiv.textContent = this.lastTranslated || '—';
        this.panelBody.appendChild(tdiv);

        // If quiet mode was ON, we show the panel now that it's ready
        if (this.settings.hideLoading) {
          this.panel.style.display = "flex";
          this.panelHeader.style.display = 'none';
          this.panelFooter.style.display = 'none';
        }

        // RE-SIZE AFTER TRANSLATION: important because translated text can be much longer
        if (this.settings.adaptiveSize && this.lastTranslated) {
          const finalW = this.calculateSmartWidth(this.lastTranslated);
          this.panel.style.width = `${finalW}px`;
          // Re-position to ensure the arrow and panel bounds are still correct
          if (this.lastSelectionRect) this.positionWidget(this.lastSelectionRect);
        }

        if (this.lastTranslated) {
          this.insertBtn.style.display = 'flex';
        } else {
          this.insertBtn.style.display = 'none';
        }
        this.panelFooter.style.display = 'none';
      } catch (error) {
        this.panelHeader.style.display = 'block';
        this.panelHeader.textContent = "Error";
        this.panelBody.textContent = "Failed. Check connection.";
      }
    }

    replaceSelectionInActiveWebview(text) {
      const activeWebview = this.getActiveWebview();
      if (!activeWebview) return;
      try {
        const payload = JSON.stringify(text);

        // Hardened Insertion Script:
        // 1. Tries to use execCommand('insertText') which is safest for React/Vue/Angular
        // 2. Falls back to direct value manipulation with manual event dispatching
        // 3. Handles both standard inputs and ContentEditable regions
        const code = `(function(t){
          try {
            const activeEl = document.activeElement;
            if (!activeEl) return false;

            // Ensure the element is focused
            activeEl.focus();

            // Try the standard "native" way first (triggers site-specific listeners)
            const success = document.execCommand('insertText', false, t);
            
            if (!success) {
              // Fallback for elements where execCommand fails (standard inputs/textareas)
              if (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA') {
                const start = activeEl.selectionStart || 0;
                const end = activeEl.selectionEnd || 0;
                const val = activeEl.value || '';
                
                // Set the value
                activeEl.value = val.slice(0, start) + t + val.slice(end);
                
                // Dispatch events so the UI updates
                ['input', 'change', 'blur'].forEach(evName => {
                   activeEl.dispatchEvent(new Event(evName, { bubbles: true }));
                });
                
                // Restore selection at the end
                activeEl.selectionStart = activeEl.selectionEnd = start + t.length;
              } else if (activeEl.isContentEditable) {
                const sel = window.getSelection();
                if (sel && sel.rangeCount > 0) {
                  const range = sel.getRangeAt(0);
                  range.deleteContents();
                  range.insertNode(document.createTextNode(t));
                }
              }
            }
            return true;
          } catch (e) {
            console.error('TH Replacement Error:', e);
            return false;
          }
        })(${payload});`;

        if (typeof activeWebview.executeScript === 'function') {
          activeWebview.executeScript({ code }, (res) => { });
        } else if (typeof activeWebview.executeJavaScript === 'function') {
          activeWebview.executeJavaScript(code).catch(() => { });
        }

        this.hideFloatingWidget();
      } catch (e) { }
    }

    // =========================================================================
    // Native Settings Page Integration
    // =========================================================================
    initSettingsObserver() {
      const getCustomUiSection = () => {
        // 1. Try by specific Vivaldi class (most reliable)
        const folderSelection = document.querySelector('.folder-selection');
        if (folderSelection) return folderSelection.closest('.setting-group') || folderSelection.closest('section');

        // 2. Try by language-agnostic content search (.css is usually untranslated)
        const infoText = Array.from(document.querySelectorAll('.info, p, span'))
          .find(el => el.textContent.includes('.css') && /restart|apply/i.test(el.textContent));
        if (infoText) return infoText.closest('.setting-group') || infoText.closest('section');

        // 3. Fallback to English names
        const heading = Array.from(document.querySelectorAll('h2, h3'))
          .find(el => /custom ui modifications|custom ui mods|css ui mods/i.test(el.textContent));
        return heading ? heading.closest('.setting-group') || heading.closest('section') : null;
      };

      const observer = new MutationObserver(() => {
        // Check if we are on the Appearance page (Stable data-id="2")
        const selectedCategory = document.querySelector('.settings-sidebar .tree-item[aria-selected="true"]');
        const isAppearance = selectedCategory?.getAttribute('data-id') === '2';
        if (!isAppearance) return;

        if (document.querySelector('.th-setting-group')) return;
        const section = getCustomUiSection();
        if (section) this.injectIntegratedSettings(section);
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    injectIntegratedSettings(targetSection) {
      if (document.querySelector('.th-setting-group')) return;

      const group = document.createElement('div');
      group.className = 'setting-section th-setting-group';
      group.style.borderTop = '1px solid var(--colorBorderSubtle)';
      group.style.marginTop = '24px';
      group.style.paddingTop = '18px';
      group.style.maxWidth = '800px';

      group.innerHTML = `
        <div class="th-title" style="font-size: 15px; font-weight: 600; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
          <span>Text Helper Tool</span>
          <span id="th-save-indicator" style="font-size: 12px; opacity: 0; transition: opacity 0.3s; color: var(--colorHighlightBg); font-weight: normal;">Saved</span>
        </div>

        <h3>Translator</h3>
        <div class="th-settings-grid">
          <div class="th-line-section">
            <h3 class="th-line-title">Behavior</h3>
            <div class="setting-single th-line-row"><label><input type="checkbox" id="th-setting-enable" ${this.settings.enabled ? 'checked' : ''}><span>Enable pop-up mod</span></label></div>
            <div class="setting-single th-line-row"><label><input type="checkbox" id="th-setting-auto" ${this.settings.autoTranslate ? 'checked' : ''}><span>Auto-translate on selection</span></label></div>
            <div class="setting-single th-line-row"><label><input type="checkbox" id="th-setting-quiet" ${this.settings.hideLoading ? 'checked' : ''}><span>Quiet fetch (hide loading)</span></label></div>
            <div class="setting-single th-line-row"><label><input type="checkbox" id="th-setting-pair" ${this.settings.pairDetect ? 'checked' : ''}><span>Auto-swap primary/secondary</span></label></div>
            <div class="setting-single th-line-row"><label><input type="checkbox" id="th-setting-notext" ${this.settings.disableInTextFields ? 'checked' : ''}><span>Ignore inputs/forms</span></label></div>
            <div class="setting-single th-line-row"><label><input type="checkbox" id="th-setting-nocode" ${this.settings.disableInCode ? 'checked' : ''}><span>Ignore &lt;code&gt; tags</span></label></div>
          </div>

          <div class="th-line-section">
            <h3 class="th-line-title">Language & Trigger</h3>
            <div class="setting-single th-line-row">
              <span class="info">Primary target</span>
              <select id="th-setting-lang">
                ${LANGUAGES.map(l => `<option value="${l.code}" ${this.settings.targetLang === l.code ? 'selected' : ''}>${l.name}</option>`).join('')}
              </select>
            </div>
            <div class="setting-single th-line-row">
              <span class="info">Secondary target</span>
              <select id="th-setting-second-lang">
                <option value="">None</option>
                ${LANGUAGES.map(l => `<option value="${l.code}" ${this.settings.secondLang === l.code ? 'selected' : ''}>${l.name}</option>`).join('')}
              </select>
            </div>
            <div class="setting-single th-line-row">
              <span class="info">Modifier key</span>
              <select id="th-setting-modifier">
                <option value="none" ${this.settings.modifierKey === 'none' ? 'selected' : ''}>None</option>
                <option value="shift" ${this.settings.modifierKey === 'shift' ? 'selected' : ''}>Shift</option>
                <option value="ctrl" ${this.settings.modifierKey === 'ctrl' ? 'selected' : ''}>Ctrl / Cmd</option>
                <option value="alt" ${this.settings.modifierKey === 'alt' ? 'selected' : ''}>Alt</option>
              </select>
            </div>
            <div class="setting-single th-line-row">
              <span class="info">Wait time</span>
              <div class="th-inline-field"><input type="number" id="th-setting-wait" value="${this.settings.waitTime}" min="0" max="2000" step="50"><span class="info">ms</span></div>
            </div>
          </div>

          <div class="th-line-section">
            <h3 class="th-line-title">Display</h3>
            <div class="setting-single th-line-row"><label><input type="checkbox" id="th-setting-adaptive" ${this.settings.adaptiveSize ? 'checked' : ''}><span>Adaptive smart size</span></label></div>
            <div class="setting-single th-line-row">
              <span class="info">${this.settings.adaptiveSize ? 'Maximum width' : 'Panel width'}</span>
              <div class="th-inline-field"><input type="number" id="th-setting-width" value="${this.settings.panelWidth}" min="200" max="600"><span class="info">px</span></div>
            </div>
            <div class="setting-single th-line-row">
              <span class="info">Panel font size</span>
              <div class="th-inline-field"><input type="number" id="th-setting-font" value="${this.settings.fontSize}" min="10" max="24"><span class="info">px</span></div>
            </div>
            <div class="setting-single th-line-row">
              <span class="info">Panel opacity</span>
              <div class="th-range-field"><input type="range" id="th-setting-opacity" value="${this.settings.panelOpacity}" min="0.5" max="1.0" step="0.05"><span class="info" id="th-val-opacity">${Math.round(this.settings.panelOpacity * 100)}%</span></div>
            </div>
            <div class="setting-single th-line-textarea">
              <span class="info">Exclude URLs (one per line)</span>
              <textarea id="th-setting-exclude-urls" rows="3" placeholder="*.google.com">${this.settings.excludeUrls || ''}</textarea>
            </div>
          </div>
        </div>
      `;

      targetSection.appendChild(group);

      const update = (id, key, prop = 'checked', event = 'change') => {
        const el = group.querySelector(`#${id}`);
        if (!el) return;
        el.addEventListener(event, (e) => {
          let val = e.target[prop];
          if (el.type === 'number') {
            const parsed = parseInt(val, 10);
            val = isNaN(parsed) ? this.settings[key] : parsed;
          }
          this.settings[key] = val;
          this.saveSettings();

          // Show save indicator
          const indicator = document.getElementById('th-save-indicator');
          if (indicator) {
            indicator.style.opacity = '1';
            setTimeout(() => { if (indicator) indicator.style.opacity = '0'; }, 1000);
          }
        });
      };

      update('th-setting-enable', 'enabled');
      update('th-setting-auto', 'autoTranslate');
      update('th-setting-quiet', 'hideLoading');
      update('th-setting-pair', 'pairDetect');
      update('th-setting-lang', 'targetLang', 'value');
      update('th-setting-second-lang', 'secondLang', 'value');
      update('th-setting-modifier', 'modifierKey', 'value');
      update('th-setting-wait', 'waitTime', 'value', 'input');
      update('th-setting-width', 'panelWidth', 'value', 'input');
      update('th-setting-font', 'fontSize', 'value', 'input');
      update('th-setting-adaptive', 'adaptiveSize');

      const opacityInput = group.querySelector('#th-setting-opacity');
      const opacityVal = group.querySelector('#th-val-opacity');
      if (opacityInput && opacityVal) {
        opacityInput.addEventListener('input', (e) => {
          const val = parseFloat(e.target.value);
          this.settings.panelOpacity = val;
          opacityVal.textContent = `${Math.round(val * 100)}%`;
          this.saveSettings();

          const indicator = document.getElementById('th-save-indicator');
          if (indicator) {
            indicator.style.opacity = '1';
            setTimeout(() => { if (indicator) indicator.style.opacity = '0'; }, 1000);
          }
        });
      }

      update('th-setting-notext', 'disableInTextFields');
      update('th-setting-nocode', 'disableInCode');
      update('th-setting-exclude-urls', 'excludeUrls', 'value', 'input');
    }
  }

  function bootstrapTextHelper() {
    if (window.__textHelperInitialized) return true;
    const browser = document.getElementById("browser");
    if (!browser) return false;

    window.__textHelperInitialized = true;
    new TextHelperMod();
    return true;
  }

  if (!bootstrapTextHelper()) {
    const observer = new MutationObserver(() => {
      if (bootstrapTextHelper()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
