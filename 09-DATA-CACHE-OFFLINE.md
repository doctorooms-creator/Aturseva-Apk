# 09 — DATA, CACHE & OFFLINE POLICY

> Status: DRAFT v1 (Round 27) — owner review pending. Parent: A5. Feeds privacy doc 10.

## 1. Device-storage whitelist (nothing else may persist — hard law)

| Key | Store | TTL | Privacy class | Cleared when |
|---|---|---|---|---|
| session token (P1) | expo-secure-store | server-session life | secret | logout / expiry |
| city | AsyncStorage | ∞ | preference | user change |
| recent searches (3) | AsyncStorage | app-life | behavioral | manual clear / overflow |
| onboarding-done | AsyncStorage | ∞ | preference | reinstall |
| cache: doctors-list/page · doctor-profile · stats | memory + disk cache | 5–10min SWR | public catalog data | TTL / logout not needed |
| **HEALTH DATA** | — | — | **NEVER on device** | n/a (reports in-memory only, doc 07 S18) |

## 2. Cache rules per data type

| Data | Strategy | Why |
|---|---|---|
| doctors listing | SWR 5min + cached-last-good on failure | speed on repeat + graceful offline |
| doctor profile | SWR 10min | same |
| stats (trust strip) | SWR 5min | cheap, low-stakes |
| slots | **no cache** (fresh every sheet-open/date change) | money-adjacent freshness |
| booking result / token / queue | **no cache** (in-memory only) | protagonist data = always live; stale token = worse than wait |
| images (avatars, photos) | standard RN image cache + placeholders | visual smoothness |

## 3. Offline behavior matrix (per screen class)

| Screen | Offline behavior |
|---|---|
| Home | cached rails + stats + amber strip + retry |
| Listing/Profile | cached-last-good + strip |
| Slot sheet | honest block ("internet chahiye — retry") |
| Confirm booking | hard block, fields preserved (never silent fail) |
| Token | locally held (in-memory) until share; retry fetch |
| Queue | cached position + "last updated HH:MM" timestamp + auto-resume on reconnect |
| Reports (P1) | in-memory only; viewer refuses offline with honest note |

## 4. Sync & refresh laws

- Pull-to-refresh on every list + queue (law 13).
- Foreground-resume → refresh visible screen's active data (queue especially).
- **Never optimistic on money/visit actions** (law 14) — only on chip-selection/recent-search writes.
- Poll cadence: queue adaptive (60/30/backoff — doc 06 S9); nothing else polls P0.
