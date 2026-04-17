// ==UserScript==
// @name         Workspace Tab Manager
// @description  Cross-workspace virtual tab board for Vivaldi.
// @version      2026.4.17
// @author       PaRr0tBoY
// ==/UserScript==

/*
 * Workspace Tab Manager
 * Cross-workspace virtual tab board for Vivaldi.
 *
 * Design choice:
 * - Register a WebPanel entry
 * - Hide the native webpanel webview
 * - Render the actual UI directly in the host panel DOM
 *
 * Data source choice:
 * - vivaldi.prefs.get("vivaldi.workspaces.list")
 * - chrome.tabs.query({})
 * - vivaldi.tabsPrivate.get(tabId)
 *
 * This avoids depending on private webpack runtime/module access.
 */

(() => {
  'use strict';

  const panelName = 'Workspace Board';
  const panelAttr = 'workspace-tab-manager';
  const webPanelId = 'WEBPANEL_workspace-board-b7d71f8f';
  const uiVersion = 'v1';
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
  const collapsedFolders = new Set();
  const workspaceUiHandlers = new Map();

  function createElement(tagName, attributes, parent, children) {
    const el = document.createElement(tagName);
    if (attributes && typeof attributes === 'object') {
      Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'text') {
          el.textContent = value;
        } else if (key === 'html') {
          el.innerHTML = value;
        } else if (key === 'style' && value && typeof value === 'object') {
          Object.entries(value).forEach(([cssKey, cssValue]) => {
            el.style.setProperty(cssKey, cssValue);
          });
        } else if (key === 'events' && value && typeof value === 'object') {
          Object.entries(value).forEach(([eventName, handler]) => {
            if (typeof handler === 'function') {
              el.addEventListener(eventName, handler);
            }
          });
        } else if (key in el) {
          el[key] = value;
        } else {
          el.setAttribute(key, value);
        }
      });
    }
    if (children != null) {
      const items = Array.isArray(children) ? children : [children];
      items.filter(Boolean).forEach((child) => {
        el.append(child.nodeType ? child : document.createTextNode(String(child)));
      });
    }
    if (parent) {
      parent.append(el);
    }
    return el;
  }

  function getReactProps(element) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    if (!element) {
      return null;
    }
    if (!reactPropsKey) {
      reactPropsKey = Object.keys(element).find((key) => key.startsWith('__reactProps'));
    }
    return reactPropsKey ? element[reactPropsKey] : null;
  }

  function waitForBrowser(callback) {
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      if (destroyed) {
        clearInterval(timer);
        return;
      }
      if (document.getElementById('browser')) {
        clearInterval(timer);
        callback();
      } else if (tries > 100) {
        clearInterval(timer);
      }
    }, 100);
  }

  function callApi(fn, ...args) {
    return new Promise((resolve, reject) => {
      try {
        fn(...args, (result) => {
          const error = chrome.runtime && chrome.runtime.lastError;
          if (error) {
            reject(error);
            return;
          }
          resolve(result);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async function getPref(path) {
    if (!vivaldi?.prefs?.get) {
      throw new Error('vivaldi.prefs.get is unavailable');
    }
    try {
      const value = await vivaldi.prefs.get(path);
      return value && value.value !== undefined ? value.value : value;
    } catch (_error) {
      const value = await callApi(vivaldi.prefs.get.bind(vivaldi.prefs), path);
      return value && value.value !== undefined ? value.value : value;
    }
  }

  async function setPref(path, value) {
    if (!vivaldi?.prefs?.set) {
      throw new Error('vivaldi.prefs.set is unavailable');
    }
    try {
      return await vivaldi.prefs.set({ path, value });
    } catch (_error) {
      return await callApi(vivaldi.prefs.set.bind(vivaldi.prefs), { path, value });
    }
  }

  async function getTabs() {
    try {
      const tabs = await chrome.tabs.query({});
      return tabs.filter((tab) => typeof tab.id === 'number' && tab.id >= 0);
    } catch (_error) {
      const tabs = await callApi(chrome.tabs.query.bind(chrome.tabs), {});
      return tabs.filter((tab) => typeof tab.id === 'number' && tab.id >= 0);
    }
  }

  async function getTabExtra(tabId) {
    if (!vivaldi?.tabsPrivate?.get) {
      return {};
    }
    try {
      return (await vivaldi.tabsPrivate.get(tabId)) || {};
    } catch (_error) {
      try {
        return (await callApi(vivaldi.tabsPrivate.get.bind(vivaldi.tabsPrivate), tabId)) || {};
      } catch (__error) {
        return {};
      }
    }
  }

  async function activateTab(tab) {
    const currentWindowId = await getCurrentWindowId();
    if (tab.workspaceId != null && currentWindowId === tab.windowId) {
      try {
        await activateWorkspaceByUI(tab.workspaceId);
      } catch (error) {
        console.warn('[WorkspaceTabManager] workspace activation fallback', error);
      }
    }
    await chrome.tabs.update(tab.id, { active: true });
    if (chrome.windows?.update) {
      await chrome.windows.update(tab.windowId, { focused: true });
    }
    queueRefresh();
  }

  async function closeTab(tabId) {
    await chrome.tabs.remove(tabId);
    queueRefresh();
  }

  async function reorderWorkspaces(sourceId, targetId) {
    void sourceId;
    void targetId;
    const status = panelRoot && panelRoot.querySelector('.wtm-status');
    if (status) {
      status.textContent = 'Workspace reordering is not implemented yet.';
    }
  }

  function parseVivExtData(value) {
    if (!value) {
      return {};
    }
    if (typeof value === 'object') {
      return value;
    }
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (_error) {
        return {};
      }
    }
    return {};
  }

  function getTabTitle(tab) {
    return (
      tab.extra.fixedTitle ||
      tab.ext.fixedTitle ||
      tab.title ||
      tab.pendingUrl ||
      tab.url ||
      'Untitled'
    );
  }

  function getTabSubtitle(tab) {
    try {
      const url = new URL(tab.url);
      return url.hostname;
    } catch (_error) {
      return tab.url || '';
    }
  }

  function iconTextFromTitle(title) {
    return (title || '?').trim().charAt(0).toUpperCase() || '?';
  }

  function stableStringify(value) {
    try {
      return JSON.stringify(value);
    } catch (_error) {
      return String(Date.now());
    }
  }

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
    (workspaces || []).forEach((workspace) => {
      byWorkspace.set(workspace.id, {
        ...workspace,
        tabs: [],
      });
    });

    enrichedTabs.forEach((tab) => {
      if (tab.workspaceId == null) {
        return;
      }
      if (!byWorkspace.has(tab.workspaceId)) {
        byWorkspace.set(tab.workspaceId, {
          id: tab.workspaceId,
          name: `Unknown ${tab.workspaceId}`,
          icon: '',
          emoji: '',
          tabs: [],
        });
      }
      byWorkspace.get(tab.workspaceId).tabs.push(tab);
    });

    const workspaceList = [...byWorkspace.values()].map((workspace, index) => {
      const sortedTabs = [...workspace.tabs].sort((left, right) => {
        if (left.pinned !== right.pinned) {
          return left.pinned ? -1 : 1;
        }
        if (left.windowId !== right.windowId) {
          return left.windowId - right.windowId;
        }
        return left.index - right.index;
      });

      const groups = new Map();
      sortedTabs.forEach((tab) => {
        if (!tab.groupId) {
          return;
        }
        if (!groups.has(tab.groupId)) {
          groups.set(tab.groupId, {
            type: 'group',
            id: tab.groupId,
            title: tab.fixedGroupTitle || '',
            color: tab.groupColor || '',
            pinned: !!tab.pinned,
            tabs: [],
          });
        }
        groups.get(tab.groupId).tabs.push(tab);
      });

      const seenGroups = new Set();
      const tree = [];
      sortedTabs.forEach((tab) => {
        if (!tab.groupId) {
          tree.push({
            type: 'tab',
            tab,
          });
          return;
        }
        if (seenGroups.has(tab.groupId)) {
          return;
        }
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
        id: workspace.id,
        name: workspace.name,
        icon: workspace.icon,
        emoji: workspace.emoji,
        index,
        tabCount: sortedTabs.length,
        pinnedCount: sortedTabs.filter((tab) => tab.pinned).length,
        tree,
      };
    });

    return workspaceList;
  }

  async function getCurrentWindowId() {
    try {
      const current = await chrome.windows.getCurrent();
      if (current && typeof current.id === 'number') {
        return current.id;
      }
    } catch (_error) {
      // Ignore and fall back to tabs query.
    }
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return activeTab && typeof activeTab.windowId === 'number' ? activeTab.windowId : undefined;
  }

  function getWorkspacePopupButton() {
    const candidates = Array.from(
      document.querySelectorAll(
        '.button-toolbar.workspace-popup button, .button-toolbar.workspace-popup .ToolbarButton-Button, .button-toolbar.workspace-popup'
      )
    );
    return candidates.find((node) => node.getClientRects().length > 0) || candidates[0] || null;
  }

  async function waitForElement(selector, timeout = 1500) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const element = document.querySelector(selector);
      if (element) {
        return element;
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    return null;
  }

  async function ensureWorkspacePopupOpen() {
    let popup = document.querySelector('.WorkspacePopup');
    if (popup) {
      cacheWorkspacePopupHandlers();
      return popup;
    }
    const button = getWorkspacePopupButton();
    if (!button) {
      throw new Error('Workspace button not found');
    }
    const buttonProps = getReactProps(button);
    if (buttonProps && typeof buttonProps.onPointerUp === 'function') {
      buttonProps.onPointerUp(createSyntheticPointerEvent(button));
    } else if (buttonProps && typeof buttonProps.onClick === 'function') {
      buttonProps.onClick(createSyntheticPointerEvent(button));
    }
    button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0 }));
    button.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, button: 0 }));
    button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
    popup = await waitForElement('.WorkspacePopup', 2200);
    if (!popup) {
      throw new Error('Workspace popup did not open');
    }
    cacheWorkspacePopupHandlers();
    return popup;
  }

  function createSyntheticPointerEvent(target) {
    return {
      preventDefault() {},
      stopPropagation() {},
      currentTarget: target,
      target,
      button: 0,
      buttons: 1,
      type: 'click',
    };
  }

  function createSyntheticContextMenuEvent(target) {
    return {
      type: 'contextmenu',
      button: 2,
      buttons: 2,
      clientX: 320,
      clientY: 240,
      pageX: 320,
      pageY: 240,
      screenX: 320,
      screenY: 240,
      currentTarget: target,
      target,
      nativeEvent: {
        type: 'contextmenu',
        button: 2,
        buttons: 2,
        clientX: 320,
        clientY: 240,
        pageX: 320,
        pageY: 240,
        screenX: 320,
        screenY: 240,
        preventDefault() {},
        stopPropagation() {},
      },
      preventDefault() {},
      stopPropagation() {},
      persist() {},
      isDefaultPrevented() {
        return false;
      },
      isPropagationStopped() {
        return false;
      },
    };
  }

  function getWorkspacePopupItems() {
    return Array.from(document.querySelectorAll('.WorkspacePopup .workspace-item-wrapper'));
  }

  function cacheWorkspacePopupHandlers() {
    const items = getWorkspacePopupItems();
    if (!items.length || !lastSnapshotByWorkspaceId.size) {
      return;
    }
    const snapshots = Array.from(lastSnapshotByWorkspaceId.values()).sort((left, right) => left.index - right.index);
    items.forEach((item, index) => {
      const props = getReactProps(item);
      if (!props) {
        return;
      }
      const text = (item.textContent || '').trim();
      const exact = snapshots.find((workspace) => {
        const name = (workspace.name || '').trim();
        return name && text.includes(name);
      });
      const workspace = exact || snapshots[index];
      if (!workspace) {
        return;
      }
      workspaceUiHandlers.set(workspace.id, {
        click: typeof props.onClick === 'function' ? props.onClick : null,
        contextMenu: typeof props.onContextMenu === 'function' ? props.onContextMenu : null,
        ref: item,
      });
    });
  }

  function findWorkspacePopupItem(workspace) {
    const items = getWorkspacePopupItems();
    const textNeedle = (workspace.name || '').trim();
    const exact = items.find((item) => item.textContent && item.textContent.includes(textNeedle));
    return exact || items[workspace.index] || null;
  }

  async function activateWorkspaceByUI(workspaceId) {
    const workspace = lastSnapshotByWorkspaceId.get(workspaceId);
    if (!workspace) {
      return;
    }
    const cached = workspaceUiHandlers.get(workspaceId);
    if (cached && typeof cached.click === 'function') {
      cached.click(createSyntheticPointerEvent(cached.ref || document.body));
      await new Promise((resolve) => setTimeout(resolve, 60));
      return;
    }
    await ensureWorkspacePopupOpen();
    cacheWorkspacePopupHandlers();
    const refreshed = workspaceUiHandlers.get(workspaceId);
    if (refreshed && typeof refreshed.click === 'function') {
      refreshed.click(createSyntheticPointerEvent(refreshed.ref || document.body));
      await new Promise((resolve) => setTimeout(resolve, 60));
      return;
    }
    const item = findWorkspacePopupItem(workspace);
    if (!item) {
      throw new Error('Workspace popup item not found');
    }
    const props = getReactProps(item);
    if (props && typeof props.onClick === 'function') {
      props.onClick(createSyntheticPointerEvent(item));
      await new Promise((resolve) => setTimeout(resolve, 60));
      return;
    }
    item.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0 }));
    item.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, button: 0 }));
    item.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
    await new Promise((resolve) => setTimeout(resolve, 60));
  }

  async function clickMenuItemByLabels(labels) {
    const start = Date.now();
    while (Date.now() - start < 1500) {
      const nodes = Array.from(
        document.querySelectorAll('[role="menuitem"], .menu-item, .context-menu-item, button')
      ).filter((node) => {
        const text = (node.textContent || '').trim();
        return text && labels.some((label) => text.includes(label));
      });
      const target = nodes.find((node) => node.getClientRects().length > 0);
      if (target) {
        target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0 }));
        target.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, button: 0 }));
        target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    return false;
  }

  async function openWorkspaceEditor(workspace) {
    let handler = workspaceUiHandlers.get(workspace.id)?.contextMenu;
    let ref = workspaceUiHandlers.get(workspace.id)?.ref || null;
    if (!handler) {
      await ensureWorkspacePopupOpen();
      cacheWorkspacePopupHandlers();
      handler = workspaceUiHandlers.get(workspace.id)?.contextMenu;
      ref = workspaceUiHandlers.get(workspace.id)?.ref || findWorkspacePopupItem(workspace);
    }
    if (!handler) {
      throw new Error('Workspace context menu handler not found');
    }
    handler(createSyntheticContextMenuEvent(ref || document.body));
    const clicked = await clickMenuItemByLabels(['Edit Workspace', '编辑工作区', '编辑工作區']);
    if (!clicked) {
      throw new Error('Edit Workspace menu item not found');
    }
  }

  function toggleFolder(workspaceId, groupId) {
    const key = workspaceId + ':' + groupId;
    if (collapsedFolders.has(key)) {
      collapsedFolders.delete(key);
    } else {
      collapsedFolders.add(key);
    }
    renderBoard(true);
  }

  function renderEmpty(container, title, detail) {
    container.textContent = '';
    const empty = createElement('div', { className: 'wtm-empty' }, container);
    createElement('h2', { text: title }, empty);
    createElement('p', { text: detail }, empty);
  }

  function renderWorkspaceColumn(board, workspace) {
    const column = createElement('div', {
      className: 'wtm-workspace',
      draggable: false,
    }, board);
    column.style.setProperty('--wtm-accent', workspace.emoji ? '#94d2ff' : accentColorForIndex(workspace.index));
    column.dataset.workspaceId = String(workspace.id);

    const editor = createElement('header', { className: 'wtm-workspace-editor' }, column);
    const identity = createElement('div', { className: 'wtm-workspace-identity' }, editor);
    const iconButton = createElement('button', {
      className: 'wtm-workspace-icon-button',
      title: 'Edit workspace icon',
      events: {
        click: (event) => {
          event.stopPropagation();
          openWorkspaceEditor(workspace).catch(showError);
        },
      },
    }, identity);
    renderWorkspaceIcon(iconButton, workspace);
    createElement('button', {
      className: 'wtm-workspace-name-button',
      title: 'Edit workspace name',
      text: workspace.name || 'Untitled Workspace',
      events: {
        click: (event) => {
          event.stopPropagation();
          openWorkspaceEditor(workspace).catch(showError);
        },
      },
    }, identity);
    createElement('button', {
      className: 'wtm-workspace-theme-button',
      title: 'Theme per workspace (not implemented yet)',
      text: '◐',
      events: {
        click: (event) => {
          event.stopPropagation();
          const status = panelRoot && panelRoot.querySelector('.wtm-status');
          if (status) {
            status.textContent = 'Per-workspace theme editing is not implemented yet.';
          }
        },
      },
    }, editor);

    const list = createElement('div', { className: 'wtm-tab-list' }, column);
    workspace.tree.forEach((node) => {
      if (node.type === 'group') {
        renderGroup(list, workspace, node);
      } else {
        renderTabCard(list, node.tab);
      }
    });

    if (!workspace.tree.length) {
      createElement('div', {
        className: 'wtm-empty-inline',
        text: 'No tabs in this workspace.',
      }, list);
    }

    const footer = createElement('footer', { className: 'wtm-workspace-footer' }, column);
    createElement('button', {
      className: 'wtm-reorder-handle',
      title: 'Workspace reordering is not implemented yet',
      html:
        '<svg viewBox="0 0 16 16" aria-hidden="true">' +
        '<path d="M8 1.5 5.5 4h1.75v3h-3V5.25L1.5 8l2.75 2.75V9h3v3H5.5L8 14.5 10.5 12H8.75V9h3v1.75L14.5 8 11.75 5.25V7h-3V4h1.75L8 1.5Z" fill="currentColor"/>' +
        '</svg>',
      events: {
        click: (event) => {
          event.stopPropagation();
          reorderWorkspaces(workspace.id, workspace.id).catch(showError);
        },
      },
    }, footer);
  }

  function renderWorkspaceIcon(button, workspace) {
    button.textContent = '';
    if (workspace.emoji) {
      createElement('span', {
        className: 'wtm-workspace-icon-emoji',
        text: workspace.emoji,
      }, button);
      return;
    }
    if (workspace.icon) {
      createElement('span', {
        className: 'wtm-workspace-icon-image',
        style: {
          'background-image': 'url("' + workspace.icon + '")',
        },
      }, button);
      return;
    }
    createElement('span', {
      className: 'wtm-workspace-icon-fallback',
      text: iconTextFromTitle(workspace.name),
    }, button);
  }

  function renderGroup(parent, workspace, group) {
    const folderKey = workspace.id + ':' + group.id;
    const collapsed = collapsedFolders.has(folderKey);
    const groupEl = createElement('div', {
      className: 'wtm-group' + (collapsed ? ' is-collapsed' : ''),
    }, parent);
    const header = createElement('button', {
      className: 'wtm-group-header',
      title: group.title,
      events: {
        click: (event) => {
          event.stopPropagation();
          toggleFolder(workspace.id, group.id);
        },
      },
    }, groupEl);
    createElement('span', {
      className: 'wtm-group-chevron',
      text: collapsed ? '▸' : '▾',
    }, header);
    const title = createElement('div', { className: 'wtm-group-title' }, header);
    const folder = createElement('span', { className: 'wtm-group-folder' }, title);
    createElement('span', { className: 'wtm-group-folder-back' }, folder);
    const folderFront = createElement('span', { className: 'wtm-group-folder-front' }, folder);
    if (group.color) {
      folderFront.style.borderColor = group.color;
      folderFront.style.background = group.color;
    }
    createElement('span', {
      className: 'wtm-group-title-text',
      text: group.title,
    }, title);
    createElement('span', {
      className: 'wtm-group-count',
      text: String(group.tabs.length),
    }, header);

    if (collapsed) {
      return;
    }

    const body = createElement('div', { className: 'wtm-group-body' }, groupEl);
    group.tabs.forEach((tab) => renderTabCard(body, tab));
  }

  function renderTabCard(parent, tab) {
    const card = createElement('article', {
      className: 'wtm-tab' + (tab.active ? ' is-active' : '') + (tab.pinned ? ' is-pinned' : ''),
      events: {
        click: () => activateTab(tab).catch(showError),
      },
    }, parent);

    const avatar = createElement('div', {
      className: 'wtm-tab-avatar',
      text: iconTextFromTitle(getTabTitle(tab)),
    }, card);
    if (tab.favIconUrl) {
      avatar.style.backgroundImage = `url("${tab.favIconUrl}")`;
      avatar.classList.add('has-image');
      avatar.textContent = '';
    }

    const content = createElement('div', { className: 'wtm-tab-content' }, card);
    createElement('div', {
      className: 'wtm-tab-title',
      text: getTabTitle(tab),
      title: getTabTitle(tab),
    }, content);
    createElement('div', {
      className: 'wtm-tab-subtitle',
      text: getTabSubtitle(tab),
      title: tab.url,
    }, content);

    const meta = createElement('div', { className: 'wtm-tab-meta' }, card);
    if (tab.audible) {
      createElement('span', { className: 'wtm-tab-state', text: '♪' }, meta);
    }
    if (tab.pinned) {
      createElement('span', { className: 'wtm-tab-state', text: '•' }, meta);
    }
    createElement('button', {
      className: 'wtm-close',
      title: 'Close tab',
      text: '×',
      events: {
        click: (event) => {
          event.stopPropagation();
          closeTab(tab.id).catch(showError);
        },
      },
    }, meta);
  }

  function accentColorForIndex(index) {
    const palette = [
      '#7ca7ff',
      '#9c7cff',
      '#4dd0c8',
      '#ff9c73',
      '#ffd166',
      '#8ed081',
      '#ff7fb7',
      '#7be0ff',
    ];
    return palette[index % palette.length];
  }

  async function renderBoard(force = false) {
    if (!panelRoot) {
      return;
    }
    const board = panelRoot.querySelector('.wtm-board');
    const status = panelRoot.querySelector('.wtm-status');
    status.textContent = 'Refreshing…';

    try {
      const workspaces = await buildWorkspaceSnapshot();
      const snapshotKey = stableStringify(
        workspaces.map((workspace) => ({
          id: workspace.id,
          name: workspace.name,
          count: workspace.tabCount,
          tree: workspace.tree.map((node) =>
            node.type === 'group'
              ? { type: 'group', id: node.id, count: node.tabs.length }
              : { type: 'tab', id: node.tab.id }
          ),
        }))
      );

      lastSnapshotByWorkspaceId = new Map(workspaces.map((workspace) => [workspace.id, workspace]));
      cacheWorkspacePopupHandlers();

      if (!force && snapshotKey === currentSnapshotKey && board.childElementCount > 0) {
        status.textContent = `${workspaces.length} workspaces`;
        return;
      }
      currentSnapshotKey = snapshotKey;

      board.textContent = '';
      if (!workspaces.length) {
        renderEmpty(board, 'No workspaces found', 'Enable workspaces or create one first.');
        status.textContent = '0 workspaces';
        return;
      }
      workspaces.forEach((workspace) => renderWorkspaceColumn(board, workspace));
      status.textContent = `${workspaces.length} workspaces`;
    } catch (error) {
      showError(error);
      renderEmpty(board, 'Unable to load workspace board', String(error && error.message ? error.message : error));
      status.textContent = 'Load failed';
    }
  }

  function showError(error) {
    const message = error && error.message ? error.message : String(error);
    console.error('[WorkspaceTabManager]', error);
    const status = panelRoot && panelRoot.querySelector('.wtm-status');
    if (status) {
      status.textContent = message;
    }
  }

  function queueRefresh() {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }
    refreshTimer = setTimeout(() => {
      refreshTimer = null;
      renderBoard();
    }, 120);
  }

  function initPanelRoot() {
    panelRoot = createElement('div', { className: 'wtm-root' });
    panelRoot.dataset.workspaceTabManagerUiVersion = uiVersion;
    const statusbar = createElement('div', { className: 'wtm-statusbar' }, panelRoot);
    createElement('div', { className: 'wtm-status', text: 'Initializing…' }, statusbar);
    createElement('button', {
      className: 'wtm-refresh',
      text: 'Refresh',
      events: { click: () => renderBoard() },
    }, statusbar);
    createElement('div', { className: 'wtm-board' }, panelRoot);
  }

  function ensurePanelUI(panel) {
    panel.querySelectorAll(':scope > .workspace-board-content').forEach((node) => {
      if (node !== panelRoot) {
        node.remove();
      }
    });

    if (panelRoot && panelRoot.dataset.workspaceTabManagerUiVersion !== uiVersion) {
      panelRoot.remove();
      panelRoot = null;
      currentSnapshotKey = '';
    }

    if (!panelRoot) {
      initPanelRoot();
      panelRoot.classList.add('workspace-board-content');
      renderBoard();
    }

    if (panelRoot.parentNode !== panel) {
      panel.append(panelRoot);
    }

    const webview = panel.querySelector('webview');
    if (webview) {
      webview.blur?.();
      webview.tabIndex = -1;
    }

    panel.setAttribute('data-' + panelAttr, 'true');
  }

  function createWebPanel() {
    vivaldi.prefs.get('vivaldi.panels.web.elements', (elements) => {
      const elementList = elements && elements.value !== undefined ? elements.value : elements;
      let element = elementList.find((item) => item.id === webPanelId);
      if (!element) {
        element = {
          activeUrl: panelCode,
          faviconUrl: panelIcon,
          faviconUrlValid: true,
          id: webPanelId,
          mobileMode: true,
          origin: 'user',
          resizable: false,
          title: panelName,
          url: panelCode,
          width: -1,
          zoom: 1,
        };
        elementList.unshift(element);
      } else {
        element.activeUrl = panelCode;
        element.faviconUrl = panelIcon;
        element.faviconUrlValid = true;
        element.url = panelCode;
      }

      vivaldi.prefs.set({
        path: 'vivaldi.panels.web.elements',
        value: elementList,
      });

      Promise.all(
        [
          'vivaldi.toolbars.panel',
          'vivaldi.toolbars.navigation',
          'vivaldi.toolbars.status',
          'vivaldi.toolbars.mail',
          'vivaldi.toolbars.mail_message',
          'vivaldi.toolbars.mail_composer',
        ].map((path) => getPref(path))
      ).then((toolbars) => {
        const hasPanel = toolbars.some((toolbar) => (toolbar || []).some((entry) => entry === webPanelId));
        if (hasPanel) {
          return;
        }
        const panelToolbar = toolbars[0] || [];
        const insertAt = panelToolbar.findIndex((entry) => entry.startsWith('WEBPANEL_'));
        panelToolbar.splice(insertAt < 0 ? panelToolbar.length : insertAt, 0, webPanelId);
        return setPref('vivaldi.toolbars.panel', panelToolbar);
      }).catch((error) => {
        console.error('[WorkspaceTabManager] createWebPanel toolbar registration failed', error);
      });
    });
  }

  function updatePanel() {
    const buttons = Array.from(
      document.querySelectorAll('.toolbar > .button-toolbar > .ToolbarButton-Button[data-name*="' + webPanelId + '"]')
    );
    const stackChildren = getReactProps('.panel-group .webpanel-stack')?.children?.filter(Boolean) ?? [];
    const webPanelIndex = stackChildren.findIndex((item) => item.key === webPanelId) + 1;
    const panel = webPanelIndex > 0
      ? document.querySelector('.panel-group .webpanel-stack .panel.webpanel:nth-child(' + webPanelIndex + ')')
      : null;

    if (panel && buttons.length) {
      ensurePanelUI(panel);
    }

    buttons.forEach((button) => {
      button.dataset.workspaceBoardButton = 'true';
    });
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

  function injectStyles() {
    if (document.getElementById('workspace-board-styles')) {
      return;
    }

    const css = [
      ':root { --wtm-accent-default:#606469; }',
      '#panels-container #panels .webpanel-stack [data-workspace-tab-manager] { display:flex !important; flex-direction:column !important; min-height:0 !important; height:100% !important; }',
      '#panels-container #panels .webpanel-stack [data-workspace-tab-manager] header.webpanel-header { display:none !important; }',
      '#panels-container #panels .webpanel-stack [data-workspace-tab-manager] .webpanel-content { display:none !important; }',
      '#panels-container #panels .webpanel-stack [data-workspace-tab-manager] .workspace-board-content { display:flex; flex:1 1 auto; min-height:0; width:100%; overflow:hidden; }',
      'button[data-name="' + webPanelId + '"] { position:relative; }',
      'button[data-name="' + webPanelId + '"] img { opacity:0 !important; }',
      'button[data-name="' + webPanelId + '"]::before { position:absolute; left:50%; top:50%; width:18px; height:18px; content:""; transform:translate(-50%,-50%); background-color:var(--colorFg); -webkit-mask-image:url(' + JSON.stringify(panelIconMask) + '); -webkit-mask-repeat:no-repeat; -webkit-mask-position:center; -webkit-mask-size:contain; mask-image:url(' + JSON.stringify(panelIconMask) + '); mask-repeat:no-repeat; mask-position:center; mask-size:contain; }',
      '.wtm-root button, .wtm-root input, .wtm-root select, .wtm-root textarea { appearance:none !important; -webkit-appearance:none !important; box-shadow:none !important; }',
      '.wtm-root { display:flex; flex-direction:column; width:100%; min-height:0; background:var(--colorTabBar, var(--colorBg)); color:var(--colorFg); overflow:hidden; }',
      '.wtm-statusbar { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:6px 10px; border-bottom:1px solid var(--colorBorder); background:var(--colorBg); }',
      '.wtm-status { font:600 11px/1.2 "SF Mono","Menlo",monospace; color:var(--colorFgFadedMore); }',
      '.wtm-refresh { appearance:none; border:1px solid var(--colorBorderSubtle, var(--colorBorder)); border-radius:var(--radiusHalf); background:var(--colorBgLightIntense, var(--colorBgLight)); color:var(--colorFg); padding:4px 8px; font:600 11px/1 "Avenir Next",sans-serif; cursor:pointer; }',
      '.wtm-board { display:grid; grid-auto-flow:column; grid-auto-columns:minmax(220px, 1fr); gap:8px; align-items:stretch; min-height:0; overflow:auto; padding:8px; }',
      '.wtm-workspace { --wtm-accent: var(--wtm-accent-default); display:flex; flex-direction:column; min-height:180px; height:100%; background:var(--colorBgDark); border:1px solid var(--colorBorder); border-radius:var(--radius); overflow:hidden; }',
      '.wtm-workspace-editor { display:flex; align-items:center; gap:6px; padding:6px; border-bottom:1px solid var(--colorBorder); background:var(--colorBgDark); }',
      '.wtm-workspace-identity { display:flex; align-items:center; gap:4px; min-width:0; flex:1 1 auto; padding:2px; border-radius:var(--radiusHalf); }',
      '.wtm-workspace-identity:hover { background:var(--colorBg); }',
      '.wtm-workspace-icon-button, .wtm-workspace-name-button, .wtm-workspace-theme-button, .wtm-reorder-handle { appearance:none; border:0; background:transparent; color:inherit; cursor:pointer; }',
      '.wtm-workspace-icon-button { flex:0 0 auto; width:26px; height:26px; border-radius:var(--radiusHalf); display:grid; place-items:center; color:var(--colorFg); }',
      '.wtm-workspace-icon-emoji, .wtm-workspace-icon-fallback { font:700 14px/1 "Avenir Next",sans-serif; }',
      '.wtm-workspace-icon-image { width:16px; height:16px; border-radius:4px; background-size:contain; background-repeat:no-repeat; background-position:center; }',
      '.wtm-workspace-icon-button:hover, .wtm-workspace-name-button:hover, .wtm-workspace-theme-button:hover, .wtm-reorder-handle:hover { background:var(--colorBg); }',
      '.wtm-workspace-name-button { flex:1 1 auto; min-width:0; padding:0 4px; text-align:left; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font:600 13px/1.2 "Avenir Next",sans-serif; color:var(--colorFg); border-radius:var(--radiusHalf); }',
      '.wtm-workspace-theme-button { flex:0 0 auto; width:26px; height:26px; border-radius:var(--radiusHalf); color:var(--colorFgFadedMore); opacity:.72; }',
      '.wtm-tab-list { display:flex; flex:1 1 auto; flex-direction:column; gap:0; overflow:auto; min-height:0; background:var(--colorBgDark); }',
      '.wtm-group { display:block !important; flex:0 1 auto !important; align-self:stretch !important; width:100% !important; max-width:100% !important; margin:0 !important; padding:0 !important; min-height:0 !important; overflow:visible !important; position:static !important; background:transparent; border-bottom:1px solid color-mix(in srgb, var(--colorBorder) 70%, transparent); }',
      '.wtm-group-header { appearance:none; display:grid; grid-template-columns: 12px minmax(0,1fr) auto; align-items:center; gap:8px; width:100%; max-width:100%; min-height:30px; padding:0 8px; background:transparent; color:var(--colorFg); text-align:left; cursor:pointer; }',
      '.wtm-group-header:hover { background:var(--colorBg); }',
      '.wtm-group-chevron { color:var(--colorFgFadedMore); font:600 10px/1 "SF Mono",monospace; }',
      '.wtm-group-title { display:flex; align-items:center; gap:8px; min-width:0; font:600 12px/1.2 "Avenir Next",sans-serif; color:var(--colorFg); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
      '.wtm-group-folder { position:relative; width:14px; height:11px; flex:0 0 auto; }',
      '.wtm-group-folder-back { position:absolute; left:0; top:3px; width:14px; height:8px; border:1px solid color-mix(in srgb, var(--colorBorder) 80%, transparent); border-radius:3px; background:color-mix(in srgb, var(--colorBg) 85%, transparent); }',
      '.wtm-group-folder-front { position:absolute; left:1px; top:1px; width:8px; height:4px; border:1px solid color-mix(in srgb, var(--colorBorder) 80%, transparent); border-bottom:0; border-radius:3px 3px 0 0; background:color-mix(in srgb, var(--wtm-accent) 55%, var(--colorBg)); }',
      '.wtm-group-title-text { min-width:0; overflow:hidden; text-overflow:ellipsis; }',
      '.wtm-group-count { font:600 10px/1 "SF Mono",monospace; color:var(--colorFgFadedMost); }',
      '.wtm-group-body { display:block !important; width:100% !important; max-width:100% !important; margin:0 !important; padding:0 0 0 18px !important; overflow:visible !important; min-height:0 !important; }',
      '.wtm-group-body > .wtm-tab, .wtm-group-body > .wtm-empty-inline { width:100%; max-width:100%; margin:0 !important; }',
      '.wtm-tab { display:grid; grid-template-columns: 18px minmax(0,1fr) auto; width:100%; max-width:100%; gap:8px; align-items:center; min-height:30px; padding:0 6px 0 8px; border-bottom:1px solid color-mix(in srgb, var(--colorBorder) 70%, transparent); background:var(--colorBgDark); color:var(--colorFg); cursor:pointer; }',
      '.wtm-tab:hover { background:var(--colorBg); }',
      '.wtm-tab.is-active { background:var(--colorBg); box-shadow: inset 2px 0 0 var(--colorHighlightBg); }',
      '.wtm-tab-avatar { width:16px; height:16px; border-radius:4px; display:grid; place-items:center; color:var(--colorFgFaded); font:700 10px/1 "Avenir Next",sans-serif; background-size:contain; background-repeat:no-repeat; background-position:center; }',
      '.wtm-tab-avatar.has-image { background-color:transparent; }',
      '.wtm-tab-content { min-width:0; display:flex; align-items:center; }',
      '.wtm-tab-title { font:500 12px/1.2 "Avenir Next",sans-serif; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
      '.wtm-tab-subtitle { display:none; }',
      '.wtm-tab-meta { display:flex; align-items:center; gap:4px; }',
      '.wtm-tab-state { width:14px; text-align:center; color:var(--colorFgFadedMore); font:700 10px/1 "SF Mono",monospace; }',
      '.wtm-close { width:18px; height:18px; border:0; border-radius:var(--radiusHalf); color:var(--colorFgFadedMore); background:transparent; font:700 12px/1 sans-serif; opacity:0; pointer-events:none; }',
      '.wtm-tab:hover .wtm-close, .wtm-tab.is-active .wtm-close { opacity:1; pointer-events:auto; }',
      '.wtm-close:hover { color:var(--colorFg); }',
      '.wtm-workspace-footer { display:flex; align-items:center; justify-content:flex-start; min-height:30px; padding:4px 6px; border-top:1px solid var(--colorBorder); background:var(--colorBgDark); }',
      '.wtm-reorder-handle { width:24px; height:24px; display:grid; place-items:center; border-radius:var(--radiusHalf); color:var(--colorFgFadedMore); }',
      '.wtm-reorder-handle svg { width:14px; height:14px; }',
      '.wtm-empty { display:grid; place-items:center; gap:8px; min-height:240px; text-align:center; color:var(--colorFgFadedMore); }',
      '.wtm-empty h2 { margin:0; color:var(--colorFg); font:700 18px/1.1 "Avenir Next",sans-serif; }',
      '.wtm-empty p { margin:0; max-width:42ch; font:500 12px/1.5 "Avenir Next",sans-serif; }',
      '.wtm-empty-inline { padding:18px 12px; text-align:center; color:var(--colorFgFadedMore); font:500 12px/1.4 "Avenir Next",sans-serif; }',
      '@media (max-width: 900px) { .wtm-board { grid-auto-columns:minmax(200px, 72vw); } }',
    ].join('\n');

    createElement('style', {
      id: 'workspace-board-styles',
      text: css,
    }, document.head);
  }

  function observe() {
    const observerRoot =
      document.querySelector('#panels .webpanel-stack') ||
      document.querySelector('#panels') ||
      document.body;

    const observer = new MutationObserver(() => {
      cacheWorkspacePopupHandlers();
      scheduleUpdatePanel();
    });
    observer.observe(observerRoot, { childList: true, subtree: true });

    const refreshEvents = [
      chrome.tabs.onActivated,
      chrome.tabs.onAttached,
      chrome.tabs.onCreated,
      chrome.tabs.onDetached,
      chrome.tabs.onMoved,
      chrome.tabs.onRemoved,
      chrome.tabs.onUpdated,
      chrome.windows && chrome.windows.onFocusChanged,
    ].filter(Boolean);

    refreshEvents.forEach((eventTarget) => {
      eventTarget.addListener(queueRefresh);
    });

    if (vivaldi?.prefs?.onChanged) {
      vivaldi.prefs.onChanged.addListener((event) => {
        if (!event || !event.path) {
          return;
        }
        if (
          event.path === 'vivaldi.workspaces.list' ||
          event.path === 'vivaldi.panels.web.elements' ||
          event.path === 'vivaldi.toolbars.panel'
        ) {
          queueRefresh();
          scheduleUpdatePanel();
        }
      });
    }
  }

  waitForBrowser(() => {
    injectStyles();
    createWebPanel();
    scheduleUpdatePanel();
    observe();
    queueRefresh();
  });
})();
