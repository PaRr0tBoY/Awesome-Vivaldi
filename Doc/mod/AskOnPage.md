English | [简体中文](modzh/AskOnPage.md)

---

# AskOnPage Design and Implementation Analysis

Ctrl+F reimagined — a universal page query bar that routes between native text find and AI-powered page understanding.

> **File**: `AskOnPage.js` (~900 lines) + `AskOnPage.css` (~180 lines)
> **Version**: 2026.7.19
> **Author**: Ryan (Acid)

---

## 1. Product Model

```
Ctrl+F → Universal Query Bar
              │
     classifyIntent(query)
              │
      ┌───────┴───────┐
      │               │
   "find"           "ask"
   keyword          natural language
      │               │
 window.find()    AI pipeline (streaming)
  highlight +      markdown answer
  match counter    + inline citations
      │               │
  "3/12"          click → scroll
                  to page source
```

Key insight: Ctrl+F is the browser's highest-frequency information-seeking action. Upgrading it from text matching to page understanding creates the most natural AI entry point.

---

## 2. Dependencies

### 2.1 Vivaldi / Chrome APIs

| API | Purpose |
|-----|---------|
| `chrome.scripting.executeScript` | Page content extraction + native `window.find()` |
| `chrome.tabs.query` | Get active tab for targeting |
| `vivaldi.tabsPrivate.onKeyboardShortcut` | Intercept Ctrl+F at browser level |
| `navigator.storage.getDirectory()` (OPFS) | Shared AI config from `.askonpage/config.json` |

### 2.2 Inter-Mod Dependencies

| Mod | Relationship |
|-----|-------------|
| `ModConfig.js` | Shared AI config (`askOnPage` key). Overridable per-mod. |
| `VividPeek.js` | Ctrl+F interception coexistence — does NOT intercept when Peek is active |

---

## 3. Architecture

### 3.1 Intent Router

```
classifyIntent(query):
  ├─ Has question marker? (?/？/什么/why/how/…) → ask
  ├─ ≤ 4 words / short CJK → find
  ├─ Long text (>20 chars) → try-find (exact match first, fallback to AI)
  └─ Default → ask

Enter:
  ├─ Shift+Enter → force AI regardless
  ├─ find → doFind() → 0 matches? → auto doAsk()
  └─ ask → doAsk()
```

### 3.2 Native Find Engine

- Injects `window.find()` via `chrome.scripting.executeScript`
- State machine persists across calls via `window.__aifb`
- Total match count via `TreeWalker` scanning visible text nodes
- Arrow key navigation: ↑ previous match, ↓ next match
- Debounced real-time highlighting on input (150ms)

### 3.3 AI Pipeline

```
extractPage()                          // Content script injection
  ↓                                    // Candidate scoring (article/main)
askAI(query, page)
  ↓
messages: [system + history turns + user]
  ↓
fetch() SSE streaming                  // OpenRouter OpenAI-compatible
  ↓
streamSSE() → refreshTurn()            // Incremental Markdown rendering
  ↓
detectCitations()                      // Post-process: fuzzy page matching
```

**Multi-turn conversation:** All previous Q&A pairs are sent as `user`/`assistant` messages. Tab-scoped — persists across find bar open/close, cleared on page navigation.

### 3.4 Citation System

Three-layer detection:

| Layer | Method | Trigger |
|-------|--------|---------|
| Markdown parsing | `> "text"` / `"text"` / `「text」` → `<span class="ai-find-cite">` | During `mdToHtml()` |
| Post-process detection | Walk text nodes, fuzzy-match against page content | After AI streaming completes |
| Click-to-scroll | `window.find()` with progressive substring trimming (60%+ match threshold) | User clicks citation |

---

## 4. AI Configuration

```javascript
AI_CONFIG = {
  model: "meta-llama/llama-3.3-70b-instruct:free",     // Primary
  fallbackModel: "google/gemma-4-26b-a4b-it:free",      // Empty-response retry
  timeout: 30000, temperature: 0.3, maxTokens: 2048,
}
```

Shared config key: `askOnPage` (overridable in ModConfig settings UI).

System prompt enforces:
- Answer only from page content
- Citations in page's original language (word-for-word, never translated)
- Weave citations within paragraphs (not grouped at end)

---

## 5. UI Design

### 5.1 DOM Structure

```
#ai-find-bar (top-right, 360px)
  .ai-find-shell        ← input row (pill → flat-bottom when answer visible)
    #ai-find-input      ← "Find or ask…"
    .ai-find-meta        ← "3/12" match counter
  #ai-find-answer        ← seamless extension (max-height transition)
    .ai-find-inner       ← border/shadow container
      .ai-find-turn      ← per-turn Q+A
      .ai-find-pager     ← "← 2/3 →"
```

### 5.2 Key Interactions

| Action | Effect |
|--------|--------|
| `Ctrl+F` | Toggle open/close |
| Type keyword | Real-time `window.find()` highlighting |
| Type question + `Enter` | AI query |
| `Shift+Enter` | Force AI (bypass intent router) |
| `Escape` | Close / cancel streaming |
| `↑` / `↓` | Find mode: prev/next match. Multi-turn: flip pages |
| Click citation | `window.find()` → smooth scroll to source |

---

## 6. Design Decisions

1. **Replace, don't extend**: Native `.find-in-page-wrapper` hidden via CSS. Custom bar handles everything.
2. **Find-first**: Every input attempts page match before AI — pasting text from the page navigates, not queries.
3. **Seamless panel**: Input and answer share the same visual container — no separate popup or modal.
4. **Tab-scoped memory**: Conversations persist across bar open/close but clear on navigation.
5. **Dual-model fallback**: Empty/garbage response auto-retries with fallback model.
