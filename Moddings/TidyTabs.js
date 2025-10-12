(function() {
    'use strict';

    // 配置
    const config = {
        base_domain: false,  // 使用基础域名 (true) 或完整主机名 (false)
        rename_stack: 2,     // 0: 不重命名, 1: 使用主机名, 2: 使用基础域名首字母大写
        
        // 允许自动标签栈的工作区 (完全一致或 <default_workspace>)
        // 空数组 = 禁用所有工作区的自动组栈，只能手动点击按钮
        // Workspaces that allow automatic tab stacking (exact match or <default_workspace>)
        // Empty array = disable automatic stacking for all workspaces, manual button click only
        auto_stack_workspaces: [
            // "<default_workspace>",  // 默认工作区（没有工作区时）
            "Relax",
            // "工作区名称2",
        ],
    };

    // ==================== 工具函数 ====================
    
    // 获取 URL 片段
    const getUrlFragments = (url) => {
        try {
            if (typeof vivaldi !== 'undefined' && vivaldi.utilities && vivaldi.utilities.getUrlFragments) {
                return vivaldi.utilities.getUrlFragments(url);
            }
        } catch (e) {
            // Fallback to manual parsing
        }
        
        // Fallback 实现
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
        return config.base_domain ? getBaseDomain(url) : hostForSecurityDisplay;
    };
    
    // 获取标签栈名称
    const getTabStackName = (url) => {
        let stackName;
        
        switch (config.rename_stack) {
            case 1:
                stackName = getHostname(url);
                break;
            case 2:
                stackName = getBaseDomain(url).split('.')[0];
                stackName = stackName.charAt(0).toUpperCase() + stackName.slice(1);
                break;
            default:
                stackName = '';
        }
        return stackName;
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
        // 如果配置为空数组，则不允许任何工作区自动组栈
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
                console.log(`Added tab ${tabId} to stack ${stackId}`);
            }
        });
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
            // 检查是否已经添加了按钮
            if (separator.querySelector('.tidy-tabs-below-button')) {
                console.log('Tidy button already exists');
                return;
            }

            console.log('Adding Tidy button to separator');

            // 创建Tidy按钮
            const tidyButton = createTidyButton();

            // 将按钮添加为separator的子元素
            separator.appendChild(tidyButton);

            // 添加点击事件
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
                
                // 过滤出指定工作区的标签页
                const validTabs = [];
                for (const tab of tabs) {
                    if (tab.id === -1 || !tab.vivExtData) continue;
                    
                    try {
                        const vivExtData = JSON.parse(tab.vivExtData);
                        
                        // 检查是否属于指定工作区
                        if (vivExtData.workspaceId === workspaceId) {
                            // 排除固定标签和面板标签
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

    // 自动组栈指定工作区的标签页
    const autoStackWorkspace = async (workspaceId) => {
        const allowed = await isAutoStackAllowed(workspaceId);
        
        if (!allowed) {
            console.log('Auto-stacking not allowed for this workspace');
            return;
        }
        
        const workspaceName = await getWorkspaceName(workspaceId);
        console.log(`Auto-stacking workspace: ${workspaceName}`);
        
        const tabs = await getTabsByWorkspace(workspaceId);
        
        if (tabs.length < 2) {
            console.log('Not enough tabs in workspace');
            return;
        }
        
        // 按域名分组
        const tabsByHost = {};
        tabs.forEach(tab => {
            const hostname = getHostname(tab.url);
            if (!tabsByHost[hostname]) {
                tabsByHost[hostname] = [];
            }
            tabsByHost[hostname].push(tab);
        });
        
        // 只处理有多个标签的域名组
        const hostsToStack = Object.entries(tabsByHost)
            .filter(([_, tabs]) => tabs.length > 1);
        
        if (hostsToStack.length === 0) {
            console.log('No duplicate domains found');
            return;
        }
        
        // 创建标签栈
        for (const [hostname, tabs] of hostsToStack) {
            // 检查是否已经在栈中
            const existingStackIds = new Set(
                tabs.map(t => t.vivExtData.group).filter(g => g)
            );
            
            let stackId;
            if (existingStackIds.size > 0) {
                // 使用已存在的 stack ID
                stackId = Array.from(existingStackIds)[0];
            } else {
                // 生成新的 stack ID
                stackId = crypto.randomUUID();
            }
            
            const stackName = getTabStackName(tabs[0].url);
            
            console.log(`Auto-stacking ${hostname} with ${tabs.length} tabs`);
            
            // 按索引排序
            tabs.sort((a, b) => a.index - b.index);
            
            // 获取第一个标签的位置作为目标位置
            let targetIndex = tabs[0].index;
            
            // 移动所有标签到相邻位置并添加到标签栈
            for (let i = 0; i < tabs.length; i++) {
                const tab = tabs[i];
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
        
        console.log('Auto-stacking completed!');
    };

    // 手动整理指定位置以下的标签页
    async function tidyTabsBelow(separator) {
        // 获取separator后面的span元素
        let nextElement = separator.nextElementSibling;

        // 收集需要分组的标签页信息
        const tabsInfo = [];

        // 遍历separator后面的元素
        while (nextElement) {
            // 如果是span元素
            if (nextElement.tagName === 'SPAN') {
                // 在span内查找.tab-wrapper或直接查找.tab-position
                const tabWrapper = nextElement.querySelector('.tab-wrapper');
                const tabPosition = nextElement.querySelector('.tab-position');

                // 检查是否是标签栈：检查是否有is-substack类或svg-tab-stack元素
                const isStack = tabPosition?.classList.contains('is-substack') ||
                               nextElement.querySelector('.svg-tab-stack') !== null;

                if (isStack) {
                    // 如果是标签栈，跳过它
                    console.log('Skipping tab stack');
                } else if (tabPosition && !tabPosition.classList.contains('is-pinned')) {
                    // 检查是否是非固定标签页且不是激活状态
                    const isActive = tabPosition.querySelector('.active') !== null;

                    if (!isActive) {
                        // 从.tab-wrapper获取data-id
                        let tabId = null;
                        if (tabWrapper) {
                            tabId = tabWrapper.getAttribute('data-id');
                        }

                        if (tabId) {
                            // 提取实际的tabId（去掉前缀）
                            const actualTabId = tabId.replace('tab-', '');
                            const numericId = parseInt(actualTabId);
                            if (!isNaN(numericId)) {
                                tabsInfo.push({
                                    id: numericId,
                                    element: tabPosition
                                });
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

        // 过滤掉失败的请求
        const validTabs = tabs.filter(t => t !== null);
        
        console.log('Valid tabs:', validTabs.length);

        if (validTabs.length < 2) {
            console.log('Not enough valid tabs');
            return;
        }

        // 按域名分组
        const tabsByHost = {};
        validTabs.forEach(tab => {
            const hostname = getHostname(tab.url);
            if (!tabsByHost[hostname]) {
                tabsByHost[hostname] = [];
            }
            tabsByHost[hostname].push(tab);
        });

        console.log('Grouped by hostname:', Object.keys(tabsByHost));

        // 只处理有多个标签的域名组
        const hostsToStack = Object.entries(tabsByHost)
            .filter(([_, tabs]) => tabs.length > 1);

        if (hostsToStack.length === 0) {
            console.log('No duplicate domains found');
            return;
        }

        // 创建标签栈
        for (const [hostname, tabs] of hostsToStack) {
            // 生成唯一的 stack ID
            const stackId = crypto.randomUUID();
            const stackName = getTabStackName(tabs[0].url);
            
            console.log(`Creating stack for ${hostname} with ${tabs.length} tabs`);
            console.log(`Stack ID: ${stackId}, Stack Name: ${stackName}`);

            // 按索引排序
            tabs.sort((a, b) => a.index - b.index);

            // 获取第一个标签的位置作为目标位置
            let targetIndex = tabs[0].index;

            // 移动所有标签到相邻位置并添加到标签栈
            for (let i = 0; i < tabs.length; i++) {
                const tab = tabs[i];
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

        console.log('Tab stacking completed!');

        // 重新添加按钮
        setTimeout(addTidyButton, 500);
    }

    // ==================== 自动组栈监听器 ====================

    // 监听标签页导航事件以触发自动组栈
    if (chrome.webNavigation) {
        chrome.webNavigation.onCommitted.addListener(async (details) => {
            if (details.tabId !== -1 && details.frameType === 'outermost_frame') {
                const tab = await getTab(details.tabId);
                
                if (tab && !tab.pinned && tab.vivExtData && !tab.vivExtData.panelId) {
                    const workspaceId = tab.vivExtData.workspaceId;
                    
                    // 延迟执行自动组栈，避免过于频繁
                    setTimeout(() => {
                        autoStackWorkspace(workspaceId);
                    }, 500);
                }
            }
        });
        
        console.log('Auto-stacking listener registered');
    }

    // ==================== 初始化 ====================

    // 初始化函数
    function init() {
        console.log('Initializing TidyTabs extension');
        console.log('Auto-stack workspaces:', config.auto_stack_workspaces);

        // 初始添加按钮
        setTimeout(addTidyButton, 500);

        // 监听DOM变化
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' || mutation.type === 'attributes') {
                    // 检查是否有span元素被添加（标签页变化）
                    if (mutation.addedNodes.length > 0) {
                        mutation.addedNodes.forEach(function(node) {
                            if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'SPAN') {
                                // 标签页可能被添加，检查按钮
                                setTimeout(addTidyButton, 50);
                            }
                        });
                    }

                    // 检查aria-owns属性变化（工作区切换）
                    if (mutation.type === 'attributes' && mutation.attributeName === 'aria-owns') {
                        console.log('aria-owns changed, re-adding Tidy button');
                        setTimeout(addTidyButton, 100);
                    }
                }
            });
        });

        // 观察.tab-strip元素
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
                // 如果还没找到，继续等待
                setTimeout(observeTabStrip, 500);
            }
        };

        observeTabStrip();
    }

    // 等待DOM加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
