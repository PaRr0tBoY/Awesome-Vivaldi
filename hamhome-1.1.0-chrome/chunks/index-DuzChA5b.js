var g = Object.defineProperty;
var y = (l, e, r) =>
  e in l
    ? g(l, e, { enumerable: !0, configurable: !0, writable: !0, value: r })
    : (l[e] = r);
var w = (l, e, r) => y(l, typeof e != "symbol" ? e + "" : e, r);
import {
  aT as k,
  a$ as _,
  aU as C,
  k as F,
  i as N,
  aZ as R,
} from "./style-DLmIT9lJ.js";
const S = "hamhome-snapshots",
  m = 1,
  d = "snapshots";
class p {
  constructor() {
    w(this, "db", null);
  }
  async getDB() {
    return this.db
      ? this.db
      : new Promise((e, r) => {
          const s = indexedDB.open(S, m);
          ((s.onerror = () => r(s.error)),
            (s.onsuccess = () => {
              ((this.db = s.result), e(this.db));
            }),
            (s.onupgradeneeded = (o) => {
              const n = o.target.result;
              if (!n.objectStoreNames.contains(d)) {
                const t = n.createObjectStore(d, { keyPath: "id" });
                (t.createIndex("bookmarkId", "bookmarkId", { unique: !0 }),
                  t.createIndex("createdAt", "createdAt", { unique: !1 }));
              }
            }));
        });
  }
  async saveSnapshot(e, r) {
    const s = await this.getDB(),
      o = new Blob([r], { type: "text/html" }),
      n = {
        id: crypto.randomUUID(),
        bookmarkId: e,
        html: o,
        size: o.size,
        createdAt: Date.now(),
      };
    return new Promise((t, a) => {
      const u = s.transaction(d, "readwrite").objectStore(d),
        h = u.index("bookmarkId").get(e);
      ((h.onsuccess = () => {
        h.result && u.delete(h.result.id);
        const x = u.add(n);
        ((x.onsuccess = () => t(n)), (x.onerror = () => a(x.error)));
      }),
        (h.onerror = () => a(h.error)));
    });
  }
  async getSnapshot(e) {
    const r = await this.getDB();
    return new Promise((s, o) => {
      const c = r
        .transaction(d, "readonly")
        .objectStore(d)
        .index("bookmarkId")
        .get(e);
      ((c.onsuccess = () => s(c.result || null)),
        (c.onerror = () => o(c.error)));
    });
  }
  async getSnapshotAsUrl(e) {
    const r = await this.getSnapshot(e);
    return r ? URL.createObjectURL(r.html) : null;
  }
  async deleteSnapshot(e) {
    const r = await this.getDB();
    return new Promise((s, o) => {
      const t = r.transaction(d, "readwrite").objectStore(d),
        c = t.index("bookmarkId").get(e);
      ((c.onsuccess = () => {
        (c.result && t.delete(c.result.id), s());
      }),
        (c.onerror = () => o(c.error)));
    });
  }
  async getStorageUsage() {
    const e = await this.getDB();
    return new Promise((r, s) => {
      const t = e.transaction(d, "readonly").objectStore(d).getAll();
      ((t.onsuccess = () => {
        const a = t.result || [];
        r({ count: a.length, totalSize: a.reduce((c, u) => c + u.size, 0) });
      }),
        (t.onerror = () => s(t.error)));
    });
  }
  async clearAllSnapshots() {
    const e = await this.getDB();
    return new Promise((r, s) => {
      const t = e.transaction(d, "readwrite").objectStore(d).clear();
      ((t.onsuccess = () => r()), (t.onerror = () => s(t.error)));
    });
  }
}
const P = new p(),
  D = "HamHomeAICache",
  i = "analyses",
  A = 1,
  E = 24 * 60 * 60 * 1e3;
