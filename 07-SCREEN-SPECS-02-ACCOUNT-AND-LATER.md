# 07 — SCREEN SPECS · PART 2 — Account/P1 + cross-cutting states (S12–S20)

> Status: DRAFT v1 (Round 27) — owner review pending. Same template as doc 06.

## S12 · Login — P1 (sheet at conversion, or tab-in-Profile screen)

- **Layout:** sheet: title "Login" · email + password inputs (validation inline) · black pill "Login" · quiet "Ya guest rehein — phone se bookings dhoondein" link (guest-lookup launch) · "New? Register" link · "Forgot" link.
- **States:** error = human ("email ya password galat"); lockout note honest; offline blocked + strip.
- **Laws:** never auto-focus-trap; login sheet closes into the screen that needed it (context preserved); guest escape hatch ALWAYS visible (guest-first law).
- **Auth detail:** B4 spike — RN session handling (cookie vs additive bearer endpoint) per docs 08/10.

## S13 · Register — P1
Name · email · phone · password (+strength hint) · account-why copy ("bookings ka record + reports ek jagah") · one black CTA. NO email-verification wall blocking bookings (web parity — verify-email flow exists on web; app checks parity decision in B4).

## S14 · Forgot password — P1 — matches web's existing reset flow (API reuse).

## S15 · OTP Verify — P2 SEAM ONLY (built when Twilio live)
UI designed (6-box input + resend 30s + WhatsApp-OTP toggle), code deferred. Doc 10.

## S16 · Notifications Center — P1 (in-app)
List rows (icon + one-line + timestamp · unread dot); mark-all-read; empty = "sab shaant — koi update nahi" + doorway. Data: patient notifications API (auth-gated). Real push = P2 (doc 17/11 seam).

## S17 · Profile & Settings — P1 (tab 3)
- **Guest state:** login card (why-copy) + guest phone-lookup row + city setting + language (EN/Hinglish microcopy toggle) + legal links (privacy/terms — web pages reuse) + about.
- **Logged-in:** account block (avatar · name · phone) · city · language · notification prefs · **Reports row** (P1 → S18) · logout (confirm sheet) · legal · about · version caption.
- **Laws:** settings never deeper than 2 levels; every row 48px+; no toggles without instant persistence.

## S18 · Reports & Records — P1
List (lab reports · prescriptions): date · type chip · doctor/source · view. Viewer = image/PDF full-screen + download-to-device (policy: report files NEVER cached after viewer closes — privacy doc 10) + share (P2 gate). Empty = doorway ("report aane wali hai — clinic visit ke baad" + notify-me chip).

## S19 · Rate Visit / Feedback — P1
Post-visit: 5-star touch targets (64px) + 3 quick-tags (chips: "time pe" · "explain acche se" · "cleanness") + optional line + submit (black pill). Honesty laws: only for completed visits, one-per-visit (API enforces), doctor profile surfaces aggregate — never edits ratings (web parity).

## S20 · Labs hub + Hospital profile — P2 (deferred specs — B4/B5 will detail; API surface exists: labs/hospital endpoints from web)

## Cross-cutting states (apply app-wide — defined once)

| State | Design |
|---|---|
| **Offline banner** | amber strip top (safe-area aware): "Internet nahi — purana data" · tap = retry · auto-hide on reconnect |
| **Error (screen-level)** | line-art icon + human sentence + **Retry** pill + home escape chip (doorway law) |
| **Empty (list)** | line-art + sentence + 1–3 chips (doc 03 §7) |
| **Slow network** | skeletons stay + "abhi le raha hai…" caption at 8s |
| **Update-required** (P1+ kill-switch via stats meta `app_min_version` — additive, contract doc) | full-screen "naya version — update" + store deep link |
| **Permission-denied** | P2 (location near-me): explain chip + settings shortcut, feature degrades not blocks |
| **Session-expired** | authed screens → login sheet with reason; guest flows untouched |

## App-wide screen-count summary

P0 = 11 screens + 5 cross-cutting states · P1 = +7 · P2 = +4 (deferred) — **20 screens
total mapped in 00-master plan §C9; this doc pair (06/07) specs every P0/P1 surface.**
