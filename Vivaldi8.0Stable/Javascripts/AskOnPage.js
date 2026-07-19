// ==UserScript==
// @name         AskOnPage
// @description  Ctrl+F to ask the page anything. AI-powered page search with inline citations.
// @version      2026.7.19
// @author       Ryan (Acid)
// @website      https://github.com/PaRr0tBoY/Awesome-Vivaldi
// ==/UserScript==

(function () {
  "use strict";

  // ==================== AI Configuration ====================
  const AI_CONFIG = {
    apiEndpoint: "https://openrouter.ai/api/v1/chat/completions",
    apiKey: "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",
    model: "meta-llama/llama-3.3-70b-instruct:free",
    fallbackModel: "google/gemma-4-26b-a4b-it:free",
    timeout: 30000,
    temperature: 0.3,
    maxTokens: 2048,
  };
  const MOD_AI_CONFIG_KEY = "askOnPage";
  const MOD_AI_CONFIG_FILE = "config.json";
  const MOD_AI_CONFIG_DIR = ".askonpage";

  // ==================== Constants ====================
  const BAR_ID = "ai-find-bar";
  const INPUT_ID = "ai-find-input";
  const ANSWER_ID = "ai-find-answer";
  const PAGE_CHARS = 12000;
  // Intent classifier: words shorter than this → find mode
  const FIND_MAX_WORDS = 4;
  // Question signals
  const Q_MARKERS = /\?|？|吗$|呢$|吧$|什么|为什么|怎么|如何|哪里|哪个|谁|哪|what|why|how|when|where|who|which|explain|describe|tell me|can you|does|is there|are there/i;
  const FIND_DEBOUNCE = 150;

  // ==================== DOM refs ====================
  let bar = null;
  let input = null;
  let answer = null;

  // ==================== State ====================
  let visible = false;
  let streaming = false;
  let streamText = "";
  let abortCtrl = null;
  // Find mode state
  let findTimer = null;
  let lastFindQuery = "";
  // Multi-turn conversation (tab-scoped)
  let turns = [];       // [{ query, answer }]
  let turnIdx = -1;     // which turn is visible (-1 = none)
  let pageUrl = "";
  // Cached page content for citation detection
  let pageContent = "";

  // ==================== Shared AI Config ====================
  function applySharedAiConfig(raw) {
    const aiRoot = raw?.ai && typeof raw.ai === "object" ? raw.ai : raw || {};
    const base = aiRoot.default && typeof raw.ai.default === "object" ? raw.ai.default : aiRoot;
    const override = aiRoot.overrides?.[MOD_AI_CONFIG_KEY] && typeof raw.ai.overrides[MOD_AI_CONFIG_KEY] === "object"
      ? raw.ai.overrides[MOD_AI_CONFIG_KEY]
      : {};
    const source = Object.assign({}, base, override);
    ["apiEndpoint", "apiKey", "model"].forEach((key) => {
      if (typeof source[key] === "string") AI_CONFIG[key] = source[key].trim();
    });
  }

  async function loadSharedAiConfig() {
    try {
      const root = await navigator.storage.getDirectory();
      const dir = await root.getDirectoryHandle(MOD_AI_CONFIG_DIR, { create: true });
      const fh = await dir.getFileHandle(MOD_AI_CONFIG_FILE, { create: false });
      applySharedAiConfig(JSON.parse(await (await fh.getFile()).text()));
    } catch (_) { /* use hardcoded defaults */ }
  }

  // ==================== Page Content Extraction ====================
  function extractPage() {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs?.[0];
        if (!tab?.id || !scriptable(tab.url)) {
          resolve({ title: tab?.title || "", url: tab?.url || "", content: "" });
          return;
        }
        chrome.scripting.executeScript({
          target: { tabId: tab.id, allFrames: false },
          injectImmediately: true,
          args: [PAGE_CHARS],
          func: (maxChars) => {
            const norm = (v) => String(v || "").replace(/\s+/g, " ").trim();
            const noise = [
              "script", "style", "noscript", "svg", "canvas",
              "nav", "header", "footer", "aside", "form",
              '[aria-hidden="true"]', "[hidden]",
              ".sidebar", ".nav", ".navigation", ".menu",
              ".comments", ".comment", ".related", ".recommend",
              ".ads", ".advertisement", ".cookie", ".modal", ".popup",
            ].join(",");
            const skip = (el) => {
              if (!el || el.matches?.(noise)) return true;
              return /(comment|footer|header|sidebar|related|promo|advert|cookie|modal|popup|breadcrumb|share)/.test(
                ((el.id || "") + " " + (el.className || "")).toLowerCase()
              );
            };
            const text = (el) => {
              if (!el || skip(el)) return "";
              const c = el.cloneNode(true);
              c.querySelectorAll?.(noise)?.forEach((n) => n.remove());
              return norm(c.innerText || c.textContent || "");
            };
            const cands = [];
            const add = (el, score) => {
              if (!el || cands.some((c) => c.el === el) || skip(el)) return;
              const t = text(el);
              if (t.length < 80) return;
              cands.push({
                el, text: t,
                score: score + Math.min(t.length, 8000) / 80
                  + (el.querySelectorAll?.("p")?.length || 0) * 16
                  + (el.querySelectorAll?.("h1, h2, h3")?.length || 0) * 20
                  - Math.min(
                    Array.from(el.querySelectorAll?.("a[href]") || []).reduce(
                      (s, l) => s + norm(l.innerText || l.textContent || "").length, 0
                    ), t.length
                  ) / 40,
              });
            };
            [["article", 240], ["main", 200], ['[role="main"]', 200],
             [".article", 160], [".post", 160], [".entry-content", 160],
             [".markdown-body", 160], [".content", 100]]
              .forEach(([s, sc]) => document.querySelectorAll(s).forEach((el) => add(el, sc)));
            cands.sort((a, b) => b.score - a.score);
            const best = cands[0]?.text || text(document.body);
            const out = best.length > maxChars ? best.slice(0, maxChars - 1).trimEnd() + "..." : best;
            return { title: document.title || "", content: out };
          },
        }, (results) => {
          const ex = results?.[0]?.result;
          resolve({ title: ex?.title || tab.title || "", url: tab.url || "", content: ex?.content || "" });
        });
      });
    });
  }

  function scriptable(url) {
    return url && !/^(chrome|vivaldi|about|edge|opera):\/\//i.test(url);
  }

  // ==================== Intent Router ====================
  function classifyIntent(query) {
    const trimmed = query.trim();
    const words = trimmed.split(/\s+/).filter(Boolean);
    const hasCJK = /[一-鿿]/.test(trimmed);
    const wordCount = hasCJK ? trimmed.length : words.length;
    // Explicit question signals → ask
    if (Q_MARKERS.test(trimmed)) return "ask";
    // Short → find
    if (wordCount <= FIND_MAX_WORDS) return "find";
    // Bare words → find
    if (!hasCJK && words.length <= FIND_MAX_WORDS) return "find";
    // Long text (>20 chars): try exact match on page first, fallback to AI
    if (wordCount > 20) return "try-find";
    // Default → ask
    return "ask";
  }

  // Long text: try page match first; if not found, route to AI
  async function resolveLongQuery(query) {
    const r = await execFind("first", query);
    return r.total > 0 ? "find" : "ask";
  }

  // ==================== Native Find ====================
  function getActiveTabId() {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        resolve(tabs?.[0]?.id || null);
      });
    });
  }

  // Inject a find state machine into the page — persists across executeScript calls
  function execFind(action, query) {
    return new Promise((resolve) => {
      getActiveTabId().then((tabId) => {
        if (!tabId) return resolve({ ok: false, current: 0, total: 0 });
        chrome.scripting.executeScript({
          target: { tabId, allFrames: false },
          injectImmediately: true,
          args: [action, query || ""],
          func: (act, q) => {
            if (!window.__aifb) window.__aifb = { query: "", idx: 0, total: 0 };
            const s = window.__aifb;

            if (act === "clear") {
              window.getSelection().removeAllRanges();
              s.query = ""; s.idx = 0; s.total = 0;
              return { current: 0, total: 0 };
            }

            // New query → count + first find
            if (q !== s.query) {
              s.query = q;
              // Count total matches in visible text nodes
              const lower = q.toLowerCase();
              let count = 0;
              const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
              while (w.nextNode()) {
                const n = w.currentNode;
                if (!n.parentElement || n.parentElement.offsetParent === null) continue;
                const t = n.textContent.toLowerCase();
                for (let i = 0; (i = t.indexOf(lower, i)) !== -1; i += lower.length) count++;
              }
              s.total = count;
              // First highlight
              window.getSelection().removeAllRanges();
              const found = window.find(q, false, false, true, false, true, false);
              s.idx = found ? 1 : 0;
            } else if (act === "next") {
              const found = window.find(q, false, false, true, false, true, false);
              s.idx = found ? (s.idx % s.total) + 1 : 0;
            } else if (act === "prev") {
              const found = window.find(q, false, true, true, false, true, false);
              s.idx = found ? ((s.idx - 2 + s.total) % s.total) + 1 : 0;
            }
            return { current: s.idx, total: s.total };
          },
        }, (results) => {
          resolve(results?.[0]?.result || { current: 0, total: 0 });
        });
      });
    });
  }

  async function doFind(query, backwards, autoAi) {
    if (!query) return;
    lastFindQuery = query;
    const action = backwards ? "prev" : "next";
    const r = await execFind(action, query);
    setFindStatus(r.current, r.total);
    // 0 matches on Enter → fall back to AI (not on debounced typing)
    if (r.total === 0 && autoAi) {
      removeFindStatus();
      doAsk(query);
    }
    return r;
  }

  async function clearFindHighlight() {
    lastFindQuery = "";
    await execFind("clear");
    removeFindStatus();
  }

  function setFindStatus(current, total) {
    if (!bar) return;
    const meta = bar.querySelector(".ai-find-meta");
    if (!meta) return;
    bar.classList.remove("find-yes", "find-no");
    if (total > 0) {
      bar.classList.add("find-yes");
      meta.textContent = current + "/" + total;
    } else {
      bar.classList.add("find-no");
      meta.textContent = "0";
    }
  }

  function removeFindStatus() {
    if (!bar) return;
    bar.classList.remove("find-yes", "find-no");
    const meta = bar.querySelector(".ai-find-meta");
    if (meta) meta.textContent = "";
  }

  // ==================== AI Pipeline ====================
  async function askAI(query, page, retry = true) {
    if (!AI_CONFIG.apiKey) return "在 ModConfig 中配置 API Key 后即可使用。";

    const sys = [
      "You are a page assistant. Answer ONLY from the current webpage content below.",
      "If the page lacks the answer, say so directly. Never invent information.",
      "Be concise. Use Markdown.",
      "",
      "CRITICAL — Citation style: weave quotes INTO your paragraphs, NOT at the end.",
      "For every factual point, immediately follow with the exact page quote on its own line:",
      "> \"exact words from the page\"",
      "",
      "CORRECT (citations woven throughout):",
      "The project uses React for its UI layer.",
      "> \"React is the primary UI framework used throughout the codebase\"",
      "For styling, it relies on Tailwind CSS.",
      "> \"Tailwind CSS provides utility-first styling across all components\"",
      "",
      "WRONG (do NOT group citations):",
      "The project uses React and Tailwind.",
      "> \"React is the primary UI framework\"",
      "> \"Tailwind CSS provides utility-first styling\"",
      "",
      "The user can click citations to jump to that text on the page.",
      "CITATIONS MUST BE IN THE PAGE'S ORIGINAL LANGUAGE — word-for-word.",
      "NEVER translate or modify quoted text. NEVER group citations at the end.",
      "Your answer may be in any language, but citations must match page language exactly.",
    ].join("\n");

    // Build full message history for true multi-turn conversation
    const usr = [
      "## Page: " + (page.title || ""),
      page.content || "(no content)",
      "",
      "## Question",
      query,
    ].filter(Boolean).join("\n");

    // All previous turns as chat messages
    const prev = [];
    for (const t of turns) {
      if (!t.answer || t.answer === "...") continue;
      prev.push({ role: "user", content: t.query });
      prev.push({ role: "assistant", content: t.answer.slice(0, 2000) });
    }

    abortCtrl = new AbortController();
    const tid = setTimeout(() => abortCtrl.abort(), AI_CONFIG.timeout);

    try {
      const res = await fetch(AI_CONFIG.apiEndpoint, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + AI_CONFIG.apiKey,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://github.com/PaRr0tBoY/Awesome-Vivaldi",
          "X-Title": "Awesome Vivaldi - AI Find Bar",
        },
        body: JSON.stringify({
          model: AI_CONFIG.model,
          stream: true,
          temperature: AI_CONFIG.temperature,
          max_tokens: AI_CONFIG.maxTokens,
          messages: [
            { role: "system", content: sys },
            ...prev,
            { role: "user", content: usr },
          ],
        }),
        signal: abortCtrl.signal,
      });
      clearTimeout(tid);

      if (!res.ok) {
        const e = await res.text().catch(() => "");
        return "**AI 请求失败** HTTP " + res.status + (e ? " — " + e.slice(0, 160) : "");
      }
      const result = await streamSSE(res, retry ? () => askAIFallback(query, page) : null);
      return result;
    } catch (err) {
      clearTimeout(tid);
      if (err?.name === "AbortError") return streamText || "";
      return "**请求出错** " + (err?.message || "");
    }
  }

  async function streamSSE(res, retryFn) {
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "", out = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() || "";
      for (const line of lines) {
        const t = line.trim();
        if (!t || !t.startsWith("data:")) continue;
        const d = t.slice(5).trim();
        if (d === "[DONE]") continue;
        try {
          const delta = JSON.parse(d)?.choices?.[0]?.delta?.content;
          if (delta) { out += delta; streamText = out; turns[turnIdx].answer = out; refreshTurn(turnIdx); }
        } catch (_) { /* skip */ }
      }
    }
    // Detect empty/garbage responses — retry with fallback model once
    const clean = out.replace(/User Safety:\s*safe|Response Safety:\s*safe|unsafe/gi, "").trim();
    if (!clean && retryFn) {
      return retryFn();
    }
    return clean || out;
  }

  function askAIFallback(query, page) {
    const prevModel = AI_CONFIG.model;
    AI_CONFIG.model = AI_CONFIG.fallbackModel;
    const promise = askAI(query, page, false);
    promise.finally(() => { AI_CONFIG.model = prevModel; });
    return promise;
  }

  // ==================== Build UI ====================
  function buildBar() {
    if (document.getElementById(BAR_ID)) return;
    bar = document.createElement("div");
    bar.id = BAR_ID;
    bar.innerHTML =
      '<div class="ai-find-shell">' +
        '<input id="' + INPUT_ID + '" type="search" placeholder="Find or ask…" autocomplete="off" spellcheck="false">' +
        '<span class="ai-find-meta"></span>' +
      '</div>' +
      '<div id="' + ANSWER_ID + '" class="ai-find-answer"></div>';

    const stack = document.getElementById("webpage-stack");
    const browser = document.getElementById("browser");
    (stack || browser || document.body).appendChild(bar);

    input = document.getElementById(INPUT_ID);
    answer = document.getElementById(ANSWER_ID);

    input.addEventListener("keydown", onInputKey);
    input.addEventListener("input", onInputChange);

    document.addEventListener("mousedown", (e) => {
      if (visible && bar && !bar.contains(e.target)) hide();
    }, true);
  }

  // ==================== Show / Hide ====================
  function show() {
    if (!bar) buildBar();
    visible = true;
    bar.classList.add("is-open");
    input.value = "";
    streamText = "";
    // Reset turns only if page changed; otherwise restore previous conversation
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs?.[0]?.url || "";
      if (pageUrl !== url) {
        turns = [];
        turnIdx = -1;
        pageUrl = url;
        pageContent = "";
        answer.innerHTML = "";
        answer.classList.remove("has-content");
      } else if (turns.length > 0) {
        // Same page — restore previous conversation
        answer.classList.add("has-content");
        showLatestTurn();
      }
    });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => input.focus());
    });
  }

  function hide() {
    cancelStream();
    visible = false;
    streamText = "";
    if (bar) {
      bar.classList.remove("is-open");
    }
    clearFindHighlight();
    if (findTimer) { clearTimeout(findTimer); findTimer = null; }
  }

  function toggle() {
    if (streaming) return;
    visible ? hide() : show();
  }

  // ==================== Input ====================
  function onInputChange() {
    const q = input.value.trim();
    if (!q) {
      clearFindHighlight();
      removeFindStatus();
      return;
    }
    const intent = classifyIntent(q);
    if (intent === "find") {
      clearTimeout(findTimer);
      findTimer = setTimeout(() => doFind(q), FIND_DEBOUNCE);
    } else {
      if (findTimer) { clearTimeout(findTimer); findTimer = null; }
      clearFindHighlight();
      removeFindStatus();
    }
  }

  async function onInputKey(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      const q = input.value.trim();
      if (!q || streaming) return;
      clearTimeout(findTimer);
      // Shift+Enter → force AI regardless of classifier
      let intent = e.shiftKey ? "ask" : classifyIntent(q);
      if (intent === "try-find") intent = await resolveLongQuery(q);
      if (intent === "find") {
        doFind(q, false, true);
      } else {
        doAsk(q);
      }
      return;
    }
    if (e.key === "Escape") {
      if (streaming) {
        cancelStream();
        if (turnIdx >= 0 && turns[turnIdx]) {
          turns[turnIdx].answer = streamText || "";
          refreshTurn(turnIdx);
        }
      }
      else { hide(); }
      return;
    }
    // Arrow keys: find navigation OR pager navigation
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (answer.classList.contains("has-content") && turns.length > 1) {
        // Pager nav when multi-turn conversation exists
        e.preventDefault();
        if (e.key === "ArrowDown" && turnIdx < turns.length - 1) showTurn(turnIdx + 1);
        if (e.key === "ArrowUp" && turnIdx > 0) showTurn(turnIdx - 1);
      } else if (lastFindQuery && !answer.classList.contains("has-content")) {
        e.preventDefault();
        doFind(lastFindQuery, e.key === "ArrowUp");
      }
    }
  }

  // ==================== Ask flow ====================
  async function doAsk(query) {
    streaming = true;
    streamText = "";
    input.disabled = true;

    // New turn placeholder
    const ti = turns.length;
    turns.push({ query, answer: "..." });
    turnIdx = ti;
    // Ensure inner wrapper exists
    if (!answer.querySelector(".ai-find-inner")) {
      answer.innerHTML = '<div class="ai-find-inner"></div>';
    }
    const inner = answer.querySelector(".ai-find-inner");
    inner.insertAdjacentHTML("beforeend", buildTurnHTML(ti, query, ""));
    showTurn(ti);
    answer.classList.add("has-content");

    try {
      const page = await extractPage();
      if (!page.content) {
        turns[ti].answer = "无法读取当前页面内容。";
        refreshTurn(ti);
        streaming = false;
        input.disabled = false;
        return;
      }
      pageContent = page.content;
      const result = await askAI(query, page);
      if (streaming) {
        streamText = result;
        turns[ti].answer = result;
        refreshTurn(ti);
        // Post-process: detect additional citations via fuzzy page match
        setTimeout(() => detectCitations(ti), 0);
      }
    } catch (err) {
      turns[ti].answer = "**出错** " + (err?.message || "");
      refreshTurn(ti);
    } finally {
      streaming = false;
      input.disabled = false;
      abortCtrl = null;
      if (visible) input.focus();
    }
  }

  // Update a turn's answer in-place + wire citations
  function refreshTurn(i) {
    const turnEl = answer.querySelector('.ai-find-turn[data-idx="' + i + '"]');
    if (!turnEl) return;
    const a = turnEl.querySelector(".ai-find-turn-a");
    if (!a) return;
    if (turns[i].answer === "...") {
      a.innerHTML = '<div class="ai-find-loading"><span></span><span></span><span></span></div>';
    } else {
      a.innerHTML = mdToHtml(turns[i].answer);
    }
    answer.scrollTop = answer.scrollHeight;
    // Wire citation clicks — all .ai-find-cite elements scroll to source
    a.querySelectorAll(".ai-find-cite").forEach((el) => {
      const raw = el.textContent.trim();
      const clean = raw.replace(/^["「""」]/g, "").replace(/["「""」]$/g, "").trim();
      if (clean.length >= 4) {
        el.addEventListener("click", () => scrollToCite(clean));
      }
    });
  }

  function buildTurnHTML(i, q, a) {
    const aHtml = a ? mdToHtml(a) : '<div class="ai-find-loading"><span></span><span></span><span></span></div>';
    return '<div class="ai-find-turn" data-idx="' + i + '">' +
      '<div class="ai-find-turn-q">' + escapeHtml(q) + '</div>' +
      '<div class="ai-find-turn-a">' + aHtml + '</div>' +
    '</div>';
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function showTurn(i) {
    if (i < 0 || i >= turns.length) return;
    turnIdx = i;
    const inner = answer.querySelector(".ai-find-inner");
    if (!inner) return;
    inner.querySelectorAll(".ai-find-turn").forEach((el, j) => {
      el.style.display = j === i ? "" : "none";
    });
    updatePager();
  }

  function showLatestTurn() {
    if (turns.length === 0) return;
    showTurn(turns.length - 1);
  }

  // ── Pager ──
  function ensurePager() {
    if (bar.querySelector(".ai-find-pager")) return;
    const inner = answer.querySelector(".ai-find-inner");
    if (!inner) return;
    const pager = document.createElement("div");
    pager.className = "ai-find-pager";
    pager.innerHTML =
      '<button class="ai-find-pager-btn" data-dir="prev" title="上一个回答">←</button>' +
      '<span class="ai-find-pager-label"></span>' +
      '<button class="ai-find-pager-btn" data-dir="next" title="下一个回答">→</button>';
    pager.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-dir]");
      if (!btn) return;
      if (btn.dataset.dir === "prev" && turnIdx > 0) showTurn(turnIdx - 1);
      if (btn.dataset.dir === "next" && turnIdx < turns.length - 1) showTurn(turnIdx + 1);
    });
    inner.appendChild(pager);
  }

  function updatePager() {
    const pager = bar.querySelector(".ai-find-pager");
    if (turns.length <= 1) {
      if (pager) pager.style.display = "none";
      return;
    }
    ensurePager();
    const p = bar.querySelector(".ai-find-pager");
    if (!p) return;
    p.style.display = "";
    const label = p.querySelector(".ai-find-pager-label");
    if (label) label.textContent = (turnIdx + 1) + "/" + turns.length;
    const prev = p.querySelector("[data-dir=prev]");
    const next = p.querySelector("[data-dir=next]");
    if (prev) prev.disabled = turnIdx <= 0;
    if (next) next.disabled = turnIdx >= turns.length - 1;
  }

  function cancelStream() {
    if (abortCtrl) { abortCtrl.abort(); abortCtrl = null; }
    streaming = false;
    if (input) input.disabled = false;
  }

  // ==================== Citation scroll — fuzzy 90% match ====================
  function scrollToCite(citeText) {
    if (!citeText || citeText.length < 4) return;
    const clean = citeText.replace(/["「」]/g, "").trim();
    getActiveTabId().then((tabId) => {
      if (!tabId) return;
      chrome.scripting.executeScript({
        target: { tabId, allFrames: false },
        injectImmediately: true,
        args: [clean],
        func: (q) => {
          // Try exact match first
          window.getSelection().removeAllRanges();
          if (window.find(q, false, false, true, false, true, false)) {
            const sel = window.getSelection();
            if (sel.rangeCount > 0) {
              const top = sel.getRangeAt(0).getClientRects()[0]?.top + window.scrollY - 80;
              if (top) window.scrollTo({ top, behavior: "smooth" });
            }
            return { ok: true };
          }
          // Fuzzy: progressively trim chars from both ends until match or too short
          const minLen = Math.max(6, Math.floor(q.length * 0.6));
          for (let trim = 1; trim <= q.length - minLen; trim++) {
            // Trim from end
            const subEnd = q.slice(0, q.length - trim);
            window.getSelection().removeAllRanges();
            if (window.find(subEnd, false, false, true, false, true, false)) {
              const sel = window.getSelection();
              if (sel.rangeCount > 0) {
                const top = sel.getRangeAt(0).getClientRects()[0]?.top + window.scrollY - 80;
                if (top) window.scrollTo({ top, behavior: "smooth" });
              }
              return { ok: true, fuzzy: true, matched: subEnd.length / q.length };
            }
            // Trim from start
            const subStart = q.slice(trim);
            window.getSelection().removeAllRanges();
            if (window.find(subStart, false, false, true, false, true, false)) {
              const sel = window.getSelection();
              if (sel.rangeCount > 0) {
                const top = sel.getRangeAt(0).getClientRects()[0]?.top + window.scrollY - 80;
                if (top) window.scrollTo({ top, behavior: "smooth" });
              }
              return { ok: true, fuzzy: true, matched: subStart.length / q.length };
            }
          }
          return { ok: false };
        },
      });
    });
  }

  // Post-process answer: detect text matching page content → mark as citation
  function detectCitations(ti) {
    if (!pageContent) return;
    const turnEl = answer.querySelector('.ai-find-turn[data-idx="' + ti + '"]');
    if (!turnEl) return;
    const turnA = turnEl.querySelector('.ai-find-turn-a');
    if (!turnA) return;
    const pc = pageContent.toLowerCase();
    const walker = document.createTreeWalker(turnA, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => {
        if (n.parentElement?.closest?.('.ai-find-cite')) return NodeFilter.FILTER_REJECT;
        return n.textContent.trim().length >= 10 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const toWrap = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (fuzzyMatch(node.textContent, pc)) toWrap.push(node);
    }
    for (const node of toWrap) {
      const span = document.createElement("span");
      span.className = "ai-find-cite";
      span.title = "定位到原文";
      const clean = node.textContent.trim().replace(/^["「]|["」]$/g, "");
      span.addEventListener("click", () => scrollToCite(clean));
      node.parentNode.replaceChild(span, node);
      span.textContent = node.textContent;
    }
  }

  function fuzzyMatch(text, pageLower) {
    const t = text.toLowerCase().trim();
    if (t.length < 10) return false;
    if (pageLower.includes(t)) return true;
    if (t.length > 12 && pageLower.includes(t.slice(1, -1))) return true;
    const words = t.split(/\s+/).filter(w => w.length >= 4);
    if (words.length < 3) return false;
    const sentences = pageLower.split(/[.。!！?？\n]+/).filter(s => s.length > 10);
    for (const sent of sentences) {
      let matched = 0;
      for (const w of words) if (sent.includes(w)) matched++;
      if (matched / words.length >= 0.7) return true;
    }
    return false;
  }

  function mdToHtml(t) {
    if (!t) return "";

    // ── Pass 1: extract citation patterns BEFORE markdown, replace with placeholders ──
    const cites = [];
    const CID = "__CITE_";

    // Blockquote-style: entire "> ..." lines
    let h = t.replace(/^> "(.+)"[ \t]*$/gm, (_, text) => {
      cites.push({ text, block: true });
      return CID + (cites.length - 1);
    });
    // Blockquote without quotes: > some text (fallback)
    h = h.replace(/^> (.+)$/gm, (_, text) => {
      const stripped = text.replace(/^["「]|["」]$/g, "").trim();
      if (stripped.length >= 8) {
        cites.push({ text: stripped, block: true });
        return CID + (cites.length - 1);
      }
      return "<p>" + escapeHtml(text) + "</p>";
    });
    // Inline quoted text: "long enough text"
    h = h.replace(/"([^"]{10,200}?)"/g, (_, text) => {
      cites.push({ text, block: false });
      return CID + (cites.length - 1);
    });
    // Chinese quotes: 「long enough text」
    h = h.replace(/「([^」]{8,200}?)」/g, (_, text) => {
      cites.push({ text, block: false });
      return CID + (cites.length - 1);
    });

    // ── Pass 2: standard markdown on remaining text ──
    // Strip any remaining > prefix that wasn't captured as citation
    h = h.replace(/^> /gm, "");
    h = h
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^# (.+)$/gm, "<h1>$1</h1>")
      .replace(/^- (.+)$/gm, "<li>$1</li>")
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br>");
    h = h.replace(/((?:<li>.*?<\/li><br>?)+)/g, (m) => "<ul>" + m.replace(/<br>/g, "") + "</ul>");
    if (h && !/^</.test(h)) h = "<p>" + h + "</p>";

    // ── Pass 3: restore citations directly as safe HTML ──
    h = h.replace(new RegExp(CID + "(\\d+)", "g"), (_, idx) => {
      const c = cites[+idx];
      if (!c) return "";
      const safe = escapeHtml(c.text);
      if (c.block) {
        return '<p class="ai-find-cite">"' + safe + '"</p>';
      }
      return '<span class="ai-find-cite">"' + safe + '"</span>';
    });

    return h;
  }

  // ==================== Ctrl+F Toggle ====================
  function interceptShortcut(e) {
    const mod = e.metaKey || e.ctrlKey;
    const key = String(e.key || "").toLowerCase();
    if (mod && !e.altKey && !e.shiftKey && key === "f") {
      if (e.defaultPrevented) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      toggle();
    }
    if (e.key === "Escape" && visible && !streaming) {
      e.preventDefault();
      e.stopPropagation();
      hide();
    }
  }

  function registerShortcuts() {
    document.addEventListener("keydown", interceptShortcut, true);
    if (
      window.vivaldi?.tabsPrivate?.onKeyboardShortcut &&
      typeof vivaldi.tabsPrivate.onKeyboardShortcut.addListener === "function"
    ) {
      vivaldi.tabsPrivate.onKeyboardShortcut.addListener((_id, combo) => {
        if (typeof combo !== "string") return;
        const n = combo.toLowerCase();
        if (n === "cmd+f" || n === "meta+f" || n === "ctrl+f") toggle();
      });
    }
  }

  // ==================== Init ====================
  function init() {
    loadSharedAiConfig().catch(() => {});
    window.addEventListener("vivaldi-mod-ai-config-updated", (e) => {
      applySharedAiConfig(e.detail || {});
    });
    registerShortcuts();
    buildBar();
  }

  if (document.getElementById("browser")) {
    init();
  } else {
    const obs = new MutationObserver(() => {
      if (document.getElementById("browser")) { obs.disconnect(); init(); }
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
