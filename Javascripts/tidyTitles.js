// Vivaldi AI Title 
(function() {
    'use strict';

  // ========== CONFIG ==========
    const CONFIG = {
    
    // === GLM(free) ===
    BASE_URL: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    API_TOKEN: '',
    MODEL: 'glm-4.5-flash',

    // === Deepseek ===
    // BASE_URL: 'https://api.deepseek.com/v1/chat/completions',
    // API_TOKEN: '<token>',
    // MODEL: 'deepseek-chat',
    };

  // 存储已处理过的标签页 ID（避免重复处理）
    const processedTabs = new Set();

  // ========== 工具函数 ==========


    // 获取浏览器界面语言
    const getBrowserLanguage = () => {
        return chrome.i18n.getUILanguage() || navigator.language || 'zh-CN';
    };
  // 将语言代码转换为自然语言名称
    const getLanguageName = (langCode) => {
        const langMap = {
            'zh': '中文',
            'zh-CN': '简体中文',
            'zh-TW': '繁体中文',
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

    /**
   * 调用 GLM API 生成优化后的标题
   */
    async function generateOptimizedTitle(originalTitle, url, content) {
    // const languageName = getBrowserLanguage();
        // 获取浏览器界面语言
    const browserLang = getBrowserLanguage();
    const languageName = getLanguageName(browserLang);
    
    const prompt = `
你是一个专业的标签页标题优化助手。请根据提供的信息，生成一个简洁、统一、美观且高可读性的标签页标题。

**输入信息：**

* 原始标题: "${originalTitle}"
* 页面URL: "${url}"
* 页面正文摘要: "${content.substring(0, 400)}"
* 用户界面语言: "${languageName}"

**优化规则：**

1. **简洁性**：去除无意义或冗余词（如“首页”“官方”“欢迎来到”等）。

2. **可读性**：标题应短小直观，避免复杂句和多重修饰。

3. **统一性**：同类网站保持一致命名风格（如 GitHub、知乎、Medium、Bilibili）。

4. **美观性**：避免重复标点、符号或装饰性字符。

5. **信息保留**：优先保留关键信息（文章名、项目名、主题名）。

6. **保守原则**：若无可靠替代方案，返回原标题。

7. **标题提取逻辑：**

   * 若正文摘要中存在明显标题（如 H1、首句完整标题），优先使用。
   * 若正文摘要缺乏有效信息，则基于 URL 路径提取关键词（如 "/blog/css-performance-tips" → “css 性能优化”）。
   * URL 提取处理：

     * 全部小写化
     * 去除连字符、下划线、数字
     * 分词并自然化组合成短语
     * 英文标题自动首字母大写
   * 若 URL 关键词提取结果为空或无意义，则回退至 **原始标题** 提取核心短语。

     * 删除站点名、冗余副标题（如“ - 知乎”“ | GitHub”等）
     * 保留主体部分作为优化基础。

8. **网站识别逻辑：**

   * 允许根据 URL 自动识别网站类型（如 github.com → [GitHub]，zhihu.com → 知乎）。
   * 若域名不在已知列表中，则取域名首段并首字母大写作为网页标题（如 example.com → Example）。

9. **多语言命名逻辑：**

   * 若 **${languageName}** = 中文 → 输出中文标题，如 GitHub | CSS性能优化
   * 若 **${languageName}** = English → 输出英文标题，如 GitHub | CSS Optimization
   * 保持语言一致性，不混用中英文

10. **输出格式：**

网页标题|优化后的标签页标题

* “网页标题”为网站短标题或识别出的站点名；
* “优化后的标签页标题” ≤ 6个汉字或12个英文字母

11. **输出要求：**
    仅输出最终标题，不包含任何解释、标点或附加说明。

---

**示例输出：**

* 输入：

  * 原始标题: "Welcome to Google Developers - Home"
  * URL: "[https://developers.google.com/web/fundamentals/performance](https://developers.google.com/web/fundamentals/performance)"
  * 摘要: "This guide covers web performance optimization best practices..."
  * languageName: 中文
  * 输出 → Google | 网站性能优化

* 输入：

  * 原始标题: "GitHub - vercel/next.js: The React Framework"
  * URL: "[https://github.com/vercel/next.js](https://github.com/vercel/next.js)"
  * 摘要: "Next.js is a React framework for production..."
  * languageName: English
  * 输出 → GitHub | Next.js Framework

* 输入：

  * 原始标题: "ZHIHU - 如何高效学习编程？"
  * URL: "[https://www.zhihu.com/question/123456](https://www.zhihu.com/question/123456)"
  * 摘要: "本文探讨了快速学习编程的技巧与心态..."
  * languageName: 中文
  * 输出 → 知乎 | 编程学习

* 输入：

  * 原始标题: "My Blog - Post 2024/10/20/why-css-is-hard"
  * URL: "[https://example.com/2024/10/20/why-css-is-hard](https://example.com/2024/10/20/why-css-is-hard)"
  * 摘要: ""
  * languageName: English
  * 输出 → Example | Why CSS Is Hard

* 输入：

  * 原始标题: "Untitled | Example Site"
  * URL: "[https://example.com/home](https://example.com/home)"
  * 摘要: ""
  * languageName: English
  * 输出 → Example | home
`;

    // 输出完整提示词到控制台供调试
    // console.log('=== 发送给 AI 的完整提示词 ===');
    // console.log(prompt);
    // console.log('=== 提示词结束 ===');

    const requestBody = {
      model: CONFIG.MODEL,
      messages: [
        { role: "system", content: "你是一个专业的标签页标题优化助手。" },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 100,
      stream: false,
      thinking: { "type": "disabled" }
    };

    try {
      const response = await fetch(CONFIG.BASE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CONFIG.API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const optimizedTitle = data.choices?.[0]?.message?.content?.trim();
      
      if (optimizedTitle) {
        return optimizedTitle;
      } else {
        console.warn('AI 返回空标题，保持原标题');
        return originalTitle;
      }
    } catch (error) {
      console.error('GLM API 调用失败:', error);
      return originalTitle; // 失败时返回原标题
    }
  }

  /**
   * 获取页面正文内容摘要
   */
  async function getPageContent(tabId) {
    return new Promise((resolve) => {
      try {
        chrome.scripting.executeScript(tabId, {
          code: `
            (function() {
              const bodyText = document.body?.innerText || '';
              return bodyText.substring(0, 400);
            })();
          `
        }, (results) => {
          if (chrome.runtime.lastError) {
            console.warn('无法获取页面内容:', chrome.runtime.lastError);
            resolve('');
          } else {
            resolve(results?.[0] || '');
          }
        });
      } catch (error) {
        console.error('获取页面内容时出错:', error);
        resolve('');
      }
    });
  }

  /**
   * 更新标签页的 fixedTitle
   */
  function updateTabTitle(tabId, newTitle) {
    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError) {
        console.error('获取标签页失败:', chrome.runtime.lastError);
        return;
      }

      let vivExtData = {};
      try {
        vivExtData = tab.vivExtData ? JSON.parse(tab.vivExtData) : {};
      } catch (e) {
        console.error('JSON 解析错误:', e);
      }

      // 设置 fixedTitle
      vivExtData.fixedTitle = newTitle;

      chrome.tabs.update(tabId, {
        vivExtData: JSON.stringify(vivExtData)
      }, () => {
        if (chrome.runtime.lastError) {
          console.error('更新标签页失败:', chrome.runtime.lastError);
        } else {
          console.log(`✓ 标签页 ${tabId} 标题已优化为: ${newTitle}`);
          processedTabs.add(tabId);
        }
      });
    });
  }

  /**
   * 处理单个标签页
   */
  async function processSingleTab(tabElement) {
    const tabIdStr = tabElement.getAttribute('data-id');
    if (!tabIdStr) {
      console.warn('标签页元素缺少 data-id 属性，跳过');
      return;
    }

    const tabId = parseInt(tabIdStr.replace('tab-', ''));
    
    // 跳过已处理的标签页
    if (processedTabs.has(tabId)) {
      return;
    }

    console.log(`检测到新固定的标签页 ID: ${tabId}`);

    try {
      // 获取标签页信息
      chrome.tabs.get(tabId, async (tab) => {
        if (chrome.runtime.lastError) {
          console.error('获取标签页失败:', chrome.runtime.lastError);
          return;
        }

        // 检查是否已设置 fixedTitle
        let vivExtData = {};
        try {
          vivExtData = tab.vivExtData ? JSON.parse(tab.vivExtData) : {};
        } catch (e) {
          console.error('JSON 解析错误:', e);
        }

        // 如果已有 fixedTitle，跳过
        if (vivExtData.fixedTitle) {
          console.log(`标签页 ${tabId} 已有自定义标题，跳过`);
          processedTabs.add(tabId);
          return;
        }

        // 获取页面内容
        const content = await getPageContent(tabId);
        
        // 调用 AI 生成优化标题
        console.log(`正在为标签页 ${tabId} 生成优化标题...`);
        const optimizedTitle = await generateOptimizedTitle(
          tab.title || '',
          tab.url || '',
          content
        );

        // 更新标签页标题
        updateTabTitle(tabId, optimizedTitle);
      });
    } catch (error) {
      console.error(`处理标签页 ${tabId} 时出错:`, error);
    }
  }

  /**
   * 检查并处理固定的标签页（仅用于初始化）
   */
  async function checkPinnedTabs() {
    // 排除标签栈：只选择固定标签页，但不包含 .is-substack 类
    const pinnedTabElements = document.querySelectorAll('.tab-position.is-pinned:not(.is-substack) .tab-wrapper');
    
    console.log(`初始化：检测到 ${pinnedTabElements.length} 个固定标签页`);
    
    for (const tabElement of pinnedTabElements) {
      await processSingleTab(tabElement);
    }
  }

  /**
   * 监听标签页被固定事件
   */
  function observePinnedTabs() {
    const tabStrip = document.querySelector('.tab-strip');
    if (!tabStrip) {
      console.warn('未找到 .tab-strip 元素，稍后重试');
      setTimeout(observePinnedTabs, 1000);
      return;
    }

    // 使用 MutationObserver 监听 class 属性变化
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        // 只处理 class 属性变化
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target;
          
          // 检查是否是 .tab-position 元素
          if (!target.classList?.contains('tab-position')) {
            continue;
          }
          
          // 检查是否是标签栈（排除）
          if (target.classList.contains('is-substack')) {
            continue;
          }
          
          // 检查是否刚刚获得 is-pinned 类
          const isPinnedNow = target.classList.contains('is-pinned');
          const wasPinnedBefore = mutation.oldValue?.includes('is-pinned') || false;
          
          // 只在从未固定变为固定时触发
          if (isPinnedNow && !wasPinnedBefore) {
            console.log('🔖 检测到标签页被固定');
            const tabWrapper = target.querySelector('.tab-wrapper');
            if (tabWrapper) {
              processSingleTab(tabWrapper);
            }
          }
        }
      }
    });

    // 监听配置：只监听属性变化，并记录旧值
    observer.observe(tabStrip, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
      attributeOldValue: true  // 关键：记录旧的 class 值
    });

    console.log('✓ AI 标签页标题优化模组已启动');
    
    // 初始检查已固定的标签页
    checkPinnedTabs();
  }

  // ========== 启动模组 ==========
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observePinnedTabs);
  } else {
    observePinnedTabs();
  }

})();

