// extension/popup/popup.js
import { Parser } from "../js/parser.js";
import { Validators } from "../js/validators.js";
import { scoreGrade, scoreColor } from "../js/ui.js";

document.getElementById("openAuditBtn").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "OPEN_SIDE_PANEL" });
  window.close();
});

async function runSnapshotAudit() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  if (tab.url.startsWith("chrome://") || tab.url.startsWith("about:")) {
    document.getElementById("scoreGrade").textContent = "N/A";
    document.getElementById("scoreGrade").style.fontSize = "0.8rem";
    document.getElementById("scoreGrade").innerHTML =
      "Cannot audit internal pages.";
    return;
  }

  // Get outerHTML of document.documentElement
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => document.documentElement.outerHTML,
  });

  if (result) {
    const manifest = Parser.parse(result);
    const results = Validators.audit(manifest);
    const score = Validators.score(results);
    const [gradeText] = scoreGrade(score);
    const color = scoreColor(score);

    document.getElementById("scoreBadge").textContent = score;
    document.getElementById("scoreBadge").style.background = color;
    // Ensure white text contrast for green/red/orange badges
    document.getElementById("scoreBadge").style.color = "white";
    document.getElementById("scoreGrade").textContent = gradeText;
    document.getElementById("scoreGrade").style.color = color;
  }
}

runSnapshotAudit();
