# Port worklist — defects in the live Wix site

What is wrong with asktic.com as it stands, to be fixed while porting rather than
carried across. Compiled 2026-08-11.

Two sources: a discovery review prepared 2026-08-10, and the page captures in `pages/`.
**Every item below marked ✅ was re-checked against the captured HTML in this repo** —
the capture is the evidence, and the check is repeatable. Items marked ⚠ could not be
confirmed from a capture and need a human eye.

Nothing here is fixed yet. Phase 3 has not started.

---

## Global — shared header and footer, one fix each

| # | Defect | Verified |
| --- | --- | --- |
| G1 | Header Facebook icon links to `facebook.com/wix` | ✅ `index.html` |
| G2 | Header YouTube icon links to `youtube.com/user/Wix` | ✅ `index.html` |
| G3 | Header LinkedIn icon has no link at all | ✅ image is not wrapped in an anchor |
| G4 | Copyright reads "© 2019" | ✅ "© 2019 The Insurance Concierge" |
| G5 | Nav item "Services" points to `/blog` | ✅ — see note below |
| G6 | "Knowledge Base" nav points at `help.asktic.com` | ✅ and the host **does not resolve** |
| G7 | Footer logo links to `/home-1`, not `/` | ✅ |
| G8 | Interior pages carry no meta description | ✅ only `/` has one; 8 of 9 have none |
| G9 | Obsolete `meta keywords`, containing the typo "exptriate" | ✅ `employee benefits, exptriate insurance, health insurance, medical insurance` |

The footer's own social links are correct — `facebook.com/InsuranceConcierge`,
`sg.linkedin.com/in/dstevenneo`, and the YouTube channel. Those are the ones now in
`lib/site.ts`; the header's Wix-default links were not carried over.

### G5 is a naming problem, not a link to fix

`/blog` is the Services landing page — that is what the live nav calls it, and its title
is "Resource | The Insurance Concierge". The slug is indexed, so it stays. `lib/site.ts`
follows the live site and labels it **Services**. Do not "fix" this by pointing Services
somewhere else; that would strand an indexed URL.

### G6 is worse than a wrong host

`help.asktic.com` returns NXDOMAIN and has no record in the Vodien zone load sheet. The
live nav's Knowledge Base link is therefore **dead today**, not merely pointed at the
wrong place. The real help centre is `support.asktic.com` (CNAME to
`asktic.freshdesk.com`), which stays as it is — Freshdesk Solutions is parked, not
retired. On this site the nav links to `/knowledge` directly. See the note on
`tic-help-redirect` in `render.yaml`.

---

## `/` — Home

Hero ("peace of mind |" / "Simplified !"), five service cards, about block.

| # | Defect | Verified |
| --- | --- | --- |
| H1 | Four of the five service cards have a "Read More" with **no link** | ✅ of 15 "Read More" elements only 2 carry an href, both to `/international-health-insurance` |
| H2 | No card for Income Preservation, though it is a nav service | ✅ cards are Maternity, Employee Benefits, Contiguous cover, Marine Oil & Gas, Newborns |
| H3 | Newborns and Maternity cards have no destination page | ⚠ both are unlinked per H1; where they *should* go is a content decision |

Copy note: the about block says "at it since 2003" against a 2014 UEN. Both may be
defensible — practitioner track record vs entity age — but this is advertising material
for a licensed firm and the wording should be settled once and used consistently.

---

## `/international-health-insurance`

| # | Defect | Verified |
| --- | --- | --- |
| I1 | A "COVID-19" label still on the page | ✅ block 2 |
| I2 | "INDICATIVE COST FOR A 30 YEAR OLD" heading with **nothing beneath it** | ✅ it is the last block on the page |
| I3 | Broken heading case: "pRE-EXISTING CONDITIONS" | ✅ block 14 |
| I4 | Grammar: "Continuous cover even you relocate to another country" | ✅ block 11 |
| I5 | Hero image is a COVID mouth-swab stock photo | ✅ its alt text is `coronavirus-mouth-swab-test-virus-diseas` |

