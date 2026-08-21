# Capture status

Last updated: 2026-08-11

## Wix site — CAPTURED (19 of 21 pages, plus all images)

`npm run capture:site` and `npm run capture:assets` have both run against the live site.

- **21 preserved pages archived** to `pages/` — `<slug>.json` (structured) and
  `<slug>.html` (raw server response).
- **18 images pulled** to `public/images/`, capped at 2000px on the long edge.
- **2 pages captured empty** — see below. Everything else has real content.

The crawl is scoped to `url-contract.json` → `preserved` where `source: 'wix'`. Dropped
and redirect-only paths are deliberately not fetched.

### The 49-vs-50 sitemap count

The 2026-08-11 review recorded 50 sitemap URLs, summed across the four child sitemaps.
The deduplicated total is **49**: `/blog` is listed in both `pages-sitemap.xml` and
`blog-categories-sitemap.xml`. Nothing is missing — 49 = every classified path except
`/knowledge` and `/forms`, which are new and not on Wix. No unclassified path appeared,
so the contract still covers the live sitemap exactly.

### RESOLVED 2026-08-12: those two pages are genuinely empty

Captured at last, by running headless Chromium from an unrestricted sandbox — no
allowlist required, and none is needed now. With every parastorage host reachable and
the Wix framework loading cleanly (no "Widget Didn't Load"), **both pages render header
and footer and nothing else**. Identical 588-character output, byte for byte, on both:
nav, the about block, the GIA/MAS disclosure, contact details, "© 2019", Privacy.

So the earlier conclusion below was wrong in its consequence. The pages were never
"blocked from capture" in any way that mattered — they have no body content to capture.
The `/blog` and `/maternity-insurance` pages built for this site are not placeholders
standing in for richer originals; they are more than the originals contain.

**Do not spend more time on the parastorage allowlist.** It was a real block, and
lifting it changed nothing about these pages.

The render did surface three pieces of sitewide copy that the server-HTML capture never
saw, because the footer is client-rendered — the about block, the regulatory disclosure,
and the phone number. Those are now in `lib/site.ts`. See the port worklist.

### Superseded: the 2026-08-11 investigation

Both return an **empty `<main>`** from the server: Wix renders them client-side.

`static.parastorage.com` has since been allowlisted, and it moved things forward — the
Wix framework now boots and the header and nav render. The page body does not: it shows
Wix's own **"Widget Didn't Load — Check your internet and refresh this page."**

The remaining blocked hosts were identified from the browser's own failed requests
during a render, and confirmed one by one:

| Host | Status | Matters? |
| --- | --- | --- |
| `static.parastorage.com` | **200 — allowed** | yes, framework |
| `pages.parastorage.com` | 403 `CONNECT` denied | **yes — page data** |
| `siteassets.parastorage.com` | 403 `CONNECT` denied | **yes — site assets** |
| `bundler-velo.parastorage.com` | 403 `CONNECT` denied | probably |
| `engage.wixapps.net` | 403 `CONNECT` denied | unclear |
| `panorama.wixapps.net`, `frog.wix.com`, `sentry.wixpress.com`, `browser.sentry-cdn.com`, `www.googletagmanager.com` | denied | no — telemetry |

**Allowlisting `*.parastorage.com` rather than individual hostnames is the ask.** Naming
one host is what produced this second round trip. Then re-run `npm run capture:render`.

Failing that, the copy for these two pages has to be supplied by hand.

Note `/blog` is **not** a blog index — the live nav labels it **Services** and its title
is "Resource | The Insurance Concierge". It is the services landing page.

### `static.wixstatic.com` was never the blocker it looked like

Earlier notes recorded it as egress-blocked on the strength of `HTTPS 403` for
`https://static.wixstatic.com/`. That 403 is **the origin's own answer to a bare root
request** — Wix serves no directory listing. Media URLs under it download fine, which is
why `capture:assets` now succeeds. `scripts/lib/net.ts` treats any 403 as an egress
denial, which is right for a capture target but makes a bare-host probe misleading.
`static.parastorage.com` is the genuinely blocked host, and it fails differently: the
proxy refuses the `CONNECT` outright (`curl: (56) CONNECT tunnel failed`).

