/* ─────────────────────────────────────────────
   METAPULSE — PARSER
   Extracts a structured metadata manifest from
   any HTML string. Pure, side-effect-free.
   ───────────────────────────────────────────── */

export const Parser = {
  /**
   * Parse an HTML string and return a manifest object.
   * @param {string} html
   * @returns {Manifest}
   */
  parse(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");

    const manifest = {
      title: "",
      description: "",
      canonical: "",
      robots: "",
      viewport: "",
      og: {},
      twitter: {},
      jsonld: [],
      raw: [],
      favicon: "",
    };

    // ── <title> ──────────────────────────────────
    const titleEl = doc.querySelector("title");
    if (titleEl) manifest.title = titleEl.textContent.trim();

    // ── <meta> tags ──────────────────────────────
    doc.querySelectorAll("meta").forEach((meta) => {
      const name = (meta.getAttribute("name") || "").toLowerCase().trim();
      const prop = (meta.getAttribute("property") || "").toLowerCase().trim();
      const itemprop = (meta.getAttribute("itemprop") || "")
        .toLowerCase()
        .trim();
      const content = (meta.getAttribute("content") || "").trim();

      const key = name || prop || itemprop;
      if (!key) return;

      manifest.raw.push({ key, content });

      if (key === "description") manifest.description = content;
      if (key === "robots") manifest.robots = content;
      if (key === "viewport") manifest.viewport = content;

      if (key.startsWith("og:")) manifest.og[key.slice(3)] = content; // store without prefix

      if (key.startsWith("twitter:")) manifest.twitter[key.slice(8)] = content; // store without prefix
    });

    const canonEl = doc.querySelector('link[rel="canonical"]');
    if (canonEl)
      manifest.canonical = (canonEl.getAttribute("href") || "").trim();

    // ── Favicon ──────────────────────────────────
    const faviconSelectors = [
      'link[rel="icon"]',
      'link[rel="shortcut icon"]',
      'link[rel="apple-touch-icon"]',
    ];
    for (const sel of faviconSelectors) {
      const el = doc.querySelector(sel);
      if (el) {
        manifest.favicon = (el.getAttribute("href") || "").trim();
        break;
      }
    }

    // ── JSON-LD ──────────────────────────────────
    doc.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
      try {
        manifest.jsonld.push(JSON.parse(s.textContent));
      } catch (_) {}
    });

    return manifest;
  },

  /**
   * Derive the best available value for a given purpose,
   * falling back across sources (twitter → og → basic).
   */
  resolve(manifest, purpose) {
    switch (purpose) {
      case "title":
        return manifest.twitter.title || manifest.og.title || manifest.title;
      case "description":
        return (
          manifest.twitter.description ||
          manifest.og.description ||
          manifest.description
        );
      case "image":
        return manifest.twitter.image || manifest.og.image || "";
      case "url":
        return manifest.og.url || manifest.canonical || manifest.url || "";
      case "domain": {
        const url = manifest.og.url || manifest.canonical || manifest.url || "";
        try {
          return new URL(url).hostname;
        } catch {
          return url || "example.com";
        }
      }
      case "sitename":
        return manifest.og.site_name || Parser.resolve(manifest, "domain");
      default:
        return "";
    }
  },
};
