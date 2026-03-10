import { Validators } from "../js/validators.js";
import { Formatter } from "../js/formatter.js";
import {
  showToast,
  copyText,
  renderGauge,
  scoreColor,
  scoreGrade,
  Previews,
  trunc,
} from "../js/ui.js";

const state = {
  manifest: null,
  results: [],
  score: 0,
  activePreview: "twitter",
  googleDevice: "desktop",
};

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

// ── Tab Listeners ──────────────────────────────────────────────────────

$$(".preview-tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    switchPreviewTab(btn.dataset.tab);
  });
});

function switchPreviewTab(tab) {
  state.activePreview = tab;
  $$(".preview-tab").forEach((b) =>
    b.classList.toggle("active", b.dataset.tab === tab),
  );
  $$(".preview-pane").forEach((p) =>
    p.classList.toggle("active", p.dataset.pane === tab),
  );
  if (state.manifest) renderCurrentPreview(tab);
}

// ── Render ─────────────────────────────────────────────────────────────

function renderAll() {
  renderScore();
  renderTagList();
  renderAssets();
  renderCurrentPreview(state.activePreview);
}

function renderScore() {
  const { score } = state;
  const color = scoreColor(score);
  const [grade, msg] = scoreGrade(score);

  const svgEl = $("gaugeSvg");
  const fillEl = $("gaugeFill");
  renderGauge(svgEl, fillEl, score, color);

  $("gaugeScore").textContent = score;
  $("gaugeScore").style.color = color;
  $("scoreGrade").textContent = grade;
  $("scoreGrade").style.color = color;
  $("scoreMsg").textContent = msg;

  const ok = state.results.filter((r) => r.status === "ok").length;
  const warn = state.results.filter((r) => r.status === "warn").length;
  const err = state.results.filter(
    (r) => r.status === "err" || r.status === "missing",
  ).length;

  $("countOk").textContent = ok;
  $("countWarn").textContent = warn;
  $("countErr").textContent = err;
}

function renderTagList() {
  const groups = {};
  state.results.forEach((r) => {
    const g = r.rule.group;
    if (!groups[g]) groups[g] = [];
    groups[g].push(r);
  });

  const tagListEl = $("tagList");
  tagListEl.innerHTML = "";

  Object.entries(groups).forEach(([groupName, results]) => {
    const lbl = document.createElement("div");
    lbl.className = "tag-group-label";
    lbl.textContent = groupName;
    tagListEl.appendChild(lbl);

    results.forEach((r) => {
      const iconMap = { ok: "✓", warn: "!", err: "✗", missing: "○" };
      const icon = iconMap[r.status] || "○";
      const canFix = r.status !== "ok";

      const item = document.createElement("div");
      item.className = "tag-item";
      item.innerHTML = `
        <div class="tag-status-icon ${r.status}">${icon}</div>
        <div class="tag-body">
          <div class="tag-name">${r.rule.label}</div>
          ${r.value ? `<div class="tag-value">${esc(trunc(r.value, 80))}</div>` : ""}
          ${r.message ? `<div class="tag-msg">${esc(r.message)}</div>` : ""}
        </div>
        ${canFix ? `<button class="tag-fix-btn" data-rule-id="${r.rule.id}">Fix ↗</button>` : ""}
      `;

      if (canFix) {
        item
          .querySelector(".tag-fix-btn")
          .addEventListener("click", () => openFixModal(r));
      }

      tagListEl.appendChild(item);
    });
  });
}

function renderAssets() {
  const checks = Validators.assetChecks(state.manifest);
  const assetEl = $("assetGrid");
  assetEl.innerHTML = checks
    .map(
      (c) => `
    <div class="asset-row">
      <span class="asset-key">${esc(c.label)}</span>
      <span class="asset-val ${c.status}">${esc(c.value)}</span>
    </div>
  `,
    )
    .join("");
}

function renderCurrentPreview(tab) {
  if (!state.manifest) return;
  const m = state.manifest;

  if (tab === "twitter") {
    Previews.twitter(m, $("previewTwitter"));
  } else if (tab === "slack") {
    Previews.slack(m, $("previewSlack"));
  } else if (tab === "whatsapp") {
    Previews.whatsapp(m, $("previewWhatsapp"));
  } else if (tab === "google") {
    // In sidepanel, we inject the toggle manually and attach listeners since CSP blocks inline clicks
    const containerEl = $("previewGoogle");
    Previews.google(m, containerEl, state.googleDevice);

    // Attach event listeners to variant toggles since injected HTML has inline onclick
    const btns = containerEl.querySelectorAll(".variant-btn");
    btns.forEach((b) => {
      // Remove inline onclick and attach proper listener
      b.removeAttribute("onclick");
      b.addEventListener("click", () => {
        state.googleDevice = b.textContent.includes("Desktop")
          ? "desktop"
          : "mobile";
        renderCurrentPreview("google");
      });
    });
  } else if (tab === "code") {
    const html = Formatter.generateHead(m);
    $("codeOutput").innerHTML = html;
  }
}

