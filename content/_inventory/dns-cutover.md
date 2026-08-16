# DNS cutover — record

The site moved from Wix hosting to Render on **2026-08-12**. This is what changed, what
it looks like now, and what was verified. Written down because the next person to touch
this zone should not have to rediscover any of it.

**DNS hosting stayed on Wix.** The domain registration moved to Vodien; the nameservers
did not, and the plan to move them was dropped. `ns4/ns5.wixdns.net` remain authoritative
and are not editable, so the zone is managed in Wix's DNS panel.

⚠ **That last sentence is under challenge as of 2026-08-16** — a full copy of this zone has
since been staged in Vodien's DNS panel and someone attempted to move the nameservers.
Read [the Vodien panel section](#the-vodien-panel--read-before-touching-it) before making
any change there. The delegation is currently damaged.

---

## Final zone state

| Host | Type | Value | Note |
| --- | --- | --- | --- |
| `asktic.com` | A | `216.24.57.1` | Render's load-balancer IP |
| `www` | CNAME | `tic-web.onrender.com` | the site |
| `asktic.com` | MX | `aspmx.l.google.com` (10), `alt1` (20), `alt2` (30), `alt3` (40), `alt4` (50) | **Google Workspace — do not touch** |
| `support` | CNAME | `asktic.freshdesk.com` | help centre, still Freshdesk |
| `rainmaker` | CNAME | `tic-crm-dev.onrender.com` | CRM — **correct, despite the name.** See below |
| `docs` | CNAME | `cname.bitly.com` | Bitly short domain |
| `fdkey.support` | TXT | `8471c5…` | Freshdesk domain verification |
| `freshdesk` | SPF | `v=spf1 include:email.freshdesk.com ~all` | subdomain only |
| `fwtrack` | CNAME | `…fmsendcrmclick.net` | Freshmarketer click tracking |
| `fwdkim`, `fwdkim1` | CNAME | Freshworks SPF/DKIM | **email auth — do not remove** |
| `1s3`, `9tp4z`, `9tp4z2`, `9tp4z3`, `9tp4z4`, `q2zty`, `rvec3` `._domainkey` | CNAME | Freshworks DKIM keys | **email auth — do not remove** |

## Removed, and why

| Record | Was | Why |
| --- | --- | --- |
| apex A ×3 | `185.230.63.171/.107/.186` | Wix web servers, replaced by Render |
| `www` | `cdn1.wixdns.net` | Wix, replaced by Render |
| `m` | `www74.wixdns.net` | Wix mobile |
| `en` | `cdn1.wixdns.net` | Wix, would have broken when Wix went |
| `webmail`, `imap`, `pop`, `smtp` | `mail2.name-services.com` | legacy mail hosts; mail is Google Workspace |
| apex TXT | `MS=BCE617D5…` | Microsoft 365 verification, tenant dead |
| `28805265` | `sendgrid.net` | SendGrid domain auth, already orphaned — its `em…`, `url…` and `s1/s2._domainkey` siblings were long gone, so it authenticated nothing |
| `fslink` | `fslink.fwclick.io` | Freshsales link tracking, not in use |

**`fwtrack` was deliberately kept** while `fslink` went — Freshmarketer campaign tracking
is still wanted, Freshsales is not.

---

## The trap in this zone

The Freshworks records look like clutter and are not. `fwdkim`, `fwdkim1` and the seven
`._domainkey` CNAMEs authenticate mail that **Freshdesk sends on the firm's behalf** —
every ticket reply. Deleting them does not produce an error; it quietly pushes replies
toward spam folders, and the cause is not obvious weeks later.

The tell is `fdspfus.freshemail.io` inside the `fwdkim1` chain. `fd` is Freshdesk.

---

## The Vodien panel — read before touching it

Because registration sits at Vodien, its control panel offers both a **Name Servers** tab
and a **DNS Settings** tab for `asktic.com`. Neither does what it appears to. Recorded
2026-08-16 from the panel itself, after an attempted nameserver change failed with
`Save changes request error`.

### The delegation is currently damaged

What the Name Servers tab holds:

| Row | Value | Assessment |
| --- | --- | --- |
| Name Server 1 | `ns5.wixdns.net` @ `216.239.38.101` | Correct host. Half a delegation — `ns4` is absent. The IP is superfluous |
| Name Server 2 | `asktic.com` @ `216.24.57.1` | **Wrong.** `216.24.57.1` is Render's web load balancer, copied from the apex A record above. It does not answer DNS |
| Host Records | `asktic.com` → `216.24.57.1` | The registered host object feeding Name Server 2. Delete after clearing NS2 |

A nameserver form and an A record are different layers. *Which server hosts the site* is a
host record, set in Wix. *Who answers DNS for this domain* is the delegation, set here.
Pasting the first into the second is the error to watch for.

The IP column is for glue records, which apply only to nameservers **inside** the domain
being delegated — `ns1.asktic.com`, say. For anything under `wixdns.net` the registry
resolves the address itself, and most will reject a supplied IP. That is a second reason
the save failed. The rejection was a guardrail; nothing committed.

**The live consequence is loss of redundancy, not an outage.** One working nameserver and
one dead entry does not fail cleanly: resolvers try both, mark the dead one slow, and
mostly succeed. The zone resolves. But it is now served by `ns5` alone, so a single Wix
nameserver incident takes down the site, the CRM, the help centre and all mail delivery at
once — with no second nameserver to answer. Restore the full pair.

**Do not re-enter `ns4/ns5` from this document.** Wix assigns pairs per account and
`ns6/ns7.wixdns.net` is equally common. Read the values off Wix's own domain panel or
`whois asktic.com`.

### A parallel zone is staged at Vodien, and it is incomplete

Vodien's DNS Settings tab holds 18 records — a near-complete copy of the zone above, marked
`Active`. **`Active` means "saved in Vodien's system", not "live on the internet".** The
delegation points at Wix, so none of it is served. There is no warning to that effect.

Staged and correct: the apex `A`, `www`, `rainmaker`, `support` and `docs` CNAMEs, all five
Google MX, the apex SPF, `_dmarc`, `fdkey.support`, and `google._domainkey` — the last
verified by hand as a complete 2048-bit RSA key, exponent 65537, not truncated.

Missing, all of them Freshworks email authentication:

| Record | Type | Confidence |
| --- | --- | --- |
| `9tp4z._domainkey` | CNAME | Confirmed absent |
| `9tp4z2._domainkey` | CNAME | Confirmed absent |
| `9tp4z3._domainkey` | CNAME | Confirmed absent |
| `9tp4z4._domainkey` | CNAME | Confirmed absent |
| `fwdkim` (the one without the `1`) | CNAME | Confirmed absent |
| `fwtrack` | CNAME | Confirmed absent |
| `freshdesk` SPF | TXT | Unconfirmed — the TXT list may continue past the captured view |

Confirmed absences are safe to state because the CNAME block is bounded top and bottom by
the `A` and `MX` blocks, and all eight of its entries were visible. Four of the seven
`._domainkey` keys are present; the four `9tp4z*` are not. The staged set — `rvec3`,
`q2zty`, `1s3`, `fwdkim1` — looks like one coherent Freshworks property copied in full,
with a second property's block overlooked.

This is precisely the failure the section above describes. Cutting over as staged would
publish a zone that looks complete, raises no error, and quietly degrades the mail
Freshdesk sends on the firm's behalf.

### If the move to Vodien is completed

The 2026-08-11 decision was to stay on Wix. The staged zone contradicts it, so settle the
decision before acting on either. The argument that has changed since: Wix no longer hosts
anything, and a zone living inside a subscription nobody is using is a domain outage
waiting on whoever cancels it.

If it proceeds:

1. **Close the gaps first, in Vodien, while the zone is still inert** — that is the whole
   advantage of the current state.
2. **Read the missing values from Wix, not from this file.** The table above is an
   inventory, not a backup; several values are deliberately elided.
3. **Compare `google._domainkey` byte-for-byte against Wix.** Parsing as a valid 2048-bit
   key proves it is not truncated. It does not prove it is the *same* key — a different
   valid key passes that check and fails every signature.
4. **Drop the TTL before cutting over.** The staged records sit at `14400`; Wix is at
   `3600`. Both make rollback slow. Set 300 on both sides, wait out the old TTL, cut over,
   then raise it again.
5. Verify against live DNS afterwards, not the panel: five MX, exactly one SPF record,
   DMARC, DKIM, and `www` / apex / `support` / `rainmaker` / `docs`.
6. Finish with a real test message and confirm `dkim=pass`, `spf=pass`, `dmarc=pass`, as
   below. DNS proves a key is published; only a delivered message proves it is used.

---

## Verified after cutover

Against live DNS and the live site, not the control panel:

- **Mail: all 5 Google MX records intact**, before and after
- 23 of 23 preserved paths → `200`
- `/home-1` → `/`, `/file-access` → `/forms`, `/file` → `/forms` — all `301`
- dropped paths (`/quotation-questionaire`, store pages, blog categories) → `404`
- `support.asktic.com` and `rainmaker.asktic.com` still answering
- TLS valid on both hostnames; certificates issued roughly ten minutes after DNS pointed
  at Render, during which HTTPS on the custom domain failed

## Rollback

`www` CNAME → `cdn1.wixdns.net`; apex A → `185.230.63.171`, `185.230.63.107`,
`185.230.63.186`. TTL is 1 hour, so a rollback is not instant — worth lowering TTL
before any future change of this kind.

---

## Email authentication — fixed 2026-08-16

Prompted by a real symptom: mail to clients was intermittently landing in spam.

It was not caused by the cutover. The domain had **no SPF, no DMARC, and no Google DKIM**
— and had not had them for years. The two mail paths were authenticated very differently,
which is exactly why the symptom was intermittent rather than constant:

| Sender | SPF | DKIM | Was |
| --- | --- | --- | --- |
| Staff mail via Google Workspace | none | **none** | completely unauthenticated |
| Freshdesk ticket replies | none | signed | partially authenticated |

The important mail — quotes and advice sent from Gmail — was the unauthenticated half.
Gmail and Outlook both tightened enforcement on unauthenticated business mail over the
preceding two years.

### What is now published

```
asktic.com                    TXT   v=spf1 include:_spf.google.com include:email.freshdesk.com ~all
_dmarc.asktic.com             TXT   v=DMARC1; p=none; rua=mailto:dmarc@asktic.com
google._domainkey.asktic.com  TXT   v=DKIM1; k=rsa; p=…   (2048-bit)
```

All three verified live against two independent resolvers:

- **SPF** — exactly one record (two would be a permerror), every nested include resolves,
  and **8 of the permitted 10 DNS lookups** consumed. Counted by walking the chain, not
  estimated.
- **DMARC** — `p=none`, so it enforces nothing and only collects reports. Deliberate:
  the sender list was an assumption, and tightening before the reports confirm it is how
  legitimate mail starts getting rejected.
- **DKIM** — the published key parses as a real RSA public key, modulus **2048 bits**,
  exponent 65537. Checked because a 2048-bit key exceeds the 255-character limit for a
  single TXT string, and a panel that truncates it produces a record that looks saved and
  fails every check. Wix assembled it correctly.

### Confirmed working on a real message, 2026-08-16

DNS proves a key is published; only a delivered message proves it is being used. A test
from `steven@asktic.com` to an external Gmail account returned:

```
dkim=pass    header.i=@asktic.com   header.s=google
spf=pass     smtp.mailfrom=steven@asktic.com
dmarc=pass   header.from=asktic.com
```

with `DKIM-Signature: d=asktic.com; s=google` — Gmail signing with the published key
rather than a Google-owned fallback domain.

**SPF and DKIM align independently**, which matters more than the three passes suggest:
SPF breaks when a message is forwarded and DKIM survives it. Client mail forwarded inside
a corporate system previously had nothing to validate against; now the signature travels
with the message. That was likely a real part of the intermittent spam filing.

### Two things that are easy to get wrong here

**Publishing the DKIM record does not enable signing.** Google Workspace requires
*Start authentication* in the admin console afterwards — done 2026-08-16 and confirmed
above. The key otherwise sits in DNS unused.

**Only 2 SPF lookups of headroom remain.** `_spf.google.com` costs 1;
`email.freshdesk.com` costs 7, because it nests `sendgrid.net`, `ab.sendgrid.net` and
four regional Freshdesk ranges. Any future "just add our SPF include" request must be
costed first — the Freshworks chain alone would need 7 and take the record over the
limit. Exceeding 10 does not degrade gracefully; SPF fails permanently for every message.

### What to expect

DMARC aggregate reports arrive daily at `dmarc@asktic.com`. They are the diagnostic that
turns "sometimes goes to spam" into a named list of which sending system fails which
check. Read a few weeks of them before considering `p=quarantine` or `-all`.

Deliverability will improve gradually rather than immediately. Filters weight domain
history, and this domain sent unauthenticated mail for years. Authentication is also not
the only input — message content, attachments and recipient-side rules still apply.

## `rainmaker` is not misrouted — the service is misnamed

**Do not "fix" this record.** `rainmaker.asktic.com` points at `tic-crm-dev.onrender.com`,
which reads like a production hostname aimed at a dev service. It is not. Checked
2026-08-16, against the full Render account rather than the first page of results:

| Service | Type | Repo |
| --- | --- | --- |
| `tic-web` | static site | TIC_web |
| `tic-crm-scheduler` | cron job | TIC_CRM_WebAPP |
| `tic-crm-dev` | web service | TIC_CRM_WebAPP |

That is every service in the account — the next page is empty. **There is no
`tic-crm-prod`.** `tic-crm-dev` is the only CRM web service that exists, so the DNS record
points at the only thing it could point at, and repointing it would take the CRM offline.

It is also clearly the production instance rather than a leftover: the custom domain was
attached deliberately on 2026-03-18, `autoDeploy` is off so releases are manual, and the
scheduler cron runs against the same repo every minute.

So the problem is real but it is not a DNS problem. Production runs on a service named
`dev`, because a production one was never created. Fixing that properly means standing up
a real production service with its own database and environment, deploying, verifying,
and only then moving the custom domain — a CRM migration, and work for the
`TIC_CRM_WebAPP` project, which is explicitly out of scope for this repo.

The live hazard worth naming: if someone later creates a genuine development service
against that name or that database, development traffic lands on production. The current
naming makes that easy to do by accident.

## Outstanding

### The delegation has no redundancy

`asktic.com` is registered as the second nameserver and answers no DNS, so the zone rests
on `ns5.wixdns.net` alone. Restore the real pair and delete the stray host record — see
[the Vodien panel section](#the-vodien-panel--read-before-touching-it). This is worth doing
regardless of where the zone eventually lives.

### The Wix-or-Vodien decision is unsettled

A complete-looking zone is staged at Vodien against a written decision to stay on Wix.
Whichever way it goes, one of the two should be made deliberately and recorded here.

### The apex does not redirect to www

Both hostnames serve the site. Canonical tags in `app/layout.tsx` point at `www` and make
this harmless for search, but a 301 would be better. See the note in `render.yaml` for
why it is not a route and what fixing it costs.
