---
title: "The Ledger Model"
description: The fixed fund pool, the circulating fund pool, individual accounts, the ledger identity and the multi-signature rules for the reward pool.
source_sha256: deaad5a45c3a7c7a1e0186fb2329b3beada0b05a01d13bb34b87b28ea778e3fe
translated: 2026-09-18
---

# The Ledger Model

<p class="memorial-kicker">THE LEDGER MODEL</p>

!!! info "Sources"
    This page is compiled from the core logic of [Funds white paper (formal version)](../../about/sources/index.md#merit-whitepaper-funds "物理社功勋系统资金流转白皮书_正式版第一版.docx"),
    using the **memorial-edition wording** of chapters 6–7 of [Merit system historical record](../../about/sources/index.md#merit-history "物理社功勋系统对话史料整理_纪念网站版.docx").
    The specific back-office operating parameters are not within this site's publication scope.

## Account structure

| Concept | Meaning |
| --- | --- |
| **Merit** | The account record unit used internally by the Physics Club, for recording payments, spending, activities, rewards, refunds and project settlement |
| **Master account** | The account recording changes in the club's fund pools as a whole, divided below into the fixed fund pool and the circulating fund pool |
| **Individual account** | The merit record account held in each member's name, showing that member's balance and the flows concerning them |
| **Fixed fund pool** | The public management part of the master account, used for public affairs, advance payments, shared equipment and basic guarantees for activities |
| **Circulating fund pool** | The day-to-day use part of the master account, more directly tied to members' activities, collection of materials and project settlement |
| **Pending project settlement** | The intermediate state of an activity, food order, materials pack or other project between income and the write-off of costs |
| **Reward pool** | A reward amount set aside from activity profit or the fixed fund pool, which may be paid out to members after multi-signature |

## The ledger identity

The system's overall record consists of three parts:

```text title="Total system record"
T = F + L + P
```

- `T` —— the system's overall record
- `F` —— the fixed fund pool
- `L` —— the circulating fund pool
- `P` —— pending project settlement

The individual accounts together correspond to the circulating fund pool:

```text title="Sum of individual accounts"
L = Σ Aᵢ
```

A~i~ denotes the individual account balance of the i-th member.

## The 30 / 70 split of the first round of club dues

Once a member's payment enters the system, it is allocated under the rules in force:

```text title="Allocation for the period"
Fixed fund pool increase   = x × r
Individual account increase = x × (1 − r)
```

**The published ratio for the first round of charges is: 30% into the fixed fund pool, 70% into the circulating fund pool and counted into individual accounts.**

The ratio may later be adjusted according to the state of the fixed fund pool, but **an adjustment affects only future crediting and does not change historical records back**.

## Typical flows

| Scenario | Path in | Spending / write-off | Final destination |
| --- | --- | --- | --- |
| First round of club dues | Allocated 30% / 70% | No immediate spending | Fixed fund pool + individual accounts |
| Activity charges | Enter pending project settlement | Activity costs written off | Balance goes into the fixed fund pool |
| Collection of materials | Paid from the individual account | External costs written off | The difference goes into the fixed fund pool |
| Advertising / cooperation income | Enters a project or the fixed fund pool | Related costs deducted | The net balance goes into the fixed fund pool |
| Reward payment | Paid out after the reward pool is locked | No write-off when no external spending is needed | From the reward pool into individual accounts |
| Refund / closure | Applied for and handled on the individual account | Real funds flow out and are written off | The account is closed or frozen |

## The principle of minting and writing off

!!! note "One-to-one correspondence"
    In the internal model, merit and the flow of real funds are kept in **one-to-one correspondence**:
    each time real funds enter the system, the system forms a corresponding record; when real funds are spent externally, the corresponding record is written off.

    This principle exists to prevent system records from drifting apart from the real funds.

## Rules for the reward pool

The formal edition constrains the reward mechanism to three core points:

1. **Cap**: in non-wartime conditions, the cap on the reward pool is **for the time being limited to less than the profit of the corresponding activity**;
2. **Customisation**: the amount in the reward pool for each activity may be customised by administrators according to the scale of the activity;
3. **Multi-signature**: opening the reward pool each time requires **more than 3 administrators to complete the grant multi-signature** before it can be paid out.

Once the reward payment is complete, the system records a decrease in the reward pool and an increase in the individual account.
For an ordinary member, what this looks like is a reward arriving in their account;
for the officers, what it is in essence is the release of an already-locked reward amount in the fixed fund pool to an individual account.

## The principle of closure in the flow of funds

Whether it is club dues, activities, meals, advertising, materials packs or rewards,
in the end it must all be explainable: **where the funds came from, where they went, which part entered individual accounts,
which part entered the fixed fund pool, and which part was written off because of actual spending.**

## Related sections

- [Glossary](glossary.md)
- [White Papers and the Retention Boundary](whitepapers.md)
- [The Dues and Contribution Credits System](../governance/fees.md) —— the system's predecessor
