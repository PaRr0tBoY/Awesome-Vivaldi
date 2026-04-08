/*
 * Prefs Diagnostic Module
 * 测试 vivaldi.prefs.get 的返回值结构
 */

(() => {
  "use strict";

  const log = (...args) => console.log("[PrefsTest]", ...args);

  function runTests() {
    log("=== Prefs API Diagnostic ===");
    log("Testing vivaldi.prefs.get return value structure...");

    // Test 1: Callback style
    log("\n--- Test 1: Callback style ---");
    vivaldi.prefs.get("vivaldi.panels.web.elements", (result) => {
      log("Callback result type:", typeof result);
      log("Callback result:", result);
      log("Callback result?.value:", result?.value);
      log("Callback result?.value?.find:", typeof result?.value?.find);
      log("Callback result?.find:", typeof result?.find);
      log("Is result an object with .value?", result && typeof result === "object" && "value" in result);
      log("Is result an array?", Array.isArray(result));
      log("Is result.value an array?", Array.isArray(result?.value));
    });

    // Test 2: Promise style
    log("\n--- Test 2: Promise style ---");
    vivaldi.prefs.get("vivaldi.panels.web.elements").then((result) => {
      log("Promise result type:", typeof result);
      log("Promise result:", result);
      log("Promise result?.value:", result?.value);
      log("Is result an object with .value?", result && typeof result === "object" && "value" in result);
      log("Is result an array?", Array.isArray(result));
      log("Is result.value an array?", Array.isArray(result?.value));
    });

    // Test 3: Multiple prefs with Promise.all
    log("\n--- Test 3: Promise.all style ---");
    Promise.all([
      vivaldi.prefs.get("vivaldi.panels.web.elements"),
      vivaldi.prefs.get("vivaldi.toolbars.panel"),
    ]).then(([webElements, panels]) => {
      log("webElements:", webElements);
      log("panels:", panels);
      log("webElements?.value:", webElements?.value);
      log("panels?.value:", panels?.value);
    });

    // Test 4: Check vivaldi.prefs.get signature
    log("\n--- Test 4: Function signature ---");
    log("vivaldi.prefs.get.length:", vivaldi.prefs.get.length);
    log("vivaldi.prefs.get.name:", vivaldi.prefs.get.name);

    // Test 5: Check if prefs returns a thenable
    const testPref = vivaldi.prefs.get("vivaldi.panels.web.elements");
    log("Return value is thenable?", testPref && typeof testPref.then === "function");
    log("Return value is promise?", testPref instanceof Promise);

    log("\n=== Diagnostic complete ===");
    log("Check console output above for results.");
    log("Then run the following in console to get structured output:");
    log("  copy(JSON.stringify({callbackResult: window.__prefsTestCallbackResult, promiseResult: window.__prefsTestPromiseResult}, null, 2))");
  }

  // Inject a test panel to check DOM structure
  function testPanelDOM() {
    log("\n--- Test 6: Panel DOM Structure ---");
    const panels = document.querySelectorAll(".panel-group .webpanel-stack .panel.webpanel");
    log("Total webpanels found:", panels.length);
    panels.forEach((panel, i) => {
      log(`Panel ${i}: id=${panel.id}, dataset=${JSON.stringify(panel.dataset)}, class=${panel.className}`);
      const content = panel.querySelector(".webpanel-content");
      const header = panel.querySelector("header.webpanel-header");
      const webview = panel.querySelector("webview");
      log(`  - .webpanel-content: ${content ? "found" : "NOT found"}`);
      log(`  - header: ${header ? "found" : "NOT found"}`);
      log(`  - webview: ${webview ? "found" : "NOT found"}`);
      log(`  - webview.src: ${webview?.src}`);
    });
  }

  // Run after browser is ready
  const checkReady = setInterval(() => {
    if (document.getElementById("browser")) {
      clearInterval(checkReady);
      log("Browser ready, running tests...");
      runTests();
      testPanelDOM();
    }
  }, 300);

  // Also expose a global function for manual testing
  window.PrefsTest = {
    runTests,
    testPanelDOM,
    // Store results for later inspection
    results: {},
  };

  log("PrefsTest module loaded. Run PrefsTest.runTests() or PrefsTest.testPanelDOM() manually.");
})();
