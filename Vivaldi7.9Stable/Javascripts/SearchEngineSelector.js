// ==UserScript==
// @name         Search Engine Selector
// @description  Quick access to search engine selection
// @version      1.0
// @author       wyrtensi
// ==/UserScript==
(function searchEngineSelectorMod() {
    "use strict";

    class SearchEngineSelector {
        constructor() {
            this.favorites = [];
            this.engines = [];
            this.activeIndex = -1;
            this.addressField = null;
            this.selectorContainer = null;
            this.inputField = null;

            this.init();
        }

        async init() {
            await this.loadSettings();
            this.setupAddressBarObserver();

            // Initial fetch of engines if API is ready
            if (window.vivaldi && window.vivaldi.searchEngines) {
                this.refreshEngines();
            } else {
                // Wait for vivaldi API to be ready
                const interval = setInterval(() => {
                    if (window.vivaldi && window.vivaldi.searchEngines) {
                        this.refreshEngines();
                        clearInterval(interval);
                    }
                }, 100);
            }
        }

        async loadSettings() {
            return new Promise((resolve) => {
                chrome.storage.local.get(['SES_favorites', 'SES_showLabel', 'SES_forceRestore', 'SES_cycleKey'], (result) => {
                    this.favorites = result.SES_favorites || [];
                    this.showLabel = result.SES_showLabel !== false; // defaults to true
                    this.forceRestore = result.SES_forceRestore !== false; // defaults to true
                    this.cycleKey = result.SES_cycleKey || 'Tab';
                    resolve();
                });
            });
        }

        saveSettings() {
            chrome.storage.local.set({
                'SES_favorites': this.favorites,
                'SES_showLabel': this.showLabel,
                'SES_forceRestore': this.forceRestore,
                'SES_cycleKey': this.cycleKey
            });
            this.buildSelectorUI(); // Rebuild UI on save
        }

        async refreshEngines() {
            if (!window.vivaldi || !window.vivaldi.searchEngines) return;

            try {
                const result = await new Promise((resolve, reject) => {
                    try {
                        vivaldi.searchEngines.getTemplateUrls((res) => {
                            if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
                            else resolve(res);
                        });
                    } catch (e) {
                        vivaldi.searchEngines.getTemplateUrls().then(resolve).catch(reject);
                    }
                });
                if (result && result.templateUrls) {
                    this.engines = result.templateUrls;
                    this.originalDefaultSearch = result.defaultSearch; // Store the true default
                    if (this.addressField && this.inputField) {
                        this.buildSelectorUI();
                    }
                }
            } catch (e) {
                console.error("Search Engine Selector Mod: Failed to fetch engines", e);
            }
        }

        showSettingsModal() {
            const existing = document.querySelector('.search-engine-selector-modal');
            if (existing) existing.remove();

            const modal = document.createElement('div');
            modal.className = 'search-engine-selector-modal';

            const content = document.createElement('div');
            content.className = 'ses-modal-content';

            const title = document.createElement('h2');
            title.innerText = 'Favorite Search Engines';
            content.appendChild(title);

            const subtitle = document.createElement('p');
            subtitle.innerText = 'Select and drag to reorder your quick search engines.';
            subtitle.style.margin = '0 0 16px 0';
            subtitle.style.fontSize = '12px';
            subtitle.style.color = 'var(--colorFgFaded)';
            content.appendChild(subtitle);

            const listDiv = document.createElement('div');
            listDiv.className = 'ses-modal-list';

            // Sort engines: favorites first in exact favorited order, then remainder
            let displayEngines = [];
            this.favorites.forEach(f => {
                const e = this.engines.find(en => en.guid === f);
                if (e) displayEngines.push(e);
            });
            this.engines.forEach(e => {
                if (!this.favorites.includes(e.guid)) displayEngines.push(e);
            });

            displayEngines.forEach(engine => {
                const item = document.createElement('label');
                item.className = 'ses-modal-item';
                item.draggable = true;

                item.addEventListener('dragstart', (e) => {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', engine.guid);

                    // Allow browser to copy visual drag image without opacity overlay
                    setTimeout(() => {
                        item.classList.add('dragging');
                    }, 10);
                });

                item.addEventListener('dragend', () => {
                    item.classList.remove('dragging');
                    this.favorites = Array.from(listDiv.querySelectorAll('input[type="checkbox"]:checked')).map(inp => inp.value);
                    this.saveSettings();
                });

                const dragHandle = document.createElement('div');
                dragHandle.className = 'ses-drag-handle';
                dragHandle.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M8 6a2 2 0 11-4 0 2 2 0 014 0zM8 12a2 2 0 11-4 0 2 2 0 014 0zM8 18a2 2 0 11-4 0 2 2 0 014 0zM20 6a2 2 0 11-4 0 2 2 0 014 0zM20 12a2 2 0 11-4 0 2 2 0 014 0zM20 18a2 2 0 11-4 0 2 2 0 014 0z"/></svg>';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = engine.guid;
                checkbox.checked = this.favorites.includes(engine.guid);

                checkbox.addEventListener('change', (e) => {
                    this.favorites = Array.from(listDiv.querySelectorAll('input[type="checkbox"]:checked')).map(inp => inp.value);
                    this.saveSettings();
                });

                const iconWrapper = document.createElement('div');
                iconWrapper.className = 'ses-modal-icon-wrapper';
                const icon = document.createElement('img');
                icon.src = engine.faviconUrl || engine.imageUrl || 'chrome://favicon/';
                iconWrapper.appendChild(icon);

                const name = document.createElement('span');
                name.innerText = engine.name;
                name.className = 'ses-modal-name';

                item.appendChild(dragHandle);
                item.appendChild(checkbox);
                item.appendChild(iconWrapper);
                item.appendChild(name);
                listDiv.appendChild(item);
            });

            listDiv.addEventListener('dragover', (e) => {
                e.preventDefault();
                const draggingItem = listDiv.querySelector('.dragging');
                if (!draggingItem) return;
                const siblings = [...listDiv.querySelectorAll('.ses-modal-item:not(.dragging)')];

                let nextSibling = siblings.find(sibling => {
                    const rect = sibling.getBoundingClientRect();
                    const offset = e.clientY - rect.top - rect.height / 2;
                    return offset < 0;
                });

                // Throttle jitter logically
                if (nextSibling !== draggingItem.nextSibling) {
                    listDiv.insertBefore(draggingItem, nextSibling || null);
                }
            });

            content.appendChild(listDiv);

            const settingsDivider = document.createElement('hr');
            settingsDivider.style.margin = '16px 0';
            settingsDivider.style.borderColor = 'var(--colorBorder)';
            settingsDivider.style.borderStyle = 'solid';
            settingsDivider.style.borderWidth = '1px 0 0 0';
            content.appendChild(settingsDivider);

            const labelToggle = document.createElement('div');
            labelToggle.className = 'ses-modal-item ses-modal-toggle';
            labelToggle.innerHTML = `
        <div class="ses-native-switch ${this.showLabel ? 'checked' : ''}" id="ses-toggle-switch">
            <div class="ses-native-knob"></div>
        </div>
        <div style="display:flex; flex-direction:column; gap:2px; margin-left:8px;">
            <div style="display:flex; align-items:center; gap:8px;">
                <span class="ses-modal-name" style="font-size:14px; font-weight:600; padding:0; margin:0;">Show Badge Prefix</span>
                <span class="ses-status-text" style="font-size:12px; font-weight:700; color:${this.showLabel ? 'var(--colorFg)' : 'var(--colorFgFaded)'};">${this.showLabel ? 'Enabled' : 'Disabled'}</span>
            </div>
            <span style="font-size:11px; color:var(--colorFgFaded);">Displays the active large search indicator directly inside the address bar.</span>
        </div>
      `;
            labelToggle.style.cursor = 'pointer';
            labelToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLabel = !this.showLabel;

                const sw = labelToggle.querySelector('#ses-toggle-switch');
                const statusText = labelToggle.querySelector('.ses-status-text');
                if (this.showLabel) {
                    sw.classList.add('checked');
                    statusText.innerText = 'Enabled';
                    statusText.style.color = 'var(--colorFg)';
                } else {
                    sw.classList.remove('checked');
                    statusText.innerText = 'Disabled';
                    statusText.style.color = 'var(--colorFgFaded)';
                }

                this.saveSettings();
                if (this.activeIndex !== -1) this.setActiveIndex(this.activeIndex);
            });
            content.appendChild(labelToggle);

            const restoreToggle = document.createElement('div');
            restoreToggle.className = 'ses-modal-item ses-modal-toggle';
            restoreToggle.innerHTML = `
        <div class="ses-native-switch ${this.forceRestore ? 'checked' : ''}" id="ses-restore-switch">
            <div class="ses-native-knob"></div>
        </div>
        <div style="display:flex; flex-direction:column; gap:2px; margin-left:8px;">
            <div style="display:flex; align-items:center; gap:8px;">
                <span class="ses-modal-name" style="font-size:14px; font-weight:600; padding:0; margin:0;">Force Restore URL</span>
                <span class="ses-status-text" style="font-size:12px; font-weight:700; color:${this.forceRestore ? 'var(--colorFg)' : 'var(--colorFgFaded)'};">${this.forceRestore ? 'Enabled' : 'Disabled'}</span>
            </div>
            <span style="font-size:11px; color:var(--colorFgFaded);">Aggressively recovers the original URL if you clear the bar and click away.</span>
        </div>
      `;
            restoreToggle.style.cursor = 'pointer';
            restoreToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.forceRestore = !this.forceRestore;

                const sw = restoreToggle.querySelector('#ses-restore-switch');
                const statusText = restoreToggle.querySelector('.ses-status-text');
                if (this.forceRestore) {
                    sw.classList.add('checked');
                    statusText.innerText = 'Enabled';
                    statusText.style.color = 'var(--colorFg)';
                } else {
                    sw.classList.remove('checked');
                    statusText.innerText = 'Disabled';
                    statusText.style.color = 'var(--colorFgFaded)';
                }

                this.saveSettings();
            });
            content.appendChild(restoreToggle);

            const cycleKeyToggle = document.createElement('div');
            cycleKeyToggle.className = 'ses-modal-item ses-modal-toggle';
            cycleKeyToggle.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:2px; flex-grow:1;">
            <span class="ses-modal-name" style="font-size:14px; font-weight:600; padding:0; margin:0;">Cycle Engine Key</span>
            <span style="font-size:11px; color:var(--colorFgFaded);">The key used to switch between favorites in the address bar.</span>
        </div>
        <div class="ses-key-badge" id="ses-key-display">${this.cycleKey}</div>
      `;
            cycleKeyToggle.style.cursor = 'pointer';
            cycleKeyToggle.addEventListener('click', (e) => {
                e.preventDefault();
                const display = cycleKeyToggle.querySelector('#ses-key-display');
                display.innerText = 'PROMPT...';
                display.classList.add('waiting');

                const captureKey = (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    this.cycleKey = event.key;
                    display.innerText = this.cycleKey;
                    display.classList.remove('waiting');
                    this.saveSettings();
                    window.removeEventListener('keydown', captureKey, true);
                };
                window.addEventListener('keydown', captureKey, true);
            });
            content.appendChild(cycleKeyToggle);

            const footer = document.createElement('div');
            footer.className = 'ses-modal-footer';
            const closeBtn = document.createElement('button');
            closeBtn.innerText = 'Close';
            closeBtn.className = 'ses-modal-close';

            const closeModal = () => {
                modal.classList.remove('visible');
                setTimeout(() => modal.remove(), 300);
            };

            closeBtn.onclick = closeModal;
            footer.appendChild(closeBtn);
            content.appendChild(footer);

            modal.appendChild(content);
            const browserNode = document.querySelector('#browser') || document.body;
            browserNode.appendChild(modal);

            // Close events
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
            document.addEventListener('keydown', function escHandler(e) {
                if (e.key === 'Escape') {
                    closeModal();
                    document.removeEventListener('keydown', escHandler);
                }
            });

            // Animate in
            requestAnimationFrame(() => {
                modal.classList.add('visible');
            });
        }

        setupSettingsObserver() {
            // Observe the document body to find when settings are opened
            const observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    if (mutation.addedNodes.length) {
                        const settingsWrapper = document.querySelector('.settings-content');
                        if (settingsWrapper && document.querySelector('.setting-section[data-section="search"]')) {
                            this.injectSettingsUI();
                        }
                    }
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });
        }

        injectSettingsUI() {
            const searchSection = document.querySelector('.setting-section[data-section="search"]');
            if (!searchSection || document.querySelector('.search-engine-selector-settings')) return;

            const settingsDiv = document.createElement('div');
            settingsDiv.className = 'search-engine-selector-settings';

            const title = document.createElement('div');
            title.className = 'search-engine-selector-title';
            title.innerText = 'Favorite Search Engines (Address Bar Selector)';
            settingsDiv.appendChild(title);

            const listDiv = document.createElement('div');
            listDiv.className = 'search-engine-list';

            this.engines.forEach(engine => {
                const item = document.createElement('div');
                item.className = 'search-engine-item';

                const label = document.createElement('label');

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = engine.guid;
                checkbox.checked = this.favorites.includes(engine.guid);

                checkbox.addEventListener('change', (e) => {
                    this.favorites = Array.from(listDiv.querySelectorAll('input[type="checkbox"]:checked')).map(inp => inp.value);
                    this.saveSettings();
                });

                const icon = document.createElement('img');
                icon.src = engine.faviconUrl || engine.imageUrl || 'chrome://favicon/';

                const name = document.createTextNode(engine.name);

                label.appendChild(checkbox);
                label.appendChild(icon);
                label.appendChild(name);
                item.appendChild(label);
                listDiv.appendChild(item);
            });

            settingsDiv.appendChild(listDiv);
            searchSection.appendChild(settingsDiv);
        }

        setupAddressBarObserver() {
            const observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    if (mutation.addedNodes.length) {
                        const addrField = document.querySelector('.UrlBar-AddressField');
                        if (addrField && addrField !== this.addressField) {
                            this.addressField = addrField;
                            this.inputField = document.querySelector('#urlFieldInput') || addrField.querySelector('input.url') || addrField.querySelector('input[type="url"]') || addrField.querySelector('input');
                            if (this.inputField) {
                                this.buildSelectorUI();
                                this.attachInputListeners();
                            }
                        }
                    }
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });

            // Try finding it immediately
            const immediateField = document.querySelector('.UrlBar-AddressField');
            if (immediateField) {
                this.addressField = immediateField;
                this.inputField = document.querySelector('#urlFieldInput') || immediateField.querySelector('input.url') || immediateField.querySelector('input[type="url"]') || immediateField.querySelector('input');
                if (this.inputField) {
                    this.buildSelectorUI();
                    this.attachInputListeners();
                }
            }

            // Watchdog interval for tab switches and background text updates natively triggered by Vivaldi
            if (!this.valueWatcher) {
                this.lastValue = '';
                this.unfocusedTicks = 0;

                this.valueWatcher = setInterval(() => {
                    if (!this.inputField) return;

                    if (this.inputField.value.trim() === '') {
                        this.setActiveIndex(-1);
                        this.selectorContainer?.classList.remove('has-input');
                    } else if (this.inputField.value !== this.lastValue) {
                        this.lastValue = this.inputField.value;
                        this.updateSelectorState(this.lastValue);
                    }

                    // Advanced focus tracking
                    const isHoveringDropdown = document.querySelector('.OmniDropdown:hover');
                    const isActive = document.activeElement === this.inputField || document.activeElement === this.addressField || isHoveringDropdown;

                    if (!isActive && this.inputField.value.trim() === '') {
                        this.unfocusedTicks++;
                        if (this.unfocusedTicks > 2) { // approx 400-500ms allows dropdown clicks to resolve first
                            this.setActiveIndex(-1);
                            this.selectorContainer?.classList.remove('has-input');
                        }
                    } else {
                        this.unfocusedTicks = 0;
                    }
                }, 200);
            }
        }

        buildSelectorUI() {
            if (!this.addressField) return;

            if (this.selectorContainer) {
                this.selectorContainer.remove();
            }

            // Render explicitly in the exact array order dictated by favorites
            const favEngines = this.favorites.map(f => this.engines.find(e => e.guid === f)).filter(Boolean);

            this.selectorContainer = document.createElement('div');
            this.selectorContainer.className = 'SearchEngineSelector-Container';

            const settingsBtn = document.createElement('button');
            settingsBtn.className = 'SearchEngineSelector-Button ses-settings-btn';
            settingsBtn.title = 'Select Favorite Engines';
            settingsBtn.innerHTML = '<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M14 8a6 6 0 11-12 0 6 6 0 0112 0zm-1.5 0a4.5 4.5 0 10-9 0 4.5 4.5 0 009 0z" fill="currentColor"/><path d="M8 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" fill="currentColor"/></svg>';
            settingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showSettingsModal();
            });
            this.selectorContainer.appendChild(settingsBtn);

            favEngines.forEach((engine, index) => {
                const btn = document.createElement('button');
                btn.className = 'SearchEngineSelector-Button';
                btn.dataset.index = index;
                btn.dataset.guid = engine.guid;
                btn.title = engine.name;

                const img = document.createElement('img');
                img.src = engine.faviconUrl || 'chrome://favicon/';
                btn.appendChild(img);

                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // 'true' triggers the React value-trap sync to ensure Vivaldi recognizes the engine change
                    this.setActiveIndex(index, true);
                    this.executeSearch();
                });

                this.selectorContainer.insertBefore(btn, settingsBtn);
            });

            if (!this.leftBadge) {
                this.leftBadge = document.createElement('div');
                this.leftBadge.className = 'SearchEngineSelector-LeftBadge';

                const siteInfoBtn = this.addressField.querySelector('.SiteInfoButton');
                const urlFieldWrapper = this.addressField.querySelector('.UrlBar-UrlFieldWrapper');

                if (siteInfoBtn) {
                    // Insert after the padlock but BEFORE the domain/url area
                    this.addressField.insertBefore(this.leftBadge, siteInfoBtn.nextSibling);
                } else if (urlFieldWrapper) {
                    this.addressField.insertBefore(this.leftBadge, urlFieldWrapper);
                } else {
                    this.addressField.insertBefore(this.leftBadge, this.addressField.firstChild);
                }

                // Gap padding natively managed by flexbox layout
                this.inputField.style.removeProperty('padding-left');
            }

            if (this.inputField) {
                this.inputField.setAttribute('placeholder', 'Search or enter an address');
            }

            const siteInfoBtn = this.addressField.querySelector('.SiteInfoButton');
            if (siteInfoBtn) {
                // Keep search icon selector adjacent to the site info for quick access
                this.addressField.insertBefore(this.selectorContainer, siteInfoBtn.nextSibling);
            } else {
                this.addressField.insertBefore(this.selectorContainer, this.addressField.firstChild);
            }
        }

        attachInputListeners() {
            if (!this.inputField || this.inputField.__ses_input_injected) return;
            this.inputField.__ses_input_injected = true;

            this.inputField.addEventListener('focus', () => {
                if (!this.selectorContainer?.classList.contains('has-input')) {
                    this.savedRestoreUrl = this.inputField.value;
                }
            });

            this.inputField.addEventListener('input', (e) => {
                this.updateSelectorState(e.target.value);
            });

            this.inputField.addEventListener('paste', () => {
                // Short delay ensures the value is populated before we check it
                setTimeout(() => {
                    this.updateSelectorState(this.inputField.value);
                }, 10);
            });

            // Cleanup mod state when focus is lost (clicking away)
            this.inputField.addEventListener('blur', () => {
                // Immediate cleanup of mod visual classes to prevent "invisible label" glitches
                if (this.inputField.value.trim() === '' || this.inputField.value === this.savedRestoreUrl) {
                    this.setActiveIndex(-1);
                    this.selectorContainer?.classList.remove('has-input');
                }

                setTimeout(() => {
                    // Ensure we aren't just clicking the dropdown or a mod button
                    if (document.activeElement !== this.inputField) {

                        // Forcefully restore lost URL if enabled and Vivaldi wiped it
                        if (this.forceRestore && this.inputField.value.trim() === '' && this.savedRestoreUrl) {
                            const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                            if (nativeSetter) {
                                // 1. Set text value
                                nativeSetter.call(this.inputField, this.savedRestoreUrl);

                                // 2. Synchronize React state
                                this.inputField.dispatchEvent(new Event('input', { bubbles: true }));
                                this.inputField.dispatchEvent(new Event('change', { bubbles: true }));

                                // 3. Robust trigger for Vivaldi's "Display" layer
                                const escEvent = new KeyboardEvent('keydown', {
                                    key: 'Escape', code: 'Escape', keyCode: 27, which: 27,
                                    bubbles: true, cancelable: true
                                });
                                this.inputField.dispatchEvent(escEvent);

                                // 4. Force a secondary blur to commit the restored state to Vivaldi's UI
                                requestAnimationFrame(() => {
                                    this.inputField.dispatchEvent(new Event('blur', { bubbles: true }));
                                });
                            }
                        }
                    }
                }, 150); // Slightly faster response time
            });

            if (!window.__ses_keydown_injected) {
                window.__ses_keydown_injected = true;
                window.addEventListener('keydown', (e) => {
                    const activeIsInput = document.activeElement === this.inputField;

                    if (e.key === 'Escape' && activeIsInput) {
                        const isDropdownOpen = document.querySelector('.OmniDropdown');
                        // Vivaldi native Escape handles dropdown first. Second escape usually restores URL.
                        // If Vivaldi lost the URL state, we aggressively inject our manual backup!
                        if (!isDropdownOpen && this.savedRestoreUrl && this.inputField.value !== this.savedRestoreUrl) {
                            const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                            if (nativeSetter) {
                                e.preventDefault();
                                e.stopPropagation();
                                nativeSetter.call(this.inputField, this.savedRestoreUrl);
                                this.inputField.dispatchEvent(new Event('input', { bubbles: true }));
                                this.inputField.select(); // Native vivaldi behavior automatically selects all on escape restore
                            }
                            this.setActiveIndex(-1);
                            this.selectorContainer?.classList.remove('has-input');
                        }
                    }

                    if (activeIsInput && this.selectorContainer?.classList.contains('has-input')) {
                        const favEngines = this.favorites.map(f => this.engines.find(eng => eng.guid === f)).filter(Boolean);
                        if (favEngines.length === 0) return;

                        if (e.key === (this.cycleKey || 'Tab')) {
                            e.preventDefault();
                            e.stopPropagation();
                            e.stopImmediatePropagation();

                            let nextIndex = this.activeIndex + (e.shiftKey ? -1 : 1);
                            // Force persistent mod lock explicitly. NEVER fall off back to default!
                            if (nextIndex >= favEngines.length) nextIndex = 0;
                            if (nextIndex < 0) nextIndex = favEngines.length - 1;

                            this.setActiveIndex(nextIndex, true); // TRUE signifies manual user rotation
                        } else if (e.key === 'Enter') {
                            if (this.activeIndex !== -1) {
                                // Let Vivaldi's native processor handle the search natively!
                                // We don't even need to hijack it anymore because we update the native default search engine.
                            }
                        }
                    }
                }, true);
            }
        }

        setActiveIndex(index, triggeredByTab = false) {
            // Prevent unnecessary processing
            if (this.activeIndex === index) return;
            this.activeIndex = index;

            if (!this.selectorContainer) return;

            const btns = this.selectorContainer.querySelectorAll('.SearchEngineSelector-Button[data-guid]');
            btns.forEach(btn => btn.classList.remove('active'));

            if (index >= 0 && index < btns.length) {
                btns[index].classList.add('active');
            }

            // Update routing logic using Vivaldi's raw Chromium API
            if (this.leftBadge) {
                if (index !== -1) {
                    const favEngines = this.favorites.map(f => this.engines.find(e => e.guid === f)).filter(Boolean);
                    const activeEngine = favEngines[index];

                    if (activeEngine) {
                        // Inject directly into Vivaldi's settings.
                        if (window.vivaldi && window.vivaldi.searchEngines) {
                            try { vivaldi.searchEngines.setDefault('defaultSearch', activeEngine.guid); } catch (e) { }

                            // ONLY force a React redraw if strictly hitting Tab, to never eat a user's typed keystrokes.
                            // Must have timeout to wait for IPC backend registration of setDefault.
                            if (triggeredByTab && this.inputField && this.inputField.value.trim().length > 0) {
                                setTimeout(() => {
                                    const original = this.inputField.value;
                                    const start = this.inputField.selectionStart;
                                    const end = this.inputField.selectionEnd;

                                    // Vivaldi React 17 relies strictly on native input value traps for synthetic events
                                    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                                    if (nativeSetter) {
                                        nativeSetter.call(this.inputField, original + ' ');
                                        this.inputField.dispatchEvent(new Event('input', { bubbles: true }));
                                        nativeSetter.call(this.inputField, original);
                                        this.inputField.dispatchEvent(new Event('input', { bubbles: true }));
                                    } else {
                                        this.inputField.value = original + ' ';
                                        this.inputField.dispatchEvent(new Event('input', { bubbles: true }));
                                        this.inputField.value = original;
                                        this.inputField.dispatchEvent(new Event('input', { bubbles: true }));
                                    }

                                    // Restore their typing cursor seamlessly
                                    try { this.inputField.setSelectionRange(start, Math.max(start, end)); } catch (e) { }
                                }, 40); // 40ms safety window for chromium renderer
                            }
                        }

                        if (this.showLabel) {
                            this.leftBadge.innerHTML = `<img src="${activeEngine.faviconUrl || 'chrome://favicon/'}"> <span>Search ${activeEngine.name}</span>`;
                            this.leftBadge.classList.add('visible');
                            this.addressField.classList.add('ses-hide-siteinfo');
                        } else {
                            // Keep text badge completely hidden
                            this.leftBadge.classList.remove('visible');
                            this.addressField.classList.remove('ses-hide-siteinfo');
                        }
                    }
                } else {
                    // Cleanup badge and restore native SiteInfo visibility
                    this.leftBadge.classList.remove('visible');
                    this.addressField?.classList.remove('ses-hide-siteinfo');
                }
            }
        }

        async executeSearch() {
            if (this.activeIndex === -1 || !this.inputField) return;

            // Timeout ensures the vivaldi.searchEngines.setDefault and React sync 
            // from setActiveIndex(index, true) have completed.
            setTimeout(() => {
                if (this.inputField && this.inputField.value.trim() !== "") {
                    // Focus is often lost during a mouse click, must recover it for Enter to work
                    this.inputField.focus();

                    const eventOptions = {
                        key: 'Enter',
                        code: 'Enter',
                        keyCode: 13,
                        which: 13,
                        bubbles: true,
                        cancelable: true
                    };

                    // Dispatch full sequence to satisfy all Vivaldi/Chromium listeners
                    this.inputField.dispatchEvent(new KeyboardEvent('keydown', eventOptions));
                    this.inputField.dispatchEvent(new KeyboardEvent('keypress', eventOptions));
                    this.inputField.dispatchEvent(new KeyboardEvent('keyup', eventOptions));
                }

                this.selectorContainer?.classList.remove('has-input');
                this.setActiveIndex(-1);
            }, 60);
        }

        updateSelectorState(val) {
            const cleanVal = (val || "").trim();
            this.lastValue = val;

            if (cleanVal.length > 0 && !cleanVal.includes('.') && !cleanVal.includes('://') && !cleanVal.includes('/')) {
                this.selectorContainer?.classList.add('has-input');
                // Automatically activate the first modded label if nothing is selected
                if (this.activeIndex === -1) {
                    const favEngines = this.engines.filter(en => this.favorites.includes(en.guid));
                    if (favEngines.length > 0) {
                        this.setActiveIndex(0, false); // FALSE prevents bouncing logic
                    }
                }
            } else {
                this.selectorContainer?.classList.remove('has-input');
                this.setActiveIndex(-1, false);
            }
        }
    }

    // Initialize
    let initInterval = setInterval(() => {
        if (document.querySelector('#browser')) {
            window.searchEngineSelectorMod = new SearchEngineSelector();
            clearInterval(initInterval);
        }
    }, 100);

})();
