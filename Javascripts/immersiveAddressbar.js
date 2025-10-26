/*
	Vivaldi Immersive Address Bar
	Version: 1.0

	Vivaldi Immersive Address Bar is a JS modification for Vivaldi Browser
	that adapts the address bar background color to match the webpage's
	primary color by analyzing the top portion of the page.
*/

(function() {
	// ========================================
	// Configuration
	// ========================================
	
	const CONFIG = {
		UPDATE_DEBOUNCE_MS: 1000,
		CAPTURE_COOLDOWN_MS: 2000, // Minimum time between captures for the same tab
		SAMPLE_HEIGHT: 40,
		COLOR_CACHE_SIZE: 50,
		SKIP_PIXELS: 10,
		COLOR_QUANTIZE_STEP: 10,
		ALPHA_THRESHOLD: 128,
		LIGHT_COLOR_THRESHOLD: 250,
		DARK_COLOR_THRESHOLD: 5,
		LUMINANCE_THRESHOLD: 0.5,
		TRANSITION_DURATION: '0.3s',
		STARTUP_CHECK_INTERVAL: 100,
		MAX_CAPTURE_RETRIES: 1 // Number of retries for failed captures
	};

	const INTERNAL_URL_PATTERN = /^(chrome|vivaldi|devtools|chrome-extension):\/\//;
	const HEX_COLOR_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

	// ========================================
	// State Management
	// ========================================
	
	const state = {
		colorCache: new Map(),
		updateTimeouts: new Map(),
		lastCaptureTime: new Map(), // Track last capture time per tab
		currentTabId: null
	};

	// ========================================
	// DOM Utilities
	// ========================================
	
	const dom = {
		getBrowser: () => document.getElementById('browser'),
		getRoot: () => document.documentElement
	};

	// ========================================
	// Color Utilities
	// ========================================
	
	const colorUtils = {
		rgbToHex(r, g, b) {
			return '#' + [r, g, b]
				.map(x => x.toString(16).padStart(2, '0'))
				.join('');
		},

		shouldUseLightText(r, g, b) {
			const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
			return luminance < CONFIG.LUMINANCE_THRESHOLD;
		},

		parseHexColor(hex) {
			const normalized = hex.length === 4
				? '#' + [...hex.slice(1)].map(x => x + x).join('')
				: hex;
			
			return {
				hex: normalized,
				r: parseInt(normalized.slice(1, 3), 16),
				g: parseInt(normalized.slice(3, 5), 16),
				b: parseInt(normalized.slice(5, 7), 16)
			};
		},

		shouldSkipPixel(r, g, b, a) {
			return a < CONFIG.ALPHA_THRESHOLD ||
				(r > CONFIG.LIGHT_COLOR_THRESHOLD && g > CONFIG.LIGHT_COLOR_THRESHOLD && b > CONFIG.LIGHT_COLOR_THRESHOLD) ||
				(r < CONFIG.DARK_COLOR_THRESHOLD && g < CONFIG.DARK_COLOR_THRESHOLD && b < CONFIG.DARK_COLOR_THRESHOLD);
		},

		quantizeColor(r, g, b) {
			const step = CONFIG.COLOR_QUANTIZE_STEP;
			return {
				r: Math.round(r / step) * step,
				g: Math.round(g / step) * step,
				b: Math.round(b / step) * step
			};
		}
	};

	// ========================================
	// Cache Management
	// ========================================
	
	const cache = {
		getDomain(url) {
			if (!url) return null;
			try {
				return new URL(url).hostname;
			} catch {
				return null;
			}
		},

		get(url) {
			const domain = this.getDomain(url);
			return domain ? state.colorCache.get(domain) : null;
		},

		set(url, color) {
			const domain = this.getDomain(url);
			if (!domain) return;

			state.colorCache.set(domain, color);

			if (state.colorCache.size > CONFIG.COLOR_CACHE_SIZE) {
				const firstKey = state.colorCache.keys().next().value;
				state.colorCache.delete(firstKey);
			}
		},

		clear() {
			state.colorCache.clear();
		}
	};

	// ========================================
	// Capture Rate Limiting
	// ========================================
	
	const captureRateLimit = {
		canCapture(tabId) {
			const now = Date.now();
			const lastCapture = state.lastCaptureTime.get(tabId) || 0;
			return (now - lastCapture) >= CONFIG.CAPTURE_COOLDOWN_MS;
		},

		recordCapture(tabId) {
			state.lastCaptureTime.set(tabId, Date.now());
		},

		clearRecord(tabId) {
			state.lastCaptureTime.delete(tabId);
		}
	};

	// ========================================
	// Color Extraction
	// ========================================
	
	const colorExtractor = {
		async getThemeColor(tabId) {
			try {
				const [{ result }] = await chrome.scripting.executeScript({
					target: { tabId },
					func: () => {
						const meta = document.querySelector('meta[name="theme-color"]');
						return meta ? meta.content : null;
					}
				});

				if (result && HEX_COLOR_PATTERN.test(result)) {
					return colorUtils.parseHexColor(result);
				}
			} catch (error) {
				// Silently fail - theme color is optional
			}
			return null;
		},

		async captureTab(tabId, retryCount = 0) {
			try {
				// Check rate limit before attempting capture
				if (!captureRateLimit.canCapture(tabId)) {
					console.log('Capture rate limited for tab:', tabId);
					return null;
				}

				const tab = await chrome.tabs.get(tabId);
				if (!tab?.url || INTERNAL_URL_PATTERN.test(tab.url)) {
					return null;
				}

				const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
				captureRateLimit.recordCapture(tabId);
				return dataUrl;

			} catch (error) {
				// Only log on first failure to reduce console noise
				if (retryCount === 0) {
					console.log('Failed to capture tab (will retry once):', error.message);
				}

				// Retry once if this was the first attempt
				if (retryCount < CONFIG.MAX_CAPTURE_RETRIES) {
					await new Promise(resolve => setTimeout(resolve, 500));
					return this.captureTab(tabId, retryCount + 1);
				}

				return null;
			}
		},

		analyzeImage(dataUrl) {
			return new Promise((resolve) => {
				const img = new Image();
				
				img.onload = () => {
					const canvas = document.createElement('canvas');
					const ctx = canvas.getContext('2d');
					
					const sampleHeight = Math.min(CONFIG.SAMPLE_HEIGHT, img.height);
					canvas.width = img.width;
					canvas.height = sampleHeight;
					
					ctx.drawImage(img, 0, 0, img.width, sampleHeight, 0, 0, img.width, sampleHeight);
					const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
					
					resolve(this.calculateDominantColor(imageData));
				};
				
				img.onerror = () => resolve(null);
				img.src = dataUrl;
			});
		},

		calculateDominantColor(imageData) {
			const data = imageData.data;
			const colorCounts = new Map();

			for (let i = 0; i < data.length; i += 4 * CONFIG.SKIP_PIXELS) {
				const r = data[i];
				const g = data[i + 1];
				const b = data[i + 2];
				const a = data[i + 3];
				
				if (colorUtils.shouldSkipPixel(r, g, b, a)) continue;
				
				const quantized = colorUtils.quantizeColor(r, g, b);
				const key = `${quantized.r},${quantized.g},${quantized.b}`;
				
				colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
			}

			if (colorCounts.size === 0) return null;

			let maxCount = 0;
			let dominantColorKey = null;
			
			for (const [key, count] of colorCounts.entries()) {
				if (count > maxCount) {
					maxCount = count;
					dominantColorKey = key;
				}
			}

			if (!dominantColorKey) return null;
			
			const [r, g, b] = dominantColorKey.split(',').map(Number);
			return {
				hex: colorUtils.rgbToHex(r, g, b),
				r, g, b
			};
		},

		async getDominantColor(tabId) {
			const dataUrl = await this.captureTab(tabId);
			if (!dataUrl) return null;
			
			return await this.analyzeImage(dataUrl);
		}
	};

	// ========================================
	// CSS Variables Management
	// ========================================
	
	const cssVariables = {
		setColor(colorData) {
			const root = dom.getRoot();
			if (!root) return;

			if (!colorData) {
				this.reset();
				return;
			}

			const { hex, r, g, b } = colorData;
			const textColor = colorUtils.shouldUseLightText(r, g, b) ? '#ffffff' : '#000000';

			root.style.setProperty('--immersive-bg-color', hex);
			root.style.setProperty('--immersive-bg-r', r);
			root.style.setProperty('--immersive-bg-g', g);
			root.style.setProperty('--immersive-bg-b', b);
			root.style.setProperty('--immersive-text-color', textColor);
		},

		reset() {
			const root = dom.getRoot();
			if (!root) return;

			root.style.removeProperty('--immersive-bg-color');
			root.style.removeProperty('--immersive-bg-r');
			root.style.removeProperty('--immersive-bg-g');
			root.style.removeProperty('--immersive-bg-b');
			root.style.removeProperty('--immersive-text-color');
		}
	};

	// ========================================
	// Update Logic
	// ========================================
	
	const updater = {
		async updateColor(tab) {
			if (!tab?.active || tab.incognito) return;

			// Check cache first
			const cachedColor = cache.get(tab.url);
			if (cachedColor) {
				cssVariables.setColor(cachedColor);
				return;
			}

			// Priority 1: Try to get color from screenshot
			let finalColor = await colorExtractor.getDominantColor(tab.id);

			// Priority 2: Fallback to theme color if screenshot failed
			if (!finalColor) {
				finalColor = await colorExtractor.getThemeColor(tab.id);
			}

			if (finalColor) {
				cssVariables.setColor(finalColor);
				cache.set(tab.url, finalColor);
			} else {
				cssVariables.reset();
			}
		},

		scheduleUpdate(tab) {
			if (!tab?.id) return;

			// Prevent multiple scheduled updates for the same tab
			if (state.updateTimeouts.has(tab.id)) return;

			const timeout = setTimeout(() => {
				this.updateColor(tab);
				state.updateTimeouts.delete(tab.id);
			}, CONFIG.UPDATE_DEBOUNCE_MS);

			state.updateTimeouts.set(tab.id, timeout);
		},

		clearTimeout(tabId) {
			if (state.updateTimeouts.has(tabId)) {
				clearTimeout(state.updateTimeouts.get(tabId));
				state.updateTimeouts.delete(tabId);
			}
		}
	};

	// ========================================
	// Event Handlers
	// ========================================
	
	const eventHandlers = {
		async onTabActivated({ tabId }) {
			state.currentTabId = tabId;
			const tab = await chrome.tabs.get(tabId);
			await updater.updateColor(tab);
		},

		async onTabUpdated(tabId, changeInfo, tab) {
			if (!tab.active) return;

			if (changeInfo.status === 'complete') {
				await updater.updateColor(tab);
			} else if (changeInfo.url) {
				updater.scheduleUpdate(tab);
			}
		},

		onTabRemoved(tabId) {
			// Clean up state when tab is closed
			updater.clearTimeout(tabId);
			captureRateLimit.clearRecord(tabId);
		},

		async onWindowFocusChanged(windowId) {
			if (windowId === chrome.windows.WINDOW_ID_NONE) return;

			const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
			if (activeTab) {
				await updater.updateColor(activeTab);
			}
		},

		onThemeChanged() {
			cache.clear();
			
			if (state.currentTabId) {
				chrome.tabs.get(state.currentTabId).then(updater.updateColor);
			}
		}
	};

	// ========================================
	// Initialization
	// ========================================
	
	async function initialize() {
		const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
		if (activeTab) {
			state.currentTabId = activeTab.id;
			await updater.updateColor(activeTab);
		}

		chrome.tabs.onActivated.addListener(eventHandlers.onTabActivated);
		chrome.tabs.onUpdated.addListener(eventHandlers.onTabUpdated);
		chrome.tabs.onRemoved.addListener(eventHandlers.onTabRemoved);
		chrome.windows.onFocusChanged.addListener(eventHandlers.onWindowFocusChanged);

		const browser = dom.getBrowser();
		if (browser) {
			new MutationObserver(eventHandlers.onThemeChanged).observe(browser, {
				attributeFilter: ['style']
			});
		}
	}

	// ========================================
	// Entry Point
	// ========================================
	
	const startupCheckInterval = setInterval(() => {
		if (dom.getBrowser() && typeof chrome !== 'undefined' && chrome.tabs) {
			clearInterval(startupCheckInterval);
			initialize();
		}
	}, CONFIG.STARTUP_CHECK_INTERVAL);
})();
