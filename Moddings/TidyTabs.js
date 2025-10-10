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
        Promise.all(tabsInfo.map(tab => 
            new Promise((resolve) => {
                chrome.tabs.get(tab.id, function(tabInfo) {
                    if (chrome.runtime.lastError) {
                        console.error('Error getting tab:', chrome.runtime.lastError);
                        resolve(null);
                        return;
                    }
                    
                    const hostname = extractHostname(tabInfo.url);
                    resolve({
                        id: tab.id,
                        url: tabInfo.url,
                        hostname: hostname,
                        index: tabInfo.index
                    });
                });
            })
        )).then(results => {
            // 过滤掉失败的请求
            const validTabs = results.filter(t => t !== null);
            
            console.log('Valid tabs:', validTabs);

            // 按域名分组
            const groupedTabs = groupTabsByHostname(validTabs);
            
            console.log('Grouped tabs:', groupedTabs);

            // 移动相同域名的标签页到相邻位置
            organizeTabs(groupedTabs);

            // 重新添加按钮
            setTimeout(addTidyButton, 500);
        });
    }

    // 提取主机名
    function extractHostname(url) {
        if (!url) return 'unknown';
        try {
            const urlObj = new URL(url);
            return urlObj.hostname;
        } catch (e) {
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
                // 按索引排序
                tabs.sort((a, b) => a.index - b.index);
                filteredGroups[hostname] = tabs;
            }
        }

        return filteredGroups;
    }

    // 组织标签页：将相同域名的标签页移动到相邻位置
    function organizeTabs(groupedTabs) {
        const hostnames = Object.keys(groupedTabs);
        
        if (hostnames.length === 0) {
            console.log('No groups to organize (no duplicate hostnames found)');
            return;
        }

        console.log('Organizing groups for hostnames:', hostnames);

        // 获取当前窗口ID
        chrome.windows.getCurrent({}, function(window) {
            if (chrome.runtime.lastError) {
                console.error('Error getting window:', chrome.runtime.lastError);
                return;
            }

            let currentIndex = -1;

            // 依次处理每个域名组
            hostnames.forEach((hostname) => {
                const tabs = groupedTabs[hostname];
                
                console.log(`Organizing ${tabs.length} tabs for ${hostname}`);

                // 找到这组标签中索引最小的
                const minIndex = Math.min(...tabs.map(t => t.index));
                
                if (currentIndex === -1) {
                    currentIndex = minIndex;
                }

                // 将所有标签移动到相邻位置
                tabs.forEach((tab, i) => {
                    const targetIndex = currentIndex + i;
                    if (tab.index !== targetIndex) {
                        chrome.tabs.move(tab.id, { index: targetIndex }, function(movedTab) {
                            if (chrome.runtime.lastError) {
                                console.error('Error moving tab:', chrome.runtime.lastError);
                            } else {
                                console.log(`Moved tab ${tab.id} to index ${targetIndex}`);
                            }
                        });
                    }
                });

                currentIndex += tabs.length;
            });

            console.log('Tabs have been organized by domain. You can now manually create tab stacks by dragging tabs together.');
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
