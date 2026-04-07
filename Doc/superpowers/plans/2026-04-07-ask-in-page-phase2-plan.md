# AskInPage Phase 2 — UI 框架重构实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重构 AskInPage UI 框架，严格遵循设计规格，实现 Context Card、/命令 chip 交互、三个命令按钮、底部工具栏、响应式设计。

**Architecture:** 将内联 CSS 抽离为独立 `AskInPage.css`，DOM 结构从嵌套 `createElement` 重构为模板字符串拼接，状态管理通过命令 chip 的存在性驱动 UI 显示/隐藏。

**Tech Stack:** Vanilla JS (ES6+), CSS3, Vivaldi Extension API

---

## 文件变更概览

| 文件 | 操作 |
|------|------|
| `Vivaldi7.9Stable/CSS/AskInPage.css` | 新建 — Phase 2 所有样式 |
| `Vivaldi7.9Stable/Javascripts/AskInPage.js` | 重构 — 移除内联 CSS，重建 DOM 结构与交互逻辑 |

---

## Task 1: 创建 AskInPage.css 样式文件

**Files:**
- Create: `Vivaldi7.9Stable/CSS/AskInPage.css`

**Spec reference:** 设计 Token、圆角体系、响应式约束

- [ ] **Step 1: 创建 CSS 文件**

