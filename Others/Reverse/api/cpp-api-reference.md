# Vivaldi Internal API — Complete C++ Reference

> 从 C++ 源码 DECLARE_EXTENSION_FUNCTION 宏提取
> 版本：8.1.4087.40 | 总计：398 个方法 | 命名空间：42

## 总览

| 命名空间 | 方法数 |
|----------|--------|
| accessKeys | 2 |
| autoUpdate | 15 |
| bookmarkContextMenu | 2 |
| bookmarksPrivate | 5 |
| calendar | 32 |
| contacts | 13 |
| contentBlocking | 23 |
| contextMenu | 2 |
| devtoolsPrivate | 3 |
| directMatch | 4 |
| dnsOverHttpsPrivate | 2 |
| editcommand | 1 |
| extensionActionUtils | 8 |
| historyPrivate | 4 |
| importData | 5 |
| infobars | 2 |
| mailPrivate | 23 |
| menubar | 2 |
| menubarMenu | 2 |
| menuContent | 8 |
| notes | 10 |
| omniboxPrivate | 3 |
| pageActions | 3 |
| prefs | 10 |
| protonvpn | 1 |
| readingListPrivate | 4 |
| runtimePrivate | 18 |
| savedpasswords | 7 |
| searchEngines | 12 |
| sessionsPrivate | 14 |
| settings | 1 |
| sitePermissions | 5 |
| sync | 11 |
| tabsPrivate | 19 |
| themePrivate | 4 |
| thumbnails | 3 |
| translateHistory | 4 |
| utilities | 87 |
| vivaldiAccount | 5 |
| webViewPrivate | 7 |
| windowPrivate | 8 |
| zoom | 4 |

## accessKeys

| 方法 | 源文件 |
|------|--------|
| `accessKeys.getAccessKeysForPage` | C |
| `accessKeys.action` | C |

## autoUpdate

| 方法 | 源文件 |
|------|--------|
| `autoUpdate.checkForUpdates` | C |
| `autoUpdate.isUpdateNotifierEnabled` | C |
| `autoUpdate.enableUpdateNotifier` | C |
| `autoUpdate.disableUpdateNotifier` | C |
| `autoUpdate.installUpdateAndRestart` | C |
| `autoUpdate.getAutoInstallUpdates` | C |
| `autoUpdate.setAutoInstallUpdates` | C |
| `autoUpdate.getLastCheckTime` | C |
| `autoUpdate.getUpdateStatus` | C |
| `autoUpdate.hasAutoUpdates` | C |
| `autoUpdate.needsCodecRestart` | C |
| `autoUpdate.runStartupChecks` | C |
| `autoUpdate.startUpdate` | C |
| `autoUpdate.getAboutInfo` | C |
| `autoUpdate.getAboutPathsInfo` | C |

## bookmarkContextMenu

| 方法 | 源文件 |
|------|--------|
| `bookmarkContextMenu.show` | C |
| `bookmarkContextMenu.close` | C |

## bookmarksPrivate

| 方法 | 源文件 |
|------|--------|
| `bookmarksPrivate.getFolderIds` | C |
| `bookmarksPrivate.emptyTrash` | C |
| `bookmarksPrivate.updatePartners` | C |
| `bookmarksPrivate.isCustomThumbnail` | C |
| `bookmarksPrivate.export` | C |

## calendar

| 方法 | 源文件 |
|------|--------|
| `calendar.getAllEvents` | C |
| `calendar.eventCreate` | C |
| `calendar.eventsCreate` | C |
| `calendar.updateEvent` | C |
| `calendar.deleteEvent` | C |
| `calendar.updateRecurrenceException` | C |
| `calendar.deleteEventException` | C |
| `calendar.create` | C |
| `calendar.getAll` | C |
| `calendar.update` | C |
| `calendar.delete` | C |
| `calendar.getAllEventTypes` | C |
| `calendar.eventTypeCreate` | C |
| `calendar.eventTypeUpdate` | C |
| `calendar.deleteEventType` | C |
| `calendar.createEventException` | C |
| `calendar.getAllNotifications` | C |
| `calendar.createNotification` | C |
| `calendar.updateNotification` | C |
| `calendar.deleteNotification` | C |
| `calendar.createInvite` | C |
| `calendar.deleteInvite` | C |
| `calendar.updateInvite` | C |
| `calendar.createAccount` | C |
| `calendar.deleteAccount` | C |
| `calendar.updateAccount` | C |
| `calendar.getAllAccounts` | C |
| `calendar.createEventTemplate` | C |
| `calendar.getAllEventTemplates` | C |
| `calendar.updateEventTemplate` | C |
| `calendar.deleteEventTemplate` | C |
| `calendar.getParentExceptionId` | C |

