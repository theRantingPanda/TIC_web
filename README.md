# TIC_web

Rebuild of [asktic.com](https://www.asktic.com) off Wix — a statically-exported Next.js
site deployed to Render, with the Freshdesk help centre folded into a `/knowledge`
section.

**Current state: live.** The rebuild serves [www.asktic.com](https://www.asktic.com) from
Render as of 2026-08-12. The migration phases are complete. The site is now on its second
build: the homepage was rebuilt on 2026-08-16 as a progressive-disclosure **concern flow**
and the palette was re-derived from the logo. What remains is real content for the
placeholders that flow surfaced (see [below](#what-is-still-placeholder-content)) and an
editorial pass over the ported copy
([`port-worklist.md`](content/_inventory/port-worklist.md)). On DNS: the zone moved to
Vodien on 2026-08-16, but the registrar now delegates to **both** Vodien and Wix at once —
nothing is broken, though the split must be repaired before the Wix subscription is
cancelled. See [`dns-cutover.md`](content/_inventory/dns-cutover.md).

---

## Where things stand

| Phase | Status |
| --- | --- |
| **1 — Capture** | Wix: **done** — 21 pages and 18 images archived; 2 pages could not be captured (below). Freshdesk: **stopped by decision** — content is stale and will be supplied by hand; folder inventory kept. See [`content/_inventory/_capture-status.md`](content/_inventory/_capture-status.md). |
| **2 — Scaffold** | Complete. Builds, exports, and passes the URL-contract check. |
| **3 — Port content** | **Complete.** Every preserved path renders real content; no stubs remain. |
| **4 — Concern flow** | **Complete, pending content.** Homepage rebuilt as five moves; nine concerns, each a real indexable page from one shared source; palette and type re-derived from the logo. All nine lead images are in place; seven case studies are still placeholders, one panel carries a labelled scenario, and five concerns have no on-topic article to link. |

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

**Freshdesk — stopped by decision.** Solutions content is stale; do not restart the
article pull. The knowledge base is now written in the CRM and served at
`www.asktic.com/kb` through a Render rewrite, so nothing lands in this repo either way.
The 4 captured Allianz articles are an archive — one of them has since been reworked by
hand into a CRM article, which is the only route by which any of them may be used. See
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

DNS hosting stayed on Wix at the time — registration had moved to Vodien, the nameservers
had not. That changed on 2026-08-16, when the zone moved to Vodien as well;
`ns1/ns2.vodien.com` are authoritative now and the zone is managed in Vodien's DNS panel.

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

**Three things to know before editing this zone.** Some Freshworks `_domainkey` records
authenticate the mail Freshdesk sends on the firm's behalf and some belong to the dropped
Freshworks suite — the names are indistinguishable and only the CNAME target tells them
apart, so resolve before deleting; removing a live one silently pushes ticket replies
toward spam. SPF, DMARC and Google DKIM are now published after years without them, with
only **3 of SPF's 10 DNS lookups spare** — cost any future "add our SPF include" request
before adding it, because exceeding the limit fails SPF permanently rather than degrading.
And **the delegation is split.** The zone moved to Vodien on 2026-08-16, but the registrar
now lists four nameservers — two Vodien, two Wix — so both are authoritative over different
zones and each lookup lands on whichever answers first. Nothing is broken, because the two
zones agree on everything that matters, but an edit in either panel would apply to only some
lookups. Repair it before cancelling Wix. Read the Vodien section of `dns-cutover.md` first,
and check a resolver rather than the panel.


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
lib/            site.ts (nav + contract), capture.ts (lead tagging),
                content.ts (MDX reader)
content/
  url-contract.json          canonical preserved paths — the hard constraint
  concerns/index.ts          the eight concerns — one source, two surfaces
  home/copy.ts               homepage strings only; the flow's copy is in concerns/
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

**There is no questions band on a concern page.** One was built and removed the same day:
it widened a flow whose every other step narrows, its questions were not about the concern
(offshore teams got "how do I make a claim", because no article about a multi-country
workforce exists), and it sat between the panel's call to action and the form, diluting
the ask it was meant to support. A genuinely on-topic article belongs in the panel's
`furtherReading` — one link, in context, before the CTA. Four of the nine have one; the
rest have no matching article written yet, and no link beats a link that answers a
different question.

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
workforce that does not sit in one country". Both keep their equity.

All nine routes are now **four lines each** and render exactly the same thing. Maternity
briefly kept four sections it had before absorption, through a children slot on
`ConcernPage`; those were cut for the same reason as the questions band, and the slot went
with them. ⚠ That page is indexed and ranking and lost a lot of on-topic copy in the
process — watch its position, and if it slips, restore the timing segmentation
("planning / trying / already pregnant") first and put it **below** the form. The full
record of what went and what it cost is in the comment at the head of
`app/maternity-insurance/page.tsx`.

A concern that needs something the others do not gets an **optional field in the content
module**, never a per-page section: that way the addition is visible to all nine and the
shape the flow promises holds.

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
- **The footer carries no navigation at all.** The review was right that four columns of
  five ended the page in a second sitemap, and the first fix was `<details>` accordions
  below `sm` — 39% shorter on a 390px viewport, at the cost of ~30 lines of CSS and one
  shipped bug (forcing a `<details>` open needs **both**
  `::details-content { content-visibility: visible }` for current Chromium **and**
  `display: block` for engines without it; the first version shipped only the second and
  the desktop footer rendered with no links at all).

  On 2026-08-17 the columns went entirely, and the accordions with them. The reason is a
  count, not a taste: **12 of the 15 footer links were exact duplicates of `primaryNav`**,
  and the header is `sticky top-0`, so a visitor at the footer already had them 64px
  above. A comprehensive footer solves the problem of a header you must scroll back up to
  reach; this site does not have one. The three non-duplicates were rehomed — see
  **Where the footer's last three links went** below. Before adding a footer sitemap back,
  count how many of its links the sticky header already carries.
The review's third point, promoting the "same premium as going direct" line out of
footnote weight, was **tried and reverted**. At body size the claim dominated the trust
band and argued with the visitor before they had been asked anything, which is the
opposite of what a page whose job is to ask one question should do. It stays as one quiet
line. The claim is not lost: `/employee-benefits` makes it, and the
`how-does-the-insurance-concierge-get-paid` answer linked from several concern pages makes
it at length.

Also from that review and **not done**: a photograph of the adviser or team. There is no
such asset, and stock is not acceptable for it — a generic face is worse than none.

### Pages that are built, not ported

There was no Wix copy to reproduce for these. Nothing was invented for them either —
each is assembled from material the site already publishes:

| Page | Why | What it shows |
| --- | --- | --- |
| `/services` | Client-rendered on Wix at `/blog`; never captured. That path was the **Services** landing page, not a blog index, and it now 301s here. | The two product pages, all eight concerns in one flat list, the individual lead magnet, and the 12 posts — which also gives the posts an index, since the Wix category pages were dropped. |
| the six new concern pages | New paths, added with the flow. | The shared panel, a questions band, and a lead-tagged enquiry form. |

`/knowledge` and `/forms` were also built here and are now **tombstoned** — the
knowledge base moved to the CRM at `/member-resources`, and the member file library moved
with it as attachable documents. Both paths still answer 200 — deliberately, as tombstones
naming where their subject went, not because anything is stuck. See `tombstoned` in
`content/url-contract.json`, which is the account of that and the only place it should be
maintained.

### Unfinished sections ship hidden, and open themselves

The site is deployed with incomplete parts **gated off rather than filled with placeholder
text**. A visitor reading "[Real case needed, anonymised…]" on a page selling advice learns
exactly the wrong thing about the firm, so a production build renders neither the case
briefs nor the photography holding frames. `npm run dev` shows both, so the gaps stay
visible to whoever is writing.

**No flag has to be flipped later.** `image` and `case` on each concern are tagged unions,
so the moment a `kind: 'brief'` becomes a `kind: 'photo'`, or a `kind: 'placeholder'`
becomes a `kind: 'real'`, that section appears on the live site by itself. Sections open as
the pieces arrive, one concern at a time, and there is no way to ship a half-finished panel
by accident. The gate is `SHOW_UNFINISHED` in `components/concern-panel.tsx`.

```bash
npm run content:status   # what each panel is showing, and what is still missing
```

A panel without its evidence still reads: situation, three things to consider, what we do,
and the call to action.

### What is still placeholder content

Nothing below is invented, but nothing below is finished either:

- **Six of the nine case studies.** Each renders bracketed and visibly unfinished, with
  a brief describing what a real one needs. A case does **not** have to end in a win —
  "we recommended staying put" is often the more credible story. **Two real cases** exist,
  each anonymised and cleared by the family in it, and neither is to be restated elsewhere:

  - `/maternity-insurance` — a newborn nine weeks early, covered from birth to S$207,000
    against a S$260,000 bill. The S$53,000 the family paid stays in; a case where insurance
    covered everything reads like advertising.
  - `/beyond-employer-cover` — a company plan capped at S$100,000, a first year of cancer
    treatment over S$200,000, and a top-up that took the family to S$3.8 million. It runs
    four paragraphs where the others run two, because its fourth is the only thing on the
    site that demonstrates the panel's own claim that you are insurable *today*: no new
    insurer would take her now, and the plan renews anyway, across borders.

  **The first was published in the wrong place, and wrongly described, until 2026-08-17.**
  It ran on `/beyond-employer-cover` as a company scheme — an opening line about an HR
  manager, and the S$207,000 newborn limit attributed to an employer's plan. It is an
  *individual* policy and no employer was involved. It is not to be moved back to prop up
  that panel; the case now there is a real company plan, which is what that argument needed.

  **A scenario is not a case.** `/cover-for-senior-hires` carries a written illustration
  rather than a client's story, typed as `kind: 'scenario'` so the panel labels it in
  plain words on the page. It exists as its own variant, and not as a real case with a
  caveat, because the two must not render alike: the site's argument rests on a reader
  being able to believe the real one, and an illustration in the identical frame spends
  credit it did not earn. Never promote a scenario to `real` to make it read better — the
  only thing that turns one into a case is it having happened, to someone who agreed.
  `npm run content:status` marks scenarios `~` and real cases `✓`.
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
- **The forms library**, which now holds exactly one document. The page is live but no
  longer linked from anywhere — members are sent a direct link when they need a document,
  which is how the library is actually distributed. Adding to it is editing
  `public/forms/manifest.json` and committing the file beside it; see below.
- **The privacy policy**, which is complete but dated 5 MAY 2018, so it predates the PDPA
  amendments in force from 2021 — mandatory data-breach notification among them. This firm
  handles health and claims data, which is where that matters most. It stays linked and
  flagged for **legal** review: currency, retention periods, and whether the described
  claims-data flows are the ones the firm actually runs. It is not flagged for naming the
  wrong law — it cites the Personal Data Protection Act 2012 correctly, and a review
  claiming otherwise was mistaken. See the note in `app/privacy/page.tsx`.

#### Where the footer's last three links went

Removing the sitemap left three destinations that the sticky header does not carry. None
was deleted — all three routes still build and are still preserved paths in the URL
contract. Only the links moved:

| Path | Now reached by |
| --- | --- |
| `/privacy` | Two places, deliberately. The footer's **legal line**, beside the GST registration, on every page; and the consent tickbox in `components/capture-form.tsx`, at the point of collection. |
| `/forms` | A direct link sent to a member by email or WhatsApp when they need a specific document, plus the `/file-access` and `/file` 301s. Nobody hunts for a claim form on a marketing site. |
| `/projects` | Nothing — the page is gone and the path is `dropped`, so it 404s. |

**Why `/privacy` is in two places and not one.** The point-of-collection link is the
better of the two and was meant to replace the footer link outright. It cannot yet:
`captureEnabled` in `lib/capture.ts` is false unless `NEXT_PUBLIC_N8N_CONTACT_WEBHOOK` is
set, `render.yaml` only documents that variable rather than setting it, and every capture
point currently falls back to a mailto — so **no form renders on the live site**. Moving
the link to the forms alone would have taken the site from a privacy link on every page to
a privacy link nowhere, on a firm that collects personal data and handles health data. Do
not remove the footer one as a tidy-up; check that forms actually render in `out/` first.

#### Consent is a tickbox, and the record says what was ticked

Every capture point requires a ticked disclaimer before it will send:
*"I agree to The Insurance Concierge handling my personal data as described in the privacy
policy."* It is `required` in the markup, so a browser blocks submit, and `handleSubmit`
checks it again — a submission arriving by any other route must not reach n8n without
consent, in the same spirit as the honeypot beside it.

**The wording is defined once, in three parts, in `lib/capture.ts`.** The page renders
them with the middle part linked to `/privacy`; `CONSENT_STATEMENT` joins the same three
into the string posted with the submission. That is deliberate: the record has to be
character-for-character what the visitor saw, and a consent record that does not say what
was agreed to is not much of a record. Every submission carries
`consent: { agreed, statement }` alongside `submittedAt` — what, and when.

It **agrees to the policy, not to a narrower purpose.** "To respond to this enquiry" was
considered and rejected: `content/pages/privacy.mdx` also reserves the use of data for
direct marketing, so that tickbox would authorise less than the policy it points at.

⚠ **A separate marketing consent would be the stronger practice** and is not built. One
blanket tick covering both reply and marketing is weaker than splitting them, and
Singapore's Do Not Call rules treat marketing consent as its own thing. That is a second
tickbox and a second field in the record, not a rewording of this one.

**`/projects` was retired**, on the owner's instruction, once losing the footer link left
it with no inbound link at all. The Wix original was an unfinished template; Phase 2
rescued it by listing the service pages derived from `primaryNav`, which meant it re-listed
the nav and nothing else. A page nobody links that only repeats the nav is not worth
keeping.

**It 404s, deliberately.** It was briefly given a 301 to `/services` on the reflex that an
indexed path is always worth preserving. That reflex is right for a real page and wrong
here: there was never any original content to preserve, and the owner's read is that the
page was "legacy and a mistake from the old site". So it moved from `preserved` straight to
**`dropped`**, alongside the Wix store template and the demo blog posts — the bucket that
exists for exactly this. `verify:urls` now asserts it emits nothing, which is what stops it
being restored later on the strength of an old sitemap.

A useful side effect: because `render.yaml` does not govern the live service, a redirect
here would have needed adding to the Render dashboard by hand, and would have sat
unconfigured indefinitely. Dropping it leaves nothing outstanding.

#### `/forms` is the one route that names insurers

Everywhere else it is a hard rule and `npm run verify:copy` fails the build on a name
anywhere in `out/` — body copy, a metadata description, an image alt, a served JSON file.
The file library is the exception, because it is grouped by insurer and it is grouped that
way for the member's sake: nobody thinks "outpatient guide", they think "the plan I'm on",
and that insurer's name is printed on their schedule. A library that refuses to say it is
a library they cannot navigate.

The guard was **scoped, not switched off**, and the boundary is narrow on purpose:

- Only the `insurer name` check is exempt, and only on `forms.html`, `forms.txt` and
  `forms/`. That is the page's verified built footprint; no other route's output carries
  its copy.
- **Panel and market-coverage patterns still fail here.** Naming the insurer whose form
  you are hosting is a service fact. "Our panel" and "all major insurers" are claims, and
  they are still barred on this page like every other.
- The exemption **prints what it allowed** on every run, so a build log always shows the
  roster it let through. A carve-out nobody can see is how a guard rots.

Adding a document is two steps: commit the file to `public/forms/files/`, and add an entry
to `public/forms/manifest.json`. `lib/forms-schema.ts` validates it and `readFormLibrary`
in `lib/content.ts` throws if the file is not on disk, so a manifest entry can never ship
as a 404 for the one member who needed that form. File size is read from disk rather than
typed in. `updatedAt` means the **document's** revision date and should be left out rather
than guessed — a wrong date tells a member their claim form is current when it may not be.

Two open questions for the firm, not for the code: these are the insurers' documents on a
public indexable domain, which is worth confirming per carrier; and a superseded form left
up is a live service failure, so the library wants a review cadence.

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
  inches below says the policy covered to S$207,000 against a S$260,000 bill.

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
| redirects | the six from the URL contract |

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

### The knowledge base is not here

It ships from the CRM, served at `www.asktic.com/kb` by a Render rewrite to
`rainmaker.asktic.com`. This repo had a frontmatter schema and a `content/kb` directory
for a version that was never built; both are gone, and the sitemap `app/robots.ts`
announces is the CRM's.

The decisions that schema encoded were carried over, not dropped: the two-field public
gate (`audience` + `status`) is `visibility` + `status` in the CRM's `KbVisibility`, and
the review dates are `last_reviewed_at` / `review_due_at` on `kb_articles`. One was
deliberately left behind — insurer neutrality is a rule for *this* site only, so a CRM
article may name a carrier.

What stays here is the Freshdesk capture and its redirect obligation: those URLs are
indexed, and each published article owes a 301 wherever it lands. See
`content/_inventory/README.md`.

---

## Out of scope

`TIC_CRM_WebAPP` · the live Wix site (read-only) · Freshdesk content (read-only — the
n8n proxy is `GET`-only and action-whitelisted to `/api/v2/solutions/*`) · DNS.

The existing **Freshdesk Read Tool** workflow was deliberately left untouched: it is the
CRM's canonical ticket path with a long validation history, and the site migration has
no business regressing it. Solutions access is a separate, additive workflow.