```css
/*
 * AskInPage Phase 2 — Styles
 * 圆角体系 + Context Card + /命令 chip + 响应式
 */

/* === Design Tokens === */
:root {
  --aip-bg: #0A0B0D;
  --aip-surface: #1C1F23;
  --aip-elevated: #2D3139;
  --aip-border: 1px solid rgba(255, 255, 255, 0.08);
  --aip-border-radius-lg: 24px;
  --aip-border-radius-md: 12px;
  --aip-border-radius-pill: 100px;
  --aip-border-radius-sm: 6px;
  --aip-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
  --aip-accent: #33B1FF;
  --aip-chip-bg: #3A3F47;
  --aip-text-primary: #FFFFFF;
  --aip-text-secondary: #8B949E;
  --aip-text-muted: #484F58;
}

/* === Root Container === */
.ask-in-page-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--aip-bg);
  color: var(--aip-text-primary);
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  font-size: 13px;
  line-height: 1.5;
  overflow: hidden;
  max-width: min(100%, 500px);  /* 响应式：竖屏适配，上限500px */
  margin: 0 auto;
}

/* === Top Bar === */
.aip-topbar {
  display: flex;
  align-items: center;
  padding: 14px 16px 10px;
  flex-shrink: 0;
}

.aip-new-chat-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--aip-text-secondary);
  cursor: pointer;
  border-radius: var(--aip-border-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s;
}
.aip-new-chat-btn:hover { color: var(--aip-text-primary); }
.aip-new-chat-btn svg { width: 18px; height: 18px; }

/* === Context Card (150×50, 固定尺寸) === */
.aip-context-card {
  display: none;  /* 默认隐藏，有内容时显示 */
  align-items: center;
  gap: 10px;
  margin: 0 16px 10px;
  padding: 9px 12px;
  width: 150px;
  height: 50px;
  box-sizing: border-box;
  background: var(--aip-elevated);
  border: var(--aip-border);
  border-radius: var(--aip-border-radius-md);
  overflow: hidden;
  flex-shrink: 0;
}

.aip-context-card.aip-visible { display: flex; }

.aip-ctx-icon {
  width: 32px;
  height: 32px;
  background: var(--aip-surface);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.aip-ctx-icon svg { width: 16px; height: 16px; color: var(--aip-text-secondary); }

.aip-ctx-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.aip-ctx-title {
  color: var(--aip-text-primary);
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.aip-ctx-url {
  color: var(--aip-text-secondary);
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 1px;
}

.aip-ctx-close {
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: var(--aip-text-secondary);
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.15s, color 0.15s;
}
.aip-context-card:hover .aip-ctx-close { opacity: 1; }
.aip-ctx-close:hover { color: var(--aip-text-primary); }
.aip-ctx-close svg { width: 13px; height: 13px; }

/* === Messages Area === */
.aip-messages {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px;
}

/* === Slash Command Buttons (三按钮) === */
.aip-slash-commands {
  display: none;
  gap: 8px;
  padding: 0 16px 10px;
  flex-wrap: wrap;
}
.aip-slash-commands.aip-visible { display: flex; }

.aip-slash-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: var(--aip-chip-bg);
  color: var(--aip-text-secondary);
  border: none;
  border-radius: var(--aip-border-radius-pill);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.aip-slash-btn:hover { color: var(--aip-text-primary); }
.aip-slash-btn svg { width: 13px; height: 13px; }

/* === Slash Command Chip (已选中命令) === */
.aip-command-chip {
  display: none;
  align-items: center;
  gap: 6px;
  padding: 4px 8px 4px 10px;
  background: var(--aip-chip-bg);
  border-radius: var(--aip-border-radius-pill);
  font-size: 12px;
  font-weight: 500;
  color: var(--aip-text-primary);
  margin: 0 16px 8px;
}
.aip-command-chip.aip-visible { display: inline-flex; }

.aip-chip-icon { width: 13px; height: 13px; display: flex; }
.aip-chip-icon svg { width: 13px; height: 13px; }
.aip-chip-label { color: var(--aip-text-primary); }
.aip-chip-close {
  width: 16px;
  height: 16px;
  border: none;
  background: transparent;
  color: var(--aip-text-secondary);
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s, color 0.15s;
}
.aip-command-chip:hover .aip-chip-close { opacity: 1; }
.aip-chip-close:hover { color: var(--aip-text-primary); }
.aip-chip-close svg { width: 10px; height: 10px; }

/* === Input Card (底部输入框容器) === */
.aip-input-card {
  margin: 0 16px 20px;
  padding: 14px;
  background: var(--aip-surface);
  border: var(--aip-border);
  border-radius: var(--aip-border-radius-lg);
  box-shadow: var(--aip-shadow);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.aip-textarea {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: var(--aip-text-primary);
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  max-height: 120px;
  font-family: inherit;
  caret-color: #FFFFFF;
  min-height: 24px;
  box-sizing: border-box;
}
.aip-textarea::placeholder { color: var(--aip-text-muted); }

/* === Bottom Toolbar === */
.aip-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.aip-toolbar-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--aip-text-secondary);
  cursor: pointer;
  border-radius: var(--aip-border-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s;
}
.aip-toolbar-btn:hover { color: var(--aip-text-primary); }
.aip-toolbar-btn svg { width: 15px; height: 15px; }

.aip-send-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: var(--aip-accent);
  color: #FFFFFF;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: filter 0.15s, transform 0.1s;
}
.aip-send-btn:hover { filter: brightness(1.1); }
.aip-send-btn:active { transform: scale(0.92); }
.aip-send-btn svg { width: 14px; height: 14px; }

/* === Scrollbar === */
.aip-messages::-webkit-scrollbar,
.ask-in-page-root ::-webkit-scrollbar { width: 5px; }
.aip-messages::-webkit-scrollbar-track,
.ask-in-page-root ::-webkit-scrollbar-track { background: transparent; }
.aip-messages::-webkit-scrollbar-thumb,
.ask-in-page-root ::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.aip-messages::-webkit-scrollbar-thumb:hover,
.ask-in-page-root ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }

/* === Selection === */
.ask-in-page-root ::selection { background: rgba(51, 177, 255, 0.3); }

/* === Focus === */
.ask-in-page-root button { outline: none; }
.ask-in-page-root textarea { outline: none; }

/* === Hide native webview === */
.panel.webpanel[data-ask-in-page] .webpanel-content { display: none !important; }
.panel.webpanel[data-ask-in-page] header.webpanel-header { display: none !important; }
.panel.webpanel[data-ask-in-page] { position: relative !important; overflow: hidden !important; }
```

- [ ] **Step 2: Commit**

```bash
git add Vivaldi7.9Stable/CSS/AskInPage.css && git commit -m "feat(askinpage): Add Phase 2 CSS with design tokens and components"
```

---

## Task 2: 重构 AskInPage.js — 基础结构和 WebPanel 注册

**Files:**
- Modify: `Vivaldi7.9Stable/Javascripts/AskInPage.js` (全量重写，移除内联 CSS，重构 DOM 结构)

**依赖:** Task 1 完成的 CSS 文件

- [ ] **Step 1: 重写 AskInPage.js 框架代码**

将以下**完整代码**写入 `Vivaldi7.9Stable/Javascripts/AskInPage.js`：

