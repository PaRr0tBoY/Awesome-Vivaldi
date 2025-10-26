// Accent Mod
// version 2021.11.0
// https://forum.vivaldi.net/topic/61827/accent-mod
// Use theme foreground or background color instead of fixed accent foreground
// color. Depends on the installation of additional CSS code (accentmod.css).

(function () {
  let RGB = (hex) =>
    hex
      .replace(
        /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
        (r, g, b) => "#" + r + r + g + g + b + b
      )
      .substring(1)
      .match(/.{2}/g)
      .map((x) => parseInt(x, 16));

  let lum = (r, g, b) => {
    let a = [r, g, b].map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  let contrast = (lum1, lum2) => {
    const bright = Math.max(lum1, lum2);
    const dark = Math.min(lum1, lum2);
    return (bright + 0.05) / (dark + 0.05);
  };

  let accentmod = () => {
    vivaldi.prefs.get("vivaldi.themes.current", (current) => {
      let themes = "user";
      if (current.startsWith("Vivaldi")) {
        themes = "system";
      }
      vivaldi.prefs.get(`vivaldi.themes.${themes}`, (collection) => {
        let index = collection.findIndex((x) => x.id === current);
        const theme = collection[index];
        if (theme.accentFromPage === false) {
          const app = document.getElementById("app");
          app.classList.add("accentmod");
          const bg = theme.colorBg;
          const fg = theme.colorFg;
          const ac = theme.colorAccentBg;
          const rgbBg = RGB(bg);
          const lumBg = lum(rgbBg[0], rgbBg[1], rgbBg[2]);
          const rgbFg = RGB(fg);
          const lumFg = lum(rgbFg[0], rgbFg[1], rgbFg[2]);
          const rgbAc = RGB(ac);
          const lumAc = lum(rgbAc[0], rgbAc[1], rgbAc[2]);
          const conAc1 = contrast(lumAc, lumBg);
          const conAc2 = contrast(lumAc, lumFg);
          if (
            (browser.matches(".theme-dark.acc-dark") && conAc1 > conAc2) ||
            (browser.matches(".theme-light.acc-light") && conAc1 > conAc2) ||
            (browser.matches(".theme-dark.acc-light") && conAc2 > conAc1) ||
            (browser.matches(".theme-light.acc-dark") && conAc2 > conAc1)
          ) {
            if (!app.classList.contains("accentswitch"))
              app.classList.add("accentswitch");
          } else if (app.classList.contains("accentswitch"))
            app.classList.remove("accentswitch");
        } else app.classList = "";
      });
    });
  };

  setTimeout(function wait() {
    const browser = document.getElementById("browser");
    if (browser) {
      accentmod();
      vivaldi.prefs.onChanged.addListener((ch) => {
        if (
          ch.path === "vivaldi.themes.current" ||
          ch.path === "vivaldi.themes.system" ||
          ch.path === "vivaldi.themes.user"
        ) {
          accentmod();
        }
      });
    } else setTimeout(wait, 300);
  }, 300);
})();
