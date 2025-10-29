(function() {
	'use strict';

	// ==================== Configuration ====================
	
	const CONFIG = {
		// GLM API configuration
		glm: {
			url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
			key: '',
			model: 'glm-4.5-flash',
			temperature: 0.3,
			maxTokens: 2048
		},
		
		// Auto-stack enabled workspaces (empty array = disabled for all)
		autoStackWorkspaces: [
			// "<default_workspace>",
		],
		
		// Feature toggles
		enableAIGrouping: true,
		maxTabsForAI: 50,
		
		// Delays
		delays: {
			init: 500,
			mutation: 50,
			workspaceSwitch: 100,
			retry: 500,
			reattach: 500,
			debounce: 150,
			autoStack: 1000
		}
	};

	// Selectors
	const SELECTORS = {
		TAB_STRIP: '.tab-strip',
		SEPARATOR: '.tab-strip .separator',
		TAB_WRAPPER: '.tab-wrapper',
		TAB_POSITION: '.tab-position',
		STACK_COUNTER: '.stack-counter',
		TAB_STACK: '.svg-tab-stack',
		SUBSTACK: '.tab-position.is-substack, .tab-position.is-stack'
	};

	const CLASSES = {
		BUTTON: 'tidy-tabs-below-button',
		LOADING: 'tidy-loading-icon',
		PINNED: 'is-pinned'
	};

	// Language mappings
	const LANGUAGE_MAP = {
		'zh': '中文', 'zh-CN': '中文', 'zh-TW': '中文',
		'en': 'English', 'en-US': 'English', 'en-GB': 'English',
		'ja': '日本語', 'ja-JP': '日本語',
		'ko': '한국어', 'ko-KR': '한국어',
		'es': 'Español', 'fr': 'Français', 'de': 'Deutsch',
		'ru': 'Русский', 'pt': 'Português', 'it': 'Italiano',
		'ar': 'العربية', 'hi': 'हिन्दी'
	};

	const OTHERS_NAMES = ['其它', 'Others', 'その他', 'Other', 'Outros', 'Andere', 'Autres'];

	// Debounce timer
	let debounceTimer = null;

	// ==================== Utility Functions ====================

	// Get browser UI language
	const getBrowserLanguage = () => {
		return chrome.i18n.getUILanguage() || navigator.language || 'zh-CN';
	};

	// Convert language code to natural language name
	const getLanguageName = (langCode) => {
		if (LANGUAGE_MAP[langCode]) return LANGUAGE_MAP[langCode];
		
		const mainLang = langCode.split('-')[0];
		return LANGUAGE_MAP[mainLang] || 'English';
	};

	// Get "Others" group name in current language
	const getOthersName = () => {
		const langName = getLanguageName(getBrowserLanguage());
		const mapping = {
			'中文': '其它',
			'English': 'Others',
			'日本語': 'その他'
		};
		return mapping[langName] || 'Others';
	};

	// Get URL fragments using Vivaldi API or fallback
	const getUrlFragments = (url) => {
		try {
			if (typeof vivaldi !== 'undefined' && vivaldi.utilities?.getUrlFragments) {
				return vivaldi.utilities.getUrlFragments(url);
			}
		} catch (e) {
			// Fallback
		}
		
		try {
			const urlObj = new URL(url);
			const hostname = urlObj.hostname;
			const parts = hostname.split('.');
			const tld = parts.length > 1 ? parts[parts.length - 1] : '';
			
			return {
				hostForSecurityDisplay: hostname,
				tld: tld
			};
		} catch (e) {
			return {
				hostForSecurityDisplay: '',
				tld: ''
			};
		}
	};

	// Get base domain from URL
	const getBaseDomain = (url) => {
		const {hostForSecurityDisplay, tld} = getUrlFragments(url);
		const match = hostForSecurityDisplay.match(`([^.]+\\.${tld})$`);
		return match ? match[1] : hostForSecurityDisplay;
	};

	// Get hostname from URL
	const getHostname = (url) => {
		const {hostForSecurityDisplay} = getUrlFragments(url);
		return hostForSecurityDisplay;
	};

	// Get tab details by ID
	const getTab = async (tabId) => {
		return new Promise((resolve) => {
			chrome.tabs.get(tabId, function(tab) {
				if (chrome.runtime.lastError) {
					console.error('Error getting tab:', chrome.runtime.lastError);
					resolve(null);
					return;
				}
				
				if (tab.vivExtData) {
					try {
						tab.vivExtData = JSON.parse(tab.vivExtData);
					} catch (e) {
						console.error('Error parsing vivExtData:', e);
					}
				}
				resolve(tab);
			});
		});
	};

	// Get workspace name by ID
	const getWorkspaceName = async (workspaceId) => {
		if (!workspaceId) {
			return '<default_workspace>';
		}
		
		return new Promise((resolve) => {
			if (typeof vivaldi !== 'undefined' && vivaldi.prefs) {
				vivaldi.prefs.get('vivaldi.workspaces.list', (workspaceList) => {
					const workspace = workspaceList.find(item => item.id === workspaceId);
					resolve(workspace ? workspace.name : '<unknown_workspace>');
				});
			} else {
				resolve('<unknown_workspace>');
			}
		});
	};

	// Check if workspace allows auto-stacking
	const isAutoStackAllowed = async (workspaceId) => {
		if (CONFIG.autoStackWorkspaces.length === 0) {
			return false;
		}
		
		const workspaceName = await getWorkspaceName(workspaceId);
		return CONFIG.autoStackWorkspaces.includes(workspaceName);
	};

	// Get all tabs in specified workspace
	const getTabsByWorkspace = async (workspaceId) => {
		return new Promise((resolve) => {
			chrome.tabs.query({ currentWindow: true }, async function(tabs) {
				if (chrome.runtime.lastError) {
					console.error('Error querying tabs:', chrome.runtime.lastError);
					resolve([]);
					return;
				}
				
				const validTabs = [];
				for (const tab of tabs) {
					if (tab.id === -1 || !tab.vivExtData) continue;
					
					try {
						const vivExtData = JSON.parse(tab.vivExtData);
						
						if (vivExtData.workspaceId === workspaceId) {
							if (!tab.pinned && !vivExtData.panelId) {
								validTabs.push({
									...tab,
									vivExtData: vivExtData
								});
							}
						}
					} catch (e) {
						console.error('Error parsing vivExtData:', e);
					}
				}
				
				resolve(validTabs);
			});
		});
	};

	// Add tab to stack
	const addTabToStack = async (tabId, stackId, stackName) => {
		const tab = await getTab(tabId);
		
		if (!tab || !tab.vivExtData) {
			console.warn('Tab has no vivExtData:', tabId);
			return;
		}
		
		const vivExtData = tab.vivExtData;
		
		if (stackName) {
			vivExtData.fixedGroupTitle = stackName;
		}
		vivExtData.group = stackId;
		
		return new Promise((resolve) => {
			chrome.tabs.update(tabId, { 
				vivExtData: JSON.stringify(vivExtData) 
			}, function() {
				if (chrome.runtime.lastError) {
					console.error('Error updating tab:', chrome.runtime.lastError);
				} else {
					console.log(`Added tab ${tabId} to stack ${stackId} (${stackName})`);
				}
				resolve();
			});
		});
	};

	// Show notification
	const showNotification = (message, type = 'error') => {
		if (typeof chrome !== 'undefined' && chrome.notifications) {
			chrome.notifications.create({
				type: 'basic',
				iconUrl: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><text y="32" font-size="32">⚠️</text></svg>',
				title: 'TidyTabs',
				message: message,
				priority: type === 'error' ? 2 : 1
			});
		} else {
			console.error(`[TidyTabs] ${message}`);
			alert(`TidyTabs: ${message}`);
		}
	};

	// ==================== AI Grouping ====================

	// Build AI prompt for tab grouping
	const buildAIPrompt = (tabs, existingStacks, languageName) => {
		const tabsInfo = tabs.map((tab, index) => ({
			id: index,
			title: tab.title || 'Untitled',
			domain: getHostname(tab.url),
			url: tab.url
		}));

		const existingInfo = Array.isArray(existingStacks) && existingStacks.length > 0
			? existingStacks.map((s, i) => `${i}. Stack title: ${s.name || 'Unnamed stack'} (ID: ${s.id})`).join('\n')
			: 'None';

		const othersName = getOthersName();

		return `
**Instructions:**

Below are existing tab stack information and tabs to be grouped:

Existing tab stacks (title and ID):
${existingInfo}

Tabs to be grouped (id, title, domain):
${tabsInfo.map(t => `${t.id}. ${t.title} (${t.domain})`).join('\n')}

**Follow these rules to group tabs:**

# Priority: Assign tabs to existing stacks

1. If a tab's information is semantically related to an existing stack's title, add it to that stack: In the JSON output, match the tab's (tab_ids) to the existing stack's title (name) [VERY IMPORTANT];

If no semantically related existing stack is found, then consider creating a new stack

# Requirements for creating new stacks:

2. **Group by content theme**: When creating new stacks, categorize based on semantic similarity of tab titles.

3. **Group names must be specific**:
- Group names should be concise and specific, analyze tab titles and determine if they form a specific topic, group and name accordingly
- Examples: "css overflow", "javascript async issues", "xxx API collection"
- Avoid generic titles like "xxx tutorials", "xxx resources", "resource search"
- Allow more generic grouping only when refined to a single remaining tab
- **All group names must use ${languageName} language**

4. **Each group must contain at least 2 tabs**. A single tab cannot form a group.

5. Conditions for creating and adding to "Others" stack:
	1. Tabs in stacks with only one tab should be added to the "Others" stack (${othersName})
	2. Tabs that cannot be grouped with any other tabs should be added to "Others"
	3. When existing stacks **do not contain** an "Others" stack, create one even if it has no tabs

6. Each tab can only appear in one group.

7. Output **strictly valid JSON format only**, nothing else:
Avoid the following:
* Empty elements (e.g. [5, , 7])
* Missing quotes or commas
* tab_ids containing only single tab groups (e.g. "tab_ids": [6]) [VERY IMPORTANT]
* ***No additional explanatory text, comments, or extra content in output*** [VERY IMPORTANT]

**Output example (must strictly follow):**

{
  "groups": [
    {
      "name": "Group name",
      "tab_ids": [0, 1, 2]
    },
    {
      "name": "Group name 2",
      "tab_ids": [3, 4]
    },
    {
      "name": "${othersName}",
      "tab_ids": [5, 6]
    }
  ]
}
`;
	};

	// Parse and validate AI response
	const parseAIResponse = (content) => {
		let jsonStr = content.trim();
		
		// Remove possible markdown code block markers
		const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
		if (jsonMatch) {
			jsonStr = jsonMatch[1].trim();
		}
		
		// Extract JSON from surrounding text
		const firstBrace = jsonStr.indexOf('{');
		const lastBrace = jsonStr.lastIndexOf('}');
		if (firstBrace !== -1 && lastBrace !== -1) {
			jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
		}
		
		console.log('Extracted JSON string:', jsonStr);
		
		try {
			return JSON.parse(jsonStr);
		} catch (parseError) {
			console.error('JSON parse error:', parseError);
			console.error('Failed JSON string:', jsonStr);
			showNotification('AI returned invalid data format, cannot parse JSON. Check console for details.');
			return null;
		}
	};

	// Validate AI grouping result
	const validateAIGroups = (result) => {
		if (!result.groups || !Array.isArray(result.groups)) {
			console.error('Invalid response format: missing or invalid groups array');
			showNotification('AI returned incorrect data format: missing groups array');
			return false;
		}
		
		for (const group of result.groups) {
			if (!group.name || typeof group.name !== 'string') {
				console.error('Invalid group: missing or invalid name', group);
				showNotification('AI returned group missing valid name');
				return false;
			}
			
			if (!Array.isArray(group.tab_ids)) {
				console.error('Invalid group: tab_ids is not an array', group);
				showNotification('AI returned group where tab_ids is not an array');
				return false;
			}
			
			// Check for single-tab groups (excluding "Others")
			if (group.tab_ids.length === 1 && !OTHERS_NAMES.includes(group.name)) {
				console.warn('Warning: Group has only one tab:', group);
			}
		}
		
		return true;
	};

	// Map AI results to internal format
	const mapAIResultsToGroups = (aiResult, tabs, existingStacks) => {
		const initialGroups = aiResult.groups.map(group => {
			const existingStack = existingStacks.find(s => s.name === group.name);
			
			return {
				name: group.name,
				tabs: group.tab_ids.map(id => tabs[id]).filter(t => t),
				stackId: existingStack ? existingStack.id : crypto.randomUUID(),
				isExisting: !!existingStack
			};
		});

		// Apply smart filtering rules
		const filteredGroups = initialGroups.filter(group => {
			// Rule 1: Keep existing stacks even with single tab
			if (group.isExisting) return true;
			
			// Rule 2: New stacks must have at least 2 tabs
			return group.tabs.length > 1;
		});

		console.log('AI grouping result after smart filtering:', filteredGroups);
		return filteredGroups;
	};

	// Handle orphan tabs (tabs not in any group)
	const handleOrphanTabs = (groupedTabs, tabs, existingStacks, languageName) => {
		const groupedTabIds = new Set();
		groupedTabs.forEach(group => {
			group.tabs.forEach(tab => groupedTabIds.add(tab.id));
		});

		const orphanTabs = tabs.filter(tab => !groupedTabIds.has(tab.id));

		if (orphanTabs.length === 0) {
			console.log('No orphan tabs found, all tabs are grouped');
			return;
		}

		console.log(`Found ${orphanTabs.length} orphan tabs:`, orphanTabs.map(t => t.title));
		
		// Check if "Others" group exists in AI results
		let othersGroup = groupedTabs.find(g => OTHERS_NAMES.includes(g.name));
		
		if (othersGroup) {
			// Case A: AI successfully created a multi-tab "Others" group
			console.log('Adding orphan tabs to existing "Others" group from AI result');
			othersGroup.tabs.push(...orphanTabs);
		} else {
			// Case B: Check original existing stacks for "Others"
			const existingOthersStack = existingStacks.find(s => OTHERS_NAMES.includes(s.name));
			
			if (existingOthersStack) {
				console.log('Adding orphan tabs to EXISTING "Others" stack from original list');
				groupedTabs.push({
					name: existingOthersStack.name,
					tabs: orphanTabs,
					stackId: existingOthersStack.id,
					isExisting: true
				});
			} else if (orphanTabs.length > 1) {
				// No "Others" found and multiple orphans, create new
				const othersName = getOthersName();
				console.log(`Creating new "Others" group with ${orphanTabs.length} tabs`);
				groupedTabs.push({
					name: othersName,
					tabs: orphanTabs,
					stackId: crypto.randomUUID(),
					isExisting: false
				});
			} else {
				// Only 1 orphan and no "Others" stack, don't create
				console.log('Only 1 orphan tab found and no "Others" stack, not creating group');
			}
		}
	};

	// Call GLM API for intelligent grouping
	const getAIGrouping = async (tabs, existingStacks = []) => {
		if (!CONFIG.glm.key) {
			console.error('GLM API key not configured');
			showNotification('GLM API Key not configured, cannot use AI grouping');
			return null;
		}
		
		if (tabs.length > CONFIG.maxTabsForAI) {
			console.warn(`Too many tabs (${tabs.length}), limiting to ${CONFIG.maxTabsForAI}`);
			tabs = tabs.slice(0, CONFIG.maxTabsForAI);
		}
		
		const browserLang = getBrowserLanguage();
		const languageName = getLanguageName(browserLang);
		
		console.log(`Browser language: ${browserLang} (${languageName})`);
		
		const prompt = buildAIPrompt(tabs, existingStacks, languageName);

		try {
			console.log('Calling GLM API for intelligent grouping...');
			
			const response = await fetch(CONFIG.glm.url, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${CONFIG.glm.key}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					model: CONFIG.glm.model,
					messages: [{ role: 'user', content: prompt }],
					temperature: CONFIG.glm.temperature,
					max_tokens: CONFIG.glm.maxTokens,
					stream: false,
					thinking: { type: "disabled" }
				})
			});
			
			if (!response.ok) {
				const errorText = await response.text();
				console.error('GLM API error response:', errorText);
				throw new Error(`GLM API error: ${response.status} ${response.statusText}`);
			}
			
			const data = await response.json();
			console.log('GLM API full response:', data);
			
			const content = data.choices[0].message.content;
			console.log('GLM API content:', content);
			
			const result = parseAIResponse(content);
			if (!result) return null;
			
			if (!validateAIGroups(result)) return null;
			
			const groupedTabs = mapAIResultsToGroups(result, tabs, existingStacks);
			
			handleOrphanTabs(groupedTabs, tabs, existingStacks, languageName);
			
			console.log('AI grouping result (final):', groupedTabs);
			
			if (groupedTabs.length === 0) {
				console.warn('No valid groups created (all groups have less than 2 tabs)');
				showNotification('AI grouping failed: all groups have less than 2 tabs');
				return null;
			}
			
			return groupedTabs;
			
		} catch (error) {
			console.error('Error calling GLM API:', error);
			showNotification(`Error calling GLM API: ${error.message}`);
			return null;
		}
	};

	// Group by domain (fallback method)
	const groupByDomain = (tabs) => {
		const tabsByHost = {};
		
		tabs.forEach(tab => {
			const hostname = getHostname(tab.url);
			if (!tabsByHost[hostname]) {
				tabsByHost[hostname] = [];
			}
			tabsByHost[hostname].push(tab);
		});
		
		// Only return groups with multiple tabs
		return Object.entries(tabsByHost)
			.filter(([_, tabs]) => tabs.length > 1)
			.map(([hostname, tabs]) => {
				const baseDomain = getBaseDomain(tabs[0].url).split('.')[0];
				const name = baseDomain.charAt(0).toUpperCase() + baseDomain.slice(1);
				
				return {
					name: name,
					tabs: tabs,
					stackId: crypto.randomUUID(),
					isExisting: false
				};
			});
	};

	// ==================== Tab Stack Operations ====================

	// Create tab stacks from groups
	const createTabStacks = async (groups) => {
		for (const group of groups) {
			const stackId = group.stackId || crypto.randomUUID();
			const stackName = group.name;
			
			console.log(`${group.isExisting ? 'Adding to existing' : 'Creating'} stack "${stackName}" with ${group.tabs.length} tabs`);
			
			// Sort by index
			group.tabs.sort((a, b) => a.index - b.index);
			
			// Use first tab's position as target
			const targetIndex = group.tabs[0].index;
			
			// Move all tabs to adjacent positions and add to stack
			for (let i = 0; i < group.tabs.length; i++) {
				const tab = group.tabs[i];
				const moveIndex = targetIndex + i;
				
				// Move tab first
				await new Promise((resolve) => {
					chrome.tabs.move(tab.id, { index: moveIndex }, function() {
						if (chrome.runtime.lastError) {
							console.error('Error moving tab:', chrome.runtime.lastError);
						}
						resolve();
					});
				});
				
				// Then add to stack
				await addTabToStack(tab.id, stackId, stackName);
			}
		}
	};

	// Detect existing stacks from DOM
	const detectExistingStacks = async (nextElement) => {
		const existingStacks = [];

		while (nextElement) {
			if (nextElement.tagName !== 'SPAN') {
				nextElement = nextElement.nextElementSibling;
				continue;
			}

			const isStack =
				nextElement.querySelector(SELECTORS.STACK_COUNTER) !== null ||
				nextElement.querySelector(SELECTORS.TAB_STACK) !== null ||
				nextElement.querySelector(SELECTORS.SUBSTACK) !== null;

			if (isStack) {
				console.log('Found existing tab stack DOM:', nextElement.outerHTML.slice(0, 200));

				const stackWrapper = nextElement.querySelector(SELECTORS.TAB_WRAPPER);
				const stackTabId = stackWrapper?.getAttribute('data-id')?.replace('tab-', '');

				if (stackTabId) {
					const allTabs = await new Promise(resolve => {
						chrome.tabs.query({ currentWindow: true }, tabs => resolve(tabs));
					});

					const stackTab = allTabs.find(t => {
						try {
							const data = JSON.parse(t.vivExtData || '{}');
							return data && data.group && t.vivExtData.includes(stackTabId.slice(0, 8));
						} catch {
							return false;
						}
					});

					if (stackTab) {
						const viv = JSON.parse(stackTab.vivExtData);
						existingStacks.push({
							id: viv.group,
							name: viv.fixedGroupTitle || stackTab.title || 'Unnamed stack',
							tabId: stackTab.id
						});
						console.log(`Detected existing stack: ${viv.fixedGroupTitle || stackTab.title} (ID: ${viv.group})`);
					} else {
						console.warn('No matching chrome tab found for DOM id:', stackTabId);
					}
				}
			}

			nextElement = nextElement.nextElementSibling;
		}

		return existingStacks;
	};

	// Collect tabs from separator onwards
	const collectTabsFromSeparator = (separator) => {
		const tabsInfo = [];
		let nextElement = separator.nextElementSibling;

		while (nextElement) {
			if (nextElement.tagName === 'SPAN') {
				const tabWrapper = nextElement.querySelector(SELECTORS.TAB_WRAPPER);
				const tabPosition = nextElement.querySelector(SELECTORS.TAB_POSITION);

				const isStack =
					nextElement.querySelector(SELECTORS.STACK_COUNTER) !== null ||
					nextElement.querySelector(SELECTORS.TAB_STACK) !== null ||
					nextElement.querySelector(SELECTORS.SUBSTACK) !== null;

				// Skip stacks, collect unpinned tabs
				if (!isStack && tabPosition && !tabPosition.classList.contains(CLASSES.PINNED)) {
					const tabId = tabWrapper?.getAttribute('data-id');
					
					if (tabId) {
						const numericId = parseInt(tabId.replace('tab-', ''));
						if (!isNaN(numericId)) {
							tabsInfo.push({ id: numericId });
						}
					}
				}
			}
			nextElement = nextElement.nextElementSibling;
		}

		return tabsInfo;
	};

	// ==================== UI Components ====================

	// Create Tidy button
	const createTidyButton = () => {
		const button = document.createElement('div');
		button.className = CLASSES.BUTTON;
		button.textContent = 'Tidy';
		return button;
	};

	// Create loading icon
	const createLoadingIcon = () => {
		const container = document.createElement('div');
		container.className = CLASSES.LOADING;
		container.innerHTML = `<svg width="28" height="28" style="padding:8px" fill="hsl(228, 97%, 42%)" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="RadialGradient8932"><stop offset="0%" stop-color="currentColor"/><stop offset="100%" stop-color="currentColor" stop-opacity=".25"/></linearGradient></defs><style>@keyframes spin8932{to{transform:rotate(360deg)}}</style><circle cx="10" cy="10" r="8" stroke-width="2" style="transform-origin:50% 50%;stroke:url(#RadialGradient8932);fill:none;animation:spin8932 .5s infinite linear"/></svg>`;
		return container;
	};

	// Show loading state
	const showLoading = (separator) => {
		if (separator.querySelector(`.${CLASSES.LOADING}`)) return;
		
		const loadingIcon = createLoadingIcon();
		separator.appendChild(loadingIcon);
	};

	// Hide loading state
	const hideLoading = (separator) => {
		const loadingIcon = separator.querySelector(`.${CLASSES.LOADING}`);
		if (loadingIcon) {
			loadingIcon.remove();
		}
	};

	// Debounced button attachment
	const scheduleAttachButtons = (delay = CONFIG.delays.debounce) => {
		if (debounceTimer !== null) {
			clearTimeout(debounceTimer);
		}

		debounceTimer = setTimeout(() => {
			attachButtons();
			debounceTimer = null;
		}, delay);
	};

	// Attach Tidy buttons to all separators
	const attachButtons = () => {
		const separators = document.querySelectorAll(SELECTORS.SEPARATOR);

		separators.forEach(separator => {
			if (separator.querySelector(`.${CLASSES.BUTTON}`)) {
				return;
			}

			const button = createTidyButton();
			separator.appendChild(button);

			button.addEventListener('click', function(e) {
				e.stopPropagation();
				tidyTabsBelow(separator);
			});
		});
	};

	// ==================== Core Functionality ====================

	// Auto-stack workspace tabs
	const autoStackWorkspace = async (workspaceId) => {
		const allowed = await isAutoStackAllowed(workspaceId);
		
		if (!allowed) return;
		
		const workspaceName = await getWorkspaceName(workspaceId);
		console.log(`Auto-stacking workspace: ${workspaceName}`);
		
		const tabs = await getTabsByWorkspace(workspaceId);
		
		if (tabs.length < 2) {
			console.log('Not enough tabs in workspace');
			return;
		}
		
		let groups;
		
		if (CONFIG.enableAIGrouping && CONFIG.glm.key) {
			groups = await getAIGrouping(tabs);
			
			if (!groups) {
				console.log('AI grouping failed, falling back to domain grouping');
				groups = groupByDomain(tabs);
			}
		} else {
			groups = groupByDomain(tabs);
		}
		
		if (groups.length === 0) {
			console.log('No groups to create');
			return;
		}
		
		await createTabStacks(groups);
		console.log('Auto-stacking completed!');
	};

	// Manually tidy tabs below separator
	const tidyTabsBelow = async (separator) => {
		const existingStacks = await detectExistingStacks(separator.nextElementSibling);
		const tabsInfo = collectTabsFromSeparator(separator);

		console.log('Tabs found:', tabsInfo.length);
		console.log('Existing stacks found:', existingStacks.length);

		if (tabsInfo.length < 2 && existingStacks.length === 0) {
			console.log('Not enough tabs to group (need at least 2) and no existing stacks');
			return;
		}

		showLoading(separator);

		try {
			const tabs = await Promise.all(tabsInfo.map(info => getTab(info.id)));

			const validTabs = tabs.filter(t => t !== null);
			
			console.log('Valid tabs:', validTabs.length);

			if (validTabs.length < 1 && existingStacks.length === 0) {
				console.log('No valid tabs or existing stacks');
				return;
			}

			let groups;
			
			if (CONFIG.enableAIGrouping && CONFIG.glm.key) {
				console.log('Using AI grouping...');
				groups = await getAIGrouping(validTabs, existingStacks);
				
				if (!groups) {
					console.log('AI grouping failed, falling back to domain grouping');
					groups = groupByDomain(validTabs);
				}
			} else {
				console.log('Using domain grouping...');
				groups = groupByDomain(validTabs);
			}

			if (groups.length === 0) {
				console.log('No groups to create');
				return;
			}

			await createTabStacks(groups);
			console.log('Tab stacking completed!');
		} finally {
			hideLoading(separator);
			scheduleAttachButtons(CONFIG.delays.reattach);
		}
	};

	// ==================== Event Listeners ====================

	// Setup auto-stacking listener
	const setupAutoStackListener = () => {
		if (!chrome.webNavigation) return;

		chrome.webNavigation.onCommitted.addListener(async (details) => {
			if (details.tabId !== -1 && details.frameType === 'outermost_frame') {
				const tab = await getTab(details.tabId);
				
				if (tab && !tab.pinned && tab.vivExtData && !tab.vivExtData.panelId) {
					const workspaceId = tab.vivExtData.workspaceId;
					
					setTimeout(() => {
						autoStackWorkspace(workspaceId);
					}, CONFIG.delays.autoStack);
				}
			}
		});
		
		console.log('Auto-stacking listener registered');
	};

	// Setup mutation observer for tab strip changes
	const observeTabStrip = () => {
		const tabStrip = document.querySelector(SELECTORS.TAB_STRIP);
		
		if (!tabStrip) {
			setTimeout(observeTabStrip, CONFIG.delays.retry);
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

				// Check for workspace switch
				if (mutation.type === 'attributes' && mutation.attributeName === 'aria-owns') {
					hasWorkspaceSwitch = true;
				}

				if (hasTabChange && hasWorkspaceSwitch) break;
			}

			if (hasTabChange || hasWorkspaceSwitch) {
				const delay = hasWorkspaceSwitch ? CONFIG.delays.workspaceSwitch : CONFIG.delays.mutation;
				scheduleAttachButtons(delay);
			}
		});

		observer.observe(tabStrip, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ['aria-owns']
		});
	};

	// ==================== Initialization ====================

	const init = () => {
		console.log('Initializing TidyTabs extension');
		console.log('AI grouping:', CONFIG.enableAIGrouping ? 'enabled' : 'disabled');
		console.log('Auto-stack workspaces:', CONFIG.autoStackWorkspaces);

		setTimeout(attachButtons, CONFIG.delays.init);
		observeTabStrip();
		setupAutoStackListener();
	};

	// Start when DOM is ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
