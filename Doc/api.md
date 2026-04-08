# Vivaldi 内部 API 参考文档

> 基于 Vivaldi 官方 Modders API 文档 + 社区 Mod 脚本逆向分析，非官方文档，仅供参考

---

## 1. vivaldi.prefs - 首选项管理

> 来源：官方 Vivaldi Modders API

### 1.1 获取首选项

```javascript
vivaldi.prefs.get(path, callback);
// 或 Promise 风格
const value = await vivaldi.prefs.get(path);
```

**参数：**

- `path` (string): 首选项路径
- `callback` (function, optional): 回调函数

**示例：**

```javascript
vivaldi.prefs.get("vivaldi.workspaces.list", (list) => {
  const ws = list.find((w) => w.id === workspaceId);
});
```

### 1.2 设置首选项

```javascript
vivaldi.prefs.set({ path: string, value: any });
```

### 1.3 监听首选项变化

```javascript
vivaldi.prefs.onChanged.addListener(({ path, value }) => {
  switch (path) {
    case "vivaldi.panels.show_close_button":
      break;
  }
});
```

---

## 2. vivaldi.utilities - 工具函数

> 来源：官方 Vivaldi Modders API

### 2.1 文件操作

```javascript
vivaldi.utilities.selectFile(options, callback);
vivaldi.utilities.selectLocalImage(options, callback);
vivaldi.utilities.storeImage({ data, url, mimeType }).then((previewUrl) => {});
vivaldi.utilities.cleanUnusedImages();
vivaldi.utilities.getUrlFragments(url);
// 返回: { hostForSecurityDisplay: string, tld: string }
vivaldi.utilities.getSelectedText(tabId, callback);
vivaldi.utilities.urlToThumbnailText(url, callback);
```

### 2.2 系统信息

```javascript
vivaldi.utilities.getVersion(callback);
vivaldi.utilities.isVivaldiDefaultBrowser(callback);
vivaldi.utilities.setVivaldiAsDefaultBrowser(callback);
vivaldi.utilities.getSystemDateFormat(callback);
vivaldi.utilities.getLanguage(callback);
vivaldi.utilities.getStartupAction(callback);
vivaldi.utilities.setStartupAction(action, callback);
vivaldi.utilities.getCommandLineValue(switchName);
vivaldi.utilities.hasCommandLineSwitch(switchName);
vivaldi.utilities.isUrlValid(url);
```

### 2.3 对话框和会话

```javascript
vivaldi.utilities.isDialogOpen(dialogType, callback);
vivaldi.utilities.focusDialog(dialogType, callback);
vivaldi.utilities.acknowledgeCrashedSession(callback);
vivaldi.utilities.emulateUserInput(element, value);
vivaldi.utilities.generateQRCode(data, format, callback);
```

### 2.4 工具函数事件

```javascript
vivaldi.utilities.onSessionRecoveryDone.addListener(() => {});
vivaldi.utilities.onSessionRecoveryStart.addListener(() => {});
vivaldi.utilities.onTopSitesChanged.addListener(() => {});
vivaldi.utilities.onShowQRCode.addListener((data, format) => {});
vivaldi.utilities.onSharedDataUpdated.addListener((key) => {});
vivaldi.utilities.onScroll.addListener((scrollX, scrollY) => {});
vivaldi.utilities.onPasswordIconStatusChanged.addListener(
  (tabId, hasPassword) => {}
);
vivaldi.utilities.onDownloadManagerReady.addListener(() => {});
vivaldi.utilities.onDialogCanceled.addListener((dialogType) => {});
vivaldi.utilities.onBroadcastMessage.addListener((channel, message) => {});
```

---

## 3. vivaldi.tabsPrivate - 标签页私有 API

> 来源：官方 Vivaldi Modders API

### 3.1 标签操作方法

```javascript
vivaldi.tabsPrivate.update(tabId, updates);
vivaldi.tabsPrivate.get(tabId, callback);
vivaldi.tabsPrivate.insertText(tabId, text, callback);
vivaldi.tabsPrivate.startDrag(tabId, dragData, callback);
vivaldi.tabsPrivate.scrollPage(deltaX, deltaY);
vivaldi.tabsPrivate.moveSpatnavRect(rect);
vivaldi.tabsPrivate.activateSpatnavElement(elementId);
vivaldi.tabsPrivate.closeSpatnavOrCurrentOpenMenu();
vivaldi.tabsPrivate.hasBeforeUnloadOrUnload(tabId, callback);
vivaldi.tabsPrivate.translatePage(tabId, targetLang);
vivaldi.tabsPrivate.revertTranslatePage(tabId);
vivaldi.tabsPrivate.determineTextLanguage(tabId, callback);
vivaldi.tabsPrivate.loadViaLifeCycleUnit(tabId, callback);
vivaldi.tabsPrivate.getTabPerformanceData(tabId, callback);
vivaldi.tabsPrivate.clone(tabId, callback);
vivaldi.tabsPrivate.sendSendTabToSelfTarget(tabId, targetId, callback);
vivaldi.tabsPrivate.getSendTabToSelfTargets(callback);
vivaldi.tabsPrivate.execSendTabToSelfAction(action, callback);
vivaldi.tabsPrivate.getSendTabToSelfEntries(callback);
```

### 3.2 标签页事件监听

