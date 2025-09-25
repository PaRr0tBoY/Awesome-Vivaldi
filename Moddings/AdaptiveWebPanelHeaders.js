/*
 * Web Panels with Adaptive Headers
 * Written by Tam710562
 */

(function () {
  'use strict';

  var debug = false;
  var log = debug ? console.log : function () {};
  var colors = {};

  function getAverageRGB(url, callback) {
    var img = document.createElement('img');
    img.src = url;

    var defaultRGB = {
      r: 0,
      g: 0,
      b: 0
    }; // for non-supporting envs

    img.addEventListener('load', function () {
      var blockSize = 1; // only visit every 5 pixels
      var canvas = document.createElement('canvas');
      var context = canvas.getContext && canvas.getContext('2d');
      var data;
      var i = -4;
      var rgb = {
        r: 0,
        g: 0,
        b: 0
      };
      var rgbs = {}, rgbLights = {};
      var rgbStr;
      var level = 50;

      if (!context) {
        return defaultRGB;
      }

      var height = canvas.height = img.naturalHeight || img.offsetHeight || img.height;
      var width = canvas.width = img.naturalWidth || img.offsetWidth || img.width;

      context.drawImage(img, 0, 0);
      try {
        data = context.getImageData(0, 0, width, height);
      } catch (e) {
        /* security error, img on diff domain */
        return defaultRGB;
      }

      var length = data.data.length;

      while ((i += blockSize * 4) < length) {
        rgb.r = data.data[i];
        rgb.g = data.data[i + 1];
        rgb.b = data.data[i + 2];
        rgbStr = rgb.r + ',' + rgb.g + ',' + rgb.b;
        var luminance = getLuminance(rgb.r, rgb.g, rgb.b);
        if (luminance < 30 || luminance > 200) {
          rgbLights[rgbStr] = (rgbLights[rgbStr] || 0) + 1;
        } else {
          rgbs[rgbStr] = (rgbs[rgbStr] || 0) + 1;
        }
      }

      var rgbKeys = Object.keys(rgbs);
      if (rgbKeys.length > 0) {
        getRGBMax(rgbs, callback);
      } else {
        rgbKeys = Object.keys(rgbLights);
        if (rgbKeys.length > 0) {
          getRGBMax(rgbLights, callback, true);
        } else {
          callback();
        }
      }
    });
  }
  
  function getRGBMax(rgbs, callback, priorityDark) {
    log('rgbs: ', rgbs);
    if (JSON.stringify(rgbs) === '{"122,143,143":8,"135,141,146":8,"146,151,157":6,"152,158,164":13,"131,135,142":7,"148,153,160":8,"154,160,166":50,"146,150,157":4,"143,149,155":1,"155,161,167":7,"151,157,164":3,"141,147,151":4,"170,170,170":5,"155,163,167":1,"151,157,163":1,"144,150,157":2,"155,160,168":2,"154,161,166":1,"159,164,168":1,"145,150,157":2,"158,162,170":1,"155,160,166":2,"155,166,166":1,"156,161,167":1,"155,160,167":2,"156,162,168":1,"155,161,166":1,"155,162,167":1,"155,162,166":1,"157,163,169":1,"130,136,141":1,"150,156,162":1,"145,150,156":1}') {
      callback();
    } else {
      var rgbKeys = Object.keys(rgbs);
      rgbKeys.sort(function(a, b) {
        var rgbArrayA = a.split(',');
        var rgbA = {
          r: Number(rgbArrayA[0]),
          g: Number(rgbArrayA[1]),
          b: Number(rgbArrayA[2])
        };
        var rgbArrayB = b.split(',');
        var rgbB = {
          r: Number(rgbArrayB[0]),
          g: Number(rgbArrayB[1]),
          b: Number(rgbArrayB[2])
        };
        if (rgbA.r < rgbB.r) {
          return -1;
        } else if (rgbA.r > rgbB.r) {
          return 1;
        } else if (rgbA.g < rgbB.g) {
          return -1;
        } else if (rgbA.g > rgbB.g) {
          return 1;
        } else if (rgbA.b < rgbB.b) {
          return -1;
        } else if (rgbA.b > rgbB.b) {
          return 1;
        } else {
          return 0;
        }
      });
      
      if (priorityDark === true) {
        var rgbKeysTemp = rgbKeys.filter(function (rgbStr) {
          var rgbArray = rgbStr.split(',');
          var rgb = {
            r: Number(rgbArray[0]),
            g: Number(rgbArray[1]),
            b: Number(rgbArray[2])
          };
          return !isLight(rgb.r, rgb.g, rgb.b) && (rgb.r !== 0 && rgb.g !== 0 && rgb.b !== 0);
        });
        if (rgbKeysTemp.length > 0) {
          rgbKeys = rgbKeysTemp;
        }
      }      

      log('rgbKeys: ', rgbKeys);

      var rgbKeysMax;
      if (rgbKeys.length !== 1) {
        var rgbCount = Math.max.apply(Math, rgbKeys.map(function (rgb) { return rgbs[rgb]; }));
        log('rgbCount: ', rgbCount);
        var rgbKeysMax = rgbKeys.filter(function (rgb) {
          return rgbs[rgb] === rgbCount;
        });
      } else {
        rgbKeysMax = rgbKeys;
      }
      log('rgbKeysMax: ', rgbKeysMax);

      if (rgbKeysMax.length > 0) {
        var rgbArray = rgbKeysMax[0].split(',');
        var rgb = {
          r: Number(rgbArray[0]),
          g: Number(rgbArray[1]),
          b: Number(rgbArray[2])
        };
        log('rgb: ', rgb);

        callback(rgb);
      } else {
        callback();
      }
    }
  }

  function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  
  function getLuminance(r, g, b) {
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function isLight(r, g, b) {
    return getLuminance(r, g, b) < 156;
  }

  function getThemeColor(event) {
    var panel = event.target.parentElement.parentElement;
    var faviconUrl = 'chrome://favicon/' + event.target.src.match(/^.*?:\/\/[^#?\/]+/)[0];
    log('faviconUrl', faviconUrl);
    if (panel.classList.contains('visible')) {
      // var activeBtn = document.querySelector('button.webviewbtn.active');
      if (colors[faviconUrl]) {
        if (typeof colors[faviconUrl] === 'object') {
          setColors(panel, colors[faviconUrl]);
        } else if (colors[faviconUrl] === false) {
          removeColors(panel);
        }
      } else {
        colors[faviconUrl] = true;
        getAverageRGB(faviconUrl + '/?' + new Date().getTime(), function (rgbColor) {
          if (rgbColor) {
            var colorFg;
            var colorBg = rgbToHex(rgbColor.r, rgbColor.g, rgbColor.b);
            if (isLight(rgbColor.r, rgbColor.g, rgbColor.b)) {
              colorFg = '#f6f6f6';
            } else {
              colorFg = '#111111';
            }
            colors[faviconUrl] = {
              colorBg: colorBg,
              colorFg: colorFg
            };
            setColors(panel, colors[faviconUrl]);
          } else {
            log('faviconUrl', faviconUrl);
            colors[faviconUrl] = false;
            removeColors(panel);
          }
          log('colors', colors);
        });
      }
    }
  }
  
  function setColor(element, property, color) {
    element.style.setProperty(property, color);
  }
  
  function removeColor(element, property) {
    element.style.removeProperty(property);
  }
  
  function setColors(panel, color) {
    setColor(panel, '--colorBgWebpanel', color.colorBg);
    setColor(panel, '--colorFgWebpanel', color.colorFg);
    // setColor(activeBtn, '--colorBgWebpanel', color.colorBg);
  }
  
  function removeColors(panel) {
    removeColor(panel, '--colorBgWebpanel');
    removeColor(panel, '--colorFgWebpanel');
    // removeColor(activeBtn, '--colorBgWebpanel');
  }

  var appendChild = Element.prototype.appendChild;
  Element.prototype.appendChild = function () {
    if (arguments[0].tagName === 'WEBVIEW') {
      var webview = arguments[0];
      webview.addEventListener('focus', getThemeColor);
      webview.addEventListener('loadcommit', getThemeColor);
    }
    return appendChild.apply(this, arguments);
  };
  
  function addStyle(css) {
    const style = document.createElement('style');
    style.id = 'webpanel-color'
    style.innerHTML = css;
    document.head.appendChild(style);
  }
  
  addStyle([
    '#panels .webpanel-stack .webpanel .webpanel-header { background-color: var(--colorBgWebpanel); color: var(--colorFgWebpanel); fill: var(--colorFgWebpanel); }',
    '#panels .button-toolbar { background-image: none; background-color: var(--colorBgWebpanel); color: var(--colorFgWebpanel); fill: var(--colorFgWebpanel); }',
  ].join(''))
})();