## contacts

| 方法 | 源文件 |
|------|--------|
| `contacts.getAll` | C |
| `contacts.getAllEmailAddresses` | C |
| `contacts.create` | C |
| `contacts.createMany` | C |
| `contacts.update` | C |
| `contacts.delete` | C |
| `contacts.addPropertyItem` | C |
| `contacts.updatePropertyItem` | C |
| `contacts.removePropertyItem` | C |
| `contacts.addEmailAddress` | C |
| `contacts.removeEmailAddress` | C |
| `contacts.updateEmailAddress` | C |
| `contacts.readThunderbirdContacts` | C |

## contentBlocking

| 方法 | 源文件 |
|------|--------|
| `contentBlocking.addKnownSourceFromURL` | C |
| `contentBlocking.addKnownSourceFromFile` | C |
| `contentBlocking.setKnownSourceSettings` | C |
| `contentBlocking.enableSource` | C |
| `contentBlocking.disableSource` | C |
| `contentBlocking.fetchSourceNow` | C |
| `contentBlocking.deleteKnownSource` | C |
| `contentBlocking.resetPresetSources` | C |
| `contentBlocking.getRuleSource` | C |
| `contentBlocking.getRuleSources` | C |
| `contentBlocking.setActiveExceptionsList` | C |
| `contentBlocking.getActiveExceptionsList` | C |
| `contentBlocking.addExceptionForDomain` | C |
| `contentBlocking.removeExceptionForDomain` | C |
| `contentBlocking.removeAllExceptions` | C |
| `contentBlocking.getExceptions` | C |
| `contentBlocking.getAllExceptionLists` | C |
| `contentBlocking.getBlockedUrlsInfo` | C |
| `contentBlocking.getAdBlockingStats` | C |
| `contentBlocking.clearAdBlockingStats` | C |
| `contentBlocking.isExemptOfFiltering` | C |
| `contentBlocking.isExemptByPartnerURL` | C |
| `contentBlocking.getAdAttributionDomain` | C |

## contextMenu

| 方法 | 源文件 |
|------|--------|
| `contextMenu.show` | C |
| `contextMenu.update` | C |

## devtoolsPrivate

| 方法 | 源文件 |
|------|--------|
| `devtoolsPrivate.getDockingStateSizes` | C |
| `devtoolsPrivate.closeDevtools` | C |
| `devtoolsPrivate.toggleDevtools` | C |

## directMatch

| 方法 | 源文件 |
|------|--------|
| `directMatch.hide` | C |
| `directMatch.getPopularSites` | C |
| `directMatch.getForCategory` | C |
| `directMatch.resetHidden` | C |

## dnsOverHttpsPrivate

| 方法 | 源文件 |
|------|--------|
| `dnsOverHttpsPrivate.dataFetcher` | C |
| `dnsOverHttpsPrivate.configTest` | C |

## editcommand

| 方法 | 源文件 |
|------|--------|
| `editcommand.execute` | C |

## extensionActionUtils

| 方法 | 源文件 |
|------|--------|
| `extensionActionUtils.getToolbarExtensions` | C |
| `extensionActionUtils.executeExtensionAction` | C |
| `extensionActionUtils.removeExtension` | C |
| `extensionActionUtils.showExtensionOptions` | C |
| `extensionActionUtils.getExtensionMenu` | C |
| `extensionActionUtils.executeMenuAction` | C |
| `extensionActionUtils.showGlobalError` | C |
| `extensionActionUtils.triggerGlobalErrors` | C |