```javascript
vivaldi.tabsPrivate.onSendTabToSelfAdded.addListener(
  (tabId, targetDevice) => {}
);
vivaldi.tabsPrivate.onSendTabToSelfDismissed.addListener(() => {});
vivaldi.tabsPrivate.onMediaStateChanged.addListener((tabId, state) => {});
vivaldi.tabsPrivate.onThemeColorChanged.addListener((tabId, color) => {});
vivaldi.tabsPrivate.onTabUpdated.addListener((tabId, changeInfo) => {});
vivaldi.tabsPrivate.onDragEnd.addListener(() => {});
vivaldi.tabsPrivate.onPermissionAccessed.addListener((tabId, permission) => {});
vivaldi.tabsPrivate.onKeyboardChanged.addListener(
  (tabId, keyboardActive) => {}
);
vivaldi.tabsPrivate.onMouseChanged.addListener((tabId, mouseState) => {});
vivaldi.tabsPrivate.onKeyboardShortcut.addListener((windowId, key) => {});
vivaldi.tabsPrivate.onMouseGestureDetection.addListener(
  (tabId, isDetecting) => {}
);
vivaldi.tabsPrivate.onMouseGesture.addListener((tabId, direction) => {});
vivaldi.tabsPrivate.onTabSwitchEnd.addListener(() => {});
vivaldi.tabsPrivate.onRockerGesture.addListener((tabId, direction) => {});
vivaldi.tabsPrivate.onWebviewClickCheck.addListener(
  (windowId, mousedown, button, clientX, clientY) => {}
);
vivaldi.tabsPrivate.onPageZoom.addListener((tabId, zoomLevel) => {});
vivaldi.tabsPrivate.onBeforeUnloadDialogClosed.addListener(
  (tabId, success) => {}
);
vivaldi.tabsPrivate.onLanguageDetermined.addListener((tabId, language) => {});
vivaldi.tabsPrivate.onShowTranslationUI.addListener(
  (tabId, sourceLang, targetLang) => {}
);
vivaldi.tabsPrivate.onPageTranslated.addListener((tabId, success) => {});
vivaldi.tabsPrivate.onIsPageTranslatedChanged.addListener(
  (tabId, isTranslated) => {}
);
vivaldi.tabsPrivate.onTabResourceMetricsRefreshed.addListener(
  (tabId, metrics) => {}
);
```

### 3.3 Types

```javascript
vivaldi.tabsPrivate.TabAlertState;
vivaldi.tabsPrivate.TranslateStep;
vivaldi.tabsPrivate.TranslateError;
vivaldi.tabsPrivate.TabPerformanceData;
vivaldi.tabsPrivate.SendTabToSelfTarget;
vivaldi.tabsPrivate.SendTabToSelfEntry;
```

---

## 4. vivaldi.windowPrivate - 窗口私有 API

> 来源：官方 Vivaldi Modders API

### 4.1 窗口操作方法

```javascript
vivaldi.windowPrivate.create(options, callback);
vivaldi.windowPrivate.setState(windowId, state);
// state: "minimized" | "maximized" | "normal" | "fullscreen"
vivaldi.windowPrivate.setHotSpot(windowId, x, y, radius);
vivaldi.windowPrivate.performHapticFeedback();
vivaldi.windowPrivate.getFocusedElementInfo(windowId).then((info) => {});
vivaldi.windowPrivate.getHasWindows(callback);
vivaldi.windowPrivate.setup(config, callback);
```

### 4.2 窗口事件监听

```javascript
vivaldi.windowPrivate.onWindowClosed.addListener((windowId) => {});
vivaldi.windowPrivate.onActivated.addListener((windowId, active) => {});
vivaldi.windowPrivate.onPositionChanged.addListener((windowId, x, y) => {});
vivaldi.windowPrivate.onStateChanged.addListener((windowId, state) => {});
vivaldi.windowPrivate.onWindowDidChangeScreens.addListener((windowId) => {});
vivaldi.windowPrivate.onWebContentsHasWindow.addListener(
  (windowId, hasWindow) => {}
);
vivaldi.windowPrivate.onToastMessage.addListener((message) => {});
vivaldi.windowPrivate.onPageInfoPopupChanged.addListener((tabId, isOpen) => {});
vivaldi.windowPrivate.onFullscreenMenubarVisibilityChanged.addListener(
  (visible) => {}
);
vivaldi.windowPrivate.onActiveTabStatusText.addListener((text) => {});
vivaldi.windowPrivate.onMouseCloseToEdge.addListener((windowId, edge) => {});
vivaldi.windowPrivate.onMouseInHotSpot.addListener((windowId, hotspotId) => {});
```

---

## 5. vivaldi.settings - 设置 API

> 来源：官方 Vivaldi Modders API

```javascript
vivaldi.settings.get(key, callback);
vivaldi.settings.set(key, value, callback);
vivaldi.settings.getForCache(key, callback);
```

---

## 6. vivaldi.runtimePrivate - 运行时私有 API

> 来源：官方 Vivaldi Modders API

```javascript
vivaldi.runtimePrivate.getPlatformInfo(callback);
vivaldi.runtimePrivate.getChromeVersion(callback);
vivaldi.runtimePrivate.getVivaldiVersion(callback);
```

---

## 7. vivaldi.directMatch - 直接匹配 API

