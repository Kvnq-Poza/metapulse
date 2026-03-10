/* ─────────────────────────────────────────────
   METAPULSE — FORMATTER
   Code generation and syntax highlighting.
   ───────────────────────────────────────────── */

const esc = str => String(str)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const escRaw = str => String(str)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

/** Highlight an HTML attribute/value pair */
const attr = (name, value) =>
  ` <span class="tok-attr">${esc(name)}</span><span class="tok-punct">="</span><span class="tok-val">${esc(value)}</span><span class="tok-punct">"</span>`;

/** Wrap in highlighted tag brackets */
const tag = (name) => `<span class="tok-tag">&lt;${name}</span>`;
const close = () => `<span class="tok-punct">&gt;</span>`;
const selfClose = () => `<span class="tok-punct">&gt;</span>`;
const openClose = (name) => `<span class="tok-tag">&lt;/${name}&gt;</span>`;

/** Comment line */
const comment = text => `<span class="tok-comment">&lt;!-- ${escRaw(text)} --&gt;</span>`;

export const Formatter = {
  /**
   * Generate a complete, highlighted <head> snippet from a manifest.
   * @param {object} manifest
   * @returns {string} HTML string with syntax highlight spans
   */
  generateHead(manifest) {
    const og = manifest.og;
    const tw = manifest.twitter;

    const title       = og.title       || manifest.title       || 'Your Page Title';
    const desc        = og.description || manifest.description || 'Your page description.';
    const image       = og.image       || 'https://yoursite.com/og-image.png';
    const url         = og.url         || manifest.canonical   || 'https://yoursite.com/page';
    const siteName    = og.site_name   || '';
    const ogType      = og.type        || 'website';
    const twCard      = tw.card        || 'summary_large_image';
    const twTitle     = tw.title       || title;
    const twDesc      = tw.description || desc;
    const twImage     = tw.image       || image;
    const canonical   = manifest.canonical || url;
    const robots      = manifest.robots || 'index, follow';
    const viewport    = manifest.viewport || 'width=device-width, initial-scale=1';

    const lines = [];

    const push = (...items) => items.forEach(i => i !== null && lines.push(i));

    push(
      comment('── Primary Meta ─────────────────────────────────'),
      `${tag('title')}${close()}${esc(title)}${openClose('title')}`,
      `${tag('meta')}${attr('charset', 'UTF-8')}${selfClose()}`,
      `${tag('meta')}${attr('name', 'viewport')}${attr('content', viewport)}${selfClose()}`,
      `${tag('meta')}${attr('name', 'description')}${attr('content', desc)}${selfClose()}`,
      `${tag('meta')}${attr('name', 'robots')}${attr('content', robots)}${selfClose()}`,
      `${tag('link')}${attr('rel', 'canonical')}${attr('href', canonical)}${selfClose()}`,
      '',
      comment('── Open Graph ────────────────────────────────────'),
      `${tag('meta')}${attr('property', 'og:type')}${attr('content', ogType)}${selfClose()}`,
      `${tag('meta')}${attr('property', 'og:title')}${attr('content', title)}${selfClose()}`,
      `${tag('meta')}${attr('property', 'og:description')}${attr('content', desc)}${selfClose()}`,
      `${tag('meta')}${attr('property', 'og:image')}${attr('content', image)}${selfClose()}`,
      `${tag('meta')}${attr('property', 'og:image:width')}${attr('content', '1200')}${selfClose()}`,
      `${tag('meta')}${attr('property', 'og:image:height')}${attr('content', '630')}${selfClose()}`,
      `${tag('meta')}${attr('property', 'og:url')}${attr('content', url)}${selfClose()}`,
      siteName ? `${tag('meta')}${attr('property', 'og:site_name')}${attr('content', siteName)}${selfClose()}` : null,
      '',
      comment('── Twitter / X ───────────────────────────────────'),
      `${tag('meta')}${attr('name', 'twitter:card')}${attr('content', twCard)}${selfClose()}`,
      `${tag('meta')}${attr('name', 'twitter:title')}${attr('content', twTitle)}${selfClose()}`,
      `${tag('meta')}${attr('name', 'twitter:description')}${attr('content', twDesc)}${selfClose()}`,
      `${tag('meta')}${attr('name', 'twitter:image')}${attr('content', twImage)}${selfClose()}`,
      tw.site ? `${tag('meta')}${attr('name', 'twitter:site')}${attr('content', tw.site)}${selfClose()}` : null,
    );

    return lines.filter(l => l !== null).join('\n');
  },

  /**
   * Generate highlighted fix code for a single rule.
   * @param {object} rule - from RULES array
   * @returns {string} highlighted HTML string
   */
  fix(rule) {
    // Get the raw fix string from the rule (may contain newlines and comments)
    const raw = rule.fix();
    return Formatter.highlightRaw(raw);
  },

  /**
   * Plain-text version of generateHead (for clipboard).
   */
  generateHeadPlain(manifest) {
    const og = manifest.og;
    const tw = manifest.twitter;
    const title    = og.title       || manifest.title       || 'Your Page Title';
    const desc     = og.description || manifest.description || 'Your page description.';
    const image    = og.image       || 'https://yoursite.com/og-image.png';
    const url      = og.url         || manifest.canonical   || 'https://yoursite.com/page';
    const siteName = og.site_name   || '';
    const ogType   = og.type        || 'website';
    const twCard   = tw.card        || 'summary_large_image';
    const twTitle  = tw.title       || title;
    const twDesc   = tw.description || desc;
    const twImage  = tw.image       || image;
    const canonical = manifest.canonical || url;
    const robots   = manifest.robots   || 'index, follow';
    const viewport = manifest.viewport || 'width=device-width, initial-scale=1';

    const lines = [
      `<!-- Primary Meta -->`,
      `<title>${title}</title>`,
      `<meta charset="UTF-8">`,
      `<meta name="viewport" content="${viewport}">`,
      `<meta name="description" content="${desc}">`,
      `<meta name="robots" content="${robots}">`,
      `<link rel="canonical" href="${canonical}">`,
      ``,
      `<!-- Open Graph -->`,
      `<meta property="og:type" content="${ogType}">`,
      `<meta property="og:title" content="${title}">`,
      `<meta property="og:description" content="${desc}">`,
      `<meta property="og:image" content="${image}">`,
      `<meta property="og:image:width" content="1200">`,
      `<meta property="og:image:height" content="630">`,
      `<meta property="og:url" content="${url}">`,
      siteName ? `<meta property="og:site_name" content="${siteName}">` : null,
      ``,
      `<!-- Twitter / X -->`,
      `<meta name="twitter:card" content="${twCard}">`,
      `<meta name="twitter:title" content="${twTitle}">`,
      `<meta name="twitter:description" content="${twDesc}">`,
      `<meta name="twitter:image" content="${twImage}">`,
      tw.site ? `<meta name="twitter:site" content="${tw.site}">` : null,
    ];

    return lines.filter(l => l !== null).join('\n');
  },

  /**
   * Highlight raw HTML source code string.
   * Handles multi-line input with comments.
   */
  highlightRaw(raw) {
    return raw
      .split('\n')
      .map(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('<!--')) {
          return `<span class="tok-comment">${escRaw(trimmed)}</span>`;
        }
        // Simple attribute highlighter
        return line
          .replace(/&/g, '&amp;')
          .replace(/</g, '\x00lt\x00')
          .replace(/>/g, '\x00gt\x00')
          .replace(/\x00lt\x00\//g, '<span class="tok-tag">&lt;/')
          .replace(/\x00lt\x00([a-z][a-z0-9-]*)/gi, (_, t) => `<span class="tok-tag">&lt;${t}</span>`)
          .replace(/\x00gt\x00/g, '<span class="tok-punct">&gt;</span>')
          .replace(/([a-z:_-]+)="([^"]*)"/gi, (_, a, v) =>
            `<span class="tok-attr">${a}</span><span class="tok-punct">="</span><span class="tok-val">${v}</span><span class="tok-punct">"</span>`)
          .replace(/</g, '&lt;').replace(/>/g, '&gt;'); // safety
      })
      .join('\n');
  },
};
