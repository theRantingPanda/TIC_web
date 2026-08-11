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

Three are unmodified Wix template posts and are almost certainly disposable:
`design-a-stunning-blog`, `grow-your-blog-community`, `manage-your-blog-from-your-live-site`.

Note the URL shape: posts live at `/single-post/...`, two of them with a `/YYYY/MM/DD/`
segment. Under the URL-preservation constraint these paths have to survive exactly as
they are, which is a Wix-ism worth a deliberate decision rather than a default.

## 3. A Wix store exists and is entirely placeholder content

`store-products-sitemap.xml` lists 12 products, every one a Wix demo stub:
`/product-page/i-m-a-product` through `i-m-a-product-11`. This looks like a store
template that was enabled and never removed. These are indexed today.

**Decision needed:** carrying 12 placeholder product URLs into the new site to satisfy
URL preservation would be absurd. The sensible move is to let them 404 (or 410) — but
that is a deliberate exception to the hard constraint, so it needs sign-off rather than
being quietly dropped.

## 4. Paths in the sitemap that are missing from `url-contract.json`

```
/copy-of-upgrading-works      probable Wix duplicate-page artefact
/file                         distinct from /file-access — purpose unknown
/quotation-questionaire       note the spelling; preserve exactly if kept
```

Plus every `/single-post/*`, `/blog/categories/*` and `/product-page/*` URL above.

`content/url-contract.json` currently lists 11 preserved paths. The real indexed surface
is roughly 50. **The URL contract is materially incomplete** and must not be treated as
authoritative until this is resolved.

## 5. Images are still blocked

`www.asktic.com` is now reachable (HTTP 200), but `static.wixstatic.com` still returns
**403** from the egress proxy. `npm run capture:site` would work today;
`npm run capture:assets` would fail on every image. Add `*.wixstatic.com` — or whatever
exact form the allowlist accepts — before running the asset pull.

## What has NOT been checked

The client-identifying content scan has not run — that requires the actual page crawl.
Nothing here says anything about named clients, logos or testimonials either way.

## Recommended next steps

1. Decide on the store: let the 12 placeholder product URLs go, or preserve them.
2. Decide on the blog: port 12 posts, drop 3 Wix templates, and confirm `/single-post/`
   paths are preserved verbatim.
3. Confirm what `/file`, `/copy-of-upgrading-works` and `/quotation-questionaire` are.
4. Get `static.wixstatic.com` unblocked.
5. Then run `npm run capture:site` and review the client-content flags.