I2 is the one worth thinking about rather than patching: an indicative pricing block is
exactly the sort of thing to render from data — the repo already has quotation skills —
instead of hand-placed copy that goes stale silently. Flag it; do not solve it in
Phase 1.

Note the capture also lists each bullet twice, once as a `list` and once as loose
`paragraph` blocks. That is Wix emitting both a list and its responsive duplicate, not
duplicated copy on the page.

---

## `/income-preservation-1` — PORTED 2026-08-11

The one page whose only open question has been answered, so it is ported.

**The "since 2003" note in the 2026-08-10 discovery was wrong on two counts.** The live
copy says **2023**, not 2003, and it is on this page, not the homepage — the homepage
about block makes no such claim. The sentence read:

> "…With years of experience since **2023**, we've come to understand each of our
> clients' unique insurance needs…"

Corrected to **2014**, the UEN registration year, on Steven's instruction 2026-08-11.
This is advertising copy for a licensed firm, so the claim has to be one the entity can
stand behind. The rest of the page is verbatim.

Its image's alt text was the filename ("Online bill payment concept.jpg"), which is
worse than nothing for a screen reader, so it renders `alt=""` as a decorative image.
Real alt text, or a decision that it stays decorative, is outstanding.

## `/employee-benefits` — PORTED 2026-08-11

Copy verbatim. Two things carried over that need a human:

| # | Item |
| --- | --- |
| E1 | **EXPERIENCED / EXPERT ADVICE / CONFIDENTIALITY are three headings with nothing under them** — on Wix and here. They read as value propositions someone never finished writing. Kept, because they are real claims the firm makes, but they currently say nothing. |
| E2 | **The contact form is now mounted here** — this is the page that had one on Wix, and `ContactForm` had been built in Phase 2 without ever being used. It needs `NEXT_PUBLIC_N8N_CONTACT_WEBHOOK` set on the Render service or it cannot submit; until then it tells the visitor to email instead. |

The page is also the only one publishing a phone number (+65 6681 6455), now in
`lib/site.ts` alongside the email so it is stated once.

## `/speciality-insurance` — PORTED 2026-08-11

Copy verbatim, including **"Specialty Covers"** with the American spelling in the
heading while the URL and nav say "Speciality". The slug is indexed and cannot change;
which spelling the prose uses is an editorial call.

The original had **no h1 at all** — its top heading was an h2. Promoted, since a page
with no h1 is a genuine accessibility and SEO defect and this is a rebuild.

## `/privacy` — PORTED 2026-08-11

Verbatim, and deliberately so: nothing in a privacy policy gets tidied, reworded or
trimmed as part of a migration. It is a legal statement about how data is handled, and
changing it is the firm's decision.

Checked for loss rather than assumed: every distinct word in the capture appears in the
MDX (373 of 373), and all 8 sections are present.

Two things for the firm, not for the migration:

- **It is dated "Last updated on 5 MAY 2018"** and describes a site with registration,
  orders and a shopping cart. It should be reviewed against what the new site actually
  does — which is a contact form and a file library.
- **A nested list renders as a following list rather than an indented one.** Wix
  serialised the sub-bullets both inside the parent item and as a separate list; the
  duplicate is removed, the nesting is flattened. Content-complete, slightly flatter
  than the original.

## Image alt text across the site

Worth one pass rather than twelve. Of 18 captured images: three have empty alt, one is a
filename, one is a photographer credit ("Image by Kelly Sikkema"), one is a stock-photo
slug ("coronavirus-mouth-swab-test-virus-diseas"), and three are the header's social
icons ("facebook", "linkedin", "youtube") which should be links, not images, on the
rebuild. The rest are short and serviceable ("Container Ship", "Pregnant Belly").

## `/projects` — PORTED 2026-08-11, needs real content

The Wix original was an unfinished template: an "Our Services" heading and the literal
placeholder "I'm a title. ​Click here to edit me." The placeholder is removed on Steven's
instruction, which leaves the heading and nothing else.

