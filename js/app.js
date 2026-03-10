/* ─────────────────────────────────────────────
   METAPULSE — APP CONTROLLER
   Orchestrates audit flow, state, and UI updates.
   ───────────────────────────────────────────── */

import { Parser } from "./parser.js";
import { Validators } from "./validators.js";
import { Formatter } from "./formatter.js";
import {
  showToast,
  copyText,
  renderGauge,
  scoreColor,
  scoreGrade,
  Previews,
  trunc,
} from "./ui.js";

// ── State ──────────────────────────────────────────────────────────────

const state = {
  manifest: null,
  results: [],
  score: 0,
  activePreview: "twitter", // 'twitter' | 'slack' | 'whatsapp' | 'google' | 'code'
  googleDevice: "desktop",
};

// ── DOM refs ───────────────────────────────────────────────────────────

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

// ── Boot ───────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  // Keyboard shortcut
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") runAudit();
  });

  // Demo button
  const demoBtn = $("demoBtn");
  if (demoBtn) demoBtn.addEventListener("click", loadDemo);
});

// ── Tab switchers ──────────────────────────────────────────────────────

window.switchPreviewTab = function (tab) {
  state.activePreview = tab;
  $$(".preview-tab").forEach((b) =>
    b.classList.toggle("active", b.dataset.tab === tab),
  );
  $$(".preview-pane").forEach((p) =>
    p.classList.toggle("active", p.dataset.pane === tab),
  );
  if (state.manifest) renderCurrentPreview(tab);
};

// ── Audit ──────────────────────────────────────────────────────────────

window.runAudit = async function () {
  const btn = $("auditBtn");
  btn.classList.add("loading");
  btn.disabled = true;

  try {
    const html = $("htmlInput").value.trim();
    if (!html) {
      showToast("Paste some HTML first", "warn");
      return;
    }

    // Parse & audit
    state.manifest = Parser.parse(html);
    state.results = Validators.audit(state.manifest);
    state.score = Validators.score(state.results);

    renderAll();
    showToast(`Audit complete — score: ${state.score}/100`);
  } finally {
    btn.classList.remove("loading");
    btn.disabled = false;
  }
};

// ── Render ─────────────────────────────────────────────────────────────

function renderAll() {
  renderScore();
  renderTagList();
  renderAssets();
  renderCurrentPreview(state.activePreview);

  // Reveal panels that were hidden
  $$(".initially-hidden").forEach((el) => {
    el.classList.remove("initially-hidden");
    el.style.display = "";
  });

  // Show tag list wrap
  const tlw = $("tagListWrap");
  if (tlw) {
    tlw.style.display = "";
    tlw.classList.remove("initially-hidden");
  }

  // Dispatch event so the inline script can react
  document.dispatchEvent(new CustomEvent("auditComplete"));
}

function renderScore() {
  const { score } = state;
  const color = scoreColor(score);
  const [grade, msg] = scoreGrade(score);

  // Gauge SVG
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

  // Helper to show a result container and hide its empty state
  function showResult(containerId, emptyId) {
    const container = $(containerId);
    const empty = $(emptyId);
    if (container) container.style.display = "block";
    if (empty) empty.style.display = "none";
  }

  if (tab === "twitter") {
    showResult("previewTwitter", "emptyTwitter");
    Previews.twitter(m, $("previewTwitter"));
  } else if (tab === "slack") {
    showResult("previewSlack", "emptySlack");
    Previews.slack(m, $("previewSlack"));
  } else if (tab === "whatsapp") {
    showResult("previewWhatsapp", "emptyWa");
    Previews.whatsapp(m, $("previewWhatsapp"));
  } else if (tab === "google") {
    showResult("previewGoogle", "emptyGoogle");
    Previews.google(m, $("previewGoogle"), state.googleDevice);
  } else if (tab === "code") {
    const codeSection = $("codeSection");
    const emptyCode = $("emptyCode");
    if (codeSection) codeSection.style.display = "block";
    if (emptyCode) emptyCode.style.display = "none";
    const html = Formatter.generateHead(m);
    $("codeOutput").innerHTML = html;
  }
}

// ── Fix Modal ──────────────────────────────────────────────────────────

window.openFixModal = function (result) {
  const rule = result.rule;
  const highlighted = Formatter.fix(rule);
  const plain = rule.fix();

  $("modalTitle").textContent = `Fix: ${rule.label}`;
  $("modalDesc").textContent = rule.desc;
  $("modalCode").innerHTML = highlighted;
  $("modalCopyBtn").onclick = () => copyText(plain, $("modalCopyBtn"));

  $("fixModal").classList.add("open");
};

window.closeFixModal = function (e) {
  if (
    !e ||
    e.target === $("fixModal") ||
    e.currentTarget.id === "modalCloseBtn"
  ) {
    $("fixModal").classList.remove("open");
  }
};

// ── Google device toggle ───────────────────────────────────────────────

window.setGoogleDevice = function (device, btn) {
  state.googleDevice = device;
  $$(".variant-btn").forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  renderCurrentPreview("google");
};

// ── Copy full code ─────────────────────────────────────────────────────

window.copyFullCode = function () {
  if (!state.manifest) return;
  copyText(Formatter.generateHeadPlain(state.manifest), $("copyFullBtn"));
};

// ── Demo loader ────────────────────────────────────────────────────────

function loadDemo() {
  const demo = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>MetaPulse — Social Previews, Perfected</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Stop shipping broken meta tags. Audit, preview, and optimise your site's social presence with real-time feedback and pixel-perfect platform simulations.">
  <link rel="canonical" href="https://metapulse.js.org">
  <meta property="og:type" content="website">
  <meta property="og:title" content="MetaPulse — Social Previews, Perfected">
  <meta property="og:description" content="The developer-first meta tag auditor. Open Graph, Twitter Cards, JSON-LD, and image checks — all in one pass.">
  <meta property="og:image" content="https://metapulse.js.org/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="https://metapulse.js.org">
  <meta property="og:site_name" content="MetaPulse">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="MetaPulse — Audit Your Meta Tags">
  <meta name="twitter:description" content="The developer-first tool for pixel-perfect social previews.">
  <meta name="twitter:image" content="https://metapulse.js.org/twitter-card.png">
  <meta name="twitter:site" content="@metapulse">
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebApplication","name":"MetaPulse","url":"https://metapulse.js.org","description":"Meta tag auditor and social preview tool"}<\/script>
</head>
<body></body>
</html>`;

  $("htmlInput").value = demo;
  runAudit();
}

// ── Utility ────────────────────────────────────────────────────────────

function esc(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
