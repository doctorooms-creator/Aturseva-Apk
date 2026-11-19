# 06 — SCREEN SPECS · PART 1 — CORE P0 (screens S1–S11, the golden path)

> Status: DRAFT v1 (Round 27) — owner review pending. Owner ask: "konsi screen pe kya
> rahega, kese rahega — sab kuch define karna hai." This is that doc.
> Per-screen template: Layout (top→bottom) · Data · States · Interactions · Laws.
> All heights in px @1x; all touch ≥44 (doc 04). Colors/typography per doc 03.

## S1 · Splash / Launch — P0 — cold start

- **Layout:** centered logo mark (diya symbol) 120px · wordmark below · version caption mute (bottom 24). No loading text.
- **Data:** local only (session flag, onboarding-done flag, city). Auto-routes in ≤400ms: session? → Home : onboarding? : Home.
- **States:** slow-network irrelevant (no network call); crash-free = plain static.
- **Laws:** never more than 1.2s visible; never a spinner here.

## S2 · Onboarding — 3 slides, skippable — P0 — first run only

- **Slides:** (1) "Doctor dhoondo — bimari ke shabd se" (search visual) (2) "Book karo — 3 tap, fee pehle" (3) "Turn confirmed — live queue ka pata" (token visual, teal pulse). Each: line-art illustration (2-color), display title, caption. Progress dots; **Skip** (quiet, top-right, 44px) · Next (black pill) · last slide = "Shuru karein".
- **City ask:** slide-3 bottom quiet field (city picker sheet: top-20 cities, default = device-locale guess, changeable later in Profile). NO location-permission prompt P0 (that's P2 near-me, separate decision).
- **Data:** none. Writes: onboarding-done, city.
- **Laws:** never unskippable; never >3 slides; never repeats.

## S3 · HOME — P0 — the flagship screen

**Layout (top→bottom):**
1. **Search field** (56px pill, canvas-soft fill): placeholder "Doctor name or problem — fever, knee pain". Left search-icon. Focus → suggest sheet rises (recent 3 + symptom rows "General Physician — Treats fever" with fee meta).
2. **Symptom quick-chips row** (horizontal scroll, pills 44px): fever · knee pain · skin · child · acidity · sar dard. Tap = straight to S4 with query (zero thinking path — Uber "Where to?" adapted).
3. **Live trust strip** (1 line, mute → ink numbers): "58 doctors · 12 hospitals · 10 labs — live" (from /api/public/stats; cached 5min).
4. **Doctor rail — LIVE cards** (horizontal scroll): avatar 56 · name (body-strong) · spec (caption) · ₹fee (tabular bold) · next-slot chip ("Today 5:30 PM"). Tap → S5.
5. **Book-again row** (P1, logged-in only, hide-if-empty): last 3–5 doctors, one-tap book.
6. Quiet footer: city line ("Delhi · change") + legal links (caption).
- **Data:** stats (5min SWR) · rail doctors (SWR, cached-last-good) · P1 book-again.
- **States:** rails = skeleton cards (matched layout); city with no doctors = honest empty + "change city" chip; network fail = cached cards + amber strip + retry; zero-content first-ever visit = symptom chips still alive (doorway law).
- **Interactions:** pull-to-refresh (whole screen); search focus = sheet; chip tap → S4; card tap → S5.
- **Laws:** ONE crown = search (no banner fights it); no marketing section P0; footer legal ≤1 line.

## S4 · Search Results / Doctor Listing — P0

- **Layout:** top bar (back + query echo "fever") · **honesty line** (caption, mute): "fever → General Physician · Pediatrician" (dictionary expansion named — never silent) · filter chips row (specialty · city) · doctor card list (vertical): avatar 64 · name+Reg badge · spec · ₹fee · wait-hint ("~40 min") · rating chip (⭐4.6 · 112) · "Book" pill (ink, 44px). Pagination-infinite (10/page) + count line ("12 doctors found").
- **Data:** /api/doctors?search=&city=&specialty= (SWR 5min, page cache).
- **States:** loading = 6 skeleton cards; 0 results = doorway: "0 doctors 'xyz' ke liye" + problem-word chips (fever/skin/…) + nearby-defaults row; offline = cached list + strip; unbookable doctor = card visible, Book → "slots closed today" honest state.
- **Interactions:** chip re-filter instant; card tap → S5; pull-to-refresh.
- **Laws:** fee+wait visible BEFORE tap (Uber upfront law); 0-result is a doorway never dead-end.

## S5 · Doctor Profile — P0

- **Layout (stack screen, back bar):**
1. Photo 4:3 (editorial, warm) with quiet verified badge.
2. Name (title-strong) + Reg chip ("Reg. G-XXXXX" — trust law) · spec · experience ("12 yrs").
3. **Fee block:** ₹300 (display, tabular) + "first visit" caption — the number is BIG (honesty through scale).
4. Timing table (7-day: day · hours · slot-count).
5. Ratings summary (⭐4.6 · 112 reviews + last review card P1).
6. **Sticky bottom CTA bar** (ink pill, 56px, safe-area): "Book appointment — ₹300".
7. Share row (WhatsApp text card: name+spec+fee+link).
- **Data:** doctor by id + ratings (SWR 10min).
- **States:** skeleton sections; slot-less day in table (struck); unbookable → CTA becomes quiet "Slots closed today" + notify-me chip (P2 seam); offline = cached profile + strip.
- **Laws:** fee never below fold; photo never full-bleed marketing; sticky CTA retreats only for keyboard (never hides content otherwise).

## S6 · Slot Picker — bottom sheet — P0

- **Layout (sheet over S5):** grab-handle · doctor mini-header (avatar+name+₹fee reminder) · **date strip** (7 day chips, today-first, selected=ink) · slot grid grouped Morning/Afternoon/Evening: chip = time + availability ("3 left" caption; full = disabled) · bottom: fee line ₹300 + "Confirm slot" black pill (52px, sticky sheet-bottom).
- **Data:** /api/public/slots?doctorId&date on sheet-open + each date change; counts live.
- **States:** skeleton chip grid (12 placeholders); day empty = "No slots this day" + next-avai-lable-day chip; past-times struck; error = retry row.
- **Interactions:** date horizontal scroll; slot select = teal ring; Confirm → pushes S7 (sheet closes with spring).
- **Laws:** selection survives date-switch-and-back within session; counts NEVER fake; sheet never overflows (scroll inside).

## S7 · Confirm Booking — step screen — P0

- **Layout:** back bar ("Adhura — back se slot safe") · summary card (doctor mini + date+time+₹fee — everything visible TOGETHER for the first time, one place) · guest fields (name · phone, 10-digit validation) — logged-in: auto-filled, editable · fee line big: "₹300 — clinic pe pay" (cash-at-clinic law, upfront) · **"Confirm booking"** black pill 56px sticky (double-tap guard + loading).
- **Data:** POST /api/public/book {doctorId, slot, name, phone, city} — rate-limited.
- **States:** validation inline (field-level, human copy); rate-limit = honest "Bahut jaldi-jaldi koshish — 30 sec ruk ke try karein"; offline = blocked + strip; server-fail = retry one-tap (no silent fail — money/visit law); success → S8 (stack replace).
- **Laws:** fee + cash-at-clinic visible at confirm moment; NO new asks (no email, no OTP) — minimality law; exit confirm if fields filled.

## S8 · Booking Success / TOKEN — P0 — THE celebration + hero

- **Layout:** celebration micro-moment (single confetti burst ≤1.5s, then calm — doc 03 §6) · **"Booked"** title + booking id (APT-…) caption · **TOKEN number display-hero 32px+ tabular, on soft card with teal pulse dot** ("Turn confirmed") · visit facts (doctor · date · time · ₹fee · city) · **Share row (WhatsApp pill)** — token as text card w/ deep link · "Track queue" secondary pill · quiet add-to-reminder chip (P2 seam).
- **Data:** booking + token endpoints (fresh, no-cache).
- **States:** token-pending (rare) = "Token aa raha hai…" honest pending state with auto-retry; share fail = plain text fallback copy.
- **Laws:** token number is the LARGEST content on the screen (protagonist law); everything else quiet; share works with zero login.

## S9 · Live Queue Tracker — P0 — THE live surface

- **Layout:** header "Aapki turn" + booking id · **big position block**: "Abhi: 7th · Aap aage: 6 log" (display tabular, teal pulse dot) · **wait estimate** ("~25 min") + **leave-by advisory** (warn chip: "5:10 tak clinic pahunchein" — engine reuse from web token machinery) · progress meter (visual: token positions consumed) · actions: **leave-ping** ("Clinic ko bata dein — 5 min me pahunch raha hu" quiet pill) · queue-board link (public board) · refresh timestamp + pull-to-refresh.
- **Data:** GET /api/queue/doctor/[doctorId] — **adaptive poll: 60s baseline · 30s foreground with active booking · 2× backoff background · stop at done** (battery-friendly, no socket P0).
- **States:** not-started ("Queue 9:00 AM se shuru"); paused ("Doctor break — 10 min"); done = celebration-lite ("Ho gaya! Visit kaise rahi? → rate" P1 chip); doctor-no-show honest state; offline = cached position + "last updated 12:04" + retry.
- **Laws:** estimate LABELED as estimate (honesty law 9); no fake animation of movement when data stale (timestamp shown); this screen = the moat — polish budget here is bottomless (within restraint).

## S10 · My Bookings — P0 (tab 2)

- **Layout:** tabs Upcoming / Past (segmented pill) · booking cards: date+time · doctor mini (avatar/name/spec) · status badge (confirmed · completed · cancelled) · token number (tabular) · tap → S11 · guest entry: "Booking dhoondein" phone-lookup sheet (10-digit → recent bookings by phone — matches web's guest-lookup law; NO forced login).
- **Data:** authed list (P1) or guest phone-lookup (P0 path).
- **States:** skeletons; empty-upcoming = doorway ("koi booking nahi — doctor dhoondein?" + Home chip); lookup empty = honest "is number pe booking nahi mili" + retry with another number.
- **Laws:** guest parity (guest sees their bookings too — phone is identity-lite); never a login wall.

## S11 · Booking Detail — P0

- **Layout:** full facts card (everything S8 had) · status timeline (booked → confirmed → completed) · actions stack: Track queue (if upcoming) · Share token · **Cancel** (quiet destructive, confirm sheet + honest reason field optional) · Book again (P1) · Rate visit (P1, completed only).
- **Data:** booking by id (fresh).
- **States:** cancelled = honest banner + re-book chip; cancel-fail = retry; completed = rate chip prominent (P1).
- **Laws:** destructive actions always confirm-sheet; cancel never one-tap (money/visit law 14).