> 来源：官方 Vivaldi Modders API

```javascript
vivaldi.directMatch.matches(url, callback);
// 返回: Promise<boolean>
vivaldi.directMatch.getMatchRules(callback);
```

---

## 8. vivaldi.sync - 同步 API

> 来源：官方 Vivaldi Modders API

### 8.1 同步操作方法

```javascript
vivaldi.sync.setTypes(syncEverything, dataTypes, callback);
vivaldi.sync.setupComplete(callback);
vivaldi.sync.getEngineState(callback);
vivaldi.sync.getDefaultSessionName(callback, errorCallback);
vivaldi.sync.showBookmarks(windowId, callback);
vivaldi.sync.showSettings(windowId, callback);
```

### 8.2 同步事件监听

```javascript
vivaldi.sync.onCycleCompleted.addListener((stats) => {});
vivaldi.sync.onEngineStateChanged.addListener((state) => {});
```

---

## 9. vivaldi.bookmarksPrivate - 书签私有 API

> 来源：官方 Vivaldi Modders API

### 9.1 书签方法

```javascript
vivaldi.bookmarksPrivate.getTree(callback);
vivaldi.bookmarksPrivate.get(bookmarkId, callback);
vivaldi.bookmarksPrivate.create(bookmark, callback);
vivaldi.bookmarksPrivate.update(bookmarkId, changes, callback);
vivaldi.bookmarksPrivate.remove(bookmarkId, callback);
vivaldi.bookmarksPrivate.isCustomThumbnail(bookmarkId, callback);
vivaldi.bookmarksPrivate.updatePartners(callback);
```

### 9.2 书签事件监听

```javascript
vivaldi.bookmarksPrivate.onCreated.addListener((bookmark) => {});
vivaldi.bookmarksPrivate.onRemoved.addListener((bookmarkId, parentId) => {});
vivaldi.bookmarksPrivate.onChanged.addListener((bookmarkId, changeInfo) => {});
vivaldi.bookmarksPrivate.onFaviconChanged.addListener(
  (bookmarkId, faviconUrl) => {}
);
vivaldi.bookmarksPrivate.onMetaInfoChanged.addListener(
  (bookmarkId, metaInfo) => {}
);
```

---

## 10. vivaldi.contentBlocking - 内容拦截 API

> 来源：官方 Vivaldi Modders API

### 10.1 内容拦截方法

```javascript
vivaldi.contentBlocking.getAllExceptionLists(callback);
vivaldi.contentBlocking.getActiveExceptionsList(ruleGroup, callback);
vivaldi.contentBlocking.setActiveExceptionsList(
  ruleGroup,
  exceptionList,
  callback
);
vivaldi.contentBlocking.getRuleSource(ruleGroup, sourceId, callback);
vivaldi.contentBlocking.getRuleSources(ruleGroup, callback);
vivaldi.contentBlocking.removeExceptionForDomain(ruleGroup, domain, callback);
vivaldi.contentBlocking.getAdBlockingStats(ruleGroup).then((stats) => {});
vivaldi.contentBlocking.clearAdBlockingStats(callback);
vivaldi.contentBlocking.updateTemplateUrl(guid, updates, callback);
vivaldi.contentBlocking.removeTemplateUrl(guid, callback);
vivaldi.contentBlocking.moveTemplateUrl(guid, newIndex, callback);
vivaldi.contentBlocking.getSwitchPromptData(callback);
vivaldi.contentBlocking.acknowledgeSwitchPrompt(guid, callback);
vivaldi.contentBlocking.deleteKnownSource(sourceId, ruleGroup);
vivaldi.contentBlocking.addKnownSourceFromURL(sourceUrl, ruleGroup, callback);
vivaldi.contentBlocking.setContentSetting(
  tabId,
  primaryUrl,
  secondaryUrl,
  setting
);
```

### 10.2 内容拦截事件监听

```javascript
vivaldi.contentBlocking.onRuleSourceEnabled.addListener(
  (ruleGroup, sourceId) => {}
);
vivaldi.contentBlocking.onRuleSourceDisabled.addListener(
  (ruleGroup, sourceId) => {}
);
vivaldi.contentBlocking.onRuleSourceUpdated.addListener((ruleGroup) => {});
vivaldi.contentBlocking.onExceptionsChanged.addListener((ruleGroup) => {});
vivaldi.contentBlocking.onStateChanged.addListener((isEnabled) => {});
vivaldi.contentBlocking.onUrlsBlocked.addListener((urls) => {});
vivaldi.contentBlocking.onAdAttributionTrackersAllowed.addListener(
  (allowed) => {}
);
vivaldi.contentBlocking.onAdAttributionDomainChanged.addListener(
  (domain) => {}
);
```

### 10.3 枚举

```javascript
vivaldi.contentBlocking.RuleGroup.AD_BLOCKING;
vivaldi.contentBlocking.ContentSettingsTypeEnum;
vivaldi.contentBlocking.ContentSettingEnum;
```

---

## 11. vivaldi.mailPrivate - 邮件私有 API

> 来源：官方 Vivaldi Modders API

### 11.1 邮件文件操作

