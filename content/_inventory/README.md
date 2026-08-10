# Capture inventory

Archive of the pre-rebuild asktic.com Wix site and the Freshdesk help centre. This is a
**record**, not build input — the site build never reads this directory. Content is
hand-ported from here into `app/` and `content/kb/` in Phase 3.

## Status: empty, and deliberately so

Nothing has been captured yet. The crawl could not run in the environment where this
scaffold was built: `www.asktic.com`, `support.asktic.com` and `static.wixstatic.com`
are all blocked by the egress policy (verified — `403 CONNECT` / `EGRESS_BLOCKED`).

No page content, article text or inventory row has been invented to fill the gap. Every
file below is either an empty container or a schema.

### To run the capture

1. Allowlist `www.asktic.com`, `support.asktic.com` and `static.wixstatic.com` on the
   environment's egress policy.
2. Set `FRESHDESK_API_KEY` (see `.env.example`).
3. Run, in order:

   ```
   npm run capture:site        # sitemap -> pages/
   npm run capture:assets      # wixstatic images -> ../../public/images
   npm run capture:freshdesk   # help centre + Solutions API -> freshdesk/
   npm run gen:redirects       # freshdesk/redirects.json -> render.yaml
   ```

## Layout

```
_inventory/
  inventory.json            page manifest (one row per captured page)
  STOP-REPORT.md            written only when a stop condition trips
  pages/
    <slug>.json             structured capture
    <slug>.html             raw HTML snapshot, for fidelity checks
  freshdesk/
    public/<folder>/<id>-<slug>.json      publicly served articles
    internal/<folder>/<id>-<slug>.json    INTERNAL category (operator KB, not public)
    redirects.json                        per-article 301 map
```

## `pages/<slug>.json`

```jsonc
{
  "path": "/maternity-insurance",
  "url": "https://www.asktic.com/maternity-insurance",
  "capturedAt": "2026-08-10T00:00:00.000Z",
  "title": "…",
  "metaDescription": "…",
  "h1": "…",
  "blocks": [
    { "type": "heading", "level": 2, "text": "…" },
    { "type": "paragraph", "text": "…" },
    { "type": "list", "ordered": false, "items": ["…"] },
    {
      "type": "image",
      "src": "https://static.wixstatic.com/…",
      "localPath": "/images/…",   // filled in by capture:assets
      "alt": "…",
      "width": 0,                  // intrinsic dimensions, for pre-sizing
      "height": 0
    }
  ],
  "links": [{ "href": "…", "text": "…", "external": false }],
  "flags": {
    "possibleClientContent": ["reason strings"],
    "hasTestimonialMarkup": false,
    "logoGridCandidate": false
  }
}
```

### About `flags`

`flags` records what an automated keyword-and-structure scan *suspected*. It is a
triage aid, **not a clearance**. An empty `possibleClientContent` array does not mean a
page is free of named clients, logos or testimonials — the scan cannot know that. A
human signs off before any captured page goes public.

## `freshdesk/**/<id>-<slug>.json`

```jsonc
{
  "id": 123456789,
  "title": "…",
  "slug": "…",
  "body": "<p>…</p>",       // original HTML
  "bodyText": "…",          // flattened, for diffing
  "folder": "BUPA",
  "category": "Medical Insurance",
  "scope": "public",        // "public" | "internal"
  "status": "published",    // mapped from Freshdesk 1=draft, 2=published
  "sourceUrl": "https://support.asktic.com/support/solutions/articles/…",
  "updatedAt": "…",
  "capturedAt": "…"
}
```

`status` is captured so drafts stay out of the public build — the filter lives in
`lib/content.ts` (`getPublicKbArticles`). Unknown status values map to `draft`: fail
closed, never publish by accident.

`internal/` articles carry `audience: 'operator'` when ported and belong to the
CRM-side operator KB. They must never be rendered by this site.

## Read-only

Freshdesk is read-only for this project. The capture scripts issue `GET` requests only;
nothing here writes back to Freshdesk, and nothing touches the live Wix site or DNS.
