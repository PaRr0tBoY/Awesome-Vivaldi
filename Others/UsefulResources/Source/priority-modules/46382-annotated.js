
      46382: (e, t, n) => {
        "use strict";
        n.d(t, {
          Z: () => w,
        });
        var i = n(12442),
          s = n(99827),
          a = n(54162),
          o = n(59322),
          r = n(18873),
          l = n(33638),
          c = n(63153),
          d = n(15489),
          u = n(56371),
          h = n(2497),
          p = n(7064),
          g = n(1407),
          m = n(12964),
          f = n(17885),
          v = n(44850);
        // b = window.html path constant
    const b = "window.html";
        let y;

        // S = calculateWindowRect(screenX, screenY, width, height)
    function S(e, t, n, i, s) {
          // h.Z = getScreenInfo
    const { screen: a } = (0, h.Z)(e),
            o = n <= // screen.height
    a.height ? n : // screen.height
    a.height;
          let r = i >= 0 ? i : // screen.availableLeft
    a.availLeft + t / 2,
            l = s >= 0 ? s : // screen.availableTop
    a.availTop + (// screen.height
    a.height - n) / 2;
          l < 22 ? (l = 22) : l < 0 && (l = 0);
          r + t > // screen.availableLeft
    a.availLeft + // screen.width
    a.width &&
            ((r = // screen.availableLeft
    a.availLeft + (// screen.width
    a.width - t)), r < 0 && (r = 0));
          return {
            left: Math.round(r),
            top: Math.round(l),
            width: Math.round(t),
            height: Math.round(o),
          };
        }
        const C = new (class {
            openGuestWindow() {
              p.Z.runtimePrivate.switchToGuestSession((e) => {
                e || console.warn("Guest mode is disabled.");
              });
            }
            closeGuestSession() {
              p.Z.runtimePrivate.closeGuestSession((e) => {
                e || console.warn("Guest mode is disabled.");
              });
            }
            managePeople() {
              return p.Z.runtimePrivate.openProfileSelectionWindow();
            }
            closeActiveProfile() {
              p.Z.runtimePrivate.closeActiveProfile((e) => {
                e || console.warn("Failed to open profile window.");
              });
            }
            showCaretBrowsingDialog(e) {
              const t = {
                actionType: "MAIN_SHOW_CARET_BROWSING_DIALOG",
                winId: e,
              };
              l.Z.dispatch(t);
            }
            showAddFeed(e, t) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_ADD_FEED",
                winId: e,
                options: t,
              });
            }
            showAddMailFolder(e, t) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_ADD_MAIL_FOLDER",
                winId: e,
                options: t,
              });
            }
            showDeleteMailFolder(e, t) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_DELETE_MAIL_FOLDER",
                winId: e,
                options: t,
              });
            }
            showAddFeedFolder(e, t) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_ADD_FEED_FOLDER",
                winId: e,
                options: t,
              });
            }
            showDeleteFeedFolder(e, t) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_DELETE_FEED_FOLDER",
                winId: e,
                options: t,
              });
            }
            showDeleteWorkspace(e, t) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_DELETE_WORKSPACE",
                winId: e,
                options: t,
              });
            }
            showQuickCommand(e) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_QUICKCOMMANDS",
                winId: e,
              });
            }
            async showCalendar(e, t) {
              try {
                const n = await o.ZP.openURL(e, "vivaldi://calendar", {
                  singleton: !0,
                });
                t &&
                  i.Z.selectEvent(n.pageId, {
                    eventId: t,
                  });
              } catch (e) {
                console.error(e);
              }
            }
            showCalendarNotification(e, t) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_CALENDAR_ALARM",
                winId: e,
                options: t,
              });
            }
            showCalendarEditEvent(e, t) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_CALENDAR_EDIT_EVENT",
                winId: e,
                options: {
                  event: t,
                },
              });
            }
            showEditEventTemplate(e, t) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_CALENDAR_EDIT_TEMPLATE",
                winId: e,
                options: t,
              });
            }
            showCalendarImportEvents(e, t) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_CALENDAR_IMPORT_EVENTS_DIALOG",
                winId: e,
                options: {
                  uri: t,
                },
              });
            }
            showKeyboardShortcuts(e) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_KEYBOARDS_SHORTCUTS",
                winId: e,
              });
            }
            showPageAccessKeys(e) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_PAGE_ACCESS_KEYS",
                winId: e,
              });
            }
            showConfirmOpenLinksDialog(e, t) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_CONFIRM_OPEN_LINKS_DIALOG",
                winId: e,
                options: t,
              });
            }
            showConfirmCloseOtherTabsDialog(e, t) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_CONFIRM_CLOSE_OTHER_TABS_DIALOG",
                winId: e,
                options: t,
              });
            }
            showClearBrowsingHistoryDialog(e) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_CLEAR_BROWSING_HISTORY_DIALOG",
                winId: e,
              });
            }
            showModal(e, t) {
              return new Promise((n) =>
                l.Z.dispatch({
                  actionType: "MAIN_SHOW_MODAL_DIALOG",
                  winId: e,
                  options: {
                    ...t,
                    resolve: n,
                  },
                })
              );
            }
            showModalInfo(e, t) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_MODAL_INFO",
                winId: e,
                options: t,
              });
            }
            showImportDataDialog(e) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_IMPORT_DATA_DIALOG",
                winId: e,
              });
            }
            showMailInfoDialog(e) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_MAIL_INFO_DIALOG",
                winId: e,
              });
            }
            showBookmarkDialog(e, t) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_BOOKMARK_DIALOG",
                winId: e,
                options: t,
              });
            }
            showBookmarkAddedPopup(e, t) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_BOOKMARK_ADDED_POPUP",
                winId: e,
                options: t,
              });
            }
            showContextDialog(e, t, n) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_CONTEXT_DIALOG",
                winId: e,
                options: {
                  id: t,
                  force: n ?? !1,
                },
              });
            }
            async showMail(e) {
              await o.ZP.openURL(e, v.urls.internals.mailpage, {
                singleton: !0,
              });
              const t = a.Z.getSelectedFolder(e);
              t && s.Z.selectFolder(e, t);
            }
            showMailUnsubscribeDialog(e, t) {
              const n = {
                actionType: "MAIN_SHOW_MAIL_UNSUBSCRIBE_DIALOG",
                winId: e,
                options: t,
              };
              l.Z.dispatch(n);
            }
            showMailAuthenticationDialog(e, t) {
              const n = {
                actionType: "MAIN_SHOW_MAIL_AUTHENTICATION_DIALOG",
                winId: e,
                options: t,
              };
              l.Z.dispatch(n);
            }
            showMailDeleteDialogSetting(e, t) {
              const n = {
                actionType: "MAIN_SHOW_MAIL_DELETE_DIALOG_SETTING",
                winId: e,
                options: t,
              };
              l.Z.dispatch(n);
            }
            showMailDeleteDialogFolders(e, t) {
              const n = {
                actionType: "MAIN_SHOW_MAIL_DELETE_DIALOG_FOLDERS",
                winId: e,
                options: t,
              };
              l.Z.dispatch(n);
            }
            showMailDeleteDialogAccounts(e, t) {
              const n = {
                actionType: "MAIN_SHOW_MAIL_DELETE_DIALOG_ACCOUNTS",
                winId: e,
                options: t,
              };
              l.Z.dispatch(n);
            }
            showMailDeleteDialogConfirmAll(e, t) {
              const n = {
                actionType: "MAIN_SHOW_MAIL_DELETE_DIALOG_CONFIRM_ALL",
                winId: e,
                options: t,
              };
              l.Z.dispatch(n);
            }
            showSaveSessionDialog(e, t) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_SAVE_SESSION_DIALOG",
                winId: e,
                options: t,
              });
            }
            showOpenSessionDialog(e) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_OPEN_SESSION_DIALOG",
                winId: e,
              });
            }
            showDialog(e, t, n) {
              const i = {
                actionType: "MAIN_SHOW_DIALOG",
                winId: e,
                options: t,
                onAfterClose: n,
              };
              l.Z.dispatch(i);
            }
            async showExtensions(e) {
              await o.ZP.openURL(e, "vivaldi://extensions", {
                singleton: !0,
              });
            }
            async showHistory(e) {
              await o.ZP.openURL(e, "vivaldi://history", {
                singleton: !0,
              });
            }
            async showNotes(e) {
              await o.ZP.openURL(e, "vivaldi://notes", {
                singleton: !0,
              });
            }
            async showBookmarks(e, t = "") {
              await o.ZP.openURL(e, `vivaldi://bookmarks/${t}`, {
                singleton: !0,
              });
            }
            async showWelcome(e) {
              await o.ZP.openURL(e, "vivaldi://welcome");
            }
            async showSettings(e, t = "general", n, i = !1) {
              const s =
                n && !(0, m.Z)(n)
                  ? Object.keys(n)
                      .map((e) => `${e}=${n[e] ?? ""}`)
                      .join("&")
                  : "";
              if (r.Z.get(f.kSettingsInTab) && !i)
                await o.ZP.openURL(e, `vivaldi://settings/${t}/?${s}`, {
                  singleton: !0,
                  skipParams: !0,
                });
              else {
                d.ZP.settingsCategory = `${t}&${s}`;
                const n = {
                  bounds: S(
                    e,
                    Math.max(r.Z.get(f.kSettingsSizeWidth), g.MK),
                    Math.max(r.Z.get(f.kSettingsSizeHeight), g.mR),
                    r.Z.get(f.kSettingsSizeLeft),
                    r.Z.get(f.kSettingsSizeTop)
                  ),
                  windowKey: "settings",
                };
                await c.Z.openWindow(e, b, "settings", n);
              }
            }
            showAccountSheet(e, t = "login") {
              const n = {
                actionType: "MAIN_SHOW_ACCOUNT_SHEET",
                winId: e,
                options: t,
              };
              l.Z.dispatch(n);
            }
            showAddCustomLabel(e) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_CREATE_LABEL",
                winId: e,
              });
            }
            showCustomLabelDialog(e) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_LABEL_FLAG_DIALOG",
                winId: e,
              });
            }
            showShareVivaldiDialog(e) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_SHARE_VIVALDI_DIALOG",
                winId: e,
              });
            }
            showDeleteCustomLabelConfirmation(e, t, n) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_DELETE_LABEL_CONFIRMATION",
                winId: e,
                options: {
                  label: t,
                  callback: n,
                },
              });
            }
            showAddFilter(e) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_ADD_FILTER",
                winId: e,
              });
            }
            showAddMailingList(e) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_ADD_MAILING_LIST",
                winId: e,
              });
            }
            showDeleteFilterConfirmation(e, t, n) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_DELETE_FILTER_CONFIRMATION",
                winId: e,
                options: {
                  label: t,
                  callback: n,
                },
              });
            }
            showDeleteFeedConfirmation(e, t, n) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_DELETE_FEED_CONFIRMATION",
                winId: e,
                options: {
                  label: t,
                  callback: n,
                },
              });
            }
            showMailFilterViewConfirmation(e, t, n) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_MAIL_VIEW_FILTER_CONFIRMATION",
                winId: e,
                options: {
                  label: t,
                  callback: n,
                },
              });
            }
            showMailUploadConfirmation(e, t, n) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_MAIL_UPLOAD_CONFIRMATION",
                winId: e,
                options: {
                  accountId: t,
                  callback: n,
                },
              });
            }
            showMessageMoveConfirmation(e, t, n, i) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_MAIL_MESSAGE_MOVE_CONFIRMATION",
                winId: e,
                options: {
                  callback: t,
                  title: n,
                  body: i,
                },
              });
            }
            showCreateArchiveFolderConfirmation(e, t, n, i) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_MAIL_CREATE_ARCHIVE_FOLDER_CONFIRMATION",
                winId: e,
                options: {
                  callback: t,
                  title: n,
                  body: i,
                },
              });
            }
            showMailAccountDialog(e) {
              const t = {
                actionType: "MAIN_SHOW_MAIL_ACCOUNT_DIALOG",
                winId: e,
              };
              l.Z.dispatch(t);
            }
            showCalendarAccountDialog(e) {
              const t = {
                actionType: "MAIN_SHOW_CALENDAR_ACCOUNT_DIALOG",
                winId: e,
              };
              l.Z.dispatch(t);
            }
            showCreateCalendarDialog(e) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_CREATE_CALENDAR_DIALOG",
                winId: e,
              });
            }
            updateToolbarSpacer(e) {
              l.Z.dispatch({
                actionType: "MAIN_TOOLBAR_SPACER_UPDATE",
                winId: e,
              });
            }
            showResetToolbarConfirmation(e, t, n, i) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_TOOLBAR_RESET",
                winId: e,
                options: {
                  callback: t,
                  title: n,
                  body: i,
                },
              });
            }
            showPrivacyDashboardDialog(e) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_PRIVACY_DASHBOARD",
                winId: e,
              });
            }
            showWorkspaceDialog(e, t) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_WORKSPACE_DIALOG",
                winId: e,
                options: t || {
                  createInBackground: !1,
                  withPages: void 0,
                },
              });
            }
            showNoteSelectionDialog(e, t) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_NOTE_SELECTION_DIALOG",
                winId: e,
                options: t,
              });
            }
            showEnableWorkspaceDialog(e, t) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_ENABLE_WORKSPACE_DIALOG",
                winId: e,
                options: t,
              });
            }
            showIncludeWorkspaceDialog(e, t) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_INCLUDE_WORKSPACE_DIALOG",
                winId: e,
                options: t,
              });
            }
            showEnableSessionAutosaveDialog(e, t) {
              l.Z.dispatch({
                actionType: "MAIN_SHOW_ENABLE_SESSION_AUTOSAVE_DIALOG",
                winId: e,
                options: t,
              });
            }
            async openNewPopAsTabOrWindow(e, t, n) {
              if (r.Z.get(f.kPopupsShowInTab)) t.window.accept(e + ";1");
              else {
                const i = {
                    bounds: {
                      left: t.initialLeft,
                      top: t.initialTop,
                      width: t.initialWidth,
                      height: t.initialHeight,
                    },
                    incognito: n,
                  },
                  s = await c.Z.openWindow(e, b, "popup", i);
                t.window
                  ? t.window.accept(s + ";1")
                  : o.ZP.openURL(s, t.targetUrl);
              }
            }
            async openMailComposerWindow(e, t) {
              const n = {
                bounds: S(
                  e,
                  Math.max(r.Z.get(f.kMailFloatingComposerSizeWidth), g.MK),
                  Math.max(r.Z.get(f.kMailFloatingComposerSizeHeight), g.mR),
                  r.Z.get(f.kMailFloatingComposerSizeLeft),
                  r.Z.get(f.kMailFloatingComposerSizeTop)
                ),
                tabUrl: t.url,
                vivExtData: JSON.stringify({
                  composerProps: t,
                }),
              };
              t.originalId && (n.windowKey = "ComposerWindow_" + t.originalId),
                await c.Z.openWindow(e, b, "mail-composer", n);
            }
            startCasting(e) {
              p.Z.utilities.startChromecast(e);
            }
            setPaneFocus(e, t) {
              l.Z.dispatch({
                actionType: "MAIN_SELECTING_TOOLBAR",
                winId: e,
                options: {
                  enable: t,
                },
              });
            }
            stepFocus(e, t) {
              const i = e.vivaldiWindowId,
                { document: s, HTMLElement: a } = e;
              o.ZP.clearSelection(i);
              const r = function (e, t) {
                  return Array.from(s.querySelectorAll(e))
                    .map((e) => {
                      const t = e.getBoundingClientRect(),
                        n = (function (e) {
                          let t = 0,
                            n = 0;
                          for (
                            ;
                            e instanceof a &&
                            ((t += e.offsetTop),
                            (n += e.offsetLeft),
                            e.offsetParent);

                          )
                            e = e.offsetParent;
                          return {
                            left: n,
                            top: t,
                          };
                        })(e);
                      return {
                        elm: e,
                        rect: {
                          left: n.left,
                          top: n.top,
                          width: t.width,
                          height: t.height,
                        },
                      };
                    })
                    .sort((e, n) =>
                      t
                        ? e.rect.left < n.rect.left
                          ? -1
                          : e.rect.left > n.rect.left
                          ? 1
                          : e.rect.top < n.rect.top
                          ? -1
                          : e.rect.top > n.rect.top
                          ? 1
                          : 0
                        : e.rect.top < n.rect.top
                        ? -1
                        : e.rect.top > n.rect.top
                        ? 1
                        : e.rect.left < n.rect.left
                        ? -1
                        : e.rect.left > n.rect.left
                        ? 1
                        : 0
                    );
                },
                l = function (e, t) {
                  const n = t.children;
                  let i = !1;
                  for (let t = 0; t < n.length; t++) {
                    if (n[t] === e) return !0;
                    if (l(e, n[t])) {
                      i = !0;
                      break;
                    }
                  }
                  return i;
                },
                c = r(".pagefocusstop", !0),
                d = r(".uifocusstop", !1).concat(c);
              if (d.length > 0) {
                let a = -1;
                const r = s.activeElement;
                for (let e = 0; e < d.length; e++)
                  if (d[e].elm === r || l(r, d[e].elm)) {
                    a = e;
                    break;
                  }
                a =
                  -1 === a
                    ? t
                      ? 0
                      : d.length - 1
                    : t
                    ? a + 1 < d.length
                      ? a + 1
                      : 0
                    : 0 === a
                    ? d.length - 1
                    : a - 1;
                if (-1 !== c.findIndex((e) => e === d[a])) {
                  const t = parseInt(d[a].elm.getAttribute("data-id"));
                  o.ZP.activateTab(t, i),
                    n(47995).Z.executeActions(
                      "event",
                      e,
                      "COMMAND_FOCUS_WEBVIEW"
                    ),
                    (y = setTimeout(() => C.setPaneFocus(i, !1), 1e3));
                } else
                  d[a].elm instanceof e.HTMLElement && d[a].elm.focus(),
                    y && clearTimeout(y);
                C.setPaneFocus(i, !0);
              }
            }
            async showLargeAttachmentWarning(e, t) {
              const { action: n } = await C.showModal(d.ZP.getMailWindowId(), {
                modal: {
                  title: (0, u.Z)("A large file is being attached"),
                  body: (0, u.Z)(
                    `Sending a message with a large attachment may fail: file: "${e}" size: ${Number(
                      t / 1e6
                    ).toFixed(1)}MB`
                  ),
                  actions: [
                    {
                      title: "Do not attach",
                      action: "cancel",
                      default: !0,
                    },
                  ],
                  cancelAction: {
                    title: (0, u.Z)("mail", "Attach anyway"),
                    action: "continue",
                  },
                },
              });
              return n;
            }
          })(),
          // WindowManager = C instance
    w = C;
      },