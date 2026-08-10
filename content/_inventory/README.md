# Capture inventory

Archive of the pre-rebuild asktic.com Wix site and the Freshdesk help centre. This is a
**record**, not build input — the site build never reads this directory. Content is
hand-ported from here into `app/` and `content/kb/` in Phase 3.

## Status: empty, and deliberately so

Nothing has been captured yet.

The **Wix** crawl could not run in the environment where this scaffold was built:
`www.asktic.com` and `static.wixstatic.com` are blocked by the egress policy (verified —
`403 CONNECT` / `EGRESS_BLOCKED`).

The **Freshdesk** pull is no longer blocked — it routes through n8n (see below) and the
connection has been verified end to end against the live Solutions API. What is
confirmed so far, and nothing more:

| Category | Folder | Articles | Visibility |
| --- | --- | --- | --- |
| Medical Insurance | Allianz | 4 | 1 (public) |
| Medical Insurance | BUPA | 12 | 1 (public) |

Categories present: `General`, `Medical Insurance`, `INTERNAL`. The `General` and
`INTERNAL` folder listings have **not** been enumerated yet — the brief's "FAQ folder
and one legacy AIG article" is unverified.

No page content, article text or inventory row has been invented to fill the gap. Every
file below is either an empty container or a schema.

### To run the capture

The two halves have different blockers. The Freshdesk half is **already unblocked**;
only the Wix half needs the egress allowlist.

**Wix (blocked):** allowlist `asktic.com`, `*.asktic.com` and `*.wixstatic.com` on the
environment's network settings, then:

```
npm run capture:site        # sitemap -> pages/
npm run capture:assets      # wixstatic images -> ../../public/images
```

**Freshdesk:** the pull goes through the n8n workflow **Freshdesk Solutions Read**
(`6bjXz8CZRHY1k2d9`, published). The Freshdesk API key never enters this environment —
it lives on the workflow's `Call Freshdesk API` node.

Two ways in, for different jobs:

| | Webhook (`npm run capture:freshdesk`) | n8n MCP connector |
| --- | --- | --- |
| Bytes go | straight to disk | through the model's context, twice |
| Good for | the bulk migration | ad-hoc reads, spot checks |
| Needs | allowlist + webhook secret | nothing |

Use the **webhook** for the migration. Over MCP every article body has to pass through
context and be written back out, which does not scale past a handful of articles — that
is why the first attempt stalled at 4 of 33.

Setup for the webhook path:

- allowlist `asktic.app.n8n.cloud` (the webhook) and `s3.amazonaws.com` (signed
  attachment downloads)
- set `DRIVE_INDEX_WEBHOOK_SECRET` — this is the webhook's own shared secret, not the
  Freshdesk API key, and opens nothing but that one read-only workflow

```
npm run capture:freshdesk   # walks everything -> _raw.json (complete: true)
npm run ingest:freshdesk    # _raw.json -> public/ + internal/ + excluded/ + redirects.json
npm run gen:redirects       # redirects.json -> render.yaml
```

For a spot check over MCP instead:

```
mcp__n8n__execute_workflow(workflowId: "6bjXz8CZRHY1k2d9", executionMode: "manual",
  inputs: { type: "webhook", webhookData: { method: "POST",
            body: { action: "list_categories" } } })
```

Actions: `list_categories`, `list_folders` (needs `category_id`), `list_articles`
(needs `folder_id`, optional `page` / `per_page`).

**ALWAYS check `statusCode` in the response.** The workflow runs with `neverError`, so a
401 or 404 from Freshdesk still returns a successful-looking execution with
`success: false`. Treating a completed execution as a successful fetch is the same
silent-failure class the retired Make scenario had.

#### `_raw.json` shape

```jsonc
{
  "capturedAt": "2026-08-10T00:00:00.000Z",
  "categories": [
    {
      "id": 6000136048,
      "name": "Medical Insurance",
      "folders": [
        {
          "id": 6000244889,
          "name": "Allianz",
          "visibility": 1,           // 1 = public; anything else is treated as internal
          "articles": [ /* verbatim Freshdesk article objects */ ]
        }
      ]
    }
  ]
}
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
