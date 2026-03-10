/* ─────────────────────────────────────────────
   METAPULSE — UI HELPERS
   Shared DOM utilities and preview renderers.
   ───────────────────────────────────────────── */

import { Parser } from "./parser.js";

// ── Toast ──────────────────────────────────────────────────────────────

let toastTimer = null;

export function showToast(msg, type = "ok") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  const icon = { ok: "✓", warn: "!", err: "✗" }[type] || "✓";
  toast.querySelector(".toast-icon").textContent = icon;
  toast.querySelector(".toast-msg").textContent = msg;
  toast.style.borderLeftColor =
    type === "err"
      ? "var(--err)"
      : type === "warn"
        ? "var(--warn)"
        : "var(--accent)";
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

// ── Copy to clipboard ──────────────────────────────────────────────────

export function copyText(text, btnEl) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      if (btnEl) {
        const orig = btnEl.textContent;
        btnEl.textContent = "Copied!";
        btnEl.classList.add("copied");
        setTimeout(() => {
          btnEl.textContent = orig;
          btnEl.classList.remove("copied");
        }, 2000);
      }
      showToast("Copied to clipboard");
    })
    .catch(() => showToast("Copy failed — try selecting manually", "err"));
}

// ── Truncation ─────────────────────────────────────────────────────────

export const trunc = (str, len) =>
  str && str.length > len ? str.slice(0, len) + "…" : str || "";

// ── Gauge (semi-circle score ring) ─────────────────────────────────────
/**
 * Draw a semi-circle gauge in an SVG element.
 *
 * The arc goes from the 9-o'clock position (left, 180°) to the
 * 3-o'clock position (right, 0°), tracing the TOP half of the circle.
 * 0% = left tip. 100% = right tip.
 *
 * SVG coordinate system: angles grow clockwise from 3-o'clock.
 * So "left"  = 180°, "right" = 0° (or 360°).
 * We want the arc to go left→right along the top, i.e. 180° → 360°.
 */
export function renderGauge(svgEl, fillEl, score, color) {
  if (!svgEl || !fillEl) return;

  // Semi-circle: left (180°) → top (90°) → right (0°)
  // In SVG coords: centre at (100,100), radius 80
  // Left point:  (20, 100)
  // Right point: (180, 100)
  // Arc goes along the TOP half → large-arc-flag=1, sweep-flag=1
  const cx = 100,
    cy = 100,
    r = 80;
  const sx = cx - r; // 20 — left
  const sy = cy; // 100
  const ex = cx + r; // 180 — right
  const ey = cy; // 100

  const path = `M ${sx},${sy} A ${r},${r} 0 1,1 ${ex},${ey}`;

  // Circumference of the semi-circle
  const arcLen = Math.PI * r; // ≈ 251.3

  // Apply track path
  const trackEl = svgEl.querySelector("#gaugeTrack");
  if (trackEl) trackEl.setAttribute("d", path);

  // Apply fill
  fillEl.setAttribute("d", path);
  fillEl.style.strokeDasharray = `${arcLen}`;
  fillEl.style.strokeDashoffset = `${arcLen}`; // start fully hidden
  fillEl.style.stroke = color || "#2D9E5F";

  // Animate in on next frame
  const fraction = Math.max(0, Math.min(1, score / 100));
  const targetOffset = arcLen * (1 - fraction);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      fillEl.style.strokeDashoffset = `${targetOffset}`;
    });
  });
}

export function scoreColor(score) {
  if (score >= 80) return "var(--ok)";
  if (score >= 50) return "var(--warn)";
  return "var(--err)";
}

export function scoreGrade(score) {
  if (score >= 90)
    return ["EXCELLENT", "Nearly perfect. Your meta game is strong."];
  if (score >= 75)
    return ["GOOD", "Solid coverage. A few tweaks and you're golden."];
  if (score >= 55)
    return ["FAIR", "Room to improve. Some important tags are absent."];
  if (score >= 30)
    return ["POOR", "Several critical tags are missing. Time to fix up."];
  return ["CRITICAL", "Bare minimum at best. Social shares will look broken."];
}

// ── Preview Renderers ─────────────────────────────────────────────────

/**
 * Render all platform previews from the manifest.
 * Each renderer writes into a named container element.
 */
