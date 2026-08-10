# Capture status

Last updated: 2026-08-10

## Wix site — NOT STARTED (blocked)

`www.asktic.com` and `static.wixstatic.com` are blocked by the environment's egress
policy. Allowlist `asktic.com`, `*.asktic.com`, `*.wixstatic.com`, then run
`npm run capture:site` and `npm run capture:assets`.

## Freshdesk help centre — PARTIAL (4 of 33 articles to pull)

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

Open, if you want it tidier than a bare 404: the retiring
`/support/solutions/articles/<id>-...` URL could 301 to `/knowledge` instead of dying,
so stray inbound links land somewhere useful. A `410 Gone` is the other defensible
option and is the stronger signal to search engines to drop it. Currently it will simply
404. No action taken either way.

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
