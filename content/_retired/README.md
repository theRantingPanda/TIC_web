# Retired from the public site, kept as migration source

Nothing in this directory is served or rendered. It is here so the content that came off
the public site on 2026-08-17 is not lost from the repository before it lands in the CRM.

## `forms/`

The member file library that served `/forms`: `manifest.json`, its schema, and the PDFs
under `files/`.

It was moved out of `public/` rather than deleted, and the distinction matters. Anything
under `public/` is served at its own URL, so leaving it there would have kept
`/forms/files/allianz-telehealth-user-guide.pdf` publicly downloadable and
`/forms/manifest.json` publicly readable — naming an insurer — after the page linking to
them had gone. Retiring a page does not retire the files it pointed at.

### ⚠⚠ NONE OF THIS WAS ACTUALLY REMOVED FROM THE LIVE SITE

Establish this before reading anything else here: as of 2026-08-18, **every page and file
retired on 2026-08-17 is still publicly readable on www.asktic.com.** The commits are
correct, the build is correct, and the site still serves all of it.

    /knowledge.html                        200   43,695 bytes, the full page
    /forms.html                            200   32,879 bytes, NAMES AN INSURER 6 TIMES
    /single-post/<each of 12>.html         200   full articles
    /forms/manifest.json                   200
    /forms/manifest.schema.json            200
    /forms/files/…-telehealth-….pdf        200
    …plus a .txt twin and __next.*.txt payload dump for each

#### Why the first check missed it

`/knowledge` — no extension — returns 404, and that was read as proof the page had gone. It
is not. Render resolves a clean URL against the CURRENT deploy's manifest, so the
extensionless path 404s, while an explicit path is served from disk if the file physically
exists. `/knowledge` 404s and `/knowledge.html` serves 43KB of it. **Never accept an
extensionless 404 as evidence a page is gone. Ask for the file.**

#### The cause, established rather than guessed

Render's static publish is ADDITIVE. New files overwrite, files absent from the new deploy
are never deleted. Everything ever published stays published.

The proof is the build stamp. The live `/.build-stamp.json` carries an `inputHash` and
`inputFileCount` identical to a local build of the same commit, stamped minutes after the
merge — so Render built exactly the right thing and is *additionally* serving the leftovers.
Not a cache either: cache-busted requests return `cf-cache-status: MISS` and still 200, with
`last-modified` frozen at the original upload.

"Clear build cache & deploy" does NOT fix it, and was tried. The build cache is about build
inputs; it has nothing to do with the published output directory.

#### The rule

**On a static host, deleting a file from the repo is not a deletion. It is an omission from
the next upload.** The old copy stays served until the publish directory is emptied, which
means recreating the service — or getting the host to purge it.

So a retirement has three steps, and the repo can only do the first:

1. Remove it from the repo, so it is not republished.
2. Empty the published directory — recreate the static site, or open a support ticket.
3. Verify each retired URL returns 404 **to a cache-busted request, with its extension**:

       curl -sI "https://www.asktic.com/knowledge.html?bust=1"

Until step 3 passes, the content is public and the retirement is not done, however clean the
diff looks. This is the asset twin of the redirect lesson in `render.yaml`: a repo change
that is necessary and not sufficient, because something outside the repo also holds state.

## What is NOT here

`content/blog/*.mdx` — the 12 articles behind the retired `/single-post/…` paths — stayed
where they were. Nothing renders them now, but they were never served directly, so they
carry none of the exposure the PDFs did.

## When this can go

Once both are in the CRM and someone has confirmed it. Deleting earlier means the only
copy is whatever was uploaded, unverified.
