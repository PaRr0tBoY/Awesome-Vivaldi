/*
 * Choose Search engine in Address bar
 * Written by Tam710562
 */

(function () {
  'use strict';

  const gnoh = {
    uuid: {
      generate: function (ids) {
        let d = Date.now() + performance.now();
        let r;
        const id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          r = (d + Math.random() * 16) % 16 | 0;
          d = Math.floor(d / 16);
          return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });

        if (Array.isArray(ids) && ids.includes(id)) {
          return this.uuid.generate(ids);
        }
        return id;
      },
    },
    addStyle: function (css, id, isNotMin) {
      this.styles = this.styles || {};
      if (Array.isArray(css)) {
        css = css.join(isNotMin === true ? '\n' : '');
      }
      id = id || this.uuid.generate(Object.keys(this.styles));
      this.styles[id] = this.createElement('style', {
        html: css || '',
        'data-id': id,
      }, document.head);
      return this.styles[id];
    },
    encode: {
      regex: function (str) {
        return !str ? str : str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      },
    },
    createElement: function (tagName, attribute, parent, inner, options) {
      if (typeof tagName === 'undefined') {
        return;
      }
      if (typeof options === 'undefined') {
        options = {};
      }
      if (typeof options.isPrepend === 'undefined') {
        options.isPrepend = false;
      }
      const el = document.createElement(tagName);
      if (!!attribute && typeof attribute === 'object') {
        for (const key in attribute) {
          if (key === 'text') {
            el.textContent = attribute[key];
          } else if (key === 'html') {
            el.innerHTML = attribute[key];
          } else if (key === 'style' && typeof attribute[key] === 'object') {
            for (const css in attribute.style) {
              el.style.setProperty(css, attribute.style[css]);
            }
          } else if (key === 'events' && typeof attribute[key] === 'object') {
            for (const event in attribute.events) {
              if (typeof attribute.events[event] === 'function') {
                el.addEventListener(event, attribute.events[event]);
              }
            }
          } else if (typeof el[key] !== 'undefined') {
            el[key] = attribute[key];
          } else {
            if (typeof attribute[key] === 'object') {
              attribute[key] = JSON.stringify(attribute[key]);
            }
            el.setAttribute(key, attribute[key]);
          }
        }
      }
      if (!!inner) {
        if (!Array.isArray(inner)) {
          inner = [inner];
        }
        for (let i = 0; i < inner.length; i++) {
          if (inner[i].nodeName) {
            el.append(inner[i]);
          } else {
            el.append(this.createElementFromHTML(inner[i]));
          }
        }
      }
      if (typeof parent === 'string') {
        parent = document.querySelector(parent);
      }
      if (!!parent) {
        if (options.isPrepend) {
          parent.prepend(el);
        } else {
          parent.append(el);
        }
      }
      return el;
    },
    createElementFromHTML: function (html) {
      return this.createElement('template', {
        html: (html || '').trim(),
      }).content;
    },
    observeDOM: function (obj, callback, config) {
      const obs = new MutationObserver(function (mutations, observer) {
        if (config) {
          callback(mutations, observer);
        } else {
          if (mutations[0].addedNodes.length || mutations[0].removedNodes.length) {
            callback(mutations, observer);
          }
        }
      });
      obs.observe(obj, config || {
        childList: true,
        subtree: true,
      });
    },
    override: function (obj, functionName, callback, conditon, runbefore) {
      this._overrides = this._overrides || {};
      let subKey = '';
      try {
        if (obj.ownerDocument === document) {
          this._overrides._elements = this._overrides._elements || [];
          const element = this._overrides._elements.find(function (item) {
            return item.element === obj;
          });
          let id;
          if (element) {
            id = element.id;
          } else {
            id = this.uuid.generate(this._overrides._elements.map(function (item) {
              return item.id;
            }));
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
        obj[functionName] = (function (_super) {
          return function () {
            let result;
            let conditon = true;
            for (let i = 0; i < gnoh._overrides[key].length; i++) {
              conditon = conditon && (typeof gnoh._overrides[key][i].conditon !== 'function' && gnoh._overrides[key][i].conditon !== false || typeof gnoh._overrides[key][i].conditon === 'function' && !!gnoh._overrides[key][i].conditon.apply(this, arguments));
              if (conditon === false) {
                continue;
              }
              if (gnoh._overrides[key][i].runbefore === true) {
                gnoh._overrides[key][i].callback.apply(this, arguments);
              }
            }
            if (conditon) {
              result = _super.apply(this, arguments);
            }
            for (let i = 0; i < gnoh._overrides[key].length; i++) {
              if (gnoh._overrides[key][i].runbefore !== true) {
                const args = Array.from(arguments);
                args.push(result);
                gnoh._overrides[key][i].callback.apply(this, args);
              }
            }
            return result;
          };
        })(obj[functionName]);
      }

      this._overrides[key].push({
        callback: callback,
        conditon: conditon,
        runbefore: runbefore,
      });
      return key;
    },
    getReactPropsKey: function (element) {
      if (!this.reactPropsKey) {
        if (!element) {
          element = document.getElementById('browser');
        } else if (typeof element === 'string') {
          element = document.querySelector(element);
        }
        if (!element || element.ownerDocument !== document) {
          return;
        }
        this.reactPropsKey = Object.keys(element).find(function (key) {
          return key.startsWith('__reactProps');
        });
      }
      return this.reactPropsKey;
    }
  };

  gnoh.addStyle([
    '.UrlBar-AddressField .OmniDropdown .search-engines-in-address-bar { position: sticky; top: 0; right: 0; left: 0; margin-left: -4px; margin-right: -4px; transform: translateY(-5px); background: var(--colorBg); height: 32px; box-shadow: 0px -1px var(--colorBorder) inset; z-index: 1; }',
    '.UrlBar-AddressField .OmniDropdown .search-engines-in-address-bar button { background: transparent; border: 0; width: 32px; height: 32px; border-radius: 0; display: inline-flex; align-items: center; justify-content: center; border: 1px solid transparent; }',
    '.UrlBar-AddressField .OmniDropdown .search-engines-in-address-bar button:hover { background-color: var(--colorFgAlpha); }',
    '.UrlBar-AddressField .OmniDropdown .search-engines-in-address-bar button.active { background: var(--colorBgIntense); border-left-color: var(--colorBorder); border-right-color: var(--colorBorder); border-top-color: var(--colorBorder); }',
    '.UrlBar-AddressField .OmniDropdown .search-engines-in-address-bar button.disabled { pointer-events: none; }',
    '.UrlBar-AddressField .OmniDropdown .search-engines-in-address-bar button:first-child { border-left-color: transparent; }'
  ], 'search-engines-in-address-bar');

  const settings = {
    oneClick: false,
    searchEngines: {
      default: undefined,
      defaultPrivate: undefined,
      engines: {}
    },
  };

  const pattern = {
    searchEngines: undefined
  };

  let searchEngineButtons;

  let reactPropsKey;

  function createPatternSearchEngines(searchEngineCollection) {
    settings.searchEngines = {
      default: undefined,
      defaultPrivate: undefined,
      engines: {}
    };
    pattern.searchEngines = undefined;
    if (searchEngineCollection.length > 0) {
      const regKeywords = [];
      searchEngineCollection.forEach(function (engine) {
        settings.searchEngines.engines[engine.keyword] = engine;
        regKeywords.push(gnoh.encode.regex(engine.keyword));
      });

      pattern.searchEngines = new RegExp('^(' + regKeywords.join('|') + ')\\s(.*)', 'i');
    }
  }

  vivaldi.searchEngines.getTemplateUrls().then(function (res) {
    createPatternSearchEngines(res.templateUrls);
  });

  vivaldi.searchEngines.onTemplateUrlsChanged.addListener(function () {
    vivaldi.searchEngines.getTemplateUrls().then(function (res) {
      createPatternSearchEngines(res.templateUrls);
    });
  });

  function createSearchEnginesInAddressBar(omniDropdown) {
    const searchEnginesInAddressBar = gnoh.createElement('div', {
      class: 'search-engines-in-address-bar'
    }, omniDropdown, null, {
      isPrepend: true
    });

    const addressfieldEl = document.querySelector('input[type="text"].url.vivaldi-addressfield');

    searchEngineButtons = [];

    Object.values(settings.searchEngines.engines).forEach(function (engine) {
      const searchEngineButton = gnoh.createElement('button', {
        class: 'search-engine-button',
        title: engine.keyword + ' : ' + engine.name,
        events: {
          mousedown: function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (!addressfieldEl) {
              return;
            }
            const match = addressfieldEl.value.match(pattern.searchEngines);
            let value = '';
            if (match) {
              if (match[1] === engine.keyword && !settings.oneClick) {
                return;
              }
              value = engine.keyword + ' ' + match[2];
            } else {
              value = engine.keyword + ' ' + addressfieldEl.value;
            }
            if (settings.oneClick) {
              gnoh.observeDOM(addressfieldEl, function (mutations, observer) {
                addressfieldEl[reactPropsKey].onKeyDown(new KeyboardEvent('keydown', { key: 'Enter', metaKey: true }));
                observer.disconnect();
              }, {
                attributeFilter: ['value']
              });
              addressfieldEl[reactPropsKey].onChange({ currentTarget: { value: value } });
            } else {
              addressfieldEl[reactPropsKey].onChange({ currentTarget: { value: value } });
              setActiveSearchEngineButton(engine.keyword);
            }
          }
        }
      }, searchEnginesInAddressBar);
      const icon = engine.faviconUrl.startsWith('data:image') ? engine.faviconUrl : 'chrome://favicon/size/16@1x/iconurl/' + engine.faviconUrl + ' 1x,chrome://favicon/size/16@2x/iconurl/' + engine.faviconUrl + ' 2x';
      const searchEngineIcon = gnoh.createElement('img', {
        class: 'search-engine-icon',
        srcset: icon,
        width: 16,
        height: 16
      }, searchEngineButton);
      searchEngineButtons.push({
        keyword: engine.keyword,
        element: searchEngineButton
      });
    });

    const removeSearchEngineButton = gnoh.createElement('button', {
      class: 'remove-search-engine-button',
      events: {
        mousedown: function (event) {
          event.preventDefault();
          event.stopPropagation();
          if (!addressfieldEl) {
            return;
          }
          const match = addressfieldEl.value.match(pattern.searchEngines);
          let value = '';
          if (match) {
            value = match[2];
            addressfieldEl[reactPropsKey].onChange({ currentTarget: { value: value } });
          }
          setActiveSearchEngineButton('');
        }
      }
    }, searchEnginesInAddressBar, '<svg style="width:16px; height:16px" viewBox="0 0 24 24"><path fill="currentColor" d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z"/></svg>');

    searchEngineButtons.push({
      keyword: '',
      element: removeSearchEngineButton
    });

    const match = addressfieldEl.value.match(pattern.searchEngines);
    setActiveSearchEngineButton(match ? match[1] : '');

    if (!addressfieldEl.dataset.searchEnginesInAddressBar) {
      addressfieldEl.dataset.searchEnginesInAddressBar = '';

      const valueSetter = Object.getOwnPropertyDescriptor(addressfieldEl, 'value').set;
      const prototype = Object.getPrototypeOf(addressfieldEl);
      const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;

      Object.defineProperty(addressfieldEl, 'value', {
        set: function (value) {
          const match = value.match(pattern.searchEngines);
          setActiveSearchEngineButton(match ? match[1] : '');

          if (valueSetter && valueSetter !== prototypeValueSetter) {
            prototypeValueSetter.apply(this, arguments);
          } else {
            valueSetter.apply(this, arguments);
          }
        }
      });
    }
  }

  function setActiveSearchEngineButton(keyword) {
    searchEngineButtons.forEach(function (seb) {
      if (seb.keyword === keyword) {
        seb.element.classList.add('active');
        if (!settings.oneClick) {
          seb.element.classList.add('disabled');
        }
      } else {
        seb.element.classList.remove('active');
        if (!settings.oneClick) {
          seb.element.classList.remove('disabled');
        }
      }
    });
  }

  gnoh.override(HTMLDivElement.prototype, 'appendChild', function (element) {
    reactPropsKey = gnoh.getReactPropsKey(this);
    if (this[reactPropsKey] && this[reactPropsKey].className === 'observer' && element[reactPropsKey] && element[reactPropsKey].className.indexOf('OmniDropdown') > -1) {
      createSearchEnginesInAddressBar(element)
    }
  });
})();