## historyPrivate

| 方法 | 源文件 |
|------|--------|
| `historyPrivate.deleteVisits` | C |
| `historyPrivate.getTopUrlsPerDay` | C |
| `historyPrivate.visitSearch` | C |
| `historyPrivate.updateTopSites` | C |

## importData

| 方法 | 源文件 |
|------|--------|
| `importData.getProfiles` | C |
| `importData.startImport` | C |
| `importData.openThunderbirdMailbox` | C |
| `importData.closeThunderbirdMailbox` | C |
| `importData.readMessageFromThunderbirdMailbox` | C |

## infobars

| 方法 | 源文件 |
|------|--------|
| `infobars.showInfobar` | C |
| `infobars.sendButtonAction` | C |

## mailPrivate

| 方法 | 源文件 |
|------|--------|
| `mailPrivate.getFilePaths` | C |
| `mailPrivate.getFullPath` | C |
| `mailPrivate.getMailFilePaths` | C |
| `mailPrivate.writeBufferToMessageFile` | C |
| `mailPrivate.writeTextToMessageFile` | C |
| `mailPrivate.deleteMessageFile` | C |
| `mailPrivate.renameMessageFile` | C |
| `mailPrivate.readFileToBuffer` | C |
| `mailPrivate.readMessageFileToBuffer` | C |
| `mailPrivate.messageFileExists` | C |
| `mailPrivate.readFileToText` | C |
| `mailPrivate.getFileDirectory` | C |
| `mailPrivate.createFileDirectory` | C |
| `mailPrivate.createMessages` | C |
| `mailPrivate.deleteMessages` | C |
| `mailPrivate.updateMessage` | C |
| `mailPrivate.searchMessages` | C |
| `mailPrivate.matchMessage` | C |
| `mailPrivate.getDBVersion` | C |
| `mailPrivate.startMigration` | C |
| `mailPrivate.deleteMailSearchDB` | C |
| `mailPrivate.checkMailSearchDBHealth` | C |
| `mailPrivate.getMailSearchDBCount` | C |

## menubar

| 方法 | 源文件 |
|------|--------|
| `menubar.getHasWindows` | C |
| `menubar.setup` | C |

## menubarMenu

| 方法 | 源文件 |
|------|--------|
| `menubarMenu.show` | C |
| `menubarMenu.getMaxId` | C |

## menuContent

| 方法 | 源文件 |
|------|--------|
| `menuContent.get` | C |
| `menuContent.move` | C |
| `menuContent.create` | C |
| `menuContent.remove` | C |
| `menuContent.removeAction` | C |
| `menuContent.update` | C |
| `menuContent.reset` | C |
| `menuContent.resetAll` | C |

## notes

| 方法 | 源文件 |
|------|--------|
| `notes.get` | C |
| `notes.getTree` | C |
| `notes.move` | C |
| `notes.search` | C |
| `notes.create` | C |
| `notes.update` | C |
| `notes.remove` | C |
| `notes.emptyTrash` | C |
| `notes.beginImport` | C |
| `notes.endImport` | C |

## omniboxPrivate

| 方法 | 源文件 |
|------|--------|
| `omniboxPrivate.startOmnibox` | C |
| `omniboxPrivate.addOrUpdateShortcut` | C |
| `omniboxPrivate.deleteShortcut` | C |

## pageActions

| 方法 | 源文件 |
|------|--------|
| `pageActions.getScripts` | C |
| `pageActions.setScriptOverrideForTab` | C |
| `pageActions.getScriptOverridesForTab` | C |

## prefs

| 方法 | 源文件 |
|------|--------|
| `prefs.get` | C |
| `prefs.set` | C |
| `prefs.getForCache` | C |
| `prefs.setLanguagePairToAlwaysTranslate` | C |
| `prefs.setLanguageToNeverTranslate` | C |
| `prefs.getTranslateSettings` | C |
| `prefs.setSiteToNeverTranslate` | C |
| `prefs.setTranslationDeclined` | C |
| `prefs.resetTranslationPrefs` | C |
| `prefs.resetAllToDefault` | C |

