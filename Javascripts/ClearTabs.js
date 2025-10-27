(function() {
	'use strict';

	// Constants
	const SELECTORS = {
		TAB_STRIP: '.tab-strip',
		SEPARATOR: '.tab-strip .separator',
		TAB_WRAPPER: '.tab-wrapper',
		TAB_POSITION: '.tab-position',
		TAB_STACK: '.svg-tab-stack',
		ACTIVE: '.active'
	};

	const CLASSES = {
		BUTTON: 'clear-tabs-below-button',
		PINNED: 'is-pinned',
		SUBSTACK: 'is-substack'
	};

	const DELAYS = {
		INIT: 500,
		MUTATION: 50,
		WORKSPACE_SWITCH: 100,
		RETRY: 500,
		REATTACH: 100,
		DEBOUNCE: 150  // Debounce delay for rapid mutations
	};

	// Debounce timer
	let debounceTimer = null;

	// Create clear button element
	function createClearButton() {
		const button = document.createElement('div');
		button.className = CLASSES.BUTTON;
		button.textContent = 'Clear';
		return button;
	}

	// Check if element is a tab stack
	function isTabStack(element) {
		const tabPosition = element.querySelector(SELECTORS.TAB_POSITION);
		return tabPosition?.classList.contains(CLASSES.SUBSTACK) || 
		       element.querySelector(SELECTORS.TAB_STACK) !== null;
	}

	// Check if tab is active
	function isTabActive(tabPosition) {
		return tabPosition.querySelector(SELECTORS.ACTIVE) !== null;
	}

	// Extract numeric tab ID from data-id attribute
	function extractTabId(tabWrapper) {
		if (!tabWrapper) return null;
		
		const dataId = tabWrapper.getAttribute('data-id');
		if (!dataId) return null;
		
		const numericId = parseInt(dataId.replace('tab-', ''));
		return isNaN(numericId) ? null : numericId;
	}

	// Collect tab IDs to close from separator onwards
	function collectTabsToClose(separator) {
		const tabIds = [];
		let element = separator.nextElementSibling;

		while (element) {
			if (element.tagName === 'SPAN') {
				// Skip tab stacks
				if (isTabStack(element)) {
					element = element.nextElementSibling;
					continue;
				}

				const tabPosition = element.querySelector(SELECTORS.TAB_POSITION);
				
				// Only process unpinned, inactive tabs
				if (tabPosition && 
				    !tabPosition.classList.contains(CLASSES.PINNED) && 
				    !isTabActive(tabPosition)) {
					
					const tabWrapper = element.querySelector(SELECTORS.TAB_WRAPPER);
					const tabId = extractTabId(tabWrapper);
					
					if (tabId !== null) {
						tabIds.push(tabId);
					}
				}
			}
			element = element.nextElementSibling;
		}

		return tabIds;
	}

	// Close tabs below separator
	function closeTabsBelow(separator) {
		const tabIds = collectTabsToClose(separator);

		if (tabIds.length === 0) return;

		chrome.tabs.remove(tabIds, function() {
			if (chrome.runtime.lastError) {
				console.error('Error closing tabs:', chrome.runtime.lastError);
			} else {
				// Reattach buttons after tabs are closed
				scheduleAttachButtons(DELAYS.REATTACH);
			}
		});
	}

	// Attach clear buttons to all separators
	function attachButtons() {
		const separators = document.querySelectorAll(SELECTORS.SEPARATOR);

		separators.forEach(separator => {
			// Skip if button already exists
			if (separator.querySelector(`.${CLASSES.BUTTON}`)) {
				return;
			}

			const button = createClearButton();
			separator.appendChild(button);

			// Handle click event
			button.addEventListener('click', function(e) {
				e.stopPropagation();
				closeTabsBelow(separator);
			});
		});
	}

	// Debounced button attachment scheduler
	function scheduleAttachButtons(delay = DELAYS.DEBOUNCE) {
		// Clear existing timer
		if (debounceTimer !== null) {
			clearTimeout(debounceTimer);
		}

		// Schedule new attachment
		debounceTimer = setTimeout(() => {
			attachButtons();
			debounceTimer = null;
		}, delay);
	}

	// Setup mutation observer for tab strip changes
	function observeTabStrip() {
		const tabStrip = document.querySelector(SELECTORS.TAB_STRIP);
		
		if (!tabStrip) {
			setTimeout(observeTabStrip, DELAYS.RETRY);
			return;
		}

		const observer = new MutationObserver(function(mutations) {
			let hasTabChange = false;
			let hasWorkspaceSwitch = false;

			for (const mutation of mutations) {
				// Check for new tab elements
				if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
					for (const node of mutation.addedNodes) {
						if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'SPAN') {
							hasTabChange = true;
							break;
						}
					}
				}

				// Check for workspace switch (aria-owns change)
				if (mutation.type === 'attributes' && mutation.attributeName === 'aria-owns') {
					hasWorkspaceSwitch = true;
				}

				if (hasTabChange && hasWorkspaceSwitch) break;
			}

			// Use debounced scheduling for all updates
			if (hasTabChange || hasWorkspaceSwitch) {
				// Workspace switches get slightly longer delay for stability
				const delay = hasWorkspaceSwitch ? DELAYS.WORKSPACE_SWITCH : DELAYS.MUTATION;
				scheduleAttachButtons(delay);
			}
		});

		observer.observe(tabStrip, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ['aria-owns']
		});
	}

	// Initialize the extension
	function init() {
		setTimeout(attachButtons, DELAYS.INIT);
		observeTabStrip();
	}

	// Start when DOM is ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
