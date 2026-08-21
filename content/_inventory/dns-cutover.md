# DNS cutover — record

The site moved from Wix hosting to Render on **2026-08-12**. This is what changed, what
it looks like now, and what was verified. Written down because the next person to touch
this zone should not have to rediscover any of it.

**DNS hosting moved to Vodien on 2026-08-16.** For the four days before that, registration
sat at Vodien while `ns4/ns5.wixdns.net` stayed authoritative — the arrangement the rest of
this document was written under. The zone is now served by Vodien and edited in Vodien's DNS
panel. Wix hosts nothing and serves nothing.

Everything below describing Wix as authoritative is history, kept because the removals and
the email-authentication work still explain why the zone looks the way it does. The
[Vodien section](#the-vodien-panel--read-before-touching-it) has the current state and the
post-cutover verification.

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
[below](#the-zone-at-vodien-and-what-it-deliberately-drops).

---

## The Vodien panel — read before touching it

Registration and DNS both sit at Vodien now. Its control panel has a **Name Servers** tab
holding the delegation and a **DNS Settings** tab holding the zone.

**Check this panel against a resolver before believing it.** It has now misreported the
zone three separate times, in three different ways: the Name Servers tab displayed a
rejected edit as though it were the delegation; the green `Active` badges meant "saved at
Vodien" while the records were serving nowhere; and the TTL column reads `300` against
records the nameservers publish at `3600`. None of these announce themselves. Every check in
this document was run against `1.1.1.1`, `8.8.8.8` and `9.9.9.9` for that reason.

### The move, and the one row that blocked it

The first attempt failed with `Save changes request error`, from this state:

| Row | Value | Assessment |
| --- | --- | --- |
| Name Server 1 | `ns5.wixdns.net` @ `216.239.38.101` | Correct — that really is its address |
| Name Server 2 | `asktic.com` @ `216.24.57.1` | **The fault.** A domain cannot be its own nameserver without proper glue, and `216.24.57.1` is Render's web load balancer, copied from the apex A record. It answers no DNS |

The IP column was never the problem — the panel requires it and expects the host's true
resolved address. Only the second row was wrong, and the registry rejecting it is the only
reason a broken delegation never went live.

A nameserver form and an A record are different layers. *Which server hosts the site* is a
host record, set in the DNS zone. *Who answers DNS for this domain* is the delegation, set
here. Pasting the first into the second is the error to watch for.

**Do not verify a delegation from this tab.** For the whole period it displayed the rejected
edit, three independent resolvers agreed the registry still published `ns4/ns5.wixdns.net`.
Check a resolver, not the panel.

The tab requires an IP for every nameserver row and expects the host's true resolved
address. What is delegated now:

| Nameserver | IPv4 | IPv6 |
| --- | --- | --- |
| `ns1.vodien.com` | `162.159.24.10` | `2400:cb00:2049:1::a29f:180a` |
| `ns2.vodien.com` | `162.159.25.66` | `2400:cb00:2049:1::a29f:1942` |

`ns3`/`ns4.vodien.com` are aliases sharing the addresses of `ns1`/`ns2`. Pick one from each
pair — `ns1` + `ns3` would put both delegation entries on a single server and leave no
redundancy. Vodien's own zone publishes a third NS (`ns3.vodien.com`) in the `NS` RRset,
which is normal and adds nothing to worry about.

For reference, the Wix pair that was replaced: `ns4.wixdns.net` @ `216.239.36.101`,
`ns5.wixdns.net` @ `216.239.38.101`.

### The zone at Vodien, and what it deliberately drops

Vodien's DNS Settings tab holds 18 records. Before the cutover they were marked `Active`
while serving nothing — **`Active` means "saved in Vodien's system", not "live on the
internet"**, and there was no warning to that effect. They are now genuinely live.

The zone is **correct and complete** for a Freshdesk-only posture: the apex `A`, the `www`,
`rainmaker`, `support` and `docs` CNAMEs, all five Google MX, the apex SPF, `_dmarc`,
`fdkey.support`, `google._domainkey`, and four Freshworks CNAMEs.

It drops six records that were live at Wix. That is not an oversight — it matches the
decision to drop the wider Freshworks suite and keep only Freshdesk. **The two are
distinguishable by target, and only by target:**

| Record | Target | Account | Product | Carried over? |
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
| `fslink` | NXDOMAIN | — | Freshsales | removed earlier |

All seven dropped names now return no CNAME, confirmed post-cutover.

**`freshemail.io` is Freshdesk; `myfreshworks.com` is everything else.** Two whitelabel
accounts, `wl601960` and `wl689718`, split cleanly along that line. The selector names
(`9tp4z`, `rvec3`) carry no signal at all — the target is the only way to tell which product
a key serves, which is why the earlier warning in this file says to check the chain.

`freshdesk.asktic.com` also holds a legacy **type-99 SPF** record, not a TXT. Type 99 was
deprecated by RFC 7208 in 2014 and is read by nothing. It does not need migrating.

### Verified after the nameserver move, 2026-08-16

Against live DNS through `1.1.1.1`, `8.8.8.8` and `9.9.9.9`, and against the live sites —
not the control panel:

| Check | Result |
| --- | --- |
| Delegation | `ns1` / `ns2` / `ns3.vodien.com`, all three resolvers agreeing |
| SOA | `ns1.vodien.com` — Vodien authoritative |
| Google Workspace MX | **all five present**, priorities 10–50 intact |
| SPF | exactly one record; two would be a permerror |
| DMARC | `p=none` with `rua` intact |
| `google._domainkey` | **byte-for-byte identical** to the value published at Wix — 410 chars, compared programmatically |
| Freshdesk DKIM | all four `freshemail.io` CNAMEs resolving |
| Dropped Freshworks records | all seven returning nothing, as intended |
| `www` / apex / `support` / `rainmaker` / `docs` | `200` / `200` / `302` / `302` / `302`, TLS valid on all five |

The DKIM check was the one that mattered. A 2048-bit key exceeds the 255-character limit
for a single TXT string, so a panel that reassembles it wrongly produces a record that looks
saved and fails every signature — and it cannot be verified by eye, because a careful screen
reading of the staged value differed from live at exactly one character, position 85, `l`
against `I`, which the panel font renders identically. Compared by paste it matches exactly:

```
v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAjX2MmjFzF8Z5VEponBQY8+boQ3/2IDcKwaGK+POlClIEY0SR3gV23/L99ip2lSdJGCJ3Fyhd69PA5XZbBqnbQauy4W+UPZ/Kb0xoEaiP7fVg1efkkLfWDk8DQSLJEy091cvGPTj2va0sGLAa+quor3PVIT48o/xlUATFvUaArcmmrV0AQAQ3ahDT+k/OUgzNp8UZ8bRqzqVdL9HCxbI06EWy75wto2DIJxym/IgdcQ6j4L9xvd2gMqoIbKcJ7esWoyw8LTboJQmhgm+gQbq7jS0IibU9BG3K2H171rrbpsmsWD2aYYlMIobzr4WIsfAvzcWsMq80nbN1VWf+fj8QOQIDAQAB
```

### Mail confirmed on a real message, after the move

A second test from `steven@asktic.com` to an external Gmail account, sent once Vodien was
authoritative, returned:

```
dkim=pass    header.i=@asktic.com   header.s=google   header.b="XW4/Xuep"
spf=pass     smtp.mailfrom=steven@asktic.com   (209.85.220.41)
dmarc=pass   header.from=asktic.com   (p=NONE)
```

with `DKIM-Signature: d=asktic.com; s=google`.

This is stronger than the DNS comparison above. Gmail fetched the key **from Vodien's
nameservers** and the signature verified against it, so the migrated record is not merely
published but in use. The `spf=pass` likewise proves the `include:_spf.google.com` chain
still resolves through the new zone rather than just looking right in the panel.

Not to be confused with the earlier
[confirmation on a real message](#confirmed-working-on-a-real-message-2026-08-16) — same
date, but that one predates the nameserver move and was validated against Wix.

### The Freshdesk path passes — but not the way this file assumed

A Freshdesk-originated message from `hello@asktic.com` (ticket 49294, `X-FD-Type:
forward_thread_message`) also returned `dkim=pass`, `spf=pass`, `dmarc=pass`. Both mail
paths are therefore authenticated after the move.

The route is the surprise:

```
Received: from mail-us1.freshemail.io (34.198.193.174) by smtp.gmail.com with ESMTPSA
DKIM-Signature: d=asktic.com; s=google
```

**Freshdesk relayed the message through Google Workspace by authenticated submission, and
it was signed with the `google` selector — not a `freshemail.io` one.** On this path the
four Freshdesk `_domainkey` CNAMEs are never consulted, and neither is
`include:email.freshdesk.com`, which costs 6 of the record's 7 SPF lookups.

That raises a real question — whether the Freshdesk include and its DKIM CNAMEs are load
bearing at all — but **one forwarded message is not enough to answer it.** Freshdesk may
route replies, notifications and forwards differently, and dropping the include while some
message type still sends direct would break SPF for exactly the mail nobody tests. Leave
the zone alone until the DMARC reports settle it.

### What the DMARC reports show

Two Google aggregate reports decoded and parsed, covering the windows `1786752000`
(pre-cutover) and `1787097600` (post-cutover), 46 messages in total:

| Window | Source IP | Messages | SPF | DKIM | Selector |
| --- | --- | --- | --- | --- | --- |
| 2026-08-13/14 | `209.85.220.41` | 4 | pass | pass | `google` |
| 2026-08-18/19 | `209.85.220.41` | 42 | pass | pass | `google` |

**One source IP, and it is Google's outbound relay.** No record from any other address, in
either window, before or after the nameserver move. Combined with the Freshdesk test message
— which reached `smtp.gmail.com` by authenticated submission and was signed `s=google` —
every observation says Freshdesk relays through Google Workspace and never sends direct.

**Coverage limit, stated plainly.** Both reports are Google's vantage point: they describe
mail Google *received*. If Freshdesk ever sent direct to a Microsoft or Yahoo recipient,
these reports could not show it. The Microsoft and Yahoo reports would close that gap and
have not been parsed — Gmail's connector exposes no attachment download, and lifting 9 KB of
base64 out of raw MIME by hand is not reliable (an attempt corrupted, caught by the zip CRC).
The report above was retrieved instead through the signed Freshdesk attachment URL on ticket
49294, which is exact. Forwarding a Microsoft and a Yahoo report into Freshdesk would make
them retrievable the same way, at the cost of two tickets.

### Decided 2026-08-21: keep `include:email.freshdesk.com`

The evidence suggests it authorises nothing. Remove it anyway and the downside is
asymmetric: if any Freshdesk message type falls back to direct sending, SPF fails
permanently for that mail — and it would be exactly the mail nobody tests. Against that,
the gain is theoretical. At 7 of 10 lookups the record is **not near failure**; the include
costs budget, not correctness. DKIM is doing the real work regardless, and it passes.

Revisit only if a new sender has to be added and the chain would otherwise exceed 10. At
that point re-run the reports first — and get the Microsoft and Yahoo vantage points before
acting, since Google's reports alone cannot rule out direct sending to other providers.

### Still open after the move

1. ~~Read a week of DMARC reports to settle the SPF include.~~ Closed 2026-08-21. Every
   observed source is Google's relay; the include stays. The Microsoft and Yahoo vantage
   points were deliberately not pursued — they would only matter if the include were being
   removed, and it is not.
2. **Do not cancel the Wix subscription yet.** It is the rollback, and the only remaining
   copy of the records that were dropped. Nothing now depends on keeping it beyond ordinary
   caution, so retire it whenever the zone has felt stable long enough.
3. ~~Raise the TTL from `300`.~~ Nothing to do — **the zone already serves `3600`.** The
   panel's `300` is not what the nameservers publish; measured post-cutover, every record
   answers with `3600` and the `NS` RRset with `21600`. A resolver cannot report a TTL
   higher than the authoritative value, so this is conclusive rather than a caching
   artefact. `3600` is the value worth having and matches what the zone ran at under Wix.
4. ~~Route `dmarc@` out of the support queue.~~ Settled 2026-08-16: Gmail filter in place,
   anything that leaks gets marked spam in Freshdesk. Reports remain readable under the
   `DMARC` label.

Done: test messages on both sending paths, and removal of the `asktic.com` →
`216.24.57.1` Host Record.

### DMARC reports are landing in the support queue

Diagnosed on Freshdesk ticket 49294, 2026-08-16:

```
to_emails      ["dmarc@asktic.com"]
support_email  askticcomhello@asktic.freshdesk.com     <- the hello@ mailbox
requester      noreply-dmarc-support@google.com
source 1 (email)   status 2 (open)   fr_due_by 2026-08-17T10:00:00Z
tags           ["No New Tix Notification"]
```

`dmarc@asktic.com` delivers into the Gmail mailbox Freshdesk polls for `hello@`, so each
report opens a ticket. Someone has already tagged them to suppress the new-ticket alert,
which hides the noise without stopping it — the tickets still open, still sit unassigned,
and **still carry a first-response SLA clock**, so they accumulate as breaches and distort
response-time reporting. Every reporting provider sends daily.

**Do not solve this by deleting them.** The reports are the evidence needed to settle
whether `include:email.freshdesk.com` authorises anything (above). They need to land
somewhere readable, not nowhere.

**Applied 2026-08-16:** a Gmail filter on the polled mailbox matching `dmarc@asktic.com`,
set to skip the inbox and apply a `DMARC` label. Freshdesk ingests from the inbox, so this
takes the reports out of its reach while leaving them readable and searchable in Gmail. It
is one click to undo, which the alternatives below are not.

**Settled 2026-08-16: the filter stays as written, and anything that leaks through is
marked as spam in Freshdesk.** That is enough — spam-marking clears the ticket and its SLA
clock, and it does not touch Gmail, so the reports stay readable under the `DMARC` label
either way. The rest of this section is reference, not work outstanding.

**Confirmed working.** Every aggregate report received since the filter went on carries the
`DMARC` label and no `INBOX` label; the last report to reach the inbox is the one from
2026-08-15 that opened ticket 49294. Freshdesk therefore reads the inbox only, and the
spam-marking fallback has not been needed.

**The volume is routine.** Four reports a day is what this domain should expect, and it is
a sign of reach rather than of trouble — aggregate reports are daily telemetry from every
provider that receives mail claiming to be from the domain, sent whether or not anything is
wrong. Observed over 2026-08-16 to 2026-08-20:

| Reporter | Submitters | Per day |
| --- | --- | --- |
| Google | `google.com` | 1 |
| Microsoft | `protection.outlook.com` and `enterprise.protection.outlook.com` | 2 |
| Yahoo | `yahoo.com`, occasionally `yahoo.fr` | 1 |

Microsoft counting twice is normal — the consumer and enterprise filtering estates report
separately. The count will drift as the recipient mix changes; a new provider appearing is
not a signal of anything.

**If it ever needs widening, note that Gmail ANDs the filter fields.** `to:` matches the
header only, so a reporter addressing `dmarc@` by envelope or Bcc slips past. But adding a
second condition in *Has the words* while *To* is still populated ANDs the two and matches
strictly fewer messages — the opposite of the intent. Put the whole condition in *Has the
words* as an explicit OR and leave every other field empty:

```
{to:dmarc@asktic.com deliveredto:dmarc@asktic.com cc:dmarc@asktic.com subject:"Report Domain: asktic.com"}
```

Gmail's `{ }` is OR. The subject clause is the durable one — RFC 7489 §7.2.1.1 fixes that
format for every reporter, so it catches Microsoft and Yahoo as well as Google, and it does
not depend on how an alias rewrites `Delivered-To`. Paste the string into the Gmail search
box first to see exactly what it matches, then use *Create filter from this search*.

This is a containment, not a structure. The options below remain the tidy fix if the
reports ever want a home of their own:

1. **Preferred — stop `dmarc@` reaching the polled mailbox**, by moving it to a standalone
   Group. Leaves DNS untouched, so nothing already cached by reporters changes. Three
   things about this are easy to get wrong:

   - **Build the group under a temporary address first**, verify it, and only then move
     `dmarc@` onto it as a group alias. The obvious order — free the address, then create
     the group — opens a window where mail to `dmarc@` bounces, and Google can hold a
     released address for up to 24 hours before it can be reused. That turns a two-minute
     change into a lost day of reports.
   - **External posting must stay open.** Reporters are external senders; a group
     restricted to the organisation rejects them and the data is lost with no signal.
   - **Conversation history must be on.** A group with history off and no member subscribed
     to email accepts the reports and stores nothing.
2. **Stopgap, two minutes, Freshdesk-side.** A dispatch rule matching requester
   `noreply-dmarc-support@google.com`, or subject starting `Report domain:`, set to close
   and skip SLA. Stops the queue and SLA damage immediately while option 1 is arranged. It
   does not stop ticket creation.
3. **Only if a dedicated analyser is wanted:** repoint `rua=` at it. Note that an external
   destination must publish `asktic.com._report._dmarc.<their-domain>` containing
   `v=DMARC1`, or it is not authorised to receive reports for this domain and they are
   dropped. Same-domain addresses need no such record, which is why option 1 is simpler.

---

## Verified after the hosting cutover (2026-08-12)

The move of the *site* from Wix to Render, four days before the DNS move above. Against
live DNS and the live site, not the control panel:

- **Mail: all 5 Google MX records intact**, before and after
- 23 of 23 preserved paths → `200`
- `/home-1` → `/`, `/file-access` → `/forms`, `/file` → `/forms` — all `301`
- dropped paths (`/quotation-questionaire`, store pages, blog categories) → `404`
- `support.asktic.com` and `rainmaker.asktic.com` still answering
- TLS valid on both hostnames; certificates issued roughly ten minutes after DNS pointed
  at Render, during which HTTPS on the custom domain failed

## Rollback

**From the DNS move (2026-08-16):** point the nameservers back at `ns4.wixdns.net`
@ `216.239.36.101` and `ns5.wixdns.net` @ `216.239.38.101`. The Wix zone still exists and
still holds the full record set, so this restores everything in one step — but only for as
long as the Wix subscription is alive. Once it is cancelled this rollback is gone, and the
zone at Vodien is the only copy.

**From the hosting move (2026-08-12):** `www` CNAME → `cdn1.wixdns.net`; apex A →
`185.230.63.171`, `185.230.63.107`, `185.230.63.186`. This one is academic now that the
Wix site is retired.

**A rollback takes about an hour, not five minutes.** The records were set to `300` in
Vodien's panel before the cutover, but the nameservers serve `3600` regardless — measured
2026-08-17 across every record in the zone. Wix was also at `3600`, so the cutover ran with
a one-hour cache window in both directions rather than the five minutes the panel implied.
It caused no harm, but do not plan the next change around a TTL this panel reports.

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
  and **7 of the permitted 10 DNS lookups** consumed. Counted by walking the chain, not
  estimated. (Recounted 2026-08-16 after the Vodien move; an earlier pass here recorded 8,
  which was one too many.)
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

**Only 3 SPF lookups of headroom remain.** Walked and counted 2026-08-16:

```
asktic.com                        7 / 10
├── include:_spf.google.com       1   (no nested includes)
└── include:email.freshdesk.com   6
    ├── include:sendgrid.net
    ├── include:fdspfus.freshemail.io
    ├── include:fdspfeuc.freshemail.io
    ├── include:fdspfind.freshemail.io
    └── include:fdspfaus.freshemail.io
```

Almost the whole budget is the Freshdesk include and its four regional ranges. Any future
"just add our SPF include" request must be costed against the chain first. Exceeding 10
does not degrade gracefully; SPF fails permanently for every message.

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

### Post-cutover follow-ups

The DNS move to Vodien is done, verified against three resolvers, and confirmed on delivered
messages over both sending paths. What remains is a question the move surfaced rather than
caused: Freshdesk relays through Google Workspace and signs with the `google` selector, so
`include:email.freshdesk.com` — 6 of the record's 7 SPF lookups — may authorise nothing. A
week of DMARC reports settles it. Also outstanding: holding the Wix rollback until then. The
TTL and `dmarc@` items are both closed. See
[Still open after the move](#still-open-after-the-move).

### The apex does not redirect to www

Both hostnames serve the site. Canonical tags in `app/layout.tsx` point at `www` and make
this harmless for search, but a 301 would be better. See the note in `render.yaml` for
why it is not a route and what fixing it costs.
