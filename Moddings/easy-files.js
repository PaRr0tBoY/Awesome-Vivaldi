/*
 * Easy Files
 * Written by Tam710562
 * Optimized by AI
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
        return /(?:\.([^.]+))?$/.exec(fileName)?.[1]; // Use optional chaining for safety
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
          // Pre-compile regex for performance if called frequently with same patterns
          // For now, assume patterns change, so re-create
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
    // Optimized createElement for slightly better performance
    createElement(tagName, attribute, parent, inner, options) {
      if (typeof tagName === 'undefined') {
        return;
      }
      options = options || {};
      options.isPrepend = typeof options.isPrepend === 'undefined' ? false : options.isPrepend;

      const el = document.createElement(tagName);

      if (attribute && typeof attribute === 'object') {
        for (const key in attribute) {
          switch (key) {
            case 'text':
              el.textContent = attribute[key];
              break;
            case 'html':
              el.innerHTML = attribute[key];
              break;
            case 'style':
              if (typeof attribute[key] === 'object') {
                for (const css in attribute.style) {
                  el.style.setProperty(css, attribute.style[css]);
                }
              }
              break;
            case 'events':
              if (typeof attribute[key] === 'object') {
                for (const event in attribute.events) {
                  if (typeof attribute.events[event] === 'function') {
                    el.addEventListener(event, attribute.events[event]);
                  }
                }
              }
              break;
            default:
              if (key in el) { // Faster check than typeof el[key] !== 'undefined'
                el[key] = attribute[key];
              } else {
                el.setAttribute(key, typeof attribute[key] === 'object' ? JSON.stringify(attribute[key]) : attribute[key]);
              }
              break;
          }
        }
      }

      if (inner) {
        const innerElements = Array.isArray(inner) ? inner : [inner];
        for (const item of innerElements) {
          if (item?.nodeName) { // Check if it's a DOM node
            el.append(item);
          } else {
            el.append(this.createElementFromHTML(item));
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

      config = config || {};
      config.autoClose = typeof config.autoClose === 'undefined' ? true : config.autoClose;

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
        // Fix: Use removeListener correctly, it was previously adding it twice then removing once
        vivaldi.tabsPrivate.onWebviewClickCheck.removeListener(onClickCloseDialog);
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
    // timeOut is now a cleaner promise-based approach
    timeOut(callback, condition, timeOut = 300) {
      return new Promise(resolve => {
        let timeOutId;
        const checkCondition = () => {
          let result;
          if (!condition) {
            result = document.getElementById('browser');
          } else if (typeof condition === 'string') {
            result = document.querySelector(condition);
          } else if (typeof condition === 'function') {
            result = condition();
          }

          if (result) {
            callback(result);
            resolve(result); // Resolve the promise
            clearTimeout(timeOutId);
          } else {
            timeOutId = setTimeout(checkCondition, timeOut);
          }
        };
        timeOutId = setTimeout(checkCondition, timeOut); // Initial call

        // Added stop function to the returned promise for external control
        return {
          stop: () => clearTimeout(timeOutId)
        };
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
  // const maxAllowedSize = 1024 * 1024 * 5; // 5MB - Removed for testing purposes

  const pointerPosition = {
    x: 0,
    y: 0,
  };

  gnoh.addStyle([
    `.${nameKey}.dialog-custom .dialog-content { flex-flow: wrap; gap: 18px; }`,
    `.${nameKey}.dialog-custom .dialog-content .selectbox-wrapper { overflow: hidden; margin: -2px; padding: 2px; }`,
    `.${nameKey}.dialog-custom .dialog-content .selectbox-wrapper .selectbox-container { overflow: auto; margin: -2px; padding: 2px; flex: 0 1 auto; display: flex; flex-wrap: wrap; gap: 18px; }`,
    `.${nameKey}.dialog-custom .dialog-content .selectbox-wrapper .selectbox-container .selectbox-image { background-color: var(--colorBgLighter); width: 120px; height: 120px; display: flex; justify-content: center; align-items: center; }`,
    `.${nameKey}.dialog-custom .dialog-content .selectbox-wrapper .selectbox-container .selectbox-image:hover { box-shadow: 0 0 0 2px var(--colorHighlightBg); }`,
    `.${nameKey}.dialog-custom .dialog-content .selectbox-wrapper .selectbox-container .selectbox-image.preview img { object-fit: cover; width: 120px; height: 120px; flex: 0 0 auto; }`,
    // CSS for custom file icons
    `.${nameKey}.dialog-custom .dialog-content .selectbox-wrapper .selectbox-container .selectbox-image.icon .file-icon { width: 54px; height: 69px; padding: 15px 0 0; position: relative; font-family: sans-serif; }`,
    `.${nameKey}.dialog-custom .dialog-content .selectbox-wrapper .selectbox-container .selectbox-image.icon .file-icon:before { position: absolute; content: ''; left: 0; top: 0; height: 15px; left: 0; background-color: var(--colorFileIconBg, #007bff); right: 15px; }`,
    `.${nameKey}.dialog-custom .dialog-content .selectbox-wrapper .selectbox-container .selectbox-image.icon .file-icon:after { position: absolute; content: ''; width: 0; height: 0; border-style: solid; border-width: 15.5px 0 0 15.5px; border-color: transparent transparent transparent var(--colorFileIconBgLighter, #66b0ff); top: 0; right: 0; }`,
    `.${nameKey}.dialog-custom .dialog-content .selectbox-wrapper .selectbox-container .selectbox-image.icon .file-icon .file-icon-content { background-color: var(--colorFileIconBg, #007bff); top: 15px; color: var(--colorFileIconFg, #fff); position: absolute; left: 0; bottom: 0; right: 0; padding: 24.75px 0.3em 0; font-size: 19.5px; font-weight: 500; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }`,
    // CSS for OS file icons
    `.${nameKey}.dialog-custom .dialog-content .selectbox-wrapper .selectbox-container .selectbox-image.file-icon-os {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 120px; /* Ensure it fits the container */
      height: 120px; /* Ensure it fits the container */
    }`,
    `.${nameKey}.dialog-custom .dialog-content .selectbox-wrapper .selectbox-container .selectbox-image.file-icon-os img {
      max-width: 96px; /* Adjust size of the icon as needed */
      max-height: 96px; /* Adjust size of the icon as needed */
      object-fit: contain;
    }`,
    `.${nameKey}.dialog-custom .dialog-content .selectbox-wrapper .selectbox-container .selectbox-title { width: 120px; }`,
    `.${nameKey}.dialog-custom .dialog-content .selectbox-wrapper .selectbox-container .selectbox-title .filename-container { display: flex; flex-direction: row; overflow: hidden; width: 120px; }`,
    `.${nameKey}.dialog-custom .dialog-content .selectbox-wrapper .selectbox-container .selectbox-title .filename-container .filename-text { white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }`,
    `.${nameKey}.dialog-custom .dialog-content .selectbox-wrapper .selectbox-container .selectbox-title .filename-container .filename-extension { white-align-self: flex-end; white-space: nowrap; }`,
  ], nameKey);

  function inject(nameKey) {
    if (window.easyFiles) {
      return;
    } else {
      window.easyFiles = true;
    }

    const fileDataStore = {};

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

        for (const key in fileDataStore) {
          delete fileDataStore[key];
        }

        const currentClickedRect = { ...elementClickedRect };
        currentClickedRect.left = currentClickedRect.left - pointerPosition.x;
        currentClickedRect.top = currentClickedRect.top - pointerPosition.y;
        currentClickedRect.right = currentClickedRect.right - pointerPosition.x;
        currentClickedRect.bottom = currentClickedRect.bottom - pointerPosition.y;
        currentClickedRect.x = currentClickedRect.x - pointerPosition.x;
        currentClickedRect.y = currentClickedRect.y - pointerPosition.y;


        chrome.runtime.sendMessage({
          type: nameKey,
          action: 'click',
          attributes,
          elementClickedRect: currentClickedRect,
        });
      }
    }

    function handleMouseDown(event) {
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
            if (!fileDataStore[info.file.fileId]) {
                fileDataStore[info.file.fileId] = {};
            }
            fileDataStore[info.file.fileId][info.file.fileDataIndex] = info.file.fileData;

            const receivedChunks = Object.keys(fileDataStore[info.file.fileId]).length;
            if (receivedChunks === info.file.fileDataLength) {
              const dataTransfer = new DataTransfer();
              const sortedBase64Chunks = Object.keys(fileDataStore[info.file.fileId])
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map(key => fileDataStore[info.file.fileId][key]);
              const base64String = sortedBase64Chunks.join('');

              const unit8Array = Uint8Array.from(atob(base64String), c => c.charCodeAt(0));
              const decompressedArrayBuffer = await decompressArrayBuffer(unit8Array);

              dataTransfer.items.add(new File(
                [decompressedArrayBuffer],
                info.file.fileName,
                { type: info.file.mimeType },
              ));

              changeFile(dataTransfer);
              delete fileDataStore[info.file.fileId];
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
    return new Promise((resolve) => {
      const handlePaste = (e) => {
        e.preventDefault();
        const items = [];
        for (const item of e.clipboardData.items) {
          const file = item.getAsFile();
          if (file) {
            items.push({
              file: file,
              isFile: true,
            });
          }
        }
        document.removeEventListener('paste', handlePaste);
        resolve({
          items,
        });
      };

      document.addEventListener('paste', handlePaste);
      document.execCommand('paste');
    });
  }

  async function readClipboard(accept) {
    const clipboardFiles = [];
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.read) {
        try {
          const clipboardItems = await navigator.clipboard.read();

          const processingPromises = clipboardItems.map(async (clipboardItem) => {
            const imageTypes = clipboardItem.types.filter(type => type.startsWith('image/'));
            if (imageTypes.length > 0) {
              const blob = await clipboardItem.getType(imageTypes[0]);

              try {
                const jpegBlob = await convertPngToJpeg(blob);
                blob = jpegBlob;
              } catch (e) {
                console.warn("Failed to convert PNG to JPEG, proceeding with original format:", e);
              }

              const arrayBuffer = await blob.arrayBuffer();
              const compressedArrayBuffer = await gnoh.stream.compress(arrayBuffer);
              const compressedBase64String = btoa(new Uint8Array(compressedArrayBuffer)
                  .reduce((data, byte) => data + String.fromCharCode(byte), ''));
              const fileDataChunks = gnoh.array.chunks(compressedBase64String, chunkSize);

              const clipboardFile = {
                  fileData: fileDataChunks,
                  fileDataLength: fileDataChunks.length,
                  mimeType: blob.type,
                  size: blob.size,
                  category: 'clipboard',
                  fileId: gnoh.uuid.generate(),
                  fileName: `clipboard_image.${gnoh.file.getFileExtension(blob.type) || 'png'}`,
              };

              clipboardFile.previewUrl = await vivaldi.utilities.storeImage({
                  data: arrayBuffer,
                  mimeType: blob.type,
              });

              return clipboardFile;
            }
            return null;
          });

          const results = await Promise.allSettled(processingPromises);
          results.forEach(result => {
            if (result.status === 'fulfilled' && result.value) {
              clipboardFiles.push(result.value);
            }
          });

        } catch (clipboardError) {
          console.warn("Modern clipboard API failed, falling back to legacy method:", clipboardError);
          // Fall back to legacy method
          return await readClipboardLegacy(accept);
        }
      } else {
        // Use legacy method if modern API not available
        return await readClipboardLegacy(accept);
      }

    } catch (error) {
      console.error("Error reading clipboard:", error);
    }
    return clipboardFiles;
  }

  // Legacy clipboard reading method as fallback
  async function readClipboardLegacy(accept) {
    const clipboardFiles = [];
    try {
      const pasteData = await simulatePaste();

      const processingPromises = pasteData.items.map(async (item) => {
        const file = item.file;
        if (item.isFile && file) {
            let blob = new Blob([file], { type: file.type });

            try {
                const jpegBlob = await convertPngToJpeg(blob);
                blob = jpegBlob;
            } catch (e) {
                console.warn("Failed to convert PNG to JPEG, proceeding with PNG:", e);
            }

            const arrayBuffer = await blob.arrayBuffer();
            const compressedArrayBuffer = await gnoh.stream.compress(arrayBuffer);
            const compressedBase64String = btoa(new Uint8Array(compressedArrayBuffer)
                .reduce((data, byte) => data + String.fromCharCode(byte), ''));
            const fileDataChunks = gnoh.array.chunks(compressedBase64String, chunkSize);

            const clipboardFile = {
                fileData: fileDataChunks,
                fileDataLength: fileDataChunks.length,
                mimeType: blob.type,
                size: blob.size,
                category: 'clipboard',
                fileId: gnoh.uuid.generate(),
                fileName: file.name || `clipboard_file.${gnoh.file.getFileExtension(blob.type) || 'bin'}`,
            };

            if (blob.type.startsWith('image/')) {
                clipboardFile.previewUrl = await vivaldi.utilities.storeImage({
                    data: arrayBuffer,
                    mimeType: blob.type,
                });
            }
            return clipboardFile;
        }
        return null;
      });

      const results = await Promise.allSettled(processingPromises);
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          clipboardFiles.push(result.value);
        } else if (result.status === 'rejected') {
          console.error("Error processing clipboard item:", result.reason);
        }
      });

    } catch (error) {
      console.error("Error reading clipboard with legacy method:", error);
    }
    return clipboardFiles;
  }

  async function convertPngToJpeg(blob) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const canvas = gnoh.createElement('canvas', {
          width: image.width,
          height: image.height,
        });
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);

        canvas.toBlob(jpegBlob => {
          URL.revokeObjectURL(image.src);
          if (jpegBlob) {
            resolve(jpegBlob);
          } else {
            reject(new Error("Failed to convert PNG to JPEG."));
          }
        }, 'image/jpeg', 0.9);
      };
      image.onerror = (e) => {
        URL.revokeObjectURL(image.src);
        reject(e);
      };
      image.src = URL.createObjectURL(blob);
    });
  }

  async function getDownloadedFiles(accept) {
    try {
      const downloadedFiles = await chrome.downloads.search({
        exists: true,
        state: 'complete',
        orderBy: ['-startTime'],
        limit: 10
      });

      const filePromises = downloadedFiles.map(async (downloadedFile) => {
        // Less restrictive check - include files even without MIME type
        if (
          downloadedFile.exists === true
          && downloadedFile.state === 'complete'
          && downloadedFile.filename  // Ensure filename exists
        ) {
          const file = {
            // Try to get MIME type, fallback based on file extension
            mimeType: downloadedFile.mime || getMimeTypeFromFilename(downloadedFile.filename),
            path: downloadedFile.filename,
            fileName: downloadedFile.filename.replace(/^.*[\\/]/, ''),
            size: downloadedFile.fileSize || 0,
            category: 'downloaded-file',
            fileId: gnoh.uuid.generate(),
          };

          // Only try to generate preview for image files
          if (file.mimeType && file.mimeType.startsWith('image/')) {
            try {
              file.previewUrl = await vivaldi.utilities.storeImage({
                url: file.path,
              });
            } catch (previewError) {
              console.warn("Failed to generate preview for downloaded file:", file.fileName, previewError);
            }
          }
          return file;
        }
        return null;
      });

      const results = await Promise.allSettled(filePromises);
      const validFiles = {};
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          // Use file path as key to avoid duplicates
          if (!validFiles[result.value.path]) {
            validFiles[result.value.path] = result.value;
          }
        } else if (result.status === 'rejected') {
          console.error("Failed to process downloaded file:", result.reason);
        }
      });

      return Object.values(validFiles);
    } catch (error) {
      console.error("Error fetching downloaded files:", error);
      return [];
    }
  }

  // Helper function to get MIME type from filename
  function getMimeTypeFromFilename(filename) {
    const extension = filename.toLowerCase().split('.').pop();
    const mimeTypes = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'pdf': 'application/pdf',
      'txt': 'text/plain',
      'html': 'text/html',
      'css': 'text/css',
      'js': 'application/javascript',
      'json': 'application/json',
      'zip': 'application/zip',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
    return mimeTypes[extension] || 'application/octet-stream';
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

    gnoh.createElement('div', {
      class: 'file-icon-content',
      text: extension,
    }, fileIcon);

    return fileIcon;
  }

  function createSelectbox(sender, file, dialog) {
    const selectbox = gnoh.createElement('button', {
      title: `${file.fileName ? file.fileName + '\n' : ''}Size: ${gnoh.file.readableFileSize(file.size)}`,
      class: 'selectbox',
      events: {
        async click(event) {
          event.preventDefault();
          dialog.close();

          if (file.category === 'downloaded-file' && !file.fileData) {
            try {
              const arrayBuffer = await vivaldi.mailPrivate.readFileToBuffer(file.path);
              const compressedArrayBuffer = await gnoh.stream.compress(arrayBuffer);
              const compressedBase64String = btoa(new Uint8Array(compressedArrayBuffer)
                .reduce((data, byte) => data + String.fromCharCode(byte), ''));
              file.fileData = gnoh.array.chunks(compressedBase64String, chunkSize);
              file.fileDataLength = file.fileData.length;
            } catch (e) {
              console.error("Failed to read downloaded file:", e);
              return;
            }
          }

          if (file.category === 'clipboard' && !file.fileName) {
            const d = new Date();
            const year = d.getFullYear();
            const month = (d.getMonth() + 1).toString().padStart(2, '0');
            const date = d.getDate().toString().padStart(2, '0');
            const hour = d.getHours().toString().padStart(2, '0');
            const minute = d.getMinutes().toString().padStart(2, '0');
            const second = d.getSeconds().toString().padStart(2, '0');
            const millisecond = d.getMilliseconds().toString().padStart(3, '0');
            const ext = gnoh.file.getFileExtension(file.mimeType) || gnoh.file.getFileExtension(file.fileName) || 'bin';
            file.fileName = `clipboard_file_${year}-${month}-${date}_${hour}${minute}${second}${millisecond}.${ext}`;
          }

          if (file.fileData) {
            chooseFile(sender, file);
          } else {
            console.error("File data not available for selection.");
          }
        },
      },
    });

    const selectboxImage = gnoh.createElement('div', {
      class: 'selectbox-image',
    }, selectbox);

    if (file.previewUrl) {
      selectboxImage.classList.add('preview');
      gnoh.createElement('img', {
        src: file.previewUrl,
      }, selectboxImage);
    } else if (file.path) { // Only try to get OS icon if a path is available (i.e., for downloaded files)
        const iconContainer = gnoh.createElement('div', {
            class: 'file-icon-os'
        }, selectboxImage);

        vivaldi.files.getFileIcon(file.path, file.mimeType, (iconData) => {
            if (iconData && iconData.data) {
                gnoh.createElement('img', {
                    src: iconData.data,
                    alt: 'file icon'
                }, iconContainer);
            } else {
                // Fallback to your custom text icon if native icon is not available or path is missing
                selectboxImage.classList.add('icon');
                const extension = gnoh.file.getFileExtension(file.fileName || file.mimeType) || 'file';
                selectboxImage.append(createFileIcon(extension));
            }
        });
    } else { // Fallback for clipboard files without a path
        selectboxImage.classList.add('icon');
        const extension = gnoh.file.getFileExtension(file.fileName || file.mimeType) || 'file';
        selectboxImage.append(createFileIcon(extension));
    }


    const selectboxTitle = gnoh.createElement('div', {
      class: 'selectbox-title',
    }, selectbox);

    const filenameContainer = gnoh.createElement('div', {
      class: 'filename-container',
    }, selectboxTitle);

    if (file.fileName) {
      const extension = gnoh.file.getFileExtension(file.fileName);
      const name = extension ? file.fileName.substring(0, file.fileName.length - extension.length - 1) : file.fileName;

      gnoh.createElement('div', {
        class: 'filename-text',
        text: name,
      }, filenameContainer);

      if (extension) {
        gnoh.createElement('div', {
          class: 'filename-extension',
          text: '.' + extension,
        }, filenameContainer);
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
      label: gnoh.i18n.getMessage('Cancel'),
      cancel: true,
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
    dialog.dialog.style.maxWidth = '90vw';

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

        let newLeft = info.elementClickedRect.left;
        let newTop = info.elementClickedRect.bottom;

        if (newLeft + dialogRect.width > window.innerWidth) {
          newLeft = Math.max(0, info.elementClickedRect.right - dialogRect.width);
        }
        if (newLeft < 0) {
          newLeft = 0;
        }

        if (newTop + dialogRect.height > window.innerHeight) {
          newTop = Math.max(0, info.elementClickedRect.top - dialogRect.height);
        }
        if (newTop < 0) {
          newTop = 0;
        }

        dialog.modalBg.style.left = newLeft + 'px';
        dialog.modalBg.style.top = newTop + 'px';
      }
    }

    const resizeObserver = new ResizeObserver(setPosition);
    resizeObserver.observe(dialog.dialog);
    disconnectResizeObserver = () => resizeObserver.unobserve(dialog.dialog);


    const fragment = document.createDocumentFragment();

    if (clipboardFiles.length) {
      const selectboxWrapperClipboard = gnoh.createElement('div', {
        class: 'selectbox-wrapper',
      });

      gnoh.createElement('h3', {
        text: langs.clipboard,
      }, selectboxWrapperClipboard);

      const selectboxContainerClipboard = gnoh.createElement('div', {
        class: 'selectbox-container',
      }, selectboxWrapperClipboard);

      clipboardFiles.forEach(clipboardFile => {
        selectboxContainerClipboard.append(createSelectbox(sender, clipboardFile, dialog));
      });
      fragment.append(selectboxWrapperClipboard);
    }

    if (downloadedFiles.length) {
      const selectboxWrapperDownloaded = gnoh.createElement('div', {
        class: 'selectbox-wrapper',
      });

      gnoh.createElement('h3', {
        text: langs.downloads,
      }, selectboxWrapperDownloaded);

      const selectboxContainerDownloaded = gnoh.createElement('div', {
        class: 'selectbox-container',
      }, selectboxWrapperDownloaded);

      downloadedFiles.forEach(downloadedFile => {
        selectboxContainerDownloaded.append(createSelectbox(sender, downloadedFile, dialog));
      });
      fragment.append(selectboxWrapperDownloaded);
    }
    dialog.dialogContent.append(fragment);
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
    if (!file.fileData || file.fileData.length === 0) {
      console.error("Attempted to send empty or non-existent file data.");
      return;
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
          fileId: file.fileId,
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
          const [clipboardFilesResult, downloadedFilesResult] = await Promise.allSettled([
            readClipboard(info.attributes.accept),
            getDownloadedFiles(info.attributes.accept),
          ]);

          const clipboardFiles = clipboardFilesResult.status === 'fulfilled' ? clipboardFilesResult.value : [];
          if (clipboardFilesResult.status === 'rejected') {
              console.error("Error fetching clipboard files:", clipboardFilesResult.reason);
          }

          const downloadedFiles = downloadedFilesResult.status === 'fulfilled' ? downloadedFilesResult.value : [];
          if (downloadedFilesResult.status === 'rejected') {
              console.error("Error fetching downloaded files:", downloadedFilesResult.reason);
          }

          // Debug logging
          console.log(`Easy Files Debug: Found ${clipboardFiles.length} clipboard files and ${downloadedFiles.length} downloaded files`);
          console.log('Clipboard files:', clipboardFiles.map(f => f.fileName));
          console.log('Downloaded files:', downloadedFiles.map(f => f.fileName));

          if (clipboardFiles.length || downloadedFiles.length) {
            const webview = window[sender.tab.id] || document.elementFromPoint(pointerPosition.x, pointerPosition.y);
            let zoom = 1;
            let webviewZoom = 1;

            if (webview) {
              try {
                  zoom = parseFloat(gnoh.element.getStyle(webview).getPropertyValue('--uiZoomLevel')) || 1;
                  webviewZoom = await new Promise((resolve) => {
                      webview.getZoom((res) => {
                          resolve(res);
                      });
                  });
              } catch (e) {
                  console.warn("Could not get webview zoom levels, defaulting to 1:", e);
              }
            }


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
        }).catch(err => console.error(`Failed to inject script into tab ${tab.id}:`, err));
      });
    });

    chrome.webNavigation.onCommitted.addListener((details) => {
      if (details.tabId !== -1 && (details.frameId === 0 || details.url.startsWith('http'))) {
        chrome.scripting.executeScript({
          target: {
            tabId: details.tabId,
            frameIds: [details.frameId],
          },
          func: inject,
          args: [nameKey],
        }).catch(err => console.error(`Failed to inject script into frame ${details.frameId} of tab ${details.tabId}:`, err));
      }
    });
  }, () => window.vivaldiWindowId != null);
})();