// ✓ AI 标签页标题优化模组已启动
// TidyTitles.js:358 初始化：检测到 5 个固定标签页
// TidyTitles.js:307 检测到新固定的标签页 ID: 1175647132
// TidyTitles.js:307 检测到新固定的标签页 ID: 1175647133
// TidyTitles.js:307 检测到新固定的标签页 ID: 1175647170
// TidyTitles.js:307 检测到新固定的标签页 ID: 1175647171
// TidyTitles.js:307 检测到新固定的标签页 ID: 1175647283
// TidyTitles.js:251 获取页面内容时出错: TypeError: Error in invocation of scripting.executeScript(scripting.ScriptInjection injection, optional function callback): No matching signature.
//     at TidyTitles.js:235:26
//     at new Promise (<anonymous>)
//     at getPageContent (TidyTitles.js:233:12)
//     at TidyTitles.js:333:31
// （匿名） @ TidyTitles.js:251
// TidyTitles.js:336 正在为标签页 1175647132 生成优化标题...
// TidyTitles.js:251 获取页面内容时出错: TypeError: Error in invocation of scripting.executeScript(scripting.ScriptInjection injection, optional function callback): No matching signature.
//     at TidyTitles.js:235:26
//     at new Promise (<anonymous>)
//     at getPageContent (TidyTitles.js:233:12)
//     at TidyTitles.js:333:31
// （匿名） @ TidyTitles.js:251
// TidyTitles.js:336 正在为标签页 1175647133 生成优化标题...
// TidyTitles.js:251 获取页面内容时出错: TypeError: Error in invocation of scripting.executeScript(scripting.ScriptInjection injection, optional function callback): No matching signature.
//     at TidyTitles.js:235:26
//     at new Promise (<anonymous>)
//     at getPageContent (TidyTitles.js:233:12)
//     at TidyTitles.js:333:31
// （匿名） @ TidyTitles.js:251
// TidyTitles.js:336 正在为标签页 1175647170 生成优化标题...
// TidyTitles.js:251 获取页面内容时出错: TypeError: Error in invocation of scripting.executeScript(scripting.ScriptInjection injection, optional function callback): No matching signature.
//     at TidyTitles.js:235:26
//     at new Promise (<anonymous>)
//     at getPageContent (TidyTitles.js:233:12)
//     at TidyTitles.js:333:31
// （匿名） @ TidyTitles.js:251
// TidyTitles.js:336 正在为标签页 1175647171 生成优化标题...
// TidyTitles.js:251 获取页面内容时出错: TypeError: Error in invocation of scripting.executeScript(scripting.ScriptInjection injection, optional function callback): No matching signature.
//     at TidyTitles.js:235:26
//     at new Promise (<anonymous>)
//     at getPageContent (TidyTitles.js:233:12)
//     at TidyTitles.js:333:31
// （匿名） @ TidyTitles.js:251
// TidyTitles.js:336 正在为标签页 1175647283 生成优化标题...
// 5TidyTitles.js:76 Uncaught (in promise) ReferenceError: getBrowserLanguage is not defined
//     at generateOptimizedTitle (TidyTitles.js:76:26)
//     at TidyTitles.js:337:38
// monochrome-icons.js:26 hue-change: -109.60°
// window.html:1 This console bypasses security protections and can let attackers steal your passwords and personal information. Do NOT enter or paste code that you do not understand.
// 4window.html:1 Uncaught (in promise) Error: Cannot access contents of url "devtools://devtools/bundled/devtools_app.html?remoteBase=https://chrome-devtools-frontend.appspot.com/serve_file/@37329e0d7477a24a033f308f112b01e646708940/&targetType=tab&panel=elements". Extension manifest must request permission to access this host.