```javascript
vivaldi.mailPrivate.readFileToText(filePath, callback);
vivaldi.mailPrivate.readFileToBuffer(filePath, callback);
vivaldi.mailPrivate.getFilePaths(accountId, callback);
vivaldi.mailPrivate.getFullPath(relativePath, callback);
vivaldi.mailPrivate.getFileDirectory(callback);
vivaldi.mailPrivate.renameMessageFile(oldPath, newPath, callback);
```

### 11.2 邮件事件监听

```javascript
vivaldi.mailPrivate.onUpgradeProgress.addListener((progress) => {});
vivaldi.mailPrivate.onMailReceived.addListener((accountId, message) => {});
vivaldi.mailPrivate.onSendMail.addListener((accountId, message) => {});
```

---

## 12. vivaldi.historyPrivate - 历史记录私有 API

> 来源：官方 Vivaldi Modders API

### 12.1 历史记录搜索

```javascript
vivaldi.historyPrivate
  .visitSearch({
    text: "search term",
    startTime: Date.now() - 7 * 24 * 60 * 60 * 1000,
    endTime: Date.now(),
    maxResults: 100,
  })
  .then((results) => {});
```

### 12.2 历史记录事件

```javascript
vivaldi.historyPrivate.onVisited.addListener((result) => {});
vivaldi.historyPrivate.onVisitRemoved.addListener((removed) => {});
```

---

## 13. vivaldi.pipPrivate - 画中画私有 API

> 来源：官方 Vivaldi Modders API

### 13.1 画中画方法

```javascript
vivaldi.pipPrivate.enterPictureInPicture(videoElement, callback);
vivaldi.pipPrivate.exitPictureInPicture(callback);
vivaldi.pipPrivate.isInPictureInPicture(callback);
```

### 13.2 画中画事件监听

```javascript
vivaldi.pipPrivate.onVideoElementCreated.addListener((videoElement) => {});
vivaldi.pipPrivate.onEntered.addListener(() => {});
vivaldi.pipPrivate.onExited.addListener(() => {});
```

---

## 14. vivaldi.searchEngines - 搜索引擎 API

> 来源：官方 Vivaldi Modders API

### 14.1 搜索请求方法

```javascript
vivaldi.searchEngines.getSearchRequest(keyword).then((result) => {});
```

### 14.2 搜索引擎管理方法

```javascript
vivaldi.searchEngines.getTemplateUrls().then(engines => {})
vivaldi.searchEngines.setDefault(type, guid)
vivaldi.searchEngines.removeTemplateUrl(guid)
vivaldi.searchEngines.addTemplateUrl({ name, url, icon?, favicon? }, callback)
vivaldi.searchEngines.updateTemplateUrl(guid, updates, callback)
vivaldi.searchEngines.moveTemplateUrl(guid, newIndex, callback)
```

### 14.3 DefaultType 枚举

```javascript
vivaldi.searchEngines.DefaultType.DEFAULT_SEARCH;
vivaldi.searchEngines.DefaultType.DEFAULT_IMAGE;
vivaldi.searchEngines.DefaultType.DEFAULT_PRIVATE;
vivaldi.searchEngines.DefaultType.DEFAULT_SEARCH_FIELD;
vivaldi.searchEngines.DefaultType.DEFAULT_SPEEDDIALS;
vivaldi.searchEngines.DefaultType.DEFAULT_SPEEDDIALS_PRIVATE;
```

### 14.4 事件监听

```javascript
vivaldi.searchEngines.onTemplateUrlsChanged.addListener(() => {});
vivaldi.searchEngines.onSearchEnginesChanged.addListener(() => {});
```

---

## 15. vivaldi.contacts - 联系人 API

> 来源：官方 Vivaldi Modders API

### 15.1 联系人方法

```javascript
vivaldi.contacts.getAll(callback);
vivaldi.contacts.getAllEmailAddresses(callback);
vivaldi.contacts.create(contactDetails, callback);
vivaldi.contacts.createMany(contacts, callback);
vivaldi.contacts.update(id, changes, callback);
vivaldi.contacts.delete(id, callback);
vivaldi.contacts.addPropertyItem(details, callback);
vivaldi.contacts.addEmailAddress(details, callback);
vivaldi.contacts.updateEmailAddress(details, callback);
vivaldi.contacts.removeEmailAddress(contactId, emailId, callback);
vivaldi.contacts.updatePropertyItem(details, callback);
vivaldi.contacts.removePropertyItem(details, callback);
vivaldi.contacts.readThunderbirdContacts(callback);
```

### 15.2 联系人事件监听

```javascript
vivaldi.contacts.onContactCreated.addListener((contact) => {});
vivaldi.contacts.onContactRemoved.addListener((contactId) => {});
vivaldi.contacts.onContactChanged.addListener((contact) => {});
```

---

## 16. vivaldi.contextMenu - 右键菜单 API

> 来源：官方 Vivaldi Modders API

### 16.1 右键菜单方法

```javascript
vivaldi.contextMenu.show(params, callback);
// params: { doc?, x, y, documentArea?, documentType?, textfieldType? }
vivaldi.contextMenu.update(itemId, updates, callback);
```

### 16.2 右键菜单事件

```javascript
vivaldi.contextMenu.onDocumentMenu.addListener((info, dest) => {});
```

---

## 17. vivaldi.calendar - 日历 API

> 来源：官方 Vivaldi Modders API

### 17.1 日历事件方法