## protonvpn

| 方法 | 源文件 |
|------|--------|
| `protonvpn.getStatus` | C |

## readingListPrivate

| 方法 | 源文件 |
|------|--------|
| `readingListPrivate.add` | C |
| `readingListPrivate.remove` | C |
| `readingListPrivate.getAll` | C |
| `readingListPrivate.setReadStatus` | C |

## runtimePrivate

| 方法 | 源文件 |
|------|--------|
| `runtimePrivate.exit` | C |
| `runtimePrivate.restart` | C |
| `runtimePrivate.getAllFeatureFlags` | C |
| `runtimePrivate.isGuestSession` | C |
| `runtimePrivate.hasGuestSession` | C |
| `runtimePrivate.switchToGuestSession` | C |
| `runtimePrivate.closeGuestSession` | C |
| `runtimePrivate.openProfileSelectionWindow` | C |
| `runtimePrivate.getUserProfiles` | C |
| `runtimePrivate.openNamedProfile` | C |
| `runtimePrivate.closeActiveProfile` | C |
| `runtimePrivate.getUserProfileImages` | C |
| `runtimePrivate.updateActiveProfile` | C |
| `runtimePrivate.getProfileDefaults` | C |
| `runtimePrivate.createProfile` | C |
| `runtimePrivate.getProfileStatistics` | C |
| `runtimePrivate.deleteProfile` | C |
| `runtimePrivate.hasDesktopShortcut` | C |

## savedpasswords

| 方法 | 源文件 |
|------|--------|
| `savedpasswords.getList` | C |
| `savedpasswords.remove` | C |
| `savedpasswords.add` | C |
| `savedpasswords.get` | C |
| `savedpasswords.createDelegate` | C |
| `savedpasswords.delete` | C |
| `savedpasswords.authenticate` | C |

## searchEngines

| 方法 | 源文件 |
|------|--------|
| `searchEngines.getKeywordForUrl` | C |
| `searchEngines.getTemplateUrls` | C |
| `searchEngines.addTemplateUrl` | C |
| `searchEngines.removeTemplateUrl` | C |
| `searchEngines.updateTemplateUrl` | C |
| `searchEngines.moveTemplateUrl` | C |
| `searchEngines.setDefault` | C |
| `searchEngines.getSearchRequest` | C |
| `searchEngines.repairPrepopulatedTemplateUrls` | C |
| `searchEngines.getSwitchPromptData` | C |
| `searchEngines.acknowledgeSwitchPrompt` | C |
| `searchEngines.setIsActive` | C |

## sessionsPrivate

| 方法 | 源文件 |
|------|--------|
| `sessionsPrivate.add` | C |
| `sessionsPrivate.getAll` | C |
| `sessionsPrivate.getAutosaveIds` | C |
| `sessionsPrivate.getContent` | C |
| `sessionsPrivate.modifyContent` | C |
| `sessionsPrivate.update` | C |
| `sessionsPrivate.open` | C |
| `sessionsPrivate.makeContainer` | C |
| `sessionsPrivate.move` | C |
| `sessionsPrivate.rename` | C |
| `sessionsPrivate.delete` | C |
| `sessionsPrivate.emptyTrash` | C |
| `sessionsPrivate.restoreLastClosed` | C |
| `sessionsPrivate.restoreSyncTabs` | C |

## settings

| 方法 | 源文件 |
|------|--------|
| `settings.setContentSetting` | C |

## sitePermissions

| 方法 | 源文件 |
|------|--------|
| `sitePermissions.getAvailablePermissions` | C |
| `sitePermissions.getOverriddenSites` | C |
| `sitePermissions.getOverridesForSite` | C |
| `sitePermissions.setSitePermission` | C |
| `sitePermissions.resetSitePermissions` | C |

## sync

