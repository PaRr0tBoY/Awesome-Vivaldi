// Monochrome icons
// version 2024.11.1
// https://forum.vivaldi.net/post/791344
// Makes web panel thumbnails monochrome depending on theme colors.

(async function monochrome_icons() {
  "use strict";

  function convert(srgb) {
    const val = srgb.slice(11, -1).trim().split(/\s+/);
    const r = Math.round(parseFloat(val[0]) * 255);
    const g = Math.round(parseFloat(val[1]) * 255);
    const b = Math.round(parseFloat(val[2]) * 255);
    const calc =
      (Math.atan2(Math.sqrt(3) * (g - b), 2 * r - g - b) * 180) / Math.PI;
    return (calc - 38.71).toFixed(2);
  }

  function theme(css) {
    const color = document.getElementById("main");
    color.style =
      "color: color-mix(in hsl, var(--colorFgFadedMost) 70%, var(--colorHighlightBg));";
    const srgb = getComputedStyle(color).getPropertyValue("color");
    color.removeAttribute("style");
    const hue = convert(srgb);
    // console.info(`hue-change: ${hue}°`);
    css.innerHTML = `
.button-toolbar-webpanel img {
  filter: brightness(0.77) sepia(1) hue-rotate(${hue}deg);
}
.toolbar-extensions img {
  filter: brightness(0.77) sepia(1) hue-rotate(${hue}deg);
}
#browser.isblurred.dim-blurred .button-toolbar-webpanel img {
  filter: brightness(0.77) sepia(1) hue-rotate(${hue}deg) opacity(0.65) !important;
}
    `;
  }

  const add_style = (id) => {
    const style = document.createElement("style");
    style.setAttribute("type", "text/css");
    style.id = id;
    document.head.appendChild(style);
    return document.getElementById(id);
  };

  const wait = () => {
    return new Promise((resolve) => {
      const check = document.getElementById("browser");
      if (check) return resolve(check);
      else {
        const startup = new MutationObserver(() => {
          const el = document.getElementById("browser");
          if (el) {
            startup.disconnect();
            resolve(el);
          }
        });
        startup.observe(document.body, { childList: true, subtree: true });
      }
    });
  };

  const lazy = (el, observer) => {
    observer.observe(el, { attributes: true, attributeFilter: ["style"] });
  };

  await wait().then((browser) => {
    const css = add_style("vm-mi-style");
    theme(css);
    const lazy_obs = new MutationObserver(() => {
      lazy_obs.disconnect();
      setTimeout(() => {
        theme(css);
        lazy(browser, lazy_obs);
      }, 300);
    });
    lazy(browser, lazy_obs);
  });
})();