```javascript
vivaldi.calendar.getAllEvents(options?, callback)
vivaldi.calendar.getAllEventTypes(callback)
vivaldi.calendar.getAllNotifications(callback)
vivaldi.calendar.eventCreate(details, callback)
vivaldi.calendar.eventsCreate(details, callback)
vivaldi.calendar.updateEvent(eventId, changes, callback)
vivaldi.calendar.deleteEvent(eventId, callback)
vivaldi.calendar.deleteEventException(eventId, exceptionDate, callback)
vivaldi.calendar.updateRecurrenceException(eventId, exceptionDate, changes, callback)
```

### 17.2 日历账户方法

```javascript
vivaldi.calendar.getAllAccounts(callback);
vivaldi.calendar.createAccount(details, callback);
vivaldi.calendar.updateAccount(accountId, changes, callback);
vivaldi.calendar.deleteAccount(accountId, callback);
```

### 17.3 日历邀请方法

```javascript
vivaldi.calendar.createInvite(eventId, inviteDetails, callback);
vivaldi.calendar.deleteInvite(inviteId, callback);
vivaldi.calendar.updateInvite(inviteId, changes, callback);
```

### 17.4 日历通知方法

```javascript
vivaldi.calendar.createNotification(details, callback);
vivaldi.calendar.updateNotification(notificationId, changes, callback);
vivaldi.calendar.deleteNotification(notificationId, callback);
```

### 17.5 日历事件类型方法

```javascript
vivaldi.calendar.eventTypeCreate(details, callback);
vivaldi.calendar.eventTypeUpdate(eventTypeId, changes, callback);
vivaldi.calendar.deleteEventType(eventTypeId, callback);
vivaldi.calendar.createEventException(eventId, exceptionDate, callback);
```

### 17.6 日历事件模板方法

```javascript
vivaldi.calendar.createEventTemplate(details, callback);
vivaldi.calendar.getAllEventTemplates(callback);
vivaldi.calendar.updateEventTemplate(templateId, changes, callback);
vivaldi.calendar.deleteEventTemplate(templateId, callback);
vivaldi.calendar.getParentExceptionId(exceptionId, callback);
```

### 17.7 日历事件监听

```javascript
vivaldi.calendar.onIcsFileOpened.addListener((fileData) => {});
vivaldi.calendar.onWebcalUrlOpened.addListener((url) => {});
vivaldi.calendar.onMailtoOpened.addListener((mailtoUrl) => {});
vivaldi.calendar.onEventCreated.addListener((event) => {});
vivaldi.calendar.onNotificationChanged.addListener((notification) => {});
vivaldi.calendar.onCalendarDataChanged.addListener(() => {});
```

---

## 18. vivaldi.mousegestures - 鼠标手势 API

> 来源：官方 Vivaldi Modders API

### 18.1 鼠标手势事件

```javascript
vivaldi.mousegestures.onGestureStarted.addListener((startX, startY) => {});
vivaldi.mousegestures.onGestureCompleted.addListener(
  (gesture, distanceX, distanceY) => {}
);
vivaldi.mousegestures.onGestureCanceled.addListener(() => {});
```

---

## 19. vivaldi.pageActions - 页面动作 API

> 来源：官方 Vivaldi Modders API

### 19.1 页面动作方法

```javascript
vivaldi.pageActions.getScripts(callback);
vivaldi.pageActions.setScriptOverrideForTab(tabId, scriptId, callback);
vivaldi.pageActions.getScriptOverridesForTab(tabId, callback);
```

### 19.2 页面动作事件

```javascript
vivaldi.pageActions.onScriptsChanged.addListener(() => {});
vivaldi.pageActions.onOverridesChanged.addListener(() => {});
```

---

## 20. vivaldi.sessionsPrivate - 会话私有 API

> 来源：官方 Vivaldi Modders API

### 20.1 会话方法

```javascript
vivaldi.sessionsPrivate.get(sessionId, callback)
vivaldi.sessionsPrivate.save(session, callback)
vivaldi.sessionsPrivate.remove(sessionId, callback)
vivaldi.sessionsPrivate.getAutosaveIds(callback)
vivaldi.sessionsPrivate.emptyTrash(callback)
vivaldi.sessionsPrivate.restoreLastClosed(callback)
vivaldi.sessionsPrivate.getLastClosed(callback)
vivaldi.sessionsPrivate.markTabClosed(tabId, callback)
vivaldi.sessionsPrivate.getClosedTabs(windowId?, callback)
```

---

## 21. vivaldi.webViewPrivate - WebView 私有 API

> 来源：官方 Vivaldi Modders API

### 21.1 WebView 方法

```javascript
vivaldi.webViewPrivate.getThumbnail(webViewId, callback);
vivaldi.webViewPrivate.showPageInfo(webViewId, callback);
vivaldi.webViewPrivate.setIsFullscreen(webViewId, isFullscreen, callback);
vivaldi.webViewPrivate.getPageHistory(webViewId, callback);
vivaldi.webViewPrivate.allowBlockedInsecureContent(webViewId, callback);
vivaldi.webViewPrivate.sendRequest(webViewId, request, callback);
vivaldi.webViewPrivate.getPageSelection(webViewId, callback);
```

---

## 22. vivaldi.thumbnails - 缩略图 API

> 来源：官方 Vivaldi Modders API

### 22.1 缩略图方法

