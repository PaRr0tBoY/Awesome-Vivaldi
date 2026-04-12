# `vivaldi.thumbnails.captureTab` and `captureUI` Reference

This document records what is currently known about Vivaldi screenshot APIs from three sources:
- official Vivaldi Modders API documentation
- reverse-reading `pretty-bundle.js`
- local console experiments in the Vivaldi UI context

The most important result of this investigation is simple:

```text
captureTab is usable for full-page and thumbnail-style capture.
captureUI is the reliable API for precise on-screen region capture.
```

For ArcPeek and any DOM-aligned screenshot effect, this distinction matters more than any single rect conversion formula.

## API Signatures

```javascript
vivaldi.thumbnails.captureTab(tabId, params?, callback)
vivaldi.thumbnails.captureUI(params, callback)
```

Minimal Promise wrappers:

```javascript
const captureTab = (tabId, params) =>
  new Promise((resolve, reject) => {
    vivaldi.thumbnails.captureTab(tabId, params, (dataUrl) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(dataUrl || null);
    });
  });

const captureUI = (params) =>
  new Promise((resolve, reject) => {
    vivaldi.thumbnails.captureUI(params, (success, dataUrl) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      if (!success) {
        reject(new Error("captureUI returned false"));
        return;
      }
      resolve(dataUrl || null);
    });
  });
```

## Officially Documented Facts

Sources:
- [vivaldi-thumbnails.txt](/Users/acid/Desktop/VivaldiModpack/Doc/LonmDoc/vivaldi-thumbnails.txt:194)
- [EveryAPI.txt](/Users/acid/Desktop/VivaldiModpack/Doc/EveryAPI.txt:9104)

### `captureTab`

Official facts:
- `tabId` is the tab to capture.
- `tabId = 0` captures the current active tab.
- `encodeFormat` accepts `"jpg"` or `"png"`.
- `encodeQuality` applies to JPEG output.
- `fullPage: true` captures the full page height, restricted to 20000 pixels.
- `rect` is a `CaptureRect`.
- The docs say: `Wanted rect, output is not scaled.`
- `width` is the resulting width after scaling. Ignored if `fullPage` is `true`.
- `height` is the resulting height after scaling, or a maximum height in non-visible capture modes.
- `saveToDisk`, `showFileInPath`, `copyToClipboard`, and `saveFilePattern` are accepted.

Documented `CaptureRect`:

```javascript
{
  left: integer,
  top: integer,
  width: integer,
  height: integer
}
```

### `captureUI`

Official facts:
- `windowId` is required.
- `posX` and `posY` are in UI coordinates.
- `width` and `height` are in UI coordinates.
- `encodeFormat`, `encodeQuality`, `saveToDisk`, `showFileInPath`, `copyToClipboard`, and `saveFilePattern` are accepted.

This coordinate statement is explicit in the docs and turns out to match Vivaldi’s own internal usage.

## What We Verified Locally

Environment summary from local experiments:
- `tabId = 0` works and returns a valid screenshot for the active tab.
- Basic full-tab capture worked and returned a decodable PNG.

### `captureTab` Findings

Confirmed behavior:
- `captureTab(0, { encodeFormat: "png" })` succeeds.
- `fullPage: true` returns a full-page style image and effectively ignores local region intent.
- `width + height` together affect output size.
- `rect` is accepted.

Observed problems:
- A page link’s `getBoundingClientRect()` can be highlighted correctly on screen, but the same rect does not reliably produce the matching capture with `captureTab`.
- `raw` page rect produced the wrong output size and wrong region.
- `dpr`-scaled rect fixed output size in some cases but still missed position.
- Adding outer webview offset still did not make `captureTab(rect)` stable enough for DOM-aligned capture.

Working conclusion:

```text
网页 DOM rect 不能稳定直接映射到 captureTab.rect。
```

More specifically:
- The public API supports `rect`.
- The API does not expose a clearly documented coordinate system for that `rect`.
- Simple transforms based on CSS pixels, DPR, visual viewport offsets, and webview offsets were not sufficient to make it reliable for link-level capture.

### `captureUI` Findings

Confirmed behavior:
- Using the exact same hover-tracked link rectangle, after converting it to outer UI coordinates, `captureUI` captured the correct on-screen region.
- The region aligned with the red overlay used by the test probe.

Working conclusion:

```text
如果目标是“屏幕上哪个链接，就截哪个链接”，captureUI 是正确接口。
```

## Evidence From `pretty-bundle.js`

### 1. `captureTab` is mainly used for thumbnails and full-page style output

Reference:
- [pretty-bundle.js](/Users/acid/Desktop/VivaldiModpack/Others/UsefulResources/Source/source/pretty-bundle.js:249087)

Internal usage example:

