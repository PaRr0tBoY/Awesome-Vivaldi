/*
 * Click to add Blocking list
 * Written by Tam710562
 */

(() => {
  'use strict';

  const gnoh = {
    get constant() {
      return {
        dialogButtons: {
          submit: {
            label: this.i18n.getMessage('OK'),
            type: 'submit'
          },
          cancel: {
            label: this.i18n.getMessage('Cancel'),
            cancel: true
          },
        },
      };
    },
    i18n: {
      getMessageName(message, type) {
        message = (type ? type + '\x04' : '') + message;
        return message.replace(/[^a-z0-9]/g, (i) => '_' + i.codePointAt(0) + '_') + '0';
      },
      getMessage(message, type) {
        return chrome.i18n.getMessage(this.getMessageName(message, type)) || message;
      },
    },
    object: {
      isObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item));
      },
      merge(target, source) {
        let output = Object.assign({}, target);
        if (this.isObject(target) && this.isObject(source)) {
          for (const key in source) {
            if (this.isObject(source[key])) {
              if (!(key in target))
                Object.assign(output, { [key]: source[key] });
              else
                output[key] = this.merge(target[key], source[key]);
            } else {
              Object.assign(output, { [key]: source[key] });
            }
          }
        }
        return output;
      },
    },
    decode: {
      url(str) {
        if (!str) {
          return str;
        }

        const UTF8_DATA = [
          // The first part of the table maps bytes to character to a transition.
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
          3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
          3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
          4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
          5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
          6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 8, 7, 7,
          10, 9, 9, 9, 11, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,

          // The second part of the table maps a state to a new state when adding a
          // transition.
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          12, 0, 0, 0, 0, 24, 36, 48, 60, 72, 84, 96,
          0, 12, 12, 12, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 24, 24, 24, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 24, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 48, 48, 48, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 48, 48, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,

          // The third part maps the current transition to a mask that needs to apply
          // to the byte.
          0x7F, 0x3F, 0x3F, 0x3F, 0x00, 0x1F, 0x0F, 0x0F, 0x0F, 0x07, 0x07, 0x07,
        ];

        const HEX = {
          '0': 0,
          '1': 1,
          '2': 2,
          '3': 3,
          '4': 4,
          '5': 5,
          '6': 6,
          '7': 7,
          '8': 8,
          '9': 9,
          'a': 10,
          'A': 10,
          'b': 11,
          'B': 11,
          'c': 12,
          'C': 12,
          'd': 13,
          'D': 13,
          'e': 14,
          'E': 14,
          'f': 15,
          'F': 15,
        };

        let percentPosition = str.indexOf('%');
        if (percentPosition === -1) {
          return str;
        }

        const length = str.length;
        let decoded = '';
        let last = 0;
        let codepoint = 0;
        let startOfOctets = percentPosition;
        let state = 12;

        while (percentPosition > -1 && percentPosition < length) {
          const high = HEX[str[percentPosition + 1]] === undefined ? 255 : HEX[str[percentPosition + 1]] << 4;
          const low = HEX[str[percentPosition + 2]] === undefined ? 255 : HEX[str[percentPosition + 2]] << 0;
          const byte = high | low;
          const type = UTF8_DATA[byte];
          state = UTF8_DATA[256 + state + type];
          codepoint = (codepoint << 6) | (byte & UTF8_DATA[364 + type]);

          if (state === 12) {
            decoded += str.slice(last, startOfOctets);

            decoded += (codepoint <= 0xFFFF)
              ? String.fromCharCode(codepoint)
              : String.fromCharCode(
                (0xD7C0 + (codepoint >> 10)),
                (0xDC00 + (codepoint & 0x3FF))
              );

            codepoint = 0;
            last = percentPosition + 3;
            percentPosition = startOfOctets = str.indexOf('%', last);
          } else if (state === 0) {
            state = 12;
            codepoint = 0;
            percentPosition = startOfOctets = str.indexOf('%', startOfOctets + 1);
          } else {
            percentPosition += 3;
            if (percentPosition < length && str.charCodeAt(percentPosition) === 37) {
              continue;
            }
          }
        }

        return decoded + str.slice(last);
      },
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
    createElementFromHTML(html) {
      return this.createElement('template', {
        html: (html || '').trim(),
      }).content;
    },
    dialog(title, content, buttons = [], config) {
      let modalBg;
      let dialog;
      let cancelEvent;
      const id = this.uuid.generate();
      const inner = document.querySelector('#main > .inner, #main > .webpageview');

      if (!config) {
        config = {};
      }
      if (typeof config.autoClose === 'undefined') {
        config.autoClose = true;
      }

      function onKeyCloseDialog(windowId, key) {
        if (
          windowId === vivaldiWindowId
          && key === 'Esc'
        ) {
          closeDialog(true);
        }
      }

      function onClickCloseDialog(windowId, mousedown, button, clientX, clientY) {
        if (
          config.autoClose
          && windowId === vivaldiWindowId
          && mousedown
          && !document.elementFromPoint(clientX, clientY).closest('.dialog-custom[data-dialog-id="' + id + '"]')
        ) {
          closeDialog(true);
        }
      }

      function closeDialog(isCancel) {
        if (isCancel === true && cancelEvent) {
          cancelEvent.bind(this)();
        }
        if (modalBg) {
          modalBg.remove();
        }
        vivaldi.tabsPrivate.onKeyboardShortcut.removeListener(onKeyCloseDialog);
        vivaldi.tabsPrivate.onWebviewClickCheck.addListener(onClickCloseDialog);
      }

      vivaldi.tabsPrivate.onKeyboardShortcut.addListener(onKeyCloseDialog);
      vivaldi.tabsPrivate.onWebviewClickCheck.addListener(onClickCloseDialog);

      const buttonElements = [];
      for (let button of buttons) {
        button.type = button.type || 'button';
        const clickEvent = button.click;
        if (button.cancel === true && typeof clickEvent === 'function') {
          cancelEvent = clickEvent;
        }
        button.events = {
          click(event) {
            event.preventDefault();
            if (typeof clickEvent === 'function') {
              clickEvent.bind(this)();
            }
            if (button.closeDialog !== false) {
              closeDialog();
            }
          }
        };
        delete button.click;
        if (button.label) {
          button.value = button.label;
          delete button.label;
        }
        button.element = this.createElement('input', button);
        buttonElements.push(button.element);
      }

      const focusModal = this.createElement('span', {
        class: 'focus_modal',
        tabindex: '0',
      });
      const div = this.createElement('div', {
        style: {
          width: config.width ? config.width + 'px' : '',
          margin: '0 auto',
        }
      });
      dialog = this.createElement('form', {
        'data-dialog-id': id,
        class: 'dialog-custom modal-wrapper',
      }, div);
      if (config.class) {
        dialog.classList.add(config.class);
      }
      const dialogHeader = this.createElement('header', {
        class: 'dialog-header',
      }, dialog, '<h1>' + (title || '') + '</h1>');
      const dialogContent = this.createElement('div', {
        class: 'dialog-content',
        style: {
          maxHeight: '65vh',
        },
      }, dialog, content);
      if (buttons && buttons.length > 0) {
        const dialogFooter = this.createElement('footer', {
          class: 'dialog-footer',
        }, dialog, buttonElements);
      }
      modalBg = this.createElement('div', {
        id: 'modal-bg',
        class: 'slide',
      }, inner, [focusModal.cloneNode(true), div, focusModal.cloneNode(true)]);
      return {
        dialog,
        dialogHeader,
        dialogContent,
        modalBg,
        buttons: buttonElements,
        close: closeDialog,
      };
    },
    alert(message, okEvent) {
      const buttonOkElement = this.object.merge(this.constant.dialogButtons.submit, {
        cancel: true,
      });
      if (typeof okEvent === 'function') {
        buttonOkElement.click = function (data) {
          okEvent.bind(this)(data);
        };
      }

      return this.dialog('Alert', message, [buttonOkElement], {
        width: 400,
        class: 'dialog-javascript',
      });
    },
  };

  const debug = false;
  const log = debug ? console.log : () => { };
  let isLoading = false;
  let dialogRef;

  const langs = {
    done: gnoh.i18n.getMessage('Done'),
    cancel: gnoh.i18n.getMessage('Cancel'),
    loading: gnoh.i18n.getMessage('Loading...'),
  };

  function showDialogImportNew(blockListId) {
    const buttonDoneElement = gnoh.object.merge(gnoh.constant.dialogButtons.submit, {
      label: langs.done,
      disabled: true,
      click(data) {
        isLoading = false;
      },
    });
    const buttonCancelElement = gnoh.object.merge(gnoh.constant.dialogButtons.cancel, {
      label: langs.cancel,
      cancel: true,
      click(data) {
        vivaldi.contentBlocking.deleteKnownSource(vivaldi.contentBlocking.RuleGroup.AD_BLOCKING, blockListId);
        isLoading = false;
      },
    });

    dialogRef = gnoh.dialog('Import New Blocker List', langs.loading, [buttonDoneElement, buttonCancelElement], {
      width: 500,
      class: 'ContentBlocker-Exception',
      autoClose: false,
    });
  }

  function fetchComplete(blockList) {
    if (isLoading === true) {
      if (blockList.last_fetch_result === 'success') {
        const contentHTML = [
          '<h3>' + blockList.unsafe_adblock_metadata.title + '</h3>',
          '<p class="info" style="word-break: break-all">' + blockList.source_url + '</p>',
          '<p>Valid rules: ' + blockList.rules_info.valid_rules + '<br>Invalid rules: ' + blockList.rules_info.invalid_rules + '<br>Unsupported rules: ' + blockList.rules_info.unsupported_rules + '</p>'
        ].join('');
        dialogRef.dialogContent.innerHTML = contentHTML;
        dialogRef.buttons[0].disabled = false;
      } else if (!blockList.is_fetching) {
        dialogRef.close();
        vivaldi.contentBlocking.deleteKnownSource(vivaldi.contentBlocking.RuleGroup.AD_BLOCKING, blockList.id);
        gnoh.alert(blockList.last_fetch_result, () => {
          isLoading = false;
        });
      }
    }
  }

  vivaldi.contentBlocking.onRuleSourceUpdated.addListener(fetchComplete);

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    let matchURL;
    if (tab.pendingUrl && (matchURL = tab.pendingUrl.match(/(https:\/\/subscribe\.adblockplus\.org\/|abp:subscribe)\?location=(.+)(&|&amp;)title=.+/))) {
      const blockListURL = gnoh.decode.url(matchURL[2]);
      log(blockListURL, tab.pendingUrl);

      if (tab.url === '' || tab.url === tab.pendingUrl) {
        chrome.tabs.remove(tabId, log);
      } else if (tab.url) {
        chrome.tabs.update(tabId, { url: tab.url });
      }

      if (tab.windowId === vivaldiWindowId && isLoading === false) {
        isLoading = true;

        vivaldi.contentBlocking.addKnownSourceFromURL(vivaldi.contentBlocking.RuleGroup.AD_BLOCKING, blockListURL, (blockListId) => {
          if (!chrome.runtime.lastError) {
            showDialogImportNew(blockListId);
          } else {
            gnoh.alert(chrome.runtime.lastError.message, () => {
              isLoading = false;
            });
          }
        });
      }
    }
  });
})();
