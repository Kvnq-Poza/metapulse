# MetaPulse — Social Previews, Perfected

**MetaPulse** is a developer-first tool for auditing meta tags and simulating social previews in real-time. Whether you're debugging a missing `og:image` or fine-tuning your Google Search snippet, MetaPulse gives you the intelligence you need to make your links look professional on every platform.

---

## 🚀 Key Features

- **Universal Meta Auditor**: Scans **15+ meta tag types** (Open Graph, Twitter Cards, JSON-LD, Canonical, etc.) and validates them against platform-specific rules.
- **Pixel-Perfect Previews**: Accurate simulators for **Twitter (X)**, **Slack**, **WhatsApp**, and **Google Search** results.
- **Instant Code Fixes**: Generate optimised HTML snippets for missing or misconfigured tags with one click.
- **SEO Health Score**: A weighted 0–100 score that gives you a quick snapshot of your page's meta health.
- **Zero Dependencies**: Built with pure, modern JavaScript. Fast, secure, and client-side only.
- **Privacy First**: No data leaves your machine. The audit engine runs entirely in your browser.

---

## 📱 Platform Coverage

A link shared on Slack looks nothing like the same link on Twitter. MetaPulse understands the quirks of each:

- **Twitter / X**: Previews both Summary and Summary Large Image cards, with correct 70-character title truncation.
- **Slack**: Simulates full unfurls, including site name, title, description, and thumbnail crops.
- **WhatsApp**: Renders the dark-bubble link preview, enforcing strict HTTPS and image size requirements.
- **Google Search**: Shows desktop and mobile SERP snippets based on current pixel-width and character guidelines.

---

## 🛠 Project Structure

```text
metapulse/
├── extension/          # Chrome Extension
│   ├── js/             # Shared logic (parser, validators, etc.)
│   ├── popup/          # Extension popup UI
│   ├── scripts/        # Background/Content scripts (Manifest V3)
│   ├── sidepanel/      # Side Panel UI & logic
│   └── manifest.json   # Extension manifest
├── js/                 # Web App Logic
├── css/                # Styles (Tokens, Layouts, Tool-specific)
├── app.html            # The live auditor tool
├── docs.html           # Documentation page
└── index.html          # Landing page
```

---

## 🏁 Getting Started

### 1. Web Application

Simply open `index.html` in any modern browser to access the landing page, or go straight to `app.html` to start auditing.

### 2. Chrome Extension (Developer Mode)

The Chrome extension allows you to audit any live website via a side panel without leaving the tab.

1.  Open Chrome and navigate to `chrome://extensions/`.
2.  Enable **Developer mode** (toggle in the top right).
3.  Click **Load unpacked**.
4.  Select the `extension/` directory from this repository.
5.  Click the MetaPulse icon in your extensions bar to open the side panel or run a snapshot audit.

---

## 🧬 Technologies

MetaPulse is built for performance and simplicity:

- **HTML5 & CSS3**: Custom-built design system with glassmorphism and modern typography.
- **Vanilla JavaScript**: ES Modules for modularity, zero npm dependencies.
- **Chrome declarativeNetRequest**: For secure, high-performance extension rules.
- **DOMParser API**: For high-speed client-side HTML parsing.

---

## 📜 License

Part of the **JS.ORG** ecosystem. Open Source.
