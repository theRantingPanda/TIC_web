# Retired from the public site, kept as migration source

Nothing in this directory is served or rendered. It is here so the content that came off
the public site on 2026-08-17 is not lost from the repository before it lands in the CRM.

## `forms/`

The member file library that served `/forms`: `manifest.json`, its schema, and the PDFs
under `files/`. All of it now 404s on the live site (2026-08-19); the stub manifest and
stub PDF that briefly stood in for them have been dropped from the URL contract.

It was moved out of `public/` rather than deleted, and the distinction matters. Anything
under `public/` is served at its own URL, so leaving it there would have kept
`/forms/files/allianz-telehealth-user-guide.pdf` publicly downloadable and
`/forms/manifest.json` publicly readable — naming an insurer — after the page linking to
them had gone. Retiring a page does not retire the files it pointed at.

### ✓ REMOVED FROM THE LIVE SITE 2026-08-19 — after a day and a half of not being

Read this before anything else here, because it reverses what this file said for a day.

Everything retired on 2026-08-17 was still publicly readable on www.asktic.com through
2026-08-18 and most of 2026-08-19:

    /knowledge.html                        200   43,695 bytes, the full page
    /forms.html                            200   32,879 bytes, NAMES AN INSURER 6 TIMES
    /single-post/<each of 12>.html         200   full articles
    /forms/manifest.json                   200
    /forms/files/…-telehealth-….pdf        200
    …plus a .txt twin and __next.*.txt payload dump for each

Those files are gone now. A **clear-cache deploy** removed them —
`POST /v1/services/{id}/deploys` with `{"clearCache": "clear"}`, or *Clear build cache &
deploy* in the dashboard.

#### Two reading errors, and the second is the expensive one

**The extensionless 404.** `/knowledge` — no extension — returns 404, and that was read as
proof the page had gone. It is not. Render resolves a clean URL against the CURRENT
deploy's manifest, so the extensionless path 404s while an explicit path is served from
disk if the file physically exists. `/knowledge` 404s and `/knowledge.html` served 43KB of
it. **Never accept an extensionless 404 as evidence a page is gone. Ask for the file.**

**The cause, asserted rather than measured.** This file said Render's static publish was
ADDITIVE — new files overwrite, absent files are never deleted, everything ever published
stays published — and that *"Clear build cache & deploy does NOT fix it, and was tried."*

The symptom was real and carefully measured. The cause was inferred, and the "was tried"
was not true. The deploy history shows exactly one non-`new_commit` deploy in the relevant
window, a `manual` redeploy on 18 August at 14:50 to pick up an env var, eight hours AFTER
that sentence was written and thirteen minutes after the commit calling the purge "a Render
dashboard action … not part of this merge". There was nothing for it to refer to.

The experiment, run 2026-08-19: `/blog.html` — stranded since a 16 August publish, not
emitted by the build — served **200, 45,940 bytes, `last-modified: 16 Aug 05:06:34`**
straight through an ordinary auto-deploy at 14:35, then **404** after a clear-cache deploy
at 14:53. Both ran commit `5dd7805` and published an identical `.build-stamp.json`
`inputHash` and `inputFileCount`, so the cache clear was the only variable. Nine of nine
stranded paths went with it, cache-busted, `cf-cache-status: MISS`.

So the stale files were being re-copied into each publish from the retained build cache.

#### The rules that survive

**Removing a file from the repo is still not, by itself, a removal from the site.** It is
an omission from the next upload, and the old copy keeps being served until the cache is
cleared. The three-step retirement stands — only step 2 got much cheaper.

**And step 2 is per-deploy, not a one-off repair.** Measured on 2026-08-19: seven paths
dropped from the build in the very next ordinary deploy after a purge stranded again
immediately, each serving its previous artifact. The build cache is repopulated on every
build, so an ordinary deploy still cannot remove anything, however clean the disk was an
hour earlier. Treat a clear-cache deploy as part of the removal, not as a recovery from
one that went wrong.

1. Remove it from the repo, so it is not republished.
2. **Clear the build cache and deploy** — *not* an ordinary deploy, and not once. (Also
   not: recreate the service, or open a support ticket. Both were on this list and
   neither is needed.)
3. Verify each retired URL returns 404 **to a cache-busted request, with its extension**:

       curl -sI "https://www.asktic.com/knowledge.html?bust=1"

Until step 3 passes, the content is public and the retirement is not done, however clean
the diff looks.

**And write "was tried" only with the artefact.** A deploy id, a timestamp, a response.
On Render the artefact is the deploy record's `trigger` field, because the API does not
expose `clearCache` on a deploy — a non-`new_commit` trigger is the only trace such a run
leaves. When inheriting a claim like that one, go and look for the artefact before
building anything around it.

## What is NOT here

`content/blog/*.mdx` — the 12 articles behind the retired `/single-post/…` paths — stayed
where they were. Nothing renders them now, but they were never served directly, so they
carry none of the exposure the PDFs did.

## When this can go

Once both are in the CRM and someone has confirmed it. Deleting earlier means the only
copy is whatever was uploaded, unverified.
