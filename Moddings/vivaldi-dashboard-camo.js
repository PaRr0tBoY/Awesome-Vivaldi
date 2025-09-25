/*
	Vivaldi Dashboard Camo
	Version: 1.0

	Vivaldi Dashboard Camo is a JS modification for Vivaldi Browser
	that supplies the browser's theme colors to webpages inside the dashboard,
	enabling them to adapt their styling to the current browser theme.

	Copyright (c) 2024 HKayn <https://hkayn.com>
*/

(function() {
	// # Utility

	const tabIsWebWidget = tab => (
		tab.vivExtData?.length > 0
		&& /^WebWidget_/.test(JSON.parse(tab.vivExtData).panelId ?? "")
	);

	const getCustomPropertiesOfBrowserAsMap = () => {
		const browserStyle = document.getElementById("browser").style;
		return new Map(
			Array.from(browserStyle)
				.filter(prop => /^--.*/.test(prop))
				.map(prop => [prop, browserStyle.getPropertyValue(prop)])
		);
	};

	const cssDeclarationMap2String = (map) =>
		`:root {${Array.from(map.entries().map(entry => `${entry[0]}: ${entry[1]};`)).join("")}}`;


	// # State & Lifecycle

	const currentCssStringByTabId = new Map();

	const updateCssOfTab = async tab => {
		const newCssString = cssDeclarationMap2String(getCustomPropertiesOfBrowserAsMap());
		const previousCssString = currentCssStringByTabId.get(tab.id);
		currentCssStringByTabId.set(tab.id, newCssString);
		if (previousCssString === newCssString) return;

		if (previousCssString !== undefined) await chrome.scripting.removeCSS({
			css: previousCssString,
			target: { tabId: tab.id }
		});

		await chrome.scripting.insertCSS({
			css: newCssString,
			target: { tabId: tab.id },
		});
	}

	async function init() {
		chrome.tabs.onUpdated.addListener(async (_, __, tab) => {
			if (tabIsWebWidget(tab)) updateCssOfTab(tab);
		});

		// Detect when browser theme is modified
		new MutationObserver(
			async () => {
				(await chrome.tabs.query({})).filter(tabIsWebWidget).forEach(updateCssOfTab);
			}
		).observe(document.getElementById("browser"), {
			attributeFilter: ["style"],
		});
	}


	// # Entrypoint

	const startupCheckInterval = setInterval(() => {
		if (document.getElementById("browser") !== null) {
			clearInterval(startupCheckInterval);
			init();
		}
	});
})();