```javascript
const t = {
  encodeFormat: "jpg",
  encodeQuality: 80,
  fullPage: !1,
  width: 330,
  height: 270,
};
g.ZP.setThumbnail(e, await A.Z.thumbnails.captureTab(e, t));
```

This is clearly thumbnail-oriented, not precise DOM-region capture.

### 2. Vivaldi’s own “area capture” flow uses `captureUI`

References:
- [pretty-bundle.js](/Users/acid/Desktop/VivaldiModpack/Others/UsefulResources/Source/source/pretty-bundle.js:90047)
- [pretty-bundle.js](/Users/acid/Desktop/VivaldiModpack/Others/UsefulResources/Source/source/pretty-bundle.js:303677)

Internal flow:
- area selection is built from `clientX/clientY`
- selection is stored as `x/y/width/height`
- final call is:

```javascript
c.Z.thumbnails.captureUI({
  windowId: e,
  posX: n,
  posY: i,
  width: s,
  height: a,
  ...
})
```

This means Vivaldi’s official area-capture UX is designed around UI coordinates, not `captureTab(rect)`.

### 3. Vivaldi’s “find in page” preview capture also uses `captureUI`

Reference:
- [pretty-bundle.js](/Users/acid/Desktop/VivaldiModpack/Others/UsefulResources/Source/source/pretty-bundle.js:179630)

Internal flow:
- take `selectionRect`
- get active webview `getBoundingClientRect()`
- convert selection into UI coordinates
- call `captureUI`

Relevant internal code shape:

```javascript
const s = n.getBoundingClientRect();
const a = {
  left: parseInt(s.left + e.left / i),
  top: parseInt(s.top + e.top / i),
  width: parseInt(e.width / i),
  height: parseInt(e.height / i),
};
const o = {
  windowId: this.context.vivaldiWindowId,
  posX: a.left,
  posY: a.top,
  width: a.width,
  height: a.height,
  saveToDisk: !1,
};
A.Z.thumbnails.captureUI(o, ...)
```

This is the strongest internal evidence in the bundle:

```text
When Vivaldi itself needs a precise visible-region screenshot, it uses captureUI.
```

## Practical Coordinate Model

For DOM-aligned capture, use this model:

1. In the page, get the target rect with `getBoundingClientRect()`.
2. In the Vivaldi UI, get the active webview rect with `activeWebview.getBoundingClientRect()`.
3. Convert page rect into outer UI rect:

```javascript
const uiRect = {
  left: webviewRect.left + pageRect.left,
  top: webviewRect.top + pageRect.top,
  width: pageRect.width,
  height: pageRect.height,
};
```

4. If Vivaldi UI zoom is not `1`, adjust according to the same UI-coordinate rules used by Vivaldi internals.
5. Call `captureUI`, not `captureTab(rect)`.

Minimal recommended call:

```javascript
vivaldi.thumbnails.captureUI(
  {
    windowId: window.vivaldiWindowId,
    posX: Math.round(uiRect.left),
    posY: Math.round(uiRect.top),
    width: Math.round(uiRect.width),
    height: Math.round(uiRect.height),
    saveToDisk: false,
    encodeFormat: "png",
  },
  (success, dataUrl) => {
    console.log(success, dataUrl);
  }
);
```

## Console Lab Script

Use:
- [captureTab-lab.js](/Users/acid/Desktop/VivaldiModpack/Doc/ConsoleScripts/captureTab-lab.js)

Recommended commands:

```javascript
captureTabLab.help();
await captureTabLab.captureBasic();
captureTabLab.startHoverLinkProbe({ captureApi: "ui", variant: "raw" });
```

Direct manual capture of the currently hovered target:

```javascript
await captureTabLab.captureCurrentHover({ captureApi: "ui" });
```

Direct UI-region test:

```javascript
await captureTabLab.captureUIRect({
  left: 100,
  top: 100,
  width: 200,
  height: 120,
});
```

What the hover probe does:
- page-side script tracks the live hovered `a[href]`
- outer UI renders a matching overlay
- after 2 seconds, the probe captures either through `captureTab` or `captureUI`
- `captureApi: "ui"` is now the recommended mode for alignment testing

## Recommended Interpretation

Use this rule of thumb:

- Use `captureTab` for:
  - full-page captures
  - tab thumbnails
  - approximate page snapshots where exact DOM-region alignment is not required

- Use `captureUI` for:
  - precise on-screen region capture
  - matching a page element’s visible position
  - any animation or preview effect that must visually originate from a specific link or element

## ArcPeek Guidance

ArcPeek should not rely on `captureTab(rect)` for precise link previews.

Recommended ArcPeek direction:
- keep page-side link detection as it is, or improve it
- convert page rect to outer UI rect using active webview geometry
- call `captureUI`
- keep `captureTab` only as a fallback for coarse whole-page preview scenarios if needed

This is the current best-supported direction from both:
- local experiments
- Vivaldi’s own internal code patterns