```javascript
vivaldi.thumbnails.captureTab(tabId, options?, callback)
// options: { format?: "png" | "jpeg", quality?: number }
vivaldi.thumbnails.captureUI(uiElement, options?, callback)
vivaldi.thumbnails.captureUrl(url, options?, callback)
vivaldi.thumbnails.cancelCapture(captureId, callback)
```

---

## 23. vivaldi.bookmarkContextMenu - 书签菜单 API

> 来源：官方 Vivaldi Modders API

### 23.1 书签菜单方法

```javascript
vivaldi.bookmarkContextMenu.show(x, y, bookmarkId, callback);
vivaldi.bookmarkContextMenu.close(callback);
```

### 23.2 书签菜单事件

```javascript
vivaldi.bookmarkContextMenu.onOpen.addListener((bookmarkId) => {});
vivaldi.bookmarkContextMenu.onClose.addListener(() => {});
vivaldi.bookmarkContextMenu.onDragStart.addListener((bookmarkId) => {});
```

---

## 24. vivaldi.vivaldiAccount - Vivaldi 账户 API

> 来源：官方 Vivaldi Modders API

### 24.1 账户方法

```javascript
vivaldi.vivaldiAccount.getState(callback);
// 返回: Promise<{ isLoggedIn, email?, avatar? }>
vivaldi.vivaldiAccount.login(username, password, callback);
vivaldi.vivaldiAccount.logout(callback);
```

### 24.2 账户事件

```javascript
vivaldi.vivaldiAccount.onStateChanged.addListener((state) => {});
```

---

## 25. vivaldi.savedpasswords - 已保存密码 API

> 来源：官方 Vivaldi Modders API

### 25.1 密码方法

```javascript
vivaldi.savedpasswords.getList(callback)
vivaldi.savedpasswords.get(passwordId, callback)
vivaldi.savedpasswords.add(login, callback)
vivaldi.savedpasswords.delete(passwordId, callback)
vivaldi.savedpasswords.createDelegate(encryptedData, callback)
vivaldi.savedpasswords.remove(delegateId, callback)
vivaldi.savedpasswords.authenticate(primaryAuth, secondaryAuth?, callback)
```

---

## 26. vivaldi.accessKeys - 访问键 API

> 来源：官方 Vivaldi Modders API

### 26.1 访问键方法

```javascript
vivaldi.accessKeys.getAccessKeysForPage(tabId, callback);
vivaldi.accessKeys.action(tabId, key, callback);
```

---

## 27. vivaldi.zoom - 缩放 API

> 来源：官方 Vivaldi Modders API

### 27.1 缩放方法

```javascript
vivaldi.zoom.setVivaldiUIZoom(zoom, callback);
vivaldi.zoom.getVivaldiUIZoom(callback);
vivaldi.zoom.setDefaultZoom(zoom, callback);
vivaldi.zoom.getDefaultZoom(callback);
```

### 27.2 缩放事件监听

```javascript
vivaldi.zoom.onDefaultZoomChanged.addListener((tabId, zoom) => {});
vivaldi.zoom.onUIZoomChanged.addListener((zoom) => {});
```

---

## 28. vivaldi.infobars - 信息栏 API

> 来源：官方 Vivaldi Modders API

### 28.1 信息栏方法

```javascript
vivaldi.infobars.sendButtonAction(infobarId, buttonIndex, callback)
vivaldi.infobars.showInfobar(infobarId, message, buttons?, callback)
```

### 28.2 信息栏事件监听

```javascript
vivaldi.infobars.onInfobarCreated.addListener((infobar) => {});
vivaldi.infobars.onInfobarRemoved.addListener((infobarId) => {});
```

---

## 29. vivaldi.protonvpn - ProtonVPN API

> 来源：官方 Vivaldi Modders API

### 29.1 ProtonVPN 方法

```javascript
vivaldi.protonvpn.getStatus(callback);
// 返回: Promise<{ connected, server?, country? }>
```

---

## 30. vivaldi.menubar - 菜单栏 API

> 来源：官方 Vivaldi Modders API

### 30.1 菜单栏方法

```javascript
vivaldi.menubar.getHasWindows(callback);
vivaldi.menubar.setup(config, callback);
```

### 30.2 菜单栏事件监听

```javascript
vivaldi.menubar.onActivated.addListener((windowId) => {});
```

---

## 31. vivaldi.menuContent - 菜单内容 API

> 来源：官方 Vivaldi Modders API

### 31.1 菜单内容方法

```javascript
vivaldi.menuContent.get(menuId, callback)
vivaldi.menuContent.move(menuId, newIndex, parentId?, callback)
vivaldi.menuContent.add(menuItem, parentId?, callback)
vivaldi.menuContent.remove(menuId, callback)
vivaldi.menuContent.create(menuData, callback)
vivaldi.menuContent.update(menuId, changes, callback)
vivaldi.menuContent.reset(callback)
```

### 31.2 菜单内容事件监听

```javascript
vivaldi.menuContent.onChanged.addListener(() => {});
vivaldi.menuContent.onResetAll.addListener(() => {});
```

---

## 32. vivaldi.omniboxPrivate - 快捷搜索私有 API

> 来源：官方 Vivaldi Modders API

### 32.1 快捷搜索事件监听

