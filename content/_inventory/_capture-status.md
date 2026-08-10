# Capture status

Last updated: 2026-08-10

## Wix site — NOT STARTED (blocked)

`www.asktic.com` and `static.wixstatic.com` are blocked by the environment's egress
policy. Allowlist `asktic.com`, `*.asktic.com`, `*.wixstatic.com`, then run
`npm run capture:site` and `npm run capture:assets`.

## Freshdesk help centre — PARTIAL (4 of 34 articles)

Every category and folder has been enumerated against the live Solutions API. Only the
Allianz folder's articles have been pulled.

| Category | Folder | Folder ID | Articles | Visibility | Scope | Pulled |
| --- | --- | --- | --- | --- | --- | --- |
| General | AIG | 6000243819 | 0 | 1 | — | n/a (empty) |
| Medical Insurance | Allianz | 6000244889 | 4 | 1 | public | **yes** |
| Medical Insurance | BUPA | 6000189001 | 12 | 1 | public | no |
| INTERNAL | AIG | 6000244183 | 1 | 1 | **public** | no |
| INTERNAL | BUPA | 6000244109 | 7 | 3 | internal | no |
| INTERNAL | Corporate Accounts | 6000244110 | 9 | 3 | internal | no |
| INTERNAL | Cigna | 6000244152 | 1 | 3 | internal | no |

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

**3. "The INTERNAL category is not publicly served" is not true as stated.** It is true
of three of its four folders. Folder visibility, not category name, is what Freshdesk
actually enforces.

### How the ingest classifies this

`scripts/ingest-freshdesk.ts` currently treats *anything* under a category matching
`/internal/i` as internal, **and** anything whose folder visibility is not `1` as
internal. Under that rule the public AIG article would be classified internal and would
not get a 301 — losing an indexed URL.

This has deliberately **not** been silently changed. Folder visibility is the
authoritative signal and arguably should win, but flipping it would mean an article
filed under INTERNAL becomes eligible for the public build, and that is not a call to
make without Steven confirming the AIG article is genuinely meant to be public.

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
