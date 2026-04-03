/**
 * @author aminought
 * @modified Adds border coloring only for the first 9 pinned tabs
 */
(function colorTabs() {
  "use strict";

  // Constants
  const WHITE = chroma("#FFF");
  const BLACK = chroma("#000");

  const FAVICON_STYLE = `
		.tab .favicon:not(.svg) {
			filter: drop-shadow(1px 0 0 rgba(246, 246, 246, 0.75))
					drop-shadow(-1px 0 0 rgba(246, 246, 246, 0.75))
					drop-shadow(0 1px 0 rgba(246, 246, 246, 0.75))
					drop-shadow(0 -1px 0 rgba(246, 246, 246, 0.75));
		}
	`;

  const INTERNAL_PAGES = [
    "chrome://",
    "vivaldi://",
    "devtools://",
    "chrome-extension://",
  ];

  const MAX_PINNED_TABS = 9;
  const COLOR_DELAY = 100;
  const INIT_DELAY = 1000;
  const INIT_CHECK_INTERVAL = 100;

  class ColorTabs {
    #observer = null;

    constructor() {
      console.log("ColorTabs initialization started...");
      this.#initialize();
    }

    // Initialize all components
    #initialize() {
      this.#addStyle();
      this.#colorTabs();
      this.#addListeners();
    }

    // Add favicon styling to the page
    #addStyle() {
      const style = document.createElement("style");
      style.innerHTML = FAVICON_STYLE;
      this.#head.appendChild(style);
    }

    // Set up event listeners for tab and theme changes
    #addListeners() {
      chrome.tabs.onCreated.addListener(() => this.#colorTabsDelayed());
      chrome.tabs.onActivated.addListener(() => this.#colorTabsDelayed());
      vivaldi.tabsPrivate.onThemeColorChanged.addListener(() =>
        this.#colorTabsDelayed(),
      );

      vivaldi.prefs.onChanged.addListener((info) => {
        if (info.path.startsWith("vivaldi.themes")) {
          this.#colorTabsDelayed();
        }
      });
    }

    // Delay tab coloring to ensure DOM is ready
    #colorTabsDelayed() {
      this.#colorTabs();
      setTimeout(() => this.#colorTabs(), COLOR_DELAY);
    }

    // Apply colors to pinned tabs based on their favicon
    async #colorTabs() {
      const pinnedTabWrappers = this.#getPinnedTabWrappers();

      console.log(`Found ${pinnedTabWrappers.length} pinned tabs`);

      const theme = await this.#getCurrentTheme();

      if (!theme) {
        console.warn("Unable to get theme information");
        return;
      }

      const {
        accentFromPage,
        accentOnWindow,
        colorAccentBg,
        accentSaturationLimit,
      } = theme;

      console.log("Coloring status:", {
        tabCount: pinnedTabWrappers.length,
        accentFromPage,
        tabColorAllowed: accentFromPage,
      });

      if (accentFromPage) {
        const accentColor = chroma(colorAccentBg);
        pinnedTabWrappers.forEach((tabWrapper) =>
          this.#setTabBorder(
            tabWrapper,
            accentOnWindow,
            accentColor,
            accentSaturationLimit,
          ),
        );
      } else {
        pinnedTabWrappers.forEach((tabWrapper) =>
          this.#resetTabBorder(tabWrapper),
        );
      }
    }

    // Get the first 9 pinned tab wrappers
    #getPinnedTabWrappers() {
      return document.querySelectorAll(
        `#tabs-container .tab-strip > span:has(.is-pinned):nth-child(-n+${MAX_PINNED_TABS}) .is-pinned .tab-wrapper`,
      );
    }

    // Remove border from tab
    async #resetTabBorder(tabWrapper) {
      tabWrapper.style.border = null;
    }

    // Set colored border for tab based on favicon or theme
    async #setTabBorder(
      tabWrapper,
      accentOnWindow,
      colorAccentBg,
      accentSaturationLimit,
    ) {
      const tabId = this.#getTabId(tabWrapper);
      if (!tabId) {
        console.warn("Tab ID not found");
        return;
      }

      const chromeTab = await this.#getChromeTab(tabId);

      if (!chromeTab) {
        console.warn("Unable to get Chrome tab info:", tabId);
        return;
      }

      let finalColor = colorAccentBg;

      if (!this.#isInternalPage(chromeTab.url)) {
        const tab = tabWrapper.querySelector(".tab");
        if (!tab) {
          console.warn(".tab element not found");
          return;
        }

        const image = this.#findFaviconImage(tab);
        if (image && this.#isImageValid(image)) {
          try {
            const palette = this.#getPalette(image);
            if (palette && palette.length > 0) {
              finalColor = chroma(palette[0]);
              console.log("Color extracted from favicon:", finalColor.css());
            }
          } catch (e) {
            console.warn("Color extraction failed:", e);
          }
        }
      }

      const saturation = finalColor.get("hsl.s");
      finalColor = finalColor.set("hsl.s", saturation * accentSaturationLimit);

      tabWrapper.style.border = `1px solid ${finalColor.css()}`;
      console.log("Border color set:", finalColor.css());
    }

    // Find favicon image in tab element
    #findFaviconImage(tabElement) {
      const selectors = [
        ".favicon img",
        'img[srcset*="favicon"]',
        'img[width="16"]',
        'img[height="16"]',
        "img",
      ];

      for (const selector of selectors) {
        const image = tabElement.querySelector(selector);
        if (image) {
          return image;
        }
      }

      return null;
    }

    // Validate if image is properly loaded
    #isImageValid(image) {
      if (!image || !image.complete) {
        return false;
      }

      if (!image.src && !image.srcset) {
        return false;
      }

      const width = image.naturalWidth || image.width;
      const height = image.naturalHeight || image.height;

      return width > 0 && height > 0;
    }

    // Extract color palette from image
    #getPalette(image) {
      const w = image.naturalWidth || image.width;
      const h = image.naturalHeight || image.height;

      if (w === 0 || h === 0) {
        console.warn("Image dimensions are 0, cannot extract colors");
        return null;
      }

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;

      const context = canvas.getContext("2d");
      context.imageSmoothingEnabled = false;

      try {
        context.drawImage(image, 0, 0, w, h);
      } catch (e) {
        console.warn("Failed to draw image to canvas:", e);
        return null;
      }

      let pixelData;
      try {
        pixelData = context.getImageData(0, 0, w, h).data;
      } catch (e) {
        console.warn("Failed to get image data (possible CORS issue):", e);
        return null;
      }

      const pixelCount = pixelData.length / 4;
      const colorPalette = [];

      for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex++) {
        const offset = 4 * pixelIndex;
        const red = pixelData[offset];
        const green = pixelData[offset + 1];
        const blue = pixelData[offset + 2];

        // Skip black and near-white colors
        if (!(red === 0 || (red > 240 && green > 240 && blue > 240))) {
          let colorIndex;

          for (let i = 0; i < colorPalette.length; i++) {
            const currentColor = colorPalette[i];
            if (
              red === currentColor[0] &&
              green === currentColor[1] &&
              blue === currentColor[2]
            ) {
              colorIndex = i;
              break;
            }
          }

          if (colorIndex === undefined) {
            colorPalette.push([red, green, blue, 1]);
          } else {
            colorPalette[colorIndex][3]++;
          }
        }
      }

      if (colorPalette.length === 0) {
        return null;
      }

      colorPalette.sort((a, b) => b[3] - a[3]);
      const topColors = colorPalette.slice(
        0,
        Math.min(10, colorPalette.length),
      );
      return topColors.map((color) => [color[0], color[1], color[2]]);
    }

    // Extract tab ID from wrapper element
    #getTabId(tabWrapper) {
      const dataId = tabWrapper.getAttribute("data-id");
      if (!dataId) {
        console.warn("Tab missing data-id attribute:", tabWrapper);
        return null;
      }
      // Remove "tab-" prefix if present
      return dataId.startsWith("tab-") ? dataId.slice(4) : dataId;
    }

    // Check if URL is an internal browser page
    #isInternalPage(url) {
      return INTERNAL_PAGES.some((prefix) => url.startsWith(prefix));
    }

    // Get Chrome tab object by ID
    async #getChromeTab(tabId) {
      if (!tabId) return null;

      try {
        return tabId.length < 16
          ? await chrome.tabs.get(Number(tabId))
          : await this.#getFirstChromeTabInGroup(tabId);
      } catch (e) {
        console.warn("Failed to get Chrome tab:", e);
        return null;
      }
    }

    // Get first tab in a tab group
    async #getFirstChromeTabInGroup(groupId) {
      try {
        const tabs = await chrome.tabs.query({ currentWindow: true });
        return tabs.find((tab) => {
          try {
            const vivExtData = JSON.parse(tab.vivExtData);
            return vivExtData.group === groupId;
          } catch (e) {
            return false;
          }
        });
      } catch (e) {
        console.warn("Failed to query grouped tabs:", e);
        return null;
      }
    }

    // Get current Vivaldi theme
    async #getCurrentTheme() {
      try {
        const themeId = await vivaldi.prefs.get("vivaldi.themes.current");
        const themes = Array.prototype.concat(
          await vivaldi.prefs.get("vivaldi.themes.system"),
          await vivaldi.prefs.get("vivaldi.themes.user"),
        );
        const theme = themes.find((theme) => theme.id === themeId);
        console.log("Current theme:", theme);
        return theme;
      } catch (e) {
        console.error("Failed to get theme:", e);
        return {
          accentFromPage: true,
          transparencyTabs: false,
          accentOnWindow: false,
          accentSaturationLimit: 1,
          colorAccentBg: "#4d6bfe",
        };
      }
    }

    // DOM element getters
    get #browser() {
      return document.querySelector("#browser");
    }

    get #head() {
      return document.querySelector("head");
    }
  }

  // Initialize when browser element is available
  setTimeout(() => {
    const interval = setInterval(() => {
      if (document.querySelector("#browser")) {
        console.log("Initializing ColorTabs...");
        window.colorTabs = new ColorTabs();
        clearInterval(interval);
        console.log("ColorTabs initialization complete!");
      }
    }, INIT_CHECK_INTERVAL);
  }, INIT_DELAY);
})();
