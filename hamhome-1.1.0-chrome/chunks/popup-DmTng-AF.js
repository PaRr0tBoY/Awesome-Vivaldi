import {
  j as e,
  c as y,
  S as Y,
  B as N,
  L,
  I as G,
  T as Q,
  r as k,
  u as H,
  D as J,
  a as Z,
  E as ee,
  b as se,
  d as A,
  e as te,
  f as O,
  g as D,
  h as U,
  i as ae,
  k as W,
  l as ne,
  R as oe,
  m as re,
  n as ie,
  o as ce,
} from "./style-DLmIT9lJ.js";
import {
  u as j,
  L as z,
  C as le,
  S as q,
  s as me,
  g as X,
  a as de,
  B as ue,
  F as he,
  A as xe,
  b as pe,
  c as ge,
  T as fe,
  d as ke,
  e as K,
  f as ve,
  h as be,
  i as je,
  M as we,
  j as ye,
  k as Ne,
  K as Pe,
  l as M,
  m as Ce,
  n as F,
  o as Te,
  p as Se,
  q as Ee,
  r as Le,
} from "./useShortcuts-Dr67ep1t.js";
import "./index-DuzChA5b.js";
function Be({ status: a, error: t, onRetry: c, className: l }) {
  const { t: s } = j();
  return a === "idle"
    ? null
    : e.jsxs("div", {
        className: y("rounded-lg text-xs", l),
        children: [
          a === "loading" &&
            e.jsxs("div", {
              className:
                "rounded-lg flex items-center gap-1.5 py-1.5 px-2 bg-primary/10 text-primary",
              children: [
                e.jsx(z, { className: "h-3.5 w-3.5 animate-spin" }),
                e.jsx("span", { children: s("ai:ai.status.analyzing") }),
              ],
            }),
          a === "success" &&
            e.jsxs("div", {
              className:
                "rounded-lg flex items-center gap-1.5 py-1.5 px-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
              children: [
                e.jsx(Y, { className: "h-3.5 w-3.5" }),
                e.jsx("span", { children: s("ai:ai.status.completed") }),
                e.jsx("button", {
                  onClick: c,
                  className:
                    "underline hover:no-underline whitespace-nowrap ml-2",
                  children: s("ai:ai.status.retry"),
                }),
              ],
            }),
          a === "error" &&
            e.jsxs("div", {
              className:
                "rounded-lg flex items-center justify-between py-1.5 px-2 bg-destructive/10 text-destructive",
              children: [
                e.jsxs("div", {
                  className: "flex items-center gap-1.5",
                  children: [
                    e.jsx(le, { className: "h-3.5 w-3.5" }),
                    e.jsxs("span", {
                      className: "truncate",
                      children: [s("ai:ai.status.failed"), t ? `: ${t}` : ""],
                    }),
                  ],
                }),
                c &&
                  e.jsx("button", {
                    onClick: c,
                    className:
                      "underline hover:no-underline whitespace-nowrap ml-2",
                    children: s("ai:ai.status.retry"),
                  }),
              ],
            }),
          a === "disabled" &&
            e.jsxs("div", {
              className:
                "rounded-lg flex items-center justify-between py-1.5 px-2 bg-muted text-muted-foreground",
              children: [
                e.jsxs("div", {
                  className: "flex items-center gap-1.5",
                  children: [
                    e.jsx(q, { className: "h-3.5 w-3.5" }),
                    e.jsx("span", {
                      children: s("ai:ai.status.notConfigured"),
                    }),
                  ],
                }),
                e.jsx("button", {
                  onClick: () => {
                    me(X("app.html#settings"));
                  },
                  className:
                    "underline hover:no-underline whitespace-nowrap ml-2",
                  children: s("ai:ai.status.configure"),
                }),
              ],
            }),
        ],
      });
}
function Re({
  pageContent: a,
  existingBookmark: t,
  onSaved: c,
  onClose: l,
  onDelete: s,
}) {
  const { t: o } = j(),
    {
      title: r,
      description: n,
      categoryId: g,
      tags: h,
      categories: x,
      allTags: i,
      aiStatus: m,
      aiError: p,
      aiRecommendedCategory: v,
      saving: f,
      setTitle: P,
      setDescription: C,
      setCategoryId: u,
      setTags: b,
      runAIAnalysis: B,
      retryAnalysis: S,
      applyAIRecommendedCategory: E,
      save: R,
      deleteBookmark: w,
    } = de({ pageContent: a, existingBookmark: t, onSaved: c });
  return e.jsxs("div", {
    className: "p-4 space-y-4",
    children: [
      e.jsx(Ae, {
        title: r,
        description: n,
        categoryId: g,
        tags: h,
        categories: x,
        allTags: i,
        existingBookmark: t,
        isLoading: m === "loading",
        aiRecommendedCategory: v,
        aiStatus: m,
        aiError: p,
        onTitleChange: P,
        onDescriptionChange: C,
        onCategoryChange: u,
        onTagsChange: b,
        onLoadSuggestions: B,
        onApplyAICategory: E,
        onRetry: S,
      }),
      e.jsxs("div", {
        className: "flex gap-2 pt-2",
        children: [
          e.jsx(N, {
            variant: "outline",
            size: "sm",
            className: "flex-1",
            onClick: l,
            children: o("bookmark:savePanel.cancel"),
          }),
          e.jsx(N, {
            size: "sm",
            className: "flex-1",
            onClick: R,
            disabled: f || !r.trim(),
            children: f
              ? e.jsxs(e.Fragment, {
                  children: [
                    e.jsx(z, { className: "h-4 w-4 mr-2 animate-spin" }),
                    o("bookmark:savePanel.saving"),
                  ],
                })
              : e.jsxs(e.Fragment, {
                  children: [
                    e.jsx(ue, { className: "h-4 w-4 mr-2" }),
                    o(
                      t
                        ? "bookmark:savePanel.updateBookmark"
                        : "bookmark:savePanel.saveBookmark",
                    ),
                  ],
                }),
          }),
          t &&
            e.jsx(N, {
              variant: "destructive",
              size: "sm",
              className: "flex-1",
              onClick: () => {
                w().then(() => {
                  s == null || s();
                });
              },
              disabled: f,
              children: o("common:common.delete"),
            }),
        ],
      }),
    ],
  });
}
function Ae({
  title: a,
  description: t,
  categoryId: c,
  tags: l,
  categories: s,
  allTags: o,
  existingBookmark: r,
  isLoading: n,
  aiRecommendedCategory: g,
  aiStatus: h,
  aiError: x,
  onTitleChange: i,
  onDescriptionChange: m,
  onCategoryChange: p,
  onTagsChange: v,
  onLoadSuggestions: f,
  onApplyAICategory: P,
  onRetry: C,
}) {
  const { t: u } = j();
  return e.jsxs("div", {
    className: "space-y-3",
    children: [
      e.jsxs("div", {
        className: "space-y-1.5",
        children: [
          e.jsxs("div", {
            className: "flex items-center justify-between",
            children: [
              e.jsxs(L, {
                htmlFor: "title",
                className: "flex items-center gap-2 text-sm font-medium",
                children: [
                  e.jsx(he, { className: "h-4 w-4 text-blue-500" }),
                  u("bookmark:savePanel.titleLabel"),
                ],
              }),
              !r && e.jsx(Be, { status: h, error: x, onRetry: C }),
            ],
          }),
          e.jsx(G, {
            id: "title",
            value: a,
            onChange: (b) => i(b.target.value),
            placeholder: u("bookmark:savePanel.titlePlaceholder"),
            className: "h-9 text-sm shadow-none",
          }),
        ],
      }),
      e.jsxs("div", {
        className: "space-y-1.5",
        children: [
          e.jsxs(L, {
            htmlFor: "description",
            className: "flex items-center gap-2 text-sm font-medium",
            children: [
              e.jsx(xe, { className: "h-4 w-4 text-orange-500" }),
              u("bookmark:savePanel.descriptionLabel"),
            ],
          }),
          e.jsx(Q, {
            id: "description",
            value: t,
            onChange: (b) => m(b.target.value),
            placeholder: u("bookmark:savePanel.descriptionPlaceholder"),
            rows: 2,
            className: "text-sm resize-none shadow-none",
          }),
        ],
      }),
      e.jsxs("div", {
        className: "space-y-1.5",
        children: [
          e.jsxs("div", {
            className: "flex items-center justify-between",
            children: [
              e.jsxs(L, {
                className: "flex items-center gap-2 text-sm font-medium",
                children: [
                  e.jsx(pe, { className: "h-4 w-4 text-emerald-500" }),
                  u("bookmark:savePanel.categoryLabel"),
                ],
              }),
              !r &&
                !g &&
                !c &&
                e.jsx("button", {
                  onClick: f,
                  className:
                    "text-xs text-primary hover:text-primary/80 font-medium",
                  disabled: n,
                  children: u(
                    n
                      ? "bookmark:savePanel.loading"
                      : "bookmark:savePanel.getSuggestions",
                  ),
                }),
            ],
          }),
          e.jsx(ge, {
            value: c,
            onChange: p,
            categories: s,
            aiRecommendedCategory: g,
            onApplyAICategory: P,
            className: "[&_button]:shadow-none",
          }),
        ],
      }),
      e.jsxs("div", {
        className: "space-y-1.5",
        children: [
          e.jsxs("div", {
            className: "flex items-center justify-between",
            children: [
              e.jsxs(L, {
                className: "flex items-center gap-2 text-sm font-medium",
                children: [
                  e.jsx(fe, { className: "h-4 w-4 text-purple-500" }),
                  u("bookmark:savePanel.tagsLabel"),
                ],
              }),
              !r &&
                l.length === 0 &&
                e.jsx("button", {
                  onClick: f,
                  className:
                    "text-xs text-primary hover:text-primary/80 font-medium",
                  disabled: n,
                  children: u(
                    n
                      ? "bookmark:savePanel.loading"
                      : "bookmark:savePanel.getSuggestions",
                  ),
                }),
            ],
          }),
          e.jsx(ke, {
            value: l,
            onChange: v,
            placeholder: u("bookmark:savePanel.tagPlaceholder"),
            maxTags: 10,
            suggestions: o,
            className: "[&_input]:shadow-none",
          }),
        ],
      }),
    ],
  });
}
function Me({
  size: a = "default",
  showTooltip: t = !0,
  className: c,
  portalContainer: l,
}) {
  const { t: s } = j(["common", "bookmark"]),
    { shortcuts: o } = K(),
    [r, n] = k.useState(!1);
  let g;
  try {
    const d = ve();
    g = d == null ? void 0 : d.container;
  } catch {}
  const h = l ?? g,
    { theme: x, setThemeWithTransition: i } = H({ targetElement: h }),
    { language: m, switchLanguage: p } = be(),
    v = a === "sm" ? "h-6 w-6" : "h-8 w-8",
    f = a === "sm" ? "h-3.5 w-3.5" : "h-4 w-4",
    P = (d) => {
      i(x === "dark" ? "light" : "dark", { x: d.clientX, y: d.clientY });
    },
    C = () => {
      p(m === "zh" ? "en" : "zh");
    },
    u = () => {
      (n(!1),
        M()
          .openTab(X("app.html"))
          .catch((T) => {}));
    },
    b = () => {
      n(!1);
      const d = M(),
        T = Ce("shortcuts");
      if (T.startsWith("about:")) {
        alert(
          m === "zh"
            ? `请手动打开 Firefox 扩展管理页面：

1. 在地址栏输入 about:addons
2. 点击右上角齿轮图标
3. 选择"管理扩展快捷键"`
            : `Please open Firefox extension settings manually:

1. Type about:addons in address bar
2. Click the gear icon in top-right
3. Select "Manage Extension Shortcuts"`,
        );
        return;
      }
      d.openTab(T).catch((V) => {});
    },
    B = () => {
      (n(!1),
        M()
          .openOptionsPage()
          .catch((T) => {}));
    },
    S = e.jsx(N, {
      variant: "ghost",
      size: "icon",
      className: y(v, "text-muted-foreground hover:text-foreground"),
      onClick: P,
      title: t
        ? void 0
        : s(
            x === "dark"
              ? "bookmark:contentPanel.switchToLightMode"
              : "bookmark:contentPanel.switchToDarkMode",
          ),
      children:
        x === "dark"
          ? e.jsx(je, { className: f })
          : e.jsx(we, { className: f }),
    }),
    E = e.jsx(N, {
      variant: "ghost",
      size: "icon",
      className: y(v, "text-muted-foreground hover:text-foreground"),
      onClick: C,
      title: t
        ? void 0
        : s(
            m === "zh"
              ? "bookmark:contentPanel.switchToEnglish"
              : "bookmark:contentPanel.switchToChinese",
          ),
      children: e.jsx(ye, { className: f }),
    }),
    R = (d) => (d && (d.formattedShortcut || d.shortcut)) || "",
    w = o.find((d) => d.name === "toggle-panel"),
    I = e.jsxs(J, {
      open: r,
      onOpenChange: n,
      children: [
        e.jsx(Z, {
          asChild: !0,
          children: e.jsx(N, {
            variant: "ghost",
            size: "icon",
            className: y(v, "text-muted-foreground hover:text-foreground"),
            children: e.jsx(ee, { className: f }),
          }),
        }),
        e.jsxs(se, {
          align: "end",
          container: h,
          className: "min-w-[180px]",
          children: [
            e.jsxs(A, {
              onClick: u,
              children: [
                e.jsx(Ne, { className: "h-4 w-4 mr-2" }),
                s("common:common.manageBookmarks"),
                (w == null ? void 0 : w.shortcut) &&
                  e.jsx("span", {
                    className: "ml-auto text-xs text-muted-foreground",
                    children: R(w),
                  }),
              ],
            }),
            e.jsxs(A, {
              onClick: b,
              children: [
                e.jsx(Pe, { className: "h-4 w-4 mr-2" }),
                s("common:common.viewShortcuts"),
              ],
            }),
            e.jsxs(A, {
              onClick: B,
              children: [
                e.jsx(q, { className: "h-4 w-4 mr-2" }),
                s("common:common.settings"),
              ],
            }),
          ],
        }),
      ],
    });
  return t
    ? e.jsx(te, {
        delayDuration: 300,
        children: e.jsxs("div", {
          className: y("flex items-center gap-1", c),
          children: [
            e.jsxs(O, {
              children: [
                e.jsx(D, { asChild: !0, children: S }),
                e.jsx(U, {
                  side: "bottom",
                  children: e.jsx("p", {
                    children: s(
                      x === "dark"
                        ? "bookmark:contentPanel.switchToLightMode"
                        : "bookmark:contentPanel.switchToDarkMode",
                    ),
                  }),
                }),
              ],
            }),
            e.jsxs(O, {
              children: [
                e.jsx(D, { asChild: !0, children: E }),
                e.jsx(U, {
                  side: "bottom",
                  children: e.jsx("p", {
                    children: s(
                      m === "zh"
                        ? "bookmark:contentPanel.switchToEnglish"
                        : "bookmark:contentPanel.switchToChinese",
                    ),
                  }),
                }),
              ],
            }),
            I,
          ],
        }),
      })
    : e.jsxs("div", {
        className: y("flex items-center gap-1", c),
        children: [S, E, I],
      });
}
const ze = {
    auth: {
      pattern:
        /^.*\/(?:login|signin|signup|register|password|auth|oauth|sso)(?:\/|$)/i,
      scope: "pathname",
      description: "认证页面",
    },
    verification: {
      pattern: /^.*\/(?:verify|confirmation|activate|reset)(?:\/|$)/i,
      scope: "pathname",
      description: "验证确认页面",
    },
    mail: {
      pattern: /^.*\/(?:mail|inbox|compose|message|chat|conversation)(?:\/|$)/i,
      scope: "pathname",
      description: "邮件消息页面",
    },
    account: {
      pattern:
        /^.*\/(?:profile|account|settings|preferences|dashboard|admin)(?:\/|$)/i,
      scope: "pathname",
      description: "账户设置页面",
    },
    payment: {
      pattern:
        /^.*\/(?:payment|billing|invoice|subscription|wallet|checkout|order)(?:\/|$)/i,
      scope: "pathname",
      description: "支付财务页面",
    },
    sensitiveParams: {
      pattern:
        /[?&](?:token|auth|key|password|secret|access_token|refresh_token|session|code)=/i,
      scope: "search",
      description: "包含敏感参数",
    },
  },
  Ie = {
    mail: [
      "mail.google.com",
      "outlook.office.com",
      "mail.qq.com",
      "mail.163.com",
      "mail.126.com",
      "mail.sina.com",
      "mail.yahoo.com",
    ],
    storage: [
      "drive.google.com",
      "onedrive.live.com",
      "dropbox.com",
      "pan.baidu.com",
    ],
    social: [
      "messages.google.com",
      "web.whatsapp.com",
      "web.telegram.org",
      "discord.com/channels",
    ],
    workspace: ["docs.google.com", "sheets.googleapis.com", "notion.so"],
    banking: [
      "online.cmbchina.com",
      "pbsz.ebank.cmbchina.com",
      "ebank.spdb.com.cn",
      "mybank.icbc.com.cn",
      "perbank.abchina.com",
    ],
  },
  Oe = {
    workspace: {
      patterns: [/\/public\//i, /[?&]sharing=public/i, /[?&]view=public/i],
    },
    account: {
      patterns: [/\/public\/profile\//i, /\/users\/[^/]+$/i, /\/@[^/]+$/i],
    },
    auth: {
      patterns: [],
      domains: [
        "developer.mozilla.org",
        "docs.github.com",
        "learn.microsoft.com",
      ],
    },
    payment: {
      patterns: [/\/docs\/payment/i, /\/api\/payment/i, /\/guides\/billing/i],
    },
  };
function $(a, t, c) {
  var l, s;
  try {
    const o = new URL(a),
      r = Oe[c || t];
    return r
      ? !!(
          ((l = r.domains) != null && l.some((n) => o.hostname.endsWith(n))) ||
          ((s = r.patterns) != null && s.some((n) => n.test(a)))
        )
      : !1;
  } catch {
    return !1;
  }
}
function De(a, t) {
  if (t.startsWith("/") && t.endsWith("/"))
    try {
      return new RegExp(t.slice(1, -1)).test(a);
    } catch {
      return !1;
    }
  if (t.startsWith("*.")) {
    const c = t.slice(2);
    return a.endsWith(c);
  }
  return a === t;
}
async function _(a) {
  try {
    const t = new URL(a);
    for (const [s, o] of Object.entries(Ie)) {
      const r = o.find((n) => t.hostname === n || t.hostname.endsWith("." + n));
      if (r) {
        if ($(a, "domain", s)) continue;
        return {
          isPrivate: !0,
          reason: `属于隐私域名类别: ${s}`,
          matchedRule: r,
        };
      }
    }
    for (const [s, o] of Object.entries(ze)) {
      let r;
      switch (o.scope) {
        case "pathname":
          r = t.pathname;
          break;
        case "search":
          r = t.search;
          break;
        case "full":
          r = a;
          break;
        default:
          continue;
      }
      if (o.pattern.test(r)) {
        if ($(a, s)) continue;
        return { isPrivate: !0, reason: o.description, matchedRule: s };
      }
    }
    const l = (await ae.getAIConfig()).privacyDomains || [];
    for (const s of l)
      if (De(t.hostname, s))
        return { isPrivate: !0, reason: "匹配自定义隐私域名", matchedRule: s };
    return { isPrivate: !1 };
  } catch {
    return { isPrivate: !0, reason: "检测过程出错，默认保护隐私" };
  }
}
function Ue(a) {
  return [
    /^chrome:\/\//i,
    /^chrome-extension:\/\//i,
    /^edge:\/\//i,
    /^about:/i,
    /^moz-extension:\/\//i,
    /^file:\/\//i,
    /^data:/i,
    /^javascript:/i,
    /^view-source:/i,
  ].some((c) => c.test(a));
}
function We() {
  const [a, t] = k.useState(null),
    [c, l] = k.useState(!0),
    [s, o] = k.useState(null),
    [r, n] = k.useState(!1),
    [g, h] = k.useState(null),
    x = async () => {
      (l(!0), o(null), n(!1), h(null));
      try {
        const [i] = await F.tabs.query({ active: !0, currentWindow: !0 });
        if (!(i != null && i.id) || !i.url) {
          (o("无法获取当前页面信息"), l(!1));
          return;
        }
        if (Ue(i.url)) {
          (o("无法收藏浏览器内部页面"), n(!0), h("浏览器内部页面"), l(!1));
          return;
        }
        const m = await _(i.url);
        if ((n(m.isPrivate), h(m.reason || null), m.isPrivate)) {
          (t({
            url: i.url,
            title: i.title || "",
            content: "",
            textContent: "",
            excerpt: "",
            favicon: i.favIconUrl || "",
            isPrivate: !0,
            privacyReason: m.reason,
          }),
            l(!1));
          return;
        }
        const p = await Te(i.id, { type: "EXTRACT_CONTENT" });
        t(
          p
            ? { ...p, isPrivate: !1 }
            : {
                url: i.url,
                title: i.title || "",
                content: "",
                textContent: "",
                excerpt: "",
                favicon: i.favIconUrl || "",
                isPrivate: !1,
              },
        );
      } catch {
        try {
          const [m] = await F.tabs.query({ active: !0, currentWindow: !0 });
          if (m != null && m.url) {
            const p = await _(m.url);
            (n(p.isPrivate),
              h(p.reason || null),
              t({
                url: m.url,
                title: m.title || "",
                content: "",
                textContent: "",
                excerpt: "",
                favicon: m.favIconUrl || "",
                isPrivate: p.isPrivate,
                privacyReason: p.reason,
              }));
          } else o("获取页面内容失败");
        } catch {
          o("获取页面内容失败");
        }
      } finally {
        l(!1);
      }
    };
  return (
    k.useEffect(() => {
      x();
    }, []),
    {
      pageContent: a,
      loading: c,
      error: s,
      isPrivate: r,
      privacyReason: g,
      refresh: x,
    }
  );
}
function Fe() {
  const { t: a } = j(["common", "bookmark"]),
    { shortcuts: t } = K(),
    [c, l] = k.useState(null),
    { pageContent: s, loading: o, error: r } = We(),
    n = t.find((i) => i.name === "save-bookmark"),
    g =
      (n == null ? void 0 : n.formattedShortcut) ||
      (n == null ? void 0 : n.shortcut) ||
      "⌘/Ctrl + Shift + E";
  k.useEffect(() => {
    s != null && s.url && W.getBookmarkByUrl(s.url).then(l);
  }, [s == null ? void 0 : s.url]);
  const h = async () => {
      if (s != null && s.url) {
        const i = await W.getBookmarkByUrl(s.url);
        l(i);
      }
    },
    { appSettings: x } = Se();
  return e.jsxs("div", {
    className:
      "w-[420px] min-h-[400px] max-h-[1200px] flex flex-col bg-background text-foreground",
    children: [
      e.jsx("main", {
        className: "flex-1 overflow-y-auto min-h-0",
        children: o
          ? e.jsx($e, {})
          : r
            ? e.jsx(_e, { error: r })
            : s
              ? e.jsx(Re, {
                  pageContent: s,
                  existingBookmark: c,
                  onSaved: () => {
                    (h(), window.close());
                  },
                  onClose: () => window.close(),
                  onDelete: () => window.close(),
                })
              : null,
      }),
      e.jsx("footer", {
        className:
          "px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground shrink-0",
        children: e.jsxs("div", {
          className: "flex items-center justify-between",
          children: [
            e.jsxs("span", {
              children: [a("bookmark:popup.shortcut"), ": ", g],
            }),
            e.jsx(Me, { size: "sm", showTooltip: !0 }),
          ],
        }),
      }),
      e.jsx(Ee, { theme: x.theme }),
    ],
  });
}
function $e() {
  const { t: a } = j("bookmark");
  return e.jsxs("div", {
    className: "flex flex-col items-center justify-center h-full gap-4 p-6",
    children: [
      e.jsx("div", {
        className:
          "w-16 h-16 rounded-2xl bg-linear-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center",
        children: e.jsx(z, { className: "h-8 w-8 animate-spin text-primary" }),
      }),
      e.jsxs("div", {
        className: "text-center",
        children: [
          e.jsx("p", {
            className: "font-medium text-foreground",
            children: a("popup.loadingPage"),
          }),
          e.jsx("p", {
            className: "text-sm text-muted-foreground mt-1",
            children: a("popup.pleaseWait"),
          }),
        ],
      }),
    ],
  });
}
function _e({ error: a }) {
  const { t } = j("bookmark");
  return e.jsxs("div", {
    className:
      "flex flex-col items-center justify-center h-full gap-4 p-6 text-center",
    children: [
      e.jsx("div", {
        className:
          "w-16 h-16 rounded-2xl bg-linear-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center",
        children: e.jsx("span", { className: "text-4xl", children: "😅" }),
      }),
      e.jsxs("div", {
        children: [
          e.jsx("p", {
            className: "font-medium text-foreground mb-1",
            children: t("popup.cannotGetPage"),
          }),
          e.jsx("p", {
            className: "text-sm text-muted-foreground",
            children: a,
          }),
        ],
      }),
    ],
  });
}
ne();
oe.createRoot(document.getElementById("root")).render(
  e.jsx(re.StrictMode, {
    children: e.jsx(ie, {
      i18n: ce,
      children: e.jsx(Le, { children: e.jsx(Fe, {}) }),
    }),
  }),
);
