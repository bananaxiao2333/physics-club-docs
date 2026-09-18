---
title: The Merit System
description: The club's late-stage internal system for fees, contribution, and reward records.
---

--8<-- "en-nav.txt"

# The Merit System

<p class="memorial-kicker">LATE STAGE · THE MERIT SYSTEM</p>

!!! info "Sources and publication scope"
    This page draws on `物理社功勋系统对话史料整理_纪念网站版.docx` — a
    **document compiled specifically for this memorial site** (dated
    18 September 2026) — and on
    `物理社功勋系统会员公开白皮书_正式版第一版.docx`.

    That first document sets out a **three-tier retention policy** which this
    site follows exactly. See [Sources](sources.md).

> The merit system is a set of internal mechanisms the club attempted at a late
> stage for recording membership fees, events, contribution and rewards.
> It began from a need for fee transparency, event accounting and record-keeping
> of member contribution, and developed into an electronic system comprising a
> fixed fund pool, a working pool, personal accounts, a public ledger and a
> reward pool.
>
> In this system, joining fees paid, events attended, materials collected,
> rewards received and refunds requested all leave a record.
> **The system was not only for balancing books — it was to make the club's
> operation visible, and to leave a trace of those who took an active part.**
>
> Although the club has been dissolved, the merit system remains one of the most
> significant organisational experiments in this history. It represents a
> serious attempt by the club's members at **transparency, fairness, institutions
> and long-term operation**.

— From chapter 13 of that document, quoted under its stated authorisation

## Why it appeared

The system arose from concrete problems the club actually faced:

- How to record membership fees clearly
- How to account for event costs
- How to make public funds transparent
- How to make active participants visible
- How to distribute rewards
- How members could look up their own balance and history

The original idea was not a spreadsheet. It was a fairly complete internal
record system: a member pays in, the system creates a record; when the club
spends, holds an event, issues a reward or settles up, the system leaves a
matching entry; members can inspect their own account and the public ledger.

The stated aims were threefold: **transparency, traceability, and sustainability.**

## What merit is

In its final public framing, merit was positioned as the club's internal
**record unit for fees and contribution**.

!!! warning "Merit is not money"
    The system repeatedly emphasises its boundaries: merit is used only under
    the club's internal rules, **is not open to people outside the club, is not
    an external payment instrument, and offers no free transfer, sale,
    discounting, or other external circulation between members.**

    This boundary is preserved across every version of the white paper, and is
    the compliance floor of the whole design.

## The ledger model

| Concept | Meaning |
| --- | --- |
| **Merit** | The club's internal record unit for fees, spending, events, rewards and settlement |
| **Total account** | Records the club's overall fund movement; split into a fixed pool and a working pool |
| **Personal account** | Each member's own record account, showing their balance and history |
| **Fixed pool** | The public-management part: public affairs, bridging payments, shared equipment, event safeguards |
| **Working pool** | The day-to-day part: member activity, materials, project settlement |
| **Project pending** | The intermediate state between income and cost write-off for an event or project |
| **Reward pool** | An allocation set aside from event profit or the fixed pool, paid out after multi-signature approval |

The total account identity:

```text
T = F + L + P
```

- `T` — total system record
- `F` — fixed pool
- `L` — working pool
- `P` — project pending settlement

Personal accounts sum to the working pool:

```text
L = Σ Aᵢ
```

### The first fee split

**30% into the fixed pool, 70% into the working pool and personal accounts.**

Later proportions may be adjusted according to the state of the fixed pool, but
**an adjustment affects only future entries and never rewrites historical records.**

### Casting and write-off

Merit is kept in **one-to-one correspondence** with real money movement: when
real funds enter the system a record is created; when real funds are spent
externally the corresponding record is written off. This principle exists to
prevent the system drifting away from actual funds.

### Reward pool rules

1. **Cap** — in peacetime the reward pool is capped at **less than the profit
   of the corresponding event**
2. **Per event** — the amount is set per event
3. **Multi-signature** — a pool may only be paid out after **three or more
   administrators complete a grant multi-signature**

## The system was actually built

The source materials record that, after the white papers were written,
**the club built an electronic system according to the rules.**

That raised a question: if the system records automatically, is an accounting
department still necessary? The answer recorded in the discussion was that it
**is not only still necessary but more important** — the system replaces
repetitive bookkeeping, but not confirmation of authenticity, receipt review,
fund reconciliation, reward-pool verification, refund review or monthly reporting.

> The system keeps the records; the accounting department makes the ledger
> trustworthy.

The accounting function was therefore proposed for upgrade into a
**Finance & Audit Department**, with responsibilities including reconciling real
funds against system records, reviewing receipts, re-checking event settlement,
confirming the reward pool stays within limits, participating in
multi-signature approval, handling refunds and closures, publishing monthly
financial reports, and monitoring anomalous entries.

## Reading in more depth

The Chinese edition carries the full member-facing rulebook and the complete
model, including: taking on merit, using merit, event and material settlement,
reward issuance, the public ledger and permissions, refunds and account closure,
member rights and duties, and a twelve-section FAQ.

## Related

- [Governance](governance.md) — the fee and contribution-points rules this grew out of
- [The Assembly Room](gatherings.md) — where the system was presented
- [Sources](sources.md) — publication boundaries
