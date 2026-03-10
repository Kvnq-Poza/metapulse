// extension/scripts/content.js

// Keep track of the last parsed output to avoid redundant messages
let lastManifestStr = "";

async function runAudit() {
  try {
    const url = chrome.runtime.getURL("js/parser.js");
    const { Parser } = await import(url);

    // Scrape the DOM
    const html = document.documentElement.outerHTML;
    const manifest = Parser.parse(html);

    // Add current URL dynamically since the parser might not catch the live location if missing canonical
    manifest.url = manifest.url || window.location.href;

    const manifestStr = JSON.stringify(manifest);
    if (manifestStr !== lastManifestStr) {
      lastManifestStr = manifestStr;
      chrome.runtime.sendMessage({ type: "LIVE_AUDIT_RESULT", manifest });
    }
  } catch (err) {
    console.error("[MetaPulse] Content script error:", err);
  }
}

// Initial run
runAudit();

// Set up MutationObserver
const observer = new MutationObserver((mutations) => {
  let shouldRun = false;
  for (let m of mutations) {
    if (
      m.target === document.head ||
      m.target.nodeName === "META" ||
      m.target.nodeName === "TITLE"
    ) {
      shouldRun = true;
      break;
    }
  }
  if (shouldRun) runAudit();
});

// Since document.head might not be fully available initially on some sites, wait for it
if (document.head) {
  observer.observe(document.head, {
    childList: true,
    subtree: true,
    attributes: true,
  });
} else {
  document.addEventListener("DOMContentLoaded", () => {
    runAudit();
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      attributes: true,
    });
  });
}

// Also respond to ping requests from sidepanel when it opens
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "PING_AUDIT") {
    runAudit();
    sendResponse({ ok: true });
  }
});