| 方法 | 源文件 |
|------|--------|
| `sync.start` | C |
| `sync.stop` | C |
| `sync.setEncryptionPassword` | C |
| `sync.backupEncryptionToken` | C |
| `sync.restoreEncryptionToken` | C |
| `sync.getDefaultSessionName` | C |
| `sync.setTypes` | C |
| `sync.getEngineState` | C |
| `sync.getLastCycleState` | C |
| `sync.setupComplete` | C |
| `sync.clearData` | C |

## tabsPrivate

| 方法 | 源文件 |
|------|--------|
| `tabsPrivate.update` | C |
| `tabsPrivate.get` | C |
| `tabsPrivate.insertText` | C |
| `tabsPrivate.startDrag` | C |
| `tabsPrivate.scrollPage` | C |
| `tabsPrivate.moveSpatnavRect` | C |
| `tabsPrivate.activateSpatnavElement` | C |
| `tabsPrivate.closeSpatnavOrCurrentOpenMenu` | C |
| `tabsPrivate.hasBeforeUnloadOrUnload` | C |
| `tabsPrivate.translatePage` | C |
| `tabsPrivate.revertTranslatePage` | C |
| `tabsPrivate.determineTextLanguage` | C |
| `tabsPrivate.loadViaLifeCycleUnit` | C |
| `tabsPrivate.getTabPerformanceData` | C |
| `tabsPrivate.getSendTabToSelfEntries` | C |
| `tabsPrivate.dismissSendTabToSelfEntries` | C |
| `tabsPrivate.execSendTabToSelfAction` | C |
| `tabsPrivate.getSendTabToSelfTargets` | C |
| `tabsPrivate.sendSendTabToSelfTarget` | C |

## themePrivate

| 方法 | 源文件 |
|------|--------|
| `themePrivate.export` | C |
| `themePrivate.import` | C |
| `themePrivate.download` | C |
| `themePrivate.getThemeData` | C |

## thumbnails

| 方法 | 源文件 |
|------|--------|
| `thumbnails.captureUI` | C |
| `thumbnails.captureTab` | C |
| `thumbnails.captureBookmark` | C |

## translateHistory

| 方法 | 源文件 |
|------|--------|
| `translateHistory.get` | C |
| `translateHistory.add` | C |
| `translateHistory.remove` | C |
| `translateHistory.reset` | C |

## utilities

