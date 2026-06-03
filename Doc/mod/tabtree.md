# Vivaldi Workspaces And Tab Tree Notes

## Goal

确认 Vivaldi 如何获取：

- 工作区列表
- 工作区内的标签页
- 工作区内的标签树结构

并给出一段可以直接在 Vivaldi UI DevTools Console 中执行的脚本，返回所有工作区和工作区对应的标签树。

## Conclusion

这次确认了两条路线：

1. Vivaldi 内部 UI 确实有现成的 store/getter 组合在用
2. 在当前 DevTools 上下文里拿不到 webpack runtime，因此直接调用内部模块不稳定

最终采用的是第二条的可执行方案：

- 工作区列表通过 `vivaldi.prefs.get("vivaldi.workspaces.list")` 获取
- 标签列表通过 `chrome.tabs.query({})` 获取
- 单个标签的 Vivaldi 扩展数据通过 `vivaldi.tabsPrivate.get(tabId)` 获取
- 工作区归属和 stack/group 信息通过 `vivExtData` 解析得到

这条方案在当前版本中已经实测可用，并且能还原出完整的 workspace tree。

## Internal Findings

虽然最终没有直接依赖内部模块，但已经确认 Vivaldi UI 内部确实在使用下面这组 getter：

- workspace store: `Qn.Z.getWorkspaces()`
- workspace store: `Qn.Z.getWorkspaceById(id)`
- workspace store: `Qn.Z.getActiveWorkspaceId(windowId)`
- workspace store: `Qn.Z.getActiveWorkspaces()`
- page store: `ce.ZP.getWorkspacePages(workspaceId)`
- page store: `ce.ZP.getWorkspaceTabs(workspaceId, stackingOff)`
- page store: `ce.ZP.getWorkspaceTabsInWindow(windowId, workspaceId, stackingOff)`

侧栏 `Windows and Tabs` 面板会直接用：

- `Qn.Z.getWorkspaces()`
- `ce.ZP.getWorkspaceTabs(workspaceId, false)`

工作区标签栏等位置则会用：

- `ce.ZP.getWorkspaceTabsInWindow(windowId, workspaceId, ...)`

对应源码定位：

- `Doc/EveryAPI.txt` 中有 `sessionsPrivate` 的 workspace 数据结构定义，但更偏会话模型，不是这次最终采用的 live 数据入口
- `Others/UsefulResources/Source/source/pretty-bundle.js` 中能看到上述 getter 的使用痕迹

## Why The Internal Runtime Path Was Abandoned

一开始尝试通过 webpack runtime 直接取模块：

- module `53454` 对应 workspace store
- module `83065` 对应 page/tab store

但在当前 Vivaldi UI DevTools 上下文中：

- `globalThis` 上没有 `webpackChunk*`
- `self.webpackChunkgapp_browser_react` 不存在
- webpack runtime 没有暴露到全局

因此“控制台直接 require 内部模块”的方式在当前版本/当前上下文不稳定，不适合作为文档里的主方案。

## Stable Data Sources

### 1. Workspace List

工作区列表来自：

```js
vivaldi.prefs.get("vivaldi.workspaces.list")
```

相关文档记录：

- `Doc/LonmDoc/vivaldi-preferences.txt`
- 条目：`vivaldi.workspaces.list`
- 描述：`A list of all the workspaces`

### 2. Tab List

全部标签来自：

```js
chrome.tabs.query({})
```

### 3. Vivaldi-Specific Tab Data

单个标签的 Vivaldi 扩展信息来自：

```js
vivaldi.tabsPrivate.get(tabId)
```

`EveryAPI.txt` 里也有对应描述：

- `tabsPrivate.get`
- 含义：`Get Vivaldi-specific properties from the tab.`

### 4. Workspace And Group Metadata

标签和工作区/分组的关系不在标准 `chrome.tabs.Tab` 里，而是在 `vivExtData` 里。

本次确认到的关键字段有：

- `workspaceId`
- `group`
- `groupColor`
- `fixedTitle`
- `fixedGroupTitle`
- `parentFollowerTabExtId`
- `followerTabExtId`
- `ext_id`

## Design

### Overall Strategy

设计分成四步：

1. 读取所有工作区定义
2. 读取所有标签
3. 为每个标签补齐 `tabsPrivate.get(tabId)` 的额外信息
4. 按 `workspaceId` 和 `group` 重建树

### Tree Reconstruction Rule

重建规则如下：

