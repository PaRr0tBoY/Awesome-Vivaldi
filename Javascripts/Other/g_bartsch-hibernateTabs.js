(function () {
  const HIBERNATE_TIMEOUT = 15 * 1000; // 15 seconds
	//const HIBERNATE_TIMEOUT = 15 * 1000; // 15 seconds
	//const HIBERNATE_TIMEOUT = 30 * 1000; // 30 seconds
	//const HIBERNATE_TIMEOUT = 60 * 1000; // 1 minute
	//const HIBERNATE_TIMEOUT = 2 * 60 * 1000; // 2 minutes
	//const HIBERNATE_TIMEOUT = 3 * 60 * 1000; // 3 minutes
	//const HIBERNATE_TIMEOUT = 4 * 60 * 1000; // 4 minutes
	//const HIBERNATE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

  function hibernateInactiveTabs() {
    const tabs = chrome.tabs.query({ currentWindow: true, active: false }, (tabs) => {
      tabs.forEach((tab) => {
        const elapsedTime = Date.now() - tab.lastAccessed;
        if (elapsedTime >= HIBERNATE_TIMEOUT) {
          chrome.tabs.discard(tab.id);
        }
      });
    });
  }

  setInterval(hibernateInactiveTabs, HIBERNATE_TIMEOUT / 2);
})();
