# DNS cutover — record

The site moved from Wix hosting to Render on **2026-08-12**. This is what changed, what
it looks like now, and what was verified. Written down because the next person to touch
this zone should not have to rediscover any of it.

🔴 **The delegation is split across both providers, and must be repaired before the Wix
subscription is cancelled.** DNS moved to Vodien on 2026-08-16 and was verified there. As
of 2026-08-21 the registrar lists **four** nameservers — `ns1`/`ns2.vodien.com` *and*
`ns3`/`ns4.wixdns.net` — so Wix and Vodien are both authoritative, serving two different
zones, and each lookup lands on whichever answers first. See
[The delegation is split](#the-delegation-is-split-2026-08-21).

Nothing is broken today, because the two zones agree on every record that matters. The
danger is what happens next: an edit in either panel takes effect for only some lookups,
and cancelling Wix while its nameservers remain delegated would leave half the delegation
answering with failure. Statements below about Wix serving nothing, and about the
subscription being free to retire, are wrong until the delegation is repaired.

---

## Final zone state

> ⚠ **This table describes the *Wix* zone, which is one of two currently authoritative —
> see [The delegation is split](#the-delegation-is-split-2026-08-21). The Vodien zone is
> this list minus the six rows marked dropped. `freshdesk` (type-99 SPF) exists in neither
> and should come out once the split is repaired.**

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

## The delegation is split (2026-08-21)

**Nobody changed anything, and nothing reverted.** The registrar's Name Servers tab reads
**4/6**:

| Row | Host | Provider |
| --- | --- | --- |
| Name Server 1 | `ns1.vodien.com` | Vodien |
| Name Server 2 | `ns2.vodien.com` | Vodien |
| Name Server 3 | `ns3.wixdns.net` | **Wix** |
| Name Server 4 | `ns4.wixdns.net` | **Wix** |

Immediately after the cutover the same tab held exactly two rows, both Vodien. The two Wix
entries were added afterwards by something neither panel operator did — and note they are
`ns3`/`ns4`, not the `ns4`/`ns5` pair the domain used originally, so this is not a stored
value being restored. The likeliest source is the Wix account still holding the domain as
*connected* and re-asserting its nameservers through the registrar.

### What a split delegation does

Both providers are authoritative and hold **different zones**. A resolver picks whichever
nameserver answers fastest and uses that zone's reply, so answers are non-deterministic per
lookup. Asking twelve times across three resolvers:

```
9 replies  ns4.wixdns.net, ns5.wixdns.net          <- served by Wix
3 replies  ns1, ns2, ns3.vodien.com                <- served by Vodien
```

Each provider returns its own in-zone `NS` list, which is why the delegation appeared to
have "reverted" when sampled and why the earlier reading in this file was wrong. It never
reverted. Both have been live simultaneously.

### This is the whole explanation for the "re-added" records

The six Freshworks-suite records are the *only* place the two zones disagree — Wix has
them, Vodien does not. So they answer when a lookup lands on Wix and vanish when it lands
on Vodien, which is exactly the record-by-record inconsistency observed across resolvers.
Nobody re-added anything. `fslink` stayed absent throughout because neither zone has it.

### Why it is benign today and dangerous tomorrow

Checked across both zones on 2026-08-21 — every record that matters is **identical** either
way:

| Record | Both zones agree |
| --- | --- |
| 5 Google MX | ✅ |
| apex SPF | ✅ |
| `google._domainkey` | ✅ |
| `_dmarc` | ✅ |
| apex `A`, `www` | ✅ |

Mail, the site, the CRM and the help centre are therefore safe right now, by coincidence
rather than design. Two things make that a poor place to stay:

- **Any future edit applies to only some lookups.** Change a record in Vodien and roughly
  a quarter of queries keep the Wix answer; change it in Wix and the reverse. The symptom
  is a change that "didn't work", intermittently, with both panels showing it saved.
- **A divergent DKIM or SPF record would fail intermittently.** Rotate the Google DKIM key
  in one panel and a fraction of signature checks fail at random — the single hardest mail
  fault to diagnose, and precisely the failure this document was written to prevent.

**DNSSEC is not in play, which is what makes the repair safe.** Checked 2026-08-21: the
zone publishes no `DS` and no `DNSKEY`. Removing nameservers from a signed delegation can
break validation for every resolver that enforces it; here there is nothing to break, so
this is an ordinary delegation edit.

### Applied 2026-08-21, and how convergence behaves

The registrar now lists exactly `ns1`, `ns2`, `ns3.vodien.com` — matching Vodien's own
`NS` RRset. Sampling immediately afterwards still showed both providers, which is expected
and not a failed change:

| Signal | Reading |
| --- | --- |
| `NS` sampled 15× | 9 Wix, 6 Vodien |
| `fwtrack` (Wix-only) | absent 8, present 4 — was present 7, absent 2 an hour earlier |
| TTL tell | `www` at `300` (Vodien); apex `A`, `TXT`, DKIM at `3600` (Wix) |
| Mail | 5 MX, exactly 1 SPF, DKIM and DMARC present throughout |

**Convergence can outlast one TTL, and the reason is worth knowing.** A resolver holding a
cached delegation that still names a Wix server will sometimes ask that server, and Wix
answers with its *own* in-zone `NS` list — re-seeding the cache with `ns4/ns5.wixdns.net`
on a fresh 21600-second timer. The parent `.com` delegation is Vodien-only now, so this
cannot persist indefinitely; caches that expire and re-walk from the root pick up the
correct list. But it means the change does not land uniformly at one deadline, and a Wix
answer some hours later is not evidence the edit failed.

**Judge it by `fwtrack`, not by the `NS` RRset.** It exists only in the Wix zone, so it is
a direct read of which provider served a given lookup, without the self-refresh confusion.
Converged means `fwtrack` absent on every attempt and every TTL reading `300`. Allow a full
day before treating a persistent Wix answer as a fault worth raising with Vodien.

**And it is one more reason not to cancel Wix yet.** While some resolvers still hold Wix in
their cached delegation, deleting the Wix zone would have them querying a server that
answers with failure rather than data — intermittent, and harder to diagnose than the split
it replaced.

### The repair, in order

1. **Delete Name Server 3 and Name Server 4** at the registrar, leaving only the two Vodien
   rows. That makes Vodien unambiguously authoritative and drops the six Freshworks records
   as originally intended.
2. **Check the Wix account for the domain still being *connected*.** If Wix is what
   re-asserted those nameservers, deleting them at the registrar buys days, not a fix.
   Disconnect the domain there.
3. **Verify with a resolver over several days**, not with either panel. The delegation is
   correct only when repeated `NS` queries return the Vodien list every time, with no Wix
   replies mixed in.
4. **Vodien requires three nameservers. Make the third `ns3.vodien.com`, not
   `ns.vodien.com`.** After the Wix rows came out on 2026-08-21 the tab read 3/6, the third
   being a bare `ns.vodien.com` — which **does not resolve** on any of the three public
   resolvers, while `ns1`–`ns4.vodien.com` all do. An unresolvable nameserver is a dead
   delegation entry of the same class as the `asktic.com` row that blocked the original
   save.

   The choice is not a matter of taste. **Vodien's own zone publishes exactly
   `ns1`, `ns2`, `ns3.vodien.com`** as the `NS` RRset for `asktic.com`, so making the
   registry delegation match it is the correct configuration; a parent delegation that
   disagrees with the child's own `NS` list is a standard misconfiguration finding.

   | Row | Host Name | IP Address |
   | --- | --- | --- |
   | Name Server 1 | `ns1.vodien.com` | `162.159.24.10, 2400:cb00:2049:1::a29f:180a` |
   | Name Server 2 | `ns2.vodien.com` | `162.159.25.66, 2400:cb00:2049:1::a29f:1942` |
   | Name Server 3 | `ns3.vodien.com` | `162.159.24.10, 2400:cb00:2049:1::a29f:180a` |

   `ns3` sharing `ns1`'s addresses is Vodien's own design, not an error — three names over
   two anycast addresses. Real redundancy is two servers, which is sufficient; it was worth
   avoiding only back when the alternative pair would have collapsed to *one*.

5. **Leave the TTL at `300` for now.** `3600` is the right resting value and is what the
   zone ran at for years, but not yet. The delegation has just proved it can change without
   anyone touching it, and a `300` TTL means the next surprise propagates — and recovers —
   in five minutes rather than an hour. The cost is more queries against Cloudflare-backed
   anycast, which is nothing. Raise it once the delegation has held clean for a few weeks.
6. **Only then cancel Wix.** Doing it in the other order is the real hazard: cancelling the
   Wix zone while `ns3`/`ns4.wixdns.net` remain delegated leaves two of four nameservers
   answering with failure instead of data, which turns today's benign split into
   intermittent, hard-to-trace resolution errors across the site, the CRM and mail.

---

## The Vodien panel — read before touching it

Registration and DNS both sit at Vodien now. Its control panel has a **Name Servers** tab
holding the delegation and a **DNS Settings** tab holding the zone.

**Check this panel against a resolver before believing it.** It has misreported the zone
twice, in two different ways: the Name Servers tab displayed a rejected edit as though it
were the delegation, and the green `Active` badges meant "saved at Vodien" while the records
were serving nowhere. Neither announces itself.

A third apparent misreport was **not** the panel's fault and is recorded here so it is not
repeated as a grievance: the TTL column reads `300` while measurements showed `3600`. Vodien
really does serve `300`. The `3600` readings were Wix answering, during the period when
[the delegation was split](#the-delegation-is-split-2026-08-21). A mixed TTL across records
— `MX` at `300`, apex `TXT` at `3600` — is in fact a reliable *tell* that two providers are
answering, and a cheaper one to check than the `NS` RRset.

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

**Coverage gap now closed.** Both Google reports describe only mail Google *received*, so
they could not have shown Freshdesk sending direct to a recipient elsewhere. A Microsoft
report for the same window as the second Google one — `Enterprise Outlook`, 2026-08-19
00:00 to 2026-08-20 00:00 UTC — supplies the other vantage point. It is far richer: 25
records, 29 messages, where Google's showed one.

| Source | Reverse | Messages | SPF | DKIM | DMARC |
| --- | --- | --- | --- | --- | --- |
| `2607:f8b0:4864:20::*` (23 addresses) | `mail-*.google.com` | 25 | pass | pass | pass |
| `35.174.145.124` | `us.cloud-sec-av.com` | 2 | **softfail** | pass | pass |
| `18.99.40.64` | `apse1.cloud-sec-av.com` | 2 | **softfail** | **fail** | **fail** |

**Still no Freshdesk source.** Every message TIC actually originated left via Google's
relay — IPv4 in Google's report, IPv6 here — signed `s=google`. Nothing sends direct from
Freshdesk in either provider's view, which is what the include decision below rests on.

### The two non-Google sources are a recipient-side mail gateway

`cloud-sec-av.com` is not TIC infrastructure. Both records carry a DKIM signature with
`d=asktic.com; s=google`, meaning Google signed the message legitimately and something
relayed it afterwards — a security gateway in front of the recipient, scanning inbound mail.
`apse1` is AWS ap-southeast-1, which fits a Singapore-side correspondent.

This is textbook forwarding behaviour and the two rows show both halves of it:

- **SPF softfails on both**, because the gateway's address is not in TIC's SPF and never
  could be. That is expected and not fixable from this end.
- **DKIM survives one and not the other.** `us.` relayed the message intact, so the
  signature verified and DMARC passed on DKIM alone — exactly the case this file's email
  authentication section predicted, where DKIM rescues forwarded mail that SPF cannot.
  `apse1.` modified the message — a scan banner or footer is the usual cause — which broke
  the signature.

**This is the reason not to tighten DMARC.** Those 2 messages a day fail DMARC outright:
no SPF, no DKIM, no alignment. Under the published `p=none` they are delivered and merely
reported. Under `p=quarantine` they would go to junk, and under `p=reject` they would bounce
— silently, at the recipient's gateway, for a correspondent who would simply stop hearing
from the firm. Establish who sits behind `apse1.cloud-sec-av.com` before changing `p=`, and
treat the same caution as applying to `-all`: hardening SPF would turn today's softfail into
a hard fail for every gateway-forwarded message.

None of this is a fault in the zone, and none of it is caused by the Vodien move. It is what
DMARC reporting is for: it names a delivery risk that was always there and was invisible
before the records were published.

### A spoofed message, and how to tell it from forwarding

A third report — Google, 2026-08-20, 79 messages — is 78 from the usual relay plus one
from `92.47.62.130`, which fails both checks and has no reverse DNS.

**It is spoofing, not forwarding, and the report says so precisely.** Its `auth_results`
block contains an `spf` element and *no `dkim` element at all* — the message carried no
signature. A forwarded message always carries the original signature, which is why the
`apse1.cloud-sec-av.com` rows above show a DKIM result that *failed*: present but broken by
modification. Absent and broken are different findings, and the distinction is the whole
diagnostic:

| | SPF | DKIM element | Meaning |
| --- | --- | --- | --- |
| Google relay | pass | present, pass | genuine, direct |
| `us.cloud-sec-av.com` | softfail | present, pass | forwarded intact |
| `apse1.cloud-sec-av.com` | softfail | present, **fail** | forwarded and modified |
| `92.47.62.130` | softfail | **absent** | **spoofed** |

One message a day is background noise rather than a campaign — every domain with a
recognisable name receives this — and `p=none` meant it was delivered rather than blocked.

**This cuts against the caution above, and the tension is the real finding.** Enforcement
is exactly what stops the spoof, and exactly what would break the gateway-forwarded mail.
`p=none` currently tolerates both. The sequence that resolves it is: identify who sits
behind `apse1.cloud-sec-av.com`, get that path either fixed or accepted as a known
exception, and only then move to `p=quarantine`. Tightening before that trades a real
delivery failure for a marginal security gain.

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
2. 🔴 **Do not cancel the Wix subscription.** This item was briefly marked discharged on
   2026-08-21, on the basis that Vodien was serving the zone and an export existed. The
   delegation has since reverted to Wix, so Wix is not a rollback any more — it is
   *production*. Cancelling it takes the domain down. The export remains a text file, not a
   restore, and this document still does not record where it lives.
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

## The two parked domains (2026-08-21)

Vodien holds three registrations: `asktic.com`, plus `asktic.sg` (expires 2028-04-04) and
`asktic.com.sg` (2028-01-05), both auto-renewing. The two `.sg` names are parked, and they
are parked differently.

| | `asktic.sg` | `asktic.com.sg` |
| --- | --- | --- |
| Nameservers | **`ns4`/`ns5.wixdns.net`** | `ns1`/`ns2`/`ns3.vodien.com` |
| Apex `A` | `185.230.63.107/.171/.186` | `103.11.189.189` (`redirection.vodien.com`) |
| `www` | `cdn1.wixdns.net` | itself |
| Wildcard | none | **yes — every name resolves** |
| `MX` | none | **`0 mail.asktic.com.sg`** |
| SPF / DMARC | **none** | **none** |

### `asktic.sg` is a live Wix dependency

Its apex points at **exactly the three Wix web servers this file records as removed from
`asktic.com`**, and its nameservers are Wix's. So the Wix question is larger than the main
zone: cancelling that subscription takes `asktic.sg` off the internet as well, DNS and
hosting together. Move it to Vodien nameservers before retiring Wix, not after.

### Neither name can be spoof-protected as it stands

Neither publishes SPF or DMARC, so anyone can send mail as `@asktic.sg` or
`@asktic.com.sg` and no receiving system has grounds to reject it. For a firm whose clients
recognise the brand, a lookalike domain with no policy is the cheaper phishing route — and
these are not lookalikes, they are the real registrations.

A domain that sends no mail should say so explicitly:

```
@                       TXT   v=spf1 -all
_dmarc                  TXT   v=DMARC1; p=reject; rua=mailto:dmarc@asktic.com
*._domainkey            TXT   v=DKIM1; p=
@                       MX    0 .
```

`p=reject` is safe here from the first day, and only here. There is no legitimate mail to
break, which is precisely the argument that does *not* hold for `asktic.com` — see the
gateway-forwarding finding above.

**Two details that decide whether this works:**

- **Cross-domain reporting needs authorising.** `rua` points at `dmarc@asktic.com`, a
  different domain, so `asktic.com` must publish `asktic.sg._report._dmarc.asktic.com` and
  `asktic.com.sg._report._dmarc.asktic.com`, each containing `v=DMARC1`. Both are absent as
  of 2026-08-21, so reports would be silently dropped. Omitting `rua` entirely is the
  simpler alternative and costs only visibility.
- **`asktic.com.sg` already has an `MX`**, pointing at `mail.asktic.com.sg`, which the
  wildcard resolves to Vodien's redirect host. That almost certainly runs no mail server,
  so mail to the domain is already failing — slowly, by timeout and delayed bounce, rather
  than cleanly. Confirm nobody uses an `@asktic.com.sg` address, then replace it with the
  null `MX` above.

### `asktic.com.sg` does not answer at all

Checked in a browser 2026-08-21: `ERR_TIMED_OUT`. The DNS points at
`redirection.vodien.com`, but that host accepts no connection, so the name resolves and
then hangs.

**That is worse than having no web records.** A domain with no `A` fails immediately and
legibly — "server not found". One that resolves to a dead address makes the browser sit
there for thirty seconds first, which reads as *the firm's site is down* rather than *this
address isn't used*. If the redirect is not going to be fixed, deleting the wildcard and
the apex `A` is a strict improvement.

A `301` to `www.asktic.com` is the better end state for both names. Vodien's redirect
service is already configured for `asktic.com.sg` and is not working; if it cannot be made
to serve valid HTTPS, this repo already carries a working pattern for exactly this job —
`tic-help-redirect` in `render.yaml`, a standalone static service whose only function is to
redirect one hostname, with Render handling the certificate.

---

## Pointing the `.sg` names at `www.asktic.com`

Decided 2026-08-21: both `.sg` registrations should `301` to `www.asktic.com`. Both are now
on Vodien nameservers carrying Vodien's default parking zone — apex, `localhost`, `mail`,
`*`, `ftp` and an `MX`, all pointing at `103.11.189.189` (`redirection.vodien.com`), which
does not answer.

### Delete — all of these, on both domains

| Record | Why |
| --- | --- |
| `@` A `103.11.189.189` | dead host; replaced below |
| `*` A `103.11.189.189` | makes every typo and every probe resolve to a dead address |
| `localhost` A `127.0.0.1` | publishing loopback in public DNS serves nobody |
| `mail` A | there is no mail server |
| `ftp` CNAME | there is no FTP |
| `MX 0 mail.<domain>` | points at a host that accepts no mail, so mail fails by timeout |

### Add — the redirect

**Use Vodien's own URL forwarding. Do not build anything for this.**

The apex of both names already points at `redirection.vodien.com` — that is Vodien's
redirect service, and it is what the parking zone is *for*. The timeout observed on
`asktic.com.sg` almost certainly means no forwarding target has been set, not that the
service is broken. Find the URL-forwarding or web-forwarding setting in the domain's panel,
set the target to `https://www.asktic.com`, and the existing DNS needs no change at all.

**The one thing to verify is HTTPS.** Open `https://asktic.sg` in a browser afterwards. A
certificate warning on a brand domain is worse than no redirect, so if Vodien's forwarding
serves plain HTTP only, it is not usable and the fallback applies.

**Fallback, only if Vodien's forwarding cannot do HTTPS:** a dedicated Render static service
whose sole job is to redirect, following the `tic-help-redirect` pattern in `render.yaml`.
One service carries all four hostnames, with `@ A 216.24.57.1` and
`www CNAME <service>.onrender.com`, and each hostname added as a custom domain in Render
first so it can issue a certificate — about ten minutes each.

This was originally written the other way round, leading with the Render build. That was
over-engineered: it stands up and maintains a service to do a job the registrar already
offers as a setting, and it was reached by over-reading a timeout as a broken service rather
than an unconfigured one.

### Add — the anti-spoofing records

```
@                TXT   v=spf1 -all
_dmarc           TXT   v=DMARC1; p=reject; rua=mailto:dmarc@asktic.com
*._domainkey     TXT   v=DKIM1; p=
@                MX    0 .
```

**Vodien refuses the null `MX`.** Confirmed 2026-08-21: entering `.` as the hostname returns
*"Target MX host is not valid"*. Publish no `MX` at all instead. That states nothing rather
than stating "no mail", which is weaker than RFC 7505 but still far better than the parking
record it replaces — and with `v=spf1 -all` and `p=reject` published, a forged message is
rejected regardless of what the `MX` says.

**The `www` CNAME must not point at `tic-web.onrender.com`.** That is the site service: it
would *serve* the site at the `.sg` hostname, not redirect to `www.asktic.com`. The
difference matters — a second hostname serving the same pages is duplicate content, held in
check only by the canonical tags in `app/layout.tsx`, and it doubles the surface that has to
stay correct. Point it at a redirect service instead.

**Nothing resolves until the hostnames are registered in Render.** The `A` and `CNAME` above
aim at Render's load balancer, but Render answers by `Host` header: until `asktic.sg` and
`www.asktic.sg` are added as custom domains on the target service, requests arrive and are
not recognised. Add them in Render first, then point DNS.

Drop TTL to `300` while making these changes and raise it afterwards.

## Order of work (as at 2026-08-21)

1. **Wait out `asktic.com` convergence.** Nothing to do but re-check. Converged means
   `fwtrack` absent on every attempt and every TTL reading `300`.
2. **Harden both `.sg` names against spoofing.** Independent of everything else and worth
   doing first because it is pure gain. For `asktic.com.sg` the records go straight into
   Vodien's DNS panel; `asktic.sg` is still on Wix nameservers, so fold this into step 3
   rather than writing records into a zone about to be abandoned.
3. **Move `asktic.sg` to Vodien.** Build its (very small) zone in Vodien's DNS panel first —
   the anti-spoof records, plus whatever the web answer is to be — then switch its
   nameservers. Check the Wix account for `asktic.sg` still being *connected*, or expect the
   same nameserver re-assertion that produced the split on `asktic.com`.
4. **Decide the web answer for both**: `301` to `www.asktic.com`, or no records at all.
   Either beats the current timeout.
5. **Add the `_report._dmarc` authorisations on `asktic.com`**, if `rua` is used.
6. **Only now, cancel Wix.** Not before `asktic.com` has converged *and* `asktic.sg` is off
   Wix nameservers and Wix hosting. Until both hold, that subscription is load-bearing for
   two domains, not zero.



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

**One thing outstanding, and it is significant.** The DNS move to Vodien was done and verified against three resolvers,
and confirmed on delivered messages over both sending paths. Every follow-up it raised is
closed: the TTL needed no change, `dmarc@` is filtered out of the support queue, the SPF
include stays. **But the move itself did not hold** — see
[The delegation is split](#the-delegation-is-split-2026-08-21) — so Wix is still one of two
authoritative providers and must be kept until that is repaired. The reasoning behind each decision is in
[Still open after the move](#still-open-after-the-move).

One thing the move surfaced and did not resolve, deliberately: Freshdesk relays through
Google Workspace and signs with the `google` selector, so `include:email.freshdesk.com` — 6
of the record's 7 SPF lookups — probably authorises nothing. It stays anyway; removing it
risks permanent SPF failure for mail nobody tests, and at 7 of 10 the record is not near
failure.

### The apex does not redirect to www

Both hostnames serve the site. Canonical tags in `app/layout.tsx` point at `www` and make
this harmless for search, but a 301 would be better. See the note in `render.yaml` for
why it is not a route and what fixing it costs.