class B {
  constructor() {
    w(this, "db", null);
    w(this, "initPromise", null);
  }
  async initDB() {
    return this.db
      ? this.db
      : this.initPromise
        ? (await this.initPromise, this.db)
        : ((this.initPromise = new Promise((e, r) => {
            const s = indexedDB.open(D, A);
            ((s.onerror = () => {
              r(new Error("Failed to open IndexedDB"));
            }),
              (s.onsuccess = (o) => {
                ((this.db = o.target.result), e());
              }),
              (s.onupgradeneeded = (o) => {
                const n = o.target.result;
                if (!n.objectStoreNames.contains(i)) {
                  const t = n.createObjectStore(i, { keyPath: "id" });
                  (t.createIndex("url", "url", { unique: !0 }),
                    t.createIndex("expiresAt", "expiresAt"));
                }
              }));
          })),
          await this.initPromise,
          this.db);
  }
  async getCachedAnalysis(e) {
    try {
      const n = (await this.initDB())
        .transaction(i, "readonly")
        .objectStore(i)
        .index("url")
        .get(e);
      return new Promise((t, a) => {
        ((n.onerror = () => {
          a(new Error("Failed to get cached analysis"));
        }),
          (n.onsuccess = (c) => {
            const u = c.target.result;
            if (!u) {
              t(null);
              return;
            }
            if (u.expiresAt < Date.now()) {
              (this.deleteCachedAnalysis(e).catch(console.error), t(null));
              return;
            }
            t(u.analysisResult);
          }));
      });
    } catch {
      return null;
    }
  }
  async cacheAnalysis(e, r) {
    try {
      const o = (await this.initDB())
          .transaction(i, "readwrite")
          .objectStore(i),
        n = {
          id: e.url,
          url: e.url,
          analysisResult: r,
          createdAt: Date.now(),
          expiresAt: Date.now() + E,
        },
        t = o.put(n);
      return new Promise((a, c) => {
        ((t.onerror = () => {
          c(new Error("Failed to cache analysis"));
        }),
          (t.onsuccess = () => {
            a();
          }));
      });
    } catch {}
  }
  async deleteCachedAnalysis(e) {
    try {
      const o = (await this.initDB())
        .transaction(i, "readwrite")
        .objectStore(i)
        .delete(e);
      return new Promise((n, t) => {
        ((o.onerror = () => {
          t(new Error("Failed to delete cached analysis"));
        }),
          (o.onsuccess = () => {
            n();
          }));
      });
    } catch {}
  }
  async cleanupExpiredCache() {
    try {
      const s = (await this.initDB())
        .transaction(i, "readwrite")
        .objectStore(i)
        .index("expiresAt");
      let o = 0;
      return new Promise((n, t) => {
        const a = IDBKeyRange.upperBound(Date.now()),
          c = s.openCursor(a);
        ((c.onerror = () => {
          t(new Error("Failed to cleanup expired cache"));
        }),
          (c.onsuccess = (u) => {
            const b = u.target.result;
            b ? (b.delete(), o++, b.continue()) : n(o);
          }));
      });
    } catch {
      return 0;
    }
  }
  async clearAll() {
    try {
      const s = (await this.initDB())
        .transaction(i, "readwrite")
        .objectStore(i)
        .clear();
      return new Promise((o, n) => {
        ((s.onerror = () => {
          n(new Error("Failed to clear cache"));
        }),
          (s.onsuccess = () => {
            o();
          }));
      });
    } catch {}
  }
  async getStats() {
    try {
      const r = (await this.initDB()).transaction(i, "readonly").objectStore(i);
      return new Promise((s, o) => {
        const n = r.count();
        ((n.onerror = () => {
          o(new Error("Failed to get cache stats"));
        }),
          (n.onsuccess = (t) => {
            const a = t.target.result;
            s({ count: a, size: 0 });
          }));
      });
    } catch {
      return { count: 0, size: 0 };
    }
  }
}
const q = new B();
export {
  k as DEFAULT_AI_CONFIG,
  _ as DEFAULT_EMBEDDING_CONFIG,
  C as DEFAULT_SETTINGS,
  q as aiCacheStorage,
  F as bookmarkStorage,
  N as configStorage,
  P as snapshotStorage,
  R as vectorStore,
};
