var XS = Object.defineProperty;
var $S = (e, t, n) =>
  t in e
    ? XS(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
    : (e[t] = n);
var fc = (e, t, n) => $S(e, typeof t != "symbol" ? t + "" : t, n);
function QS(e, t) {
  for (var n = 0; n < t.length; n++) {
    const a = t[n];
    if (typeof a != "string" && !Array.isArray(a)) {
      for (const o in a)
        if (o !== "default" && !(o in e)) {
          const r = Object.getOwnPropertyDescriptor(a, o);
          r &&
            Object.defineProperty(
              e,
              o,
              r.get ? r : { enumerable: !0, get: () => a[o] },
            );
        }
    }
  }
  return Object.freeze(
    Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
  );
}
(function () {
  const t = document.createElement("link").relList;
  if (t && t.supports && t.supports("modulepreload")) return;
  for (const o of document.querySelectorAll('link[rel="modulepreload"]')) a(o);
  new MutationObserver((o) => {
    for (const r of o)
      if (r.type === "childList")
        for (const i of r.addedNodes)
          i.tagName === "LINK" && i.rel === "modulepreload" && a(i);
  }).observe(document, { childList: !0, subtree: !0 });
  function n(o) {
    const r = {};
    return (
      o.integrity && (r.integrity = o.integrity),
      o.referrerPolicy && (r.referrerPolicy = o.referrerPolicy),
      o.crossOrigin === "use-credentials"
        ? (r.credentials = "include")
        : o.crossOrigin === "anonymous"
          ? (r.credentials = "omit")
          : (r.credentials = "same-origin"),
      r
    );
  }
  function a(o) {
    if (o.ep) return;
    o.ep = !0;
    const r = n(o);
    fetch(o.href, r);
  }
})();
try {
} catch {}
var kk =
  typeof globalThis < "u"
    ? globalThis
    : typeof window < "u"
      ? window
      : typeof global < "u"
        ? global
        : typeof self < "u"
          ? self
          : {};
function Ef(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default")
    ? e.default
    : e;
}
var Fh = { exports: {} },
  As = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var ZS = Symbol.for("react.transitional.element"),
  JS = Symbol.for("react.fragment");
function Kh(e, t, n) {
  var a = null;
  if (
    (n !== void 0 && (a = "" + n),
    t.key !== void 0 && (a = "" + t.key),
    "key" in t)
  ) {
    n = {};
    for (var o in t) o !== "key" && (n[o] = t[o]);
  } else n = t;
  return (
    (t = n.ref),
    { $$typeof: ZS, type: e, key: a, ref: t !== void 0 ? t : null, props: n }
  );
}
As.Fragment = JS;
As.jsx = Kh;
As.jsxs = Kh;
Fh.exports = As;
var x = Fh.exports,
  qh = { exports: {} },
  Z = {};
/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Cf = Symbol.for("react.transitional.element"),
  WS = Symbol.for("react.portal"),
  ew = Symbol.for("react.fragment"),
  tw = Symbol.for("react.strict_mode"),
  nw = Symbol.for("react.profiler"),
  aw = Symbol.for("react.consumer"),
  ow = Symbol.for("react.context"),
  rw = Symbol.for("react.forward_ref"),
  iw = Symbol.for("react.suspense"),
  lw = Symbol.for("react.memo"),
  Xh = Symbol.for("react.lazy"),
  sw = Symbol.for("react.activity"),
  sm = Symbol.iterator;
function cw(e) {
  return e === null || typeof e != "object"
    ? null
    : ((e = (sm && e[sm]) || e["@@iterator"]),
      typeof e == "function" ? e : null);
}
var $h = {
    isMounted: function () {
      return !1;
    },
    enqueueForceUpdate: function () {},
    enqueueReplaceState: function () {},
    enqueueSetState: function () {},
  },
  Qh = Object.assign,
  Zh = {};
function Qo(e, t, n) {
  ((this.props = e),
    (this.context = t),
    (this.refs = Zh),
    (this.updater = n || $h));
}
Qo.prototype.isReactComponent = {};
Qo.prototype.setState = function (e, t) {
  if (typeof e != "object" && typeof e != "function" && e != null)
    throw Error(
      "takes an object of state variables to update or a function which returns an object of state variables.",
    );
  this.updater.enqueueSetState(this, e, t, "setState");
};
Qo.prototype.forceUpdate = function (e) {
  this.updater.enqueueForceUpdate(this, e, "forceUpdate");
};
function Jh() {}
Jh.prototype = Qo.prototype;
function Af(e, t, n) {
  ((this.props = e),
    (this.context = t),
    (this.refs = Zh),
    (this.updater = n || $h));
}
var Tf = (Af.prototype = new Jh());
Tf.constructor = Af;
Qh(Tf, Qo.prototype);
Tf.isPureReactComponent = !0;
var cm = Array.isArray;
function uu() {}
var Ee = { H: null, A: null, T: null, S: null },
  Wh = Object.prototype.hasOwnProperty;
function Rf(e, t, n) {
  var a = n.ref;
  return {
    $$typeof: Cf,
    type: e,
    key: t,
    ref: a !== void 0 ? a : null,
    props: n,
  };
}
function uw(e, t) {
  return Rf(e.type, t, e.props);
}
function Mf(e) {
  return typeof e == "object" && e !== null && e.$$typeof === Cf;
}
function fw(e) {
  var t = { "=": "=0", ":": "=2" };
  return (
    "$" +
    e.replace(/[=:]/g, function (n) {
      return t[n];
    })
  );
}
var um = /\/+/g;
function dc(e, t) {
  return typeof e == "object" && e !== null && e.key != null
    ? fw("" + e.key)
    : t.toString(36);
}
function dw(e) {
  switch (e.status) {
    case "fulfilled":
      return e.value;
    case "rejected":
      throw e.reason;
    default:
      switch (
        (typeof e.status == "string"
          ? e.then(uu, uu)
          : ((e.status = "pending"),
            e.then(
              function (t) {
                e.status === "pending" &&
                  ((e.status = "fulfilled"), (e.value = t));
              },
              function (t) {
                e.status === "pending" &&
                  ((e.status = "rejected"), (e.reason = t));
              },
            )),
        e.status)
      ) {
        case "fulfilled":
          return e.value;
        case "rejected":
          throw e.reason;
      }
  }
  throw e;
}
function fo(e, t, n, a, o) {
  var r = typeof e;
  (r === "undefined" || r === "boolean") && (e = null);
  var i = !1;
  if (e === null) i = !0;
  else
    switch (r) {
      case "bigint":
      case "string":
      case "number":
        i = !0;
        break;
      case "object":
        switch (e.$$typeof) {
          case Cf:
          case WS:
            i = !0;
            break;
          case Xh:
            return ((i = e._init), fo(i(e._payload), t, n, a, o));
        }
    }
  if (i)
    return (
      (o = o(e)),
      (i = a === "" ? "." + dc(e, 0) : a),
      cm(o)
        ? ((n = ""),
          i != null && (n = i.replace(um, "$&/") + "/"),
          fo(o, t, n, "", function (c) {
            return c;
          }))
        : o != null &&
          (Mf(o) &&
            (o = uw(
              o,
              n +
                (o.key == null || (e && e.key === o.key)
                  ? ""
                  : ("" + o.key).replace(um, "$&/") + "/") +
                i,
            )),
          t.push(o)),
      1
    );
  i = 0;
  var l = a === "" ? "." : a + ":";
  if (cm(e))
    for (var s = 0; s < e.length; s++)
      ((a = e[s]), (r = l + dc(a, s)), (i += fo(a, t, n, r, o)));
  else if (((s = cw(e)), typeof s == "function"))
    for (e = s.call(e), s = 0; !(a = e.next()).done; )
      ((a = a.value), (r = l + dc(a, s++)), (i += fo(a, t, n, r, o)));
  else if (r === "object") {
    if (typeof e.then == "function") return fo(dw(e), t, n, a, o);
    throw (
      (t = String(e)),
      Error(
        "Objects are not valid as a React child (found: " +
          (t === "[object Object]"
            ? "object with keys {" + Object.keys(e).join(", ") + "}"
            : t) +
          "). If you meant to render a collection of children, use an array instead.",
      )
    );
  }
  return i;
}
function Bi(e, t, n) {
  if (e == null) return e;
  var a = [],
    o = 0;
  return (
    fo(e, a, "", "", function (r) {
      return t.call(n, r, o++);
    }),
    a
  );
}
function mw(e) {
  if (e._status === -1) {
    var t = e._result;
    ((t = t()),
      t.then(
        function (n) {
          (e._status === 0 || e._status === -1) &&
            ((e._status = 1), (e._result = n));
        },
        function (n) {
          (e._status === 0 || e._status === -1) &&
            ((e._status = 2), (e._result = n));
        },
      ),
      e._status === -1 && ((e._status = 0), (e._result = t)));
  }
  if (e._status === 1) return e._result.default;
  throw e._result;
}
var fm =
    typeof reportError == "function"
      ? reportError
      : function (e) {
          if (
            typeof window == "object" &&
            typeof window.ErrorEvent == "function"
          ) {
            var t = new window.ErrorEvent("error", {
              bubbles: !0,
              cancelable: !0,
              message:
                typeof e == "object" &&
                e !== null &&
                typeof e.message == "string"
                  ? String(e.message)
                  : String(e),
              error: e,
            });
            if (!window.dispatchEvent(t)) return;
          } else if (
            typeof process == "object" &&
            typeof process.emit == "function"
          ) {
            process.emit("uncaughtException", e);
            return;
          }
        },
  gw = {
    map: Bi,
    forEach: function (e, t, n) {
      Bi(
        e,
        function () {
          t.apply(this, arguments);
        },
        n,
      );
    },
    count: function (e) {
      var t = 0;
      return (
        Bi(e, function () {
          t++;
        }),
        t
      );
    },
    toArray: function (e) {
      return (
        Bi(e, function (t) {
          return t;
        }) || []
      );
    },
    only: function (e) {
      if (!Mf(e))
        throw Error(
          "React.Children.only expected to receive a single React element child.",
        );
      return e;
    },
  };
Z.Activity = sw;
Z.Children = gw;
Z.Component = Qo;
Z.Fragment = ew;
Z.Profiler = nw;
Z.PureComponent = Af;
Z.StrictMode = tw;
Z.Suspense = iw;
Z.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = Ee;
Z.__COMPILER_RUNTIME = {
  __proto__: null,
  c: function (e) {
    return Ee.H.useMemoCache(e);
  },
};
Z.cache = function (e) {
  return function () {
    return e.apply(null, arguments);
  };
};
Z.cacheSignal = function () {
  return null;
};
Z.cloneElement = function (e, t, n) {
  if (e == null)
    throw Error(
      "The argument must be a React element, but you passed " + e + ".",
    );
  var a = Qh({}, e.props),
    o = e.key;
  if (t != null)
    for (r in (t.key !== void 0 && (o = "" + t.key), t))
      !Wh.call(t, r) ||
        r === "key" ||
        r === "__self" ||
        r === "__source" ||
        (r === "ref" && t.ref === void 0) ||
        (a[r] = t[r]);
  var r = arguments.length - 2;
  if (r === 1) a.children = n;
  else if (1 < r) {
    for (var i = Array(r), l = 0; l < r; l++) i[l] = arguments[l + 2];
    a.children = i;
  }
  return Rf(e.type, o, a);
};
Z.createContext = function (e) {
  return (
    (e = {
      $$typeof: ow,
      _currentValue: e,
      _currentValue2: e,
      _threadCount: 0,
      Provider: null,
      Consumer: null,
    }),
    (e.Provider = e),
    (e.Consumer = { $$typeof: aw, _context: e }),
    e
  );
};
Z.createElement = function (e, t, n) {
  var a,
    o = {},
    r = null;
  if (t != null)
    for (a in (t.key !== void 0 && (r = "" + t.key), t))
      Wh.call(t, a) &&
        a !== "key" &&
        a !== "__self" &&
        a !== "__source" &&
        (o[a] = t[a]);
  var i = arguments.length - 2;
  if (i === 1) o.children = n;
  else if (1 < i) {
    for (var l = Array(i), s = 0; s < i; s++) l[s] = arguments[s + 2];
    o.children = l;
  }
  if (e && e.defaultProps)
    for (a in ((i = e.defaultProps), i)) o[a] === void 0 && (o[a] = i[a]);
  return Rf(e, r, o);
};
Z.createRef = function () {
  return { current: null };
};
Z.forwardRef = function (e) {
  return { $$typeof: rw, render: e };
};
Z.isValidElement = Mf;
Z.lazy = function (e) {
  return { $$typeof: Xh, _payload: { _status: -1, _result: e }, _init: mw };
};
Z.memo = function (e, t) {
  return { $$typeof: lw, type: e, compare: t === void 0 ? null : t };
};
Z.startTransition = function (e) {
  var t = Ee.T,
    n = {};
  Ee.T = n;
  try {
    var a = e(),
      o = Ee.S;
    (o !== null && o(n, a),
      typeof a == "object" &&
        a !== null &&
        typeof a.then == "function" &&
        a.then(uu, fm));
  } catch (r) {
    fm(r);
  } finally {
    (t !== null && n.types !== null && (t.types = n.types), (Ee.T = t));
  }
};
Z.unstable_useCacheRefresh = function () {
  return Ee.H.useCacheRefresh();
};
Z.use = function (e) {
  return Ee.H.use(e);
};
Z.useActionState = function (e, t, n) {
  return Ee.H.useActionState(e, t, n);
};
Z.useCallback = function (e, t) {
  return Ee.H.useCallback(e, t);
};
Z.useContext = function (e) {
  return Ee.H.useContext(e);
};
Z.useDebugValue = function () {};
Z.useDeferredValue = function (e, t) {
  return Ee.H.useDeferredValue(e, t);
};
Z.useEffect = function (e, t) {
  return Ee.H.useEffect(e, t);
};
Z.useEffectEvent = function (e) {
  return Ee.H.useEffectEvent(e);
};
Z.useId = function () {
  return Ee.H.useId();
};
Z.useImperativeHandle = function (e, t, n) {
  return Ee.H.useImperativeHandle(e, t, n);
};
Z.useInsertionEffect = function (e, t) {
  return Ee.H.useInsertionEffect(e, t);
};
Z.useLayoutEffect = function (e, t) {
  return Ee.H.useLayoutEffect(e, t);
};
Z.useMemo = function (e, t) {
  return Ee.H.useMemo(e, t);
};
Z.useOptimistic = function (e, t) {
  return Ee.H.useOptimistic(e, t);
};
Z.useReducer = function (e, t, n) {
  return Ee.H.useReducer(e, t, n);
};
Z.useRef = function (e) {
  return Ee.H.useRef(e);
};
Z.useState = function (e) {
  return Ee.H.useState(e);
};
Z.useSyncExternalStore = function (e, t, n) {
  return Ee.H.useSyncExternalStore(e, t, n);
};
Z.useTransition = function () {
  return Ee.H.useTransition();
};
Z.version = "19.2.3";
qh.exports = Z;
var p = qh.exports;
const L = Ef(p),
  Df = QS({ __proto__: null, default: L }, [p]);
var ep = { exports: {} },
  Ts = {},
  tp = { exports: {} },
  np = {};
/**
 * @license React
 * scheduler.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ (function (e) {
  function t(M, _) {
    var T = M.length;
    M.push(_);
    e: for (; 0 < T; ) {
      var D = (T - 1) >>> 1,
        j = M[D];
      if (0 < o(j, _)) ((M[D] = _), (M[T] = j), (T = D));
      else break e;
    }
  }
  function n(M) {
    return M.length === 0 ? null : M[0];
  }
  function a(M) {
    if (M.length === 0) return null;
    var _ = M[0],
      T = M.pop();
    if (T !== _) {
      M[0] = T;
      e: for (var D = 0, j = M.length, q = j >>> 1; D < q; ) {
        var le = 2 * (D + 1) - 1,
          U = M[le],
          I = le + 1,
          X = M[I];
        if (0 > o(U, T))
          I < j && 0 > o(X, U)
            ? ((M[D] = X), (M[I] = T), (D = I))
            : ((M[D] = U), (M[le] = T), (D = le));
        else if (I < j && 0 > o(X, T)) ((M[D] = X), (M[I] = T), (D = I));
        else break e;
      }
    }
    return _;
  }
  function o(M, _) {
    var T = M.sortIndex - _.sortIndex;
    return T !== 0 ? T : M.id - _.id;
  }
  if (
    ((e.unstable_now = void 0),
    typeof performance == "object" && typeof performance.now == "function")
  ) {
    var r = performance;
    e.unstable_now = function () {
      return r.now();
    };
  } else {
    var i = Date,
      l = i.now();
    e.unstable_now = function () {
      return i.now() - l;
    };
  }
  var s = [],
    c = [],
    f = 1,
    u = null,
    d = 3,
    g = !1,
    S = !1,
    v = !1,
    b = !1,
    m = typeof setTimeout == "function" ? setTimeout : null,
    h = typeof clearTimeout == "function" ? clearTimeout : null,
    y = typeof setImmediate < "u" ? setImmediate : null;
  function w(M) {
    for (var _ = n(c); _ !== null; ) {
      if (_.callback === null) a(c);
      else if (_.startTime <= M)
        (a(c), (_.sortIndex = _.expirationTime), t(s, _));
      else break;
      _ = n(c);
    }
  }
  function C(M) {
    if (((v = !1), w(M), !S))
      if (n(s) !== null) ((S = !0), R || ((R = !0), z()));
      else {
        var _ = n(c);
        _ !== null && Y(C, _.startTime - M);
      }
  }
  var R = !1,
    E = -1,
    A = 5,
    O = -1;
  function N() {
    return b ? !0 : !(e.unstable_now() - O < A);
  }
  function B() {
    if (((b = !1), R)) {
      var M = e.unstable_now();
      O = M;
      var _ = !0;
      try {
        e: {
          ((S = !1), v && ((v = !1), h(E), (E = -1)), (g = !0));
          var T = d;
          try {
            t: {
              for (
                w(M), u = n(s);
                u !== null && !(u.expirationTime > M && N());
              ) {
                var D = u.callback;
                if (typeof D == "function") {
                  ((u.callback = null), (d = u.priorityLevel));
                  var j = D(u.expirationTime <= M);
                  if (((M = e.unstable_now()), typeof j == "function")) {
                    ((u.callback = j), w(M), (_ = !0));
                    break t;
                  }
                  (u === n(s) && a(s), w(M));
                } else a(s);
                u = n(s);
              }
              if (u !== null) _ = !0;
              else {
                var q = n(c);
                (q !== null && Y(C, q.startTime - M), (_ = !1));
              }
            }
            break e;
          } finally {
            ((u = null), (d = T), (g = !1));
          }
          _ = void 0;
        }
      } finally {
        _ ? z() : (R = !1);
      }
    }
  }
  var z;
  if (typeof y == "function")
    z = function () {
      y(B);
    };
  else if (typeof MessageChannel < "u") {
    var G = new MessageChannel(),
      V = G.port2;
    ((G.port1.onmessage = B),
      (z = function () {
        V.postMessage(null);
      }));
  } else
    z = function () {
      m(B, 0);
    };
  function Y(M, _) {
    E = m(function () {
      M(e.unstable_now());
    }, _);
  }
  ((e.unstable_IdlePriority = 5),
    (e.unstable_ImmediatePriority = 1),
    (e.unstable_LowPriority = 4),
    (e.unstable_NormalPriority = 3),
    (e.unstable_Profiling = null),
    (e.unstable_UserBlockingPriority = 2),
    (e.unstable_cancelCallback = function (M) {
      M.callback = null;
    }),
    (e.unstable_forceFrameRate = function (M) {
      0 > M || 125 < M || (A = 0 < M ? Math.floor(1e3 / M) : 5);
    }),
    (e.unstable_getCurrentPriorityLevel = function () {
      return d;
    }),
    (e.unstable_next = function (M) {
      switch (d) {
        case 1:
        case 2:
        case 3:
          var _ = 3;
          break;
        default:
          _ = d;
      }
      var T = d;
      d = _;
      try {
        return M();
      } finally {
        d = T;
      }
    }),
    (e.unstable_requestPaint = function () {
      b = !0;
    }),
    (e.unstable_runWithPriority = function (M, _) {
      switch (M) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          M = 3;
      }
      var T = d;
      d = M;
      try {
        return _();
      } finally {
        d = T;
      }
    }),
    (e.unstable_scheduleCallback = function (M, _, T) {
      var D = e.unstable_now();
      switch (
        (typeof T == "object" && T !== null
          ? ((T = T.delay), (T = typeof T == "number" && 0 < T ? D + T : D))
          : (T = D),
        M)
      ) {
        case 1:
          var j = -1;
          break;
        case 2:
          j = 250;
          break;
        case 5:
          j = 1073741823;
          break;
        case 4:
          j = 1e4;
          break;
        default:
          j = 5e3;
      }
      return (
        (j = T + j),
        (M = {
          id: f++,
          callback: _,
          priorityLevel: M,
          startTime: T,
          expirationTime: j,
          sortIndex: -1,
        }),
        T > D
          ? ((M.sortIndex = T),
            t(c, M),
            n(s) === null &&
              M === n(c) &&
              (v ? (h(E), (E = -1)) : (v = !0), Y(C, T - D)))
          : ((M.sortIndex = j),
            t(s, M),
            S || g || ((S = !0), R || ((R = !0), z()))),
        M
      );
    }),
    (e.unstable_shouldYield = N),
    (e.unstable_wrapCallback = function (M) {
      var _ = d;
      return function () {
        var T = d;
        d = _;
        try {
          return M.apply(this, arguments);
        } finally {
          d = T;
        }
      };
    }));
})(np);
tp.exports = np;
var hw = tp.exports,
  ap = { exports: {} },
  lt = {};
/**
 * @license React
 * react-dom.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var pw = p;
function op(e) {
  var t = "https://react.dev/errors/" + e;
  if (1 < arguments.length) {
    t += "?args[]=" + encodeURIComponent(arguments[1]);
    for (var n = 2; n < arguments.length; n++)
      t += "&args[]=" + encodeURIComponent(arguments[n]);
  }
  return (
    "Minified React error #" +
    e +
    "; visit " +
    t +
    " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
  );
}
function In() {}
var it = {
    d: {
      f: In,
      r: function () {
        throw Error(op(522));
      },
      D: In,
      C: In,
      L: In,
      m: In,
      X: In,
      S: In,
      M: In,
    },
    p: 0,
    findDOMNode: null,
  },
  vw = Symbol.for("react.portal");
function yw(e, t, n) {
  var a = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
  return {
    $$typeof: vw,
    key: a == null ? null : "" + a,
    children: e,
    containerInfo: t,
    implementation: n,
  };
}
var Dr = pw.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
function Rs(e, t) {
  if (e === "font") return "";
  if (typeof t == "string") return t === "use-credentials" ? t : "";
}
lt.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = it;
lt.createPortal = function (e, t) {
  var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
  if (!t || (t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11))
    throw Error(op(299));
  return yw(e, t, null, n);
};
lt.flushSync = function (e) {
  var t = Dr.T,
    n = it.p;
  try {
    if (((Dr.T = null), (it.p = 2), e)) return e();
  } finally {
    ((Dr.T = t), (it.p = n), it.d.f());
  }
};
lt.preconnect = function (e, t) {
  typeof e == "string" &&
    (t
      ? ((t = t.crossOrigin),
        (t =
          typeof t == "string" ? (t === "use-credentials" ? t : "") : void 0))
      : (t = null),
    it.d.C(e, t));
};
lt.prefetchDNS = function (e) {
  typeof e == "string" && it.d.D(e);
};
lt.preinit = function (e, t) {
  if (typeof e == "string" && t && typeof t.as == "string") {
    var n = t.as,
      a = Rs(n, t.crossOrigin),
      o = typeof t.integrity == "string" ? t.integrity : void 0,
      r = typeof t.fetchPriority == "string" ? t.fetchPriority : void 0;
    n === "style"
      ? it.d.S(e, typeof t.precedence == "string" ? t.precedence : void 0, {
          crossOrigin: a,
          integrity: o,
          fetchPriority: r,
        })
      : n === "script" &&
        it.d.X(e, {
          crossOrigin: a,
          integrity: o,
          fetchPriority: r,
          nonce: typeof t.nonce == "string" ? t.nonce : void 0,
        });
  }
};
lt.preinitModule = function (e, t) {
  if (typeof e == "string")
    if (typeof t == "object" && t !== null) {
      if (t.as == null || t.as === "script") {
        var n = Rs(t.as, t.crossOrigin);
        it.d.M(e, {
          crossOrigin: n,
          integrity: typeof t.integrity == "string" ? t.integrity : void 0,
          nonce: typeof t.nonce == "string" ? t.nonce : void 0,
        });
      }
    } else t == null && it.d.M(e);
};
lt.preload = function (e, t) {
  if (
    typeof e == "string" &&
    typeof t == "object" &&
    t !== null &&
    typeof t.as == "string"
  ) {
    var n = t.as,
      a = Rs(n, t.crossOrigin);
    it.d.L(e, n, {
      crossOrigin: a,
      integrity: typeof t.integrity == "string" ? t.integrity : void 0,
      nonce: typeof t.nonce == "string" ? t.nonce : void 0,
      type: typeof t.type == "string" ? t.type : void 0,
      fetchPriority:
        typeof t.fetchPriority == "string" ? t.fetchPriority : void 0,
      referrerPolicy:
        typeof t.referrerPolicy == "string" ? t.referrerPolicy : void 0,
      imageSrcSet: typeof t.imageSrcSet == "string" ? t.imageSrcSet : void 0,
      imageSizes: typeof t.imageSizes == "string" ? t.imageSizes : void 0,
      media: typeof t.media == "string" ? t.media : void 0,
    });
  }
};
lt.preloadModule = function (e, t) {
  if (typeof e == "string")
    if (t) {
      var n = Rs(t.as, t.crossOrigin);
      it.d.m(e, {
        as: typeof t.as == "string" && t.as !== "script" ? t.as : void 0,
        crossOrigin: n,
        integrity: typeof t.integrity == "string" ? t.integrity : void 0,
      });
    } else it.d.m(e);
};
lt.requestFormReset = function (e) {
  it.d.r(e);
};
lt.unstable_batchedUpdates = function (e, t) {
  return e(t);
};
lt.useFormState = function (e, t, n) {
  return Dr.H.useFormState(e, t, n);
};
lt.useFormStatus = function () {
  return Dr.H.useHostTransitionStatus();
};
lt.version = "19.2.3";
function rp() {
  if (
    !(
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" ||
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"
    )
  )
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(rp);
    } catch {}
}
(rp(), (ap.exports = lt));
var Ms = ap.exports;
const ip = Ef(Ms);
/**
 * @license React
 * react-dom-client.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Pe = hw,
  lp = p,
  bw = Ms;
function k(e) {
  var t = "https://react.dev/errors/" + e;
  if (1 < arguments.length) {
    t += "?args[]=" + encodeURIComponent(arguments[1]);
    for (var n = 2; n < arguments.length; n++)
      t += "&args[]=" + encodeURIComponent(arguments[n]);
  }
  return (
    "Minified React error #" +
    e +
    "; visit " +
    t +
    " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
  );
}
function sp(e) {
  return !(!e || (e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11));
}
function gi(e) {
  var t = e,
    n = e;
  if (e.alternate) for (; t.return; ) t = t.return;
  else {
    e = t;
    do ((t = e), t.flags & 4098 && (n = t.return), (e = t.return));
    while (e);
  }
  return t.tag === 3 ? n : null;
}
function cp(e) {
  if (e.tag === 13) {
    var t = e.memoizedState;
    if (
      (t === null && ((e = e.alternate), e !== null && (t = e.memoizedState)),
      t !== null)
    )
      return t.dehydrated;
  }
  return null;
}
function up(e) {
  if (e.tag === 31) {
    var t = e.memoizedState;
    if (
      (t === null && ((e = e.alternate), e !== null && (t = e.memoizedState)),
      t !== null)
    )
      return t.dehydrated;
  }
  return null;
}
function dm(e) {
  if (gi(e) !== e) throw Error(k(188));
}
function Sw(e) {
  var t = e.alternate;
  if (!t) {
    if (((t = gi(e)), t === null)) throw Error(k(188));
    return t !== e ? null : e;
  }
  for (var n = e, a = t; ; ) {
    var o = n.return;
    if (o === null) break;
    var r = o.alternate;
    if (r === null) {
      if (((a = o.return), a !== null)) {
        n = a;
        continue;
      }
      break;
    }
    if (o.child === r.child) {
      for (r = o.child; r; ) {
        if (r === n) return (dm(o), e);
        if (r === a) return (dm(o), t);
        r = r.sibling;
      }
      throw Error(k(188));
    }
    if (n.return !== a.return) ((n = o), (a = r));
    else {
      for (var i = !1, l = o.child; l; ) {
        if (l === n) {
          ((i = !0), (n = o), (a = r));
          break;
        }
        if (l === a) {
          ((i = !0), (a = o), (n = r));
          break;
        }
        l = l.sibling;
      }
      if (!i) {
        for (l = r.child; l; ) {
          if (l === n) {
            ((i = !0), (n = r), (a = o));
            break;
          }
          if (l === a) {
            ((i = !0), (a = r), (n = o));
            break;
          }
          l = l.sibling;
        }
        if (!i) throw Error(k(189));
      }
    }
    if (n.alternate !== a) throw Error(k(190));
  }
  if (n.tag !== 3) throw Error(k(188));
  return n.stateNode.current === n ? e : t;
}
function fp(e) {
  var t = e.tag;
  if (t === 5 || t === 26 || t === 27 || t === 6) return e;
  for (e = e.child; e !== null; ) {
    if (((t = fp(e)), t !== null)) return t;
    e = e.sibling;
  }
  return null;
}
var Ce = Object.assign,
  ww = Symbol.for("react.element"),
  Ui = Symbol.for("react.transitional.element"),
  Er = Symbol.for("react.portal"),
  ho = Symbol.for("react.fragment"),
  dp = Symbol.for("react.strict_mode"),
  fu = Symbol.for("react.profiler"),
  mp = Symbol.for("react.consumer"),
  Tn = Symbol.for("react.context"),
  Of = Symbol.for("react.forward_ref"),
  du = Symbol.for("react.suspense"),
  mu = Symbol.for("react.suspense_list"),
  kf = Symbol.for("react.memo"),
  Kn = Symbol.for("react.lazy"),
  gu = Symbol.for("react.activity"),
  xw = Symbol.for("react.memo_cache_sentinel"),
  mm = Symbol.iterator;
function cr(e) {
  return e === null || typeof e != "object"
    ? null
    : ((e = (mm && e[mm]) || e["@@iterator"]),
      typeof e == "function" ? e : null);
}
var Ew = Symbol.for("react.client.reference");
function hu(e) {
  if (e == null) return null;
  if (typeof e == "function")
    return e.$$typeof === Ew ? null : e.displayName || e.name || null;
  if (typeof e == "string") return e;
  switch (e) {
    case ho:
      return "Fragment";
    case fu:
      return "Profiler";
    case dp:
      return "StrictMode";
    case du:
      return "Suspense";
    case mu:
      return "SuspenseList";
    case gu:
      return "Activity";
  }
  if (typeof e == "object")
    switch (e.$$typeof) {
      case Er:
        return "Portal";
      case Tn:
        return e.displayName || "Context";
      case mp:
        return (e._context.displayName || "Context") + ".Consumer";
      case Of:
        var t = e.render;
        return (
          (e = e.displayName),
          e ||
            ((e = t.displayName || t.name || ""),
            (e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef")),
          e
        );
      case kf:
        return (
          (t = e.displayName || null),
          t !== null ? t : hu(e.type) || "Memo"
        );
      case Kn:
        ((t = e._payload), (e = e._init));
        try {
          return hu(e(t));
        } catch {}
    }
  return null;
}
var Cr = Array.isArray,
  K = lp.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
  ue = bw.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
  Na = { pending: !1, data: null, method: null, action: null },
  pu = [],
  po = -1;
function mn(e) {
  return { current: e };
}
function Fe(e) {
  0 > po || ((e.current = pu[po]), (pu[po] = null), po--);
}
function Se(e, t) {
  (po++, (pu[po] = e.current), (e.current = t));
}
var un = mn(null),
  Kr = mn(null),
  aa = mn(null),
  Ll = mn(null);
function zl(e, t) {
  switch ((Se(aa, t), Se(Kr, e), Se(un, null), t.nodeType)) {
    case 9:
    case 11:
      e = (e = t.documentElement) && (e = e.namespaceURI) ? bg(e) : 0;
      break;
    default:
      if (((e = t.tagName), (t = t.namespaceURI)))
        ((t = bg(t)), (e = _y(t, e)));
      else
        switch (e) {
          case "svg":
            e = 1;
            break;
          case "math":
            e = 2;
            break;
          default:
            e = 0;
        }
  }
  (Fe(un), Se(un, e));
}
function jo() {
  (Fe(un), Fe(Kr), Fe(aa));
}
function vu(e) {
  e.memoizedState !== null && Se(Ll, e);
  var t = un.current,
    n = _y(t, e.type);
  t !== n && (Se(Kr, e), Se(un, n));
}
function jl(e) {
  (Kr.current === e && (Fe(un), Fe(Kr)),
    Ll.current === e && (Fe(Ll), (ai._currentValue = Na)));
}
var mc, gm;
function Ra(e) {
  if (mc === void 0)
    try {
      throw Error();
    } catch (n) {
      var t = n.stack.trim().match(/\n( *(at )?)/);
      ((mc = (t && t[1]) || ""),
        (gm =
          -1 <
          n.stack.indexOf(`
    at`)
            ? " (<anonymous>)"
            : -1 < n.stack.indexOf("@")
              ? "@unknown:0:0"
              : ""));
    }
  return (
    `
` +
    mc +
    e +
    gm
  );
}
var gc = !1;
function hc(e, t) {
  if (!e || gc) return "";
  gc = !0;
  var n = Error.prepareStackTrace;
  Error.prepareStackTrace = void 0;
  try {
    var a = {
      DetermineComponentFrameRoot: function () {
        try {
          if (t) {
            var u = function () {
              throw Error();
            };
            if (
              (Object.defineProperty(u.prototype, "props", {
                set: function () {
                  throw Error();
                },
              }),
              typeof Reflect == "object" && Reflect.construct)
            ) {
              try {
                Reflect.construct(u, []);
              } catch (g) {
                var d = g;
              }
              Reflect.construct(e, [], u);
            } else {
              try {
                u.call();
              } catch (g) {
                d = g;
              }
              e.call(u.prototype);
            }
          } else {
            try {
              throw Error();
            } catch (g) {
              d = g;
            }
            (u = e()) &&
              typeof u.catch == "function" &&
              u.catch(function () {});
          }
        } catch (g) {
          if (g && d && typeof g.stack == "string") return [g.stack, d.stack];
        }
        return [null, null];
      },
    };
    a.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
    var o = Object.getOwnPropertyDescriptor(
      a.DetermineComponentFrameRoot,
      "name",
    );
    o &&
      o.configurable &&
      Object.defineProperty(a.DetermineComponentFrameRoot, "name", {
        value: "DetermineComponentFrameRoot",
      });
    var r = a.DetermineComponentFrameRoot(),
      i = r[0],
      l = r[1];
    if (i && l) {
      var s = i.split(`
`),
        c = l.split(`
`);
      for (
        o = a = 0;
        a < s.length && !s[a].includes("DetermineComponentFrameRoot");
      )
        a++;
      for (; o < c.length && !c[o].includes("DetermineComponentFrameRoot"); )
        o++;
      if (a === s.length || o === c.length)
        for (
          a = s.length - 1, o = c.length - 1;
          1 <= a && 0 <= o && s[a] !== c[o];
        )
          o--;
      for (; 1 <= a && 0 <= o; a--, o--)
        if (s[a] !== c[o]) {
          if (a !== 1 || o !== 1)
            do
              if ((a--, o--, 0 > o || s[a] !== c[o])) {
                var f =
                  `
` + s[a].replace(" at new ", " at ");
                return (
                  e.displayName &&
                    f.includes("<anonymous>") &&
                    (f = f.replace("<anonymous>", e.displayName)),
                  f
                );
              }
            while (1 <= a && 0 <= o);
          break;
        }
    }
  } finally {
    ((gc = !1), (Error.prepareStackTrace = n));
  }
  return (n = e ? e.displayName || e.name : "") ? Ra(n) : "";
}
function Cw(e, t) {
  switch (e.tag) {
    case 26:
    case 27:
    case 5:
      return Ra(e.type);
    case 16:
      return Ra("Lazy");
    case 13:
      return e.child !== t && t !== null
        ? Ra("Suspense Fallback")
        : Ra("Suspense");
    case 19:
      return Ra("SuspenseList");
    case 0:
    case 15:
      return hc(e.type, !1);
    case 11:
      return hc(e.type.render, !1);
    case 1:
      return hc(e.type, !0);
    case 31:
      return Ra("Activity");
    default:
      return "";
  }
}
function hm(e) {
  try {
    var t = "",
      n = null;
    do ((t += Cw(e, n)), (n = e), (e = e.return));
    while (e);
    return t;
  } catch (a) {
    return (
      `
Error generating stack: ` +
      a.message +
      `
` +
      a.stack
    );
  }
}
var yu = Object.prototype.hasOwnProperty,
  Nf = Pe.unstable_scheduleCallback,
  pc = Pe.unstable_cancelCallback,
  Aw = Pe.unstable_shouldYield,
  Tw = Pe.unstable_requestPaint,
  Rt = Pe.unstable_now,
  Rw = Pe.unstable_getCurrentPriorityLevel,
  gp = Pe.unstable_ImmediatePriority,
  hp = Pe.unstable_UserBlockingPriority,
  Bl = Pe.unstable_NormalPriority,
  Mw = Pe.unstable_LowPriority,
  pp = Pe.unstable_IdlePriority,
  Dw = Pe.log,
  Ow = Pe.unstable_setDisableYieldValue,
  hi = null,
  Mt = null;
function Jn(e) {
  if (
    (typeof Dw == "function" && Ow(e),
    Mt && typeof Mt.setStrictMode == "function")
  )
    try {
      Mt.setStrictMode(hi, e);
    } catch {}
}
var Dt = Math.clz32 ? Math.clz32 : _w,
  kw = Math.log,
  Nw = Math.LN2;
function _w(e) {
  return ((e >>>= 0), e === 0 ? 32 : (31 - ((kw(e) / Nw) | 0)) | 0);
}
var Hi = 256,
  Pi = 262144,
  Vi = 4194304;
function Ma(e) {
  var t = e & 42;
  if (t !== 0) return t;
  switch (e & -e) {
    case 1:
      return 1;
    case 2:
      return 2;
    case 4:
      return 4;
    case 8:
      return 8;
    case 16:
      return 16;
    case 32:
      return 32;
    case 64:
      return 64;
    case 128:
      return 128;
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
      return e & 261888;
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return e & 3932160;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
      return e & 62914560;
    case 67108864:
      return 67108864;
    case 134217728:
      return 134217728;
    case 268435456:
      return 268435456;
    case 536870912:
      return 536870912;
    case 1073741824:
      return 0;
    default:
      return e;
  }
}
function Ds(e, t, n) {
  var a = e.pendingLanes;
  if (a === 0) return 0;
  var o = 0,
    r = e.suspendedLanes,
    i = e.pingedLanes;
  e = e.warmLanes;
  var l = a & 134217727;
  return (
    l !== 0
      ? ((a = l & ~r),
        a !== 0
          ? (o = Ma(a))
          : ((i &= l),
            i !== 0
              ? (o = Ma(i))
              : n || ((n = l & ~e), n !== 0 && (o = Ma(n)))))
      : ((l = a & ~r),
        l !== 0
          ? (o = Ma(l))
          : i !== 0
            ? (o = Ma(i))
            : n || ((n = a & ~e), n !== 0 && (o = Ma(n)))),
    o === 0
      ? 0
      : t !== 0 &&
          t !== o &&
          !(t & r) &&
          ((r = o & -o),
          (n = t & -t),
          r >= n || (r === 32 && (n & 4194048) !== 0))
        ? t
        : o
  );
}
function pi(e, t) {
  return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0;
}
function Lw(e, t) {
  switch (e) {
    case 1:
    case 2:
    case 4:
    case 8:
    case 64:
      return t + 250;
    case 16:
    case 32:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return t + 5e3;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
      return -1;
    case 67108864:
    case 134217728:
    case 268435456:
    case 536870912:
    case 1073741824:
      return -1;
    default:
      return -1;
  }
}
function vp() {
  var e = Vi;
  return ((Vi <<= 1), !(Vi & 62914560) && (Vi = 4194304), e);
}
function vc(e) {
  for (var t = [], n = 0; 31 > n; n++) t.push(e);
  return t;
}
function vi(e, t) {
  ((e.pendingLanes |= t),
    t !== 268435456 &&
      ((e.suspendedLanes = 0), (e.pingedLanes = 0), (e.warmLanes = 0)));
}
function zw(e, t, n, a, o, r) {
  var i = e.pendingLanes;
  ((e.pendingLanes = n),
    (e.suspendedLanes = 0),
    (e.pingedLanes = 0),
    (e.warmLanes = 0),
    (e.expiredLanes &= n),
    (e.entangledLanes &= n),
    (e.errorRecoveryDisabledLanes &= n),
    (e.shellSuspendCounter = 0));
  var l = e.entanglements,
    s = e.expirationTimes,
    c = e.hiddenUpdates;
  for (n = i & ~n; 0 < n; ) {
    var f = 31 - Dt(n),
      u = 1 << f;
    ((l[f] = 0), (s[f] = -1));
    var d = c[f];
    if (d !== null)
      for (c[f] = null, f = 0; f < d.length; f++) {
        var g = d[f];
        g !== null && (g.lane &= -536870913);
      }
    n &= ~u;
  }
  (a !== 0 && yp(e, a, 0),
    r !== 0 && o === 0 && e.tag !== 0 && (e.suspendedLanes |= r & ~(i & ~t)));
}
function yp(e, t, n) {
  ((e.pendingLanes |= t), (e.suspendedLanes &= ~t));
  var a = 31 - Dt(t);
  ((e.entangledLanes |= t),
    (e.entanglements[a] = e.entanglements[a] | 1073741824 | (n & 261930)));
}
function bp(e, t) {
  var n = (e.entangledLanes |= t);
  for (e = e.entanglements; n; ) {
    var a = 31 - Dt(n),
      o = 1 << a;
    ((o & t) | (e[a] & t) && (e[a] |= t), (n &= ~o));
  }
}
function Sp(e, t) {
  var n = t & -t;
  return ((n = n & 42 ? 1 : _f(n)), n & (e.suspendedLanes | t) ? 0 : n);
}
function _f(e) {
  switch (e) {
    case 2:
      e = 1;
      break;
    case 8:
      e = 4;
      break;
    case 32:
      e = 16;
      break;
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
      e = 128;
      break;
    case 268435456:
      e = 134217728;
      break;
    default:
      e = 0;
  }
  return e;
}
function Lf(e) {
  return (
    (e &= -e),
    2 < e ? (8 < e ? (e & 134217727 ? 32 : 268435456) : 8) : 2
  );
}
function wp() {
  var e = ue.p;
  return e !== 0 ? e : ((e = window.event), e === void 0 ? 32 : Yy(e.type));
}
function pm(e, t) {
  var n = ue.p;
  try {
    return ((ue.p = e), t());
  } finally {
    ue.p = n;
  }
}
var ba = Math.random().toString(36).slice(2),
  Ze = "__reactFiber$" + ba,
  vt = "__reactProps$" + ba,
  Zo = "__reactContainer$" + ba,
  bu = "__reactEvents$" + ba,
  jw = "__reactListeners$" + ba,
  Bw = "__reactHandles$" + ba,
  vm = "__reactResources$" + ba,
  yi = "__reactMarker$" + ba;
function zf(e) {
  (delete e[Ze], delete e[vt], delete e[bu], delete e[jw], delete e[Bw]);
}
function vo(e) {
  var t = e[Ze];
  if (t) return t;
  for (var n = e.parentNode; n; ) {
    if ((t = n[Zo] || n[Ze])) {
      if (
        ((n = t.alternate),
        t.child !== null || (n !== null && n.child !== null))
      )
        for (e = Cg(e); e !== null; ) {
          if ((n = e[Ze])) return n;
          e = Cg(e);
        }
      return t;
    }
    ((e = n), (n = e.parentNode));
  }
  return null;
}
function Jo(e) {
  if ((e = e[Ze] || e[Zo])) {
    var t = e.tag;
    if (
      t === 5 ||
      t === 6 ||
      t === 13 ||
      t === 31 ||
      t === 26 ||
      t === 27 ||
      t === 3
    )
      return e;
  }
  return null;
}
function Ar(e) {
  var t = e.tag;
  if (t === 5 || t === 26 || t === 27 || t === 6) return e.stateNode;
  throw Error(k(33));
}
function Ro(e) {
  var t = e[vm];
  return (
    t ||
      (t = e[vm] = { hoistableStyles: new Map(), hoistableScripts: new Map() }),
    t
  );
}
function Ye(e) {
  e[yi] = !0;
}
var xp = new Set(),
  Ep = {};
function Fa(e, t) {
  (Bo(e, t), Bo(e + "Capture", t));
}
function Bo(e, t) {
  for (Ep[e] = t, e = 0; e < t.length; e++) xp.add(t[e]);
}
var Uw = RegExp(
    "^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$",
  ),
  ym = {},
  bm = {};
function Hw(e) {
  return yu.call(bm, e)
    ? !0
    : yu.call(ym, e)
      ? !1
      : Uw.test(e)
        ? (bm[e] = !0)
        : ((ym[e] = !0), !1);
}
function dl(e, t, n) {
  if (Hw(t))
    if (n === null) e.removeAttribute(t);
    else {
      switch (typeof n) {
        case "undefined":
        case "function":
        case "symbol":
          e.removeAttribute(t);
          return;
        case "boolean":
          var a = t.toLowerCase().slice(0, 5);
          if (a !== "data-" && a !== "aria-") {
            e.removeAttribute(t);
            return;
          }
      }
      e.setAttribute(t, "" + n);
    }
}
function Ii(e, t, n) {
  if (n === null) e.removeAttribute(t);
  else {
    switch (typeof n) {
      case "undefined":
      case "function":
      case "symbol":
      case "boolean":
        e.removeAttribute(t);
        return;
    }
    e.setAttribute(t, "" + n);
  }
}
function vn(e, t, n, a) {
  if (a === null) e.removeAttribute(n);
  else {
    switch (typeof a) {
      case "undefined":
      case "function":
      case "symbol":
      case "boolean":
        e.removeAttribute(n);
        return;
    }
    e.setAttributeNS(t, n, "" + a);
  }
}
function Bt(e) {
  switch (typeof e) {
    case "bigint":
    case "boolean":
    case "number":
    case "string":
    case "undefined":
      return e;
    case "object":
      return e;
    default:
      return "";
  }
}
function Cp(e) {
  var t = e.type;
  return (
    (e = e.nodeName) &&
    e.toLowerCase() === "input" &&
    (t === "checkbox" || t === "radio")
  );
}
function Pw(e, t, n) {
  var a = Object.getOwnPropertyDescriptor(e.constructor.prototype, t);
  if (
    !e.hasOwnProperty(t) &&
    typeof a < "u" &&
    typeof a.get == "function" &&
    typeof a.set == "function"
  ) {
    var o = a.get,
      r = a.set;
    return (
      Object.defineProperty(e, t, {
        configurable: !0,
        get: function () {
          return o.call(this);
        },
        set: function (i) {
          ((n = "" + i), r.call(this, i));
        },
      }),
      Object.defineProperty(e, t, { enumerable: a.enumerable }),
      {
        getValue: function () {
          return n;
        },
        setValue: function (i) {
          n = "" + i;
        },
        stopTracking: function () {
          ((e._valueTracker = null), delete e[t]);
        },
      }
    );
  }
}
function Su(e) {
  if (!e._valueTracker) {
    var t = Cp(e) ? "checked" : "value";
    e._valueTracker = Pw(e, t, "" + e[t]);
  }
}
function Ap(e) {
  if (!e) return !1;
  var t = e._valueTracker;
  if (!t) return !0;
  var n = t.getValue(),
    a = "";
  return (
    e && (a = Cp(e) ? (e.checked ? "true" : "false") : e.value),
    (e = a),
    e !== n ? (t.setValue(e), !0) : !1
  );
}
function Ul(e) {
  if (((e = e || (typeof document < "u" ? document : void 0)), typeof e > "u"))
    return null;
  try {
    return e.activeElement || e.body;
  } catch {
    return e.body;
  }
}
var Vw = /[\n"\\]/g;
function Pt(e) {
  return e.replace(Vw, function (t) {
    return "\\" + t.charCodeAt(0).toString(16) + " ";
  });
}
function wu(e, t, n, a, o, r, i, l) {
  ((e.name = ""),
    i != null &&
    typeof i != "function" &&
    typeof i != "symbol" &&
    typeof i != "boolean"
      ? (e.type = i)
      : e.removeAttribute("type"),
    t != null
      ? i === "number"
        ? ((t === 0 && e.value === "") || e.value != t) &&
          (e.value = "" + Bt(t))
        : e.value !== "" + Bt(t) && (e.value = "" + Bt(t))
      : (i !== "submit" && i !== "reset") || e.removeAttribute("value"),
    t != null
      ? xu(e, i, Bt(t))
      : n != null
        ? xu(e, i, Bt(n))
        : a != null && e.removeAttribute("value"),
    o == null && r != null && (e.defaultChecked = !!r),
    o != null &&
      (e.checked = o && typeof o != "function" && typeof o != "symbol"),
    l != null &&
    typeof l != "function" &&
    typeof l != "symbol" &&
    typeof l != "boolean"
      ? (e.name = "" + Bt(l))
      : e.removeAttribute("name"));
}
function Tp(e, t, n, a, o, r, i, l) {
  if (
    (r != null &&
      typeof r != "function" &&
      typeof r != "symbol" &&
      typeof r != "boolean" &&
      (e.type = r),
    t != null || n != null)
  ) {
    if (!((r !== "submit" && r !== "reset") || t != null)) {
      Su(e);
      return;
    }
    ((n = n != null ? "" + Bt(n) : ""),
      (t = t != null ? "" + Bt(t) : n),
      l || t === e.value || (e.value = t),
      (e.defaultValue = t));
  }
  ((a = a ?? o),
    (a = typeof a != "function" && typeof a != "symbol" && !!a),
    (e.checked = l ? e.checked : !!a),
    (e.defaultChecked = !!a),
    i != null &&
      typeof i != "function" &&
      typeof i != "symbol" &&
      typeof i != "boolean" &&
      (e.name = i),
    Su(e));
}
function xu(e, t, n) {
  (t === "number" && Ul(e.ownerDocument) === e) ||
    e.defaultValue === "" + n ||
    (e.defaultValue = "" + n);
}
function Mo(e, t, n, a) {
  if (((e = e.options), t)) {
    t = {};
    for (var o = 0; o < n.length; o++) t["$" + n[o]] = !0;
    for (n = 0; n < e.length; n++)
      ((o = t.hasOwnProperty("$" + e[n].value)),
        e[n].selected !== o && (e[n].selected = o),
        o && a && (e[n].defaultSelected = !0));
  } else {
    for (n = "" + Bt(n), t = null, o = 0; o < e.length; o++) {
      if (e[o].value === n) {
        ((e[o].selected = !0), a && (e[o].defaultSelected = !0));
        return;
      }
      t !== null || e[o].disabled || (t = e[o]);
    }
    t !== null && (t.selected = !0);
  }
}
function Rp(e, t, n) {
  if (
    t != null &&
    ((t = "" + Bt(t)), t !== e.value && (e.value = t), n == null)
  ) {
    e.defaultValue !== t && (e.defaultValue = t);
    return;
  }
  e.defaultValue = n != null ? "" + Bt(n) : "";
}
function Mp(e, t, n, a) {
  if (t == null) {
    if (a != null) {
      if (n != null) throw Error(k(92));
      if (Cr(a)) {
        if (1 < a.length) throw Error(k(93));
        a = a[0];
      }
      n = a;
    }
    (n == null && (n = ""), (t = n));
  }
  ((n = Bt(t)),
    (e.defaultValue = n),
    (a = e.textContent),
    a === n && a !== "" && a !== null && (e.value = a),
    Su(e));
}
function Uo(e, t) {
  if (t) {
    var n = e.firstChild;
    if (n && n === e.lastChild && n.nodeType === 3) {
      n.nodeValue = t;
      return;
    }
  }
  e.textContent = t;
}
var Iw = new Set(
  "animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(
    " ",
  ),
);
function Sm(e, t, n) {
  var a = t.indexOf("--") === 0;
  n == null || typeof n == "boolean" || n === ""
    ? a
      ? e.setProperty(t, "")
      : t === "float"
        ? (e.cssFloat = "")
        : (e[t] = "")
    : a
      ? e.setProperty(t, n)
      : typeof n != "number" || n === 0 || Iw.has(t)
        ? t === "float"
          ? (e.cssFloat = n)
          : (e[t] = ("" + n).trim())
        : (e[t] = n + "px");
}
function Dp(e, t, n) {
  if (t != null && typeof t != "object") throw Error(k(62));
  if (((e = e.style), n != null)) {
    for (var a in n)
      !n.hasOwnProperty(a) ||
        (t != null && t.hasOwnProperty(a)) ||
        (a.indexOf("--") === 0
          ? e.setProperty(a, "")
          : a === "float"
            ? (e.cssFloat = "")
            : (e[a] = ""));
    for (var o in t)
      ((a = t[o]), t.hasOwnProperty(o) && n[o] !== a && Sm(e, o, a));
  } else for (var r in t) t.hasOwnProperty(r) && Sm(e, r, t[r]);
}
function jf(e) {
  if (e.indexOf("-") === -1) return !1;
  switch (e) {
    case "annotation-xml":
    case "color-profile":
    case "font-face":
    case "font-face-src":
    case "font-face-uri":
    case "font-face-format":
    case "font-face-name":
    case "missing-glyph":
      return !1;
    default:
      return !0;
  }
}
var Gw = new Map([
    ["acceptCharset", "accept-charset"],
    ["htmlFor", "for"],
    ["httpEquiv", "http-equiv"],
    ["crossOrigin", "crossorigin"],
    ["accentHeight", "accent-height"],
    ["alignmentBaseline", "alignment-baseline"],
    ["arabicForm", "arabic-form"],
    ["baselineShift", "baseline-shift"],
    ["capHeight", "cap-height"],
    ["clipPath", "clip-path"],
    ["clipRule", "clip-rule"],
    ["colorInterpolation", "color-interpolation"],
    ["colorInterpolationFilters", "color-interpolation-filters"],
    ["colorProfile", "color-profile"],
    ["colorRendering", "color-rendering"],
    ["dominantBaseline", "dominant-baseline"],
    ["enableBackground", "enable-background"],
    ["fillOpacity", "fill-opacity"],
    ["fillRule", "fill-rule"],
    ["floodColor", "flood-color"],
    ["floodOpacity", "flood-opacity"],
    ["fontFamily", "font-family"],
    ["fontSize", "font-size"],
    ["fontSizeAdjust", "font-size-adjust"],
    ["fontStretch", "font-stretch"],
    ["fontStyle", "font-style"],
    ["fontVariant", "font-variant"],
    ["fontWeight", "font-weight"],
    ["glyphName", "glyph-name"],
    ["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
    ["glyphOrientationVertical", "glyph-orientation-vertical"],
    ["horizAdvX", "horiz-adv-x"],
    ["horizOriginX", "horiz-origin-x"],
    ["imageRendering", "image-rendering"],
    ["letterSpacing", "letter-spacing"],
    ["lightingColor", "lighting-color"],
    ["markerEnd", "marker-end"],
    ["markerMid", "marker-mid"],
    ["markerStart", "marker-start"],
    ["overlinePosition", "overline-position"],
    ["overlineThickness", "overline-thickness"],
    ["paintOrder", "paint-order"],
    ["panose-1", "panose-1"],
    ["pointerEvents", "pointer-events"],
    ["renderingIntent", "rendering-intent"],
    ["shapeRendering", "shape-rendering"],
    ["stopColor", "stop-color"],
    ["stopOpacity", "stop-opacity"],
    ["strikethroughPosition", "strikethrough-position"],
    ["strikethroughThickness", "strikethrough-thickness"],
    ["strokeDasharray", "stroke-dasharray"],
    ["strokeDashoffset", "stroke-dashoffset"],
    ["strokeLinecap", "stroke-linecap"],
    ["strokeLinejoin", "stroke-linejoin"],
    ["strokeMiterlimit", "stroke-miterlimit"],
    ["strokeOpacity", "stroke-opacity"],
    ["strokeWidth", "stroke-width"],
    ["textAnchor", "text-anchor"],
    ["textDecoration", "text-decoration"],
    ["textRendering", "text-rendering"],
    ["transformOrigin", "transform-origin"],
    ["underlinePosition", "underline-position"],
    ["underlineThickness", "underline-thickness"],
    ["unicodeBidi", "unicode-bidi"],
    ["unicodeRange", "unicode-range"],
    ["unitsPerEm", "units-per-em"],
    ["vAlphabetic", "v-alphabetic"],
    ["vHanging", "v-hanging"],
    ["vIdeographic", "v-ideographic"],
    ["vMathematical", "v-mathematical"],
    ["vectorEffect", "vector-effect"],
    ["vertAdvY", "vert-adv-y"],
    ["vertOriginX", "vert-origin-x"],
    ["vertOriginY", "vert-origin-y"],
    ["wordSpacing", "word-spacing"],
    ["writingMode", "writing-mode"],
    ["xmlnsXlink", "xmlns:xlink"],
    ["xHeight", "x-height"],
  ]),
  Yw =
    /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
function ml(e) {
  return Yw.test("" + e)
    ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
    : e;
}
function Rn() {}
var Eu = null;
function Bf(e) {
  return (
    (e = e.target || e.srcElement || window),
    e.correspondingUseElement && (e = e.correspondingUseElement),
    e.nodeType === 3 ? e.parentNode : e
  );
}
var yo = null,
  Do = null;
function wm(e) {
  var t = Jo(e);
  if (t && (e = t.stateNode)) {
    var n = e[vt] || null;
    e: switch (((e = t.stateNode), t.type)) {
      case "input":
        if (
          (wu(
            e,
            n.value,
            n.defaultValue,
            n.defaultValue,
            n.checked,
            n.defaultChecked,
            n.type,
            n.name,
          ),
          (t = n.name),
          n.type === "radio" && t != null)
        ) {
          for (n = e; n.parentNode; ) n = n.parentNode;
          for (
            n = n.querySelectorAll(
              'input[name="' + Pt("" + t) + '"][type="radio"]',
            ),
              t = 0;
            t < n.length;
            t++
          ) {
            var a = n[t];
            if (a !== e && a.form === e.form) {
              var o = a[vt] || null;
              if (!o) throw Error(k(90));
              wu(
                a,
                o.value,
                o.defaultValue,
                o.defaultValue,
                o.checked,
                o.defaultChecked,
                o.type,
                o.name,
              );
            }
          }
          for (t = 0; t < n.length; t++)
            ((a = n[t]), a.form === e.form && Ap(a));
        }
        break e;
      case "textarea":
        Rp(e, n.value, n.defaultValue);
        break e;
      case "select":
        ((t = n.value), t != null && Mo(e, !!n.multiple, t, !1));
    }
  }
}
var yc = !1;
function Op(e, t, n) {
  if (yc) return e(t, n);
  yc = !0;
  try {
    var a = e(t);
    return a;
  } finally {
    if (
      ((yc = !1),
      (yo !== null || Do !== null) &&
        (Vs(), yo && ((t = yo), (e = Do), (Do = yo = null), wm(t), e)))
    )
      for (t = 0; t < e.length; t++) wm(e[t]);
  }
}
function qr(e, t) {
  var n = e.stateNode;
  if (n === null) return null;
  var a = n[vt] || null;
  if (a === null) return null;
  n = a[t];
  e: switch (t) {
    case "onClick":
    case "onClickCapture":
    case "onDoubleClick":
    case "onDoubleClickCapture":
    case "onMouseDown":
    case "onMouseDownCapture":
    case "onMouseMove":
    case "onMouseMoveCapture":
    case "onMouseUp":
    case "onMouseUpCapture":
    case "onMouseEnter":
      ((a = !a.disabled) ||
        ((e = e.type),
        (a = !(
          e === "button" ||
          e === "input" ||
          e === "select" ||
          e === "textarea"
        ))),
        (e = !a));
      break e;
    default:
      e = !1;
  }
  if (e) return null;
  if (n && typeof n != "function") throw Error(k(231, t, typeof n));
  return n;
}
var Nn = !(
    typeof window > "u" ||
    typeof window.document > "u" ||
    typeof window.document.createElement > "u"
  ),
  Cu = !1;
if (Nn)
  try {
    var ur = {};
    (Object.defineProperty(ur, "passive", {
      get: function () {
        Cu = !0;
      },
    }),
      window.addEventListener("test", ur, ur),
      window.removeEventListener("test", ur, ur));
  } catch {
    Cu = !1;
  }
var Wn = null,
  Uf = null,
  gl = null;
function kp() {
  if (gl) return gl;
  var e,
    t = Uf,
    n = t.length,
    a,
    o = "value" in Wn ? Wn.value : Wn.textContent,
    r = o.length;
  for (e = 0; e < n && t[e] === o[e]; e++);
  var i = n - e;
  for (a = 1; a <= i && t[n - a] === o[r - a]; a++);
  return (gl = o.slice(e, 1 < a ? 1 - a : void 0));
}
function hl(e) {
  var t = e.keyCode;
  return (
    "charCode" in e
      ? ((e = e.charCode), e === 0 && t === 13 && (e = 13))
      : (e = t),
    e === 10 && (e = 13),
    32 <= e || e === 13 ? e : 0
  );
}
function Gi() {
  return !0;
}
function xm() {
  return !1;
}
function yt(e) {
  function t(n, a, o, r, i) {
    ((this._reactName = n),
      (this._targetInst = o),
      (this.type = a),
      (this.nativeEvent = r),
      (this.target = i),
      (this.currentTarget = null));
    for (var l in e)
      e.hasOwnProperty(l) && ((n = e[l]), (this[l] = n ? n(r) : r[l]));
    return (
      (this.isDefaultPrevented = (
        r.defaultPrevented != null ? r.defaultPrevented : r.returnValue === !1
      )
        ? Gi
        : xm),
      (this.isPropagationStopped = xm),
      this
    );
  }
  return (
    Ce(t.prototype, {
      preventDefault: function () {
        this.defaultPrevented = !0;
        var n = this.nativeEvent;
        n &&
          (n.preventDefault
            ? n.preventDefault()
            : typeof n.returnValue != "unknown" && (n.returnValue = !1),
          (this.isDefaultPrevented = Gi));
      },
      stopPropagation: function () {
        var n = this.nativeEvent;
        n &&
          (n.stopPropagation
            ? n.stopPropagation()
            : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0),
          (this.isPropagationStopped = Gi));
      },
      persist: function () {},
      isPersistent: Gi,
    }),
    t
  );
}
var Ka = {
    eventPhase: 0,
    bubbles: 0,
    cancelable: 0,
    timeStamp: function (e) {
      return e.timeStamp || Date.now();
    },
    defaultPrevented: 0,
    isTrusted: 0,
  },
  Os = yt(Ka),
  bi = Ce({}, Ka, { view: 0, detail: 0 }),
  Fw = yt(bi),
  bc,
  Sc,
  fr,
  ks = Ce({}, bi, {
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    pageX: 0,
    pageY: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    getModifierState: Hf,
    button: 0,
    buttons: 0,
    relatedTarget: function (e) {
      return e.relatedTarget === void 0
        ? e.fromElement === e.srcElement
          ? e.toElement
          : e.fromElement
        : e.relatedTarget;
    },
    movementX: function (e) {
      return "movementX" in e
        ? e.movementX
        : (e !== fr &&
            (fr && e.type === "mousemove"
              ? ((bc = e.screenX - fr.screenX), (Sc = e.screenY - fr.screenY))
              : (Sc = bc = 0),
            (fr = e)),
          bc);
    },
    movementY: function (e) {
      return "movementY" in e ? e.movementY : Sc;
    },
  }),
  Em = yt(ks),
  Kw = Ce({}, ks, { dataTransfer: 0 }),
  qw = yt(Kw),
  Xw = Ce({}, bi, { relatedTarget: 0 }),
  wc = yt(Xw),
  $w = Ce({}, Ka, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }),
  Qw = yt($w),
  Zw = Ce({}, Ka, {
    clipboardData: function (e) {
      return "clipboardData" in e ? e.clipboardData : window.clipboardData;
    },
  }),
  Jw = yt(Zw),
  Ww = Ce({}, Ka, { data: 0 }),
  Cm = yt(Ww),
  ex = {
    Esc: "Escape",
    Spacebar: " ",
    Left: "ArrowLeft",
    Up: "ArrowUp",
    Right: "ArrowRight",
    Down: "ArrowDown",
    Del: "Delete",
    Win: "OS",
    Menu: "ContextMenu",
    Apps: "ContextMenu",
    Scroll: "ScrollLock",
    MozPrintableKey: "Unidentified",
  },
  tx = {
    8: "Backspace",
    9: "Tab",
    12: "Clear",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    45: "Insert",
    46: "Delete",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    144: "NumLock",
    145: "ScrollLock",
    224: "Meta",
  },
  nx = {
    Alt: "altKey",
    Control: "ctrlKey",
    Meta: "metaKey",
    Shift: "shiftKey",
  };
function ax(e) {
  var t = this.nativeEvent;
  return t.getModifierState ? t.getModifierState(e) : (e = nx[e]) ? !!t[e] : !1;
}
function Hf() {
  return ax;
}
var ox = Ce({}, bi, {
    key: function (e) {
      if (e.key) {
        var t = ex[e.key] || e.key;
        if (t !== "Unidentified") return t;
      }
      return e.type === "keypress"
        ? ((e = hl(e)), e === 13 ? "Enter" : String.fromCharCode(e))
        : e.type === "keydown" || e.type === "keyup"
          ? tx[e.keyCode] || "Unidentified"
          : "";
    },
    code: 0,
    location: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    repeat: 0,
    locale: 0,
    getModifierState: Hf,
    charCode: function (e) {
      return e.type === "keypress" ? hl(e) : 0;
    },
    keyCode: function (e) {
      return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
    },
    which: function (e) {
      return e.type === "keypress"
        ? hl(e)
        : e.type === "keydown" || e.type === "keyup"
          ? e.keyCode
          : 0;
    },
  }),
  rx = yt(ox),
  ix = Ce({}, ks, {
    pointerId: 0,
    width: 0,
    height: 0,
    pressure: 0,
    tangentialPressure: 0,
    tiltX: 0,
    tiltY: 0,
    twist: 0,
    pointerType: 0,
    isPrimary: 0,
  }),
  Am = yt(ix),
  lx = Ce({}, bi, {
    touches: 0,
    targetTouches: 0,
    changedTouches: 0,
    altKey: 0,
    metaKey: 0,
    ctrlKey: 0,
    shiftKey: 0,
    getModifierState: Hf,
  }),
  sx = yt(lx),
  cx = Ce({}, Ka, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }),
  ux = yt(cx),
  fx = Ce({}, ks, {
    deltaX: function (e) {
      return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
    },
    deltaY: function (e) {
      return "deltaY" in e
        ? e.deltaY
        : "wheelDeltaY" in e
          ? -e.wheelDeltaY
          : "wheelDelta" in e
            ? -e.wheelDelta
            : 0;
    },
    deltaZ: 0,
    deltaMode: 0,
  }),
  dx = yt(fx),
  mx = Ce({}, Ka, { newState: 0, oldState: 0 }),
  gx = yt(mx),
  hx = [9, 13, 27, 32],
  Pf = Nn && "CompositionEvent" in window,
  Or = null;
Nn && "documentMode" in document && (Or = document.documentMode);
var px = Nn && "TextEvent" in window && !Or,
  Np = Nn && (!Pf || (Or && 8 < Or && 11 >= Or)),
  Tm = " ",
  Rm = !1;
function _p(e, t) {
  switch (e) {
    case "keyup":
      return hx.indexOf(t.keyCode) !== -1;
    case "keydown":
      return t.keyCode !== 229;
    case "keypress":
    case "mousedown":
    case "focusout":
      return !0;
    default:
      return !1;
  }
}
function Lp(e) {
  return ((e = e.detail), typeof e == "object" && "data" in e ? e.data : null);
}
var bo = !1;
function vx(e, t) {
  switch (e) {
    case "compositionend":
      return Lp(t);
    case "keypress":
      return t.which !== 32 ? null : ((Rm = !0), Tm);
    case "textInput":
      return ((e = t.data), e === Tm && Rm ? null : e);
    default:
      return null;
  }
}
function yx(e, t) {
  if (bo)
    return e === "compositionend" || (!Pf && _p(e, t))
      ? ((e = kp()), (gl = Uf = Wn = null), (bo = !1), e)
      : null;
  switch (e) {
    case "paste":
      return null;
    case "keypress":
      if (!(t.ctrlKey || t.altKey || t.metaKey) || (t.ctrlKey && t.altKey)) {
        if (t.char && 1 < t.char.length) return t.char;
        if (t.which) return String.fromCharCode(t.which);
      }
      return null;
    case "compositionend":
      return Np && t.locale !== "ko" ? null : t.data;
    default:
      return null;
  }
}
var bx = {
  color: !0,
  date: !0,
  datetime: !0,
  "datetime-local": !0,
  email: !0,
  month: !0,
  number: !0,
  password: !0,
  range: !0,
  search: !0,
  tel: !0,
  text: !0,
  time: !0,
  url: !0,
  week: !0,
};
function Mm(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t === "input" ? !!bx[e.type] : t === "textarea";
}
function zp(e, t, n, a) {
  (yo ? (Do ? Do.push(a) : (Do = [a])) : (yo = a),
    (t = ns(t, "onChange")),
    0 < t.length &&
      ((n = new Os("onChange", "change", null, n, a)),
      e.push({ event: n, listeners: t })));
}
var kr = null,
  Xr = null;
function Sx(e) {
  Oy(e, 0);
}
function Ns(e) {
  var t = Ar(e);
  if (Ap(t)) return e;
}
function Dm(e, t) {
  if (e === "change") return t;
}
var jp = !1;
if (Nn) {
  var xc;
  if (Nn) {
    var Ec = "oninput" in document;
    if (!Ec) {
      var Om = document.createElement("div");
      (Om.setAttribute("oninput", "return;"),
        (Ec = typeof Om.oninput == "function"));
    }
    xc = Ec;
  } else xc = !1;
  jp = xc && (!document.documentMode || 9 < document.documentMode);
}
function km() {
  kr && (kr.detachEvent("onpropertychange", Bp), (Xr = kr = null));
}
function Bp(e) {
  if (e.propertyName === "value" && Ns(Xr)) {
    var t = [];
    (zp(t, Xr, e, Bf(e)), Op(Sx, t));
  }
}
function wx(e, t, n) {
  e === "focusin"
    ? (km(), (kr = t), (Xr = n), kr.attachEvent("onpropertychange", Bp))
    : e === "focusout" && km();
}
function xx(e) {
  if (e === "selectionchange" || e === "keyup" || e === "keydown")
    return Ns(Xr);
}
function Ex(e, t) {
  if (e === "click") return Ns(t);
}
function Cx(e, t) {
  if (e === "input" || e === "change") return Ns(t);
}
function Ax(e, t) {
  return (e === t && (e !== 0 || 1 / e === 1 / t)) || (e !== e && t !== t);
}
var Nt = typeof Object.is == "function" ? Object.is : Ax;
function $r(e, t) {
  if (Nt(e, t)) return !0;
  if (typeof e != "object" || e === null || typeof t != "object" || t === null)
    return !1;
  var n = Object.keys(e),
    a = Object.keys(t);
  if (n.length !== a.length) return !1;
  for (a = 0; a < n.length; a++) {
    var o = n[a];
    if (!yu.call(t, o) || !Nt(e[o], t[o])) return !1;
  }
  return !0;
}
function Nm(e) {
  for (; e && e.firstChild; ) e = e.firstChild;
  return e;
}
function _m(e, t) {
  var n = Nm(e);
  e = 0;
  for (var a; n; ) {
    if (n.nodeType === 3) {
      if (((a = e + n.textContent.length), e <= t && a >= t))
        return { node: n, offset: t - e };
      e = a;
    }
    e: {
      for (; n; ) {
        if (n.nextSibling) {
          n = n.nextSibling;
          break e;
        }
        n = n.parentNode;
      }
      n = void 0;
    }
    n = Nm(n);
  }
}
function Up(e, t) {
  return e && t
    ? e === t
      ? !0
      : e && e.nodeType === 3
        ? !1
        : t && t.nodeType === 3
          ? Up(e, t.parentNode)
          : "contains" in e
            ? e.contains(t)
            : e.compareDocumentPosition
              ? !!(e.compareDocumentPosition(t) & 16)
              : !1
    : !1;
}
function Hp(e) {
  e =
    e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null
      ? e.ownerDocument.defaultView
      : window;
  for (var t = Ul(e.document); t instanceof e.HTMLIFrameElement; ) {
    try {
      var n = typeof t.contentWindow.location.href == "string";
    } catch {
      n = !1;
    }
    if (n) e = t.contentWindow;
    else break;
    t = Ul(e.document);
  }
  return t;
}
function Vf(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return (
    t &&
    ((t === "input" &&
      (e.type === "text" ||
        e.type === "search" ||
        e.type === "tel" ||
        e.type === "url" ||
        e.type === "password")) ||
      t === "textarea" ||
      e.contentEditable === "true")
  );
}
var Tx = Nn && "documentMode" in document && 11 >= document.documentMode,
  So = null,
  Au = null,
  Nr = null,
  Tu = !1;
function Lm(e, t, n) {
  var a = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
  Tu ||
    So == null ||
    So !== Ul(a) ||
    ((a = So),
    "selectionStart" in a && Vf(a)
      ? (a = { start: a.selectionStart, end: a.selectionEnd })
      : ((a = (
          (a.ownerDocument && a.ownerDocument.defaultView) ||
          window
        ).getSelection()),
        (a = {
          anchorNode: a.anchorNode,
          anchorOffset: a.anchorOffset,
          focusNode: a.focusNode,
          focusOffset: a.focusOffset,
        })),
    (Nr && $r(Nr, a)) ||
      ((Nr = a),
      (a = ns(Au, "onSelect")),
      0 < a.length &&
        ((t = new Os("onSelect", "select", null, t, n)),
        e.push({ event: t, listeners: a }),
        (t.target = So))));
}
function Aa(e, t) {
  var n = {};
  return (
    (n[e.toLowerCase()] = t.toLowerCase()),
    (n["Webkit" + e] = "webkit" + t),
    (n["Moz" + e] = "moz" + t),
    n
  );
}
var wo = {
    animationend: Aa("Animation", "AnimationEnd"),
    animationiteration: Aa("Animation", "AnimationIteration"),
    animationstart: Aa("Animation", "AnimationStart"),
    transitionrun: Aa("Transition", "TransitionRun"),
    transitionstart: Aa("Transition", "TransitionStart"),
    transitioncancel: Aa("Transition", "TransitionCancel"),
    transitionend: Aa("Transition", "TransitionEnd"),
  },
  Cc = {},
  Pp = {};
Nn &&
  ((Pp = document.createElement("div").style),
  "AnimationEvent" in window ||
    (delete wo.animationend.animation,
    delete wo.animationiteration.animation,
    delete wo.animationstart.animation),
  "TransitionEvent" in window || delete wo.transitionend.transition);
function qa(e) {
  if (Cc[e]) return Cc[e];
  if (!wo[e]) return e;
  var t = wo[e],
    n;
  for (n in t) if (t.hasOwnProperty(n) && n in Pp) return (Cc[e] = t[n]);
  return e;
}
var Vp = qa("animationend"),
  Ip = qa("animationiteration"),
  Gp = qa("animationstart"),
  Rx = qa("transitionrun"),
  Mx = qa("transitionstart"),
  Dx = qa("transitioncancel"),
  Yp = qa("transitionend"),
  Fp = new Map(),
  Ru =
    "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
      " ",
    );
Ru.push("scrollEnd");
function en(e, t) {
  (Fp.set(e, t), Fa(t, [e]));
}
var Hl =
    typeof reportError == "function"
      ? reportError
      : function (e) {
          if (
            typeof window == "object" &&
            typeof window.ErrorEvent == "function"
          ) {
            var t = new window.ErrorEvent("error", {
              bubbles: !0,
              cancelable: !0,
              message:
                typeof e == "object" &&
                e !== null &&
                typeof e.message == "string"
                  ? String(e.message)
                  : String(e),
              error: e,
            });
            if (!window.dispatchEvent(t)) return;
          } else if (
            typeof process == "object" &&
            typeof process.emit == "function"
          ) {
            process.emit("uncaughtException", e);
            return;
          }
        },
  jt = [],
  xo = 0,
  If = 0;
function _s() {
  for (var e = xo, t = (If = xo = 0); t < e; ) {
    var n = jt[t];
    jt[t++] = null;
    var a = jt[t];
    jt[t++] = null;
    var o = jt[t];
    jt[t++] = null;
    var r = jt[t];
    if (((jt[t++] = null), a !== null && o !== null)) {
      var i = a.pending;
      (i === null ? (o.next = o) : ((o.next = i.next), (i.next = o)),
        (a.pending = o));
    }
    r !== 0 && Kp(n, o, r);
  }
}
function Ls(e, t, n, a) {
  ((jt[xo++] = e),
    (jt[xo++] = t),
    (jt[xo++] = n),
    (jt[xo++] = a),
    (If |= a),
    (e.lanes |= a),
    (e = e.alternate),
    e !== null && (e.lanes |= a));
}
function Gf(e, t, n, a) {
  return (Ls(e, t, n, a), Pl(e));
}
function Xa(e, t) {
  return (Ls(e, null, null, t), Pl(e));
}
function Kp(e, t, n) {
  e.lanes |= n;
  var a = e.alternate;
  a !== null && (a.lanes |= n);
  for (var o = !1, r = e.return; r !== null; )
    ((r.childLanes |= n),
      (a = r.alternate),
      a !== null && (a.childLanes |= n),
      r.tag === 22 &&
        ((e = r.stateNode), e === null || e._visibility & 1 || (o = !0)),
      (e = r),
      (r = r.return));
  return e.tag === 3
    ? ((r = e.stateNode),
      o &&
        t !== null &&
        ((o = 31 - Dt(n)),
        (e = r.hiddenUpdates),
        (a = e[o]),
        a === null ? (e[o] = [t]) : a.push(t),
        (t.lane = n | 536870912)),
      r)
    : null;
}
function Pl(e) {
  if (50 < Vr) throw ((Vr = 0), (Xu = null), Error(k(185)));
  for (var t = e.return; t !== null; ) ((e = t), (t = e.return));
  return e.tag === 3 ? e.stateNode : null;
}
var Eo = {};
function Ox(e, t, n, a) {
  ((this.tag = e),
    (this.key = n),
    (this.sibling =
      this.child =
      this.return =
      this.stateNode =
      this.type =
      this.elementType =
        null),
    (this.index = 0),
    (this.refCleanup = this.ref = null),
    (this.pendingProps = t),
    (this.dependencies =
      this.memoizedState =
      this.updateQueue =
      this.memoizedProps =
        null),
    (this.mode = a),
    (this.subtreeFlags = this.flags = 0),
    (this.deletions = null),
    (this.childLanes = this.lanes = 0),
    (this.alternate = null));
}
function At(e, t, n, a) {
  return new Ox(e, t, n, a);
}
function Yf(e) {
  return ((e = e.prototype), !(!e || !e.isReactComponent));
}
function Dn(e, t) {
  var n = e.alternate;
  return (
    n === null
      ? ((n = At(e.tag, t, e.key, e.mode)),
        (n.elementType = e.elementType),
        (n.type = e.type),
        (n.stateNode = e.stateNode),
        (n.alternate = e),
        (e.alternate = n))
      : ((n.pendingProps = t),
        (n.type = e.type),
        (n.flags = 0),
        (n.subtreeFlags = 0),
        (n.deletions = null)),
    (n.flags = e.flags & 65011712),
    (n.childLanes = e.childLanes),
    (n.lanes = e.lanes),
    (n.child = e.child),
    (n.memoizedProps = e.memoizedProps),
    (n.memoizedState = e.memoizedState),
    (n.updateQueue = e.updateQueue),
    (t = e.dependencies),
    (n.dependencies =
      t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }),
    (n.sibling = e.sibling),
    (n.index = e.index),
    (n.ref = e.ref),
    (n.refCleanup = e.refCleanup),
    n
  );
}
function qp(e, t) {
  e.flags &= 65011714;
  var n = e.alternate;
  return (
    n === null
      ? ((e.childLanes = 0),
        (e.lanes = t),
        (e.child = null),
        (e.subtreeFlags = 0),
        (e.memoizedProps = null),
        (e.memoizedState = null),
        (e.updateQueue = null),
        (e.dependencies = null),
        (e.stateNode = null))
      : ((e.childLanes = n.childLanes),
        (e.lanes = n.lanes),
        (e.child = n.child),
        (e.subtreeFlags = 0),
        (e.deletions = null),
        (e.memoizedProps = n.memoizedProps),
        (e.memoizedState = n.memoizedState),
        (e.updateQueue = n.updateQueue),
        (e.type = n.type),
        (t = n.dependencies),
        (e.dependencies =
          t === null
            ? null
            : { lanes: t.lanes, firstContext: t.firstContext })),
    e
  );
}
function pl(e, t, n, a, o, r) {
  var i = 0;
  if (((a = e), typeof e == "function")) Yf(e) && (i = 1);
  else if (typeof e == "string")
    i = z1(e, n, un.current)
      ? 26
      : e === "html" || e === "head" || e === "body"
        ? 27
        : 5;
  else
    e: switch (e) {
      case gu:
        return ((e = At(31, n, t, o)), (e.elementType = gu), (e.lanes = r), e);
      case ho:
        return _a(n.children, o, r, t);
      case dp:
        ((i = 8), (o |= 24));
        break;
      case fu:
        return (
          (e = At(12, n, t, o | 2)),
          (e.elementType = fu),
          (e.lanes = r),
          e
        );
      case du:
        return ((e = At(13, n, t, o)), (e.elementType = du), (e.lanes = r), e);
      case mu:
        return ((e = At(19, n, t, o)), (e.elementType = mu), (e.lanes = r), e);
      default:
        if (typeof e == "object" && e !== null)
          switch (e.$$typeof) {
            case Tn:
              i = 10;
              break e;
            case mp:
              i = 9;
              break e;
            case Of:
              i = 11;
              break e;
            case kf:
              i = 14;
              break e;
            case Kn:
              ((i = 16), (a = null));
              break e;
          }
        ((i = 29),
          (n = Error(k(130, e === null ? "null" : typeof e, ""))),
          (a = null));
    }
  return (
    (t = At(i, n, t, o)),
    (t.elementType = e),
    (t.type = a),
    (t.lanes = r),
    t
  );
}
function _a(e, t, n, a) {
  return ((e = At(7, e, a, t)), (e.lanes = n), e);
}
function Ac(e, t, n) {
  return ((e = At(6, e, null, t)), (e.lanes = n), e);
}
function Xp(e) {
  var t = At(18, null, null, 0);
  return ((t.stateNode = e), t);
}
function Tc(e, t, n) {
  return (
    (t = At(4, e.children !== null ? e.children : [], e.key, t)),
    (t.lanes = n),
    (t.stateNode = {
      containerInfo: e.containerInfo,
      pendingChildren: null,
      implementation: e.implementation,
    }),
    t
  );
}
var zm = new WeakMap();
function Vt(e, t) {
  if (typeof e == "object" && e !== null) {
    var n = zm.get(e);
    return n !== void 0
      ? n
      : ((t = { value: e, source: t, stack: hm(t) }), zm.set(e, t), t);
  }
  return { value: e, source: t, stack: hm(t) };
}
var Co = [],
  Ao = 0,
  Vl = null,
  Qr = 0,
  Ut = [],
  Ht = 0,
  ma = null,
  on = 1,
  rn = "";
function Cn(e, t) {
  ((Co[Ao++] = Qr), (Co[Ao++] = Vl), (Vl = e), (Qr = t));
}
function $p(e, t, n) {
  ((Ut[Ht++] = on), (Ut[Ht++] = rn), (Ut[Ht++] = ma), (ma = e));
  var a = on;
  e = rn;
  var o = 32 - Dt(a) - 1;
  ((a &= ~(1 << o)), (n += 1));
  var r = 32 - Dt(t) + o;
  if (30 < r) {
    var i = o - (o % 5);
    ((r = (a & ((1 << i) - 1)).toString(32)),
      (a >>= i),
      (o -= i),
      (on = (1 << (32 - Dt(t) + o)) | (n << o) | a),
      (rn = r + e));
  } else ((on = (1 << r) | (n << o) | a), (rn = e));
}
function Ff(e) {
  e.return !== null && (Cn(e, 1), $p(e, 1, 0));
}
function Kf(e) {
  for (; e === Vl; )
    ((Vl = Co[--Ao]), (Co[Ao] = null), (Qr = Co[--Ao]), (Co[Ao] = null));
  for (; e === ma; )
    ((ma = Ut[--Ht]),
      (Ut[Ht] = null),
      (rn = Ut[--Ht]),
      (Ut[Ht] = null),
      (on = Ut[--Ht]),
      (Ut[Ht] = null));
}
function Qp(e, t) {
  ((Ut[Ht++] = on),
    (Ut[Ht++] = rn),
    (Ut[Ht++] = ma),
    (on = t.id),
    (rn = t.overflow),
    (ma = e));
}
var Je = null,
  xe = null,
  ie = !1,
  oa = null,
  It = !1,
  Mu = Error(k(519));
function ga(e) {
  var t = Error(
    k(
      418,
      1 < arguments.length && arguments[1] !== void 0 && arguments[1]
        ? "text"
        : "HTML",
      "",
    ),
  );
  throw (Zr(Vt(t, e)), Mu);
}
function jm(e) {
  var t = e.stateNode,
    n = e.type,
    a = e.memoizedProps;
  switch (((t[Ze] = e), (t[vt] = a), n)) {
    case "dialog":
      (ne("cancel", t), ne("close", t));
      break;
    case "iframe":
    case "object":
    case "embed":
      ne("load", t);
      break;
    case "video":
    case "audio":
      for (n = 0; n < ti.length; n++) ne(ti[n], t);
      break;
    case "source":
      ne("error", t);
      break;
    case "img":
    case "image":
    case "link":
      (ne("error", t), ne("load", t));
      break;
    case "details":
      ne("toggle", t);
      break;
    case "input":
      (ne("invalid", t),
        Tp(
          t,
          a.value,
          a.defaultValue,
          a.checked,
          a.defaultChecked,
          a.type,
          a.name,
          !0,
        ));
      break;
    case "select":
      ne("invalid", t);
      break;
    case "textarea":
      (ne("invalid", t), Mp(t, a.value, a.defaultValue, a.children));
  }
  ((n = a.children),
    (typeof n != "string" && typeof n != "number" && typeof n != "bigint") ||
    t.textContent === "" + n ||
    a.suppressHydrationWarning === !0 ||
    Ny(t.textContent, n)
      ? (a.popover != null && (ne("beforetoggle", t), ne("toggle", t)),
        a.onScroll != null && ne("scroll", t),
        a.onScrollEnd != null && ne("scrollend", t),
        a.onClick != null && (t.onclick = Rn),
        (t = !0))
      : (t = !1),
    t || ga(e, !0));
}
function Bm(e) {
  for (Je = e.return; Je; )
    switch (Je.tag) {
      case 5:
      case 31:
      case 13:
        It = !1;
        return;
      case 27:
      case 3:
        It = !0;
        return;
      default:
        Je = Je.return;
    }
}
function ao(e) {
  if (e !== Je) return !1;
  if (!ie) return (Bm(e), (ie = !0), !1);
  var t = e.tag,
    n;
  if (
    ((n = t !== 3 && t !== 27) &&
      ((n = t === 5) &&
        ((n = e.type),
        (n = !(n !== "form" && n !== "button") || Wu(e.type, e.memoizedProps))),
      (n = !n)),
    n && xe && ga(e),
    Bm(e),
    t === 13)
  ) {
    if (((e = e.memoizedState), (e = e !== null ? e.dehydrated : null), !e))
      throw Error(k(317));
    xe = Eg(e);
  } else if (t === 31) {
    if (((e = e.memoizedState), (e = e !== null ? e.dehydrated : null), !e))
      throw Error(k(317));
    xe = Eg(e);
  } else
    t === 27
      ? ((t = xe), Sa(e.type) ? ((e = af), (af = null), (xe = e)) : (xe = t))
      : (xe = Je ? Yt(e.stateNode.nextSibling) : null);
  return !0;
}
function Ua() {
  ((xe = Je = null), (ie = !1));
}
function Rc() {
  var e = oa;
  return (
    e !== null && (gt === null ? (gt = e) : gt.push.apply(gt, e), (oa = null)),
    e
  );
}
function Zr(e) {
  oa === null ? (oa = [e]) : oa.push(e);
}
var Du = mn(null),
  $a = null,
  Mn = null;
function Xn(e, t, n) {
  (Se(Du, t._currentValue), (t._currentValue = n));
}
function On(e) {
  ((e._currentValue = Du.current), Fe(Du));
}
function Ou(e, t, n) {
  for (; e !== null; ) {
    var a = e.alternate;
    if (
      ((e.childLanes & t) !== t
        ? ((e.childLanes |= t), a !== null && (a.childLanes |= t))
        : a !== null && (a.childLanes & t) !== t && (a.childLanes |= t),
      e === n)
    )
      break;
    e = e.return;
  }
}
function ku(e, t, n, a) {
  var o = e.child;
  for (o !== null && (o.return = e); o !== null; ) {
    var r = o.dependencies;
    if (r !== null) {
      var i = o.child;
      r = r.firstContext;
      e: for (; r !== null; ) {
        var l = r;
        r = o;
        for (var s = 0; s < t.length; s++)
          if (l.context === t[s]) {
            ((r.lanes |= n),
              (l = r.alternate),
              l !== null && (l.lanes |= n),
              Ou(r.return, n, e),
              a || (i = null));
            break e;
          }
        r = l.next;
      }
    } else if (o.tag === 18) {
      if (((i = o.return), i === null)) throw Error(k(341));
      ((i.lanes |= n),
        (r = i.alternate),
        r !== null && (r.lanes |= n),
        Ou(i, n, e),
        (i = null));
    } else i = o.child;
    if (i !== null) i.return = o;
    else
      for (i = o; i !== null; ) {
        if (i === e) {
          i = null;
          break;
        }
        if (((o = i.sibling), o !== null)) {
          ((o.return = i.return), (i = o));
          break;
        }
        i = i.return;
      }
    o = i;
  }
}
function Wo(e, t, n, a) {
  e = null;
  for (var o = t, r = !1; o !== null; ) {
    if (!r) {
      if (o.flags & 524288) r = !0;
      else if (o.flags & 262144) break;
    }
    if (o.tag === 10) {
      var i = o.alternate;
      if (i === null) throw Error(k(387));
      if (((i = i.memoizedProps), i !== null)) {
        var l = o.type;
        Nt(o.pendingProps.value, i.value) ||
          (e !== null ? e.push(l) : (e = [l]));
      }
    } else if (o === Ll.current) {
      if (((i = o.alternate), i === null)) throw Error(k(387));
      i.memoizedState.memoizedState !== o.memoizedState.memoizedState &&
        (e !== null ? e.push(ai) : (e = [ai]));
    }
    o = o.return;
  }
  (e !== null && ku(t, e, n, a), (t.flags |= 262144));
}
function Il(e) {
  for (e = e.firstContext; e !== null; ) {
    if (!Nt(e.context._currentValue, e.memoizedValue)) return !0;
    e = e.next;
  }
  return !1;
}
function Ha(e) {
  (($a = e),
    (Mn = null),
    (e = e.dependencies),
    e !== null && (e.firstContext = null));
}
function We(e) {
  return Zp($a, e);
}
function Yi(e, t) {
  return ($a === null && Ha(e), Zp(e, t));
}
function Zp(e, t) {
  var n = t._currentValue;
  if (((t = { context: t, memoizedValue: n, next: null }), Mn === null)) {
    if (e === null) throw Error(k(308));
    ((Mn = t),
      (e.dependencies = { lanes: 0, firstContext: t }),
      (e.flags |= 524288));
  } else Mn = Mn.next = t;
  return n;
}
var kx =
    typeof AbortController < "u"
      ? AbortController
      : function () {
          var e = [],
            t = (this.signal = {
              aborted: !1,
              addEventListener: function (n, a) {
                e.push(a);
              },
            });
          this.abort = function () {
            ((t.aborted = !0),
              e.forEach(function (n) {
                return n();
              }));
          };
        },
  Nx = Pe.unstable_scheduleCallback,
  _x = Pe.unstable_NormalPriority,
  je = {
    $$typeof: Tn,
    Consumer: null,
    Provider: null,
    _currentValue: null,
    _currentValue2: null,
    _threadCount: 0,
  };
function qf() {
  return { controller: new kx(), data: new Map(), refCount: 0 };
}
function Si(e) {
  (e.refCount--,
    e.refCount === 0 &&
      Nx(_x, function () {
        e.controller.abort();
      }));
}
var _r = null,
  Nu = 0,
  Ho = 0,
  Oo = null;
function Lx(e, t) {
  if (_r === null) {
    var n = (_r = []);
    ((Nu = 0),
      (Ho = yd()),
      (Oo = {
        status: "pending",
        value: void 0,
        then: function (a) {
          n.push(a);
        },
      }));
  }
  return (Nu++, t.then(Um, Um), t);
}
function Um() {
  if (--Nu === 0 && _r !== null) {
    Oo !== null && (Oo.status = "fulfilled");
    var e = _r;
    ((_r = null), (Ho = 0), (Oo = null));
    for (var t = 0; t < e.length; t++) (0, e[t])();
  }
}
function zx(e, t) {
  var n = [],
    a = {
      status: "pending",
      value: null,
      reason: null,
      then: function (o) {
        n.push(o);
      },
    };
  return (
    e.then(
      function () {
        ((a.status = "fulfilled"), (a.value = t));
        for (var o = 0; o < n.length; o++) (0, n[o])(t);
      },
      function (o) {
        for (a.status = "rejected", a.reason = o, o = 0; o < n.length; o++)
          (0, n[o])(void 0);
      },
    ),
    a
  );
}
var Hm = K.S;
K.S = function (e, t) {
  ((fy = Rt()),
    typeof t == "object" &&
      t !== null &&
      typeof t.then == "function" &&
      Lx(e, t),
    Hm !== null && Hm(e, t));
};
var La = mn(null);
function Xf() {
  var e = La.current;
  return e !== null ? e : ve.pooledCache;
}
function vl(e, t) {
  t === null ? Se(La, La.current) : Se(La, t.pool);
}
function Jp() {
  var e = Xf();
  return e === null ? null : { parent: je._currentValue, pool: e };
}
var er = Error(k(460)),
  $f = Error(k(474)),
  zs = Error(k(542)),
  Gl = { then: function () {} };
function Pm(e) {
  return ((e = e.status), e === "fulfilled" || e === "rejected");
}
function Wp(e, t, n) {
  switch (
    ((n = e[n]),
    n === void 0 ? e.push(t) : n !== t && (t.then(Rn, Rn), (t = n)),
    t.status)
  ) {
    case "fulfilled":
      return t.value;
    case "rejected":
      throw ((e = t.reason), Im(e), e);
    default:
      if (typeof t.status == "string") t.then(Rn, Rn);
      else {
        if (((e = ve), e !== null && 100 < e.shellSuspendCounter))
          throw Error(k(482));
        ((e = t),
          (e.status = "pending"),
          e.then(
            function (a) {
              if (t.status === "pending") {
                var o = t;
                ((o.status = "fulfilled"), (o.value = a));
              }
            },
            function (a) {
              if (t.status === "pending") {
                var o = t;
                ((o.status = "rejected"), (o.reason = a));
              }
            },
          ));
      }
      switch (t.status) {
        case "fulfilled":
          return t.value;
        case "rejected":
          throw ((e = t.reason), Im(e), e);
      }
      throw ((za = t), er);
  }
}
function Da(e) {
  try {
    var t = e._init;
    return t(e._payload);
  } catch (n) {
    throw n !== null && typeof n == "object" && typeof n.then == "function"
      ? ((za = n), er)
      : n;
  }
}
var za = null;
function Vm() {
  if (za === null) throw Error(k(459));
  var e = za;
  return ((za = null), e);
}
function Im(e) {
  if (e === er || e === zs) throw Error(k(483));
}
var ko = null,
  Jr = 0;
function Fi(e) {
  var t = Jr;
  return ((Jr += 1), ko === null && (ko = []), Wp(ko, e, t));
}
function dr(e, t) {
  ((t = t.props.ref), (e.ref = t !== void 0 ? t : null));
}
function Ki(e, t) {
  throw t.$$typeof === ww
    ? Error(k(525))
    : ((e = Object.prototype.toString.call(t)),
      Error(
        k(
          31,
          e === "[object Object]"
            ? "object with keys {" + Object.keys(t).join(", ") + "}"
            : e,
        ),
      ));
}
function ev(e) {
  function t(m, h) {
    if (e) {
      var y = m.deletions;
      y === null ? ((m.deletions = [h]), (m.flags |= 16)) : y.push(h);
    }
  }
  function n(m, h) {
    if (!e) return null;
    for (; h !== null; ) (t(m, h), (h = h.sibling));
    return null;
  }
  function a(m) {
    for (var h = new Map(); m !== null; )
      (m.key !== null ? h.set(m.key, m) : h.set(m.index, m), (m = m.sibling));
    return h;
  }
  function o(m, h) {
    return ((m = Dn(m, h)), (m.index = 0), (m.sibling = null), m);
  }
  function r(m, h, y) {
    return (
      (m.index = y),
      e
        ? ((y = m.alternate),
          y !== null
            ? ((y = y.index), y < h ? ((m.flags |= 67108866), h) : y)
            : ((m.flags |= 67108866), h))
        : ((m.flags |= 1048576), h)
    );
  }
  function i(m) {
    return (e && m.alternate === null && (m.flags |= 67108866), m);
  }
  function l(m, h, y, w) {
    return h === null || h.tag !== 6
      ? ((h = Ac(y, m.mode, w)), (h.return = m), h)
      : ((h = o(h, y)), (h.return = m), h);
  }
  function s(m, h, y, w) {
    var C = y.type;
    return C === ho
      ? f(m, h, y.props.children, w, y.key)
      : h !== null &&
          (h.elementType === C ||
            (typeof C == "object" &&
              C !== null &&
              C.$$typeof === Kn &&
              Da(C) === h.type))
        ? ((h = o(h, y.props)), dr(h, y), (h.return = m), h)
        : ((h = pl(y.type, y.key, y.props, null, m.mode, w)),
          dr(h, y),
          (h.return = m),
          h);
  }
  function c(m, h, y, w) {
    return h === null ||
      h.tag !== 4 ||
      h.stateNode.containerInfo !== y.containerInfo ||
      h.stateNode.implementation !== y.implementation
      ? ((h = Tc(y, m.mode, w)), (h.return = m), h)
      : ((h = o(h, y.children || [])), (h.return = m), h);
  }
  function f(m, h, y, w, C) {
    return h === null || h.tag !== 7
      ? ((h = _a(y, m.mode, w, C)), (h.return = m), h)
      : ((h = o(h, y)), (h.return = m), h);
  }
  function u(m, h, y) {
    if (
      (typeof h == "string" && h !== "") ||
      typeof h == "number" ||
      typeof h == "bigint"
    )
      return ((h = Ac("" + h, m.mode, y)), (h.return = m), h);
    if (typeof h == "object" && h !== null) {
      switch (h.$$typeof) {
        case Ui:
          return (
            (y = pl(h.type, h.key, h.props, null, m.mode, y)),
            dr(y, h),
            (y.return = m),
            y
          );
        case Er:
          return ((h = Tc(h, m.mode, y)), (h.return = m), h);
        case Kn:
          return ((h = Da(h)), u(m, h, y));
      }
      if (Cr(h) || cr(h))
        return ((h = _a(h, m.mode, y, null)), (h.return = m), h);
      if (typeof h.then == "function") return u(m, Fi(h), y);
      if (h.$$typeof === Tn) return u(m, Yi(m, h), y);
      Ki(m, h);
    }
    return null;
  }
  function d(m, h, y, w) {
    var C = h !== null ? h.key : null;
    if (
      (typeof y == "string" && y !== "") ||
      typeof y == "number" ||
      typeof y == "bigint"
    )
      return C !== null ? null : l(m, h, "" + y, w);
    if (typeof y == "object" && y !== null) {
      switch (y.$$typeof) {
        case Ui:
          return y.key === C ? s(m, h, y, w) : null;
        case Er:
          return y.key === C ? c(m, h, y, w) : null;
        case Kn:
          return ((y = Da(y)), d(m, h, y, w));
      }
      if (Cr(y) || cr(y)) return C !== null ? null : f(m, h, y, w, null);
      if (typeof y.then == "function") return d(m, h, Fi(y), w);
      if (y.$$typeof === Tn) return d(m, h, Yi(m, y), w);
      Ki(m, y);
    }
    return null;
  }
  function g(m, h, y, w, C) {
    if (
      (typeof w == "string" && w !== "") ||
      typeof w == "number" ||
      typeof w == "bigint"
    )
      return ((m = m.get(y) || null), l(h, m, "" + w, C));
    if (typeof w == "object" && w !== null) {
      switch (w.$$typeof) {
        case Ui:
          return (
            (m = m.get(w.key === null ? y : w.key) || null),
            s(h, m, w, C)
          );
        case Er:
          return (
            (m = m.get(w.key === null ? y : w.key) || null),
            c(h, m, w, C)
          );
        case Kn:
          return ((w = Da(w)), g(m, h, y, w, C));
      }
      if (Cr(w) || cr(w)) return ((m = m.get(y) || null), f(h, m, w, C, null));
      if (typeof w.then == "function") return g(m, h, y, Fi(w), C);
      if (w.$$typeof === Tn) return g(m, h, y, Yi(h, w), C);
      Ki(h, w);
    }
    return null;
  }
  function S(m, h, y, w) {
    for (
      var C = null, R = null, E = h, A = (h = 0), O = null;
      E !== null && A < y.length;
      A++
    ) {
      E.index > A ? ((O = E), (E = null)) : (O = E.sibling);
      var N = d(m, E, y[A], w);
      if (N === null) {
        E === null && (E = O);
        break;
      }
      (e && E && N.alternate === null && t(m, E),
        (h = r(N, h, A)),
        R === null ? (C = N) : (R.sibling = N),
        (R = N),
        (E = O));
    }
    if (A === y.length) return (n(m, E), ie && Cn(m, A), C);
    if (E === null) {
      for (; A < y.length; A++)
        ((E = u(m, y[A], w)),
          E !== null &&
            ((h = r(E, h, A)),
            R === null ? (C = E) : (R.sibling = E),
            (R = E)));
      return (ie && Cn(m, A), C);
    }
    for (E = a(E); A < y.length; A++)
      ((O = g(E, m, A, y[A], w)),
        O !== null &&
          (e && O.alternate !== null && E.delete(O.key === null ? A : O.key),
          (h = r(O, h, A)),
          R === null ? (C = O) : (R.sibling = O),
          (R = O)));
    return (
      e &&
        E.forEach(function (B) {
          return t(m, B);
        }),
      ie && Cn(m, A),
      C
    );
  }
  function v(m, h, y, w) {
    if (y == null) throw Error(k(151));
    for (
      var C = null, R = null, E = h, A = (h = 0), O = null, N = y.next();
      E !== null && !N.done;
      A++, N = y.next()
    ) {
      E.index > A ? ((O = E), (E = null)) : (O = E.sibling);
      var B = d(m, E, N.value, w);
      if (B === null) {
        E === null && (E = O);
        break;
      }
      (e && E && B.alternate === null && t(m, E),
        (h = r(B, h, A)),
        R === null ? (C = B) : (R.sibling = B),
        (R = B),
        (E = O));
    }
    if (N.done) return (n(m, E), ie && Cn(m, A), C);
    if (E === null) {
      for (; !N.done; A++, N = y.next())
        ((N = u(m, N.value, w)),
          N !== null &&
            ((h = r(N, h, A)),
            R === null ? (C = N) : (R.sibling = N),
            (R = N)));
      return (ie && Cn(m, A), C);
    }
    for (E = a(E); !N.done; A++, N = y.next())
      ((N = g(E, m, A, N.value, w)),
        N !== null &&
          (e && N.alternate !== null && E.delete(N.key === null ? A : N.key),
          (h = r(N, h, A)),
          R === null ? (C = N) : (R.sibling = N),
          (R = N)));
    return (
      e &&
        E.forEach(function (z) {
          return t(m, z);
        }),
      ie && Cn(m, A),
      C
    );
  }
  function b(m, h, y, w) {
    if (
      (typeof y == "object" &&
        y !== null &&
        y.type === ho &&
        y.key === null &&
        (y = y.props.children),
      typeof y == "object" && y !== null)
    ) {
      switch (y.$$typeof) {
        case Ui:
          e: {
            for (var C = y.key; h !== null; ) {
              if (h.key === C) {
                if (((C = y.type), C === ho)) {
                  if (h.tag === 7) {
                    (n(m, h.sibling),
                      (w = o(h, y.props.children)),
                      (w.return = m),
                      (m = w));
                    break e;
                  }
                } else if (
                  h.elementType === C ||
                  (typeof C == "object" &&
                    C !== null &&
                    C.$$typeof === Kn &&
                    Da(C) === h.type)
                ) {
                  (n(m, h.sibling),
                    (w = o(h, y.props)),
                    dr(w, y),
                    (w.return = m),
                    (m = w));
                  break e;
                }
                n(m, h);
                break;
              } else t(m, h);
              h = h.sibling;
            }
            y.type === ho
              ? ((w = _a(y.props.children, m.mode, w, y.key)),
                (w.return = m),
                (m = w))
              : ((w = pl(y.type, y.key, y.props, null, m.mode, w)),
                dr(w, y),
                (w.return = m),
                (m = w));
          }
          return i(m);
        case Er:
          e: {
            for (C = y.key; h !== null; ) {
              if (h.key === C)
                if (
                  h.tag === 4 &&
                  h.stateNode.containerInfo === y.containerInfo &&
                  h.stateNode.implementation === y.implementation
                ) {
                  (n(m, h.sibling),
                    (w = o(h, y.children || [])),
                    (w.return = m),
                    (m = w));
                  break e;
                } else {
                  n(m, h);
                  break;
                }
              else t(m, h);
              h = h.sibling;
            }
            ((w = Tc(y, m.mode, w)), (w.return = m), (m = w));
          }
          return i(m);
        case Kn:
          return ((y = Da(y)), b(m, h, y, w));
      }
      if (Cr(y)) return S(m, h, y, w);
      if (cr(y)) {
        if (((C = cr(y)), typeof C != "function")) throw Error(k(150));
        return ((y = C.call(y)), v(m, h, y, w));
      }
      if (typeof y.then == "function") return b(m, h, Fi(y), w);
      if (y.$$typeof === Tn) return b(m, h, Yi(m, y), w);
      Ki(m, y);
    }
    return (typeof y == "string" && y !== "") ||
      typeof y == "number" ||
      typeof y == "bigint"
      ? ((y = "" + y),
        h !== null && h.tag === 6
          ? (n(m, h.sibling), (w = o(h, y)), (w.return = m), (m = w))
          : (n(m, h), (w = Ac(y, m.mode, w)), (w.return = m), (m = w)),
        i(m))
      : n(m, h);
  }
  return function (m, h, y, w) {
    try {
      Jr = 0;
      var C = b(m, h, y, w);
      return ((ko = null), C);
    } catch (E) {
      if (E === er || E === zs) throw E;
      var R = At(29, E, null, m.mode);
      return ((R.lanes = w), (R.return = m), R);
    } finally {
    }
  };
}
var Pa = ev(!0),
  tv = ev(!1),
  qn = !1;
function Qf(e) {
  e.updateQueue = {
    baseState: e.memoizedState,
    firstBaseUpdate: null,
    lastBaseUpdate: null,
    shared: { pending: null, lanes: 0, hiddenCallbacks: null },
    callbacks: null,
  };
}
function _u(e, t) {
  ((e = e.updateQueue),
    t.updateQueue === e &&
      (t.updateQueue = {
        baseState: e.baseState,
        firstBaseUpdate: e.firstBaseUpdate,
        lastBaseUpdate: e.lastBaseUpdate,
        shared: e.shared,
        callbacks: null,
      }));
}
function ra(e) {
  return { lane: e, tag: 0, payload: null, callback: null, next: null };
}
function ia(e, t, n) {
  var a = e.updateQueue;
  if (a === null) return null;
  if (((a = a.shared), ce & 2)) {
    var o = a.pending;
    return (
      o === null ? (t.next = t) : ((t.next = o.next), (o.next = t)),
      (a.pending = t),
      (t = Pl(e)),
      Kp(e, null, n),
      t
    );
  }
  return (Ls(e, a, t, n), Pl(e));
}
function Lr(e, t, n) {
  if (
    ((t = t.updateQueue), t !== null && ((t = t.shared), (n & 4194048) !== 0))
  ) {
    var a = t.lanes;
    ((a &= e.pendingLanes), (n |= a), (t.lanes = n), bp(e, n));
  }
}
function Mc(e, t) {
  var n = e.updateQueue,
    a = e.alternate;
  if (a !== null && ((a = a.updateQueue), n === a)) {
    var o = null,
      r = null;
    if (((n = n.firstBaseUpdate), n !== null)) {
      do {
        var i = {
          lane: n.lane,
          tag: n.tag,
          payload: n.payload,
          callback: null,
          next: null,
        };
        (r === null ? (o = r = i) : (r = r.next = i), (n = n.next));
      } while (n !== null);
      r === null ? (o = r = t) : (r = r.next = t);
    } else o = r = t;
    ((n = {
      baseState: a.baseState,
      firstBaseUpdate: o,
      lastBaseUpdate: r,
      shared: a.shared,
      callbacks: a.callbacks,
    }),
      (e.updateQueue = n));
    return;
  }
  ((e = n.lastBaseUpdate),
    e === null ? (n.firstBaseUpdate = t) : (e.next = t),
    (n.lastBaseUpdate = t));
}
var Lu = !1;
function zr() {
  if (Lu) {
    var e = Oo;
    if (e !== null) throw e;
  }
}
function jr(e, t, n, a) {
  Lu = !1;
  var o = e.updateQueue;
  qn = !1;
  var r = o.firstBaseUpdate,
    i = o.lastBaseUpdate,
    l = o.shared.pending;
  if (l !== null) {
    o.shared.pending = null;
    var s = l,
      c = s.next;
    ((s.next = null), i === null ? (r = c) : (i.next = c), (i = s));
    var f = e.alternate;
    f !== null &&
      ((f = f.updateQueue),
      (l = f.lastBaseUpdate),
      l !== i &&
        (l === null ? (f.firstBaseUpdate = c) : (l.next = c),
        (f.lastBaseUpdate = s)));
  }
  if (r !== null) {
    var u = o.baseState;
    ((i = 0), (f = c = s = null), (l = r));
    do {
      var d = l.lane & -536870913,
        g = d !== l.lane;
      if (g ? (re & d) === d : (a & d) === d) {
        (d !== 0 && d === Ho && (Lu = !0),
          f !== null &&
            (f = f.next =
              {
                lane: 0,
                tag: l.tag,
                payload: l.payload,
                callback: null,
                next: null,
              }));
        e: {
          var S = e,
            v = l;
          d = t;
          var b = n;
          switch (v.tag) {
            case 1:
              if (((S = v.payload), typeof S == "function")) {
                u = S.call(b, u, d);
                break e;
              }
              u = S;
              break e;
            case 3:
              S.flags = (S.flags & -65537) | 128;
            case 0:
              if (
                ((S = v.payload),
                (d = typeof S == "function" ? S.call(b, u, d) : S),
                d == null)
              )
                break e;
              u = Ce({}, u, d);
              break e;
            case 2:
              qn = !0;
          }
        }
        ((d = l.callback),
          d !== null &&
            ((e.flags |= 64),
            g && (e.flags |= 8192),
            (g = o.callbacks),
            g === null ? (o.callbacks = [d]) : g.push(d)));
      } else
        ((g = {
          lane: d,
          tag: l.tag,
          payload: l.payload,
          callback: l.callback,
          next: null,
        }),
          f === null ? ((c = f = g), (s = u)) : (f = f.next = g),
          (i |= d));
      if (((l = l.next), l === null)) {
        if (((l = o.shared.pending), l === null)) break;
        ((g = l),
          (l = g.next),
          (g.next = null),
          (o.lastBaseUpdate = g),
          (o.shared.pending = null));
      }
    } while (!0);
    (f === null && (s = u),
      (o.baseState = s),
      (o.firstBaseUpdate = c),
      (o.lastBaseUpdate = f),
      r === null && (o.shared.lanes = 0),
      (pa |= i),
      (e.lanes = i),
      (e.memoizedState = u));
  }
}
function nv(e, t) {
  if (typeof e != "function") throw Error(k(191, e));
  e.call(t);
}
function av(e, t) {
  var n = e.callbacks;
  if (n !== null)
    for (e.callbacks = null, e = 0; e < n.length; e++) nv(n[e], t);
}
var Po = mn(null),
  Yl = mn(0);
function Gm(e, t) {
  ((e = jn), Se(Yl, e), Se(Po, t), (jn = e | t.baseLanes));
}
function zu() {
  (Se(Yl, jn), Se(Po, Po.current));
}
function Zf() {
  ((jn = Yl.current), Fe(Po), Fe(Yl));
}
var _t = mn(null),
  Gt = null;
function $n(e) {
  var t = e.alternate;
  (Se(Ne, Ne.current & 1),
    Se(_t, e),
    Gt === null &&
      (t === null || Po.current !== null || t.memoizedState !== null) &&
      (Gt = e));
}
function ju(e) {
  (Se(Ne, Ne.current), Se(_t, e), Gt === null && (Gt = e));
}
function ov(e) {
  e.tag === 22
    ? (Se(Ne, Ne.current), Se(_t, e), Gt === null && (Gt = e))
    : Qn();
}
function Qn() {
  (Se(Ne, Ne.current), Se(_t, _t.current));
}
function Et(e) {
  (Fe(_t), Gt === e && (Gt = null), Fe(Ne));
}
var Ne = mn(0);
function Fl(e) {
  for (var t = e; t !== null; ) {
    if (t.tag === 13) {
      var n = t.memoizedState;
      if (n !== null && ((n = n.dehydrated), n === null || tf(n) || nf(n)))
        return t;
    } else if (
      t.tag === 19 &&
      (t.memoizedProps.revealOrder === "forwards" ||
        t.memoizedProps.revealOrder === "backwards" ||
        t.memoizedProps.revealOrder === "unstable_legacy-backwards" ||
        t.memoizedProps.revealOrder === "together")
    ) {
      if (t.flags & 128) return t;
    } else if (t.child !== null) {
      ((t.child.return = t), (t = t.child));
      continue;
    }
    if (t === e) break;
    for (; t.sibling === null; ) {
      if (t.return === null || t.return === e) return null;
      t = t.return;
    }
    ((t.sibling.return = t.return), (t = t.sibling));
  }
  return null;
}
var _n = 0,
  J = null,
  he = null,
  Le = null,
  Kl = !1,
  No = !1,
  Va = !1,
  ql = 0,
  Wr = 0,
  _o = null,
  jx = 0;
function Oe() {
  throw Error(k(321));
}
function Jf(e, t) {
  if (t === null) return !1;
  for (var n = 0; n < t.length && n < e.length; n++)
    if (!Nt(e[n], t[n])) return !1;
  return !0;
}
function Wf(e, t, n, a, o, r) {
  return (
    (_n = r),
    (J = t),
    (t.memoizedState = null),
    (t.updateQueue = null),
    (t.lanes = 0),
    (K.H = e === null || e.memoizedState === null ? zv : ud),
    (Va = !1),
    (r = n(a, o)),
    (Va = !1),
    No && (r = iv(t, n, a, o)),
    rv(e),
    r
  );
}
function rv(e) {
  K.H = ei;
  var t = he !== null && he.next !== null;
  if (((_n = 0), (Le = he = J = null), (Kl = !1), (Wr = 0), (_o = null), t))
    throw Error(k(300));
  e === null || Be || ((e = e.dependencies), e !== null && Il(e) && (Be = !0));
}
function iv(e, t, n, a) {
  J = e;
  var o = 0;
  do {
    if ((No && (_o = null), (Wr = 0), (No = !1), 25 <= o)) throw Error(k(301));
    if (((o += 1), (Le = he = null), e.updateQueue != null)) {
      var r = e.updateQueue;
      ((r.lastEffect = null),
        (r.events = null),
        (r.stores = null),
        r.memoCache != null && (r.memoCache.index = 0));
    }
    ((K.H = jv), (r = t(n, a)));
  } while (No);
  return r;
}
function Bx() {
  var e = K.H,
    t = e.useState()[0];
  return (
    (t = typeof t.then == "function" ? wi(t) : t),
    (e = e.useState()[0]),
    (he !== null ? he.memoizedState : null) !== e && (J.flags |= 1024),
    t
  );
}
function ed() {
  var e = ql !== 0;
  return ((ql = 0), e);
}
function td(e, t, n) {
  ((t.updateQueue = e.updateQueue), (t.flags &= -2053), (e.lanes &= ~n));
}
function nd(e) {
  if (Kl) {
    for (e = e.memoizedState; e !== null; ) {
      var t = e.queue;
      (t !== null && (t.pending = null), (e = e.next));
    }
    Kl = !1;
  }
  ((_n = 0), (Le = he = J = null), (No = !1), (Wr = ql = 0), (_o = null));
}
function rt() {
  var e = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null,
  };
  return (Le === null ? (J.memoizedState = Le = e) : (Le = Le.next = e), Le);
}
function _e() {
  if (he === null) {
    var e = J.alternate;
    e = e !== null ? e.memoizedState : null;
  } else e = he.next;
  var t = Le === null ? J.memoizedState : Le.next;
  if (t !== null) ((Le = t), (he = e));
  else {
    if (e === null) throw J.alternate === null ? Error(k(467)) : Error(k(310));
    ((he = e),
      (e = {
        memoizedState: he.memoizedState,
        baseState: he.baseState,
        baseQueue: he.baseQueue,
        queue: he.queue,
        next: null,
      }),
      Le === null ? (J.memoizedState = Le = e) : (Le = Le.next = e));
  }
  return Le;
}
function js() {
  return { lastEffect: null, events: null, stores: null, memoCache: null };
}
function wi(e) {
  var t = Wr;
  return (
    (Wr += 1),
    _o === null && (_o = []),
    (e = Wp(_o, e, t)),
    (t = J),
    (Le === null ? t.memoizedState : Le.next) === null &&
      ((t = t.alternate),
      (K.H = t === null || t.memoizedState === null ? zv : ud)),
    e
  );
}
function Bs(e) {
  if (e !== null && typeof e == "object") {
    if (typeof e.then == "function") return wi(e);
    if (e.$$typeof === Tn) return We(e);
  }
  throw Error(k(438, String(e)));
}
function ad(e) {
  var t = null,
    n = J.updateQueue;
  if ((n !== null && (t = n.memoCache), t == null)) {
    var a = J.alternate;
    a !== null &&
      ((a = a.updateQueue),
      a !== null &&
        ((a = a.memoCache),
        a != null &&
          (t = {
            data: a.data.map(function (o) {
              return o.slice();
            }),
            index: 0,
          })));
  }
  if (
    (t == null && (t = { data: [], index: 0 }),
    n === null && ((n = js()), (J.updateQueue = n)),
    (n.memoCache = t),
    (n = t.data[t.index]),
    n === void 0)
  )
    for (n = t.data[t.index] = Array(e), a = 0; a < e; a++) n[a] = xw;
  return (t.index++, n);
}
function Ln(e, t) {
  return typeof t == "function" ? t(e) : t;
}
function yl(e) {
  var t = _e();
  return od(t, he, e);
}
function od(e, t, n) {
  var a = e.queue;
  if (a === null) throw Error(k(311));
  a.lastRenderedReducer = n;
  var o = e.baseQueue,
    r = a.pending;
  if (r !== null) {
    if (o !== null) {
      var i = o.next;
      ((o.next = r.next), (r.next = i));
    }
    ((t.baseQueue = o = r), (a.pending = null));
  }
  if (((r = e.baseState), o === null)) e.memoizedState = r;
  else {
    t = o.next;
    var l = (i = null),
      s = null,
      c = t,
      f = !1;
    do {
      var u = c.lane & -536870913;
      if (u !== c.lane ? (re & u) === u : (_n & u) === u) {
        var d = c.revertLane;
        if (d === 0)
          (s !== null &&
            (s = s.next =
              {
                lane: 0,
                revertLane: 0,
                gesture: null,
                action: c.action,
                hasEagerState: c.hasEagerState,
                eagerState: c.eagerState,
                next: null,
              }),
            u === Ho && (f = !0));
        else if ((_n & d) === d) {
          ((c = c.next), d === Ho && (f = !0));
          continue;
        } else
          ((u = {
            lane: 0,
            revertLane: c.revertLane,
            gesture: null,
            action: c.action,
            hasEagerState: c.hasEagerState,
            eagerState: c.eagerState,
            next: null,
          }),
            s === null ? ((l = s = u), (i = r)) : (s = s.next = u),
            (J.lanes |= d),
            (pa |= d));
        ((u = c.action),
          Va && n(r, u),
          (r = c.hasEagerState ? c.eagerState : n(r, u)));
      } else
        ((d = {
          lane: u,
          revertLane: c.revertLane,
          gesture: c.gesture,
          action: c.action,
          hasEagerState: c.hasEagerState,
          eagerState: c.eagerState,
          next: null,
        }),
          s === null ? ((l = s = d), (i = r)) : (s = s.next = d),
          (J.lanes |= u),
          (pa |= u));
      c = c.next;
    } while (c !== null && c !== t);
    if (
      (s === null ? (i = r) : (s.next = l),
      !Nt(r, e.memoizedState) && ((Be = !0), f && ((n = Oo), n !== null)))
    )
      throw n;
    ((e.memoizedState = r),
      (e.baseState = i),
      (e.baseQueue = s),
      (a.lastRenderedState = r));
  }
  return (o === null && (a.lanes = 0), [e.memoizedState, a.dispatch]);
}
function Dc(e) {
  var t = _e(),
    n = t.queue;
  if (n === null) throw Error(k(311));
  n.lastRenderedReducer = e;
  var a = n.dispatch,
    o = n.pending,
    r = t.memoizedState;
  if (o !== null) {
    n.pending = null;
    var i = (o = o.next);
    do ((r = e(r, i.action)), (i = i.next));
    while (i !== o);
    (Nt(r, t.memoizedState) || (Be = !0),
      (t.memoizedState = r),
      t.baseQueue === null && (t.baseState = r),
      (n.lastRenderedState = r));
  }
  return [r, a];
}
function lv(e, t, n) {
  var a = J,
    o = _e(),
    r = ie;
  if (r) {
    if (n === void 0) throw Error(k(407));
    n = n();
  } else n = t();
  var i = !Nt((he || o).memoizedState, n);
  if (
    (i && ((o.memoizedState = n), (Be = !0)),
    (o = o.queue),
    rd(uv.bind(null, a, o, e), [e]),
    o.getSnapshot !== t || i || (Le !== null && Le.memoizedState.tag & 1))
  ) {
    if (
      ((a.flags |= 2048),
      Vo(9, { destroy: void 0 }, cv.bind(null, a, o, n, t), null),
      ve === null)
    )
      throw Error(k(349));
    r || _n & 127 || sv(a, t, n);
  }
  return n;
}
function sv(e, t, n) {
  ((e.flags |= 16384),
    (e = { getSnapshot: t, value: n }),
    (t = J.updateQueue),
    t === null
      ? ((t = js()), (J.updateQueue = t), (t.stores = [e]))
      : ((n = t.stores), n === null ? (t.stores = [e]) : n.push(e)));
}
function cv(e, t, n, a) {
  ((t.value = n), (t.getSnapshot = a), fv(t) && dv(e));
}
function uv(e, t, n) {
  return n(function () {
    fv(t) && dv(e);
  });
}
function fv(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var n = t();
    return !Nt(e, n);
  } catch {
    return !0;
  }
}
function dv(e) {
  var t = Xa(e, 2);
  t !== null && pt(t, e, 2);
}
function Bu(e) {
  var t = rt();
  if (typeof e == "function") {
    var n = e;
    if (((e = n()), Va)) {
      Jn(!0);
      try {
        n();
      } finally {
        Jn(!1);
      }
    }
  }
  return (
    (t.memoizedState = t.baseState = e),
    (t.queue = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: Ln,
      lastRenderedState: e,
    }),
    t
  );
}
function mv(e, t, n, a) {
  return ((e.baseState = n), od(e, he, typeof a == "function" ? a : Ln));
}
function Ux(e, t, n, a, o) {
  if (Hs(e)) throw Error(k(485));
  if (((e = t.action), e !== null)) {
    var r = {
      payload: o,
      action: e,
      next: null,
      isTransition: !0,
      status: "pending",
      value: null,
      reason: null,
      listeners: [],
      then: function (i) {
        r.listeners.push(i);
      },
    };
    (K.T !== null ? n(!0) : (r.isTransition = !1),
      a(r),
      (n = t.pending),
      n === null
        ? ((r.next = t.pending = r), gv(t, r))
        : ((r.next = n.next), (t.pending = n.next = r)));
  }
}
function gv(e, t) {
  var n = t.action,
    a = t.payload,
    o = e.state;
  if (t.isTransition) {
    var r = K.T,
      i = {};
    K.T = i;
    try {
      var l = n(o, a),
        s = K.S;
      (s !== null && s(i, l), Ym(e, t, l));
    } catch (c) {
      Uu(e, t, c);
    } finally {
      (r !== null && i.types !== null && (r.types = i.types), (K.T = r));
    }
  } else
    try {
      ((r = n(o, a)), Ym(e, t, r));
    } catch (c) {
      Uu(e, t, c);
    }
}
function Ym(e, t, n) {
  n !== null && typeof n == "object" && typeof n.then == "function"
    ? n.then(
        function (a) {
          Fm(e, t, a);
        },
        function (a) {
          return Uu(e, t, a);
        },
      )
    : Fm(e, t, n);
}
function Fm(e, t, n) {
  ((t.status = "fulfilled"),
    (t.value = n),
    hv(t),
    (e.state = n),
    (t = e.pending),
    t !== null &&
      ((n = t.next),
      n === t ? (e.pending = null) : ((n = n.next), (t.next = n), gv(e, n))));
}
function Uu(e, t, n) {
  var a = e.pending;
  if (((e.pending = null), a !== null)) {
    a = a.next;
    do ((t.status = "rejected"), (t.reason = n), hv(t), (t = t.next));
    while (t !== a);
  }
  e.action = null;
}
function hv(e) {
  e = e.listeners;
  for (var t = 0; t < e.length; t++) (0, e[t])();
}
function pv(e, t) {
  return t;
}
function Km(e, t) {
  if (ie) {
    var n = ve.formState;
    if (n !== null) {
      e: {
        var a = J;
        if (ie) {
          if (xe) {
            t: {
              for (var o = xe, r = It; o.nodeType !== 8; ) {
                if (!r) {
                  o = null;
                  break t;
                }
                if (((o = Yt(o.nextSibling)), o === null)) {
                  o = null;
                  break t;
                }
              }
              ((r = o.data), (o = r === "F!" || r === "F" ? o : null));
            }
            if (o) {
              ((xe = Yt(o.nextSibling)), (a = o.data === "F!"));
              break e;
            }
          }
          ga(a);
        }
        a = !1;
      }
      a && (t = n[0]);
    }
  }
  return (
    (n = rt()),
    (n.memoizedState = n.baseState = t),
    (a = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: pv,
      lastRenderedState: t,
    }),
    (n.queue = a),
    (n = Nv.bind(null, J, a)),
    (a.dispatch = n),
    (a = Bu(!1)),
    (r = cd.bind(null, J, !1, a.queue)),
    (a = rt()),
    (o = { state: t, dispatch: null, action: e, pending: null }),
    (a.queue = o),
    (n = Ux.bind(null, J, o, r, n)),
    (o.dispatch = n),
    (a.memoizedState = e),
    [t, n, !1]
  );
}
function qm(e) {
  var t = _e();
  return vv(t, he, e);
}
function vv(e, t, n) {
  if (
    ((t = od(e, t, pv)[0]),
    (e = yl(Ln)[0]),
    typeof t == "object" && t !== null && typeof t.then == "function")
  )
    try {
      var a = wi(t);
    } catch (i) {
      throw i === er ? zs : i;
    }
  else a = t;
  t = _e();
  var o = t.queue,
    r = o.dispatch;
  return (
    n !== t.memoizedState &&
      ((J.flags |= 2048),
      Vo(9, { destroy: void 0 }, Hx.bind(null, o, n), null)),
    [a, r, e]
  );
}
function Hx(e, t) {
  e.action = t;
}
function Xm(e) {
  var t = _e(),
    n = he;
  if (n !== null) return vv(t, n, e);
  (_e(), (t = t.memoizedState), (n = _e()));
  var a = n.queue.dispatch;
  return ((n.memoizedState = e), [t, a, !1]);
}
function Vo(e, t, n, a) {
  return (
    (e = { tag: e, create: n, deps: a, inst: t, next: null }),
    (t = J.updateQueue),
    t === null && ((t = js()), (J.updateQueue = t)),
    (n = t.lastEffect),
    n === null
      ? (t.lastEffect = e.next = e)
      : ((a = n.next), (n.next = e), (e.next = a), (t.lastEffect = e)),
    e
  );
}
function yv() {
  return _e().memoizedState;
}
function bl(e, t, n, a) {
  var o = rt();
  ((J.flags |= e),
    (o.memoizedState = Vo(
      1 | t,
      { destroy: void 0 },
      n,
      a === void 0 ? null : a,
    )));
}
function Us(e, t, n, a) {
  var o = _e();
  a = a === void 0 ? null : a;
  var r = o.memoizedState.inst;
  he !== null && a !== null && Jf(a, he.memoizedState.deps)
    ? (o.memoizedState = Vo(t, r, n, a))
    : ((J.flags |= e), (o.memoizedState = Vo(1 | t, r, n, a)));
}
function $m(e, t) {
  bl(8390656, 8, e, t);
}
function rd(e, t) {
  Us(2048, 8, e, t);
}
function Px(e) {
  J.flags |= 4;
  var t = J.updateQueue;
  if (t === null) ((t = js()), (J.updateQueue = t), (t.events = [e]));
  else {
    var n = t.events;
    n === null ? (t.events = [e]) : n.push(e);
  }
}
function bv(e) {
  var t = _e().memoizedState;
  return (
    Px({ ref: t, nextImpl: e }),
    function () {
      if (ce & 2) throw Error(k(440));
      return t.impl.apply(void 0, arguments);
    }
  );
}
function Sv(e, t) {
  return Us(4, 2, e, t);
}
function wv(e, t) {
  return Us(4, 4, e, t);
}
function xv(e, t) {
  if (typeof t == "function") {
    e = e();
    var n = t(e);
    return function () {
      typeof n == "function" ? n() : t(null);
    };
  }
  if (t != null)
    return (
      (e = e()),
      (t.current = e),
      function () {
        t.current = null;
      }
    );
}
function Ev(e, t, n) {
  ((n = n != null ? n.concat([e]) : null), Us(4, 4, xv.bind(null, t, e), n));
}
function id() {}
function Cv(e, t) {
  var n = _e();
  t = t === void 0 ? null : t;
  var a = n.memoizedState;
  return t !== null && Jf(t, a[1]) ? a[0] : ((n.memoizedState = [e, t]), e);
}
function Av(e, t) {
  var n = _e();
  t = t === void 0 ? null : t;
  var a = n.memoizedState;
  if (t !== null && Jf(t, a[1])) return a[0];
  if (((a = e()), Va)) {
    Jn(!0);
    try {
      e();
    } finally {
      Jn(!1);
    }
  }
  return ((n.memoizedState = [a, t]), a);
}
function ld(e, t, n) {
  return n === void 0 || (_n & 1073741824 && !(re & 261930))
    ? (e.memoizedState = t)
    : ((e.memoizedState = n), (e = my()), (J.lanes |= e), (pa |= e), n);
}
function Tv(e, t, n, a) {
  return Nt(n, t)
    ? n
    : Po.current !== null
      ? ((e = ld(e, n, a)), Nt(e, t) || (Be = !0), e)
      : !(_n & 42) || (_n & 1073741824 && !(re & 261930))
        ? ((Be = !0), (e.memoizedState = n))
        : ((e = my()), (J.lanes |= e), (pa |= e), t);
}
function Rv(e, t, n, a, o) {
  var r = ue.p;
  ue.p = r !== 0 && 8 > r ? r : 8;
  var i = K.T,
    l = {};
  ((K.T = l), cd(e, !1, t, n));
  try {
    var s = o(),
      c = K.S;
    if (
      (c !== null && c(l, s),
      s !== null && typeof s == "object" && typeof s.then == "function")
    ) {
      var f = zx(s, a);
      Br(e, t, f, Ot(e));
    } else Br(e, t, a, Ot(e));
  } catch (u) {
    Br(e, t, { then: function () {}, status: "rejected", reason: u }, Ot());
  } finally {
    ((ue.p = r),
      i !== null && l.types !== null && (i.types = l.types),
      (K.T = i));
  }
}
function Vx() {}
function Hu(e, t, n, a) {
  if (e.tag !== 5) throw Error(k(476));
  var o = Mv(e).queue;
  Rv(
    e,
    o,
    t,
    Na,
    n === null
      ? Vx
      : function () {
          return (Dv(e), n(a));
        },
  );
}
function Mv(e) {
  var t = e.memoizedState;
  if (t !== null) return t;
  t = {
    memoizedState: Na,
    baseState: Na,
    baseQueue: null,
    queue: {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: Ln,
      lastRenderedState: Na,
    },
    next: null,
  };
  var n = {};
  return (
    (t.next = {
      memoizedState: n,
      baseState: n,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: Ln,
        lastRenderedState: n,
      },
      next: null,
    }),
    (e.memoizedState = t),
    (e = e.alternate),
    e !== null && (e.memoizedState = t),
    t
  );
}
function Dv(e) {
  var t = Mv(e);
  (t.next === null && (t = e.alternate.memoizedState),
    Br(e, t.next.queue, {}, Ot()));
}
function sd() {
  return We(ai);
}
function Ov() {
  return _e().memoizedState;
}
function kv() {
  return _e().memoizedState;
}
function Ix(e) {
  for (var t = e.return; t !== null; ) {
    switch (t.tag) {
      case 24:
      case 3:
        var n = Ot();
        e = ra(n);
        var a = ia(t, e, n);
        (a !== null && (pt(a, t, n), Lr(a, t, n)),
          (t = { cache: qf() }),
          (e.payload = t));
        return;
    }
    t = t.return;
  }
}
function Gx(e, t, n) {
  var a = Ot();
  ((n = {
    lane: a,
    revertLane: 0,
    gesture: null,
    action: n,
    hasEagerState: !1,
    eagerState: null,
    next: null,
  }),
    Hs(e)
      ? _v(t, n)
      : ((n = Gf(e, t, n, a)), n !== null && (pt(n, e, a), Lv(n, t, a))));
}
function Nv(e, t, n) {
  var a = Ot();
  Br(e, t, n, a);
}
function Br(e, t, n, a) {
  var o = {
    lane: a,
    revertLane: 0,
    gesture: null,
    action: n,
    hasEagerState: !1,
    eagerState: null,
    next: null,
  };
  if (Hs(e)) _v(t, o);
  else {
    var r = e.alternate;
    if (
      e.lanes === 0 &&
      (r === null || r.lanes === 0) &&
      ((r = t.lastRenderedReducer), r !== null)
    )
      try {
        var i = t.lastRenderedState,
          l = r(i, n);
        if (((o.hasEagerState = !0), (o.eagerState = l), Nt(l, i)))
          return (Ls(e, t, o, 0), ve === null && _s(), !1);
      } catch {
      } finally {
      }
    if (((n = Gf(e, t, o, a)), n !== null))
      return (pt(n, e, a), Lv(n, t, a), !0);
  }
  return !1;
}
function cd(e, t, n, a) {
  if (
    ((a = {
      lane: 2,
      revertLane: yd(),
      gesture: null,
      action: a,
      hasEagerState: !1,
      eagerState: null,
      next: null,
    }),
    Hs(e))
  ) {
    if (t) throw Error(k(479));
  } else ((t = Gf(e, n, a, 2)), t !== null && pt(t, e, 2));
}
function Hs(e) {
  var t = e.alternate;
  return e === J || (t !== null && t === J);
}
function _v(e, t) {
  No = Kl = !0;
  var n = e.pending;
  (n === null ? (t.next = t) : ((t.next = n.next), (n.next = t)),
    (e.pending = t));
}
function Lv(e, t, n) {
  if (n & 4194048) {
    var a = t.lanes;
    ((a &= e.pendingLanes), (n |= a), (t.lanes = n), bp(e, n));
  }
}
var ei = {
  readContext: We,
  use: Bs,
  useCallback: Oe,
  useContext: Oe,
  useEffect: Oe,
  useImperativeHandle: Oe,
  useLayoutEffect: Oe,
  useInsertionEffect: Oe,
  useMemo: Oe,
  useReducer: Oe,
  useRef: Oe,
  useState: Oe,
  useDebugValue: Oe,
  useDeferredValue: Oe,
  useTransition: Oe,
  useSyncExternalStore: Oe,
  useId: Oe,
  useHostTransitionStatus: Oe,
  useFormState: Oe,
  useActionState: Oe,
  useOptimistic: Oe,
  useMemoCache: Oe,
  useCacheRefresh: Oe,
};
ei.useEffectEvent = Oe;
var zv = {
    readContext: We,
    use: Bs,
    useCallback: function (e, t) {
      return ((rt().memoizedState = [e, t === void 0 ? null : t]), e);
    },
    useContext: We,
    useEffect: $m,
    useImperativeHandle: function (e, t, n) {
      ((n = n != null ? n.concat([e]) : null),
        bl(4194308, 4, xv.bind(null, t, e), n));
    },
    useLayoutEffect: function (e, t) {
      return bl(4194308, 4, e, t);
    },
    useInsertionEffect: function (e, t) {
      bl(4, 2, e, t);
    },
    useMemo: function (e, t) {
      var n = rt();
      t = t === void 0 ? null : t;
      var a = e();
      if (Va) {
        Jn(!0);
        try {
          e();
        } finally {
          Jn(!1);
        }
      }
      return ((n.memoizedState = [a, t]), a);
    },
    useReducer: function (e, t, n) {
      var a = rt();
      if (n !== void 0) {
        var o = n(t);
        if (Va) {
          Jn(!0);
          try {
            n(t);
          } finally {
            Jn(!1);
          }
        }
      } else o = t;
      return (
        (a.memoizedState = a.baseState = o),
        (e = {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: e,
          lastRenderedState: o,
        }),
        (a.queue = e),
        (e = e.dispatch = Gx.bind(null, J, e)),
        [a.memoizedState, e]
      );
    },
    useRef: function (e) {
      var t = rt();
      return ((e = { current: e }), (t.memoizedState = e));
    },
    useState: function (e) {
      e = Bu(e);
      var t = e.queue,
        n = Nv.bind(null, J, t);
      return ((t.dispatch = n), [e.memoizedState, n]);
    },
    useDebugValue: id,
    useDeferredValue: function (e, t) {
      var n = rt();
      return ld(n, e, t);
    },
    useTransition: function () {
      var e = Bu(!1);
      return (
        (e = Rv.bind(null, J, e.queue, !0, !1)),
        (rt().memoizedState = e),
        [!1, e]
      );
    },
    useSyncExternalStore: function (e, t, n) {
      var a = J,
        o = rt();
      if (ie) {
        if (n === void 0) throw Error(k(407));
        n = n();
      } else {
        if (((n = t()), ve === null)) throw Error(k(349));
        re & 127 || sv(a, t, n);
      }
      o.memoizedState = n;
      var r = { value: n, getSnapshot: t };
      return (
        (o.queue = r),
        $m(uv.bind(null, a, r, e), [e]),
        (a.flags |= 2048),
        Vo(9, { destroy: void 0 }, cv.bind(null, a, r, n, t), null),
        n
      );
    },
    useId: function () {
      var e = rt(),
        t = ve.identifierPrefix;
      if (ie) {
        var n = rn,
          a = on;
        ((n = (a & ~(1 << (32 - Dt(a) - 1))).toString(32) + n),
          (t = "_" + t + "R_" + n),
          (n = ql++),
          0 < n && (t += "H" + n.toString(32)),
          (t += "_"));
      } else ((n = jx++), (t = "_" + t + "r_" + n.toString(32) + "_"));
      return (e.memoizedState = t);
    },
    useHostTransitionStatus: sd,
    useFormState: Km,
    useActionState: Km,
    useOptimistic: function (e) {
      var t = rt();
      t.memoizedState = t.baseState = e;
      var n = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: null,
        lastRenderedState: null,
      };
      return (
        (t.queue = n),
        (t = cd.bind(null, J, !0, n)),
        (n.dispatch = t),
        [e, t]
      );
    },
    useMemoCache: ad,
    useCacheRefresh: function () {
      return (rt().memoizedState = Ix.bind(null, J));
    },
    useEffectEvent: function (e) {
      var t = rt(),
        n = { impl: e };
      return (
        (t.memoizedState = n),
        function () {
          if (ce & 2) throw Error(k(440));
          return n.impl.apply(void 0, arguments);
        }
      );
    },
  },
  ud = {
    readContext: We,
    use: Bs,
    useCallback: Cv,
    useContext: We,
    useEffect: rd,
    useImperativeHandle: Ev,
    useInsertionEffect: Sv,
    useLayoutEffect: wv,
    useMemo: Av,
    useReducer: yl,
    useRef: yv,
    useState: function () {
      return yl(Ln);
    },
    useDebugValue: id,
    useDeferredValue: function (e, t) {
      var n = _e();
      return Tv(n, he.memoizedState, e, t);
    },
    useTransition: function () {
      var e = yl(Ln)[0],
        t = _e().memoizedState;
      return [typeof e == "boolean" ? e : wi(e), t];
    },
    useSyncExternalStore: lv,
    useId: Ov,
    useHostTransitionStatus: sd,
    useFormState: qm,
    useActionState: qm,
    useOptimistic: function (e, t) {
      var n = _e();
      return mv(n, he, e, t);
    },
    useMemoCache: ad,
    useCacheRefresh: kv,
  };
ud.useEffectEvent = bv;
var jv = {
  readContext: We,
  use: Bs,
  useCallback: Cv,
  useContext: We,
  useEffect: rd,
  useImperativeHandle: Ev,
  useInsertionEffect: Sv,
  useLayoutEffect: wv,
  useMemo: Av,
  useReducer: Dc,
  useRef: yv,
  useState: function () {
    return Dc(Ln);
  },
  useDebugValue: id,
  useDeferredValue: function (e, t) {
    var n = _e();
    return he === null ? ld(n, e, t) : Tv(n, he.memoizedState, e, t);
  },
  useTransition: function () {
    var e = Dc(Ln)[0],
      t = _e().memoizedState;
    return [typeof e == "boolean" ? e : wi(e), t];
  },
  useSyncExternalStore: lv,
  useId: Ov,
  useHostTransitionStatus: sd,
  useFormState: Xm,
  useActionState: Xm,
  useOptimistic: function (e, t) {
    var n = _e();
    return he !== null
      ? mv(n, he, e, t)
      : ((n.baseState = e), [e, n.queue.dispatch]);
  },
  useMemoCache: ad,
  useCacheRefresh: kv,
};
jv.useEffectEvent = bv;
function Oc(e, t, n, a) {
  ((t = e.memoizedState),
    (n = n(a, t)),
    (n = n == null ? t : Ce({}, t, n)),
    (e.memoizedState = n),
    e.lanes === 0 && (e.updateQueue.baseState = n));
}
var Pu = {
  enqueueSetState: function (e, t, n) {
    e = e._reactInternals;
    var a = Ot(),
      o = ra(a);
    ((o.payload = t),
      n != null && (o.callback = n),
      (t = ia(e, o, a)),
      t !== null && (pt(t, e, a), Lr(t, e, a)));
  },
  enqueueReplaceState: function (e, t, n) {
    e = e._reactInternals;
    var a = Ot(),
      o = ra(a);
    ((o.tag = 1),
      (o.payload = t),
      n != null && (o.callback = n),
      (t = ia(e, o, a)),
      t !== null && (pt(t, e, a), Lr(t, e, a)));
  },
  enqueueForceUpdate: function (e, t) {
    e = e._reactInternals;
    var n = Ot(),
      a = ra(n);
    ((a.tag = 2),
      t != null && (a.callback = t),
      (t = ia(e, a, n)),
      t !== null && (pt(t, e, n), Lr(t, e, n)));
  },
};
function Qm(e, t, n, a, o, r, i) {
  return (
    (e = e.stateNode),
    typeof e.shouldComponentUpdate == "function"
      ? e.shouldComponentUpdate(a, r, i)
      : t.prototype && t.prototype.isPureReactComponent
        ? !$r(n, a) || !$r(o, r)
        : !0
  );
}
function Zm(e, t, n, a) {
  ((e = t.state),
    typeof t.componentWillReceiveProps == "function" &&
      t.componentWillReceiveProps(n, a),
    typeof t.UNSAFE_componentWillReceiveProps == "function" &&
      t.UNSAFE_componentWillReceiveProps(n, a),
    t.state !== e && Pu.enqueueReplaceState(t, t.state, null));
}
function Ia(e, t) {
  var n = t;
  if ("ref" in t) {
    n = {};
    for (var a in t) a !== "ref" && (n[a] = t[a]);
  }
  if ((e = e.defaultProps)) {
    n === t && (n = Ce({}, n));
    for (var o in e) n[o] === void 0 && (n[o] = e[o]);
  }
  return n;
}
function Bv(e) {
  Hl(e);
}
function Uv(e) {}
function Hv(e) {
  Hl(e);
}
function Xl(e, t) {
  try {
    var n = e.onUncaughtError;
    n(t.value, { componentStack: t.stack });
  } catch (a) {
    setTimeout(function () {
      throw a;
    });
  }
}
function Jm(e, t, n) {
  try {
    var a = e.onCaughtError;
    a(n.value, {
      componentStack: n.stack,
      errorBoundary: t.tag === 1 ? t.stateNode : null,
    });
  } catch (o) {
    setTimeout(function () {
      throw o;
    });
  }
}
function Vu(e, t, n) {
  return (
    (n = ra(n)),
    (n.tag = 3),
    (n.payload = { element: null }),
    (n.callback = function () {
      Xl(e, t);
    }),
    n
  );
}
function Pv(e) {
  return ((e = ra(e)), (e.tag = 3), e);
}
function Vv(e, t, n, a) {
  var o = n.type.getDerivedStateFromError;
  if (typeof o == "function") {
    var r = a.value;
    ((e.payload = function () {
      return o(r);
    }),
      (e.callback = function () {
        Jm(t, n, a);
      }));
  }
  var i = n.stateNode;
  i !== null &&
    typeof i.componentDidCatch == "function" &&
    (e.callback = function () {
      (Jm(t, n, a),
        typeof o != "function" &&
          (la === null ? (la = new Set([this])) : la.add(this)));
      var l = a.stack;
      this.componentDidCatch(a.value, { componentStack: l !== null ? l : "" });
    });
}
function Yx(e, t, n, a, o) {
  if (
    ((n.flags |= 32768),
    a !== null && typeof a == "object" && typeof a.then == "function")
  ) {
    if (
      ((t = n.alternate),
      t !== null && Wo(t, n, o, !0),
      (n = _t.current),
      n !== null)
    ) {
      switch (n.tag) {
        case 31:
        case 13:
          return (
            Gt === null ? Wl() : n.alternate === null && ke === 0 && (ke = 3),
            (n.flags &= -257),
            (n.flags |= 65536),
            (n.lanes = o),
            a === Gl
              ? (n.flags |= 16384)
              : ((t = n.updateQueue),
                t === null ? (n.updateQueue = new Set([a])) : t.add(a),
                Vc(e, a, o)),
            !1
          );
        case 22:
          return (
            (n.flags |= 65536),
            a === Gl
              ? (n.flags |= 16384)
              : ((t = n.updateQueue),
                t === null
                  ? ((t = {
                      transitions: null,
                      markerInstances: null,
                      retryQueue: new Set([a]),
                    }),
                    (n.updateQueue = t))
                  : ((n = t.retryQueue),
                    n === null ? (t.retryQueue = new Set([a])) : n.add(a)),
                Vc(e, a, o)),
            !1
          );
      }
      throw Error(k(435, n.tag));
    }
    return (Vc(e, a, o), Wl(), !1);
  }
  if (ie)
    return (
      (t = _t.current),
      t !== null
        ? (!(t.flags & 65536) && (t.flags |= 256),
          (t.flags |= 65536),
          (t.lanes = o),
          a !== Mu && ((e = Error(k(422), { cause: a })), Zr(Vt(e, n))))
        : (a !== Mu && ((t = Error(k(423), { cause: a })), Zr(Vt(t, n))),
          (e = e.current.alternate),
          (e.flags |= 65536),
          (o &= -o),
          (e.lanes |= o),
          (a = Vt(a, n)),
          (o = Vu(e.stateNode, a, o)),
          Mc(e, o),
          ke !== 4 && (ke = 2)),
      !1
    );
  var r = Error(k(520), { cause: a });
  if (
    ((r = Vt(r, n)),
    Pr === null ? (Pr = [r]) : Pr.push(r),
    ke !== 4 && (ke = 2),
    t === null)
  )
    return !0;
  ((a = Vt(a, n)), (n = t));
  do {
    switch (n.tag) {
      case 3:
        return (
          (n.flags |= 65536),
          (e = o & -o),
          (n.lanes |= e),
          (e = Vu(n.stateNode, a, e)),
          Mc(n, e),
          !1
        );
      case 1:
        if (
          ((t = n.type),
          (r = n.stateNode),
          (n.flags & 128) === 0 &&
            (typeof t.getDerivedStateFromError == "function" ||
              (r !== null &&
                typeof r.componentDidCatch == "function" &&
                (la === null || !la.has(r)))))
        )
          return (
            (n.flags |= 65536),
            (o &= -o),
            (n.lanes |= o),
            (o = Pv(o)),
            Vv(o, e, n, a),
            Mc(n, o),
            !1
          );
    }
    n = n.return;
  } while (n !== null);
  return !1;
}
var fd = Error(k(461)),
  Be = !1;
function Qe(e, t, n, a) {
  t.child = e === null ? tv(t, null, n, a) : Pa(t, e.child, n, a);
}
function Wm(e, t, n, a, o) {
  n = n.render;
  var r = t.ref;
  if ("ref" in a) {
    var i = {};
    for (var l in a) l !== "ref" && (i[l] = a[l]);
  } else i = a;
  return (
    Ha(t),
    (a = Wf(e, t, n, i, r, o)),
    (l = ed()),
    e !== null && !Be
      ? (td(e, t, o), zn(e, t, o))
      : (ie && l && Ff(t), (t.flags |= 1), Qe(e, t, a, o), t.child)
  );
}
function eg(e, t, n, a, o) {
  if (e === null) {
    var r = n.type;
    return typeof r == "function" &&
      !Yf(r) &&
      r.defaultProps === void 0 &&
      n.compare === null
      ? ((t.tag = 15), (t.type = r), Iv(e, t, r, a, o))
      : ((e = pl(n.type, null, a, t, t.mode, o)),
        (e.ref = t.ref),
        (e.return = t),
        (t.child = e));
  }
  if (((r = e.child), !dd(e, o))) {
    var i = r.memoizedProps;
    if (
      ((n = n.compare), (n = n !== null ? n : $r), n(i, a) && e.ref === t.ref)
    )
      return zn(e, t, o);
  }
  return (
    (t.flags |= 1),
    (e = Dn(r, a)),
    (e.ref = t.ref),
    (e.return = t),
    (t.child = e)
  );
}
function Iv(e, t, n, a, o) {
  if (e !== null) {
    var r = e.memoizedProps;
    if ($r(r, a) && e.ref === t.ref)
      if (((Be = !1), (t.pendingProps = a = r), dd(e, o)))
        e.flags & 131072 && (Be = !0);
      else return ((t.lanes = e.lanes), zn(e, t, o));
  }
  return Iu(e, t, n, a, o);
}
function Gv(e, t, n, a) {
  var o = a.children,
    r = e !== null ? e.memoizedState : null;
  if (
    (e === null &&
      t.stateNode === null &&
      (t.stateNode = {
        _visibility: 1,
        _pendingMarkers: null,
        _retryCache: null,
        _transitions: null,
      }),
    a.mode === "hidden")
  ) {
    if (t.flags & 128) {
      if (((r = r !== null ? r.baseLanes | n : n), e !== null)) {
        for (a = t.child = e.child, o = 0; a !== null; )
          ((o = o | a.lanes | a.childLanes), (a = a.sibling));
        a = o & ~r;
      } else ((a = 0), (t.child = null));
      return tg(e, t, r, n, a);
    }
    if (n & 536870912)
      ((t.memoizedState = { baseLanes: 0, cachePool: null }),
        e !== null && vl(t, r !== null ? r.cachePool : null),
        r !== null ? Gm(t, r) : zu(),
        ov(t));
    else
      return (
        (a = t.lanes = 536870912),
        tg(e, t, r !== null ? r.baseLanes | n : n, n, a)
      );
  } else
    r !== null
      ? (vl(t, r.cachePool), Gm(t, r), Qn(), (t.memoizedState = null))
      : (e !== null && vl(t, null), zu(), Qn());
  return (Qe(e, t, o, n), t.child);
}
function Tr(e, t) {
  return (
    (e !== null && e.tag === 22) ||
      t.stateNode !== null ||
      (t.stateNode = {
        _visibility: 1,
        _pendingMarkers: null,
        _retryCache: null,
        _transitions: null,
      }),
    t.sibling
  );
}
function tg(e, t, n, a, o) {
  var r = Xf();
  return (
    (r = r === null ? null : { parent: je._currentValue, pool: r }),
    (t.memoizedState = { baseLanes: n, cachePool: r }),
    e !== null && vl(t, null),
    zu(),
    ov(t),
    e !== null && Wo(e, t, a, !0),
    (t.childLanes = o),
    null
  );
}
function Sl(e, t) {
  return (
    (t = $l({ mode: t.mode, children: t.children }, e.mode)),
    (t.ref = e.ref),
    (e.child = t),
    (t.return = e),
    t
  );
}
function ng(e, t, n) {
  return (
    Pa(t, e.child, null, n),
    (e = Sl(t, t.pendingProps)),
    (e.flags |= 2),
    Et(t),
    (t.memoizedState = null),
    e
  );
}
function Fx(e, t, n) {
  var a = t.pendingProps,
    o = (t.flags & 128) !== 0;
  if (((t.flags &= -129), e === null)) {
    if (ie) {
      if (a.mode === "hidden")
        return ((e = Sl(t, a)), (t.lanes = 536870912), Tr(null, e));
      if (
        (ju(t),
        (e = xe)
          ? ((e = zy(e, It)),
            (e = e !== null && e.data === "&" ? e : null),
            e !== null &&
              ((t.memoizedState = {
                dehydrated: e,
                treeContext: ma !== null ? { id: on, overflow: rn } : null,
                retryLane: 536870912,
                hydrationErrors: null,
              }),
              (n = Xp(e)),
              (n.return = t),
              (t.child = n),
              (Je = t),
              (xe = null)))
          : (e = null),
        e === null)
      )
        throw ga(t);
      return ((t.lanes = 536870912), null);
    }
    return Sl(t, a);
  }
  var r = e.memoizedState;
  if (r !== null) {
    var i = r.dehydrated;
    if ((ju(t), o))
      if (t.flags & 256) ((t.flags &= -257), (t = ng(e, t, n)));
      else if (t.memoizedState !== null)
        ((t.child = e.child), (t.flags |= 128), (t = null));
      else throw Error(k(558));
    else if ((Be || Wo(e, t, n, !1), (o = (n & e.childLanes) !== 0), Be || o)) {
      if (
        ((a = ve), a !== null && ((i = Sp(a, n)), i !== 0 && i !== r.retryLane))
      )
        throw ((r.retryLane = i), Xa(e, i), pt(a, e, i), fd);
      (Wl(), (t = ng(e, t, n)));
    } else
      ((e = r.treeContext),
        (xe = Yt(i.nextSibling)),
        (Je = t),
        (ie = !0),
        (oa = null),
        (It = !1),
        e !== null && Qp(t, e),
        (t = Sl(t, a)),
        (t.flags |= 4096));
    return t;
  }
  return (
    (e = Dn(e.child, { mode: a.mode, children: a.children })),
    (e.ref = t.ref),
    (t.child = e),
    (e.return = t),
    e
  );
}
function wl(e, t) {
  var n = t.ref;
  if (n === null) e !== null && e.ref !== null && (t.flags |= 4194816);
  else {
    if (typeof n != "function" && typeof n != "object") throw Error(k(284));
    (e === null || e.ref !== n) && (t.flags |= 4194816);
  }
}
function Iu(e, t, n, a, o) {
  return (
    Ha(t),
    (n = Wf(e, t, n, a, void 0, o)),
    (a = ed()),
    e !== null && !Be
      ? (td(e, t, o), zn(e, t, o))
      : (ie && a && Ff(t), (t.flags |= 1), Qe(e, t, n, o), t.child)
  );
}
function ag(e, t, n, a, o, r) {
  return (
    Ha(t),
    (t.updateQueue = null),
    (n = iv(t, a, n, o)),
    rv(e),
    (a = ed()),
    e !== null && !Be
      ? (td(e, t, r), zn(e, t, r))
      : (ie && a && Ff(t), (t.flags |= 1), Qe(e, t, n, r), t.child)
  );
}
function og(e, t, n, a, o) {
  if ((Ha(t), t.stateNode === null)) {
    var r = Eo,
      i = n.contextType;
    (typeof i == "object" && i !== null && (r = We(i)),
      (r = new n(a, r)),
      (t.memoizedState =
        r.state !== null && r.state !== void 0 ? r.state : null),
      (r.updater = Pu),
      (t.stateNode = r),
      (r._reactInternals = t),
      (r = t.stateNode),
      (r.props = a),
      (r.state = t.memoizedState),
      (r.refs = {}),
      Qf(t),
      (i = n.contextType),
      (r.context = typeof i == "object" && i !== null ? We(i) : Eo),
      (r.state = t.memoizedState),
      (i = n.getDerivedStateFromProps),
      typeof i == "function" && (Oc(t, n, i, a), (r.state = t.memoizedState)),
      typeof n.getDerivedStateFromProps == "function" ||
        typeof r.getSnapshotBeforeUpdate == "function" ||
        (typeof r.UNSAFE_componentWillMount != "function" &&
          typeof r.componentWillMount != "function") ||
        ((i = r.state),
        typeof r.componentWillMount == "function" && r.componentWillMount(),
        typeof r.UNSAFE_componentWillMount == "function" &&
          r.UNSAFE_componentWillMount(),
        i !== r.state && Pu.enqueueReplaceState(r, r.state, null),
        jr(t, a, r, o),
        zr(),
        (r.state = t.memoizedState)),
      typeof r.componentDidMount == "function" && (t.flags |= 4194308),
      (a = !0));
  } else if (e === null) {
    r = t.stateNode;
    var l = t.memoizedProps,
      s = Ia(n, l);
    r.props = s;
    var c = r.context,
      f = n.contextType;
    ((i = Eo), typeof f == "object" && f !== null && (i = We(f)));
    var u = n.getDerivedStateFromProps;
    ((f =
      typeof u == "function" || typeof r.getSnapshotBeforeUpdate == "function"),
      (l = t.pendingProps !== l),
      f ||
        (typeof r.UNSAFE_componentWillReceiveProps != "function" &&
          typeof r.componentWillReceiveProps != "function") ||
        ((l || c !== i) && Zm(t, r, a, i)),
      (qn = !1));
    var d = t.memoizedState;
    ((r.state = d),
      jr(t, a, r, o),
      zr(),
      (c = t.memoizedState),
      l || d !== c || qn
        ? (typeof u == "function" && (Oc(t, n, u, a), (c = t.memoizedState)),
          (s = qn || Qm(t, n, s, a, d, c, i))
            ? (f ||
                (typeof r.UNSAFE_componentWillMount != "function" &&
                  typeof r.componentWillMount != "function") ||
                (typeof r.componentWillMount == "function" &&
                  r.componentWillMount(),
                typeof r.UNSAFE_componentWillMount == "function" &&
                  r.UNSAFE_componentWillMount()),
              typeof r.componentDidMount == "function" && (t.flags |= 4194308))
            : (typeof r.componentDidMount == "function" && (t.flags |= 4194308),
              (t.memoizedProps = a),
              (t.memoizedState = c)),
          (r.props = a),
          (r.state = c),
          (r.context = i),
          (a = s))
        : (typeof r.componentDidMount == "function" && (t.flags |= 4194308),
          (a = !1)));
  } else {
    ((r = t.stateNode),
      _u(e, t),
      (i = t.memoizedProps),
      (f = Ia(n, i)),
      (r.props = f),
      (u = t.pendingProps),
      (d = r.context),
      (c = n.contextType),
      (s = Eo),
      typeof c == "object" && c !== null && (s = We(c)),
      (l = n.getDerivedStateFromProps),
      (c =
        typeof l == "function" ||
        typeof r.getSnapshotBeforeUpdate == "function") ||
        (typeof r.UNSAFE_componentWillReceiveProps != "function" &&
          typeof r.componentWillReceiveProps != "function") ||
        ((i !== u || d !== s) && Zm(t, r, a, s)),
      (qn = !1),
      (d = t.memoizedState),
      (r.state = d),
      jr(t, a, r, o),
      zr());
    var g = t.memoizedState;
    i !== u ||
    d !== g ||
    qn ||
    (e !== null && e.dependencies !== null && Il(e.dependencies))
      ? (typeof l == "function" && (Oc(t, n, l, a), (g = t.memoizedState)),
        (f =
          qn ||
          Qm(t, n, f, a, d, g, s) ||
          (e !== null && e.dependencies !== null && Il(e.dependencies)))
          ? (c ||
              (typeof r.UNSAFE_componentWillUpdate != "function" &&
                typeof r.componentWillUpdate != "function") ||
              (typeof r.componentWillUpdate == "function" &&
                r.componentWillUpdate(a, g, s),
              typeof r.UNSAFE_componentWillUpdate == "function" &&
                r.UNSAFE_componentWillUpdate(a, g, s)),
            typeof r.componentDidUpdate == "function" && (t.flags |= 4),
            typeof r.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024))
          : (typeof r.componentDidUpdate != "function" ||
              (i === e.memoizedProps && d === e.memoizedState) ||
              (t.flags |= 4),
            typeof r.getSnapshotBeforeUpdate != "function" ||
              (i === e.memoizedProps && d === e.memoizedState) ||
              (t.flags |= 1024),
            (t.memoizedProps = a),
            (t.memoizedState = g)),
        (r.props = a),
        (r.state = g),
        (r.context = s),
        (a = f))
      : (typeof r.componentDidUpdate != "function" ||
          (i === e.memoizedProps && d === e.memoizedState) ||
          (t.flags |= 4),
        typeof r.getSnapshotBeforeUpdate != "function" ||
          (i === e.memoizedProps && d === e.memoizedState) ||
          (t.flags |= 1024),
        (a = !1));
  }
  return (
    (r = a),
    wl(e, t),
    (a = (t.flags & 128) !== 0),
    r || a
      ? ((r = t.stateNode),
        (n =
          a && typeof n.getDerivedStateFromError != "function"
            ? null
            : r.render()),
        (t.flags |= 1),
        e !== null && a
          ? ((t.child = Pa(t, e.child, null, o)), (t.child = Pa(t, null, n, o)))
          : Qe(e, t, n, o),
        (t.memoizedState = r.state),
        (e = t.child))
      : (e = zn(e, t, o)),
    e
  );
}
function rg(e, t, n, a) {
  return (Ua(), (t.flags |= 256), Qe(e, t, n, a), t.child);
}
var kc = {
  dehydrated: null,
  treeContext: null,
  retryLane: 0,
  hydrationErrors: null,
};
function Nc(e) {
  return { baseLanes: e, cachePool: Jp() };
}
function _c(e, t, n) {
  return ((e = e !== null ? e.childLanes & ~n : 0), t && (e |= Tt), e);
}
function Yv(e, t, n) {
  var a = t.pendingProps,
    o = !1,
    r = (t.flags & 128) !== 0,
    i;
  if (
    ((i = r) ||
      (i =
        e !== null && e.memoizedState === null ? !1 : (Ne.current & 2) !== 0),
    i && ((o = !0), (t.flags &= -129)),
    (i = (t.flags & 32) !== 0),
    (t.flags &= -33),
    e === null)
  ) {
    if (ie) {
      if (
        (o ? $n(t) : Qn(),
        (e = xe)
          ? ((e = zy(e, It)),
            (e = e !== null && e.data !== "&" ? e : null),
            e !== null &&
              ((t.memoizedState = {
                dehydrated: e,
                treeContext: ma !== null ? { id: on, overflow: rn } : null,
                retryLane: 536870912,
                hydrationErrors: null,
              }),
              (n = Xp(e)),
              (n.return = t),
              (t.child = n),
              (Je = t),
              (xe = null)))
          : (e = null),
        e === null)
      )
        throw ga(t);
      return (nf(e) ? (t.lanes = 32) : (t.lanes = 536870912), null);
    }
    var l = a.children;
    return (
      (a = a.fallback),
      o
        ? (Qn(),
          (o = t.mode),
          (l = $l({ mode: "hidden", children: l }, o)),
          (a = _a(a, o, n, null)),
          (l.return = t),
          (a.return = t),
          (l.sibling = a),
          (t.child = l),
          (a = t.child),
          (a.memoizedState = Nc(n)),
          (a.childLanes = _c(e, i, n)),
          (t.memoizedState = kc),
          Tr(null, a))
        : ($n(t), Gu(t, l))
    );
  }
  var s = e.memoizedState;
  if (s !== null && ((l = s.dehydrated), l !== null)) {
    if (r)
      t.flags & 256
        ? ($n(t), (t.flags &= -257), (t = Lc(e, t, n)))
        : t.memoizedState !== null
          ? (Qn(), (t.child = e.child), (t.flags |= 128), (t = null))
          : (Qn(),
            (l = a.fallback),
            (o = t.mode),
            (a = $l({ mode: "visible", children: a.children }, o)),
            (l = _a(l, o, n, null)),
            (l.flags |= 2),
            (a.return = t),
            (l.return = t),
            (a.sibling = l),
            (t.child = a),
            Pa(t, e.child, null, n),
            (a = t.child),
            (a.memoizedState = Nc(n)),
            (a.childLanes = _c(e, i, n)),
            (t.memoizedState = kc),
            (t = Tr(null, a)));
    else if (($n(t), nf(l))) {
      if (((i = l.nextSibling && l.nextSibling.dataset), i)) var c = i.dgst;
      ((i = c),
        (a = Error(k(419))),
        (a.stack = ""),
        (a.digest = i),
        Zr({ value: a, source: null, stack: null }),
        (t = Lc(e, t, n)));
    } else if (
      (Be || Wo(e, t, n, !1), (i = (n & e.childLanes) !== 0), Be || i)
    ) {
      if (
        ((i = ve), i !== null && ((a = Sp(i, n)), a !== 0 && a !== s.retryLane))
      )
        throw ((s.retryLane = a), Xa(e, a), pt(i, e, a), fd);
      (tf(l) || Wl(), (t = Lc(e, t, n)));
    } else
      tf(l)
        ? ((t.flags |= 192), (t.child = e.child), (t = null))
        : ((e = s.treeContext),
          (xe = Yt(l.nextSibling)),
          (Je = t),
          (ie = !0),
          (oa = null),
          (It = !1),
          e !== null && Qp(t, e),
          (t = Gu(t, a.children)),
          (t.flags |= 4096));
    return t;
  }
  return o
    ? (Qn(),
      (l = a.fallback),
      (o = t.mode),
      (s = e.child),
      (c = s.sibling),
      (a = Dn(s, { mode: "hidden", children: a.children })),
      (a.subtreeFlags = s.subtreeFlags & 65011712),
      c !== null ? (l = Dn(c, l)) : ((l = _a(l, o, n, null)), (l.flags |= 2)),
      (l.return = t),
      (a.return = t),
      (a.sibling = l),
      (t.child = a),
      Tr(null, a),
      (a = t.child),
      (l = e.child.memoizedState),
      l === null
        ? (l = Nc(n))
        : ((o = l.cachePool),
          o !== null
            ? ((s = je._currentValue),
              (o = o.parent !== s ? { parent: s, pool: s } : o))
            : (o = Jp()),
          (l = { baseLanes: l.baseLanes | n, cachePool: o })),
      (a.memoizedState = l),
      (a.childLanes = _c(e, i, n)),
      (t.memoizedState = kc),
      Tr(e.child, a))
    : ($n(t),
      (n = e.child),
      (e = n.sibling),
      (n = Dn(n, { mode: "visible", children: a.children })),
      (n.return = t),
      (n.sibling = null),
      e !== null &&
        ((i = t.deletions),
        i === null ? ((t.deletions = [e]), (t.flags |= 16)) : i.push(e)),
      (t.child = n),
      (t.memoizedState = null),
      n);
}
function Gu(e, t) {
  return (
    (t = $l({ mode: "visible", children: t }, e.mode)),
    (t.return = e),
    (e.child = t)
  );
}
function $l(e, t) {
  return ((e = At(22, e, null, t)), (e.lanes = 0), e);
}
function Lc(e, t, n) {
  return (
    Pa(t, e.child, null, n),
    (e = Gu(t, t.pendingProps.children)),
    (e.flags |= 2),
    (t.memoizedState = null),
    e
  );
}
function ig(e, t, n) {
  e.lanes |= t;
  var a = e.alternate;
  (a !== null && (a.lanes |= t), Ou(e.return, t, n));
}
function zc(e, t, n, a, o, r) {
  var i = e.memoizedState;
  i === null
    ? (e.memoizedState = {
        isBackwards: t,
        rendering: null,
        renderingStartTime: 0,
        last: a,
        tail: n,
        tailMode: o,
        treeForkCount: r,
      })
    : ((i.isBackwards = t),
      (i.rendering = null),
      (i.renderingStartTime = 0),
      (i.last = a),
      (i.tail = n),
      (i.tailMode = o),
      (i.treeForkCount = r));
}
function Fv(e, t, n) {
  var a = t.pendingProps,
    o = a.revealOrder,
    r = a.tail;
  a = a.children;
  var i = Ne.current,
    l = (i & 2) !== 0;
  if (
    (l ? ((i = (i & 1) | 2), (t.flags |= 128)) : (i &= 1),
    Se(Ne, i),
    Qe(e, t, a, n),
    (a = ie ? Qr : 0),
    !l && e !== null && e.flags & 128)
  )
    e: for (e = t.child; e !== null; ) {
      if (e.tag === 13) e.memoizedState !== null && ig(e, n, t);
      else if (e.tag === 19) ig(e, n, t);
      else if (e.child !== null) {
        ((e.child.return = e), (e = e.child));
        continue;
      }
      if (e === t) break e;
      for (; e.sibling === null; ) {
        if (e.return === null || e.return === t) break e;
        e = e.return;
      }
      ((e.sibling.return = e.return), (e = e.sibling));
    }
  switch (o) {
    case "forwards":
      for (n = t.child, o = null; n !== null; )
        ((e = n.alternate),
          e !== null && Fl(e) === null && (o = n),
          (n = n.sibling));
      ((n = o),
        n === null
          ? ((o = t.child), (t.child = null))
          : ((o = n.sibling), (n.sibling = null)),
        zc(t, !1, o, n, r, a));
      break;
    case "backwards":
    case "unstable_legacy-backwards":
      for (n = null, o = t.child, t.child = null; o !== null; ) {
        if (((e = o.alternate), e !== null && Fl(e) === null)) {
          t.child = o;
          break;
        }
        ((e = o.sibling), (o.sibling = n), (n = o), (o = e));
      }
      zc(t, !0, n, null, r, a);
      break;
    case "together":
      zc(t, !1, null, null, void 0, a);
      break;
    default:
      t.memoizedState = null;
  }
  return t.child;
}
function zn(e, t, n) {
  if (
    (e !== null && (t.dependencies = e.dependencies),
    (pa |= t.lanes),
    !(n & t.childLanes))
  )
    if (e !== null) {
      if ((Wo(e, t, n, !1), (n & t.childLanes) === 0)) return null;
    } else return null;
  if (e !== null && t.child !== e.child) throw Error(k(153));
  if (t.child !== null) {
    for (
      e = t.child, n = Dn(e, e.pendingProps), t.child = n, n.return = t;
      e.sibling !== null;
    )
      ((e = e.sibling),
        (n = n.sibling = Dn(e, e.pendingProps)),
        (n.return = t));
    n.sibling = null;
  }
  return t.child;
}
function dd(e, t) {
  return e.lanes & t ? !0 : ((e = e.dependencies), !!(e !== null && Il(e)));
}
function Kx(e, t, n) {
  switch (t.tag) {
    case 3:
      (zl(t, t.stateNode.containerInfo),
        Xn(t, je, e.memoizedState.cache),
        Ua());
      break;
    case 27:
    case 5:
      vu(t);
      break;
    case 4:
      zl(t, t.stateNode.containerInfo);
      break;
    case 10:
      Xn(t, t.type, t.memoizedProps.value);
      break;
    case 31:
      if (t.memoizedState !== null) return ((t.flags |= 128), ju(t), null);
      break;
    case 13:
      var a = t.memoizedState;
      if (a !== null)
        return a.dehydrated !== null
          ? ($n(t), (t.flags |= 128), null)
          : n & t.child.childLanes
            ? Yv(e, t, n)
            : ($n(t), (e = zn(e, t, n)), e !== null ? e.sibling : null);
      $n(t);
      break;
    case 19:
      var o = (e.flags & 128) !== 0;
      if (
        ((a = (n & t.childLanes) !== 0),
        a || (Wo(e, t, n, !1), (a = (n & t.childLanes) !== 0)),
        o)
      ) {
        if (a) return Fv(e, t, n);
        t.flags |= 128;
      }
      if (
        ((o = t.memoizedState),
        o !== null &&
          ((o.rendering = null), (o.tail = null), (o.lastEffect = null)),
        Se(Ne, Ne.current),
        a)
      )
        break;
      return null;
    case 22:
      return ((t.lanes = 0), Gv(e, t, n, t.pendingProps));
    case 24:
      Xn(t, je, e.memoizedState.cache);
  }
  return zn(e, t, n);
}
function Kv(e, t, n) {
  if (e !== null)
    if (e.memoizedProps !== t.pendingProps) Be = !0;
    else {
      if (!dd(e, n) && !(t.flags & 128)) return ((Be = !1), Kx(e, t, n));
      Be = !!(e.flags & 131072);
    }
  else ((Be = !1), ie && t.flags & 1048576 && $p(t, Qr, t.index));
  switch (((t.lanes = 0), t.tag)) {
    case 16:
      e: {
        var a = t.pendingProps;
        if (((e = Da(t.elementType)), (t.type = e), typeof e == "function"))
          Yf(e)
            ? ((a = Ia(e, a)), (t.tag = 1), (t = og(null, t, e, a, n)))
            : ((t.tag = 0), (t = Iu(null, t, e, a, n)));
        else {
          if (e != null) {
            var o = e.$$typeof;
            if (o === Of) {
              ((t.tag = 11), (t = Wm(null, t, e, a, n)));
              break e;
            } else if (o === kf) {
              ((t.tag = 14), (t = eg(null, t, e, a, n)));
              break e;
            }
          }
          throw ((t = hu(e) || e), Error(k(306, t, "")));
        }
      }
      return t;
    case 0:
      return Iu(e, t, t.type, t.pendingProps, n);
    case 1:
      return ((a = t.type), (o = Ia(a, t.pendingProps)), og(e, t, a, o, n));
    case 3:
      e: {
        if ((zl(t, t.stateNode.containerInfo), e === null)) throw Error(k(387));
        a = t.pendingProps;
        var r = t.memoizedState;
        ((o = r.element), _u(e, t), jr(t, a, null, n));
        var i = t.memoizedState;
        if (
          ((a = i.cache),
          Xn(t, je, a),
          a !== r.cache && ku(t, [je], n, !0),
          zr(),
          (a = i.element),
          r.isDehydrated)
        )
          if (
            ((r = { element: a, isDehydrated: !1, cache: i.cache }),
            (t.updateQueue.baseState = r),
            (t.memoizedState = r),
            t.flags & 256)
          ) {
            t = rg(e, t, a, n);
            break e;
          } else if (a !== o) {
            ((o = Vt(Error(k(424)), t)), Zr(o), (t = rg(e, t, a, n)));
            break e;
          } else {
            switch (((e = t.stateNode.containerInfo), e.nodeType)) {
              case 9:
                e = e.body;
                break;
              default:
                e = e.nodeName === "HTML" ? e.ownerDocument.body : e;
            }
            for (
              xe = Yt(e.firstChild),
                Je = t,
                ie = !0,
                oa = null,
                It = !0,
                n = tv(t, null, a, n),
                t.child = n;
              n;
            )
              ((n.flags = (n.flags & -3) | 4096), (n = n.sibling));
          }
        else {
          if ((Ua(), a === o)) {
            t = zn(e, t, n);
            break e;
          }
          Qe(e, t, a, n);
        }
        t = t.child;
      }
      return t;
    case 26:
      return (
        wl(e, t),
        e === null
          ? (n = Tg(t.type, null, t.pendingProps, null))
            ? (t.memoizedState = n)
            : ie ||
              ((n = t.type),
              (e = t.pendingProps),
              (a = as(aa.current).createElement(n)),
              (a[Ze] = t),
              (a[vt] = e),
              et(a, n, e),
              Ye(a),
              (t.stateNode = a))
          : (t.memoizedState = Tg(
              t.type,
              e.memoizedProps,
              t.pendingProps,
              e.memoizedState,
            )),
        null
      );
    case 27:
      return (
        vu(t),
        e === null &&
          ie &&
          ((a = t.stateNode = jy(t.type, t.pendingProps, aa.current)),
          (Je = t),
          (It = !0),
          (o = xe),
          Sa(t.type) ? ((af = o), (xe = Yt(a.firstChild))) : (xe = o)),
        Qe(e, t, t.pendingProps.children, n),
        wl(e, t),
        e === null && (t.flags |= 4194304),
        t.child
      );
    case 5:
      return (
        e === null &&
          ie &&
          ((o = a = xe) &&
            ((a = x1(a, t.type, t.pendingProps, It)),
            a !== null
              ? ((t.stateNode = a),
                (Je = t),
                (xe = Yt(a.firstChild)),
                (It = !1),
                (o = !0))
              : (o = !1)),
          o || ga(t)),
        vu(t),
        (o = t.type),
        (r = t.pendingProps),
        (i = e !== null ? e.memoizedProps : null),
        (a = r.children),
        Wu(o, r) ? (a = null) : i !== null && Wu(o, i) && (t.flags |= 32),
        t.memoizedState !== null &&
          ((o = Wf(e, t, Bx, null, null, n)), (ai._currentValue = o)),
        wl(e, t),
        Qe(e, t, a, n),
        t.child
      );
    case 6:
      return (
        e === null &&
          ie &&
          ((e = n = xe) &&
            ((n = E1(n, t.pendingProps, It)),
            n !== null
              ? ((t.stateNode = n), (Je = t), (xe = null), (e = !0))
              : (e = !1)),
          e || ga(t)),
        null
      );
    case 13:
      return Yv(e, t, n);
    case 4:
      return (
        zl(t, t.stateNode.containerInfo),
        (a = t.pendingProps),
        e === null ? (t.child = Pa(t, null, a, n)) : Qe(e, t, a, n),
        t.child
      );
    case 11:
      return Wm(e, t, t.type, t.pendingProps, n);
    case 7:
      return (Qe(e, t, t.pendingProps, n), t.child);
    case 8:
      return (Qe(e, t, t.pendingProps.children, n), t.child);
    case 12:
      return (Qe(e, t, t.pendingProps.children, n), t.child);
    case 10:
      return (
        (a = t.pendingProps),
        Xn(t, t.type, a.value),
        Qe(e, t, a.children, n),
        t.child
      );
    case 9:
      return (
        (o = t.type._context),
        (a = t.pendingProps.children),
        Ha(t),
        (o = We(o)),
        (a = a(o)),
        (t.flags |= 1),
        Qe(e, t, a, n),
        t.child
      );
    case 14:
      return eg(e, t, t.type, t.pendingProps, n);
    case 15:
      return Iv(e, t, t.type, t.pendingProps, n);
    case 19:
      return Fv(e, t, n);
    case 31:
      return Fx(e, t, n);
    case 22:
      return Gv(e, t, n, t.pendingProps);
    case 24:
      return (
        Ha(t),
        (a = We(je)),
        e === null
          ? ((o = Xf()),
            o === null &&
              ((o = ve),
              (r = qf()),
              (o.pooledCache = r),
              r.refCount++,
              r !== null && (o.pooledCacheLanes |= n),
              (o = r)),
            (t.memoizedState = { parent: a, cache: o }),
            Qf(t),
            Xn(t, je, o))
          : (e.lanes & n && (_u(e, t), jr(t, null, null, n), zr()),
            (o = e.memoizedState),
            (r = t.memoizedState),
            o.parent !== a
              ? ((o = { parent: a, cache: a }),
                (t.memoizedState = o),
                t.lanes === 0 &&
                  (t.memoizedState = t.updateQueue.baseState = o),
                Xn(t, je, a))
              : ((a = r.cache),
                Xn(t, je, a),
                a !== o.cache && ku(t, [je], n, !0))),
        Qe(e, t, t.pendingProps.children, n),
        t.child
      );
    case 29:
      throw t.pendingProps;
  }
  throw Error(k(156, t.tag));
}
function yn(e) {
  e.flags |= 4;
}
function jc(e, t, n, a, o) {
  if (((t = (e.mode & 32) !== 0) && (t = !1), t)) {
    if (((e.flags |= 16777216), (o & 335544128) === o))
      if (e.stateNode.complete) e.flags |= 8192;
      else if (py()) e.flags |= 8192;
      else throw ((za = Gl), $f);
  } else e.flags &= -16777217;
}
function lg(e, t) {
  if (t.type !== "stylesheet" || t.state.loading & 4) e.flags &= -16777217;
  else if (((e.flags |= 16777216), !Hy(t)))
    if (py()) e.flags |= 8192;
    else throw ((za = Gl), $f);
}
function qi(e, t) {
  (t !== null && (e.flags |= 4),
    e.flags & 16384 &&
      ((t = e.tag !== 22 ? vp() : 536870912), (e.lanes |= t), (Io |= t)));
}
function mr(e, t) {
  if (!ie)
    switch (e.tailMode) {
      case "hidden":
        t = e.tail;
        for (var n = null; t !== null; )
          (t.alternate !== null && (n = t), (t = t.sibling));
        n === null ? (e.tail = null) : (n.sibling = null);
        break;
      case "collapsed":
        n = e.tail;
        for (var a = null; n !== null; )
          (n.alternate !== null && (a = n), (n = n.sibling));
        a === null
          ? t || e.tail === null
            ? (e.tail = null)
            : (e.tail.sibling = null)
          : (a.sibling = null);
    }
}
function we(e) {
  var t = e.alternate !== null && e.alternate.child === e.child,
    n = 0,
    a = 0;
  if (t)
    for (var o = e.child; o !== null; )
      ((n |= o.lanes | o.childLanes),
        (a |= o.subtreeFlags & 65011712),
        (a |= o.flags & 65011712),
        (o.return = e),
        (o = o.sibling));
  else
    for (o = e.child; o !== null; )
      ((n |= o.lanes | o.childLanes),
        (a |= o.subtreeFlags),
        (a |= o.flags),
        (o.return = e),
        (o = o.sibling));
  return ((e.subtreeFlags |= a), (e.childLanes = n), t);
}
function qx(e, t, n) {
  var a = t.pendingProps;
  switch ((Kf(t), t.tag)) {
    case 16:
    case 15:
    case 0:
    case 11:
    case 7:
    case 8:
    case 12:
    case 9:
    case 14:
      return (we(t), null);
    case 1:
      return (we(t), null);
    case 3:
      return (
        (n = t.stateNode),
        (a = null),
        e !== null && (a = e.memoizedState.cache),
        t.memoizedState.cache !== a && (t.flags |= 2048),
        On(je),
        jo(),
        n.pendingContext &&
          ((n.context = n.pendingContext), (n.pendingContext = null)),
        (e === null || e.child === null) &&
          (ao(t)
            ? yn(t)
            : e === null ||
              (e.memoizedState.isDehydrated && !(t.flags & 256)) ||
              ((t.flags |= 1024), Rc())),
        we(t),
        null
      );
    case 26:
      var o = t.type,
        r = t.memoizedState;
      return (
        e === null
          ? (yn(t),
            r !== null ? (we(t), lg(t, r)) : (we(t), jc(t, o, null, a, n)))
          : r
            ? r !== e.memoizedState
              ? (yn(t), we(t), lg(t, r))
              : (we(t), (t.flags &= -16777217))
            : ((e = e.memoizedProps),
              e !== a && yn(t),
              we(t),
              jc(t, o, e, a, n)),
        null
      );
    case 27:
      if (
        (jl(t),
        (n = aa.current),
        (o = t.type),
        e !== null && t.stateNode != null)
      )
        e.memoizedProps !== a && yn(t);
      else {
        if (!a) {
          if (t.stateNode === null) throw Error(k(166));
          return (we(t), null);
        }
        ((e = un.current),
          ao(t) ? jm(t) : ((e = jy(o, a, n)), (t.stateNode = e), yn(t)));
      }
      return (we(t), null);
    case 5:
      if ((jl(t), (o = t.type), e !== null && t.stateNode != null))
        e.memoizedProps !== a && yn(t);
      else {
        if (!a) {
          if (t.stateNode === null) throw Error(k(166));
          return (we(t), null);
        }
        if (((r = un.current), ao(t))) jm(t);
        else {
          var i = as(aa.current);
          switch (r) {
            case 1:
              r = i.createElementNS("http://www.w3.org/2000/svg", o);
              break;
            case 2:
              r = i.createElementNS("http://www.w3.org/1998/Math/MathML", o);
              break;
            default:
              switch (o) {
                case "svg":
                  r = i.createElementNS("http://www.w3.org/2000/svg", o);
                  break;
                case "math":
                  r = i.createElementNS(
                    "http://www.w3.org/1998/Math/MathML",
                    o,
                  );
                  break;
                case "script":
                  ((r = i.createElement("div")),
                    (r.innerHTML = "<script><\/script>"),
                    (r = r.removeChild(r.firstChild)));
                  break;
                case "select":
                  ((r =
                    typeof a.is == "string"
                      ? i.createElement("select", { is: a.is })
                      : i.createElement("select")),
                    a.multiple
                      ? (r.multiple = !0)
                      : a.size && (r.size = a.size));
                  break;
                default:
                  r =
                    typeof a.is == "string"
                      ? i.createElement(o, { is: a.is })
                      : i.createElement(o);
              }
          }
          ((r[Ze] = t), (r[vt] = a));
          e: for (i = t.child; i !== null; ) {
            if (i.tag === 5 || i.tag === 6) r.appendChild(i.stateNode);
            else if (i.tag !== 4 && i.tag !== 27 && i.child !== null) {
              ((i.child.return = i), (i = i.child));
              continue;
            }
            if (i === t) break e;
            for (; i.sibling === null; ) {
              if (i.return === null || i.return === t) break e;
              i = i.return;
            }
            ((i.sibling.return = i.return), (i = i.sibling));
          }
          t.stateNode = r;
          e: switch ((et(r, o, a), o)) {
            case "button":
            case "input":
            case "select":
            case "textarea":
              a = !!a.autoFocus;
              break e;
            case "img":
              a = !0;
              break e;
            default:
              a = !1;
          }
          a && yn(t);
        }
      }
      return (
        we(t),
        jc(t, t.type, e === null ? null : e.memoizedProps, t.pendingProps, n),
        null
      );
    case 6:
      if (e && t.stateNode != null) e.memoizedProps !== a && yn(t);
      else {
        if (typeof a != "string" && t.stateNode === null) throw Error(k(166));
        if (((e = aa.current), ao(t))) {
          if (
            ((e = t.stateNode),
            (n = t.memoizedProps),
            (a = null),
            (o = Je),
            o !== null)
          )
            switch (o.tag) {
              case 27:
              case 5:
                a = o.memoizedProps;
            }
          ((e[Ze] = t),
            (e = !!(
              e.nodeValue === n ||
              (a !== null && a.suppressHydrationWarning === !0) ||
              Ny(e.nodeValue, n)
            )),
            e || ga(t, !0));
        } else ((e = as(e).createTextNode(a)), (e[Ze] = t), (t.stateNode = e));
      }
      return (we(t), null);
    case 31:
      if (((n = t.memoizedState), e === null || e.memoizedState !== null)) {
        if (((a = ao(t)), n !== null)) {
          if (e === null) {
            if (!a) throw Error(k(318));
            if (
              ((e = t.memoizedState),
              (e = e !== null ? e.dehydrated : null),
              !e)
            )
              throw Error(k(557));
            e[Ze] = t;
          } else
            (Ua(),
              !(t.flags & 128) && (t.memoizedState = null),
              (t.flags |= 4));
          (we(t), (e = !1));
        } else
          ((n = Rc()),
            e !== null &&
              e.memoizedState !== null &&
              (e.memoizedState.hydrationErrors = n),
            (e = !0));
        if (!e) return t.flags & 256 ? (Et(t), t) : (Et(t), null);
        if (t.flags & 128) throw Error(k(558));
      }
      return (we(t), null);
    case 13:
      if (
        ((a = t.memoizedState),
        e === null ||
          (e.memoizedState !== null && e.memoizedState.dehydrated !== null))
      ) {
        if (((o = ao(t)), a !== null && a.dehydrated !== null)) {
          if (e === null) {
            if (!o) throw Error(k(318));
            if (
              ((o = t.memoizedState),
              (o = o !== null ? o.dehydrated : null),
              !o)
            )
              throw Error(k(317));
            o[Ze] = t;
          } else
            (Ua(),
              !(t.flags & 128) && (t.memoizedState = null),
              (t.flags |= 4));
          (we(t), (o = !1));
        } else
          ((o = Rc()),
            e !== null &&
              e.memoizedState !== null &&
              (e.memoizedState.hydrationErrors = o),
            (o = !0));
        if (!o) return t.flags & 256 ? (Et(t), t) : (Et(t), null);
      }
      return (
        Et(t),
        t.flags & 128
          ? ((t.lanes = n), t)
          : ((n = a !== null),
            (e = e !== null && e.memoizedState !== null),
            n &&
              ((a = t.child),
              (o = null),
              a.alternate !== null &&
                a.alternate.memoizedState !== null &&
                a.alternate.memoizedState.cachePool !== null &&
                (o = a.alternate.memoizedState.cachePool.pool),
              (r = null),
              a.memoizedState !== null &&
                a.memoizedState.cachePool !== null &&
                (r = a.memoizedState.cachePool.pool),
              r !== o && (a.flags |= 2048)),
            n !== e && n && (t.child.flags |= 8192),
            qi(t, t.updateQueue),
            we(t),
            null)
      );
    case 4:
      return (jo(), e === null && bd(t.stateNode.containerInfo), we(t), null);
    case 10:
      return (On(t.type), we(t), null);
    case 19:
      if ((Fe(Ne), (a = t.memoizedState), a === null)) return (we(t), null);
      if (((o = (t.flags & 128) !== 0), (r = a.rendering), r === null))
        if (o) mr(a, !1);
        else {
          if (ke !== 0 || (e !== null && e.flags & 128))
            for (e = t.child; e !== null; ) {
              if (((r = Fl(e)), r !== null)) {
                for (
                  t.flags |= 128,
                    mr(a, !1),
                    e = r.updateQueue,
                    t.updateQueue = e,
                    qi(t, e),
                    t.subtreeFlags = 0,
                    e = n,
                    n = t.child;
                  n !== null;
                )
                  (qp(n, e), (n = n.sibling));
                return (
                  Se(Ne, (Ne.current & 1) | 2),
                  ie && Cn(t, a.treeForkCount),
                  t.child
                );
              }
              e = e.sibling;
            }
          a.tail !== null &&
            Rt() > Zl &&
            ((t.flags |= 128), (o = !0), mr(a, !1), (t.lanes = 4194304));
        }
      else {
        if (!o)
          if (((e = Fl(r)), e !== null)) {
            if (
              ((t.flags |= 128),
              (o = !0),
              (e = e.updateQueue),
              (t.updateQueue = e),
              qi(t, e),
              mr(a, !0),
              a.tail === null && a.tailMode === "hidden" && !r.alternate && !ie)
            )
              return (we(t), null);
          } else
            2 * Rt() - a.renderingStartTime > Zl &&
              n !== 536870912 &&
              ((t.flags |= 128), (o = !0), mr(a, !1), (t.lanes = 4194304));
        a.isBackwards
          ? ((r.sibling = t.child), (t.child = r))
          : ((e = a.last),
            e !== null ? (e.sibling = r) : (t.child = r),
            (a.last = r));
      }
      return a.tail !== null
        ? ((e = a.tail),
          (a.rendering = e),
          (a.tail = e.sibling),
          (a.renderingStartTime = Rt()),
          (e.sibling = null),
          (n = Ne.current),
          Se(Ne, o ? (n & 1) | 2 : n & 1),
          ie && Cn(t, a.treeForkCount),
          e)
        : (we(t), null);
    case 22:
    case 23:
      return (
        Et(t),
        Zf(),
        (a = t.memoizedState !== null),
        e !== null
          ? (e.memoizedState !== null) !== a && (t.flags |= 8192)
          : a && (t.flags |= 8192),
        a
          ? n & 536870912 &&
            !(t.flags & 128) &&
            (we(t), t.subtreeFlags & 6 && (t.flags |= 8192))
          : we(t),
        (n = t.updateQueue),
        n !== null && qi(t, n.retryQueue),
        (n = null),
        e !== null &&
          e.memoizedState !== null &&
          e.memoizedState.cachePool !== null &&
          (n = e.memoizedState.cachePool.pool),
        (a = null),
        t.memoizedState !== null &&
          t.memoizedState.cachePool !== null &&
          (a = t.memoizedState.cachePool.pool),
        a !== n && (t.flags |= 2048),
        e !== null && Fe(La),
        null
      );
    case 24:
      return (
        (n = null),
        e !== null && (n = e.memoizedState.cache),
        t.memoizedState.cache !== n && (t.flags |= 2048),
        On(je),
        we(t),
        null
      );
    case 25:
      return null;
    case 30:
      return null;
  }
  throw Error(k(156, t.tag));
}
function Xx(e, t) {
  switch ((Kf(t), t.tag)) {
    case 1:
      return (
        (e = t.flags),
        e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
      );
    case 3:
      return (
        On(je),
        jo(),
        (e = t.flags),
        e & 65536 && !(e & 128) ? ((t.flags = (e & -65537) | 128), t) : null
      );
    case 26:
    case 27:
    case 5:
      return (jl(t), null);
    case 31:
      if (t.memoizedState !== null) {
        if ((Et(t), t.alternate === null)) throw Error(k(340));
        Ua();
      }
      return (
        (e = t.flags),
        e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
      );
    case 13:
      if ((Et(t), (e = t.memoizedState), e !== null && e.dehydrated !== null)) {
        if (t.alternate === null) throw Error(k(340));
        Ua();
      }
      return (
        (e = t.flags),
        e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
      );
    case 19:
      return (Fe(Ne), null);
    case 4:
      return (jo(), null);
    case 10:
      return (On(t.type), null);
    case 22:
    case 23:
      return (
        Et(t),
        Zf(),
        e !== null && Fe(La),
        (e = t.flags),
        e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
      );
    case 24:
      return (On(je), null);
    case 25:
      return null;
    default:
      return null;
  }
}
function qv(e, t) {
  switch ((Kf(t), t.tag)) {
    case 3:
      (On(je), jo());
      break;
    case 26:
    case 27:
    case 5:
      jl(t);
      break;
    case 4:
      jo();
      break;
    case 31:
      t.memoizedState !== null && Et(t);
      break;
    case 13:
      Et(t);
      break;
    case 19:
      Fe(Ne);
      break;
    case 10:
      On(t.type);
      break;
    case 22:
    case 23:
      (Et(t), Zf(), e !== null && Fe(La));
      break;
    case 24:
      On(je);
  }
}
function xi(e, t) {
  try {
    var n = t.updateQueue,
      a = n !== null ? n.lastEffect : null;
    if (a !== null) {
      var o = a.next;
      n = o;
      do {
        if ((n.tag & e) === e) {
          a = void 0;
          var r = n.create,
            i = n.inst;
          ((a = r()), (i.destroy = a));
        }
        n = n.next;
      } while (n !== o);
    }
  } catch (l) {
    me(t, t.return, l);
  }
}
function ha(e, t, n) {
  try {
    var a = t.updateQueue,
      o = a !== null ? a.lastEffect : null;
    if (o !== null) {
      var r = o.next;
      a = r;
      do {
        if ((a.tag & e) === e) {
          var i = a.inst,
            l = i.destroy;
          if (l !== void 0) {
            ((i.destroy = void 0), (o = t));
            var s = n,
              c = l;
            try {
              c();
            } catch (f) {
              me(o, s, f);
            }
          }
        }
        a = a.next;
      } while (a !== r);
    }
  } catch (f) {
    me(t, t.return, f);
  }
}
function Xv(e) {
  var t = e.updateQueue;
  if (t !== null) {
    var n = e.stateNode;
    try {
      av(t, n);
    } catch (a) {
      me(e, e.return, a);
    }
  }
}
function $v(e, t, n) {
  ((n.props = Ia(e.type, e.memoizedProps)), (n.state = e.memoizedState));
  try {
    n.componentWillUnmount();
  } catch (a) {
    me(e, t, a);
  }
}
function Ur(e, t) {
  try {
    var n = e.ref;
    if (n !== null) {
      switch (e.tag) {
        case 26:
        case 27:
        case 5:
          var a = e.stateNode;
          break;
        case 30:
          a = e.stateNode;
          break;
        default:
          a = e.stateNode;
      }
      typeof n == "function" ? (e.refCleanup = n(a)) : (n.current = a);
    }
  } catch (o) {
    me(e, t, o);
  }
}
function ln(e, t) {
  var n = e.ref,
    a = e.refCleanup;
  if (n !== null)
    if (typeof a == "function")
      try {
        a();
      } catch (o) {
        me(e, t, o);
      } finally {
        ((e.refCleanup = null),
          (e = e.alternate),
          e != null && (e.refCleanup = null));
      }
    else if (typeof n == "function")
      try {
        n(null);
      } catch (o) {
        me(e, t, o);
      }
    else n.current = null;
}
function Qv(e) {
  var t = e.type,
    n = e.memoizedProps,
    a = e.stateNode;
  try {
    e: switch (t) {
      case "button":
      case "input":
      case "select":
      case "textarea":
        n.autoFocus && a.focus();
        break e;
      case "img":
        n.src ? (a.src = n.src) : n.srcSet && (a.srcset = n.srcSet);
    }
  } catch (o) {
    me(e, e.return, o);
  }
}
function Bc(e, t, n) {
  try {
    var a = e.stateNode;
    (p1(a, e.type, n, t), (a[vt] = t));
  } catch (o) {
    me(e, e.return, o);
  }
}
function Zv(e) {
  return (
    e.tag === 5 ||
    e.tag === 3 ||
    e.tag === 26 ||
    (e.tag === 27 && Sa(e.type)) ||
    e.tag === 4
  );
}
function Uc(e) {
  e: for (;;) {
    for (; e.sibling === null; ) {
      if (e.return === null || Zv(e.return)) return null;
      e = e.return;
    }
    for (
      e.sibling.return = e.return, e = e.sibling;
      e.tag !== 5 && e.tag !== 6 && e.tag !== 18;
    ) {
      if (
        (e.tag === 27 && Sa(e.type)) ||
        e.flags & 2 ||
        e.child === null ||
        e.tag === 4
      )
        continue e;
      ((e.child.return = e), (e = e.child));
    }
    if (!(e.flags & 2)) return e.stateNode;
  }
}
function Yu(e, t, n) {
  var a = e.tag;
  if (a === 5 || a === 6)
    ((e = e.stateNode),
      t
        ? (n.nodeType === 9
            ? n.body
            : n.nodeName === "HTML"
              ? n.ownerDocument.body
              : n
          ).insertBefore(e, t)
        : ((t =
            n.nodeType === 9
              ? n.body
              : n.nodeName === "HTML"
                ? n.ownerDocument.body
                : n),
          t.appendChild(e),
          (n = n._reactRootContainer),
          n != null || t.onclick !== null || (t.onclick = Rn)));
  else if (
    a !== 4 &&
    (a === 27 && Sa(e.type) && ((n = e.stateNode), (t = null)),
    (e = e.child),
    e !== null)
  )
    for (Yu(e, t, n), e = e.sibling; e !== null; )
      (Yu(e, t, n), (e = e.sibling));
}
function Ql(e, t, n) {
  var a = e.tag;
  if (a === 5 || a === 6)
    ((e = e.stateNode), t ? n.insertBefore(e, t) : n.appendChild(e));
  else if (
    a !== 4 &&
    (a === 27 && Sa(e.type) && (n = e.stateNode), (e = e.child), e !== null)
  )
    for (Ql(e, t, n), e = e.sibling; e !== null; )
      (Ql(e, t, n), (e = e.sibling));
}
function Jv(e) {
  var t = e.stateNode,
    n = e.memoizedProps;
  try {
    for (var a = e.type, o = t.attributes; o.length; )
      t.removeAttributeNode(o[0]);
    (et(t, a, n), (t[Ze] = e), (t[vt] = n));
  } catch (r) {
    me(e, e.return, r);
  }
}
var An = !1,
  ze = !1,
  Hc = !1,
  sg = typeof WeakSet == "function" ? WeakSet : Set,
  Ge = null;
function $x(e, t) {
  if (((e = e.containerInfo), (Zu = ls), (e = Hp(e)), Vf(e))) {
    if ("selectionStart" in e)
      var n = { start: e.selectionStart, end: e.selectionEnd };
    else
      e: {
        n = ((n = e.ownerDocument) && n.defaultView) || window;
        var a = n.getSelection && n.getSelection();
        if (a && a.rangeCount !== 0) {
          n = a.anchorNode;
          var o = a.anchorOffset,
            r = a.focusNode;
          a = a.focusOffset;
          try {
            (n.nodeType, r.nodeType);
          } catch {
            n = null;
            break e;
          }
          var i = 0,
            l = -1,
            s = -1,
            c = 0,
            f = 0,
            u = e,
            d = null;
          t: for (;;) {
            for (
              var g;
              u !== n || (o !== 0 && u.nodeType !== 3) || (l = i + o),
                u !== r || (a !== 0 && u.nodeType !== 3) || (s = i + a),
                u.nodeType === 3 && (i += u.nodeValue.length),
                (g = u.firstChild) !== null;
            )
              ((d = u), (u = g));
            for (;;) {
              if (u === e) break t;
              if (
                (d === n && ++c === o && (l = i),
                d === r && ++f === a && (s = i),
                (g = u.nextSibling) !== null)
              )
                break;
              ((u = d), (d = u.parentNode));
            }
            u = g;
          }
          n = l === -1 || s === -1 ? null : { start: l, end: s };
        } else n = null;
      }
    n = n || { start: 0, end: 0 };
  } else n = null;
  for (
    Ju = { focusedElem: e, selectionRange: n }, ls = !1, Ge = t;
    Ge !== null;
  )
    if (((t = Ge), (e = t.child), (t.subtreeFlags & 1028) !== 0 && e !== null))
      ((e.return = t), (Ge = e));
    else
      for (; Ge !== null; ) {
        switch (((t = Ge), (r = t.alternate), (e = t.flags), t.tag)) {
          case 0:
            if (
              e & 4 &&
              ((e = t.updateQueue),
              (e = e !== null ? e.events : null),
              e !== null)
            )
              for (n = 0; n < e.length; n++)
                ((o = e[n]), (o.ref.impl = o.nextImpl));
            break;
          case 11:
          case 15:
            break;
          case 1:
            if (e & 1024 && r !== null) {
              ((e = void 0),
                (n = t),
                (o = r.memoizedProps),
                (r = r.memoizedState),
                (a = n.stateNode));
              try {
                var S = Ia(n.type, o);
                ((e = a.getSnapshotBeforeUpdate(S, r)),
                  (a.__reactInternalSnapshotBeforeUpdate = e));
              } catch (v) {
                me(n, n.return, v);
              }
            }
            break;
          case 3:
            if (e & 1024) {
              if (((e = t.stateNode.containerInfo), (n = e.nodeType), n === 9))
                ef(e);
              else if (n === 1)
                switch (e.nodeName) {
                  case "HEAD":
                  case "HTML":
                  case "BODY":
                    ef(e);
                    break;
                  default:
                    e.textContent = "";
                }
            }
            break;
          case 5:
          case 26:
          case 27:
          case 6:
          case 4:
          case 17:
            break;
          default:
            if (e & 1024) throw Error(k(163));
        }
        if (((e = t.sibling), e !== null)) {
          ((e.return = t.return), (Ge = e));
          break;
        }
        Ge = t.return;
      }
}
function Wv(e, t, n) {
  var a = n.flags;
  switch (n.tag) {
    case 0:
    case 11:
    case 15:
      (Sn(e, n), a & 4 && xi(5, n));
      break;
    case 1:
      if ((Sn(e, n), a & 4))
        if (((e = n.stateNode), t === null))
          try {
            e.componentDidMount();
          } catch (i) {
            me(n, n.return, i);
          }
        else {
          var o = Ia(n.type, t.memoizedProps);
          t = t.memoizedState;
          try {
            e.componentDidUpdate(o, t, e.__reactInternalSnapshotBeforeUpdate);
          } catch (i) {
            me(n, n.return, i);
          }
        }
      (a & 64 && Xv(n), a & 512 && Ur(n, n.return));
      break;
    case 3:
      if ((Sn(e, n), a & 64 && ((e = n.updateQueue), e !== null))) {
        if (((t = null), n.child !== null))
          switch (n.child.tag) {
            case 27:
            case 5:
              t = n.child.stateNode;
              break;
            case 1:
              t = n.child.stateNode;
          }
        try {
          av(e, t);
        } catch (i) {
          me(n, n.return, i);
        }
      }
      break;
    case 27:
      t === null && a & 4 && Jv(n);
    case 26:
    case 5:
      (Sn(e, n), t === null && a & 4 && Qv(n), a & 512 && Ur(n, n.return));
      break;
    case 12:
      Sn(e, n);
      break;
    case 31:
      (Sn(e, n), a & 4 && ny(e, n));
      break;
    case 13:
      (Sn(e, n),
        a & 4 && ay(e, n),
        a & 64 &&
          ((e = n.memoizedState),
          e !== null &&
            ((e = e.dehydrated),
            e !== null && ((n = o1.bind(null, n)), C1(e, n)))));
      break;
    case 22:
      if (((a = n.memoizedState !== null || An), !a)) {
        ((t = (t !== null && t.memoizedState !== null) || ze), (o = An));
        var r = ze;
        ((An = a),
          (ze = t) && !r ? En(e, n, (n.subtreeFlags & 8772) !== 0) : Sn(e, n),
          (An = o),
          (ze = r));
      }
      break;
    case 30:
      break;
    default:
      Sn(e, n);
  }
}
function ey(e) {
  var t = e.alternate;
  (t !== null && ((e.alternate = null), ey(t)),
    (e.child = null),
    (e.deletions = null),
    (e.sibling = null),
    e.tag === 5 && ((t = e.stateNode), t !== null && zf(t)),
    (e.stateNode = null),
    (e.return = null),
    (e.dependencies = null),
    (e.memoizedProps = null),
    (e.memoizedState = null),
    (e.pendingProps = null),
    (e.stateNode = null),
    (e.updateQueue = null));
}
var Re = null,
  mt = !1;
function bn(e, t, n) {
  for (n = n.child; n !== null; ) (ty(e, t, n), (n = n.sibling));
}
function ty(e, t, n) {
  if (Mt && typeof Mt.onCommitFiberUnmount == "function")
    try {
      Mt.onCommitFiberUnmount(hi, n);
    } catch {}
  switch (n.tag) {
    case 26:
      (ze || ln(n, t),
        bn(e, t, n),
        n.memoizedState
          ? n.memoizedState.count--
          : n.stateNode && ((n = n.stateNode), n.parentNode.removeChild(n)));
      break;
    case 27:
      ze || ln(n, t);
      var a = Re,
        o = mt;
      (Sa(n.type) && ((Re = n.stateNode), (mt = !1)),
        bn(e, t, n),
        Ir(n.stateNode),
        (Re = a),
        (mt = o));
      break;
    case 5:
      ze || ln(n, t);
    case 6:
      if (
        ((a = Re),
        (o = mt),
        (Re = null),
        bn(e, t, n),
        (Re = a),
        (mt = o),
        Re !== null)
      )
        if (mt)
          try {
            (Re.nodeType === 9
              ? Re.body
              : Re.nodeName === "HTML"
                ? Re.ownerDocument.body
                : Re
            ).removeChild(n.stateNode);
          } catch (r) {
            me(n, t, r);
          }
        else
          try {
            Re.removeChild(n.stateNode);
          } catch (r) {
            me(n, t, r);
          }
      break;
    case 18:
      Re !== null &&
        (mt
          ? ((e = Re),
            wg(
              e.nodeType === 9
                ? e.body
                : e.nodeName === "HTML"
                  ? e.ownerDocument.body
                  : e,
              n.stateNode,
            ),
            Ko(e))
          : wg(Re, n.stateNode));
      break;
    case 4:
      ((a = Re),
        (o = mt),
        (Re = n.stateNode.containerInfo),
        (mt = !0),
        bn(e, t, n),
        (Re = a),
        (mt = o));
      break;
    case 0:
    case 11:
    case 14:
    case 15:
      (ha(2, n, t), ze || ha(4, n, t), bn(e, t, n));
      break;
    case 1:
      (ze ||
        (ln(n, t),
        (a = n.stateNode),
        typeof a.componentWillUnmount == "function" && $v(n, t, a)),
        bn(e, t, n));
      break;
    case 21:
      bn(e, t, n);
      break;
    case 22:
      ((ze = (a = ze) || n.memoizedState !== null), bn(e, t, n), (ze = a));
      break;
    default:
      bn(e, t, n);
  }
}
function ny(e, t) {
  if (
    t.memoizedState === null &&
    ((e = t.alternate), e !== null && ((e = e.memoizedState), e !== null))
  ) {
    e = e.dehydrated;
    try {
      Ko(e);
    } catch (n) {
      me(t, t.return, n);
    }
  }
}
function ay(e, t) {
  if (
    t.memoizedState === null &&
    ((e = t.alternate),
    e !== null &&
      ((e = e.memoizedState), e !== null && ((e = e.dehydrated), e !== null)))
  )
    try {
      Ko(e);
    } catch (n) {
      me(t, t.return, n);
    }
}
function Qx(e) {
  switch (e.tag) {
    case 31:
    case 13:
    case 19:
      var t = e.stateNode;
      return (t === null && (t = e.stateNode = new sg()), t);
    case 22:
      return (
        (e = e.stateNode),
        (t = e._retryCache),
        t === null && (t = e._retryCache = new sg()),
        t
      );
    default:
      throw Error(k(435, e.tag));
  }
}
function Xi(e, t) {
  var n = Qx(e);
  t.forEach(function (a) {
    if (!n.has(a)) {
      n.add(a);
      var o = r1.bind(null, e, a);
      a.then(o, o);
    }
  });
}
function ft(e, t) {
  var n = t.deletions;
  if (n !== null)
    for (var a = 0; a < n.length; a++) {
      var o = n[a],
        r = e,
        i = t,
        l = i;
      e: for (; l !== null; ) {
        switch (l.tag) {
          case 27:
            if (Sa(l.type)) {
              ((Re = l.stateNode), (mt = !1));
              break e;
            }
            break;
          case 5:
            ((Re = l.stateNode), (mt = !1));
            break e;
          case 3:
          case 4:
            ((Re = l.stateNode.containerInfo), (mt = !0));
            break e;
        }
        l = l.return;
      }
      if (Re === null) throw Error(k(160));
      (ty(r, i, o),
        (Re = null),
        (mt = !1),
        (r = o.alternate),
        r !== null && (r.return = null),
        (o.return = null));
    }
  if (t.subtreeFlags & 13886)
    for (t = t.child; t !== null; ) (oy(t, e), (t = t.sibling));
}
var Zt = null;
function oy(e, t) {
  var n = e.alternate,
    a = e.flags;
  switch (e.tag) {
    case 0:
    case 11:
    case 14:
    case 15:
      (ft(t, e),
        dt(e),
        a & 4 && (ha(3, e, e.return), xi(3, e), ha(5, e, e.return)));
      break;
    case 1:
      (ft(t, e),
        dt(e),
        a & 512 && (ze || n === null || ln(n, n.return)),
        a & 64 &&
          An &&
          ((e = e.updateQueue),
          e !== null &&
            ((a = e.callbacks),
            a !== null &&
              ((n = e.shared.hiddenCallbacks),
              (e.shared.hiddenCallbacks = n === null ? a : n.concat(a))))));
      break;
    case 26:
      var o = Zt;
      if (
        (ft(t, e),
        dt(e),
        a & 512 && (ze || n === null || ln(n, n.return)),
        a & 4)
      ) {
        var r = n !== null ? n.memoizedState : null;
        if (((a = e.memoizedState), n === null))
          if (a === null)
            if (e.stateNode === null) {
              e: {
                ((a = e.type),
                  (n = e.memoizedProps),
                  (o = o.ownerDocument || o));
                t: switch (a) {
                  case "title":
                    ((r = o.getElementsByTagName("title")[0]),
                      (!r ||
                        r[yi] ||
                        r[Ze] ||
                        r.namespaceURI === "http://www.w3.org/2000/svg" ||
                        r.hasAttribute("itemprop")) &&
                        ((r = o.createElement(a)),
                        o.head.insertBefore(
                          r,
                          o.querySelector("head > title"),
                        )),
                      et(r, a, n),
                      (r[Ze] = e),
                      Ye(r),
                      (a = r));
                    break e;
                  case "link":
                    var i = Mg("link", "href", o).get(a + (n.href || ""));
                    if (i) {
                      for (var l = 0; l < i.length; l++)
                        if (
                          ((r = i[l]),
                          r.getAttribute("href") ===
                            (n.href == null || n.href === "" ? null : n.href) &&
                            r.getAttribute("rel") ===
                              (n.rel == null ? null : n.rel) &&
                            r.getAttribute("title") ===
                              (n.title == null ? null : n.title) &&
                            r.getAttribute("crossorigin") ===
                              (n.crossOrigin == null ? null : n.crossOrigin))
                        ) {
                          i.splice(l, 1);
                          break t;
                        }
                    }
                    ((r = o.createElement(a)),
                      et(r, a, n),
                      o.head.appendChild(r));
                    break;
                  case "meta":
                    if (
                      (i = Mg("meta", "content", o).get(a + (n.content || "")))
                    ) {
                      for (l = 0; l < i.length; l++)
                        if (
                          ((r = i[l]),
                          r.getAttribute("content") ===
                            (n.content == null ? null : "" + n.content) &&
                            r.getAttribute("name") ===
                              (n.name == null ? null : n.name) &&
                            r.getAttribute("property") ===
                              (n.property == null ? null : n.property) &&
                            r.getAttribute("http-equiv") ===
                              (n.httpEquiv == null ? null : n.httpEquiv) &&
                            r.getAttribute("charset") ===
                              (n.charSet == null ? null : n.charSet))
                        ) {
                          i.splice(l, 1);
                          break t;
                        }
                    }
                    ((r = o.createElement(a)),
                      et(r, a, n),
                      o.head.appendChild(r));
                    break;
                  default:
                    throw Error(k(468, a));
                }
                ((r[Ze] = e), Ye(r), (a = r));
              }
              e.stateNode = a;
            } else Dg(o, e.type, e.stateNode);
          else e.stateNode = Rg(o, a, e.memoizedProps);
        else
          r !== a
            ? (r === null
                ? n.stateNode !== null &&
                  ((n = n.stateNode), n.parentNode.removeChild(n))
                : r.count--,
              a === null
                ? Dg(o, e.type, e.stateNode)
                : Rg(o, a, e.memoizedProps))
            : a === null &&
              e.stateNode !== null &&
              Bc(e, e.memoizedProps, n.memoizedProps);
      }
      break;
    case 27:
      (ft(t, e),
        dt(e),
        a & 512 && (ze || n === null || ln(n, n.return)),
        n !== null && a & 4 && Bc(e, e.memoizedProps, n.memoizedProps));
      break;
    case 5:
      if (
        (ft(t, e),
        dt(e),
        a & 512 && (ze || n === null || ln(n, n.return)),
        e.flags & 32)
      ) {
        o = e.stateNode;
        try {
          Uo(o, "");
        } catch (S) {
          me(e, e.return, S);
        }
      }
      (a & 4 &&
        e.stateNode != null &&
        ((o = e.memoizedProps), Bc(e, o, n !== null ? n.memoizedProps : o)),
        a & 1024 && (Hc = !0));
      break;
    case 6:
      if ((ft(t, e), dt(e), a & 4)) {
        if (e.stateNode === null) throw Error(k(162));
        ((a = e.memoizedProps), (n = e.stateNode));
        try {
          n.nodeValue = a;
        } catch (S) {
          me(e, e.return, S);
        }
      }
      break;
    case 3:
      if (
        ((Cl = null),
        (o = Zt),
        (Zt = os(t.containerInfo)),
        ft(t, e),
        (Zt = o),
        dt(e),
        a & 4 && n !== null && n.memoizedState.isDehydrated)
      )
        try {
          Ko(t.containerInfo);
        } catch (S) {
          me(e, e.return, S);
        }
      Hc && ((Hc = !1), ry(e));
      break;
    case 4:
      ((a = Zt),
        (Zt = os(e.stateNode.containerInfo)),
        ft(t, e),
        dt(e),
        (Zt = a));
      break;
    case 12:
      (ft(t, e), dt(e));
      break;
    case 31:
      (ft(t, e),
        dt(e),
        a & 4 &&
          ((a = e.updateQueue),
          a !== null && ((e.updateQueue = null), Xi(e, a))));
      break;
    case 13:
      (ft(t, e),
        dt(e),
        e.child.flags & 8192 &&
          (e.memoizedState !== null) !=
            (n !== null && n.memoizedState !== null) &&
          (Ps = Rt()),
        a & 4 &&
          ((a = e.updateQueue),
          a !== null && ((e.updateQueue = null), Xi(e, a))));
      break;
    case 22:
      o = e.memoizedState !== null;
      var s = n !== null && n.memoizedState !== null,
        c = An,
        f = ze;
      if (
        ((An = c || o),
        (ze = f || s),
        ft(t, e),
        (ze = f),
        (An = c),
        dt(e),
        a & 8192)
      )
        e: for (
          t = e.stateNode,
            t._visibility = o ? t._visibility & -2 : t._visibility | 1,
            o && (n === null || s || An || ze || Oa(e)),
            n = null,
            t = e;
          ;
        ) {
          if (t.tag === 5 || t.tag === 26) {
            if (n === null) {
              s = n = t;
              try {
                if (((r = s.stateNode), o))
                  ((i = r.style),
                    typeof i.setProperty == "function"
                      ? i.setProperty("display", "none", "important")
                      : (i.display = "none"));
                else {
                  l = s.stateNode;
                  var u = s.memoizedProps.style,
                    d =
                      u != null && u.hasOwnProperty("display")
                        ? u.display
                        : null;
                  l.style.display =
                    d == null || typeof d == "boolean" ? "" : ("" + d).trim();
                }
              } catch (S) {
                me(s, s.return, S);
              }
            }
          } else if (t.tag === 6) {
            if (n === null) {
              s = t;
              try {
                s.stateNode.nodeValue = o ? "" : s.memoizedProps;
              } catch (S) {
                me(s, s.return, S);
              }
            }
          } else if (t.tag === 18) {
            if (n === null) {
              s = t;
              try {
                var g = s.stateNode;
                o ? xg(g, !0) : xg(s.stateNode, !1);
              } catch (S) {
                me(s, s.return, S);
              }
            }
          } else if (
            ((t.tag !== 22 && t.tag !== 23) ||
              t.memoizedState === null ||
              t === e) &&
            t.child !== null
          ) {
            ((t.child.return = t), (t = t.child));
            continue;
          }
          if (t === e) break e;
          for (; t.sibling === null; ) {
            if (t.return === null || t.return === e) break e;
            (n === t && (n = null), (t = t.return));
          }
          (n === t && (n = null),
            (t.sibling.return = t.return),
            (t = t.sibling));
        }
      a & 4 &&
        ((a = e.updateQueue),
        a !== null &&
          ((n = a.retryQueue),
          n !== null && ((a.retryQueue = null), Xi(e, n))));
      break;
    case 19:
      (ft(t, e),
        dt(e),
        a & 4 &&
          ((a = e.updateQueue),
          a !== null && ((e.updateQueue = null), Xi(e, a))));
      break;
    case 30:
      break;
    case 21:
      break;
    default:
      (ft(t, e), dt(e));
  }
}
function dt(e) {
  var t = e.flags;
  if (t & 2) {
    try {
      for (var n, a = e.return; a !== null; ) {
        if (Zv(a)) {
          n = a;
          break;
        }
        a = a.return;
      }
      if (n == null) throw Error(k(160));
      switch (n.tag) {
        case 27:
          var o = n.stateNode,
            r = Uc(e);
          Ql(e, r, o);
          break;
        case 5:
          var i = n.stateNode;
          n.flags & 32 && (Uo(i, ""), (n.flags &= -33));
          var l = Uc(e);
          Ql(e, l, i);
          break;
        case 3:
        case 4:
          var s = n.stateNode.containerInfo,
            c = Uc(e);
          Yu(e, c, s);
          break;
        default:
          throw Error(k(161));
      }
    } catch (f) {
      me(e, e.return, f);
    }
    e.flags &= -3;
  }
  t & 4096 && (e.flags &= -4097);
}
function ry(e) {
  if (e.subtreeFlags & 1024)
    for (e = e.child; e !== null; ) {
      var t = e;
      (ry(t),
        t.tag === 5 && t.flags & 1024 && t.stateNode.reset(),
        (e = e.sibling));
    }
}
function Sn(e, t) {
  if (t.subtreeFlags & 8772)
    for (t = t.child; t !== null; ) (Wv(e, t.alternate, t), (t = t.sibling));
}
function Oa(e) {
  for (e = e.child; e !== null; ) {
    var t = e;
    switch (t.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        (ha(4, t, t.return), Oa(t));
        break;
      case 1:
        ln(t, t.return);
        var n = t.stateNode;
        (typeof n.componentWillUnmount == "function" && $v(t, t.return, n),
          Oa(t));
        break;
      case 27:
        Ir(t.stateNode);
      case 26:
      case 5:
        (ln(t, t.return), Oa(t));
        break;
      case 22:
        t.memoizedState === null && Oa(t);
        break;
      case 30:
        Oa(t);
        break;
      default:
        Oa(t);
    }
    e = e.sibling;
  }
}
function En(e, t, n) {
  for (n = n && (t.subtreeFlags & 8772) !== 0, t = t.child; t !== null; ) {
    var a = t.alternate,
      o = e,
      r = t,
      i = r.flags;
    switch (r.tag) {
      case 0:
      case 11:
      case 15:
        (En(o, r, n), xi(4, r));
        break;
      case 1:
        if (
          (En(o, r, n),
          (a = r),
          (o = a.stateNode),
          typeof o.componentDidMount == "function")
        )
          try {
            o.componentDidMount();
          } catch (c) {
            me(a, a.return, c);
          }
        if (((a = r), (o = a.updateQueue), o !== null)) {
          var l = a.stateNode;
          try {
            var s = o.shared.hiddenCallbacks;
            if (s !== null)
              for (o.shared.hiddenCallbacks = null, o = 0; o < s.length; o++)
                nv(s[o], l);
          } catch (c) {
            me(a, a.return, c);
          }
        }
        (n && i & 64 && Xv(r), Ur(r, r.return));
        break;
      case 27:
        Jv(r);
      case 26:
      case 5:
        (En(o, r, n), n && a === null && i & 4 && Qv(r), Ur(r, r.return));
        break;
      case 12:
        En(o, r, n);
        break;
      case 31:
        (En(o, r, n), n && i & 4 && ny(o, r));
        break;
      case 13:
        (En(o, r, n), n && i & 4 && ay(o, r));
        break;
      case 22:
        (r.memoizedState === null && En(o, r, n), Ur(r, r.return));
        break;
      case 30:
        break;
      default:
        En(o, r, n);
    }
    t = t.sibling;
  }
}
function md(e, t) {
  var n = null;
  (e !== null &&
    e.memoizedState !== null &&
    e.memoizedState.cachePool !== null &&
    (n = e.memoizedState.cachePool.pool),
    (e = null),
    t.memoizedState !== null &&
      t.memoizedState.cachePool !== null &&
      (e = t.memoizedState.cachePool.pool),
    e !== n && (e != null && e.refCount++, n != null && Si(n)));
}
function gd(e, t) {
  ((e = null),
    t.alternate !== null && (e = t.alternate.memoizedState.cache),
    (t = t.memoizedState.cache),
    t !== e && (t.refCount++, e != null && Si(e)));
}
function Qt(e, t, n, a) {
  if (t.subtreeFlags & 10256)
    for (t = t.child; t !== null; ) (iy(e, t, n, a), (t = t.sibling));
}
function iy(e, t, n, a) {
  var o = t.flags;
  switch (t.tag) {
    case 0:
    case 11:
    case 15:
      (Qt(e, t, n, a), o & 2048 && xi(9, t));
      break;
    case 1:
      Qt(e, t, n, a);
      break;
    case 3:
      (Qt(e, t, n, a),
        o & 2048 &&
          ((e = null),
          t.alternate !== null && (e = t.alternate.memoizedState.cache),
          (t = t.memoizedState.cache),
          t !== e && (t.refCount++, e != null && Si(e))));
      break;
    case 12:
      if (o & 2048) {
        (Qt(e, t, n, a), (e = t.stateNode));
        try {
          var r = t.memoizedProps,
            i = r.id,
            l = r.onPostCommit;
          typeof l == "function" &&
            l(
              i,
              t.alternate === null ? "mount" : "update",
              e.passiveEffectDuration,
              -0,
            );
        } catch (s) {
          me(t, t.return, s);
        }
      } else Qt(e, t, n, a);
      break;
    case 31:
      Qt(e, t, n, a);
      break;
    case 13:
      Qt(e, t, n, a);
      break;
    case 23:
      break;
    case 22:
      ((r = t.stateNode),
        (i = t.alternate),
        t.memoizedState !== null
          ? r._visibility & 2
            ? Qt(e, t, n, a)
            : Hr(e, t)
          : r._visibility & 2
            ? Qt(e, t, n, a)
            : ((r._visibility |= 2),
              mo(e, t, n, a, (t.subtreeFlags & 10256) !== 0 || !1)),
        o & 2048 && md(i, t));
      break;
    case 24:
      (Qt(e, t, n, a), o & 2048 && gd(t.alternate, t));
      break;
    default:
      Qt(e, t, n, a);
  }
}
function mo(e, t, n, a, o) {
  for (
    o = o && ((t.subtreeFlags & 10256) !== 0 || !1), t = t.child;
    t !== null;
  ) {
    var r = e,
      i = t,
      l = n,
      s = a,
      c = i.flags;
    switch (i.tag) {
      case 0:
      case 11:
      case 15:
        (mo(r, i, l, s, o), xi(8, i));
        break;
      case 23:
        break;
      case 22:
        var f = i.stateNode;
        (i.memoizedState !== null
          ? f._visibility & 2
            ? mo(r, i, l, s, o)
            : Hr(r, i)
          : ((f._visibility |= 2), mo(r, i, l, s, o)),
          o && c & 2048 && md(i.alternate, i));
        break;
      case 24:
        (mo(r, i, l, s, o), o && c & 2048 && gd(i.alternate, i));
        break;
      default:
        mo(r, i, l, s, o);
    }
    t = t.sibling;
  }
}
function Hr(e, t) {
  if (t.subtreeFlags & 10256)
    for (t = t.child; t !== null; ) {
      var n = e,
        a = t,
        o = a.flags;
      switch (a.tag) {
        case 22:
          (Hr(n, a), o & 2048 && md(a.alternate, a));
          break;
        case 24:
          (Hr(n, a), o & 2048 && gd(a.alternate, a));
          break;
        default:
          Hr(n, a);
      }
      t = t.sibling;
    }
}
var Rr = 8192;
function oo(e, t, n) {
  if (e.subtreeFlags & Rr)
    for (e = e.child; e !== null; ) (ly(e, t, n), (e = e.sibling));
}
function ly(e, t, n) {
  switch (e.tag) {
    case 26:
      (oo(e, t, n),
        e.flags & Rr &&
          e.memoizedState !== null &&
          j1(n, Zt, e.memoizedState, e.memoizedProps));
      break;
    case 5:
      oo(e, t, n);
      break;
    case 3:
    case 4:
      var a = Zt;
      ((Zt = os(e.stateNode.containerInfo)), oo(e, t, n), (Zt = a));
      break;
    case 22:
      e.memoizedState === null &&
        ((a = e.alternate),
        a !== null && a.memoizedState !== null
          ? ((a = Rr), (Rr = 16777216), oo(e, t, n), (Rr = a))
          : oo(e, t, n));
      break;
    default:
      oo(e, t, n);
  }
}
function sy(e) {
  var t = e.alternate;
  if (t !== null && ((e = t.child), e !== null)) {
    t.child = null;
    do ((t = e.sibling), (e.sibling = null), (e = t));
    while (e !== null);
  }
}
function gr(e) {
  var t = e.deletions;
  if (e.flags & 16) {
    if (t !== null)
      for (var n = 0; n < t.length; n++) {
        var a = t[n];
        ((Ge = a), uy(a, e));
      }
    sy(e);
  }
  if (e.subtreeFlags & 10256)
    for (e = e.child; e !== null; ) (cy(e), (e = e.sibling));
}
function cy(e) {
  switch (e.tag) {
    case 0:
    case 11:
    case 15:
      (gr(e), e.flags & 2048 && ha(9, e, e.return));
      break;
    case 3:
      gr(e);
      break;
    case 12:
      gr(e);
      break;
    case 22:
      var t = e.stateNode;
      e.memoizedState !== null &&
      t._visibility & 2 &&
      (e.return === null || e.return.tag !== 13)
        ? ((t._visibility &= -3), xl(e))
        : gr(e);
      break;
    default:
      gr(e);
  }
}
function xl(e) {
  var t = e.deletions;
  if (e.flags & 16) {
    if (t !== null)
      for (var n = 0; n < t.length; n++) {
        var a = t[n];
        ((Ge = a), uy(a, e));
      }
    sy(e);
  }
  for (e = e.child; e !== null; ) {
    switch (((t = e), t.tag)) {
      case 0:
      case 11:
      case 15:
        (ha(8, t, t.return), xl(t));
        break;
      case 22:
        ((n = t.stateNode),
          n._visibility & 2 && ((n._visibility &= -3), xl(t)));
        break;
      default:
        xl(t);
    }
    e = e.sibling;
  }
}
function uy(e, t) {
  for (; Ge !== null; ) {
    var n = Ge;
    switch (n.tag) {
      case 0:
      case 11:
      case 15:
        ha(8, n, t);
        break;
      case 23:
      case 22:
        if (n.memoizedState !== null && n.memoizedState.cachePool !== null) {
          var a = n.memoizedState.cachePool.pool;
          a != null && a.refCount++;
        }
        break;
      case 24:
        Si(n.memoizedState.cache);
    }
    if (((a = n.child), a !== null)) ((a.return = n), (Ge = a));
    else
      e: for (n = e; Ge !== null; ) {
        a = Ge;
        var o = a.sibling,
          r = a.return;
        if ((ey(a), a === n)) {
          Ge = null;
          break e;
        }
        if (o !== null) {
          ((o.return = r), (Ge = o));
          break e;
        }
        Ge = r;
      }
  }
}
var Zx = {
    getCacheForType: function (e) {
      var t = We(je),
        n = t.data.get(e);
      return (n === void 0 && ((n = e()), t.data.set(e, n)), n);
    },
    cacheSignal: function () {
      return We(je).controller.signal;
    },
  },
  Jx = typeof WeakMap == "function" ? WeakMap : Map,
  ce = 0,
  ve = null,
  ae = null,
  re = 0,
  de = 0,
  xt = null,
  ea = !1,
  tr = !1,
  hd = !1,
  jn = 0,
  ke = 0,
  pa = 0,
  ja = 0,
  pd = 0,
  Tt = 0,
  Io = 0,
  Pr = null,
  gt = null,
  Fu = !1,
  Ps = 0,
  fy = 0,
  Zl = 1 / 0,
  Jl = null,
  la = null,
  He = 0,
  sa = null,
  Go = null,
  kn = 0,
  Ku = 0,
  qu = null,
  dy = null,
  Vr = 0,
  Xu = null;
function Ot() {
  return ce & 2 && re !== 0 ? re & -re : K.T !== null ? yd() : wp();
}
function my() {
  if (Tt === 0)
    if (!(re & 536870912) || ie) {
      var e = Pi;
      ((Pi <<= 1), !(Pi & 3932160) && (Pi = 262144), (Tt = e));
    } else Tt = 536870912;
  return ((e = _t.current), e !== null && (e.flags |= 32), Tt);
}
function pt(e, t, n) {
  (((e === ve && (de === 2 || de === 9)) || e.cancelPendingCommit !== null) &&
    (Yo(e, 0), ta(e, re, Tt, !1)),
    vi(e, n),
    (!(ce & 2) || e !== ve) &&
      (e === ve && (!(ce & 2) && (ja |= n), ke === 4 && ta(e, re, Tt, !1)),
      gn(e)));
}
function gy(e, t, n) {
  if (ce & 6) throw Error(k(327));
  var a = (!n && (t & 127) === 0 && (t & e.expiredLanes) === 0) || pi(e, t),
    o = a ? t1(e, t) : Pc(e, t, !0),
    r = a;
  do {
    if (o === 0) {
      tr && !a && ta(e, t, 0, !1);
      break;
    } else {
      if (((n = e.current.alternate), r && !Wx(n))) {
        ((o = Pc(e, t, !1)), (r = !1));
        continue;
      }
      if (o === 2) {
        if (((r = t), e.errorRecoveryDisabledLanes & r)) var i = 0;
        else
          ((i = e.pendingLanes & -536870913),
            (i = i !== 0 ? i : i & 536870912 ? 536870912 : 0));
        if (i !== 0) {
          t = i;
          e: {
            var l = e;
            o = Pr;
            var s = l.current.memoizedState.isDehydrated;
            if ((s && (Yo(l, i).flags |= 256), (i = Pc(l, i, !1)), i !== 2)) {
              if (hd && !s) {
                ((l.errorRecoveryDisabledLanes |= r), (ja |= r), (o = 4));
                break e;
              }
              ((r = gt),
                (gt = o),
                r !== null && (gt === null ? (gt = r) : gt.push.apply(gt, r)));
            }
            o = i;
          }
          if (((r = !1), o !== 2)) continue;
        }
      }
      if (o === 1) {
        (Yo(e, 0), ta(e, t, 0, !0));
        break;
      }
      e: {
        switch (((a = e), (r = o), r)) {
          case 0:
          case 1:
            throw Error(k(345));
          case 4:
            if ((t & 4194048) !== t) break;
          case 6:
            ta(a, t, Tt, !ea);
            break e;
          case 2:
            gt = null;
            break;
          case 3:
          case 5:
            break;
          default:
            throw Error(k(329));
        }
        if ((t & 62914560) === t && ((o = Ps + 300 - Rt()), 10 < o)) {
          if ((ta(a, t, Tt, !ea), Ds(a, 0, !0) !== 0)) break e;
          ((kn = t),
            (a.timeoutHandle = Ly(
              cg.bind(
                null,
                a,
                n,
                gt,
                Jl,
                Fu,
                t,
                Tt,
                ja,
                Io,
                ea,
                r,
                "Throttled",
                -0,
                0,
              ),
              o,
            )));
          break e;
        }
        cg(a, n, gt, Jl, Fu, t, Tt, ja, Io, ea, r, null, -0, 0);
      }
    }
    break;
  } while (!0);
  gn(e);
}
function cg(e, t, n, a, o, r, i, l, s, c, f, u, d, g) {
  if (
    ((e.timeoutHandle = -1),
    (u = t.subtreeFlags),
    u & 8192 || (u & 16785408) === 16785408)
  ) {
    ((u = {
      stylesheets: null,
      count: 0,
      imgCount: 0,
      imgBytes: 0,
      suspenseyImages: [],
      waitingForImages: !0,
      waitingForViewTransition: !1,
      unsuspend: Rn,
    }),
      ly(t, r, u));
    var S =
      (r & 62914560) === r ? Ps - Rt() : (r & 4194048) === r ? fy - Rt() : 0;
    if (((S = B1(u, S)), S !== null)) {
      ((kn = r),
        (e.cancelPendingCommit = S(
          fg.bind(null, e, t, r, n, a, o, i, l, s, f, u, null, d, g),
        )),
        ta(e, r, i, !c));
      return;
    }
  }
  fg(e, t, r, n, a, o, i, l, s);
}
function Wx(e) {
  for (var t = e; ; ) {
    var n = t.tag;
    if (
      (n === 0 || n === 11 || n === 15) &&
      t.flags & 16384 &&
      ((n = t.updateQueue), n !== null && ((n = n.stores), n !== null))
    )
      for (var a = 0; a < n.length; a++) {
        var o = n[a],
          r = o.getSnapshot;
        o = o.value;
        try {
          if (!Nt(r(), o)) return !1;
        } catch {
          return !1;
        }
      }
    if (((n = t.child), t.subtreeFlags & 16384 && n !== null))
      ((n.return = t), (t = n));
    else {
      if (t === e) break;
      for (; t.sibling === null; ) {
        if (t.return === null || t.return === e) return !0;
        t = t.return;
      }
      ((t.sibling.return = t.return), (t = t.sibling));
    }
  }
  return !0;
}
function ta(e, t, n, a) {
  ((t &= ~pd),
    (t &= ~ja),
    (e.suspendedLanes |= t),
    (e.pingedLanes &= ~t),
    a && (e.warmLanes |= t),
    (a = e.expirationTimes));
  for (var o = t; 0 < o; ) {
    var r = 31 - Dt(o),
      i = 1 << r;
    ((a[r] = -1), (o &= ~i));
  }
  n !== 0 && yp(e, n, t);
}
function Vs() {
  return ce & 6 ? !0 : (Ei(0), !1);
}
function vd() {
  if (ae !== null) {
    if (de === 0) var e = ae.return;
    else ((e = ae), (Mn = $a = null), nd(e), (ko = null), (Jr = 0), (e = ae));
    for (; e !== null; ) (qv(e.alternate, e), (e = e.return));
    ae = null;
  }
}
function Yo(e, t) {
  var n = e.timeoutHandle;
  (n !== -1 && ((e.timeoutHandle = -1), b1(n)),
    (n = e.cancelPendingCommit),
    n !== null && ((e.cancelPendingCommit = null), n()),
    (kn = 0),
    vd(),
    (ve = e),
    (ae = n = Dn(e.current, null)),
    (re = t),
    (de = 0),
    (xt = null),
    (ea = !1),
    (tr = pi(e, t)),
    (hd = !1),
    (Io = Tt = pd = ja = pa = ke = 0),
    (gt = Pr = null),
    (Fu = !1),
    t & 8 && (t |= t & 32));
  var a = e.entangledLanes;
  if (a !== 0)
    for (e = e.entanglements, a &= t; 0 < a; ) {
      var o = 31 - Dt(a),
        r = 1 << o;
      ((t |= e[o]), (a &= ~r));
    }
  return ((jn = t), _s(), n);
}
function hy(e, t) {
  ((J = null),
    (K.H = ei),
    t === er || t === zs
      ? ((t = Vm()), (de = 3))
      : t === $f
        ? ((t = Vm()), (de = 4))
        : (de =
            t === fd
              ? 8
              : t !== null &&
                  typeof t == "object" &&
                  typeof t.then == "function"
                ? 6
                : 1),
    (xt = t),
    ae === null && ((ke = 1), Xl(e, Vt(t, e.current))));
}
function py() {
  var e = _t.current;
  return e === null
    ? !0
    : (re & 4194048) === re
      ? Gt === null
      : (re & 62914560) === re || re & 536870912
        ? e === Gt
        : !1;
}
function vy() {
  var e = K.H;
  return ((K.H = ei), e === null ? ei : e);
}
function yy() {
  var e = K.A;
  return ((K.A = Zx), e);
}
function Wl() {
  ((ke = 4),
    ea || ((re & 4194048) !== re && _t.current !== null) || (tr = !0),
    (!(pa & 134217727) && !(ja & 134217727)) ||
      ve === null ||
      ta(ve, re, Tt, !1));
}
function Pc(e, t, n) {
  var a = ce;
  ce |= 2;
  var o = vy(),
    r = yy();
  ((ve !== e || re !== t) && ((Jl = null), Yo(e, t)), (t = !1));
  var i = ke;
  e: do
    try {
      if (de !== 0 && ae !== null) {
        var l = ae,
          s = xt;
        switch (de) {
          case 8:
            (vd(), (i = 6));
            break e;
          case 3:
          case 2:
          case 9:
          case 6:
            _t.current === null && (t = !0);
            var c = de;
            if (((de = 0), (xt = null), To(e, l, s, c), n && tr)) {
              i = 0;
              break e;
            }
            break;
          default:
            ((c = de), (de = 0), (xt = null), To(e, l, s, c));
        }
      }
      (e1(), (i = ke));
      break;
    } catch (f) {
      hy(e, f);
    }
  while (!0);
  return (
    t && e.shellSuspendCounter++,
    (Mn = $a = null),
    (ce = a),
    (K.H = o),
    (K.A = r),
    ae === null && ((ve = null), (re = 0), _s()),
    i
  );
}
function e1() {
  for (; ae !== null; ) by(ae);
}
function t1(e, t) {
  var n = ce;
  ce |= 2;
  var a = vy(),
    o = yy();
  ve !== e || re !== t
    ? ((Jl = null), (Zl = Rt() + 500), Yo(e, t))
    : (tr = pi(e, t));
  e: do
    try {
      if (de !== 0 && ae !== null) {
        t = ae;
        var r = xt;
        t: switch (de) {
          case 1:
            ((de = 0), (xt = null), To(e, t, r, 1));
            break;
          case 2:
          case 9:
            if (Pm(r)) {
              ((de = 0), (xt = null), ug(t));
              break;
            }
            ((t = function () {
              ((de !== 2 && de !== 9) || ve !== e || (de = 7), gn(e));
            }),
              r.then(t, t));
            break e;
          case 3:
            de = 7;
            break e;
          case 4:
            de = 5;
            break e;
          case 7:
            Pm(r)
              ? ((de = 0), (xt = null), ug(t))
              : ((de = 0), (xt = null), To(e, t, r, 7));
            break;
          case 5:
            var i = null;
            switch (ae.tag) {
              case 26:
                i = ae.memoizedState;
              case 5:
              case 27:
                var l = ae;
                if (i ? Hy(i) : l.stateNode.complete) {
                  ((de = 0), (xt = null));
                  var s = l.sibling;
                  if (s !== null) ae = s;
                  else {
                    var c = l.return;
                    c !== null ? ((ae = c), Is(c)) : (ae = null);
                  }
                  break t;
                }
            }
            ((de = 0), (xt = null), To(e, t, r, 5));
            break;
          case 6:
            ((de = 0), (xt = null), To(e, t, r, 6));
            break;
          case 8:
            (vd(), (ke = 6));
            break e;
          default:
            throw Error(k(462));
        }
      }
      n1();
      break;
    } catch (f) {
      hy(e, f);
    }
  while (!0);
  return (
    (Mn = $a = null),
    (K.H = a),
    (K.A = o),
    (ce = n),
    ae !== null ? 0 : ((ve = null), (re = 0), _s(), ke)
  );
}
function n1() {
  for (; ae !== null && !Aw(); ) by(ae);
}
function by(e) {
  var t = Kv(e.alternate, e, jn);
  ((e.memoizedProps = e.pendingProps), t === null ? Is(e) : (ae = t));
}
function ug(e) {
  var t = e,
    n = t.alternate;
  switch (t.tag) {
    case 15:
    case 0:
      t = ag(n, t, t.pendingProps, t.type, void 0, re);
      break;
    case 11:
      t = ag(n, t, t.pendingProps, t.type.render, t.ref, re);
      break;
    case 5:
      nd(t);
    default:
      (qv(n, t), (t = ae = qp(t, jn)), (t = Kv(n, t, jn)));
  }
  ((e.memoizedProps = e.pendingProps), t === null ? Is(e) : (ae = t));
}
function To(e, t, n, a) {
  ((Mn = $a = null), nd(t), (ko = null), (Jr = 0));
  var o = t.return;
  try {
    if (Yx(e, o, t, n, re)) {
      ((ke = 1), Xl(e, Vt(n, e.current)), (ae = null));
      return;
    }
  } catch (r) {
    if (o !== null) throw ((ae = o), r);
    ((ke = 1), Xl(e, Vt(n, e.current)), (ae = null));
    return;
  }
  t.flags & 32768
    ? (ie || a === 1
        ? (e = !0)
        : tr || re & 536870912
          ? (e = !1)
          : ((ea = e = !0),
            (a === 2 || a === 9 || a === 3 || a === 6) &&
              ((a = _t.current),
              a !== null && a.tag === 13 && (a.flags |= 16384))),
      Sy(t, e))
    : Is(t);
}
function Is(e) {
  var t = e;
  do {
    if (t.flags & 32768) {
      Sy(t, ea);
      return;
    }
    e = t.return;
    var n = qx(t.alternate, t, jn);
    if (n !== null) {
      ae = n;
      return;
    }
    if (((t = t.sibling), t !== null)) {
      ae = t;
      return;
    }
    ae = t = e;
  } while (t !== null);
  ke === 0 && (ke = 5);
}
function Sy(e, t) {
  do {
    var n = Xx(e.alternate, e);
    if (n !== null) {
      ((n.flags &= 32767), (ae = n));
      return;
    }
    if (
      ((n = e.return),
      n !== null &&
        ((n.flags |= 32768), (n.subtreeFlags = 0), (n.deletions = null)),
      !t && ((e = e.sibling), e !== null))
    ) {
      ae = e;
      return;
    }
    ae = e = n;
  } while (e !== null);
  ((ke = 6), (ae = null));
}
function fg(e, t, n, a, o, r, i, l, s) {
  e.cancelPendingCommit = null;
  do Gs();
  while (He !== 0);
  if (ce & 6) throw Error(k(327));
  if (t !== null) {
    if (t === e.current) throw Error(k(177));
    if (
      ((r = t.lanes | t.childLanes),
      (r |= If),
      zw(e, n, r, i, l, s),
      e === ve && ((ae = ve = null), (re = 0)),
      (Go = t),
      (sa = e),
      (kn = n),
      (Ku = r),
      (qu = o),
      (dy = a),
      t.subtreeFlags & 10256 || t.flags & 10256
        ? ((e.callbackNode = null),
          (e.callbackPriority = 0),
          i1(Bl, function () {
            return (Ay(), null);
          }))
        : ((e.callbackNode = null), (e.callbackPriority = 0)),
      (a = (t.flags & 13878) !== 0),
      t.subtreeFlags & 13878 || a)
    ) {
      ((a = K.T), (K.T = null), (o = ue.p), (ue.p = 2), (i = ce), (ce |= 4));
      try {
        $x(e, t, n);
      } finally {
        ((ce = i), (ue.p = o), (K.T = a));
      }
    }
    ((He = 1), wy(), xy(), Ey());
  }
}
function wy() {
  if (He === 1) {
    He = 0;
    var e = sa,
      t = Go,
      n = (t.flags & 13878) !== 0;
    if (t.subtreeFlags & 13878 || n) {
      ((n = K.T), (K.T = null));
      var a = ue.p;
      ue.p = 2;
      var o = ce;
      ce |= 4;
      try {
        oy(t, e);
        var r = Ju,
          i = Hp(e.containerInfo),
          l = r.focusedElem,
          s = r.selectionRange;
        if (
          i !== l &&
          l &&
          l.ownerDocument &&
          Up(l.ownerDocument.documentElement, l)
        ) {
          if (s !== null && Vf(l)) {
            var c = s.start,
              f = s.end;
            if ((f === void 0 && (f = c), "selectionStart" in l))
              ((l.selectionStart = c),
                (l.selectionEnd = Math.min(f, l.value.length)));
            else {
              var u = l.ownerDocument || document,
                d = (u && u.defaultView) || window;
              if (d.getSelection) {
                var g = d.getSelection(),
                  S = l.textContent.length,
                  v = Math.min(s.start, S),
                  b = s.end === void 0 ? v : Math.min(s.end, S);
                !g.extend && v > b && ((i = b), (b = v), (v = i));
                var m = _m(l, v),
                  h = _m(l, b);
                if (
                  m &&
                  h &&
                  (g.rangeCount !== 1 ||
                    g.anchorNode !== m.node ||
                    g.anchorOffset !== m.offset ||
                    g.focusNode !== h.node ||
                    g.focusOffset !== h.offset)
                ) {
                  var y = u.createRange();
                  (y.setStart(m.node, m.offset),
                    g.removeAllRanges(),
                    v > b
                      ? (g.addRange(y), g.extend(h.node, h.offset))
                      : (y.setEnd(h.node, h.offset), g.addRange(y)));
                }
              }
            }
          }
          for (u = [], g = l; (g = g.parentNode); )
            g.nodeType === 1 &&
              u.push({ element: g, left: g.scrollLeft, top: g.scrollTop });
          for (
            typeof l.focus == "function" && l.focus(), l = 0;
            l < u.length;
            l++
          ) {
            var w = u[l];
            ((w.element.scrollLeft = w.left), (w.element.scrollTop = w.top));
          }
        }
        ((ls = !!Zu), (Ju = Zu = null));
      } finally {
        ((ce = o), (ue.p = a), (K.T = n));
      }
    }
    ((e.current = t), (He = 2));
  }
}
function xy() {
  if (He === 2) {
    He = 0;
    var e = sa,
      t = Go,
      n = (t.flags & 8772) !== 0;
    if (t.subtreeFlags & 8772 || n) {
      ((n = K.T), (K.T = null));
      var a = ue.p;
      ue.p = 2;
      var o = ce;
      ce |= 4;
      try {
        Wv(e, t.alternate, t);
      } finally {
        ((ce = o), (ue.p = a), (K.T = n));
      }
    }
    He = 3;
  }
}
function Ey() {
  if (He === 4 || He === 3) {
    ((He = 0), Tw());
    var e = sa,
      t = Go,
      n = kn,
      a = dy;
    t.subtreeFlags & 10256 || t.flags & 10256
      ? (He = 5)
      : ((He = 0), (Go = sa = null), Cy(e, e.pendingLanes));
    var o = e.pendingLanes;
    if (
      (o === 0 && (la = null),
      Lf(n),
      (t = t.stateNode),
      Mt && typeof Mt.onCommitFiberRoot == "function")
    )
      try {
        Mt.onCommitFiberRoot(hi, t, void 0, (t.current.flags & 128) === 128);
      } catch {}
    if (a !== null) {
      ((t = K.T), (o = ue.p), (ue.p = 2), (K.T = null));
      try {
        for (var r = e.onRecoverableError, i = 0; i < a.length; i++) {
          var l = a[i];
          r(l.value, { componentStack: l.stack });
        }
      } finally {
        ((K.T = t), (ue.p = o));
      }
    }
    (kn & 3 && Gs(),
      gn(e),
      (o = e.pendingLanes),
      n & 261930 && o & 42
        ? e === Xu
          ? Vr++
          : ((Vr = 0), (Xu = e))
        : (Vr = 0),
      Ei(0));
  }
}
function Cy(e, t) {
  (e.pooledCacheLanes &= t) === 0 &&
    ((t = e.pooledCache), t != null && ((e.pooledCache = null), Si(t)));
}
function Gs() {
  return (wy(), xy(), Ey(), Ay());
}
function Ay() {
  if (He !== 5) return !1;
  var e = sa,
    t = Ku;
  Ku = 0;
  var n = Lf(kn),
    a = K.T,
    o = ue.p;
  try {
    ((ue.p = 32 > n ? 32 : n), (K.T = null), (n = qu), (qu = null));
    var r = sa,
      i = kn;
    if (((He = 0), (Go = sa = null), (kn = 0), ce & 6)) throw Error(k(331));
    var l = ce;
    if (
      ((ce |= 4),
      cy(r.current),
      iy(r, r.current, i, n),
      (ce = l),
      Ei(0, !1),
      Mt && typeof Mt.onPostCommitFiberRoot == "function")
    )
      try {
        Mt.onPostCommitFiberRoot(hi, r);
      } catch {}
    return !0;
  } finally {
    ((ue.p = o), (K.T = a), Cy(e, t));
  }
}
function dg(e, t, n) {
  ((t = Vt(n, t)),
    (t = Vu(e.stateNode, t, 2)),
    (e = ia(e, t, 2)),
    e !== null && (vi(e, 2), gn(e)));
}
function me(e, t, n) {
  if (e.tag === 3) dg(e, e, n);
  else
    for (; t !== null; ) {
      if (t.tag === 3) {
        dg(t, e, n);
        break;
      } else if (t.tag === 1) {
        var a = t.stateNode;
        if (
          typeof t.type.getDerivedStateFromError == "function" ||
          (typeof a.componentDidCatch == "function" &&
            (la === null || !la.has(a)))
        ) {
          ((e = Vt(n, e)),
            (n = Pv(2)),
            (a = ia(t, n, 2)),
            a !== null && (Vv(n, a, t, e), vi(a, 2), gn(a)));
          break;
        }
      }
      t = t.return;
    }
}
function Vc(e, t, n) {
  var a = e.pingCache;
  if (a === null) {
    a = e.pingCache = new Jx();
    var o = new Set();
    a.set(t, o);
  } else ((o = a.get(t)), o === void 0 && ((o = new Set()), a.set(t, o)));
  o.has(n) || ((hd = !0), o.add(n), (e = a1.bind(null, e, t, n)), t.then(e, e));
}
function a1(e, t, n) {
  var a = e.pingCache;
  (a !== null && a.delete(t),
    (e.pingedLanes |= e.suspendedLanes & n),
    (e.warmLanes &= ~n),
    ve === e &&
      (re & n) === n &&
      (ke === 4 || (ke === 3 && (re & 62914560) === re && 300 > Rt() - Ps)
        ? !(ce & 2) && Yo(e, 0)
        : (pd |= n),
      Io === re && (Io = 0)),
    gn(e));
}
function Ty(e, t) {
  (t === 0 && (t = vp()), (e = Xa(e, t)), e !== null && (vi(e, t), gn(e)));
}
function o1(e) {
  var t = e.memoizedState,
    n = 0;
  (t !== null && (n = t.retryLane), Ty(e, n));
}
function r1(e, t) {
  var n = 0;
  switch (e.tag) {
    case 31:
    case 13:
      var a = e.stateNode,
        o = e.memoizedState;
      o !== null && (n = o.retryLane);
      break;
    case 19:
      a = e.stateNode;
      break;
    case 22:
      a = e.stateNode._retryCache;
      break;
    default:
      throw Error(k(314));
  }
  (a !== null && a.delete(t), Ty(e, n));
}
function i1(e, t) {
  return Nf(e, t);
}
var es = null,
  go = null,
  $u = !1,
  ts = !1,
  Ic = !1,
  na = 0;
function gn(e) {
  (e !== go &&
    e.next === null &&
    (go === null ? (es = go = e) : (go = go.next = e)),
    (ts = !0),
    $u || (($u = !0), s1()));
}
function Ei(e, t) {
  if (!Ic && ts) {
    Ic = !0;
    do
      for (var n = !1, a = es; a !== null; ) {
        if (e !== 0) {
          var o = a.pendingLanes;
          if (o === 0) var r = 0;
          else {
            var i = a.suspendedLanes,
              l = a.pingedLanes;
            ((r = (1 << (31 - Dt(42 | e) + 1)) - 1),
              (r &= o & ~(i & ~l)),
              (r = r & 201326741 ? (r & 201326741) | 1 : r ? r | 2 : 0));
          }
          r !== 0 && ((n = !0), mg(a, r));
        } else
          ((r = re),
            (r = Ds(
              a,
              a === ve ? r : 0,
              a.cancelPendingCommit !== null || a.timeoutHandle !== -1,
            )),
            !(r & 3) || pi(a, r) || ((n = !0), mg(a, r)));
        a = a.next;
      }
    while (n);
    Ic = !1;
  }
}
function l1() {
  Ry();
}
function Ry() {
  ts = $u = !1;
  var e = 0;
  na !== 0 && y1() && (e = na);
  for (var t = Rt(), n = null, a = es; a !== null; ) {
    var o = a.next,
      r = My(a, t);
    (r === 0
      ? ((a.next = null),
        n === null ? (es = o) : (n.next = o),
        o === null && (go = n))
      : ((n = a), (e !== 0 || r & 3) && (ts = !0)),
      (a = o));
  }
  ((He !== 0 && He !== 5) || Ei(e), na !== 0 && (na = 0));
}
function My(e, t) {
  for (
    var n = e.suspendedLanes,
      a = e.pingedLanes,
      o = e.expirationTimes,
      r = e.pendingLanes & -62914561;
    0 < r;
  ) {
    var i = 31 - Dt(r),
      l = 1 << i,
      s = o[i];
    (s === -1
      ? (!(l & n) || l & a) && (o[i] = Lw(l, t))
      : s <= t && (e.expiredLanes |= l),
      (r &= ~l));
  }
  if (
    ((t = ve),
    (n = re),
    (n = Ds(
      e,
      e === t ? n : 0,
      e.cancelPendingCommit !== null || e.timeoutHandle !== -1,
    )),
    (a = e.callbackNode),
    n === 0 ||
      (e === t && (de === 2 || de === 9)) ||
      e.cancelPendingCommit !== null)
  )
    return (
      a !== null && a !== null && pc(a),
      (e.callbackNode = null),
      (e.callbackPriority = 0)
    );
  if (!(n & 3) || pi(e, n)) {
    if (((t = n & -n), t === e.callbackPriority)) return t;
    switch ((a !== null && pc(a), Lf(n))) {
      case 2:
      case 8:
        n = hp;
        break;
      case 32:
        n = Bl;
        break;
      case 268435456:
        n = pp;
        break;
      default:
        n = Bl;
    }
    return (
      (a = Dy.bind(null, e)),
      (n = Nf(n, a)),
      (e.callbackPriority = t),
      (e.callbackNode = n),
      t
    );
  }
  return (
    a !== null && a !== null && pc(a),
    (e.callbackPriority = 2),
    (e.callbackNode = null),
    2
  );
}
function Dy(e, t) {
  if (He !== 0 && He !== 5)
    return ((e.callbackNode = null), (e.callbackPriority = 0), null);
  var n = e.callbackNode;
  if (Gs() && e.callbackNode !== n) return null;
  var a = re;
  return (
    (a = Ds(
      e,
      e === ve ? a : 0,
      e.cancelPendingCommit !== null || e.timeoutHandle !== -1,
    )),
    a === 0
      ? null
      : (gy(e, a, t),
        My(e, Rt()),
        e.callbackNode != null && e.callbackNode === n
          ? Dy.bind(null, e)
          : null)
  );
}
function mg(e, t) {
  if (Gs()) return null;
  gy(e, t, !0);
}
function s1() {
  S1(function () {
    ce & 6 ? Nf(gp, l1) : Ry();
  });
}
function yd() {
  if (na === 0) {
    var e = Ho;
    (e === 0 && ((e = Hi), (Hi <<= 1), !(Hi & 261888) && (Hi = 256)), (na = e));
  }
  return na;
}
function gg(e) {
  return e == null || typeof e == "symbol" || typeof e == "boolean"
    ? null
    : typeof e == "function"
      ? e
      : ml("" + e);
}
function hg(e, t) {
  var n = t.ownerDocument.createElement("input");
  return (
    (n.name = t.name),
    (n.value = t.value),
    e.id && n.setAttribute("form", e.id),
    t.parentNode.insertBefore(n, t),
    (e = new FormData(e)),
    n.parentNode.removeChild(n),
    e
  );
}
function c1(e, t, n, a, o) {
  if (t === "submit" && n && n.stateNode === o) {
    var r = gg((o[vt] || null).action),
      i = a.submitter;
    i &&
      ((t = (t = i[vt] || null)
        ? gg(t.formAction)
        : i.getAttribute("formAction")),
      t !== null && ((r = t), (i = null)));
    var l = new Os("action", "action", null, a, o);
    e.push({
      event: l,
      listeners: [
        {
          instance: null,
          listener: function () {
            if (a.defaultPrevented) {
              if (na !== 0) {
                var s = i ? hg(o, i) : new FormData(o);
                Hu(
                  n,
                  { pending: !0, data: s, method: o.method, action: r },
                  null,
                  s,
                );
              }
            } else
              typeof r == "function" &&
                (l.preventDefault(),
                (s = i ? hg(o, i) : new FormData(o)),
                Hu(
                  n,
                  { pending: !0, data: s, method: o.method, action: r },
                  r,
                  s,
                ));
          },
          currentTarget: o,
        },
      ],
    });
  }
}
for (var Gc = 0; Gc < Ru.length; Gc++) {
  var Yc = Ru[Gc],
    u1 = Yc.toLowerCase(),
    f1 = Yc[0].toUpperCase() + Yc.slice(1);
  en(u1, "on" + f1);
}
en(Vp, "onAnimationEnd");
en(Ip, "onAnimationIteration");
en(Gp, "onAnimationStart");
en("dblclick", "onDoubleClick");
en("focusin", "onFocus");
en("focusout", "onBlur");
en(Rx, "onTransitionRun");
en(Mx, "onTransitionStart");
en(Dx, "onTransitionCancel");
en(Yp, "onTransitionEnd");
Bo("onMouseEnter", ["mouseout", "mouseover"]);
Bo("onMouseLeave", ["mouseout", "mouseover"]);
Bo("onPointerEnter", ["pointerout", "pointerover"]);
Bo("onPointerLeave", ["pointerout", "pointerover"]);
Fa(
  "onChange",
  "change click focusin focusout input keydown keyup selectionchange".split(
    " ",
  ),
);
Fa(
  "onSelect",
  "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
    " ",
  ),
);
Fa("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
Fa(
  "onCompositionEnd",
  "compositionend focusout keydown keypress keyup mousedown".split(" "),
);
Fa(
  "onCompositionStart",
  "compositionstart focusout keydown keypress keyup mousedown".split(" "),
);
Fa(
  "onCompositionUpdate",
  "compositionupdate focusout keydown keypress keyup mousedown".split(" "),
);
var ti =
    "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
      " ",
    ),
  d1 = new Set(
    "beforetoggle cancel close invalid load scroll scrollend toggle"
      .split(" ")
      .concat(ti),
  );
function Oy(e, t) {
  t = (t & 4) !== 0;
  for (var n = 0; n < e.length; n++) {
    var a = e[n],
      o = a.event;
    a = a.listeners;
    e: {
      var r = void 0;
      if (t)
        for (var i = a.length - 1; 0 <= i; i--) {
          var l = a[i],
            s = l.instance,
            c = l.currentTarget;
          if (((l = l.listener), s !== r && o.isPropagationStopped())) break e;
          ((r = l), (o.currentTarget = c));
          try {
            r(o);
          } catch (f) {
            Hl(f);
          }
          ((o.currentTarget = null), (r = s));
        }
      else
        for (i = 0; i < a.length; i++) {
          if (
            ((l = a[i]),
            (s = l.instance),
            (c = l.currentTarget),
            (l = l.listener),
            s !== r && o.isPropagationStopped())
          )
            break e;
          ((r = l), (o.currentTarget = c));
          try {
            r(o);
          } catch (f) {
            Hl(f);
          }
          ((o.currentTarget = null), (r = s));
        }
    }
  }
}
function ne(e, t) {
  var n = t[bu];
  n === void 0 && (n = t[bu] = new Set());
  var a = e + "__bubble";
  n.has(a) || (ky(t, e, 2, !1), n.add(a));
}
function Fc(e, t, n) {
  var a = 0;
  (t && (a |= 4), ky(n, e, a, t));
}
var $i = "_reactListening" + Math.random().toString(36).slice(2);
function bd(e) {
  if (!e[$i]) {
    ((e[$i] = !0),
      xp.forEach(function (n) {
        n !== "selectionchange" && (d1.has(n) || Fc(n, !1, e), Fc(n, !0, e));
      }));
    var t = e.nodeType === 9 ? e : e.ownerDocument;
    t === null || t[$i] || ((t[$i] = !0), Fc("selectionchange", !1, t));
  }
}
function ky(e, t, n, a) {
  switch (Yy(t)) {
    case 2:
      var o = P1;
      break;
    case 8:
      o = V1;
      break;
    default:
      o = Ed;
  }
  ((n = o.bind(null, t, n, e)),
    (o = void 0),
    !Cu ||
      (t !== "touchstart" && t !== "touchmove" && t !== "wheel") ||
      (o = !0),
    a
      ? o !== void 0
        ? e.addEventListener(t, n, { capture: !0, passive: o })
        : e.addEventListener(t, n, !0)
      : o !== void 0
        ? e.addEventListener(t, n, { passive: o })
        : e.addEventListener(t, n, !1));
}
function Kc(e, t, n, a, o) {
  var r = a;
  if (!(t & 1) && !(t & 2) && a !== null)
    e: for (;;) {
      if (a === null) return;
      var i = a.tag;
      if (i === 3 || i === 4) {
        var l = a.stateNode.containerInfo;
        if (l === o) break;
        if (i === 4)
          for (i = a.return; i !== null; ) {
            var s = i.tag;
            if ((s === 3 || s === 4) && i.stateNode.containerInfo === o) return;
            i = i.return;
          }
        for (; l !== null; ) {
          if (((i = vo(l)), i === null)) return;
          if (((s = i.tag), s === 5 || s === 6 || s === 26 || s === 27)) {
            a = r = i;
            continue e;
          }
          l = l.parentNode;
        }
      }
      a = a.return;
    }
  Op(function () {
    var c = r,
      f = Bf(n),
      u = [];
    e: {
      var d = Fp.get(e);
      if (d !== void 0) {
        var g = Os,
          S = e;
        switch (e) {
          case "keypress":
            if (hl(n) === 0) break e;
          case "keydown":
          case "keyup":
            g = rx;
            break;
          case "focusin":
            ((S = "focus"), (g = wc));
            break;
          case "focusout":
            ((S = "blur"), (g = wc));
            break;
          case "beforeblur":
          case "afterblur":
            g = wc;
            break;
          case "click":
            if (n.button === 2) break e;
          case "auxclick":
          case "dblclick":
          case "mousedown":
          case "mousemove":
          case "mouseup":
          case "mouseout":
          case "mouseover":
          case "contextmenu":
            g = Em;
            break;
          case "drag":
          case "dragend":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "dragstart":
          case "drop":
            g = qw;
            break;
          case "touchcancel":
          case "touchend":
          case "touchmove":
          case "touchstart":
            g = sx;
            break;
          case Vp:
          case Ip:
          case Gp:
            g = Qw;
            break;
          case Yp:
            g = ux;
            break;
          case "scroll":
          case "scrollend":
            g = Fw;
            break;
          case "wheel":
            g = dx;
            break;
          case "copy":
          case "cut":
          case "paste":
            g = Jw;
            break;
          case "gotpointercapture":
          case "lostpointercapture":
          case "pointercancel":
          case "pointerdown":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "pointerup":
            g = Am;
            break;
          case "toggle":
          case "beforetoggle":
            g = gx;
        }
        var v = (t & 4) !== 0,
          b = !v && (e === "scroll" || e === "scrollend"),
          m = v ? (d !== null ? d + "Capture" : null) : d;
        v = [];
        for (var h = c, y; h !== null; ) {
          var w = h;
          if (
            ((y = w.stateNode),
            (w = w.tag),
            (w !== 5 && w !== 26 && w !== 27) ||
              y === null ||
              m === null ||
              ((w = qr(h, m)), w != null && v.push(ni(h, w, y))),
            b)
          )
            break;
          h = h.return;
        }
        0 < v.length &&
          ((d = new g(d, S, null, n, f)), u.push({ event: d, listeners: v }));
      }
    }
    if (!(t & 7)) {
      e: {
        if (
          ((d = e === "mouseover" || e === "pointerover"),
          (g = e === "mouseout" || e === "pointerout"),
          d &&
            n !== Eu &&
            (S = n.relatedTarget || n.fromElement) &&
            (vo(S) || S[Zo]))
        )
          break e;
        if (
          (g || d) &&
          ((d =
            f.window === f
              ? f
              : (d = f.ownerDocument)
                ? d.defaultView || d.parentWindow
                : window),
          g
            ? ((S = n.relatedTarget || n.toElement),
              (g = c),
              (S = S ? vo(S) : null),
              S !== null &&
                ((b = gi(S)),
                (v = S.tag),
                S !== b || (v !== 5 && v !== 27 && v !== 6)) &&
                (S = null))
            : ((g = null), (S = c)),
          g !== S)
        ) {
          if (
            ((v = Em),
            (w = "onMouseLeave"),
            (m = "onMouseEnter"),
            (h = "mouse"),
            (e === "pointerout" || e === "pointerover") &&
              ((v = Am),
              (w = "onPointerLeave"),
              (m = "onPointerEnter"),
              (h = "pointer")),
            (b = g == null ? d : Ar(g)),
            (y = S == null ? d : Ar(S)),
            (d = new v(w, h + "leave", g, n, f)),
            (d.target = b),
            (d.relatedTarget = y),
            (w = null),
            vo(f) === c &&
              ((v = new v(m, h + "enter", S, n, f)),
              (v.target = y),
              (v.relatedTarget = b),
              (w = v)),
            (b = w),
            g && S)
          )
            t: {
              for (v = m1, m = g, h = S, y = 0, w = m; w; w = v(w)) y++;
              w = 0;
              for (var C = h; C; C = v(C)) w++;
              for (; 0 < y - w; ) ((m = v(m)), y--);
              for (; 0 < w - y; ) ((h = v(h)), w--);
              for (; y--; ) {
                if (m === h || (h !== null && m === h.alternate)) {
                  v = m;
                  break t;
                }
                ((m = v(m)), (h = v(h)));
              }
              v = null;
            }
          else v = null;
          (g !== null && pg(u, d, g, v, !1),
            S !== null && b !== null && pg(u, b, S, v, !0));
        }
      }
      e: {
        if (
          ((d = c ? Ar(c) : window),
          (g = d.nodeName && d.nodeName.toLowerCase()),
          g === "select" || (g === "input" && d.type === "file"))
        )
          var R = Dm;
        else if (Mm(d))
          if (jp) R = Cx;
          else {
            R = xx;
            var E = wx;
          }
        else
          ((g = d.nodeName),
            !g ||
            g.toLowerCase() !== "input" ||
            (d.type !== "checkbox" && d.type !== "radio")
              ? c && jf(c.elementType) && (R = Dm)
              : (R = Ex));
        if (R && (R = R(e, c))) {
          zp(u, R, n, f);
          break e;
        }
        (E && E(e, d, c),
          e === "focusout" &&
            c &&
            d.type === "number" &&
            c.memoizedProps.value != null &&
            xu(d, "number", d.value));
      }
      switch (((E = c ? Ar(c) : window), e)) {
        case "focusin":
          (Mm(E) || E.contentEditable === "true") &&
            ((So = E), (Au = c), (Nr = null));
          break;
        case "focusout":
          Nr = Au = So = null;
          break;
        case "mousedown":
          Tu = !0;
          break;
        case "contextmenu":
        case "mouseup":
        case "dragend":
          ((Tu = !1), Lm(u, n, f));
          break;
        case "selectionchange":
          if (Tx) break;
        case "keydown":
        case "keyup":
          Lm(u, n, f);
      }
      var A;
      if (Pf)
        e: {
          switch (e) {
            case "compositionstart":
              var O = "onCompositionStart";
              break e;
            case "compositionend":
              O = "onCompositionEnd";
              break e;
            case "compositionupdate":
              O = "onCompositionUpdate";
              break e;
          }
          O = void 0;
        }
      else
        bo
          ? _p(e, n) && (O = "onCompositionEnd")
          : e === "keydown" && n.keyCode === 229 && (O = "onCompositionStart");
      (O &&
        (Np &&
          n.locale !== "ko" &&
          (bo || O !== "onCompositionStart"
            ? O === "onCompositionEnd" && bo && (A = kp())
            : ((Wn = f),
              (Uf = "value" in Wn ? Wn.value : Wn.textContent),
              (bo = !0))),
        (E = ns(c, O)),
        0 < E.length &&
          ((O = new Cm(O, e, null, n, f)),
          u.push({ event: O, listeners: E }),
          A ? (O.data = A) : ((A = Lp(n)), A !== null && (O.data = A)))),
        (A = px ? vx(e, n) : yx(e, n)) &&
          ((O = ns(c, "onBeforeInput")),
          0 < O.length &&
            ((E = new Cm("onBeforeInput", "beforeinput", null, n, f)),
            u.push({ event: E, listeners: O }),
            (E.data = A))),
        c1(u, e, c, n, f));
    }
    Oy(u, t);
  });
}
function ni(e, t, n) {
  return { instance: e, listener: t, currentTarget: n };
}
function ns(e, t) {
  for (var n = t + "Capture", a = []; e !== null; ) {
    var o = e,
      r = o.stateNode;
    if (
      ((o = o.tag),
      (o !== 5 && o !== 26 && o !== 27) ||
        r === null ||
        ((o = qr(e, n)),
        o != null && a.unshift(ni(e, o, r)),
        (o = qr(e, t)),
        o != null && a.push(ni(e, o, r))),
      e.tag === 3)
    )
      return a;
    e = e.return;
  }
  return [];
}
function m1(e) {
  if (e === null) return null;
  do e = e.return;
  while (e && e.tag !== 5 && e.tag !== 27);
  return e || null;
}
function pg(e, t, n, a, o) {
  for (var r = t._reactName, i = []; n !== null && n !== a; ) {
    var l = n,
      s = l.alternate,
      c = l.stateNode;
    if (((l = l.tag), s !== null && s === a)) break;
    ((l !== 5 && l !== 26 && l !== 27) ||
      c === null ||
      ((s = c),
      o
        ? ((c = qr(n, r)), c != null && i.unshift(ni(n, c, s)))
        : o || ((c = qr(n, r)), c != null && i.push(ni(n, c, s)))),
      (n = n.return));
  }
  i.length !== 0 && e.push({ event: t, listeners: i });
}
var g1 = /\r\n?/g,
  h1 = /\u0000|\uFFFD/g;
function vg(e) {
  return (typeof e == "string" ? e : "" + e)
    .replace(
      g1,
      `
`,
    )
    .replace(h1, "");
}
function Ny(e, t) {
  return ((t = vg(t)), vg(e) === t);
}
function ge(e, t, n, a, o, r) {
  switch (n) {
    case "children":
      typeof a == "string"
        ? t === "body" || (t === "textarea" && a === "") || Uo(e, a)
        : (typeof a == "number" || typeof a == "bigint") &&
          t !== "body" &&
          Uo(e, "" + a);
      break;
    case "className":
      Ii(e, "class", a);
      break;
    case "tabIndex":
      Ii(e, "tabindex", a);
      break;
    case "dir":
    case "role":
    case "viewBox":
    case "width":
    case "height":
      Ii(e, n, a);
      break;
    case "style":
      Dp(e, a, r);
      break;
    case "data":
      if (t !== "object") {
        Ii(e, "data", a);
        break;
      }
    case "src":
    case "href":
      if (a === "" && (t !== "a" || n !== "href")) {
        e.removeAttribute(n);
        break;
      }
      if (
        a == null ||
        typeof a == "function" ||
        typeof a == "symbol" ||
        typeof a == "boolean"
      ) {
        e.removeAttribute(n);
        break;
      }
      ((a = ml("" + a)), e.setAttribute(n, a));
      break;
    case "action":
    case "formAction":
      if (typeof a == "function") {
        e.setAttribute(
          n,
          "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')",
        );
        break;
      } else
        typeof r == "function" &&
          (n === "formAction"
            ? (t !== "input" && ge(e, t, "name", o.name, o, null),
              ge(e, t, "formEncType", o.formEncType, o, null),
              ge(e, t, "formMethod", o.formMethod, o, null),
              ge(e, t, "formTarget", o.formTarget, o, null))
            : (ge(e, t, "encType", o.encType, o, null),
              ge(e, t, "method", o.method, o, null),
              ge(e, t, "target", o.target, o, null)));
      if (a == null || typeof a == "symbol" || typeof a == "boolean") {
        e.removeAttribute(n);
        break;
      }
      ((a = ml("" + a)), e.setAttribute(n, a));
      break;
    case "onClick":
      a != null && (e.onclick = Rn);
      break;
    case "onScroll":
      a != null && ne("scroll", e);
      break;
    case "onScrollEnd":
      a != null && ne("scrollend", e);
      break;
    case "dangerouslySetInnerHTML":
      if (a != null) {
        if (typeof a != "object" || !("__html" in a)) throw Error(k(61));
        if (((n = a.__html), n != null)) {
          if (o.children != null) throw Error(k(60));
          e.innerHTML = n;
        }
      }
      break;
    case "multiple":
      e.multiple = a && typeof a != "function" && typeof a != "symbol";
      break;
    case "muted":
      e.muted = a && typeof a != "function" && typeof a != "symbol";
      break;
    case "suppressContentEditableWarning":
    case "suppressHydrationWarning":
    case "defaultValue":
    case "defaultChecked":
    case "innerHTML":
    case "ref":
      break;
    case "autoFocus":
      break;
    case "xlinkHref":
      if (
        a == null ||
        typeof a == "function" ||
        typeof a == "boolean" ||
        typeof a == "symbol"
      ) {
        e.removeAttribute("xlink:href");
        break;
      }
      ((n = ml("" + a)),
        e.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", n));
      break;
    case "contentEditable":
    case "spellCheck":
    case "draggable":
    case "value":
    case "autoReverse":
    case "externalResourcesRequired":
    case "focusable":
    case "preserveAlpha":
      a != null && typeof a != "function" && typeof a != "symbol"
        ? e.setAttribute(n, "" + a)
        : e.removeAttribute(n);
      break;
    case "inert":
    case "allowFullScreen":
    case "async":
    case "autoPlay":
    case "controls":
    case "default":
    case "defer":
    case "disabled":
    case "disablePictureInPicture":
    case "disableRemotePlayback":
    case "formNoValidate":
    case "hidden":
    case "loop":
    case "noModule":
    case "noValidate":
    case "open":
    case "playsInline":
    case "readOnly":
    case "required":
    case "reversed":
    case "scoped":
    case "seamless":
    case "itemScope":
      a && typeof a != "function" && typeof a != "symbol"
        ? e.setAttribute(n, "")
        : e.removeAttribute(n);
      break;
    case "capture":
    case "download":
      a === !0
        ? e.setAttribute(n, "")
        : a !== !1 &&
            a != null &&
            typeof a != "function" &&
            typeof a != "symbol"
          ? e.setAttribute(n, a)
          : e.removeAttribute(n);
      break;
    case "cols":
    case "rows":
    case "size":
    case "span":
      a != null &&
      typeof a != "function" &&
      typeof a != "symbol" &&
      !isNaN(a) &&
      1 <= a
        ? e.setAttribute(n, a)
        : e.removeAttribute(n);
      break;
    case "rowSpan":
    case "start":
      a == null || typeof a == "function" || typeof a == "symbol" || isNaN(a)
        ? e.removeAttribute(n)
        : e.setAttribute(n, a);
      break;
    case "popover":
      (ne("beforetoggle", e), ne("toggle", e), dl(e, "popover", a));
      break;
    case "xlinkActuate":
      vn(e, "http://www.w3.org/1999/xlink", "xlink:actuate", a);
      break;
    case "xlinkArcrole":
      vn(e, "http://www.w3.org/1999/xlink", "xlink:arcrole", a);
      break;
    case "xlinkRole":
      vn(e, "http://www.w3.org/1999/xlink", "xlink:role", a);
      break;
    case "xlinkShow":
      vn(e, "http://www.w3.org/1999/xlink", "xlink:show", a);
      break;
    case "xlinkTitle":
      vn(e, "http://www.w3.org/1999/xlink", "xlink:title", a);
      break;
    case "xlinkType":
      vn(e, "http://www.w3.org/1999/xlink", "xlink:type", a);
      break;
    case "xmlBase":
      vn(e, "http://www.w3.org/XML/1998/namespace", "xml:base", a);
      break;
    case "xmlLang":
      vn(e, "http://www.w3.org/XML/1998/namespace", "xml:lang", a);
      break;
    case "xmlSpace":
      vn(e, "http://www.w3.org/XML/1998/namespace", "xml:space", a);
      break;
    case "is":
      dl(e, "is", a);
      break;
    case "innerText":
    case "textContent":
      break;
    default:
      (!(2 < n.length) ||
        (n[0] !== "o" && n[0] !== "O") ||
        (n[1] !== "n" && n[1] !== "N")) &&
        ((n = Gw.get(n) || n), dl(e, n, a));
  }
}
function Qu(e, t, n, a, o, r) {
  switch (n) {
    case "style":
      Dp(e, a, r);
      break;
    case "dangerouslySetInnerHTML":
      if (a != null) {
        if (typeof a != "object" || !("__html" in a)) throw Error(k(61));
        if (((n = a.__html), n != null)) {
          if (o.children != null) throw Error(k(60));
          e.innerHTML = n;
        }
      }
      break;
    case "children":
      typeof a == "string"
        ? Uo(e, a)
        : (typeof a == "number" || typeof a == "bigint") && Uo(e, "" + a);
      break;
    case "onScroll":
      a != null && ne("scroll", e);
      break;
    case "onScrollEnd":
      a != null && ne("scrollend", e);
      break;
    case "onClick":
      a != null && (e.onclick = Rn);
      break;
    case "suppressContentEditableWarning":
    case "suppressHydrationWarning":
    case "innerHTML":
    case "ref":
      break;
    case "innerText":
    case "textContent":
      break;
    default:
      if (!Ep.hasOwnProperty(n))
        e: {
          if (
            n[0] === "o" &&
            n[1] === "n" &&
            ((o = n.endsWith("Capture")),
            (t = n.slice(2, o ? n.length - 7 : void 0)),
            (r = e[vt] || null),
            (r = r != null ? r[n] : null),
            typeof r == "function" && e.removeEventListener(t, r, o),
            typeof a == "function")
          ) {
            (typeof r != "function" &&
              r !== null &&
              (n in e
                ? (e[n] = null)
                : e.hasAttribute(n) && e.removeAttribute(n)),
              e.addEventListener(t, a, o));
            break e;
          }
          n in e ? (e[n] = a) : a === !0 ? e.setAttribute(n, "") : dl(e, n, a);
        }
  }
}
function et(e, t, n) {
  switch (t) {
    case "div":
    case "span":
    case "svg":
    case "path":
    case "a":
    case "g":
    case "p":
    case "li":
      break;
    case "img":
      (ne("error", e), ne("load", e));
      var a = !1,
        o = !1,
        r;
      for (r in n)
        if (n.hasOwnProperty(r)) {
          var i = n[r];
          if (i != null)
            switch (r) {
              case "src":
                a = !0;
                break;
              case "srcSet":
                o = !0;
                break;
              case "children":
              case "dangerouslySetInnerHTML":
                throw Error(k(137, t));
              default:
                ge(e, t, r, i, n, null);
            }
        }
      (o && ge(e, t, "srcSet", n.srcSet, n, null),
        a && ge(e, t, "src", n.src, n, null));
      return;
    case "input":
      ne("invalid", e);
      var l = (r = i = o = null),
        s = null,
        c = null;
      for (a in n)
        if (n.hasOwnProperty(a)) {
          var f = n[a];
          if (f != null)
            switch (a) {
              case "name":
                o = f;
                break;
              case "type":
                i = f;
                break;
              case "checked":
                s = f;
                break;
              case "defaultChecked":
                c = f;
                break;
              case "value":
                r = f;
                break;
              case "defaultValue":
                l = f;
                break;
              case "children":
              case "dangerouslySetInnerHTML":
                if (f != null) throw Error(k(137, t));
                break;
              default:
                ge(e, t, a, f, n, null);
            }
        }
      Tp(e, r, l, s, c, i, o, !1);
      return;
    case "select":
      (ne("invalid", e), (a = i = r = null));
      for (o in n)
        if (n.hasOwnProperty(o) && ((l = n[o]), l != null))
          switch (o) {
            case "value":
              r = l;
              break;
            case "defaultValue":
              i = l;
              break;
            case "multiple":
              a = l;
            default:
              ge(e, t, o, l, n, null);
          }
      ((t = r),
        (n = i),
        (e.multiple = !!a),
        t != null ? Mo(e, !!a, t, !1) : n != null && Mo(e, !!a, n, !0));
      return;
    case "textarea":
      (ne("invalid", e), (r = o = a = null));
      for (i in n)
        if (n.hasOwnProperty(i) && ((l = n[i]), l != null))
          switch (i) {
            case "value":
              a = l;
              break;
            case "defaultValue":
              o = l;
              break;
            case "children":
              r = l;
              break;
            case "dangerouslySetInnerHTML":
              if (l != null) throw Error(k(91));
              break;
            default:
              ge(e, t, i, l, n, null);
          }
      Mp(e, a, o, r);
      return;
    case "option":
      for (s in n)
        if (n.hasOwnProperty(s) && ((a = n[s]), a != null))
          switch (s) {
            case "selected":
              e.selected = a && typeof a != "function" && typeof a != "symbol";
              break;
            default:
              ge(e, t, s, a, n, null);
          }
      return;
    case "dialog":
      (ne("beforetoggle", e), ne("toggle", e), ne("cancel", e), ne("close", e));
      break;
    case "iframe":
    case "object":
      ne("load", e);
      break;
    case "video":
    case "audio":
      for (a = 0; a < ti.length; a++) ne(ti[a], e);
      break;
    case "image":
      (ne("error", e), ne("load", e));
      break;
    case "details":
      ne("toggle", e);
      break;
    case "embed":
    case "source":
    case "link":
      (ne("error", e), ne("load", e));
    case "area":
    case "base":
    case "br":
    case "col":
    case "hr":
    case "keygen":
    case "meta":
    case "param":
    case "track":
    case "wbr":
    case "menuitem":
      for (c in n)
        if (n.hasOwnProperty(c) && ((a = n[c]), a != null))
          switch (c) {
            case "children":
            case "dangerouslySetInnerHTML":
              throw Error(k(137, t));
            default:
              ge(e, t, c, a, n, null);
          }
      return;
    default:
      if (jf(t)) {
        for (f in n)
          n.hasOwnProperty(f) &&
            ((a = n[f]), a !== void 0 && Qu(e, t, f, a, n, void 0));
        return;
      }
  }
  for (l in n)
    n.hasOwnProperty(l) && ((a = n[l]), a != null && ge(e, t, l, a, n, null));
}
function p1(e, t, n, a) {
  switch (t) {
    case "div":
    case "span":
    case "svg":
    case "path":
    case "a":
    case "g":
    case "p":
    case "li":
      break;
    case "input":
      var o = null,
        r = null,
        i = null,
        l = null,
        s = null,
        c = null,
        f = null;
      for (g in n) {
        var u = n[g];
        if (n.hasOwnProperty(g) && u != null)
          switch (g) {
            case "checked":
              break;
            case "value":
              break;
            case "defaultValue":
              s = u;
            default:
              a.hasOwnProperty(g) || ge(e, t, g, null, a, u);
          }
      }
      for (var d in a) {
        var g = a[d];
        if (((u = n[d]), a.hasOwnProperty(d) && (g != null || u != null)))
          switch (d) {
            case "type":
              r = g;
              break;
            case "name":
              o = g;
              break;
            case "checked":
              c = g;
              break;
            case "defaultChecked":
              f = g;
              break;
            case "value":
              i = g;
              break;
            case "defaultValue":
              l = g;
              break;
            case "children":
            case "dangerouslySetInnerHTML":
              if (g != null) throw Error(k(137, t));
              break;
            default:
              g !== u && ge(e, t, d, g, a, u);
          }
      }
      wu(e, i, l, s, c, f, r, o);
      return;
    case "select":
      g = i = l = d = null;
      for (r in n)
        if (((s = n[r]), n.hasOwnProperty(r) && s != null))
          switch (r) {
            case "value":
              break;
            case "multiple":
              g = s;
            default:
              a.hasOwnProperty(r) || ge(e, t, r, null, a, s);
          }
      for (o in a)
        if (
          ((r = a[o]),
          (s = n[o]),
          a.hasOwnProperty(o) && (r != null || s != null))
        )
          switch (o) {
            case "value":
              d = r;
              break;
            case "defaultValue":
              l = r;
              break;
            case "multiple":
              i = r;
            default:
              r !== s && ge(e, t, o, r, a, s);
          }
      ((t = l),
        (n = i),
        (a = g),
        d != null
          ? Mo(e, !!n, d, !1)
          : !!a != !!n &&
            (t != null ? Mo(e, !!n, t, !0) : Mo(e, !!n, n ? [] : "", !1)));
      return;
    case "textarea":
      g = d = null;
      for (l in n)
        if (
          ((o = n[l]), n.hasOwnProperty(l) && o != null && !a.hasOwnProperty(l))
        )
          switch (l) {
            case "value":
              break;
            case "children":
              break;
            default:
              ge(e, t, l, null, a, o);
          }
      for (i in a)
        if (
          ((o = a[i]),
          (r = n[i]),
          a.hasOwnProperty(i) && (o != null || r != null))
        )
          switch (i) {
            case "value":
              d = o;
              break;
            case "defaultValue":
              g = o;
              break;
            case "children":
              break;
            case "dangerouslySetInnerHTML":
              if (o != null) throw Error(k(91));
              break;
            default:
              o !== r && ge(e, t, i, o, a, r);
          }
      Rp(e, d, g);
      return;
    case "option":
      for (var S in n)
        if (
          ((d = n[S]), n.hasOwnProperty(S) && d != null && !a.hasOwnProperty(S))
        )
          switch (S) {
            case "selected":
              e.selected = !1;
              break;
            default:
              ge(e, t, S, null, a, d);
          }
      for (s in a)
        if (
          ((d = a[s]),
          (g = n[s]),
          a.hasOwnProperty(s) && d !== g && (d != null || g != null))
        )
          switch (s) {
            case "selected":
              e.selected = d && typeof d != "function" && typeof d != "symbol";
              break;
            default:
              ge(e, t, s, d, a, g);
          }
      return;
    case "img":
    case "link":
    case "area":
    case "base":
    case "br":
    case "col":
    case "embed":
    case "hr":
    case "keygen":
    case "meta":
    case "param":
    case "source":
    case "track":
    case "wbr":
    case "menuitem":
      for (var v in n)
        ((d = n[v]),
          n.hasOwnProperty(v) &&
            d != null &&
            !a.hasOwnProperty(v) &&
            ge(e, t, v, null, a, d));
      for (c in a)
        if (
          ((d = a[c]),
          (g = n[c]),
          a.hasOwnProperty(c) && d !== g && (d != null || g != null))
        )
          switch (c) {
            case "children":
            case "dangerouslySetInnerHTML":
              if (d != null) throw Error(k(137, t));
              break;
            default:
              ge(e, t, c, d, a, g);
          }
      return;
    default:
      if (jf(t)) {
        for (var b in n)
          ((d = n[b]),
            n.hasOwnProperty(b) &&
              d !== void 0 &&
              !a.hasOwnProperty(b) &&
              Qu(e, t, b, void 0, a, d));
        for (f in a)
          ((d = a[f]),
            (g = n[f]),
            !a.hasOwnProperty(f) ||
              d === g ||
              (d === void 0 && g === void 0) ||
              Qu(e, t, f, d, a, g));
        return;
      }
  }
  for (var m in n)
    ((d = n[m]),
      n.hasOwnProperty(m) &&
        d != null &&
        !a.hasOwnProperty(m) &&
        ge(e, t, m, null, a, d));
  for (u in a)
    ((d = a[u]),
      (g = n[u]),
      !a.hasOwnProperty(u) ||
        d === g ||
        (d == null && g == null) ||
        ge(e, t, u, d, a, g));
}
function yg(e) {
  switch (e) {
    case "css":
    case "script":
    case "font":
    case "img":
    case "image":
    case "input":
    case "link":
      return !0;
    default:
      return !1;
  }
}
function v1() {
  if (typeof performance.getEntriesByType == "function") {
    for (
      var e = 0, t = 0, n = performance.getEntriesByType("resource"), a = 0;
      a < n.length;
      a++
    ) {
      var o = n[a],
        r = o.transferSize,
        i = o.initiatorType,
        l = o.duration;
      if (r && l && yg(i)) {
        for (i = 0, l = o.responseEnd, a += 1; a < n.length; a++) {
          var s = n[a],
            c = s.startTime;
          if (c > l) break;
          var f = s.transferSize,
            u = s.initiatorType;
          f &&
            yg(u) &&
            ((s = s.responseEnd), (i += f * (s < l ? 1 : (l - c) / (s - c))));
        }
        if ((--a, (t += (8 * (r + i)) / (o.duration / 1e3)), e++, 10 < e))
          break;
      }
    }
    if (0 < e) return t / e / 1e6;
  }
  return navigator.connection &&
    ((e = navigator.connection.downlink), typeof e == "number")
    ? e
    : 5;
}
var Zu = null,
  Ju = null;
function as(e) {
  return e.nodeType === 9 ? e : e.ownerDocument;
}
function bg(e) {
  switch (e) {
    case "http://www.w3.org/2000/svg":
      return 1;
    case "http://www.w3.org/1998/Math/MathML":
      return 2;
    default:
      return 0;
  }
}
function _y(e, t) {
  if (e === 0)
    switch (t) {
      case "svg":
        return 1;
      case "math":
        return 2;
      default:
        return 0;
    }
  return e === 1 && t === "foreignObject" ? 0 : e;
}
function Wu(e, t) {
  return (
    e === "textarea" ||
    e === "noscript" ||
    typeof t.children == "string" ||
    typeof t.children == "number" ||
    typeof t.children == "bigint" ||
    (typeof t.dangerouslySetInnerHTML == "object" &&
      t.dangerouslySetInnerHTML !== null &&
      t.dangerouslySetInnerHTML.__html != null)
  );
}
var qc = null;
function y1() {
  var e = window.event;
  return e && e.type === "popstate"
    ? e === qc
      ? !1
      : ((qc = e), !0)
    : ((qc = null), !1);
}
var Ly = typeof setTimeout == "function" ? setTimeout : void 0,
  b1 = typeof clearTimeout == "function" ? clearTimeout : void 0,
  Sg = typeof Promise == "function" ? Promise : void 0,
  S1 =
    typeof queueMicrotask == "function"
      ? queueMicrotask
      : typeof Sg < "u"
        ? function (e) {
            return Sg.resolve(null).then(e).catch(w1);
          }
        : Ly;
function w1(e) {
  setTimeout(function () {
    throw e;
  });
}
function Sa(e) {
  return e === "head";
}
function wg(e, t) {
  var n = t,
    a = 0;
  do {
    var o = n.nextSibling;
    if ((e.removeChild(n), o && o.nodeType === 8))
      if (((n = o.data), n === "/$" || n === "/&")) {
        if (a === 0) {
          (e.removeChild(o), Ko(t));
          return;
        }
        a--;
      } else if (
        n === "$" ||
        n === "$?" ||
        n === "$~" ||
        n === "$!" ||
        n === "&"
      )
        a++;
      else if (n === "html") Ir(e.ownerDocument.documentElement);
      else if (n === "head") {
        ((n = e.ownerDocument.head), Ir(n));
        for (var r = n.firstChild; r; ) {
          var i = r.nextSibling,
            l = r.nodeName;
          (r[yi] ||
            l === "SCRIPT" ||
            l === "STYLE" ||
            (l === "LINK" && r.rel.toLowerCase() === "stylesheet") ||
            n.removeChild(r),
            (r = i));
        }
      } else n === "body" && Ir(e.ownerDocument.body);
    n = o;
  } while (n);
  Ko(t);
}
function xg(e, t) {
  var n = e;
  e = 0;
  do {
    var a = n.nextSibling;
    if (
      (n.nodeType === 1
        ? t
          ? ((n._stashedDisplay = n.style.display), (n.style.display = "none"))
          : ((n.style.display = n._stashedDisplay || ""),
            n.getAttribute("style") === "" && n.removeAttribute("style"))
        : n.nodeType === 3 &&
          (t
            ? ((n._stashedText = n.nodeValue), (n.nodeValue = ""))
            : (n.nodeValue = n._stashedText || "")),
      a && a.nodeType === 8)
    )
      if (((n = a.data), n === "/$")) {
        if (e === 0) break;
        e--;
      } else (n !== "$" && n !== "$?" && n !== "$~" && n !== "$!") || e++;
    n = a;
  } while (n);
}
function ef(e) {
  var t = e.firstChild;
  for (t && t.nodeType === 10 && (t = t.nextSibling); t; ) {
    var n = t;
    switch (((t = t.nextSibling), n.nodeName)) {
      case "HTML":
      case "HEAD":
      case "BODY":
        (ef(n), zf(n));
        continue;
      case "SCRIPT":
      case "STYLE":
        continue;
      case "LINK":
        if (n.rel.toLowerCase() === "stylesheet") continue;
    }
    e.removeChild(n);
  }
}
function x1(e, t, n, a) {
  for (; e.nodeType === 1; ) {
    var o = n;
    if (e.nodeName.toLowerCase() !== t.toLowerCase()) {
      if (!a && (e.nodeName !== "INPUT" || e.type !== "hidden")) break;
    } else if (a) {
      if (!e[yi])
        switch (t) {
          case "meta":
            if (!e.hasAttribute("itemprop")) break;
            return e;
          case "link":
            if (
              ((r = e.getAttribute("rel")),
              r === "stylesheet" && e.hasAttribute("data-precedence"))
            )
              break;
            if (
              r !== o.rel ||
              e.getAttribute("href") !==
                (o.href == null || o.href === "" ? null : o.href) ||
              e.getAttribute("crossorigin") !==
                (o.crossOrigin == null ? null : o.crossOrigin) ||
              e.getAttribute("title") !== (o.title == null ? null : o.title)
            )
              break;
            return e;
          case "style":
            if (e.hasAttribute("data-precedence")) break;
            return e;
          case "script":
            if (
              ((r = e.getAttribute("src")),
              (r !== (o.src == null ? null : o.src) ||
                e.getAttribute("type") !== (o.type == null ? null : o.type) ||
                e.getAttribute("crossorigin") !==
                  (o.crossOrigin == null ? null : o.crossOrigin)) &&
                r &&
                e.hasAttribute("async") &&
                !e.hasAttribute("itemprop"))
            )
              break;
            return e;
          default:
            return e;
        }
    } else if (t === "input" && e.type === "hidden") {
      var r = o.name == null ? null : "" + o.name;
      if (o.type === "hidden" && e.getAttribute("name") === r) return e;
    } else return e;
    if (((e = Yt(e.nextSibling)), e === null)) break;
  }
  return null;
}
function E1(e, t, n) {
  if (t === "") return null;
  for (; e.nodeType !== 3; )
    if (
      ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") &&
        !n) ||
      ((e = Yt(e.nextSibling)), e === null)
    )
      return null;
  return e;
}
function zy(e, t) {
  for (; e.nodeType !== 8; )
    if (
      ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") &&
        !t) ||
      ((e = Yt(e.nextSibling)), e === null)
    )
      return null;
  return e;
}
function tf(e) {
  return e.data === "$?" || e.data === "$~";
}
function nf(e) {
  return (
    e.data === "$!" ||
    (e.data === "$?" && e.ownerDocument.readyState !== "loading")
  );
}
function C1(e, t) {
  var n = e.ownerDocument;
  if (e.data === "$~") e._reactRetry = t;
  else if (e.data !== "$?" || n.readyState !== "loading") t();
  else {
    var a = function () {
      (t(), n.removeEventListener("DOMContentLoaded", a));
    };
    (n.addEventListener("DOMContentLoaded", a), (e._reactRetry = a));
  }
}
function Yt(e) {
  for (; e != null; e = e.nextSibling) {
    var t = e.nodeType;
    if (t === 1 || t === 3) break;
    if (t === 8) {
      if (
        ((t = e.data),
        t === "$" ||
          t === "$!" ||
          t === "$?" ||
          t === "$~" ||
          t === "&" ||
          t === "F!" ||
          t === "F")
      )
        break;
      if (t === "/$" || t === "/&") return null;
    }
  }
  return e;
}
var af = null;
function Eg(e) {
  e = e.nextSibling;
  for (var t = 0; e; ) {
    if (e.nodeType === 8) {
      var n = e.data;
      if (n === "/$" || n === "/&") {
        if (t === 0) return Yt(e.nextSibling);
        t--;
      } else
        (n !== "$" && n !== "$!" && n !== "$?" && n !== "$~" && n !== "&") ||
          t++;
    }
    e = e.nextSibling;
  }
  return null;
}
function Cg(e) {
  e = e.previousSibling;
  for (var t = 0; e; ) {
    if (e.nodeType === 8) {
      var n = e.data;
      if (n === "$" || n === "$!" || n === "$?" || n === "$~" || n === "&") {
        if (t === 0) return e;
        t--;
      } else (n !== "/$" && n !== "/&") || t++;
    }
    e = e.previousSibling;
  }
  return null;
}
function jy(e, t, n) {
  switch (((t = as(n)), e)) {
    case "html":
      if (((e = t.documentElement), !e)) throw Error(k(452));
      return e;
    case "head":
      if (((e = t.head), !e)) throw Error(k(453));
      return e;
    case "body":
      if (((e = t.body), !e)) throw Error(k(454));
      return e;
    default:
      throw Error(k(451));
  }
}
function Ir(e) {
  for (var t = e.attributes; t.length; ) e.removeAttributeNode(t[0]);
  zf(e);
}
var Kt = new Map(),
  Ag = new Set();
function os(e) {
  return typeof e.getRootNode == "function"
    ? e.getRootNode()
    : e.nodeType === 9
      ? e
      : e.ownerDocument;
}
var Pn = ue.d;
ue.d = { f: A1, r: T1, D: R1, C: M1, L: D1, m: O1, X: N1, S: k1, M: _1 };
function A1() {
  var e = Pn.f(),
    t = Vs();
  return e || t;
}
function T1(e) {
  var t = Jo(e);
  t !== null && t.tag === 5 && t.type === "form" ? Dv(t) : Pn.r(e);
}
var nr = typeof document > "u" ? null : document;
function By(e, t, n) {
  var a = nr;
  if (a && typeof t == "string" && t) {
    var o = Pt(t);
    ((o = 'link[rel="' + e + '"][href="' + o + '"]'),
      typeof n == "string" && (o += '[crossorigin="' + n + '"]'),
      Ag.has(o) ||
        (Ag.add(o),
        (e = { rel: e, crossOrigin: n, href: t }),
        a.querySelector(o) === null &&
          ((t = a.createElement("link")),
          et(t, "link", e),
          Ye(t),
          a.head.appendChild(t))));
  }
}
function R1(e) {
  (Pn.D(e), By("dns-prefetch", e, null));
}
function M1(e, t) {
  (Pn.C(e, t), By("preconnect", e, t));
}
function D1(e, t, n) {
  Pn.L(e, t, n);
  var a = nr;
  if (a && e && t) {
    var o = 'link[rel="preload"][as="' + Pt(t) + '"]';
    t === "image" && n && n.imageSrcSet
      ? ((o += '[imagesrcset="' + Pt(n.imageSrcSet) + '"]'),
        typeof n.imageSizes == "string" &&
          (o += '[imagesizes="' + Pt(n.imageSizes) + '"]'))
      : (o += '[href="' + Pt(e) + '"]');
    var r = o;
    switch (t) {
      case "style":
        r = Fo(e);
        break;
      case "script":
        r = ar(e);
    }
    Kt.has(r) ||
      ((e = Ce(
        {
          rel: "preload",
          href: t === "image" && n && n.imageSrcSet ? void 0 : e,
          as: t,
        },
        n,
      )),
      Kt.set(r, e),
      a.querySelector(o) !== null ||
        (t === "style" && a.querySelector(Ci(r))) ||
        (t === "script" && a.querySelector(Ai(r))) ||
        ((t = a.createElement("link")),
        et(t, "link", e),
        Ye(t),
        a.head.appendChild(t)));
  }
}
function O1(e, t) {
  Pn.m(e, t);
  var n = nr;
  if (n && e) {
    var a = t && typeof t.as == "string" ? t.as : "script",
      o = 'link[rel="modulepreload"][as="' + Pt(a) + '"][href="' + Pt(e) + '"]',
      r = o;
    switch (a) {
      case "audioworklet":
      case "paintworklet":
      case "serviceworker":
      case "sharedworker":
      case "worker":
      case "script":
        r = ar(e);
    }
    if (
      !Kt.has(r) &&
      ((e = Ce({ rel: "modulepreload", href: e }, t)),
      Kt.set(r, e),
      n.querySelector(o) === null)
    ) {
      switch (a) {
        case "audioworklet":
        case "paintworklet":
        case "serviceworker":
        case "sharedworker":
        case "worker":
        case "script":
          if (n.querySelector(Ai(r))) return;
      }
      ((a = n.createElement("link")),
        et(a, "link", e),
        Ye(a),
        n.head.appendChild(a));
    }
  }
}
function k1(e, t, n) {
  Pn.S(e, t, n);
  var a = nr;
  if (a && e) {
    var o = Ro(a).hoistableStyles,
      r = Fo(e);
    t = t || "default";
    var i = o.get(r);
    if (!i) {
      var l = { loading: 0, preload: null };
      if ((i = a.querySelector(Ci(r)))) l.loading = 5;
      else {
        ((e = Ce({ rel: "stylesheet", href: e, "data-precedence": t }, n)),
          (n = Kt.get(r)) && Sd(e, n));
        var s = (i = a.createElement("link"));
        (Ye(s),
          et(s, "link", e),
          (s._p = new Promise(function (c, f) {
            ((s.onload = c), (s.onerror = f));
          })),
          s.addEventListener("load", function () {
            l.loading |= 1;
          }),
          s.addEventListener("error", function () {
            l.loading |= 2;
          }),
          (l.loading |= 4),
          El(i, t, a));
      }
      ((i = { type: "stylesheet", instance: i, count: 1, state: l }),
        o.set(r, i));
    }
  }
}
function N1(e, t) {
  Pn.X(e, t);
  var n = nr;
  if (n && e) {
    var a = Ro(n).hoistableScripts,
      o = ar(e),
      r = a.get(o);
    r ||
      ((r = n.querySelector(Ai(o))),
      r ||
        ((e = Ce({ src: e, async: !0 }, t)),
        (t = Kt.get(o)) && wd(e, t),
        (r = n.createElement("script")),
        Ye(r),
        et(r, "link", e),
        n.head.appendChild(r)),
      (r = { type: "script", instance: r, count: 1, state: null }),
      a.set(o, r));
  }
}
function _1(e, t) {
  Pn.M(e, t);
  var n = nr;
  if (n && e) {
    var a = Ro(n).hoistableScripts,
      o = ar(e),
      r = a.get(o);
    r ||
      ((r = n.querySelector(Ai(o))),
      r ||
        ((e = Ce({ src: e, async: !0, type: "module" }, t)),
        (t = Kt.get(o)) && wd(e, t),
        (r = n.createElement("script")),
        Ye(r),
        et(r, "link", e),
        n.head.appendChild(r)),
      (r = { type: "script", instance: r, count: 1, state: null }),
      a.set(o, r));
  }
}
function Tg(e, t, n, a) {
  var o = (o = aa.current) ? os(o) : null;
  if (!o) throw Error(k(446));
  switch (e) {
    case "meta":
    case "title":
      return null;
    case "style":
      return typeof n.precedence == "string" && typeof n.href == "string"
        ? ((t = Fo(n.href)),
          (n = Ro(o).hoistableStyles),
          (a = n.get(t)),
          a ||
            ((a = { type: "style", instance: null, count: 0, state: null }),
            n.set(t, a)),
          a)
        : { type: "void", instance: null, count: 0, state: null };
    case "link":
      if (
        n.rel === "stylesheet" &&
        typeof n.href == "string" &&
        typeof n.precedence == "string"
      ) {
        e = Fo(n.href);
        var r = Ro(o).hoistableStyles,
          i = r.get(e);
        if (
          (i ||
            ((o = o.ownerDocument || o),
            (i = {
              type: "stylesheet",
              instance: null,
              count: 0,
              state: { loading: 0, preload: null },
            }),
            r.set(e, i),
            (r = o.querySelector(Ci(e))) &&
              !r._p &&
              ((i.instance = r), (i.state.loading = 5)),
            Kt.has(e) ||
              ((n = {
                rel: "preload",
                as: "style",
                href: n.href,
                crossOrigin: n.crossOrigin,
                integrity: n.integrity,
                media: n.media,
                hrefLang: n.hrefLang,
                referrerPolicy: n.referrerPolicy,
              }),
              Kt.set(e, n),
              r || L1(o, e, n, i.state))),
          t && a === null)
        )
          throw Error(k(528, ""));
        return i;
      }
      if (t && a !== null) throw Error(k(529, ""));
      return null;
    case "script":
      return (
        (t = n.async),
        (n = n.src),
        typeof n == "string" &&
        t &&
        typeof t != "function" &&
        typeof t != "symbol"
          ? ((t = ar(n)),
            (n = Ro(o).hoistableScripts),
            (a = n.get(t)),
            a ||
              ((a = { type: "script", instance: null, count: 0, state: null }),
              n.set(t, a)),
            a)
          : { type: "void", instance: null, count: 0, state: null }
      );
    default:
      throw Error(k(444, e));
  }
}
function Fo(e) {
  return 'href="' + Pt(e) + '"';
}
function Ci(e) {
  return 'link[rel="stylesheet"][' + e + "]";
}
function Uy(e) {
  return Ce({}, e, { "data-precedence": e.precedence, precedence: null });
}
function L1(e, t, n, a) {
  e.querySelector('link[rel="preload"][as="style"][' + t + "]")
    ? (a.loading = 1)
    : ((t = e.createElement("link")),
      (a.preload = t),
      t.addEventListener("load", function () {
        return (a.loading |= 1);
      }),
      t.addEventListener("error", function () {
        return (a.loading |= 2);
      }),
      et(t, "link", n),
      Ye(t),
      e.head.appendChild(t));
}
function ar(e) {
  return '[src="' + Pt(e) + '"]';
}
function Ai(e) {
  return "script[async]" + e;
}
function Rg(e, t, n) {
  if ((t.count++, t.instance === null))
    switch (t.type) {
      case "style":
        var a = e.querySelector('style[data-href~="' + Pt(n.href) + '"]');
        if (a) return ((t.instance = a), Ye(a), a);
        var o = Ce({}, n, {
          "data-href": n.href,
          "data-precedence": n.precedence,
          href: null,
          precedence: null,
        });
        return (
          (a = (e.ownerDocument || e).createElement("style")),
          Ye(a),
          et(a, "style", o),
          El(a, n.precedence, e),
          (t.instance = a)
        );
      case "stylesheet":
        o = Fo(n.href);
        var r = e.querySelector(Ci(o));
        if (r) return ((t.state.loading |= 4), (t.instance = r), Ye(r), r);
        ((a = Uy(n)),
          (o = Kt.get(o)) && Sd(a, o),
          (r = (e.ownerDocument || e).createElement("link")),
          Ye(r));
        var i = r;
        return (
          (i._p = new Promise(function (l, s) {
            ((i.onload = l), (i.onerror = s));
          })),
          et(r, "link", a),
          (t.state.loading |= 4),
          El(r, n.precedence, e),
          (t.instance = r)
        );
      case "script":
        return (
          (r = ar(n.src)),
          (o = e.querySelector(Ai(r)))
            ? ((t.instance = o), Ye(o), o)
            : ((a = n),
              (o = Kt.get(r)) && ((a = Ce({}, n)), wd(a, o)),
              (e = e.ownerDocument || e),
              (o = e.createElement("script")),
              Ye(o),
              et(o, "link", a),
              e.head.appendChild(o),
              (t.instance = o))
        );
      case "void":
        return null;
      default:
        throw Error(k(443, t.type));
    }
  else
    t.type === "stylesheet" &&
      !(t.state.loading & 4) &&
      ((a = t.instance), (t.state.loading |= 4), El(a, n.precedence, e));
  return t.instance;
}
function El(e, t, n) {
  for (
    var a = n.querySelectorAll(
        'link[rel="stylesheet"][data-precedence],style[data-precedence]',
      ),
      o = a.length ? a[a.length - 1] : null,
      r = o,
      i = 0;
    i < a.length;
    i++
  ) {
    var l = a[i];
    if (l.dataset.precedence === t) r = l;
    else if (r !== o) break;
  }
  r
    ? r.parentNode.insertBefore(e, r.nextSibling)
    : ((t = n.nodeType === 9 ? n.head : n), t.insertBefore(e, t.firstChild));
}
function Sd(e, t) {
  (e.crossOrigin == null && (e.crossOrigin = t.crossOrigin),
    e.referrerPolicy == null && (e.referrerPolicy = t.referrerPolicy),
    e.title == null && (e.title = t.title));
}
function wd(e, t) {
  (e.crossOrigin == null && (e.crossOrigin = t.crossOrigin),
    e.referrerPolicy == null && (e.referrerPolicy = t.referrerPolicy),
    e.integrity == null && (e.integrity = t.integrity));
}
var Cl = null;
function Mg(e, t, n) {
  if (Cl === null) {
    var a = new Map(),
      o = (Cl = new Map());
    o.set(n, a);
  } else ((o = Cl), (a = o.get(n)), a || ((a = new Map()), o.set(n, a)));
  if (a.has(e)) return a;
  for (
    a.set(e, null), n = n.getElementsByTagName(e), o = 0;
    o < n.length;
    o++
  ) {
    var r = n[o];
    if (
      !(
        r[yi] ||
        r[Ze] ||
        (e === "link" && r.getAttribute("rel") === "stylesheet")
      ) &&
      r.namespaceURI !== "http://www.w3.org/2000/svg"
    ) {
      var i = r.getAttribute(t) || "";
      i = e + i;
      var l = a.get(i);
      l ? l.push(r) : a.set(i, [r]);
    }
  }
  return a;
}
function Dg(e, t, n) {
  ((e = e.ownerDocument || e),
    e.head.insertBefore(
      n,
      t === "title" ? e.querySelector("head > title") : null,
    ));
}
function z1(e, t, n) {
  if (n === 1 || t.itemProp != null) return !1;
  switch (e) {
    case "meta":
    case "title":
      return !0;
    case "style":
      if (
        typeof t.precedence != "string" ||
        typeof t.href != "string" ||
        t.href === ""
      )
        break;
      return !0;
    case "link":
      if (
        typeof t.rel != "string" ||
        typeof t.href != "string" ||
        t.href === "" ||
        t.onLoad ||
        t.onError
      )
        break;
      switch (t.rel) {
        case "stylesheet":
          return (
            (e = t.disabled),
            typeof t.precedence == "string" && e == null
          );
        default:
          return !0;
      }
    case "script":
      if (
        t.async &&
        typeof t.async != "function" &&
        typeof t.async != "symbol" &&
        !t.onLoad &&
        !t.onError &&
        t.src &&
        typeof t.src == "string"
      )
        return !0;
  }
  return !1;
}
function Hy(e) {
  return !(e.type === "stylesheet" && !(e.state.loading & 3));
}
function j1(e, t, n, a) {
  if (
    n.type === "stylesheet" &&
    (typeof a.media != "string" || matchMedia(a.media).matches !== !1) &&
    !(n.state.loading & 4)
  ) {
    if (n.instance === null) {
      var o = Fo(a.href),
        r = t.querySelector(Ci(o));
      if (r) {
        ((t = r._p),
          t !== null &&
            typeof t == "object" &&
            typeof t.then == "function" &&
            (e.count++, (e = rs.bind(e)), t.then(e, e)),
          (n.state.loading |= 4),
          (n.instance = r),
          Ye(r));
        return;
      }
      ((r = t.ownerDocument || t),
        (a = Uy(a)),
        (o = Kt.get(o)) && Sd(a, o),
        (r = r.createElement("link")),
        Ye(r));
      var i = r;
      ((i._p = new Promise(function (l, s) {
        ((i.onload = l), (i.onerror = s));
      })),
        et(r, "link", a),
        (n.instance = r));
    }
    (e.stylesheets === null && (e.stylesheets = new Map()),
      e.stylesheets.set(n, t),
      (t = n.state.preload) &&
        !(n.state.loading & 3) &&
        (e.count++,
        (n = rs.bind(e)),
        t.addEventListener("load", n),
        t.addEventListener("error", n)));
  }
}
var Xc = 0;
function B1(e, t) {
  return (
    e.stylesheets && e.count === 0 && Al(e, e.stylesheets),
    0 < e.count || 0 < e.imgCount
      ? function (n) {
          var a = setTimeout(function () {
            if ((e.stylesheets && Al(e, e.stylesheets), e.unsuspend)) {
              var r = e.unsuspend;
              ((e.unsuspend = null), r());
            }
          }, 6e4 + t);
          0 < e.imgBytes && Xc === 0 && (Xc = 62500 * v1());
          var o = setTimeout(
            function () {
              if (
                ((e.waitingForImages = !1),
                e.count === 0 &&
                  (e.stylesheets && Al(e, e.stylesheets), e.unsuspend))
              ) {
                var r = e.unsuspend;
                ((e.unsuspend = null), r());
              }
            },
            (e.imgBytes > Xc ? 50 : 800) + t,
          );
          return (
            (e.unsuspend = n),
            function () {
              ((e.unsuspend = null), clearTimeout(a), clearTimeout(o));
            }
          );
        }
      : null
  );
}
function rs() {
  if (
    (this.count--,
    this.count === 0 && (this.imgCount === 0 || !this.waitingForImages))
  ) {
    if (this.stylesheets) Al(this, this.stylesheets);
    else if (this.unsuspend) {
      var e = this.unsuspend;
      ((this.unsuspend = null), e());
    }
  }
}
var is = null;
function Al(e, t) {
  ((e.stylesheets = null),
    e.unsuspend !== null &&
      (e.count++, (is = new Map()), t.forEach(U1, e), (is = null), rs.call(e)));
}
function U1(e, t) {
  if (!(t.state.loading & 4)) {
    var n = is.get(e);
    if (n) var a = n.get(null);
    else {
      ((n = new Map()), is.set(e, n));
      for (
        var o = e.querySelectorAll(
            "link[data-precedence],style[data-precedence]",
          ),
          r = 0;
        r < o.length;
        r++
      ) {
        var i = o[r];
        (i.nodeName === "LINK" || i.getAttribute("media") !== "not all") &&
          (n.set(i.dataset.precedence, i), (a = i));
      }
      a && n.set(null, a);
    }
    ((o = t.instance),
      (i = o.getAttribute("data-precedence")),
      (r = n.get(i) || a),
      r === a && n.set(null, o),
      n.set(i, o),
      this.count++,
      (a = rs.bind(this)),
      o.addEventListener("load", a),
      o.addEventListener("error", a),
      r
        ? r.parentNode.insertBefore(o, r.nextSibling)
        : ((e = e.nodeType === 9 ? e.head : e),
          e.insertBefore(o, e.firstChild)),
      (t.state.loading |= 4));
  }
}
var ai = {
  $$typeof: Tn,
  Provider: null,
  Consumer: null,
  _currentValue: Na,
  _currentValue2: Na,
  _threadCount: 0,
};
function H1(e, t, n, a, o, r, i, l, s) {
  ((this.tag = 1),
    (this.containerInfo = e),
    (this.pingCache = this.current = this.pendingChildren = null),
    (this.timeoutHandle = -1),
    (this.callbackNode =
      this.next =
      this.pendingContext =
      this.context =
      this.cancelPendingCommit =
        null),
    (this.callbackPriority = 0),
    (this.expirationTimes = vc(-1)),
    (this.entangledLanes =
      this.shellSuspendCounter =
      this.errorRecoveryDisabledLanes =
      this.expiredLanes =
      this.warmLanes =
      this.pingedLanes =
      this.suspendedLanes =
      this.pendingLanes =
        0),
    (this.entanglements = vc(0)),
    (this.hiddenUpdates = vc(null)),
    (this.identifierPrefix = a),
    (this.onUncaughtError = o),
    (this.onCaughtError = r),
    (this.onRecoverableError = i),
    (this.pooledCache = null),
    (this.pooledCacheLanes = 0),
    (this.formState = s),
    (this.incompleteTransitions = new Map()));
}
function Py(e, t, n, a, o, r, i, l, s, c, f, u) {
  return (
    (e = new H1(e, t, n, i, s, c, f, u, l)),
    (t = 1),
    r === !0 && (t |= 24),
    (r = At(3, null, null, t)),
    (e.current = r),
    (r.stateNode = e),
    (t = qf()),
    t.refCount++,
    (e.pooledCache = t),
    t.refCount++,
    (r.memoizedState = { element: a, isDehydrated: n, cache: t }),
    Qf(r),
    e
  );
}
function Vy(e) {
  return e ? ((e = Eo), e) : Eo;
}
function Iy(e, t, n, a, o, r) {
  ((o = Vy(o)),
    a.context === null ? (a.context = o) : (a.pendingContext = o),
    (a = ra(t)),
    (a.payload = { element: n }),
    (r = r === void 0 ? null : r),
    r !== null && (a.callback = r),
    (n = ia(e, a, t)),
    n !== null && (pt(n, e, t), Lr(n, e, t)));
}
function Og(e, t) {
  if (((e = e.memoizedState), e !== null && e.dehydrated !== null)) {
    var n = e.retryLane;
    e.retryLane = n !== 0 && n < t ? n : t;
  }
}
function xd(e, t) {
  (Og(e, t), (e = e.alternate) && Og(e, t));
}
function Gy(e) {
  if (e.tag === 13 || e.tag === 31) {
    var t = Xa(e, 67108864);
    (t !== null && pt(t, e, 67108864), xd(e, 67108864));
  }
}
function kg(e) {
  if (e.tag === 13 || e.tag === 31) {
    var t = Ot();
    t = _f(t);
    var n = Xa(e, t);
    (n !== null && pt(n, e, t), xd(e, t));
  }
}
var ls = !0;
function P1(e, t, n, a) {
  var o = K.T;
  K.T = null;
  var r = ue.p;
  try {
    ((ue.p = 2), Ed(e, t, n, a));
  } finally {
    ((ue.p = r), (K.T = o));
  }
}
function V1(e, t, n, a) {
  var o = K.T;
  K.T = null;
  var r = ue.p;
  try {
    ((ue.p = 8), Ed(e, t, n, a));
  } finally {
    ((ue.p = r), (K.T = o));
  }
}
function Ed(e, t, n, a) {
  if (ls) {
    var o = of(a);
    if (o === null) (Kc(e, t, a, ss, n), Ng(e, a));
    else if (G1(o, e, t, n, a)) a.stopPropagation();
    else if ((Ng(e, a), t & 4 && -1 < I1.indexOf(e))) {
      for (; o !== null; ) {
        var r = Jo(o);
        if (r !== null)
          switch (r.tag) {
            case 3:
              if (((r = r.stateNode), r.current.memoizedState.isDehydrated)) {
                var i = Ma(r.pendingLanes);
                if (i !== 0) {
                  var l = r;
                  for (l.pendingLanes |= 2, l.entangledLanes |= 2; i; ) {
                    var s = 1 << (31 - Dt(i));
                    ((l.entanglements[1] |= s), (i &= ~s));
                  }
                  (gn(r), !(ce & 6) && ((Zl = Rt() + 500), Ei(0)));
                }
              }
              break;
            case 31:
            case 13:
              ((l = Xa(r, 2)), l !== null && pt(l, r, 2), Vs(), xd(r, 2));
          }
        if (((r = of(a)), r === null && Kc(e, t, a, ss, n), r === o)) break;
        o = r;
      }
      o !== null && a.stopPropagation();
    } else Kc(e, t, a, null, n);
  }
}
function of(e) {
  return ((e = Bf(e)), Cd(e));
}
var ss = null;
function Cd(e) {
  if (((ss = null), (e = vo(e)), e !== null)) {
    var t = gi(e);
    if (t === null) e = null;
    else {
      var n = t.tag;
      if (n === 13) {
        if (((e = cp(t)), e !== null)) return e;
        e = null;
      } else if (n === 31) {
        if (((e = up(t)), e !== null)) return e;
        e = null;
      } else if (n === 3) {
        if (t.stateNode.current.memoizedState.isDehydrated)
          return t.tag === 3 ? t.stateNode.containerInfo : null;
        e = null;
      } else t !== e && (e = null);
    }
  }
  return ((ss = e), null);
}
function Yy(e) {
  switch (e) {
    case "beforetoggle":
    case "cancel":
    case "click":
    case "close":
    case "contextmenu":
    case "copy":
    case "cut":
    case "auxclick":
    case "dblclick":
    case "dragend":
    case "dragstart":
    case "drop":
    case "focusin":
    case "focusout":
    case "input":
    case "invalid":
    case "keydown":
    case "keypress":
    case "keyup":
    case "mousedown":
    case "mouseup":
    case "paste":
    case "pause":
    case "play":
    case "pointercancel":
    case "pointerdown":
    case "pointerup":
    case "ratechange":
    case "reset":
    case "resize":
    case "seeked":
    case "submit":
    case "toggle":
    case "touchcancel":
    case "touchend":
    case "touchstart":
    case "volumechange":
    case "change":
    case "selectionchange":
    case "textInput":
    case "compositionstart":
    case "compositionend":
    case "compositionupdate":
    case "beforeblur":
    case "afterblur":
    case "beforeinput":
    case "blur":
    case "fullscreenchange":
    case "focus":
    case "hashchange":
    case "popstate":
    case "select":
    case "selectstart":
      return 2;
    case "drag":
    case "dragenter":
    case "dragexit":
    case "dragleave":
    case "dragover":
    case "mousemove":
    case "mouseout":
    case "mouseover":
    case "pointermove":
    case "pointerout":
    case "pointerover":
    case "scroll":
    case "touchmove":
    case "wheel":
    case "mouseenter":
    case "mouseleave":
    case "pointerenter":
    case "pointerleave":
      return 8;
    case "message":
      switch (Rw()) {
        case gp:
          return 2;
        case hp:
          return 8;
        case Bl:
        case Mw:
          return 32;
        case pp:
          return 268435456;
        default:
          return 32;
      }
    default:
      return 32;
  }
}
var rf = !1,
  ca = null,
  ua = null,
  fa = null,
  oi = new Map(),
  ri = new Map(),
  Zn = [],
  I1 =
    "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(
      " ",
    );
function Ng(e, t) {
  switch (e) {
    case "focusin":
    case "focusout":
      ca = null;
      break;
    case "dragenter":
    case "dragleave":
      ua = null;
      break;
    case "mouseover":
    case "mouseout":
      fa = null;
      break;
    case "pointerover":
    case "pointerout":
      oi.delete(t.pointerId);
      break;
    case "gotpointercapture":
    case "lostpointercapture":
      ri.delete(t.pointerId);
  }
}
function hr(e, t, n, a, o, r) {
  return e === null || e.nativeEvent !== r
    ? ((e = {
        blockedOn: t,
        domEventName: n,
        eventSystemFlags: a,
        nativeEvent: r,
        targetContainers: [o],
      }),
      t !== null && ((t = Jo(t)), t !== null && Gy(t)),
      e)
    : ((e.eventSystemFlags |= a),
      (t = e.targetContainers),
      o !== null && t.indexOf(o) === -1 && t.push(o),
      e);
}
function G1(e, t, n, a, o) {
  switch (t) {
    case "focusin":
      return ((ca = hr(ca, e, t, n, a, o)), !0);
    case "dragenter":
      return ((ua = hr(ua, e, t, n, a, o)), !0);
    case "mouseover":
      return ((fa = hr(fa, e, t, n, a, o)), !0);
    case "pointerover":
      var r = o.pointerId;
      return (oi.set(r, hr(oi.get(r) || null, e, t, n, a, o)), !0);
    case "gotpointercapture":
      return (
        (r = o.pointerId),
        ri.set(r, hr(ri.get(r) || null, e, t, n, a, o)),
        !0
      );
  }
  return !1;
}
function Fy(e) {
  var t = vo(e.target);
  if (t !== null) {
    var n = gi(t);
    if (n !== null) {
      if (((t = n.tag), t === 13)) {
        if (((t = cp(n)), t !== null)) {
          ((e.blockedOn = t),
            pm(e.priority, function () {
              kg(n);
            }));
          return;
        }
      } else if (t === 31) {
        if (((t = up(n)), t !== null)) {
          ((e.blockedOn = t),
            pm(e.priority, function () {
              kg(n);
            }));
          return;
        }
      } else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
        e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
        return;
      }
    }
  }
  e.blockedOn = null;
}
function Tl(e) {
  if (e.blockedOn !== null) return !1;
  for (var t = e.targetContainers; 0 < t.length; ) {
    var n = of(e.nativeEvent);
    if (n === null) {
      n = e.nativeEvent;
      var a = new n.constructor(n.type, n);
      ((Eu = a), n.target.dispatchEvent(a), (Eu = null));
    } else return ((t = Jo(n)), t !== null && Gy(t), (e.blockedOn = n), !1);
    t.shift();
  }
  return !0;
}
function _g(e, t, n) {
  Tl(e) && n.delete(t);
}
function Y1() {
  ((rf = !1),
    ca !== null && Tl(ca) && (ca = null),
    ua !== null && Tl(ua) && (ua = null),
    fa !== null && Tl(fa) && (fa = null),
    oi.forEach(_g),
    ri.forEach(_g));
}
function Qi(e, t) {
  e.blockedOn === t &&
    ((e.blockedOn = null),
    rf ||
      ((rf = !0),
      Pe.unstable_scheduleCallback(Pe.unstable_NormalPriority, Y1)));
}
var Zi = null;
function Lg(e) {
  Zi !== e &&
    ((Zi = e),
    Pe.unstable_scheduleCallback(Pe.unstable_NormalPriority, function () {
      Zi === e && (Zi = null);
      for (var t = 0; t < e.length; t += 3) {
        var n = e[t],
          a = e[t + 1],
          o = e[t + 2];
        if (typeof a != "function") {
          if (Cd(a || n) === null) continue;
          break;
        }
        var r = Jo(n);
        r !== null &&
          (e.splice(t, 3),
          (t -= 3),
          Hu(r, { pending: !0, data: o, method: n.method, action: a }, a, o));
      }
    }));
}
function Ko(e) {
  function t(s) {
    return Qi(s, e);
  }
  (ca !== null && Qi(ca, e),
    ua !== null && Qi(ua, e),
    fa !== null && Qi(fa, e),
    oi.forEach(t),
    ri.forEach(t));
  for (var n = 0; n < Zn.length; n++) {
    var a = Zn[n];
    a.blockedOn === e && (a.blockedOn = null);
  }
  for (; 0 < Zn.length && ((n = Zn[0]), n.blockedOn === null); )
    (Fy(n), n.blockedOn === null && Zn.shift());
  if (((n = (e.ownerDocument || e).$$reactFormReplay), n != null))
    for (a = 0; a < n.length; a += 3) {
      var o = n[a],
        r = n[a + 1],
        i = o[vt] || null;
      if (typeof r == "function") i || Lg(n);
      else if (i) {
        var l = null;
        if (r && r.hasAttribute("formAction")) {
          if (((o = r), (i = r[vt] || null))) l = i.formAction;
          else if (Cd(o) !== null) continue;
        } else l = i.action;
        (typeof l == "function" ? (n[a + 1] = l) : (n.splice(a, 3), (a -= 3)),
          Lg(n));
      }
    }
}
function Ky() {
  function e(r) {
    r.canIntercept &&
      r.info === "react-transition" &&
      r.intercept({
        handler: function () {
          return new Promise(function (i) {
            return (o = i);
          });
        },
        focusReset: "manual",
        scroll: "manual",
      });
  }
  function t() {
    (o !== null && (o(), (o = null)), a || setTimeout(n, 20));
  }
  function n() {
    if (!a && !navigation.transition) {
      var r = navigation.currentEntry;
      r &&
        r.url != null &&
        navigation.navigate(r.url, {
          state: r.getState(),
          info: "react-transition",
          history: "replace",
        });
    }
  }
  if (typeof navigation == "object") {
    var a = !1,
      o = null;
    return (
      navigation.addEventListener("navigate", e),
      navigation.addEventListener("navigatesuccess", t),
      navigation.addEventListener("navigateerror", t),
      setTimeout(n, 100),
      function () {
        ((a = !0),
          navigation.removeEventListener("navigate", e),
          navigation.removeEventListener("navigatesuccess", t),
          navigation.removeEventListener("navigateerror", t),
          o !== null && (o(), (o = null)));
      }
    );
  }
}
function Ad(e) {
  this._internalRoot = e;
}
Ys.prototype.render = Ad.prototype.render = function (e) {
  var t = this._internalRoot;
  if (t === null) throw Error(k(409));
  var n = t.current,
    a = Ot();
  Iy(n, a, e, t, null, null);
};
Ys.prototype.unmount = Ad.prototype.unmount = function () {
  var e = this._internalRoot;
  if (e !== null) {
    this._internalRoot = null;
    var t = e.containerInfo;
    (Iy(e.current, 2, null, e, null, null), Vs(), (t[Zo] = null));
  }
};
function Ys(e) {
  this._internalRoot = e;
}
Ys.prototype.unstable_scheduleHydration = function (e) {
  if (e) {
    var t = wp();
    e = { blockedOn: null, target: e, priority: t };
    for (var n = 0; n < Zn.length && t !== 0 && t < Zn[n].priority; n++);
    (Zn.splice(n, 0, e), n === 0 && Fy(e));
  }
};
var zg = lp.version;
if (zg !== "19.2.3") throw Error(k(527, zg, "19.2.3"));
ue.findDOMNode = function (e) {
  var t = e._reactInternals;
  if (t === void 0)
    throw typeof e.render == "function"
      ? Error(k(188))
      : ((e = Object.keys(e).join(",")), Error(k(268, e)));
  return (
    (e = Sw(t)),
    (e = e !== null ? fp(e) : null),
    (e = e === null ? null : e.stateNode),
    e
  );
};
var F1 = {
  bundleType: 0,
  version: "19.2.3",
  rendererPackageName: "react-dom",
  currentDispatcherRef: K,
  reconcilerVersion: "19.2.3",
};
if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
  var Ji = __REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!Ji.isDisabled && Ji.supportsFiber)
    try {
      ((hi = Ji.inject(F1)), (Mt = Ji));
    } catch {}
}
Ts.createRoot = function (e, t) {
  if (!sp(e)) throw Error(k(299));
  var n = !1,
    a = "",
    o = Bv,
    r = Uv,
    i = Hv;
  return (
    t != null &&
      (t.unstable_strictMode === !0 && (n = !0),
      t.identifierPrefix !== void 0 && (a = t.identifierPrefix),
      t.onUncaughtError !== void 0 && (o = t.onUncaughtError),
      t.onCaughtError !== void 0 && (r = t.onCaughtError),
      t.onRecoverableError !== void 0 && (i = t.onRecoverableError)),
    (t = Py(e, 1, !1, null, null, n, a, null, o, r, i, Ky)),
    (e[Zo] = t.current),
    bd(e),
    new Ad(t)
  );
};
Ts.hydrateRoot = function (e, t, n) {
  if (!sp(e)) throw Error(k(299));
  var a = !1,
    o = "",
    r = Bv,
    i = Uv,
    l = Hv,
    s = null;
  return (
    n != null &&
      (n.unstable_strictMode === !0 && (a = !0),
      n.identifierPrefix !== void 0 && (o = n.identifierPrefix),
      n.onUncaughtError !== void 0 && (r = n.onUncaughtError),
      n.onCaughtError !== void 0 && (i = n.onCaughtError),
      n.onRecoverableError !== void 0 && (l = n.onRecoverableError),
      n.formState !== void 0 && (s = n.formState)),
    (t = Py(e, 1, !0, t, n ?? null, a, o, s, r, i, l, Ky)),
    (t.context = Vy(null)),
    (n = t.current),
    (a = Ot()),
    (a = _f(a)),
    (o = ra(a)),
    (o.callback = null),
    ia(n, o, a),
    (n = a),
    (t.current.lanes = n),
    vi(t, n),
    gn(t),
    (e[Zo] = t.current),
    bd(e),
    new Ys(t)
  );
};
Ts.version = "19.2.3";
function qy() {
  if (
    !(
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" ||
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"
    )
  )
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(qy);
    } catch {}
}
(qy(), (ep.exports = Ts));
var K1 = ep.exports;
const Nk = Ef(K1),
  q1 =
    /&(?:amp|#38|lt|#60|gt|#62|apos|#39|quot|#34|nbsp|#160|copy|#169|reg|#174|hellip|#8230|#x2F|#47);/g,
  X1 = {
    "&amp;": "&",
    "&#38;": "&",
    "&lt;": "<",
    "&#60;": "<",
    "&gt;": ">",
    "&#62;": ">",
    "&apos;": "'",
    "&#39;": "'",
    "&quot;": '"',
    "&#34;": '"',
    "&nbsp;": " ",
    "&#160;": " ",
    "&copy;": "©",
    "&#169;": "©",
    "&reg;": "®",
    "&#174;": "®",
    "&hellip;": "…",
    "&#8230;": "…",
    "&#x2F;": "/",
    "&#47;": "/",
  },
  $1 = (e) => X1[e],
  Q1 = (e) => e.replace(q1, $1);
let lf = {
  bindI18n: "languageChanged",
  bindI18nStore: "",
  transEmptyNodeValue: "",
  transSupportBasicHtmlNodes: !0,
  transWrapTextNodes: "",
  transKeepBasicHtmlNodesFor: ["br", "strong", "i", "p"],
  useSuspense: !0,
  unescape: Q1,
};
const Z1 = (e = {}) => {
    lf = { ...lf, ...e };
  },
  _k = () => lf;
let Xy;
const J1 = (e) => {
    Xy = e;
  },
  Lk = () => Xy,
  W1 = {
    type: "3rdParty",
    init(e) {
      (Z1(e.options.react), J1(e));
    },
  },
  eE = p.createContext();
class zk {
  constructor() {
    this.usedNamespaces = {};
  }
  addUsedNamespaces(t) {
    t.forEach((n) => {
      this.usedNamespaces[n] || (this.usedNamespaces[n] = !0);
    });
  }
  getUsedNamespaces() {
    return Object.keys(this.usedNamespaces);
  }
}
function jk({ i18n: e, defaultNS: t, children: n }) {
  const a = p.useMemo(() => ({ i18n: e, defaultNS: t }), [e, t]);
  return p.createElement(eE.Provider, { value: a }, n);
}
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const tE = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(),
  $y = (...e) =>
    e
      .filter((t, n, a) => !!t && t.trim() !== "" && a.indexOf(t) === n)
      .join(" ")
      .trim();
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var nE = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const aE = p.forwardRef(
  (
    {
      color: e = "currentColor",
      size: t = 24,
      strokeWidth: n = 2,
      absoluteStrokeWidth: a,
      className: o = "",
      children: r,
      iconNode: i,
      ...l
    },
    s,
  ) =>
    p.createElement(
      "svg",
      {
        ref: s,
        ...nE,
        width: t,
        height: t,
        stroke: e,
        strokeWidth: a ? (Number(n) * 24) / Number(t) : n,
        className: $y("lucide", o),
        ...l,
      },
      [
        ...i.map(([c, f]) => p.createElement(c, f)),
        ...(Array.isArray(r) ? r : [r]),
      ],
    ),
);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Qa = (e, t) => {
  const n = p.forwardRef(({ className: a, ...o }, r) =>
    p.createElement(aE, {
      ref: r,
      iconNode: t,
      className: $y(`lucide-${tE(e)}`, a),
      ...o,
    }),
  );
  return ((n.displayName = `${e}`), n);
};
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Bk = Qa("Check", [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Uk = Qa("ChevronDown", [
  ["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }],
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Hk = Qa("ChevronRight", [
  ["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }],
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Pk = Qa("Ellipsis", [
  ["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }],
  ["circle", { cx: "19", cy: "12", r: "1", key: "1wjl8i" }],
  ["circle", { cx: "5", cy: "12", r: "1", key: "1pcz8c" }],
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const oE = Qa("PanelLeft", [
  [
    "rect",
    { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" },
  ],
  ["path", { d: "M9 3v18", key: "fh3hqa" }],
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Vk = Qa("Sparkles", [
  [
    "path",
    {
      d: "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",
      key: "4pj2yx",
    },
  ],
  ["path", { d: "M20 3v4", key: "1olli1" }],
  ["path", { d: "M22 5h-4", key: "1gvqau" }],
  ["path", { d: "M4 17v2", key: "vumght" }],
  ["path", { d: "M5 18H3", key: "zchphs" }],
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const rE = Qa("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }],
]);
function jg(e, t) {
  if (typeof e == "function") return e(t);
  e != null && (e.current = t);
}
function Ti(...e) {
  return (t) => {
    let n = !1;
    const a = e.map((o) => {
      const r = jg(o, t);
      return (!n && typeof r == "function" && (n = !0), r);
    });
    if (n)
      return () => {
        for (let o = 0; o < a.length; o++) {
          const r = a[o];
          typeof r == "function" ? r() : jg(e[o], null);
        }
      };
  };
}
function Ae(...e) {
  return p.useCallback(Ti(...e), e);
}
var iE = Symbol.for("react.lazy"),
  cs = Df[" use ".trim().toString()];
function lE(e) {
  return typeof e == "object" && e !== null && "then" in e;
}
function Qy(e) {
  return (
    e != null &&
    typeof e == "object" &&
    "$$typeof" in e &&
    e.$$typeof === iE &&
    "_payload" in e &&
    lE(e._payload)
  );
}
function Zy(e) {
  const t = sE(e),
    n = p.forwardRef((a, o) => {
      let { children: r, ...i } = a;
      Qy(r) && typeof cs == "function" && (r = cs(r._payload));
      const l = p.Children.toArray(r),
        s = l.find(uE);
      if (s) {
        const c = s.props.children,
          f = l.map((u) =>
            u === s
              ? p.Children.count(c) > 1
                ? p.Children.only(null)
                : p.isValidElement(c)
                  ? c.props.children
                  : null
              : u,
          );
        return x.jsx(t, {
          ...i,
          ref: o,
          children: p.isValidElement(c) ? p.cloneElement(c, void 0, f) : null,
        });
      }
      return x.jsx(t, { ...i, ref: o, children: r });
    });
  return ((n.displayName = `${e}.Slot`), n);
}
var or = Zy("Slot");
function sE(e) {
  const t = p.forwardRef((n, a) => {
    let { children: o, ...r } = n;
    if (
      (Qy(o) && typeof cs == "function" && (o = cs(o._payload)),
      p.isValidElement(o))
    ) {
      const i = dE(o),
        l = fE(r, o.props);
      return (
        o.type !== p.Fragment && (l.ref = a ? Ti(a, i) : i),
        p.cloneElement(o, l)
      );
    }
    return p.Children.count(o) > 1 ? p.Children.only(null) : null;
  });
  return ((t.displayName = `${e}.SlotClone`), t);
}
var cE = Symbol("radix.slottable");
function uE(e) {
  return (
    p.isValidElement(e) &&
    typeof e.type == "function" &&
    "__radixId" in e.type &&
    e.type.__radixId === cE
  );
}
function fE(e, t) {
  const n = { ...t };
  for (const a in t) {
    const o = e[a],
      r = t[a];
    /^on[A-Z]/.test(a)
      ? o && r
        ? (n[a] = (...l) => {
            const s = r(...l);
            return (o(...l), s);
          })
        : o && (n[a] = o)
      : a === "style"
        ? (n[a] = { ...o, ...r })
        : a === "className" && (n[a] = [o, r].filter(Boolean).join(" "));
  }
  return { ...e, ...n };
}
function dE(e) {
  var a, o;
  let t =
      (a = Object.getOwnPropertyDescriptor(e.props, "ref")) == null
        ? void 0
        : a.get,
    n = t && "isReactWarning" in t && t.isReactWarning;
  return n
    ? e.ref
    : ((t =
        (o = Object.getOwnPropertyDescriptor(e, "ref")) == null
          ? void 0
          : o.get),
      (n = t && "isReactWarning" in t && t.isReactWarning),
      n ? e.props.ref : e.props.ref || e.ref);
}
function Jy(e) {
  var t,
    n,
    a = "";
  if (typeof e == "string" || typeof e == "number") a += e;
  else if (typeof e == "object")
    if (Array.isArray(e)) {
      var o = e.length;
      for (t = 0; t < o; t++)
        e[t] && (n = Jy(e[t])) && (a && (a += " "), (a += n));
    } else for (n in e) e[n] && (a && (a += " "), (a += n));
  return a;
}
function Wy() {
  for (var e, t, n = 0, a = "", o = arguments.length; n < o; n++)
    (e = arguments[n]) && (t = Jy(e)) && (a && (a += " "), (a += t));
  return a;
}
const Bg = (e) => (typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e),
  Ug = Wy,
  Td = (e, t) => (n) => {
    var a;
    if ((t == null ? void 0 : t.variants) == null)
      return Ug(
        e,
        n == null ? void 0 : n.class,
        n == null ? void 0 : n.className,
      );
    const { variants: o, defaultVariants: r } = t,
      i = Object.keys(o).map((c) => {
        const f = n == null ? void 0 : n[c],
          u = r == null ? void 0 : r[c];
        if (f === null) return null;
        const d = Bg(f) || Bg(u);
        return o[c][d];
      }),
      l =
        n &&
        Object.entries(n).reduce((c, f) => {
          let [u, d] = f;
          return (d === void 0 || (c[u] = d), c);
        }, {}),
      s =
        t == null || (a = t.compoundVariants) === null || a === void 0
          ? void 0
          : a.reduce((c, f) => {
              let { class: u, className: d, ...g } = f;
              return Object.entries(g).every((S) => {
                let [v, b] = S;
                return Array.isArray(b)
                  ? b.includes({ ...r, ...l }[v])
                  : { ...r, ...l }[v] === b;
              })
                ? [...c, u, d]
                : c;
            }, []);
    return Ug(
      e,
      i,
      s,
      n == null ? void 0 : n.class,
      n == null ? void 0 : n.className,
    );
  },
  mE = (e, t) => {
    const n = new Array(e.length + t.length);
    for (let a = 0; a < e.length; a++) n[a] = e[a];
    for (let a = 0; a < t.length; a++) n[e.length + a] = t[a];
    return n;
  },
  gE = (e, t) => ({ classGroupId: e, validator: t }),
  eb = (e = new Map(), t = null, n) => ({
    nextPart: e,
    validators: t,
    classGroupId: n,
  }),
  us = "-",
  Hg = [],
  hE = "arbitrary..",
  pE = (e) => {
    const t = yE(e),
      { conflictingClassGroups: n, conflictingClassGroupModifiers: a } = e;
    return {
      getClassGroupId: (i) => {
        if (i.startsWith("[") && i.endsWith("]")) return vE(i);
        const l = i.split(us),
          s = l[0] === "" && l.length > 1 ? 1 : 0;
        return tb(l, s, t);
      },
      getConflictingClassGroupIds: (i, l) => {
        if (l) {
          const s = a[i],
            c = n[i];
          return s ? (c ? mE(c, s) : s) : c || Hg;
        }
        return n[i] || Hg;
      },
    };
  },
  tb = (e, t, n) => {
    if (e.length - t === 0) return n.classGroupId;
    const o = e[t],
      r = n.nextPart.get(o);
    if (r) {
      const c = tb(e, t + 1, r);
      if (c) return c;
    }
    const i = n.validators;
    if (i === null) return;
    const l = t === 0 ? e.join(us) : e.slice(t).join(us),
      s = i.length;
    for (let c = 0; c < s; c++) {
      const f = i[c];
      if (f.validator(l)) return f.classGroupId;
    }
  },
  vE = (e) =>
    e.slice(1, -1).indexOf(":") === -1
      ? void 0
      : (() => {
          const t = e.slice(1, -1),
            n = t.indexOf(":"),
            a = t.slice(0, n);
          return a ? hE + a : void 0;
        })(),
  yE = (e) => {
    const { theme: t, classGroups: n } = e;
    return bE(n, t);
  },
  bE = (e, t) => {
    const n = eb();
    for (const a in e) {
      const o = e[a];
      Rd(o, n, a, t);
    }
    return n;
  },
  Rd = (e, t, n, a) => {
    const o = e.length;
    for (let r = 0; r < o; r++) {
      const i = e[r];
      SE(i, t, n, a);
    }
  },
  SE = (e, t, n, a) => {
    if (typeof e == "string") {
      wE(e, t, n);
      return;
    }
    if (typeof e == "function") {
      xE(e, t, n, a);
      return;
    }
    EE(e, t, n, a);
  },
  wE = (e, t, n) => {
    const a = e === "" ? t : nb(t, e);
    a.classGroupId = n;
  },
  xE = (e, t, n, a) => {
    if (CE(e)) {
      Rd(e(a), t, n, a);
      return;
    }
    (t.validators === null && (t.validators = []), t.validators.push(gE(n, e)));
  },
  EE = (e, t, n, a) => {
    const o = Object.entries(e),
      r = o.length;
    for (let i = 0; i < r; i++) {
      const [l, s] = o[i];
      Rd(s, nb(t, l), n, a);
    }
  },
  nb = (e, t) => {
    let n = e;
    const a = t.split(us),
      o = a.length;
    for (let r = 0; r < o; r++) {
      const i = a[r];
      let l = n.nextPart.get(i);
      (l || ((l = eb()), n.nextPart.set(i, l)), (n = l));
    }
    return n;
  },
  CE = (e) => "isThemeGetter" in e && e.isThemeGetter === !0,
  AE = (e) => {
    if (e < 1) return { get: () => {}, set: () => {} };
    let t = 0,
      n = Object.create(null),
      a = Object.create(null);
    const o = (r, i) => {
      ((n[r] = i), t++, t > e && ((t = 0), (a = n), (n = Object.create(null))));
    };
    return {
      get(r) {
        let i = n[r];
        if (i !== void 0) return i;
        if ((i = a[r]) !== void 0) return (o(r, i), i);
      },
      set(r, i) {
        r in n ? (n[r] = i) : o(r, i);
      },
    };
  },
  sf = "!",
  Pg = ":",
  TE = [],
  Vg = (e, t, n, a, o) => ({
    modifiers: e,
    hasImportantModifier: t,
    baseClassName: n,
    maybePostfixModifierPosition: a,
    isExternal: o,
  }),
  RE = (e) => {
    const { prefix: t, experimentalParseClassName: n } = e;
    let a = (o) => {
      const r = [];
      let i = 0,
        l = 0,
        s = 0,
        c;
      const f = o.length;
      for (let v = 0; v < f; v++) {
        const b = o[v];
        if (i === 0 && l === 0) {
          if (b === Pg) {
            (r.push(o.slice(s, v)), (s = v + 1));
            continue;
          }
          if (b === "/") {
            c = v;
            continue;
          }
        }
        b === "[" ? i++ : b === "]" ? i-- : b === "(" ? l++ : b === ")" && l--;
      }
      const u = r.length === 0 ? o : o.slice(s);
      let d = u,
        g = !1;
      u.endsWith(sf)
        ? ((d = u.slice(0, -1)), (g = !0))
        : u.startsWith(sf) && ((d = u.slice(1)), (g = !0));
      const S = c && c > s ? c - s : void 0;
      return Vg(r, g, d, S);
    };
    if (t) {
      const o = t + Pg,
        r = a;
      a = (i) =>
        i.startsWith(o) ? r(i.slice(o.length)) : Vg(TE, !1, i, void 0, !0);
    }
    if (n) {
      const o = a;
      a = (r) => n({ className: r, parseClassName: o });
    }
    return a;
  },
  ME = (e) => {
    const t = new Map();
    return (
      e.orderSensitiveModifiers.forEach((n, a) => {
        t.set(n, 1e6 + a);
      }),
      (n) => {
        const a = [];
        let o = [];
        for (let r = 0; r < n.length; r++) {
          const i = n[r],
            l = i[0] === "[",
            s = t.has(i);
          l || s
            ? (o.length > 0 && (o.sort(), a.push(...o), (o = [])), a.push(i))
            : o.push(i);
        }
        return (o.length > 0 && (o.sort(), a.push(...o)), a);
      }
    );
  },
  DE = (e) => ({
    cache: AE(e.cacheSize),
    parseClassName: RE(e),
    sortModifiers: ME(e),
    ...pE(e),
  }),
  OE = /\s+/,
  kE = (e, t) => {
    const {
        parseClassName: n,
        getClassGroupId: a,
        getConflictingClassGroupIds: o,
        sortModifiers: r,
      } = t,
      i = [],
      l = e.trim().split(OE);
    let s = "";
    for (let c = l.length - 1; c >= 0; c -= 1) {
      const f = l[c],
        {
          isExternal: u,
          modifiers: d,
          hasImportantModifier: g,
          baseClassName: S,
          maybePostfixModifierPosition: v,
        } = n(f);
      if (u) {
        s = f + (s.length > 0 ? " " + s : s);
        continue;
      }
      let b = !!v,
        m = a(b ? S.substring(0, v) : S);
      if (!m) {
        if (!b) {
          s = f + (s.length > 0 ? " " + s : s);
          continue;
        }
        if (((m = a(S)), !m)) {
          s = f + (s.length > 0 ? " " + s : s);
          continue;
        }
        b = !1;
      }
      const h = d.length === 0 ? "" : d.length === 1 ? d[0] : r(d).join(":"),
        y = g ? h + sf : h,
        w = y + m;
      if (i.indexOf(w) > -1) continue;
      i.push(w);
      const C = o(m, b);
      for (let R = 0; R < C.length; ++R) {
        const E = C[R];
        i.push(y + E);
      }
      s = f + (s.length > 0 ? " " + s : s);
    }
    return s;
  },
  NE = (...e) => {
    let t = 0,
      n,
      a,
      o = "";
    for (; t < e.length; )
      (n = e[t++]) && (a = ab(n)) && (o && (o += " "), (o += a));
    return o;
  },
  ab = (e) => {
    if (typeof e == "string") return e;
    let t,
      n = "";
    for (let a = 0; a < e.length; a++)
      e[a] && (t = ab(e[a])) && (n && (n += " "), (n += t));
    return n;
  },
  _E = (e, ...t) => {
    let n, a, o, r;
    const i = (s) => {
        const c = t.reduce((f, u) => u(f), e());
        return (
          (n = DE(c)),
          (a = n.cache.get),
          (o = n.cache.set),
          (r = l),
          l(s)
        );
      },
      l = (s) => {
        const c = a(s);
        if (c) return c;
        const f = kE(s, n);
        return (o(s, f), f);
      };
    return ((r = i), (...s) => r(NE(...s)));
  },
  LE = [],
  Ue = (e) => {
    const t = (n) => n[e] || LE;
    return ((t.isThemeGetter = !0), t);
  },
  ob = /^\[(?:(\w[\w-]*):)?(.+)\]$/i,
  rb = /^\((?:(\w[\w-]*):)?(.+)\)$/i,
  zE = /^\d+\/\d+$/,
  jE = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/,
  BE =
    /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/,
  UE = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/,
  HE = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/,
  PE =
    /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/,
  ro = (e) => zE.test(e),
  te = (e) => !!e && !Number.isNaN(Number(e)),
  Gn = (e) => !!e && Number.isInteger(Number(e)),
  $c = (e) => e.endsWith("%") && te(e.slice(0, -1)),
  wn = (e) => jE.test(e),
  VE = () => !0,
  IE = (e) => BE.test(e) && !UE.test(e),
  ib = () => !1,
  GE = (e) => HE.test(e),
  YE = (e) => PE.test(e),
  FE = (e) => !H(e) && !P(e),
  KE = (e) => rr(e, cb, ib),
  H = (e) => ob.test(e),
  Ta = (e) => rr(e, ub, IE),
  Qc = (e) => rr(e, ZE, te),
  Ig = (e) => rr(e, lb, ib),
  qE = (e) => rr(e, sb, YE),
  Wi = (e) => rr(e, fb, GE),
  P = (e) => rb.test(e),
  pr = (e) => ir(e, ub),
  XE = (e) => ir(e, JE),
  Gg = (e) => ir(e, lb),
  $E = (e) => ir(e, cb),
  QE = (e) => ir(e, sb),
  el = (e) => ir(e, fb, !0),
  rr = (e, t, n) => {
    const a = ob.exec(e);
    return a ? (a[1] ? t(a[1]) : n(a[2])) : !1;
  },
  ir = (e, t, n = !1) => {
    const a = rb.exec(e);
    return a ? (a[1] ? t(a[1]) : n) : !1;
  },
  lb = (e) => e === "position" || e === "percentage",
  sb = (e) => e === "image" || e === "url",
  cb = (e) => e === "length" || e === "size" || e === "bg-size",
  ub = (e) => e === "length",
  ZE = (e) => e === "number",
  JE = (e) => e === "family-name",
  fb = (e) => e === "shadow",
  WE = () => {
    const e = Ue("color"),
      t = Ue("font"),
      n = Ue("text"),
      a = Ue("font-weight"),
      o = Ue("tracking"),
      r = Ue("leading"),
      i = Ue("breakpoint"),
      l = Ue("container"),
      s = Ue("spacing"),
      c = Ue("radius"),
      f = Ue("shadow"),
      u = Ue("inset-shadow"),
      d = Ue("text-shadow"),
      g = Ue("drop-shadow"),
      S = Ue("blur"),
      v = Ue("perspective"),
      b = Ue("aspect"),
      m = Ue("ease"),
      h = Ue("animate"),
      y = () => [
        "auto",
        "avoid",
        "all",
        "avoid-page",
        "page",
        "left",
        "right",
        "column",
      ],
      w = () => [
        "center",
        "top",
        "bottom",
        "left",
        "right",
        "top-left",
        "left-top",
        "top-right",
        "right-top",
        "bottom-right",
        "right-bottom",
        "bottom-left",
        "left-bottom",
      ],
      C = () => [...w(), P, H],
      R = () => ["auto", "hidden", "clip", "visible", "scroll"],
      E = () => ["auto", "contain", "none"],
      A = () => [P, H, s],
      O = () => [ro, "full", "auto", ...A()],
      N = () => [Gn, "none", "subgrid", P, H],
      B = () => ["auto", { span: ["full", Gn, P, H] }, Gn, P, H],
      z = () => [Gn, "auto", P, H],
      G = () => ["auto", "min", "max", "fr", P, H],
      V = () => [
        "start",
        "end",
        "center",
        "between",
        "around",
        "evenly",
        "stretch",
        "baseline",
        "center-safe",
        "end-safe",
      ],
      Y = () => [
        "start",
        "end",
        "center",
        "stretch",
        "center-safe",
        "end-safe",
      ],
      M = () => ["auto", ...A()],
      _ = () => [
        ro,
        "auto",
        "full",
        "dvw",
        "dvh",
        "lvw",
        "lvh",
        "svw",
        "svh",
        "min",
        "max",
        "fit",
        ...A(),
      ],
      T = () => [e, P, H],
      D = () => [...w(), Gg, Ig, { position: [P, H] }],
      j = () => ["no-repeat", { repeat: ["", "x", "y", "space", "round"] }],
      q = () => ["auto", "cover", "contain", $E, KE, { size: [P, H] }],
      le = () => [$c, pr, Ta],
      U = () => ["", "none", "full", c, P, H],
      I = () => ["", te, pr, Ta],
      X = () => ["solid", "dashed", "dotted", "double"],
      fe = () => [
        "normal",
        "multiply",
        "screen",
        "overlay",
        "darken",
        "lighten",
        "color-dodge",
        "color-burn",
        "hard-light",
        "soft-light",
        "difference",
        "exclusion",
        "hue",
        "saturation",
        "color",
        "luminosity",
      ],
      Q = () => [te, $c, Gg, Ig],
      W = () => ["", "none", S, P, H],
      pe = () => ["none", te, P, H],
      be = () => ["none", te, P, H],
      ct = () => [te, P, H],
      qe = () => [ro, "full", ...A()];
    return {
      cacheSize: 500,
      theme: {
        animate: ["spin", "ping", "pulse", "bounce"],
        aspect: ["video"],
        blur: [wn],
        breakpoint: [wn],
        color: [VE],
        container: [wn],
        "drop-shadow": [wn],
        ease: ["in", "out", "in-out"],
        font: [FE],
        "font-weight": [
          "thin",
          "extralight",
          "light",
          "normal",
          "medium",
          "semibold",
          "bold",
          "extrabold",
          "black",
        ],
        "inset-shadow": [wn],
        leading: ["none", "tight", "snug", "normal", "relaxed", "loose"],
        perspective: [
          "dramatic",
          "near",
          "normal",
          "midrange",
          "distant",
          "none",
        ],
        radius: [wn],
        shadow: [wn],
        spacing: ["px", te],
        text: [wn],
        "text-shadow": [wn],
        tracking: ["tighter", "tight", "normal", "wide", "wider", "widest"],
      },
      classGroups: {
        aspect: [{ aspect: ["auto", "square", ro, H, P, b] }],
        container: ["container"],
        columns: [{ columns: [te, H, P, l] }],
        "break-after": [{ "break-after": y() }],
        "break-before": [{ "break-before": y() }],
        "break-inside": [
          { "break-inside": ["auto", "avoid", "avoid-page", "avoid-column"] },
        ],
        "box-decoration": [{ "box-decoration": ["slice", "clone"] }],
        box: [{ box: ["border", "content"] }],
        display: [
          "block",
          "inline-block",
          "inline",
          "flex",
          "inline-flex",
          "table",
          "inline-table",
          "table-caption",
          "table-cell",
          "table-column",
          "table-column-group",
          "table-footer-group",
          "table-header-group",
          "table-row-group",
          "table-row",
          "flow-root",
          "grid",
          "inline-grid",
          "contents",
          "list-item",
          "hidden",
        ],
        sr: ["sr-only", "not-sr-only"],
        float: [{ float: ["right", "left", "none", "start", "end"] }],
        clear: [{ clear: ["left", "right", "both", "none", "start", "end"] }],
        isolation: ["isolate", "isolation-auto"],
        "object-fit": [
          { object: ["contain", "cover", "fill", "none", "scale-down"] },
        ],
        "object-position": [{ object: C() }],
        overflow: [{ overflow: R() }],
        "overflow-x": [{ "overflow-x": R() }],
        "overflow-y": [{ "overflow-y": R() }],
        overscroll: [{ overscroll: E() }],
        "overscroll-x": [{ "overscroll-x": E() }],
        "overscroll-y": [{ "overscroll-y": E() }],
        position: ["static", "fixed", "absolute", "relative", "sticky"],
        inset: [{ inset: O() }],
        "inset-x": [{ "inset-x": O() }],
        "inset-y": [{ "inset-y": O() }],
        start: [{ start: O() }],
        end: [{ end: O() }],
        top: [{ top: O() }],
        right: [{ right: O() }],
        bottom: [{ bottom: O() }],
        left: [{ left: O() }],
        visibility: ["visible", "invisible", "collapse"],
        z: [{ z: [Gn, "auto", P, H] }],
        basis: [{ basis: [ro, "full", "auto", l, ...A()] }],
        "flex-direction": [
          { flex: ["row", "row-reverse", "col", "col-reverse"] },
        ],
        "flex-wrap": [{ flex: ["nowrap", "wrap", "wrap-reverse"] }],
        flex: [{ flex: [te, ro, "auto", "initial", "none", H] }],
        grow: [{ grow: ["", te, P, H] }],
        shrink: [{ shrink: ["", te, P, H] }],
        order: [{ order: [Gn, "first", "last", "none", P, H] }],
        "grid-cols": [{ "grid-cols": N() }],
        "col-start-end": [{ col: B() }],
        "col-start": [{ "col-start": z() }],
        "col-end": [{ "col-end": z() }],
        "grid-rows": [{ "grid-rows": N() }],
        "row-start-end": [{ row: B() }],
        "row-start": [{ "row-start": z() }],
        "row-end": [{ "row-end": z() }],
        "grid-flow": [
          { "grid-flow": ["row", "col", "dense", "row-dense", "col-dense"] },
        ],
        "auto-cols": [{ "auto-cols": G() }],
        "auto-rows": [{ "auto-rows": G() }],
        gap: [{ gap: A() }],
        "gap-x": [{ "gap-x": A() }],
        "gap-y": [{ "gap-y": A() }],
        "justify-content": [{ justify: [...V(), "normal"] }],
        "justify-items": [{ "justify-items": [...Y(), "normal"] }],
        "justify-self": [{ "justify-self": ["auto", ...Y()] }],
        "align-content": [{ content: ["normal", ...V()] }],
        "align-items": [{ items: [...Y(), { baseline: ["", "last"] }] }],
        "align-self": [{ self: ["auto", ...Y(), { baseline: ["", "last"] }] }],
        "place-content": [{ "place-content": V() }],
        "place-items": [{ "place-items": [...Y(), "baseline"] }],
        "place-self": [{ "place-self": ["auto", ...Y()] }],
        p: [{ p: A() }],
        px: [{ px: A() }],
        py: [{ py: A() }],
        ps: [{ ps: A() }],
        pe: [{ pe: A() }],
        pt: [{ pt: A() }],
        pr: [{ pr: A() }],
        pb: [{ pb: A() }],
        pl: [{ pl: A() }],
        m: [{ m: M() }],
        mx: [{ mx: M() }],
        my: [{ my: M() }],
        ms: [{ ms: M() }],
        me: [{ me: M() }],
        mt: [{ mt: M() }],
        mr: [{ mr: M() }],
        mb: [{ mb: M() }],
        ml: [{ ml: M() }],
        "space-x": [{ "space-x": A() }],
        "space-x-reverse": ["space-x-reverse"],
        "space-y": [{ "space-y": A() }],
        "space-y-reverse": ["space-y-reverse"],
        size: [{ size: _() }],
        w: [{ w: [l, "screen", ..._()] }],
        "min-w": [{ "min-w": [l, "screen", "none", ..._()] }],
        "max-w": [
          { "max-w": [l, "screen", "none", "prose", { screen: [i] }, ..._()] },
        ],
        h: [{ h: ["screen", "lh", ..._()] }],
        "min-h": [{ "min-h": ["screen", "lh", "none", ..._()] }],
        "max-h": [{ "max-h": ["screen", "lh", ..._()] }],
        "font-size": [{ text: ["base", n, pr, Ta] }],
        "font-smoothing": ["antialiased", "subpixel-antialiased"],
        "font-style": ["italic", "not-italic"],
        "font-weight": [{ font: [a, P, Qc] }],
        "font-stretch": [
          {
            "font-stretch": [
              "ultra-condensed",
              "extra-condensed",
              "condensed",
              "semi-condensed",
              "normal",
              "semi-expanded",
              "expanded",
              "extra-expanded",
              "ultra-expanded",
              $c,
              H,
            ],
          },
        ],
        "font-family": [{ font: [XE, H, t] }],
        "fvn-normal": ["normal-nums"],
        "fvn-ordinal": ["ordinal"],
        "fvn-slashed-zero": ["slashed-zero"],
        "fvn-figure": ["lining-nums", "oldstyle-nums"],
        "fvn-spacing": ["proportional-nums", "tabular-nums"],
        "fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
        tracking: [{ tracking: [o, P, H] }],
        "line-clamp": [{ "line-clamp": [te, "none", P, Qc] }],
        leading: [{ leading: [r, ...A()] }],
        "list-image": [{ "list-image": ["none", P, H] }],
        "list-style-position": [{ list: ["inside", "outside"] }],
        "list-style-type": [{ list: ["disc", "decimal", "none", P, H] }],
        "text-alignment": [
          { text: ["left", "center", "right", "justify", "start", "end"] },
        ],
        "placeholder-color": [{ placeholder: T() }],
        "text-color": [{ text: T() }],
        "text-decoration": [
          "underline",
          "overline",
          "line-through",
          "no-underline",
        ],
        "text-decoration-style": [{ decoration: [...X(), "wavy"] }],
        "text-decoration-thickness": [
          { decoration: [te, "from-font", "auto", P, Ta] },
        ],
        "text-decoration-color": [{ decoration: T() }],
        "underline-offset": [{ "underline-offset": [te, "auto", P, H] }],
        "text-transform": [
          "uppercase",
          "lowercase",
          "capitalize",
          "normal-case",
        ],
        "text-overflow": ["truncate", "text-ellipsis", "text-clip"],
        "text-wrap": [{ text: ["wrap", "nowrap", "balance", "pretty"] }],
        indent: [{ indent: A() }],
        "vertical-align": [
          {
            align: [
              "baseline",
              "top",
              "middle",
              "bottom",
              "text-top",
              "text-bottom",
              "sub",
              "super",
              P,
              H,
            ],
          },
        ],
        whitespace: [
          {
            whitespace: [
              "normal",
              "nowrap",
              "pre",
              "pre-line",
              "pre-wrap",
              "break-spaces",
            ],
          },
        ],
        break: [{ break: ["normal", "words", "all", "keep"] }],
        wrap: [{ wrap: ["break-word", "anywhere", "normal"] }],
        hyphens: [{ hyphens: ["none", "manual", "auto"] }],
        content: [{ content: ["none", P, H] }],
        "bg-attachment": [{ bg: ["fixed", "local", "scroll"] }],
        "bg-clip": [{ "bg-clip": ["border", "padding", "content", "text"] }],
        "bg-origin": [{ "bg-origin": ["border", "padding", "content"] }],
        "bg-position": [{ bg: D() }],
        "bg-repeat": [{ bg: j() }],
        "bg-size": [{ bg: q() }],
        "bg-image": [
          {
            bg: [
              "none",
              {
                linear: [
                  { to: ["t", "tr", "r", "br", "b", "bl", "l", "tl"] },
                  Gn,
                  P,
                  H,
                ],
                radial: ["", P, H],
                conic: [Gn, P, H],
              },
              QE,
              qE,
            ],
          },
        ],
        "bg-color": [{ bg: T() }],
        "gradient-from-pos": [{ from: le() }],
        "gradient-via-pos": [{ via: le() }],
        "gradient-to-pos": [{ to: le() }],
        "gradient-from": [{ from: T() }],
        "gradient-via": [{ via: T() }],
        "gradient-to": [{ to: T() }],
        rounded: [{ rounded: U() }],
        "rounded-s": [{ "rounded-s": U() }],
        "rounded-e": [{ "rounded-e": U() }],
        "rounded-t": [{ "rounded-t": U() }],
        "rounded-r": [{ "rounded-r": U() }],
        "rounded-b": [{ "rounded-b": U() }],
        "rounded-l": [{ "rounded-l": U() }],
        "rounded-ss": [{ "rounded-ss": U() }],
        "rounded-se": [{ "rounded-se": U() }],
        "rounded-ee": [{ "rounded-ee": U() }],
        "rounded-es": [{ "rounded-es": U() }],
        "rounded-tl": [{ "rounded-tl": U() }],
        "rounded-tr": [{ "rounded-tr": U() }],
        "rounded-br": [{ "rounded-br": U() }],
        "rounded-bl": [{ "rounded-bl": U() }],
        "border-w": [{ border: I() }],
        "border-w-x": [{ "border-x": I() }],
        "border-w-y": [{ "border-y": I() }],
        "border-w-s": [{ "border-s": I() }],
        "border-w-e": [{ "border-e": I() }],
        "border-w-t": [{ "border-t": I() }],
        "border-w-r": [{ "border-r": I() }],
        "border-w-b": [{ "border-b": I() }],
        "border-w-l": [{ "border-l": I() }],
        "divide-x": [{ "divide-x": I() }],
        "divide-x-reverse": ["divide-x-reverse"],
        "divide-y": [{ "divide-y": I() }],
        "divide-y-reverse": ["divide-y-reverse"],
        "border-style": [{ border: [...X(), "hidden", "none"] }],
        "divide-style": [{ divide: [...X(), "hidden", "none"] }],
        "border-color": [{ border: T() }],
        "border-color-x": [{ "border-x": T() }],
        "border-color-y": [{ "border-y": T() }],
        "border-color-s": [{ "border-s": T() }],
        "border-color-e": [{ "border-e": T() }],
        "border-color-t": [{ "border-t": T() }],
        "border-color-r": [{ "border-r": T() }],
        "border-color-b": [{ "border-b": T() }],
        "border-color-l": [{ "border-l": T() }],
        "divide-color": [{ divide: T() }],
        "outline-style": [{ outline: [...X(), "none", "hidden"] }],
        "outline-offset": [{ "outline-offset": [te, P, H] }],
        "outline-w": [{ outline: ["", te, pr, Ta] }],
        "outline-color": [{ outline: T() }],
        shadow: [{ shadow: ["", "none", f, el, Wi] }],
        "shadow-color": [{ shadow: T() }],
        "inset-shadow": [{ "inset-shadow": ["none", u, el, Wi] }],
        "inset-shadow-color": [{ "inset-shadow": T() }],
        "ring-w": [{ ring: I() }],
        "ring-w-inset": ["ring-inset"],
        "ring-color": [{ ring: T() }],
        "ring-offset-w": [{ "ring-offset": [te, Ta] }],
        "ring-offset-color": [{ "ring-offset": T() }],
        "inset-ring-w": [{ "inset-ring": I() }],
        "inset-ring-color": [{ "inset-ring": T() }],
        "text-shadow": [{ "text-shadow": ["none", d, el, Wi] }],
        "text-shadow-color": [{ "text-shadow": T() }],
        opacity: [{ opacity: [te, P, H] }],
        "mix-blend": [
          { "mix-blend": [...fe(), "plus-darker", "plus-lighter"] },
        ],
        "bg-blend": [{ "bg-blend": fe() }],
        "mask-clip": [
          {
            "mask-clip": [
              "border",
              "padding",
              "content",
              "fill",
              "stroke",
              "view",
            ],
          },
          "mask-no-clip",
        ],
        "mask-composite": [
          { mask: ["add", "subtract", "intersect", "exclude"] },
        ],
        "mask-image-linear-pos": [{ "mask-linear": [te] }],
        "mask-image-linear-from-pos": [{ "mask-linear-from": Q() }],
        "mask-image-linear-to-pos": [{ "mask-linear-to": Q() }],
        "mask-image-linear-from-color": [{ "mask-linear-from": T() }],
        "mask-image-linear-to-color": [{ "mask-linear-to": T() }],
        "mask-image-t-from-pos": [{ "mask-t-from": Q() }],
        "mask-image-t-to-pos": [{ "mask-t-to": Q() }],
        "mask-image-t-from-color": [{ "mask-t-from": T() }],
        "mask-image-t-to-color": [{ "mask-t-to": T() }],
        "mask-image-r-from-pos": [{ "mask-r-from": Q() }],
        "mask-image-r-to-pos": [{ "mask-r-to": Q() }],
        "mask-image-r-from-color": [{ "mask-r-from": T() }],
        "mask-image-r-to-color": [{ "mask-r-to": T() }],
        "mask-image-b-from-pos": [{ "mask-b-from": Q() }],
        "mask-image-b-to-pos": [{ "mask-b-to": Q() }],
        "mask-image-b-from-color": [{ "mask-b-from": T() }],
        "mask-image-b-to-color": [{ "mask-b-to": T() }],
        "mask-image-l-from-pos": [{ "mask-l-from": Q() }],
        "mask-image-l-to-pos": [{ "mask-l-to": Q() }],
        "mask-image-l-from-color": [{ "mask-l-from": T() }],
        "mask-image-l-to-color": [{ "mask-l-to": T() }],
        "mask-image-x-from-pos": [{ "mask-x-from": Q() }],
        "mask-image-x-to-pos": [{ "mask-x-to": Q() }],
        "mask-image-x-from-color": [{ "mask-x-from": T() }],
        "mask-image-x-to-color": [{ "mask-x-to": T() }],
        "mask-image-y-from-pos": [{ "mask-y-from": Q() }],
        "mask-image-y-to-pos": [{ "mask-y-to": Q() }],
        "mask-image-y-from-color": [{ "mask-y-from": T() }],
        "mask-image-y-to-color": [{ "mask-y-to": T() }],
        "mask-image-radial": [{ "mask-radial": [P, H] }],
        "mask-image-radial-from-pos": [{ "mask-radial-from": Q() }],
        "mask-image-radial-to-pos": [{ "mask-radial-to": Q() }],
        "mask-image-radial-from-color": [{ "mask-radial-from": T() }],
        "mask-image-radial-to-color": [{ "mask-radial-to": T() }],
        "mask-image-radial-shape": [{ "mask-radial": ["circle", "ellipse"] }],
        "mask-image-radial-size": [
          {
            "mask-radial": [
              { closest: ["side", "corner"], farthest: ["side", "corner"] },
            ],
          },
        ],
        "mask-image-radial-pos": [{ "mask-radial-at": w() }],
        "mask-image-conic-pos": [{ "mask-conic": [te] }],
        "mask-image-conic-from-pos": [{ "mask-conic-from": Q() }],
        "mask-image-conic-to-pos": [{ "mask-conic-to": Q() }],
        "mask-image-conic-from-color": [{ "mask-conic-from": T() }],
        "mask-image-conic-to-color": [{ "mask-conic-to": T() }],
        "mask-mode": [{ mask: ["alpha", "luminance", "match"] }],
        "mask-origin": [
          {
            "mask-origin": [
              "border",
              "padding",
              "content",
              "fill",
              "stroke",
              "view",
            ],
          },
        ],
        "mask-position": [{ mask: D() }],
        "mask-repeat": [{ mask: j() }],
        "mask-size": [{ mask: q() }],
        "mask-type": [{ "mask-type": ["alpha", "luminance"] }],
        "mask-image": [{ mask: ["none", P, H] }],
        filter: [{ filter: ["", "none", P, H] }],
        blur: [{ blur: W() }],
        brightness: [{ brightness: [te, P, H] }],
        contrast: [{ contrast: [te, P, H] }],
        "drop-shadow": [{ "drop-shadow": ["", "none", g, el, Wi] }],
        "drop-shadow-color": [{ "drop-shadow": T() }],
        grayscale: [{ grayscale: ["", te, P, H] }],
        "hue-rotate": [{ "hue-rotate": [te, P, H] }],
        invert: [{ invert: ["", te, P, H] }],
        saturate: [{ saturate: [te, P, H] }],
        sepia: [{ sepia: ["", te, P, H] }],
        "backdrop-filter": [{ "backdrop-filter": ["", "none", P, H] }],
        "backdrop-blur": [{ "backdrop-blur": W() }],
        "backdrop-brightness": [{ "backdrop-brightness": [te, P, H] }],
        "backdrop-contrast": [{ "backdrop-contrast": [te, P, H] }],
        "backdrop-grayscale": [{ "backdrop-grayscale": ["", te, P, H] }],
        "backdrop-hue-rotate": [{ "backdrop-hue-rotate": [te, P, H] }],
        "backdrop-invert": [{ "backdrop-invert": ["", te, P, H] }],
        "backdrop-opacity": [{ "backdrop-opacity": [te, P, H] }],
        "backdrop-saturate": [{ "backdrop-saturate": [te, P, H] }],
        "backdrop-sepia": [{ "backdrop-sepia": ["", te, P, H] }],
        "border-collapse": [{ border: ["collapse", "separate"] }],
        "border-spacing": [{ "border-spacing": A() }],
        "border-spacing-x": [{ "border-spacing-x": A() }],
        "border-spacing-y": [{ "border-spacing-y": A() }],
        "table-layout": [{ table: ["auto", "fixed"] }],
        caption: [{ caption: ["top", "bottom"] }],
        transition: [
          {
            transition: [
              "",
              "all",
              "colors",
              "opacity",
              "shadow",
              "transform",
              "none",
              P,
              H,
            ],
          },
        ],
        "transition-behavior": [{ transition: ["normal", "discrete"] }],
        duration: [{ duration: [te, "initial", P, H] }],
        ease: [{ ease: ["linear", "initial", m, P, H] }],
        delay: [{ delay: [te, P, H] }],
        animate: [{ animate: ["none", h, P, H] }],
        backface: [{ backface: ["hidden", "visible"] }],
        perspective: [{ perspective: [v, P, H] }],
        "perspective-origin": [{ "perspective-origin": C() }],
        rotate: [{ rotate: pe() }],
        "rotate-x": [{ "rotate-x": pe() }],
        "rotate-y": [{ "rotate-y": pe() }],
        "rotate-z": [{ "rotate-z": pe() }],
        scale: [{ scale: be() }],
        "scale-x": [{ "scale-x": be() }],
        "scale-y": [{ "scale-y": be() }],
        "scale-z": [{ "scale-z": be() }],
        "scale-3d": ["scale-3d"],
        skew: [{ skew: ct() }],
        "skew-x": [{ "skew-x": ct() }],
        "skew-y": [{ "skew-y": ct() }],
        transform: [{ transform: [P, H, "", "none", "gpu", "cpu"] }],
        "transform-origin": [{ origin: C() }],
        "transform-style": [{ transform: ["3d", "flat"] }],
        translate: [{ translate: qe() }],
        "translate-x": [{ "translate-x": qe() }],
        "translate-y": [{ "translate-y": qe() }],
        "translate-z": [{ "translate-z": qe() }],
        "translate-none": ["translate-none"],
        accent: [{ accent: T() }],
        appearance: [{ appearance: ["none", "auto"] }],
        "caret-color": [{ caret: T() }],
        "color-scheme": [
          {
            scheme: [
              "normal",
              "dark",
              "light",
              "light-dark",
              "only-dark",
              "only-light",
            ],
          },
        ],
        cursor: [
          {
            cursor: [
              "auto",
              "default",
              "pointer",
              "wait",
              "text",
              "move",
              "help",
              "not-allowed",
              "none",
              "context-menu",
              "progress",
              "cell",
              "crosshair",
              "vertical-text",
              "alias",
              "copy",
              "no-drop",
              "grab",
              "grabbing",
              "all-scroll",
              "col-resize",
              "row-resize",
              "n-resize",
              "e-resize",
              "s-resize",
              "w-resize",
              "ne-resize",
              "nw-resize",
              "se-resize",
              "sw-resize",
              "ew-resize",
              "ns-resize",
              "nesw-resize",
              "nwse-resize",
              "zoom-in",
              "zoom-out",
              P,
              H,
            ],
          },
        ],
        "field-sizing": [{ "field-sizing": ["fixed", "content"] }],
        "pointer-events": [{ "pointer-events": ["auto", "none"] }],
        resize: [{ resize: ["none", "", "y", "x"] }],
        "scroll-behavior": [{ scroll: ["auto", "smooth"] }],
        "scroll-m": [{ "scroll-m": A() }],
        "scroll-mx": [{ "scroll-mx": A() }],
        "scroll-my": [{ "scroll-my": A() }],
        "scroll-ms": [{ "scroll-ms": A() }],
        "scroll-me": [{ "scroll-me": A() }],
        "scroll-mt": [{ "scroll-mt": A() }],
        "scroll-mr": [{ "scroll-mr": A() }],
        "scroll-mb": [{ "scroll-mb": A() }],
        "scroll-ml": [{ "scroll-ml": A() }],
        "scroll-p": [{ "scroll-p": A() }],
        "scroll-px": [{ "scroll-px": A() }],
        "scroll-py": [{ "scroll-py": A() }],
        "scroll-ps": [{ "scroll-ps": A() }],
        "scroll-pe": [{ "scroll-pe": A() }],
        "scroll-pt": [{ "scroll-pt": A() }],
        "scroll-pr": [{ "scroll-pr": A() }],
        "scroll-pb": [{ "scroll-pb": A() }],
        "scroll-pl": [{ "scroll-pl": A() }],
        "snap-align": [{ snap: ["start", "end", "center", "align-none"] }],
        "snap-stop": [{ snap: ["normal", "always"] }],
        "snap-type": [{ snap: ["none", "x", "y", "both"] }],
        "snap-strictness": [{ snap: ["mandatory", "proximity"] }],
        touch: [{ touch: ["auto", "none", "manipulation"] }],
        "touch-x": [{ "touch-pan": ["x", "left", "right"] }],
        "touch-y": [{ "touch-pan": ["y", "up", "down"] }],
        "touch-pz": ["touch-pinch-zoom"],
        select: [{ select: ["none", "text", "all", "auto"] }],
        "will-change": [
          { "will-change": ["auto", "scroll", "contents", "transform", P, H] },
        ],
        fill: [{ fill: ["none", ...T()] }],
        "stroke-w": [{ stroke: [te, pr, Ta, Qc] }],
        stroke: [{ stroke: ["none", ...T()] }],
        "forced-color-adjust": [{ "forced-color-adjust": ["auto", "none"] }],
      },
      conflictingClassGroups: {
        overflow: ["overflow-x", "overflow-y"],
        overscroll: ["overscroll-x", "overscroll-y"],
        inset: [
          "inset-x",
          "inset-y",
          "start",
          "end",
          "top",
          "right",
          "bottom",
          "left",
        ],
        "inset-x": ["right", "left"],
        "inset-y": ["top", "bottom"],
        flex: ["basis", "grow", "shrink"],
        gap: ["gap-x", "gap-y"],
        p: ["px", "py", "ps", "pe", "pt", "pr", "pb", "pl"],
        px: ["pr", "pl"],
        py: ["pt", "pb"],
        m: ["mx", "my", "ms", "me", "mt", "mr", "mb", "ml"],
        mx: ["mr", "ml"],
        my: ["mt", "mb"],
        size: ["w", "h"],
        "font-size": ["leading"],
        "fvn-normal": [
          "fvn-ordinal",
          "fvn-slashed-zero",
          "fvn-figure",
          "fvn-spacing",
          "fvn-fraction",
        ],
        "fvn-ordinal": ["fvn-normal"],
        "fvn-slashed-zero": ["fvn-normal"],
        "fvn-figure": ["fvn-normal"],
        "fvn-spacing": ["fvn-normal"],
        "fvn-fraction": ["fvn-normal"],
        "line-clamp": ["display", "overflow"],
        rounded: [
          "rounded-s",
          "rounded-e",
          "rounded-t",
          "rounded-r",
          "rounded-b",
          "rounded-l",
          "rounded-ss",
          "rounded-se",
          "rounded-ee",
          "rounded-es",
          "rounded-tl",
          "rounded-tr",
          "rounded-br",
          "rounded-bl",
        ],
        "rounded-s": ["rounded-ss", "rounded-es"],
        "rounded-e": ["rounded-se", "rounded-ee"],
        "rounded-t": ["rounded-tl", "rounded-tr"],
        "rounded-r": ["rounded-tr", "rounded-br"],
        "rounded-b": ["rounded-br", "rounded-bl"],
        "rounded-l": ["rounded-tl", "rounded-bl"],
        "border-spacing": ["border-spacing-x", "border-spacing-y"],
        "border-w": [
          "border-w-x",
          "border-w-y",
          "border-w-s",
          "border-w-e",
          "border-w-t",
          "border-w-r",
          "border-w-b",
          "border-w-l",
        ],
        "border-w-x": ["border-w-r", "border-w-l"],
        "border-w-y": ["border-w-t", "border-w-b"],
        "border-color": [
          "border-color-x",
          "border-color-y",
          "border-color-s",
          "border-color-e",
          "border-color-t",
          "border-color-r",
          "border-color-b",
          "border-color-l",
        ],
        "border-color-x": ["border-color-r", "border-color-l"],
        "border-color-y": ["border-color-t", "border-color-b"],
        translate: ["translate-x", "translate-y", "translate-none"],
        "translate-none": [
          "translate",
          "translate-x",
          "translate-y",
          "translate-z",
        ],
        "scroll-m": [
          "scroll-mx",
          "scroll-my",
          "scroll-ms",
          "scroll-me",
          "scroll-mt",
          "scroll-mr",
          "scroll-mb",
          "scroll-ml",
        ],
        "scroll-mx": ["scroll-mr", "scroll-ml"],
        "scroll-my": ["scroll-mt", "scroll-mb"],
        "scroll-p": [
          "scroll-px",
          "scroll-py",
          "scroll-ps",
          "scroll-pe",
          "scroll-pt",
          "scroll-pr",
          "scroll-pb",
          "scroll-pl",
        ],
        "scroll-px": ["scroll-pr", "scroll-pl"],
        "scroll-py": ["scroll-pt", "scroll-pb"],
        touch: ["touch-x", "touch-y", "touch-pz"],
        "touch-x": ["touch"],
        "touch-y": ["touch"],
        "touch-pz": ["touch"],
      },
      conflictingClassGroupModifiers: { "font-size": ["leading"] },
      orderSensitiveModifiers: [
        "*",
        "**",
        "after",
        "backdrop",
        "before",
        "details-content",
        "file",
        "first-letter",
        "first-line",
        "marker",
        "placeholder",
        "selection",
      ],
    };
  },
  eC = _E(WE);
function oe(...e) {
  return eC(Wy(e));
}
const tC = Td(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm transition-all cursor-pointer disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border text-foreground bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);
function nC({ className: e, variant: t, size: n, asChild: a = !1, ...o }) {
  const r = a ? or : "button";
  return x.jsx(r, {
    "data-slot": "button",
    className: oe(tC({ variant: t, size: n, className: e })),
    ...o,
  });
}
function Ik({ className: e, type: t, ...n }) {
  return x.jsx("input", {
    type: t,
    "data-slot": "input",
    className: oe(
      "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
      "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
      e,
    ),
    ...n,
  });
}
var aC = [
    "a",
    "button",
    "div",
    "form",
    "h2",
    "h3",
    "img",
    "input",
    "label",
    "li",
    "nav",
    "ol",
    "p",
    "select",
    "span",
    "svg",
    "ul",
  ],
  oC = aC.reduce((e, t) => {
    const n = Zy(`Primitive.${t}`),
      a = p.forwardRef((o, r) => {
        const { asChild: i, ...l } = o,
          s = i ? n : t;
        return (
          typeof window < "u" && (window[Symbol.for("radix-ui")] = !0),
          x.jsx(s, { ...l, ref: r })
        );
      });
    return ((a.displayName = `Primitive.${t}`), { ...e, [t]: a });
  }, {}),
  rC = "Label",
  db = p.forwardRef((e, t) =>
    x.jsx(oC.label, {
      ...e,
      ref: t,
      onMouseDown: (n) => {
        var o;
        n.target.closest("button, input, select, textarea") ||
          ((o = e.onMouseDown) == null || o.call(e, n),
          !n.defaultPrevented && n.detail > 1 && n.preventDefault());
      },
    }),
  );
db.displayName = rC;
var iC = db;
function Gk({ className: e, ...t }) {
  return x.jsx(iC, {
    "data-slot": "label",
    className: oe(
      "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
      e,
    ),
    ...t,
  });
}
const lC = Td(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);
function Yk({ className: e, variant: t, asChild: n = !1, ...a }) {
  const o = n ? or : "span";
  return x.jsx(o, {
    "data-slot": "badge",
    className: oe(lC({ variant: t }), e),
    ...a,
  });
}
function sC(e, [t, n]) {
  return Math.min(n, Math.max(t, e));
}
function F(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
  return function (o) {
    if ((e == null || e(o), n === !1 || !o.defaultPrevented))
      return t == null ? void 0 : t(o);
  };
}
function cC(e, t) {
  const n = p.createContext(t),
    a = (r) => {
      const { children: i, ...l } = r,
        s = p.useMemo(() => l, Object.values(l));
      return x.jsx(n.Provider, { value: s, children: i });
    };
  a.displayName = e + "Provider";
  function o(r) {
    const i = p.useContext(n);
    if (i) return i;
    if (t !== void 0) return t;
    throw new Error(`\`${r}\` must be used within \`${e}\``);
  }
  return [a, o];
}
function wa(e, t = []) {
  let n = [];
  function a(r, i) {
    const l = p.createContext(i),
      s = n.length;
    n = [...n, i];
    const c = (u) => {
      var m;
      const { scope: d, children: g, ...S } = u,
        v = ((m = d == null ? void 0 : d[e]) == null ? void 0 : m[s]) || l,
        b = p.useMemo(() => S, Object.values(S));
      return x.jsx(v.Provider, { value: b, children: g });
    };
    c.displayName = r + "Provider";
    function f(u, d) {
      var v;
      const g = ((v = d == null ? void 0 : d[e]) == null ? void 0 : v[s]) || l,
        S = p.useContext(g);
      if (S) return S;
      if (i !== void 0) return i;
      throw new Error(`\`${u}\` must be used within \`${r}\``);
    }
    return [c, f];
  }
  const o = () => {
    const r = n.map((i) => p.createContext(i));
    return function (l) {
      const s = (l == null ? void 0 : l[e]) || r;
      return p.useMemo(() => ({ [`__scope${e}`]: { ...l, [e]: s } }), [l, s]);
    };
  };
  return ((o.scopeName = e), [a, uC(o, ...t)]);
}
function uC(...e) {
  const t = e[0];
  if (e.length === 1) return t;
  const n = () => {
    const a = e.map((o) => ({ useScope: o(), scopeName: o.scopeName }));
    return function (r) {
      const i = a.reduce((l, { useScope: s, scopeName: c }) => {
        const u = s(r)[`__scope${c}`];
        return { ...l, ...u };
      }, {});
      return p.useMemo(() => ({ [`__scope${t.scopeName}`]: i }), [i]);
    };
  };
  return ((n.scopeName = t.scopeName), n);
}
function ii(e) {
  const t = fC(e),
    n = p.forwardRef((a, o) => {
      const { children: r, ...i } = a,
        l = p.Children.toArray(r),
        s = l.find(mC);
      if (s) {
        const c = s.props.children,
          f = l.map((u) =>
            u === s
              ? p.Children.count(c) > 1
                ? p.Children.only(null)
                : p.isValidElement(c)
                  ? c.props.children
                  : null
              : u,
          );
        return x.jsx(t, {
          ...i,
          ref: o,
          children: p.isValidElement(c) ? p.cloneElement(c, void 0, f) : null,
        });
      }
      return x.jsx(t, { ...i, ref: o, children: r });
    });
  return ((n.displayName = `${e}.Slot`), n);
}
function fC(e) {
  const t = p.forwardRef((n, a) => {
    const { children: o, ...r } = n;
    if (p.isValidElement(o)) {
      const i = hC(o),
        l = gC(r, o.props);
      return (
        o.type !== p.Fragment && (l.ref = a ? Ti(a, i) : i),
        p.cloneElement(o, l)
      );
    }
    return p.Children.count(o) > 1 ? p.Children.only(null) : null;
  });
  return ((t.displayName = `${e}.SlotClone`), t);
}
var mb = Symbol("radix.slottable");
function dC(e) {
  const t = ({ children: n }) => x.jsx(x.Fragment, { children: n });
  return ((t.displayName = `${e}.Slottable`), (t.__radixId = mb), t);
}
function mC(e) {
  return (
    p.isValidElement(e) &&
    typeof e.type == "function" &&
    "__radixId" in e.type &&
    e.type.__radixId === mb
  );
}
function gC(e, t) {
  const n = { ...t };
  for (const a in t) {
    const o = e[a],
      r = t[a];
    /^on[A-Z]/.test(a)
      ? o && r
        ? (n[a] = (...l) => {
            const s = r(...l);
            return (o(...l), s);
          })
        : o && (n[a] = o)
      : a === "style"
        ? (n[a] = { ...o, ...r })
        : a === "className" && (n[a] = [o, r].filter(Boolean).join(" "));
  }
  return { ...e, ...n };
}
function hC(e) {
  var a, o;
  let t =
      (a = Object.getOwnPropertyDescriptor(e.props, "ref")) == null
        ? void 0
        : a.get,
    n = t && "isReactWarning" in t && t.isReactWarning;
  return n
    ? e.ref
    : ((t =
        (o = Object.getOwnPropertyDescriptor(e, "ref")) == null
          ? void 0
          : o.get),
      (n = t && "isReactWarning" in t && t.isReactWarning),
      n ? e.props.ref : e.props.ref || e.ref);
}
function gb(e) {
  const t = e + "CollectionProvider",
    [n, a] = wa(t),
    [o, r] = n(t, { collectionRef: { current: null }, itemMap: new Map() }),
    i = (v) => {
      const { scope: b, children: m } = v,
        h = L.useRef(null),
        y = L.useRef(new Map()).current;
      return x.jsx(o, { scope: b, itemMap: y, collectionRef: h, children: m });
    };
  i.displayName = t;
  const l = e + "CollectionSlot",
    s = ii(l),
    c = L.forwardRef((v, b) => {
      const { scope: m, children: h } = v,
        y = r(l, m),
        w = Ae(b, y.collectionRef);
      return x.jsx(s, { ref: w, children: h });
    });
  c.displayName = l;
  const f = e + "CollectionItemSlot",
    u = "data-radix-collection-item",
    d = ii(f),
    g = L.forwardRef((v, b) => {
      const { scope: m, children: h, ...y } = v,
        w = L.useRef(null),
        C = Ae(b, w),
        R = r(f, m);
      return (
        L.useEffect(
          () => (
            R.itemMap.set(w, { ref: w, ...y }),
            () => void R.itemMap.delete(w)
          ),
        ),
        x.jsx(d, { [u]: "", ref: C, children: h })
      );
    });
  g.displayName = f;
  function S(v) {
    const b = r(e + "CollectionConsumer", v);
    return L.useCallback(() => {
      const h = b.collectionRef.current;
      if (!h) return [];
      const y = Array.from(h.querySelectorAll(`[${u}]`));
      return Array.from(b.itemMap.values()).sort(
        (R, E) => y.indexOf(R.ref.current) - y.indexOf(E.ref.current),
      );
    }, [b.collectionRef, b.itemMap]);
  }
  return [{ Provider: i, Slot: c, ItemSlot: g }, S, a];
}
var pC = p.createContext(void 0);
function Md(e) {
  const t = p.useContext(pC);
  return e || t || "ltr";
}
var vC = [
    "a",
    "button",
    "div",
    "form",
    "h2",
    "h3",
    "img",
    "input",
    "label",
    "li",
    "nav",
    "ol",
    "p",
    "select",
    "span",
    "svg",
    "ul",
  ],
  ye = vC.reduce((e, t) => {
    const n = ii(`Primitive.${t}`),
      a = p.forwardRef((o, r) => {
        const { asChild: i, ...l } = o,
          s = i ? n : t;
        return (
          typeof window < "u" && (window[Symbol.for("radix-ui")] = !0),
          x.jsx(s, { ...l, ref: r })
        );
      });
    return ((a.displayName = `Primitive.${t}`), { ...e, [t]: a });
  }, {});
function hb(e, t) {
  e && Ms.flushSync(() => e.dispatchEvent(t));
}
function ot(e) {
  const t = p.useRef(e);
  return (
    p.useEffect(() => {
      t.current = e;
    }),
    p.useMemo(
      () =>
        (...n) => {
          var a;
          return (a = t.current) == null ? void 0 : a.call(t, ...n);
        },
      [],
    )
  );
}
function yC(e, t = globalThis == null ? void 0 : globalThis.document) {
  const n = ot(e);
  p.useEffect(() => {
    const a = (o) => {
      o.key === "Escape" && n(o);
    };
    return (
      t.addEventListener("keydown", a, { capture: !0 }),
      () => t.removeEventListener("keydown", a, { capture: !0 })
    );
  }, [n, t]);
}
var bC = "DismissableLayer",
  cf = "dismissableLayer.update",
  SC = "dismissableLayer.pointerDownOutside",
  wC = "dismissableLayer.focusOutside",
  Yg,
  pb = p.createContext({
    layers: new Set(),
    layersWithOutsidePointerEventsDisabled: new Set(),
    branches: new Set(),
  }),
  Fs = p.forwardRef((e, t) => {
    const {
        disableOutsidePointerEvents: n = !1,
        onEscapeKeyDown: a,
        onPointerDownOutside: o,
        onFocusOutside: r,
        onInteractOutside: i,
        onDismiss: l,
        ...s
      } = e,
      c = p.useContext(pb),
      [f, u] = p.useState(null),
      d =
        (f == null ? void 0 : f.ownerDocument) ??
        (globalThis == null ? void 0 : globalThis.document),
      [, g] = p.useState({}),
      S = Ae(t, (E) => u(E)),
      v = Array.from(c.layers),
      [b] = [...c.layersWithOutsidePointerEventsDisabled].slice(-1),
      m = v.indexOf(b),
      h = f ? v.indexOf(f) : -1,
      y = c.layersWithOutsidePointerEventsDisabled.size > 0,
      w = h >= m,
      C = CC((E) => {
        const A = E.target,
          O = [...c.branches].some((N) => N.contains(A));
        !w ||
          O ||
          (o == null || o(E),
          i == null || i(E),
          E.defaultPrevented || l == null || l());
      }, d),
      R = AC((E) => {
        const A = E.target;
        [...c.branches].some((N) => N.contains(A)) ||
          (r == null || r(E),
          i == null || i(E),
          E.defaultPrevented || l == null || l());
      }, d);
    return (
      yC((E) => {
        h === c.layers.size - 1 &&
          (a == null || a(E),
          !E.defaultPrevented && l && (E.preventDefault(), l()));
      }, d),
      p.useEffect(() => {
        if (f)
          return (
            n &&
              (c.layersWithOutsidePointerEventsDisabled.size === 0 &&
                ((Yg = d.body.style.pointerEvents),
                (d.body.style.pointerEvents = "none")),
              c.layersWithOutsidePointerEventsDisabled.add(f)),
            c.layers.add(f),
            Fg(),
            () => {
              n &&
                c.layersWithOutsidePointerEventsDisabled.size === 1 &&
                (d.body.style.pointerEvents = Yg);
            }
          );
      }, [f, d, n, c]),
      p.useEffect(
        () => () => {
          f &&
            (c.layers.delete(f),
            c.layersWithOutsidePointerEventsDisabled.delete(f),
            Fg());
        },
        [f, c],
      ),
      p.useEffect(() => {
        const E = () => g({});
        return (
          document.addEventListener(cf, E),
          () => document.removeEventListener(cf, E)
        );
      }, []),
      x.jsx(ye.div, {
        ...s,
        ref: S,
        style: {
          pointerEvents: y ? (w ? "auto" : "none") : void 0,
          ...e.style,
        },
        onFocusCapture: F(e.onFocusCapture, R.onFocusCapture),
        onBlurCapture: F(e.onBlurCapture, R.onBlurCapture),
        onPointerDownCapture: F(e.onPointerDownCapture, C.onPointerDownCapture),
      })
    );
  });
Fs.displayName = bC;
var xC = "DismissableLayerBranch",
  EC = p.forwardRef((e, t) => {
    const n = p.useContext(pb),
      a = p.useRef(null),
      o = Ae(t, a);
    return (
      p.useEffect(() => {
        const r = a.current;
        if (r)
          return (
            n.branches.add(r),
            () => {
              n.branches.delete(r);
            }
          );
      }, [n.branches]),
      x.jsx(ye.div, { ...e, ref: o })
    );
  });
EC.displayName = xC;
function CC(e, t = globalThis == null ? void 0 : globalThis.document) {
  const n = ot(e),
    a = p.useRef(!1),
    o = p.useRef(() => {});
  return (
    p.useEffect(() => {
      const r = (l) => {
          if (l.target && !a.current) {
            let s = function () {
              vb(SC, n, c, { discrete: !0 });
            };
            const c = { originalEvent: l };
            l.pointerType === "touch"
              ? (t.removeEventListener("click", o.current),
                (o.current = s),
                t.addEventListener("click", o.current, { once: !0 }))
              : s();
          } else t.removeEventListener("click", o.current);
          a.current = !1;
        },
        i = window.setTimeout(() => {
          t.addEventListener("pointerdown", r);
        }, 0);
      return () => {
        (window.clearTimeout(i),
          t.removeEventListener("pointerdown", r),
          t.removeEventListener("click", o.current));
      };
    }, [t, n]),
    { onPointerDownCapture: () => (a.current = !0) }
  );
}
function AC(e, t = globalThis == null ? void 0 : globalThis.document) {
  const n = ot(e),
    a = p.useRef(!1);
  return (
    p.useEffect(() => {
      const o = (r) => {
        r.target &&
          !a.current &&
          vb(wC, n, { originalEvent: r }, { discrete: !1 });
      };
      return (
        t.addEventListener("focusin", o),
        () => t.removeEventListener("focusin", o)
      );
    }, [t, n]),
    {
      onFocusCapture: () => (a.current = !0),
      onBlurCapture: () => (a.current = !1),
    }
  );
}
function Fg() {
  const e = new CustomEvent(cf);
  document.dispatchEvent(e);
}
function vb(e, t, n, { discrete: a }) {
  const o = n.originalEvent.target,
    r = new CustomEvent(e, { bubbles: !1, cancelable: !0, detail: n });
  (t && o.addEventListener(e, t, { once: !0 }),
    a ? hb(o, r) : o.dispatchEvent(r));
}
var Zc = 0;
function yb() {
  p.useEffect(() => {
    const e = document.querySelectorAll("[data-radix-focus-guard]");
    return (
      document.body.insertAdjacentElement("afterbegin", e[0] ?? Kg()),
      document.body.insertAdjacentElement("beforeend", e[1] ?? Kg()),
      Zc++,
      () => {
        (Zc === 1 &&
          document
            .querySelectorAll("[data-radix-focus-guard]")
            .forEach((t) => t.remove()),
          Zc--);
      }
    );
  }, []);
}
function Kg() {
  const e = document.createElement("span");
  return (
    e.setAttribute("data-radix-focus-guard", ""),
    (e.tabIndex = 0),
    (e.style.outline = "none"),
    (e.style.opacity = "0"),
    (e.style.position = "fixed"),
    (e.style.pointerEvents = "none"),
    e
  );
}
var Jc = "focusScope.autoFocusOnMount",
  Wc = "focusScope.autoFocusOnUnmount",
  qg = { bubbles: !1, cancelable: !0 },
  TC = "FocusScope",
  Dd = p.forwardRef((e, t) => {
    const {
        loop: n = !1,
        trapped: a = !1,
        onMountAutoFocus: o,
        onUnmountAutoFocus: r,
        ...i
      } = e,
      [l, s] = p.useState(null),
      c = ot(o),
      f = ot(r),
      u = p.useRef(null),
      d = Ae(t, (v) => s(v)),
      g = p.useRef({
        paused: !1,
        pause() {
          this.paused = !0;
        },
        resume() {
          this.paused = !1;
        },
      }).current;
    (p.useEffect(() => {
      if (a) {
        let v = function (y) {
            if (g.paused || !l) return;
            const w = y.target;
            l.contains(w) ? (u.current = w) : Fn(u.current, { select: !0 });
          },
          b = function (y) {
            if (g.paused || !l) return;
            const w = y.relatedTarget;
            w !== null && (l.contains(w) || Fn(u.current, { select: !0 }));
          },
          m = function (y) {
            if (document.activeElement === document.body)
              for (const C of y) C.removedNodes.length > 0 && Fn(l);
          };
        (document.addEventListener("focusin", v),
          document.addEventListener("focusout", b));
        const h = new MutationObserver(m);
        return (
          l && h.observe(l, { childList: !0, subtree: !0 }),
          () => {
            (document.removeEventListener("focusin", v),
              document.removeEventListener("focusout", b),
              h.disconnect());
          }
        );
      }
    }, [a, l, g.paused]),
      p.useEffect(() => {
        if (l) {
          $g.add(g);
          const v = document.activeElement;
          if (!l.contains(v)) {
            const m = new CustomEvent(Jc, qg);
            (l.addEventListener(Jc, c),
              l.dispatchEvent(m),
              m.defaultPrevented ||
                (RC(NC(bb(l)), { select: !0 }),
                document.activeElement === v && Fn(l)));
          }
          return () => {
            (l.removeEventListener(Jc, c),
              setTimeout(() => {
                const m = new CustomEvent(Wc, qg);
                (l.addEventListener(Wc, f),
                  l.dispatchEvent(m),
                  m.defaultPrevented || Fn(v ?? document.body, { select: !0 }),
                  l.removeEventListener(Wc, f),
                  $g.remove(g));
              }, 0));
          };
        }
      }, [l, c, f, g]));
    const S = p.useCallback(
      (v) => {
        if ((!n && !a) || g.paused) return;
        const b = v.key === "Tab" && !v.altKey && !v.ctrlKey && !v.metaKey,
          m = document.activeElement;
        if (b && m) {
          const h = v.currentTarget,
            [y, w] = MC(h);
          y && w
            ? !v.shiftKey && m === w
              ? (v.preventDefault(), n && Fn(y, { select: !0 }))
              : v.shiftKey &&
                m === y &&
                (v.preventDefault(), n && Fn(w, { select: !0 }))
            : m === h && v.preventDefault();
        }
      },
      [n, a, g.paused],
    );
    return x.jsx(ye.div, { tabIndex: -1, ...i, ref: d, onKeyDown: S });
  });
Dd.displayName = TC;
function RC(e, { select: t = !1 } = {}) {
  const n = document.activeElement;
  for (const a of e)
    if ((Fn(a, { select: t }), document.activeElement !== n)) return;
}
function MC(e) {
  const t = bb(e),
    n = Xg(t, e),
    a = Xg(t.reverse(), e);
  return [n, a];
}
function bb(e) {
  const t = [],
    n = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, {
      acceptNode: (a) => {
        const o = a.tagName === "INPUT" && a.type === "hidden";
        return a.disabled || a.hidden || o
          ? NodeFilter.FILTER_SKIP
          : a.tabIndex >= 0
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_SKIP;
      },
    });
  for (; n.nextNode(); ) t.push(n.currentNode);
  return t;
}
function Xg(e, t) {
  for (const n of e) if (!DC(n, { upTo: t })) return n;
}
function DC(e, { upTo: t }) {
  if (getComputedStyle(e).visibility === "hidden") return !0;
  for (; e; ) {
    if (t !== void 0 && e === t) return !1;
    if (getComputedStyle(e).display === "none") return !0;
    e = e.parentElement;
  }
  return !1;
}
function OC(e) {
  return e instanceof HTMLInputElement && "select" in e;
}
function Fn(e, { select: t = !1 } = {}) {
  if (e && e.focus) {
    const n = document.activeElement;
    (e.focus({ preventScroll: !0 }), e !== n && OC(e) && t && e.select());
  }
}
var $g = kC();
function kC() {
  let e = [];
  return {
    add(t) {
      const n = e[0];
      (t !== n && (n == null || n.pause()), (e = Qg(e, t)), e.unshift(t));
    },
    remove(t) {
      var n;
      ((e = Qg(e, t)), (n = e[0]) == null || n.resume());
    },
  };
}
function Qg(e, t) {
  const n = [...e],
    a = n.indexOf(t);
  return (a !== -1 && n.splice(a, 1), n);
}
function NC(e) {
  return e.filter((t) => t.tagName !== "A");
}
var Bn =
    globalThis != null && globalThis.document ? p.useLayoutEffect : () => {},
  _C = Df[" useId ".trim().toString()] || (() => {}),
  LC = 0;
function Ba(e) {
  const [t, n] = p.useState(_C());
  return (
    Bn(() => {
      n((a) => a ?? String(LC++));
    }, [e]),
    e || (t ? `radix-${t}` : "")
  );
}
const zC = ["top", "right", "bottom", "left"],
  va = Math.min,
  Ct = Math.max,
  fs = Math.round,
  tl = Math.floor,
  fn = (e) => ({ x: e, y: e }),
  jC = { left: "right", right: "left", bottom: "top", top: "bottom" },
  BC = { start: "end", end: "start" };
function uf(e, t, n) {
  return Ct(e, va(t, n));
}
function Un(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function Hn(e) {
  return e.split("-")[0];
}
function lr(e) {
  return e.split("-")[1];
}
function Od(e) {
  return e === "x" ? "y" : "x";
}
function kd(e) {
  return e === "y" ? "height" : "width";
}
const UC = new Set(["top", "bottom"]);
function sn(e) {
  return UC.has(Hn(e)) ? "y" : "x";
}
function Nd(e) {
  return Od(sn(e));
}
function HC(e, t, n) {
  n === void 0 && (n = !1);
  const a = lr(e),
    o = Nd(e),
    r = kd(o);
  let i =
    o === "x"
      ? a === (n ? "end" : "start")
        ? "right"
        : "left"
      : a === "start"
        ? "bottom"
        : "top";
  return (t.reference[r] > t.floating[r] && (i = ds(i)), [i, ds(i)]);
}
function PC(e) {
  const t = ds(e);
  return [ff(e), t, ff(t)];
}
function ff(e) {
  return e.replace(/start|end/g, (t) => BC[t]);
}
const Zg = ["left", "right"],
  Jg = ["right", "left"],
  VC = ["top", "bottom"],
  IC = ["bottom", "top"];
function GC(e, t, n) {
  switch (e) {
    case "top":
    case "bottom":
      return n ? (t ? Jg : Zg) : t ? Zg : Jg;
    case "left":
    case "right":
      return t ? VC : IC;
    default:
      return [];
  }
}
function YC(e, t, n, a) {
  const o = lr(e);
  let r = GC(Hn(e), n === "start", a);
  return (
    o && ((r = r.map((i) => i + "-" + o)), t && (r = r.concat(r.map(ff)))),
    r
  );
}
function ds(e) {
  return e.replace(/left|right|bottom|top/g, (t) => jC[t]);
}
function FC(e) {
  return { top: 0, right: 0, bottom: 0, left: 0, ...e };
}
function Sb(e) {
  return typeof e != "number"
    ? FC(e)
    : { top: e, right: e, bottom: e, left: e };
}
function ms(e) {
  const { x: t, y: n, width: a, height: o } = e;
  return {
    width: a,
    height: o,
    top: n,
    left: t,
    right: t + a,
    bottom: n + o,
    x: t,
    y: n,
  };
}
function Wg(e, t, n) {
  let { reference: a, floating: o } = e;
  const r = sn(t),
    i = Nd(t),
    l = kd(i),
    s = Hn(t),
    c = r === "y",
    f = a.x + a.width / 2 - o.width / 2,
    u = a.y + a.height / 2 - o.height / 2,
    d = a[l] / 2 - o[l] / 2;
  let g;
  switch (s) {
    case "top":
      g = { x: f, y: a.y - o.height };
      break;
    case "bottom":
      g = { x: f, y: a.y + a.height };
      break;
    case "right":
      g = { x: a.x + a.width, y: u };
      break;
    case "left":
      g = { x: a.x - o.width, y: u };
      break;
    default:
      g = { x: a.x, y: a.y };
  }
  switch (lr(t)) {
    case "start":
      g[i] -= d * (n && c ? -1 : 1);
      break;
    case "end":
      g[i] += d * (n && c ? -1 : 1);
      break;
  }
  return g;
}
const KC = async (e, t, n) => {
  const {
      placement: a = "bottom",
      strategy: o = "absolute",
      middleware: r = [],
      platform: i,
    } = n,
    l = r.filter(Boolean),
    s = await (i.isRTL == null ? void 0 : i.isRTL(t));
  let c = await i.getElementRects({ reference: e, floating: t, strategy: o }),
    { x: f, y: u } = Wg(c, a, s),
    d = a,
    g = {},
    S = 0;
  for (let v = 0; v < l.length; v++) {
    const { name: b, fn: m } = l[v],
      {
        x: h,
        y,
        data: w,
        reset: C,
      } = await m({
        x: f,
        y: u,
        initialPlacement: a,
        placement: d,
        strategy: o,
        middlewareData: g,
        rects: c,
        platform: i,
        elements: { reference: e, floating: t },
      });
    ((f = h ?? f),
      (u = y ?? u),
      (g = { ...g, [b]: { ...g[b], ...w } }),
      C &&
        S <= 50 &&
        (S++,
        typeof C == "object" &&
          (C.placement && (d = C.placement),
          C.rects &&
            (c =
              C.rects === !0
                ? await i.getElementRects({
                    reference: e,
                    floating: t,
                    strategy: o,
                  })
                : C.rects),
          ({ x: f, y: u } = Wg(c, d, s))),
        (v = -1)));
  }
  return { x: f, y: u, placement: d, strategy: o, middlewareData: g };
};
async function li(e, t) {
  var n;
  t === void 0 && (t = {});
  const { x: a, y: o, platform: r, rects: i, elements: l, strategy: s } = e,
    {
      boundary: c = "clippingAncestors",
      rootBoundary: f = "viewport",
      elementContext: u = "floating",
      altBoundary: d = !1,
      padding: g = 0,
    } = Un(t, e),
    S = Sb(g),
    b = l[d ? (u === "floating" ? "reference" : "floating") : u],
    m = ms(
      await r.getClippingRect({
        element:
          (n = await (r.isElement == null ? void 0 : r.isElement(b))) == null ||
          n
            ? b
            : b.contextElement ||
              (await (r.getDocumentElement == null
                ? void 0
                : r.getDocumentElement(l.floating))),
        boundary: c,
        rootBoundary: f,
        strategy: s,
      }),
    ),
    h =
      u === "floating"
        ? { x: a, y: o, width: i.floating.width, height: i.floating.height }
        : i.reference,
    y = await (r.getOffsetParent == null
      ? void 0
      : r.getOffsetParent(l.floating)),
    w = (await (r.isElement == null ? void 0 : r.isElement(y)))
      ? (await (r.getScale == null ? void 0 : r.getScale(y))) || { x: 1, y: 1 }
      : { x: 1, y: 1 },
    C = ms(
      r.convertOffsetParentRelativeRectToViewportRelativeRect
        ? await r.convertOffsetParentRelativeRectToViewportRelativeRect({
            elements: l,
            rect: h,
            offsetParent: y,
            strategy: s,
          })
        : h,
    );
  return {
    top: (m.top - C.top + S.top) / w.y,
    bottom: (C.bottom - m.bottom + S.bottom) / w.y,
    left: (m.left - C.left + S.left) / w.x,
    right: (C.right - m.right + S.right) / w.x,
  };
}
const qC = (e) => ({
    name: "arrow",
    options: e,
    async fn(t) {
      const {
          x: n,
          y: a,
          placement: o,
          rects: r,
          platform: i,
          elements: l,
          middlewareData: s,
        } = t,
        { element: c, padding: f = 0 } = Un(e, t) || {};
      if (c == null) return {};
      const u = Sb(f),
        d = { x: n, y: a },
        g = Nd(o),
        S = kd(g),
        v = await i.getDimensions(c),
        b = g === "y",
        m = b ? "top" : "left",
        h = b ? "bottom" : "right",
        y = b ? "clientHeight" : "clientWidth",
        w = r.reference[S] + r.reference[g] - d[g] - r.floating[S],
        C = d[g] - r.reference[g],
        R = await (i.getOffsetParent == null ? void 0 : i.getOffsetParent(c));
      let E = R ? R[y] : 0;
      (!E || !(await (i.isElement == null ? void 0 : i.isElement(R)))) &&
        (E = l.floating[y] || r.floating[S]);
      const A = w / 2 - C / 2,
        O = E / 2 - v[S] / 2 - 1,
        N = va(u[m], O),
        B = va(u[h], O),
        z = N,
        G = E - v[S] - B,
        V = E / 2 - v[S] / 2 + A,
        Y = uf(z, V, G),
        M =
          !s.arrow &&
          lr(o) != null &&
          V !== Y &&
          r.reference[S] / 2 - (V < z ? N : B) - v[S] / 2 < 0,
        _ = M ? (V < z ? V - z : V - G) : 0;
      return {
        [g]: d[g] + _,
        data: {
          [g]: Y,
          centerOffset: V - Y - _,
          ...(M && { alignmentOffset: _ }),
        },
        reset: M,
      };
    },
  }),
  XC = function (e) {
    return (
      e === void 0 && (e = {}),
      {
        name: "flip",
        options: e,
        async fn(t) {
          var n, a;
          const {
              placement: o,
              middlewareData: r,
              rects: i,
              initialPlacement: l,
              platform: s,
              elements: c,
            } = t,
            {
              mainAxis: f = !0,
              crossAxis: u = !0,
              fallbackPlacements: d,
              fallbackStrategy: g = "bestFit",
              fallbackAxisSideDirection: S = "none",
              flipAlignment: v = !0,
              ...b
            } = Un(e, t);
          if ((n = r.arrow) != null && n.alignmentOffset) return {};
          const m = Hn(o),
            h = sn(l),
            y = Hn(l) === l,
            w = await (s.isRTL == null ? void 0 : s.isRTL(c.floating)),
            C = d || (y || !v ? [ds(l)] : PC(l)),
            R = S !== "none";
          !d && R && C.push(...YC(l, v, S, w));
          const E = [l, ...C],
            A = await li(t, b),
            O = [];
          let N = ((a = r.flip) == null ? void 0 : a.overflows) || [];
          if ((f && O.push(A[m]), u)) {
            const V = HC(o, i, w);
            O.push(A[V[0]], A[V[1]]);
          }
          if (
            ((N = [...N, { placement: o, overflows: O }]),
            !O.every((V) => V <= 0))
          ) {
            var B, z;
            const V = (((B = r.flip) == null ? void 0 : B.index) || 0) + 1,
              Y = E[V];
            if (
              Y &&
              (!(u === "alignment" ? h !== sn(Y) : !1) ||
                N.every((T) =>
                  sn(T.placement) === h ? T.overflows[0] > 0 : !0,
                ))
            )
              return {
                data: { index: V, overflows: N },
                reset: { placement: Y },
              };
            let M =
              (z = N.filter((_) => _.overflows[0] <= 0).sort(
                (_, T) => _.overflows[1] - T.overflows[1],
              )[0]) == null
                ? void 0
                : z.placement;
            if (!M)
              switch (g) {
                case "bestFit": {
                  var G;
                  const _ =
                    (G = N.filter((T) => {
                      if (R) {
                        const D = sn(T.placement);
                        return D === h || D === "y";
                      }
                      return !0;
                    })
                      .map((T) => [
                        T.placement,
                        T.overflows
                          .filter((D) => D > 0)
                          .reduce((D, j) => D + j, 0),
                      ])
                      .sort((T, D) => T[1] - D[1])[0]) == null
                      ? void 0
                      : G[0];
                  _ && (M = _);
                  break;
                }
                case "initialPlacement":
                  M = l;
                  break;
              }
            if (o !== M) return { reset: { placement: M } };
          }
          return {};
        },
      }
    );
  };
function eh(e, t) {
  return {
    top: e.top - t.height,
    right: e.right - t.width,
    bottom: e.bottom - t.height,
    left: e.left - t.width,
  };
}
function th(e) {
  return zC.some((t) => e[t] >= 0);
}
const $C = function (e) {
    return (
      e === void 0 && (e = {}),
      {
        name: "hide",
        options: e,
        async fn(t) {
          const { rects: n } = t,
            { strategy: a = "referenceHidden", ...o } = Un(e, t);
          switch (a) {
            case "referenceHidden": {
              const r = await li(t, { ...o, elementContext: "reference" }),
                i = eh(r, n.reference);
              return {
                data: { referenceHiddenOffsets: i, referenceHidden: th(i) },
              };
            }
            case "escaped": {
              const r = await li(t, { ...o, altBoundary: !0 }),
                i = eh(r, n.floating);
              return { data: { escapedOffsets: i, escaped: th(i) } };
            }
            default:
              return {};
          }
        },
      }
    );
  },
  wb = new Set(["left", "top"]);
async function QC(e, t) {
  const { placement: n, platform: a, elements: o } = e,
    r = await (a.isRTL == null ? void 0 : a.isRTL(o.floating)),
    i = Hn(n),
    l = lr(n),
    s = sn(n) === "y",
    c = wb.has(i) ? -1 : 1,
    f = r && s ? -1 : 1,
    u = Un(t, e);
  let {
    mainAxis: d,
    crossAxis: g,
    alignmentAxis: S,
  } = typeof u == "number"
    ? { mainAxis: u, crossAxis: 0, alignmentAxis: null }
    : {
        mainAxis: u.mainAxis || 0,
        crossAxis: u.crossAxis || 0,
        alignmentAxis: u.alignmentAxis,
      };
  return (
    l && typeof S == "number" && (g = l === "end" ? S * -1 : S),
    s ? { x: g * f, y: d * c } : { x: d * c, y: g * f }
  );
}
const ZC = function (e) {
    return (
      e === void 0 && (e = 0),
      {
        name: "offset",
        options: e,
        async fn(t) {
          var n, a;
          const { x: o, y: r, placement: i, middlewareData: l } = t,
            s = await QC(t, e);
          return i === ((n = l.offset) == null ? void 0 : n.placement) &&
            (a = l.arrow) != null &&
            a.alignmentOffset
            ? {}
            : { x: o + s.x, y: r + s.y, data: { ...s, placement: i } };
        },
      }
    );
  },
  JC = function (e) {
    return (
      e === void 0 && (e = {}),
      {
        name: "shift",
        options: e,
        async fn(t) {
          const { x: n, y: a, placement: o } = t,
            {
              mainAxis: r = !0,
              crossAxis: i = !1,
              limiter: l = {
                fn: (b) => {
                  let { x: m, y: h } = b;
                  return { x: m, y: h };
                },
              },
              ...s
            } = Un(e, t),
            c = { x: n, y: a },
            f = await li(t, s),
            u = sn(Hn(o)),
            d = Od(u);
          let g = c[d],
            S = c[u];
          if (r) {
            const b = d === "y" ? "top" : "left",
              m = d === "y" ? "bottom" : "right",
              h = g + f[b],
              y = g - f[m];
            g = uf(h, g, y);
          }
          if (i) {
            const b = u === "y" ? "top" : "left",
              m = u === "y" ? "bottom" : "right",
              h = S + f[b],
              y = S - f[m];
            S = uf(h, S, y);
          }
          const v = l.fn({ ...t, [d]: g, [u]: S });
          return {
            ...v,
            data: { x: v.x - n, y: v.y - a, enabled: { [d]: r, [u]: i } },
          };
        },
      }
    );
  },
  WC = function (e) {
    return (
      e === void 0 && (e = {}),
      {
        options: e,
        fn(t) {
          const { x: n, y: a, placement: o, rects: r, middlewareData: i } = t,
            { offset: l = 0, mainAxis: s = !0, crossAxis: c = !0 } = Un(e, t),
            f = { x: n, y: a },
            u = sn(o),
            d = Od(u);
          let g = f[d],
            S = f[u];
          const v = Un(l, t),
            b =
              typeof v == "number"
                ? { mainAxis: v, crossAxis: 0 }
                : { mainAxis: 0, crossAxis: 0, ...v };
          if (s) {
            const y = d === "y" ? "height" : "width",
              w = r.reference[d] - r.floating[y] + b.mainAxis,
              C = r.reference[d] + r.reference[y] - b.mainAxis;
            g < w ? (g = w) : g > C && (g = C);
          }
          if (c) {
            var m, h;
            const y = d === "y" ? "width" : "height",
              w = wb.has(Hn(o)),
              C =
                r.reference[u] -
                r.floating[y] +
                ((w && ((m = i.offset) == null ? void 0 : m[u])) || 0) +
                (w ? 0 : b.crossAxis),
              R =
                r.reference[u] +
                r.reference[y] +
                (w ? 0 : ((h = i.offset) == null ? void 0 : h[u]) || 0) -
                (w ? b.crossAxis : 0);
            S < C ? (S = C) : S > R && (S = R);
          }
          return { [d]: g, [u]: S };
        },
      }
    );
  },
  eA = function (e) {
    return (
      e === void 0 && (e = {}),
      {
        name: "size",
        options: e,
        async fn(t) {
          var n, a;
          const { placement: o, rects: r, platform: i, elements: l } = t,
            { apply: s = () => {}, ...c } = Un(e, t),
            f = await li(t, c),
            u = Hn(o),
            d = lr(o),
            g = sn(o) === "y",
            { width: S, height: v } = r.floating;
          let b, m;
          u === "top" || u === "bottom"
            ? ((b = u),
              (m =
                d ===
                ((await (i.isRTL == null ? void 0 : i.isRTL(l.floating)))
                  ? "start"
                  : "end")
                  ? "left"
                  : "right"))
            : ((m = u), (b = d === "end" ? "top" : "bottom"));
          const h = v - f.top - f.bottom,
            y = S - f.left - f.right,
            w = va(v - f[b], h),
            C = va(S - f[m], y),
            R = !t.middlewareData.shift;
          let E = w,
            A = C;
          if (
            ((n = t.middlewareData.shift) != null && n.enabled.x && (A = y),
            (a = t.middlewareData.shift) != null && a.enabled.y && (E = h),
            R && !d)
          ) {
            const N = Ct(f.left, 0),
              B = Ct(f.right, 0),
              z = Ct(f.top, 0),
              G = Ct(f.bottom, 0);
            g
              ? (A = S - 2 * (N !== 0 || B !== 0 ? N + B : Ct(f.left, f.right)))
              : (E =
                  v - 2 * (z !== 0 || G !== 0 ? z + G : Ct(f.top, f.bottom)));
          }
          await s({ ...t, availableWidth: A, availableHeight: E });
          const O = await i.getDimensions(l.floating);
          return S !== O.width || v !== O.height
            ? { reset: { rects: !0 } }
            : {};
        },
      }
    );
  };
function Ks() {
  return typeof window < "u";
}
function sr(e) {
  return xb(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function kt(e) {
  var t;
  return (
    (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) ||
    window
  );
}
function hn(e) {
  var t;
  return (t = (xb(e) ? e.ownerDocument : e.document) || window.document) == null
    ? void 0
    : t.documentElement;
}
function xb(e) {
  return Ks() ? e instanceof Node || e instanceof kt(e).Node : !1;
}
function Jt(e) {
  return Ks() ? e instanceof Element || e instanceof kt(e).Element : !1;
}
function dn(e) {
  return Ks() ? e instanceof HTMLElement || e instanceof kt(e).HTMLElement : !1;
}
function nh(e) {
  return !Ks() || typeof ShadowRoot > "u"
    ? !1
    : e instanceof ShadowRoot || e instanceof kt(e).ShadowRoot;
}
const tA = new Set(["inline", "contents"]);
function Ri(e) {
  const { overflow: t, overflowX: n, overflowY: a, display: o } = Wt(e);
  return /auto|scroll|overlay|hidden|clip/.test(t + a + n) && !tA.has(o);
}
const nA = new Set(["table", "td", "th"]);
function aA(e) {
  return nA.has(sr(e));
}
const oA = [":popover-open", ":modal"];
function qs(e) {
  return oA.some((t) => {
    try {
      return e.matches(t);
    } catch {
      return !1;
    }
  });
}
const rA = ["transform", "translate", "scale", "rotate", "perspective"],
  iA = ["transform", "translate", "scale", "rotate", "perspective", "filter"],
  lA = ["paint", "layout", "strict", "content"];
function _d(e) {
  const t = Ld(),
    n = Jt(e) ? Wt(e) : e;
  return (
    rA.some((a) => (n[a] ? n[a] !== "none" : !1)) ||
    (n.containerType ? n.containerType !== "normal" : !1) ||
    (!t && (n.backdropFilter ? n.backdropFilter !== "none" : !1)) ||
    (!t && (n.filter ? n.filter !== "none" : !1)) ||
    iA.some((a) => (n.willChange || "").includes(a)) ||
    lA.some((a) => (n.contain || "").includes(a))
  );
}
function sA(e) {
  let t = ya(e);
  for (; dn(t) && !qo(t); ) {
    if (_d(t)) return t;
    if (qs(t)) return null;
    t = ya(t);
  }
  return null;
}
function Ld() {
  return typeof CSS > "u" || !CSS.supports
    ? !1
    : CSS.supports("-webkit-backdrop-filter", "none");
}
const cA = new Set(["html", "body", "#document"]);
function qo(e) {
  return cA.has(sr(e));
}
function Wt(e) {
  return kt(e).getComputedStyle(e);
}
function Xs(e) {
  return Jt(e)
    ? { scrollLeft: e.scrollLeft, scrollTop: e.scrollTop }
    : { scrollLeft: e.scrollX, scrollTop: e.scrollY };
}
function ya(e) {
  if (sr(e) === "html") return e;
  const t = e.assignedSlot || e.parentNode || (nh(e) && e.host) || hn(e);
  return nh(t) ? t.host : t;
}
function Eb(e) {
  const t = ya(e);
  return qo(t)
    ? e.ownerDocument
      ? e.ownerDocument.body
      : e.body
    : dn(t) && Ri(t)
      ? t
      : Eb(t);
}
function si(e, t, n) {
  var a;
  (t === void 0 && (t = []), n === void 0 && (n = !0));
  const o = Eb(e),
    r = o === ((a = e.ownerDocument) == null ? void 0 : a.body),
    i = kt(o);
  if (r) {
    const l = df(i);
    return t.concat(
      i,
      i.visualViewport || [],
      Ri(o) ? o : [],
      l && n ? si(l) : [],
    );
  }
  return t.concat(o, si(o, [], n));
}
function df(e) {
  return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
function Cb(e) {
  const t = Wt(e);
  let n = parseFloat(t.width) || 0,
    a = parseFloat(t.height) || 0;
  const o = dn(e),
    r = o ? e.offsetWidth : n,
    i = o ? e.offsetHeight : a,
    l = fs(n) !== r || fs(a) !== i;
  return (l && ((n = r), (a = i)), { width: n, height: a, $: l });
}
function zd(e) {
  return Jt(e) ? e : e.contextElement;
}
function Lo(e) {
  const t = zd(e);
  if (!dn(t)) return fn(1);
  const n = t.getBoundingClientRect(),
    { width: a, height: o, $: r } = Cb(t);
  let i = (r ? fs(n.width) : n.width) / a,
    l = (r ? fs(n.height) : n.height) / o;
  return (
    (!i || !Number.isFinite(i)) && (i = 1),
    (!l || !Number.isFinite(l)) && (l = 1),
    { x: i, y: l }
  );
}
const uA = fn(0);
function Ab(e) {
  const t = kt(e);
  return !Ld() || !t.visualViewport
    ? uA
    : { x: t.visualViewport.offsetLeft, y: t.visualViewport.offsetTop };
}
function fA(e, t, n) {
  return (t === void 0 && (t = !1), !n || (t && n !== kt(e)) ? !1 : t);
}
function Ga(e, t, n, a) {
  (t === void 0 && (t = !1), n === void 0 && (n = !1));
  const o = e.getBoundingClientRect(),
    r = zd(e);
  let i = fn(1);
  t && (a ? Jt(a) && (i = Lo(a)) : (i = Lo(e)));
  const l = fA(r, n, a) ? Ab(r) : fn(0);
  let s = (o.left + l.x) / i.x,
    c = (o.top + l.y) / i.y,
    f = o.width / i.x,
    u = o.height / i.y;
  if (r) {
    const d = kt(r),
      g = a && Jt(a) ? kt(a) : a;
    let S = d,
      v = df(S);
    for (; v && a && g !== S; ) {
      const b = Lo(v),
        m = v.getBoundingClientRect(),
        h = Wt(v),
        y = m.left + (v.clientLeft + parseFloat(h.paddingLeft)) * b.x,
        w = m.top + (v.clientTop + parseFloat(h.paddingTop)) * b.y;
      ((s *= b.x),
        (c *= b.y),
        (f *= b.x),
        (u *= b.y),
        (s += y),
        (c += w),
        (S = kt(v)),
        (v = df(S)));
    }
  }
  return ms({ width: f, height: u, x: s, y: c });
}
function $s(e, t) {
  const n = Xs(e).scrollLeft;
  return t ? t.left + n : Ga(hn(e)).left + n;
}
function Tb(e, t) {
  const n = e.getBoundingClientRect(),
    a = n.left + t.scrollLeft - $s(e, n),
    o = n.top + t.scrollTop;
  return { x: a, y: o };
}
function dA(e) {
  let { elements: t, rect: n, offsetParent: a, strategy: o } = e;
  const r = o === "fixed",
    i = hn(a),
    l = t ? qs(t.floating) : !1;
  if (a === i || (l && r)) return n;
  let s = { scrollLeft: 0, scrollTop: 0 },
    c = fn(1);
  const f = fn(0),
    u = dn(a);
  if (
    (u || (!u && !r)) &&
    ((sr(a) !== "body" || Ri(i)) && (s = Xs(a)), dn(a))
  ) {
    const g = Ga(a);
    ((c = Lo(a)), (f.x = g.x + a.clientLeft), (f.y = g.y + a.clientTop));
  }
  const d = i && !u && !r ? Tb(i, s) : fn(0);
  return {
    width: n.width * c.x,
    height: n.height * c.y,
    x: n.x * c.x - s.scrollLeft * c.x + f.x + d.x,
    y: n.y * c.y - s.scrollTop * c.y + f.y + d.y,
  };
}
function mA(e) {
  return Array.from(e.getClientRects());
}
function gA(e) {
  const t = hn(e),
    n = Xs(e),
    a = e.ownerDocument.body,
    o = Ct(t.scrollWidth, t.clientWidth, a.scrollWidth, a.clientWidth),
    r = Ct(t.scrollHeight, t.clientHeight, a.scrollHeight, a.clientHeight);
  let i = -n.scrollLeft + $s(e);
  const l = -n.scrollTop;
  return (
    Wt(a).direction === "rtl" && (i += Ct(t.clientWidth, a.clientWidth) - o),
    { width: o, height: r, x: i, y: l }
  );
}
const ah = 25;
function hA(e, t) {
  const n = kt(e),
    a = hn(e),
    o = n.visualViewport;
  let r = a.clientWidth,
    i = a.clientHeight,
    l = 0,
    s = 0;
  if (o) {
    ((r = o.width), (i = o.height));
    const f = Ld();
    (!f || (f && t === "fixed")) && ((l = o.offsetLeft), (s = o.offsetTop));
  }
  const c = $s(a);
  if (c <= 0) {
    const f = a.ownerDocument,
      u = f.body,
      d = getComputedStyle(u),
      g =
        (f.compatMode === "CSS1Compat" &&
          parseFloat(d.marginLeft) + parseFloat(d.marginRight)) ||
        0,
      S = Math.abs(a.clientWidth - u.clientWidth - g);
    S <= ah && (r -= S);
  } else c <= ah && (r += c);
  return { width: r, height: i, x: l, y: s };
}
const pA = new Set(["absolute", "fixed"]);
function vA(e, t) {
  const n = Ga(e, !0, t === "fixed"),
    a = n.top + e.clientTop,
    o = n.left + e.clientLeft,
    r = dn(e) ? Lo(e) : fn(1),
    i = e.clientWidth * r.x,
    l = e.clientHeight * r.y,
    s = o * r.x,
    c = a * r.y;
  return { width: i, height: l, x: s, y: c };
}
function oh(e, t, n) {
  let a;
  if (t === "viewport") a = hA(e, n);
  else if (t === "document") a = gA(hn(e));
  else if (Jt(t)) a = vA(t, n);
  else {
    const o = Ab(e);
    a = { x: t.x - o.x, y: t.y - o.y, width: t.width, height: t.height };
  }
  return ms(a);
}
function Rb(e, t) {
  const n = ya(e);
  return n === t || !Jt(n) || qo(n)
    ? !1
    : Wt(n).position === "fixed" || Rb(n, t);
}
function yA(e, t) {
  const n = t.get(e);
  if (n) return n;
  let a = si(e, [], !1).filter((l) => Jt(l) && sr(l) !== "body"),
    o = null;
  const r = Wt(e).position === "fixed";
  let i = r ? ya(e) : e;
  for (; Jt(i) && !qo(i); ) {
    const l = Wt(i),
      s = _d(i);
    (!s && l.position === "fixed" && (o = null),
      (
        r
          ? !s && !o
          : (!s && l.position === "static" && !!o && pA.has(o.position)) ||
            (Ri(i) && !s && Rb(e, i))
      )
        ? (a = a.filter((f) => f !== i))
        : (o = l),
      (i = ya(i)));
  }
  return (t.set(e, a), a);
}
function bA(e) {
  let { element: t, boundary: n, rootBoundary: a, strategy: o } = e;
  const i = [
      ...(n === "clippingAncestors"
        ? qs(t)
          ? []
          : yA(t, this._c)
        : [].concat(n)),
      a,
    ],
    l = i[0],
    s = i.reduce(
      (c, f) => {
        const u = oh(t, f, o);
        return (
          (c.top = Ct(u.top, c.top)),
          (c.right = va(u.right, c.right)),
          (c.bottom = va(u.bottom, c.bottom)),
          (c.left = Ct(u.left, c.left)),
          c
        );
      },
      oh(t, l, o),
    );
  return {
    width: s.right - s.left,
    height: s.bottom - s.top,
    x: s.left,
    y: s.top,
  };
}
function SA(e) {
  const { width: t, height: n } = Cb(e);
  return { width: t, height: n };
}
function wA(e, t, n) {
  const a = dn(t),
    o = hn(t),
    r = n === "fixed",
    i = Ga(e, !0, r, t);
  let l = { scrollLeft: 0, scrollTop: 0 };
  const s = fn(0);
  function c() {
    s.x = $s(o);
  }
  if (a || (!a && !r))
    if (((sr(t) !== "body" || Ri(o)) && (l = Xs(t)), a)) {
      const g = Ga(t, !0, r, t);
      ((s.x = g.x + t.clientLeft), (s.y = g.y + t.clientTop));
    } else o && c();
  r && !a && o && c();
  const f = o && !a && !r ? Tb(o, l) : fn(0),
    u = i.left + l.scrollLeft - s.x - f.x,
    d = i.top + l.scrollTop - s.y - f.y;
  return { x: u, y: d, width: i.width, height: i.height };
}
function eu(e) {
  return Wt(e).position === "static";
}
function rh(e, t) {
  if (!dn(e) || Wt(e).position === "fixed") return null;
  if (t) return t(e);
  let n = e.offsetParent;
  return (hn(e) === n && (n = n.ownerDocument.body), n);
}
function Mb(e, t) {
  const n = kt(e);
  if (qs(e)) return n;
  if (!dn(e)) {
    let o = ya(e);
    for (; o && !qo(o); ) {
      if (Jt(o) && !eu(o)) return o;
      o = ya(o);
    }
    return n;
  }
  let a = rh(e, t);
  for (; a && aA(a) && eu(a); ) a = rh(a, t);
  return a && qo(a) && eu(a) && !_d(a) ? n : a || sA(e) || n;
}
const xA = async function (e) {
  const t = this.getOffsetParent || Mb,
    n = this.getDimensions,
    a = await n(e.floating);
  return {
    reference: wA(e.reference, await t(e.floating), e.strategy),
    floating: { x: 0, y: 0, width: a.width, height: a.height },
  };
};
function EA(e) {
  return Wt(e).direction === "rtl";
}
const CA = {
  convertOffsetParentRelativeRectToViewportRelativeRect: dA,
  getDocumentElement: hn,
  getClippingRect: bA,
  getOffsetParent: Mb,
  getElementRects: xA,
  getClientRects: mA,
  getDimensions: SA,
  getScale: Lo,
  isElement: Jt,
  isRTL: EA,
};
function Db(e, t) {
  return (
    e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height
  );
}
function AA(e, t) {
  let n = null,
    a;
  const o = hn(e);
  function r() {
    var l;
    (clearTimeout(a), (l = n) == null || l.disconnect(), (n = null));
  }
  function i(l, s) {
    (l === void 0 && (l = !1), s === void 0 && (s = 1), r());
    const c = e.getBoundingClientRect(),
      { left: f, top: u, width: d, height: g } = c;
    if ((l || t(), !d || !g)) return;
    const S = tl(u),
      v = tl(o.clientWidth - (f + d)),
      b = tl(o.clientHeight - (u + g)),
      m = tl(f),
      y = {
        rootMargin: -S + "px " + -v + "px " + -b + "px " + -m + "px",
        threshold: Ct(0, va(1, s)) || 1,
      };
    let w = !0;
    function C(R) {
      const E = R[0].intersectionRatio;
      if (E !== s) {
        if (!w) return i();
        E
          ? i(!1, E)
          : (a = setTimeout(() => {
              i(!1, 1e-7);
            }, 1e3));
      }
      (E === 1 && !Db(c, e.getBoundingClientRect()) && i(), (w = !1));
    }
    try {
      n = new IntersectionObserver(C, { ...y, root: o.ownerDocument });
    } catch {
      n = new IntersectionObserver(C, y);
    }
    n.observe(e);
  }
  return (i(!0), r);
}
function TA(e, t, n, a) {
  a === void 0 && (a = {});
  const {
      ancestorScroll: o = !0,
      ancestorResize: r = !0,
      elementResize: i = typeof ResizeObserver == "function",
      layoutShift: l = typeof IntersectionObserver == "function",
      animationFrame: s = !1,
    } = a,
    c = zd(e),
    f = o || r ? [...(c ? si(c) : []), ...si(t)] : [];
  f.forEach((m) => {
    (o && m.addEventListener("scroll", n, { passive: !0 }),
      r && m.addEventListener("resize", n));
  });
  const u = c && l ? AA(c, n) : null;
  let d = -1,
    g = null;
  i &&
    ((g = new ResizeObserver((m) => {
      let [h] = m;
      (h &&
        h.target === c &&
        g &&
        (g.unobserve(t),
        cancelAnimationFrame(d),
        (d = requestAnimationFrame(() => {
          var y;
          (y = g) == null || y.observe(t);
        }))),
        n());
    })),
    c && !s && g.observe(c),
    g.observe(t));
  let S,
    v = s ? Ga(e) : null;
  s && b();
  function b() {
    const m = Ga(e);
    (v && !Db(v, m) && n(), (v = m), (S = requestAnimationFrame(b)));
  }
  return (
    n(),
    () => {
      var m;
      (f.forEach((h) => {
        (o && h.removeEventListener("scroll", n),
          r && h.removeEventListener("resize", n));
      }),
        u == null || u(),
        (m = g) == null || m.disconnect(),
        (g = null),
        s && cancelAnimationFrame(S));
    }
  );
}
const RA = ZC,
  MA = JC,
  DA = XC,
  OA = eA,
  kA = $C,
  ih = qC,
  NA = WC,
  _A = (e, t, n) => {
    const a = new Map(),
      o = { platform: CA, ...n },
      r = { ...o.platform, _c: a };
    return KC(e, t, { ...o, platform: r });
  };
var LA = typeof document < "u",
  zA = function () {},
  Rl = LA ? p.useLayoutEffect : zA;
function gs(e, t) {
  if (e === t) return !0;
  if (typeof e != typeof t) return !1;
  if (typeof e == "function" && e.toString() === t.toString()) return !0;
  let n, a, o;
  if (e && t && typeof e == "object") {
    if (Array.isArray(e)) {
      if (((n = e.length), n !== t.length)) return !1;
      for (a = n; a-- !== 0; ) if (!gs(e[a], t[a])) return !1;
      return !0;
    }
    if (((o = Object.keys(e)), (n = o.length), n !== Object.keys(t).length))
      return !1;
    for (a = n; a-- !== 0; ) if (!{}.hasOwnProperty.call(t, o[a])) return !1;
    for (a = n; a-- !== 0; ) {
      const r = o[a];
      if (!(r === "_owner" && e.$$typeof) && !gs(e[r], t[r])) return !1;
    }
    return !0;
  }
  return e !== e && t !== t;
}
function Ob(e) {
  return typeof window > "u"
    ? 1
    : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function lh(e, t) {
  const n = Ob(e);
  return Math.round(t * n) / n;
}
function tu(e) {
  const t = p.useRef(e);
  return (
    Rl(() => {
      t.current = e;
    }),
    t
  );
}
function jA(e) {
  e === void 0 && (e = {});
  const {
      placement: t = "bottom",
      strategy: n = "absolute",
      middleware: a = [],
      platform: o,
      elements: { reference: r, floating: i } = {},
      transform: l = !0,
      whileElementsMounted: s,
      open: c,
    } = e,
    [f, u] = p.useState({
      x: 0,
      y: 0,
      strategy: n,
      placement: t,
      middlewareData: {},
      isPositioned: !1,
    }),
    [d, g] = p.useState(a);
  gs(d, a) || g(a);
  const [S, v] = p.useState(null),
    [b, m] = p.useState(null),
    h = p.useCallback((T) => {
      T !== R.current && ((R.current = T), v(T));
    }, []),
    y = p.useCallback((T) => {
      T !== E.current && ((E.current = T), m(T));
    }, []),
    w = r || S,
    C = i || b,
    R = p.useRef(null),
    E = p.useRef(null),
    A = p.useRef(f),
    O = s != null,
    N = tu(s),
    B = tu(o),
    z = tu(c),
    G = p.useCallback(() => {
      if (!R.current || !E.current) return;
      const T = { placement: t, strategy: n, middleware: d };
      (B.current && (T.platform = B.current),
        _A(R.current, E.current, T).then((D) => {
          const j = { ...D, isPositioned: z.current !== !1 };
          V.current &&
            !gs(A.current, j) &&
            ((A.current = j),
            Ms.flushSync(() => {
              u(j);
            }));
        }));
    }, [d, t, n, B, z]);
  Rl(() => {
    c === !1 &&
      A.current.isPositioned &&
      ((A.current.isPositioned = !1), u((T) => ({ ...T, isPositioned: !1 })));
  }, [c]);
  const V = p.useRef(!1);
  (Rl(
    () => (
      (V.current = !0),
      () => {
        V.current = !1;
      }
    ),
    [],
  ),
    Rl(() => {
      if ((w && (R.current = w), C && (E.current = C), w && C)) {
        if (N.current) return N.current(w, C, G);
        G();
      }
    }, [w, C, G, N, O]));
  const Y = p.useMemo(
      () => ({ reference: R, floating: E, setReference: h, setFloating: y }),
      [h, y],
    ),
    M = p.useMemo(() => ({ reference: w, floating: C }), [w, C]),
    _ = p.useMemo(() => {
      const T = { position: n, left: 0, top: 0 };
      if (!M.floating) return T;
      const D = lh(M.floating, f.x),
        j = lh(M.floating, f.y);
      return l
        ? {
            ...T,
            transform: "translate(" + D + "px, " + j + "px)",
            ...(Ob(M.floating) >= 1.5 && { willChange: "transform" }),
          }
        : { position: n, left: D, top: j };
    }, [n, l, M.floating, f.x, f.y]);
  return p.useMemo(
    () => ({ ...f, update: G, refs: Y, elements: M, floatingStyles: _ }),
    [f, G, Y, M, _],
  );
}
const BA = (e) => {
    function t(n) {
      return {}.hasOwnProperty.call(n, "current");
    }
    return {
      name: "arrow",
      options: e,
      fn(n) {
        const { element: a, padding: o } = typeof e == "function" ? e(n) : e;
        return a && t(a)
          ? a.current != null
            ? ih({ element: a.current, padding: o }).fn(n)
            : {}
          : a
            ? ih({ element: a, padding: o }).fn(n)
            : {};
      },
    };
  },
  UA = (e, t) => ({ ...RA(e), options: [e, t] }),
  HA = (e, t) => ({ ...MA(e), options: [e, t] }),
  PA = (e, t) => ({ ...NA(e), options: [e, t] }),
  VA = (e, t) => ({ ...DA(e), options: [e, t] }),
  IA = (e, t) => ({ ...OA(e), options: [e, t] }),
  GA = (e, t) => ({ ...kA(e), options: [e, t] }),
  YA = (e, t) => ({ ...BA(e), options: [e, t] });
var FA = "Arrow",
  kb = p.forwardRef((e, t) => {
    const { children: n, width: a = 10, height: o = 5, ...r } = e;
    return x.jsx(ye.svg, {
      ...r,
      ref: t,
      width: a,
      height: o,
      viewBox: "0 0 30 10",
      preserveAspectRatio: "none",
      children: e.asChild ? n : x.jsx("polygon", { points: "0,0 30,0 15,10" }),
    });
  });
kb.displayName = FA;
var KA = kb;
function qA(e) {
  const [t, n] = p.useState(void 0);
  return (
    Bn(() => {
      if (e) {
        n({ width: e.offsetWidth, height: e.offsetHeight });
        const a = new ResizeObserver((o) => {
          if (!Array.isArray(o) || !o.length) return;
          const r = o[0];
          let i, l;
          if ("borderBoxSize" in r) {
            const s = r.borderBoxSize,
              c = Array.isArray(s) ? s[0] : s;
            ((i = c.inlineSize), (l = c.blockSize));
          } else ((i = e.offsetWidth), (l = e.offsetHeight));
          n({ width: i, height: l });
        });
        return (a.observe(e, { box: "border-box" }), () => a.unobserve(e));
      } else n(void 0);
    }, [e]),
    t
  );
}
var jd = "Popper",
  [Nb, Qs] = wa(jd),
  [XA, _b] = Nb(jd),
  Lb = (e) => {
    const { __scopePopper: t, children: n } = e,
      [a, o] = p.useState(null);
    return x.jsx(XA, { scope: t, anchor: a, onAnchorChange: o, children: n });
  };
Lb.displayName = jd;
var zb = "PopperAnchor",
  jb = p.forwardRef((e, t) => {
    const { __scopePopper: n, virtualRef: a, ...o } = e,
      r = _b(zb, n),
      i = p.useRef(null),
      l = Ae(t, i),
      s = p.useRef(null);
    return (
      p.useEffect(() => {
        const c = s.current;
        ((s.current = (a == null ? void 0 : a.current) || i.current),
          c !== s.current && r.onAnchorChange(s.current));
      }),
      a ? null : x.jsx(ye.div, { ...o, ref: l })
    );
  });
jb.displayName = zb;
var Bd = "PopperContent",
  [$A, QA] = Nb(Bd),
  Bb = p.forwardRef((e, t) => {
    var Q, W, pe, be, ct, qe;
    const {
        __scopePopper: n,
        side: a = "bottom",
        sideOffset: o = 0,
        align: r = "center",
        alignOffset: i = 0,
        arrowPadding: l = 0,
        avoidCollisions: s = !0,
        collisionBoundary: c = [],
        collisionPadding: f = 0,
        sticky: u = "partial",
        hideWhenDetached: d = !1,
        updatePositionStrategy: g = "optimized",
        onPlaced: S,
        ...v
      } = e,
      b = _b(Bd, n),
      [m, h] = p.useState(null),
      y = Ae(t, (Ve) => h(Ve)),
      [w, C] = p.useState(null),
      R = qA(w),
      E = (R == null ? void 0 : R.width) ?? 0,
      A = (R == null ? void 0 : R.height) ?? 0,
      O = a + (r !== "center" ? "-" + r : ""),
      N =
        typeof f == "number"
          ? f
          : { top: 0, right: 0, bottom: 0, left: 0, ...f },
      B = Array.isArray(c) ? c : [c],
      z = B.length > 0,
      G = { padding: N, boundary: B.filter(JA), altBoundary: z },
      {
        refs: V,
        floatingStyles: Y,
        placement: M,
        isPositioned: _,
        middlewareData: T,
      } = jA({
        strategy: "fixed",
        placement: O,
        whileElementsMounted: (...Ve) =>
          TA(...Ve, { animationFrame: g === "always" }),
        elements: { reference: b.anchor },
        middleware: [
          UA({ mainAxis: o + A, alignmentAxis: i }),
          s &&
            HA({
              mainAxis: !0,
              crossAxis: !1,
              limiter: u === "partial" ? PA() : void 0,
              ...G,
            }),
          s && VA({ ...G }),
          IA({
            ...G,
            apply: ({
              elements: Ve,
              rects: Lt,
              availableWidth: xa,
              availableHeight: Ni,
            }) => {
              const { width: Ea, height: _i } = Lt.reference,
                ut = Ve.floating.style;
              (ut.setProperty("--radix-popper-available-width", `${xa}px`),
                ut.setProperty("--radix-popper-available-height", `${Ni}px`),
                ut.setProperty("--radix-popper-anchor-width", `${Ea}px`),
                ut.setProperty("--radix-popper-anchor-height", `${_i}px`));
            },
          }),
          w && YA({ element: w, padding: l }),
          WA({ arrowWidth: E, arrowHeight: A }),
          d && GA({ strategy: "referenceHidden", ...G }),
        ],
      }),
      [D, j] = Pb(M),
      q = ot(S);
    Bn(() => {
      _ && (q == null || q());
    }, [_, q]);
    const le = (Q = T.arrow) == null ? void 0 : Q.x,
      U = (W = T.arrow) == null ? void 0 : W.y,
      I = ((pe = T.arrow) == null ? void 0 : pe.centerOffset) !== 0,
      [X, fe] = p.useState();
    return (
      Bn(() => {
        m && fe(window.getComputedStyle(m).zIndex);
      }, [m]),
      x.jsx("div", {
        ref: V.setFloating,
        "data-radix-popper-content-wrapper": "",
        style: {
          ...Y,
          transform: _ ? Y.transform : "translate(0, -200%)",
          minWidth: "max-content",
          zIndex: X,
          "--radix-popper-transform-origin": [
            (be = T.transformOrigin) == null ? void 0 : be.x,
            (ct = T.transformOrigin) == null ? void 0 : ct.y,
          ].join(" "),
          ...(((qe = T.hide) == null ? void 0 : qe.referenceHidden) && {
            visibility: "hidden",
            pointerEvents: "none",
          }),
        },
        dir: e.dir,
        children: x.jsx($A, {
          scope: n,
          placedSide: D,
          onArrowChange: C,
          arrowX: le,
          arrowY: U,
          shouldHideArrow: I,
          children: x.jsx(ye.div, {
            "data-side": D,
            "data-align": j,
            ...v,
            ref: y,
            style: { ...v.style, animation: _ ? void 0 : "none" },
          }),
        }),
      })
    );
  });
Bb.displayName = Bd;
var Ub = "PopperArrow",
  ZA = { top: "bottom", right: "left", bottom: "top", left: "right" },
  Hb = p.forwardRef(function (t, n) {
    const { __scopePopper: a, ...o } = t,
      r = QA(Ub, a),
      i = ZA[r.placedSide];
    return x.jsx("span", {
      ref: r.onArrowChange,
      style: {
        position: "absolute",
        left: r.arrowX,
        top: r.arrowY,
        [i]: 0,
        transformOrigin: {
          top: "",
          right: "0 0",
          bottom: "center 0",
          left: "100% 0",
        }[r.placedSide],
        transform: {
          top: "translateY(100%)",
          right: "translateY(50%) rotate(90deg) translateX(-50%)",
          bottom: "rotate(180deg)",
          left: "translateY(50%) rotate(-90deg) translateX(50%)",
        }[r.placedSide],
        visibility: r.shouldHideArrow ? "hidden" : void 0,
      },
      children: x.jsx(KA, {
        ...o,
        ref: n,
        style: { ...o.style, display: "block" },
      }),
    });
  });
Hb.displayName = Ub;
function JA(e) {
  return e !== null;
}
var WA = (e) => ({
  name: "transformOrigin",
  options: e,
  fn(t) {
    var b, m, h;
    const { placement: n, rects: a, middlewareData: o } = t,
      i = ((b = o.arrow) == null ? void 0 : b.centerOffset) !== 0,
      l = i ? 0 : e.arrowWidth,
      s = i ? 0 : e.arrowHeight,
      [c, f] = Pb(n),
      u = { start: "0%", center: "50%", end: "100%" }[f],
      d = (((m = o.arrow) == null ? void 0 : m.x) ?? 0) + l / 2,
      g = (((h = o.arrow) == null ? void 0 : h.y) ?? 0) + s / 2;
    let S = "",
      v = "";
    return (
      c === "bottom"
        ? ((S = i ? u : `${d}px`), (v = `${-s}px`))
        : c === "top"
          ? ((S = i ? u : `${d}px`), (v = `${a.floating.height + s}px`))
          : c === "right"
            ? ((S = `${-s}px`), (v = i ? u : `${g}px`))
            : c === "left" &&
              ((S = `${a.floating.width + s}px`), (v = i ? u : `${g}px`)),
      { data: { x: S, y: v } }
    );
  },
});
function Pb(e) {
  const [t, n = "center"] = e.split("-");
  return [t, n];
}
var Vb = Lb,
  Ib = jb,
  Gb = Bb,
  Yb = Hb,
  eT = "Portal",
  Zs = p.forwardRef((e, t) => {
    var l;
    const { container: n, ...a } = e,
      [o, r] = p.useState(!1);
    Bn(() => r(!0), []);
    const i =
      n ||
      (o &&
        ((l = globalThis == null ? void 0 : globalThis.document) == null
          ? void 0
          : l.body));
    return i ? ip.createPortal(x.jsx(ye.div, { ...a, ref: t }), i) : null;
  });
Zs.displayName = eT;
var tT = Df[" useInsertionEffect ".trim().toString()] || Bn;
function Js({ prop: e, defaultProp: t, onChange: n = () => {}, caller: a }) {
  const [o, r, i] = nT({ defaultProp: t, onChange: n }),
    l = e !== void 0,
    s = l ? e : o;
  {
    const f = p.useRef(e !== void 0);
    p.useEffect(() => {
      const u = f.current;
      if (u !== l) {
        const d = u ? "controlled" : "uncontrolled",
          g = l ? "controlled" : "uncontrolled";
      }
      f.current = l;
    }, [l, a]);
  }
  const c = p.useCallback(
    (f) => {
      var u;
      if (l) {
        const d = aT(f) ? f(e) : f;
        d !== e && ((u = i.current) == null || u.call(i, d));
      } else r(f);
    },
    [l, e, r, i],
  );
  return [s, c];
}
function nT({ defaultProp: e, onChange: t }) {
  const [n, a] = p.useState(e),
    o = p.useRef(n),
    r = p.useRef(t);
  return (
    tT(() => {
      r.current = t;
    }, [t]),
    p.useEffect(() => {
      var i;
      o.current !== n &&
        ((i = r.current) == null || i.call(r, n), (o.current = n));
    }, [n, o]),
    [n, a, r]
  );
}
function aT(e) {
  return typeof e == "function";
}
var oT = Object.freeze({
    position: "absolute",
    border: 0,
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    wordWrap: "normal",
  }),
  rT = "VisuallyHidden",
  Fb = p.forwardRef((e, t) =>
    x.jsx(ye.span, { ...e, ref: t, style: { ...oT, ...e.style } }),
  );
Fb.displayName = rT;
var iT = Fb,
  lT = function (e) {
    if (typeof document > "u") return null;
    var t = Array.isArray(e) ? e[0] : e;
    return t.ownerDocument.body;
  },
  io = new WeakMap(),
  nl = new WeakMap(),
  al = {},
  nu = 0,
  Kb = function (e) {
    return e && (e.host || Kb(e.parentNode));
  },
  sT = function (e, t) {
    return t
      .map(function (n) {
        if (e.contains(n)) return n;
        var a = Kb(n);
        return a && e.contains(a) ? a : null;
      })
      .filter(function (n) {
        return !!n;
      });
  },
  cT = function (e, t, n, a) {
    var o = sT(t, Array.isArray(e) ? e : [e]);
    al[n] || (al[n] = new WeakMap());
    var r = al[n],
      i = [],
      l = new Set(),
      s = new Set(o),
      c = function (u) {
        !u || l.has(u) || (l.add(u), c(u.parentNode));
      };
    o.forEach(c);
    var f = function (u) {
      !u ||
        s.has(u) ||
        Array.prototype.forEach.call(u.children, function (d) {
          if (l.has(d)) f(d);
          else
            try {
              var g = d.getAttribute(a),
                S = g !== null && g !== "false",
                v = (io.get(d) || 0) + 1,
                b = (r.get(d) || 0) + 1;
              (io.set(d, v),
                r.set(d, b),
                i.push(d),
                v === 1 && S && nl.set(d, !0),
                b === 1 && d.setAttribute(n, "true"),
                S || d.setAttribute(a, "true"));
            } catch {}
        });
    };
    return (
      f(t),
      l.clear(),
      nu++,
      function () {
        (i.forEach(function (u) {
          var d = io.get(u) - 1,
            g = r.get(u) - 1;
          (io.set(u, d),
            r.set(u, g),
            d || (nl.has(u) || u.removeAttribute(a), nl.delete(u)),
            g || u.removeAttribute(n));
        }),
          nu--,
          nu ||
            ((io = new WeakMap()),
            (io = new WeakMap()),
            (nl = new WeakMap()),
            (al = {})));
      }
    );
  },
  qb = function (e, t, n) {
    n === void 0 && (n = "data-aria-hidden");
    var a = Array.from(Array.isArray(e) ? e : [e]),
      o = lT(e);
    return o
      ? (a.push.apply(a, Array.from(o.querySelectorAll("[aria-live], script"))),
        cT(a, o, n, "aria-hidden"))
      : function () {
          return null;
        };
  },
  an = function () {
    return (
      (an =
        Object.assign ||
        function (t) {
          for (var n, a = 1, o = arguments.length; a < o; a++) {
            n = arguments[a];
            for (var r in n)
              Object.prototype.hasOwnProperty.call(n, r) && (t[r] = n[r]);
          }
          return t;
        }),
      an.apply(this, arguments)
    );
  };
function Xb(e, t) {
  var n = {};
  for (var a in e)
    Object.prototype.hasOwnProperty.call(e, a) &&
      t.indexOf(a) < 0 &&
      (n[a] = e[a]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var o = 0, a = Object.getOwnPropertySymbols(e); o < a.length; o++)
      t.indexOf(a[o]) < 0 &&
        Object.prototype.propertyIsEnumerable.call(e, a[o]) &&
        (n[a[o]] = e[a[o]]);
  return n;
}
function uT(e, t, n) {
  if (n || arguments.length === 2)
    for (var a = 0, o = t.length, r; a < o; a++)
      (r || !(a in t)) &&
        (r || (r = Array.prototype.slice.call(t, 0, a)), (r[a] = t[a]));
  return e.concat(r || Array.prototype.slice.call(t));
}
var Ml = "right-scroll-bar-position",
  Dl = "width-before-scroll-bar",
  fT = "with-scroll-bars-hidden",
  dT = "--removed-body-scroll-bar-size";
function au(e, t) {
  return (typeof e == "function" ? e(t) : e && (e.current = t), e);
}
function mT(e, t) {
  var n = p.useState(function () {
    return {
      value: e,
      callback: t,
      facade: {
        get current() {
          return n.value;
        },
        set current(a) {
          var o = n.value;
          o !== a && ((n.value = a), n.callback(a, o));
        },
      },
    };
  })[0];
  return ((n.callback = t), n.facade);
}
var gT = typeof window < "u" ? p.useLayoutEffect : p.useEffect,
  sh = new WeakMap();
function hT(e, t) {
  var n = mT(null, function (a) {
    return e.forEach(function (o) {
      return au(o, a);
    });
  });
  return (
    gT(
      function () {
        var a = sh.get(n);
        if (a) {
          var o = new Set(a),
            r = new Set(e),
            i = n.current;
          (o.forEach(function (l) {
            r.has(l) || au(l, null);
          }),
            r.forEach(function (l) {
              o.has(l) || au(l, i);
            }));
        }
        sh.set(n, e);
      },
      [e],
    ),
    n
  );
}
function pT(e) {
  return e;
}
function vT(e, t) {
  t === void 0 && (t = pT);
  var n = [],
    a = !1,
    o = {
      read: function () {
        if (a)
          throw new Error(
            "Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`.",
          );
        return n.length ? n[n.length - 1] : e;
      },
      useMedium: function (r) {
        var i = t(r, a);
        return (
          n.push(i),
          function () {
            n = n.filter(function (l) {
              return l !== i;
            });
          }
        );
      },
      assignSyncMedium: function (r) {
        for (a = !0; n.length; ) {
          var i = n;
          ((n = []), i.forEach(r));
        }
        n = {
          push: function (l) {
            return r(l);
          },
          filter: function () {
            return n;
          },
        };
      },
      assignMedium: function (r) {
        a = !0;
        var i = [];
        if (n.length) {
          var l = n;
          ((n = []), l.forEach(r), (i = n));
        }
        var s = function () {
            var f = i;
            ((i = []), f.forEach(r));
          },
          c = function () {
            return Promise.resolve().then(s);
          };
        (c(),
          (n = {
            push: function (f) {
              (i.push(f), c());
            },
            filter: function (f) {
              return ((i = i.filter(f)), n);
            },
          }));
      },
    };
  return o;
}
function yT(e) {
  e === void 0 && (e = {});
  var t = vT(null);
  return ((t.options = an({ async: !0, ssr: !1 }, e)), t);
}
var $b = function (e) {
  var t = e.sideCar,
    n = Xb(e, ["sideCar"]);
  if (!t)
    throw new Error(
      "Sidecar: please provide `sideCar` property to import the right car",
    );
  var a = t.read();
  if (!a) throw new Error("Sidecar medium not found");
  return p.createElement(a, an({}, n));
};
$b.isSideCarExport = !0;
function bT(e, t) {
  return (e.useMedium(t), $b);
}
var Qb = yT(),
  ou = function () {},
  Ws = p.forwardRef(function (e, t) {
    var n = p.useRef(null),
      a = p.useState({
        onScrollCapture: ou,
        onWheelCapture: ou,
        onTouchMoveCapture: ou,
      }),
      o = a[0],
      r = a[1],
      i = e.forwardProps,
      l = e.children,
      s = e.className,
      c = e.removeScrollBar,
      f = e.enabled,
      u = e.shards,
      d = e.sideCar,
      g = e.noRelative,
      S = e.noIsolation,
      v = e.inert,
      b = e.allowPinchZoom,
      m = e.as,
      h = m === void 0 ? "div" : m,
      y = e.gapMode,
      w = Xb(e, [
        "forwardProps",
        "children",
        "className",
        "removeScrollBar",
        "enabled",
        "shards",
        "sideCar",
        "noRelative",
        "noIsolation",
        "inert",
        "allowPinchZoom",
        "as",
        "gapMode",
      ]),
      C = d,
      R = hT([n, t]),
      E = an(an({}, w), o);
    return p.createElement(
      p.Fragment,
      null,
      f &&
        p.createElement(C, {
          sideCar: Qb,
          removeScrollBar: c,
          shards: u,
          noRelative: g,
          noIsolation: S,
          inert: v,
          setCallbacks: r,
          allowPinchZoom: !!b,
          lockRef: n,
          gapMode: y,
        }),
      i
        ? p.cloneElement(p.Children.only(l), an(an({}, E), { ref: R }))
        : p.createElement(h, an({}, E, { className: s, ref: R }), l),
    );
  });
Ws.defaultProps = { enabled: !0, removeScrollBar: !0, inert: !1 };
Ws.classNames = { fullWidth: Dl, zeroRight: Ml };
var ST = function () {
  if (typeof __webpack_nonce__ < "u") return __webpack_nonce__;
};
function wT() {
  if (!document) return null;
  var e = document.createElement("style");
  e.type = "text/css";
  var t = ST();
  return (t && e.setAttribute("nonce", t), e);
}
function xT(e, t) {
  e.styleSheet
    ? (e.styleSheet.cssText = t)
    : e.appendChild(document.createTextNode(t));
}
function ET(e) {
  var t = document.head || document.getElementsByTagName("head")[0];
  t.appendChild(e);
}
var CT = function () {
    var e = 0,
      t = null;
    return {
      add: function (n) {
        (e == 0 && (t = wT()) && (xT(t, n), ET(t)), e++);
      },
      remove: function () {
        (e--,
          !e && t && (t.parentNode && t.parentNode.removeChild(t), (t = null)));
      },
    };
  },
  AT = function () {
    var e = CT();
    return function (t, n) {
      p.useEffect(
        function () {
          return (
            e.add(t),
            function () {
              e.remove();
            }
          );
        },
        [t && n],
      );
    };
  },
  Zb = function () {
    var e = AT(),
      t = function (n) {
        var a = n.styles,
          o = n.dynamic;
        return (e(a, o), null);
      };
    return t;
  },
  TT = { left: 0, top: 0, right: 0, gap: 0 },
  ru = function (e) {
    return parseInt(e || "", 10) || 0;
  },
  RT = function (e) {
    var t = window.getComputedStyle(document.body),
      n = t[e === "padding" ? "paddingLeft" : "marginLeft"],
      a = t[e === "padding" ? "paddingTop" : "marginTop"],
      o = t[e === "padding" ? "paddingRight" : "marginRight"];
    return [ru(n), ru(a), ru(o)];
  },
  MT = function (e) {
    if ((e === void 0 && (e = "margin"), typeof window > "u")) return TT;
    var t = RT(e),
      n = document.documentElement.clientWidth,
      a = window.innerWidth;
    return {
      left: t[0],
      top: t[1],
      right: t[2],
      gap: Math.max(0, a - n + t[2] - t[0]),
    };
  },
  DT = Zb(),
  zo = "data-scroll-locked",
  OT = function (e, t, n, a) {
    var o = e.left,
      r = e.top,
      i = e.right,
      l = e.gap;
    return (
      n === void 0 && (n = "margin"),
      `
  .`
        .concat(
          fT,
          ` {
   overflow: hidden `,
        )
        .concat(
          a,
          `;
   padding-right: `,
        )
        .concat(l, "px ")
        .concat(
          a,
          `;
  }
  body[`,
        )
        .concat(
          zo,
          `] {
    overflow: hidden `,
        )
        .concat(
          a,
          `;
    overscroll-behavior: contain;
    `,
        )
        .concat(
          [
            t && "position: relative ".concat(a, ";"),
            n === "margin" &&
              `
    padding-left: `
                .concat(
                  o,
                  `px;
    padding-top: `,
                )
                .concat(
                  r,
                  `px;
    padding-right: `,
                )
                .concat(
                  i,
                  `px;
    margin-left:0;
    margin-top:0;
    margin-right: `,
                )
                .concat(l, "px ")
                .concat(
                  a,
                  `;
    `,
                ),
            n === "padding" &&
              "padding-right: ".concat(l, "px ").concat(a, ";"),
          ]
            .filter(Boolean)
            .join(""),
          `
  }
  
  .`,
        )
        .concat(
          Ml,
          ` {
    right: `,
        )
        .concat(l, "px ")
        .concat(
          a,
          `;
  }
  
  .`,
        )
        .concat(
          Dl,
          ` {
    margin-right: `,
        )
        .concat(l, "px ")
        .concat(
          a,
          `;
  }
  
  .`,
        )
        .concat(Ml, " .")
        .concat(
          Ml,
          ` {
    right: 0 `,
        )
        .concat(
          a,
          `;
  }
  
  .`,
        )
        .concat(Dl, " .")
        .concat(
          Dl,
          ` {
    margin-right: 0 `,
        )
        .concat(
          a,
          `;
  }
  
  body[`,
        )
        .concat(
          zo,
          `] {
    `,
        )
        .concat(dT, ": ")
        .concat(
          l,
          `px;
  }
`,
        )
    );
  },
  ch = function () {
    var e = parseInt(document.body.getAttribute(zo) || "0", 10);
    return isFinite(e) ? e : 0;
  },
  kT = function () {
    p.useEffect(function () {
      return (
        document.body.setAttribute(zo, (ch() + 1).toString()),
        function () {
          var e = ch() - 1;
          e <= 0
            ? document.body.removeAttribute(zo)
            : document.body.setAttribute(zo, e.toString());
        }
      );
    }, []);
  },
  NT = function (e) {
    var t = e.noRelative,
      n = e.noImportant,
      a = e.gapMode,
      o = a === void 0 ? "margin" : a;
    kT();
    var r = p.useMemo(
      function () {
        return MT(o);
      },
      [o],
    );
    return p.createElement(DT, { styles: OT(r, !t, o, n ? "" : "!important") });
  },
  mf = !1;
if (typeof window < "u")
  try {
    var ol = Object.defineProperty({}, "passive", {
      get: function () {
        return ((mf = !0), !0);
      },
    });
    (window.addEventListener("test", ol, ol),
      window.removeEventListener("test", ol, ol));
  } catch {
    mf = !1;
  }
var lo = mf ? { passive: !1 } : !1,
  _T = function (e) {
    return e.tagName === "TEXTAREA";
  },
  Jb = function (e, t) {
    if (!(e instanceof Element)) return !1;
    var n = window.getComputedStyle(e);
    return (
      n[t] !== "hidden" &&
      !(n.overflowY === n.overflowX && !_T(e) && n[t] === "visible")
    );
  },
  LT = function (e) {
    return Jb(e, "overflowY");
  },
  zT = function (e) {
    return Jb(e, "overflowX");
  },
  uh = function (e, t) {
    var n = t.ownerDocument,
      a = t;
    do {
      typeof ShadowRoot < "u" && a instanceof ShadowRoot && (a = a.host);
      var o = Wb(e, a);
      if (o) {
        var r = e0(e, a),
          i = r[1],
          l = r[2];
        if (i > l) return !0;
      }
      a = a.parentNode;
    } while (a && a !== n.body);
    return !1;
  },
  jT = function (e) {
    var t = e.scrollTop,
      n = e.scrollHeight,
      a = e.clientHeight;
    return [t, n, a];
  },
  BT = function (e) {
    var t = e.scrollLeft,
      n = e.scrollWidth,
      a = e.clientWidth;
    return [t, n, a];
  },
  Wb = function (e, t) {
    return e === "v" ? LT(t) : zT(t);
  },
  e0 = function (e, t) {
    return e === "v" ? jT(t) : BT(t);
  },
  UT = function (e, t) {
    return e === "h" && t === "rtl" ? -1 : 1;
  },
  HT = function (e, t, n, a, o) {
    var r = UT(e, window.getComputedStyle(t).direction),
      i = r * a,
      l = n.target,
      s = t.contains(l),
      c = !1,
      f = i > 0,
      u = 0,
      d = 0;
    do {
      if (!l) break;
      var g = e0(e, l),
        S = g[0],
        v = g[1],
        b = g[2],
        m = v - b - r * S;
      (S || m) && Wb(e, l) && ((u += m), (d += S));
      var h = l.parentNode;
      l = h && h.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? h.host : h;
    } while ((!s && l !== document.body) || (s && (t.contains(l) || t === l)));
    return (((f && Math.abs(u) < 1) || (!f && Math.abs(d) < 1)) && (c = !0), c);
  },
  rl = function (e) {
    return "changedTouches" in e
      ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY]
      : [0, 0];
  },
  fh = function (e) {
    return [e.deltaX, e.deltaY];
  },
  dh = function (e) {
    return e && "current" in e ? e.current : e;
  },
  PT = function (e, t) {
    return e[0] === t[0] && e[1] === t[1];
  },
  VT = function (e) {
    return `
  .block-interactivity-`
      .concat(
        e,
        ` {pointer-events: none;}
  .allow-interactivity-`,
      )
      .concat(
        e,
        ` {pointer-events: all;}
`,
      );
  },
  IT = 0,
  so = [];
function GT(e) {
  var t = p.useRef([]),
    n = p.useRef([0, 0]),
    a = p.useRef(),
    o = p.useState(IT++)[0],
    r = p.useState(Zb)[0],
    i = p.useRef(e);
  (p.useEffect(
    function () {
      i.current = e;
    },
    [e],
  ),
    p.useEffect(
      function () {
        if (e.inert) {
          document.body.classList.add("block-interactivity-".concat(o));
          var v = uT([e.lockRef.current], (e.shards || []).map(dh), !0).filter(
            Boolean,
          );
          return (
            v.forEach(function (b) {
              return b.classList.add("allow-interactivity-".concat(o));
            }),
            function () {
              (document.body.classList.remove("block-interactivity-".concat(o)),
                v.forEach(function (b) {
                  return b.classList.remove("allow-interactivity-".concat(o));
                }));
            }
          );
        }
      },
      [e.inert, e.lockRef.current, e.shards],
    ));
  var l = p.useCallback(function (v, b) {
      if (
        ("touches" in v && v.touches.length === 2) ||
        (v.type === "wheel" && v.ctrlKey)
      )
        return !i.current.allowPinchZoom;
      var m = rl(v),
        h = n.current,
        y = "deltaX" in v ? v.deltaX : h[0] - m[0],
        w = "deltaY" in v ? v.deltaY : h[1] - m[1],
        C,
        R = v.target,
        E = Math.abs(y) > Math.abs(w) ? "h" : "v";
      if ("touches" in v && E === "h" && R.type === "range") return !1;
      var A = window.getSelection(),
        O = A && A.anchorNode,
        N = O ? O === R || O.contains(R) : !1;
      if (N) return !1;
      var B = uh(E, R);
      if (!B) return !0;
      if ((B ? (C = E) : ((C = E === "v" ? "h" : "v"), (B = uh(E, R))), !B))
        return !1;
      if (
        (!a.current && "changedTouches" in v && (y || w) && (a.current = C), !C)
      )
        return !0;
      var z = a.current || C;
      return HT(z, b, v, z === "h" ? y : w);
    }, []),
    s = p.useCallback(function (v) {
      var b = v;
      if (!(!so.length || so[so.length - 1] !== r)) {
        var m = "deltaY" in b ? fh(b) : rl(b),
          h = t.current.filter(function (C) {
            return (
              C.name === b.type &&
              (C.target === b.target || b.target === C.shadowParent) &&
              PT(C.delta, m)
            );
          })[0];
        if (h && h.should) {
          b.cancelable && b.preventDefault();
          return;
        }
        if (!h) {
          var y = (i.current.shards || [])
              .map(dh)
              .filter(Boolean)
              .filter(function (C) {
                return C.contains(b.target);
              }),
            w = y.length > 0 ? l(b, y[0]) : !i.current.noIsolation;
          w && b.cancelable && b.preventDefault();
        }
      }
    }, []),
    c = p.useCallback(function (v, b, m, h) {
      var y = { name: v, delta: b, target: m, should: h, shadowParent: YT(m) };
      (t.current.push(y),
        setTimeout(function () {
          t.current = t.current.filter(function (w) {
            return w !== y;
          });
        }, 1));
    }, []),
    f = p.useCallback(function (v) {
      ((n.current = rl(v)), (a.current = void 0));
    }, []),
    u = p.useCallback(function (v) {
      c(v.type, fh(v), v.target, l(v, e.lockRef.current));
    }, []),
    d = p.useCallback(function (v) {
      c(v.type, rl(v), v.target, l(v, e.lockRef.current));
    }, []);
  p.useEffect(function () {
    return (
      so.push(r),
      e.setCallbacks({
        onScrollCapture: u,
        onWheelCapture: u,
        onTouchMoveCapture: d,
      }),
      document.addEventListener("wheel", s, lo),
      document.addEventListener("touchmove", s, lo),
      document.addEventListener("touchstart", f, lo),
      function () {
        ((so = so.filter(function (v) {
          return v !== r;
        })),
          document.removeEventListener("wheel", s, lo),
          document.removeEventListener("touchmove", s, lo),
          document.removeEventListener("touchstart", f, lo));
      }
    );
  }, []);
  var g = e.removeScrollBar,
    S = e.inert;
  return p.createElement(
    p.Fragment,
    null,
    S ? p.createElement(r, { styles: VT(o) }) : null,
    g
      ? p.createElement(NT, { noRelative: e.noRelative, gapMode: e.gapMode })
      : null,
  );
}
function YT(e) {
  for (var t = null; e !== null; )
    (e instanceof ShadowRoot && ((t = e.host), (e = e.host)),
      (e = e.parentNode));
  return t;
}
const FT = bT(Qb, GT);
var Ud = p.forwardRef(function (e, t) {
  return p.createElement(Ws, an({}, e, { ref: t, sideCar: FT }));
});
Ud.classNames = Ws.classNames;
function Fk({ className: e, ...t }) {
  return x.jsx("textarea", {
    "data-slot": "textarea",
    className: oe(
      "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      e,
    ),
    ...t,
  });
}
function KT(e, t) {
  return p.useReducer((n, a) => t[n][a] ?? n, e);
}
var bt = (e) => {
  const { present: t, children: n } = e,
    a = qT(t),
    o =
      typeof n == "function" ? n({ present: a.isPresent }) : p.Children.only(n),
    r = Ae(a.ref, XT(o));
  return typeof n == "function" || a.isPresent
    ? p.cloneElement(o, { ref: r })
    : null;
};
bt.displayName = "Presence";
function qT(e) {
  const [t, n] = p.useState(),
    a = p.useRef(null),
    o = p.useRef(e),
    r = p.useRef("none"),
    i = e ? "mounted" : "unmounted",
    [l, s] = KT(i, {
      mounted: { UNMOUNT: "unmounted", ANIMATION_OUT: "unmountSuspended" },
      unmountSuspended: { MOUNT: "mounted", ANIMATION_END: "unmounted" },
      unmounted: { MOUNT: "mounted" },
    });
  return (
    p.useEffect(() => {
      const c = il(a.current);
      r.current = l === "mounted" ? c : "none";
    }, [l]),
    Bn(() => {
      const c = a.current,
        f = o.current;
      if (f !== e) {
        const d = r.current,
          g = il(c);
        (e
          ? s("MOUNT")
          : g === "none" || (c == null ? void 0 : c.display) === "none"
            ? s("UNMOUNT")
            : s(f && d !== g ? "ANIMATION_OUT" : "UNMOUNT"),
          (o.current = e));
      }
    }, [e, s]),
    Bn(() => {
      if (t) {
        let c;
        const f = t.ownerDocument.defaultView ?? window,
          u = (g) => {
            const v = il(a.current).includes(CSS.escape(g.animationName));
            if (g.target === t && v && (s("ANIMATION_END"), !o.current)) {
              const b = t.style.animationFillMode;
              ((t.style.animationFillMode = "forwards"),
                (c = f.setTimeout(() => {
                  t.style.animationFillMode === "forwards" &&
                    (t.style.animationFillMode = b);
                })));
            }
          },
          d = (g) => {
            g.target === t && (r.current = il(a.current));
          };
        return (
          t.addEventListener("animationstart", d),
          t.addEventListener("animationcancel", u),
          t.addEventListener("animationend", u),
          () => {
            (f.clearTimeout(c),
              t.removeEventListener("animationstart", d),
              t.removeEventListener("animationcancel", u),
              t.removeEventListener("animationend", u));
          }
        );
      } else s("ANIMATION_END");
    }, [t, s]),
    {
      isPresent: ["mounted", "unmountSuspended"].includes(l),
      ref: p.useCallback((c) => {
        ((a.current = c ? getComputedStyle(c) : null), n(c));
      }, []),
    }
  );
}
function il(e) {
  return (e == null ? void 0 : e.animationName) || "none";
}
function XT(e) {
  var a, o;
  let t =
      (a = Object.getOwnPropertyDescriptor(e.props, "ref")) == null
        ? void 0
        : a.get,
    n = t && "isReactWarning" in t && t.isReactWarning;
  return n
    ? e.ref
    : ((t =
        (o = Object.getOwnPropertyDescriptor(e, "ref")) == null
          ? void 0
          : o.get),
      (n = t && "isReactWarning" in t && t.isReactWarning),
      n ? e.props.ref : e.props.ref || e.ref);
}
var ec = "Dialog",
  [t0, Kk] = wa(ec),
  [$T, tn] = t0(ec),
  n0 = (e) => {
    const {
        __scopeDialog: t,
        children: n,
        open: a,
        defaultOpen: o,
        onOpenChange: r,
        modal: i = !0,
      } = e,
      l = p.useRef(null),
      s = p.useRef(null),
      [c, f] = Js({ prop: a, defaultProp: o ?? !1, onChange: r, caller: ec });
    return x.jsx($T, {
      scope: t,
      triggerRef: l,
      contentRef: s,
      contentId: Ba(),
      titleId: Ba(),
      descriptionId: Ba(),
      open: c,
      onOpenChange: f,
      onOpenToggle: p.useCallback(() => f((u) => !u), [f]),
      modal: i,
      children: n,
    });
  };
n0.displayName = ec;
var a0 = "DialogTrigger",
  o0 = p.forwardRef((e, t) => {
    const { __scopeDialog: n, ...a } = e,
      o = tn(a0, n),
      r = Ae(t, o.triggerRef);
    return x.jsx(ye.button, {
      type: "button",
      "aria-haspopup": "dialog",
      "aria-expanded": o.open,
      "aria-controls": o.contentId,
      "data-state": Vd(o.open),
      ...a,
      ref: r,
      onClick: F(e.onClick, o.onOpenToggle),
    });
  });
o0.displayName = a0;
var Hd = "DialogPortal",
  [QT, r0] = t0(Hd, { forceMount: void 0 }),
  i0 = (e) => {
    const { __scopeDialog: t, forceMount: n, children: a, container: o } = e,
      r = tn(Hd, t);
    return x.jsx(QT, {
      scope: t,
      forceMount: n,
      children: p.Children.map(a, (i) =>
        x.jsx(bt, {
          present: n || r.open,
          children: x.jsx(Zs, { asChild: !0, container: o, children: i }),
        }),
      ),
    });
  };
i0.displayName = Hd;
var hs = "DialogOverlay",
  l0 = p.forwardRef((e, t) => {
    const n = r0(hs, e.__scopeDialog),
      { forceMount: a = n.forceMount, ...o } = e,
      r = tn(hs, e.__scopeDialog);
    return r.modal
      ? x.jsx(bt, {
          present: a || r.open,
          children: x.jsx(JT, { ...o, ref: t }),
        })
      : null;
  });
l0.displayName = hs;
var ZT = ii("DialogOverlay.RemoveScroll"),
  JT = p.forwardRef((e, t) => {
    const { __scopeDialog: n, ...a } = e,
      o = tn(hs, n);
    return x.jsx(Ud, {
      as: ZT,
      allowPinchZoom: !0,
      shards: [o.contentRef],
      children: x.jsx(ye.div, {
        "data-state": Vd(o.open),
        ...a,
        ref: t,
        style: { pointerEvents: "auto", ...a.style },
      }),
    });
  }),
  Ya = "DialogContent",
  s0 = p.forwardRef((e, t) => {
    const n = r0(Ya, e.__scopeDialog),
      { forceMount: a = n.forceMount, ...o } = e,
      r = tn(Ya, e.__scopeDialog);
    return x.jsx(bt, {
      present: a || r.open,
      children: r.modal
        ? x.jsx(WT, { ...o, ref: t })
        : x.jsx(eR, { ...o, ref: t }),
    });
  });
s0.displayName = Ya;
var WT = p.forwardRef((e, t) => {
    const n = tn(Ya, e.__scopeDialog),
      a = p.useRef(null),
      o = Ae(t, n.contentRef, a);
    return (
      p.useEffect(() => {
        const r = a.current;
        if (r) return qb(r);
      }, []),
      x.jsx(c0, {
        ...e,
        ref: o,
        trapFocus: n.open,
        disableOutsidePointerEvents: !0,
        onCloseAutoFocus: F(e.onCloseAutoFocus, (r) => {
          var i;
          (r.preventDefault(), (i = n.triggerRef.current) == null || i.focus());
        }),
        onPointerDownOutside: F(e.onPointerDownOutside, (r) => {
          const i = r.detail.originalEvent,
            l = i.button === 0 && i.ctrlKey === !0;
          (i.button === 2 || l) && r.preventDefault();
        }),
        onFocusOutside: F(e.onFocusOutside, (r) => r.preventDefault()),
      })
    );
  }),
  eR = p.forwardRef((e, t) => {
    const n = tn(Ya, e.__scopeDialog),
      a = p.useRef(!1),
      o = p.useRef(!1);
    return x.jsx(c0, {
      ...e,
      ref: t,
      trapFocus: !1,
      disableOutsidePointerEvents: !1,
      onCloseAutoFocus: (r) => {
        var i, l;
        ((i = e.onCloseAutoFocus) == null || i.call(e, r),
          r.defaultPrevented ||
            (a.current || (l = n.triggerRef.current) == null || l.focus(),
            r.preventDefault()),
          (a.current = !1),
          (o.current = !1));
      },
      onInteractOutside: (r) => {
        var s, c;
        ((s = e.onInteractOutside) == null || s.call(e, r),
          r.defaultPrevented ||
            ((a.current = !0),
            r.detail.originalEvent.type === "pointerdown" && (o.current = !0)));
        const i = r.target;
        (((c = n.triggerRef.current) == null ? void 0 : c.contains(i)) &&
          r.preventDefault(),
          r.detail.originalEvent.type === "focusin" &&
            o.current &&
            r.preventDefault());
      },
    });
  }),
  c0 = p.forwardRef((e, t) => {
    const {
        __scopeDialog: n,
        trapFocus: a,
        onOpenAutoFocus: o,
        onCloseAutoFocus: r,
        ...i
      } = e,
      l = tn(Ya, n),
      s = p.useRef(null),
      c = Ae(t, s);
    return (
      yb(),
      x.jsxs(x.Fragment, {
        children: [
          x.jsx(Dd, {
            asChild: !0,
            loop: !0,
            trapped: a,
            onMountAutoFocus: o,
            onUnmountAutoFocus: r,
            children: x.jsx(Fs, {
              role: "dialog",
              id: l.contentId,
              "aria-describedby": l.descriptionId,
              "aria-labelledby": l.titleId,
              "data-state": Vd(l.open),
              ...i,
              ref: c,
              onDismiss: () => l.onOpenChange(!1),
            }),
          }),
          x.jsxs(x.Fragment, {
            children: [
              x.jsx(tR, { titleId: l.titleId }),
              x.jsx(aR, { contentRef: s, descriptionId: l.descriptionId }),
            ],
          }),
        ],
      })
    );
  }),
  Pd = "DialogTitle",
  u0 = p.forwardRef((e, t) => {
    const { __scopeDialog: n, ...a } = e,
      o = tn(Pd, n);
    return x.jsx(ye.h2, { id: o.titleId, ...a, ref: t });
  });
u0.displayName = Pd;
var f0 = "DialogDescription",
  d0 = p.forwardRef((e, t) => {
    const { __scopeDialog: n, ...a } = e,
      o = tn(f0, n);
    return x.jsx(ye.p, { id: o.descriptionId, ...a, ref: t });
  });
d0.displayName = f0;
var m0 = "DialogClose",
  g0 = p.forwardRef((e, t) => {
    const { __scopeDialog: n, ...a } = e,
      o = tn(m0, n);
    return x.jsx(ye.button, {
      type: "button",
      ...a,
      ref: t,
      onClick: F(e.onClick, () => o.onOpenChange(!1)),
    });
  });
g0.displayName = m0;
function Vd(e) {
  return e ? "open" : "closed";
}
var h0 = "DialogTitleWarning",
  [qk, p0] = cC(h0, { contentName: Ya, titleName: Pd, docsSlug: "dialog" }),
  tR = ({ titleId: e }) => {
    const t = p0(h0),
      n = `\`${t.contentName}\` requires a \`${t.titleName}\` for the component to be accessible for screen reader users.

If you want to hide the \`${t.titleName}\`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/${t.docsSlug}`;
    return (
      p.useEffect(() => {
        if (e) {
          const a = document.getElementById(e);
        }
      }, [n, e]),
      null
    );
  },
  nR = "DialogDescriptionWarning",
  aR = ({ contentRef: e, descriptionId: t }) => {
    const a = `Warning: Missing \`Description\` or \`aria-describedby={undefined}\` for {${p0(nR).contentName}}.`;
    return (
      p.useEffect(() => {
        var r;
        const o =
          (r = e.current) == null ? void 0 : r.getAttribute("aria-describedby");
        if (t && o) {
          const i = document.getElementById(t);
        }
      }, [a, e, t]),
      null
    );
  },
  oR = n0,
  Xk = o0,
  rR = i0,
  iR = l0,
  lR = s0,
  sR = u0,
  cR = d0,
  uR = g0,
  iu = "rovingFocusGroup.onEntryFocus",
  fR = { bubbles: !1, cancelable: !0 },
  Mi = "RovingFocusGroup",
  [gf, v0, dR] = gb(Mi),
  [mR, y0] = wa(Mi, [dR]),
  [gR, hR] = mR(Mi),
  b0 = p.forwardRef((e, t) =>
    x.jsx(gf.Provider, {
      scope: e.__scopeRovingFocusGroup,
      children: x.jsx(gf.Slot, {
        scope: e.__scopeRovingFocusGroup,
        children: x.jsx(pR, { ...e, ref: t }),
      }),
    }),
  );
b0.displayName = Mi;
var pR = p.forwardRef((e, t) => {
    const {
        __scopeRovingFocusGroup: n,
        orientation: a,
        loop: o = !1,
        dir: r,
        currentTabStopId: i,
        defaultCurrentTabStopId: l,
        onCurrentTabStopIdChange: s,
        onEntryFocus: c,
        preventScrollOnEntryFocus: f = !1,
        ...u
      } = e,
      d = p.useRef(null),
      g = Ae(t, d),
      S = Md(r),
      [v, b] = Js({ prop: i, defaultProp: l ?? null, onChange: s, caller: Mi }),
      [m, h] = p.useState(!1),
      y = ot(c),
      w = v0(n),
      C = p.useRef(!1),
      [R, E] = p.useState(0);
    return (
      p.useEffect(() => {
        const A = d.current;
        if (A)
          return (
            A.addEventListener(iu, y),
            () => A.removeEventListener(iu, y)
          );
      }, [y]),
      x.jsx(gR, {
        scope: n,
        orientation: a,
        dir: S,
        loop: o,
        currentTabStopId: v,
        onItemFocus: p.useCallback((A) => b(A), [b]),
        onItemShiftTab: p.useCallback(() => h(!0), []),
        onFocusableItemAdd: p.useCallback(() => E((A) => A + 1), []),
        onFocusableItemRemove: p.useCallback(() => E((A) => A - 1), []),
        children: x.jsx(ye.div, {
          tabIndex: m || R === 0 ? -1 : 0,
          "data-orientation": a,
          ...u,
          ref: g,
          style: { outline: "none", ...e.style },
          onMouseDown: F(e.onMouseDown, () => {
            C.current = !0;
          }),
          onFocus: F(e.onFocus, (A) => {
            const O = !C.current;
            if (A.target === A.currentTarget && O && !m) {
              const N = new CustomEvent(iu, fR);
              if ((A.currentTarget.dispatchEvent(N), !N.defaultPrevented)) {
                const B = w().filter((M) => M.focusable),
                  z = B.find((M) => M.active),
                  G = B.find((M) => M.id === v),
                  Y = [z, G, ...B].filter(Boolean).map((M) => M.ref.current);
                x0(Y, f);
              }
            }
            C.current = !1;
          }),
          onBlur: F(e.onBlur, () => h(!1)),
        }),
      })
    );
  }),
  S0 = "RovingFocusGroupItem",
  w0 = p.forwardRef((e, t) => {
    const {
        __scopeRovingFocusGroup: n,
        focusable: a = !0,
        active: o = !1,
        tabStopId: r,
        children: i,
        ...l
      } = e,
      s = Ba(),
      c = r || s,
      f = hR(S0, n),
      u = f.currentTabStopId === c,
      d = v0(n),
      {
        onFocusableItemAdd: g,
        onFocusableItemRemove: S,
        currentTabStopId: v,
      } = f;
    return (
      p.useEffect(() => {
        if (a) return (g(), () => S());
      }, [a, g, S]),
      x.jsx(gf.ItemSlot, {
        scope: n,
        id: c,
        focusable: a,
        active: o,
        children: x.jsx(ye.span, {
          tabIndex: u ? 0 : -1,
          "data-orientation": f.orientation,
          ...l,
          ref: t,
          onMouseDown: F(e.onMouseDown, (b) => {
            a ? f.onItemFocus(c) : b.preventDefault();
          }),
          onFocus: F(e.onFocus, () => f.onItemFocus(c)),
          onKeyDown: F(e.onKeyDown, (b) => {
            if (b.key === "Tab" && b.shiftKey) {
              f.onItemShiftTab();
              return;
            }
            if (b.target !== b.currentTarget) return;
            const m = bR(b, f.orientation, f.dir);
            if (m !== void 0) {
              if (b.metaKey || b.ctrlKey || b.altKey || b.shiftKey) return;
              b.preventDefault();
              let y = d()
                .filter((w) => w.focusable)
                .map((w) => w.ref.current);
              if (m === "last") y.reverse();
              else if (m === "prev" || m === "next") {
                m === "prev" && y.reverse();
                const w = y.indexOf(b.currentTarget);
                y = f.loop ? SR(y, w + 1) : y.slice(w + 1);
              }
              setTimeout(() => x0(y));
            }
          }),
          children:
            typeof i == "function"
              ? i({ isCurrentTabStop: u, hasTabStop: v != null })
              : i,
        }),
      })
    );
  });
w0.displayName = S0;
var vR = {
  ArrowLeft: "prev",
  ArrowUp: "prev",
  ArrowRight: "next",
  ArrowDown: "next",
  PageUp: "first",
  Home: "first",
  PageDown: "last",
  End: "last",
};
function yR(e, t) {
  return t !== "rtl"
    ? e
    : e === "ArrowLeft"
      ? "ArrowRight"
      : e === "ArrowRight"
        ? "ArrowLeft"
        : e;
}
function bR(e, t, n) {
  const a = yR(e.key, n);
  if (
    !(t === "vertical" && ["ArrowLeft", "ArrowRight"].includes(a)) &&
    !(t === "horizontal" && ["ArrowUp", "ArrowDown"].includes(a))
  )
    return vR[a];
}
function x0(e, t = !1) {
  const n = document.activeElement;
  for (const a of e)
    if (
      a === n ||
      (a.focus({ preventScroll: t }), document.activeElement !== n)
    )
      return;
}
function SR(e, t) {
  return e.map((n, a) => e[(t + a) % e.length]);
}
var wR = b0,
  xR = w0,
  hf = ["Enter", " "],
  ER = ["ArrowDown", "PageUp", "Home"],
  E0 = ["ArrowUp", "PageDown", "End"],
  CR = [...ER, ...E0],
  AR = { ltr: [...hf, "ArrowRight"], rtl: [...hf, "ArrowLeft"] },
  TR = { ltr: ["ArrowLeft"], rtl: ["ArrowRight"] },
  Di = "Menu",
  [ci, RR, MR] = gb(Di),
  [Za, C0] = wa(Di, [MR, Qs, y0]),
  tc = Qs(),
  A0 = y0(),
  [DR, Ja] = Za(Di),
  [OR, Oi] = Za(Di),
  T0 = (e) => {
    const {
        __scopeMenu: t,
        open: n = !1,
        children: a,
        dir: o,
        onOpenChange: r,
        modal: i = !0,
      } = e,
      l = tc(t),
      [s, c] = p.useState(null),
      f = p.useRef(!1),
      u = ot(r),
      d = Md(o);
    return (
      p.useEffect(() => {
        const g = () => {
            ((f.current = !0),
              document.addEventListener("pointerdown", S, {
                capture: !0,
                once: !0,
              }),
              document.addEventListener("pointermove", S, {
                capture: !0,
                once: !0,
              }));
          },
          S = () => (f.current = !1);
        return (
          document.addEventListener("keydown", g, { capture: !0 }),
          () => {
            (document.removeEventListener("keydown", g, { capture: !0 }),
              document.removeEventListener("pointerdown", S, { capture: !0 }),
              document.removeEventListener("pointermove", S, { capture: !0 }));
          }
        );
      }, []),
      x.jsx(Vb, {
        ...l,
        children: x.jsx(DR, {
          scope: t,
          open: n,
          onOpenChange: u,
          content: s,
          onContentChange: c,
          children: x.jsx(OR, {
            scope: t,
            onClose: p.useCallback(() => u(!1), [u]),
            isUsingKeyboardRef: f,
            dir: d,
            modal: i,
            children: a,
          }),
        }),
      })
    );
  };
T0.displayName = Di;
var kR = "MenuAnchor",
  Id = p.forwardRef((e, t) => {
    const { __scopeMenu: n, ...a } = e,
      o = tc(n);
    return x.jsx(Ib, { ...o, ...a, ref: t });
  });
Id.displayName = kR;
var Gd = "MenuPortal",
  [NR, R0] = Za(Gd, { forceMount: void 0 }),
  M0 = (e) => {
    const { __scopeMenu: t, forceMount: n, children: a, container: o } = e,
      r = Ja(Gd, t);
    return x.jsx(NR, {
      scope: t,
      forceMount: n,
      children: x.jsx(bt, {
        present: n || r.open,
        children: x.jsx(Zs, { asChild: !0, container: o, children: a }),
      }),
    });
  };
M0.displayName = Gd;
var Ft = "MenuContent",
  [_R, Yd] = Za(Ft),
  D0 = p.forwardRef((e, t) => {
    const n = R0(Ft, e.__scopeMenu),
      { forceMount: a = n.forceMount, ...o } = e,
      r = Ja(Ft, e.__scopeMenu),
      i = Oi(Ft, e.__scopeMenu);
    return x.jsx(ci.Provider, {
      scope: e.__scopeMenu,
      children: x.jsx(bt, {
        present: a || r.open,
        children: x.jsx(ci.Slot, {
          scope: e.__scopeMenu,
          children: i.modal
            ? x.jsx(LR, { ...o, ref: t })
            : x.jsx(zR, { ...o, ref: t }),
        }),
      }),
    });
  }),
  LR = p.forwardRef((e, t) => {
    const n = Ja(Ft, e.__scopeMenu),
      a = p.useRef(null),
      o = Ae(t, a);
    return (
      p.useEffect(() => {
        const r = a.current;
        if (r) return qb(r);
      }, []),
      x.jsx(Fd, {
        ...e,
        ref: o,
        trapFocus: n.open,
        disableOutsidePointerEvents: n.open,
        disableOutsideScroll: !0,
        onFocusOutside: F(e.onFocusOutside, (r) => r.preventDefault(), {
          checkForDefaultPrevented: !1,
        }),
        onDismiss: () => n.onOpenChange(!1),
      })
    );
  }),
  zR = p.forwardRef((e, t) => {
    const n = Ja(Ft, e.__scopeMenu);
    return x.jsx(Fd, {
      ...e,
      ref: t,
      trapFocus: !1,
      disableOutsidePointerEvents: !1,
      disableOutsideScroll: !1,
      onDismiss: () => n.onOpenChange(!1),
    });
  }),
  jR = ii("MenuContent.ScrollLock"),
  Fd = p.forwardRef((e, t) => {
    const {
        __scopeMenu: n,
        loop: a = !1,
        trapFocus: o,
        onOpenAutoFocus: r,
        onCloseAutoFocus: i,
        disableOutsidePointerEvents: l,
        onEntryFocus: s,
        onEscapeKeyDown: c,
        onPointerDownOutside: f,
        onFocusOutside: u,
        onInteractOutside: d,
        onDismiss: g,
        disableOutsideScroll: S,
        ...v
      } = e,
      b = Ja(Ft, n),
      m = Oi(Ft, n),
      h = tc(n),
      y = A0(n),
      w = RR(n),
      [C, R] = p.useState(null),
      E = p.useRef(null),
      A = Ae(t, E, b.onContentChange),
      O = p.useRef(0),
      N = p.useRef(""),
      B = p.useRef(0),
      z = p.useRef(null),
      G = p.useRef("right"),
      V = p.useRef(0),
      Y = S ? Ud : p.Fragment,
      M = S ? { as: jR, allowPinchZoom: !0 } : void 0,
      _ = (D) => {
        var Q, W;
        const j = N.current + D,
          q = w().filter((pe) => !pe.disabled),
          le = document.activeElement,
          U =
            (Q = q.find((pe) => pe.ref.current === le)) == null
              ? void 0
              : Q.textValue,
          I = q.map((pe) => pe.textValue),
          X = XR(I, j, U),
          fe =
            (W = q.find((pe) => pe.textValue === X)) == null
              ? void 0
              : W.ref.current;
        ((function pe(be) {
          ((N.current = be),
            window.clearTimeout(O.current),
            be !== "" && (O.current = window.setTimeout(() => pe(""), 1e3)));
        })(j),
          fe && setTimeout(() => fe.focus()));
      };
    (p.useEffect(() => () => window.clearTimeout(O.current), []), yb());
    const T = p.useCallback((D) => {
      var q, le;
      return (
        G.current === ((q = z.current) == null ? void 0 : q.side) &&
        QR(D, (le = z.current) == null ? void 0 : le.area)
      );
    }, []);
    return x.jsx(_R, {
      scope: n,
      searchRef: N,
      onItemEnter: p.useCallback(
        (D) => {
          T(D) && D.preventDefault();
        },
        [T],
      ),
      onItemLeave: p.useCallback(
        (D) => {
          var j;
          T(D) || ((j = E.current) == null || j.focus(), R(null));
        },
        [T],
      ),
      onTriggerLeave: p.useCallback(
        (D) => {
          T(D) && D.preventDefault();
        },
        [T],
      ),
      pointerGraceTimerRef: B,
      onPointerGraceIntentChange: p.useCallback((D) => {
        z.current = D;
      }, []),
      children: x.jsx(Y, {
        ...M,
        children: x.jsx(Dd, {
          asChild: !0,
          trapped: o,
          onMountAutoFocus: F(r, (D) => {
            var j;
            (D.preventDefault(),
              (j = E.current) == null || j.focus({ preventScroll: !0 }));
          }),
          onUnmountAutoFocus: i,
          children: x.jsx(Fs, {
            asChild: !0,
            disableOutsidePointerEvents: l,
            onEscapeKeyDown: c,
            onPointerDownOutside: f,
            onFocusOutside: u,
            onInteractOutside: d,
            onDismiss: g,
            children: x.jsx(wR, {
              asChild: !0,
              ...y,
              dir: m.dir,
              orientation: "vertical",
              loop: a,
              currentTabStopId: C,
              onCurrentTabStopIdChange: R,
              onEntryFocus: F(s, (D) => {
                m.isUsingKeyboardRef.current || D.preventDefault();
              }),
              preventScrollOnEntryFocus: !0,
              children: x.jsx(Gb, {
                role: "menu",
                "aria-orientation": "vertical",
                "data-state": F0(b.open),
                "data-radix-menu-content": "",
                dir: m.dir,
                ...h,
                ...v,
                ref: A,
                style: { outline: "none", ...v.style },
                onKeyDown: F(v.onKeyDown, (D) => {
                  const q =
                      D.target.closest("[data-radix-menu-content]") ===
                      D.currentTarget,
                    le = D.ctrlKey || D.altKey || D.metaKey,
                    U = D.key.length === 1;
                  q &&
                    (D.key === "Tab" && D.preventDefault(),
                    !le && U && _(D.key));
                  const I = E.current;
                  if (D.target !== I || !CR.includes(D.key)) return;
                  D.preventDefault();
                  const fe = w()
                    .filter((Q) => !Q.disabled)
                    .map((Q) => Q.ref.current);
                  (E0.includes(D.key) && fe.reverse(), KR(fe));
                }),
                onBlur: F(e.onBlur, (D) => {
                  D.currentTarget.contains(D.target) ||
                    (window.clearTimeout(O.current), (N.current = ""));
                }),
                onPointerMove: F(
                  e.onPointerMove,
                  ui((D) => {
                    const j = D.target,
                      q = V.current !== D.clientX;
                    if (D.currentTarget.contains(j) && q) {
                      const le = D.clientX > V.current ? "right" : "left";
                      ((G.current = le), (V.current = D.clientX));
                    }
                  }),
                ),
              }),
            }),
          }),
        }),
      }),
    });
  });
D0.displayName = Ft;
var BR = "MenuGroup",
  Kd = p.forwardRef((e, t) => {
    const { __scopeMenu: n, ...a } = e;
    return x.jsx(ye.div, { role: "group", ...a, ref: t });
  });
Kd.displayName = BR;
var UR = "MenuLabel",
  O0 = p.forwardRef((e, t) => {
    const { __scopeMenu: n, ...a } = e;
    return x.jsx(ye.div, { ...a, ref: t });
  });
O0.displayName = UR;
var ps = "MenuItem",
  mh = "menu.itemSelect",
  nc = p.forwardRef((e, t) => {
    const { disabled: n = !1, onSelect: a, ...o } = e,
      r = p.useRef(null),
      i = Oi(ps, e.__scopeMenu),
      l = Yd(ps, e.__scopeMenu),
      s = Ae(t, r),
      c = p.useRef(!1),
      f = () => {
        const u = r.current;
        if (!n && u) {
          const d = new CustomEvent(mh, { bubbles: !0, cancelable: !0 });
          (u.addEventListener(mh, (g) => (a == null ? void 0 : a(g)), {
            once: !0,
          }),
            hb(u, d),
            d.defaultPrevented ? (c.current = !1) : i.onClose());
        }
      };
    return x.jsx(k0, {
      ...o,
      ref: s,
      disabled: n,
      onClick: F(e.onClick, f),
      onPointerDown: (u) => {
        var d;
        ((d = e.onPointerDown) == null || d.call(e, u), (c.current = !0));
      },
      onPointerUp: F(e.onPointerUp, (u) => {
        var d;
        c.current || (d = u.currentTarget) == null || d.click();
      }),
      onKeyDown: F(e.onKeyDown, (u) => {
        const d = l.searchRef.current !== "";
        n ||
          (d && u.key === " ") ||
          (hf.includes(u.key) && (u.currentTarget.click(), u.preventDefault()));
      }),
    });
  });
nc.displayName = ps;
var k0 = p.forwardRef((e, t) => {
    const { __scopeMenu: n, disabled: a = !1, textValue: o, ...r } = e,
      i = Yd(ps, n),
      l = A0(n),
      s = p.useRef(null),
      c = Ae(t, s),
      [f, u] = p.useState(!1),
      [d, g] = p.useState("");
    return (
      p.useEffect(() => {
        const S = s.current;
        S && g((S.textContent ?? "").trim());
      }, [r.children]),
      x.jsx(ci.ItemSlot, {
        scope: n,
        disabled: a,
        textValue: o ?? d,
        children: x.jsx(xR, {
          asChild: !0,
          ...l,
          focusable: !a,
          children: x.jsx(ye.div, {
            role: "menuitem",
            "data-highlighted": f ? "" : void 0,
            "aria-disabled": a || void 0,
            "data-disabled": a ? "" : void 0,
            ...r,
            ref: c,
            onPointerMove: F(
              e.onPointerMove,
              ui((S) => {
                a
                  ? i.onItemLeave(S)
                  : (i.onItemEnter(S),
                    S.defaultPrevented ||
                      S.currentTarget.focus({ preventScroll: !0 }));
              }),
            ),
            onPointerLeave: F(
              e.onPointerLeave,
              ui((S) => i.onItemLeave(S)),
            ),
            onFocus: F(e.onFocus, () => u(!0)),
            onBlur: F(e.onBlur, () => u(!1)),
          }),
        }),
      })
    );
  }),
  HR = "MenuCheckboxItem",
  N0 = p.forwardRef((e, t) => {
    const { checked: n = !1, onCheckedChange: a, ...o } = e;
    return x.jsx(B0, {
      scope: e.__scopeMenu,
      checked: n,
      children: x.jsx(nc, {
        role: "menuitemcheckbox",
        "aria-checked": vs(n) ? "mixed" : n,
        ...o,
        ref: t,
        "data-state": Xd(n),
        onSelect: F(
          o.onSelect,
          () => (a == null ? void 0 : a(vs(n) ? !0 : !n)),
          { checkForDefaultPrevented: !1 },
        ),
      }),
    });
  });
N0.displayName = HR;
var _0 = "MenuRadioGroup",
  [PR, VR] = Za(_0, { value: void 0, onValueChange: () => {} }),
  L0 = p.forwardRef((e, t) => {
    const { value: n, onValueChange: a, ...o } = e,
      r = ot(a);
    return x.jsx(PR, {
      scope: e.__scopeMenu,
      value: n,
      onValueChange: r,
      children: x.jsx(Kd, { ...o, ref: t }),
    });
  });
L0.displayName = _0;
var z0 = "MenuRadioItem",
  j0 = p.forwardRef((e, t) => {
    const { value: n, ...a } = e,
      o = VR(z0, e.__scopeMenu),
      r = n === o.value;
    return x.jsx(B0, {
      scope: e.__scopeMenu,
      checked: r,
      children: x.jsx(nc, {
        role: "menuitemradio",
        "aria-checked": r,
        ...a,
        ref: t,
        "data-state": Xd(r),
        onSelect: F(
          a.onSelect,
          () => {
            var i;
            return (i = o.onValueChange) == null ? void 0 : i.call(o, n);
          },
          { checkForDefaultPrevented: !1 },
        ),
      }),
    });
  });
j0.displayName = z0;
var qd = "MenuItemIndicator",
  [B0, IR] = Za(qd, { checked: !1 }),
  U0 = p.forwardRef((e, t) => {
    const { __scopeMenu: n, forceMount: a, ...o } = e,
      r = IR(qd, n);
    return x.jsx(bt, {
      present: a || vs(r.checked) || r.checked === !0,
      children: x.jsx(ye.span, { ...o, ref: t, "data-state": Xd(r.checked) }),
    });
  });
U0.displayName = qd;
var GR = "MenuSeparator",
  H0 = p.forwardRef((e, t) => {
    const { __scopeMenu: n, ...a } = e;
    return x.jsx(ye.div, {
      role: "separator",
      "aria-orientation": "horizontal",
      ...a,
      ref: t,
    });
  });
H0.displayName = GR;
var YR = "MenuArrow",
  P0 = p.forwardRef((e, t) => {
    const { __scopeMenu: n, ...a } = e,
      o = tc(n);
    return x.jsx(Yb, { ...o, ...a, ref: t });
  });
P0.displayName = YR;
var FR = "MenuSub",
  [$k, V0] = Za(FR),
  Mr = "MenuSubTrigger",
  I0 = p.forwardRef((e, t) => {
    const n = Ja(Mr, e.__scopeMenu),
      a = Oi(Mr, e.__scopeMenu),
      o = V0(Mr, e.__scopeMenu),
      r = Yd(Mr, e.__scopeMenu),
      i = p.useRef(null),
      { pointerGraceTimerRef: l, onPointerGraceIntentChange: s } = r,
      c = { __scopeMenu: e.__scopeMenu },
      f = p.useCallback(() => {
        (i.current && window.clearTimeout(i.current), (i.current = null));
      }, []);
    return (
      p.useEffect(() => f, [f]),
      p.useEffect(() => {
        const u = l.current;
        return () => {
          (window.clearTimeout(u), s(null));
        };
      }, [l, s]),
      x.jsx(Id, {
        asChild: !0,
        ...c,
        children: x.jsx(k0, {
          id: o.triggerId,
          "aria-haspopup": "menu",
          "aria-expanded": n.open,
          "aria-controls": o.contentId,
          "data-state": F0(n.open),
          ...e,
          ref: Ti(t, o.onTriggerChange),
          onClick: (u) => {
            var d;
            ((d = e.onClick) == null || d.call(e, u),
              !(e.disabled || u.defaultPrevented) &&
                (u.currentTarget.focus(), n.open || n.onOpenChange(!0)));
          },
          onPointerMove: F(
            e.onPointerMove,
            ui((u) => {
              (r.onItemEnter(u),
                !u.defaultPrevented &&
                  !e.disabled &&
                  !n.open &&
                  !i.current &&
                  (r.onPointerGraceIntentChange(null),
                  (i.current = window.setTimeout(() => {
                    (n.onOpenChange(!0), f());
                  }, 100))));
            }),
          ),
          onPointerLeave: F(
            e.onPointerLeave,
            ui((u) => {
              var g, S;
              f();
              const d =
                (g = n.content) == null ? void 0 : g.getBoundingClientRect();
              if (d) {
                const v = (S = n.content) == null ? void 0 : S.dataset.side,
                  b = v === "right",
                  m = b ? -5 : 5,
                  h = d[b ? "left" : "right"],
                  y = d[b ? "right" : "left"];
                (r.onPointerGraceIntentChange({
                  area: [
                    { x: u.clientX + m, y: u.clientY },
                    { x: h, y: d.top },
                    { x: y, y: d.top },
                    { x: y, y: d.bottom },
                    { x: h, y: d.bottom },
                  ],
                  side: v,
                }),
                  window.clearTimeout(l.current),
                  (l.current = window.setTimeout(
                    () => r.onPointerGraceIntentChange(null),
                    300,
                  )));
              } else {
                if ((r.onTriggerLeave(u), u.defaultPrevented)) return;
                r.onPointerGraceIntentChange(null);
              }
            }),
          ),
          onKeyDown: F(e.onKeyDown, (u) => {
            var g;
            const d = r.searchRef.current !== "";
            e.disabled ||
              (d && u.key === " ") ||
              (AR[a.dir].includes(u.key) &&
                (n.onOpenChange(!0),
                (g = n.content) == null || g.focus(),
                u.preventDefault()));
          }),
        }),
      })
    );
  });
I0.displayName = Mr;
var G0 = "MenuSubContent",
  Y0 = p.forwardRef((e, t) => {
    const n = R0(Ft, e.__scopeMenu),
      { forceMount: a = n.forceMount, ...o } = e,
      r = Ja(Ft, e.__scopeMenu),
      i = Oi(Ft, e.__scopeMenu),
      l = V0(G0, e.__scopeMenu),
      s = p.useRef(null),
      c = Ae(t, s);
    return x.jsx(ci.Provider, {
      scope: e.__scopeMenu,
      children: x.jsx(bt, {
        present: a || r.open,
        children: x.jsx(ci.Slot, {
          scope: e.__scopeMenu,
          children: x.jsx(Fd, {
            id: l.contentId,
            "aria-labelledby": l.triggerId,
            ...o,
            ref: c,
            align: "start",
            side: i.dir === "rtl" ? "left" : "right",
            disableOutsidePointerEvents: !1,
            disableOutsideScroll: !1,
            trapFocus: !1,
            onOpenAutoFocus: (f) => {
              var u;
              (i.isUsingKeyboardRef.current &&
                ((u = s.current) == null || u.focus()),
                f.preventDefault());
            },
            onCloseAutoFocus: (f) => f.preventDefault(),
            onFocusOutside: F(e.onFocusOutside, (f) => {
              f.target !== l.trigger && r.onOpenChange(!1);
            }),
            onEscapeKeyDown: F(e.onEscapeKeyDown, (f) => {
              (i.onClose(), f.preventDefault());
            }),
            onKeyDown: F(e.onKeyDown, (f) => {
              var g;
              const u = f.currentTarget.contains(f.target),
                d = TR[i.dir].includes(f.key);
              u &&
                d &&
                (r.onOpenChange(!1),
                (g = l.trigger) == null || g.focus(),
                f.preventDefault());
            }),
          }),
        }),
      }),
    });
  });
Y0.displayName = G0;
function F0(e) {
  return e ? "open" : "closed";
}
function vs(e) {
  return e === "indeterminate";
}
function Xd(e) {
  return vs(e) ? "indeterminate" : e ? "checked" : "unchecked";
}
function KR(e) {
  const t = document.activeElement;
  for (const n of e)
    if (n === t || (n.focus(), document.activeElement !== t)) return;
}
function qR(e, t) {
  return e.map((n, a) => e[(t + a) % e.length]);
}
function XR(e, t, n) {
  const o = t.length > 1 && Array.from(t).every((c) => c === t[0]) ? t[0] : t,
    r = n ? e.indexOf(n) : -1;
  let i = qR(e, Math.max(r, 0));
  o.length === 1 && (i = i.filter((c) => c !== n));
  const s = i.find((c) => c.toLowerCase().startsWith(o.toLowerCase()));
  return s !== n ? s : void 0;
}
function $R(e, t) {
  const { x: n, y: a } = e;
  let o = !1;
  for (let r = 0, i = t.length - 1; r < t.length; i = r++) {
    const l = t[r],
      s = t[i],
      c = l.x,
      f = l.y,
      u = s.x,
      d = s.y;
    f > a != d > a && n < ((u - c) * (a - f)) / (d - f) + c && (o = !o);
  }
  return o;
}
function QR(e, t) {
  if (!t) return !1;
  const n = { x: e.clientX, y: e.clientY };
  return $R(n, t);
}
function ui(e) {
  return (t) => (t.pointerType === "mouse" ? e(t) : void 0);
}
var ZR = T0,
  JR = Id,
  WR = M0,
  eM = D0,
  tM = Kd,
  nM = O0,
  aM = nc,
  oM = N0,
  rM = L0,
  iM = j0,
  lM = U0,
  sM = H0,
  cM = P0,
  uM = I0,
  fM = Y0,
  ac = "DropdownMenu",
  [dM] = wa(ac, [C0]),
  st = C0(),
  [mM, K0] = dM(ac),
  q0 = (e) => {
    const {
        __scopeDropdownMenu: t,
        children: n,
        dir: a,
        open: o,
        defaultOpen: r,
        onOpenChange: i,
        modal: l = !0,
      } = e,
      s = st(t),
      c = p.useRef(null),
      [f, u] = Js({ prop: o, defaultProp: r ?? !1, onChange: i, caller: ac });
    return x.jsx(mM, {
      scope: t,
      triggerId: Ba(),
      triggerRef: c,
      contentId: Ba(),
      open: f,
      onOpenChange: u,
      onOpenToggle: p.useCallback(() => u((d) => !d), [u]),
      modal: l,
      children: x.jsx(ZR, {
        ...s,
        open: f,
        onOpenChange: u,
        dir: a,
        modal: l,
        children: n,
      }),
    });
  };
q0.displayName = ac;
var X0 = "DropdownMenuTrigger",
  $0 = p.forwardRef((e, t) => {
    const { __scopeDropdownMenu: n, disabled: a = !1, ...o } = e,
      r = K0(X0, n),
      i = st(n);
    return x.jsx(JR, {
      asChild: !0,
      ...i,
      children: x.jsx(ye.button, {
        type: "button",
        id: r.triggerId,
        "aria-haspopup": "menu",
        "aria-expanded": r.open,
        "aria-controls": r.open ? r.contentId : void 0,
        "data-state": r.open ? "open" : "closed",
        "data-disabled": a ? "" : void 0,
        disabled: a,
        ...o,
        ref: Ti(t, r.triggerRef),
        onPointerDown: F(e.onPointerDown, (l) => {
          !a &&
            l.button === 0 &&
            l.ctrlKey === !1 &&
            (r.onOpenToggle(), r.open || l.preventDefault());
        }),
        onKeyDown: F(e.onKeyDown, (l) => {
          a ||
            (["Enter", " "].includes(l.key) && r.onOpenToggle(),
            l.key === "ArrowDown" && r.onOpenChange(!0),
            ["Enter", " ", "ArrowDown"].includes(l.key) && l.preventDefault());
        }),
      }),
    });
  });
$0.displayName = X0;
var gM = "DropdownMenuPortal",
  Q0 = (e) => {
    const { __scopeDropdownMenu: t, ...n } = e,
      a = st(t);
    return x.jsx(WR, { ...a, ...n });
  };
Q0.displayName = gM;
var Z0 = "DropdownMenuContent",
  J0 = p.forwardRef((e, t) => {
    const { __scopeDropdownMenu: n, ...a } = e,
      o = K0(Z0, n),
      r = st(n),
      i = p.useRef(!1);
    return x.jsx(eM, {
      id: o.contentId,
      "aria-labelledby": o.triggerId,
      ...r,
      ...a,
      ref: t,
      onCloseAutoFocus: F(e.onCloseAutoFocus, (l) => {
        var s;
        (i.current || (s = o.triggerRef.current) == null || s.focus(),
          (i.current = !1),
          l.preventDefault());
      }),
      onInteractOutside: F(e.onInteractOutside, (l) => {
        const s = l.detail.originalEvent,
          c = s.button === 0 && s.ctrlKey === !0,
          f = s.button === 2 || c;
        (!o.modal || f) && (i.current = !0);
      }),
      style: {
        ...e.style,
        "--radix-dropdown-menu-content-transform-origin":
          "var(--radix-popper-transform-origin)",
        "--radix-dropdown-menu-content-available-width":
          "var(--radix-popper-available-width)",
        "--radix-dropdown-menu-content-available-height":
          "var(--radix-popper-available-height)",
        "--radix-dropdown-menu-trigger-width":
          "var(--radix-popper-anchor-width)",
        "--radix-dropdown-menu-trigger-height":
          "var(--radix-popper-anchor-height)",
      },
    });
  });
J0.displayName = Z0;
var hM = "DropdownMenuGroup",
  W0 = p.forwardRef((e, t) => {
    const { __scopeDropdownMenu: n, ...a } = e,
      o = st(n);
    return x.jsx(tM, { ...o, ...a, ref: t });
  });
W0.displayName = hM;
var pM = "DropdownMenuLabel",
  eS = p.forwardRef((e, t) => {
    const { __scopeDropdownMenu: n, ...a } = e,
      o = st(n);
    return x.jsx(nM, { ...o, ...a, ref: t });
  });
eS.displayName = pM;
var vM = "DropdownMenuItem",
  tS = p.forwardRef((e, t) => {
    const { __scopeDropdownMenu: n, ...a } = e,
      o = st(n);
    return x.jsx(aM, { ...o, ...a, ref: t });
  });
tS.displayName = vM;
var yM = "DropdownMenuCheckboxItem",
  bM = p.forwardRef((e, t) => {
    const { __scopeDropdownMenu: n, ...a } = e,
      o = st(n);
    return x.jsx(oM, { ...o, ...a, ref: t });
  });
bM.displayName = yM;
var SM = "DropdownMenuRadioGroup",
  wM = p.forwardRef((e, t) => {
    const { __scopeDropdownMenu: n, ...a } = e,
      o = st(n);
    return x.jsx(rM, { ...o, ...a, ref: t });
  });
wM.displayName = SM;
var xM = "DropdownMenuRadioItem",
  EM = p.forwardRef((e, t) => {
    const { __scopeDropdownMenu: n, ...a } = e,
      o = st(n);
    return x.jsx(iM, { ...o, ...a, ref: t });
  });
EM.displayName = xM;
var CM = "DropdownMenuItemIndicator",
  AM = p.forwardRef((e, t) => {
    const { __scopeDropdownMenu: n, ...a } = e,
      o = st(n);
    return x.jsx(lM, { ...o, ...a, ref: t });
  });
AM.displayName = CM;
var TM = "DropdownMenuSeparator",
  nS = p.forwardRef((e, t) => {
    const { __scopeDropdownMenu: n, ...a } = e,
      o = st(n);
    return x.jsx(sM, { ...o, ...a, ref: t });
  });
nS.displayName = TM;
var RM = "DropdownMenuArrow",
  MM = p.forwardRef((e, t) => {
    const { __scopeDropdownMenu: n, ...a } = e,
      o = st(n);
    return x.jsx(cM, { ...o, ...a, ref: t });
  });
MM.displayName = RM;
var DM = "DropdownMenuSubTrigger",
  OM = p.forwardRef((e, t) => {
    const { __scopeDropdownMenu: n, ...a } = e,
      o = st(n);
    return x.jsx(uM, { ...o, ...a, ref: t });
  });
OM.displayName = DM;
var kM = "DropdownMenuSubContent",
  NM = p.forwardRef((e, t) => {
    const { __scopeDropdownMenu: n, ...a } = e,
      o = st(n);
    return x.jsx(fM, {
      ...o,
      ...a,
      ref: t,
      style: {
        ...e.style,
        "--radix-dropdown-menu-content-transform-origin":
          "var(--radix-popper-transform-origin)",
        "--radix-dropdown-menu-content-available-width":
          "var(--radix-popper-available-width)",
        "--radix-dropdown-menu-content-available-height":
          "var(--radix-popper-available-height)",
        "--radix-dropdown-menu-trigger-width":
          "var(--radix-popper-anchor-width)",
        "--radix-dropdown-menu-trigger-height":
          "var(--radix-popper-anchor-height)",
      },
    });
  });
NM.displayName = kM;
var _M = q0,
  LM = $0,
  zM = Q0,
  jM = J0,
  BM = W0,
  UM = eS,
  HM = tS,
  PM = nS;
function Qk({ ...e }) {
  return x.jsx(_M, { "data-slot": "dropdown-menu", ...e });
}
function Zk({ ...e }) {
  return x.jsx(LM, { "data-slot": "dropdown-menu-trigger", ...e });
}
function Jk({ className: e, sideOffset: t = 4, container: n, ...a }) {
  return x.jsx(zM, {
    container: n,
    children: x.jsx(jM, {
      "data-slot": "dropdown-menu-content",
      sideOffset: t,
      className: oe(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
        e,
      ),
      ...a,
    }),
  });
}
function Wk({ ...e }) {
  return x.jsx(BM, { "data-slot": "dropdown-menu-group", ...e });
}
function eN({ className: e, inset: t, variant: n = "default", ...a }) {
  return x.jsx(HM, {
    "data-slot": "dropdown-menu-item",
    "data-inset": t,
    "data-variant": n,
    className: oe(
      "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
      e,
    ),
    ...a,
  });
}
function tN({ className: e, inset: t, ...n }) {
  return x.jsx(UM, {
    "data-slot": "dropdown-menu-label",
    "data-inset": t,
    className: oe("px-2 py-1.5 text-sm font-medium data-[inset]:pl-8", e),
    ...n,
  });
}
function nN({ className: e, ...t }) {
  return x.jsx(PM, {
    "data-slot": "dropdown-menu-separator",
    className: oe("bg-border -mx-1 my-1 h-px", e),
    ...t,
  });
}
function VM(e, t) {
  return p.useReducer((n, a) => t[n][a] ?? n, e);
}
var $d = "ScrollArea",
  [aS] = wa($d),
  [IM, qt] = aS($d),
  oS = p.forwardRef((e, t) => {
    const {
        __scopeScrollArea: n,
        type: a = "hover",
        dir: o,
        scrollHideDelay: r = 600,
        ...i
      } = e,
      [l, s] = p.useState(null),
      [c, f] = p.useState(null),
      [u, d] = p.useState(null),
      [g, S] = p.useState(null),
      [v, b] = p.useState(null),
      [m, h] = p.useState(0),
      [y, w] = p.useState(0),
      [C, R] = p.useState(!1),
      [E, A] = p.useState(!1),
      O = Ae(t, (B) => s(B)),
      N = Md(o);
    return x.jsx(IM, {
      scope: n,
      type: a,
      dir: N,
      scrollHideDelay: r,
      scrollArea: l,
      viewport: c,
      onViewportChange: f,
      content: u,
      onContentChange: d,
      scrollbarX: g,
      onScrollbarXChange: S,
      scrollbarXEnabled: C,
      onScrollbarXEnabledChange: R,
      scrollbarY: v,
      onScrollbarYChange: b,
      scrollbarYEnabled: E,
      onScrollbarYEnabledChange: A,
      onCornerWidthChange: h,
      onCornerHeightChange: w,
      children: x.jsx(ye.div, {
        dir: N,
        ...i,
        ref: O,
        style: {
          position: "relative",
          "--radix-scroll-area-corner-width": m + "px",
          "--radix-scroll-area-corner-height": y + "px",
          ...e.style,
        },
      }),
    });
  });
oS.displayName = $d;
var rS = "ScrollAreaViewport",
  iS = p.forwardRef((e, t) => {
    const { __scopeScrollArea: n, children: a, nonce: o, ...r } = e,
      i = qt(rS, n),
      l = p.useRef(null),
      s = Ae(t, l, i.onViewportChange);
    return x.jsxs(x.Fragment, {
      children: [
        x.jsx("style", {
          dangerouslySetInnerHTML: {
            __html:
              "[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}",
          },
          nonce: o,
        }),
        x.jsx(ye.div, {
          "data-radix-scroll-area-viewport": "",
          ...r,
          ref: s,
          style: {
            overflowX: i.scrollbarXEnabled ? "scroll" : "hidden",
            overflowY: i.scrollbarYEnabled ? "scroll" : "hidden",
            ...e.style,
          },
          children: x.jsx("div", {
            ref: i.onContentChange,
            style: { minWidth: "100%", display: "table" },
            children: a,
          }),
        }),
      ],
    });
  });
iS.displayName = rS;
var pn = "ScrollAreaScrollbar",
  lS = p.forwardRef((e, t) => {
    const { forceMount: n, ...a } = e,
      o = qt(pn, e.__scopeScrollArea),
      { onScrollbarXEnabledChange: r, onScrollbarYEnabledChange: i } = o,
      l = e.orientation === "horizontal";
    return (
      p.useEffect(
        () => (
          l ? r(!0) : i(!0),
          () => {
            l ? r(!1) : i(!1);
          }
        ),
        [l, r, i],
      ),
      o.type === "hover"
        ? x.jsx(GM, { ...a, ref: t, forceMount: n })
        : o.type === "scroll"
          ? x.jsx(YM, { ...a, ref: t, forceMount: n })
          : o.type === "auto"
            ? x.jsx(sS, { ...a, ref: t, forceMount: n })
            : o.type === "always"
              ? x.jsx(Qd, { ...a, ref: t })
              : null
    );
  });
lS.displayName = pn;
var GM = p.forwardRef((e, t) => {
    const { forceMount: n, ...a } = e,
      o = qt(pn, e.__scopeScrollArea),
      [r, i] = p.useState(!1);
    return (
      p.useEffect(() => {
        const l = o.scrollArea;
        let s = 0;
        if (l) {
          const c = () => {
              (window.clearTimeout(s), i(!0));
            },
            f = () => {
              s = window.setTimeout(() => i(!1), o.scrollHideDelay);
            };
          return (
            l.addEventListener("pointerenter", c),
            l.addEventListener("pointerleave", f),
            () => {
              (window.clearTimeout(s),
                l.removeEventListener("pointerenter", c),
                l.removeEventListener("pointerleave", f));
            }
          );
        }
      }, [o.scrollArea, o.scrollHideDelay]),
      x.jsx(bt, {
        present: n || r,
        children: x.jsx(sS, {
          "data-state": r ? "visible" : "hidden",
          ...a,
          ref: t,
        }),
      })
    );
  }),
  YM = p.forwardRef((e, t) => {
    const { forceMount: n, ...a } = e,
      o = qt(pn, e.__scopeScrollArea),
      r = e.orientation === "horizontal",
      i = rc(() => s("SCROLL_END"), 100),
      [l, s] = VM("hidden", {
        hidden: { SCROLL: "scrolling" },
        scrolling: { SCROLL_END: "idle", POINTER_ENTER: "interacting" },
        interacting: { SCROLL: "interacting", POINTER_LEAVE: "idle" },
        idle: {
          HIDE: "hidden",
          SCROLL: "scrolling",
          POINTER_ENTER: "interacting",
        },
      });
    return (
      p.useEffect(() => {
        if (l === "idle") {
          const c = window.setTimeout(() => s("HIDE"), o.scrollHideDelay);
          return () => window.clearTimeout(c);
        }
      }, [l, o.scrollHideDelay, s]),
      p.useEffect(() => {
        const c = o.viewport,
          f = r ? "scrollLeft" : "scrollTop";
        if (c) {
          let u = c[f];
          const d = () => {
            const g = c[f];
            (u !== g && (s("SCROLL"), i()), (u = g));
          };
          return (
            c.addEventListener("scroll", d),
            () => c.removeEventListener("scroll", d)
          );
        }
      }, [o.viewport, r, s, i]),
      x.jsx(bt, {
        present: n || l !== "hidden",
        children: x.jsx(Qd, {
          "data-state": l === "hidden" ? "hidden" : "visible",
          ...a,
          ref: t,
          onPointerEnter: F(e.onPointerEnter, () => s("POINTER_ENTER")),
          onPointerLeave: F(e.onPointerLeave, () => s("POINTER_LEAVE")),
        }),
      })
    );
  }),
  sS = p.forwardRef((e, t) => {
    const n = qt(pn, e.__scopeScrollArea),
      { forceMount: a, ...o } = e,
      [r, i] = p.useState(!1),
      l = e.orientation === "horizontal",
      s = rc(() => {
        if (n.viewport) {
          const c = n.viewport.offsetWidth < n.viewport.scrollWidth,
            f = n.viewport.offsetHeight < n.viewport.scrollHeight;
          i(l ? c : f);
        }
      }, 10);
    return (
      Xo(n.viewport, s),
      Xo(n.content, s),
      x.jsx(bt, {
        present: a || r,
        children: x.jsx(Qd, {
          "data-state": r ? "visible" : "hidden",
          ...o,
          ref: t,
        }),
      })
    );
  }),
  Qd = p.forwardRef((e, t) => {
    const { orientation: n = "vertical", ...a } = e,
      o = qt(pn, e.__scopeScrollArea),
      r = p.useRef(null),
      i = p.useRef(0),
      [l, s] = p.useState({
        content: 0,
        viewport: 0,
        scrollbar: { size: 0, paddingStart: 0, paddingEnd: 0 },
      }),
      c = mS(l.viewport, l.content),
      f = {
        ...a,
        sizes: l,
        onSizesChange: s,
        hasThumb: c > 0 && c < 1,
        onThumbChange: (d) => (r.current = d),
        onThumbPointerUp: () => (i.current = 0),
        onThumbPointerDown: (d) => (i.current = d),
      };
    function u(d, g) {
      return QM(d, i.current, l, g);
    }
    return n === "horizontal"
      ? x.jsx(FM, {
          ...f,
          ref: t,
          onThumbPositionChange: () => {
            if (o.viewport && r.current) {
              const d = o.viewport.scrollLeft,
                g = gh(d, l, o.dir);
              r.current.style.transform = `translate3d(${g}px, 0, 0)`;
            }
          },
          onWheelScroll: (d) => {
            o.viewport && (o.viewport.scrollLeft = d);
          },
          onDragScroll: (d) => {
            o.viewport && (o.viewport.scrollLeft = u(d, o.dir));
          },
        })
      : n === "vertical"
        ? x.jsx(KM, {
            ...f,
            ref: t,
            onThumbPositionChange: () => {
              if (o.viewport && r.current) {
                const d = o.viewport.scrollTop,
                  g = gh(d, l);
                r.current.style.transform = `translate3d(0, ${g}px, 0)`;
              }
            },
            onWheelScroll: (d) => {
              o.viewport && (o.viewport.scrollTop = d);
            },
            onDragScroll: (d) => {
              o.viewport && (o.viewport.scrollTop = u(d));
            },
          })
        : null;
  }),
  FM = p.forwardRef((e, t) => {
    const { sizes: n, onSizesChange: a, ...o } = e,
      r = qt(pn, e.__scopeScrollArea),
      [i, l] = p.useState(),
      s = p.useRef(null),
      c = Ae(t, s, r.onScrollbarXChange);
    return (
      p.useEffect(() => {
        s.current && l(getComputedStyle(s.current));
      }, [s]),
      x.jsx(uS, {
        "data-orientation": "horizontal",
        ...o,
        ref: c,
        sizes: n,
        style: {
          bottom: 0,
          left: r.dir === "rtl" ? "var(--radix-scroll-area-corner-width)" : 0,
          right: r.dir === "ltr" ? "var(--radix-scroll-area-corner-width)" : 0,
          "--radix-scroll-area-thumb-width": oc(n) + "px",
          ...e.style,
        },
        onThumbPointerDown: (f) => e.onThumbPointerDown(f.x),
        onDragScroll: (f) => e.onDragScroll(f.x),
        onWheelScroll: (f, u) => {
          if (r.viewport) {
            const d = r.viewport.scrollLeft + f.deltaX;
            (e.onWheelScroll(d), hS(d, u) && f.preventDefault());
          }
        },
        onResize: () => {
          s.current &&
            r.viewport &&
            i &&
            a({
              content: r.viewport.scrollWidth,
              viewport: r.viewport.offsetWidth,
              scrollbar: {
                size: s.current.clientWidth,
                paddingStart: bs(i.paddingLeft),
                paddingEnd: bs(i.paddingRight),
              },
            });
        },
      })
    );
  }),
  KM = p.forwardRef((e, t) => {
    const { sizes: n, onSizesChange: a, ...o } = e,
      r = qt(pn, e.__scopeScrollArea),
      [i, l] = p.useState(),
      s = p.useRef(null),
      c = Ae(t, s, r.onScrollbarYChange);
    return (
      p.useEffect(() => {
        s.current && l(getComputedStyle(s.current));
      }, [s]),
      x.jsx(uS, {
        "data-orientation": "vertical",
        ...o,
        ref: c,
        sizes: n,
        style: {
          top: 0,
          right: r.dir === "ltr" ? 0 : void 0,
          left: r.dir === "rtl" ? 0 : void 0,
          bottom: "var(--radix-scroll-area-corner-height)",
          "--radix-scroll-area-thumb-height": oc(n) + "px",
          ...e.style,
        },
        onThumbPointerDown: (f) => e.onThumbPointerDown(f.y),
        onDragScroll: (f) => e.onDragScroll(f.y),
        onWheelScroll: (f, u) => {
          if (r.viewport) {
            const d = r.viewport.scrollTop + f.deltaY;
            (e.onWheelScroll(d), hS(d, u) && f.preventDefault());
          }
        },
        onResize: () => {
          s.current &&
            r.viewport &&
            i &&
            a({
              content: r.viewport.scrollHeight,
              viewport: r.viewport.offsetHeight,
              scrollbar: {
                size: s.current.clientHeight,
                paddingStart: bs(i.paddingTop),
                paddingEnd: bs(i.paddingBottom),
              },
            });
        },
      })
    );
  }),
  [qM, cS] = aS(pn),
  uS = p.forwardRef((e, t) => {
    const {
        __scopeScrollArea: n,
        sizes: a,
        hasThumb: o,
        onThumbChange: r,
        onThumbPointerUp: i,
        onThumbPointerDown: l,
        onThumbPositionChange: s,
        onDragScroll: c,
        onWheelScroll: f,
        onResize: u,
        ...d
      } = e,
      g = qt(pn, n),
      [S, v] = p.useState(null),
      b = Ae(t, (O) => v(O)),
      m = p.useRef(null),
      h = p.useRef(""),
      y = g.viewport,
      w = a.content - a.viewport,
      C = ot(f),
      R = ot(s),
      E = rc(u, 10);
    function A(O) {
      if (m.current) {
        const N = O.clientX - m.current.left,
          B = O.clientY - m.current.top;
        c({ x: N, y: B });
      }
    }
    return (
      p.useEffect(() => {
        const O = (N) => {
          const B = N.target;
          (S == null ? void 0 : S.contains(B)) && C(N, w);
        };
        return (
          document.addEventListener("wheel", O, { passive: !1 }),
          () => document.removeEventListener("wheel", O, { passive: !1 })
        );
      }, [y, S, w, C]),
      p.useEffect(R, [a, R]),
      Xo(S, E),
      Xo(g.content, E),
      x.jsx(qM, {
        scope: n,
        scrollbar: S,
        hasThumb: o,
        onThumbChange: ot(r),
        onThumbPointerUp: ot(i),
        onThumbPositionChange: R,
        onThumbPointerDown: ot(l),
        children: x.jsx(ye.div, {
          ...d,
          ref: b,
          style: { position: "absolute", ...d.style },
          onPointerDown: F(e.onPointerDown, (O) => {
            O.button === 0 &&
              (O.target.setPointerCapture(O.pointerId),
              (m.current = S.getBoundingClientRect()),
              (h.current = document.body.style.webkitUserSelect),
              (document.body.style.webkitUserSelect = "none"),
              g.viewport && (g.viewport.style.scrollBehavior = "auto"),
              A(O));
          }),
          onPointerMove: F(e.onPointerMove, A),
          onPointerUp: F(e.onPointerUp, (O) => {
            const N = O.target;
            (N.hasPointerCapture(O.pointerId) &&
              N.releasePointerCapture(O.pointerId),
              (document.body.style.webkitUserSelect = h.current),
              g.viewport && (g.viewport.style.scrollBehavior = ""),
              (m.current = null));
          }),
        }),
      })
    );
  }),
  ys = "ScrollAreaThumb",
  fS = p.forwardRef((e, t) => {
    const { forceMount: n, ...a } = e,
      o = cS(ys, e.__scopeScrollArea);
    return x.jsx(bt, {
      present: n || o.hasThumb,
      children: x.jsx(XM, { ref: t, ...a }),
    });
  }),
  XM = p.forwardRef((e, t) => {
    const { __scopeScrollArea: n, style: a, ...o } = e,
      r = qt(ys, n),
      i = cS(ys, n),
      { onThumbPositionChange: l } = i,
      s = Ae(t, (u) => i.onThumbChange(u)),
      c = p.useRef(void 0),
      f = rc(() => {
        c.current && (c.current(), (c.current = void 0));
      }, 100);
    return (
      p.useEffect(() => {
        const u = r.viewport;
        if (u) {
          const d = () => {
            if ((f(), !c.current)) {
              const g = ZM(u, l);
              ((c.current = g), l());
            }
          };
          return (
            l(),
            u.addEventListener("scroll", d),
            () => u.removeEventListener("scroll", d)
          );
        }
      }, [r.viewport, f, l]),
      x.jsx(ye.div, {
        "data-state": i.hasThumb ? "visible" : "hidden",
        ...o,
        ref: s,
        style: {
          width: "var(--radix-scroll-area-thumb-width)",
          height: "var(--radix-scroll-area-thumb-height)",
          ...a,
        },
        onPointerDownCapture: F(e.onPointerDownCapture, (u) => {
          const g = u.target.getBoundingClientRect(),
            S = u.clientX - g.left,
            v = u.clientY - g.top;
          i.onThumbPointerDown({ x: S, y: v });
        }),
        onPointerUp: F(e.onPointerUp, i.onThumbPointerUp),
      })
    );
  });
fS.displayName = ys;
var Zd = "ScrollAreaCorner",
  dS = p.forwardRef((e, t) => {
    const n = qt(Zd, e.__scopeScrollArea),
      a = !!(n.scrollbarX && n.scrollbarY);
    return n.type !== "scroll" && a ? x.jsx($M, { ...e, ref: t }) : null;
  });
dS.displayName = Zd;
var $M = p.forwardRef((e, t) => {
  const { __scopeScrollArea: n, ...a } = e,
    o = qt(Zd, n),
    [r, i] = p.useState(0),
    [l, s] = p.useState(0),
    c = !!(r && l);
  return (
    Xo(o.scrollbarX, () => {
      var u;
      const f = ((u = o.scrollbarX) == null ? void 0 : u.offsetHeight) || 0;
      (o.onCornerHeightChange(f), s(f));
    }),
    Xo(o.scrollbarY, () => {
      var u;
      const f = ((u = o.scrollbarY) == null ? void 0 : u.offsetWidth) || 0;
      (o.onCornerWidthChange(f), i(f));
    }),
    c
      ? x.jsx(ye.div, {
          ...a,
          ref: t,
          style: {
            width: r,
            height: l,
            position: "absolute",
            right: o.dir === "ltr" ? 0 : void 0,
            left: o.dir === "rtl" ? 0 : void 0,
            bottom: 0,
            ...e.style,
          },
        })
      : null
  );
});
function bs(e) {
  return e ? parseInt(e, 10) : 0;
}
function mS(e, t) {
  const n = e / t;
  return isNaN(n) ? 0 : n;
}
function oc(e) {
  const t = mS(e.viewport, e.content),
    n = e.scrollbar.paddingStart + e.scrollbar.paddingEnd,
    a = (e.scrollbar.size - n) * t;
  return Math.max(a, 18);
}
function QM(e, t, n, a = "ltr") {
  const o = oc(n),
    r = o / 2,
    i = t || r,
    l = o - i,
    s = n.scrollbar.paddingStart + i,
    c = n.scrollbar.size - n.scrollbar.paddingEnd - l,
    f = n.content - n.viewport,
    u = a === "ltr" ? [0, f] : [f * -1, 0];
  return gS([s, c], u)(e);
}
function gh(e, t, n = "ltr") {
  const a = oc(t),
    o = t.scrollbar.paddingStart + t.scrollbar.paddingEnd,
    r = t.scrollbar.size - o,
    i = t.content - t.viewport,
    l = r - a,
    s = n === "ltr" ? [0, i] : [i * -1, 0],
    c = sC(e, s);
  return gS([0, i], [0, l])(c);
}
function gS(e, t) {
  return (n) => {
    if (e[0] === e[1] || t[0] === t[1]) return t[0];
    const a = (t[1] - t[0]) / (e[1] - e[0]);
    return t[0] + a * (n - e[0]);
  };
}
function hS(e, t) {
  return e > 0 && e < t;
}
var ZM = (e, t = () => {}) => {
  let n = { left: e.scrollLeft, top: e.scrollTop },
    a = 0;
  return (
    (function o() {
      const r = { left: e.scrollLeft, top: e.scrollTop },
        i = n.left !== r.left,
        l = n.top !== r.top;
      ((i || l) && t(), (n = r), (a = window.requestAnimationFrame(o)));
    })(),
    () => window.cancelAnimationFrame(a)
  );
};
function rc(e, t) {
  const n = ot(e),
    a = p.useRef(0);
  return (
    p.useEffect(() => () => window.clearTimeout(a.current), []),
    p.useCallback(() => {
      (window.clearTimeout(a.current), (a.current = window.setTimeout(n, t)));
    }, [n, t])
  );
}
function Xo(e, t) {
  const n = ot(t);
  Bn(() => {
    let a = 0;
    if (e) {
      const o = new ResizeObserver(() => {
        (cancelAnimationFrame(a), (a = window.requestAnimationFrame(n)));
      });
      return (
        o.observe(e),
        () => {
          (window.cancelAnimationFrame(a), o.unobserve(e));
        }
      );
    }
  }, [e, n]);
}
var JM = oS,
  WM = iS,
  eD = dS;
function aN({ className: e, children: t, ...n }) {
  return x.jsxs(JM, {
    "data-slot": "scroll-area",
    className: oe("relative", e),
    ...n,
    children: [
      x.jsx(WM, {
        "data-slot": "scroll-area-viewport",
        className:
          "focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1",
        children: t,
      }),
      x.jsx(tD, {}),
      x.jsx(eD, {}),
    ],
  });
}
function tD({ className: e, orientation: t = "vertical", ...n }) {
  return x.jsx(lS, {
    "data-slot": "scroll-area-scrollbar",
    orientation: t,
    className: oe(
      "flex touch-none p-px transition-colors select-none",
      t === "vertical" && "h-full w-2.5 border-l border-l-transparent",
      t === "horizontal" && "h-2.5 flex-col border-t border-t-transparent",
      e,
    ),
    ...n,
    children: x.jsx(fS, {
      "data-slot": "scroll-area-thumb",
      className: "bg-border relative flex-1 rounded-full",
    }),
  });
}
var [ic] = wa("Tooltip", [Qs]),
  lc = Qs(),
  pS = "TooltipProvider",
  nD = 700,
  pf = "tooltip.open",
  [aD, Jd] = ic(pS),
  vS = (e) => {
    const {
        __scopeTooltip: t,
        delayDuration: n = nD,
        skipDelayDuration: a = 300,
        disableHoverableContent: o = !1,
        children: r,
      } = e,
      i = p.useRef(!0),
      l = p.useRef(!1),
      s = p.useRef(0);
    return (
      p.useEffect(() => {
        const c = s.current;
        return () => window.clearTimeout(c);
      }, []),
      x.jsx(aD, {
        scope: t,
        isOpenDelayedRef: i,
        delayDuration: n,
        onOpen: p.useCallback(() => {
          (window.clearTimeout(s.current), (i.current = !1));
        }, []),
        onClose: p.useCallback(() => {
          (window.clearTimeout(s.current),
            (s.current = window.setTimeout(() => (i.current = !0), a)));
        }, [a]),
        isPointerInTransitRef: l,
        onPointerInTransitChange: p.useCallback((c) => {
          l.current = c;
        }, []),
        disableHoverableContent: o,
        children: r,
      })
    );
  };
vS.displayName = pS;
var fi = "Tooltip",
  [oD, ki] = ic(fi),
  yS = (e) => {
    const {
        __scopeTooltip: t,
        children: n,
        open: a,
        defaultOpen: o,
        onOpenChange: r,
        disableHoverableContent: i,
        delayDuration: l,
      } = e,
      s = Jd(fi, e.__scopeTooltip),
      c = lc(t),
      [f, u] = p.useState(null),
      d = Ba(),
      g = p.useRef(0),
      S = i ?? s.disableHoverableContent,
      v = l ?? s.delayDuration,
      b = p.useRef(!1),
      [m, h] = Js({
        prop: a,
        defaultProp: o ?? !1,
        onChange: (E) => {
          (E
            ? (s.onOpen(), document.dispatchEvent(new CustomEvent(pf)))
            : s.onClose(),
            r == null || r(E));
        },
        caller: fi,
      }),
      y = p.useMemo(
        () => (m ? (b.current ? "delayed-open" : "instant-open") : "closed"),
        [m],
      ),
      w = p.useCallback(() => {
        (window.clearTimeout(g.current),
          (g.current = 0),
          (b.current = !1),
          h(!0));
      }, [h]),
      C = p.useCallback(() => {
        (window.clearTimeout(g.current), (g.current = 0), h(!1));
      }, [h]),
      R = p.useCallback(() => {
        (window.clearTimeout(g.current),
          (g.current = window.setTimeout(() => {
            ((b.current = !0), h(!0), (g.current = 0));
          }, v)));
      }, [v, h]);
    return (
      p.useEffect(
        () => () => {
          g.current && (window.clearTimeout(g.current), (g.current = 0));
        },
        [],
      ),
      x.jsx(Vb, {
        ...c,
        children: x.jsx(oD, {
          scope: t,
          contentId: d,
          open: m,
          stateAttribute: y,
          trigger: f,
          onTriggerChange: u,
          onTriggerEnter: p.useCallback(() => {
            s.isOpenDelayedRef.current ? R() : w();
          }, [s.isOpenDelayedRef, R, w]),
          onTriggerLeave: p.useCallback(() => {
            S ? C() : (window.clearTimeout(g.current), (g.current = 0));
          }, [C, S]),
          onOpen: w,
          onClose: C,
          disableHoverableContent: S,
          children: n,
        }),
      })
    );
  };
yS.displayName = fi;
var vf = "TooltipTrigger",
  bS = p.forwardRef((e, t) => {
    const { __scopeTooltip: n, ...a } = e,
      o = ki(vf, n),
      r = Jd(vf, n),
      i = lc(n),
      l = p.useRef(null),
      s = Ae(t, l, o.onTriggerChange),
      c = p.useRef(!1),
      f = p.useRef(!1),
      u = p.useCallback(() => (c.current = !1), []);
    return (
      p.useEffect(
        () => () => document.removeEventListener("pointerup", u),
        [u],
      ),
      x.jsx(Ib, {
        asChild: !0,
        ...i,
        children: x.jsx(ye.button, {
          "aria-describedby": o.open ? o.contentId : void 0,
          "data-state": o.stateAttribute,
          ...a,
          ref: s,
          onPointerMove: F(e.onPointerMove, (d) => {
            d.pointerType !== "touch" &&
              !f.current &&
              !r.isPointerInTransitRef.current &&
              (o.onTriggerEnter(), (f.current = !0));
          }),
          onPointerLeave: F(e.onPointerLeave, () => {
            (o.onTriggerLeave(), (f.current = !1));
          }),
          onPointerDown: F(e.onPointerDown, () => {
            (o.open && o.onClose(),
              (c.current = !0),
              document.addEventListener("pointerup", u, { once: !0 }));
          }),
          onFocus: F(e.onFocus, () => {
            c.current || o.onOpen();
          }),
          onBlur: F(e.onBlur, o.onClose),
          onClick: F(e.onClick, o.onClose),
        }),
      })
    );
  });
bS.displayName = vf;
var Wd = "TooltipPortal",
  [rD, iD] = ic(Wd, { forceMount: void 0 }),
  SS = (e) => {
    const { __scopeTooltip: t, forceMount: n, children: a, container: o } = e,
      r = ki(Wd, t);
    return x.jsx(rD, {
      scope: t,
      forceMount: n,
      children: x.jsx(bt, {
        present: n || r.open,
        children: x.jsx(Zs, { asChild: !0, container: o, children: a }),
      }),
    });
  };
SS.displayName = Wd;
var $o = "TooltipContent",
  wS = p.forwardRef((e, t) => {
    const n = iD($o, e.__scopeTooltip),
      { forceMount: a = n.forceMount, side: o = "top", ...r } = e,
      i = ki($o, e.__scopeTooltip);
    return x.jsx(bt, {
      present: a || i.open,
      children: i.disableHoverableContent
        ? x.jsx(xS, { side: o, ...r, ref: t })
        : x.jsx(lD, { side: o, ...r, ref: t }),
    });
  }),
  lD = p.forwardRef((e, t) => {
    const n = ki($o, e.__scopeTooltip),
      a = Jd($o, e.__scopeTooltip),
      o = p.useRef(null),
      r = Ae(t, o),
      [i, l] = p.useState(null),
      { trigger: s, onClose: c } = n,
      f = o.current,
      { onPointerInTransitChange: u } = a,
      d = p.useCallback(() => {
        (l(null), u(!1));
      }, [u]),
      g = p.useCallback(
        (S, v) => {
          const b = S.currentTarget,
            m = { x: S.clientX, y: S.clientY },
            h = fD(m, b.getBoundingClientRect()),
            y = dD(m, h),
            w = mD(v.getBoundingClientRect()),
            C = hD([...y, ...w]);
          (l(C), u(!0));
        },
        [u],
      );
    return (
      p.useEffect(() => () => d(), [d]),
      p.useEffect(() => {
        if (s && f) {
          const S = (b) => g(b, f),
            v = (b) => g(b, s);
          return (
            s.addEventListener("pointerleave", S),
            f.addEventListener("pointerleave", v),
            () => {
              (s.removeEventListener("pointerleave", S),
                f.removeEventListener("pointerleave", v));
            }
          );
        }
      }, [s, f, g, d]),
      p.useEffect(() => {
        if (i) {
          const S = (v) => {
            const b = v.target,
              m = { x: v.clientX, y: v.clientY },
              h =
                (s == null ? void 0 : s.contains(b)) ||
                (f == null ? void 0 : f.contains(b)),
              y = !gD(m, i);
            h ? d() : y && (d(), c());
          };
          return (
            document.addEventListener("pointermove", S),
            () => document.removeEventListener("pointermove", S)
          );
        }
      }, [s, f, i, c, d]),
      x.jsx(xS, { ...e, ref: r })
    );
  }),
  [sD, cD] = ic(fi, { isInside: !1 }),
  uD = dC("TooltipContent"),
  xS = p.forwardRef((e, t) => {
    const {
        __scopeTooltip: n,
        children: a,
        "aria-label": o,
        onEscapeKeyDown: r,
        onPointerDownOutside: i,
        ...l
      } = e,
      s = ki($o, n),
      c = lc(n),
      { onClose: f } = s;
    return (
      p.useEffect(
        () => (
          document.addEventListener(pf, f),
          () => document.removeEventListener(pf, f)
        ),
        [f],
      ),
      p.useEffect(() => {
        if (s.trigger) {
          const u = (d) => {
            const g = d.target;
            g != null && g.contains(s.trigger) && f();
          };
          return (
            window.addEventListener("scroll", u, { capture: !0 }),
            () => window.removeEventListener("scroll", u, { capture: !0 })
          );
        }
      }, [s.trigger, f]),
      x.jsx(Fs, {
        asChild: !0,
        disableOutsidePointerEvents: !1,
        onEscapeKeyDown: r,
        onPointerDownOutside: i,
        onFocusOutside: (u) => u.preventDefault(),
        onDismiss: f,
        children: x.jsxs(Gb, {
          "data-state": s.stateAttribute,
          ...c,
          ...l,
          ref: t,
          style: {
            ...l.style,
            "--radix-tooltip-content-transform-origin":
              "var(--radix-popper-transform-origin)",
            "--radix-tooltip-content-available-width":
              "var(--radix-popper-available-width)",
            "--radix-tooltip-content-available-height":
              "var(--radix-popper-available-height)",
            "--radix-tooltip-trigger-width": "var(--radix-popper-anchor-width)",
            "--radix-tooltip-trigger-height":
              "var(--radix-popper-anchor-height)",
          },
          children: [
            x.jsx(uD, { children: a }),
            x.jsx(sD, {
              scope: n,
              isInside: !0,
              children: x.jsx(iT, {
                id: s.contentId,
                role: "tooltip",
                children: o || a,
              }),
            }),
          ],
        }),
      })
    );
  });
wS.displayName = $o;
var ES = "TooltipArrow",
  CS = p.forwardRef((e, t) => {
    const { __scopeTooltip: n, ...a } = e,
      o = lc(n);
    return cD(ES, n).isInside ? null : x.jsx(Yb, { ...o, ...a, ref: t });
  });
CS.displayName = ES;
function fD(e, t) {
  const n = Math.abs(t.top - e.y),
    a = Math.abs(t.bottom - e.y),
    o = Math.abs(t.right - e.x),
    r = Math.abs(t.left - e.x);
  switch (Math.min(n, a, o, r)) {
    case r:
      return "left";
    case o:
      return "right";
    case n:
      return "top";
    case a:
      return "bottom";
    default:
      throw new Error("unreachable");
  }
}
function dD(e, t, n = 5) {
  const a = [];
  switch (t) {
    case "top":
      a.push({ x: e.x - n, y: e.y + n }, { x: e.x + n, y: e.y + n });
      break;
    case "bottom":
      a.push({ x: e.x - n, y: e.y - n }, { x: e.x + n, y: e.y - n });
      break;
    case "left":
      a.push({ x: e.x + n, y: e.y - n }, { x: e.x + n, y: e.y + n });
      break;
    case "right":
      a.push({ x: e.x - n, y: e.y - n }, { x: e.x - n, y: e.y + n });
      break;
  }
  return a;
}
function mD(e) {
  const { top: t, right: n, bottom: a, left: o } = e;
  return [
    { x: o, y: t },
    { x: n, y: t },
    { x: n, y: a },
    { x: o, y: a },
  ];
}
function gD(e, t) {
  const { x: n, y: a } = e;
  let o = !1;
  for (let r = 0, i = t.length - 1; r < t.length; i = r++) {
    const l = t[r],
      s = t[i],
      c = l.x,
      f = l.y,
      u = s.x,
      d = s.y;
    f > a != d > a && n < ((u - c) * (a - f)) / (d - f) + c && (o = !o);
  }
  return o;
}
function hD(e) {
  const t = e.slice();
  return (
    t.sort((n, a) =>
      n.x < a.x ? -1 : n.x > a.x ? 1 : n.y < a.y ? -1 : n.y > a.y ? 1 : 0,
    ),
    pD(t)
  );
}
function pD(e) {
  if (e.length <= 1) return e.slice();
  const t = [];
  for (let a = 0; a < e.length; a++) {
    const o = e[a];
    for (; t.length >= 2; ) {
      const r = t[t.length - 1],
        i = t[t.length - 2];
      if ((r.x - i.x) * (o.y - i.y) >= (r.y - i.y) * (o.x - i.x)) t.pop();
      else break;
    }
    t.push(o);
  }
  t.pop();
  const n = [];
  for (let a = e.length - 1; a >= 0; a--) {
    const o = e[a];
    for (; n.length >= 2; ) {
      const r = n[n.length - 1],
        i = n[n.length - 2];
      if ((r.x - i.x) * (o.y - i.y) >= (r.y - i.y) * (o.x - i.x)) n.pop();
      else break;
    }
    n.push(o);
  }
  return (
    n.pop(),
    t.length === 1 && n.length === 1 && t[0].x === n[0].x && t[0].y === n[0].y
      ? t
      : t.concat(n)
  );
}
var vD = vS,
  yD = yS,
  bD = bS,
  SD = SS,
  wD = wS,
  xD = CS;
function AS({ delayDuration: e = 0, ...t }) {
  return x.jsx(vD, { "data-slot": "tooltip-provider", delayDuration: e, ...t });
}
function ED({ ...e }) {
  return x.jsx(AS, { children: x.jsx(yD, { "data-slot": "tooltip", ...e }) });
}
function CD({ ...e }) {
  return x.jsx(bD, { "data-slot": "tooltip-trigger", ...e });
}
function AD({ className: e, sideOffset: t = 0, children: n, ...a }) {
  return x.jsx(SD, {
    children: x.jsxs(wD, {
      "data-slot": "tooltip-content",
      sideOffset: t,
      className: oe(
        "bg-foreground text-background animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
        e,
      ),
      ...a,
      children: [
        n,
        x.jsx(xD, {
          className:
            "bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]",
        }),
      ],
    }),
  });
}
const lu = 768;
function TD() {
  const [e, t] = p.useState(void 0);
  return (
    p.useEffect(() => {
      const n = window.matchMedia(`(max-width: ${lu - 1}px)`),
        a = () => {
          t(window.innerWidth < lu);
        };
      return (
        n.addEventListener("change", a),
        t(window.innerWidth < lu),
        () => n.removeEventListener("change", a)
      );
    }, []),
    !!e
  );
}
function RD({ ...e }) {
  return x.jsx(oR, { "data-slot": "sheet", ...e });
}
function MD({ ...e }) {
  return x.jsx(rR, { "data-slot": "sheet-portal", ...e });
}
function DD({ className: e, ...t }) {
  return x.jsx(iR, {
    "data-slot": "sheet-overlay",
    className: oe(
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
      e,
    ),
    ...t,
  });
}
function OD({ className: e, children: t, side: n = "right", ...a }) {
  return x.jsxs(MD, {
    children: [
      x.jsx(DD, {}),
      x.jsxs(lR, {
        "data-slot": "sheet-content",
        className: oe(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          n === "right" &&
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          n === "left" &&
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          n === "top" &&
            "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
          n === "bottom" &&
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
          e,
        ),
        ...a,
        children: [
          t,
          x.jsxs(uR, {
            className:
              "ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none",
            children: [
              x.jsx(rE, { className: "size-4" }),
              x.jsx("span", { className: "sr-only", children: "Close" }),
            ],
          }),
        ],
      }),
    ],
  });
}
function kD({ className: e, ...t }) {
  return x.jsx("div", {
    "data-slot": "sheet-header",
    className: oe("flex flex-col gap-1.5 p-4", e),
    ...t,
  });
}
function ND({ className: e, ...t }) {
  return x.jsx(sR, {
    "data-slot": "sheet-title",
    className: oe("text-foreground font-semibold", e),
    ...t,
  });
}
function _D({ className: e, ...t }) {
  return x.jsx(cR, {
    "data-slot": "sheet-description",
    className: oe("text-muted-foreground text-sm", e),
    ...t,
  });
}
const LD = "sidebar_state",
  zD = 60 * 60 * 24 * 7,
  jD = "16rem",
  BD = "18rem",
  UD = "3rem",
  HD = "b",
  TS = p.createContext(null);
function em() {
  const e = p.useContext(TS);
  if (!e) throw new Error("useSidebar must be used within a SidebarProvider.");
  return e;
}
function oN({
  defaultOpen: e = !0,
  open: t,
  onOpenChange: n,
  className: a,
  style: o,
  children: r,
  ...i
}) {
  const l = TD(),
    [s, c] = p.useState(!1),
    [f, u] = p.useState(e),
    d = t ?? f,
    g = p.useCallback(
      (m) => {
        const h = typeof m == "function" ? m(d) : m;
        (n ? n(h) : u(h),
          (document.cookie = `${LD}=${h}; path=/; max-age=${zD}`));
      },
      [n, d],
    ),
    S = p.useCallback(() => (l ? c((m) => !m) : g((m) => !m)), [l, g, c]);
  p.useEffect(() => {
    const m = (h) => {
      h.key === HD && (h.metaKey || h.ctrlKey) && (h.preventDefault(), S());
    };
    return (
      window.addEventListener("keydown", m),
      () => window.removeEventListener("keydown", m)
    );
  }, [S]);
  const v = d ? "expanded" : "collapsed",
    b = p.useMemo(
      () => ({
        state: v,
        open: d,
        setOpen: g,
        isMobile: l,
        openMobile: s,
        setOpenMobile: c,
        toggleSidebar: S,
      }),
      [v, d, g, l, s, c, S],
    );
  return x.jsx(TS.Provider, {
    value: b,
    children: x.jsx(AS, {
      delayDuration: 0,
      children: x.jsx("div", {
        "data-slot": "sidebar-wrapper",
        style: { "--sidebar-width": jD, "--sidebar-width-icon": UD, ...o },
        className: oe(
          "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
          a,
        ),
        ...i,
        children: r,
      }),
    }),
  });
}
function rN({
  side: e = "left",
  variant: t = "sidebar",
  collapsible: n = "offcanvas",
  className: a,
  children: o,
  ...r
}) {
  const { isMobile: i, state: l, openMobile: s, setOpenMobile: c } = em();
  return n === "none"
    ? x.jsx("div", {
        "data-slot": "sidebar",
        className: oe(
          "bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col",
          a,
        ),
        ...r,
        children: o,
      })
    : i
      ? x.jsx(RD, {
          open: s,
          onOpenChange: c,
          ...r,
          children: x.jsxs(OD, {
            "data-sidebar": "sidebar",
            "data-slot": "sidebar",
            "data-mobile": "true",
            className:
              "bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden",
            style: { "--sidebar-width": BD },
            side: e,
            children: [
              x.jsxs(kD, {
                className: "sr-only",
                children: [
                  x.jsx(ND, { children: "Sidebar" }),
                  x.jsx(_D, { children: "Displays the mobile sidebar." }),
                ],
              }),
              x.jsx("div", {
                className: "flex h-full w-full flex-col",
                children: o,
              }),
            ],
          }),
        })
      : x.jsxs("div", {
          className: "group peer text-sidebar-foreground hidden md:block",
          "data-state": l,
          "data-collapsible": l === "collapsed" ? n : "",
          "data-variant": t,
          "data-side": e,
          "data-slot": "sidebar",
          children: [
            x.jsx("div", {
              "data-slot": "sidebar-gap",
              className: oe(
                "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
                "group-data-[collapsible=offcanvas]:w-0",
                "group-data-[side=right]:rotate-180",
                t === "floating" || t === "inset"
                  ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
                  : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
              ),
            }),
            x.jsx("div", {
              "data-slot": "sidebar-container",
              className: oe(
                "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
                e === "left"
                  ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
                  : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
                t === "floating" || t === "inset"
                  ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
                  : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
                a,
              ),
              ...r,
              children: x.jsx("div", {
                "data-sidebar": "sidebar",
                "data-slot": "sidebar-inner",
                className:
                  "bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm",
                children: o,
              }),
            }),
          ],
        });
}
function iN({ className: e, onClick: t, ...n }) {
  const { toggleSidebar: a } = em();
  return x.jsxs(nC, {
    "data-sidebar": "trigger",
    "data-slot": "sidebar-trigger",
    variant: "ghost",
    size: "icon",
    className: oe("size-7", e),
    onClick: (o) => {
      (t == null || t(o), a());
    },
    ...n,
    children: [
      x.jsx(oE, {}),
      x.jsx("span", { className: "sr-only", children: "Toggle Sidebar" }),
    ],
  });
}
function lN({ className: e, ...t }) {
  return x.jsx("main", {
    "data-slot": "sidebar-inset",
    className: oe(
      "bg-background relative flex w-full flex-1 flex-col",
      "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
      e,
    ),
    ...t,
  });
}
function sN({ className: e, ...t }) {
  return x.jsx("div", {
    "data-slot": "sidebar-header",
    "data-sidebar": "header",
    className: oe("flex flex-col gap-2 p-2", e),
    ...t,
  });
}
function cN({ className: e, ...t }) {
  return x.jsx("div", {
    "data-slot": "sidebar-footer",
    "data-sidebar": "footer",
    className: oe("flex flex-col gap-2 p-2", e),
    ...t,
  });
}
function uN({ className: e, ...t }) {
  return x.jsx("div", {
    "data-slot": "sidebar-content",
    "data-sidebar": "content",
    className: oe(
      "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
      e,
    ),
    ...t,
  });
}
function fN({ className: e, ...t }) {
  return x.jsx("div", {
    "data-slot": "sidebar-group",
    "data-sidebar": "group",
    className: oe("relative flex w-full min-w-0 flex-col p-2", e),
    ...t,
  });
}
function dN({ className: e, asChild: t = !1, ...n }) {
  const a = t ? or : "div";
  return x.jsx(a, {
    "data-slot": "sidebar-group-label",
    "data-sidebar": "group-label",
    className: oe(
      "text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
      "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
      e,
    ),
    ...n,
  });
}
function mN({ className: e, ...t }) {
  return x.jsx("div", {
    "data-slot": "sidebar-group-content",
    "data-sidebar": "group-content",
    className: oe("w-full text-sm", e),
    ...t,
  });
}
function gN({ className: e, ...t }) {
  return x.jsx("ul", {
    "data-slot": "sidebar-menu",
    "data-sidebar": "menu",
    className: oe("flex w-full min-w-0 flex-col gap-1", e),
    ...t,
  });
}
function hN({ className: e, ...t }) {
  return x.jsx("li", {
    "data-slot": "sidebar-menu-item",
    "data-sidebar": "menu-item",
    className: oe("group/menu-item relative", e),
    ...t,
  });
}
const PD = Td(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding,background-color,color] duration-200 ease-in-out hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-primary active:text-sidebar-primary-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-primary data-[active=true]:font-medium data-[active=true]:text-sidebar-primary-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);
function pN({
  asChild: e = !1,
  isActive: t = !1,
  variant: n = "default",
  size: a = "default",
  tooltip: o,
  className: r,
  ...i
}) {
  const l = e ? or : "button",
    { isMobile: s, state: c } = em(),
    f = x.jsx(l, {
      "data-slot": "sidebar-menu-button",
      "data-sidebar": "menu-button",
      "data-size": a,
      "data-active": t,
      className: oe(PD({ variant: n, size: a }), r),
      ...i,
    });
  return o
    ? (typeof o == "string" && (o = { children: o }),
      x.jsxs(ED, {
        children: [
          x.jsx(CD, { asChild: !0, children: f }),
          x.jsx(AD, {
            side: "right",
            align: "center",
            hidden: c !== "collapsed" || s,
            ...o,
          }),
        ],
      }))
    : f;
}
function vN({ className: e, asChild: t = !1, showOnHover: n = !1, ...a }) {
  const o = t ? or : "button";
  return x.jsx(o, {
    "data-slot": "sidebar-menu-action",
    "data-sidebar": "menu-action",
    className: oe(
      "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
      "after:absolute after:-inset-2 md:after:hidden",
      "peer-data-[size=sm]/menu-button:top-1",
      "peer-data-[size=default]/menu-button:top-1.5",
      "peer-data-[size=lg]/menu-button:top-2.5",
      "group-data-[collapsible=icon]:hidden",
      n &&
        "peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0",
      e,
    ),
    ...a,
  });
}
function yN({ className: e, ...t }) {
  return x.jsx("div", {
    "data-slot": "sidebar-menu-badge",
    "data-sidebar": "menu-badge",
    className: oe(
      "text-sidebar-foreground pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none",
      "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
      "peer-data-[size=sm]/menu-button:top-1",
      "peer-data-[size=default]/menu-button:top-1.5",
      "peer-data-[size=lg]/menu-button:top-2.5",
      "group-data-[collapsible=icon]:hidden",
      e,
    ),
    ...t,
  });
}
function bN({ className: e, ...t }) {
  return x.jsx("ul", {
    "data-slot": "sidebar-menu-sub",
    "data-sidebar": "menu-sub",
    className: oe(
      "border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5",
      "group-data-[collapsible=icon]:hidden",
      e,
    ),
    ...t,
  });
}
function SN({ className: e, ...t }) {
  return x.jsx("li", {
    "data-slot": "sidebar-menu-sub-item",
    "data-sidebar": "menu-sub-item",
    className: oe("group/menu-sub-item relative", e),
    ...t,
  });
}
function wN({
  asChild: e = !1,
  size: t = "md",
  isActive: n = !1,
  className: a,
  ...o
}) {
  const r = e ? or : "a";
  return x.jsx(r, {
    "data-slot": "sidebar-menu-sub-button",
    "data-sidebar": "menu-sub-button",
    "data-size": t,
    "data-active": n,
    className: oe(
      "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-primary active:text-sidebar-primary-foreground [&>svg]:text-sidebar-primary-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
      "data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground",
      t === "sm" && "text-xs",
      t === "md" && "text-sm",
      "group-data-[collapsible=icon]:hidden",
      a,
    ),
    ...o,
  });
}
const at = 0,
  Me = 1,
  VD = 2,
  ID = 0,
  yf = 1;
function GD(e, t, n) {
  let a = e.list,
    o;
  for (; a; ) {
    if (a.index === n) return !1;
    if (t > a.high) break;
    ((o = a), (a = a.next));
  }
  return (
    o || (e.list = { index: n, high: t, next: a }),
    o && (o.next = { index: n, high: t, next: o.next }),
    !0
  );
}
function YD(e, t) {
  let n = e.list;
  if (n.index === t) return n.next === null ? ID : ((e.list = n.next), yf);
  let a = n;
  for (n = n.next; n !== null; ) {
    if (n.index === t) return ((a.next = n.next), yf);
    ((a = n), (n = n.next));
  }
}
const se = {
  low: 0,
  max: 0,
  high: 0,
  C: VD,
  P: void 0,
  R: void 0,
  L: void 0,
  list: void 0,
};
se.P = se;
se.L = se;
se.R = se;
function da(e) {
  const t = e.high;
  e.L === se && e.R === se
    ? (e.max = t)
    : e.L === se
      ? (e.max = Math.max(e.R.max, t))
      : e.R === se
        ? (e.max = Math.max(e.L.max, t))
        : (e.max = Math.max(Math.max(e.L.max, e.R.max), t));
}
function ll(e) {
  let t = e;
  for (; t.P !== se; ) (da(t.P), (t = t.P));
}
function Gr(e, t) {
  if (t.R === se) return;
  const n = t.R;
  ((t.R = n.L),
    n.L !== se && (n.L.P = t),
    (n.P = t.P),
    t.P === se ? (e.root = n) : t === t.P.L ? (t.P.L = n) : (t.P.R = n),
    (n.L = t),
    (t.P = n),
    da(t),
    da(n));
}
function Yr(e, t) {
  if (t.L === se) return;
  const n = t.L;
  ((t.L = n.R),
    n.R !== se && (n.R.P = t),
    (n.P = t.P),
    t.P === se ? (e.root = n) : t === t.P.R ? (t.P.R = n) : (t.P.L = n),
    (n.R = t),
    (t.P = n),
    da(t),
    da(n));
}
function sl(e, t, n) {
  (t.P === se ? (e.root = n) : t === t.P.L ? (t.P.L = n) : (t.P.R = n),
    (n.P = t.P));
}
function FD(e, t) {
  let n;
  for (; t !== se && t.C === Me; )
    t === t.P.L
      ? ((n = t.P.R),
        n.C === at && ((n.C = Me), (t.P.C = at), Gr(e, t.P), (n = t.P.R)),
        n.L.C === Me && n.R.C === Me
          ? ((n.C = at), (t = t.P))
          : (n.R.C === Me && ((n.L.C = Me), (n.C = at), Yr(e, n), (n = t.P.R)),
            (n.C = t.P.C),
            (t.P.C = Me),
            (n.R.C = Me),
            Gr(e, t.P),
            (t = e.root)))
      : ((n = t.P.L),
        n.C === at && ((n.C = Me), (t.P.C = at), Yr(e, t.P), (n = t.P.L)),
        n.R.C === Me && n.L.C === Me
          ? ((n.C = at), (t = t.P))
          : (n.L.C === Me && ((n.R.C = Me), (n.C = at), Gr(e, n), (n = t.P.L)),
            (n.C = t.P.C),
            (t.P.C = Me),
            (n.L.C = Me),
            Yr(e, t.P),
            (t = e.root)));
  t.C = Me;
}
function KD(e) {
  for (; e.L !== se; ) e = e.L;
  return e;
}
function qD(e, t) {
  let n;
  for (; t.P.C === at; )
    t.P === t.P.P.L
      ? ((n = t.P.P.R),
        n.C === at
          ? ((t.P.C = Me), (n.C = Me), (t.P.P.C = at), (t = t.P.P))
          : (t === t.P.R && ((t = t.P), Gr(e, t)),
            (t.P.C = Me),
            (t.P.P.C = at),
            Yr(e, t.P.P)))
      : ((n = t.P.P.L),
        n.C === at
          ? ((t.P.C = Me), (n.C = Me), (t.P.P.C = at), (t = t.P.P))
          : (t === t.P.L && ((t = t.P), Yr(e, t)),
            (t.P.C = Me),
            (t.P.P.C = at),
            Gr(e, t.P.P)));
  e.root.C = Me;
}
function hh() {
  const e = { root: se, size: 0 },
    t = {};
  return {
    insert(n, a, o) {
      let r = e.root,
        i = se;
      for (; r !== se && ((i = r), n !== i.low); )
        n < r.low ? (r = r.L) : (r = r.R);
      if (n === i.low && i !== se) {
        if (!GD(i, a, o)) return;
        ((i.high = Math.max(i.high, a)), da(i), ll(i), (t[o] = i), e.size++);
        return;
      }
      const l = {
        low: n,
        high: a,
        max: a,
        C: at,
        P: i,
        L: se,
        R: se,
        list: { index: o, high: a, next: null },
      };
      (i === se ? (e.root = l) : (l.low < i.low ? (i.L = l) : (i.R = l), ll(l)),
        qD(e, l),
        (t[o] = l),
        e.size++);
    },
    remove(n) {
      const a = t[n];
      if (a === void 0) return;
      delete t[n];
      const o = YD(a, n);
      if (o === void 0) return;
      if (o === yf) {
        ((a.high = a.list.high), da(a), ll(a), e.size--);
        return;
      }
      let r = a,
        i = r.C,
        l;
      (a.L === se
        ? ((l = a.R), sl(e, a, a.R))
        : a.R === se
          ? ((l = a.L), sl(e, a, a.L))
          : ((r = KD(a.R)),
            (i = r.C),
            (l = r.R),
            r.P === a ? (l.P = r) : (sl(e, r, r.R), (r.R = a.R), (r.R.P = r)),
            sl(e, a, r),
            (r.L = a.L),
            (r.L.P = r),
            (r.C = a.C)),
        da(l),
        ll(l),
        i === Me && FD(e, l),
        e.size--);
    },
    search(n, a, o) {
      const r = [e.root];
      for (; r.length !== 0; ) {
        const i = r.pop();
        if (
          !(i === se || n > i.max) &&
          (i.L !== se && r.push(i.L),
          i.R !== se && r.push(i.R),
          i.low <= a && i.high >= n)
        ) {
          let l = i.list;
          for (; l !== null; ) (l.high >= n && o(l.index, i.low), (l = l.next));
        }
      }
    },
    get size() {
      return e.size;
    },
  };
}
function XD(e, t) {
  let n = 0,
    a = e.length - 1;
  for (; n <= a; ) {
    const o = (n + a) >>> 1,
      r = e[o];
    if (r === t) return o;
    r <= t ? (n = o + 1) : (a = o - 1);
  }
  return -1;
}
function $D(e, t, n = 0, a = n) {
  let o = hh(),
    r = new Array(e).fill(0),
    i = [],
    l = new Array(e);
  for (let s = 0; s < e; s++) l[s] = [];
  return {
    columnCount: e,
    columnWidth: t,
    set(s, c = 0) {
      let f = 0;
      for (let d = 1; d < r.length; d++) r[d] < r[f] && (f = d);
      const u = r[f] || 0;
      ((r[f] = u + c + a),
        l[f].push(s),
        (i[s] = { left: f * (t + n), top: u, height: c, column: f }),
        o.insert(u, u + c, s));
    },
    get(s) {
      return i[s];
    },
    update(s) {
      const c = new Array(e);
      let f = 0,
        u = 0;
      for (; f < s.length - 1; f++) {
        const d = s[f],
          g = i[d];
        g &&
          ((g.height = s[++f]),
          o.remove(d),
          o.insert(g.top, g.top + g.height, d),
          (c[g.column] =
            c[g.column] === void 0 ? d : Math.min(d, c[g.column])));
      }
      for (f = 0; f < c.length; f++) {
        if (c[f] === void 0) continue;
        const d = l[f],
          g = XD(d, c[f]);
        if (g === -1) continue;
        const S = l[f][g],
          v = i[S];
        if (v)
          for (r[f] = v.top + v.height + a, u = g + 1; u < d.length; u++) {
            const b = d[u],
              m = i[b];
            m &&
              ((m.top = r[f]),
              (r[f] = m.top + m.height + a),
              o.remove(b),
              o.insert(m.top, m.top + m.height, b));
          }
      }
    },
    range(s, c, f) {
      o.search(s, c, (u, d) => f(u, i[u].left, d));
    },
    estimateHeight(s, c) {
      const f = Math.max(0, Math.max.apply(null, r));
      return s === o.size ? f : f + Math.ceil((s - o.size) / e) * c;
    },
    shortestColumn() {
      return r.length > 1 ? Math.min.apply(null, r) : r[0] || 0;
    },
    tallestColumn() {
      return r.length > 1 ? Math.max.apply(null, r) : r[0] || 0;
    },
    size() {
      return o.size;
    },
    all() {
      return i;
    },
    clear() {
      ((o = hh()), (r = new Array(e).fill(0)), (i = []), (l = new Array(e)));
      for (let s = 0; s < e; s++) l[s] = [];
    },
    getColumnHeights() {
      return r;
    },
  };
}
const bf = new WeakMap();
function RS() {
  const [, e] = p.useState({});
  return p.useRef(() => e({})).current;
}
function ph(e) {
  let t = null;
  const n = (...a) => {
    (t !== null && cancelAnimationFrame(t),
      (t = requestAnimationFrame(() => {
        ((t = null), e(...a));
      })));
  };
  return (
    (n.cancel = () => {
      t !== null && (cancelAnimationFrame(t), (t = null));
    }),
    n
  );
}
function vh(e, t) {
  const n = [],
    a = new Map(),
    o = ph(() => {
      (n.length > 0 && (e.update(n), t()), (n.length = 0));
    }),
    r = (c) => {
      const f = c.offsetHeight;
      if (f > 0) {
        const u = bf.get(c);
        if (u !== void 0) {
          const d = e.get(u);
          d !== void 0 && f !== d.height && n.push(u, f);
        }
      }
      o();
    },
    i = (c) => {
      for (let f = 0; f < c.length; f++) {
        const u = c[f],
          d = bf.get(u.target);
        if (d === void 0) continue;
        let g = a.get(d);
        (g || ((g = ph(r)), a.set(d, g)), g(u.target));
      }
    },
    l = new ResizeObserver(i),
    s = l.disconnect.bind(l);
  return (
    (l.disconnect = () => {
      (s(), o.cancel(), a.forEach((c) => c.cancel()), a.clear());
    }),
    l
  );
}
function QD(e) {
  const t = RS(),
    n = p.useRef(null);
  return (
    n.current || (n.current = vh(e, t)),
    p.useEffect(
      () => () => {
        var a;
        (a = n.current) == null || a.disconnect();
      },
      [],
    ),
    p.useEffect(() => {
      var a;
      ((a = n.current) == null || a.disconnect(), (n.current = vh(e, t)));
    }, [e, t]),
    n.current
  );
}
function ZD(e, t = 0) {
  const [n, a] = p.useState(0),
    [o, r] = p.useState(!1),
    i = p.useRef(null);
  return (
    p.useEffect(() => {
      const l = e || window,
        s = () => (l instanceof Window ? l.scrollY : l.scrollTop);
      let c = null;
      const f = () => {
        c === null &&
          (c = requestAnimationFrame(() => {
            ((c = null),
              a(s() - t),
              r(!0),
              i.current !== null && clearTimeout(i.current),
              (i.current = window.setTimeout(() => {
                r(!1);
              }, 150)));
          }));
      };
      return (
        a(s() - t),
        l.addEventListener("scroll", f, { passive: !0 }),
        () => {
          (l.removeEventListener("scroll", f),
            c !== null && cancelAnimationFrame(c),
            i.current !== null && clearTimeout(i.current));
        }
      );
    }, [e, t]),
    { scrollTop: n, isScrolling: o }
  );
}
function JD(e, t, n = []) {
  const [a, o] = p.useState({ offset: 0, width: 0, height: 0 });
  return (
    p.useLayoutEffect(() => {
      const r = () => {
        const l = e.current;
        if (!l) return;
        const s = t || document.documentElement,
          c = l.getBoundingClientRect(),
          f = s.getBoundingClientRect(),
          u =
            c.top -
            f.top +
            ((t == null ? void 0 : t.scrollTop) ?? window.scrollY),
          d = l.offsetWidth,
          g = (t == null ? void 0 : t.clientHeight) ?? window.innerHeight;
        o({ offset: u, width: d, height: g });
      };
      (r(), window.addEventListener("resize", r));
      const i = new ResizeObserver(r);
      return (
        e.current && i.observe(e.current),
        () => {
          (window.removeEventListener("resize", r), i.disconnect());
        }
      );
    }, [e, t, ...n]),
    a
  );
}
function WD(e) {
  return e
    ? typeof e == "function"
      ? e()
      : typeof e == "string"
        ? document.getElementById(e)
        : e
    : null;
}
function su(e, t, n) {
  return n && e[n] !== void 0 ? String(e[n]) : String(t);
}
const e2 = L.memo(function ({
    index: t,
    position: n,
    columnWidth: a,
    resizeObserver: o,
    positioner: r,
    children: i,
    recordId: l,
  }) {
    const s = p.useCallback(
      (u) => {
        u !== null &&
          (o.observe(u),
          bf.set(u, t),
          r.get(t) === void 0 && r.set(t, u.offsetHeight));
      },
      [t, o, r],
    );
    let c, f;
    return (
      n
        ? ((c = {
            position: "absolute",
            top: 0,
            left: 0,
            transform: `translate(${n.left}px, ${n.top}px)`,
            width: a,
            writingMode: "horizontal-tb",
          }),
          (f = "masonry-item visible pointer-events-auto"))
        : ((c = {
            position: "absolute",
            width: a,
            zIndex: -1e3,
            visibility: "hidden",
            writingMode: "horizontal-tb",
          }),
          (f = "masonry-item invisible pointer-events-none")),
      x.jsx("div", {
        ref: s,
        "data-masonry-id": l,
        "data-masonry-index": t,
        className: f,
        style: c,
        children: i,
      })
    );
  }),
  t2 = 800,
  xN = p.forwardRef(function (
    {
      brickId: t,
      bricks: n = [],
      render: a,
      gutter: o = 24,
      columnSize: r = 240,
      columnNum: i = 4,
      children: l,
      threshold: s = 2,
      scrollElement: c,
      className: f = "masonry",
      onRendered: u,
      itemHeightEstimate: d = 300,
    },
    g,
  ) {
    const S = p.useRef(null),
      v = RS(),
      [b, m] = p.useState(0),
      h = p.useMemo(() => WD(c), [c]),
      y = JD(S, h),
      w = p.useMemo(() => $D(i, r, o, o), [i, r, o]),
      C = p.useRef(w);
    p.useEffect(() => {
      C.current !== w &&
        ((C.current = w),
        requestAnimationFrame(() => {
          m((D) => D + 1);
        }));
    }, [w]);
    const R = QD(w),
      { scrollTop: E, isScrolling: A } = ZD(h, y.offset),
      O = p.useMemo(() => {
        const D = [];
        return (
          L.Children.forEach(l, (j, q) => {
            j &&
              D.push({
                mansonryInnerChildIndex: q,
                [t || "id"]: `childId_${q}`,
              });
          }),
          D.push(...n),
          D
        );
      }, [t, n, l]),
      N = y.height > 0 ? y.height : t2,
      B = p.useMemo(() => {
        const D = N * s,
          j = Math.max(0, E - D / 2),
          q = E + N + D;
        return { top: j, bottom: q };
      }, [E, N, s]),
      {
        renderedItems: z,
        startIndex: G,
        stopIndex: V,
        needsFreshBatch: Y,
      } = p.useMemo(() => {
        const { columnWidth: D, range: j, size: q, shortestColumn: le } = w,
          U = q(),
          I = O.length,
          X = le(),
          fe = [];
        let Q = 0,
          W;
        j(B.top, B.bottom, (be, ct, qe) => {
          const Ve = O[be];
          if (Ve) {
            const Lt = w.get(be),
              xa = su(Ve, be, t);
            (fe.push({
              index: be,
              brick: Ve,
              position: Lt || null,
              recordId: xa,
            }),
              W === void 0
                ? ((Q = be), (W = be))
                : ((Q = Math.min(Q, be)), (W = Math.max(W, be))));
          }
        });
        const pe = U < I && (X < B.bottom || U === 0);
        if (pe) {
          const be = Math.ceil(N / d),
            ct = Math.max(w.columnCount * be, 10),
            qe = Math.min(
              I - U,
              Math.max(ct, Math.ceil(((E + N * s - X) / d) * w.columnCount)),
              50,
            );
          for (let Ve = U; Ve < U + qe && Ve < I; Ve++) {
            const Lt = O[Ve];
            if (Lt) {
              const xa = su(Lt, Ve, t);
              fe.push({ index: Ve, brick: Lt, position: null, recordId: xa });
            }
          }
        }
        return {
          renderedItems: fe,
          startIndex: Q,
          stopIndex: W,
          needsFreshBatch: pe,
        };
      }, [w, O, B, E, N, s, d, t, b]);
    (p.useEffect(() => {
      if (Y) {
        const D = requestAnimationFrame(() => {
          v();
        });
        return () => cancelAnimationFrame(D);
      }
    }, [Y, v, z.length]),
      p.useEffect(() => {
        u && V !== void 0 && u(G, V);
      }, [G, V, u]));
    const M = p.useMemo(() => L.Children.toArray(l), [l]),
      _ = p.useCallback(
        (D) =>
          D.mansonryInnerChildIndex !== void 0
            ? M[D.mansonryInnerChildIndex]
            : a(D),
        [M, a],
      );
    p.useImperativeHandle(g, () => ({
      getBricksPosition: () => {
        var q, le, U, I;
        const D = new Map(),
          j = w.size();
        for (let X = 0; X < j; X++) {
          const fe = w.get(X),
            Q = O[X];
          if (fe && Q) {
            const W = su(Q, X, t);
            D.set(W, fe);
          }
        }
        return {
          containerOffsetTop:
            (le =
              (q = S.current) == null ? void 0 : q.getBoundingClientRect()) ==
            null
              ? void 0
              : le.top,
          containerOffsetLeft:
            (I =
              (U = S.current) == null ? void 0 : U.getBoundingClientRect()) ==
            null
              ? void 0
              : I.left,
          computedBricks: { current: D },
        };
      },
      relayout: () => {
        (w.clear(), m((D) => D + 1), v());
      },
    }));
    const T = p.useMemo(
      () => ({
        position: "relative",
        width: "100%",
        height: w.estimateHeight(O.length, d),
        maxHeight: w.estimateHeight(O.length, d),
        willChange: A ? "contents" : void 0,
        pointerEvents: A ? "none" : void 0,
      }),
      [w, O.length, d, A],
    );
    return x.jsx("div", {
      className: f,
      style: T,
      ref: S,
      children: z.map((D) =>
        x.jsx(
          e2,
          {
            index: D.index,
            position: D.position,
            columnWidth: w.columnWidth,
            resizeObserver: R,
            positioner: w,
            recordId: D.recordId,
            children: _(D.brick),
          },
          D.recordId,
        ),
      ),
    });
  });
function n2(e) {
  if (typeof document > "u") return;
  let t = document.head || document.getElementsByTagName("head")[0],
    n = document.createElement("style");
  ((n.type = "text/css"),
    t.appendChild(n),
    n.styleSheet
      ? (n.styleSheet.cssText = e)
      : n.appendChild(document.createTextNode(e)));
}
const a2 = (e) => {
    switch (e) {
      case "success":
        return i2;
      case "info":
        return s2;
      case "warning":
        return l2;
      case "error":
        return c2;
      default:
        return null;
    }
  },
  o2 = Array(12).fill(0),
  r2 = ({ visible: e, className: t }) =>
    L.createElement(
      "div",
      {
        className: ["sonner-loading-wrapper", t].filter(Boolean).join(" "),
        "data-visible": e,
      },
      L.createElement(
        "div",
        { className: "sonner-spinner" },
        o2.map((n, a) =>
          L.createElement("div", {
            className: "sonner-loading-bar",
            key: `spinner-bar-${a}`,
          }),
        ),
      ),
    ),
  i2 = L.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 20 20",
      fill: "currentColor",
      height: "20",
      width: "20",
    },
    L.createElement("path", {
      fillRule: "evenodd",
      d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z",
      clipRule: "evenodd",
    }),
  ),
  l2 = L.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      fill: "currentColor",
      height: "20",
      width: "20",
    },
    L.createElement("path", {
      fillRule: "evenodd",
      d: "M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z",
      clipRule: "evenodd",
    }),
  ),
  s2 = L.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 20 20",
      fill: "currentColor",
      height: "20",
      width: "20",
    },
    L.createElement("path", {
      fillRule: "evenodd",
      d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z",
      clipRule: "evenodd",
    }),
  ),
  c2 = L.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 20 20",
      fill: "currentColor",
      height: "20",
      width: "20",
    },
    L.createElement("path", {
      fillRule: "evenodd",
      d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z",
      clipRule: "evenodd",
    }),
  ),
  u2 = L.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: "12",
      height: "12",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
    },
    L.createElement("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
    L.createElement("line", { x1: "6", y1: "6", x2: "18", y2: "18" }),
  ),
  f2 = () => {
    const [e, t] = L.useState(document.hidden);
    return (
      L.useEffect(() => {
        const n = () => {
          t(document.hidden);
        };
        return (
          document.addEventListener("visibilitychange", n),
          () => window.removeEventListener("visibilitychange", n)
        );
      }, []),
      e
    );
  };
let Sf = 1;
class d2 {
  constructor() {
    ((this.subscribe = (t) => (
      this.subscribers.push(t),
      () => {
        const n = this.subscribers.indexOf(t);
        this.subscribers.splice(n, 1);
      }
    )),
      (this.publish = (t) => {
        this.subscribers.forEach((n) => n(t));
      }),
      (this.addToast = (t) => {
        (this.publish(t), (this.toasts = [...this.toasts, t]));
      }),
      (this.create = (t) => {
        var n;
        const { message: a, ...o } = t,
          r =
            typeof (t == null ? void 0 : t.id) == "number" ||
            ((n = t.id) == null ? void 0 : n.length) > 0
              ? t.id
              : Sf++,
          i = this.toasts.find((s) => s.id === r),
          l = t.dismissible === void 0 ? !0 : t.dismissible;
        return (
          this.dismissedToasts.has(r) && this.dismissedToasts.delete(r),
          i
            ? (this.toasts = this.toasts.map((s) =>
                s.id === r
                  ? (this.publish({ ...s, ...t, id: r, title: a }),
                    { ...s, ...t, id: r, dismissible: l, title: a })
                  : s,
              ))
            : this.addToast({ title: a, ...o, dismissible: l, id: r }),
          r
        );
      }),
      (this.dismiss = (t) => (
        t
          ? (this.dismissedToasts.add(t),
            requestAnimationFrame(() =>
              this.subscribers.forEach((n) => n({ id: t, dismiss: !0 })),
            ))
          : this.toasts.forEach((n) => {
              this.subscribers.forEach((a) => a({ id: n.id, dismiss: !0 }));
            }),
        t
      )),
      (this.message = (t, n) => this.create({ ...n, message: t })),
      (this.error = (t, n) => this.create({ ...n, message: t, type: "error" })),
      (this.success = (t, n) =>
        this.create({ ...n, type: "success", message: t })),
      (this.info = (t, n) => this.create({ ...n, type: "info", message: t })),
      (this.warning = (t, n) =>
        this.create({ ...n, type: "warning", message: t })),
      (this.loading = (t, n) =>
        this.create({ ...n, type: "loading", message: t })),
      (this.promise = (t, n) => {
        if (!n) return;
        let a;
        n.loading !== void 0 &&
          (a = this.create({
            ...n,
            promise: t,
            type: "loading",
            message: n.loading,
            description:
              typeof n.description != "function" ? n.description : void 0,
          }));
        const o = Promise.resolve(t instanceof Function ? t() : t);
        let r = a !== void 0,
          i;
        const l = o
            .then(async (c) => {
              if (((i = ["resolve", c]), L.isValidElement(c)))
                ((r = !1), this.create({ id: a, type: "default", message: c }));
              else if (g2(c) && !c.ok) {
                r = !1;
                const u =
                    typeof n.error == "function"
                      ? await n.error(`HTTP error! status: ${c.status}`)
                      : n.error,
                  d =
                    typeof n.description == "function"
                      ? await n.description(`HTTP error! status: ${c.status}`)
                      : n.description,
                  S =
                    typeof u == "object" && !L.isValidElement(u)
                      ? u
                      : { message: u };
                this.create({ id: a, type: "error", description: d, ...S });
              } else if (c instanceof Error) {
                r = !1;
                const u =
                    typeof n.error == "function" ? await n.error(c) : n.error,
                  d =
                    typeof n.description == "function"
                      ? await n.description(c)
                      : n.description,
                  S =
                    typeof u == "object" && !L.isValidElement(u)
                      ? u
                      : { message: u };
                this.create({ id: a, type: "error", description: d, ...S });
              } else if (n.success !== void 0) {
                r = !1;
                const u =
                    typeof n.success == "function"
                      ? await n.success(c)
                      : n.success,
                  d =
                    typeof n.description == "function"
                      ? await n.description(c)
                      : n.description,
                  S =
                    typeof u == "object" && !L.isValidElement(u)
                      ? u
                      : { message: u };
                this.create({ id: a, type: "success", description: d, ...S });
              }
            })
            .catch(async (c) => {
              if (((i = ["reject", c]), n.error !== void 0)) {
                r = !1;
                const f =
                    typeof n.error == "function" ? await n.error(c) : n.error,
                  u =
                    typeof n.description == "function"
                      ? await n.description(c)
                      : n.description,
                  g =
                    typeof f == "object" && !L.isValidElement(f)
                      ? f
                      : { message: f };
                this.create({ id: a, type: "error", description: u, ...g });
              }
            })
            .finally(() => {
              (r && (this.dismiss(a), (a = void 0)),
                n.finally == null || n.finally.call(n));
            }),
          s = () =>
            new Promise((c, f) =>
              l.then(() => (i[0] === "reject" ? f(i[1]) : c(i[1]))).catch(f),
            );
        return typeof a != "string" && typeof a != "number"
          ? { unwrap: s }
          : Object.assign(a, { unwrap: s });
      }),
      (this.custom = (t, n) => {
        const a = (n == null ? void 0 : n.id) || Sf++;
        return (this.create({ jsx: t(a), id: a, ...n }), a);
      }),
      (this.getActiveToasts = () =>
        this.toasts.filter((t) => !this.dismissedToasts.has(t.id))),
      (this.subscribers = []),
      (this.toasts = []),
      (this.dismissedToasts = new Set()));
  }
}
const ht = new d2(),
  m2 = (e, t) => {
    const n = (t == null ? void 0 : t.id) || Sf++;
    return (ht.addToast({ title: e, ...t, id: n }), n);
  },
  g2 = (e) =>
    e &&
    typeof e == "object" &&
    "ok" in e &&
    typeof e.ok == "boolean" &&
    "status" in e &&
    typeof e.status == "number",
  h2 = m2,
  p2 = () => ht.toasts,
  v2 = () => ht.getActiveToasts(),
  EN = Object.assign(
    h2,
    {
      success: ht.success,
      info: ht.info,
      warning: ht.warning,
      error: ht.error,
      custom: ht.custom,
      message: ht.message,
      promise: ht.promise,
      dismiss: ht.dismiss,
      loading: ht.loading,
    },
    { getHistory: p2, getToasts: v2 },
  );
n2(
  "[data-sonner-toaster][dir=ltr],html[dir=ltr]{--toast-icon-margin-start:-3px;--toast-icon-margin-end:4px;--toast-svg-margin-start:-1px;--toast-svg-margin-end:0px;--toast-button-margin-start:auto;--toast-button-margin-end:0;--toast-close-button-start:0;--toast-close-button-end:unset;--toast-close-button-transform:translate(-35%, -35%)}[data-sonner-toaster][dir=rtl],html[dir=rtl]{--toast-icon-margin-start:4px;--toast-icon-margin-end:-3px;--toast-svg-margin-start:0px;--toast-svg-margin-end:-1px;--toast-button-margin-start:0;--toast-button-margin-end:auto;--toast-close-button-start:unset;--toast-close-button-end:0;--toast-close-button-transform:translate(35%, -35%)}[data-sonner-toaster]{position:fixed;width:var(--width);font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;--gray1:hsl(0, 0%, 99%);--gray2:hsl(0, 0%, 97.3%);--gray3:hsl(0, 0%, 95.1%);--gray4:hsl(0, 0%, 93%);--gray5:hsl(0, 0%, 90.9%);--gray6:hsl(0, 0%, 88.7%);--gray7:hsl(0, 0%, 85.8%);--gray8:hsl(0, 0%, 78%);--gray9:hsl(0, 0%, 56.1%);--gray10:hsl(0, 0%, 52.3%);--gray11:hsl(0, 0%, 43.5%);--gray12:hsl(0, 0%, 9%);--border-radius:8px;box-sizing:border-box;padding:0;margin:0;list-style:none;outline:0;z-index:999999999;transition:transform .4s ease}@media (hover:none) and (pointer:coarse){[data-sonner-toaster][data-lifted=true]{transform:none}}[data-sonner-toaster][data-x-position=right]{right:var(--offset-right)}[data-sonner-toaster][data-x-position=left]{left:var(--offset-left)}[data-sonner-toaster][data-x-position=center]{left:50%;transform:translateX(-50%)}[data-sonner-toaster][data-y-position=top]{top:var(--offset-top)}[data-sonner-toaster][data-y-position=bottom]{bottom:var(--offset-bottom)}[data-sonner-toast]{--y:translateY(100%);--lift-amount:calc(var(--lift) * var(--gap));z-index:var(--z-index);position:absolute;opacity:0;transform:var(--y);touch-action:none;transition:transform .4s,opacity .4s,height .4s,box-shadow .2s;box-sizing:border-box;outline:0;overflow-wrap:anywhere}[data-sonner-toast][data-styled=true]{padding:16px;background:var(--normal-bg);border:1px solid var(--normal-border);color:var(--normal-text);border-radius:var(--border-radius);box-shadow:0 4px 12px rgba(0,0,0,.1);width:var(--width);font-size:13px;display:flex;align-items:center;gap:6px}[data-sonner-toast]:focus-visible{box-shadow:0 4px 12px rgba(0,0,0,.1),0 0 0 2px rgba(0,0,0,.2)}[data-sonner-toast][data-y-position=top]{top:0;--y:translateY(-100%);--lift:1;--lift-amount:calc(1 * var(--gap))}[data-sonner-toast][data-y-position=bottom]{bottom:0;--y:translateY(100%);--lift:-1;--lift-amount:calc(var(--lift) * var(--gap))}[data-sonner-toast][data-styled=true] [data-description]{font-weight:400;line-height:1.4;color:#3f3f3f}[data-rich-colors=true][data-sonner-toast][data-styled=true] [data-description]{color:inherit}[data-sonner-toaster][data-sonner-theme=dark] [data-description]{color:#e8e8e8}[data-sonner-toast][data-styled=true] [data-title]{font-weight:500;line-height:1.5;color:inherit}[data-sonner-toast][data-styled=true] [data-icon]{display:flex;height:16px;width:16px;position:relative;justify-content:flex-start;align-items:center;flex-shrink:0;margin-left:var(--toast-icon-margin-start);margin-right:var(--toast-icon-margin-end)}[data-sonner-toast][data-promise=true] [data-icon]>svg{opacity:0;transform:scale(.8);transform-origin:center;animation:sonner-fade-in .3s ease forwards}[data-sonner-toast][data-styled=true] [data-icon]>*{flex-shrink:0}[data-sonner-toast][data-styled=true] [data-icon] svg{margin-left:var(--toast-svg-margin-start);margin-right:var(--toast-svg-margin-end)}[data-sonner-toast][data-styled=true] [data-content]{display:flex;flex-direction:column;gap:2px}[data-sonner-toast][data-styled=true] [data-button]{border-radius:4px;padding-left:8px;padding-right:8px;height:24px;font-size:12px;color:var(--normal-bg);background:var(--normal-text);margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end);border:none;font-weight:500;cursor:pointer;outline:0;display:flex;align-items:center;flex-shrink:0;transition:opacity .4s,box-shadow .2s}[data-sonner-toast][data-styled=true] [data-button]:focus-visible{box-shadow:0 0 0 2px rgba(0,0,0,.4)}[data-sonner-toast][data-styled=true] [data-button]:first-of-type{margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end)}[data-sonner-toast][data-styled=true] [data-cancel]{color:var(--normal-text);background:rgba(0,0,0,.08)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast][data-styled=true] [data-cancel]{background:rgba(255,255,255,.3)}[data-sonner-toast][data-styled=true] [data-close-button]{position:absolute;left:var(--toast-close-button-start);right:var(--toast-close-button-end);top:0;height:20px;width:20px;display:flex;justify-content:center;align-items:center;padding:0;color:var(--gray12);background:var(--normal-bg);border:1px solid var(--gray4);transform:var(--toast-close-button-transform);border-radius:50%;cursor:pointer;z-index:1;transition:opacity .1s,background .2s,border-color .2s}[data-sonner-toast][data-styled=true] [data-close-button]:focus-visible{box-shadow:0 4px 12px rgba(0,0,0,.1),0 0 0 2px rgba(0,0,0,.2)}[data-sonner-toast][data-styled=true] [data-disabled=true]{cursor:not-allowed}[data-sonner-toast][data-styled=true]:hover [data-close-button]:hover{background:var(--gray2);border-color:var(--gray5)}[data-sonner-toast][data-swiping=true]::before{content:'';position:absolute;left:-100%;right:-100%;height:100%;z-index:-1}[data-sonner-toast][data-y-position=top][data-swiping=true]::before{bottom:50%;transform:scaleY(3) translateY(50%)}[data-sonner-toast][data-y-position=bottom][data-swiping=true]::before{top:50%;transform:scaleY(3) translateY(-50%)}[data-sonner-toast][data-swiping=false][data-removed=true]::before{content:'';position:absolute;inset:0;transform:scaleY(2)}[data-sonner-toast][data-expanded=true]::after{content:'';position:absolute;left:0;height:calc(var(--gap) + 1px);bottom:100%;width:100%}[data-sonner-toast][data-mounted=true]{--y:translateY(0);opacity:1}[data-sonner-toast][data-expanded=false][data-front=false]{--scale:var(--toasts-before) * 0.05 + 1;--y:translateY(calc(var(--lift-amount) * var(--toasts-before))) scale(calc(-1 * var(--scale)));height:var(--front-toast-height)}[data-sonner-toast]>*{transition:opacity .4s}[data-sonner-toast][data-x-position=right]{right:0}[data-sonner-toast][data-x-position=left]{left:0}[data-sonner-toast][data-expanded=false][data-front=false][data-styled=true]>*{opacity:0}[data-sonner-toast][data-visible=false]{opacity:0;pointer-events:none}[data-sonner-toast][data-mounted=true][data-expanded=true]{--y:translateY(calc(var(--lift) * var(--offset)));height:var(--initial-height)}[data-sonner-toast][data-removed=true][data-front=true][data-swipe-out=false]{--y:translateY(calc(var(--lift) * -100%));opacity:0}[data-sonner-toast][data-removed=true][data-front=false][data-swipe-out=false][data-expanded=true]{--y:translateY(calc(var(--lift) * var(--offset) + var(--lift) * -100%));opacity:0}[data-sonner-toast][data-removed=true][data-front=false][data-swipe-out=false][data-expanded=false]{--y:translateY(40%);opacity:0;transition:transform .5s,opacity .2s}[data-sonner-toast][data-removed=true][data-front=false]::before{height:calc(var(--initial-height) + 20%)}[data-sonner-toast][data-swiping=true]{transform:var(--y) translateY(var(--swipe-amount-y,0)) translateX(var(--swipe-amount-x,0));transition:none}[data-sonner-toast][data-swiped=true]{user-select:none}[data-sonner-toast][data-swipe-out=true][data-y-position=bottom],[data-sonner-toast][data-swipe-out=true][data-y-position=top]{animation-duration:.2s;animation-timing-function:ease-out;animation-fill-mode:forwards}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=left]{animation-name:swipe-out-left}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=right]{animation-name:swipe-out-right}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=up]{animation-name:swipe-out-up}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=down]{animation-name:swipe-out-down}@keyframes swipe-out-left{from{transform:var(--y) translateX(var(--swipe-amount-x));opacity:1}to{transform:var(--y) translateX(calc(var(--swipe-amount-x) - 100%));opacity:0}}@keyframes swipe-out-right{from{transform:var(--y) translateX(var(--swipe-amount-x));opacity:1}to{transform:var(--y) translateX(calc(var(--swipe-amount-x) + 100%));opacity:0}}@keyframes swipe-out-up{from{transform:var(--y) translateY(var(--swipe-amount-y));opacity:1}to{transform:var(--y) translateY(calc(var(--swipe-amount-y) - 100%));opacity:0}}@keyframes swipe-out-down{from{transform:var(--y) translateY(var(--swipe-amount-y));opacity:1}to{transform:var(--y) translateY(calc(var(--swipe-amount-y) + 100%));opacity:0}}@media (max-width:600px){[data-sonner-toaster]{position:fixed;right:var(--mobile-offset-right);left:var(--mobile-offset-left);width:100%}[data-sonner-toaster][dir=rtl]{left:calc(var(--mobile-offset-left) * -1)}[data-sonner-toaster] [data-sonner-toast]{left:0;right:0;width:calc(100% - var(--mobile-offset-left) * 2)}[data-sonner-toaster][data-x-position=left]{left:var(--mobile-offset-left)}[data-sonner-toaster][data-y-position=bottom]{bottom:var(--mobile-offset-bottom)}[data-sonner-toaster][data-y-position=top]{top:var(--mobile-offset-top)}[data-sonner-toaster][data-x-position=center]{left:var(--mobile-offset-left);right:var(--mobile-offset-right);transform:none}}[data-sonner-toaster][data-sonner-theme=light]{--normal-bg:#fff;--normal-border:var(--gray4);--normal-text:var(--gray12);--success-bg:hsl(143, 85%, 96%);--success-border:hsl(145, 92%, 87%);--success-text:hsl(140, 100%, 27%);--info-bg:hsl(208, 100%, 97%);--info-border:hsl(221, 91%, 93%);--info-text:hsl(210, 92%, 45%);--warning-bg:hsl(49, 100%, 97%);--warning-border:hsl(49, 91%, 84%);--warning-text:hsl(31, 92%, 45%);--error-bg:hsl(359, 100%, 97%);--error-border:hsl(359, 100%, 94%);--error-text:hsl(360, 100%, 45%)}[data-sonner-toaster][data-sonner-theme=light] [data-sonner-toast][data-invert=true]{--normal-bg:#000;--normal-border:hsl(0, 0%, 20%);--normal-text:var(--gray1)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast][data-invert=true]{--normal-bg:#fff;--normal-border:var(--gray3);--normal-text:var(--gray12)}[data-sonner-toaster][data-sonner-theme=dark]{--normal-bg:#000;--normal-bg-hover:hsl(0, 0%, 12%);--normal-border:hsl(0, 0%, 20%);--normal-border-hover:hsl(0, 0%, 25%);--normal-text:var(--gray1);--success-bg:hsl(150, 100%, 6%);--success-border:hsl(147, 100%, 12%);--success-text:hsl(150, 86%, 65%);--info-bg:hsl(215, 100%, 6%);--info-border:hsl(223, 43%, 17%);--info-text:hsl(216, 87%, 65%);--warning-bg:hsl(64, 100%, 6%);--warning-border:hsl(60, 100%, 9%);--warning-text:hsl(46, 87%, 65%);--error-bg:hsl(358, 76%, 10%);--error-border:hsl(357, 89%, 16%);--error-text:hsl(358, 100%, 81%)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast] [data-close-button]{background:var(--normal-bg);border-color:var(--normal-border);color:var(--normal-text)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast] [data-close-button]:hover{background:var(--normal-bg-hover);border-color:var(--normal-border-hover)}[data-rich-colors=true][data-sonner-toast][data-type=success]{background:var(--success-bg);border-color:var(--success-border);color:var(--success-text)}[data-rich-colors=true][data-sonner-toast][data-type=success] [data-close-button]{background:var(--success-bg);border-color:var(--success-border);color:var(--success-text)}[data-rich-colors=true][data-sonner-toast][data-type=info]{background:var(--info-bg);border-color:var(--info-border);color:var(--info-text)}[data-rich-colors=true][data-sonner-toast][data-type=info] [data-close-button]{background:var(--info-bg);border-color:var(--info-border);color:var(--info-text)}[data-rich-colors=true][data-sonner-toast][data-type=warning]{background:var(--warning-bg);border-color:var(--warning-border);color:var(--warning-text)}[data-rich-colors=true][data-sonner-toast][data-type=warning] [data-close-button]{background:var(--warning-bg);border-color:var(--warning-border);color:var(--warning-text)}[data-rich-colors=true][data-sonner-toast][data-type=error]{background:var(--error-bg);border-color:var(--error-border);color:var(--error-text)}[data-rich-colors=true][data-sonner-toast][data-type=error] [data-close-button]{background:var(--error-bg);border-color:var(--error-border);color:var(--error-text)}.sonner-loading-wrapper{--size:16px;height:var(--size);width:var(--size);position:absolute;inset:0;z-index:10}.sonner-loading-wrapper[data-visible=false]{transform-origin:center;animation:sonner-fade-out .2s ease forwards}.sonner-spinner{position:relative;top:50%;left:50%;height:var(--size);width:var(--size)}.sonner-loading-bar{animation:sonner-spin 1.2s linear infinite;background:var(--gray11);border-radius:6px;height:8%;left:-10%;position:absolute;top:-3.9%;width:24%}.sonner-loading-bar:first-child{animation-delay:-1.2s;transform:rotate(.0001deg) translate(146%)}.sonner-loading-bar:nth-child(2){animation-delay:-1.1s;transform:rotate(30deg) translate(146%)}.sonner-loading-bar:nth-child(3){animation-delay:-1s;transform:rotate(60deg) translate(146%)}.sonner-loading-bar:nth-child(4){animation-delay:-.9s;transform:rotate(90deg) translate(146%)}.sonner-loading-bar:nth-child(5){animation-delay:-.8s;transform:rotate(120deg) translate(146%)}.sonner-loading-bar:nth-child(6){animation-delay:-.7s;transform:rotate(150deg) translate(146%)}.sonner-loading-bar:nth-child(7){animation-delay:-.6s;transform:rotate(180deg) translate(146%)}.sonner-loading-bar:nth-child(8){animation-delay:-.5s;transform:rotate(210deg) translate(146%)}.sonner-loading-bar:nth-child(9){animation-delay:-.4s;transform:rotate(240deg) translate(146%)}.sonner-loading-bar:nth-child(10){animation-delay:-.3s;transform:rotate(270deg) translate(146%)}.sonner-loading-bar:nth-child(11){animation-delay:-.2s;transform:rotate(300deg) translate(146%)}.sonner-loading-bar:nth-child(12){animation-delay:-.1s;transform:rotate(330deg) translate(146%)}@keyframes sonner-fade-in{0%{opacity:0;transform:scale(.8)}100%{opacity:1;transform:scale(1)}}@keyframes sonner-fade-out{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.8)}}@keyframes sonner-spin{0%{opacity:1}100%{opacity:.15}}@media (prefers-reduced-motion){.sonner-loading-bar,[data-sonner-toast],[data-sonner-toast]>*{transition:none!important;animation:none!important}}.sonner-loader{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);transform-origin:center;transition:opacity .2s,transform .2s}.sonner-loader[data-visible=false]{opacity:0;transform:scale(.8) translate(-50%,-50%)}",
);
function cl(e) {
  return e.label !== void 0;
}
const y2 = 3,
  b2 = "24px",
  S2 = "16px",
  yh = 4e3,
  w2 = 356,
  x2 = 14,
  E2 = 45,
  C2 = 200;
function nn(...e) {
  return e.filter(Boolean).join(" ");
}
function A2(e) {
  const [t, n] = e.split("-"),
    a = [];
  return (t && a.push(t), n && a.push(n), a);
}
const T2 = (e) => {
  var t, n, a, o, r, i, l, s, c;
  const {
      invert: f,
      toast: u,
      unstyled: d,
      interacting: g,
      setHeights: S,
      visibleToasts: v,
      heights: b,
      index: m,
      toasts: h,
      expanded: y,
      removeToast: w,
      defaultRichColors: C,
      closeButton: R,
      style: E,
      cancelButtonStyle: A,
      actionButtonStyle: O,
      className: N = "",
      descriptionClassName: B = "",
      duration: z,
      position: G,
      gap: V,
      expandByDefault: Y,
      classNames: M,
      icons: _,
      closeButtonAriaLabel: T = "Close toast",
    } = e,
    [D, j] = L.useState(null),
    [q, le] = L.useState(null),
    [U, I] = L.useState(!1),
    [X, fe] = L.useState(!1),
    [Q, W] = L.useState(!1),
    [pe, be] = L.useState(!1),
    [ct, qe] = L.useState(!1),
    [Ve, Lt] = L.useState(0),
    [xa, Ni] = L.useState(0),
    Ea = L.useRef(u.duration || z || yh),
    _i = L.useRef(null),
    ut = L.useRef(null),
    US = m === 0,
    HS = m + 1 <= v,
    St = u.type,
    eo = u.dismissible !== !1,
    PS = u.className || "",
    VS = u.descriptionClassName || "",
    Li = L.useMemo(
      () => b.findIndex((ee) => ee.toastId === u.id) || 0,
      [b, u.id],
    ),
    IS = L.useMemo(() => {
      var ee;
      return (ee = u.closeButton) != null ? ee : R;
    }, [u.closeButton, R]),
    tm = L.useMemo(() => u.duration || z || yh, [u.duration, z]),
    cc = L.useRef(0),
    to = L.useRef(0),
    nm = L.useRef(0),
    no = L.useRef(null),
    [GS, YS] = G.split("-"),
    am = L.useMemo(
      () => b.reduce((ee, Ie, tt) => (tt >= Li ? ee : ee + Ie.height), 0),
      [b, Li],
    ),
    om = f2(),
    FS = u.invert || f,
    uc = St === "loading";
  ((to.current = L.useMemo(() => Li * V + am, [Li, am])),
    L.useEffect(() => {
      Ea.current = tm;
    }, [tm]),
    L.useEffect(() => {
      I(!0);
    }, []),
    L.useEffect(() => {
      const ee = ut.current;
      if (ee) {
        const Ie = ee.getBoundingClientRect().height;
        return (
          Ni(Ie),
          S((tt) => [
            { toastId: u.id, height: Ie, position: u.position },
            ...tt,
          ]),
          () => S((tt) => tt.filter((wt) => wt.toastId !== u.id))
        );
      }
    }, [S, u.id]),
    L.useLayoutEffect(() => {
      if (!U) return;
      const ee = ut.current,
        Ie = ee.style.height;
      ee.style.height = "auto";
      const tt = ee.getBoundingClientRect().height;
      ((ee.style.height = Ie),
        Ni(tt),
        S((wt) =>
          wt.find((Xe) => Xe.toastId === u.id)
            ? wt.map((Xe) => (Xe.toastId === u.id ? { ...Xe, height: tt } : Xe))
            : [{ toastId: u.id, height: tt, position: u.position }, ...wt],
        ));
    }, [U, u.title, u.description, S, u.id, u.jsx, u.action, u.cancel]));
  const Vn = L.useCallback(() => {
    (fe(!0),
      Lt(to.current),
      S((ee) => ee.filter((Ie) => Ie.toastId !== u.id)),
      setTimeout(() => {
        w(u);
      }, C2));
  }, [u, w, S, to]);
  (L.useEffect(() => {
    if (
      (u.promise && St === "loading") ||
      u.duration === 1 / 0 ||
      u.type === "loading"
    )
      return;
    let ee;
    return (
      y || g || om
        ? (() => {
            if (nm.current < cc.current) {
              const wt = new Date().getTime() - cc.current;
              Ea.current = Ea.current - wt;
            }
            nm.current = new Date().getTime();
          })()
        : (() => {
            Ea.current !== 1 / 0 &&
              ((cc.current = new Date().getTime()),
              (ee = setTimeout(() => {
                (u.onAutoClose == null || u.onAutoClose.call(u, u), Vn());
              }, Ea.current)));
          })(),
      () => clearTimeout(ee)
    );
  }, [y, g, u, St, om, Vn]),
    L.useEffect(() => {
      u.delete && (Vn(), u.onDismiss == null || u.onDismiss.call(u, u));
    }, [Vn, u.delete]));
  function KS() {
    var ee;
    if (_ != null && _.loading) {
      var Ie;
      return L.createElement(
        "div",
        {
          className: nn(
            M == null ? void 0 : M.loader,
            u == null || (Ie = u.classNames) == null ? void 0 : Ie.loader,
            "sonner-loader",
          ),
          "data-visible": St === "loading",
        },
        _.loading,
      );
    }
    return L.createElement(r2, {
      className: nn(
        M == null ? void 0 : M.loader,
        u == null || (ee = u.classNames) == null ? void 0 : ee.loader,
      ),
      visible: St === "loading",
    });
  }
  const qS = u.icon || (_ == null ? void 0 : _[St]) || a2(St);
  var rm, im;
  return L.createElement(
    "li",
    {
      tabIndex: 0,
      ref: ut,
      className: nn(
        N,
        PS,
        M == null ? void 0 : M.toast,
        u == null || (t = u.classNames) == null ? void 0 : t.toast,
        M == null ? void 0 : M.default,
        M == null ? void 0 : M[St],
        u == null || (n = u.classNames) == null ? void 0 : n[St],
      ),
      "data-sonner-toast": "",
      "data-rich-colors": (rm = u.richColors) != null ? rm : C,
      "data-styled": !(u.jsx || u.unstyled || d),
      "data-mounted": U,
      "data-promise": !!u.promise,
      "data-swiped": ct,
      "data-removed": X,
      "data-visible": HS,
      "data-y-position": GS,
      "data-x-position": YS,
      "data-index": m,
      "data-front": US,
      "data-swiping": Q,
      "data-dismissible": eo,
      "data-type": St,
      "data-invert": FS,
      "data-swipe-out": pe,
      "data-swipe-direction": q,
      "data-expanded": !!(y || (Y && U)),
      "data-testid": u.testId,
      style: {
        "--index": m,
        "--toasts-before": m,
        "--z-index": h.length - m,
        "--offset": `${X ? Ve : to.current}px`,
        "--initial-height": Y ? "auto" : `${xa}px`,
        ...E,
        ...u.style,
      },
      onDragEnd: () => {
        (W(!1), j(null), (no.current = null));
      },
      onPointerDown: (ee) => {
        ee.button !== 2 &&
          (uc ||
            !eo ||
            ((_i.current = new Date()),
            Lt(to.current),
            ee.target.setPointerCapture(ee.pointerId),
            ee.target.tagName !== "BUTTON" &&
              (W(!0), (no.current = { x: ee.clientX, y: ee.clientY }))));
      },
      onPointerUp: () => {
        var ee, Ie, tt;
        if (pe || !eo) return;
        no.current = null;
        const wt = Number(
            ((ee = ut.current) == null
              ? void 0
              : ee.style
                  .getPropertyValue("--swipe-amount-x")
                  .replace("px", "")) || 0,
          ),
          zi = Number(
            ((Ie = ut.current) == null
              ? void 0
              : Ie.style
                  .getPropertyValue("--swipe-amount-y")
                  .replace("px", "")) || 0,
          ),
          Xe =
            new Date().getTime() -
            ((tt = _i.current) == null ? void 0 : tt.getTime()),
          zt = D === "x" ? wt : zi,
          ji = Math.abs(zt) / Xe;
        if (Math.abs(zt) >= E2 || ji > 0.11) {
          (Lt(to.current),
            u.onDismiss == null || u.onDismiss.call(u, u),
            le(
              D === "x" ? (wt > 0 ? "right" : "left") : zi > 0 ? "down" : "up",
            ),
            Vn(),
            be(!0));
          return;
        } else {
          var Xt, $t;
          ((Xt = ut.current) == null ||
            Xt.style.setProperty("--swipe-amount-x", "0px"),
            ($t = ut.current) == null ||
              $t.style.setProperty("--swipe-amount-y", "0px"));
        }
        (qe(!1), W(!1), j(null));
      },
      onPointerMove: (ee) => {
        var Ie, tt, wt;
        if (
          !no.current ||
          !eo ||
          ((Ie = window.getSelection()) == null
            ? void 0
            : Ie.toString().length) > 0
        )
          return;
        const Xe = ee.clientY - no.current.y,
          zt = ee.clientX - no.current.x;
        var ji;
        const Xt = (ji = e.swipeDirections) != null ? ji : A2(G);
        !D &&
          (Math.abs(zt) > 1 || Math.abs(Xe) > 1) &&
          j(Math.abs(zt) > Math.abs(Xe) ? "x" : "y");
        let $t = { x: 0, y: 0 };
        const lm = (Ca) => 1 / (1.5 + Math.abs(Ca) / 20);
        if (D === "y") {
          if (Xt.includes("top") || Xt.includes("bottom"))
            if (
              (Xt.includes("top") && Xe < 0) ||
              (Xt.includes("bottom") && Xe > 0)
            )
              $t.y = Xe;
            else {
              const Ca = Xe * lm(Xe);
              $t.y = Math.abs(Ca) < Math.abs(Xe) ? Ca : Xe;
            }
        } else if (D === "x" && (Xt.includes("left") || Xt.includes("right")))
          if (
            (Xt.includes("left") && zt < 0) ||
            (Xt.includes("right") && zt > 0)
          )
            $t.x = zt;
          else {
            const Ca = zt * lm(zt);
            $t.x = Math.abs(Ca) < Math.abs(zt) ? Ca : zt;
          }
        ((Math.abs($t.x) > 0 || Math.abs($t.y) > 0) && qe(!0),
          (tt = ut.current) == null ||
            tt.style.setProperty("--swipe-amount-x", `${$t.x}px`),
          (wt = ut.current) == null ||
            wt.style.setProperty("--swipe-amount-y", `${$t.y}px`));
      },
    },
    IS && !u.jsx && St !== "loading"
      ? L.createElement(
          "button",
          {
            "aria-label": T,
            "data-disabled": uc,
            "data-close-button": !0,
            onClick:
              uc || !eo
                ? () => {}
                : () => {
                    (Vn(), u.onDismiss == null || u.onDismiss.call(u, u));
                  },
            className: nn(
              M == null ? void 0 : M.closeButton,
              u == null || (a = u.classNames) == null ? void 0 : a.closeButton,
            ),
          },
          (im = _ == null ? void 0 : _.close) != null ? im : u2,
        )
      : null,
    (St || u.icon || u.promise) &&
      u.icon !== null &&
      ((_ == null ? void 0 : _[St]) !== null || u.icon)
      ? L.createElement(
          "div",
          {
            "data-icon": "",
            className: nn(
              M == null ? void 0 : M.icon,
              u == null || (o = u.classNames) == null ? void 0 : o.icon,
            ),
          },
          u.promise || (u.type === "loading" && !u.icon)
            ? u.icon || KS()
            : null,
          u.type !== "loading" ? qS : null,
        )
      : null,
    L.createElement(
      "div",
      {
        "data-content": "",
        className: nn(
          M == null ? void 0 : M.content,
          u == null || (r = u.classNames) == null ? void 0 : r.content,
        ),
      },
      L.createElement(
        "div",
        {
          "data-title": "",
          className: nn(
            M == null ? void 0 : M.title,
            u == null || (i = u.classNames) == null ? void 0 : i.title,
          ),
        },
        u.jsx ? u.jsx : typeof u.title == "function" ? u.title() : u.title,
      ),
      u.description
        ? L.createElement(
            "div",
            {
              "data-description": "",
              className: nn(
                B,
                VS,
                M == null ? void 0 : M.description,
                u == null || (l = u.classNames) == null
                  ? void 0
                  : l.description,
              ),
            },
            typeof u.description == "function"
              ? u.description()
              : u.description,
          )
        : null,
    ),
    L.isValidElement(u.cancel)
      ? u.cancel
      : u.cancel && cl(u.cancel)
        ? L.createElement(
            "button",
            {
              "data-button": !0,
              "data-cancel": !0,
              style: u.cancelButtonStyle || A,
              onClick: (ee) => {
                cl(u.cancel) &&
                  eo &&
                  (u.cancel.onClick == null ||
                    u.cancel.onClick.call(u.cancel, ee),
                  Vn());
              },
              className: nn(
                M == null ? void 0 : M.cancelButton,
                u == null || (s = u.classNames) == null
                  ? void 0
                  : s.cancelButton,
              ),
            },
            u.cancel.label,
          )
        : null,
    L.isValidElement(u.action)
      ? u.action
      : u.action && cl(u.action)
        ? L.createElement(
            "button",
            {
              "data-button": !0,
              "data-action": !0,
              style: u.actionButtonStyle || O,
              onClick: (ee) => {
                cl(u.action) &&
                  (u.action.onClick == null ||
                    u.action.onClick.call(u.action, ee),
                  !ee.defaultPrevented && Vn());
              },
              className: nn(
                M == null ? void 0 : M.actionButton,
                u == null || (c = u.classNames) == null
                  ? void 0
                  : c.actionButton,
              ),
            },
            u.action.label,
          )
        : null,
  );
};
function bh() {
  if (typeof window > "u" || typeof document > "u") return "ltr";
  const e = document.documentElement.getAttribute("dir");
  return e === "auto" || !e
    ? window.getComputedStyle(document.documentElement).direction
    : e;
}
function R2(e, t) {
  const n = {};
  return (
    [e, t].forEach((a, o) => {
      const r = o === 1,
        i = r ? "--mobile-offset" : "--offset",
        l = r ? S2 : b2;
      function s(c) {
        ["top", "right", "bottom", "left"].forEach((f) => {
          n[`${i}-${f}`] = typeof c == "number" ? `${c}px` : c;
        });
      }
      typeof a == "number" || typeof a == "string"
        ? s(a)
        : typeof a == "object"
          ? ["top", "right", "bottom", "left"].forEach((c) => {
              a[c] === void 0
                ? (n[`${i}-${c}`] = l)
                : (n[`${i}-${c}`] =
                    typeof a[c] == "number" ? `${a[c]}px` : a[c]);
            })
          : s(l);
    }),
    n
  );
}
const CN = L.forwardRef(function (t, n) {
  const {
      id: a,
      invert: o,
      position: r = "bottom-right",
      hotkey: i = ["altKey", "KeyT"],
      expand: l,
      closeButton: s,
      className: c,
      offset: f,
      mobileOffset: u,
      theme: d = "light",
      richColors: g,
      duration: S,
      style: v,
      visibleToasts: b = y2,
      toastOptions: m,
      dir: h = bh(),
      gap: y = x2,
      icons: w,
      containerAriaLabel: C = "Notifications",
    } = t,
    [R, E] = L.useState([]),
    A = L.useMemo(
      () =>
        a ? R.filter((U) => U.toasterId === a) : R.filter((U) => !U.toasterId),
      [R, a],
    ),
    O = L.useMemo(
      () =>
        Array.from(
          new Set(
            [r].concat(A.filter((U) => U.position).map((U) => U.position)),
          ),
        ),
      [A, r],
    ),
    [N, B] = L.useState([]),
    [z, G] = L.useState(!1),
    [V, Y] = L.useState(!1),
    [M, _] = L.useState(
      d !== "system"
        ? d
        : typeof window < "u" &&
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light",
    ),
    T = L.useRef(null),
    D = i.join("+").replace(/Key/g, "").replace(/Digit/g, ""),
    j = L.useRef(null),
    q = L.useRef(!1),
    le = L.useCallback((U) => {
      E((I) => {
        var X;
        return (
          ((X = I.find((fe) => fe.id === U.id)) != null && X.delete) ||
            ht.dismiss(U.id),
          I.filter(({ id: fe }) => fe !== U.id)
        );
      });
    }, []);
  return (
    L.useEffect(
      () =>
        ht.subscribe((U) => {
          if (U.dismiss) {
            requestAnimationFrame(() => {
              E((I) =>
                I.map((X) => (X.id === U.id ? { ...X, delete: !0 } : X)),
              );
            });
            return;
          }
          setTimeout(() => {
            ip.flushSync(() => {
              E((I) => {
                const X = I.findIndex((fe) => fe.id === U.id);
                return X !== -1
                  ? [...I.slice(0, X), { ...I[X], ...U }, ...I.slice(X + 1)]
                  : [U, ...I];
              });
            });
          });
        }),
      [R],
    ),
    L.useEffect(() => {
      if (d !== "system") {
        _(d);
        return;
      }
      if (
        (d === "system" &&
          (window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
            ? _("dark")
            : _("light")),
        typeof window > "u")
      )
        return;
      const U = window.matchMedia("(prefers-color-scheme: dark)");
      try {
        U.addEventListener("change", ({ matches: I }) => {
          _(I ? "dark" : "light");
        });
      } catch {
        U.addListener(({ matches: X }) => {
          try {
            _(X ? "dark" : "light");
          } catch {}
        });
      }
    }, [d]),
    L.useEffect(() => {
      R.length <= 1 && G(!1);
    }, [R]),
    L.useEffect(() => {
      const U = (I) => {
        var X;
        if (i.every((W) => I[W] || I.code === W)) {
          var Q;
          (G(!0), (Q = T.current) == null || Q.focus());
        }
        I.code === "Escape" &&
          (document.activeElement === T.current ||
            ((X = T.current) != null && X.contains(document.activeElement))) &&
          G(!1);
      };
      return (
        document.addEventListener("keydown", U),
        () => document.removeEventListener("keydown", U)
      );
    }, [i]),
    L.useEffect(() => {
      if (T.current)
        return () => {
          j.current &&
            (j.current.focus({ preventScroll: !0 }),
            (j.current = null),
            (q.current = !1));
        };
    }, [T.current]),
    L.createElement(
      "section",
      {
        ref: n,
        "aria-label": `${C} ${D}`,
        tabIndex: -1,
        "aria-live": "polite",
        "aria-relevant": "additions text",
        "aria-atomic": "false",
        suppressHydrationWarning: !0,
      },
      O.map((U, I) => {
        var X;
        const [fe, Q] = U.split("-");
        return A.length
          ? L.createElement(
              "ol",
              {
                key: U,
                dir: h === "auto" ? bh() : h,
                tabIndex: -1,
                ref: T,
                className: c,
                "data-sonner-toaster": !0,
                "data-sonner-theme": M,
                "data-y-position": fe,
                "data-x-position": Q,
                style: {
                  "--front-toast-height": `${((X = N[0]) == null ? void 0 : X.height) || 0}px`,
                  "--width": `${w2}px`,
                  "--gap": `${y}px`,
                  ...v,
                  ...R2(f, u),
                },
                onBlur: (W) => {
                  q.current &&
                    !W.currentTarget.contains(W.relatedTarget) &&
                    ((q.current = !1),
                    j.current &&
                      (j.current.focus({ preventScroll: !0 }),
                      (j.current = null)));
                },
                onFocus: (W) => {
                  (W.target instanceof HTMLElement &&
                    W.target.dataset.dismissible === "false") ||
                    q.current ||
                    ((q.current = !0), (j.current = W.relatedTarget));
                },
                onMouseEnter: () => G(!0),
                onMouseMove: () => G(!0),
                onMouseLeave: () => {
                  V || G(!1);
                },
                onDragEnd: () => G(!1),
                onPointerDown: (W) => {
                  (W.target instanceof HTMLElement &&
                    W.target.dataset.dismissible === "false") ||
                    Y(!0);
                },
                onPointerUp: () => Y(!1),
              },
              A.filter((W) => (!W.position && I === 0) || W.position === U).map(
                (W, pe) => {
                  var be, ct;
                  return L.createElement(T2, {
                    key: W.id,
                    icons: w,
                    index: pe,
                    toast: W,
                    defaultRichColors: g,
                    duration:
                      (be = m == null ? void 0 : m.duration) != null ? be : S,
                    className: m == null ? void 0 : m.className,
                    descriptionClassName:
                      m == null ? void 0 : m.descriptionClassName,
                    invert: o,
                    visibleToasts: b,
                    closeButton:
                      (ct = m == null ? void 0 : m.closeButton) != null
                        ? ct
                        : s,
                    interacting: V,
                    position: U,
                    style: m == null ? void 0 : m.style,
                    unstyled: m == null ? void 0 : m.unstyled,
                    classNames: m == null ? void 0 : m.classNames,
                    cancelButtonStyle: m == null ? void 0 : m.cancelButtonStyle,
                    actionButtonStyle: m == null ? void 0 : m.actionButtonStyle,
                    closeButtonAriaLabel:
                      m == null ? void 0 : m.closeButtonAriaLabel,
                    removeToast: le,
                    toasts: A.filter((qe) => qe.position == W.position),
                    heights: N.filter((qe) => qe.position == W.position),
                    setHeights: B,
                    expandByDefault: l,
                    gap: y,
                    expanded: z,
                    swipeDirections: t.swipeDirections,
                  });
                },
              ),
            )
          : null;
      }),
    )
  );
});
var Sh = Object.prototype.hasOwnProperty;
function wf(e, t) {
  var n, a;
  if (e === t) return !0;
  if (e && t && (n = e.constructor) === t.constructor) {
    if (n === Date) return e.getTime() === t.getTime();
    if (n === RegExp) return e.toString() === t.toString();
    if (n === Array) {
      if ((a = e.length) === t.length) for (; a-- && wf(e[a], t[a]); );
      return a === -1;
    }
    if (!n || typeof e == "object") {
      a = 0;
      for (n in e)
        if (
          (Sh.call(e, n) && ++a && !Sh.call(t, n)) ||
          !(n in t) ||
          !wf(e[n], t[n])
        )
          return !1;
      return Object.keys(t).length === a;
    }
  }
  return e !== e && t !== t;
}
const M2 = new Error("request for lock canceled");
var D2 = function (e, t, n, a) {
  function o(r) {
    return r instanceof n
      ? r
      : new n(function (i) {
          i(r);
        });
  }
  return new (n || (n = Promise))(function (r, i) {
    function l(f) {
      try {
        c(a.next(f));
      } catch (u) {
        i(u);
      }
    }
    function s(f) {
      try {
        c(a.throw(f));
      } catch (u) {
        i(u);
      }
    }
    function c(f) {
      f.done ? r(f.value) : o(f.value).then(l, s);
    }
    c((a = a.apply(e, t || [])).next());
  });
};
class O2 {
  constructor(t, n = M2) {
    ((this._value = t),
      (this._cancelError = n),
      (this._queue = []),
      (this._weightedWaiters = []));
  }
  acquire(t = 1, n = 0) {
    if (t <= 0) throw new Error(`invalid weight ${t}: must be positive`);
    return new Promise((a, o) => {
      const r = { resolve: a, reject: o, weight: t, priority: n },
        i = MS(this._queue, (l) => n <= l.priority);
      i === -1 && t <= this._value
        ? this._dispatchItem(r)
        : this._queue.splice(i + 1, 0, r);
    });
  }
  runExclusive(t) {
    return D2(this, arguments, void 0, function* (n, a = 1, o = 0) {
      const [r, i] = yield this.acquire(a, o);
      try {
        return yield n(r);
      } finally {
        i();
      }
    });
  }
  waitForUnlock(t = 1, n = 0) {
    if (t <= 0) throw new Error(`invalid weight ${t}: must be positive`);
    return this._couldLockImmediately(t, n)
      ? Promise.resolve()
      : new Promise((a) => {
          (this._weightedWaiters[t - 1] || (this._weightedWaiters[t - 1] = []),
            k2(this._weightedWaiters[t - 1], { resolve: a, priority: n }));
        });
  }
  isLocked() {
    return this._value <= 0;
  }
  getValue() {
    return this._value;
  }
  setValue(t) {
    ((this._value = t), this._dispatchQueue());
  }
  release(t = 1) {
    if (t <= 0) throw new Error(`invalid weight ${t}: must be positive`);
    ((this._value += t), this._dispatchQueue());
  }
  cancel() {
    (this._queue.forEach((t) => t.reject(this._cancelError)),
      (this._queue = []));
  }
  _dispatchQueue() {
    for (
      this._drainUnlockWaiters();
      this._queue.length > 0 && this._queue[0].weight <= this._value;
    )
      (this._dispatchItem(this._queue.shift()), this._drainUnlockWaiters());
  }
  _dispatchItem(t) {
    const n = this._value;
    ((this._value -= t.weight), t.resolve([n, this._newReleaser(t.weight)]));
  }
  _newReleaser(t) {
    let n = !1;
    return () => {
      n || ((n = !0), this.release(t));
    };
  }
  _drainUnlockWaiters() {
    if (this._queue.length === 0)
      for (let t = this._value; t > 0; t--) {
        const n = this._weightedWaiters[t - 1];
        n &&
          (n.forEach((a) => a.resolve()), (this._weightedWaiters[t - 1] = []));
      }
    else {
      const t = this._queue[0].priority;
      for (let n = this._value; n > 0; n--) {
        const a = this._weightedWaiters[n - 1];
        if (!a) continue;
        const o = a.findIndex((r) => r.priority <= t);
        (o === -1 ? a : a.splice(0, o)).forEach((r) => r.resolve());
      }
    }
  }
  _couldLockImmediately(t, n) {
    return (
      (this._queue.length === 0 || this._queue[0].priority < n) &&
      t <= this._value
    );
  }
}
function k2(e, t) {
  const n = MS(e, (a) => t.priority <= a.priority);
  e.splice(n + 1, 0, t);
}
function MS(e, t) {
  for (let n = e.length - 1; n >= 0; n--) if (t(e[n])) return n;
  return -1;
}
var N2 = function (e, t, n, a) {
  function o(r) {
    return r instanceof n
      ? r
      : new n(function (i) {
          i(r);
        });
  }
  return new (n || (n = Promise))(function (r, i) {
    function l(f) {
      try {
        c(a.next(f));
      } catch (u) {
        i(u);
      }
    }
    function s(f) {
      try {
        c(a.throw(f));
      } catch (u) {
        i(u);
      }
    }
    function c(f) {
      f.done ? r(f.value) : o(f.value).then(l, s);
    }
    c((a = a.apply(e, t || [])).next());
  });
};
class _2 {
  constructor(t) {
    this._semaphore = new O2(1, t);
  }
  acquire() {
    return N2(this, arguments, void 0, function* (t = 0) {
      const [, n] = yield this._semaphore.acquire(1, t);
      return n;
    });
  }
  runExclusive(t, n = 0) {
    return this._semaphore.runExclusive(() => t(), 1, n);
  }
  isLocked() {
    return this._semaphore.isLocked();
  }
  waitForUnlock(t = 0) {
    return this._semaphore.waitForUnlock(1, t);
  }
  release() {
    this._semaphore.isLocked() && this._semaphore.release();
  }
  cancel() {
    return this._semaphore.cancel();
  }
}
var Ih, Gh;
const Ol =
    (Gh = (Ih = globalThis.browser) == null ? void 0 : Ih.runtime) != null &&
    Gh.id
      ? globalThis.browser
      : globalThis.chrome,
  Wa = L2();
function L2() {
  const e = {
      local: ul("local"),
      session: ul("session"),
      sync: ul("sync"),
      managed: ul("managed"),
    },
    t = (v) => {
      const b = e[v];
      if (b == null) {
        const m = Object.keys(e).join(", ");
        throw Error(`Invalid area "${v}". Options: ${m}`);
      }
      return b;
    },
    n = (v) => {
      const b = v.indexOf(":"),
        m = v.substring(0, b),
        h = v.substring(b + 1);
      if (h == null)
        throw Error(
          `Storage key should be in the form of "area:key", but received "${v}"`,
        );
      return { driverArea: m, driverKey: h, driver: t(m) };
    },
    a = (v) => v + "$",
    o = (v, b) => {
      const m = { ...v };
      return (
        Object.entries(b).forEach(([h, y]) => {
          y == null ? delete m[h] : (m[h] = y);
        }),
        m
      );
    },
    r = (v, b) => v ?? b ?? null,
    i = (v) => (typeof v == "object" && !Array.isArray(v) ? v : {}),
    l = async (v, b, m) => {
      const h = await v.getItem(b);
      return r(
        h,
        (m == null ? void 0 : m.fallback) ??
          (m == null ? void 0 : m.defaultValue),
      );
    },
    s = async (v, b) => {
      const m = a(b),
        h = await v.getItem(m);
      return i(h);
    },
    c = async (v, b, m) => {
      await v.setItem(b, m ?? null);
    },
    f = async (v, b, m) => {
      const h = a(b),
        y = i(await v.getItem(h));
      await v.setItem(h, o(y, m));
    },
    u = async (v, b, m) => {
      if ((await v.removeItem(b), m != null && m.removeMeta)) {
        const h = a(b);
        await v.removeItem(h);
      }
    },
    d = async (v, b, m) => {
      const h = a(b);
      if (m == null) await v.removeItem(h);
      else {
        const y = i(await v.getItem(h));
        ([m].flat().forEach((w) => delete y[w]), await v.setItem(h, y));
      }
    },
    g = (v, b, m) => v.watch(b, m);
  return {
    getItem: async (v, b) => {
      const { driver: m, driverKey: h } = n(v);
      return await l(m, h, b);
    },
    getItems: async (v) => {
      const b = new Map(),
        m = new Map(),
        h = [];
      v.forEach((w) => {
        let C, R;
        (typeof w == "string"
          ? (C = w)
          : "getValue" in w
            ? ((C = w.key), (R = { fallback: w.fallback }))
            : ((C = w.key), (R = w.options)),
          h.push(C));
        const { driverArea: E, driverKey: A } = n(C),
          O = b.get(E) ?? [];
        (b.set(E, O.concat(A)), m.set(C, R));
      });
      const y = new Map();
      return (
        await Promise.all(
          Array.from(b.entries()).map(async ([w, C]) => {
            (await e[w].getItems(C)).forEach((E) => {
              const A = `${w}:${E.key}`,
                O = m.get(A),
                N = r(
                  E.value,
                  (O == null ? void 0 : O.fallback) ??
                    (O == null ? void 0 : O.defaultValue),
                );
              y.set(A, N);
            });
          }),
        ),
        h.map((w) => ({ key: w, value: y.get(w) }))
      );
    },
    getMeta: async (v) => {
      const { driver: b, driverKey: m } = n(v);
      return await s(b, m);
    },
    getMetas: async (v) => {
      const b = v.map((y) => {
          const w = typeof y == "string" ? y : y.key,
            { driverArea: C, driverKey: R } = n(w);
          return { key: w, driverArea: C, driverKey: R, driverMetaKey: a(R) };
        }),
        m = b.reduce((y, w) => {
          var C;
          return (
            y[(C = w.driverArea)] ?? (y[C] = []),
            y[w.driverArea].push(w),
            y
          );
        }, {}),
        h = {};
      return (
        await Promise.all(
          Object.entries(m).map(async ([y, w]) => {
            const C = await Ol.storage[y].get(w.map((R) => R.driverMetaKey));
            w.forEach((R) => {
              h[R.key] = C[R.driverMetaKey] ?? {};
            });
          }),
        ),
        b.map((y) => ({ key: y.key, meta: h[y.key] }))
      );
    },
    setItem: async (v, b) => {
      const { driver: m, driverKey: h } = n(v);
      await c(m, h, b);
    },
    setItems: async (v) => {
      const b = {};
      (v.forEach((m) => {
        const { driverArea: h, driverKey: y } = n(
          "key" in m ? m.key : m.item.key,
        );
        (b[h] ?? (b[h] = []), b[h].push({ key: y, value: m.value }));
      }),
        await Promise.all(
          Object.entries(b).map(async ([m, h]) => {
            await t(m).setItems(h);
          }),
        ));
    },
    setMeta: async (v, b) => {
      const { driver: m, driverKey: h } = n(v);
      await f(m, h, b);
    },
    setMetas: async (v) => {
      const b = {};
      (v.forEach((m) => {
        const { driverArea: h, driverKey: y } = n(
          "key" in m ? m.key : m.item.key,
        );
        (b[h] ?? (b[h] = []), b[h].push({ key: y, properties: m.meta }));
      }),
        await Promise.all(
          Object.entries(b).map(async ([m, h]) => {
            const y = t(m),
              w = h.map(({ key: A }) => a(A)),
              C = await y.getItems(w),
              R = Object.fromEntries(
                C.map(({ key: A, value: O }) => [A, i(O)]),
              ),
              E = h.map(({ key: A, properties: O }) => {
                const N = a(A);
                return { key: N, value: o(R[N] ?? {}, O) };
              });
            await y.setItems(E);
          }),
        ));
    },
    removeItem: async (v, b) => {
      const { driver: m, driverKey: h } = n(v);
      await u(m, h, b);
    },
    removeItems: async (v) => {
      const b = {};
      (v.forEach((m) => {
        let h, y;
        typeof m == "string"
          ? (h = m)
          : "getValue" in m
            ? (h = m.key)
            : "item" in m
              ? ((h = m.item.key), (y = m.options))
              : ((h = m.key), (y = m.options));
        const { driverArea: w, driverKey: C } = n(h);
        (b[w] ?? (b[w] = []),
          b[w].push(C),
          y != null && y.removeMeta && b[w].push(a(C)));
      }),
        await Promise.all(
          Object.entries(b).map(async ([m, h]) => {
            await t(m).removeItems(h);
          }),
        ));
    },
    clear: async (v) => {
      await t(v).clear();
    },
    removeMeta: async (v, b) => {
      const { driver: m, driverKey: h } = n(v);
      await d(m, h, b);
    },
    snapshot: async (v, b) => {
      var y;
      const h = await t(v).snapshot();
      return (
        (y = b == null ? void 0 : b.excludeKeys) == null ||
          y.forEach((w) => {
            (delete h[w], delete h[a(w)]);
          }),
        h
      );
    },
    restoreSnapshot: async (v, b) => {
      await t(v).restoreSnapshot(b);
    },
    watch: (v, b) => {
      const { driver: m, driverKey: h } = n(v);
      return g(m, h, b);
    },
    unwatch() {
      Object.values(e).forEach((v) => {
        v.unwatch();
      });
    },
    defineItem: (v, b) => {
      const { driver: m, driverKey: h } = n(v),
        {
          version: y = 1,
          migrations: w = {},
          onMigrationComplete: C,
          debug: R = !1,
        } = b ?? {};
      if (y < 1)
        throw Error(
          "Storage item version cannot be less than 1. Initial versions should be set to 1, not 0.",
        );
      const E = async () => {
          var T;
          const z = a(h),
            [{ value: G }, { value: V }] = await m.getItems([h, z]);
          if (G == null) return;
          const Y = (V == null ? void 0 : V.v) ?? 1;
          if (Y > y)
            throw Error(
              `Version downgrade detected (v${Y} -> v${y}) for "${v}"`,
            );
          if (Y === y) return;
          const M = Array.from({ length: y - Y }, (D, j) => Y + j + 1);
          let _ = G;
          for (const D of M)
            try {
              _ =
                (await ((T = w == null ? void 0 : w[D]) == null
                  ? void 0
                  : T.call(w, _))) ?? _;
            } catch (j) {
              throw new z2(v, D, { cause: j });
            }
          (await m.setItems([
            { key: h, value: _ },
            { key: z, value: { ...V, v: y } },
          ]),
            C == null || C(_, y));
        },
        A =
          (b == null ? void 0 : b.migrations) == null
            ? Promise.resolve()
            : E().catch((z) => {}),
        O = new _2(),
        N = () =>
          (b == null ? void 0 : b.fallback) ??
          (b == null ? void 0 : b.defaultValue) ??
          null,
        B = () =>
          O.runExclusive(async () => {
            const z = await m.getItem(h);
            if (z != null || (b == null ? void 0 : b.init) == null) return z;
            const G = await b.init();
            return (await m.setItem(h, G), G);
          });
      return (
        A.then(B),
        {
          key: v,
          get defaultValue() {
            return N();
          },
          get fallback() {
            return N();
          },
          getValue: async () => (
            await A,
            b != null && b.init ? await B() : await l(m, h, b)
          ),
          getMeta: async () => (await A, await s(m, h)),
          setValue: async (z) => (await A, await c(m, h, z)),
          setMeta: async (z) => (await A, await f(m, h, z)),
          removeValue: async (z) => (await A, await u(m, h, z)),
          removeMeta: async (z) => (await A, await d(m, h, z)),
          watch: (z) => g(m, h, (G, V) => z(G ?? N(), V ?? N())),
          migrate: E,
        }
      );
    },
  };
}
function ul(e) {
  const t = () => {
      if (Ol.runtime == null)
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
      if (Ol.storage == null)
        throw Error(
          "You must add the 'storage' permission to your manifest to use 'wxt/storage'",
        );
      const a = Ol.storage[e];
      if (a == null) throw Error(`"browser.storage.${e}" is undefined`);
      return a;
    },
    n = new Set();
  return {
    getItem: async (a) => (await t().get(a))[a],
    getItems: async (a) => {
      const o = await t().get(a);
      return a.map((r) => ({ key: r, value: o[r] ?? null }));
    },
    setItem: async (a, o) => {
      o == null ? await t().remove(a) : await t().set({ [a]: o });
    },
    setItems: async (a) => {
      const o = a.reduce((r, { key: i, value: l }) => ((r[i] = l), r), {});
      await t().set(o);
    },
    removeItem: async (a) => {
      await t().remove(a);
    },
    removeItems: async (a) => {
      await t().remove(a);
    },
    clear: async () => {
      await t().clear();
    },
    snapshot: async () => await t().get(),
    restoreSnapshot: async (a) => {
      await t().set(a);
    },
    watch(a, o) {
      const r = (i) => {
        const l = i[a];
        l != null &&
          (wf(l.newValue, l.oldValue) ||
            o(l.newValue ?? null, l.oldValue ?? null));
      };
      return (
        t().onChanged.addListener(r),
        n.add(r),
        () => {
          (t().onChanged.removeListener(r), n.delete(r));
        }
      );
    },
    unwatch() {
      (n.forEach((a) => {
        t().onChanged.removeListener(a);
      }),
        n.clear());
    },
  };
}
class z2 extends Error {
  constructor(t, n, a) {
    (super(`v${n} migration failed for "${t}"`, a),
      (this.key = t),
      (this.version = n));
  }
}
const j2 = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
let wh = (e = 21) => {
  let t = "",
    n = crypto.getRandomValues(new Uint8Array((e |= 0)));
  for (; e--; ) t += j2[n[e] & 63];
  return t;
};
const Te = Wa.defineItem("local:bookmarks", { fallback: [] }),
  $e = Wa.defineItem("local:bookmarkContents", { fallback: {} }),
  Yn = Wa.defineItem("sync:categories", { fallback: [] });
class B2 {
  assembleBookmark(t, n) {
    return { ...t, content: n[t.id] };
  }
  separateBookmark(t) {
    const { content: n, ...a } = t;
    return { meta: a, content: n };
  }
  async getBookmarks(t, n = !1) {
    var s;
    const [a, o] = await Promise.all([
      Te.getValue(),
      n ? $e.getValue() : Promise.resolve({}),
    ]);
    let r = a.map((c) => this.assembleBookmark(c, o));
    if (
      ((t == null ? void 0 : t.isDeleted) === void 0
        ? (r = r.filter((c) => !c.isDeleted))
        : t.isDeleted === !0
          ? (r = r.filter((c) => c.isDeleted))
          : (r = r.filter((c) => !c.isDeleted)),
      (t == null ? void 0 : t.categoryId) !== void 0 &&
        (r = r.filter((c) => c.categoryId === t.categoryId)),
      (s = t == null ? void 0 : t.tags) != null &&
        s.length &&
        (r = r.filter((c) => t.tags.some((f) => c.tags.includes(f)))),
      t != null && t.search)
    ) {
      const c = t.search.toLowerCase();
      r = r.filter(
        (f) =>
          f.title.toLowerCase().includes(c) ||
          f.description.toLowerCase().includes(c) ||
          f.url.toLowerCase().includes(c) ||
          f.tags.some((u) => u.toLowerCase().includes(c)),
      );
    }
    const i = (t == null ? void 0 : t.sortBy) || "createdAt",
      l = (t == null ? void 0 : t.sortOrder) || "desc";
    return (
      r.sort((c, f) => {
        const u = c[i] || 0,
          d = f[i] || 0;
        return l === "desc" ? d - u : u - d;
      }),
      t != null && t.offset && (r = r.slice(t.offset)),
      t != null && t.limit && (r = r.slice(0, t.limit)),
      r
    );
  }
  async getBookmarkById(t) {
    const [n, a] = await Promise.all([Te.getValue(), $e.getValue()]),
      o = n.find((r) => r.id === t);
    return o ? this.assembleBookmark(o, a) : null;
  }
  async getBookmarkByUrl(t) {
    const [n, a] = await Promise.all([Te.getValue(), $e.getValue()]),
      o = this.normalizeUrl(t),
      r = n.find((i) => this.normalizeUrl(i.url) === o && !i.isDeleted);
    return r ? this.assembleBookmark(r, a) : null;
  }
  async createBookmark(t) {
    const n = await Te.getValue(),
      a = this.normalizeUrl(t.url);
    if (n.find((f) => this.normalizeUrl(f.url) === a && !f.isDeleted))
      throw new Error("该网址已收藏");
    const r = Date.now(),
      i = wh(),
      { content: l, ...s } = t,
      c = { ...s, id: i, createdAt: r, updatedAt: r };
    if ((await Te.setValue([...n, c]), l)) {
      const f = await $e.getValue();
      ((f[i] = l), await $e.setValue(f));
    }
    return { ...c, content: l };
  }
  async updateBookmark(t, n) {
    const a = await Te.getValue(),
      o = a.findIndex((c) => c.id === t);
    if (o === -1) throw new Error("书签不存在");
    const { content: r, ...i } = n,
      l = { ...a[o], ...i, updatedAt: Date.now() };
    if (((a[o] = l), await Te.setValue(a), r !== void 0)) {
      const c = await $e.getValue();
      (r ? (c[t] = r) : delete c[t], await $e.setValue(c));
    }
    const s = await $e.getValue();
    return this.assembleBookmark(l, s);
  }
  async deleteBookmark(t, n = !1) {
    const a = await Te.getValue();
    if (n) {
      await Te.setValue(a.filter((r) => r.id !== t));
      const o = await $e.getValue();
      (delete o[t], await $e.setValue(o));
    } else {
      const o = a.findIndex((r) => r.id === t);
      o !== -1 &&
        ((a[o].isDeleted = !0),
        (a[o].updatedAt = Date.now()),
        await Te.setValue(a));
    }
  }
  async restoreBookmark(t) {
    return this.updateBookmark(t, { isDeleted: !1 });
  }
  async getDeletedBookmarks() {
    return this.getBookmarks({ isDeleted: !0 });
  }
  async getCategories() {
    return Yn.getValue();
  }
  async createCategory(t, n = null) {
    const a = await Yn.getValue();
    if (a.some((r) => r.name === t && r.parentId === n))
      throw new Error("分类名称已存在");
    const o = {
      id: wh(),
      name: t,
      parentId: n,
      order: a.length,
      createdAt: Date.now(),
    };
    return (await Yn.setValue([...a, o]), o);
  }
  async updateCategory(t, n) {
    const a = await Yn.getValue(),
      o = a.findIndex((i) => i.id === t);
    if (o === -1) throw new Error("分类不存在");
    const r = { ...a[o], ...n };
    return ((a[o] = r), await Yn.setValue(a), r);
  }
  async deleteCategory(t) {
    const [n, a] = await Promise.all([Yn.getValue(), Te.getValue()]),
      o = a.map((r) =>
        r.categoryId === t
          ? { ...r, categoryId: null, updatedAt: Date.now() }
          : r,
      );
    await Promise.all([
      Yn.setValue(n.filter((r) => r.id !== t)),
      Te.setValue(o),
    ]);
  }
  async getAllTags() {
    const t = await this.getBookmarks(),
      n = new Set();
    return (
      t.forEach((a) => a.tags.forEach((o) => n.add(o))),
      Array.from(n).sort()
    );
  }
  async batchDeleteBookmarks(t, n = !1) {
    let a = await Te.getValue();
    if (n) {
      ((a = a.filter((r) => !t.includes(r.id))), await Te.setValue(a));
      const o = await $e.getValue();
      (t.forEach((r) => delete o[r]), await $e.setValue(o));
    } else {
      const o = Date.now();
      ((a = a.map((r) =>
        t.includes(r.id) ? { ...r, isDeleted: !0, updatedAt: o } : r,
      )),
        await Te.setValue(a));
    }
  }
  async batchRestoreBookmarks(t) {
    const n = await Te.getValue(),
      a = Date.now(),
      o = n.map((r) =>
        t.includes(r.id) ? { ...r, isDeleted: !1, updatedAt: a } : r,
      );
    await Te.setValue(o);
  }
  async batchAddTags(t, n) {
    const a = await Te.getValue(),
      o = Date.now(),
      r = a.map((i) =>
        t.includes(i.id)
          ? { ...i, tags: [...new Set([...i.tags, ...n])], updatedAt: o }
          : i,
      );
    await Te.setValue(r);
  }
  async batchRemoveTags(t, n) {
    const a = await Te.getValue(),
      o = Date.now(),
      r = a.map((i) =>
        t.includes(i.id)
          ? { ...i, tags: i.tags.filter((l) => !n.includes(l)), updatedAt: o }
          : i,
      );
    await Te.setValue(r);
  }
  async batchChangeCategory(t, n) {
    const a = await Te.getValue(),
      o = Date.now(),
      r = a.map((i) =>
        t.includes(i.id) ? { ...i, categoryId: n, updatedAt: o } : i,
      );
    await Te.setValue(r);
  }
  async batchOperate(t) {
    const {
      operation: n,
      bookmarkIds: a,
      tags: o,
      categoryId: r,
      permanent: i,
    } = t;
    try {
      switch (n) {
        case "delete":
          await this.batchDeleteBookmarks(a, i);
          break;
        case "restore":
          await this.batchRestoreBookmarks(a);
          break;
        case "addTags":
          if (!o || o.length === 0) throw new Error("添加标签需要提供标签列表");
          await this.batchAddTags(a, o);
          break;
        case "removeTags":
          if (!o || o.length === 0) throw new Error("移除标签需要提供标签列表");
          await this.batchRemoveTags(a, o);
          break;
        case "changeCategory":
          await this.batchChangeCategory(a, r ?? null);
          break;
        default:
          throw new Error(`未知的操作类型: ${n}`);
      }
      return { success: a.length, failed: 0 };
    } catch (l) {
      return {
        success: 0,
        failed: a.length,
        errors: [l instanceof Error ? l.message : "批量操作失败"],
      };
    }
  }
  watchBookmarks(t) {
    return Te.watch(async (n) => {
      const o = (n ?? []).map((r) => ({ ...r, content: void 0 }));
      t(o);
    });
  }
  watchCategories(t) {
    return Yn.watch((n) => {
      t(n ?? []);
    });
  }
  async getBookmarkContent(t) {
    return (await $e.getValue())[t];
  }
  async setBookmarkContent(t, n) {
    const a = await $e.getValue();
    ((a[t] = n), await $e.setValue(a));
  }
  async deleteBookmarkContent(t) {
    const n = await $e.getValue();
    (delete n[t], await $e.setValue(n));
  }
  normalizeUrl(t) {
    try {
      const n = new URL(t);
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
        ].forEach((o) => n.searchParams.delete(o)),
        n.toString().replace(/\/$/, "")
      );
    } catch {
      return t;
    }
  }
}
const AN = new B2(),
  kl = {
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
  Nl = {
    enabled: !1,
    provider: "openai",
    model: "text-embedding-3-small",
    batchSize: 16,
  },
  _l = {
    autoSaveSnapshot: !0,
    defaultCategory: null,
    theme: "system",
    language: "zh",
    shortcut: "Ctrl+Shift+E",
    panelPosition: "left",
    panelShortcut: "Ctrl+Shift+B",
  },
  vr = Wa.defineItem("sync:aiConfig", { fallback: kl }),
  yr = Wa.defineItem("sync:settings", { fallback: _l }),
  xn = Wa.defineItem("sync:customFilters", { fallback: [] }),
  br = Wa.defineItem("sync:embeddingConfig", { fallback: Nl });
class U2 {
  async getAIConfig() {
    return vr.getValue();
  }
  async setAIConfig(t) {
    const a = { ...(await vr.getValue()), ...t };
    return (await vr.setValue(a), a);
  }
  async getSettings() {
    return yr.getValue();
  }
  async setSettings(t) {
    const a = { ...(await yr.getValue()), ...t };
    return (await yr.setValue(a), a);
  }
  async resetAIConfig() {
    return (await vr.setValue(kl), kl);
  }
  async resetSettings() {
    return (await yr.setValue(_l), _l);
  }
  async getCustomFilters() {
    return xn.getValue();
  }
  async setCustomFilters(t) {
    await xn.setValue(t);
  }
  async addCustomFilter(t) {
    const n = await xn.getValue();
    (n.push(t), await xn.setValue(n));
  }
  async updateCustomFilter(t, n) {
    const a = await xn.getValue(),
      o = a.findIndex((r) => r.id === t);
    o !== -1 &&
      ((a[o] = { ...a[o], ...n, updatedAt: Date.now() }), await xn.setValue(a));
  }
  async deleteCustomFilter(t) {
    const a = (await xn.getValue()).filter((o) => o.id !== t);
    await xn.setValue(a);
  }
  async getEmbeddingConfig() {
    return br.getValue();
  }
  async setEmbeddingConfig(t) {
    const a = { ...(await br.getValue()), ...t };
    return (await br.setValue(a), a);
  }
  async resetEmbeddingConfig() {
    return (await br.setValue(Nl), Nl);
  }
  watchAIConfig(t) {
    return vr.watch((n) => {
      t(n ?? kl);
    });
  }
  watchSettings(t) {
    return yr.watch((n) => {
      t(n ?? _l);
    });
  }
  watchCustomFilters(t) {
    return xn.watch((n) => {
      t(n ?? []);
    });
  }
  watchEmbeddingConfig(t) {
    return br.watch((n) => {
      t(n ?? Nl);
    });
  }
}
const ka = new U2(),
  xh = { debug: 0, info: 1, warn: 2, error: 3 },
  H2 = {
    debug: "color:#999;",
    info: "color:#1677ff;",
    warn: "color:#faad14;",
    error: "color:#ff4d4f;font-weight:bold;",
  };
var Yh;
const P2 =
  typeof process < "u" &&
  ((Yh = process == null ? void 0 : process.env) == null
    ? void 0
    : Yh.NODE_ENV) === "production";
function V2() {
  const e = new Date(),
    t = String(e.getHours()).padStart(2, "0"),
    n = String(e.getMinutes()).padStart(2, "0"),
    a = String(e.getSeconds()).padStart(2, "0"),
    o = String(e.getMilliseconds()).padStart(3, "0");
  return `${t}:${n}:${a}.${o}`;
}
function DS(e = {}) {
  const { namespace: t = "app", enabled: n = !P2, minLevel: a = "debug" } = e,
    o = xh[a];
  function r(l) {
    if (!n || xh[l] < o) return () => {};
    const s = "color:#8c8c8c;",
      c = H2[l];
    return (console[l] || console.log).bind(
      console,
      `%c[${V2()}]%c[${t}][${l.toUpperCase()}]`,
      s,
      c,
    );
  }
  function i(l, s = {}) {
    return DS({
      namespace: `${t}:${l}`,
      enabled: s.enabled ?? n,
      minLevel: s.minLevel ?? a,
    });
  }
  return {
    get debug() {
      return r("debug");
    },
    get info() {
      return r("info");
    },
    get warn() {
      return r("warn");
    },
    get error() {
      return r("error");
    },
    child: i,
  };
}
const nt = DS({ namespace: "VectorStore" }),
  I2 = "HamHomeVectors",
  De = "bookmarkEmbeddings",
  G2 = 1;
class Y2 {
  constructor() {
    fc(this, "db", null);
    fc(this, "initPromise", null);
  }
  async initDB() {
    return this.db
      ? this.db
      : this.initPromise
        ? (await this.initPromise, this.db)
        : ((this.initPromise = new Promise((t, n) => {
            const a = indexedDB.open(I2, G2);
            ((a.onerror = () => {
              n(new Error("Failed to open VectorStore IndexedDB"));
            }),
              (a.onsuccess = (o) => {
                ((this.db = o.target.result), t());
              }),
              (a.onupgradeneeded = (o) => {
                const r = o.target.result;
                if (!r.objectStoreNames.contains(De)) {
                  const i = r.createObjectStore(De, { keyPath: "bookmarkId" });
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
  async saveEmbedding(t) {
    try {
      const o = (await this.initDB())
        .transaction(De, "readwrite")
        .objectStore(De)
        .put(t);
      return new Promise((r, i) => {
        ((o.onerror = () => {
          i(new Error("Failed to save embedding"));
        }),
          (o.onsuccess = () => {
            (nt.debug("Saved embedding", {
              bookmarkId: t.bookmarkId,
              dim: t.dim,
            }),
              r());
          }));
      });
    } catch (n) {
      throw (nt.error("Failed to save embedding", n), n);
    }
  }
  async saveEmbeddings(t) {
    if (t.length !== 0)
      try {
        const a = (await this.initDB()).transaction(De, "readwrite"),
          o = a.objectStore(De);
        return new Promise((r, i) => {
          ((a.onerror = () => {
            i(new Error("Failed to save embeddings batch"));
          }),
            (a.oncomplete = () => {
              (nt.debug("Saved embeddings batch", { count: t.length }), r());
            }));
          for (const l of t) o.put(l);
        });
      } catch (n) {
        throw (nt.error("Failed to save embeddings batch", n), n);
      }
  }
  async getEmbedding(t) {
    try {
      const o = (await this.initDB())
        .transaction(De, "readonly")
        .objectStore(De)
        .get(t);
      return new Promise((r, i) => {
        ((o.onerror = () => {
          i(new Error("Failed to get embedding"));
        }),
          (o.onsuccess = (l) => {
            const s = l.target.result;
            r(s ?? null);
          }));
      });
    } catch (n) {
      return (nt.error("Failed to get embedding", n), null);
    }
  }
  async getEmbeddings(t) {
    const n = new Map();
    if (t.length === 0) return n;
    try {
      const o = (await this.initDB())
          .transaction(De, "readonly")
          .objectStore(De),
        r = t.map(
          (i) =>
            new Promise((l) => {
              const s = o.get(i);
              ((s.onsuccess = (c) => {
                const f = c.target.result;
                (f && n.set(i, f), l());
              }),
                (s.onerror = () => l()));
            }),
        );
      return (await Promise.all(r), n);
    } catch (a) {
      return (nt.error("Failed to get embeddings batch", a), n);
    }
  }
  async getEmbeddingsByModel(t) {
    try {
      const r = (await this.initDB())
        .transaction(De, "readonly")
        .objectStore(De)
        .index("modelKey")
        .getAll(t);
      return new Promise((i, l) => {
        ((r.onerror = () => {
          l(new Error("Failed to get embeddings by model"));
        }),
          (r.onsuccess = (s) => {
            const c = s.target.result;
            i(c);
          }));
      });
    } catch (n) {
      return (nt.error("Failed to get embeddings by model", n), []);
    }
  }
  async getAllEmbeddings() {
    try {
      const a = (await this.initDB())
        .transaction(De, "readonly")
        .objectStore(De)
        .getAll();
      return new Promise((o, r) => {
        ((a.onerror = () => {
          r(new Error("Failed to get all embeddings"));
        }),
          (a.onsuccess = (i) => {
            const l = i.target.result;
            o(l);
          }));
      });
    } catch (t) {
      return (nt.error("Failed to get all embeddings", t), []);
    }
  }
  async needsUpdate(t, n) {
    const a = await this.getEmbedding(t);
    return a ? a.checksum !== n : !0;
  }
  async deleteEmbedding(t) {
    try {
      const o = (await this.initDB())
        .transaction(De, "readwrite")
        .objectStore(De)
        .delete(t);
      return new Promise((r, i) => {
        ((o.onerror = () => {
          i(new Error("Failed to delete embedding"));
        }),
          (o.onsuccess = () => {
            (nt.debug("Deleted embedding", { bookmarkId: t }), r());
          }));
      });
    } catch (n) {
      nt.error("Failed to delete embedding", n);
    }
  }
  async deleteEmbeddings(t) {
    if (t.length !== 0)
      try {
        const a = (await this.initDB()).transaction(De, "readwrite"),
          o = a.objectStore(De);
        return new Promise((r, i) => {
          ((a.onerror = () => {
            i(new Error("Failed to delete embeddings batch"));
          }),
            (a.oncomplete = () => {
              (nt.debug("Deleted embeddings batch", { count: t.length }), r());
            }));
          for (const l of t) o.delete(l);
        });
      } catch (n) {
        nt.error("Failed to delete embeddings batch", n);
      }
  }
  async deleteByModel(t) {
    try {
      const a = (await this.getEmbeddingsByModel(t)).map((o) => o.bookmarkId);
      return (await this.deleteEmbeddings(a), a.length);
    } catch (n) {
      return (nt.error("Failed to delete by model", n), 0);
    }
  }
  async clearAll() {
    try {
      const a = (await this.initDB())
        .transaction(De, "readwrite")
        .objectStore(De)
        .clear();
      return new Promise((o, r) => {
        ((a.onerror = () => {
          r(new Error("Failed to clear all embeddings"));
        }),
          (a.onsuccess = () => {
            (nt.info("Cleared all embeddings"), o());
          }));
      });
    } catch (t) {
      nt.error("Failed to clear all embeddings", t);
    }
  }
  async getStats() {
    try {
      const n = (await this.initDB())
          .transaction(De, "readonly")
          .objectStore(De),
        a = await new Promise((i, l) => {
          const s = n.getAll();
          ((s.onerror = () => l(new Error("Failed to get stats"))),
            (s.onsuccess = (c) => {
              i(c.target.result);
            }));
        }),
        o = {};
      let r = 0;
      for (const i of a)
        ((o[i.modelKey] = (o[i.modelKey] || 0) + 1), (r += i.dim * 4 + 200));
      return { count: a.length, countByModel: o, estimatedSize: r };
    } catch (t) {
      return (
        nt.error("Failed to get stats", t),
        { count: 0, countByModel: {}, estimatedSize: 0 }
      );
    }
  }
  async getMissingBookmarkIds(t) {
    const n = await this.getEmbeddings(t);
    return t.filter((a) => !n.has(a));
  }
}
const TN = new Y2(),
  F2 = "modulepreload",
  K2 = function (e) {
    return "/" + e;
  },
  Eh = {},
  q2 = function (t, n, a) {
    let o = Promise.resolve();
    if (n && n.length > 0) {
      document.getElementsByTagName("link");
      const i = document.querySelector("meta[property=csp-nonce]"),
        l =
          (i == null ? void 0 : i.nonce) ||
          (i == null ? void 0 : i.getAttribute("nonce"));
      o = Promise.allSettled(
        n.map((s) => {
          if (((s = K2(s)), s in Eh)) return;
          Eh[s] = !0;
          const c = s.endsWith(".css"),
            f = c ? '[rel="stylesheet"]' : "";
          if (document.querySelector(`link[href="${s}"]${f}`)) return;
          const u = document.createElement("link");
          if (
            ((u.rel = c ? "stylesheet" : F2),
            c || (u.as = "script"),
            (u.crossOrigin = ""),
            (u.href = s),
            l && u.setAttribute("nonce", l),
            document.head.appendChild(u),
            c)
          )
            return new Promise((d, g) => {
              (u.addEventListener("load", d),
                u.addEventListener("error", () =>
                  g(new Error(`Unable to preload CSS for ${s}`)),
                ));
            });
        }),
      );
    }
    function r(i) {
      const l = new Event("vite:preloadError", { cancelable: !0 });
      if (((l.payload = i), window.dispatchEvent(l), !l.defaultPrevented))
        throw i;
    }
    return o.then((i) => {
      for (const l of i || []) l.status === "rejected" && r(l.reason);
      return t().catch(r);
    });
  };
function RN(e) {
  const [t, n] = p.useState("system"),
    a = e == null ? void 0 : e.targetElement,
    o = p.useCallback(
      (s) => {
        const c = a || document.documentElement;
        OS(c, s);
      },
      [a],
    );
  p.useEffect(() => {
    ka.getSettings().then((u) => {
      (n(u.theme), o(u.theme));
    });
    const s = ka.watchSettings((u) => {
        u != null && u.theme && (n(u.theme), o(u.theme));
      }),
      c = window.matchMedia("(prefers-color-scheme: dark)"),
      f = () => {
        ka.getSettings().then((u) => {
          u.theme === "system" && o("system");
        });
      };
    return (
      c.addEventListener("change", f),
      () => {
        (c.removeEventListener("change", f), s());
      }
    );
  }, [o]);
  const r = async (s) => {
      (n(s), o(s), await ka.setSettings({ theme: s }));
    },
    i = p.useCallback(() => {
      if (!a) return !1;
      let s = a;
      for (; s; ) {
        if (s instanceof ShadowRoot) return !0;
        s = s.parentNode;
      }
      return !1;
    }, [a]),
    l = p.useCallback(
      async (s, c) => {
        const { x: f, y: u, enableAnimation: d = !0 } = c || {},
          g = a || document.documentElement;
        if (!d || !document.startViewTransition || i()) {
          (n(s), o(s), await ka.setSettings({ theme: s }));
          return;
        }
        const S = f ?? window.innerWidth / 2,
          v = u ?? window.innerHeight / 2,
          b = Math.hypot(
            Math.max(S, window.innerWidth - S),
            Math.max(v, window.innerHeight - v),
          );
        (g.style.setProperty("--theme-transition-x", `${S}px`),
          g.style.setProperty("--theme-transition-y", `${v}px`),
          g.style.setProperty("--theme-transition-radius", `${b}px`),
          document
            .startViewTransition(() => {
              (n(s), o(s));
            })
            .finished.then(() => {
              (g.style.removeProperty("--theme-transition-x"),
                g.style.removeProperty("--theme-transition-y"),
                g.style.removeProperty("--theme-transition-radius"));
            }),
          await ka.setSettings({ theme: s }));
      },
      [a, o, i],
    );
  return { theme: t, setTheme: r, setThemeWithTransition: l };
}
function OS(e, t) {
  t === "dark"
    ? e.classList.add("dark")
    : t === "light"
      ? e.classList.remove("dark")
      : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? e.classList.add("dark")
        : e.classList.remove("dark");
}
function Ch(e) {
  OS(document.documentElement, e);
}
async function MN() {
  try {
    const e = await ka.getSettings();
    Ch(e.theme);
  } catch {
    Ch("system");
  }
}
const $ = (e) => typeof e == "string",
  Sr = () => {
    let e, t;
    const n = new Promise((a, o) => {
      ((e = a), (t = o));
    });
    return ((n.resolve = e), (n.reject = t), n);
  },
  Ah = (e) => (e == null ? "" : "" + e),
  X2 = (e, t, n) => {
    e.forEach((a) => {
      t[a] && (n[a] = t[a]);
    });
  },
  $2 = /###/g,
  Th = (e) => (e && e.indexOf("###") > -1 ? e.replace($2, ".") : e),
  Rh = (e) => !e || $(e),
  Fr = (e, t, n) => {
    const a = $(t) ? t.split(".") : t;
    let o = 0;
    for (; o < a.length - 1; ) {
      if (Rh(e)) return {};
      const r = Th(a[o]);
      (!e[r] && n && (e[r] = new n()),
        Object.prototype.hasOwnProperty.call(e, r) ? (e = e[r]) : (e = {}),
        ++o);
    }
    return Rh(e) ? {} : { obj: e, k: Th(a[o]) };
  },
  Mh = (e, t, n) => {
    const { obj: a, k: o } = Fr(e, t, Object);
    if (a !== void 0 || t.length === 1) {
      a[o] = n;
      return;
    }
    let r = t[t.length - 1],
      i = t.slice(0, t.length - 1),
      l = Fr(e, i, Object);
    for (; l.obj === void 0 && i.length; )
      ((r = `${i[i.length - 1]}.${r}`),
        (i = i.slice(0, i.length - 1)),
        (l = Fr(e, i, Object)),
        l != null &&
          l.obj &&
          typeof l.obj[`${l.k}.${r}`] < "u" &&
          (l.obj = void 0));
    l.obj[`${l.k}.${r}`] = n;
  },
  Q2 = (e, t, n, a) => {
    const { obj: o, k: r } = Fr(e, t, Object);
    ((o[r] = o[r] || []), o[r].push(n));
  },
  Ss = (e, t) => {
    const { obj: n, k: a } = Fr(e, t);
    if (n && Object.prototype.hasOwnProperty.call(n, a)) return n[a];
  },
  Z2 = (e, t, n) => {
    const a = Ss(e, n);
    return a !== void 0 ? a : Ss(t, n);
  },
  kS = (e, t, n) => {
    for (const a in t)
      a !== "__proto__" &&
        a !== "constructor" &&
        (a in e
          ? $(e[a]) ||
            e[a] instanceof String ||
            $(t[a]) ||
            t[a] instanceof String
            ? n && (e[a] = t[a])
            : kS(e[a], t[a], n)
          : (e[a] = t[a]));
    return e;
  },
  co = (e) => e.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
var J2 = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "/": "&#x2F;",
};
const W2 = (e) => ($(e) ? e.replace(/[&<>"'\/]/g, (t) => J2[t]) : e);
class eO {
  constructor(t) {
    ((this.capacity = t),
      (this.regExpMap = new Map()),
      (this.regExpQueue = []));
  }
  getRegExp(t) {
    const n = this.regExpMap.get(t);
    if (n !== void 0) return n;
    const a = new RegExp(t);
    return (
      this.regExpQueue.length === this.capacity &&
        this.regExpMap.delete(this.regExpQueue.shift()),
      this.regExpMap.set(t, a),
      this.regExpQueue.push(t),
      a
    );
  }
}
const tO = [" ", ",", "?", "!", ";"],
  nO = new eO(20),
  aO = (e, t, n) => {
    ((t = t || ""), (n = n || ""));
    const a = tO.filter((i) => t.indexOf(i) < 0 && n.indexOf(i) < 0);
    if (a.length === 0) return !0;
    const o = nO.getRegExp(
      `(${a.map((i) => (i === "?" ? "\\?" : i)).join("|")})`,
    );
    let r = !o.test(e);
    if (!r) {
      const i = e.indexOf(n);
      i > 0 && !o.test(e.substring(0, i)) && (r = !0);
    }
    return r;
  },
  xf = function (e, t) {
    let n =
      arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : ".";
    if (!e) return;
    if (e[t]) return Object.prototype.hasOwnProperty.call(e, t) ? e[t] : void 0;
    const a = t.split(n);
    let o = e;
    for (let r = 0; r < a.length; ) {
      if (!o || typeof o != "object") return;
      let i,
        l = "";
      for (let s = r; s < a.length; ++s)
        if ((s !== r && (l += n), (l += a[s]), (i = o[l]), i !== void 0)) {
          if (
            ["string", "number", "boolean"].indexOf(typeof i) > -1 &&
            s < a.length - 1
          )
            continue;
          r += s - r + 1;
          break;
        }
      o = i;
    }
    return o;
  },
  ws = (e) => (e == null ? void 0 : e.replace("_", "-")),
  oO = {
    type: "logger",
    log(e) {
      this.output("log", e);
    },
    warn(e) {
      this.output("warn", e);
    },
    error(e) {
      this.output("error", e);
    },
    output(e, t) {
      var n, a;
      (a =
        (n = console == null ? void 0 : console[e]) == null
          ? void 0
          : n.apply) == null || a.call(n, console, t);
    },
  };
class xs {
  constructor(t) {
    let n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    this.init(t, n);
  }
  init(t) {
    let n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    ((this.prefix = n.prefix || "i18next:"),
      (this.logger = t || oO),
      (this.options = n),
      (this.debug = n.debug));
  }
  log() {
    for (var t = arguments.length, n = new Array(t), a = 0; a < t; a++)
      n[a] = arguments[a];
    return this.forward(n, "log", "", !0);
  }
  warn() {
    for (var t = arguments.length, n = new Array(t), a = 0; a < t; a++)
      n[a] = arguments[a];
    return this.forward(n, "warn", "", !0);
  }
  error() {
    for (var t = arguments.length, n = new Array(t), a = 0; a < t; a++)
      n[a] = arguments[a];
    return this.forward(n, "error", "");
  }
  deprecate() {
    for (var t = arguments.length, n = new Array(t), a = 0; a < t; a++)
      n[a] = arguments[a];
    return this.forward(n, "warn", "WARNING DEPRECATED: ", !0);
  }
  forward(t, n, a, o) {
    return o && !this.debug
      ? null
      : ($(t[0]) && (t[0] = `${a}${this.prefix} ${t[0]}`), this.logger[n](t));
  }
  create(t) {
    return new xs(this.logger, {
      prefix: `${this.prefix}:${t}:`,
      ...this.options,
    });
  }
  clone(t) {
    return (
      (t = t || this.options),
      (t.prefix = t.prefix || this.prefix),
      new xs(this.logger, t)
    );
  }
}
var cn = new xs();
class sc {
  constructor() {
    this.observers = {};
  }
  on(t, n) {
    return (
      t.split(" ").forEach((a) => {
        this.observers[a] || (this.observers[a] = new Map());
        const o = this.observers[a].get(n) || 0;
        this.observers[a].set(n, o + 1);
      }),
      this
    );
  }
  off(t, n) {
    if (this.observers[t]) {
      if (!n) {
        delete this.observers[t];
        return;
      }
      this.observers[t].delete(n);
    }
  }
  emit(t) {
    for (
      var n = arguments.length, a = new Array(n > 1 ? n - 1 : 0), o = 1;
      o < n;
      o++
    )
      a[o - 1] = arguments[o];
    (this.observers[t] &&
      Array.from(this.observers[t].entries()).forEach((i) => {
        let [l, s] = i;
        for (let c = 0; c < s; c++) l(...a);
      }),
      this.observers["*"] &&
        Array.from(this.observers["*"].entries()).forEach((i) => {
          let [l, s] = i;
          for (let c = 0; c < s; c++) l.apply(l, [t, ...a]);
        }));
  }
}
class Dh extends sc {
  constructor(t) {
    let n =
      arguments.length > 1 && arguments[1] !== void 0
        ? arguments[1]
        : { ns: ["translation"], defaultNS: "translation" };
    (super(),
      (this.data = t || {}),
      (this.options = n),
      this.options.keySeparator === void 0 && (this.options.keySeparator = "."),
      this.options.ignoreJSONStructure === void 0 &&
        (this.options.ignoreJSONStructure = !0));
  }
  addNamespaces(t) {
    this.options.ns.indexOf(t) < 0 && this.options.ns.push(t);
  }
  removeNamespaces(t) {
    const n = this.options.ns.indexOf(t);
    n > -1 && this.options.ns.splice(n, 1);
  }
  getResource(t, n, a) {
    var c, f;
    let o = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {};
    const r =
        o.keySeparator !== void 0 ? o.keySeparator : this.options.keySeparator,
      i =
        o.ignoreJSONStructure !== void 0
          ? o.ignoreJSONStructure
          : this.options.ignoreJSONStructure;
    let l;
    t.indexOf(".") > -1
      ? (l = t.split("."))
      : ((l = [t, n]),
        a &&
          (Array.isArray(a)
            ? l.push(...a)
            : $(a) && r
              ? l.push(...a.split(r))
              : l.push(a)));
    const s = Ss(this.data, l);
    return (
      !s &&
        !n &&
        !a &&
        t.indexOf(".") > -1 &&
        ((t = l[0]), (n = l[1]), (a = l.slice(2).join("."))),
      s || !i || !$(a)
        ? s
        : xf(
            (f = (c = this.data) == null ? void 0 : c[t]) == null
              ? void 0
              : f[n],
            a,
            r,
          )
    );
  }
  addResource(t, n, a, o) {
    let r =
      arguments.length > 4 && arguments[4] !== void 0
        ? arguments[4]
        : { silent: !1 };
    const i =
      r.keySeparator !== void 0 ? r.keySeparator : this.options.keySeparator;
    let l = [t, n];
    (a && (l = l.concat(i ? a.split(i) : a)),
      t.indexOf(".") > -1 && ((l = t.split(".")), (o = n), (n = l[1])),
      this.addNamespaces(n),
      Mh(this.data, l, o),
      r.silent || this.emit("added", t, n, a, o));
  }
  addResources(t, n, a) {
    let o =
      arguments.length > 3 && arguments[3] !== void 0
        ? arguments[3]
        : { silent: !1 };
    for (const r in a)
      ($(a[r]) || Array.isArray(a[r])) &&
        this.addResource(t, n, r, a[r], { silent: !0 });
    o.silent || this.emit("added", t, n, a);
  }
  addResourceBundle(t, n, a, o, r) {
    let i =
        arguments.length > 5 && arguments[5] !== void 0
          ? arguments[5]
          : { silent: !1, skipCopy: !1 },
      l = [t, n];
    (t.indexOf(".") > -1 && ((l = t.split(".")), (o = a), (a = n), (n = l[1])),
      this.addNamespaces(n));
    let s = Ss(this.data, l) || {};
    (i.skipCopy || (a = JSON.parse(JSON.stringify(a))),
      o ? kS(s, a, r) : (s = { ...s, ...a }),
      Mh(this.data, l, s),
      i.silent || this.emit("added", t, n, a));
  }
  removeResourceBundle(t, n) {
    (this.hasResourceBundle(t, n) && delete this.data[t][n],
      this.removeNamespaces(n),
      this.emit("removed", t, n));
  }
  hasResourceBundle(t, n) {
    return this.getResource(t, n) !== void 0;
  }
  getResourceBundle(t, n) {
    return (n || (n = this.options.defaultNS), this.getResource(t, n));
  }
  getDataByLanguage(t) {
    return this.data[t];
  }
  hasLanguageSomeTranslations(t) {
    const n = this.getDataByLanguage(t);
    return !!((n && Object.keys(n)) || []).find(
      (o) => n[o] && Object.keys(n[o]).length > 0,
    );
  }
  toJSON() {
    return this.data;
  }
}
var NS = {
  processors: {},
  addPostProcessor(e) {
    this.processors[e.name] = e;
  },
  handle(e, t, n, a, o) {
    return (
      e.forEach((r) => {
        var i;
        t =
          ((i = this.processors[r]) == null ? void 0 : i.process(t, n, a, o)) ??
          t;
      }),
      t
    );
  },
};
const Oh = {},
  kh = (e) => !$(e) && typeof e != "boolean" && typeof e != "number";
class Es extends sc {
  constructor(t) {
    let n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    (super(),
      X2(
        [
          "resourceStore",
          "languageUtils",
          "pluralResolver",
          "interpolator",
          "backendConnector",
          "i18nFormat",
          "utils",
        ],
        t,
        this,
      ),
      (this.options = n),
      this.options.keySeparator === void 0 && (this.options.keySeparator = "."),
      (this.logger = cn.create("translator")));
  }
  changeLanguage(t) {
    t && (this.language = t);
  }
  exists(t) {
    let n =
      arguments.length > 1 && arguments[1] !== void 0
        ? arguments[1]
        : { interpolation: {} };
    if (t == null) return !1;
    const a = this.resolve(t, n);
    return (a == null ? void 0 : a.res) !== void 0;
  }
  extractFromKey(t, n) {
    let a = n.nsSeparator !== void 0 ? n.nsSeparator : this.options.nsSeparator;
    a === void 0 && (a = ":");
    const o =
      n.keySeparator !== void 0 ? n.keySeparator : this.options.keySeparator;
    let r = n.ns || this.options.defaultNS || [];
    const i = a && t.indexOf(a) > -1,
      l =
        !this.options.userDefinedKeySeparator &&
        !n.keySeparator &&
        !this.options.userDefinedNsSeparator &&
        !n.nsSeparator &&
        !aO(t, a, o);
    if (i && !l) {
      const s = t.match(this.interpolator.nestingRegexp);
      if (s && s.length > 0) return { key: t, namespaces: $(r) ? [r] : r };
      const c = t.split(a);
      ((a !== o || (a === o && this.options.ns.indexOf(c[0]) > -1)) &&
        (r = c.shift()),
        (t = c.join(o)));
    }
    return { key: t, namespaces: $(r) ? [r] : r };
  }
  translate(t, n, a) {
    if (
      (typeof n != "object" &&
        this.options.overloadTranslationOptionHandler &&
        (n = this.options.overloadTranslationOptionHandler(arguments)),
      typeof n == "object" && (n = { ...n }),
      n || (n = {}),
      t == null)
    )
      return "";
    Array.isArray(t) || (t = [String(t)]);
    const o =
        n.returnDetails !== void 0
          ? n.returnDetails
          : this.options.returnDetails,
      r =
        n.keySeparator !== void 0 ? n.keySeparator : this.options.keySeparator,
      { key: i, namespaces: l } = this.extractFromKey(t[t.length - 1], n),
      s = l[l.length - 1],
      c = n.lng || this.language,
      f = n.appendNamespaceToCIMode || this.options.appendNamespaceToCIMode;
    if ((c == null ? void 0 : c.toLowerCase()) === "cimode") {
      if (f) {
        const B = n.nsSeparator || this.options.nsSeparator;
        return o
          ? {
              res: `${s}${B}${i}`,
              usedKey: i,
              exactUsedKey: i,
              usedLng: c,
              usedNS: s,
              usedParams: this.getUsedParamsDetails(n),
            }
          : `${s}${B}${i}`;
      }
      return o
        ? {
            res: i,
            usedKey: i,
            exactUsedKey: i,
            usedLng: c,
            usedNS: s,
            usedParams: this.getUsedParamsDetails(n),
          }
        : i;
    }
    const u = this.resolve(t, n);
    let d = u == null ? void 0 : u.res;
    const g = (u == null ? void 0 : u.usedKey) || i,
      S = (u == null ? void 0 : u.exactUsedKey) || i,
      v = ["[object Number]", "[object Function]", "[object RegExp]"],
      b = n.joinArrays !== void 0 ? n.joinArrays : this.options.joinArrays,
      m = !this.i18nFormat || this.i18nFormat.handleAsObject,
      h = n.count !== void 0 && !$(n.count),
      y = Es.hasDefaultValue(n),
      w = h ? this.pluralResolver.getSuffix(c, n.count, n) : "",
      C =
        n.ordinal && h
          ? this.pluralResolver.getSuffix(c, n.count, { ordinal: !1 })
          : "",
      R = h && !n.ordinal && n.count === 0,
      E =
        (R && n[`defaultValue${this.options.pluralSeparator}zero`]) ||
        n[`defaultValue${w}`] ||
        n[`defaultValue${C}`] ||
        n.defaultValue;
    let A = d;
    m && !d && y && (A = E);
    const O = kh(A),
      N = Object.prototype.toString.apply(A);
    if (m && A && O && v.indexOf(N) < 0 && !($(b) && Array.isArray(A))) {
      if (!n.returnObjects && !this.options.returnObjects) {
        this.options.returnedObjectHandler ||
          this.logger.warn(
            "accessing an object - but returnObjects options is not enabled!",
          );
        const B = this.options.returnedObjectHandler
          ? this.options.returnedObjectHandler(g, A, { ...n, ns: l })
          : `key '${i} (${this.language})' returned an object instead of string.`;
        return o
          ? ((u.res = B), (u.usedParams = this.getUsedParamsDetails(n)), u)
          : B;
      }
      if (r) {
        const B = Array.isArray(A),
          z = B ? [] : {},
          G = B ? S : g;
        for (const V in A)
          if (Object.prototype.hasOwnProperty.call(A, V)) {
            const Y = `${G}${r}${V}`;
            (y && !d
              ? (z[V] = this.translate(Y, {
                  ...n,
                  defaultValue: kh(E) ? E[V] : void 0,
                  joinArrays: !1,
                  ns: l,
                }))
              : (z[V] = this.translate(Y, { ...n, joinArrays: !1, ns: l })),
              z[V] === Y && (z[V] = A[V]));
          }
        d = z;
      }
    } else if (m && $(b) && Array.isArray(d))
      ((d = d.join(b)), d && (d = this.extendTranslation(d, t, n, a)));
    else {
      let B = !1,
        z = !1;
      (!this.isValidLookup(d) && y && ((B = !0), (d = E)),
        this.isValidLookup(d) || ((z = !0), (d = i)));
      const V =
          (n.missingKeyNoValueFallbackToKey ||
            this.options.missingKeyNoValueFallbackToKey) &&
          z
            ? void 0
            : d,
        Y = y && E !== d && this.options.updateMissing;
      if (z || B || Y) {
        if (
          (this.logger.log(Y ? "updateKey" : "missingKey", c, s, i, Y ? E : d),
          r)
        ) {
          const D = this.resolve(i, { ...n, keySeparator: !1 });
          D &&
            D.res &&
            this.logger.warn(
              "Seems the loaded translations were in flat JSON format instead of nested. Either set keySeparator: false on init or make sure your translations are published in nested format.",
            );
        }
        let M = [];
        const _ = this.languageUtils.getFallbackCodes(
          this.options.fallbackLng,
          n.lng || this.language,
        );
        if (this.options.saveMissingTo === "fallback" && _ && _[0])
          for (let D = 0; D < _.length; D++) M.push(_[D]);
        else
          this.options.saveMissingTo === "all"
            ? (M = this.languageUtils.toResolveHierarchy(
                n.lng || this.language,
              ))
            : M.push(n.lng || this.language);
        const T = (D, j, q) => {
          var U;
          const le = y && q !== d ? q : V;
          (this.options.missingKeyHandler
            ? this.options.missingKeyHandler(D, s, j, le, Y, n)
            : (U = this.backendConnector) != null &&
              U.saveMissing &&
              this.backendConnector.saveMissing(D, s, j, le, Y, n),
            this.emit("missingKey", D, s, j, d));
        };
        this.options.saveMissing &&
          (this.options.saveMissingPlurals && h
            ? M.forEach((D) => {
                const j = this.pluralResolver.getSuffixes(D, n);
                (R &&
                  n[`defaultValue${this.options.pluralSeparator}zero`] &&
                  j.indexOf(`${this.options.pluralSeparator}zero`) < 0 &&
                  j.push(`${this.options.pluralSeparator}zero`),
                  j.forEach((q) => {
                    T([D], i + q, n[`defaultValue${q}`] || E);
                  }));
              })
            : T(M, i, E));
      }
      ((d = this.extendTranslation(d, t, n, u, a)),
        z &&
          d === i &&
          this.options.appendNamespaceToMissingKey &&
          (d = `${s}:${i}`),
        (z || B) &&
          this.options.parseMissingKeyHandler &&
          (d = this.options.parseMissingKeyHandler(
            this.options.appendNamespaceToMissingKey ? `${s}:${i}` : i,
            B ? d : void 0,
          )));
    }
    return o
      ? ((u.res = d), (u.usedParams = this.getUsedParamsDetails(n)), u)
      : d;
  }
  extendTranslation(t, n, a, o, r) {
    var c, f;
    var i = this;
    if ((c = this.i18nFormat) != null && c.parse)
      t = this.i18nFormat.parse(
        t,
        { ...this.options.interpolation.defaultVariables, ...a },
        a.lng || this.language || o.usedLng,
        o.usedNS,
        o.usedKey,
        { resolved: o },
      );
    else if (!a.skipInterpolation) {
      a.interpolation &&
        this.interpolator.init({
          ...a,
          interpolation: { ...this.options.interpolation, ...a.interpolation },
        });
      const u =
        $(t) &&
        (((f = a == null ? void 0 : a.interpolation) == null
          ? void 0
          : f.skipOnVariables) !== void 0
          ? a.interpolation.skipOnVariables
          : this.options.interpolation.skipOnVariables);
      let d;
      if (u) {
        const S = t.match(this.interpolator.nestingRegexp);
        d = S && S.length;
      }
      let g = a.replace && !$(a.replace) ? a.replace : a;
      if (
        (this.options.interpolation.defaultVariables &&
          (g = { ...this.options.interpolation.defaultVariables, ...g }),
        (t = this.interpolator.interpolate(
          t,
          g,
          a.lng || this.language || o.usedLng,
          a,
        )),
        u)
      ) {
        const S = t.match(this.interpolator.nestingRegexp),
          v = S && S.length;
        d < v && (a.nest = !1);
      }
      (!a.lng && o && o.res && (a.lng = this.language || o.usedLng),
        a.nest !== !1 &&
          (t = this.interpolator.nest(
            t,
            function () {
              for (
                var S = arguments.length, v = new Array(S), b = 0;
                b < S;
                b++
              )
                v[b] = arguments[b];
              return (r == null ? void 0 : r[0]) === v[0] && !a.context
                ? (i.logger.warn(
                    `It seems you are nesting recursively key: ${v[0]} in key: ${n[0]}`,
                  ),
                  null)
                : i.translate(...v, n);
            },
            a,
          )),
        a.interpolation && this.interpolator.reset());
    }
    const l = a.postProcess || this.options.postProcess,
      s = $(l) ? [l] : l;
    return (
      t != null &&
        s != null &&
        s.length &&
        a.applyPostProcessor !== !1 &&
        (t = NS.handle(
          s,
          t,
          n,
          this.options && this.options.postProcessPassResolved
            ? {
                i18nResolved: {
                  ...o,
                  usedParams: this.getUsedParamsDetails(a),
                },
                ...a,
              }
            : a,
          this,
        )),
      t
    );
  }
  resolve(t) {
    let n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {},
      a,
      o,
      r,
      i,
      l;
    return (
      $(t) && (t = [t]),
      t.forEach((s) => {
        if (this.isValidLookup(a)) return;
        const c = this.extractFromKey(s, n),
          f = c.key;
        o = f;
        let u = c.namespaces;
        this.options.fallbackNS && (u = u.concat(this.options.fallbackNS));
        const d = n.count !== void 0 && !$(n.count),
          g = d && !n.ordinal && n.count === 0,
          S =
            n.context !== void 0 &&
            ($(n.context) || typeof n.context == "number") &&
            n.context !== "",
          v = n.lngs
            ? n.lngs
            : this.languageUtils.toResolveHierarchy(
                n.lng || this.language,
                n.fallbackLng,
              );
        u.forEach((b) => {
          var m, h;
          this.isValidLookup(a) ||
            ((l = b),
            !Oh[`${v[0]}-${b}`] &&
              (m = this.utils) != null &&
              m.hasLoadedNamespace &&
              !((h = this.utils) != null && h.hasLoadedNamespace(l)) &&
              ((Oh[`${v[0]}-${b}`] = !0),
              this.logger.warn(
                `key "${o}" for languages "${v.join(", ")}" won't get resolved as namespace "${l}" was not yet loaded`,
                "This means something IS WRONG in your setup. You access the t function before i18next.init / i18next.loadNamespace / i18next.changeLanguage was done. Wait for the callback or Promise to resolve before accessing it!!!",
              )),
            v.forEach((y) => {
              var R;
              if (this.isValidLookup(a)) return;
              i = y;
              const w = [f];
              if ((R = this.i18nFormat) != null && R.addLookupKeys)
                this.i18nFormat.addLookupKeys(w, f, y, b, n);
              else {
                let E;
                d && (E = this.pluralResolver.getSuffix(y, n.count, n));
                const A = `${this.options.pluralSeparator}zero`,
                  O = `${this.options.pluralSeparator}ordinal${this.options.pluralSeparator}`;
                if (
                  (d &&
                    (w.push(f + E),
                    n.ordinal &&
                      E.indexOf(O) === 0 &&
                      w.push(f + E.replace(O, this.options.pluralSeparator)),
                    g && w.push(f + A)),
                  S)
                ) {
                  const N = `${f}${this.options.contextSeparator}${n.context}`;
                  (w.push(N),
                    d &&
                      (w.push(N + E),
                      n.ordinal &&
                        E.indexOf(O) === 0 &&
                        w.push(N + E.replace(O, this.options.pluralSeparator)),
                      g && w.push(N + A)));
                }
              }
              let C;
              for (; (C = w.pop()); )
                this.isValidLookup(a) ||
                  ((r = C), (a = this.getResource(y, b, C, n)));
            }));
        });
      }),
      { res: a, usedKey: o, exactUsedKey: r, usedLng: i, usedNS: l }
    );
  }
  isValidLookup(t) {
    return (
      t !== void 0 &&
      !(!this.options.returnNull && t === null) &&
      !(!this.options.returnEmptyString && t === "")
    );
  }
  getResource(t, n, a) {
    var r;
    let o = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {};
    return (r = this.i18nFormat) != null && r.getResource
      ? this.i18nFormat.getResource(t, n, a, o)
      : this.resourceStore.getResource(t, n, a, o);
  }
  getUsedParamsDetails() {
    let t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    const n = [
        "defaultValue",
        "ordinal",
        "context",
        "replace",
        "lng",
        "lngs",
        "fallbackLng",
        "ns",
        "keySeparator",
        "nsSeparator",
        "returnObjects",
        "returnDetails",
        "joinArrays",
        "postProcess",
        "interpolation",
      ],
      a = t.replace && !$(t.replace);
    let o = a ? t.replace : t;
    if (
      (a && typeof t.count < "u" && (o.count = t.count),
      this.options.interpolation.defaultVariables &&
        (o = { ...this.options.interpolation.defaultVariables, ...o }),
      !a)
    ) {
      o = { ...o };
      for (const r of n) delete o[r];
    }
    return o;
  }
  static hasDefaultValue(t) {
    const n = "defaultValue";
    for (const a in t)
      if (
        Object.prototype.hasOwnProperty.call(t, a) &&
        n === a.substring(0, n.length) &&
        t[a] !== void 0
      )
        return !0;
    return !1;
  }
}
class Nh {
  constructor(t) {
    ((this.options = t),
      (this.supportedLngs = this.options.supportedLngs || !1),
      (this.logger = cn.create("languageUtils")));
  }
  getScriptPartFromCode(t) {
    if (((t = ws(t)), !t || t.indexOf("-") < 0)) return null;
    const n = t.split("-");
    return n.length === 2 || (n.pop(), n[n.length - 1].toLowerCase() === "x")
      ? null
      : this.formatLanguageCode(n.join("-"));
  }
  getLanguagePartFromCode(t) {
    if (((t = ws(t)), !t || t.indexOf("-") < 0)) return t;
    const n = t.split("-");
    return this.formatLanguageCode(n[0]);
  }
  formatLanguageCode(t) {
    if ($(t) && t.indexOf("-") > -1) {
      let n;
      try {
        n = Intl.getCanonicalLocales(t)[0];
      } catch {}
      return (
        n && this.options.lowerCaseLng && (n = n.toLowerCase()),
        n || (this.options.lowerCaseLng ? t.toLowerCase() : t)
      );
    }
    return this.options.cleanCode || this.options.lowerCaseLng
      ? t.toLowerCase()
      : t;
  }
  isSupportedCode(t) {
    return (
      (this.options.load === "languageOnly" ||
        this.options.nonExplicitSupportedLngs) &&
        (t = this.getLanguagePartFromCode(t)),
      !this.supportedLngs ||
        !this.supportedLngs.length ||
        this.supportedLngs.indexOf(t) > -1
    );
  }
  getBestMatchFromCodes(t) {
    if (!t) return null;
    let n;
    return (
      t.forEach((a) => {
        if (n) return;
        const o = this.formatLanguageCode(a);
        (!this.options.supportedLngs || this.isSupportedCode(o)) && (n = o);
      }),
      !n &&
        this.options.supportedLngs &&
        t.forEach((a) => {
          if (n) return;
          const o = this.getLanguagePartFromCode(a);
          if (this.isSupportedCode(o)) return (n = o);
          n = this.options.supportedLngs.find((r) => {
            if (r === o) return r;
            if (
              !(r.indexOf("-") < 0 && o.indexOf("-") < 0) &&
              ((r.indexOf("-") > 0 &&
                o.indexOf("-") < 0 &&
                r.substring(0, r.indexOf("-")) === o) ||
                (r.indexOf(o) === 0 && o.length > 1))
            )
              return r;
          });
        }),
      n || (n = this.getFallbackCodes(this.options.fallbackLng)[0]),
      n
    );
  }
  getFallbackCodes(t, n) {
    if (!t) return [];
    if (
      (typeof t == "function" && (t = t(n)),
      $(t) && (t = [t]),
      Array.isArray(t))
    )
      return t;
    if (!n) return t.default || [];
    let a = t[n];
    return (
      a || (a = t[this.getScriptPartFromCode(n)]),
      a || (a = t[this.formatLanguageCode(n)]),
      a || (a = t[this.getLanguagePartFromCode(n)]),
      a || (a = t.default),
      a || []
    );
  }
  toResolveHierarchy(t, n) {
    const a = this.getFallbackCodes(n || this.options.fallbackLng || [], t),
      o = [],
      r = (i) => {
        i &&
          (this.isSupportedCode(i)
            ? o.push(i)
            : this.logger.warn(
                `rejecting language code not found in supportedLngs: ${i}`,
              ));
      };
    return (
      $(t) && (t.indexOf("-") > -1 || t.indexOf("_") > -1)
        ? (this.options.load !== "languageOnly" &&
            r(this.formatLanguageCode(t)),
          this.options.load !== "languageOnly" &&
            this.options.load !== "currentOnly" &&
            r(this.getScriptPartFromCode(t)),
          this.options.load !== "currentOnly" &&
            r(this.getLanguagePartFromCode(t)))
        : $(t) && r(this.formatLanguageCode(t)),
      a.forEach((i) => {
        o.indexOf(i) < 0 && r(this.formatLanguageCode(i));
      }),
      o
    );
  }
}
const _h = { zero: 0, one: 1, two: 2, few: 3, many: 4, other: 5 },
  Lh = {
    select: (e) => (e === 1 ? "one" : "other"),
    resolvedOptions: () => ({ pluralCategories: ["one", "other"] }),
  };
class rO {
  constructor(t) {
    let n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    ((this.languageUtils = t),
      (this.options = n),
      (this.logger = cn.create("pluralResolver")),
      (this.pluralRulesCache = {}));
  }
  addRule(t, n) {
    this.rules[t] = n;
  }
  clearCache() {
    this.pluralRulesCache = {};
  }
  getRule(t) {
    let n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    const a = ws(t === "dev" ? "en" : t),
      o = n.ordinal ? "ordinal" : "cardinal",
      r = JSON.stringify({ cleanedCode: a, type: o });
    if (r in this.pluralRulesCache) return this.pluralRulesCache[r];
    let i;
    try {
      i = new Intl.PluralRules(a, { type: o });
    } catch {
      if (!Intl)
        return (
          this.logger.error("No Intl support, please use an Intl polyfill!"),
          Lh
        );
      if (!t.match(/-|_/)) return Lh;
      const s = this.languageUtils.getLanguagePartFromCode(t);
      i = this.getRule(s, n);
    }
    return ((this.pluralRulesCache[r] = i), i);
  }
  needsPlural(t) {
    let n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {},
      a = this.getRule(t, n);
    return (
      a || (a = this.getRule("dev", n)),
      (a == null ? void 0 : a.resolvedOptions().pluralCategories.length) > 1
    );
  }
  getPluralFormsOfKey(t, n) {
    let a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    return this.getSuffixes(t, a).map((o) => `${n}${o}`);
  }
  getSuffixes(t) {
    let n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {},
      a = this.getRule(t, n);
    return (
      a || (a = this.getRule("dev", n)),
      a
        ? a
            .resolvedOptions()
            .pluralCategories.sort((o, r) => _h[o] - _h[r])
            .map(
              (o) =>
                `${this.options.prepend}${n.ordinal ? `ordinal${this.options.prepend}` : ""}${o}`,
            )
        : []
    );
  }
  getSuffix(t, n) {
    let a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    const o = this.getRule(t, a);
    return o
      ? `${this.options.prepend}${a.ordinal ? `ordinal${this.options.prepend}` : ""}${o.select(n)}`
      : (this.logger.warn(`no plural rule found for: ${t}`),
        this.getSuffix("dev", n, a));
  }
}
const zh = function (e, t, n) {
    let a =
        arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : ".",
      o = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0,
      r = Z2(e, t, n);
    return (
      !r && o && $(n) && ((r = xf(e, n, a)), r === void 0 && (r = xf(t, n, a))),
      r
    );
  },
  cu = (e) => e.replace(/\$/g, "$$$$");
class iO {
  constructor() {
    var n;
    let t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    ((this.logger = cn.create("interpolator")),
      (this.options = t),
      (this.format =
        ((n = t == null ? void 0 : t.interpolation) == null
          ? void 0
          : n.format) || ((a) => a)),
      this.init(t));
  }
  init() {
    let t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    t.interpolation || (t.interpolation = { escapeValue: !0 });
    const {
      escape: n,
      escapeValue: a,
      useRawValueToEscape: o,
      prefix: r,
      prefixEscaped: i,
      suffix: l,
      suffixEscaped: s,
      formatSeparator: c,
      unescapeSuffix: f,
      unescapePrefix: u,
      nestingPrefix: d,
      nestingPrefixEscaped: g,
      nestingSuffix: S,
      nestingSuffixEscaped: v,
      nestingOptionsSeparator: b,
      maxReplaces: m,
      alwaysFormat: h,
    } = t.interpolation;
    ((this.escape = n !== void 0 ? n : W2),
      (this.escapeValue = a !== void 0 ? a : !0),
      (this.useRawValueToEscape = o !== void 0 ? o : !1),
      (this.prefix = r ? co(r) : i || "{{"),
      (this.suffix = l ? co(l) : s || "}}"),
      (this.formatSeparator = c || ","),
      (this.unescapePrefix = f ? "" : u || "-"),
      (this.unescapeSuffix = this.unescapePrefix ? "" : f || ""),
      (this.nestingPrefix = d ? co(d) : g || co("$t(")),
      (this.nestingSuffix = S ? co(S) : v || co(")")),
      (this.nestingOptionsSeparator = b || ","),
      (this.maxReplaces = m || 1e3),
      (this.alwaysFormat = h !== void 0 ? h : !1),
      this.resetRegExp());
  }
  reset() {
    this.options && this.init(this.options);
  }
  resetRegExp() {
    const t = (n, a) =>
      (n == null ? void 0 : n.source) === a
        ? ((n.lastIndex = 0), n)
        : new RegExp(a, "g");
    ((this.regexp = t(this.regexp, `${this.prefix}(.+?)${this.suffix}`)),
      (this.regexpUnescape = t(
        this.regexpUnescape,
        `${this.prefix}${this.unescapePrefix}(.+?)${this.unescapeSuffix}${this.suffix}`,
      )),
      (this.nestingRegexp = t(
        this.nestingRegexp,
        `${this.nestingPrefix}(.+?)${this.nestingSuffix}`,
      )));
  }
  interpolate(t, n, a, o) {
    var g;
    let r, i, l;
    const s =
        (this.options &&
          this.options.interpolation &&
          this.options.interpolation.defaultVariables) ||
        {},
      c = (S) => {
        if (S.indexOf(this.formatSeparator) < 0) {
          const h = zh(
            n,
            s,
            S,
            this.options.keySeparator,
            this.options.ignoreJSONStructure,
          );
          return this.alwaysFormat
            ? this.format(h, void 0, a, { ...o, ...n, interpolationkey: S })
            : h;
        }
        const v = S.split(this.formatSeparator),
          b = v.shift().trim(),
          m = v.join(this.formatSeparator).trim();
        return this.format(
          zh(
            n,
            s,
            b,
            this.options.keySeparator,
            this.options.ignoreJSONStructure,
          ),
          m,
          a,
          { ...o, ...n, interpolationkey: b },
        );
      };
    this.resetRegExp();
    const f =
        (o == null ? void 0 : o.missingInterpolationHandler) ||
        this.options.missingInterpolationHandler,
      u =
        ((g = o == null ? void 0 : o.interpolation) == null
          ? void 0
          : g.skipOnVariables) !== void 0
          ? o.interpolation.skipOnVariables
          : this.options.interpolation.skipOnVariables;
    return (
      [
        { regex: this.regexpUnescape, safeValue: (S) => cu(S) },
        {
          regex: this.regexp,
          safeValue: (S) => (this.escapeValue ? cu(this.escape(S)) : cu(S)),
        },
      ].forEach((S) => {
        for (l = 0; (r = S.regex.exec(t)); ) {
          const v = r[1].trim();
          if (((i = c(v)), i === void 0))
            if (typeof f == "function") {
              const m = f(t, r, o);
              i = $(m) ? m : "";
            } else if (o && Object.prototype.hasOwnProperty.call(o, v)) i = "";
            else if (u) {
              i = r[0];
              continue;
            } else
              (this.logger.warn(
                `missed to pass in variable ${v} for interpolating ${t}`,
              ),
                (i = ""));
          else !$(i) && !this.useRawValueToEscape && (i = Ah(i));
          const b = S.safeValue(i);
          if (
            ((t = t.replace(r[0], b)),
            u
              ? ((S.regex.lastIndex += i.length),
                (S.regex.lastIndex -= r[0].length))
              : (S.regex.lastIndex = 0),
            l++,
            l >= this.maxReplaces)
          )
            break;
        }
      }),
      t
    );
  }
  nest(t, n) {
    let a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {},
      o,
      r,
      i;
    const l = (s, c) => {
      const f = this.nestingOptionsSeparator;
      if (s.indexOf(f) < 0) return s;
      const u = s.split(new RegExp(`${f}[ ]*{`));
      let d = `{${u[1]}`;
      ((s = u[0]), (d = this.interpolate(d, i)));
      const g = d.match(/'/g),
        S = d.match(/"/g);
      ((((g == null ? void 0 : g.length) ?? 0) % 2 === 0 && !S) ||
        S.length % 2 !== 0) &&
        (d = d.replace(/'/g, '"'));
      try {
        ((i = JSON.parse(d)), c && (i = { ...c, ...i }));
      } catch (v) {
        return (
          this.logger.warn(
            `failed parsing options string in nesting for key ${s}`,
            v,
          ),
          `${s}${f}${d}`
        );
      }
      return (
        i.defaultValue &&
          i.defaultValue.indexOf(this.prefix) > -1 &&
          delete i.defaultValue,
        s
      );
    };
    for (; (o = this.nestingRegexp.exec(t)); ) {
      let s = [];
      ((i = { ...a }),
        (i = i.replace && !$(i.replace) ? i.replace : i),
        (i.applyPostProcessor = !1),
        delete i.defaultValue);
      let c = !1;
      if (o[0].indexOf(this.formatSeparator) !== -1 && !/{.*}/.test(o[1])) {
        const f = o[1].split(this.formatSeparator).map((u) => u.trim());
        ((o[1] = f.shift()), (s = f), (c = !0));
      }
      if (((r = n(l.call(this, o[1].trim(), i), i)), r && o[0] === t && !$(r)))
        return r;
      ($(r) || (r = Ah(r)),
        r ||
          (this.logger.warn(`missed to resolve ${o[1]} for nesting ${t}`),
          (r = "")),
        c &&
          (r = s.reduce(
            (f, u) =>
              this.format(f, u, a.lng, { ...a, interpolationkey: o[1].trim() }),
            r.trim(),
          )),
        (t = t.replace(o[0], r)),
        (this.regexp.lastIndex = 0));
    }
    return t;
  }
}
const lO = (e) => {
    let t = e.toLowerCase().trim();
    const n = {};
    if (e.indexOf("(") > -1) {
      const a = e.split("(");
      t = a[0].toLowerCase().trim();
      const o = a[1].substring(0, a[1].length - 1);
      t === "currency" && o.indexOf(":") < 0
        ? n.currency || (n.currency = o.trim())
        : t === "relativetime" && o.indexOf(":") < 0
          ? n.range || (n.range = o.trim())
          : o.split(";").forEach((i) => {
              if (i) {
                const [l, ...s] = i.split(":"),
                  c = s
                    .join(":")
                    .trim()
                    .replace(/^'+|'+$/g, ""),
                  f = l.trim();
                (n[f] || (n[f] = c),
                  c === "false" && (n[f] = !1),
                  c === "true" && (n[f] = !0),
                  isNaN(c) || (n[f] = parseInt(c, 10)));
              }
            });
    }
    return { formatName: t, formatOptions: n };
  },
  uo = (e) => {
    const t = {};
    return (n, a, o) => {
      let r = o;
      o &&
        o.interpolationkey &&
        o.formatParams &&
        o.formatParams[o.interpolationkey] &&
        o[o.interpolationkey] &&
        (r = { ...r, [o.interpolationkey]: void 0 });
      const i = a + JSON.stringify(r);
      let l = t[i];
      return (l || ((l = e(ws(a), o)), (t[i] = l)), l(n));
    };
  };
class sO {
  constructor() {
    let t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    ((this.logger = cn.create("formatter")),
      (this.options = t),
      (this.formats = {
        number: uo((n, a) => {
          const o = new Intl.NumberFormat(n, { ...a });
          return (r) => o.format(r);
        }),
        currency: uo((n, a) => {
          const o = new Intl.NumberFormat(n, { ...a, style: "currency" });
          return (r) => o.format(r);
        }),
        datetime: uo((n, a) => {
          const o = new Intl.DateTimeFormat(n, { ...a });
          return (r) => o.format(r);
        }),
        relativetime: uo((n, a) => {
          const o = new Intl.RelativeTimeFormat(n, { ...a });
          return (r) => o.format(r, a.range || "day");
        }),
        list: uo((n, a) => {
          const o = new Intl.ListFormat(n, { ...a });
          return (r) => o.format(r);
        }),
      }),
      this.init(t));
  }
  init(t) {
    let n =
      arguments.length > 1 && arguments[1] !== void 0
        ? arguments[1]
        : { interpolation: {} };
    this.formatSeparator = n.interpolation.formatSeparator || ",";
  }
  add(t, n) {
    this.formats[t.toLowerCase().trim()] = n;
  }
  addCached(t, n) {
    this.formats[t.toLowerCase().trim()] = uo(n);
  }
  format(t, n, a) {
    let o = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {};
    const r = n.split(this.formatSeparator);
    if (
      r.length > 1 &&
      r[0].indexOf("(") > 1 &&
      r[0].indexOf(")") < 0 &&
      r.find((l) => l.indexOf(")") > -1)
    ) {
      const l = r.findIndex((s) => s.indexOf(")") > -1);
      r[0] = [r[0], ...r.splice(1, l)].join(this.formatSeparator);
    }
    return r.reduce((l, s) => {
      var u;
      const { formatName: c, formatOptions: f } = lO(s);
      if (this.formats[c]) {
        let d = l;
        try {
          const g =
              ((u = o == null ? void 0 : o.formatParams) == null
                ? void 0
                : u[o.interpolationkey]) || {},
            S = g.locale || g.lng || o.locale || o.lng || a;
          d = this.formats[c](l, S, { ...f, ...o, ...g });
        } catch (g) {
          this.logger.warn(g);
        }
        return d;
      } else this.logger.warn(`there was no format function for ${c}`);
      return l;
    }, t);
  }
}
const cO = (e, t) => {
  e.pending[t] !== void 0 && (delete e.pending[t], e.pendingCount--);
};
class uO extends sc {
  constructor(t, n, a) {
    var r, i;
    let o = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {};
    (super(),
      (this.backend = t),
      (this.store = n),
      (this.services = a),
      (this.languageUtils = a.languageUtils),
      (this.options = o),
      (this.logger = cn.create("backendConnector")),
      (this.waitingReads = []),
      (this.maxParallelReads = o.maxParallelReads || 10),
      (this.readingCalls = 0),
      (this.maxRetries = o.maxRetries >= 0 ? o.maxRetries : 5),
      (this.retryTimeout = o.retryTimeout >= 1 ? o.retryTimeout : 350),
      (this.state = {}),
      (this.queue = []),
      (i = (r = this.backend) == null ? void 0 : r.init) == null ||
        i.call(r, a, o.backend, o));
  }
  queueLoad(t, n, a, o) {
    const r = {},
      i = {},
      l = {},
      s = {};
    return (
      t.forEach((c) => {
        let f = !0;
        (n.forEach((u) => {
          const d = `${c}|${u}`;
          !a.reload && this.store.hasResourceBundle(c, u)
            ? (this.state[d] = 2)
            : this.state[d] < 0 ||
              (this.state[d] === 1
                ? i[d] === void 0 && (i[d] = !0)
                : ((this.state[d] = 1),
                  (f = !1),
                  i[d] === void 0 && (i[d] = !0),
                  r[d] === void 0 && (r[d] = !0),
                  s[u] === void 0 && (s[u] = !0)));
        }),
          f || (l[c] = !0));
      }),
      (Object.keys(r).length || Object.keys(i).length) &&
        this.queue.push({
          pending: i,
          pendingCount: Object.keys(i).length,
          loaded: {},
          errors: [],
          callback: o,
        }),
      {
        toLoad: Object.keys(r),
        pending: Object.keys(i),
        toLoadLanguages: Object.keys(l),
        toLoadNamespaces: Object.keys(s),
      }
    );
  }
  loaded(t, n, a) {
    const o = t.split("|"),
      r = o[0],
      i = o[1];
    (n && this.emit("failedLoading", r, i, n),
      !n &&
        a &&
        this.store.addResourceBundle(r, i, a, void 0, void 0, { skipCopy: !0 }),
      (this.state[t] = n ? -1 : 2),
      n && a && (this.state[t] = 0));
    const l = {};
    (this.queue.forEach((s) => {
      (Q2(s.loaded, [r], i),
        cO(s, t),
        n && s.errors.push(n),
        s.pendingCount === 0 &&
          !s.done &&
          (Object.keys(s.loaded).forEach((c) => {
            l[c] || (l[c] = {});
            const f = s.loaded[c];
            f.length &&
              f.forEach((u) => {
                l[c][u] === void 0 && (l[c][u] = !0);
              });
          }),
          (s.done = !0),
          s.errors.length ? s.callback(s.errors) : s.callback()));
    }),
      this.emit("loaded", l),
      (this.queue = this.queue.filter((s) => !s.done)));
  }
  read(t, n, a) {
    let o = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0,
      r =
        arguments.length > 4 && arguments[4] !== void 0
          ? arguments[4]
          : this.retryTimeout,
      i = arguments.length > 5 ? arguments[5] : void 0;
    if (!t.length) return i(null, {});
    if (this.readingCalls >= this.maxParallelReads) {
      this.waitingReads.push({
        lng: t,
        ns: n,
        fcName: a,
        tried: o,
        wait: r,
        callback: i,
      });
      return;
    }
    this.readingCalls++;
    const l = (c, f) => {
        if ((this.readingCalls--, this.waitingReads.length > 0)) {
          const u = this.waitingReads.shift();
          this.read(u.lng, u.ns, u.fcName, u.tried, u.wait, u.callback);
        }
        if (c && f && o < this.maxRetries) {
          setTimeout(() => {
            this.read.call(this, t, n, a, o + 1, r * 2, i);
          }, r);
          return;
        }
        i(c, f);
      },
      s = this.backend[a].bind(this.backend);
    if (s.length === 2) {
      try {
        const c = s(t, n);
        c && typeof c.then == "function"
          ? c.then((f) => l(null, f)).catch(l)
          : l(null, c);
      } catch (c) {
        l(c);
      }
      return;
    }
    return s(t, n, l);
  }
  prepareLoading(t, n) {
    let a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {},
      o = arguments.length > 3 ? arguments[3] : void 0;
    if (!this.backend)
      return (
        this.logger.warn(
          "No backend was added via i18next.use. Will not load resources.",
        ),
        o && o()
      );
    ($(t) && (t = this.languageUtils.toResolveHierarchy(t)), $(n) && (n = [n]));
    const r = this.queueLoad(t, n, a, o);
    if (!r.toLoad.length) return (r.pending.length || o(), null);
    r.toLoad.forEach((i) => {
      this.loadOne(i);
    });
  }
  load(t, n, a) {
    this.prepareLoading(t, n, {}, a);
  }
  reload(t, n, a) {
    this.prepareLoading(t, n, { reload: !0 }, a);
  }
  loadOne(t) {
    let n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    const a = t.split("|"),
      o = a[0],
      r = a[1];
    this.read(o, r, "read", void 0, void 0, (i, l) => {
      (i &&
        this.logger.warn(
          `${n}loading namespace ${r} for language ${o} failed`,
          i,
        ),
        !i &&
          l &&
          this.logger.log(`${n}loaded namespace ${r} for language ${o}`, l),
        this.loaded(t, i, l));
    });
  }
  saveMissing(t, n, a, o, r) {
    var s, c, f, u, d;
    let i = arguments.length > 5 && arguments[5] !== void 0 ? arguments[5] : {},
      l =
        arguments.length > 6 && arguments[6] !== void 0
          ? arguments[6]
          : () => {};
    if (
      (c = (s = this.services) == null ? void 0 : s.utils) != null &&
      c.hasLoadedNamespace &&
      !(
        (u = (f = this.services) == null ? void 0 : f.utils) != null &&
        u.hasLoadedNamespace(n)
      )
    ) {
      this.logger.warn(
        `did not save key "${a}" as the namespace "${n}" was not yet loaded`,
        "This means something IS WRONG in your setup. You access the t function before i18next.init / i18next.loadNamespace / i18next.changeLanguage was done. Wait for the callback or Promise to resolve before accessing it!!!",
      );
      return;
    }
    if (!(a == null || a === "")) {
      if ((d = this.backend) != null && d.create) {
        const g = { ...i, isUpdate: r },
          S = this.backend.create.bind(this.backend);
        if (S.length < 6)
          try {
            let v;
            (S.length === 5 ? (v = S(t, n, a, o, g)) : (v = S(t, n, a, o)),
              v && typeof v.then == "function"
                ? v.then((b) => l(null, b)).catch(l)
                : l(null, v));
          } catch (v) {
            l(v);
          }
        else S(t, n, a, o, l, g);
      }
      !t || !t[0] || this.store.addResource(t[0], n, a, o);
    }
  }
}
const jh = () => ({
    debug: !1,
    initAsync: !0,
    ns: ["translation"],
    defaultNS: ["translation"],
    fallbackLng: ["dev"],
    fallbackNS: !1,
    supportedLngs: !1,
    nonExplicitSupportedLngs: !1,
    load: "all",
    preload: !1,
    simplifyPluralSuffix: !0,
    keySeparator: ".",
    nsSeparator: ":",
    pluralSeparator: "_",
    contextSeparator: "_",
    partialBundledLanguages: !1,
    saveMissing: !1,
    updateMissing: !1,
    saveMissingTo: "fallback",
    saveMissingPlurals: !0,
    missingKeyHandler: !1,
    missingInterpolationHandler: !1,
    postProcess: !1,
    postProcessPassResolved: !1,
    returnNull: !1,
    returnEmptyString: !0,
    returnObjects: !1,
    joinArrays: !1,
    returnedObjectHandler: !1,
    parseMissingKeyHandler: !1,
    appendNamespaceToMissingKey: !1,
    appendNamespaceToCIMode: !1,
    overloadTranslationOptionHandler: (e) => {
      let t = {};
      if (
        (typeof e[1] == "object" && (t = e[1]),
        $(e[1]) && (t.defaultValue = e[1]),
        $(e[2]) && (t.tDescription = e[2]),
        typeof e[2] == "object" || typeof e[3] == "object")
      ) {
        const n = e[3] || e[2];
        Object.keys(n).forEach((a) => {
          t[a] = n[a];
        });
      }
      return t;
    },
    interpolation: {
      escapeValue: !0,
      format: (e) => e,
      prefix: "{{",
      suffix: "}}",
      formatSeparator: ",",
      unescapePrefix: "-",
      nestingPrefix: "$t(",
      nestingSuffix: ")",
      nestingOptionsSeparator: ",",
      maxReplaces: 1e3,
      skipOnVariables: !0,
    },
  }),
  Bh = (e) => {
    var t, n;
    return (
      $(e.ns) && (e.ns = [e.ns]),
      $(e.fallbackLng) && (e.fallbackLng = [e.fallbackLng]),
      $(e.fallbackNS) && (e.fallbackNS = [e.fallbackNS]),
      ((n = (t = e.supportedLngs) == null ? void 0 : t.indexOf) == null
        ? void 0
        : n.call(t, "cimode")) < 0 &&
        (e.supportedLngs = e.supportedLngs.concat(["cimode"])),
      typeof e.initImmediate == "boolean" && (e.initAsync = e.initImmediate),
      e
    );
  },
  fl = () => {},
  fO = (e) => {
    Object.getOwnPropertyNames(Object.getPrototypeOf(e)).forEach((n) => {
      typeof e[n] == "function" && (e[n] = e[n].bind(e));
    });
  };
class di extends sc {
  constructor() {
    let t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {},
      n = arguments.length > 1 ? arguments[1] : void 0;
    if (
      (super(),
      (this.options = Bh(t)),
      (this.services = {}),
      (this.logger = cn),
      (this.modules = { external: [] }),
      fO(this),
      n && !this.isInitialized && !t.isClone)
    ) {
      if (!this.options.initAsync) return (this.init(t, n), this);
      setTimeout(() => {
        this.init(t, n);
      }, 0);
    }
  }
  init() {
    var t = this;
    let n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {},
      a = arguments.length > 1 ? arguments[1] : void 0;
    ((this.isInitializing = !0),
      typeof n == "function" && ((a = n), (n = {})),
      n.defaultNS == null &&
        n.ns &&
        ($(n.ns)
          ? (n.defaultNS = n.ns)
          : n.ns.indexOf("translation") < 0 && (n.defaultNS = n.ns[0])));
    const o = jh();
    ((this.options = { ...o, ...this.options, ...Bh(n) }),
      (this.options.interpolation = {
        ...o.interpolation,
        ...this.options.interpolation,
      }),
      n.keySeparator !== void 0 &&
        (this.options.userDefinedKeySeparator = n.keySeparator),
      n.nsSeparator !== void 0 &&
        (this.options.userDefinedNsSeparator = n.nsSeparator));
    const r = (f) => (f ? (typeof f == "function" ? new f() : f) : null);
    if (!this.options.isClone) {
      this.modules.logger
        ? cn.init(r(this.modules.logger), this.options)
        : cn.init(null, this.options);
      let f;
      this.modules.formatter ? (f = this.modules.formatter) : (f = sO);
      const u = new Nh(this.options);
      this.store = new Dh(this.options.resources, this.options);
      const d = this.services;
      ((d.logger = cn),
        (d.resourceStore = this.store),
        (d.languageUtils = u),
        (d.pluralResolver = new rO(u, {
          prepend: this.options.pluralSeparator,
          simplifyPluralSuffix: this.options.simplifyPluralSuffix,
        })),
        f &&
          (!this.options.interpolation.format ||
            this.options.interpolation.format === o.interpolation.format) &&
          ((d.formatter = r(f)),
          d.formatter.init(d, this.options),
          (this.options.interpolation.format = d.formatter.format.bind(
            d.formatter,
          ))),
        (d.interpolator = new iO(this.options)),
        (d.utils = { hasLoadedNamespace: this.hasLoadedNamespace.bind(this) }),
        (d.backendConnector = new uO(
          r(this.modules.backend),
          d.resourceStore,
          d,
          this.options,
        )),
        d.backendConnector.on("*", function (g) {
          for (
            var S = arguments.length, v = new Array(S > 1 ? S - 1 : 0), b = 1;
            b < S;
            b++
          )
            v[b - 1] = arguments[b];
          t.emit(g, ...v);
        }),
        this.modules.languageDetector &&
          ((d.languageDetector = r(this.modules.languageDetector)),
          d.languageDetector.init &&
            d.languageDetector.init(d, this.options.detection, this.options)),
        this.modules.i18nFormat &&
          ((d.i18nFormat = r(this.modules.i18nFormat)),
          d.i18nFormat.init && d.i18nFormat.init(this)),
        (this.translator = new Es(this.services, this.options)),
        this.translator.on("*", function (g) {
          for (
            var S = arguments.length, v = new Array(S > 1 ? S - 1 : 0), b = 1;
            b < S;
            b++
          )
            v[b - 1] = arguments[b];
          t.emit(g, ...v);
        }),
        this.modules.external.forEach((g) => {
          g.init && g.init(this);
        }));
    }
    if (
      ((this.format = this.options.interpolation.format),
      a || (a = fl),
      this.options.fallbackLng &&
        !this.services.languageDetector &&
        !this.options.lng)
    ) {
      const f = this.services.languageUtils.getFallbackCodes(
        this.options.fallbackLng,
      );
      f.length > 0 && f[0] !== "dev" && (this.options.lng = f[0]);
    }
    (!this.services.languageDetector &&
      !this.options.lng &&
      this.logger.warn(
        "init: no languageDetector is used and no lng is defined",
      ),
      [
        "getResource",
        "hasResourceBundle",
        "getResourceBundle",
        "getDataByLanguage",
      ].forEach((f) => {
        this[f] = function () {
          return t.store[f](...arguments);
        };
      }),
      [
        "addResource",
        "addResources",
        "addResourceBundle",
        "removeResourceBundle",
      ].forEach((f) => {
        this[f] = function () {
          return (t.store[f](...arguments), t);
        };
      }));
    const s = Sr(),
      c = () => {
        const f = (u, d) => {
          ((this.isInitializing = !1),
            this.isInitialized &&
              !this.initializedStoreOnce &&
              this.logger.warn(
                "init: i18next is already initialized. You should call init just once!",
              ),
            (this.isInitialized = !0),
            this.options.isClone ||
              this.logger.log("initialized", this.options),
            this.emit("initialized", this.options),
            s.resolve(d),
            a(u, d));
        };
        if (this.languages && !this.isInitialized)
          return f(null, this.t.bind(this));
        this.changeLanguage(this.options.lng, f);
      };
    return (
      this.options.resources || !this.options.initAsync
        ? c()
        : setTimeout(c, 0),
      s
    );
  }
  loadResources(t) {
    var r, i;
    let a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : fl;
    const o = $(t) ? t : this.language;
    if (
      (typeof t == "function" && (a = t),
      !this.options.resources || this.options.partialBundledLanguages)
    ) {
      if (
        (o == null ? void 0 : o.toLowerCase()) === "cimode" &&
        (!this.options.preload || this.options.preload.length === 0)
      )
        return a();
      const l = [],
        s = (c) => {
          if (!c || c === "cimode") return;
          this.services.languageUtils.toResolveHierarchy(c).forEach((u) => {
            u !== "cimode" && l.indexOf(u) < 0 && l.push(u);
          });
        };
      (o
        ? s(o)
        : this.services.languageUtils
            .getFallbackCodes(this.options.fallbackLng)
            .forEach((f) => s(f)),
        (i = (r = this.options.preload) == null ? void 0 : r.forEach) == null ||
          i.call(r, (c) => s(c)),
        this.services.backendConnector.load(l, this.options.ns, (c) => {
          (!c &&
            !this.resolvedLanguage &&
            this.language &&
            this.setResolvedLanguage(this.language),
            a(c));
        }));
    } else a(null);
  }
  reloadResources(t, n, a) {
    const o = Sr();
    return (
      typeof t == "function" && ((a = t), (t = void 0)),
      typeof n == "function" && ((a = n), (n = void 0)),
      t || (t = this.languages),
      n || (n = this.options.ns),
      a || (a = fl),
      this.services.backendConnector.reload(t, n, (r) => {
        (o.resolve(), a(r));
      }),
      o
    );
  }
  use(t) {
    if (!t)
      throw new Error(
        "You are passing an undefined module! Please check the object you are passing to i18next.use()",
      );
    if (!t.type)
      throw new Error(
        "You are passing a wrong module! Please check the object you are passing to i18next.use()",
      );
    return (
      t.type === "backend" && (this.modules.backend = t),
      (t.type === "logger" || (t.log && t.warn && t.error)) &&
        (this.modules.logger = t),
      t.type === "languageDetector" && (this.modules.languageDetector = t),
      t.type === "i18nFormat" && (this.modules.i18nFormat = t),
      t.type === "postProcessor" && NS.addPostProcessor(t),
      t.type === "formatter" && (this.modules.formatter = t),
      t.type === "3rdParty" && this.modules.external.push(t),
      this
    );
  }
  setResolvedLanguage(t) {
    if (!(!t || !this.languages) && !(["cimode", "dev"].indexOf(t) > -1))
      for (let n = 0; n < this.languages.length; n++) {
        const a = this.languages[n];
        if (
          !(["cimode", "dev"].indexOf(a) > -1) &&
          this.store.hasLanguageSomeTranslations(a)
        ) {
          this.resolvedLanguage = a;
          break;
        }
      }
  }
  changeLanguage(t, n) {
    var a = this;
    this.isLanguageChangingTo = t;
    const o = Sr();
    this.emit("languageChanging", t);
    const r = (s) => {
        ((this.language = s),
          (this.languages = this.services.languageUtils.toResolveHierarchy(s)),
          (this.resolvedLanguage = void 0),
          this.setResolvedLanguage(s));
      },
      i = (s, c) => {
        (c
          ? (r(c),
            this.translator.changeLanguage(c),
            (this.isLanguageChangingTo = void 0),
            this.emit("languageChanged", c),
            this.logger.log("languageChanged", c))
          : (this.isLanguageChangingTo = void 0),
          o.resolve(function () {
            return a.t(...arguments);
          }),
          n &&
            n(s, function () {
              return a.t(...arguments);
            }));
      },
      l = (s) => {
        var f, u;
        !t && !s && this.services.languageDetector && (s = []);
        const c = $(s)
          ? s
          : this.services.languageUtils.getBestMatchFromCodes(s);
        (c &&
          (this.language || r(c),
          this.translator.language || this.translator.changeLanguage(c),
          (u =
            (f = this.services.languageDetector) == null
              ? void 0
              : f.cacheUserLanguage) == null || u.call(f, c)),
          this.loadResources(c, (d) => {
            i(d, c);
          }));
      };
    return (
      !t &&
      this.services.languageDetector &&
      !this.services.languageDetector.async
        ? l(this.services.languageDetector.detect())
        : !t &&
            this.services.languageDetector &&
            this.services.languageDetector.async
          ? this.services.languageDetector.detect.length === 0
            ? this.services.languageDetector.detect().then(l)
            : this.services.languageDetector.detect(l)
          : l(t),
      o
    );
  }
  getFixedT(t, n, a) {
    var o = this;
    const r = function (i, l) {
      let s;
      if (typeof l != "object") {
        for (
          var c = arguments.length, f = new Array(c > 2 ? c - 2 : 0), u = 2;
          u < c;
          u++
        )
          f[u - 2] = arguments[u];
        s = o.options.overloadTranslationOptionHandler([i, l].concat(f));
      } else s = { ...l };
      ((s.lng = s.lng || r.lng),
        (s.lngs = s.lngs || r.lngs),
        (s.ns = s.ns || r.ns),
        s.keyPrefix !== "" && (s.keyPrefix = s.keyPrefix || a || r.keyPrefix));
      const d = o.options.keySeparator || ".";
      let g;
      return (
        s.keyPrefix && Array.isArray(i)
          ? (g = i.map((S) => `${s.keyPrefix}${d}${S}`))
          : (g = s.keyPrefix ? `${s.keyPrefix}${d}${i}` : i),
        o.t(g, s)
      );
    };
    return (
      $(t) ? (r.lng = t) : (r.lngs = t),
      (r.ns = n),
      (r.keyPrefix = a),
      r
    );
  }
  t() {
    var o;
    for (var t = arguments.length, n = new Array(t), a = 0; a < t; a++)
      n[a] = arguments[a];
    return (o = this.translator) == null ? void 0 : o.translate(...n);
  }
  exists() {
    var o;
    for (var t = arguments.length, n = new Array(t), a = 0; a < t; a++)
      n[a] = arguments[a];
    return (o = this.translator) == null ? void 0 : o.exists(...n);
  }
  setDefaultNamespace(t) {
    this.options.defaultNS = t;
  }
  hasLoadedNamespace(t) {
    let n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (!this.isInitialized)
      return (
        this.logger.warn(
          "hasLoadedNamespace: i18next was not initialized",
          this.languages,
        ),
        !1
      );
    if (!this.languages || !this.languages.length)
      return (
        this.logger.warn(
          "hasLoadedNamespace: i18n.languages were undefined or empty",
          this.languages,
        ),
        !1
      );
    const a = n.lng || this.resolvedLanguage || this.languages[0],
      o = this.options ? this.options.fallbackLng : !1,
      r = this.languages[this.languages.length - 1];
    if (a.toLowerCase() === "cimode") return !0;
    const i = (l, s) => {
      const c = this.services.backendConnector.state[`${l}|${s}`];
      return c === -1 || c === 0 || c === 2;
    };
    if (n.precheck) {
      const l = n.precheck(this, i);
      if (l !== void 0) return l;
    }
    return !!(
      this.hasResourceBundle(a, t) ||
      !this.services.backendConnector.backend ||
      (this.options.resources && !this.options.partialBundledLanguages) ||
      (i(a, t) && (!o || i(r, t)))
    );
  }
  loadNamespaces(t, n) {
    const a = Sr();
    return this.options.ns
      ? ($(t) && (t = [t]),
        t.forEach((o) => {
          this.options.ns.indexOf(o) < 0 && this.options.ns.push(o);
        }),
        this.loadResources((o) => {
          (a.resolve(), n && n(o));
        }),
        a)
      : (n && n(), Promise.resolve());
  }
  loadLanguages(t, n) {
    const a = Sr();
    $(t) && (t = [t]);
    const o = this.options.preload || [],
      r = t.filter(
        (i) =>
          o.indexOf(i) < 0 && this.services.languageUtils.isSupportedCode(i),
      );
    return r.length
      ? ((this.options.preload = o.concat(r)),
        this.loadResources((i) => {
          (a.resolve(), n && n(i));
        }),
        a)
      : (n && n(), Promise.resolve());
  }
  dir(t) {
    var o, r;
    if (
      (t ||
        (t =
          this.resolvedLanguage ||
          (((o = this.languages) == null ? void 0 : o.length) > 0
            ? this.languages[0]
            : this.language)),
      !t)
    )
      return "rtl";
    const n = [
        "ar",
        "shu",
        "sqr",
        "ssh",
        "xaa",
        "yhd",
        "yud",
        "aao",
        "abh",
        "abv",
        "acm",
        "acq",
        "acw",
        "acx",
        "acy",
        "adf",
        "ads",
        "aeb",
        "aec",
        "afb",
        "ajp",
        "apc",
        "apd",
        "arb",
        "arq",
        "ars",
        "ary",
        "arz",
        "auz",
        "avl",
        "ayh",
        "ayl",
        "ayn",
        "ayp",
        "bbz",
        "pga",
        "he",
        "iw",
        "ps",
        "pbt",
        "pbu",
        "pst",
        "prp",
        "prd",
        "ug",
        "ur",
        "ydd",
        "yds",
        "yih",
        "ji",
        "yi",
        "hbo",
        "men",
        "xmn",
        "fa",
        "jpr",
        "peo",
        "pes",
        "prs",
        "dv",
        "sam",
        "ckb",
      ],
      a =
        ((r = this.services) == null ? void 0 : r.languageUtils) ||
        new Nh(jh());
    return n.indexOf(a.getLanguagePartFromCode(t)) > -1 ||
      t.toLowerCase().indexOf("-arab") > 1
      ? "rtl"
      : "ltr";
  }
  static createInstance() {
    let t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {},
      n = arguments.length > 1 ? arguments[1] : void 0;
    return new di(t, n);
  }
  cloneInstance() {
    let t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {},
      n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : fl;
    const a = t.forkResourceStore;
    a && delete t.forkResourceStore;
    const o = { ...this.options, ...t, isClone: !0 },
      r = new di(o);
    if (
      ((t.debug !== void 0 || t.prefix !== void 0) &&
        (r.logger = r.logger.clone(t)),
      ["store", "services", "language"].forEach((l) => {
        r[l] = this[l];
      }),
      (r.services = { ...this.services }),
      (r.services.utils = { hasLoadedNamespace: r.hasLoadedNamespace.bind(r) }),
      a)
    ) {
      const l = Object.keys(this.store.data).reduce(
        (s, c) => (
          (s[c] = { ...this.store.data[c] }),
          Object.keys(s[c]).reduce((f, u) => ((f[u] = { ...s[c][u] }), f), {})
        ),
        {},
      );
      ((r.store = new Dh(l, o)), (r.services.resourceStore = r.store));
    }
    return (
      (r.translator = new Es(r.services, o)),
      r.translator.on("*", function (l) {
        for (
          var s = arguments.length, c = new Array(s > 1 ? s - 1 : 0), f = 1;
          f < s;
          f++
        )
          c[f - 1] = arguments[f];
        r.emit(l, ...c);
      }),
      r.init(o, n),
      (r.translator.options = o),
      (r.translator.backendConnector.services.utils = {
        hasLoadedNamespace: r.hasLoadedNamespace.bind(r),
      }),
      r
    );
  }
  toJSON() {
    return {
      options: this.options,
      store: this.store,
      language: this.language,
      languages: this.languages,
      resolvedLanguage: this.resolvedLanguage,
    };
  }
}
const Ke = di.createInstance();
Ke.createInstance = di.createInstance;
Ke.createInstance;
Ke.dir;
Ke.init;
Ke.loadResources;
Ke.reloadResources;
Ke.use;
Ke.changeLanguage;
Ke.getFixedT;
Ke.t;
Ke.exists;
Ke.setDefaultNamespace;
Ke.hasLoadedNamespace;
Ke.loadNamespaces;
Ke.loadLanguages;
function dO(e, t) {
  if (!(e instanceof t))
    throw new TypeError("Cannot call a class as a function");
}
function mi(e) {
  "@babel/helpers - typeof";
  return (
    (mi =
      typeof Symbol == "function" && typeof Symbol.iterator == "symbol"
        ? function (t) {
            return typeof t;
          }
        : function (t) {
            return t &&
              typeof Symbol == "function" &&
              t.constructor === Symbol &&
              t !== Symbol.prototype
              ? "symbol"
              : typeof t;
          }),
    mi(e)
  );
}
function mO(e, t) {
  if (mi(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var a = n.call(e, t);
    if (mi(a) != "object") return a;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(e);
}
function gO(e) {
  var t = mO(e, "string");
  return mi(t) == "symbol" ? t : t + "";
}
function hO(e, t) {
  for (var n = 0; n < t.length; n++) {
    var a = t[n];
    ((a.enumerable = a.enumerable || !1),
      (a.configurable = !0),
      "value" in a && (a.writable = !0),
      Object.defineProperty(e, gO(a.key), a));
  }
}
function pO(e, t, n) {
  return (
    t && hO(e.prototype, t),
    Object.defineProperty(e, "prototype", { writable: !1 }),
    e
  );
}
var _S = [],
  vO = _S.forEach,
  yO = _S.slice;
function bO(e) {
  return (
    vO.call(yO.call(arguments, 1), function (t) {
      if (t) for (var n in t) e[n] === void 0 && (e[n] = t[n]);
    }),
    e
  );
}
var Uh = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/,
  SO = function (t, n, a) {
    var o = a || {};
    o.path = o.path || "/";
    var r = encodeURIComponent(n),
      i = "".concat(t, "=").concat(r);
    if (o.maxAge > 0) {
      var l = o.maxAge - 0;
      if (Number.isNaN(l)) throw new Error("maxAge should be a Number");
      i += "; Max-Age=".concat(Math.floor(l));
    }
    if (o.domain) {
      if (!Uh.test(o.domain)) throw new TypeError("option domain is invalid");
      i += "; Domain=".concat(o.domain);
    }
    if (o.path) {
      if (!Uh.test(o.path)) throw new TypeError("option path is invalid");
      i += "; Path=".concat(o.path);
    }
    if (o.expires) {
      if (typeof o.expires.toUTCString != "function")
        throw new TypeError("option expires is invalid");
      i += "; Expires=".concat(o.expires.toUTCString());
    }
    if (
      (o.httpOnly && (i += "; HttpOnly"),
      o.secure && (i += "; Secure"),
      o.sameSite)
    ) {
      var s =
        typeof o.sameSite == "string" ? o.sameSite.toLowerCase() : o.sameSite;
      switch (s) {
        case !0:
          i += "; SameSite=Strict";
          break;
        case "lax":
          i += "; SameSite=Lax";
          break;
        case "strict":
          i += "; SameSite=Strict";
          break;
        case "none":
          i += "; SameSite=None";
          break;
        default:
          throw new TypeError("option sameSite is invalid");
      }
    }
    return i;
  },
  Hh = {
    create: function (t, n, a, o) {
      var r =
        arguments.length > 4 && arguments[4] !== void 0
          ? arguments[4]
          : { path: "/", sameSite: "strict" };
      (a &&
        ((r.expires = new Date()),
        r.expires.setTime(r.expires.getTime() + a * 60 * 1e3)),
        o && (r.domain = o),
        (document.cookie = SO(t, encodeURIComponent(n), r)));
    },
    read: function (t) {
      for (
        var n = "".concat(t, "="), a = document.cookie.split(";"), o = 0;
        o < a.length;
        o++
      ) {
        for (var r = a[o]; r.charAt(0) === " "; ) r = r.substring(1, r.length);
        if (r.indexOf(n) === 0) return r.substring(n.length, r.length);
      }
      return null;
    },
    remove: function (t) {
      this.create(t, "", -1);
    },
  },
  wO = {
    name: "cookie",
    lookup: function (t) {
      var n;
      if (t.lookupCookie && typeof document < "u") {
        var a = Hh.read(t.lookupCookie);
        a && (n = a);
      }
      return n;
    },
    cacheUserLanguage: function (t, n) {
      n.lookupCookie &&
        typeof document < "u" &&
        Hh.create(
          n.lookupCookie,
          t,
          n.cookieMinutes,
          n.cookieDomain,
          n.cookieOptions,
        );
    },
  },
  xO = {
    name: "querystring",
    lookup: function (t) {
      var n;
      if (typeof window < "u") {
        var a = window.location.search;
        !window.location.search &&
          window.location.hash &&
          window.location.hash.indexOf("?") > -1 &&
          (a = window.location.hash.substring(
            window.location.hash.indexOf("?"),
          ));
        for (
          var o = a.substring(1), r = o.split("&"), i = 0;
          i < r.length;
          i++
        ) {
          var l = r[i].indexOf("=");
          if (l > 0) {
            var s = r[i].substring(0, l);
            s === t.lookupQuerystring && (n = r[i].substring(l + 1));
          }
        }
      }
      return n;
    },
  },
  wr = null,
  Ph = function () {
    if (wr !== null) return wr;
    try {
      wr = window !== "undefined" && window.localStorage !== null;
      var t = "i18next.translate.boo";
      (window.localStorage.setItem(t, "foo"),
        window.localStorage.removeItem(t));
    } catch {
      wr = !1;
    }
    return wr;
  },
  EO = {
    name: "localStorage",
    lookup: function (t) {
      var n;
      if (t.lookupLocalStorage && Ph()) {
        var a = window.localStorage.getItem(t.lookupLocalStorage);
        a && (n = a);
      }
      return n;
    },
    cacheUserLanguage: function (t, n) {
      n.lookupLocalStorage &&
        Ph() &&
        window.localStorage.setItem(n.lookupLocalStorage, t);
    },
  },
  xr = null,
  Vh = function () {
    if (xr !== null) return xr;
    try {
      xr = window !== "undefined" && window.sessionStorage !== null;
      var t = "i18next.translate.boo";
      (window.sessionStorage.setItem(t, "foo"),
        window.sessionStorage.removeItem(t));
    } catch {
      xr = !1;
    }
    return xr;
  },
  CO = {
    name: "sessionStorage",
    lookup: function (t) {
      var n;
      if (t.lookupSessionStorage && Vh()) {
        var a = window.sessionStorage.getItem(t.lookupSessionStorage);
        a && (n = a);
      }
      return n;
    },
    cacheUserLanguage: function (t, n) {
      n.lookupSessionStorage &&
        Vh() &&
        window.sessionStorage.setItem(n.lookupSessionStorage, t);
    },
  },
  AO = {
    name: "navigator",
    lookup: function (t) {
      var n = [];
      if (typeof navigator < "u") {
        if (navigator.languages)
          for (var a = 0; a < navigator.languages.length; a++)
            n.push(navigator.languages[a]);
        (navigator.userLanguage && n.push(navigator.userLanguage),
          navigator.language && n.push(navigator.language));
      }
      return n.length > 0 ? n : void 0;
    },
  },
  TO = {
    name: "htmlTag",
    lookup: function (t) {
      var n,
        a =
          t.htmlTag ||
          (typeof document < "u" ? document.documentElement : null);
      return (
        a &&
          typeof a.getAttribute == "function" &&
          (n = a.getAttribute("lang")),
        n
      );
    },
  },
  RO = {
    name: "path",
    lookup: function (t) {
      var n;
      if (typeof window < "u") {
        var a = window.location.pathname.match(/\/([a-zA-Z-]*)/g);
        if (a instanceof Array)
          if (typeof t.lookupFromPathIndex == "number") {
            if (typeof a[t.lookupFromPathIndex] != "string") return;
            n = a[t.lookupFromPathIndex].replace("/", "");
          } else n = a[0].replace("/", "");
      }
      return n;
    },
  },
  MO = {
    name: "subdomain",
    lookup: function (t) {
      var n =
          typeof t.lookupFromSubdomainIndex == "number"
            ? t.lookupFromSubdomainIndex + 1
            : 1,
        a =
          typeof window < "u" &&
          window.location &&
          window.location.hostname &&
          window.location.hostname.match(
            /^(\w{2,5})\.(([a-z0-9-]{1,63}\.[a-z]{2,6})|localhost)/i,
          );
      if (a) return a[n];
    },
  },
  LS = !1;
try {
  (document.cookie, (LS = !0));
} catch {}
var zS = [
  "querystring",
  "cookie",
  "localStorage",
  "sessionStorage",
  "navigator",
  "htmlTag",
];
LS || zS.splice(1, 1);
function DO() {
  return {
    order: zS,
    lookupQuerystring: "lng",
    lookupCookie: "i18next",
    lookupLocalStorage: "i18nextLng",
    lookupSessionStorage: "i18nextLng",
    caches: ["localStorage"],
    excludeCacheFor: ["cimode"],
    convertDetectedLanguage: function (t) {
      return t;
    },
  };
}
var jS = (function () {
  function e(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    (dO(this, e),
      (this.type = "languageDetector"),
      (this.detectors = {}),
      this.init(t, n));
  }
  return pO(e, [
    {
      key: "init",
      value: function (n) {
        var a =
            arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {},
          o =
            arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
        ((this.services = n || { languageUtils: {} }),
          (this.options = bO(a, this.options || {}, DO())),
          typeof this.options.convertDetectedLanguage == "string" &&
            this.options.convertDetectedLanguage.indexOf("15897") > -1 &&
            (this.options.convertDetectedLanguage = function (r) {
              return r.replace("-", "_");
            }),
          this.options.lookupFromUrlIndex &&
            (this.options.lookupFromPathIndex =
              this.options.lookupFromUrlIndex),
          (this.i18nOptions = o),
          this.addDetector(wO),
          this.addDetector(xO),
          this.addDetector(EO),
          this.addDetector(CO),
          this.addDetector(AO),
          this.addDetector(TO),
          this.addDetector(RO),
          this.addDetector(MO));
      },
    },
    {
      key: "addDetector",
      value: function (n) {
        return ((this.detectors[n.name] = n), this);
      },
    },
    {
      key: "detect",
      value: function (n) {
        var a = this;
        n || (n = this.options.order);
        var o = [];
        return (
          n.forEach(function (r) {
            if (a.detectors[r]) {
              var i = a.detectors[r].lookup(a.options);
              (i && typeof i == "string" && (i = [i]), i && (o = o.concat(i)));
            }
          }),
          (o = o.map(function (r) {
            return a.options.convertDetectedLanguage(r);
          })),
          this.services.languageUtils.getBestMatchFromCodes
            ? o
            : o.length > 0
              ? o[0]
              : null
        );
      },
    },
    {
      key: "cacheUserLanguage",
      value: function (n, a) {
        var o = this;
        (a || (a = this.options.caches),
          a &&
            ((this.options.excludeCacheFor &&
              this.options.excludeCacheFor.indexOf(n) > -1) ||
              a.forEach(function (r) {
                o.detectors[r] &&
                  o.detectors[r].cacheUserLanguage(n, o.options);
              })));
      },
    },
  ]);
})();
jS.type = "languageDetector";
const OO = {
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    close: "Close",
    confirm: "Confirm",
    error: "Error",
    success: "Success",
    warning: "Warning",
    search: "Search",
    empty: "No data",
    noResults: "No results found",
    back: "Back",
    next: "Next",
    openSettings: "Open Full Settings",
    settings: "Settings",
    bookmarkList: "Bookmark List",
    today: "Today",
    yesterday: "Yesterday",
    daysAgo: "{{days}} days ago",
    storage: "Storage",
    more: "More",
    loadMore: "Load More",
    manageBookmarks: "Manage Bookmarks",
    viewShortcuts: "View Shortcuts",
    languages: { en: "English", zh: "中文", ja: "日本語", ko: "한국어" },
    theme: {
      toggle: "Toggle theme",
      light: "Light mode",
      dark: "Dark mode",
      system: "Follow system",
    },
    contextMenu: { saveToHamHome: "Save to HamHome" },
  },
  kO = { common: OO },
  NO = {
    title: "Bookmarks",
    pageTitle: "Bookmark List",
    pageDescription: "Manage and browse all your bookmarks",
    newBookmark: "New Bookmark",
    addBookmark: "Add Bookmark",
    editBookmark: "Edit Bookmark",
    deleteBookmark: "Delete Bookmark",
    deleteTitle: "Confirm Delete",
    deleteConfirm:
      'Are you sure you want to delete "{{title}}"? This action cannot be undone.',
    deleteSuccess: "Bookmark deleted successfully",
    saveSuccess: "Bookmark saved successfully",
    saveFailed: "Failed to save bookmark",
    placeholders: {
      title: "Page title",
      description: "Briefly describe this page...",
      url: "Enter URL",
    },
    categories: "Categories",
    uncategorized: "Uncategorized",
    tags: "Tags",
    createdAt: "Created",
    recent: "Recent Bookmarks",
    all: "All Bookmarks",
    privacy: "Privacy",
    search: "Search bookmarks, tags, or URLs...",
    count: "You have {{count}} bookmark",
    count_plural: "You have {{count}} bookmarks",
    stats: { total: "Total", category: "categories", tags: "tags" },
    filter: {
      tags: "Filter by Tags",
      category: "Filter by Category",
      allCategories: "All Categories",
      allTags: "All Tags",
      selectedTags: "{{count}} tags selected",
      clearFilter: "Clear Filters",
    },
    view: { grid: "Grid View", list: "List View" },
    batch: {
      selected: "{{count}} selected",
      selectAll: "Select All",
      deselectAll: "Deselect All",
      addTags: "Add Tags",
      addTagsConfirm: "Add Tags",
      addTagsDescription: "Add tags to {{count}} selected bookmarks",
      moveCategory: "Move to Category",
      moveCategoryConfirm: "Move",
      moveCategoryDescription: "Move {{count}} selected bookmarks to category",
      delete: "Delete Selected",
      deleteTitle: "Confirm Batch Delete",
      deleteConfirm:
        "Are you sure you want to delete {{count}} bookmarks? This action cannot be undone.",
    },
    empty: "No bookmarks yet",
    emptyFilter: "No bookmarks match your filters",
    noTags: "No tags",
    open: "Open",
    edit: "Edit",
    delete: "Delete",
    copyLink: "Copy Link",
    share: "Share",
    aiTag: "AI",
    viewSnapshot: "View Snapshot",
    snapshot: {
      title: "Web Snapshot",
      loading: "Loading snapshot...",
      notFound: "Snapshot not found",
      openInNewTab: "Open in new tab",
      download: "Download snapshot",
      delete: "Delete snapshot",
      deleteConfirm:
        "Are you sure you want to delete this snapshot? This action cannot be undone.",
      saveSuccess: "Snapshot saved successfully",
      saveFailed: "Failed to save snapshot",
      noSnapshot: "No snapshot available",
    },
  },
  _O = {
    title: "Add New Bookmark",
    subtitle: "Save your favorite pages, access them anytime",
    url: "URL",
    titleLabel: "Title",
    description: "Summary",
    selectCategory: "Select category",
    tagPlaceholder: "Enter tag and press Enter to add",
    useAI: "Use AI Smart Analysis",
    aiAnalyzing: "AI analyzing...",
    saving: "Saving...",
    saveBookmark: "Save Bookmark",
    errors: {
      urlTitleRequired: "Please enter URL and title first",
      configureAI: "Please configure AI service in settings first",
      aiFailed: "AI analysis failed",
    },
  },
  LO = {
    title: "Tag Management",
    description: "View and manage your bookmark tags",
    empty: "No tags yet, add tags when saving bookmarks",
    stats: {
      title: "Tag Statistics",
      totalTags: "{{count}} tags in total",
      totalCount: "Total Tags",
      avgPerBookmark: "Avg Tags/Bookmark",
      mostUsed: "Most Used Tag",
      maxUsage: "Highest Usage",
    },
    cloud: {
      title: "Tag Cloud",
      description: "Darker color indicates more frequent usage",
      showing: "Showing {{count}} / {{total}} tags",
    },
  },
  zO = {
    save: "Save",
    bookmarkList: "Bookmarks",
    shortcut: "Shortcut",
    loadingPage: "Loading page content",
    pleaseWait: "Please wait...",
    cannotGetPage: "Cannot get page content",
    viewBookmarkList: "View Bookmark List",
  },
  jO = {
    alreadyBookmarked:
      "This page is already bookmarked, you can update the information",
    smartSuggestions: "Smart Suggestions",
    recommendedCategory: "Recommended Category",
    recommendedTags: "Recommended Tags",
    urlLabel: "URL",
    urlPlaceholder: "Enter URL",
    titleLabel: "Title",
    titlePlaceholder: "Enter title",
    descriptionLabel: "Summary",
    descriptionPlaceholder: "Enter summary or wait for AI to generate",
    categoryLabel: "Category",
    selectCategory: "Select category",
    searchCategory: "Search categories...",
    noCategoryFound: "No category found",
    getSuggestions: "Get Suggestions",
    loading: "Loading...",
    tagsLabel: "Tags",
    tagPlaceholder: "Enter tag and press Enter",
    aiRecommendedCategory: "AI Recommended Category:",
    apply: "Apply",
    cancel: "Cancel",
    updateBookmark: "Update Bookmark",
    saveBookmark: "Save Bookmark",
    saving: "Saving...",
  },
  BO = {
    openPanel: "Open Bookmark Panel",
    searchPlaceholder: "Search bookmarks...",
    clearSearch: "Clear Search",
    tagFilter: "Tag Filter",
    filter: "Filter",
    openSettings: "Open Settings",
    switchToLightMode: "Switch to Light Mode",
    switchToDarkMode: "Switch to Dark Mode",
    switchToEnglish: "Switch to English",
    switchToChinese: "Switch to Chinese",
    emptyBookmarks: "No bookmarks yet",
    noMatchingBookmarks: "No matching bookmarks found",
    tryAdjustFilters: "Try adjusting your filters",
    searchTags: "Search tags...",
    selectedTags: "Selected Tags",
    noMatchingTags: "No matching tags found",
    noTags: "No tags yet",
    clearAllTags: "Clear All Tags",
    quickTimeFilter: "Quick Time Filter",
    today: "Today",
    lastWeek: "Last Week",
    lastMonth: "Last Month",
    lastYear: "Last Year",
    customFilters: "Custom Filters",
    clearFilter: "Clear Filter",
    addCustomFilter: "Add Custom Filter",
    addCustomFilterTitle: "Add Custom Filter",
    editCustomFilterTitle: "Edit Custom Filter",
    filterName: "Filter Name",
    filterNamePlaceholder: "Give this filter a name",
    filterConditions: "Filter Conditions (all conditions must be met)",
    addCondition: "Add Condition",
    conditionValuePlaceholder: "Enter condition value",
    loadCustomFiltersFailed: "Failed to load custom filters",
    saveCustomFilterFailed: "Failed to save custom filter",
    fields: {
      title: "Title",
      url: "URL",
      description: "Description",
      tags: "Tags",
      createdAt: "Created At",
    },
    operators: {
      equals: "Equals",
      contains: "Contains",
      notEquals: "Not Equals",
      notContains: "Not Contains",
      startsWith: "Starts With",
      endsWith: "Ends With",
      greaterThan: "Greater Than",
      lessThan: "Less Than",
    },
  },
  UO = {
    bookmark: NO,
    modal: _O,
    tags: LO,
    popup: zO,
    savePanel: jO,
    contentPanel: BO,
  },
  HO = {
    title: "Settings",
    description: "Manage your bookmark tool preferences",
    tabs: { ai: "AI Config", general: "General", storage: "Storage" },
    language: "Language",
    theme: "Theme",
    themeOptions: { light: "Light", dark: "Dark", system: "System" },
    aiSettings: "AI Settings",
    aiProvider: "AI Provider",
    apiKey: "API Key",
    modelName: "Model Name",
    temperature: "Temperature (Creativity)",
    maxTokens: "Max Tokens",
    importBookmarks: "Import Bookmarks",
    exportBookmarks: "Export Bookmarks",
    about: {
      title: "About",
      description: "About HamHome",
      version: "HamHome v1.0.0",
      subtitle: "Intelligent Bookmark Management Tool",
      intro:
        "HamHome is a powerful browser extension that helps you manage and organize bookmarks, using AI technology to automatically categorize and tag bookmarks.",
      copyright: "© 2024-2025 HamHome. All rights reserved.",
    },
    sections: {
      general: "General",
      ai: "AI",
      privacy: "Privacy",
      about: "About",
    },
    descriptions: {
      language: "Choose the application language",
      theme: "Select theme mode",
      autoSaveSnapshot: "Automatically save web snapshots",
    },
    buttons: {
      import: "Choose File to Import",
      export: "Export All Bookmarks",
      reset: "Reset to Default",
      clear: "Clear All Data",
    },
    general: {
      title: "General Settings",
      description: "Customize your experience",
      autoSaveSnapshot: "Auto Save Snapshots",
      autoSaveSnapshotDesc:
        "Automatically save page snapshots when saving bookmarks",
      shortcut: "Shortcut Key",
      shortcutButton: "Open Browser Shortcut Settings",
      shortcutDesc: "Configure extension shortcuts in browser settings",
      shortcutDescFirefox: "Click gear icon → Manage Extension Shortcuts",
      currentShortcuts: "Current Shortcuts",
      shortcutNotSet: "Not Set",
      panelPosition: "Sidebar Position",
      panelPositionDesc:
        "Set whether the sidebar appears on the left or right side in content pages",
      panelPositionOptions: { left: "Left", right: "Right" },
      customFilters: {
        title: "Custom Filters",
        description:
          "Create and manage custom filters to quickly filter bookmarks",
        noFilters: "No custom filters yet",
        noFiltersDesc: 'Click "Add Filter" to create your first custom filter',
        addFilter: "Add Filter",
        edit: "Edit",
        delete: "Delete",
        deleteConfirm: "Confirm Delete Filter",
        deleteWarning:
          'Are you sure you want to delete the filter "{{name}}"? This action cannot be undone.',
        conditionsCount: "{{count}} conditions",
      },
    },
    ai: {
      title: "AI Service Configuration",
      description:
        "Configure AI analysis service to automatically extract bookmark summaries and tags",
      enableAI: "Enable AI Analysis",
      enableAIDesc:
        "Automatically use AI to generate summaries and tags when saving bookmarks",
      provider: "AI Provider",
      apiKeyPlaceholder: "sk-...",
      apiKeyDesc:
        "Your API Key will be securely stored locally and never uploaded to the server",
      baseUrl: "Base URL",
      baseUrlPlaceholder: "https://api.example.com/v1",
      model: "Model Name",
      modelPlaceholder: "gpt-3.5-turbo",
      advancedOptions: "Advanced Options",
      smartCategory: "Smart Category Recommendation",
      smartCategoryDesc: "Automatically recommend bookmark categories",
      tagSuggestion: "Tag Suggestion",
      tagSuggestionDesc: "Automatically recommend relevant tags",
      translation: "Translation Feature",
      translationDesc: "Translate foreign language content to English",
      presetTags: "Preset Tags",
      presetTagsDesc:
        "Configure preset tags, AI will prioritize matching relevant tags for bookmarks",
      addTag: "Add Tag",
      addTagPlaceholder: "Enter tag name, press Enter to add",
      configuredTags: "Configured Tags",
      noTags:
        "No preset tags added yet. After adding preset tags, AI will recommend tags more accurately.",
      testConnection: "Test Connection",
      testing: "Testing...",
      removeTag: "Delete Tag",
      useCustomModel: "Use custom model: {{model}}",
      embedding: {
        title: "Semantic Search Configuration",
        description: "Configure Embedding service to enable semantic search",
        enabled: "Enable Semantic Search",
        enabledDesc:
          "Search bookmarks using vector similarity for fuzzy matching and semantic understanding",
        provider: "Embedding Provider",
        providerNotSupported: "Current provider does not support Embedding",
        apiKey: "API Key",
        apiKeyPlaceholder: "sk-...",
        apiKeyDesc:
          "API Key for Embedding service (stored locally, never uploaded)",
        baseUrl: "Base URL",
        baseUrlPlaceholder: "https://api.example.com/v1",
        model: "Embedding Model",
        modelPlaceholder: "text-embedding-3-small",
        batchSize: "Batch Size",
        batchSizeDesc: "Number of bookmarks per batch (recommended 8-32)",
        testConnection: "Test Connection",
        testing: "Testing...",
        testSuccess: "Connection successful, dimensions: {{dimensions}}",
        testFailed: "Connection failed: {{error}}",
        stats: {
          title: "Vector Index Status",
          vectorCount: "Indexed Bookmarks",
          coverage: "Coverage",
          storageSize: "Storage Used",
          calculating: "Calculating...",
        },
        actions: {
          rebuild: "Rebuild Vector Index",
          rebuildIncremental: "Incremental Rebuild",
          rebuildFull: "Full Rebuild",
          rebuilding: "Rebuilding...",
          rebuildProgress: "{{completed}}/{{total}}",
          clear: "Clear Vector Data",
          clearing: "Clearing...",
        },
        dialogs: {
          rebuildTitle: "Confirm Rebuild Vector Index",
          rebuildWarning:
            "Rebuilding the vector index will generate embeddings for bookmarks. This may take a while, continue?",
          rebuildMode: "Rebuild Mode",
          rebuildModeIncremental: "Incremental Rebuild (Recommended)",
          rebuildModeIncrementalDesc:
            "Only generate vectors for uncovered bookmarks, keeping existing data",
          rebuildModeFull: "Full Rebuild",
          rebuildModeFullDesc:
            "Clear all vectors and regenerate, useful for switching models or fixing data",
          fullRebuildTitle: "Confirm Full Rebuild",
          fullRebuildWarning:
            "This will delete all existing vectors and regenerate embeddings for all bookmarks. This is used for switching models or fixing data. This may take a while, continue?",
          clearTitle: "Confirm Clear Vector Data",
          clearWarning:
            "This will delete all bookmark vectors, semantic search will be temporarily unavailable. Confirm clear?",
        },
      },
    },
    storage: {
      title: "Storage Management",
      description: "Manage your bookmark data and snapshots",
      bookmarkCount: "Bookmark Count",
      categoryCount: "Category Count",
      snapshotCount: "Snapshot Count",
      vectorCount: "Vector Count",
      storageUsed: "Metadata Size",
      snapshotSize: "Snapshot Size",
      vectorSize: "Vector Size",
      dataExport: "Data Export",
      exportJSON: "Export as JSON",
      exportHTML: "Export as HTML",
      dangerZone: "Danger Zone",
      clearAllData: "Clear All Data",
    },
    dialogs: {
      confirmClear: "Confirm Clear All Data",
      clearWarning:
        "This action will delete all bookmarks, categories, and settings data. This action cannot be undone, please proceed with caution.",
      cancel: "Cancel",
      confirm: "Confirm Clear",
    },
    providers: {
      openai: "OpenAI",
      anthropic: "Anthropic",
      google: "Google Gemini",
      azure: "Azure OpenAI",
      deepseek: "DeepSeek",
      groq: "Groq",
      mistral: "Mistral AI",
      moonshot: "Moonshot / Kimi",
      zhipu: "Zhipu AI / GLM",
      hunyuan: "Tencent Hunyuan",
      nvidia: "NVIDIA NIM",
      siliconflow: "SiliconFlow",
      ollama: "Ollama (Local)",
      custom: "Custom",
    },
    messages: {
      temperatureDesc:
        "Control the randomness of generated content (0-2, recommended 0.3)",
      maxTokensDesc: "Maximum length of generated content (recommended 1000)",
      apiKeySecure:
        "Your API Key will be securely stored locally and never uploaded to the server",
    },
    importExport: {
      title: "Import/Export",
      description: "Backup or migrate your bookmark data",
      importSuccess: "Import completed",
      importFailed: "Import failed",
      importDetails:
        "Successfully imported {{imported}} bookmarks, skipped {{skipped}} duplicates",
      importDetailsWithCategories:
        "Successfully imported {{imported}} bookmarks, created {{categoriesCreated}} categories, skipped {{skipped}} duplicates",
      importDetailsWithAI:
        "Successfully imported {{imported}} bookmarks, AI processed {{aiProcessed}}, skipped {{skipped}} duplicates",
      importDetailsWithAIAndCategories:
        "Successfully imported {{imported}} bookmarks, AI processed {{aiProcessed}}, created {{categoriesCreated}} categories, skipped {{skipped}} duplicates",
      importErrorSkipped: "{{count}} skipped due to errors",
      export: {
        title: "Export Bookmarks",
        description: "Export your bookmark data as a backup file",
        jsonFormat: "JSON Format",
        jsonSubtitle: "Full data backup",
        jsonDesc:
          "Contains all bookmarks and category information, can be used for complete data recovery",
        htmlFormat: "HTML Format",
        htmlSubtitle: "Browsable webpage",
        htmlDesc:
          "Generate a beautiful HTML page that can be viewed directly in the browser",
        currentStats:
          "Currently have {{bookmarkCount}} bookmarks, {{categoryCount}} categories",
      },
      import: {
        title: "Import Bookmarks",
        description: "Import bookmark data from a file",
        selectFile: "Click to select file",
        supportedFormats: "Supports JSON and HTML formats",
        importing: "Importing...",
        progress: "{{current}} / {{total}}",
        formatLabel: "Supported formats:",
        formatJSON: "HamHome JSON export file",
        formatHTML:
          "Browser bookmark HTML file (exported from Chrome/Firefox/Edge)",
        preserveFolders: "Preserve folder structure",
        preserveFoldersDesc:
          "When importing HTML bookmarks, automatically convert folders to categories to maintain hierarchy",
        enableAIAnalysis: "Use AI for auto categorization",
        enableAIAnalysisDesc:
          "Use AI to analyze bookmark content during import, automatically generating summaries, categories and tags (mutually exclusive with preserve folders)",
        fetchPageContent: "Fetch page content for analysis",
        fetchPageContentDesc:
          "Access bookmark URLs to get page content for more accurate AI analysis (slower)",
        fromBrowser: "Import from Browser",
        fromBrowserDesc: "Directly read bookmarks from current browser",
        browserBookmarkCount: "Total {{count}} bookmarks in browser",
      },
      errors: {
        unsupportedFormat:
          "Unsupported file format, please select a JSON or HTML file",
        unknown: "Unknown error",
      },
    },
    privacy: {
      title: "Privacy Settings",
      description: "Manage your data privacy and security settings",
      dataStorage: {
        title: "Data Storage",
        description: "Learn how your data is stored",
        localStorage: "Local Storage",
        localStorageDesc:
          "All your bookmark data is stored locally in the browser and never uploaded to any server. Data is securely stored using Chrome Storage API.",
        apiKeySecurity: "API Key Security",
        apiKeySecurityDesc:
          "Your AI API Key is only stored locally and communicates directly with AI service providers without going through any intermediate servers.",
      },
      aiPrivacy: {
        title: "AI Service Privacy",
        description: "Control data sent during AI analysis",
        customDomains: "Custom Privacy Domains",
        customDomainsDesc:
          "In addition to system-protected pages, you can add domains that need extra protection",
        domainPlaceholder: "Enter domain, e.g. example.com",
        addDomain: "Add Domain",
        removeDomain: "Remove Domain",
        dataNotice: "AI Analysis Data Notice",
        dataNoticeDesc:
          "When you use AI analysis features, the following data is sent to AI service providers:",
        dataItems: {
          url: "Page URL",
          title: "Page Title",
          content:
            "Page content summary (for generating descriptions and tags)",
        },
      },
      snapshot: {
        title: "Snapshot Settings",
        description: "Control web page snapshot saving",
        autoSave: "Auto Save Snapshots",
        autoSaveDesc:
          "Automatically save page snapshots when saving bookmarks for offline viewing",
        tip: "Tip",
        tipContent:
          "The snapshot feature saves page HTML locally, which may take up significant storage space. You can turn off this feature if you're concerned about storage.",
      },
    },
    categories: {
      title: "Category Management",
      description: "Create and manage your bookmark categories",
      newCategory: "New Category",
      usePreset: "Use Preset",
      batchDelete: "Batch Delete",
      selectAll: "Select All",
      deselectAll: "Deselect All",
      selectedCount: "{{count}} selected",
      deleteSelected: "Delete Selected",
      categoryName: "Category Name",
      categoryNamePlaceholder: "Enter category name",
      bookmarkCount: "{{count}} bookmarks",
      noCategories:
        'No categories yet, click "New Category" or "Use Preset" to start',
      edit: "Edit",
      delete: "Delete",
      expand: "Expand",
      collapse: "Collapse",
      addSubcategory: "Add Subcategory",
      dialogs: {
        createTitle: "New Category",
        editTitle: "Edit Category",
        deleteTitle: "Confirm Delete Category",
        deleteDescription:
          'After deleting the category "{{name}}", bookmarks in this category will be moved to "Uncategorized". This action cannot be undone.',
        batchDeleteTitle: "Confirm Batch Delete",
        batchDeleteDescription:
          'Are you sure you want to delete {{count}} selected categories? Bookmarks in these categories will be moved to "Uncategorized". This action cannot be undone.',
        cancel: "Cancel",
        create: "Create",
        save: "Save",
        confirm: "Confirm Delete",
      },
      preset: {
        title: "Select Category Scheme",
        description:
          "Choose a preset category scheme or use AI to generate personalized categories",
        presetTab: "Preset Categories",
        aiTab: "AI Generate",
        general: "Scheme 1: General",
        generalDesc:
          "Suitable for daily information gathering and work-life balance",
        professional: "Scheme 2: Professional/Tech-oriented",
        professionalDesc:
          "Suitable for developers, designers, content creators and other professionals",
        aiInputLabel: "Describe your category requirements",
        aiInputPlaceholder:
          "For example: I'm a frontend developer, I usually bookmark technical docs, design inspiration, learning resources, and also follow tech news and investment content...",
        aiGenerate: "AI Generate Categories",
        aiGenerating: "AI Generating...",
        aiRecommended: "AI Recommended Categories",
        retry: "Retry",
        apply: "Apply",
        schemes: {
          general: {
            learning: "Learning & Knowledge",
            "learning-tech-docs": "Technical Docs",
            "learning-tutorials": "Tutorials / Courses",
            "learning-research": "Research / Articles",
            "learning-notes": "Notes / Summaries",
            "learning-ebooks": "E-books / Libraries",
            work: "Work & Productivity",
            "work-projects": "Projects",
            "work-tools": "Tools / SaaS",
            "work-design": "Design Resources",
            "work-writing": "Writing / Copywriting",
            "work-collab": "Collaboration / Management",
            reading: "News & Reading",
            "reading-news": "News",
            "reading-blogs": "Blogs",
            "reading-industry": "Industry Updates",
            "reading-later": "Read Later",
            "reading-rss": "RSS Feeds",
            tech: "Tech & Development",
            "tech-frontend": "Frontend",
            "tech-backend": "Backend",
            "tech-ai": "AI / Data",
            "tech-system": "System / Architecture",
            "tech-opensource": "Open Source",
            life: "Life & Interests",
            "life-entertainment": "Entertainment",
            "life-art": "Photography / Art",
            "life-health": "Health",
            "life-travel": "Travel",
            "life-hobbies": "Hobbies",
          },
          professional: {
            tech: "Technology",
            "tech-langs": "Programming Languages",
            "tech-langs-js": "JavaScript",
            "tech-langs-python": "Python",
            "tech-langs-other": "Others",
            "tech-frameworks": "Frameworks / Libraries",
            "tech-ai": "AI / LLM",
            "tech-system": "System Design",
            "tech-opensource": "Open Source Ecosystem",
            product: "Product & Design",
            "product-analysis": "Product Analysis",
            "product-ux": "User Experience",
            "product-design-system": "Design System",
            "product-competitor": "Competitor Research",
            "product-prototype": "Prototype / Demo",
            content: "Content Creation",
            "content-material": "Writing Materials",
            "content-skills": "Expression Skills",
            "content-cases": "Case Studies",
            "content-channels": "Publishing Channels",
            business: "Business & Trends",
            "business-reports": "Industry Reports",
            "business-startup": "Startup / Business Model",
            "business-investment": "Investment / Market",
            "business-trends": "Trend Analysis",
            resources: "Tools & Resources",
            "resources-online": "Online Tools",
            "resources-data": "Data Resources",
            "resources-templates": "Templates / Assets",
            "resources-automation": "Automation",
          },
        },
      },
    },
  },
  PO = { settings: HO },
  VO = "AI is analyzing...",
  IO = "Generating title...",
  GO = "Generating description...",
  YO = "Extracting content...",
  FO = "Suggested Category",
  KO = "Suggested Tags",
  qO = "AI features are not enabled. Please configure AI in settings.",
  XO = {
    analyzing: "AI is analyzing...",
    completed: "AI analysis completed",
    failed: "AI analysis failed",
    notConfigured: "AI not configured, using manual input",
    retry: "Retry",
    configure: "Configure",
  },
  $O = {
    switchToAI: "Switch to AI search",
    switchToKeyword: "Switch to keyword search",
    aiPlaceholder: "Ask AI about your bookmarks...",
    keywordPlaceholder: "Search bookmarks...",
    aiModeHint: "AI mode: Ask questions in natural language",
    aiAnswer: "AI Answer",
    sources: "Sources",
    close: "Close",
    aiFiltered: "AI Results ({{count}})",
    status: {
      thinking: "AI is thinking...",
      searching: "Searching bookmarks...",
      writing: "Generating answer...",
      error: "An error occurred",
    },
    answer: {
      noResults:
        "No related bookmarks found. Please try different keywords or phrasing.",
      noResultsShort: "No bookmarks found matching your query.",
      foundIntro:
        'Based on your question "{{query}}", I found {{count}} related bookmarks:',
      moreResults:
        "There are {{count}} more related results, you can view them in the list below.",
    },
    suggestions: {
      viewMore: "View more related bookmarks",
      filterByTime: "Filter by time",
      narrowSearch: "Narrow search scope",
      addBookmark: "Add new bookmark",
    },
    quickActions: {
      title: "Try these examples",
      dismiss: "Dismiss",
      examples: {
        features: "View features",
        featuresQuery: "What features does this extension have?",
        shortcuts: "Learn shortcuts",
        shortcutsQuery: "What keyboard shortcuts are available?",
        semantic: "Semantic search example",
        semanticQuery: "Find me bookmarks about frontend development",
      },
    },
  },
  QO = {
    provider: "Provider",
    providers: {
      openai: "OpenAI",
      anthropic: "Anthropic Claude",
      deepseek: "DeepSeek",
      ollama: "Ollama (Local)",
      custom: "Custom",
    },
    apiKeyPlaceholder: "Enter your API key",
    baseUrlPlaceholder: "Enter custom endpoint (optional)",
    modelPlaceholder: "Enter model name, e.g.: gpt-4-turbo",
    testConnection: "Test Connection",
    features: {
      enableSmartCategory: "Enable Smart Categorization",
      enableTagSuggestion: "Enable Tag Suggestion",
      enableTranslation: "Enable Translation",
    },
  },
  ZO = {
    configNotFound: "AI configuration not found",
    apiKeyInvalid: "Invalid API key",
    requestFailed: "AI request failed: {{error}}",
    networkError: "Network error, please check your connection",
    modelNotFound: "Model not found",
    rateLimited: "Too many requests, please try again later",
    timeout: "Request timeout",
  },
  JO = {
    configSaved: "Configuration saved",
    testPassed: "Connection test successful",
    categorySuggested: "Category suggestion generated",
    tagsSuggested: "Tag suggestions generated",
  },
  WO = {
    copySuccess: "Copied successfully",
    copySuccessDesc: "Copied {{count}} links to clipboard",
  },
  ek = {
    analyzing: VO,
    generatingTitle: IO,
    generatingDescription: GO,
    extractingContent: YO,
    suggestedCategory: FO,
    suggestedTags: KO,
    aiNotEnabled: qO,
    status: XO,
    search: $O,
    settings: QO,
    error: ZO,
    success: JO,
    suggestion: WO,
  },
  tk = {
    loading: "加载中...",
    save: "保存",
    cancel: "取消",
    delete: "删除",
    edit: "编辑",
    close: "关闭",
    confirm: "确认",
    error: "错误",
    success: "成功",
    warning: "警告",
    search: "搜索",
    empty: "无数据",
    noResults: "未找到匹配结果",
    back: "返回",
    next: "下一步",
    openSettings: "打开完整设置",
    settings: "设置",
    bookmarkList: "书签列表",
    today: "今天",
    yesterday: "昨天",
    daysAgo: "{{days}} 天前",
    storage: "存储",
    more: "更多",
    loadMore: "加载更多",
    manageBookmarks: "管理书签",
    viewShortcuts: "查看快捷键",
    languages: { en: "English", zh: "中文", ja: "日本語", ko: "한국어" },
    theme: {
      toggle: "切换主题",
      light: "浅色模式",
      dark: "深色模式",
      system: "跟随系统",
    },
    contextMenu: { saveToHamHome: "收藏到 HamHome" },
  },
  nk = { common: tk },
  ak = {
    title: "书签",
    pageTitle: "书签列表",
    pageDescription: "管理和浏览你的所有书签",
    newBookmark: "新建书签",
    addBookmark: "添加书签",
    editBookmark: "编辑书签",
    deleteBookmark: "删除书签",
    deleteTitle: "删除确认",
    deleteConfirm: '确定删除书签 "{{title}}" 吗？此操作无法撤销。',
    deleteSuccess: "书签已删除",
    saveSuccess: "书签已保存",
    saveFailed: "保存书签失败",
    placeholders: {
      title: "页面标题",
      description: "简要描述这个页面的内容...",
      url: "输入网址",
    },
    categories: "分类",
    uncategorized: "未分类",
    tags: "标签",
    createdAt: "创建时间",
    recent: "最近的书签",
    all: "所有书签",
    privacy: "隐私",
    search: "搜索书签、标签、网址...",
    count: "你有 {{count}} 个书签",
    count_plural: "你有 {{count}} 个书签",
    stats: { total: "总计", category: "个分类", tags: "个标签" },
    filter: {
      tags: "标签筛选",
      category: "分类筛选",
      allCategories: "全部分类",
      allTags: "全部标签",
      selectedTags: "已选 {{count}} 个标签",
      clearFilter: "清除筛选",
    },
    view: { grid: "卡片视图", list: "列表视图" },
    batch: {
      selected: "已选择 {{count}} 项",
      selectAll: "全选",
      deselectAll: "取消全选",
      addTags: "批量打标签",
      addTagsConfirm: "添加标签",
      addTagsDescription: "为选中的 {{count}} 个书签添加标签",
      moveCategory: "批量迁移",
      moveCategoryConfirm: "迁移",
      moveCategoryDescription: "将选中的 {{count}} 个书签迁移到分类",
      delete: "批量删除",
      deleteTitle: "批量删除确认",
      deleteConfirm: "确定删除选中的 {{count}} 个书签吗？此操作无法撤销。",
    },
    empty: "暂无书签",
    emptyFilter: "没有符合筛选条件的书签",
    noTags: "无标签",
    open: "打开",
    edit: "编辑",
    delete: "删除",
    copyLink: "复制链接",
    share: "分享",
    aiTag: "AI",
    viewSnapshot: "查看快照",
    snapshot: {
      title: "网页快照",
      loading: "正在加载快照...",
      notFound: "未找到快照",
      openInNewTab: "在新标签页中打开",
      download: "下载快照",
      delete: "删除快照",
      deleteConfirm: "确定要删除此快照吗？此操作无法撤销。",
      saveSuccess: "快照保存成功",
      saveFailed: "快照保存失败",
      noSnapshot: "暂无快照",
    },
  },
  ok = {
    title: "添加新书签",
    subtitle: "保存你喜欢的网页，随时随地访问",
    url: "网址",
    titleLabel: "标题",
    description: "摘要",
    selectCategory: "选择分类",
    tagPlaceholder: "输入标签后按回车添加",
    useAI: "使用 AI 智能分析",
    aiAnalyzing: "AI 分析中...",
    saving: "保存中...",
    saveBookmark: "保存书签",
    errors: {
      urlTitleRequired: "请先输入 URL 和标题",
      configureAI: "请先在设置中配置 AI 服务",
      aiFailed: "AI 分析失败",
    },
  },
  rk = {
    title: "标签管理",
    description: "查看和管理你的书签标签",
    empty: "还没有标签，在保存书签时添加标签",
    stats: {
      title: "标签统计",
      totalTags: "共有 {{count}} 个标签",
      totalCount: "总标签数",
      avgPerBookmark: "平均标签/书签",
      mostUsed: "最常用标签",
      maxUsage: "最高使用次数",
    },
    cloud: {
      title: "标签云",
      description: "颜色越深表示使用越频繁",
      showing: "正在显示 {{count}} / {{total}} 个标签",
    },
  },
  ik = {
    save: "收藏",
    bookmarkList: "书签列表",
    shortcut: "快捷键",
    loadingPage: "正在获取页面内容",
    pleaseWait: "请稍候...",
    cannotGetPage: "无法获取页面内容",
    viewBookmarkList: "查看书签列表",
  },
  lk = {
    alreadyBookmarked: "此页面已收藏，可更新信息",
    smartSuggestions: "智能推荐",
    recommendedCategory: "推荐分类",
    recommendedTags: "推荐标签",
    urlLabel: "链接",
    urlPlaceholder: "输入网址",
    titleLabel: "标题",
    titlePlaceholder: "输入标题",
    descriptionLabel: "摘要",
    descriptionPlaceholder: "输入摘要或等待 AI 生成",
    categoryLabel: "分类",
    selectCategory: "选择分类",
    searchCategory: "搜索分类...",
    noCategoryFound: "未找到分类",
    getSuggestions: "获取推荐",
    loading: "加载中...",
    tagsLabel: "标签",
    tagPlaceholder: "输入标签后回车",
    aiRecommendedCategory: "AI 推荐分类：",
    apply: "应用",
    cancel: "取消",
    updateBookmark: "更新书签",
    saveBookmark: "保存书签",
    saving: "保存中...",
  },
  sk = {
    openPanel: "打开书签面板",
    searchPlaceholder: "搜索书签...",
    clearSearch: "清除搜索",
    tagFilter: "标签筛选",
    filter: "筛选器",
    openSettings: "打开设置",
    switchToLightMode: "切换到浅色模式",
    switchToDarkMode: "切换到深色模式",
    switchToEnglish: "Switch to English",
    switchToChinese: "切换到中文",
    emptyBookmarks: "暂无书签",
    noMatchingBookmarks: "未找到匹配的书签",
    tryAdjustFilters: "尝试调整筛选条件",
    searchTags: "搜索标签...",
    selectedTags: "已选标签",
    noMatchingTags: "未找到匹配的标签",
    noTags: "暂无标签",
    clearAllTags: "清除所有标签",
    quickTimeFilter: "快捷时间筛选",
    today: "今天",
    lastWeek: "最近一周",
    lastMonth: "最近一月",
    lastYear: "最近一年",
    customFilters: "自定义筛选器",
    clearFilter: "清除筛选器",
    addCustomFilter: "添加自定义筛选器",
    addCustomFilterTitle: "添加自定义筛选器",
    editCustomFilterTitle: "编辑自定义筛选器",
    filterName: "筛选器名称",
    filterNamePlaceholder: "给这个筛选器起个名字",
    filterConditions: "筛选条件 (多个条件时需要同时满足)",
    addCondition: "添加条件",
    conditionValuePlaceholder: "输入条件值",
    loadCustomFiltersFailed: "加载自定义筛选器失败",
    saveCustomFilterFailed: "保存自定义筛选器失败",
    fields: {
      title: "标题",
      url: "URL",
      description: "描述",
      tags: "标签",
      createdAt: "创建时间",
    },
    operators: {
      equals: "等于",
      contains: "包含",
      notEquals: "不等于",
      notContains: "不包含",
      startsWith: "开头是",
      endsWith: "结尾是",
      greaterThan: "大于",
      lessThan: "小于",
    },
  },
  ck = {
    bookmark: ak,
    modal: ok,
    tags: rk,
    popup: ik,
    savePanel: lk,
    contentPanel: sk,
  },
  uk = {
    title: "设置",
    description: "管理你的书签工具偏好设置",
    tabs: { ai: "AI 配置", general: "通用设置", storage: "存储管理" },
    language: "语言",
    theme: "主题",
    themeOptions: { light: "浅色", dark: "深色", system: "跟随系统" },
    aiSettings: "AI 设置",
    aiProvider: "AI 服务商",
    apiKey: "API 密钥",
    modelName: "模型名称",
    temperature: "temperature",
    maxTokens: "最大 Token 数",
    importBookmarks: "导入书签",
    exportBookmarks: "导出书签",
    about: {
      title: "关于",
      description: "关于 HamHome",
      version: "HamHome v1.0.0",
      subtitle: "智能书签管理工具",
      intro:
        "HamHome 是一个强大的浏览器扩展，帮助你管理和组织书签，使用 AI 技术自动分类和标记书签。",
      copyright: "© 2024-2025 HamHome. 保留所有权利。",
    },
    sections: { general: "通用", ai: "AI", privacy: "隐私", about: "关于" },
    descriptions: {
      language: "选择应用语言",
      theme: "选择主题模式",
      autoSaveSnapshot: "自动保存网页快照",
    },
    buttons: {
      import: "选择文件导入",
      export: "导出所有书签",
      reset: "重置为默认",
      clear: "清空所有数据",
    },
    general: {
      title: "通用设置",
      description: "自定义你的使用体验",
      autoSaveSnapshot: "自动保存快照",
      autoSaveSnapshotDesc: "保存书签时自动保存页面快照",
      shortcut: "快捷键",
      shortcutButton: "打开浏览器快捷键设置",
      shortcutDesc: "在浏览器设置中配置扩展快捷键",
      shortcutDescFirefox: "点击齿轮图标 → 管理扩展快捷键",
      currentShortcuts: "当前快捷键配置",
      shortcutNotSet: "未设置",
      panelPosition: "侧边栏位置",
      panelPositionDesc: "设置内容页面中侧边栏显示在左侧还是右侧",
      panelPositionOptions: { left: "左侧", right: "右侧" },
      customFilters: {
        title: "自定义筛选器",
        description: "创建和管理自定义筛选器，快速筛选书签",
        noFilters: "还没有自定义筛选器",
        noFiltersDesc: "点击「添加筛选器」创建你的第一个自定义筛选器",
        addFilter: "添加筛选器",
        edit: "编辑",
        delete: "删除",
        deleteConfirm: "确认删除筛选器",
        deleteWarning: "确定要删除筛选器「{{name}}」吗？此操作无法撤销。",
        conditionsCount: "{{count}} 个条件",
      },
    },
    ai: {
      title: "AI 服务配置",
      description: "配置 AI 分析服务以自动提取书签摘要和标签",
      enableAI: "启用 AI 分析",
      enableAIDesc: "保存书签时自动使用 AI 生成摘要和标签",
      provider: "AI 服务商",
      apiKeyPlaceholder: "sk-...",
      apiKeyDesc: "你的 API Key 将安全存储在本地，不会上传到服务器",
      baseUrl: "Base URL",
      baseUrlPlaceholder: "https://api.example.com/v1",
      model: "模型名称",
      modelPlaceholder: "gpt-3.5-turbo",
      advancedOptions: "高级参数",
      smartCategory: "智能分类推荐",
      smartCategoryDesc: "自动推荐书签分类",
      tagSuggestion: "标签推荐",
      tagSuggestionDesc: "自动推荐相关标签",
      translation: "翻译功能",
      translationDesc: "将外语内容翻译为中文",
      presetTags: "预设标签",
      presetTagsDesc: "配置预设标签，AI 将优先从中匹配相关标签应用到书签",
      addTag: "添加标签",
      addTagPlaceholder: "输入标签名称，按 Enter 添加",
      configuredTags: "已配置标签",
      noTags:
        "还未添加任何预设标签。添加预设标签后，AI 将更准确地推荐相关标签。",
      testConnection: "测试连接",
      testing: "测试中...",
      removeTag: "删除标签",
      useCustomModel: "使用自定义模型: {{model}}",
      embedding: {
        title: "语义搜索配置",
        description: "配置 Embedding 服务以启用语义搜索功能",
        enabled: "启用语义搜索",
        enabledDesc: "使用向量相似度搜索书签，支持模糊匹配和语义理解",
        provider: "Embedding 服务商",
        providerNotSupported: "当前服务商不支持 Embedding",
        apiKey: "API 密钥",
        apiKeyPlaceholder: "sk-...",
        apiKeyDesc: "Embedding 服务的 API Key（本地存储，不会上传）",
        baseUrl: "Base URL",
        baseUrlPlaceholder: "https://api.example.com/v1",
        model: "Embedding 模型",
        modelPlaceholder: "text-embedding-3-small",
        batchSize: "批量大小",
        batchSizeDesc: "每批处理的书签数量（建议 8-32）",
        testConnection: "测试连接",
        testing: "测试中...",
        testSuccess: "连接成功，向量维度: {{dimensions}}",
        testFailed: "连接失败: {{error}}",
        stats: {
          title: "向量索引状态",
          vectorCount: "已索引书签",
          coverage: "覆盖率",
          storageSize: "存储占用",
          calculating: "计算中...",
        },
        actions: {
          rebuild: "重建向量索引",
          rebuildIncremental: "增量重建索引",
          rebuildFull: "全量重建索引",
          rebuilding: "重建中...",
          rebuildProgress: "{{completed}}/{{total}}",
          clear: "清除向量数据",
          clearing: "清除中...",
        },
        dialogs: {
          rebuildTitle: "确认重建向量索引",
          rebuildWarning:
            "重建向量索引将为书签生成 Embedding。过程可能较慢，是否继续？",
          rebuildMode: "重建模式",
          rebuildModeIncremental: "增量重建（推荐）",
          rebuildModeIncrementalDesc: "只对未覆盖的书签生成向量，保留现有数据",
          rebuildModeFull: "全量重建",
          rebuildModeFullDesc: "清空所有向量并重新生成，用于切换模型或修复数据",
          fullRebuildTitle: "确认全量重建索引",
          fullRebuildWarning:
            "这将删除所有现有向量并重新为所有书签生成 Embedding。此操作用于切换模型或修复数据。过程可能较慢，是否继续？",
          clearTitle: "确认清除向量数据",
          clearWarning:
            "这将删除所有书签的向量索引，语义搜索功能将暂时不可用。确认清除？",
        },
      },
    },
    storage: {
      title: "存储管理",
      description: "管理你的书签数据和快照",
      bookmarkCount: "书签数量",
      categoryCount: "分类数量",
      snapshotCount: "快照数量",
      vectorCount: "向量数量",
      storageUsed: "书签数据占用",
      snapshotSize: "快照占用空间",
      vectorSize: "向量占用空间",
      dataExport: "数据导出",
      exportJSON: "导出为 JSON",
      exportHTML: "导出为 HTML",
      dangerZone: "危险操作",
      clearAllData: "清除所有数据",
    },
    dialogs: {
      confirmClear: "确认清除所有数据",
      clearWarning:
        "此操作将删除所有书签、分类和设置数据。此操作无法撤销，请谨慎操作。",
      cancel: "取消",
      confirm: "确认清除",
    },
    providers: {
      openai: "OpenAI",
      anthropic: "Anthropic",
      google: "Google Gemini",
      azure: "Azure OpenAI",
      deepseek: "DeepSeek",
      groq: "Groq",
      mistral: "Mistral AI",
      moonshot: "Moonshot / Kimi",
      zhipu: "智谱AI / GLM",
      hunyuan: "腾讯混元",
      nvidia: "NVIDIA NIM",
      siliconflow: "硅基流动",
      ollama: "Ollama (本地)",
      custom: "自定义",
    },
    messages: {
      temperatureDesc: "控制生成内容的随机性（0-2，推荐 0.3）",
      maxTokensDesc: "生成内容的最大长度（推荐 1000）",
      apiKeySecure: "你的 API Key 将安全存储在本地，不会上传到服务器",
    },
    importExport: {
      title: "导入/导出",
      description: "备份或迁移你的书签数据",
      importSuccess: "导入完成",
      importFailed: "导入失败",
      importDetails: "成功导入 {{imported}} 个书签，跳过 {{skipped}} 个重复项",
      importDetailsWithCategories:
        "成功导入 {{imported}} 个书签，创建 {{categoriesCreated}} 个分类，跳过 {{skipped}} 个重复项",
      importDetailsWithAI:
        "成功导入 {{imported}} 个书签，AI 处理 {{aiProcessed}} 个，跳过 {{skipped}} 个重复项",
      importDetailsWithAIAndCategories:
        "成功导入 {{imported}} 个书签，AI 处理 {{aiProcessed}} 个，创建 {{categoriesCreated}} 个分类，跳过 {{skipped}} 个重复项",
      importErrorSkipped: "{{count}} 个因错误跳过",
      export: {
        title: "导出书签",
        description: "将你的书签数据导出为文件备份",
        jsonFormat: "JSON 格式",
        jsonSubtitle: "完整数据备份",
        jsonDesc: "包含所有书签、分类信息，可用于完整恢复数据",
        htmlFormat: "HTML 格式",
        htmlSubtitle: "可浏览的网页",
        htmlDesc: "生成美观的 HTML 页面，可直接在浏览器中查看",
        currentStats:
          "当前共有 {{bookmarkCount}} 个书签，{{categoryCount}} 个分类",
      },
      import: {
        title: "导入书签",
        description: "从文件导入书签数据",
        selectFile: "点击选择文件",
        supportedFormats: "支持 JSON 和 HTML 格式",
        importing: "正在导入...",
        progress: "{{current}} / {{total}}",
        formatLabel: "支持的格式：",
        formatJSON: "HamHome JSON 导出文件",
        formatHTML: "浏览器书签 HTML 文件（从 Chrome/Firefox/Edge 导出）",
        preserveFolders: "保留书签目录结构",
        preserveFoldersDesc:
          "导入 HTML 书签时，自动将文件夹转换为分类，保持书签的层级结构",
        enableAIAnalysis: "使用 AI 自动分类打标",
        enableAIAnalysisDesc:
          "导入时使用 AI 分析书签内容，自动生成摘要、分类和标签（与保留目录结构互斥）",
        fetchPageContent: "获取页面内容进行分析",
        fetchPageContentDesc:
          "访问书签 URL 获取页面内容以获得更准确的 AI 分析结果（较慢）",
        fromBrowser: "从浏览器导入",
        fromBrowserDesc: "直接读取当前浏览器的书签数据",
        browserBookmarkCount: "浏览器中共有 {{count}} 个书签",
      },
      errors: {
        unsupportedFormat: "不支持的文件格式，请选择 JSON 或 HTML 文件",
        unknown: "未知错误",
      },
    },
    privacy: {
      title: "隐私设置",
      description: "管理你的数据隐私和安全设置",
      dataStorage: {
        title: "数据存储",
        description: "了解你的数据如何被存储",
        localStorage: "本地存储",
        localStorageDesc:
          "你的所有书签数据都存储在浏览器本地，不会上传到任何服务器。数据使用 Chrome Storage API 安全存储。",
        apiKeySecurity: "API Key 安全",
        apiKeySecurityDesc:
          "你的 AI API Key 仅存储在本地，直接与 AI 服务提供商通信，不经过任何中间服务器。",
      },
      aiPrivacy: {
        title: "AI 服务隐私",
        description: "控制 AI 分析时发送的数据",
        customDomains: "自定义隐私域名",
        customDomainsDesc:
          "除了系统默认保护的页面外，您还可以添加需要额外保护的域名",
        domainPlaceholder: "输入域名，如 example.com",
        addDomain: "添加域名",
        removeDomain: "删除域名",
        dataNotice: "AI 分析数据说明",
        dataNoticeDesc:
          "当你使用 AI 分析功能时，以下数据会发送给 AI 服务提供商：",
        dataItems: {
          url: "网页 URL",
          title: "网页标题",
          content: "网页内容摘要（用于生成描述和标签）",
        },
      },
      snapshot: {
        title: "快照设置",
        description: "控制网页快照的保存",
        autoSave: "自动保存快照",
        autoSaveDesc: "保存书签时自动保存网页快照，以便离线查看",
        tip: "提示",
        tipContent:
          "快照功能会将网页 HTML 保存在本地，可能占用较多存储空间。如果你关心存储空间，可以关闭此功能。",
      },
    },
    categories: {
      title: "分类管理",
      description: "创建和管理你的书签分类",
      newCategory: "新建分类",
      usePreset: "使用预设分类",
      batchDelete: "批量删除",
      selectAll: "全选",
      deselectAll: "取消全选",
      selectedCount: "已选择 {{count}} 项",
      deleteSelected: "删除选中项",
      categoryName: "分类名称",
      categoryNamePlaceholder: "输入分类名称",
      bookmarkCount: "{{count}} 个书签",
      noCategories: "还没有分类，点击「新建分类」或「使用预设分类」开始",
      edit: "编辑",
      delete: "删除",
      expand: "展开",
      collapse: "折叠",
      addSubcategory: "添加子分类",
      dialogs: {
        createTitle: "新建分类",
        editTitle: "编辑分类",
        deleteTitle: "确认删除分类",
        deleteDescription:
          "删除分类「{{name}}」后，该分类下的书签将被移至「未分类」。此操作无法撤销。",
        batchDeleteTitle: "确认批量删除",
        batchDeleteDescription:
          "确定要删除选中的 {{count}} 个分类吗？这些分类下的书签将被移至「未分类」。此操作无法撤销。",
        cancel: "取消",
        create: "创建",
        save: "保存",
        confirm: "确认删除",
      },
      preset: {
        title: "选择分类方案",
        description: "选择预设分类方案或使用 AI 生成个性化分类",
        presetTab: "预设分类",
        aiTab: "AI 生成",
        general: "方案一：通用型",
        generalDesc: "适合日常信息获取和工作生活平衡的用户",
        professional: "方案二：专业创作者 / 技术向",
        professionalDesc: "适合开发者、设计师、内容创作者等专业人士",
        aiInputLabel: "描述你的分类需求",
        aiInputPlaceholder:
          "例如：我是一名前端开发者，平时会收藏技术文档、设计灵感、学习资源，也会关注一些科技新闻和投资理财内容...",
        aiGenerate: "AI 生成分类",
        aiGenerating: "AI 生成中...",
        aiRecommended: "AI 推荐分类",
        retry: "重试",
        apply: "应用",
        schemes: {
          general: {
            learning: "学习与知识",
            "learning-tech-docs": "技术文档",
            "learning-tutorials": "教程 / 课程",
            "learning-research": "研究 / 深度文章",
            "learning-notes": "笔记 / 摘要",
            "learning-ebooks": "电子书 / 资料库",
            work: "工作与效率",
            "work-projects": "项目相关",
            "work-tools": "工具 / SaaS",
            "work-design": "设计资源",
            "work-writing": "写作 / 文案",
            "work-collab": "协作 / 管理",
            reading: "资讯与阅读",
            "reading-news": "新闻",
            "reading-blogs": "博客",
            "reading-industry": "行业动态",
            "reading-later": "长文待读",
            "reading-rss": "订阅源",
            tech: "技术与开发",
            "tech-frontend": "前端",
            "tech-backend": "后端",
            "tech-ai": "AI / 数据",
            "tech-system": "系统 / 架构",
            "tech-opensource": "开源项目",
            life: "生活与兴趣",
            "life-entertainment": "娱乐",
            "life-art": "摄影 / 艺术",
            "life-health": "健康",
            "life-travel": "旅行",
            "life-hobbies": "兴趣爱好",
          },
          professional: {
            tech: "技术",
            "tech-langs": "编程语言",
            "tech-langs-js": "JavaScript",
            "tech-langs-python": "Python",
            "tech-langs-other": "其他",
            "tech-frameworks": "框架 / 库",
            "tech-ai": "AI / LLM",
            "tech-system": "系统设计",
            "tech-opensource": "开源生态",
            product: "产品与设计",
            "product-analysis": "产品分析",
            "product-ux": "用户体验",
            "product-design-system": "设计系统",
            "product-competitor": "竞品研究",
            "product-prototype": "原型 / Demo",
            content: "内容创作",
            "content-material": "写作素材",
            "content-skills": "表达技巧",
            "content-cases": "案例拆解",
            "content-channels": "发布渠道",
            business: "商业与趋势",
            "business-reports": "行业报告",
            "business-startup": "创业 / 商业模式",
            "business-investment": "投资 / 市场",
            "business-trends": "趋势判断",
            resources: "工具与资源",
            "resources-online": "在线工具",
            "resources-data": "数据资源",
            "resources-templates": "模板 / 素材",
            "resources-automation": "自动化",
          },
        },
      },
    },
  },
  fk = { settings: uk },
  dk = "AI 正在分析...",
  mk = "正在生成标题...",
  gk = "正在生成描述...",
  hk = "正在提取内容...",
  pk = "推荐分类",
  vk = "推荐标签",
  yk = "AI 功能未启用，请先在设置中配置 AI",
  bk = {
    analyzing: "AI 正在分析...",
    completed: "AI 分析完成",
    failed: "AI 分析失败",
    notConfigured: "AI 未配置，使用手动填写",
    retry: "重试",
    configure: "去配置",
  },
  Sk = {
    switchToAI: "切换到 AI 搜索",
    switchToKeyword: "切换到关键词搜索",
    aiPlaceholder: "用自然语言询问你的书签...",
    keywordPlaceholder: "搜索书签...",
    aiModeHint: "AI 模式：用自然语言提问",
    aiAnswer: "AI 回答",
    sources: "信息来源",
    close: "关闭",
    aiFiltered: "AI 搜索结果（{{count}} 个）",
    status: {
      thinking: "AI 正在思考...",
      searching: "正在检索书签...",
      writing: "正在生成回答...",
      error: "发生错误",
    },
    answer: {
      noResults: "未找到相关书签。请尝试其他关键词或问法。",
      noResultsShort: "未找到与您查询相关的书签。",
      foundIntro: '根据您的问题"{{query}}"，我找到了 {{count}} 个相关书签：',
      moreResults: "还有 {{count}} 个其他相关结果，您可以在下方列表中查看。",
    },
    suggestions: {
      viewMore: "查看更多相关书签",
      filterByTime: "按时间筛选",
      narrowSearch: "缩小搜索范围",
      addBookmark: "添加新书签",
    },
    quickActions: {
      title: "试试这些示例",
      dismiss: "关闭",
      examples: {
        features: "查看插件功能",
        featuresQuery: "这个插件有哪些功能？",
        shortcuts: "了解快捷键",
        shortcutsQuery: "有哪些快捷键可以使用？",
        semantic: "语义搜索示例",
        semanticQuery: "帮我找到关于前端开发的书签",
      },
    },
  },
  wk = {
    provider: "服务商",
    providers: {
      openai: "OpenAI",
      anthropic: "Anthropic Claude",
      deepseek: "DeepSeek",
      ollama: "Ollama（本地）",
      custom: "自定义",
    },
    apiKeyPlaceholder: "输入您的 API 密钥",
    baseUrlPlaceholder: "输入自定义端点（可选）",
    modelPlaceholder: "输入模型名称，如：gpt-4-turbo",
    testConnection: "测试连接",
    features: {
      enableSmartCategory: "启用智能分类",
      enableTagSuggestion: "启用标签推荐",
      enableTranslation: "启用翻译",
    },
  },
  xk = {
    configNotFound: "未找到 AI 配置",
    apiKeyInvalid: "API 密钥无效",
    requestFailed: "AI 请求失败：{{error}}",
    networkError: "网络错误，请检查连接",
    modelNotFound: "模型不存在",
    rateLimited: "请求过于频繁，请稍后再试",
    timeout: "请求超时",
  },
  Ek = {
    configSaved: "配置已保存",
    testPassed: "连接测试成功",
    categorySuggested: "分类推荐已生成",
    tagsSuggested: "标签推荐已生成",
  },
  Ck = {
    copySuccess: "复制成功",
    copySuccessDesc: "已复制 {{count}} 个链接到剪贴板",
  },
  Ak = {
    analyzing: dk,
    generatingTitle: mk,
    generatingDescription: gk,
    extractingContent: hk,
    suggestedCategory: pk,
    suggestedTags: vk,
    aiNotEnabled: yk,
    status: bk,
    search: Sk,
    settings: wk,
    error: xk,
    success: Ek,
    suggestion: Ck,
  },
  Tk = {
    en: { common: kO, bookmark: UO, settings: PO, ai: ek },
    zh: { common: nk, bookmark: ck, settings: fk, ai: Ak },
  },
  Cs = "i18nextLng",
  Rk = {
    name: "customDetector",
    lookup() {
      const e = localStorage.getItem(Cs);
      if (e && ["en", "zh"].includes(e)) return e;
    },
    cacheUserLanguage(e) {
      localStorage.setItem(Cs, e);
    },
  },
  BS = new jS();
BS.addDetector(Rk);
Ke.use(BS)
  .use(W1)
  .init({
    resources: Tk,
    fallbackLng: "en",
    defaultNS: "common",
    ns: ["common", "bookmark", "settings", "ai"],
    debug: !1,
    interpolation: { escapeValue: !1 },
    detection: {
      order: ["customDetector", "localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: Cs,
    },
    saveMissing: !1,
  });
async function Mk() {
  try {
    const { configStorage: e } = await q2(async () => {
        const { configStorage: n } = await import("./index-DuzChA5b.js");
        return { configStorage: n };
      }, []),
      t = await e.getSettings();
    t != null &&
      t.language &&
      ["en", "zh"].includes(t.language) &&
      Ke.language !== t.language &&
      (await Ke.changeLanguage(t.language),
      localStorage.setItem(Cs, t.language));
  } catch {}
}
Mk();
export {
  Zs as $,
  Ae as A,
  nC as B,
  Md as C,
  Qk as D,
  Pk as E,
  F,
  Uk as G,
  y0 as H,
  Ik as I,
  wR as J,
  xR as K,
  Gk as L,
  bt as M,
  qA as N,
  sC as O,
  ye as P,
  aN as Q,
  Nk as R,
  Vk as S,
  Fk as T,
  Yk as U,
  K1 as V,
  oC as W,
  Qs as X,
  Vb as Y,
  Ib as Z,
  Bn as _,
  Zk as a,
  Nl as a$,
  Ms as a0,
  oT as a1,
  ot as a2,
  qb as a3,
  yb as a4,
  Ud as a5,
  ii as a6,
  Dd as a7,
  Fs as a8,
  Gb as a9,
  em as aA,
  nN as aB,
  mN as aC,
  tN as aD,
  Wk as aE,
  rN as aF,
  sN as aG,
  uN as aH,
  cN as aI,
  or as aJ,
  Ti as aK,
  DS as aL,
  EN as aM,
  xN as aN,
  eE as aO,
  Lk as aP,
  zk as aQ,
  _k as aR,
  CN as aS,
  kl as aT,
  _l as aU,
  Wa as aV,
  Ef as aW,
  kk as aX,
  Ol as aY,
  TN as aZ,
  q2 as a_,
  Yb as aa,
  Bk as ab,
  oR as ac,
  lR as ad,
  uR as ae,
  rE as af,
  sR as ag,
  cR as ah,
  rR as ai,
  iR as aj,
  Xk as ak,
  Kk as al,
  qk as am,
  dC as an,
  tC as ao,
  fN as ap,
  dN as aq,
  gN as ar,
  hN as as,
  pN as at,
  yN as au,
  vN as av,
  Hk as aw,
  bN as ax,
  SN as ay,
  wN as az,
  Jk as b,
  oe as c,
  eN as d,
  AS as e,
  ED as f,
  CD as g,
  AD as h,
  ka as i,
  x as j,
  AN as k,
  MN as l,
  L as m,
  jk as n,
  Ke as o,
  Qa as p,
  oN as q,
  p as r,
  lN as s,
  iN as t,
  RN as u,
  Td as v,
  gb as w,
  wa as x,
  Ba as y,
  Js as z,
};
