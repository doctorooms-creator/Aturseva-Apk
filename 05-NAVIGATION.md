# 05 — NAVIGATION ARCHITECTURE — nav me kya kya rahega

> Status: DRAFT v1 (Round 27) — owner review pending. Owner ask: "nav bar me kya kya rahega — sab kuch define karna hai."

## 1. Bottom tab bar (the primary nav — P0)

**3 tabs, exactly** (Uber restraint: never 5+):

| Tab | Icon (lucide) | Label | Contents | Badge rule |
|---|---|---|---|---|
| **Home** | `home` | "Home" | search, symptom chips, live rails, book-again (P1) | none |
| **Bookings** | `calendar-check` | "Bookings" | upcoming/past list, guest phone-lookup entry | count of upcoming (small ink dot with number) |
| **Profile** | `user` | "Profile" | guest: login card + settings; logged-in: account + prefs + legal | none |

- P1 inserts **Reports** tab (`file-text`) → 4 tabs. P0 deliberately 3: "Reports
  empty for guests" is noise; Profile houses a Reports row for guests in P0.
- Tab tap on active tab = scroll-to-top (standard instinct).
- Active tab: ink icon+label; inactive: mute. No color explosion (doc 03 law).

## 2. Top app bar (per-screen, NOT global)

- Home: NO top bar — search field is the crown (content starts at y=0, safe-area padded).
- List/detail screens: quiet top bar = back chevron + screen title (title-style) +
  at most ONE quiet action (share / filter) — never 3+ actions.
- Queue screen: NO back-during-flow games; back allowed always (state is server-side).

## 3. Stack map (expo-router structure)

```
app/
  _layout.tsx            → root stack + providers + session bootstrap
  (tabs)/
    index.tsx            → HOME          (tab 1)
    bookings.tsx         → BOOKINGS      (tab 2)  + guest-lookup sheet
    profile.tsx          → PROFILE       (tab 3)
  doctors/[id].tsx       → DOCTOR PROFILE (stack, from any card)
  book/[doctorId].tsx    → SLOT SHEET + CONFIRM (stack, shared element from profile)
  b/[bookingId].tsx      → TOKEN         (stack + deep link target aturseva://b/:id)
  b/[bookingId]/queue.tsx→ QUEUE TRACKER (stack)
  bookings/[id].tsx      → BOOKING DETAIL
  login.tsx / register.tsx / forgot.tsx          (P1)
  notifications.tsx · reports/… · rate/[ref]      (P1)
```

Modals (bottom sheets, NOT screens): slot picker, login-at-conversion prompt,
cancel confirm, city picker. Sheets spring from bottom (doc 03 §6); the task never
leaves its screen (law 6).

## 4. Deep links & external entries

| Pattern | Opens | Used by |
|---|---|---|
| `aturseva://b/{APT-id}` + `https://…/b/{APT-id}` (app-links) | Token screen (cold-start safe) | WhatsApp token share |
| `aturseva://doctors/{id}` | Doctor profile | future campaigns |
| notification tap (P2) | related screen | push |

## 5. Route guards (guest-first law)

Every route is guest-reachable EXCEPT: notifications/reports list (P1) → those open
the **login sheet** (bottom sheet, never a wall) with the exact reason ("apni
bookings dekhne ke liye login karein") + guest phone-lookup alternative offered.

## 6. Motion rules

- Tab switch: no slide — instant + 150ms content crossfade (speed perception).
- Stack push: 250ms standard. Sheets: spring. No hero-flight experiments P0.
- Back gesture (iOS edge / Android back): sheet-close priority, then pop; mid-booking
  pop = confirm dialog (doc 04).
