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
| I5 | Hero image is a COVID mouth-swab stock photo | ⚠ visual — the image is captured, judge it by eye |

I2 is the one worth thinking about rather than patching: an indicative pricing block is
exactly the sort of thing to render from data — the repo already has quotation skills —
instead of hand-placed copy that goes stale silently. Flag it; do not solve it in
Phase 1.

Note the capture also lists each bullet twice, once as a `list` and once as loose
`paragraph` blocks. That is Wix emitting both a list and its responsive duplicate, not
duplicated copy on the page.

---

## `/projects`

Two content blocks, one of which is the literal Wix placeholder
"I'm a title. ​Click here to edit me." An unfinished template page that is in the nav and
indexed. Preserved in the URL contract, so it has to emit something — what it should
say is an open decision.

---

## `/file-access`

An unconfigured Wix template: "William Bach Collection", "Webb Hall", a Getty stock
image. Publicly reachable in that state. Already handled — it is `redirectOnly` in the
URL contract and 301s to `/forms`, along with `/file`. Nothing to port.

---

## Blog posts

The 12 real posts under `/single-post/...` carry genuine FAQ-style content. Their
captures also pick up Wix sidebar chrome ahead of the body — "Our Recent Posts", the
related-post headings, "Tags". Strip that when porting; the body starts after it.

Their meta description is the Wix template default ("This is your blog post. Blogs are a
great way to connect with your audience…") on every post. Write real ones.

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
