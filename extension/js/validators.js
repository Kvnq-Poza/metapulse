/* ─────────────────────────────────────────────
   METAPULSE — VALIDATORS
   Audit rules, scoring, and asset checks.
   ───────────────────────────────────────────── */

/** Rule definitions — single source of truth */
export const RULES = [
  // ── Basic ──────────────────────────────────────────────────────────────
  {
    id: 'title',
    label: 'title',
    group: 'Basic',
    required: true,
    maxLen: 60,
    desc: 'The page <title> tag — the most fundamental SEO signal there is. Used in browser tabs, bookmarks, and search result headlines.',
    resolve: m => m.title,
    fix: () => `<title>Your Page Title — Up To 60 Characters</title>`,
  },
  {
    id: 'description',
    label: 'meta description',
    group: 'Basic',
    required: true,
    maxLen: 160,
    desc: 'The meta description snippet. Google may ignore it, but every other platform and human who reads a SERP definitely won\'t.',
    resolve: m => m.description,
    fix: () => `<meta name="description" content="A crisp, human-readable summary of the page. Aim for 120–160 characters — long enough to be useful, short enough not to get chopped.">`,
  },
  {
    id: 'canonical',
    label: 'canonical URL',
    group: 'Basic',
    required: false,
    desc: 'Tells search engines which URL is the "real" version of this page. Prevents duplicate-content penalties across paginated or filtered URLs.',
    resolve: m => m.canonical,
    fix: () => `<link rel="canonical" href="https://yoursite.com/the-canonical-url">`,
  },
  {
    id: 'robots',
    label: 'robots meta',
    group: 'Basic',
    required: false,
    desc: 'Tells crawlers what to do with this page (index it, follow links, etc.). Absence = "index, follow" by default — which is usually fine.',
    resolve: m => m.robots,
    fix: () => `<meta name="robots" content="index, follow">`,
  },
  {
    id: 'viewport',
    label: 'viewport',
    group: 'Basic',
    required: false,
    desc: 'Controls how the page scales on mobile. Absent? Google will notice. Your mobile users will suffer more.',
    resolve: m => m.viewport,
    fix: () => `<meta name="viewport" content="width=device-width, initial-scale=1">`,
  },

  // ── Open Graph ─────────────────────────────────────────────────────────
  {
    id: 'og:title',
    label: 'og:title',
    group: 'Open Graph',
    required: true,
    maxLen: 95,
    desc: 'The title shown when your link is shared on Facebook, LinkedIn, Slack, iMessage, and about 40 other platforms. Make it a good one.',
    resolve: m => m.og.title,
    fix: () => `<meta property="og:title" content="Your Page Title — Great for Sharing">`,
  },
  {
    id: 'og:description',
    label: 'og:description',
    group: 'Open Graph',
    required: true,
    maxLen: 200,
    desc: 'The teaser copy below the OG title. One sentence that makes someone want to click. That\'s all it needs to do.',
    resolve: m => m.og.description,
    fix: () => `<meta property="og:description" content="One sentence that makes a stranger click. You have about 200 characters — use them wisely.">`,
  },
  {
    id: 'og:image',
    label: 'og:image',
    group: 'Open Graph',
    required: true,
    desc: 'The preview image. Required for WhatsApp cards, Facebook rich links, and Slack unfurls. Without it, you\'re a sad empty box.',
    resolve: m => m.og.image,
    fix: () => `<meta property="og:image" content="https://yoursite.com/og-image.png">\n<!-- Ideal: 1200×630px, JPEG or PNG, under 300KB -->\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">`,
  },
  {
    id: 'og:url',
    label: 'og:url',
    group: 'Open Graph',
    required: false,
    desc: 'The canonical URL in Open Graph terms. Helps platforms aggregate share counts to a single URL instead of spreading them across variants.',
    resolve: m => m.og.url,
    fix: () => `<meta property="og:url" content="https://yoursite.com/this-page">`,
  },
  {
    id: 'og:type',
    label: 'og:type',
    group: 'Open Graph',
    required: false,
    desc: 'Content type — "website", "article", "video.movie", etc. Platforms use this to decide how to render your link. Default is "website".',
    resolve: m => m.og.type,
    fix: () => `<meta property="og:type" content="website">\n<!-- Options: website | article | video.movie | book | profile -->`,
  },
  {
    id: 'og:site_name',
    label: 'og:site_name',
    group: 'Open Graph',
    required: false,
    desc: 'The name of your site (not the page). Shows up in Slack unfurls and some Facebook placements. A small touch that adds polish.',
    resolve: m => m.og.site_name,
    fix: () => `<meta property="og:site_name" content="Your Brand Name">`,
  },

  // ── Twitter / X ────────────────────────────────────────────────────────
  {
    id: 'twitter:card',
    label: 'twitter:card',
    group: 'Twitter / X',
    required: true,
    validValues: ['summary', 'summary_large_image', 'app', 'player'],
    desc: 'Determines which Twitter card format renders. "summary_large_image" is almost always what you want — it makes your image big and hard to ignore.',
    resolve: m => m.twitter.card,
    fix: () => `<meta name="twitter:card" content="summary_large_image">\n<!-- Options: summary | summary_large_image | app | player -->`,
  },
  {
    id: 'twitter:title',
    label: 'twitter:title',
    group: 'Twitter / X',
    required: false,
    maxLen: 70,
    desc: 'Twitter-specific title. Falls back to og:title if missing. Set it explicitly if you want a punchier, character-constrained headline for X.',
    resolve: m => m.twitter.title,
    fix: () => `<meta name="twitter:title" content="Punchier Title for X (under 70 chars)">`,
  },
  {
    id: 'twitter:description',
    label: 'twitter:description',
    group: 'Twitter / X',
    required: false,
    maxLen: 200,
    desc: 'Twitter-specific description. Falls back to og:description. Twitter gives you ~200 characters to intrigue someone enough to click.',
    resolve: m => m.twitter.description,
    fix: () => `<meta name="twitter:description" content="The kind of description that makes people pause their scroll.">`,
  },
  {
    id: 'twitter:image',
    label: 'twitter:image',
    group: 'Twitter / X',
    required: false,
    desc: 'Twitter-specific card image. Falls back to og:image. Twitter recommends 1200×600px (2:1 ratio) for summary_large_image cards.',
    resolve: m => m.twitter.image,
    fix: () => `<meta name="twitter:image" content="https://yoursite.com/twitter-card.png">\n<!-- Optimal: 1200×600px for summary_large_image -->\n<meta name="twitter:image:alt" content="Description of the image for screen readers">`,
  },
  {
    id: 'twitter:site',
    label: 'twitter:site',
    group: 'Twitter / X',
    required: false,
    desc: 'Your Twitter/X @handle. Shows on cards as attribution. Free branding. Takes 10 seconds to add.',
    resolve: m => m.twitter.site,
    fix: () => `<meta name="twitter:site" content="@yourhandle">`,
  },
];

