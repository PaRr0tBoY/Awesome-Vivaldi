48603: (e, t, n) => {
        "use strict";
        n.d(t, {
          Z: () => J,
        });
        var i = n(56688),
          s = n(31301),
          a = n(18873),
          o = n(61896),
          r = n(92292),
          l = n(7064),
          c = n(17885);
        const d = "[bookmark update]",
          u = function () {
            return new Promise((e) => {
              l.Z.bookmarksPrivate.updatePartners((t, n, i) => {
                r.Z.runtime.lastError &&
                  (console.warn(
                    d,
                    "failed to call vivaldi.bookmarksPrivate.updatePartners:",
                    r.Z.runtime.lastError.message
                  ),
                  (t = !1),
                  (n = !1)),
                  e([t, n, i]);
              });
            });
          },
          h = function (e) {
            const t = function (e, n) {
              for (let i = 0; i < e.length; i++) {
                const s = e[i];
                s.url &&
                  (s.partner
                    ? console.warn(
                        d,
                        "partner id in bookmark tree without version:",
                        s.partner,
                        s.url
                      )
                    : n.set(s.url, s.id)),
                  s.children && t(s.children, n);
              }
            };
            return Promise.all([
              new Promise((e) => {
                r.Z.bookmarks.getTree((t) => {
                  r.Z.runtime.lastError &&
                    console.warn(
                      d,
                      "failed to call chrome.bookmarks.getTree:",
                      r.Z.runtime.lastError.message
                    ),
                    e(t);
                });
              }).then((e) => {
                const n = new Map();
                return e && t(e, n), n;
              }),
              fetch("./default-bookmarks/fallback-partner-ids.json", {
                method: "GET",
              })
                .then((e) => e.json())
                .then((t) => {
                  let n = t[e];
                  return n || (n = t[o.Z.getFallbackLocale()]), n;
                }),
            ])
              .then(([e, t]) => {
                const n = {
                  numMatch: 0,
                  size: 0,
                };
                return t
                  ? Promise.all(
                      (function* (e, t, n) {
                        const i = Object.keys(t);
                        e: for (const s of i) {
                          const i = t[s];
                          n.size += 1;
                          for (const t of i) {
                            const i = e.get(t);
                            if (i) {
                              console.warn(d, "Match", s, t),
                                (n.numMatch += 1),
                                yield new Promise((e) => {
                                  r.Z.bookmarks.update(
                                    i,
                                    {
                                      partner: s,
                                    },
                                    () => {
                                      r.Z.runtime.lastError &&
                                        console.warn(
                                          d,
                                          "failed to update partner:",
                                          s,
                                          r.Z.runtime.lastError.message
                                        ),
                                        e();
                                    }
                                  );
                                });
                              continue e;
                            }
                          }
                          console.warn(d, "No match for", s, i.join(" "));
                        }
                      })(e, t, n)
                    ).then(() => n)
                  : n;
              })
              .then((e) => {
                console.warn(d, "Urls matched", e.numMatch, "of", e.size);
              });
          },
          p = {
            init: () =>
              u()
                .then(([e, t, n]) =>
                  t
                    ? h(n).then(
                        () => (
                          s.Z.set(c.kBookmarksVersion, "0"),
                          u().then(([e]) => e)
                        )
                      )
                    : e
                )
                .catch(
                  (e) => (
                    console.warn(d, "error while updating bookmarks:", e), !1
                  )
                )
                .then(
                  (e) => (
                    e ||
                      console.warn(
                        d,
                        "failed to update bookmarks, current version:",
                        a.Z.get(c.kBookmarksVersion)
                      ),
                    e
                  )
                ),
          };
        var g = n(83897),
          m = n(18856),
          f = n(96951),
          v = n(57049),
          b = n(33638),
          y = n(53454),
          S = n(56371),
          C = n(28773),
          w = n(30381),
          x = n.n(w),
          A = n(58379),
          T = n(27770),
          _ = n(57118),
          E = n(35369),
          I = n(30460),
          k = n(44850),
          Z = n(59322),
          N = n(36436);
        const P = v.t;
        let M = !0,
          D = !0;

        function O() {
          M = !0;
        }

        function L() {
          (M = !1), B();
        }

        function j() {
          b.Z.dispatch({
            actionType: "BOOKMARKS_SET_BATCH_MODE",
            edit: !0,
          });
        }

        function R() {
          b.Z.dispatch({
            actionType: "BOOKMARKS_SET_BATCH_MODE",
            edit: !1,
          });
        }

        function F(e) {
          const t = [],
            n = [];
          for (const i of e)
            n.push(i.url),
              t.push({
                ...i,
                faviconUrl: void 0,
                partner: "",
              });
          if (!a.Z.get(c.kDashboardTopSitesHideSuggestions))
            for (const e of P) {
              if (t.length >= 10) break;
              n.includes(e.url) ||
                t.push({
                  ...e,
                  partner: e.url,
                });
            }
          return t;
        }
        async function B(e = !1) {
          const t = fetch("./default-bookmarks/partners.json")
              .then((e) => e.json())
              .catch(
                () => (
                  console.warn("Failed to load partner bookmarks"),
                  {
                    bookmarks: [],
                    folders: [],
                  }
                )
              ),
            [n, i, s, a] = await Promise.all([
              r.Z.bookmarks.getTree(),
              t,
              l.Z.bookmarksPrivate.getFolderIds(),
              (0, A.Z)().then(F),
            ]);
          b.Z.dispatch({
            actionType: "BOOKMARKS_INIT",
            bookmarks: n,
            folderIds: s,
            topSites: a,
            failedUpgrade: e,
            partnerDB: i,
          });
        }

        function W(e, t) {
          M ||
            b.Z.dispatch({
              actionType: "BOOKMARKS_ADD_ITEM",
              id: e,
              changes: t,
            });
        }

        function U(e, t) {
          M ||
            b.Z.dispatch({
              actionType: "BOOKMARKS_CHANGE_ITEM",
              id: e,
              changes: t,
            });
        }

        function V(e, t) {
          M ||
            b.Z.dispatch({
              actionType: "BOOKMARKS_MOVE_ITEM",
              id: e,
              changes: t,
            });
        }

        function H(e) {
          b.Z.dispatch({
            actionType: "BOOKMARKS_REMOVE_ITEM",
            id: e,
          });
        }

        function G(e, t) {
          M || B();
        }

        function z(e, t) {
          if (M) return;
          g.Z.getItemById(e) &&
            b.Z.dispatch({
              actionType: "BOOKMARKS_CHANGE_ITEM",
              id: e,
              changes: {
                faviconUrl: t,
              },
            });
        }

        function K(e, t) {
          M ||
            b.Z.dispatch({
              actionType: "BOOKMARKS_CHANGE_ITEM",
              id: e,
              changes: t,
            });
        }

        function $() {
          !1 === D &&
            ((D = !0), l.Z.bookmarksPrivate.onFaviconChanged.removeListener(z));
        }

        function Y() {
          !0 === D &&
            ((D = !1), l.Z.bookmarksPrivate.onFaviconChanged.addListener(z));
        }
        async function X(e) {
          const t = (0, f.NK)(e.pages)
            .map((e) => ({
              page: "group" === e.type ? void 0 : e.page,
              url: "group" === e.type ? void 0 : e.page.url,
              title:
                "group" === e.type
                  ? e.page?.vivExtData.fixedGroupTitle ?? (0, S.Z)("Stack")
                  : e.page?.vivExtData.fixedTitle ??
                    (0, k.getDisplayTitle)(e.page),
              children:
                "group" === e.type
                  ? e.pages
                      .map((e) => ({
                        page: e,
                        url: e.url,
                        title: (0, k.getDisplayTitle)(e),
                      }))
                      .toArray()
                  : void 0,
            }))
            .filter((e) => e.children || e.url);
          if (!t.size) return;
          const { parentId: n, index: i } = e;
          if (1 !== t.size || e.forceFolder) {
            if (e.isStack) {
              return await Promise.all(
                t.map(async ({ children: e, title: t }) => {
                  if (!e?.length) return "";
                  const i = await r.Z.bookmarks.create({
                    parentId: n,
                    title: t,
                  });
                  return await q.createBookmarks(e, i.id, 0, "none"), i.id;
                })
              ).then((e) => e.filter(Boolean)[0]);
            }
            {
              const s = {
                  parentId: n,
                  ...("number" == typeof i
                    ? {
                        index: i,
                      }
                    : null),
                },
                a = await r.Z.bookmarks.create(s),
                o = x()(a.dateAdded).format("YYYY-MM-DD, HH:mm:ss"),
                l = e.isSelection
                  ? (0, S.Z)("Saved Tab Selection ($1)", [o])
                  : (0, S.Z)("Saved Tabs ($1)", [o]);
              return (
                await r.Z.bookmarks.update(a.id, {
                  title: l,
                }),
                await Promise.all(
                  t.map(async (e) => {
                    const { children: t, title: n, url: i } = e;
                    if (t?.length) {
                      const e = await r.Z.bookmarks.create({
                        parentId: a.id,
                        title: n,
                      });
                      await q.createBookmarks(t, e.id, 0, "none");
                    } else
                      await r.Z.bookmarks.create({
                        parentId: a.id,
                        title: n,
                        url: i,
                      });
                  })
                ),
                a.id
              );
            }
          }
          {
            const { children: e, title: s, page: a } = t.first();
            if (e?.length) {
              const t = {
                  parentId: n,
                  title: s,
                  ...("number" == typeof i
                    ? {
                        index: i,
                      }
                    : null),
                },
                a = await r.Z.bookmarks.create(t);
              return await q.createBookmarks(e, a.id, 0, "none"), a.id;
            }
            return a && !e ? q.bookmarkPageInFolder(a, n, i) : void 0;
          }
        }

        function Q({ clipboardData: e }, t, n) {
          e &&
            ((t = g.Z.validateForClipboard(t)),
            e.setData("vivaldi/x-cut", n),
            e.setData(T.yR, JSON.stringify(t)),
            e.setData("text/plain", g.Z.getDragData("text/plain", t)));
        }
        const q = new (class {
            loadPromise = () =>
              p
                .init()
                .then((e) => B(!e))
                .then(() => {
                  (M = !1),
                    (D = !1),
                    r.Z.bookmarks.onImportBegan.addListener(O),
                    r.Z.bookmarks.onImportEnded.addListener(L),
                    r.Z.bookmarks.onChanged.addListener(U),
                    r.Z.bookmarks.onCreated.addListener(W),
                    r.Z.bookmarks.onRemoved.addListener(H),
                    r.Z.bookmarks.onMoved.addListener(V),
                    r.Z.bookmarks.onChildrenReordered.addListener(G),
                    l.Z.bookmarkContextMenu.onOpen.addListener($),
                    l.Z.bookmarkContextMenu.onClose.addListener(Y),
                    l.Z.menubarMenu.onOpen.addListener($),
                    l.Z.menubarMenu.onClose.addListener(Y),
                    l.Z.bookmarksPrivate.onFaviconChanged.addListener(z),
                    l.Z.bookmarksPrivate.onMetaInfoChanged.addListener(K),
                    l.Z.utilities.onTopSitesChanged.addListener(
                      this.setTopSites
                    );
                });
            setTopSites = async () => {
              b.Z.dispatch({
                actionType: "BOOKMARKS_SET_TOPSITES",
                topSites: F(await (0, A.Z)()),
              });
            };
            setBookmarkBarFolderAndToggleVisibility(e) {
              const t =
                g.Z.getBookmarkBarFolderId() !== e ||
                !a.Z.get(c.kBookmarksBarVisible);
              return q.setBookmarkBarFolder(e).then((e) => {
                e && s.Z.set(c.kBookmarksBarVisible, t);
              });
            }
            setBookmarkBarFolderAndShow(e) {
              return q.setBookmarkBarFolder(e).then((e) => {
                e && s.Z.set(c.kBookmarksBarVisible, !0);
              });
            }
            async setBookmarkBarFolder(e) {
              const t = g.Z.getItemById(e);
              if (!t || !g.Z.isFolder(t)) return !1;
              const n = g.Z.getBookmarkBarFolderId();
              if (n === e) return !0;
              j();
              try {
                void 0 !== n &&
                  n !== g.Z.getRootId() &&
                  (await r.Z.bookmarks.update(n, {
                    bookmarkbar: !1,
                  })),
                  await r.Z.bookmarks.update(e, {
                    bookmarkbar: !0,
                  });
              } catch (e) {
                console.warn(
                  `BookmarkActions: Failed to set bookmark bar folder: ${e}`
                );
              } finally {
                R();
              }
              return !0;
            }
            addSpeeddialGroup(e) {
              g.Z.isFolder(e) &&
                (r.Z.bookmarks.update(e.id, {
                  speeddial: !0,
                }),
                s.Z.set(
                  c.kStartpageSpeedDialOrder,
                  a.Z.get(c.kStartpageSpeedDialOrder).concat([e.id])
                ));
            }
            removeSpeeddialGroup(e) {
              g.Z.isFolder(e) &&
                (r.Z.bookmarks.update(e.id, {
                  speeddial: !1,
                }),
                s.Z.set(
                  c.kStartpageSpeedDialOrder,
                  a.Z.get(c.kStartpageSpeedDialOrder).filter((t) => t !== e.id)
                ));
            }
            setActiveGroup(e, t) {
              b.Z.dispatch({
                actionType: "BOOKMARKS_SET_ACTIVE_GROUP",
                windowId: e,
                id: t,
              });
            }
            setCutIds = (e) => {
              b.Z.dispatch({
                actionType: "BOOKMARKS_SET_CUT_IDS",
                ids: e,
              });
            };
            installTopSites() {
              b.Z.dispatch({
                actionType: "BOOKMARKS_INSTALL_TOPSITES",
              });
            }
            async move(e, t, n) {
              const i = g.Z.validateForDrag(e)
                .map((e) => g.Z.getItemById(e)?.id)
                .filter(Boolean);
              j();
              const s = await (function (e, { parentId: t, index: n }) {
                return e.reduce(async (e, i) => {
                  const s = await e,
                    a = s[s.length - 1]?.index,
                    o = await r.Z.bookmarks.move(i, {
                      parentId: t,
                      index: void 0 !== a ? a + 1 : n,
                    });
                  return s.push(o), Promise.resolve(s);
                }, Promise.resolve([]));
              })(i, {
                parentId: t,
                index: n,
              });
              return R(), s.map((e) => e.id);
            }
            reorder(e, t) {
              return (
                (e = g.Z.validateForDrag(e)),
                j(),
                Promise.all(
                  e.reverse().map((e) =>
                    r.Z.bookmarks
                      .move(e, {
                        parentId: t,
                        index: 0,
                      })
                      .then((e) => e.id)
                  )
                ).then((e) => (R(), e))
              );
            }
            async duplicate(e, t, n) {
              const i = structuredClone(
                e
                  .map((e) => g.Z.getItemById(e))
                  .filter((e) => e && !e.trash)
                  .filter(Boolean)
              );
              j();
              const s = await Promise.all(
                i.map(async (e) => {
                  const {
                      title: i,
                      url: s,
                      description: a,
                      nickname: o,
                      children: l,
                    } = e,
                    c = await r.Z.bookmarks.create({
                      index: n++,
                      parentId: t,
                      title: i,
                      ...(0, C.Z)(
                        s
                          ? {
                              url: s,
                            }
                          : null
                      ),
                      ...(0, C.Z)(
                        a
                          ? {
                              description: a,
                            }
                          : null
                      ),
                      ...(0, C.Z)(
                        o
                          ? {
                              nickname: o,
                            }
                          : null
                      ),
                    });
                  if (!c) throw new Error("Bookmark was not created");
                  if (l?.length) {
                    const e = l.map(({ id: e }) => e);
                    await this.duplicate(e, c.id, 0);
                  }
                  return c.id;
                })
              );
              return R(), s;
            }
            async createWithPromise(e, t, n) {
              j();
              const i = await Promise.all(
                e.map(async (e) => {
                  if ("SEPARATOR" === e)
                    return this.createSeparator(t, void 0 === n ? void 0 : n++);
                  const i = await r.Z.bookmarks.create({
                    title: e.title,
                    url: e.url || (e.children ? void 0 : I.p),
                    parentId: t,
                    description: e.description,
                    nickname: e.nickname,
                    index: void 0 === n ? void 0 : n++,
                  });
                  return (
                    e.children?.length &&
                      (await q.createWithPromise(e.children, i.id, 0)),
                    i
                  );
                })
              );
              return R(), i;
            }
            createSeparator(e, t) {
              return r.Z.bookmarks.create({
                title: "---",
                url: I.p,
                parentId: e,
                description: "separator",
                nickname: "",
                index: t,
              });
            }
            async createBookmarks(e, t, n, i) {
              if ((j(), "none" !== i)) {
                const e = {
                    parentId: t,
                    ...("number" == typeof n
                      ? {
                          index: n,
                        }
                      : null),
                  },
                  s = await r.Z.bookmarks.create(e),
                  a = x()(s.dateAdded).format("YYYY-MM-DD, HH:mm:ss");
                let o;
                switch (i) {
                  case "history":
                    o = (0, S.Z)("Saved History ($1)", [a]);
                    break;
                  case "sync":
                    o = (0, S.Z)("Saved Synced Tabs ($1)", [a]);
                }
                o &&
                  (await r.Z.bookmarks.update(s.id, {
                    title: o,
                  })),
                  (t = s.id);
              }
              const s = await Promise.all(
                e.map(({ url: e, title: i }) =>
                  r.Z.bookmarks
                    .create({
                      parentId: t,
                      url: e,
                      title: i,
                      index: n++,
                    })
                    .then(({ id: e }) => e)
                )
              );
              return R(), s;
            }
            remove = (e) => (
              j(),
              Promise.all(
                e.map((e) => {
                  const t = g.Z.getItemById(e),
                    n = t && g.Z.isFolder(t);
                  return (
                    n &&
                      e === a.Z.get(c.kBookmarksSaveFolder) &&
                      s.Z.set(c.kBookmarksSaveFolder, g.Z.getRootId()),
                    n && t && g.Z.isTrashed(t) && i.GG(t.uuid),
                    t && this.removeShortcuts(t),
                    n
                      ? r.Z.bookmarks
                          .removeTree(e)
                          .catch(() =>
                            console.warn(`Error removing bookmark tree: ${e}`)
                          )
                      : r.Z.bookmarks
                          .remove(e)
                          .catch(() =>
                            console.warn(`Error removing bookmark: ${e}`)
                          )
                  );
                })
              ).then(() => R())
            );
            removeShortcuts = (e) => {
              e.children &&
                e.children.length > 0 &&
                e.children.forEach((e) => {
                  this.removeShortcuts(e);
                }),
                e.url && l.Z.omniboxPrivate.deleteShortcut(e.url);
            };
            async emptyTrash() {
              !1 ===
                (await new Promise((e) => {
                  l.Z.bookmarksPrivate.emptyTrash(e),
                    l.Z.utilities.cleanUnusedImages(0);
                })) && console.warn("Empty trash failed.");
              const e = m.Z.getWidgets().keys();
              for (const t of e)
                t &&
                  t !== _.N4 &&
                  !g.Z.getSpeeddialFolders().some((e) => e.uuid === t) &&
                  i.GG(t);
            }
            async updateBookmark(e, t) {
              const { nickname: n } = t;
              if (n) {
                const t = g.Z.iterateTree(!0).find(
                  (t) => t.nickname === n && t.id !== e && g.Z.isTrashed(t)
                );
                if (t)
                  try {
                    await r.Z.bookmarks.update(t.id, {
                      nickname: "",
                    });
                  } catch (e) {
                    console.debug(
                      "Unable to clear nickname in trashed bookmark",
                      {
                        error: e,
                      }
                    );
                  }
              }
              return r.Z.bookmarks.update(e, t);
            }
            bookmarkAllOpenPages(e, t, n) {
              const i = y.Z.getActiveWorkspaceId(e);
              return X({
                pages: f.ZP.getPages(e, {
                  workspaceId: i,
                }),
                parentId: t,
                index: n,
                isStack: !1,
                isSelection: !1,
                forceFolder: !0,
              });
            }
            bookmarkPages(e, t, n, i) {
              return X({
                pages: (0, Z.nq)(e) ? e : E.aV.of(e),
                parentId: n,
                index: i,
                isStack: t,
                isSelection: !0,
                forceFolder: (0, Z.nq)(e),
              });
            }
            async bookmarkPageInFolder(e, t, n) {
              const { url: i } = e,
                s = (0, k.getDisplayTitle)(e),
                { id: a } = await r.Z.bookmarks.create({
                  parentId: t,
                  url: i,
                  title: s,
                  ...("number" == typeof n
                    ? {
                        index: n,
                      }
                    : null),
                });
              return a;
            }
            cut(e, t) {
              Q(e, t, "true"),
                q.setCutIds(t),
                e.stopPropagation(),
                e.preventDefault();
            }
            copy(e, t) {
              Q(e, t, "false"), e.stopPropagation(), e.preventDefault();
            }
            paste({ clipboardData: e }, t, n) {
              const i = g.Z.getItemById(t);
              if (!i || !e)
                return Promise.resolve({
                  isCut: !1,
                  ids: [],
                });
              let s, a;
              if (g.Z.isFolder(i))
                (s = i.id),
                  !0 === n && i.children
                    ? ((a = i.children.length),
                      a > 0 && i.children[a - 1].trash && a--)
                    : (a = 0);
              else if (
                ((s = i.parentId), (a = (i.index || 0) + 1), void 0 === s)
              )
                return (
                  console.log("error", "Can not paste, target has no parent"),
                  Promise.resolve({
                    isCut: !1,
                    ids: [],
                  })
                );
              const o =
                -1 !== e.types.findIndex((e) => e === T.yR)
                  ? JSON.parse(e.getData(T.yR))
                  : [];
              if (0 === o.length) {
                const t = e.getData("text/plain");
                return (
                  (0, N.K2)(t) &&
                    q.createBookmarks(
                      [
                        {
                          title: t,
                          url: t,
                        },
                      ],
                      s,
                      a,
                      "none"
                    ),
                  Promise.resolve({
                    isCut: !1,
                    ids: [],
                  })
                );
              }
              return g.Z.getCutIds().length > 0 &&
                "true" === e.getData("vivaldi/x-cut")
                ? q.move(o, s, a).then(
                    (e) => (
                      q.setCutIds([]),
                      {
                        isCut: !0,
                        ids: e,
                      }
                    )
                  )
                : q.duplicate(o, s, a).then((e) => ({
                    isCut: !1,
                    ids: e,
                  }));
            }
          })(),
          J = q;
      },