- 先按 `workspaceId` 把标签分配到对应工作区
- 在同一个工作区内，按 `pinned`、`windowId`、`index` 排序
- 若某 tab 有 `groupId`，则将其归入对应 group
- 输出 tree 时：
  - 首次遇到某个 group，就输出一个 `type: "group"` 节点
  - group 下的 tab 放进 `children`
  - 没有 group 的 tab 直接作为 `type: "tab"` 节点输出

这个结构和 Vivaldi 面板内部的 tree 表达方式不完全相同，但足够准确地反映：

- 每个 workspace 下有哪些 tab
- 哪些 tab 属于同一个 stack/group
- tab 的显示顺序

## Full Console Script

下面这段代码已经在当前版本中测试成功，可以直接在 Vivaldi UI DevTools Console 中运行：

```js
(async () => {
  const call = (fn, ...args) =>
    new Promise((resolve, reject) => {
      try {
        fn(...args, (result) => {
          const err = chrome.runtime?.lastError;
          if (err) reject(err);
          else resolve(result);
        });
      } catch (e) {
        reject(e);
      }
    });

  const getPref = async (path) => {
    if (vivaldi?.prefs?.get) {
      try {
        const v = await vivaldi.prefs.get(path);
        if (v !== undefined) return v;
      } catch {}
      return await call(vivaldi.prefs.get.bind(vivaldi.prefs), path);
    }
    throw new Error("vivaldi.prefs.get 不可用");
  };

  const queryTabs = async () => {
    try {
      return await chrome.tabs.query({});
    } catch {
      return await call(chrome.tabs.query.bind(chrome.tabs), {});
    }
  };

  const getTabExtra = async (tabId) => {
    if (!vivaldi?.tabsPrivate?.get) return {};
    try {
      const v = await vivaldi.tabsPrivate.get(tabId);
      return v ?? {};
    } catch {
      try {
        return (await call(vivaldi.tabsPrivate.get.bind(vivaldi.tabsPrivate), tabId)) ?? {};
      } catch {
        return {};
      }
    }
  };

  const parseVivExtData = (value) => {
    if (!value) return {};
    if (typeof value === "object") return value;
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return {};
      }
    }
    return {};
  };

  const titleOf = (tab, extra) =>
    extra.fixedTitle ||
    tab.title ||
    extra.title ||
    tab.pendingUrl ||
    tab.url ||
    "";

  const workspaces = await getPref("vivaldi.workspaces.list");
  const tabs = await queryTabs();
  const enrichedTabs = await Promise.all(
    tabs.map(async (tab) => {
      const extra = await getTabExtra(tab.id);
      const ext = parseVivExtData(extra.vivExtData ?? tab.vivExtData);
      return {
        ...tab,
        extra,
        ext,
        workspaceId: ext.workspaceId,
        groupId: ext.group || "",
        fixedTitle: ext.fixedTitle || extra.fixedTitle || "",
        groupColor: ext.groupColor || extra.groupColor || "",
        parentFollowerTabExtId: ext.parentFollowerTabExtId || "",
        followerTabExtId: ext.followerTabExtId || "",
        extId: ext.ext_id || "",
      };
    })
  );

  const byWorkspace = new Map();
  for (const ws of workspaces || []) {
    byWorkspace.set(ws.id, {
      id: ws.id,
      name: ws.name,
      icon: ws.icon,
      emoji: ws.emoji,
      tabs: [],
    });
  }

  for (const tab of enrichedTabs) {
    if (tab.workspaceId == null) continue;
    if (!byWorkspace.has(tab.workspaceId)) {
      byWorkspace.set(tab.workspaceId, {
        id: tab.workspaceId,
        name: `(unknown ${tab.workspaceId})`,
        icon: "",
        emoji: "",
        tabs: [],
      });
    }
    byWorkspace.get(tab.workspaceId).tabs.push(tab);
  }

  const buildWorkspaceTree = (tabsInWorkspace) => {
    const sorted = [...tabsInWorkspace].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (a.windowId !== b.windowId) return a.windowId - b.windowId;
      return a.index - b.index;
    });

    const groups = new Map();
    for (const tab of sorted) {
      if (tab.groupId) {
        if (!groups.has(tab.groupId)) {
          groups.set(tab.groupId, {
            type: "group",
            groupId: tab.groupId,
            title: tab.ext.fixedGroupTitle || "",
            color: tab.groupColor || "",
            tabs: [],
          });
        }
        groups.get(tab.groupId).tabs.push(tab);
      }
    }

    const seenGroups = new Set();
    const tree = [];

    for (const tab of sorted) {
      if (tab.groupId) {
        if (seenGroups.has(tab.groupId)) continue;
        seenGroups.add(tab.groupId);

        const g = groups.get(tab.groupId);
        tree.push({
          type: "group",
          groupId: g.groupId,
          title:
            g.title ||
            g.tabs[0]?.fixedTitle ||
            g.tabs[0]?.title ||
            g.tabs[0]?.url ||
            "",
          color: g.color,
          pinned: !!g.tabs[0]?.pinned,
          windowId: g.tabs[0]?.windowId,
          children: g.tabs.map((t) => ({
            type: "tab",
            id: t.id,
            windowId: t.windowId,
            index: t.index,
            title: titleOf(t, t.extra),
            url: t.url,
            active: !!t.active,
            pinned: !!t.pinned,
            discarded: !!t.discarded,
            muted: !!t.mutedInfo?.muted,
            workspaceId: t.workspaceId,
            groupId: t.groupId,
            extId: t.extId,
            parentFollowerTabExtId: t.parentFollowerTabExtId,
            followerTabExtId: t.followerTabExtId,
          })),
        });
      } else {
        tree.push({
          type: "tab",
          id: tab.id,
          windowId: tab.windowId,
          index: tab.index,
          title: titleOf(tab, tab.extra),
          url: tab.url,
          active: !!tab.active,
          pinned: !!tab.pinned,
          discarded: !!tab.discarded,
          muted: !!tab.mutedInfo?.muted,
          workspaceId: tab.workspaceId,
          groupId: "",
          extId: tab.extId,
          parentFollowerTabExtId: tab.parentFollowerTabExtId,
          followerTabExtId: tab.followerTabExtId,
        });
      }
    }

    return tree;
  };

  const result = {
    workspaces: [...byWorkspace.values()].map((ws) => ({
      id: ws.id,
      name: ws.name,
      icon: ws.icon,
      emoji: ws.emoji,
      tree: buildWorkspaceTree(ws.tabs),
    })),
  };

  console.log(result);
  return result;
})();
```

