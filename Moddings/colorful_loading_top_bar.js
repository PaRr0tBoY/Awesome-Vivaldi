(function () {
  "use strict";

  const createProgressBar = () => {
    const progressBar = document.createElement("div");
    progressBar.id = "loading-bar";
    document.body.appendChild(progressBar);

    let currentProgress = 0;
    let loadingTabs = new Set();

    const updateProgress = (newWidth) => {
      if (newWidth > currentProgress) {
        progressBar.style.width = newWidth + "%";
        currentProgress = newWidth;
      }
    };

    const handleComplete = (details) => {
      if (loadingTabs.has(details.tabId)) {
        loadingTabs.delete(details.tabId);
        progressBar.style.width = "100%";
        setTimeout(() => {
          progressBar.style.width = "0%";
          currentProgress = 0;
        }, 500);
      }
    };

    const handleErrorOrAbort = (details) => {
      if (loadingTabs.has(details.tabId)) {
        loadingTabs.delete(details.tabId);
        progressBar.style.width = "0%";
        currentProgress = 0;
      }
    };

    const showLoadingBar = () => (progressBar.style.display = "block");
    const hideLoadingBar = () => (progressBar.style.display = "none");

    chrome.webNavigation.onBeforeNavigate.addListener((details) => {
      loadingTabs.add(details.tabId);
      updateProgress(20);
    });

    chrome.webNavigation.onDOMContentLoaded.addListener((details) => {
      if (loadingTabs.has(details.tabId)) updateProgress(70);
    });

    chrome.webNavigation.onCompleted.addListener(handleComplete);
    chrome.webNavigation.onErrorOccurred.addListener(handleErrorOrAbort);

    chrome.tabs.onActivated.addListener((activeInfo) => {
      if (loadingTabs.has(activeInfo.tabId)) showLoadingBar();
      else hideLoadingBar();
    });

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (tab.active) {
        if (loadingTabs.has(tabId)) showLoadingBar();
        else hideLoadingBar();
      }
    });
  };

  const loadingBarObserver = new MutationObserver((mutations, obs) => {
    const browserElement = document.getElementById("browser");
    if (browserElement) {
      obs.disconnect();
      createProgressBar();
    }
  });

  loadingBarObserver.observe(document.body, { childList: true, subtree: true });
})();
