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
                    // 检查是否是非固定标签页（包括激活的标签页）
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
                                element: nextElement
                            });
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
                        index: tabInfo.index,
                        element: tab.element
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

    // 创建或更新域名分组标题
    function createGroupHeader(hostname) {
        const header = document.createElement('div');
        header.className = 'tidy-group-header';
        header.textContent = hostname;
        header.setAttribute('data-hostname', hostname);
        return header;
    }

    // 清除所有现有的分组标题
    function clearGroupHeaders() {
        const existingHeaders = document.querySelectorAll('.tidy-group-header');
        existingHeaders.forEach(header => header.remove());
    }

    // 检查组内是否还有标签页
    function checkGroupEmpty(groupHostname) {
        const headers = document.querySelectorAll(`.tidy-group-header[data-hostname="${groupHostname}"]`);
        const groupMembers = document.querySelectorAll(`span.tidy-group-member[data-hostname="${groupHostname}"]`);

        // 如果没有组员，删除对应的标题
        if (groupMembers.length === 0 && headers.length > 0) {
            headers.forEach(header => header.remove());
            console.log(`Removed empty group header for: ${groupHostname}`);
            return true;
        }
        return false;
    }

    // 检查所有组是否为空
    function checkAllGroupsEmpty() {
        const allHeaders = document.querySelectorAll('.tidy-group-header');
        let hasEmptyGroups = false;

        allHeaders.forEach(header => {
            const hostname = header.getAttribute('data-hostname');
            if (hostname && checkGroupEmpty(hostname)) {
                hasEmptyGroups = true;
            }
        });

        console.log('Checked all groups for emptiness:', hasEmptyGroups ? 'found empty groups' : 'no empty groups');
    }

    // 为标签页元素添加分组样式
