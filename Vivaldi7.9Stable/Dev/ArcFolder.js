/**
 * ArcFolder.js
 * Tracks the actual width of the tab bar and the hover position of the tab stack in real-time
 * Used in conjunction with ArcFolder.css
 *
 * Sets two CSS variables:
 *   --tabbar-actual-width  Actual width of the tab bar (unaffected by transform)
 *   --tooltip-target-top   Viewport Y coordinate of the hovered tab stack
 */
(function arcFolderTooltipTracker() {
  function init() {
    const tabbarContainer = document.querySelector("#tabs-tabbar-container");
    if (!tabbarContainer) return false;

    const root = document.documentElement;

    // ── 1. Track tab bar width ──
    // offsetWidth is not affected by CSS transform (can still get actual width when auto-hide uses translateX to hide tab bar)
    const updateWidth = () => {
      const width = tabbarContainer.offsetWidth;
      if (width > 0) {
        root.style.setProperty("--tabbar-actual-width", width + "px");
      }
    };

    // ResizeObserver: tab bar expand/collapse/drag resize
    new ResizeObserver(updateWidth).observe(tabbarContainer);

    // MutationObserver: Vivaldi JS dynamically modifies inline width
    new MutationObserver(updateWidth).observe(tabbarContainer, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    updateWidth();

    // ── 2. Track vertical position of hovered tab stack ──
    // Listen for mouseover in the tab-strip area, locate .is-substack
    const tabStrip = document.querySelector(".tab-strip");
    if (tabStrip) {
      tabStrip.addEventListener("mouseover", (e) => {
        const substack = e.target.closest(".tab-position.is-substack");
        if (substack) {
          const rect = substack.getBoundingClientRect();
          root.style.setProperty("--tooltip-target-top", rect.top + "px");
        }
      });
    }

    // ── 3. Listen for class changes on #tabs-container (Left/Right toggle) ──
    const tabsContainer = document.querySelector("#tabs-container");
    if (tabsContainer) {
      new MutationObserver(updateWidth).observe(tabsContainer, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }

    console.log("[ArcFolder.js] initialized, tabbar width:", tabbarContainer.offsetWidth + "px");
    return true;
  }

  // Poll to wait for Vivaldi UI to finish rendering
  const poll = setInterval(() => {
    if (init()) clearInterval(poll);
  }, 300);
})();
