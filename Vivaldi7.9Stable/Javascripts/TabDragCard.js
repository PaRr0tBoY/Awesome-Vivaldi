/*
 * TabDragCard - Display a floating card when dragging tabs over the webview area
 * Shows a 100px height x 50px width card at cursor position during drag
 */

(() => {
  "use strict";

  const CONFIG = {
    cardWidth: 50,
    cardHeight: 100,
    offsetX: 15,
    offsetY: 15,
  };

  let dragCard = null;
  let isDragging = false;
  let dragEnterCount = 0;

  const createDragCard = () => {
    if (dragCard) return dragCard;

    dragCard = document.createElement("div");
    dragCard.id = "tab-drag-card";
    dragCard.style.cssText = `
      position: fixed;
      width: ${CONFIG.cardWidth}px;
      height: ${CONFIG.cardHeight}px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      pointer-events: none;
      z-index: 2147483647;
      opacity: 0;
      transition: opacity 0.15s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-weight: 500;
    `;
    document.body.appendChild(dragCard);
    return dragCard;
  };

  const showCard = (x, y) => {
    const card = createDragCard();
    card.style.left = `${x + CONFIG.offsetX}px`;
    card.style.top = `${y + CONFIG.offsetY}px`;
    card.style.opacity = "1";
  };

  const hideCard = () => {
    if (dragCard) {
      dragCard.style.opacity = "0";
    }
  };

  const removeCard = () => {
    if (dragCard) {
      dragCard.remove();
      dragCard = null;
    }
  };

  // Listen for drag start via tabsPrivate.onDragEnd
  // We use a flag approach since dragstart doesn't bubble
  const handleDragOver = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    showCard(e.clientX, e.clientY);
  };

  const handleDragEnter = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    showCard(e.clientX, e.clientY);
  };

  const handleDragLeave = (e) => {
    if (!isDragging) return;
    // Only hide if leaving the browser area
    if (!e.relatedTarget || !document.body.contains(e.relatedTarget)) {
      hideCard();
    }
  };

  const handleDrop = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    hideCard();
  };

  const handleDragEnd = () => {
    isDragging = false;
    hideCard();
    // Delay removal to allow for smooth transition
    setTimeout(removeCard, 150);
  };

  // Hook into Vivaldi's tab drag system via tabsPrivate API
  const init = () => {
    // Check if tabsPrivate API is available (vivaldi namespace)
    if (!vivaldi?.tabsPrivate) {
      console.warn("TabDragCard: tabsPrivate API not available");
      return;
    }

    // Listen for drag end to detect when drag session ends
    vivaldi.tabsPrivate.onDragEnd.addListener(() => {
      isDragging = false;
      hideCard();
      setTimeout(removeCard, 150);
    });

    // Listen for native drag events on document level
    // dragenter fires when drag image enters an element
    document.addEventListener("dragenter", (e) => {
      dragEnterCount++;
      if (dragEnterCount === 1) {
        isDragging = true;
      }
    }, { capture: true });

    document.addEventListener("dragleave", (e) => {
      dragEnterCount--;
      if (dragEnterCount <= 0) {
        dragEnterCount = 0;
        isDragging = false;
        hideCard();
      }
    }, { capture: true });

    document.addEventListener("dragend", () => {
      dragEnterCount = 0;
      isDragging = false;
      hideCard();
      setTimeout(removeCard, 150);
    });
  };

  // Attach drag event listeners - listen at document level for capture phase
  const initDragListeners = () => {
    document.addEventListener("dragover", handleDragOver, { capture: true, passive: false });
    document.addEventListener("dragenter", handleDragEnter, { capture: true, passive: false });
    document.addEventListener("drop", handleDrop, { capture: true, passive: false });
  };

  // Wait for DOM and initialize
  const waitForBrowser = () => {
    const browser = document.getElementById("browser");
    if (!browser) {
      setTimeout(waitForBrowser, 100);
      return;
    }
    init();
    initDragListeners();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", waitForBrowser);
  } else {
    waitForBrowser();
  }
})();