function applyGroupStyles(groupedTabs) {
    clearGroupHeaders();

    const allTabs = document.querySelectorAll('.tab-strip span');
    allTabs.forEach(span => {
        span.classList.remove('tidy-group-first', 'tidy-group-member');
        const oldHeader = span.querySelector('.tidy-group-header');
        if (oldHeader) oldHeader.remove();
    });

    const tabStrip = document.querySelector('.tab-strip');
    if (!tabStrip) return;

    Object.entries(groupedTabs).forEach(([hostname, tabs]) => {
        tabs.forEach((tab, index) => {
            const span = tab.element;
            if (!span) return;

            if (index === 0) {
                span.classList.add('tidy-group-first');

                const header = createGroupHeader(hostname);
                tabStrip.insertBefore(header, span); // 插入到对应 tab 前

                // === 新增：计算并设置绝对定位 ===
                const posY = parseFloat(span.querySelector('.tab-position')
                    ?.style.getPropertyValue('--PositionY') || 0);
                const posX = parseFloat(span.querySelector('.tab-position')
                    ?.style.getPropertyValue('--PositionX') || 0);
                const width = parseFloat(span.querySelector('.tab-position')
                    ?.style.getPropertyValue('--Width') || 180);
                const height = parseFloat(span.querySelector('.tab-position')
                    ?.style.getPropertyValue('--Height') || 30);

                header.style.position = 'relative';
                header.style.left = `${posX}px`;
                header.style.top = `${posY}px`; // 放在标签上方
                header.style.width = `${width}px`;
                header.style.pointerEvents = 'none';
                header.style.zIndex = '2000';
                // ============================

            } else {
                span.classList.add('tidy-group-member');
                // 为组员添加数据属性以便后续检查
                span.setAttribute('data-hostname', hostname);
            }
        });
    });

    // 应用样式后检查空组
    setTimeout(() => {
        checkAllGroupsEmpty();
    }, 100);
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
            let movePromises = [];

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
                        const promise = new Promise((resolve) => {
                            chrome.tabs.move(tab.id, { index: targetIndex }, function(movedTab) {
                                if (chrome.runtime.lastError) {
                                    console.error('Error moving tab:', chrome.runtime.lastError);
                                } else {
                                    console.log(`Moved tab ${tab.id} to index ${targetIndex}`);
                                }
                                resolve();
                            });
                        });
                        movePromises.push(promise);
                    }
                });

                currentIndex += tabs.length;
            });

            // 等待所有移动操作完成后，应用分组样式
            Promise.all(movePromises).then(() => {
                setTimeout(() => {
                    applyGroupStyles(groupedTabs);
                    console.log('Tabs have been organized by domain with group headers');
                    
                    // 重新添加按钮
                    setTimeout(addTidyButton, 100);
                }, 300);
            });
        });
    }

    // 获取当前工作区名称
    function getCurrentWorkspaceName() {
        const workspaceButton = document.querySelector('.ToolbarButton-Button .button-title');
        return workspaceButton ? workspaceButton.textContent.trim() : 'default';
    }

    // 存储工作区分组状态
    const workspaceGroupState = {};

    // 保存当前工作区的分组状态
    function saveWorkspaceGroupState(workspaceName, groupedTabs) {
        if (groupedTabs && Object.keys(groupedTabs).length > 0) {
            workspaceGroupState[workspaceName] = groupedTabs;
            console.log(`Saved group state for workspace: ${workspaceName}`);
        } else {
            delete workspaceGroupState[workspaceName];
        }
    }

    // 隐藏当前工作区的所有组标题
    function hideGroupHeadersForWorkspace(workspaceName) {
        if (workspaceGroupState[workspaceName]) {
            const existingHeaders = document.querySelectorAll('.tidy-group-header');
            existingHeaders.forEach(header => {
                header.style.display = 'none';
            });
            console.log(`Hidden headers for workspace: ${workspaceName}`);
        }
    }

    // 显示当前工作区的组标题（如果有的话）
    function showGroupHeadersForWorkspace(workspaceName) {
        if (workspaceGroupState[workspaceName]) {
            const groupedTabs = workspaceGroupState[workspaceName];
            applyGroupStyles(groupedTabs);
            console.log(`Restored headers for workspace: ${workspaceName}`);
        }
    }

    // 工作区切换监控
    let workspaceObserver;
    let currentWorkspaceName = getCurrentWorkspaceName();

    // 监听工作区变化
    function observeWorkspaceChanges() {
        if (workspaceObserver) {
            workspaceObserver.disconnect();
        }

        // 观察工作区按钮的变化
        const workspaceButton = document.querySelector('.ToolbarButton-Button .button-title');
        if (workspaceButton) {
            workspaceObserver = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'textContent') {
                        const newWorkspaceName = getCurrentWorkspaceName();
                        if (newWorkspaceName !== currentWorkspaceName) {
                            console.log(`Workspace changed from ${currentWorkspaceName} to ${newWorkspaceName}`);

                            // 保存当前工作区的分组状态
                            saveWorkspaceGroupState(currentWorkspaceName, getCurrentGroupedTabs());

                            // 隐藏当前工作区的组标题
                            hideGroupHeadersForWorkspace(currentWorkspaceName);

                            // 更新当前工作区
                            currentWorkspaceName = newWorkspaceName;

                            // 延迟显示新工作区的组标题
                            setTimeout(() => {
                                showGroupHeadersForWorkspace(currentWorkspaceName);
                                // 检查新工作区的空组
                                setTimeout(checkAllGroupsEmpty, 300);
                            }, 500);
                        }
                    }
                });
            });

            workspaceObserver.observe(workspaceButton, {
                attributes: true,
                attributeFilter: ['textContent'],
                childList: false,
                subtree: false
            });
        }
    }

    // 获取当前的分组状态
    function getCurrentGroupedTabs() {
        const existingHeaders = document.querySelectorAll('.tidy-group-header');
        const groupedTabs = {};

        existingHeaders.forEach(header => {
            const hostname = header.getAttribute('data-hostname');
            if (hostname) {
                const firstTab = document.querySelector(`span.tidy-group-first[data-hostname="${hostname}"]`);
                if (firstTab) {
                    groupedTabs[hostname] = [{
                        id: firstTab.getAttribute('data-tab-id'),
                        hostname: hostname,
                        element: firstTab
                    }];
                }
            }
        });

        return groupedTabs;
    }

    // 初始化函数
    function init() {
        console.log('Initializing TidyTabs extension');

        // 初始添加按钮
        setTimeout(addTidyButton, 500);

        // 监听工作区变化
        setTimeout(observeWorkspaceChanges, 1000);

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

                    // 检查是否有元素被移除（标签页关闭）
                    if (mutation.removedNodes.length > 0) {
                        // 延迟检查空组，给DOM更新一些时间
                        setTimeout(checkAllGroupsEmpty, 200);
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
