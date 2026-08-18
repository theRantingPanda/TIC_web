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

## What is NOT here

`content/blog/*.mdx` — the 12 articles behind the retired `/single-post/…` paths — stayed
where they were. Nothing renders them now, but they were never served directly, so they
carry none of the exposure the PDFs did.

## When this can go

Once both are in the CRM and someone has confirmed it. Deleting earlier means the only
copy is whatever was uploaded, unverified.
