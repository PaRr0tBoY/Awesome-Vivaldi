var background = (function () {
  "use strict";
  var yp = Object.defineProperty;
  var vp = (ze, he, z) =>
    he in ze
      ? yp(ze, he, { enumerable: !0, configurable: !0, writable: !0, value: z })
      : (ze[he] = z);
  var we = (ze, he, z) => vp(ze, typeof he != "symbol" ? he + "" : he, z);
  var ja, $a, Da;
  function ze(t) {
    return t == null || typeof t == "function" ? { main: t } : t;
  }
  const he =
      ($a = (ja = globalThis.browser) == null ? void 0 : ja.runtime) != null &&
      $a.id
        ? globalThis.browser
        : globalThis.chrome,
    z = he,
    Ba = [
      EvalError,
      RangeError,
      ReferenceError,
      SyntaxError,
      TypeError,
      URIError,
      globalThis.DOMException,
      globalThis.AssertionError,
      globalThis.SystemError,
    ]
      .filter(Boolean)
      .map((t) => [t.name, t]),
    La = new Map(Ba);
  class gr extends Error {
    constructor(r) {
      super(gr._prepareSuperMessage(r));
      we(this, "name", "NonError");
    }
    static _prepareSuperMessage(r) {
      try {
        return JSON.stringify(r);
      } catch {
        return String(r);
      }
    }
  }
  const Fa = [
      { property: "name", enumerable: !1 },
      { property: "message", enumerable: !1 },
      { property: "stack", enumerable: !1 },
      { property: "code", enumerable: !0 },
      { property: "cause", enumerable: !1 },
    ],
    hr = new WeakSet(),
    Ua = (t) => {
      hr.add(t);
      const e = t.toJSON();
      return (hr.delete(t), e);
    },
    ln = (t) => La.get(t) ?? Error,
    yr = ({
      from: t,
      seen: e,
      to: r,
      forceEnumerable: n,
      maxDepth: s,
      depth: a,
      useToJSON: i,
      serialize: o,
    }) => {
      if (!r)
        if (Array.isArray(t)) r = [];
        else if (!o && un(t)) {
          const l = ln(t.name);
          r = new l();
        } else r = {};
      if ((e.push(t), a >= s)) return r;
      if (i && typeof t.toJSON == "function" && !hr.has(t)) return Ua(t);
      const c = (l) =>
        yr({
          from: l,
          seen: [...e],
          forceEnumerable: n,
          maxDepth: s,
          depth: a,
          useToJSON: i,
          serialize: o,
        });
      for (const [l, u] of Object.entries(t)) {
        if (u && u instanceof Uint8Array && u.constructor.name === "Buffer") {
          r[l] = "[object Buffer]";
          continue;
        }
        if (u !== null && typeof u == "object" && typeof u.pipe == "function") {
          r[l] = "[object Stream]";
          continue;
        }
        if (typeof u != "function") {
          if (!u || typeof u != "object") {
            try {
              r[l] = u;
            } catch {}
            continue;
          }
          if (!e.includes(t[l])) {
            (a++, (r[l] = c(t[l])));
            continue;
          }
          r[l] = "[Circular]";
        }
      }
      for (const { property: l, enumerable: u } of Fa)
        typeof t[l] < "u" &&
          t[l] !== null &&
          Object.defineProperty(r, l, {
            value: un(t[l]) ? c(t[l]) : t[l],
            enumerable: n ? !0 : u,
            configurable: !0,
            writable: !0,
          });
      return r;
    };
  function Za(t, e = {}) {
    const { maxDepth: r = Number.POSITIVE_INFINITY, useToJSON: n = !0 } = e;
    return typeof t == "object" && t !== null
      ? yr({
          from: t,
          seen: [],
          forceEnumerable: !0,
          maxDepth: r,
          depth: 0,
          useToJSON: n,
          serialize: !0,
        })
      : typeof t == "function"
        ? `[Function: ${t.name || "anonymous"}]`
        : t;
  }
  function za(t, e = {}) {
    const { maxDepth: r = Number.POSITIVE_INFINITY } = e;
    if (t instanceof Error) return t;
    if (qa(t)) {
      const n = ln(t.name);
      return yr({
        from: t,
        seen: [],
        to: new n(),
        maxDepth: r,
        depth: 0,
        serialize: !1,
      });
    }
    return new gr(t);
  }
  function un(t) {
    return (
      !!t &&
      typeof t == "object" &&
      "name" in t &&
      "message" in t &&
      "stack" in t
    );
  }
  function qa(t) {
    return !!t && typeof t == "object" && "message" in t && !Array.isArray(t);
  }
  var Ja = Object.defineProperty,
    Ka = Object.defineProperties,
    Ga = Object.getOwnPropertyDescriptors,
    dn = Object.getOwnPropertySymbols,
    Wa = Object.prototype.hasOwnProperty,
    Ha = Object.prototype.propertyIsEnumerable,
    pn = (t, e, r) =>
      e in t
        ? Ja(t, e, { enumerable: !0, configurable: !0, writable: !0, value: r })
        : (t[e] = r),
    mn = (t, e) => {
      for (var r in e || (e = {})) Wa.call(e, r) && pn(t, r, e[r]);
      if (dn) for (var r of dn(e)) Ha.call(e, r) && pn(t, r, e[r]);
      return t;
    },
    fn = (t, e) => Ka(t, Ga(e)),
    Ya = (t, e, r) =>
      new Promise((n, s) => {
        var a = (c) => {
            try {
              o(r.next(c));
            } catch (l) {
              s(l);
            }
          },
          i = (c) => {
            try {
              o(r.throw(c));
            } catch (l) {
              s(l);
            }
          },
          o = (c) =>
            c.done ? n(c.value) : Promise.resolve(c.value).then(a, i);
        o((r = r.apply(t, e)).next());
      });
  function Qa(t) {
    let e,
      r = {};
    function n() {
      Object.entries(r).length === 0 && (e == null || e(), (e = void 0));
    }
    let s = Math.floor(Math.random() * 1e4);
    function a() {
      return s++;
    }
    return {
      sendMessage(i, o, ...c) {
        return Ya(this, null, function* () {
          var l, u, f, _;
          const C = { id: a(), type: i, data: o, timestamp: Date.now() },
            S =
              (u = yield (l = t.verifyMessageData) == null
                ? void 0
                : l.call(t, C)) != null
                ? u
                : C;
          (f = t.logger) == null ||
            f.debug(`[messaging] sendMessage {id=${S.id}} ─ᐅ`, S, ...c);
          const m = yield t.sendMessage(S, ...c),
            { res: p, err: d } = m ?? { err: new Error("No response") };
          if (
            ((_ = t.logger) == null ||
              _.debug(`[messaging] sendMessage {id=${S.id}} ᐊ─`, {
                res: p,
                err: d,
              }),
            d != null)
          )
            throw za(d);
          return p;
        });
      },
      onMessage(i, o) {
        var c, l, u;
        if (
          (e == null &&
            ((c = t.logger) == null ||
              c.debug(
                `[messaging] "${i}" initialized the message listener for this context`,
              ),
            (e = t.addRootListener((f) => {
              var _, C;
              if (typeof f.type != "string" || typeof f.timestamp != "number") {
                if (t.breakError) return;
                const p = Error(
                  `[messaging] Unknown message format, must include the 'type' & 'timestamp' fields, received: ${JSON.stringify(f)}`,
                );
                throw ((_ = t.logger) == null || _.error(p), p);
              }
              (C = t == null ? void 0 : t.logger) == null ||
                C.debug("[messaging] Received message", f);
              const S = r[f.type];
              if (S == null) return;
              const m = S(f);
              return Promise.resolve(m)
                .then((p) => {
                  var d, g;
                  return (g =
                    (d = t.verifyMessageData) == null
                      ? void 0
                      : d.call(t, p)) != null
                    ? g
                    : p;
                })
                .then((p) => {
                  var d;
                  return (
                    (d = t == null ? void 0 : t.logger) == null ||
                      d.debug(`[messaging] onMessage {id=${f.id}} ─ᐅ`, {
                        res: p,
                      }),
                    { res: p }
                  );
                })
                .catch((p) => {
                  var d;
                  return (
                    (d = t == null ? void 0 : t.logger) == null ||
                      d.debug(`[messaging] onMessage {id=${f.id}} ─ᐅ`, {
                        err: p,
                      }),
                    { err: Za(p) }
                  );
                });
            }))),
          r[i] != null)
        ) {
          const f = Error(
            `[messaging] In this JS context, only one listener can be setup for ${i}`,
          );
          throw ((l = t.logger) == null || l.error(f), f);
        }
        return (
          (r[i] = o),
          (u = t.logger) == null ||
            u.log(`[messaging] Added listener for ${i}`),
          () => {
            (delete r[i], n());
          }
        );
      },
      removeAllListeners() {
        (Object.keys(r).forEach((i) => {
          delete r[i];
        }),
          n());
      },
    };
  }
  var Xa =
    typeof globalThis < "u"
      ? globalThis
      : typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof self < "u"
            ? self
            : {};
  function gn(t) {
    return t &&
      t.__esModule &&
      Object.prototype.hasOwnProperty.call(t, "default")
      ? t.default
      : t;
  }
  var hn = { exports: {} };
  (function (t, e) {
    (function (r, n) {
      n(t);
    })(
      typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : Xa,
      function (r) {
        var n, s;
        if (
          !(
            (s = (n = globalThis.chrome) == null ? void 0 : n.runtime) !=
              null && s.id
          )
        )
          throw new Error(
            "This script should only be loaded in a browser extension.",
          );
        if (
          typeof globalThis.browser > "u" ||
          Object.getPrototypeOf(globalThis.browser) !== Object.prototype
        ) {
          const a = "The message port closed before a response was received.",
            i = (o) => {
              const c = {
                alarms: {
                  clear: { minArgs: 0, maxArgs: 1 },
                  clearAll: { minArgs: 0, maxArgs: 0 },
                  get: { minArgs: 0, maxArgs: 1 },
                  getAll: { minArgs: 0, maxArgs: 0 },
                },
                bookmarks: {
                  create: { minArgs: 1, maxArgs: 1 },
                  get: { minArgs: 1, maxArgs: 1 },
                  getChildren: { minArgs: 1, maxArgs: 1 },
                  getRecent: { minArgs: 1, maxArgs: 1 },
                  getSubTree: { minArgs: 1, maxArgs: 1 },
                  getTree: { minArgs: 0, maxArgs: 0 },
                  move: { minArgs: 2, maxArgs: 2 },
                  remove: { minArgs: 1, maxArgs: 1 },
                  removeTree: { minArgs: 1, maxArgs: 1 },
                  search: { minArgs: 1, maxArgs: 1 },
                  update: { minArgs: 2, maxArgs: 2 },
                },
                browserAction: {
                  disable: { minArgs: 0, maxArgs: 1, fallbackToNoCallback: !0 },
                  enable: { minArgs: 0, maxArgs: 1, fallbackToNoCallback: !0 },
                  getBadgeBackgroundColor: { minArgs: 1, maxArgs: 1 },
                  getBadgeText: { minArgs: 1, maxArgs: 1 },
                  getPopup: { minArgs: 1, maxArgs: 1 },
                  getTitle: { minArgs: 1, maxArgs: 1 },
                  openPopup: { minArgs: 0, maxArgs: 0 },
                  setBadgeBackgroundColor: {
                    minArgs: 1,
                    maxArgs: 1,
                    fallbackToNoCallback: !0,
                  },
                  setBadgeText: {
                    minArgs: 1,
                    maxArgs: 1,
                    fallbackToNoCallback: !0,
                  },
                  setIcon: { minArgs: 1, maxArgs: 1 },
                  setPopup: {
                    minArgs: 1,
                    maxArgs: 1,
                    fallbackToNoCallback: !0,
                  },
                  setTitle: {
                    minArgs: 1,
                    maxArgs: 1,
                    fallbackToNoCallback: !0,
                  },
                },
                browsingData: {
                  remove: { minArgs: 2, maxArgs: 2 },
                  removeCache: { minArgs: 1, maxArgs: 1 },
                  removeCookies: { minArgs: 1, maxArgs: 1 },
                  removeDownloads: { minArgs: 1, maxArgs: 1 },
                  removeFormData: { minArgs: 1, maxArgs: 1 },
                  removeHistory: { minArgs: 1, maxArgs: 1 },
                  removeLocalStorage: { minArgs: 1, maxArgs: 1 },
                  removePasswords: { minArgs: 1, maxArgs: 1 },
                  removePluginData: { minArgs: 1, maxArgs: 1 },
                  settings: { minArgs: 0, maxArgs: 0 },
                },
                commands: { getAll: { minArgs: 0, maxArgs: 0 } },
                contextMenus: {
                  remove: { minArgs: 1, maxArgs: 1 },
                  removeAll: { minArgs: 0, maxArgs: 0 },
                  update: { minArgs: 2, maxArgs: 2 },
                },
                cookies: {
                  get: { minArgs: 1, maxArgs: 1 },
                  getAll: { minArgs: 1, maxArgs: 1 },
                  getAllCookieStores: { minArgs: 0, maxArgs: 0 },
                  remove: { minArgs: 1, maxArgs: 1 },
                  set: { minArgs: 1, maxArgs: 1 },
                },
                devtools: {
                  inspectedWindow: {
                    eval: { minArgs: 1, maxArgs: 2, singleCallbackArg: !1 },
                  },
                  panels: {
                    create: { minArgs: 3, maxArgs: 3, singleCallbackArg: !0 },
                    elements: { createSidebarPane: { minArgs: 1, maxArgs: 1 } },
                  },
                },
                downloads: {
                  cancel: { minArgs: 1, maxArgs: 1 },
                  download: { minArgs: 1, maxArgs: 1 },
                  erase: { minArgs: 1, maxArgs: 1 },
                  getFileIcon: { minArgs: 1, maxArgs: 2 },
                  open: { minArgs: 1, maxArgs: 1, fallbackToNoCallback: !0 },
                  pause: { minArgs: 1, maxArgs: 1 },
                  removeFile: { minArgs: 1, maxArgs: 1 },
                  resume: { minArgs: 1, maxArgs: 1 },
                  search: { minArgs: 1, maxArgs: 1 },
                  show: { minArgs: 1, maxArgs: 1, fallbackToNoCallback: !0 },
                },
                extension: {
                  isAllowedFileSchemeAccess: { minArgs: 0, maxArgs: 0 },
                  isAllowedIncognitoAccess: { minArgs: 0, maxArgs: 0 },
                },
                history: {
                  addUrl: { minArgs: 1, maxArgs: 1 },
                  deleteAll: { minArgs: 0, maxArgs: 0 },
                  deleteRange: { minArgs: 1, maxArgs: 1 },
                  deleteUrl: { minArgs: 1, maxArgs: 1 },
                  getVisits: { minArgs: 1, maxArgs: 1 },
                  search: { minArgs: 1, maxArgs: 1 },
                },
                i18n: {
                  detectLanguage: { minArgs: 1, maxArgs: 1 },
                  getAcceptLanguages: { minArgs: 0, maxArgs: 0 },
                },
                identity: { launchWebAuthFlow: { minArgs: 1, maxArgs: 1 } },
                idle: { queryState: { minArgs: 1, maxArgs: 1 } },
                management: {
                  get: { minArgs: 1, maxArgs: 1 },
                  getAll: { minArgs: 0, maxArgs: 0 },
                  getSelf: { minArgs: 0, maxArgs: 0 },
                  setEnabled: { minArgs: 2, maxArgs: 2 },
                  uninstallSelf: { minArgs: 0, maxArgs: 1 },
                },
                notifications: {
                  clear: { minArgs: 1, maxArgs: 1 },
                  create: { minArgs: 1, maxArgs: 2 },
                  getAll: { minArgs: 0, maxArgs: 0 },
                  getPermissionLevel: { minArgs: 0, maxArgs: 0 },
                  update: { minArgs: 2, maxArgs: 2 },
                },
                pageAction: {
                  getPopup: { minArgs: 1, maxArgs: 1 },
                  getTitle: { minArgs: 1, maxArgs: 1 },
                  hide: { minArgs: 1, maxArgs: 1, fallbackToNoCallback: !0 },
                  setIcon: { minArgs: 1, maxArgs: 1 },
                  setPopup: {
                    minArgs: 1,
                    maxArgs: 1,
                    fallbackToNoCallback: !0,
                  },
                  setTitle: {
                    minArgs: 1,
                    maxArgs: 1,
                    fallbackToNoCallback: !0,
                  },
                  show: { minArgs: 1, maxArgs: 1, fallbackToNoCallback: !0 },
                },
                permissions: {
                  contains: { minArgs: 1, maxArgs: 1 },
                  getAll: { minArgs: 0, maxArgs: 0 },
                  remove: { minArgs: 1, maxArgs: 1 },
                  request: { minArgs: 1, maxArgs: 1 },
                },
                runtime: {
                  getBackgroundPage: { minArgs: 0, maxArgs: 0 },
                  getPlatformInfo: { minArgs: 0, maxArgs: 0 },
                  openOptionsPage: { minArgs: 0, maxArgs: 0 },
                  requestUpdateCheck: { minArgs: 0, maxArgs: 0 },
                  sendMessage: { minArgs: 1, maxArgs: 3 },
                  sendNativeMessage: { minArgs: 2, maxArgs: 2 },
                  setUninstallURL: { minArgs: 1, maxArgs: 1 },
                },
                sessions: {
                  getDevices: { minArgs: 0, maxArgs: 1 },
                  getRecentlyClosed: { minArgs: 0, maxArgs: 1 },
                  restore: { minArgs: 0, maxArgs: 1 },
                },
                storage: {
                  local: {
                    clear: { minArgs: 0, maxArgs: 0 },
                    get: { minArgs: 0, maxArgs: 1 },
                    getBytesInUse: { minArgs: 0, maxArgs: 1 },
                    remove: { minArgs: 1, maxArgs: 1 },
                    set: { minArgs: 1, maxArgs: 1 },
                  },
                  managed: {
                    get: { minArgs: 0, maxArgs: 1 },
                    getBytesInUse: { minArgs: 0, maxArgs: 1 },
                  },
                  sync: {
                    clear: { minArgs: 0, maxArgs: 0 },
                    get: { minArgs: 0, maxArgs: 1 },
                    getBytesInUse: { minArgs: 0, maxArgs: 1 },
                    remove: { minArgs: 1, maxArgs: 1 },
                    set: { minArgs: 1, maxArgs: 1 },
                  },
                },
                tabs: {
                  captureVisibleTab: { minArgs: 0, maxArgs: 2 },
                  create: { minArgs: 1, maxArgs: 1 },
                  detectLanguage: { minArgs: 0, maxArgs: 1 },
                  discard: { minArgs: 0, maxArgs: 1 },
                  duplicate: { minArgs: 1, maxArgs: 1 },
                  executeScript: { minArgs: 1, maxArgs: 2 },
                  get: { minArgs: 1, maxArgs: 1 },
                  getCurrent: { minArgs: 0, maxArgs: 0 },
                  getZoom: { minArgs: 0, maxArgs: 1 },
                  getZoomSettings: { minArgs: 0, maxArgs: 1 },
                  goBack: { minArgs: 0, maxArgs: 1 },
                  goForward: { minArgs: 0, maxArgs: 1 },
                  highlight: { minArgs: 1, maxArgs: 1 },
                  insertCSS: { minArgs: 1, maxArgs: 2 },
                  move: { minArgs: 2, maxArgs: 2 },
                  query: { minArgs: 1, maxArgs: 1 },
                  reload: { minArgs: 0, maxArgs: 2 },
                  remove: { minArgs: 1, maxArgs: 1 },
                  removeCSS: { minArgs: 1, maxArgs: 2 },
                  sendMessage: { minArgs: 2, maxArgs: 3 },
                  setZoom: { minArgs: 1, maxArgs: 2 },
                  setZoomSettings: { minArgs: 1, maxArgs: 2 },
                  update: { minArgs: 1, maxArgs: 2 },
                },
                topSites: { get: { minArgs: 0, maxArgs: 0 } },
                webNavigation: {
                  getAllFrames: { minArgs: 1, maxArgs: 1 },
                  getFrame: { minArgs: 1, maxArgs: 1 },
                },
                webRequest: {
                  handlerBehaviorChanged: { minArgs: 0, maxArgs: 0 },
                },
                windows: {
                  create: { minArgs: 0, maxArgs: 1 },
                  get: { minArgs: 1, maxArgs: 2 },
                  getAll: { minArgs: 0, maxArgs: 1 },
                  getCurrent: { minArgs: 0, maxArgs: 1 },
                  getLastFocused: { minArgs: 0, maxArgs: 1 },
                  remove: { minArgs: 1, maxArgs: 1 },
                  update: { minArgs: 2, maxArgs: 2 },
                },
              };
              if (Object.keys(c).length === 0)
                throw new Error(
                  "api-metadata.json has not been included in browser-polyfill",
                );
              class l extends WeakMap {
                constructor(b, R = void 0) {
                  (super(R), (this.createItem = b));
                }
                get(b) {
                  return (
                    this.has(b) || this.set(b, this.createItem(b)),
                    super.get(b)
                  );
                }
              }
              const u = (v) =>
                  v && typeof v == "object" && typeof v.then == "function",
                f =
                  (v, b) =>
                  (...R) => {
                    o.runtime.lastError
                      ? v.reject(new Error(o.runtime.lastError.message))
                      : b.singleCallbackArg ||
                          (R.length <= 1 && b.singleCallbackArg !== !1)
                        ? v.resolve(R[0])
                        : v.resolve(R);
                  },
                _ = (v) => (v == 1 ? "argument" : "arguments"),
                C = (v, b) =>
                  function (F, ...B) {
                    if (B.length < b.minArgs)
                      throw new Error(
                        `Expected at least ${b.minArgs} ${_(b.minArgs)} for ${v}(), got ${B.length}`,
                      );
                    if (B.length > b.maxArgs)
                      throw new Error(
                        `Expected at most ${b.maxArgs} ${_(b.maxArgs)} for ${v}(), got ${B.length}`,
                      );
                    return new Promise((q, J) => {
                      if (b.fallbackToNoCallback)
                        try {
                          F[v](...B, f({ resolve: q, reject: J }, b));
                        } catch {
                          (F[v](...B),
                            (b.fallbackToNoCallback = !1),
                            (b.noCallback = !0),
                            q());
                        }
                      else
                        b.noCallback
                          ? (F[v](...B), q())
                          : F[v](...B, f({ resolve: q, reject: J }, b));
                    });
                  },
                S = (v, b, R) =>
                  new Proxy(b, {
                    apply(F, B, q) {
                      return R.call(B, v, ...q);
                    },
                  });
              let m = Function.call.bind(Object.prototype.hasOwnProperty);
              const p = (v, b = {}, R = {}) => {
                  let F = Object.create(null),
                    B = {
                      has(J, j) {
                        return j in v || j in F;
                      },
                      get(J, j, oe) {
                        if (j in F) return F[j];
                        if (!(j in v)) return;
                        let Q = v[j];
                        if (typeof Q == "function")
                          if (typeof b[j] == "function") Q = S(v, v[j], b[j]);
                          else if (m(R, j)) {
                            let X = C(j, R[j]);
                            Q = S(v, v[j], X);
                          } else Q = Q.bind(v);
                        else if (
                          typeof Q == "object" &&
                          Q !== null &&
                          (m(b, j) || m(R, j))
                        )
                          Q = p(Q, b[j], R[j]);
                        else if (m(R, "*")) Q = p(Q, b[j], R["*"]);
                        else
                          return (
                            Object.defineProperty(F, j, {
                              configurable: !0,
                              enumerable: !0,
                              get() {
                                return v[j];
                              },
                              set(X) {
                                v[j] = X;
                              },
                            }),
                            Q
                          );
                        return ((F[j] = Q), Q);
                      },
                      set(J, j, oe, Q) {
                        return (j in F ? (F[j] = oe) : (v[j] = oe), !0);
                      },
                      defineProperty(J, j, oe) {
                        return Reflect.defineProperty(F, j, oe);
                      },
                      deleteProperty(J, j) {
                        return Reflect.deleteProperty(F, j);
                      },
                    },
                    q = Object.create(v);
                  return new Proxy(q, B);
                },
                d = (v) => ({
                  addListener(b, R, ...F) {
                    b.addListener(v.get(R), ...F);
                  },
                  hasListener(b, R) {
                    return b.hasListener(v.get(R));
                  },
                  removeListener(b, R) {
                    b.removeListener(v.get(R));
                  },
                }),
                g = new l((v) =>
                  typeof v != "function"
                    ? v
                    : function (R) {
                        const F = p(
                          R,
                          {},
                          { getContent: { minArgs: 0, maxArgs: 0 } },
                        );
                        v(F);
                      },
                ),
                w = new l((v) =>
                  typeof v != "function"
                    ? v
                    : function (R, F, B) {
                        let q = !1,
                          J,
                          j = new Promise((ue) => {
                            J = function (K) {
                              ((q = !0), ue(K));
                            };
                          }),
                          oe;
                        try {
                          oe = v(R, F, J);
                        } catch (ue) {
                          oe = Promise.reject(ue);
                        }
                        const Q = oe !== !0 && u(oe);
                        if (oe !== !0 && !Q && !q) return !1;
                        const X = (ue) => {
                          ue.then(
                            (K) => {
                              B(K);
                            },
                            (K) => {
                              let H;
                              (K &&
                              (K instanceof Error ||
                                typeof K.message == "string")
                                ? (H = K.message)
                                : (H = "An unexpected error occurred"),
                                B({
                                  __mozWebExtensionPolyfillReject__: !0,
                                  message: H,
                                }));
                            },
                          ).catch((K) => {});
                        };
                        return (X(Q ? oe : j), !0);
                      },
                ),
                x = ({ reject: v, resolve: b }, R) => {
                  o.runtime.lastError
                    ? o.runtime.lastError.message === a
                      ? b()
                      : v(new Error(o.runtime.lastError.message))
                    : R && R.__mozWebExtensionPolyfillReject__
                      ? v(new Error(R.message))
                      : b(R);
                },
                T = (v, b, R, ...F) => {
                  if (F.length < b.minArgs)
                    throw new Error(
                      `Expected at least ${b.minArgs} ${_(b.minArgs)} for ${v}(), got ${F.length}`,
                    );
                  if (F.length > b.maxArgs)
                    throw new Error(
                      `Expected at most ${b.maxArgs} ${_(b.maxArgs)} for ${v}(), got ${F.length}`,
                    );
                  return new Promise((B, q) => {
                    const J = x.bind(null, { resolve: B, reject: q });
                    (F.push(J), R.sendMessage(...F));
                  });
                },
                $ = {
                  devtools: { network: { onRequestFinished: d(g) } },
                  runtime: {
                    onMessage: d(w),
                    onMessageExternal: d(w),
                    sendMessage: T.bind(null, "sendMessage", {
                      minArgs: 1,
                      maxArgs: 3,
                    }),
                  },
                  tabs: {
                    sendMessage: T.bind(null, "sendMessage", {
                      minArgs: 2,
                      maxArgs: 3,
                    }),
                  },
                },
                W = {
                  clear: { minArgs: 1, maxArgs: 1 },
                  get: { minArgs: 1, maxArgs: 1 },
                  set: { minArgs: 1, maxArgs: 1 },
                };
              return (
                (c.privacy = {
                  network: { "*": W },
                  services: { "*": W },
                  websites: { "*": W },
                }),
                p(o, $, c)
              );
            };
          r.exports = i(chrome);
        } else r.exports = globalThis.browser;
      },
    );
  })(hn);
  var ei = hn.exports;
  const Nt = gn(ei);
  function ti(t) {
    return Qa(
      fn(mn({}, t), {
        sendMessage(e, r) {
          if (r == null) return Nt.runtime.sendMessage(e);
          const n = typeof r == "number" ? { tabId: r } : r;
          return Nt.tabs.sendMessage(
            n.tabId,
            e,
            n.frameId != null ? { frameId: n.frameId } : void 0,
          );
        },
        addRootListener(e) {
          const r = (n, s) =>
            e(typeof n == "object" ? fn(mn({}, n), { sender: s }) : n);
          return (
            Nt.runtime.onMessage.addListener(r),
            () => Nt.runtime.onMessage.removeListener(r)
          );
        },
      }),
    );
  }
  var ri = Object.defineProperty,
    yn = Object.getOwnPropertySymbols,
    ni = Object.prototype.hasOwnProperty,
    si = Object.prototype.propertyIsEnumerable,
    vn = (t, e, r) =>
      e in t
        ? ri(t, e, { enumerable: !0, configurable: !0, writable: !0, value: r })
        : (t[e] = r),
    ai = (t, e) => {
      for (var r in e || (e = {})) ni.call(e, r) && vn(t, r, e[r]);
      if (yn) for (var r of yn(e)) si.call(e, r) && vn(t, r, e[r]);
      return t;
    };
  function ii(t, e, r) {
    const n = oi(t, r);
    return n.onMessage(n.messageKey, ({ data: s }) => {
      const a = s.path == null ? e : ci(e ?? {}, s.path);
      if (a) return Promise.resolve(a.bind(e)(...s.args));
    });
  }
  function oi(t, e) {
    const r = ti(e);
    return ai({ messageKey: `proxy-service.${t}` }, r);
  }
  function ci(t, e) {
    return e.length === 0
      ? t
      : e.reduce((r, n) => (r == null ? void 0 : r[n]), t);
  }
  var _n = Object.prototype.hasOwnProperty;
  function vr(t, e) {
    var r, n;
    if (t === e) return !0;
    if (t && e && (r = t.constructor) === e.constructor) {
      if (r === Date) return t.getTime() === e.getTime();
      if (r === RegExp) return t.toString() === e.toString();
      if (r === Array) {
        if ((n = t.length) === e.length) for (; n-- && vr(t[n], e[n]); );
        return n === -1;
      }
      if (!r || typeof t == "object") {
        n = 0;
        for (r in t)
          if (
            (_n.call(t, r) && ++n && !_n.call(e, r)) ||
            !(r in e) ||
            !vr(t[r], e[r])
          )
            return !1;
        return Object.keys(e).length === n;
      }
    }
    return t !== t && e !== e;
  }
  const li = new Error("request for lock canceled");
  var ui = function (t, e, r, n) {
    function s(a) {
      return a instanceof r
        ? a
        : new r(function (i) {
            i(a);
          });
    }
    return new (r || (r = Promise))(function (a, i) {
      function o(u) {
        try {
          l(n.next(u));
        } catch (f) {
          i(f);
        }
      }
      function c(u) {
        try {
          l(n.throw(u));
        } catch (f) {
          i(f);
        }
      }
      function l(u) {
        u.done ? a(u.value) : s(u.value).then(o, c);
      }
      l((n = n.apply(t, e || [])).next());
    });
  };
  class di {
    constructor(e, r = li) {
      ((this._value = e),
        (this._cancelError = r),
        (this._queue = []),
        (this._weightedWaiters = []));
    }
    acquire(e = 1, r = 0) {
      if (e <= 0) throw new Error(`invalid weight ${e}: must be positive`);
      return new Promise((n, s) => {
        const a = { resolve: n, reject: s, weight: e, priority: r },
          i = bn(this._queue, (o) => r <= o.priority);
        i === -1 && e <= this._value
          ? this._dispatchItem(a)
          : this._queue.splice(i + 1, 0, a);
      });
    }
    runExclusive(e) {
      return ui(this, arguments, void 0, function* (r, n = 1, s = 0) {
        const [a, i] = yield this.acquire(n, s);
        try {
          return yield r(a);
        } finally {
          i();
        }
      });
    }
    waitForUnlock(e = 1, r = 0) {
      if (e <= 0) throw new Error(`invalid weight ${e}: must be positive`);
      return this._couldLockImmediately(e, r)
        ? Promise.resolve()
        : new Promise((n) => {
            (this._weightedWaiters[e - 1] ||
              (this._weightedWaiters[e - 1] = []),
              pi(this._weightedWaiters[e - 1], { resolve: n, priority: r }));
          });
    }
    isLocked() {
      return this._value <= 0;
    }
    getValue() {
      return this._value;
    }
    setValue(e) {
      ((this._value = e), this._dispatchQueue());
    }
    release(e = 1) {
      if (e <= 0) throw new Error(`invalid weight ${e}: must be positive`);
      ((this._value += e), this._dispatchQueue());
    }
    cancel() {
      (this._queue.forEach((e) => e.reject(this._cancelError)),
        (this._queue = []));
    }
    _dispatchQueue() {
      for (
        this._drainUnlockWaiters();
        this._queue.length > 0 && this._queue[0].weight <= this._value;
      )
        (this._dispatchItem(this._queue.shift()), this._drainUnlockWaiters());
    }
    _dispatchItem(e) {
      const r = this._value;
      ((this._value -= e.weight), e.resolve([r, this._newReleaser(e.weight)]));
    }
    _newReleaser(e) {
      let r = !1;
      return () => {
        r || ((r = !0), this.release(e));
      };
    }
    _drainUnlockWaiters() {
      if (this._queue.length === 0)
        for (let e = this._value; e > 0; e--) {
          const r = this._weightedWaiters[e - 1];
          r &&
            (r.forEach((n) => n.resolve()),
            (this._weightedWaiters[e - 1] = []));
        }
      else {
        const e = this._queue[0].priority;
        for (let r = this._value; r > 0; r--) {
          const n = this._weightedWaiters[r - 1];
          if (!n) continue;
          const s = n.findIndex((a) => a.priority <= e);
          (s === -1 ? n : n.splice(0, s)).forEach((a) => a.resolve());
        }
      }
    }
    _couldLockImmediately(e, r) {
      return (
        (this._queue.length === 0 || this._queue[0].priority < r) &&
        e <= this._value
      );
    }
  }
  function pi(t, e) {
    const r = bn(t, (n) => e.priority <= n.priority);
    t.splice(r + 1, 0, e);
  }
  function bn(t, e) {
    for (let r = t.length - 1; r >= 0; r--) if (e(t[r])) return r;
    return -1;
  }
  var mi = function (t, e, r, n) {
    function s(a) {
      return a instanceof r
        ? a
        : new r(function (i) {
            i(a);
          });
    }
    return new (r || (r = Promise))(function (a, i) {
      function o(u) {
        try {
          l(n.next(u));
        } catch (f) {
          i(f);
        }
      }
      function c(u) {
        try {
          l(n.throw(u));
        } catch (f) {
          i(f);
        }
      }
      function l(u) {
        u.done ? a(u.value) : s(u.value).then(o, c);
      }
      l((n = n.apply(t, e || [])).next());
    });
  };
  class fi {
    constructor(e) {
      this._semaphore = new di(1, e);
    }
    acquire() {
      return mi(this, arguments, void 0, function* (e = 0) {
        const [, r] = yield this._semaphore.acquire(1, e);
        return r;
      });
    }
    runExclusive(e, r = 0) {
      return this._semaphore.runExclusive(() => e(), 1, r);
    }
    isLocked() {
      return this._semaphore.isLocked();
    }
    waitForUnlock(e = 0) {
      return this._semaphore.waitForUnlock(1, e);
    }
    release() {
      this._semaphore.isLocked() && this._semaphore.release();
    }
    cancel() {
      return this._semaphore.cancel();
    }
  }
  const qe = gi();
  function gi() {
    const t = {
        local: Mt("local"),
        session: Mt("session"),
        sync: Mt("sync"),
        managed: Mt("managed"),
      },
      e = (m) => {
        const p = t[m];
        if (p == null) {
          const d = Object.keys(t).join(", ");
          throw Error(`Invalid area "${m}". Options: ${d}`);
        }
        return p;
      },
      r = (m) => {
        const p = m.indexOf(":"),
          d = m.substring(0, p),
          g = m.substring(p + 1);
        if (g == null)
          throw Error(
            `Storage key should be in the form of "area:key", but received "${m}"`,
          );
        return { driverArea: d, driverKey: g, driver: e(d) };
      },
      n = (m) => m + "$",
      s = (m, p) => {
        const d = { ...m };
        return (
          Object.entries(p).forEach(([g, w]) => {
            w == null ? delete d[g] : (d[g] = w);
          }),
          d
        );
      },
      a = (m, p) => m ?? p ?? null,
      i = (m) => (typeof m == "object" && !Array.isArray(m) ? m : {}),
      o = async (m, p, d) => {
        const g = await m.getItem(p);
        return a(
          g,
          (d == null ? void 0 : d.fallback) ??
            (d == null ? void 0 : d.defaultValue),
        );
      },
      c = async (m, p) => {
        const d = n(p),
          g = await m.getItem(d);
        return i(g);
      },
      l = async (m, p, d) => {
        await m.setItem(p, d ?? null);
      },
      u = async (m, p, d) => {
        const g = n(p),
          w = i(await m.getItem(g));
        await m.setItem(g, s(w, d));
      },
      f = async (m, p, d) => {
        if ((await m.removeItem(p), d != null && d.removeMeta)) {
          const g = n(p);
          await m.removeItem(g);
        }
      },
      _ = async (m, p, d) => {
        const g = n(p);
        if (d == null) await m.removeItem(g);
        else {
          const w = i(await m.getItem(g));
          ([d].flat().forEach((x) => delete w[x]), await m.setItem(g, w));
        }
      },
      C = (m, p, d) => m.watch(p, d);
    return {
      getItem: async (m, p) => {
        const { driver: d, driverKey: g } = r(m);
        return await o(d, g, p);
      },
      getItems: async (m) => {
        const p = new Map(),
          d = new Map(),
          g = [];
        m.forEach((x) => {
          let T, $;
          (typeof x == "string"
            ? (T = x)
            : "getValue" in x
              ? ((T = x.key), ($ = { fallback: x.fallback }))
              : ((T = x.key), ($ = x.options)),
            g.push(T));
          const { driverArea: W, driverKey: v } = r(T),
            b = p.get(W) ?? [];
          (p.set(W, b.concat(v)), d.set(T, $));
        });
        const w = new Map();
        return (
          await Promise.all(
            Array.from(p.entries()).map(async ([x, T]) => {
              (await t[x].getItems(T)).forEach((W) => {
                const v = `${x}:${W.key}`,
                  b = d.get(v),
                  R = a(
                    W.value,
                    (b == null ? void 0 : b.fallback) ??
                      (b == null ? void 0 : b.defaultValue),
                  );
                w.set(v, R);
              });
            }),
          ),
          g.map((x) => ({ key: x, value: w.get(x) }))
        );
      },
      getMeta: async (m) => {
        const { driver: p, driverKey: d } = r(m);
        return await c(p, d);
      },
      getMetas: async (m) => {
        const p = m.map((w) => {
            const x = typeof w == "string" ? w : w.key,
              { driverArea: T, driverKey: $ } = r(x);
            return { key: x, driverArea: T, driverKey: $, driverMetaKey: n($) };
          }),
          d = p.reduce((w, x) => {
            var T;
            return (
              w[(T = x.driverArea)] ?? (w[T] = []),
              w[x.driverArea].push(x),
              w
            );
          }, {}),
          g = {};
        return (
          await Promise.all(
            Object.entries(d).map(async ([w, x]) => {
              const T = await he.storage[w].get(x.map(($) => $.driverMetaKey));
              x.forEach(($) => {
                g[$.key] = T[$.driverMetaKey] ?? {};
              });
            }),
          ),
          p.map((w) => ({ key: w.key, meta: g[w.key] }))
        );
      },
      setItem: async (m, p) => {
        const { driver: d, driverKey: g } = r(m);
        await l(d, g, p);
      },
      setItems: async (m) => {
        const p = {};
        (m.forEach((d) => {
          const { driverArea: g, driverKey: w } = r(
            "key" in d ? d.key : d.item.key,
          );
          (p[g] ?? (p[g] = []), p[g].push({ key: w, value: d.value }));
        }),
          await Promise.all(
            Object.entries(p).map(async ([d, g]) => {
              await e(d).setItems(g);
            }),
          ));
      },
      setMeta: async (m, p) => {
        const { driver: d, driverKey: g } = r(m);
        await u(d, g, p);
      },
      setMetas: async (m) => {
        const p = {};
        (m.forEach((d) => {
          const { driverArea: g, driverKey: w } = r(
            "key" in d ? d.key : d.item.key,
          );
          (p[g] ?? (p[g] = []), p[g].push({ key: w, properties: d.meta }));
        }),
          await Promise.all(
            Object.entries(p).map(async ([d, g]) => {
              const w = e(d),
                x = g.map(({ key: v }) => n(v)),
                T = await w.getItems(x),
                $ = Object.fromEntries(
                  T.map(({ key: v, value: b }) => [v, i(b)]),
                ),
                W = g.map(({ key: v, properties: b }) => {
                  const R = n(v);
                  return { key: R, value: s($[R] ?? {}, b) };
                });
              await w.setItems(W);
            }),
          ));
      },
      removeItem: async (m, p) => {
        const { driver: d, driverKey: g } = r(m);
        await f(d, g, p);
      },
      removeItems: async (m) => {
        const p = {};
        (m.forEach((d) => {
          let g, w;
          typeof d == "string"
            ? (g = d)
            : "getValue" in d
              ? (g = d.key)
              : "item" in d
                ? ((g = d.item.key), (w = d.options))
                : ((g = d.key), (w = d.options));
          const { driverArea: x, driverKey: T } = r(g);
          (p[x] ?? (p[x] = []),
            p[x].push(T),
            w != null && w.removeMeta && p[x].push(n(T)));
        }),
          await Promise.all(
            Object.entries(p).map(async ([d, g]) => {
              await e(d).removeItems(g);
            }),
          ));
      },
      clear: async (m) => {
        await e(m).clear();
      },
      removeMeta: async (m, p) => {
        const { driver: d, driverKey: g } = r(m);
        await _(d, g, p);
      },
      snapshot: async (m, p) => {
        var w;
        const g = await e(m).snapshot();
        return (
          (w = p == null ? void 0 : p.excludeKeys) == null ||
            w.forEach((x) => {
              (delete g[x], delete g[n(x)]);
            }),
          g
        );
      },
      restoreSnapshot: async (m, p) => {
        await e(m).restoreSnapshot(p);
      },
      watch: (m, p) => {
        const { driver: d, driverKey: g } = r(m);
        return C(d, g, p);
      },
      unwatch() {
        Object.values(t).forEach((m) => {
          m.unwatch();
        });
      },
      defineItem: (m, p) => {
        const { driver: d, driverKey: g } = r(m),
          {
            version: w = 1,
            migrations: x = {},
            onMigrationComplete: T,
            debug: $ = !1,
          } = p ?? {};
        if (w < 1)
          throw Error(
            "Storage item version cannot be less than 1. Initial versions should be set to 1, not 0.",
          );
        const W = async () => {
            var X;
            const B = n(g),
              [{ value: q }, { value: J }] = await d.getItems([g, B]);
            if (q == null) return;
            const j = (J == null ? void 0 : J.v) ?? 1;
            if (j > w)
              throw Error(
                `Version downgrade detected (v${j} -> v${w}) for "${m}"`,
              );
            if (j === w) return;
            const oe = Array.from({ length: w - j }, (ue, K) => j + K + 1);
            let Q = q;
            for (const ue of oe)
              try {
                Q =
                  (await ((X = x == null ? void 0 : x[ue]) == null
                    ? void 0
                    : X.call(x, Q))) ?? Q;
              } catch (K) {
                throw new hi(m, ue, { cause: K });
              }
            (await d.setItems([
              { key: g, value: Q },
              { key: B, value: { ...J, v: w } },
            ]),
              T == null || T(Q, w));
          },
          v =
            (p == null ? void 0 : p.migrations) == null
              ? Promise.resolve()
              : W().catch((B) => {}),
          b = new fi(),
          R = () =>
            (p == null ? void 0 : p.fallback) ??
            (p == null ? void 0 : p.defaultValue) ??
            null,
          F = () =>
            b.runExclusive(async () => {
              const B = await d.getItem(g);
              if (B != null || (p == null ? void 0 : p.init) == null) return B;
              const q = await p.init();
              return (await d.setItem(g, q), q);
            });
        return (
          v.then(F),
          {
            key: m,
            get defaultValue() {
              return R();
            },
            get fallback() {
              return R();
            },
            getValue: async () => (
              await v,
              p != null && p.init ? await F() : await o(d, g, p)
            ),
            getMeta: async () => (await v, await c(d, g)),
            setValue: async (B) => (await v, await l(d, g, B)),
            setMeta: async (B) => (await v, await u(d, g, B)),
            removeValue: async (B) => (await v, await f(d, g, B)),
            removeMeta: async (B) => (await v, await _(d, g, B)),
            watch: (B) => C(d, g, (q, J) => B(q ?? R(), J ?? R())),
            migrate: W,
          }
        );
      },
    };
  }
  function Mt(t) {
    const e = () => {
        if (he.runtime == null)
          throw Error(
            [
              "'wxt/storage' must be loaded in a web extension environment",
              `
 - If thrown during a build, see https://github.com/wxt-dev/wxt/issues/371`,
              ` - If thrown during tests, mock 'wxt/browser' correctly. See https://wxt.dev/guide/go-further/testing.html
`,
            ].join(`
`),
          );
        if (he.storage == null)
          throw Error(
            "You must add the 'storage' permission to your manifest to use 'wxt/storage'",
          );
        const n = he.storage[t];
        if (n == null) throw Error(`"browser.storage.${t}" is undefined`);
        return n;
      },
      r = new Set();
    return {
      getItem: async (n) => (await e().get(n))[n],
      getItems: async (n) => {
        const s = await e().get(n);
        return n.map((a) => ({ key: a, value: s[a] ?? null }));
      },
      setItem: async (n, s) => {
        s == null ? await e().remove(n) : await e().set({ [n]: s });
      },
      setItems: async (n) => {
        const s = n.reduce((a, { key: i, value: o }) => ((a[i] = o), a), {});
        await e().set(s);
      },
      removeItem: async (n) => {
        await e().remove(n);
      },
      removeItems: async (n) => {
        await e().remove(n);
      },
      clear: async () => {
        await e().clear();
      },
      snapshot: async () => await e().get(),
      restoreSnapshot: async (n) => {
        await e().set(n);
      },
      watch(n, s) {
        const a = (i) => {
          const o = i[n];
          o != null &&
            (vr(o.newValue, o.oldValue) ||
              s(o.newValue ?? null, o.oldValue ?? null));
        };
        return (
          e().onChanged.addListener(a),
          r.add(a),
          () => {
            (e().onChanged.removeListener(a), r.delete(a));
          }
        );
      },
      unwatch() {
        (r.forEach((n) => {
          e().onChanged.removeListener(n);
        }),
          r.clear());
      },
    };
  }
  class hi extends Error {
    constructor(e, r, n) {
      (super(`v${r} migration failed for "${e}"`, n),
        (this.key = e),
        (this.version = r));
    }
  }
  const yi = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  let wn = (t = 21) => {
    let e = "",
      r = crypto.getRandomValues(new Uint8Array((t |= 0)));
    for (; t--; ) e += yi[r[t] & 63];
    return e;
  };
  const ee = qe.defineItem("local:bookmarks", { fallback: [] }),
    ce = qe.defineItem("local:bookmarkContents", { fallback: {} }),
    Be = qe.defineItem("sync:categories", { fallback: [] });
  class vi {
    assembleBookmark(e, r) {
      return { ...e, content: r[e.id] };
    }
    separateBookmark(e) {
      const { content: r, ...n } = e;
      return { meta: n, content: r };
    }
    async getBookmarks(e, r = !1) {
      var c;
      const [n, s] = await Promise.all([
        ee.getValue(),
        r ? ce.getValue() : Promise.resolve({}),
      ]);
      let a = n.map((l) => this.assembleBookmark(l, s));
      if (
        ((e == null ? void 0 : e.isDeleted) === void 0
          ? (a = a.filter((l) => !l.isDeleted))
          : e.isDeleted === !0
            ? (a = a.filter((l) => l.isDeleted))
            : (a = a.filter((l) => !l.isDeleted)),
        (e == null ? void 0 : e.categoryId) !== void 0 &&
          (a = a.filter((l) => l.categoryId === e.categoryId)),
        (c = e == null ? void 0 : e.tags) != null &&
          c.length &&
          (a = a.filter((l) => e.tags.some((u) => l.tags.includes(u)))),
        e != null && e.search)
      ) {
        const l = e.search.toLowerCase();
        a = a.filter(
          (u) =>
            u.title.toLowerCase().includes(l) ||
            u.description.toLowerCase().includes(l) ||
            u.url.toLowerCase().includes(l) ||
            u.tags.some((f) => f.toLowerCase().includes(l)),
        );
      }
      const i = (e == null ? void 0 : e.sortBy) || "createdAt",
        o = (e == null ? void 0 : e.sortOrder) || "desc";
      return (
        a.sort((l, u) => {
          const f = l[i] || 0,
            _ = u[i] || 0;
          return o === "desc" ? _ - f : f - _;
        }),
        e != null && e.offset && (a = a.slice(e.offset)),
        e != null && e.limit && (a = a.slice(0, e.limit)),
        a
      );
    }
    async getBookmarkById(e) {
      const [r, n] = await Promise.all([ee.getValue(), ce.getValue()]),
        s = r.find((a) => a.id === e);
      return s ? this.assembleBookmark(s, n) : null;
    }
    async getBookmarkByUrl(e) {
      const [r, n] = await Promise.all([ee.getValue(), ce.getValue()]),
        s = this.normalizeUrl(e),
        a = r.find((i) => this.normalizeUrl(i.url) === s && !i.isDeleted);
      return a ? this.assembleBookmark(a, n) : null;
    }
    async createBookmark(e) {
      const r = await ee.getValue(),
        n = this.normalizeUrl(e.url);
      if (r.find((u) => this.normalizeUrl(u.url) === n && !u.isDeleted))
        throw new Error("该网址已收藏");
      const a = Date.now(),
        i = wn(),
        { content: o, ...c } = e,
        l = { ...c, id: i, createdAt: a, updatedAt: a };
      if ((await ee.setValue([...r, l]), o)) {
        const u = await ce.getValue();
        ((u[i] = o), await ce.setValue(u));
      }
      return { ...l, content: o };
    }
    async updateBookmark(e, r) {
      const n = await ee.getValue(),
        s = n.findIndex((l) => l.id === e);
      if (s === -1) throw new Error("书签不存在");
      const { content: a, ...i } = r,
        o = { ...n[s], ...i, updatedAt: Date.now() };
      if (((n[s] = o), await ee.setValue(n), a !== void 0)) {
        const l = await ce.getValue();
        (a ? (l[e] = a) : delete l[e], await ce.setValue(l));
      }
      const c = await ce.getValue();
      return this.assembleBookmark(o, c);
    }
    async deleteBookmark(e, r = !1) {
      const n = await ee.getValue();
      if (r) {
        await ee.setValue(n.filter((a) => a.id !== e));
        const s = await ce.getValue();
        (delete s[e], await ce.setValue(s));
      } else {
        const s = n.findIndex((a) => a.id === e);
        s !== -1 &&
          ((n[s].isDeleted = !0),
          (n[s].updatedAt = Date.now()),
          await ee.setValue(n));
      }
    }
    async restoreBookmark(e) {
      return this.updateBookmark(e, { isDeleted: !1 });
    }
    async getDeletedBookmarks() {
      return this.getBookmarks({ isDeleted: !0 });
    }
    async getCategories() {
      return Be.getValue();
    }
    async createCategory(e, r = null) {
      const n = await Be.getValue();
      if (n.some((a) => a.name === e && a.parentId === r))
        throw new Error("分类名称已存在");
      const s = {
        id: wn(),
        name: e,
        parentId: r,
        order: n.length,
        createdAt: Date.now(),
      };
      return (await Be.setValue([...n, s]), s);
    }
    async updateCategory(e, r) {
      const n = await Be.getValue(),
        s = n.findIndex((i) => i.id === e);
      if (s === -1) throw new Error("分类不存在");
      const a = { ...n[s], ...r };
      return ((n[s] = a), await Be.setValue(n), a);
    }
    async deleteCategory(e) {
      const [r, n] = await Promise.all([Be.getValue(), ee.getValue()]),
        s = n.map((a) =>
          a.categoryId === e
            ? { ...a, categoryId: null, updatedAt: Date.now() }
            : a,
        );
      await Promise.all([
        Be.setValue(r.filter((a) => a.id !== e)),
        ee.setValue(s),
      ]);
    }
    async getAllTags() {
      const e = await this.getBookmarks(),
        r = new Set();
      return (
        e.forEach((n) => n.tags.forEach((s) => r.add(s))),
        Array.from(r).sort()
      );
    }
    async batchDeleteBookmarks(e, r = !1) {
      let n = await ee.getValue();
      if (r) {
        ((n = n.filter((a) => !e.includes(a.id))), await ee.setValue(n));
        const s = await ce.getValue();
        (e.forEach((a) => delete s[a]), await ce.setValue(s));
      } else {
        const s = Date.now();
        ((n = n.map((a) =>
          e.includes(a.id) ? { ...a, isDeleted: !0, updatedAt: s } : a,
        )),
          await ee.setValue(n));
      }
    }
    async batchRestoreBookmarks(e) {
      const r = await ee.getValue(),
        n = Date.now(),
        s = r.map((a) =>
          e.includes(a.id) ? { ...a, isDeleted: !1, updatedAt: n } : a,
        );
      await ee.setValue(s);
    }
    async batchAddTags(e, r) {
      const n = await ee.getValue(),
        s = Date.now(),
        a = n.map((i) =>
          e.includes(i.id)
            ? { ...i, tags: [...new Set([...i.tags, ...r])], updatedAt: s }
            : i,
        );
      await ee.setValue(a);
    }
    async batchRemoveTags(e, r) {
      const n = await ee.getValue(),
        s = Date.now(),
        a = n.map((i) =>
          e.includes(i.id)
            ? { ...i, tags: i.tags.filter((o) => !r.includes(o)), updatedAt: s }
            : i,
        );
      await ee.setValue(a);
    }
    async batchChangeCategory(e, r) {
      const n = await ee.getValue(),
        s = Date.now(),
        a = n.map((i) =>
          e.includes(i.id) ? { ...i, categoryId: r, updatedAt: s } : i,
        );
      await ee.setValue(a);
    }
    async batchOperate(e) {
      const {
        operation: r,
        bookmarkIds: n,
        tags: s,
        categoryId: a,
        permanent: i,
      } = e;
      try {
        switch (r) {
          case "delete":
            await this.batchDeleteBookmarks(n, i);
            break;
          case "restore":
            await this.batchRestoreBookmarks(n);
            break;
          case "addTags":
            if (!s || s.length === 0)
              throw new Error("添加标签需要提供标签列表");
            await this.batchAddTags(n, s);
            break;
          case "removeTags":
            if (!s || s.length === 0)
              throw new Error("移除标签需要提供标签列表");
            await this.batchRemoveTags(n, s);
            break;
          case "changeCategory":
            await this.batchChangeCategory(n, a ?? null);
            break;
          default:
            throw new Error(`未知的操作类型: ${r}`);
        }
        return { success: n.length, failed: 0 };
      } catch (o) {
        return {
          success: 0,
          failed: n.length,
          errors: [o instanceof Error ? o.message : "批量操作失败"],
        };
      }
    }
    watchBookmarks(e) {
      return ee.watch(async (r) => {
        const s = (r ?? []).map((a) => ({ ...a, content: void 0 }));
        e(s);
      });
    }
    watchCategories(e) {
      return Be.watch((r) => {
        e(r ?? []);
      });
    }
    async getBookmarkContent(e) {
      return (await ce.getValue())[e];
    }
    async setBookmarkContent(e, r) {
      const n = await ce.getValue();
      ((n[e] = r), await ce.setValue(n));
    }
    async deleteBookmarkContent(e) {
      const r = await ce.getValue();
      (delete r[e], await ce.setValue(r));
    }
    normalizeUrl(e) {
      try {
        const r = new URL(e);
        return (
          [
            "utm_source",
            "utm_medium",
            "utm_campaign",
            "utm_term",
            "utm_content",
            "ref",
            "fbclid",
            "gclid",
          ].forEach((s) => r.searchParams.delete(s)),
          r.toString().replace(/\/$/, "")
        );
      } catch {
        return e;
      }
    }
  }
  const Le = new vi(),
    jt = {
      provider: "openai",
      apiKey: "",
      baseUrl: "",
      model: "gpt-3.5-turbo",
      temperature: 0.3,
      maxTokens: 1e3,
      enableTranslation: !1,
      enableSmartCategory: !0,
      enableTagSuggestion: !0,
      privacyDomains: [],
      autoDetectPrivacy: !0,
    },
    $t = {
      enabled: !1,
      provider: "openai",
      model: "text-embedding-3-small",
      batchSize: 16,
    },
    Dt = {
      autoSaveSnapshot: !0,
      defaultCategory: null,
      theme: "system",
      language: "zh",
      shortcut: "Ctrl+Shift+E",
      panelPosition: "left",
      panelShortcut: "Ctrl+Shift+B",
    },
    ct = qe.defineItem("sync:aiConfig", { fallback: jt }),
    lt = qe.defineItem("sync:settings", { fallback: Dt }),
    Re = qe.defineItem("sync:customFilters", { fallback: [] }),
    ut = qe.defineItem("sync:embeddingConfig", { fallback: $t });
  class _i {
    async getAIConfig() {
      return ct.getValue();
    }
    async setAIConfig(e) {
      const n = { ...(await ct.getValue()), ...e };
      return (await ct.setValue(n), n);
    }
    async getSettings() {
      return lt.getValue();
    }
    async setSettings(e) {
      const n = { ...(await lt.getValue()), ...e };
      return (await lt.setValue(n), n);
    }
    async resetAIConfig() {
      return (await ct.setValue(jt), jt);
    }
    async resetSettings() {
      return (await lt.setValue(Dt), Dt);
    }
    async getCustomFilters() {
      return Re.getValue();
    }
    async setCustomFilters(e) {
      await Re.setValue(e);
    }
    async addCustomFilter(e) {
      const r = await Re.getValue();
      (r.push(e), await Re.setValue(r));
    }
    async updateCustomFilter(e, r) {
      const n = await Re.getValue(),
        s = n.findIndex((a) => a.id === e);
      s !== -1 &&
        ((n[s] = { ...n[s], ...r, updatedAt: Date.now() }),
        await Re.setValue(n));
    }
    async deleteCustomFilter(e) {
      const n = (await Re.getValue()).filter((s) => s.id !== e);
      await Re.setValue(n);
    }
    async getEmbeddingConfig() {
      return ut.getValue();
    }
    async setEmbeddingConfig(e) {
      const n = { ...(await ut.getValue()), ...e };
      return (await ut.setValue(n), n);
    }
    async resetEmbeddingConfig() {
      return (await ut.setValue($t), $t);
    }
    watchAIConfig(e) {
      return ct.watch((r) => {
        e(r ?? jt);
      });
    }
    watchSettings(e) {
      return lt.watch((r) => {
        e(r ?? Dt);
      });
    }
    watchCustomFilters(e) {
      return Re.watch((r) => {
        e(r ?? []);
      });
    }
    watchEmbeddingConfig(e) {
      return ut.watch((r) => {
        e(r ?? $t);
      });
    }
  }
  const Fe = new _i(),
    kn = { debug: 0, info: 1, warn: 2, error: 3 },
    bi = {
      debug: "color:#999;",
      info: "color:#1677ff;",
      warn: "color:#faad14;",
      error: "color:#ff4d4f;font-weight:bold;",
    },
    wi =
      typeof process < "u" &&
      ((Da = process == null ? void 0 : process.env) == null
        ? void 0
        : Da.NODE_ENV) === "production";
  function ki() {
    const t = new Date(),
      e = String(t.getHours()).padStart(2, "0"),
      r = String(t.getMinutes()).padStart(2, "0"),
      n = String(t.getSeconds()).padStart(2, "0"),
      s = String(t.getMilliseconds()).padStart(3, "0");
    return `${e}:${r}:${n}.${s}`;
  }
  function Je(t = {}) {
    const { namespace: e = "app", enabled: r = !wi, minLevel: n = "debug" } = t,
      s = kn[n];
    function a(o) {
      if (!r || kn[o] < s) return () => {};
      const c = "color:#8c8c8c;",
        l = bi[o];
      return (console[o] || console.log).bind(
        console,
        `%c[${ki()}]%c[${e}][${o.toUpperCase()}]`,
        c,
        l,
      );
    }
    function i(o, c = {}) {
      return Je({
        namespace: `${e}:${o}`,
        enabled: c.enabled ?? r,
        minLevel: c.minLevel ?? n,
      });
    }
    return {
      get debug() {
        return a("debug");
      },
      get info() {
        return a("info");
      },
      get warn() {
        return a("warn");
      },
      get error() {
        return a("error");
      },
      child: i,
    };
  }
  const de = Je({ namespace: "VectorStore" }),
    xi = "HamHomeVectors",
    te = "bookmarkEmbeddings",
    Ai = 1;
  class Si {
    constructor() {
      we(this, "db", null);
      we(this, "initPromise", null);
    }
    async initDB() {
      return this.db
        ? this.db
        : this.initPromise
          ? (await this.initPromise, this.db)
          : ((this.initPromise = new Promise((e, r) => {
              const n = indexedDB.open(xi, Ai);
              ((n.onerror = () => {
                r(new Error("Failed to open VectorStore IndexedDB"));
              }),
                (n.onsuccess = (s) => {
                  ((this.db = s.target.result), e());
                }),
                (n.onupgradeneeded = (s) => {
                  const a = s.target.result;
                  if (!a.objectStoreNames.contains(te)) {
                    const i = a.createObjectStore(te, {
                      keyPath: "bookmarkId",
                    });
                    (i.createIndex("modelKey", "modelKey", { unique: !1 }),
                      i.createIndex("checksum", "checksum", { unique: !1 }),
                      i.createIndex(
                        "bookmarkId_modelKey",
                        ["bookmarkId", "modelKey"],
                        { unique: !0 },
                      ));
                  }
                }));
            })),
            await this.initPromise,
            this.db);
    }
    async saveEmbedding(e) {
      try {
        const s = (await this.initDB())
          .transaction(te, "readwrite")
          .objectStore(te)
          .put(e);
        return new Promise((a, i) => {
          ((s.onerror = () => {
            i(new Error("Failed to save embedding"));
          }),
            (s.onsuccess = () => {
              (de.debug("Saved embedding", {
                bookmarkId: e.bookmarkId,
                dim: e.dim,
              }),
                a());
            }));
        });
      } catch (r) {
        throw (de.error("Failed to save embedding", r), r);
      }
    }
    async saveEmbeddings(e) {
      if (e.length !== 0)
        try {
          const n = (await this.initDB()).transaction(te, "readwrite"),
            s = n.objectStore(te);
          return new Promise((a, i) => {
            ((n.onerror = () => {
              i(new Error("Failed to save embeddings batch"));
            }),
              (n.oncomplete = () => {
                (de.debug("Saved embeddings batch", { count: e.length }), a());
              }));
            for (const o of e) s.put(o);
          });
        } catch (r) {
          throw (de.error("Failed to save embeddings batch", r), r);
        }
    }
    async getEmbedding(e) {
      try {
        const s = (await this.initDB())
          .transaction(te, "readonly")
          .objectStore(te)
          .get(e);
        return new Promise((a, i) => {
          ((s.onerror = () => {
            i(new Error("Failed to get embedding"));
          }),
            (s.onsuccess = (o) => {
              const c = o.target.result;
              a(c ?? null);
            }));
        });
      } catch (r) {
        return (de.error("Failed to get embedding", r), null);
      }
    }
    async getEmbeddings(e) {
      const r = new Map();
      if (e.length === 0) return r;
      try {
        const s = (await this.initDB())
            .transaction(te, "readonly")
            .objectStore(te),
          a = e.map(
            (i) =>
              new Promise((o) => {
                const c = s.get(i);
                ((c.onsuccess = (l) => {
                  const u = l.target.result;
                  (u && r.set(i, u), o());
                }),
                  (c.onerror = () => o()));
              }),
          );
        return (await Promise.all(a), r);
      } catch (n) {
        return (de.error("Failed to get embeddings batch", n), r);
      }
    }
    async getEmbeddingsByModel(e) {
      try {
        const a = (await this.initDB())
          .transaction(te, "readonly")
          .objectStore(te)
          .index("modelKey")
          .getAll(e);
        return new Promise((i, o) => {
          ((a.onerror = () => {
            o(new Error("Failed to get embeddings by model"));
          }),
            (a.onsuccess = (c) => {
              const l = c.target.result;
              i(l);
            }));
        });
      } catch (r) {
        return (de.error("Failed to get embeddings by model", r), []);
      }
    }
    async getAllEmbeddings() {
      try {
        const n = (await this.initDB())
          .transaction(te, "readonly")
          .objectStore(te)
          .getAll();
        return new Promise((s, a) => {
          ((n.onerror = () => {
            a(new Error("Failed to get all embeddings"));
          }),
            (n.onsuccess = (i) => {
              const o = i.target.result;
              s(o);
            }));
        });
      } catch (e) {
        return (de.error("Failed to get all embeddings", e), []);
      }
    }
    async needsUpdate(e, r) {
      const n = await this.getEmbedding(e);
      return n ? n.checksum !== r : !0;
    }
    async deleteEmbedding(e) {
      try {
        const s = (await this.initDB())
          .transaction(te, "readwrite")
          .objectStore(te)
          .delete(e);
        return new Promise((a, i) => {
          ((s.onerror = () => {
            i(new Error("Failed to delete embedding"));
          }),
            (s.onsuccess = () => {
              (de.debug("Deleted embedding", { bookmarkId: e }), a());
            }));
        });
      } catch (r) {
        de.error("Failed to delete embedding", r);
      }
    }
    async deleteEmbeddings(e) {
      if (e.length !== 0)
        try {
          const n = (await this.initDB()).transaction(te, "readwrite"),
            s = n.objectStore(te);
          return new Promise((a, i) => {
            ((n.onerror = () => {
              i(new Error("Failed to delete embeddings batch"));
            }),
              (n.oncomplete = () => {
                (de.debug("Deleted embeddings batch", { count: e.length }),
                  a());
              }));
            for (const o of e) s.delete(o);
          });
        } catch (r) {
          de.error("Failed to delete embeddings batch", r);
        }
    }
    async deleteByModel(e) {
      try {
        const n = (await this.getEmbeddingsByModel(e)).map((s) => s.bookmarkId);
        return (await this.deleteEmbeddings(n), n.length);
      } catch (r) {
        return (de.error("Failed to delete by model", r), 0);
      }
    }
    async clearAll() {
      try {
        const n = (await this.initDB())
          .transaction(te, "readwrite")
          .objectStore(te)
          .clear();
        return new Promise((s, a) => {
          ((n.onerror = () => {
            a(new Error("Failed to clear all embeddings"));
          }),
            (n.onsuccess = () => {
              (de.info("Cleared all embeddings"), s());
            }));
        });
      } catch (e) {
        de.error("Failed to clear all embeddings", e);
      }
    }
    async getStats() {
      try {
        const r = (await this.initDB())
            .transaction(te, "readonly")
            .objectStore(te),
          n = await new Promise((i, o) => {
            const c = r.getAll();
            ((c.onerror = () => o(new Error("Failed to get stats"))),
              (c.onsuccess = (l) => {
                i(l.target.result);
              }));
          }),
          s = {};
        let a = 0;
        for (const i of n)
          ((s[i.modelKey] = (s[i.modelKey] || 0) + 1), (a += i.dim * 4 + 200));
        return { count: n.length, countByModel: s, estimatedSize: a };
      } catch (e) {
        return (
          de.error("Failed to get stats", e),
          { count: 0, countByModel: {}, estimatedSize: 0 }
        );
      }
    }
    async getMissingBookmarkIds(e) {
      const r = await this.getEmbeddings(e);
      return e.filter((n) => !r.has(n));
    }
  }
  const ke = new Si();
  var U;
  (function (t) {
    t.assertEqual = (s) => {};
    function e(s) {}
    t.assertIs = e;
    function r(s) {
      throw new Error();
    }
    ((t.assertNever = r),
      (t.arrayToEnum = (s) => {
        const a = {};
        for (const i of s) a[i] = i;
        return a;
      }),
      (t.getValidEnumValues = (s) => {
        const a = t.objectKeys(s).filter((o) => typeof s[s[o]] != "number"),
          i = {};
        for (const o of a) i[o] = s[o];
        return t.objectValues(i);
      }),
      (t.objectValues = (s) =>
        t.objectKeys(s).map(function (a) {
          return s[a];
        })),
      (t.objectKeys =
        typeof Object.keys == "function"
          ? (s) => Object.keys(s)
          : (s) => {
              const a = [];
              for (const i in s)
                Object.prototype.hasOwnProperty.call(s, i) && a.push(i);
              return a;
            }),
      (t.find = (s, a) => {
        for (const i of s) if (a(i)) return i;
      }),
      (t.isInteger =
        typeof Number.isInteger == "function"
          ? (s) => Number.isInteger(s)
          : (s) =>
              typeof s == "number" &&
              Number.isFinite(s) &&
              Math.floor(s) === s));
    function n(s, a = " | ") {
      return s.map((i) => (typeof i == "string" ? `'${i}'` : i)).join(a);
    }
    ((t.joinValues = n),
      (t.jsonStringifyReplacer = (s, a) =>
        typeof a == "bigint" ? a.toString() : a));
  })(U || (U = {}));
  var xn;
  (function (t) {
    t.mergeShapes = (e, r) => ({ ...e, ...r });
  })(xn || (xn = {}));
  const I = U.arrayToEnum([
      "string",
      "nan",
      "number",
      "integer",
      "float",
      "boolean",
      "date",
      "bigint",
      "symbol",
      "function",
      "undefined",
      "null",
      "array",
      "object",
      "unknown",
      "promise",
      "void",
      "never",
      "map",
      "set",
    ]),
    Ue = (t) => {
      switch (typeof t) {
        case "undefined":
          return I.undefined;
        case "string":
          return I.string;
        case "number":
          return Number.isNaN(t) ? I.nan : I.number;
        case "boolean":
          return I.boolean;
        case "function":
          return I.function;
        case "bigint":
          return I.bigint;
        case "symbol":
          return I.symbol;
        case "object":
          return Array.isArray(t)
            ? I.array
            : t === null
              ? I.null
              : t.then &&
                  typeof t.then == "function" &&
                  t.catch &&
                  typeof t.catch == "function"
                ? I.promise
                : typeof Map < "u" && t instanceof Map
                  ? I.map
                  : typeof Set < "u" && t instanceof Set
                    ? I.set
                    : typeof Date < "u" && t instanceof Date
                      ? I.date
                      : I.object;
        default:
          return I.unknown;
      }
    },
    k = U.arrayToEnum([
      "invalid_type",
      "invalid_literal",
      "custom",
      "invalid_union",
      "invalid_union_discriminator",
      "invalid_enum_value",
      "unrecognized_keys",
      "invalid_arguments",
      "invalid_return_type",
      "invalid_date",
      "invalid_string",
      "too_small",
      "too_big",
      "invalid_intersection_types",
      "not_multiple_of",
      "not_finite",
    ]);
  class Ne extends Error {
    get errors() {
      return this.issues;
    }
    constructor(e) {
      (super(),
        (this.issues = []),
        (this.addIssue = (n) => {
          this.issues = [...this.issues, n];
        }),
        (this.addIssues = (n = []) => {
          this.issues = [...this.issues, ...n];
        }));
      const r = new.target.prototype;
      (Object.setPrototypeOf
        ? Object.setPrototypeOf(this, r)
        : (this.__proto__ = r),
        (this.name = "ZodError"),
        (this.issues = e));
    }
    format(e) {
      const r =
          e ||
          function (a) {
            return a.message;
          },
        n = { _errors: [] },
        s = (a) => {
          for (const i of a.issues)
            if (i.code === "invalid_union") i.unionErrors.map(s);
            else if (i.code === "invalid_return_type") s(i.returnTypeError);
            else if (i.code === "invalid_arguments") s(i.argumentsError);
            else if (i.path.length === 0) n._errors.push(r(i));
            else {
              let o = n,
                c = 0;
              for (; c < i.path.length; ) {
                const l = i.path[c];
                (c === i.path.length - 1
                  ? ((o[l] = o[l] || { _errors: [] }), o[l]._errors.push(r(i)))
                  : (o[l] = o[l] || { _errors: [] }),
                  (o = o[l]),
                  c++);
              }
            }
        };
      return (s(this), n);
    }
    static assert(e) {
      if (!(e instanceof Ne)) throw new Error(`Not a ZodError: ${e}`);
    }
    toString() {
      return this.message;
    }
    get message() {
      return JSON.stringify(this.issues, U.jsonStringifyReplacer, 2);
    }
    get isEmpty() {
      return this.issues.length === 0;
    }
    flatten(e = (r) => r.message) {
      const r = {},
        n = [];
      for (const s of this.issues)
        if (s.path.length > 0) {
          const a = s.path[0];
          ((r[a] = r[a] || []), r[a].push(e(s)));
        } else n.push(e(s));
      return { formErrors: n, fieldErrors: r };
    }
    get formErrors() {
      return this.flatten();
    }
  }
  Ne.create = (t) => new Ne(t);
  const _r = (t, e) => {
    let r;
    switch (t.code) {
      case k.invalid_type:
        t.received === I.undefined
          ? (r = "Required")
          : (r = `Expected ${t.expected}, received ${t.received}`);
        break;
      case k.invalid_literal:
        r = `Invalid literal value, expected ${JSON.stringify(t.expected, U.jsonStringifyReplacer)}`;
        break;
      case k.unrecognized_keys:
        r = `Unrecognized key(s) in object: ${U.joinValues(t.keys, ", ")}`;
        break;
      case k.invalid_union:
        r = "Invalid input";
        break;
      case k.invalid_union_discriminator:
        r = `Invalid discriminator value. Expected ${U.joinValues(t.options)}`;
        break;
      case k.invalid_enum_value:
        r = `Invalid enum value. Expected ${U.joinValues(t.options)}, received '${t.received}'`;
        break;
      case k.invalid_arguments:
        r = "Invalid function arguments";
        break;
      case k.invalid_return_type:
        r = "Invalid function return type";
        break;
      case k.invalid_date:
        r = "Invalid date";
        break;
      case k.invalid_string:
        typeof t.validation == "object"
          ? "includes" in t.validation
            ? ((r = `Invalid input: must include "${t.validation.includes}"`),
              typeof t.validation.position == "number" &&
                (r = `${r} at one or more positions greater than or equal to ${t.validation.position}`))
            : "startsWith" in t.validation
              ? (r = `Invalid input: must start with "${t.validation.startsWith}"`)
              : "endsWith" in t.validation
                ? (r = `Invalid input: must end with "${t.validation.endsWith}"`)
                : U.assertNever(t.validation)
          : t.validation !== "regex"
            ? (r = `Invalid ${t.validation}`)
            : (r = "Invalid");
        break;
      case k.too_small:
        t.type === "array"
          ? (r = `Array must contain ${t.exact ? "exactly" : t.inclusive ? "at least" : "more than"} ${t.minimum} element(s)`)
          : t.type === "string"
            ? (r = `String must contain ${t.exact ? "exactly" : t.inclusive ? "at least" : "over"} ${t.minimum} character(s)`)
            : t.type === "number"
              ? (r = `Number must be ${t.exact ? "exactly equal to " : t.inclusive ? "greater than or equal to " : "greater than "}${t.minimum}`)
              : t.type === "bigint"
                ? (r = `Number must be ${t.exact ? "exactly equal to " : t.inclusive ? "greater than or equal to " : "greater than "}${t.minimum}`)
                : t.type === "date"
                  ? (r = `Date must be ${t.exact ? "exactly equal to " : t.inclusive ? "greater than or equal to " : "greater than "}${new Date(Number(t.minimum))}`)
                  : (r = "Invalid input");
        break;
      case k.too_big:
        t.type === "array"
          ? (r = `Array must contain ${t.exact ? "exactly" : t.inclusive ? "at most" : "less than"} ${t.maximum} element(s)`)
          : t.type === "string"
            ? (r = `String must contain ${t.exact ? "exactly" : t.inclusive ? "at most" : "under"} ${t.maximum} character(s)`)
            : t.type === "number"
              ? (r = `Number must be ${t.exact ? "exactly" : t.inclusive ? "less than or equal to" : "less than"} ${t.maximum}`)
              : t.type === "bigint"
                ? (r = `BigInt must be ${t.exact ? "exactly" : t.inclusive ? "less than or equal to" : "less than"} ${t.maximum}`)
                : t.type === "date"
                  ? (r = `Date must be ${t.exact ? "exactly" : t.inclusive ? "smaller than or equal to" : "smaller than"} ${new Date(Number(t.maximum))}`)
                  : (r = "Invalid input");
        break;
      case k.custom:
        r = "Invalid input";
        break;
      case k.invalid_intersection_types:
        r = "Intersection results could not be merged";
        break;
      case k.not_multiple_of:
        r = `Number must be a multiple of ${t.multipleOf}`;
        break;
      case k.not_finite:
        r = "Number must be finite";
        break;
      default:
        ((r = e.defaultError), U.assertNever(t));
    }
    return { message: r };
  };
  let Ei = _r;
  function Ii() {
    return Ei;
  }
  const Ti = (t) => {
    const { data: e, path: r, errorMaps: n, issueData: s } = t,
      a = [...r, ...(s.path || [])],
      i = { ...s, path: a };
    if (s.message !== void 0) return { ...s, path: a, message: s.message };
    let o = "";
    const c = n
      .filter((l) => !!l)
      .slice()
      .reverse();
    for (const l of c) o = l(i, { data: e, defaultError: o }).message;
    return { ...s, path: a, message: o };
  };
  function E(t, e) {
    const r = Ii(),
      n = Ti({
        issueData: e,
        data: t.data,
        path: t.path,
        errorMaps: [
          t.common.contextualErrorMap,
          t.schemaErrorMap,
          r,
          r === _r ? void 0 : _r,
        ].filter((s) => !!s),
      });
    t.common.issues.push(n);
  }
  class me {
    constructor() {
      this.value = "valid";
    }
    dirty() {
      this.value === "valid" && (this.value = "dirty");
    }
    abort() {
      this.value !== "aborted" && (this.value = "aborted");
    }
    static mergeArray(e, r) {
      const n = [];
      for (const s of r) {
        if (s.status === "aborted") return N;
        (s.status === "dirty" && e.dirty(), n.push(s.value));
      }
      return { status: e.value, value: n };
    }
    static async mergeObjectAsync(e, r) {
      const n = [];
      for (const s of r) {
        const a = await s.key,
          i = await s.value;
        n.push({ key: a, value: i });
      }
      return me.mergeObjectSync(e, n);
    }
    static mergeObjectSync(e, r) {
      const n = {};
      for (const s of r) {
        const { key: a, value: i } = s;
        if (a.status === "aborted" || i.status === "aborted") return N;
        (a.status === "dirty" && e.dirty(),
          i.status === "dirty" && e.dirty(),
          a.value !== "__proto__" &&
            (typeof i.value < "u" || s.alwaysSet) &&
            (n[a.value] = i.value));
      }
      return { status: e.value, value: n };
    }
  }
  const N = Object.freeze({ status: "aborted" }),
    dt = (t) => ({ status: "dirty", value: t }),
    be = (t) => ({ status: "valid", value: t }),
    An = (t) => t.status === "aborted",
    Sn = (t) => t.status === "dirty",
    rt = (t) => t.status === "valid",
    Vt = (t) => typeof Promise < "u" && t instanceof Promise;
  var O;
  (function (t) {
    ((t.errToObj = (e) => (typeof e == "string" ? { message: e } : e || {})),
      (t.toString = (e) =>
        typeof e == "string" ? e : e == null ? void 0 : e.message));
  })(O || (O = {}));
  class Ee {
    constructor(e, r, n, s) {
      ((this._cachedPath = []),
        (this.parent = e),
        (this.data = r),
        (this._path = n),
        (this._key = s));
    }
    get path() {
      return (
        this._cachedPath.length ||
          (Array.isArray(this._key)
            ? this._cachedPath.push(...this._path, ...this._key)
            : this._cachedPath.push(...this._path, this._key)),
        this._cachedPath
      );
    }
  }
  const En = (t, e) => {
    if (rt(e)) return { success: !0, data: e.value };
    if (!t.common.issues.length)
      throw new Error("Validation failed but no issues detected.");
    return {
      success: !1,
      get error() {
        if (this._error) return this._error;
        const r = new Ne(t.common.issues);
        return ((this._error = r), this._error);
      },
    };
  };
  function D(t) {
    if (!t) return {};
    const {
      errorMap: e,
      invalid_type_error: r,
      required_error: n,
      description: s,
    } = t;
    if (e && (r || n))
      throw new Error(
        `Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`,
      );
    return e
      ? { errorMap: e, description: s }
      : {
          errorMap: (i, o) => {
            const { message: c } = t;
            return i.code === "invalid_enum_value"
              ? { message: c ?? o.defaultError }
              : typeof o.data > "u"
                ? { message: c ?? n ?? o.defaultError }
                : i.code !== "invalid_type"
                  ? { message: o.defaultError }
                  : { message: c ?? r ?? o.defaultError };
          },
          description: s,
        };
  }
  class L {
    get description() {
      return this._def.description;
    }
    _getType(e) {
      return Ue(e.data);
    }
    _getOrReturnCtx(e, r) {
      return (
        r || {
          common: e.parent.common,
          data: e.data,
          parsedType: Ue(e.data),
          schemaErrorMap: this._def.errorMap,
          path: e.path,
          parent: e.parent,
        }
      );
    }
    _processInputParams(e) {
      return {
        status: new me(),
        ctx: {
          common: e.parent.common,
          data: e.data,
          parsedType: Ue(e.data),
          schemaErrorMap: this._def.errorMap,
          path: e.path,
          parent: e.parent,
        },
      };
    }
    _parseSync(e) {
      const r = this._parse(e);
      if (Vt(r)) throw new Error("Synchronous parse encountered promise.");
      return r;
    }
    _parseAsync(e) {
      const r = this._parse(e);
      return Promise.resolve(r);
    }
    parse(e, r) {
      const n = this.safeParse(e, r);
      if (n.success) return n.data;
      throw n.error;
    }
    safeParse(e, r) {
      const n = {
          common: {
            issues: [],
            async: (r == null ? void 0 : r.async) ?? !1,
            contextualErrorMap: r == null ? void 0 : r.errorMap,
          },
          path: (r == null ? void 0 : r.path) || [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data: e,
          parsedType: Ue(e),
        },
        s = this._parseSync({ data: e, path: n.path, parent: n });
      return En(n, s);
    }
    "~validate"(e) {
      var n, s;
      const r = {
        common: { issues: [], async: !!this["~standard"].async },
        path: [],
        schemaErrorMap: this._def.errorMap,
        parent: null,
        data: e,
        parsedType: Ue(e),
      };
      if (!this["~standard"].async)
        try {
          const a = this._parseSync({ data: e, path: [], parent: r });
          return rt(a) ? { value: a.value } : { issues: r.common.issues };
        } catch (a) {
          ((s =
            (n = a == null ? void 0 : a.message) == null
              ? void 0
              : n.toLowerCase()) != null &&
            s.includes("encountered") &&
            (this["~standard"].async = !0),
            (r.common = { issues: [], async: !0 }));
        }
      return this._parseAsync({ data: e, path: [], parent: r }).then((a) =>
        rt(a) ? { value: a.value } : { issues: r.common.issues },
      );
    }
    async parseAsync(e, r) {
      const n = await this.safeParseAsync(e, r);
      if (n.success) return n.data;
      throw n.error;
    }
    async safeParseAsync(e, r) {
      const n = {
          common: {
            issues: [],
            contextualErrorMap: r == null ? void 0 : r.errorMap,
            async: !0,
          },
          path: (r == null ? void 0 : r.path) || [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data: e,
          parsedType: Ue(e),
        },
        s = this._parse({ data: e, path: n.path, parent: n }),
        a = await (Vt(s) ? s : Promise.resolve(s));
      return En(n, a);
    }
    refine(e, r) {
      const n = (s) =>
        typeof r == "string" || typeof r > "u"
          ? { message: r }
          : typeof r == "function"
            ? r(s)
            : r;
      return this._refinement((s, a) => {
        const i = e(s),
          o = () => a.addIssue({ code: k.custom, ...n(s) });
        return typeof Promise < "u" && i instanceof Promise
          ? i.then((c) => (c ? !0 : (o(), !1)))
          : i
            ? !0
            : (o(), !1);
      });
    }
    refinement(e, r) {
      return this._refinement((n, s) =>
        e(n) ? !0 : (s.addIssue(typeof r == "function" ? r(n, s) : r), !1),
      );
    }
    _refinement(e) {
      return new We({
        schema: this,
        typeName: A.ZodEffects,
        effect: { type: "refinement", refinement: e },
      });
    }
    superRefine(e) {
      return this._refinement(e);
    }
    constructor(e) {
      ((this.spa = this.safeParseAsync),
        (this._def = e),
        (this.parse = this.parse.bind(this)),
        (this.safeParse = this.safeParse.bind(this)),
        (this.parseAsync = this.parseAsync.bind(this)),
        (this.safeParseAsync = this.safeParseAsync.bind(this)),
        (this.spa = this.spa.bind(this)),
        (this.refine = this.refine.bind(this)),
        (this.refinement = this.refinement.bind(this)),
        (this.superRefine = this.superRefine.bind(this)),
        (this.optional = this.optional.bind(this)),
        (this.nullable = this.nullable.bind(this)),
        (this.nullish = this.nullish.bind(this)),
        (this.array = this.array.bind(this)),
        (this.promise = this.promise.bind(this)),
        (this.or = this.or.bind(this)),
        (this.and = this.and.bind(this)),
        (this.transform = this.transform.bind(this)),
        (this.brand = this.brand.bind(this)),
        (this.default = this.default.bind(this)),
        (this.catch = this.catch.bind(this)),
        (this.describe = this.describe.bind(this)),
        (this.pipe = this.pipe.bind(this)),
        (this.readonly = this.readonly.bind(this)),
        (this.isNullable = this.isNullable.bind(this)),
        (this.isOptional = this.isOptional.bind(this)),
        (this["~standard"] = {
          version: 1,
          vendor: "zod",
          validate: (r) => this["~validate"](r),
        }));
    }
    optional() {
      return $e.create(this, this._def);
    }
    nullable() {
      return He.create(this, this._def);
    }
    nullish() {
      return this.nullable().optional();
    }
    array() {
      return Ie.create(this);
    }
    promise() {
      return Jt.create(this, this._def);
    }
    or(e) {
      return Ft.create([this, e], this._def);
    }
    and(e) {
      return Ut.create(this, e, this._def);
    }
    transform(e) {
      return new We({
        ...D(this._def),
        schema: this,
        typeName: A.ZodEffects,
        effect: { type: "transform", transform: e },
      });
    }
    default(e) {
      const r = typeof e == "function" ? e : () => e;
      return new Kt({
        ...D(this._def),
        innerType: this,
        defaultValue: r,
        typeName: A.ZodDefault,
      });
    }
    brand() {
      return new Mn({ typeName: A.ZodBranded, type: this, ...D(this._def) });
    }
    catch(e) {
      const r = typeof e == "function" ? e : () => e;
      return new Gt({
        ...D(this._def),
        innerType: this,
        catchValue: r,
        typeName: A.ZodCatch,
      });
    }
    describe(e) {
      const r = this.constructor;
      return new r({ ...this._def, description: e });
    }
    pipe(e) {
      return Ir.create(this, e);
    }
    readonly() {
      return Wt.create(this);
    }
    isOptional() {
      return this.safeParse(void 0).success;
    }
    isNullable() {
      return this.safeParse(null).success;
    }
  }
  const Ci = /^c[^\s-]{8,}$/i,
    Oi = /^[0-9a-z]+$/,
    Pi = /^[0-9A-HJKMNP-TV-Z]{26}$/i,
    Ri =
      /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i,
    Ni = /^[a-z0-9_-]{21}$/i,
    Mi = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/,
    ji =
      /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/,
    $i =
      /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i,
    Di = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
  let br;
  const Vi =
      /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,
    Bi =
      /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/,
    Li =
      /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/,
    Fi =
      /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,
    Ui = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/,
    Zi =
      /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/,
    In =
      "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))",
    zi = new RegExp(`^${In}$`);
  function Tn(t) {
    let e = "[0-5]\\d";
    t.precision
      ? (e = `${e}\\.\\d{${t.precision}}`)
      : t.precision == null && (e = `${e}(\\.\\d+)?`);
    const r = t.precision ? "+" : "?";
    return `([01]\\d|2[0-3]):[0-5]\\d(:${e})${r}`;
  }
  function qi(t) {
    return new RegExp(`^${Tn(t)}$`);
  }
  function Ji(t) {
    let e = `${In}T${Tn(t)}`;
    const r = [];
    return (
      r.push(t.local ? "Z?" : "Z"),
      t.offset && r.push("([+-]\\d{2}:?\\d{2})"),
      (e = `${e}(${r.join("|")})`),
      new RegExp(`^${e}$`)
    );
  }
  function Ki(t, e) {
    return !!(
      ((e === "v4" || !e) && Vi.test(t)) ||
      ((e === "v6" || !e) && Li.test(t))
    );
  }
  function Gi(t, e) {
    if (!Mi.test(t)) return !1;
    try {
      const [r] = t.split(".");
      if (!r) return !1;
      const n = r
          .replace(/-/g, "+")
          .replace(/_/g, "/")
          .padEnd(r.length + ((4 - (r.length % 4)) % 4), "="),
        s = JSON.parse(atob(n));
      return !(
        typeof s != "object" ||
        s === null ||
        ("typ" in s && (s == null ? void 0 : s.typ) !== "JWT") ||
        !s.alg ||
        (e && s.alg !== e)
      );
    } catch {
      return !1;
    }
  }
  function Wi(t, e) {
    return !!(
      ((e === "v4" || !e) && Bi.test(t)) ||
      ((e === "v6" || !e) && Fi.test(t))
    );
  }
  class Me extends L {
    _parse(e) {
      if (
        (this._def.coerce && (e.data = String(e.data)),
        this._getType(e) !== I.string)
      ) {
        const a = this._getOrReturnCtx(e);
        return (
          E(a, {
            code: k.invalid_type,
            expected: I.string,
            received: a.parsedType,
          }),
          N
        );
      }
      const n = new me();
      let s;
      for (const a of this._def.checks)
        if (a.kind === "min")
          e.data.length < a.value &&
            ((s = this._getOrReturnCtx(e, s)),
            E(s, {
              code: k.too_small,
              minimum: a.value,
              type: "string",
              inclusive: !0,
              exact: !1,
              message: a.message,
            }),
            n.dirty());
        else if (a.kind === "max")
          e.data.length > a.value &&
            ((s = this._getOrReturnCtx(e, s)),
            E(s, {
              code: k.too_big,
              maximum: a.value,
              type: "string",
              inclusive: !0,
              exact: !1,
              message: a.message,
            }),
            n.dirty());
        else if (a.kind === "length") {
          const i = e.data.length > a.value,
            o = e.data.length < a.value;
          (i || o) &&
            ((s = this._getOrReturnCtx(e, s)),
            i
              ? E(s, {
                  code: k.too_big,
                  maximum: a.value,
                  type: "string",
                  inclusive: !0,
                  exact: !0,
                  message: a.message,
                })
              : o &&
                E(s, {
                  code: k.too_small,
                  minimum: a.value,
                  type: "string",
                  inclusive: !0,
                  exact: !0,
                  message: a.message,
                }),
            n.dirty());
        } else if (a.kind === "email")
          $i.test(e.data) ||
            ((s = this._getOrReturnCtx(e, s)),
            E(s, {
              validation: "email",
              code: k.invalid_string,
              message: a.message,
            }),
            n.dirty());
        else if (a.kind === "emoji")
          (br || (br = new RegExp(Di, "u")),
            br.test(e.data) ||
              ((s = this._getOrReturnCtx(e, s)),
              E(s, {
                validation: "emoji",
                code: k.invalid_string,
                message: a.message,
              }),
              n.dirty()));
        else if (a.kind === "uuid")
          Ri.test(e.data) ||
            ((s = this._getOrReturnCtx(e, s)),
            E(s, {
              validation: "uuid",
              code: k.invalid_string,
              message: a.message,
            }),
            n.dirty());
        else if (a.kind === "nanoid")
          Ni.test(e.data) ||
            ((s = this._getOrReturnCtx(e, s)),
            E(s, {
              validation: "nanoid",
              code: k.invalid_string,
              message: a.message,
            }),
            n.dirty());
        else if (a.kind === "cuid")
          Ci.test(e.data) ||
            ((s = this._getOrReturnCtx(e, s)),
            E(s, {
              validation: "cuid",
              code: k.invalid_string,
              message: a.message,
            }),
            n.dirty());
        else if (a.kind === "cuid2")
          Oi.test(e.data) ||
            ((s = this._getOrReturnCtx(e, s)),
            E(s, {
              validation: "cuid2",
              code: k.invalid_string,
              message: a.message,
            }),
            n.dirty());
        else if (a.kind === "ulid")
          Pi.test(e.data) ||
            ((s = this._getOrReturnCtx(e, s)),
            E(s, {
              validation: "ulid",
              code: k.invalid_string,
              message: a.message,
            }),
            n.dirty());
        else if (a.kind === "url")
          try {
            new URL(e.data);
          } catch {
            ((s = this._getOrReturnCtx(e, s)),
              E(s, {
                validation: "url",
                code: k.invalid_string,
                message: a.message,
              }),
              n.dirty());
          }
        else
          a.kind === "regex"
            ? ((a.regex.lastIndex = 0),
              a.regex.test(e.data) ||
                ((s = this._getOrReturnCtx(e, s)),
                E(s, {
                  validation: "regex",
                  code: k.invalid_string,
                  message: a.message,
                }),
                n.dirty()))
            : a.kind === "trim"
              ? (e.data = e.data.trim())
              : a.kind === "includes"
                ? e.data.includes(a.value, a.position) ||
                  ((s = this._getOrReturnCtx(e, s)),
                  E(s, {
                    code: k.invalid_string,
                    validation: { includes: a.value, position: a.position },
                    message: a.message,
                  }),
                  n.dirty())
                : a.kind === "toLowerCase"
                  ? (e.data = e.data.toLowerCase())
                  : a.kind === "toUpperCase"
                    ? (e.data = e.data.toUpperCase())
                    : a.kind === "startsWith"
                      ? e.data.startsWith(a.value) ||
                        ((s = this._getOrReturnCtx(e, s)),
                        E(s, {
                          code: k.invalid_string,
                          validation: { startsWith: a.value },
                          message: a.message,
                        }),
                        n.dirty())
                      : a.kind === "endsWith"
                        ? e.data.endsWith(a.value) ||
                          ((s = this._getOrReturnCtx(e, s)),
                          E(s, {
                            code: k.invalid_string,
                            validation: { endsWith: a.value },
                            message: a.message,
                          }),
                          n.dirty())
                        : a.kind === "datetime"
                          ? Ji(a).test(e.data) ||
                            ((s = this._getOrReturnCtx(e, s)),
                            E(s, {
                              code: k.invalid_string,
                              validation: "datetime",
                              message: a.message,
                            }),
                            n.dirty())
                          : a.kind === "date"
                            ? zi.test(e.data) ||
                              ((s = this._getOrReturnCtx(e, s)),
                              E(s, {
                                code: k.invalid_string,
                                validation: "date",
                                message: a.message,
                              }),
                              n.dirty())
                            : a.kind === "time"
                              ? qi(a).test(e.data) ||
                                ((s = this._getOrReturnCtx(e, s)),
                                E(s, {
                                  code: k.invalid_string,
                                  validation: "time",
                                  message: a.message,
                                }),
                                n.dirty())
                              : a.kind === "duration"
                                ? ji.test(e.data) ||
                                  ((s = this._getOrReturnCtx(e, s)),
                                  E(s, {
                                    validation: "duration",
                                    code: k.invalid_string,
                                    message: a.message,
                                  }),
                                  n.dirty())
                                : a.kind === "ip"
                                  ? Ki(e.data, a.version) ||
                                    ((s = this._getOrReturnCtx(e, s)),
                                    E(s, {
                                      validation: "ip",
                                      code: k.invalid_string,
                                      message: a.message,
                                    }),
                                    n.dirty())
                                  : a.kind === "jwt"
                                    ? Gi(e.data, a.alg) ||
                                      ((s = this._getOrReturnCtx(e, s)),
                                      E(s, {
                                        validation: "jwt",
                                        code: k.invalid_string,
                                        message: a.message,
                                      }),
                                      n.dirty())
                                    : a.kind === "cidr"
                                      ? Wi(e.data, a.version) ||
                                        ((s = this._getOrReturnCtx(e, s)),
                                        E(s, {
                                          validation: "cidr",
                                          code: k.invalid_string,
                                          message: a.message,
                                        }),
                                        n.dirty())
                                      : a.kind === "base64"
                                        ? Ui.test(e.data) ||
                                          ((s = this._getOrReturnCtx(e, s)),
                                          E(s, {
                                            validation: "base64",
                                            code: k.invalid_string,
                                            message: a.message,
                                          }),
                                          n.dirty())
                                        : a.kind === "base64url"
                                          ? Zi.test(e.data) ||
                                            ((s = this._getOrReturnCtx(e, s)),
                                            E(s, {
                                              validation: "base64url",
                                              code: k.invalid_string,
                                              message: a.message,
                                            }),
                                            n.dirty())
                                          : U.assertNever(a);
      return { status: n.value, value: e.data };
    }
    _regex(e, r, n) {
      return this.refinement((s) => e.test(s), {
        validation: r,
        code: k.invalid_string,
        ...O.errToObj(n),
      });
    }
    _addCheck(e) {
      return new Me({ ...this._def, checks: [...this._def.checks, e] });
    }
    email(e) {
      return this._addCheck({ kind: "email", ...O.errToObj(e) });
    }
    url(e) {
      return this._addCheck({ kind: "url", ...O.errToObj(e) });
    }
    emoji(e) {
      return this._addCheck({ kind: "emoji", ...O.errToObj(e) });
    }
    uuid(e) {
      return this._addCheck({ kind: "uuid", ...O.errToObj(e) });
    }
    nanoid(e) {
      return this._addCheck({ kind: "nanoid", ...O.errToObj(e) });
    }
    cuid(e) {
      return this._addCheck({ kind: "cuid", ...O.errToObj(e) });
    }
    cuid2(e) {
      return this._addCheck({ kind: "cuid2", ...O.errToObj(e) });
    }
    ulid(e) {
      return this._addCheck({ kind: "ulid", ...O.errToObj(e) });
    }
    base64(e) {
      return this._addCheck({ kind: "base64", ...O.errToObj(e) });
    }
    base64url(e) {
      return this._addCheck({ kind: "base64url", ...O.errToObj(e) });
    }
    jwt(e) {
      return this._addCheck({ kind: "jwt", ...O.errToObj(e) });
    }
    ip(e) {
      return this._addCheck({ kind: "ip", ...O.errToObj(e) });
    }
    cidr(e) {
      return this._addCheck({ kind: "cidr", ...O.errToObj(e) });
    }
    datetime(e) {
      return typeof e == "string"
        ? this._addCheck({
            kind: "datetime",
            precision: null,
            offset: !1,
            local: !1,
            message: e,
          })
        : this._addCheck({
            kind: "datetime",
            precision:
              typeof (e == null ? void 0 : e.precision) > "u"
                ? null
                : e == null
                  ? void 0
                  : e.precision,
            offset: (e == null ? void 0 : e.offset) ?? !1,
            local: (e == null ? void 0 : e.local) ?? !1,
            ...O.errToObj(e == null ? void 0 : e.message),
          });
    }
    date(e) {
      return this._addCheck({ kind: "date", message: e });
    }
    time(e) {
      return typeof e == "string"
        ? this._addCheck({ kind: "time", precision: null, message: e })
        : this._addCheck({
            kind: "time",
            precision:
              typeof (e == null ? void 0 : e.precision) > "u"
                ? null
                : e == null
                  ? void 0
                  : e.precision,
            ...O.errToObj(e == null ? void 0 : e.message),
          });
    }
    duration(e) {
      return this._addCheck({ kind: "duration", ...O.errToObj(e) });
    }
    regex(e, r) {
      return this._addCheck({ kind: "regex", regex: e, ...O.errToObj(r) });
    }
    includes(e, r) {
      return this._addCheck({
        kind: "includes",
        value: e,
        position: r == null ? void 0 : r.position,
        ...O.errToObj(r == null ? void 0 : r.message),
      });
    }
    startsWith(e, r) {
      return this._addCheck({ kind: "startsWith", value: e, ...O.errToObj(r) });
    }
    endsWith(e, r) {
      return this._addCheck({ kind: "endsWith", value: e, ...O.errToObj(r) });
    }
    min(e, r) {
      return this._addCheck({ kind: "min", value: e, ...O.errToObj(r) });
    }
    max(e, r) {
      return this._addCheck({ kind: "max", value: e, ...O.errToObj(r) });
    }
    length(e, r) {
      return this._addCheck({ kind: "length", value: e, ...O.errToObj(r) });
    }
    nonempty(e) {
      return this.min(1, O.errToObj(e));
    }
    trim() {
      return new Me({
        ...this._def,
        checks: [...this._def.checks, { kind: "trim" }],
      });
    }
    toLowerCase() {
      return new Me({
        ...this._def,
        checks: [...this._def.checks, { kind: "toLowerCase" }],
      });
    }
    toUpperCase() {
      return new Me({
        ...this._def,
        checks: [...this._def.checks, { kind: "toUpperCase" }],
      });
    }
    get isDatetime() {
      return !!this._def.checks.find((e) => e.kind === "datetime");
    }
    get isDate() {
      return !!this._def.checks.find((e) => e.kind === "date");
    }
    get isTime() {
      return !!this._def.checks.find((e) => e.kind === "time");
    }
    get isDuration() {
      return !!this._def.checks.find((e) => e.kind === "duration");
    }
    get isEmail() {
      return !!this._def.checks.find((e) => e.kind === "email");
    }
    get isURL() {
      return !!this._def.checks.find((e) => e.kind === "url");
    }
    get isEmoji() {
      return !!this._def.checks.find((e) => e.kind === "emoji");
    }
    get isUUID() {
      return !!this._def.checks.find((e) => e.kind === "uuid");
    }
    get isNANOID() {
      return !!this._def.checks.find((e) => e.kind === "nanoid");
    }
    get isCUID() {
      return !!this._def.checks.find((e) => e.kind === "cuid");
    }
    get isCUID2() {
      return !!this._def.checks.find((e) => e.kind === "cuid2");
    }
    get isULID() {
      return !!this._def.checks.find((e) => e.kind === "ulid");
    }
    get isIP() {
      return !!this._def.checks.find((e) => e.kind === "ip");
    }
    get isCIDR() {
      return !!this._def.checks.find((e) => e.kind === "cidr");
    }
    get isBase64() {
      return !!this._def.checks.find((e) => e.kind === "base64");
    }
    get isBase64url() {
      return !!this._def.checks.find((e) => e.kind === "base64url");
    }
    get minLength() {
      let e = null;
      for (const r of this._def.checks)
        r.kind === "min" && (e === null || r.value > e) && (e = r.value);
      return e;
    }
    get maxLength() {
      let e = null;
      for (const r of this._def.checks)
        r.kind === "max" && (e === null || r.value < e) && (e = r.value);
      return e;
    }
  }
  Me.create = (t) =>
    new Me({
      checks: [],
      typeName: A.ZodString,
      coerce: (t == null ? void 0 : t.coerce) ?? !1,
      ...D(t),
    });
  function Hi(t, e) {
    const r = (t.toString().split(".")[1] || "").length,
      n = (e.toString().split(".")[1] || "").length,
      s = r > n ? r : n,
      a = Number.parseInt(t.toFixed(s).replace(".", "")),
      i = Number.parseInt(e.toFixed(s).replace(".", ""));
    return (a % i) / 10 ** s;
  }
  class nt extends L {
    constructor() {
      (super(...arguments),
        (this.min = this.gte),
        (this.max = this.lte),
        (this.step = this.multipleOf));
    }
    _parse(e) {
      if (
        (this._def.coerce && (e.data = Number(e.data)),
        this._getType(e) !== I.number)
      ) {
        const a = this._getOrReturnCtx(e);
        return (
          E(a, {
            code: k.invalid_type,
            expected: I.number,
            received: a.parsedType,
          }),
          N
        );
      }
      let n;
      const s = new me();
      for (const a of this._def.checks)
        a.kind === "int"
          ? U.isInteger(e.data) ||
            ((n = this._getOrReturnCtx(e, n)),
            E(n, {
              code: k.invalid_type,
              expected: "integer",
              received: "float",
              message: a.message,
            }),
            s.dirty())
          : a.kind === "min"
            ? (a.inclusive ? e.data < a.value : e.data <= a.value) &&
              ((n = this._getOrReturnCtx(e, n)),
              E(n, {
                code: k.too_small,
                minimum: a.value,
                type: "number",
                inclusive: a.inclusive,
                exact: !1,
                message: a.message,
              }),
              s.dirty())
            : a.kind === "max"
              ? (a.inclusive ? e.data > a.value : e.data >= a.value) &&
                ((n = this._getOrReturnCtx(e, n)),
                E(n, {
                  code: k.too_big,
                  maximum: a.value,
                  type: "number",
                  inclusive: a.inclusive,
                  exact: !1,
                  message: a.message,
                }),
                s.dirty())
              : a.kind === "multipleOf"
                ? Hi(e.data, a.value) !== 0 &&
                  ((n = this._getOrReturnCtx(e, n)),
                  E(n, {
                    code: k.not_multiple_of,
                    multipleOf: a.value,
                    message: a.message,
                  }),
                  s.dirty())
                : a.kind === "finite"
                  ? Number.isFinite(e.data) ||
                    ((n = this._getOrReturnCtx(e, n)),
                    E(n, { code: k.not_finite, message: a.message }),
                    s.dirty())
                  : U.assertNever(a);
      return { status: s.value, value: e.data };
    }
    gte(e, r) {
      return this.setLimit("min", e, !0, O.toString(r));
    }
    gt(e, r) {
      return this.setLimit("min", e, !1, O.toString(r));
    }
    lte(e, r) {
      return this.setLimit("max", e, !0, O.toString(r));
    }
    lt(e, r) {
      return this.setLimit("max", e, !1, O.toString(r));
    }
    setLimit(e, r, n, s) {
      return new nt({
        ...this._def,
        checks: [
          ...this._def.checks,
          { kind: e, value: r, inclusive: n, message: O.toString(s) },
        ],
      });
    }
    _addCheck(e) {
      return new nt({ ...this._def, checks: [...this._def.checks, e] });
    }
    int(e) {
      return this._addCheck({ kind: "int", message: O.toString(e) });
    }
    positive(e) {
      return this._addCheck({
        kind: "min",
        value: 0,
        inclusive: !1,
        message: O.toString(e),
      });
    }
    negative(e) {
      return this._addCheck({
        kind: "max",
        value: 0,
        inclusive: !1,
        message: O.toString(e),
      });
    }
    nonpositive(e) {
      return this._addCheck({
        kind: "max",
        value: 0,
        inclusive: !0,
        message: O.toString(e),
      });
    }
    nonnegative(e) {
      return this._addCheck({
        kind: "min",
        value: 0,
        inclusive: !0,
        message: O.toString(e),
      });
    }
    multipleOf(e, r) {
      return this._addCheck({
        kind: "multipleOf",
        value: e,
        message: O.toString(r),
      });
    }
    finite(e) {
      return this._addCheck({ kind: "finite", message: O.toString(e) });
    }
    safe(e) {
      return this._addCheck({
        kind: "min",
        inclusive: !0,
        value: Number.MIN_SAFE_INTEGER,
        message: O.toString(e),
      })._addCheck({
        kind: "max",
        inclusive: !0,
        value: Number.MAX_SAFE_INTEGER,
        message: O.toString(e),
      });
    }
    get minValue() {
      let e = null;
      for (const r of this._def.checks)
        r.kind === "min" && (e === null || r.value > e) && (e = r.value);
      return e;
    }
    get maxValue() {
      let e = null;
      for (const r of this._def.checks)
        r.kind === "max" && (e === null || r.value < e) && (e = r.value);
      return e;
    }
    get isInt() {
      return !!this._def.checks.find(
        (e) =>
          e.kind === "int" || (e.kind === "multipleOf" && U.isInteger(e.value)),
      );
    }
    get isFinite() {
      let e = null,
        r = null;
      for (const n of this._def.checks) {
        if (n.kind === "finite" || n.kind === "int" || n.kind === "multipleOf")
          return !0;
        n.kind === "min"
          ? (r === null || n.value > r) && (r = n.value)
          : n.kind === "max" && (e === null || n.value < e) && (e = n.value);
      }
      return Number.isFinite(r) && Number.isFinite(e);
    }
  }
  nt.create = (t) =>
    new nt({
      checks: [],
      typeName: A.ZodNumber,
      coerce: (t == null ? void 0 : t.coerce) || !1,
      ...D(t),
    });
  class pt extends L {
    constructor() {
      (super(...arguments), (this.min = this.gte), (this.max = this.lte));
    }
    _parse(e) {
      if (this._def.coerce)
        try {
          e.data = BigInt(e.data);
        } catch {
          return this._getInvalidInput(e);
        }
      if (this._getType(e) !== I.bigint) return this._getInvalidInput(e);
      let n;
      const s = new me();
      for (const a of this._def.checks)
        a.kind === "min"
          ? (a.inclusive ? e.data < a.value : e.data <= a.value) &&
            ((n = this._getOrReturnCtx(e, n)),
            E(n, {
              code: k.too_small,
              type: "bigint",
              minimum: a.value,
              inclusive: a.inclusive,
              message: a.message,
            }),
            s.dirty())
          : a.kind === "max"
            ? (a.inclusive ? e.data > a.value : e.data >= a.value) &&
              ((n = this._getOrReturnCtx(e, n)),
              E(n, {
                code: k.too_big,
                type: "bigint",
                maximum: a.value,
                inclusive: a.inclusive,
                message: a.message,
              }),
              s.dirty())
            : a.kind === "multipleOf"
              ? e.data % a.value !== BigInt(0) &&
                ((n = this._getOrReturnCtx(e, n)),
                E(n, {
                  code: k.not_multiple_of,
                  multipleOf: a.value,
                  message: a.message,
                }),
                s.dirty())
              : U.assertNever(a);
      return { status: s.value, value: e.data };
    }
    _getInvalidInput(e) {
      const r = this._getOrReturnCtx(e);
      return (
        E(r, {
          code: k.invalid_type,
          expected: I.bigint,
          received: r.parsedType,
        }),
        N
      );
    }
    gte(e, r) {
      return this.setLimit("min", e, !0, O.toString(r));
    }
    gt(e, r) {
      return this.setLimit("min", e, !1, O.toString(r));
    }
    lte(e, r) {
      return this.setLimit("max", e, !0, O.toString(r));
    }
    lt(e, r) {
      return this.setLimit("max", e, !1, O.toString(r));
    }
    setLimit(e, r, n, s) {
      return new pt({
        ...this._def,
        checks: [
          ...this._def.checks,
          { kind: e, value: r, inclusive: n, message: O.toString(s) },
        ],
      });
    }
    _addCheck(e) {
      return new pt({ ...this._def, checks: [...this._def.checks, e] });
    }
    positive(e) {
      return this._addCheck({
        kind: "min",
        value: BigInt(0),
        inclusive: !1,
        message: O.toString(e),
      });
    }
    negative(e) {
      return this._addCheck({
        kind: "max",
        value: BigInt(0),
        inclusive: !1,
        message: O.toString(e),
      });
    }
    nonpositive(e) {
      return this._addCheck({
        kind: "max",
        value: BigInt(0),
        inclusive: !0,
        message: O.toString(e),
      });
    }
    nonnegative(e) {
      return this._addCheck({
        kind: "min",
        value: BigInt(0),
        inclusive: !0,
        message: O.toString(e),
      });
    }
    multipleOf(e, r) {
      return this._addCheck({
        kind: "multipleOf",
        value: e,
        message: O.toString(r),
      });
    }
    get minValue() {
      let e = null;
      for (const r of this._def.checks)
        r.kind === "min" && (e === null || r.value > e) && (e = r.value);
      return e;
    }
    get maxValue() {
      let e = null;
      for (const r of this._def.checks)
        r.kind === "max" && (e === null || r.value < e) && (e = r.value);
      return e;
    }
  }
  pt.create = (t) =>
    new pt({
      checks: [],
      typeName: A.ZodBigInt,
      coerce: (t == null ? void 0 : t.coerce) ?? !1,
      ...D(t),
    });
  class wr extends L {
    _parse(e) {
      if (
        (this._def.coerce && (e.data = !!e.data),
        this._getType(e) !== I.boolean)
      ) {
        const n = this._getOrReturnCtx(e);
        return (
          E(n, {
            code: k.invalid_type,
            expected: I.boolean,
            received: n.parsedType,
          }),
          N
        );
      }
      return be(e.data);
    }
  }
  wr.create = (t) =>
    new wr({
      typeName: A.ZodBoolean,
      coerce: (t == null ? void 0 : t.coerce) || !1,
      ...D(t),
    });
  class Bt extends L {
    _parse(e) {
      if (
        (this._def.coerce && (e.data = new Date(e.data)),
        this._getType(e) !== I.date)
      ) {
        const a = this._getOrReturnCtx(e);
        return (
          E(a, {
            code: k.invalid_type,
            expected: I.date,
            received: a.parsedType,
          }),
          N
        );
      }
      if (Number.isNaN(e.data.getTime())) {
        const a = this._getOrReturnCtx(e);
        return (E(a, { code: k.invalid_date }), N);
      }
      const n = new me();
      let s;
      for (const a of this._def.checks)
        a.kind === "min"
          ? e.data.getTime() < a.value &&
            ((s = this._getOrReturnCtx(e, s)),
            E(s, {
              code: k.too_small,
              message: a.message,
              inclusive: !0,
              exact: !1,
              minimum: a.value,
              type: "date",
            }),
            n.dirty())
          : a.kind === "max"
            ? e.data.getTime() > a.value &&
              ((s = this._getOrReturnCtx(e, s)),
              E(s, {
                code: k.too_big,
                message: a.message,
                inclusive: !0,
                exact: !1,
                maximum: a.value,
                type: "date",
              }),
              n.dirty())
            : U.assertNever(a);
      return { status: n.value, value: new Date(e.data.getTime()) };
    }
    _addCheck(e) {
      return new Bt({ ...this._def, checks: [...this._def.checks, e] });
    }
    min(e, r) {
      return this._addCheck({
        kind: "min",
        value: e.getTime(),
        message: O.toString(r),
      });
    }
    max(e, r) {
      return this._addCheck({
        kind: "max",
        value: e.getTime(),
        message: O.toString(r),
      });
    }
    get minDate() {
      let e = null;
      for (const r of this._def.checks)
        r.kind === "min" && (e === null || r.value > e) && (e = r.value);
      return e != null ? new Date(e) : null;
    }
    get maxDate() {
      let e = null;
      for (const r of this._def.checks)
        r.kind === "max" && (e === null || r.value < e) && (e = r.value);
      return e != null ? new Date(e) : null;
    }
  }
  Bt.create = (t) =>
    new Bt({
      checks: [],
      coerce: (t == null ? void 0 : t.coerce) || !1,
      typeName: A.ZodDate,
      ...D(t),
    });
  class Cn extends L {
    _parse(e) {
      if (this._getType(e) !== I.symbol) {
        const n = this._getOrReturnCtx(e);
        return (
          E(n, {
            code: k.invalid_type,
            expected: I.symbol,
            received: n.parsedType,
          }),
          N
        );
      }
      return be(e.data);
    }
  }
  Cn.create = (t) => new Cn({ typeName: A.ZodSymbol, ...D(t) });
  class kr extends L {
    _parse(e) {
      if (this._getType(e) !== I.undefined) {
        const n = this._getOrReturnCtx(e);
        return (
          E(n, {
            code: k.invalid_type,
            expected: I.undefined,
            received: n.parsedType,
          }),
          N
        );
      }
      return be(e.data);
    }
  }
  kr.create = (t) => new kr({ typeName: A.ZodUndefined, ...D(t) });
  class Lt extends L {
    _parse(e) {
      if (this._getType(e) !== I.null) {
        const n = this._getOrReturnCtx(e);
        return (
          E(n, {
            code: k.invalid_type,
            expected: I.null,
            received: n.parsedType,
          }),
          N
        );
      }
      return be(e.data);
    }
  }
  Lt.create = (t) => new Lt({ typeName: A.ZodNull, ...D(t) });
  class mt extends L {
    constructor() {
      (super(...arguments), (this._any = !0));
    }
    _parse(e) {
      return be(e.data);
    }
  }
  mt.create = (t) => new mt({ typeName: A.ZodAny, ...D(t) });
  class xr extends L {
    constructor() {
      (super(...arguments), (this._unknown = !0));
    }
    _parse(e) {
      return be(e.data);
    }
  }
  xr.create = (t) => new xr({ typeName: A.ZodUnknown, ...D(t) });
  class Ze extends L {
    _parse(e) {
      const r = this._getOrReturnCtx(e);
      return (
        E(r, {
          code: k.invalid_type,
          expected: I.never,
          received: r.parsedType,
        }),
        N
      );
    }
  }
  Ze.create = (t) => new Ze({ typeName: A.ZodNever, ...D(t) });
  class On extends L {
    _parse(e) {
      if (this._getType(e) !== I.undefined) {
        const n = this._getOrReturnCtx(e);
        return (
          E(n, {
            code: k.invalid_type,
            expected: I.void,
            received: n.parsedType,
          }),
          N
        );
      }
      return be(e.data);
    }
  }
  On.create = (t) => new On({ typeName: A.ZodVoid, ...D(t) });
  class Ie extends L {
    _parse(e) {
      const { ctx: r, status: n } = this._processInputParams(e),
        s = this._def;
      if (r.parsedType !== I.array)
        return (
          E(r, {
            code: k.invalid_type,
            expected: I.array,
            received: r.parsedType,
          }),
          N
        );
      if (s.exactLength !== null) {
        const i = r.data.length > s.exactLength.value,
          o = r.data.length < s.exactLength.value;
        (i || o) &&
          (E(r, {
            code: i ? k.too_big : k.too_small,
            minimum: o ? s.exactLength.value : void 0,
            maximum: i ? s.exactLength.value : void 0,
            type: "array",
            inclusive: !0,
            exact: !0,
            message: s.exactLength.message,
          }),
          n.dirty());
      }
      if (
        (s.minLength !== null &&
          r.data.length < s.minLength.value &&
          (E(r, {
            code: k.too_small,
            minimum: s.minLength.value,
            type: "array",
            inclusive: !0,
            exact: !1,
            message: s.minLength.message,
          }),
          n.dirty()),
        s.maxLength !== null &&
          r.data.length > s.maxLength.value &&
          (E(r, {
            code: k.too_big,
            maximum: s.maxLength.value,
            type: "array",
            inclusive: !0,
            exact: !1,
            message: s.maxLength.message,
          }),
          n.dirty()),
        r.common.async)
      )
        return Promise.all(
          [...r.data].map((i, o) =>
            s.type._parseAsync(new Ee(r, i, r.path, o)),
          ),
        ).then((i) => me.mergeArray(n, i));
      const a = [...r.data].map((i, o) =>
        s.type._parseSync(new Ee(r, i, r.path, o)),
      );
      return me.mergeArray(n, a);
    }
    get element() {
      return this._def.type;
    }
    min(e, r) {
      return new Ie({
        ...this._def,
        minLength: { value: e, message: O.toString(r) },
      });
    }
    max(e, r) {
      return new Ie({
        ...this._def,
        maxLength: { value: e, message: O.toString(r) },
      });
    }
    length(e, r) {
      return new Ie({
        ...this._def,
        exactLength: { value: e, message: O.toString(r) },
      });
    }
    nonempty(e) {
      return this.min(1, e);
    }
  }
  Ie.create = (t, e) =>
    new Ie({
      type: t,
      minLength: null,
      maxLength: null,
      exactLength: null,
      typeName: A.ZodArray,
      ...D(e),
    });
  function st(t) {
    if (t instanceof ne) {
      const e = {};
      for (const r in t.shape) {
        const n = t.shape[r];
        e[r] = $e.create(st(n));
      }
      return new ne({ ...t._def, shape: () => e });
    } else
      return t instanceof Ie
        ? new Ie({ ...t._def, type: st(t.element) })
        : t instanceof $e
          ? $e.create(st(t.unwrap()))
          : t instanceof He
            ? He.create(st(t.unwrap()))
            : t instanceof Ke
              ? Ke.create(t.items.map((e) => st(e)))
              : t;
  }
  class ne extends L {
    constructor() {
      (super(...arguments),
        (this._cached = null),
        (this.nonstrict = this.passthrough),
        (this.augment = this.extend));
    }
    _getCached() {
      if (this._cached !== null) return this._cached;
      const e = this._def.shape(),
        r = U.objectKeys(e);
      return ((this._cached = { shape: e, keys: r }), this._cached);
    }
    _parse(e) {
      if (this._getType(e) !== I.object) {
        const l = this._getOrReturnCtx(e);
        return (
          E(l, {
            code: k.invalid_type,
            expected: I.object,
            received: l.parsedType,
          }),
          N
        );
      }
      const { status: n, ctx: s } = this._processInputParams(e),
        { shape: a, keys: i } = this._getCached(),
        o = [];
      if (
        !(this._def.catchall instanceof Ze && this._def.unknownKeys === "strip")
      )
        for (const l in s.data) i.includes(l) || o.push(l);
      const c = [];
      for (const l of i) {
        const u = a[l],
          f = s.data[l];
        c.push({
          key: { status: "valid", value: l },
          value: u._parse(new Ee(s, f, s.path, l)),
          alwaysSet: l in s.data,
        });
      }
      if (this._def.catchall instanceof Ze) {
        const l = this._def.unknownKeys;
        if (l === "passthrough")
          for (const u of o)
            c.push({
              key: { status: "valid", value: u },
              value: { status: "valid", value: s.data[u] },
            });
        else if (l === "strict")
          o.length > 0 &&
            (E(s, { code: k.unrecognized_keys, keys: o }), n.dirty());
        else if (l !== "strip")
          throw new Error(
            "Internal ZodObject error: invalid unknownKeys value.",
          );
      } else {
        const l = this._def.catchall;
        for (const u of o) {
          const f = s.data[u];
          c.push({
            key: { status: "valid", value: u },
            value: l._parse(new Ee(s, f, s.path, u)),
            alwaysSet: u in s.data,
          });
        }
      }
      return s.common.async
        ? Promise.resolve()
            .then(async () => {
              const l = [];
              for (const u of c) {
                const f = await u.key,
                  _ = await u.value;
                l.push({ key: f, value: _, alwaysSet: u.alwaysSet });
              }
              return l;
            })
            .then((l) => me.mergeObjectSync(n, l))
        : me.mergeObjectSync(n, c);
    }
    get shape() {
      return this._def.shape();
    }
    strict(e) {
      return (
        O.errToObj,
        new ne({
          ...this._def,
          unknownKeys: "strict",
          ...(e !== void 0
            ? {
                errorMap: (r, n) => {
                  var a, i;
                  const s =
                    ((i = (a = this._def).errorMap) == null
                      ? void 0
                      : i.call(a, r, n).message) ?? n.defaultError;
                  return r.code === "unrecognized_keys"
                    ? { message: O.errToObj(e).message ?? s }
                    : { message: s };
                },
              }
            : {}),
        })
      );
    }
    strip() {
      return new ne({ ...this._def, unknownKeys: "strip" });
    }
    passthrough() {
      return new ne({ ...this._def, unknownKeys: "passthrough" });
    }
    extend(e) {
      return new ne({
        ...this._def,
        shape: () => ({ ...this._def.shape(), ...e }),
      });
    }
    merge(e) {
      return new ne({
        unknownKeys: e._def.unknownKeys,
        catchall: e._def.catchall,
        shape: () => ({ ...this._def.shape(), ...e._def.shape() }),
        typeName: A.ZodObject,
      });
    }
    setKey(e, r) {
      return this.augment({ [e]: r });
    }
    catchall(e) {
      return new ne({ ...this._def, catchall: e });
    }
    pick(e) {
      const r = {};
      for (const n of U.objectKeys(e))
        e[n] && this.shape[n] && (r[n] = this.shape[n]);
      return new ne({ ...this._def, shape: () => r });
    }
    omit(e) {
      const r = {};
      for (const n of U.objectKeys(this.shape)) e[n] || (r[n] = this.shape[n]);
      return new ne({ ...this._def, shape: () => r });
    }
    deepPartial() {
      return st(this);
    }
    partial(e) {
      const r = {};
      for (const n of U.objectKeys(this.shape)) {
        const s = this.shape[n];
        e && !e[n] ? (r[n] = s) : (r[n] = s.optional());
      }
      return new ne({ ...this._def, shape: () => r });
    }
    required(e) {
      const r = {};
      for (const n of U.objectKeys(this.shape))
        if (e && !e[n]) r[n] = this.shape[n];
        else {
          let a = this.shape[n];
          for (; a instanceof $e; ) a = a._def.innerType;
          r[n] = a;
        }
      return new ne({ ...this._def, shape: () => r });
    }
    keyof() {
      return Rn(U.objectKeys(this.shape));
    }
  }
  ((ne.create = (t, e) =>
    new ne({
      shape: () => t,
      unknownKeys: "strip",
      catchall: Ze.create(),
      typeName: A.ZodObject,
      ...D(e),
    })),
    (ne.strictCreate = (t, e) =>
      new ne({
        shape: () => t,
        unknownKeys: "strict",
        catchall: Ze.create(),
        typeName: A.ZodObject,
        ...D(e),
      })),
    (ne.lazycreate = (t, e) =>
      new ne({
        shape: t,
        unknownKeys: "strip",
        catchall: Ze.create(),
        typeName: A.ZodObject,
        ...D(e),
      })));
  class Ft extends L {
    _parse(e) {
      const { ctx: r } = this._processInputParams(e),
        n = this._def.options;
      function s(a) {
        for (const o of a) if (o.result.status === "valid") return o.result;
        for (const o of a)
          if (o.result.status === "dirty")
            return (r.common.issues.push(...o.ctx.common.issues), o.result);
        const i = a.map((o) => new Ne(o.ctx.common.issues));
        return (E(r, { code: k.invalid_union, unionErrors: i }), N);
      }
      if (r.common.async)
        return Promise.all(
          n.map(async (a) => {
            const i = {
              ...r,
              common: { ...r.common, issues: [] },
              parent: null,
            };
            return {
              result: await a._parseAsync({
                data: r.data,
                path: r.path,
                parent: i,
              }),
              ctx: i,
            };
          }),
        ).then(s);
      {
        let a;
        const i = [];
        for (const c of n) {
          const l = { ...r, common: { ...r.common, issues: [] }, parent: null },
            u = c._parseSync({ data: r.data, path: r.path, parent: l });
          if (u.status === "valid") return u;
          (u.status === "dirty" && !a && (a = { result: u, ctx: l }),
            l.common.issues.length && i.push(l.common.issues));
        }
        if (a) return (r.common.issues.push(...a.ctx.common.issues), a.result);
        const o = i.map((c) => new Ne(c));
        return (E(r, { code: k.invalid_union, unionErrors: o }), N);
      }
    }
    get options() {
      return this._def.options;
    }
  }
  Ft.create = (t, e) => new Ft({ options: t, typeName: A.ZodUnion, ...D(e) });
  const je = (t) =>
    t instanceof zt
      ? je(t.schema)
      : t instanceof We
        ? je(t.innerType())
        : t instanceof qt
          ? [t.value]
          : t instanceof Ge
            ? t.options
            : t instanceof Er
              ? U.objectValues(t.enum)
              : t instanceof Kt
                ? je(t._def.innerType)
                : t instanceof kr
                  ? [void 0]
                  : t instanceof Lt
                    ? [null]
                    : t instanceof $e
                      ? [void 0, ...je(t.unwrap())]
                      : t instanceof He
                        ? [null, ...je(t.unwrap())]
                        : t instanceof Mn || t instanceof Wt
                          ? je(t.unwrap())
                          : t instanceof Gt
                            ? je(t._def.innerType)
                            : [];
  class Ar extends L {
    _parse(e) {
      const { ctx: r } = this._processInputParams(e);
      if (r.parsedType !== I.object)
        return (
          E(r, {
            code: k.invalid_type,
            expected: I.object,
            received: r.parsedType,
          }),
          N
        );
      const n = this.discriminator,
        s = r.data[n],
        a = this.optionsMap.get(s);
      return a
        ? r.common.async
          ? a._parseAsync({ data: r.data, path: r.path, parent: r })
          : a._parseSync({ data: r.data, path: r.path, parent: r })
        : (E(r, {
            code: k.invalid_union_discriminator,
            options: Array.from(this.optionsMap.keys()),
            path: [n],
          }),
          N);
    }
    get discriminator() {
      return this._def.discriminator;
    }
    get options() {
      return this._def.options;
    }
    get optionsMap() {
      return this._def.optionsMap;
    }
    static create(e, r, n) {
      const s = new Map();
      for (const a of r) {
        const i = je(a.shape[e]);
        if (!i.length)
          throw new Error(
            `A discriminator value for key \`${e}\` could not be extracted from all schema options`,
          );
        for (const o of i) {
          if (s.has(o))
            throw new Error(
              `Discriminator property ${String(e)} has duplicate value ${String(o)}`,
            );
          s.set(o, a);
        }
      }
      return new Ar({
        typeName: A.ZodDiscriminatedUnion,
        discriminator: e,
        options: r,
        optionsMap: s,
        ...D(n),
      });
    }
  }
  function Sr(t, e) {
    const r = Ue(t),
      n = Ue(e);
    if (t === e) return { valid: !0, data: t };
    if (r === I.object && n === I.object) {
      const s = U.objectKeys(e),
        a = U.objectKeys(t).filter((o) => s.indexOf(o) !== -1),
        i = { ...t, ...e };
      for (const o of a) {
        const c = Sr(t[o], e[o]);
        if (!c.valid) return { valid: !1 };
        i[o] = c.data;
      }
      return { valid: !0, data: i };
    } else if (r === I.array && n === I.array) {
      if (t.length !== e.length) return { valid: !1 };
      const s = [];
      for (let a = 0; a < t.length; a++) {
        const i = t[a],
          o = e[a],
          c = Sr(i, o);
        if (!c.valid) return { valid: !1 };
        s.push(c.data);
      }
      return { valid: !0, data: s };
    } else
      return r === I.date && n === I.date && +t == +e
        ? { valid: !0, data: t }
        : { valid: !1 };
  }
  class Ut extends L {
    _parse(e) {
      const { status: r, ctx: n } = this._processInputParams(e),
        s = (a, i) => {
          if (An(a) || An(i)) return N;
          const o = Sr(a.value, i.value);
          return o.valid
            ? ((Sn(a) || Sn(i)) && r.dirty(),
              { status: r.value, value: o.data })
            : (E(n, { code: k.invalid_intersection_types }), N);
        };
      return n.common.async
        ? Promise.all([
            this._def.left._parseAsync({
              data: n.data,
              path: n.path,
              parent: n,
            }),
            this._def.right._parseAsync({
              data: n.data,
              path: n.path,
              parent: n,
            }),
          ]).then(([a, i]) => s(a, i))
        : s(
            this._def.left._parseSync({
              data: n.data,
              path: n.path,
              parent: n,
            }),
            this._def.right._parseSync({
              data: n.data,
              path: n.path,
              parent: n,
            }),
          );
    }
  }
  Ut.create = (t, e, r) =>
    new Ut({ left: t, right: e, typeName: A.ZodIntersection, ...D(r) });
  class Ke extends L {
    _parse(e) {
      const { status: r, ctx: n } = this._processInputParams(e);
      if (n.parsedType !== I.array)
        return (
          E(n, {
            code: k.invalid_type,
            expected: I.array,
            received: n.parsedType,
          }),
          N
        );
      if (n.data.length < this._def.items.length)
        return (
          E(n, {
            code: k.too_small,
            minimum: this._def.items.length,
            inclusive: !0,
            exact: !1,
            type: "array",
          }),
          N
        );
      !this._def.rest &&
        n.data.length > this._def.items.length &&
        (E(n, {
          code: k.too_big,
          maximum: this._def.items.length,
          inclusive: !0,
          exact: !1,
          type: "array",
        }),
        r.dirty());
      const a = [...n.data]
        .map((i, o) => {
          const c = this._def.items[o] || this._def.rest;
          return c ? c._parse(new Ee(n, i, n.path, o)) : null;
        })
        .filter((i) => !!i);
      return n.common.async
        ? Promise.all(a).then((i) => me.mergeArray(r, i))
        : me.mergeArray(r, a);
    }
    get items() {
      return this._def.items;
    }
    rest(e) {
      return new Ke({ ...this._def, rest: e });
    }
  }
  Ke.create = (t, e) => {
    if (!Array.isArray(t))
      throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
    return new Ke({ items: t, typeName: A.ZodTuple, rest: null, ...D(e) });
  };
  class Zt extends L {
    get keySchema() {
      return this._def.keyType;
    }
    get valueSchema() {
      return this._def.valueType;
    }
    _parse(e) {
      const { status: r, ctx: n } = this._processInputParams(e);
      if (n.parsedType !== I.object)
        return (
          E(n, {
            code: k.invalid_type,
            expected: I.object,
            received: n.parsedType,
          }),
          N
        );
      const s = [],
        a = this._def.keyType,
        i = this._def.valueType;
      for (const o in n.data)
        s.push({
          key: a._parse(new Ee(n, o, n.path, o)),
          value: i._parse(new Ee(n, n.data[o], n.path, o)),
          alwaysSet: o in n.data,
        });
      return n.common.async
        ? me.mergeObjectAsync(r, s)
        : me.mergeObjectSync(r, s);
    }
    get element() {
      return this._def.valueType;
    }
    static create(e, r, n) {
      return r instanceof L
        ? new Zt({ keyType: e, valueType: r, typeName: A.ZodRecord, ...D(n) })
        : new Zt({
            keyType: Me.create(),
            valueType: e,
            typeName: A.ZodRecord,
            ...D(r),
          });
    }
  }
  class Pn extends L {
    get keySchema() {
      return this._def.keyType;
    }
    get valueSchema() {
      return this._def.valueType;
    }
    _parse(e) {
      const { status: r, ctx: n } = this._processInputParams(e);
      if (n.parsedType !== I.map)
        return (
          E(n, {
            code: k.invalid_type,
            expected: I.map,
            received: n.parsedType,
          }),
          N
        );
      const s = this._def.keyType,
        a = this._def.valueType,
        i = [...n.data.entries()].map(([o, c], l) => ({
          key: s._parse(new Ee(n, o, n.path, [l, "key"])),
          value: a._parse(new Ee(n, c, n.path, [l, "value"])),
        }));
      if (n.common.async) {
        const o = new Map();
        return Promise.resolve().then(async () => {
          for (const c of i) {
            const l = await c.key,
              u = await c.value;
            if (l.status === "aborted" || u.status === "aborted") return N;
            ((l.status === "dirty" || u.status === "dirty") && r.dirty(),
              o.set(l.value, u.value));
          }
          return { status: r.value, value: o };
        });
      } else {
        const o = new Map();
        for (const c of i) {
          const l = c.key,
            u = c.value;
          if (l.status === "aborted" || u.status === "aborted") return N;
          ((l.status === "dirty" || u.status === "dirty") && r.dirty(),
            o.set(l.value, u.value));
        }
        return { status: r.value, value: o };
      }
    }
  }
  Pn.create = (t, e, r) =>
    new Pn({ valueType: e, keyType: t, typeName: A.ZodMap, ...D(r) });
  class ft extends L {
    _parse(e) {
      const { status: r, ctx: n } = this._processInputParams(e);
      if (n.parsedType !== I.set)
        return (
          E(n, {
            code: k.invalid_type,
            expected: I.set,
            received: n.parsedType,
          }),
          N
        );
      const s = this._def;
      (s.minSize !== null &&
        n.data.size < s.minSize.value &&
        (E(n, {
          code: k.too_small,
          minimum: s.minSize.value,
          type: "set",
          inclusive: !0,
          exact: !1,
          message: s.minSize.message,
        }),
        r.dirty()),
        s.maxSize !== null &&
          n.data.size > s.maxSize.value &&
          (E(n, {
            code: k.too_big,
            maximum: s.maxSize.value,
            type: "set",
            inclusive: !0,
            exact: !1,
            message: s.maxSize.message,
          }),
          r.dirty()));
      const a = this._def.valueType;
      function i(c) {
        const l = new Set();
        for (const u of c) {
          if (u.status === "aborted") return N;
          (u.status === "dirty" && r.dirty(), l.add(u.value));
        }
        return { status: r.value, value: l };
      }
      const o = [...n.data.values()].map((c, l) =>
        a._parse(new Ee(n, c, n.path, l)),
      );
      return n.common.async ? Promise.all(o).then((c) => i(c)) : i(o);
    }
    min(e, r) {
      return new ft({
        ...this._def,
        minSize: { value: e, message: O.toString(r) },
      });
    }
    max(e, r) {
      return new ft({
        ...this._def,
        maxSize: { value: e, message: O.toString(r) },
      });
    }
    size(e, r) {
      return this.min(e, r).max(e, r);
    }
    nonempty(e) {
      return this.min(1, e);
    }
  }
  ft.create = (t, e) =>
    new ft({
      valueType: t,
      minSize: null,
      maxSize: null,
      typeName: A.ZodSet,
      ...D(e),
    });
  class zt extends L {
    get schema() {
      return this._def.getter();
    }
    _parse(e) {
      const { ctx: r } = this._processInputParams(e);
      return this._def
        .getter()
        ._parse({ data: r.data, path: r.path, parent: r });
    }
  }
  zt.create = (t, e) => new zt({ getter: t, typeName: A.ZodLazy, ...D(e) });
  class qt extends L {
    _parse(e) {
      if (e.data !== this._def.value) {
        const r = this._getOrReturnCtx(e);
        return (
          E(r, {
            received: r.data,
            code: k.invalid_literal,
            expected: this._def.value,
          }),
          N
        );
      }
      return { status: "valid", value: e.data };
    }
    get value() {
      return this._def.value;
    }
  }
  qt.create = (t, e) => new qt({ value: t, typeName: A.ZodLiteral, ...D(e) });
  function Rn(t, e) {
    return new Ge({ values: t, typeName: A.ZodEnum, ...D(e) });
  }
  class Ge extends L {
    _parse(e) {
      if (typeof e.data != "string") {
        const r = this._getOrReturnCtx(e),
          n = this._def.values;
        return (
          E(r, {
            expected: U.joinValues(n),
            received: r.parsedType,
            code: k.invalid_type,
          }),
          N
        );
      }
      if (
        (this._cache || (this._cache = new Set(this._def.values)),
        !this._cache.has(e.data))
      ) {
        const r = this._getOrReturnCtx(e),
          n = this._def.values;
        return (
          E(r, { received: r.data, code: k.invalid_enum_value, options: n }),
          N
        );
      }
      return be(e.data);
    }
    get options() {
      return this._def.values;
    }
    get enum() {
      const e = {};
      for (const r of this._def.values) e[r] = r;
      return e;
    }
    get Values() {
      const e = {};
      for (const r of this._def.values) e[r] = r;
      return e;
    }
    get Enum() {
      const e = {};
      for (const r of this._def.values) e[r] = r;
      return e;
    }
    extract(e, r = this._def) {
      return Ge.create(e, { ...this._def, ...r });
    }
    exclude(e, r = this._def) {
      return Ge.create(
        this.options.filter((n) => !e.includes(n)),
        { ...this._def, ...r },
      );
    }
  }
  Ge.create = Rn;
  class Er extends L {
    _parse(e) {
      const r = U.getValidEnumValues(this._def.values),
        n = this._getOrReturnCtx(e);
      if (n.parsedType !== I.string && n.parsedType !== I.number) {
        const s = U.objectValues(r);
        return (
          E(n, {
            expected: U.joinValues(s),
            received: n.parsedType,
            code: k.invalid_type,
          }),
          N
        );
      }
      if (
        (this._cache ||
          (this._cache = new Set(U.getValidEnumValues(this._def.values))),
        !this._cache.has(e.data))
      ) {
        const s = U.objectValues(r);
        return (
          E(n, { received: n.data, code: k.invalid_enum_value, options: s }),
          N
        );
      }
      return be(e.data);
    }
    get enum() {
      return this._def.values;
    }
  }
  Er.create = (t, e) =>
    new Er({ values: t, typeName: A.ZodNativeEnum, ...D(e) });
  class Jt extends L {
    unwrap() {
      return this._def.type;
    }
    _parse(e) {
      const { ctx: r } = this._processInputParams(e);
      if (r.parsedType !== I.promise && r.common.async === !1)
        return (
          E(r, {
            code: k.invalid_type,
            expected: I.promise,
            received: r.parsedType,
          }),
          N
        );
      const n = r.parsedType === I.promise ? r.data : Promise.resolve(r.data);
      return be(
        n.then((s) =>
          this._def.type.parseAsync(s, {
            path: r.path,
            errorMap: r.common.contextualErrorMap,
          }),
        ),
      );
    }
  }
  Jt.create = (t, e) => new Jt({ type: t, typeName: A.ZodPromise, ...D(e) });
  class We extends L {
    innerType() {
      return this._def.schema;
    }
    sourceType() {
      return this._def.schema._def.typeName === A.ZodEffects
        ? this._def.schema.sourceType()
        : this._def.schema;
    }
    _parse(e) {
      const { status: r, ctx: n } = this._processInputParams(e),
        s = this._def.effect || null,
        a = {
          addIssue: (i) => {
            (E(n, i), i.fatal ? r.abort() : r.dirty());
          },
          get path() {
            return n.path;
          },
        };
      if (((a.addIssue = a.addIssue.bind(a)), s.type === "preprocess")) {
        const i = s.transform(n.data, a);
        if (n.common.async)
          return Promise.resolve(i).then(async (o) => {
            if (r.value === "aborted") return N;
            const c = await this._def.schema._parseAsync({
              data: o,
              path: n.path,
              parent: n,
            });
            return c.status === "aborted"
              ? N
              : c.status === "dirty" || r.value === "dirty"
                ? dt(c.value)
                : c;
          });
        {
          if (r.value === "aborted") return N;
          const o = this._def.schema._parseSync({
            data: i,
            path: n.path,
            parent: n,
          });
          return o.status === "aborted"
            ? N
            : o.status === "dirty" || r.value === "dirty"
              ? dt(o.value)
              : o;
        }
      }
      if (s.type === "refinement") {
        const i = (o) => {
          const c = s.refinement(o, a);
          if (n.common.async) return Promise.resolve(c);
          if (c instanceof Promise)
            throw new Error(
              "Async refinement encountered during synchronous parse operation. Use .parseAsync instead.",
            );
          return o;
        };
        if (n.common.async === !1) {
          const o = this._def.schema._parseSync({
            data: n.data,
            path: n.path,
            parent: n,
          });
          return o.status === "aborted"
            ? N
            : (o.status === "dirty" && r.dirty(),
              i(o.value),
              { status: r.value, value: o.value });
        } else
          return this._def.schema
            ._parseAsync({ data: n.data, path: n.path, parent: n })
            .then((o) =>
              o.status === "aborted"
                ? N
                : (o.status === "dirty" && r.dirty(),
                  i(o.value).then(() => ({ status: r.value, value: o.value }))),
            );
      }
      if (s.type === "transform")
        if (n.common.async === !1) {
          const i = this._def.schema._parseSync({
            data: n.data,
            path: n.path,
            parent: n,
          });
          if (!rt(i)) return N;
          const o = s.transform(i.value, a);
          if (o instanceof Promise)
            throw new Error(
              "Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.",
            );
          return { status: r.value, value: o };
        } else
          return this._def.schema
            ._parseAsync({ data: n.data, path: n.path, parent: n })
            .then((i) =>
              rt(i)
                ? Promise.resolve(s.transform(i.value, a)).then((o) => ({
                    status: r.value,
                    value: o,
                  }))
                : N,
            );
      U.assertNever(s);
    }
  }
  ((We.create = (t, e, r) =>
    new We({ schema: t, typeName: A.ZodEffects, effect: e, ...D(r) })),
    (We.createWithPreprocess = (t, e, r) =>
      new We({
        schema: e,
        effect: { type: "preprocess", transform: t },
        typeName: A.ZodEffects,
        ...D(r),
      })));
  class $e extends L {
    _parse(e) {
      return this._getType(e) === I.undefined
        ? be(void 0)
        : this._def.innerType._parse(e);
    }
    unwrap() {
      return this._def.innerType;
    }
  }
  $e.create = (t, e) =>
    new $e({ innerType: t, typeName: A.ZodOptional, ...D(e) });
  class He extends L {
    _parse(e) {
      return this._getType(e) === I.null
        ? be(null)
        : this._def.innerType._parse(e);
    }
    unwrap() {
      return this._def.innerType;
    }
  }
  He.create = (t, e) =>
    new He({ innerType: t, typeName: A.ZodNullable, ...D(e) });
  class Kt extends L {
    _parse(e) {
      const { ctx: r } = this._processInputParams(e);
      let n = r.data;
      return (
        r.parsedType === I.undefined && (n = this._def.defaultValue()),
        this._def.innerType._parse({ data: n, path: r.path, parent: r })
      );
    }
    removeDefault() {
      return this._def.innerType;
    }
  }
  Kt.create = (t, e) =>
    new Kt({
      innerType: t,
      typeName: A.ZodDefault,
      defaultValue:
        typeof e.default == "function" ? e.default : () => e.default,
      ...D(e),
    });
  class Gt extends L {
    _parse(e) {
      const { ctx: r } = this._processInputParams(e),
        n = { ...r, common: { ...r.common, issues: [] } },
        s = this._def.innerType._parse({
          data: n.data,
          path: n.path,
          parent: { ...n },
        });
      return Vt(s)
        ? s.then((a) => ({
            status: "valid",
            value:
              a.status === "valid"
                ? a.value
                : this._def.catchValue({
                    get error() {
                      return new Ne(n.common.issues);
                    },
                    input: n.data,
                  }),
          }))
        : {
            status: "valid",
            value:
              s.status === "valid"
                ? s.value
                : this._def.catchValue({
                    get error() {
                      return new Ne(n.common.issues);
                    },
                    input: n.data,
                  }),
          };
    }
    removeCatch() {
      return this._def.innerType;
    }
  }
  Gt.create = (t, e) =>
    new Gt({
      innerType: t,
      typeName: A.ZodCatch,
      catchValue: typeof e.catch == "function" ? e.catch : () => e.catch,
      ...D(e),
    });
  class Nn extends L {
    _parse(e) {
      if (this._getType(e) !== I.nan) {
        const n = this._getOrReturnCtx(e);
        return (
          E(n, {
            code: k.invalid_type,
            expected: I.nan,
            received: n.parsedType,
          }),
          N
        );
      }
      return { status: "valid", value: e.data };
    }
  }
  Nn.create = (t) => new Nn({ typeName: A.ZodNaN, ...D(t) });
  class Mn extends L {
    _parse(e) {
      const { ctx: r } = this._processInputParams(e),
        n = r.data;
      return this._def.type._parse({ data: n, path: r.path, parent: r });
    }
    unwrap() {
      return this._def.type;
    }
  }
  class Ir extends L {
    _parse(e) {
      const { status: r, ctx: n } = this._processInputParams(e);
      if (n.common.async)
        return (async () => {
          const a = await this._def.in._parseAsync({
            data: n.data,
            path: n.path,
            parent: n,
          });
          return a.status === "aborted"
            ? N
            : a.status === "dirty"
              ? (r.dirty(), dt(a.value))
              : this._def.out._parseAsync({
                  data: a.value,
                  path: n.path,
                  parent: n,
                });
        })();
      {
        const s = this._def.in._parseSync({
          data: n.data,
          path: n.path,
          parent: n,
        });
        return s.status === "aborted"
          ? N
          : s.status === "dirty"
            ? (r.dirty(), { status: "dirty", value: s.value })
            : this._def.out._parseSync({
                data: s.value,
                path: n.path,
                parent: n,
              });
      }
    }
    static create(e, r) {
      return new Ir({ in: e, out: r, typeName: A.ZodPipeline });
    }
  }
  class Wt extends L {
    _parse(e) {
      const r = this._def.innerType._parse(e),
        n = (s) => (rt(s) && (s.value = Object.freeze(s.value)), s);
      return Vt(r) ? r.then((s) => n(s)) : n(r);
    }
    unwrap() {
      return this._def.innerType;
    }
  }
  Wt.create = (t, e) =>
    new Wt({ innerType: t, typeName: A.ZodReadonly, ...D(e) });
  function jn(t, e) {
    const r =
      typeof t == "function" ? t(e) : typeof t == "string" ? { message: t } : t;
    return typeof r == "string" ? { message: r } : r;
  }
  function $n(t, e = {}, r) {
    return t
      ? mt.create().superRefine((n, s) => {
          const a = t(n);
          if (a instanceof Promise)
            return a.then((i) => {
              if (!i) {
                const o = jn(e, n),
                  c = o.fatal ?? r ?? !0;
                s.addIssue({ code: "custom", ...o, fatal: c });
              }
            });
          if (!a) {
            const i = jn(e, n),
              o = i.fatal ?? r ?? !0;
            s.addIssue({ code: "custom", ...i, fatal: o });
          }
        })
      : mt.create();
  }
  var A;
  (function (t) {
    ((t.ZodString = "ZodString"),
      (t.ZodNumber = "ZodNumber"),
      (t.ZodNaN = "ZodNaN"),
      (t.ZodBigInt = "ZodBigInt"),
      (t.ZodBoolean = "ZodBoolean"),
      (t.ZodDate = "ZodDate"),
      (t.ZodSymbol = "ZodSymbol"),
      (t.ZodUndefined = "ZodUndefined"),
      (t.ZodNull = "ZodNull"),
      (t.ZodAny = "ZodAny"),
      (t.ZodUnknown = "ZodUnknown"),
      (t.ZodNever = "ZodNever"),
      (t.ZodVoid = "ZodVoid"),
      (t.ZodArray = "ZodArray"),
      (t.ZodObject = "ZodObject"),
      (t.ZodUnion = "ZodUnion"),
      (t.ZodDiscriminatedUnion = "ZodDiscriminatedUnion"),
      (t.ZodIntersection = "ZodIntersection"),
      (t.ZodTuple = "ZodTuple"),
      (t.ZodRecord = "ZodRecord"),
      (t.ZodMap = "ZodMap"),
      (t.ZodSet = "ZodSet"),
      (t.ZodFunction = "ZodFunction"),
      (t.ZodLazy = "ZodLazy"),
      (t.ZodLiteral = "ZodLiteral"),
      (t.ZodEnum = "ZodEnum"),
      (t.ZodEffects = "ZodEffects"),
      (t.ZodNativeEnum = "ZodNativeEnum"),
      (t.ZodOptional = "ZodOptional"),
      (t.ZodNullable = "ZodNullable"),
      (t.ZodDefault = "ZodDefault"),
      (t.ZodCatch = "ZodCatch"),
      (t.ZodPromise = "ZodPromise"),
      (t.ZodBranded = "ZodBranded"),
      (t.ZodPipeline = "ZodPipeline"),
      (t.ZodReadonly = "ZodReadonly"));
  })(A || (A = {}));
  const Ht = (t, e = { message: `Input not instance of ${t.name}` }) =>
      $n((r) => r instanceof t, e),
    h = Me.create,
    P = nt.create,
    Te = wr.create,
    Yi = Lt.create,
    Dn = mt.create,
    Yt = xr.create;
  Ze.create;
  const V = Ie.create,
    y = ne.create,
    se = Ft.create,
    Tr = Ar.create;
  (Ut.create, Ke.create);
  const gt = Zt.create,
    Vn = zt.create,
    M = qt.create,
    Cr = Ge.create;
  Jt.create;
  const ie = $e.create;
  (He.create,
    y({
      title: h().describe("优化后的标题，简洁明了，不超过50字"),
      summary: h().max(200).describe("一句话摘要，概括核心内容，不超过200字"),
      category: h().describe(
        "推荐的分类名称，优先从用户已有分类或预设分类中选择",
      ),
      tags: V(h()).max(5).describe("3-5个相关标签，简洁有辨识度"),
    }));
  const Qi = y({
    tag: h().describe("推荐的标签"),
    reason: h().describe("推荐理由"),
  });
  V(Qi).max(5);
  const Xi = y({
    name: h().describe("推荐的分类名称"),
    reason: h().describe("推荐理由"),
  });
  V(Xi).max(3);
  const Bn = y({
    name: h().min(2).max(20).describe("分类名称，2-8个字"),
    children: Vn(() => V(Bn))
      .optional()
      .describe("子分类数组（可选）"),
  });
  y({
    categories: V(Bn)
      .min(3)
      .max(10)
      .describe("书签分类数组，包含3-10个一级分类"),
  });
  var Ln = "vercel.ai.error",
    eo = Symbol.for(Ln),
    Fn,
    to = class Va extends Error {
      constructor({ name: e, message: r, cause: n }) {
        (super(r), (this[Fn] = !0), (this.name = e), (this.cause = n));
      }
      static isInstance(e) {
        return Va.hasMarker(e, Ln);
      }
      static hasMarker(e, r) {
        const n = Symbol.for(r);
        return (
          e != null &&
          typeof e == "object" &&
          n in e &&
          typeof e[n] == "boolean" &&
          e[n] === !0
        );
      }
    };
  Fn = eo;
  var Y = to,
    Un = "AI_APICallError",
    Zn = `vercel.ai.error.${Un}`,
    ro = Symbol.for(Zn),
    zn,
    ye = class extends Y {
      constructor({
        message: t,
        url: e,
        requestBodyValues: r,
        statusCode: n,
        responseHeaders: s,
        responseBody: a,
        cause: i,
        isRetryable: o = n != null &&
          (n === 408 || n === 409 || n === 429 || n >= 500),
        data: c,
      }) {
        (super({ name: Un, message: t, cause: i }),
          (this[zn] = !0),
          (this.url = e),
          (this.requestBodyValues = r),
          (this.statusCode = n),
          (this.responseHeaders = s),
          (this.responseBody = a),
          (this.isRetryable = o),
          (this.data = c));
      }
      static isInstance(t) {
        return Y.hasMarker(t, Zn);
      }
    };
  zn = ro;
  var qn = "AI_EmptyResponseBodyError",
    Jn = `vercel.ai.error.${qn}`,
    no = Symbol.for(Jn),
    Kn,
    so = class extends Y {
      constructor({ message: t = "Empty response body" } = {}) {
        (super({ name: qn, message: t }), (this[Kn] = !0));
      }
      static isInstance(t) {
        return Y.hasMarker(t, Jn);
      }
    };
  Kn = no;
  function Gn(t) {
    return t == null
      ? "unknown error"
      : typeof t == "string"
        ? t
        : t instanceof Error
          ? t.message
          : JSON.stringify(t);
  }
  var Wn = "AI_InvalidArgumentError",
    Hn = `vercel.ai.error.${Wn}`,
    ao = Symbol.for(Hn),
    Yn,
    Qn = class extends Y {
      constructor({ message: e, cause: r, argument: n }) {
        (super({ name: Wn, message: e, cause: r }),
          (this[Yn] = !0),
          (this.argument = n));
      }
      static isInstance(e) {
        return Y.hasMarker(e, Hn);
      }
    };
  Yn = ao;
  var Xn = "AI_InvalidPromptError",
    es = `vercel.ai.error.${Xn}`,
    io = Symbol.for(es),
    ts,
    oo = class extends Y {
      constructor({ prompt: t, message: e, cause: r }) {
        (super({ name: Xn, message: `Invalid prompt: ${e}`, cause: r }),
          (this[ts] = !0),
          (this.prompt = t));
      }
      static isInstance(t) {
        return Y.hasMarker(t, es);
      }
    };
  ts = io;
  var rs = "AI_InvalidResponseDataError",
    ns = `vercel.ai.error.${rs}`,
    co = Symbol.for(ns),
    ss,
    Or = class extends Y {
      constructor({
        data: t,
        message: e = `Invalid response data: ${JSON.stringify(t)}.`,
      }) {
        (super({ name: rs, message: e }), (this[ss] = !0), (this.data = t));
      }
      static isInstance(t) {
        return Y.hasMarker(t, ns);
      }
    };
  ss = co;
  var as = "AI_JSONParseError",
    is = `vercel.ai.error.${as}`,
    lo = Symbol.for(is),
    os,
    Qt = class extends Y {
      constructor({ text: t, cause: e }) {
        (super({
          name: as,
          message: `JSON parsing failed: Text: ${t}.
Error message: ${Gn(e)}`,
          cause: e,
        }),
          (this[os] = !0),
          (this.text = t));
      }
      static isInstance(t) {
        return Y.hasMarker(t, is);
      }
    };
  os = lo;
  var cs = "AI_LoadAPIKeyError",
    ls = `vercel.ai.error.${cs}`,
    uo = Symbol.for(ls),
    us,
    Xt = class extends Y {
      constructor({ message: t }) {
        (super({ name: cs, message: t }), (this[us] = !0));
      }
      static isInstance(t) {
        return Y.hasMarker(t, ls);
      }
    };
  us = uo;
  var ds = "AI_TooManyEmbeddingValuesForCallError",
    ps = `vercel.ai.error.${ds}`,
    po = Symbol.for(ps),
    ms,
    mo = class extends Y {
      constructor(t) {
        (super({
          name: ds,
          message: `Too many values for a single embedding call. The ${t.provider} model "${t.modelId}" can only embed up to ${t.maxEmbeddingsPerCall} values per call, but ${t.values.length} values were provided.`,
        }),
          (this[ms] = !0),
          (this.provider = t.provider),
          (this.modelId = t.modelId),
          (this.maxEmbeddingsPerCall = t.maxEmbeddingsPerCall),
          (this.values = t.values));
      }
      static isInstance(t) {
        return Y.hasMarker(t, ps);
      }
    };
  ms = po;
  var fs = "AI_TypeValidationError",
    gs = `vercel.ai.error.${fs}`,
    fo = Symbol.for(gs),
    hs,
    go = class cn extends Y {
      constructor({ value: e, cause: r }) {
        (super({
          name: fs,
          message: `Type validation failed: Value: ${JSON.stringify(e)}.
Error message: ${Gn(r)}`,
          cause: r,
        }),
          (this[hs] = !0),
          (this.value = e));
      }
      static isInstance(e) {
        return Y.hasMarker(e, gs);
      }
      static wrap({ value: e, cause: r }) {
        return cn.isInstance(r) && r.value === e
          ? r
          : new cn({ value: e, cause: r });
      }
    };
  hs = fo;
  var er = go,
    ys = "AI_UnsupportedFunctionalityError",
    vs = `vercel.ai.error.${ys}`,
    ho = Symbol.for(vs),
    _s,
    le = class extends Y {
      constructor({
        functionality: t,
        message: e = `'${t}' functionality not supported.`,
      }) {
        (super({ name: ys, message: e }),
          (this[_s] = !0),
          (this.functionality = t));
      }
      static isInstance(t) {
        return Y.hasMarker(t, vs);
      }
    };
  _s = ho;
  let yo =
    (t, e = 21) =>
    (r = e) => {
      let n = "",
        s = r | 0;
      for (; s--; ) n += t[(Math.random() * t.length) | 0];
      return n;
    };
  var at = { exports: {} };
  const vo = typeof Buffer < "u",
    bs =
      /"(?:_|\\u005[Ff])(?:_|\\u005[Ff])(?:p|\\u0070)(?:r|\\u0072)(?:o|\\u006[Ff])(?:t|\\u0074)(?:o|\\u006[Ff])(?:_|\\u005[Ff])(?:_|\\u005[Ff])"\s*:/,
    ws =
      /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
  function ks(t, e, r) {
    (r == null && e !== null && typeof e == "object" && ((r = e), (e = void 0)),
      vo && Buffer.isBuffer(t) && (t = t.toString()),
      t && t.charCodeAt(0) === 65279 && (t = t.slice(1)));
    const n = JSON.parse(t, e);
    if (n === null || typeof n != "object") return n;
    const s = (r && r.protoAction) || "error",
      a = (r && r.constructorAction) || "error";
    if (s === "ignore" && a === "ignore") return n;
    if (s !== "ignore" && a !== "ignore") {
      if (bs.test(t) === !1 && ws.test(t) === !1) return n;
    } else if (s !== "ignore" && a === "ignore") {
      if (bs.test(t) === !1) return n;
    } else if (ws.test(t) === !1) return n;
    return xs(n, { protoAction: s, constructorAction: a, safe: r && r.safe });
  }
  function xs(
    t,
    { protoAction: e = "error", constructorAction: r = "error", safe: n } = {},
  ) {
    let s = [t];
    for (; s.length; ) {
      const a = s;
      s = [];
      for (const i of a) {
        if (
          e !== "ignore" &&
          Object.prototype.hasOwnProperty.call(i, "__proto__")
        ) {
          if (n === !0) return null;
          if (e === "error")
            throw new SyntaxError(
              "Object contains forbidden prototype property",
            );
          delete i.__proto__;
        }
        if (
          r !== "ignore" &&
          Object.prototype.hasOwnProperty.call(i, "constructor") &&
          Object.prototype.hasOwnProperty.call(i.constructor, "prototype")
        ) {
          if (n === !0) return null;
          if (r === "error")
            throw new SyntaxError(
              "Object contains forbidden prototype property",
            );
          delete i.constructor;
        }
        for (const o in i) {
          const c = i[o];
          c && typeof c == "object" && s.push(c);
        }
      }
    }
    return t;
  }
  function Pr(t, e, r) {
    const n = Error.stackTraceLimit;
    Error.stackTraceLimit = 0;
    try {
      return ks(t, e, r);
    } finally {
      Error.stackTraceLimit = n;
    }
  }
  function _o(t, e) {
    const r = Error.stackTraceLimit;
    Error.stackTraceLimit = 0;
    try {
      return ks(t, e, { safe: !0 });
    } catch {
      return null;
    } finally {
      Error.stackTraceLimit = r;
    }
  }
  ((at.exports = Pr),
    (at.exports.default = Pr),
    (at.exports.parse = Pr),
    (at.exports.safeParse = _o),
    (at.exports.scan = xs));
  var bo = at.exports;
  const Rr = gn(bo);
  function Ce(...t) {
    return t.reduce((e, r) => ({ ...e, ...(r ?? {}) }), {});
  }
  function wo(t) {
    return new ReadableStream({
      async pull(e) {
        try {
          const { value: r, done: n } = await t.next();
          n ? e.close() : e.enqueue(r);
        } catch (r) {
          e.error(r);
        }
      },
      cancel() {},
    });
  }
  async function ko(t) {
    return t == null ? Promise.resolve() : new Promise((e) => setTimeout(e, t));
  }
  function xo() {
    let t = "",
      e,
      r = [],
      n,
      s;
    function a(c, l) {
      if (c === "") {
        i(l);
        return;
      }
      if (c.startsWith(":")) return;
      const u = c.indexOf(":");
      if (u === -1) {
        o(c, "");
        return;
      }
      const f = c.slice(0, u),
        _ = u + 1,
        C = _ < c.length && c[_] === " " ? c.slice(_ + 1) : c.slice(_);
      o(f, C);
    }
    function i(c) {
      r.length > 0 &&
        (c.enqueue({
          event: e,
          data: r.join(`
`),
          id: n,
          retry: s,
        }),
        (r = []),
        (e = void 0),
        (s = void 0));
    }
    function o(c, l) {
      switch (c) {
        case "event":
          e = l;
          break;
        case "data":
          r.push(l);
          break;
        case "id":
          n = l;
          break;
        case "retry":
          const u = parseInt(l, 10);
          isNaN(u) || (s = u);
          break;
      }
    }
    return new TransformStream({
      transform(c, l) {
        const { lines: u, incompleteLine: f } = Ao(t, c);
        t = f;
        for (let _ = 0; _ < u.length; _++) a(u[_], l);
      },
      flush(c) {
        (a(t, c), i(c));
      },
    });
  }
  function Ao(t, e) {
    const r = [];
    let n = t;
    for (let s = 0; s < e.length; ) {
      const a = e[s++];
      a ===
      `
`
        ? (r.push(n), (n = ""))
        : a === "\r"
          ? (r.push(n),
            (n = ""),
            e[s] ===
              `
` && s++)
          : (n += a);
    }
    return { lines: r, incompleteLine: n };
  }
  function ht(t) {
    const e = {};
    return (
      t.headers.forEach((r, n) => {
        e[n] = r;
      }),
      e
    );
  }
  var Ye = ({
      prefix: t,
      size: e = 16,
      alphabet:
        r = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
      separator: n = "-",
    } = {}) => {
      const s = yo(r, e);
      if (t == null) return s;
      if (r.includes(n))
        throw new Qn({
          argument: "separator",
          message: `The separator "${n}" must not be part of the alphabet "${r}".`,
        });
      return (a) => `${t}${n}${s(a)}`;
    },
    Qe = Ye();
  function So(t) {
    return t == null
      ? "unknown error"
      : typeof t == "string"
        ? t
        : t instanceof Error
          ? t.message
          : JSON.stringify(t);
  }
  function Eo(t) {
    return Object.fromEntries(Object.entries(t).filter(([e, r]) => r != null));
  }
  function tr(t) {
    return (
      t instanceof Error &&
      (t.name === "AbortError" || t.name === "TimeoutError")
    );
  }
  function Io({
    apiKey: t,
    environmentVariableName: e,
    apiKeyParameterName: r = "apiKey",
    description: n,
  }) {
    if (typeof t == "string") return t;
    if (t != null) throw new Xt({ message: `${n} API key must be a string.` });
    if (typeof process > "u")
      throw new Xt({
        message: `${n} API key is missing. Pass it using the '${r}' parameter. Environment variables is not supported in this environment.`,
      });
    if (((t = process.env[e]), t == null))
      throw new Xt({
        message: `${n} API key is missing. Pass it using the '${r}' parameter or the ${e} environment variable.`,
      });
    if (typeof t != "string")
      throw new Xt({
        message: `${n} API key must be a string. The value of the ${e} environment variable is not a string.`,
      });
    return t;
  }
  var rr = Symbol.for("vercel.ai.validator");
  function To(t) {
    return { [rr]: !0, validate: t };
  }
  function Co(t) {
    return (
      typeof t == "object" &&
      t !== null &&
      rr in t &&
      t[rr] === !0 &&
      "validate" in t
    );
  }
  function Oo(t) {
    return Co(t) ? t : Po(t);
  }
  function Po(t) {
    return To((e) => {
      const r = t.safeParse(e);
      return r.success
        ? { success: !0, value: r.data }
        : { success: !1, error: r.error };
    });
  }
  function Ro({ value: t, schema: e }) {
    const r = nr({ value: t, schema: e });
    if (!r.success) throw er.wrap({ value: t, cause: r.error });
    return r.value;
  }
  function nr({ value: t, schema: e }) {
    const r = Oo(e);
    try {
      if (r.validate == null) return { success: !0, value: t };
      const n = r.validate(t);
      return n.success
        ? n
        : { success: !1, error: er.wrap({ value: t, cause: n.error }) };
    } catch (n) {
      return { success: !1, error: er.wrap({ value: t, cause: n }) };
    }
  }
  function No({ text: t, schema: e }) {
    try {
      const r = Rr.parse(t);
      return e == null ? r : Ro({ value: r, schema: e });
    } catch (r) {
      throw Qt.isInstance(r) || er.isInstance(r)
        ? r
        : new Qt({ text: t, cause: r });
    }
  }
  function yt({ text: t, schema: e }) {
    try {
      const r = Rr.parse(t);
      if (e == null) return { success: !0, value: r, rawValue: r };
      const n = nr({ value: r, schema: e });
      return n.success ? { ...n, rawValue: r } : n;
    } catch (r) {
      return {
        success: !1,
        error: Qt.isInstance(r) ? r : new Qt({ text: t, cause: r }),
      };
    }
  }
  function As(t) {
    try {
      return (Rr.parse(t), !0);
    } catch {
      return !1;
    }
  }
  function Nr({ provider: t, providerOptions: e, schema: r }) {
    if ((e == null ? void 0 : e[t]) == null) return;
    const n = nr({ value: e[t], schema: r });
    if (!n.success)
      throw new Qn({
        argument: "providerOptions",
        message: `invalid ${t} provider options`,
        cause: n.error,
      });
    return n.value;
  }
  var Mo = () => globalThis.fetch,
    De = async ({
      url: t,
      headers: e,
      body: r,
      failedResponseHandler: n,
      successfulResponseHandler: s,
      abortSignal: a,
      fetch: i,
    }) =>
      Ss({
        url: t,
        headers: { "Content-Type": "application/json", ...e },
        body: { content: JSON.stringify(r), values: r },
        failedResponseHandler: n,
        successfulResponseHandler: s,
        abortSignal: a,
        fetch: i,
      }),
    jo = async ({
      url: t,
      headers: e,
      formData: r,
      failedResponseHandler: n,
      successfulResponseHandler: s,
      abortSignal: a,
      fetch: i,
    }) =>
      Ss({
        url: t,
        headers: e,
        body: { content: r, values: Object.fromEntries(r.entries()) },
        failedResponseHandler: n,
        successfulResponseHandler: s,
        abortSignal: a,
        fetch: i,
      }),
    Ss = async ({
      url: t,
      headers: e = {},
      body: r,
      successfulResponseHandler: n,
      failedResponseHandler: s,
      abortSignal: a,
      fetch: i = Mo(),
    }) => {
      try {
        const o = await i(t, {
            method: "POST",
            headers: Eo(e),
            body: r.content,
            signal: a,
          }),
          c = ht(o);
        if (!o.ok) {
          let l;
          try {
            l = await s({ response: o, url: t, requestBodyValues: r.values });
          } catch (u) {
            throw tr(u) || ye.isInstance(u)
              ? u
              : new ye({
                  message: "Failed to process error response",
                  cause: u,
                  statusCode: o.status,
                  url: t,
                  responseHeaders: c,
                  requestBodyValues: r.values,
                });
          }
          throw l.value;
        }
        try {
          return await n({ response: o, url: t, requestBodyValues: r.values });
        } catch (l) {
          throw l instanceof Error && (tr(l) || ye.isInstance(l))
            ? l
            : new ye({
                message: "Failed to process successful response",
                cause: l,
                statusCode: o.status,
                url: t,
                responseHeaders: c,
                requestBodyValues: r.values,
              });
        }
      } catch (o) {
        if (tr(o)) throw o;
        if (o instanceof TypeError && o.message === "fetch failed") {
          const c = o.cause;
          if (c != null)
            throw new ye({
              message: `Cannot connect to API: ${c.message}`,
              cause: c,
              url: t,
              requestBodyValues: r.values,
              isRetryable: !0,
            });
        }
        throw o;
      }
    },
    $o =
      ({ errorSchema: t, errorToMessage: e, isRetryable: r }) =>
      async ({ response: n, url: s, requestBodyValues: a }) => {
        const i = await n.text(),
          o = ht(n);
        if (i.trim() === "")
          return {
            responseHeaders: o,
            value: new ye({
              message: n.statusText,
              url: s,
              requestBodyValues: a,
              statusCode: n.status,
              responseHeaders: o,
              responseBody: i,
              isRetryable: r == null ? void 0 : r(n),
            }),
          };
        try {
          const c = No({ text: i, schema: t });
          return {
            responseHeaders: o,
            value: new ye({
              message: e(c),
              url: s,
              requestBodyValues: a,
              statusCode: n.status,
              responseHeaders: o,
              responseBody: i,
              data: c,
              isRetryable: r == null ? void 0 : r(n, c),
            }),
          };
        } catch {
          return {
            responseHeaders: o,
            value: new ye({
              message: n.statusText,
              url: s,
              requestBodyValues: a,
              statusCode: n.status,
              responseHeaders: o,
              responseBody: i,
              isRetryable: r == null ? void 0 : r(n),
            }),
          };
        }
      },
    Mr =
      (t) =>
      async ({ response: e }) => {
        const r = ht(e);
        if (e.body == null) throw new so({});
        return {
          responseHeaders: r,
          value: e.body
            .pipeThrough(new TextDecoderStream())
            .pipeThrough(xo())
            .pipeThrough(
              new TransformStream({
                transform({ data: n }, s) {
                  n !== "[DONE]" && s.enqueue(yt({ text: n, schema: t }));
                },
              }),
            ),
        };
      },
    it =
      (t) =>
      async ({ response: e, url: r, requestBodyValues: n }) => {
        const s = await e.text(),
          a = yt({ text: s, schema: t }),
          i = ht(e);
        if (!a.success)
          throw new ye({
            message: "Invalid JSON response",
            cause: a.error,
            statusCode: e.status,
            responseHeaders: i,
            responseBody: s,
            url: r,
            requestBodyValues: n,
          });
        return { responseHeaders: i, value: a.value, rawValue: a.rawValue };
      },
    Do =
      () =>
      async ({ response: t, url: e, requestBodyValues: r }) => {
        const n = ht(t);
        if (!t.body)
          throw new ye({
            message: "Response body is empty",
            url: e,
            requestBodyValues: r,
            statusCode: t.status,
            responseHeaders: n,
            responseBody: void 0,
          });
        try {
          const s = await t.arrayBuffer();
          return { responseHeaders: n, value: new Uint8Array(s) };
        } catch (s) {
          throw new ye({
            message: "Failed to read response as array buffer",
            url: e,
            requestBodyValues: r,
            statusCode: t.status,
            responseHeaders: n,
            responseBody: void 0,
            cause: s,
          });
        }
      },
    { btoa: Vo, atob: Bo } = globalThis;
  function Lo(t) {
    const e = t.replace(/-/g, "+").replace(/_/g, "/"),
      r = Bo(e);
    return Uint8Array.from(r, (n) => n.codePointAt(0));
  }
  function Es(t) {
    let e = "";
    for (let r = 0; r < t.length; r++) e += String.fromCodePoint(t[r]);
    return Vo(e);
  }
  function Fo(t) {
    return t == null ? void 0 : t.replace(/\/$/, "");
  }
  const Uo = Symbol("Let zodToJsonSchema decide on which parser to use"),
    Is = {
      name: void 0,
      $refStrategy: "root",
      basePath: ["#"],
      effectStrategy: "input",
      pipeStrategy: "all",
      dateStrategy: "format:date-time",
      mapStrategy: "entries",
      removeAdditionalStrategy: "passthrough",
      allowedAdditionalProperties: !0,
      rejectedAdditionalProperties: !1,
      definitionPath: "definitions",
      target: "jsonSchema7",
      strictUnions: !1,
      definitions: {},
      errorMessages: !1,
      markdownDescription: !1,
      patternStrategy: "escape",
      applyRegexFlags: !1,
      emailStrategy: "format:email",
      base64Strategy: "contentEncoding:base64",
      nameStrategy: "ref",
      openAiAnyTypeName: "OpenAiAnyType",
    },
    Zo = (t) => (typeof t == "string" ? { ...Is, name: t } : { ...Is, ...t }),
    zo = (t) => {
      const e = Zo(t),
        r =
          e.name !== void 0
            ? [...e.basePath, e.definitionPath, e.name]
            : e.basePath;
      return {
        ...e,
        flags: { hasReferencedOpenAiAnyType: !1 },
        currentPath: r,
        propertyPath: void 0,
        seen: new Map(
          Object.entries(e.definitions).map(([n, s]) => [
            s._def,
            {
              def: s._def,
              path: [...e.basePath, e.definitionPath, n],
              jsonSchema: void 0,
            },
          ]),
        ),
      };
    };
  function Ts(t, e, r, n) {
    n != null &&
      n.errorMessages &&
      r &&
      (t.errorMessage = { ...t.errorMessage, [e]: r });
  }
  function G(t, e, r, n, s) {
    ((t[e] = r), Ts(t, e, n, s));
  }
  const Cs = (t, e) => {
    let r = 0;
    for (; r < t.length && r < e.length && t[r] === e[r]; r++);
    return [(t.length - r).toString(), ...e.slice(r)].join("/");
  };
  function ge(t) {
    if (t.target !== "openAi") return {};
    const e = [...t.basePath, t.definitionPath, t.openAiAnyTypeName];
    return (
      (t.flags.hasReferencedOpenAiAnyType = !0),
      {
        $ref:
          t.$refStrategy === "relative" ? Cs(e, t.currentPath) : e.join("/"),
      }
    );
  }
  function qo(t, e) {
    var n, s, a;
    const r = { type: "array" };
    return (
      (n = t.type) != null &&
        n._def &&
        ((a = (s = t.type) == null ? void 0 : s._def) == null
          ? void 0
          : a.typeName) !== A.ZodAny &&
        (r.items = Z(t.type._def, {
          ...e,
          currentPath: [...e.currentPath, "items"],
        })),
      t.minLength &&
        G(r, "minItems", t.minLength.value, t.minLength.message, e),
      t.maxLength &&
        G(r, "maxItems", t.maxLength.value, t.maxLength.message, e),
      t.exactLength &&
        (G(r, "minItems", t.exactLength.value, t.exactLength.message, e),
        G(r, "maxItems", t.exactLength.value, t.exactLength.message, e)),
      r
    );
  }
  function Jo(t, e) {
    const r = { type: "integer", format: "int64" };
    if (!t.checks) return r;
    for (const n of t.checks)
      switch (n.kind) {
        case "min":
          e.target === "jsonSchema7"
            ? n.inclusive
              ? G(r, "minimum", n.value, n.message, e)
              : G(r, "exclusiveMinimum", n.value, n.message, e)
            : (n.inclusive || (r.exclusiveMinimum = !0),
              G(r, "minimum", n.value, n.message, e));
          break;
        case "max":
          e.target === "jsonSchema7"
            ? n.inclusive
              ? G(r, "maximum", n.value, n.message, e)
              : G(r, "exclusiveMaximum", n.value, n.message, e)
            : (n.inclusive || (r.exclusiveMaximum = !0),
              G(r, "maximum", n.value, n.message, e));
          break;
        case "multipleOf":
          G(r, "multipleOf", n.value, n.message, e);
          break;
      }
    return r;
  }
  function Ko() {
    return { type: "boolean" };
  }
  function Os(t, e) {
    return Z(t.type._def, e);
  }
  const Go = (t, e) => Z(t.innerType._def, e);
  function Ps(t, e, r) {
    const n = r ?? e.dateStrategy;
    if (Array.isArray(n)) return { anyOf: n.map((s, a) => Ps(t, e, s)) };
    switch (n) {
      case "string":
      case "format:date-time":
        return { type: "string", format: "date-time" };
      case "format:date":
        return { type: "string", format: "date" };
      case "integer":
        return Wo(t, e);
    }
  }
  const Wo = (t, e) => {
    const r = { type: "integer", format: "unix-time" };
    if (e.target === "openApi3") return r;
    for (const n of t.checks)
      switch (n.kind) {
        case "min":
          G(r, "minimum", n.value, n.message, e);
          break;
        case "max":
          G(r, "maximum", n.value, n.message, e);
          break;
      }
    return r;
  };
  function Ho(t, e) {
    return { ...Z(t.innerType._def, e), default: t.defaultValue() };
  }
  function Yo(t, e) {
    return e.effectStrategy === "input" ? Z(t.schema._def, e) : ge(e);
  }
  function Qo(t) {
    return { type: "string", enum: Array.from(t.values) };
  }
  const Xo = (t) => ("type" in t && t.type === "string" ? !1 : "allOf" in t);
  function ec(t, e) {
    const r = [
      Z(t.left._def, { ...e, currentPath: [...e.currentPath, "allOf", "0"] }),
      Z(t.right._def, { ...e, currentPath: [...e.currentPath, "allOf", "1"] }),
    ].filter((a) => !!a);
    let n =
      e.target === "jsonSchema2019-09" ? { unevaluatedProperties: !1 } : void 0;
    const s = [];
    return (
      r.forEach((a) => {
        if (Xo(a))
          (s.push(...a.allOf),
            a.unevaluatedProperties === void 0 && (n = void 0));
        else {
          let i = a;
          if ("additionalProperties" in a && a.additionalProperties === !1) {
            const { additionalProperties: o, ...c } = a;
            i = c;
          } else n = void 0;
          s.push(i);
        }
      }),
      s.length ? { allOf: s, ...n } : void 0
    );
  }
  function tc(t, e) {
    const r = typeof t.value;
    return r !== "bigint" && r !== "number" && r !== "boolean" && r !== "string"
      ? { type: Array.isArray(t.value) ? "array" : "object" }
      : e.target === "openApi3"
        ? { type: r === "bigint" ? "integer" : r, enum: [t.value] }
        : { type: r === "bigint" ? "integer" : r, const: t.value };
  }
  let jr;
  const xe = {
    cuid: /^[cC][^\s-]{8,}$/,
    cuid2: /^[0-9a-z]+$/,
    ulid: /^[0-9A-HJKMNP-TV-Z]{26}$/,
    email:
      /^(?!\.)(?!.*\.\.)([a-zA-Z0-9_'+\-\.]*)[a-zA-Z0-9_+-]@([a-zA-Z0-9][a-zA-Z0-9\-]*\.)+[a-zA-Z]{2,}$/,
    emoji: () => (
      jr === void 0 &&
        (jr = RegExp(
          "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$",
          "u",
        )),
      jr
    ),
    uuid: /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,
    ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,
    ipv4Cidr:
      /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/,
    ipv6: /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/,
    ipv6Cidr:
      /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,
    base64: /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/,
    base64url:
      /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/,
    nanoid: /^[a-zA-Z0-9_-]{21}$/,
    jwt: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/,
  };
  function Rs(t, e) {
    const r = { type: "string" };
    if (t.checks)
      for (const n of t.checks)
        switch (n.kind) {
          case "min":
            G(
              r,
              "minLength",
              typeof r.minLength == "number"
                ? Math.max(r.minLength, n.value)
                : n.value,
              n.message,
              e,
            );
            break;
          case "max":
            G(
              r,
              "maxLength",
              typeof r.maxLength == "number"
                ? Math.min(r.maxLength, n.value)
                : n.value,
              n.message,
              e,
            );
            break;
          case "email":
            switch (e.emailStrategy) {
              case "format:email":
                Ae(r, "email", n.message, e);
                break;
              case "format:idn-email":
                Ae(r, "idn-email", n.message, e);
                break;
              case "pattern:zod":
                fe(r, xe.email, n.message, e);
                break;
            }
            break;
          case "url":
            Ae(r, "uri", n.message, e);
            break;
          case "uuid":
            Ae(r, "uuid", n.message, e);
            break;
          case "regex":
            fe(r, n.regex, n.message, e);
            break;
          case "cuid":
            fe(r, xe.cuid, n.message, e);
            break;
          case "cuid2":
            fe(r, xe.cuid2, n.message, e);
            break;
          case "startsWith":
            fe(r, RegExp(`^${$r(n.value, e)}`), n.message, e);
            break;
          case "endsWith":
            fe(r, RegExp(`${$r(n.value, e)}$`), n.message, e);
            break;
          case "datetime":
            Ae(r, "date-time", n.message, e);
            break;
          case "date":
            Ae(r, "date", n.message, e);
            break;
          case "time":
            Ae(r, "time", n.message, e);
            break;
          case "duration":
            Ae(r, "duration", n.message, e);
            break;
          case "length":
            (G(
              r,
              "minLength",
              typeof r.minLength == "number"
                ? Math.max(r.minLength, n.value)
                : n.value,
              n.message,
              e,
            ),
              G(
                r,
                "maxLength",
                typeof r.maxLength == "number"
                  ? Math.min(r.maxLength, n.value)
                  : n.value,
                n.message,
                e,
              ));
            break;
          case "includes": {
            fe(r, RegExp($r(n.value, e)), n.message, e);
            break;
          }
          case "ip": {
            (n.version !== "v6" && Ae(r, "ipv4", n.message, e),
              n.version !== "v4" && Ae(r, "ipv6", n.message, e));
            break;
          }
          case "base64url":
            fe(r, xe.base64url, n.message, e);
            break;
          case "jwt":
            fe(r, xe.jwt, n.message, e);
            break;
          case "cidr": {
            (n.version !== "v6" && fe(r, xe.ipv4Cidr, n.message, e),
              n.version !== "v4" && fe(r, xe.ipv6Cidr, n.message, e));
            break;
          }
          case "emoji":
            fe(r, xe.emoji(), n.message, e);
            break;
          case "ulid": {
            fe(r, xe.ulid, n.message, e);
            break;
          }
          case "base64": {
            switch (e.base64Strategy) {
              case "format:binary": {
                Ae(r, "binary", n.message, e);
                break;
              }
              case "contentEncoding:base64": {
                G(r, "contentEncoding", "base64", n.message, e);
                break;
              }
              case "pattern:zod": {
                fe(r, xe.base64, n.message, e);
                break;
              }
            }
            break;
          }
          case "nanoid":
            fe(r, xe.nanoid, n.message, e);
        }
    return r;
  }
  function $r(t, e) {
    return e.patternStrategy === "escape" ? nc(t) : t;
  }
  const rc = new Set(
    "ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvxyz0123456789",
  );
  function nc(t) {
    let e = "";
    for (let r = 0; r < t.length; r++)
      (rc.has(t[r]) || (e += "\\"), (e += t[r]));
    return e;
  }
  function Ae(t, e, r, n) {
    var s;
    t.format || ((s = t.anyOf) != null && s.some((a) => a.format))
      ? (t.anyOf || (t.anyOf = []),
        t.format &&
          (t.anyOf.push({
            format: t.format,
            ...(t.errorMessage &&
              n.errorMessages && {
                errorMessage: { format: t.errorMessage.format },
              }),
          }),
          delete t.format,
          t.errorMessage &&
            (delete t.errorMessage.format,
            Object.keys(t.errorMessage).length === 0 && delete t.errorMessage)),
        t.anyOf.push({
          format: e,
          ...(r && n.errorMessages && { errorMessage: { format: r } }),
        }))
      : G(t, "format", e, r, n);
  }
  function fe(t, e, r, n) {
    var s;
    t.pattern || ((s = t.allOf) != null && s.some((a) => a.pattern))
      ? (t.allOf || (t.allOf = []),
        t.pattern &&
          (t.allOf.push({
            pattern: t.pattern,
            ...(t.errorMessage &&
              n.errorMessages && {
                errorMessage: { pattern: t.errorMessage.pattern },
              }),
          }),
          delete t.pattern,
          t.errorMessage &&
            (delete t.errorMessage.pattern,
            Object.keys(t.errorMessage).length === 0 && delete t.errorMessage)),
        t.allOf.push({
          pattern: Ns(e, n),
          ...(r && n.errorMessages && { errorMessage: { pattern: r } }),
        }))
      : G(t, "pattern", Ns(e, n), r, n);
  }
  function Ns(t, e) {
    var c;
    if (!e.applyRegexFlags || !t.flags) return t.source;
    const r = {
        i: t.flags.includes("i"),
        m: t.flags.includes("m"),
        s: t.flags.includes("s"),
      },
      n = r.i ? t.source.toLowerCase() : t.source;
    let s = "",
      a = !1,
      i = !1,
      o = !1;
    for (let l = 0; l < n.length; l++) {
      if (a) {
        ((s += n[l]), (a = !1));
        continue;
      }
      if (r.i) {
        if (i) {
          if (n[l].match(/[a-z]/)) {
            o
              ? ((s += n[l]),
                (s += `${n[l - 2]}-${n[l]}`.toUpperCase()),
                (o = !1))
              : n[l + 1] === "-" && (c = n[l + 2]) != null && c.match(/[a-z]/)
                ? ((s += n[l]), (o = !0))
                : (s += `${n[l]}${n[l].toUpperCase()}`);
            continue;
          }
        } else if (n[l].match(/[a-z]/)) {
          s += `[${n[l]}${n[l].toUpperCase()}]`;
          continue;
        }
      }
      if (r.m) {
        if (n[l] === "^") {
          s += `(^|(?<=[\r
]))`;
          continue;
        } else if (n[l] === "$") {
          s += `($|(?=[\r
]))`;
          continue;
        }
      }
      if (r.s && n[l] === ".") {
        s += i
          ? `${n[l]}\r
`
          : `[${n[l]}\r
]`;
        continue;
      }
      ((s += n[l]),
        n[l] === "\\"
          ? (a = !0)
          : i && n[l] === "]"
            ? (i = !1)
            : !i && n[l] === "[" && (i = !0));
    }
    try {
      new RegExp(s);
    } catch {
      return t.source;
    }
    return s;
  }
  function Ms(t, e) {
    var n, s, a, i, o, c;
    if (
      (e.target,
      e.target === "openApi3" &&
        ((n = t.keyType) == null ? void 0 : n._def.typeName) === A.ZodEnum)
    )
      return {
        type: "object",
        required: t.keyType._def.values,
        properties: t.keyType._def.values.reduce(
          (l, u) => ({
            ...l,
            [u]:
              Z(t.valueType._def, {
                ...e,
                currentPath: [...e.currentPath, "properties", u],
              }) ?? ge(e),
          }),
          {},
        ),
        additionalProperties: e.rejectedAdditionalProperties,
      };
    const r = {
      type: "object",
      additionalProperties:
        Z(t.valueType._def, {
          ...e,
          currentPath: [...e.currentPath, "additionalProperties"],
        }) ?? e.allowedAdditionalProperties,
    };
    if (e.target === "openApi3") return r;
    if (
      ((s = t.keyType) == null ? void 0 : s._def.typeName) === A.ZodString &&
      (a = t.keyType._def.checks) != null &&
      a.length
    ) {
      const { type: l, ...u } = Rs(t.keyType._def, e);
      return { ...r, propertyNames: u };
    } else {
      if (((i = t.keyType) == null ? void 0 : i._def.typeName) === A.ZodEnum)
        return { ...r, propertyNames: { enum: t.keyType._def.values } };
      if (
        ((o = t.keyType) == null ? void 0 : o._def.typeName) === A.ZodBranded &&
        t.keyType._def.type._def.typeName === A.ZodString &&
        (c = t.keyType._def.type._def.checks) != null &&
        c.length
      ) {
        const { type: l, ...u } = Os(t.keyType._def, e);
        return { ...r, propertyNames: u };
      }
    }
    return r;
  }
  function sc(t, e) {
    if (e.mapStrategy === "record") return Ms(t, e);
    const r =
        Z(t.keyType._def, {
          ...e,
          currentPath: [...e.currentPath, "items", "items", "0"],
        }) || ge(e),
      n =
        Z(t.valueType._def, {
          ...e,
          currentPath: [...e.currentPath, "items", "items", "1"],
        }) || ge(e);
    return {
      type: "array",
      maxItems: 125,
      items: { type: "array", items: [r, n], minItems: 2, maxItems: 2 },
    };
  }
  function ac(t) {
    const e = t.values,
      n = Object.keys(t.values)
        .filter((a) => typeof e[e[a]] != "number")
        .map((a) => e[a]),
      s = Array.from(new Set(n.map((a) => typeof a)));
    return {
      type:
        s.length === 1
          ? s[0] === "string"
            ? "string"
            : "number"
          : ["string", "number"],
      enum: n,
    };
  }
  function ic(t) {
    return t.target === "openAi"
      ? void 0
      : { not: ge({ ...t, currentPath: [...t.currentPath, "not"] }) };
  }
  function oc(t) {
    return t.target === "openApi3"
      ? { enum: ["null"], nullable: !0 }
      : { type: "null" };
  }
  const sr = {
    ZodString: "string",
    ZodNumber: "number",
    ZodBigInt: "integer",
    ZodBoolean: "boolean",
    ZodNull: "null",
  };
  function cc(t, e) {
    if (e.target === "openApi3") return js(t, e);
    const r =
      t.options instanceof Map ? Array.from(t.options.values()) : t.options;
    if (
      r.every(
        (n) =>
          n._def.typeName in sr && (!n._def.checks || !n._def.checks.length),
      )
    ) {
      const n = r.reduce((s, a) => {
        const i = sr[a._def.typeName];
        return i && !s.includes(i) ? [...s, i] : s;
      }, []);
      return { type: n.length > 1 ? n : n[0] };
    } else if (
      r.every((n) => n._def.typeName === "ZodLiteral" && !n.description)
    ) {
      const n = r.reduce((s, a) => {
        const i = typeof a._def.value;
        switch (i) {
          case "string":
          case "number":
          case "boolean":
            return [...s, i];
          case "bigint":
            return [...s, "integer"];
          case "object":
            if (a._def.value === null) return [...s, "null"];
          case "symbol":
          case "undefined":
          case "function":
          default:
            return s;
        }
      }, []);
      if (n.length === r.length) {
        const s = n.filter((a, i, o) => o.indexOf(a) === i);
        return {
          type: s.length > 1 ? s : s[0],
          enum: r.reduce(
            (a, i) => (a.includes(i._def.value) ? a : [...a, i._def.value]),
            [],
          ),
        };
      }
    } else if (r.every((n) => n._def.typeName === "ZodEnum"))
      return {
        type: "string",
        enum: r.reduce(
          (n, s) => [...n, ...s._def.values.filter((a) => !n.includes(a))],
          [],
        ),
      };
    return js(t, e);
  }
  const js = (t, e) => {
    const r = (
      t.options instanceof Map ? Array.from(t.options.values()) : t.options
    )
      .map((n, s) =>
        Z(n._def, { ...e, currentPath: [...e.currentPath, "anyOf", `${s}`] }),
      )
      .filter(
        (n) =>
          !!n &&
          (!e.strictUnions ||
            (typeof n == "object" && Object.keys(n).length > 0)),
      );
    return r.length ? { anyOf: r } : void 0;
  };
  function lc(t, e) {
    if (
      ["ZodString", "ZodNumber", "ZodBigInt", "ZodBoolean", "ZodNull"].includes(
        t.innerType._def.typeName,
      ) &&
      (!t.innerType._def.checks || !t.innerType._def.checks.length)
    )
      return e.target === "openApi3"
        ? { type: sr[t.innerType._def.typeName], nullable: !0 }
        : { type: [sr[t.innerType._def.typeName], "null"] };
    if (e.target === "openApi3") {
      const n = Z(t.innerType._def, { ...e, currentPath: [...e.currentPath] });
      return n && "$ref" in n
        ? { allOf: [n], nullable: !0 }
        : n && { ...n, nullable: !0 };
    }
    const r = Z(t.innerType._def, {
      ...e,
      currentPath: [...e.currentPath, "anyOf", "0"],
    });
    return r && { anyOf: [r, { type: "null" }] };
  }
  function uc(t, e) {
    const r = { type: "number" };
    if (!t.checks) return r;
    for (const n of t.checks)
      switch (n.kind) {
        case "int":
          ((r.type = "integer"), Ts(r, "type", n.message, e));
          break;
        case "min":
          e.target === "jsonSchema7"
            ? n.inclusive
              ? G(r, "minimum", n.value, n.message, e)
              : G(r, "exclusiveMinimum", n.value, n.message, e)
            : (n.inclusive || (r.exclusiveMinimum = !0),
              G(r, "minimum", n.value, n.message, e));
          break;
        case "max":
          e.target === "jsonSchema7"
            ? n.inclusive
              ? G(r, "maximum", n.value, n.message, e)
              : G(r, "exclusiveMaximum", n.value, n.message, e)
            : (n.inclusive || (r.exclusiveMaximum = !0),
              G(r, "maximum", n.value, n.message, e));
          break;
        case "multipleOf":
          G(r, "multipleOf", n.value, n.message, e);
          break;
      }
    return r;
  }
  function dc(t, e) {
    const r = e.target === "openAi",
      n = { type: "object", properties: {} },
      s = [],
      a = t.shape();
    for (const o in a) {
      let c = a[o];
      if (c === void 0 || c._def === void 0) continue;
      let l = mc(c);
      l &&
        r &&
        (c._def.typeName === "ZodOptional" && (c = c._def.innerType),
        c.isNullable() || (c = c.nullable()),
        (l = !1));
      const u = Z(c._def, {
        ...e,
        currentPath: [...e.currentPath, "properties", o],
        propertyPath: [...e.currentPath, "properties", o],
      });
      u !== void 0 && ((n.properties[o] = u), l || s.push(o));
    }
    s.length && (n.required = s);
    const i = pc(t, e);
    return (i !== void 0 && (n.additionalProperties = i), n);
  }
  function pc(t, e) {
    if (t.catchall._def.typeName !== "ZodNever")
      return Z(t.catchall._def, {
        ...e,
        currentPath: [...e.currentPath, "additionalProperties"],
      });
    switch (t.unknownKeys) {
      case "passthrough":
        return e.allowedAdditionalProperties;
      case "strict":
        return e.rejectedAdditionalProperties;
      case "strip":
        return e.removeAdditionalStrategy === "strict"
          ? e.allowedAdditionalProperties
          : e.rejectedAdditionalProperties;
    }
  }
  function mc(t) {
    try {
      return t.isOptional();
    } catch {
      return !0;
    }
  }
  const fc = (t, e) => {
      var n;
      if (
        e.currentPath.toString() ===
        ((n = e.propertyPath) == null ? void 0 : n.toString())
      )
        return Z(t.innerType._def, e);
      const r = Z(t.innerType._def, {
        ...e,
        currentPath: [...e.currentPath, "anyOf", "1"],
      });
      return r ? { anyOf: [{ not: ge(e) }, r] } : ge(e);
    },
    gc = (t, e) => {
      if (e.pipeStrategy === "input") return Z(t.in._def, e);
      if (e.pipeStrategy === "output") return Z(t.out._def, e);
      const r = Z(t.in._def, {
          ...e,
          currentPath: [...e.currentPath, "allOf", "0"],
        }),
        n = Z(t.out._def, {
          ...e,
          currentPath: [...e.currentPath, "allOf", r ? "1" : "0"],
        });
      return { allOf: [r, n].filter((s) => s !== void 0) };
    };
  function hc(t, e) {
    return Z(t.type._def, e);
  }
  function yc(t, e) {
    const n = {
      type: "array",
      uniqueItems: !0,
      items: Z(t.valueType._def, {
        ...e,
        currentPath: [...e.currentPath, "items"],
      }),
    };
    return (
      t.minSize && G(n, "minItems", t.minSize.value, t.minSize.message, e),
      t.maxSize && G(n, "maxItems", t.maxSize.value, t.maxSize.message, e),
      n
    );
  }
  function vc(t, e) {
    return t.rest
      ? {
          type: "array",
          minItems: t.items.length,
          items: t.items
            .map((r, n) =>
              Z(r._def, {
                ...e,
                currentPath: [...e.currentPath, "items", `${n}`],
              }),
            )
            .reduce((r, n) => (n === void 0 ? r : [...r, n]), []),
          additionalItems: Z(t.rest._def, {
            ...e,
            currentPath: [...e.currentPath, "additionalItems"],
          }),
        }
      : {
          type: "array",
          minItems: t.items.length,
          maxItems: t.items.length,
          items: t.items
            .map((r, n) =>
              Z(r._def, {
                ...e,
                currentPath: [...e.currentPath, "items", `${n}`],
              }),
            )
            .reduce((r, n) => (n === void 0 ? r : [...r, n]), []),
        };
  }
  function _c(t) {
    return { not: ge(t) };
  }
  function bc(t) {
    return ge(t);
  }
  const wc = (t, e) => Z(t.innerType._def, e),
    kc = (t, e, r) => {
      switch (e) {
        case A.ZodString:
          return Rs(t, r);
        case A.ZodNumber:
          return uc(t, r);
        case A.ZodObject:
          return dc(t, r);
        case A.ZodBigInt:
          return Jo(t, r);
        case A.ZodBoolean:
          return Ko();
        case A.ZodDate:
          return Ps(t, r);
        case A.ZodUndefined:
          return _c(r);
        case A.ZodNull:
          return oc(r);
        case A.ZodArray:
          return qo(t, r);
        case A.ZodUnion:
        case A.ZodDiscriminatedUnion:
          return cc(t, r);
        case A.ZodIntersection:
          return ec(t, r);
        case A.ZodTuple:
          return vc(t, r);
        case A.ZodRecord:
          return Ms(t, r);
        case A.ZodLiteral:
          return tc(t, r);
        case A.ZodEnum:
          return Qo(t);
        case A.ZodNativeEnum:
          return ac(t);
        case A.ZodNullable:
          return lc(t, r);
        case A.ZodOptional:
          return fc(t, r);
        case A.ZodMap:
          return sc(t, r);
        case A.ZodSet:
          return yc(t, r);
        case A.ZodLazy:
          return () => t.getter()._def;
        case A.ZodPromise:
          return hc(t, r);
        case A.ZodNaN:
        case A.ZodNever:
          return ic(r);
        case A.ZodEffects:
          return Yo(t, r);
        case A.ZodAny:
          return ge(r);
        case A.ZodUnknown:
          return bc(r);
        case A.ZodDefault:
          return Ho(t, r);
        case A.ZodBranded:
          return Os(t, r);
        case A.ZodReadonly:
          return wc(t, r);
        case A.ZodCatch:
          return Go(t, r);
        case A.ZodPipeline:
          return gc(t, r);
        case A.ZodFunction:
        case A.ZodVoid:
        case A.ZodSymbol:
          return;
        default:
          return ((n) => {})();
      }
    };
  function Z(t, e, r = !1) {
    var o;
    const n = e.seen.get(t);
    if (e.override) {
      const c = (o = e.override) == null ? void 0 : o.call(e, t, e, n, r);
      if (c !== Uo) return c;
    }
    if (n && !r) {
      const c = xc(n, e);
      if (c !== void 0) return c;
    }
    const s = { def: t, path: e.currentPath, jsonSchema: void 0 };
    e.seen.set(t, s);
    const a = kc(t, t.typeName, e),
      i = typeof a == "function" ? Z(a(), e) : a;
    if ((i && Ac(t, e, i), e.postProcess)) {
      const c = e.postProcess(i, t, e);
      return ((s.jsonSchema = i), c);
    }
    return ((s.jsonSchema = i), i);
  }
  const xc = (t, e) => {
      switch (e.$refStrategy) {
        case "root":
          return { $ref: t.path.join("/") };
        case "relative":
          return { $ref: Cs(e.currentPath, t.path) };
        case "none":
        case "seen":
          return (t.path.length < e.currentPath.length &&
            t.path.every((r, n) => e.currentPath[n] === r)) ||
            e.$refStrategy === "seen"
            ? ge(e)
            : void 0;
      }
    },
    Ac = (t, e, r) => (
      t.description &&
        ((r.description = t.description),
        e.markdownDescription && (r.markdownDescription = t.description)),
      r
    ),
    Sc = (t, e) => {
      const r = zo(e);
      let n =
        typeof e == "object" && e.definitions
          ? Object.entries(e.definitions).reduce(
              (c, [l, u]) => ({
                ...c,
                [l]:
                  Z(
                    u._def,
                    { ...r, currentPath: [...r.basePath, r.definitionPath, l] },
                    !0,
                  ) ?? ge(r),
              }),
              {},
            )
          : void 0;
      const s =
          typeof e == "string"
            ? e
            : (e == null ? void 0 : e.nameStrategy) === "title" || e == null
              ? void 0
              : e.name,
        a =
          Z(
            t._def,
            s === void 0
              ? r
              : { ...r, currentPath: [...r.basePath, r.definitionPath, s] },
            !1,
          ) ?? ge(r),
        i =
          typeof e == "object" &&
          e.name !== void 0 &&
          e.nameStrategy === "title"
            ? e.name
            : void 0;
      (i !== void 0 && (a.title = i),
        r.flags.hasReferencedOpenAiAnyType &&
          (n || (n = {}),
          n[r.openAiAnyTypeName] ||
            (n[r.openAiAnyTypeName] = {
              type: ["string", "number", "integer", "boolean", "array", "null"],
              items: {
                $ref:
                  r.$refStrategy === "relative"
                    ? "1"
                    : [
                        ...r.basePath,
                        r.definitionPath,
                        r.openAiAnyTypeName,
                      ].join("/"),
              },
            })));
      const o =
        s === void 0
          ? n
            ? { ...a, [r.definitionPath]: n }
            : a
          : {
              $ref: [
                ...(r.$refStrategy === "relative" ? [] : r.basePath),
                r.definitionPath,
                s,
              ].join("/"),
              [r.definitionPath]: { ...n, [s]: a },
            };
      return (
        r.target === "jsonSchema7"
          ? (o.$schema = "http://json-schema.org/draft-07/schema#")
          : (r.target === "jsonSchema2019-09" || r.target === "openAi") &&
            (o.$schema = "https://json-schema.org/draft/2019-09/schema#"),
        r.target === "openAi" &&
          ("anyOf" in o ||
            "oneOf" in o ||
            "allOf" in o ||
            ("type" in o && Array.isArray(o.type))),
        o
      );
    };
  var vt = {
      code: "0",
      name: "text",
      parse: (t) => {
        if (typeof t != "string")
          throw new Error('"text" parts expect a string value.');
        return { type: "text", value: t };
      },
    },
    _t = {
      code: "3",
      name: "error",
      parse: (t) => {
        if (typeof t != "string")
          throw new Error('"error" parts expect a string value.');
        return { type: "error", value: t };
      },
    },
    bt = {
      code: "4",
      name: "assistant_message",
      parse: (t) => {
        if (
          t == null ||
          typeof t != "object" ||
          !("id" in t) ||
          !("role" in t) ||
          !("content" in t) ||
          typeof t.id != "string" ||
          typeof t.role != "string" ||
          t.role !== "assistant" ||
          !Array.isArray(t.content) ||
          !t.content.every(
            (e) =>
              e != null &&
              typeof e == "object" &&
              "type" in e &&
              e.type === "text" &&
              "text" in e &&
              e.text != null &&
              typeof e.text == "object" &&
              "value" in e.text &&
              typeof e.text.value == "string",
          )
        )
          throw new Error(
            '"assistant_message" parts expect an object with an "id", "role", and "content" property.',
          );
        return { type: "assistant_message", value: t };
      },
    },
    wt = {
      code: "5",
      name: "assistant_control_data",
      parse: (t) => {
        if (
          t == null ||
          typeof t != "object" ||
          !("threadId" in t) ||
          !("messageId" in t) ||
          typeof t.threadId != "string" ||
          typeof t.messageId != "string"
        )
          throw new Error(
            '"assistant_control_data" parts expect an object with a "threadId" and "messageId" property.',
          );
        return {
          type: "assistant_control_data",
          value: { threadId: t.threadId, messageId: t.messageId },
        };
      },
    },
    kt = {
      code: "6",
      name: "data_message",
      parse: (t) => {
        if (
          t == null ||
          typeof t != "object" ||
          !("role" in t) ||
          !("data" in t) ||
          typeof t.role != "string" ||
          t.role !== "data"
        )
          throw new Error(
            '"data_message" parts expect an object with a "role" and "data" property.',
          );
        return { type: "data_message", value: t };
      },
    },
    Ec = [vt, _t, bt, wt, kt];
  (vt.code + "",
    _t.code + "",
    bt.code + "",
    wt.code + "",
    kt.code + "",
    vt.name + "",
    vt.code,
    _t.name + "",
    _t.code,
    bt.name + "",
    bt.code,
    wt.name + "",
    wt.code,
    kt.name + "",
    kt.code,
    Ec.map((t) => t.code));
  function Ic(t) {
    const e = ["ROOT"];
    let r = -1,
      n = null;
    function s(c, l, u) {
      switch (c) {
        case '"': {
          ((r = l), e.pop(), e.push(u), e.push("INSIDE_STRING"));
          break;
        }
        case "f":
        case "t":
        case "n": {
          ((r = l), (n = l), e.pop(), e.push(u), e.push("INSIDE_LITERAL"));
          break;
        }
        case "-": {
          (e.pop(), e.push(u), e.push("INSIDE_NUMBER"));
          break;
        }
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9": {
          ((r = l), e.pop(), e.push(u), e.push("INSIDE_NUMBER"));
          break;
        }
        case "{": {
          ((r = l), e.pop(), e.push(u), e.push("INSIDE_OBJECT_START"));
          break;
        }
        case "[": {
          ((r = l), e.pop(), e.push(u), e.push("INSIDE_ARRAY_START"));
          break;
        }
      }
    }
    function a(c, l) {
      switch (c) {
        case ",": {
          (e.pop(), e.push("INSIDE_OBJECT_AFTER_COMMA"));
          break;
        }
        case "}": {
          ((r = l), e.pop());
          break;
        }
      }
    }
    function i(c, l) {
      switch (c) {
        case ",": {
          (e.pop(), e.push("INSIDE_ARRAY_AFTER_COMMA"));
          break;
        }
        case "]": {
          ((r = l), e.pop());
          break;
        }
      }
    }
    for (let c = 0; c < t.length; c++) {
      const l = t[c];
      switch (e[e.length - 1]) {
        case "ROOT":
          s(l, c, "FINISH");
          break;
        case "INSIDE_OBJECT_START": {
          switch (l) {
            case '"': {
              (e.pop(), e.push("INSIDE_OBJECT_KEY"));
              break;
            }
            case "}": {
              ((r = c), e.pop());
              break;
            }
          }
          break;
        }
        case "INSIDE_OBJECT_AFTER_COMMA": {
          switch (l) {
            case '"': {
              (e.pop(), e.push("INSIDE_OBJECT_KEY"));
              break;
            }
          }
          break;
        }
        case "INSIDE_OBJECT_KEY": {
          switch (l) {
            case '"': {
              (e.pop(), e.push("INSIDE_OBJECT_AFTER_KEY"));
              break;
            }
          }
          break;
        }
        case "INSIDE_OBJECT_AFTER_KEY": {
          switch (l) {
            case ":": {
              (e.pop(), e.push("INSIDE_OBJECT_BEFORE_VALUE"));
              break;
            }
          }
          break;
        }
        case "INSIDE_OBJECT_BEFORE_VALUE": {
          s(l, c, "INSIDE_OBJECT_AFTER_VALUE");
          break;
        }
        case "INSIDE_OBJECT_AFTER_VALUE": {
          a(l, c);
          break;
        }
        case "INSIDE_STRING": {
          switch (l) {
            case '"': {
              (e.pop(), (r = c));
              break;
            }
            case "\\": {
              e.push("INSIDE_STRING_ESCAPE");
              break;
            }
            default:
              r = c;
          }
          break;
        }
        case "INSIDE_ARRAY_START": {
          switch (l) {
            case "]": {
              ((r = c), e.pop());
              break;
            }
            default: {
              ((r = c), s(l, c, "INSIDE_ARRAY_AFTER_VALUE"));
              break;
            }
          }
          break;
        }
        case "INSIDE_ARRAY_AFTER_VALUE": {
          switch (l) {
            case ",": {
              (e.pop(), e.push("INSIDE_ARRAY_AFTER_COMMA"));
              break;
            }
            case "]": {
              ((r = c), e.pop());
              break;
            }
            default: {
              r = c;
              break;
            }
          }
          break;
        }
        case "INSIDE_ARRAY_AFTER_COMMA": {
          s(l, c, "INSIDE_ARRAY_AFTER_VALUE");
          break;
        }
        case "INSIDE_STRING_ESCAPE": {
          (e.pop(), (r = c));
          break;
        }
        case "INSIDE_NUMBER": {
          switch (l) {
            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9": {
              r = c;
              break;
            }
            case "e":
            case "E":
            case "-":
            case ".":
              break;
            case ",": {
              (e.pop(),
                e[e.length - 1] === "INSIDE_ARRAY_AFTER_VALUE" && i(l, c),
                e[e.length - 1] === "INSIDE_OBJECT_AFTER_VALUE" && a(l, c));
              break;
            }
            case "}": {
              (e.pop(),
                e[e.length - 1] === "INSIDE_OBJECT_AFTER_VALUE" && a(l, c));
              break;
            }
            case "]": {
              (e.pop(),
                e[e.length - 1] === "INSIDE_ARRAY_AFTER_VALUE" && i(l, c));
              break;
            }
            default: {
              e.pop();
              break;
            }
          }
          break;
        }
        case "INSIDE_LITERAL": {
          const f = t.substring(n, c + 1);
          !"false".startsWith(f) &&
          !"true".startsWith(f) &&
          !"null".startsWith(f)
            ? (e.pop(),
              e[e.length - 1] === "INSIDE_OBJECT_AFTER_VALUE"
                ? a(l, c)
                : e[e.length - 1] === "INSIDE_ARRAY_AFTER_VALUE" && i(l, c))
            : (r = c);
          break;
        }
      }
    }
    let o = t.slice(0, r + 1);
    for (let c = e.length - 1; c >= 0; c--)
      switch (e[c]) {
        case "INSIDE_STRING": {
          o += '"';
          break;
        }
        case "INSIDE_OBJECT_KEY":
        case "INSIDE_OBJECT_AFTER_KEY":
        case "INSIDE_OBJECT_AFTER_COMMA":
        case "INSIDE_OBJECT_START":
        case "INSIDE_OBJECT_BEFORE_VALUE":
        case "INSIDE_OBJECT_AFTER_VALUE": {
          o += "}";
          break;
        }
        case "INSIDE_ARRAY_START":
        case "INSIDE_ARRAY_AFTER_COMMA":
        case "INSIDE_ARRAY_AFTER_VALUE": {
          o += "]";
          break;
        }
        case "INSIDE_LITERAL": {
          const u = t.substring(n, t.length);
          "true".startsWith(u)
            ? (o += "true".slice(u.length))
            : "false".startsWith(u)
              ? (o += "false".slice(u.length))
              : "null".startsWith(u) && (o += "null".slice(u.length));
        }
      }
    return o;
  }
  function Tc(t) {
    if (t === void 0) return { value: void 0, state: "undefined-input" };
    let e = yt({ text: t });
    return e.success
      ? { value: e.value, state: "successful-parse" }
      : ((e = yt({ text: Ic(t) })),
        e.success
          ? { value: e.value, state: "repaired-parse" }
          : { value: void 0, state: "failed-parse" });
  }
  var Cc = {
      code: "0",
      name: "text",
      parse: (t) => {
        if (typeof t != "string")
          throw new Error('"text" parts expect a string value.');
        return { type: "text", value: t };
      },
    },
    Oc = {
      code: "2",
      name: "data",
      parse: (t) => {
        if (!Array.isArray(t))
          throw new Error('"data" parts expect an array value.');
        return { type: "data", value: t };
      },
    },
    Pc = {
      code: "3",
      name: "error",
      parse: (t) => {
        if (typeof t != "string")
          throw new Error('"error" parts expect a string value.');
        return { type: "error", value: t };
      },
    },
    Rc = {
      code: "8",
      name: "message_annotations",
      parse: (t) => {
        if (!Array.isArray(t))
          throw new Error('"message_annotations" parts expect an array value.');
        return { type: "message_annotations", value: t };
      },
    },
    Nc = {
      code: "9",
      name: "tool_call",
      parse: (t) => {
        if (
          t == null ||
          typeof t != "object" ||
          !("toolCallId" in t) ||
          typeof t.toolCallId != "string" ||
          !("toolName" in t) ||
          typeof t.toolName != "string" ||
          !("args" in t) ||
          typeof t.args != "object"
        )
          throw new Error(
            '"tool_call" parts expect an object with a "toolCallId", "toolName", and "args" property.',
          );
        return { type: "tool_call", value: t };
      },
    },
    Mc = {
      code: "a",
      name: "tool_result",
      parse: (t) => {
        if (
          t == null ||
          typeof t != "object" ||
          !("toolCallId" in t) ||
          typeof t.toolCallId != "string" ||
          !("result" in t)
        )
          throw new Error(
            '"tool_result" parts expect an object with a "toolCallId" and a "result" property.',
          );
        return { type: "tool_result", value: t };
      },
    },
    jc = {
      code: "b",
      name: "tool_call_streaming_start",
      parse: (t) => {
        if (
          t == null ||
          typeof t != "object" ||
          !("toolCallId" in t) ||
          typeof t.toolCallId != "string" ||
          !("toolName" in t) ||
          typeof t.toolName != "string"
        )
          throw new Error(
            '"tool_call_streaming_start" parts expect an object with a "toolCallId" and "toolName" property.',
          );
        return { type: "tool_call_streaming_start", value: t };
      },
    },
    $c = {
      code: "c",
      name: "tool_call_delta",
      parse: (t) => {
        if (
          t == null ||
          typeof t != "object" ||
          !("toolCallId" in t) ||
          typeof t.toolCallId != "string" ||
          !("argsTextDelta" in t) ||
          typeof t.argsTextDelta != "string"
        )
          throw new Error(
            '"tool_call_delta" parts expect an object with a "toolCallId" and "argsTextDelta" property.',
          );
        return { type: "tool_call_delta", value: t };
      },
    },
    Dc = {
      code: "d",
      name: "finish_message",
      parse: (t) => {
        if (
          t == null ||
          typeof t != "object" ||
          !("finishReason" in t) ||
          typeof t.finishReason != "string"
        )
          throw new Error(
            '"finish_message" parts expect an object with a "finishReason" property.',
          );
        const e = { finishReason: t.finishReason };
        return (
          "usage" in t &&
            t.usage != null &&
            typeof t.usage == "object" &&
            "promptTokens" in t.usage &&
            "completionTokens" in t.usage &&
            (e.usage = {
              promptTokens:
                typeof t.usage.promptTokens == "number"
                  ? t.usage.promptTokens
                  : Number.NaN,
              completionTokens:
                typeof t.usage.completionTokens == "number"
                  ? t.usage.completionTokens
                  : Number.NaN,
            }),
          { type: "finish_message", value: e }
        );
      },
    },
    Vc = {
      code: "e",
      name: "finish_step",
      parse: (t) => {
        if (
          t == null ||
          typeof t != "object" ||
          !("finishReason" in t) ||
          typeof t.finishReason != "string"
        )
          throw new Error(
            '"finish_step" parts expect an object with a "finishReason" property.',
          );
        const e = { finishReason: t.finishReason, isContinued: !1 };
        return (
          "usage" in t &&
            t.usage != null &&
            typeof t.usage == "object" &&
            "promptTokens" in t.usage &&
            "completionTokens" in t.usage &&
            (e.usage = {
              promptTokens:
                typeof t.usage.promptTokens == "number"
                  ? t.usage.promptTokens
                  : Number.NaN,
              completionTokens:
                typeof t.usage.completionTokens == "number"
                  ? t.usage.completionTokens
                  : Number.NaN,
            }),
          "isContinued" in t &&
            typeof t.isContinued == "boolean" &&
            (e.isContinued = t.isContinued),
          { type: "finish_step", value: e }
        );
      },
    },
    Bc = {
      code: "f",
      name: "start_step",
      parse: (t) => {
        if (
          t == null ||
          typeof t != "object" ||
          !("messageId" in t) ||
          typeof t.messageId != "string"
        )
          throw new Error(
            '"start_step" parts expect an object with an "id" property.',
          );
        return { type: "start_step", value: { messageId: t.messageId } };
      },
    },
    Lc = {
      code: "g",
      name: "reasoning",
      parse: (t) => {
        if (typeof t != "string")
          throw new Error('"reasoning" parts expect a string value.');
        return { type: "reasoning", value: t };
      },
    },
    Fc = {
      code: "h",
      name: "source",
      parse: (t) => {
        if (t == null || typeof t != "object")
          throw new Error('"source" parts expect a Source object.');
        return { type: "source", value: t };
      },
    },
    Uc = {
      code: "i",
      name: "redacted_reasoning",
      parse: (t) => {
        if (
          t == null ||
          typeof t != "object" ||
          !("data" in t) ||
          typeof t.data != "string"
        )
          throw new Error(
            '"redacted_reasoning" parts expect an object with a "data" property.',
          );
        return { type: "redacted_reasoning", value: { data: t.data } };
      },
    },
    Zc = {
      code: "j",
      name: "reasoning_signature",
      parse: (t) => {
        if (
          t == null ||
          typeof t != "object" ||
          !("signature" in t) ||
          typeof t.signature != "string"
        )
          throw new Error(
            '"reasoning_signature" parts expect an object with a "signature" property.',
          );
        return {
          type: "reasoning_signature",
          value: { signature: t.signature },
        };
      },
    },
    zc = {
      code: "k",
      name: "file",
      parse: (t) => {
        if (
          t == null ||
          typeof t != "object" ||
          !("data" in t) ||
          typeof t.data != "string" ||
          !("mimeType" in t) ||
          typeof t.mimeType != "string"
        )
          throw new Error(
            '"file" parts expect an object with a "data" and "mimeType" property.',
          );
        return { type: "file", value: t };
      },
    },
    ar = [Cc, Oc, Pc, Rc, Nc, Mc, jc, $c, Dc, Vc, Bc, Lc, Fc, Uc, Zc, zc];
  (Object.fromEntries(ar.map((t) => [t.code, t])),
    Object.fromEntries(ar.map((t) => [t.name, t.code])),
    ar.map((t) => t.code));
  function $s(t, e) {
    const r = ar.find((n) => n.name === t);
    if (!r) throw new Error(`Invalid stream part type: ${t}`);
    return `${r.code}:${JSON.stringify(e)}
`;
  }
  function qc(t, e) {
    var r;
    const n = (r = void 0) != null ? r : !1;
    return Jc(
      Sc(t, { $refStrategy: n ? "root" : "none", target: "jsonSchema7" }),
      {
        validate: (s) => {
          const a = t.safeParse(s);
          return a.success
            ? { success: !0, value: a.data }
            : { success: !1, error: a.error };
        },
      },
    );
  }
  var Dr = Symbol.for("vercel.ai.schema");
  function Jc(t, { validate: e } = {}) {
    return { [Dr]: !0, _type: void 0, [rr]: !0, jsonSchema: t, validate: e };
  }
  function Kc(t) {
    return (
      typeof t == "object" &&
      t !== null &&
      Dr in t &&
      t[Dr] === !0 &&
      "jsonSchema" in t &&
      "validate" in t
    );
  }
  function Gc(t) {
    return Kc(t) ? t : qc(t);
  }
  var Wc =
      typeof globalThis == "object"
        ? globalThis
        : typeof self == "object"
          ? self
          : typeof window == "object"
            ? window
            : typeof global == "object"
              ? global
              : {},
    Xe = "1.9.0",
    Ds = /^(\d+)\.(\d+)\.(\d+)(-(.+))?$/;
  function Hc(t) {
    var e = new Set([t]),
      r = new Set(),
      n = t.match(Ds);
    if (!n)
      return function () {
        return !1;
      };
    var s = { major: +n[1], minor: +n[2], patch: +n[3], prerelease: n[4] };
    if (s.prerelease != null)
      return function (c) {
        return c === t;
      };
    function a(o) {
      return (r.add(o), !1);
    }
    function i(o) {
      return (e.add(o), !0);
    }
    return function (c) {
      if (e.has(c)) return !0;
      if (r.has(c)) return !1;
      var l = c.match(Ds);
      if (!l) return a(c);
      var u = { major: +l[1], minor: +l[2], patch: +l[3], prerelease: l[4] };
      return u.prerelease != null || s.major !== u.major
        ? a(c)
        : s.major === 0
          ? s.minor === u.minor && s.patch <= u.patch
            ? i(c)
            : a(c)
          : s.minor <= u.minor
            ? i(c)
            : a(c);
    };
  }
  var Yc = Hc(Xe),
    Qc = Xe.split(".")[0],
    xt = Symbol.for("opentelemetry.js.api." + Qc),
    At = Wc;
  function St(t, e, r, n) {
    var s;
    n === void 0 && (n = !1);
    var a = (At[xt] =
      (s = At[xt]) !== null && s !== void 0 ? s : { version: Xe });
    if (!n && a[t]) {
      var i = new Error(
        "@opentelemetry/api: Attempted duplicate registration of API: " + t,
      );
      return (r.error(i.stack || i.message), !1);
    }
    if (a.version !== Xe) {
      var i = new Error(
        "@opentelemetry/api: Registration of version v" +
          a.version +
          " for " +
          t +
          " does not match previously registered API v" +
          Xe,
      );
      return (r.error(i.stack || i.message), !1);
    }
    return (
      (a[t] = e),
      r.debug(
        "@opentelemetry/api: Registered a global for " + t + " v" + Xe + ".",
      ),
      !0
    );
  }
  function et(t) {
    var e,
      r,
      n = (e = At[xt]) === null || e === void 0 ? void 0 : e.version;
    if (!(!n || !Yc(n)))
      return (r = At[xt]) === null || r === void 0 ? void 0 : r[t];
  }
  function Et(t, e) {
    e.debug(
      "@opentelemetry/api: Unregistering a global for " + t + " v" + Xe + ".",
    );
    var r = At[xt];
    r && delete r[t];
  }
  var Xc = function (t, e) {
      var r = typeof Symbol == "function" && t[Symbol.iterator];
      if (!r) return t;
      var n = r.call(t),
        s,
        a = [],
        i;
      try {
        for (; (e === void 0 || e-- > 0) && !(s = n.next()).done; )
          a.push(s.value);
      } catch (o) {
        i = { error: o };
      } finally {
        try {
          s && !s.done && (r = n.return) && r.call(n);
        } finally {
          if (i) throw i.error;
        }
      }
      return a;
    },
    el = function (t, e, r) {
      if (r || arguments.length === 2)
        for (var n = 0, s = e.length, a; n < s; n++)
          (a || !(n in e)) &&
            (a || (a = Array.prototype.slice.call(e, 0, n)), (a[n] = e[n]));
      return t.concat(a || Array.prototype.slice.call(e));
    },
    tl = (function () {
      function t(e) {
        this._namespace = e.namespace || "DiagComponentLogger";
      }
      return (
        (t.prototype.debug = function () {
          for (var e = [], r = 0; r < arguments.length; r++)
            e[r] = arguments[r];
          return It("debug", this._namespace, e);
        }),
        (t.prototype.error = function () {
          for (var e = [], r = 0; r < arguments.length; r++)
            e[r] = arguments[r];
          return It("error", this._namespace, e);
        }),
        (t.prototype.info = function () {
          for (var e = [], r = 0; r < arguments.length; r++)
            e[r] = arguments[r];
          return It("info", this._namespace, e);
        }),
        (t.prototype.warn = function () {
          for (var e = [], r = 0; r < arguments.length; r++)
            e[r] = arguments[r];
          return It("warn", this._namespace, e);
        }),
        (t.prototype.verbose = function () {
          for (var e = [], r = 0; r < arguments.length; r++)
            e[r] = arguments[r];
          return It("verbose", this._namespace, e);
        }),
        t
      );
    })();
  function It(t, e, r) {
    var n = et("diag");
    if (n) return (r.unshift(e), n[t].apply(n, el([], Xc(r), !1)));
  }
  var ve;
  (function (t) {
    ((t[(t.NONE = 0)] = "NONE"),
      (t[(t.ERROR = 30)] = "ERROR"),
      (t[(t.WARN = 50)] = "WARN"),
      (t[(t.INFO = 60)] = "INFO"),
      (t[(t.DEBUG = 70)] = "DEBUG"),
      (t[(t.VERBOSE = 80)] = "VERBOSE"),
      (t[(t.ALL = 9999)] = "ALL"));
  })(ve || (ve = {}));
  function rl(t, e) {
    (t < ve.NONE ? (t = ve.NONE) : t > ve.ALL && (t = ve.ALL), (e = e || {}));
    function r(n, s) {
      var a = e[n];
      return typeof a == "function" && t >= s ? a.bind(e) : function () {};
    }
    return {
      error: r("error", ve.ERROR),
      warn: r("warn", ve.WARN),
      info: r("info", ve.INFO),
      debug: r("debug", ve.DEBUG),
      verbose: r("verbose", ve.VERBOSE),
    };
  }
  var nl = function (t, e) {
      var r = typeof Symbol == "function" && t[Symbol.iterator];
      if (!r) return t;
      var n = r.call(t),
        s,
        a = [],
        i;
      try {
        for (; (e === void 0 || e-- > 0) && !(s = n.next()).done; )
          a.push(s.value);
      } catch (o) {
        i = { error: o };
      } finally {
        try {
          s && !s.done && (r = n.return) && r.call(n);
        } finally {
          if (i) throw i.error;
        }
      }
      return a;
    },
    sl = function (t, e, r) {
      if (r || arguments.length === 2)
        for (var n = 0, s = e.length, a; n < s; n++)
          (a || !(n in e)) &&
            (a || (a = Array.prototype.slice.call(e, 0, n)), (a[n] = e[n]));
      return t.concat(a || Array.prototype.slice.call(e));
    },
    al = "diag",
    Oe = (function () {
      function t() {
        function e(s) {
          return function () {
            for (var a = [], i = 0; i < arguments.length; i++)
              a[i] = arguments[i];
            var o = et("diag");
            if (o) return o[s].apply(o, sl([], nl(a), !1));
          };
        }
        var r = this,
          n = function (s, a) {
            var i, o, c;
            if ((a === void 0 && (a = { logLevel: ve.INFO }), s === r)) {
              var l = new Error(
                "Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a custom implementation",
              );
              return (
                r.error((i = l.stack) !== null && i !== void 0 ? i : l.message),
                !1
              );
            }
            typeof a == "number" && (a = { logLevel: a });
            var u = et("diag"),
              f = rl(
                (o = a.logLevel) !== null && o !== void 0 ? o : ve.INFO,
                s,
              );
            if (u && !a.suppressOverrideMessage) {
              var _ =
                (c = new Error().stack) !== null && c !== void 0
                  ? c
                  : "<failed to generate stacktrace>";
              (u.warn("Current logger will be overwritten from " + _),
                f.warn(
                  "Current logger will overwrite one already registered from " +
                    _,
                ));
            }
            return St("diag", f, r, !0);
          };
        ((r.setLogger = n),
          (r.disable = function () {
            Et(al, r);
          }),
          (r.createComponentLogger = function (s) {
            return new tl(s);
          }),
          (r.verbose = e("verbose")),
          (r.debug = e("debug")),
          (r.info = e("info")),
          (r.warn = e("warn")),
          (r.error = e("error")));
      }
      return (
        (t.instance = function () {
          return (this._instance || (this._instance = new t()), this._instance);
        }),
        t
      );
    })(),
    il = function (t, e) {
      var r = typeof Symbol == "function" && t[Symbol.iterator];
      if (!r) return t;
      var n = r.call(t),
        s,
        a = [],
        i;
      try {
        for (; (e === void 0 || e-- > 0) && !(s = n.next()).done; )
          a.push(s.value);
      } catch (o) {
        i = { error: o };
      } finally {
        try {
          s && !s.done && (r = n.return) && r.call(n);
        } finally {
          if (i) throw i.error;
        }
      }
      return a;
    },
    ol = function (t) {
      var e = typeof Symbol == "function" && Symbol.iterator,
        r = e && t[e],
        n = 0;
      if (r) return r.call(t);
      if (t && typeof t.length == "number")
        return {
          next: function () {
            return (
              t && n >= t.length && (t = void 0),
              { value: t && t[n++], done: !t }
            );
          },
        };
      throw new TypeError(
        e ? "Object is not iterable." : "Symbol.iterator is not defined.",
      );
    },
    cl = (function () {
      function t(e) {
        this._entries = e ? new Map(e) : new Map();
      }
      return (
        (t.prototype.getEntry = function (e) {
          var r = this._entries.get(e);
          if (r) return Object.assign({}, r);
        }),
        (t.prototype.getAllEntries = function () {
          return Array.from(this._entries.entries()).map(function (e) {
            var r = il(e, 2),
              n = r[0],
              s = r[1];
            return [n, s];
          });
        }),
        (t.prototype.setEntry = function (e, r) {
          var n = new t(this._entries);
          return (n._entries.set(e, r), n);
        }),
        (t.prototype.removeEntry = function (e) {
          var r = new t(this._entries);
          return (r._entries.delete(e), r);
        }),
        (t.prototype.removeEntries = function () {
          for (var e, r, n = [], s = 0; s < arguments.length; s++)
            n[s] = arguments[s];
          var a = new t(this._entries);
          try {
            for (var i = ol(n), o = i.next(); !o.done; o = i.next()) {
              var c = o.value;
              a._entries.delete(c);
            }
          } catch (l) {
            e = { error: l };
          } finally {
            try {
              o && !o.done && (r = i.return) && r.call(i);
            } finally {
              if (e) throw e.error;
            }
          }
          return a;
        }),
        (t.prototype.clear = function () {
          return new t();
        }),
        t
      );
    })();
  Oe.instance();
  function ll(t) {
    return (t === void 0 && (t = {}), new cl(new Map(Object.entries(t))));
  }
  function Vs(t) {
    return Symbol.for(t);
  }
  var ul = (function () {
      function t(e) {
        var r = this;
        ((r._currentContext = e ? new Map(e) : new Map()),
          (r.getValue = function (n) {
            return r._currentContext.get(n);
          }),
          (r.setValue = function (n, s) {
            var a = new t(r._currentContext);
            return (a._currentContext.set(n, s), a);
          }),
          (r.deleteValue = function (n) {
            var s = new t(r._currentContext);
            return (s._currentContext.delete(n), s);
          }));
      }
      return t;
    })(),
    dl = new ul(),
    tt = (function () {
      var t = function (e, r) {
        return (
          (t =
            Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array &&
              function (n, s) {
                n.__proto__ = s;
              }) ||
            function (n, s) {
              for (var a in s)
                Object.prototype.hasOwnProperty.call(s, a) && (n[a] = s[a]);
            }),
          t(e, r)
        );
      };
      return function (e, r) {
        if (typeof r != "function" && r !== null)
          throw new TypeError(
            "Class extends value " +
              String(r) +
              " is not a constructor or null",
          );
        t(e, r);
        function n() {
          this.constructor = e;
        }
        e.prototype =
          r === null
            ? Object.create(r)
            : ((n.prototype = r.prototype), new n());
      };
    })(),
    pl = (function () {
      function t() {}
      return (
        (t.prototype.createGauge = function (e, r) {
          return kl;
        }),
        (t.prototype.createHistogram = function (e, r) {
          return xl;
        }),
        (t.prototype.createCounter = function (e, r) {
          return wl;
        }),
        (t.prototype.createUpDownCounter = function (e, r) {
          return Al;
        }),
        (t.prototype.createObservableGauge = function (e, r) {
          return El;
        }),
        (t.prototype.createObservableCounter = function (e, r) {
          return Sl;
        }),
        (t.prototype.createObservableUpDownCounter = function (e, r) {
          return Il;
        }),
        (t.prototype.addBatchObservableCallback = function (e, r) {}),
        (t.prototype.removeBatchObservableCallback = function (e) {}),
        t
      );
    })(),
    ir = (function () {
      function t() {}
      return t;
    })(),
    ml = (function (t) {
      tt(e, t);
      function e() {
        return (t !== null && t.apply(this, arguments)) || this;
      }
      return ((e.prototype.add = function (r, n) {}), e);
    })(ir),
    fl = (function (t) {
      tt(e, t);
      function e() {
        return (t !== null && t.apply(this, arguments)) || this;
      }
      return ((e.prototype.add = function (r, n) {}), e);
    })(ir),
    gl = (function (t) {
      tt(e, t);
      function e() {
        return (t !== null && t.apply(this, arguments)) || this;
      }
      return ((e.prototype.record = function (r, n) {}), e);
    })(ir),
    hl = (function (t) {
      tt(e, t);
      function e() {
        return (t !== null && t.apply(this, arguments)) || this;
      }
      return ((e.prototype.record = function (r, n) {}), e);
    })(ir),
    Vr = (function () {
      function t() {}
      return (
        (t.prototype.addCallback = function (e) {}),
        (t.prototype.removeCallback = function (e) {}),
        t
      );
    })(),
    yl = (function (t) {
      tt(e, t);
      function e() {
        return (t !== null && t.apply(this, arguments)) || this;
      }
      return e;
    })(Vr),
    vl = (function (t) {
      tt(e, t);
      function e() {
        return (t !== null && t.apply(this, arguments)) || this;
      }
      return e;
    })(Vr),
    _l = (function (t) {
      tt(e, t);
      function e() {
        return (t !== null && t.apply(this, arguments)) || this;
      }
      return e;
    })(Vr),
    bl = new pl(),
    wl = new ml(),
    kl = new gl(),
    xl = new hl(),
    Al = new fl(),
    Sl = new yl(),
    El = new vl(),
    Il = new _l(),
    Tl = {
      get: function (t, e) {
        if (t != null) return t[e];
      },
      keys: function (t) {
        return t == null ? [] : Object.keys(t);
      },
    },
    Cl = {
      set: function (t, e, r) {
        t != null && (t[e] = r);
      },
    },
    Ol = function (t, e) {
      var r = typeof Symbol == "function" && t[Symbol.iterator];
      if (!r) return t;
      var n = r.call(t),
        s,
        a = [],
        i;
      try {
        for (; (e === void 0 || e-- > 0) && !(s = n.next()).done; )
          a.push(s.value);
      } catch (o) {
        i = { error: o };
      } finally {
        try {
          s && !s.done && (r = n.return) && r.call(n);
        } finally {
          if (i) throw i.error;
        }
      }
      return a;
    },
    Pl = function (t, e, r) {
      if (r || arguments.length === 2)
        for (var n = 0, s = e.length, a; n < s; n++)
          (a || !(n in e)) &&
            (a || (a = Array.prototype.slice.call(e, 0, n)), (a[n] = e[n]));
      return t.concat(a || Array.prototype.slice.call(e));
    },
    Rl = (function () {
      function t() {}
      return (
        (t.prototype.active = function () {
          return dl;
        }),
        (t.prototype.with = function (e, r, n) {
          for (var s = [], a = 3; a < arguments.length; a++)
            s[a - 3] = arguments[a];
          return r.call.apply(r, Pl([n], Ol(s), !1));
        }),
        (t.prototype.bind = function (e, r) {
          return r;
        }),
        (t.prototype.enable = function () {
          return this;
        }),
        (t.prototype.disable = function () {
          return this;
        }),
        t
      );
    })(),
    Nl = function (t, e) {
      var r = typeof Symbol == "function" && t[Symbol.iterator];
      if (!r) return t;
      var n = r.call(t),
        s,
        a = [],
        i;
      try {
        for (; (e === void 0 || e-- > 0) && !(s = n.next()).done; )
          a.push(s.value);
      } catch (o) {
        i = { error: o };
      } finally {
        try {
          s && !s.done && (r = n.return) && r.call(n);
        } finally {
          if (i) throw i.error;
        }
      }
      return a;
    },
    Ml = function (t, e, r) {
      if (r || arguments.length === 2)
        for (var n = 0, s = e.length, a; n < s; n++)
          (a || !(n in e)) &&
            (a || (a = Array.prototype.slice.call(e, 0, n)), (a[n] = e[n]));
      return t.concat(a || Array.prototype.slice.call(e));
    },
    Br = "context",
    jl = new Rl(),
    or = (function () {
      function t() {}
      return (
        (t.getInstance = function () {
          return (this._instance || (this._instance = new t()), this._instance);
        }),
        (t.prototype.setGlobalContextManager = function (e) {
          return St(Br, e, Oe.instance());
        }),
        (t.prototype.active = function () {
          return this._getContextManager().active();
        }),
        (t.prototype.with = function (e, r, n) {
          for (var s, a = [], i = 3; i < arguments.length; i++)
            a[i - 3] = arguments[i];
          return (s = this._getContextManager()).with.apply(
            s,
            Ml([e, r, n], Nl(a), !1),
          );
        }),
        (t.prototype.bind = function (e, r) {
          return this._getContextManager().bind(e, r);
        }),
        (t.prototype._getContextManager = function () {
          return et(Br) || jl;
        }),
        (t.prototype.disable = function () {
          (this._getContextManager().disable(), Et(Br, Oe.instance()));
        }),
        t
      );
    })(),
    Lr;
  (function (t) {
    ((t[(t.NONE = 0)] = "NONE"), (t[(t.SAMPLED = 1)] = "SAMPLED"));
  })(Lr || (Lr = {}));
  var Bs = "0000000000000000",
    Ls = "00000000000000000000000000000000",
    $l = { traceId: Ls, spanId: Bs, traceFlags: Lr.NONE },
    Tt = (function () {
      function t(e) {
        (e === void 0 && (e = $l), (this._spanContext = e));
      }
      return (
        (t.prototype.spanContext = function () {
          return this._spanContext;
        }),
        (t.prototype.setAttribute = function (e, r) {
          return this;
        }),
        (t.prototype.setAttributes = function (e) {
          return this;
        }),
        (t.prototype.addEvent = function (e, r) {
          return this;
        }),
        (t.prototype.addLink = function (e) {
          return this;
        }),
        (t.prototype.addLinks = function (e) {
          return this;
        }),
        (t.prototype.setStatus = function (e) {
          return this;
        }),
        (t.prototype.updateName = function (e) {
          return this;
        }),
        (t.prototype.end = function (e) {}),
        (t.prototype.isRecording = function () {
          return !1;
        }),
        (t.prototype.recordException = function (e, r) {}),
        t
      );
    })(),
    Fr = Vs("OpenTelemetry Context Key SPAN");
  function Ur(t) {
    return t.getValue(Fr) || void 0;
  }
  function Dl() {
    return Ur(or.getInstance().active());
  }
  function Zr(t, e) {
    return t.setValue(Fr, e);
  }
  function Vl(t) {
    return t.deleteValue(Fr);
  }
  function Bl(t, e) {
    return Zr(t, new Tt(e));
  }
  function Fs(t) {
    var e;
    return (e = Ur(t)) === null || e === void 0 ? void 0 : e.spanContext();
  }
  var Ll = /^([0-9a-f]{32})$/i,
    Fl = /^[0-9a-f]{16}$/i;
  function Ul(t) {
    return Ll.test(t) && t !== Ls;
  }
  function Zl(t) {
    return Fl.test(t) && t !== Bs;
  }
  function Us(t) {
    return Ul(t.traceId) && Zl(t.spanId);
  }
  function zl(t) {
    return new Tt(t);
  }
  var zr = or.getInstance(),
    Zs = (function () {
      function t() {}
      return (
        (t.prototype.startSpan = function (e, r, n) {
          n === void 0 && (n = zr.active());
          var s = !!(r != null && r.root);
          if (s) return new Tt();
          var a = n && Fs(n);
          return ql(a) && Us(a) ? new Tt(a) : new Tt();
        }),
        (t.prototype.startActiveSpan = function (e, r, n, s) {
          var a, i, o;
          if (!(arguments.length < 2)) {
            arguments.length === 2
              ? (o = r)
              : arguments.length === 3
                ? ((a = r), (o = n))
                : ((a = r), (i = n), (o = s));
            var c = i ?? zr.active(),
              l = this.startSpan(e, a, c),
              u = Zr(c, l);
            return zr.with(u, o, void 0, l);
          }
        }),
        t
      );
    })();
  function ql(t) {
    return (
      typeof t == "object" &&
      typeof t.spanId == "string" &&
      typeof t.traceId == "string" &&
      typeof t.traceFlags == "number"
    );
  }
  var Jl = new Zs(),
    Kl = (function () {
      function t(e, r, n, s) {
        ((this._provider = e),
          (this.name = r),
          (this.version = n),
          (this.options = s));
      }
      return (
        (t.prototype.startSpan = function (e, r, n) {
          return this._getTracer().startSpan(e, r, n);
        }),
        (t.prototype.startActiveSpan = function (e, r, n, s) {
          var a = this._getTracer();
          return Reflect.apply(a.startActiveSpan, a, arguments);
        }),
        (t.prototype._getTracer = function () {
          if (this._delegate) return this._delegate;
          var e = this._provider.getDelegateTracer(
            this.name,
            this.version,
            this.options,
          );
          return e ? ((this._delegate = e), this._delegate) : Jl;
        }),
        t
      );
    })(),
    Gl = (function () {
      function t() {}
      return (
        (t.prototype.getTracer = function (e, r, n) {
          return new Zs();
        }),
        t
      );
    })(),
    Wl = new Gl(),
    zs = (function () {
      function t() {}
      return (
        (t.prototype.getTracer = function (e, r, n) {
          var s;
          return (s = this.getDelegateTracer(e, r, n)) !== null && s !== void 0
            ? s
            : new Kl(this, e, r, n);
        }),
        (t.prototype.getDelegate = function () {
          var e;
          return (e = this._delegate) !== null && e !== void 0 ? e : Wl;
        }),
        (t.prototype.setDelegate = function (e) {
          this._delegate = e;
        }),
        (t.prototype.getDelegateTracer = function (e, r, n) {
          var s;
          return (s = this._delegate) === null || s === void 0
            ? void 0
            : s.getTracer(e, r, n);
        }),
        t
      );
    })(),
    cr;
  ((function (t) {
    ((t[(t.UNSET = 0)] = "UNSET"),
      (t[(t.OK = 1)] = "OK"),
      (t[(t.ERROR = 2)] = "ERROR"));
  })(cr || (cr = {})),
    or.getInstance(),
    Oe.instance());
  var Hl = (function () {
      function t() {}
      return (
        (t.prototype.getMeter = function (e, r, n) {
          return bl;
        }),
        t
      );
    })(),
    Yl = new Hl(),
    qr = "metrics",
    Ql = (function () {
      function t() {}
      return (
        (t.getInstance = function () {
          return (this._instance || (this._instance = new t()), this._instance);
        }),
        (t.prototype.setGlobalMeterProvider = function (e) {
          return St(qr, e, Oe.instance());
        }),
        (t.prototype.getMeterProvider = function () {
          return et(qr) || Yl;
        }),
        (t.prototype.getMeter = function (e, r, n) {
          return this.getMeterProvider().getMeter(e, r, n);
        }),
        (t.prototype.disable = function () {
          Et(qr, Oe.instance());
        }),
        t
      );
    })();
  Ql.getInstance();
  var Xl = (function () {
      function t() {}
      return (
        (t.prototype.inject = function (e, r) {}),
        (t.prototype.extract = function (e, r) {
          return e;
        }),
        (t.prototype.fields = function () {
          return [];
        }),
        t
      );
    })(),
    Jr = Vs("OpenTelemetry Baggage Key");
  function qs(t) {
    return t.getValue(Jr) || void 0;
  }
  function eu() {
    return qs(or.getInstance().active());
  }
  function tu(t, e) {
    return t.setValue(Jr, e);
  }
  function ru(t) {
    return t.deleteValue(Jr);
  }
  var Kr = "propagation",
    nu = new Xl(),
    su = (function () {
      function t() {
        ((this.createBaggage = ll),
          (this.getBaggage = qs),
          (this.getActiveBaggage = eu),
          (this.setBaggage = tu),
          (this.deleteBaggage = ru));
      }
      return (
        (t.getInstance = function () {
          return (this._instance || (this._instance = new t()), this._instance);
        }),
        (t.prototype.setGlobalPropagator = function (e) {
          return St(Kr, e, Oe.instance());
        }),
        (t.prototype.inject = function (e, r, n) {
          return (
            n === void 0 && (n = Cl),
            this._getGlobalPropagator().inject(e, r, n)
          );
        }),
        (t.prototype.extract = function (e, r, n) {
          return (
            n === void 0 && (n = Tl),
            this._getGlobalPropagator().extract(e, r, n)
          );
        }),
        (t.prototype.fields = function () {
          return this._getGlobalPropagator().fields();
        }),
        (t.prototype.disable = function () {
          Et(Kr, Oe.instance());
        }),
        (t.prototype._getGlobalPropagator = function () {
          return et(Kr) || nu;
        }),
        t
      );
    })();
  su.getInstance();
  var Gr = "trace",
    au = (function () {
      function t() {
        ((this._proxyTracerProvider = new zs()),
          (this.wrapSpanContext = zl),
          (this.isSpanContextValid = Us),
          (this.deleteSpan = Vl),
          (this.getSpan = Ur),
          (this.getActiveSpan = Dl),
          (this.getSpanContext = Fs),
          (this.setSpan = Zr),
          (this.setSpanContext = Bl));
      }
      return (
        (t.getInstance = function () {
          return (this._instance || (this._instance = new t()), this._instance);
        }),
        (t.prototype.setGlobalTracerProvider = function (e) {
          var r = St(Gr, this._proxyTracerProvider, Oe.instance());
          return (r && this._proxyTracerProvider.setDelegate(e), r);
        }),
        (t.prototype.getTracerProvider = function () {
          return et(Gr) || this._proxyTracerProvider;
        }),
        (t.prototype.getTracer = function (e, r) {
          return this.getTracerProvider().getTracer(e, r);
        }),
        (t.prototype.disable = function () {
          (Et(Gr, Oe.instance()), (this._proxyTracerProvider = new zs()));
        }),
        t
      );
    })(),
    iu = au.getInstance(),
    ou = Object.defineProperty,
    Wr = (t, e) => {
      for (var r in e) ou(t, r, { get: e[r], enumerable: !0 });
    };
  function Js(t, { contentType: e, dataStreamVersion: r }) {
    const n = new Headers(t ?? {});
    return (
      n.has("Content-Type") || n.set("Content-Type", e),
      n.set("X-Vercel-AI-Data-Stream", r),
      n
    );
  }
  var Ks = class extends Y {
      constructor() {
        super({
          name: "AI_UnsupportedModelVersionError",
          message:
            'Unsupported model version. AI SDK 4 only supports models that implement specification version "v1". Please upgrade to AI SDK 5 to use this model.',
        });
      }
    },
    Gs = "AI_InvalidArgumentError",
    Ws = `vercel.ai.error.${Gs}`,
    cu = Symbol.for(Ws),
    Hs,
    Ys = class extends Y {
      constructor({ parameter: t, value: e, message: r }) {
        (super({
          name: Gs,
          message: `Invalid argument for parameter ${t}: ${r}`,
        }),
          (this[Hs] = !0),
          (this.parameter = t),
          (this.value = e));
      }
      static isInstance(t) {
        return Y.hasMarker(t, Ws);
      }
    };
  Hs = cu;
  var Qs = "AI_RetryError",
    Xs = `vercel.ai.error.${Qs}`,
    lu = Symbol.for(Xs),
    ea,
    ta = class extends Y {
      constructor({ message: t, reason: e, errors: r }) {
        (super({ name: Qs, message: t }),
          (this[ea] = !0),
          (this.reason = e),
          (this.errors = r),
          (this.lastError = r[r.length - 1]));
      }
      static isInstance(t) {
        return Y.hasMarker(t, Xs);
      }
    };
  ea = lu;
  var uu =
    ({
      maxRetries: t = 2,
      initialDelayInMs: e = 2e3,
      backoffFactor: r = 2,
    } = {}) =>
    async (n) =>
      ra(n, { maxRetries: t, delayInMs: e, backoffFactor: r });
  async function ra(
    t,
    { maxRetries: e, delayInMs: r, backoffFactor: n },
    s = [],
  ) {
    try {
      return await t();
    } catch (a) {
      if (tr(a) || e === 0) throw a;
      const i = So(a),
        o = [...s, a],
        c = o.length;
      if (c > e)
        throw new ta({
          message: `Failed after ${c} attempts. Last error: ${i}`,
          reason: "maxRetriesExceeded",
          errors: o,
        });
      if (
        a instanceof Error &&
        ye.isInstance(a) &&
        a.isRetryable === !0 &&
        c <= e
      )
        return (
          await ko(r),
          ra(t, { maxRetries: e, delayInMs: n * r, backoffFactor: n }, o)
        );
      throw c === 1
        ? a
        : new ta({
            message: `Failed after ${c} attempts with non-retryable error: '${i}'`,
            reason: "errorNotRetryable",
            errors: o,
          });
    }
  }
  function na({ maxRetries: t }) {
    if (t != null) {
      if (!Number.isInteger(t))
        throw new Ys({
          parameter: "maxRetries",
          value: t,
          message: "maxRetries must be an integer",
        });
      if (t < 0)
        throw new Ys({
          parameter: "maxRetries",
          value: t,
          message: "maxRetries must be >= 0",
        });
    }
    const e = t ?? 2;
    return { maxRetries: e, retry: uu({ maxRetries: e }) };
  }
  function Ct({ operationId: t, telemetry: e }) {
    return {
      "operation.name": `${t}${(e == null ? void 0 : e.functionId) != null ? ` ${e.functionId}` : ""}`,
      "resource.name": e == null ? void 0 : e.functionId,
      "ai.operationId": t,
      "ai.telemetry.functionId": e == null ? void 0 : e.functionId,
    };
  }
  function sa({ model: t, settings: e, telemetry: r, headers: n }) {
    var s;
    return {
      "ai.model.provider": t.provider,
      "ai.model.id": t.modelId,
      ...Object.entries(e).reduce(
        (a, [i, o]) => ((a[`ai.settings.${i}`] = o), a),
        {},
      ),
      ...Object.entries(
        (s = r == null ? void 0 : r.metadata) != null ? s : {},
      ).reduce((a, [i, o]) => ((a[`ai.telemetry.metadata.${i}`] = o), a), {}),
      ...Object.entries(n ?? {}).reduce(
        (a, [i, o]) => (o !== void 0 && (a[`ai.request.headers.${i}`] = o), a),
        {},
      ),
    };
  }
  var du = {
      startSpan() {
        return lr;
      },
      startActiveSpan(t, e, r, n) {
        if (typeof e == "function") return e(lr);
        if (typeof r == "function") return r(lr);
        if (typeof n == "function") return n(lr);
      },
    },
    lr = {
      spanContext() {
        return pu;
      },
      setAttribute() {
        return this;
      },
      setAttributes() {
        return this;
      },
      addEvent() {
        return this;
      },
      addLink() {
        return this;
      },
      addLinks() {
        return this;
      },
      setStatus() {
        return this;
      },
      updateName() {
        return this;
      },
      end() {
        return this;
      },
      isRecording() {
        return !1;
      },
      recordException() {
        return this;
      },
    },
    pu = { traceId: "", spanId: "", traceFlags: 0 };
  function aa({ isEnabled: t = !1, tracer: e } = {}) {
    return t ? e || iu.getTracer("ai") : du;
  }
  function Ot({
    name: t,
    tracer: e,
    attributes: r,
    fn: n,
    endWhenDone: s = !0,
  }) {
    return e.startActiveSpan(t, { attributes: r }, async (a) => {
      try {
        const i = await n(a);
        return (s && a.end(), i);
      } catch (i) {
        try {
          mu(a, i);
        } finally {
          a.end();
        }
        throw i;
      }
    });
  }
  function mu(t, e) {
    e instanceof Error
      ? (t.recordException({
          name: e.name,
          message: e.message,
          stack: e.stack,
        }),
        t.setStatus({ code: cr.ERROR, message: e.message }))
      : t.setStatus({ code: cr.ERROR });
  }
  function Se({ telemetry: t, attributes: e }) {
    return (t == null ? void 0 : t.isEnabled) !== !0
      ? {}
      : Object.entries(e).reduce((r, [n, s]) => {
          if (s === void 0) return r;
          if (
            typeof s == "object" &&
            "input" in s &&
            typeof s.input == "function"
          ) {
            if ((t == null ? void 0 : t.recordInputs) === !1) return r;
            const a = s.input();
            return a === void 0 ? r : { ...r, [n]: a };
          }
          if (
            typeof s == "object" &&
            "output" in s &&
            typeof s.output == "function"
          ) {
            if ((t == null ? void 0 : t.recordOutputs) === !1) return r;
            const a = s.output();
            return a === void 0 ? r : { ...r, [n]: a };
          }
          return { ...r, [n]: s };
        }, {});
  }
  async function ia({
    model: t,
    value: e,
    maxRetries: r,
    abortSignal: n,
    headers: s,
    experimental_telemetry: a,
  }) {
    if (typeof t == "string" || t.specificationVersion !== "v1") throw new Ks();
    const { maxRetries: i, retry: o } = na({ maxRetries: r }),
      c = sa({
        model: t,
        telemetry: a,
        headers: s,
        settings: { maxRetries: i },
      }),
      l = aa(a);
    return Ot({
      name: "ai.embed",
      attributes: Se({
        telemetry: a,
        attributes: {
          ...Ct({ operationId: "ai.embed", telemetry: a }),
          ...c,
          "ai.value": { input: () => JSON.stringify(e) },
        },
      }),
      tracer: l,
      fn: async (u) => {
        const {
          embedding: f,
          usage: _,
          rawResponse: C,
        } = await o(() =>
          Ot({
            name: "ai.embed.doEmbed",
            attributes: Se({
              telemetry: a,
              attributes: {
                ...Ct({ operationId: "ai.embed.doEmbed", telemetry: a }),
                ...c,
                "ai.values": { input: () => [JSON.stringify(e)] },
              },
            }),
            tracer: l,
            fn: async (S) => {
              var m;
              const p = await t.doEmbed({
                  values: [e],
                  abortSignal: n,
                  headers: s,
                }),
                d = p.embeddings[0],
                g = (m = p.usage) != null ? m : { tokens: NaN };
              return (
                S.setAttributes(
                  Se({
                    telemetry: a,
                    attributes: {
                      "ai.embeddings": {
                        output: () =>
                          p.embeddings.map((w) => JSON.stringify(w)),
                      },
                      "ai.usage.tokens": g.tokens,
                    },
                  }),
                ),
                { embedding: d, usage: g, rawResponse: p.rawResponse }
              );
            },
          }),
        );
        return (
          u.setAttributes(
            Se({
              telemetry: a,
              attributes: {
                "ai.embedding": { output: () => JSON.stringify(f) },
                "ai.usage.tokens": _.tokens,
              },
            }),
          ),
          new fu({ value: e, embedding: f, usage: _, rawResponse: C })
        );
      },
    });
  }
  var fu = class {
    constructor(t) {
      ((this.value = t.value),
        (this.embedding = t.embedding),
        (this.usage = t.usage),
        (this.rawResponse = t.rawResponse));
    }
  };
  function gu(t, e) {
    if (e <= 0) throw new Error("chunkSize must be greater than 0");
    const r = [];
    for (let n = 0; n < t.length; n += e) r.push(t.slice(n, n + e));
    return r;
  }
  async function hu({
    model: t,
    values: e,
    maxRetries: r,
    abortSignal: n,
    headers: s,
    experimental_telemetry: a,
  }) {
    if (typeof t == "string" || t.specificationVersion !== "v1") throw new Ks();
    const { maxRetries: i, retry: o } = na({ maxRetries: r }),
      c = sa({
        model: t,
        telemetry: a,
        headers: s,
        settings: { maxRetries: i },
      }),
      l = aa(a);
    return Ot({
      name: "ai.embedMany",
      attributes: Se({
        telemetry: a,
        attributes: {
          ...Ct({ operationId: "ai.embedMany", telemetry: a }),
          ...c,
          "ai.values": { input: () => e.map((u) => JSON.stringify(u)) },
        },
      }),
      tracer: l,
      fn: async (u) => {
        const f = t.maxEmbeddingsPerCall;
        if (f == null) {
          const { embeddings: m, usage: p } = await o(() =>
            Ot({
              name: "ai.embedMany.doEmbed",
              attributes: Se({
                telemetry: a,
                attributes: {
                  ...Ct({ operationId: "ai.embedMany.doEmbed", telemetry: a }),
                  ...c,
                  "ai.values": { input: () => e.map((d) => JSON.stringify(d)) },
                },
              }),
              tracer: l,
              fn: async (d) => {
                var g;
                const w = await t.doEmbed({
                    values: e,
                    abortSignal: n,
                    headers: s,
                  }),
                  x = w.embeddings,
                  T = (g = w.usage) != null ? g : { tokens: NaN };
                return (
                  d.setAttributes(
                    Se({
                      telemetry: a,
                      attributes: {
                        "ai.embeddings": {
                          output: () => x.map(($) => JSON.stringify($)),
                        },
                        "ai.usage.tokens": T.tokens,
                      },
                    }),
                  ),
                  { embeddings: x, usage: T }
                );
              },
            }),
          );
          return (
            u.setAttributes(
              Se({
                telemetry: a,
                attributes: {
                  "ai.embeddings": {
                    output: () => m.map((d) => JSON.stringify(d)),
                  },
                  "ai.usage.tokens": p.tokens,
                },
              }),
            ),
            new oa({ values: e, embeddings: m, usage: p })
          );
        }
        const _ = gu(e, f),
          C = [];
        let S = 0;
        for (const m of _) {
          const { embeddings: p, usage: d } = await o(() =>
            Ot({
              name: "ai.embedMany.doEmbed",
              attributes: Se({
                telemetry: a,
                attributes: {
                  ...Ct({ operationId: "ai.embedMany.doEmbed", telemetry: a }),
                  ...c,
                  "ai.values": { input: () => m.map((g) => JSON.stringify(g)) },
                },
              }),
              tracer: l,
              fn: async (g) => {
                var w;
                const x = await t.doEmbed({
                    values: m,
                    abortSignal: n,
                    headers: s,
                  }),
                  T = x.embeddings,
                  $ = (w = x.usage) != null ? w : { tokens: NaN };
                return (
                  g.setAttributes(
                    Se({
                      telemetry: a,
                      attributes: {
                        "ai.embeddings": {
                          output: () => T.map((W) => JSON.stringify(W)),
                        },
                        "ai.usage.tokens": $.tokens,
                      },
                    }),
                  ),
                  { embeddings: T, usage: $ }
                );
              },
            }),
          );
          (C.push(...p), (S += d.tokens));
        }
        return (
          u.setAttributes(
            Se({
              telemetry: a,
              attributes: {
                "ai.embeddings": {
                  output: () => C.map((m) => JSON.stringify(m)),
                },
                "ai.usage.tokens": S,
              },
            }),
          ),
          new oa({ values: e, embeddings: C, usage: { tokens: S } })
        );
      },
    });
  }
  var oa = class {
      constructor(t) {
        ((this.values = t.values),
          (this.embeddings = t.embeddings),
          (this.usage = t.usage));
      }
    },
    ca = "AI_NoObjectGeneratedError",
    la = `vercel.ai.error.${ca}`,
    yu = Symbol.for(la),
    ua,
    da = class extends Y {
      constructor({
        message: t = "No object generated.",
        cause: e,
        text: r,
        response: n,
        usage: s,
        finishReason: a,
      }) {
        (super({ name: ca, message: t, cause: e }),
          (this[ua] = !0),
          (this.text = r),
          (this.response = n),
          (this.usage = s),
          (this.finishReason = a));
      }
      static isInstance(t) {
        return Y.hasMarker(t, la);
      }
    };
  ua = yu;
  var pa = se([
      h(),
      Ht(Uint8Array),
      Ht(ArrayBuffer),
      $n(
        (t) => {
          var e, r;
          return (r =
            (e = globalThis.Buffer) == null ? void 0 : e.isBuffer(t)) != null
            ? r
            : !1;
        },
        { message: "Must be a Buffer" },
      ),
    ]),
    Hr = Vn(() => se([Yi(), h(), P(), Te(), gt(h(), Hr), V(Hr)])),
    re = gt(h(), gt(h(), Hr)),
    vu = V(
      se([
        y({ type: M("text"), text: h() }),
        y({ type: M("image"), data: h(), mimeType: h().optional() }),
      ]),
    ),
    ma = y({
      type: M("text"),
      text: h(),
      providerOptions: re.optional(),
      experimental_providerMetadata: re.optional(),
    }),
    _u = y({
      type: M("image"),
      image: se([pa, Ht(URL)]),
      mimeType: h().optional(),
      providerOptions: re.optional(),
      experimental_providerMetadata: re.optional(),
    }),
    fa = y({
      type: M("file"),
      data: se([pa, Ht(URL)]),
      filename: h().optional(),
      mimeType: h(),
      providerOptions: re.optional(),
      experimental_providerMetadata: re.optional(),
    }),
    bu = y({
      type: M("reasoning"),
      text: h(),
      providerOptions: re.optional(),
      experimental_providerMetadata: re.optional(),
    }),
    wu = y({
      type: M("redacted-reasoning"),
      data: h(),
      providerOptions: re.optional(),
      experimental_providerMetadata: re.optional(),
    }),
    ku = y({
      type: M("tool-call"),
      toolCallId: h(),
      toolName: h(),
      args: Yt(),
      providerOptions: re.optional(),
      experimental_providerMetadata: re.optional(),
    }),
    xu = y({
      type: M("tool-result"),
      toolCallId: h(),
      toolName: h(),
      result: Yt(),
      content: vu.optional(),
      isError: Te().optional(),
      providerOptions: re.optional(),
      experimental_providerMetadata: re.optional(),
    }),
    Au = y({
      role: M("system"),
      content: h(),
      providerOptions: re.optional(),
      experimental_providerMetadata: re.optional(),
    }),
    Su = y({
      role: M("user"),
      content: se([h(), V(se([ma, _u, fa]))]),
      providerOptions: re.optional(),
      experimental_providerMetadata: re.optional(),
    }),
    Eu = y({
      role: M("assistant"),
      content: se([h(), V(se([ma, fa, bu, wu, ku]))]),
      providerOptions: re.optional(),
      experimental_providerMetadata: re.optional(),
    }),
    Iu = y({
      role: M("tool"),
      content: V(xu),
      providerOptions: re.optional(),
      experimental_providerMetadata: re.optional(),
    });
  se([Au, Su, Eu, Iu]);
  var Tu = "JSON schema:",
    Cu =
      "You MUST answer with a JSON object that matches the JSON schema above.",
    Ou = "You MUST answer with JSON.";
  function Pu({
    prompt: t,
    schema: e,
    schemaPrefix: r = e != null ? Tu : void 0,
    schemaSuffix: n = e != null ? Cu : Ou,
  }) {
    return [
      t != null && t.length > 0 ? t : void 0,
      t != null && t.length > 0 ? "" : void 0,
      r,
      e != null ? JSON.stringify(e) : void 0,
      n,
    ].filter((s) => s != null).join(`
`);
  }
  (Ye({ prefix: "aiobj", size: 24 }),
    Ye({ prefix: "aiobj", size: 24 }),
    Ye({ prefix: "aitxt", size: 24 }),
    Ye({ prefix: "msg", size: 24 }));
  var Ru = {};
  Wr(Ru, { object: () => Mu, text: () => Nu });
  var Nu = () => ({
      type: "text",
      responseFormat: () => ({ type: "text" }),
      injectIntoSystemPrompt({ system: t }) {
        return t;
      },
      parsePartial({ text: t }) {
        return { partial: t };
      },
      parseOutput({ text: t }) {
        return t;
      },
    }),
    Mu = ({ schema: t }) => {
      const e = Gc(t);
      return {
        type: "object",
        responseFormat: ({ model: r }) => ({
          type: "json",
          schema: r.supportsStructuredOutputs ? e.jsonSchema : void 0,
        }),
        injectIntoSystemPrompt({ system: r, model: n }) {
          return n.supportsStructuredOutputs
            ? r
            : Pu({ prompt: r, schema: e.jsonSchema });
        },
        parsePartial({ text: r }) {
          const n = Tc(r);
          switch (n.state) {
            case "failed-parse":
            case "undefined-input":
              return;
            case "repaired-parse":
            case "successful-parse":
              return { partial: n.value };
            default: {
              const s = n.state;
              throw new Error(`Unsupported parse state: ${s}`);
            }
          }
        },
        parseOutput({ text: r }, n) {
          const s = yt({ text: r });
          if (!s.success)
            throw new da({
              message: "No object generated: could not parse the response.",
              cause: s.error,
              text: r,
              response: n.response,
              usage: n.usage,
              finishReason: n.finishReason,
            });
          const a = nr({ value: s.value, schema: e });
          if (!a.success)
            throw new da({
              message: "No object generated: response did not match schema.",
              cause: a.error,
              text: r,
              response: n.response,
              usage: n.usage,
              finishReason: n.finishReason,
            });
          return a.value;
        },
      };
    };
  function ga(t, e) {
    const r = t.getReader(),
      n = e.getReader();
    let s,
      a,
      i = !1,
      o = !1;
    async function c(u) {
      try {
        s == null && (s = r.read());
        const f = await s;
        ((s = void 0), f.done ? u.close() : u.enqueue(f.value));
      } catch (f) {
        u.error(f);
      }
    }
    async function l(u) {
      try {
        a == null && (a = n.read());
        const f = await a;
        ((a = void 0), f.done ? u.close() : u.enqueue(f.value));
      } catch (f) {
        u.error(f);
      }
    }
    return new ReadableStream({
      async pull(u) {
        try {
          if (i) {
            await l(u);
            return;
          }
          if (o) {
            await c(u);
            return;
          }
          (s == null && (s = r.read()), a == null && (a = n.read()));
          const { result: f, reader: _ } = await Promise.race([
            s.then((C) => ({ result: C, reader: r })),
            a.then((C) => ({ result: C, reader: n })),
          ]);
          (f.done || u.enqueue(f.value),
            _ === r
              ? ((s = void 0), f.done && (await l(u), (i = !0)))
              : ((a = void 0), f.done && ((o = !0), await c(u))));
        } catch (f) {
          u.error(f);
        }
      },
      cancel() {
        (r.cancel(), n.cancel());
      },
    });
  }
  (Ye({ prefix: "aitxt", size: 24 }), Ye({ prefix: "msg", size: 24 }));
  var ju = y({ name: h(), version: h() }).passthrough(),
    Yr = y({ _meta: ie(y({}).passthrough()) }).passthrough(),
    Pt = Yr,
    $u = y({ method: h(), params: ie(Yr) }),
    Du = y({
      experimental: ie(y({}).passthrough()),
      logging: ie(y({}).passthrough()),
      prompts: ie(y({ listChanged: ie(Te()) }).passthrough()),
      resources: ie(
        y({ subscribe: ie(Te()), listChanged: ie(Te()) }).passthrough(),
      ),
      tools: ie(y({ listChanged: ie(Te()) }).passthrough()),
    }).passthrough();
  Pt.extend({
    protocolVersion: h(),
    capabilities: Du,
    serverInfo: ju,
    instructions: ie(h()),
  });
  var Vu = Pt.extend({ nextCursor: ie(h()) }),
    Bu = y({
      name: h(),
      description: ie(h()),
      inputSchema: y({
        type: M("object"),
        properties: ie(y({}).passthrough()),
      }).passthrough(),
    }).passthrough();
  Vu.extend({ tools: V(Bu) });
  var Lu = y({ type: M("text"), text: h() }).passthrough(),
    Fu = y({
      type: M("image"),
      data: h().base64(),
      mimeType: h(),
    }).passthrough(),
    ha = y({ uri: h(), mimeType: ie(h()) }).passthrough(),
    Uu = ha.extend({ text: h() }),
    Zu = ha.extend({ blob: h().base64() }),
    zu = y({ type: M("resource"), resource: se([Uu, Zu]) }).passthrough();
  Pt.extend({
    content: V(se([Lu, Fu, zu])),
    isError: Te().default(!1).optional(),
  }).or(Pt.extend({ toolResult: Yt() }));
  var ur = "2.0",
    qu = y({ jsonrpc: M(ur), id: se([h(), P().int()]) })
      .merge($u)
      .strict(),
    Ju = y({ jsonrpc: M(ur), id: se([h(), P().int()]), result: Pt }).strict(),
    Ku = y({
      jsonrpc: M(ur),
      id: se([h(), P().int()]),
      error: y({ code: P().int(), message: h(), data: ie(Yt()) }),
    }).strict(),
    Gu = y({ jsonrpc: M(ur) })
      .merge(y({ method: h(), params: ie(Yr) }))
      .strict();
  se([qu, Gu, Ju, Ku]);
  var Wu = {};
  Wr(Wu, {
    mergeIntoDataStream: () => Qu,
    toDataStream: () => Hu,
    toDataStreamResponse: () => Yu,
  });
  function ya(t = {}) {
    const e = new TextEncoder();
    let r = "";
    return new TransformStream({
      async start() {
        t.onStart && (await t.onStart());
      },
      async transform(n, s) {
        (s.enqueue(e.encode(n)),
          (r += n),
          t.onToken && (await t.onToken(n)),
          t.onText && typeof n == "string" && (await t.onText(n)));
      },
      async flush() {
        (t.onCompletion && (await t.onCompletion(r)),
          t.onFinal && (await t.onFinal(r)));
      },
    });
  }
  function Qr(t, e) {
    return t
      .pipeThrough(
        new TransformStream({
          transform: async (r, n) => {
            var s;
            if (typeof r == "string") {
              n.enqueue(r);
              return;
            }
            if ("event" in r) {
              r.event === "on_chat_model_stream" &&
                va((s = r.data) == null ? void 0 : s.chunk, n);
              return;
            }
            va(r, n);
          },
        }),
      )
      .pipeThrough(ya(e))
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(
        new TransformStream({
          transform: async (r, n) => {
            n.enqueue($s("text", r));
          },
        }),
      );
  }
  function Hu(t, e) {
    return Qr(t, e).pipeThrough(new TextEncoderStream());
  }
  function Yu(t, e) {
    var r;
    const n = Qr(t, e == null ? void 0 : e.callbacks).pipeThrough(
        new TextEncoderStream(),
      ),
      s = e == null ? void 0 : e.data,
      a = e == null ? void 0 : e.init,
      i = s ? ga(s.stream, n) : n;
    return new Response(i, {
      status: (r = a == null ? void 0 : a.status) != null ? r : 200,
      statusText: a == null ? void 0 : a.statusText,
      headers: Js(a == null ? void 0 : a.headers, {
        contentType: "text/plain; charset=utf-8",
        dataStreamVersion: "v1",
      }),
    });
  }
  function Qu(t, e) {
    e.dataStream.merge(Qr(t, e.callbacks));
  }
  function va(t, e) {
    if (typeof t.content == "string") e.enqueue(t.content);
    else {
      const r = t.content;
      for (const n of r) n.type === "text" && e.enqueue(n.text);
    }
  }
  var Xu = {};
  Wr(Xu, {
    mergeIntoDataStream: () => rd,
    toDataStream: () => ed,
    toDataStreamResponse: () => td,
  });
  function Xr(t, e) {
    const r = nd();
    return wo(t[Symbol.asyncIterator]())
      .pipeThrough(
        new TransformStream({
          async transform(n, s) {
            s.enqueue(r(n.delta));
          },
        }),
      )
      .pipeThrough(ya(e))
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(
        new TransformStream({
          transform: async (n, s) => {
            s.enqueue($s("text", n));
          },
        }),
      );
  }
  function ed(t, e) {
    return Xr(t, e).pipeThrough(new TextEncoderStream());
  }
  function td(t, e = {}) {
    var r;
    const { init: n, data: s, callbacks: a } = e,
      i = Xr(t, a).pipeThrough(new TextEncoderStream()),
      o = s ? ga(s.stream, i) : i;
    return new Response(o, {
      status: (r = n == null ? void 0 : n.status) != null ? r : 200,
      statusText: n == null ? void 0 : n.statusText,
      headers: Js(n == null ? void 0 : n.headers, {
        contentType: "text/plain; charset=utf-8",
        dataStreamVersion: "v1",
      }),
    });
  }
  function rd(t, e) {
    e.dataStream.merge(Xr(t, e.callbacks));
  }
  function nd() {
    let t = !0;
    return (e) => (t && ((e = e.trimStart()), e && (t = !1)), e);
  }
  function sd({
    prompt: t,
    useLegacyFunctionCalling: e = !1,
    systemMessageMode: r = "system",
  }) {
    const n = [],
      s = [];
    for (const { role: a, content: i } of t)
      switch (a) {
        case "system": {
          switch (r) {
            case "system": {
              n.push({ role: "system", content: i });
              break;
            }
            case "developer": {
              n.push({ role: "developer", content: i });
              break;
            }
            case "remove": {
              s.push({
                type: "other",
                message: "system messages are removed for this model",
              });
              break;
            }
            default: {
              const o = r;
              throw new Error(`Unsupported system message mode: ${o}`);
            }
          }
          break;
        }
        case "user": {
          if (i.length === 1 && i[0].type === "text") {
            n.push({ role: "user", content: i[0].text });
            break;
          }
          n.push({
            role: "user",
            content: i.map((o, c) => {
              var l, u, f, _;
              switch (o.type) {
                case "text":
                  return { type: "text", text: o.text };
                case "image":
                  return {
                    type: "image_url",
                    image_url: {
                      url:
                        o.image instanceof URL
                          ? o.image.toString()
                          : `data:${(l = o.mimeType) != null ? l : "image/jpeg"};base64,${Es(o.image)}`,
                      detail:
                        (f =
                          (u = o.providerMetadata) == null
                            ? void 0
                            : u.openai) == null
                          ? void 0
                          : f.imageDetail,
                    },
                  };
                case "file": {
                  if (o.data instanceof URL)
                    throw new le({
                      functionality:
                        "'File content parts with URL data' functionality not supported.",
                    });
                  switch (o.mimeType) {
                    case "audio/wav":
                      return {
                        type: "input_audio",
                        input_audio: { data: o.data, format: "wav" },
                      };
                    case "audio/mp3":
                    case "audio/mpeg":
                      return {
                        type: "input_audio",
                        input_audio: { data: o.data, format: "mp3" },
                      };
                    case "application/pdf":
                      return {
                        type: "file",
                        file: {
                          filename:
                            (_ = o.filename) != null ? _ : `part-${c}.pdf`,
                          file_data: `data:application/pdf;base64,${o.data}`,
                        },
                      };
                    default:
                      throw new le({
                        functionality: `File content part type ${o.mimeType} in user messages`,
                      });
                  }
                }
              }
            }),
          });
          break;
        }
        case "assistant": {
          let o = "";
          const c = [];
          for (const l of i)
            switch (l.type) {
              case "text": {
                o += l.text;
                break;
              }
              case "tool-call": {
                c.push({
                  id: l.toolCallId,
                  type: "function",
                  function: {
                    name: l.toolName,
                    arguments: JSON.stringify(l.args),
                  },
                });
                break;
              }
            }
          if (e) {
            if (c.length > 1)
              throw new le({
                functionality:
                  "useLegacyFunctionCalling with multiple tool calls in one message",
              });
            n.push({
              role: "assistant",
              content: o,
              function_call: c.length > 0 ? c[0].function : void 0,
            });
          } else
            n.push({
              role: "assistant",
              content: o,
              tool_calls: c.length > 0 ? c : void 0,
            });
          break;
        }
        case "tool": {
          for (const o of i)
            e
              ? n.push({
                  role: "function",
                  name: o.toolName,
                  content: JSON.stringify(o.result),
                })
              : n.push({
                  role: "tool",
                  tool_call_id: o.toolCallId,
                  content: JSON.stringify(o.result),
                });
          break;
        }
        default: {
          const o = a;
          throw new Error(`Unsupported role: ${o}`);
        }
      }
    return { messages: n, warnings: s };
  }
  function _a(t) {
    var e, r;
    return (r =
      (e = t == null ? void 0 : t.content) == null
        ? void 0
        : e.map(({ token: n, logprob: s, top_logprobs: a }) => ({
            token: n,
            logprob: s,
            topLogprobs: a
              ? a.map(({ token: i, logprob: o }) => ({ token: i, logprob: o }))
              : [],
          }))) != null
      ? r
      : void 0;
  }
  function dr(t) {
    switch (t) {
      case "stop":
        return "stop";
      case "length":
        return "length";
      case "content_filter":
        return "content-filter";
      case "function_call":
      case "tool_calls":
        return "tool-calls";
      default:
        return "unknown";
    }
  }
  var en = y({
      error: y({
        message: h(),
        type: h().nullish(),
        param: Dn().nullish(),
        code: se([h(), P()]).nullish(),
      }),
    }),
    Pe = $o({ errorSchema: en, errorToMessage: (t) => t.error.message });
  function pr({ id: t, model: e, created: r }) {
    return {
      id: t ?? void 0,
      modelId: e ?? void 0,
      timestamp: r != null ? new Date(r * 1e3) : void 0,
    };
  }
  function ad({
    mode: t,
    useLegacyFunctionCalling: e = !1,
    structuredOutputs: r,
  }) {
    var n;
    const s = (n = t.tools) != null && n.length ? t.tools : void 0,
      a = [];
    if (s == null)
      return { tools: void 0, tool_choice: void 0, toolWarnings: a };
    const i = t.toolChoice;
    if (e) {
      const l = [];
      for (const f of s)
        f.type === "provider-defined"
          ? a.push({ type: "unsupported-tool", tool: f })
          : l.push({
              name: f.name,
              description: f.description,
              parameters: f.parameters,
            });
      if (i == null)
        return { functions: l, function_call: void 0, toolWarnings: a };
      switch (i.type) {
        case "auto":
        case "none":
        case void 0:
          return { functions: l, function_call: void 0, toolWarnings: a };
        case "required":
          throw new le({
            functionality: "useLegacyFunctionCalling and toolChoice: required",
          });
        default:
          return {
            functions: l,
            function_call: { name: i.toolName },
            toolWarnings: a,
          };
      }
    }
    const o = [];
    for (const l of s)
      l.type === "provider-defined"
        ? a.push({ type: "unsupported-tool", tool: l })
        : o.push({
            type: "function",
            function: {
              name: l.name,
              description: l.description,
              parameters: l.parameters,
              strict: r ? !0 : void 0,
            },
          });
    if (i == null) return { tools: o, tool_choice: void 0, toolWarnings: a };
    const c = i.type;
    switch (c) {
      case "auto":
      case "none":
      case "required":
        return { tools: o, tool_choice: c, toolWarnings: a };
      case "tool":
        return {
          tools: o,
          tool_choice: { type: "function", function: { name: i.toolName } },
          toolWarnings: a,
        };
      default: {
        const l = c;
        throw new le({ functionality: `Unsupported tool choice type: ${l}` });
      }
    }
  }
  var id = class {
      constructor(t, e, r) {
        ((this.specificationVersion = "v1"),
          (this.modelId = t),
          (this.settings = e),
          (this.config = r));
      }
      get supportsStructuredOutputs() {
        var t;
        return (t = this.settings.structuredOutputs) != null
          ? t
          : tn(this.modelId);
      }
      get defaultObjectGenerationMode() {
        return ld(this.modelId)
          ? "tool"
          : this.supportsStructuredOutputs
            ? "json"
            : "tool";
      }
      get provider() {
        return this.config.provider;
      }
      get supportsImageUrls() {
        return !this.settings.downloadImages;
      }
      getArgs({
        mode: t,
        prompt: e,
        maxTokens: r,
        temperature: n,
        topP: s,
        topK: a,
        frequencyPenalty: i,
        presencePenalty: o,
        stopSequences: c,
        responseFormat: l,
        seed: u,
        providerMetadata: f,
      }) {
        var _, C, S, m, p, d, g, w;
        const x = t.type,
          T = [];
        (a != null && T.push({ type: "unsupported-setting", setting: "topK" }),
          (l == null ? void 0 : l.type) === "json" &&
            l.schema != null &&
            !this.supportsStructuredOutputs &&
            T.push({
              type: "unsupported-setting",
              setting: "responseFormat",
              details:
                "JSON response format schema is only supported with structuredOutputs",
            }));
        const $ = this.settings.useLegacyFunctionCalling;
        if ($ && this.settings.parallelToolCalls === !0)
          throw new le({
            functionality: "useLegacyFunctionCalling with parallelToolCalls",
          });
        if ($ && this.supportsStructuredOutputs)
          throw new le({
            functionality: "structuredOutputs with useLegacyFunctionCalling",
          });
        const { messages: W, warnings: v } = sd({
          prompt: e,
          useLegacyFunctionCalling: $,
          systemMessageMode: ud(this.modelId),
        });
        T.push(...v);
        const b = {
          model: this.modelId,
          logit_bias: this.settings.logitBias,
          logprobs:
            this.settings.logprobs === !0 ||
            typeof this.settings.logprobs == "number"
              ? !0
              : void 0,
          top_logprobs:
            typeof this.settings.logprobs == "number"
              ? this.settings.logprobs
              : typeof this.settings.logprobs == "boolean" &&
                  this.settings.logprobs
                ? 0
                : void 0,
          user: this.settings.user,
          parallel_tool_calls: this.settings.parallelToolCalls,
          max_tokens: r,
          temperature: n,
          top_p: s,
          frequency_penalty: i,
          presence_penalty: o,
          response_format:
            (l == null ? void 0 : l.type) === "json"
              ? this.supportsStructuredOutputs && l.schema != null
                ? {
                    type: "json_schema",
                    json_schema: {
                      schema: l.schema,
                      strict: !0,
                      name: (_ = l.name) != null ? _ : "response",
                      description: l.description,
                    },
                  }
                : { type: "json_object" }
              : void 0,
          stop: c,
          seed: u,
          max_completion_tokens:
            (C = f == null ? void 0 : f.openai) == null
              ? void 0
              : C.maxCompletionTokens,
          store: (S = f == null ? void 0 : f.openai) == null ? void 0 : S.store,
          metadata:
            (m = f == null ? void 0 : f.openai) == null ? void 0 : m.metadata,
          prediction:
            (p = f == null ? void 0 : f.openai) == null ? void 0 : p.prediction,
          reasoning_effort:
            (g =
              (d = f == null ? void 0 : f.openai) == null
                ? void 0
                : d.reasoningEffort) != null
              ? g
              : this.settings.reasoningEffort,
          messages: W,
        };
        switch (
          (tn(this.modelId)
            ? (b.temperature != null &&
                ((b.temperature = void 0),
                T.push({
                  type: "unsupported-setting",
                  setting: "temperature",
                  details: "temperature is not supported for reasoning models",
                })),
              b.top_p != null &&
                ((b.top_p = void 0),
                T.push({
                  type: "unsupported-setting",
                  setting: "topP",
                  details: "topP is not supported for reasoning models",
                })),
              b.frequency_penalty != null &&
                ((b.frequency_penalty = void 0),
                T.push({
                  type: "unsupported-setting",
                  setting: "frequencyPenalty",
                  details:
                    "frequencyPenalty is not supported for reasoning models",
                })),
              b.presence_penalty != null &&
                ((b.presence_penalty = void 0),
                T.push({
                  type: "unsupported-setting",
                  setting: "presencePenalty",
                  details:
                    "presencePenalty is not supported for reasoning models",
                })),
              b.logit_bias != null &&
                ((b.logit_bias = void 0),
                T.push({
                  type: "other",
                  message: "logitBias is not supported for reasoning models",
                })),
              b.logprobs != null &&
                ((b.logprobs = void 0),
                T.push({
                  type: "other",
                  message: "logprobs is not supported for reasoning models",
                })),
              b.top_logprobs != null &&
                ((b.top_logprobs = void 0),
                T.push({
                  type: "other",
                  message: "topLogprobs is not supported for reasoning models",
                })),
              b.max_tokens != null &&
                (b.max_completion_tokens == null &&
                  (b.max_completion_tokens = b.max_tokens),
                (b.max_tokens = void 0)))
            : (this.modelId.startsWith("gpt-4o-search-preview") ||
                this.modelId.startsWith("gpt-4o-mini-search-preview")) &&
              b.temperature != null &&
              ((b.temperature = void 0),
              T.push({
                type: "unsupported-setting",
                setting: "temperature",
                details:
                  "temperature is not supported for the search preview models and has been removed.",
              })),
          x)
        ) {
          case "regular": {
            const {
              tools: R,
              tool_choice: F,
              functions: B,
              function_call: q,
              toolWarnings: J,
            } = ad({
              mode: t,
              useLegacyFunctionCalling: $,
              structuredOutputs: this.supportsStructuredOutputs,
            });
            return {
              args: {
                ...b,
                tools: R,
                tool_choice: F,
                functions: B,
                function_call: q,
              },
              warnings: [...T, ...J],
            };
          }
          case "object-json":
            return {
              args: {
                ...b,
                response_format:
                  this.supportsStructuredOutputs && t.schema != null
                    ? {
                        type: "json_schema",
                        json_schema: {
                          schema: t.schema,
                          strict: !0,
                          name: (w = t.name) != null ? w : "response",
                          description: t.description,
                        },
                      }
                    : { type: "json_object" },
              },
              warnings: T,
            };
          case "object-tool":
            return {
              args: $
                ? {
                    ...b,
                    function_call: { name: t.tool.name },
                    functions: [
                      {
                        name: t.tool.name,
                        description: t.tool.description,
                        parameters: t.tool.parameters,
                      },
                    ],
                  }
                : {
                    ...b,
                    tool_choice: {
                      type: "function",
                      function: { name: t.tool.name },
                    },
                    tools: [
                      {
                        type: "function",
                        function: {
                          name: t.tool.name,
                          description: t.tool.description,
                          parameters: t.tool.parameters,
                          strict: this.supportsStructuredOutputs ? !0 : void 0,
                        },
                      },
                    ],
                  },
              warnings: T,
            };
          default: {
            const R = x;
            throw new Error(`Unsupported type: ${R}`);
          }
        }
      }
      async doGenerate(t) {
        var e, r, n, s, a, i, o, c;
        const { args: l, warnings: u } = this.getArgs(t),
          {
            responseHeaders: f,
            value: _,
            rawValue: C,
          } = await De({
            url: this.config.url({
              path: "/chat/completions",
              modelId: this.modelId,
            }),
            headers: Ce(this.config.headers(), t.headers),
            body: l,
            failedResponseHandler: Pe,
            successfulResponseHandler: it(od),
            abortSignal: t.abortSignal,
            fetch: this.config.fetch,
          }),
          { messages: S, ...m } = l,
          p = _.choices[0],
          d = (e = _.usage) == null ? void 0 : e.completion_tokens_details,
          g = (r = _.usage) == null ? void 0 : r.prompt_tokens_details,
          w = { openai: {} };
        return (
          (d == null ? void 0 : d.reasoning_tokens) != null &&
            (w.openai.reasoningTokens =
              d == null ? void 0 : d.reasoning_tokens),
          (d == null ? void 0 : d.accepted_prediction_tokens) != null &&
            (w.openai.acceptedPredictionTokens =
              d == null ? void 0 : d.accepted_prediction_tokens),
          (d == null ? void 0 : d.rejected_prediction_tokens) != null &&
            (w.openai.rejectedPredictionTokens =
              d == null ? void 0 : d.rejected_prediction_tokens),
          (g == null ? void 0 : g.cached_tokens) != null &&
            (w.openai.cachedPromptTokens =
              g == null ? void 0 : g.cached_tokens),
          {
            text: (n = p.message.content) != null ? n : void 0,
            toolCalls:
              this.settings.useLegacyFunctionCalling && p.message.function_call
                ? [
                    {
                      toolCallType: "function",
                      toolCallId: Qe(),
                      toolName: p.message.function_call.name,
                      args: p.message.function_call.arguments,
                    },
                  ]
                : (s = p.message.tool_calls) == null
                  ? void 0
                  : s.map((x) => {
                      var T;
                      return {
                        toolCallType: "function",
                        toolCallId: (T = x.id) != null ? T : Qe(),
                        toolName: x.function.name,
                        args: x.function.arguments,
                      };
                    }),
            finishReason: dr(p.finish_reason),
            usage: {
              promptTokens:
                (i = (a = _.usage) == null ? void 0 : a.prompt_tokens) != null
                  ? i
                  : NaN,
              completionTokens:
                (c = (o = _.usage) == null ? void 0 : o.completion_tokens) !=
                null
                  ? c
                  : NaN,
            },
            rawCall: { rawPrompt: S, rawSettings: m },
            rawResponse: { headers: f, body: C },
            request: { body: JSON.stringify(l) },
            response: pr(_),
            warnings: u,
            logprobs: _a(p.logprobs),
            providerMetadata: w,
          }
        );
      }
      async doStream(t) {
        if (this.settings.simulateStreaming) {
          const m = await this.doGenerate(t);
          return {
            stream: new ReadableStream({
              start(d) {
                if (
                  (d.enqueue({ type: "response-metadata", ...m.response }),
                  m.text &&
                    d.enqueue({ type: "text-delta", textDelta: m.text }),
                  m.toolCalls)
                )
                  for (const g of m.toolCalls)
                    (d.enqueue({
                      type: "tool-call-delta",
                      toolCallType: "function",
                      toolCallId: g.toolCallId,
                      toolName: g.toolName,
                      argsTextDelta: g.args,
                    }),
                      d.enqueue({ type: "tool-call", ...g }));
                (d.enqueue({
                  type: "finish",
                  finishReason: m.finishReason,
                  usage: m.usage,
                  logprobs: m.logprobs,
                  providerMetadata: m.providerMetadata,
                }),
                  d.close());
              },
            }),
            rawCall: m.rawCall,
            rawResponse: m.rawResponse,
            warnings: m.warnings,
          };
        }
        const { args: e, warnings: r } = this.getArgs(t),
          n = {
            ...e,
            stream: !0,
            stream_options:
              this.config.compatibility === "strict"
                ? { include_usage: !0 }
                : void 0,
          },
          { responseHeaders: s, value: a } = await De({
            url: this.config.url({
              path: "/chat/completions",
              modelId: this.modelId,
            }),
            headers: Ce(this.config.headers(), t.headers),
            body: n,
            failedResponseHandler: Pe,
            successfulResponseHandler: Mr(cd),
            abortSignal: t.abortSignal,
            fetch: this.config.fetch,
          }),
          { messages: i, ...o } = e,
          c = [];
        let l = "unknown",
          u = { promptTokens: void 0, completionTokens: void 0 },
          f,
          _ = !0;
        const { useLegacyFunctionCalling: C } = this.settings,
          S = { openai: {} };
        return {
          stream: a.pipeThrough(
            new TransformStream({
              transform(m, p) {
                var d, g, w, x, T, $, W, v, b, R, F, B;
                if (!m.success) {
                  ((l = "error"), p.enqueue({ type: "error", error: m.error }));
                  return;
                }
                const q = m.value;
                if ("error" in q) {
                  ((l = "error"), p.enqueue({ type: "error", error: q.error }));
                  return;
                }
                if (
                  (_ &&
                    ((_ = !1),
                    p.enqueue({ type: "response-metadata", ...pr(q) })),
                  q.usage != null)
                ) {
                  const {
                    prompt_tokens: X,
                    completion_tokens: ue,
                    prompt_tokens_details: K,
                    completion_tokens_details: H,
                  } = q.usage;
                  ((u = {
                    promptTokens: X ?? void 0,
                    completionTokens: ue ?? void 0,
                  }),
                    (H == null ? void 0 : H.reasoning_tokens) != null &&
                      (S.openai.reasoningTokens =
                        H == null ? void 0 : H.reasoning_tokens),
                    (H == null ? void 0 : H.accepted_prediction_tokens) !=
                      null &&
                      (S.openai.acceptedPredictionTokens =
                        H == null ? void 0 : H.accepted_prediction_tokens),
                    (H == null ? void 0 : H.rejected_prediction_tokens) !=
                      null &&
                      (S.openai.rejectedPredictionTokens =
                        H == null ? void 0 : H.rejected_prediction_tokens),
                    (K == null ? void 0 : K.cached_tokens) != null &&
                      (S.openai.cachedPromptTokens =
                        K == null ? void 0 : K.cached_tokens));
                }
                const J = q.choices[0];
                if (
                  ((J == null ? void 0 : J.finish_reason) != null &&
                    (l = dr(J.finish_reason)),
                  (J == null ? void 0 : J.delta) == null)
                )
                  return;
                const j = J.delta;
                j.content != null &&
                  p.enqueue({ type: "text-delta", textDelta: j.content });
                const oe = _a(J == null ? void 0 : J.logprobs);
                oe != null &&
                  oe.length &&
                  (f === void 0 && (f = []), f.push(...oe));
                const Q =
                  C && j.function_call != null
                    ? [
                        {
                          type: "function",
                          id: Qe(),
                          function: j.function_call,
                          index: 0,
                        },
                      ]
                    : j.tool_calls;
                if (Q != null)
                  for (const X of Q) {
                    const ue = X.index;
                    if (c[ue] == null) {
                      if (X.type !== "function")
                        throw new Or({
                          data: X,
                          message: "Expected 'function' type.",
                        });
                      if (X.id == null)
                        throw new Or({
                          data: X,
                          message: "Expected 'id' to be a string.",
                        });
                      if (((d = X.function) == null ? void 0 : d.name) == null)
                        throw new Or({
                          data: X,
                          message: "Expected 'function.name' to be a string.",
                        });
                      c[ue] = {
                        id: X.id,
                        type: "function",
                        function: {
                          name: X.function.name,
                          arguments:
                            (g = X.function.arguments) != null ? g : "",
                        },
                        hasFinished: !1,
                      };
                      const H = c[ue];
                      ((w = H.function) == null ? void 0 : w.name) != null &&
                        ((x = H.function) == null ? void 0 : x.arguments) !=
                          null &&
                        (H.function.arguments.length > 0 &&
                          p.enqueue({
                            type: "tool-call-delta",
                            toolCallType: "function",
                            toolCallId: H.id,
                            toolName: H.function.name,
                            argsTextDelta: H.function.arguments,
                          }),
                        As(H.function.arguments) &&
                          (p.enqueue({
                            type: "tool-call",
                            toolCallType: "function",
                            toolCallId: (T = H.id) != null ? T : Qe(),
                            toolName: H.function.name,
                            args: H.function.arguments,
                          }),
                          (H.hasFinished = !0)));
                      continue;
                    }
                    const K = c[ue];
                    K.hasFinished ||
                      ((($ = X.function) == null ? void 0 : $.arguments) !=
                        null &&
                        (K.function.arguments +=
                          (v =
                            (W = X.function) == null ? void 0 : W.arguments) !=
                          null
                            ? v
                            : ""),
                      p.enqueue({
                        type: "tool-call-delta",
                        toolCallType: "function",
                        toolCallId: K.id,
                        toolName: K.function.name,
                        argsTextDelta:
                          (b = X.function.arguments) != null ? b : "",
                      }),
                      ((R = K.function) == null ? void 0 : R.name) != null &&
                        ((F = K.function) == null ? void 0 : F.arguments) !=
                          null &&
                        As(K.function.arguments) &&
                        (p.enqueue({
                          type: "tool-call",
                          toolCallType: "function",
                          toolCallId: (B = K.id) != null ? B : Qe(),
                          toolName: K.function.name,
                          args: K.function.arguments,
                        }),
                        (K.hasFinished = !0)));
                  }
              },
              flush(m) {
                var p, d;
                m.enqueue({
                  type: "finish",
                  finishReason: l,
                  logprobs: f,
                  usage: {
                    promptTokens: (p = u.promptTokens) != null ? p : NaN,
                    completionTokens:
                      (d = u.completionTokens) != null ? d : NaN,
                  },
                  ...(S != null ? { providerMetadata: S } : {}),
                });
              },
            }),
          ),
          rawCall: { rawPrompt: i, rawSettings: o },
          rawResponse: { headers: s },
          request: { body: JSON.stringify(n) },
          warnings: r,
        };
      }
    },
    ba = y({
      prompt_tokens: P().nullish(),
      completion_tokens: P().nullish(),
      prompt_tokens_details: y({ cached_tokens: P().nullish() }).nullish(),
      completion_tokens_details: y({
        reasoning_tokens: P().nullish(),
        accepted_prediction_tokens: P().nullish(),
        rejected_prediction_tokens: P().nullish(),
      }).nullish(),
    }).nullish(),
    od = y({
      id: h().nullish(),
      created: P().nullish(),
      model: h().nullish(),
      choices: V(
        y({
          message: y({
            role: M("assistant").nullish(),
            content: h().nullish(),
            function_call: y({ arguments: h(), name: h() }).nullish(),
            tool_calls: V(
              y({
                id: h().nullish(),
                type: M("function"),
                function: y({ name: h(), arguments: h() }),
              }),
            ).nullish(),
          }),
          index: P(),
          logprobs: y({
            content: V(
              y({
                token: h(),
                logprob: P(),
                top_logprobs: V(y({ token: h(), logprob: P() })),
              }),
            ).nullable(),
          }).nullish(),
          finish_reason: h().nullish(),
        }),
      ),
      usage: ba,
    }),
    cd = se([
      y({
        id: h().nullish(),
        created: P().nullish(),
        model: h().nullish(),
        choices: V(
          y({
            delta: y({
              role: Cr(["assistant"]).nullish(),
              content: h().nullish(),
              function_call: y({
                name: h().optional(),
                arguments: h().optional(),
              }).nullish(),
              tool_calls: V(
                y({
                  index: P(),
                  id: h().nullish(),
                  type: M("function").nullish(),
                  function: y({
                    name: h().nullish(),
                    arguments: h().nullish(),
                  }),
                }),
              ).nullish(),
            }).nullish(),
            logprobs: y({
              content: V(
                y({
                  token: h(),
                  logprob: P(),
                  top_logprobs: V(y({ token: h(), logprob: P() })),
                }),
              ).nullable(),
            }).nullish(),
            finish_reason: h().nullish(),
            index: P(),
          }),
        ),
        usage: ba,
      }),
      en,
    ]);
  function tn(t) {
    return t.startsWith("o") || t.startsWith("gpt-5");
  }
  function ld(t) {
    return t.startsWith("gpt-4o-audio-preview");
  }
  function ud(t) {
    var e, r;
    return tn(t)
      ? (r = (e = dd[t]) == null ? void 0 : e.systemMessageMode) != null
        ? r
        : "developer"
      : "system";
  }
  var dd = {
    "o1-mini": { systemMessageMode: "remove" },
    "o1-mini-2024-09-12": { systemMessageMode: "remove" },
    "o1-preview": { systemMessageMode: "remove" },
    "o1-preview-2024-09-12": { systemMessageMode: "remove" },
    o3: { systemMessageMode: "developer" },
    "o3-2025-04-16": { systemMessageMode: "developer" },
    "o3-mini": { systemMessageMode: "developer" },
    "o3-mini-2025-01-31": { systemMessageMode: "developer" },
    "o4-mini": { systemMessageMode: "developer" },
    "o4-mini-2025-04-16": { systemMessageMode: "developer" },
  };
  function pd({
    prompt: t,
    inputFormat: e,
    user: r = "user",
    assistant: n = "assistant",
  }) {
    if (
      e === "prompt" &&
      t.length === 1 &&
      t[0].role === "user" &&
      t[0].content.length === 1 &&
      t[0].content[0].type === "text"
    )
      return { prompt: t[0].content[0].text };
    let s = "";
    t[0].role === "system" &&
      ((s += `${t[0].content}

`),
      (t = t.slice(1)));
    for (const { role: a, content: i } of t)
      switch (a) {
        case "system":
          throw new oo({
            message: "Unexpected system message in prompt: ${content}",
            prompt: t,
          });
        case "user": {
          const o = i
            .map((c) => {
              switch (c.type) {
                case "text":
                  return c.text;
                case "image":
                  throw new le({ functionality: "images" });
              }
            })
            .join("");
          s += `${r}:
${o}

`;
          break;
        }
        case "assistant": {
          const o = i
            .map((c) => {
              switch (c.type) {
                case "text":
                  return c.text;
                case "tool-call":
                  throw new le({ functionality: "tool-call messages" });
              }
            })
            .join("");
          s += `${n}:
${o}

`;
          break;
        }
        case "tool":
          throw new le({ functionality: "tool messages" });
        default: {
          const o = a;
          throw new Error(`Unsupported role: ${o}`);
        }
      }
    return (
      (s += `${n}:
`),
      {
        prompt: s,
        stopSequences: [
          `
${r}:`,
        ],
      }
    );
  }
  function wa(t) {
    return t == null
      ? void 0
      : t.tokens.map((e, r) => ({
          token: e,
          logprob: t.token_logprobs[r],
          topLogprobs: t.top_logprobs
            ? Object.entries(t.top_logprobs[r]).map(([n, s]) => ({
                token: n,
                logprob: s,
              }))
            : [],
        }));
  }
  var md = class {
      constructor(t, e, r) {
        ((this.specificationVersion = "v1"),
          (this.defaultObjectGenerationMode = void 0),
          (this.modelId = t),
          (this.settings = e),
          (this.config = r));
      }
      get provider() {
        return this.config.provider;
      }
      getArgs({
        mode: t,
        inputFormat: e,
        prompt: r,
        maxTokens: n,
        temperature: s,
        topP: a,
        topK: i,
        frequencyPenalty: o,
        presencePenalty: c,
        stopSequences: l,
        responseFormat: u,
        seed: f,
      }) {
        var _;
        const C = t.type,
          S = [];
        (i != null && S.push({ type: "unsupported-setting", setting: "topK" }),
          u != null &&
            u.type !== "text" &&
            S.push({
              type: "unsupported-setting",
              setting: "responseFormat",
              details: "JSON response format is not supported.",
            }));
        const { prompt: m, stopSequences: p } = pd({
            prompt: r,
            inputFormat: e,
          }),
          d = [...(p ?? []), ...(l ?? [])],
          g = {
            model: this.modelId,
            echo: this.settings.echo,
            logit_bias: this.settings.logitBias,
            logprobs:
              typeof this.settings.logprobs == "number"
                ? this.settings.logprobs
                : typeof this.settings.logprobs == "boolean" &&
                    this.settings.logprobs
                  ? 0
                  : void 0,
            suffix: this.settings.suffix,
            user: this.settings.user,
            max_tokens: n,
            temperature: s,
            top_p: a,
            frequency_penalty: o,
            presence_penalty: c,
            seed: f,
            prompt: m,
            stop: d.length > 0 ? d : void 0,
          };
        switch (C) {
          case "regular": {
            if ((_ = t.tools) != null && _.length)
              throw new le({ functionality: "tools" });
            if (t.toolChoice) throw new le({ functionality: "toolChoice" });
            return { args: g, warnings: S };
          }
          case "object-json":
            throw new le({ functionality: "object-json mode" });
          case "object-tool":
            throw new le({ functionality: "object-tool mode" });
          default: {
            const w = C;
            throw new Error(`Unsupported type: ${w}`);
          }
        }
      }
      async doGenerate(t) {
        const { args: e, warnings: r } = this.getArgs(t),
          {
            responseHeaders: n,
            value: s,
            rawValue: a,
          } = await De({
            url: this.config.url({
              path: "/completions",
              modelId: this.modelId,
            }),
            headers: Ce(this.config.headers(), t.headers),
            body: e,
            failedResponseHandler: Pe,
            successfulResponseHandler: it(fd),
            abortSignal: t.abortSignal,
            fetch: this.config.fetch,
          }),
          { prompt: i, ...o } = e,
          c = s.choices[0];
        return {
          text: c.text,
          usage: {
            promptTokens: s.usage.prompt_tokens,
            completionTokens: s.usage.completion_tokens,
          },
          finishReason: dr(c.finish_reason),
          logprobs: wa(c.logprobs),
          rawCall: { rawPrompt: i, rawSettings: o },
          rawResponse: { headers: n, body: a },
          response: pr(s),
          warnings: r,
          request: { body: JSON.stringify(e) },
        };
      }
      async doStream(t) {
        const { args: e, warnings: r } = this.getArgs(t),
          n = {
            ...e,
            stream: !0,
            stream_options:
              this.config.compatibility === "strict"
                ? { include_usage: !0 }
                : void 0,
          },
          { responseHeaders: s, value: a } = await De({
            url: this.config.url({
              path: "/completions",
              modelId: this.modelId,
            }),
            headers: Ce(this.config.headers(), t.headers),
            body: n,
            failedResponseHandler: Pe,
            successfulResponseHandler: Mr(gd),
            abortSignal: t.abortSignal,
            fetch: this.config.fetch,
          }),
          { prompt: i, ...o } = e;
        let c = "unknown",
          l = { promptTokens: Number.NaN, completionTokens: Number.NaN },
          u,
          f = !0;
        return {
          stream: a.pipeThrough(
            new TransformStream({
              transform(_, C) {
                if (!_.success) {
                  ((c = "error"), C.enqueue({ type: "error", error: _.error }));
                  return;
                }
                const S = _.value;
                if ("error" in S) {
                  ((c = "error"), C.enqueue({ type: "error", error: S.error }));
                  return;
                }
                (f &&
                  ((f = !1),
                  C.enqueue({ type: "response-metadata", ...pr(S) })),
                  S.usage != null &&
                    (l = {
                      promptTokens: S.usage.prompt_tokens,
                      completionTokens: S.usage.completion_tokens,
                    }));
                const m = S.choices[0];
                ((m == null ? void 0 : m.finish_reason) != null &&
                  (c = dr(m.finish_reason)),
                  (m == null ? void 0 : m.text) != null &&
                    C.enqueue({ type: "text-delta", textDelta: m.text }));
                const p = wa(m == null ? void 0 : m.logprobs);
                p != null &&
                  p.length &&
                  (u === void 0 && (u = []), u.push(...p));
              },
              flush(_) {
                _.enqueue({
                  type: "finish",
                  finishReason: c,
                  logprobs: u,
                  usage: l,
                });
              },
            }),
          ),
          rawCall: { rawPrompt: i, rawSettings: o },
          rawResponse: { headers: s },
          warnings: r,
          request: { body: JSON.stringify(n) },
        };
      }
    },
    fd = y({
      id: h().nullish(),
      created: P().nullish(),
      model: h().nullish(),
      choices: V(
        y({
          text: h(),
          finish_reason: h(),
          logprobs: y({
            tokens: V(h()),
            token_logprobs: V(P()),
            top_logprobs: V(gt(h(), P())).nullable(),
          }).nullish(),
        }),
      ),
      usage: y({ prompt_tokens: P(), completion_tokens: P() }),
    }),
    gd = se([
      y({
        id: h().nullish(),
        created: P().nullish(),
        model: h().nullish(),
        choices: V(
          y({
            text: h(),
            finish_reason: h().nullish(),
            index: P(),
            logprobs: y({
              tokens: V(h()),
              token_logprobs: V(P()),
              top_logprobs: V(gt(h(), P())).nullable(),
            }).nullish(),
          }),
        ),
        usage: y({ prompt_tokens: P(), completion_tokens: P() }).nullish(),
      }),
      en,
    ]),
    hd = class {
      constructor(t, e, r) {
        ((this.specificationVersion = "v1"),
          (this.modelId = t),
          (this.settings = e),
          (this.config = r));
      }
      get provider() {
        return this.config.provider;
      }
      get maxEmbeddingsPerCall() {
        var t;
        return (t = this.settings.maxEmbeddingsPerCall) != null ? t : 2048;
      }
      get supportsParallelCalls() {
        var t;
        return (t = this.settings.supportsParallelCalls) != null ? t : !0;
      }
      async doEmbed({ values: t, headers: e, abortSignal: r }) {
        if (t.length > this.maxEmbeddingsPerCall)
          throw new mo({
            provider: this.provider,
            modelId: this.modelId,
            maxEmbeddingsPerCall: this.maxEmbeddingsPerCall,
            values: t,
          });
        const { responseHeaders: n, value: s } = await De({
          url: this.config.url({ path: "/embeddings", modelId: this.modelId }),
          headers: Ce(this.config.headers(), e),
          body: {
            model: this.modelId,
            input: t,
            encoding_format: "float",
            dimensions: this.settings.dimensions,
            user: this.settings.user,
          },
          failedResponseHandler: Pe,
          successfulResponseHandler: it(yd),
          abortSignal: r,
          fetch: this.config.fetch,
        });
        return {
          embeddings: s.data.map((a) => a.embedding),
          usage: s.usage ? { tokens: s.usage.prompt_tokens } : void 0,
          rawResponse: { headers: n },
        };
      }
    },
    yd = y({
      data: V(y({ embedding: V(P()) })),
      usage: y({ prompt_tokens: P() }).nullish(),
    }),
    vd = { "dall-e-3": 1, "dall-e-2": 10, "gpt-image-1": 10 },
    _d = new Set(["gpt-image-1"]),
    bd = class {
      constructor(t, e, r) {
        ((this.modelId = t),
          (this.settings = e),
          (this.config = r),
          (this.specificationVersion = "v1"));
      }
      get maxImagesPerCall() {
        var t, e;
        return (e =
          (t = this.settings.maxImagesPerCall) != null
            ? t
            : vd[this.modelId]) != null
          ? e
          : 1;
      }
      get provider() {
        return this.config.provider;
      }
      async doGenerate({
        prompt: t,
        n: e,
        size: r,
        aspectRatio: n,
        seed: s,
        providerOptions: a,
        headers: i,
        abortSignal: o,
      }) {
        var c, l, u, f;
        const _ = [];
        (n != null &&
          _.push({
            type: "unsupported-setting",
            setting: "aspectRatio",
            details:
              "This model does not support aspect ratio. Use `size` instead.",
          }),
          s != null &&
            _.push({ type: "unsupported-setting", setting: "seed" }));
        const C =
            (u =
              (l =
                (c = this.config._internal) == null ? void 0 : c.currentDate) ==
              null
                ? void 0
                : l.call(c)) != null
              ? u
              : new Date(),
          { value: S, responseHeaders: m } = await De({
            url: this.config.url({
              path: "/images/generations",
              modelId: this.modelId,
            }),
            headers: Ce(this.config.headers(), i),
            body: {
              model: this.modelId,
              prompt: t,
              n: e,
              size: r,
              ...((f = a.openai) != null ? f : {}),
              ...(_d.has(this.modelId) ? {} : { response_format: "b64_json" }),
            },
            failedResponseHandler: Pe,
            successfulResponseHandler: it(wd),
            abortSignal: o,
            fetch: this.config.fetch,
          });
        return {
          images: S.data.map((p) => p.b64_json),
          warnings: _,
          response: { timestamp: C, modelId: this.modelId, headers: m },
        };
      }
    },
    wd = y({ data: V(y({ b64_json: h() })) }),
    kd = y({
      include: V(h()).nullish(),
      language: h().nullish(),
      prompt: h().nullish(),
      temperature: P().min(0).max(1).nullish().default(0),
      timestampGranularities: V(Cr(["word", "segment"]))
        .nullish()
        .default(["segment"]),
    }),
    ka = {
      afrikaans: "af",
      arabic: "ar",
      armenian: "hy",
      azerbaijani: "az",
      belarusian: "be",
      bosnian: "bs",
      bulgarian: "bg",
      catalan: "ca",
      chinese: "zh",
      croatian: "hr",
      czech: "cs",
      danish: "da",
      dutch: "nl",
      english: "en",
      estonian: "et",
      finnish: "fi",
      french: "fr",
      galician: "gl",
      german: "de",
      greek: "el",
      hebrew: "he",
      hindi: "hi",
      hungarian: "hu",
      icelandic: "is",
      indonesian: "id",
      italian: "it",
      japanese: "ja",
      kannada: "kn",
      kazakh: "kk",
      korean: "ko",
      latvian: "lv",
      lithuanian: "lt",
      macedonian: "mk",
      malay: "ms",
      marathi: "mr",
      maori: "mi",
      nepali: "ne",
      norwegian: "no",
      persian: "fa",
      polish: "pl",
      portuguese: "pt",
      romanian: "ro",
      russian: "ru",
      serbian: "sr",
      slovak: "sk",
      slovenian: "sl",
      spanish: "es",
      swahili: "sw",
      swedish: "sv",
      tagalog: "tl",
      tamil: "ta",
      thai: "th",
      turkish: "tr",
      ukrainian: "uk",
      urdu: "ur",
      vietnamese: "vi",
      welsh: "cy",
    },
    xd = class {
      constructor(t, e) {
        ((this.modelId = t),
          (this.config = e),
          (this.specificationVersion = "v1"));
      }
      get provider() {
        return this.config.provider;
      }
      getArgs({ audio: t, mediaType: e, providerOptions: r }) {
        var n, s, a, i, o;
        const c = [],
          l = Nr({ provider: "openai", providerOptions: r, schema: kd }),
          u = new FormData(),
          f = t instanceof Uint8Array ? new Blob([t]) : new Blob([Lo(t)]);
        if (
          (u.append("model", this.modelId),
          u.append("file", new File([f], "audio", { type: e })),
          l)
        ) {
          const _ = {
            include: (n = l.include) != null ? n : void 0,
            language: (s = l.language) != null ? s : void 0,
            prompt: (a = l.prompt) != null ? a : void 0,
            temperature: (i = l.temperature) != null ? i : void 0,
            timestamp_granularities:
              (o = l.timestampGranularities) != null ? o : void 0,
          };
          for (const C in _) {
            const S = _[C];
            S !== void 0 && u.append(C, String(S));
          }
        }
        return { formData: u, warnings: c };
      }
      async doGenerate(t) {
        var e, r, n, s, a, i;
        const o =
            (n =
              (r =
                (e = this.config._internal) == null ? void 0 : e.currentDate) ==
              null
                ? void 0
                : r.call(e)) != null
              ? n
              : new Date(),
          { formData: c, warnings: l } = this.getArgs(t),
          {
            value: u,
            responseHeaders: f,
            rawValue: _,
          } = await jo({
            url: this.config.url({
              path: "/audio/transcriptions",
              modelId: this.modelId,
            }),
            headers: Ce(this.config.headers(), t.headers),
            formData: c,
            failedResponseHandler: Pe,
            successfulResponseHandler: it(Ad),
            abortSignal: t.abortSignal,
            fetch: this.config.fetch,
          }),
          C = u.language != null && u.language in ka ? ka[u.language] : void 0;
        return {
          text: u.text,
          segments:
            (a =
              (s = u.words) == null
                ? void 0
                : s.map((S) => ({
                    text: S.word,
                    startSecond: S.start,
                    endSecond: S.end,
                  }))) != null
              ? a
              : [],
          language: C,
          durationInSeconds: (i = u.duration) != null ? i : void 0,
          warnings: l,
          response: {
            timestamp: o,
            modelId: this.modelId,
            headers: f,
            body: _,
          },
        };
      }
    },
    Ad = y({
      text: h(),
      language: h().nullish(),
      duration: P().nullish(),
      words: V(y({ word: h(), start: P(), end: P() })).nullish(),
    });
  function Sd({ prompt: t, systemMessageMode: e }) {
    const r = [],
      n = [];
    for (const { role: s, content: a } of t)
      switch (s) {
        case "system": {
          switch (e) {
            case "system": {
              r.push({ role: "system", content: a });
              break;
            }
            case "developer": {
              r.push({ role: "developer", content: a });
              break;
            }
            case "remove": {
              n.push({
                type: "other",
                message: "system messages are removed for this model",
              });
              break;
            }
            default: {
              const i = e;
              throw new Error(`Unsupported system message mode: ${i}`);
            }
          }
          break;
        }
        case "user": {
          r.push({
            role: "user",
            content: a.map((i, o) => {
              var c, l, u, f;
              switch (i.type) {
                case "text":
                  return { type: "input_text", text: i.text };
                case "image":
                  return {
                    type: "input_image",
                    image_url:
                      i.image instanceof URL
                        ? i.image.toString()
                        : `data:${(c = i.mimeType) != null ? c : "image/jpeg"};base64,${Es(i.image)}`,
                    detail:
                      (u =
                        (l = i.providerMetadata) == null ? void 0 : l.openai) ==
                      null
                        ? void 0
                        : u.imageDetail,
                  };
                case "file": {
                  if (i.data instanceof URL)
                    throw new le({
                      functionality: "File URLs in user messages",
                    });
                  switch (i.mimeType) {
                    case "application/pdf":
                      return {
                        type: "input_file",
                        filename:
                          (f = i.filename) != null ? f : `part-${o}.pdf`,
                        file_data: `data:application/pdf;base64,${i.data}`,
                      };
                    default:
                      throw new le({
                        functionality:
                          "Only PDF files are supported in user messages",
                      });
                  }
                }
              }
            }),
          });
          break;
        }
        case "assistant": {
          for (const i of a)
            switch (i.type) {
              case "text": {
                r.push({
                  role: "assistant",
                  content: [{ type: "output_text", text: i.text }],
                });
                break;
              }
              case "tool-call": {
                r.push({
                  type: "function_call",
                  call_id: i.toolCallId,
                  name: i.toolName,
                  arguments: JSON.stringify(i.args),
                });
                break;
              }
            }
          break;
        }
        case "tool": {
          for (const i of a)
            r.push({
              type: "function_call_output",
              call_id: i.toolCallId,
              output: JSON.stringify(i.result),
            });
          break;
        }
        default: {
          const i = s;
          throw new Error(`Unsupported role: ${i}`);
        }
      }
    return { messages: r, warnings: n };
  }
  function xa({ finishReason: t, hasToolCalls: e }) {
    switch (t) {
      case void 0:
      case null:
        return e ? "tool-calls" : "stop";
      case "max_output_tokens":
        return "length";
      case "content_filter":
        return "content-filter";
      default:
        return e ? "tool-calls" : "unknown";
    }
  }
  function Ed({ mode: t, strict: e }) {
    var r;
    const n = (r = t.tools) != null && r.length ? t.tools : void 0,
      s = [];
    if (n == null)
      return { tools: void 0, tool_choice: void 0, toolWarnings: s };
    const a = t.toolChoice,
      i = [];
    for (const c of n)
      switch (c.type) {
        case "function":
          i.push({
            type: "function",
            name: c.name,
            description: c.description,
            parameters: c.parameters,
            strict: e ? !0 : void 0,
          });
          break;
        case "provider-defined":
          switch (c.id) {
            case "openai.web_search_preview":
              i.push({
                type: "web_search_preview",
                search_context_size: c.args.searchContextSize,
                user_location: c.args.userLocation,
              });
              break;
            default:
              s.push({ type: "unsupported-tool", tool: c });
              break;
          }
          break;
        default:
          s.push({ type: "unsupported-tool", tool: c });
          break;
      }
    if (a == null) return { tools: i, tool_choice: void 0, toolWarnings: s };
    const o = a.type;
    switch (o) {
      case "auto":
      case "none":
      case "required":
        return { tools: i, tool_choice: o, toolWarnings: s };
      case "tool":
        return a.toolName === "web_search_preview"
          ? {
              tools: i,
              tool_choice: { type: "web_search_preview" },
              toolWarnings: s,
            }
          : {
              tools: i,
              tool_choice: { type: "function", name: a.toolName },
              toolWarnings: s,
            };
      default: {
        const c = o;
        throw new le({ functionality: `Unsupported tool choice type: ${c}` });
      }
    }
  }
  var Id = class {
      constructor(t, e) {
        ((this.specificationVersion = "v1"),
          (this.defaultObjectGenerationMode = "json"),
          (this.supportsStructuredOutputs = !0),
          (this.modelId = t),
          (this.config = e));
      }
      get provider() {
        return this.config.provider;
      }
      getArgs({
        mode: t,
        maxTokens: e,
        temperature: r,
        stopSequences: n,
        topP: s,
        topK: a,
        presencePenalty: i,
        frequencyPenalty: o,
        seed: c,
        prompt: l,
        providerMetadata: u,
        responseFormat: f,
      }) {
        var _, C, S;
        const m = [],
          p = Kd(this.modelId),
          d = t.type;
        (a != null && m.push({ type: "unsupported-setting", setting: "topK" }),
          c != null && m.push({ type: "unsupported-setting", setting: "seed" }),
          i != null &&
            m.push({ type: "unsupported-setting", setting: "presencePenalty" }),
          o != null &&
            m.push({
              type: "unsupported-setting",
              setting: "frequencyPenalty",
            }),
          n != null &&
            m.push({ type: "unsupported-setting", setting: "stopSequences" }));
        const { messages: g, warnings: w } = Sd({
          prompt: l,
          systemMessageMode: p.systemMessageMode,
        });
        m.push(...w);
        const x = Nr({ provider: "openai", providerOptions: u, schema: Gd }),
          T = (_ = x == null ? void 0 : x.strictSchemas) != null ? _ : !0,
          $ = {
            model: this.modelId,
            input: g,
            temperature: r,
            top_p: s,
            max_output_tokens: e,
            ...((f == null ? void 0 : f.type) === "json" && {
              text: {
                format:
                  f.schema != null
                    ? {
                        type: "json_schema",
                        strict: T,
                        name: (C = f.name) != null ? C : "response",
                        description: f.description,
                        schema: f.schema,
                      }
                    : { type: "json_object" },
              },
            }),
            metadata: x == null ? void 0 : x.metadata,
            parallel_tool_calls: x == null ? void 0 : x.parallelToolCalls,
            previous_response_id: x == null ? void 0 : x.previousResponseId,
            store: x == null ? void 0 : x.store,
            user: x == null ? void 0 : x.user,
            instructions: x == null ? void 0 : x.instructions,
            ...(p.isReasoningModel &&
              ((x == null ? void 0 : x.reasoningEffort) != null ||
                (x == null ? void 0 : x.reasoningSummary) != null) && {
                reasoning: {
                  ...((x == null ? void 0 : x.reasoningEffort) != null && {
                    effort: x.reasoningEffort,
                  }),
                  ...((x == null ? void 0 : x.reasoningSummary) != null && {
                    summary: x.reasoningSummary,
                  }),
                },
              }),
            ...(p.requiredAutoTruncation && { truncation: "auto" }),
          };
        switch (
          (p.isReasoningModel &&
            ($.temperature != null &&
              (($.temperature = void 0),
              m.push({
                type: "unsupported-setting",
                setting: "temperature",
                details: "temperature is not supported for reasoning models",
              })),
            $.top_p != null &&
              (($.top_p = void 0),
              m.push({
                type: "unsupported-setting",
                setting: "topP",
                details: "topP is not supported for reasoning models",
              }))),
          d)
        ) {
          case "regular": {
            const {
              tools: W,
              tool_choice: v,
              toolWarnings: b,
            } = Ed({ mode: t, strict: T });
            return {
              args: { ...$, tools: W, tool_choice: v },
              warnings: [...m, ...b],
            };
          }
          case "object-json":
            return {
              args: {
                ...$,
                text: {
                  format:
                    t.schema != null
                      ? {
                          type: "json_schema",
                          strict: T,
                          name: (S = t.name) != null ? S : "response",
                          description: t.description,
                          schema: t.schema,
                        }
                      : { type: "json_object" },
                },
              },
              warnings: m,
            };
          case "object-tool":
            return {
              args: {
                ...$,
                tool_choice: { type: "function", name: t.tool.name },
                tools: [
                  {
                    type: "function",
                    name: t.tool.name,
                    description: t.tool.description,
                    parameters: t.tool.parameters,
                    strict: T,
                  },
                ],
              },
              warnings: m,
            };
          default: {
            const W = d;
            throw new Error(`Unsupported type: ${W}`);
          }
        }
      }
      async doGenerate(t) {
        var e, r, n, s, a, i, o;
        const { args: c, warnings: l } = this.getArgs(t),
          u = this.config.url({ path: "/responses", modelId: this.modelId }),
          {
            responseHeaders: f,
            value: _,
            rawValue: C,
          } = await De({
            url: u,
            headers: Ce(this.config.headers(), t.headers),
            body: c,
            failedResponseHandler: Pe,
            successfulResponseHandler: it(
              y({
                id: h(),
                created_at: P(),
                error: y({ message: h(), code: h() }).nullish(),
                model: h(),
                output: V(
                  Tr("type", [
                    y({
                      type: M("message"),
                      role: M("assistant"),
                      content: V(
                        y({
                          type: M("output_text"),
                          text: h(),
                          annotations: V(
                            y({
                              type: M("url_citation"),
                              start_index: P(),
                              end_index: P(),
                              url: h(),
                              title: h(),
                            }),
                          ),
                        }),
                      ),
                    }),
                    y({
                      type: M("function_call"),
                      call_id: h(),
                      name: h(),
                      arguments: h(),
                    }),
                    y({ type: M("web_search_call") }),
                    y({ type: M("computer_call") }),
                    y({
                      type: M("reasoning"),
                      summary: V(y({ type: M("summary_text"), text: h() })),
                    }),
                  ]),
                ),
                incomplete_details: y({ reason: h() }).nullable(),
                usage: Aa,
              }),
            ),
            abortSignal: t.abortSignal,
            fetch: this.config.fetch,
          });
        if (_.error)
          throw new ye({
            message: _.error.message,
            url: u,
            requestBodyValues: c,
            statusCode: 400,
            responseHeaders: f,
            responseBody: C,
            isRetryable: !1,
          });
        const S = _.output
            .filter((d) => d.type === "message")
            .flatMap((d) => d.content)
            .filter((d) => d.type === "output_text"),
          m = _.output
            .filter((d) => d.type === "function_call")
            .map((d) => ({
              toolCallType: "function",
              toolCallId: d.call_id,
              toolName: d.name,
              args: d.arguments,
            })),
          p =
            (r =
              (e = _.output.find((d) => d.type === "reasoning")) == null
                ? void 0
                : e.summary) != null
              ? r
              : null;
        return {
          text: S.map((d) => d.text).join(`
`),
          sources: S.flatMap((d) =>
            d.annotations.map((g) => {
              var w, x, T;
              return {
                sourceType: "url",
                id:
                  (T =
                    (x = (w = this.config).generateId) == null
                      ? void 0
                      : x.call(w)) != null
                    ? T
                    : Qe(),
                url: g.url,
                title: g.title,
              };
            }),
          ),
          finishReason: xa({
            finishReason:
              (n = _.incomplete_details) == null ? void 0 : n.reason,
            hasToolCalls: m.length > 0,
          }),
          toolCalls: m.length > 0 ? m : void 0,
          reasoning: p
            ? p.map((d) => ({ type: "text", text: d.text }))
            : void 0,
          usage: {
            promptTokens: _.usage.input_tokens,
            completionTokens: _.usage.output_tokens,
          },
          rawCall: { rawPrompt: void 0, rawSettings: {} },
          rawResponse: { headers: f, body: C },
          request: { body: JSON.stringify(c) },
          response: {
            id: _.id,
            timestamp: new Date(_.created_at * 1e3),
            modelId: _.model,
          },
          providerMetadata: {
            openai: {
              responseId: _.id,
              cachedPromptTokens:
                (a =
                  (s = _.usage.input_tokens_details) == null
                    ? void 0
                    : s.cached_tokens) != null
                  ? a
                  : null,
              reasoningTokens:
                (o =
                  (i = _.usage.output_tokens_details) == null
                    ? void 0
                    : i.reasoning_tokens) != null
                  ? o
                  : null,
            },
          },
          warnings: l,
        };
      }
      async doStream(t) {
        const { args: e, warnings: r } = this.getArgs(t),
          { responseHeaders: n, value: s } = await De({
            url: this.config.url({ path: "/responses", modelId: this.modelId }),
            headers: Ce(this.config.headers(), t.headers),
            body: { ...e, stream: !0 },
            failedResponseHandler: Pe,
            successfulResponseHandler: Mr(Dd),
            abortSignal: t.abortSignal,
            fetch: this.config.fetch,
          }),
          a = this;
        let i = "unknown",
          o = NaN,
          c = NaN,
          l = null,
          u = null,
          f = null;
        const _ = {};
        let C = !1;
        return {
          stream: s.pipeThrough(
            new TransformStream({
              transform(S, m) {
                var p, d, g, w, x, T, $, W;
                if (!S.success) {
                  ((i = "error"), m.enqueue({ type: "error", error: S.error }));
                  return;
                }
                const v = S.value;
                if (Zd(v))
                  v.item.type === "function_call" &&
                    ((_[v.output_index] = {
                      toolName: v.item.name,
                      toolCallId: v.item.call_id,
                    }),
                    m.enqueue({
                      type: "tool-call-delta",
                      toolCallType: "function",
                      toolCallId: v.item.call_id,
                      toolName: v.item.name,
                      argsTextDelta: v.item.arguments,
                    }));
                else if (Ud(v)) {
                  const b = _[v.output_index];
                  b != null &&
                    m.enqueue({
                      type: "tool-call-delta",
                      toolCallType: "function",
                      toolCallId: b.toolCallId,
                      toolName: b.toolName,
                      argsTextDelta: v.delta,
                    });
                } else
                  Fd(v)
                    ? ((f = v.response.id),
                      m.enqueue({
                        type: "response-metadata",
                        id: v.response.id,
                        timestamp: new Date(v.response.created_at * 1e3),
                        modelId: v.response.model,
                      }))
                    : Vd(v)
                      ? m.enqueue({ type: "text-delta", textDelta: v.delta })
                      : qd(v)
                        ? m.enqueue({ type: "reasoning", textDelta: v.delta })
                        : Bd(v) && v.item.type === "function_call"
                          ? ((_[v.output_index] = void 0),
                            (C = !0),
                            m.enqueue({
                              type: "tool-call",
                              toolCallType: "function",
                              toolCallId: v.item.call_id,
                              toolName: v.item.name,
                              args: v.item.arguments,
                            }))
                          : Ld(v)
                            ? ((i = xa({
                                finishReason:
                                  (p = v.response.incomplete_details) == null
                                    ? void 0
                                    : p.reason,
                                hasToolCalls: C,
                              })),
                              (o = v.response.usage.input_tokens),
                              (c = v.response.usage.output_tokens),
                              (l =
                                (g =
                                  (d = v.response.usage.input_tokens_details) ==
                                  null
                                    ? void 0
                                    : d.cached_tokens) != null
                                  ? g
                                  : l),
                              (u =
                                (x =
                                  (w =
                                    v.response.usage.output_tokens_details) ==
                                  null
                                    ? void 0
                                    : w.reasoning_tokens) != null
                                  ? x
                                  : u))
                            : zd(v)
                              ? m.enqueue({
                                  type: "source",
                                  source: {
                                    sourceType: "url",
                                    id:
                                      (W =
                                        ($ = (T = a.config).generateId) == null
                                          ? void 0
                                          : $.call(T)) != null
                                        ? W
                                        : Qe(),
                                    url: v.annotation.url,
                                    title: v.annotation.title,
                                  },
                                })
                              : Jd(v) && m.enqueue({ type: "error", error: v });
              },
              flush(S) {
                S.enqueue({
                  type: "finish",
                  finishReason: i,
                  usage: { promptTokens: o, completionTokens: c },
                  ...((l != null || u != null) && {
                    providerMetadata: {
                      openai: {
                        responseId: f,
                        cachedPromptTokens: l,
                        reasoningTokens: u,
                      },
                    },
                  }),
                });
              },
            }),
          ),
          rawCall: { rawPrompt: void 0, rawSettings: {} },
          rawResponse: { headers: n },
          request: { body: JSON.stringify(e) },
          warnings: r,
        };
      }
    },
    Aa = y({
      input_tokens: P(),
      input_tokens_details: y({ cached_tokens: P().nullish() }).nullish(),
      output_tokens: P(),
      output_tokens_details: y({ reasoning_tokens: P().nullish() }).nullish(),
    }),
    Td = y({ type: M("response.output_text.delta"), delta: h() }),
    Cd = y({
      type: Cr(["response.completed", "response.incomplete"]),
      response: y({
        incomplete_details: y({ reason: h() }).nullish(),
        usage: Aa,
      }),
    }),
    Od = y({
      type: M("response.created"),
      response: y({ id: h(), created_at: P(), model: h() }),
    }),
    Pd = y({
      type: M("response.output_item.done"),
      output_index: P(),
      item: Tr("type", [
        y({ type: M("message") }),
        y({
          type: M("function_call"),
          id: h(),
          call_id: h(),
          name: h(),
          arguments: h(),
          status: M("completed"),
        }),
      ]),
    }),
    Rd = y({
      type: M("response.function_call_arguments.delta"),
      item_id: h(),
      output_index: P(),
      delta: h(),
    }),
    Nd = y({
      type: M("response.output_item.added"),
      output_index: P(),
      item: Tr("type", [
        y({ type: M("message") }),
        y({
          type: M("function_call"),
          id: h(),
          call_id: h(),
          name: h(),
          arguments: h(),
        }),
      ]),
    }),
    Md = y({
      type: M("response.output_text.annotation.added"),
      annotation: y({ type: M("url_citation"), url: h(), title: h() }),
    }),
    jd = y({
      type: M("response.reasoning_summary_text.delta"),
      item_id: h(),
      output_index: P(),
      summary_index: P(),
      delta: h(),
    }),
    $d = y({
      type: M("error"),
      code: h(),
      message: h(),
      param: h().nullish(),
      sequence_number: P(),
    }),
    Dd = se([
      Td,
      Cd,
      Od,
      Pd,
      Rd,
      Nd,
      Md,
      jd,
      $d,
      y({ type: h() }).passthrough(),
    ]);
  function Vd(t) {
    return t.type === "response.output_text.delta";
  }
  function Bd(t) {
    return t.type === "response.output_item.done";
  }
  function Ld(t) {
    return t.type === "response.completed" || t.type === "response.incomplete";
  }
  function Fd(t) {
    return t.type === "response.created";
  }
  function Ud(t) {
    return t.type === "response.function_call_arguments.delta";
  }
  function Zd(t) {
    return t.type === "response.output_item.added";
  }
  function zd(t) {
    return t.type === "response.output_text.annotation.added";
  }
  function qd(t) {
    return t.type === "response.reasoning_summary_text.delta";
  }
  function Jd(t) {
    return t.type === "error";
  }
  function Kd(t) {
    return t.startsWith("o") || t.startsWith("gpt-5")
      ? t.startsWith("o1-mini") || t.startsWith("o1-preview")
        ? {
            isReasoningModel: !0,
            systemMessageMode: "remove",
            requiredAutoTruncation: !1,
          }
        : {
            isReasoningModel: !0,
            systemMessageMode: "developer",
            requiredAutoTruncation: !1,
          }
      : {
          isReasoningModel: !1,
          systemMessageMode: "system",
          requiredAutoTruncation: !1,
        };
  }
  var Gd = y({
      metadata: Dn().nullish(),
      parallelToolCalls: Te().nullish(),
      previousResponseId: h().nullish(),
      store: Te().nullish(),
      user: h().nullish(),
      reasoningEffort: h().nullish(),
      strictSchemas: Te().nullish(),
      instructions: h().nullish(),
      reasoningSummary: h().nullish(),
    }),
    Wd = y({});
  function Hd({ searchContextSize: t, userLocation: e } = {}) {
    return {
      type: "provider-defined",
      id: "openai.web_search_preview",
      args: { searchContextSize: t, userLocation: e },
      parameters: Wd,
    };
  }
  var Yd = { webSearchPreview: Hd },
    Qd = y({
      instructions: h().nullish(),
      speed: P().min(0.25).max(4).default(1).nullish(),
    }),
    Xd = class {
      constructor(t, e) {
        ((this.modelId = t),
          (this.config = e),
          (this.specificationVersion = "v1"));
      }
      get provider() {
        return this.config.provider;
      }
      getArgs({
        text: t,
        voice: e = "alloy",
        outputFormat: r = "mp3",
        speed: n,
        instructions: s,
        providerOptions: a,
      }) {
        const i = [],
          o = Nr({ provider: "openai", providerOptions: a, schema: Qd }),
          c = {
            model: this.modelId,
            input: t,
            voice: e,
            response_format: "mp3",
            speed: n,
            instructions: s,
          };
        if (
          (r &&
            (["mp3", "opus", "aac", "flac", "wav", "pcm"].includes(r)
              ? (c.response_format = r)
              : i.push({
                  type: "unsupported-setting",
                  setting: "outputFormat",
                  details: `Unsupported output format: ${r}. Using mp3 instead.`,
                })),
          o)
        ) {
          const l = {};
          for (const u in l) {
            const f = l[u];
            f !== void 0 && (c[u] = f);
          }
        }
        return { requestBody: c, warnings: i };
      }
      async doGenerate(t) {
        var e, r, n;
        const s =
            (n =
              (r =
                (e = this.config._internal) == null ? void 0 : e.currentDate) ==
              null
                ? void 0
                : r.call(e)) != null
              ? n
              : new Date(),
          { requestBody: a, warnings: i } = this.getArgs(t),
          {
            value: o,
            responseHeaders: c,
            rawValue: l,
          } = await De({
            url: this.config.url({
              path: "/audio/speech",
              modelId: this.modelId,
            }),
            headers: Ce(this.config.headers(), t.headers),
            body: a,
            failedResponseHandler: Pe,
            successfulResponseHandler: Do(),
            abortSignal: t.abortSignal,
            fetch: this.config.fetch,
          });
        return {
          audio: o,
          warnings: i,
          request: { body: JSON.stringify(a) },
          response: {
            timestamp: s,
            modelId: this.modelId,
            headers: c,
            body: l,
          },
        };
      }
    };
  function Sa(t = {}) {
    var e, r, n;
    const s = (e = Fo(t.baseURL)) != null ? e : "https://api.openai.com/v1",
      a = (r = t.compatibility) != null ? r : "compatible",
      i = (n = t.name) != null ? n : "openai",
      o = () => ({
        Authorization: `Bearer ${Io({ apiKey: t.apiKey, environmentVariableName: "OPENAI_API_KEY", description: "OpenAI" })}`,
        "OpenAI-Organization": t.organization,
        "OpenAI-Project": t.project,
        ...t.headers,
      }),
      c = (d, g = {}) =>
        new id(d, g, {
          provider: `${i}.chat`,
          url: ({ path: w }) => `${s}${w}`,
          headers: o,
          compatibility: a,
          fetch: t.fetch,
        }),
      l = (d, g = {}) =>
        new md(d, g, {
          provider: `${i}.completion`,
          url: ({ path: w }) => `${s}${w}`,
          headers: o,
          compatibility: a,
          fetch: t.fetch,
        }),
      u = (d, g = {}) =>
        new hd(d, g, {
          provider: `${i}.embedding`,
          url: ({ path: w }) => `${s}${w}`,
          headers: o,
          fetch: t.fetch,
        }),
      f = (d, g = {}) =>
        new bd(d, g, {
          provider: `${i}.image`,
          url: ({ path: w }) => `${s}${w}`,
          headers: o,
          fetch: t.fetch,
        }),
      _ = (d) =>
        new xd(d, {
          provider: `${i}.transcription`,
          url: ({ path: g }) => `${s}${g}`,
          headers: o,
          fetch: t.fetch,
        }),
      C = (d) =>
        new Xd(d, {
          provider: `${i}.speech`,
          url: ({ path: g }) => `${s}${g}`,
          headers: o,
          fetch: t.fetch,
        }),
      S = (d, g) => {
        if (new.target)
          throw new Error(
            "The OpenAI model function cannot be called with the new keyword.",
          );
        return d === "gpt-3.5-turbo-instruct" ? l(d, g) : c(d, g);
      },
      m = (d) =>
        new Id(d, {
          provider: `${i}.responses`,
          url: ({ path: g }) => `${s}${g}`,
          headers: o,
          fetch: t.fetch,
        }),
      p = function (d, g) {
        return S(d, g);
      };
    return (
      (p.languageModel = S),
      (p.chat = c),
      (p.completion = l),
      (p.responses = m),
      (p.embedding = u),
      (p.textEmbedding = u),
      (p.textEmbeddingModel = u),
      (p.image = f),
      (p.imageModel = f),
      (p.transcription = _),
      (p.transcriptionModel = _),
      (p.speech = C),
      (p.speechModel = C),
      (p.tools = Yd),
      p
    );
  }
  (Sa({ compatibility: "strict" }),
    Je({ namespace: "AI" }),
    y({
      title: h().describe("优化后的标题，简洁明了，不超过50字"),
      summary: h().max(200).describe("一句话摘要，概括核心内容，不超过200字"),
    }),
    y({ category: h().describe("推荐的分类名称，优先从用户已有分类中选择") }),
    y({ tags: V(h()).max(5).describe("3-5个相关标签，简洁有辨识度") }));
  const ot = Je({ namespace: "Embedding" }),
    Rt = {
      openai: {
        baseUrl: "https://api.openai.com/v1",
        defaultModel: "text-embedding-3-small",
        supportsEmbedding: !0,
      },
      anthropic: {
        baseUrl: "https://api.anthropic.com",
        defaultModel: "",
        supportsEmbedding: !1,
      },
      google: {
        baseUrl: "https://generativelanguage.googleapis.com/v1beta",
        defaultModel: "text-embedding-004",
        supportsEmbedding: !0,
      },
      azure: {
        baseUrl: "",
        defaultModel: "text-embedding-ada-002",
        supportsEmbedding: !0,
      },
      deepseek: {
        baseUrl: "https://api.deepseek.com/v1",
        defaultModel: "",
        supportsEmbedding: !1,
      },
      groq: {
        baseUrl: "https://api.groq.com/openai/v1",
        defaultModel: "",
        supportsEmbedding: !1,
      },
      mistral: {
        baseUrl: "https://api.mistral.ai/v1",
        defaultModel: "mistral-embed",
        supportsEmbedding: !0,
      },
      moonshot: {
        baseUrl: "https://api.moonshot.cn/v1",
        defaultModel: "",
        supportsEmbedding: !1,
      },
      zhipu: {
        baseUrl: "https://open.bigmodel.cn/api/paas/v4",
        defaultModel: "embedding-3",
        supportsEmbedding: !0,
      },
      hunyuan: {
        baseUrl: "https://api.hunyuan.cloud.tencent.com/v1",
        defaultModel: "hunyuan-embedding",
        supportsEmbedding: !0,
      },
      nvidia: {
        baseUrl: "https://integrate.api.nvidia.com/v1",
        defaultModel: "nvidia/embed-qa-4",
        supportsEmbedding: !0,
      },
      siliconflow: {
        baseUrl: "https://api.siliconflow.cn/v1",
        defaultModel: "BAAI/bge-m3",
        supportsEmbedding: !0,
      },
      ollama: {
        baseUrl: "http://localhost:11434/v1",
        defaultModel: "nomic-embed-text",
        supportsEmbedding: !0,
      },
      custom: {
        baseUrl: "",
        defaultModel: "text-embedding-3-small",
        supportsEmbedding: !0,
      },
    };
  function ep(t) {
    var e;
    return ((e = Rt[t]) == null ? void 0 : e.supportsEmbedding) ?? !1;
  }
  function tp(t) {
    var e;
    return ((e = Rt[t]) == null ? void 0 : e.defaultModel) || "";
  }
  function rp(t) {
    const { provider: e, apiKey: r, baseUrl: n, model: s, dimensions: a } = t,
      i = Rt[e] || Rt.custom;
    return Sa({
      apiKey: e === "ollama" ? "ollama" : r || "",
      baseURL: n || i.baseUrl,
    }).textEmbeddingModel(s || i.defaultModel, { dimensions: a });
  }
  function Ea(t) {
    const { provider: e, model: r, dimensions: n } = t,
      s = Rt[e],
      a = r || (s == null ? void 0 : s.defaultModel) || "unknown";
    return `${e}:${a}:${n || "auto"}:v1`;
  }
  function np(t) {
    const e = rp(t);
    return {
      getModelKey() {
        return Ea(t);
      },
      async embed(r) {
        ot.debug("Generating embedding", { text: r.slice(0, 50) });
        try {
          const n = await ia({ model: e, value: r });
          return (
            ot.debug("Embedding generated", {
              dimensions: n.embedding.length,
              tokens: n.usage.tokens,
            }),
            { embedding: n.embedding, tokens: n.usage.tokens }
          );
        } catch (n) {
          throw (ot.error("Embedding generation failed", n), n);
        }
      },
      async embedMany(r) {
        var n;
        if (r.length === 0) return { embeddings: [], tokens: 0 };
        ot.debug("Generating embeddings batch", { count: r.length });
        try {
          const s = await hu({ model: e, values: r });
          return (
            ot.debug("Embeddings batch generated", {
              count: s.embeddings.length,
              dimensions: (n = s.embeddings[0]) == null ? void 0 : n.length,
              tokens: s.usage.tokens,
            }),
            { embeddings: s.embeddings, tokens: s.usage.tokens }
          );
        } catch (s) {
          throw (ot.error("Embeddings batch generation failed", s), s);
        }
      },
      async testConnection() {
        try {
          return {
            success: !0,
            dimensions: (await ia({ model: e, value: "test" })).embedding
              .length,
          };
        } catch (r) {
          return {
            success: !1,
            error: r instanceof Error ? r.message : String(r),
          };
        }
      },
    };
  }
  Je({ namespace: "ExtensionEmbedding" });
  function sp(t) {
    return ep(t);
  }
  class rn extends Error {
    constructor(r, n) {
      super(r);
      we(this, "retryAfterSeconds");
      ((this.name = "EmbeddingRateLimitError"), (this.retryAfterSeconds = n));
    }
  }
  class ap {
    constructor() {
      we(this, "config", null);
      we(this, "client", null);
    }
    async loadConfig() {
      return (
        (this.config = await Fe.getEmbeddingConfig()),
        (this.client = null),
        this.config
      );
    }
    getConfig() {
      return this.config;
    }
    isEnabled() {
      return !this.config || !this.config.enabled
        ? !1
        : this.config.provider === "ollama"
          ? !0
          : !!this.config.apiKey;
    }
    isProviderSupported() {
      return this.config ? sp(this.config.provider) : !1;
    }
    getOrCreateClient() {
      if (!this.client && this.config) {
        const e = {
          provider: this.config.provider,
          apiKey: this.config.apiKey,
          baseUrl: this.config.baseUrl,
          model: this.config.model || tp(this.config.provider),
          dimensions: this.config.dimensions,
        };
        this.client = np(e);
      }
      return this.client;
    }
    getModelKey() {
      if (!this.config) throw new Error("EmbeddingClient not configured");
      return Ea({
        provider: this.config.provider,
        model: this.config.model,
        dimensions: this.config.dimensions,
      });
    }
    async embed(e) {
      var r;
      if ((this.config || (await this.loadConfig()), !this.isEnabled()))
        throw new Error("Embedding service is not enabled or configured");
      if (!this.isProviderSupported())
        throw new Error(
          `Provider ${(r = this.config) == null ? void 0 : r.provider} does not support embedding`,
        );
      try {
        return (await this.getOrCreateClient().embed(e)).embedding;
      } catch (n) {
        throw this.isRateLimitError(n)
          ? new rn("Rate limit exceeded", this.extractRetryAfter(n))
          : n;
      }
    }
    async embedBatch(e) {
      var r;
      if ((this.config || (await this.loadConfig()), !this.isEnabled()))
        throw new Error("Embedding service is not enabled or configured");
      if (!this.isProviderSupported())
        throw new Error(
          `Provider ${(r = this.config) == null ? void 0 : r.provider} does not support embedding`,
        );
      try {
        return (await this.getOrCreateClient().embedMany(e)).embeddings;
      } catch (n) {
        throw this.isRateLimitError(n)
          ? new rn("Rate limit exceeded", this.extractRetryAfter(n))
          : n;
      }
    }
    async testConnection() {
      var e;
      if ((this.config || (await this.loadConfig()), !this.isEnabled()))
        return {
          success: !1,
          error: "Embedding service is not enabled or configured",
        };
      if (!this.isProviderSupported())
        return {
          success: !1,
          error: `Provider ${(e = this.config) == null ? void 0 : e.provider} does not support embedding`,
        };
      try {
        return await this.getOrCreateClient().testConnection();
      } catch (r) {
        return {
          success: !1,
          error: r instanceof Error ? r.message : String(r),
        };
      }
    }
    isRateLimitError(e) {
      if (e instanceof Error) {
        const r = e.message.toLowerCase();
        return (
          r.includes("rate limit") ||
          r.includes("429") ||
          r.includes("too many requests")
        );
      }
      return !1;
    }
    extractRetryAfter(e) {
      if (e instanceof Error) {
        const r = e.message.match(/retry after (\d+)/i);
        if (r) return parseInt(r[1], 10);
      }
    }
  }
  const pe = new ap(),
    _e = Je({ namespace: "EmbeddingQueue" });
  function Ia(t) {
    let e = 0;
    for (let r = 0; r < t.length; r++) {
      const n = t.charCodeAt(r);
      ((e = (e << 5) - e + n), (e = e & e));
    }
    return e.toString(16);
  }
  function Ta(t) {
    const e = [];
    if (
      (t.title && e.push(`title: ${t.title}`),
      t.description && e.push(`description: ${t.description}`),
      t.tags && t.tags.length > 0 && e.push(`tags: ${t.tags.join(", ")}`),
      t.url)
    )
      try {
        const r = new URL(t.url),
          n = `${r.hostname}${r.pathname}`;
        e.push(`url: ${n}`);
      } catch {
        e.push(`url: ${t.url}`);
      }
    return e.join(`
`);
  }
  async function ip(t) {
    try {
      const r = (await Fe.getAIConfig()).privacyDomains || [];
      if (r.length === 0) return !1;
      const s = new URL(t).hostname.toLowerCase();
      return r.some((a) => {
        const i = a.toLowerCase();
        return s === i || s.endsWith(`.${i}`);
      });
    } catch {
      return !1;
    }
  }
  const Ca = {
    batchSize: 16,
    maxRetries: 3,
    baseRetryDelay: 1e3,
    requestInterval: 100,
  };
  class op {
    constructor() {
      we(this, "jobs", new Map());
      we(this, "isProcessing", !1);
      we(this, "isPaused", !1);
      we(this, "config", Ca);
      we(this, "progressCallback");
    }
    onProgress(e) {
      this.progressCallback = e;
    }
    async addBookmark(e) {
      if (await ip(e.url)) {
        _e.debug("Skipping privacy URL", { bookmarkId: e.id });
        return;
      }
      const r = Ta(e),
        n = Ia(r);
      if (!(await ke.needsUpdate(e.id, n))) {
        _e.debug("Embedding up to date", { bookmarkId: e.id });
        return;
      }
      const a = {
        bookmarkId: e.id,
        status: "pending",
        retryCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      (this.jobs.set(e.id, a),
        _e.debug("Added job to queue", { bookmarkId: e.id }));
    }
    async addBookmarks(e) {
      for (const r of e) await this.addBookmark(r);
    }
    async addAllBookmarks() {
      const e = await Le.getBookmarks({ isDeleted: !1 });
      return (await this.addBookmarks(e), this.jobs.size);
    }
    async start() {
      if (this.isProcessing) {
        _e.warn("Queue is already processing");
        return;
      }
      const e = await Fe.getEmbeddingConfig();
      ((this.config.batchSize = e.batchSize || Ca.batchSize),
        (this.isProcessing = !0),
        (this.isPaused = !1),
        _e.info("Starting queue processing", { jobCount: this.jobs.size }),
        await this.processQueue());
    }
    pause() {
      ((this.isPaused = !0), _e.info("Queue paused"));
    }
    resume() {
      this.isPaused &&
        ((this.isPaused = !1),
        _e.info("Queue resumed"),
        this.isProcessing && this.processQueue());
    }
    stop() {
      ((this.isProcessing = !1),
        (this.isPaused = !1),
        _e.info("Queue stopped"));
    }
    clear() {
      (this.jobs.clear(), _e.info("Queue cleared"));
    }
    getStatus() {
      const e = Array.from(this.jobs.values()).filter(
          (a) => a.status === "pending",
        ).length,
        r = Array.from(this.jobs.values()).filter(
          (a) => a.status === "processing",
        ).length,
        n = Array.from(this.jobs.values()).filter(
          (a) => a.status === "completed",
        ).length,
        s = Array.from(this.jobs.values()).filter(
          (a) => a.status === "failed",
        ).length;
      return {
        isProcessing: this.isProcessing,
        isPaused: this.isPaused,
        total: this.jobs.size,
        pending: e,
        processing: r,
        completed: n,
        failed: s,
      };
    }
    async processQueue() {
      for (; this.isProcessing && !this.isPaused; ) {
        const e = Array.from(this.jobs.values())
          .filter((r) => r.status === "pending")
          .slice(0, this.config.batchSize);
        if (e.length === 0) {
          (_e.info("Queue processing completed"),
            (this.isProcessing = !1),
            this.notifyProgress());
          return;
        }
        (await this.processBatch(e),
          await this.sleep(this.config.requestInterval));
      }
    }
    async processBatch(e) {
      for (const r of e)
        ((r.status = "processing"), (r.updatedAt = Date.now()));
      try {
        const r = e.map((u) => u.bookmarkId),
          n = await this.getBookmarksByIds(r),
          s = [];
        for (const u of e) {
          const f = n.get(u.bookmarkId);
          if (!f) {
            ((u.status = "failed"),
              (u.error = "Bookmark not found"),
              (u.updatedAt = Date.now()));
            continue;
          }
          const _ = Ta(f),
            C = Ia(_);
          s.push({ job: u, bookmark: f, text: _, checksum: C });
        }
        if (s.length === 0) {
          this.notifyProgress();
          return;
        }
        const a = s.map((u) => u.text),
          i = await pe.embedBatch(a),
          o = pe.getModelKey(),
          c = [],
          l = Date.now();
        for (let u = 0; u < s.length; u++) {
          const { job: f, checksum: _ } = s[u],
            C = i[u],
            S = {
              bookmarkId: f.bookmarkId,
              modelKey: o,
              dim: C.length,
              vector: new Float32Array(C).buffer,
              checksum: _,
              createdAt: l,
              updatedAt: l,
            };
          (c.push(S), (f.status = "completed"), (f.updatedAt = l));
        }
        (await ke.saveEmbeddings(c),
          _e.debug("Batch processed", { count: c.length }));
      } catch (r) {
        if (r instanceof rn) {
          _e.warn("Rate limit hit, pausing queue", {
            retryAfter: r.retryAfterSeconds,
          });
          for (const s of e)
            s.status === "processing" &&
              ((s.status = "pending"), (s.updatedAt = Date.now()));
          const n = (r.retryAfterSeconds || 60) * 1e3;
          await this.sleep(n);
          return;
        }
        _e.error("Batch processing failed", r);
        for (const n of e)
          n.status === "processing" &&
            (n.retryCount++,
            (n.error = r instanceof Error ? r.message : String(r)),
            (n.updatedAt = Date.now()),
            n.retryCount >= this.config.maxRetries
              ? (n.status = "failed")
              : ((n.status = "pending"),
                await this.sleep(
                  this.config.baseRetryDelay * Math.pow(2, n.retryCount - 1),
                )));
      }
      this.notifyProgress();
    }
    async getBookmarksByIds(e) {
      const r = new Map(),
        n = await Le.getBookmarks({ isDeleted: !1 });
      for (const s of n) e.includes(s.id) && r.set(s.id, s);
      return r;
    }
    notifyProgress() {
      if (this.progressCallback) {
        const e = this.getStatus(),
          r =
            e.total > 0
              ? Math.round((e.completed / e.total) * 100)
              : this.isProcessing
                ? 0
                : 100;
        this.progressCallback({
          total: e.total,
          completed: e.completed,
          failed: e.failed,
          percentage: r,
        });
      }
    }
    sleep(e) {
      return new Promise((r) => setTimeout(r, e));
    }
  }
  const ae = new op(),
    Ve = Je({ namespace: "SemanticRetriever" });
  function Oa(t, e) {
    if (t.length !== e.length)
      throw new Error("Vector dimensions do not match");
    let r = 0,
      n = 0,
      s = 0;
    for (let a = 0; a < t.length; a++)
      ((r += t[a] * e[a]), (n += t[a] * t[a]), (s += e[a] * e[a]));
    return n === 0 || s === 0 ? 0 : r / (Math.sqrt(n) * Math.sqrt(s));
  }
  function nn(t) {
    return new Float32Array(t);
  }
  class cp {
    async isAvailable() {
      await pe.loadConfig();
      const e = pe.isEnabled(),
        r = pe.isProviderSupported(),
        n = pe.getConfig(),
        s = e && r;
      return (
        s
          ? Ve.debug("Semantic retriever available", {
              provider: n == null ? void 0 : n.provider,
              model: n == null ? void 0 : n.model,
            })
          : Ve.info("Semantic retriever not available", {
              isEnabled: e,
              isSupported: r,
              provider: n == null ? void 0 : n.provider,
              enabled: n == null ? void 0 : n.enabled,
              hasApiKey: !!(n != null && n.apiKey),
              reason:
                n != null && n.enabled
                  ? r
                    ? !(n != null && n.apiKey) &&
                      (n == null ? void 0 : n.provider) !== "ollama"
                      ? "API key not configured"
                      : "Unknown"
                    : `Provider ${n == null ? void 0 : n.provider} does not support embedding`
                  : "Embedding not enabled in settings",
            }),
        s
      );
    }
    async search(e, r = {}) {
      var m;
      const {
        topK: n = 20,
        minScore: s = 0.3,
        excludeIds: a = [],
        filterIds: i,
      } = r;
      if (!(await this.isAvailable()))
        return (
          Ve.warn("Semantic search is not available"),
          { items: [], queryDimensions: 0, searchedCount: 0 }
        );
      Ve.debug("Generating query embedding", { query: e.slice(0, 50) });
      const o = await pe.embed(e),
        c = new Float32Array(o),
        l = pe.getModelKey(),
        u = await ke.getEmbeddingsByModel(l);
      (Ve.debug("Searching embeddings", {
        modelKey: l,
        embeddingCount: u.length,
        queryDimensions: o.length,
      }),
        u.length === 0 &&
          Ve.warn("No embeddings found for model", { modelKey: l }));
      let f = u;
      if (i && i.length > 0) {
        const p = new Set(i);
        f = u.filter((d) => p.has(d.bookmarkId));
      }
      if (a.length > 0) {
        const p = new Set(a);
        f = f.filter((d) => !p.has(d.bookmarkId));
      }
      const _ = [];
      for (const p of f) {
        if (p.dim !== o.length) {
          Ve.warn("Dimension mismatch", {
            bookmarkId: p.bookmarkId,
            embeddingDim: p.dim,
            queryDim: o.length,
          });
          continue;
        }
        const d = nn(p.vector),
          g = Oa(c, d);
        g >= s && _.push({ bookmarkId: p.bookmarkId, score: g });
      }
      _.sort((p, d) => d.score - p.score);
      const S = _.slice(0, n).map((p) => ({
        bookmarkId: p.bookmarkId,
        score: p.score,
        semanticScore: p.score,
        matchReason: `语义相似度: ${(p.score * 100).toFixed(1)}%`,
      }));
      return (
        Ve.debug("Semantic search completed", {
          query: e.slice(0, 50),
          searchedCount: f.length,
          resultCount: S.length,
          topScore: (m = S[0]) == null ? void 0 : m.score,
        }),
        { items: S, queryDimensions: o.length, searchedCount: f.length }
      );
    }
    async findSimilar(e, r = {}) {
      const { topK: n = 10, minScore: s = 0.5, excludeIds: a = [] } = r,
        i = await ke.getEmbedding(e);
      if (!i)
        return (
          Ve.warn("Bookmark embedding not found", { bookmarkId: e }),
          { items: [], queryDimensions: 0, searchedCount: 0 }
        );
      const o = nn(i.vector),
        c = await ke.getEmbeddingsByModel(i.modelKey),
        l = new Set([e, ...a]),
        u = c.filter((S) => !l.has(S.bookmarkId)),
        f = [];
      for (const S of u) {
        if (S.dim !== i.dim) continue;
        const m = nn(S.vector),
          p = Oa(o, m);
        p >= s && f.push({ bookmarkId: S.bookmarkId, score: p });
      }
      return (
        f.sort((S, m) => m.score - S.score),
        {
          items: f
            .slice(0, n)
            .map((S) => ({
              bookmarkId: S.bookmarkId,
              score: S.score,
              semanticScore: S.score,
              matchReason: `相似度: ${(S.score * 100).toFixed(1)}%`,
            })),
          queryDimensions: i.dim,
          searchedCount: u.length,
        }
      );
    }
    async getCoverageStats() {
      const e = await Le.getBookmarks({ isDeleted: !1 }),
        r = e.length;
      if (r === 0) return { total: 0, withEmbedding: 0, coverage: 0 };
      const n = e.map((i) => i.id),
        a = (await ke.getEmbeddings(n)).size;
      return {
        total: r,
        withEmbedding: a,
        coverage: Math.round((a / r) * 100),
      };
    }
  }
  const mr = new cp();
  async function Pa() {
    var t, e;
    try {
      if ((t = z.action) != null && t.openPopup)
        return (await z.action.openPopup(), !0);
      if ((e = z.browserAction) != null && e.openPopup)
        return (await z.browserAction.openPopup(), !0);
    } catch {}
    return !1;
  }
  async function lp(t) {
    try {
      return await z.tabs.create({ url: t });
    } catch {
      return null;
    }
  }
  function Ra(t) {
    return z.runtime.getURL(t);
  }
  async function up(t, e) {
    try {
      const r = await z.tabs.query(e || {});
      await Promise.allSettled(
        r
          .filter((n) => n.id !== void 0)
          .map((n) => z.tabs.sendMessage(n.id, t).catch(() => {})),
      );
    } catch {}
  }
  class dp {
    async getBookmarks() {
      return Le.getBookmarks();
    }
    async getCategories() {
      return Le.getCategories();
    }
    async getAllTags() {
      return Le.getAllTags();
    }
    async getSettings() {
      return Fe.getSettings();
    }
    async getPageHtml() {
      var e;
      try {
        const [r] = await z.tabs.query({ active: !0, currentWindow: !0 });
        return (
          (r != null &&
            r.id &&
            ((e = (
              await z.scripting.executeScript({
                target: { tabId: r.id },
                func: () => document.documentElement.outerHTML,
              })
            )[0]) == null
              ? void 0
              : e.result)) ||
          null
        );
      } catch {
        return null;
      }
    }
    async openOptionsPage(e = "settings") {
      await z.tabs.create({ url: Ra(`app.html#${e}`) });
    }
    async openTab(e) {
      await z.tabs.create({ url: e });
    }
    async getVectorStats() {
      return ke.getStats();
    }
    async clearVectorStore() {
      (ae.stop(), ae.clear(), await ke.clearAll());
    }
    async getEmbeddingQueueStatus() {
      return ae.getStatus();
    }
    async startEmbeddingRebuild() {
      (await pe.loadConfig(), await ke.clearAll(), ae.clear());
      const e = await ae.addAllBookmarks();
      return (
        ae.onProgress((r) => {
          this.broadcastEmbeddingProgress(r);
        }),
        await ae.start(),
        { jobCount: e }
      );
    }
    async startEmbeddingRebuildIncremental() {
      (await pe.loadConfig(), ae.clear());
      const e = await ae.addAllBookmarks();
      return (
        ae.onProgress((r) => {
          this.broadcastEmbeddingProgress(r);
        }),
        await ae.start(),
        { jobCount: e }
      );
    }
    async pauseEmbeddingQueue() {
      ae.pause();
    }
    async resumeEmbeddingQueue() {
      ae.resume();
    }
    async stopEmbeddingQueue() {
      ae.stop();
    }
    async testEmbeddingConnection() {
      return (await pe.loadConfig(), pe.testConnection());
    }
    async queueBookmarkEmbedding(e) {
      if (
        !(await Fe.getEmbeddingConfig()).enabled ||
        (await pe.loadConfig(), !pe.isEnabled())
      )
        return;
      const n = await Le.getBookmarkById(e);
      if (!n) return;
      (await ae.addBookmark(n),
        ae.getStatus().isProcessing || (await ae.start()));
    }
    async queueBookmarksEmbedding(e) {
      if (
        e.length === 0 ||
        !(await Fe.getEmbeddingConfig()).enabled ||
        (await pe.loadConfig(), !pe.isEnabled())
      )
        return;
      const n = await Le.getBookmarks({ isDeleted: !1 }),
        s = new Map(n.map((i) => [i.id, i]));
      for (const i of e) {
        const o = s.get(i);
        o && (await ae.addBookmark(o));
      }
      ae.getStatus().isProcessing || (await ae.start());
    }
    async semanticSearch(e, r) {
      return mr.search(e, r);
    }
    async isSemanticAvailable() {
      return mr.isAvailable();
    }
    async findSimilarBookmarks(e, r) {
      return mr.findSimilar(e, r);
    }
    async getBookmarkEmbedding(e) {
      return ke.getEmbedding(e);
    }
    async getEmbeddingsByModel(e) {
      return ke.getEmbeddingsByModel(e);
    }
    async getEmbeddingCoverageStats() {
      return mr.getCoverageStats();
    }
    async getShortcuts() {
      var e;
      try {
        if (!((e = z == null ? void 0 : z.commands) != null && e.getAll))
          return [];
        const r = await z.commands.getAll(),
          n = ["_execute_action", "_execute_browser_action", "reload"];
        return r
          .filter(
            (s) =>
              !(!s.name || n.some((a) => s.name.toLowerCase().includes(a))),
          )
          .map((s) => ({
            name: s.name || "",
            description: s.description || "",
            shortcut: s.shortcut || "",
          }));
      } catch {
        return [];
      }
    }
    async broadcastEmbeddingProgress(e) {
      try {
        await z.runtime
          .sendMessage({ type: "EMBEDDING_PROGRESS", payload: e })
          .catch(() => {});
      } catch {}
    }
  }
  const pp = "BackgroundService";
  function mp() {
    ii(pp, new dp());
  }
  const sn = "save-to-hamhome",
    an = { en: "Save to HamHome", zh: "收藏到 HamHome" };
  async function Na() {
    var e, r;
    try {
      const n = await Fe.getSettings();
      if (n != null && n.language && ["en", "zh"].includes(n.language))
        return an[n.language];
    } catch {}
    return (
      ((r = (e = z.i18n) == null ? void 0 : e.getUILanguage) == null
        ? void 0
        : r.call(e)) ||
      navigator.language ||
      "en"
    ).startsWith("zh")
      ? an.zh
      : an.en;
  }
  async function Ma() {
    try {
      const t = await Na();
      (await z.contextMenus.removeAll(),
        await z.contextMenus.create({
          id: sn,
          title: t,
          contexts: ["page", "selection", "link", "image"],
        }));
    } catch {}
  }
  async function fp() {
    try {
      const t = await Na();
      await z.contextMenus.update(sn, { title: t });
    } catch {}
  }
  const gp = ze(() => {
    (mp(),
      z.commands.getAll().then((t) => {}),
      Ma(),
      z.commands.onCommand.addListener(async (t) => {
        t === "save-bookmark"
          ? await Pa()
          : t === "toggle-bookmark-panel" &&
            (await up({ type: "TOGGLE_BOOKMARK_PANEL" }));
      }),
      z.contextMenus.onClicked.addListener(async (t, e) => {
        t.menuItemId === sn && (await Pa());
      }),
      z.runtime.onInstalled.addListener(async (t) => {
        (await Ma(), t.reason === "install" && lp(Ra("app.html#settings")));
      }),
      Fe.watchSettings((t) => {
        t != null && t.language && fp();
      }));
  });
  function _p() {}
  function fr(t, ...e) {}
  const hp = {
    debug: (...t) => fr(console.debug, ...t),
    log: (...t) => fr(console.log, ...t),
    warn: (...t) => fr(console.warn, ...t),
    error: (...t) => fr(console.error, ...t),
  };
  let on;
  try {
    ((on = gp.main()), on instanceof Promise);
  } catch (t) {
    throw (hp.error("The background crashed on startup!"), t);
  }
  return on;
})();