```javascript
vivaldi.omniboxPrivate.onOmniboxResultChanged.addListener((results) => {});
```

---

## 33. vivaldi.dnsOverHttpsPrivate - DNS over HTTPS API

> 来源：官方 Vivaldi Modders API

### 33.1 DoH 方法

```javascript
vivaldi.dnsOverHttpsPrivate.dataFetcher(url, callback);
vivaldi.dnsOverHttpsPrivate.configTest(config, callback);
```

---

## 34. vivaldi.translateHistory - 翻译历史 API

> 来源：官方 Vivaldi Modders API

### 34.1 翻译历史方法

```javascript
vivaldi.translateHistory.get(callback);
vivaldi.translateHistory.add(entry, callback);
vivaldi.translateHistory.remove(entryId, callback);
vivaldi.translateHistory.reset(callback);
```

### 34.2 翻译历史事件监听

```javascript
vivaldi.translateHistory.onAdded.addListener((entry) => {});
vivaldi.translateHistory.onMoved.addListener((entryId, newIndex) => {});
vivaldi.translateHistory.onRemoved.addListener((entryId) => {});
```

---

## 35. vivaldi.extensionActionUtils - 扩展图标工具 API

> 来源：官方 Vivaldi Modders API

### 35.1 扩展图标方法

```javascript
vivaldi.extensionActionUtils.getToolbarExtensions(callback);
```

---

## 36. vivaldi.readingListPrivate - 阅读列表私有 API

> 来源：官方 Vivaldi Modders API

### 36.1 阅读列表方法

```javascript
vivaldi.readingListPrivate.add(url, title, callback);
vivaldi.readingListPrivate.remove(url, callback);
vivaldi.readingListPrivate.getAll(callback);
vivaldi.readingListPrivate.setReadStatus(url, isRead, callback);
```

### 36.2 阅读列表事件监听

```javascript
vivaldi.readingListPrivate.onModelChanged.addListener(() => {});
```

---

## 37. vivaldi.menubarMenu - 菜单栏菜单 API

> 来源：官方 Vivaldi Modders API

### 37.1 菜单栏菜单方法

```javascript
vivaldi.menubarMenu.getMaxId(callback);
```

---

## 38. vivaldi.devtoolsPrivate - 开发者工具私有 API

> 来源：官方 Vivaldi Modders API

### 38.1 开发者工具方法

```javascript
vivaldi.devtoolsPrivate.getDockingStateSizes(callback);
```

### 38.2 开发者工具事件监听

```javascript
vivaldi.devtoolsPrivate.onDockingStateChanged.addListener((state) => {});
vivaldi.devtoolsPrivate.onDockingSizesChanged.addListener((sizes) => {});
vivaldi.devtoolsPrivate.onClosed.addListener(() => {});
vivaldi.devtoolsPrivate.onDevtoolsUndocked.addListener(() => {});
```

---

## 39. vivaldi.importData - 导入数据 API

> 来源：官方 Vivaldi Modders API

### 39.1 导入方法

```javascript
vivaldi.importData.getProfiles(callback);
vivaldi.importData.getHistory(profileId, callback);
vivaldi.importData.getFavorites(profileId, callback);
vivaldi.importData.importData(profileId, dataTypes, callback);
```

### 39.2 导入事件监听

```javascript
vivaldi.importData.onImportStarted.addListener(() => {});
vivaldi.importData.onImportCompleted.addListener(() => {});
```

---

## 40. vivaldi.themePrivate - 主题私有 API

> 来源：官方 Vivaldi Modders API

### 40.1 主题方法

```javascript
vivaldi.themePrivate.export(themeId, callback);
vivaldi.themePrivate.install(themePath, callback);
vivaldi.themePrivate.get(themeId, callback);
```

### 40.2 主题事件监听

```javascript
vivaldi.themePrivate.onThemeDownloadStarted.addListener((themeId) => {});
vivaldi.themePrivate.onThemeDownloadProgress.addListener(
  (themeId, progress) => {}
);
vivaldi.themePrivate.onThemeDownloadFailed.addListener((themeId, error) => {});
vivaldi.themePrivate.onThemeInstalled.addListener((themeId) => {});
```

---

## 41. vivaldi.notes - 笔记 API

> 来源：官方 Vivaldi Modders API

### 41.1 笔记方法

```javascript
vivaldi.notes.create(title, content, callback);
vivaldi.notes.move(noteId, targetFolderId, callback);
vivaldi.notes.update(noteId, changes, callback);
vivaldi.notes.remove(noteId, callback);
```

### 41.2 笔记事件监听

```javascript
vivaldi.notes.onCreated.addListener((note) => {});
vivaldi.notes.onMoved.addListener((noteId, oldFolder, newFolder) => {});
vivaldi.notes.onDeleted.addListener((noteId) => {});
```

---

## 42. vivaldi.sitePermissions - 站点权限 API

> 来源：官方 Vivaldi Modders API

### 42.1 站点权限方法

```javascript
vivaldi.sitePermissions.getAvailablePermissions(callback);
vivaldi.sitePermissions.getOverriddenSites(callback);
vivaldi.sitePermissions.getOverridesForSite(site, callback);
vivaldi.sitePermissions.setSitePermission(site, permission, value, callback);
vivaldi.sitePermissions.resetSitePermissions(site, callback);
```

