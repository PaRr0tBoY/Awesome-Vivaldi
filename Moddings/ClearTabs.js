(function() {
    'use strict';

    // 创建文字按钮
    function createTextButton() {
        const button = document.createElement('div');
        button.className = 'clear-tabs-below-button';
        button.textContent = 'Clear';
        return button;
    }

    // 添加文字按钮到DOM
    function addTextButton() {
        const separators = document.querySelectorAll('.tab-strip.overflow .separator');

        separators.forEach(separator => {
            // 检查是否已经添加了按钮
            if (separator.querySelector('.clear-tabs-below-button')) {
                return;
            }

            // 创建文字按钮
            const textButton = createTextButton();

            // 将按钮添加为separator的子元素
            separator.appendChild(textButton);

            // 添加点击事件
            textButton.addEventListener('click', function(e) {
                e.stopPropagation();
                closeTabsBelow(separator);
            });
        });
    }

// 关闭指定位置以下的所有非固定标签页
    function closeTabsBelow(separator) {
        // 获取separator后面的span元素
        let nextElement = separator.nextElementSibling;

        // 收集需要关闭的标签页ID
        const tabIdsToClose = [];

        // 遍历separator后面的元素
        while (nextElement) {
            // 如果是span元素
            if (nextElement.tagName === 'SPAN') {
                // 在span内查找.tab-wrapper或直接查找.tab-position
                const tabWrapper = nextElement.querySelector('.tab-wrapper');
                const tabPosition = nextElement.querySelector('.tab-position');
                
                // 检查是否是非固定标签页
                if (tabPosition && !tabPosition.classList.contains('is-pinned')) {
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
                            tabIdsToClose.push(numericId);
                        }
                    }
                }
            }
            nextElement = nextElement.nextElementSibling;
        }

        console.log('Tabs to close:', tabIdsToClose); // 调试用

        // 关闭收集到的标签页
        if (tabIdsToClose.length > 0) {
            chrome.tabs.remove(tabIdsToClose, function() {
                if (chrome.runtime.lastError) {
                    console.error('Error closing tabs:', chrome.runtime.lastError);
                } else {
                    console.log('Successfully closed tabs');
                }
            });
        }
    }

    // 初始化函数
    function init() {
        // 添加文字按钮
        addTextButton();

        // 监听DOM变化，确保按钮始终存在
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    // 检查是否有新的.tab-strip.overflow元素添加
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.classList && node.classList.contains('tab-strip') && node.classList.contains('overflow')) {
                                addTextButton();
                            }
                            // 检查子元素中是否有.tab-strip.overflow
                            const tabStrips = node.querySelectorAll && node.querySelectorAll('.tab-strip.overflow');
                            if (tabStrips && tabStrips.length > 0) {
                                addTextButton();
                            }
                        }
                    });
                }
            });
        });

        // 开始观察
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // 定期检查按钮是否存在（备用方案）
        setInterval(addTextButton, 3000);
    }

    // 等待DOM加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