### Pages that need a human decision before porting

- **`/projects`** — 2 blocks, one of which is the literal Wix placeholder
  "I'm a title. ​Click here to edit me." It is an unfinished template page, and it is in
  the nav. Preserved in the contract, so it must emit something; what it should say is
  an open question.
- **`/privacy`** — flagged by the client-content scan for "Google Inc". Reading the
  capture, that is the Google Analytics disclosure in the privacy policy, not a client
  reference. No page was flagged for testimonials or a logo grid.

The blog-post captures also pick up Wix sidebar chrome — "Our Recent Posts", the
related-post headings, "Tags" — ahead of the real body. Strip that when porting.

## Freshdesk help centre — STOPPED BY DECISION (2026-08-10)

**Article extraction is halted and will not be resumed.** Most Solutions content is
stale; Steven will supply KB copy by hand instead. Do not restart the pull to "finish"
this — the remaining 29 articles are not wanted.

⚠ **The 4 captured Allianz articles below are NOT a source of truth.** They are a
point-in-time archive of content already judged stale. One has since been reworked by
hand into a CRM knowledge-base article (Allianz family policy number and portal access,
2026-08-19) — reworked, not ported, and by Steven's decision. That is the only route by
which any of them may be used; nothing here is copy.

The folder inventory is still accurate and worth keeping — it is a record of what the
help centre contained at migration time.

### What this costs, and why it is probably fine

The brief's hard constraint included a per-article 301 map for
`support.asktic.com/support/solutions/articles/*`. Without extraction there are no
article IDs, so that map cannot be built.

That is very likely moot: `support.asktic.com` points at **Freshdesk**, not Render, so
those URLs keep being served by Freshdesk exactly as they are today and need no
redirect. The map only ever mattered if the hostname were repointed at the new site.

If it is repointed later, the map needs **article IDs and titles only — not bodies**.
That is a listing-only pull, a fraction of the cost of a content capture, and
`npm run capture:freshdesk` already does it. The tooling stays in place for that case.

### Inventory as captured (4 of 33 articles pulled before stopping)

Every category and folder has been enumerated against the live Solutions API. Only the
Allianz folder's articles have been pulled.

| Category | Folder | Folder ID | Articles | Visibility | Scope | Pulled |
| --- | --- | --- | --- | --- | --- | --- |
| General | AIG | 6000243819 | 0 | 1 | excluded | n/a (empty) |
| Medical Insurance | Allianz | 6000244889 | 4 | 1 | public | **yes** |
| Medical Insurance | BUPA | 6000189001 | 12 | 1 | public | no |
| INTERNAL | AIG | 6000244183 | 1 | 1 | **excluded** | no |
| INTERNAL | BUPA | 6000244109 | 7 | 3 | internal | no |
| INTERNAL | Corporate Accounts | 6000244110 | 9 | 3 | internal | no |
| INTERNAL | Cigna | 6000244152 | 1 | 3 | internal | no |

Public scope is therefore **16 articles** (Allianz 4 + BUPA 12), of which 4 are pulled.

`_raw.json` carries `complete: false`, which propagates to `redirects.json` and makes
`npm run gen:redirects` refuse to run. A partial 301 map is worse than no map — the
articles it omits would 404 silently on cutover.

## Three findings that contradict the brief

**1. There is no FAQ folder.** The brief lists "a FAQ folder" in public scope. No folder
by that name exists in any category. Either it was removed, it is called something else,
or the brief is wrong. Needs a decision before the KB information architecture is built.

⚠ **Contradicted, unresolved (2026-08-11).** A separate discovery review dated
2026-08-10 names a **FAQ folder `6000225632`** — medical underwriting, ward classes,
co-insurance — under Medical Insurance. The enumeration in the table below, run the same
day against the live Solutions API, did not return it. Neither has been re-checked. This
only matters if KB content is ever ported from Freshdesk, which is stopped by decision,
so it is recorded rather than chased. If it is ever chased, re-run
`list_folders` for category `6000136048` and believe the API.

