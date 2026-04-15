59322: (e, t, n) => {
        "use strict";
        n.d(t, {
          ZP: () => We,
          nq: () => ke,
        });
        var i = n(69787),
          s = n(7065),
          a = n(47995),
          o = n(19789),
          r = n(46382),
          l = n(33638);
        var c = n(7168),
          d = n(8074),
          u = n(96951),
          h = n(17434),
          p = n(14481),
          g = n(31301),
          m = n(18873),
          f = n(18237),
          v = n(14022),
          b = n(81762),
          y = n(16716),
          S = n(70864),
          C = n(83526),
          w = n(63153),
          x = n(15489),
          A = n(29104),
          T = n(53454),
          _ = n(92292),
          E = n(2497),
          I = n(71193),
          k = n(84847),
          Z = n(4027),
          N = n(7064),
          P = n(1407),
          M = n(44850),
          D = n(35369),
          O = n(69046),
          L = n(50486),
          j = n(751),
          R = n(82786),
          F = n(16152),
          B = n(42941),
          W = n(42578),
          U = n(36436),
          V = n(58821),
          H = n(17885),
          G = n(721),
          z = n(14789),
          K = n(80419),
          $ = n(37441),
          Y = n(34155);
        let X = 0;
        async function Q() {
          const e = x.ZP.getLastActiveBrowserWindowId();
          if (e === x.Ex)
            return void console.warn(
              "showWhatsNewTab: Expected a valid windowId"
            );
          if (x.ZP.isIncognitoOrGuest(e)) return;
          const t = await (async function (e) {
              return (
                await _.Z.windows.getAll({
                  populate: !0,
                })
              ).some((t) =>
                t.tabs?.some((t) => t.url === e || t.pendingUrl === e)
              );
            })(M.INTERNAL_URL_MAP.welcome),
            n = await N.Z.utilities.canShowWhatsNewPage();
          if (!n.show) return;
          if (n.firstrun) return;
          const { vivaldiVersion: i } = N.Z.utilities.getVersion();
          return ee(
            e,
            "https://vivaldi.com/newfeatures?hl=" +
              o.ZP.UI_LANGUAGE +
              "&version=" +
              i +
              "&os=M",
            {
              inCurrent: !1,
              inBackground: t,
            }
          );
        }
        const q = (0, F.Z)(() => {
            const e = new Date();
            let t = m.Z.get(H.kStartupActiveDays) || [];
            (t.length > 0 && (0, V.KC)(e, new Date(t[t.length - 1]))) ||
              ((t = t.filter((t) => e - t < 12096e5)),
              t.push(e.getTime()),
              g.Z.set(H.kStartupActiveDays, t));
          }, 1e4),
          J = (0, F.Z)((e) => {
            const { toStart: t, windowId: n } = e,
              i = u.ZP.getActivePage(n);
            if (!i) return;
            const s = u.ZP.getSelectionOrActivePage(n),
              a = (0, O.av)(i),
              o = u.ZP.getPages(n);
            if (a) {
              const e = o.flatMap((e, t) => ((0, O.av)(e) === a ? [t] : [])),
                r = s.filter((e) => (0, O.av)(e) === a),
                l = t ? e.get(0) : e.get(e.size - 1);
              "number" == typeof l && Be.moveDroppedTabs(n, r, i.id, l, a);
            } else {
              const e = t ? 0 : o.size - 1;
              if (s.isEmpty()) return;
              Be.moveDroppedTabs(n, s, i.id, e, void 0);
            }
          }, 50);
        async function ee(e, t = "", n = {}) {
          q();
          const i = (0, M.getUrl)(t),
            s = i && "_blank" !== i ? i : u.ZP.getDefaultStartpage(e);
          if (!x.ZP.getWindowState(e)) {
            if (e !== x.Ex) return Promise.reject("Unknown window");
            n.inNewWindow = !0;
          }
          if (x.ZP.isSettings(e) && !0 !== n.inNewWindow) {
            let t = x.ZP.getLastActiveBrowserWindowId();
            if ((t !== x.Ex && x.ZP.isGuest() && (t = x.Ex), t === x.Ex)) {
              const e = x.ZP.getIds("normal").filter((e) => !x.ZP.isGuest());
              e.length > 0 && (t = e[0]);
            }
            t === x.Ex
              ? ((e = x.Ex), (n.inNewWindow = !0), (n.inBackground = !1))
              : ((e = t), (n.inNewWindow = !1), (n.inCurrent = !1));
          }
          if ((0, M.isBannedFromLoading)(s))
            return Promise.reject("Illegal URL All profiles");
          if (x.ZP.isGuest() && (0, M.isBannedFromGuestMode)(s))
            return Promise.reject("Illegal URL for Guest mode");
          if (
            x.ZP.isIncognito(e) &&
            (0, M.isBannedFromPrivateProfileWindows)(s)
          ) {
            const t = x.ZP.getIds("normal").filter(
              (e) => !x.ZP.isIncognitoOrGuest(e)
            );
            (n.incognito = !1),
              t.length > 0 ? (e = t[0]) : (n.inNewWindow = !0);
          }
          if (
            (x.ZP.isPopup(e) && ((n.inNewWindow = !0), (n.inBackground = !1)),
            n.inNewWindow)
          )
            return w.Z.openBrowserWindow(e, s, {
              incognito: n.incognito,
              transition: n.transition,
              fromUrlField: n.fromUrlField,
            }).then((e) => {
              if (e && e.tabs && e.tabs.length > 0) {
                const t = e.tabs[0];
                return {
                  windowId: parseInt(e.id),
                  pageId: parseInt(t.id),
                };
              }
              return {
                windowId: -1,
                pageId: -1,
              };
            });
          let a = "";
          if (
            (n.contentType &&
              ((a = "Content-Type: " + n.contentType + "\r\n\r\n"),
              console.assert(n.postParams)),
            n.singleton)
          ) {
            const t = u.ZP.getPages(e).find((e) =>
              (0, U.uu)(s, e.url, n.skipParams)
            );
            if (t) {
              if (!n.inBackground) {
                const n = T.Z.getActiveWorkspaceId(e);
                (0, O.cm)(t) !== n &&
                  (await (0, $.V)(t.id, {
                    workspaceId: n,
                  })),
                  (0, M.isSettingsUrl)(s) &&
                    l.Z.dispatch({
                      actionType: "PAGE_OPEN_URL",
                      windowId: e,
                      pageId: t.id,
                      url: s,
                    }),
                  l.Z.dispatch({
                    actionType: "PAGE_OPEN",
                    windowId: e,
                    pageId: t.id,
                  });
              }
              return Promise.resolve({
                windowId: e,
                pageId: t.id,
              });
            }
          }
          const o = n.inSpecificPageId
            ? u.ZP.getPageInWindow(e, n.inSpecificPageId)
            : u.ZP.getActivePage(e);
          if (
            (n.restrictPinnedTab && (n.inCurrent = !1),
            (n.inCurrent || n.inSpecificPageId) && o && !x.ZP.isPopup(e))
          ) {
            const t = o.vivExtData.ext_id;
            return (
              p.Z.destroyPeriodicAlarm({
                ids: [t],
                from: "tab",
              }),
              l.Z.dispatch({
                actionType: "PAGE_OPEN_URL",
                pageId: o.id,
                windowId: e,
                url: s,
                postParams: n.postParams,
                headers: a,
                transition: n.transition,
                fromUrlField: n.fromUrlField,
                bookmarkId: n.bookmarkId,
              }),
              Promise.resolve({
                windowId: e,
                pageId: o.id,
              })
            );
          }
          const r = {
              url: n.postParams ? P.f4 : s,
              windowId: e,
              active: !n.inBackground,
              transition: n.transition,
              fromUrlField: n.fromUrlField,
              openerTabId:
                n.addOpenerTabId && o && !(0, M.isStartPage)(o.url)
                  ? o.id
                  : void 0,
            },
            c = {};
          n.tiling && (c.tiling = n.tiling),
            n.groupId &&
              ((c.group = n.groupId),
              (c.fixedGroupTitle = n.fixedGroupTitle),
              (c.groupColor = n.groupColor),
              (r.pinned = u.ZP.isPinnedGroup(n.groupId, e)));
          const d = JSON.stringify(c);
          "{}" !== d && (r.vivExtData = d);
          const h = (await _.Z.tabs.create(r)).id;
          return void 0 === h
            ? Promise.reject("Failed to create tab")
            : (n.postParams &&
                Y.nextTick(() => {
                  l.Z.dispatch({
                    actionType: "PAGE_OPEN_URL",
                    pageId: h,
                    windowId: e,
                    url: s,
                    postParams: n.postParams,
                    headers: a,
                    transition: n.transition,
                    fromUrlField: n.fromUrlField,
                    bookmarkId: n.bookmarkId,
                  });
                }),
              n.inBackground ||
                (await (function (e, t) {
                  return new Promise((n) => {
                    _.Z.windows.update(e, t, n);
                  });
                })(e, {
                  focused: !0,
                })),
              {
                windowId: e,
                pageId: h,
              });
        }
        async function te(e, t, n) {
          if (h.Z.offerUpdatedTab(n, t)) return;
          const s = n.windowId;
          if (
            ("complete" === t.status && (t.title = n.title),
            l.Z.dispatch({
              actionType: "CHROME_TABS_UPDATED",
              tabId: e,
              windowId: s,
              changeInfo: t,
            }),
            m.Z.get(H.kWorkspacesEnabled) &&
              t.url &&
              t.vivExtData &&
              "loading" === t.status)
          ) {
            const n = JSON.parse(t.vivExtData).workspaceId,
              a = x.ZP.getActiveWindowId(),
              o = T.Z.getActiveWorkspaceId(a);
            if (n !== o) {
              u.ZP.getPages(a, {
                workspaceId: o,
              }).isEmpty() && (await Be.openURL(a));
            }
            if ((a !== s && (await w.Z.focus(s)), n !== o)) {
              const t = u.ZP.getPageInWindow(s, e);
              t?.vivExtData.tiling && (await i.nI(s, D.aV.of(t))),
                await Pe(s, n);
            }
            Se(e, s);
          }
        }

        function ne(e) {
          return e.some((e) => e.active) ? (0, u.yz)(e)?.id : void 0;
        }

        function ie(e, t, n) {
          (class {
            static setMediaState(e, t) {
              l.Z.dispatch({
                actionType: "PAGE_SET_MEDIASTATE",
                tabId: e,
                mediastate: t,
              });
            }
          }).setMediaState(e, n);
        }

        function se(e, t, n, i) {
          let s = "undecided";
          switch (i) {
            case "allow":
              s = "allowed";
              break;
            case "block":
              s = "blocked";
              break;
            default:
              s = "undecided";
          }
          let a = null;
          try {
            a = new URL(n);
          } catch (e) {
            return;
          }
          d.Z.setPermission(e, a.origin, t, [], s);
        }

        function ae(e, t, n) {
          l.Z.dispatch({
            actionType: "VIVALDI_TABS_UPDATED",
            pageId: e,
            windowId: t,
            tabInfo: n,
          });
        }
        async function oe(e, t) {
          if (!x.ZP.getWindowState(e)) return;
          const n = u.ZP.getPageInWindow(e, t),
            i = n ? (0, O.cm)(n) : void 0;
          i !== T.Z.getActiveWorkspaceId(e) && (await Pe(e, i));
          const s = u.ZP.getActivePage(e);
          (s && s.id === t) || Se(t, e);
        }

        function re(e, t) {
          if (h.Z.offerEraseTabId(e, t.windowId, t.parentTabId)) return;
          N.Z.utilities.cleanUnusedImages(50);
          const n = {
            actionType: "CHROME_TABS_REMOVED",
            tabId: e,
            removeInfo: t,
          };
          l.Z.dispatch(n);
        }

        function le(e, t) {
          const n = h.Z.findTabId(t)?.panelId;
          if (n) {
            h.Z.replaceRelatedTab(e, t);
            const i = {
              actionType: "PANEL_TAB_REPLACED",
              addedTabId: e,
              removedTabId: t,
              panelId: n,
            };
            return void l.Z.dispatch(i);
          }
          const i = {
            actionType: "CHROME_TABS_REPLACED",
            addedTabId: e,
            removedTabId: t,
          };
          l.Z.dispatch(i);
        }
        let ce = Promise.resolve();

        function de() {
          return "off" !== m.Z.get(H.kTabsStackingMode);
        }

        function ue(e) {
          if (h.Z.offerNewTab(e)) return;
          const t = s.ZP.tabToPage(e),
            { openerTabId: n, windowId: i } = t,
            a = u.ZP.getActivePage(i),
            o = T.Z.getActiveWorkspaceId(i),
            r = {
              ext_id: (0, O._o)(t) || crypto.randomUUID(),
            },
            c = [...u.ZP.getPageHistory(i)];
          t.active ? (0, z.AL)(c, t.id) : (0, z.EQ)(c, t.id);
          const d = t.index;
          if (!we && !t.pinned) {
            const n = e.vivExtData?.includes("ext_id") ?? !1;
            (!n || (n && o !== (0, O.cm)(t))) &&
              (t.index = (function (e, t, n) {
                const { windowId: i } = e,
                  s = u.ZP.getPages(i),
                  a = n ? "alwayslast" : m.Z.get(H.kTabsNewPlacement),
                  o =
                    "number" == typeof e.openerTabId
                      ? u.ZP.getPageById(e.openerTabId)
                      : null;
                let r;
                switch (
                  ((r = n ? void 0 : o ? (0, O.av)(o) : (0, O.av)(e)), a)
                ) {
                  case "openintabstackwithrelated":
                  case "rightofcurrent": {
                    if ("number" != typeof e.openerTabId)
                      return r && u.ZP.isGroup(r, i)
                        ? u.ZP.getGroup(r, i).last().index + 1
                        : e.index;
                    if (o?.pinned) return u.ZP.getPinnedCount(o.windowId);
                    const t = (t) =>
                        t.id !== e.openerTabId &&
                        t.openerTabId !== e.openerTabId,
                      n = s.skipWhile(t).takeUntil(t).last();
                    return n ? n.index + 1 : e.index;
                  }
                  case "alwayslast": {
                    if (
                      r &&
                      m.Z.get(H.kTabsStackingOpenInCurrent) &&
                      u.ZP.isGroup(r, i)
                    )
                      return u.ZP.getGroup(r, i).last().index + 1;
                    const e = s.last();
                    if (e) return e.index + 1;
                  }
                }
                if (!t) return e.index;
                const l = (0, O.av)(t);
                if (r && r !== l && u.ZP.isGroup(l, t.windowId))
                  return u.ZP.getGroup(l, t.windowId).last().index + 1;
                return t.pinned ? u.ZP.getPinnedCount(t.windowId) : t.index + 1;
              })(t, a, n));
          }
          let p,
            g = t.pinned;
          if ("number" == typeof n && de()) {
            const t = u.ZP.getPageById(n);
            if (t) {
              const s =
                "openintabstackwithrelated" === m.Z.get(H.kTabsNewPlacement) &&
                !(0, M.isInternalUrl)(t.url) &&
                !t.pinned;
              if (s || m.Z.get(H.kTabsStackingOpenInCurrent)) {
                let a = (0, O.av)(t);
                if ((!a && s && ((a = u.ZP.getNewGroupId()), (p = n)), a)) {
                  g = u.ZP.isPinnedGroup(a, i);
                  if (s || u.ZP.getGroup(a, t.windowId).size > 1) {
                    (r.group = a),
                      (0, O.XN)(t) && (r.fixedGroupTitle = (0, O.XN)(t));
                    const n = (0, O.nI)(t);
                    n && (r.groupColor = n);
                    const { tiling: o } = t.vivExtData;
                    if (o && !s && !e.vivExtData?.includes("tiling")) {
                      const e = u.ZP.getTiles(i, o.id);
                      r.tiling = {
                        ...o,
                        index: e.size,
                      };
                    }
                  }
                }
              }
            }
          }
          if (f.ZP.getIsLoading()) {
            if (
              t.vivExtData?.group &&
              ((r.group = f.ZP.getLoadGroup(i, t.vivExtData.group)),
              !(0, O.XN)(t))
            ) {
              const e = f.ZP.getLoadGroupNameMap();
              if (e.size && r.group) {
                const t = e.get(r.group);
                t && (r.fixedGroupTitle = t.name.substring(0, 50));
              }
            }
            if (f.ZP.getLoadPersistentTabs())
              r.workspaceId = t.vivExtData?.workspaceId;
            else if (f.ZP.getLoadWorkspaceAsTabs()) r.workspaceId = void 0;
            else {
              let e = m.Z.get(H.kWorkspacesEnabled) ? (0, O.cm)(t) : void 0;
              if (void 0 !== e) {
                const t = f.ZP.getLoadWorkspaceId(e);
                if (void 0 !== t && !T.Z.getWorkspaceById(t)) {
                  const n = f.ZP.getWorkspace(e);
                  A.Z.addWorkspaceWithId(
                    t,
                    v.Z.getLoadingWorkspaceName(e),
                    n?.icon ?? "",
                    n?.emoji.length ? n?.emoji : void 0
                  );
                }
                e = t;
              }
              r.workspaceId = e ?? o;
            }
          } else
            b.Z.getIsLoading() &&
              t.vivExtData?.workspaceId &&
              (0, L.LS)(t.vivExtData?.workspaceId),
              x.ZP.initializingWindowId === i ||
              x.ZP.isPopulatingEmptyWorkspace ||
              f.ZP.inSessionRecovery() ||
              b.Z.getIsLoading()
                ? (r.workspaceId = (0, O.cm)(t))
                : (r.workspaceId = o);
          r.hasOwnProperty("workspaceId") &&
            void 0 === r.workspaceId &&
            delete r.workspaceId,
            (t.vivExtData = (0, D.TS)(t.vivExtData, r)),
            l.Z.dispatch({
              actionType: "CHROME_TABS_CREATE",
              page: t,
              tabActivationHistory: c,
              deactivatePageId: t.active ? a?.id : void 0,
              windowId: i,
              openerMissingGroupId: p,
            });
          const y = Promise.all([
            (0, $.V)(t.id, r),
            p &&
              (0, $.V)(p, {
                group: r.group,
              }),
            _.Z.windows.update(i, {
              focused: !0,
              drawAttention: !0,
            }),
            d !== t.index &&
              _.Z.tabs.move([t.id], {
                index: t.index,
              }),
            g !== t.pinned &&
              _.Z.tabs.update(t.id, {
                pinned: g,
              }),
          ]).catch((e) => {
            console.warn("handleChromeTabsCreated:", e);
          });
          ce = ce.then(() => y);
        }

        function he(e) {
          const t = e.windowId;
          if (S.Z.findPanelByTabId(e.tabId)) {
            const n = u.ZP.getPageHistory(t);
            if (n.length > 1) {
              const i = n[n.length - 1],
                s = u.ZP.getPageInWindow(t, i);
              s && (e.tabId = s.id);
            }
          }
          l.Z.dispatch({
            actionType: "PAGE_OPEN",
            pageId: e.tabId,
            windowId: t,
            activatedByChrome: !0,
            selectGroup: !0,
          });
        }

        function pe(e, t, n) {
          if (void 0 !== n.parentTabId) return;
          let i = e.get(t);
          if (!i) return;
          e.delete(t);
          const s = n.newWindowId;
          i = {
            ...i,
            index: n.newPosition,
            windowId: s,
            active: !1,
          };
          const a = [...u.ZP.getPageHistory(s)];
          i.active ? (0, z.AL)(a, i.id) : (0, z.EQ)(a, i.id),
            l.Z.dispatch({
              actionType: "CHROME_TABS_CREATE",
              page: i,
              tabActivationHistory: a,
              deactivatePageId: i.active ? u.ZP.getActivePage(s)?.id : void 0,
              windowId: s,
            });
        }

        function ge(e, t, n) {
          if (void 0 !== n.parentTabId) return;
          const i = n.oldWindowId,
            s = u.ZP.getPageInWindow(i, t);
          if (s)
            e.set(t, s),
              l.Z.dispatch({
                actionType: "CHROME_TABS_REMOVED",
                tabId: t,
                removeInfo: {
                  isWindowClosing: !1,
                  windowId: i,
                },
              });
          else {
            const e = n.parentTabId ? n.parentTabId : "n/a";
            console.error(
              `Expected to find page ${t} in window ${i}; parent=${e}`
            );
          }
        }

        function me(e, t) {
          const n = t.windowId;
          l.Z.dispatch({
            actionType: "CHROME_TABS_MOVED",
            tabId: e,
            windowId: n,
            index: t.toIndex,
          });
        }

        function fe() {
          _.Z.tabs.onReplaced.addListener(le),
            _.Z.tabs.onCreated.addListener(ue),
            _.Z.tabs.onUpdated.addListener(te),
            _.Z.tabs.onRemoved.addListener(re),
            _.Z.tabs.onMoved.addListener(me),
            _.Z.tabs.onActivated.addListener(he);
          const e = new Map();
          _.Z.tabs.onDetached.addListener(ge.bind(null, e)),
            _.Z.tabs.onAttached.addListener(pe.bind(null, e));
        }
        async function ve(e, t, n) {
          l.Z.dispatch({
            actionType: "UNLOAD_DIALOG_CLOSED",
            windowId: e,
            tabId: t,
            proceed: n,
          }),
            n ||
              ((xe = (0, R.M)()),
              void 0 !== u.ZP.replacementTab?.id &&
                (await _.Z.tabs.remove(u.ZP.replacementTab.id),
                (u.ZP.replacementTab = void 0)));
        }
        async function be() {
          const e = m.Z.get(H.kTabsStackingNameMap) || {};
          if (Object.keys(e).length) {
            (await _.Z.tabs.query({})).forEach(async (t) => {
              const n = s.ZP.tabToPage(t);
              if (n.vivExtData.group) {
                const t = e[n.vivExtData.group];
                void 0 !== t &&
                  (await (0, $.V)(n.id, {
                    fixedGroupTitle: t.substring(0, 50),
                  }));
              }
            }),
              g.Z.set(H.kTabsStackingNameMap, {});
          }
        }
        async function ye(e, t, n) {
          const i = n ? n.substring(0, 50) : void 0,
            s = u.ZP.getPages(e).filter((e) => (0, O.av)(e) === t);
          await Promise.all(
            s.map(({ id: e }) =>
              (0, $.V)(e, {
                fixedGroupTitle: i,
              })
            )
          );
        }

        function Se(e, t, n = !0) {
          l.Z.dispatch({
            actionType: "PAGE_OPEN",
            pageId: e,
            windowId: t,
            selectGroup: n,
          });
        }

        function Ce(e) {
          l.Z.dispatch({
            actionType: "PAGE_MINIMIZE",
            windowId: e,
            workspaceId: T.Z.getActiveWorkspaceId(e),
          });
        }
        let we = !1;
        let xe = (0, R.M)();
        async function Ae(e, t) {
          const n = e.first().windowId,
            i = e.map((e) => e.id),
            s = new Set(e.map(O.av).filter(Boolean)),
            a = new Set(e.map(O.jA).filter(Boolean));
          t
            ? e.forEach((e) => {
                if (e.vivExtData?.parentFollowerTabExtId) {
                  const t = u.ZP.getPageByReloadId(
                    e.vivExtData.parentFollowerTabExtId
                  );
                  t?.id &&
                    (N.Z.tabsPrivate.update(t.id, {}),
                    Be.setExtDataFollowerTab(t.id, ""));
                }
                if (e.vivExtData?.followerTabExtId) {
                  const t = u.ZP.getPageByReloadId(
                    e.vivExtData?.followerTabExtId
                  );
                  t?.id && Be.setParentExtDataFollowerTab(t.id, "");
                }
              })
            : await Promise.all(
                e.map((e) =>
                  (0, $.V)(e.id, {
                    fixedGroupTitle: void 0,
                    groupColor: void 0,
                    group: void 0,
                    tiling: void 0,
                  })
                )
              ),
            await Promise.all(
              s.values().map((e) => {
                const t = u.ZP.getPages(n).filter(
                  (t) => (0, O.av)(t) === e && !i.includes(t.id)
                );
                if (1 === t.size)
                  return (0, $.V)(t.first().id, {
                    fixedGroupTitle: void 0,
                    groupColor: void 0,
                    group: void 0,
                  });
              })
            ),
            await Promise.all(
              a.values().map((e) => {
                const t = u.ZP.getPages(n).filter(
                  (t) => (0, O.jA)(t) === e && !i.includes(t.id)
                );
                return 1 === t.size
                  ? (0, $.V)(t.first().id, {
                      tiling: void 0,
                    })
                  : (async function (e, t) {
                      const n = u.ZP.getTiles(e, t);
                      let i = 0;
                      for (const e of n) {
                        const t = e.vivExtData.tiling;
                        t &&
                          (await (0, $.V)(e.id, {
                            tiling: {
                              ...t,
                              index: i++,
                            },
                          }));
                      }
                    })(n, e);
              })
            );
        }
        async function Te(e, t) {
          const { bypassConfirm: n = !1, forceClosePinned: i = !1 } = t ?? {},
            s = ke(e) ? e : D.aV.of(e);
          if (0 === s.size) return;
          const a = i ? "on" : m.Z.get(H.kTabsClosePinned),
            o = s.first().windowId,
            c = (function (e, t, n) {
              const i = u.ZP.getPages(t);
              if (1 === i.size && !u.ZP.canClosePage(i.first()))
                return (0, D.aV)([]);
              let s = e;
              if ("off" === n || "bury" === n) {
                const t = m.Z.get(H.kTabsClosePinnedInStack);
                s = e.filter((e) => !e.pinned || ((0, O.av)(e) && t));
              }
              return s;
            })(s, o, a);
          if (
            !n &&
            m.Z.get(H.kTabsConfirmClosingTabs) &&
            c.size >= m.Z.get(H.kTabsConfirmClosingThreshold)
          )
            return void r.Z.showConfirmCloseOtherTabsDialog(o, {
              pages: s,
            });
          l.Z.dispatch({
            actionType: "PAGE_CLOSE",
            windowId: o,
            pages: c,
          });
          s.some((e) => e.pinned && e.active) && "bury" === a && Ce(o);
          let d = !1,
            h = !1;
          for (const [e, t] of c.groupBy(O.cm)) {
            if (
              t.size ===
                u.ZP.getPages(o, {
                  workspaceId: e,
                }).size &&
              ((h = void 0 === e && !m.Z.get(H.kTabsNeverCloseLast)),
              (d = void 0 !== e && !m.Z.get(H.kTabsNeverCloseLast)),
              m.Z.get(H.kTabsNeverCloseLast) && !u.ZP.replacementTab)
            ) {
              x.ZP.isPopulatingEmptyWorkspace = !0;
              const t = await _.Z.tabs.create({
                url: u.ZP.getDefaultStartpage(o),
                active: !1,
                transition: N.Z.historyPrivate.TransitionType.AUTO_TOPLEVEL,
                windowId: o,
                vivExtData: JSON.stringify({
                  workspaceId: e,
                }),
              });
              (x.ZP.isPopulatingEmptyWorkspace = !1), (u.ZP.replacementTab = t);
            }
          }
          const p = c.map((e) => e.id).toArray(),
            g = u.ZP.replacementTab ? void 0 : ne(s);
          g && Be.activateTab(g, o), await Ae(s, !0), await _.Z.tabs.remove(p);
          const f = u.ZP.replacementTab?.id;
          u.ZP.replacementTab = void 0;
          const v = s.get(0);
          await (async function (e, t) {
            u.ZP.getPageInWindow(e.windowId, e.id) &&
              (await new Promise((n) => {
                const i = setTimeout(a, t);
                u.ZP.addListener(o, (t) => t.get(e.windowId));
                let s = !1;

                function a() {
                  s || (n(), (s = !0), u.ZP.removeListener(o), clearTimeout(i));
                }

                function o() {
                  u.ZP.getPageInWindow(e.windowId, e.id) || a();
                }
              }));
          })(v, 100),
            void 0 !== f
              ? await _.Z.tabs.update(f, {
                  active: !0,
                })
              : g && u.ZP.getActivePage(o)?.id !== g && Be.activateTab(g, o),
            d && Pe(o, void 0),
            h && (await w.Z.close(o));
        }

        function _e(e, t) {
          const { windowId: n } = e,
            i = T.Z.getActiveWorkspaceId(n),
            s = (0, O.av)(e);
          let a = u.ZP.getPages(n).filter(
            (e) => (0, O.cm)(e) === i && !e.pinned
          );
          return (
            (a = t
              ? a
                  .skipUntil((e) => (0, O.av)(e) === s)
                  .takeUntil((t) => t.id === e.id)
              : u.ZP.isGroup((0, O.av)(e), e.windowId)
              ? a
                  .takeUntil((t) => t.id === e.id)
                  .filter((e) => (0, O.av)(e) !== s)
              : a.takeUntil((t) => t.id === e.id)),
            a
          );
        }

        function Ee(e, t) {
          const { windowId: n } = e,
            i = T.Z.getActiveWorkspaceId(n),
            s = (0, O.av)(e);
          let a = u.ZP.getPages(n, {
            workspaceId: i,
          })
            .skipUntil((t) => t.id === e.id)
            .skip(1);
          return (
            t
              ? (a = a.takeUntil((e) => (0, O.av)(e) !== s))
              : u.ZP.isGroup((0, O.av)(e), e.windowId) &&
                (a = a.filter((e) => (0, O.av)(e) !== s)),
            a
          );
        }
        async function Ie(e, t, n, i) {
          if (0 !== X) return;
          let s;
          if ("other" === t) {
            const t = u.ZP.getActivePage(e);
            if (!t) return;
            s = u.ZP.getPages(e).filter((e) => e.id !== t.id);
          } else if ("all" === t) s = u.ZP.getPages(e);
          else if (i && "selection" === t) s = i;
          else {
            const t = u.ZP.getActivePage(e);
            if (!t) return;
            s = D.aV.of(t);
          }
          await Promise.all(
            s.map(async (e) => {
              X++;
              try {
                await N.Z.tabsPrivate.update(e.id, {
                  muteTab: "mute" === n,
                });
              } finally {
                X--;
              }
            })
          );
        }

        function ke(e) {
          return e instanceof D.aV;
        }
        async function Ze(e, t, n) {
          if (ke(t)) {
            const i = t;
            let s = i.some((e) => e.index < n) ? n + 1 : n,
              a = !1;
            for (let t = 0; t < i.size; t += 1) {
              const o = i.get(t);
              if (!o) break;
              e !== o.windowId
                ? await _.Z.tabs.move(o.id, {
                    index: n + t,
                    windowId: e,
                  })
                : (0 === t && s > o.index
                    ? s--
                    : t > 0 && (s < o.index || a) && (s++, (a = !0)),
                  o.index !== s &&
                    (await _.Z.tabs.move(o.id, {
                      index: s,
                      windowId: e,
                    })));
            }
          } else {
            const i = t;
            await _.Z.tabs.move(i.id, {
              windowId: e,
              index: n,
            });
          }
        }
        async function Ne(e, t, n) {
          const i = {
            updateWorkspace: !0,
            keepActiveTab: !1,
            ...n,
          };
          if (i.updateWorkspace) {
            const n = T.Z.getActiveWorkspaceId(t);
            await Promise.all(
              e.map((e) =>
                (0, $.V)(e.id, {
                  workspaceId: n,
                })
              )
            );
          }
          const s = e.first().windowId;
          e.some((e) => e.active) &&
            !(function (e, t) {
              const n = ne(e);
              return !!n && (Be.activateTab(n, t), !0);
            })(e, s) &&
            ee(s);
          const a = await _.Z.tabs.move(e.map((e) => e.id).toArray(), {
            windowId: t,
            index: -1,
          });
          if (i.keepActiveTab) Be.openLastPage(t);
          else {
            await new Promise((e) => {
              _.Z.windows.update(
                t,
                {
                  focused: !0,
                },
                e
              );
            });
            const n = e.find((e) => e.active);
            n &&
              (await _.Z.tabs.update(n.id, {
                active: !0,
              }));
          }
          return a;
        }
        async function Pe(e, t) {
          for (const [n] of u.ZP.getState())
            if ((n === e || void 0 !== t) && t === T.Z.getActiveWorkspaceId(n))
              return void w.Z.focus(n);
          let n;
          l.Z.dispatch({
            actionType: "SET_ACTIVE_WORKSPACE",
            windowId: e,
            workspaceId: t,
          });
          const i =
            void 0 === t
              ? e
              : u.ZP.findPageInAllWindows((e) => (0, O.cm)(e) === t)?.windowId;
          if (i) {
            const e = u.ZP.getState().get(i);
            if (e) {
              const { list: i, history: s } = e,
                a = i.filter((e) => (0, O.cm)(e) === t);
              for (let e = s.length - 1; e >= 0; e--) {
                const t = s[e];
                if (((n = a.find((e) => e.id === t)), n)) break;
              }
              n || (n = a.first());
            }
          }
          if (
            (void 0 !== t &&
              (await (async function (e, t) {
                const n = u.ZP.getWorkspacePages(t),
                  i = n.find((e) => (0, M.isMailBasePage)(e.url)),
                  s = i ? n.filter((e) => e !== i) : n;
                i && i.windowId !== e && (await Te(i));
                if (s.size > 0 && s.some((t) => t.windowId !== e))
                  return Ne(s, e, {
                    updateWorkspace: !1,
                  });
                return Promise.resolve();
              })(e, t)),
            n)
          )
            Se(n.id, e);
          else {
            const n = {
              url: u.ZP.getDefaultStartpage(e),
              windowId: e,
              index: 0,
              active: !0,
              vivExtData: JSON.stringify({
                workspaceId: t,
              }),
            };
            (x.ZP.isPopulatingEmptyWorkspace = !0),
              await _.Z.tabs.create(n),
              (x.ZP.isPopulatingEmptyWorkspace = !1);
          }
        }
        async function Me(e, t, n = !1) {
          const i = ke(e) ? e : D.aV.of(e),
            s = i.first().windowId,
            a = T.Z.getActiveWorkspaceId(s);
          let o = s;
          const r = i
            .groupBy(O.av)
            .map((e, t) =>
              void 0 === t || u.ZP.getGroup(t, s).size === e.size
                ? (0, D.aV)()
                : e
            )
            .flatten()
            .toList();
          if (
            (await Oe(r),
            t && ((o = u.ZP.getWorkspaceWindowId(t) ?? s), o !== s))
          )
            return await Pe(o, t), void (await Ne(i, o));
          const l =
              (u.ZP.getPages(o, {
                workspaceId: t,
              })
                .map((e) => e.index)
                .max() ?? -1) + 1,
            c = {
              workspaceId: t,
            };
          if (
            (await Promise.all(i.map((e) => (0, $.V)(e.id, c))),
            n || (await Be.moveToIndex(o, i, l)),
            0 ===
              u.ZP.getPages(s, {
                workspaceId: a,
              }).size)
          ) {
            const { pageId: e } = await Be.openURL(s, "", {
              inBackground: !0,
            });
            Be.activateTab(e, s);
          }
        }
        async function De(e, t = {}) {
          if (!de()) return "";
          const { index: n, groupId: i, showStackEditor: s = !0 } = t,
            o = e.count((e) => e.pinned);
          if (o > 0 && o < e.size)
            return (
              console.warn(
                "Can't group a combination of pinned and unpinned pages."
              ),
              ""
            );
          const r = e.find(O.av),
            c = r ? (0, O.av)(r) : "",
            d = i || c || u.ZP.getNewGroupId(),
            h = r && d === c ? (0, O.XN)(r) : void 0,
            p = r && d === c ? (0, O.nI)(r) : void 0;
          await Promise.allSettled(
            e
              .filter((e) => (0, O.av)(e) !== d)
              .map(({ id: e }) =>
                (0, $.V)(e, {
                  group: d,
                  fixedGroupTitle: h,
                  groupColor: p,
                })
              )
          );
          const g = "number" == typeof n ? n : e.first().index,
            f = e.first().windowId;
          return (
            await Ze(f, e, g),
            !c &&
              s &&
              m.Z.get(H.kTabsStackingAutoEditor) &&
              setTimeout(() => {
                a.Z.executeActions(
                  "event",
                  (0, E.Z)(f),
                  "COMMAND_RENAME_TAB_STACK"
                );
              }, 200),
            l.Z.dispatch({
              actionType: "PAGE_TABSTACK_CREATE",
              windowId: f,
              pages: e,
            }),
            d
          );
        }
        async function Oe(e) {
          const t = ke(e) ? e : D.aV.of(e);
          if (t.isEmpty()) return;
          const n = t.first().windowId;
          l.Z.dispatch({
            actionType: "PAGE_TABSTACK_REMOVE_FROM",
            windowId: n,
            pages: t,
          }),
            await Ae(t, !1);
          const i = u.ZP.getPages(n).last().index + 1;
          await Be.moveToIndex(n, t, i);
        }

        function Le(e, t = (0, D.aV)()) {
          const n = function (n) {
            const { clipboardData: i } = n;
            if (!i) return;
            const s = e
              .map((e) => M.urls.getHoverUrl(e.url))
              .concat(t)
              .join("\n");
            i.setData("text/plain", s),
              i.setData("text/uri-list", s),
              n.preventDefault();
          };
          document.addEventListener("copy", n),
            document.execCommand("copy"),
            document.removeEventListener("copy", n);
        }
        async function je(e, t, n) {
          const i = t.find((e) => (0, M.isMailBasePage)(e.url));
          if (i) {
            const s = i.vivExtData.group
              ? t.filter((e) => e.vivExtData.group === i.vivExtData.group)
              : [i];
            if (n)
              await Promise.all(
                s.map((e) =>
                  (0, $.V)(e.id, {
                    workspaceId: void 0,
                  })
                )
              );
            else {
              const t = T.Z.getActiveWorkspaceId(e);
              await Promise.all(
                s.map((e) =>
                  (0, $.V)(e.id, {
                    workspaceId: t,
                  })
                )
              );
            }
          }
          await Promise.all(
            t.map((e) =>
              _.Z.tabs.update(e.id, {
                pinned: n,
              })
            )
          );
        }
        async function Re(e, t) {
          let n, i;
          "always" === t
            ? ((n = !0), (i = !1))
            : "cache" === t
            ? ((n = !0), (i = !0))
            : "never" === t && ((n = !1), (i = !1)),
            await N.Z.tabsPrivate.update(e.id, {
              showImages: n,
              loadFromCacheOnly: i,
            }),
            g.Z.set(H.kPageImageLoading, t);
        }

        function Fe(e) {
          l.Z.dispatch({
            actionType: "PAGE_SELECTION_CLEAR",
            windowId: e,
          });
        }
        const Be = {
            clear: function () {
              l.Z.dispatch({
                actionType: "PAGE_CLEAR",
              });
            },
            clearSelection: Fe,
            clonePages: async function (e) {
              if (we) return [];
              we = !0;
              const t = [];
              try {
                const n = e
                  .sort((e, t) => e.index - t.index)
                  .filter((e) => !(0, M.isSingletonPage)(e));
                let i = -1;
                for (const e of n) {
                  i++;
                  const n = e.index,
                    a = await _.Z.tabs.duplicate(e.id);
                  if (!a) continue;
                  const o = a.id;
                  if (!o) continue;
                  "alwayslast" === m.Z.get(H.kTabsActivationOnClone)
                    ? await _.Z.tabs.move(o, {
                        index: -1,
                      })
                    : await _.Z.tabs.move(o, {
                        index: n + 1 + i,
                      });
                  const r = (0, O.av)(e);
                  if (r && u.ZP.getGroup(r, e.windowId).size > 1) {
                    const t = s.ZP.tabToPage(a);
                    await De((0, D.aV)([e, t]));
                  }
                  t.push(o);
                }
              } finally {
                we = !1;
              }
              return t;
            },
            close: async function (e) {
              const t = await xe();
              try {
                if (x.ZP.isTabbedBrowser(e)) {
                  const t = u.ZP.getSelectionOrActivePage(e);
                  await Be.closePage(t);
                } else await w.Z.close(e);
              } finally {
                t();
              }
            },
            closeOther: function (e, t, n) {
              const i = ke(e) ? e : D.aV.of(e),
                s = i.first().windowId;
              let a;
              if (n) {
                const e = i.flatMap((e) =>
                  (u.ZP.isGroup((0, O.av)(e), e.windowId)
                    ? u.ZP.getGroup((0, O.av)(e), e.windowId)
                    : D.aV.of(e)
                  ).map((e) => e.id)
                );
                a = u.ZP.getPages(s, {
                  workspaceId: t,
                })
                  .filter((e) => !e.pinned)
                  .filter((t) => !e.includes(t.id));
              } else {
                const e = i.map(O.av).toSet();
                a =
                  1 === e.size && void 0 !== e.first()
                    ? u.ZP.getPages(s, {
                        workspaceId: t,
                      })
                        .filter((t) => (0, O.av)(t) === e.first())
                        .filter((e) => !i.some((t) => t.id === e.id))
                    : u.ZP.getPages(s, {
                        workspaceId: t,
                      })
                        .filter((e) => !e.pinned)
                        .filter((e) => !i.some((t) => t.id === e.id));
              }
              return Te(a);
            },
            closePage: Te,
            closePageById: async function (e) {
              const t = u.ZP.getPageById(e);
              t && (await Te(t));
            },
            closeTabStack: async function (e) {
              const t = u.ZP.getPageById(e);
              if (!t) return;
              const n = (0, O.av)(t);
              Te(u.ZP.getGroup(n, t.windowId));
            },
            closeToLeft: async function (e, t) {
              const n = _e(e, t);
              if (!n.isEmpty()) return Te(n);
            },
            closeToRight: async function (e, t) {
              const n = Ee(e, t);
              if (!n.isEmpty()) return Te(n);
            },
            closeUrl: function (e, t) {
              Te(u.ZP.getPages(e).filter((e) => (0, U.uu)(t, e.url)));
            },
            closeDuplicateTabs: function (e) {
              const t = x.ZP.getActiveWindowId(),
                n = Array.isArray(e) ? e : [e];
              let i = (0, D.aV)();
              for (const e of n) {
                let n = (0, D.aV)();
                for (const [i, s] of u.ZP.getState()) {
                  const a = new Map(
                      s.list
                        .filter((t) => t.url === e)
                        .map((e) => [e.id, e])
                        .toArray()
                    ),
                    o = s.history.reduce((e, t) => {
                      const n = a.get(t);
                      return n ? e.push(n) : e;
                    }, (0, D.aV)());
                  n = i === t ? o.concat(n) : n.concat(o);
                }
                i = i.concat(n.rest());
              }
              Be.closePage(i);
            },
            copyUrls: Le,
            copyAllUrls: function (e, t) {
              Le(
                u.ZP.getPages(e, {
                  workspaceId: t,
                })
              );
            },
            createStackFromActiveTab: async function (e) {
              if (!de()) return;
              const t = u.ZP.getSelectedPages(e);
              if (t.size > 1) return Be.createTabStack(t);
              const n = T.Z.getActiveWorkspaceId(e),
                i = u.ZP.getPages(e, {
                  workspaceId: n,
                }).filter((e) => !e.pinned && !(0, O.av)(e));
              if (i.size > 1) {
                const [t, s] = (0, W.d)(
                  u.ZP.unsafeGetActivePage(e),
                  u.ZP.getWorkspaceTabsInWindow(e, n, !1)
                );
                if (s.size > 1) {
                  const n = u.ZP.getNewGroupId();
                  return (
                    await ye(e, n, t),
                    Be.createTabStack(s, {
                      groupId: n,
                    })
                  );
                }
                return Be.createTabStack(i);
              }
            },
            createTabStack: De,
            createGroupByHost: async function (e, t, n) {
              const i = u.ZP.getGroupsForHosts(e, t).get(n);
              if (i) {
                const t = u.ZP.getNewGroupId();
                return (
                  await Be.createTabStack(i, {
                    groupId: t,
                  }),
                  await ye(e, t, n),
                  t
                );
              }
            },
            createGroupByHosts: function (e, t) {
              u.ZP.getGroupsForHosts(e, t).forEach(async (t, n) => {
                const i = u.ZP.getNewGroupId();
                await Be.createTabStack(t, {
                  groupId: i,
                }),
                  await ye(e, i, n);
              });
            },
            cycleByHistory: function (e, t, n = !1) {
              const i = (0, E.Z)(e),
                s = t instanceof i.WheelEvent && t.buttons === Z.Z.kRight,
                a = (0, k.Z)(t) || s;
              if (a) {
                const n = () => {
                  l.Z.dispatch({
                    actionType: "PAGE_CYCLE_HISTORY_MODIFIER_UP",
                    windowId: e,
                    workspaceId: T.Z.getActiveWorkspaceId(e),
                  });
                };
                s && t instanceof i.WheelEvent
                  ? (0, K.g)(t, n, i.document)
                  : (0, G.Kz)(t, n);
              }
              l.Z.dispatch({
                actionType: "PAGE_SET_CYCLE_BY_HISTORY",
                windowId: e,
                goBack: n,
                activateEventModifierUp: a,
                workspaceId: T.Z.getActiveWorkspaceId(e),
              });
            },
            cycleByOrder: function (e, t, n = !1) {
              const i = T.Z.getActiveWorkspaceId(e),
                s = u.ZP.getCyclePageByOrder(e, i, n);
              s && Se(s, e);
            },
            detachPage: async function (e, t, n) {
              const i = ke(e) ? e : D.aV.of(e),
                s = i.first().windowId,
                a = i.map((e) => e.id),
                o = (0, I.Z)(s).find((e) => !a.includes(e.id));
              o && Se(o.id, s),
                1 === i.size && (await Oe(i)),
                await Me(i, void 0, !0);
              const r = i.first(),
                l = i.rest(),
                c = (
                  await w.Z.openBrowserWindow(s, [], {
                    tabId: r.id,
                    left: t,
                    top: n,
                    incognito: x.ZP.isIncognitoOrGuest(s),
                  })
                )?.id;
              "number" == typeof c && l.count() && (await Ne(l, c));
            },
            detachWorkspace: async function (e, t) {
              const n = u.ZP.getWorkspacePages(t).first(),
                i = await w.Z.openBrowserWindow(n ? n.windowId : e, []);
              i?.id && (await Pe(i.id, t));
            },
            discardPage: function (e) {
              e.isInspected || _.Z.tabs.discard(e.id);
            },
            exitPictureInPicture: function (e) {
              _.Z.scripting
                .executeScript({
                  target: {
                    tabId: e,
                  },
                  function: () => {
                    document.pictureInPictureElement &&
                      document.exitPictureInPicture();
                  },
                })
                .catch((e) => {});
            },
            expandSelectionNext: function (e) {
              l.Z.dispatch({
                actionType: "PAGE_SELECTION_EXPAND_NEXT",
                page: e,
              });
            },
            expandSelectionPrevious: function (e) {
              l.Z.dispatch({
                actionType: "PAGE_SELECTION_EXPAND_PREVIOUS",
                page: e,
              });
            },
            expandTabStack: async function (e, t) {
              const n = u.ZP.getPages(e).filter((e) => (0, O.av)(e) === t);
              await Promise.all(
                n.map((e) =>
                  (0, $.V)(e.id, {
                    group: void 0,
                    fixedGroupTitle: void 0,
                    groupColor: void 0,
                  })
                )
              );
            },
            getTabsToTheLeft: _e,
            getTabsToTheRight: Ee,
            gotoParentDirectory: function (e, t) {
              const { url: n } = t,
                i = n.lastIndexOf("/");
              if (-1 === i) return;
              let s;
              if (i + 1 === n.length) {
                const e = n.substr(0, n.length - 1).lastIndexOf("/");
                -1 !== e && (s = n.substr(0, e + 1));
              } else s = n.substr(0, i + 1);
              s &&
                !s.endsWith("://") &&
                Be.openURL(e, s, {
                  inSpecificPageId: t.id,
                });
            },
            load: function () {
              fe(),
                (function () {
                  const { tabsPrivate: e } = N.Z;
                  e.onMediaStateChanged.addListener(ie),
                    e.onPermissionAccessed.addListener(se),
                    e.onTabUpdated.addListener(ae),
                    e.onBeforeUnloadDialogClosed.addListener(ve);
                })(),
                (function () {
                  const { windowPrivate: e } = N.Z;
                  e.onBeforeUnloadDialogOpened.addListener(oe);
                })(),
                m.Z.addListener(H.kTabsSelectionIncludeActive, Fe),
                Q(),
                (async function () {
                  const e = x.ZP.getLastActiveBrowserWindowId();
                  if (e !== x.Ex && !x.ZP.isIncognitoOrGuest(e))
                    N.Z.utilities.showAdditionalStartupPages().then((t) => {
                      t.forEach((t) => {
                        ee(e, t);
                      });
                    });
                })();
              const e = m.Z.get(H.kTabsStackingNameMap) || {};
              Object.keys(e).length && setTimeout(be, 3e4);
            },
            minimizePage: Ce,
            moveDroppedTabs: async function (e, t, n, i, s) {
              const a = T.Z.getActiveWorkspaceId(e);
              let o;
              if (s) {
                const t = u.ZP.getGroup(s, e).first(),
                  n = t ? (0, O.XN)(t) : void 0,
                  i = t ? (0, O.nI)(t) : void 0;
                o = {
                  group: s,
                  workspaceId: a,
                  fixedGroupTitle: n,
                  groupColor: i,
                };
              } else
                o = {
                  group: void 0,
                  workspaceId: a,
                  fixedGroupTitle: void 0,
                  groupColor: void 0,
                };
              t.map((e) => (0, $.V)(e.id, o)),
                await Ze(e, t, i),
                (n ? t.find((e) => e.id === parseInt(n)) : t.first()) &&
                  Se(n, e),
                await new Promise((e) => setTimeout(e, 100)),
                je(
                  e,
                  t.filter((e) => e.pinned),
                  !0
                );
            },
            moveToIndex: Ze,
            moveToWindow: Ne,
            moveSelectionToWorkspace: function (e, t) {
              const n = t > 0 ? T.Z.getWorkspaces()[t - 1]?.id : void 0;
              if (void 0 === n && 0 !== t)
                return void console.warn(
                  `Workspace number ${t} does not exist.`
                );
              Me(u.ZP.getSelectionOrActivePage(e).filter(Boolean), n);
            },
            muteAllExcept: function (e, t) {
              Ie(
                e,
                "selection",
                "mute",
                u.ZP.getPages(e).filter(
                  (e) => -1 === t.findIndex((t) => t.id === e.id)
                )
              );
            },
            pastePages: async function (e, t, n, i) {
              if (we) return [];
              const s = n.sort((e, t) => e.index - t.index),
                a = e.index + ("after" === t ? 1 : 0),
                o = (0, O.av)(e),
                r = (0, O.cm)(e),
                l = u.ZP.getPages(e.windowId).find(
                  (e) => (0, O.av)(e) === o && Boolean(e.vivExtData.tiling)
                )?.vivExtData.tiling;
              if (i) {
                const t = e.index < s.first().index ? 1 : 0;
                return (
                  await Be.setPinned(e.windowId, s, e.pinned),
                  s.forEach(async (e) => {
                    await (0, $.V)(e.id, {
                      group: o,
                      workspaceId: r,
                      tiling: l,
                    });
                  }),
                  await Be.moveToIndex(e.windowId, s, e.index + t),
                  []
                );
              }
              {
                we = !0;
                let t = [];
                try {
                  const n = s.map((e) => e.id);
                  t = await N.Z.tabsPrivate.clone(
                    n.toArray(),
                    e.windowId,
                    a,
                    e.pinned
                  );
                } catch (e) {
                  console.warn(e);
                } finally {
                  const n = t.at(t.length - 1)?.id;
                  n &&
                    (await (0, $.V)(n, {
                      group: o,
                      workspaceId: r,
                      tiling: l,
                    }),
                    Be.activateTab(n, e.windowId)),
                    (we = !1);
                }
                return t.map((e) => e.id);
              }
            },
            pinTabStack: async function (e, t) {
              const n = u.ZP.getGroup(e, t);
              await je(t, n, !0);
            },
            newTab: async function (
              e,
              t,
              n = {
                index: void 0,
                workspaceId: void 0,
                groupId: void 0,
                ignoreLinkRouting: void 0,
              }
            ) {
              const i = n.index,
                s = n.workspaceId,
                a = n.groupId ?? void 0,
                o = (0, M.getUrl)(t),
                r = o && "_blank" !== o ? o : u.ZP.getDefaultStartpage(e),
                c = {
                  url: r,
                  windowId: e,
                  index: i,
                  active: !0,
                  ignoreLinkRouting: n.ignoreLinkRouting,
                  vivExtData: JSON.stringify({
                    workspaceId: s,
                    group: a,
                  }),
                  pinned: u.ZP.isPinnedGroup(a, e),
                };
              m.Z.get(H.kWorkspacesEnabled) && (await Pe(e, s));
              const d = await _.Z.tabs.create(c);
              if (void 0 !== d?.id) {
                const t = d.id;
                return (
                  l.Z.dispatch({
                    actionType: "PAGE_OPEN_URL",
                    pageId: t,
                    windowId: e,
                    url: r,
                    postParams: void 0,
                  }),
                  t
                );
              }
              throw new Error("Failed to create tab");
            },
            openLastPage: function (e) {
              const t = T.Z.getActiveWorkspaceId(e),
                n = !de(),
                i = u.ZP.getWorkspaceTabsInWindow(e, t, n).last();
              i && Se(i.page.id, e);
            },
            activateTab: Se,
            activateTabByIndex: function (e, t) {
              const n = T.Z.getActiveWorkspaceId(e),
                i = !de(),
                s = u.ZP.getWorkspaceTabsInWindow(e, n, i).get(t);
              if (!s) return;
              const a = "group" === s.type ? s.pages : (0, D.aV)();
              if (!(a.size > 0) || !s.page.active)
                return void Se(s.page.id, s.page.windowId);
              if (a.last() === s.page) return void Se(a.first().id, e);
              const o = a.findIndex((e) => e.active) + 1,
                r = a.get(o)?.id;
              r && Se(r, e);
            },
            openURL: ee,
            openUrls: async function (e, t, n) {
              n.inNewWindow
                ? await w.Z.openBrowserWindow(e, t, {
                    incognito: n.incognito,
                  })
                : await Promise.all(
                    t.map((i, s) =>
                      n.inCurrent
                        ? Be.openURL(e, i, {
                            ...n,
                            inCurrent: 0 === s,
                            inBackground: 0 !== s,
                          })
                        : Be.openURL(e, i, {
                            ...n,
                            inBackground: n.inBackground || i !== (0, B.Z)(t),
                          })
                    )
                  );
            },
            reloadPage: async function (e) {
              const t = ke(e) ? e : D.aV.of(e);
              await Promise.all(t.map((e) => _.Z.tabs.reload(e)));
            },
            removeFromTabStack: Oe,
            closeWorkspaceTabs: function (e) {
              const t = u.ZP.getWorkspacePages(e)
                .map((e) => e.id)
                .toArray();
              return _.Z.tabs.remove(t);
            },
            moveToWorkspace: Me,
            setActiveWorkspace: Pe,
            setExtDataRestrictTabToSite: async function (e, t) {
              await Promise.all(
                e.map((e) => {
                  (0, $.V)(e.id, {
                    restrictPinnedTab: t,
                  });
                })
              );
            },
            setFixedStackTitle: ye,
            setStackColor: async function (e, t, n) {
              const i = u.ZP.getPages(e).filter((e) => (0, O.av)(e) === t);
              await Promise.all(
                i.map(({ id: e }) =>
                  (0, $.V)(e, {
                    groupColor: n,
                  })
                )
              );
            },
            setFixedTitle: async function (e, t) {
              await (0, $.V)(e, {
                fixedTitle: t ? t.substring(0, 50) : void 0,
              });
            },
            setExtDataFollowerTab: async function (e, t) {
              await (0, $.V)(e, {
                followerTabExtId: t || void 0,
              });
            },
            setParentExtDataFollowerTab: async function (e, t) {
              await (0, $.V)(e, {
                parentFollowerTabExtId: t || void 0,
              });
            },
            setHistoryManagerState: async function (e, t) {
              await (0, $.V)(e, {
                historyManagerState: t,
              });
            },
            setImageInspector: function (e, t, n) {
              l.Z.dispatch({
                actionType: "PAGE_SET_IMAGE_INSPECTOR",
                pageId: e,
                windowId: t,
                showImageInspector: n,
              });
            },
            setImageLoading: Re,
            setMuting: Ie,
            setPageInspected: function (e, t, n) {
              l.Z.dispatch({
                actionType: "PAGE_SET_IS_INSPECTED",
                pageId: e,
                windowId: t,
                inspected: n,
              });
            },
            setPinned: je,
            setReaderState: async function (e, t, n) {
              const i = y.Z.isEnabled("VivaldiInternalPageReaderMode"),
                s = u.ZP.getPageInWindow(e, t);
              if (n) {
                const n = s?.url ?? "";
                i && !n.startsWith("file")
                  ? await Be.openURL(e, `reader:${n}`, {
                      inCurrent: !0,
                    })
                  : await (0, $.V)(t, {
                      readerMode: !0,
                    });
              } else
                s?.vivExtData.readerMode
                  ? await (0, $.V)(t, {
                      readerMode: !1,
                    })
                  : i && C.Z.back(e, t);
            },
            setSelection: function (e, t) {
              const {
                multiSelect: n = !1,
                addGroup: i = !0,
                excludeActive: s = !1,
              } = t ?? {};
              l.Z.dispatch({
                actionType: "PAGE_SELECTION_SET",
                page: e,
                multiSelect: n,
                addGroup: i,
                excludeActive: s,
              });
            },
            setThumbnail: async function (e, t) {
              const n = u.ZP.getPageById(e);
              n &&
                (t
                  ? await (0, $.V)(e, {
                      urlForThumbnail: n.url,
                      thumbnail: t,
                    })
                  : await (0, $.V)(e, {
                      urlForThumbnail: void 0,
                      thumbnail: void 0,
                    }));
            },
            setTitle: function (e, t, n) {
              l.Z.dispatch({
                actionType: "PAGE_SET_TITLE",
                pageId: e,
                windowId: t,
                title: n,
              });
            },
            showHomepage: async function (e, t) {
              if (t.inCurrent) {
                u.ZP.getActivePage(e) && (0, j.gR)((0, E.Z)(e));
              }
              const n = m.Z.get(H.kHomepage),
                i = u.ZP.getDefaultStartpage(e),
                s = n === P.QG && i === P.P1 ? i : n;
              await ee(e, s, t);
            },
            stepPage: async function (e, t, n, i) {
              const s = u.ZP.getStepInfo(e, t, n, i);
              if (!s) return;
              const { pages: a, index: o } = s;
              await Be.moveDroppedTabs(i, a, e.id, o, (0, O.av)(e));
            },
            stepTabsToStart: function (e) {
              J({
                toStart: !0,
                windowId: e,
              });
            },
            stepTabsToEnd: function (e) {
              J({
                toStart: !1,
                windowId: e,
              });
            },
            toggleImageLoading: async function (e) {
              const t = m.Z.get(H.kPageImageLoading);
              "always" === t
                ? await Re(e, "never")
                : "never" === t
                ? await Re(e, "cache")
                : await Re(e, "always");
            },
            toggleMuting: async function (e, t) {
              const n = t.filter((e) => {
                  const t = c.Z.hasMediaState(e.id, "muting");
                  return !e.vivExtData.vivaldi_tab_muted && !t;
                }),
                i = t.filter((e) => {
                  const t = c.Z.hasMediaState(e.id, "muting");
                  return e.vivExtData.vivaldi_tab_muted || t;
                });
              await Ie(e, "selection", "mute", n),
                await Ie(e, "selection", "unmute", i);
            },
            toggleRelatedSelection: function (e) {
              l.Z.dispatch({
                actionType: "PAGE_SELECTION_TOGGLE_RELATED",
                page: e,
              });
            },
            toggleSelectedPagesPinned: async function (e) {
              const t = u.ZP.getSelectionOrActivePage(e);
              if (!t.isEmpty())
                for (let e = 0; e < t.size; e += 1) {
                  const n = t.get(e);
                  if (!n) return;
                  const i = (0, O.av)(n),
                    s = u.ZP.getGroup(i, n.windowId),
                    a = n.pinned || s?.some((e) => e.pinned);
                  if (s.size > 1)
                    for (let e = 0; e < s.size; e += 1) {
                      const t = a ? s.size - 1 - e : e,
                        n = s.get(t);
                      n &&
                        (await _.Z.tabs.update(n.id, {
                          pinned: !a,
                        }));
                    }
                  else
                    await _.Z.tabs.update(n.id, {
                      pinned: !a,
                    });
                }
            },
            treeMove: async function ({
              windowId: e,
              pages: t,
              groups: n,
              targetArea: i,
              targetPage: s,
              targetGroup: a = "",
              targetWorkspaceId: o,
              belowTarget: r,
            }) {
              const l = u.ZP.getGroup(a, e).first(),
                c = l ? (0, O.XN)(l) : void 0,
                d = l ? (0, O.nI)(l) : void 0,
                h = new Map();
              await Promise.all(
                t.map(async (t) => {
                  const s = (0, O.av)(t);
                  switch ((s && h.set(s, t.windowId), i)) {
                    case "pinned":
                      return (
                        await (0, $.V)(t.id, {
                          group: a,
                          fixedGroupTitle: c,
                          groupColor: d,
                          tiling: void 0,
                          workspaceId: o,
                        }),
                        void (await _.Z.tabs.update(t.id, {
                          pinned: !0,
                        }))
                      );
                    case "stack": {
                      const n = u.ZP.getPages(e).find(
                        (e) =>
                          (0, O.av)(e) === a && Boolean(e.vivExtData.tiling)
                      )?.vivExtData.tiling;
                      return (
                        await (0, $.V)(t.id, {
                          group: a,
                          fixedGroupTitle: c,
                          groupColor: d,
                          tiling: n,
                          workspaceId: o,
                        }),
                        void (await _.Z.tabs.update(t.id, {
                          pinned: !1,
                        }))
                      );
                    }
                    case "regular": {
                      const e = (0, O.av)(t),
                        i = n.includes(e) ? e : void 0,
                        s = t.vivExtData.tiling;
                      return (
                        await (0, $.V)(t.id, {
                          group: i,
                          fixedGroupTitle: void 0,
                          groupColor: d,
                          tiling: i ? s : void 0,
                          workspaceId: o,
                        }),
                        void (await _.Z.tabs.update(t.id, {
                          pinned: !1,
                        }))
                      );
                    }
                  }
                })
              ),
                s &&
                  (await Be.moveToIndex(s.windowId, t, s.index + (r ? 1 : 0))),
                h.forEach((e, t) => {
                  const n = u.ZP.getGroup(t, e).toArray();
                  1 === n.length &&
                    (0, $.V)(n[0].id, {
                      group: "",
                      fixedGroupTitle: void 0,
                      groupColor: void 0,
                    });
                });
            },
            unpinTabStack: async function (e, t) {
              const n = u.ZP.getGroup(e, t);
              await je(t, n.reverse(), !1);
            },
          },
          We = Be;
      },