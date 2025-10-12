(function() {
    'use strict';

    // 配置
    const config = {
        // GLM API 配置
        glm_api_url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
        glm_api_key: '', // 请填入您的 API Key
        glm_model: 'glm-4.5-flash', // 使用 flash 版本以获得更快响应
        
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
    const getAIGrouping = async (tabs) => {
        if (!config.glm_api_key) {
            console.error('GLM API key not configured');
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
        
        // 构建提示词
        const prompt = `请分析以下标签页，将它们按照内容相关性进行智能分组，并为每组起一个简短的中文名称（2-6个字）。

标签页列表：
${tabsInfo.map(t => `${t.id}. ${t.title} (${t.domain})`).join('\n')}

请严格按照以下 JSON 格式返回结果，不要有任何其他文字：
{
  "groups": [
    {
      "name": "组名",
      "tab_ids": [0, 1, 2]
    }
  ]
}

注意事项：
1. 每个标签页只能出现在一个组中
2. 相关性不高的孤立标签页全部分配到"其它"组
3. 优先考虑内容主题相关性，其次考虑域名
4. 组名要简洁、准确、易懂
5. 只返回 JSON，不要有任何其他内容`;

        try {
            console.log('Calling GLM API for intelligent grouping...');
            
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
                    stream: false
                })
            });
            
            if (!response.ok) {
                throw new Error(`GLM API error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            const content = data.choices[0].message.content;
            
            console.log('GLM API response:', content);
            
            // 解析 JSON 响应
            // 尝试提取 JSON（可能包含在 markdown 代码块中）
            let jsonStr = content;
            const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
            if (jsonMatch) {
                jsonStr = jsonMatch[1];
            }
            
            const result = JSON.parse(jsonStr);
            
            // 验证返回格式
            if (!result.groups || !Array.isArray(result.groups)) {
                throw new Error('Invalid response format');
            }
            
            // 将 tab_ids 映射回实际的标签页
            const groupedTabs = result.groups.map(group => ({
                name: group.name,
                tabs: group.tab_ids.map(id => tabs[id]).filter(t => t)
            })).filter(g => g.tabs.length > 1); // 只保留有多个标签的组
            
            console.log('AI grouping result:', groupedTabs);
            
            return groupedTabs;
            
        } catch (error) {
            console.error('Error calling GLM API:', error);
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

    // 创建Tidy按钮
    function createTidyButton() {
        const button = document.createElement('div');
        button.className = 'tidy-tabs-below-button';
        button.textContent = 'Tidy';
        return button;
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
            const stackId = crypto.randomUUID();
            const stackName = group.name;
            
            console.log(`Creating stack "${stackName}" with ${group.tabs.length} tabs`);
            
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

        while (nextElement) {
            if (nextElement.tagName === 'SPAN') {
                const tabWrapper = nextElement.querySelector('.tab-wrapper');
                const tabPosition = nextElement.querySelector('.tab-position');

                const isStack = tabPosition?.classList.contains('is-substack') ||
                               nextElement.querySelector('.svg-tab-stack') !== null;

                if (isStack) {
                    console.log('Skipping tab stack');
                } else if (tabPosition && !tabPosition.classList.contains('is-pinned')) {
                    const isActive = tabPosition.querySelector('.active') !== null;

                    if (!isActive) {
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
            }
            nextElement = nextElement.nextElementSibling;
        }

        console.log('Tabs found:', tabsInfo.length);

        if (tabsInfo.length < 2) {
            console.log('Not enough tabs to group (need at least 2)');
            return;
        }

        // 获取所有标签页的详细信息
        const tabs = await Promise.all(
            tabsInfo.map(info => getTab(info.id))
        );

        const validTabs = tabs.filter(t => t !== null);
        
        console.log('Valid tabs:', validTabs.length);

        if (validTabs.length < 2) {
            console.log('Not enough valid tabs');
            return;
        }

        let groups;
        
        if (config.enable_ai_grouping && config.glm_api_key) {
            console.log('Using AI grouping...');
            groups = await getAIGrouping(validTabs);
            
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

        setTimeout(addTidyButton, 500);
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
