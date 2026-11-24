#!/usr/bin/env bash
# run-persona.sh — one persona, full pipeline, one verdict.
#
# Pipeline: viewport -> open app -> dismiss onboarding -> emulate OS font
# scale -> capture zone screenshots -> VLM audit against the persona's goal.
#
# Usage:
#   ./run-persona.sh <persona-id> [brief] [baseUrl] [evidenceDir]
#     persona-id : owner | ravi | anna | grace | malik | lucia
#     brief      : layout (default) | explore | reproduce:<steps> | improve
#     baseUrl    : default http://localhost:3000/app/
#
# Output: evidenceDir/<persona>-<brief>-verdict.json (+ screenshots)
set -uo pipefail

PERSONA_ID="${1:-owner}"
BRIEF="${2:-layout}"
BASE_URL="${3:-http://localhost:3000/app/}"
HERE="$(cd "$(dirname "$0")" && pwd)"
EVIDENCE="${4:-$HERE/../../evidence/persona-matrix}"
mkdir -p "$EVIDENCE"

# ---- persona ----
PERSONA_JSON=$(python3 - "$HERE/personas.json" "$PERSONA_ID" <<'PY'
import json, sys
data = json.load(open(sys.argv[1]))
for p in data["personas"]:
    if p["id"] == sys.argv[2]:
        print(json.dumps(p)); break
else:
    sys.exit(f"persona not found: {sys.argv[2]}")
PY
)
if [ -z "$PERSONA_JSON" ]; then echo "ERROR: unknown persona '$PERSONA_ID'" >&2; exit 1; fi

W=$(python3 -c "import json,sys; print(json.loads(sys.argv[1])['viewport'][0])" "$PERSONA_JSON")
H=$(python3 -c "import json,sys; print(json.loads(sys.argv[1])['viewport'][1])" "$PERSONA_JSON")
FS=$(python3 -c "import json,sys; print(json.loads(sys.argv[1])['font_scale'])" "$PERSONA_JSON")
GOAL=$(python3 -c "import json,sys; print(json.loads(sys.argv[1])['goal'])" "$PERSONA_JSON")
PROFILE=$(python3 -c "import json,sys; print(json.loads(sys.argv[1])['profile'])" "$PERSONA_JSON")
TAG="$PERSONA_ID-$BRIEF-$(date +%H%M%S)"

echo "== PERSONA $PERSONA_ID (${W}x${H}dp fontScale=$FS) brief=$BRIEF =="

# ---- briefs (adapted from mobile-agent-testers briefs) ----
case "$BRIEF" in
  layout)
    AUDIT_PROMPT="You are auditing a healthcare app home screen for a persona: $PROFILE. Goal: $GOAL. Check strictly: (1) any large empty/dead band above the bottom navigation, (2) any label truncated with ellipsis or clipped mid-word, (3) any text overlapping another element, (4) is the bottom navigation pill fully visible and inside the screen, (5) does content stretch sensibly to fill the screen height. Answer with a numbered verdict per point: PASS or FAIL with a one-line reason."
    ;;
  explore)
    AUDIT_PROMPT="You are watching a new user use a healthcare app: $PROFILE. Goal: $GOAL. Look at the screenshots and report every place this persona would get stuck, hesitate, or misunderstand — with numbered references to the screenshots."
    ;;
  improve)
    AUDIT_PROMPT="You are a UX reviewer for a healthcare app used by: $PROFILE. Goal: $GOAL. From the screenshots, list the top friction points by area and impact, and what to change first."
    ;;
  reproduce:*)
    STEPS="${BRIEF#reproduce:}"
    AUDIT_PROMPT="A bug was reported with these steps: $STEPS. Persona: $PROFILE. From the screenshots, decide: REPRODUCED, NOT REPRODUCED, or UNCLEAR — with the evidence you see."
    ;;
  *) echo "unknown brief: $BRIEF" >&2; exit 1 ;;
esac

# ---- pipeline ----
agent-browser set viewport "$W" "$H" >/dev/null
agent-browser open "$BASE_URL" >/dev/null
agent-browser wait --load networkidle >/dev/null 2>&1
sleep 3

# Dismiss onboarding if present (Skip / Get Started buttons on first run).
agent-browser find role button click --name "Skip" >/dev/null 2>&1 || true
agent-browser find role button click --name "Get Started" >/dev/null 2>&1 || true
sleep 3

# Emulate OS font scale (text only, boxes fixed — same as Android).
agent-browser eval "$(cat "$HERE/scale-text.js") window.__applyFontScale__($FS)" >/dev/null
sleep 1

# Zone screenshots: top, mid, bottom (scroll), plus nav zone.
# RN-web scrolls an inner overflow div, NOT the window — target it.
SHOTS=()
shot () { # name, y
  local f="$EVIDENCE/$TAG-$1.png"
  if [ "${2:-}" != "" ]; then
    agent-browser eval "(() => { const sc=[...document.querySelectorAll('div')].filter(d=>{const c=getComputedStyle(d);return /(auto|scroll)/.test(c.overflowY)&&d.scrollHeight>d.clientHeight+4;}); if(sc.length){sc[0].scrollTop=$2;} else {window.scrollTo(0,$2);} return 'scrolled'; })()" >/dev/null
    sleep 1
    agent-browser eval "$(cat "$HERE/scale-text.js") window.__applyFontScale__($FS)" >/dev/null
  fi
  agent-browser screenshot "$f" >/dev/null
  SHOTS+=("$f")
}
shot top
shot mid 400
shot bottom 99999

# ---- VLM audit ----
ARGS=()
for f in "${SHOTS[@]}"; do ARGS+=(-i "$f"); done
VLM_OUT="$EVIDENCE/$TAG-verdict.json"
z-ai vision -p "$AUDIT_PROMPT" "${ARGS[@]}" -o "$VLM_OUT" 2>&1 | tail -1

echo "== VERDICT WRITTEN: $VLM_OUT =="
python3 - "$VLM_OUT" <<'PY'
import json, sys
try:
    d = json.load(open(sys.argv[1]))
    txt = d.get("content") or d.get("choices", [{}])[0].get("message", {}).get("content", "")
    print(txt[:1200])
except Exception as e:
    print("verdict parse:", e)
PY
