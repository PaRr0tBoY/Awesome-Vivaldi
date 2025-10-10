(function() {
    'use strict';

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

    // 整理指定位置以下的标签页
    function tidyTabsBelow(separator) {
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
                                // 获取标签页的实际URL
                                chrome.tabs.get(numericId, function(tab) {
                                    if (chrome.runtime.lastError) {
                                        console.error('Error getting tab:', chrome.runtime.lastError);
                                        return;
                                    }
                                    
                                    const hostname = extractHostname(tab.url);
                                    tabsInfo.push({
                                        id: numericId,
                                        url: tab.url,
                                        hostname: hostname,
                                        index: tab.index
                                    });

                                    console.log('Added tab:', {id: numericId, hostname: hostname});
                                });
                            }
                        }
                    }
                }
            }
            nextElement = nextElement.nextElementSibling;
        }

        // 等待所有标签页信息收集完成后再分组
        setTimeout(function() {
            console.log('Tabs to organize:', tabsInfo);
            
            // 按域名分组标签页
            const groupedTabs = groupTabsByHostname(tabsInfo);
            
            console.log('Grouped tabs:', groupedTabs);

            // 创建标签组
            createTabGroups(groupedTabs);

            // 重新添加按钮
            setTimeout(addTidyButton, 100);
        }, 500);
    }

    // 提取主机名
    function extractHostname(url) {
        if (!url) return 'unknown';
        try {
            const urlObj = new URL(url);
            // 返回完整主机名
            return urlObj.hostname;
        } catch (e) {
            // 如果URL解析失败，尝试提取域名
            const match = url.match(/^(?:https?:\/\/)?([^\/]+)/i);
            return match ? match[1] : 'unknown';
        }
    }

    // 按主机名分组标签页
    function groupTabsByHostname(tabs) {
        const groups = {};

        tabs.forEach(tab => {
            const hostname = tab.hostname || 'unknown';
            if (!groups[hostname]) {
                groups[hostname] = [];
            }
            groups[hostname].push(tab);
        });

        // 只返回有多个标签页的组
        const filteredGroups = {};
        for (const [hostname, tabs] of Object.entries(groups)) {
            if (tabs.length > 1) {
                filteredGroups[hostname] = tabs;
            }
        }

        return filteredGroups;
    }

    // 创建标签组
    function createTabGroups(groupedTabs) {
        const hostnames = Object.keys(groupedTabs);
        
        if (hostnames.length === 0) {
            console.log('No groups to create (no duplicate hostnames found)');
            return;
        }

        console.log('Creating groups for hostnames:', hostnames);

        // 按顺序处理每个域名组
        hostnames.forEach((hostname, index) => {
            const tabs = groupedTabs[hostname];
            
            // 按索引排序标签页
            tabs.sort((a, b) => a.index - b.index);
            
            const tabIds = tabs.map(tab => tab.id);
            
            console.log(`Grouping ${tabIds.length} tabs for ${hostname}:`, tabIds);

            // 使用chrome.tabs.group API
            setTimeout(() => {
                chrome.tabs.group({
                    tabIds: tabIds
                }, function(groupId) {
                    if (chrome.runtime.lastError) {
                        console.error('Error creating tab group:', chrome.runtime.lastError);
                    } else {
                        console.log(`Created group ${groupId} for ${hostname}`);
                        
                        // 尝试更新组标题和颜色（如果API支持）
                        if (chrome.tabs.group && typeof chrome.tabs.group.update === 'function') {
                            chrome.tabs.group.update(groupId, {
                                title: hostname,
                                collapsed: false
                            }, function() {
                                if (chrome.runtime.lastError) {
                                    console.log('Could not update group title:', chrome.runtime.lastError);
                                }
                            });
                        }
                    }
                });
            }, index * 100); // 延迟处理，避免并发问题
        });
    }

    // 初始化函数
    function init() {
        console.log('Initializing TidyTabs extension');

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
