#!/usr/bin/env python3
"""P1-2 shield: author the real componentTree/materials/featureReviewTargets."""
import json, math, copy

P = 'workspace/home3d/runs/shield-3d/object-sculpt-spec.json'
spec = json.load(open(P))

def arc(cx, cy, r, a0, a1, steps=6):
    """emit arc points from angle a0 to a1 (radians, CCW)"""
    return [(cx + r*math.cos(a0 + (a1-a0)*i/steps), cy + r*math.sin(a0 + (a1-a0)*i/steps)) for i in range(steps+1)]

# ---- shield silhouette profile (units: x -0.43..0.43, y -0.5..0.5) ----
pts = []
pts.append((0.0, 0.5))                      # top center
pts += arc(0.16, 0.44, 0.075, 2.6, 1.75)   # right shoulder inner
pts += arc(0.35, 0.34, 0.075, 2.45, 1.2)   # right shoulder outer sweep
pts += [(0.43, 0.14), (0.43, 0.0), (0.43, -0.14), (0.42, -0.26)]  # side taper
pts += arc(0.30, -0.38, 0.10, 2.0, 0.85)  # lower-right curve toward point
pts += arc(0.11, -0.46, 0.08, 2.3, 1.2)    # approach to bottom point
pts.append((0.0, -0.5))                     # bottom point (soft)
# mirror left (exclude endpoints dupes)
pts += [(round(-x,4), round(y,4)) for x, y in pts[-2::-1]][0:0] or []
left = [(round(-x,4), round(y,4)) for x, y in pts[1:-1]][::-1]
pts = pts + left
shield_profile = [[round(x,4), round(y,4)] for x, y in pts]

# ---- rounded plus-cross profile (arm half A, bar half B) ----
A, B = 0.165, 0.060
rt, ri = 0.045, 0.024
c = []
# right arm: top edge of horizontal bar
c.append((B, A-rt))
c += arc(B-rt, A-rt, rt, math.pi/2, 0)               # top-right tip corner
c.append((A-rt, A))
c += arc(A-rt, A-rt, rt, math.pi/2, 0)               # right-top outer corner
c.append((A, B+ri))
c += arc(A-ri, B+ri, ri, 0, -math.pi/2)              # right inner fillet
c.append((B+ri, B))
# bottom-right arm edge
c += arc(B+ri, -B+ri, ri, math.pi/2, 0)              # hmm - inner fillets mirrored below
c += arc(B-rt, -A+rt, rt, 0, -math.pi/2)
c.append((A-rt, -A))
c += arc(A-rt, -A+rt, rt, 0, -math.pi/2)
c.append((A, -B-ri))
c += arc(A-ri, -B-ri, ri, 0, -math.pi/2)
c.append((B, -(A-rt)))
# mirror to complete (x-mirror reversed)
mirror = [(round(-x,4), round(y,4)) for x, y in c][::-1]
cross = c + mirror
# dedupe near-duplicates
dedup = []
for p in cross:
    if not dedup or (abs(p[0]-dedup[-1][0]) > 1e-3 or abs(p[1]-dedup[-1][1]) > 1e-3):
        dedup.append((round(p[0],4), round(p[1],4)))
cross_profile = [list(p) for p in dedup]
print(f"shield profile: {len(shield_profile)} pts; cross profile: {len(cross_profile)} pts")

# ---- componentTree ----
seed = spec['componentTree'][0]
def comp(cid, name, level, importance, primitive, topology, rationale, material, parent, dims, pos, profile, local_features):
    c = copy.deepcopy(seed)
    c.update(id=cid, name=name, level=level, importance=importance, confidence=0.85,
             primitive=primitive, topologyClass=topology, topologyRationale=rationale,
             material=material, materialLayers=[material], parent=parent)
    c['dimensions'] = {"width": dims[0], "height": dims[1], "depth": dims[2], "units": "relative", "confidence": 0.85}
    c['transform'] = {"position": pos, "rotation": [0,0,0], "scale": [1,1,1]}
    c['geometryDescriptor'] = {
        "topologyIntent": "extruded profile with dense curved outline for soft claymorphic edges",
        "edgeTreatment": {"type": "rounded-via-profile", "bevelRadius": 0.03, "segments": 6},
        "profile2D": {"points": profile, "depth": dims[2]},
        "deformationStack": [], "uvStrategy": "generated procedural coordinates",
        "normalStrategy": "vertex normals from generated geometry"
    }
    c['localFeatures'] = local_features
    c['evidenceRefs'] = ["full-object"]
    if parent is not None:
        c['attachment'] = {"parentSocket": "face-front-center", "contactType": "embed", "embedDepth": 0.012, "confidence": 0.85}
    else:
        c['attachment'] = None
    return c

shield_body = comp('shieldBody', 'Shield body', 'macro', 1.0, 'extrude', 'continuous-sculpt',
    'single smoothly-varying extruded shield profile (curved shoulders, tapered sides, soft bottom point) - continuous volume, not an assembled panel',
    'shieldBlue', None, [1.0, 1.2, 0.14], [0, 0, 0], shield_profile,
    [
      {"id": "radial-blue-gradient", "kind": "material", "description": "light cerulean upper-center fading to deep blue-violet at lateral and bottom edges", "mapsTo": "shieldBlue.colorGradient"},
      {"id": "rim-light-stroke", "kind": "material", "description": "light satin stroke along top curve and shoulders", "mapsTo": "shieldBlue gradient stop + clearcoat response"},
      {"id": "extrusion-side-wall", "kind": "geometry", "description": "edge thickness visible as darker blue at silhouette", "mapsTo": "profile depth 0.14"}
    ])

