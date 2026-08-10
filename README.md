# TIC_web

Rebuild of [asktic.com](https://www.asktic.com) off Wix — a statically-exported Next.js
site deployed to Render, with the Freshdesk help centre folded into a `/knowledge`
section.

**Current state: Phase 2 scaffold. Shell only — no page content has been ported.**

---

## Where things stand

| Phase | Status |
| --- | --- |
| **1 — Capture** | **Partial.** Wix: not started (egress blocked). Freshdesk: all folders enumerated, 4 of 34 articles pulled. See [`content/_inventory/_capture-status.md`](content/_inventory/_capture-status.md) — it also records three findings that contradict the brief. |
| **2 — Scaffold** | Complete. Builds, exports, and passes the URL-contract check. |
| 3 — Port content | Not started. |

### Phase 1: Wix is blocked, Freshdesk is not

**Wix — blocked.** `www.asktic.com` and `static.wixstatic.com` return `403` from the
egress proxy: an organisation policy denial, not a transient failure. Allowlist
`asktic.com`, `*.asktic.com` and `*.wixstatic.com` on the environment's network settings
([docs](https://code.claude.com/docs/en/claude-code-on-the-web)), then:

```bash
npm run capture:site        # sitemap -> content/_inventory/pages/
npm run capture:assets      # wixstatic images -> public/images/
```

**Freshdesk — routed through n8n.** The pull goes through the workflow **Freshdesk
Solutions Read** (`6bjXz8CZRHY1k2d9`, published), so **no Freshdesk API key enters this
environment** — it stays on the workflow's node. That matters because cloud environments
have no secrets store and a Freshdesk key carries its agent's full read/write
permissions. Verified end to end against the live Solutions API.

Allowlist `asktic.app.n8n.cloud` and `s3.amazonaws.com` (signed attachment downloads),
and set `DRIVE_INDEX_WEBHOOK_SECRET` — the webhook's own secret, which opens nothing but
that one read-only workflow. Then:

```bash
npm run capture:freshdesk   # walks everything -> _raw.json
npm run ingest:freshdesk    # _raw.json -> capture files + redirects.json
npm run gen:redirects       # article map -> render.yaml
```

The same workflow can be driven over the n8n MCP connector with no allowlist or secret
at all, which is right for spot checks but not for the migration: over MCP every article
body travels through the model's context and back out to disk, which is why the first
attempt stalled at 4 of 33 articles.

See `content/_inventory/README.md` for the action list and the `_raw.json` shape.

**No page content, article text or inventory row has been invented to paper over the
blocked half.** `content/_inventory/` contains empty containers and a format spec. The
page list in `content/url-contract.json` is assembled from the project brief and has
**not** been reconciled against the real sitemap.

Once captured, reconcile `content/url-contract.json` against the real sitemap and
correct the nav grouping in `lib/site.ts` (currently a documented placeholder).

The capture scripts enforce the brief's stop conditions as hard gates — sitemap over 20
pages, suspected client-identifying content, or substantial `/blog` / `/projects`
content each halt the run, write `content/_inventory/STOP-REPORT.md` and exit non-zero.
The client-content scan is a heuristic that **flags candidates for human review and does
not clear anything**; an unflagged page is not a guarantee.

---

## Getting started

```bash
npm install
npm run dev            # http://localhost:3000
```

```bash
npm run build          # static export -> out/
npm run verify:urls    # assert the URL contract against out/
npm start              # serve out/ locally
npm run typecheck
npm run lint
```

---

## The URL contract

This is the hard constraint on the whole project: **every existing path stays exactly as
it is.** These URLs are indexed and carry the site's only search equity.

`content/url-contract.json` is the canonical list. `npm run verify:urls` checks the real
build output and fails if:

- a preserved path emitted no artifact, or
- a redirect-only path emitted a page (which would silently shadow its redirect), or
- a nav link in `lib/site.ts` points somewhere not in the contract.

Run it after every build. `/income-preservation-1` keeps its odd trailing `-1` on
purpose — do not "tidy" a slug in that file.

### Redirects

Redirects are **not** in `next.config.ts`. With `output: 'export'`, Next's `redirects()`
is inert — it emits a build warning and does nothing. They live in `render.yaml`:

| From | To |
| --- | --- |
| `/home-1` | `/` |
| `/file-access` | `/forms` |
| `support.asktic.com/support/solutions/articles/*` | per-article, generated |
| `help.asktic.com` | `/knowledge` — **not yet configured, see below** |

#### Cross-domain redirects need a decision

Render matches redirect `source` on path only — there is no host component. So the two
cross-domain rules only fire if `help.asktic.com` and `support.asktic.com` are attached
to this Render service as custom domains, which is a **DNS change**. DNS is out of scope
for this project, so it has not been touched.

What exists today: the per-article map is generated into `render.yaml` on the assumption
that `support.asktic.com` eventually points here (inert until it does), and the
`help.asktic.com` rule is deliberately omitted because at the site root it would collide
with `asktic.com/`. Both need a hosting decision before they do anything.

---

## Architecture

- **Next.js 16 App Router**, TypeScript strict, **Tailwind v4** (CSS-first `@theme`).
- **Static export** (`output: 'export'`) → Render Static Site, `staticPublishPath: ./out`.
  No route handlers, no middleware, no Server Actions, no ISR.
- **`images.unoptimized: true`** is mandatory under static export. Images are therefore
  pre-sized: `capture:assets` measures intrinsic dimensions and writes them back into
  the capture JSON.
- **Content is MDX with YAML frontmatter on the filesystem.** No CMS, no database.
  `lib/content.ts` reads and compiles it at build time.
- **The contact form posts to an n8n webhook** directly from the browser. There is no
  server to proxy through, so `NEXT_PUBLIC_N8N_CONTACT_WEBHOOK` ships in the JS bundle —
  n8n must do its own validation and rate limiting.

### Layout

```
app/            route stubs (one per preserved path) + layout, 404, design tokens
components/     site-header, site-nav, site-footer, container, page-shell, contact-form
lib/            site.ts (nav + contract), kb-schema.ts (zod), content.ts (MDX reader)
content/
  url-contract.json          canonical preserved paths — the hard constraint
  kb/                        KB articles (MDX) — empty until Phase 3
  _inventory/                capture archive — see its own README
public/
  forms/manifest.json        file library — scaffolded empty, not populated
  images/                    Wix asset-pull target
scripts/        capture + verification tooling
render.yaml     deploy config and all redirects
```

### Design tokens

`app/globals.css` is the only place colour is defined. Brand green `#3a8c3f` and blue
`#1b5faa` anchor two scales at their `600` step (`brand-green-600` === `brand-green`),
namespaced so Tailwind's own `green`/`blue` stay available. Components must not hardcode
hex values.

### Knowledge-base frontmatter

Validated by `lib/kb-schema.ts` (zod). Invalid frontmatter fails the build.

```yaml
slug, title, summary, carrier, productLine, audience, topic,
jurisdiction, lastReviewed, reviewDue, status, sourceUrl
```

Two fields gate the public build, filtered in one place (`getPublicKbArticles`):

- `audience: 'public'` — `'operator'` articles belong to the CRM-side KB, never here.
- `status: 'published'` — Freshdesk drafts must not ship. Unknown Freshdesk status
  values map to `draft`: fail closed.

---

## Out of scope

`TIC_CRM_WebAPP` · the live Wix site (read-only) · Freshdesk content (read-only — the
n8n proxy is `GET`-only and action-whitelisted to `/api/v2/solutions/*`) · DNS.

The existing **Freshdesk Read Tool** workflow was deliberately left untouched: it is the
CRM's canonical ticket path with a long validation history, and the site migration has
no business regressing it. Solutions access is a separate, additive workflow.
