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

### ⚠ And moving them was not sufficient either. Check the live URL.

A live sweep on 2026-08-18, the day after the move, found **both files still being served**:

    /forms/manifest.json                             200
    /forms/files/allianz-telehealth-user-guide.pdf   200

Not a cache. A cache-busted request returned `cf-cache-status: MISS` and still 200, so it
reached the Render origin and the origin served the file. `last-modified` was still the
original upload. Meanwhile the repository was correct in every way: absent from `out/`,
absent from `public/` on `main`, zero files matching `public/forms` in the merged tree.

So the deployed copies outlived the commit that removed them. What makes it stranger, and
worth knowing before guessing at a cause: the deleted **HTML** was pruned in the same
deploy — `/knowledge`, `/forms` itself and all 12 `/single-post/…` articles returned 404
correctly. Whatever the mechanism, it is not "Render never deletes".

**The rule this leaves behind: retiring anything under `public/` is not finished when the
commit merges. It is finished when the live URL returns 404 to a cache-busted request.**
A plain request is not evidence — the edge can answer it and make a live file look gone:

    curl -sI "https://www.asktic.com/forms/manifest.json?bust=1"

This is the asset twin of the redirect lesson in `render.yaml`: a repo change that is
necessary and not sufficient, because something outside the repo also holds state.

## What is NOT here

`content/blog/*.mdx` — the 12 articles behind the retired `/single-post/…` paths — stayed
where they were. Nothing renders them now, but they were never served directly, so they
carry none of the exposure the PDFs did.

## When this can go

Once both are in the CRM and someone has confirmed it. Deleting earlier means the only
copy is whatever was uploaded, unverified.
