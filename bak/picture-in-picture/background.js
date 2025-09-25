chrome.runtime.onMessage.addListener((message, sender, callback) => {
  // Test for tab. Web panels do not have this object.
  if (message.method === "getCurrentId" && sender.tab !== undefined) {
    // MessageSender contains a Tab object.
    callback({tabId: sender.tab.id});
  }
});
