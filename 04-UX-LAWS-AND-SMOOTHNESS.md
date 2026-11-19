# 04 — UX LAWS & SMOOTHNESS — the "easy experience" constitution

> Status: DRAFT v1 (Round 27) — owner review pending.
> Owner ask: "customer ko smooth and easy experience dena hai" — these 16 laws ARE that.
> Every screen spec (docs 06/07) is audited against this doc. Every batch gate (doc 12) tests these.

## The 16 laws

| # | Law | Rule (exact) | Verified by |
|---|---|---|---|
| 1 | **3-tap booking** | Any doctor bookable from Home in ≤3 taps (search-row → Book → Confirm). Slot tap counts inside the sheet, not as a screen tap. | E2E golden path |
| 2 | **44px touch floor** | Every interactive ≥44×44px incl. chips (hit-slop if visual is smaller) | VLM + unit checks |
| 3 | **One primary action per screen** | Exactly one black-pill CTA visible; everything else quieter | VLM |
| 4 | **Thumb zone** | Primary controls in bottom 2/3; nothing critical in top 15% alone | VLM mobile-390 |
| 5 | **Skeleton-first** | ≤300ms shows skeleton matching final layout; spinner only for explicit user waits (booking submit) | E2E timings |
| 6 | **Never navigate mid-task** | Slot picker & confirm = bottom sheet / step-screen inside same flow; back never silently discards (confirm on exit) | E2E |
| 7 | **Empty = doorway** | Every empty state has 1–3 action chips (problem-word chips, retry) — zero dead ends | VLM |
| 8 | **One-tap error recovery** | Every error state: human sentence + retry button in one tap; technical jargon banned | E2E failure tests |
| 9 | **Honest numbers only** | No fake counts/fees/wait-times ever; "—" beats a guess; wait-estimates labeled as estimate | VLM + code review |
| 10 | **Guest-first (no login wall)** | Complete golden path (find→book→token→queue) with zero login; login offered only where it adds value (history) | E2E guest run |
| 11 | **Fee upfront, always** | ₹ visible on card, profile, slot sheet, confirm — never a surprise after confirm | VLM |
| 12 | **Live state is the protagonist** | Queue/token screens: biggest numbers, pulse animation, nothing marketing competes | VLM |
| 13 | **Pull-to-refresh everywhere** | Any data list + queue screen supports PTR; last-updated timestamp visible | E2E |
| 14 | **Optimistic-only-where-safe** | Optimistic: chip select, recent-search add. NEVER optimistic: booking, cancel, rate (money/visit actions = server truth + loading state) | code review |
| 15 | **Perceived-speed law** | Every tap acknowledged in ≤100ms (press state, sheet start); network answer ≤8s else graceful timeout + retry | E2E |
| 16 | **Warm-care bilingual copy** | Key moments EN + Hinglish variants; tone warm, short, human (doc 03 §6) | copy review |

## Interaction details that make "smooth" real

- **Double-tap guard:** booking/cancel submit disables button + shows loading immediately (no double booking ever).
- **Keyboard overlap law:** inputs never hidden by keyboard (scroll-to-focused + sheet adjusts).
- **Back semantics:** hardware/gesture back closes sheet first, then navigates; mid-booking exit asks confirm ("Booking adhuri rahegi — nikal jayein?").
- **Offline law:** amber strip "internet gaya — purana data dikha rahe hai" + tap-to-retry; booking submit offline = honest block (never silent fail).
- **Deep-link arrival:** token link (aturseva://b/APT-…) opens straight at Token screen even cold-start (notification/WhatsApp share entry).
- **First-run ≤ 3 slides:** onboarding skippable in 1 tap; never repeated (persistent flag).

## Metrics wired to laws (acceptance numbers)

- tap→skeleton ≤300ms (law 5) · tap→ack ≤100ms (law 15) · E2E golden path PASS
  guest, zero login (law 10) · VLM audit of every screen class per batch (laws 2/3/4/7/11/12).