A page with only a heading is a dead end, and this one is in the nav and indexed, so it
now lists the five service pages. **Those links are not captured content** — but they
are not invented copy either: they come from `primaryNav`, so the page cannot drift out
of step with the nav.

Two things still open:

- **The page is titled "Our Services" but lives at `/projects` and is labelled Projects
  in the nav.** That mismatch is inherited from Wix. Settle which it is.
- **It shows no projects.** If there is real project or case-study work to show, this is
  where it goes — subject to the client-confidentiality rule: no named clients, logos or
  testimonials without written permission.

---

## `/file-access`

An unconfigured Wix template: "William Bach Collection", "Webb Hall", a Getty stock
image. Publicly reachable in that state. Already handled — it is `redirectOnly` in the
URL contract and 301s to `/forms`, along with `/file`. Nothing to port.

---

## Blog posts — PORTED 2026-08-11, copy not yet edited

All 12 are in `content/blog/` and rendering. `npm run port:blog` did the mechanical
work: sidebar chrome stripped, Wix's duplicate list-then-paragraphs collapsed, trailing
hashtags moved to frontmatter `tags`.

Two defects were fixed by the port rather than carried across:

- **Meta descriptions.** All 12 shared the Wix template default; `summary` now comes
  from each post's JSON-LD, which carries a real one.
- **Orphaned posts.** Dropping the 8 blog-category pages left nothing linking to the
  posts. Each post now links three siblings at its foot, which is what the Wix sidebar
  did.

Still outstanding, and needing a human:

| # | Item |
| --- | --- |
| B1 | **Copy is verbatim Wix.** Grammar errors are ported as-is — e.g. "Whilst travel insurance is designed manage the risk of travelling". Nothing has been rewritten; that is an editorial pass on advertising copy, not a migration task. |
| B2 | **One hero image has no alt text** — the travel post's. The other carries a real description ("patient wheeled in a hospital"), preserved. `heroAlt: null` renders `alt=""`, which is the honest encoding for "none was written". |
| B3 | **`"Disaster-Proof" your holidays!`** renders as a paragraph because that is what the capture recorded. On the live page it reads as a heading — check and promote it if so. |
| B4 | ~~Ten posts dated 2026-06-18~~ **Resolved 2026-08-11** — see below. |
| B6 | **Byline is inconsistent**: eleven posts say "Steven Neo", the 2018 major-illness post says "Steven". Faithful to Wix. Normalise if you want one byline. |
| B5 | **No index lists the posts.** `/blog` is the Services page, and the category pages are dropped. The sibling links mitigate this; a real index would need a new path and is a decision, not an oversight. |

### Post dates — resolved 2026-08-11

Ten posts carried `datePublished` values inside one 2.5-minute window on 2026-06-18
(02:07:32 → 02:10:08, sequential). That is Wix stamping a bulk save, not ten
publications, and ten identical dates advertise a content dump.

On Steven's instruction the display dates are now spaced a week apart, in the order Wix
actually created them, **ending on the real date** — so the last post keeps its true
date, nothing is dated into the future, and the ordering is genuine. The range is
2026-04-16 to 2026-06-18. The two 2018 posts have unique creation dates and were left
alone.

The Wix timestamp is preserved on every post as `sourceCreatedAt`. This is a
presentation choice, recorded and reversible, not a discarded fact. The logic lives in
`assignDisplayDates` in `scripts/port-blog.ts` and applies to any future bulk-save group.

---

## Not captured, so not assessed

`/blog` and `/maternity-insurance` are rendered client-side by Wix and could not be
captured — see `_capture-status.md`. Nothing in this file says anything about their
content.

---

## One unresolved contradiction: is there a FAQ folder?

The 2026-08-10 discovery lists a Freshdesk **FAQ folder (`6000225632`)** covering medical
underwriting, ward classes and co-insurance. The enumeration in `_capture-status.md`,
run against the live Solutions API on 2026-08-10, found **no folder by that name** in any
category.

Both cannot be right, and neither has been re-checked since. It matters only if KB
content is ever ported from Freshdesk — which is currently stopped by decision, with KB
copy to be supplied by hand — so it is recorded rather than resolved.