export const Validators = {
  /**
   * Run all rules against a manifest and return tagged results.
   * @param {object} manifest
   * @returns {AuditResult[]}
   */
  audit(manifest) {
    return RULES.map(rule => {
      const value = rule.resolve(manifest) || '';
      let status  = 'ok';
      let message = '';

      if (!value) {
        status  = rule.required ? 'err' : 'missing';
        message = rule.required
          ? 'Required — missing this breaks social previews.'
          : 'Optional but recommended.';
      } else {
        // length check
        if (rule.maxLen && value.length > rule.maxLen) {
          status  = 'warn';
          message = `${value.length}/${rule.maxLen} chars — will be truncated on some platforms.`;
        } else if (rule.maxLen) {
          message = `${value.length}/${rule.maxLen} chars`;
        }

        // valid-values check
        if (rule.validValues && !rule.validValues.includes(value)) {
          status  = 'warn';
          message = `"${value}" isn't a recognised value. Expected: ${rule.validValues.join(', ')}.`;
        }

        // absolute URL check for image fields
        if ((rule.id === 'og:image' || rule.id === 'twitter:image') && !value.startsWith('http')) {
          status  = 'warn';
          message = 'Must be an absolute URL (https://...). Relative paths won\'t work cross-platform.';
        }
      }

      return { rule, value, status, message };
    });
  },

  /**
   * Compute a 0–100 health score from audit results.
   */
  score(results) {
    let earned = 0;
    let max    = 0;

    results.forEach(r => {
      const weight = r.rule.required ? 12 : 4;
      max += weight;
      if      (r.status === 'ok')      earned += weight;
      else if (r.status === 'warn')    earned += Math.round(weight * 0.5);
      else if (r.status === 'missing') earned += Math.round(weight * 0.15);
      // 'err' = 0
    });

    return Math.min(100, Math.round((earned / max) * 100));
  },

  /**
   * Asset-level checks (image URL, format hints, etc.)
   */
  assetChecks(manifest) {
    const img = manifest.og.image || manifest.twitter.image || '';

    const isHttps    = img.startsWith('https://');
    const isHttp     = img.startsWith('http://');
    const isRelative = img && !isHttps && !isHttp;
    const ext        = img.split('?')[0].split('.').pop().toLowerCase();
    const goodExts   = ['jpg', 'jpeg', 'png', 'webp'];

    return [
      { label: 'OG Image Found',     value: img ? '✓ Present'     : '✗ Missing',           status: img       ? 'ok'   : 'err'  },
      { label: 'Absolute HTTPS URL', value: isHttps ? '✓ HTTPS'   : isHttp ? '⚠ HTTP'      : isRelative ? '✗ Relative' : '—', status: isHttps ? 'ok' : isHttp ? 'warn' : isRelative ? 'err' : 'na' },
      { label: 'Format',             value: img ? (goodExts.includes(ext) ? `✓ .${ext}`  : `⚠ .${ext} — use JPG/PNG/WebP`) : '—', status: !img ? 'na' : goodExts.includes(ext) ? 'ok' : 'warn' },
      { label: 'Ideal Dimensions',   value: '1200 × 630px',        status: 'na'  },
      { label: 'Twitter Optimal',    value: '1200 × 600px (2:1)',   status: 'na'  },
      { label: 'Max File Size',      value: '< 300 KB',            status: 'na'  },
      { label: 'og:type',            value: manifest.og.type || '⚠ Not set',      status: manifest.og.type ? 'ok' : 'warn' },
      { label: 'JSON-LD Schemas',    value: manifest.jsonld.length ? `✓ ${manifest.jsonld.length} found` : '— None', status: manifest.jsonld.length ? 'ok' : 'na' },
      { label: 'Viewport Meta',      value: manifest.viewport ? '✓ Present' : '⚠ Missing', status: manifest.viewport ? 'ok' : 'warn' },
    ];
  },
};