```javascript
/*
 * Ask in Page - Vivaldi WebPanel AI Assistant
 * Phase 2 UI Framework
 */

(() => {
  "use strict";

  // ---------------------------------------------------------------------------
  // Constants
  // ---------------------------------------------------------------------------
  const name = "Ask in Page";
  const webPanelId = "WEBPANEL_ASK_IN_PAGE_V2";

  // Minimal data URL — just a loading page, real UI is via createPanelCustom
  const code =
    "data:text/html," +
    encodeURIComponent(
      "<!DOCTYPE html><html><head><meta charset='utf-8'><title>" +
        name +
        "</title></head><body style='margin:0;background:#0F1115;height:100vh;display:flex;align-items:center;justify-content:center;color:#8B949E;font-family:system-ui;font-size:14px'>Loading...</body></html>"
    );

  // ---------------------------------------------------------------------------
  // Icons
  // ---------------------------------------------------------------------------
  const icons = {
    newChat: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
    brandIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
    close: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>`,
    analyze: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
    explain: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>`,
    summarize: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
    attach: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    send: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M2 21L23 12L2 3V10L17 12L2 14V21Z"/></svg>`,
    page: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  };

  const lightningSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`;
  icons.dataURLs = {
    ai: "data:image/svg+xml, " + encodeURIComponent(lightningSvg),
  };

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  let currentTabId = null;
  let selectedCommand = null;  // null | "Analyze" | "Explain" | "Summarize"

  // ---------------------------------------------------------------------------
  // DOM Elements
  // ---------------------------------------------------------------------------
  let panelRoot = null;
  let messagesEl = null;
  let contextCard = null;
  let ctxTitle = null;
  let ctxUrl = null;
  let slashCommandsEl = null;   // 三按钮容器
  let commandChipEl = null;       // 已选中 chip
  let chipCloseBtn = null;
  let inputTextarea = null;
  let sendBtn = null;

  // ---------------------------------------------------------------------------
  // Command definitions
  // ---------------------------------------------------------------------------
  const commands = {
    Analyze: {
      label: "Analyze",
      icon: icons.analyze,
      prompt: "Analyze this content, looking for bias, patterns, trends, connections. Consider the author, the source. Research to fact check, if it seems beneficial. Research the broader setting. If no content has been provided, ask about the relevant subject matter.",
    },
    Explain: {
      label: "Explain",
      icon: icons.explain,
      prompt: "Please explain the concept, topic, or content in clear, accessible language. Break down complex ideas into understandable parts, provide relevant examples, and structure your explanation logically from basic to more advanced concepts. Be relatively concise. If nothing has been provided, ask what they'd like you to explain.",
    },
    Summarize: {
      label: "Summarize",
      icon: icons.summarize,
      prompt: "Please provide a clear, concise summary of the attached content. Begin with a simple answer distilling the main point. Then cover 3-4 main ideas. Be concise. One sentence for each, max two. If there is no attached content, ask the user what might be helpful to summarize.",
    },
  };

  // ---------------------------------------------------------------------------
  // createPanelCustom — 构建完整 UI
  // ---------------------------------------------------------------------------
  function createPanelCustom(panel) {
    if (panel.dataset.askInPage) return;
    panel.dataset.askInPage = "true";

    if (chrome.extension.inIncognitoContext) return;

    // ---------- Root ----------
    panelRoot = document.createElement("div");
    panelRoot.className = "ask-in-page-root";

    // ---------- Top Bar ----------
    const topBar = document.createElement("div");
    topBar.className = "aip-topbar";

    const newChatBtn = document.createElement("button");
    newChatBtn.className = "aip-new-chat-btn";
    newChatBtn.title = "新建对话";
    newChatBtn.innerHTML = icons.newChat;
    newChatBtn.addEventListener("click", resetConversation);
    topBar.append(newChatBtn);

    // ---------- Messages Area ----------
    messagesEl = document.createElement("div");
    messagesEl.className = "aip-messages";

    const emptyState = document.createElement("div");
    emptyState.style.flex = "1";
    emptyState.style.height = "100%";
    messagesEl.append(emptyState);

    // ---------- Slash Commands (三按钮，默认显示) ----------
    slashCommandsEl = document.createElement("div");
    slashCommandsEl.className = "aip-slash-commands aip-visible";

    Object.entries(commands).forEach(([cmdName, cmd]) => {
      const btn = document.createElement("button");
      btn.className = "aip-slash-btn";
      btn.dataset.command = cmdName;
      btn.innerHTML = cmd.icon + cmd.label;
      btn.addEventListener("click", () => selectCommand(cmdName));
      slashCommandsEl.append(btn);
    });

    // ---------- Command Chip (选中后显示) ----------
    commandChipEl = document.createElement("div");
    commandChipEl.className = "aip-command-chip";
    commandChipEl.addEventListener("click", (e) => {
      // 点击 chip 本身聚焦 textarea
      if (e.target === commandChipEl || e.target.classList.contains("aip-chip-label")) {
        inputTextarea.focus();
      }
    });

    chipCloseBtn = document.createElement("button");
    chipCloseBtn.className = "aip-chip-close";
    chipCloseBtn.innerHTML = icons.close;
    chipCloseBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deselectCommand();
    });
    commandChipEl.append(chipCloseBtn);

    // ---------- Input Card ----------
    const inputCard = document.createElement("div");
    inputCard.className = "aip-input-card";

    inputTextarea = document.createElement("textarea");
    inputTextarea.className = "aip-textarea";
    inputTextarea.rows = "1";
    inputTextarea.placeholder = "Ask a question about this page...";
    inputTextarea.addEventListener("input", onTextareaInput);
    inputTextarea.addEventListener("keydown", onTextareaKeydown);

    // ---------- Bottom Toolbar ----------
    const toolbar = document.createElement("div");
    toolbar.className = "aip-toolbar";

    const attachBtn = document.createElement("button");
    attachBtn.className = "aip-toolbar-btn";
    attachBtn.title = "Attach";
    attachBtn.innerHTML = icons.attach;
    // TODO: Phase 3 — @ 命令下拉菜单

    sendBtn = document.createElement("button");
    sendBtn.className = "aip-send-btn";
    sendBtn.title = "Send";
    sendBtn.innerHTML = icons.send;
    sendBtn.addEventListener("click", handleSend);

    toolbar.append(attachBtn, sendBtn);
    inputCard.append(inputTextarea, toolbar);

    // ---------- Assemble ----------
    panelRoot.append(topBar);
    panelRoot.append(messagesEl);
    panelRoot.append(slashCommandsEl);
    panelRoot.append(commandChipEl);
    panelRoot.append(inputCard);

    panel.append(panelRoot);
  }

  // ---------------------------------------------------------------------------
  // Command State Management
  // ---------------------------------------------------------------------------
  function selectCommand(cmdName) {
    selectedCommand = cmdName;
    const cmd = commands[cmdName];
    if (!cmd) return;

    // 更新 chip 内容
    commandChipEl.innerHTML = "";
    const chipIcon = document.createElement("span");
    chipIcon.className = "aip-chip-icon";
    chipIcon.innerHTML = cmd.icon;
    const chipLabel = document.createElement("span");
    chipLabel.className = "aip-chip-label";
    chipLabel.textContent = "/" + cmd.label;
    chipCloseBtn.innerHTML = icons.close;
    chipCloseBtn.className = "aip-chip-close";
    commandChipEl.append(chipIcon, chipLabel, chipCloseBtn);

    // 切换显示
    slashCommandsEl.classList.remove("aip-visible");
    commandChipEl.classList.add("aip-visible");
    inputTextarea.focus();
  }

  function deselectCommand() {
    selectedCommand = null;
    slashCommandsEl.classList.add("aip-visible");
    commandChipEl.classList.remove("aip-visible");
    inputTextarea.focus();
  }

  // ---------------------------------------------------------------------------
  // Textarea Input Handler
  // ---------------------------------------------------------------------------
  function onTextareaInput(e) {
    autoResizeTextarea(e.target);
  }

  function autoResizeTextarea(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  }

  function onTextareaKeydown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      return;
    }

    // Backspace 在 chip 右侧且无输入时：聚焦或删除 chip
    if (e.key === "Backspace" && selectedCommand) {
      const val = inputTextarea.value;
      const sel = inputTextarea.selectionStart;
      // 当光标在最前面且无输入时
      if (val === "" || (sel === 0 && val.length === 0)) {
        e.preventDefault();
        deselectCommand();
        return;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Conversation
  // ---------------------------------------------------------------------------
  function resetConversation() {
    selectedCommand = null;
    slashCommandsEl.classList.add("aip-visible");
    commandChipEl.classList.remove("aip-visible");
    if (inputTextarea) {
      inputTextarea.value = "";
      inputTextarea.style.height = "auto";
    }
    if (messagesEl) {
      messagesEl.innerHTML = "";
      const emptyState = document.createElement("div");
      emptyState.style.flex = "1";
      emptyState.style.height = "100%";
      messagesEl.append(emptyState);
    }
  }

  function handleSend() {
    const text = inputTextarea.value.trim();
    if (!text && !selectedCommand) return;
    // TODO: Phase 5 — API call
    console.log("[AskInPage] Send:", { command: selectedCommand, text });
    inputTextarea.value = "";
    inputTextarea.style.height = "auto";
    if (selectedCommand) {
      deselectCommand();
    }
  }

  // ---------------------------------------------------------------------------
  // Context Card
  // ---------------------------------------------------------------------------
  function showContextCard(tab) {
    if (!contextCard || !ctxTitle || !ctxUrl) return;
    ctxTitle.textContent = tab.title || "-";
    ctxUrl.textContent = tab.url ? (() {
      try { return new URL(tab.url).hostname; } catch { return "-"; }
    })() : "-";
    contextCard.classList.add("aip-visible");
  }

  function hideContextCard() {
    if (contextCard) contextCard.classList.remove("aip-visible");
  }

  // ---------------------------------------------------------------------------
  // updateIconAndTitle
  // ---------------------------------------------------------------------------
  function updateIconAndTitle() {
    const webviewButtons = Array.from(
      document.querySelectorAll(
        '.toolbar > .button-toolbar > .ToolbarButton-Button[data-name*="' +
          webPanelId +
          '"]'
      )
    );

    const reactPropsKey = Object.keys(document.body).find((k) =>
      k.startsWith("__reactProps")
    );
    const reactProps = reactPropsKey ? document.body[reactPropsKey] : null;
    const webPanelStack =
      reactProps?.children?.filter((wp) => wp && wp.key) ?? [];
    const webPanelIndex =
      webPanelStack.findIndex((wp) => wp.key === webPanelId) + 1;
    const panel = document.querySelector(
      ".panel-group .webpanel-stack .panel.webpanel:nth-child(" +
        webPanelIndex +
        ")"
    );

    if (panel) {
      if (!panel.querySelector(".ask-in-page-root")) {
        createPanelCustom(panel);
      }
      // 注入 Context Card DOM（需要等 panelRoot 存在）
      if (panelRoot && !contextCard) {
        injectContextCard();
        // 默认显示当前 tab context
        if (currentTabId) {
          chrome.tabs.get(currentTabId, (tab) => {
            if (tab) showContextCard(tab);
          });
        }
      }
    }

    webviewButtons.forEach((wvb) => {
      if (!chrome.extension.inIncognitoContext) {
        wvb.dataset.askInPage = "true";
      }
    });
  }

  // ---------------------------------------------------------------------------
  // injectContextCard — 将 Context Card 注入到 panelRoot
  // ---------------------------------------------------------------------------
  function injectContextCard() {
    if (!panelRoot || contextCard) return;

    contextCard = document.createElement("div");
    contextCard.className = "aip-context-card";

    const ctxIcon = document.createElement("div");
    ctxIcon.className = "aip-ctx-icon";
    ctxIcon.innerHTML = icons.brandIcon;

    const ctxInfo = document.createElement("div");
    ctxInfo.className = "aip-ctx-info";
    ctxTitle = document.createElement("div");
    ctxTitle.className = "aip-ctx-title";
    ctxTitle.textContent = "-";
    ctxUrl = document.createElement("div");
    ctxUrl.className = "aip-ctx-url";
    ctxUrl.textContent = "-";
    ctxInfo.append(ctxTitle, ctxUrl);

    const ctxClose = document.createElement("button");
    ctxClose.className = "aip-ctx-close";
    ctxClose.innerHTML = icons.close;
    ctxClose.addEventListener("click", () => {
      hideContextCard();
      panelRoot.dispatchEvent(new CustomEvent("context-closed", { bubbles: true }));
    });

    contextCard.append(ctxIcon, ctxInfo, ctxClose);

    // 插入到 messagesEl 之前
    panelRoot.insertBefore(contextCard, messagesEl);
  }

  // ---------------------------------------------------------------------------
  // WebPanel Registration
  // ---------------------------------------------------------------------------
  function createWebPanel() {
    vivaldi.prefs.get("vivaldi.panels.web.elements", (elements) => {
      let element = elements.find((e) => e.id === webPanelId);
      if (!element) {
        element = {
          activeUrl: code,
          faviconUrl: icons.dataURLs.ai,
          faviconUrlValid: true,
          id: webPanelId,
          mobileMode: true,
          origin: "user",
          resizable: false,
          title: name,
          url: code,
          width: -1,
          zoom: 1,
        };
        elements.unshift(element);
        vivaldi.prefs.set({ path: "vivaldi.panels.web.elements", value: elements });
      }

      Promise.all(["vivaldi.toolbars.panel"].map((path) => vivaldi.prefs.get(path))).then(([panels]) => {
        const hasThis = panels.some((p) => p === webPanelId);
        if (!hasThis) {
          const panelIndex = panels.findIndex((p) => p.startsWith("WEBPANEL_"));
          panels.splice(panelIndex >= 0 ? panelIndex : panels.length, 0, webPanelId);
          vivaldi.prefs.set({ path: "vivaldi.toolbars.panel", value: panels });
        }
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------------------
  function waitForBrowser(callback) {
    let id = setInterval(() => {
      if (document.getElementById("browser")) {
        clearInterval(id);
        callback();
      }
    }, 300);
  }

  waitForBrowser(() => {
    const webviewButtons = Array.from(
      document.querySelectorAll(
        '.toolbar > .button-toolbar > .ToolbarButton-Button[data-name*="' +
          webPanelId +
          '"]'
      )
    );
    if (webviewButtons.length) {
      updateIconAndTitle();
    } else {
      createWebPanel();
    }

    // 监听 panel 显示
    const observer = new MutationObserver(() => {
      updateIconAndTitle();
    });
    observer.observe(document.getElementById("browser"), { childList: true, subtree: true });
  });

  // 监听当前 tab 变化，显示 context card
  chrome.tabs.onActivated.addListener((activeInfo) => {
    currentTabId = activeInfo.tabId;
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      if (tab && contextCard) {
        showContextCard(tab);
      }
    });
  });
})();
```

