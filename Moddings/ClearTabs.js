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
        const separators = document.querySelectorAll('.tab-strip .separator');
        

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
                
                // 检查是否是标签栈：检查是否有is-substack类或svg-tab-stack元素
                const isStack = tabPosition?.classList.contains('is-substack') || 
                               nextElement.querySelector('.svg-tab-stack') !== null;
                
                if (isStack) {
                    // 如果是标签栈，跳过它（不关闭标签栈）
                    console.log('Skipping tab stack');
                } else if (tabPosition && !tabPosition.classList.contains('is-pinned')) {
                    // 检查是否是非固定标签页且不是激活状态
                    // 检查是否包含.active类
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
                                tabIdsToClose.push(numericId);
                            }
                        }
                    }
                }
            }
            nextElement = nextElement.nextElementSibling;
        }


        // 关闭收集到的标签页
        if (tabIdsToClose.length > 0) {
            chrome.tabs.remove(tabIdsToClose, function() {
                if (chrome.runtime.lastError) {
                    console.error('Error closing tabs:', chrome.runtime.lastError);
                } else {
                    // console.log('Successfully closed tabs');
                    // 关闭标签页后，重新添加按钮
                    setTimeout(addTextButton, 100);
                }
            });
        }
    }

    // 初始化函数
    function init() {
        // 初始添加按钮
        setTimeout(addTextButton, 500); // 延迟执行，确保DOM已加载
        
        // 监听DOM变化
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' || mutation.type === 'attributes') {
                    // 检查是否有span元素被添加（标签页变化）
                    if (mutation.addedNodes.length > 0) {
                        mutation.addedNodes.forEach(function(node) {
                            if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'SPAN') {
                                // 标签页可能被添加，检查按钮
                                setTimeout(addTextButton, 50);
                            }
                        });
                    }
                    
                    // 检查aria-owns属性变化（工作区切换）
                    if (mutation.type === 'attributes' && mutation.attributeName === 'aria-owns') {
                        setTimeout(addTextButton, 100);
                    }
                }
            });
        });

        // 观察.tab-strip元素
        const observeTabStrip = function() {
            const tabStrip = document.querySelector('.tab-strip');
            if (tabStrip) {
                // console.log('Found tab-strip, starting observation'); // 调试用
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
