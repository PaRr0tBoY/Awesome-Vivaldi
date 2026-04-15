# Vivaldi Sync 系统分析

## 概述

Vivaldi 的 Sync 系统基于 Chromium 的 sync 基础设施 (`chrome.sync` API)，通过 Vivaldi 账户实现多设备间的数据同步。

## 核心 API

### 1. `chrome.sync` (A.Z.sync)

Vivaldi sync 的核心接口，提供同步引擎的管理功能：

```javascript
// 获取引擎状态
A.Z.sync.getEngineState(callback)

// 获取上次同步周期状态
A.Z.sync.getLastCycleState(callback)

// 设置同步数据类型
A.Z.sync.setTypes(syncEverything, dataTypes)

// 设置加密密码
A.Z.sync.setEncryptionPassword(password, callback)

// 标记设置完成
A.Z.sync.setupComplete()

// 清除同步数据
A.Z.sync.clearData()

// 监听引擎状态变化
A.Z.sync.onEngineStateChanged.addListener(callback)

// 监听同步周期完成
A.Z.sync.onCycleCompleted.addListener(callback)
```

### 2. `chrome.sessions` (r.Z.sessions)

用于获取设备列表和会话信息：

```javascript
// 获取所有设备
r.Z.sessions.getDevices()

// 恢复标签页
A.Z.sessionsPrivate.restoreSyncTabs(deviceId, callback)
```

### 3. `chrome.sessionsPrivate` (A.Z.sessionsPrivate)

```javascript
// 恢复同步的标签页
A.Z.sessionsPrivate.restoreSyncTabs(sessionId, callback)
```

## 同步数据类型

Vivaldi 支持以下数据类型同步（定义在 `iG` 函数中）：

| DataType | 显示名称 | 说明 |
|----------|---------|------|
| `tabs` | Open Tabs | 打开的标签页 |
| `bookmarks` | Bookmarks | 书签 |
| `history` | History | 浏览历史 |
| `passwords` | Passwords | 密码 |
| `favorites` | Favorites | 收藏夹 |
| `extensions` | Extensions | 扩展 |
| `mailaccounts` | Mail Accounts | 邮件账户 |
| `mailmessages` | Mail Messages | 邮件消息 |
| `file` | File | 文件 |

## 标签页同步机制

### 同步流程

1. **设备注册**: 通过 `r.Z.sessions.getDevices()` 获取已登录设备列表
2. **数据存储**: 每个标签页的相关信息存储在 `vivExtData` JSON 字段中
3. **同步触发**: `chrome.sync` 自动在后台同步数据
4. **数据恢复**: 通过 `A.Z.sessionsPrivate.restoreSyncTabs()` 恢复其他设备的标签页

### 标签页数据结构

标签页同步时的数据结构 (`syncItem`):

```javascript
{
  url: string,           // 标签页 URL
  loadType: "page",      // 加载类型
  faviconUrl: string,    // 网站图标
  windowId: string,      // 窗口 ID
}
```

### vivExtData 扩展数据

标签页还通过 `vivExtData` 存储 Vivaldi 特有的扩展信息：

```javascript
vivExtData = JSON.stringify({
  workspaceId: string,      // 工作区 ID
  group: string,            // 标签组/堆叠 ID
  panelId: string,          // 面板 ID
  fixedTitle: string,       // 固定标题
  fixedGroupTitle: string,  // 固定组标题
  groupColor: string,       // 组颜色
  tiling: object,           // 平铺信息
  readerMode: boolean,      // 阅读模式
})
```

### Synced Tabs UI

在 Vivaldi UI 中，Synced Tabs 是一个特殊的标签页过滤器/面板：

```javascript
// 面板标识符
yM = "syncedTabs"

// 菜单项
TM = {
  syncedTabs: (0, as.Z)("Synced Tabs"),
}

// 同步标签项类型
type: "syncedTab"

// 快速命令中的选择优先级
selectPriority: t.indexOf("SYNCED_TABS")
```

### Synced Tabs 设备树

```javascript
// 设备树节点结构
{
  id: string,                // sessionId
  name: string,              // 设备名称
  url: string,               // 标签页 URL
  windowId: string,          // 窗口 ID
  tab: SessionTab,           // 原始标签对象
  workspaceId: undefined,
  stackId: undefined,
  panelId: undefined,
  fixedTitle: undefined,
  fixedGroupTitle: undefined,
  groupColor: undefined,
}
```

## 同步状态管理

### Redux Actions

```javascript
// 初始化同步标签页
{ actionType: "SYNCED_TABS_INIT", devices: [], loggedIn: boolean }

// 设置设备列表
{ actionType: "SYNCED_TABS_SET_DEVICES", devices: [...] }

// 设置登录状态
{ actionType: "SYNCED_TABS_SET_LOGGED_IN", loggedIn: boolean }

// 设置加载状态
{ actionType: "SYNCED_TABS_SET_LOADING", loading: boolean }

// 同步周期完成
{ actionType: "SYNC_CYCLE_COMPLETED", cycleData: {...} }
```

### 状态存储

```javascript
class SyncStore {
  state = {
    devices: [],      // 设备列表
    loggedIn: false,  // 是否已登录 Vivaldi 账户
    loading: false,   // 加载状态
  }

  isSyncing(accountId)     // 检查账户是否正在同步
  isSyncingAny()           // 检查是否有任何账户正在同步
  isSyncingFlags(accountId)     // 检查是否正在同步标志
  isSyncingFlagsAny()            // 检查是否有任何标志正在同步
}
```

## 快速命令集成

Synced Tabs 集成到 Vivaldi 的快速命令面板中：

```javascript
// 快速命令中的同步标签项处理
case "syncedTab":
  if (e.url) {
    g.ZP.openURL(c, e.url, {...});
  }
  break;
```

项结构：
```javascript
{
  name: string,           // 设备名称
  url: string,            // 标签页 URL
  type: "syncedTab",      // 类型标识
  selectPriority: number, // 选择优先级
  pageUrlForFavicon: string,
  faviconUrl: string,
}
```

## Tab Sync QR 码

当没有同步的标签页时，Vivaldi 显示 QR 码引导用户安装移动版 Vivaldi：

```javascript
// QR 码生成
A.Z.utilities.generateQRCode(url, "dataurl", callback)

// UI 组件
className: "synced-tab-dialog"
className: "tab-sync-qr-code"
```

## 账户与登录

### Vivaldi Account API (A.Z.vivaldiAccount)

```javascript
// 登录
A.Z.vivaldiAccount.login(email, password, callback)

// 登出
A.Z.vivaldiAccount.logout()

// 获取账户状态
A.Z.vivaldiAccount.getState()

// 监听账户状态变化
A.Z.vivaldiAccount.onAccountStateChanged.addListener(callback)
```

## 同步限制

- 在隐身模式 (`isGuestSession`) 或 Incognito 模式下不进行同步
- 同步标签页不包括标签页内容，仅同步元数据
- 每个设备通过唯一的 `sessionId` 标识
