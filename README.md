# TIC_web

Rebuild of [asktic.com](https://www.asktic.com) off Wix — a statically-exported Next.js
site deployed to Render, with the Freshdesk help centre folded into a `/knowledge`
section.

**Current state: live.** The rebuild serves [www.asktic.com](https://www.asktic.com) from
Render as of 2026-08-12. The migration phases are complete. The site is now on its second
build: the homepage was rebuilt on 2026-08-16 as a progressive-disclosure **concern flow**
and the palette was re-derived from the logo. What remains is real content for the
placeholders that flow surfaced (see [below](#what-is-still-placeholder-content)), an
editorial pass over the ported copy
([`port-worklist.md`](content/_inventory/port-worklist.md)) and two DNS items
([`dns-cutover.md`](content/_inventory/dns-cutover.md)).

---

## Where things stand

| Phase | Status |
| --- | --- |
| **1 — Capture** | Wix: **done** — 21 pages and 18 images archived; 2 pages could not be captured (below). Freshdesk: **stopped by decision** — content is stale and will be supplied by hand; folder inventory kept. See [`content/_inventory/_capture-status.md`](content/_inventory/_capture-status.md). |
| **2 — Scaffold** | Complete. Builds, exports, and passes the URL-contract check. |
| **3 — Port content** | **Complete.** Every preserved path renders real content; no stubs remain. |
| **4 — Concern flow** | **Complete, pending content.** Homepage rebuilt as five moves; nine concerns, each a real indexable page from one shared source; palette and type re-derived from the logo. Eight case studies and five lead images are still placeholders. |

### Phase 1: what came back

```bash
npm run capture:site        # sitemap -> content/_inventory/pages/
npm run capture:assets      # wixstatic images -> public/images/
npm run capture:render      # client-rendered pages, via headless Chromium
```

⚠ **An image added by hand bypasses all of this.** `capture:assets` asks wixstatic for a
2000px rendition and never sees the original, but a file dropped straight into
`public/images` is served exactly as committed — `images.unoptimized` is mandatory under
static export, so the committed file *is* the download. A 7030x3787 / 11.3 MB photograph
reached the repository that way on 2026-08-16. Run it through the resize first:

```bash
npm run resize:image -- public/images/Whatever.jpg     # -> 2000px wide, ~0.2 MB
npm run resize:image -- public/images/Whatever.png     # -> writes .jpg beside it
```

It uses the Chromium that Playwright already ships for the capture scripts, since there is
no ImageMagick or sharp here. A `.jpg` source is overwritten in place; anything else
leaves the original for you to `git rm`.

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
npm run verify        # verify:urls + verify:copy, both against out/
```

```bash
npm run resize:image -- public/images/Whatever.jpg   # before committing any photograph
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
| `/blog` | `/services` | `tic-web` routes |
| `/speciality-insurance` | `/offshore-and-energy` | `tic-web` routes |
| `/income-preservation-1` | `/services` | `tic-web` routes |
| `help.asktic.com/*` | `https://www.asktic.com/knowledge` | `tic-help-redirect` service |
| `support.asktic.com/...` | — | not handled; Freshdesk keeps serving these |

The last three were added on 2026-08-16 and are a deliberate exception to URL
preservation: both paths were `preserved` and indexed until the homepage copy deck moved
them. Each 301s to a topically equivalent page, which is what makes a redirect right here
and wrong for the dropped Wix store URLs — see
[`url-decisions.md`](content/_inventory/url-decisions.md) on the soft-404 pattern.
`/speciality-insurance` deliberately does **not** go to `/services`: the specialty
product was dropped, its audience was not, so the equity follows the audience.

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
app/            one route per preserved path + layout, 404, design tokens, fonts
                six of them are concern pages and are four lines each
components/
  home-flow           the homepage's only JavaScript — enhances, never renders
  concern-panel       the six-part drill-down, shared by homepage and route
  concern-page        a concern's whole route: panel + questions + tagged form
  cta-button          the one button. Ink, because green fails contrast
  capture-form        the form state machine, honeypot included
lib/            site.ts (nav + contract), capture.ts (lead tagging), kb-schema.ts (zod),
                content.ts (MDX reader)
content/
  url-contract.json          canonical preserved paths — the hard constraint
  concerns/index.ts          the eight concerns — one source, two surfaces
  home/copy.ts               homepage strings only; the flow's copy is in concerns/
  kb/                        KB articles (MDX) — empty by decision
  _inventory/                capture archive — see its own README
public/
  forms/manifest.json        file library — scaffolded empty, not populated
  images/                    Wix asset-pull target, plus logo-mark and logo-wordmark
scripts/        capture + verification tooling
render.yaml     deploy config and all redirects
```

### Design tokens

`app/globals.css` is the only place colour is defined. Components must not hardcode hex
values.

**The palette is sampled from the logo, not chosen.** `public/images/logo-mark.png` — the
roundel — contains exactly two saturated colours, and they anchor the two scales at their
`600` step (`brand-green-600` === `brand-green`):

| | Was | Is | Why |
| --- | --- | --- | --- |
| green | `#3a8c3f` | **`#6aab35`** | The old value was a forest green at hue 123. The logo's is a leaf green at hue 93. They are not the same colour and the old one was never on the mark. |
| blue | `#1b5faa` | **`#196db6`** | Close, but not the mark's own. Moved for the same reason. |

The wordmark carries a third hue, an indigo `#3f59a8` on the word "Concierge". It is
deliberately **not** a token: two accents is the system, a third is decoration.

Two rules fall out of the contrast maths and are recorded in the stylesheet:

- **Green cannot carry white text** (2.80:1). Primary calls to action are ink on paper
  (14.05:1) via `components/cta-button.tsx`. Do not add a green button back — the old
  one was already failing body-text contrast at 4.20:1.
- **Green is a graphic accent, blue is a text accent.** Blue clears body text on paper at
  4.62:1; green does not until its `800` step. So path identity is carried by tint and
  border, never by colouring body copy green.

Green is the individual path, blue is the company path, links are blue sitewide. The
ground is warm stone (`surface-subtle`) with cards in a warm near-white (`surface`) — the
inversion is deliberate, and `body` is set to the stone.

Type is **Fraunces** (display, with its `opsz` axis) and **Public Sans** (body), loaded
by `next/font` in `app/layout.tsx` and therefore self-hosted: no request leaves the
visitor's browser for a font. Both are taken as variable fonts, which is not a
preference — `next/font` rejects `axes` alongside a fixed `weight` list. Headings get the
display face from the base layer, so a heading has to opt out rather than in.

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

### The homepage is a flow, not a page of sections

Rebuilt 2026-08-16. Five moves, each earned by the visitor's previous action: sparse hero
→ four trust stats → **one binary choice** (myself/family, or my company) → the concern
cards for that path → the drill-down panel. Nothing else. The deletions are the point —
no About section, no logo wall, no testimonial carousel, no second CTA.

There are **nine concerns**: five on the individual path, four on the company path. An
odd-numbered grid leaves one card alone on its last row, so the last card spans both
columns and reads as a deliberate closer. That rule is `spansFullWidth` in the content
module rather than a class on one card, so the next odd grid is not solved a different
way.

Each concern is a **real indexable page**, and `content/concerns/index.ts`
is the single source both surfaces read: the homepage reveals a concern's panel inline,
and the concern's own route renders the identical panel with its own metadata. Neither
can drift from the other.

**The fork is CSS, not JavaScript.** Two radio inputs and `:has()` decide which grid
shows, so there is no flash on hydration and the choice works with scripting off. The
default is *visible* and the hiding happens inside `@supports`, so a browser without
`:has()` degrades to a plain list of eight situations. The concern cards are real links;
`components/home-flow.tsx` only enhances them into an inline reveal, and leaves modified
clicks alone so cmd-click still opens the page.

Two concerns **absorbed existing indexed paths** rather than competing with them:
`/maternity-insurance` is "Planning for a family" and `/offshore-and-energy` is "a
workforce that does not sit in one country". Both keep their equity; the maternity page
kept the three sections the six-part panel has no slot for, via `ConcernPage`'s children
slot. That slot is not an extension point for new concerns.

`#talk-to-us` now anchors the **fork**, not an enquiry form. The form moved to the concern
pages, where the question is known and the lead arrives tagged. The anchor is linked from
the header CTA and two other pages, so it was kept pointing at the site's actual ask.

**Lead tagging** is built: a concern page's form posts `source: 'concern-enquiry'` plus
`concern`, `path` and `situation` as fields, so an enquiry reaches n8n already knowing
"individual, planning for a family". One source rather than eight — the source says which
*kind* of capture point this is, and the situation is data about the lead.

### Visual rhythm, and what it costs

A design review found the homepage read as "an elegant form": above the drill-down,
headline, numbers, fork and cards all carried the same weight. Three fixes landed on
2026-08-16, and the shape of each was constrained by rules the flow already had.

- **Concern cards carry a mark.** `components/concern-card.tsx` is one component used by
  all four places that render a concern card (homepage, `/services`, the company hub, and
  the sibling list on every concern page) — they were four copies of the same markup
  before. The icon is a wayfinding mark, never a photograph: selection steps stay lean and
  imagery is earned at the drill-down.
- **The footer collapses on mobile.** It had grown to four columns of five, so the page
  ended in a second sitemap. Each column is now a `<details>` accordion below `sm`, forced
  open above it, which makes the footer **39% shorter** on a 390px viewport. It needs
  **two** CSS rules to force open — `::details-content { content-visibility: visible }`
  for current Chromium and `display: block` for engines without it. The first version
  shipped only the second and the desktop footer rendered with no links at all.
- **The premium promise left fine print.** "The premium is the same whether you come to us
  or go direct" is the strongest objection-handler the firm has and was set at 11px muted.
  It reads at body size now; the regulatory half stays quiet, and stays cautious for the
  reasons in `content/home/copy.ts`. It did **not** become a sixth section — the homepage
  is five moves, and adding to it is how the ten-section homepage happened the first time.

Still open from that review: a real photograph of the adviser or team. No asset exists,
and stock is not acceptable for it.

### Pages that are built, not ported

There was no Wix copy to reproduce for these. Nothing was invented for them either —
each is assembled from material the site already publishes:

| Page | Why | What it shows |
| --- | --- | --- |
| `/services` | Client-rendered on Wix at `/blog`; never captured. That path was the **Services** landing page, not a blog index, and it now 301s here. | The two product pages, all eight concerns in one flat list, the individual lead magnet, and the 12 posts — which also gives the posts an index, since the Wix category pages were dropped. |
| the six new concern pages | New paths, added with the flow. | The shared panel, a questions band, and a lead-tagged enquiry form. |
| `/knowledge` | New path. `content/kb/` is empty and stays empty — KB copy is being written by hand, not ported from Freshdesk. | The posts, and a link to the live help centre at `support.asktic.com`, which Freshdesk still serves. |
| `/forms` | New path. The Wix `/file-access` original was an unconfigured template. | `public/forms/manifest.json`, which is empty — so an empty state that invites contact rather than a blank list. |

### What is still placeholder content

Nothing below is invented, but nothing below is finished either:

- **Eight of the nine case studies.** Each renders bracketed and visibly unfinished, with
  a brief describing what a real one needs. A case does **not** have to end in a win —
  "we recommended staying put" is often the more credible story. The one real case is
  anonymised and permission-cleared (both the family's and the employer's) and sits on
  `/beyond-employer-cover`, because that panel's argument is a company scheme's ceiling
  and the case is that ceiling being exceeded by S$53,000. Do not restate it elsewhere.
- **Five of the nine lead images.** Real photography is in place for maternity (plus the
  newborn section), relocating, pre-existing conditions and offshore. The other five
  render a holding frame at the real image's 16:7 with the photography brief in it, so the
  layout is already what it will be when the photograph lands and nothing shifts when it
  does. Do not fill these with stock — the generic "Team Meeting" shot was flagged as a
  weakness on the page this replaces.
- **Figures on every concern except relocating.** See below.
- **The trust stats**, which are published on the live site but were queried against
  `tic_crm_dev` rather than production. The outstanding checks are listed in
  `content/home/copy.ts`.

#### Figures never go inside a photograph

A supplied graphic put an employer cover ceiling of S$40,000 against a S$125,000 bill
directly onto the `/beyond-employer-cover` panel. It was rejected and the rule is
general:

- **Numbers in pixels cannot be footnoted.** Every figure on this site carries a
  configuration disclosure, because the figure is meaningless without it. An image
  cannot carry one.
- **They cannot be corrected.** A rate changes and the copy changes with it; an image
  has to be re-rendered by whoever made it.
- **`verify:copy` cannot read them.** The guard that has caught every other copy problem
  here scans text. An image walks straight past it.
- **That one contradicted the page it sat on.** The permission-cleared case printed three
  inches below says the scheme covered to S$207,000 against a S$260,000 bill.

`CaseChart` in `components/concern-panel.tsx` is the sanctioned alternative: the same
comprehension, built as markup, from the concern's `case.chart`. Its constraint is that
**every number in the chart must already appear in the case prose**, so the chart cannot
say something the story does not and one correction fixes both.

#### One deliberate removal: the "from USD 95 a month" band

The old homepage published a cost band reading *from USD 95 a month* at age 30 and *USD
115* at 40, for in-patient cover on a USD 8,500 deductible. The relocating panel's table —
from a live rate lookup on the same configuration — says **USD 138 at 30 and USD 201 at
40**.

Both cannot be published. A "from" figure is a floor across options and the table is one
product's real rate, so they are not strictly contradictory, but side by side on one site
they read as one of them being wrong. The table is the traceable one, so it stayed and the
band did not get rehomed. `/beyond-employer-cover` therefore shows the mechanism and **no
number**, per the standing rule: if a figure cannot be both accurate and on-topic, show no
figure. Price that configuration properly against the current rate table and the band can
come back.

Note also that the relocating footnote does **not** name the carrier the rates came from.
`npm run verify:copy` forbids insurer names in public copy, and that rule wins over the
handoff's draft wording.

### Where ported content lives

Two shapes, chosen by what the page is rather than by preference:

| Page is… | Lives in | Example |
| --- | --- | --- |
| a document — prose, headings, lists | `content/pages/*.mdx`, rendered by its route | `/privacy` |
| a layout — cards, grids, image groups | the route component itself | `/international-health-insurance` |

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

### Every form on the site is currently a mailto

`NEXT_PUBLIC_N8N_CONTACT_WEBHOOK` is not configured, so `captureEnabled` is `false` and
**no form is rendered at all** — the decision is made in a server component at build time
and the page ships a static mailto instead. That is deliberate: a form that accepts what
someone typed and then tells them to email instead is worse than not offering one.

This now affects more than one page. Every concern page's enquiry form, both lead magnet
panels, and the indicative price component all branch on the same flag. The mailto
fallbacks carry the concern in the subject line, so a lead still arrives tagged.

**So the site currently needs no environment variables at all.** Setting
`NEXT_PUBLIC_N8N_CONTACT_WEBHOOK` on the Render service turns all of them on at once.
That variable would be the only one this service may ever hold — see `render.yaml`. Note
that setting it does **not** trigger a deploy: `scripts/lib/build-stamp.ts` hashes source
files, not environment, so an unchanged repo produces an identical hash and Render's
auto-deploy will not fire. Trigger a manual redeploy after setting it.

`components/contact-form.tsx` is the older standalone form and is still mounted nowhere.
Everything now goes through `components/capture-form.tsx`, which owns the honeypot and
the four states in one place.

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
