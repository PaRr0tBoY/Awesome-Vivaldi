/*
 * Easy Files
 * Written by Tam710562
 */

(() => {
  'use strict';

  const gnoh = {
    stream: {
      async compress(input, outputType = 'arrayBuffer', format = 'gzip') {
        const compressedStream = new Response(input).body
          .pipeThrough(new CompressionStream(format));
        return await new Response(compressedStream)[outputType]();
      },
    },
    file: {
      readableFileSize(size) {
        const i = Math.floor(Math.log(size) / Math.log(1024));
        return `${(size / Math.pow(1024, i)).toFixed(2)} ${['B', 'kB', 'MB', 'GB', 'TB'][i]}`;
      },
      getFileExtension(fileName) {
        return /(?:\.([^.]+))?$/.exec(fileName)[1];
      },
      verifyAccept({ fileName, mimeType }, accept) {
        if (!accept) {
          return true;
        }

        const mimeTypes = accept.split(',')
          .map(x => x.trim())
          .filter(x => !!x && (x.startsWith('.') || /\w+\/([-+.\w]+|\*)/.test(x)));

        if (!mimeTypes.length) {
          return true;
        }

        for (const mt of mimeTypes) {
          if (
            mt.startsWith('.')
              ? new RegExp(mt.replace('.', '.+\\.') + '$').test(fileName)
              : new RegExp(mt.replace('*', '.+')).test(mimeType)
          ) {
            return true;
          }
        }

        return false;
      },
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
    array: {
      chunks(arr, n) {
        const result = [];
        for (let i = 0; i < arr.length; i += n) {
          result.push(arr.slice(i, i + n));
        }
        return result;
      },
    },
    element: {
      getStyle(element) {
        return getComputedStyle(element);
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
    string: {
      toHashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          hash = ((hash << 5) - hash) + str.charCodeAt(i);
          hash |= 0; // Convert to 32bit integer
        }
        return hash;
      },
      toColorRgb(str) {
        let hash = this.toHashCode(str);

        let r = (hash >> (0 * 8)) & 0xff;
        let g = (hash >> (1 * 8)) & 0xff;
        let b = (hash >> (2 * 8)) & 0xff;

        return { r, g, b };
      },
    },
    color: {
      rgbToHex(r, g, b) {
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
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
  };

  const nameKey = 'easy-files';

  const langs = {
    showMore: gnoh.i18n.getMessage('Show more'),
    chooseAFile: gnoh.i18n.getMessage('Choose a File...'),
    clipboard: gnoh.i18n.getMessage('Clipboard'),
    downloads: gnoh.i18n.getMessage('Downloads'),
  };

  const chunkSize = 1024 * 1024 * 10; // 10MB
  const maxAllowedSize = 1024 * 1024 * 5; // 5MB

  const pointerPosition = {
    x: 0,
    y: 0,
  };

  gnoh.addStyle([
    `.${nameKey}.dialog-custom .dialog-content { flex-flow: wrap; gap: 18px; }`,
    `.${nameKey}.dialog-custom .dialog-content .selectbox-wrapper { overflow: hidden; margin: -2px; padding: 2px; }`,
    `.${nameKey}.dialog-custom .dialog-content .selectbox-wrapper .selectbox-container { overflow: auto; margin: -2px; padding: 2px; flex: 0 1 auto; }`,
    `.${nameKey}.dialog-custom .dialog-content .selectbox-wrapper .selectbox-container .selectbox-image { background-color: var(--colorBgLighter); width: 120px; height: 120px; display: flex; justify-content: center; align-items: center; }`,
    `.${nameKey}.dialog-custom .dialog-content .selectbox-wrapper .selectbox-container .selectbox-image:hover { box-shadow: 0 0 0 2px var(--colorHighlightBg); }`,
    `.${nameKey}.dialog-custom .dialog-content .selectbox-wrapper .selectbox-container .selectbox-image.preview img { object-fit: cover; width: 120px; height: 120px; flex: 0 0 auto; }`,
    `.${nameKey}.dialog-custom .dialog-content .selectbox-wrapper .selectbox-container .selectbox-image.icon .file-icon { width: 54px; height: 69px; padding: 15px 0 0; position: relative; font-family: sans-serif; }`,
    `.${nameKey}.dialog-custom .dialog-content .selectbox-wrapper .selectbox-container .selectbox-image.icon .file-icon:before { position: absolute; content: ''; left: 0; top: 0; height: 15px; left: 0; background-color: var(--colorFileIconBg, #007bff); right: 15px; }`,
    `.${nameKey}.dialog-custom .dialog-content .selectbox-wrapper .selectbox-container .selectbox-image.icon .file-icon:after { position: absolute; content: ''; width: 0; height: 0; border-style: solid; border-width: 15.5px 0 0 15.5px; border-color: transparent transparent transparent var(--colorFileIconBgLighter, #66b0ff); top: 0; right: 0; }`,
    `.${nameKey}.dialog-custom .dialog-content .selectbox-wrapper .selectbox-container .selectbox-image.icon .file-icon .file-icon-content { background-color: var(--colorFileIconBg, #007bff); top: 15px; color: var(--colorFileIconFg, #fff); position: absolute; left: 0; bottom: 0; right: 0; padding: 24.75px 0.3em 0; font-size: 19.5px; font-weight: 500; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }`,
    `.${nameKey}.dialog-custom .dialog-content .selectbox-wrapper .selectbox-container .selectbox-title { width: 120px; }`,
    `.${nameKey}.dialog-custom .dialog-content .selectbox-wrapper .selectbox-container .selectbox-title .filename-container { display: flex; flex-direction: row; overflow: hidden; width: 120px; }`,
    `.${nameKey}.dialog-custom .dialog-content .selectbox-wrapper .selectbox-container .selectbox-title .filename-container .filename-text { white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }`,
    `.${nameKey}.dialog-custom .dialog-content .selectbox-wrapper .selectbox-container .selectbox-title .filename-container .filename-extension { white-space: nowrap; }`,
  ], nameKey);

  function inject(nameKey) {
    if (window.easyFiles) {
      return;
    } else {
      window.easyFiles = true;
    }

    const fileData = [];

    let fileInput = null;
    let elementClickedRect = null;

    const pointerPosition = {
      x: 0,
      y: 0,
    };

    async function decompressArrayBuffer(input) {
      const decompressedStream = new Response(input).body
        .pipeThrough(new DecompressionStream('gzip'));
      return await new Response(decompressedStream).arrayBuffer();
    }

    function getRect(element) {
      const rect = element.getBoundingClientRect().toJSON();
      while (element = element.offsetParent) {
        if (getComputedStyle(element).overflow !== 'visible') {
          const parentRect = element.getBoundingClientRect();
          rect.left = Math.max(rect.left, parentRect.left);
          rect.top = Math.max(rect.top, parentRect.top);
          rect.right = Math.min(rect.right, parentRect.right);
          rect.bottom = Math.min(rect.bottom, parentRect.bottom);
          rect.width = rect.right - rect.left;
          rect.height = rect.bottom - rect.top;
          rect.x = rect.left;
          rect.y = rect.top;
        }
      }
      return rect;
    }

    function handleClick(event) {
      if (event.target.matches('input[type=file]:not([webkitdirectory])')) {
        event.preventDefault();
        event.stopPropagation();

        fileInput = event.target;

        if (
          event.isTrusted
          && fileInput.checkVisibility({
            opacityProperty: true,
            visibilityProperty: true,
            contentVisibilityAuto: true,
          })
        ) {
          elementClickedRect = getRect(fileInput);
        }

        const attributes = {};

        for (const attr of fileInput.attributes) {
          attributes[attr.name] = attr.value;
        }

        fileData.length = 0;

        elementClickedRect.left = elementClickedRect.left - pointerPosition.x;
        elementClickedRect.top = elementClickedRect.top - pointerPosition.y;
        elementClickedRect.right = elementClickedRect.right - pointerPosition.x;
        elementClickedRect.bottom = elementClickedRect.bottom - pointerPosition.y;
        elementClickedRect.x = elementClickedRect.x - pointerPosition.x;
        elementClickedRect.y = elementClickedRect.y - pointerPosition.y;

        chrome.runtime.sendMessage({
          type: nameKey,
          action: 'click',
          attributes,
          elementClickedRect,
        });
      }
    }

    function handleMouseDown(event) {
      elementClickedRect = getRect(event.target);

      pointerPosition.x = event.clientX;
      pointerPosition.y = event.clientY;
    }

    document.addEventListener('click', handleClick);
    document.addEventListener('mousedown', handleMouseDown);

    function changeFile(dataTransfer) {
      fileInput.files = dataTransfer.files;
      fileInput.dispatchEvent(new Event('input', { bubbles: true }));
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    chrome.runtime.onMessage.addListener(async (info, sender, sendResponse) => {
      if (info.type === nameKey) {
        switch (info.action) {
          case 'file':
            fileData[info.file.fileDataIndex] = info.file.fileData;

            if (Object.entries(fileData).length === info.file.fileDataLength) {
              const dataTransfer = new DataTransfer();
              const base64String = fileData.join('');
              const unit8Array = Uint8Array.from(atob(base64String), c => c.charCodeAt(0));
              const decompressedArrayBuffer = await decompressArrayBuffer(unit8Array);
              dataTransfer.items.add(new File(
                [decompressedArrayBuffer],
                info.file.fileName,
                { type: info.file.mimeType },
              ));

              changeFile(dataTransfer);
            }
            break;
          case 'picker':
            fileInput.showPicker();
            break;
        }
      }
    });
  }

  async function simulatePaste() {
    return new Promise((resolve, reject) => {
      document.addEventListener('paste', (e) => {
        e.preventDefault();
        const items = [];
        let isRealFile = true;

        for (const item of e.clipboardData.items) {
          const file = item.getAsFile();
          const entry = item.webkitGetAsEntry();
          if (file) {
            if (!entry || entry.isFile) {
              items.push({
                file,
                isFile: true,
                isRealFile: !!entry,
              });
            } else if (entry.isDirectory) {
              items.push({
                file,
                isDirectory: true,
              });
            }
          }
        }

        resolve({
          items,
          isRealFile,
        });
      }, { once: true });

      document.execCommand('paste');
    });
  }

  async function readClipboard(accept) {
    const clipboardFiles = [];

    try {
      const supportedTypes = [
        {
          extension: 'png',
          mimeType: 'image/png',
        },
        {
          extension: 'jpeg',
          mimeType: 'image/jpeg',
        },
        {
          extension: 'jpg',
          mimeType: 'image/jpeg',
        },
      ];

      const supportedType = supportedTypes.find(s => gnoh.file.verifyAccept({ fileName: 'image.' + s.extension, mimeType: s.mimeType }, accept));

      const pasteData = await simulatePaste();

      for (const item of pasteData.items) {
        const file = item.file;
        let checkType = false;
        if (item.isFile) {
          if (item.isRealFile) {
            checkType = gnoh.file.verifyAccept({ fileName: file.name, mimeType: file.type }, accept);
          } else {
            checkType = supportedType && file.type === 'image/png';
          }
        }

        if (checkType && (!maxAllowedSize || file.size <= maxAllowedSize)) {
          let blob = new Blob([file], { type: file.type });

          if (!item.isRealFile && supportedType.mimeType === 'image/jpeg') {
            blob = await convertPngToJpeg(blob);
          }

          const arrayBuffer = await blob.arrayBuffer();
          const compressedArrayBuffer = await gnoh.stream.compress(arrayBuffer);
          const compressedBase64String = btoa(new Uint8Array(compressedArrayBuffer)
            .reduce((data, byte) => data + String.fromCharCode(byte), ''));
          const fileData = gnoh.array.chunks(compressedBase64String, chunkSize);
          const clipboardFile = {
            fileData: fileData,
            fileDataLength: fileData.length,
            mimeType: blob.type,
            size: blob.size,
            category: 'clipboard',
          };

          if (item.isRealFile) {
            clipboardFile.fileName = file.name;
          } else {
            clipboardFile.extension = supportedType.extension;
          }

          switch (clipboardFile.mimeType) {
            case 'image/jpeg':
            case 'image/png':
            case 'image/svg+xml':
            case 'image/webp':
            case 'image/gif':
            case 'image/bmp':
              try {
                clipboardFile.previewUrl = await vivaldi.utilities.storeImage({
                  data: arrayBuffer,
                  mimeType: blob.type,
                });
              } catch (error) {
                console.warn('Failed to create preview for clipboard image', error);
                // Continue without preview if it fails
              }
              break;
          }

          clipboardFiles.push(clipboardFile);
        }
      }
    } catch (error) {
      console.error(error);
    }

    return clipboardFiles;
  }

  async function convertPngToJpeg(blob) {
    const image = gnoh.createElement('img', {
      src: URL.createObjectURL(blob),
    });
    await image.decode();

    const canvas = gnoh.createElement('canvas', {
      width: image.width,
      height: image.height,
    });
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    return new Promise((resolve) => {
      canvas.toBlob(blob => {
        URL.revokeObjectURL(image.src);
        if (blob) {
          resolve(blob);
        }
      }, 'image/jpeg');
    });
  }

  async function getDownloadedFiles(accept) {
    const downloadedFiles = await chrome.downloads.search({ exists: true, state: 'complete', orderBy: ['-startTime'] });

    const result = {};
    for (let downloadedFile of downloadedFiles) {
      if (
        downloadedFile.mime
        && downloadedFile.mime !== 'application/x-msdownload'
        && gnoh.file.verifyAccept({ fileName: downloadedFile.filename, mimeType: downloadedFile.mime }, accept)
      ) {
        downloadedFile = (await chrome.downloads.search({ id: downloadedFile.id }))[0];

        if (
          downloadedFile
          && downloadedFile.exists === true
          && downloadedFile.state === 'complete'
          && (!maxAllowedSize || downloadedFile.fileSize <= maxAllowedSize)
          && !result[downloadedFile.filename]
        ) {
          const file = {
            mimeType: downloadedFile.mime,
            path: downloadedFile.filename,
            fileName: downloadedFile.filename.replace(/^.*[\\/]/, ''),
            size: downloadedFile.fileSize,
            category: 'downloaded-file',
          };

          switch (file.mimeType) {
            case 'image/jpeg':
            case 'image/png':
            case 'image/svg+xml':
            case 'image/webp':
            case 'image/gif':
            case 'image/bmp':
              try {
                file.previewUrl = await vivaldi.utilities.storeImage({
                  url: file.path,
                });
              } catch (error) {
                console.warn('Failed to create preview for file:', file.path, error);
                // Continue without preview if it fails
              }
              break;
          }

          result[downloadedFile.filename] = file;
        }
      }
    }

    return Object.values(result);
  }

  function createFileIcon(extension) {
    let colorBg = { r: 255, g: 255, b: 255 };
    if (extension) {
      colorBg = gnoh.string.toColorRgb(extension);
    }
    const isLightBg = gnoh.color.isLight(colorBg.r, colorBg.g, colorBg.b);
    const colorBgLighter = gnoh.color.shadeColor(colorBg.r, colorBg.g, colorBg.b, isLightBg ? 0.4 : -0.4);

    const fileIcon = gnoh.createElement('div', {
      class: 'file-icon',
      style: {
        '--colorFileIconBg': gnoh.color.rgbToHex(colorBg.r, colorBg.g, colorBg.b),
        '--colorFileIconBgLighter': gnoh.color.rgbToHex(colorBgLighter.r, colorBgLighter.g, colorBgLighter.b),
        '--colorFileIconFg': isLightBg ? '#f6f6f6' : '#111111',
      }
    });

    const fileIconContent = gnoh.createElement('div', {
      class: 'file-icon-content',
      text: extension,
    }, fileIcon);

    return fileIcon;
  }

  async function createSelectbox(sender, file, dialog) {
    const selectbox = gnoh.createElement('button', {
      title: `${file.fileName ? file.fileName + '\n' : ''}Size: ${gnoh.file.readableFileSize(file.size)}`,
      class: 'selectbox',
      events: {
        async click(event) {
          event.preventDefault();
          dialog.close();

          switch (file.category) {
            case 'downloaded-file':
              if (!file.fileData) {
                const arrayBuffer = await vivaldi.mailPrivate.readFileToBuffer(file.path);
                const compressedArrayBuffer = await gnoh.stream.compress(arrayBuffer);
                const compressedBase64String = btoa(new Uint8Array(compressedArrayBuffer)
                  .reduce((data, byte) => data + String.fromCharCode(byte), ''));
                file.fileData = gnoh.array.chunks(compressedBase64String, chunkSize);
                file.fileDataLength = file.fileData.length;
              }
              break;
            case 'clipboard':
              if (!file.fileName) {
                const d = new Date();
                const year = d.getFullYear();
                const month = (d.getMonth() + 1).toString().padStart(2, '0');
                const date = d.getDate().toString().padStart(2, '0');
                const hour = d.getHours().toString().padStart(2, '0');
                const minute = d.getMinutes().toString().padStart(2, '0');
                const second = d.getSeconds().toString().padStart(2, '0');
                const millisecond = d.getMilliseconds().toString().padStart(3, '0');
                file.fileName = `image_${year}-${month}-${date}_${hour}${minute}${second}${millisecond}.${file.extension}`;
              }
              break;
          }

          chooseFile(sender, file);
        },
      },
    });

    const selectboxImage = gnoh.createElement('div', {
      class: 'selectbox-image',
    }, selectbox);

    if (file.previewUrl) {
      selectboxImage.classList.add('preview');
    } else {
      selectboxImage.classList.add('icon');
    }

    if (file.previewUrl) {
      const image = gnoh.createElement('img', {
        src: file.previewUrl,
      }, selectboxImage);
    } else {
      const extension = file.extension || gnoh.file.getFileExtension(file.fileName);
      selectboxImage.append(createFileIcon(extension));
    }

    const selectboxTitle = gnoh.createElement('div', {
      class: 'selectbox-title',
    }, selectbox);

    const filenameText = gnoh.createElement('div', {
      class: 'filename-container',
    }, selectboxTitle);

    if (file.fileName) {
      const extension = file.extension || gnoh.file.getFileExtension(file.fileName);
      const name = extension ? file.fileName.substring(0, file.fileName.length - extension.length - 1) : file.fileName;

      const filenameContainer = gnoh.createElement('div', {
        class: 'filename-text',
        text: name,
      }, filenameText);

      if (extension) {
        const filenameExtension = gnoh.createElement('div', {
          class: 'filename-extension',
          text: '.' + extension,
        }, filenameText);
      }
    }

    return selectbox;
  }

  async function showDialogChooseFile({ info, sender, clipboardFiles, downloadedFiles }) {
    let disconnectResizeObserver;

    const buttonShowAllFilesElement = gnoh.object.merge(gnoh.constant.dialogButtons.submit, {
      label: langs.showMore,
      click() {
        showAllFiles(sender);
        disconnectResizeObserver && disconnectResizeObserver();
      },
    });

    const buttonCancelElement = gnoh.object.merge(gnoh.constant.dialogButtons.cancel, {
      click() {
        disconnectResizeObserver && disconnectResizeObserver();
      },
    });

    const dialog = gnoh.dialog(
      langs.chooseAFile,
      null,
      [buttonShowAllFilesElement, buttonCancelElement],
      {
        class: nameKey,
      }
    );
    dialog.dialog.style.maxWidth = 570 + 'px';

    dialog.modalBg.style.height = 'fit-content';
    dialog.modalBg.style.position = 'fixed';
    dialog.modalBg.style.margin = 'unset';
    dialog.modalBg.style.minWidth = 'unset';
    dialog.modalBg.style.left = 'unset';
    dialog.modalBg.style.top = 'unset';
    dialog.modalBg.style.right = 'unset';
    dialog.modalBg.style.bottom = 'unset';

    function setPosition(entries) {
      for (const entry of entries) {
        const dialogRect = entry.contentRect;

        if (info.elementClickedRect.left < 0) {
          dialog.modalBg.style.left = '0px';
        } else if (info.elementClickedRect.right > window.innerWidth) {
          dialog.modalBg.style.right = '0px';
        } else if (info.elementClickedRect.left + dialogRect.width > window.innerWidth) {
          dialog.modalBg.style.left = Math.max((info.elementClickedRect.right - dialogRect.width), 0) + 'px';
        } else {
          dialog.modalBg.style.left = info.elementClickedRect.left + 'px';
        }

        if (info.elementClickedRect.bottom < 0) {
          dialog.modalBg.style.top = '0px';
        } else if (info.elementClickedRect.bottom + dialogRect.height > window.innerHeight) {
          dialog.modalBg.style.top = Math.max((info.elementClickedRect.top - dialogRect.height), 0) + 'px';
        } else {
          dialog.modalBg.style.top = info.elementClickedRect.bottom + 'px';
        }
      }
    }

    const resizeObserver = new ResizeObserver(setPosition);
    resizeObserver.observe(dialog.dialog);
    disconnectResizeObserver = () => resizeObserver.unobserve(dialog.dialog);

    if (clipboardFiles.length) {
      const selectboxWrapperClipboard = gnoh.createElement('div', {
        class: 'selectbox-wrapper',
      });

      const h3Clipboard = gnoh.createElement('h3', {
        text: langs.clipboard,
      }, selectboxWrapperClipboard);

      const selectboxContainerClipboard = gnoh.createElement('div', {
        class: 'selectbox-container',
      }, selectboxWrapperClipboard);

      for (const clipboardFile of clipboardFiles) {
        selectboxContainerClipboard.append(await createSelectbox(sender, clipboardFile, dialog));
      }

      dialog.dialogContent.append(selectboxWrapperClipboard);
    }

    if (downloadedFiles.length) {
      const selectboxWrapperDownloaded = gnoh.createElement('div', {
        class: 'selectbox-wrapper',
      });

      const h3Downloaded = gnoh.createElement('h3', {
        text: langs.downloads,
      }, selectboxWrapperDownloaded);

      const selectboxContainerDownloaded = gnoh.createElement('div', {
        class: 'selectbox-container',
      }, selectboxWrapperDownloaded);

      for (const downloadedFile of downloadedFiles) {
        selectboxContainerDownloaded.append(await createSelectbox(sender, downloadedFile, dialog));
      }

      dialog.dialogContent.append(selectboxWrapperDownloaded);
    }
  }

  function showAllFiles(sender) {
    chrome.tabs.sendMessage(sender.tab.id, {
      type: nameKey,
      action: 'picker',
      tabId: sender.tab.id,
      frameId: sender.frameId,
    }, {
      frameId: sender.frameId,
    });
  }

  function chooseFile(sender, file) {
    if (!file.fileData.length) {
      file.fileData.push([]);
    }

    for (const [index, chunk] of file.fileData.entries()) {
      chrome.tabs.sendMessage(sender.tab.id, {
        type: nameKey,
        action: 'file',
        tabId: sender.tab.id,
        frameId: sender.frameId,
        file: {
          fileData: chunk,
          fileDataIndex: index,
          fileDataLength: file.fileData.length,
          fileName: file.fileName,
          mimeType: file.mimeType,
        },
      }, {
        frameId: sender.frameId,
      });
    }
  }

  vivaldi.tabsPrivate.onWebviewClickCheck.addListener((windowId, mousedown, button, clientX, clientY) => {
    if (
      windowId === vivaldiWindowId
      && mousedown
      && button === 0
    ) {
      pointerPosition.x = clientX;
      pointerPosition.y = clientY;
    }
  });

  chrome.runtime.onMessage.addListener(async (info, sender, sendResponse) => {
    if (
      sender.tab.windowId === vivaldiWindowId
      && info.type === nameKey
    ) {
      switch (info.action) {
        case 'click':
          const [clipboardFiles, downloadedFiles] = await Promise.all([
            readClipboard(info.attributes.accept),
            getDownloadedFiles(info.attributes.accept),
          ]);

          if (clipboardFiles.length || downloadedFiles.length) {
            const webview = window[sender.tab.id] || document.elementFromPoint(pointerPosition.x, pointerPosition.y);
            const zoom = parseFloat(gnoh.element.getStyle(webview).getPropertyValue('--uiZoomLevel'));
            const webviewZoom = await new Promise((resolve) => {
              webview.getZoom((res) => {
                resolve(res);
              });
            });

            const ratio = webviewZoom / zoom;

            info.elementClickedRect.left = info.elementClickedRect.left * ratio + pointerPosition.x;
            info.elementClickedRect.top = info.elementClickedRect.top * ratio + pointerPosition.y;
            info.elementClickedRect.right = info.elementClickedRect.right * ratio + pointerPosition.x;
            info.elementClickedRect.bottom = info.elementClickedRect.bottom * ratio + pointerPosition.y;
            info.elementClickedRect.width = info.elementClickedRect.width * ratio;
            info.elementClickedRect.height = info.elementClickedRect.height * ratio;
            info.elementClickedRect.x = info.elementClickedRect.x * ratio + pointerPosition.x;
            info.elementClickedRect.y = info.elementClickedRect.y * ratio + pointerPosition.y;

            showDialogChooseFile({
              info,
              sender,
              clipboardFiles,
              downloadedFiles,
            })
          } else {
            showAllFiles(sender);
          }
          break;
      }
    }
  });

  gnoh.timeOut(() => {
    chrome.tabs.query({ windowId: window.vivaldiWindowId, windowType: 'normal' }, (tabs) => {
      tabs.forEach((tab) => {
        chrome.scripting.executeScript({
          target: {
            tabId: tab.id,
            allFrames: true,
          },
          func: inject,
          args: [nameKey],
        });
      });
    });

    chrome.webNavigation.onCommitted.addListener((details) => {
      if (details.tabId !== -1) {
        chrome.scripting.executeScript({
          target: {
            tabId: details.tabId,
            frameIds: [details.frameId],
          },
          func: inject,
          args: [nameKey],
        });
      }
    });
  }, () => window.vivaldiWindowId != null);
})();
