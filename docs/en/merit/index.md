---
nav_label: "The Merit System"
title: "The Merit System"
description: The Physics Club's internal dues, contribution and reward accounting mechanism in its late period — an organisational experiment.
nav: ["member-rules", "ledger", "glossary", "whitepapers"]
source_sha256: ffea03b81b91c1970b4c16ff1e43a3afcdfa59cd2c961e3f818d46649ee0daff
translated: 2026-09-18
# ⚠️ 由 tools/docsgen.py 从 content/merit/index.en.md 生成，请勿手改；要改请改 content/ 下的源文件。
---

# The Merit System

<p class="memorial-kicker">LATE STAGE · THE MERIT SYSTEM</p>

!!! info "Sources"
    This page is compiled from `资料/物理社功勋系统对话史料整理_纪念网站版.docx` and
    `资料/物理社功勋系统会员公开白皮书_正式版第一版.docx`.

    The first is a **compilation of historical material written specifically for this memorial site** (compiled 18 September 2026),
    and it sets out explicitly the three-tier publication boundary this site should adopt.

> The merit system was an internal mechanism that the Physics Club tried to establish in its late period for recording dues, activities, contributions and rewards.
> It began with the need for transparency in club dues, for activity accounting and for a record of member contributions, and later developed step by step into an electronic system
> comprising a fixed fund pool, a circulating fund pool, individual accounts, a public ledger and a reward pool.
>
> In this system, members' payments, participation in activities, collection of materials, receipt of rewards and applications for refunds all leave a record.
> **The system was not only for keeping accounts; it was there to make the club's operations visible and to leave a trace of those who took part actively.**
>
> Although the Physics Club has disbanded, the merit system remains an important organisational experiment in this history.
> It represents the serious attempt its members once made at transparency, fairness, rules and long-term operation.

—— Quoted from chapter 13, “Short text usable on the memorial site”, of that document, by permission of the original

## Why this system appeared

The merit system appeared because of several concrete problems the Physics Club faced in actual operation:

- How dues should be recorded clearly
- How activity costs should be accounted for
- How public funds should be made transparent
- How members who took part actively should be seen
- How rewards should be paid out
- How members should be able to look up their own balance and history

The original idea was not simply to make a spreadsheet, but to establish a fairly complete internal record system:
once a member paid their dues, the system formed a corresponding record; when the club spent money, ran activities, paid rewards or settled accounts,
the system left the accounts alongside; and members could view their own account and the public ledger.

The core demands were three: **transparency · traceability · sustainability**.

## Basic positioning

In the final public wording, merit is positioned as the Physics Club's internal **tool for recording dues and contributions**,
used to record members' payments, use in activities, public expenditure, reward payments and changes to accounts.

The boundary the system stressed repeatedly:

!!! warning "Merit is not currency"
    Merit is used only under the club's internal rules. It is **not open to people outside the club, is not used as a payment instrument outside the club,
    and offers no free transfer between members, no buying and selling, no discounting to cash and no other form of external circulation**.

    This boundary was retained across several versions of the white paper, and is the compliance floor of the whole design.

## The real problems it was meant to solve

| Stage | What the system did |
| --- | --- |
| Payment | Every entry leaves the amount, the time, the handler, the review status and a voucher |
| Activity | Income, cost, deductions and the balance form a project record |
| Materials | Collection and settlement can be checked, and any difference has somewhere to go |
| Rewards | Paid from the reward pool after multi-signature confirmation, with a stated reason and a review record |
| Refunds | Bound to account closure or withdrawal from the club; real funds flow out and the record is written off |
| Lookup | Members can view their own details and the club's public ledger |

## Sections

<div class="grid cards" markdown>

-   __The Ledger Model__

    ---

    Fund pools, accounts, the ledger identity, the reward pool and multi-signature.

    [:octicons-arrow-right-24: See the model](ledger.md)

-   __Glossary__

    ---

    Merit, fixed fund pool, circulating fund pool, pending project settlement…

    [:octicons-arrow-right-24: Look up terms](glossary.md)

-   __White Papers and the Retention Boundary__

    ---

    The version lineage, and why this site publishes only part of it.

    [:octicons-arrow-right-24: See the version lineage](whitepapers.md)

</div>

## In the end it was more than a software project

> Seen from the standpoint of historical material, it shows a student club working through real problems:
> how to deal with opaque dues, how to account for activity costs, how public funds should be retained,
> how active members should be rewarded, how the system should avoid distortion,
> and how the accounting side should move from hand-kept books to audit oversight.

The most representative line from the release speech is:

> The Physics Club is not only a place to do physics together;
> it should also become a club that is **governed by rules, keeps a ledger, records contributions and has long-term vitality**.

## Related sections

- The system's predecessor: [Dues and Contribution Credits](../governance/fees.md)
- When the system appeared: [Assembly Scripts · 05.12](../gatherings/index.md)
- The full list of material: [Sources](../sources/index.md)
