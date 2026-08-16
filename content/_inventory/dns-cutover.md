# DNS cutover — record

The site moved from Wix hosting to Render on **2026-08-12**. This is what changed, what
it looks like now, and what was verified. Written down because the next person to touch
this zone should not have to rediscover any of it.

**DNS hosting stayed on Wix.** The domain registration moved to Vodien; the nameservers
did not, and the plan to move them was dropped. `ns4/ns5.wixdns.net` remain authoritative
and are not editable, so the zone is managed in Wix's DNS panel.

---

## Final zone state

| Host | Type | Value | Note |
| --- | --- | --- | --- |
| `asktic.com` | A | `216.24.57.1` | Render's load-balancer IP |
| `www` | CNAME | `tic-web.onrender.com` | the site |
| `asktic.com` | MX | `aspmx.l.google.com` (10), `alt1` (20), `alt2` (30), `alt3` (40), `alt4` (50) | **Google Workspace — do not touch** |
| `support` | CNAME | `asktic.freshdesk.com` | help centre, still Freshdesk |
| `rainmaker` | CNAME | `tic-crm-dev.onrender.com` | CRM — points at the **dev** service |
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

## Outstanding

### 1. No SPF or DMARC on the apex

Pre-existing, unrelated to the cutover, and now the weakest thing about this zone. Mail
from `@asktic.com` is unauthenticated while three systems send as the domain: Google
Workspace, Freshdesk, and Freshworks.

**Proposed** — add both as TXT records on the apex:

```
asktic.com   TXT   v=spf1 include:_spf.google.com include:email.freshdesk.com ~all
_dmarc       TXT   v=DMARC1; p=none; rua=mailto:dmarc@asktic.com
```

Three things about that SPF record:

- **It costs 8 of SPF's 10 permitted DNS lookups.** `_spf.google.com` is 1 (all inline
  IPs); `email.freshdesk.com` is 7, because it nests `sendgrid.net`, `ab.sendgrid.net`
  and four regional Freshdesk ranges. Counted, not estimated. **Adding the Freshworks
  chain as well would exceed 10 and break SPF entirely** — a permanent error, not a
  degraded one.
- **`~all`, not `-all`.** Softfail while the sender list is unproven. Tighten later.
- **Confirm the sender list first.** This assumes Google Workspace and Freshdesk send as
  `@asktic.com` and nothing else does. If anything else does — a newsletter tool, an
  invoicing system — it must be included or its mail starts failing.

DMARC starts at `p=none`, which enforces nothing and only collects reports. Read them for
a few weeks before considering `quarantine`. **`dmarc@asktic.com` must exist** as a
mailbox or alias, or the reports bounce.

### 2. The apex does not redirect to www

Both hostnames serve the site. Canonical tags in `app/layout.tsx` point at `www` and make
this harmless for search, but a 301 would be better. See the note in `render.yaml` for
why it is not a route and what fixing it costs.
