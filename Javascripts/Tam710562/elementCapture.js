/*
 * Element Capture
 * Written by Tam710562
 */

(() => {
  'use strict';

  const gnoh = {
    getReactProps(element) {
      if (typeof element === 'string') {
        element = document.querySelector(element);
      }
      if (!element || element.ownerDocument !== document) {
        return;
      }
      if (!this.reactPropsKey) {
        this.reactPropsKey = Object.keys(element).find((key) => key.startsWith('__reactProps'));
      }
      return element[this.reactPropsKey];
    },
    promise: {
      delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      },
    },
    element: {
      getStyle(element) {
        return getComputedStyle(element);
      },
      executeScript(element, details, callback) {
        if (details.func) {
          details.code = `(${details.func})(${JSON.stringify(details.args || []).slice(1, -1)})`;
          delete details.func;
          delete details.args;
        }

        if (!callback) {
          return new Promise((resolve, reject) => {
            element.executeScript(details, (results) => {
              resolve(results);
            });
          });
        } else {
          element.executeScript(details, callback);
        }
      },
    },
    override(obj, functionName, callback, skipApply, runBefore) {
      this._overrides = this._overrides || {};
      let subKey = '';
      try {
        if (obj.ownerDocument === document) {
          this._overrides._elements = this._overrides._elements || [];
          const element = this._overrides._elements.find((item) => item.element === obj);
          let id;
          if (element) {
            id = element.id;
          } else {
            id = this.uuid.generate(this._overrides._elements.map((item) => item.id));
            this._overrides._elements.push({
              element: obj,
              id: id,
            });
          }
          subKey = '_' + id;
        }
      } catch (e) { }
      const key = functionName + '_' + obj.constructor.name + subKey;
      if (!this._overrides[key]) {
        this._overrides[key] = [];
        obj[functionName] = ((_super) => function () {
          let result;
          let skipApply = true;
          for (let i = 0; i < gnoh._overrides[key].length; i++) {
            skipApply = skipApply
              && (typeof gnoh._overrides[key][i].skipApply !== 'function'
                && gnoh._overrides[key][i].skipApply !== false || typeof gnoh._overrides[key][i].skipApply === 'function'
                && !!gnoh._overrides[key][i].skipApply.apply(this, arguments)
              );
            if (skipApply !== false && gnoh._overrides[key][i].runBefore === true) {
              gnoh._overrides[key][i].callback.apply(this, arguments);
            }
          }
          if (skipApply) {
            result = _super.apply(this, arguments);
          }
          for (let i = 0; i < gnoh._overrides[key].length; i++) {
            if (gnoh._overrides[key][i].runBefore !== true) {
              const args = Array.from(arguments);
              args.push(result);
              gnoh._overrides[key][i].callback.apply(this, args);
            }
          }
          return result;
        })(obj[functionName]);
      }

      this._overrides[key].push({
        callback,
        skipApply,
        runBefore,
      });
      return key;
    },
    uuid: {
      generate(ids) {
        let d = Date.now() + performance.now();
        let r;
        const id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          r = (d + Math.random() * 16) % 16 | 0;
          d = Math.floor(d / 16);
          return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });

        if (Array.isArray(ids) && ids.includes(id)) {
          return this.generate(ids);
        }
        return id;
      },
    },
  };

  let rect = null;
  let pointerDownEvent = null;
  const captureAreaId = 'capture-area';

  function getRect(element) {
    const rect = element.getBoundingClientRect();

    return {
      left: Math.round(Math.max(rect.left, 0)),
      top: Math.round(Math.max(rect.top, 0)),
      right: Math.round(Math.min(rect.right, window.innerWidth)),
      bottom: Math.round(Math.min(rect.bottom, window.innerHeight)),
    };
  }

  function getElement(x, y) {
    const elements = document.elementsFromPoint(x, y);
    return elements.find(el => el.id !== captureAreaId);
  }

  async function simulateSelect(captureArea) {
    if (!captureArea || !captureArea.parentElement || !rect) {
      return;
    }

    const captureAreaProps = gnoh.getReactProps(captureArea);
    captureAreaProps.onPointerDown(new PointerEvent('pointerdown', {
      view: window,
      bubbles: true,
      cancelable: true,
      buttons: 1,
      pointerType: 'mouse',
      clientX: rect.left,
      clientY: rect.top,
      pointerId: 1,
    }));

    await gnoh.promise.delay(10);
    captureAreaProps.onPointerMove(new PointerEvent('pointermove', {
      view: window,
      bubbles: true,
      cancelable: true,
      buttons: 1,
      pointerType: 'mouse',
      clientX: rect.right,
      clientY: rect.bottom,
    }));

    await gnoh.promise.delay(10);
    captureAreaProps.onPointerUp(new PointerEvent('pointerup', {
      view: window,
      bubbles: true,
      cancelable: true,
      buttons: 1,
      pointerType: 'mouse',
      pointerId: 1,
    }));

    await gnoh.promise.delay(10);
    const style = window.getComputedStyle(captureArea);

    if (
      Math.abs(rect.top - parseFloat(style.borderTopWidth)) >= 10
      || Math.abs(rect.left - parseFloat(style.borderLeftWidth)) >= 10
      || Math.abs(window.innerHeight - rect.bottom - parseFloat(style.borderBottomWidth)) >= 10
      || Math.abs(window.innerWidth - rect.right - parseFloat(style.borderRightWidth)) >= 10
    ) {
      await simulateSelect(captureArea);
    }
  }

  function pointerDownEventHandler(event) {
    pointerDownEvent = event;
    event.preventDefault();
    event.stopPropagation();
  }

  async function pointerMoveEventHandler(event) {
    if (Array.from(document.forms).find(f => f.classList.contains('ControlPanel'))?.elements.modePicker?.value === 'area') {
      if (
        pointerDownEvent
        && Math.abs(event.pageX - pointerDownEvent.clientX) > 4
        && Math.abs(event.pageY - pointerDownEvent.clientY) > 4
      ) {
        this.removeEventListener('pointermove', pointerMoveEventHandler, true);
        this.removeEventListener('pointerup', pointerUpEventHandler, true);
        this.removeEventListener('pointerleave', pointerLeaveEventHandler, true);

        const captureAreaProps = gnoh.getReactProps(this);
        captureAreaProps.onPointerDown(pointerDownEvent);
      } else {
        const element = getElement(event.clientX, event.clientY);
        rect = null;

        if (element.closest('webview')) {
          const webview = element.closest('webview');
          const webviewRect = getRect(webview);
          const zoom = parseFloat(gnoh.element.getStyle(element).getPropertyValue('--uiZoomLevel'));
          const webviewZoom = await new Promise((resolve) => {
            webview.getZoom((res) => {
              resolve(res);
            });
          });

          const results = await gnoh.element.executeScript(element, {
            func: inject,
            args: [
              {
                x: (event.clientX - webviewRect.left) * zoom / webviewZoom,
                y: (event.clientY - webviewRect.top) * zoom / webviewZoom,
              }
            ],
          });

          if (results[0]) {
            rect = results[0];
            rect.left = rect.left / zoom * webviewZoom + webviewRect.left;
            rect.top = rect.top / zoom * webviewZoom + webviewRect.top;
            rect.right = rect.right / zoom * webviewZoom + webviewRect.left;
            rect.bottom = rect.bottom / zoom * webviewZoom + webviewRect.top;
          } else {
            rect = webviewRect;
          }
        } else {
          rect = getRect(element);
        }

        if (rect) {
          this.style.background = 'transparent';
          this.style.borderWidth = `${rect.top}px ${window.innerWidth - rect.right}px ${window.innerHeight - rect.bottom}px ${rect.left}px`;
        }
      }
    }
  }

  async function pointerUpEventHandler(event) {
    this.removeEventListener('pointermove', pointerMoveEventHandler, true);
    this.removeEventListener('pointerup', pointerUpEventHandler, true);
    this.removeEventListener('pointerleave', pointerLeaveEventHandler, true);

    if (event.which === 3 || event.button === 2) {
      const captureAreaProps = gnoh.getReactProps(this);
      captureAreaProps.onKeyDown(new KeyboardEvent('keydown', {
        keyCode: 27,
      }));
    } else {
      await simulateSelect(this);
    }
  }

  async function pointerLeaveEventHandler(event) {
    event.preventDefault();
    event.stopPropagation();

    this.style.removeProperty('background');
    this.style.removeProperty('border-width');
  }

  function inject({ x, y }) {
    const element = document.elementFromPoint(x, y);
    const rect = element.getBoundingClientRect();

    return {
      left: Math.round(Math.max(rect.left, 0)),
      top: Math.round(Math.max(rect.top, 0)),
      right: Math.round(Math.min(rect.right, window.innerWidth)),
      bottom: Math.round(Math.min(rect.bottom, window.innerHeight)),
    };
  }

  gnoh.override(HTMLDivElement.prototype, 'appendChild', async (element) => {
    if (element.id === captureAreaId) {
      rect = null;
      pointerDownEvent = null;

      element.addEventListener('pointerdown', pointerDownEventHandler, { once: true, capture: true });
      element.addEventListener('pointermove', pointerMoveEventHandler, true);
      element.addEventListener('pointerup', pointerUpEventHandler, true);
      element.addEventListener('pointerleave', pointerLeaveEventHandler, true);
    }
  });
})();
