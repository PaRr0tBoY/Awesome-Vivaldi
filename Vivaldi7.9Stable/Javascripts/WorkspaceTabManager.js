// ==UserScript==
// @name         Workspace Tab Manager
// @description  Cross-workspace virtual tab board for Vivaldi.
// @version      2026.5.3
// @author       PaRr0tBoY
// ==/UserScript==

/*
 * Workspace Tab Manager
 * Cross-workspace tab management center for Vivaldi.
 *
 * Registers a WebPanel, hides the native webview,
 * and renders tab cards styled to match Vivaldi's native tabs.
 */

(() => {
  'use strict';

  const panelName = 'Workspace Board';
  const panelAttr = 'workspace-tab-manager';
  const webPanelId = 'WEBPANEL_workspace-board-b7d71f8f';
  const panelCode = 'data:text/html,' + encodeURIComponent('<title>' + panelName + '</title>');
  const panelIconSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">' +
    '<path d="M4 5.5h6.5V19H4zM13.5 5.5H20v4.75h-6.5zM13.5 11.75H20V19h-6.5z" stroke="#8B949E" stroke-width="1.8" rx="1.5" />' +
    '</svg>';
  const panelIcon = 'data:image/svg+xml,' + encodeURIComponent(panelIconSvg);
  const panelIconMask = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
    '<path d="M4 5.5h6.5V19H4zM13.5 5.5H20v4.75h-6.5zM13.5 11.75H20V19h-6.5z" fill="none" stroke="#000" stroke-width="1.8" rx="1.5" />' +
    '</svg>'
  );

  let reactPropsKey = null;
  let panelRoot = null;
  let refreshTimer = null;
  let destroyed = false;
  let currentSnapshotKey = '';
  let lastSnapshotByWorkspaceId = new Map();
  const workspaceUiHandlers = new Map();

  // ── DOM helpers ──────────────────────────────────────────────────────

  function el(tagName, attrs, parent, children) {
    const node = document.createElement(tagName);
    if (attrs && typeof attrs === 'object') {
      Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'text') node.textContent = value;
        else if (key === 'html') node.innerHTML = value;
        else if (key === 'style' && value && typeof value === 'object') {
          Object.entries(value).forEach(([k, v]) => node.style.setProperty(k, v));
        } else if (key === 'events' && value && typeof value === 'object') {
          Object.entries(value).forEach(([ev, fn]) => {
            if (typeof fn === 'function') node.addEventListener(ev, fn);
          });
        } else if (key in node) node[key] = value;
        else node.setAttribute(key, value);
      });
    }
    if (children != null) {
      (Array.isArray(children) ? children : [children])
        .filter(Boolean)
        .forEach((c) => node.append(c.nodeType ? c : document.createTextNode(String(c))));
    }
    if (parent) parent.append(node);
    return node;
  }

  // ── React props bridge ───────────────────────────────────────────────

  function getReactProps(element) {
    if (typeof element === 'string') element = document.querySelector(element);
    if (!element) return null;
    if (!reactPropsKey) reactPropsKey = Object.keys(element).find((k) => k.startsWith('__reactProps'));
    return reactPropsKey ? element[reactPropsKey] : null;
  }

  // ── Init gate ────────────────────────────────────────────────────────

  function waitForBrowser(callback) {
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      if (destroyed) { clearInterval(timer); return; }
      if (document.getElementById('browser')) { clearInterval(timer); callback(); }
      else if (tries > 100) clearInterval(timer);
    }, 100);
  }

  // ── API wrappers ─────────────────────────────────────────────────────

  function callApi(fn, ...args) {
    return new Promise((resolve, reject) => {
      try {
        fn(...args, (result) => {
          const err = chrome.runtime && chrome.runtime.lastError;
          err ? reject(err) : resolve(result);
        });
      } catch (e) { reject(e); }
    });
  }

  async function getPref(path) {
    if (!vivaldi?.prefs?.get) throw new Error('vivaldi.prefs.get unavailable');
    try {
      const v = await vivaldi.prefs.get(path);
      return v && v.value !== undefined ? v.value : v;
    } catch {
      const v = await callApi(vivaldi.prefs.get.bind(vivaldi.prefs), path);
      return v && v.value !== undefined ? v.value : v;
    }
  }

  async function setPref(path, value) {
    if (!vivaldi?.prefs?.set) throw new Error('vivaldi.prefs.set unavailable');
    try { return await vivaldi.prefs.set({ path, value }); }
    catch { return await callApi(vivaldi.prefs.set.bind(vivaldi.prefs), { path, value }); }
  }

  async function getTabs() {
    try {
      const tabs = await chrome.tabs.query({});
      return tabs.filter((t) => typeof t.id === 'number' && t.id >= 0);
    } catch {
      const tabs = await callApi(chrome.tabs.query.bind(chrome.tabs), {});
      return tabs.filter((t) => typeof t.id === 'number' && t.id >= 0);
    }
  }

  async function getTabExtra(tabId) {
    if (!vivaldi?.tabsPrivate?.get) return {};
    try { return (await vivaldi.tabsPrivate.get(tabId)) || {}; }
    catch {
      try { return (await callApi(vivaldi.tabsPrivate.get.bind(vivaldi.tabsPrivate), tabId)) || {}; }
      catch { return {}; }
    }
  }

  // ── Tab actions ──────────────────────────────────────────────────────

  async function activateTab(tab) {
    if (tab.workspaceId != null) {
      const currentWindowId = await getCurrentWindowId();
      if (currentWindowId === tab.windowId) {
        try { await activateWorkspaceByUI(tab.workspaceId); }
        catch (e) { console.warn('[WTM] workspace activation fallback', e); }
      }
    }
    await chrome.tabs.update(tab.id, { active: true });
    if (chrome.windows?.update) await chrome.windows.update(tab.windowId, { focused: true });
    queueRefresh();
  }

  async function closeTab(tabId) {
    await chrome.tabs.remove(tabId);
    queueRefresh();
  }

  // ── Workspace UI interaction ─────────────────────────────────────────

  function parseVivExtData(value) {
    if (!value) return {};
    if (typeof value === 'object') return value;
    if (typeof value === 'string') { try { return JSON.parse(value); } catch { return {}; } }
    return {};
  }

  function getTabTitle(tab) {
    return tab.extra.fixedTitle || tab.ext.fixedTitle || tab.title || tab.pendingUrl || tab.url || 'Untitled';
  }

  function iconText(title) {
    return (title || '?').trim().charAt(0).toUpperCase() || '?';
  }

  function stableStringify(value) {
    try { return JSON.stringify(value); } catch { return String(Date.now()); }
  }

  // ── Snapshot builder ─────────────────────────────────────────────────

  async function buildWorkspaceSnapshot() {
    const [workspaces, tabs] = await Promise.all([
      getPref('vivaldi.workspaces.list'),
      getTabs(),
    ]);

    const enrichedTabs = await Promise.all(
      tabs.map(async (tab) => {
        const extra = await getTabExtra(tab.id);
        const ext = parseVivExtData(extra.vivExtData ?? tab.vivExtData);
        return {
          ...tab,
          extra,
          ext,
          workspaceId: ext.workspaceId,
          groupId: ext.group || '',
          fixedGroupTitle: ext.fixedGroupTitle || '',
          groupColor: ext.groupColor || extra.groupColor || '',
        };
      })
    );

    const byWorkspace = new Map();
    (workspaces || []).forEach((ws) => byWorkspace.set(ws.id, { ...ws, tabs: [] }));

    enrichedTabs.forEach((tab) => {
      if (tab.workspaceId == null) return;
      if (!byWorkspace.has(tab.workspaceId)) {
        byWorkspace.set(tab.workspaceId, { id: tab.workspaceId, name: `Unknown ${tab.workspaceId}`, icon: '', emoji: '', tabs: [] });
      }
      byWorkspace.get(tab.workspaceId).tabs.push(tab);
    });

    return [...byWorkspace.values()].map((ws, index) => {
      const sorted = [...ws.tabs].sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        if (a.windowId !== b.windowId) return a.windowId - b.windowId;
        return a.index - b.index;
      });

      // Group tabs
      const groups = new Map();
      sorted.forEach((tab) => {
        if (!tab.groupId) return;
        if (!groups.has(tab.groupId)) {
          groups.set(tab.groupId, {
            id: tab.groupId,
            title: tab.fixedGroupTitle || '',
            color: tab.groupColor || '',
            pinned: !!tab.pinned,
            tabs: [],
          });
        }
        groups.get(tab.groupId).tabs.push(tab);
      });

      // Build flat tree — all groups expanded, no collapse
      const seenGroups = new Set();
      const tree = [];
      sorted.forEach((tab) => {
        if (!tab.groupId) {
          tree.push({ type: 'tab', tab });
          return;
        }
        if (seenGroups.has(tab.groupId)) return;
        seenGroups.add(tab.groupId);
        const group = groups.get(tab.groupId);
        tree.push({
          type: 'group',
          id: group.id,
          title: group.title || getTabTitle(group.tabs[0]),
          color: group.color,
          pinned: group.pinned,
          tabs: group.tabs,
        });
      });

      return {
        id: ws.id,
        name: ws.name,
        icon: ws.icon,
        emoji: ws.emoji,
        index,
        tabCount: sorted.length,
        pinnedCount: sorted.filter((t) => t.pinned).length,
        tree,
      };
    });
  }

  // ── Workspace popup interaction ──────────────────────────────────────

  async function getCurrentWindowId() {
    try {
      const cur = await chrome.windows.getCurrent();
      if (cur && typeof cur.id === 'number') return cur.id;
    } catch {}
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab && typeof tab.windowId === 'number' ? tab.windowId : undefined;
  }

  function getWorkspacePopupButton() {
    const candidates = Array.from(
      document.querySelectorAll(
        '.button-toolbar.workspace-popup button, .button-toolbar.workspace-popup .ToolbarButton-Button, .button-toolbar.workspace-popup'
      )
    );
    return candidates.find((n) => n.getClientRects().length > 0) || candidates[0] || null;
  }

  async function waitForElement(selector, timeout = 1500) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const el = document.querySelector(selector);
      if (el) return el;
      await new Promise((r) => setTimeout(r, 50));
    }
    return null;
  }

  function synthPointer(target) {
    return { preventDefault() {}, stopPropagation() {}, currentTarget: target, target, button: 0, buttons: 1, type: 'click' };
  }

  async function ensureWorkspacePopupOpen() {
    let popup = document.querySelector('.WorkspacePopup');
    if (popup) { cacheHandlers(); return popup; }
    const button = getWorkspacePopupButton();
    if (!button) throw new Error('Workspace button not found');
    const props = getReactProps(button);
    if (props?.onPointerUp) props.onPointerUp(synthPointer(button));
    else if (props?.onClick) props.onClick(synthPointer(button));
    button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0 }));
    button.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, button: 0 }));
    button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
    popup = await waitForElement('.WorkspacePopup', 2200);
    if (!popup) throw new Error('Workspace popup did not open');
    cacheHandlers();
    return popup;
  }

  function cacheHandlers() {
    const items = Array.from(document.querySelectorAll('.WorkspacePopup .workspace-item-wrapper'));
    if (!items.length || !lastSnapshotByWorkspaceId.size) return;
    const snaps = Array.from(lastSnapshotByWorkspaceId.values()).sort((a, b) => a.index - b.index);
    items.forEach((item, i) => {
      const props = getReactProps(item);
      if (!props) return;
      const text = (item.textContent || '').trim();
      const ws = snaps.find((s) => s.name && text.includes(s.name)) || snaps[i];
      if (!ws) return;
      workspaceUiHandlers.set(ws.id, {
        click: typeof props.onClick === 'function' ? props.onClick : null,
        contextMenu: typeof props.onContextMenu === 'function' ? props.onContextMenu : null,
        ref: item,
      });
    });
  }

  async function activateWorkspaceByUI(workspaceId) {
    const cached = workspaceUiHandlers.get(workspaceId);
    if (cached?.click) {
      cached.click(synthPointer(cached.ref || document.body));
      await new Promise((r) => setTimeout(r, 60));
      return;
    }
    await ensureWorkspacePopupOpen();
    cacheHandlers();
    const refreshed = workspaceUiHandlers.get(workspaceId);
    if (refreshed?.click) {
      refreshed.click(synthPointer(refreshed.ref || document.body));
      await new Promise((r) => setTimeout(r, 60));
      return;
    }
    // Fallback: find by text match
    const ws = lastSnapshotByWorkspaceId.get(workspaceId);
    if (!ws) return;
    const items = Array.from(document.querySelectorAll('.WorkspacePopup .workspace-item-wrapper'));
    const item = items.find((n) => n.textContent?.includes(ws.name)) || items[ws.index];
    if (!item) throw new Error('Workspace popup item not found');
    const props = getReactProps(item);
    if (props?.onClick) props.onClick(synthPointer(item));
    else {
      item.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0 }));
      item.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, button: 0 }));
      item.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
    }
    await new Promise((r) => setTimeout(r, 60));
  }

  // ── Rendering ────────────────────────────────────────────────────────

  function showError(error) {
    const msg = error?.message || String(error);
    console.error('[WTM]', error);
    const status = panelRoot?.querySelector('.wtm-status');
    if (status) status.textContent = msg;
  }

  function queueRefresh() {
    if (refreshTimer) clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => { refreshTimer = null; renderBoard(); }, 120);
  }

  function renderBoard(force = false) {
    if (!panelRoot) return;
    const board = panelRoot.querySelector('.wtm-board');
    const status = panelRoot.querySelector('.wtm-status');
    if (status) status.textContent = 'Refreshing\u2026';

    buildWorkspaceSnapshot().then((workspaces) => {
      const snapshotKey = stableStringify(
        workspaces.map((ws) => ({
          id: ws.id, name: ws.name, count: ws.tabCount,
          tree: ws.tree.map((n) => n.type === 'group' ? { type: 'group', id: n.id, count: n.tabs.length } : { type: 'tab', id: n.tab.id }),
        }))
      );

      lastSnapshotByWorkspaceId = new Map(workspaces.map((ws) => [ws.id, ws]));
      cacheHandlers();

      if (!force && snapshotKey === currentSnapshotKey && board.childElementCount > 0) {
        if (status) status.textContent = `${workspaces.length} workspaces \u00b7 ${workspaces.reduce((s, w) => s + w.tabCount, 0)} tabs`;
        return;
      }
      currentSnapshotKey = snapshotKey;

      board.textContent = '';
      if (!workspaces.length) {
        renderEmpty(board, 'No workspaces found', 'Enable workspaces or create one first.');
        if (status) status.textContent = '0 workspaces';
        return;
      }
      workspaces.forEach((ws) => renderColumn(board, ws));
      if (status) status.textContent = `${workspaces.length} workspaces \u00b7 ${workspaces.reduce((s, w) => s + w.tabCount, 0)} tabs`;
    }).catch((error) => {
      showError(error);
      renderEmpty(board, 'Unable to load', error?.message || String(error));
      if (status) status.textContent = 'Load failed';
    });
  }

  function renderEmpty(container, title, detail) {
    container.textContent = '';
    const empty = el('div', { className: 'wtm-empty' }, container);
    el('h2', { text: title }, empty);
    el('p', { text: detail }, empty);
  }

  function renderColumn(board, ws) {
    const col = el('div', { className: 'wtm-col', draggable: false }, board);
    col.dataset.wsId = String(ws.id);

    // Workspace header
    const header = el('div', { className: 'wtm-ws-header' }, col);
    const icon = el('span', { className: 'wtm-ws-icon' }, header);
    if (ws.emoji) {
      el('span', { className: 'wtm-ws-emoji', text: ws.emoji }, icon);
    } else if (ws.icon) {
      el('span', { className: 'wtm-ws-img', style: { 'background-image': `url("${ws.icon}")` } }, icon);
    } else {
      el('span', { className: 'wtm-ws-letter', text: iconText(ws.name) }, icon);
    }
    el('span', { className: 'wtm-ws-name', text: ws.name || 'Untitled' }, header);
    el('span', { className: 'wtm-ws-count', text: String(ws.tabCount) }, header);

    // Tab list
    const list = el('div', { className: 'wtm-list' }, col);
    ws.tree.forEach((node) => {
      if (node.type === 'group') renderGroup(list, ws, node);
      else renderTab(list, node.tab);
    });

    if (!ws.tree.length) {
      el('div', { className: 'wtm-empty-row', text: 'No tabs' }, list);
    }
  }

  function renderGroup(parent, ws, group) {
    const groupEl = el('div', { className: 'wtm-group' }, parent);

    // Group header
    const gh = el('div', { className: 'wtm-group-hdr' }, groupEl);
    if (group.color) {
      el('span', { className: 'wtm-group-dot', style: { backgroundColor: group.color } }, gh);
    }
    el('span', { className: 'wtm-group-title', text: group.title }, gh);
    el('span', { className: 'wtm-group-badge', text: String(group.tabs.length) }, gh);

    // Group tabs (always expanded)
    const body = el('div', { className: 'wtm-group-body' }, groupEl);
    group.tabs.forEach((tab) => renderTab(body, tab));
  }

  function renderTab(parent, tab) {
    const isActive = tab.active;
    const isPinned = tab.pinned;

    const row = el('div', {
      className: 'wtm-tab' + (isActive ? ' active' : '') + (isPinned ? ' pinned' : ''),
      events: { click: () => activateTab(tab).catch(showError) },
    }, parent);

    // Favicon
    const fav = el('div', { className: 'wtm-favicon' }, row);
    if (tab.favIconUrl) {
      const img = el('img', { src: tab.favIconUrl, width: 16, height: 16 }, fav);
      img.onerror = () => { img.remove(); el('span', { className: 'wtm-fav-letter', text: iconText(getTabTitle(tab)) }, fav); };
    } else {
      el('span', { className: 'wtm-fav-letter', text: iconText(getTabTitle(tab)) }, fav);
    }

    // Title
    const title = el('span', {
      className: 'wtm-title',
      text: getTabTitle(tab),
      title: getTabTitle(tab) + (tab.url ? '\n' + tab.url : ''),
    }, row);

    // State indicators
    const meta = el('span', { className: 'wtm-meta' }, row);
    if (tab.audible) el('span', { className: 'wtm-badge audio', text: '\u266A' }, meta);
    if (isPinned) el('span', { className: 'wtm-badge pinned-badge', text: '\u2022' }, meta);

    // Close button
    el('button', {
      className: 'wtm-close',
      title: 'Close tab',
      html: '<svg width="8" height="8" viewBox="0 0 8 8"><path d="M0.5 0.5L7.5 7.5M7.5 0.5L0.5 7.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
      events: {
        click: (e) => { e.stopPropagation(); closeTab(tab.id).catch(showError); },
      },
    }, meta);
  }

  // ── Panel setup ──────────────────────────────────────────────────────

  function initPanelRoot() {
    panelRoot = el('div', { className: 'wtm-root' });
    const statusbar = el('div', { className: 'wtm-statusbar' }, panelRoot);
    el('div', { className: 'wtm-status', text: 'Initializing\u2026' }, statusbar);
    el('button', { className: 'wtm-refresh', text: 'Refresh', events: { click: () => renderBoard(true) } }, statusbar);
    el('div', { className: 'wtm-board' }, panelRoot);
  }

  function ensurePanelUI(panel) {
    panel.querySelectorAll(':scope > .workspace-board-content').forEach((n) => {
      if (n !== panelRoot) n.remove();
    });
    if (!panelRoot) { initPanelRoot(); panelRoot.classList.add('workspace-board-content'); renderBoard(); }
    if (panelRoot.parentNode !== panel) panel.append(panelRoot);
    const wv = panel.querySelector('webview');
    if (wv) { wv.blur?.(); wv.tabIndex = -1; }
    panel.setAttribute('data-' + panelAttr, 'true');
  }

  function createWebPanel() {
    vivaldi.prefs.get('vivaldi.panels.web.elements', (elements) => {
      const list = elements?.value !== undefined ? elements.value : elements;
      let item = list.find((e) => e.id === webPanelId);
      if (!item) {
        item = { activeUrl: panelCode, faviconUrl: panelIcon, faviconUrlValid: true, id: webPanelId, mobileMode: true, origin: 'user', resizable: false, title: panelName, url: panelCode, width: -1, zoom: 1 };
        list.unshift(item);
      } else {
        item.activeUrl = panelCode;
        item.faviconUrl = panelIcon;
        item.faviconUrlValid = true;
        item.url = panelCode;
      }
      vivaldi.prefs.set({ path: 'vivaldi.panels.web.elements', value: list });

      Promise.all(
        ['vivaldi.toolbars.panel', 'vivaldi.toolbars.navigation', 'vivaldi.toolbars.status', 'vivaldi.toolbars.mail', 'vivaldi.toolbars.mail_message', 'vivaldi.toolbars.mail_composer'].map((p) => getPref(p))
      ).then((toolbars) => {
        const hasPanel = toolbars.some((t) => (t || []).some((e) => e === webPanelId));
        if (hasPanel) return;
        const panelToolbar = toolbars[0] || [];
        const insertAt = panelToolbar.findIndex((e) => e.startsWith('WEBPANEL_'));
        panelToolbar.splice(insertAt < 0 ? panelToolbar.length : insertAt, 0, webPanelId);
        return setPref('vivaldi.toolbars.panel', panelToolbar);
      }).catch((err) => console.error('[WTM] toolbar registration failed', err));
    });
  }

  function updatePanel() {
    const buttons = Array.from(
      document.querySelectorAll('.toolbar > .button-toolbar > .ToolbarButton-Button[data-name*="' + webPanelId + '"]')
    );
    const stackChildren = getReactProps('.panel-group .webpanel-stack')?.children?.filter(Boolean) ?? [];
    const idx = stackChildren.findIndex((c) => c.key === webPanelId) + 1;
    const panel = idx > 0
      ? document.querySelector('.panel-group .webpanel-stack .panel.webpanel:nth-child(' + idx + ')')
      : null;
    if (panel && buttons.length) ensurePanelUI(panel);
    buttons.forEach((b) => { b.dataset.workspaceBoardButton = 'true'; });
  }

  function scheduleUpdatePanel() {
    if (scheduleUpdatePanel.queued) return;
    scheduleUpdatePanel.queued = true;
    requestAnimationFrame(() => { scheduleUpdatePanel.queued = false; updatePanel(); });
  }

  // ── Styles ───────────────────────────────────────────────────────────
  //
  // Design principles:
  //   1. Reuse Vivaldi CSS variables (no hardcoded colors)
  //   2. wtm- prefix on every rule to avoid collisions with common.css
  //   3. Tab row dimensions match Vivaldi native: 28px height, 16px favicon
  //   4. Active tab indicator: left border like Vivaldi sidebar selection

  function injectStyles() {
    if (document.getElementById('wtm-styles')) return;

    const css = `
/* ── Panel shell ──────────────────────────────────────────────── */
#panels-container #panels .webpanel-stack [data-workspace-tab-manager] {
  display: flex !important;
  flex-direction: column !important;
  min-height: 0 !important;
  height: 100% !important;
}
#panels-container #panels .webpanel-stack [data-workspace-tab-manager] header.webpanel-header {
  display: none !important;
}
#panels-container #panels .webpanel-stack [data-workspace-tab-manager] .webpanel-content {
  display: none !important;
}
#panels-container #panels .webpanel-stack [data-workspace-tab-manager] .workspace-board-content {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
  overflow: hidden;
}

/* ── Root ─────────────────────────────────────────────────────── */
.wtm-root {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 0;
  background: var(--colorTabBar, var(--colorBg));
  color: var(--colorFg);
  font: 13px/1.3 system-ui, -apple-system, sans-serif;
  overflow: hidden;
}

/* ── Status bar ───────────────────────────────────────────────── */
.wtm-statusbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 4px 10px;
  border-bottom: 1px solid var(--colorBorder);
  background: var(--colorBgDark);
  flex: 0 0 auto;
}
.wtm-status {
  font: 11px/1.2 system-ui, -apple-system, sans-serif;
  color: var(--colorFgFadedMore);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.wtm-refresh {
  appearance: none;
  border: 1px solid var(--colorBorderSubtle, var(--colorBorder));
  border-radius: var(--radiusHalf);
  background: var(--colorBgLightIntense, var(--colorBgLight));
  color: var(--colorFg);
  padding: 3px 8px;
  font: 600 11px/1 system-ui, -apple-system, sans-serif;
  cursor: pointer;
  flex-shrink: 0;
}
.wtm-refresh:hover { background: var(--colorBgIntense, var(--colorBg)); }
.wtm-refresh:active { filter: brightness(0.92); }

/* ── Board grid ───────────────────────────────────────────────── */
.wtm-board {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(240px, 1fr);
  gap: 0;
  align-items: stretch;
  min-height: 0;
  overflow: auto;
  padding: 0;
}

/* ── Workspace column ─────────────────────────────────────────── */
.wtm-col {
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-right: 1px solid var(--colorBorder);
  background: var(--colorTabBar, var(--colorBg));
}
.wtm-col:last-child { border-right: none; }

/* ── Workspace header ─────────────────────────────────────────── */
.wtm-ws-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: var(--colorBgDark);
  border-bottom: 1px solid var(--colorBorder);
  flex: 0 0 auto;
}
.wtm-ws-icon {
  flex: 0 0 22px;
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border-radius: 4px;
  background: var(--colorBgIntense, var(--colorBg));
  overflow: hidden;
}
.wtm-ws-emoji { font-size: 14px; }
.wtm-ws-img {
  width: 100%;
  height: 100%;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
.wtm-ws-letter {
  font: 600 11px/1 system-ui, -apple-system, sans-serif;
  color: var(--colorFg);
}
.wtm-ws-name {
  flex: 1 1 auto;
  min-width: 0;
  font: 600 12px/1.2 system-ui, -apple-system, sans-serif;
  color: var(--colorFg);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.wtm-ws-count {
  flex: 0 0 auto;
  font: 500 10px/1 system-ui, -apple-system, sans-serif;
  color: var(--colorFgFadedMost);
  background: var(--colorBgLightIntense, var(--colorBgLight));
  padding: 2px 5px;
  border-radius: 8px;
}

/* ── Tab list ─────────────────────────────────────────────────── */
.wtm-list {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

/* ── Tab row (matches Vivaldi native tab) ─────────────────────── */
.wtm-tab {
  display: flex;
  align-items: center;
  gap: 0;
  height: 28px;
  min-height: 28px;
  padding: 0 6px 0 8px;
  background: var(--colorTabBar, var(--colorBg));
  color: var(--colorFg);
  cursor: pointer;
  border-bottom: 1px solid var(--colorBorderSubtle, var(--colorBorder));
  position: relative;
}
.wtm-tab:hover { background: var(--colorBgLightIntense, var(--colorBgLight)); }
.wtm-tab.active {
  background: var(--colorBg);
  box-shadow: inset 2px 0 0 var(--colorHighlightBg);
}
.wtm-tab.pinned { }

/* ── Favicon ──────────────────────────────────────────────────── */
.wtm-favicon {
  flex: 0 0 20px;
  width: 20px;
  height: 20px;
  display: grid;
  place-items: center;
  margin-right: 6px;
  overflow: hidden;
}
.wtm-favicon img {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  object-fit: contain;
}
.wtm-fav-letter {
  font: 600 10px/1 system-ui, -apple-system, sans-serif;
  color: var(--colorFgFaded);
}

/* ── Title ────────────────────────────────────────────────────── */
.wtm-title {
  flex: 1 1 0;
  min-width: 0;
  font: 12px/1.2 system-ui, -apple-system, sans-serif;
  color: var(--colorFg);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.wtm-tab:not(.active) .wtm-title { color: var(--colorFgFaded); }

/* ── Meta / badges ────────────────────────────────────────────── */
.wtm-meta {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: 4px;
}
.wtm-badge {
  font: 600 9px/1 system-ui, -apple-system, sans-serif;
  color: var(--colorFgFadedMore);
  width: 14px;
  text-align: center;
}
.wtm-badge.audio { color: var(--colorAccentFg); }
.wtm-badge.pinned-badge { color: var(--colorFgFadedMost); }

/* ── Close button ─────────────────────────────────────────────── */
.wtm-close {
  appearance: none;
  border: 0;
  background: transparent;
  color: var(--colorFgFadedMore);
  width: 18px;
  height: 18px;
  display: grid;
  place-items: center;
  border-radius: 3px;
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  flex-shrink: 0;
  margin-left: 2px;
}
.wtm-close svg { width: 8px; height: 8px; }
.wtm-tab:hover .wtm-close,
.wtm-tab.active .wtm-close {
  opacity: 1;
  pointer-events: auto;
}
.wtm-close:hover {
  background: var(--colorBgIntense, rgba(255,255,255,0.1));
  color: var(--colorFg);
}

/* ── Group header ─────────────────────────────────────────────── */
.wtm-group { border-bottom: 1px solid var(--colorBorderSubtle, var(--colorBorder)); }
.wtm-group-hdr {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  min-height: 26px;
  padding: 0 8px;
  background: var(--colorBgDark);
}
.wtm-group-dot {
  flex: 0 0 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.wtm-group-title {
  flex: 1 1 auto;
  min-width: 0;
  font: 600 11px/1 system-ui, -apple-system, sans-serif;
  color: var(--colorFgFaded);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.wtm-group-badge {
  flex: 0 0 auto;
  font: 500 10px/1 system-ui, -apple-system, sans-serif;
  color: var(--colorFgFadedMost);
}
.wtm-group-body { display: flex; flex-direction: column; }

/* ── Empty states ─────────────────────────────────────────────── */
.wtm-empty {
  display: grid;
  place-items: center;
  gap: 6px;
  min-height: 200px;
  text-align: center;
  color: var(--colorFgFadedMore);
  padding: 20px;
}
.wtm-empty h2 {
  margin: 0;
  font: 600 14px/1.2 system-ui, -apple-system, sans-serif;
  color: var(--colorFg);
}
.wtm-empty p {
  margin: 0;
  font: 12px/1.4 system-ui, -apple-system, sans-serif;
  max-width: 30ch;
}
.wtm-empty-row {
  padding: 16px 12px;
  text-align: center;
  color: var(--colorFgFadedMost);
  font: 12px/1.4 system-ui, -apple-system, sans-serif;
}

/* ── Responsive ───────────────────────────────────────────────── */
@media (max-width: 600px) {
  .wtm-board { grid-auto-columns: minmax(200px, 80vw); }
}
`;

    el('style', { id: 'wtm-styles', text: css }, document.head);
  }

  // ── Observer ─────────────────────────────────────────────────────────

  function observe() {
    const root = document.querySelector('#panels .webpanel-stack') || document.querySelector('#panels') || document.body;
    const observer = new MutationObserver(() => { cacheHandlers(); scheduleUpdatePanel(); });
    observer.observe(root, { childList: true, subtree: true });

    [
      chrome.tabs.onActivated, chrome.tabs.onAttached, chrome.tabs.onCreated,
      chrome.tabs.onDetached, chrome.tabs.onMoved, chrome.tabs.onRemoved,
      chrome.tabs.onUpdated, chrome.windows?.onFocusChanged,
    ].filter(Boolean).forEach((evt) => evt.addListener(queueRefresh));

    if (vivaldi?.prefs?.onChanged) {
      vivaldi.prefs.onChanged.addListener((event) => {
        if (!event?.path) return;
        if (['vivaldi.workspaces.list', 'vivaldi.panels.web.elements', 'vivaldi.toolbars.panel'].includes(event.path)) {
          queueRefresh();
          scheduleUpdatePanel();
        }
      });
    }
  }

  // ── Boot ─────────────────────────────────────────────────────────────

  waitForBrowser(() => {
    injectStyles();
    createWebPanel();
    scheduleUpdatePanel();
    observe();
    queueRefresh();
  });
})();
