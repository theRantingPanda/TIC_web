# TIC_web

Rebuild of [asktic.com](https://www.asktic.com) off Wix — a statically-exported Next.js
site deployed to Render, with the Freshdesk help centre folded into a `/knowledge`
section.

**Current state: live.** The rebuild serves [www.asktic.com](https://www.asktic.com) from
Render as of 2026-08-12. All three phases are complete; what remains is an editorial pass
over the ported copy ([`port-worklist.md`](content/_inventory/port-worklist.md)) and two
DNS items ([`dns-cutover.md`](content/_inventory/dns-cutover.md)).

---

## Where things stand

| Phase | Status |
| --- | --- |
| **1 — Capture** | Wix: **done** — 21 pages and 18 images archived; 2 pages could not be captured (below). Freshdesk: **stopped by decision** — content is stale and will be supplied by hand; folder inventory kept. See [`content/_inventory/_capture-status.md`](content/_inventory/_capture-status.md). |
| **2 — Scaffold** | Complete. Builds, exports, and passes the URL-contract check. Nav reconciled against the real Wix nav. |
| **3 — Port content** | **Complete.** Every preserved path renders real content; no stubs remain. Four pages are built from existing site material rather than ported, because there was nothing to port — see below. |

### Phase 1: what came back

```bash
npm run capture:site        # sitemap -> content/_inventory/pages/
npm run capture:assets      # wixstatic images -> public/images/
npm run capture:render      # client-rendered pages, via headless Chromium
```

`capture:site` is scoped to `url-contract.json` → `preserved` with `source: 'wix'`, and
halts if the live sitemap contains a path the contract does not classify.

**Two pages are empty on the live site**, which took three attempts to establish rather
than assume. `/blog` and `/maternity-insurance` are rendered client-side by Wix, and were
captured on 2026-08-12 from an unrestricted sandbox with every parastorage host
reachable: both render header and footer and **nothing else** — identical 588-character
output. They have no body content. The pages built here carry more than the originals do,
and no egress allowlist is needed.

That render also surfaced the site's **footer**, which the server-HTML capture never saw
and which carried three things the rebuild was missing — the GIA/MAS regulatory
disclosure, the about block, and the sitewide phone number. All three are now in
`lib/site.ts`. Details in
[`_capture-status.md`](content/_inventory/_capture-status.md).

`static.wixstatic.com` is **not** blocked, despite earlier notes: its bare-root `403` is
the origin's own answer, and media URLs under it download fine.

**`/blog` is the Services landing page**, not a blog index — that is what the live nav
calls it. The 12 posts live at `/single-post/...`.

The client-content scan flagged `/privacy` for "Google Inc", which on reading is the
Google Analytics disclosure, not a client reference.

The live site's defects — dead "Read More" links, Wix-default social icons, a "© 2019"
footer, missing meta descriptions, a Knowledge Base link to a hostname that does not
resolve — are inventoried and verified against the captures in
[`content/_inventory/port-worklist.md`](content/_inventory/port-worklist.md). The
structural ones were fixed during the port; that file separates what is done from what
still needs an editorial decision.

Images are pulled at **2000px on the long edge**, not at Wix's original resolution. With
`images.unoptimized: true` the committed file is what every visitor downloads, and the
largest original is 7133x4800 / 18 MB (513 KB at the cap).

**Freshdesk — stopped by decision.** Solutions content is stale; KB copy will be written
by hand into `content/kb/` rather than ported. Do not restart the article pull. The
4 captured Allianz articles are an archive only and must not be ported — see
[`_capture-status.md`](content/_inventory/_capture-status.md).

The tooling remains for one specific future case: if `support.asktic.com` is ever
repointed from Freshdesk to this site, its article URLs would need a 301 map, which
requires a **listing-only** pull (IDs and titles, no bodies). `npm run capture:freshdesk`
does that via the n8n workflow **Freshdesk Solutions Read** (`6bjXz8CZRHY1k2d9`), which
keeps the Freshdesk API key inside n8n — it needs `asktic.app.n8n.cloud` allowlisted and
`DRIVE_INDEX_WEBHOOK_SECRET` set.

See `content/_inventory/README.md` for the action list and the `_raw.json` shape.

**No page content, article text or inventory row has been invented to paper over
anything that could not be captured.**

`content/url-contract.json` has been reconciled against the real sitemap and is
authoritative; the rationale for each decision is in
[`content/_inventory/url-decisions.md`](content/_inventory/url-decisions.md). The nav in
`lib/site.ts` is reconciled against the live Wix nav as captured.

The capture scripts enforce stop conditions as hard gates — an unclassified sitemap
path, suspected client-identifying content, or substantial `/projects` content each halt
the run, write `content/_inventory/STOP-REPORT.md` and exit non-zero. That file is
script-owned and rewritten on every halt; the durable decision record is
`url-decisions.md` beside it. The client-content scan is a heuristic that **flags
candidates for human review and does not clear anything**; an unflagged page is not a
guarantee.

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

- **`out/` is stale** — see below, this one comes first, and
- a preserved path emitted no artifact, or
- a redirect-only path emitted a page (which would silently shadow its redirect), or
- a nav link in `lib/site.ts` points somewhere not in the contract.

#### `verify:urls` refuses to check a stale `out/`

It asserts against whatever is in `out/`, which is only meaningful if `out/` came from
the current source. On 2026-08-11 it did not: a build failed, `out/` still held the
previous good export, and the check cheerfully reported the contract holding.

So `npm run build` now has a second half — `scripts/stamp-build.ts` writes
`out/.build-stamp.json`, a hash of every build input. `verify:urls` recomputes that hash
and fails if it disagrees or the stamp is missing. A failed build never writes a new
stamp, so the mismatch is exactly what catches it.

`content/_inventory/` is excluded from the hash: the build never reads the capture
archive, so re-capturing must not invalidate a perfectly good export. Content is hashed
rather than mtimes, so a fresh clone or a `touch` does not cry wolf.

**A green `verify:urls` is not a green build.** Check that `npm run build` succeeded
too — the staleness guard exists because that distinction was missed once already.

Run it after every build. `/income-preservation-1` keeps its odd trailing `-1` on
purpose — do not "tidy" a slug in that file.

### Redirects

Redirects are **not** in `next.config.ts`. With `output: 'export'`, Next's `redirects()`
is inert — it emits a build warning and does nothing, so the platform has to serve them.

They are configured **on the Render service**, not by `render.yaml` — that file does not
govern this service (see its header). It documents them; the service is where they live.
Change one and you must change both. This is not pedantry: the redirects existed only in
`render.yaml` until 2026-08-12, which meant all three of these 404'd in production.

| From | To | Where |
| --- | --- | --- |
| `/home-1` | `/` | `tic-web` routes |
| `/file-access` | `/forms` | `tic-web` routes |
| `/file` | `/forms` | `tic-web` routes |
| `help.asktic.com/*` | `https://www.asktic.com/knowledge` | `tic-help-redirect` service |
| `support.asktic.com/...` | — | not handled; Freshdesk keeps serving these |

#### Why `help.asktic.com` gets its own service

Render matches redirect `source` on path only — there is no host component. A
`/ → /knowledge` rule on the main site would therefore also hijack `www.asktic.com/` and
break the homepage. Scoping a redirect to one hostname means giving that hostname its
own service, which is what `tic-help-redirect` in `render.yaml` is.

**`help.asktic.com` does not exist (verified 2026-08-11).** It returns NXDOMAIN, and the
zone inventory has no `help` record — the KB subdomain that exists is
`support.asktic.com`. The live Wix nav links "Knowledge Base" to `http://help.asktic.com`,
so that link is **dead on the current site**.

So `tic-help-redirect` is not waiting on DNS — there is no record to move. It becomes
useful only if someone decides to *create* that hostname. Nothing in the rebuild depends
on it: this site's nav links to `/knowledge` directly.

### Cutover: done 2026-08-12

**The site is live at [www.asktic.com](https://www.asktic.com), served by Render.**

DNS hosting stayed on Wix — registration moved to Vodien, the nameservers did not, and
that plan was dropped. `ns4/ns5.wixdns.net` remain authoritative, so the zone is managed
in Wix's DNS panel.

| Host | Type | Value |
| --- | --- | --- |
| `asktic.com` | A | `216.24.57.1` |
| `www` | CNAME | `tic-web.onrender.com` |

Verified after the switch: **all five Google Workspace MX records intact**, 23 of 23
preserved paths returning `200`, all three redirects `301`ing, dropped paths `404`ing,
and TLS valid on both hostnames. Certificates were issued about ten minutes after DNS
pointed at Render, and HTTPS on the custom domain failed during that window.

The full record — final zone state, what was removed and why, the rollback, and the
outstanding SPF/DMARC gap — is in
[`content/_inventory/dns-cutover.md`](content/_inventory/dns-cutover.md).

**Two things to know before editing this zone.** The Freshworks `_domainkey` and `fwdkim`
records authenticate the mail Freshdesk sends on the firm's behalf — deleting them
silently pushes ticket replies toward spam. And SPF, DMARC and Google DKIM are now
published after years without them, with only **2 of SPF's 10 DNS lookups spare** —
cost any future "add our SPF include" request before adding it, because exceeding the
limit fails SPF permanently rather than degrading.


Two assumptions in that service could **not** be verified — `render.com` is blocked by
this environment's egress policy: that `destination` accepts an absolute off-site URL,
and that `source: /*` matches the root path as well as sub-paths. Check both before
relying on it. If either is wrong, the fix is contained to that service and cannot
affect `tic-web`.

`support.asktic.com` is deliberately not handled. Freshdesk Solutions is **parked, not
retired**, so that hostname keeps pointing at Freshdesk and its article URLs keep working
exactly as they do today — no redirect is needed or wanted.

### Never link an environment group to `tic-web`

The service sits in the same Render project as the Rainmaker CRM, whose `tic-crm-shared`
env group holds ~93 variables including database credentials and carrier API keys.
Nothing is linked, and nothing may be: this is a **static** build, so any variable it can
read is baked into published HTML and served to the public.

The site needs exactly one variable, set individually on the service and never via a
group: **`NEXT_PUBLIC_N8N_CONTACT_WEBHOOK`**, without which the contact form on
`/employee-benefits` renders but cannot submit. See
[below](#the-contact-form-needs-one-environment-variable).

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

### Blog posts

The 12 posts live in `content/blog/**.mdx`, at paths mirroring their URLs — including
the `2018/04/30/` prefix two of them carry, because those paths are indexed.

```bash
npm run port:blog            # captures -> content/blog (refuses to overwrite)
npm run port:blog -- --force # overwrite deliberately
```

`generateStaticParams` reads the content directory, so the files decide what exists;
`url-contract.json` is the assertion that they all still ship. Frontmatter is validated
by `lib/blog-schema.ts` and invalid frontmatter fails the build.

Two details worth knowing before editing:

- **`summary` comes from each post's JSON-LD, not its `<meta description>`.** Every Wix
  post shares one template default there ("This is your blog post. Blogs are a great way
  to connect with your audience…") — that must never ship.
- **Each post links three siblings at the foot.** The Wix original did this with a
  sidebar, and the only other things linking to posts were the 8 blog-category pages,
  which are deliberately dropped. Without those links the posts would be orphaned.

The port is mechanical: it reproduces the Wix copy, defects and all. See
[`content/_inventory/port-worklist.md`](content/_inventory/port-worklist.md).

### Four pages are built, not ported

There was no Wix copy to reproduce for these. Nothing was invented for them either —
each is assembled from material the site already publishes:

| Page | Why | What it shows |
| --- | --- | --- |
| `/blog` | Client-rendered on Wix; never captured. It is the **Services** landing page, not a blog index. | The five service pages, plus the 12 posts — which also gives the posts an index, since the Wix category pages were dropped. |
| `/maternity-insurance` | Client-rendered on Wix; never captured. | The firm's own maternity and newborn cards from the homepage, plus the maternity-related posts. |
| `/knowledge` | New path. `content/kb/` is empty and stays empty — KB copy is being written by hand, not ported from Freshdesk. | The posts, and a link to the live help centre at `support.asktic.com`, which Freshdesk still serves. |
| `/forms` | New path. The Wix `/file-access` original was an unconfigured template. | `public/forms/manifest.json`, which is empty — so an empty state that invites contact rather than a blank list. |

Replace any of them the moment real copy exists. The first two in particular are
placeholders standing in for pages that do exist on the live site.

### Where ported content lives

Two shapes, chosen by what the page is rather than by preference:

| Page is… | Lives in | Example |
| --- | --- | --- |
| a document — prose, headings, lists | `content/pages/*.mdx`, rendered by its route | `/privacy` |
| a layout — cards, grids, image groups | the route component itself | `/speciality-insurance` |

`npm run port:page -- /privacy` converts a capture to the first form. The rule of thumb:
if the structure is in the words, use MDX; if it is in the markup, use the component.
A 9,500-character privacy policy inlined as JSX helps nobody.

Both share the block conversion in `scripts/lib/blocks.ts`, which is where the Wix
quirks are handled — duplicated lists, nested lists serialised twice, zero-width-space
padding.

### Deploying

Live at [tic-web.onrender.com](https://tic-web.onrender.com), auto-deploying from `main`
on every commit. Deploys take about 30 seconds.

**`render.yaml` does not govern the service.** `tic-web` was created through the Render
dashboard, so its real configuration lives there — verified against the API on
2026-08-12:

| | |
| --- | --- |
| branch | `main`, auto-deploy on commit |
| build command | `npm run build` |
| publish path | `out` |
| environment variables | none |
| redirects | the three from the URL contract |

That divergence has already cost something: the redirects existed only in `render.yaml`,
so `/home-1`, `/file-access` and `/file` returned **404 on the live site** until
2026-08-12. They are now set on the service directly. Either keep both in step by hand,
or adopt `render.yaml` as a Blueprint — which would also create `tic-help-redirect`, a
service for a hostname that does not exist.

**`verify:urls` cannot catch this.** It asserts a redirect-only path emits no artifact in
`out/`, which is necessary but says nothing about whether Render serves the redirect.
Platform routing is outside what the build can check, so check the service when you
change `render.yaml`.

The blueprint's `npm ci --include=dev` is still the right command for anyone adopting it
or rebuilding the service: with `NODE_ENV=production`, `npm ci` skips devDependencies and
the build fails on the Tailwind PostCSS plugin. Render's own static-site install includes
them, which is why the live service builds fine without the flag.

### The contact form is disabled

`components/contact-form.tsx` works and is not mounted anywhere. It was briefly on
`/employee-benefits` — the page that carried one on Wix — and was disabled on
2026-08-11 because `NEXT_PUBLIC_N8N_CONTACT_WEBHOOK` is not configured. Without it the
form renders, accepts input, and then tells the visitor to email instead, which is worse
than not offering a form. The email address and phone number on that page are the live
route meanwhile.

**So the site currently needs no environment variables at all.** To re-enable the form,
set `NEXT_PUBLIC_N8N_CONTACT_WEBHOOK` on the Render service **first**, then restore the
two lines noted in `app/employee-benefits/page.tsx`. That variable would be the only one
this service may ever hold — see `render.yaml`.

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
