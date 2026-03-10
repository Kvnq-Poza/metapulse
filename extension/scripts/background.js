// extension/scripts/background.js

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "audit-with-metapulse",
    title: "Audit with MetaPulse",
    contexts: ["page"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "audit-with-metapulse") {
    chrome.sidePanel.open({ windowId: tab.windowId });
  }
});

// Allow the popup to ask background to open sidepanel
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "OPEN_SIDE_PANEL") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.sidePanel.open({ windowId: tabs[0].windowId });
      }
    });
    sendResponse({ ok: true });
  }
});
