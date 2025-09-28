/**
 * Auto-expand tabbar on drag and drop operations
 * This script detects when files/links are dragged over collapsed tabbars
 * and automatically expands them to facilitate easier tab switching during drag operations
 */

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        // Debounce delay for drag events (ms)
        debounceDelay: 30,
        // Class to add when drag is over tabbar
        dragOverClass: 'drag-over',
        // Selectors for tabbars
        mainTabbarSelector: '#tabs-container',
        subTabbarSelector: '#tabs-subcontainer',
        // Distance threshold for proximity detection (pixels)
        proximityThreshold: 25,
        // Auto-collapse delay after drag leaves area (ms)
        autoCollapseDelay: 200
    };

    // State management
    let dragActive = false;
    let expandedTabbars = new Set();
    let debounceTimer = null;
    let collapseTimer = null;
    let dragCounter = 0;
    let lastDragPosition = { x: 0, y: 0 };

    /**
     * Debounced function execution
     */
    function debounce(func, delay) {
        return function(...args) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * Get all tabbar elements
     */
    function getTabbars() {
        const mainTabbar = document.querySelector(CONFIG.mainTabbarSelector);
        const subTabbar = document.querySelector(CONFIG.subTabbarSelector);
        return [mainTabbar, subTabbar].filter(Boolean);
    }

    /**
     * Add drag-over class to tabbar
     */
    function expandTabbar(tabbar) {
        if (tabbar && !expandedTabbars.has(tabbar)) {
            tabbar.classList.add(CONFIG.dragOverClass);
            expandedTabbars.add(tabbar);
            console.log('Expanded tabbar:', tabbar.id);
        }
    }

    /**
     * Remove drag-over class from tabbar
     */
    function collapseTabbar(tabbar) {
        if (tabbar && expandedTabbars.has(tabbar)) {
            tabbar.classList.remove(CONFIG.dragOverClass);
            expandedTabbars.delete(tabbar);
            console.log('Collapsed tabbar:', tabbar.id);
        }
    }

    /**
     * Collapse all expanded tabbars
     */
    function collapseAllTabbars() {
        expandedTabbars.forEach(tabbar => {
            tabbar.classList.remove(CONFIG.dragOverClass);
        });
        expandedTabbars.clear();
        console.log('All tabbars collapsed');
    }

    /**
     * Schedule auto-collapse with delay
     */
    function scheduleAutoCollapse() {
        clearTimeout(collapseTimer);
        collapseTimer = setTimeout(() => {
            if (!dragActive || dragCounter <= 0) {
                collapseAllTabbars();
            }
        }, CONFIG.autoCollapseDelay);
    }

    /**
     * Check if point is near tabbar (within proximity threshold)
     */
    function isNearTabbar(x, y, tabbar) {
        if (!tabbar) return false;
        
        const rect = tabbar.getBoundingClientRect();
        const threshold = CONFIG.proximityThreshold;
        
        return (x >= rect.left - threshold && 
                x <= rect.right + threshold && 
                y >= rect.top - threshold && 
                y <= rect.bottom + threshold);
    }

    /**
     * Check if drag is over an expanded tabbar content area
     */
    function isOverTabbarContent(x, y) {
        const tabbars = getTabbars();
        return tabbars.some(tabbar => {
            if (!tabbar || !expandedTabbars.has(tabbar)) return false;
            
            const rect = tabbar.getBoundingClientRect();
            return (x >= rect.left && x <= rect.right && 
                   y >= rect.top && y <= rect.bottom);
        });
    }

    /**
     * Handle drag enter event - DON'T prevent default to preserve native behavior
     */
    function handleDragEnter(event) {
        dragCounter++;
        
        if (!dragActive) {
            dragActive = true;
            console.log('Drag operation started');
        }

        clearTimeout(collapseTimer);
        
        // Update position
        lastDragPosition.x = event.clientX;
        lastDragPosition.y = event.clientY;

        // Check if dragging near any tabbar
        const tabbars = getTabbars();
        const x = event.clientX;
        const y = event.clientY;

        tabbars.forEach(tabbar => {
            if (isNearTabbar(x, y, tabbar)) {
                expandTabbar(tabbar);
            }
        });

        // DON'T prevent default - let native drag behavior work
    }

    /**
     * Handle drag over event - Only prevent default when necessary
     */
    const handleDragOver = debounce(function(event) {
        if (!dragActive) return;

        const x = event.clientX;
        const y = event.clientY;
        
        // Update position
        lastDragPosition.x = x;
        lastDragPosition.y = y;
        
        const tabbars = getTabbars();
        let anyTabbarNear = false;
        let overContent = isOverTabbarContent(x, y);

        tabbars.forEach(tabbar => {
            if (isNearTabbar(x, y, tabbar)) {
                expandTabbar(tabbar);
                anyTabbarNear = true;
            }
        });

        // Only collapse tabbars that are far away
        if (!anyTabbarNear) {
            expandedTabbars.forEach(tabbar => {
                if (!isNearTabbar(x, y, tabbar)) {
                    collapseTabbar(tabbar);
                }
            });
        }

        // Only prevent default if we're NOT over tabbar content
        // This preserves native tab switching and drop indicators
        if (!overContent) {
            // Let native behavior handle tab interactions
        } else {
            // We're over expanded tabbar content, let native behavior work
        }
    }, CONFIG.debounceDelay);

    /**
     * Handle drag leave event
     */
    function handleDragLeave(event) {
        dragCounter--;
        
        // If we've left all drag contexts
        if (dragCounter <= 0) {
            dragCounter = 0;
            scheduleAutoCollapse();
        }
    }

    /**
     * Handle drag end event
     */
    function handleDragEnd(event) {
        console.log('Drag operation ended');
        dragActive = false;
        dragCounter = 0;
        clearTimeout(collapseTimer);
        
        // Immediate collapse on drag end
        setTimeout(() => {
            collapseAllTabbars();
        }, 100);
    }

    /**
     * Handle drop event
     */
    function handleDrop(event) {
        console.log('Drop event detected');
        dragActive = false;
        dragCounter = 0;
        clearTimeout(collapseTimer);
        
        // Immediate collapse on drop
        setTimeout(() => {
            collapseAllTabbars();
        }, 100);
    }

    /**
     * Handle mouse leave to ensure cleanup
     */
    function handleMouseLeave(event) {
        // If mouse leaves the window area during drag
        if (dragActive && (event.clientY <= 0 || event.clientX <= 0 || 
            event.clientX >= window.innerWidth || event.clientY >= window.innerHeight)) {
            scheduleAutoCollapse();
        }
    }

    /**
     * Initialize event listeners with proper capture settings
     */
    function initializeEventListeners() {
        // Use capture for enter/leave to catch events early, but don't prevent default
        document.addEventListener('dragenter', handleDragEnter, { capture: true, passive: true });
        document.addEventListener('dragover', handleDragOver, { capture: false, passive: true });
        document.addEventListener('dragleave', handleDragLeave, { capture: true, passive: true });
        document.addEventListener('dragend', handleDragEnd, { capture: true, passive: true });
        document.addEventListener('drop', handleDrop, { capture: true, passive: true });

        // Additional cleanup handlers
        document.addEventListener('mouseleave', handleMouseLeave, { passive: true });
        
        // Handle window focus loss
        window.addEventListener('blur', () => {
            if (dragActive) {
                dragActive = false;
                dragCounter = 0;
                collapseAllTabbars();
            }
        });

        console.log('Drag & Drop tabbar expansion initialized');
    }

    /**
     * Clean up event listeners
     */
    function cleanup() {
        document.removeEventListener('dragenter', handleDragEnter, true);
        document.removeEventListener('dragover', handleDragOver);
        document.removeEventListener('dragleave', handleDragLeave, true);
        document.removeEventListener('dragend', handleDragEnd, true);
        document.removeEventListener('drop', handleDrop, true);
        document.removeEventListener('mouseleave', handleMouseLeave);

        clearTimeout(debounceTimer);
        clearTimeout(collapseTimer);
        collapseAllTabbars();
        
        console.log('Drag & Drop tabbar expansion cleaned up');
    }

    /**
     * Wait for DOM to be ready
     */
    function waitForDOM() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeEventListeners);
        } else {
            // Small delay to ensure all elements are rendered
            setTimeout(initializeEventListeners, 100);
        }
    }

    /**
     * Monitor for tab changes and ensure cleanup
     */
    function monitorTabChanges() {
        const observer = new MutationObserver(() => {
            // If tabs change significantly, reset state
            if (expandedTabbars.size > 0) {
                const tabbars = getTabbars();
                expandedTabbars.forEach(tabbar => {
                    if (!tabbars.includes(tabbar) || !document.body.contains(tabbar)) {
                        expandedTabbars.delete(tabbar);
                    }
                });
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });

        return observer;
    }

    // Initialize when script loads
    waitForDOM();
    const observer = monitorTabChanges();

    // Expose cleanup function for debugging
    window.cleanupTabbarDragDrop = () => {
        cleanup();
        if (observer) observer.disconnect();
    };

    // Handle page unload
    window.addEventListener('beforeunload', cleanup);

})();
