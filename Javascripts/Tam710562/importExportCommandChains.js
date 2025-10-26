/*
 * Import Export Command Chains
 * Written by Tam710562
 */

(async () => {
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
    uuid: {
      check(id) {
        return !/^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(id);
      },
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
    object: {
      isObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item));
      },
      merge(target, source) {
        let output = Object.assign({}, target);
        if (this.isObject(target) && this.isObject(source)) {
          Object.keys(source).forEach(key => {
            if (this.isObject(source[key])) {
              if (!(key in target))
                Object.assign(output, { [key]: source[key] });
              else
                output[key] = this.merge(target[key], source[key]);
            } else {
              Object.assign(output, { [key]: source[key] });
            }
          });
        }
        return output;
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
    encode: {
      regex(str) {
        return !str ? str : str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      },
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
      const buttonOkElement = Object.assign({}, this.constant.dialogButtons.submit, {
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
    element: {
      appendAtIndex(element, parentElement, index) {
        if (index >= parentElement.children.length) {
          parentElement.append(element)
        } else {
          parentElement.insertBefore(element, parentElement.children[index])
        }
      },
      getIndex(element) {
        return Array.from(element.parentElement.children).indexOf(element);
      },
    },
  };

  const messageType = 'import-export-command-chains';
  let timeOut;

  const urls = {
    quickCommands: 'chrome-extension://mpognobbkildjkofajifpdfhcoklimli/components/settings/settings.html?path=qc',
    general: 'chrome-extension://mpognobbkildjkofajifpdfhcoklimli/components/settings/settings.html?path=general',
  };

  const icons = {
    import: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2 12H4V17H20V12H22V17C22 18.11 21.11 19 20 19H4C2.9 19 2 18.11 2 17V12M12 15L17.55 9.54L16.13 8.13L13 11.25V2H11V11.25L7.88 8.13L6.46 9.55L12 15Z" /></svg>',
    export: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2 12H4V17H20V12H22V17C22 18.11 21.11 19 20 19H4C2.9 19 2 18.11 2 17V12M12 2L6.46 7.46L7.88 8.88L11 5.75V15H13V5.75L16.13 8.88L17.55 7.45L12 2Z" /></svg>',
  };

  const messageKey = {
    textSelection: {
      message: 'selection',
      type: 'textselection',
    },
    websiteLink: {
      message: 'link url',
      type: 'websitelink',
    },
    pageUrl: {
      message: 'page url',
      type: 'pageurl',
    },
    webpageTitle: {
      message: 'page title',
      type: 'webpagetitle',
    },
    elementSource: {
      message: 'src url',
      type: 'elementsource',
    },
  };

  const langs = {
    general: gnoh.i18n.getMessage('General'),
    quickCommands: gnoh.i18n.getMessage('Quick Commands'),
    copy: gnoh.i18n.getMessage('Copy', 'verb'),
    export: gnoh.i18n.getMessage('Export', 'verb'),
    import: gnoh.i18n.getMessage('Import'),
    install: gnoh.i18n.getMessage('Install'),
    installed: gnoh.i18n.getMessage('Installed'),
    update: gnoh.i18n.getMessage('Update'),
    preview: gnoh.i18n.getMessage('Preview'),
    commandParameter: gnoh.i18n.getMessage('Command Parameter', 'chainedcommand'),
    textSelection: gnoh.i18n.getMessage(messageKey.textSelection.message, messageKey.textSelection.type),
    websiteLink: gnoh.i18n.getMessage(messageKey.websiteLink.message, messageKey.websiteLink.type),
    pageUrl: gnoh.i18n.getMessage(messageKey.pageUrl.message, messageKey.pageUrl.type),
    webpageTitle: gnoh.i18n.getMessage(messageKey.webpageTitle.message, messageKey.webpageTitle.type),
    elementSource: gnoh.i18n.getMessage(messageKey.elementSource.message, messageKey.elementSource.type),
  };


  const placeholdersCurrent = Object.keys(messageKey).map(key => langs[key].replace(/\s/g, '_'));
  const placeholdersEn = Object.values(messageKey).map(m => m.message.replace(/\s/g, '_'));

  gnoh.addStyle([
    '.import-export-command-chains { --jsonKey: #0451a5; --jsonNumber: #098658; --jsonBool: #0000ff; --jsonString: #a31515; }',
    '.theme-dark .import-export-command-chains { --jsonKey: #9cdcfe; --jsonNumber: #b5cea8; --jsonBool: #569cd6; --jsonString: #ce9178; }',
    '.import-export-command-chains input[type="file"]::file-selector-button { border: 0px; border-right: 1px solid var(--colorBorder); height: 28px; padding: 0 18px; color: var(--colorFg); background: linear-gradient(var(--colorBgLightIntense) 0%, var(--colorBg) 100%); margin-right: 18px; }',
    '.import-export-command-chains input[type="file"]::file-selector-button:hover { background: linear-gradient(var(--colorBg), var(--colorBg)); }',
    '.import-export-command-chains .editor { width: 100%; height: 300px; overflow: auto; white-space: pre-wrap; word-break: break-word; background-color: var(--colorBgIntense); color: var(--colorFg); user-select: text; border-radius: var(--radius); border: 1px solid var(--colorBorder); font-size: 13px; font-family: monospace; line-height: 1.3; tab-size: 2; padding: 6px; }',
    '.import-export-command-chains .editor::highlight(json-key) { color: var(--jsonKey); }',
    '.import-export-command-chains .editor::highlight(json-number) { color: var(--jsonNumber); }',
    '.import-export-command-chains .editor::highlight(json-bool) { color: var(--jsonBool); }',
    '.import-export-command-chains .editor::highlight(json-string) { color: var(--jsonString); }',
    '.import-export-command-chains .chained-command-item-value { background-color: var(--colorBgIntense); padding: 6px 12px; white-space: nowrap; overflow: auto; scrollbar-width: none; user-select: text; }',
  ], 'import-export-command-chains');

  const buttons = {
    import: {
      icon: icons.import,
      title: langs.import,
      click(key) {
        showDialogImport();
      },
      index: 2,
    },
    export: {
      icon: icons.export,
      title: langs.export,
      click(key) {
        showDialogExport(key);
      },
      index: 3,
    },
  };

  const commands = await getCommands();

  async function getCommands() {
    const response = await fetch(chrome.runtime.getURL('bundle.js'));
    const bundleScript = await response.text();
    const matches = Array.from(bundleScript.matchAll(/category\s*:\s*"([^"]+)",[\s\S]+?guid\s*:\s*"([^"]+)",[\s\S]+?\("(([^"]+)"\s*,\s*")?([^"]+)"\)/g));

    const commands = {};
    matches.forEach(match => {
      commands[match[2]] = {
        category: match[1],
        key: match[2],
        message: match[5],
        messageType: match[4],
        label: gnoh.i18n.getMessage(match[5], match[4]),
      };
    });

    return commands;
  }

  function highlightJson(element, text) {
    CSS.highlights.delete('json-number');
    CSS.highlights.delete('json-bool');
    CSS.highlights.delete('json-key');
    CSS.highlights.delete('json-string');

    if (!text) {
      return;
    }

    const jsonNumbers = [...text.matchAll(/-?\d+\.?\d*((E|e)[\+]\d+)?/ig)].map((match) => {
      const range = new Range();
      range.setStart(element.firstChild, match.index);
      range.setEnd(element.firstChild, match.index + match[0].length);
      return range;
    });

    const jsonNumbersHighlight = new Highlight(...jsonNumbers);
    CSS.highlights.set('json-number', jsonNumbersHighlight);

    const jsonBooleans = [...text.matchAll(/false|true|null/ig)].map((match) => {
      const range = new Range();
      range.setStart(element.firstChild, match.index);
      range.setEnd(element.firstChild, match.index + match[0].length);
      return range;
    });

    const jsonBooleansHighlight = new Highlight(...jsonBooleans);
    CSS.highlights.set('json-bool', jsonBooleansHighlight);

    const jsonKeys = [];
    const jsonStrings = [];

    [...text.matchAll(/(("([^"]|\\")+?[^\\]")|"")(\s*.)/ig)].forEach((match) => {
      const range = new Range();
      range.setStart(element.firstChild, match.index);
      range.setEnd(element.firstChild, match.index + match[1].length);

      if (match[4].trim() === ':') {
        jsonKeys.push(range);
      } else {
        jsonStrings.push(range);
      }
    });
    const jsonKeysHighlight = new Highlight(...jsonKeys);
    CSS.highlights.set('json-key', jsonKeysHighlight);
    const jsonStringsHighlight = new Highlight(...jsonStrings);
    CSS.highlights.set('json-string', jsonStringsHighlight);
  }

  function createEditor(attribute = {}, parent, inner, options) {
    const editor = gnoh.createElement('div', gnoh.object.merge({
      class: 'editor',
      contentEditable: attribute.contentEditable === false ? false : 'plaintext-only',
      events: {
        input() {
          setValue(this.textContent);
        },
      },
    }, attribute), parent, inner, options);

    function setValue(value) {
      editor.textContent = value;
      highlightJson(editor, value);
    }

    setValue(attribute.value || '');

    return {
      editor,
      setValue,
    };
  }

  async function parseTextFile(file) {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = event => resolve(event.target.result);
      fileReader.onerror = error => reject(error);
      fileReader.readAsText(file);
    })
  }

  function fixLanguageImport(commandChain) {
    commandChain.chain.forEach(chain => {
      if (chain.param && typeof chain.param === 'string') {
        chain.param = chain.param.replace(
          new RegExp('{(' + placeholdersEn.map(p => gnoh.encode.regex(p)).join('|') + ')}', 'gi'),
          (match, p1) => '{' + placeholdersCurrent[placeholdersEn.findIndex(p => p === p1)] + '}',
        );
      }
    });
  }

  function fixLanguageExport(commandChain) {
    commandChain.chain.forEach(chain => {
      if (chain.param && typeof chain.param === 'string') {
        chain.param = chain.param.replace(
          new RegExp('{(' + placeholdersCurrent.map(p => gnoh.encode.regex(p)).join('|') + ')}', 'gi'),
          (match, p1) => '{' + placeholdersEn[placeholdersCurrent.findIndex(p => p === p1)] + '}',
        );
      }
    });
  }

  async function showDialogImport(commandChainText) {
    const p1 = gnoh.createElement('p', {
      class: 'info',
      text: 'Import from code',
    });

    const editor = createEditor();

    let p2 = null;
    let inputFile = null;
    const content = [p1, editor.editor];

    if (commandChainText) {
      editor.editor.contentEditable = false;
      editor.setValue(commandChainText);
    } else {
      p2 = gnoh.createElement('p', {
        class: 'info',
        text: 'Import from file',
      });

      inputFile = gnoh.createElement('input', {
        name: 'file',
        type: 'file',
        accept: 'application/json',
      });

      content.push(p2, inputFile);
    }

    const buttonInputElement = Object.assign({}, gnoh.constant.dialogButtons.submit, {
      label: langs.import,
      async click(data) {
        if (editor.editor.textContent.trim()) {
          commandChainText = editor.editor.textContent.trim();
        } else if (data.file && data.file[0]) {
          commandChainText = await parseTextFile(data.file[0]);
        }

        if (!commandChainText || !checkCommandChain(commandChainText)) {
          gnoh.alert('Import failed');
        } else {
          await importCommandChain(JSON.parse(commandChainText));
          await reloadSetting();
        }
      },
    });

    const buttonPreviewElement = Object.assign({}, gnoh.constant.dialogButtons.submit, {
      label: langs.preview,
      async click(data) {
        if (editor.editor.textContent.trim()) {
          commandChainText = editor.editor.textContent.trim();
        } else if (data.file && data.file[0]) {
          commandChainText = await parseTextFile(data.file[0]);
        }

        if (!commandChainText || !checkCommandChain(commandChainText)) {
          gnoh.alert('Preview failed');
        } else {
          await showDialogPreview(commandChainText);
        }
      },
    });

    const buttonCancelElement = Object.assign({}, gnoh.constant.dialogButtons.cancel);

    gnoh.dialog(
      'Import Command Chain',
      content,
      [buttonInputElement, buttonPreviewElement, buttonCancelElement],
      {
        width: 500,
        class: 'import-export-command-chains',
      }
    );
  }

  async function showDialogExport(key) {
    if (!key) {
      return;
    }
    const commandChain = await getCommandChainByKey(key);
    fixLanguageExport(commandChain);
    const commandChainText = JSON.stringify(commandChain);

    const editor = createEditor({
      contentEditable: false,
      value: commandChainText,
    });

    const buttonCopyElement = Object.assign({}, gnoh.constant.dialogButtons.submit, {
      label: langs.copy,
      click: () => {
        navigator.clipboard.writeText(commandChainText);
      },
    });

    const buttonExportElement = Object.assign({}, gnoh.constant.dialogButtons.submit, {
      label: langs.export,
      click: () => {
        const filename = commandChain.label.trim()
          .replace(/\s+/g, '-').toLowerCase()
          .replace(/[^\p{L}0-9-]/gu, '')
          .replace(/^-+|-+$/g, '') || key;

        const commandChainUrl = URL.createObjectURL(new Blob([commandChainText], { type: 'application/json' }));

        chrome.downloads.download({
          url: commandChainUrl,
          filename: filename + '.json',
          saveAs: true,
        });

        URL.revokeObjectURL(commandChainUrl);
      },
    });

    const buttonCancelElement = Object.assign({}, gnoh.constant.dialogButtons.cancel);

    gnoh.dialog(
      'Export Command Chain',
      editor.editor,
      [buttonCopyElement, buttonExportElement, buttonCancelElement],
      {
        width: 500,
        class: 'import-export-command-chains',
      }
    );
  }

  function createCommandChainItem(chain, index) {
    const chainedCommandItem = gnoh.createElement('div', {
      class: 'ChainedCommand-Item',
    });

    const chainedCommandItemTitle = gnoh.createElement('div', {
      class: 'ChainedCommand-Item--Title floating-label',
    }, chainedCommandItem);

    const chainedCommandItemName = gnoh.createElement('span', {
      class: 'chained-command-item-name',
      text: 'Command ' + index,
    }, chainedCommandItemTitle);

    const chainedCommandItemValue = gnoh.createElement('div', {
      class: 'chained-command-item-value',
      text: commands[chain.key]?.label || chain.label || '',
    }, chainedCommandItemTitle);

    if (typeof chain.param !== 'undefined') {
      const chainedCommandItemParameter = gnoh.createElement('div', {
        class: 'ChainedCommand-Item--Parameter floating-label',
      }, chainedCommandItem);

      const chainedCommandItemParameterName = gnoh.createElement('span', {
        class: 'chained-command-item-name',
        text: langs.commandParameter,
      }, chainedCommandItemParameter);

      const chainedCommandItemParameterValue = gnoh.createElement('div', {
        class: 'chained-command-item-value',
        text: chain.param || chain.defaultValue || '',
      }, chainedCommandItemParameter);
    }

    return chainedCommandItem;
  }

  function createCommandChain(commandChain) {
    const chainName = gnoh.createElement('div', {
      class: 'chain-name',
      text: commandChain.label,
    });

    const chainedCommand = gnoh.createElement('div', {
      class: 'ChainedCommand',
    });

    commandChain.chain.forEach((chain, index) => {
      chainedCommand.append(createCommandChainItem(chain, index + 1));
    });

    return [chainName, chainedCommand];
  }

  async function showDialogPreview(commandChainText) {
    if (!checkCommandChain(commandChainText)) {
      return;
    }

    const commandChain = JSON.parse(commandChainText);
    fixLanguageImport(commandChain);

    const chainedCommand = createCommandChain(commandChain);

    const buttonInputElement = Object.assign({}, gnoh.constant.dialogButtons.submit, {
      label: langs.import,
      async click() {
        if (!commandChainText || !checkCommandChain(commandChainText)) {
          gnoh.alert('Import failed');
        } else {
          await importCommandChain(JSON.parse(commandChainText));
          await reloadSetting();
        }
      },
    });

    const buttonCancelElement = Object.assign({}, gnoh.constant.dialogButtons.cancel);

    gnoh.dialog(
      'Preview Command Chain',
      chainedCommand,
      [buttonInputElement, buttonCancelElement],
      {
        width: 750,
        class: 'import-export-command-chains',
      }
    );
  }

  function checkCommandChain(commandChainText) {
    let commandChain = null;
    try {
      commandChain = JSON.parse(commandChainText);
      fixLanguageImport(commandChain);
    } catch (e) {
      return false;
    }

    if (
      commandChain.category !== 'CATEGORY_COMMAND_CHAIN'
      || !Array.from(commandChain.chain)
      || commandChain.chain.some(c => typeof c.key !== 'string' || gnoh.uuid.check(c.key))
      || typeof commandChain.key !== 'string'
      || typeof commandChain.label !== 'string'
      || typeof commandChain.name !== 'string'
    ) {
      return false;
    } else {
      return true;
    }
  }

  async function getCommandChains() {
    return vivaldi.prefs.get('vivaldi.chained_commands.command_list');
  }

  async function getCommandChainByKey(key) {
    const commandList = await getCommandChains();
    const commandChain = commandList.find(c => c.key === key);
    if (commandChain) {
      return commandChain;
    } else {
      throw new Error('Key not found');
    }
  }

  async function importCommandChain(commandChain) {
    fixLanguageImport(commandChain);

    const commandList = await getCommandChains();
    const index = commandList.findIndex(c => c.key === commandChain.key);

    if (index === -1) {
      commandList.push(commandChain);
    } else {
      commandList[index] = commandChain;
    }

    vivaldi.prefs.set({
      path: 'vivaldi.chained_commands.command_list',
      value: commandList
    });
  }

  function getMenuItem(name) {
    const menuItem = document.evaluate(`//div[contains(concat(" ", normalize-space(@class), " "), " tree-row ") and contains(., "${name}")]`, document, null, XPathResult.ANY_TYPE, null);
    return menuItem.iterateNext();
  }

  async function reloadSetting() {
    try {
      const window = await chrome.windows.getLastFocused({ windowTypes: ['popup'] });
      if (window) {
        try {
          const vivExtData = JSON.parse(window.vivExtData);
          if (vivExtData.isSettings) {
            chrome.runtime.sendMessage({
              type: messageType,
              action: 'reload-setting',
              windowId: window.id,
            });
          }
        } catch (error) {
          console.error(error);
        }
      }
    } catch (error) {
      console.error(error);
    }


    const tabs = await chrome.tabs.query({ url: urls.quickCommands });
    tabs.forEach(async tab => {
      chrome.tabs.onUpdated.addListener(async function listener(tabId, changeInfo) {
        if (changeInfo.status === 'complete' && tabId === tab.id) {
          chrome.tabs.onUpdated.removeListener(listener);
          await chrome.tabs.update(tab.id, { url: urls.quickCommands });
        }
      });
      await chrome.tabs.update(tab.id, { url: urls.general });
    });
  }

  chrome.runtime.onMessage.addListener((info, sender, sendResponse) => {
    if (info.type === messageType) {
      (async () => {
        const window = await chrome.windows.getLastFocused({ windowTypes: ['normal'] });

        if (window && window.id === vivaldiWindowId || info.windowId === vivaldiWindowId) {
          switch (info.action) {
            case 'import':
              showDialogImport(info.data);
              break;
            case 'check':
              if (checkCommandChain(info.data)) {
                const data = JSON.parse(info.data);
                fixLanguageImport(data);
                try {
                  const commandChain = await getCommandChainByKey(data.key);
                  if (JSON.stringify(commandChain) === JSON.stringify(data)) {
                    sendResponse('installed');
                  } else {
                    sendResponse('update');
                  }
                } catch {
                  sendResponse('new');
                }
              } else {
                sendResponse('fail');
              }
              break;
            case 'reload-setting':
              const menuItemGeneralElement = getMenuItem(langs.general);
              const menuItemQuickCommandsElement = getMenuItem(langs.quickCommands);
              if (menuItemGeneralElement && menuItemQuickCommandsElement) {
                setTimeout(() => menuItemGeneralElement.click());
                setTimeout(() => menuItemQuickCommandsElement.click());
              }
              break;
          }
        }
      })();
      return true;
    }
  });

  vivaldi.prefs.onChanged.addListener(async newValue => {
    if (newValue.path === 'vivaldi.chained_commands.command_list') {
      const tabs = await chrome.tabs.query({ url: '*://forum.vivaldi.net/topic/*' });
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          type: messageType,
          action: 'change',
        });
      });
    }
  });

  function createButtonToolbar(attribute = {}, parent, inner, options) {
    return gnoh.createElement('button', gnoh.object.merge({
      class: 'button-toolbar',
    }, attribute), parent, inner, options);
  }

  function createSettings() {
    if (timeOut) {
      timeOut.stop();
    }
    timeOut = gnoh.timeOut(chainedCommand => {
      chainedCommand.dataset.importExportCommandChains = true;
      const masterToolbar = chainedCommand.querySelector('.master-toolbar:not([data-import-export-command-chains="true"])');
      masterToolbar.dataset.importExportCommandChains = true;

      const master = chainedCommand.querySelector('.master:not([data-import-export-command-chains="true"])');
      master.dataset.importExportCommandChains = true;

      async function selectedKey() {
        const itemSelected = master.querySelector('.master-items .item-selected');
        if (!itemSelected) {
          return;
        }
        const commandList = await getCommandChains();
        const indexSelected = gnoh.element.getIndex(itemSelected);
        return commandList[indexSelected] && commandList[indexSelected].key;
      }

      Object.values(buttons).forEach((button) => {
        gnoh.element.appendAtIndex(
          createButtonToolbar({
            html: button.icon,
            title: button.title,
            events: {
              async click(e) {
                e.preventDefault();
                const key = await selectedKey();
                button.click(key);
              },
            },
          }),
          masterToolbar,
          button.index,
        );
      });
    }, '.Setting--ChainedCommand.master-detail:not([data-import-export-command-chains="true"])');
  }

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
      if (tab.url === urls.quickCommands) {
        createSettings();
      } else if (/https:\/\/forum\.vivaldi\.net\/topic\/*/.test(tab.url)) {
        chrome.scripting.executeScript({
          target: {
            tabId: tab.id
          },
          args: [messageType, langs],
          func: (messageType, langs) => {
            if (window.importExportCommandChains) {
              return;
            } else {
              window.importExportCommandChains = true;
            }

            const buttonInstallElements = [];

            chrome.runtime.onMessage.addListener((info) => {
              if (info.type === messageType) {
                switch (info.action) {
                  case 'change':
                    buttonInstallElements.forEach(async (buttonElement) => {
                      const status = await chrome.runtime.sendMessage({
                        type: messageType,
                        action: 'check',
                        data: buttonElement.code,
                      });

                      updateButton(buttonElement, status);
                    });
                    break;
                }
              }
            });

            async function onInstallClick(event) {
              chrome.runtime.sendMessage({
                type: messageType,
                action: 'import',
                data: event.target.code,
              });
            }

            function updateButton(buttonElement, status) {
              if (status === 'new') {
                buttonElement.classList.add('btn-primary');
                buttonElement.classList.remove('btn-secondary');
                buttonElement.innerText = langs.install;
                buttonElement.disabled = false;
                buttonElement.addEventListener('click', onInstallClick);
              } else if (status === 'update') {
                buttonElement.classList.add('btn-primary');
                buttonElement.classList.remove('btn-secondary');
                buttonElement.innerText = langs.update;
                buttonElement.disabled = false;
                buttonElement.addEventListener('click', onInstallClick);
              } else if (status === 'installed') {
                buttonElement.classList.remove('btn-primary');
                buttonElement.classList.add('btn-secondary');
                buttonElement.innerText = langs.installed;
                buttonElement.disabled = true;
                buttonElement.removeEventListener('click', onInstallClick);
              }
            }

            function createButton(node) {
              const codes = node.querySelectorAll('code:not([data-import-export-command-chains="true"])');

              codes.forEach(async (codeElement) => {
                codeElement.dataset.importExportCommandChains = true;

                const code = codeElement.innerText.trim();

                const status = await chrome.runtime.sendMessage({
                  type: messageType,
                  action: 'check',
                  data: code,
                });

                if (status === 'fail') {
                  return;
                }

                const commandChainElement = document.createElement('div');
                commandChainElement.className = 'command-chain';

                const buttonInstallElement = document.createElement('button');
                buttonInstallElement.code = code;
                buttonInstallElement.className = 'btn mb-3';

                updateButton(buttonInstallElement, status);
                buttonInstallElements.push(buttonInstallElement);

                commandChainElement.append(buttonInstallElement);

                const preElement = codeElement.closest('pre');
                if (preElement) {
                  preElement.parentNode.insertBefore(commandChainElement, preElement.nextSibling);
                } else {
                  codeElement.parentNode.insertBefore(commandChainElement, codeElement.nextSibling);
                }
              });
            }

            createButton(document.body);

            const observer = new MutationObserver((mutationList) => {
              mutationList.forEach(mutation => {
                if (mutation.addedNodes.length) {
                  mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                      createButton(node);
                    }
                  });
                }
              });
            });

            observer.observe(document.body, {
              childList: true,
              subtree: true,
            });
          },
        });
      }
    }
  });

  gnoh.timeOut(async () => {
    if (document.querySelector('#main > .webpageview')) {
      const menuItemQuickCommandsElement = getMenuItem(langs.quickCommands);

      menuItemQuickCommandsElement.addEventListener('click', createSettings);
    } else {
      const tabs = await chrome.tabs.query({ active: true, windowId: vivaldiWindowId });
      if (tabs.length) {
        const tab = tabs[0];
        if (tab.url === urls.quickCommands) {
          createSettings();
        }
      }
    }
  }, '#main');
})();
