/*
	Vivaldi Immersive Address Bar
	Version: 1.0

	Vivaldi Immersive Address Bar is a JS modification for Vivaldi Browser
	that adapts the address bar background color to match the webpage's
	primary color by analyzing the top portion of the page.
*/

(function() {
	// # Configuration
	const UPDATE_DEBOUNCE_MS = 300;
	const SAMPLE_HEIGHT = 100; // pixels from top to sample
	const COLOR_CACHE_SIZE = 50;

	// # Utility Functions

	const getMainBar = () => document.querySelector('.color-behind-tabs-off .mainbar');

	const rgbToHex = (r, g, b) => {
		return '#' + [r, g, b].map(x => {
			const hex = x.toString(16);
			return hex.length === 1 ? '0' + hex : hex;
		}).join('');
	};

	const shouldUseLightText = (r, g, b) => {
		// Calculate relative luminance
		const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
		return luminance < 0.5;
	};

	// # Color Extraction
	const getDominantColorFromTab = async (tabId) => {
    try {
      const tab = await chrome.tabs.get(tabId);
      if (!tab || !tab.url) return null;

      // 跳过内部页面
      if (/^(chrome|vivaldi|devtools|chrome-extension):\/\//.test(tab.url)) {
        console.log('Skipped internal page capture:', tab.url);
        return null;
      }

      const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });

			return new Promise((resolve) => {
				const img = new Image();
				img.onload = () => {
					const canvas = document.createElement('canvas');
					const ctx = canvas.getContext('2d');
					
					// Only analyze top portion
					const sampleHeight = Math.min(SAMPLE_HEIGHT, img.height);
					canvas.width = img.width;
					canvas.height = sampleHeight;
					
					ctx.drawImage(img, 0, 0, img.width, sampleHeight, 0, 0, img.width, sampleHeight);
					const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
					
					const color = calculateDominantColor(imageData);
					resolve(color);
				};
				img.onerror = () => resolve(null);
				img.src = dataUrl;
			});
		} catch (e) {
			console.log('Failed to capture page:', e);
			return null;
		}
	};

	const calculateDominantColor = (imageData) => {
		const data = imageData.data;
		const colorCounts = new Map();
		const skipPixels = 10; // Sample every 10th pixel for performance

		for (let i = 0; i < data.length; i += 4 * skipPixels) {
			const r = data[i];
			const g = data[i + 1];
			const b = data[i + 2];
			const a = data[i + 3];
			
			// Skip transparent or very light/dark pixels
			if (a < 128 || (r > 250 && g > 250 && b > 250) || (r < 5 && g < 5 && b < 5)) {
				continue;
			}
			
			// Quantize colors to reduce variance
			const qr = Math.round(r / 10) * 10;
			const qg = Math.round(g / 10) * 10;
			const qb = Math.round(b / 10) * 10;
			const key = `${qr},${qg},${qb}`;
			
			colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
		}

		if (colorCounts.size === 0) return null;

		// Find most common color
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
		return { hex: rgbToHex(r, g, b), r, g, b };
	};

	// # State Management

	const colorCache = new Map(); // url -> color
	const updateTimeouts = new Map(); // tabId -> timeout
	let currentTabId = null;
	let defaultBackgroundColor = null;

	const getCachedColor = (url) => {
		if (!url) return null;
		// Cache by domain
		try {
			const domain = new URL(url).hostname;
			return colorCache.get(domain);
		} catch {
			return null;
		}
	};

	const setCachedColor = (url, color) => {
		if (!url) return;
		try {
			const domain = new URL(url).hostname;
			colorCache.set(domain, color);
			
			// Limit cache size
			if (colorCache.size > COLOR_CACHE_SIZE) {
				const firstKey = colorCache.keys().next().value;
				colorCache.delete(firstKey);
			}
		} catch {}
	};

	// # Color Application