| 方法 | 源文件 |
|------|--------|
| `utilities.print` | C |
| `utilities.clearCache` | C |
| `utilities.clearAllRecentlyClosedSessions` | C |
| `utilities.clearRecentlyClosedTabs` | C |
| `utilities.isTabInLastSession` | C |
| `utilities.isUrlValid` | C |
| `utilities.canOpenUrlExternally` | C |
| `utilities.getUrlFragments` | C |
| `utilities.urlToThumbnailText` | C |
| `utilities.getSelectedText` | C |
| `utilities.selectFile` | C |
| `utilities.openFolder` | C |
| `utilities.selectLocalImage` | C |
| `utilities.storeImage` | C |
| `utilities.cleanUnusedImages` | C |
| `utilities.getVersion` | C |
| `utilities.getEnvVars` | C |
| `utilities.getMediaAvailableState` | C |
| `utilities.setSharedData` | C |
| `utilities.getSharedData` | C |
| `utilities.takeMutex` | C |
| `utilities.releaseMutex` | C |
| `utilities.getSystemDateFormat` | C |
| `utilities.getSystemCountry` | C |
| `utilities.setLanguage` | C |
| `utilities.getLanguage` | C |
| `utilities.setVivaldiAsDefaultBrowser` | C |
| `utilities.isVivaldiDefaultBrowser` | C |
| `utilities.launchNetworkSettings` | C |
| `utilities.savePage` | C |
| `utilities.openPage` | C |
| `utilities.broadcastMessage` | C |
| `utilities.setDefaultContentSettings` | C |
| `utilities.getDefaultContentSettings` | C |
| `utilities.setBlockThirdPartyCookies` | C |
| `utilities.getBlockThirdPartyCookies` | C |
| `utilities.openTaskManager` | C |
| `utilities.createQRCode` | C |
| `utilities.getStartupAction` | C |
| `utilities.setStartupAction` | C |
| `utilities.canShowWhatsNewPage` | C |
| `utilities.showPasswordDialog` | C |
| `utilities.setDialogPosition` | C |
| `utilities.isRazerChromaAvailable` | C |
| `utilities.isRazerChromaReady` | C |
| `utilities.setRazerChromaColor` | C |
| `utilities.isDownloadManagerReady` | C |
| `utilities.setContentSettings` | C |
| `utilities.isDialogOpen` | C |
| `utilities.focusDialog` | C |
| `utilities.startChromecast` | C |
| `utilities.generateQRCode` | C |
| `utilities.getGAPIKey` | C |
| `utilities.getGOAuthClientId` | C |
| `utilities.getGOAuthClientSecret` | C |
| `utilities.getMOAuthClientId` | C |
| `utilities.getYOAuthClientId` | C |
| `utilities.getYOAuthClientSecret` | C |
| `utilities.getVivaldiNetOAuthClientSecret` | C |
| `utilities.getVivaldiNetOAuthClientId` | C |
| `utilities.getFOAuthClientId` | C |
| `utilities.getAOLOAuthClientId` | C |
| `utilities.getAOLOAuthClientSecret` | C |
| `utilities.getOSGeolocationState` | C |
| `utilities.openOSGeolocationSettings` | C |
| `utilities.getCommandLineValue` | C |
| `utilities.osCrypt` | C |
| `utilities.osDecrypt` | C |
| `utilities.translateText` | C |
| `utilities.showManageSSLCertificates` | C |
| `utilities.setProtocolHandling` | C |
| `utilities.browserWindowReady` | C |
| `utilities.readImage` | C |
| `utilities.isRTL` | C |
| `utilities.emulateUserInput` | C |
| `utilities.isVivaldiPinnedToLaunchBar` | C |
| `utilities.pinVivaldiToLaunchBar` | C |
| `utilities.downloadsDrag` | C |
| `utilities.hasCommandLineSwitch` | C |
| `utilities.acknowledgeCrashedSession` | C |
| `utilities.silentlyInstallExtension` | C |
| `utilities.allowVPNIncognito` | C |
| `utilities.requestVivaldiSyncStatus` | C |
| `utilities.openPrivacyReportDialog` | C |
| `utilities.updatePrimarySelection` | C |
| `utilities.showAdditionalStartupPages` | C |
| `utilities.copyToClipboard` | C |

## vivaldiAccount

| 方法 | 源文件 |
|------|--------|
| `vivaldiAccount.login` | C |
| `vivaldiAccount.logout` | C |
| `vivaldiAccount.getState` | C |
| `vivaldiAccount.setPendingRegistration` | C |
| `vivaldiAccount.getPendingRegistration` | C |

## webViewPrivate

| 方法 | 源文件 |
|------|--------|
| `webViewPrivate.getThumbnail` | C |
| `webViewPrivate.showPageInfo` | C |
| `webViewPrivate.setIsFullscreen` | C |
| `webViewPrivate.getPageHistory` | C |
| `webViewPrivate.allowBlockedInsecureContent` | C |
| `webViewPrivate.sendRequest` | C |
| `webViewPrivate.getPageSelection` | C |

## windowPrivate

| 方法 | 源文件 |
|------|--------|
| `windowPrivate.create` | C |
| `windowPrivate.getCurrentId` | C |
| `windowPrivate.setState` | C |
| `windowPrivate.updateMaximizeButtonPosition` | C |
| `windowPrivate.getFocusedElementInfo` | C |
| `windowPrivate.isOnScreenWithNotch` | C |
| `windowPrivate.setControlButtonsPosition` | C |
| `windowPrivate.performHapticFeedback` | C |

## zoom

| 方法 | 源文件 |
|------|--------|
| `zoom.setVivaldiUIZoom` | C |
| `zoom.getVivaldiUIZoom` | C |
| `zoom.setDefaultZoom` | C |
| `zoom.getDefaultZoom` | C |
