var rl = Object.defineProperty;
var nl = (e, t, r) =>
  t in e
    ? rl(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r })
    : (e[t] = r);
var dt = (e, t, r) => nl(e, typeof t != "symbol" ? t + "" : t, r);
import {
  r as T,
  aO as al,
  aP as sl,
  aQ as ol,
  aR as il,
  p as we,
  X as fs,
  z as ll,
  j as C,
  Y as cl,
  x as ul,
  y as dl,
  A as hs,
  P as ys,
  F as Ht,
  Z as vs,
  M as _s,
  $ as pl,
  a3 as ml,
  a5 as gl,
  a6 as fl,
  a4 as hl,
  a7 as yl,
  a8 as vl,
  a9 as _l,
  aa as bl,
  c as it,
  aS as wl,
  aT as ya,
  aU as va,
  k as oe,
  i as Ie,
  aV as Nt,
  B as Sr,
  G as Gr,
  Q as xl,
  ab as bs,
  aw as kl,
  U as Al,
  af as Sl,
  I as Tl,
  S as Cl,
  aW as ws,
  aL as dr,
  aX as Il,
  aY as El,
  aZ as vr,
  a_ as Rl,
} from "./style-DLmIT9lJ.js";
import {
  aiCacheStorage as _a,
  snapshotStorage as Pl,
} from "./index-DuzChA5b.js";
const Nl = (e, t, r, n) => {
    var s, o, i, l;
    const a = [r, { code: t, ...(n || {}) }];
    if (
      (o = (s = e == null ? void 0 : e.services) == null ? void 0 : s.logger) !=
        null &&
      o.forward
    )
      return e.services.logger.forward(a, "warn", "react-i18next::", !0);
    (_t(a[0]) && (a[0] = `react-i18next:: ${a[0]}`),
      (l = (i = e == null ? void 0 : e.services) == null ? void 0 : i.logger) !=
        null && l.warn
        ? e.services.logger.warn(...a)
        : console != null && console.warn);
  },
  ba = {},
  bn = (e, t, r, n) => {
    (_t(r) && ba[r]) || (_t(r) && (ba[r] = new Date()), Nl(e, t, r, n));
  },
  xs = (e, t) => () => {
    if (e.isInitialized) t();
    else {
      const r = () => {
        (setTimeout(() => {
          e.off("initialized", r);
        }, 0),
          t());
      };
      e.on("initialized", r);
    }
  },
  wn = (e, t, r) => {
    e.loadNamespaces(t, xs(e, r));
  },
  wa = (e, t, r, n) => {
    if (
      (_t(r) && (r = [r]),
      e.options.preload && e.options.preload.indexOf(t) > -1)
    )
      return wn(e, r, n);
    (r.forEach((a) => {
      e.options.ns.indexOf(a) < 0 && e.options.ns.push(a);
    }),
      e.loadLanguages(t, xs(e, n)));
  },
  Ol = (e, t, r = {}) =>
    !t.languages || !t.languages.length
      ? (bn(t, "NO_LANGUAGES", "i18n.languages were undefined or empty", {
          languages: t.languages,
        }),
        !0)
      : t.hasLoadedNamespace(e, {
          lng: r.lng,
          precheck: (n, a) => {
            if (
              r.bindI18n &&
              r.bindI18n.indexOf("languageChanging") > -1 &&
              n.services.backendConnector.backend &&
              n.isLanguageChangingTo &&
              !a(n.isLanguageChangingTo, e)
            )
              return !1;
          },
        }),
  _t = (e) => typeof e == "string",
  jl = (e) => typeof e == "object" && e !== null,
  Ml = (e, t) => {
    const r = T.useRef();
    return (
      T.useEffect(() => {
        r.current = e;
      }, [e, t]),
      r.current
    );
  },
  ks = (e, t, r, n) => e.getFixedT(t, r, n),
  $l = (e, t, r, n) => T.useCallback(ks(e, t, r, n), [e, t, r, n]),
  qn = (e, t = {}) => {
    var w, A, I, z;
    const { i18n: r } = t,
      { i18n: n, defaultNS: a } = T.useContext(al) || {},
      s = r || n || sl();
    if ((s && !s.reportNamespaces && (s.reportNamespaces = new ol()), !s)) {
      bn(
        s,
        "NO_I18NEXT_INSTANCE",
        "useTranslation: You will need to pass in an i18next instance by using initReactI18next",
      );
      const b = (D, q) =>
          _t(q)
            ? q
            : jl(q) && _t(q.defaultValue)
              ? q.defaultValue
              : Array.isArray(D)
                ? D[D.length - 1]
                : D,
        x = [b, {}, !1];
      return ((x.t = b), (x.i18n = {}), (x.ready = !1), x);
    }
    (w = s.options.react) != null &&
      w.wait &&
      bn(
        s,
        "DEPRECATED_OPTION",
        "useTranslation: It seems you are still using the old wait option, you may migrate to the new useSuspense behaviour.",
      );
    const o = { ...il(), ...s.options.react, ...t },
      { useSuspense: i, keyPrefix: l } = o;
    let c = e || a || ((A = s.options) == null ? void 0 : A.defaultNS);
    ((c = _t(c) ? [c] : c || ["translation"]),
      (z = (I = s.reportNamespaces).addUsedNamespaces) == null || z.call(I, c));
    const u =
        (s.isInitialized || s.initializedStoreOnce) &&
        c.every((b) => Ol(b, s, o)),
      d = $l(s, t.lng || null, o.nsMode === "fallback" ? c : c[0], l),
      g = () => d,
      _ = () => ks(s, t.lng || null, o.nsMode === "fallback" ? c : c[0], l),
      [h, v] = T.useState(g);
    let p = c.join();
    t.lng && (p = `${t.lng}${p}`);
    const f = Ml(p),
      k = T.useRef(!0);
    (T.useEffect(() => {
      const { bindI18n: b, bindI18nStore: x } = o;
      ((k.current = !0),
        !u &&
          !i &&
          (t.lng
            ? wa(s, t.lng, c, () => {
                k.current && v(_);
              })
            : wn(s, c, () => {
                k.current && v(_);
              })),
        u && f && f !== p && k.current && v(_));
      const D = () => {
        k.current && v(_);
      };
      return (
        b && (s == null || s.on(b, D)),
        x && (s == null || s.store.on(x, D)),
        () => {
          ((k.current = !1),
            s && b && (b == null || b.split(" ").forEach((q) => s.off(q, D))),
            x && s && x.split(" ").forEach((q) => s.store.off(q, D)));
        }
      );
    }, [s, p]),
      T.useEffect(() => {
        k.current && u && v(g);
      }, [s, l, u]));
    const S = [h, s, u];
    if (((S.t = h), (S.i18n = s), (S.ready = u), u || (!u && !i))) return S;
    throw new Promise((b) => {
      t.lng ? wa(s, t.lng, c, () => b()) : wn(s, c, () => b());
    });
  };
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const xh = we("AlignLeft", [
  ["path", { d: "M15 12H3", key: "6jk70r" }],
  ["path", { d: "M17 18H3", key: "1amg6g" }],
  ["path", { d: "M21 6H3", key: "1jwq7v" }],
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const kh = we("Bookmark", [
  [
    "path",
    { d: "m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z", key: "1fy3hk" },
  ],
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ah = we("CircleAlert", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }],
  ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }],
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Sh = we("FileText", [
  [
    "path",
    {
      d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",
      key: "1rqfz7",
    },
  ],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "M10 9H8", key: "b1mrlr" }],
  ["path", { d: "M16 13H8", key: "t4e002" }],
  ["path", { d: "M16 17H8", key: "z1uh3a" }],
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ht = we("FolderOpen", [
  [
    "path",
    {
      d: "m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2",
      key: "usdka0",
    },
  ],
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Th = we("Keyboard", [
  ["path", { d: "M10 8h.01", key: "1r9ogq" }],
  ["path", { d: "M12 12h.01", key: "1mp3jc" }],
  ["path", { d: "M14 8h.01", key: "1primd" }],
  ["path", { d: "M16 12h.01", key: "1l6xoz" }],
  ["path", { d: "M18 8h.01", key: "emo2bl" }],
  ["path", { d: "M6 8h.01", key: "x9i8wu" }],
  ["path", { d: "M7 16h10", key: "wp8him" }],
  ["path", { d: "M8 12h.01", key: "czm47f" }],
  [
    "rect",
    { width: "20", height: "16", x: "2", y: "4", rx: "2", key: "18n3k1" },
  ],
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ch = we("Languages", [
  ["path", { d: "m5 8 6 6", key: "1wu5hv" }],
  ["path", { d: "m4 14 6-6 2-3", key: "1k1g8d" }],
  ["path", { d: "M2 5h12", key: "or177f" }],
  ["path", { d: "M7 2h1", key: "1t2jsx" }],
  ["path", { d: "m22 22-5-10-5 10", key: "don7ne" }],
  ["path", { d: "M14 18h6", key: "1m8k6r" }],
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ih = we("List", [
  ["path", { d: "M3 12h.01", key: "nlz23k" }],
  ["path", { d: "M3 18h.01", key: "1tta3j" }],
  ["path", { d: "M3 6h.01", key: "1rqtza" }],
  ["path", { d: "M8 12h13", key: "1za7za" }],
  ["path", { d: "M8 18h13", key: "1lx6n3" }],
  ["path", { d: "M8 6h13", key: "ik3vkj" }],
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Eh = we("LoaderCircle", [
  ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }],
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Rh = we("Moon", [
  ["path", { d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z", key: "a7tn18" }],
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Dl = we("Search", [
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }],
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ph = we("Settings", [
  [
    "path",
    {
      d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",
      key: "1qme2f",
    },
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }],
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Nh = we("Sun", [
  ["circle", { cx: "12", cy: "12", r: "4", key: "4exip2" }],
  ["path", { d: "M12 2v2", key: "tus03m" }],
  ["path", { d: "M12 20v2", key: "1lh1kg" }],
  ["path", { d: "m4.93 4.93 1.41 1.41", key: "149t6j" }],
  ["path", { d: "m17.66 17.66 1.41 1.41", key: "ptbguv" }],
  ["path", { d: "M2 12h2", key: "1t8f8n" }],
  ["path", { d: "M20 12h2", key: "1q8mjw" }],
  ["path", { d: "m6.34 17.66-1.41 1.41", key: "1m8zz5" }],
  ["path", { d: "m19.07 4.93-1.41 1.41", key: "1shlcs" }],
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Oh = we("Tag", [
  [
    "path",
    {
      d: "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z",
      key: "vktsd0",
    },
  ],
  [
    "circle",
    { cx: "7.5", cy: "7.5", r: ".5", fill: "currentColor", key: "kqv944" },
  ],
]);
var Kr = "Popover",
  [As] = ul(Kr, [fs]),
  pr = fs(),
  [Ll, ut] = As(Kr),
  Ss = (e) => {
    const {
        __scopePopover: t,
        children: r,
        open: n,
        defaultOpen: a,
        onOpenChange: s,
        modal: o = !1,
      } = e,
      i = pr(t),
      l = T.useRef(null),
      [c, u] = T.useState(!1),
      [d, g] = ll({ prop: n, defaultProp: a ?? !1, onChange: s, caller: Kr });
    return C.jsx(cl, {
      ...i,
      children: C.jsx(Ll, {
        scope: t,
        contentId: dl(),
        triggerRef: l,
        open: d,
        onOpenChange: g,
        onOpenToggle: T.useCallback(() => g((_) => !_), [g]),
        hasCustomAnchor: c,
        onCustomAnchorAdd: T.useCallback(() => u(!0), []),
        onCustomAnchorRemove: T.useCallback(() => u(!1), []),
        modal: o,
        children: r,
      }),
    });
  };
Ss.displayName = Kr;
var Ts = "PopoverAnchor",
  Ul = T.forwardRef((e, t) => {
    const { __scopePopover: r, ...n } = e,
      a = ut(Ts, r),
      s = pr(r),
      { onCustomAnchorAdd: o, onCustomAnchorRemove: i } = a;
    return (
      T.useEffect(() => (o(), () => i()), [o, i]),
      C.jsx(vs, { ...s, ...n, ref: t })
    );
  });
Ul.displayName = Ts;
var Cs = "PopoverTrigger",
  Is = T.forwardRef((e, t) => {
    const { __scopePopover: r, ...n } = e,
      a = ut(Cs, r),
      s = pr(r),
      o = hs(t, a.triggerRef),
      i = C.jsx(ys.button, {
        type: "button",
        "aria-haspopup": "dialog",
        "aria-expanded": a.open,
        "aria-controls": a.contentId,
        "data-state": Os(a.open),
        ...n,
        ref: o,
        onClick: Ht(e.onClick, a.onOpenToggle),
      });
    return a.hasCustomAnchor
      ? i
      : C.jsx(vs, { asChild: !0, ...s, children: i });
  });
Is.displayName = Cs;
var Bn = "PopoverPortal",
  [Fl, ql] = As(Bn, { forceMount: void 0 }),
  Es = (e) => {
    const { __scopePopover: t, forceMount: r, children: n, container: a } = e,
      s = ut(Bn, t);
    return C.jsx(Fl, {
      scope: t,
      forceMount: r,
      children: C.jsx(_s, {
        present: r || s.open,
        children: C.jsx(pl, { asChild: !0, container: a, children: n }),
      }),
    });
  };
Es.displayName = Bn;
var $t = "PopoverContent",
  Rs = T.forwardRef((e, t) => {
    const r = ql($t, e.__scopePopover),
      { forceMount: n = r.forceMount, ...a } = e,
      s = ut($t, e.__scopePopover);
    return C.jsx(_s, {
      present: n || s.open,
      children: s.modal
        ? C.jsx(zl, { ...a, ref: t })
        : C.jsx(Zl, { ...a, ref: t }),
    });
  });
Rs.displayName = $t;
var Bl = fl("PopoverContent.RemoveScroll"),
  zl = T.forwardRef((e, t) => {
    const r = ut($t, e.__scopePopover),
      n = T.useRef(null),
      a = hs(t, n),
      s = T.useRef(!1);
    return (
      T.useEffect(() => {
        const o = n.current;
        if (o) return ml(o);
      }, []),
      C.jsx(gl, {
        as: Bl,
        allowPinchZoom: !0,
        children: C.jsx(Ps, {
          ...e,
          ref: a,
          trapFocus: r.open,
          disableOutsidePointerEvents: !0,
          onCloseAutoFocus: Ht(e.onCloseAutoFocus, (o) => {
            var i;
            (o.preventDefault(),
              s.current || (i = r.triggerRef.current) == null || i.focus());
          }),
          onPointerDownOutside: Ht(
            e.onPointerDownOutside,
            (o) => {
              const i = o.detail.originalEvent,
                l = i.button === 0 && i.ctrlKey === !0,
                c = i.button === 2 || l;
              s.current = c;
            },
            { checkForDefaultPrevented: !1 },
          ),
          onFocusOutside: Ht(e.onFocusOutside, (o) => o.preventDefault(), {
            checkForDefaultPrevented: !1,
          }),
        }),
      })
    );
  }),
  Zl = T.forwardRef((e, t) => {
    const r = ut($t, e.__scopePopover),
      n = T.useRef(!1),
      a = T.useRef(!1);
    return C.jsx(Ps, {
      ...e,
      ref: t,
      trapFocus: !1,
      disableOutsidePointerEvents: !1,
      onCloseAutoFocus: (s) => {
        var o, i;
        ((o = e.onCloseAutoFocus) == null || o.call(e, s),
          s.defaultPrevented ||
            (n.current || (i = r.triggerRef.current) == null || i.focus(),
            s.preventDefault()),
          (n.current = !1),
          (a.current = !1));
      },
      onInteractOutside: (s) => {
        var l, c;
        ((l = e.onInteractOutside) == null || l.call(e, s),
          s.defaultPrevented ||
            ((n.current = !0),
            s.detail.originalEvent.type === "pointerdown" && (a.current = !0)));
        const o = s.target;
        (((c = r.triggerRef.current) == null ? void 0 : c.contains(o)) &&
          s.preventDefault(),
          s.detail.originalEvent.type === "focusin" &&
            a.current &&
            s.preventDefault());
      },
    });
  }),
  Ps = T.forwardRef((e, t) => {
    const {
        __scopePopover: r,
        trapFocus: n,
        onOpenAutoFocus: a,
        onCloseAutoFocus: s,
        disableOutsidePointerEvents: o,
        onEscapeKeyDown: i,
        onPointerDownOutside: l,
        onFocusOutside: c,
        onInteractOutside: u,
        ...d
      } = e,
      g = ut($t, r),
      _ = pr(r);
    return (
      hl(),
      C.jsx(yl, {
        asChild: !0,
        loop: !0,
        trapped: n,
        onMountAutoFocus: a,
        onUnmountAutoFocus: s,
        children: C.jsx(vl, {
          asChild: !0,
          disableOutsidePointerEvents: o,
          onInteractOutside: u,
          onEscapeKeyDown: i,
          onPointerDownOutside: l,
          onFocusOutside: c,
          onDismiss: () => g.onOpenChange(!1),
          children: C.jsx(_l, {
            "data-state": Os(g.open),
            role: "dialog",
            id: g.contentId,
            ..._,
            ...d,
            ref: t,
            style: {
              ...d.style,
              "--radix-popover-content-transform-origin":
                "var(--radix-popper-transform-origin)",
              "--radix-popover-content-available-width":
                "var(--radix-popper-available-width)",
              "--radix-popover-content-available-height":
                "var(--radix-popper-available-height)",
              "--radix-popover-trigger-width":
                "var(--radix-popper-anchor-width)",
              "--radix-popover-trigger-height":
                "var(--radix-popper-anchor-height)",
            },
          }),
        }),
      })
    );
  }),
  Ns = "PopoverClose",
  Vl = T.forwardRef((e, t) => {
    const { __scopePopover: r, ...n } = e,
      a = ut(Ns, r);
    return C.jsx(ys.button, {
      type: "button",
      ...n,
      ref: t,
      onClick: Ht(e.onClick, () => a.onOpenChange(!1)),
    });
  });
Vl.displayName = Ns;
var Jl = "PopoverArrow",
  Hl = T.forwardRef((e, t) => {
    const { __scopePopover: r, ...n } = e,
      a = pr(r);
    return C.jsx(bl, { ...a, ...n, ref: t });
  });
Hl.displayName = Jl;
function Os(e) {
  return e ? "open" : "closed";
}
var Wl = Ss,
  Gl = Is,
  Kl = Es,
  Yl = Rs;
function Xl({ ...e }) {
  return C.jsx(Wl, { "data-slot": "popover", ...e });
}
function Ql({ ...e }) {
  return C.jsx(Gl, { "data-slot": "popover-trigger", ...e });
}
function ec({ className: e, align: t = "center", sideOffset: r = 4, ...n }) {
  return C.jsx(Kl, {
    children: C.jsx(Yl, {
      "data-slot": "popover-content",
      align: t,
      sideOffset: r,
      className: it(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
        e,
      ),
      ...n,
    }),
  });
}
const jh = ({ theme: e = "system", ...t }) =>
    C.jsx(wl, {
      theme: e,
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "rounded-2xl! text-white!",
          success: "bg-success!",
          error: "bg-red-400!",
          warning: "bg-yellow-500!",
          description: "text-white!",
        },
      },
      style: {
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
      },
      ...t,
    }),
  js = T.createContext(void 0);
function Mh({ children: e }) {
  const [t, r] = T.useState([]),
    [n, a] = T.useState([]),
    [s, o] = T.useState([]),
    [i, l] = T.useState(ya),
    [c, u] = T.useState(va),
    [d, g] = T.useState({
      bookmarkCount: 0,
      categoryCount: 0,
      tagCount: 0,
      storageSize: "0 KB",
    }),
    [_, h] = T.useState(!0),
    v = T.useCallback(async () => {
      try {
        const L = await oe.getBookmarks();
        r(L);
        const R = await oe.getAllTags();
        (o(R), f(L, n));
      } catch {}
    }, [n]),
    p = T.useCallback(async () => {
      try {
        const L = await oe.getCategories();
        a(L);
      } catch {}
    }, []),
    f = (L, R) => {
      const O = new Set();
      L.forEach((Z) => Z.tags.forEach((V) => O.add(V)));
      const H = JSON.stringify({ bookmarks: L, categories: R }),
        j = (new Blob([H]).size / 1024).toFixed(2);
      g({
        bookmarkCount: L.length,
        categoryCount: R.length,
        tagCount: O.size,
        storageSize: `${j} KB`,
      });
    };
  (T.useEffect(() => {
    (async () => {
      h(!0);
      try {
        const [R, O, H, F, j] = await Promise.all([
          oe.getBookmarks(),
          oe.getCategories(),
          oe.getAllTags(),
          Ie.getAIConfig(),
          Ie.getSettings(),
        ]);
        (r(R), a(O), o(H), l(F), u(j), f(R, O));
      } catch {
      } finally {
        h(!1);
      }
    })();
  }, []),
    T.useEffect(() => {
      const L = oe.watchBookmarks(() => {
          v();
        }),
        R = oe.watchCategories(() => {
          p();
        });
      return () => {
        (L(), R());
      };
    }, [v, p]));
  const k = async (L) => {
      const R = await oe.createBookmark(L);
      return (await v(), R);
    },
    S = async (L, R) => {
      (await oe.updateBookmark(L, R), await v());
    },
    w = async (L, R = !1) => {
      (await oe.deleteBookmark(L, R), await v());
    },
    A = async (L, R = null) => {
      const O = await oe.createCategory(L, R);
      return (await p(), O);
    },
    I = async (L, R) => {
      (await oe.updateCategory(L, R), await p());
    },
    z = async (L) => {
      (await oe.deleteCategory(L), await p(), await v());
    },
    b = async (L) => {
      const R = new Map(),
        O = L.filter((j) => !j.parentId);
      for (const j of O)
        try {
          const Z = await oe.createCategory(j.name, null);
          j.id && R.set(j.id, Z.id);
        } catch {}
      let H = L.filter((j) => j.parentId),
        F = 10;
      for (; H.length > 0 && F > 0; ) {
        const j = [];
        for (const Z of H) {
          const V = Z.parentId ? R.get(Z.parentId) : null;
          if (V || !Z.parentId)
            try {
              const J = await oe.createCategory(Z.name, V || null);
              Z.id && R.set(Z.id, J.id);
            } catch {}
          else j.push(Z);
        }
        ((H = j), F--);
      }
      await p();
    },
    x = async (L) => {
      const R = await Ie.setAIConfig(L);
      l(R);
    },
    D = async (L) => {
      const R = await Ie.setSettings(L);
      u(R);
    },
    q = async () => {
      (await Promise.all([
        Nt.removeItem("sync:bookmarks"),
        Nt.removeItem("sync:categories"),
        Nt.removeItem("sync:aiConfig"),
        Nt.removeItem("sync:settings"),
        Nt.removeItem("sync:customFilters"),
        Nt.removeItem("local:bookmarkContents"),
      ]),
        r([]),
        a([]),
        o([]),
        l(ya),
        u(va),
        g({
          bookmarkCount: 0,
          categoryCount: 0,
          tagCount: 0,
          storageSize: "0 KB",
        }));
    },
    Q = (L) => {
      const R = {
        version: "1.0.0",
        exportedAt: Date.now(),
        bookmarks: t,
        categories: n,
      };
      if (L === "json") {
        const O = JSON.stringify(R, null, 2),
          H = "data:application/json;charset=utf-8," + encodeURIComponent(O),
          F = `hamhome_bookmarks_${new Date().toISOString().split("T")[0]}.json`;
        xa(H, F);
      } else {
        const O = tc(t, n),
          H = "data:text/html;charset=utf-8," + encodeURIComponent(O),
          F = `hamhome_bookmarks_${new Date().toISOString().split("T")[0]}.html`;
        xa(H, F);
      }
    };
  return C.jsx(js.Provider, {
    value: {
      bookmarks: t,
      categories: n,
      allTags: s,
      aiConfig: i,
      appSettings: c,
      storageInfo: d,
      loading: _,
      addBookmark: k,
      updateBookmark: S,
      deleteBookmark: w,
      refreshBookmarks: v,
      addCategory: A,
      updateCategory: I,
      deleteCategory: z,
      refreshCategories: p,
      bulkAddCategories: b,
      updateAIConfig: x,
      updateAppSettings: D,
      clearAllData: q,
      exportData: Q,
    },
    children: e,
  });
}
function $h() {
  const e = T.useContext(js);
  if (e === void 0)
    throw new Error("useBookmarks must be used within a BookmarkProvider");
  return e;
}
function xa(e, t) {
  const r = document.createElement("a");
  (r.setAttribute("href", e), r.setAttribute("download", t), r.click());
}
function tc(e, t) {
  const r = new Map(t.map((n) => [n.id, n.name]));
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>HamHome 书签导出</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; background: #f5f5f5; }
    h1 { color: #333; margin-bottom: 24px; }
    .bookmark { background: white; margin-bottom: 16px; padding: 16px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .title { font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #1a1a1a; }
    .title a { color: inherit; text-decoration: none; }
    .title a:hover { color: #f59e0b; }
    .url { color: #666; font-size: 12px; margin-bottom: 8px; word-break: break-all; }
    .description { color: #444; font-size: 14px; margin-bottom: 12px; line-height: 1.5; }
    .meta { display: flex; gap: 8px; flex-wrap: wrap; }
    .category { background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 6px; font-size: 12px; }
    .tag { background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 6px; font-size: 12px; }
  </style>
</head>
<body>
  <h1>🐹 HamHome 书签导出</h1>
  ${e
    .map(
      (n) => `
  <div class="bookmark">
    <div class="title"><a href="${n.url}" target="_blank">${zt(n.title)}</a></div>
    <div class="url">${zt(n.url)}</div>
    ${n.description ? `<div class="description">${zt(n.description)}</div>` : ""}
    <div class="meta">
      ${n.categoryId ? `<span class="category">${zt(r.get(n.categoryId) || "未分类")}</span>` : ""}
      ${n.tags.map((a) => `<span class="tag">${zt(a)}</span>`).join("")}
    </div>
  </div>
  `,
    )
    .join("")}
</body>
</html>`;
}
function zt(e) {
  const t = document.createElement("div");
  return ((t.textContent = e), t.innerHTML);
}
const _r = "i18nextLng";
async function br(e, t) {
  if (e) {
    if (typeof e.changeLanguage != "function") {
      (await new Promise((r) => setTimeout(r, 100)),
        typeof e.changeLanguage == "function" && (await e.changeLanguage(t)));
      return;
    }
    await e.changeLanguage(t);
  }
}
function Dh() {
  const { i18n: e } = qn(),
    [t, r] = T.useState("zh"),
    [n, a] = T.useState(!1),
    s = T.useCallback(async () => {
      try {
        const l = await Ie.getSettings();
        if (l.language && ["en", "zh"].includes(l.language)) return l.language;
      } catch {}
      const i = localStorage.getItem(_r);
      return i && ["en", "zh"].includes(i)
        ? i
        : e.language && ["en", "zh"].includes(e.language)
          ? e.language
          : "zh";
    }, [e.language]);
  (T.useEffect(() => {
    (async () => {
      const l = await s();
      (l !== e.language && (await br(e, l)), localStorage.setItem(_r, l), r(l));
    })();
  }, [e, s]),
    T.useEffect(
      () =>
        Ie.watchSettings((l) => {
          if (l != null && l.language) {
            const c = l.language;
            ["en", "zh"].includes(c) &&
              c !== t &&
              (r(c), br(e, c), localStorage.setItem(_r, c));
          }
        }),
      [t, e],
    ));
  const o = T.useCallback(
    async (i) => {
      try {
        (a(!0),
          r(i),
          await br(e, i),
          localStorage.setItem(_r, i),
          await Ie.setSettings({ language: i }),
          window.dispatchEvent(
            new CustomEvent("languageChange", { detail: { language: i } }),
          ));
      } catch {
        const c = await s();
        (r(c), await br(e, c));
      } finally {
        a(!1);
      }
    },
    [e, s],
  );
  return {
    language: t,
    switchLanguage: o,
    availableLanguages: ["en", "zh"],
    isLoading: n,
    currentLanguageName: { en: "English", zh: "中文" }[t],
  };
}
function Ms({
  node: e,
  selectedId: t,
  expandedIds: r,
  isSearching: n,
  onSelect: a,
  onToggleExpand: s,
  renderNodeIcon: o,
}) {
  const i = e.children.length > 0,
    l = r.has(e.id) || n,
    c = t === e.id;
  return C.jsxs("div", {
    children: [
      C.jsxs("button", {
        type: "button",
        onClick: () => a(e.id),
        className: it(
          "flex items-center gap-2 w-full py-1.5 rounded-md text-sm text-left hover:bg-muted",
          c && "bg-muted",
        ),
        style: { paddingLeft: `${e.level * 16 + 8}px` },
        children: [
          i
            ? C.jsx("div", {
                onClick: (u) => s(e.id, u),
                className:
                  "p-0.5 hover:bg-accent rounded shrink-0 cursor-pointer",
                children: l
                  ? C.jsx(Gr, {
                      className: "h-3.5 w-3.5 text-muted-foreground",
                    })
                  : C.jsx(kl, {
                      className: "h-3.5 w-3.5 text-muted-foreground",
                    }),
              })
            : C.jsx("span", { className: "w-4 shrink-0" }),
          o ? o(e, c) : C.jsx("span", { className: "h-4 w-4 shrink-0" }),
          C.jsx("span", { className: "flex-1 truncate", children: e.name }),
          c && C.jsx(bs, { className: "h-4 w-4 text-primary shrink-0" }),
        ],
      }),
      i &&
        l &&
        C.jsx("div", {
          children: e.children.map((u) =>
            C.jsx(
              Ms,
              {
                node: u,
                selectedId: t,
                expandedIds: r,
                isSearching: n,
                onSelect: a,
                onToggleExpand: s,
                renderNodeIcon: o,
              },
              u.id,
            ),
          ),
        }),
    ],
  });
}
function $s({
  nodes: e,
  flatNodes: t,
  value: r,
  onChange: n,
  searchPlaceholder: a = "搜索...",
  filterFn: s,
  emptyText: o = "无匹配结果",
  prependOptions: i = [],
  renderTrigger: l,
  renderNodeIcon: c,
  renderOptionIcon: u,
  popoverWidth: d,
  popoverAlign: g = "start",
  collisionPadding: _ = 8,
  maxHeight: h = 256,
  triggerClassName: v,
  disabled: p = !1,
}) {
  const [f, k] = T.useState(!1),
    [S, w] = T.useState(""),
    [A, I] = T.useState(new Set()),
    z = T.useMemo(() => {
      if (!S.trim()) return e;
      if (s) return s(e, t, S);
      const R = S.toLowerCase(),
        O = new Set();
      t.forEach((F) => {
        if (F.name.toLowerCase().includes(R)) {
          O.add(F.id);
          let j = F;
          for (; j.parentId && typeof j.parentId == "string"; ) {
            O.add(j.parentId);
            const Z = t.find((V) => V.id === j.parentId);
            if (!Z) break;
            j = Z;
          }
        }
      });
      const H = (F) =>
        F.filter((j) => O.has(j.id)).map((j) => ({
          ...j,
          children: H(j.children),
        }));
      return H(e);
    }, [e, t, S, s]),
    b = T.useMemo(
      () =>
        !r || i.some((R) => R.id === r)
          ? null
          : t.find((R) => R.id === r) || null,
      [r, t, i],
    ),
    x = T.useMemo(() => (r && i.find((R) => R.id === r)) || null, [r, i]),
    D = T.useCallback((R, O) => {
      (O.stopPropagation(),
        I((H) => {
          const F = new Set(H);
          return (F.has(R) ? F.delete(R) : F.add(R), F);
        }));
    }, []),
    q = T.useCallback(
      (R) => {
        (n(R), k(!1), w(""));
      },
      [n],
    ),
    Q = C.jsxs(Sr, {
      variant: "outline",
      disabled: p,
      className: it(
        "w-full justify-between hover:text-card-foreground",
        f && "border-ring ring-ring/50 ring-[3px]",
        v,
      ),
      children: [
        C.jsx("span", {
          className: "truncate",
          children:
            (x == null ? void 0 : x.label) ||
            (b == null ? void 0 : b.name) ||
            a,
        }),
        C.jsx(Gr, { className: "h-4 w-4 opacity-50 shrink-0 ml-2" }),
      ],
    }),
    L = d ? { width: typeof d == "number" ? `${d}px` : d } : {};
  return C.jsxs(Xl, {
    open: f,
    onOpenChange: k,
    children: [
      C.jsx(Ql, {
        asChild: !0,
        children: l
          ? l({ selectedNode: b, selectedOption: x, open: f, disabled: p })
          : Q,
      }),
      C.jsx(ec, {
        className: "p-0",
        align: g,
        style: L,
        sideOffset: 4,
        collisionPadding: _,
        children: C.jsxs(xl, {
          style: { maxHeight: h, overflow: "auto" },
          children: [
            C.jsxs("div", {
              className: "flex items-center border-b px-3",
              children: [
                C.jsx(Dl, {
                  className: "h-4 w-4 text-muted-foreground shrink-0",
                }),
                C.jsx("input", {
                  value: S,
                  onChange: (R) => w(R.target.value),
                  placeholder: a,
                  className:
                    "flex h-9 w-full bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground",
                }),
              ],
            }),
            C.jsxs("div", {
              className: "p-1",
              children: [
                i.map((R) => {
                  const O = r === R.id;
                  return C.jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: () => q(R.id),
                      className: it(
                        "flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm text-left hover:bg-muted",
                        O && "bg-muted",
                      ),
                      children: [
                        C.jsx("span", { className: "w-4 shrink-0" }),
                        u
                          ? u(R, O)
                          : R.icon ||
                            C.jsx("span", { className: "h-4 w-4 shrink-0" }),
                        C.jsx("span", {
                          className: "flex-1",
                          children: R.label,
                        }),
                        O &&
                          C.jsx(bs, {
                            className: "h-4 w-4 text-primary shrink-0",
                          }),
                      ],
                    },
                    R.id,
                  );
                }),
                z.length > 0
                  ? z.map((R) =>
                      C.jsx(
                        Ms,
                        {
                          node: R,
                          selectedId: r,
                          expandedIds: A,
                          isSearching: S.trim().length > 0,
                          onSelect: q,
                          onToggleExpand: D,
                          renderNodeIcon: c,
                        },
                        R.id,
                      ),
                    )
                  : C.jsx("div", {
                      className:
                        "py-6 text-center text-sm text-muted-foreground",
                      children: o,
                    }),
              ],
            }),
          ],
        }),
      }),
    ],
  });
}
function Ds(e) {
  const t = new Map(),
    r = [];
  (e.forEach((a) => {
    t.set(a.id, { ...a, children: [], level: 0, path: a.name });
  }),
    e.forEach((a) => {
      const s = t.get(a.id);
      if (a.parentId && t.has(a.parentId)) {
        const o = t.get(a.parentId);
        (o.children.push(s),
          (s.level = o.level + 1),
          (s.path = `${o.path}/${a.name}`));
      } else r.push(s);
    }));
  const n = (a) =>
    a
      .sort((s, o) => s.order - o.order)
      .map((s) => ({ ...s, children: n(s.children) }));
  return n(r);
}
function Ls(e) {
  const t = [],
    r = (n) => {
      n.forEach((a) => {
        (t.push(a), r(a.children));
      });
    };
  return (r(e), t);
}
function Us(e) {
  return e.includes(" > ")
    ? e
        .split(" > ")
        .map((t) => t.trim())
        .filter(Boolean)
    : [e.trim()].filter(Boolean);
}
function rc(e, t) {
  if (!e) return null;
  const r = Us(e),
    n = r.join("/").toLowerCase(),
    a = t.find((l) => l.path.toLowerCase() === n);
  if (a) return a;
  const s = r[r.length - 1].toLowerCase(),
    o = t.find((l) => l.name.toLowerCase() === s);
  if (r.length === 1 && o) return o;
  if (r.length > 1) {
    const l = t.find((d) => {
      const g = d.path.toLowerCase();
      return g === n || g.endsWith(`/${n}`);
    });
    if (l) return l;
    const c = r.slice(0, -1),
      u = t.find((d) => {
        const g = d.path.toLowerCase();
        return (
          d.name.toLowerCase() === s &&
          c.some((_) => g.includes(_.toLowerCase()))
        );
      });
    if (u) return u;
    if (o) return o;
  }
  const i = t.find(
    (l) =>
      l.name.toLowerCase().includes(s) ||
      s.includes(l.name.toLowerCase()) ||
      l.path.toLowerCase().includes(n),
  );
  return i || null;
}
function Fs(e, t, r) {
  if (!r.trim()) return e;
  const n = r.toLowerCase(),
    a = new Set();
  t.forEach((o) => {
    if (o.name.toLowerCase().includes(n) || o.path.toLowerCase().includes(n)) {
      a.add(o.id);
      let i = o;
      for (
        ;
        i.parentId &&
        (a.add(i.parentId),
        (i = t.find((l) => l.id === i.parentId) || i),
        i.id !== i.parentId);
      );
    }
  });
  const s = (o) =>
    o
      .filter((i) => a.has(i.id))
      .map((i) => ({ ...i, children: s(i.children) }));
  return s(e);
}
function Lh({
  categories: e,
  value: t,
  onChange: r,
  showAllOption: n = !0,
  triggerClassName: a,
}) {
  const { t: s } = qn(["bookmark"]),
    o = T.useMemo(() => Ds(e), [e]),
    i = T.useMemo(() => Ls(o), [o]),
    l = T.useMemo(() => {
      const u = [];
      return (
        n &&
          u.push({
            id: "all",
            label: s("bookmark:bookmark.filter.allCategories"),
            icon: C.jsx(ht, {
              className: "h-4 w-4 text-muted-foreground shrink-0",
            }),
          }),
        u.push({
          id: "uncategorized",
          label: s("bookmark:bookmark.uncategorized"),
          icon: C.jsx(ht, {
            className: "h-4 w-4 text-muted-foreground shrink-0",
          }),
        }),
        u
      );
    }, [n, s]),
    c = T.useMemo(() => {
      if (t === "all") return s("bookmark:bookmark.filter.allCategories");
      if (t === "uncategorized") return s("bookmark:bookmark.uncategorized");
      const u = i.find((d) => d.id === t);
      return u
        ? u.level > 0
          ? u.path
          : u.name
        : s("bookmark:bookmark.filter.allCategories");
    }, [t, i, s]);
  return C.jsx($s, {
    nodes: o,
    flatNodes: i,
    value: t,
    onChange: (u) => r(u ?? "uncategorized"),
    searchPlaceholder: s("bookmark:savePanel.searchCategory"),
    filterFn: Fs,
    prependOptions: l,
    renderTrigger: () =>
      C.jsxs(Sr, {
        variant: "outline",
        size: "sm",
        className: it("w-[180px] h-9 justify-between", a),
        children: [
          C.jsxs("div", {
            className: "flex items-center gap-2 truncate",
            children: [
              C.jsx(ht, { className: "h-4 w-4 shrink-0" }),
              C.jsx("span", { className: "truncate", children: c }),
            ],
          }),
          C.jsx(Gr, { className: "h-3 w-3 opacity-50 shrink-0" }),
        ],
      }),
    renderNodeIcon: () =>
      C.jsx(ht, { className: "h-4 w-4 text-emerald-500 shrink-0" }),
    popoverWidth: 220,
    popoverAlign: "end",
    maxHeight: 256,
  });
}
function Uh({
  value: e,
  onChange: t,
  placeholder: r = "输入标签后按回车",
  maxTags: n = 10,
  suggestions: a = [],
  className: s,
}) {
  const [o, i] = T.useState(""),
    l = (_) => {
      _.key === "Enter"
        ? (_.preventDefault(), c(o))
        : _.key === "Backspace" && !o && e.length > 0 && u(e.length - 1);
    },
    c = (_) => {
      const h = _.trim();
      h && (e.includes(h) || e.length >= n || (t([...e, h]), i("")));
    },
    u = (_) => {
      const h = [...e];
      (h.splice(_, 1), t(h));
    },
    d = (_) => {
      i(_.target.value);
    },
    g = a.filter(
      (_) =>
        !e.includes(_) &&
        _.toLowerCase().includes(o.toLowerCase()) &&
        o.length > 0,
    );
  return C.jsxs("div", {
    className: it("space-y-2", s),
    children: [
      e.length > 0 &&
        C.jsx("div", {
          className: "flex flex-wrap gap-1",
          children: e.map((_, h) =>
            C.jsxs(
              Al,
              {
                variant: "secondary",
                className:
                  "pl-2 pr-1 py-0.5 flex items-center gap-1 cursor-default bg-linear-to-r from-violet-500/90 to-indigo-500/90 dark:from-violet-600/80 dark:to-indigo-600/80 text-white border-0 shadow-sm",
                children: [
                  C.jsx("span", {
                    className: "text-xs font-medium",
                    children: _,
                  }),
                  C.jsx("button", {
                    type: "button",
                    onClick: () => u(h),
                    className:
                      "hover:bg-white/20 rounded-full p-0.5 transition-colors",
                    "aria-label": `删除标签 ${_}`,
                    children: C.jsx(Sl, { className: "h-3 w-3" }),
                  }),
                ],
              },
              _,
            ),
          ),
        }),
      C.jsxs("div", {
        className: "relative",
        children: [
          C.jsx(Tl, {
            value: o,
            onChange: d,
            onKeyDown: l,
            placeholder: e.length >= n ? `最多 ${n} 个标签` : r,
            disabled: e.length >= n,
            className: "text-sm",
          }),
          g.length > 0 &&
            C.jsx("div", {
              className:
                "absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md max-h-32 overflow-auto",
              children: g
                .slice(0, 5)
                .map((_) =>
                  C.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => c(_),
                      className:
                        "w-full px-3 py-1.5 text-left text-sm hover:bg-accent transition-colors",
                      children: _,
                    },
                    _,
                  ),
                ),
            }),
        ],
      }),
      C.jsxs("p", {
        className: "text-xs text-muted-foreground",
        children: [e.length, "/", n, " 个标签"],
      }),
    ],
  });
}
const ln = "__uncategorized__";
function Fh({
  value: e,
  onChange: t,
  categories: r,
  aiRecommendedCategory: n,
  onApplyAICategory: a,
  placeholder: s,
  className: o,
}) {
  const { t: i } = qn(),
    l = T.useMemo(() => Ds(r), [r]),
    c = T.useMemo(() => Ls(l), [l]);
  T.useMemo(() => (e && c.find((h) => h.id === e)) || null, [e, c]);
  const u = T.useMemo(() => (n ? rc(n, c) : null), [n, c]),
    d = n && !u && !e;
  T.useEffect(() => {
    u && !e && t(u.id);
  }, [u, e, t]);
  const g = (h) => {
      t(h === ln ? null : h);
    },
    _ = e === null ? ln : e;
  return C.jsxs("div", {
    className: it("space-y-2", o),
    children: [
      C.jsx($s, {
        nodes: l,
        flatNodes: c,
        value: _,
        onChange: g,
        searchPlaceholder: i("bookmark:savePanel.searchCategory"),
        emptyText: i("bookmark:savePanel.noCategoryFound"),
        filterFn: Fs,
        prependOptions: [
          {
            id: ln,
            label: i("bookmark:bookmark.uncategorized"),
            icon: C.jsx(ht, {
              className: "h-4 w-4 text-muted-foreground shrink-0",
            }),
          },
        ],
        renderTrigger: ({ selectedNode: h, selectedOption: v, open: p }) =>
          C.jsxs(Sr, {
            variant: "outline",
            role: "combobox",
            className: it(
              "w-full h-10 justify-between font-normal hover:text-card-foreground",
              p && "border-ring ring-ring/50 ring-[3px]",
            ),
            children: [
              h
                ? C.jsxs("div", {
                    className: "flex items-center gap-2 truncate",
                    children: [
                      C.jsx(ht, {
                        className: "h-4 w-4 text-emerald-500 shrink-0",
                      }),
                      C.jsx("span", {
                        className: "truncate",
                        children: h.level > 0 ? h.path : h.name,
                      }),
                    ],
                  })
                : v
                  ? C.jsxs("div", {
                      className: "flex items-center gap-2 truncate",
                      children: [
                        v.icon,
                        C.jsx("span", {
                          className: "truncate",
                          children: v.label,
                        }),
                      ],
                    })
                  : C.jsx("span", {
                      className: "text-muted-foreground",
                      children: s || i("bookmark:savePanel.selectCategory"),
                    }),
              C.jsx(Gr, { className: "h-4 w-4 opacity-50 shrink-0 ml-2" }),
            ],
          }),
        renderNodeIcon: () =>
          C.jsx(ht, { className: "h-4 w-4 text-emerald-500 shrink-0" }),
        popoverWidth: "var(--radix-popover-trigger-width)",
        popoverAlign: "start",
        maxHeight: 240,
      }),
      d &&
        C.jsxs("div", {
          className:
            "flex items-center justify-between py-1.5 px-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800",
          children: [
            C.jsxs("div", {
              className: "flex items-center gap-1.5",
              children: [
                C.jsx(Cl, {
                  className: "h-3 w-3 text-amber-600 dark:text-amber-400",
                }),
                C.jsxs("span", {
                  className: "text-xs text-amber-700 dark:text-amber-300",
                  children: [
                    i("bookmark:savePanel.aiRecommendedCategory"),
                    C.jsx("span", { className: "font-medium", children: n }),
                  ],
                }),
              ],
            }),
            a &&
              C.jsx(Sr, {
                variant: "ghost",
                size: "sm",
                className:
                  "h-6 px-2 text-xs text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50",
                onClick: a,
                children: i("bookmark:savePanel.apply"),
              }),
          ],
        }),
    ],
  });
}
var te;
(function (e) {
  e.assertEqual = (a) => {};
  function t(a) {}
  e.assertIs = t;
  function r(a) {
    throw new Error();
  }
  ((e.assertNever = r),
    (e.arrayToEnum = (a) => {
      const s = {};
      for (const o of a) s[o] = o;
      return s;
    }),
    (e.getValidEnumValues = (a) => {
      const s = e.objectKeys(a).filter((i) => typeof a[a[i]] != "number"),
        o = {};
      for (const i of s) o[i] = a[i];
      return e.objectValues(o);
    }),
    (e.objectValues = (a) =>
      e.objectKeys(a).map(function (s) {
        return a[s];
      })),
    (e.objectKeys =
      typeof Object.keys == "function"
        ? (a) => Object.keys(a)
        : (a) => {
            const s = [];
            for (const o in a)
              Object.prototype.hasOwnProperty.call(a, o) && s.push(o);
            return s;
          }),
    (e.find = (a, s) => {
      for (const o of a) if (s(o)) return o;
    }),
    (e.isInteger =
      typeof Number.isInteger == "function"
        ? (a) => Number.isInteger(a)
        : (a) =>
            typeof a == "number" && Number.isFinite(a) && Math.floor(a) === a));
  function n(a, s = " | ") {
    return a.map((o) => (typeof o == "string" ? `'${o}'` : o)).join(s);
  }
  ((e.joinValues = n),
    (e.jsonStringifyReplacer = (a, s) =>
      typeof s == "bigint" ? s.toString() : s));
})(te || (te = {}));
var ka;
(function (e) {
  e.mergeShapes = (t, r) => ({ ...t, ...r });
})(ka || (ka = {}));
const U = te.arrayToEnum([
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
  st = (e) => {
    switch (typeof e) {
      case "undefined":
        return U.undefined;
      case "string":
        return U.string;
      case "number":
        return Number.isNaN(e) ? U.nan : U.number;
      case "boolean":
        return U.boolean;
      case "function":
        return U.function;
      case "bigint":
        return U.bigint;
      case "symbol":
        return U.symbol;
      case "object":
        return Array.isArray(e)
          ? U.array
          : e === null
            ? U.null
            : e.then &&
                typeof e.then == "function" &&
                e.catch &&
                typeof e.catch == "function"
              ? U.promise
              : typeof Map < "u" && e instanceof Map
                ? U.map
                : typeof Set < "u" && e instanceof Set
                  ? U.set
                  : typeof Date < "u" && e instanceof Date
                    ? U.date
                    : U.object;
      default:
        return U.unknown;
    }
  },
  E = te.arrayToEnum([
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
class rt extends Error {
  get errors() {
    return this.issues;
  }
  constructor(t) {
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
      (this.issues = t));
  }
  format(t) {
    const r =
        t ||
        function (s) {
          return s.message;
        },
      n = { _errors: [] },
      a = (s) => {
        for (const o of s.issues)
          if (o.code === "invalid_union") o.unionErrors.map(a);
          else if (o.code === "invalid_return_type") a(o.returnTypeError);
          else if (o.code === "invalid_arguments") a(o.argumentsError);
          else if (o.path.length === 0) n._errors.push(r(o));
          else {
            let i = n,
              l = 0;
            for (; l < o.path.length; ) {
              const c = o.path[l];
              (l === o.path.length - 1
                ? ((i[c] = i[c] || { _errors: [] }), i[c]._errors.push(r(o)))
                : (i[c] = i[c] || { _errors: [] }),
                (i = i[c]),
                l++);
            }
          }
      };
    return (a(this), n);
  }
  static assert(t) {
    if (!(t instanceof rt)) throw new Error(`Not a ZodError: ${t}`);
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, te.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(t = (r) => r.message) {
    const r = {},
      n = [];
    for (const a of this.issues)
      if (a.path.length > 0) {
        const s = a.path[0];
        ((r[s] = r[s] || []), r[s].push(t(a)));
      } else n.push(t(a));
    return { formErrors: n, fieldErrors: r };
  }
  get formErrors() {
    return this.flatten();
  }
}
rt.create = (e) => new rt(e);
const xn = (e, t) => {
  let r;
  switch (e.code) {
    case E.invalid_type:
      e.received === U.undefined
        ? (r = "Required")
        : (r = `Expected ${e.expected}, received ${e.received}`);
      break;
    case E.invalid_literal:
      r = `Invalid literal value, expected ${JSON.stringify(e.expected, te.jsonStringifyReplacer)}`;
      break;
    case E.unrecognized_keys:
      r = `Unrecognized key(s) in object: ${te.joinValues(e.keys, ", ")}`;
      break;
    case E.invalid_union:
      r = "Invalid input";
      break;
    case E.invalid_union_discriminator:
      r = `Invalid discriminator value. Expected ${te.joinValues(e.options)}`;
      break;
    case E.invalid_enum_value:
      r = `Invalid enum value. Expected ${te.joinValues(e.options)}, received '${e.received}'`;
      break;
    case E.invalid_arguments:
      r = "Invalid function arguments";
      break;
    case E.invalid_return_type:
      r = "Invalid function return type";
      break;
    case E.invalid_date:
      r = "Invalid date";
      break;
    case E.invalid_string:
      typeof e.validation == "object"
        ? "includes" in e.validation
          ? ((r = `Invalid input: must include "${e.validation.includes}"`),
            typeof e.validation.position == "number" &&
              (r = `${r} at one or more positions greater than or equal to ${e.validation.position}`))
          : "startsWith" in e.validation
            ? (r = `Invalid input: must start with "${e.validation.startsWith}"`)
            : "endsWith" in e.validation
              ? (r = `Invalid input: must end with "${e.validation.endsWith}"`)
              : te.assertNever(e.validation)
        : e.validation !== "regex"
          ? (r = `Invalid ${e.validation}`)
          : (r = "Invalid");
      break;
    case E.too_small:
      e.type === "array"
        ? (r = `Array must contain ${e.exact ? "exactly" : e.inclusive ? "at least" : "more than"} ${e.minimum} element(s)`)
        : e.type === "string"
          ? (r = `String must contain ${e.exact ? "exactly" : e.inclusive ? "at least" : "over"} ${e.minimum} character(s)`)
          : e.type === "number"
            ? (r = `Number must be ${e.exact ? "exactly equal to " : e.inclusive ? "greater than or equal to " : "greater than "}${e.minimum}`)
            : e.type === "bigint"
              ? (r = `Number must be ${e.exact ? "exactly equal to " : e.inclusive ? "greater than or equal to " : "greater than "}${e.minimum}`)
              : e.type === "date"
                ? (r = `Date must be ${e.exact ? "exactly equal to " : e.inclusive ? "greater than or equal to " : "greater than "}${new Date(Number(e.minimum))}`)
                : (r = "Invalid input");
      break;
    case E.too_big:
      e.type === "array"
        ? (r = `Array must contain ${e.exact ? "exactly" : e.inclusive ? "at most" : "less than"} ${e.maximum} element(s)`)
        : e.type === "string"
          ? (r = `String must contain ${e.exact ? "exactly" : e.inclusive ? "at most" : "under"} ${e.maximum} character(s)`)
          : e.type === "number"
            ? (r = `Number must be ${e.exact ? "exactly" : e.inclusive ? "less than or equal to" : "less than"} ${e.maximum}`)
            : e.type === "bigint"
              ? (r = `BigInt must be ${e.exact ? "exactly" : e.inclusive ? "less than or equal to" : "less than"} ${e.maximum}`)
              : e.type === "date"
                ? (r = `Date must be ${e.exact ? "exactly" : e.inclusive ? "smaller than or equal to" : "smaller than"} ${new Date(Number(e.maximum))}`)
                : (r = "Invalid input");
      break;
    case E.custom:
      r = "Invalid input";
      break;
    case E.invalid_intersection_types:
      r = "Intersection results could not be merged";
      break;
    case E.not_multiple_of:
      r = `Number must be a multiple of ${e.multipleOf}`;
      break;
    case E.not_finite:
      r = "Number must be finite";
      break;
    default:
      ((r = t.defaultError), te.assertNever(e));
  }
  return { message: r };
};
let nc = xn;
function ac() {
  return nc;
}
const sc = (e) => {
  const { data: t, path: r, errorMaps: n, issueData: a } = e,
    s = [...r, ...(a.path || [])],
    o = { ...a, path: s };
  if (a.message !== void 0) return { ...a, path: s, message: a.message };
  let i = "";
  const l = n
    .filter((c) => !!c)
    .slice()
    .reverse();
  for (const c of l) i = c(o, { data: t, defaultError: i }).message;
  return { ...a, path: s, message: i };
};
function M(e, t) {
  const r = ac(),
    n = sc({
      issueData: t,
      data: e.data,
      path: e.path,
      errorMaps: [
        e.common.contextualErrorMap,
        e.schemaErrorMap,
        r,
        r === xn ? void 0 : xn,
      ].filter((a) => !!a),
    });
  e.common.issues.push(n);
}
class ve {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    this.value === "valid" && (this.value = "dirty");
  }
  abort() {
    this.value !== "aborted" && (this.value = "aborted");
  }
  static mergeArray(t, r) {
    const n = [];
    for (const a of r) {
      if (a.status === "aborted") return W;
      (a.status === "dirty" && t.dirty(), n.push(a.value));
    }
    return { status: t.value, value: n };
  }
  static async mergeObjectAsync(t, r) {
    const n = [];
    for (const a of r) {
      const s = await a.key,
        o = await a.value;
      n.push({ key: s, value: o });
    }
    return ve.mergeObjectSync(t, n);
  }
  static mergeObjectSync(t, r) {
    const n = {};
    for (const a of r) {
      const { key: s, value: o } = a;
      if (s.status === "aborted" || o.status === "aborted") return W;
      (s.status === "dirty" && t.dirty(),
        o.status === "dirty" && t.dirty(),
        s.value !== "__proto__" &&
          (typeof o.value < "u" || a.alwaysSet) &&
          (n[s.value] = o.value));
    }
    return { status: t.value, value: n };
  }
}
const W = Object.freeze({ status: "aborted" }),
  Vt = (e) => ({ status: "dirty", value: e }),
  Ne = (e) => ({ status: "valid", value: e }),
  Aa = (e) => e.status === "aborted",
  Sa = (e) => e.status === "dirty",
  Dt = (e) => e.status === "valid",
  Tr = (e) => typeof Promise < "u" && e instanceof Promise;
var B;
(function (e) {
  ((e.errToObj = (t) => (typeof t == "string" ? { message: t } : t || {})),
    (e.toString = (t) =>
      typeof t == "string" ? t : t == null ? void 0 : t.message));
})(B || (B = {}));
class He {
  constructor(t, r, n, a) {
    ((this._cachedPath = []),
      (this.parent = t),
      (this.data = r),
      (this._path = n),
      (this._key = a));
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
const Ta = (e, t) => {
  if (Dt(t)) return { success: !0, data: t.value };
  if (!e.common.issues.length)
    throw new Error("Validation failed but no issues detected.");
  return {
    success: !1,
    get error() {
      if (this._error) return this._error;
      const r = new rt(e.common.issues);
      return ((this._error = r), this._error);
    },
  };
};
function X(e) {
  if (!e) return {};
  const {
    errorMap: t,
    invalid_type_error: r,
    required_error: n,
    description: a,
  } = e;
  if (t && (r || n))
    throw new Error(
      `Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`,
    );
  return t
    ? { errorMap: t, description: a }
    : {
        errorMap: (o, i) => {
          const { message: l } = e;
          return o.code === "invalid_enum_value"
            ? { message: l ?? i.defaultError }
            : typeof i.data > "u"
              ? { message: l ?? n ?? i.defaultError }
              : o.code !== "invalid_type"
                ? { message: i.defaultError }
                : { message: l ?? r ?? i.defaultError };
        },
        description: a,
      };
}
class ee {
  get description() {
    return this._def.description;
  }
  _getType(t) {
    return st(t.data);
  }
  _getOrReturnCtx(t, r) {
    return (
      r || {
        common: t.parent.common,
        data: t.data,
        parsedType: st(t.data),
        schemaErrorMap: this._def.errorMap,
        path: t.path,
        parent: t.parent,
      }
    );
  }
  _processInputParams(t) {
    return {
      status: new ve(),
      ctx: {
        common: t.parent.common,
        data: t.data,
        parsedType: st(t.data),
        schemaErrorMap: this._def.errorMap,
        path: t.path,
        parent: t.parent,
      },
    };
  }
  _parseSync(t) {
    const r = this._parse(t);
    if (Tr(r)) throw new Error("Synchronous parse encountered promise.");
    return r;
  }
  _parseAsync(t) {
    const r = this._parse(t);
    return Promise.resolve(r);
  }
  parse(t, r) {
    const n = this.safeParse(t, r);
    if (n.success) return n.data;
    throw n.error;
  }
  safeParse(t, r) {
    const n = {
        common: {
          issues: [],
          async: (r == null ? void 0 : r.async) ?? !1,
          contextualErrorMap: r == null ? void 0 : r.errorMap,
        },
        path: (r == null ? void 0 : r.path) || [],
        schemaErrorMap: this._def.errorMap,
        parent: null,
        data: t,
        parsedType: st(t),
      },
      a = this._parseSync({ data: t, path: n.path, parent: n });
    return Ta(n, a);
  }
  "~validate"(t) {
    var n, a;
    const r = {
      common: { issues: [], async: !!this["~standard"].async },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: t,
      parsedType: st(t),
    };
    if (!this["~standard"].async)
      try {
        const s = this._parseSync({ data: t, path: [], parent: r });
        return Dt(s) ? { value: s.value } : { issues: r.common.issues };
      } catch (s) {
        ((a =
          (n = s == null ? void 0 : s.message) == null
            ? void 0
            : n.toLowerCase()) != null &&
          a.includes("encountered") &&
          (this["~standard"].async = !0),
          (r.common = { issues: [], async: !0 }));
      }
    return this._parseAsync({ data: t, path: [], parent: r }).then((s) =>
      Dt(s) ? { value: s.value } : { issues: r.common.issues },
    );
  }
  async parseAsync(t, r) {
    const n = await this.safeParseAsync(t, r);
    if (n.success) return n.data;
    throw n.error;
  }
  async safeParseAsync(t, r) {
    const n = {
        common: {
          issues: [],
          contextualErrorMap: r == null ? void 0 : r.errorMap,
          async: !0,
        },
        path: (r == null ? void 0 : r.path) || [],
        schemaErrorMap: this._def.errorMap,
        parent: null,
        data: t,
        parsedType: st(t),
      },
      a = this._parse({ data: t, path: n.path, parent: n }),
      s = await (Tr(a) ? a : Promise.resolve(a));
    return Ta(n, s);
  }
  refine(t, r) {
    const n = (a) =>
      typeof r == "string" || typeof r > "u"
        ? { message: r }
        : typeof r == "function"
          ? r(a)
          : r;
    return this._refinement((a, s) => {
      const o = t(a),
        i = () => s.addIssue({ code: E.custom, ...n(a) });
      return typeof Promise < "u" && o instanceof Promise
        ? o.then((l) => (l ? !0 : (i(), !1)))
        : o
          ? !0
          : (i(), !1);
    });
  }
  refinement(t, r) {
    return this._refinement((n, a) =>
      t(n) ? !0 : (a.addIssue(typeof r == "function" ? r(n, a) : r), !1),
    );
  }
  _refinement(t) {
    return new kt({
      schema: this,
      typeName: P.ZodEffects,
      effect: { type: "refinement", refinement: t },
    });
  }
  superRefine(t) {
    return this._refinement(t);
  }
  constructor(t) {
    ((this.spa = this.safeParseAsync),
      (this._def = t),
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
    return tt.create(this, this._def);
  }
  nullable() {
    return At.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return Je.create(this);
  }
  promise() {
    return jr.create(this, this._def);
  }
  or(t) {
    return Er.create([this, t], this._def);
  }
  and(t) {
    return Rr.create(this, t, this._def);
  }
  transform(t) {
    return new kt({
      ...X(this._def),
      schema: this,
      typeName: P.ZodEffects,
      effect: { type: "transform", transform: t },
    });
  }
  default(t) {
    const r = typeof t == "function" ? t : () => t;
    return new Mr({
      ...X(this._def),
      innerType: this,
      defaultValue: r,
      typeName: P.ZodDefault,
    });
  }
  brand() {
    return new Zs({ typeName: P.ZodBranded, type: this, ...X(this._def) });
  }
  catch(t) {
    const r = typeof t == "function" ? t : () => t;
    return new $r({
      ...X(this._def),
      innerType: this,
      catchValue: r,
      typeName: P.ZodCatch,
    });
  }
  describe(t) {
    const r = this.constructor;
    return new r({ ...this._def, description: t });
  }
  pipe(t) {
    return Zn.create(this, t);
  }
  readonly() {
    return Dr.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
}
const oc = /^c[^\s-]{8,}$/i,
  ic = /^[0-9a-z]+$/,
  lc = /^[0-9A-HJKMNP-TV-Z]{26}$/i,
  cc =
    /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i,
  uc = /^[a-z0-9_-]{21}$/i,
  dc = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/,
  pc =
    /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/,
  mc =
    /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i,
  gc = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
let cn;
const fc =
    /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,
  hc =
    /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/,
  yc =
    /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/,
  vc =
    /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,
  _c = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/,
  bc = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/,
  qs =
    "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))",
  wc = new RegExp(`^${qs}$`);
function Bs(e) {
  let t = "[0-5]\\d";
  e.precision
    ? (t = `${t}\\.\\d{${e.precision}}`)
    : e.precision == null && (t = `${t}(\\.\\d+)?`);
  const r = e.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${t})${r}`;
}
function xc(e) {
  return new RegExp(`^${Bs(e)}$`);
}
function kc(e) {
  let t = `${qs}T${Bs(e)}`;
  const r = [];
  return (
    r.push(e.local ? "Z?" : "Z"),
    e.offset && r.push("([+-]\\d{2}:?\\d{2})"),
    (t = `${t}(${r.join("|")})`),
    new RegExp(`^${t}$`)
  );
}
function Ac(e, t) {
  return !!(
    ((t === "v4" || !t) && fc.test(e)) ||
    ((t === "v6" || !t) && yc.test(e))
  );
}
function Sc(e, t) {
  if (!dc.test(e)) return !1;
  try {
    const [r] = e.split(".");
    if (!r) return !1;
    const n = r
        .replace(/-/g, "+")
        .replace(/_/g, "/")
        .padEnd(r.length + ((4 - (r.length % 4)) % 4), "="),
      a = JSON.parse(atob(n));
    return !(
      typeof a != "object" ||
      a === null ||
      ("typ" in a && (a == null ? void 0 : a.typ) !== "JWT") ||
      !a.alg ||
      (t && a.alg !== t)
    );
  } catch {
    return !1;
  }
}
function Tc(e, t) {
  return !!(
    ((t === "v4" || !t) && hc.test(e)) ||
    ((t === "v6" || !t) && vc.test(e))
  );
}
class et extends ee {
  _parse(t) {
    if (
      (this._def.coerce && (t.data = String(t.data)),
      this._getType(t) !== U.string)
    ) {
      const s = this._getOrReturnCtx(t);
      return (
        M(s, {
          code: E.invalid_type,
          expected: U.string,
          received: s.parsedType,
        }),
        W
      );
    }
    const n = new ve();
    let a;
    for (const s of this._def.checks)
      if (s.kind === "min")
        t.data.length < s.value &&
          ((a = this._getOrReturnCtx(t, a)),
          M(a, {
            code: E.too_small,
            minimum: s.value,
            type: "string",
            inclusive: !0,
            exact: !1,
            message: s.message,
          }),
          n.dirty());
      else if (s.kind === "max")
        t.data.length > s.value &&
          ((a = this._getOrReturnCtx(t, a)),
          M(a, {
            code: E.too_big,
            maximum: s.value,
            type: "string",
            inclusive: !0,
            exact: !1,
            message: s.message,
          }),
          n.dirty());
      else if (s.kind === "length") {
        const o = t.data.length > s.value,
          i = t.data.length < s.value;
        (o || i) &&
          ((a = this._getOrReturnCtx(t, a)),
          o
            ? M(a, {
                code: E.too_big,
                maximum: s.value,
                type: "string",
                inclusive: !0,
                exact: !0,
                message: s.message,
              })
            : i &&
              M(a, {
                code: E.too_small,
                minimum: s.value,
                type: "string",
                inclusive: !0,
                exact: !0,
                message: s.message,
              }),
          n.dirty());
      } else if (s.kind === "email")
        mc.test(t.data) ||
          ((a = this._getOrReturnCtx(t, a)),
          M(a, {
            validation: "email",
            code: E.invalid_string,
            message: s.message,
          }),
          n.dirty());
      else if (s.kind === "emoji")
        (cn || (cn = new RegExp(gc, "u")),
          cn.test(t.data) ||
            ((a = this._getOrReturnCtx(t, a)),
            M(a, {
              validation: "emoji",
              code: E.invalid_string,
              message: s.message,
            }),
            n.dirty()));
      else if (s.kind === "uuid")
        cc.test(t.data) ||
          ((a = this._getOrReturnCtx(t, a)),
          M(a, {
            validation: "uuid",
            code: E.invalid_string,
            message: s.message,
          }),
          n.dirty());
      else if (s.kind === "nanoid")
        uc.test(t.data) ||
          ((a = this._getOrReturnCtx(t, a)),
          M(a, {
            validation: "nanoid",
            code: E.invalid_string,
            message: s.message,
          }),
          n.dirty());
      else if (s.kind === "cuid")
        oc.test(t.data) ||
          ((a = this._getOrReturnCtx(t, a)),
          M(a, {
            validation: "cuid",
            code: E.invalid_string,
            message: s.message,
          }),
          n.dirty());
      else if (s.kind === "cuid2")
        ic.test(t.data) ||
          ((a = this._getOrReturnCtx(t, a)),
          M(a, {
            validation: "cuid2",
            code: E.invalid_string,
            message: s.message,
          }),
          n.dirty());
      else if (s.kind === "ulid")
        lc.test(t.data) ||
          ((a = this._getOrReturnCtx(t, a)),
          M(a, {
            validation: "ulid",
            code: E.invalid_string,
            message: s.message,
          }),
          n.dirty());
      else if (s.kind === "url")
        try {
          new URL(t.data);
        } catch {
          ((a = this._getOrReturnCtx(t, a)),
            M(a, {
              validation: "url",
              code: E.invalid_string,
              message: s.message,
            }),
            n.dirty());
        }
      else
        s.kind === "regex"
          ? ((s.regex.lastIndex = 0),
            s.regex.test(t.data) ||
              ((a = this._getOrReturnCtx(t, a)),
              M(a, {
                validation: "regex",
                code: E.invalid_string,
                message: s.message,
              }),
              n.dirty()))
          : s.kind === "trim"
            ? (t.data = t.data.trim())
            : s.kind === "includes"
              ? t.data.includes(s.value, s.position) ||
                ((a = this._getOrReturnCtx(t, a)),
                M(a, {
                  code: E.invalid_string,
                  validation: { includes: s.value, position: s.position },
                  message: s.message,
                }),
                n.dirty())
              : s.kind === "toLowerCase"
                ? (t.data = t.data.toLowerCase())
                : s.kind === "toUpperCase"
                  ? (t.data = t.data.toUpperCase())
                  : s.kind === "startsWith"
                    ? t.data.startsWith(s.value) ||
                      ((a = this._getOrReturnCtx(t, a)),
                      M(a, {
                        code: E.invalid_string,
                        validation: { startsWith: s.value },
                        message: s.message,
                      }),
                      n.dirty())
                    : s.kind === "endsWith"
                      ? t.data.endsWith(s.value) ||
                        ((a = this._getOrReturnCtx(t, a)),
                        M(a, {
                          code: E.invalid_string,
                          validation: { endsWith: s.value },
                          message: s.message,
                        }),
                        n.dirty())
                      : s.kind === "datetime"
                        ? kc(s).test(t.data) ||
                          ((a = this._getOrReturnCtx(t, a)),
                          M(a, {
                            code: E.invalid_string,
                            validation: "datetime",
                            message: s.message,
                          }),
                          n.dirty())
                        : s.kind === "date"
                          ? wc.test(t.data) ||
                            ((a = this._getOrReturnCtx(t, a)),
                            M(a, {
                              code: E.invalid_string,
                              validation: "date",
                              message: s.message,
                            }),
                            n.dirty())
                          : s.kind === "time"
                            ? xc(s).test(t.data) ||
                              ((a = this._getOrReturnCtx(t, a)),
                              M(a, {
                                code: E.invalid_string,
                                validation: "time",
                                message: s.message,
                              }),
                              n.dirty())
                            : s.kind === "duration"
                              ? pc.test(t.data) ||
                                ((a = this._getOrReturnCtx(t, a)),
                                M(a, {
                                  validation: "duration",
                                  code: E.invalid_string,
                                  message: s.message,
                                }),
                                n.dirty())
                              : s.kind === "ip"
                                ? Ac(t.data, s.version) ||
                                  ((a = this._getOrReturnCtx(t, a)),
                                  M(a, {
                                    validation: "ip",
                                    code: E.invalid_string,
                                    message: s.message,
                                  }),
                                  n.dirty())
                                : s.kind === "jwt"
                                  ? Sc(t.data, s.alg) ||
                                    ((a = this._getOrReturnCtx(t, a)),
                                    M(a, {
                                      validation: "jwt",
                                      code: E.invalid_string,
                                      message: s.message,
                                    }),
                                    n.dirty())
                                  : s.kind === "cidr"
                                    ? Tc(t.data, s.version) ||
                                      ((a = this._getOrReturnCtx(t, a)),
                                      M(a, {
                                        validation: "cidr",
                                        code: E.invalid_string,
                                        message: s.message,
                                      }),
                                      n.dirty())
                                    : s.kind === "base64"
                                      ? _c.test(t.data) ||
                                        ((a = this._getOrReturnCtx(t, a)),
                                        M(a, {
                                          validation: "base64",
                                          code: E.invalid_string,
                                          message: s.message,
                                        }),
                                        n.dirty())
                                      : s.kind === "base64url"
                                        ? bc.test(t.data) ||
                                          ((a = this._getOrReturnCtx(t, a)),
                                          M(a, {
                                            validation: "base64url",
                                            code: E.invalid_string,
                                            message: s.message,
                                          }),
                                          n.dirty())
                                        : te.assertNever(s);
    return { status: n.value, value: t.data };
  }
  _regex(t, r, n) {
    return this.refinement((a) => t.test(a), {
      validation: r,
      code: E.invalid_string,
      ...B.errToObj(n),
    });
  }
  _addCheck(t) {
    return new et({ ...this._def, checks: [...this._def.checks, t] });
  }
  email(t) {
    return this._addCheck({ kind: "email", ...B.errToObj(t) });
  }
  url(t) {
    return this._addCheck({ kind: "url", ...B.errToObj(t) });
  }
  emoji(t) {
    return this._addCheck({ kind: "emoji", ...B.errToObj(t) });
  }
  uuid(t) {
    return this._addCheck({ kind: "uuid", ...B.errToObj(t) });
  }
  nanoid(t) {
    return this._addCheck({ kind: "nanoid", ...B.errToObj(t) });
  }
  cuid(t) {
    return this._addCheck({ kind: "cuid", ...B.errToObj(t) });
  }
  cuid2(t) {
    return this._addCheck({ kind: "cuid2", ...B.errToObj(t) });
  }
  ulid(t) {
    return this._addCheck({ kind: "ulid", ...B.errToObj(t) });
  }
  base64(t) {
    return this._addCheck({ kind: "base64", ...B.errToObj(t) });
  }
  base64url(t) {
    return this._addCheck({ kind: "base64url", ...B.errToObj(t) });
  }
  jwt(t) {
    return this._addCheck({ kind: "jwt", ...B.errToObj(t) });
  }
  ip(t) {
    return this._addCheck({ kind: "ip", ...B.errToObj(t) });
  }
  cidr(t) {
    return this._addCheck({ kind: "cidr", ...B.errToObj(t) });
  }
  datetime(t) {
    return typeof t == "string"
      ? this._addCheck({
          kind: "datetime",
          precision: null,
          offset: !1,
          local: !1,
          message: t,
        })
      : this._addCheck({
          kind: "datetime",
          precision:
            typeof (t == null ? void 0 : t.precision) > "u"
              ? null
              : t == null
                ? void 0
                : t.precision,
          offset: (t == null ? void 0 : t.offset) ?? !1,
          local: (t == null ? void 0 : t.local) ?? !1,
          ...B.errToObj(t == null ? void 0 : t.message),
        });
  }
  date(t) {
    return this._addCheck({ kind: "date", message: t });
  }
  time(t) {
    return typeof t == "string"
      ? this._addCheck({ kind: "time", precision: null, message: t })
      : this._addCheck({
          kind: "time",
          precision:
            typeof (t == null ? void 0 : t.precision) > "u"
              ? null
              : t == null
                ? void 0
                : t.precision,
          ...B.errToObj(t == null ? void 0 : t.message),
        });
  }
  duration(t) {
    return this._addCheck({ kind: "duration", ...B.errToObj(t) });
  }
  regex(t, r) {
    return this._addCheck({ kind: "regex", regex: t, ...B.errToObj(r) });
  }
  includes(t, r) {
    return this._addCheck({
      kind: "includes",
      value: t,
      position: r == null ? void 0 : r.position,
      ...B.errToObj(r == null ? void 0 : r.message),
    });
  }
  startsWith(t, r) {
    return this._addCheck({ kind: "startsWith", value: t, ...B.errToObj(r) });
  }
  endsWith(t, r) {
    return this._addCheck({ kind: "endsWith", value: t, ...B.errToObj(r) });
  }
  min(t, r) {
    return this._addCheck({ kind: "min", value: t, ...B.errToObj(r) });
  }
  max(t, r) {
    return this._addCheck({ kind: "max", value: t, ...B.errToObj(r) });
  }
  length(t, r) {
    return this._addCheck({ kind: "length", value: t, ...B.errToObj(r) });
  }
  nonempty(t) {
    return this.min(1, B.errToObj(t));
  }
  trim() {
    return new et({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }],
    });
  }
  toLowerCase() {
    return new et({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }],
    });
  }
  toUpperCase() {
    return new et({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }],
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((t) => t.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((t) => t.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((t) => t.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((t) => t.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((t) => t.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((t) => t.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((t) => t.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((t) => t.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((t) => t.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((t) => t.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((t) => t.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((t) => t.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((t) => t.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((t) => t.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((t) => t.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((t) => t.kind === "base64url");
  }
  get minLength() {
    let t = null;
    for (const r of this._def.checks)
      r.kind === "min" && (t === null || r.value > t) && (t = r.value);
    return t;
  }
  get maxLength() {
    let t = null;
    for (const r of this._def.checks)
      r.kind === "max" && (t === null || r.value < t) && (t = r.value);
    return t;
  }
}
et.create = (e) =>
  new et({
    checks: [],
    typeName: P.ZodString,
    coerce: (e == null ? void 0 : e.coerce) ?? !1,
    ...X(e),
  });
function Cc(e, t) {
  const r = (e.toString().split(".")[1] || "").length,
    n = (t.toString().split(".")[1] || "").length,
    a = r > n ? r : n,
    s = Number.parseInt(e.toFixed(a).replace(".", "")),
    o = Number.parseInt(t.toFixed(a).replace(".", ""));
  return (s % o) / 10 ** a;
}
class Lt extends ee {
  constructor() {
    (super(...arguments),
      (this.min = this.gte),
      (this.max = this.lte),
      (this.step = this.multipleOf));
  }
  _parse(t) {
    if (
      (this._def.coerce && (t.data = Number(t.data)),
      this._getType(t) !== U.number)
    ) {
      const s = this._getOrReturnCtx(t);
      return (
        M(s, {
          code: E.invalid_type,
          expected: U.number,
          received: s.parsedType,
        }),
        W
      );
    }
    let n;
    const a = new ve();
    for (const s of this._def.checks)
      s.kind === "int"
        ? te.isInteger(t.data) ||
          ((n = this._getOrReturnCtx(t, n)),
          M(n, {
            code: E.invalid_type,
            expected: "integer",
            received: "float",
            message: s.message,
          }),
          a.dirty())
        : s.kind === "min"
          ? (s.inclusive ? t.data < s.value : t.data <= s.value) &&
            ((n = this._getOrReturnCtx(t, n)),
            M(n, {
              code: E.too_small,
              minimum: s.value,
              type: "number",
              inclusive: s.inclusive,
              exact: !1,
              message: s.message,
            }),
            a.dirty())
          : s.kind === "max"
            ? (s.inclusive ? t.data > s.value : t.data >= s.value) &&
              ((n = this._getOrReturnCtx(t, n)),
              M(n, {
                code: E.too_big,
                maximum: s.value,
                type: "number",
                inclusive: s.inclusive,
                exact: !1,
                message: s.message,
              }),
              a.dirty())
            : s.kind === "multipleOf"
              ? Cc(t.data, s.value) !== 0 &&
                ((n = this._getOrReturnCtx(t, n)),
                M(n, {
                  code: E.not_multiple_of,
                  multipleOf: s.value,
                  message: s.message,
                }),
                a.dirty())
              : s.kind === "finite"
                ? Number.isFinite(t.data) ||
                  ((n = this._getOrReturnCtx(t, n)),
                  M(n, { code: E.not_finite, message: s.message }),
                  a.dirty())
                : te.assertNever(s);
    return { status: a.value, value: t.data };
  }
  gte(t, r) {
    return this.setLimit("min", t, !0, B.toString(r));
  }
  gt(t, r) {
    return this.setLimit("min", t, !1, B.toString(r));
  }
  lte(t, r) {
    return this.setLimit("max", t, !0, B.toString(r));
  }
  lt(t, r) {
    return this.setLimit("max", t, !1, B.toString(r));
  }
  setLimit(t, r, n, a) {
    return new Lt({
      ...this._def,
      checks: [
        ...this._def.checks,
        { kind: t, value: r, inclusive: n, message: B.toString(a) },
      ],
    });
  }
  _addCheck(t) {
    return new Lt({ ...this._def, checks: [...this._def.checks, t] });
  }
  int(t) {
    return this._addCheck({ kind: "int", message: B.toString(t) });
  }
  positive(t) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: !1,
      message: B.toString(t),
    });
  }
  negative(t) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: !1,
      message: B.toString(t),
    });
  }
  nonpositive(t) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: !0,
      message: B.toString(t),
    });
  }
  nonnegative(t) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: !0,
      message: B.toString(t),
    });
  }
  multipleOf(t, r) {
    return this._addCheck({
      kind: "multipleOf",
      value: t,
      message: B.toString(r),
    });
  }
  finite(t) {
    return this._addCheck({ kind: "finite", message: B.toString(t) });
  }
  safe(t) {
    return this._addCheck({
      kind: "min",
      inclusive: !0,
      value: Number.MIN_SAFE_INTEGER,
      message: B.toString(t),
    })._addCheck({
      kind: "max",
      inclusive: !0,
      value: Number.MAX_SAFE_INTEGER,
      message: B.toString(t),
    });
  }
  get minValue() {
    let t = null;
    for (const r of this._def.checks)
      r.kind === "min" && (t === null || r.value > t) && (t = r.value);
    return t;
  }
  get maxValue() {
    let t = null;
    for (const r of this._def.checks)
      r.kind === "max" && (t === null || r.value < t) && (t = r.value);
    return t;
  }
  get isInt() {
    return !!this._def.checks.find(
      (t) =>
        t.kind === "int" || (t.kind === "multipleOf" && te.isInteger(t.value)),
    );
  }
  get isFinite() {
    let t = null,
      r = null;
    for (const n of this._def.checks) {
      if (n.kind === "finite" || n.kind === "int" || n.kind === "multipleOf")
        return !0;
      n.kind === "min"
        ? (r === null || n.value > r) && (r = n.value)
        : n.kind === "max" && (t === null || n.value < t) && (t = n.value);
    }
    return Number.isFinite(r) && Number.isFinite(t);
  }
}
Lt.create = (e) =>
  new Lt({
    checks: [],
    typeName: P.ZodNumber,
    coerce: (e == null ? void 0 : e.coerce) || !1,
    ...X(e),
  });
class Kt extends ee {
  constructor() {
    (super(...arguments), (this.min = this.gte), (this.max = this.lte));
  }
  _parse(t) {
    if (this._def.coerce)
      try {
        t.data = BigInt(t.data);
      } catch {
        return this._getInvalidInput(t);
      }
    if (this._getType(t) !== U.bigint) return this._getInvalidInput(t);
    let n;
    const a = new ve();
    for (const s of this._def.checks)
      s.kind === "min"
        ? (s.inclusive ? t.data < s.value : t.data <= s.value) &&
          ((n = this._getOrReturnCtx(t, n)),
          M(n, {
            code: E.too_small,
            type: "bigint",
            minimum: s.value,
            inclusive: s.inclusive,
            message: s.message,
          }),
          a.dirty())
        : s.kind === "max"
          ? (s.inclusive ? t.data > s.value : t.data >= s.value) &&
            ((n = this._getOrReturnCtx(t, n)),
            M(n, {
              code: E.too_big,
              type: "bigint",
              maximum: s.value,
              inclusive: s.inclusive,
              message: s.message,
            }),
            a.dirty())
          : s.kind === "multipleOf"
            ? t.data % s.value !== BigInt(0) &&
              ((n = this._getOrReturnCtx(t, n)),
              M(n, {
                code: E.not_multiple_of,
                multipleOf: s.value,
                message: s.message,
              }),
              a.dirty())
            : te.assertNever(s);
    return { status: a.value, value: t.data };
  }
  _getInvalidInput(t) {
    const r = this._getOrReturnCtx(t);
    return (
      M(r, {
        code: E.invalid_type,
        expected: U.bigint,
        received: r.parsedType,
      }),
      W
    );
  }
  gte(t, r) {
    return this.setLimit("min", t, !0, B.toString(r));
  }
  gt(t, r) {
    return this.setLimit("min", t, !1, B.toString(r));
  }
  lte(t, r) {
    return this.setLimit("max", t, !0, B.toString(r));
  }
  lt(t, r) {
    return this.setLimit("max", t, !1, B.toString(r));
  }
  setLimit(t, r, n, a) {
    return new Kt({
      ...this._def,
      checks: [
        ...this._def.checks,
        { kind: t, value: r, inclusive: n, message: B.toString(a) },
      ],
    });
  }
  _addCheck(t) {
    return new Kt({ ...this._def, checks: [...this._def.checks, t] });
  }
  positive(t) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: !1,
      message: B.toString(t),
    });
  }
  negative(t) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: !1,
      message: B.toString(t),
    });
  }
  nonpositive(t) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: !0,
      message: B.toString(t),
    });
  }
  nonnegative(t) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: !0,
      message: B.toString(t),
    });
  }
  multipleOf(t, r) {
    return this._addCheck({
      kind: "multipleOf",
      value: t,
      message: B.toString(r),
    });
  }
  get minValue() {
    let t = null;
    for (const r of this._def.checks)
      r.kind === "min" && (t === null || r.value > t) && (t = r.value);
    return t;
  }
  get maxValue() {
    let t = null;
    for (const r of this._def.checks)
      r.kind === "max" && (t === null || r.value < t) && (t = r.value);
    return t;
  }
}
Kt.create = (e) =>
  new Kt({
    checks: [],
    typeName: P.ZodBigInt,
    coerce: (e == null ? void 0 : e.coerce) ?? !1,
    ...X(e),
  });
class kn extends ee {
  _parse(t) {
    if (
      (this._def.coerce && (t.data = !!t.data), this._getType(t) !== U.boolean)
    ) {
      const n = this._getOrReturnCtx(t);
      return (
        M(n, {
          code: E.invalid_type,
          expected: U.boolean,
          received: n.parsedType,
        }),
        W
      );
    }
    return Ne(t.data);
  }
}
kn.create = (e) =>
  new kn({
    typeName: P.ZodBoolean,
    coerce: (e == null ? void 0 : e.coerce) || !1,
    ...X(e),
  });
class Cr extends ee {
  _parse(t) {
    if (
      (this._def.coerce && (t.data = new Date(t.data)),
      this._getType(t) !== U.date)
    ) {
      const s = this._getOrReturnCtx(t);
      return (
        M(s, {
          code: E.invalid_type,
          expected: U.date,
          received: s.parsedType,
        }),
        W
      );
    }
    if (Number.isNaN(t.data.getTime())) {
      const s = this._getOrReturnCtx(t);
      return (M(s, { code: E.invalid_date }), W);
    }
    const n = new ve();
    let a;
    for (const s of this._def.checks)
      s.kind === "min"
        ? t.data.getTime() < s.value &&
          ((a = this._getOrReturnCtx(t, a)),
          M(a, {
            code: E.too_small,
            message: s.message,
            inclusive: !0,
            exact: !1,
            minimum: s.value,
            type: "date",
          }),
          n.dirty())
        : s.kind === "max"
          ? t.data.getTime() > s.value &&
            ((a = this._getOrReturnCtx(t, a)),
            M(a, {
              code: E.too_big,
              message: s.message,
              inclusive: !0,
              exact: !1,
              maximum: s.value,
              type: "date",
            }),
            n.dirty())
          : te.assertNever(s);
    return { status: n.value, value: new Date(t.data.getTime()) };
  }
  _addCheck(t) {
    return new Cr({ ...this._def, checks: [...this._def.checks, t] });
  }
  min(t, r) {
    return this._addCheck({
      kind: "min",
      value: t.getTime(),
      message: B.toString(r),
    });
  }
  max(t, r) {
    return this._addCheck({
      kind: "max",
      value: t.getTime(),
      message: B.toString(r),
    });
  }
  get minDate() {
    let t = null;
    for (const r of this._def.checks)
      r.kind === "min" && (t === null || r.value > t) && (t = r.value);
    return t != null ? new Date(t) : null;
  }
  get maxDate() {
    let t = null;
    for (const r of this._def.checks)
      r.kind === "max" && (t === null || r.value < t) && (t = r.value);
    return t != null ? new Date(t) : null;
  }
}
Cr.create = (e) =>
  new Cr({
    checks: [],
    coerce: (e == null ? void 0 : e.coerce) || !1,
    typeName: P.ZodDate,
    ...X(e),
  });
class Ca extends ee {
  _parse(t) {
    if (this._getType(t) !== U.symbol) {
      const n = this._getOrReturnCtx(t);
      return (
        M(n, {
          code: E.invalid_type,
          expected: U.symbol,
          received: n.parsedType,
        }),
        W
      );
    }
    return Ne(t.data);
  }
}
Ca.create = (e) => new Ca({ typeName: P.ZodSymbol, ...X(e) });
class An extends ee {
  _parse(t) {
    if (this._getType(t) !== U.undefined) {
      const n = this._getOrReturnCtx(t);
      return (
        M(n, {
          code: E.invalid_type,
          expected: U.undefined,
          received: n.parsedType,
        }),
        W
      );
    }
    return Ne(t.data);
  }
}
An.create = (e) => new An({ typeName: P.ZodUndefined, ...X(e) });
class Ir extends ee {
  _parse(t) {
    if (this._getType(t) !== U.null) {
      const n = this._getOrReturnCtx(t);
      return (
        M(n, {
          code: E.invalid_type,
          expected: U.null,
          received: n.parsedType,
        }),
        W
      );
    }
    return Ne(t.data);
  }
}
Ir.create = (e) => new Ir({ typeName: P.ZodNull, ...X(e) });
class Yt extends ee {
  constructor() {
    (super(...arguments), (this._any = !0));
  }
  _parse(t) {
    return Ne(t.data);
  }
}
Yt.create = (e) => new Yt({ typeName: P.ZodAny, ...X(e) });
class Sn extends ee {
  constructor() {
    (super(...arguments), (this._unknown = !0));
  }
  _parse(t) {
    return Ne(t.data);
  }
}
Sn.create = (e) => new Sn({ typeName: P.ZodUnknown, ...X(e) });
class lt extends ee {
  _parse(t) {
    const r = this._getOrReturnCtx(t);
    return (
      M(r, { code: E.invalid_type, expected: U.never, received: r.parsedType }),
      W
    );
  }
}
lt.create = (e) => new lt({ typeName: P.ZodNever, ...X(e) });
class Ia extends ee {
  _parse(t) {
    if (this._getType(t) !== U.undefined) {
      const n = this._getOrReturnCtx(t);
      return (
        M(n, {
          code: E.invalid_type,
          expected: U.void,
          received: n.parsedType,
        }),
        W
      );
    }
    return Ne(t.data);
  }
}
Ia.create = (e) => new Ia({ typeName: P.ZodVoid, ...X(e) });
class Je extends ee {
  _parse(t) {
    const { ctx: r, status: n } = this._processInputParams(t),
      a = this._def;
    if (r.parsedType !== U.array)
      return (
        M(r, {
          code: E.invalid_type,
          expected: U.array,
          received: r.parsedType,
        }),
        W
      );
    if (a.exactLength !== null) {
      const o = r.data.length > a.exactLength.value,
        i = r.data.length < a.exactLength.value;
      (o || i) &&
        (M(r, {
          code: o ? E.too_big : E.too_small,
          minimum: i ? a.exactLength.value : void 0,
          maximum: o ? a.exactLength.value : void 0,
          type: "array",
          inclusive: !0,
          exact: !0,
          message: a.exactLength.message,
        }),
        n.dirty());
    }
    if (
      (a.minLength !== null &&
        r.data.length < a.minLength.value &&
        (M(r, {
          code: E.too_small,
          minimum: a.minLength.value,
          type: "array",
          inclusive: !0,
          exact: !1,
          message: a.minLength.message,
        }),
        n.dirty()),
      a.maxLength !== null &&
        r.data.length > a.maxLength.value &&
        (M(r, {
          code: E.too_big,
          maximum: a.maxLength.value,
          type: "array",
          inclusive: !0,
          exact: !1,
          message: a.maxLength.message,
        }),
        n.dirty()),
      r.common.async)
    )
      return Promise.all(
        [...r.data].map((o, i) => a.type._parseAsync(new He(r, o, r.path, i))),
      ).then((o) => ve.mergeArray(n, o));
    const s = [...r.data].map((o, i) =>
      a.type._parseSync(new He(r, o, r.path, i)),
    );
    return ve.mergeArray(n, s);
  }
  get element() {
    return this._def.type;
  }
  min(t, r) {
    return new Je({
      ...this._def,
      minLength: { value: t, message: B.toString(r) },
    });
  }
  max(t, r) {
    return new Je({
      ...this._def,
      maxLength: { value: t, message: B.toString(r) },
    });
  }
  length(t, r) {
    return new Je({
      ...this._def,
      exactLength: { value: t, message: B.toString(r) },
    });
  }
  nonempty(t) {
    return this.min(1, t);
  }
}
Je.create = (e, t) =>
  new Je({
    type: e,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: P.ZodArray,
    ...X(t),
  });
function Mt(e) {
  if (e instanceof pe) {
    const t = {};
    for (const r in e.shape) {
      const n = e.shape[r];
      t[r] = tt.create(Mt(n));
    }
    return new pe({ ...e._def, shape: () => t });
  } else
    return e instanceof Je
      ? new Je({ ...e._def, type: Mt(e.element) })
      : e instanceof tt
        ? tt.create(Mt(e.unwrap()))
        : e instanceof At
          ? At.create(Mt(e.unwrap()))
          : e instanceof wt
            ? wt.create(e.items.map((t) => Mt(t)))
            : e;
}
class pe extends ee {
  constructor() {
    (super(...arguments),
      (this._cached = null),
      (this.nonstrict = this.passthrough),
      (this.augment = this.extend));
  }
  _getCached() {
    if (this._cached !== null) return this._cached;
    const t = this._def.shape(),
      r = te.objectKeys(t);
    return ((this._cached = { shape: t, keys: r }), this._cached);
  }
  _parse(t) {
    if (this._getType(t) !== U.object) {
      const c = this._getOrReturnCtx(t);
      return (
        M(c, {
          code: E.invalid_type,
          expected: U.object,
          received: c.parsedType,
        }),
        W
      );
    }
    const { status: n, ctx: a } = this._processInputParams(t),
      { shape: s, keys: o } = this._getCached(),
      i = [];
    if (
      !(this._def.catchall instanceof lt && this._def.unknownKeys === "strip")
    )
      for (const c in a.data) o.includes(c) || i.push(c);
    const l = [];
    for (const c of o) {
      const u = s[c],
        d = a.data[c];
      l.push({
        key: { status: "valid", value: c },
        value: u._parse(new He(a, d, a.path, c)),
        alwaysSet: c in a.data,
      });
    }
    if (this._def.catchall instanceof lt) {
      const c = this._def.unknownKeys;
      if (c === "passthrough")
        for (const u of i)
          l.push({
            key: { status: "valid", value: u },
            value: { status: "valid", value: a.data[u] },
          });
      else if (c === "strict")
        i.length > 0 &&
          (M(a, { code: E.unrecognized_keys, keys: i }), n.dirty());
      else if (c !== "strip")
        throw new Error("Internal ZodObject error: invalid unknownKeys value.");
    } else {
      const c = this._def.catchall;
      for (const u of i) {
        const d = a.data[u];
        l.push({
          key: { status: "valid", value: u },
          value: c._parse(new He(a, d, a.path, u)),
          alwaysSet: u in a.data,
        });
      }
    }
    return a.common.async
      ? Promise.resolve()
          .then(async () => {
            const c = [];
            for (const u of l) {
              const d = await u.key,
                g = await u.value;
              c.push({ key: d, value: g, alwaysSet: u.alwaysSet });
            }
            return c;
          })
          .then((c) => ve.mergeObjectSync(n, c))
      : ve.mergeObjectSync(n, l);
  }
  get shape() {
    return this._def.shape();
  }
  strict(t) {
    return (
      B.errToObj,
      new pe({
        ...this._def,
        unknownKeys: "strict",
        ...(t !== void 0
          ? {
              errorMap: (r, n) => {
                var s, o;
                const a =
                  ((o = (s = this._def).errorMap) == null
                    ? void 0
                    : o.call(s, r, n).message) ?? n.defaultError;
                return r.code === "unrecognized_keys"
                  ? { message: B.errToObj(t).message ?? a }
                  : { message: a };
              },
            }
          : {}),
      })
    );
  }
  strip() {
    return new pe({ ...this._def, unknownKeys: "strip" });
  }
  passthrough() {
    return new pe({ ...this._def, unknownKeys: "passthrough" });
  }
  extend(t) {
    return new pe({
      ...this._def,
      shape: () => ({ ...this._def.shape(), ...t }),
    });
  }
  merge(t) {
    return new pe({
      unknownKeys: t._def.unknownKeys,
      catchall: t._def.catchall,
      shape: () => ({ ...this._def.shape(), ...t._def.shape() }),
      typeName: P.ZodObject,
    });
  }
  setKey(t, r) {
    return this.augment({ [t]: r });
  }
  catchall(t) {
    return new pe({ ...this._def, catchall: t });
  }
  pick(t) {
    const r = {};
    for (const n of te.objectKeys(t))
      t[n] && this.shape[n] && (r[n] = this.shape[n]);
    return new pe({ ...this._def, shape: () => r });
  }
  omit(t) {
    const r = {};
    for (const n of te.objectKeys(this.shape)) t[n] || (r[n] = this.shape[n]);
    return new pe({ ...this._def, shape: () => r });
  }
  deepPartial() {
    return Mt(this);
  }
  partial(t) {
    const r = {};
    for (const n of te.objectKeys(this.shape)) {
      const a = this.shape[n];
      t && !t[n] ? (r[n] = a) : (r[n] = a.optional());
    }
    return new pe({ ...this._def, shape: () => r });
  }
  required(t) {
    const r = {};
    for (const n of te.objectKeys(this.shape))
      if (t && !t[n]) r[n] = this.shape[n];
      else {
        let s = this.shape[n];
        for (; s instanceof tt; ) s = s._def.innerType;
        r[n] = s;
      }
    return new pe({ ...this._def, shape: () => r });
  }
  keyof() {
    return zs(te.objectKeys(this.shape));
  }
}
pe.create = (e, t) =>
  new pe({
    shape: () => e,
    unknownKeys: "strip",
    catchall: lt.create(),
    typeName: P.ZodObject,
    ...X(t),
  });
pe.strictCreate = (e, t) =>
  new pe({
    shape: () => e,
    unknownKeys: "strict",
    catchall: lt.create(),
    typeName: P.ZodObject,
    ...X(t),
  });
pe.lazycreate = (e, t) =>
  new pe({
    shape: e,
    unknownKeys: "strip",
    catchall: lt.create(),
    typeName: P.ZodObject,
    ...X(t),
  });
class Er extends ee {
  _parse(t) {
    const { ctx: r } = this._processInputParams(t),
      n = this._def.options;
    function a(s) {
      for (const i of s) if (i.result.status === "valid") return i.result;
      for (const i of s)
        if (i.result.status === "dirty")
          return (r.common.issues.push(...i.ctx.common.issues), i.result);
      const o = s.map((i) => new rt(i.ctx.common.issues));
      return (M(r, { code: E.invalid_union, unionErrors: o }), W);
    }
    if (r.common.async)
      return Promise.all(
        n.map(async (s) => {
          const o = { ...r, common: { ...r.common, issues: [] }, parent: null };
          return {
            result: await s._parseAsync({
              data: r.data,
              path: r.path,
              parent: o,
            }),
            ctx: o,
          };
        }),
      ).then(a);
    {
      let s;
      const o = [];
      for (const l of n) {
        const c = { ...r, common: { ...r.common, issues: [] }, parent: null },
          u = l._parseSync({ data: r.data, path: r.path, parent: c });
        if (u.status === "valid") return u;
        (u.status === "dirty" && !s && (s = { result: u, ctx: c }),
          c.common.issues.length && o.push(c.common.issues));
      }
      if (s) return (r.common.issues.push(...s.ctx.common.issues), s.result);
      const i = o.map((l) => new rt(l));
      return (M(r, { code: E.invalid_union, unionErrors: i }), W);
    }
  }
  get options() {
    return this._def.options;
  }
}
Er.create = (e, t) => new Er({ options: e, typeName: P.ZodUnion, ...X(t) });
const Xe = (e) =>
  e instanceof Nr
    ? Xe(e.schema)
    : e instanceof kt
      ? Xe(e.innerType())
      : e instanceof Or
        ? [e.value]
        : e instanceof xt
          ? e.options
          : e instanceof Cn
            ? te.objectValues(e.enum)
            : e instanceof Mr
              ? Xe(e._def.innerType)
              : e instanceof An
                ? [void 0]
                : e instanceof Ir
                  ? [null]
                  : e instanceof tt
                    ? [void 0, ...Xe(e.unwrap())]
                    : e instanceof At
                      ? [null, ...Xe(e.unwrap())]
                      : e instanceof Zs || e instanceof Dr
                        ? Xe(e.unwrap())
                        : e instanceof $r
                          ? Xe(e._def.innerType)
                          : [];
class zn extends ee {
  _parse(t) {
    const { ctx: r } = this._processInputParams(t);
    if (r.parsedType !== U.object)
      return (
        M(r, {
          code: E.invalid_type,
          expected: U.object,
          received: r.parsedType,
        }),
        W
      );
    const n = this.discriminator,
      a = r.data[n],
      s = this.optionsMap.get(a);
    return s
      ? r.common.async
        ? s._parseAsync({ data: r.data, path: r.path, parent: r })
        : s._parseSync({ data: r.data, path: r.path, parent: r })
      : (M(r, {
          code: E.invalid_union_discriminator,
          options: Array.from(this.optionsMap.keys()),
          path: [n],
        }),
        W);
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
  static create(t, r, n) {
    const a = new Map();
    for (const s of r) {
      const o = Xe(s.shape[t]);
      if (!o.length)
        throw new Error(
          `A discriminator value for key \`${t}\` could not be extracted from all schema options`,
        );
      for (const i of o) {
        if (a.has(i))
          throw new Error(
            `Discriminator property ${String(t)} has duplicate value ${String(i)}`,
          );
        a.set(i, s);
      }
    }
    return new zn({
      typeName: P.ZodDiscriminatedUnion,
      discriminator: t,
      options: r,
      optionsMap: a,
      ...X(n),
    });
  }
}
function Tn(e, t) {
  const r = st(e),
    n = st(t);
  if (e === t) return { valid: !0, data: e };
  if (r === U.object && n === U.object) {
    const a = te.objectKeys(t),
      s = te.objectKeys(e).filter((i) => a.indexOf(i) !== -1),
      o = { ...e, ...t };
    for (const i of s) {
      const l = Tn(e[i], t[i]);
      if (!l.valid) return { valid: !1 };
      o[i] = l.data;
    }
    return { valid: !0, data: o };
  } else if (r === U.array && n === U.array) {
    if (e.length !== t.length) return { valid: !1 };
    const a = [];
    for (let s = 0; s < e.length; s++) {
      const o = e[s],
        i = t[s],
        l = Tn(o, i);
      if (!l.valid) return { valid: !1 };
      a.push(l.data);
    }
    return { valid: !0, data: a };
  } else
    return r === U.date && n === U.date && +e == +t
      ? { valid: !0, data: e }
      : { valid: !1 };
}
class Rr extends ee {
  _parse(t) {
    const { status: r, ctx: n } = this._processInputParams(t),
      a = (s, o) => {
        if (Aa(s) || Aa(o)) return W;
        const i = Tn(s.value, o.value);
        return i.valid
          ? ((Sa(s) || Sa(o)) && r.dirty(), { status: r.value, value: i.data })
          : (M(n, { code: E.invalid_intersection_types }), W);
      };
    return n.common.async
      ? Promise.all([
          this._def.left._parseAsync({ data: n.data, path: n.path, parent: n }),
          this._def.right._parseAsync({
            data: n.data,
            path: n.path,
            parent: n,
          }),
        ]).then(([s, o]) => a(s, o))
      : a(
          this._def.left._parseSync({ data: n.data, path: n.path, parent: n }),
          this._def.right._parseSync({ data: n.data, path: n.path, parent: n }),
        );
  }
}
Rr.create = (e, t, r) =>
  new Rr({ left: e, right: t, typeName: P.ZodIntersection, ...X(r) });
class wt extends ee {
  _parse(t) {
    const { status: r, ctx: n } = this._processInputParams(t);
    if (n.parsedType !== U.array)
      return (
        M(n, {
          code: E.invalid_type,
          expected: U.array,
          received: n.parsedType,
        }),
        W
      );
    if (n.data.length < this._def.items.length)
      return (
        M(n, {
          code: E.too_small,
          minimum: this._def.items.length,
          inclusive: !0,
          exact: !1,
          type: "array",
        }),
        W
      );
    !this._def.rest &&
      n.data.length > this._def.items.length &&
      (M(n, {
        code: E.too_big,
        maximum: this._def.items.length,
        inclusive: !0,
        exact: !1,
        type: "array",
      }),
      r.dirty());
    const s = [...n.data]
      .map((o, i) => {
        const l = this._def.items[i] || this._def.rest;
        return l ? l._parse(new He(n, o, n.path, i)) : null;
      })
      .filter((o) => !!o);
    return n.common.async
      ? Promise.all(s).then((o) => ve.mergeArray(r, o))
      : ve.mergeArray(r, s);
  }
  get items() {
    return this._def.items;
  }
  rest(t) {
    return new wt({ ...this._def, rest: t });
  }
}
wt.create = (e, t) => {
  if (!Array.isArray(e))
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  return new wt({ items: e, typeName: P.ZodTuple, rest: null, ...X(t) });
};
class Pr extends ee {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(t) {
    const { status: r, ctx: n } = this._processInputParams(t);
    if (n.parsedType !== U.object)
      return (
        M(n, {
          code: E.invalid_type,
          expected: U.object,
          received: n.parsedType,
        }),
        W
      );
    const a = [],
      s = this._def.keyType,
      o = this._def.valueType;
    for (const i in n.data)
      a.push({
        key: s._parse(new He(n, i, n.path, i)),
        value: o._parse(new He(n, n.data[i], n.path, i)),
        alwaysSet: i in n.data,
      });
    return n.common.async
      ? ve.mergeObjectAsync(r, a)
      : ve.mergeObjectSync(r, a);
  }
  get element() {
    return this._def.valueType;
  }
  static create(t, r, n) {
    return r instanceof ee
      ? new Pr({ keyType: t, valueType: r, typeName: P.ZodRecord, ...X(n) })
      : new Pr({
          keyType: et.create(),
          valueType: t,
          typeName: P.ZodRecord,
          ...X(r),
        });
  }
}
class Ea extends ee {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(t) {
    const { status: r, ctx: n } = this._processInputParams(t);
    if (n.parsedType !== U.map)
      return (
        M(n, { code: E.invalid_type, expected: U.map, received: n.parsedType }),
        W
      );
    const a = this._def.keyType,
      s = this._def.valueType,
      o = [...n.data.entries()].map(([i, l], c) => ({
        key: a._parse(new He(n, i, n.path, [c, "key"])),
        value: s._parse(new He(n, l, n.path, [c, "value"])),
      }));
    if (n.common.async) {
      const i = new Map();
      return Promise.resolve().then(async () => {
        for (const l of o) {
          const c = await l.key,
            u = await l.value;
          if (c.status === "aborted" || u.status === "aborted") return W;
          ((c.status === "dirty" || u.status === "dirty") && r.dirty(),
            i.set(c.value, u.value));
        }
        return { status: r.value, value: i };
      });
    } else {
      const i = new Map();
      for (const l of o) {
        const c = l.key,
          u = l.value;
        if (c.status === "aborted" || u.status === "aborted") return W;
        ((c.status === "dirty" || u.status === "dirty") && r.dirty(),
          i.set(c.value, u.value));
      }
      return { status: r.value, value: i };
    }
  }
}
Ea.create = (e, t, r) =>
  new Ea({ valueType: t, keyType: e, typeName: P.ZodMap, ...X(r) });
class Xt extends ee {
  _parse(t) {
    const { status: r, ctx: n } = this._processInputParams(t);
    if (n.parsedType !== U.set)
      return (
        M(n, { code: E.invalid_type, expected: U.set, received: n.parsedType }),
        W
      );
    const a = this._def;
    (a.minSize !== null &&
      n.data.size < a.minSize.value &&
      (M(n, {
        code: E.too_small,
        minimum: a.minSize.value,
        type: "set",
        inclusive: !0,
        exact: !1,
        message: a.minSize.message,
      }),
      r.dirty()),
      a.maxSize !== null &&
        n.data.size > a.maxSize.value &&
        (M(n, {
          code: E.too_big,
          maximum: a.maxSize.value,
          type: "set",
          inclusive: !0,
          exact: !1,
          message: a.maxSize.message,
        }),
        r.dirty()));
    const s = this._def.valueType;
    function o(l) {
      const c = new Set();
      for (const u of l) {
        if (u.status === "aborted") return W;
        (u.status === "dirty" && r.dirty(), c.add(u.value));
      }
      return { status: r.value, value: c };
    }
    const i = [...n.data.values()].map((l, c) =>
      s._parse(new He(n, l, n.path, c)),
    );
    return n.common.async ? Promise.all(i).then((l) => o(l)) : o(i);
  }
  min(t, r) {
    return new Xt({
      ...this._def,
      minSize: { value: t, message: B.toString(r) },
    });
  }
  max(t, r) {
    return new Xt({
      ...this._def,
      maxSize: { value: t, message: B.toString(r) },
    });
  }
  size(t, r) {
    return this.min(t, r).max(t, r);
  }
  nonempty(t) {
    return this.min(1, t);
  }
}
Xt.create = (e, t) =>
  new Xt({
    valueType: e,
    minSize: null,
    maxSize: null,
    typeName: P.ZodSet,
    ...X(t),
  });
class Nr extends ee {
  get schema() {
    return this._def.getter();
  }
  _parse(t) {
    const { ctx: r } = this._processInputParams(t);
    return this._def.getter()._parse({ data: r.data, path: r.path, parent: r });
  }
}
Nr.create = (e, t) => new Nr({ getter: e, typeName: P.ZodLazy, ...X(t) });
class Or extends ee {
  _parse(t) {
    if (t.data !== this._def.value) {
      const r = this._getOrReturnCtx(t);
      return (
        M(r, {
          received: r.data,
          code: E.invalid_literal,
          expected: this._def.value,
        }),
        W
      );
    }
    return { status: "valid", value: t.data };
  }
  get value() {
    return this._def.value;
  }
}
Or.create = (e, t) => new Or({ value: e, typeName: P.ZodLiteral, ...X(t) });
function zs(e, t) {
  return new xt({ values: e, typeName: P.ZodEnum, ...X(t) });
}
class xt extends ee {
  _parse(t) {
    if (typeof t.data != "string") {
      const r = this._getOrReturnCtx(t),
        n = this._def.values;
      return (
        M(r, {
          expected: te.joinValues(n),
          received: r.parsedType,
          code: E.invalid_type,
        }),
        W
      );
    }
    if (
      (this._cache || (this._cache = new Set(this._def.values)),
      !this._cache.has(t.data))
    ) {
      const r = this._getOrReturnCtx(t),
        n = this._def.values;
      return (
        M(r, { received: r.data, code: E.invalid_enum_value, options: n }),
        W
      );
    }
    return Ne(t.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const t = {};
    for (const r of this._def.values) t[r] = r;
    return t;
  }
  get Values() {
    const t = {};
    for (const r of this._def.values) t[r] = r;
    return t;
  }
  get Enum() {
    const t = {};
    for (const r of this._def.values) t[r] = r;
    return t;
  }
  extract(t, r = this._def) {
    return xt.create(t, { ...this._def, ...r });
  }
  exclude(t, r = this._def) {
    return xt.create(
      this.options.filter((n) => !t.includes(n)),
      { ...this._def, ...r },
    );
  }
}
xt.create = zs;
class Cn extends ee {
  _parse(t) {
    const r = te.getValidEnumValues(this._def.values),
      n = this._getOrReturnCtx(t);
    if (n.parsedType !== U.string && n.parsedType !== U.number) {
      const a = te.objectValues(r);
      return (
        M(n, {
          expected: te.joinValues(a),
          received: n.parsedType,
          code: E.invalid_type,
        }),
        W
      );
    }
    if (
      (this._cache ||
        (this._cache = new Set(te.getValidEnumValues(this._def.values))),
      !this._cache.has(t.data))
    ) {
      const a = te.objectValues(r);
      return (
        M(n, { received: n.data, code: E.invalid_enum_value, options: a }),
        W
      );
    }
    return Ne(t.data);
  }
  get enum() {
    return this._def.values;
  }
}
Cn.create = (e, t) => new Cn({ values: e, typeName: P.ZodNativeEnum, ...X(t) });
class jr extends ee {
  unwrap() {
    return this._def.type;
  }
  _parse(t) {
    const { ctx: r } = this._processInputParams(t);
    if (r.parsedType !== U.promise && r.common.async === !1)
      return (
        M(r, {
          code: E.invalid_type,
          expected: U.promise,
          received: r.parsedType,
        }),
        W
      );
    const n = r.parsedType === U.promise ? r.data : Promise.resolve(r.data);
    return Ne(
      n.then((a) =>
        this._def.type.parseAsync(a, {
          path: r.path,
          errorMap: r.common.contextualErrorMap,
        }),
      ),
    );
  }
}
jr.create = (e, t) => new jr({ type: e, typeName: P.ZodPromise, ...X(t) });
class kt extends ee {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === P.ZodEffects
      ? this._def.schema.sourceType()
      : this._def.schema;
  }
  _parse(t) {
    const { status: r, ctx: n } = this._processInputParams(t),
      a = this._def.effect || null,
      s = {
        addIssue: (o) => {
          (M(n, o), o.fatal ? r.abort() : r.dirty());
        },
        get path() {
          return n.path;
        },
      };
    if (((s.addIssue = s.addIssue.bind(s)), a.type === "preprocess")) {
      const o = a.transform(n.data, s);
      if (n.common.async)
        return Promise.resolve(o).then(async (i) => {
          if (r.value === "aborted") return W;
          const l = await this._def.schema._parseAsync({
            data: i,
            path: n.path,
            parent: n,
          });
          return l.status === "aborted"
            ? W
            : l.status === "dirty" || r.value === "dirty"
              ? Vt(l.value)
              : l;
        });
      {
        if (r.value === "aborted") return W;
        const i = this._def.schema._parseSync({
          data: o,
          path: n.path,
          parent: n,
        });
        return i.status === "aborted"
          ? W
          : i.status === "dirty" || r.value === "dirty"
            ? Vt(i.value)
            : i;
      }
    }
    if (a.type === "refinement") {
      const o = (i) => {
        const l = a.refinement(i, s);
        if (n.common.async) return Promise.resolve(l);
        if (l instanceof Promise)
          throw new Error(
            "Async refinement encountered during synchronous parse operation. Use .parseAsync instead.",
          );
        return i;
      };
      if (n.common.async === !1) {
        const i = this._def.schema._parseSync({
          data: n.data,
          path: n.path,
          parent: n,
        });
        return i.status === "aborted"
          ? W
          : (i.status === "dirty" && r.dirty(),
            o(i.value),
            { status: r.value, value: i.value });
      } else
        return this._def.schema
          ._parseAsync({ data: n.data, path: n.path, parent: n })
          .then((i) =>
            i.status === "aborted"
              ? W
              : (i.status === "dirty" && r.dirty(),
                o(i.value).then(() => ({ status: r.value, value: i.value }))),
          );
    }
    if (a.type === "transform")
      if (n.common.async === !1) {
        const o = this._def.schema._parseSync({
          data: n.data,
          path: n.path,
          parent: n,
        });
        if (!Dt(o)) return W;
        const i = a.transform(o.value, s);
        if (i instanceof Promise)
          throw new Error(
            "Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.",
          );
        return { status: r.value, value: i };
      } else
        return this._def.schema
          ._parseAsync({ data: n.data, path: n.path, parent: n })
          .then((o) =>
            Dt(o)
              ? Promise.resolve(a.transform(o.value, s)).then((i) => ({
                  status: r.value,
                  value: i,
                }))
              : W,
          );
    te.assertNever(a);
  }
}
kt.create = (e, t, r) =>
  new kt({ schema: e, typeName: P.ZodEffects, effect: t, ...X(r) });
kt.createWithPreprocess = (e, t, r) =>
  new kt({
    schema: t,
    effect: { type: "preprocess", transform: e },
    typeName: P.ZodEffects,
    ...X(r),
  });
class tt extends ee {
  _parse(t) {
    return this._getType(t) === U.undefined
      ? Ne(void 0)
      : this._def.innerType._parse(t);
  }
  unwrap() {
    return this._def.innerType;
  }
}
tt.create = (e, t) =>
  new tt({ innerType: e, typeName: P.ZodOptional, ...X(t) });
class At extends ee {
  _parse(t) {
    return this._getType(t) === U.null
      ? Ne(null)
      : this._def.innerType._parse(t);
  }
  unwrap() {
    return this._def.innerType;
  }
}
At.create = (e, t) =>
  new At({ innerType: e, typeName: P.ZodNullable, ...X(t) });
class Mr extends ee {
  _parse(t) {
    const { ctx: r } = this._processInputParams(t);
    let n = r.data;
    return (
      r.parsedType === U.undefined && (n = this._def.defaultValue()),
      this._def.innerType._parse({ data: n, path: r.path, parent: r })
    );
  }
  removeDefault() {
    return this._def.innerType;
  }
}
Mr.create = (e, t) =>
  new Mr({
    innerType: e,
    typeName: P.ZodDefault,
    defaultValue: typeof t.default == "function" ? t.default : () => t.default,
    ...X(t),
  });
class $r extends ee {
  _parse(t) {
    const { ctx: r } = this._processInputParams(t),
      n = { ...r, common: { ...r.common, issues: [] } },
      a = this._def.innerType._parse({
        data: n.data,
        path: n.path,
        parent: { ...n },
      });
    return Tr(a)
      ? a.then((s) => ({
          status: "valid",
          value:
            s.status === "valid"
              ? s.value
              : this._def.catchValue({
                  get error() {
                    return new rt(n.common.issues);
                  },
                  input: n.data,
                }),
        }))
      : {
          status: "valid",
          value:
            a.status === "valid"
              ? a.value
              : this._def.catchValue({
                  get error() {
                    return new rt(n.common.issues);
                  },
                  input: n.data,
                }),
        };
  }
  removeCatch() {
    return this._def.innerType;
  }
}
$r.create = (e, t) =>
  new $r({
    innerType: e,
    typeName: P.ZodCatch,
    catchValue: typeof t.catch == "function" ? t.catch : () => t.catch,
    ...X(t),
  });
class Ra extends ee {
  _parse(t) {
    if (this._getType(t) !== U.nan) {
      const n = this._getOrReturnCtx(t);
      return (
        M(n, { code: E.invalid_type, expected: U.nan, received: n.parsedType }),
        W
      );
    }
    return { status: "valid", value: t.data };
  }
}
Ra.create = (e) => new Ra({ typeName: P.ZodNaN, ...X(e) });
class Zs extends ee {
  _parse(t) {
    const { ctx: r } = this._processInputParams(t),
      n = r.data;
    return this._def.type._parse({ data: n, path: r.path, parent: r });
  }
  unwrap() {
    return this._def.type;
  }
}
class Zn extends ee {
  _parse(t) {
    const { status: r, ctx: n } = this._processInputParams(t);
    if (n.common.async)
      return (async () => {
        const s = await this._def.in._parseAsync({
          data: n.data,
          path: n.path,
          parent: n,
        });
        return s.status === "aborted"
          ? W
          : s.status === "dirty"
            ? (r.dirty(), Vt(s.value))
            : this._def.out._parseAsync({
                data: s.value,
                path: n.path,
                parent: n,
              });
      })();
    {
      const a = this._def.in._parseSync({
        data: n.data,
        path: n.path,
        parent: n,
      });
      return a.status === "aborted"
        ? W
        : a.status === "dirty"
          ? (r.dirty(), { status: "dirty", value: a.value })
          : this._def.out._parseSync({
              data: a.value,
              path: n.path,
              parent: n,
            });
    }
  }
  static create(t, r) {
    return new Zn({ in: t, out: r, typeName: P.ZodPipeline });
  }
}
class Dr extends ee {
  _parse(t) {
    const r = this._def.innerType._parse(t),
      n = (a) => (Dt(a) && (a.value = Object.freeze(a.value)), a);
    return Tr(r) ? r.then((a) => n(a)) : n(r);
  }
  unwrap() {
    return this._def.innerType;
  }
}
Dr.create = (e, t) =>
  new Dr({ innerType: e, typeName: P.ZodReadonly, ...X(t) });
function Pa(e, t) {
  const r =
    typeof e == "function" ? e(t) : typeof e == "string" ? { message: e } : e;
  return typeof r == "string" ? { message: r } : r;
}
function Vs(e, t = {}, r) {
  return e
    ? Yt.create().superRefine((n, a) => {
        const s = e(n);
        if (s instanceof Promise)
          return s.then((o) => {
            if (!o) {
              const i = Pa(t, n),
                l = i.fatal ?? r ?? !0;
              a.addIssue({ code: "custom", ...i, fatal: l });
            }
          });
        if (!s) {
          const o = Pa(t, n),
            i = o.fatal ?? r ?? !0;
          a.addIssue({ code: "custom", ...o, fatal: i });
        }
      })
    : Yt.create();
}
var P;
(function (e) {
  ((e.ZodString = "ZodString"),
    (e.ZodNumber = "ZodNumber"),
    (e.ZodNaN = "ZodNaN"),
    (e.ZodBigInt = "ZodBigInt"),
    (e.ZodBoolean = "ZodBoolean"),
    (e.ZodDate = "ZodDate"),
    (e.ZodSymbol = "ZodSymbol"),
    (e.ZodUndefined = "ZodUndefined"),
    (e.ZodNull = "ZodNull"),
    (e.ZodAny = "ZodAny"),
    (e.ZodUnknown = "ZodUnknown"),
    (e.ZodNever = "ZodNever"),
    (e.ZodVoid = "ZodVoid"),
    (e.ZodArray = "ZodArray"),
    (e.ZodObject = "ZodObject"),
    (e.ZodUnion = "ZodUnion"),
    (e.ZodDiscriminatedUnion = "ZodDiscriminatedUnion"),
    (e.ZodIntersection = "ZodIntersection"),
    (e.ZodTuple = "ZodTuple"),
    (e.ZodRecord = "ZodRecord"),
    (e.ZodMap = "ZodMap"),
    (e.ZodSet = "ZodSet"),
    (e.ZodFunction = "ZodFunction"),
    (e.ZodLazy = "ZodLazy"),
    (e.ZodLiteral = "ZodLiteral"),
    (e.ZodEnum = "ZodEnum"),
    (e.ZodEffects = "ZodEffects"),
    (e.ZodNativeEnum = "ZodNativeEnum"),
    (e.ZodOptional = "ZodOptional"),
    (e.ZodNullable = "ZodNullable"),
    (e.ZodDefault = "ZodDefault"),
    (e.ZodCatch = "ZodCatch"),
    (e.ZodPromise = "ZodPromise"),
    (e.ZodBranded = "ZodBranded"),
    (e.ZodPipeline = "ZodPipeline"),
    (e.ZodReadonly = "ZodReadonly"));
})(P || (P = {}));
const Lr = (e, t = { message: `Input not instance of ${e.name}` }) =>
    Vs((r) => r instanceof e, t),
  m = et.create,
  N = Lt.create,
  Pe = kn.create,
  Ic = Ir.create,
  Js = Yt.create,
  mr = Sn.create;
lt.create;
const K = Je.create,
  y = pe.create,
  de = Er.create,
  bt = zn.create;
Rr.create;
const Na = wt.create,
  Qt = Pr.create,
  Hs = Nr.create,
  $ = Or.create,
  ct = xt.create;
jr.create;
const fe = tt.create;
At.create;
const Ec = y({
    title: m().describe("优化后的标题，简洁明了，不超过50字"),
    summary: m().max(200).describe("一句话摘要，概括核心内容，不超过200字"),
    category: m().describe(
      "推荐的分类名称，优先从用户已有分类或预设分类中选择",
    ),
    tags: K(m()).max(5).describe("3-5个相关标签，简洁有辨识度"),
  }),
  Rc = y({ tag: m().describe("推荐的标签"), reason: m().describe("推荐理由") }),
  Pc = K(Rc).max(5),
  Nc = y({
    name: m().describe("推荐的分类名称"),
    reason: m().describe("推荐理由"),
  }),
  Oc = K(Nc).max(3),
  Ws = y({
    name: m().min(2).max(20).describe("分类名称，2-8个字"),
    children: Hs(() => K(Ws))
      .optional()
      .describe("子分类数组（可选）"),
  }),
  jc = y({
    categories: K(Ws)
      .min(3)
      .max(10)
      .describe("书签分类数组，包含3-10个一级分类"),
  });
var Gs = "vercel.ai.error",
  Mc = Symbol.for(Gs),
  Ks,
  $c = class Ys extends Error {
    constructor({ name: t, message: r, cause: n }) {
      (super(r), (this[Ks] = !0), (this.name = t), (this.cause = n));
    }
    static isInstance(t) {
      return Ys.hasMarker(t, Gs);
    }
    static hasMarker(t, r) {
      const n = Symbol.for(r);
      return (
        t != null &&
        typeof t == "object" &&
        n in t &&
        typeof t[n] == "boolean" &&
        t[n] === !0
      );
    }
  };
Ks = Mc;
var G = $c,
  Xs = "AI_APICallError",
  Qs = `vercel.ai.error.${Xs}`,
  Dc = Symbol.for(Qs),
  eo,
  Ce = class extends G {
    constructor({
      message: e,
      url: t,
      requestBodyValues: r,
      statusCode: n,
      responseHeaders: a,
      responseBody: s,
      cause: o,
      isRetryable: i = n != null &&
        (n === 408 || n === 409 || n === 429 || n >= 500),
      data: l,
    }) {
      (super({ name: Xs, message: e, cause: o }),
        (this[eo] = !0),
        (this.url = t),
        (this.requestBodyValues = r),
        (this.statusCode = n),
        (this.responseHeaders = a),
        (this.responseBody = s),
        (this.isRetryable = i),
        (this.data = l));
    }
    static isInstance(e) {
      return G.hasMarker(e, Qs);
    }
  };
eo = Dc;
var to = "AI_EmptyResponseBodyError",
  ro = `vercel.ai.error.${to}`,
  Lc = Symbol.for(ro),
  no,
  Uc = class extends G {
    constructor({ message: e = "Empty response body" } = {}) {
      (super({ name: to, message: e }), (this[no] = !0));
    }
    static isInstance(e) {
      return G.hasMarker(e, ro);
    }
  };
no = Lc;
function gr(e) {
  return e == null
    ? "unknown error"
    : typeof e == "string"
      ? e
      : e instanceof Error
        ? e.message
        : JSON.stringify(e);
}
var ao = "AI_InvalidArgumentError",
  so = `vercel.ai.error.${ao}`,
  Fc = Symbol.for(so),
  oo,
  io = class extends G {
    constructor({ message: t, cause: r, argument: n }) {
      (super({ name: ao, message: t, cause: r }),
        (this[oo] = !0),
        (this.argument = n));
    }
    static isInstance(t) {
      return G.hasMarker(t, so);
    }
  };
oo = Fc;
var lo = "AI_InvalidPromptError",
  co = `vercel.ai.error.${lo}`,
  qc = Symbol.for(co),
  uo,
  Qe = class extends G {
    constructor({ prompt: e, message: t, cause: r }) {
      (super({ name: lo, message: `Invalid prompt: ${t}`, cause: r }),
        (this[uo] = !0),
        (this.prompt = e));
    }
    static isInstance(e) {
      return G.hasMarker(e, co);
    }
  };
uo = qc;
var po = "AI_InvalidResponseDataError",
  mo = `vercel.ai.error.${po}`,
  Bc = Symbol.for(mo),
  go,
  un = class extends G {
    constructor({
      data: e,
      message: t = `Invalid response data: ${JSON.stringify(e)}.`,
    }) {
      (super({ name: po, message: t }), (this[go] = !0), (this.data = e));
    }
    static isInstance(e) {
      return G.hasMarker(e, mo);
    }
  };
go = Bc;
var fo = "AI_JSONParseError",
  ho = `vercel.ai.error.${fo}`,
  zc = Symbol.for(ho),
  yo,
  er = class extends G {
    constructor({ text: e, cause: t }) {
      (super({
        name: fo,
        message: `JSON parsing failed: Text: ${e}.
Error message: ${gr(t)}`,
        cause: t,
      }),
        (this[yo] = !0),
        (this.text = e));
    }
    static isInstance(e) {
      return G.hasMarker(e, ho);
    }
  };
yo = zc;
var vo = "AI_LoadAPIKeyError",
  _o = `vercel.ai.error.${vo}`,
  Zc = Symbol.for(_o),
  bo,
  wr = class extends G {
    constructor({ message: e }) {
      (super({ name: vo, message: e }), (this[bo] = !0));
    }
    static isInstance(e) {
      return G.hasMarker(e, _o);
    }
  };
bo = Zc;
var wo = "AI_NoSuchModelError",
  xo = `vercel.ai.error.${wo}`,
  Vc = Symbol.for(xo),
  ko,
  Jc = class extends G {
    constructor({
      errorName: e = wo,
      modelId: t,
      modelType: r,
      message: n = `No such ${r}: ${t}`,
    }) {
      (super({ name: e, message: n }),
        (this[ko] = !0),
        (this.modelId = t),
        (this.modelType = r));
    }
    static isInstance(e) {
      return G.hasMarker(e, xo);
    }
  };
ko = Vc;
var Ao = "AI_TooManyEmbeddingValuesForCallError",
  So = `vercel.ai.error.${Ao}`,
  Hc = Symbol.for(So),
  To,
  Wc = class extends G {
    constructor(e) {
      (super({
        name: Ao,
        message: `Too many values for a single embedding call. The ${e.provider} model "${e.modelId}" can only embed up to ${e.maxEmbeddingsPerCall} values per call, but ${e.values.length} values were provided.`,
      }),
        (this[To] = !0),
        (this.provider = e.provider),
        (this.modelId = e.modelId),
        (this.maxEmbeddingsPerCall = e.maxEmbeddingsPerCall),
        (this.values = e.values));
    }
    static isInstance(e) {
      return G.hasMarker(e, So);
    }
  };
To = Hc;
var Co = "AI_TypeValidationError",
  Io = `vercel.ai.error.${Co}`,
  Gc = Symbol.for(Io),
  Eo,
  Kc = class In extends G {
    constructor({ value: t, cause: r }) {
      (super({
        name: Co,
        message: `Type validation failed: Value: ${JSON.stringify(t)}.
Error message: ${gr(r)}`,
        cause: r,
      }),
        (this[Eo] = !0),
        (this.value = t));
    }
    static isInstance(t) {
      return G.hasMarker(t, Io);
    }
    static wrap({ value: t, cause: r }) {
      return In.isInstance(r) && r.value === t
        ? r
        : new In({ value: t, cause: r });
    }
  };
Eo = Gc;
var nt = Kc,
  Ro = "AI_UnsupportedFunctionalityError",
  Po = `vercel.ai.error.${Ro}`,
  Yc = Symbol.for(Po),
  No,
  le = class extends G {
    constructor({
      functionality: e,
      message: t = `'${e}' functionality not supported.`,
    }) {
      (super({ name: Ro, message: t }),
        (this[No] = !0),
        (this.functionality = e));
    }
    static isInstance(e) {
      return G.hasMarker(e, Po);
    }
  };
No = Yc;
function Ur(e) {
  return e === null ||
    typeof e == "string" ||
    typeof e == "number" ||
    typeof e == "boolean"
    ? !0
    : Array.isArray(e)
      ? e.every(Ur)
      : typeof e == "object"
        ? Object.entries(e).every(([t, r]) => typeof t == "string" && Ur(r))
        : !1;
}
function Oa(e) {
  return Array.isArray(e) && e.every(Ur);
}
function En(e) {
  return (
    e != null &&
    typeof e == "object" &&
    Object.entries(e).every(([t, r]) => typeof t == "string" && Ur(r))
  );
}
let Xc =
  (e, t = 21) =>
  (r = t) => {
    let n = "",
      a = r | 0;
    for (; a--; ) n += e[(Math.random() * e.length) | 0];
    return n;
  };
var qt = { exports: {} };
const Qc = typeof Buffer < "u",
  ja =
    /"(?:_|\\u005[Ff])(?:_|\\u005[Ff])(?:p|\\u0070)(?:r|\\u0072)(?:o|\\u006[Ff])(?:t|\\u0074)(?:o|\\u006[Ff])(?:_|\\u005[Ff])(?:_|\\u005[Ff])"\s*:/,
  Ma =
    /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
function Oo(e, t, r) {
  (r == null && t !== null && typeof t == "object" && ((r = t), (t = void 0)),
    Qc && Buffer.isBuffer(e) && (e = e.toString()),
    e && e.charCodeAt(0) === 65279 && (e = e.slice(1)));
  const n = JSON.parse(e, t);
  if (n === null || typeof n != "object") return n;
  const a = (r && r.protoAction) || "error",
    s = (r && r.constructorAction) || "error";
  if (a === "ignore" && s === "ignore") return n;
  if (a !== "ignore" && s !== "ignore") {
    if (ja.test(e) === !1 && Ma.test(e) === !1) return n;
  } else if (a !== "ignore" && s === "ignore") {
    if (ja.test(e) === !1) return n;
  } else if (Ma.test(e) === !1) return n;
  return jo(n, { protoAction: a, constructorAction: s, safe: r && r.safe });
}
function jo(
  e,
  { protoAction: t = "error", constructorAction: r = "error", safe: n } = {},
) {
  let a = [e];
  for (; a.length; ) {
    const s = a;
    a = [];
    for (const o of s) {
      if (
        t !== "ignore" &&
        Object.prototype.hasOwnProperty.call(o, "__proto__")
      ) {
        if (n === !0) return null;
        if (t === "error")
          throw new SyntaxError("Object contains forbidden prototype property");
        delete o.__proto__;
      }
      if (
        r !== "ignore" &&
        Object.prototype.hasOwnProperty.call(o, "constructor") &&
        Object.prototype.hasOwnProperty.call(o.constructor, "prototype")
      ) {
        if (n === !0) return null;
        if (r === "error")
          throw new SyntaxError("Object contains forbidden prototype property");
        delete o.constructor;
      }
      for (const i in o) {
        const l = o[i];
        l && typeof l == "object" && a.push(l);
      }
    }
  }
  return e;
}
function Vn(e, t, r) {
  const n = Error.stackTraceLimit;
  Error.stackTraceLimit = 0;
  try {
    return Oo(e, t, r);
  } finally {
    Error.stackTraceLimit = n;
  }
}
function eu(e, t) {
  const r = Error.stackTraceLimit;
  Error.stackTraceLimit = 0;
  try {
    return Oo(e, t, { safe: !0 });
  } catch {
    return null;
  } finally {
    Error.stackTraceLimit = r;
  }
}
qt.exports = Vn;
qt.exports.default = Vn;
qt.exports.parse = Vn;
qt.exports.safeParse = eu;
qt.exports.scan = jo;
var tu = qt.exports;
const Jn = ws(tu);
var ru = {};
function qe(...e) {
  return e.reduce((t, r) => ({ ...t, ...(r ?? {}) }), {});
}
function nu(e) {
  return new ReadableStream({
    async pull(t) {
      try {
        const { value: r, done: n } = await e.next();
        n ? t.close() : t.enqueue(r);
      } catch (r) {
        t.error(r);
      }
    },
    cancel() {},
  });
}
async function au(e) {
  return e == null ? Promise.resolve() : new Promise((t) => setTimeout(t, e));
}
function su() {
  let e = "",
    t,
    r = [],
    n,
    a;
  function s(l, c) {
    if (l === "") {
      o(c);
      return;
    }
    if (l.startsWith(":")) return;
    const u = l.indexOf(":");
    if (u === -1) {
      i(l, "");
      return;
    }
    const d = l.slice(0, u),
      g = u + 1,
      _ = g < l.length && l[g] === " " ? l.slice(g + 1) : l.slice(g);
    i(d, _);
  }
  function o(l) {
    r.length > 0 &&
      (l.enqueue({
        event: t,
        data: r.join(`
`),
        id: n,
        retry: a,
      }),
      (r = []),
      (t = void 0),
      (a = void 0));
  }
  function i(l, c) {
    switch (l) {
      case "event":
        t = c;
        break;
      case "data":
        r.push(c);
        break;
      case "id":
        n = c;
        break;
      case "retry":
        const u = parseInt(c, 10);
        isNaN(u) || (a = u);
        break;
    }
  }
  return new TransformStream({
    transform(l, c) {
      const { lines: u, incompleteLine: d } = ou(e, l);
      e = d;
      for (let g = 0; g < u.length; g++) s(u[g], c);
    },
    flush(l) {
      (s(e, l), o(l));
    },
  });
}
function ou(e, t) {
  const r = [];
  let n = e;
  for (let a = 0; a < t.length; ) {
    const s = t[a++];
    s ===
    `
`
      ? (r.push(n), (n = ""))
      : s === "\r"
        ? (r.push(n),
          (n = ""),
          t[a] ===
            `
` && a++)
        : (n += s);
  }
  return { lines: r, incompleteLine: n };
}
function fr(e) {
  const t = {};
  return (
    e.headers.forEach((r, n) => {
      t[n] = r;
    }),
    t
  );
}
var Tt = ({
    prefix: e,
    size: t = 16,
    alphabet:
      r = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    separator: n = "-",
  } = {}) => {
    const a = Xc(r, t);
    if (e == null) return a;
    if (r.includes(n))
      throw new io({
        argument: "separator",
        message: `The separator "${n}" must not be part of the alphabet "${r}".`,
      });
    return (s) => `${e}${n}${a(s)}`;
  },
  ft = Tt();
function iu(e) {
  return e == null
    ? "unknown error"
    : typeof e == "string"
      ? e
      : e instanceof Error
        ? e.message
        : JSON.stringify(e);
}
function lu(e) {
  return Object.fromEntries(Object.entries(e).filter(([t, r]) => r != null));
}
function Ar(e) {
  return (
    e instanceof Error && (e.name === "AbortError" || e.name === "TimeoutError")
  );
}
function Mo({
  apiKey: e,
  environmentVariableName: t,
  apiKeyParameterName: r = "apiKey",
  description: n,
}) {
  if (typeof e == "string") return e;
  if (e != null) throw new wr({ message: `${n} API key must be a string.` });
  if (typeof process > "u")
    throw new wr({
      message: `${n} API key is missing. Pass it using the '${r}' parameter. Environment variables is not supported in this environment.`,
    });
  if (((e = ru[t]), e == null))
    throw new wr({
      message: `${n} API key is missing. Pass it using the '${r}' parameter or the ${t} environment variable.`,
    });
  if (typeof e != "string")
    throw new wr({
      message: `${n} API key must be a string. The value of the ${t} environment variable is not a string.`,
    });
  return e;
}
var Fr = Symbol.for("vercel.ai.validator");
function cu(e) {
  return { [Fr]: !0, validate: e };
}
function uu(e) {
  return (
    typeof e == "object" &&
    e !== null &&
    Fr in e &&
    e[Fr] === !0 &&
    "validate" in e
  );
}
function du(e) {
  return uu(e) ? e : pu(e);
}
function pu(e) {
  return cu((t) => {
    const r = e.safeParse(t);
    return r.success
      ? { success: !0, value: r.data }
      : { success: !1, error: r.error };
  });
}
function mu({ value: e, schema: t }) {
  const r = at({ value: e, schema: t });
  if (!r.success) throw nt.wrap({ value: e, cause: r.error });
  return r.value;
}
function at({ value: e, schema: t }) {
  const r = du(t);
  try {
    if (r.validate == null) return { success: !0, value: e };
    const n = r.validate(e);
    return n.success
      ? n
      : { success: !1, error: nt.wrap({ value: e, cause: n.error }) };
  } catch (n) {
    return { success: !1, error: nt.wrap({ value: e, cause: n }) };
  }
}
function gu({ text: e, schema: t }) {
  try {
    const r = Jn.parse(e);
    return t == null ? r : mu({ value: r, schema: t });
  } catch (r) {
    throw er.isInstance(r) || nt.isInstance(r)
      ? r
      : new er({ text: e, cause: r });
  }
}
function St({ text: e, schema: t }) {
  try {
    const r = Jn.parse(e);
    if (t == null) return { success: !0, value: r, rawValue: r };
    const n = at({ value: r, schema: t });
    return n.success ? { ...n, rawValue: r } : n;
  } catch (r) {
    return {
      success: !1,
      error: er.isInstance(r) ? r : new er({ text: e, cause: r }),
    };
  }
}
function $a(e) {
  try {
    return (Jn.parse(e), !0);
  } catch {
    return !1;
  }
}
function Yr({ provider: e, providerOptions: t, schema: r }) {
  if ((t == null ? void 0 : t[e]) == null) return;
  const n = at({ value: t[e], schema: r });
  if (!n.success)
    throw new io({
      argument: "providerOptions",
      message: `invalid ${e} provider options`,
      cause: n.error,
    });
  return n.value;
}
var fu = () => globalThis.fetch,
  Be = async ({
    url: e,
    headers: t,
    body: r,
    failedResponseHandler: n,
    successfulResponseHandler: a,
    abortSignal: s,
    fetch: o,
  }) =>
    $o({
      url: e,
      headers: { "Content-Type": "application/json", ...t },
      body: { content: JSON.stringify(r), values: r },
      failedResponseHandler: n,
      successfulResponseHandler: a,
      abortSignal: s,
      fetch: o,
    }),
  hu = async ({
    url: e,
    headers: t,
    formData: r,
    failedResponseHandler: n,
    successfulResponseHandler: a,
    abortSignal: s,
    fetch: o,
  }) =>
    $o({
      url: e,
      headers: t,
      body: { content: r, values: Object.fromEntries(r.entries()) },
      failedResponseHandler: n,
      successfulResponseHandler: a,
      abortSignal: s,
      fetch: o,
    }),
  $o = async ({
    url: e,
    headers: t = {},
    body: r,
    successfulResponseHandler: n,
    failedResponseHandler: a,
    abortSignal: s,
    fetch: o = fu(),
  }) => {
    try {
      const i = await o(e, {
          method: "POST",
          headers: lu(t),
          body: r.content,
          signal: s,
        }),
        l = fr(i);
      if (!i.ok) {
        let c;
        try {
          c = await a({ response: i, url: e, requestBodyValues: r.values });
        } catch (u) {
          throw Ar(u) || Ce.isInstance(u)
            ? u
            : new Ce({
                message: "Failed to process error response",
                cause: u,
                statusCode: i.status,
                url: e,
                responseHeaders: l,
                requestBodyValues: r.values,
              });
        }
        throw c.value;
      }
      try {
        return await n({ response: i, url: e, requestBodyValues: r.values });
      } catch (c) {
        throw c instanceof Error && (Ar(c) || Ce.isInstance(c))
          ? c
          : new Ce({
              message: "Failed to process successful response",
              cause: c,
              statusCode: i.status,
              url: e,
              responseHeaders: l,
              requestBodyValues: r.values,
            });
      }
    } catch (i) {
      if (Ar(i)) throw i;
      if (i instanceof TypeError && i.message === "fetch failed") {
        const l = i.cause;
        if (l != null)
          throw new Ce({
            message: `Cannot connect to API: ${l.message}`,
            cause: l,
            url: e,
            requestBodyValues: r.values,
            isRetryable: !0,
          });
      }
      throw i;
    }
  };
async function yu(e) {
  return (typeof e == "function" && (e = e()), Promise.resolve(e));
}
var Do =
    ({ errorSchema: e, errorToMessage: t, isRetryable: r }) =>
    async ({ response: n, url: a, requestBodyValues: s }) => {
      const o = await n.text(),
        i = fr(n);
      if (o.trim() === "")
        return {
          responseHeaders: i,
          value: new Ce({
            message: n.statusText,
            url: a,
            requestBodyValues: s,
            statusCode: n.status,
            responseHeaders: i,
            responseBody: o,
            isRetryable: r == null ? void 0 : r(n),
          }),
        };
      try {
        const l = gu({ text: o, schema: e });
        return {
          responseHeaders: i,
          value: new Ce({
            message: t(l),
            url: a,
            requestBodyValues: s,
            statusCode: n.status,
            responseHeaders: i,
            responseBody: o,
            data: l,
            isRetryable: r == null ? void 0 : r(n, l),
          }),
        };
      } catch {
        return {
          responseHeaders: i,
          value: new Ce({
            message: n.statusText,
            url: a,
            requestBodyValues: s,
            statusCode: n.status,
            responseHeaders: i,
            responseBody: o,
            isRetryable: r == null ? void 0 : r(n),
          }),
        };
      }
    },
  Xr =
    (e) =>
    async ({ response: t }) => {
      const r = fr(t);
      if (t.body == null) throw new Uc({});
      return {
        responseHeaders: r,
        value: t.body
          .pipeThrough(new TextDecoderStream())
          .pipeThrough(su())
          .pipeThrough(
            new TransformStream({
              transform({ data: n }, a) {
                n !== "[DONE]" && a.enqueue(St({ text: n, schema: e }));
              },
            }),
          ),
      };
    },
  Ct =
    (e) =>
    async ({ response: t, url: r, requestBodyValues: n }) => {
      const a = await t.text(),
        s = St({ text: a, schema: e }),
        o = fr(t);
      if (!s.success)
        throw new Ce({
          message: "Invalid JSON response",
          cause: s.error,
          statusCode: t.status,
          responseHeaders: o,
          responseBody: a,
          url: r,
          requestBodyValues: n,
        });
      return { responseHeaders: o, value: s.value, rawValue: s.rawValue };
    },
  vu =
    () =>
    async ({ response: e, url: t, requestBodyValues: r }) => {
      const n = fr(e);
      if (!e.body)
        throw new Ce({
          message: "Response body is empty",
          url: t,
          requestBodyValues: r,
          statusCode: e.status,
          responseHeaders: n,
          responseBody: void 0,
        });
      try {
        const a = await e.arrayBuffer();
        return { responseHeaders: n, value: new Uint8Array(a) };
      } catch (a) {
        throw new Ce({
          message: "Failed to read response as array buffer",
          url: t,
          requestBodyValues: r,
          statusCode: e.status,
          responseHeaders: n,
          responseBody: void 0,
          cause: a,
        });
      }
    },
  { btoa: _u, atob: bu } = globalThis;
function Qr(e) {
  const t = e.replace(/-/g, "+").replace(/_/g, "/"),
    r = bu(t);
  return Uint8Array.from(r, (n) => n.codePointAt(0));
}
function Ut(e) {
  let t = "";
  for (let r = 0; r < e.length; r++) t += String.fromCodePoint(e[r]);
  return _u(t);
}
function Lo(e) {
  return e == null ? void 0 : e.replace(/\/$/, "");
}
const wu = Symbol("Let zodToJsonSchema decide on which parser to use"),
  Da = {
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
  xu = (e) => (typeof e == "string" ? { ...Da, name: e } : { ...Da, ...e }),
  ku = (e) => {
    const t = xu(e),
      r =
        t.name !== void 0
          ? [...t.basePath, t.definitionPath, t.name]
          : t.basePath;
    return {
      ...t,
      flags: { hasReferencedOpenAiAnyType: !1 },
      currentPath: r,
      propertyPath: void 0,
      seen: new Map(
        Object.entries(t.definitions).map(([n, a]) => [
          a._def,
          {
            def: a._def,
            path: [...t.basePath, t.definitionPath, n],
            jsonSchema: void 0,
          },
        ]),
      ),
    };
  };
function Uo(e, t, r, n) {
  n != null &&
    n.errorMessages &&
    r &&
    (e.errorMessage = { ...e.errorMessage, [t]: r });
}
function ae(e, t, r, n, a) {
  ((e[t] = r), Uo(e, t, n, a));
}
const Fo = (e, t) => {
  let r = 0;
  for (; r < e.length && r < t.length && e[r] === t[r]; r++);
  return [(e.length - r).toString(), ...t.slice(r)].join("/");
};
function be(e) {
  if (e.target !== "openAi") return {};
  const t = [...e.basePath, e.definitionPath, e.openAiAnyTypeName];
  return (
    (e.flags.hasReferencedOpenAiAnyType = !0),
    { $ref: e.$refStrategy === "relative" ? Fo(t, e.currentPath) : t.join("/") }
  );
}
function Au(e, t) {
  var n, a, s;
  const r = { type: "array" };
  return (
    (n = e.type) != null &&
      n._def &&
      ((s = (a = e.type) == null ? void 0 : a._def) == null
        ? void 0
        : s.typeName) !== P.ZodAny &&
      (r.items = ne(e.type._def, {
        ...t,
        currentPath: [...t.currentPath, "items"],
      })),
    e.minLength && ae(r, "minItems", e.minLength.value, e.minLength.message, t),
    e.maxLength && ae(r, "maxItems", e.maxLength.value, e.maxLength.message, t),
    e.exactLength &&
      (ae(r, "minItems", e.exactLength.value, e.exactLength.message, t),
      ae(r, "maxItems", e.exactLength.value, e.exactLength.message, t)),
    r
  );
}
function Su(e, t) {
  const r = { type: "integer", format: "int64" };
  if (!e.checks) return r;
  for (const n of e.checks)
    switch (n.kind) {
      case "min":
        t.target === "jsonSchema7"
          ? n.inclusive
            ? ae(r, "minimum", n.value, n.message, t)
            : ae(r, "exclusiveMinimum", n.value, n.message, t)
          : (n.inclusive || (r.exclusiveMinimum = !0),
            ae(r, "minimum", n.value, n.message, t));
        break;
      case "max":
        t.target === "jsonSchema7"
          ? n.inclusive
            ? ae(r, "maximum", n.value, n.message, t)
            : ae(r, "exclusiveMaximum", n.value, n.message, t)
          : (n.inclusive || (r.exclusiveMaximum = !0),
            ae(r, "maximum", n.value, n.message, t));
        break;
      case "multipleOf":
        ae(r, "multipleOf", n.value, n.message, t);
        break;
    }
  return r;
}
function Tu() {
  return { type: "boolean" };
}
function qo(e, t) {
  return ne(e.type._def, t);
}
const Cu = (e, t) => ne(e.innerType._def, t);
function Bo(e, t, r) {
  const n = r ?? t.dateStrategy;
  if (Array.isArray(n)) return { anyOf: n.map((a, s) => Bo(e, t, a)) };
  switch (n) {
    case "string":
    case "format:date-time":
      return { type: "string", format: "date-time" };
    case "format:date":
      return { type: "string", format: "date" };
    case "integer":
      return Iu(e, t);
  }
}
const Iu = (e, t) => {
  const r = { type: "integer", format: "unix-time" };
  if (t.target === "openApi3") return r;
  for (const n of e.checks)
    switch (n.kind) {
      case "min":
        ae(r, "minimum", n.value, n.message, t);
        break;
      case "max":
        ae(r, "maximum", n.value, n.message, t);
        break;
    }
  return r;
};
function Eu(e, t) {
  return { ...ne(e.innerType._def, t), default: e.defaultValue() };
}
function Ru(e, t) {
  return t.effectStrategy === "input" ? ne(e.schema._def, t) : be(t);
}
function Pu(e) {
  return { type: "string", enum: Array.from(e.values) };
}
const Nu = (e) => ("type" in e && e.type === "string" ? !1 : "allOf" in e);
function Ou(e, t) {
  const r = [
    ne(e.left._def, { ...t, currentPath: [...t.currentPath, "allOf", "0"] }),
    ne(e.right._def, { ...t, currentPath: [...t.currentPath, "allOf", "1"] }),
  ].filter((s) => !!s);
  let n =
    t.target === "jsonSchema2019-09" ? { unevaluatedProperties: !1 } : void 0;
  const a = [];
  return (
    r.forEach((s) => {
      if (Nu(s))
        (a.push(...s.allOf),
          s.unevaluatedProperties === void 0 && (n = void 0));
      else {
        let o = s;
        if ("additionalProperties" in s && s.additionalProperties === !1) {
          const { additionalProperties: i, ...l } = s;
          o = l;
        } else n = void 0;
        a.push(o);
      }
    }),
    a.length ? { allOf: a, ...n } : void 0
  );
}
function ju(e, t) {
  const r = typeof e.value;
  return r !== "bigint" && r !== "number" && r !== "boolean" && r !== "string"
    ? { type: Array.isArray(e.value) ? "array" : "object" }
    : t.target === "openApi3"
      ? { type: r === "bigint" ? "integer" : r, enum: [e.value] }
      : { type: r === "bigint" ? "integer" : r, const: e.value };
}
let dn;
const De = {
  cuid: /^[cC][^\s-]{8,}$/,
  cuid2: /^[0-9a-z]+$/,
  ulid: /^[0-9A-HJKMNP-TV-Z]{26}$/,
  email:
    /^(?!\.)(?!.*\.\.)([a-zA-Z0-9_'+\-\.]*)[a-zA-Z0-9_+-]@([a-zA-Z0-9][a-zA-Z0-9\-]*\.)+[a-zA-Z]{2,}$/,
  emoji: () => (
    dn === void 0 &&
      (dn = RegExp(
        "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$",
        "u",
      )),
    dn
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
function zo(e, t) {
  const r = { type: "string" };
  if (e.checks)
    for (const n of e.checks)
      switch (n.kind) {
        case "min":
          ae(
            r,
            "minLength",
            typeof r.minLength == "number"
              ? Math.max(r.minLength, n.value)
              : n.value,
            n.message,
            t,
          );
          break;
        case "max":
          ae(
            r,
            "maxLength",
            typeof r.maxLength == "number"
              ? Math.min(r.maxLength, n.value)
              : n.value,
            n.message,
            t,
          );
          break;
        case "email":
          switch (t.emailStrategy) {
            case "format:email":
              Le(r, "email", n.message, t);
              break;
            case "format:idn-email":
              Le(r, "idn-email", n.message, t);
              break;
            case "pattern:zod":
              ye(r, De.email, n.message, t);
              break;
          }
          break;
        case "url":
          Le(r, "uri", n.message, t);
          break;
        case "uuid":
          Le(r, "uuid", n.message, t);
          break;
        case "regex":
          ye(r, n.regex, n.message, t);
          break;
        case "cuid":
          ye(r, De.cuid, n.message, t);
          break;
        case "cuid2":
          ye(r, De.cuid2, n.message, t);
          break;
        case "startsWith":
          ye(r, RegExp(`^${pn(n.value, t)}`), n.message, t);
          break;
        case "endsWith":
          ye(r, RegExp(`${pn(n.value, t)}$`), n.message, t);
          break;
        case "datetime":
          Le(r, "date-time", n.message, t);
          break;
        case "date":
          Le(r, "date", n.message, t);
          break;
        case "time":
          Le(r, "time", n.message, t);
          break;
        case "duration":
          Le(r, "duration", n.message, t);
          break;
        case "length":
          (ae(
            r,
            "minLength",
            typeof r.minLength == "number"
              ? Math.max(r.minLength, n.value)
              : n.value,
            n.message,
            t,
          ),
            ae(
              r,
              "maxLength",
              typeof r.maxLength == "number"
                ? Math.min(r.maxLength, n.value)
                : n.value,
              n.message,
              t,
            ));
          break;
        case "includes": {
          ye(r, RegExp(pn(n.value, t)), n.message, t);
          break;
        }
        case "ip": {
          (n.version !== "v6" && Le(r, "ipv4", n.message, t),
            n.version !== "v4" && Le(r, "ipv6", n.message, t));
          break;
        }
        case "base64url":
          ye(r, De.base64url, n.message, t);
          break;
        case "jwt":
          ye(r, De.jwt, n.message, t);
          break;
        case "cidr": {
          (n.version !== "v6" && ye(r, De.ipv4Cidr, n.message, t),
            n.version !== "v4" && ye(r, De.ipv6Cidr, n.message, t));
          break;
        }
        case "emoji":
          ye(r, De.emoji(), n.message, t);
          break;
        case "ulid": {
          ye(r, De.ulid, n.message, t);
          break;
        }
        case "base64": {
          switch (t.base64Strategy) {
            case "format:binary": {
              Le(r, "binary", n.message, t);
              break;
            }
            case "contentEncoding:base64": {
              ae(r, "contentEncoding", "base64", n.message, t);
              break;
            }
            case "pattern:zod": {
              ye(r, De.base64, n.message, t);
              break;
            }
          }
          break;
        }
        case "nanoid":
          ye(r, De.nanoid, n.message, t);
      }
  return r;
}
function pn(e, t) {
  return t.patternStrategy === "escape" ? $u(e) : e;
}
const Mu = new Set(
  "ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvxyz0123456789",
);
function $u(e) {
  let t = "";
  for (let r = 0; r < e.length; r++) (Mu.has(e[r]) || (t += "\\"), (t += e[r]));
  return t;
}
function Le(e, t, r, n) {
  var a;
  e.format || ((a = e.anyOf) != null && a.some((s) => s.format))
    ? (e.anyOf || (e.anyOf = []),
      e.format &&
        (e.anyOf.push({
          format: e.format,
          ...(e.errorMessage &&
            n.errorMessages && {
              errorMessage: { format: e.errorMessage.format },
            }),
        }),
        delete e.format,
        e.errorMessage &&
          (delete e.errorMessage.format,
          Object.keys(e.errorMessage).length === 0 && delete e.errorMessage)),
      e.anyOf.push({
        format: t,
        ...(r && n.errorMessages && { errorMessage: { format: r } }),
      }))
    : ae(e, "format", t, r, n);
}
function ye(e, t, r, n) {
  var a;
  e.pattern || ((a = e.allOf) != null && a.some((s) => s.pattern))
    ? (e.allOf || (e.allOf = []),
      e.pattern &&
        (e.allOf.push({
          pattern: e.pattern,
          ...(e.errorMessage &&
            n.errorMessages && {
              errorMessage: { pattern: e.errorMessage.pattern },
            }),
        }),
        delete e.pattern,
        e.errorMessage &&
          (delete e.errorMessage.pattern,
          Object.keys(e.errorMessage).length === 0 && delete e.errorMessage)),
      e.allOf.push({
        pattern: La(t, n),
        ...(r && n.errorMessages && { errorMessage: { pattern: r } }),
      }))
    : ae(e, "pattern", La(t, n), r, n);
}
function La(e, t) {
  var l;
  if (!t.applyRegexFlags || !e.flags) return e.source;
  const r = {
      i: e.flags.includes("i"),
      m: e.flags.includes("m"),
      s: e.flags.includes("s"),
    },
    n = r.i ? e.source.toLowerCase() : e.source;
  let a = "",
    s = !1,
    o = !1,
    i = !1;
  for (let c = 0; c < n.length; c++) {
    if (s) {
      ((a += n[c]), (s = !1));
      continue;
    }
    if (r.i) {
      if (o) {
        if (n[c].match(/[a-z]/)) {
          i
            ? ((a += n[c]),
              (a += `${n[c - 2]}-${n[c]}`.toUpperCase()),
              (i = !1))
            : n[c + 1] === "-" && (l = n[c + 2]) != null && l.match(/[a-z]/)
              ? ((a += n[c]), (i = !0))
              : (a += `${n[c]}${n[c].toUpperCase()}`);
          continue;
        }
      } else if (n[c].match(/[a-z]/)) {
        a += `[${n[c]}${n[c].toUpperCase()}]`;
        continue;
      }
    }
    if (r.m) {
      if (n[c] === "^") {
        a += `(^|(?<=[\r
]))`;
        continue;
      } else if (n[c] === "$") {
        a += `($|(?=[\r
]))`;
        continue;
      }
    }
    if (r.s && n[c] === ".") {
      a += o
        ? `${n[c]}\r
`
        : `[${n[c]}\r
]`;
      continue;
    }
    ((a += n[c]),
      n[c] === "\\"
        ? (s = !0)
        : o && n[c] === "]"
          ? (o = !1)
          : !o && n[c] === "[" && (o = !0));
  }
  try {
    new RegExp(a);
  } catch {
    return e.source;
  }
  return a;
}
function Zo(e, t) {
  var n, a, s, o, i, l;
  if (
    (t.target,
    t.target === "openApi3" &&
      ((n = e.keyType) == null ? void 0 : n._def.typeName) === P.ZodEnum)
  )
    return {
      type: "object",
      required: e.keyType._def.values,
      properties: e.keyType._def.values.reduce(
        (c, u) => ({
          ...c,
          [u]:
            ne(e.valueType._def, {
              ...t,
              currentPath: [...t.currentPath, "properties", u],
            }) ?? be(t),
        }),
        {},
      ),
      additionalProperties: t.rejectedAdditionalProperties,
    };
  const r = {
    type: "object",
    additionalProperties:
      ne(e.valueType._def, {
        ...t,
        currentPath: [...t.currentPath, "additionalProperties"],
      }) ?? t.allowedAdditionalProperties,
  };
  if (t.target === "openApi3") return r;
  if (
    ((a = e.keyType) == null ? void 0 : a._def.typeName) === P.ZodString &&
    (s = e.keyType._def.checks) != null &&
    s.length
  ) {
    const { type: c, ...u } = zo(e.keyType._def, t);
    return { ...r, propertyNames: u };
  } else {
    if (((o = e.keyType) == null ? void 0 : o._def.typeName) === P.ZodEnum)
      return { ...r, propertyNames: { enum: e.keyType._def.values } };
    if (
      ((i = e.keyType) == null ? void 0 : i._def.typeName) === P.ZodBranded &&
      e.keyType._def.type._def.typeName === P.ZodString &&
      (l = e.keyType._def.type._def.checks) != null &&
      l.length
    ) {
      const { type: c, ...u } = qo(e.keyType._def, t);
      return { ...r, propertyNames: u };
    }
  }
  return r;
}
function Du(e, t) {
  if (t.mapStrategy === "record") return Zo(e, t);
  const r =
      ne(e.keyType._def, {
        ...t,
        currentPath: [...t.currentPath, "items", "items", "0"],
      }) || be(t),
    n =
      ne(e.valueType._def, {
        ...t,
        currentPath: [...t.currentPath, "items", "items", "1"],
      }) || be(t);
  return {
    type: "array",
    maxItems: 125,
    items: { type: "array", items: [r, n], minItems: 2, maxItems: 2 },
  };
}
function Lu(e) {
  const t = e.values,
    n = Object.keys(e.values)
      .filter((s) => typeof t[t[s]] != "number")
      .map((s) => t[s]),
    a = Array.from(new Set(n.map((s) => typeof s)));
  return {
    type:
      a.length === 1
        ? a[0] === "string"
          ? "string"
          : "number"
        : ["string", "number"],
    enum: n,
  };
}
function Uu(e) {
  return e.target === "openAi"
    ? void 0
    : { not: be({ ...e, currentPath: [...e.currentPath, "not"] }) };
}
function Fu(e) {
  return e.target === "openApi3"
    ? { enum: ["null"], nullable: !0 }
    : { type: "null" };
}
const qr = {
  ZodString: "string",
  ZodNumber: "number",
  ZodBigInt: "integer",
  ZodBoolean: "boolean",
  ZodNull: "null",
};
function qu(e, t) {
  if (t.target === "openApi3") return Ua(e, t);
  const r =
    e.options instanceof Map ? Array.from(e.options.values()) : e.options;
  if (
    r.every(
      (n) => n._def.typeName in qr && (!n._def.checks || !n._def.checks.length),
    )
  ) {
    const n = r.reduce((a, s) => {
      const o = qr[s._def.typeName];
      return o && !a.includes(o) ? [...a, o] : a;
    }, []);
    return { type: n.length > 1 ? n : n[0] };
  } else if (
    r.every((n) => n._def.typeName === "ZodLiteral" && !n.description)
  ) {
    const n = r.reduce((a, s) => {
      const o = typeof s._def.value;
      switch (o) {
        case "string":
        case "number":
        case "boolean":
          return [...a, o];
        case "bigint":
          return [...a, "integer"];
        case "object":
          if (s._def.value === null) return [...a, "null"];
        case "symbol":
        case "undefined":
        case "function":
        default:
          return a;
      }
    }, []);
    if (n.length === r.length) {
      const a = n.filter((s, o, i) => i.indexOf(s) === o);
      return {
        type: a.length > 1 ? a : a[0],
        enum: r.reduce(
          (s, o) => (s.includes(o._def.value) ? s : [...s, o._def.value]),
          [],
        ),
      };
    }
  } else if (r.every((n) => n._def.typeName === "ZodEnum"))
    return {
      type: "string",
      enum: r.reduce(
        (n, a) => [...n, ...a._def.values.filter((s) => !n.includes(s))],
        [],
      ),
    };
  return Ua(e, t);
}
const Ua = (e, t) => {
  const r = (
    e.options instanceof Map ? Array.from(e.options.values()) : e.options
  )
    .map((n, a) =>
      ne(n._def, { ...t, currentPath: [...t.currentPath, "anyOf", `${a}`] }),
    )
    .filter(
      (n) =>
        !!n &&
        (!t.strictUnions ||
          (typeof n == "object" && Object.keys(n).length > 0)),
    );
  return r.length ? { anyOf: r } : void 0;
};
function Bu(e, t) {
  if (
    ["ZodString", "ZodNumber", "ZodBigInt", "ZodBoolean", "ZodNull"].includes(
      e.innerType._def.typeName,
    ) &&
    (!e.innerType._def.checks || !e.innerType._def.checks.length)
  )
    return t.target === "openApi3"
      ? { type: qr[e.innerType._def.typeName], nullable: !0 }
      : { type: [qr[e.innerType._def.typeName], "null"] };
  if (t.target === "openApi3") {
    const n = ne(e.innerType._def, { ...t, currentPath: [...t.currentPath] });
    return n && "$ref" in n
      ? { allOf: [n], nullable: !0 }
      : n && { ...n, nullable: !0 };
  }
  const r = ne(e.innerType._def, {
    ...t,
    currentPath: [...t.currentPath, "anyOf", "0"],
  });
  return r && { anyOf: [r, { type: "null" }] };
}
function zu(e, t) {
  const r = { type: "number" };
  if (!e.checks) return r;
  for (const n of e.checks)
    switch (n.kind) {
      case "int":
        ((r.type = "integer"), Uo(r, "type", n.message, t));
        break;
      case "min":
        t.target === "jsonSchema7"
          ? n.inclusive
            ? ae(r, "minimum", n.value, n.message, t)
            : ae(r, "exclusiveMinimum", n.value, n.message, t)
          : (n.inclusive || (r.exclusiveMinimum = !0),
            ae(r, "minimum", n.value, n.message, t));
        break;
      case "max":
        t.target === "jsonSchema7"
          ? n.inclusive
            ? ae(r, "maximum", n.value, n.message, t)
            : ae(r, "exclusiveMaximum", n.value, n.message, t)
          : (n.inclusive || (r.exclusiveMaximum = !0),
            ae(r, "maximum", n.value, n.message, t));
        break;
      case "multipleOf":
        ae(r, "multipleOf", n.value, n.message, t);
        break;
    }
  return r;
}
function Zu(e, t) {
  const r = t.target === "openAi",
    n = { type: "object", properties: {} },
    a = [],
    s = e.shape();
  for (const i in s) {
    let l = s[i];
    if (l === void 0 || l._def === void 0) continue;
    let c = Ju(l);
    c &&
      r &&
      (l._def.typeName === "ZodOptional" && (l = l._def.innerType),
      l.isNullable() || (l = l.nullable()),
      (c = !1));
    const u = ne(l._def, {
      ...t,
      currentPath: [...t.currentPath, "properties", i],
      propertyPath: [...t.currentPath, "properties", i],
    });
    u !== void 0 && ((n.properties[i] = u), c || a.push(i));
  }
  a.length && (n.required = a);
  const o = Vu(e, t);
  return (o !== void 0 && (n.additionalProperties = o), n);
}
function Vu(e, t) {
  if (e.catchall._def.typeName !== "ZodNever")
    return ne(e.catchall._def, {
      ...t,
      currentPath: [...t.currentPath, "additionalProperties"],
    });
  switch (e.unknownKeys) {
    case "passthrough":
      return t.allowedAdditionalProperties;
    case "strict":
      return t.rejectedAdditionalProperties;
    case "strip":
      return t.removeAdditionalStrategy === "strict"
        ? t.allowedAdditionalProperties
        : t.rejectedAdditionalProperties;
  }
}
function Ju(e) {
  try {
    return e.isOptional();
  } catch {
    return !0;
  }
}
const Hu = (e, t) => {
    var n;
    if (
      t.currentPath.toString() ===
      ((n = t.propertyPath) == null ? void 0 : n.toString())
    )
      return ne(e.innerType._def, t);
    const r = ne(e.innerType._def, {
      ...t,
      currentPath: [...t.currentPath, "anyOf", "1"],
    });
    return r ? { anyOf: [{ not: be(t) }, r] } : be(t);
  },
  Wu = (e, t) => {
    if (t.pipeStrategy === "input") return ne(e.in._def, t);
    if (t.pipeStrategy === "output") return ne(e.out._def, t);
    const r = ne(e.in._def, {
        ...t,
        currentPath: [...t.currentPath, "allOf", "0"],
      }),
      n = ne(e.out._def, {
        ...t,
        currentPath: [...t.currentPath, "allOf", r ? "1" : "0"],
      });
    return { allOf: [r, n].filter((a) => a !== void 0) };
  };
function Gu(e, t) {
  return ne(e.type._def, t);
}
function Ku(e, t) {
  const n = {
    type: "array",
    uniqueItems: !0,
    items: ne(e.valueType._def, {
      ...t,
      currentPath: [...t.currentPath, "items"],
    }),
  };
  return (
    e.minSize && ae(n, "minItems", e.minSize.value, e.minSize.message, t),
    e.maxSize && ae(n, "maxItems", e.maxSize.value, e.maxSize.message, t),
    n
  );
}
function Yu(e, t) {
  return e.rest
    ? {
        type: "array",
        minItems: e.items.length,
        items: e.items
          .map((r, n) =>
            ne(r._def, {
              ...t,
              currentPath: [...t.currentPath, "items", `${n}`],
            }),
          )
          .reduce((r, n) => (n === void 0 ? r : [...r, n]), []),
        additionalItems: ne(e.rest._def, {
          ...t,
          currentPath: [...t.currentPath, "additionalItems"],
        }),
      }
    : {
        type: "array",
        minItems: e.items.length,
        maxItems: e.items.length,
        items: e.items
          .map((r, n) =>
            ne(r._def, {
              ...t,
              currentPath: [...t.currentPath, "items", `${n}`],
            }),
          )
          .reduce((r, n) => (n === void 0 ? r : [...r, n]), []),
      };
}
function Xu(e) {
  return { not: be(e) };
}
function Qu(e) {
  return be(e);
}
const ed = (e, t) => ne(e.innerType._def, t),
  td = (e, t, r) => {
    switch (t) {
      case P.ZodString:
        return zo(e, r);
      case P.ZodNumber:
        return zu(e, r);
      case P.ZodObject:
        return Zu(e, r);
      case P.ZodBigInt:
        return Su(e, r);
      case P.ZodBoolean:
        return Tu();
      case P.ZodDate:
        return Bo(e, r);
      case P.ZodUndefined:
        return Xu(r);
      case P.ZodNull:
        return Fu(r);
      case P.ZodArray:
        return Au(e, r);
      case P.ZodUnion:
      case P.ZodDiscriminatedUnion:
        return qu(e, r);
      case P.ZodIntersection:
        return Ou(e, r);
      case P.ZodTuple:
        return Yu(e, r);
      case P.ZodRecord:
        return Zo(e, r);
      case P.ZodLiteral:
        return ju(e, r);
      case P.ZodEnum:
        return Pu(e);
      case P.ZodNativeEnum:
        return Lu(e);
      case P.ZodNullable:
        return Bu(e, r);
      case P.ZodOptional:
        return Hu(e, r);
      case P.ZodMap:
        return Du(e, r);
      case P.ZodSet:
        return Ku(e, r);
      case P.ZodLazy:
        return () => e.getter()._def;
      case P.ZodPromise:
        return Gu(e, r);
      case P.ZodNaN:
      case P.ZodNever:
        return Uu(r);
      case P.ZodEffects:
        return Ru(e, r);
      case P.ZodAny:
        return be(r);
      case P.ZodUnknown:
        return Qu(r);
      case P.ZodDefault:
        return Eu(e, r);
      case P.ZodBranded:
        return qo(e, r);
      case P.ZodReadonly:
        return ed(e, r);
      case P.ZodCatch:
        return Cu(e, r);
      case P.ZodPipeline:
        return Wu(e, r);
      case P.ZodFunction:
      case P.ZodVoid:
      case P.ZodSymbol:
        return;
      default:
        return ((n) => {})();
    }
  };
function ne(e, t, r = !1) {
  var i;
  const n = t.seen.get(e);
  if (t.override) {
    const l = (i = t.override) == null ? void 0 : i.call(t, e, t, n, r);
    if (l !== wu) return l;
  }
  if (n && !r) {
    const l = rd(n, t);
    if (l !== void 0) return l;
  }
  const a = { def: e, path: t.currentPath, jsonSchema: void 0 };
  t.seen.set(e, a);
  const s = td(e, e.typeName, t),
    o = typeof s == "function" ? ne(s(), t) : s;
  if ((o && nd(e, t, o), t.postProcess)) {
    const l = t.postProcess(o, e, t);
    return ((a.jsonSchema = o), l);
  }
  return ((a.jsonSchema = o), o);
}
const rd = (e, t) => {
    switch (t.$refStrategy) {
      case "root":
        return { $ref: e.path.join("/") };
      case "relative":
        return { $ref: Fo(t.currentPath, e.path) };
      case "none":
      case "seen":
        return (e.path.length < t.currentPath.length &&
          e.path.every((r, n) => t.currentPath[n] === r)) ||
          t.$refStrategy === "seen"
          ? be(t)
          : void 0;
    }
  },
  nd = (e, t, r) => (
    e.description &&
      ((r.description = e.description),
      t.markdownDescription && (r.markdownDescription = e.description)),
    r
  ),
  ad = (e, t) => {
    const r = ku(t);
    let n =
      typeof t == "object" && t.definitions
        ? Object.entries(t.definitions).reduce(
            (l, [c, u]) => ({
              ...l,
              [c]:
                ne(
                  u._def,
                  { ...r, currentPath: [...r.basePath, r.definitionPath, c] },
                  !0,
                ) ?? be(r),
            }),
            {},
          )
        : void 0;
    const a =
        typeof t == "string"
          ? t
          : (t == null ? void 0 : t.nameStrategy) === "title" || t == null
            ? void 0
            : t.name,
      s =
        ne(
          e._def,
          a === void 0
            ? r
            : { ...r, currentPath: [...r.basePath, r.definitionPath, a] },
          !1,
        ) ?? be(r),
      o =
        typeof t == "object" && t.name !== void 0 && t.nameStrategy === "title"
          ? t.name
          : void 0;
    (o !== void 0 && (s.title = o),
      r.flags.hasReferencedOpenAiAnyType &&
        (n || (n = {}),
        n[r.openAiAnyTypeName] ||
          (n[r.openAiAnyTypeName] = {
            type: ["string", "number", "integer", "boolean", "array", "null"],
            items: {
              $ref:
                r.$refStrategy === "relative"
                  ? "1"
                  : [...r.basePath, r.definitionPath, r.openAiAnyTypeName].join(
                      "/",
                    ),
            },
          })));
    const i =
      a === void 0
        ? n
          ? { ...s, [r.definitionPath]: n }
          : s
        : {
            $ref: [
              ...(r.$refStrategy === "relative" ? [] : r.basePath),
              r.definitionPath,
              a,
            ].join("/"),
            [r.definitionPath]: { ...n, [a]: s },
          };
    return (
      r.target === "jsonSchema7"
        ? (i.$schema = "http://json-schema.org/draft-07/schema#")
        : (r.target === "jsonSchema2019-09" || r.target === "openAi") &&
          (i.$schema = "https://json-schema.org/draft/2019-09/schema#"),
      r.target === "openAi" &&
        ("anyOf" in i ||
          "oneOf" in i ||
          "allOf" in i ||
          ("type" in i && Array.isArray(i.type))),
      i
    );
  };
var tr = {
    code: "0",
    name: "text",
    parse: (e) => {
      if (typeof e != "string")
        throw new Error('"text" parts expect a string value.');
      return { type: "text", value: e };
    },
  },
  rr = {
    code: "3",
    name: "error",
    parse: (e) => {
      if (typeof e != "string")
        throw new Error('"error" parts expect a string value.');
      return { type: "error", value: e };
    },
  },
  nr = {
    code: "4",
    name: "assistant_message",
    parse: (e) => {
      if (
        e == null ||
        typeof e != "object" ||
        !("id" in e) ||
        !("role" in e) ||
        !("content" in e) ||
        typeof e.id != "string" ||
        typeof e.role != "string" ||
        e.role !== "assistant" ||
        !Array.isArray(e.content) ||
        !e.content.every(
          (t) =>
            t != null &&
            typeof t == "object" &&
            "type" in t &&
            t.type === "text" &&
            "text" in t &&
            t.text != null &&
            typeof t.text == "object" &&
            "value" in t.text &&
            typeof t.text.value == "string",
        )
      )
        throw new Error(
          '"assistant_message" parts expect an object with an "id", "role", and "content" property.',
        );
      return { type: "assistant_message", value: e };
    },
  },
  ar = {
    code: "5",
    name: "assistant_control_data",
    parse: (e) => {
      if (
        e == null ||
        typeof e != "object" ||
        !("threadId" in e) ||
        !("messageId" in e) ||
        typeof e.threadId != "string" ||
        typeof e.messageId != "string"
      )
        throw new Error(
          '"assistant_control_data" parts expect an object with a "threadId" and "messageId" property.',
        );
      return {
        type: "assistant_control_data",
        value: { threadId: e.threadId, messageId: e.messageId },
      };
    },
  },
  sr = {
    code: "6",
    name: "data_message",
    parse: (e) => {
      if (
        e == null ||
        typeof e != "object" ||
        !("role" in e) ||
        !("data" in e) ||
        typeof e.role != "string" ||
        e.role !== "data"
      )
        throw new Error(
          '"data_message" parts expect an object with a "role" and "data" property.',
        );
      return { type: "data_message", value: e };
    },
  },
  sd = [tr, rr, nr, ar, sr];
(tr.code + "", rr.code + "", nr.code + "", ar.code + "", sr.code + "");
(tr.name + "",
  tr.code,
  rr.name + "",
  rr.code,
  nr.name + "",
  nr.code,
  ar.name + "",
  ar.code,
  sr.name + "",
  sr.code);
sd.map((e) => e.code);
function od(e) {
  const t = ["ROOT"];
  let r = -1,
    n = null;
  function a(l, c, u) {
    switch (l) {
      case '"': {
        ((r = c), t.pop(), t.push(u), t.push("INSIDE_STRING"));
        break;
      }
      case "f":
      case "t":
      case "n": {
        ((r = c), (n = c), t.pop(), t.push(u), t.push("INSIDE_LITERAL"));
        break;
      }
      case "-": {
        (t.pop(), t.push(u), t.push("INSIDE_NUMBER"));
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
        ((r = c), t.pop(), t.push(u), t.push("INSIDE_NUMBER"));
        break;
      }
      case "{": {
        ((r = c), t.pop(), t.push(u), t.push("INSIDE_OBJECT_START"));
        break;
      }
      case "[": {
        ((r = c), t.pop(), t.push(u), t.push("INSIDE_ARRAY_START"));
        break;
      }
    }
  }
  function s(l, c) {
    switch (l) {
      case ",": {
        (t.pop(), t.push("INSIDE_OBJECT_AFTER_COMMA"));
        break;
      }
      case "}": {
        ((r = c), t.pop());
        break;
      }
    }
  }
  function o(l, c) {
    switch (l) {
      case ",": {
        (t.pop(), t.push("INSIDE_ARRAY_AFTER_COMMA"));
        break;
      }
      case "]": {
        ((r = c), t.pop());
        break;
      }
    }
  }
  for (let l = 0; l < e.length; l++) {
    const c = e[l];
    switch (t[t.length - 1]) {
      case "ROOT":
        a(c, l, "FINISH");
        break;
      case "INSIDE_OBJECT_START": {
        switch (c) {
          case '"': {
            (t.pop(), t.push("INSIDE_OBJECT_KEY"));
            break;
          }
          case "}": {
            ((r = l), t.pop());
            break;
          }
        }
        break;
      }
      case "INSIDE_OBJECT_AFTER_COMMA": {
        switch (c) {
          case '"': {
            (t.pop(), t.push("INSIDE_OBJECT_KEY"));
            break;
          }
        }
        break;
      }
      case "INSIDE_OBJECT_KEY": {
        switch (c) {
          case '"': {
            (t.pop(), t.push("INSIDE_OBJECT_AFTER_KEY"));
            break;
          }
        }
        break;
      }
      case "INSIDE_OBJECT_AFTER_KEY": {
        switch (c) {
          case ":": {
            (t.pop(), t.push("INSIDE_OBJECT_BEFORE_VALUE"));
            break;
          }
        }
        break;
      }
      case "INSIDE_OBJECT_BEFORE_VALUE": {
        a(c, l, "INSIDE_OBJECT_AFTER_VALUE");
        break;
      }
      case "INSIDE_OBJECT_AFTER_VALUE": {
        s(c, l);
        break;
      }
      case "INSIDE_STRING": {
        switch (c) {
          case '"': {
            (t.pop(), (r = l));
            break;
          }
          case "\\": {
            t.push("INSIDE_STRING_ESCAPE");
            break;
          }
          default:
            r = l;
        }
        break;
      }
      case "INSIDE_ARRAY_START": {
        switch (c) {
          case "]": {
            ((r = l), t.pop());
            break;
          }
          default: {
            ((r = l), a(c, l, "INSIDE_ARRAY_AFTER_VALUE"));
            break;
          }
        }
        break;
      }
      case "INSIDE_ARRAY_AFTER_VALUE": {
        switch (c) {
          case ",": {
            (t.pop(), t.push("INSIDE_ARRAY_AFTER_COMMA"));
            break;
          }
          case "]": {
            ((r = l), t.pop());
            break;
          }
          default: {
            r = l;
            break;
          }
        }
        break;
      }
      case "INSIDE_ARRAY_AFTER_COMMA": {
        a(c, l, "INSIDE_ARRAY_AFTER_VALUE");
        break;
      }
      case "INSIDE_STRING_ESCAPE": {
        (t.pop(), (r = l));
        break;
      }
      case "INSIDE_NUMBER": {
        switch (c) {
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
            r = l;
            break;
          }
          case "e":
          case "E":
          case "-":
          case ".":
            break;
          case ",": {
            (t.pop(),
              t[t.length - 1] === "INSIDE_ARRAY_AFTER_VALUE" && o(c, l),
              t[t.length - 1] === "INSIDE_OBJECT_AFTER_VALUE" && s(c, l));
            break;
          }
          case "}": {
            (t.pop(),
              t[t.length - 1] === "INSIDE_OBJECT_AFTER_VALUE" && s(c, l));
            break;
          }
          case "]": {
            (t.pop(),
              t[t.length - 1] === "INSIDE_ARRAY_AFTER_VALUE" && o(c, l));
            break;
          }
          default: {
            t.pop();
            break;
          }
        }
        break;
      }
      case "INSIDE_LITERAL": {
        const d = e.substring(n, l + 1);
        !"false".startsWith(d) && !"true".startsWith(d) && !"null".startsWith(d)
          ? (t.pop(),
            t[t.length - 1] === "INSIDE_OBJECT_AFTER_VALUE"
              ? s(c, l)
              : t[t.length - 1] === "INSIDE_ARRAY_AFTER_VALUE" && o(c, l))
          : (r = l);
        break;
      }
    }
  }
  let i = e.slice(0, r + 1);
  for (let l = t.length - 1; l >= 0; l--)
    switch (t[l]) {
      case "INSIDE_STRING": {
        i += '"';
        break;
      }
      case "INSIDE_OBJECT_KEY":
      case "INSIDE_OBJECT_AFTER_KEY":
      case "INSIDE_OBJECT_AFTER_COMMA":
      case "INSIDE_OBJECT_START":
      case "INSIDE_OBJECT_BEFORE_VALUE":
      case "INSIDE_OBJECT_AFTER_VALUE": {
        i += "}";
        break;
      }
      case "INSIDE_ARRAY_START":
      case "INSIDE_ARRAY_AFTER_COMMA":
      case "INSIDE_ARRAY_AFTER_VALUE": {
        i += "]";
        break;
      }
      case "INSIDE_LITERAL": {
        const u = e.substring(n, e.length);
        "true".startsWith(u)
          ? (i += "true".slice(u.length))
          : "false".startsWith(u)
            ? (i += "false".slice(u.length))
            : "null".startsWith(u) && (i += "null".slice(u.length));
      }
    }
  return i;
}
function id(e) {
  if (e === void 0) return { value: void 0, state: "undefined-input" };
  let t = St({ text: e });
  return t.success
    ? { value: t.value, state: "successful-parse" }
    : ((t = St({ text: od(e) })),
      t.success
        ? { value: t.value, state: "repaired-parse" }
        : { value: void 0, state: "failed-parse" });
}
var ld = {
    code: "0",
    name: "text",
    parse: (e) => {
      if (typeof e != "string")
        throw new Error('"text" parts expect a string value.');
      return { type: "text", value: e };
    },
  },
  cd = {
    code: "2",
    name: "data",
    parse: (e) => {
      if (!Array.isArray(e))
        throw new Error('"data" parts expect an array value.');
      return { type: "data", value: e };
    },
  },
  ud = {
    code: "3",
    name: "error",
    parse: (e) => {
      if (typeof e != "string")
        throw new Error('"error" parts expect a string value.');
      return { type: "error", value: e };
    },
  },
  dd = {
    code: "8",
    name: "message_annotations",
    parse: (e) => {
      if (!Array.isArray(e))
        throw new Error('"message_annotations" parts expect an array value.');
      return { type: "message_annotations", value: e };
    },
  },
  pd = {
    code: "9",
    name: "tool_call",
    parse: (e) => {
      if (
        e == null ||
        typeof e != "object" ||
        !("toolCallId" in e) ||
        typeof e.toolCallId != "string" ||
        !("toolName" in e) ||
        typeof e.toolName != "string" ||
        !("args" in e) ||
        typeof e.args != "object"
      )
        throw new Error(
          '"tool_call" parts expect an object with a "toolCallId", "toolName", and "args" property.',
        );
      return { type: "tool_call", value: e };
    },
  },
  md = {
    code: "a",
    name: "tool_result",
    parse: (e) => {
      if (
        e == null ||
        typeof e != "object" ||
        !("toolCallId" in e) ||
        typeof e.toolCallId != "string" ||
        !("result" in e)
      )
        throw new Error(
          '"tool_result" parts expect an object with a "toolCallId" and a "result" property.',
        );
      return { type: "tool_result", value: e };
    },
  },
  gd = {
    code: "b",
    name: "tool_call_streaming_start",
    parse: (e) => {
      if (
        e == null ||
        typeof e != "object" ||
        !("toolCallId" in e) ||
        typeof e.toolCallId != "string" ||
        !("toolName" in e) ||
        typeof e.toolName != "string"
      )
        throw new Error(
          '"tool_call_streaming_start" parts expect an object with a "toolCallId" and "toolName" property.',
        );
      return { type: "tool_call_streaming_start", value: e };
    },
  },
  fd = {
    code: "c",
    name: "tool_call_delta",
    parse: (e) => {
      if (
        e == null ||
        typeof e != "object" ||
        !("toolCallId" in e) ||
        typeof e.toolCallId != "string" ||
        !("argsTextDelta" in e) ||
        typeof e.argsTextDelta != "string"
      )
        throw new Error(
          '"tool_call_delta" parts expect an object with a "toolCallId" and "argsTextDelta" property.',
        );
      return { type: "tool_call_delta", value: e };
    },
  },
  hd = {
    code: "d",
    name: "finish_message",
    parse: (e) => {
      if (
        e == null ||
        typeof e != "object" ||
        !("finishReason" in e) ||
        typeof e.finishReason != "string"
      )
        throw new Error(
          '"finish_message" parts expect an object with a "finishReason" property.',
        );
      const t = { finishReason: e.finishReason };
      return (
        "usage" in e &&
          e.usage != null &&
          typeof e.usage == "object" &&
          "promptTokens" in e.usage &&
          "completionTokens" in e.usage &&
          (t.usage = {
            promptTokens:
              typeof e.usage.promptTokens == "number"
                ? e.usage.promptTokens
                : Number.NaN,
            completionTokens:
              typeof e.usage.completionTokens == "number"
                ? e.usage.completionTokens
                : Number.NaN,
          }),
        { type: "finish_message", value: t }
      );
    },
  },
  yd = {
    code: "e",
    name: "finish_step",
    parse: (e) => {
      if (
        e == null ||
        typeof e != "object" ||
        !("finishReason" in e) ||
        typeof e.finishReason != "string"
      )
        throw new Error(
          '"finish_step" parts expect an object with a "finishReason" property.',
        );
      const t = { finishReason: e.finishReason, isContinued: !1 };
      return (
        "usage" in e &&
          e.usage != null &&
          typeof e.usage == "object" &&
          "promptTokens" in e.usage &&
          "completionTokens" in e.usage &&
          (t.usage = {
            promptTokens:
              typeof e.usage.promptTokens == "number"
                ? e.usage.promptTokens
                : Number.NaN,
            completionTokens:
              typeof e.usage.completionTokens == "number"
                ? e.usage.completionTokens
                : Number.NaN,
          }),
        "isContinued" in e &&
          typeof e.isContinued == "boolean" &&
          (t.isContinued = e.isContinued),
        { type: "finish_step", value: t }
      );
    },
  },
  vd = {
    code: "f",
    name: "start_step",
    parse: (e) => {
      if (
        e == null ||
        typeof e != "object" ||
        !("messageId" in e) ||
        typeof e.messageId != "string"
      )
        throw new Error(
          '"start_step" parts expect an object with an "id" property.',
        );
      return { type: "start_step", value: { messageId: e.messageId } };
    },
  },
  _d = {
    code: "g",
    name: "reasoning",
    parse: (e) => {
      if (typeof e != "string")
        throw new Error('"reasoning" parts expect a string value.');
      return { type: "reasoning", value: e };
    },
  },
  bd = {
    code: "h",
    name: "source",
    parse: (e) => {
      if (e == null || typeof e != "object")
        throw new Error('"source" parts expect a Source object.');
      return { type: "source", value: e };
    },
  },
  wd = {
    code: "i",
    name: "redacted_reasoning",
    parse: (e) => {
      if (
        e == null ||
        typeof e != "object" ||
        !("data" in e) ||
        typeof e.data != "string"
      )
        throw new Error(
          '"redacted_reasoning" parts expect an object with a "data" property.',
        );
      return { type: "redacted_reasoning", value: { data: e.data } };
    },
  },
  xd = {
    code: "j",
    name: "reasoning_signature",
    parse: (e) => {
      if (
        e == null ||
        typeof e != "object" ||
        !("signature" in e) ||
        typeof e.signature != "string"
      )
        throw new Error(
          '"reasoning_signature" parts expect an object with a "signature" property.',
        );
      return { type: "reasoning_signature", value: { signature: e.signature } };
    },
  },
  kd = {
    code: "k",
    name: "file",
    parse: (e) => {
      if (
        e == null ||
        typeof e != "object" ||
        !("data" in e) ||
        typeof e.data != "string" ||
        !("mimeType" in e) ||
        typeof e.mimeType != "string"
      )
        throw new Error(
          '"file" parts expect an object with a "data" and "mimeType" property.',
        );
      return { type: "file", value: e };
    },
  },
  en = [ld, cd, ud, dd, pd, md, gd, fd, hd, yd, vd, _d, bd, wd, xd, kd];
Object.fromEntries(en.map((e) => [e.code, e]));
Object.fromEntries(en.map((e) => [e.name, e.code]));
en.map((e) => e.code);
function Vo(e, t) {
  const r = en.find((n) => n.name === e);
  if (!r) throw new Error(`Invalid stream part type: ${e}`);
  return `${r.code}:${JSON.stringify(t)}
`;
}
function Ad(e, t) {
  var r;
  const n = (r = void 0) != null ? r : !1;
  return Sd(
    ad(e, { $refStrategy: n ? "root" : "none", target: "jsonSchema7" }),
    {
      validate: (a) => {
        const s = e.safeParse(a);
        return s.success
          ? { success: !0, value: s.data }
          : { success: !1, error: s.error };
      },
    },
  );
}
var Rn = Symbol.for("vercel.ai.schema");
function Sd(e, { validate: t } = {}) {
  return { [Rn]: !0, _type: void 0, [Fr]: !0, jsonSchema: e, validate: t };
}
function Td(e) {
  return (
    typeof e == "object" &&
    e !== null &&
    Rn in e &&
    e[Rn] === !0 &&
    "jsonSchema" in e &&
    "validate" in e
  );
}
function Ft(e) {
  return Td(e) ? e : Ad(e);
}
var Cd =
    typeof globalThis == "object"
      ? globalThis
      : typeof self == "object"
        ? self
        : typeof window == "object"
          ? window
          : typeof global == "object"
            ? global
            : {},
  yt = "1.9.0",
  Fa = /^(\d+)\.(\d+)\.(\d+)(-(.+))?$/;
function Id(e) {
  var t = new Set([e]),
    r = new Set(),
    n = e.match(Fa);
  if (!n)
    return function () {
      return !1;
    };
  var a = { major: +n[1], minor: +n[2], patch: +n[3], prerelease: n[4] };
  if (a.prerelease != null)
    return function (l) {
      return l === e;
    };
  function s(i) {
    return (r.add(i), !1);
  }
  function o(i) {
    return (t.add(i), !0);
  }
  return function (l) {
    if (t.has(l)) return !0;
    if (r.has(l)) return !1;
    var c = l.match(Fa);
    if (!c) return s(l);
    var u = { major: +c[1], minor: +c[2], patch: +c[3], prerelease: c[4] };
    return u.prerelease != null || a.major !== u.major
      ? s(l)
      : a.major === 0
        ? a.minor === u.minor && a.patch <= u.patch
          ? o(l)
          : s(l)
        : a.minor <= u.minor
          ? o(l)
          : s(l);
  };
}
var Ed = Id(yt),
  Rd = yt.split(".")[0],
  or = Symbol.for("opentelemetry.js.api." + Rd),
  ir = Cd;
function Hn(e, t, r, n) {
  var a;
  n === void 0 && (n = !1);
  var s = (ir[or] =
    (a = ir[or]) !== null && a !== void 0 ? a : { version: yt });
  if (!n && s[e]) {
    var o = new Error(
      "@opentelemetry/api: Attempted duplicate registration of API: " + e,
    );
    return (r.error(o.stack || o.message), !1);
  }
  if (s.version !== yt) {
    var o = new Error(
      "@opentelemetry/api: Registration of version v" +
        s.version +
        " for " +
        e +
        " does not match previously registered API v" +
        yt,
    );
    return (r.error(o.stack || o.message), !1);
  }
  return (
    (s[e] = t),
    r.debug(
      "@opentelemetry/api: Registered a global for " + e + " v" + yt + ".",
    ),
    !0
  );
}
function lr(e) {
  var t,
    r,
    n = (t = ir[or]) === null || t === void 0 ? void 0 : t.version;
  if (!(!n || !Ed(n)))
    return (r = ir[or]) === null || r === void 0 ? void 0 : r[e];
}
function Wn(e, t) {
  t.debug(
    "@opentelemetry/api: Unregistering a global for " + e + " v" + yt + ".",
  );
  var r = ir[or];
  r && delete r[e];
}
var Pd = function (e, t) {
    var r = typeof Symbol == "function" && e[Symbol.iterator];
    if (!r) return e;
    var n = r.call(e),
      a,
      s = [],
      o;
    try {
      for (; (t === void 0 || t-- > 0) && !(a = n.next()).done; )
        s.push(a.value);
    } catch (i) {
      o = { error: i };
    } finally {
      try {
        a && !a.done && (r = n.return) && r.call(n);
      } finally {
        if (o) throw o.error;
      }
    }
    return s;
  },
  Nd = function (e, t, r) {
    if (r || arguments.length === 2)
      for (var n = 0, a = t.length, s; n < a; n++)
        (s || !(n in t)) &&
          (s || (s = Array.prototype.slice.call(t, 0, n)), (s[n] = t[n]));
    return e.concat(s || Array.prototype.slice.call(t));
  },
  Od = (function () {
    function e(t) {
      this._namespace = t.namespace || "DiagComponentLogger";
    }
    return (
      (e.prototype.debug = function () {
        for (var t = [], r = 0; r < arguments.length; r++) t[r] = arguments[r];
        return Zt("debug", this._namespace, t);
      }),
      (e.prototype.error = function () {
        for (var t = [], r = 0; r < arguments.length; r++) t[r] = arguments[r];
        return Zt("error", this._namespace, t);
      }),
      (e.prototype.info = function () {
        for (var t = [], r = 0; r < arguments.length; r++) t[r] = arguments[r];
        return Zt("info", this._namespace, t);
      }),
      (e.prototype.warn = function () {
        for (var t = [], r = 0; r < arguments.length; r++) t[r] = arguments[r];
        return Zt("warn", this._namespace, t);
      }),
      (e.prototype.verbose = function () {
        for (var t = [], r = 0; r < arguments.length; r++) t[r] = arguments[r];
        return Zt("verbose", this._namespace, t);
      }),
      e
    );
  })();
function Zt(e, t, r) {
  var n = lr("diag");
  if (n) return (r.unshift(t), n[e].apply(n, Nd([], Pd(r), !1)));
}
var Te;
(function (e) {
  ((e[(e.NONE = 0)] = "NONE"),
    (e[(e.ERROR = 30)] = "ERROR"),
    (e[(e.WARN = 50)] = "WARN"),
    (e[(e.INFO = 60)] = "INFO"),
    (e[(e.DEBUG = 70)] = "DEBUG"),
    (e[(e.VERBOSE = 80)] = "VERBOSE"),
    (e[(e.ALL = 9999)] = "ALL"));
})(Te || (Te = {}));
function jd(e, t) {
  (e < Te.NONE ? (e = Te.NONE) : e > Te.ALL && (e = Te.ALL), (t = t || {}));
  function r(n, a) {
    var s = t[n];
    return typeof s == "function" && e >= a ? s.bind(t) : function () {};
  }
  return {
    error: r("error", Te.ERROR),
    warn: r("warn", Te.WARN),
    info: r("info", Te.INFO),
    debug: r("debug", Te.DEBUG),
    verbose: r("verbose", Te.VERBOSE),
  };
}
var Md = function (e, t) {
    var r = typeof Symbol == "function" && e[Symbol.iterator];
    if (!r) return e;
    var n = r.call(e),
      a,
      s = [],
      o;
    try {
      for (; (t === void 0 || t-- > 0) && !(a = n.next()).done; )
        s.push(a.value);
    } catch (i) {
      o = { error: i };
    } finally {
      try {
        a && !a.done && (r = n.return) && r.call(n);
      } finally {
        if (o) throw o.error;
      }
    }
    return s;
  },
  $d = function (e, t, r) {
    if (r || arguments.length === 2)
      for (var n = 0, a = t.length, s; n < a; n++)
        (s || !(n in t)) &&
          (s || (s = Array.prototype.slice.call(t, 0, n)), (s[n] = t[n]));
    return e.concat(s || Array.prototype.slice.call(t));
  },
  Dd = "diag",
  Br = (function () {
    function e() {
      function t(a) {
        return function () {
          for (var s = [], o = 0; o < arguments.length; o++)
            s[o] = arguments[o];
          var i = lr("diag");
          if (i) return i[a].apply(i, $d([], Md(s), !1));
        };
      }
      var r = this,
        n = function (a, s) {
          var o, i, l;
          if ((s === void 0 && (s = { logLevel: Te.INFO }), a === r)) {
            var c = new Error(
              "Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a custom implementation",
            );
            return (
              r.error((o = c.stack) !== null && o !== void 0 ? o : c.message),
              !1
            );
          }
          typeof s == "number" && (s = { logLevel: s });
          var u = lr("diag"),
            d = jd((i = s.logLevel) !== null && i !== void 0 ? i : Te.INFO, a);
          if (u && !s.suppressOverrideMessage) {
            var g =
              (l = new Error().stack) !== null && l !== void 0
                ? l
                : "<failed to generate stacktrace>";
            (u.warn("Current logger will be overwritten from " + g),
              d.warn(
                "Current logger will overwrite one already registered from " +
                  g,
              ));
          }
          return Hn("diag", d, r, !0);
        };
      ((r.setLogger = n),
        (r.disable = function () {
          Wn(Dd, r);
        }),
        (r.createComponentLogger = function (a) {
          return new Od(a);
        }),
        (r.verbose = t("verbose")),
        (r.debug = t("debug")),
        (r.info = t("info")),
        (r.warn = t("warn")),
        (r.error = t("error")));
    }
    return (
      (e.instance = function () {
        return (this._instance || (this._instance = new e()), this._instance);
      }),
      e
    );
  })();
function Ld(e) {
  return Symbol.for(e);
}
var Ud = (function () {
    function e(t) {
      var r = this;
      ((r._currentContext = t ? new Map(t) : new Map()),
        (r.getValue = function (n) {
          return r._currentContext.get(n);
        }),
        (r.setValue = function (n, a) {
          var s = new e(r._currentContext);
          return (s._currentContext.set(n, a), s);
        }),
        (r.deleteValue = function (n) {
          var a = new e(r._currentContext);
          return (a._currentContext.delete(n), a);
        }));
    }
    return e;
  })(),
  Fd = new Ud(),
  qd = function (e, t) {
    var r = typeof Symbol == "function" && e[Symbol.iterator];
    if (!r) return e;
    var n = r.call(e),
      a,
      s = [],
      o;
    try {
      for (; (t === void 0 || t-- > 0) && !(a = n.next()).done; )
        s.push(a.value);
    } catch (i) {
      o = { error: i };
    } finally {
      try {
        a && !a.done && (r = n.return) && r.call(n);
      } finally {
        if (o) throw o.error;
      }
    }
    return s;
  },
  Bd = function (e, t, r) {
    if (r || arguments.length === 2)
      for (var n = 0, a = t.length, s; n < a; n++)
        (s || !(n in t)) &&
          (s || (s = Array.prototype.slice.call(t, 0, n)), (s[n] = t[n]));
    return e.concat(s || Array.prototype.slice.call(t));
  },
  zd = (function () {
    function e() {}
    return (
      (e.prototype.active = function () {
        return Fd;
      }),
      (e.prototype.with = function (t, r, n) {
        for (var a = [], s = 3; s < arguments.length; s++)
          a[s - 3] = arguments[s];
        return r.call.apply(r, Bd([n], qd(a), !1));
      }),
      (e.prototype.bind = function (t, r) {
        return r;
      }),
      (e.prototype.enable = function () {
        return this;
      }),
      (e.prototype.disable = function () {
        return this;
      }),
      e
    );
  })(),
  Zd = function (e, t) {
    var r = typeof Symbol == "function" && e[Symbol.iterator];
    if (!r) return e;
    var n = r.call(e),
      a,
      s = [],
      o;
    try {
      for (; (t === void 0 || t-- > 0) && !(a = n.next()).done; )
        s.push(a.value);
    } catch (i) {
      o = { error: i };
    } finally {
      try {
        a && !a.done && (r = n.return) && r.call(n);
      } finally {
        if (o) throw o.error;
      }
    }
    return s;
  },
  Vd = function (e, t, r) {
    if (r || arguments.length === 2)
      for (var n = 0, a = t.length, s; n < a; n++)
        (s || !(n in t)) &&
          (s || (s = Array.prototype.slice.call(t, 0, n)), (s[n] = t[n]));
    return e.concat(s || Array.prototype.slice.call(t));
  },
  mn = "context",
  Jd = new zd(),
  Jo = (function () {
    function e() {}
    return (
      (e.getInstance = function () {
        return (this._instance || (this._instance = new e()), this._instance);
      }),
      (e.prototype.setGlobalContextManager = function (t) {
        return Hn(mn, t, Br.instance());
      }),
      (e.prototype.active = function () {
        return this._getContextManager().active();
      }),
      (e.prototype.with = function (t, r, n) {
        for (var a, s = [], o = 3; o < arguments.length; o++)
          s[o - 3] = arguments[o];
        return (a = this._getContextManager()).with.apply(
          a,
          Vd([t, r, n], Zd(s), !1),
        );
      }),
      (e.prototype.bind = function (t, r) {
        return this._getContextManager().bind(t, r);
      }),
      (e.prototype._getContextManager = function () {
        return lr(mn) || Jd;
      }),
      (e.prototype.disable = function () {
        (this._getContextManager().disable(), Wn(mn, Br.instance()));
      }),
      e
    );
  })(),
  Pn;
(function (e) {
  ((e[(e.NONE = 0)] = "NONE"), (e[(e.SAMPLED = 1)] = "SAMPLED"));
})(Pn || (Pn = {}));
var Ho = "0000000000000000",
  Wo = "00000000000000000000000000000000",
  Hd = { traceId: Wo, spanId: Ho, traceFlags: Pn.NONE },
  Wt = (function () {
    function e(t) {
      (t === void 0 && (t = Hd), (this._spanContext = t));
    }
    return (
      (e.prototype.spanContext = function () {
        return this._spanContext;
      }),
      (e.prototype.setAttribute = function (t, r) {
        return this;
      }),
      (e.prototype.setAttributes = function (t) {
        return this;
      }),
      (e.prototype.addEvent = function (t, r) {
        return this;
      }),
      (e.prototype.addLink = function (t) {
        return this;
      }),
      (e.prototype.addLinks = function (t) {
        return this;
      }),
      (e.prototype.setStatus = function (t) {
        return this;
      }),
      (e.prototype.updateName = function (t) {
        return this;
      }),
      (e.prototype.end = function (t) {}),
      (e.prototype.isRecording = function () {
        return !1;
      }),
      (e.prototype.recordException = function (t, r) {}),
      e
    );
  })(),
  Gn = Ld("OpenTelemetry Context Key SPAN");
function Kn(e) {
  return e.getValue(Gn) || void 0;
}
function Wd() {
  return Kn(Jo.getInstance().active());
}
function Yn(e, t) {
  return e.setValue(Gn, t);
}
function Gd(e) {
  return e.deleteValue(Gn);
}
function Kd(e, t) {
  return Yn(e, new Wt(t));
}
function Go(e) {
  var t;
  return (t = Kn(e)) === null || t === void 0 ? void 0 : t.spanContext();
}
var Yd = /^([0-9a-f]{32})$/i,
  Xd = /^[0-9a-f]{16}$/i;
function Qd(e) {
  return Yd.test(e) && e !== Wo;
}
function ep(e) {
  return Xd.test(e) && e !== Ho;
}
function Ko(e) {
  return Qd(e.traceId) && ep(e.spanId);
}
function tp(e) {
  return new Wt(e);
}
var gn = Jo.getInstance(),
  Yo = (function () {
    function e() {}
    return (
      (e.prototype.startSpan = function (t, r, n) {
        n === void 0 && (n = gn.active());
        var a = !!(r != null && r.root);
        if (a) return new Wt();
        var s = n && Go(n);
        return rp(s) && Ko(s) ? new Wt(s) : new Wt();
      }),
      (e.prototype.startActiveSpan = function (t, r, n, a) {
        var s, o, i;
        if (!(arguments.length < 2)) {
          arguments.length === 2
            ? (i = r)
            : arguments.length === 3
              ? ((s = r), (i = n))
              : ((s = r), (o = n), (i = a));
          var l = o ?? gn.active(),
            c = this.startSpan(t, s, l),
            u = Yn(l, c);
          return gn.with(u, i, void 0, c);
        }
      }),
      e
    );
  })();
function rp(e) {
  return (
    typeof e == "object" &&
    typeof e.spanId == "string" &&
    typeof e.traceId == "string" &&
    typeof e.traceFlags == "number"
  );
}
var np = new Yo(),
  ap = (function () {
    function e(t, r, n, a) {
      ((this._provider = t),
        (this.name = r),
        (this.version = n),
        (this.options = a));
    }
    return (
      (e.prototype.startSpan = function (t, r, n) {
        return this._getTracer().startSpan(t, r, n);
      }),
      (e.prototype.startActiveSpan = function (t, r, n, a) {
        var s = this._getTracer();
        return Reflect.apply(s.startActiveSpan, s, arguments);
      }),
      (e.prototype._getTracer = function () {
        if (this._delegate) return this._delegate;
        var t = this._provider.getDelegateTracer(
          this.name,
          this.version,
          this.options,
        );
        return t ? ((this._delegate = t), this._delegate) : np;
      }),
      e
    );
  })(),
  sp = (function () {
    function e() {}
    return (
      (e.prototype.getTracer = function (t, r, n) {
        return new Yo();
      }),
      e
    );
  })(),
  op = new sp(),
  qa = (function () {
    function e() {}
    return (
      (e.prototype.getTracer = function (t, r, n) {
        var a;
        return (a = this.getDelegateTracer(t, r, n)) !== null && a !== void 0
          ? a
          : new ap(this, t, r, n);
      }),
      (e.prototype.getDelegate = function () {
        var t;
        return (t = this._delegate) !== null && t !== void 0 ? t : op;
      }),
      (e.prototype.setDelegate = function (t) {
        this._delegate = t;
      }),
      (e.prototype.getDelegateTracer = function (t, r, n) {
        var a;
        return (a = this._delegate) === null || a === void 0
          ? void 0
          : a.getTracer(t, r, n);
      }),
      e
    );
  })(),
  zr;
(function (e) {
  ((e[(e.UNSET = 0)] = "UNSET"),
    (e[(e.OK = 1)] = "OK"),
    (e[(e.ERROR = 2)] = "ERROR"));
})(zr || (zr = {}));
var fn = "trace",
  ip = (function () {
    function e() {
      ((this._proxyTracerProvider = new qa()),
        (this.wrapSpanContext = tp),
        (this.isSpanContextValid = Ko),
        (this.deleteSpan = Gd),
        (this.getSpan = Kn),
        (this.getActiveSpan = Wd),
        (this.getSpanContext = Go),
        (this.setSpan = Yn),
        (this.setSpanContext = Kd));
    }
    return (
      (e.getInstance = function () {
        return (this._instance || (this._instance = new e()), this._instance);
      }),
      (e.prototype.setGlobalTracerProvider = function (t) {
        var r = Hn(fn, this._proxyTracerProvider, Br.instance());
        return (r && this._proxyTracerProvider.setDelegate(t), r);
      }),
      (e.prototype.getTracerProvider = function () {
        return lr(fn) || this._proxyTracerProvider;
      }),
      (e.prototype.getTracer = function (t, r) {
        return this.getTracerProvider().getTracer(t, r);
      }),
      (e.prototype.disable = function () {
        (Wn(fn, Br.instance()), (this._proxyTracerProvider = new qa()));
      }),
      e
    );
  })(),
  lp = ip.getInstance(),
  cp = Object.defineProperty,
  Xn = (e, t) => {
    for (var r in t) cp(e, r, { get: t[r], enumerable: !0 });
  };
function Qn(e, { contentType: t, dataStreamVersion: r }) {
  const n = new Headers(e ?? {});
  return (
    n.has("Content-Type") || n.set("Content-Type", t),
    r !== void 0 && n.set("X-Vercel-AI-Data-Stream", r),
    n
  );
}
var tn = class extends G {
    constructor() {
      super({
        name: "AI_UnsupportedModelVersionError",
        message:
          'Unsupported model version. AI SDK 4 only supports models that implement specification version "v1". Please upgrade to AI SDK 5 to use this model.',
      });
    }
  },
  Xo = "AI_InvalidArgumentError",
  Qo = `vercel.ai.error.${Xo}`,
  up = Symbol.for(Qo),
  ei,
  ie = class extends G {
    constructor({ parameter: e, value: t, message: r }) {
      (super({
        name: Xo,
        message: `Invalid argument for parameter ${e}: ${r}`,
      }),
        (this[ei] = !0),
        (this.parameter = e),
        (this.value = t));
    }
    static isInstance(e) {
      return G.hasMarker(e, Qo);
    }
  };
ei = up;
var ti = "AI_RetryError",
  ri = `vercel.ai.error.${ti}`,
  dp = Symbol.for(ri),
  ni,
  Ba = class extends G {
    constructor({ message: e, reason: t, errors: r }) {
      (super({ name: ti, message: e }),
        (this[ni] = !0),
        (this.reason = t),
        (this.errors = r),
        (this.lastError = r[r.length - 1]));
    }
    static isInstance(e) {
      return G.hasMarker(e, ri);
    }
  };
ni = dp;
var pp =
  ({
    maxRetries: e = 2,
    initialDelayInMs: t = 2e3,
    backoffFactor: r = 2,
  } = {}) =>
  async (n) =>
    ai(n, { maxRetries: e, delayInMs: t, backoffFactor: r });
async function ai(
  e,
  { maxRetries: t, delayInMs: r, backoffFactor: n },
  a = [],
) {
  try {
    return await e();
  } catch (s) {
    if (Ar(s) || t === 0) throw s;
    const o = iu(s),
      i = [...a, s],
      l = i.length;
    if (l > t)
      throw new Ba({
        message: `Failed after ${l} attempts. Last error: ${o}`,
        reason: "maxRetriesExceeded",
        errors: i,
      });
    if (
      s instanceof Error &&
      Ce.isInstance(s) &&
      s.isRetryable === !0 &&
      l <= t
    )
      return (
        await au(r),
        ai(e, { maxRetries: t, delayInMs: n * r, backoffFactor: n }, i)
      );
    throw l === 1
      ? s
      : new Ba({
          message: `Failed after ${l} attempts with non-retryable error: '${o}'`,
          reason: "errorNotRetryable",
          errors: i,
        });
  }
}
function rn({ maxRetries: e }) {
  if (e != null) {
    if (!Number.isInteger(e))
      throw new ie({
        parameter: "maxRetries",
        value: e,
        message: "maxRetries must be an integer",
      });
    if (e < 0)
      throw new ie({
        parameter: "maxRetries",
        value: e,
        message: "maxRetries must be >= 0",
      });
  }
  const t = e ?? 2;
  return { maxRetries: t, retry: pp({ maxRetries: t }) };
}
function Ue({ operationId: e, telemetry: t }) {
  return {
    "operation.name": `${e}${(t == null ? void 0 : t.functionId) != null ? ` ${t.functionId}` : ""}`,
    "resource.name": t == null ? void 0 : t.functionId,
    "ai.operationId": e,
    "ai.telemetry.functionId": t == null ? void 0 : t.functionId,
  };
}
function nn({ model: e, settings: t, telemetry: r, headers: n }) {
  var a;
  return {
    "ai.model.provider": e.provider,
    "ai.model.id": e.modelId,
    ...Object.entries(t).reduce(
      (s, [o, i]) => ((s[`ai.settings.${o}`] = i), s),
      {},
    ),
    ...Object.entries(
      (a = r == null ? void 0 : r.metadata) != null ? a : {},
    ).reduce((s, [o, i]) => ((s[`ai.telemetry.metadata.${o}`] = i), s), {}),
    ...Object.entries(n ?? {}).reduce(
      (s, [o, i]) => (i !== void 0 && (s[`ai.request.headers.${o}`] = i), s),
      {},
    ),
  };
}
var mp = {
    startSpan() {
      return xr;
    },
    startActiveSpan(e, t, r, n) {
      if (typeof t == "function") return t(xr);
      if (typeof r == "function") return r(xr);
      if (typeof n == "function") return n(xr);
    },
  },
  xr = {
    spanContext() {
      return gp;
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
  gp = { traceId: "", spanId: "", traceFlags: 0 };
function an({ isEnabled: e = !1, tracer: t } = {}) {
  return e ? t || lp.getTracer("ai") : mp;
}
function Fe({ name: e, tracer: t, attributes: r, fn: n, endWhenDone: a = !0 }) {
  return t.startActiveSpan(e, { attributes: r }, async (s) => {
    try {
      const o = await n(s);
      return (a && s.end(), o);
    } catch (o) {
      try {
        si(s, o);
      } finally {
        s.end();
      }
      throw o;
    }
  });
}
function si(e, t) {
  t instanceof Error
    ? (e.recordException({ name: t.name, message: t.message, stack: t.stack }),
      e.setStatus({ code: zr.ERROR, message: t.message }))
    : e.setStatus({ code: zr.ERROR });
}
function ce({ telemetry: e, attributes: t }) {
  return (e == null ? void 0 : e.isEnabled) !== !0
    ? {}
    : Object.entries(t).reduce((r, [n, a]) => {
        if (a === void 0) return r;
        if (
          typeof a == "object" &&
          "input" in a &&
          typeof a.input == "function"
        ) {
          if ((e == null ? void 0 : e.recordInputs) === !1) return r;
          const s = a.input();
          return s === void 0 ? r : { ...r, [n]: s };
        }
        if (
          typeof a == "object" &&
          "output" in a &&
          typeof a.output == "function"
        ) {
          if ((e == null ? void 0 : e.recordOutputs) === !1) return r;
          const s = a.output();
          return s === void 0 ? r : { ...r, [n]: s };
        }
        return { ...r, [n]: a };
      }, {});
}
async function za({
  model: e,
  value: t,
  maxRetries: r,
  abortSignal: n,
  headers: a,
  experimental_telemetry: s,
}) {
  if (typeof e == "string" || e.specificationVersion !== "v1") throw new tn();
  const { maxRetries: o, retry: i } = rn({ maxRetries: r }),
    l = nn({ model: e, telemetry: s, headers: a, settings: { maxRetries: o } }),
    c = an(s);
  return Fe({
    name: "ai.embed",
    attributes: ce({
      telemetry: s,
      attributes: {
        ...Ue({ operationId: "ai.embed", telemetry: s }),
        ...l,
        "ai.value": { input: () => JSON.stringify(t) },
      },
    }),
    tracer: c,
    fn: async (u) => {
      const {
        embedding: d,
        usage: g,
        rawResponse: _,
      } = await i(() =>
        Fe({
          name: "ai.embed.doEmbed",
          attributes: ce({
            telemetry: s,
            attributes: {
              ...Ue({ operationId: "ai.embed.doEmbed", telemetry: s }),
              ...l,
              "ai.values": { input: () => [JSON.stringify(t)] },
            },
          }),
          tracer: c,
          fn: async (h) => {
            var v;
            const p = await e.doEmbed({
                values: [t],
                abortSignal: n,
                headers: a,
              }),
              f = p.embeddings[0],
              k = (v = p.usage) != null ? v : { tokens: NaN };
            return (
              h.setAttributes(
                ce({
                  telemetry: s,
                  attributes: {
                    "ai.embeddings": {
                      output: () => p.embeddings.map((S) => JSON.stringify(S)),
                    },
                    "ai.usage.tokens": k.tokens,
                  },
                }),
              ),
              { embedding: f, usage: k, rawResponse: p.rawResponse }
            );
          },
        }),
      );
      return (
        u.setAttributes(
          ce({
            telemetry: s,
            attributes: {
              "ai.embedding": { output: () => JSON.stringify(d) },
              "ai.usage.tokens": g.tokens,
            },
          }),
        ),
        new fp({ value: t, embedding: d, usage: g, rawResponse: _ })
      );
    },
  });
}
var fp = class {
  constructor(e) {
    ((this.value = e.value),
      (this.embedding = e.embedding),
      (this.usage = e.usage),
      (this.rawResponse = e.rawResponse));
  }
};
function hp(e, t) {
  if (t <= 0) throw new Error("chunkSize must be greater than 0");
  const r = [];
  for (let n = 0; n < e.length; n += t) r.push(e.slice(n, n + t));
  return r;
}
async function yp({
  model: e,
  values: t,
  maxRetries: r,
  abortSignal: n,
  headers: a,
  experimental_telemetry: s,
}) {
  if (typeof e == "string" || e.specificationVersion !== "v1") throw new tn();
  const { maxRetries: o, retry: i } = rn({ maxRetries: r }),
    l = nn({ model: e, telemetry: s, headers: a, settings: { maxRetries: o } }),
    c = an(s);
  return Fe({
    name: "ai.embedMany",
    attributes: ce({
      telemetry: s,
      attributes: {
        ...Ue({ operationId: "ai.embedMany", telemetry: s }),
        ...l,
        "ai.values": { input: () => t.map((u) => JSON.stringify(u)) },
      },
    }),
    tracer: c,
    fn: async (u) => {
      const d = e.maxEmbeddingsPerCall;
      if (d == null) {
        const { embeddings: v, usage: p } = await i(() =>
          Fe({
            name: "ai.embedMany.doEmbed",
            attributes: ce({
              telemetry: s,
              attributes: {
                ...Ue({ operationId: "ai.embedMany.doEmbed", telemetry: s }),
                ...l,
                "ai.values": { input: () => t.map((f) => JSON.stringify(f)) },
              },
            }),
            tracer: c,
            fn: async (f) => {
              var k;
              const S = await e.doEmbed({
                  values: t,
                  abortSignal: n,
                  headers: a,
                }),
                w = S.embeddings,
                A = (k = S.usage) != null ? k : { tokens: NaN };
              return (
                f.setAttributes(
                  ce({
                    telemetry: s,
                    attributes: {
                      "ai.embeddings": {
                        output: () => w.map((I) => JSON.stringify(I)),
                      },
                      "ai.usage.tokens": A.tokens,
                    },
                  }),
                ),
                { embeddings: w, usage: A }
              );
            },
          }),
        );
        return (
          u.setAttributes(
            ce({
              telemetry: s,
              attributes: {
                "ai.embeddings": {
                  output: () => v.map((f) => JSON.stringify(f)),
                },
                "ai.usage.tokens": p.tokens,
              },
            }),
          ),
          new Za({ values: t, embeddings: v, usage: p })
        );
      }
      const g = hp(t, d),
        _ = [];
      let h = 0;
      for (const v of g) {
        const { embeddings: p, usage: f } = await i(() =>
          Fe({
            name: "ai.embedMany.doEmbed",
            attributes: ce({
              telemetry: s,
              attributes: {
                ...Ue({ operationId: "ai.embedMany.doEmbed", telemetry: s }),
                ...l,
                "ai.values": { input: () => v.map((k) => JSON.stringify(k)) },
              },
            }),
            tracer: c,
            fn: async (k) => {
              var S;
              const w = await e.doEmbed({
                  values: v,
                  abortSignal: n,
                  headers: a,
                }),
                A = w.embeddings,
                I = (S = w.usage) != null ? S : { tokens: NaN };
              return (
                k.setAttributes(
                  ce({
                    telemetry: s,
                    attributes: {
                      "ai.embeddings": {
                        output: () => A.map((z) => JSON.stringify(z)),
                      },
                      "ai.usage.tokens": I.tokens,
                    },
                  }),
                ),
                { embeddings: A, usage: I }
              );
            },
          }),
        );
        (_.push(...p), (h += f.tokens));
      }
      return (
        u.setAttributes(
          ce({
            telemetry: s,
            attributes: {
              "ai.embeddings": {
                output: () => _.map((v) => JSON.stringify(v)),
              },
              "ai.usage.tokens": h,
            },
          }),
        ),
        new Za({ values: t, embeddings: _, usage: { tokens: h } })
      );
    },
  });
}
var Za = class {
    constructor(e) {
      ((this.values = e.values),
        (this.embeddings = e.embeddings),
        (this.usage = e.usage));
    }
  },
  vp = class {
    constructor({ data: e, mimeType: t }) {
      const r = e instanceof Uint8Array;
      ((this.base64Data = r ? void 0 : e),
        (this.uint8ArrayData = r ? e : void 0),
        (this.mimeType = t));
    }
    get base64() {
      return (
        this.base64Data == null && (this.base64Data = Ut(this.uint8ArrayData)),
        this.base64Data
      );
    }
    get uint8Array() {
      return (
        this.uint8ArrayData == null &&
          (this.uint8ArrayData = Qr(this.base64Data)),
        this.uint8ArrayData
      );
    }
  },
  _p = [
    { mimeType: "image/gif", bytesPrefix: [71, 73, 70], base64Prefix: "R0lG" },
    {
      mimeType: "image/png",
      bytesPrefix: [137, 80, 78, 71],
      base64Prefix: "iVBORw",
    },
    { mimeType: "image/jpeg", bytesPrefix: [255, 216], base64Prefix: "/9j/" },
    {
      mimeType: "image/webp",
      bytesPrefix: [82, 73, 70, 70],
      base64Prefix: "UklGRg",
    },
    { mimeType: "image/bmp", bytesPrefix: [66, 77], base64Prefix: "Qk" },
    {
      mimeType: "image/tiff",
      bytesPrefix: [73, 73, 42, 0],
      base64Prefix: "SUkqAA",
    },
    {
      mimeType: "image/tiff",
      bytesPrefix: [77, 77, 0, 42],
      base64Prefix: "TU0AKg",
    },
    {
      mimeType: "image/avif",
      bytesPrefix: [0, 0, 0, 32, 102, 116, 121, 112, 97, 118, 105, 102],
      base64Prefix: "AAAAIGZ0eXBhdmlm",
    },
    {
      mimeType: "image/heic",
      bytesPrefix: [0, 0, 0, 32, 102, 116, 121, 112, 104, 101, 105, 99],
      base64Prefix: "AAAAIGZ0eXBoZWlj",
    },
  ],
  bp = (e) => {
    const t = typeof e == "string" ? Qr(e) : e,
      r =
        ((t[6] & 127) << 21) |
        ((t[7] & 127) << 14) |
        ((t[8] & 127) << 7) |
        (t[9] & 127);
    return t.slice(r + 10);
  };
function wp(e) {
  return (typeof e == "string" && e.startsWith("SUQz")) ||
    (typeof e != "string" &&
      e.length > 10 &&
      e[0] === 73 &&
      e[1] === 68 &&
      e[2] === 51)
    ? bp(e)
    : e;
}
function xp({ data: e, signatures: t }) {
  const r = wp(e);
  for (const n of t)
    if (
      typeof r == "string"
        ? r.startsWith(n.base64Prefix)
        : r.length >= n.bytesPrefix.length &&
          n.bytesPrefix.every((a, s) => r[s] === a)
    )
      return n.mimeType;
}
var oi = "AI_NoObjectGeneratedError",
  ii = `vercel.ai.error.${oi}`,
  kp = Symbol.for(ii),
  li,
  ot = class extends G {
    constructor({
      message: e = "No object generated.",
      cause: t,
      text: r,
      response: n,
      usage: a,
      finishReason: s,
    }) {
      (super({ name: oi, message: e, cause: t }),
        (this[li] = !0),
        (this.text = r),
        (this.response = n),
        (this.usage = a),
        (this.finishReason = s));
    }
    static isInstance(e) {
      return G.hasMarker(e, ii);
    }
  };
li = kp;
var ci = "AI_DownloadError",
  ui = `vercel.ai.error.${ci}`,
  Ap = Symbol.for(ui),
  di,
  hn = class extends G {
    constructor({
      url: e,
      statusCode: t,
      statusText: r,
      cause: n,
      message: a = n == null
        ? `Failed to download ${e}: ${t} ${r}`
        : `Failed to download ${e}: ${n}`,
    }) {
      (super({ name: ci, message: a, cause: n }),
        (this[di] = !0),
        (this.url = e),
        (this.statusCode = t),
        (this.statusText = r));
    }
    static isInstance(e) {
      return G.hasMarker(e, ui);
    }
  };
di = Ap;
async function Sp({ url: e }) {
  var t;
  const r = e.toString();
  try {
    const n = await fetch(r);
    if (!n.ok)
      throw new hn({ url: r, statusCode: n.status, statusText: n.statusText });
    return {
      data: new Uint8Array(await n.arrayBuffer()),
      mimeType: (t = n.headers.get("content-type")) != null ? t : void 0,
    };
  } catch (n) {
    throw hn.isInstance(n) ? n : new hn({ url: r, cause: n });
  }
}
var pi = "AI_InvalidDataContentError",
  mi = `vercel.ai.error.${pi}`,
  Tp = Symbol.for(mi),
  gi,
  Va = class extends G {
    constructor({
      content: e,
      cause: t,
      message:
        r = `Invalid data content. Expected a base64 string, Uint8Array, ArrayBuffer, or Buffer, but got ${typeof e}.`,
    }) {
      (super({ name: pi, message: r, cause: t }),
        (this[gi] = !0),
        (this.content = e));
    }
    static isInstance(e) {
      return G.hasMarker(e, mi);
    }
  };
gi = Tp;
var fi = de([
  m(),
  Lr(Uint8Array),
  Lr(ArrayBuffer),
  Vs(
    (e) => {
      var t, r;
      return (r = (t = globalThis.Buffer) == null ? void 0 : t.isBuffer(e)) !=
        null
        ? r
        : !1;
    },
    { message: "Must be a Buffer" },
  ),
]);
function ea(e) {
  return typeof e == "string"
    ? e
    : e instanceof ArrayBuffer
      ? Ut(new Uint8Array(e))
      : Ut(e);
}
function Zr(e) {
  if (e instanceof Uint8Array) return e;
  if (typeof e == "string")
    try {
      return Qr(e);
    } catch (t) {
      throw new Va({
        message:
          "Invalid data content. Content string is not a base64-encoded media.",
        content: e,
        cause: t,
      });
    }
  if (e instanceof ArrayBuffer) return new Uint8Array(e);
  throw new Va({ content: e });
}
function Cp(e) {
  try {
    return new TextDecoder().decode(e);
  } catch {
    throw new Error("Error decoding Uint8Array to text");
  }
}
var hi = "AI_InvalidMessageRoleError",
  yi = `vercel.ai.error.${hi}`,
  Ip = Symbol.for(yi),
  vi,
  Ep = class extends G {
    constructor({
      role: e,
      message:
        t = `Invalid message role: '${e}'. Must be one of: "system", "user", "assistant", "tool".`,
    }) {
      (super({ name: hi, message: t }), (this[vi] = !0), (this.role = e));
    }
    static isInstance(e) {
      return G.hasMarker(e, yi);
    }
  };
vi = Ip;
function Rp(e) {
  try {
    const [t, r] = e.split(",");
    return { mimeType: t.split(";")[0].split(":")[1], base64Content: r };
  } catch {
    return { mimeType: void 0, base64Content: void 0 };
  }
}
async function Nn({
  prompt: e,
  modelSupportsImageUrls: t = !0,
  modelSupportsUrl: r = () => !1,
  downloadImplementation: n = Sp,
}) {
  const a = await Np(e.messages, n, t, r);
  return [
    ...(e.system != null ? [{ role: "system", content: e.system }] : []),
    ...e.messages.map((s) => Pp(s, a)),
  ];
}
function Pp(e, t) {
  var r, n, a, s, o, i;
  const l = e.role;
  switch (l) {
    case "system":
      return {
        role: "system",
        content: e.content,
        providerMetadata:
          (r = e.providerOptions) != null ? r : e.experimental_providerMetadata,
      };
    case "user":
      return typeof e.content == "string"
        ? {
            role: "user",
            content: [{ type: "text", text: e.content }],
            providerMetadata:
              (n = e.providerOptions) != null
                ? n
                : e.experimental_providerMetadata,
          }
        : {
            role: "user",
            content: e.content
              .map((c) => Op(c, t))
              .filter((c) => c.type !== "text" || c.text !== ""),
            providerMetadata:
              (a = e.providerOptions) != null
                ? a
                : e.experimental_providerMetadata,
          };
    case "assistant":
      return typeof e.content == "string"
        ? {
            role: "assistant",
            content: [{ type: "text", text: e.content }],
            providerMetadata:
              (s = e.providerOptions) != null
                ? s
                : e.experimental_providerMetadata,
          }
        : {
            role: "assistant",
            content: e.content
              .filter((c) => c.type !== "text" || c.text !== "")
              .map((c) => {
                var u;
                const d =
                  (u = c.providerOptions) != null
                    ? u
                    : c.experimental_providerMetadata;
                switch (c.type) {
                  case "file":
                    return {
                      type: "file",
                      data: c.data instanceof URL ? c.data : ea(c.data),
                      filename: c.filename,
                      mimeType: c.mimeType,
                      providerMetadata: d,
                    };
                  case "reasoning":
                    return {
                      type: "reasoning",
                      text: c.text,
                      signature: c.signature,
                      providerMetadata: d,
                    };
                  case "redacted-reasoning":
                    return {
                      type: "redacted-reasoning",
                      data: c.data,
                      providerMetadata: d,
                    };
                  case "text":
                    return { type: "text", text: c.text, providerMetadata: d };
                  case "tool-call":
                    return {
                      type: "tool-call",
                      toolCallId: c.toolCallId,
                      toolName: c.toolName,
                      args: c.args,
                      providerMetadata: d,
                    };
                }
              }),
            providerMetadata:
              (o = e.providerOptions) != null
                ? o
                : e.experimental_providerMetadata,
          };
    case "tool":
      return {
        role: "tool",
        content: e.content.map((c) => {
          var u;
          return {
            type: "tool-result",
            toolCallId: c.toolCallId,
            toolName: c.toolName,
            result: c.result,
            content: c.experimental_content,
            isError: c.isError,
            providerMetadata:
              (u = c.providerOptions) != null
                ? u
                : c.experimental_providerMetadata,
          };
        }),
        providerMetadata:
          (i = e.providerOptions) != null ? i : e.experimental_providerMetadata,
      };
    default: {
      const c = l;
      throw new Ep({ role: c });
    }
  }
}
async function Np(e, t, r, n) {
  const a = e
      .filter((o) => o.role === "user")
      .map((o) => o.content)
      .filter((o) => Array.isArray(o))
      .flat()
      .filter((o) => o.type === "image" || o.type === "file")
      .filter((o) => !(o.type === "image" && r === !0))
      .map((o) => (o.type === "image" ? o.image : o.data))
      .map((o) =>
        typeof o == "string" &&
        (o.startsWith("http:") || o.startsWith("https:"))
          ? new URL(o)
          : o,
      )
      .filter((o) => o instanceof URL)
      .filter((o) => !n(o)),
    s = await Promise.all(
      a.map(async (o) => ({ url: o, data: await t({ url: o }) })),
    );
  return Object.fromEntries(s.map(({ url: o, data: i }) => [o.toString(), i]));
}
function Op(e, t) {
  var r, n, a, s;
  if (e.type === "text")
    return {
      type: "text",
      text: e.text,
      providerMetadata:
        (r = e.providerOptions) != null ? r : e.experimental_providerMetadata,
    };
  let o = e.mimeType,
    i,
    l,
    c;
  const u = e.type;
  switch (u) {
    case "image":
      i = e.image;
      break;
    case "file":
      i = e.data;
      break;
    default:
      throw new Error(`Unsupported part type: ${u}`);
  }
  try {
    l = typeof i == "string" ? new URL(i) : i;
  } catch {
    l = i;
  }
  if (l instanceof URL)
    if (l.protocol === "data:") {
      const { mimeType: d, base64Content: g } = Rp(l.toString());
      if (d == null || g == null)
        throw new Error(`Invalid data URL format in part ${u}`);
      ((o = d), (c = Zr(g)));
    } else {
      const d = t[l.toString()];
      d ? ((c = d.data), o ?? (o = d.mimeType)) : (c = l);
    }
  else c = Zr(l);
  switch (u) {
    case "image":
      return (
        c instanceof Uint8Array &&
          (o = (n = xp({ data: c, signatures: _p })) != null ? n : o),
        {
          type: "image",
          image: c,
          mimeType: o,
          providerMetadata:
            (a = e.providerOptions) != null
              ? a
              : e.experimental_providerMetadata,
        }
      );
    case "file": {
      if (o == null) throw new Error("Mime type is missing for file part");
      return {
        type: "file",
        data: c instanceof Uint8Array ? ea(c) : c,
        filename: e.filename,
        mimeType: o,
        providerMetadata:
          (s = e.providerOptions) != null ? s : e.experimental_providerMetadata,
      };
    }
  }
}
function On({
  maxTokens: e,
  temperature: t,
  topP: r,
  topK: n,
  presencePenalty: a,
  frequencyPenalty: s,
  stopSequences: o,
  seed: i,
}) {
  if (e != null) {
    if (!Number.isInteger(e))
      throw new ie({
        parameter: "maxTokens",
        value: e,
        message: "maxTokens must be an integer",
      });
    if (e < 1)
      throw new ie({
        parameter: "maxTokens",
        value: e,
        message: "maxTokens must be >= 1",
      });
  }
  if (t != null && typeof t != "number")
    throw new ie({
      parameter: "temperature",
      value: t,
      message: "temperature must be a number",
    });
  if (r != null && typeof r != "number")
    throw new ie({
      parameter: "topP",
      value: r,
      message: "topP must be a number",
    });
  if (n != null && typeof n != "number")
    throw new ie({
      parameter: "topK",
      value: n,
      message: "topK must be a number",
    });
  if (a != null && typeof a != "number")
    throw new ie({
      parameter: "presencePenalty",
      value: a,
      message: "presencePenalty must be a number",
    });
  if (s != null && typeof s != "number")
    throw new ie({
      parameter: "frequencyPenalty",
      value: s,
      message: "frequencyPenalty must be a number",
    });
  if (i != null && !Number.isInteger(i))
    throw new ie({
      parameter: "seed",
      value: i,
      message: "seed must be an integer",
    });
  return {
    maxTokens: e,
    temperature: t ?? 0,
    topP: r,
    topK: n,
    presencePenalty: a,
    frequencyPenalty: s,
    stopSequences: o != null && o.length > 0 ? o : void 0,
    seed: i,
  };
}
function Ja(e) {
  var t, r, n;
  const a = [];
  for (const s of e) {
    let o;
    try {
      o = new URL(s.url);
    } catch {
      throw new Error(`Invalid URL: ${s.url}`);
    }
    switch (o.protocol) {
      case "http:":
      case "https:": {
        if ((t = s.contentType) != null && t.startsWith("image/"))
          a.push({ type: "image", image: o });
        else {
          if (!s.contentType)
            throw new Error(
              "If the attachment is not an image, it must specify a content type",
            );
          a.push({ type: "file", data: o, mimeType: s.contentType });
        }
        break;
      }
      case "data:": {
        let i, l, c;
        try {
          (([i, l] = s.url.split(",")), (c = i.split(";")[0].split(":")[1]));
        } catch {
          throw new Error(`Error processing data URL: ${s.url}`);
        }
        if (c == null || l == null)
          throw new Error(`Invalid data URL format: ${s.url}`);
        if ((r = s.contentType) != null && r.startsWith("image/"))
          a.push({ type: "image", image: Zr(l) });
        else if ((n = s.contentType) != null && n.startsWith("text/"))
          a.push({ type: "text", text: Cp(Zr(l)) });
        else {
          if (!s.contentType)
            throw new Error(
              "If the attachment is not an image or text, it must specify a content type",
            );
          a.push({ type: "file", data: l, mimeType: s.contentType });
        }
        break;
      }
      default:
        throw new Error(`Unsupported URL protocol: ${o.protocol}`);
    }
  }
  return a;
}
var _i = "AI_MessageConversionError",
  bi = `vercel.ai.error.${_i}`,
  jp = Symbol.for(bi),
  wi,
  yn = class extends G {
    constructor({ originalMessage: e, message: t }) {
      (super({ name: _i, message: t }),
        (this[wi] = !0),
        (this.originalMessage = e));
    }
    static isInstance(e) {
      return G.hasMarker(e, bi);
    }
  };
wi = jp;
function Mp(e, t) {
  var r, n;
  const a = (r = t == null ? void 0 : t.tools) != null ? r : {},
    s = [];
  for (let o = 0; o < e.length; o++) {
    const i = e[o],
      l = o === e.length - 1,
      { role: c, content: u, experimental_attachments: d } = i;
    switch (c) {
      case "system": {
        s.push({ role: "system", content: u });
        break;
      }
      case "user": {
        if (i.parts == null)
          s.push({
            role: "user",
            content: d ? [{ type: "text", text: u }, ...Ja(d)] : u,
          });
        else {
          const g = i.parts
            .filter((_) => _.type === "text")
            .map((_) => ({ type: "text", text: _.text }));
          s.push({ role: "user", content: d ? [...g, ...Ja(d)] : g });
        }
        break;
      }
      case "assistant": {
        if (i.parts != null) {
          let h = function () {
              const k = [];
              for (const w of f)
                switch (w.type) {
                  case "file":
                  case "text": {
                    k.push(w);
                    break;
                  }
                  case "reasoning": {
                    for (const A of w.details)
                      switch (A.type) {
                        case "text":
                          k.push({
                            type: "reasoning",
                            text: A.text,
                            signature: A.signature,
                          });
                          break;
                        case "redacted":
                          k.push({ type: "redacted-reasoning", data: A.data });
                          break;
                      }
                    break;
                  }
                  case "tool-invocation":
                    k.push({
                      type: "tool-call",
                      toolCallId: w.toolInvocation.toolCallId,
                      toolName: w.toolInvocation.toolName,
                      args: w.toolInvocation.args,
                    });
                    break;
                  default: {
                    const A = w;
                    throw new Error(`Unsupported part: ${A}`);
                  }
                }
              s.push({ role: "assistant", content: k });
              const S = f
                .filter((w) => w.type === "tool-invocation")
                .map((w) => w.toolInvocation);
              (S.length > 0 &&
                s.push({
                  role: "tool",
                  content: S.map((w) => {
                    if (!("result" in w))
                      throw new yn({
                        originalMessage: i,
                        message:
                          "ToolInvocation must have a result: " +
                          JSON.stringify(w),
                      });
                    const { toolCallId: A, toolName: I, result: z } = w,
                      b = a[I];
                    return (b == null
                      ? void 0
                      : b.experimental_toToolResultContent) != null
                      ? {
                          type: "tool-result",
                          toolCallId: A,
                          toolName: I,
                          result: b.experimental_toToolResultContent(z),
                          experimental_content:
                            b.experimental_toToolResultContent(z),
                        }
                      : {
                          type: "tool-result",
                          toolCallId: A,
                          toolName: I,
                          result: z,
                        };
                  }),
                }),
                (f = []),
                (p = !1),
                v++);
            },
            v = 0,
            p = !1,
            f = [];
          for (const k of i.parts)
            switch (k.type) {
              case "text": {
                (p && h(), f.push(k));
                break;
              }
              case "file":
              case "reasoning": {
                f.push(k);
                break;
              }
              case "tool-invocation": {
                (((n = k.toolInvocation.step) != null ? n : 0) !== v && h(),
                  f.push(k),
                  (p = !0));
                break;
              }
            }
          h();
          break;
        }
        const g = i.toolInvocations;
        if (g == null || g.length === 0) {
          s.push({ role: "assistant", content: u });
          break;
        }
        const _ = g.reduce((h, v) => {
          var p;
          return Math.max(h, (p = v.step) != null ? p : 0);
        }, 0);
        for (let h = 0; h <= _; h++) {
          const v = g.filter((p) => {
            var f;
            return ((f = p.step) != null ? f : 0) === h;
          });
          v.length !== 0 &&
            (s.push({
              role: "assistant",
              content: [
                ...(l && u && h === 0 ? [{ type: "text", text: u }] : []),
                ...v.map(({ toolCallId: p, toolName: f, args: k }) => ({
                  type: "tool-call",
                  toolCallId: p,
                  toolName: f,
                  args: k,
                })),
              ],
            }),
            s.push({
              role: "tool",
              content: v.map((p) => {
                if (!("result" in p))
                  throw new yn({
                    originalMessage: i,
                    message:
                      "ToolInvocation must have a result: " + JSON.stringify(p),
                  });
                const { toolCallId: f, toolName: k, result: S } = p,
                  w = a[k];
                return (w == null
                  ? void 0
                  : w.experimental_toToolResultContent) != null
                  ? {
                      type: "tool-result",
                      toolCallId: f,
                      toolName: k,
                      result: w.experimental_toToolResultContent(S),
                      experimental_content:
                        w.experimental_toToolResultContent(S),
                    }
                  : {
                      type: "tool-result",
                      toolCallId: f,
                      toolName: k,
                      result: S,
                    };
              }),
            }));
        }
        u && !l && s.push({ role: "assistant", content: u });
        break;
      }
      case "data":
        break;
      default: {
        const g = c;
        throw new yn({ originalMessage: i, message: `Unsupported role: ${g}` });
      }
    }
  }
  return s;
}
var jn = Hs(() => de([Ic(), m(), N(), Pe(), Qt(m(), jn), K(jn)])),
  ue = Qt(m(), Qt(m(), jn)),
  $p = K(
    de([
      y({ type: $("text"), text: m() }),
      y({ type: $("image"), data: m(), mimeType: m().optional() }),
    ]),
  ),
  xi = y({
    type: $("text"),
    text: m(),
    providerOptions: ue.optional(),
    experimental_providerMetadata: ue.optional(),
  }),
  Dp = y({
    type: $("image"),
    image: de([fi, Lr(URL)]),
    mimeType: m().optional(),
    providerOptions: ue.optional(),
    experimental_providerMetadata: ue.optional(),
  }),
  ki = y({
    type: $("file"),
    data: de([fi, Lr(URL)]),
    filename: m().optional(),
    mimeType: m(),
    providerOptions: ue.optional(),
    experimental_providerMetadata: ue.optional(),
  }),
  Lp = y({
    type: $("reasoning"),
    text: m(),
    providerOptions: ue.optional(),
    experimental_providerMetadata: ue.optional(),
  }),
  Up = y({
    type: $("redacted-reasoning"),
    data: m(),
    providerOptions: ue.optional(),
    experimental_providerMetadata: ue.optional(),
  }),
  Fp = y({
    type: $("tool-call"),
    toolCallId: m(),
    toolName: m(),
    args: mr(),
    providerOptions: ue.optional(),
    experimental_providerMetadata: ue.optional(),
  }),
  qp = y({
    type: $("tool-result"),
    toolCallId: m(),
    toolName: m(),
    result: mr(),
    content: $p.optional(),
    isError: Pe().optional(),
    providerOptions: ue.optional(),
    experimental_providerMetadata: ue.optional(),
  }),
  Bp = y({
    role: $("system"),
    content: m(),
    providerOptions: ue.optional(),
    experimental_providerMetadata: ue.optional(),
  }),
  zp = y({
    role: $("user"),
    content: de([m(), K(de([xi, Dp, ki]))]),
    providerOptions: ue.optional(),
    experimental_providerMetadata: ue.optional(),
  }),
  Zp = y({
    role: $("assistant"),
    content: de([m(), K(de([xi, ki, Lp, Up, Fp]))]),
    providerOptions: ue.optional(),
    experimental_providerMetadata: ue.optional(),
  }),
  Vp = y({
    role: $("tool"),
    content: K(qp),
    providerOptions: ue.optional(),
    experimental_providerMetadata: ue.optional(),
  }),
  Jp = de([Bp, zp, Zp, Vp]);
function Mn({ prompt: e, tools: t }) {
  if (e.prompt == null && e.messages == null)
    throw new Qe({ prompt: e, message: "prompt or messages must be defined" });
  if (e.prompt != null && e.messages != null)
    throw new Qe({
      prompt: e,
      message: "prompt and messages cannot be defined at the same time",
    });
  if (e.system != null && typeof e.system != "string")
    throw new Qe({ prompt: e, message: "system must be a string" });
  if (e.prompt != null) {
    if (typeof e.prompt != "string")
      throw new Qe({ prompt: e, message: "prompt must be a string" });
    return {
      type: "prompt",
      system: e.system,
      messages: [{ role: "user", content: e.prompt }],
    };
  }
  if (e.messages != null) {
    const n =
      Hp(e.messages) === "ui-messages"
        ? Mp(e.messages, { tools: t })
        : e.messages;
    if (n.length === 0)
      throw new Qe({ prompt: e, message: "messages must not be empty" });
    const a = at({ value: n, schema: K(Jp) });
    if (!a.success)
      throw new Qe({
        prompt: e,
        message: [
          "message must be a CoreMessage or a UI message",
          `Validation error: ${a.error.message}`,
        ].join(`
`),
        cause: a.error,
      });
    return { type: "messages", messages: n, system: e.system };
  }
  throw new Error("unreachable");
}
function Hp(e) {
  if (!Array.isArray(e))
    throw new Qe({
      prompt: e,
      message: [
        "messages must be an array of CoreMessage or UIMessage",
        `Received non-array value: ${JSON.stringify(e)}`,
      ].join(`
`),
      cause: e,
    });
  if (e.length === 0) return "messages";
  const t = e.map(Wp);
  if (t.some((n) => n === "has-ui-specific-parts")) return "ui-messages";
  const r = t.findIndex(
    (n) => n !== "has-core-specific-parts" && n !== "message",
  );
  if (r === -1) return "messages";
  throw new Qe({
    prompt: e,
    message: [
      "messages must be an array of CoreMessage or UIMessage",
      `Received message of type: "${t[r]}" at index ${r}`,
      `messages[${r}]: ${JSON.stringify(e[r])}`,
    ].join(`
`),
    cause: e,
  });
}
function Wp(e) {
  return typeof e == "object" &&
    e !== null &&
    (e.role === "function" ||
      e.role === "data" ||
      "toolInvocations" in e ||
      "parts" in e ||
      "experimental_attachments" in e)
    ? "has-ui-specific-parts"
    : typeof e == "object" &&
        e !== null &&
        "content" in e &&
        (Array.isArray(e.content) ||
          "experimental_providerMetadata" in e ||
          "providerOptions" in e)
      ? "has-core-specific-parts"
      : typeof e == "object" &&
          e !== null &&
          "role" in e &&
          "content" in e &&
          typeof e.content == "string" &&
          ["system", "user", "assistant", "tool"].includes(e.role)
        ? "message"
        : "other";
}
function pt({ promptTokens: e, completionTokens: t }) {
  return { promptTokens: e, completionTokens: t, totalTokens: e + t };
}
function Gp(e, t) {
  return {
    promptTokens: e.promptTokens + t.promptTokens,
    completionTokens: e.completionTokens + t.completionTokens,
    totalTokens: e.totalTokens + t.totalTokens,
  };
}
var Kp = "JSON schema:",
  Yp = "You MUST answer with a JSON object that matches the JSON schema above.",
  Xp = "You MUST answer with JSON.";
function $n({
  prompt: e,
  schema: t,
  schemaPrefix: r = t != null ? Kp : void 0,
  schemaSuffix: n = t != null ? Yp : Xp,
}) {
  return [
    e != null && e.length > 0 ? e : void 0,
    e != null && e.length > 0 ? "" : void 0,
    r,
    t != null ? JSON.stringify(t) : void 0,
    n,
  ].filter((a) => a != null).join(`
`);
}
function Qp(e) {
  const t = e.pipeThrough(new TransformStream());
  return (
    (t[Symbol.asyncIterator] = () => {
      const r = t.getReader();
      return {
        async next() {
          const { done: n, value: a } = await r.read();
          return n ? { done: !0, value: void 0 } : { done: !1, value: a };
        },
      };
    }),
    t
  );
}
var em = {
    type: "no-schema",
    jsonSchema: void 0,
    validatePartialResult({ value: e, textDelta: t }) {
      return { success: !0, value: { partial: e, textDelta: t } };
    },
    validateFinalResult(e, t) {
      return e === void 0
        ? {
            success: !1,
            error: new ot({
              message: "No object generated: response did not match schema.",
              text: t.text,
              response: t.response,
              usage: t.usage,
              finishReason: t.finishReason,
            }),
          }
        : { success: !0, value: e };
    },
    createElementStream() {
      throw new le({ functionality: "element streams in no-schema mode" });
    },
  },
  tm = (e) => ({
    type: "object",
    jsonSchema: e.jsonSchema,
    validatePartialResult({ value: t, textDelta: r }) {
      return { success: !0, value: { partial: t, textDelta: r } };
    },
    validateFinalResult(t) {
      return at({ value: t, schema: e });
    },
    createElementStream() {
      throw new le({ functionality: "element streams in object mode" });
    },
  }),
  rm = (e) => {
    const { $schema: t, ...r } = e.jsonSchema;
    return {
      type: "enum",
      jsonSchema: {
        $schema: "http://json-schema.org/draft-07/schema#",
        type: "object",
        properties: { elements: { type: "array", items: r } },
        required: ["elements"],
        additionalProperties: !1,
      },
      validatePartialResult({
        value: n,
        latestObject: a,
        isFirstDelta: s,
        isFinalDelta: o,
      }) {
        var i;
        if (!En(n) || !Oa(n.elements))
          return {
            success: !1,
            error: new nt({
              value: n,
              cause:
                "value must be an object that contains an array of elements",
            }),
          };
        const l = n.elements,
          c = [];
        for (let g = 0; g < l.length; g++) {
          const _ = l[g],
            h = at({ value: _, schema: e });
          if (!(g === l.length - 1 && !o)) {
            if (!h.success) return h;
            c.push(h.value);
          }
        }
        const u = (i = a == null ? void 0 : a.length) != null ? i : 0;
        let d = "";
        return (
          s && (d += "["),
          u > 0 && (d += ","),
          (d += c
            .slice(u)
            .map((g) => JSON.stringify(g))
            .join(",")),
          o && (d += "]"),
          { success: !0, value: { partial: c, textDelta: d } }
        );
      },
      validateFinalResult(n) {
        if (!En(n) || !Oa(n.elements))
          return {
            success: !1,
            error: new nt({
              value: n,
              cause:
                "value must be an object that contains an array of elements",
            }),
          };
        const a = n.elements;
        for (const s of a) {
          const o = at({ value: s, schema: e });
          if (!o.success) return o;
        }
        return { success: !0, value: a };
      },
      createElementStream(n) {
        let a = 0;
        return Qp(
          n.pipeThrough(
            new TransformStream({
              transform(s, o) {
                switch (s.type) {
                  case "object": {
                    const i = s.object;
                    for (; a < i.length; a++) o.enqueue(i[a]);
                    break;
                  }
                  case "text-delta":
                  case "finish":
                  case "error":
                    break;
                  default: {
                    const i = s;
                    throw new Error(`Unsupported chunk type: ${i}`);
                  }
                }
              },
            }),
          ),
        );
      },
    };
  },
  nm = (e) => ({
    type: "enum",
    jsonSchema: {
      $schema: "http://json-schema.org/draft-07/schema#",
      type: "object",
      properties: { result: { type: "string", enum: e } },
      required: ["result"],
      additionalProperties: !1,
    },
    validateFinalResult(t) {
      if (!En(t) || typeof t.result != "string")
        return {
          success: !1,
          error: new nt({
            value: t,
            cause:
              'value must be an object that contains a string in the "result" property.',
          }),
        };
      const r = t.result;
      return e.includes(r)
        ? { success: !0, value: r }
        : {
            success: !1,
            error: new nt({
              value: t,
              cause: "value must be a string in the enum",
            }),
          };
    },
    validatePartialResult() {
      throw new le({ functionality: "partial results in enum mode" });
    },
    createElementStream() {
      throw new le({ functionality: "element streams in enum mode" });
    },
  });
function am({ output: e, schema: t, enumValues: r }) {
  switch (e) {
    case "object":
      return tm(Ft(t));
    case "array":
      return rm(Ft(t));
    case "enum":
      return nm(r);
    case "no-schema":
      return em;
    default: {
      const n = e;
      throw new Error(`Unsupported output: ${n}`);
    }
  }
}
function sm({
  output: e,
  mode: t,
  schema: r,
  schemaName: n,
  schemaDescription: a,
  enumValues: s,
}) {
  if (
    e != null &&
    e !== "object" &&
    e !== "array" &&
    e !== "enum" &&
    e !== "no-schema"
  )
    throw new ie({
      parameter: "output",
      value: e,
      message: "Invalid output type.",
    });
  if (e === "no-schema") {
    if (t === "auto" || t === "tool")
      throw new ie({
        parameter: "mode",
        value: t,
        message: 'Mode must be "json" for no-schema output.',
      });
    if (r != null)
      throw new ie({
        parameter: "schema",
        value: r,
        message: "Schema is not supported for no-schema output.",
      });
    if (a != null)
      throw new ie({
        parameter: "schemaDescription",
        value: a,
        message: "Schema description is not supported for no-schema output.",
      });
    if (n != null)
      throw new ie({
        parameter: "schemaName",
        value: n,
        message: "Schema name is not supported for no-schema output.",
      });
    if (s != null)
      throw new ie({
        parameter: "enumValues",
        value: s,
        message: "Enum values are not supported for no-schema output.",
      });
  }
  if (e === "object") {
    if (r == null)
      throw new ie({
        parameter: "schema",
        value: r,
        message: "Schema is required for object output.",
      });
    if (s != null)
      throw new ie({
        parameter: "enumValues",
        value: s,
        message: "Enum values are not supported for object output.",
      });
  }
  if (e === "array") {
    if (r == null)
      throw new ie({
        parameter: "schema",
        value: r,
        message: "Element schema is required for array output.",
      });
    if (s != null)
      throw new ie({
        parameter: "enumValues",
        value: s,
        message: "Enum values are not supported for array output.",
      });
  }
  if (e === "enum") {
    if (r != null)
      throw new ie({
        parameter: "schema",
        value: r,
        message: "Schema is not supported for enum output.",
      });
    if (a != null)
      throw new ie({
        parameter: "schemaDescription",
        value: a,
        message: "Schema description is not supported for enum output.",
      });
    if (n != null)
      throw new ie({
        parameter: "schemaName",
        value: n,
        message: "Schema name is not supported for enum output.",
      });
    if (s == null)
      throw new ie({
        parameter: "enumValues",
        value: s,
        message: "Enum values are required for enum output.",
      });
    for (const o of s)
      if (typeof o != "string")
        throw new ie({
          parameter: "enumValues",
          value: o,
          message: "Enum values must be strings.",
        });
  }
}
function Ai(e) {
  const t = e.map((r) => ({
    ...r,
    content: typeof r.content == "string" ? r.content : r.content.map(om),
  }));
  return JSON.stringify(t);
}
function om(e) {
  return e.type === "image"
    ? { ...e, image: e.image instanceof Uint8Array ? ea(e.image) : e.image }
    : e;
}
var im = Tt({ prefix: "aiobj", size: 24 });
async function Jt({
  model: e,
  enum: t,
  schema: r,
  schemaName: n,
  schemaDescription: a,
  mode: s,
  output: o = "object",
  system: i,
  prompt: l,
  messages: c,
  maxRetries: u,
  abortSignal: d,
  headers: g,
  experimental_repairText: _,
  experimental_telemetry: h,
  experimental_providerMetadata: v,
  providerOptions: p = v,
  _internal: { generateId: f = im, currentDate: k = () => new Date() } = {},
  ...S
}) {
  if (typeof e == "string" || e.specificationVersion !== "v1") throw new tn();
  sm({
    output: o,
    mode: s,
    schema: r,
    schemaName: n,
    schemaDescription: a,
    enumValues: t,
  });
  const { maxRetries: w, retry: A } = rn({ maxRetries: u }),
    I = am({ output: o, schema: r, enumValues: t });
  I.type === "no-schema" && s === void 0 && (s = "json");
  const z = nn({
      model: e,
      telemetry: h,
      headers: g,
      settings: { ...S, maxRetries: w },
    }),
    b = an(h);
  return Fe({
    name: "ai.generateObject",
    attributes: ce({
      telemetry: h,
      attributes: {
        ...Ue({ operationId: "ai.generateObject", telemetry: h }),
        ...z,
        "ai.prompt": {
          input: () => JSON.stringify({ system: i, prompt: l, messages: c }),
        },
        "ai.schema":
          I.jsonSchema != null
            ? { input: () => JSON.stringify(I.jsonSchema) }
            : void 0,
        "ai.schema.name": n,
        "ai.schema.description": a,
        "ai.settings.output": I.type,
        "ai.settings.mode": s,
      },
    }),
    tracer: b,
    fn: async (x) => {
      var D, q, Q, L;
      (s === "auto" || s == null) && (s = e.defaultObjectGenerationMode);
      let R, O, H, F, j, Z, V, J, xe;
      switch (s) {
        case "json": {
          const re = Mn({
              prompt: {
                system:
                  I.jsonSchema == null
                    ? $n({ prompt: i })
                    : e.supportsStructuredOutputs
                      ? i
                      : $n({ prompt: i, schema: I.jsonSchema }),
                prompt: l,
                messages: c,
              },
              tools: void 0,
            }),
            he = await Nn({
              prompt: re,
              modelSupportsImageUrls: e.supportsImageUrls,
              modelSupportsUrl:
                (D = e.supportsUrl) == null ? void 0 : D.bind(e),
            }),
            me = await A(() =>
              Fe({
                name: "ai.generateObject.doGenerate",
                attributes: ce({
                  telemetry: h,
                  attributes: {
                    ...Ue({
                      operationId: "ai.generateObject.doGenerate",
                      telemetry: h,
                    }),
                    ...z,
                    "ai.prompt.format": { input: () => re.type },
                    "ai.prompt.messages": { input: () => JSON.stringify(he) },
                    "ai.settings.mode": s,
                    "gen_ai.system": e.provider,
                    "gen_ai.request.model": e.modelId,
                    "gen_ai.request.frequency_penalty": S.frequencyPenalty,
                    "gen_ai.request.max_tokens": S.maxTokens,
                    "gen_ai.request.presence_penalty": S.presencePenalty,
                    "gen_ai.request.temperature": S.temperature,
                    "gen_ai.request.top_k": S.topK,
                    "gen_ai.request.top_p": S.topP,
                  },
                }),
                tracer: b,
                fn: async (ke) => {
                  var Y, _e, je, Me, Ge, Re;
                  const se = await e.doGenerate({
                      mode: {
                        type: "object-json",
                        schema: I.jsonSchema,
                        name: n,
                        description: a,
                      },
                      ...On(S),
                      inputFormat: re.type,
                      prompt: he,
                      providerMetadata: p,
                      abortSignal: d,
                      headers: g,
                    }),
                    Ae = {
                      id:
                        (_e = (Y = se.response) == null ? void 0 : Y.id) != null
                          ? _e
                          : f(),
                      timestamp:
                        (Me =
                          (je = se.response) == null ? void 0 : je.timestamp) !=
                        null
                          ? Me
                          : k(),
                      modelId:
                        (Re =
                          (Ge = se.response) == null ? void 0 : Ge.modelId) !=
                        null
                          ? Re
                          : e.modelId,
                    };
                  if (se.text === void 0)
                    throw new ot({
                      message:
                        "No object generated: the model did not return a response.",
                      response: Ae,
                      usage: pt(se.usage),
                      finishReason: se.finishReason,
                    });
                  return (
                    ke.setAttributes(
                      ce({
                        telemetry: h,
                        attributes: {
                          "ai.response.finishReason": se.finishReason,
                          "ai.response.object": { output: () => se.text },
                          "ai.response.id": Ae.id,
                          "ai.response.model": Ae.modelId,
                          "ai.response.timestamp": Ae.timestamp.toISOString(),
                          "ai.response.providerMetadata": JSON.stringify(
                            se.providerMetadata,
                          ),
                          "ai.usage.promptTokens": se.usage.promptTokens,
                          "ai.usage.completionTokens":
                            se.usage.completionTokens,
                          "gen_ai.response.finish_reasons": [se.finishReason],
                          "gen_ai.response.id": Ae.id,
                          "gen_ai.response.model": Ae.modelId,
                          "gen_ai.usage.prompt_tokens": se.usage.promptTokens,
                          "gen_ai.usage.completion_tokens":
                            se.usage.completionTokens,
                        },
                      }),
                    ),
                    { ...se, objectText: se.text, responseData: Ae }
                  );
                },
              }),
            );
          ((R = me.objectText),
            (O = me.finishReason),
            (H = me.usage),
            (F = me.warnings),
            (j = me.rawResponse),
            (J = me.logprobs),
            (xe = me.providerMetadata),
            (V = (q = me.request) != null ? q : {}),
            (Z = me.responseData));
          break;
        }
        case "tool": {
          const re = Mn({
              prompt: { system: i, prompt: l, messages: c },
              tools: void 0,
            }),
            he = await Nn({
              prompt: re,
              modelSupportsImageUrls: e.supportsImageUrls,
              modelSupportsUrl:
                (Q = e.supportsUrl) == null ? void 0 : Q.bind(e),
            }),
            me = re.type,
            ke = await A(() =>
              Fe({
                name: "ai.generateObject.doGenerate",
                attributes: ce({
                  telemetry: h,
                  attributes: {
                    ...Ue({
                      operationId: "ai.generateObject.doGenerate",
                      telemetry: h,
                    }),
                    ...z,
                    "ai.prompt.format": { input: () => me },
                    "ai.prompt.messages": { input: () => Ai(he) },
                    "ai.settings.mode": s,
                    "gen_ai.system": e.provider,
                    "gen_ai.request.model": e.modelId,
                    "gen_ai.request.frequency_penalty": S.frequencyPenalty,
                    "gen_ai.request.max_tokens": S.maxTokens,
                    "gen_ai.request.presence_penalty": S.presencePenalty,
                    "gen_ai.request.temperature": S.temperature,
                    "gen_ai.request.top_k": S.topK,
                    "gen_ai.request.top_p": S.topP,
                  },
                }),
                tracer: b,
                fn: async (Y) => {
                  var _e, je, Me, Ge, Re, se, Ae, It;
                  const ge = await e.doGenerate({
                      mode: {
                        type: "object-tool",
                        tool: {
                          type: "function",
                          name: n ?? "json",
                          description: a ?? "Respond with a JSON object.",
                          parameters: I.jsonSchema,
                        },
                      },
                      ...On(S),
                      inputFormat: me,
                      prompt: he,
                      providerMetadata: p,
                      abortSignal: d,
                      headers: g,
                    }),
                    ze =
                      (je = (_e = ge.toolCalls) == null ? void 0 : _e[0]) ==
                      null
                        ? void 0
                        : je.args,
                    $e = {
                      id:
                        (Ge = (Me = ge.response) == null ? void 0 : Me.id) !=
                        null
                          ? Ge
                          : f(),
                      timestamp:
                        (se =
                          (Re = ge.response) == null ? void 0 : Re.timestamp) !=
                        null
                          ? se
                          : k(),
                      modelId:
                        (It =
                          (Ae = ge.response) == null ? void 0 : Ae.modelId) !=
                        null
                          ? It
                          : e.modelId,
                    };
                  if (ze === void 0)
                    throw new ot({
                      message: "No object generated: the tool was not called.",
                      response: $e,
                      usage: pt(ge.usage),
                      finishReason: ge.finishReason,
                    });
                  return (
                    Y.setAttributes(
                      ce({
                        telemetry: h,
                        attributes: {
                          "ai.response.finishReason": ge.finishReason,
                          "ai.response.object": { output: () => ze },
                          "ai.response.id": $e.id,
                          "ai.response.model": $e.modelId,
                          "ai.response.timestamp": $e.timestamp.toISOString(),
                          "ai.response.providerMetadata": JSON.stringify(
                            ge.providerMetadata,
                          ),
                          "ai.usage.promptTokens": ge.usage.promptTokens,
                          "ai.usage.completionTokens":
                            ge.usage.completionTokens,
                          "gen_ai.response.finish_reasons": [ge.finishReason],
                          "gen_ai.response.id": $e.id,
                          "gen_ai.response.model": $e.modelId,
                          "gen_ai.usage.input_tokens": ge.usage.promptTokens,
                          "gen_ai.usage.output_tokens":
                            ge.usage.completionTokens,
                        },
                      }),
                    ),
                    { ...ge, objectText: ze, responseData: $e }
                  );
                },
              }),
            );
          ((R = ke.objectText),
            (O = ke.finishReason),
            (H = ke.usage),
            (F = ke.warnings),
            (j = ke.rawResponse),
            (J = ke.logprobs),
            (xe = ke.providerMetadata),
            (V = (L = ke.request) != null ? L : {}),
            (Z = ke.responseData));
          break;
        }
        case void 0:
          throw new Error(
            "Model does not have a default object generation mode.",
          );
        default: {
          const re = s;
          throw new Error(`Unsupported mode: ${re}`);
        }
      }
      function Ee(re) {
        const he = St({ text: re });
        if (!he.success)
          throw new ot({
            message: "No object generated: could not parse the response.",
            cause: he.error,
            text: re,
            response: Z,
            usage: pt(H),
            finishReason: O,
          });
        const me = I.validateFinalResult(he.value, {
          text: re,
          response: Z,
          usage: pt(H),
        });
        if (!me.success)
          throw new ot({
            message: "No object generated: response did not match schema.",
            cause: me.error,
            text: re,
            response: Z,
            usage: pt(H),
            finishReason: O,
          });
        return me.value;
      }
      let Oe;
      try {
        Oe = Ee(R);
      } catch (re) {
        if (
          _ != null &&
          ot.isInstance(re) &&
          (er.isInstance(re.cause) || nt.isInstance(re.cause))
        ) {
          const he = await _({ text: R, error: re.cause });
          if (he === null) throw re;
          Oe = Ee(he);
        } else throw re;
      }
      return (
        x.setAttributes(
          ce({
            telemetry: h,
            attributes: {
              "ai.response.finishReason": O,
              "ai.response.object": { output: () => JSON.stringify(Oe) },
              "ai.usage.promptTokens": H.promptTokens,
              "ai.usage.completionTokens": H.completionTokens,
            },
          }),
        ),
        new lm({
          object: Oe,
          finishReason: O,
          usage: pt(H),
          warnings: F,
          request: V,
          response: {
            ...Z,
            headers: j == null ? void 0 : j.headers,
            body: j == null ? void 0 : j.body,
          },
          logprobs: J,
          providerMetadata: xe,
        })
      );
    },
  });
}
var lm = class {
  constructor(e) {
    ((this.object = e.object),
      (this.finishReason = e.finishReason),
      (this.usage = e.usage),
      (this.warnings = e.warnings),
      (this.providerMetadata = e.providerMetadata),
      (this.experimental_providerMetadata = e.providerMetadata),
      (this.response = e.response),
      (this.request = e.request),
      (this.logprobs = e.logprobs));
  }
  toJsonResponse(e) {
    var t;
    return new Response(JSON.stringify(this.object), {
      status: (t = e == null ? void 0 : e.status) != null ? t : 200,
      headers: Qn(e == null ? void 0 : e.headers, {
        contentType: "application/json; charset=utf-8",
      }),
    });
  }
};
Tt({ prefix: "aiobj", size: 24 });
var Si = "AI_NoOutputSpecifiedError",
  Ti = `vercel.ai.error.${Si}`,
  cm = Symbol.for(Ti),
  Ci,
  um = class extends G {
    constructor({ message: e = "No output specified." } = {}) {
      (super({ name: Si, message: e }), (this[Ci] = !0));
    }
    static isInstance(e) {
      return G.hasMarker(e, Ti);
    }
  };
Ci = cm;
var Ii = "AI_ToolExecutionError",
  Ei = `vercel.ai.error.${Ii}`,
  dm = Symbol.for(Ei),
  Ri,
  pm = class extends G {
    constructor({
      toolArgs: e,
      toolName: t,
      toolCallId: r,
      cause: n,
      message: a = `Error executing tool ${t}: ${gr(n)}`,
    }) {
      (super({ name: Ii, message: a, cause: n }),
        (this[Ri] = !0),
        (this.toolArgs = e),
        (this.toolName = t),
        (this.toolCallId = r));
    }
    static isInstance(e) {
      return G.hasMarker(e, Ei);
    }
  };
Ri = dm;
function mm(e) {
  return e != null && Object.keys(e).length > 0;
}
function gm({ tools: e, toolChoice: t, activeTools: r }) {
  return mm(e)
    ? {
        tools: (r != null
          ? Object.entries(e).filter(([a]) => r.includes(a))
          : Object.entries(e)
        ).map(([a, s]) => {
          const o = s.type;
          switch (o) {
            case void 0:
            case "function":
              return {
                type: "function",
                name: a,
                description: s.description,
                parameters: Ft(s.parameters).jsonSchema,
              };
            case "provider-defined":
              return {
                type: "provider-defined",
                name: a,
                id: s.id,
                args: s.args,
              };
            default: {
              const i = o;
              throw new Error(`Unsupported tool type: ${i}`);
            }
          }
        }),
        toolChoice:
          t == null
            ? { type: "auto" }
            : typeof t == "string"
              ? { type: t }
              : { type: "tool", toolName: t.toolName },
      }
    : { tools: void 0, toolChoice: void 0 };
}
var fm = /^([\s\S]*?)(\s+)(\S*)$/;
function hm(e) {
  const t = e.match(fm);
  return t ? { prefix: t[1], whitespace: t[2], suffix: t[3] } : void 0;
}
function ym(e) {
  const t = hm(e);
  return t ? t.prefix + t.whitespace : e;
}
var Pi = "AI_InvalidToolArgumentsError",
  Ni = `vercel.ai.error.${Pi}`,
  vm = Symbol.for(Ni),
  Oi,
  ji = class extends G {
    constructor({
      toolArgs: e,
      toolName: t,
      cause: r,
      message: n = `Invalid arguments for tool ${t}: ${gr(r)}`,
    }) {
      (super({ name: Pi, message: n, cause: r }),
        (this[Oi] = !0),
        (this.toolArgs = e),
        (this.toolName = t));
    }
    static isInstance(e) {
      return G.hasMarker(e, Ni);
    }
  };
Oi = vm;
var Mi = "AI_NoSuchToolError",
  $i = `vercel.ai.error.${Mi}`,
  _m = Symbol.for($i),
  Di,
  Dn = class extends G {
    constructor({
      toolName: e,
      availableTools: t = void 0,
      message:
        r = `Model tried to call unavailable tool '${e}'. ${t === void 0 ? "No tools are available." : `Available tools: ${t.join(", ")}.`}`,
    }) {
      (super({ name: Mi, message: r }),
        (this[Di] = !0),
        (this.toolName = e),
        (this.availableTools = t));
    }
    static isInstance(e) {
      return G.hasMarker(e, $i);
    }
  };
Di = _m;
var Li = "AI_ToolCallRepairError",
  Ui = `vercel.ai.error.${Li}`,
  bm = Symbol.for(Ui),
  Fi,
  wm = class extends G {
    constructor({
      cause: e,
      originalError: t,
      message: r = `Error repairing tool call: ${gr(e)}`,
    }) {
      (super({ name: Li, message: r, cause: e }),
        (this[Fi] = !0),
        (this.originalError = t));
    }
    static isInstance(e) {
      return G.hasMarker(e, Ui);
    }
  };
Fi = bm;
async function xm({
  toolCall: e,
  tools: t,
  repairToolCall: r,
  system: n,
  messages: a,
}) {
  if (t == null) throw new Dn({ toolName: e.toolName });
  try {
    return await Ha({ toolCall: e, tools: t });
  } catch (s) {
    if (r == null || !(Dn.isInstance(s) || ji.isInstance(s))) throw s;
    let o = null;
    try {
      o = await r({
        toolCall: e,
        tools: t,
        parameterSchema: ({ toolName: i }) => Ft(t[i].parameters).jsonSchema,
        system: n,
        messages: a,
        error: s,
      });
    } catch (i) {
      throw new wm({ cause: i, originalError: s });
    }
    if (o == null) throw s;
    return await Ha({ toolCall: o, tools: t });
  }
}
async function Ha({ toolCall: e, tools: t }) {
  const r = e.toolName,
    n = t[r];
  if (n == null)
    throw new Dn({ toolName: e.toolName, availableTools: Object.keys(t) });
  const a = Ft(n.parameters),
    s =
      e.args.trim() === ""
        ? at({ value: {}, schema: a })
        : St({ text: e.args, schema: a });
  if (s.success === !1)
    throw new ji({ toolName: r, toolArgs: e.args, cause: s.error });
  return {
    type: "tool-call",
    toolCallId: e.toolCallId,
    toolName: r,
    args: s.value,
  };
}
function Wa(e) {
  const t = e
    .filter((r) => r.type === "text")
    .map((r) => r.text)
    .join("");
  return t.length > 0 ? t : void 0;
}
function km({
  text: e = "",
  files: t,
  reasoning: r,
  tools: n,
  toolCalls: a,
  toolResults: s,
  messageId: o,
  generateMessageId: i,
}) {
  const l = [],
    c = [];
  return (
    r.length > 0 &&
      c.push(
        ...r.map((u) =>
          u.type === "text"
            ? { ...u, type: "reasoning" }
            : { ...u, type: "redacted-reasoning" },
        ),
      ),
    t.length > 0 &&
      c.push(
        ...t.map((u) => ({
          type: "file",
          data: u.base64,
          mimeType: u.mimeType,
        })),
      ),
    e.length > 0 && c.push({ type: "text", text: e }),
    a.length > 0 && c.push(...a),
    c.length > 0 && l.push({ role: "assistant", content: c, id: o }),
    s.length > 0 &&
      l.push({
        role: "tool",
        id: i(),
        content: s.map((u) => {
          const d = n[u.toolName];
          return (d == null ? void 0 : d.experimental_toToolResultContent) !=
            null
            ? {
                type: "tool-result",
                toolCallId: u.toolCallId,
                toolName: u.toolName,
                result: d.experimental_toToolResultContent(u.result),
                experimental_content: d.experimental_toToolResultContent(
                  u.result,
                ),
              }
            : {
                type: "tool-result",
                toolCallId: u.toolCallId,
                toolName: u.toolName,
                result: u.result,
              };
        }),
      }),
    l
  );
}
var Am = Tt({ prefix: "aitxt", size: 24 }),
  Sm = Tt({ prefix: "msg", size: 24 });
async function Ga({
  model: e,
  tools: t,
  toolChoice: r,
  system: n,
  prompt: a,
  messages: s,
  maxRetries: o,
  abortSignal: i,
  headers: l,
  maxSteps: c = 1,
  experimental_generateMessageId: u = Sm,
  experimental_output: d,
  experimental_continueSteps: g = !1,
  experimental_telemetry: _,
  experimental_providerMetadata: h,
  providerOptions: v = h,
  experimental_activeTools: p,
  experimental_prepareStep: f,
  experimental_repairToolCall: k,
  _internal: { generateId: S = Am, currentDate: w = () => new Date() } = {},
  onStepFinish: A,
  ...I
}) {
  var z;
  if (typeof e == "string" || e.specificationVersion !== "v1") throw new tn();
  if (c < 1)
    throw new ie({
      parameter: "maxSteps",
      value: c,
      message: "maxSteps must be at least 1",
    });
  const { maxRetries: b, retry: x } = rn({ maxRetries: o }),
    D = nn({
      model: e,
      telemetry: _,
      headers: l,
      settings: { ...I, maxRetries: b },
    }),
    q = Mn({
      prompt: {
        system:
          (z =
            d == null
              ? void 0
              : d.injectIntoSystemPrompt({ system: n, model: e })) != null
            ? z
            : n,
        prompt: a,
        messages: s,
      },
      tools: t,
    }),
    Q = an(_);
  return Fe({
    name: "ai.generateText",
    attributes: ce({
      telemetry: _,
      attributes: {
        ...Ue({ operationId: "ai.generateText", telemetry: _ }),
        ...D,
        "ai.model.provider": e.provider,
        "ai.model.id": e.modelId,
        "ai.prompt": {
          input: () => JSON.stringify({ system: n, prompt: a, messages: s }),
        },
        "ai.settings.maxSteps": c,
      },
    }),
    tracer: Q,
    fn: async (L) => {
      var R, O, H, F, j, Z, V, J, xe, Ee, Oe, re, he, me;
      const ke = On(I);
      let Y,
        _e = [],
        je = [],
        Me = [],
        Ge = 0;
      const Re = [];
      let se = "";
      const Ae = [],
        It = [];
      let ge = { completionTokens: 0, promptTokens: 0, totalTokens: 0 },
        ze = "initial";
      do {
        const $e = Ge === 0 ? q.type : "messages",
          on = [...q.messages, ...Re],
          Et = await (f == null
            ? void 0
            : f({ model: e, steps: It, maxSteps: c, stepNumber: Ge })),
          el = (R = Et == null ? void 0 : Et.toolChoice) != null ? R : r,
          tl =
            (O = Et == null ? void 0 : Et.experimental_activeTools) != null
              ? O
              : p,
          Ke = (H = Et == null ? void 0 : Et.model) != null ? H : e,
          ia = await Nn({
            prompt: { type: $e, system: q.system, messages: on },
            modelSupportsImageUrls: Ke.supportsImageUrls,
            modelSupportsUrl:
              (F = Ke.supportsUrl) == null ? void 0 : F.bind(Ke),
          }),
          hr = {
            type: "regular",
            ...gm({ tools: t, toolChoice: el, activeTools: tl }),
          };
        ((Y = await x(() =>
          Fe({
            name: "ai.generateText.doGenerate",
            attributes: ce({
              telemetry: _,
              attributes: {
                ...Ue({
                  operationId: "ai.generateText.doGenerate",
                  telemetry: _,
                }),
                ...D,
                "ai.model.provider": Ke.provider,
                "ai.model.id": Ke.modelId,
                "ai.prompt.format": { input: () => $e },
                "ai.prompt.messages": { input: () => Ai(ia) },
                "ai.prompt.tools": {
                  input: () => {
                    var Ze;
                    return (Ze = hr.tools) == null
                      ? void 0
                      : Ze.map((yr) => JSON.stringify(yr));
                  },
                },
                "ai.prompt.toolChoice": {
                  input: () =>
                    hr.toolChoice != null
                      ? JSON.stringify(hr.toolChoice)
                      : void 0,
                },
                "gen_ai.system": Ke.provider,
                "gen_ai.request.model": Ke.modelId,
                "gen_ai.request.frequency_penalty": I.frequencyPenalty,
                "gen_ai.request.max_tokens": I.maxTokens,
                "gen_ai.request.presence_penalty": I.presencePenalty,
                "gen_ai.request.stop_sequences": I.stopSequences,
                "gen_ai.request.temperature": I.temperature,
                "gen_ai.request.top_k": I.topK,
                "gen_ai.request.top_p": I.topP,
              },
            }),
            tracer: Q,
            fn: async (Ze) => {
              var yr, pa, ma, ga, fa, ha;
              const Se = await Ke.doGenerate({
                  mode: hr,
                  ...ke,
                  inputFormat: $e,
                  responseFormat:
                    d == null ? void 0 : d.responseFormat({ model: e }),
                  prompt: ia,
                  providerMetadata: v,
                  abortSignal: i,
                  headers: l,
                }),
                Pt = {
                  id:
                    (pa = (yr = Se.response) == null ? void 0 : yr.id) != null
                      ? pa
                      : S(),
                  timestamp:
                    (ga = (ma = Se.response) == null ? void 0 : ma.timestamp) !=
                    null
                      ? ga
                      : w(),
                  modelId:
                    (ha = (fa = Se.response) == null ? void 0 : fa.modelId) !=
                    null
                      ? ha
                      : Ke.modelId,
                };
              return (
                Ze.setAttributes(
                  ce({
                    telemetry: _,
                    attributes: {
                      "ai.response.finishReason": Se.finishReason,
                      "ai.response.text": { output: () => Se.text },
                      "ai.response.toolCalls": {
                        output: () => JSON.stringify(Se.toolCalls),
                      },
                      "ai.response.id": Pt.id,
                      "ai.response.model": Pt.modelId,
                      "ai.response.timestamp": Pt.timestamp.toISOString(),
                      "ai.response.providerMetadata": JSON.stringify(
                        Se.providerMetadata,
                      ),
                      "ai.usage.promptTokens": Se.usage.promptTokens,
                      "ai.usage.completionTokens": Se.usage.completionTokens,
                      "gen_ai.response.finish_reasons": [Se.finishReason],
                      "gen_ai.response.id": Pt.id,
                      "gen_ai.response.model": Pt.modelId,
                      "gen_ai.usage.input_tokens": Se.usage.promptTokens,
                      "gen_ai.usage.output_tokens": Se.usage.completionTokens,
                    },
                  }),
                ),
                { ...Se, response: Pt }
              );
            },
          }),
        )),
          (_e = await Promise.all(
            ((j = Y.toolCalls) != null ? j : []).map((Ze) =>
              xm({
                toolCall: Ze,
                tools: t,
                repairToolCall: k,
                system: n,
                messages: on,
              }),
            ),
          )),
          (je =
            t == null
              ? []
              : await Tm({
                  toolCalls: _e,
                  tools: t,
                  tracer: Q,
                  telemetry: _,
                  messages: on,
                  abortSignal: i,
                })));
        const la = pt(Y.usage);
        ge = Gp(ge, la);
        let Rt = "done";
        ++Ge < c &&
          (g && Y.finishReason === "length" && _e.length === 0
            ? (Rt = "continue")
            : _e.length > 0 && je.length === _e.length && (Rt = "tool-result"));
        const ca = (Z = Y.text) != null ? Z : "",
          ua = ze === "continue" && se.trimEnd() !== se ? ca.trimStart() : ca,
          Bt = Rt === "continue" ? ym(ua) : ua;
        if (
          ((se = Rt === "continue" || ze === "continue" ? se + Bt : Bt),
          (Me = Ka(Y.reasoning)),
          Ae.push(...((V = Y.sources) != null ? V : [])),
          ze === "continue")
        ) {
          const Ze = Re[Re.length - 1];
          typeof Ze.content == "string"
            ? (Ze.content += Bt)
            : Ze.content.push({ text: Bt, type: "text" });
        } else
          Re.push(
            ...km({
              text: se,
              files: vn(Y.files),
              reasoning: Ka(Y.reasoning),
              tools: t ?? {},
              toolCalls: _e,
              toolResults: je,
              messageId: u(),
              generateMessageId: u,
            }),
          );
        const da = {
          stepType: ze,
          text: Bt,
          reasoning: Wa(Me),
          reasoningDetails: Me,
          files: vn(Y.files),
          sources: (J = Y.sources) != null ? J : [],
          toolCalls: _e,
          toolResults: je,
          finishReason: Y.finishReason,
          usage: la,
          warnings: Y.warnings,
          logprobs: Y.logprobs,
          request: (xe = Y.request) != null ? xe : {},
          response: {
            ...Y.response,
            headers: (Ee = Y.rawResponse) == null ? void 0 : Ee.headers,
            body: (Oe = Y.rawResponse) == null ? void 0 : Oe.body,
            messages: structuredClone(Re),
          },
          providerMetadata: Y.providerMetadata,
          experimental_providerMetadata: Y.providerMetadata,
          isContinued: Rt === "continue",
        };
        (It.push(da), await (A == null ? void 0 : A(da)), (ze = Rt));
      } while (ze !== "done");
      return (
        L.setAttributes(
          ce({
            telemetry: _,
            attributes: {
              "ai.response.finishReason": Y.finishReason,
              "ai.response.text": { output: () => Y.text },
              "ai.response.toolCalls": {
                output: () => JSON.stringify(Y.toolCalls),
              },
              "ai.usage.promptTokens": Y.usage.promptTokens,
              "ai.usage.completionTokens": Y.usage.completionTokens,
              "ai.response.providerMetadata": JSON.stringify(
                Y.providerMetadata,
              ),
            },
          }),
        ),
        new Cm({
          text: se,
          files: vn(Y.files),
          reasoning: Wa(Me),
          reasoningDetails: Me,
          sources: Ae,
          outputResolver: () => {
            if (d == null) throw new um();
            return d.parseOutput(
              { text: se },
              { response: Y.response, usage: ge, finishReason: Y.finishReason },
            );
          },
          toolCalls: _e,
          toolResults: je,
          finishReason: Y.finishReason,
          usage: ge,
          warnings: Y.warnings,
          request: (re = Y.request) != null ? re : {},
          response: {
            ...Y.response,
            headers: (he = Y.rawResponse) == null ? void 0 : he.headers,
            body: (me = Y.rawResponse) == null ? void 0 : me.body,
            messages: Re,
          },
          logprobs: Y.logprobs,
          steps: It,
          providerMetadata: Y.providerMetadata,
        })
      );
    },
  });
}
async function Tm({
  toolCalls: e,
  tools: t,
  tracer: r,
  telemetry: n,
  messages: a,
  abortSignal: s,
}) {
  return (
    await Promise.all(
      e.map(async ({ toolCallId: i, toolName: l, args: c }) => {
        const u = t[l];
        if ((u == null ? void 0 : u.execute) == null) return;
        const d = await Fe({
          name: "ai.toolCall",
          attributes: ce({
            telemetry: n,
            attributes: {
              ...Ue({ operationId: "ai.toolCall", telemetry: n }),
              "ai.toolCall.name": l,
              "ai.toolCall.id": i,
              "ai.toolCall.args": { output: () => JSON.stringify(c) },
            },
          }),
          tracer: r,
          fn: async (g) => {
            try {
              const _ = await u.execute(c, {
                toolCallId: i,
                messages: a,
                abortSignal: s,
              });
              try {
                g.setAttributes(
                  ce({
                    telemetry: n,
                    attributes: {
                      "ai.toolCall.result": { output: () => JSON.stringify(_) },
                    },
                  }),
                );
              } catch {}
              return _;
            } catch (_) {
              throw (
                si(g, _),
                new pm({ toolCallId: i, toolName: l, toolArgs: c, cause: _ })
              );
            }
          },
        });
        return {
          type: "tool-result",
          toolCallId: i,
          toolName: l,
          args: c,
          result: d,
        };
      }),
    )
  ).filter((i) => i != null);
}
var Cm = class {
  constructor(e) {
    ((this.text = e.text),
      (this.files = e.files),
      (this.reasoning = e.reasoning),
      (this.reasoningDetails = e.reasoningDetails),
      (this.toolCalls = e.toolCalls),
      (this.toolResults = e.toolResults),
      (this.finishReason = e.finishReason),
      (this.usage = e.usage),
      (this.warnings = e.warnings),
      (this.request = e.request),
      (this.response = e.response),
      (this.steps = e.steps),
      (this.experimental_providerMetadata = e.providerMetadata),
      (this.providerMetadata = e.providerMetadata),
      (this.logprobs = e.logprobs),
      (this.outputResolver = e.outputResolver),
      (this.sources = e.sources));
  }
  get experimental_output() {
    return this.outputResolver();
  }
};
function Ka(e) {
  return e == null
    ? []
    : typeof e == "string"
      ? [{ type: "text", text: e }]
      : e;
}
function vn(e) {
  var t;
  return (t = e == null ? void 0 : e.map((r) => new vp(r))) != null ? t : [];
}
var Im = {};
Xn(Im, { object: () => Rm, text: () => Em });
var Em = () => ({
    type: "text",
    responseFormat: () => ({ type: "text" }),
    injectIntoSystemPrompt({ system: e }) {
      return e;
    },
    parsePartial({ text: e }) {
      return { partial: e };
    },
    parseOutput({ text: e }) {
      return e;
    },
  }),
  Rm = ({ schema: e }) => {
    const t = Ft(e);
    return {
      type: "object",
      responseFormat: ({ model: r }) => ({
        type: "json",
        schema: r.supportsStructuredOutputs ? t.jsonSchema : void 0,
      }),
      injectIntoSystemPrompt({ system: r, model: n }) {
        return n.supportsStructuredOutputs
          ? r
          : $n({ prompt: r, schema: t.jsonSchema });
      },
      parsePartial({ text: r }) {
        const n = id(r);
        switch (n.state) {
          case "failed-parse":
          case "undefined-input":
            return;
          case "repaired-parse":
          case "successful-parse":
            return { partial: n.value };
          default: {
            const a = n.state;
            throw new Error(`Unsupported parse state: ${a}`);
          }
        }
      },
      parseOutput({ text: r }, n) {
        const a = St({ text: r });
        if (!a.success)
          throw new ot({
            message: "No object generated: could not parse the response.",
            cause: a.error,
            text: r,
            response: n.response,
            usage: n.usage,
            finishReason: n.finishReason,
          });
        const s = at({ value: a.value, schema: t });
        if (!s.success)
          throw new ot({
            message: "No object generated: response did not match schema.",
            cause: s.error,
            text: r,
            response: n.response,
            usage: n.usage,
            finishReason: n.finishReason,
          });
        return s.value;
      },
    };
  };
function qi(e, t) {
  const r = e.getReader(),
    n = t.getReader();
  let a,
    s,
    o = !1,
    i = !1;
  async function l(u) {
    try {
      a == null && (a = r.read());
      const d = await a;
      ((a = void 0), d.done ? u.close() : u.enqueue(d.value));
    } catch (d) {
      u.error(d);
    }
  }
  async function c(u) {
    try {
      s == null && (s = n.read());
      const d = await s;
      ((s = void 0), d.done ? u.close() : u.enqueue(d.value));
    } catch (d) {
      u.error(d);
    }
  }
  return new ReadableStream({
    async pull(u) {
      try {
        if (o) {
          await c(u);
          return;
        }
        if (i) {
          await l(u);
          return;
        }
        (a == null && (a = r.read()), s == null && (s = n.read()));
        const { result: d, reader: g } = await Promise.race([
          a.then((_) => ({ result: _, reader: r })),
          s.then((_) => ({ result: _, reader: n })),
        ]);
        (d.done || u.enqueue(d.value),
          g === r
            ? ((a = void 0), d.done && (await c(u), (o = !0)))
            : ((s = void 0), d.done && ((i = !0), await l(u))));
      } catch (d) {
        u.error(d);
      }
    },
    cancel() {
      (r.cancel(), n.cancel());
    },
  });
}
Tt({ prefix: "aitxt", size: 24 });
Tt({ prefix: "msg", size: 24 });
var Pm = y({ name: m(), version: m() }).passthrough(),
  ta = y({ _meta: fe(y({}).passthrough()) }).passthrough(),
  cr = ta,
  Nm = y({ method: m(), params: fe(ta) }),
  Om = y({
    experimental: fe(y({}).passthrough()),
    logging: fe(y({}).passthrough()),
    prompts: fe(y({ listChanged: fe(Pe()) }).passthrough()),
    resources: fe(
      y({ subscribe: fe(Pe()), listChanged: fe(Pe()) }).passthrough(),
    ),
    tools: fe(y({ listChanged: fe(Pe()) }).passthrough()),
  }).passthrough();
cr.extend({
  protocolVersion: m(),
  capabilities: Om,
  serverInfo: Pm,
  instructions: fe(m()),
});
var jm = cr.extend({ nextCursor: fe(m()) }),
  Mm = y({
    name: m(),
    description: fe(m()),
    inputSchema: y({
      type: $("object"),
      properties: fe(y({}).passthrough()),
    }).passthrough(),
  }).passthrough();
jm.extend({ tools: K(Mm) });
var $m = y({ type: $("text"), text: m() }).passthrough(),
  Dm = y({ type: $("image"), data: m().base64(), mimeType: m() }).passthrough(),
  Bi = y({ uri: m(), mimeType: fe(m()) }).passthrough(),
  Lm = Bi.extend({ text: m() }),
  Um = Bi.extend({ blob: m().base64() }),
  Fm = y({ type: $("resource"), resource: de([Lm, Um]) }).passthrough();
cr.extend({
  content: K(de([$m, Dm, Fm])),
  isError: Pe().default(!1).optional(),
}).or(cr.extend({ toolResult: mr() }));
var sn = "2.0",
  qm = y({ jsonrpc: $(sn), id: de([m(), N().int()]) })
    .merge(Nm)
    .strict(),
  Bm = y({ jsonrpc: $(sn), id: de([m(), N().int()]), result: cr }).strict(),
  zm = y({
    jsonrpc: $(sn),
    id: de([m(), N().int()]),
    error: y({ code: N().int(), message: m(), data: fe(mr()) }),
  }).strict(),
  Zm = y({ jsonrpc: $(sn) })
    .merge(y({ method: m(), params: fe(ta) }))
    .strict();
de([qm, Zm, Bm, zm]);
var Vm = {};
Xn(Vm, {
  mergeIntoDataStream: () => Wm,
  toDataStream: () => Jm,
  toDataStreamResponse: () => Hm,
});
function zi(e = {}) {
  const t = new TextEncoder();
  let r = "";
  return new TransformStream({
    async start() {
      e.onStart && (await e.onStart());
    },
    async transform(n, a) {
      (a.enqueue(t.encode(n)),
        (r += n),
        e.onToken && (await e.onToken(n)),
        e.onText && typeof n == "string" && (await e.onText(n)));
    },
    async flush() {
      (e.onCompletion && (await e.onCompletion(r)),
        e.onFinal && (await e.onFinal(r)));
    },
  });
}
function ra(e, t) {
  return e
    .pipeThrough(
      new TransformStream({
        transform: async (r, n) => {
          var a;
          if (typeof r == "string") {
            n.enqueue(r);
            return;
          }
          if ("event" in r) {
            r.event === "on_chat_model_stream" &&
              Ya((a = r.data) == null ? void 0 : a.chunk, n);
            return;
          }
          Ya(r, n);
        },
      }),
    )
    .pipeThrough(zi(t))
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(
      new TransformStream({
        transform: async (r, n) => {
          n.enqueue(Vo("text", r));
        },
      }),
    );
}
function Jm(e, t) {
  return ra(e, t).pipeThrough(new TextEncoderStream());
}
function Hm(e, t) {
  var r;
  const n = ra(e, t == null ? void 0 : t.callbacks).pipeThrough(
      new TextEncoderStream(),
    ),
    a = t == null ? void 0 : t.data,
    s = t == null ? void 0 : t.init,
    o = a ? qi(a.stream, n) : n;
  return new Response(o, {
    status: (r = s == null ? void 0 : s.status) != null ? r : 200,
    statusText: s == null ? void 0 : s.statusText,
    headers: Qn(s == null ? void 0 : s.headers, {
      contentType: "text/plain; charset=utf-8",
      dataStreamVersion: "v1",
    }),
  });
}
function Wm(e, t) {
  t.dataStream.merge(ra(e, t.callbacks));
}
function Ya(e, t) {
  if (typeof e.content == "string") t.enqueue(e.content);
  else {
    const r = e.content;
    for (const n of r) n.type === "text" && t.enqueue(n.text);
  }
}
var Gm = {};
Xn(Gm, {
  mergeIntoDataStream: () => Xm,
  toDataStream: () => Km,
  toDataStreamResponse: () => Ym,
});
function na(e, t) {
  const r = Qm();
  return nu(e[Symbol.asyncIterator]())
    .pipeThrough(
      new TransformStream({
        async transform(n, a) {
          a.enqueue(r(n.delta));
        },
      }),
    )
    .pipeThrough(zi(t))
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(
      new TransformStream({
        transform: async (n, a) => {
          a.enqueue(Vo("text", n));
        },
      }),
    );
}
function Km(e, t) {
  return na(e, t).pipeThrough(new TextEncoderStream());
}
function Ym(e, t = {}) {
  var r;
  const { init: n, data: a, callbacks: s } = t,
    o = na(e, s).pipeThrough(new TextEncoderStream()),
    i = a ? qi(a.stream, o) : o;
  return new Response(i, {
    status: (r = n == null ? void 0 : n.status) != null ? r : 200,
    statusText: n == null ? void 0 : n.statusText,
    headers: Qn(n == null ? void 0 : n.headers, {
      contentType: "text/plain; charset=utf-8",
      dataStreamVersion: "v1",
    }),
  });
}
function Xm(e, t) {
  t.dataStream.merge(na(e, t.callbacks));
}
function Qm() {
  let e = !0;
  return (t) => (e && ((t = t.trimStart()), t && (e = !1)), t);
}
function eg({
  prompt: e,
  useLegacyFunctionCalling: t = !1,
  systemMessageMode: r = "system",
}) {
  const n = [],
    a = [];
  for (const { role: s, content: o } of e)
    switch (s) {
      case "system": {
        switch (r) {
          case "system": {
            n.push({ role: "system", content: o });
            break;
          }
          case "developer": {
            n.push({ role: "developer", content: o });
            break;
          }
          case "remove": {
            a.push({
              type: "other",
              message: "system messages are removed for this model",
            });
            break;
          }
          default: {
            const i = r;
            throw new Error(`Unsupported system message mode: ${i}`);
          }
        }
        break;
      }
      case "user": {
        if (o.length === 1 && o[0].type === "text") {
          n.push({ role: "user", content: o[0].text });
          break;
        }
        n.push({
          role: "user",
          content: o.map((i, l) => {
            var c, u, d, g;
            switch (i.type) {
              case "text":
                return { type: "text", text: i.text };
              case "image":
                return {
                  type: "image_url",
                  image_url: {
                    url:
                      i.image instanceof URL
                        ? i.image.toString()
                        : `data:${(c = i.mimeType) != null ? c : "image/jpeg"};base64,${Ut(i.image)}`,
                    detail:
                      (d =
                        (u = i.providerMetadata) == null ? void 0 : u.openai) ==
                      null
                        ? void 0
                        : d.imageDetail,
                  },
                };
              case "file": {
                if (i.data instanceof URL)
                  throw new le({
                    functionality:
                      "'File content parts with URL data' functionality not supported.",
                  });
                switch (i.mimeType) {
                  case "audio/wav":
                    return {
                      type: "input_audio",
                      input_audio: { data: i.data, format: "wav" },
                    };
                  case "audio/mp3":
                  case "audio/mpeg":
                    return {
                      type: "input_audio",
                      input_audio: { data: i.data, format: "mp3" },
                    };
                  case "application/pdf":
                    return {
                      type: "file",
                      file: {
                        filename:
                          (g = i.filename) != null ? g : `part-${l}.pdf`,
                        file_data: `data:application/pdf;base64,${i.data}`,
                      },
                    };
                  default:
                    throw new le({
                      functionality: `File content part type ${i.mimeType} in user messages`,
                    });
                }
              }
            }
          }),
        });
        break;
      }
      case "assistant": {
        let i = "";
        const l = [];
        for (const c of o)
          switch (c.type) {
            case "text": {
              i += c.text;
              break;
            }
            case "tool-call": {
              l.push({
                id: c.toolCallId,
                type: "function",
                function: {
                  name: c.toolName,
                  arguments: JSON.stringify(c.args),
                },
              });
              break;
            }
          }
        if (t) {
          if (l.length > 1)
            throw new le({
              functionality:
                "useLegacyFunctionCalling with multiple tool calls in one message",
            });
          n.push({
            role: "assistant",
            content: i,
            function_call: l.length > 0 ? l[0].function : void 0,
          });
        } else
          n.push({
            role: "assistant",
            content: i,
            tool_calls: l.length > 0 ? l : void 0,
          });
        break;
      }
      case "tool": {
        for (const i of o)
          t
            ? n.push({
                role: "function",
                name: i.toolName,
                content: JSON.stringify(i.result),
              })
            : n.push({
                role: "tool",
                tool_call_id: i.toolCallId,
                content: JSON.stringify(i.result),
              });
        break;
      }
      default: {
        const i = s;
        throw new Error(`Unsupported role: ${i}`);
      }
    }
  return { messages: n, warnings: a };
}
function Xa(e) {
  var t, r;
  return (r =
    (t = e == null ? void 0 : e.content) == null
      ? void 0
      : t.map(({ token: n, logprob: a, top_logprobs: s }) => ({
          token: n,
          logprob: a,
          topLogprobs: s
            ? s.map(({ token: o, logprob: i }) => ({ token: o, logprob: i }))
            : [],
        }))) != null
    ? r
    : void 0;
}
function Vr(e) {
  switch (e) {
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
var aa = y({
    error: y({
      message: m(),
      type: m().nullish(),
      param: Js().nullish(),
      code: de([m(), N()]).nullish(),
    }),
  }),
  We = Do({ errorSchema: aa, errorToMessage: (e) => e.error.message });
function Jr({ id: e, model: t, created: r }) {
  return {
    id: e ?? void 0,
    modelId: t ?? void 0,
    timestamp: r != null ? new Date(r * 1e3) : void 0,
  };
}
function tg({
  mode: e,
  useLegacyFunctionCalling: t = !1,
  structuredOutputs: r,
}) {
  var n;
  const a = (n = e.tools) != null && n.length ? e.tools : void 0,
    s = [];
  if (a == null) return { tools: void 0, tool_choice: void 0, toolWarnings: s };
  const o = e.toolChoice;
  if (t) {
    const c = [];
    for (const d of a)
      d.type === "provider-defined"
        ? s.push({ type: "unsupported-tool", tool: d })
        : c.push({
            name: d.name,
            description: d.description,
            parameters: d.parameters,
          });
    if (o == null)
      return { functions: c, function_call: void 0, toolWarnings: s };
    switch (o.type) {
      case "auto":
      case "none":
      case void 0:
        return { functions: c, function_call: void 0, toolWarnings: s };
      case "required":
        throw new le({
          functionality: "useLegacyFunctionCalling and toolChoice: required",
        });
      default:
        return {
          functions: c,
          function_call: { name: o.toolName },
          toolWarnings: s,
        };
    }
  }
  const i = [];
  for (const c of a)
    c.type === "provider-defined"
      ? s.push({ type: "unsupported-tool", tool: c })
      : i.push({
          type: "function",
          function: {
            name: c.name,
            description: c.description,
            parameters: c.parameters,
            strict: r ? !0 : void 0,
          },
        });
  if (o == null) return { tools: i, tool_choice: void 0, toolWarnings: s };
  const l = o.type;
  switch (l) {
    case "auto":
    case "none":
    case "required":
      return { tools: i, tool_choice: l, toolWarnings: s };
    case "tool":
      return {
        tools: i,
        tool_choice: { type: "function", function: { name: o.toolName } },
        toolWarnings: s,
      };
    default: {
      const c = l;
      throw new le({ functionality: `Unsupported tool choice type: ${c}` });
    }
  }
}
var rg = class {
    constructor(e, t, r) {
      ((this.specificationVersion = "v1"),
        (this.modelId = e),
        (this.settings = t),
        (this.config = r));
    }
    get supportsStructuredOutputs() {
      var e;
      return (e = this.settings.structuredOutputs) != null
        ? e
        : Ln(this.modelId);
    }
    get defaultObjectGenerationMode() {
      return sg(this.modelId)
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
      mode: e,
      prompt: t,
      maxTokens: r,
      temperature: n,
      topP: a,
      topK: s,
      frequencyPenalty: o,
      presencePenalty: i,
      stopSequences: l,
      responseFormat: c,
      seed: u,
      providerMetadata: d,
    }) {
      var g, _, h, v, p, f, k, S;
      const w = e.type,
        A = [];
      (s != null && A.push({ type: "unsupported-setting", setting: "topK" }),
        (c == null ? void 0 : c.type) === "json" &&
          c.schema != null &&
          !this.supportsStructuredOutputs &&
          A.push({
            type: "unsupported-setting",
            setting: "responseFormat",
            details:
              "JSON response format schema is only supported with structuredOutputs",
          }));
      const I = this.settings.useLegacyFunctionCalling;
      if (I && this.settings.parallelToolCalls === !0)
        throw new le({
          functionality: "useLegacyFunctionCalling with parallelToolCalls",
        });
      if (I && this.supportsStructuredOutputs)
        throw new le({
          functionality: "structuredOutputs with useLegacyFunctionCalling",
        });
      const { messages: z, warnings: b } = eg({
        prompt: t,
        useLegacyFunctionCalling: I,
        systemMessageMode: og(this.modelId),
      });
      A.push(...b);
      const x = {
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
        top_p: a,
        frequency_penalty: o,
        presence_penalty: i,
        response_format:
          (c == null ? void 0 : c.type) === "json"
            ? this.supportsStructuredOutputs && c.schema != null
              ? {
                  type: "json_schema",
                  json_schema: {
                    schema: c.schema,
                    strict: !0,
                    name: (g = c.name) != null ? g : "response",
                    description: c.description,
                  },
                }
              : { type: "json_object" }
            : void 0,
        stop: l,
        seed: u,
        max_completion_tokens:
          (_ = d == null ? void 0 : d.openai) == null
            ? void 0
            : _.maxCompletionTokens,
        store: (h = d == null ? void 0 : d.openai) == null ? void 0 : h.store,
        metadata:
          (v = d == null ? void 0 : d.openai) == null ? void 0 : v.metadata,
        prediction:
          (p = d == null ? void 0 : d.openai) == null ? void 0 : p.prediction,
        reasoning_effort:
          (k =
            (f = d == null ? void 0 : d.openai) == null
              ? void 0
              : f.reasoningEffort) != null
            ? k
            : this.settings.reasoningEffort,
        messages: z,
      };
      switch (
        (Ln(this.modelId)
          ? (x.temperature != null &&
              ((x.temperature = void 0),
              A.push({
                type: "unsupported-setting",
                setting: "temperature",
                details: "temperature is not supported for reasoning models",
              })),
            x.top_p != null &&
              ((x.top_p = void 0),
              A.push({
                type: "unsupported-setting",
                setting: "topP",
                details: "topP is not supported for reasoning models",
              })),
            x.frequency_penalty != null &&
              ((x.frequency_penalty = void 0),
              A.push({
                type: "unsupported-setting",
                setting: "frequencyPenalty",
                details:
                  "frequencyPenalty is not supported for reasoning models",
              })),
            x.presence_penalty != null &&
              ((x.presence_penalty = void 0),
              A.push({
                type: "unsupported-setting",
                setting: "presencePenalty",
                details:
                  "presencePenalty is not supported for reasoning models",
              })),
            x.logit_bias != null &&
              ((x.logit_bias = void 0),
              A.push({
                type: "other",
                message: "logitBias is not supported for reasoning models",
              })),
            x.logprobs != null &&
              ((x.logprobs = void 0),
              A.push({
                type: "other",
                message: "logprobs is not supported for reasoning models",
              })),
            x.top_logprobs != null &&
              ((x.top_logprobs = void 0),
              A.push({
                type: "other",
                message: "topLogprobs is not supported for reasoning models",
              })),
            x.max_tokens != null &&
              (x.max_completion_tokens == null &&
                (x.max_completion_tokens = x.max_tokens),
              (x.max_tokens = void 0)))
          : (this.modelId.startsWith("gpt-4o-search-preview") ||
              this.modelId.startsWith("gpt-4o-mini-search-preview")) &&
            x.temperature != null &&
            ((x.temperature = void 0),
            A.push({
              type: "unsupported-setting",
              setting: "temperature",
              details:
                "temperature is not supported for the search preview models and has been removed.",
            })),
        w)
      ) {
        case "regular": {
          const {
            tools: D,
            tool_choice: q,
            functions: Q,
            function_call: L,
            toolWarnings: R,
          } = tg({
            mode: e,
            useLegacyFunctionCalling: I,
            structuredOutputs: this.supportsStructuredOutputs,
          });
          return {
            args: {
              ...x,
              tools: D,
              tool_choice: q,
              functions: Q,
              function_call: L,
            },
            warnings: [...A, ...R],
          };
        }
        case "object-json":
          return {
            args: {
              ...x,
              response_format:
                this.supportsStructuredOutputs && e.schema != null
                  ? {
                      type: "json_schema",
                      json_schema: {
                        schema: e.schema,
                        strict: !0,
                        name: (S = e.name) != null ? S : "response",
                        description: e.description,
                      },
                    }
                  : { type: "json_object" },
            },
            warnings: A,
          };
        case "object-tool":
          return {
            args: I
              ? {
                  ...x,
                  function_call: { name: e.tool.name },
                  functions: [
                    {
                      name: e.tool.name,
                      description: e.tool.description,
                      parameters: e.tool.parameters,
                    },
                  ],
                }
              : {
                  ...x,
                  tool_choice: {
                    type: "function",
                    function: { name: e.tool.name },
                  },
                  tools: [
                    {
                      type: "function",
                      function: {
                        name: e.tool.name,
                        description: e.tool.description,
                        parameters: e.tool.parameters,
                        strict: this.supportsStructuredOutputs ? !0 : void 0,
                      },
                    },
                  ],
                },
            warnings: A,
          };
        default: {
          const D = w;
          throw new Error(`Unsupported type: ${D}`);
        }
      }
    }
    async doGenerate(e) {
      var t, r, n, a, s, o, i, l;
      const { args: c, warnings: u } = this.getArgs(e),
        {
          responseHeaders: d,
          value: g,
          rawValue: _,
        } = await Be({
          url: this.config.url({
            path: "/chat/completions",
            modelId: this.modelId,
          }),
          headers: qe(this.config.headers(), e.headers),
          body: c,
          failedResponseHandler: We,
          successfulResponseHandler: Ct(ng),
          abortSignal: e.abortSignal,
          fetch: this.config.fetch,
        }),
        { messages: h, ...v } = c,
        p = g.choices[0],
        f = (t = g.usage) == null ? void 0 : t.completion_tokens_details,
        k = (r = g.usage) == null ? void 0 : r.prompt_tokens_details,
        S = { openai: {} };
      return (
        (f == null ? void 0 : f.reasoning_tokens) != null &&
          (S.openai.reasoningTokens = f == null ? void 0 : f.reasoning_tokens),
        (f == null ? void 0 : f.accepted_prediction_tokens) != null &&
          (S.openai.acceptedPredictionTokens =
            f == null ? void 0 : f.accepted_prediction_tokens),
        (f == null ? void 0 : f.rejected_prediction_tokens) != null &&
          (S.openai.rejectedPredictionTokens =
            f == null ? void 0 : f.rejected_prediction_tokens),
        (k == null ? void 0 : k.cached_tokens) != null &&
          (S.openai.cachedPromptTokens = k == null ? void 0 : k.cached_tokens),
        {
          text: (n = p.message.content) != null ? n : void 0,
          toolCalls:
            this.settings.useLegacyFunctionCalling && p.message.function_call
              ? [
                  {
                    toolCallType: "function",
                    toolCallId: ft(),
                    toolName: p.message.function_call.name,
                    args: p.message.function_call.arguments,
                  },
                ]
              : (a = p.message.tool_calls) == null
                ? void 0
                : a.map((w) => {
                    var A;
                    return {
                      toolCallType: "function",
                      toolCallId: (A = w.id) != null ? A : ft(),
                      toolName: w.function.name,
                      args: w.function.arguments,
                    };
                  }),
          finishReason: Vr(p.finish_reason),
          usage: {
            promptTokens:
              (o = (s = g.usage) == null ? void 0 : s.prompt_tokens) != null
                ? o
                : NaN,
            completionTokens:
              (l = (i = g.usage) == null ? void 0 : i.completion_tokens) != null
                ? l
                : NaN,
          },
          rawCall: { rawPrompt: h, rawSettings: v },
          rawResponse: { headers: d, body: _ },
          request: { body: JSON.stringify(c) },
          response: Jr(g),
          warnings: u,
          logprobs: Xa(p.logprobs),
          providerMetadata: S,
        }
      );
    }
    async doStream(e) {
      if (this.settings.simulateStreaming) {
        const v = await this.doGenerate(e);
        return {
          stream: new ReadableStream({
            start(f) {
              if (
                (f.enqueue({ type: "response-metadata", ...v.response }),
                v.text && f.enqueue({ type: "text-delta", textDelta: v.text }),
                v.toolCalls)
              )
                for (const k of v.toolCalls)
                  (f.enqueue({
                    type: "tool-call-delta",
                    toolCallType: "function",
                    toolCallId: k.toolCallId,
                    toolName: k.toolName,
                    argsTextDelta: k.args,
                  }),
                    f.enqueue({ type: "tool-call", ...k }));
              (f.enqueue({
                type: "finish",
                finishReason: v.finishReason,
                usage: v.usage,
                logprobs: v.logprobs,
                providerMetadata: v.providerMetadata,
              }),
                f.close());
            },
          }),
          rawCall: v.rawCall,
          rawResponse: v.rawResponse,
          warnings: v.warnings,
        };
      }
      const { args: t, warnings: r } = this.getArgs(e),
        n = {
          ...t,
          stream: !0,
          stream_options:
            this.config.compatibility === "strict"
              ? { include_usage: !0 }
              : void 0,
        },
        { responseHeaders: a, value: s } = await Be({
          url: this.config.url({
            path: "/chat/completions",
            modelId: this.modelId,
          }),
          headers: qe(this.config.headers(), e.headers),
          body: n,
          failedResponseHandler: We,
          successfulResponseHandler: Xr(ag),
          abortSignal: e.abortSignal,
          fetch: this.config.fetch,
        }),
        { messages: o, ...i } = t,
        l = [];
      let c = "unknown",
        u = { promptTokens: void 0, completionTokens: void 0 },
        d,
        g = !0;
      const { useLegacyFunctionCalling: _ } = this.settings,
        h = { openai: {} };
      return {
        stream: s.pipeThrough(
          new TransformStream({
            transform(v, p) {
              var f, k, S, w, A, I, z, b, x, D, q, Q;
              if (!v.success) {
                ((c = "error"), p.enqueue({ type: "error", error: v.error }));
                return;
              }
              const L = v.value;
              if ("error" in L) {
                ((c = "error"), p.enqueue({ type: "error", error: L.error }));
                return;
              }
              if (
                (g &&
                  ((g = !1),
                  p.enqueue({ type: "response-metadata", ...Jr(L) })),
                L.usage != null)
              ) {
                const {
                  prompt_tokens: j,
                  completion_tokens: Z,
                  prompt_tokens_details: V,
                  completion_tokens_details: J,
                } = L.usage;
                ((u = {
                  promptTokens: j ?? void 0,
                  completionTokens: Z ?? void 0,
                }),
                  (J == null ? void 0 : J.reasoning_tokens) != null &&
                    (h.openai.reasoningTokens =
                      J == null ? void 0 : J.reasoning_tokens),
                  (J == null ? void 0 : J.accepted_prediction_tokens) != null &&
                    (h.openai.acceptedPredictionTokens =
                      J == null ? void 0 : J.accepted_prediction_tokens),
                  (J == null ? void 0 : J.rejected_prediction_tokens) != null &&
                    (h.openai.rejectedPredictionTokens =
                      J == null ? void 0 : J.rejected_prediction_tokens),
                  (V == null ? void 0 : V.cached_tokens) != null &&
                    (h.openai.cachedPromptTokens =
                      V == null ? void 0 : V.cached_tokens));
              }
              const R = L.choices[0];
              if (
                ((R == null ? void 0 : R.finish_reason) != null &&
                  (c = Vr(R.finish_reason)),
                (R == null ? void 0 : R.delta) == null)
              )
                return;
              const O = R.delta;
              O.content != null &&
                p.enqueue({ type: "text-delta", textDelta: O.content });
              const H = Xa(R == null ? void 0 : R.logprobs);
              H != null && H.length && (d === void 0 && (d = []), d.push(...H));
              const F =
                _ && O.function_call != null
                  ? [
                      {
                        type: "function",
                        id: ft(),
                        function: O.function_call,
                        index: 0,
                      },
                    ]
                  : O.tool_calls;
              if (F != null)
                for (const j of F) {
                  const Z = j.index;
                  if (l[Z] == null) {
                    if (j.type !== "function")
                      throw new un({
                        data: j,
                        message: "Expected 'function' type.",
                      });
                    if (j.id == null)
                      throw new un({
                        data: j,
                        message: "Expected 'id' to be a string.",
                      });
                    if (((f = j.function) == null ? void 0 : f.name) == null)
                      throw new un({
                        data: j,
                        message: "Expected 'function.name' to be a string.",
                      });
                    l[Z] = {
                      id: j.id,
                      type: "function",
                      function: {
                        name: j.function.name,
                        arguments: (k = j.function.arguments) != null ? k : "",
                      },
                      hasFinished: !1,
                    };
                    const J = l[Z];
                    ((S = J.function) == null ? void 0 : S.name) != null &&
                      ((w = J.function) == null ? void 0 : w.arguments) !=
                        null &&
                      (J.function.arguments.length > 0 &&
                        p.enqueue({
                          type: "tool-call-delta",
                          toolCallType: "function",
                          toolCallId: J.id,
                          toolName: J.function.name,
                          argsTextDelta: J.function.arguments,
                        }),
                      $a(J.function.arguments) &&
                        (p.enqueue({
                          type: "tool-call",
                          toolCallType: "function",
                          toolCallId: (A = J.id) != null ? A : ft(),
                          toolName: J.function.name,
                          args: J.function.arguments,
                        }),
                        (J.hasFinished = !0)));
                    continue;
                  }
                  const V = l[Z];
                  V.hasFinished ||
                    (((I = j.function) == null ? void 0 : I.arguments) !=
                      null &&
                      (V.function.arguments +=
                        (b = (z = j.function) == null ? void 0 : z.arguments) !=
                        null
                          ? b
                          : ""),
                    p.enqueue({
                      type: "tool-call-delta",
                      toolCallType: "function",
                      toolCallId: V.id,
                      toolName: V.function.name,
                      argsTextDelta:
                        (x = j.function.arguments) != null ? x : "",
                    }),
                    ((D = V.function) == null ? void 0 : D.name) != null &&
                      ((q = V.function) == null ? void 0 : q.arguments) !=
                        null &&
                      $a(V.function.arguments) &&
                      (p.enqueue({
                        type: "tool-call",
                        toolCallType: "function",
                        toolCallId: (Q = V.id) != null ? Q : ft(),
                        toolName: V.function.name,
                        args: V.function.arguments,
                      }),
                      (V.hasFinished = !0)));
                }
            },
            flush(v) {
              var p, f;
              v.enqueue({
                type: "finish",
                finishReason: c,
                logprobs: d,
                usage: {
                  promptTokens: (p = u.promptTokens) != null ? p : NaN,
                  completionTokens: (f = u.completionTokens) != null ? f : NaN,
                },
                ...(h != null ? { providerMetadata: h } : {}),
              });
            },
          }),
        ),
        rawCall: { rawPrompt: o, rawSettings: i },
        rawResponse: { headers: a },
        request: { body: JSON.stringify(n) },
        warnings: r,
      };
    }
  },
  Zi = y({
    prompt_tokens: N().nullish(),
    completion_tokens: N().nullish(),
    prompt_tokens_details: y({ cached_tokens: N().nullish() }).nullish(),
    completion_tokens_details: y({
      reasoning_tokens: N().nullish(),
      accepted_prediction_tokens: N().nullish(),
      rejected_prediction_tokens: N().nullish(),
    }).nullish(),
  }).nullish(),
  ng = y({
    id: m().nullish(),
    created: N().nullish(),
    model: m().nullish(),
    choices: K(
      y({
        message: y({
          role: $("assistant").nullish(),
          content: m().nullish(),
          function_call: y({ arguments: m(), name: m() }).nullish(),
          tool_calls: K(
            y({
              id: m().nullish(),
              type: $("function"),
              function: y({ name: m(), arguments: m() }),
            }),
          ).nullish(),
        }),
        index: N(),
        logprobs: y({
          content: K(
            y({
              token: m(),
              logprob: N(),
              top_logprobs: K(y({ token: m(), logprob: N() })),
            }),
          ).nullable(),
        }).nullish(),
        finish_reason: m().nullish(),
      }),
    ),
    usage: Zi,
  }),
  ag = de([
    y({
      id: m().nullish(),
      created: N().nullish(),
      model: m().nullish(),
      choices: K(
        y({
          delta: y({
            role: ct(["assistant"]).nullish(),
            content: m().nullish(),
            function_call: y({
              name: m().optional(),
              arguments: m().optional(),
            }).nullish(),
            tool_calls: K(
              y({
                index: N(),
                id: m().nullish(),
                type: $("function").nullish(),
                function: y({ name: m().nullish(), arguments: m().nullish() }),
              }),
            ).nullish(),
          }).nullish(),
          logprobs: y({
            content: K(
              y({
                token: m(),
                logprob: N(),
                top_logprobs: K(y({ token: m(), logprob: N() })),
              }),
            ).nullable(),
          }).nullish(),
          finish_reason: m().nullish(),
          index: N(),
        }),
      ),
      usage: Zi,
    }),
    aa,
  ]);
function Ln(e) {
  return e.startsWith("o") || e.startsWith("gpt-5");
}
function sg(e) {
  return e.startsWith("gpt-4o-audio-preview");
}
function og(e) {
  var t, r;
  return Ln(e)
    ? (r = (t = ig[e]) == null ? void 0 : t.systemMessageMode) != null
      ? r
      : "developer"
    : "system";
}
var ig = {
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
function lg({
  prompt: e,
  inputFormat: t,
  user: r = "user",
  assistant: n = "assistant",
}) {
  if (
    t === "prompt" &&
    e.length === 1 &&
    e[0].role === "user" &&
    e[0].content.length === 1 &&
    e[0].content[0].type === "text"
  )
    return { prompt: e[0].content[0].text };
  let a = "";
  e[0].role === "system" &&
    ((a += `${e[0].content}

`),
    (e = e.slice(1)));
  for (const { role: s, content: o } of e)
    switch (s) {
      case "system":
        throw new Qe({
          message: "Unexpected system message in prompt: ${content}",
          prompt: e,
        });
      case "user": {
        const i = o
          .map((l) => {
            switch (l.type) {
              case "text":
                return l.text;
              case "image":
                throw new le({ functionality: "images" });
            }
          })
          .join("");
        a += `${r}:
${i}

`;
        break;
      }
      case "assistant": {
        const i = o
          .map((l) => {
            switch (l.type) {
              case "text":
                return l.text;
              case "tool-call":
                throw new le({ functionality: "tool-call messages" });
            }
          })
          .join("");
        a += `${n}:
${i}

`;
        break;
      }
      case "tool":
        throw new le({ functionality: "tool messages" });
      default: {
        const i = s;
        throw new Error(`Unsupported role: ${i}`);
      }
    }
  return (
    (a += `${n}:
`),
    {
      prompt: a,
      stopSequences: [
        `
${r}:`,
      ],
    }
  );
}
function Qa(e) {
  return e == null
    ? void 0
    : e.tokens.map((t, r) => ({
        token: t,
        logprob: e.token_logprobs[r],
        topLogprobs: e.top_logprobs
          ? Object.entries(e.top_logprobs[r]).map(([n, a]) => ({
              token: n,
              logprob: a,
            }))
          : [],
      }));
}
var cg = class {
    constructor(e, t, r) {
      ((this.specificationVersion = "v1"),
        (this.defaultObjectGenerationMode = void 0),
        (this.modelId = e),
        (this.settings = t),
        (this.config = r));
    }
    get provider() {
      return this.config.provider;
    }
    getArgs({
      mode: e,
      inputFormat: t,
      prompt: r,
      maxTokens: n,
      temperature: a,
      topP: s,
      topK: o,
      frequencyPenalty: i,
      presencePenalty: l,
      stopSequences: c,
      responseFormat: u,
      seed: d,
    }) {
      var g;
      const _ = e.type,
        h = [];
      (o != null && h.push({ type: "unsupported-setting", setting: "topK" }),
        u != null &&
          u.type !== "text" &&
          h.push({
            type: "unsupported-setting",
            setting: "responseFormat",
            details: "JSON response format is not supported.",
          }));
      const { prompt: v, stopSequences: p } = lg({ prompt: r, inputFormat: t }),
        f = [...(p ?? []), ...(c ?? [])],
        k = {
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
          temperature: a,
          top_p: s,
          frequency_penalty: i,
          presence_penalty: l,
          seed: d,
          prompt: v,
          stop: f.length > 0 ? f : void 0,
        };
      switch (_) {
        case "regular": {
          if ((g = e.tools) != null && g.length)
            throw new le({ functionality: "tools" });
          if (e.toolChoice) throw new le({ functionality: "toolChoice" });
          return { args: k, warnings: h };
        }
        case "object-json":
          throw new le({ functionality: "object-json mode" });
        case "object-tool":
          throw new le({ functionality: "object-tool mode" });
        default: {
          const S = _;
          throw new Error(`Unsupported type: ${S}`);
        }
      }
    }
    async doGenerate(e) {
      const { args: t, warnings: r } = this.getArgs(e),
        {
          responseHeaders: n,
          value: a,
          rawValue: s,
        } = await Be({
          url: this.config.url({ path: "/completions", modelId: this.modelId }),
          headers: qe(this.config.headers(), e.headers),
          body: t,
          failedResponseHandler: We,
          successfulResponseHandler: Ct(ug),
          abortSignal: e.abortSignal,
          fetch: this.config.fetch,
        }),
        { prompt: o, ...i } = t,
        l = a.choices[0];
      return {
        text: l.text,
        usage: {
          promptTokens: a.usage.prompt_tokens,
          completionTokens: a.usage.completion_tokens,
        },
        finishReason: Vr(l.finish_reason),
        logprobs: Qa(l.logprobs),
        rawCall: { rawPrompt: o, rawSettings: i },
        rawResponse: { headers: n, body: s },
        response: Jr(a),
        warnings: r,
        request: { body: JSON.stringify(t) },
      };
    }
    async doStream(e) {
      const { args: t, warnings: r } = this.getArgs(e),
        n = {
          ...t,
          stream: !0,
          stream_options:
            this.config.compatibility === "strict"
              ? { include_usage: !0 }
              : void 0,
        },
        { responseHeaders: a, value: s } = await Be({
          url: this.config.url({ path: "/completions", modelId: this.modelId }),
          headers: qe(this.config.headers(), e.headers),
          body: n,
          failedResponseHandler: We,
          successfulResponseHandler: Xr(dg),
          abortSignal: e.abortSignal,
          fetch: this.config.fetch,
        }),
        { prompt: o, ...i } = t;
      let l = "unknown",
        c = { promptTokens: Number.NaN, completionTokens: Number.NaN },
        u,
        d = !0;
      return {
        stream: s.pipeThrough(
          new TransformStream({
            transform(g, _) {
              if (!g.success) {
                ((l = "error"), _.enqueue({ type: "error", error: g.error }));
                return;
              }
              const h = g.value;
              if ("error" in h) {
                ((l = "error"), _.enqueue({ type: "error", error: h.error }));
                return;
              }
              (d &&
                ((d = !1), _.enqueue({ type: "response-metadata", ...Jr(h) })),
                h.usage != null &&
                  (c = {
                    promptTokens: h.usage.prompt_tokens,
                    completionTokens: h.usage.completion_tokens,
                  }));
              const v = h.choices[0];
              ((v == null ? void 0 : v.finish_reason) != null &&
                (l = Vr(v.finish_reason)),
                (v == null ? void 0 : v.text) != null &&
                  _.enqueue({ type: "text-delta", textDelta: v.text }));
              const p = Qa(v == null ? void 0 : v.logprobs);
              p != null && p.length && (u === void 0 && (u = []), u.push(...p));
            },
            flush(g) {
              g.enqueue({
                type: "finish",
                finishReason: l,
                logprobs: u,
                usage: c,
              });
            },
          }),
        ),
        rawCall: { rawPrompt: o, rawSettings: i },
        rawResponse: { headers: a },
        warnings: r,
        request: { body: JSON.stringify(n) },
      };
    }
  },
  ug = y({
    id: m().nullish(),
    created: N().nullish(),
    model: m().nullish(),
    choices: K(
      y({
        text: m(),
        finish_reason: m(),
        logprobs: y({
          tokens: K(m()),
          token_logprobs: K(N()),
          top_logprobs: K(Qt(m(), N())).nullable(),
        }).nullish(),
      }),
    ),
    usage: y({ prompt_tokens: N(), completion_tokens: N() }),
  }),
  dg = de([
    y({
      id: m().nullish(),
      created: N().nullish(),
      model: m().nullish(),
      choices: K(
        y({
          text: m(),
          finish_reason: m().nullish(),
          index: N(),
          logprobs: y({
            tokens: K(m()),
            token_logprobs: K(N()),
            top_logprobs: K(Qt(m(), N())).nullable(),
          }).nullish(),
        }),
      ),
      usage: y({ prompt_tokens: N(), completion_tokens: N() }).nullish(),
    }),
    aa,
  ]),
  pg = class {
    constructor(e, t, r) {
      ((this.specificationVersion = "v1"),
        (this.modelId = e),
        (this.settings = t),
        (this.config = r));
    }
    get provider() {
      return this.config.provider;
    }
    get maxEmbeddingsPerCall() {
      var e;
      return (e = this.settings.maxEmbeddingsPerCall) != null ? e : 2048;
    }
    get supportsParallelCalls() {
      var e;
      return (e = this.settings.supportsParallelCalls) != null ? e : !0;
    }
    async doEmbed({ values: e, headers: t, abortSignal: r }) {
      if (e.length > this.maxEmbeddingsPerCall)
        throw new Wc({
          provider: this.provider,
          modelId: this.modelId,
          maxEmbeddingsPerCall: this.maxEmbeddingsPerCall,
          values: e,
        });
      const { responseHeaders: n, value: a } = await Be({
        url: this.config.url({ path: "/embeddings", modelId: this.modelId }),
        headers: qe(this.config.headers(), t),
        body: {
          model: this.modelId,
          input: e,
          encoding_format: "float",
          dimensions: this.settings.dimensions,
          user: this.settings.user,
        },
        failedResponseHandler: We,
        successfulResponseHandler: Ct(mg),
        abortSignal: r,
        fetch: this.config.fetch,
      });
      return {
        embeddings: a.data.map((s) => s.embedding),
        usage: a.usage ? { tokens: a.usage.prompt_tokens } : void 0,
        rawResponse: { headers: n },
      };
    }
  },
  mg = y({
    data: K(y({ embedding: K(N()) })),
    usage: y({ prompt_tokens: N() }).nullish(),
  }),
  gg = { "dall-e-3": 1, "dall-e-2": 10, "gpt-image-1": 10 },
  fg = new Set(["gpt-image-1"]),
  hg = class {
    constructor(e, t, r) {
      ((this.modelId = e),
        (this.settings = t),
        (this.config = r),
        (this.specificationVersion = "v1"));
    }
    get maxImagesPerCall() {
      var e, t;
      return (t =
        (e = this.settings.maxImagesPerCall) != null ? e : gg[this.modelId]) !=
        null
        ? t
        : 1;
    }
    get provider() {
      return this.config.provider;
    }
    async doGenerate({
      prompt: e,
      n: t,
      size: r,
      aspectRatio: n,
      seed: a,
      providerOptions: s,
      headers: o,
      abortSignal: i,
    }) {
      var l, c, u, d;
      const g = [];
      (n != null &&
        g.push({
          type: "unsupported-setting",
          setting: "aspectRatio",
          details:
            "This model does not support aspect ratio. Use `size` instead.",
        }),
        a != null && g.push({ type: "unsupported-setting", setting: "seed" }));
      const _ =
          (u =
            (c =
              (l = this.config._internal) == null ? void 0 : l.currentDate) ==
            null
              ? void 0
              : c.call(l)) != null
            ? u
            : new Date(),
        { value: h, responseHeaders: v } = await Be({
          url: this.config.url({
            path: "/images/generations",
            modelId: this.modelId,
          }),
          headers: qe(this.config.headers(), o),
          body: {
            model: this.modelId,
            prompt: e,
            n: t,
            size: r,
            ...((d = s.openai) != null ? d : {}),
            ...(fg.has(this.modelId) ? {} : { response_format: "b64_json" }),
          },
          failedResponseHandler: We,
          successfulResponseHandler: Ct(yg),
          abortSignal: i,
          fetch: this.config.fetch,
        });
      return {
        images: h.data.map((p) => p.b64_json),
        warnings: g,
        response: { timestamp: _, modelId: this.modelId, headers: v },
      };
    }
  },
  yg = y({ data: K(y({ b64_json: m() })) }),
  vg = y({
    include: K(m()).nullish(),
    language: m().nullish(),
    prompt: m().nullish(),
    temperature: N().min(0).max(1).nullish().default(0),
    timestampGranularities: K(ct(["word", "segment"]))
      .nullish()
      .default(["segment"]),
  }),
  es = {
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
  _g = class {
    constructor(e, t) {
      ((this.modelId = e),
        (this.config = t),
        (this.specificationVersion = "v1"));
    }
    get provider() {
      return this.config.provider;
    }
    getArgs({ audio: e, mediaType: t, providerOptions: r }) {
      var n, a, s, o, i;
      const l = [],
        c = Yr({ provider: "openai", providerOptions: r, schema: vg }),
        u = new FormData(),
        d = e instanceof Uint8Array ? new Blob([e]) : new Blob([Qr(e)]);
      if (
        (u.append("model", this.modelId),
        u.append("file", new File([d], "audio", { type: t })),
        c)
      ) {
        const g = {
          include: (n = c.include) != null ? n : void 0,
          language: (a = c.language) != null ? a : void 0,
          prompt: (s = c.prompt) != null ? s : void 0,
          temperature: (o = c.temperature) != null ? o : void 0,
          timestamp_granularities:
            (i = c.timestampGranularities) != null ? i : void 0,
        };
        for (const _ in g) {
          const h = g[_];
          h !== void 0 && u.append(_, String(h));
        }
      }
      return { formData: u, warnings: l };
    }
    async doGenerate(e) {
      var t, r, n, a, s, o;
      const i =
          (n =
            (r =
              (t = this.config._internal) == null ? void 0 : t.currentDate) ==
            null
              ? void 0
              : r.call(t)) != null
            ? n
            : new Date(),
        { formData: l, warnings: c } = this.getArgs(e),
        {
          value: u,
          responseHeaders: d,
          rawValue: g,
        } = await hu({
          url: this.config.url({
            path: "/audio/transcriptions",
            modelId: this.modelId,
          }),
          headers: qe(this.config.headers(), e.headers),
          formData: l,
          failedResponseHandler: We,
          successfulResponseHandler: Ct(bg),
          abortSignal: e.abortSignal,
          fetch: this.config.fetch,
        }),
        _ = u.language != null && u.language in es ? es[u.language] : void 0;
      return {
        text: u.text,
        segments:
          (s =
            (a = u.words) == null
              ? void 0
              : a.map((h) => ({
                  text: h.word,
                  startSecond: h.start,
                  endSecond: h.end,
                }))) != null
            ? s
            : [],
        language: _,
        durationInSeconds: (o = u.duration) != null ? o : void 0,
        warnings: c,
        response: { timestamp: i, modelId: this.modelId, headers: d, body: g },
      };
    }
  },
  bg = y({
    text: m(),
    language: m().nullish(),
    duration: N().nullish(),
    words: K(y({ word: m(), start: N(), end: N() })).nullish(),
  });
function wg({ prompt: e, systemMessageMode: t }) {
  const r = [],
    n = [];
  for (const { role: a, content: s } of e)
    switch (a) {
      case "system": {
        switch (t) {
          case "system": {
            r.push({ role: "system", content: s });
            break;
          }
          case "developer": {
            r.push({ role: "developer", content: s });
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
            const o = t;
            throw new Error(`Unsupported system message mode: ${o}`);
          }
        }
        break;
      }
      case "user": {
        r.push({
          role: "user",
          content: s.map((o, i) => {
            var l, c, u, d;
            switch (o.type) {
              case "text":
                return { type: "input_text", text: o.text };
              case "image":
                return {
                  type: "input_image",
                  image_url:
                    o.image instanceof URL
                      ? o.image.toString()
                      : `data:${(l = o.mimeType) != null ? l : "image/jpeg"};base64,${Ut(o.image)}`,
                  detail:
                    (u =
                      (c = o.providerMetadata) == null ? void 0 : c.openai) ==
                    null
                      ? void 0
                      : u.imageDetail,
                };
              case "file": {
                if (o.data instanceof URL)
                  throw new le({ functionality: "File URLs in user messages" });
                switch (o.mimeType) {
                  case "application/pdf":
                    return {
                      type: "input_file",
                      filename: (d = o.filename) != null ? d : `part-${i}.pdf`,
                      file_data: `data:application/pdf;base64,${o.data}`,
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
        for (const o of s)
          switch (o.type) {
            case "text": {
              r.push({
                role: "assistant",
                content: [{ type: "output_text", text: o.text }],
              });
              break;
            }
            case "tool-call": {
              r.push({
                type: "function_call",
                call_id: o.toolCallId,
                name: o.toolName,
                arguments: JSON.stringify(o.args),
              });
              break;
            }
          }
        break;
      }
      case "tool": {
        for (const o of s)
          r.push({
            type: "function_call_output",
            call_id: o.toolCallId,
            output: JSON.stringify(o.result),
          });
        break;
      }
      default: {
        const o = a;
        throw new Error(`Unsupported role: ${o}`);
      }
    }
  return { messages: r, warnings: n };
}
function ts({ finishReason: e, hasToolCalls: t }) {
  switch (e) {
    case void 0:
    case null:
      return t ? "tool-calls" : "stop";
    case "max_output_tokens":
      return "length";
    case "content_filter":
      return "content-filter";
    default:
      return t ? "tool-calls" : "unknown";
  }
}
function xg({ mode: e, strict: t }) {
  var r;
  const n = (r = e.tools) != null && r.length ? e.tools : void 0,
    a = [];
  if (n == null) return { tools: void 0, tool_choice: void 0, toolWarnings: a };
  const s = e.toolChoice,
    o = [];
  for (const l of n)
    switch (l.type) {
      case "function":
        o.push({
          type: "function",
          name: l.name,
          description: l.description,
          parameters: l.parameters,
          strict: t ? !0 : void 0,
        });
        break;
      case "provider-defined":
        switch (l.id) {
          case "openai.web_search_preview":
            o.push({
              type: "web_search_preview",
              search_context_size: l.args.searchContextSize,
              user_location: l.args.userLocation,
            });
            break;
          default:
            a.push({ type: "unsupported-tool", tool: l });
            break;
        }
        break;
      default:
        a.push({ type: "unsupported-tool", tool: l });
        break;
    }
  if (s == null) return { tools: o, tool_choice: void 0, toolWarnings: a };
  const i = s.type;
  switch (i) {
    case "auto":
    case "none":
    case "required":
      return { tools: o, tool_choice: i, toolWarnings: a };
    case "tool":
      return s.toolName === "web_search_preview"
        ? {
            tools: o,
            tool_choice: { type: "web_search_preview" },
            toolWarnings: a,
          }
        : {
            tools: o,
            tool_choice: { type: "function", name: s.toolName },
            toolWarnings: a,
          };
    default: {
      const l = i;
      throw new le({ functionality: `Unsupported tool choice type: ${l}` });
    }
  }
}
var kg = class {
    constructor(e, t) {
      ((this.specificationVersion = "v1"),
        (this.defaultObjectGenerationMode = "json"),
        (this.supportsStructuredOutputs = !0),
        (this.modelId = e),
        (this.config = t));
    }
    get provider() {
      return this.config.provider;
    }
    getArgs({
      mode: e,
      maxTokens: t,
      temperature: r,
      stopSequences: n,
      topP: a,
      topK: s,
      presencePenalty: o,
      frequencyPenalty: i,
      seed: l,
      prompt: c,
      providerMetadata: u,
      responseFormat: d,
    }) {
      var g, _, h;
      const v = [],
        p = zg(this.modelId),
        f = e.type;
      (s != null && v.push({ type: "unsupported-setting", setting: "topK" }),
        l != null && v.push({ type: "unsupported-setting", setting: "seed" }),
        o != null &&
          v.push({ type: "unsupported-setting", setting: "presencePenalty" }),
        i != null &&
          v.push({ type: "unsupported-setting", setting: "frequencyPenalty" }),
        n != null &&
          v.push({ type: "unsupported-setting", setting: "stopSequences" }));
      const { messages: k, warnings: S } = wg({
        prompt: c,
        systemMessageMode: p.systemMessageMode,
      });
      v.push(...S);
      const w = Yr({ provider: "openai", providerOptions: u, schema: Zg }),
        A = (g = w == null ? void 0 : w.strictSchemas) != null ? g : !0,
        I = {
          model: this.modelId,
          input: k,
          temperature: r,
          top_p: a,
          max_output_tokens: t,
          ...((d == null ? void 0 : d.type) === "json" && {
            text: {
              format:
                d.schema != null
                  ? {
                      type: "json_schema",
                      strict: A,
                      name: (_ = d.name) != null ? _ : "response",
                      description: d.description,
                      schema: d.schema,
                    }
                  : { type: "json_object" },
            },
          }),
          metadata: w == null ? void 0 : w.metadata,
          parallel_tool_calls: w == null ? void 0 : w.parallelToolCalls,
          previous_response_id: w == null ? void 0 : w.previousResponseId,
          store: w == null ? void 0 : w.store,
          user: w == null ? void 0 : w.user,
          instructions: w == null ? void 0 : w.instructions,
          ...(p.isReasoningModel &&
            ((w == null ? void 0 : w.reasoningEffort) != null ||
              (w == null ? void 0 : w.reasoningSummary) != null) && {
              reasoning: {
                ...((w == null ? void 0 : w.reasoningEffort) != null && {
                  effort: w.reasoningEffort,
                }),
                ...((w == null ? void 0 : w.reasoningSummary) != null && {
                  summary: w.reasoningSummary,
                }),
              },
            }),
          ...(p.requiredAutoTruncation && { truncation: "auto" }),
        };
      switch (
        (p.isReasoningModel &&
          (I.temperature != null &&
            ((I.temperature = void 0),
            v.push({
              type: "unsupported-setting",
              setting: "temperature",
              details: "temperature is not supported for reasoning models",
            })),
          I.top_p != null &&
            ((I.top_p = void 0),
            v.push({
              type: "unsupported-setting",
              setting: "topP",
              details: "topP is not supported for reasoning models",
            }))),
        f)
      ) {
        case "regular": {
          const {
            tools: z,
            tool_choice: b,
            toolWarnings: x,
          } = xg({ mode: e, strict: A });
          return {
            args: { ...I, tools: z, tool_choice: b },
            warnings: [...v, ...x],
          };
        }
        case "object-json":
          return {
            args: {
              ...I,
              text: {
                format:
                  e.schema != null
                    ? {
                        type: "json_schema",
                        strict: A,
                        name: (h = e.name) != null ? h : "response",
                        description: e.description,
                        schema: e.schema,
                      }
                    : { type: "json_object" },
              },
            },
            warnings: v,
          };
        case "object-tool":
          return {
            args: {
              ...I,
              tool_choice: { type: "function", name: e.tool.name },
              tools: [
                {
                  type: "function",
                  name: e.tool.name,
                  description: e.tool.description,
                  parameters: e.tool.parameters,
                  strict: A,
                },
              ],
            },
            warnings: v,
          };
        default: {
          const z = f;
          throw new Error(`Unsupported type: ${z}`);
        }
      }
    }
    async doGenerate(e) {
      var t, r, n, a, s, o, i;
      const { args: l, warnings: c } = this.getArgs(e),
        u = this.config.url({ path: "/responses", modelId: this.modelId }),
        {
          responseHeaders: d,
          value: g,
          rawValue: _,
        } = await Be({
          url: u,
          headers: qe(this.config.headers(), e.headers),
          body: l,
          failedResponseHandler: We,
          successfulResponseHandler: Ct(
            y({
              id: m(),
              created_at: N(),
              error: y({ message: m(), code: m() }).nullish(),
              model: m(),
              output: K(
                bt("type", [
                  y({
                    type: $("message"),
                    role: $("assistant"),
                    content: K(
                      y({
                        type: $("output_text"),
                        text: m(),
                        annotations: K(
                          y({
                            type: $("url_citation"),
                            start_index: N(),
                            end_index: N(),
                            url: m(),
                            title: m(),
                          }),
                        ),
                      }),
                    ),
                  }),
                  y({
                    type: $("function_call"),
                    call_id: m(),
                    name: m(),
                    arguments: m(),
                  }),
                  y({ type: $("web_search_call") }),
                  y({ type: $("computer_call") }),
                  y({
                    type: $("reasoning"),
                    summary: K(y({ type: $("summary_text"), text: m() })),
                  }),
                ]),
              ),
              incomplete_details: y({ reason: m() }).nullable(),
              usage: Vi,
            }),
          ),
          abortSignal: e.abortSignal,
          fetch: this.config.fetch,
        });
      if (g.error)
        throw new Ce({
          message: g.error.message,
          url: u,
          requestBodyValues: l,
          statusCode: 400,
          responseHeaders: d,
          responseBody: _,
          isRetryable: !1,
        });
      const h = g.output
          .filter((f) => f.type === "message")
          .flatMap((f) => f.content)
          .filter((f) => f.type === "output_text"),
        v = g.output
          .filter((f) => f.type === "function_call")
          .map((f) => ({
            toolCallType: "function",
            toolCallId: f.call_id,
            toolName: f.name,
            args: f.arguments,
          })),
        p =
          (r =
            (t = g.output.find((f) => f.type === "reasoning")) == null
              ? void 0
              : t.summary) != null
            ? r
            : null;
      return {
        text: h.map((f) => f.text).join(`
`),
        sources: h.flatMap((f) =>
          f.annotations.map((k) => {
            var S, w, A;
            return {
              sourceType: "url",
              id:
                (A =
                  (w = (S = this.config).generateId) == null
                    ? void 0
                    : w.call(S)) != null
                  ? A
                  : ft(),
              url: k.url,
              title: k.title,
            };
          }),
        ),
        finishReason: ts({
          finishReason: (n = g.incomplete_details) == null ? void 0 : n.reason,
          hasToolCalls: v.length > 0,
        }),
        toolCalls: v.length > 0 ? v : void 0,
        reasoning: p ? p.map((f) => ({ type: "text", text: f.text })) : void 0,
        usage: {
          promptTokens: g.usage.input_tokens,
          completionTokens: g.usage.output_tokens,
        },
        rawCall: { rawPrompt: void 0, rawSettings: {} },
        rawResponse: { headers: d, body: _ },
        request: { body: JSON.stringify(l) },
        response: {
          id: g.id,
          timestamp: new Date(g.created_at * 1e3),
          modelId: g.model,
        },
        providerMetadata: {
          openai: {
            responseId: g.id,
            cachedPromptTokens:
              (s =
                (a = g.usage.input_tokens_details) == null
                  ? void 0
                  : a.cached_tokens) != null
                ? s
                : null,
            reasoningTokens:
              (i =
                (o = g.usage.output_tokens_details) == null
                  ? void 0
                  : o.reasoning_tokens) != null
                ? i
                : null,
          },
        },
        warnings: c,
      };
    }
    async doStream(e) {
      const { args: t, warnings: r } = this.getArgs(e),
        { responseHeaders: n, value: a } = await Be({
          url: this.config.url({ path: "/responses", modelId: this.modelId }),
          headers: qe(this.config.headers(), e.headers),
          body: { ...t, stream: !0 },
          failedResponseHandler: We,
          successfulResponseHandler: Xr(Og),
          abortSignal: e.abortSignal,
          fetch: this.config.fetch,
        }),
        s = this;
      let o = "unknown",
        i = NaN,
        l = NaN,
        c = null,
        u = null,
        d = null;
      const g = {};
      let _ = !1;
      return {
        stream: a.pipeThrough(
          new TransformStream({
            transform(h, v) {
              var p, f, k, S, w, A, I, z;
              if (!h.success) {
                ((o = "error"), v.enqueue({ type: "error", error: h.error }));
                return;
              }
              const b = h.value;
              if (Ug(b))
                b.item.type === "function_call" &&
                  ((g[b.output_index] = {
                    toolName: b.item.name,
                    toolCallId: b.item.call_id,
                  }),
                  v.enqueue({
                    type: "tool-call-delta",
                    toolCallType: "function",
                    toolCallId: b.item.call_id,
                    toolName: b.item.name,
                    argsTextDelta: b.item.arguments,
                  }));
              else if (Lg(b)) {
                const x = g[b.output_index];
                x != null &&
                  v.enqueue({
                    type: "tool-call-delta",
                    toolCallType: "function",
                    toolCallId: x.toolCallId,
                    toolName: x.toolName,
                    argsTextDelta: b.delta,
                  });
              } else
                Dg(b)
                  ? ((d = b.response.id),
                    v.enqueue({
                      type: "response-metadata",
                      id: b.response.id,
                      timestamp: new Date(b.response.created_at * 1e3),
                      modelId: b.response.model,
                    }))
                  : jg(b)
                    ? v.enqueue({ type: "text-delta", textDelta: b.delta })
                    : qg(b)
                      ? v.enqueue({ type: "reasoning", textDelta: b.delta })
                      : Mg(b) && b.item.type === "function_call"
                        ? ((g[b.output_index] = void 0),
                          (_ = !0),
                          v.enqueue({
                            type: "tool-call",
                            toolCallType: "function",
                            toolCallId: b.item.call_id,
                            toolName: b.item.name,
                            args: b.item.arguments,
                          }))
                        : $g(b)
                          ? ((o = ts({
                              finishReason:
                                (p = b.response.incomplete_details) == null
                                  ? void 0
                                  : p.reason,
                              hasToolCalls: _,
                            })),
                            (i = b.response.usage.input_tokens),
                            (l = b.response.usage.output_tokens),
                            (c =
                              (k =
                                (f = b.response.usage.input_tokens_details) ==
                                null
                                  ? void 0
                                  : f.cached_tokens) != null
                                ? k
                                : c),
                            (u =
                              (w =
                                (S = b.response.usage.output_tokens_details) ==
                                null
                                  ? void 0
                                  : S.reasoning_tokens) != null
                                ? w
                                : u))
                          : Fg(b)
                            ? v.enqueue({
                                type: "source",
                                source: {
                                  sourceType: "url",
                                  id:
                                    (z =
                                      (I = (A = s.config).generateId) == null
                                        ? void 0
                                        : I.call(A)) != null
                                      ? z
                                      : ft(),
                                  url: b.annotation.url,
                                  title: b.annotation.title,
                                },
                              })
                            : Bg(b) && v.enqueue({ type: "error", error: b });
            },
            flush(h) {
              h.enqueue({
                type: "finish",
                finishReason: o,
                usage: { promptTokens: i, completionTokens: l },
                ...((c != null || u != null) && {
                  providerMetadata: {
                    openai: {
                      responseId: d,
                      cachedPromptTokens: c,
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
        request: { body: JSON.stringify(t) },
        warnings: r,
      };
    }
  },
  Vi = y({
    input_tokens: N(),
    input_tokens_details: y({ cached_tokens: N().nullish() }).nullish(),
    output_tokens: N(),
    output_tokens_details: y({ reasoning_tokens: N().nullish() }).nullish(),
  }),
  Ag = y({ type: $("response.output_text.delta"), delta: m() }),
  Sg = y({
    type: ct(["response.completed", "response.incomplete"]),
    response: y({
      incomplete_details: y({ reason: m() }).nullish(),
      usage: Vi,
    }),
  }),
  Tg = y({
    type: $("response.created"),
    response: y({ id: m(), created_at: N(), model: m() }),
  }),
  Cg = y({
    type: $("response.output_item.done"),
    output_index: N(),
    item: bt("type", [
      y({ type: $("message") }),
      y({
        type: $("function_call"),
        id: m(),
        call_id: m(),
        name: m(),
        arguments: m(),
        status: $("completed"),
      }),
    ]),
  }),
  Ig = y({
    type: $("response.function_call_arguments.delta"),
    item_id: m(),
    output_index: N(),
    delta: m(),
  }),
  Eg = y({
    type: $("response.output_item.added"),
    output_index: N(),
    item: bt("type", [
      y({ type: $("message") }),
      y({
        type: $("function_call"),
        id: m(),
        call_id: m(),
        name: m(),
        arguments: m(),
      }),
    ]),
  }),
  Rg = y({
    type: $("response.output_text.annotation.added"),
    annotation: y({ type: $("url_citation"), url: m(), title: m() }),
  }),
  Pg = y({
    type: $("response.reasoning_summary_text.delta"),
    item_id: m(),
    output_index: N(),
    summary_index: N(),
    delta: m(),
  }),
  Ng = y({
    type: $("error"),
    code: m(),
    message: m(),
    param: m().nullish(),
    sequence_number: N(),
  }),
  Og = de([Ag, Sg, Tg, Cg, Ig, Eg, Rg, Pg, Ng, y({ type: m() }).passthrough()]);
function jg(e) {
  return e.type === "response.output_text.delta";
}
function Mg(e) {
  return e.type === "response.output_item.done";
}
function $g(e) {
  return e.type === "response.completed" || e.type === "response.incomplete";
}
function Dg(e) {
  return e.type === "response.created";
}
function Lg(e) {
  return e.type === "response.function_call_arguments.delta";
}
function Ug(e) {
  return e.type === "response.output_item.added";
}
function Fg(e) {
  return e.type === "response.output_text.annotation.added";
}
function qg(e) {
  return e.type === "response.reasoning_summary_text.delta";
}
function Bg(e) {
  return e.type === "error";
}
function zg(e) {
  return e.startsWith("o") || e.startsWith("gpt-5")
    ? e.startsWith("o1-mini") || e.startsWith("o1-preview")
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
var Zg = y({
    metadata: Js().nullish(),
    parallelToolCalls: Pe().nullish(),
    previousResponseId: m().nullish(),
    store: Pe().nullish(),
    user: m().nullish(),
    reasoningEffort: m().nullish(),
    strictSchemas: Pe().nullish(),
    instructions: m().nullish(),
    reasoningSummary: m().nullish(),
  }),
  Vg = y({});
function Jg({ searchContextSize: e, userLocation: t } = {}) {
  return {
    type: "provider-defined",
    id: "openai.web_search_preview",
    args: { searchContextSize: e, userLocation: t },
    parameters: Vg,
  };
}
var Hg = { webSearchPreview: Jg },
  Wg = y({
    instructions: m().nullish(),
    speed: N().min(0.25).max(4).default(1).nullish(),
  }),
  Gg = class {
    constructor(e, t) {
      ((this.modelId = e),
        (this.config = t),
        (this.specificationVersion = "v1"));
    }
    get provider() {
      return this.config.provider;
    }
    getArgs({
      text: e,
      voice: t = "alloy",
      outputFormat: r = "mp3",
      speed: n,
      instructions: a,
      providerOptions: s,
    }) {
      const o = [],
        i = Yr({ provider: "openai", providerOptions: s, schema: Wg }),
        l = {
          model: this.modelId,
          input: e,
          voice: t,
          response_format: "mp3",
          speed: n,
          instructions: a,
        };
      if (
        (r &&
          (["mp3", "opus", "aac", "flac", "wav", "pcm"].includes(r)
            ? (l.response_format = r)
            : o.push({
                type: "unsupported-setting",
                setting: "outputFormat",
                details: `Unsupported output format: ${r}. Using mp3 instead.`,
              })),
        i)
      ) {
        const c = {};
        for (const u in c) {
          const d = c[u];
          d !== void 0 && (l[u] = d);
        }
      }
      return { requestBody: l, warnings: o };
    }
    async doGenerate(e) {
      var t, r, n;
      const a =
          (n =
            (r =
              (t = this.config._internal) == null ? void 0 : t.currentDate) ==
            null
              ? void 0
              : r.call(t)) != null
            ? n
            : new Date(),
        { requestBody: s, warnings: o } = this.getArgs(e),
        {
          value: i,
          responseHeaders: l,
          rawValue: c,
        } = await Be({
          url: this.config.url({
            path: "/audio/speech",
            modelId: this.modelId,
          }),
          headers: qe(this.config.headers(), e.headers),
          body: s,
          failedResponseHandler: We,
          successfulResponseHandler: vu(),
          abortSignal: e.abortSignal,
          fetch: this.config.fetch,
        });
      return {
        audio: i,
        warnings: o,
        request: { body: JSON.stringify(s) },
        response: { timestamp: a, modelId: this.modelId, headers: l, body: c },
      };
    }
  };
function Hr(e = {}) {
  var t, r, n;
  const a = (t = Lo(e.baseURL)) != null ? t : "https://api.openai.com/v1",
    s = (r = e.compatibility) != null ? r : "compatible",
    o = (n = e.name) != null ? n : "openai",
    i = () => ({
      Authorization: `Bearer ${Mo({ apiKey: e.apiKey, environmentVariableName: "OPENAI_API_KEY", description: "OpenAI" })}`,
      "OpenAI-Organization": e.organization,
      "OpenAI-Project": e.project,
      ...e.headers,
    }),
    l = (f, k = {}) =>
      new rg(f, k, {
        provider: `${o}.chat`,
        url: ({ path: S }) => `${a}${S}`,
        headers: i,
        compatibility: s,
        fetch: e.fetch,
      }),
    c = (f, k = {}) =>
      new cg(f, k, {
        provider: `${o}.completion`,
        url: ({ path: S }) => `${a}${S}`,
        headers: i,
        compatibility: s,
        fetch: e.fetch,
      }),
    u = (f, k = {}) =>
      new pg(f, k, {
        provider: `${o}.embedding`,
        url: ({ path: S }) => `${a}${S}`,
        headers: i,
        fetch: e.fetch,
      }),
    d = (f, k = {}) =>
      new hg(f, k, {
        provider: `${o}.image`,
        url: ({ path: S }) => `${a}${S}`,
        headers: i,
        fetch: e.fetch,
      }),
    g = (f) =>
      new _g(f, {
        provider: `${o}.transcription`,
        url: ({ path: k }) => `${a}${k}`,
        headers: i,
        fetch: e.fetch,
      }),
    _ = (f) =>
      new Gg(f, {
        provider: `${o}.speech`,
        url: ({ path: k }) => `${a}${k}`,
        headers: i,
        fetch: e.fetch,
      }),
    h = (f, k) => {
      if (new.target)
        throw new Error(
          "The OpenAI model function cannot be called with the new keyword.",
        );
      return f === "gpt-3.5-turbo-instruct" ? c(f, k) : l(f, k);
    },
    v = (f) =>
      new kg(f, {
        provider: `${o}.responses`,
        url: ({ path: k }) => `${a}${k}`,
        headers: i,
        fetch: e.fetch,
      }),
    p = function (f, k) {
      return h(f, k);
    };
  return (
    (p.languageModel = h),
    (p.chat = l),
    (p.completion = c),
    (p.responses = v),
    (p.embedding = u),
    (p.textEmbedding = u),
    (p.textEmbeddingModel = u),
    (p.image = d),
    (p.imageModel = d),
    (p.transcription = g),
    (p.transcriptionModel = g),
    (p.speech = _),
    (p.speechModel = _),
    (p.tools = Hg),
    p
  );
}
Hr({ compatibility: "strict" });
var Kg = y({ type: $("error"), error: y({ type: m(), message: m() }) }),
  rs = Do({ errorSchema: Kg, errorToMessage: (e) => e.error.message });
function Yg(e) {
  var t;
  const r = (t = e.tools) != null && t.length ? e.tools : void 0,
    n = [],
    a = new Set();
  if (r == null)
    return { tools: void 0, tool_choice: void 0, toolWarnings: n, betas: a };
  const s = [];
  for (const l of r)
    switch (l.type) {
      case "function":
        s.push({
          name: l.name,
          description: l.description,
          input_schema: l.parameters,
        });
        break;
      case "provider-defined":
        switch (l.id) {
          case "anthropic.computer_20250124":
            (a.add("computer-use-2025-01-24"),
              s.push({
                name: l.name,
                type: "computer_20250124",
                display_width_px: l.args.displayWidthPx,
                display_height_px: l.args.displayHeightPx,
                display_number: l.args.displayNumber,
              }));
            break;
          case "anthropic.computer_20241022":
            (a.add("computer-use-2024-10-22"),
              s.push({
                name: l.name,
                type: "computer_20241022",
                display_width_px: l.args.displayWidthPx,
                display_height_px: l.args.displayHeightPx,
                display_number: l.args.displayNumber,
              }));
            break;
          case "anthropic.text_editor_20250124":
            (a.add("computer-use-2025-01-24"),
              s.push({ name: l.name, type: "text_editor_20250124" }));
            break;
          case "anthropic.text_editor_20241022":
            (a.add("computer-use-2024-10-22"),
              s.push({ name: l.name, type: "text_editor_20241022" }));
            break;
          case "anthropic.bash_20250124":
            (a.add("computer-use-2025-01-24"),
              s.push({ name: l.name, type: "bash_20250124" }));
            break;
          case "anthropic.bash_20241022":
            (a.add("computer-use-2024-10-22"),
              s.push({ name: l.name, type: "bash_20241022" }));
            break;
          default:
            n.push({ type: "unsupported-tool", tool: l });
            break;
        }
        break;
      default:
        n.push({ type: "unsupported-tool", tool: l });
        break;
    }
  const o = e.toolChoice;
  if (o == null)
    return { tools: s, tool_choice: void 0, toolWarnings: n, betas: a };
  const i = o.type;
  switch (i) {
    case "auto":
      return {
        tools: s,
        tool_choice: { type: "auto" },
        toolWarnings: n,
        betas: a,
      };
    case "required":
      return {
        tools: s,
        tool_choice: { type: "any" },
        toolWarnings: n,
        betas: a,
      };
    case "none":
      return { tools: void 0, tool_choice: void 0, toolWarnings: n, betas: a };
    case "tool":
      return {
        tools: s,
        tool_choice: { type: "tool", name: o.toolName },
        toolWarnings: n,
        betas: a,
      };
    default: {
      const l = i;
      throw new le({ functionality: `Unsupported tool choice type: ${l}` });
    }
  }
}
function Xg({ prompt: e, sendReasoning: t, warnings: r }) {
  var n, a, s, o;
  const i = new Set(),
    l = Qg(e);
  let c;
  const u = [];
  function d(g) {
    var _;
    const h = g == null ? void 0 : g.anthropic;
    return (_ = h == null ? void 0 : h.cacheControl) != null
      ? _
      : h == null
        ? void 0
        : h.cache_control;
  }
  for (let g = 0; g < l.length; g++) {
    const _ = l[g],
      h = g === l.length - 1,
      v = _.type;
    switch (v) {
      case "system": {
        if (c != null)
          throw new le({
            functionality:
              "Multiple system messages that are separated by user/assistant messages",
          });
        c = _.messages.map(({ content: p, providerMetadata: f }) => ({
          type: "text",
          text: p,
          cache_control: d(f),
        }));
        break;
      }
      case "user": {
        const p = [];
        for (const f of _.messages) {
          const { role: k, content: S } = f;
          switch (k) {
            case "user": {
              for (let w = 0; w < S.length; w++) {
                const A = S[w],
                  I = w === S.length - 1,
                  z =
                    (n = d(A.providerMetadata)) != null
                      ? n
                      : I
                        ? d(f.providerMetadata)
                        : void 0;
                switch (A.type) {
                  case "text": {
                    p.push({ type: "text", text: A.text, cache_control: z });
                    break;
                  }
                  case "image": {
                    p.push({
                      type: "image",
                      source:
                        A.image instanceof URL
                          ? { type: "url", url: A.image.toString() }
                          : {
                              type: "base64",
                              media_type:
                                (a = A.mimeType) != null ? a : "image/jpeg",
                              data: Ut(A.image),
                            },
                      cache_control: z,
                    });
                    break;
                  }
                  case "file": {
                    if (A.mimeType !== "application/pdf")
                      throw new le({
                        functionality: "Non-PDF files in user messages",
                      });
                    (i.add("pdfs-2024-09-25"),
                      p.push({
                        type: "document",
                        source:
                          A.data instanceof URL
                            ? { type: "url", url: A.data.toString() }
                            : {
                                type: "base64",
                                media_type: "application/pdf",
                                data: A.data,
                              },
                        cache_control: z,
                      }));
                    break;
                  }
                }
              }
              break;
            }
            case "tool": {
              for (let w = 0; w < S.length; w++) {
                const A = S[w],
                  I = w === S.length - 1,
                  z =
                    (s = d(A.providerMetadata)) != null
                      ? s
                      : I
                        ? d(f.providerMetadata)
                        : void 0,
                  b =
                    A.content != null
                      ? A.content.map((x) => {
                          var D;
                          switch (x.type) {
                            case "text":
                              return {
                                type: "text",
                                text: x.text,
                                cache_control: void 0,
                              };
                            case "image":
                              return {
                                type: "image",
                                source: {
                                  type: "base64",
                                  media_type:
                                    (D = x.mimeType) != null ? D : "image/jpeg",
                                  data: x.data,
                                },
                                cache_control: void 0,
                              };
                          }
                        })
                      : JSON.stringify(A.result);
                p.push({
                  type: "tool_result",
                  tool_use_id: A.toolCallId,
                  content: b,
                  is_error: A.isError,
                  cache_control: z,
                });
              }
              break;
            }
            default: {
              const w = k;
              throw new Error(`Unsupported role: ${w}`);
            }
          }
        }
        u.push({ role: "user", content: p });
        break;
      }
      case "assistant": {
        const p = [];
        for (let f = 0; f < _.messages.length; f++) {
          const k = _.messages[f],
            S = f === _.messages.length - 1,
            { content: w } = k;
          for (let A = 0; A < w.length; A++) {
            const I = w[A],
              z = A === w.length - 1,
              b =
                (o = d(I.providerMetadata)) != null
                  ? o
                  : z
                    ? d(k.providerMetadata)
                    : void 0;
            switch (I.type) {
              case "text": {
                p.push({
                  type: "text",
                  text: h && S && z ? I.text.trim() : I.text,
                  cache_control: b,
                });
                break;
              }
              case "reasoning": {
                t
                  ? p.push({
                      type: "thinking",
                      thinking: I.text,
                      signature: I.signature,
                      cache_control: b,
                    })
                  : r.push({
                      type: "other",
                      message:
                        "sending reasoning content is disabled for this model",
                    });
                break;
              }
              case "redacted-reasoning": {
                p.push({
                  type: "redacted_thinking",
                  data: I.data,
                  cache_control: b,
                });
                break;
              }
              case "tool-call": {
                p.push({
                  type: "tool_use",
                  id: I.toolCallId,
                  name: I.toolName,
                  input: I.args,
                  cache_control: b,
                });
                break;
              }
            }
          }
        }
        u.push({ role: "assistant", content: p });
        break;
      }
      default: {
        const p = v;
        throw new Error(`Unsupported type: ${p}`);
      }
    }
  }
  return { prompt: { system: c, messages: u }, betas: i };
}
function Qg(e) {
  const t = [];
  let r;
  for (const n of e) {
    const { role: a } = n;
    switch (a) {
      case "system": {
        ((r == null ? void 0 : r.type) !== "system" &&
          ((r = { type: "system", messages: [] }), t.push(r)),
          r.messages.push(n));
        break;
      }
      case "assistant": {
        ((r == null ? void 0 : r.type) !== "assistant" &&
          ((r = { type: "assistant", messages: [] }), t.push(r)),
          r.messages.push(n));
        break;
      }
      case "user": {
        ((r == null ? void 0 : r.type) !== "user" &&
          ((r = { type: "user", messages: [] }), t.push(r)),
          r.messages.push(n));
        break;
      }
      case "tool": {
        ((r == null ? void 0 : r.type) !== "user" &&
          ((r = { type: "user", messages: [] }), t.push(r)),
          r.messages.push(n));
        break;
      }
      default: {
        const s = a;
        throw new Error(`Unsupported role: ${s}`);
      }
    }
  }
  return t;
}
function ns(e) {
  switch (e) {
    case "end_turn":
    case "stop_sequence":
      return "stop";
    case "tool_use":
      return "tool-calls";
    case "max_tokens":
      return "length";
    default:
      return "unknown";
  }
}
var ef = class {
    constructor(e, t, r) {
      ((this.specificationVersion = "v1"),
        (this.defaultObjectGenerationMode = "tool"),
        (this.modelId = e),
        (this.settings = t),
        (this.config = r));
    }
    supportsUrl(e) {
      return e.protocol === "https:";
    }
    get provider() {
      return this.config.provider;
    }
    get supportsImageUrls() {
      return this.config.supportsImageUrls;
    }
    async getArgs({
      mode: e,
      prompt: t,
      maxTokens: r = 4096,
      temperature: n,
      topP: a,
      topK: s,
      frequencyPenalty: o,
      presencePenalty: i,
      stopSequences: l,
      responseFormat: c,
      seed: u,
      providerMetadata: d,
    }) {
      var g, _, h;
      const v = e.type,
        p = [];
      (o != null &&
        p.push({ type: "unsupported-setting", setting: "frequencyPenalty" }),
        i != null &&
          p.push({ type: "unsupported-setting", setting: "presencePenalty" }),
        u != null && p.push({ type: "unsupported-setting", setting: "seed" }),
        c != null &&
          c.type !== "text" &&
          p.push({
            type: "unsupported-setting",
            setting: "responseFormat",
            details: "JSON response format is not supported.",
          }));
      const { prompt: f, betas: k } = Xg({
          prompt: t,
          sendReasoning: (g = this.settings.sendReasoning) != null ? g : !0,
          warnings: p,
        }),
        S = Yr({ provider: "anthropic", providerOptions: d, schema: nf }),
        w =
          ((_ = S == null ? void 0 : S.thinking) == null ? void 0 : _.type) ===
          "enabled",
        A =
          (h = S == null ? void 0 : S.thinking) == null
            ? void 0
            : h.budgetTokens,
        I = {
          model: this.modelId,
          max_tokens: r,
          temperature: n,
          top_k: s,
          top_p: a,
          stop_sequences: l,
          ...(w && { thinking: { type: "enabled", budget_tokens: A } }),
          system: f.system,
          messages: f.messages,
        };
      if (w) {
        if (A == null)
          throw new le({ functionality: "thinking requires a budget" });
        (I.temperature != null &&
          ((I.temperature = void 0),
          p.push({
            type: "unsupported-setting",
            setting: "temperature",
            details: "temperature is not supported when thinking is enabled",
          })),
          s != null &&
            ((I.top_k = void 0),
            p.push({
              type: "unsupported-setting",
              setting: "topK",
              details: "topK is not supported when thinking is enabled",
            })),
          a != null &&
            ((I.top_p = void 0),
            p.push({
              type: "unsupported-setting",
              setting: "topP",
              details: "topP is not supported when thinking is enabled",
            })),
          (I.max_tokens = r + A));
      }
      switch (v) {
        case "regular": {
          const { tools: z, tool_choice: b, toolWarnings: x, betas: D } = Yg(e);
          return {
            args: { ...I, tools: z, tool_choice: b },
            warnings: [...p, ...x],
            betas: new Set([...k, ...D]),
          };
        }
        case "object-json":
          throw new le({ functionality: "json-mode object generation" });
        case "object-tool": {
          const { name: z, description: b, parameters: x } = e.tool;
          return {
            args: {
              ...I,
              tools: [{ name: z, description: b, input_schema: x }],
              tool_choice: { type: "tool", name: z },
            },
            warnings: p,
            betas: k,
          };
        }
        default: {
          const z = v;
          throw new Error(`Unsupported type: ${z}`);
        }
      }
    }
    async getHeaders({ betas: e, headers: t }) {
      return qe(
        await yu(this.config.headers),
        e.size > 0 ? { "anthropic-beta": Array.from(e).join(",") } : {},
        t,
      );
    }
    buildRequestUrl(e) {
      var t, r, n;
      return (n =
        (r = (t = this.config).buildRequestUrl) == null
          ? void 0
          : r.call(t, this.config.baseURL, e)) != null
        ? n
        : `${this.config.baseURL}/messages`;
    }
    transformRequestBody(e) {
      var t, r, n;
      return (n =
        (r = (t = this.config).transformRequestBody) == null
          ? void 0
          : r.call(t, e)) != null
        ? n
        : e;
    }
    async doGenerate(e) {
      var t, r, n, a;
      const { args: s, warnings: o, betas: i } = await this.getArgs(e),
        {
          responseHeaders: l,
          value: c,
          rawValue: u,
        } = await Be({
          url: this.buildRequestUrl(!1),
          headers: await this.getHeaders({ betas: i, headers: e.headers }),
          body: this.transformRequestBody(s),
          failedResponseHandler: rs,
          successfulResponseHandler: Ct(tf),
          abortSignal: e.abortSignal,
          fetch: this.config.fetch,
        }),
        { messages: d, ...g } = s;
      let _ = "";
      for (const p of c.content) p.type === "text" && (_ += p.text);
      let h;
      if (c.content.some((p) => p.type === "tool_use")) {
        h = [];
        for (const p of c.content)
          p.type === "tool_use" &&
            h.push({
              toolCallType: "function",
              toolCallId: p.id,
              toolName: p.name,
              args: JSON.stringify(p.input),
            });
      }
      const v = c.content
        .filter((p) => p.type === "redacted_thinking" || p.type === "thinking")
        .map((p) =>
          p.type === "thinking"
            ? { type: "text", text: p.thinking, signature: p.signature }
            : { type: "redacted", data: p.data },
        );
      return {
        text: _,
        reasoning: v.length > 0 ? v : void 0,
        toolCalls: h,
        finishReason: ns(c.stop_reason),
        usage: {
          promptTokens: c.usage.input_tokens,
          completionTokens: c.usage.output_tokens,
        },
        rawCall: { rawPrompt: d, rawSettings: g },
        rawResponse: { headers: l, body: u },
        response: {
          id: (t = c.id) != null ? t : void 0,
          modelId: (r = c.model) != null ? r : void 0,
        },
        warnings: o,
        providerMetadata: {
          anthropic: {
            cacheCreationInputTokens:
              (n = c.usage.cache_creation_input_tokens) != null ? n : null,
            cacheReadInputTokens:
              (a = c.usage.cache_read_input_tokens) != null ? a : null,
          },
        },
        request: { body: JSON.stringify(s) },
      };
    }
    async doStream(e) {
      const { args: t, warnings: r, betas: n } = await this.getArgs(e),
        a = { ...t, stream: !0 },
        { responseHeaders: s, value: o } = await Be({
          url: this.buildRequestUrl(!0),
          headers: await this.getHeaders({ betas: n, headers: e.headers }),
          body: this.transformRequestBody(a),
          failedResponseHandler: rs,
          successfulResponseHandler: Xr(rf),
          abortSignal: e.abortSignal,
          fetch: this.config.fetch,
        }),
        { messages: i, ...l } = t;
      let c = "unknown";
      const u = { promptTokens: Number.NaN, completionTokens: Number.NaN },
        d = {};
      let g, _;
      return {
        stream: o.pipeThrough(
          new TransformStream({
            transform(h, v) {
              var p, f, k, S;
              if (!h.success) {
                v.enqueue({ type: "error", error: h.error });
                return;
              }
              const w = h.value;
              switch (w.type) {
                case "ping":
                  return;
                case "content_block_start": {
                  const A = w.content_block.type;
                  switch (((_ = A), A)) {
                    case "text":
                    case "thinking":
                      return;
                    case "redacted_thinking": {
                      v.enqueue({
                        type: "redacted-reasoning",
                        data: w.content_block.data,
                      });
                      return;
                    }
                    case "tool_use": {
                      d[w.index] = {
                        toolCallId: w.content_block.id,
                        toolName: w.content_block.name,
                        jsonText: "",
                      };
                      return;
                    }
                    default: {
                      const I = A;
                      throw new Error(`Unsupported content block type: ${I}`);
                    }
                  }
                }
                case "content_block_stop": {
                  if (d[w.index] != null) {
                    const A = d[w.index];
                    (v.enqueue({
                      type: "tool-call",
                      toolCallType: "function",
                      toolCallId: A.toolCallId,
                      toolName: A.toolName,
                      args: A.jsonText,
                    }),
                      delete d[w.index]);
                  }
                  _ = void 0;
                  return;
                }
                case "content_block_delta": {
                  const A = w.delta.type;
                  switch (A) {
                    case "text_delta": {
                      v.enqueue({
                        type: "text-delta",
                        textDelta: w.delta.text,
                      });
                      return;
                    }
                    case "thinking_delta": {
                      v.enqueue({
                        type: "reasoning",
                        textDelta: w.delta.thinking,
                      });
                      return;
                    }
                    case "signature_delta": {
                      _ === "thinking" &&
                        v.enqueue({
                          type: "reasoning-signature",
                          signature: w.delta.signature,
                        });
                      return;
                    }
                    case "input_json_delta": {
                      const I = d[w.index];
                      (v.enqueue({
                        type: "tool-call-delta",
                        toolCallType: "function",
                        toolCallId: I.toolCallId,
                        toolName: I.toolName,
                        argsTextDelta: w.delta.partial_json,
                      }),
                        (I.jsonText += w.delta.partial_json));
                      return;
                    }
                    default: {
                      const I = A;
                      throw new Error(`Unsupported delta type: ${I}`);
                    }
                  }
                }
                case "message_start": {
                  ((u.promptTokens = w.message.usage.input_tokens),
                    (u.completionTokens = w.message.usage.output_tokens),
                    (g = {
                      anthropic: {
                        cacheCreationInputTokens:
                          (p = w.message.usage.cache_creation_input_tokens) !=
                          null
                            ? p
                            : null,
                        cacheReadInputTokens:
                          (f = w.message.usage.cache_read_input_tokens) != null
                            ? f
                            : null,
                      },
                    }),
                    v.enqueue({
                      type: "response-metadata",
                      id: (k = w.message.id) != null ? k : void 0,
                      modelId: (S = w.message.model) != null ? S : void 0,
                    }));
                  return;
                }
                case "message_delta": {
                  ((u.completionTokens = w.usage.output_tokens),
                    (c = ns(w.delta.stop_reason)));
                  return;
                }
                case "message_stop": {
                  v.enqueue({
                    type: "finish",
                    finishReason: c,
                    usage: u,
                    providerMetadata: g,
                  });
                  return;
                }
                case "error": {
                  v.enqueue({ type: "error", error: w.error });
                  return;
                }
                default: {
                  const A = w;
                  throw new Error(`Unsupported chunk type: ${A}`);
                }
              }
            },
          }),
        ),
        rawCall: { rawPrompt: i, rawSettings: l },
        rawResponse: { headers: s },
        warnings: r,
        request: { body: JSON.stringify(a) },
      };
    }
  },
  tf = y({
    type: $("message"),
    id: m().nullish(),
    model: m().nullish(),
    content: K(
      bt("type", [
        y({ type: $("text"), text: m() }),
        y({ type: $("thinking"), thinking: m(), signature: m() }),
        y({ type: $("redacted_thinking"), data: m() }),
        y({ type: $("tool_use"), id: m(), name: m(), input: mr() }),
      ]),
    ),
    stop_reason: m().nullish(),
    usage: y({
      input_tokens: N(),
      output_tokens: N(),
      cache_creation_input_tokens: N().nullish(),
      cache_read_input_tokens: N().nullish(),
    }),
  }),
  rf = bt("type", [
    y({
      type: $("message_start"),
      message: y({
        id: m().nullish(),
        model: m().nullish(),
        usage: y({
          input_tokens: N(),
          output_tokens: N(),
          cache_creation_input_tokens: N().nullish(),
          cache_read_input_tokens: N().nullish(),
        }),
      }),
    }),
    y({
      type: $("content_block_start"),
      index: N(),
      content_block: bt("type", [
        y({ type: $("text"), text: m() }),
        y({ type: $("thinking"), thinking: m() }),
        y({ type: $("tool_use"), id: m(), name: m() }),
        y({ type: $("redacted_thinking"), data: m() }),
      ]),
    }),
    y({
      type: $("content_block_delta"),
      index: N(),
      delta: bt("type", [
        y({ type: $("input_json_delta"), partial_json: m() }),
        y({ type: $("text_delta"), text: m() }),
        y({ type: $("thinking_delta"), thinking: m() }),
        y({ type: $("signature_delta"), signature: m() }),
      ]),
    }),
    y({ type: $("content_block_stop"), index: N() }),
    y({ type: $("error"), error: y({ type: m(), message: m() }) }),
    y({
      type: $("message_delta"),
      delta: y({ stop_reason: m().nullish() }),
      usage: y({ output_tokens: N() }),
    }),
    y({ type: $("message_stop") }),
    y({ type: $("ping") }),
  ]),
  nf = y({
    thinking: y({
      type: de([$("enabled"), $("disabled")]),
      budgetTokens: N().optional(),
    }).optional(),
  }),
  af = y({ command: m(), restart: Pe().optional() });
function sf(e = {}) {
  return {
    type: "provider-defined",
    id: "anthropic.bash_20241022",
    args: {},
    parameters: af,
    execute: e.execute,
    experimental_toToolResultContent: e.experimental_toToolResultContent,
  };
}
var of = y({ command: m(), restart: Pe().optional() });
function lf(e = {}) {
  return {
    type: "provider-defined",
    id: "anthropic.bash_20250124",
    args: {},
    parameters: of,
    execute: e.execute,
    experimental_toToolResultContent: e.experimental_toToolResultContent,
  };
}
var cf = y({
  command: ct(["view", "create", "str_replace", "insert", "undo_edit"]),
  path: m(),
  file_text: m().optional(),
  insert_line: N().int().optional(),
  new_str: m().optional(),
  old_str: m().optional(),
  view_range: K(N().int()).optional(),
});
function uf(e = {}) {
  return {
    type: "provider-defined",
    id: "anthropic.text_editor_20241022",
    args: {},
    parameters: cf,
    execute: e.execute,
    experimental_toToolResultContent: e.experimental_toToolResultContent,
  };
}
var df = y({
  command: ct(["view", "create", "str_replace", "insert", "undo_edit"]),
  path: m(),
  file_text: m().optional(),
  insert_line: N().int().optional(),
  new_str: m().optional(),
  old_str: m().optional(),
  view_range: K(N().int()).optional(),
});
function pf(e = {}) {
  return {
    type: "provider-defined",
    id: "anthropic.text_editor_20250124",
    args: {},
    parameters: df,
    execute: e.execute,
    experimental_toToolResultContent: e.experimental_toToolResultContent,
  };
}
var mf = y({
  action: ct([
    "key",
    "type",
    "mouse_move",
    "left_click",
    "left_click_drag",
    "right_click",
    "middle_click",
    "double_click",
    "screenshot",
    "cursor_position",
  ]),
  coordinate: K(N().int()).optional(),
  text: m().optional(),
});
function gf(e) {
  return {
    type: "provider-defined",
    id: "anthropic.computer_20241022",
    args: {
      displayWidthPx: e.displayWidthPx,
      displayHeightPx: e.displayHeightPx,
      displayNumber: e.displayNumber,
    },
    parameters: mf,
    execute: e.execute,
    experimental_toToolResultContent: e.experimental_toToolResultContent,
  };
}
var ff = y({
  action: ct([
    "key",
    "hold_key",
    "type",
    "cursor_position",
    "mouse_move",
    "left_mouse_down",
    "left_mouse_up",
    "left_click",
    "left_click_drag",
    "right_click",
    "middle_click",
    "double_click",
    "triple_click",
    "scroll",
    "wait",
    "screenshot",
  ]),
  coordinate: Na([N().int(), N().int()]).optional(),
  duration: N().optional(),
  scroll_amount: N().optional(),
  scroll_direction: ct(["up", "down", "left", "right"]).optional(),
  start_coordinate: Na([N().int(), N().int()]).optional(),
  text: m().optional(),
});
function hf(e) {
  return {
    type: "provider-defined",
    id: "anthropic.computer_20250124",
    args: {
      displayWidthPx: e.displayWidthPx,
      displayHeightPx: e.displayHeightPx,
      displayNumber: e.displayNumber,
    },
    parameters: ff,
    execute: e.execute,
    experimental_toToolResultContent: e.experimental_toToolResultContent,
  };
}
var yf = {
  bash_20241022: sf,
  bash_20250124: lf,
  textEditor_20241022: uf,
  textEditor_20250124: pf,
  computer_20241022: gf,
  computer_20250124: hf,
};
function Ji(e = {}) {
  var t;
  const r = (t = Lo(e.baseURL)) != null ? t : "https://api.anthropic.com/v1",
    n = () => ({
      "anthropic-version": "2023-06-01",
      "x-api-key": Mo({
        apiKey: e.apiKey,
        environmentVariableName: "ANTHROPIC_API_KEY",
        description: "Anthropic",
      }),
      ...e.headers,
    }),
    a = (o, i = {}) =>
      new ef(o, i, {
        provider: "anthropic.messages",
        baseURL: r,
        headers: n,
        fetch: e.fetch,
        supportsImageUrls: !0,
      }),
    s = function (o, i) {
      if (new.target)
        throw new Error(
          "The Anthropic model function cannot be called with the new keyword.",
        );
      return a(o, i);
    };
  return (
    (s.languageModel = a),
    (s.chat = a),
    (s.messages = a),
    (s.textEmbeddingModel = (o) => {
      throw new Jc({ modelId: o, modelType: "textEmbeddingModel" });
    }),
    (s.tools = yf),
    s
  );
}
Ji();
const Ve = dr({ namespace: "AI" });
function vf(e) {
  return e === "en"
    ? `You are a professional web content analyst skilled at extracting core themes and generating accurate metadata.

Your task is to analyze web content and generate all of the following in one response:
1. title: Optimized title
2. summary: One-sentence summary
3. category: Recommended category
4. tags: Related tags

Please strictly follow the output format requirements.`
    : `你是一个专业的网页内容分析专家，擅长提取文章的核心主题并生成准确的元数据。

你的任务是分析网页内容，一次性生成以下所有信息：
1. title: 优化后的标题
2. summary: 一句话摘要
3. category: 推荐分类
4. tags: 相关标签

请严格按照输出格式要求返回结果。`;
}
y({
  title: m().describe("优化后的标题，简洁明了，不超过50字"),
  summary: m().max(200).describe("一句话摘要，概括核心内容，不超过200字"),
});
y({ category: m().describe("推荐的分类名称，优先从用户已有分类中选择") });
y({ tags: K(m()).max(5).describe("3-5个相关标签，简洁有辨识度") });
function as(e, t) {
  if (!e || e.length <= t) return e;
  const n = e.slice(0, 100).match(/[\u4e00-\u9fa5]/g);
  if (n && n.length > 30) {
    const s = e.slice(0, t),
      o = /[，。！？；,!?;]/;
    for (let i = s.length - 1; i >= t - 50; i--)
      if (o.test(s[i])) return s.slice(0, i + 1);
    return s;
  } else {
    const s = e.slice(0, t),
      o = s.lastIndexOf(" ");
    return o > t * 0.7 ? s.slice(0, o) : s;
  }
}
function _f(e, t = "auto") {
  var i, l;
  const r = e.url
    .replace(/\?.+$/, "")
    .replace(/[#&].*$/, "")
    .replace(/\/+$/, "");
  let n = `title: ${e.title}
url: ${r}`;
  (e.excerpt &&
    (n += `
excerpt: ${as(e.excerpt, 300)}`),
    (i = e.metadata) != null &&
      i.keywords &&
      (n += `
keywords: ${e.metadata.keywords.slice(0, 300)}`),
    e.content &&
      e.isReaderable !== !1 &&
      (n += `
content: ${as(e.content, 500)}`),
    (l = e.metadata) != null &&
      l.siteName &&
      (n += `
site: ${e.metadata.siteName}`));
  let a = "";
  e.existingCategories &&
    e.existingCategories.length > 0 &&
    (a = `
用户已有分类: ${e.existingCategories.join(", ")}`);
  let s = "";
  e.presetTags &&
    e.presetTags.length > 0 &&
    (s = `
预设标签: ${e.presetTags.slice(0, 20).join(", ")}`);
  let o = "";
  return (
    e.existingTags &&
      e.existingTags.length > 0 &&
      (o = `
用户已有标签: ${e.existingTags.slice(0, 50).join(", ")}`),
    t === "en"
      ? `Please analyze the following web content and generate bookmark metadata:

Page Information:
${n}
${a ? a.replace("用户已有分类:", "User existing categories:") : ""}
${s ? s.replace("预设标签:", "Preset tags:") : ""}
${o ? o.replace("用户已有标签:", "User existing tags:") : ""}

Requirements:
1. title: Optimize the title, keep it concise and clear, preserve core information, max 50 characters
2. summary: One-sentence summary, objectively describe core content, max 200 characters
3. category: Recommend the most suitable category
   - [IMPORTANT] User category structure explanation:
     * Categories use hierarchical structure, format: "Parent > Child > Grandchild"
     * Example: "Technology > Programming > JavaScript" represents 3 levels
     * Return the complete category path (including all levels)
   - [MANDATORY] Must prioritize exact match from user's existing categories:
     * Carefully compare page content with each category's semantics
     * Prefer the most specific subcategory over broad parent categories
     * If multiple categories fit, choose the most precise match
   - [New category rules] Only when no existing category applies:
     * Must extend based on existing category tree structure
     * Analyze existing categories to find the most relevant parent or sibling
     * Add new subcategory under appropriate level
     * Example: If "Technology > Frontend" exists, recommend "Technology > Backend" not standalone "Backend"
4. tags: Generate 3-5 keyword tags
   - Concise: Max 2-3 words each
   - Accurate: Reflect the page's core themes
   - Diverse: Cover site/domain/specific content
   - Prefer selecting from preset tags
   - [IMPORTANT] Avoid semantic duplicates with existing tags:
     * If "Frontend Development" exists, don't generate "Frontend", "Web Dev", etc.
     * If "React" exists, don't generate "ReactJS", "React.js" variants
     * Prefer reusing existing tags, only create new ones for truly new concepts`
      : `请分析以下网页内容，生成书签元数据：

网页信息：
${n}
${a}
${s}
${o}

要求：
1. title: 优化标题，简洁明了，保留核心信息，不超过50字
2. summary: 一句话摘要，客观描述核心内容，使用中文，不超过200字
3. category: 推荐一个最合适的分类
   - 【重要】用户已有分类说明：
     * 分类采用层级结构，格式为 "父分类 > 子分类 > 孙分类"
     * 例如 "技术 > 编程语言 > JavaScript" 表示三级分类
     * 请返回完整的分类路径（包含所有层级）
   - 【强制要求】必须优先从用户已有分类中精确匹配：
     * 仔细对比网页内容与每个分类的语义
     * 优先选择最具体的子分类，而非宽泛的父分类
     * 如果有多个合适的分类，选择最精确匹配的那个
   - 【推荐新分类规则】仅当用户已有分类完全不适用时：
     * 必须基于已有分类树结构扩展
     * 分析已有分类，找到最相关的父分类或同级分类
     * 在合适的层级下添加新的子分类
     * 示例：已有"技术 > 前端"，推荐新分类应为"技术 > 后端"而非独立的"后端"
     * 示例：已有"学习与知识"，推荐新分类应为"学习与知识 > 新子类"而非独立的"新分类"
4. tags: 生成3-5个关键词标签
   - 简洁：中文2-5字，英文不超过2个单词
   - 准确：反映网页核心主题
   - 多样：涵盖网站/领域/具体内容
   - 优先从预设标签中选择
   - 【重要】避免与用户已有标签语义重复：
     * 如已有"前端开发"，则不要生成"前端"、"Web开发"等相近标签
     * 如已有"React"，则不要生成"ReactJS"、"React.js"等变体
     * 优先复用已有标签，仅在确实需要新概念时才生成新标签`
  );
}
const Wr = {
  openai: {
    baseUrl: "https://api.openai.com/v1",
    models: [
      "gpt-4o-mini",
      "gpt-4o",
      "gpt-4-turbo",
      "gpt-3.5-turbo",
      "o1-mini",
      "o1-preview",
    ],
    requiresApiKey: !0,
  },
  anthropic: {
    baseUrl: "https://api.anthropic.com",
    models: [
      "claude-3-5-haiku-latest",
      "claude-3-5-sonnet-latest",
      "claude-3-opus-latest",
    ],
    requiresApiKey: !0,
  },
  google: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    models: [
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
      "gemini-1.5-flash",
      "gemini-1.5-pro",
    ],
    requiresApiKey: !0,
  },
  azure: {
    baseUrl: "",
    models: ["gpt-4o-mini", "gpt-4o", "gpt-4-turbo", "gpt-35-turbo"],
    requiresApiKey: !0,
  },
  deepseek: {
    baseUrl: "https://api.deepseek.com/v1",
    models: ["deepseek-chat", "deepseek-reasoner"],
    requiresApiKey: !0,
  },
  groq: {
    baseUrl: "https://api.groq.com/openai/v1",
    models: [
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
      "mixtral-8x7b-32768",
      "gemma2-9b-it",
    ],
    requiresApiKey: !0,
  },
  mistral: {
    baseUrl: "https://api.mistral.ai/v1",
    models: [
      "mistral-small-latest",
      "mistral-medium-latest",
      "mistral-large-latest",
      "open-mistral-7b",
    ],
    requiresApiKey: !0,
  },
  moonshot: {
    baseUrl: "https://api.moonshot.cn/v1",
    models: ["moonshot-v1-8k", "moonshot-v1-32k", "moonshot-v1-128k"],
    requiresApiKey: !0,
  },
  zhipu: {
    baseUrl: "https://open.bigmodel.cn/api/paas/v4",
    models: ["glm-4-flash", "glm-4-plus", "glm-4-air", "glm-4-long"],
    requiresApiKey: !0,
  },
  hunyuan: {
    baseUrl: "https://api.hunyuan.cloud.tencent.com/v1",
    models: [
      "hunyuan-lite",
      "hunyuan-standard",
      "hunyuan-pro",
      "hunyuan-turbo",
    ],
    requiresApiKey: !0,
  },
  nvidia: {
    baseUrl: "https://integrate.api.nvidia.com/v1",
    models: [
      "meta/llama-3.1-8b-instruct",
      "meta/llama-3.1-70b-instruct",
      "nvidia/llama-3.1-nemotron-70b-instruct",
    ],
    requiresApiKey: !0,
  },
  siliconflow: {
    baseUrl: "https://api.siliconflow.cn/v1",
    models: [
      "Qwen/Qwen2.5-7B-Instruct",
      "Qwen/Qwen2.5-72B-Instruct",
      "deepseek-ai/DeepSeek-V3",
      "Pro/deepseek-ai/DeepSeek-R1",
    ],
    requiresApiKey: !0,
  },
  ollama: {
    baseUrl: "http://localhost:11434/v1",
    models: ["llama3.2", "llama3.1", "mistral", "qwen2.5", "phi3"],
    requiresApiKey: !1,
  },
  custom: { baseUrl: "", models: ["gpt-4o-mini"], requiresApiKey: !0 },
};
function Hi(e) {
  const { provider: t, apiKey: r, baseUrl: n, model: a } = e,
    s = Wr[t] || Wr.custom;
  switch (t) {
    case "anthropic":
      return Ji({ apiKey: r || "", baseURL: n || s.baseUrl })(a || s.models[0]);
    case "ollama":
      return Hr({ baseURL: n || s.baseUrl, apiKey: "ollama" })(
        a || s.models[0],
      );
    case "openai":
    case "google":
    case "azure":
    case "deepseek":
    case "groq":
    case "mistral":
    case "moonshot":
    case "zhipu":
    case "hunyuan":
    case "nvidia":
    case "siliconflow":
    case "custom":
    default:
      return Hr({ apiKey: r || "", baseURL: n || s.baseUrl })(a || s.models[0]);
  }
}
function mt(e, t, r) {
  var n;
  e &&
    Ve.info(`[${t}] Request:`, {
      system:
        ((n = r.system) == null ? void 0 : n.slice(0, 200)) +
        (r.system && r.system.length > 200 ? "..." : ""),
      prompt: r.prompt.slice(0, 500) + (r.prompt.length > 500 ? "..." : ""),
    });
}
function gt(e, t, r, n) {
  e &&
    (Ve.info(`[${t}] Response:`, r),
    n &&
      Ve.info(`[${t}] Token Usage:`, {
        prompt: n.promptTokens ?? 0,
        completion: n.completionTokens ?? 0,
        total: n.totalTokens ?? 0,
      }));
}
function bf(e) {
  const t = Hi(e),
    {
      temperature: r = 0.3,
      maxTokens: n = 1e3,
      debug: a = !1,
      language: s = "auto",
    } = e;
  async function o(i) {
    const l = _f(i, s),
      c = vf(s);
    mt(a, "analyzeBookmarkSingle", { system: c, prompt: l });
    try {
      const { object: u, usage: d } = await Jt({
          model: t,
          schema: Ec,
          system: c,
          prompt: l,
          temperature: r,
          maxTokens: n,
        }),
        g = {
          title: u.title || i.title || "未命名书签",
          summary: u.summary || "",
          category: u.category || "未分类",
          tags: wf(u.tags || []),
        };
      return (gt(a, "analyzeBookmarkSingle", g, d), g);
    } catch (u) {
      return (Ve.error("AI analysis failed:", u), xf(i));
    }
  }
  return {
    async analyzeBookmark(i) {
      return o(i);
    },
  };
}
function wf(e) {
  return e
    .map((t) => t.trim())
    .filter((t) => {
      if (!t) return !1;
      let r = 0;
      for (const n of t) /[\u4e00-\u9fa5]/.test(n) ? (r += 2) : (r += 1);
      return r >= 2 && r <= 20;
    })
    .filter((t, r, n) => n.indexOf(t) === r)
    .slice(0, 5);
}
function xf(e) {
  var r, n;
  const t = [];
  if ((r = e.metadata) != null && r.keywords) {
    const a = e.metadata.keywords
      .split(/[,，;；]/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 1 && s.length <= 20)
      .slice(0, 3);
    t.push(...a);
  }
  if (t.length < 3 && e.title) {
    const a = new Set([
        "的",
        "了",
        "和",
        "与",
        "the",
        "a",
        "an",
        "and",
        "or",
        "in",
        "on",
        "at",
        "to",
        "for",
      ]),
      s = e.title
        .split(/[\s\-\_\,\.\。\，\|]+/)
        .map((o) => o.trim())
        .filter(
          (o) => o.length >= 2 && o.length <= 20 && !a.has(o.toLowerCase()),
        );
    t.push(...s.slice(0, 3 - t.length));
  }
  return {
    title: e.title || "未命名书签",
    summary:
      e.excerpt || ((n = e.metadata) == null ? void 0 : n.description) || "",
    category: "未分类",
    tags: [...new Set(t)].slice(0, 5),
  };
}
function kf(e) {
  const t = Hi(e),
    { temperature: r = 0.3, maxTokens: n = 1e3, debug: a = !1 } = e,
    s = bf(e),
    { language: o = "zh" } = e;
  return {
    ...s,
    async suggestTags(i) {
      const l =
        o === "en"
          ? `Please recommend 3-5 relevant tags for the following webpage.

URL: ${i.url}
Title: ${i.title}
Content summary: ${i.content.slice(0, 500)}

Requirements:
1. Tags should be concise, accurate, and distinctive
2. Use English for tags, except for proper nouns`
          : `请为以下网页推荐 3-5 个相关标签。

URL: ${i.url}
标题: ${i.title}
内容摘要: ${i.content.slice(0, 500)}

要求:
1. 标签应简洁、准确、有辨识度
2. 标签应该是中文，除非是专有名词（如 React, GitHub）`;
      mt(a, "suggestTags", { prompt: l });
      try {
        const { object: c } = await Jt({
          model: t,
          schema: Pc,
          prompt: l,
          temperature: r,
          maxTokens: 500,
        });
        return (gt(a, "suggestTags", c), c);
      } catch (c) {
        return (Ve.error("Tag suggestion failed:", c), []);
      }
    },
    async suggestCategory(i) {
      const l =
        o === "en"
          ? `Please recommend the most suitable category for the following webpage.

URL: ${i.url}
Title: ${i.title}
Content summary: ${i.content.slice(0, 500)}

User's existing categories: ${i.userCategories.join(", ") || "None"}

Requirements:
1. Prioritize selecting from user's existing categories
2. Return 1-2 most suitable categories`
          : `请为以下网页推荐最合适的分类。

URL: ${i.url}
标题: ${i.title}
内容摘要: ${i.content.slice(0, 500)}

用户已有分类: ${i.userCategories.join(", ") || "无"}

要求:
1. 优先从用户已有分类中选择
2. 返回 1-2 个最合适的分类`;
      mt(a, "suggestCategory", { prompt: l });
      try {
        const { object: c } = await Jt({
          model: t,
          schema: Oc,
          prompt: l,
          temperature: r,
          maxTokens: 500,
        });
        return (gt(a, "suggestCategory", c), c);
      } catch (c) {
        return (Ve.error("Category suggestion failed:", c), []);
      }
    },
    async translate(i, l = "zh") {
      const u = `请将以下文本翻译成${l === "zh" ? "中文" : "English"}，只返回翻译结果，不要包含其他内容：

${i}`;
      mt(a, "translate", { prompt: u });
      try {
        const { text: d } = await Ga({
          model: t,
          prompt: u,
          temperature: 0.3,
          maxTokens: 500,
        });
        return (gt(a, "translate", d.trim()), d.trim());
      } catch (d) {
        return (Ve.error("Translation failed:", d), i);
      }
    },
    async generateObject(i) {
      mt(a, "generateObject", { system: i.system, prompt: i.prompt });
      try {
        const { object: l } = await Jt({
          model: t,
          schema: i.schema,
          system: i.system,
          prompt: i.prompt,
          temperature: r,
          maxTokens: n,
        });
        return (gt(a, "generateObject", l), l);
      } catch (l) {
        throw (Ve.error("Object generation failed:", l), l);
      }
    },
    async generateRaw(i) {
      mt(a, "generateRaw", { prompt: i });
      try {
        const { text: l } = await Ga({
          model: t,
          prompt: i,
          temperature: r,
          maxTokens: n,
        });
        return (gt(a, "generateRaw", l), l);
      } catch (l) {
        throw (Ve.error("Raw generation failed:", l), l);
      }
    },
    async generateCategories(i) {
      const l =
        o === "en"
          ? `You are a professional information architect skilled at designing personalized bookmark categorization systems.

User's description:
${i}

Please generate a personalized bookmark categorization system based on the user's description.

Important: Automatically detect the language used in the user's description and use the exact same language for all category names. For example:
- User describes in English → Category names in English
- User describes in Chinese → Category names in Chinese

Requirements:
1. Moderate number of categories (3-8 top-level categories)
2. Support hierarchical structure (up to 3 levels)
3. Category names should be concise (2-8 words)
4. Categories should not overlap
5. Cover all scenarios described by the user

Output format example:
{
  "categories": [
    {
      "name": "Technology",
      "children": [
        { "name": "Frontend Development" },
        { "name": "Backend Development" }
      ]
    },
    {
      "name": "Design Resources",
      "children": [
        { "name": "UI Design" },
        { "name": "Icon Libraries" }
      ]
    }
  ]
}

Please return in the above JSON format, including the "categories" field.`
          : `你是一个专业的信息架构师，擅长为用户设计个性化的书签分类系统。

用户需求描述：
${i}

请根据用户的描述，生成一套个性化的书签分类系统。

重要：请自动检测用户描述使用的语言（中文、英文、日文等），并使用完全相同的语言输出所有分类名称。例如：
- 用户用中文描述 → 分类名用中文
- 用户用英文描述 → 分类名用英文

要求：
1. 分类数量适中（3-8个一级分类）
2. 支持层级结构（最多3层）
3. 分类名称简洁明了（2-8个字）
4. 分类之间不重叠
5. 覆盖用户描述的所有需求场景

输出格式示例：
{
  "categories": [
    {
      "name": "技术资源",
      "children": [
        { "name": "前端开发" },
        { "name": "后端开发" }
      ]
    },
    {
      "name": "设计素材",
      "children": [
        { "name": "UI设计" },
        { "name": "图标库" }
      ]
    }
  ]
}

请务必按照上述 JSON 格式返回，包含 "categories" 字段。`;
      mt(a, "generateCategories", { prompt: l });
      try {
        const { object: c } = await Jt({
            model: t,
            schema: jc,
            prompt: l,
            temperature: 0.5,
            maxTokens: 1500,
          }),
          u = c.categories || [];
        return (gt(a, "generateCategories", u), u);
      } catch (c) {
        throw (Ve.error("Category generation failed:", c), c);
      }
    },
  };
}
function Af(e) {
  var t;
  return ((t = Wr[e]) == null ? void 0 : t.models[0]) || "gpt-4o-mini";
}
function Bh(e) {
  var t;
  return ((t = Wr[e]) == null ? void 0 : t.models) || ["gpt-4o-mini"];
}
const Ot = dr({ namespace: "Embedding" }),
  ur = {
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
function Sf(e) {
  var t;
  return ((t = ur[e]) == null ? void 0 : t.supportsEmbedding) ?? !1;
}
function Tf(e) {
  var t;
  return ((t = ur[e]) == null ? void 0 : t.defaultModel) || "";
}
function Cf(e) {
  const { provider: t, apiKey: r, baseUrl: n, model: a, dimensions: s } = e,
    o = ur[t] || ur.custom;
  return Hr({
    apiKey: t === "ollama" ? "ollama" : r || "",
    baseURL: n || o.baseUrl,
  }).textEmbeddingModel(a || o.defaultModel, { dimensions: s });
}
function Wi(e) {
  const { provider: t, model: r, dimensions: n } = e,
    a = ur[t],
    s = r || (a == null ? void 0 : a.defaultModel) || "unknown";
  return `${t}:${s}:${n || "auto"}:v1`;
}
function If(e) {
  const t = Cf(e);
  return {
    getModelKey() {
      return Wi(e);
    },
    async embed(r) {
      Ot.debug("Generating embedding", { text: r.slice(0, 50) });
      try {
        const n = await za({ model: t, value: r });
        return (
          Ot.debug("Embedding generated", {
            dimensions: n.embedding.length,
            tokens: n.usage.tokens,
          }),
          { embedding: n.embedding, tokens: n.usage.tokens }
        );
      } catch (n) {
        throw (Ot.error("Embedding generation failed", n), n);
      }
    },
    async embedMany(r) {
      var n;
      if (r.length === 0) return { embeddings: [], tokens: 0 };
      Ot.debug("Generating embeddings batch", { count: r.length });
      try {
        const a = await yp({ model: t, values: r });
        return (
          Ot.debug("Embeddings batch generated", {
            count: a.embeddings.length,
            dimensions: (n = a.embeddings[0]) == null ? void 0 : n.length,
            tokens: a.usage.tokens,
          }),
          { embeddings: a.embeddings, tokens: a.usage.tokens }
        );
      } catch (a) {
        throw (Ot.error("Embeddings batch generation failed", a), a);
      }
    },
    async testConnection() {
      try {
        return {
          success: !0,
          dimensions: (await za({ model: t, value: "test" })).embedding.length,
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
const Ef = [
    {
      id: "general-learning",
      name: "学习与知识",
      icon: "📚",
      children: [
        { id: "general-learning-tech-docs", name: "技术文档", icon: "📄" },
        { id: "general-learning-tutorials", name: "教程 / 课程", icon: "🎓" },
        {
          id: "general-learning-research",
          name: "研究 / 深度文章",
          icon: "🔬",
        },
        { id: "general-learning-notes", name: "笔记 / 摘要", icon: "📝" },
        { id: "general-learning-ebooks", name: "电子书 / 资料库", icon: "📖" },
      ],
    },
    {
      id: "general-work",
      name: "工作与效率",
      icon: "💼",
      children: [
        { id: "general-work-projects", name: "项目相关", icon: "📋" },
        { id: "general-work-tools", name: "工具 / SaaS", icon: "🛠️" },
        { id: "general-work-design", name: "设计资源", icon: "🎨" },
        { id: "general-work-writing", name: "写作 / 文案", icon: "✍️" },
        { id: "general-work-collab", name: "协作 / 管理", icon: "👥" },
      ],
    },
    {
      id: "general-reading",
      name: "资讯与阅读",
      icon: "📰",
      children: [
        { id: "general-reading-news", name: "新闻", icon: "📢" },
        { id: "general-reading-blogs", name: "博客", icon: "✏️" },
        { id: "general-reading-industry", name: "行业动态", icon: "📊" },
        { id: "general-reading-later", name: "长文待读", icon: "📑" },
        { id: "general-reading-rss", name: "订阅源", icon: "📡" },
      ],
    },
    {
      id: "general-tech",
      name: "技术与开发",
      icon: "💻",
      children: [
        { id: "general-tech-frontend", name: "前端", icon: "🌐" },
        { id: "general-tech-backend", name: "后端", icon: "⚙️" },
        { id: "general-tech-ai", name: "AI / 数据", icon: "🤖" },
        { id: "general-tech-system", name: "系统 / 架构", icon: "🏗️" },
        { id: "general-tech-opensource", name: "开源项目", icon: "🔓" },
      ],
    },
    {
      id: "general-life",
      name: "生活与兴趣",
      icon: "🎉",
      children: [
        { id: "general-life-entertainment", name: "娱乐", icon: "🎬" },
        { id: "general-life-art", name: "摄影 / 艺术", icon: "📷" },
        { id: "general-life-health", name: "健康", icon: "🏃" },
        { id: "general-life-travel", name: "旅行", icon: "✈️" },
        { id: "general-life-hobbies", name: "兴趣爱好", icon: "🎮" },
      ],
    },
  ],
  Rf = [
    {
      id: "general-learning",
      name: "Learning & Knowledge",
      icon: "📚",
      children: [
        { id: "general-learning-tech-docs", name: "Tech Docs", icon: "📄" },
        {
          id: "general-learning-tutorials",
          name: "Tutorials / Courses",
          icon: "🎓",
        },
        {
          id: "general-learning-research",
          name: "Research / In-depth Articles",
          icon: "🔬",
        },
        { id: "general-learning-notes", name: "Notes / Summaries", icon: "📝" },
        {
          id: "general-learning-ebooks",
          name: "E-books / Resources",
          icon: "📖",
        },
      ],
    },
    {
      id: "general-work",
      name: "Work & Productivity",
      icon: "💼",
      children: [
        { id: "general-work-projects", name: "Projects", icon: "📋" },
        { id: "general-work-tools", name: "Tools / SaaS", icon: "🛠️" },
        { id: "general-work-design", name: "Design Resources", icon: "🎨" },
        {
          id: "general-work-writing",
          name: "Writing / Copywriting",
          icon: "✍️",
        },
        {
          id: "general-work-collab",
          name: "Collaboration / Management",
          icon: "👥",
        },
      ],
    },
    {
      id: "general-reading",
      name: "News & Reading",
      icon: "📰",
      children: [
        { id: "general-reading-news", name: "News", icon: "📢" },
        { id: "general-reading-blogs", name: "Blogs", icon: "✏️" },
        {
          id: "general-reading-industry",
          name: "Industry Updates",
          icon: "📊",
        },
        { id: "general-reading-later", name: "Read Later", icon: "📑" },
        { id: "general-reading-rss", name: "RSS Feeds", icon: "📡" },
      ],
    },
    {
      id: "general-tech",
      name: "Tech & Development",
      icon: "💻",
      children: [
        { id: "general-tech-frontend", name: "Frontend", icon: "🌐" },
        { id: "general-tech-backend", name: "Backend", icon: "⚙️" },
        { id: "general-tech-ai", name: "AI / Data", icon: "🤖" },
        {
          id: "general-tech-system",
          name: "System / Architecture",
          icon: "🏗️",
        },
        { id: "general-tech-opensource", name: "Open Source", icon: "🔓" },
      ],
    },
    {
      id: "general-life",
      name: "Life & Interests",
      icon: "🎉",
      children: [
        { id: "general-life-entertainment", name: "Entertainment", icon: "🎬" },
        { id: "general-life-art", name: "Photography / Art", icon: "📷" },
        { id: "general-life-health", name: "Health", icon: "🏃" },
        { id: "general-life-travel", name: "Travel", icon: "✈️" },
        { id: "general-life-hobbies", name: "Hobbies", icon: "🎮" },
      ],
    },
  ],
  Pf = [
    {
      id: "pro-tech",
      name: "技术",
      icon: "💻",
      children: [
        {
          id: "pro-tech-langs",
          name: "编程语言",
          icon: "📝",
          children: [
            { id: "pro-tech-langs-js", name: "JavaScript", icon: "🟨" },
            { id: "pro-tech-langs-python", name: "Python", icon: "🐍" },
            { id: "pro-tech-langs-other", name: "其他", icon: "📄" },
          ],
        },
        { id: "pro-tech-frameworks", name: "框架 / 库", icon: "📦" },
        { id: "pro-tech-ai", name: "AI / LLM", icon: "🤖" },
        { id: "pro-tech-system", name: "系统设计", icon: "🏗️" },
        { id: "pro-tech-opensource", name: "开源生态", icon: "🔓" },
      ],
    },
    {
      id: "pro-product",
      name: "产品与设计",
      icon: "🎨",
      children: [
        { id: "pro-product-analysis", name: "产品分析", icon: "📊" },
        { id: "pro-product-ux", name: "用户体验", icon: "👤" },
        { id: "pro-product-design-system", name: "设计系统", icon: "🎯" },
        { id: "pro-product-competitor", name: "竞品研究", icon: "🔍" },
        { id: "pro-product-prototype", name: "原型 / Demo", icon: "🖼️" },
      ],
    },
    {
      id: "pro-content",
      name: "内容创作",
      icon: "✏️",
      children: [
        { id: "pro-content-material", name: "写作素材", icon: "📚" },
        { id: "pro-content-skills", name: "表达技巧", icon: "🎤" },
        { id: "pro-content-cases", name: "案例拆解", icon: "🔬" },
        { id: "pro-content-channels", name: "发布渠道", icon: "📡" },
      ],
    },
    {
      id: "pro-business",
      name: "商业与趋势",
      icon: "📈",
      children: [
        { id: "pro-business-reports", name: "行业报告", icon: "📋" },
        { id: "pro-business-startup", name: "创业 / 商业模式", icon: "🚀" },
        { id: "pro-business-investment", name: "投资 / 市场", icon: "💰" },
        { id: "pro-business-trends", name: "趋势判断", icon: "📊" },
      ],
    },
    {
      id: "pro-resources",
      name: "工具与资源",
      icon: "🛠️",
      children: [
        { id: "pro-resources-online", name: "在线工具", icon: "🌐" },
        { id: "pro-resources-data", name: "数据资源", icon: "💾" },
        { id: "pro-resources-templates", name: "模板 / 素材", icon: "📑" },
        { id: "pro-resources-automation", name: "自动化", icon: "⚡" },
      ],
    },
  ],
  Nf = [
    {
      id: "pro-tech",
      name: "Technology",
      icon: "💻",
      children: [
        {
          id: "pro-tech-langs",
          name: "Programming Languages",
          icon: "📝",
          children: [
            { id: "pro-tech-langs-js", name: "JavaScript", icon: "🟨" },
            { id: "pro-tech-langs-python", name: "Python", icon: "🐍" },
            { id: "pro-tech-langs-other", name: "Others", icon: "📄" },
          ],
        },
        {
          id: "pro-tech-frameworks",
          name: "Frameworks / Libraries",
          icon: "📦",
        },
        { id: "pro-tech-ai", name: "AI / LLM", icon: "🤖" },
        { id: "pro-tech-system", name: "System Design", icon: "🏗️" },
        { id: "pro-tech-opensource", name: "Open Source", icon: "🔓" },
      ],
    },
    {
      id: "pro-product",
      name: "Product & Design",
      icon: "🎨",
      children: [
        { id: "pro-product-analysis", name: "Product Analysis", icon: "📊" },
        { id: "pro-product-ux", name: "User Experience", icon: "👤" },
        { id: "pro-product-design-system", name: "Design System", icon: "🎯" },
        {
          id: "pro-product-competitor",
          name: "Competitor Research",
          icon: "🔍",
        },
        { id: "pro-product-prototype", name: "Prototypes / Demos", icon: "🖼️" },
      ],
    },
    {
      id: "pro-content",
      name: "Content Creation",
      icon: "✏️",
      children: [
        { id: "pro-content-material", name: "Writing Materials", icon: "📚" },
        { id: "pro-content-skills", name: "Expression Skills", icon: "🎤" },
        { id: "pro-content-cases", name: "Case Studies", icon: "🔬" },
        { id: "pro-content-channels", name: "Publishing Channels", icon: "📡" },
      ],
    },
    {
      id: "pro-business",
      name: "Business & Trends",
      icon: "📈",
      children: [
        { id: "pro-business-reports", name: "Industry Reports", icon: "📋" },
        {
          id: "pro-business-startup",
          name: "Startups / Business Models",
          icon: "🚀",
        },
        {
          id: "pro-business-investment",
          name: "Investment / Markets",
          icon: "💰",
        },
        { id: "pro-business-trends", name: "Trend Analysis", icon: "📊" },
      ],
    },
    {
      id: "pro-resources",
      name: "Tools & Resources",
      icon: "🛠️",
      children: [
        { id: "pro-resources-online", name: "Online Tools", icon: "🌐" },
        { id: "pro-resources-data", name: "Data Resources", icon: "💾" },
        {
          id: "pro-resources-templates",
          name: "Templates / Assets",
          icon: "📑",
        },
        { id: "pro-resources-automation", name: "Automation", icon: "⚡" },
      ],
    },
  ];
function zh(e) {
  return e.startsWith("zh") ? Ef : Rf;
}
function Zh(e) {
  return e.startsWith("zh") ? Pf : Nf;
}
function Of(e, t = null) {
  const r = [];
  for (const n of e)
    (r.push({ id: n.id, name: n.name, parentId: t, icon: n.icon }),
      n.children && r.push(...Of(n.children, n.id)));
  return r;
}
function Gi(e, t = "") {
  const r = [];
  for (const n of e) {
    const a = t ? `${t} > ${n.name}` : n.name;
    (r.push(a), n.children && r.push(...Gi(n.children, a)));
  }
  return r;
}
function jf(e) {
  const t = new Map(),
    r = [];
  for (const n of e) t.set(n.id, { id: n.id, name: n.name });
  for (const n of e) {
    const a = t.get(n.id);
    if (n.parentId && t.has(n.parentId)) {
      const s = t.get(n.parentId);
      (s.children || (s.children = []), s.children.push(a));
    } else r.push(a);
  }
  return r;
}
const Mf = [
  {
    id: "preset-tech",
    name: "技术开发",
    icon: "💻",
    description: "编程、开发工具、技术文档",
    keywords: [
      "github",
      "stackoverflow",
      "dev",
      "code",
      "programming",
      "developer",
      "代码",
      "编程",
      "开发",
      "api",
      "documentation",
      "docs",
      "tutorial",
      "javascript",
      "python",
      "java",
      "typescript",
      "react",
      "vue",
      "node",
    ],
  },
  {
    id: "preset-design",
    name: "设计资源",
    icon: "🎨",
    description: "UI/UX设计、素材、灵感",
    keywords: [
      "design",
      "ui",
      "ux",
      "figma",
      "sketch",
      "dribbble",
      "behance",
      "设计",
      "icon",
      "color",
      "font",
      "typography",
      "inspiration",
      "mockup",
      "prototype",
      "wireframe",
    ],
  },
  {
    id: "preset-tools",
    name: "工具效率",
    icon: "🛠️",
    description: "生产力工具、实用软件",
    keywords: [
      "tool",
      "utility",
      "productivity",
      "automation",
      "workflow",
      "工具",
      "效率",
      "chrome extension",
      "app",
      "software",
      "saas",
      "notion",
      "obsidian",
      "vscode",
      "editor",
    ],
  },
  {
    id: "preset-ai",
    name: "AI 人工智能",
    icon: "🤖",
    description: "AI工具、机器学习、大语言模型",
    keywords: [
      "ai",
      "artificial intelligence",
      "machine learning",
      "ml",
      "chatgpt",
      "gpt",
      "openai",
      "claude",
      "llm",
      "neural",
      "deep learning",
      "人工智能",
      "机器学习",
      "深度学习",
      "prompt",
      "model",
    ],
  },
  {
    id: "preset-reading",
    name: "阅读学习",
    icon: "📚",
    description: "文章、博客、教程",
    keywords: [
      "blog",
      "article",
      "post",
      "medium",
      "read",
      "tutorial",
      "guide",
      "博客",
      "文章",
      "教程",
      "learn",
      "course",
      "education",
      "study",
      "book",
      "documentation",
      "wiki",
    ],
  },
  {
    id: "preset-news",
    name: "新闻资讯",
    icon: "📰",
    description: "科技新闻、行业动态",
    keywords: [
      "news",
      "techcrunch",
      "hackernews",
      "reddit",
      "twitter",
      "新闻",
      "资讯",
      "press",
      "media",
      "tech news",
      "update",
      "announcement",
      "release",
    ],
  },
  {
    id: "preset-video",
    name: "视频影音",
    icon: "🎬",
    description: "YouTube、课程视频",
    keywords: [
      "youtube",
      "video",
      "watch",
      "bilibili",
      "vimeo",
      "ted",
      "视频",
      "影片",
      "movie",
      "course",
      "lecture",
      "tutorial video",
      "stream",
      "podcast",
    ],
  },
  {
    id: "preset-social",
    name: "社交媒体",
    icon: "👥",
    description: "社交网络、社区",
    keywords: [
      "twitter",
      "facebook",
      "instagram",
      "linkedin",
      "social",
      "社交",
      "community",
      "forum",
      "discord",
      "slack",
      "wechat",
      "微信",
      "微博",
      "weibo",
    ],
  },
  {
    id: "preset-shopping",
    name: "购物消费",
    icon: "🛒",
    description: "电商、购物、产品",
    keywords: [
      "shop",
      "buy",
      "amazon",
      "taobao",
      "jd",
      "product",
      "store",
      "购物",
      "淘宝",
      "京东",
      "ecommerce",
      "cart",
      "price",
      "deal",
      "discount",
      "coupon",
    ],
  },
  {
    id: "preset-travel",
    name: "旅行出行",
    icon: "✈️",
    description: "旅游、攻略、地图",
    keywords: [
      "travel",
      "trip",
      "hotel",
      "flight",
      "booking",
      "airbnb",
      "旅行",
      "旅游",
      "tour",
      "map",
      "destination",
      "guide",
      "vacation",
      "holiday",
    ],
  },
  {
    id: "preset-finance",
    name: "财经金融",
    icon: "💰",
    description: "投资、理财、经济",
    keywords: [
      "finance",
      "investment",
      "stock",
      "crypto",
      "bitcoin",
      "trading",
      "金融",
      "投资",
      "理财",
      "money",
      "bank",
      "economy",
      "market",
      "fund",
      "portfolio",
    ],
  },
  {
    id: "preset-health",
    name: "健康生活",
    icon: "🏃",
    description: "健康、运动、养生",
    keywords: [
      "health",
      "fitness",
      "workout",
      "exercise",
      "nutrition",
      "diet",
      "健康",
      "运动",
      "健身",
      "yoga",
      "meditation",
      "wellness",
      "medical",
      "doctor",
    ],
  },
  {
    id: "preset-entertainment",
    name: "娱乐休闲",
    icon: "🎮",
    description: "游戏、娱乐、音乐",
    keywords: [
      "game",
      "gaming",
      "entertainment",
      "music",
      "spotify",
      "steam",
      "游戏",
      "娱乐",
      "play",
      "fun",
      "hobby",
      "leisure",
      "movie",
      "tv",
      "show",
    ],
  },
  {
    id: "preset-reference",
    name: "参考资料",
    icon: "📖",
    description: "文档、手册、规范",
    keywords: [
      "reference",
      "documentation",
      "manual",
      "specification",
      "standard",
      "参考",
      "文档",
      "cheatsheet",
      "guide",
      "handbook",
      "wiki",
      "mdn",
      "w3c",
      "rfc",
    ],
  },
  {
    id: "preset-work",
    name: "工作事务",
    icon: "💼",
    description: "工作相关、项目管理",
    keywords: [
      "work",
      "job",
      "career",
      "project",
      "management",
      "business",
      "工作",
      "项目",
      "meeting",
      "task",
      "jira",
      "trello",
      "asana",
      "productivity",
      "collaboration",
    ],
  },
];
function $f(e, t = 0.3) {
  const r = e.toLowerCase(),
    n = [];
  for (const a of Mf) {
    let s = 0;
    const o = a.keywords.length;
    for (const l of a.keywords) r.includes(l.toLowerCase()) && s++;
    const i = s / o;
    i >= t && n.push({ category: a, confidence: i });
  }
  return (n.sort((a, s) => s.confidence - a.confidence), n);
}
class Df {
  constructor() {
    dt(this, "config", null);
    dt(this, "client", null);
  }
  async loadConfig() {
    this.config = await Ie.getAIConfig();
    const t = await Ie.getSettings();
    return ((this.config.language = t.language), this.config);
  }
  isConfigured() {
    return this.config
      ? this.config.provider === "ollama"
        ? !!this.config.baseUrl
        : !!this.config.apiKey
      : !1;
  }
  getOrCreateClient() {
    return (
      !this.client &&
        this.config &&
        (this.client = kf({
          provider: this.config.provider,
          apiKey: this.config.apiKey,
          baseUrl: this.config.baseUrl,
          model: this.config.model || Af(this.config.provider),
          temperature: this.config.temperature,
          maxTokens: this.config.maxTokens,
          debug: !0,
          language: this.config.language,
        })),
      this.client
    );
  }
  async analyzeComplete(t) {
    var r, n;
    if ((this.config || (await this.loadConfig()), !this.isConfigured()))
      return this.getFallbackResult(t.pageContent);
    try {
      const a = this.getOrCreateClient();
      let s = [];
      if (t.userCategories && t.userCategories.length > 0) {
        const l = jf(t.userCategories);
        s = Gi(l);
      }
      const o = {
        url: t.pageContent.url,
        title: t.pageContent.title,
        content: t.pageContent.content || t.pageContent.textContent,
        excerpt: t.pageContent.excerpt,
        metadata: t.pageContent.metadata
          ? {
              description: t.pageContent.metadata.description,
              keywords: t.pageContent.metadata.keywords,
              author: t.pageContent.metadata.author,
              siteName: t.pageContent.metadata.siteName,
            }
          : void 0,
        isReaderable: t.pageContent.isReaderable,
        presetTags: (r = this.config) == null ? void 0 : r.presetTags,
        existingCategories:
          s.length > 0
            ? s
            : (n = t.userCategories) == null
              ? void 0
              : n.map((l) => l.name),
        existingTags: t.existingTags,
      };
      return await a.analyzeBookmark(o);
    } catch {
      return this.getFallbackResult(t.pageContent);
    }
  }
  getFallbackResult(t) {
    var a, s;
    const r = [],
      n = new Set([
        "的",
        "了",
        "和",
        "与",
        "或",
        "在",
        "是",
        "到",
        "the",
        "a",
        "an",
        "and",
        "or",
        "in",
        "on",
        "at",
        "to",
        "for",
        "of",
        "with",
      ]);
    if ((a = t.metadata) != null && a.keywords) {
      const o = t.metadata.keywords
        .split(/[,，;；]/)
        .map((i) => i.trim())
        .filter(
          (i) => i.length >= 1 && i.length <= 20 && !n.has(i.toLowerCase()),
        )
        .slice(0, 3);
      r.push(...o);
    }
    if (r.length < 3 && t.title) {
      const o = t.title
        .split(/[\s\-\_\,\.\。\，\|\:：]+/)
        .map((i) => i.trim())
        .filter(
          (i) => i.length >= 2 && i.length <= 20 && !n.has(i.toLowerCase()),
        );
      r.push(...o.slice(0, 3 - r.length));
    }
    try {
      const i = new URL(t.url).hostname.replace("www.", "").split(".")[0];
      i && i.length >= 2 && !r.includes(i) && r.push(i);
    } catch {}
    return {
      title: t.title || "未命名书签",
      summary:
        t.excerpt || ((s = t.metadata) == null ? void 0 : s.description) || "",
      category: "",
      tags: [...new Set(r)].slice(0, 5),
    };
  }
  async testConnection() {
    var t, r, n, a;
    if (
      (this.config || (await this.loadConfig()),
      !((t = this.config) != null && t.apiKey) &&
        ((r = this.config) == null ? void 0 : r.provider) !== "ollama")
    )
      return { success: !1, message: "请先配置 API Key" };
    if (
      ((n = this.config) == null ? void 0 : n.provider) === "ollama" &&
      !((a = this.config) != null && a.baseUrl)
    )
      return { success: !1, message: "请配置 Ollama 地址" };
    try {
      return (
        await this.getOrCreateClient().generateRaw("Reply with 'ok'"),
        { success: !0, message: "连接成功" }
      );
    } catch (s) {
      return {
        success: !1,
        message: s instanceof Error ? s.message : "连接失败",
      };
    }
  }
  async translate(t, r = "zh") {
    var n;
    if (
      (this.config || (await this.loadConfig()),
      !((n = this.config) != null && n.enableTranslation) ||
        !this.isConfigured())
    )
      return t;
    try {
      return await this.getOrCreateClient().translate(t, r);
    } catch {
      return t;
    }
  }
  getRuleBasedTagSuggestions(t) {
    const r = [],
      n = `${t.url} ${t.title} ${t.content}`.toLowerCase(),
      a = {
        "github.com": ["开发", "代码", "GitHub"],
        "stackoverflow.com": ["开发", "问答", "技术"],
        "medium.com": ["文章", "博客"],
        "youtube.com": ["视频"],
        "bilibili.com": ["视频", "B站"],
        "twitter.com": ["社交", "Twitter"],
        "reddit.com": ["社交", "Reddit"],
      };
    for (const [o, i] of Object.entries(a))
      n.includes(o) &&
        i.forEach((l) => {
          t.existingTags.includes(l) ||
            r.push({ tag: l, confidence: 0.7, reason: `来自 ${o}` });
        });
    const s = {
      tutorial: "教程",
      guide: "指南",
      documentation: "文档",
      api: "API",
      react: "React",
      vue: "Vue",
      javascript: "JavaScript",
      python: "Python",
      design: "设计",
      ai: "AI",
    };
    for (const [o, i] of Object.entries(s))
      n.includes(o) &&
        !t.existingTags.includes(i) &&
        r.push({ tag: i, confidence: 0.6, reason: `包含关键词: ${o}` });
    return r.slice(0, 5);
  }
  getRuleBasedCategorySuggestions(t, r) {
    const n = [];
    for (const a of r)
      t.includes(a.name.toLowerCase()) &&
        n.push({
          categoryId: a.id,
          categoryName: a.name,
          confidence: 0.8,
          reason: "内容包含分类名称",
        });
    if (n.length === 0) {
      const a = $f(t, 0.2);
      n.push(
        ...a
          .slice(0, 3)
          .map((s) => ({
            categoryId: s.category.id,
            categoryName: s.category.name,
            confidence: s.confidence,
            reason: "基于内容关键词匹配",
          })),
      );
    }
    return n;
  }
  reset() {
    ((this.config = null), (this.client = null));
  }
  async generateCategories(t) {
    if ((this.config || (await this.loadConfig()), !this.isConfigured()))
      throw new Error("请先配置 AI 服务");
    try {
      return await this.getOrCreateClient().generateCategories(t);
    } catch (r) {
      throw r;
    }
  }
}
const Gt = new Df(),
  Lf = [
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
    .map((e) => [e.name, e]),
  Uf = new Map(Lf);
class sa extends Error {
  constructor(r) {
    super(sa._prepareSuperMessage(r));
    dt(this, "name", "NonError");
  }
  static _prepareSuperMessage(r) {
    try {
      return JSON.stringify(r);
    } catch {
      return String(r);
    }
  }
}
const Ff = [
    { property: "name", enumerable: !1 },
    { property: "message", enumerable: !1 },
    { property: "stack", enumerable: !1 },
    { property: "code", enumerable: !0 },
    { property: "cause", enumerable: !1 },
  ],
  Un = new WeakSet(),
  qf = (e) => {
    Un.add(e);
    const t = e.toJSON();
    return (Un.delete(e), t);
  },
  Ki = (e) => Uf.get(e) ?? Error,
  oa = ({
    from: e,
    seen: t,
    to: r,
    forceEnumerable: n,
    maxDepth: a,
    depth: s,
    useToJSON: o,
    serialize: i,
  }) => {
    if (!r)
      if (Array.isArray(e)) r = [];
      else if (!i && ss(e)) {
        const c = Ki(e.name);
        r = new c();
      } else r = {};
    if ((t.push(e), s >= a)) return r;
    if (o && typeof e.toJSON == "function" && !Un.has(e)) return qf(e);
    const l = (c) =>
      oa({
        from: c,
        seen: [...t],
        forceEnumerable: n,
        maxDepth: a,
        depth: s,
        useToJSON: o,
        serialize: i,
      });
    for (const [c, u] of Object.entries(e)) {
      if (u && u instanceof Uint8Array && u.constructor.name === "Buffer") {
        r[c] = "[object Buffer]";
        continue;
      }
      if (u !== null && typeof u == "object" && typeof u.pipe == "function") {
        r[c] = "[object Stream]";
        continue;
      }
      if (typeof u != "function") {
        if (!u || typeof u != "object") {
          try {
            r[c] = u;
          } catch {}
          continue;
        }
        if (!t.includes(e[c])) {
          (s++, (r[c] = l(e[c])));
          continue;
        }
        r[c] = "[Circular]";
      }
    }
    for (const { property: c, enumerable: u } of Ff)
      typeof e[c] < "u" &&
        e[c] !== null &&
        Object.defineProperty(r, c, {
          value: ss(e[c]) ? l(e[c]) : e[c],
          enumerable: n ? !0 : u,
          configurable: !0,
          writable: !0,
        });
    return r;
  };
function Bf(e, t = {}) {
  const { maxDepth: r = Number.POSITIVE_INFINITY, useToJSON: n = !0 } = t;
  return typeof e == "object" && e !== null
    ? oa({
        from: e,
        seen: [],
        forceEnumerable: !0,
        maxDepth: r,
        depth: 0,
        useToJSON: n,
        serialize: !0,
      })
    : typeof e == "function"
      ? `[Function: ${e.name || "anonymous"}]`
      : e;
}
function zf(e, t = {}) {
  const { maxDepth: r = Number.POSITIVE_INFINITY } = t;
  if (e instanceof Error) return e;
  if (Zf(e)) {
    const n = Ki(e.name);
    return oa({
      from: e,
      seen: [],
      to: new n(),
      maxDepth: r,
      depth: 0,
      serialize: !1,
    });
  }
  return new sa(e);
}
function ss(e) {
  return (
    !!e && typeof e == "object" && "name" in e && "message" in e && "stack" in e
  );
}
function Zf(e) {
  return !!e && typeof e == "object" && "message" in e && !Array.isArray(e);
}
var Vf = Object.defineProperty,
  Jf = Object.defineProperties,
  Hf = Object.getOwnPropertyDescriptors,
  os = Object.getOwnPropertySymbols,
  Wf = Object.prototype.hasOwnProperty,
  Gf = Object.prototype.propertyIsEnumerable,
  is = (e, t, r) =>
    t in e
      ? Vf(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r })
      : (e[t] = r),
  ls = (e, t) => {
    for (var r in t || (t = {})) Wf.call(t, r) && is(e, r, t[r]);
    if (os) for (var r of os(t)) Gf.call(t, r) && is(e, r, t[r]);
    return e;
  },
  cs = (e, t) => Jf(e, Hf(t)),
  Kf = (e, t, r) =>
    new Promise((n, a) => {
      var s = (l) => {
          try {
            i(r.next(l));
          } catch (c) {
            a(c);
          }
        },
        o = (l) => {
          try {
            i(r.throw(l));
          } catch (c) {
            a(c);
          }
        },
        i = (l) => (l.done ? n(l.value) : Promise.resolve(l.value).then(s, o));
      i((r = r.apply(e, t)).next());
    });
function Yf(e) {
  let t,
    r = {};
  function n() {
    Object.entries(r).length === 0 && (t == null || t(), (t = void 0));
  }
  let a = Math.floor(Math.random() * 1e4);
  function s() {
    return a++;
  }
  return {
    sendMessage(o, i, ...l) {
      return Kf(this, null, function* () {
        var c, u, d, g;
        const _ = { id: s(), type: o, data: i, timestamp: Date.now() },
          h =
            (u = yield (c = e.verifyMessageData) == null
              ? void 0
              : c.call(e, _)) != null
              ? u
              : _;
        (d = e.logger) == null ||
          d.debug(`[messaging] sendMessage {id=${h.id}} ─ᐅ`, h, ...l);
        const v = yield e.sendMessage(h, ...l),
          { res: p, err: f } = v ?? { err: new Error("No response") };
        if (
          ((g = e.logger) == null ||
            g.debug(`[messaging] sendMessage {id=${h.id}} ᐊ─`, {
              res: p,
              err: f,
            }),
          f != null)
        )
          throw zf(f);
        return p;
      });
    },
    onMessage(o, i) {
      var l, c, u;
      if (
        (t == null &&
          ((l = e.logger) == null ||
            l.debug(
              `[messaging] "${o}" initialized the message listener for this context`,
            ),
          (t = e.addRootListener((d) => {
            var g, _;
            if (typeof d.type != "string" || typeof d.timestamp != "number") {
              if (e.breakError) return;
              const p = Error(
                `[messaging] Unknown message format, must include the 'type' & 'timestamp' fields, received: ${JSON.stringify(d)}`,
              );
              throw ((g = e.logger) == null || g.error(p), p);
            }
            (_ = e == null ? void 0 : e.logger) == null ||
              _.debug("[messaging] Received message", d);
            const h = r[d.type];
            if (h == null) return;
            const v = h(d);
            return Promise.resolve(v)
              .then((p) => {
                var f, k;
                return (k =
                  (f = e.verifyMessageData) == null ? void 0 : f.call(e, p)) !=
                  null
                  ? k
                  : p;
              })
              .then((p) => {
                var f;
                return (
                  (f = e == null ? void 0 : e.logger) == null ||
                    f.debug(`[messaging] onMessage {id=${d.id}} ─ᐅ`, {
                      res: p,
                    }),
                  { res: p }
                );
              })
              .catch((p) => {
                var f;
                return (
                  (f = e == null ? void 0 : e.logger) == null ||
                    f.debug(`[messaging] onMessage {id=${d.id}} ─ᐅ`, {
                      err: p,
                    }),
                  { err: Bf(p) }
                );
              });
          }))),
        r[o] != null)
      ) {
        const d = Error(
          `[messaging] In this JS context, only one listener can be setup for ${o}`,
        );
        throw ((c = e.logger) == null || c.error(d), d);
      }
      return (
        (r[o] = i),
        (u = e.logger) == null || u.log(`[messaging] Added listener for ${o}`),
        () => {
          (delete r[o], n());
        }
      );
    },
    removeAllListeners() {
      (Object.keys(r).forEach((o) => {
        delete r[o];
      }),
        n());
    },
  };
}
var Yi = { exports: {} };
(function (e, t) {
  (function (r, n) {
    n(e);
  })(
    typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : Il,
    function (r) {
      var n, a;
      if (
        !(
          (a = (n = globalThis.chrome) == null ? void 0 : n.runtime) != null &&
          a.id
        )
      )
        throw new Error(
          "This script should only be loaded in a browser extension.",
        );
      if (
        typeof globalThis.browser > "u" ||
        Object.getPrototypeOf(globalThis.browser) !== Object.prototype
      ) {
        const s = "The message port closed before a response was received.",
          o = (i) => {
            const l = {
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
                setPopup: { minArgs: 1, maxArgs: 1, fallbackToNoCallback: !0 },
                setTitle: { minArgs: 1, maxArgs: 1, fallbackToNoCallback: !0 },
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
                setPopup: { minArgs: 1, maxArgs: 1, fallbackToNoCallback: !0 },
                setTitle: { minArgs: 1, maxArgs: 1, fallbackToNoCallback: !0 },
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
            if (Object.keys(l).length === 0)
              throw new Error(
                "api-metadata.json has not been included in browser-polyfill",
              );
            class c extends WeakMap {
              constructor(x, D = void 0) {
                (super(D), (this.createItem = x));
              }
              get(x) {
                return (
                  this.has(x) || this.set(x, this.createItem(x)),
                  super.get(x)
                );
              }
            }
            const u = (b) =>
                b && typeof b == "object" && typeof b.then == "function",
              d =
                (b, x) =>
                (...D) => {
                  i.runtime.lastError
                    ? b.reject(new Error(i.runtime.lastError.message))
                    : x.singleCallbackArg ||
                        (D.length <= 1 && x.singleCallbackArg !== !1)
                      ? b.resolve(D[0])
                      : b.resolve(D);
                },
              g = (b) => (b == 1 ? "argument" : "arguments"),
              _ = (b, x) =>
                function (q, ...Q) {
                  if (Q.length < x.minArgs)
                    throw new Error(
                      `Expected at least ${x.minArgs} ${g(x.minArgs)} for ${b}(), got ${Q.length}`,
                    );
                  if (Q.length > x.maxArgs)
                    throw new Error(
                      `Expected at most ${x.maxArgs} ${g(x.maxArgs)} for ${b}(), got ${Q.length}`,
                    );
                  return new Promise((L, R) => {
                    if (x.fallbackToNoCallback)
                      try {
                        q[b](...Q, d({ resolve: L, reject: R }, x));
                      } catch {
                        (q[b](...Q),
                          (x.fallbackToNoCallback = !1),
                          (x.noCallback = !0),
                          L());
                      }
                    else
                      x.noCallback
                        ? (q[b](...Q), L())
                        : q[b](...Q, d({ resolve: L, reject: R }, x));
                  });
                },
              h = (b, x, D) =>
                new Proxy(x, {
                  apply(q, Q, L) {
                    return D.call(Q, b, ...L);
                  },
                });
            let v = Function.call.bind(Object.prototype.hasOwnProperty);
            const p = (b, x = {}, D = {}) => {
                let q = Object.create(null),
                  Q = {
                    has(R, O) {
                      return O in b || O in q;
                    },
                    get(R, O, H) {
                      if (O in q) return q[O];
                      if (!(O in b)) return;
                      let F = b[O];
                      if (typeof F == "function")
                        if (typeof x[O] == "function") F = h(b, b[O], x[O]);
                        else if (v(D, O)) {
                          let j = _(O, D[O]);
                          F = h(b, b[O], j);
                        } else F = F.bind(b);
                      else if (
                        typeof F == "object" &&
                        F !== null &&
                        (v(x, O) || v(D, O))
                      )
                        F = p(F, x[O], D[O]);
                      else if (v(D, "*")) F = p(F, x[O], D["*"]);
                      else
                        return (
                          Object.defineProperty(q, O, {
                            configurable: !0,
                            enumerable: !0,
                            get() {
                              return b[O];
                            },
                            set(j) {
                              b[O] = j;
                            },
                          }),
                          F
                        );
                      return ((q[O] = F), F);
                    },
                    set(R, O, H, F) {
                      return (O in q ? (q[O] = H) : (b[O] = H), !0);
                    },
                    defineProperty(R, O, H) {
                      return Reflect.defineProperty(q, O, H);
                    },
                    deleteProperty(R, O) {
                      return Reflect.deleteProperty(q, O);
                    },
                  },
                  L = Object.create(b);
                return new Proxy(L, Q);
              },
              f = (b) => ({
                addListener(x, D, ...q) {
                  x.addListener(b.get(D), ...q);
                },
                hasListener(x, D) {
                  return x.hasListener(b.get(D));
                },
                removeListener(x, D) {
                  x.removeListener(b.get(D));
                },
              }),
              k = new c((b) =>
                typeof b != "function"
                  ? b
                  : function (D) {
                      const q = p(
                        D,
                        {},
                        { getContent: { minArgs: 0, maxArgs: 0 } },
                      );
                      b(q);
                    },
              ),
              S = new c((b) =>
                typeof b != "function"
                  ? b
                  : function (D, q, Q) {
                      let L = !1,
                        R,
                        O = new Promise((Z) => {
                          R = function (V) {
                            ((L = !0), Z(V));
                          };
                        }),
                        H;
                      try {
                        H = b(D, q, R);
                      } catch (Z) {
                        H = Promise.reject(Z);
                      }
                      const F = H !== !0 && u(H);
                      if (H !== !0 && !F && !L) return !1;
                      const j = (Z) => {
                        Z.then(
                          (V) => {
                            Q(V);
                          },
                          (V) => {
                            let J;
                            (V &&
                            (V instanceof Error || typeof V.message == "string")
                              ? (J = V.message)
                              : (J = "An unexpected error occurred"),
                              Q({
                                __mozWebExtensionPolyfillReject__: !0,
                                message: J,
                              }));
                          },
                        ).catch((V) => {});
                      };
                      return (j(F ? H : O), !0);
                    },
              ),
              w = ({ reject: b, resolve: x }, D) => {
                i.runtime.lastError
                  ? i.runtime.lastError.message === s
                    ? x()
                    : b(new Error(i.runtime.lastError.message))
                  : D && D.__mozWebExtensionPolyfillReject__
                    ? b(new Error(D.message))
                    : x(D);
              },
              A = (b, x, D, ...q) => {
                if (q.length < x.minArgs)
                  throw new Error(
                    `Expected at least ${x.minArgs} ${g(x.minArgs)} for ${b}(), got ${q.length}`,
                  );
                if (q.length > x.maxArgs)
                  throw new Error(
                    `Expected at most ${x.maxArgs} ${g(x.maxArgs)} for ${b}(), got ${q.length}`,
                  );
                return new Promise((Q, L) => {
                  const R = w.bind(null, { resolve: Q, reject: L });
                  (q.push(R), D.sendMessage(...q));
                });
              },
              I = {
                devtools: { network: { onRequestFinished: f(k) } },
                runtime: {
                  onMessage: f(S),
                  onMessageExternal: f(S),
                  sendMessage: A.bind(null, "sendMessage", {
                    minArgs: 1,
                    maxArgs: 3,
                  }),
                },
                tabs: {
                  sendMessage: A.bind(null, "sendMessage", {
                    minArgs: 2,
                    maxArgs: 3,
                  }),
                },
              },
              z = {
                clear: { minArgs: 1, maxArgs: 1 },
                get: { minArgs: 1, maxArgs: 1 },
                set: { minArgs: 1, maxArgs: 1 },
              };
            return (
              (l.privacy = {
                network: { "*": z },
                services: { "*": z },
                websites: { "*": z },
              }),
              p(i, I, l)
            );
          };
        r.exports = o(chrome);
      } else r.exports = globalThis.browser;
    },
  );
})(Yi);
var Xf = Yi.exports;
const kr = ws(Xf);
function Qf(e) {
  return Yf(
    cs(ls({}, e), {
      sendMessage(t, r) {
        if (r == null) return kr.runtime.sendMessage(t);
        const n = typeof r == "number" ? { tabId: r } : r;
        return kr.tabs.sendMessage(
          n.tabId,
          t,
          n.frameId != null ? { frameId: n.frameId } : void 0,
        );
      },
      addRootListener(t) {
        const r = (n, a) =>
          t(typeof n == "object" ? cs(ls({}, n), { sender: a }) : n);
        return (
          kr.runtime.onMessage.addListener(r),
          () => kr.runtime.onMessage.removeListener(r)
        );
      },
    }),
  );
}
var eh = Object.defineProperty,
  us = Object.getOwnPropertySymbols,
  th = Object.prototype.hasOwnProperty,
  rh = Object.prototype.propertyIsEnumerable,
  ds = (e, t, r) =>
    t in e
      ? eh(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r })
      : (e[t] = r),
  nh = (e, t) => {
    for (var r in t || (t = {})) th.call(t, r) && ds(e, r, t[r]);
    if (us) for (var r of us(t)) rh.call(t, r) && ds(e, r, t[r]);
    return e;
  },
  ah = (e, t, r) =>
    new Promise((n, a) => {
      var s = (l) => {
          try {
            i(r.next(l));
          } catch (c) {
            a(c);
          }
        },
        o = (l) => {
          try {
            i(r.throw(l));
          } catch (c) {
            a(c);
          }
        },
        i = (l) => (l.done ? n(l.value) : Promise.resolve(l.value).then(s, o));
      i((r = r.apply(e, t)).next());
    });
function sh(e, t) {
  return Xi(oh(e, t));
}
function oh(e, t) {
  const r = Qf(t);
  return nh({ messageKey: `proxy-service.${e}` }, r);
}
function Xi(e, t) {
  const r = () => {},
    n = new Proxy(r, {
      apply(a, s, o) {
        return ah(this, null, function* () {
          return yield e.sendMessage(e.messageKey, { path: t, args: o });
        });
      },
      get(a, s, o) {
        return typeof s == "symbol"
          ? Reflect.get(a, s, o)
          : Xi(e, t == null ? [s] : t.concat([s]));
      },
    });
  return ((n[ih] = !0), n);
}
var ih = Symbol();
const vt = El;
dr({ namespace: "ExtensionEmbedding" });
function lh(e) {
  return Sf(e);
}
class ps extends Error {
  constructor(r, n) {
    super(r);
    dt(this, "retryAfterSeconds");
    ((this.name = "EmbeddingRateLimitError"), (this.retryAfterSeconds = n));
  }
}
class ch {
  constructor() {
    dt(this, "config", null);
    dt(this, "client", null);
  }
  async loadConfig() {
    return (
      (this.config = await Ie.getEmbeddingConfig()),
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
    return this.config ? lh(this.config.provider) : !1;
  }
  getOrCreateClient() {
    if (!this.client && this.config) {
      const t = {
        provider: this.config.provider,
        apiKey: this.config.apiKey,
        baseUrl: this.config.baseUrl,
        model: this.config.model || Tf(this.config.provider),
        dimensions: this.config.dimensions,
      };
      this.client = If(t);
    }
    return this.client;
  }
  getModelKey() {
    if (!this.config) throw new Error("EmbeddingClient not configured");
    return Wi({
      provider: this.config.provider,
      model: this.config.model,
      dimensions: this.config.dimensions,
    });
  }
  async embed(t) {
    var r;
    if ((this.config || (await this.loadConfig()), !this.isEnabled()))
      throw new Error("Embedding service is not enabled or configured");
    if (!this.isProviderSupported())
      throw new Error(
        `Provider ${(r = this.config) == null ? void 0 : r.provider} does not support embedding`,
      );
    try {
      return (await this.getOrCreateClient().embed(t)).embedding;
    } catch (n) {
      throw this.isRateLimitError(n)
        ? new ps("Rate limit exceeded", this.extractRetryAfter(n))
        : n;
    }
  }
  async embedBatch(t) {
    var r;
    if ((this.config || (await this.loadConfig()), !this.isEnabled()))
      throw new Error("Embedding service is not enabled or configured");
    if (!this.isProviderSupported())
      throw new Error(
        `Provider ${(r = this.config) == null ? void 0 : r.provider} does not support embedding`,
      );
    try {
      return (await this.getOrCreateClient().embedMany(t)).embeddings;
    } catch (n) {
      throw this.isRateLimitError(n)
        ? new ps("Rate limit exceeded", this.extractRetryAfter(n))
        : n;
    }
  }
  async testConnection() {
    var t;
    if ((this.config || (await this.loadConfig()), !this.isEnabled()))
      return {
        success: !1,
        error: "Embedding service is not enabled or configured",
      };
    if (!this.isProviderSupported())
      return {
        success: !1,
        error: `Provider ${(t = this.config) == null ? void 0 : t.provider} does not support embedding`,
      };
    try {
      return await this.getOrCreateClient().testConnection();
    } catch (r) {
      return { success: !1, error: r instanceof Error ? r.message : String(r) };
    }
  }
  isRateLimitError(t) {
    if (t instanceof Error) {
      const r = t.message.toLowerCase();
      return (
        r.includes("rate limit") ||
        r.includes("429") ||
        r.includes("too many requests")
      );
    }
    return !1;
  }
  extractRetryAfter(t) {
    if (t instanceof Error) {
      const r = t.message.match(/retry after (\d+)/i);
      if (r) return parseInt(r[1], 10);
    }
  }
}
const jt = new ch();
dr({ namespace: "EmbeddingQueue" });
const Ye = dr({ namespace: "SemanticRetriever" });
function ms(e, t) {
  if (e.length !== t.length) throw new Error("Vector dimensions do not match");
  let r = 0,
    n = 0,
    a = 0;
  for (let s = 0; s < e.length; s++)
    ((r += e[s] * t[s]), (n += e[s] * e[s]), (a += t[s] * t[s]));
  return n === 0 || a === 0 ? 0 : r / (Math.sqrt(n) * Math.sqrt(a));
}
function _n(e) {
  return new Float32Array(e);
}
class uh {
  async isAvailable() {
    await jt.loadConfig();
    const t = jt.isEnabled(),
      r = jt.isProviderSupported(),
      n = jt.getConfig(),
      a = t && r;
    return (
      a
        ? Ye.debug("Semantic retriever available", {
            provider: n == null ? void 0 : n.provider,
            model: n == null ? void 0 : n.model,
          })
        : Ye.info("Semantic retriever not available", {
            isEnabled: t,
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
      a
    );
  }
  async search(t, r = {}) {
    var v;
    const {
      topK: n = 20,
      minScore: a = 0.3,
      excludeIds: s = [],
      filterIds: o,
    } = r;
    if (!(await this.isAvailable()))
      return (
        Ye.warn("Semantic search is not available"),
        { items: [], queryDimensions: 0, searchedCount: 0 }
      );
    Ye.debug("Generating query embedding", { query: t.slice(0, 50) });
    const i = await jt.embed(t),
      l = new Float32Array(i),
      c = jt.getModelKey(),
      u = await vr.getEmbeddingsByModel(c);
    (Ye.debug("Searching embeddings", {
      modelKey: c,
      embeddingCount: u.length,
      queryDimensions: i.length,
    }),
      u.length === 0 &&
        Ye.warn("No embeddings found for model", { modelKey: c }));
    let d = u;
    if (o && o.length > 0) {
      const p = new Set(o);
      d = u.filter((f) => p.has(f.bookmarkId));
    }
    if (s.length > 0) {
      const p = new Set(s);
      d = d.filter((f) => !p.has(f.bookmarkId));
    }
    const g = [];
    for (const p of d) {
      if (p.dim !== i.length) {
        Ye.warn("Dimension mismatch", {
          bookmarkId: p.bookmarkId,
          embeddingDim: p.dim,
          queryDim: i.length,
        });
        continue;
      }
      const f = _n(p.vector),
        k = ms(l, f);
      k >= a && g.push({ bookmarkId: p.bookmarkId, score: k });
    }
    g.sort((p, f) => f.score - p.score);
    const h = g
      .slice(0, n)
      .map((p) => ({
        bookmarkId: p.bookmarkId,
        score: p.score,
        semanticScore: p.score,
        matchReason: `语义相似度: ${(p.score * 100).toFixed(1)}%`,
      }));
    return (
      Ye.debug("Semantic search completed", {
        query: t.slice(0, 50),
        searchedCount: d.length,
        resultCount: h.length,
        topScore: (v = h[0]) == null ? void 0 : v.score,
      }),
      { items: h, queryDimensions: i.length, searchedCount: d.length }
    );
  }
  async findSimilar(t, r = {}) {
    const { topK: n = 10, minScore: a = 0.5, excludeIds: s = [] } = r,
      o = await vr.getEmbedding(t);
    if (!o)
      return (
        Ye.warn("Bookmark embedding not found", { bookmarkId: t }),
        { items: [], queryDimensions: 0, searchedCount: 0 }
      );
    const i = _n(o.vector),
      l = await vr.getEmbeddingsByModel(o.modelKey),
      c = new Set([t, ...s]),
      u = l.filter((h) => !c.has(h.bookmarkId)),
      d = [];
    for (const h of u) {
      if (h.dim !== o.dim) continue;
      const v = _n(h.vector),
        p = ms(i, v);
      p >= a && d.push({ bookmarkId: h.bookmarkId, score: p });
    }
    return (
      d.sort((h, v) => v.score - h.score),
      {
        items: d
          .slice(0, n)
          .map((h) => ({
            bookmarkId: h.bookmarkId,
            score: h.score,
            semanticScore: h.score,
            matchReason: `相似度: ${(h.score * 100).toFixed(1)}%`,
          })),
        queryDimensions: o.dim,
        searchedCount: u.length,
      }
    );
  }
  async getCoverageStats() {
    const t = await oe.getBookmarks({ isDeleted: !1 }),
      r = t.length;
    if (r === 0) return { total: 0, withEmbedding: 0, coverage: 0 };
    const n = t.map((o) => o.id),
      s = (await vr.getEmbeddings(n)).size;
    return { total: r, withEmbedding: s, coverage: Math.round((s / r) * 100) };
  }
}
const Vh = new uh();
function Qi() {
  return "chrome";
}
function Jh() {
  return Qi() === "firefox";
}
function dh() {
  if (typeof window > "u" || typeof location > "u") return !1;
  const e = location.protocol;
  return !(e === "chrome-extension:" || e === "moz-extension:");
}
function Hh(e) {
  const t = Qi();
  switch (e) {
    case "shortcuts":
      return t === "firefox" ? "about:addons" : "chrome://extensions/shortcuts";
    case "extensions":
    case "addons":
      return t === "firefox" ? "about:addons" : "chrome://extensions";
    default:
      return "";
  }
}
async function Wh(e) {
  try {
    return await vt.tabs.create({ url: e });
  } catch {
    return null;
  }
}
function Gh(e) {
  return vt.runtime.getURL(e);
}
async function Kh(e, t) {
  try {
    return await vt.tabs.sendMessage(e, t);
  } catch {
    return null;
  }
}
async function ph() {
  var e;
  try {
    if (!((e = vt == null ? void 0 : vt.commands) != null && e.getAll))
      return [];
    const t = await vt.commands.getAll(),
      r = ["_execute_action", "_execute_browser_action", "reload"];
    return t
      .filter(
        (n) => !(!n.name || r.some((a) => n.name.toLowerCase().includes(a))),
      )
      .map((n) => ({
        name: n.name || "",
        description: n.description || "",
        shortcut: n.shortcut || "",
      }));
  } catch {
    return [];
  }
}
async function mh() {
  if (!dh()) return ph();
  try {
    const { getBackgroundService: e } = await Rl(
      async () => {
        const { getBackgroundService: r } = await Promise.resolve().then(
          () => fh,
        );
        return { getBackgroundService: r };
      },
      void 0,
    );
    return await e().getShortcuts();
  } catch {
    return [];
  }
}
const gh = "BackgroundService";
function Fn() {
  return sh(gh);
}
const fh = Object.freeze(
  Object.defineProperty(
    { __proto__: null, getBackgroundService: Fn },
    Symbol.toStringTag,
    { value: "Module" },
  ),
);
function Yh({ pageContent: e, existingBookmark: t, onSaved: r }) {
  const [n, a] = T.useState(e.url),
    [s, o] = T.useState(e.title),
    [i, l] = T.useState(""),
    [c, u] = T.useState(null),
    [d, g] = T.useState([]),
    [_, h] = T.useState([]),
    [v, p] = T.useState([]),
    [f, k] = T.useState(!1),
    [S, w] = T.useState("idle"),
    [A, I] = T.useState(null),
    [z, b] = T.useState(null),
    [x, D] = T.useState(!1);
  (T.useEffect(() => {
    (async () => {
      const [j, Z] = await Promise.all([oe.getCategories(), oe.getAllTags()]);
      (h(j), p(Z), k(!0));
    })();
  }, []),
    T.useEffect(() => {
      t && (a(t.url), o(t.title), l(t.description), u(t.categoryId), g(t.tags));
    }, [t]),
    T.useEffect(() => {
      f && !t && (e.content || e.textContent) && Q();
    }, [f]));
  const q = T.useCallback(
      async (F = !1) => {
        const j = await Ie.getAIConfig(),
          Z = await Ie.getSettings();
        if (!(j.provider === "ollama" ? !!j.baseUrl : !!j.apiKey)) {
          w("disabled");
          return;
        }
        (w("loading"), I(null));
        try {
          if (!F) {
            const Ee = await _a.getCachedAnalysis(e.url);
            if (Ee) {
              (await gs(Ee, j, _, o, l, g, u, b, t, Z.language), w("success"));
              return;
            }
          }
          if ((await Gt.loadConfig(), !Gt.isConfigured())) {
            w("disabled");
            return;
          }
          const J = await oe.getAllTags(),
            xe = await Gt.analyzeComplete({
              pageContent: e,
              userCategories: _,
              existingTags: J,
            });
          (await _a.cacheAnalysis(e, xe),
            await gs(xe, j, _, o, l, g, u, b, t, Z.language),
            w("success"));
        } catch (J) {
          (w("error"), I(J instanceof Error ? J.message : "分析失败"));
        }
      },
      [e, _, t],
    ),
    Q = T.useCallback(async () => {
      await q(!1);
    }, [q]),
    L = T.useCallback(async () => {
      await q(!0);
    }, [q]),
    R = T.useCallback(async () => {
      if (z)
        try {
          const F = Us(z);
          let j = await oe.getCategories(),
            Z = null,
            V = null;
          const J = [];
          for (const xe of F) {
            const Ee = xe.trim();
            if (!Ee) continue;
            const Oe = j.find(
              (re) =>
                re.name.toLowerCase() === Ee.toLowerCase() && re.parentId === Z,
            );
            if (Oe) ((Z = Oe.id), (V = Oe));
            else {
              const re = await oe.createCategory(Ee, Z);
              (J.push(re), (Z = re.id), (V = re), (j = [...j, re]));
            }
          }
          V && (u(V.id), J.length > 0 && h((xe) => [...xe, ...J]), b(null));
        } catch {}
    }, [z]),
    O = T.useCallback(async () => {
      if (!(!s.trim() || !n.trim())) {
        D(!0);
        try {
          const F = await Ie.getSettings(),
            j = {
              url: n.trim(),
              title: s.trim(),
              description: i.trim(),
              content: e.content,
              categoryId: c,
              tags: d,
              favicon: e.favicon,
              hasSnapshot: !1,
            };
          let Z;
          if (
            (t
              ? (Z = await oe.updateBookmark(t.id, j))
              : (Z = await oe.createBookmark(j)),
            F.autoSaveSnapshot && e.content)
          )
            try {
              const J = await Fn().getPageHtml();
              J &&
                (await Pl.saveSnapshot(Z.id, J),
                await oe.updateBookmark(Z.id, { hasSnapshot: !0 }));
            } catch {}
          try {
            await Fn().queueBookmarkEmbedding(Z.id);
          } catch {}
          r == null || r();
        } catch (F) {
          alert(F instanceof Error ? F.message : "保存失败");
        } finally {
          D(!1);
        }
      }
    }, [n, s, i, c, d, e, t, r]),
    H = T.useCallback(async () => {
      if (t && confirm(`确定要删除书签《${t.title}》吗？`)) {
        D(!0);
        try {
          (await oe.deleteBookmark(t.id), r == null || r());
        } catch (F) {
          alert(F instanceof Error ? F.message : "删除失败");
        } finally {
          D(!1);
        }
      }
    }, [t, r]);
  return {
    url: n,
    title: s,
    description: i,
    categoryId: c,
    tags: d,
    categories: _,
    allTags: v,
    aiStatus: S,
    aiError: A,
    saving: x,
    setUrl: a,
    setTitle: o,
    setDescription: l,
    setCategoryId: u,
    setTags: g,
    runAIAnalysis: Q,
    retryAnalysis: L,
    applyAIRecommendedCategory: R,
    aiRecommendedCategory: z,
    save: O,
    deleteBookmark: H,
  };
}
function hh(e, t) {
  const r = e.toLowerCase(),
    n = new Set(t.map((i) => i.parentId).filter(Boolean)),
    a = (i) => !n.has(i.id),
    s = t.filter((i) => i.name.toLowerCase() === r);
  if (s.length > 0) return { matched: !0, categoryId: (s.find(a) || s[0]).id };
  const o = t.filter(
    (i) => i.name.toLowerCase().includes(r) || r.includes(i.name.toLowerCase()),
  );
  return o.length > 0
    ? { matched: !0, categoryId: (o.find(a) || o[0]).id }
    : { matched: !1, categoryId: null };
}
async function gs(e, t, r, n, a, s, o, i, l, c = "zh") {
  if ((e.title && !l && n(e.title), e.summary))
    if (t.enableTranslation) {
      const u = await Gt.translate(e.summary, c);
      a(u);
    } else a(e.summary);
  if (t.enableTagSuggestion && e.tags.length > 0)
    if (t.enableTranslation) {
      const u = await Promise.all(e.tags.map((d) => Gt.translate(d, c)));
      s(u);
    } else s(e.tags);
  if (t.enableSmartCategory && e.category) {
    const u = hh(e.category, r);
    u.matched ? (o(u.categoryId), i(null)) : (o(null), i(e.category));
  }
}
const yh = T.createContext(null);
function Xh() {
  const e = T.useContext(yh);
  if (!e) throw new Error("useContentUI must be used within ContentUIProvider");
  return e;
}
function vh(e) {
  if (!e) return "";
  const t =
    typeof navigator < "u" && /Mac|iPhone|iPad/.test(navigator.platform);
  return e
    .replace(/⌘/g, t ? "⌘" : "Ctrl")
    .replace(/⇧/g, "Shift")
    .replace(/⌥/g, t ? "Option" : "Alt")
    .replace(/⌃/g, "Ctrl")
    .replace(/Command/gi, t ? "⌘" : "Ctrl")
    .replace(/Ctrl/gi, t ? "⌃" : "Ctrl")
    .replace(/Alt/gi, t ? "Option" : "Alt")
    .split(new RegExp("(?=[A-Z⌘⌃⌥])|(?<=[\\+\\s])", "g"))
    .map((a) => a.trim())
    .filter((a) => a && a !== "+")
    .join(" + ");
}
function Qh() {
  const [e, t] = T.useState([]),
    [r, n] = T.useState(!0),
    a = T.useCallback(async () => {
      try {
        const o = (await mh()).map((i) => ({
          name: i.name,
          description: i.description,
          shortcut: i.shortcut,
          formattedShortcut: vh(i.shortcut),
        }));
        t(o);
      } catch {
        t([]);
      } finally {
        n(!1);
      }
    }, []);
  return (
    T.useEffect(() => {
      a();
    }, [a]),
    T.useEffect(() => {
      const s = () => {
        a();
      };
      return (
        window.addEventListener("focus", s),
        () => window.removeEventListener("focus", s)
      );
    }, [a]),
    T.useEffect(() => {
      const s = () => {
        document.visibilityState === "visible" && a();
      };
      return (
        document.addEventListener("visibilitychange", s),
        () => document.removeEventListener("visibilitychange", s)
      );
    }, [a]),
    { shortcuts: e, isLoading: r, refresh: a }
  );
}
export {
  zh as $,
  xh as A,
  kh as B,
  Ah as C,
  m as D,
  ct as E,
  Sh as F,
  Pe as G,
  K as H,
  kf as I,
  Af as J,
  Th as K,
  Eh as L,
  Rh as M,
  mh as N,
  Ql as O,
  Xl as P,
  ec as Q,
  Lh as R,
  Ph as S,
  Oh as T,
  Wr as U,
  Bh as V,
  Sf as W,
  Tf as X,
  ur as Y,
  Jh as Z,
  Gt as _,
  Yh as a,
  Zh as a0,
  Of as a1,
  Us as a2,
  ht as b,
  Fh as c,
  Uh as d,
  Qh as e,
  Xh as f,
  Gh as g,
  Dh as h,
  Nh as i,
  Ch as j,
  Ih as k,
  Fn as l,
  Hh as m,
  vt as n,
  Kh as o,
  $h as p,
  jh as q,
  Mh as r,
  Wh as s,
  Dl as t,
  qn as u,
  yh as v,
  dh as w,
  Vh as x,
  y,
  N as z,
};