- [ ] **Step 2: 更新 window.html 引入 CSS 文件**

在 `Vivaldi7.9Stable/Javascripts/window.html` 中，在 AskInPage.js 之前添加 CSS 引入：

```html
<link rel="stylesheet" href="../CSS/AskInPage.css">
<script src="AskInPage.js"></script>
```

- [ ] **Step 3: Commit**

```bash
git add Vivaldi7.9Stable/CSS/AskInPage.css Vivaldi7.9Stable/Javascripts/AskInPage.js Vivaldi7.9Stable/Javascripts/window.html && git commit -m "refactor(askinpage): Phase 2 UI framework - full DOM restructure"
```

---

## Task 3: 验证与调整

**Files:**
- Modify: `Vivaldi7.9Stable/CSS/AskInPage.css`
- Modify: `Vivaldi7.9Stable/Javascripts/AskInPage.js`

- [ ] **Step 1: 启动 Vivaldi 测试，打开 Ask in Page 面板，检查：**
  1. Context Card 是否 150×50 固定尺寸，溢出截断
  2. 三个 / 命令按钮是否正确显示
  3. 点击命令后 chip 是否出现、三个按钮是否隐藏
  4. Hover chip 右侧 × 是否显示
  5. 点击 × 或按 Backspace 删除 chip 后三按钮是否重现
  6. 底部 + 在左、蓝色圆形提交按钮在右
  7. 圆角是否一致无杂糅
  8. 响应式：拉宽到接近正方时是否正常

- [ ] **Step 2: 根据测试结果修复任何布局/交互问题**

- [ ] **Step 3: Commit 修复**

```bash
git add -A && git commit -m "fix(askinpage): Phase 2 UI adjustments after testing"
```

---

## 验收标准检查清单

- [ ] 顶部工具栏仅显示新建对话按钮
- [ ] Context Card 150×50，打开即填充当前 tab
- [ ] 三个 / 命令按钮在无选中命令时显示
- [ ] 选中命令后 chip 出现、三个按钮隐藏
- [ ] Backspace 在 chip 旁可聚焦、可删除
- [ ] Hover chip 显示 ×，点击删除 chip，三个按钮重现
- [ ] 底部工具栏 + 在左，蓝色圆形提交按钮在右
- [ ] 所有元素圆角一致，无杂糅不对齐
- [ ] 响应式适配竖屏，可扩展至 1:1
