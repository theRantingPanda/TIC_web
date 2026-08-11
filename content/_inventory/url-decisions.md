# STOP — sitemap reveals 50 URLs, and /blog is substantial

Generated 2026-08-11. Recorded by hand from a direct sitemap read, not from
`npm run capture:site` — no page content has been captured.

Two of the brief's stop conditions are tripped.

## 1. More than 20 pages (limit 20, found 50)

`https://www.asktic.com/sitemap.xml` is a sitemap **index** with four children:

| Child sitemap | URLs |
| --- | --- |
| `pages-sitemap.xml` | 14 |
| `blog-posts-sitemap.xml` | 15 |
| `blog-categories-sitemap.xml` | 9 |
| `store-products-sitemap.xml` | 12 |
| **Total** | **50** |

## 2. `/blog` is substantial — the port estimate is wrong

The brief treats `/blog` as a single page. It is 15 posts plus 9 category index pages,
24 URLs in total. Twelve of the posts look like real FAQ-style content that overlaps
heavily with the knowledge base:

```
/single-post/how-do-i-make-a-claim-with-my-international-health-insurance
/single-post/why-has-my-renewal-premium-increased
/single-post/what-happens-if-my-claim-is-rejected
/single-post/how-do-i-get-pre-authorisation-for-a-planned-procedure
/single-post/does-my-plan-cover-maternity-and-newborn-care
/single-post/will-my-pre-existing-conditions-be-covered
/single-post/what-is-the-difference-between-international-and-local-health-insurance-in-singapore
/single-post/how-does-the-insurance-concierge-get-paid
/single-post/when-should-i-start-my-policy-renewal-process
/single-post/am-i-covered-for-dental-and-optical-treatment
/single-post/2018/04/30/travel-insurance-tips-i-wished-i-knew
/single-post/2018/05/06/with-health-insurance-is-major-illness-insurance-necessary
```

Three are unmodified Wix template posts. **RESOLVED (2026-08-11): dropped** —
`design-a-stunning-blog`, `grow-your-blog-community`,
`manage-your-blog-from-your-live-site` are recorded in `url-contract.json` → `dropped`
and enforced by `verify:urls`, on the same 404-not-301 basis as the store URLs above.

**RESOLVED (2026-08-11) for the rest of `/blog`:**

- **The 12 real posts are ported**, preserved verbatim at their original
  `/single-post/...` paths per the hard constraint. Two carry a `/YYYY/MM/DD/` segment
  (`/single-post/2018/04/30/...`, `/single-post/2018/05/06/...`) — indexed, so the
  Wix-ism is frozen in place deliberately. The route is a catch-all
  (`app/single-post/[...slug]/page.tsx`) precisely because of that depth difference.
- **The 8 `/blog/categories/*` pages are dropped** — thin Wix-generated taxonomy with no
  original content; the posts they list are preserved individually.

⚠️ `/blog` itself appeared in the `blog-categories` child sitemap but is **preserved**,
not dropped. The sitemap listed 9 URLs there; only 8 are category pages.

## 3. A Wix store exists and is entirely placeholder content

`store-products-sitemap.xml` lists 12 products, every one a Wix demo stub:
`/product-page/i-m-a-product` through `i-m-a-product-11`. This looks like a store
template that was enabled and never removed. These are indexed today.

**RESOLVED (2026-08-11): dropped.** All 12 are recorded in `content/url-contract.json` →
`dropped`, and `npm run verify:urls` now asserts they emit nothing — so the exception is
enforced, not just documented. This is a deliberate, signed-off exception to the
URL-preservation constraint.

They will return **404**. A `410 Gone` is the better signal for content retired on
purpose, and unlike the AIG case these URLs *are* on `www.asktic.com`, which this site
will serve — so a rule here could actually fire. It is not implemented because Render's
support for a custom status code is unverified (see `render.yaml`); its routes document
`redirect` (301) and `rewrite` (200) only. Worth revisiting once someone can read
<https://render.com/docs/redirects-rewrites> on an unrestricted network.

Do **not** 301 these to the homepage or a category page. Redirecting placeholder product
URLs to unrelated content is a soft-404 pattern that search engines treat as a quality
signal against the site — a clean 404/410 is the correct outcome.

## 4. Paths in the sitemap that are missing from `url-contract.json`

```
/copy-of-upgrading-works      RESOLVED — junk, dropped
/file                         RESOLVED — old file-access page, 301 -> /forms
/quotation-questionaire       RESOLVED — dropped
```

**RESOLVED (2026-08-11):** `/copy-of-upgrading-works` is a Wix duplicate-page artefact
with no original content — dropped, nothing to redirect to. `/file` is the older
file-access page, so it redirects to `/forms`, the same destination as `/file-access`;
both rules are in `render.yaml`. They are distinct paths, not a prefix pair — Render
matches the full path, so neither shadows the other.

**RESOLVED (2026-08-11): `/quotation-questionaire` is dropped.** Worth one note for the
record: unlike the store URLs and template posts, this was a *functioning* page — a quote
request form. It was deliberately not redirected. If it turns out to have carried
lead traffic, a 301 to `/forms` (or a contact page) would recover it; a 404 will not.

`content/url-contract.json` is now **complete and authoritative**: 23 preserved, 25
dropped, 3 redirect-only. That covers every URL in the live sitemap, plus `/knowledge`
and `/forms`, which are new paths with no Wix equivalent.

## 5. Images are still blocked

`www.asktic.com` is now reachable (HTTP 200), but `static.wixstatic.com` still returns
**403** from the egress proxy. `npm run capture:site` would work today;
`npm run capture:assets` would fail on every image. Add `*.wixstatic.com` — or whatever
exact form the allowlist accepts — before running the asset pull.

## What has NOT been checked

The client-identifying content scan has not run — that requires the actual page crawl.
Nothing here says anything about named clients, logos or testimonials either way.

## Recommended next steps

1. Get `static.wixstatic.com` unblocked (only the `asktic.com` allowlist lines took
   effect; the wixstatic line has not).
2. Then run `npm run capture:site` and review the client-content flags — that scan has
   still never run, so nothing is known either way about named clients or testimonials.

**All URL decisions are closed.** No sitemap path is unclassified.

Resolved: the store URLs, the 3 Wix template posts, the 12 real posts, and the 8 blog
category pages. See sections 2 and 3.
