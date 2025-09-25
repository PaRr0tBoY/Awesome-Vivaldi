/*
 * Global Media Controls Panel
 * Written by Tam710562
 */

(() => {
  'use strict';

  const gnoh = {
    i18n: {
      getMessageName(message, type) {
        message = (type ? type + '\x04' : '') + message;
        return message.replace(/[^a-z0-9]/g, (i) => '_' + i.codePointAt(0) + '_') + '0';
      },
      getMessage(message, type) {
        return chrome.i18n.getMessage(this.getMessageName(message, type)) || message;
      },
    },
    createElement(tagName, attribute, parent, inner, options) {
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
      if (inner) {
        if (!Array.isArray(inner)) {
          inner = [inner];
        }
        for (const element of inner) {
          if (element.nodeName) {
            el.append(element);
          } else {
            el.append(this.createElementFromHTML(element));
          }
        }
      }
      if (typeof parent === 'string') {
        parent = document.querySelector(parent);
      }
      if (parent) {
        if (options.isPrepend) {
          parent.prepend(el);
        } else {
          parent.append(el);
        }
      }
      return el;
    },
    createElementFromHTML(html) {
      return this.createElement('template', {
        html: (html || '').trim(),
      }).content;
    },
    color: {
      rgbToHex(r, g, b) {
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
      },
      rgb2lab(rgb) {
        let r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255, x, y, z;
        r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
        g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
        b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
        x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
        y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
        z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
        x = (x > 0.008856) ? Math.pow(x, 1 / 3) : (7.787 * x) + 16 / 116;
        y = (y > 0.008856) ? Math.pow(y, 1 / 3) : (7.787 * y) + 16 / 116;
        z = (z > 0.008856) ? Math.pow(z, 1 / 3) : (7.787 * z) + 16 / 116;
        return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
      },
      deltaE(rgbA, rgbB) {
        const labA = this.rgb2lab(rgbA);
        const labB = this.rgb2lab(rgbB);
        const deltaL = labA[0] - labB[0];
        const deltaA = labA[1] - labB[1];
        const deltaB = labA[2] - labB[2];
        const c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
        const c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
        const deltaC = c1 - c2;
        let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
        deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
        const sc = 1.0 + 0.045 * c1;
        const sh = 1.0 + 0.015 * c1;
        const deltaLKlsl = deltaL / (1.0);
        const deltaCkcsc = deltaC / (sc);
        const deltaHkhsh = deltaH / (sh);
        const i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
        return i < 0 ? 0 : Math.sqrt(i);
      },
      getLuminance(r, g, b) {
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      },
      isLight(r, g, b) {
        return this.getLuminance(r, g, b) < 156;
      },
      shadeColor(r, g, b, percent) {
        const t = percent < 0 ? 0 : 255 * percent;
        const p = percent < 0 ? 1 + percent : 1 - percent;
        return {
          r: Math.round(parseInt(r) * p + t),
          g: Math.round(parseInt(g) * p + t),
          b: Math.round(parseInt(b) * p + t),
        };
      },
    },
    element: {
      appendAtIndex(element, parentElement, index) {
        if (index >= parentElement.children.length) {
          parentElement.append(element)
        } else {
          parentElement.insertBefore(element, parentElement.children[index])
        }
      },
    },
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
    string: {
      removeDiacritics(str) {
        if (!this._diacriticsMap) {
          const defaultDiacriticsRemovalMap = [
            { 'base': 'A', 'letters': '\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F' },
            { 'base': 'AA', 'letters': '\uA732' },
            { 'base': 'AE', 'letters': '\u00C6\u01FC\u01E2' },
            { 'base': 'AO', 'letters': '\uA734' },
            { 'base': 'AU', 'letters': '\uA736' },
            { 'base': 'AV', 'letters': '\uA738\uA73A' },
            { 'base': 'AY', 'letters': '\uA73C' },
            { 'base': 'B', 'letters': '\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181' },
            { 'base': 'C', 'letters': '\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E' },
            { 'base': 'D', 'letters': '\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779\u00D0' },
            { 'base': 'DZ', 'letters': '\u01F1\u01C4' },
            { 'base': 'Dz', 'letters': '\u01F2\u01C5' },
            { 'base': 'E', 'letters': '\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E' },
            { 'base': 'F', 'letters': '\u0046\u24BB\uFF26\u1E1E\u0191\uA77B' },
            { 'base': 'G', 'letters': '\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E' },
            { 'base': 'H', 'letters': '\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D' },
            { 'base': 'I', 'letters': '\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197' },
            { 'base': 'J', 'letters': '\u004A\u24BF\uFF2A\u0134\u0248' },
            { 'base': 'K', 'letters': '\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2' },
            { 'base': 'L', 'letters': '\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780' },
            { 'base': 'LJ', 'letters': '\u01C7' },
            { 'base': 'Lj', 'letters': '\u01C8' },
            { 'base': 'M', 'letters': '\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C' },
            { 'base': 'N', 'letters': '\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4' },
            { 'base': 'NJ', 'letters': '\u01CA' },
            { 'base': 'Nj', 'letters': '\u01CB' },
            { 'base': 'O', 'letters': '\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C' },
            { 'base': 'OI', 'letters': '\u01A2' },
            { 'base': 'OO', 'letters': '\uA74E' },
            { 'base': 'OU', 'letters': '\u0222' },
            { 'base': 'OE', 'letters': '\u008C\u0152' },
            { 'base': 'oe', 'letters': '\u009C\u0153' },
            { 'base': 'P', 'letters': '\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754' },
            { 'base': 'Q', 'letters': '\u0051\u24C6\uFF31\uA756\uA758\u024A' },
            { 'base': 'R', 'letters': '\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782' },
            { 'base': 'S', 'letters': '\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784' },
            { 'base': 'T', 'letters': '\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786' },
            { 'base': 'TZ', 'letters': '\uA728' },
            { 'base': 'U', 'letters': '\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244' },
            { 'base': 'V', 'letters': '\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245' },
            { 'base': 'VY', 'letters': '\uA760' },
            { 'base': 'W', 'letters': '\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72' },
            { 'base': 'X', 'letters': '\u0058\u24CD\uFF38\u1E8A\u1E8C' },
            { 'base': 'Y', 'letters': '\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE' },
            { 'base': 'Z', 'letters': '\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762' },
            { 'base': 'a', 'letters': '\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250' },
            { 'base': 'aa', 'letters': '\uA733' },
            { 'base': 'ae', 'letters': '\u00E6\u01FD\u01E3' },
            { 'base': 'ao', 'letters': '\uA735' },
            { 'base': 'au', 'letters': '\uA737' },
            { 'base': 'av', 'letters': '\uA739\uA73B' },
            { 'base': 'ay', 'letters': '\uA73D' },
            { 'base': 'b', 'letters': '\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253' },
            { 'base': 'c', 'letters': '\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184' },
            { 'base': 'd', 'letters': '\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A' },
            { 'base': 'dz', 'letters': '\u01F3\u01C6' },
            { 'base': 'e', 'letters': '\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD' },
            { 'base': 'f', 'letters': '\u0066\u24D5\uFF46\u1E1F\u0192\uA77C' },
            { 'base': 'g', 'letters': '\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F' },
            { 'base': 'h', 'letters': '\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265' },
            { 'base': 'hv', 'letters': '\u0195' },
            { 'base': 'i', 'letters': '\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131' },
            { 'base': 'j', 'letters': '\u006A\u24D9\uFF4A\u0135\u01F0\u0249' },
            { 'base': 'k', 'letters': '\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3' },
            { 'base': 'l', 'letters': '\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747' },
            { 'base': 'lj', 'letters': '\u01C9' },
            { 'base': 'm', 'letters': '\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F' },
            { 'base': 'n', 'letters': '\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5' },
            { 'base': 'nj', 'letters': '\u01CC' },
            { 'base': 'o', 'letters': '\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275' },
            { 'base': 'oi', 'letters': '\u01A3' },
            { 'base': 'ou', 'letters': '\u0223' },
            { 'base': 'oo', 'letters': '\uA74F' },
            { 'base': 'p', 'letters': '\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755' },
            { 'base': 'q', 'letters': '\u0071\u24E0\uFF51\u024B\uA757\uA759' },
            { 'base': 'r', 'letters': '\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783' },
            { 'base': 's', 'letters': '\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B' },
            { 'base': 't', 'letters': '\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787' },
            { 'base': 'tz', 'letters': '\uA729' },
            { 'base': 'u', 'letters': '\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289' },
            { 'base': 'v', 'letters': '\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C' },
            { 'base': 'vy', 'letters': '\uA761' },
            { 'base': 'w', 'letters': '\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73' },
            { 'base': 'x', 'letters': '\u0078\u24E7\uFF58\u1E8B\u1E8D' },
            { 'base': 'y', 'letters': '\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF' },
            { 'base': 'z', 'letters': '\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763' }
          ];

          this._diacriticsMap = {};

          for (const diacritic of defaultDiacriticsRemovalMap) {
            for (const letter of diacritic.letters) {
              this._diacriticsMap[letter] = diacritic.base;
            }
          }
        }

        return str.replace(/[^\u0000-\u007E]/g, (a) => {
          return this._diacriticsMap[a] || a;
        });
      },
    },
    addStyle(css, id, isNotMin) {
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
    timeOut(callback, condition, timeOut = 300) {
      let timeOutId = setTimeout(function wait() {
        let result;
        if (!condition) {
          result = document.getElementById('browser');
        } else if (typeof condition === 'string') {
          result = document.querySelector(condition);
        } else if (typeof condition === 'function') {
          result = condition();
        } else {
          return;
        }
        if (result) {
          callback(result);
        } else {
          timeOutId = setTimeout(wait, timeOut);
        }
      }, timeOut);

      function stop() {
        if (timeOutId) {
          clearTimeout(timeOutId);
        }
      }

      return {
        stop,
      };
    },
    observeDOM(obj, callback, config) {
      const obs = new MutationObserver((mutations, observer) => {
        if (config || (mutations[0].addedNodes.length || mutations[0].removedNodes.length)) {
          callback(mutations, observer);
        }
      });
      obs.observe(obj, config || {
        childList: true,
        subtree: true,
      });
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

  const tabs = {};

  const name = 'Global Media Controls';
  const messageType = 'global-media-controls';
  const nameAttribute = 'global-media-controls';
  const code = 'data:text/html,' + encodeURIComponent('<title>' + name + '</title>');
  const webPanelId = 'WEBPANEL_c650d566-8020-4841-8a5d-1555b86da114';
  const colorLoaded = {};
  const buttonBadges = [];
  let dragSource = null;
  let lucidModeVideo = false;

  const langs = {
    search: gnoh.i18n.getMessage('Search', 'verb'),
    closePanel: gnoh.i18n.getMessage('Close Panel'),
  };

  const icons = {
    playlistMusic: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M12 13c0 1.105-1.12 2-2.5 2S7 14.105 7 13s1.12-2 2.5-2s2.5.895 2.5 2z"/><path fill-rule="evenodd" d="M12 3v10h-1V3h1z"/><path d="M11 2.82a1 1 0 0 1 .804-.98l3-.6A1 1 0 0 1 16 2.22V4l-5 1V2.82z"/><path fill-rule="evenodd" d="M0 11.5a.5.5 0 0 1 .5-.5H4a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5zm0-4A.5.5 0 0 1 .5 7H8a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5zm0-4A.5.5 0 0 1 .5 3H8a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5z"/></svg>',
    play: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z"/></svg>',
    pause: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M14,19H18V5H14M6,19H10V5H6V19Z"/></svg>',
    close: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/></svg>',
    closePanel: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><path d="m12.5 5-1.4-1.4-3.1 3-3.1-3L3.5 5l3.1 3.1-3 2.9 1.5 1.4L8 9.5l2.9 2.9 1.5-1.4-3-2.9"/></svg>',
    pictureInPicture: {
      off: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M19,11H11V17H19V11M17,15H13V13H17V15M21,3H3A2,2 0 0,0 1,5V19A2,2 0 0,0 3,21H21A2,2 0 0,0 23,19V5C23,3.88 22.1,3 21,3M21,19H3V4.97H21V19Z"/></svg>',
      on: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M19,11H11V17H19V11M23,19V5C23,3.88 22.1,3 21,3H3A2,2 0 0,0 1,5V19A2,2 0 0,0 3,21H21A2,2 0 0,0 23,19M21,19H3V4.97H21V19Z"/></svg>'
    },
    tab: {
      on: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M21,3H3A2,2 0 0,0 1,5V19A2,2 0 0,0 3,21H21A2,2 0 0,0 23,19V5A2,2 0 0,0 21,3M21,19H3V5H13V9H21V19Z"/></svg>',
      off: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M1,9H3V7H1V9M1,13H3V11H1V13M1,5H3V3A2,2 0 0,0 1,5M9,21H11V19H9V21M1,17H3V15H1V17M3,21V19H1A2,2 0 0,0 3,21M21,3H13V9H23V5A2,2 0 0,0 21,3M21,17H23V15H21V17M9,5H11V3H9V5M5,21H7V19H5V21M5,5H7V3H5V5M21,21A2,2 0 0,0 23,19H21V21M21,13H23V11H21V13M13,21H15V19H13V21M17,21H19V19H17V21Z"/></svg>'
    },
    volume: {
      high: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z"/></svg>',
      medium: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M5,9V15H9L14,20V4L9,9M18.5,12C18.5,10.23 17.5,8.71 16,7.97V16C17.5,15.29 18.5,13.76 18.5,12Z"/></svg>',
      off: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12,4L9.91,6.09L12,8.18M4.27,3L3,4.27L7.73,9H3V15H7L12,20V13.27L16.25,17.53C15.58,18.04 14.83,18.46 14,18.7V20.77C15.38,20.45 16.63,19.82 17.68,18.96L19.73,21L21,19.73L12,10.73M19,12C19,12.94 18.8,13.82 18.46,14.64L19.97,16.15C20.62,14.91 21,13.5 21,12C21,7.72 18,4.14 14,3.23V5.29C16.89,6.15 19,8.83 19,12M16.5,12C16.5,10.23 15.5,8.71 14,7.97V10.18L16.45,12.63C16.5,12.43 16.5,12.21 16.5,12Z"/></svg>'
    },
    lucidModeVideo: {
      on: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M19,1L17.74,3.75L15,5L17.74,6.26L19,9L20.25,6.26L23,5L20.25,3.75M9,4L6.5,9.5L1,12L6.5,14.5L9,20L11.5,14.5L17,12L11.5,9.5M19,15L17.74,17.74L15,19L17.74,20.25L19,23L20.25,20.25L23,19L20.25,17.74"/></svg>',
      off: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M9 4L11.5 9.5L17 12L11.5 14.5L9 20L6.5 14.5L1 12L6.5 9.5L9 4M9 8.83L8 11L5.83 12L8 13L9 15.17L10 13L12.17 12L10 11L9 8.83M19 9L17.74 6.26L15 5L17.74 3.75L19 1L20.25 3.75L23 5L20.25 6.26L19 9M19 23L17.74 20.26L15 19L17.74 17.75L19 15L20.25 17.75L23 19L20.25 20.26L19 23Z"/></svg>',
    },
    sidebar: {
      left: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M20 4H4A2 2 0 0 0 2 6V18A2 2 0 0 0 4 20H20A2 2 0 0 0 22 18V6A2 2 0 0 0 20 4M20 18H9V6H20Z"/></svg>',
      right: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M20 4H4A2 2 0 0 0 2 6V18A2 2 0 0 0 4 20H20A2 2 0 0 0 22 18V6A2 2 0 0 0 20 4M15 18H4V6H15Z"/></svg>',
    },
  };

  icons.dataURLs = {
    playlistMusic: 'data:image/svg+xml, ' + icons.playlistMusic,
  };

  const buttons = {
    pause: {
      icon: icons.pause,
      disabled: true,
      click(event) {
        event.preventDefault();
        for (const key in tabs) {
          const tab = tabs[key];
          if (!tab.paused) {
            tab.buttonControl.click();
          }
        }
      }
    },
    volume: {
      icon: icons.volume.high,
      disabled: true,
      muted: false,
      click(event) {
        event.preventDefault();
        for (const key in tabs) {
          const tab = tabs[key];
          if (buttons.volume.muted) {
            if (tab.muted || tab.volume === 0) {
              tab.buttonVolume.click();
            }
          } else if (!tab.muted && tab.volume !== 0) {
            tab.buttonVolume.click();
          }
        }
      }
    },
    lucidModeVideo: {
      icon: icons.lucidModeVideo.off,
      disabled: true,
      click(event) {
        event.preventDefault();
        lucidModeVideo = !lucidModeVideo;
        chrome.storage.local.set({
          LUCID_MODE_VIDEO: lucidModeVideo,
        });
      }
    }
  };

  const panelContent = gnoh.createElement('div', {
    class: 'global-media-controls-content'
  });

  function inject(messageType) {
    if (window.globalMediaControls) {
      return;
    } else {
      window.globalMediaControls = true;
    }

    chrome.runtime.onMessage.addListener((info, sender, sendResponse) => {
      if (info.type === messageType) {
        function awaitSendResponse(event) {
          if (
            event?.data
            && event.data.type === messageType + '-internal'
            && event.data.data && event.data.data.action === info.action + '-end'
          ) {
            window.removeEventListener('message', awaitSendResponse);
            if (event.data.data.hasSendResponse) {
              sendResponse();
            }
          }
        }
        window.addEventListener('message', awaitSendResponse);
        window.postMessage({
          type: messageType + '-internal',
          data: info,
        });
        return true;
      }
    });

    window.addEventListener('message', (event) => {
      if (event?.data && event.data.type === messageType) {
        chrome.runtime.sendMessage(event.data.data);
      }
    });
  }

  function injectMain(messageType, nameAttribute) {
    if (window.globalMediaControlsMain) {
      return;
    } else {
      window.globalMediaControlsMain = true;
    }
    let currentVideo;

    const playVideoOriginal = HTMLVideoElement.prototype.play;
    HTMLVideoElement.prototype.play = function () {
      if (!this.globalMediaControls) {
        addEventListeners(this);
      }
      return playVideoOriginal.apply(this, arguments);
    };

    const playAudioOriginal = HTMLAudioElement.prototype.play;
    HTMLAudioElement.prototype.play = function () {
      if (!this.globalMediaControls) {
        addEventListeners(this);
      }
      return playAudioOriginal.apply(this, arguments);
    };

    const addEventListenerVideoOriginal = HTMLVideoElement.prototype.addEventListener;
    HTMLVideoElement.prototype.addEventListener = function () {
      if (!this.globalMediaControls) {
        addEventListeners(this);
      }
      return addEventListenerVideoOriginal.apply(this, arguments);
    };

    const addEventListenerAudioOriginal = HTMLAudioElement.prototype.addEventListener;
    HTMLAudioElement.prototype.addEventListener = function () {
      if (!this.globalMediaControls) {
        addEventListeners(this);
      }
      addEventListenerAudioOriginal.apply(this, arguments);
    };

    window.addEventListener('message', (event) => {
      if (
        !event?.data
        || event.data.type !== messageType + '-internal'
        || !event.data.data?.action
        || event.data.data.action.endsWith('-end')
      ) {
        return;
      }

      const info = event.data.data;
      let hasSendResponse = false;

      switch (info.action) {
        case 'play':
        case 'pause':
          if (currentVideo) {
            currentVideo[info.action]();
          }
          break;
        case 'muted':
          if (currentVideo) {
            if (currentVideo.volume === 0) {
              currentVideo[info.action] = false;
              currentVideo.volume = 1;
            } else {
              currentVideo[info.action] = !currentVideo[info.action];
            }
          }
          break;
        case 'volume':
          if (currentVideo) {
            currentVideo[info.action] = info.volume;
            currentVideo.muted = false;
          }
          break;
        case 'picture-in-picture':
          if (document.pictureInPictureEnabled) {
            if (document.pictureInPictureElement) {
              document.exitPictureInPicture();
            } else if (
              currentVideo
              && !currentVideo.disablePictureInPicture
              && currentVideo.webkitAudioDecodedByteCount
              && currentVideo.webkitVideoDecodedByteCount
            ) {
              currentVideo.requestPictureInPicture();
            }
          }
          break;
        case 'scroll-into-view':
          if (currentVideo) {
            if (info.frameId !== 0) {
              document.documentElement.scrollIntoView({
                behavior: 'auto',
                block: 'center',
                inline: 'center',
              });
            }
            currentVideo.scrollIntoView({
              behavior: 'auto',
              block: 'center',
              inline: 'center',
            });
            if (document.pictureInPictureEnabled && document.pictureInPictureElement) {
              document.exitPictureInPicture();
            }
          }
          break;
        case 'close':
          if (document.pictureInPictureEnabled && document.pictureInPictureElement) {
            document.exitPictureInPicture();
          }
          currentVideo.setAttribute(nameAttribute, '');
          currentVideo.removeEventListener('pause', pauseVideo);
          currentVideo.addEventListener('pause', () => {
            currentVideo.addEventListener('pause', pauseVideo);
            currentVideo = null;
          }, { once: true });
          currentVideo.pause();
          hasSendResponse = true;
          break;
      }
      event.source.postMessage({
        type: messageType + '-internal',
        data: {
          action: info.action + '-end',
          hasSendResponse,
        }
      });
    });

    function isPlaying(video) {
      return !video.paused && !video.ended && video.webkitAudioDecodedByteCount && video.getAttribute(nameAttribute);
    }

    function getImage(video) {
      let image = null;
      if (video.poster) {
        image = video.poster;
      } else if (navigator.mediaSession.metadata?.artwork?.[0]) {
        image = navigator.mediaSession.metadata.artwork[0].src;
      }
      return image;
    }

    function getTitle() {
      let title = null;
      if (navigator.mediaSession.metadata?.title) {
        title = navigator.mediaSession.metadata.title;
      }
      return title;
    }

    function getArtist() {
      let artist = null;
      if (navigator.mediaSession.metadata?.artist) {
        artist = navigator.mediaSession.metadata.artist;
      }
      return artist;
    }

    function hasVideoPlaying() {
      return Array.from(document.querySelectorAll('video, audio')).find((video) => isPlaying(video));
    }

    function getDataControl(video) {
      return {
        type: messageType,
        image: getImage(video),
        title: getTitle(),
        artist: getArtist(),
        paused: video.paused,
        audio: !video.webkitVideoDecodedByteCount || video.disablePictureInPicture,
        pictureInPicture: !!document.pictureInPictureElement,
        volume: video.volume,
        muted: video.muted,
        duration: video.duration,
        currentTime: video.currentTime,
      };
    }

    function timeupdateVideo(event) {
      let enable = event.target.getAttribute(nameAttribute);
      if (!event.target.muted) {
        enable = 'on';
        event.target.setAttribute(nameAttribute, enable);
      }
      if (enable) {
        if (event.target.paused && !event.target.webkitAudioDecodedByteCount && !event.target.webkitVideoDecodedByteCount) {
          endedVideo(event);
        } else if (!event.target.paused) {
          currentVideo = event.target;
          window.postMessage({
            type: messageType,
            data: getDataControl(currentVideo),
            eventType: event.type,
          });
        }
      }
    }

    function pauseVideo(event) {
      const enable = event.target.getAttribute(nameAttribute);
      if (enable) {
        if (!event.target.webkitAudioDecodedByteCount && !event.target.webkitVideoDecodedByteCount) {
          endedVideo(event);
        } else if (!hasVideoPlaying()) {
          currentVideo = event.target;
          window.postMessage({
            type: messageType,
            data: getDataControl(currentVideo),
            eventType: event.type,
          });
        }
      }
    }

    function volumechangeVideo(event) {
      if (currentVideo === event.target) {
        window.postMessage({
          type: messageType,
          data: getDataControl(currentVideo),
          eventType: event.type,
        });
      }
    }

    function endedVideo(event) {
      const enable = event.target.getAttribute(nameAttribute);
      if (enable) {
        if (!hasVideoPlaying()) {
          currentVideo = null;
          window.postMessage({
            type: messageType,
            data: {
              type: messageType,
              ended: true,
            },
            eventType: event.type,
          });
        }
      }
    }

    function enterpictureinpictureVideo(event) {
      if (currentVideo === event.target) {
        window.postMessage({
          type: messageType,
          data: getDataControl(currentVideo),
          eventType: event.type,
        });
      }
    }

    function leavepictureinpictureVideo(event) {
      if (currentVideo === event.target) {
        window.postMessage({
          type: messageType,
          data: getDataControl(currentVideo),
          eventType: event.type,
        });
      }
    }

    function addEventListeners(video) {
      if (video.globalMediaControls) {
        return;
      } else {
        video.globalMediaControls = true;
      }

      video.setAttribute(nameAttribute, '');
      addEventListenerAudioOriginal.apply(video, ['play', timeupdateVideo]);
      addEventListenerAudioOriginal.apply(video, ['timeupdate', timeupdateVideo]);
      addEventListenerAudioOriginal.apply(video, ['volumechange', volumechangeVideo]);
      addEventListenerAudioOriginal.apply(video, ['playing', timeupdateVideo]);
      addEventListenerAudioOriginal.apply(video, ['pause', pauseVideo]);
      addEventListenerAudioOriginal.apply(video, ['ended', endedVideo]);
      addEventListenerAudioOriginal.apply(video, ['error', endedVideo]);
      addEventListenerAudioOriginal.apply(video, ['enterpictureinpicture', enterpictureinpictureVideo]);
      addEventListenerAudioOriginal.apply(video, ['leavepictureinpicture', leavepictureinpictureVideo]);
    }

    function observeDOM(obj, callback) {
      const obs = new MutationObserver((mutations, observer) => {
        if (mutations[0].addedNodes.length || mutations[0].removedNodes.length) {
          callback(mutations, observer);
        }
      });
      obs.observe(obj, {
        childList: true,
        subtree: true,
      });
    }

    function injectVideo() {
      const videos = document.querySelectorAll('video:not([global-media-controls]), audio:not([global-media-controls])');

      videos.forEach((video) => {
        addEventListeners(video);
      });
    }

    injectVideo();
    observeDOM(document, () => injectVideo());
  }

  function syncData(keyStorage) {
    chrome.storage.local.get(keyStorage, (result) => {
      for (const key in result[keyStorage]) {
        if (!tabs[key]) {
          createItem(result[keyStorage][key], result[keyStorage][key]);
        }
      }
    });
  }

  function resizeCrop(image, width, height, itemInfo, canvas) {
    const crop = width === 0 || height === 0;
    const hasCanvas = !!canvas;

    // not resize
    if (image.width <= width && height === 0) {
      width = image.width;
      height = image.height;
    }
    // resize
    if (image.width > width && height === 0) {
      height = image.height * (width / image.width);
    }

    // check scale
    const xScale = width / image.width;
    const yScale = height / image.height;
    const scale = crop ? Math.min(xScale, yScale) : Math.max(xScale, yScale);
    // create empty canvas
    canvas = hasCanvas ? canvas : gnoh.createElement('canvas');
    canvas.width = width || Math.round(image.width * scale);
    canvas.height = height || Math.round(image.height * scale);
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    // crop it top center
    ctx.drawImage(image, (canvas.width - (image.width * scale)) * 0.5, (canvas.height - (image.height * scale)) * 0.5);

    if (!colorLoaded[image.src]) {
      const data = ctx.getImageData(0, 0, width, height).data;
      const blockSize = hasCanvas ? canvas.width : 6;
      const colors = {};

      let i = 0;
      const length = data.length;

      while (i < length) {
        const rgb = {
          r: data[i],
          g: data[i + 1],
          b: data[i + 2],
          a: data[i + 3],
        };
        i += blockSize * 4;
        if (rgb.a < 255) {
          continue;
        }

        let colorKey = Object.keys(colors).find(c => {
          const [r, g, b] = c.split(',');
          return gnoh.color.deltaE(rgb, { r: +r, g: +g, b: +b }) <= 2;
        })
        if (!colorKey) {
          colorKey = [rgb.r, rgb.g, rgb.b].join(',');
          colors[colorKey] = {
            rgb,
            count: 0
          };
        }
        colors[colorKey].count++;
      }

      const entryColors = Object.entries(colors).sort((a, b) => b[1].count - a[1].count);
      let filterEntryColors = entryColors.filter((entryColor) => {
        const luminance = gnoh.color.getLuminance(entryColor[1].rgb.r, entryColor[1].rgb.g, entryColor[1].rgb.b);
        return luminance >= 30 && luminance <= 200;
      });

      let rgbMax = {
        r: 0,
        g: 0,
        b: 0,
      };
      if (filterEntryColors.length > 0) {
        rgbMax = filterEntryColors[0][1].rgb;
      } else {
        filterEntryColors = entryColors.filter((entryColor) => {
          const [r, g, b] = entryColor[0].split(',');
          return gnoh.color.deltaE({ r: 0, g: 0, b: 0 }, { r: +r, g: +g, b: +b }) > 2
            && gnoh.color.deltaE({ r: 255, g: 255, b: 255 }, { r: +r, g: +g, b: +b }) > 2;
        });
        if (filterEntryColors.length > 0) {
          rgbMax = filterEntryColors[0][1].rgb;
        } else if (entryColors.length > 0) {
          rgbMax = entryColors[0][1].rgb;
        }
      }

      const isLightBg = gnoh.color.isLight(rgbMax.r, rgbMax.g, rgbMax.b);
      const rgbProgressBar = gnoh.color.shadeColor(rgbMax.r, rgbMax.g, rgbMax.b, isLightBg ? 0.4 : -0.4);

      colorLoaded[image.src] = {
        backgroundColor: gnoh.color.rgbToHex(rgbMax.r, rgbMax.g, rgbMax.b),
        color: isLightBg ? '#f6f6f6' : '#111111',
        progressBarBackgroundColor: gnoh.color.rgbToHex(rgbProgressBar.r, rgbProgressBar.g, rgbProgressBar.b),
      };
    }

    itemInfo.isLight = colorLoaded[image.src].isLight;
    itemInfo.backgroundColor = colorLoaded[image.src].backgroundColor;
    itemInfo.color = colorLoaded[image.src].color;
    itemInfo.item.style.setProperty('--colorGMCBg', colorLoaded[image.src].backgroundColor);
    itemInfo.item.style.setProperty('--colorGMCFg', colorLoaded[image.src].color);
    itemInfo.item.style.setProperty('--colorGMCProgressBarBg', colorLoaded[image.src].progressBarBackgroundColor);

    return canvas;
  }

  function toHHMMSS(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [
      h,
      m > 9 ? m : (h ? '0' + m : m || '0'),
      s > 9 ? s : '0' + s,
    ].filter(Boolean).join(':');
  }

  function createItem(tab, info) {
    const itemInfo = {
      tabId: tab.id || tab.tabId,
      frameId: info.frameId,
      windowId: tab.windowId,
      webPanelId: tab.vivExtData?.panelId?.split('_').slice(0, 2).join('_'),
      setTitle(title) {
        if (title != null && itemInfo.title !== title) {
          itemInfo.title = title;
          itemInfo.titleItem.title = itemInfo.title;
          itemInfo.titleItem.textContent = itemInfo.title;
        }
      },
      setArtist(artist) {
        if (artist != null && itemInfo.artist !== artist) {
          itemInfo.artist = artist;
          itemInfo.domainItem.textContent = itemInfo.artist;
        }
      },
      setUrl(url) {
        if (url == null || url === itemInfo.url) {
          return;
        }
        itemInfo.url = url;
        const urlObject = new URL(url);
        itemInfo.hostname = urlObject.hostname;
        itemInfo.defaultImage = 'chrome://favicon/' + urlObject.origin;
        if (itemInfo.artist == null) {
          itemInfo.domainItem.textContent = itemInfo.hostname;
        }
      },
      setImage(src) {
        if (itemInfo.image !== undefined && (src == null || src === itemInfo.image)) {
          return;
        }
        itemInfo.image = src;
        gnoh.createElement('img', {
          src: itemInfo.image || itemInfo.defaultImage,
          crossOrigin: 'Anonymous',
          events: {
            load(e) {
              if (e.target.src === itemInfo.defaultImage) {
                itemInfo.hasImage = false;
                resizeCrop(e.target, 100, 100, itemInfo);
              } else {
                itemInfo.hasImage = true;
                itemInfo.imageItem.style.display = '';
                resizeCrop(e.target, 100, 100, itemInfo, itemInfo.imageItem);
              }
            },
            error(e) {
              if (e.target.src !== itemInfo.defaultImage) {
                e.target.src = itemInfo.defaultImage;
              }
            }
          }
        });
      },
      setPaused(paused) {
        if (paused != null && itemInfo.paused !== paused) {
          itemInfo.paused = paused;
          itemInfo.buttonControl.innerHTML = itemInfo.paused ? icons.play : icons.pause;
        }
      },
      setPictureInPicture(pictureInPicture) {
        if (pictureInPicture != null && itemInfo.pictureInPicture !== pictureInPicture) {
          itemInfo.pictureInPicture = pictureInPicture;
          itemInfo.buttonPictureInPicture.innerHTML = itemInfo.pictureInPicture ? icons.pictureInPicture.on : icons.pictureInPicture.off;
          if (itemInfo.pictureInPicture) {
            itemInfo.buttonPictureInPicture.classList.add('active');
          } else {
            itemInfo.buttonPictureInPicture.classList.remove('active');
          }
        }
      },
      setActive(active) {
        if (active != null && itemInfo.active !== active) {
          itemInfo.active = active;
          if (itemInfo.webPanelId) {
            itemInfo.buttonTab.innerHTML = icons.sidebar.left;
          } else {
            itemInfo.buttonTab.innerHTML = itemInfo.active ? icons.tab.on : icons.tab.off;
            if (active) {
              itemInfo.buttonTab.classList.add('active');
            } else {
              itemInfo.buttonTab.classList.remove('active');
            }
          }
        }
      },
      setAudio(audio) {
        if (audio != null && itemInfo.audio !== audio) {
          itemInfo.audio = audio;
          if (itemInfo.audio) {
            itemInfo.buttonPictureInPicture.style.display = 'none';
          } else {
            itemInfo.buttonPictureInPicture.style.display = '';
          }
        }
      },
      setVolume(volume) {
        if (volume != null && itemInfo.volume !== volume) {
          itemInfo.volume = volume;
          itemInfo.muted = false;
          if (itemInfo.volume === 0) {
            itemInfo.buttonVolume.innerHTML = icons.volume.off;
            itemInfo.rangeVolume.value = 0;
          } else if (itemInfo.volume <= 0.5) {
            itemInfo.buttonVolume.innerHTML = icons.volume.medium;
            itemInfo.rangeVolume.value = itemInfo.volume;
          } else {
            itemInfo.buttonVolume.innerHTML = icons.volume.high;
            itemInfo.rangeVolume.value = itemInfo.volume;
          }
        }
      },
      setMuted(muted) {
        if (muted != null && itemInfo.muted !== muted) {
          itemInfo.muted = muted;
          if (itemInfo.muted) {
            itemInfo.buttonVolume.innerHTML = icons.volume.off;
            itemInfo.rangeVolume.value = 0;
          } else if (itemInfo.volume === 0) {
            itemInfo.muted = false;
            itemInfo.buttonVolume.innerHTML = icons.volume.high;
            itemInfo.rangeVolume.value = itemInfo.volume;
          } else if (itemInfo.volume <= 0.5) {
            itemInfo.buttonVolume.innerHTML = icons.volume.medium;
            itemInfo.rangeVolume.value = itemInfo.volume;
          } else {
            itemInfo.buttonVolume.innerHTML = icons.volume.high;
            itemInfo.rangeVolume.value = itemInfo.volume;
          }
        }
      },
      setProgress(duration, currentTime) {
        if (duration != null && itemInfo.duration !== duration || currentTime != null && itemInfo.currentTime !== currentTime) {
          itemInfo.duration = duration;
          itemInfo.currentTime = currentTime;
          itemInfo.durationStr = toHHMMSS(itemInfo.duration);
          itemInfo.currentTimeStr = toHHMMSS(itemInfo.currentTime);
          itemInfo.currentTimeDuration.textContent = itemInfo.currentTimeStr + ' / ' + itemInfo.durationStr;
          itemInfo.item.style.setProperty('--colorGMCProgressBarValue', itemInfo.currentTime / itemInfo.duration * 100 + '%');
        }
      },
    };
    itemInfo.domainItem = gnoh.createElement('div', {
      class: 'domain',
    });
    itemInfo.setArtist(info.artist);
    itemInfo.setUrl(tab?.url);
    itemInfo.imageItem = gnoh.createElement('canvas', {
      width: 100,
      height: 100,
      style: {
        display: 'none',
      },
    });
    itemInfo.setImage(info.image);
    itemInfo.buttonClose = gnoh.createElement('button', {
      type: 'button',
      class: 'close-button',
      html: icons.close,
      tabindex: -1,
      draggable: true,
      events: {
        dragstart(e) {
          e.preventDefault();
          e.stopPropagation();
        },
        async click(event) {
          event.preventDefault();
          chrome.tabs.sendMessage(itemInfo.tabId, {
            type: messageType,
            tabId: itemInfo.tabId,
            frameId: itemInfo.frameId,
            action: 'close'
          }, {
            frameId: itemInfo.frameId,
          }, () => {
            deleteItem(itemInfo.tabId);
          });
        },
      },
    });
    itemInfo.titleItem = gnoh.createElement('div', {
      class: 'title',
    });
    itemInfo.setTitle(info.title || tab.title);
    itemInfo.buttonControl = gnoh.createElement('button', {
      type: 'button',
      tabindex: -1,
      draggable: true,
      events: {
        dragstart(e) {
          e.preventDefault();
          e.stopPropagation();
        },
        click(event) {
          event.preventDefault();
          const request = {
            type: messageType,
            tabId: itemInfo.tabId,
            frameId: itemInfo.frameId,
          };
          if (itemInfo.paused) {
            request.action = 'play';
          } else {
            request.action = 'pause';
          }
          itemInfo.setPaused(!itemInfo.paused);
          chrome.tabs.sendMessage(itemInfo.tabId, request, {
            frameId: itemInfo.frameId,
          });
        },
      },
    });
    itemInfo.setPaused(info.paused);
    itemInfo.buttonPictureInPicture = gnoh.createElement('button', {
      type: 'button',
      tabindex: -1,
      draggable: true,
      events: {
        dragstart(e) {
          e.preventDefault();
          e.stopPropagation();
        },
        click(event) {
          event.preventDefault();
          if (!itemInfo.audio) {
            chrome.tabs.sendMessage(itemInfo.tabId, {
              type: messageType,
              action: 'picture-in-picture',
              tabId: itemInfo.tabId,
              frameId: itemInfo.frameId,
            }, {
              frameId: itemInfo.frameId,
            });
          }
        },
      },
    });
    itemInfo.setPictureInPicture(info.pictureInPicture);
    itemInfo.setAudio(info.audio);
    itemInfo.buttonTab = gnoh.createElement('button', {
      type: 'button',
      tabindex: -1,
      draggable: true,
      events: {
        dragstart(e) {
          e.preventDefault();
          e.stopPropagation();
        },
        click(event) {
          event.preventDefault();
          if (!itemInfo.active) {
            if (itemInfo.webPanelId) {
              if (itemInfo.windowId === vivaldiWindowId) {
                simulateWebviewButtonClick({ webPanelId: itemInfo.webPanelId, openOnly: true });
              } else {
                chrome.windows.update(itemInfo.windowId, { focused: true });
                chrome.runtime.sendMessage({
                  type: messageType,
                  action: 'open-webpanel',
                  windowId: itemInfo.windowId,
                  webPanelId: itemInfo.webPanelId,
                });
              }
            } else {
              chrome.tabs.update(itemInfo.tabId, { active: true }, () => {
                chrome.windows.update(itemInfo.windowId, { focused: true });
              });
            }
          }

          if (!itemInfo.audio) {
            chrome.tabs.sendMessage(itemInfo.tabId, {
              type: messageType,
              action: 'scroll-into-view',
              tabId: itemInfo.tabId,
              frameId: itemInfo.frameId,
            }, {
              frameId: itemInfo.frameId,
            });
          }
          activeItem(itemInfo.tabId);
        },
      },
    });
    itemInfo.setActive(info.active || false);
    itemInfo.volumeControl = gnoh.createElement('div', {
      className: 'volume-control',
      draggable: true,
      events: {
        dragstart(e) {
          e.preventDefault();
          e.stopPropagation();
        },
      },
    });
    itemInfo.buttonVolume = gnoh.createElement('button', {
      type: 'button',
      tabindex: -1,
      events: {
        click(event) {
          event.preventDefault();
          chrome.tabs.sendMessage(itemInfo.tabId, {
            type: messageType,
            action: 'muted',
            tabId: itemInfo.tabId,
            frameId: itemInfo.frameId,
          }, {
            frameId: itemInfo.frameId,
          });
          itemInfo.setMuted(!itemInfo.muted);
        },
      },
    }, itemInfo.volumeControl);
    itemInfo.rangeVolume = gnoh.createElement('input', {
      type: 'range',
      tabindex: -1,
      className: 'range-volume',
      min: 0,
      max: 1,
      step: 0.01,
      events: {
        input(event) {
          event.preventDefault();
          chrome.tabs.sendMessage(itemInfo.tabId, {
            type: messageType,
            action: 'volume',
            tabId: itemInfo.tabId,
            frameId: itemInfo.frameId,
            volume: event.target.value,
          }, {
            frameId: itemInfo.frameId,
          });
        },
      },
    }, itemInfo.volumeControl);
    itemInfo.setVolume(info.volume);
    itemInfo.setMuted(info.muted);
    itemInfo.currentTimeDuration = gnoh.createElement('div', {
      className: 'current-time-duration',
      draggable: true,
      events: {
        dragstart(e) {
          e.preventDefault();
          e.stopPropagation();
        },
      },
    });
    itemInfo.actionItem = gnoh.createElement('div', {
      class: 'action',
    }, null, [itemInfo.buttonControl, itemInfo.buttonPictureInPicture, itemInfo.buttonTab, itemInfo.volumeControl, itemInfo.currentTimeDuration]);
    itemInfo.contentItem = gnoh.createElement('div', {
      class: 'content',
    }, null, [itemInfo.titleItem, itemInfo.domainItem, itemInfo.actionItem]);
    itemInfo.item = gnoh.createElement('div', {
      class: 'item',
      'data-tab-id': itemInfo.tabId,
      draggable: true,
      events: {
        dragstart(e) {
          this.classList.add('dragstart');
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', itemInfo.tabId);
          dragSource = this;
        },
        dragover(e) {
          const target = e.target.closest('.item');
          if (target === dragSource) {
            return;
          }

          const bounding = target.getBoundingClientRect();
          const offset = bounding.y + (bounding.height / 2);
          if (e.clientY - offset > 0) {
            if (target.nextSibling) {
              if (target.nextSibling === dragSource) {
                return;
              }
              target.nextSibling.classList.add('dragover-top');
            } else {
              target.classList.add('dragover-bottom');
            }
            target.classList.remove('dragover-top');
          } else {
            if (target.previousSibling === dragSource) {
              return;
            }
            if (target.nextSibling) {
              target.nextSibling.classList.remove('dragover-top');
            } else {
              target.classList.remove('dragover-bottom');
            }
            target.classList.add('dragover-top');
          }

          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        },
        dragenter(e) {
          this.classList.add('dragover');
        },
        dragleave(e) {
          this.classList.remove('dragover');
          this.classList.remove('dragover-top');
          if (this.nextSibling) {
            this.nextSibling.classList.remove('dragover-top');
          } else {
            this.classList.remove('dragover-bottom');
          }
        },
        drop(e) {
          e.preventDefault();

          const target = e.target.closest('.item');

          if (target.classList.contains('dragover-top')) {
            target.classList.remove('dragover-top');
            target.parentNode.insertBefore(dragSource, target);
          } else {
            if (target.nextSibling) {
              target.nextSibling.classList.remove('dragover-top');
            } else {
              target.classList.remove('dragover-bottom');
            }
            target.parentNode.insertBefore(dragSource, target.nextSibling);
          }
        },
        dragend(e) {
          this.classList.remove('dragstart');

          for (const key in tabs) {
            const tab = tabs[key];
            tab.item.classList.remove('dragover');
          }
        },
      },
    }, panelContent, [itemInfo.contentItem, itemInfo.imageItem, itemInfo.buttonClose]);
    itemInfo.setProgress(info.duration, info.currentTime);
    tabs[itemInfo.tabId] = itemInfo;

    const index = Object.keys(tabs).indexOf(itemInfo.tabId + '');
    gnoh.element.appendAtIndex(itemInfo.item, panelContent, index);
    return itemInfo;
  }

  function deleteItem(tabId) {
    if (tabs[tabId]) {
      tabs[tabId].item.remove();
      delete tabs[tabId];
    }

    updateButtonToolbar();
    updateNumberOfItems();
  }

  function replaceItem(addedTabId, removedTabId) {
    if (tabs[removedTabId]) {
      tabs[addedTabId] = tabs[removedTabId];
      delete tabs[removedTabId];
    }
  }

  function activeItem(tabId) {
    if (!tabs[tabId]?.webPanelId && !tabs[tabId]?.active) {
      for (const key in tabs) {
        const tab = tabs[key];
        tab.setActive(key === tabId + '');
      }
    }
  }

  async function updateItem(tab, info) {
    const tabId = tab?.id || tab?.tabId;
    tab = { ...await chrome.tabs.get(tabId), ...tab };
    tab.vivExtData = tab.vivExtData ? JSON.parse(tab.vivExtData) : {};
    if (info.paused !== undefined) {
      if (!tabs[tabId]) {
        createItem(tab, info);
        if (tab.active && tab.windowId === vivaldiWindowId) {
          activeItem(tab.id);
        }
      } else {
        tabs[tabId].tabId = tabId;
        tabs[tabId].windowId = tab?.windowId;
        tabs[tabId].frameId = info.frameId;
        tabs[tabId].setTitle(info.title || tab.title);
        tabs[tabId].setArtist(info.artist);
        tabs[tabId].setUrl(tab?.url);
        tabs[tabId].setImage(info.image);
        tabs[tabId].setPaused(info.paused);
        tabs[tabId].setPictureInPicture(info.pictureInPicture);
        tabs[tabId].setAudio(info.audio);
        tabs[tabId].setVolume(info.volume);
        tabs[tabId].setMuted(info.muted);
        tabs[tabId].setProgress(info.duration, info.currentTime);
      }

      updateButtonToolbar();
      updateNumberOfItems();
    } else if (info.ended) {
      deleteItem(tabId);
    }
  }

  function updateButtonToolbar() {
    if (lucidModeVideo) {
      buttons.lucidModeVideo.pressed = true;
      if (buttons.lucidModeVideo.iconEL) {
        buttons.lucidModeVideo.iconEL.innerHTML = icons.lucidModeVideo.on;
      }
      if (buttons.lucidModeVideo.buttonEl) {
        buttons.lucidModeVideo.buttonEl.classList.add('button-pressed');
      }
    } else {
      buttons.lucidModeVideo.pressed = false;
      if (buttons.lucidModeVideo.iconEL) {
        buttons.lucidModeVideo.iconEL.innerHTML = icons.lucidModeVideo.off;
      }
      if (buttons.lucidModeVideo.buttonEl) {
        buttons.lucidModeVideo.buttonEl.classList.remove('button-pressed');
      }
    }

    if (buttons.lucidModeVideo.disabled) {
      buttons.lucidModeVideo.disabled = false;
      if (buttons.lucidModeVideo.buttonEl) {
        buttons.lucidModeVideo.buttonEl.disabled = false;
      }
    }

    if (Object.keys(tabs).length === 0) {
      if (buttons.volume.iconEL && buttons.volume.muted) {
        buttons.volume.iconEL.innerHTML = icons.volume.high;
      }
      if (buttons.volume.buttonEl && !buttons.volume.buttonEl.disabled) {
        buttons.volume.disabled = true;
        buttons.volume.buttonEl.disabled = true;
      }
      buttons.volume.muted = false;
      buttons.volume.icon = icons.volume.high;

      if (buttons.pause.buttonEl && !buttons.pause.buttonEl.disabled) {
        buttons.pause.disabled = true;
        buttons.pause.buttonEl.disabled = true;
      }
    } else {
      let iconMute = icons.volume.off;
      let muted = true;

      let pauseDisabled = true;

      for (const key in tabs) {
        const tab = tabs[key];
        if (!tab.muted && tab.volume !== 0) {
          iconMute = icons.volume.high;
          muted = false;
        }

        if (!tab.paused) {
          pauseDisabled = false;
        }
      }

      if (buttons.volume.iconEL && buttons.volume.muted !== muted) {
        buttons.volume.iconEL.innerHTML = iconMute;
      }
      if (buttons.volume.buttonEl?.disabled) {
        buttons.volume.disabled = false;
        buttons.volume.buttonEl.disabled = false;
      }
      buttons.volume.icon = iconMute;
      buttons.volume.muted = muted;

      if (buttons.pause.buttonEl && buttons.pause.buttonEl.disabled !== pauseDisabled) {
        buttons.pause.disabled = pauseDisabled;
        buttons.pause.buttonEl.disabled = pauseDisabled;
      }
    }
  }

  function updateNumberOfItems() {
    buttonBadges.forEach((buttonBadge) => {
      if (!buttonBadge) {
        return;
      }
      const numberOfItems = Object.keys(tabs).length;

      if (numberOfItems > 0) {
        if (Number(buttonBadge.textContent) !== numberOfItems) {
          buttonBadge.textContent = numberOfItems;
        }
        buttonBadge.style.display = '';
      } else {
        buttonBadge.style.display = 'none';
      }
    });
  }

  function simulateWebviewButtonClick({ webPanelId, webviewButton, openOnly }) {
    if (webPanelId) {
      webviewButton = document.querySelector('.toolbar > .button-toolbar > .ToolbarButton-Button[name*="' + webPanelId + '"]');
    }

    if (openOnly && webviewButton.parentNode?.classList.contains('active')) {
      return;
    }

    const pointerDown = new PointerEvent('pointerdown', {
      view: window,
      bubbles: true,
      cancelable: true,
      buttons: 0,
      pointerType: 'mouse',
    });
    pointerDown.persist = () => { };
    gnoh.getReactProps(webviewButton)?.onPointerDown(pointerDown);

    webviewButton.dispatchEvent(new PointerEvent('pointerup', {
      view: window,
      bubbles: true,
      cancelable: true,
      buttons: 0,
      pointerType: 'mouse',
    }));
  }

  async function createPanelCustom(panel, webviewButton) {
    if (!chrome.extension.inIncognitoContext) {
      if (panel.dataset.globalMediaControls) {
        return;
      }
      panel.dataset.globalMediaControls = true;

      let showCloseButton = await vivaldi.prefs.get('vivaldi.panels.show_close_button');
      let autoClose = await vivaldi.prefs.get('vivaldi.panels.as_overlay.auto_close');
      let asOverlayEnabled = await vivaldi.prefs.get('vivaldi.panels.as_overlay.enabled');

      const buttonClose = gnoh.createElement('button', {
        class: 'close transparent',
        title: langs.closePanel,
        style: {
          display: showCloseButton && asOverlayEnabled && autoClose || !showCloseButton ? 'none' : 'flex',
        },
        events: {
          click() {
            simulateWebviewButtonClick({ webviewButton });
          },
        },
      });

      vivaldi.prefs.onChanged.addListener(({ path, value }) => {
        switch (path) {
          case 'vivaldi.panels.show_close_button':
            showCloseButton = value;
            buttonClose.style.display = showCloseButton && asOverlayEnabled && autoClose || !showCloseButton ? 'none' : 'flex';
            break;
          case 'vivaldi.panels.as_overlay.auto_close':
            autoClose = value;
            buttonClose.style.display = showCloseButton && asOverlayEnabled && autoClose || !showCloseButton ? 'none' : 'flex';
            break;
          case 'vivaldi.panels.as_overlay.enabled':
            asOverlayEnabled = value;
            buttonClose.style.display = showCloseButton && asOverlayEnabled && autoClose || !showCloseButton ? 'none' : 'flex';
            break;
        }
      });

      gnoh.createElement('span', {
        class: 'VivaldiSvgIcon',
        style: {
          '--IconSize': 16,
        },
        html: icons.closePanel
      }, buttonClose);
      const title = gnoh.createElement('h1', {
        html: '<span>' + name + '</span>',
      }, null, buttonClose);

      const inputSearch = gnoh.createElement('input', {
        type: 'search',
        placeholder: langs.search,
        events: {
          input(e) {
            for (const key in tabs) {
              const tab = tabs[key];
              const value = e.target.value.trim().toLowerCase().replace(/\s\s+/g, ' ');
              const title = tab.title.trim().toLowerCase().replace(/\s\s+/g, ' ');
              const hostname = tab.hostname.trim().toLowerCase().replace(/\s\s+/g, ' ');

              if (
                title.match(value)
                || gnoh.string.removeDiacritics(title).match(value)
                || hostname.match(value)
              ) {
                tab.item.style.display = '';
              } else {
                tab.item.style.display = 'none';
              }
            }
          },
        },
      });

      const toolbarGroup = gnoh.createElement('div', {
        class: 'toolbar-group',
      });

      for (const key in buttons) {
        const button = buttons[key];
        const iconEl = gnoh.createElement('span', {
          html: button.icon,
        });
        const buttonEl = gnoh.createElement('button', {
          tabindex: '-1',
          class: ('ToolbarButton-Button' + (button.pressed ? ' button-pressed' : '')),
          disabled: button.disabled,
          events: {
            click: button.click,
          },
        }, null, iconEl);
        const buttonToolbar = gnoh.createElement('div', {
          class: 'button-toolbar',
        }, toolbarGroup, buttonEl);
        button.iconEL = iconEl;
        button.buttonEl = buttonEl;
      }

      const toolbar = gnoh.createElement('div', {
        class: 'toolbar',
      }, null, toolbarGroup);
      const toolbarWrap = gnoh.createElement('div', {
        class: 'toolbar toolbar-default toolbar-medium toolbar-wrap',
      }, null, [inputSearch, toolbar]);

      const panelHeader = gnoh.createElement('header', null, panel, [title, toolbarWrap]);
      panel.append(panelContent);
    } else if (webviewButton) {
      if (panel.dataset.globalMediaControls) {
        return;
      }
      panel.dataset.globalMediaControls = true;
      if (panel.classList.contains('visible')) {
        simulateWebviewButtonClick({ webviewButton });
      }
    }
  }

  const style = !chrome.extension.inIncognitoContext ? [
    '#panels-container.left #panels .webpanel-stack [data-global-media-controls] header { padding-left: 9px; }',
    '#panels-container.right #panels .webpanel-stack [data-global-media-controls] header { padding-left: 12px; }',
    '#panels-container #panels .webpanel-stack [data-global-media-controls] header { padding-right: var(--scrollbarWidth); padding-top: 12px; }',
    '#panels-container #panels .webpanel-stack [data-global-media-controls] header.webpanel-header { display: none; }',
    '#panels-container #panels .webpanel-stack [data-global-media-controls] .webpanel-content { display: none; }',
    '.global-media-controls-content { display: flex; flex-direction: column; overflow: auto; }',
    '.global-media-controls-content .item { position: relative; display: flex; overflow: hidden; min-height: 100px; background-color: var(--colorGMCBg); color: var(--colorGMCFg); }',
    '.global-media-controls-content .item:after { position: absolute; content: ""; bottom: 0; height: 4px; width: var(--colorGMCProgressBarValue, 0); z-index: 1; background-color: var(--colorGMCProgressBarBg); }',
    '.global-media-controls-content .item .content { display: inline-grid; grid-template-rows: auto 1fr auto; flex: 1; padding: 10px; z-index: 1; box-shadow: var(--colorGMCBg) 0px 0px 15px 15px; }',
    '.global-media-controls-content .item .content .title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }',
    '.global-media-controls-content .item .content .action { display: flex; align-items: center; margin-top: auto; position: absolute; bottom: 10px; }',
    '.global-media-controls-content .item .content .action button { margin-right: 10px; flex: 1 0 auto; }',
    '.global-media-controls-content .item button { background-color: var(--colorBgLightIntense); color: var(--colorFg); padding: 0; width: 28px; height: 28px; border-radius: 14px; border: 0; }',
    '.global-media-controls-content .item button:hover { background-color: var(--colorBg); }',
    '.global-media-controls-content .item button:active { background-color: var(--colorBgDark); }',
    '.global-media-controls-content .item button.active { background-color: var(--colorHighlightBg); color: var(--colorHighlightFg); }',
    '.global-media-controls-content .item button.disabled { pointer-events: none; }',
    '.global-media-controls-content .item button svg { width: 16px; height: 16px; top: 2px; position: relative; }',
    '.global-media-controls-content .item button.close-button { position: absolute; top: 6px; right: 6px; display: none; z-index: 1; }',
    '.global-media-controls-content .item .content .action .volume-control { background-color: var(--colorBgLightIntense); color: var(--colorFg); padding: 0; width: 28px; height: 28px; border-radius: 14px; margin-right: 10px; overflow: hidden; padding-right: 10px; flex: 1 0 auto; }',
    '.global-media-controls-content .item .content .action .volume-control:hover { width: auto; display: flex; flex-direction: row; align-items: center; }',
    '.global-media-controls-content .item .content .action .volume-control button { margin-right: 0; }',
    '.global-media-controls-content .item .content .action .volume-control .range-volume { width: 80px; display: none; }',
    '.global-media-controls-content .item .content .action .volume-control:hover .range-volume { display: block; }',
    '.global-media-controls-content .item .content .action .current-time-duration { background-color: var(--colorBgLightIntense); color: var(--colorFg); padding: 0; height: 28px; line-height: 28px; border-radius: 14px; margin-right: 10px; overflow: hidden; padding: 0 10px; flex: 1 0 auto; }',
    '.global-media-controls-content .item:hover button.close-button { display: block; }',
    '.global-media-controls-content .item.dragstart { opacity: 0.4; }',
    '.global-media-controls-content .item.dragover-top::before { content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0; box-shadow: 0 2px var(--colorHighlightBg) inset, 0 -2px var(--colorHighlightBg); pointer-events: none; z-index: 2; }',
    '.global-media-controls-content .item.dragover-bottom::before { content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0; box-shadow: 0 -2px var(--colorHighlightBg) inset, 0 2px var(--colorHighlightBg); pointer-events: none; z-index: 2; }',
    'button[name="' + webPanelId + '"] > img { display:none; }',
    'button[name="' + webPanelId + '"]:before { width: 16px; height: 16px; content: ""; background-color: var(--colorFg); -webkit-mask-box-image: url(' + JSON.stringify(icons.dataURLs.playlistMusic) + '); }',
    '.color-behind-tabs-off .toolbar-mainbar button[name="' + webPanelId + '"]:before { background-color: var(--colorAccentFg); }',
    '.button-toolbar:active button[name="' + webPanelId + '"]:before { transform: scale(0.9); }',
  ] : [
    '.button-toolbar:has(button[name="' + webPanelId + '"]) { display:none !important; }',
    '.draggable-button:has(button[name="' + webPanelId + '"]) { display:none !important; }',
  ];

  gnoh.addStyle(style, nameAttribute);

  function updateIconAndTitle() {
    const webviewButtons = Array.from(document.querySelectorAll('.toolbar > .button-toolbar > .ToolbarButton-Button[name*="' + webPanelId + '"]'));

    const webPanelStack = gnoh.getReactProps('.panel-group .webpanel-stack')?.children?.filter(webPanel => webPanel) ?? [];
    const webPanelIndex = webPanelStack.findIndex(webPanel => webPanel.key === webPanelId) + 1;
    const panel = document.querySelector('.panel-group .webpanel-stack .panel.webpanel:nth-child(' + webPanelIndex + ')');

    if (panel && webviewButtons.length) {
      createPanelCustom(panel, webviewButtons[0]);
    }

    webviewButtons.forEach((wvb) => {
      if (!chrome.extension.inIncognitoContext) {
        if (wvb.dataset.globalMediaControls) {
          return;
        }

        wvb.dataset.globalMediaControls = true;

        const buttonBadge = gnoh.createElement('span', {
          class: 'button-badge',
          style: {
            display: 'none',
          },
        });

        buttonBadges.push(buttonBadge);

        wvb.append(buttonBadge);
      }
    });
  }

  function createWebPanel() {
    vivaldi.prefs.get('vivaldi.panels.web.elements', (elements) => {
      let element = elements.find((e) => e.id === webPanelId);
      if (!element) {
        element = {
          activeUrl: code,
          faviconUrl: icons.dataURLs.playlistMusic,
          faviconUrlValid: true,
          id: webPanelId,
          mobileMode: true,
          origin: 'user',
          resizable: false,
          title: name,
          url: 'chrome://' + nameAttribute,
          width: -1,
          zoom: 1,
        };
        elements.unshift(element);

        vivaldi.prefs.set({
          path: 'vivaldi.panels.web.elements',
          value: elements,
        });
      }

      Promise.all(
        [
          'vivaldi.toolbars.panel',
          'vivaldi.toolbars.navigation',
          'vivaldi.toolbars.status',
          'vivaldi.toolbars.mail',
          'vivaldi.toolbars.mail_message',
          'vivaldi.toolbars.mail_composer',
        ].map((path) => vivaldi.prefs.get(path))
      ).then((toolbars) => {
        const hasGlobalMediaControl = toolbars.some((toolbar) => toolbar.some((p) => p === webPanelId));

        if (!hasGlobalMediaControl) {
          const panels = toolbars[0];

          const panelIndex = panels.findIndex(panel => panel.startsWith('WEBPANEL_'));
          panels.splice(panelIndex, 0, webPanelId);

          vivaldi.prefs.set({
            path: 'vivaldi.toolbars.panel',
            value: panels,
          });
        }
      });
    });
  }

  vivaldi.windowPrivate.onActivated.addListener((windowId, active) => {
    if (active) {
      chrome.tabs.query({ active: true, windowId: windowId }, (tabs) => {
        const tab = tabs[0];
        if (tab) {
          activeItem(tab.id);
        }
      });
    }
  });

  if (!chrome.extension.inIncognitoContext) {
    chrome.tabs.onActivated.addListener((activeInfo) => {
      activeItem(activeInfo.tabId);
    });

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'loading') {
        deleteItem(tabId);
      }
    });

    chrome.tabs.onReplaced.addListener((addedTabId, removedTabId) => {
      replaceItem(addedTabId, removedTabId);
    });

    chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
      deleteItem(tabId);
    });

    chrome.windows.getAll({ windowTypes: ['normal'] }, (windows) => {
      const windowNotIncognitos = windows.filter((w) => !w.incognito);
      if (windowNotIncognitos.length < 2) {
        chrome.storage.local.remove('GLOBAL_MEDIA_CONTROLS');
      } else {
        syncData('GLOBAL_MEDIA_CONTROLS');
      }
    });

    chrome.runtime.onMessage.addListener(async (info, sender, sendResponse) => {
      if (info.type === messageType && (!sender.tab || (sender.tab && !sender.tab.incognito))) {
        switch (info.action) {
          case 'open-webpanel':
            if (info.windowId === vivaldiWindowId) {
              simulateWebviewButtonClick({ webPanelId: info.webPanelId, openOnly: true });
            }
            break;
          default:
            info.frameId = sender.frameId;
            await updateItem(sender.tab, info);
            chrome.storage.local.set({
              GLOBAL_MEDIA_CONTROLS: tabs,
            });
            break;
        }
      }
    });

    gnoh.timeOut(() => {
      chrome.tabs.query({ windowId: window.vivaldiWindowId, windowType: 'normal' }, (tabs) => {
        tabs.forEach((tab) => {
          if (!tab.incognito) {
            chrome.scripting.executeScript({
              target: {
                tabId: tab.id,
                allFrames: true,
              },
              func: injectMain,
              world: 'MAIN',
              args: [messageType, nameAttribute],
            });
            chrome.scripting.executeScript({
              target: {
                tabId: tab.id,
                allFrames: true,
              },
              func: inject,
              args: [messageType],
            });
          }
        });
      });

      chrome.webNavigation.onCommitted.addListener((details) => {
        chrome.scripting.executeScript({
          target: {
            tabId: details.tabId,
            frameIds: [details.frameId],
          },
          func: injectMain,
          world: 'MAIN',
          args: [messageType, nameAttribute],
        });
        chrome.scripting.executeScript({
          target: {
            tabId: details.tabId,
            frameIds: [details.frameId],
          },
          func: inject,
          args: [messageType],
        });
      });
    }, () => window.vivaldiWindowId != null);

    function injectToggleLucidModeVideo(enable) {
      let style = document.querySelector('style[lucid-mode-video]');
      if (style && !enable) {
        style.remove();
      } else if (!style && enable) {
        style = document.createElement('style');
        style.setAttribute('lucid-mode-video', '');
        style.innerHTML = 'video { filter: url(\'data:image/svg+xml, <svg xmlns="http://www.w3.org/2000/svg"> <filter id="sharpen"> <feConvolveMatrix order="3" preserveAlpha="true" kernelMatrix="1 -1 1 -1 -1 -1 1 -1 1"/> </filter> </svg>#sharpen\'); }';
        document.head.append(style);
      }
    }

    function toggleLucidModeVideo() {
      updateButtonToolbar();

      chrome.tabs.query({ windowType: 'normal' }, (tabs) => {
        tabs.forEach((tab) => {
          chrome.scripting.executeScript({
            target: {
              tabId: tab.id,
              allFrames: true,
            },
            func: injectToggleLucidModeVideo,
            args: [lucidModeVideo],
          });
        });
      });
    }

    chrome.storage.local.get({
      LUCID_MODE_VIDEO: false
    }, (result) => {
      lucidModeVideo = result.LUCID_MODE_VIDEO;
      toggleLucidModeVideo();

      chrome.webNavigation.onCommitted.addListener((details) => {
        chrome.scripting.executeScript({
          target: {
            tabId: details.tabId,
            frameIds: [details.frameId],
          },
          func: injectToggleLucidModeVideo,
          args: [lucidModeVideo],
        });
      });
    });

    chrome.storage.local.onChanged.addListener((changes, namespace) => {
      if (changes.LUCID_MODE_VIDEO) {
        lucidModeVideo = changes.LUCID_MODE_VIDEO.newValue;

        toggleLucidModeVideo();
      }
    });
  }

  gnoh.timeOut(() => {
    const webviewButtons = Array.from(document.querySelectorAll('.toolbar > .button-toolbar > .ToolbarButton-Button[name*="' + webPanelId + '"]'));
    if (webviewButtons.length) {
      updateIconAndTitle();
    } else {
      createWebPanel();
    }
  }, '#browser');

  gnoh.observeDOM(document, () => {
    updateIconAndTitle();
  });
})();