cross_emblem = comp('crossEmblem', 'White medical cross emblem', 'macro', 0.95, 'extrude', 'continuous-sculpt',
    'single extruded rounded plus-cross profile (two fused bars, rounded tips, rounded inner fillets) - one continuous volume',
    'crossWhite', 'shieldBody', [0.33, 0.33, 0.055], [0, 0.015, 0.062], cross_profile,
    [
      {"id": "rounded-tips", "kind": "geometry", "description": "all four arm tips rounded (radius ~0.045), inner concave fillets ~0.024", "mapsTo": "profile arcs"},
      {"id": "ao-seam", "kind": "material", "description": "subtle ambient occlusion seam where cross meets shield face", "mapsTo": "renderer AO"}
    ])

spec['componentTree'] = [shield_body, cross_emblem]

# ---- materials ----
mseed = spec['materials'][0]
shieldBlue = copy.deepcopy(mseed)
shieldBlue.update(id='shieldBlue', name='Glossy blue-violet gradient shield face', baseColor='#6B5CE7', color='#6B5CE7')
shieldBlue['albedo'] = {"dominant": "#6B5CE7", "secondary": ["#8B7BF0", "#4032B4"],
  "samplingNotes": "radial gradient: light #8B7BF0 upper-center, mid #6B5CE7, deep #4032B4 at lateral+bottom edges (VLM layer-6 observed stops)"}
shieldBlue['colorVariation'] = {"palette": ["#6B5CE7"], "pattern": "smooth-radial-gradient", "amplitude": 0.0, "heightCorrelation": 0.0}
shieldBlue['colorGradient'] = {"type": "radial", "axis": [0.5, 0.62], "stops": [
  {"offset": 0.0, "color": "rgba(139,123,240,1)"},
  {"offset": 0.55, "color": "rgba(107,92,231,1)"},
  {"offset": 1.0, "color": "rgba(64,50,180,1)"}]}
shieldBlue['roughness'] = {"base": 0.15, "variation": 0.0, "map": "flat", "localResponse": "uniform gloss - no cavity variation on a smooth claymorphic face"}
for band in shieldBlue['surfaceFrequencyBands']:
    band['amplitude'] = 0.0
shieldBlue['clearcoat'] = {"base": {"amount": 1.0}}
shieldBlue['clearcoatRoughness'] = {"base": 0.12}
shieldBlue['envMapIntensity'] = 1.0

crossWhite = copy.deepcopy(mseed)
crossWhite.update(id='crossWhite', name='Glossy white cross', baseColor='#FFFFFF', color='#FFFFFF')
crossWhite['albedo'] = {"dominant": "#FFFFFF", "secondary": ["#F2F2F7"], "samplingNotes": "uniform white, gloss finish"}
crossWhite['colorVariation'] = {"palette": ["#FFFFFF"], "pattern": "flat", "amplitude": 0.0, "heightCorrelation": 0.0}
crossWhite['roughness'] = {"base": 0.18, "variation": 0.0, "map": "flat", "localResponse": "uniform"}
for band in crossWhite['surfaceFrequencyBands']:
    band['amplitude'] = 0.0
crossWhite['clearcoat'] = {"base": {"amount": 0.7}}
crossWhite['clearcoatRoughness'] = {"base": 0.25}
crossWhite['textureless'] = {"declared": True, "reason": "uniform glossy white with no texture detail; synthesising mottling would deviate from reference"}
crossWhite['normal'] = {"pattern": "none", "strength": 0.0}

spec['materials'] = [shieldBlue, crossWhite]

# ---- featureReviewTargets (real) ----
spec['featureReviewTargets'] = [
  {"id": "shield-silhouette", "name": "Pointed-bottom shield silhouette with rounded shoulders (aspect 1:1.2)", "tier": "critical", "passIds": ["blockout", "form-refinement"], "minimumScore": 0.8, "mustPass": True, "componentRefs": ["shieldBody"], "evidenceRefs": ["full-object"]},
  {"id": "cross-placement", "name": "White cross centered, slightly above geometric center, ~1/3 face size, proud with slight embed", "tier": "critical", "passIds": ["structural-pass", "form-refinement"], "minimumScore": 0.8, "mustPass": True, "componentRefs": ["crossEmblem"], "evidenceRefs": ["full-object"]},
  {"id": "blue-radial-gradient", "name": "Radial blue gradient: cerulean upper-center -> deep blue-violet edges/bottom", "tier": "critical", "passIds": ["material-pass"], "minimumScore": 0.8, "mustPass": True, "componentRefs": ["shieldBody"], "evidenceRefs": ["full-object"]},
  {"id": "rim-light-stroke", "name": "Light stroke along top curve and shoulders", "tier": "important", "passIds": ["material-pass"], "minimumScore": 0.7, "mustPass": True, "componentRefs": ["shieldBody"], "evidenceRefs": ["full-object"]},
  {"id": "gloss-clearcoat", "name": "Gloss specular band across upper region (clearcoat response)", "tier": "important", "passIds": ["material-pass", "lighting-pass"], "minimumScore": 0.7, "mustPass": True, "componentRefs": ["shieldBody", "crossEmblem"], "evidenceRefs": ["full-object"]}
]
json.dump(spec, open(P, 'w'), indent=1)
print("spec authored: 2 components, 2 materials, 5 real featureReviewTargets")
