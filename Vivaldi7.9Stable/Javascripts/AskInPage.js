/*
 * Ask in Page Panel
 * Reworked to follow the successful GlobalMediaControls pattern:
 * register a WebPanel, hide native webpanel content, and render the real UI
 * directly inside the host panel DOM instead of relying on an iframe app.
 */

(() => {
  'use strict';

  const name = 'Ask in Page';
  const nameAttribute = 'ask-in-page';
  const webPanelId = 'WEBPANEL_ask-in-page-a1b2c3d4e5f6';
  const uiVersion = 'v72';
  const code = 'data:text/html,' + encodeURIComponent('<title>' + name + '</title>');
  const panelIconSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M13.5 2.5 7.5 12h4l-1 9.5 6-9.5h-4l1-9.5Z" stroke="#8B949E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const panelIcon = 'data:image/svg+xml,' + encodeURIComponent(panelIconSvg);
  const panelIconMask = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
    '<path d="M13.5 2.5 7.5 12h4l-1 9.5 6-9.5h-4l1-9.5Z" fill="none" stroke="#000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>'
  );
  const commandDefinitions = [
    {
      id: 'analyze',
      name: 'Analyze',
      trigger: 'analyze',
      aliases: ['ana', 'an', 'research'],
      prompt: "Analyze this content, looking for bias, patterns, trends, connections. Consider the author, the source. Research to fact check, if it seems beneficial. Research the broader setting. If no content has been provided, ask about the relevant subject matter.",
      iconText: '◔',
      subtitle: 'Bias, patterns, trends, connections',
    },
    {
      id: 'summarize',
      name: 'Summarize',
      trigger: 'summarize',
      aliases: ['sum', 'summary', 'tl;dr'],
      prompt: "Please provide a clear, concise summary of the attached content. Begin with a simple answer distilling the main point. Then cover 3-4 main ideas. Be concise. One sentence for each, max two. If there is no attached content, ask the user what might be helpful to summarize.",
      iconText: '≡',
      subtitle: 'Clear, concise summary',
    },
    {
      id: 'explain',
      name: 'Explain',
      trigger: 'explain',
      aliases: ['exp', 'ex'],
      prompt: "Please explain the concept, topic, or content in clear, accessible language. Break down complex ideas into understandable parts, provide relevant examples, and structure your explanation logically from basic to more advanced concepts. Be relatively concise. If nothing has been provided, ask what they'd like you to explain.",
      iconText: '◔',
      subtitle: 'Clear explanation with examples',
    },
  ];
  const AI_CONFIG = {
    // apiEndpoint: 'https://open.bigmodel.cn/api/paas/v4',
    // apiKey: '',
    // model: 'glm-4.7-flash',
    // apiEndpoint: 'https://api.minimaxi.com/v1',
    // apiKey: '',
    // model: 'MiniMax-M2.5',
    apiEndpoint: 'https://openrouter.ai/api/v1',
    apiKey: '',
    model: 'openrouter/free',
    timeout: 90000,
    temperature: 0.5,
    maxTokens: 20000,
  };
  const CONTEXT_LIMITS = {
    pageContentChars: 50000,
    filePreviewChars: 50000,
  };
  const ASK_IN_PAGE_DEBUG = false;
  const PERFORMANCE_CONFIG = {
    selectionPollIntervalMs: 1500,
    tabSnapshotCacheTtlMs: 15000,
  };
  const STREAM_UI_CONFIG = {
    startDelayMs: 180,
    charsPerSecond: 90,
    punctuationPause: 0,
    newlinePause: 0,
    ghostTailChars: 14,
  };
  const LANGUAGE_MAP = {
    zh: 'Chinese',
    'zh-CN': 'Simplified Chinese',
    'zh-TW': 'Traditional Chinese',
    en: 'English',
    'en-US': 'English',
    'en-GB': 'English',
    ja: 'Japanese',
    'ja-JP': 'Japanese',
    ko: 'Korean',
    'ko-KR': 'Korean',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    ru: 'Russian',
    pt: 'Portuguese',
    it: 'Italian',
    ar: 'Arabic',
    hi: 'Hindi',
  };

  let reactPropsKey = null;
  let panelRoot = null;
  let panelState = null;
  let panelResizeObserver = null;
  const tabSnapshotCache = new Map();

  function getReactProps(element) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    if (!element || element.ownerDocument !== document) {
      return;
    }
    if (!reactPropsKey) {
      reactPropsKey = Object.keys(element).find((key) => key.startsWith('__reactProps'));
    }
    return element[reactPropsKey];
  }

  function createElement(tagName, attribute, parent, inner, options) {
    if (typeof tagName === 'undefined') {
      return;
    }
    options = options || {};
    const el = document.createElement(tagName);
    if (attribute && typeof attribute === 'object') {
      Object.keys(attribute).forEach((key) => {
        if (key === 'text') {
          el.textContent = attribute[key];
        } else if (key === 'html') {
          el.innerHTML = attribute[key];
        } else if (key === 'style' && typeof attribute[key] === 'object') {
          Object.keys(attribute[key]).forEach((css) => {
            el.style.setProperty(css, attribute[key][css]);
          });
        } else if (key === 'events' && typeof attribute[key] === 'object') {
          Object.keys(attribute[key]).forEach((eventName) => {
            if (typeof attribute[key][eventName] === 'function') {
              el.addEventListener(eventName, attribute[key][eventName]);
            }
          });
        } else if (typeof el[key] !== 'undefined') {
          el[key] = attribute[key];
        } else {
          el.setAttribute(key, attribute[key]);
        }
      });
    }
    if (inner) {
      const nodes = Array.isArray(inner) ? inner : [inner];
      nodes.forEach((node) => {
        if (node?.nodeType) {
          el.append(node);
        } else {
          const template = document.createElement('template');
          template.innerHTML = node;
          el.append(template.content.firstChild);
        }
      });
    }
    if (typeof parent === 'string') {
      parent = document.querySelector(parent);
    }
    if (parent) {
      if (options.isPrepend) {
        parent.prepend(el);
      } else {
        parent.append(el);
      }
    }
    return el;
  }

  function addStyle(css, id) {
    const html = Array.isArray(css) ? css.join('\n') : (css || '');
    const existing = document.getElementById(id);
    if (existing) {
      existing.innerHTML = html;
      return existing;
    }
    return createElement('style', {
      id,
      html,
    }, document.head);
  }

  function getBrowserLanguage() {
    return chrome.i18n?.getUILanguage?.() || navigator.language || 'zh-CN';
  }

  function getLanguageName(langCode) {
    return LANGUAGE_MAP[langCode] || LANGUAGE_MAP[String(langCode || '').split('-')[0]] || 'English';
  }

  function getCommandDefinition(name) {
    return commandDefinitions.find((item) => item.name === name) || null;
  }

  function cleanModelText(text) {
    return String(text || '')
      .replace(/<\s*(?:thought|reasoning|think|thinking)\s*>[\s\S]*?<\s*\/\s*(?:thought|reasoning|think|thinking)\s*>/gi, '')
      .replace(/\r/g, '');
  }

  function appendReasoningText(existingText, nextChunk) {
    const next = String(nextChunk || '');
    if (!next) {
      return existingText || '';
    }
    return String(existingText || '') + next;
  }

  function extractThinkingSegments(text) {
    const raw = String(text || '').replace(/\r/g, '');
    let reasoning = '';
    const visible = raw.replace(/<\s*(?:think|thinking)\s*>([\s\S]*?)<\s*\/\s*(?:think|thinking)\s*>/gi, (_, captured) => {
      const normalized = String(captured || '').trim();
      if (normalized) {
        reasoning += (reasoning ? '\n' : '') + normalized;
      }
      return '';
    });
    return {
      reasoning: reasoning.trim(),
      content: visible.trim(),
    };
  }

  function createThinkingStreamState() {
    return {
      inside: false,
      buffer: '',
    };
  }

  function consumeThinkingStreamChunk(streamState, chunkText) {
    streamState.buffer += String(chunkText || '');
    let visible = '';
    let reasoning = '';

    while (streamState.buffer) {
      if (streamState.inside) {
        const closeMatch = streamState.buffer.match(/<\s*\/\s*(?:think|thinking)\s*>/i);
        if (!closeMatch) {
          break;
        }
        reasoning += streamState.buffer.slice(0, closeMatch.index);
        streamState.buffer = streamState.buffer.slice(closeMatch.index + closeMatch[0].length);
        streamState.inside = false;
        continue;
      }

      const openMatch = streamState.buffer.match(/<\s*(?:think|thinking)\s*>/i);
      if (!openMatch) {
        const partialTag = streamState.buffer.match(/<\s*\/?\s*(?:think|thinking)?\s*$/i);
        if (partialTag) {
          visible += streamState.buffer.slice(0, partialTag.index);
          streamState.buffer = streamState.buffer.slice(partialTag.index);
        } else {
          visible += streamState.buffer;
          streamState.buffer = '';
        }
        break;
      }

      visible += streamState.buffer.slice(0, openMatch.index);
      streamState.buffer = streamState.buffer.slice(openMatch.index + openMatch[0].length);
      streamState.inside = true;
    }

    return {
      reasoning: reasoning,
      content: visible,
    };
  }

  function flushThinkingStreamState(streamState) {
    const remaining = String(streamState.buffer || '');
    streamState.buffer = '';
    if (!remaining) {
      return { reasoning: '', content: '' };
    }
    if (streamState.inside) {
      streamState.inside = false;
      return {
        reasoning: remaining.replace(/<\s*\/?\s*(?:think|thinking)\s*>/gi, ''),
        content: '',
      };
    }
    return {
      reasoning: '',
      content: remaining.replace(/<\s*\/?\s*(?:think|thinking)\s*>/gi, ''),
    };
  }

  function truncateText(text, maxLength) {
    const normalized = String(text || '').replace(/\s+/g, ' ').trim();
    if (!normalized || normalized.length <= maxLength) {
      return normalized;
    }
    return normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd() + '…';
  }

  function maskApiEndpoint(endpoint) {
    return String(endpoint || '').replace(/\/$/, '') + '/chat/completions';
  }

  function logAiCompose(groupTitle, payload) {
    if (!ASK_IN_PAGE_DEBUG) {
      return;
    }
    try {
      console.groupCollapsed('[AskInPage] ' + groupTitle);
      Object.entries(payload || {}).forEach(([key, value]) => {
        console.log(key + ':', value);
      });
      console.groupEnd();
    } catch (error) {
      console.log('[AskInPage] ' + groupTitle, payload);
    }
  }

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderInlineMarkdown(text) {
    let output = escapeHtml(text);
    output = output.replace(/`([^`]+)`/g, '<code>$1</code>');
    output = output.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer noopener">$1</a>');
    output = output.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    output = output.replace(/(^|[\s(])\*([^*]+)\*(?=$|[\s).,!?:;])/g, '$1<em>$2</em>');
    output = output.replace(/==([^=]+)==/g, '<mark>$1</mark>');
    output = output.replace(/\$\$([\s\S]+?)\$\$/g, '<div class="ask-latex-block"><code>$1</code></div>');
    output = output.replace(/\$([^$\n]+)\$/g, '<span class="ask-latex-inline"><code>$1</code></span>');
    return output;
  }

  function countIndent(line) {
    const match = String(line || '').match(/^ */);
    return match ? match[0].length : 0;
  }

  function isHrLine(line) {
    return /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line || '');
  }

  function isTableSeparator(line) {
    return /^\s*\|?(?:\s*:?-{3,}:?\s*\|)+\s*(?:\s*:?-{3,}:?\s*)?\|?\s*$/.test(line || '');
  }

  function parseTableRow(line) {
    return String(line || '')
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((cell) => cell.trim());
  }

  function stripIndent(line, indent) {
    const count = Math.min(countIndent(line), indent);
    return String(line || '').slice(count);
  }

  function highlightCode(code, language) {
    const escaped = escapeHtml(code);
    const lang = String(language || '').toLowerCase();
    if (lang === 'json') {
      return escaped
        .replace(/(&quot;.*?&quot;)(\s*:)/g, '<span class="ask-code-key">$1</span>$2')
        .replace(/:\s*(&quot;.*?&quot;)/g, ': <span class="ask-code-string">$1</span>')
        .replace(/\b(true|false|null)\b/g, '<span class="ask-code-keyword">$1</span>')
        .replace(/\b(-?\d+(?:\.\d+)?)\b/g, '<span class="ask-code-number">$1</span>');
    }
    if (lang === 'js' || lang === 'javascript' || lang === 'ts' || lang === 'typescript') {
      return escaped
        .replace(/\b(const|let|var|function|return|if|else|await|async|import|from|export|class|new|throw|try|catch)\b/g, '<span class="ask-code-keyword">$1</span>')
        .replace(/(&quot;.*?&quot;|&#39;.*?&#39;|`.*?`)/g, '<span class="ask-code-string">$1</span>')
        .replace(/\b(-?\d+(?:\.\d+)?)\b/g, '<span class="ask-code-number">$1</span>');
    }
    if (lang === 'bash' || lang === 'sh' || lang === 'shell' || lang === 'zsh') {
      return escaped
        .replace(/^([$\w./-]+)/gm, '<span class="ask-code-keyword">$1</span>')
        .replace(/(\s--?[\w-]+)/g, '<span class="ask-code-number">$1</span>')
        .replace(/(&quot;.*?&quot;|&#39;.*?&#39;)/g, '<span class="ask-code-string">$1</span>');
    }
    return escaped;
  }

  function enhanceRenderedAnswer(container) {
    container.querySelectorAll('pre > code').forEach((codeBlock) => {
      const language = codeBlock.getAttribute('data-lang') || '';
      const rawCode = codeBlock.textContent || '';
      codeBlock.innerHTML = highlightCode(rawCode, language);
      const pre = codeBlock.parentElement;
      if (!pre || pre.querySelector('.ask-code-copy')) {
        return;
      }
      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'ask-code-copy';
      copyBtn.textContent = 'Copy';
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(rawCode);
          copyBtn.textContent = 'Copied';
        } catch (error) {
          const range = document.createRange();
          range.selectNodeContents(codeBlock);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
          try {
            document.execCommand('copy');
            copyBtn.textContent = 'Copied';
          } catch (copyError) {
            copyBtn.textContent = 'Failed';
          }
          selection?.removeAllRanges();
        }
        window.setTimeout(() => {
          copyBtn.textContent = 'Copy';
        }, 1200);
      });
      pre.appendChild(copyBtn);
    });
  }

  function renderMarkdownToHtml(markdown) {
    const source = String(markdown || '').replace(/\r/g, '');
    if (!source.trim()) {
      return '';
    }
    const lines = source.split('\n');

    function parseBlocks(blockLines, baseIndent) {
      const blocks = [];
      let i = 0;

      function parseList(startIndex) {
        const firstLine = blockLines[startIndex];
        const firstMatch = firstLine.match(/^(\s*)([-+*]|\d+\.)\s+(.*)$/);
        if (!firstMatch) {
          return null;
        }
        const listIndent = firstMatch[1].length;
        const ordered = /\d+\./.test(firstMatch[2]);
        const tag = ordered ? 'ol' : 'ul';
        const items = [];
        let index = startIndex;

        while (index < blockLines.length) {
          const line = blockLines[index];
          const match = line.match(/^(\s*)([-+*]|\d+\.)\s+(.*)$/);
          if (!match || match[1].length !== listIndent || (/\d+\./.test(match[2]) !== ordered)) {
            break;
          }
          const taskMatch = match[3].match(/^\[( |x|X)]\s+(.*)$/);
          const itemLines = [taskMatch ? taskMatch[2] : match[3]];
          index += 1;
          while (index < blockLines.length) {
            const nextLine = blockLines[index];
            if (!nextLine.trim()) {
              itemLines.push('');
              index += 1;
              continue;
            }
            const nextMatch = nextLine.match(/^(\s*)([-+*]|\d+\.)\s+(.*)$/);
            if (nextMatch && nextMatch[1].length === listIndent && (/\d+\./.test(nextMatch[2]) === ordered)) {
              break;
            }
            if (countIndent(nextLine) <= listIndent && !/^>\s?/.test(nextLine)) {
              break;
            }
            itemLines.push(stripIndent(nextLine, listIndent + 2));
            index += 1;
          }
          const itemHtml = parseBlocks(itemLines, 0);
          if (taskMatch) {
            const checked = /[xX]/.test(taskMatch[1]);
            items.push(
              '<li class="ask-task-item">' +
              '<span class="ask-task-box' + (checked ? ' checked' : '') + '" aria-hidden="true">' + (checked ? '✓' : '') + '</span>' +
              '<span class="ask-task-content">' + itemHtml + '</span>' +
              '</li>'
            );
          } else {
            items.push('<li>' + itemHtml + '</li>');
          }
        }

        return {
          html: '<' + tag + '>' + items.join('') + '</' + tag + '>',
          nextIndex: index,
        };
      }

      while (i < blockLines.length) {
        const originalLine = blockLines[i];
        const line = stripIndent(originalLine, baseIndent);
        if (!line.trim()) {
          i += 1;
          continue;
        }
        if (countIndent(originalLine) < baseIndent) {
          break;
        }
        if (/^```/.test(line.trim())) {
          const language = line.trim().slice(3).trim();
          const codeLines = [];
          i += 1;
          while (i < blockLines.length && !/^```/.test(stripIndent(blockLines[i], baseIndent).trim())) {
            codeLines.push(stripIndent(blockLines[i], baseIndent));
            i += 1;
          }
          if (i < blockLines.length) {
            i += 1;
          }
          blocks.push('<pre><code' + (language ? (' data-lang="' + escapeHtml(language) + '"') : '') + '>' + escapeHtml(codeLines.join('\n')) + '</code></pre>');
          continue;
        }
        const heading = line.match(/^(#{1,4})\s+(.*)$/);
        if (heading) {
          const level = heading[1].length;
          blocks.push('<h' + level + '>' + renderInlineMarkdown(heading[2]) + '</h' + level + '>');
          i += 1;
          continue;
        }
        if (isHrLine(line)) {
          blocks.push('<hr>');
          i += 1;
          continue;
        }
        if (line.includes('|') && i + 1 < blockLines.length && isTableSeparator(stripIndent(blockLines[i + 1], baseIndent))) {
          const headerCells = parseTableRow(line);
          i += 2;
          const rows = [];
          while (i < blockLines.length) {
            const rowLine = stripIndent(blockLines[i], baseIndent);
            if (!rowLine.trim() || !rowLine.includes('|')) {
              break;
            }
            rows.push(parseTableRow(rowLine));
            i += 1;
          }
          blocks.push(
            '<table><thead><tr>' + headerCells.map((cell) => '<th>' + renderInlineMarkdown(cell) + '</th>').join('') + '</tr></thead>' +
            '<tbody>' + rows.map((row) => '<tr>' + row.map((cell) => '<td>' + renderInlineMarkdown(cell) + '</td>').join('') + '</tr>').join('') + '</tbody></table>'
          );
          continue;
        }
        if (/^>\s?/.test(line)) {
          const quoteLines = [];
          while (i < blockLines.length) {
            const current = stripIndent(blockLines[i], baseIndent);
            if (!/^>\s?/.test(current) && current.trim()) {
              break;
            }
            quoteLines.push(current.replace(/^>\s?/, ''));
            i += 1;
            if (i < blockLines.length && !blockLines[i].trim()) {
              quoteLines.push('');
              i += 1;
            }
          }
          blocks.push('<blockquote>' + parseBlocks(quoteLines, 0) + '</blockquote>');
          continue;
        }
        const list = parseList(i);
        if (list) {
          blocks.push(list.html);
          i = list.nextIndex;
          continue;
        }
        const paragraph = [];
        while (i < blockLines.length) {
          const currentLine = stripIndent(blockLines[i], baseIndent);
          if (!currentLine.trim()) {
            break;
          }
          if (/^(#{1,4})\s+/.test(currentLine) || /^```/.test(currentLine.trim()) || isHrLine(currentLine) || /^>\s?/.test(currentLine) || currentLine.match(/^(\s*)([-+*]|\d+\.)\s+/) || (currentLine.includes('|') && i + 1 < blockLines.length && isTableSeparator(stripIndent(blockLines[i + 1], baseIndent)))) {
            break;
          }
          paragraph.push(currentLine);
          i += 1;
        }
        blocks.push('<p>' + renderInlineMarkdown(paragraph.join(' ')) + '</p>');
      }
      return blocks.join('');
    }

    return parseBlocks(lines, 0);
  }

  async function renderRichAnswer(container, text) {
    const raw = String(text || '');
    if (!raw) {
      container.textContent = '';
      return;
    }
    container.innerHTML = renderMarkdownToHtml(raw);
    enhanceRenderedAnswer(container);
  }

  function ensureLiveAnswerNodes(answerNode) {
    let live = answerNode.querySelector('.ask-msg-ai-answer-live');
    let committed = live?.querySelector('.ask-msg-ai-answer-committed');
    let preview = live?.querySelector('.ask-msg-ai-answer-preview');
    let tailCurrent = preview?.querySelector('.ask-msg-ai-answer-tail-current');
    let tailGhost = preview?.querySelector('.ask-msg-ai-answer-tail-ghost');
    if (!live || !committed || !preview || !tailCurrent || !tailGhost) {
      answerNode.innerHTML = '';
      live = document.createElement('div');
      live.className = 'ask-msg-ai-answer-live';
      committed = document.createElement('div');
      committed.className = 'ask-msg-ai-answer-committed';
      preview = document.createElement('div');
      preview.className = 'ask-msg-ai-answer-preview';
      tailCurrent = document.createElement('span');
      tailCurrent.className = 'ask-msg-ai-answer-tail-current';
      tailGhost = document.createElement('span');
      tailGhost.className = 'ask-msg-ai-answer-tail-ghost';
      preview.append(tailCurrent, tailGhost);
      live.append(committed, preview);
      answerNode.appendChild(live);
    }
    return { live, committed, preview, tailCurrent, tailGhost };
  }

  function splitStableMarkdown(markdown) {
    const source = String(markdown || '').replace(/\r/g, '');
    if (!source) {
      return { committed: '', preview: '' };
    }
    let committedEnd = 0;
    let cursor = 0;

    function findParagraphBoundary(start) {
      const doubleNewlineIndex = source.indexOf('\n\n', start);
      return doubleNewlineIndex === -1 ? -1 : doubleNewlineIndex + 2;
    }

    while (cursor < source.length) {
      while (cursor < source.length && /\s/.test(source[cursor])) {
        cursor += 1;
      }
      if (cursor >= source.length) {
        break;
      }

      if (source.slice(cursor, cursor + 3) === '```') {
        const fenceClose = source.indexOf('\n```', cursor + 3);
        if (fenceClose === -1) {
          break;
        }
        let nextCursor = fenceClose + 4;
        if (source[nextCursor] === '\n') {
          nextCursor += 1;
        }
        committedEnd = nextCursor;
        cursor = nextCursor;
        continue;
      }

      const lineEnd = source.indexOf('\n', cursor);
      const firstLine = source.slice(cursor, lineEnd === -1 ? source.length : lineEnd);
      const trimmedFirstLine = firstLine.trim();

      // Keep complex markdown blocks in preview until the final render.
      if (
        /^(#{1,4})\s+/.test(trimmedFirstLine) ||
        /^>\s?/.test(trimmedFirstLine) ||
        /^(\s*)([-+*]|\d+\.)\s+/.test(firstLine) ||
        (trimmedFirstLine.includes('|') && lineEnd !== -1)
      ) {
        break;
      }

      const paragraphBoundary = findParagraphBoundary(cursor);
      if (paragraphBoundary === -1) {
        break;
      }
      committedEnd = paragraphBoundary;
      cursor = paragraphBoundary;
    }

    return {
      committed: source.slice(0, committedEnd),
      preview: source.slice(committedEnd),
    };
  }

  function renderStreamingMarkdown(answerNode, displayedText, fullText) {
    const liveNodes = ensureLiveAnswerNodes(answerNode);
    const normalizedDisplayed = cleanModelText(displayedText);
    const normalizedFull = cleanModelText(typeof fullText === 'string' ? fullText : displayedText);
    const parts = splitStableMarkdown(normalizedDisplayed);
    const ghostTail = normalizedFull.slice(
      normalizedDisplayed.length,
      normalizedDisplayed.length + STREAM_UI_CONFIG.ghostTailChars
    );
    if ((liveNodes.committed.dataset.srcHash || '') !== parts.committed) {
      liveNodes.committed.innerHTML = parts.committed ? renderMarkdownToHtml(parts.committed) : '';
      liveNodes.committed.dataset.srcHash = parts.committed;
      enhanceRenderedAnswer(liveNodes.committed);
    }
    liveNodes.tailCurrent.textContent = parts.preview || '';
    liveNodes.tailGhost.textContent = ghostTail || '';
    liveNodes.preview.classList.toggle('has-tail', Boolean(parts.preview || ghostTail));
  }

  function promisifyChrome(methodOwner, methodName, args) {
    return new Promise((resolve, reject) => {
      if (!methodOwner || typeof methodOwner[methodName] !== 'function') {
        resolve([]);
        return;
      }
      methodOwner[methodName](...(args || []), (result) => {
        if (chrome.runtime?.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(result);
      });
    });
  }

  async function getCurrentTab() {
    const tabs = await promisifyChrome(chrome.tabs, 'query', [{ active: true, currentWindow: true }]);
    return tabs?.[0] || null;
  }

  async function getPanelTabs() {
    const tabs = await promisifyChrome(chrome.tabs, 'query', [{ currentWindow: true }]);
    return (tabs || [])
      .filter((tab) => {
        if (!tab || !tab.id) {
          return false;
        }
        const url = String(tab.url || tab.pendingUrl || '');
        const title = String(tab.title || '');
        if (url === code || url.startsWith('chrome://ask-in-page') || title === name) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.active && !b.active) return -1;
        if (!a.active && b.active) return 1;
        return (b.lastAccessed || 0) - (a.lastAccessed || 0);
      })
      .slice(0, 10);
  }

  async function getCurrentTabSelection() {
    const tab = await getCurrentTab();
    if (!tab?.id) {
      return '';
    }
    const url = String(tab.url || tab.pendingUrl || '');
    if (!url || url === code || url.startsWith('chrome://ask-in-page') || url.startsWith('chrome://')) {
      return '';
    }
    const results = await promisifyChrome(chrome.scripting, 'executeScript', [{
      target: {
        tabId: tab.id,
        allFrames: true,
      },
      func: () => {
        try {
          const active = document.activeElement;
          if (
            active &&
            (active.tagName === 'TEXTAREA' ||
            (active.tagName === 'INPUT' && /^(?:text|search|url|tel|password|email)$/i.test(active.type || 'text')))
          ) {
            const start = Number(active.selectionStart);
            const end = Number(active.selectionEnd);
            if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
              return String(active.value || '').slice(start, end).trim();
            }
          }
          return String(document.getSelection?.()?.toString?.() || '').trim();
        } catch (error) {
          return '';
        }
      },
    }]);
    return (results || [])
      .map((item) => String(item?.result || '').replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .sort((a, b) => b.length - a.length)[0] || '';
  }

  async function getTabContentSnapshot(tabLike) {
    const tabId = Number(tabLike?.id || tabLike?.raw?.id);
    const url = String(tabLike?.url || tabLike?.raw?.url || tabLike?.raw?.pendingUrl || '');
    const title = String(tabLike?.title || tabLike?.raw?.title || '');
    const cacheKey = tabId + '::' + url;
    if (!tabId || !url || url === code || /^chrome:\/\//.test(url) || /^vivaldi:\/\//.test(url)) {
      logAiCompose('Tab Content Snapshot Skipped', {
        tabId,
        title,
        url,
        reason: 'unsupported-or-internal-url',
      });
      return {
        title,
        url,
        content: '',
      };
    }
    const cached = tabSnapshotCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < PERFORMANCE_CONFIG.tabSnapshotCacheTtlMs) {
      return cached.value;
    }
    try {
      const results = await promisifyChrome(chrome.scripting, 'executeScript', [{
        target: {
          tabId,
          allFrames: true,
        },
        func: () => {
          try {
            const normalizeText = (value) => String(value || '').replace(/\s+/g, ' ').trim();
            const truncate = (value, maxLength) => {
              const normalized = normalizeText(value);
              if (!normalized || normalized.length <= maxLength) {
                return normalized;
              }
              return normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd() + '...';
            };
            const ignoredSelector = [
              'script',
              'style',
              'noscript',
              'svg',
              'canvas',
              'nav',
              'header',
              'footer',
              'aside',
              'form',
              '[aria-hidden="true"]',
              '[hidden]',
              '.hidden',
              '.visually-hidden',
              '.sr-only',
              '.sidebar',
              '.nav',
              '.navigation',
              '.menu',
              '.comments',
              '.comment',
              '.related',
              '.recommend',
              '.ads',
              '.advertisement',
              '.cookie',
              '.modal',
              '.popup',
            ].join(',');
            const getMeta = (selector) => {
              const node = document.querySelector(selector);
              return normalizeText(node?.content || node?.getAttribute?.('content') || '');
            };
            const safeCssEscape = (value) => {
              try {
                return CSS?.escape ? CSS.escape(value) : value.replace(/["\\]/g, '\\$&');
              } catch (error) {
                return value;
              }
            };
            const isProbablyNoise = (el) => {
              if (!el || el.matches?.(ignoredSelector)) {
                return true;
              }
              const idAndClass = ((el.id ? ('#' + el.id + ' ') : '') + (el.className || '')).toLowerCase();
              return /(comment|footer|header|sidebar|related|promo|advert|cookie|modal|popup|breadcrumb|share)/.test(idAndClass);
            };
            const collectText = (el) => {
              if (!el || isProbablyNoise(el)) {
                return '';
              }
              const clone = el.cloneNode(true);
              clone.querySelectorAll?.(ignoredSelector)?.forEach((node) => node.remove());
              return normalizeText(clone.innerText || clone.textContent || '');
            };
            const candidates = [];
            const addCandidate = (el, label, baseScore) => {
              if (!el || candidates.some((item) => item.el === el) || isProbablyNoise(el)) {
                return;
              }
              const text = collectText(el);
              if (text.length < 200) {
                return;
              }
              const paragraphs = el.querySelectorAll?.('p')?.length || 0;
              const headings = el.querySelectorAll?.('h1, h2, h3')?.length || 0;
              const links = Array.from(el.querySelectorAll?.('a[href]') || []);
              const linkTextLength = links.reduce((sum, link) => sum + normalizeText(link.innerText || link.textContent || '').length, 0);
              const punctuationMatches = text.match(/[.!?。！？：:；;]/g) || [];
              const score = baseScore
                + Math.min(text.length, 12000) / 80
                + paragraphs * 18
                + headings * 24
                + punctuationMatches.length * 2
                - Math.min(linkTextLength, text.length) / 35;
              candidates.push({
                el,
                label,
                text,
                score,
              });
            };

            [
              ['article', 260],
              ['main', 220],
              ['[role="main"]', 220],
              ['.article', 180],
              ['.post', 180],
              ['.entry-content', 180],
              ['.post-content', 180],
              ['.article-content', 180],
              ['.markdown-body', 180],
              ['.content', 120],
            ].forEach(([selector, baseScore]) => {
              document.querySelectorAll(selector).forEach((el) => addCandidate(el, selector, baseScore));
            });

            Array.from(document.querySelectorAll('article, main, section, div'))
              .slice(0, 160)
              .forEach((el) => {
                const rect = typeof el.getBoundingClientRect === 'function' ? el.getBoundingClientRect() : null;
                if (rect && rect.width < 280) {
                  return;
                }
                addCandidate(el, el.tagName?.toLowerCase?.() || 'node', 30);
              });

            candidates.sort((a, b) => b.score - a.score);
            const bestCandidate = candidates[0] || null;
            const bodyText = collectText(document.body);
            const mainText = bestCandidate?.text || bodyText;
            const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
              .map((node) => normalizeText(node.innerText || node.textContent || ''))
              .filter(Boolean)
              .filter((value, index, arr) => arr.indexOf(value) === index)
              .slice(0, 12);
            const imageAlts = Array.from(document.querySelectorAll('img[alt]'))
              .map((node) => normalizeText(node.getAttribute('alt')))
              .filter((value) => value && value.length >= 4)
              .filter((value, index, arr) => arr.indexOf(value) === index)
              .slice(0, 12);
            const importantLinks = Array.from((bestCandidate?.el || document.body).querySelectorAll?.('a[href]') || [])
              .map((node) => {
                const text = normalizeText(node.innerText || node.textContent || '');
                const href = normalizeText(node.href || node.getAttribute('href') || '');
                return text && href ? (truncate(text, 80) + ' -> ' + truncate(href, 140)) : '';
              })
              .filter(Boolean)
              .filter((value, index, arr) => arr.indexOf(value) === index)
              .slice(0, 12);
            const jsonLd = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
              .map((node) => {
                try {
                  const parsed = JSON.parse(node.textContent || '');
                  const items = Array.isArray(parsed) ? parsed : [parsed];
                  return items.map((item) => {
                    if (!item || typeof item !== 'object') {
                      return '';
                    }
                    const authorValue = item.author;
                    const authorText = Array.isArray(authorValue)
                      ? authorValue.map((entry) => normalizeText(entry?.name || entry)).filter(Boolean).join(', ')
                      : normalizeText(authorValue?.name || authorValue || '');
                    return [
                      normalizeText(item.headline || item.name || ''),
                      normalizeText(item.description || ''),
                      authorText ? ('Author: ' + authorText) : '',
                      normalizeText(item.datePublished || item.dateCreated || ''),
                    ].filter(Boolean).join(' | ');
                  }).filter(Boolean);
                } catch (error) {
                  return [];
                }
              })
              .flat()
              .filter((value, index, arr) => arr.indexOf(value) === index)
              .slice(0, 8);

            return {
              title: document.title || '',
              url: location.href,
              frameType: window.top === window ? 'top' : 'subframe',
              metaDescription: getMeta('meta[name="description"]') || getMeta('meta[property="og:description"]') || getMeta('meta[name="twitter:description"]'),
              metaTitle: getMeta('meta[property="og:title"]') || getMeta('meta[name="twitter:title"]'),
              content: mainText,
              fullText: bodyText,
              headings,
              imageAlts,
              importantLinks,
              jsonLd,
              extractionSource: bestCandidate?.label || 'body',
            };
          } catch (error) {
            return {
              title: document.title || '',
              url: location.href,
              frameType: 'unknown',
              metaDescription: '',
              metaTitle: '',
              content: '',
              fullText: '',
              headings: [],
              imageAlts: [],
              importantLinks: [],
              jsonLd: [],
              extractionSource: 'error',
            };
          }
        },
      }]);
      const frames = (results || [])
        .map((entry) => entry?.result || null)
        .filter(Boolean);
      const topFrame = frames.find((entry) => entry.frameType === 'top') || frames[0] || {};
      const uniqueTexts = [];
      const pushUniqueText = (value, prefix) => {
        const normalized = String(value || '').replace(/\s+/g, ' ').trim();
        if (!normalized || uniqueTexts.includes(normalized)) {
          return;
        }
        uniqueTexts.push(normalized);
      };
      pushUniqueText(topFrame.content || '', 'Main');
      frames
        .filter((entry) => entry !== topFrame)
        .map((entry) => String(entry.content || '').replace(/\s+/g, ' ').trim())
        .filter((text) => text.length >= 280)
        .sort((a, b) => b.length - a.length)
        .slice(0, 3)
        .forEach((text) => pushUniqueText(text, 'Embedded Frame'));
      if (uniqueTexts.length === 0) {
        pushUniqueText(topFrame.fullText || '', 'Page');
      }
      const headings = frames
        .flatMap((entry) => Array.isArray(entry.headings) ? entry.headings : [])
        .map((value) => String(value || '').replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .filter((value, index, arr) => arr.indexOf(value) === index)
        .slice(0, 16);
      const imageAlts = frames
        .flatMap((entry) => Array.isArray(entry.imageAlts) ? entry.imageAlts : [])
        .map((value) => String(value || '').replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .filter((value, index, arr) => arr.indexOf(value) === index)
        .slice(0, 16);
      const importantLinks = frames
        .flatMap((entry) => Array.isArray(entry.importantLinks) ? entry.importantLinks : [])
        .map((value) => String(value || '').replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .filter((value, index, arr) => arr.indexOf(value) === index)
        .slice(0, 16);
      const jsonLd = frames
        .flatMap((entry) => Array.isArray(entry.jsonLd) ? entry.jsonLd : [])
        .map((value) => String(value || '').replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .filter((value, index, arr) => arr.indexOf(value) === index)
        .slice(0, 10);
      const combinedContent = truncateText(uniqueTexts.join('\n\n[Embedded Frame]\n\n'), CONTEXT_LIMITS.pageContentChars);

      logAiCompose('Tab Content Snapshot', {
        tabId,
        title: String(topFrame.title || title || ''),
        url: String(topFrame.url || url || ''),
        contentLength: combinedContent.length,
        contentPreview: truncateText(combinedContent || '', 500),
        headings,
        extractionSource: String(topFrame.extractionSource || ''),
        frameCount: frames.length,
      });
      const snapshot = {
        title: String(topFrame.metaTitle || topFrame.title || title || ''),
        url: String(topFrame.url || url || ''),
        subtitle: getHostFromUrl(String(topFrame.url || url || '')),
        metaDescription: String(topFrame.metaDescription || ''),
        headings,
        imageAlts,
        importantLinks,
        jsonLd,
        extractionSource: String(topFrame.extractionSource || ''),
        content: combinedContent,
      };
      tabSnapshotCache.set(cacheKey, {
        timestamp: Date.now(),
        value: snapshot,
      });
      return snapshot;
    } catch (error) {
      logAiCompose('Tab Content Snapshot Failed', {
        tabId,
        title,
        url,
        error: error.message || String(error),
      });
      return {
        title,
        url,
        subtitle: getHostFromUrl(url),
        metaDescription: '',
        headings: [],
        imageAlts: [],
        importantLinks: [],
        jsonLd: [],
        extractionSource: '',
        content: '',
      };
    }
  }

  async function readBlobPreview(blobLike, mimeHint) {
    const blob = blobLike instanceof Blob ? blobLike : null;
    if (!blob) {
      return '';
    }
    const mime = String(mimeHint || blob.type || '').toLowerCase();
    if (!(mime.startsWith('text/') || /json|xml|javascript|typescript|markdown|csv/.test(mime))) {
      return '';
    }
    try {
      return truncateText(await blob.text(), CONTEXT_LIMITS.filePreviewChars);
    } catch (error) {
      return '';
    }
  }

  async function getDownloadedFiles(query) {
    const items = await promisifyChrome(chrome.downloads, 'search', [{
      query: query || '',
      exists: true,
      state: 'complete',
      orderBy: ['-startTime'],
      limit: 20,
    }]);
    return items || [];
  }

  async function getClipboardFiles() {
    const clipboardFiles = [];
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (!type.startsWith('image/') && !type.startsWith('text/')) {
            continue;
          }
          const blob = await item.getType(type);
          const extension = (type.split('/')[1] || 'bin').replace('plain', 'txt');
          clipboardFiles.push({
            id: 'clipboard-' + clipboardFiles.length,
            fileName: 'Clipboard.' + extension,
            filename: 'Clipboard.' + extension,
            fileSize: blob.size,
            mime: type,
            category: 'clipboard',
            blob,
          });
        }
      }
    } catch (error) {
      return [];
    }
    return clipboardFiles;
  }

  function pickLocalFile() {
    return new Promise((resolve) => {
      const input = createElement('input', {
        type: 'file',
        style: {
          position: 'fixed',
          left: '-9999px',
          top: '-9999px',
          opacity: '0',
          pointerEvents: 'none',
        },
      }, document.body);
      input.addEventListener('change', () => {
        const file = input.files?.[0];
        input.remove();
        if (!file) {
          resolve(null);
          return;
        }
        resolve({
          id: 'picked-' + Date.now(),
          fileName: file.name,
          filename: file.name,
          fileSize: file.size,
          mime: file.type || 'application/octet-stream',
          category: 'picked-file',
          rawFile: file,
        });
      }, { once: true });
      if (typeof input.showPicker === 'function') {
        input.showPicker();
      } else {
        input.click();
      }
    });
  }

  function getHostFromUrl(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch (error) {
      return url || '';
    }
  }

  function formatBytes(size) {
    if (!Number.isFinite(size) || size <= 0) {
      return '';
    }
    const units = ['B', 'KB', 'MB', 'GB'];
    let value = size;
    let index = 0;
    while (value >= 1024 && index < units.length - 1) {
      value /= 1024;
      index++;
    }
    return (value >= 10 || index === 0 ? Math.round(value) : value.toFixed(1)) + ' ' + units[index];
  }

  function formatDate(dateText) {
    if (!dateText) {
      return '';
    }
    const date = new Date(dateText);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return new Intl.DateTimeFormat('zh-CN', {
      month: 'numeric',
      day: 'numeric',
    }).format(date);
  }

  function buildMarkup() {
    return `
      <div class="ask-in-page-shell" role="main">
        <header class="ask-top-bar">
          <button class="ask-btn-new" type="button" title="新建对话" aria-label="新建对话">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </button>
          <span class="ask-version-badge">${uiVersion}</span>
        </header>
        <div class="ask-messages" id="askMessages">
          <div class="ask-empty" id="askEmpty">
            <svg class="ask-empty-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span class="ask-empty-text">向当前页面提问</span>
          </div>
        </div>
        <nav class="ask-commands-row" id="askCommandsRow" aria-label="快捷命令">
          <button class="ask-btn-cmd" type="button" data-cmd="Analyze">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Analyze
          </button>
          <button class="ask-btn-cmd" type="button" data-cmd="Summarize">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            Summarize
          </button>
          <button class="ask-btn-cmd" type="button" data-cmd="Explain">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.75c.62.46 1 1.17 1 1.93V17h6v-.32c0-.76.38-1.47 1-1.93A7 7 0 0 0 12 2z"/>
            </svg>
            Explain
          </button>
        </nav>
        <div class="ask-input-area">
          <div class="ask-suggestion-dropdown" id="askSuggestionDropdown" aria-hidden="true">
            <div class="ask-suggestion-search">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <span class="ask-suggestion-search-text" id="askSuggestionSearchText">@</span>
            </div>
            <div class="ask-suggestion-body" id="askSuggestionBody"></div>
          </div>
          <div class="ask-input-box" id="askInputBox">
            <div class="ask-edit-banner hidden" id="askEditBanner">
              <div class="ask-edit-copy">
                <div class="ask-edit-title">Editing</div>
                <div class="ask-edit-subtitle">Responses after edited messages will be overwritten</div>
              </div>
              <button class="ask-edit-close" id="askEditClose" type="button" title="取消编辑">×</button>
            </div>
            <div class="ask-input-context" id="askInputContext">
              <div class="ask-context-track">
              <div class="ask-context-card ask-ref-chip" id="askContextCard">
                <div class="ask-ref-chip-icon" id="askContextFavicon">A</div>
                <div class="ask-ref-chip-info">
                  <div class="ask-ref-chip-title" id="askContextTitle">当前页面</div>
                  <div class="ask-ref-chip-subtitle" id="askContextUrl"></div>
                </div>
                <button class="ask-context-close ask-chip-close" id="askContextClose" type="button" title="关闭">×</button>
              </div>
              <div class="ask-context-card ask-context-card-selection ask-ref-chip hidden" id="askSelectionCard">
                <div class="ask-ref-chip-icon ask-context-favicon-selection" id="askSelectionFavicon">AI</div>
                <div class="ask-ref-chip-info">
                  <div class="ask-ref-chip-title" id="askSelectionTitle"></div>
                  <div class="ask-ref-chip-subtitle">Selected Text</div>
                </div>
                <button class="ask-context-close ask-chip-close" id="askSelectionClose" type="button" title="关闭">×</button>
              </div>
              <div class="ask-ref-row-inline" id="askRefRowInline"></div>
              </div>
            </div>
            <div class="ask-input-main" id="askInputMain">
              <div class="ask-inline-ref-row" id="askInlineRefRow"></div>
              <div class="ask-input-field" contenteditable="true" id="askInputField" data-placeholder="向此页面提问..." spellcheck="false" role="textbox" aria-label="输入消息"></div>
            </div>
            <div class="ask-input-toolbar">
              <button class="ask-btn-tool" type="button" title="附件" aria-label="添加附件">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
              <button class="ask-btn-send" id="askBtnSend" type="button" title="发送" aria-label="发送消息">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
                </svg>
              </button>
            </div>
          </div>
          <input class="ask-hidden-file-input" id="askHiddenFileInput" type="file" tabindex="-1" aria-hidden="true">
        </div>
      </div>
    `;
  }

  function injectStyles() {
    addStyle([
      '#panels-container #panels .webpanel-stack [data-ask-in-page] { position:relative !important; display:flex !important; flex-direction:column !important; min-height:0 !important; height:100% !important; }',
      '#panels-container #panels .webpanel-stack [data-ask-in-page] header.webpanel-header { display:none !important; }',
      '#panels-container #panels .webpanel-stack [data-ask-in-page] .webpanel-content { display:none !important; visibility:hidden !important; opacity:0 !important; pointer-events:none !important; min-height:0 !important; height:0 !important; max-height:0 !important; flex:0 0 0 !important; overflow:hidden !important; }',
      '#panels-container #panels .webpanel-stack [data-ask-in-page] .ask-in-page-content { position:absolute; inset:0; display:flex; min-height:0; }',
      'button[data-name="' + webPanelId + '"] { position:relative; display:flex; align-items:center; justify-content:center; padding:0 !important; }',
      'button[data-name="' + webPanelId + '"] > img, button[data-name="' + webPanelId + '"] .button-badge, button[data-name="' + webPanelId + '"] .ToolbarButton-Button-SVG { opacity:0 !important; }',
      'button[data-name="' + webPanelId + '"]:before { position:absolute; left:50%; top:50%; width:18px; height:18px; margin:0; content:""; background-color:var(--colorFg); transform:translate(-50%,-50%); -webkit-mask-image:url(' + JSON.stringify(panelIconMask) + '); -webkit-mask-repeat:no-repeat; -webkit-mask-position:center; -webkit-mask-size:contain; mask-image:url(' + JSON.stringify(panelIconMask) + '); mask-repeat:no-repeat; mask-position:center; mask-size:contain; }',
      '.ask-in-page-content { --aip-bg:#0A0B0D; --aip-surface:#1C1F23; --aip-elevated:#2D3139; --aip-border:rgba(255,255,255,0.08); --aip-border-hover:rgba(255,255,255,0.14); --aip-accent:#33B1FF; --aip-accent-dim:rgba(51,177,255,0.12); --aip-text-primary:#FFFFFF; --aip-text-secondary:#8B949E; --aip-text-muted:#484F58; --aip-chip-bg:#3A3F47; --aip-r-xs:6px; --aip-r-sm:8px; --aip-r-md:12px; --aip-r-lg:20px; --aip-r-pill:100px; --aip-r-full:50%; --radius:var(--aip-r-sm); width:100%; height:100%; min-height:0; background:var(--aip-bg); font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; -webkit-font-smoothing:antialiased; }',
      '.ask-in-page-content *, .ask-in-page-content *::before, .ask-in-page-content *::after { box-sizing:border-box; }',
      '.ask-in-page-shell { width:100%; height:100%; display:flex; flex:1; flex-direction:column; min-height:0; background:var(--aip-bg); }',
      '.ask-top-bar { display:flex; align-items:center; padding:12px 14px 6px; flex-shrink:0; }',
      '.ask-version-badge { margin-left:auto; padding:3px 8px; border:1px solid var(--aip-border); border-radius:999px; color:var(--aip-text-secondary); background:rgba(255,255,255,0.03); font-size:11px; line-height:1; letter-spacing:.04em; }',
      '.ask-btn-new, .ask-btn-tool { width:32px; height:32px; border:none; background:transparent; color:var(--aip-text-secondary); cursor:pointer; border-radius:var(--aip-r-sm); display:flex; align-items:center; justify-content:center; transition:color .15s, background .15s; }',
      '.ask-btn-new:hover, .ask-btn-tool:hover { color:var(--aip-text-primary); background:rgba(255,255,255,0.06); }',
      '.ask-btn-new svg, .ask-btn-tool svg { width:18px; height:18px; }',
      '.ask-messages { display:flex !important; flex-direction:column !important; flex:1 1 auto !important; min-height:0 !important; overflow-y:auto !important; overflow-x:hidden !important; padding:12px 14px 0; }',
      '.ask-messages::-webkit-scrollbar, .ask-suggestion-body::-webkit-scrollbar { width:4px; }',
      '.ask-messages::-webkit-scrollbar-thumb, .ask-suggestion-body::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08); border-radius:999px; }',
      '.ask-empty { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; padding:24px 0; }',
      '.ask-empty-icon { width:40px; height:40px; color:var(--aip-text-muted); opacity:.4; }',
      '.ask-empty-text { color:var(--aip-text-muted); font-size:13px; }',
      '.ask-commands-row { display:flex; gap:6px; padding:2px 14px 10px; flex-shrink:0; overflow:hidden; max-height:40px; opacity:1; transition:max-height .24s, opacity .18s, padding-bottom .24s; }',
      '.ask-commands-row.hidden { max-height:0; opacity:0; padding-bottom:0; pointer-events:none; }',
      '.ask-btn-cmd { display:inline-flex; align-items:center; gap:5px; padding:6px 12px; background:var(--aip-chip-bg); color:var(--aip-text-secondary); border:1px solid var(--aip-border); border-radius:var(--aip-r-pill) !important; font-size:12px; font-weight:500; cursor:pointer; white-space:nowrap; transition:color .15s, background .15s, border-color .15s, transform .1s; }',
      '.ask-btn-cmd:hover { color:var(--aip-text-primary); background:rgba(255,255,255,0.08); border-color:var(--aip-border-hover); }',
      '.ask-btn-cmd:active { transform:scale(.96); }',
      '.ask-btn-cmd svg { width:13px; height:13px; flex-shrink:0; }',
      '.ask-input-area { display:block !important; flex:0 0 auto !important; flex-shrink:0 !important; margin-top:auto; padding:0 14px 16px; position:relative; z-index:20; overflow:visible !important; }',
      '.ask-input-box { background:var(--aip-surface); border:1px solid var(--aip-border); border-radius:var(--aip-r-lg); display:flex; flex-direction:column; overflow:hidden; transition:border-color .2s, box-shadow .2s; }',
      '.ask-input-box.focused { border-color:var(--aip-border-hover); box-shadow:0 0 0 3px rgba(51,177,255,0.04); }',
      '.ask-edit-banner { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; padding:12px 14px 10px; background:rgba(255,255,255,0.06); border-bottom:1px solid rgba(255,255,255,0.06); }',
      '.ask-edit-banner.hidden { display:none; }',
      '.ask-edit-copy { min-width:0; }',
      '.ask-edit-title { color:var(--aip-text-primary); font-size:13px; font-weight:700; line-height:1.3; }',
      '.ask-edit-subtitle { color:var(--aip-text-secondary); font-size:12px; line-height:1.35; margin-top:2px; }',
      '.ask-edit-close { width:24px; height:24px; border:none; background:transparent; color:var(--aip-text-secondary); border-radius:999px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:16px; line-height:1; flex-shrink:0; }',
      '.ask-edit-close:hover { color:var(--aip-text-primary); background:rgba(255,255,255,0.08); }',
      '.ask-input-context { padding:8px 8px 0 12px; overflow:hidden; }',
      '.ask-input-context.hidden { display:none; }',
      '.ask-context-track { display:flex; align-items:center; gap:8px; width:100%; padding:4px 4px 0 0; overflow:hidden; white-space:nowrap; }',
      '.ask-context-card, .ask-ref-chip { position:relative; display:flex; align-items:center; gap:10px; min-width:180px; width:180px; max-width:180px; height:52px; padding:0 18px 0 12px; border-radius:14px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.06); box-shadow:inset 0 1px 0 rgba(255,255,255,0.03); overflow:visible; flex:0 0 180px; }',
      '.ask-context-card.hidden { display:none; }',
      '.ask-context-card-selection { background:rgba(255,255,255,0.1); }',
      '.ask-ref-chip-icon { width:32px; height:32px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:14px; font-weight:700; color:#fff; background:#1A1B1E; }',
      '.ask-context-favicon-selection { background:#1B1C20; color:#9AA4AF; font-size:13px; letter-spacing:.02em; }',
      '.ask-ref-chip-info { flex:1; min-width:0; display:flex; flex-direction:column; justify-content:center; gap:2px; }',
      '.ask-ref-chip-title { color:var(--aip-text-primary); font-size:13px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1.25; }',
      '.ask-ref-chip-subtitle { color:var(--aip-text-secondary); font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1.2; }',
      '.ask-context-close, .ask-ref-chip .ask-chip-close { position:absolute; top:0; right:0; z-index:3; width:16px; height:16px; margin-top:0; border:none; background:rgba(91,97,106,0.95); color:#E2E6EA; cursor:pointer; border-radius:999px; display:flex; align-items:center; justify-content:center; font-size:12px; line-height:1; flex-shrink:0; opacity:0; pointer-events:none; box-shadow:0 2px 8px rgba(0,0,0,0.28); transform:translate(35%,-35%); transition:opacity .15s, color .15s, background .15s, transform .12s; }',
      '.ask-context-card:hover .ask-context-close, .ask-ref-chip:hover .ask-chip-close { opacity:1; pointer-events:auto; }',
      '.ask-context-close:hover, .ask-ref-chip .ask-chip-close:hover { color:var(--aip-text-primary); background:rgba(121,128,138,0.98); transform:translate(35%,-35%) scale(1.04); }',
      '.ask-input-main { display:flex; align-items:flex-start; gap:8px; padding:12px 14px 0; min-height:24px; flex-wrap:wrap; }',
      '.ask-inline-ref-row { display:none; }',
      '.ask-composer-token { display:inline-flex; align-items:center; gap:6px; min-width:0; max-width:180px; margin:0 2px; vertical-align:baseline; color:var(--aip-text-secondary); font-size:13px; line-height:1.35; border-radius:8px; user-select:none; }',
      '.ask-composer-token.focused { background:rgba(255,255,255,0.08); box-shadow:0 0 0 1.5px rgba(255,255,255,0.12); padding:2px 6px; }',
      '.ask-composer-token-icon { width:14px; height:14px; flex-shrink:0; display:flex; align-items:center; justify-content:center; color:var(--aip-accent); font-size:12px; line-height:1; }',
      '.ask-composer-token-label { min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
      '.ask-inline-ref-token { display:inline-flex; align-items:center; gap:6px; min-width:0; max-width:180px; color:var(--aip-text-secondary); font-size:13px; line-height:1.35; padding:2px 0; border-radius:8px; }',
      '.ask-inline-ref-token.focused { background:rgba(255,255,255,0.08); box-shadow:0 0 0 1.5px rgba(255,255,255,0.12); padding:2px 6px; }',
      '.ask-inline-ref-token-icon { width:14px; height:14px; flex-shrink:0; display:flex; align-items:center; justify-content:center; color:var(--aip-accent); font-size:12px; line-height:1; }',
      '.ask-inline-ref-token-label { min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
      '.ask-input-field { flex:1; min-width:0; background:transparent; border:none; outline:none; color:var(--aip-text-primary); font-size:14px; line-height:1.5; caret-color:var(--aip-accent); word-break:break-word; max-height:100px; overflow-y:auto; position:relative; }',
      '.ask-input-field.disabled { opacity:.55; pointer-events:none; }',
      '.ask-input-field:empty::before { content:attr(data-placeholder); color:var(--aip-text-muted); pointer-events:none; }',
      '.ask-cmd-chip { position:relative; display:inline-flex; align-items:center; font-size:12px; font-weight:500; user-select:none; animation:askChipPop .22s cubic-bezier(.22,1,.36,1); overflow:hidden; }',
      '.ask-ref-chip { position:relative; display:flex; align-items:center; font-size:13px; font-weight:500; user-select:none; animation:askChipPop .22s cubic-bezier(.22,1,.36,1); overflow:visible; }',
      'span.ask-cmd-chip { padding:4px 10px; background:var(--aip-chip-bg); color:var(--aip-text-secondary); border-radius:var(--radius); }',
      '.ask-cmd-chip.focused { background:var(--aip-accent-dim); box-shadow:0 0 0 1.5px var(--aip-accent); color:var(--aip-accent); }',
      '.ask-ref-row-inline { display:flex; align-items:center; gap:8px; min-width:0; padding:4px 4px 0 0; overflow:hidden; flex:0 1 auto; }',
      '.ask-cmd-chip::after, .ask-ref-chip::after { content:""; position:absolute; top:0; right:0; width:28px; height:100%; opacity:0; transition:opacity .15s; pointer-events:none; }',
      '.ask-cmd-chip::after { background:linear-gradient(to right, rgba(58,63,71,0), rgba(58,63,71,0.82) 42%, rgba(58,63,71,1) 100%); }',
      '.ask-ref-chip::after, .ask-context-card::after { background:linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.04) 42%, rgba(255,255,255,0.08) 100%); }',
      '.ask-chip-close { position:absolute; top:50%; right:4px; z-index:2; width:18px; height:18px; margin-top:-9px; border-radius:var(--aip-r-xs); display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--aip-text-muted); font-size:15px; line-height:1; opacity:0; pointer-events:auto; transition:opacity .15s, color .12s, background .12s; }',
      '.ask-cmd-chip:hover::after, .ask-ref-chip:hover::after { opacity:1; }',
      '.ask-cmd-chip:hover .ask-chip-close { opacity:1; }',
      '.ask-chip-close:hover { color:var(--aip-text-primary); background:rgba(255,255,255,0.14); }',
      '.ask-input-toolbar { display:flex; align-items:center; justify-content:space-between; padding:8px 10px 10px; }',
      '.ask-btn-send { width:32px; height:32px; border-radius:50%; border:none; background:var(--aip-accent); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:filter .15s, transform .1s; }',
      '.ask-btn-send:hover { filter:brightness(1.12); }',
      '.ask-btn-send:active { transform:scale(.9); }',
      '.ask-btn-send svg { width:14px; height:14px; }',
      '.ask-hidden-file-input { position:fixed; left:-9999px; top:-9999px; width:1px; height:1px; opacity:0; pointer-events:none; }',
      '.ask-suggestion-dropdown { position:absolute; left:14px; right:14px; bottom:calc(100% + 8px); display:none; flex-direction:column; background:rgba(21,24,29,.98); color:var(--aip-text-primary); border:1px solid var(--aip-border-hover); border-radius:16px; box-shadow:0 20px 48px rgba(0,0,0,.4); overflow:hidden; z-index:9999; opacity:0; transform:translateY(8px); pointer-events:none; transition:opacity .18s, transform .18s; }',
      '.ask-suggestion-dropdown.visible { opacity:1; transform:translateY(0); pointer-events:auto; }',
      '.ask-suggestion-search { display:flex; align-items:center; gap:8px; padding:12px 14px; border-bottom:1px solid var(--aip-border); color:var(--aip-text-secondary); font-size:13px; }',
      '.ask-suggestion-search svg { width:14px; height:14px; flex-shrink:0; }',
      '.ask-suggestion-search-text { color:var(--aip-text-primary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }',
      '.ask-suggestion-body { max-height:320px; min-height:48px; overflow-y:auto; padding:8px 0; }',
      '.ask-suggestion-section { display:block !important; flex:none !important; position:static !important; overflow:visible !important; }',
      '.ask-suggestion-section + .ask-suggestion-section { margin-top:4px; border-top:1px solid rgba(255,255,255,0.05); padding-top:4px; }',
      '.ask-suggestion-section-title { padding:6px 14px; color:var(--aip-text-secondary); font-size:11px; font-weight:600; letter-spacing:.04em; text-transform:uppercase; }',
      '.ask-suggestion-item { width:100%; border:none; background:transparent; color:inherit; display:flex; align-items:center; gap:10px; padding:10px 14px; cursor:pointer; text-align:left; transition:background .12s; }',
      '.ask-suggestion-item:hover, .ask-suggestion-item.active { background:rgba(255,255,255,0.06); }',
      '.ask-suggestion-icon { width:28px; height:28px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; overflow:hidden; background:rgba(255,255,255,0.08); color:var(--aip-text-primary); font-size:12px; font-weight:700; }',
      '.ask-suggestion-icon img { width:100%; height:100%; object-fit:cover; }',
      '.ask-suggestion-text { flex:1; min-width:0; display:flex; flex-direction:column; gap:2px; }',
      '.ask-suggestion-title { display:block; color:var(--aip-text-primary); font-size:13px; line-height:1.35; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
      '.ask-suggestion-subtitle { display:block; color:var(--aip-text-secondary); font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
      '.ask-suggestion-meta { color:var(--aip-text-muted); font-size:11px; flex-shrink:0; }',
      '.ask-suggestion-empty { padding:18px 14px; color:var(--aip-text-secondary); font-size:12px; }',
      '.ask-messages, .ask-messages * { -webkit-user-select:text !important; user-select:text !important; }',
      '.ask-msg { max-width:92%; font-size:13px; line-height:1.55; margin-bottom:12px; animation:askMsgIn .3s cubic-bezier(.22,1,.36,1); cursor:text; }',
      '.ask-turn { display:flex; flex-direction:column; align-items:flex-end; margin-bottom:12px; cursor:text; }',
      '.ask-turn-ai-slot { width:100%; display:flex; flex-direction:column; cursor:text; }',
      '.ask-turn-meta { display:flex; align-items:center; justify-content:flex-end; gap:10px; margin:4px 6px 0; min-height:18px; }',
      '.ask-turn-time { color:var(--aip-text-muted); font-size:12px; line-height:1; opacity:0; transition:opacity .14s ease; }',
      '.ask-turn-actions, .ask-turn-ai-actions { display:inline-flex; align-items:center; gap:8px; opacity:0; transition:opacity .14s ease; }',
      '.ask-turn:has(.ask-msg-user:hover, .ask-turn-meta:hover) .ask-turn-actions { opacity:1; }',
      '.ask-turn:has(.ask-msg-user:hover, .ask-turn-meta:hover) .ask-turn-time { opacity:1; }',
      '.ask-turn:has(.ask-msg-ai:hover, .ask-turn-ai-meta:hover) .ask-turn-ai-actions { opacity:1; }',
      '.ask-turn-action { width:18px; height:18px; border:none; background:transparent; color:var(--aip-text-muted); cursor:pointer; display:flex; align-items:center; justify-content:center; padding:0; }',
      '.ask-turn-action:hover { color:var(--aip-text-primary); }',
      '.ask-turn-action svg { width:14px; height:14px; stroke:currentColor; }',
      '.ask-msg-user { align-self:flex-end; background:#2A3138; color:var(--aip-text-primary); border-radius:20px; padding:10px 14px 12px; cursor:text; }',
      '.ask-msg-ref-group { display:flex; justify-content:flex-end; margin:0 0 8px; }',
      '.ask-msg-ref-stack { position:relative; display:flex; justify-content:flex-end; align-items:flex-end; width:min(100%, 520px); cursor:pointer; user-select:none; }',
      '.ask-msg-ref-stack:focus-visible { outline:none; box-shadow:0 0 0 2px rgba(51,177,255,0.28); border-radius:16px; }',
      '.ask-msg-ref-stack[aria-expanded="false"] { min-height:80px; }',
      '.ask-msg-ref-stack[aria-expanded="true"] { display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:10px; width:min(100%, 560px); }',
      '.ask-msg-ref-stack[aria-expanded="false"] .ask-msg-ref-card { position:absolute; right:0; bottom:0; width:180px; pointer-events:auto; transform-origin:right bottom; transition:transform .18s ease, box-shadow .18s ease; }',
      '.ask-msg-ref-stack[aria-expanded="false"] .ask-msg-ref-card[data-stack-index="0"] { transform:translate(-8px, -22px) scale(.84) rotate(12deg); z-index:1; }',
      '.ask-msg-ref-stack[aria-expanded="false"] .ask-msg-ref-card[data-stack-index="1"] { transform:translate(-4px, -11px) scale(.92) rotate(6deg); z-index:2; }',
      '.ask-msg-ref-stack[aria-expanded="false"] .ask-msg-ref-card[data-stack-index="2"] { transform:translate(0, 0) scale(1) rotate(0deg); z-index:3; }',
      '.ask-msg-ref-stack[aria-expanded="false"][data-card-count="1"] { min-height:52px; }',
      '.ask-msg-ref-stack[aria-expanded="false"][data-card-count="1"] .ask-msg-ref-card[data-stack-index="0"] { position:relative; width:180px; transform:none; }',
      '.ask-msg-ref-stack[aria-expanded="false"][data-card-count="2"] { min-height:70px; }',
      '.ask-msg-ref-stack[aria-expanded="false"][data-card-count="2"] .ask-msg-ref-card[data-stack-index="0"] { transform:translate(-4px, -18px) scale(.9) rotate(5deg); z-index:1; }',
      '.ask-msg-ref-stack[aria-expanded="false"][data-card-count="2"] .ask-msg-ref-card[data-stack-index="1"] { transform:translate(0, 0) scale(1) rotate(0deg); z-index:2; }',
      '.ask-msg-ref-stack[aria-expanded="true"] .ask-msg-ref-card { position:relative; width:100%; }',
      '.ask-msg-ref-stack[aria-expanded="true"] .ask-msg-ref-card { max-width:none; }',
      '.ask-msg-ref-stack:hover .ask-msg-ref-card[data-stack-index="0"] { transform:translate(-8px, -22px) scale(.84) rotate(16deg); }',
      '.ask-msg-ref-stack:hover .ask-msg-ref-card[data-stack-index="1"] { transform:translate(-4px, -11px) scale(.92) rotate(9deg); }',
      '.ask-msg-ref-stack[aria-expanded="false"][data-card-count="2"]:hover .ask-msg-ref-card[data-stack-index="0"] { transform:translate(-4px, -18px) scale(.9) rotate(9deg); }',
      '.ask-msg-ref-stack[aria-expanded="false"][data-card-count="2"]:hover .ask-msg-ref-card[data-stack-index="1"] { transform:translate(0, 0) scale(1) rotate(0deg); }',
      '.ask-msg-ref-stack[aria-expanded="true"]:hover .ask-msg-ref-card { transform:none; }',
      '.ask-msg-ref-card { position:relative; display:flex; align-items:center; gap:10px; min-width:0; width:180px; max-width:180px; height:52px; padding:0 12px; border-radius:14px; background:#31363D; border:1px solid rgba(255,255,255,0.06); box-shadow:inset 0 1px 0 rgba(255,255,255,0.03), 0 10px 24px rgba(0,0,0,0.2); overflow:hidden; opacity:1; }',
      '.ask-msg-ref-card-icon { width:32px; height:32px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:14px; font-weight:700; color:#fff; background:#1A1B1E; }',
      '.ask-msg-ref-card-info { flex:1; min-width:0; display:flex; flex-direction:column; justify-content:center; gap:2px; }',
      '.ask-msg-ref-card-title { color:var(--aip-text-primary); font-size:13px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1.25; }',
      '.ask-msg-ref-card-subtitle { color:var(--aip-text-secondary); font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1.2; }',
      '.ask-msg-ref-more { position:absolute; right:-2px; bottom:-6px; z-index:4; min-width:26px; height:26px; padding:0 8px; border-radius:999px; display:flex; align-items:center; justify-content:center; background:rgba(10,11,13,0.92); border:1px solid rgba(255,255,255,0.08); color:var(--aip-text-primary); font-size:11px; font-weight:700; box-shadow:0 8px 20px rgba(0,0,0,0.35); }',
      '.ask-msg-ref-stack[aria-expanded="true"] .ask-msg-ref-more { display:none; }',
      '.ask-msg-cmd-tag { display:inline-flex; align-items:center; gap:6px; padding:6px 12px; border-radius:999px; font-size:12px; font-weight:600; background:rgba(255,255,255,0.14); color:var(--aip-text-primary); }',
      '.ask-msg-inline-refs { display:inline-flex; align-items:center; gap:8px; min-width:0; flex-wrap:wrap; }',
      '.ask-msg-inline-ref { display:inline-flex; align-items:center; gap:6px; min-width:0; max-width:180px; color:rgba(255,255,255,0.72); font-size:13px; line-height:1.35; cursor:text; }',
      '.ask-msg-inline-ref-icon { width:14px; height:14px; flex-shrink:0; display:flex; align-items:center; justify-content:center; color:var(--aip-accent); font-size:12px; line-height:1; }',
      '.ask-msg-inline-ref-label { min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
      '.ask-msg-user-body { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }',
      '.ask-msg-text { color:var(--aip-text-primary); font-size:13px; cursor:text; white-space:pre-wrap; }',
      '.ask-msg-ai { align-self:stretch; width:100%; max-width:none; color:var(--aip-text-primary); cursor:text; }',
      '.ask-msg-ai-processing { display:flex; flex-direction:column; gap:10px; margin:6px 0 10px; }',
      '.ask-msg-ai-processing.hidden { display:none; }',
      '.ask-msg-ai-thinking { color:var(--aip-text-secondary); font-weight:600; background:linear-gradient(90deg, currentColor 0%, currentColor 42%, rgba(0,0,0,0.08) 46.5%, rgba(0,0,0,0.30) 50%, rgba(0,0,0,0.08) 53.5%, currentColor 58%, currentColor 100%); background-size:185% 100%; -webkit-background-clip:text; -webkit-text-fill-color:transparent; animation:askThinkingShimmer 5.1s infinite linear; }',
      '.ask-msg-ai-reading { display:flex; align-items:center; gap:8px; color:var(--aip-text-secondary); font-weight:600; }',
      '.ask-msg-ai-reading-list { display:flex; flex-direction:column; gap:8px; margin:0 0 12px; }',
      '.ask-msg-ai-reading-pill { display:flex; align-items:center; gap:8px; max-width:240px; padding:8px 12px; border-radius:999px; background:rgba(255,255,255,0.08); color:var(--aip-text-secondary); }',
      '.ask-msg-ai-reading-pill-icon { color:var(--aip-accent); font-size:14px; line-height:1; flex-shrink:0; }',
      '.ask-msg-ai-reading-pill-text { min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-size:12px; }',
      '.ask-msg-ai-thought-wrap { display:none; margin:0 0 10px; }',
      '.ask-msg-ai-thought-wrap.has-content { display:block; }',
      '.ask-msg-ai-thought { display:inline-flex; align-items:center; gap:8px; padding:2px 6px; border:none; border-radius:8px; background:transparent; color:rgba(255,255,255,0.62); font-weight:600; margin:0; cursor:default; transition:background .14s ease, color .14s ease; }',
      '.ask-msg-ai-thought.has-content { cursor:pointer; }',
      '.ask-msg-ai-thought.has-content:hover { background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.82); }',
      '.ask-msg-ai-thought-panel { display:none; margin-top:8px; padding:10px 12px; border-radius:12px; background:rgba(255,255,255,0.05); color:var(--aip-text-secondary); white-space:pre-wrap; line-height:1.6; font-size:13px; cursor:text; }',
      '.ask-msg-ai-thought-wrap[aria-expanded="true"] .ask-msg-ai-thought-panel { display:block; }',
      '.ask-msg-ai-thought-arrow { color:var(--aip-text-secondary); display:inline-flex; align-items:center; justify-content:center; transition:transform .18s ease, color .14s ease; transform-origin:center; }',
      '.ask-msg-ai-thought-wrap[aria-expanded="true"] .ask-msg-ai-thought-arrow { transform:rotate(90deg); }',
      '.ask-msg-ai-answer { font-size:15px; line-height:1.75; color:var(--aip-text-primary); }',
      '.ask-msg-ai-answer-live { white-space:pre-wrap; word-break:break-word; }',
      '.ask-msg-ai-answer-committed { color:var(--aip-text-primary); }',
      '.ask-msg-ai-answer-committed > :first-child { margin-top:0; }',
      '.ask-msg-ai-answer-committed > :last-child { margin-bottom:0; }',
      '.ask-msg-ai-answer-preview { display:block; position:relative; white-space:pre-wrap; word-break:break-word; transition:opacity .08s linear; }',
      '.ask-msg-ai-answer-preview:not(.has-tail) { display:none; }',
      '.ask-msg-ai-answer-preview.has-tail { min-height:2.4em; -webkit-mask-image:linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.55) 68%, rgba(0,0,0,0) 100%); mask-image:linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.55) 68%, rgba(0,0,0,0) 100%); }',
      '.ask-msg-ai-answer-tail-current { color:var(--aip-text-primary); }',
      '.ask-msg-ai-answer-tail-ghost { color:var(--aip-text-primary); opacity:.38; transition:opacity .08s linear; }',
      '.ask-msg-ai-answer > :first-child { margin-top:0; }',
      '.ask-msg-ai-answer > :last-child { margin-bottom:0; }',
      '.ask-msg-ai-answer p, .ask-msg-ai-answer ul, .ask-msg-ai-answer ol, .ask-msg-ai-answer blockquote, .ask-msg-ai-answer pre, .ask-msg-ai-answer table, .ask-msg-ai-answer h1, .ask-msg-ai-answer h2, .ask-msg-ai-answer h3, .ask-msg-ai-answer h4, .ask-msg-ai-answer hr { margin:0 0 12px; }',
      '.ask-msg-ai-answer h1, .ask-msg-ai-answer h2, .ask-msg-ai-answer h3, .ask-msg-ai-answer h4 { line-height:1.3; letter-spacing:-0.01em; }',
      '.ask-msg-ai-answer h1 { font-size:1.6em; font-weight:800; }',
      '.ask-msg-ai-answer h2 { font-size:1.32em; font-weight:760; }',
      '.ask-msg-ai-answer h3 { font-size:1.14em; font-weight:700; }',
      '.ask-msg-ai-answer h4 { font-size:1em; font-weight:680; color:rgba(255,255,255,0.9); }',
      '.ask-msg-ai-answer hr { border:none; border-top:1px solid rgba(255,255,255,0.08); }',
      '.ask-msg-ai-answer ul { padding-left:20px; list-style:disc outside !important; }',
      '.ask-msg-ai-answer ol { padding-left:20px; list-style:decimal outside !important; }',
      '.ask-msg-ai-answer ul ul { list-style:circle outside !important; }',
      '.ask-msg-ai-answer ul ul ul { list-style:square outside !important; }',
      '.ask-msg-ai-answer li { display:list-item !important; }',
      '.ask-msg-ai-answer li + li { margin-top:4px; }',
      '.ask-msg-ai-answer mark { padding:0 .24em; border-radius:4px; background:rgba(255,230,120,0.28); color:var(--aip-text-primary); }',
      '.ask-msg-ai-answer code { font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:.92em; padding:.14em .34em; border-radius:6px; background:rgba(255,255,255,0.08); }',
      '.ask-msg-ai-answer pre { position:relative; overflow:auto; padding:40px 14px 12px; border-radius:12px; background:rgba(255,255,255,0.06); }',
      '.ask-msg-ai-answer pre code { padding:0; background:transparent; }',
      '.ask-code-copy { position:absolute; top:10px; right:10px; z-index:5; border:none; border-radius:8px; padding:4px 8px; background:rgba(255,255,255,0.08); color:var(--aip-text-secondary); cursor:pointer; font-size:12px; line-height:1; pointer-events:auto; }',
      '.ask-code-copy:hover { background:rgba(255,255,255,0.14); color:var(--aip-text-primary); }',
      '.ask-code-keyword { color:#7CC7FF; }',
      '.ask-code-string { color:#E7B97A; }',
      '.ask-code-number { color:#9FE3A2; }',
      '.ask-code-key { color:#C59BFF; }',
      '.ask-msg-ai-answer blockquote { padding-left:12px; border-left:2px solid rgba(255,255,255,0.12); color:rgba(255,255,255,0.78); }',
      '.ask-msg-ai-answer a { color:var(--aip-accent); text-decoration:none; }',
      '.ask-msg-ai-answer a:hover { text-decoration:underline; }',
      '.ask-msg-ai-answer table { width:100%; border-collapse:collapse; border-spacing:0; overflow:hidden; border:1px solid rgba(255,255,255,0.12); border-radius:12px; }',
      '.ask-msg-ai-answer th, .ask-msg-ai-answer td { padding:8px 10px; text-align:left; vertical-align:top; border:1px solid rgba(255,255,255,0.12); }',
      '.ask-msg-ai-answer thead th { background:rgba(255,255,255,0.06); font-weight:700; }',
      '.ask-msg-ai-answer tbody tr:nth-child(even) td { background:rgba(255,255,255,0.02); }',
      '.ask-task-item { list-style:none !important; display:flex !important; align-items:flex-start; gap:8px; margin-left:-18px; }',
      '.ask-task-box { width:16px; height:16px; margin-top:2px; border-radius:5px; border:1px solid rgba(255,255,255,0.18); display:inline-flex; align-items:center; justify-content:center; flex-shrink:0; color:var(--aip-bg); font-size:12px; line-height:1; }',
      '.ask-task-box.checked { background:var(--aip-accent); border-color:var(--aip-accent); }',
      '.ask-task-content { min-width:0; flex:1; }',
      '.ask-latex-inline code, .ask-latex-block code { font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-style:italic; }',
      '.ask-latex-block { margin:0 0 12px; padding:10px 12px; border-radius:12px; background:rgba(255,255,255,0.05); overflow:auto; }',
      '.ask-msg-ai-error { color:#FF9B9B; font-size:14px; line-height:1.6; }',
      '.ask-turn-ai-meta { display:flex; align-items:center; justify-content:flex-start; gap:10px; margin:4px 0 0; min-height:18px; width:100%; }',
      '@keyframes askChipPop { from { opacity:0; transform:scale(.8); } to { opacity:1; transform:scale(1); } }',
      '@keyframes askMsgIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }',
      '@keyframes askThinkingShimmer { 0% { background-position:120% 0; } 100% { background-position:-18% 0; } }',
    ], 'ask-in-page-styles');
  }

  function getCaretOffset(element) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return element.textContent.length;
    }
    const range = selection.getRangeAt(0);
    if (!element.contains(range.endContainer)) {
      return element.textContent.length;
    }
    const preRange = range.cloneRange();
    preRange.selectNodeContents(element);
    preRange.setEnd(range.endContainer, range.endOffset);
    return preRange.toString().length;
  }

  function setCaret(element, offset) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(true);
    let remaining = Math.max(0, Math.min(offset, element.textContent.length));
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
    let node = walker.nextNode();
    while (node) {
      if (remaining <= node.textContent.length) {
        range.setStart(node, remaining);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        return;
      }
      remaining -= node.textContent.length;
      node = walker.nextNode();
    }
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function normalizeTab(tab) {
    const title = tab.title || tab.pendingUrl || tab.url || '未命名标签页';
    const url = tab.url || tab.pendingUrl || '';
    const host = getHostFromUrl(url);
    return {
      id: 'tab-' + tab.id,
      kind: 'tab',
      group: 'Tabs',
      title,
      subtitle: host,
      iconText: title.slice(0, 1).toUpperCase(),
      iconUrl: tab.favIconUrl || '',
      color: '#2D3139',
      raw: tab,
    };
  }

  function normalizeFile(file) {
    const fileName = (file.filename || '').split(/[\\/]/).pop() || '未命名文件';
    return {
      id: 'file-' + file.id,
      kind: 'file',
      group: 'Files',
      title: fileName,
      subtitle: file.filename || '',
      meta: [formatBytes(file.fileSize || 0), formatDate(file.startTime || file.endTime)].filter(Boolean).join(' · '),
      iconText: fileName.slice(0, 1).toUpperCase(),
      color: '#3A3F47',
      raw: file,
    };
  }

  function initPanelState(root) {
    root.innerHTML = buildMarkup();
    const state = {
      root,
      messages: root.querySelector('#askMessages'),
      empty: root.querySelector('#askEmpty'),
      commandsRow: root.querySelector('#askCommandsRow'),
      inputBox: root.querySelector('#askInputBox'),
      editBanner: root.querySelector('#askEditBanner'),
      editClose: root.querySelector('#askEditClose'),
      inputContext: root.querySelector('#askInputContext'),
      contextCard: root.querySelector('#askContextCard'),
      refRowInline: root.querySelector('#askRefRowInline'),
      inlineRefRow: root.querySelector('#askInlineRefRow'),
      selectionCard: root.querySelector('#askSelectionCard'),
      selectionClose: root.querySelector('#askSelectionClose'),
      selectionTitle: root.querySelector('#askSelectionTitle'),
      inputMain: root.querySelector('#askInputMain'),
      inputField: root.querySelector('#askInputField'),
      btnSend: root.querySelector('#askBtnSend'),
      btnTool: root.querySelector('.ask-btn-tool'),
      btnNew: root.querySelector('.ask-btn-new'),
      ctxFavicon: root.querySelector('#askContextFavicon'),
      ctxTitle: root.querySelector('#askContextTitle'),
      ctxUrl: root.querySelector('#askContextUrl'),
      ctxClose: root.querySelector('#askContextClose'),
      suggestionDropdown: root.querySelector('#askSuggestionDropdown'),
      suggestionBody: root.querySelector('#askSuggestionBody'),
      suggestionSearchText: root.querySelector('#askSuggestionSearchText'),
      activeCmd: null,
      cmdChipEl: null,
      cmdChipFocused: false,
      refs: [],
      nextRefId: 1,
      suggestionToken: null,
      suggestionItems: [],
      suggestionSelectedIndex: 0,
      suggestionMode: null,
      currentContext: null,
      contextCardVisible: true,
      selectedText: '',
      selectionPollId: null,
      focusedComposerTokenKey: null,
      editingTurnId: null,
      nextTurnId: 1,
      pendingAiTasks: new Map(),
      currentStreamingTurnId: null,
      isBusy: false,
      scrollAnimationFrame: null,
    };

    function setSendButtonMode(mode) {
      if (mode === 'stop') {
        state.btnSend.title = '终止输出';
        state.btnSend.setAttribute('aria-label', '终止输出');
        state.btnSend.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><rect x="6" y="6" width="12" height="12" rx="2.5" fill="#000000"/></svg>';
        return;
      }
      state.btnSend.title = '发送';
      state.btnSend.setAttribute('aria-label', '发送消息');
      state.btnSend.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>';
    }

    function syncBusyState() {
      state.isBusy = state.pendingAiTasks.size > 0;
      setSendButtonMode(state.isBusy ? 'stop' : 'send');
      state.inputField.contentEditable = state.isBusy ? 'false' : 'true';
      state.inputField.setAttribute('aria-disabled', state.isBusy ? 'true' : 'false');
      state.inputField.classList.toggle('disabled', state.isBusy);
      state.btnTool.disabled = state.isBusy;
      state.commandsRow.style.pointerEvents = state.isBusy ? 'none' : '';
    }

    function animateScrollToBottom(duration) {
      const startTop = state.messages.scrollTop;
      const endTop = state.messages.scrollHeight - state.messages.clientHeight;
      if (endTop <= startTop) {
        return;
      }
      if (state.scrollAnimationFrame) {
        cancelAnimationFrame(state.scrollAnimationFrame);
      }
      const startedAt = performance.now();
      const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      const step = (now) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        state.messages.scrollTop = startTop + (endTop - startTop) * easeInOut(progress);
        if (progress < 1) {
          state.scrollAnimationFrame = requestAnimationFrame(step);
        } else {
          state.scrollAnimationFrame = null;
        }
      };
      state.scrollAnimationFrame = requestAnimationFrame(step);
    }

    function scrollToBottom(options) {
      const settings = Object.assign({ smooth: false }, options || {});
      if (settings.smooth) {
        animateScrollToBottom(420);
        return;
      }
      state.messages.scrollTop = state.messages.scrollHeight;
    }

    function formatMessageTime() {
      return new Date().toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    }

    function serializeSequenceParts(parts) {
      return parts.map((part) => {
        if (part.type === 'text') {
          return part.text;
        }
        return '[[aip:' + encodeURIComponent(JSON.stringify({
          key: part.key || '',
          kind: part.kind || '',
          title: part.title || '',
          iconText: part.iconText || '',
          refId: part.refId || '',
        })) + ']]';
      }).join('');
    }

    function serializeMessagePayload(parts, activeCmd) {
      const cmd = activeCmd ? '[[aip-cmd:' + encodeURIComponent(activeCmd) + ']]' : '';
      return cmd + serializeSequenceParts(parts);
    }

    function syncCommandsRow() {
      state.commandsRow.classList.toggle('hidden', Boolean(state.activeCmd));
    }

    function syncEditingBanner() {
      state.editBanner.classList.toggle('hidden', !state.editingTurnId);
    }

    function getComposerReferenceItems() {
      const items = [];
      if (state.contextCardVisible && state.currentContext) {
        items.push({
          key: 'context',
          kind: 'context',
          iconText: state.currentContext.iconText || 'A',
          title: state.currentContext.title,
        });
      }
      if (state.selectedText) {
        items.push({
          key: 'selection',
          kind: 'selection',
          iconText: 'AI',
          title: state.selectedText,
        });
      }
      state.refs.forEach((ref) => {
        items.push({
          key: 'ref:' + ref.id,
          kind: ref.kind,
          iconText: ref.kind === 'file' ? 'D' : (ref.iconText || ref.title.slice(0, 1).toUpperCase()),
          title: ref.title,
          refId: ref.id,
        });
      });
      return items;
    }

    function isSuggestionAlreadySelected(item) {
      if (!item) {
        return false;
      }
      if (item.kind === 'context') {
        const currentContextId = String(state.currentContext?.id || state.currentContext?.raw?.id || '');
        const itemId = String(item.id || item.raw?.id || '');
        const currentSubtitle = String(state.currentContext?.subtitle || '');
        return state.contextCardVisible && (
          (currentContextId && itemId && currentContextId === itemId) ||
          (currentSubtitle && item.subtitle && currentSubtitle === item.subtitle)
        );
      }
      return state.refs.some((ref) => {
        const sameRefId = ref.id && item.id && ('ref:' + ref.id === item.id || ref.id === item.id);
        const sameTitle = ref.title === item.title;
        const sameSubtitle = String(ref.subtitle || '') === String(item.subtitle || '');
        return sameRefId || (sameTitle && sameSubtitle);
      });
    }

    function syncInlineReferenceTokens() {
      state.inlineRefRow.innerHTML = '';
    }

    function renderReferenceCards() {
      state.refRowInline.innerHTML = '';
      state.refs.forEach((ref) => {
        const chip = document.createElement('div');
        chip.className = 'ask-ref-chip';
        chip.dataset.refId = ref.id;
        const icon = document.createElement('span');
        icon.className = 'ask-ref-chip-icon';
        icon.textContent = ref.kind === 'file' ? 'D' : ref.iconText;
        const info = document.createElement('span');
        info.className = 'ask-ref-chip-info';
        const title = document.createElement('span');
        title.className = 'ask-ref-chip-title';
        title.textContent = ref.title;
        const subtitle = document.createElement('span');
        subtitle.className = 'ask-ref-chip-subtitle';
        subtitle.textContent = ref.kind === 'file'
          ? ((ref.title.split('.').pop() || '').toLowerCase() || 'file')
          : (ref.subtitle || '');
        info.append(title, subtitle);
        const close = document.createElement('button');
        close.type = 'button';
        close.className = 'ask-context-close ask-chip-close';
        close.textContent = '×';
        ['pointerdown', 'mousedown', 'click'].forEach((eventName) => {
          close.addEventListener(eventName, (event) => {
            event.preventDefault();
            event.stopPropagation();
          });
        });
        close.addEventListener('click', (event) => {
          event.preventDefault();
          removeReference(ref.id);
        });
        chip.append(icon, info, close);
        state.refRowInline.append(chip);
      });
    }

    function getComposerTokenEntries() {
      const entries = [];
      if (state.activeCmd && state.cmdChipEl) {
        entries.push({
          key: 'cmd',
          el: state.cmdChipEl,
          remove: () => removeCommand(),
        });
      }
      getComposerTokenNodes().forEach((el) => {
        const item = {
          key: el.dataset.tokenKey,
          refId: el.dataset.refId,
        };
        entries.push({
          key: item.key,
          el,
          remove: () => {
            if (item.key === 'context') {
              setContextCardVisible(false);
              return;
            }
            if (item.key === 'selection') {
              setSelectedText('');
              return;
            }
            if (item.refId) {
              removeReference(item.refId);
            }
          },
        });
      });
      return entries;
    }

    function clearFocusedComposerToken() {
      state.focusedComposerTokenKey = null;
      state.cmdChipFocused = false;
      state.cmdChipEl?.classList.remove('focused');
      state.inputField.querySelectorAll('.ask-composer-token.focused').forEach((node) => {
        node.classList.remove('focused');
      });
    }

    function clearComposer(options) {
      const settings = Object.assign({
        showDefaultContext: false,
        keepEditing: false,
      }, options || {});
      clearFocusedComposerToken();
      state.inputField.innerHTML = '';
      state.inlineRefRow.innerHTML = '';
      if (state.activeCmd) {
        removeCommand();
      }
      state.refs = [];
      state.selectedText = '';
      state.selectionTitle.textContent = '';
      state.contextCardVisible = Boolean(settings.showDefaultContext);
      syncReferenceStrip();
      hideSuggestions();
      if (!settings.keepEditing) {
        state.editingTurnId = null;
        syncEditingBanner();
      }
    }

    function restoreComposerFromSerialized(serialized, activeCmd) {
      clearComposer({ showDefaultContext: false, keepEditing: true });
      if (activeCmd) {
        selectCommand(activeCmd);
      }
      if (serialized) {
        insertSerializedComposerText(serialized);
        syncStateFromComposerDom();
      }
      state.inputField.focus();
    }

    async function copyTextToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
      } catch (error) {}
    }

    function focusComposerTokenByIndex(index) {
      const entries = getComposerTokenEntries();
      clearFocusedComposerToken();
      const entry = entries[index];
      if (!entry) {
        state.inputField.focus();
        return;
      }
      state.focusedComposerTokenKey = entry.key;
      if (entry.key === 'cmd') {
        state.cmdChipFocused = true;
        state.cmdChipEl?.classList.add('focused');
      } else {
        entry.el.classList.add('focused');
      }
    }

    function moveComposerTokenFocus(step) {
      const entries = getComposerTokenEntries();
      if (!entries.length) {
        return false;
      }
      const currentIndex = entries.findIndex((entry) => entry.key === state.focusedComposerTokenKey);
      if (currentIndex === -1) {
        return false;
      }
      const nextIndex = currentIndex + step;
      if (nextIndex < 0 || nextIndex >= entries.length) {
        clearFocusedComposerToken();
        state.inputField.focus();
        return true;
      }
      focusComposerTokenByIndex(nextIndex);
      return true;
    }

    function isCaretAtComposerStart() {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        return false;
      }
      const range = selection.getRangeAt(0);
      if (!range.collapsed || !state.inputField.contains(range.startContainer)) {
        return false;
      }
      if (range.startContainer === state.inputField) {
        return range.startOffset === 0;
      }
      if (range.startContainer.nodeType === Node.TEXT_NODE) {
        return range.startOffset === 0 && !range.startContainer.previousSibling;
      }
      return false;
    }

    function getAdjacentComposerTokenEntry(direction) {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        return null;
      }
      const range = selection.getRangeAt(0);
      if (!range.collapsed || !state.inputField.contains(range.startContainer)) {
        return null;
      }
      let container = range.startContainer;
      let offset = range.startOffset;
      let candidate = null;

      if (container === state.inputField) {
        candidate = state.inputField.childNodes[direction < 0 ? offset - 1 : offset] || null;
      } else if (container.nodeType === Node.TEXT_NODE) {
        if (direction < 0) {
          if (offset > 0) {
            return null;
          }
          candidate = container.previousSibling;
        } else {
          if (offset < (container.textContent || '').length) {
            return null;
          }
          candidate = container.nextSibling;
        }
      } else if (container instanceof HTMLElement && container.classList.contains('ask-composer-token')) {
        candidate = direction < 0 ? container.previousSibling : container.nextSibling;
      } else {
        candidate = container.childNodes[direction < 0 ? offset - 1 : offset] || null;
      }

      while (candidate && candidate.nodeType === Node.TEXT_NODE && !(candidate.textContent || '').length) {
        candidate = direction < 0 ? candidate.previousSibling : candidate.nextSibling;
      }
      if (!(candidate instanceof HTMLElement) || !candidate.classList.contains('ask-composer-token')) {
        return null;
      }
      return {
        key: candidate.dataset.tokenKey,
        el: candidate,
        remove: () => {
          const key = candidate.dataset.tokenKey || '';
          if (key === 'context') {
            setContextCardVisible(false);
            return;
          }
          if (key === 'selection') {
            setSelectedText('');
            return;
          }
          const refId = candidate.dataset.refId || '';
          if (refId) {
            removeReference(refId);
          }
        },
      };
    }

    function createComposerTokenElement(item) {
      const token = document.createElement('span');
      token.className = 'ask-composer-token';
      token.contentEditable = 'false';
      token.dataset.tokenKey = item.key;
      token.dataset.tokenKind = item.kind;
      token.dataset.tokenTitle = item.title;
      token.dataset.tokenIcon = item.iconText || '';
      if (item.refId) {
        token.dataset.refId = item.refId;
      }
      const icon = document.createElement('span');
      icon.className = 'ask-composer-token-icon';
      icon.textContent = item.iconText || '';
      const label = document.createElement('span');
      label.className = 'ask-composer-token-label';
      label.textContent = item.title;
      token.append(icon, label);
      return token;
    }

    function placeCaretAfterNode(node) {
      const range = document.createRange();
      const selection = window.getSelection();
      range.setStartAfter(node);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      state.inputField.focus();
    }

    function placeCaretInTextNode(node, offset) {
      if (!node || node.nodeType !== Node.TEXT_NODE) {
        state.inputField.focus();
        return;
      }
      const range = document.createRange();
      const selection = window.getSelection();
      range.setStart(node, Math.max(0, Math.min(offset, (node.textContent || '').length)));
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      state.inputField.focus();
    }

    function insertNodeAtComposerCaret(node) {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || !state.inputField.contains(selection.anchorNode)) {
        state.inputField.appendChild(node);
        placeCaretAfterNode(node);
        return;
      }
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(node);
      placeCaretAfterNode(node);
    }

    function getComposerTokenNodes() {
      return Array.from(state.inputField.querySelectorAll('.ask-composer-token'));
    }

    function findComposerTokenNode(key) {
      return state.inputField.querySelector('.ask-composer-token[data-token-key="' + key + '"]');
    }

    function syncComposerTokenDom() {
      const existingContext = findComposerTokenNode('context');
      if (state.contextCardVisible && state.currentContext) {
        if (!existingContext) {
          const token = createComposerTokenElement({
            key: 'context',
            kind: 'context',
            iconText: state.currentContext.iconText || 'A',
            title: state.currentContext.title,
          });
          state.inputField.prepend(token);
        } else {
          existingContext.dataset.tokenTitle = state.currentContext.title;
          existingContext.dataset.tokenIcon = state.currentContext.iconText || 'A';
          existingContext.querySelector('.ask-composer-token-icon').textContent = state.currentContext.iconText || 'A';
          existingContext.querySelector('.ask-composer-token-label').textContent = state.currentContext.title;
        }
      } else if (existingContext) {
        existingContext.remove();
      }

      const existingSelection = findComposerTokenNode('selection');
      if (state.selectedText) {
        if (!existingSelection) {
          const token = createComposerTokenElement({
            key: 'selection',
            kind: 'selection',
            iconText: 'AI',
            title: state.selectedText,
          });
          state.inputField.appendChild(token);
        } else {
          existingSelection.dataset.tokenTitle = state.selectedText;
          existingSelection.querySelector('.ask-composer-token-label').textContent = state.selectedText;
        }
      } else if (existingSelection) {
        existingSelection.remove();
      }
    }

    function getComposerSequenceParts() {
      const parts = [];
      state.inputField.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          if (node.textContent) {
            parts.push({
              type: 'text',
              text: node.textContent,
            });
          }
          return;
        }
        if (!(node instanceof HTMLElement)) {
          return;
        }
        if (node.classList.contains('ask-composer-token')) {
          parts.push({
            type: 'ref',
            key: node.dataset.tokenKey,
            kind: node.dataset.tokenKind,
            title: node.dataset.tokenTitle || '',
            iconText: node.dataset.tokenIcon || '',
            refId: node.dataset.refId || '',
          });
        }
      });
      return parts;
    }

    function syncStateFromComposerDom() {
      const tokenNodes = getComposerTokenNodes();
      const hasContextToken = tokenNodes.some((node) => node.dataset.tokenKey === 'context');
      const selectionToken = tokenNodes.find((node) => node.dataset.tokenKey === 'selection');
      const nextSelectedText = selectionToken?.dataset.tokenTitle || '';
      const presentRefIds = tokenNodes
        .map((node) => node.dataset.refId || '')
        .filter(Boolean);
      const refsChanged = presentRefIds.length !== state.refs.length || state.refs.some((ref) => !presentRefIds.includes(ref.id));
      const contextChanged = state.contextCardVisible !== hasContextToken;
      const selectionChanged = state.selectedText !== nextSelectedText;
      if (!refsChanged && !contextChanged && !selectionChanged) {
        return;
      }
      state.contextCardVisible = hasContextToken;
      state.selectedText = nextSelectedText;
      state.selectionTitle.textContent = state.selectedText;
      state.refs = state.refs.filter((ref) => presentRefIds.includes(ref.id));
      syncReferenceStrip();
    }

    function serializeComposerFragment(fragment) {
      let output = '';
      Array.from(fragment.childNodes).forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          output += node.textContent || '';
          return;
        }
        if (!(node instanceof HTMLElement)) {
          return;
        }
        if (node.classList.contains('ask-composer-token')) {
          const payload = encodeURIComponent(JSON.stringify({
            key: node.dataset.tokenKey || '',
            kind: node.dataset.tokenKind || '',
            title: node.dataset.tokenTitle || '',
            iconText: node.dataset.tokenIcon || '',
            refId: node.dataset.refId || '',
          }));
          output += '[[aip:' + payload + ']]';
          return;
        }
        output += serializeComposerFragment(node);
      });
      return output;
    }

    function insertSerializedComposerText(text) {
      const cmdMatch = text.match(/^\[\[aip-cmd:([^\]]+)]]/);
      if (cmdMatch) {
        try {
          selectCommand(decodeURIComponent(cmdMatch[1]));
        } catch (error) {}
        text = text.slice(cmdMatch[0].length);
      }
      const pattern = /\[\[aip:([^[\]]+)]]/g;
      let lastIndex = 0;
      let match;
      while ((match = pattern.exec(text))) {
        const plain = text.slice(lastIndex, match.index);
        if (plain) {
          insertNodeAtComposerCaret(document.createTextNode(plain));
        }
        try {
          const payload = JSON.parse(decodeURIComponent(match[1]));
          if (payload?.key === 'context') {
            setContextCardVisible(true);
          } else if (payload?.key === 'selection') {
            setSelectedText(payload.title || '');
          } else if (payload?.refId) {
            const existing = state.refs.find((ref) => ref.id === payload.refId);
            if (!existing) {
              state.refs.push({
                id: payload.refId,
                kind: payload.kind,
                title: payload.title || '',
                subtitle: '',
                meta: '',
                iconText: payload.iconText || '',
                source: payload.kind,
              });
            }
            insertNodeAtComposerCaret(createComposerTokenElement(payload));
          }
        } catch (error) {}
        lastIndex = pattern.lastIndex;
      }
      const trailing = text.slice(lastIndex);
      if (trailing) {
        insertNodeAtComposerCaret(document.createTextNode(trailing));
      }
      syncReferenceStrip();
    }

    function syncReferenceStrip() {
      const hasRefs = state.refs.length > 0;
      const hasSelectedText = Boolean(state.selectedText);
      state.contextCard.classList.toggle('hidden', !state.contextCardVisible);
      state.selectionCard.classList.toggle('hidden', !hasSelectedText);
      state.inputContext.classList.toggle('hidden', !state.contextCardVisible && !hasRefs && !hasSelectedText);
      renderReferenceCards();
      syncInlineReferenceTokens();
      syncComposerTokenDom();
    }

    function setContextCardVisible(visible) {
      if (!visible && state.focusedComposerTokenKey === 'context') {
        clearFocusedComposerToken();
      }
      state.contextCardVisible = visible;
      syncReferenceStrip();
    }

    function setContextFromTab(tab) {
      if (!tab) {
        return;
      }
      const normalized = normalizeTab(tab);
      state.currentContext = normalized;
      state.ctxFavicon.textContent = normalized.iconText || 'A';
      state.ctxFavicon.style.background = normalized.color;
      state.ctxTitle.textContent = normalized.title;
      state.ctxUrl.textContent = normalized.subtitle || normalized.raw?.url || '';
      syncReferenceStrip();
    }

    async function syncContext() {
      try {
        setContextFromTab(await getCurrentTab());
      } catch (error) {
        if (!state.currentContext) {
          setContextFromTab({
            title: '当前页面',
            url: '',
          });
        }
      }
    }

    function setSelectedText(text) {
      const normalized = String(text || '').replace(/\s+/g, ' ').trim().slice(0, 140);
      if (normalized === state.selectedText) {
        return;
      }
      if (!normalized && state.focusedComposerTokenKey === 'selection') {
        clearFocusedComposerToken();
      }
      state.selectedText = normalized;
      state.selectionTitle.textContent = normalized;
      syncReferenceStrip();
    }

    async function syncSelectedText() {
      try {
        setSelectedText(await getCurrentTabSelection());
      } catch (error) {
        setSelectedText('');
      }
    }

    function startSelectionPolling() {
      if (state.selectionPollId) {
        clearInterval(state.selectionPollId);
      }
      state.selectionPollId = window.setInterval(() => {
        if (document.hidden || state.isBusy || !panelRoot?.isConnected) {
          return;
        }
        syncSelectedText();
      }, PERFORMANCE_CONFIG.selectionPollIntervalMs);
    }

    function isInputEmpty() {
      return Array.from(state.inputField.childNodes)
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent || '')
        .join('')
        .replace(/[\s\u200B\uFEFF]/g, '').length === 0;
    }

    function hideSuggestions() {
      state.suggestionItems = [];
      state.suggestionToken = null;
      state.suggestionSelectedIndex = 0;
      state.suggestionMode = null;
      state.suggestionDropdown.style.display = 'none';
      state.suggestionDropdown.classList.remove('visible');
      state.suggestionDropdown.setAttribute('aria-hidden', 'true');
      state.suggestionBody.innerHTML = '';
    }

    function showSuggestions() {
      state.suggestionDropdown.style.display = 'flex';
      state.suggestionDropdown.classList.add('visible');
      state.suggestionDropdown.setAttribute('aria-hidden', 'false');
    }

    function createMessageReferenceStack(cards) {
      if (!cards.length) {
        return null;
      }
      const group = document.createElement('div');
      group.className = 'ask-msg-ref-group';
      const stack = document.createElement('div');
      stack.className = 'ask-msg-ref-stack';
      stack.setAttribute('role', 'button');
      stack.setAttribute('tabindex', '0');
      stack.setAttribute('aria-expanded', 'false');
      stack.dataset.cardCount = String(cards.length);
      const collapsedCards = cards.slice(0, Math.min(cards.length, 3));
      collapsedCards.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'ask-msg-ref-card';
        cardEl.dataset.stackIndex = String(index);
        const icon = document.createElement('div');
        icon.className = 'ask-msg-ref-card-icon';
        icon.textContent = card.iconText;
        const info = document.createElement('div');
        info.className = 'ask-msg-ref-card-info';
        const title = document.createElement('div');
        title.className = 'ask-msg-ref-card-title';
        title.textContent = card.title;
        const subtitle = document.createElement('div');
        subtitle.className = 'ask-msg-ref-card-subtitle';
        subtitle.textContent = card.subtitle;
        info.append(title, subtitle);
        cardEl.append(icon, info);
        stack.appendChild(cardEl);
      });
      if (cards.length > 3) {
        const more = document.createElement('div');
        more.className = 'ask-msg-ref-more';
        more.textContent = '+' + (cards.length - 3);
        stack.appendChild(more);
      }
      const setExpanded = (expanded) => {
        stack.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        if (expanded) {
          stack.innerHTML = '';
          cards.forEach((card) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'ask-msg-ref-card';
            const icon = document.createElement('div');
            icon.className = 'ask-msg-ref-card-icon';
            icon.textContent = card.iconText;
            const info = document.createElement('div');
            info.className = 'ask-msg-ref-card-info';
            const title = document.createElement('div');
            title.className = 'ask-msg-ref-card-title';
            title.textContent = card.title;
            const subtitle = document.createElement('div');
            subtitle.className = 'ask-msg-ref-card-subtitle';
            subtitle.textContent = card.subtitle;
            info.append(title, subtitle);
            cardEl.append(icon, info);
            stack.appendChild(cardEl);
          });
        } else {
          stack.innerHTML = '';
          collapsedCards.forEach((card, index) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'ask-msg-ref-card';
            cardEl.dataset.stackIndex = String(index);
            const icon = document.createElement('div');
            icon.className = 'ask-msg-ref-card-icon';
            icon.textContent = card.iconText;
            const info = document.createElement('div');
            info.className = 'ask-msg-ref-card-info';
            const title = document.createElement('div');
            title.className = 'ask-msg-ref-card-title';
            title.textContent = card.title;
            const subtitle = document.createElement('div');
            subtitle.className = 'ask-msg-ref-card-subtitle';
            subtitle.textContent = card.subtitle;
            info.append(title, subtitle);
            cardEl.append(icon, info);
            stack.appendChild(cardEl);
          });
          if (cards.length > 3) {
            const more = document.createElement('div');
            more.className = 'ask-msg-ref-more';
            more.textContent = '+' + (cards.length - 3);
            stack.appendChild(more);
          }
        }
      };
      const toggleExpanded = () => {
        const nextExpanded = stack.getAttribute('aria-expanded') !== 'true';
        setExpanded(nextExpanded);
      };
      stack.addEventListener('click', toggleExpanded);
      stack.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggleExpanded();
        }
      });
      group.appendChild(stack);
      return group;
    }

    function createTurnData() {
      const sequenceParts = getComposerSequenceParts();
      const text = sequenceParts.filter((part) => part.type === 'text').map((part) => part.text).join('').trim();
      const commandDefinition = getCommandDefinition(state.activeCmd);
      const contextSnapshot = state.contextCardVisible && state.currentContext
        ? {
          kind: 'context',
          title: state.currentContext.title,
          subtitle: state.currentContext.subtitle || '',
          iconText: state.currentContext.iconText || 'A',
          raw: state.currentContext.raw || state.currentContext,
        }
        : null;
      const selectedTextSnapshot = state.selectedText
        ? {
          kind: 'selection',
          title: state.selectedText,
          subtitle: 'Selected Text',
          iconText: 'AI',
        }
        : null;
      const refSnapshots = state.refs.map((ref) => ({
        id: ref.id,
        kind: ref.kind,
        title: ref.title,
        subtitle: ref.subtitle || '',
        meta: ref.meta || '',
        iconText: ref.kind === 'file' ? 'D' : (ref.iconText || ref.title.slice(0, 1).toUpperCase()),
        raw: ref.raw || null,
        rawBlob: ref.rawBlob || null,
        rawFile: ref.rawFile || null,
        mime: ref.mime || '',
      }));
      const headerCards = [];
      if (contextSnapshot) {
        headerCards.push({
          kind: contextSnapshot.kind,
          title: contextSnapshot.title,
          subtitle: contextSnapshot.subtitle,
          iconText: contextSnapshot.iconText,
        });
      }
      if (selectedTextSnapshot) {
        headerCards.push({
          kind: selectedTextSnapshot.kind,
          title: selectedTextSnapshot.title,
          subtitle: selectedTextSnapshot.subtitle,
          iconText: selectedTextSnapshot.iconText,
        });
      }
      refSnapshots.forEach((ref) => {
        headerCards.push({
          kind: ref.kind,
          title: ref.title,
          subtitle: ref.kind === 'file'
            ? ((ref.title.split('.').pop() || '').toLowerCase() || 'file')
            : (ref.subtitle || ''),
          iconText: ref.kind === 'file' ? 'D' : (ref.iconText || ref.title.slice(0, 1).toUpperCase()),
        });
      });
      const aiReadItems = [];
      if (contextSnapshot) {
        aiReadItems.push({
          kind: contextSnapshot.kind,
          title: contextSnapshot.title,
        });
      }
      if (selectedTextSnapshot) {
        aiReadItems.push({
          kind: selectedTextSnapshot.kind,
          title: selectedTextSnapshot.title,
        });
      }
      refSnapshots.forEach((ref) => {
        aiReadItems.push({
          kind: ref.kind,
          title: ref.title,
        });
      });
      return {
        id: state.editingTurnId || ('turn-' + state.nextTurnId++),
        activeCmd: state.activeCmd,
        activeCmdPrompt: commandDefinition?.prompt || '',
        sequenceParts,
        text,
        contextSnapshot,
        selectedTextSnapshot,
        refSnapshots,
        headerCards,
        aiReadItems,
        fileRefs: refSnapshots.filter((ref) => ref.kind === 'file'),
        timestamp: formatMessageTime(),
        serialized: serializeMessagePayload(sequenceParts, state.activeCmd),
        aiReplyText: '',
        aiReasoningText: '',
        apiUserMessage: '',
        apiUserMessages: [],
      };
    }

    function findTurnNode(turnId) {
      return state.messages.querySelector('.ask-turn[data-turn-id="' + turnId + '"]');
    }

    function clearPendingAiTask(turnId) {
      const task = state.pendingAiTasks.get(turnId);
      if (!task) {
        return;
      }
      try {
        task.abortController?.abort?.();
      } catch (error) {}
      if (task.timeoutId) {
        clearTimeout(task.timeoutId);
      }
      state.pendingAiTasks.delete(turnId);
      if (state.currentStreamingTurnId === turnId) {
        state.currentStreamingTurnId = null;
      }
      syncBusyState();
    }

    function removeTurnsAfter(turnNode) {
      if (!turnNode) {
        return;
      }
      let next = turnNode.nextElementSibling;
      while (next) {
        const current = next;
        next = next.nextElementSibling;
        const removedTurnId = current.dataset.turnId;
        if (removedTurnId) {
          clearPendingAiTask(removedTurnId);
        }
        current.remove();
      }
    }

    function createAiMessageScaffold(turnData) {
      const aiMsg = document.createElement('div');
      aiMsg.className = 'ask-msg ask-msg-ai';
      const processing = document.createElement('div');
      processing.className = 'ask-msg-ai-processing';
      const thinking = document.createElement('div');
      thinking.className = 'ask-msg-ai-thinking';
      thinking.textContent = 'Thinking...';
      processing.appendChild(thinking);
      if (turnData.aiReadItems.length) {
        const reading = document.createElement('div');
        reading.className = 'ask-msg-ai-reading';
        reading.innerHTML = '<span>@</span><span>Reading ' + turnData.aiReadItems.length + ' attachments</span>';
        processing.appendChild(reading);
        const list = document.createElement('div');
        list.className = 'ask-msg-ai-reading-list';
        turnData.aiReadItems.forEach((ref) => {
          const pill = document.createElement('div');
          pill.className = 'ask-msg-ai-reading-pill';
          const icon = document.createElement('span');
          icon.className = 'ask-msg-ai-reading-pill-icon';
          icon.textContent = ref.kind === 'file' ? 'D' : (ref.kind === 'selection' ? 'AI' : '◦');
          const label = document.createElement('span');
          label.className = 'ask-msg-ai-reading-pill-text';
          label.textContent = ref.title;
          pill.append(icon, label);
          list.appendChild(pill);
        });
        processing.appendChild(list);
      }
      const thoughtWrap = document.createElement('div');
      thoughtWrap.className = 'ask-msg-ai-thought-wrap';
      thoughtWrap.setAttribute('aria-expanded', 'false');
      const thoughtButton = document.createElement('button');
      thoughtButton.type = 'button';
      thoughtButton.className = 'ask-msg-ai-thought';
      thoughtButton.innerHTML = '<span>Thought for 0 seconds</span><span class="ask-msg-ai-thought-arrow">›</span>';
      const thoughtPanel = document.createElement('div');
      thoughtPanel.className = 'ask-msg-ai-thought-panel';
      thoughtWrap.append(thoughtButton, thoughtPanel);
      thoughtButton.addEventListener('click', () => {
        if (!thoughtWrap.dataset.hasReasoning) {
          return;
        }
        thoughtWrap.setAttribute('aria-expanded', thoughtWrap.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
      });
      const answer = document.createElement('div');
      answer.className = 'ask-msg-ai-answer';
      aiMsg.append(processing, thoughtWrap, answer);
      return {
        aiMsg,
        processing,
        thinking,
        thoughtWrap,
        thoughtButton,
        thoughtPanel,
        answer,
      };
    }

    async function buildTurnAttachments(turnData) {
      const attachmentTasks = [];
      if (turnData.contextSnapshot) {
        attachmentTasks.push((async () => {
          const snapshot = await getTabContentSnapshot(turnData.contextSnapshot.raw || turnData.contextSnapshot);
          return {
            kind: 'current-page',
            title: snapshot.title || turnData.contextSnapshot.title,
            subtitle: snapshot.subtitle || getHostFromUrl(snapshot.url || turnData.contextSnapshot.raw?.url || ''),
            url: snapshot.url || turnData.contextSnapshot.raw?.url || '',
            metaDescription: snapshot.metaDescription || '',
            headings: snapshot.headings || [],
            imageAlts: snapshot.imageAlts || [],
            importantLinks: snapshot.importantLinks || [],
            jsonLd: snapshot.jsonLd || [],
            extractionSource: snapshot.extractionSource || '',
            content: snapshot.content || '',
          };
        })());
      }
      if (turnData.selectedTextSnapshot) {
        attachmentTasks.push(Promise.resolve({
          kind: 'selected-text',
          title: truncateText(turnData.selectedTextSnapshot.title, 120),
          subtitle: 'Selected Text',
          content: turnData.selectedTextSnapshot.title,
        }));
      }
      (turnData.refSnapshots || []).forEach((ref) => {
        if (ref.kind === 'file') {
          attachmentTasks.push((async () => ({
            kind: 'file',
            title: ref.title,
            subtitle: ref.subtitle || ref.meta || 'file',
            content: await readBlobPreview(ref.rawBlob || ref.rawFile || ref.raw, ref.mime || ref.raw?.mime || ref.raw?.type),
          }))());
          return;
        }
        attachmentTasks.push((async () => {
          const snapshot = await getTabContentSnapshot(ref.raw || ref);
          return {
            kind: 'referenced-page',
            title: snapshot.title || ref.title,
            subtitle: snapshot.subtitle || getHostFromUrl(snapshot.url || ref.raw?.url || ref.subtitle || ''),
            url: snapshot.url || ref.raw?.url || '',
            metaDescription: snapshot.metaDescription || '',
            headings: snapshot.headings || [],
            imageAlts: snapshot.imageAlts || [],
            importantLinks: snapshot.importantLinks || [],
            jsonLd: snapshot.jsonLd || [],
            extractionSource: snapshot.extractionSource || '',
            content: snapshot.content || '',
          };
        })());
      });
      const results = await Promise.allSettled(attachmentTasks);
      return results
        .filter((entry) => entry.status === 'fulfilled' && entry.value)
        .map((entry) => entry.value);
    }

    function buildUserTurnPayload(turnData, attachments) {
      const commandBlock = turnData.activeCmd && turnData.activeCmdPrompt
        ? [
          'Command:',
          '/' + turnData.activeCmd,
          '',
          'Command instruction:',
          turnData.activeCmdPrompt,
        ].join('\n')
        : '';
      const attachmentBlock = attachments.map((item) => {
        if (item.kind === 'current-page') {
          return [
            '[Current Webpage]',
            'Title: ' + item.title,
            'URL: ' + item.url,
            item.metaDescription ? ('Meta Description: ' + item.metaDescription) : '',
            item.headings?.length ? ('Headings:\n- ' + item.headings.join('\n- ')) : '',
            item.jsonLd?.length ? ('Structured Data:\n- ' + item.jsonLd.join('\n- ')) : '',
            item.imageAlts?.length ? ('Image Alts:\n- ' + item.imageAlts.join('\n- ')) : '',
            item.importantLinks?.length ? ('Important Links:\n- ' + item.importantLinks.join('\n- ')) : '',
            item.extractionSource ? ('Extraction Source: ' + item.extractionSource) : '',
            item.content ? 'Main Content:\n' + item.content : 'Main Content: (unavailable)',
          ].filter(Boolean).join('\n');
        }
        if (item.kind === 'selected-text') {
          return [
            '[Selected Text]',
            item.content,
          ].join('\n');
        }
        if (item.kind === 'referenced-page') {
          return [
            '[Referenced Webpage]',
            'Title: ' + item.title,
            item.url ? ('URL: ' + item.url) : '',
            item.metaDescription ? ('Meta Description: ' + item.metaDescription) : '',
            item.headings?.length ? ('Headings:\n- ' + item.headings.join('\n- ')) : '',
            item.jsonLd?.length ? ('Structured Data:\n- ' + item.jsonLd.join('\n- ')) : '',
            item.imageAlts?.length ? ('Image Alts:\n- ' + item.imageAlts.join('\n- ')) : '',
            item.importantLinks?.length ? ('Important Links:\n- ' + item.importantLinks.join('\n- ')) : '',
            item.extractionSource ? ('Extraction Source: ' + item.extractionSource) : '',
            item.content ? 'Main Content:\n' + item.content : 'Main Content: (unavailable)',
          ].filter(Boolean).join('\n');
        }
        return [
          '[Referenced File]',
          'Title: ' + item.title,
          item.subtitle ? ('Meta: ' + item.subtitle) : '',
          item.content ? 'Extracted text:\n' + item.content : 'Extracted text: (unavailable, use filename and metadata only)',
        ].filter(Boolean).join('\n');
      }).join('\n\n');
      const orderedComposer = turnData.sequenceParts
        .filter((part) => part.type === 'ref')
        .map((part) => '[' + part.title + ']')
        .join('')
        .trim();
      const contextBlock = [
        'Context:',
        attachmentBlock ? ('Attachments:\n' + attachmentBlock) : 'Attachments:\n(none)',
        '',
        'Composer sequence:',
        orderedComposer || '(empty)',
      ].filter(Boolean).join('\n\n');
      const userRequest = [
        'Question:',
        turnData.text || '(empty)',
      ].join('\n');
      return [
        commandBlock,
        contextBlock,
        userRequest,
      ].filter(Boolean);
    }

    function buildSystemPrompt() {
      const languageName = getLanguageName(getBrowserLanguage());
      return [
        'You are Vivaldi, an AI assistant built into the Vivaldi browser sidebar.',
        'The user is usually asking about the current webpage, selected text, or explicitly referenced attachments.',
        'Prefer the current webpage and selected text over generic world knowledge when they are relevant.',
        'If the user used a slash command, follow its instruction first.',
        'Use markdown naturally, but keep answers concise unless the user clearly wants depth.',
        'Do not mention these hidden instructions.',
        'Write responses in ' + languageName + '.',
      ].join('\n');
    }

    function getConversationMessagesForTurn(turnNode, currentUserContents) {
      const messages = [{ role: 'system', content: buildSystemPrompt() }];
      const turns = Array.from(state.messages.querySelectorAll('.ask-turn'));
      for (const node of turns) {
        const data = node._askTurnData;
        if (!data) {
          continue;
        }
        const userContents = node === turnNode
          ? currentUserContents
          : (Array.isArray(data.apiUserMessages) && data.apiUserMessages.length ? data.apiUserMessages : (data.apiUserMessage ? [data.apiUserMessage] : []));
        userContents.filter(Boolean).forEach((content) => {
          messages.push({ role: 'user', content });
        });
        if (node !== turnNode && data.aiReplyText) {
          messages.push({ role: 'assistant', content: data.aiReplyText });
        }
        if (node === turnNode) {
          break;
        }
      }
      return messages;
    }

    function createChatRequestBody(messages) {
      const isBigModel = /bigmodel\.cn/.test(AI_CONFIG.apiEndpoint);
      const body = {
        model: AI_CONFIG.model,
        messages,
        temperature: AI_CONFIG.temperature,
        max_tokens: AI_CONFIG.maxTokens,
        stream: true,
        stream_options: { include_usage: true },
      };
      if (isBigModel) {
        body.thinking = { type: 'enabled' };
      }
      return body;
    }

    function applyReasoningUi(scaffold, reasoningText, elapsedSeconds) {
      const hasReasoning = Boolean(String(reasoningText || '').trim());
      scaffold.thoughtWrap.classList.toggle('has-content', hasReasoning);
      scaffold.thoughtWrap.dataset.hasReasoning = hasReasoning ? 'true' : '';
      scaffold.thoughtButton.classList.toggle('has-content', Boolean(reasoningText));
      scaffold.thoughtButton.querySelector('span').textContent = 'Thought for ' + Math.max(1, elapsedSeconds) + ' seconds';
      scaffold.thoughtPanel.textContent = reasoningText || '';
      if (!hasReasoning) {
        scaffold.thoughtWrap.setAttribute('aria-expanded', 'false');
      }
    }

    function finalizeThoughtUi(scaffold, reasoningText, elapsedSeconds) {
      scaffold.processing.classList.add('hidden');
      applyReasoningUi(scaffold, reasoningText, elapsedSeconds);
    }

    function ensureLiveAnswerNodes(answerNode) {
      let live = answerNode.querySelector('.ask-msg-ai-answer-live');
      let committed = live?.querySelector('.ask-msg-ai-answer-committed');
      let preview = live?.querySelector('.ask-msg-ai-answer-preview');
      let tailCurrent = preview?.querySelector('.ask-msg-ai-answer-tail-current');
      let tailGhost = preview?.querySelector('.ask-msg-ai-answer-tail-ghost');
      if (!live || !committed || !preview || !tailCurrent || !tailGhost) {
        answerNode.innerHTML = '';
        live = document.createElement('div');
        live.className = 'ask-msg-ai-answer-live';
        committed = document.createElement('div');
        committed.className = 'ask-msg-ai-answer-committed';
        preview = document.createElement('div');
        preview.className = 'ask-msg-ai-answer-preview';
        tailCurrent = document.createElement('span');
        tailCurrent.className = 'ask-msg-ai-answer-tail-current';
        tailGhost = document.createElement('span');
        tailGhost.className = 'ask-msg-ai-answer-tail-ghost';
        preview.append(tailCurrent, tailGhost);
        live.append(committed, preview);
        answerNode.appendChild(live);
      }
      return { live, committed, preview, tailCurrent, tailGhost };
    }

    function wait(ms) {
      return new Promise((resolve) => window.setTimeout(resolve, ms));
    }

    async function playAnswerText(scaffold, turnId, fullText) {
      const normalized = cleanModelText(fullText).trim();
      scaffold.answer.innerHTML = '';
      if (!normalized) {
        return '';
      }
      const liveNodes = ensureLiveAnswerNodes(scaffold.answer);
      const charsPerSecond = 118;
      const previewLength = 10;
      const statefulTask = state.pendingAiTasks.get(turnId);
      let visibleLength = 0;
      let carry = 0;
      let lastTick = 0;
      let lastScrollAt = 0;
      await wait(220);
      if (state.pendingAiTasks.get(turnId)?.stoppedByUser || statefulTask?.stoppedByUser) {
        return '';
      }
      return await new Promise((resolve) => {
        const step = (timestamp) => {
          const task = state.pendingAiTasks.get(turnId) || statefulTask;
          if (task?.stoppedByUser) {
            liveNodes.preview.textContent = '';
            resolve(normalized.slice(0, visibleLength).trim());
            return;
          }
          if (!lastTick) {
            lastTick = timestamp;
          }
          const elapsed = timestamp - lastTick;
          lastTick = timestamp;
          carry += (elapsed / 1000) * charsPerSecond;
          let nextLength = visibleLength;
          while (carry >= 1 && nextLength < normalized.length) {
            carry -= 1;
            nextLength += 1;
            const currentChar = normalized[nextLength - 1];
            if (/[，。！？；：,.!?;:]\s*$/.test(currentChar || '')) {
              carry = Math.max(carry - 0.05, 0);
            } else if (currentChar === '\n') {
              carry = Math.max(carry - 0.03, 0);
            }
          }
          if (nextLength !== visibleLength) {
            visibleLength = nextLength;
            liveNodes.committed.textContent = normalized.slice(0, visibleLength);
            liveNodes.preview.textContent = normalized.slice(visibleLength, Math.min(normalized.length, visibleLength + previewLength));
            if (timestamp - lastScrollAt > 90 || visibleLength === normalized.length) {
              lastScrollAt = timestamp;
              scrollToBottom();
            }
          }
          if (visibleLength >= normalized.length) {
            liveNodes.committed.textContent = normalized;
            liveNodes.preview.textContent = '';
            resolve(normalized);
            return;
          }
          requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }

    function stopStreamingOutput() {
      if (!state.currentStreamingTurnId) {
        return;
      }
      const turnNode = findTurnNode(state.currentStreamingTurnId);
      const task = state.pendingAiTasks.get(state.currentStreamingTurnId);
      if (task) {
        task.stoppedByUser = true;
        try {
          task.abortController?.abort?.();
        } catch (error) {}
      }
      turnNode?.querySelector('.ask-msg-ai-processing')?.classList.add('hidden');
      const answerNode = turnNode?.querySelector('.ask-msg-ai-answer');
      if (answerNode && !answerNode.textContent.trim()) {
        answerNode.textContent = 'Stopped.';
      }
    }

    function openAtSuggestions(query) {
      if (state.isBusy) {
        return;
      }
      const safeQuery = String(query || '');
      state.suggestionSearchText.textContent = '@' + safeQuery;
      state.suggestionBody.innerHTML = '<div class="ask-suggestion-empty">正在准备建议项...</div>';
      showSuggestions();
      loadAtSuggestions(safeQuery);
      state.inputField.focus();
    }

    function openReferenceSuggestions() {
      state.suggestionToken = null;
      openAtSuggestions('');
    }

    async function streamAiForTurn(turnNode, turnData) {
      clearPendingAiTask(turnData.id);
      state.currentStreamingTurnId = turnData.id;
      const aiSlot = turnNode.querySelector('.ask-turn-ai-slot');
      aiSlot.innerHTML = '';
      const scaffold = createAiMessageScaffold(turnData);
      aiSlot.appendChild(scaffold.aiMsg);
      syncBusyState();
      scrollToBottom({ smooth: true });

      if (!AI_CONFIG.apiKey) {
        scaffold.processing.classList.add('hidden');
        scaffold.answer.classList.add('ask-msg-ai-error');
        scaffold.answer.textContent = 'AI API key 尚未配置，请先在 AskInPage.js 的 AI_CONFIG 中填写 apiKey。';
        return;
      }

      const attachments = await buildTurnAttachments(turnData);
      const currentUserMessages = buildUserTurnPayload(turnData, attachments);
      turnData.apiUserMessages = currentUserMessages.slice();
      turnData.apiUserMessage = currentUserMessages.join('\n\n');
      turnNode._askTurnData = turnData;
      const messages = getConversationMessagesForTurn(turnNode, currentUserMessages);
      const body = createChatRequestBody(messages);
      if (ASK_IN_PAGE_DEBUG) {
        const compiledPrompt = messages.map((message, index) => [
          '# Message ' + (index + 1),
          'role: ' + message.role,
          message.content,
        ].join('\n')).join('\n\n');
        logAiCompose('Compose Payload', {
          turnId: turnData.id,
          activeCommand: turnData.activeCmd || '(none)',
          browserLanguage: getBrowserLanguage(),
          responseLanguage: getLanguageName(getBrowserLanguage()),
          sequenceParts: turnData.sequenceParts,
          headerCards: turnData.headerCards,
          aiReadItems: turnData.aiReadItems,
          attachments,
          currentUserContent: currentUserMessages.join('\n\n'),
          currentUserMessages,
          messages,
          compiledPrompt,
          requestBody: body,
          requestBodyJson: JSON.stringify(body, null, 2),
          endpoint: maskApiEndpoint(AI_CONFIG.apiEndpoint),
        });
      }
      const abortController = new AbortController();
      const timeoutId = window.setTimeout(() => abortController.abort(), AI_CONFIG.timeout);
      state.pendingAiTasks.set(turnData.id, { abortController, timeoutId });
      syncBusyState();
      const startedAt = Date.now();
      let answerText = '';
      let reasoningText = '';
      let rawResponseBody = '';
      const thinkingStreamState = createThinkingStreamState();
      let displayedLength = 0;
      let playbackCarry = 0;
      let playbackLastTick = 0;
      let playbackLastScrollAt = 0;
      let playbackFrameId = 0;
      let playbackStartAt = 0;
      let playbackFinished = false;
      let streamCompleted = false;
      let resolvePlaybackDone = null;
      const playbackDone = new Promise((resolve) => {
        resolvePlaybackDone = resolve;
      });

      function finishPlaybackWithCurrentText() {
        if (playbackFinished) {
          return;
        }
        playbackFinished = true;
        playbackFrameId = 0;
        displayedLength = answerText.length;
        renderStreamingMarkdown(scaffold.answer, answerText, answerText);
        resolvePlaybackDone?.(cleanModelText(answerText).trim());
      }

      function scheduleAnswerPlayback() {
        if (playbackFrameId || playbackFinished) {
          return;
        }
        playbackFrameId = requestAnimationFrame((timestamp) => {
          playbackFrameId = 0;
          const task = state.pendingAiTasks.get(turnData.id);
          if (task?.stoppedByUser) {
            finishPlaybackWithCurrentText();
            return;
          }
          if (!playbackStartAt) {
            playbackStartAt = timestamp + STREAM_UI_CONFIG.startDelayMs;
          }
          if (timestamp < playbackStartAt) {
            if (displayedLength < answerText.length || !streamCompleted) {
              scheduleAnswerPlayback();
              return;
            }
            finishPlaybackWithCurrentText();
            return;
          }
          if (!playbackLastTick) {
            playbackLastTick = timestamp;
          }
          const elapsed = timestamp - playbackLastTick;
          playbackLastTick = timestamp;
          playbackCarry += (elapsed / 1000) * STREAM_UI_CONFIG.charsPerSecond;
          let nextLength = displayedLength;
          while (playbackCarry >= 1 && nextLength < answerText.length) {
            playbackCarry -= 1;
            nextLength += 1;
            const currentChar = answerText[nextLength - 1];
            if (/[，。！？；：,.!?;:]/.test(currentChar || '')) {
              playbackCarry = Math.max(playbackCarry - STREAM_UI_CONFIG.punctuationPause, 0);
            } else if (currentChar === '\n') {
              playbackCarry = Math.max(playbackCarry - STREAM_UI_CONFIG.newlinePause, 0);
            }
          }
          if (nextLength !== displayedLength) {
            displayedLength = nextLength;
            renderStreamingMarkdown(scaffold.answer, answerText.slice(0, displayedLength), answerText);
            if (timestamp - playbackLastScrollAt > 90 || displayedLength === answerText.length) {
              playbackLastScrollAt = timestamp;
              scrollToBottom();
            }
          }
          if (displayedLength < answerText.length || !streamCompleted) {
            scheduleAnswerPlayback();
            return;
          }
          finishPlaybackWithCurrentText();
        });
      }

      try {
        const response = await fetch(AI_CONFIG.apiEndpoint.replace(/\/$/, '') + '/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + AI_CONFIG.apiKey,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://github.com/Gershom-Chen/VivaldiModpack',
            'X-Title': 'Vivaldi Ask in Page',
          },
          body: JSON.stringify(body),
          signal: abortController.signal,
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || ('HTTP ' + response.status));
        }
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        if (!reader) {
          const data = await response.json();
          rawResponseBody = JSON.stringify(data, null, 2);
          logAiCompose('AI Response', {
            turnId: turnData.id,
            response: data,
            rawResponseBody,
          });
          const fallbackReasoningField = cleanModelText(
            data?.choices?.[0]?.message?.reasoning_content ||
            data?.choices?.[0]?.message?.reasoning ||
            ''
          );
          const fallbackContentSegments = extractThinkingSegments(data?.choices?.[0]?.message?.content || '');
          const fallbackReasoningCombined = [fallbackReasoningField, fallbackContentSegments.reasoning].filter(Boolean).join('');
          if (fallbackReasoningCombined) {
            reasoningText = appendReasoningText(reasoningText, fallbackReasoningCombined);
          }
          answerText += cleanModelText(fallbackContentSegments.content);
          scheduleAnswerPlayback();
          streamCompleted = true;
          finalizeThoughtUi(scaffold, reasoningText, Math.round((Date.now() - startedAt) / 1000));
          const playedText = await playbackDone;
          const finalText = playedText || cleanModelText(answerText).trim() || '我已经完成处理，但模型没有返回可显示的正文。';
          turnData.aiReasoningText = reasoningText.trim();
          turnData.aiReplyText = finalText;
          if (!(state.pendingAiTasks.get(turnData.id)?.stoppedByUser)) {
            await renderRichAnswer(scaffold.answer, turnData.aiReplyText);
          }
          return;
        }
        while (reader) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            if (!line.startsWith('data:')) {
              continue;
            }
            const dataLine = line.slice(5).trim();
          if (!dataLine || dataLine === '[DONE]') {
            continue;
          }
            rawResponseBody += dataLine + '\n';
            let parsed;
            try {
              parsed = JSON.parse(dataLine);
            } catch (error) {
              continue;
            }
            const delta = parsed.choices?.[0]?.delta || {};
            const reasoningFieldDelta = cleanModelText(
              delta.reasoning_content ||
              delta.reasoning ||
              delta.thinking ||
              parsed.choices?.[0]?.message?.reasoning_content ||
              ''
            );
            const contentSegments = consumeThinkingStreamChunk(
              thinkingStreamState,
              delta.content || parsed.choices?.[0]?.message?.content || ''
            );
            const reasoningDelta = [reasoningFieldDelta, contentSegments.reasoning].filter(Boolean).join('');
            const contentDelta = cleanModelText(contentSegments.content);
            if (reasoningDelta) {
              reasoningText = appendReasoningText(reasoningText, reasoningDelta);
            }
            if (contentDelta) {
              answerText += contentDelta;
              scheduleAnswerPlayback();
            }
          }
        }
        const trailingSegments = flushThinkingStreamState(thinkingStreamState);
        const trailingReasoning = cleanModelText(trailingSegments.reasoning);
        const trailingContent = cleanModelText(trailingSegments.content);
        if (trailingReasoning) {
          reasoningText = appendReasoningText(reasoningText, trailingReasoning);
        }
        if (trailingContent) {
          answerText += trailingContent;
        }
        scheduleAnswerPlayback();
        streamCompleted = true;
        finalizeThoughtUi(scaffold, reasoningText, Math.round((Date.now() - startedAt) / 1000));
        logAiCompose('AI Response', {
          turnId: turnData.id,
          rawResponseBody: rawResponseBody.trim(),
          answerText,
          reasoningText,
        });
        const playedText = await playbackDone;
        const finalText = playedText || cleanModelText(answerText).trim() || '我已经完成处理，但模型没有返回可显示的正文。';
        turnData.aiReasoningText = reasoningText.trim();
        turnData.aiReplyText = finalText;
        if (!(state.pendingAiTasks.get(turnData.id)?.stoppedByUser)) {
          await renderRichAnswer(scaffold.answer, turnData.aiReplyText);
        }
      } catch (error) {
        const activeTask = state.pendingAiTasks.get(turnData.id);
        if (error.name === 'AbortError' || activeTask?.stoppedByUser) {
          finishPlaybackWithCurrentText();
          scaffold.processing.classList.add('hidden');
          if (!scaffold.answer.textContent.trim()) {
            scaffold.answer.textContent = 'Stopped.';
          }
        } else {
          finishPlaybackWithCurrentText();
          scaffold.processing.classList.add('hidden');
          scaffold.answer.classList.add('ask-msg-ai-error');
          scaffold.answer.textContent = 'AI 请求失败：' + cleanModelText(error.message || '未知错误');
        }
      } finally {
        clearPendingAiTask(turnData.id);
        turnNode._askTurnData = turnData;
        scrollToBottom();
      }
    }

    function renderTurn(turnData, existingTurnNode) {
      const turnNode = existingTurnNode || document.createElement('div');
      turnNode.className = 'ask-turn';
      turnNode.dataset.turnId = turnData.id;
      turnNode._askTurnData = turnData;
      turnNode.innerHTML = '';
      if (turnData.headerCards.length) {
        const cardsRow = createMessageReferenceStack(turnData.headerCards);
        if (cardsRow) {
          turnNode.appendChild(cardsRow);
        }
      }
      const userMsg = document.createElement('div');
      userMsg.className = 'ask-msg ask-msg-user';
      const body = document.createElement('div');
      body.className = 'ask-msg-user-body';
      if (turnData.activeCmd) {
        const cmdTag = document.createElement('div');
        cmdTag.className = 'ask-msg-cmd-tag';
        cmdTag.innerHTML = '<span>◔</span><span>' + turnData.activeCmd + '</span>';
        body.appendChild(cmdTag);
      }
      turnData.sequenceParts.forEach((part) => {
        if (part.type === 'ref') {
          const refEl = document.createElement('span');
          refEl.className = 'ask-msg-inline-ref';
          const icon = document.createElement('span');
          icon.className = 'ask-msg-inline-ref-icon';
          icon.textContent = part.iconText;
          const label = document.createElement('span');
          label.className = 'ask-msg-inline-ref-label';
          label.textContent = part.title;
          refEl.append(icon, label);
          body.appendChild(refEl);
          return;
        }
        if (part.type === 'text' && part.text) {
          const textNode = document.createElement('span');
          textNode.className = 'ask-msg-text';
          textNode.textContent = part.text;
          body.appendChild(textNode);
        }
      });
      userMsg.appendChild(body);
      turnNode.appendChild(userMsg);

      const meta = document.createElement('div');
      meta.className = 'ask-turn-meta';
      const time = document.createElement('span');
      time.className = 'ask-turn-time';
      time.textContent = turnData.timestamp;
      const actions = document.createElement('div');
      actions.className = 'ask-turn-actions';
      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'ask-turn-action';
      copyBtn.title = '复制消息';
      copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="10" height="10" rx="2"/><path d="M5 15V7a2 2 0 0 1 2-2h8"/></svg>';
      copyBtn.addEventListener('click', () => {
        copyTextToClipboard(turnData.serialized);
      });
      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'ask-turn-action';
      editBtn.title = '编辑消息';
      editBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>';
      editBtn.addEventListener('click', () => {
        state.editingTurnId = turnData.id;
        syncEditingBanner();
        restoreComposerFromSerialized(turnData.serialized.replace(/^\[\[aip-cmd:[^\]]+]]/, ''), turnData.activeCmd);
      });
      actions.append(copyBtn, editBtn);
      meta.append(time, actions);
      turnNode.appendChild(meta);

      const aiSlot = document.createElement('div');
      aiSlot.className = 'ask-turn-ai-slot';
      turnNode.appendChild(aiSlot);
      const aiMeta = document.createElement('div');
      aiMeta.className = 'ask-turn-ai-meta';
      const aiActions = document.createElement('div');
      aiActions.className = 'ask-turn-ai-actions';
      const aiCopyBtn = document.createElement('button');
      aiCopyBtn.type = 'button';
      aiCopyBtn.className = 'ask-turn-action';
      aiCopyBtn.title = '复制回复';
      aiCopyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="10" height="10" rx="2"/><path d="M5 15V7a2 2 0 0 1 2-2h8"/></svg>';
      aiCopyBtn.addEventListener('click', () => {
        copyTextToClipboard(turnNode._askTurnData?.aiReplyText || '');
      });
      const aiRetryBtn = document.createElement('button');
      aiRetryBtn.type = 'button';
      aiRetryBtn.className = 'ask-turn-action';
      aiRetryBtn.title = '重新回复';
      aiRetryBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15.55-6.36L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15.55 6.36L3 16"/></svg>';
      aiRetryBtn.addEventListener('click', () => {
        const latestTurnData = turnNode._askTurnData;
        if (!latestTurnData) {
          return;
        }
        clearPendingAiTask(latestTurnData.id);
        removeTurnsAfter(turnNode);
        latestTurnData.aiReplyText = '';
        latestTurnData.aiReasoningText = '';
        streamAiForTurn(turnNode, latestTurnData);
      });
      aiActions.append(aiCopyBtn, aiRetryBtn);
      aiMeta.appendChild(aiActions);
      turnNode.appendChild(aiMeta);
      return turnNode;
    }

    function removeCommand() {
      state.activeCmd = null;
      state.cmdChipFocused = false;
      if (state.focusedComposerTokenKey === 'cmd') {
        state.focusedComposerTokenKey = null;
      }
      if (state.cmdChipEl?.parentNode) {
        state.cmdChipEl.remove();
      }
      state.cmdChipEl = null;
      syncCommandsRow();
      state.inputField.focus();
    }

    function selectCommand(cmdName) {
      if (state.cmdChipEl?.parentNode) {
        state.cmdChipEl.remove();
      }
      state.activeCmd = cmdName;
      state.cmdChipFocused = false;
      const chip = document.createElement('span');
      chip.className = 'ask-cmd-chip';
      chip.append(document.createTextNode(cmdName));
      const close = document.createElement('span');
      close.className = 'ask-chip-close';
      close.textContent = '×';
      ['pointerdown', 'mousedown', 'click'].forEach((eventName) => {
        close.addEventListener(eventName, (event) => {
          event.preventDefault();
          event.stopPropagation();
        });
      });
      close.addEventListener('click', (event) => {
        event.preventDefault();
        removeCommand();
      });
      chip.append(close);
      state.inputMain.insertBefore(chip, state.inlineRefRow);
      state.cmdChipEl = chip;
      syncCommandsRow();
      state.inputField.focus();
    }

    function clearReferences() {
      state.refs = [];
      getComposerTokenNodes().forEach((node) => {
        if ((node.dataset.tokenKey || '').startsWith('ref:')) {
          node.remove();
        }
      });
      syncReferenceStrip();
    }

    function removeReference(refId) {
      state.refs = state.refs.filter((item) => item.id !== refId);
      const composerToken = findComposerTokenNode('ref:' + refId);
      if (composerToken) {
        composerToken.remove();
      }
      syncReferenceStrip();
      if (state.focusedComposerTokenKey === 'ref:' + refId) {
        clearFocusedComposerToken();
      }
      state.inputField.focus();
    }

    function addReference(item) {
      const ref = {
        id: String(state.nextRefId++),
        kind: item.kind,
        title: item.title,
        subtitle: item.subtitle || '',
        meta: item.meta || '',
        iconText: item.iconText || item.title.slice(0, 1).toUpperCase(),
        source: item.kind,
        raw: item.raw || null,
        rawBlob: item.rawBlob || item.blob || null,
        rawFile: item.rawFile || null,
        mime: item.mime || item.raw?.mime || item.raw?.type || '',
      };
      state.refs.push(ref);
      insertNodeAtComposerCaret(createComposerTokenElement({
        key: 'ref:' + ref.id,
        kind: ref.kind,
        iconText: ref.kind === 'file' ? 'D' : ref.iconText,
        title: ref.title,
        refId: ref.id,
      }));
      syncReferenceStrip();
    }

    function replaceSuggestionToken() {
      if (!state.suggestionToken?.node) {
        return;
      }
      const node = state.suggestionToken.node;
      const nextText = node.textContent.slice(0, state.suggestionToken.startOffset) + node.textContent.slice(state.suggestionToken.endOffset);
      node.textContent = nextText;
      if (!node.textContent) {
        const emptyNode = document.createTextNode('');
        node.parentNode?.insertBefore(emptyNode, node.nextSibling);
        node.remove();
        placeCaretInTextNode(emptyNode, 0);
      } else {
        placeCaretInTextNode(node, state.suggestionToken.startOffset);
      }
      state.suggestionToken = null;
    }

    function detectTriggerToken(trigger) {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        return null;
      }
      const range = selection.getRangeAt(0);
      let node = range.endContainer;
      let offset = range.endOffset;
      if (node === state.inputField) {
        const previous = state.inputField.childNodes[offset - 1];
        if (previous?.nodeType === Node.TEXT_NODE) {
          node = previous;
          offset = previous.textContent.length;
        } else {
          return null;
        }
      }
      if (node?.nodeType !== Node.TEXT_NODE) {
        return null;
      }
      const beforeCaret = node.textContent.slice(0, offset);
      const triggerIndex = beforeCaret.lastIndexOf(trigger);
      if (triggerIndex < 0) {
        return null;
      }
      const token = beforeCaret.slice(triggerIndex);
      if (token.length > 1 && /[\n\s]/.test(token.slice(1))) {
        return null;
      }
      if (triggerIndex > 0) {
        const previousChar = beforeCaret[triggerIndex - 1];
        if (previousChar && !/\s/.test(previousChar)) {
          return null;
        }
      }
      if (token[0] !== trigger) {
        return null;
      }
      return {
        node,
        startOffset: triggerIndex,
        endOffset: offset,
        query: token.slice(1),
        trigger,
      };
    }

    function renderSuggestionItem(item, index) {
      const icon = item.iconUrl
        ? '<img src="' + escapeHtml(item.iconUrl) + '" alt="">'
        : '<span>' + escapeHtml(item.iconText || item.title.slice(0, 1).toUpperCase()) + '</span>';
      return [
        '<button class="ask-suggestion-item' + (index === state.suggestionSelectedIndex ? ' active' : '') + '" type="button" data-index="' + index + '">',
        '<span class="ask-suggestion-icon" style="background:' + escapeHtml(item.color || '#2D3139') + ';">' + icon + '</span>',
        '<span class="ask-suggestion-text">',
        '<span class="ask-suggestion-title">' + escapeHtml(item.title) + '</span>',
        '<span class="ask-suggestion-subtitle">' + escapeHtml(item.subtitle || '') + '</span>',
        '</span>',
        '<span class="ask-suggestion-meta">' + escapeHtml(item.meta || '') + '</span>',
        '</button>',
      ].join('');
    }

    function renderSuggestions() {
      if (!state.suggestionItems.length) {
        state.suggestionBody.innerHTML = '<div class="ask-suggestion-empty">没有匹配的标签页或文件。</div>';
        return;
      }
      const groups = state.suggestionMode === 'slash' ? ['Commands'] : ['Tabs', 'Files'];
      const sections = groups.map((group) => {
        const items = state.suggestionItems
          .map((item, index) => ({ item, index }))
          .filter((entry) => entry.item.group === group);
        if (!items.length) {
          return '';
        }
        return [
          '<div class="ask-suggestion-section">',
          '<div class="ask-suggestion-section-title">' + group + '</div>',
          items.map((entry) => renderSuggestionItem(entry.item, entry.index)).join(''),
          '</div>',
        ].join('');
      }).filter(Boolean);
      state.suggestionBody.innerHTML = sections.join('');
    }

    function moveSuggestionSelection(step) {
      if (!state.suggestionItems.length) {
        return;
      }
      state.suggestionSelectedIndex = (state.suggestionSelectedIndex + step + state.suggestionItems.length) % state.suggestionItems.length;
      renderSuggestions();
      state.suggestionBody.querySelector('.ask-suggestion-item.active')?.scrollIntoView({ block: 'nearest' });
    }

    function selectSuggestion(item) {
      replaceSuggestionToken();
      hideSuggestions();
      if (item.kind === 'command') {
        selectCommand(item.commandName);
        state.inputField.focus();
        return;
      }
      if (item.kind === 'context') {
        const currentContextId = String(state.currentContext?.id || state.currentContext?.raw?.id || '');
        const selectedId = String(item.id || item.raw?.id || '');
        const currentSubtitle = String(state.currentContext?.subtitle || '');
        if ((currentContextId && currentContextId === selectedId) || (currentSubtitle && currentSubtitle === item.subtitle)) {
          setContextCardVisible(true);
        } else {
          addReference(item);
        }
        state.inputField.focus();
        return;
      }
      if (item.kind === 'files-action') {
        pickLocalFile().then((file) => {
          if (file) {
            addReference({
              kind: 'file',
              title: file.fileName || file.filename,
              subtitle: file.mime || 'local file',
              iconText: 'D',
              rawFile: file.rawFile || null,
              blob: file.blob || null,
              mime: file.mime || '',
            });
          }
          state.inputField.focus();
        });
        return;
      }
      addReference(item);
      state.inputField.focus();
    }

    async function loadAtSuggestions(query) {
      state.suggestionMode = 'at';
      state.suggestionSearchText.textContent = '@' + query;
      state.suggestionBody.innerHTML = '<div class="ask-suggestion-section"><div class="ask-suggestion-section-title">Loading</div><button class="ask-suggestion-item active" type="button"><span class="ask-suggestion-icon"><span>@</span></span><span class="ask-suggestion-text"><span class="ask-suggestion-title">正在加载标签页和下载文件...</span><span class="ask-suggestion-subtitle">如果你能看到这一项，说明 dropdown UI 已经显示</span></span></button></div>';
      showSuggestions();
      try {
        const [tabsResult, filesResult, clipboardResult] = await Promise.allSettled([getPanelTabs(), getDownloadedFiles(query), getClipboardFiles()]);
        const tabs = tabsResult.status === 'fulfilled' ? (tabsResult.value || []) : [];
        const files = filesResult.status === 'fulfilled' ? (filesResult.value || []) : [];
        const clipboardFiles = clipboardResult.status === 'fulfilled' ? (clipboardResult.value || []) : [];
        const lowerQuery = query.trim().toLowerCase();
        const tabItems = ((tabs || []).map(normalizeTab))
          .filter((item, index, arr) => {
            const unique = arr.findIndex((candidate) => candidate.id === item.id) === index;
            if (!unique) {
              return false;
            }
            if (isSuggestionAlreadySelected(item)) {
              return false;
            }
            if (!lowerQuery) {
              return true;
            }
            return (item.title + ' ' + item.subtitle).toLowerCase().includes(lowerQuery);
          });
        const fileItems = (clipboardFiles || [])
          .map(normalizeFile)
          .concat((files || []).map(normalizeFile))
          .filter((item, index, arr) => {
            const unique = arr.findIndex((candidate) => candidate.id === item.id && candidate.title === item.title) === index;
            if (!unique) {
              return false;
            }
            if (isSuggestionAlreadySelected(item)) {
              return false;
            }
            if (!lowerQuery) {
              return true;
            }
            return (item.title + ' ' + item.subtitle).toLowerCase().includes(lowerQuery);
          });
        const openFolderItem = {
          id: 'files-action-open',
          kind: 'files-action',
          group: 'Files',
          title: 'Choose a File...',
          subtitle: '从系统选择文件',
          iconText: '+',
          color: '#2D3139',
        };
        state.suggestionItems = tabItems.concat(fileItems, openFolderItem);
        state.suggestionSelectedIndex = 0;
        if (!state.suggestionItems.length) {
          state.suggestionBody.innerHTML = '<div class="ask-suggestion-empty">没有可用的标签页或下载文件。</div>';
          return;
        }
        renderSuggestions();
      } catch (error) {
        state.suggestionItems = [];
        state.suggestionBody.innerHTML = '<div class="ask-suggestion-empty">读取 Tabs / Files 失败，请稍后重试。</div>';
      }
    }

    function loadCommandSuggestions(query) {
      state.suggestionMode = 'slash';
      state.suggestionSearchText.textContent = '/' + query;
      const lowerQuery = query.trim().toLowerCase();
      state.suggestionItems = commandDefinitions
        .filter((command) => {
          if (!lowerQuery) {
            return true;
          }
          return [command.name, command.trigger]
            .concat(command.aliases || [])
            .some((token) => String(token || '').toLowerCase().startsWith(lowerQuery));
        })
        .map((command) => ({
          id: 'command-' + command.id,
          kind: 'command',
          group: 'Commands',
          title: '/' + command.name,
          subtitle: command.subtitle,
          iconText: command.iconText,
          color: '#2D3139',
          commandName: command.name,
          commandPrompt: command.prompt,
        }));
      state.suggestionSelectedIndex = 0;
      showSuggestions();
      if (!state.suggestionItems.length) {
        state.suggestionBody.innerHTML = '<div class="ask-suggestion-empty">没有匹配的命令。</div>';
        return;
      }
      renderSuggestions();
    }

    function handleSend() {
      if (state.isBusy) {
        stopStreamingOutput();
        return;
      }
      const sequenceParts = getComposerSequenceParts();
      const text = sequenceParts.filter((part) => part.type === 'text').map((part) => part.text).join('').trim();
      if (!text && !state.activeCmd && !state.refs.length && !state.selectedText) {
        return;
      }
      hideSuggestions();
      state.empty.style.display = 'none';
      const turnData = createTurnData();
      const existingTurn = state.editingTurnId ? findTurnNode(state.editingTurnId) : null;
      if (existingTurn) {
        removeTurnsAfter(existingTurn);
      }
      const turnNode = renderTurn(turnData, existingTurn);
      if (!existingTurn) {
        state.messages.appendChild(turnNode);
      }
      clearComposer({ showDefaultContext: false });
      streamAiForTurn(turnNode, turnData);
      scrollToBottom({ smooth: true });
    }

    state.commandsRow.querySelectorAll('.ask-btn-cmd').forEach((button) => {
      button.addEventListener('click', () => selectCommand(button.dataset.cmd));
    });
    state.btnSend.addEventListener('click', handleSend);
    state.btnNew.addEventListener('click', () => {
      state.pendingAiTasks.forEach((task, turnId) => clearPendingAiTask(turnId));
      state.pendingAiTasks.clear();
      state.currentStreamingTurnId = null;
      syncBusyState();
      state.messages.innerHTML = '';
      state.empty.style.display = '';
      clearComposer({ showDefaultContext: true });
      syncContext();
      syncSelectedText();
    });
    state.editClose.addEventListener('click', () => {
      clearComposer({ showDefaultContext: false });
    });
    state.ctxClose.addEventListener('click', () => {
      setContextCardVisible(false);
    });
    state.selectionClose.addEventListener('click', () => {
      setSelectedText('');
    });
    state.btnTool.addEventListener('click', () => {
      openReferenceSuggestions();
    });
    state.inputField.addEventListener('focus', () => {
      if (state.isBusy) {
        state.inputField.blur();
        return;
      }
      state.inputBox.classList.add('focused');
      if (state.focusedComposerTokenKey) {
        clearFocusedComposerToken();
      }
    });
    state.inputField.addEventListener('blur', () => {
      state.inputBox.classList.remove('focused');
    });
    state.inputField.addEventListener('input', () => {
      if (state.isBusy) {
        return;
      }
      syncStateFromComposerDom();
      if (state.focusedComposerTokenKey) {
        clearFocusedComposerToken();
      }
      const slashToken = detectTriggerToken('/');
      if (slashToken) {
        state.suggestionToken = slashToken;
        loadCommandSuggestions(slashToken.query);
        return;
      }
      const atToken = detectTriggerToken('@');
      if (atToken) {
        state.suggestionToken = atToken;
        loadAtSuggestions(atToken.query);
      } else {
        hideSuggestions();
      }
    });
    state.inputField.addEventListener('copy', (event) => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || !state.inputField.contains(selection.anchorNode)) {
        return;
      }
      const fragment = selection.getRangeAt(0).cloneContents();
      const serialized = serializeComposerFragment(fragment);
      if (!serialized) {
        return;
      }
      event.preventDefault();
      event.clipboardData.setData('text/plain', serialized);
    });
    state.inputField.addEventListener('cut', (event) => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || !state.inputField.contains(selection.anchorNode)) {
        return;
      }
      const range = selection.getRangeAt(0);
      const fragment = range.cloneContents();
      const serialized = serializeComposerFragment(fragment);
      if (!serialized) {
        return;
      }
      event.preventDefault();
      event.clipboardData.setData('text/plain', serialized);
      range.deleteContents();
      syncStateFromComposerDom();
    });
    state.inputField.addEventListener('paste', (event) => {
      const text = event.clipboardData?.getData('text/plain') || '';
      if (!text.includes('[[aip:')) {
        return;
      }
      event.preventDefault();
      insertSerializedComposerText(text);
      syncStateFromComposerDom();
    });
      state.inputField.addEventListener('keydown', (event) => {
      if (event.key === '@') {
        if (state.isBusy) {
          event.preventDefault();
          return;
        }
        requestAnimationFrame(() => {
          state.suggestionToken = detectTriggerToken('@') || {
            startOffset: getCaretOffset(state.inputField),
            endOffset: getCaretOffset(state.inputField),
            query: '',
            trigger: '@',
          };
          openAtSuggestions(state.suggestionToken.query || '');
        });
      }
      if (event.key === '/') {
        if (state.isBusy) {
          event.preventDefault();
          return;
        }
        requestAnimationFrame(() => {
          state.suggestionToken = detectTriggerToken('/') || {
            startOffset: getCaretOffset(state.inputField),
            endOffset: getCaretOffset(state.inputField),
            query: '',
            trigger: '/',
          };
          state.suggestionSearchText.textContent = '/';
          state.suggestionBody.innerHTML = '<div class="ask-suggestion-empty">正在准备命令...</div>';
          showSuggestions();
          loadCommandSuggestions(state.suggestionToken.query || '');
        });
      }
      if (state.suggestionDropdown.classList.contains('visible')) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          moveSuggestionSelection(1);
          return;
        }
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          moveSuggestionSelection(-1);
          return;
        }
        if ((event.key === 'Enter' && !event.shiftKey) || event.key === 'Tab') {
          const item = state.suggestionItems[state.suggestionSelectedIndex];
          if (item) {
            event.preventDefault();
            selectSuggestion(item);
            return;
          }
        }
        if (event.key === 'Escape') {
          event.preventDefault();
          hideSuggestions();
          return;
        }
      }
      if (event.key === 'Backspace' && state.activeCmd && state.cmdChipEl && isInputEmpty()) {
        const focusedEntry = getComposerTokenEntries().find((entry) => entry.key === state.focusedComposerTokenKey);
        if (focusedEntry?.key === 'cmd') {
          event.preventDefault();
          focusedEntry.remove();
          return;
        }
        if (!focusedEntry && isCaretAtComposerStart()) {
          event.preventDefault();
          clearFocusedComposerToken();
          state.focusedComposerTokenKey = 'cmd';
          state.cmdChipFocused = true;
          state.cmdChipEl?.classList.add('focused');
          return;
        }
      }
      if (event.key === 'Backspace') {
        const adjacent = getAdjacentComposerTokenEntry(-1);
        if (adjacent) {
          event.preventDefault();
          const focusedEntry = getComposerTokenEntries().find((entry) => entry.key === state.focusedComposerTokenKey);
          if (!focusedEntry || focusedEntry.key !== adjacent.key) {
            clearFocusedComposerToken();
            state.focusedComposerTokenKey = adjacent.key;
            adjacent.el.classList.add('focused');
          } else {
            adjacent.remove();
          }
          return;
        }
        if (isCaretAtComposerStart()) {
          event.preventDefault();
          return;
        }
      }
      if (event.key === 'ArrowLeft' && getCaretOffset(state.inputField) === 0) {
        const adjacent = getAdjacentComposerTokenEntry(-1);
        if (adjacent) {
          event.preventDefault();
          clearFocusedComposerToken();
          state.focusedComposerTokenKey = adjacent.key;
          adjacent.el.classList.add('focused');
          return;
        }
        if (state.activeCmd && state.cmdChipEl && isCaretAtComposerStart()) {
          event.preventDefault();
          clearFocusedComposerToken();
          state.focusedComposerTokenKey = 'cmd';
          state.cmdChipFocused = true;
          state.cmdChipEl?.classList.add('focused');
          return;
        }
        if (moveComposerTokenFocus(-1)) {
          event.preventDefault();
          return;
        }
      }
      if (event.key === 'ArrowRight' && state.focusedComposerTokenKey) {
        if (moveComposerTokenFocus(1)) {
          event.preventDefault();
          return;
        }
      }
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSend();
      }
    });
    state.suggestionBody.addEventListener('mousedown', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const button = event.target.closest('.ask-suggestion-item');
      if (!button) {
        return;
      }
      const item = state.suggestionItems[Number(button.dataset.index)];
      if (item) {
        selectSuggestion(item);
      }
    });
    ['pointerdown', 'mousedown', 'click'].forEach((eventName) => {
      state.suggestionDropdown.addEventListener(eventName, (event) => {
        event.stopPropagation();
      });
    });
    root.addEventListener('mousedown', (event) => {
      if (!state.suggestionDropdown.classList.contains('visible')) {
        return;
      }
      if (state.suggestionDropdown.contains(event.target) || state.inputBox.contains(event.target)) {
        return;
      }
      hideSuggestions();
    });

    syncCommandsRow();
    syncReferenceStrip();
    syncContext();
    syncSelectedText();
    syncBusyState();
    startSelectionPolling();
    panelState = state;
  }

  function ensurePanelUI(panel) {
    panel.querySelectorAll(':scope > .ask-in-page-content').forEach((node) => {
      if (node !== panelRoot) {
        node.remove();
      }
    });

    if (panelRoot && panelRoot.dataset.askInPageUiVersion !== uiVersion) {
      panelRoot.remove();
      panelRoot = null;
      panelState = null;
    }

    if (!panelRoot) {
      panelRoot = createElement('div', {
        class: 'ask-in-page-content',
      });
      panelRoot.dataset.askInPageUiVersion = uiVersion;
      initPanelState(panelRoot);
    }
    if (panelRoot.parentNode !== panel) {
      panel.append(panelRoot);
    }
    const webview = panel.querySelector('webview');
    if (webview) {
      webview.blur?.();
      webview.tabIndex = -1;
    }
    panel.dataset.askInPage = 'true';
    if (panelState) {
      panelState.root.style.display = '';
      panelState.inputField.setAttribute('data-panel-ready', 'true');
      if (!panelState.currentContext) {
        getCurrentTab().then((tab) => {
          if (tab && panelState) {
            panelState.ctxFavicon.textContent = normalizeTab(tab).iconText || 'A';
            panelState.ctxTitle.textContent = normalizeTab(tab).title;
            panelState.ctxUrl.textContent = normalizeTab(tab).subtitle;
            panelState.currentContext = normalizeTab(tab);
          }
        }).catch(() => {});
      }
    }
  }

  function createWebPanel() {
    vivaldi.prefs.get('vivaldi.panels.web.elements', (elements) => {
      const elementsArr = (elements && elements.value !== undefined) ? elements.value : elements;
      let element = elementsArr.find((item) => item.id === webPanelId);
      if (!element) {
        element = {
          activeUrl: code,
          faviconUrl: panelIcon,
          faviconUrlValid: true,
          id: webPanelId,
          mobileMode: true,
          origin: 'user',
          resizable: false,
          title: name,
          url: code,
          width: -1,
          zoom: 1,
        };
        elementsArr.unshift(element);
      } else {
        element.activeUrl = code;
        element.faviconUrl = panelIcon;
        element.faviconUrlValid = true;
        element.url = code;
      }
      vivaldi.prefs.set({
        path: 'vivaldi.panels.web.elements',
        value: elementsArr,
      });

      Promise.all([
        'vivaldi.toolbars.panel',
        'vivaldi.toolbars.navigation',
        'vivaldi.toolbars.status',
        'vivaldi.toolbars.mail',
        'vivaldi.toolbars.mail_message',
        'vivaldi.toolbars.mail_composer',
      ].map((path) => vivaldi.prefs.get(path))).then((toolbars) => {
        const hasPanel = toolbars.some((toolbar) => {
          const arr = (toolbar && toolbar.value !== undefined) ? toolbar.value : toolbar;
          return arr.some((entry) => entry === webPanelId);
        });
        if (!hasPanel) {
          const panels = toolbars[0];
          const panelsArr = (panels && panels.value !== undefined) ? panels.value : panels;
          const panelIndex = panelsArr.findIndex((entry) => entry.startsWith('WEBPANEL_'));
          panelsArr.splice(panelIndex, 0, webPanelId);
          vivaldi.prefs.set({
            path: 'vivaldi.toolbars.panel',
            value: panelsArr,
          });
        }
      });
    });
  }

  function updatePanel() {
    const webviewButtons = Array.from(document.querySelectorAll(
      '.toolbar > .button-toolbar > .ToolbarButton-Button[data-name*="' + webPanelId + '"]'
    ));
    const webPanelStack = getReactProps('.panel-group .webpanel-stack')?.children?.filter(Boolean) ?? [];
    const webPanelIndex = webPanelStack.findIndex((webPanel) => webPanel.key === webPanelId) + 1;
    const panel = webPanelIndex > 0
      ? document.querySelector('.panel-group .webpanel-stack .panel.webpanel:nth-child(' + webPanelIndex + ')')
      : null;

    if (panel && webviewButtons.length) {
      ensurePanelUI(panel);
    }

    webviewButtons.forEach((button) => {
      if (!button.dataset.askInPage) {
        button.dataset.askInPage = 'true';
      }
    });
  }

  function waitForBrowser(callback) {
    let count = 0;
    const interval = setInterval(() => {
      count++;
      if (document.getElementById('browser')) {
        clearInterval(interval);
        callback();
      } else if (count > 100) {
        clearInterval(interval);
      }
    }, 100);
  }

  function scheduleUpdatePanel() {
    if (scheduleUpdatePanel.queued) {
      return;
    }
    scheduleUpdatePanel.queued = true;
    requestAnimationFrame(() => {
      scheduleUpdatePanel.queued = false;
      updatePanel();
    });
  }

  waitForBrowser(() => {
    injectStyles();
    createWebPanel();
    scheduleUpdatePanel();

    const observer = new MutationObserver(() => {
      scheduleUpdatePanel();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    chrome.tabs?.onActivated?.addListener(() => {
      if (panelState) {
        getCurrentTab().then((tab) => {
          if (tab) {
            panelState.currentContext = normalizeTab(tab);
            panelState.ctxFavicon.textContent = panelState.currentContext.iconText;
            panelState.ctxTitle.textContent = panelState.currentContext.title;
            panelState.ctxUrl.textContent = panelState.currentContext.subtitle;
          }
        }).catch(() => {});
        getCurrentTabSelection().then((text) => {
          if (panelState) {
            panelState.selectedText = String(text || '').replace(/\s+/g, ' ').trim().slice(0, 140);
            panelState.selectionTitle.textContent = panelState.selectedText;
            panelState.selectionCard.classList.toggle('hidden', !panelState.selectedText);
            panelState.inputContext.classList.toggle('hidden', !panelState.contextCardVisible && !panelState.refs.length && !panelState.selectedText);
          }
        }).catch(() => {});
      }
    });

    chrome.tabs?.onUpdated?.addListener((tabId, changeInfo, tab) => {
      if (!panelState || !tab?.active) {
        return;
      }
      if (changeInfo.title || changeInfo.url || changeInfo.status === 'complete') {
        panelState.currentContext = normalizeTab(tab);
        panelState.ctxFavicon.textContent = panelState.currentContext.iconText;
        panelState.ctxTitle.textContent = panelState.currentContext.title;
        panelState.ctxUrl.textContent = panelState.currentContext.subtitle;
        getCurrentTabSelection().then((text) => {
          if (panelState) {
            panelState.selectedText = String(text || '').replace(/\s+/g, ' ').trim().slice(0, 140);
            panelState.selectionTitle.textContent = panelState.selectedText;
            panelState.selectionCard.classList.toggle('hidden', !panelState.selectedText);
            panelState.inputContext.classList.toggle('hidden', !panelState.contextCardVisible && !panelState.refs.length && !panelState.selectedText);
          }
        }).catch(() => {});
      }
    });
  });
})();
