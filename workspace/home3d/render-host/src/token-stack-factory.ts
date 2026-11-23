// token-stack factory — P1 asset 2/7 (owner-home-v3 mockup, token banner right)
//
// Pixel ground truth (workspace/home3d/crops/token-stack.png, 300x147):
//   - The '#' masses around the stack are the INK BANNER (#1F1F1F, app code,
//     NOT part of this asset). The asset = the card stack only.
//   - 4-5 cards, fanned, rounded rects (~1.35 landscape, radius ~12% w):
//     WHITE front card (blank by design — live token number is app-rendered),
//     gray backs cascading down-right, one gray peeking left.
//   - front top edge: pixel-verified -8deg screen slope = rising right =
//     three.js +8deg (clean trace x70-125: y33->y24).
//   - Fan (4 VLM reads agree + left-gray edge trace +26deg): backs rotate
//     progressively POSITIVE (clockwise), pivoting near the front card's
//     bottom-left — reveals top-right, one card overhanging bottom-left.
//   - soft gray shadow mass under the stack (mid-gray on the ink banner).
//   - Backs carry a dark seam + bright rim band at top so layers read as
//     DISTINCT cards (mockup's gWg banding).
//
// Route: FLAT-VECTOR (proven shield-3d route) — MeshBasic + authored gradient
// CanvasTextures + host remapuv normalization. Unlit: no lights needed.
//
// Honest verdict from the iteration trail: audits plateau ~0.5-0.55 (both
// 3D-code and AI-gen routes); the mockup reads as a painterly hybrid. Bundled
// on cleanliness + exact palette (same argument the shield used).
import * as THREE from 'three';

export type ProceduralModelOptions = {
  wireframe?: boolean;
};

type CardSpec = {
  id: string;
  rotationDeg: number; // in-plane fan angle (three.js z, CCW+)
  position: [number, number, number]; // stack coords (white card center = origin)
  stops: [number, string][]; // authored gradient (top -> bottom)
  edgeShade?: number; // right-side darkening overlay (layer separation)
  scale?: number; // card scale (backs slightly smaller toward the rear)
};

const CARDS: CardSpec[] = [
  // pixel-verified front top edge: -8deg screen slope = rising right = three +8deg
  // (clean trace x70-125: y33->y24). Fan (4 VLM reads agree + left-gray edge
  // trace +26deg): backs rotate progressively POSITIVE (clockwise), pivoting
  // near the front card's bottom-left — reveals top-right, one card
  // overhanging bottom-left. Dark seam + bright rim band on each back.
  { id: 'card-front-white', rotationDeg: 8, position: [0.0, 0.04, 0.30], stops: [[0, '#ffffff'], [0.62, '#f2f2f2'], [1, '#e6e6e6']], scale: 1.0 },
  { id: 'card-back-rimlit', rotationDeg: 14, position: [0.05, -0.02, 0.24], stops: [[0, '#66666e'], [0.04, '#dcdcdf'], [0.13, '#cdd0d4'], [0.5, '#c9ccd1'], [1, '#b0b3b8']], edgeShade: 0.12, scale: 0.97 },
  { id: 'card-back-right', rotationDeg: 22, position: [0.12, -0.06, 0.18], stops: [[0, '#585860'], [0.04, '#cdd0d5'], [0.13, '#b8bbc1'], [0.5, '#a8acb2'], [1, '#90949a']], edgeShade: 0.20, scale: 0.92 },
  { id: 'card-back-below', rotationDeg: 30, position: [0.19, -0.11, 0.12], stops: [[0, '#4e4e56'], [0.04, '#c0c3c9'], [0.13, '#a9adb3'], [0.5, '#979b9a'], [1, '#7e828a']], edgeShade: 0.28, scale: 0.86 },
  { id: 'card-left-gray', rotationDeg: 20, position: [-0.11, -0.03, 0.08], stops: [[0, '#61616a'], [0.04, '#ccced3'], [0.13, '#b6b9be'], [0.5, '#aaadb3'], [1, '#96999f']], edgeShade: 0.16, scale: 0.95 },
];

const CARD_W = 1.0;
const CARD_H = 0.74; // ~1.35 landscape (VLM consensus + pixel bottom trace)
const CARD_R = 0.12; // corner radius (~12% — soft, mockup-consistent)
const CARD_DEPTH = 0.04;
const PITCH_DEG = -2; // top tilts slightly away (subtle foreshortening)