// ── Fix Modal ──────────────────────────────────────────────────────────

function openFixModal(result) {
  const rule = result.rule;
  const highlighted = Formatter.fix(rule);
  const plain = rule.fix();

  $("modalTitle").textContent = `Fix: ${rule.label}`;
  $("modalDesc").textContent = rule.desc;
  $("modalCode").innerHTML = highlighted;

  $("modalCopyBtn").onclick = () => copyText(plain, $("modalCopyBtn"));
  $("fixModal").classList.add("open");
}

function closeFixModal(e) {
  $("fixModal").classList.remove("open");
}

["modalCloseBtn", "modalCloseBtn2"].forEach((id) => {
  $(id).addEventListener("click", closeFixModal);
});
$("fixModal").addEventListener("click", (e) => {
  if (e.target === $("fixModal")) closeFixModal(e);
});

$("copyFullBtn").addEventListener("click", () => {
  if (!state.manifest) return;
  copyText(Formatter.generateHeadPlain(state.manifest), $("copyFullBtn"));
});

// ── Messaging with Content Script ──────────────────────────────────────

import { Parser } from "../js/parser.js";

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "LIVE_AUDIT_RESULT" && msg.manifest) {
    state.manifest = msg.manifest;
    state.results = Validators.audit(state.manifest);
    state.score = Validators.score(state.results);
    renderAll();
  }
});

// ── Helper: request audit from a specific tab ──────────────────────────

function requestAuditFromTab(tabId) {
  // Try pinging the content script first
  chrome.tabs.sendMessage(tabId, { type: "PING_AUDIT" }).catch(() => {
    // Content script not loaded — scrape HTML directly and audit in sidepanel
    chrome.scripting
      .executeScript({
        target: { tabId: tabId },
        func: () => document.documentElement.outerHTML,
      })
      .then(([{ result: html }]) => {
        if (html) {
          // Get the tab URL for resolution
          chrome.tabs.get(tabId, (tab) => {
            const baseUrl = (tab && tab.url) || "";
            const manifest = Parser.parse(html, baseUrl);
            manifest.url = manifest.url || baseUrl;
            state.manifest = manifest;
            state.results = Validators.audit(state.manifest);
            state.score = Validators.score(state.results);
            renderAll();
          });
        }
      })
      .catch(() => {
        $("scoreMsg").textContent = "Cannot audit this page. Try another tab.";
      });
  });
}

// ── Helper: reset the UI to a waiting state ────────────────────────────

function resetUI() {
  state.manifest = null;
  state.results = [];
  state.score = 0;

  $("gaugeScore").textContent = "--";
  $("gaugeScore").style.color = "";
  $("scoreGrade").textContent = "—";
  $("scoreGrade").style.color = "";
  $("scoreMsg").textContent = "Loading page data...";
  $("countOk").textContent = "—";
  $("countWarn").textContent = "—";
  $("countErr").textContent = "—";
  $("tagList").innerHTML = "";
  $("assetGrid").innerHTML = "";

  // Reset gauge fill
  const fillEl = $("gaugeFill");
  if (fillEl) {
    fillEl.style.strokeDashoffset = "251";
    fillEl.style.stroke = "var(--ok)";
  }

  // Clear preview panes
  [
    "previewTwitter",
    "previewSlack",
    "previewWhatsapp",
    "previewGoogle",
    "codeOutput",
  ].forEach((id) => {
    const el = $(id);
    if (el) el.innerHTML = "";
  });
}

// ── Request initial audit when sidepanel opens ─────────────────────────

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs.length > 0) {
    requestAuditFromTab(tabs[0].id);
  }
});

// ── Re-audit when user switches tabs ───────────────────────────────────

chrome.tabs.onActivated.addListener((activeInfo) => {
  resetUI();
  requestAuditFromTab(activeInfo.tabId);
});

// ── Re-audit when current tab finishes loading ─────────────────────────

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "complete") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0 && tabs[0].id === tabId) {
        resetUI();
        requestAuditFromTab(tabId);
      }
    });
  }
});

function esc(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
