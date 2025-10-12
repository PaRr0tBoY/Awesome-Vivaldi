(function() {
    'use strict';

    // 配置
    const config = {
        // GLM API 配置
        glm_api_url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
        glm_api_key: 'e2105adcbe8d4d6ea49dce2fd94c127f.6dcsB9uMmtNxKXl2', // 请填入您的 API Key
        glm_model: 'glm-4.5-air', // 使用 flash 版本以获得更快响应
        
        // 允许自动标签栈的工作区 (完全一致或 <default_workspace>)
        // 空数组 = 禁用所有工作区的自动组栈，只能手动点击按钮
        auto_stack_workspaces: [
            // "<default_workspace>",
        ],
        
        // 是否启用 AI 智能分组（false 时回退到按域名分组）
        enable_ai_grouping: true,
        
        // AI 分析的最大标签页数量（避免请求过大）
        max_tabs_for_ai: 20,
    };

    // 获取浏览器界面语言
    const getBrowserLanguage = () => {
        return chrome.i18n.getUILanguage() || navigator.language || 'zh-CN';
    };

    // 将语言代码转换为自然语言名称
    const getLanguageName = (langCode) => {
        const langMap = {
            'zh': '中文',
            'zh-CN': '中文',
            'zh-TW': '中文',
            'en': 'English',
            'en-US': 'English',
            'en-GB': 'English',
            'ja': '日本語',
            'ja-JP': '日本語',
            'ko': '한국어',
            'ko-KR': '한국어',
            'es': 'Español',
            'fr': 'Français',
            'de': 'Deutsch',
            'ru': 'Русский',
            'pt': 'Português',
            'it': 'Italiano',
            'ar': 'العربية',
            'hi': 'हिन्दी'
        };
        
        // 尝试完整匹配
        if (langMap[langCode]) {
            return langMap[langCode];
        }
        
        // 尝试主语言代码匹配
        const mainLang = langCode.split('-')[0];
        return langMap[mainLang] || 'English';
    };

    // ==================== 工具函数 ====================
    
    // 获取 URL 片段
    const getUrlFragments = (url) => {
        try {
            if (typeof vivaldi !== 'undefined' && vivaldi.utilities && vivaldi.utilities.getUrlFragments) {
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
    
    // 获取基础域名
    const getBaseDomain = (url) => {
        const {hostForSecurityDisplay, tld} = getUrlFragments(url);
        const match = hostForSecurityDisplay.match(`([^.]+\\.${ tld })$`);
        return match ? match[1] : hostForSecurityDisplay;
    };
    
    // 获取主机名
    const getHostname = (url) => {
        const {hostForSecurityDisplay} = getUrlFragments(url);
        return hostForSecurityDisplay;
    };
    
    // 获取标签页详情
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
    
    // 获取工作区名称
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
    
    // 检查工作区是否允许自动组栈
    const isAutoStackAllowed = async (workspaceId) => {
        if (config.auto_stack_workspaces.length === 0) {
            return false;
        }
        
        const workspaceName = await getWorkspaceName(workspaceId);
        return config.auto_stack_workspaces.includes(workspaceName);
    };
    
    // 添加到标签栈
    const addTabStack = async (tabId, stackId, stackName) => {
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
        
        chrome.tabs.update(tabId, { 
            vivExtData: JSON.stringify(vivExtData) 
        }, function() {
            if (chrome.runtime.lastError) {
                console.error('Error updating tab:', chrome.runtime.lastError);
            } else {
                console.log(`Added tab ${tabId} to stack ${stackId} (${stackName})`);
            }
        });
    };
    
    // ==================== AI 分组功能 ====================
    
    // 调用 GLM API 进行智能分组
const getAIGrouping = async (tabs, existingStacks = []) => {
        if (!config.glm_api_key) {
            console.error('GLM API key not configured');
            showNotification('未配置 GLM API Key，无法使用 AI 分组功能');
            return null;
        }
        
        if (tabs.length > config.max_tabs_for_ai) {
            console.warn(`Too many tabs (${tabs.length}), limiting to ${config.max_tabs_for_ai}`);
            tabs = tabs.slice(0, config.max_tabs_for_ai);
        }
        
        // 准备标签页信息
        const tabsInfo = tabs.map((tab, index) => ({
            id: index,
            title: tab.title || 'Untitled',
            domain: getHostname(tab.url),
            url: tab.url
        }));
        
        // 获取浏览器界面语言
        const browserLang = getBrowserLanguage();
        const languageName = getLanguageName(browserLang);
        
        console.log(`Browser language: ${browserLang} (${languageName})`);
        // const existingInfo = existingStacks.map(
        // (s, i) => `${i}. ${s.name || '未命名栈'} (ID: ${s.id})`
        // ).join('\n') || '无';
        const existingInfo = Array.isArray(existingStacks) && existingStacks.length > 0
        ? existingStacks.map((s, i) => `${i}. 栈标题: ${s.name || '未命名栈'} (ID: ${s.id})`).join('\n')
        : '无';

        // 构建提示词
        const prompt = `
        
**说明：**

下面分别是现有标签栈信息和待分组标签页信息：

现存标签栈标题与ID：
${existingInfo}

待归栈标签页信息：
${tabsInfo.map(t => `${t.id}. ${t.title} (${t.domain})`).join('\n')}

**按照下述规则对标签页进行归栈**

# 优先将待归栈标签页分配到现存标签栈

1. 如果待归栈标签页的信息与某个现有标签栈的栈标题语义比较相关, 则将其添加到该标签栈中:在你将要输出的Json中将标签页的(tab_ids)匹配到现存栈的栈标题(name)即可[非常重要];

如果待归栈标签页找不到语义相关的现存标签栈, 再考虑创建新的标签栈

# 创建新的标签栈时有如下要求:

2. **按内容主题归栈**：创建新的标签栈时, 依据待归栈标签页标题语义内容的相似性进行归类。

3. **组名必须十分具体**：
- 组名应简洁且具体，分析待归栈标签页的标题, 并解析标签页标题之间的联系是否构成一个具体课题, 按此标准分组并命名组
- 例如 "css overflow", "javascript异步问题", "xxxAPI集合" 等
- 不应该出现类似"xxx教程","xxx资源","资料搜索"这样笼统的标题
- 除非分组具体到只剩下一个标签页, 这时候允许更笼统的分组
- **所有组名必须使用 ${languageName} 语言命名**

4. **每组至少包含 2 个标签页**。单独一个标签页不能成组。

5. 只有一个标签页的组和无法与任何其他页面分组的标签页, 应当归入 "其它" 组（${languageName === '中文' ? '其它' : languageName === 'English' ? 'Others' : languageName === '日本語' ? 'その他' : 'その他'}）, 只有当现有标签栈中**不存在**"其它"组, 你才应该创建"其它"组, 即使其中没有任何标签页。

6. 每个标签页仅能出现在一个组中。

7. 绝对不要输出下述json以外的内容,输出且仅输出**严格有效的 JSON 格式**：
避免下述情况:
* 空元素（如 [5, , 7]）
* 缺漏引号或逗号
* tab_ids不允许仅包含单个标签组（如 "tab_ids": [6]）[非常重要]
* ***输出中不要有任何附加解释文字、注释或多余内容*** [非常重要]

**输出示例（必须严格遵守）：**

{
  "groups": [
    {
      "name": "组名",
      "tab_ids": [0, 1, 2]
    },
    {
      "name": "组名2",
      "tab_ids": [3, 4]
    },
    {
      "name": "${languageName === '中文' ? '其它' : languageName === 'English' ? 'Others' : 'その他'}",
      "tab_ids": [5, 6]
    }
  ]
}
  
`;

        try {
            console.log('AI Prompt Preview:\n', prompt);

            console.log('Calling GLM API for intelligent grouping...');
            console.log('Request payload:', {
                model: config.glm_model,
                messages: [{ role: 'user', content: prompt }]
            });
            
            const response = await fetch(config.glm_api_url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.glm_api_key}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: config.glm_model,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 2048,
                    stream: false,
                    thinking: {
                        "type": "disabled"
                    }
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
            
            // 解析 JSON 响应
            // 尝试提取 JSON（可能包含在 markdown 代码块中）
            let jsonStr = content.trim();
            
            // 移除可能的 markdown 代码块标记
            const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
            if (jsonMatch) {
                jsonStr = jsonMatch[1].trim();
            }
            
            // 移除可能的前后文字
            const firstBrace = jsonStr.indexOf('{');
            const lastBrace = jsonStr.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
                jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
            }
            
            console.log('Extracted JSON string:', jsonStr);
            
            let result;
            try {
                result = JSON.parse(jsonStr);
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                console.error('Failed JSON string:', jsonStr);
                showNotification('AI 返回的数据格式无效，无法解析 JSON。请查看控制台了解详情。');
                return null;
            }
            
            // 验证返回格式
            if (!result.groups || !Array.isArray(result.groups)) {
                console.error('Invalid response format: missing or invalid groups array');
                showNotification('AI 返回的数据格式不正确：缺少 groups 数组');
                return null;
            }
            
            // 验证每个组
            for (const group of result.groups) {
                if (!group.name || typeof group.name !== 'string') {
                    console.error('Invalid group: missing or invalid name', group);
                    showNotification('AI 返回的分组缺少有效的组名');
                    return null;
                }
                
                if (!Array.isArray(group.tab_ids)) {
                    console.error('Invalid group: tab_ids is not an array', group);
                    showNotification('AI 返回的分组中 tab_ids 不是数组');
                    return null;
                }
                
                // 检查是否有单个标签页的组（排除"其它"组）
                const othersNames = ['其它', 'Others', 'その他', 'Other', 'Outros', 'Andere', 'Autres'];
                if (group.tab_ids.length === 1 && !othersNames.includes(group.name)) {
                    console.warn('Warning: Group has only one tab:', group);
                }
            }
            
            // 将 tab_ids 映射回实际的标签页
            const groupedTabs = result.groups
                .map(group => ({
                    name: group.name,
                    tabs: group.tab_ids.map(id => tabs[id]).filter(t => t)
                }))
                .filter(g => g.tabs.length > 1); // 只保留有多个标签的组
            
            console.log('AI grouping result (before orphan check):', groupedTabs);
            
            // 检查是否有孤立的标签页未被分组
            const groupedTabIds = new Set();
            groupedTabs.forEach(group => {
                group.tabs.forEach(tab => groupedTabIds.add(tab.id));
            });
            
            const orphanTabs = tabs.filter(tab => !groupedTabIds.has(tab.id));
            
            if (orphanTabs.length > 0) {
                console.log(`Found ${orphanTabs.length} orphan tabs:`, orphanTabs.map(t => t.title));
                
                // 如果有孤立标签页，检查是否已存在"其它"组
                const othersNames = ['其它', 'Others', 'その他', 'Other', 'Outros', 'Andere', 'Autres', 'Otros', 'Altri'];
                let othersGroup = groupedTabs.find(g => othersNames.includes(g.name));
                
                if (othersGroup) {
                    // 将孤立标签页添加到现有"其它"组
                    console.log('Adding orphan tabs to existing "Others" group');
                    othersGroup.tabs.push(...orphanTabs);
                } else if (orphanTabs.length > 1) {
                    // 创建新的"其它"组（只有多个孤立标签时）
                    const othersName = languageName === '中文' ? '其它' : 
                                      languageName === 'English' ? 'Others' : 
                                      languageName === '日本語' ? 'その他' : 'Others';
                    console.log(`Creating new "Others" group with ${orphanTabs.length} tabs`);
                    groupedTabs.push({
                        name: othersName,
                        tabs: orphanTabs
                    });
                } else {
                    // 只有一个孤立标签页，不创建组
                    console.log('Only 1 orphan tab found, not creating group');
                }
            } else {
                console.log('No orphan tabs found, all tabs are grouped');
            }
            
            console.log('AI grouping result (final):', groupedTabs);
            
            if (groupedTabs.length === 0) {
                console.warn('No valid groups created (all groups have less than 2 tabs)');
                showNotification('AI 分组失败：所有分组都少于 2 个标签页');
                return null;
            }
            
            return groupedTabs;
            
        } catch (error) {
            console.error('Error calling GLM API:', error);
            showNotification(`调用 GLM API 时出错: ${error.message}`);
            return null;
        }
    };
    
    // 按域名分组（回退方案）
    const groupByDomain = (tabs) => {
        const tabsByHost = {};
        
        tabs.forEach(tab => {
            const hostname = getHostname(tab.url);
            if (!tabsByHost[hostname]) {
                tabsByHost[hostname] = [];
            }
            tabsByHost[hostname].push(tab);
        });
        
        // 只返回有多个标签的组
        const result = Object.entries(tabsByHost)
            .filter(([_, tabs]) => tabs.length > 1)
            .map(([hostname, tabs]) => {
                // 生成组名
                const baseDomain = getBaseDomain(tabs[0].url).split('.')[0];
                const name = baseDomain.charAt(0).toUpperCase() + baseDomain.slice(1);
                
                return {
                    name: name,
                    tabs: tabs
                };
            });
        
        return result;
    };
    
    // ==================== UI 相关 ====================

    // 显示通知
    function showNotification(message, type = 'error') {
        // 使用 Vivaldi 的通知 API（如果可用）
        if (typeof chrome !== 'undefined' && chrome.notifications) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><text y="32" font-size="32">⚠️</text></svg>',
                title: 'TidyTabs',
                message: message,
                priority: type === 'error' ? 2 : 1
            });
        } else {
            // Fallback: 在控制台显示
            console.error(`[TidyTabs] ${message}`);
            alert(`TidyTabs: ${message}`);
        }
    }

    // 创建Tidy按钮
    function createTidyButton() {
        const button = document.createElement('div');
        button.className = 'tidy-tabs-below-button';
        button.textContent = 'Tidy';
        return button;
    }

    // 创建加载图标
    function createLoadingIcon() {
        const container = document.createElement('div');
        container.className = 'tidy-loading-icon';
        container.innerHTML = `<svg width="28" height="28" style="padding:8px" fill="hsl(228, 97%, 42%)" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="RadialGradient8932"><stop offset="0%" stop-color="currentColor"/><stop offset="100%" stop-color="currentColor" stop-opacity=".25"/></linearGradient></defs><style>@keyframes spin8932{to{transform:rotate(360deg)}}</style><circle cx="10" cy="10" r="8" stroke-width="2" style="transform-origin:50% 50%;stroke:url(#RadialGradient8932);fill:none;animation:spin8932 .5s infinite linear"/></svg>`;
        return container;
    }

    // 显示加载状态
    function showLoading(separator) {
        const existing = separator.querySelector('.tidy-loading-icon');
        if (existing) return;
        
        const loadingIcon = createLoadingIcon();
        separator.appendChild(loadingIcon);
    }

    // 隐藏加载状态
    function hideLoading(separator) {
        const loadingIcon = separator.querySelector('.tidy-loading-icon');
        if (loadingIcon) {
            loadingIcon.remove();
        }
    }

    // 添加Tidy按钮到DOM
    function addTidyButton() {
        const separators = document.querySelectorAll('.tab-strip .separator');

        console.log('Found separators:', separators.length);

        separators.forEach(separator => {
            if (separator.querySelector('.tidy-tabs-below-button')) {
                return;
            }

            const tidyButton = createTidyButton();
            separator.appendChild(tidyButton);

            tidyButton.addEventListener('click', function(e) {
                e.stopPropagation();
                tidyTabsBelow(separator);
            });
        });
    }

    // ==================== 核心功能 ====================

    // 获取当前窗口中指定工作区的所有标签页
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

    // 执行标签栈创建
    const createTabStacks = async (groups) => {
        for (const group of groups) {
            // 如果是现有标签栈，使用已有的 stackId
            const stackId = group.stackId || crypto.randomUUID();
            const stackName = group.name;
            
            console.log(`${group.isExisting ? 'Adding to existing' : 'Creating'} stack "${stackName}" with ${group.tabs.length} tabs`);
            
            // 按索引排序
            group.tabs.sort((a, b) => a.index - b.index);
            
            // 获取第一个标签的位置作为目标位置
            let targetIndex = group.tabs[0].index;
            
            // 移动所有标签到相邻位置并添加到标签栈
            for (let i = 0; i < group.tabs.length; i++) {
                const tab = group.tabs[i];
                const moveIndex = targetIndex + i;
                
                // 先移动标签
                await new Promise((resolve) => {
                    chrome.tabs.move(tab.id, { index: moveIndex }, function() {
                        if (chrome.runtime.lastError) {
                            console.error('Error moving tab:', chrome.runtime.lastError);
                        }
                        resolve();
                    });
                });
                
                // 再添加到标签栈
                await addTabStack(tab.id, stackId, stackName);
            }
        }
    };

    // 自动组栈指定工作区的标签页
    const autoStackWorkspace = async (workspaceId) => {
        const allowed = await isAutoStackAllowed(workspaceId);
        
        if (!allowed) {
            return;
        }
        
        const workspaceName = await getWorkspaceName(workspaceId);
        console.log(`Auto-stacking workspace: ${workspaceName}`);
        
        const tabs = await getTabsByWorkspace(workspaceId);
        
        if (tabs.length < 2) {
            console.log('Not enough tabs in workspace');
            return;
        }
        
        let groups;
        
        if (config.enable_ai_grouping && config.glm_api_key) {
            // 尝试 AI 分组
            groups = await getAIGrouping(tabs);
            
            if (!groups) {
                console.log('AI grouping failed, falling back to domain grouping');
                groups = groupByDomain(tabs);
            }
        } else {
            // 使用域名分组
            groups = groupByDomain(tabs);
        }
        
        if (groups.length === 0) {
            console.log('No groups to create');
            return;
        }
        
        await createTabStacks(groups);
        console.log('Auto-stacking completed!');
    };

    // 手动整理指定位置以下的标签页
    async function tidyTabsBelow(separator) {
        let nextElement = separator.nextElementSibling;
        const tabsInfo = [];
        const existingStacks = []; // 存储现有的标签栈信息

        while (nextElement) {
            if (nextElement.tagName === 'SPAN') {
                const tabWrapper = nextElement.querySelector('.tab-wrapper');
                const tabPosition = nextElement.querySelector('.tab-position');

                // 检查是否是标签栈
                const isStack =
                    nextElement.querySelector('.stack-counter') !== null ||
                    nextElement.querySelector('.svg-tab-stack') !== null ||
                    nextElement.querySelector('.tab-position.is-substack, .tab-position.is-stack') !== null;

                if (isStack) {
                console.log('Found existing tab stack DOM:', nextElement.outerHTML.slice(0, 200));

                const stackWrapper = nextElement.querySelector('.tab-wrapper');
                const stackTabId = stackWrapper?.getAttribute('data-id')?.replace('tab-', '');

                if (stackTabId) {
                    // 用 query 获取所有 tabs
                    const allTabs = await new Promise(resolve => {
                    chrome.tabs.query({ currentWindow: true }, tabs => resolve(tabs));
                    });

                    // 查找 vivExtData 中有 group 的 tab（即栈头）
                    const stackTab = allTabs.find(t => {
                    try {
                        const data = JSON.parse(t.vivExtData || '{}');
                        return data && data.group && t.title && t.vivExtData.includes(stackTabId.slice(0, 8));
                    } catch {
                        return false;
                    }
                    });

                    if (stackTab) {
                    const viv = JSON.parse(stackTab.vivExtData);
                    existingStacks.push({
                        id: viv.group,
                        name: viv.fixedGroupTitle || stackTab.title || '未命名栈',
                        tabId: stackTab.id
                    });
                    console.log(`Detected existing stack: ${viv.fixedGroupTitle || stackTab.title} (ID: ${viv.group})`);
                    } else {
                    console.warn('No matching chrome tab found for DOM id:', stackTabId);
                    }
                }
                }

                else if (tabPosition && !tabPosition.classList.contains('is-pinned')) {
                    // 不再跳过 active 标签页，收集所有非固定标签页
                    let tabId = null;
                    if (tabWrapper) {
                        tabId = tabWrapper.getAttribute('data-id');
                    }

                    if (tabId) {
                        const actualTabId = tabId.replace('tab-', '');
                        const numericId = parseInt(actualTabId);
                        if (!isNaN(numericId)) {
                            tabsInfo.push({ id: numericId });
                        }
                    }
                }
            }
            nextElement = nextElement.nextElementSibling;
        }

        console.log('Tabs found:', tabsInfo.length);
        console.log('Existing stacks found:', existingStacks.length);

        if (tabsInfo.length < 2 && existingStacks.length === 0) {
            console.log('Not enough tabs to group (need at least 2) and no existing stacks');
            return;
        }

        // 显示加载动画
        showLoading(separator);

        try {
            // 获取所有标签页的详细信息
            const tabs = await Promise.all(
                tabsInfo.map(info => getTab(info.id))
            );

            const validTabs = tabs.filter(t => t !== null);
            
            console.log('Valid tabs:', validTabs.length);

            if (validTabs.length < 1 && existingStacks.length === 0) {
                console.log('No valid tabs or existing stacks');
                return;
            }

            let groups;
            
            if (config.enable_ai_grouping && config.glm_api_key) {
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
            // 隐藏加载动画
            hideLoading(separator);
            setTimeout(addTidyButton, 500);
        }
    }

    // ==================== 自动组栈监听器 ====================

    if (chrome.webNavigation) {
        chrome.webNavigation.onCommitted.addListener(async (details) => {
            if (details.tabId !== -1 && details.frameType === 'outermost_frame') {
                const tab = await getTab(details.tabId);
                
                if (tab && !tab.pinned && tab.vivExtData && !tab.vivExtData.panelId) {
                    const workspaceId = tab.vivExtData.workspaceId;
                    
                    setTimeout(() => {
                        autoStackWorkspace(workspaceId);
                    }, 1000);
                }
            }
        });
        
        console.log('Auto-stacking listener registered');
    }

    // ==================== 初始化 ====================

    function init() {
        console.log('Initializing TidyTabs extension');
        console.log('AI grouping:', config.enable_ai_grouping ? 'enabled' : 'disabled');
        console.log('Auto-stack workspaces:', config.auto_stack_workspaces);

        setTimeout(addTidyButton, 500);

        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' || mutation.type === 'attributes') {
                    if (mutation.addedNodes.length > 0) {
                        mutation.addedNodes.forEach(function(node) {
                            if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'SPAN') {
                                setTimeout(addTidyButton, 50);
                            }
                        });
                    }

                    if (mutation.type === 'attributes' && mutation.attributeName === 'aria-owns') {
                        console.log('aria-owns changed, re-adding Tidy button');
                        setTimeout(addTidyButton, 100);
                    }
                }
            });
        });

        const observeTabStrip = function() {
            const tabStrip = document.querySelector('.tab-strip');
            if (tabStrip) {
                console.log('Found tab-strip, starting observation');
                observer.observe(tabStrip, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['aria-owns']
                });
            } else {
                setTimeout(observeTabStrip, 500);
            }
        };

        observeTabStrip();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
