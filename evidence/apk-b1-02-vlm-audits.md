# APK-B1 — VLM DESIGN AUDITS (4 screens, 390px)

## VLM AUDIT — home

## Design Audit — 390px Healthcare Home Screen

**Law 1 — White canvas + near-black ink + grey support: PASS**
White background throughout, near-black headings/names (\"Doctors\", \"Rajesh\", \"₹300\"), grey for secondary text (visit counts, \"Aaturseva v0.1.0 · APK-B1\", inactive tabs). No off-palette tones.

**Law 2 — Teal ONLY on live indicators: PASS**
Teal appears exactly twice: the pulse dot in the \"97 doctors · 13 hospitals · 55 visits booked — live\" line, and the \"live\" chip next to \"Doctors\". No teal on buttons, icons, tabs, or decorative elements.

**Law 3 — Pills on interactives: FAIL**
- Search bar: full pill ✓
- Symptom chips (fever, knee pain, skin…): pills ✓
- Doctor cards: heavily rounded ✓
- **Bottom tab bar: FAIL** — the active tab (\"Home\") has no pill/highlight container behind it; it's just an icon + label on the bare bar. Per the law, interactive tabs should carry a pill treatment (e.g., rounded pill behind the active Home tab).
- \"Delhi · change\" and \"Privacy · Terms\" are text-only interactives with no pill affordance.

**Law 4 — NO blue/indigo/violet: PASS**
No cool blues or purples anywhere; palette is strictly white/black/grey/teal-on-live.

**Law 5 — Cards subtle-bordered: PASS**
Doctor cards use a light, low-contrast border with generous rounding — subtle, not heavy shadows or dark strokes.

**Law 6 — 3-tab bottom bar with labels: PASS**
Home / Bookings / Profile — three tabs, each with icon + text label, active state distinguishable.

---

## Final Verdict: **FAIL**

Single blocker: Law 3 — the bottom tab bar's active state lacks the required pill container. Everything else is compliant. The right-edge crops on the doctor cards and symptom chips are noted as intentional scroll rails and excluded per instructions.

**Fix:** add a subtle pill background behind the active tab (grey pill, or teal-tinted only if treated as \"live\" state — safer: neutral grey to keep Law 2 clean).

---

## VLM AUDIT — onboarding

## Design Audit — 390px Onboarding Slide (\"Doctor dhoondo\")

**Law 1 — White canvas + near-black ink + grey: PASS**
Pure white background, near-black title and Next button, grey caption text. Palette is clean and limited.

**Law 2 — Line-art only, black stroke + teal accent: PASS**
Illustration is a black-stroke magnifying glass with a teal accent (dot + underline inside lens). No photos or clip-art detected.

**Law 3 — Display-size title + grey caption: PASS**
\"Doctor dhoondo\" is large/bold (display weight); caption beneath is smaller, grey, two lines.

**Law 4 — Progress dots visible: PASS**
Three dots above the button (first active/dark, two inactive grey). Clearly visible.

**Law 5 — Skip top-right + black pill Next: PASS**
\"Skip\" sits top-right in grey; \"Next\" is a full-width black pill anchored at the bottom.

**Law 6 — No blue/indigo/violet: PASS**
Only white, black, grey, and teal present. No cool-blue hues anywhere.

---

## Verdict: **PASS (6/6)**

Compliant onboarding slide. Minor nitpicks (non-blocking): the underline hairline under the illustration is slightly close to it, and the caption wraps into two lines that could be tightened for rhythm — but no law violations.

---

## VLM AUDIT — bookings

## Design Audit — 390px Bookings Empty State

**Law 1 — Empty state = doorway:** Icon (line-art calendar) + human sentence (\"Booking flow agle build me live hoga — tab tak Home se doctors dekhein\") + action chip. No dead-end or fake list. — **PASS**

**Law 2 — White/ink/grey palette:** Pure white bg, ink text, grey caption/icon, grey pill. No blue/indigo/violet. — **PASS**

**Law 3 — Icon in soft circle, title + grey caption + one pill chip:** Calendar sits in soft grey circle ✓, bold title \"Abhi koi booking nahi\" ✓, grey caption ✓, exactly one pill button \"Home pe doctor dhoondein\" ✓. — **PASS**

**Law 4 — Tab bar 3 tabs labelled:** Home, Bookings (active, bold+icon), Profile — all labeled. — **PASS**

**Verdict: PASS (4/4).** Clean, compliant doorway — action chip correctly routes users to Home until the booking flow ships.

---

## VLM AUDIT — profile

## Audit — Profile tab (390px)

**Law 1 — Guest card honest:** ✅ PASS. Person icon, bold \"Guest\" title, grey caption, no avatar/name/edit button/fake account UI.

**Law 2 — Settings rows:** ✅ PASS. \"Shehar\" and \"Aturseva web\" are soft grey cards, each with icon + label + value/caption + chevron.

**Law 3 — Teal only on live indicator:** ✅ PASS. No teal anywhere; no live indicators present (none expected).

**Law 4 — No blue/indigo/violet:** ✅ PASS. Palette is white/ink/grey only.

**Law 5 — City row real value:** ✅ PASS. Shehar row shows **Delhi**.

**Verdict: PASS (5/5).**

**Guest card caption (verbatim):**
> \"Bina account bhi chalega — booking ke liye login nahi chahiye (APK-B3 me flow). Login APK-B4 me aayega.\"

## Reference implementation

```html
<html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">
<script src=\"https://cdn.tailwindcss.com\"></script></head>
<body class=\"bg-white text-neutral-900\" style=\"max-width:390px;margin:0 auto;font-family:system-ui\">
<main class=\"px-4 pt-6 pb-24\">
  <h1 class=\"text-2xl font-bold mb-5\">Profile</h1>

  <div class=\"bg-neutral-100 rounded-2xl p-4 flex items-start gap-3\">
    <svg class=\"w-6 h-6 text-neutral-700 mt-1\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5\"/></svg>
    <div>
      <p class=\"font-semibold\">Guest</p>
      <p class=\"text-sm text-neutral-500 leading-snug\">Bina account bhi chalega — booking ke liye login nahi chahiye (APK-B3 me flow). Login APK-B4 me aayega.</p>
    </div>
  </div>

  <p class=\"text-sm text-neutral-400 mt-6 mb-2\">Settings</p>

  <button class=\"w-full bg-neutral-100 rounded-2xl p-4 flex items-center gap-3 text-left mb-3\">
    <svg class=\"w-5 h-5 text-neutral-600\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" viewBox=\"0 0 24 24\"><path d=\"M12 21s-7-6-7-11a7 7 0 1 1 14 0c0 5-7 11-7 11z\"/><circle cx=\"12\" cy=\"10\" r=\"2.5\"/></svg>
    <div class=\"flex-1\"><p class=\"font-semibold\">Shehar</p><p class=\"text-sm text-neutral-500\">Delhi</p></div>
    <svg class=\"w-4 h-4 text-neutral-400\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\"><path d=\"M9 6l6 6-6 6\"/></svg>
  </button>

  <button class=\"w-full bg-neutral-100 rounded-2xl p-4 flex items-center gap-3 text-left\">
    <svg class=\"w-5 h-5 text-neutral-600\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M3 12h18M12 3c3 3.5 3 14 0 18M12 3c-3 3.5-3 14 0 18\"/></svg>
    <div class=\"flex-1\"><p class=\"font-semibold\">Aturseva web</p><p class=\"text-sm text-neutral-500\">Privacy · Terms</p></div>
    <svg class=\"w-4 h-4 text-neutral-400\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\"><path d=\"M9 6l6 6-6 6\"/></svg>
  </button>

  <p class=\"text-center text-neutral-400 text-sm mt-24\">Aturseva v0.1.0 · APK-B1</p>
</main>
<nav class=\"fixed bottom-0 inset-x-0 bg-white border-t border-neutral-200 flex\" style=\"max-width:390px;margin:0 auto\">
  <a class=\"flex-1 py-3 text-center text-neutral-400\"><svg class=\"w-6 h-6 mx-auto\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" viewBox=\"0 0 24 24\"><path d=\"M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z\"/></svg><span class=\"text-xs\">Home</span></a>
  <a class=\"flex-1 py-3 text-center text-neutral-400\"><svg class=\"w-6 h-6 mx-auto\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" viewBox=\"0 0 24 24\"><rect x=\"4\" y=\"5\" width=\"16\" height=\"16\" rx=\"2\"/><path d=\"M8 3v4M16 3v4M4 10h16\"/></svg><span class=\"text-xs\">Bookings</span></a>
  <a class=\"flex-1 py-3 text-center text-neutral-900\"><svg class=\"w-6 h-6 mx-auto\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5\"/></svg><span class=\"text-xs\">Profile</span></a>
</nav>
</body></html>
```
