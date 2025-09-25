(function color_tabs() {
    "use strict";

    const WHITE = chroma('#FFF');
    const BLACK = chroma('#000');

    const STYLE = `
        .tab .favicon:not(.svg) {
            filter: drop-shadow(1px 0 0 rgba(246, 246, 246, 0.75)) drop-shadow(-1px 0 0 rgba(246, 246, 246, 0.75)) drop-shadow(0 1px 0 rgba(246, 246, 246, 0.75)) drop-shadow(0 -1px 0 rgba(246, 246, 246, 0.75));
        }
    `;

    const INTERNAL_PAGES = [
        'chrome://',
        'vivaldi://',
        'devtools://',
        'chrome-extension://'
    ];

    class ColorTabs {
        #observer = null;

        constructor() {
            this.#addStyle();
            this.#colorTabs();
            this.#addListeners();
        }

        #addStyle() {
            const style = document.createElement('style');
            style.innerHTML = STYLE;
            this.#head.appendChild(style);
        }

        #addListeners() {
            chrome.tabs.onCreated.addListener(() => this.#colorTabsDelayed());
            chrome.tabs.onActivated.addListener(() => this.#colorTabsDelayed());
            vivaldi.tabsPrivate.onThemeColorChanged.addListener(() => this.#colorTabsDelayed());

            vivaldi.prefs.onChanged.addListener((info) => {
                if (info.path.startsWith('vivaldi.themes')) {
                    this.#colorTabsDelayed();
                }
            })
        }

        #colorTabsDelayed() {
            this.#colorTabs();
            setTimeout(() => this.#colorTabs(), 100);
        }

        async #colorTabs() {
            const tabs = document.querySelectorAll('div.tab');
            const theme = await this.#getCurrentTheme();

            const accentFromPage = theme.accentFromPage;
            const transparencyTabs = theme.transparencyTabs;
            const tabColorAllowed = accentFromPage && !transparencyTabs;

            if (tabColorAllowed) {
                const accentOnWindow = theme.accentOnWindow;
                const colorAccentBg = chroma(theme.colorAccentBg);
                const accentSaturationLimit = theme.accentSaturationLimit;
                tabs.forEach((tab) => this.#setTabColor(tab, accentOnWindow, colorAccentBg, accentSaturationLimit));
            } else {
                tabs.forEach((tab) => this.#resetTabColor(tab));
            }
        }

        async #resetTabColor(tab) {
            tab.style.backgroundColor = null;
            tab.style.color = null;
        }

        async #setTabColor(tab, accentOnWindow, colorAccentBg, accentSaturationLimit) {
            const tabId = this.#getTabId(tab);
            const chromeTab = await this.#getChromeTab(tabId);
            const isInternalPage = this.#isInternalPage(chromeTab.url);

            if (!isInternalPage) {
                var image = tab.querySelector('img');
                if (image) {
                    const palette = this.#getPalette(image);
                    if (palette && palette.length > 0) {
                        colorAccentBg = chroma(palette[0]);
                    }
                }
            }

            const saturation = colorAccentBg.get('hsl.s');
            colorAccentBg = colorAccentBg.set('hsl.s', saturation * accentSaturationLimit);
            const isBright = colorAccentBg.luminance() > 0.4;
            const colorAccentFg = isBright ? BLACK : WHITE;

            if (isInternalPage) {
                if (this.#isTabActive(tab)) {
                    this.#setAccentColors(colorAccentBg, colorAccentFg, isBright);
                    tab.style.backgroundColor = accentOnWindow ? 'var(--colorBg)' : 'var(--colorAccentBg)';
                } else {
                    tab.style.backgroundColor = 'var(--colorBgDark)';
                }
                tab.style.color = 'var(--colorFg)';
                return;
            }

            if (this.#isTabActive(tab)) {
                this.#setAccentColors(colorAccentBg, colorAccentFg, isBright);
                if (accentOnWindow) {
                    tab.style.backgroundColor = tab.classList.contains('active') ? 'var(--colorBg)' : 'var(--colorBgDark)';
                    tab.style.color = 'var(--colorFg)';
                }
                return;
            }
            
            tab.style.backgroundColor = colorAccentBg.css();
            tab.style.color = colorAccentFg.css();
        }

        #setAccentColors(colorAccentBg, colorAccentFg, isBright) {
            this.#setColor('--colorAccentBg', colorAccentBg);
            this.#setColor('--colorAccentBgDark', colorAccentBg.darken(.4));
            this.#setColor('--colorAccentBgDarker', colorAccentBg.darken(1));
            this.#setColor('--colorAccentBgAlpha', colorAccentBg.alpha(isBright ? .45 : .55));
            this.#setColor('--colorAccentBgAlphaHeavy', colorAccentBg.alpha(isBright ? .25 : .35));

            this.#setColor('--colorAccentFg', colorAccentFg);
            this.#setColor('--colorAccentFgAlpha', colorAccentFg.alpha(.15));
            this.#setColor('--colorAccentFgAlphaHeavy', colorAccentFg.alpha(.05));
        }

        #getPalette(image) {
            const w = image.width;
            const h = image.height;

            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;

            const context = canvas.getContext('2d');
            context.imageSmoothingEnabled = false;
            context.drawImage(image, 0, 0, w, h);

            const pixelData = context.getImageData(0, 0, w, h).data;
            const pixelCount = pixelData.length / 4;

            const colorPalette = [];

            for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex++) {
                const offset = 4 * pixelIndex;
                const red = pixelData[offset];
                const green = pixelData[offset + 1];
                const blue = pixelData[offset + 2];
                let colorIndex;

                if (!(red === 0 || red > 240 && green > 240 && blue > 240)) {
                    for (let colorIndexIterator = 0; colorIndexIterator < colorPalette.length; colorIndexIterator++) {
                        const currentColor = colorPalette[colorIndexIterator];
                        if (red === currentColor[0] && green === currentColor[1] && blue === currentColor[2]) {
                            colorIndex = colorIndexIterator;
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
            colorPalette.sort((a, b) => b[3] - a[3]);
            const topColors = colorPalette.slice(0, Math.min(10, colorPalette.length));
            return topColors.map(color => [color[0], color[1], color[2]]);
        }

        #setColor(property, color) {
            this.#browser.style.setProperty(property, color.css());
        }

        // utils

        #getTabId(tab) {
            return tab.getAttribute('data-id').slice(4);
        }

        #isInternalPage(url) {
            return INTERNAL_PAGES.some((p) => url.startsWith(p))
        }

        async #getChromeTab(tabId) {
            return tabId.length < 16 ? await chrome.tabs.get(Number(tabId)) : await this.#getFirstChromeTabInGroup(tabId);
        }

        async #getFirstChromeTabInGroup(groupId) {
            const tabs = await chrome.tabs.query({currentWindow: true});
            return tabs.find((tab) => {
                const vivExtData = JSON.parse(tab.vivExtData);
                return vivExtData.group === groupId;
            });
        }

        #isTabActive(tab) {
            return tab.classList.contains('active');
        }

        async #getCurrentTheme() {
            const themeId = await vivaldi.prefs.get('vivaldi.themes.current');
            const themes = Array.prototype.concat(await vivaldi.prefs.get('vivaldi.themes.system'), await vivaldi.prefs.get('vivaldi.themes.user'));
            return themes.find(theme => theme.id === themeId);
        }

        // getters

        get #browser() {
            return document.querySelector('#browser');
        }

        get #head() {
            return document.querySelector('head');
        }
    };

    setTimeout(() => {
        var interval = setInterval(() => {
            if (document.querySelector('#browser')) {
                window.colorTabs = new ColorTabs();
                clearInterval(interval);
            }
        }, 100);
    }, 1000);
})()
