/**
 * TidyTitle.js - Vivaldi 标签页智能重命名模组
 * 
 * 功能：
 * - 监控被用户固定的标签页。
 * - 调用 GLM API，根据标签页的标题、URL和页面正文内容，生成一个更美观、统一的新标题。
 * - 采用流式输出，在AI生成标题时实时更新标签页名称。
 * - 如果重命名失败，则保持原标题并显示通知。
 * 
 * 作者：AI & User
 * 版本：1.0
 * 日期：2025-10-12
 */

(function() {
    'use strict';

    // ==================== 配置 ====================
    // 注意：此配置应与 TidyTabs.js 中的配置保持同步
    const config = {
        // GLM API 配置
        glm_api_url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
        glm_api_key: 'e2105adcbe8d4d6ea49dce2fd94c127f.6dcsB9uMmtNxKXl2', // 请填入您的 API Key
        glm_model: 'glm-4.5-flash', // 使用 flash 版本以获得更快响应
        
        // 内容提取配置
        max_content_length: 800, // 提取页面正文的最大长度
    };

    // ==================== 工具函数 ====================

    // 获取浏览器界面语言
    const getBrowserLanguage = () => {
        return chrome.i18n.getUILanguage() || navigator.language || 'zh-CN';
    };

    // 将语言代码转换为自然语言名称
    const getLanguageName = (langCode) => {
        const langMap = {
            'zh': '中文', 'zh-CN': '中文', 'zh-TW': '中文',
            'en': 'English', 'en-US': 'English', 'en-GB': 'English',
            'ja': '日本語', 'ja-JP': '日本語',
            'ko': '한국어', 'ko-KR': '한국어',
            'es': 'Español', 'fr': 'Français', 'de': 'Deutsch',
            'ru': 'Русский', 'pt': 'Português', 'it': 'Italiano',
            'ar': 'العربية', 'hi': 'हिन्दी'
        };
        if (langMap[langCode]) return langMap[langCode];
        const mainLang = langCode.split('-')[0];
        return langMap[mainLang] || 'English';
    };

    // 显示通知 (复用自 TidyTabs.js)
    function showNotification(message, type = 'error') {
        if (typeof chrome !== 'undefined' && chrome.notifications) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><text y="32" font-size="32">🔖</text></svg>',
                title: 'TidyTitle',
                message: message,
                priority: type === 'error' ? 2 : 1
            });
        } else {
            console.error(`[TidyTitle] ${message}`);
            alert(`TidyTitle: ${message}`);
        }
    }

    // 根据Tab ID查找标题元素
    const findTabTitleElement = (tabId) => {
        const tabWrapper = document.querySelector(`.tab-wrapper[data-id="tab-${tabId}"]`);
        if (tabWrapper) {
            return tabWrapper.querySelector('.title');
        }
        return null;
    };

    // ==================== 核心功能 ====================

    /**
     * 使用混合策略提取页面内容
     * @param {number} tabId - 标签页ID
     * @returns {Promise<string>} 提取到的页面内容
     */
    const getPageContent = async (tabId) => {
        // 定义注入到页面中的函数，用于提取内容
        const extractContentFunction = function() {
            let content = '';
            try {
                // 策略1: 智能提取 - 优先获取 <main> 标签内容
                const mainElement = document.querySelector('main');
                if (mainElement && mainElement.innerText.length > 100) {
                    content = mainElement.innerText;
                } else {
                    // 策略2: 智能提取 - 获取所有 <p> 标签内容
                    const paragraphs = Array.from(document.querySelectorAll('p')).map(p => p.innerText).join('\n');
                    if (paragraphs.length > 100) {
                        content = paragraphs;
                    }
                }

                // 策略3: 回退 - 如果智能提取内容太少，则截取 body
                if (content.length < 100) {
                    content = document.body.innerText || '';
                }
            } catch (e) {
                // 在某些特殊页面（如about:blank）可能会出错
                content = document.body.innerText || '';
            }
            
            // 返回截取后的内容
            return content.substring(0, 800); // 从配置中读取长度
        };

        try {
            const results = await chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: extractContentFunction
            });
            if (results && results[0] && results[0].result) {
                return results[0].result;
            }
        } catch (e) {
            console.error(`[TidyTitle] Failed to execute script on tab ${tabId}:`, e);
            // 可能是 chrome:// 等无法注入脚本的页面
        }
        
        return ''; // 提取失败则返回空字符串
    };

    /**
     * 调用 GLM API 进行流式标题生成
     * @param {string} originalTitle - 原始标题
     * @param {string} url - 页面URL
     * @param {string} content - 页面内容
     * @param {function} onChunk - 接收到新内容块时的回调函数
     * @returns {Promise<string>} 最终生成的完整标题
     */
    const generateTitleWithStreaming = async (originalTitle, url, content, onChunk) => {
        if (!config.glm_api_key) {
            throw new Error('GLM API key not configured');
        }

        const browserLang = getBrowserLanguage();
        const languageName = getLanguageName(browserLang);

        const prompt = `
你是一个专业的标签页标题优化助手。请根据提供的信息，生成一个简洁、可读性强、美观且统一的标签页标题。

**语言要求：**
- 生成的标题必须使用 "${languageName}" 语言。

**输入信息：**
- 原始标题: "${originalTitle}"
- 页面URL: "${url}"
- 页面正文摘要: "${content.substring(0, 400)}"

**优化规则：**
1.  **简洁性**：去除不必要的词语，如 "首页"、"欢迎来到"、"官方" 等。如果是搜索引擎标签页, 标题只保留搜索词
2.  **可读性**：使用清晰、易于理解的词汇, 尽量保持简短, 用简单的词汇描述页面内容, 避免使用句子或超过两个形容词
3.  **统一性**：对于同类型网站（如GitHub、知乎），尽量保持命名风格一致。
4.  **美观性**：避免使用过多的符号或无意义的字符。
5.  **信息保留**：如果原标题包含核心信息（如文章名、项目名），应予以保留。
6.  **保守原则**：如果无法确定更好的标题，或者信息不足，可以返回原标题。

**请直接输出优化后的标题，不要包含任何解释或多余的文字。**
`;

        const response = await fetch(config.glm_api_url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.glm_api_key}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: config.glm_model,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.2, // 使用较低的温度以确保输出的稳定性和准确性
                max_tokens: 50,
                stream: true,
                thinking: {
                    "type": "disabled"
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`GLM API error: ${response.status} ${response.statusText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        let fullTitle = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop(); // 保留最后一行（可能不完整）

            for (const line of lines) {
                if (line.trim() === '') continue;
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') return fullTitle;
                    try {
                        const json = JSON.parse(data);
                        const content = json.choices[0]?.delta?.content;
                        if (content) {
                            fullTitle += content;
                            onChunk(fullTitle); // 调用回调，更新UI
                        }
                    } catch (e) {
                        console.error('[TidyTitle] Error parsing stream data:', e);
                    }
                }
            }
        }
        return fullTitle.trim();
    };

    /**
     * 处理单个被固定的标签页
     * @param {HTMLElement} tabPosition - .tab-position DOM元素
     */
    const handlePinnedTab = async (tabPosition) => {
        const tabWrapper = tabPosition.querySelector('.tab-wrapper');
        if (!tabWrapper) return;

        const dataId = tabWrapper.dataset.id;
        if (!dataId || !dataId.startsWith('tab-')) return;
        
        const tabId = parseInt(dataId.replace('tab-', ''));
        if (isNaN(tabId)) return;

        // 防止重复处理
        if (tabPosition.dataset.tidyTitleProcessed === 'true') return;
        tabPosition.dataset.tidyTitleProcessed = 'true';

        const titleElement = findTabTitleElement(tabId);
        if (!titleElement) return;

        const originalTitle = titleElement.innerText;
        console.log(`[TidyTitle] Processing pinned tab: ${originalTitle} (ID: ${tabId})`);

        try {
            // 1. 获取标签页信息
            const tab = await new Promise((resolve) => chrome.tabs.get(tabId, resolve));
            if (!tab || !tab.url) throw new Error('Could not get tab info.');
            
            const pageContent = await getPageContent(tabId);
            
            // 2. 开始流式生成标题
            const newTitle = await generateTitleWithStreaming(
                originalTitle,
                tab.url,
                pageContent,
                (streamedTitle) => {
                    // 3. 流式更新UI
                    titleElement.innerText = streamedTitle;
                }
            );

            // 4. 最终确认标题
            titleElement.innerText = newTitle || originalTitle; // 如果新标题为空，则回退
            console.log(`[TidyTitle] Renamed "${originalTitle}" to "${newTitle}"`);

        } catch (error) {
            console.error(`[TidyTitle] Failed to rename tab "${originalTitle}":`, error);
            // 5. 错误处理：恢复原标题并显示通知
            titleElement.innerText = originalTitle;
            showNotification(`重命名标签页 "${originalTitle}" 失败: ${error.message}`);
        }
    };

    // ==================== 初始化与监听 ====================

    const init = () => {
        console.log('[TidyTitle] Initializing TidyTitle module...');

        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target;
                    // 检查是否是 .tab-position 元素，并且新增了 .is-pinned 类，但不是 .is-substack
                    if (target.classList.contains('tab-position') &&
                        target.classList.contains('is-pinned') &&
                        !target.classList.contains('is-substack')) {
                        
                        // 延迟一小段时间，确保Vivaldi内部状态稳定
                        setTimeout(() => handlePinnedTab(target), 100);
                    }
                }
            }
        });

        const observeTabStrip = () => {
            const tabStrip = document.querySelector('.tab-strip');
            if (tabStrip) {
                console.log('[TidyTitle] Found tab-strip, starting observation.');
                observer.observe(tabStrip, {
                    attributes: true,
                    attributeFilter: ['class'],
                    subtree: true // 监视所有后代元素
                });
            } else {
                // 如果找不到 tab-strip，则延迟重试
                setTimeout(observeTabStrip, 1000);
            }
        };

        observeTabStrip();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
