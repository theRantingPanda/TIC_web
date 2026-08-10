# Capture status

Last updated: 2026-08-10

## Wix site — NOT STARTED (blocked)

`www.asktic.com` and `static.wixstatic.com` are blocked by the environment's egress
policy. Allowlist `asktic.com`, `*.asktic.com`, `*.wixstatic.com`, then run
`npm run capture:site` and `npm run capture:assets`.

## Freshdesk help centre — STOPPED BY DECISION (2026-08-10)

**Article extraction is halted and will not be resumed.** Most Solutions content is
stale; Steven will supply KB copy by hand instead. Do not restart the pull to "finish"
this — the remaining 29 articles are not wanted.

⚠ **The 4 captured Allianz articles below are NOT a source of truth.** They are a
point-in-time archive of content already judged stale. Do not port them into
`content/kb/`. KB copy comes from Steven.

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

**What actually delivers the 410: retire the article in Freshdesk.** Unpublishing or
deleting it there makes Freshdesk itself stop serving the URL, which is the only lever
that works while `support.asktic.com` resolves to Freshdesk. That is a **write** to
Freshdesk, and Freshdesk is read-only for this project — so it is Steven's action to
take in the Freshdesk admin UI, not something this tooling does.

Until then the URL keeps serving the live article as normal. Nothing in this repo
changes that, and nothing here should be read as having retired it.

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

Nothing is at risk in the meantime: only files in `content/kb/` reach the build, and
that directory is still empty.

## Attachments are not archived

Article `6000279634` (Allianz — Family Policy Number & Access Rules) carries
`MyHealth Digital Services Guide.pdf` (903 KB). Freshdesk serves attachments via signed
URLs that expire roughly 5 minutes after they are issued, so they cannot be fetched
later from a stored capture — they must be downloaded in the same pass as the article
listing. The capture records attachment metadata (id, name, content type, size) only.
Any article attachment that needs to survive the migration has to be pulled deliberately
during the article fetch.