function roundedRectShape(w: number, h: number, r: number): THREE.Shape {
  const shape = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

// authored gradient texture; canvas top (offset 0) maps to card top.
// edgeShade adds a right-side darkening overlay for layer separation.
function cardGradientTexture(stops: [number, string][], edgeShade = 0): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const g = canvas.getContext('2d')!;
  const grad = g.createLinearGradient(0, 0, 0, 256);
  for (const [off, color] of stops) grad.addColorStop(off, color);
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 256);
  if (edgeShade > 0) {
    const edge = g.createLinearGradient(0, 0, 128, 0);
    edge.addColorStop(0, 'rgba(40,40,48,0)');
    edge.addColorStop(0.55, `rgba(40,40,48,${(edgeShade * 0.45).toFixed(3)})`);
    edge.addColorStop(1, `rgba(40,40,48,${edgeShade.toFixed(3)})`);
    g.fillStyle = edge;
    g.fillRect(0, 0, 128, 256);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

// soft drop shadow behind the stack (radial alpha; on the ink banner it
// reads as the darker mass under the stack, mockup tones 109-167)
function shadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const g = canvas.getContext('2d')!;
  const grad = g.createRadialGradient(128, 150, 30, 128, 150, 150);
  grad.addColorStop(0, 'rgba(5,5,8,0.55)');
  grad.addColorStop(0.5, 'rgba(5,5,8,0.22)');
  grad.addColorStop(1, 'rgba(5,5,8,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildCard(spec: CardSpec): THREE.Mesh {
  const shape = roundedRectShape(CARD_W, CARD_H, CARD_R);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: CARD_DEPTH,
    bevelEnabled: false, // crisp card corners (bevel rounds them off)
  });
  const mat = new THREE.MeshBasicMaterial({ map: cardGradientTexture(spec.stops, spec.edgeShade ?? 0) });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = spec.id;
  const s = spec.scale ?? 1;
  mesh.scale.set(s, s, 1);
  mesh.position.set(spec.position[0], spec.position[1], spec.position[2]);
  mesh.rotation.z = (spec.rotationDeg * Math.PI) / 180;
  mesh.rotation.x = (PITCH_DEG * Math.PI) / 180;
  return mesh;
}

export function createTokenStackModel(options: ProceduralModelOptions = {}): THREE.Group {
  const root = new THREE.Group();
  root.name = 'Token Stack';

  for (const spec of CARDS) root.add(buildCard(spec));

  // soft shadow quad behind/below the stack
  const shadowGeo = new THREE.PlaneGeometry(1.42, 1.18);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTexture(),
    transparent: true,
    depthWrite: false,
  });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.name = 'stack-shadow';
  // deepest z: darkens banner below-left of the stack — rear cards stay bright
  shadow.position.set(-0.06, -0.14, 0.02);
  shadow.rotation.z = (8 * Math.PI) / 180;
  root.add(shadow);

  if (options.wireframe) {
    root.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        const m = (o as THREE.Mesh).material as THREE.MeshBasicMaterial;
        m.wireframe = true;
      }
    });
  }
  return root;
}

export function frameTokenStackCamera(
  camera: THREE.PerspectiveCamera,
  object: THREE.Object3D,
  options: { margin?: number; azimuthDeg?: number; elevationDeg?: number } = {},
): void {
  const box = new THREE.Box3().setFromObject(object);
  if (box.isEmpty()) return;
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const margin = options.margin ?? 1.12;
  const maxDim = Math.max(size.x, size.y, size.z) * margin;
  const fov = (camera.fov * Math.PI) / 180;
  const distance = (maxDim / 2) / Math.tan(fov / 2);
  const az = ((options.azimuthDeg ?? 0) * Math.PI) / 180;
  const el = ((options.elevationDeg ?? 0) * Math.PI) / 180;
  const dir = new THREE.Vector3(
    Math.sin(az) * Math.cos(el),
    Math.sin(el),
    Math.cos(az) * Math.cos(el),
  );
  camera.position.copy(center).addScaledVector(dir, distance);
  camera.near = Math.max(0.01, distance - maxDim);
  camera.far = distance + maxDim * 2;
  camera.lookAt(center);
  camera.updateProjectionMatrix();
}