export const Previews = {
  twitter(manifest, containerEl) {
    const title = trunc(Parser.resolve(manifest, "title"), 70);
    const desc = trunc(Parser.resolve(manifest, "description"), 125);
    const image = Parser.resolve(manifest, "image");
    const domain = Parser.resolve(manifest, "domain");
    const favicon = Parser.resolve(manifest, "favicon");

    containerEl.innerHTML = `
      <div class="preview-label">Summary Card (small)</div>
      <div class="x-card-summary" style="margin-bottom:24px">
        <div class="x-card-summary-thumb">
          ${
            image
              ? `<img src="${esc(image)}" alt="OG Image" onerror="this.parentNode.innerHTML='🖼️'">`
              : "🖼️"
          }
        </div>
        <div class="x-card-summary-body">
          <div class="x-card-meta">
            ${favicon ? `<img src="${esc(favicon)}" class="x-card-fav" onerror="this.style.display='none'">` : ""}
            <div class="x-card-domain">${esc(domain)}</div>
          </div>
          <div class="x-card-title">${esc(title) || "No title found"}</div>
          <div class="x-card-desc">${esc(desc) || "No description found"}</div>
        </div>
      </div>

      <div class="preview-label">Large Image Card (summary_large_image)</div>
      <div class="x-card">
        <div class="x-card-img">
          ${
            image
              ? `<img src="${esc(image)}" alt="OG Image" onerror="this.parentNode.innerHTML='🖼️'">`
              : "🖼️"
          }
        </div>
        <div class="x-card-body">
          <div class="x-card-meta">
            ${favicon ? `<img src="${esc(favicon)}" class="x-card-fav" onerror="this.style.display='none'">` : ""}
            <div class="x-card-domain">${esc(domain)}</div>
          </div>
          <div class="x-card-title">${esc(title) || "No title found"}</div>
          <div class="x-card-desc">${esc(desc) || "No description found"}</div>
        </div>
      </div>
    `;
  },

  slack(manifest, containerEl) {
    const title = trunc(Parser.resolve(manifest, "title"), 75);
    const desc = trunc(Parser.resolve(manifest, "description"), 180);
    const image = Parser.resolve(manifest, "image");
    const sitename = Parser.resolve(manifest, "sitename");
    const url = Parser.resolve(manifest, "url") || "https://yoursite.com";
    const favicon = Parser.resolve(manifest, "favicon");

    containerEl.innerHTML = `
      <div class="slack-sim">
        <div class="slack-row">
          <div class="slack-avi">${favicon ? `<img src="${esc(favicon)}" alt="icon" style="width:100%;height:100%;object-fit:cover;border-radius:8px" onerror="this.outerHTML='U'">` : "U"}</div>
          <div class="slack-msg-body">
            <span class="slack-name">you</span>
            <span class="slack-ts">Today at 12:00 PM</span>
            <div class="slack-text">${esc(url)}</div>
            <div class="slack-unfurl">
              <div class="slack-unfurl-text">
                <div class="slack-unfurl-site">
                  ${favicon ? `<img src="${esc(favicon)}" class="slack-site-fav" onerror="this.style.display='none'">` : ""}
                  ${esc(sitename)}
                </div>
                <div class="slack-unfurl-title">${esc(title) || "No title"}</div>
                <div class="slack-unfurl-desc">${esc(desc) || "No description"}</div>
              </div>
              <div class="slack-unfurl-thumb">
                ${
                  image
                    ? `<img src="${esc(image)}" alt="thumb" onerror="this.parentNode.innerHTML='🖼️'">`
                    : "🖼️"
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  whatsapp(manifest, containerEl) {
    const title = trunc(Parser.resolve(manifest, "title"), 60);
    const desc = trunc(Parser.resolve(manifest, "description"), 100);
    const image = Parser.resolve(manifest, "image");
    const domain = Parser.resolve(manifest, "domain");
    const url = Parser.resolve(manifest, "url") || "https://yoursite.com";
    const favicon = Parser.resolve(manifest, "favicon");

    containerEl.innerHTML = `
      <div class="wa-sim">
        <div class="wa-bubble">
          <div class="wa-link-preview-img">
            ${
              image
                ? `<img src="${esc(image)}" alt="preview" onerror="this.parentNode.innerHTML='🖼️'">`
                : "🖼️"
            }
          </div>
          <div class="wa-link-meta">
            <div class="wa-link-title">
              ${favicon ? `<img src="${esc(favicon)}" class="wa-site-fav" onerror="this.style.display='none'">` : ""}
              ${esc(title) || "No title"}
            </div>
            <div class="wa-link-desc">${esc(desc) || "No description"}</div>
            <div class="wa-link-domain">${esc(domain)}</div>
          </div>
          <div class="wa-msg-text">${esc(url)}</div>
          <div class="wa-meta">
            <span class="wa-time">12:00</span>
            <span class="wa-ticks">✓✓</span>
          </div>
        </div>
      </div>
    `;
  },

  google(manifest, containerEl, device = "desktop") {
    const title = trunc(manifest.title || manifest.og.title || "", 60);
    const snippet = trunc(
      manifest.description || manifest.og.description || "",
      155,
    );
    const url = Parser.resolve(manifest, "url") || "";
    const domain = Parser.resolve(manifest, "domain");
    const favicon = Parser.resolve(manifest, "favicon");
    const path = url ? url.replace(/^https?:\/\/[^/]+/, "") || "/" : "";
    const today = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    containerEl.innerHTML = `
      <div class="variant-toggle" style="margin-bottom:20px">
        <button class="variant-btn ${device === "desktop" ? "active" : ""}" onclick="setGoogleDevice('desktop',this)">🖥 Desktop</button>
        <button class="variant-btn ${device === "mobile" ? "active" : ""}" onclick="setGoogleDevice('mobile',this)">📱 Mobile</button>
      </div>
      <div class="google-sim ${device === "mobile" ? "google-mobile" : ""}">
        <div class="google-crumb">
          <div class="google-fav">${favicon ? `<img src="${esc(favicon)}" alt="icon" style="width:100%;height:100%;object-fit:cover;border-radius:50%" onerror="this.outerHTML='🌐'">` : "🌐"}</div>
          <span class="google-site-name">${esc(domain)}</span>
          ${path ? `<span class="google-path"> › ${esc(path)}</span>` : ""}
        </div>
        <div class="google-title">${esc(title) || "Page title not found"}</div>
        <div class="google-snippet">
          <span class="google-date">${today} — </span>
          ${esc(snippet) || "No meta description found. Google may pull a snippet from the page body instead."}
        </div>
      </div>
    `;
  },
};

// ── Helpers ────────────────────────────────────────────────────────────

function esc(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
