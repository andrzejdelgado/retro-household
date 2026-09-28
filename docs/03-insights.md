# 03 — Insights

Date: 2026-09-28. Each insight names its evidence in the practice files, its implication for the product, the decision or feature it serves, and the criteria in `docs/01-goals.md` it supports. Feature keys: F1 routines and PDF, F2 Wi-Fi hours, F3 TV schedule and TV app, F4 household rules, per D11.

| ID | Insight | Evidence | Implication | Serves |
|---|---|---|---|---|
| I1 | The top parental fear is content arriving through feeds, and the practice answer is content that is owned, pre-watched and chosen by a parent. | Concerns 3; tech stages ground rules ("no accounts, no ads, no autoplay, no recommendations") | The TV app plays parent-loaded files only. No browsing, no search, no suggestions, nothing the child did not get from a parent. | F3, D15, D18; C4.3, C4.4 |
| I2 | The switch-off moment is the fight, and the readiness gate is "stopped without a fight". | Concerns 2; tech stages readiness gates and "ends when the episode ends" | Broadcast semantics move the ending from the parent to the clock. The window closes on time, no show is ever cut mid-episode, and off-air offers nothing to negotiate with. | F3, D15, D18; C4.1, C4.2, C4.3 |
| I3 | "Never as a tool" is the single most important rule, and the emotional-education practice says praise effort, never reward charts. | Tech stages ground rules; routine elements, emotional education 5 to 8 | No gamification anywhere. No stars, streaks, points or badges in the parent app or the TV app. Screen time is never framed as earned or lost. Warnings speak of consequences for the child, not of rules broken. | All features; C2.2 wording, C7.4 |
| I4 | Parents feel guilt about their own phone use, and the adult rules sit above the child rules. | Concerns 8; household major rules (phones in a drawer, work stops at pick-up, seven hours of sleep) | Household rules are for adults first and print alongside the child pages. Wi-Fi hours exist to make the adult rules physical: the laptop unreachable after pick-up, no phone overnight. | F2, F4; C3.2 |
| I5 | Predictability is the main protector against overwhelm, and the household runs on a fixed rhythm from age 1. | Household rhythms introduction (Payne, the Danish approach) | Routines are time-anchored rhythms, not task lists. The printed page is a timeline read top to bottom, the same shape every day. | F1; C1.1, C3.1 |
| I6 | Brackets change constantly in the first eight years, and every file splits them differently. | Routine elements (WHO splits at 1, 3, 5), tech stages (3, 5, 7), rhythms (1, 3, 5) | The app computes the bracket from the birthdate and advances everything on the birthday. The parent never recomputes. Content is mapped onto eight one-year steps so the UI shows one scale. | D08, D24; C2.1, C6.1 |
| I7 | Each child has their own policy, an older child's screen time happens where the younger cannot see it, and the user decided siblings' privileges are managed by parents, not merged. | Tech stages, siblings; D10 | Separate profiles, PINs, channels and budgets per child. Watching together is an explicit act by the parent that deducts from each named child. The printed routine of a younger sibling should show where they are during an older child's slot. | F3, D09, D10, D16; C4.5, C5.1 |
| I8 | Both parents must run the same rules, and disagreements are settled away from the child. | Household major rules | The printed page is the alignment tool between parents and with carers. Every default practice carries a one-line why so the second parent can accept it without the conversation. | F1, F4, D24; C2.5, C3.2 |
| I9 | Parents feel outmatched by peers who have no limits, and European parents expect a shared, written stance. | Concerns 7 | The app produces a written, sourced household policy the parent can show. Sources are one tap away. | F4, D24; C2.5 |
| I10 | Weekly caps, days-per-week limits and "never two days in a row" are rules a person cannot hold in their head. | Tech stages, total screen budget table and long-form media 3 to 5 | The accumulator computes daily, weekly, frequency and consecutive-day rules from the day-type structure and shows the total wherever it can change. | F3, D13; C5.1, C5.2, C5.3 |
| I11 | The rhythm files assume a 16:00 Nordic pick-up and an afternoon screen slot before dinner. | Household rhythms, open points; the 16:30 to 17:30 slot | Routine times are editable. TV windows derive from each child's screen slot. The conflict helper respects pick-up, dinner and bedtime when it proposes a split. | F1, F3, D17; C5.5 |
| I12 | Under 3 there is no screen budget, and the file says to reveal each technology on a fixed date, not by drift. | Tech stages, total screen budget; progression ("reveal dates, not drift") | For a household with only a child under 3 the value is rhythm, adult rules and Wi-Fi hours. To keep the app from feeling empty and to honour reveal dates, show what opens at the next bracket and on which date. This is a proposed addition, see the note below. | F1, F2, F4; C5.4, plan risk 2 |
| I13 | Children aged 3 to 7 are pre-literate or early readers. | Routine elements, reading and language (own reading from 6 or 7) | The channel picker works on thumbnails. Off-air is wordless. PIN entry is parent-assisted at 3 to 4. | F3, D15; C4.4, C4.6 |
| I14 | Parental exhaustion predicts worse child outcomes more reliably than screen measures. | Household major rules ("adults sleep 7 hours"); concerns 8 | The app must cost the parent little: defaults first, few decisions, every screen with one next action, nothing to maintain daily. | F1 to F4; C1.1, C1.2, C7.4 |
| I15 | Parents blame the product design more than the child, and the practice bans autoplay, reward loops and timers for the child. | Concerns 2; tech stages ground rules | The TV app has no autoplay across shows beyond the programme, no "next episode", no countdown, no progress bars visible to the child. The programme plays, then stops. | F3, D15; C4.3 |

## Feature coverage

| Feature | Insights |
|---|---|
| F1 Routines and PDF | I5, I6, I8, I11, I12, I14 |
| F2 Wi-Fi hours | I4, I12 |
| F3 TV schedule and TV app | I1, I2, I7, I10, I11, I13, I15 |
| F4 Household rules | I4, I8, I9, I12 |

Every feature in D11 traces to at least one insight. Every insight traces to a practice file.

## Proposed addition from I12 (parked)

A small "what opens next" view per child: the next bracket, the date it starts, and the technologies and practices that change. It is read-only and derived from data the app already holds. It is not in D11. On 2026-09-28 the user set the demo premise that a parent sets up a programme for the 1-year-old and receives the warning, which removes the empty-page motivation. Parked on the roadmap in `PLAN.md`.
