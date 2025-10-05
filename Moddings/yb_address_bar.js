(function yb_address_bar() {
  "use strict";

  const STYLE = `
      .UrlBar-AddressField:has(.YBDomain) .UrlFragment--Lowlight:not(.YBDomain),
      .UrlBar-AddressField:has(.YBDomain) .UrlFragment-LinkWrapper,
      .UrlBar-AddressField:has(.YBDomain) .UrlFragment--Highlight:not(.YBTitle) {
          display: none;
      }

      .UrlFragments:has(.YBTitle) {
          display: flex;
      }

      .UrlBar-UrlObfuscationWarning {
          display: none;
      }

      .YBDomainButton {
          background-color: var(--colorAccentBg);
          color: var(--colorAccentFg);
          height: 20px !important;
          margin-left: 4px;
          border: none;
          line-height: 0;
          display: flex;
          align-items: center;
          transition: background-color 0.5s, border-color 0.5s;
      }

      .YBDomainButton:hover {
          background-color: var(--colorAccentBgAlpha);
      }

      .YBTitle {
          width: 100vw;
          margin-left: 10px;
          margin-right: 10px;
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 26px;
          font-size: 14px;
      }
  `;

  class YBAddressBar {
      urlFieldMutationObserver = null;
      titleMutationObserver = null;

      constructor() {
          this.#addStyle();
          this.#placeYBDomainButton();
          this.#placeYBTitle();
          this.urlFieldMutationObserver = this.#createUrlFieldMutationObserver();
          this.titleMutationObserver = this.#createTitleMutationObserver();
      }

      // listeners

      #createUrlFieldMutationObserver() {
          const urlFieldMutationObserver = new MutationObserver(() => {
              this.#placeYBDomainButton();
          });
          urlFieldMutationObserver.observe(this.#urlFieldInput, {
              attributes: true,
              attributeFilter: ['value']
          });
          return urlFieldMutationObserver;
      }

      #createTitleMutationObserver() {
          const titleMutationObserver = new MutationObserver(() => {
              this.#placeYBTitle();
          });
          titleMutationObserver.observe(this.#title, {
              childList: true,
              subtree: true
          });
          return titleMutationObserver;
      }

      #addDomainButtonListener(domainInfo) {
          this.#ybDomainButton.addEventListener('click', (event) => {
              event.stopPropagation();
              const prefix = this.#calculateDomainPrefix(domainInfo.type);
              const url = prefix + domainInfo.domain;
              this.#activeWebview.setAttribute('src', url);
          }, true);
      }

      // builders

      #createStyle() {
          const style = document.createElement('style');
          style.innerHTML = STYLE;
          return style;
      }

      #createYBDomainButton() {
          const domainInfo = this.#parseUrlDomain(this.#urlFragmentLink ? this.#urlFragmentLink.innerText : this.#urlFragmentHighlight.innerText);
          if (!domainInfo.domain) {
              return null;
          }

          const ybDomainButton = document.createElement('button');
          ybDomainButton.className = 'YBDomainButton';

          const ybDomain = this.#createYBDomain(domainInfo.domain);
          ybDomainButton.appendChild(ybDomain);
          this.#urlBarAddressField.insertBefore(ybDomainButton, this.#urlBarUrlFieldWrapper);
          if (domainInfo.clickable) {
              this.#addDomainButtonListener(domainInfo);
          }
          return ybDomainButton;
      }

      #createYBDomain(domain) {
          const ybDomain = document.createElement('div');
          ybDomain.className = 'UrlFragment--Lowlight YBDomain';
          ybDomain.innerText = domain;
          return ybDomain;
      }

      #createYbTitle() {
          var title = this.#title.innerText;
          if (title === 'Vivaldi') {
              title = this.#parseTitleFromUrl(this.#activeWebview.getAttribute('src'));
          }

          const ybTitle = document.createElement('div');
          ybTitle.className = 'UrlFragment--Highlight YBTitle';
          ybTitle.innerText = title;
          return ybTitle;
      }

      // actions

      #addStyle() {
          this.#head.appendChild(this.#createStyle());
      }

      #placeYBDomainButton() {
          if (!this.#urlBarAddressField) return;
          if (this.#ybDomainButton) {
              this.#urlBarAddressField.removeChild(this.#ybDomainButton);
          }
          if (this.#urlFragmentLink || this.#urlFragmentHighlight) {
              this.#createYBDomainButton();
          }
      }

      #placeYBTitle() {
          if (!this.#urlFragmentWrapper) return;
          if (this.#ybTitle) {
              this.#urlFragmentWrapper.removeChild(this.#ybTitle);
          }
          if (!this.#title) return;

          const ybTitle = this.#createYbTitle();
          this.#urlFragmentWrapper.appendChild(ybTitle);
      }

      // helpers

      #calculateDomainPrefix(type) {
          if (type === 'url') {
              return 'https://';
          } else if (type === 'vivaldi') {
              return 'vivaldi://';
          } else if (type === 'about') {
              return '';
          } else {
              return null;
          }
      }

      #parseVivaldiDomain(url) {
          const regexp = /vivaldi:\/\/([^\/]*)/;
          return url.match(regexp)[1];
      }

      #parseUrlDomain(url) {
          if (url.startsWith('vivaldi://')) {
              const domain = this.#parseVivaldiDomain(url);
              return {type: 'vivaldi', domain: domain, clickable: true};
          } else if (url.startsWith('file://')) {
              return {type: 'file', domain: 'file', clickable: false};
          } else if (url.startsWith('about:')) {
              return {type: 'about', domain: url, clickable: true};
          } else if (url.startsWith('chrome-extension://')) {
              return {type: 'extension', domain: 'extension', clickable: false};
          } else {
              return {type: 'url', domain: url, clickable: true};
          }
      }

      #parseTitleFromUrl(title) {
          const regexp = /\/([^\/]*)$/;
          return title.match(regexp)[1];
      }

      // getters

      get #head() {
          return document.querySelector('head');
      }

      get #title() {
          return document.querySelector('title');
      }

      get #urlFieldInput() {
          return document.querySelector('#urlFieldInput');
      }

      get #activeWebview() {
          return document.querySelector('.webpageview.active.visible webview');
      }

      get #urlBarAddressField() {
          return document.querySelector('.UrlBar-AddressField');
      }

      get #urlBarUrlFieldWrapper() {
          return document.querySelector('.UrlBar-AddressField .UrlBar-UrlFieldWrapper');
      }

      get #urlFragmentWrapper() {
          return document.querySelector('.UrlBar-AddressField .UrlFragment-Wrapper');
      }

      get #urlFragmentLink() {
          return document.querySelector('.UrlBar-AddressField .UrlFragment-Link');
      }

      get #urlFragmentHighlight() {
          return document.querySelector('.UrlBar-AddressField span.UrlFragment--Highlight');
      }

      get #ybDomainButton() {
          return document.querySelector('.YBDomainButton');
      }

      get #ybTitle() {
          return document.querySelector('.YBTitle');
      }
  };

  var interval = setInterval(() => {
      if (document.querySelector('#browser')) {
          window.ybAddressBar = new YBAddressBar();
          clearInterval(interval);
      }
  }, 100);
})();