const applyColorToAddressBar = (colorData) => {
	const mainbar = getMainBar();
	const addressField = document.querySelector('.UrlBar-AddressField');
	const observerEl = document.querySelector('.observer');
	if (!mainbar && !addressField && !observerEl) return;

	const targets = [mainbar, addressField, observerEl];

	if (!colorData) {
		const reset = (el) => {
			if (!el) return;
			if (defaultBackgroundColor) el.style.backgroundColor = defaultBackgroundColor;
			else el.style.removeProperty('background-color');
			el.style.removeProperty('color');
		};
		targets.forEach(reset);
		return;
	}

	const { hex, r, g, b } = colorData;
	const textColor = shouldUseLightText(r, g, b) ? '#ffffff' : '#000000';

	targets.forEach(el => {
		if (!el) return;
		el.style.setProperty('background-color', hex, 'important');
		el.style.setProperty('color', textColor, 'important');
	});
};



	// # Main Update Logic

	// const updateAddressBarColor = async (tab) => {
	// 	if (!tab || !tab.active || tab.incognito) return;

	// 	const mainbar = getMainBar();
	// 	if (!mainbar) return;

	// 	const cachedColor = getCachedColor(tab.url);
	// 	if (cachedColor) {
	// 		applyColorToAddressBar(cachedColor);
	// 		return;
	// 	}

	// 	const colorData = await getDominantColorFromTab(tab.id);
	// 	if (colorData) {
	// 		applyColorToAddressBar(colorData);
	// 		setCachedColor(tab.url, colorData);
	// 	} else {
	// 		applyColorToAddressBar(null); // Reset to default
	// 	}
	// };

  const mixColors = (c1, c2, ratio = 0.5) => ({
    r: Math.round(c1.r * (1 - ratio) + c2.r * ratio),
    g: Math.round(c1.g * (1 - ratio) + c2.g * ratio),
    b: Math.round(c1.b * (1 - ratio) + c2.b * ratio),
    hex: rgbToHex(
      Math.round(c1.r * (1 - ratio) + c2.r * ratio),
      Math.round(c1.g * (1 - ratio) + c2.g * ratio),
      Math.round(c1.b * (1 - ratio) + c2.b * ratio)
    )
  });
  
  const colorDistance = (c1, c2) => {
    const dr = c1.r - c2.r;
    const dg = c1.g - c2.g;
    const db = c1.b - c2.b;
    return Math.sqrt(dr*dr + dg*dg + db*db);
  };
  
  const updateAddressBarColor = async (tab) => {
    if (!tab || !tab.active || tab.incognito) return;
  
    // Step 1. 获取 theme-color
    let themeColorData = null;
    try {
      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const meta = document.querySelector('meta[name="theme-color"]');
          return meta ? meta.content : null;
        }
      });
      if (result && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(result)) {
        const hex = result.length === 4
          ? '#' + [...result.slice(1)].map(x => x + x).join('')
          : result;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        themeColorData = { hex, r, g, b };
      }
    } catch {}
  
    // Step 2. 截图提色
    const screenshotColor = await getDominantColorFromTab(tab.id);
  
    // Step 3. 决策逻辑
    let finalColor = null;
    if (themeColorData && screenshotColor) {
      const dist = colorDistance(themeColorData, screenshotColor);
      if (dist < 40) finalColor = themeColorData;               // 色差小，直接用 theme
      else if (dist < 100) finalColor = mixColors(themeColorData, screenshotColor, 0.5); // 适中，混合
      else finalColor = screenshotColor;                        // 差异大，截图更准
    } else {
      finalColor = themeColorData || screenshotColor;
    }
  
    if (finalColor) {
      applyColorToAddressBar(finalColor);
      setCachedColor(tab.url, finalColor);
    } else {
      applyColorToAddressBar(null);
    }
  };

	const scheduleUpdate = (tab) => {
		if (!tab || !tab.id) return;

		// Clear existing timeout
		if (updateTimeouts.has(tab.id)) {
			clearTimeout(updateTimeouts.get(tab.id));
		}

		// Schedule new update
		// const timeout = setTimeout(() => {
		// 	updateAddressBarColor(tab);
		// 	updateTimeouts.delete(tab.id);
		// }, UPDATE_DEBOUNCE_MS);
    if (updateTimeouts.has(tab.id)) return;
    const timeout = setTimeout(() => {
      updateAddressBarColor(tab);
      updateTimeouts.delete(tab.id);
    }, 1000); // 每个标签最多1秒更新一次


		updateTimeouts.set(tab.id, timeout);
	};

	// # CSS Setup

	const injectTransitionStyles = () => {
		const styleId = 'immersive-addressbar-styles';
		if (document.getElementById(styleId)) return;

		const style = document.createElement('style');
		style.id = styleId;
		style.textContent = `
			.color-behind-tabs-off .mainbar {
				transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
				            color 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
			}
		`;
		document.head.appendChild(style);
	};

	// # Initialization

	async function init() {
		// Store default background color
		const mainbar = getMainBar();
		if (mainbar) {
			const computed = window.getComputedStyle(mainbar);
			defaultBackgroundColor = computed.backgroundColor;
		}

		// Inject transition styles
		injectTransitionStyles();

		// Get current active tab and update
		const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
		if (activeTab) {
			currentTabId = activeTab.id;
			updateAddressBarColor(activeTab);
		}

		// Listen for tab activation
		chrome.tabs.onActivated.addListener(async ({ tabId }) => {
			currentTabId = tabId;
			const tab = await chrome.tabs.get(tabId);
			updateAddressBarColor(tab);
		});

		// Listen for tab updates (URL changes, page loads)
		chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
			if (tab.active && (changeInfo.status === 'complete' || changeInfo.url)) {
				scheduleUpdate(tab);
			}
		})
    // 页面加载完成时更新主色调
    chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.active && !tab.incognito) {
        await updateAddressBarColor(tab);
      }
    });
;

		// Listen for window focus changes
		chrome.windows.onFocusChanged.addListener(async (windowId) => {
			if (windowId !== chrome.windows.WINDOW_ID_NONE) {
				const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
				if (activeTab) {
					updateAddressBarColor(activeTab);
				}
			}
		});

		// Observe theme changes
		const browser = document.getElementById("browser");
		if (browser) {
			new MutationObserver(() => {
				// Theme changed, clear cache and update
				colorCache.clear();
				const mainbar = getMainBar();
				if (mainbar) {
					const computed = window.getComputedStyle(mainbar);
					defaultBackgroundColor = computed.backgroundColor;
				}
				if (currentTabId) {
					chrome.tabs.get(currentTabId).then(updateAddressBarColor);
				}
			}).observe(browser, {
				attributeFilter: ["style"],
			});
		}
	}

	// # Entrypoint

	const startupCheckInterval = setInterval(() => {
		if (document.getElementById("browser") !== null && typeof chrome !== 'undefined' && chrome.tabs) {
			clearInterval(startupCheckInterval);
			init();
		}
	}, 100);
})();