## Expected Output Shape

返回值结构大致如下：

```js
{
  workspaces: [
    {
      id: 1712345678901,
      name: "Work",
      icon: "briefcase",
      emoji: undefined,
      tree: [
        {
          type: "tab",
          id: 123,
          title: "Example",
          url: "https://example.com/",
          ...
        },
        {
          type: "group",
          groupId: "abcdef",
          title: "Stack Title",
          color: "#ff8800",
          children: [
            {
              type: "tab",
              id: 124,
              title: "Child 1",
              ...
            }
          ]
        }
      ]
    }
  ]
}
```

## Test Process

### Step 1

先尝试通过 webpack chunk 注入方式获取内部 `require`，目标模块是：

- `53454`
- `83065`

结果：

- 失败
- `globalThis` 上没有任何 `webpackChunk*`
- `self.webpackChunkgapp_browser_react` 不存在

### Step 2

确认当前确实是在 Vivaldi UI DevTools 中，但 runtime 仍未暴露到全局。

结果：

- 不适合继续把“直接 require 内部模块”作为控制台主方案

### Step 3

改用公开且已暴露的运行时接口：

- `vivaldi.prefs.get("vivaldi.workspaces.list")`
- `chrome.tabs.query({})`
- `vivaldi.tabsPrivate.get(tabId)`

结果：

- 成功获取 workspace 列表
- 成功获取 tab 额外数据
- 成功从 `vivExtData` 还原 `workspaceId` 和 `group`

### Step 4

根据 `workspaceId` 和 `group` 自行组装 tree。

结果：

- 成功得到完整 workspace tree
- 用户实测确认“这个版本成功获得了完整的 tree 结构”

## Notes

### About Group Hierarchy

当前脚本稳定还原的是：

- workspace 级别
- tab stack/group 级别

如果某些版本里还存在更细的 follower/accordion 层级，可以继续利用这些字段做二次重建：

- `parentFollowerTabExtId`
- `followerTabExtId`

但这不是当前脚本成立的前提。

### About Unknown Workspaces

脚本里保留了 `(unknown ${workspaceId})` 分支。

原因：

- 某些 tab 可能带有 `workspaceId`
- 但 `vivaldi.workspaces.list` 当前没有对应记录

这种情况不常见，但保留更稳。

## Practical Recommendation

如果只是要：

- 查询当前所有工作区
- 查询某个工作区的所有标签
- 拿到完整树结构做导出或调试

优先用本文脚本。

如果未来某个版本把 webpack runtime 暴露到了全局，再考虑直接调内部 store，因为那样可以更接近 Vivaldi 原生 UI 的中间结构。
