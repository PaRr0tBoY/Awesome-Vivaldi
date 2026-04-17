// ==UserScript==
// @name         Mod: Use Tab cycler to close multiple tabs at once
// @description  Mark multiple tabs with checkboxes as you navigate the Tab Cycler, then close them all at once.
// @version      1.1
// @author       barbudo2005
// @match        *://*/*
// ==/UserScript==

(function() {
    'use strict';

    // ============================================================
    // CONFIGURATION
    // ============================================================
    const config = {
        markKey: 'KeyM',           
        markAllKey: 'KeyD',        
        useMultipleKeys: true,     
    };

    // ============================================================
    // STATE
    // ============================================================
    let cyclerActive = false;
    let markedTabIds = new Set();
    let processedTabs = new Set();
    let focusObserver = null;
    let currentReferenceTab = null;

    console.log('🚀 Tab Cycler Batch Close v1.1 loaded');

    // ============================================================
    // KEYBOARD LISTENERS
    // ============================================================
    
    window.addEventListener('keydown', function(e) {
        if (!cyclerActive || !e.ctrlKey) return;
        
        let isMarkKey = false;
        
        if (config.useMultipleKeys) {
            isMarkKey = (e.code === 'KeyC' || e.code === 'KeyV' || e.code === 'KeyB' || 
                        e.code === 'KeyN' || e.code === 'KeyM');
        } else {
            isMarkKey = (e.code === config.markKey);
        }
        
        if (isMarkKey) {
            e.preventDefault();
            e.stopPropagation();
            
            const activeLi = document.querySelector('.tabswitcher.list li.selected');
            if (!activeLi) return;
            
            const checkbox = activeLi.querySelector('.tab-checkbox');
            if (!checkbox) return;
            
            const tabId = parseInt(checkbox.dataset.tabId);
            
            if (checkbox.checked) {
                checkbox.checked = false;
                checkbox.removeAttribute('checked');
                markedTabIds.delete(tabId);
            } else {
                checkbox.checked = true;
                checkbox.setAttribute('checked', '');
                markedTabIds.add(tabId);
            }
            
            return false;
        }
    }, true);

    window.addEventListener('keydown', function(e) {
        if (!cyclerActive) return;
        
        if (e.code === config.markAllKey && e.ctrlKey) {
            e.preventDefault();
            e.stopPropagation();
            
            if (!currentReferenceTab) return;
            
            chrome.tabs.get(currentReferenceTab, (tab) => {
                if (chrome.runtime.lastError || !tab) return;
                
                try {
                    const url = new URL(tab.url);
                    const domain = url.hostname.replace(/^www\./, '');
                    
                    chrome.tabs.query({currentWindow: true}, (allTabs) => {
                        const tabsFromDomain = [];
                        allTabs.forEach(t => {
                            try {
                                const tUrl = new URL(t.url);
                                const tDomain = tUrl.hostname.replace(/^www\./, '');
                                if (tDomain === domain) {
                                    tabsFromDomain.push(t);
                                }
                            } catch (e) {}
                        });
                        
                        const alreadyMarked = tabsFromDomain.filter(t => markedTabIds.has(t.id));
                        
                        if (alreadyMarked.length === tabsFromDomain.length) {
                            tabsFromDomain.forEach(t => {
                                markedTabIds.delete(t.id);
                                const cb = document.querySelector(`.tab-checkbox[data-tab-id="${t.id}"]`);
                                if (cb) {
                                    cb.checked = false;
                                    cb.removeAttribute('checked');
                                }
                            });
                        } else {
                            tabsFromDomain.forEach(t => {
                                if (!markedTabIds.has(t.id)) {
                                    markedTabIds.add(t.id);
                                    const cb = document.querySelector(`.tab-checkbox[data-tab-id="${t.id}"]`);
                                    if (cb) {
                                        cb.checked = true;
                                        cb.setAttribute('checked', '');
                                    }
                                }
                            });
                        }
                    });
                } catch (e) {
                    console.error('Invalid URL for reference tab');
                }
            });
            
            return false;
        }
    }, true);

    document.addEventListener('keyup', function(e) {
        if (e.key === 'Control' || e.key === 'Alt') {
            if (markedTabIds.size === 0) return;
            executeBatchClose();
        }
    }, true);

    function executeBatchClose() {
        const idsToClose = Array.from(markedTabIds);
        
        chrome.tabs.remove(idsToClose, () => {
            if (chrome.runtime.lastError) {
                console.error('❌ Batch close error:', chrome.runtime.lastError);
            }
            markedTabIds.clear();
        });
    }

    // ============================================================
    // POLLING AND LIFECYCLE
    // ============================================================
    
    setInterval(function() {
        const cycler = document.querySelector('.tabswitcher.list');
        
        if (cycler) {
            if (!cyclerActive) {
                cyclerActive = true;
                processedTabs.clear();
                markedTabIds.clear();
                currentReferenceTab = null;
                applyCustomStyles();
                setupFocusObserver(cycler);
            }
            injectCheckboxes(cycler);
        } else if (cyclerActive) {
            cyclerActive = false;
            processedTabs.clear();
            
            if (markedTabIds.size > 0) {
                executeBatchClose();
            }
            
            if (focusObserver) {
                focusObserver.disconnect();
                focusObserver = null;
            }
        }
    }, 500);

    function setupFocusObserver(cycler) {
        if (focusObserver) return;
        
        focusObserver = new MutationObserver(() => {
            const selectedLi = cycler.querySelector('li.selected');
            if (selectedLi) {
                const checkbox = selectedLi.querySelector('.tab-checkbox');
                if (checkbox) {
                    currentReferenceTab = parseInt(checkbox.dataset.tabId);
                    
                    if (document.activeElement !== checkbox) {
                        checkbox.focus();
                    }
                }
            }
        });
        
        focusObserver.observe(cycler, {
            attributes: true,
            attributeFilter: ['class'],
            subtree: true
        });
    }

    // ============================================================
    // STYLES
    // ============================================================
    
    function applyCustomStyles() {
        if (document.getElementById('tab-cycler-custom-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'tab-cycler-custom-styles';
        style.textContent = `
            .tabswitcher.list li.active-page {
                filter: brightness(1.4) !important;
            }
            
            .tab-checkbox {
                appearance: none;
                -webkit-appearance: none;
                width: 13px !important;
                height: 13px !important;
                min-width: 13px !important;
                min-height: 13px !important;
                border: 1px solid var(--colorFgFadedMost) !important;
                border-radius: 2px !important;
                background: transparent !important;
                cursor: pointer !important;
                position: absolute !important;
                right: 6px !important;
                top: 50% !important;
                transform: translateY(-50%) !important;
                z-index: 99999 !important;
                transition: all 0.15s ease !important;
                pointer-events: auto !important;
            }
            
            .tab-checkbox:hover {
                background-color: var(--colorBg) !important;
                border-color: var(--colorHighlightBg) !important;
                border-width: 2px !important;
            }
            
            /* Override Vivaldi's checkbox ::before and ::after */
            input[type=checkbox].tab-checkbox::before,
            input[type=checkbox].tab-checkbox::after {
                display: none !important;
                content: none !important;
            }
            
            .tab-checkbox:checked {
                border-color: var(--colorFg) !important;
                background-color: var(--colorHighlightBg) !important;
            }
            
            /* Custom checkmark */
            input[type=checkbox].tab-checkbox:checked::after {
                content: '✓' !important;
                display: block !important;
                color: var(--colorFg) !important;
                font-size: 10px !important;
                font-weight: bold !important;
                position: absolute !important;
                top: -1px !important;
                left: 1px !important;
                transform: none !important;
                background: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    // ============================================================
    // CHECKBOX INJECTION
    // ============================================================
    
    function injectCheckboxes(cycler) {
        const tabItems = cycler.querySelectorAll('ul.listed-tabs > li.visual-list');
        
        chrome.tabs.query({currentWindow: true}, (allTabs) => {
            tabItems.forEach((li) => {
                if (processedTabs.has(li)) return;
                if (li.querySelector('.tab-checkbox')) {
                    processedTabs.add(li);
                    return;
                }
                
                let matchingTab = null;
                
                const favicon = li.querySelector('.visual-tab-list-favicon');
                
                if (favicon && favicon.srcset) {
                    const match = favicon.srcset.match(/chrome:\/\/favicon\/size\/\d+\/(.+?)\s/);
                    if (match) {
                        const tabUrl = match[1];
                        matchingTab = allTabs.find(t => t.url === tabUrl);
                    }
                }
                
                if (!matchingTab) {
                    processedTabs.add(li);
                    return;
                }
                
                li.style.position = 'relative';
                li.style.display = 'flex';
                li.style.alignItems = 'center';
                li.style.gap = '8px';
                li.style.paddingRight = '25px';
                li.style.minWidth = '0';
                
                const textNodes = Array.from(li.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
                textNodes.forEach(textNode => {
                    if (textNode.textContent.trim()) {
                        const span = document.createElement('span');
                        span.textContent = textNode.textContent;
                        span.style.overflow = 'hidden';
                        span.style.textOverflow = 'ellipsis';
                        span.style.whiteSpace = 'nowrap';
                        span.style.flex = '1';
                        span.style.minWidth = '0';
                        span.style.cursor = 'pointer';
                        
                        span.addEventListener('mousedown', function(e) {
                            chrome.tabs.update(matchingTab.id, {active: true});
                            
                            if (markedTabIds.size > 0) {
                                executeBatchClose();
                            }
                        }, true);
                        
                        li.replaceChild(span, textNode);
                    }
                });
                
                if (favicon) {
                    favicon.style.flexShrink = '0';
                }
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'tab-checkbox';
                checkbox.dataset.tabId = matchingTab.id;
                
                checkbox.addEventListener('change', function() {
                    const tabId = parseInt(checkbox.dataset.tabId);
                    currentReferenceTab = tabId;
                    
                    if (checkbox.checked) {
                        markedTabIds.add(tabId);
                    } else {
                        markedTabIds.delete(tabId);
                    }
                });
                
                checkbox.addEventListener('contextmenu', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const tabId = parseInt(checkbox.dataset.tabId);
                    
                    chrome.tabs.get(tabId, (tab) => {
                        if (chrome.runtime.lastError || !tab) return;
                        
                        try {
                            const url = new URL(tab.url);
                            const domain = url.hostname.replace(/^www\./, '');
                            
                            chrome.tabs.query({currentWindow: true}, (allTabs) => {
                                const tabsFromDomain = [];
                                allTabs.forEach(t => {
                                    try {
                                        const tUrl = new URL(t.url);
                                        const tDomain = tUrl.hostname.replace(/^www\./, '');
                                        if (tDomain === domain) {
                                            tabsFromDomain.push(t);
                                        }
                                    } catch (e) {}
                                });
                                
                                const alreadyMarked = tabsFromDomain.filter(t => markedTabIds.has(t.id));
                                
                                if (alreadyMarked.length === tabsFromDomain.length) {
                                    tabsFromDomain.forEach(t => {
                                        markedTabIds.delete(t.id);
                                        const cb = document.querySelector(`.tab-checkbox[data-tab-id="${t.id}"]`);
                                        if (cb) {
                                            cb.checked = false;
                                            cb.removeAttribute('checked');
                                        }
                                    });
                                } else {
                                    tabsFromDomain.forEach(t => {
                                        if (!markedTabIds.has(t.id)) {
                                            markedTabIds.add(t.id);
                                            const cb = document.querySelector(`.tab-checkbox[data-tab-id="${t.id}"]`);
                                            if (cb) {
                                                cb.checked = true;
                                                cb.setAttribute('checked', '');
                                            }
                                        }
                                    });
                                }
                            });
                        } catch (e) {
                            console.error('Invalid URL');
                        }
                    });
                    
                    return false;
                }, true);
                
                checkbox.addEventListener('mousedown', function(e) {
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                }, true);
                
                checkbox.addEventListener('mouseup', function(e) {
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                }, true);
                
                checkbox.addEventListener('click', function(e) {
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                }, true);
                
                li.appendChild(checkbox);
                processedTabs.add(li);
            });
        });
    }

    console.log('✅ Active');
})();