**2. The legacy AIG article is inside the INTERNAL category, and it is public.**
`INTERNAL > AIG` has `visibility: 1` (served to anyone), while its sibling folders are
`visibility: 3` (agents only). The `General > AIG` folder — where you might expect it —
is empty. So the article the brief calls a public legacy article does exist, but it
lives under INTERNAL.

**RESOLVED (2026-08-10): AIG is dropped — the partnership is winding down.** The article
is archived for the record but never published, and gets **no 301**; its indexed URL is
meant to lapse. `EXCLUDED_FOLDERS` in `scripts/ingest-freshdesk.ts` records this
explicitly rather than letting it depend on AIG happening to sit under INTERNAL — if
the visibility rule below is ever revisited, the exclusion still holds.

### Decision: the AIG URL should return 410 Gone — and this repo cannot deliver it

410 is the right call (it tells search engines to drop the URL outright rather than keep
retrying a 404). But it cannot be implemented from this codebase, for two independent
reasons. Recording them here rather than committing a rule that would never fire:

**1. That URL is not served by this site.** The article lives at
`support.asktic.com/support/solutions/articles/…`, and `support.asktic.com` points at
Freshdesk, not Render. No `render.yaml` route can affect a hostname this service does
not serve. Repointing it is a DNS change, which is out of scope.

**2. Render's support for a custom status code is unverified.** Its static-site routes
document `type: redirect` (301) and `type: rewrite` (200). Nothing found confirms an
arbitrary status such as 410, and both `render.com` and its docs mirror are blocked by
this environment's egress policy, so it could not be checked directly. Treat "Render can
return 410" as unconfirmed until someone reads
<https://render.com/docs/redirects-rewrites> on an unrestricted network.

**What would deliver the 410: retire the article in Freshdesk.** Unpublishing or
deleting it there makes Freshdesk itself stop serving the URL — the only lever that
works while `support.asktic.com` resolves to Freshdesk. That is a **write**, and
Freshdesk is read-only for this project, so it is an admin-UI action, not a tooling one.

**PARKED (2026-08-11).** Retiring Solutions in Freshdesk is deferred. Nothing is being
unpublished or deleted for now, so:

- the AIG article stays live at its current URL and returns 200, not 410
- every other Solutions article stays live and unchanged
- `support.asktic.com` keeps pointing at Freshdesk and is not this project's concern

Nothing in this repo has retired anything, and nothing here should be read as having
done so. Revisit when the AIG wind-down actually completes.

**3. "The INTERNAL category is not publicly served" is not true as stated.** It is true
of three of its four folders. Folder visibility, not category name, is what Freshdesk
actually enforces.

### How the ingest classifies this

`scripts/ingest-freshdesk.ts` applies, in order:

1. `EXCLUDED_FOLDERS` — retired by decision, archived only, never public, no redirect.
2. Category matching `/internal/i`, **or** folder visibility ≠ 1 → internal.
3. Otherwise → public.

Rule 2 is deliberately fail-closed and remains unchanged. With AIG excluded outright,
the practical conflict it created is gone, so there is no longer a reason to loosen it.
Should another publicly-visible folder ever appear under INTERNAL, the same question
returns — and it should be answered explicitly, not by changing the rule silently.

Nothing is at risk in the meantime: this repo no longer builds knowledge-base articles
at all. `content/kb/` and its schema were deleted on 2026-08-19 — the KB is the CRM's,
served at `www.asktic.com/kb`. What survives here is the redirect obligation: those
Freshdesk URLs are indexed, and each published article owes a 301 wherever it lands.

## Attachments are not archived

Article `6000279634` (Allianz — Family Policy Number & Access Rules) carries
`MyHealth Digital Services Guide.pdf` (903 KB). Freshdesk serves attachments via signed
URLs that expire roughly 5 minutes after they are issued, so they cannot be fetched
later from a stored capture — they must be downloaded in the same pass as the article
listing. The capture records attachment metadata (id, name, content type, size) only.
Any article attachment that needs to survive the migration has to be pulled deliberately
during the article fetch.
