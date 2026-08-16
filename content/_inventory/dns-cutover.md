# DNS cutover — record

The site moved from Wix hosting to Render on **2026-08-12**. This is what changed, what
it looks like now, and what was verified. Written down because the next person to touch
this zone should not have to rediscover any of it.

**DNS hosting stayed on Wix.** The domain registration moved to Vodien; the nameservers
did not, and the plan to move them was dropped. `ns4/ns5.wixdns.net` remain authoritative
and are not editable, so the zone is managed in Wix's DNS panel.

⚠ **Superseded as of 2026-08-16** — a full copy of this zone is now staged in Vodien's DNS
panel and the move is going ahead. It is staged only; the delegation still points at Wix
and nothing at Vodien is being served yet. Read
[the Vodien panel section](#the-vodien-panel--read-before-touching-it) before touching
either provider.

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
| `freshdesk` | SPF (type 99) | `v=spf1 include:email.freshdesk.com ~all` | legacy RR type, read by nothing |
| `fwtrack` | CNAME | `798c895246….fmsendcrmclick.net` | Freshmarketer click tracking |
| `fwdkim1` | CNAME | `spfmx1.domainkey.freshemail.io` | **Freshdesk email auth — do not remove** |
| `1s3`, `q2zty`, `rvec3` `._domainkey` | CNAME | `wl601960s3/s2/s1.domainkey.freshemail.io` | **Freshdesk DKIM — do not remove** |
| `fwdkim` | CNAME | `spfmx7.domainkey.myfreshworks.com` | Freshworks suite, dropped |
| `9tp4z`, `9tp4z2`, `9tp4z3`, `9tp4z4` `._domainkey` | CNAME | `wl689718s1–s4.domainkey.myfreshworks.com` | Freshworks suite, dropped |

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

The Freshworks records look like clutter and are not. Four of them — `rvec3`, `q2zty` and
`1s3` `._domainkey`, plus `fwdkim1` — authenticate mail that **Freshdesk sends on the
firm's behalf**, every ticket reply. Deleting them does not produce an error; it quietly
pushes replies toward spam folders, and the cause is not obvious weeks later.

**The selector names carry no signal. Only the target does.** Resolved 2026-08-16:
`freshemail.io` targets are Freshdesk, `myfreshworks.com` targets are the wider Freshworks
suite, and the two sit interleaved under near-identical-looking names. The tell inside the
`fwdkim1` chain is `fdspfus.freshemail.io` — `fd` is Freshdesk. Always resolve the CNAME
before deciding a Freshworks record is disposable; the full split is tabulated
[below](#a-parallel-zone-is-staged-at-vodien-and-it-is-deliberate).

---

## The Vodien panel — read before touching it

Because registration sits at Vodien, its control panel offers both a **Name Servers** tab
and a **DNS Settings** tab for `asktic.com`. Neither does what it appears to. Recorded
2026-08-16 from the panel itself, after an attempted nameserver change failed with
`Save changes request error`.

### The Name Servers tab misreports the delegation

What the tab displays:

| Row | Value | Assessment |
| --- | --- | --- |
| Name Server 1 | `ns5.wixdns.net` @ `216.239.38.101` | Correct host. The IP is superfluous |
| Name Server 2 | `asktic.com` @ `216.24.57.1` | **Wrong.** `216.24.57.1` is Render's web load balancer, copied from the apex A record. It does not answer DNS |
| Host Records | `asktic.com` → `216.24.57.1` | The host object feeding Name Server 2 |

**The real delegation is intact.** Checked 2026-08-16 against `1.1.1.1`, `8.8.8.8` and
`9.9.9.9`, all three agreeing:

```
asktic.com.  NS  ns4.wixdns.net.
asktic.com.  NS  ns5.wixdns.net.
```

Both Wix nameservers are published and the zone has full redundancy. The failed save never
committed, so the panel is displaying an edit that the registry rejected — the tab is not a
reliable view of what is delegated. **Verify delegation against a resolver, never against
this tab.** Clear Name Server 2 and its host record anyway, so the display stops
contradicting reality.

A nameserver form and an A record are different layers. *Which server hosts the site* is a
host record, set in the DNS zone. *Who answers DNS for this domain* is the delegation, set
here. Pasting the first into the second is the error to watch for.

**The panel requires an IP for every nameserver row, and expects the true resolved address
of that host.** The `216.239.38.101` against `ns5.wixdns.net` is correct — that really is
its address. So the IP column is not the fault here; the only bad row is Name Server 2,
and `asktic.com` is rejected because a domain cannot be its own nameserver without proper
glue. Correct addresses, resolved 2026-08-16:

| Nameserver | IPv4 |
| --- | --- |
| `ns4.wixdns.net` | `216.239.36.101` |
| `ns5.wixdns.net` | `216.239.38.101` |
| `ns1.vodien.com` | `162.159.24.10` |
| `ns2.vodien.com` | `162.159.25.66` |

`ns3`/`ns4.vodien.com` are aliases — they share the addresses of `ns1`/`ns2`. Pick one from
each pair, or two names resolve to a single server and the delegation has no redundancy.

These are anycast addresses and the registry resolves out-of-bailiwick nameservers itself
rather than publishing a supplied IP, so a stale entry here is low-risk. Re-check it anyway
if resolution ever behaves oddly after a provider renumbering.

**Do not re-enter the pair from this document.** Wix assigns nameservers per account. Read
the values off a resolver or Wix's own domain panel.

### A parallel zone is staged at Vodien, and it is deliberate

Vodien's DNS Settings tab holds 18 records, marked `Active`. **`Active` means "saved in
Vodien's system", not "live on the internet".** The delegation points at Wix, so none of it
is served, and there is no warning to that effect.

Checked record-by-record against live DNS on 2026-08-16, the staged zone is **correct and
complete** for a Freshdesk-only posture: the apex `A`, the `www`, `rainmaker`, `support` and
`docs` CNAMEs, all five Google MX, the apex SPF, `_dmarc`, `fdkey.support`,
`google._domainkey`, and four Freshworks CNAMEs.

It omits six records that are live at Wix. That is not an oversight — it matches the
decision to drop the wider Freshworks suite and keep only Freshdesk. **The two are
distinguishable by target, and only by target:**

| Record | Live target | Account | Product | Staged? |
| --- | --- | --- | --- | --- |
| `rvec3._domainkey` | `wl601960s1.domainkey.freshemail.io` | `wl601960` | Freshdesk | ✅ kept |
| `q2zty._domainkey` | `wl601960s2.domainkey.freshemail.io` | `wl601960` | Freshdesk | ✅ kept |
| `1s3._domainkey` | `wl601960s3.domainkey.freshemail.io` | `wl601960` | Freshdesk | ✅ kept |
| `fwdkim1` | `spfmx1.domainkey.freshemail.io` | — | Freshdesk | ✅ kept |
| `9tp4z._domainkey` | `wl689718s1.domainkey.myfreshworks.com` | `wl689718` | Freshworks suite | ❌ dropped |
| `9tp4z2._domainkey` | `wl689718s2.domainkey.myfreshworks.com` | `wl689718` | Freshworks suite | ❌ dropped |
| `9tp4z3._domainkey` | `wl689718s3.domainkey.myfreshworks.com` | `wl689718` | Freshworks suite | ❌ dropped |
| `9tp4z4._domainkey` | `wl689718s4.domainkey.myfreshworks.com` | `wl689718` | Freshworks suite | ❌ dropped |
| `fwdkim` | `spfmx7.domainkey.myfreshworks.com` | — | Freshworks suite | ❌ dropped |
| `fwtrack` | `798c895246…fmsendcrmclick.net` | — | Freshmarketer | ❌ dropped |
| `fslink` | NXDOMAIN | — | Freshsales | already removed |

**`freshemail.io` is Freshdesk; `myfreshworks.com` is everything else.** Two whitelabel
accounts, `wl601960` and `wl689718`, split cleanly along that line. The selector names
(`9tp4z`, `rvec3`) carry no signal at all — the target is the only way to tell which product
a key serves, which is why the earlier warning in this file says to check the chain.

`freshdesk.asktic.com` also holds a legacy **type-99 SPF** record, not a TXT. Type 99 was
deprecated by RFC 7208 in 2014 and is read by nothing. It does not need migrating.

### Completing the move

The 2026-08-11 decision was to stay on Wix; the staged zone supersedes it. The argument
that changed: Wix no longer hosts anything, and a zone living inside a subscription nobody
is using is a domain outage waiting on whoever cancels it.

The zone content needs no further additions. What remains:

1. **Verify `google._domainkey` by copy-paste, not by eye.** This is the one record that
   cannot be checked visually. The live key differs from a careful screen reading of the
   staged one at exactly one character — position 85, `l` versus `I` — which most sans-serif
   panel fonts render identically. Parsing as a valid 2048-bit key proves only that it is
   not truncated; a different valid key passes that test and fails every signature. Paste
   both into a diff. The live value is:

   ```
   v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAjX2MmjFzF8Z5VEponBQY8+boQ3/2IDcKwaGK+POlClIEY0SR3gV23/L99ip2lSdJGCJ3Fyhd69PA5XZbBqnbQauy4W+UPZ/Kb0xoEaiP7fVg1efkkLfWDk8DQSLJEy091cvGPTj2va0sGLAa+quor3PVIT48o/xlUATFvUaArcmmrV0AQAQ3ahDT+k/OUgzNp8UZ8bRqzqVdL9HCxbI06EWy75wto2DIJxym/IgdcQ6j4L9xvd2gMqoIbKcJ7esWoyw8LTboJQmhgm+gQbq7jS0IibU9BG3K2H171rrbpsmsWD2aYYlMIobzr4WIsfAvzcWsMq80nbN1VWf+fj8QOQIDAQAB
   ```

2. **Drop the TTL before cutting over.** The staged records sit at `14400`; Wix is at
   `3600`. Both make rollback slow. Set 300 on both sides, wait out the old TTL, cut over,
   then raise it again.
3. **Change the nameservers last**, and only once the above is done. Clear the bogus Name
   Server 2 and its host record in the same pass.
4. Verify against live DNS afterwards, not the panel: five MX, exactly one SPF record,
   DMARC, DKIM, and `www` / apex / `support` / `rainmaker` / `docs`.
5. Finish with a real test message and confirm `dkim=pass`, `spf=pass`, `dmarc=pass`, as
   below. DNS proves a key is published; only a delivered message proves it is used.
6. Do not cancel the Wix subscription until step 5 passes — it is the rollback.

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

### The Vodien cutover is staged but not executed

The zone content is complete and verified; the nameservers have not moved. See
[Completing the move](#completing-the-move) for what remains — chiefly a copy-paste
verification of the DKIM key and a TTL reduction before the switch.

### The apex does not redirect to www

Both hostnames serve the site. Canonical tags in `app/layout.tsx` point at `www` and make
this harmless for search, but a 301 would be better. See the note in `render.yaml` for
why it is not a route and what fixing it costs.