### 42.2 站点权限事件监听

```javascript
vivaldi.sitePermissions.onPermissionChanged.addListener(
  (site, permission) => {}
);
```

---

## 43. vivaldi.editcommand - 编辑命令 API

> 来源：官方 Vivaldi Modders API

### 43.1 编辑命令方法

```javascript
vivaldi.editcommand.execute(commandId, callback);
```

---

## 44. vivaldi.autoUpdate - 自动更新 API

> 来源：官方 Vivaldi Modders API

### 44.1 自动更新方法

```javascript
vivaldi.autoUpdate.checkForUpdates(callback);
vivaldi.autoUpdate.quitAndInstall(callback);
```

### 44.2 自动更新事件监听

```javascript
vivaldi.autoUpdate.onDidFindValidUpdate.addListener((updateInfo) => {});
vivaldi.autoUpdate.onUpdaterDidNotFindUpdate.addListener(() => {});
vivaldi.autoUpdate.onWillDownloadUpdate.addListener((updateInfo) => {});
vivaldi.autoUpdate.onWillInstallUpdate.addListener(() => {});
vivaldi.autoUpdate.onUpdaterDidRelaunchApplication.addListener(() => {});
```

---

## 45. vivaldi.preferenceDefinitions - 首选项定义 API

> 来源：官方 Vivaldi Modders API

### 45.1 首选项定义方法

```javascript
vivaldi.preferenceDefinitions.get(callback);
// 返回: Promise<Array<{ key, type, defaultValue, description? }>>
```

---

## 46. vivExtData - 标签页扩展数据

> 来源：基于 TidyTabs.js、TidyTitles.js 逆向分析

`vivExtData` 是 Vivaldi 浏览器中挂在每个标签页对象上的扩展数据字段，**不是** `vivaldi.*` API，而是 Chrome 标签页对象的原生属性。

### 46.1 基本信息

- **存储格式**：JSON 字符串（需要 `JSON.parse()` 解析）
- **读取方式**：`chrome.tabs.get(tabId, tab => JSON.parse(tab.vivExtData))`
- **写入方式**：`chrome.tabs.update(tabId, { vivExtData: JSON.stringify(data) })`

### 46.2 vivExtData 结构

```javascript
{
  ext_id: string,              // 扩展 ID
  tiling: {                   // 平铺布局
    id: string,
    index: number,
    layout: string,
    type: string
  },
  workspaceId: string,        // 工作区 ID
  group: string,              // 标签页组 ID
  groupColor: string,         // 标签页组颜色
  fixedTitle: string,         // 固定标题（覆盖原始标题）
  fixedGroupTitle: string,    // 固定组标题
  readerMode: boolean,         // 阅读模式
  vivaldi_tab_muted: boolean, // 静音状态
  panelId: string,            // Web Panel ID
  parentFollowerTabExtId: string,
  followerTabExtId: string,
  interval: number,            // 刷新间隔
  composerProps: object       // 邮件撰写属性
}
```

### 46.3 使用示例

**读取 vivExtData：**

```javascript
chrome.tabs.get(tabId, (tab) => {
  try {
    const viv = JSON.parse(tab.vivExtData || "{}");
    console.log("Workspace:", viv.workspaceId);
    console.log("Group:", viv.group);
  } catch (e) {}
});
```

**写入 vivExtData：**

```javascript
chrome.tabs.get(tabId, (tab) => {
  let viv = {};
  try {
    viv = JSON.parse(tab.vivExtData || "{}");
  } catch (e) {}

  viv.group = stackId;
  viv.fixedGroupTitle = "组名";

  chrome.tabs.update(tabId, { vivExtData: JSON.stringify(viv) });
});
```

---

## 常见首选项路径

| 路径                                    | 描述               |
| --------------------------------------- | ------------------ |
| `vivaldi.workspaces.list`               | 工作区列表         |
| `vivaldi.panels.web.elements`           | Web Panel 元素列表 |
| `vivaldi.panels.show_close_button`      | 面板显示关闭按钮   |
| `vivaldi.panels.as_overlay.auto_close`  | 面板自动关闭       |
| `vivaldi.panels.as_overlay.enabled`     | 面板覆盖模式       |
| `vivaldi.toolbars.panel`                | 面板工具栏         |
| `vivaldi.toolbars.navigation`           | 导航工具栏         |
| `vivaldi.toolbars.status`               | 状态工具栏         |
| `vivaldi.toolbars.mail`                 | 邮件工具栏         |
| `vivaldi.toolbars.mail_message`         | 邮件消息工具栏     |
| `vivaldi.toolbars.mail_composer`        | 邮件编写工具栏     |
| `vivaldi.themes.current`                | 当前主题           |
| `vivaldi.themes.system`                 | 系统主题           |
| `vivaldi.themes.user`                   | 用户主题           |
| `vivaldi.rss.settings`                  | RSS 设置           |
| `vivaldi.chained_commands.command_list` | 命令链列表         |

---

## 使用注意

1. **非官方 API**：这些 API 来自 Vivaldi 内部实现，可能随版本变化
2. **错误处理**：部分操作可能抛出异常，建议使用 try-catch
3. **权限限制**：某些 API 需要在特定上下文（如非隐私窗口）中调用
4. **异步模式**：大多数 API 返回 Promise，部分使用回调函数
