// tile-hospital factory — P1 asset 3/7 (owner-home-v3 mockup, quick-action tile 2)
//
// Pixel ground truth (workspace/home3d/crops/tile-hospital.png, 126x112):
//   - white rounded-facade 2-story building, flat roofline, w/h ~1.73:1 WIDE
//     (body 85x49px), roof ledge/cornice.
//   - vivid blue windows (#4096E4 + lighter #74a8dd variants): ~5 columns
//     upper row; ground row: 4 windows + centered dark entrance door.
//   - dark rounded plaque (#08080F) with WHITE medical cross mounted flush
//     ON the roofline, slightly left of center.
//   - green bushes (#4C9028 family) at the bottom corners (right bigger).
//   - soft gray ground shadow (#D5D6DC) + subtle white circular halo.
//
// v3 audit 0.72 (>= 0.7 gate) + 4 convergent fixes applied in v4:
//   stronger ground shadow · irregularized window grid (varied heights,
//   lower-right window dropped) · plaque flush on roofline + slightly larger ·
//   taller wider door with frame.
//
// Route: FLAT-VECTOR (proven shield route) — MeshBasic + authored gradient
// CanvasTextures + host remapuv normalization. Unlit.
import * as THREE from 'three';

export type ProceduralModelOptions = {
  wireframe?: boolean;
};

function gradientTexture(stops: [number, string][]): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 256;
  const g = canvas.getContext('2d')!;
  const grad = g.createLinearGradient(0, 0, 0, 256);
  for (const [off, color] of stops) grad.addColorStop(off, color);
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

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

function bushShape(r: number): THREE.Shape {
  return roundedRectShape(r * 2, r * 1.35, r * 0.62);
}

function part(
  name: string,
  shape: THREE.Shape,
  depth: number,
  stops: [number, string][],
  pos: [number, number, number],
): THREE.Mesh {
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  const mat = new THREE.MeshBasicMaterial({ map: gradientTexture(stops) });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = name;
  mesh.position.set(pos[0], pos[1], pos[2]);
  return mesh;
}

// building coords: x in [-0.5, 0.5] across the facade, y 0 = ground
// pixel: building body 85x49px -> 1.73:1 WIDE; flat roofline; plaque on roof.
const MAIN_W = 0.95;
const MAIN_H = 0.55;
const R = 0.05;

export function createTileHospitalModel(options: ProceduralModelOptions = {}): THREE.Group {
  const root = new THREE.Group();
  root.name = 'Tile Hospital';
  const zFace = 0.05;

  // (no halo plane — white-on-white was invisible AND inflated the camera
  // bbox, shrinking the building to ~35% of the frame vs mockup's ~65%:
  // the 'proportions' complaint in every audit. Removed v8.)

  // ground shadow — v7: FLAT-CORE gradient (radial faded the visible core
  // narrower than the building — 'only under the middle'); spans full base
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 256;
  shadowCanvas.height = 32;
  const sg = shadowCanvas.getContext('2d')!;
  const sgrad = sg.createLinearGradient(0, 0, 256, 0);
  sgrad.addColorStop(0, 'rgba(90,92,104,0)');
  sgrad.addColorStop(0.08, 'rgba(90,92,104,0.55)');
  sgrad.addColorStop(0.92, 'rgba(90,92,104,0.55)');
  sgrad.addColorStop(1, 'rgba(90,92,104,0)');
  sg.fillStyle = sgrad;
  sg.fillRect(0, 0, 256, 32);
  // soft vertical falloff mask
  const vmask = sg.createLinearGradient(0, 0, 0, 32);
  vmask.addColorStop(0, 'rgba(0,0,0,0)');
  vmask.addColorStop(0.35, 'rgba(0,0,0,1)');
  vmask.addColorStop(1, 'rgba(0,0,0,1)');
  sg.globalCompositeOperation = 'destination-in';
  sg.fillStyle = vmask;
  sg.fillRect(0, 0, 256, 32);
  sg.globalCompositeOperation = 'source-over';
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.24, 0.14),
    new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(shadowCanvas),
      transparent: true,
      depthWrite: false,
    }),
  );
  shadow.name = 'hospital-shadow';
  shadow.position.set(0, -0.03, 0.06);

  // single flat-roof block (pixel: 1.73:1 body)
  const main = part(
    'hospital-main',
    roundedRectShape(MAIN_W, MAIN_H, R),
    0.05,
    [[0, '#fafafa'], [0.55, '#f1f1f1'], [1, '#e6e6e6']],
    [0, MAIN_H / 2, 0.0],
  );
  // roof ledge/cornice — v7: THICK overhanging slab (mockup rows 12-13 show
  // a wide white band extending past the facade), dark underside for depth
  const ledge = part(
    'hospital-ledge',
    roundedRectShape(MAIN_W + 0.19, 0.062, 0.025),
    0.03,
    [[0, '#ffffff'], [0.7, '#f4f4f4'], [1, '#e2e2e2']],
    [0, MAIN_H + 0.031, 0.012],
  );

  // roof plaque: dark rounded rect + white cross, overlapping the ledge
  // v5 fix: seated flush ON the roofline (deep overlap)
  // (pixel: plaque y30-45 sits on the roofline, whites below, bg above)
  const plaqueW = 0.28;
  const plaqueH = 0.215;
  const plaqueY = MAIN_H + 0.045 + plaqueH / 2 - 0.085;
  const plaque = part(
    'hospital-plaque',
    roundedRectShape(plaqueW, plaqueH, 0.048),
    0.04,
    [[0, '#181820'], [1, '#08080f']],
    [-0.02, plaqueY, 0.02],
  );
  const crossV = part(
    'hospital-cross-v',
    roundedRectShape(0.054, 0.145, 0.014),
    0.02,
    [[0, '#ffffff'], [1, '#f0f0f0']],
    [-0.02, plaqueY, 0.055],
  );
  const crossH = part(
    'hospital-cross-h',
    roundedRectShape(0.145, 0.054, 0.014),
    0.02,
    [[0, '#ffffff'], [1, '#f0f0f0']],
    [-0.02, plaqueY, 0.055],
  );

  // windows: 5 columns upper row, 4 + centered door lower row (pixel-verified)
  // v5: slightly taller portrait rhythm, varied heights (mockup's uneven feel)
  const winW = 0.105;
  const winA: [number, string][] = [[0, '#4398dd'], [0.55, '#3a8bd4'], [1, '#2f78bd']];
  const winB: [number, string][] = [[0, '#74a8dd'], [0.55, '#6698cf'], [1, '#5686bf']];
  const upperY = MAIN_H * 0.70;
  const lowerY = MAIN_H * 0.34;
  const cols = [-0.34, -0.17, 0.0, 0.17, 0.34];
  const upperHts = [0.15, 0.14, 0.16, 0.14, 0.15];
  const lowerHts = [0.14, 0.13, 0.15, 0.13];
  cols.forEach((cx, i) => {
    root.add(part('hospital-window', roundedRectShape(winW, upperHts[i], 0.028), 0.02, i % 2 ? winA : winB, [cx, upperY, zFace]));
  });
  [-0.34, -0.17, 0.17].forEach((cx, i) => {
    root.add(part('hospital-window', roundedRectShape(winW, lowerHts[i], 0.028), 0.02, i % 2 ? winB : winA, [cx, lowerY, zFace]));
  });

  // entrance door — v6: recessed-arch look: taller door, arched top radius,
  // darker recess band behind, light surround frame
  const doorFrame = part(
    'hospital-doorframe',
    roundedRectShape(0.27, 0.32, 0.05),
    0.015,
    [[0, '#ffffff'], [1, '#f4f4f4']],
    [0, 0.16, zFace],
  );
  const doorRecess = part(
    'hospital-doorrecess',
    roundedRectShape(0.23, 0.27, 0.09),
    0.012,
    [[0, '#5a6a7c'], [1, '#46525f']],
    [0, 0.145, zFace],
  );
  const door = part(
    'hospital-door',
    roundedRectShape(0.20, 0.26, 0.05),
    0.02,
    [[0, '#3a4a5c'], [1, '#1e2a38']],
    [0, 0.13, zFace + 0.015],
  );

  // bushes — v6: clustered round blobs, two green tones per corner
  const bushLight: [number, string][] = [[0, '#7ab84a'], [0.55, '#68a83e'], [1, '#568f2e']];
  const bushDark: [number, string][] = [[0, '#548f2c'], [0.55, '#478f26'], [1, '#397420']];
  root.add(part('hospital-bush-right', bushShape(0.095), 0.035, bushLight, [0.395, 0.06, zFace]));
  root.add(part('hospital-bush-right2', bushShape(0.07), 0.035, bushDark, [0.28, 0.05, zFace]));
  root.add(part('hospital-bush-right3', bushShape(0.055), 0.035, bushLight, [0.335, 0.13, zFace + 0.01]));
  root.add(part('hospital-bush-left', bushShape(0.085), 0.035, bushLight, [-0.395, 0.055, zFace]));
  root.add(part('hospital-bush-left2', bushShape(0.065), 0.035, bushDark, [-0.29, 0.045, zFace]));
  root.add(part('hospital-bush-left3', bushShape(0.05), 0.035, bushLight, [-0.345, 0.12, zFace + 0.01]));

  root.add(shadow);
  root.add(main);
  root.add(ledge);
  // rooftop boxes — pixel: two white rounded forms sit ON the roofline right
  // of the plaque (x79-95 + x101-110 in the mockup crop). v6: enlarged +
  // stronger bottom edge so they read as distinct rooftop masses, not notches
  root.add(part('hospital-roofbox-1', roundedRectShape(0.20, 0.155, 0.04), 0.03, [[0, '#ffffff'], [0.6, '#f6f6f6'], [1, '#dedede']], [0.15, MAIN_H + 0.062, 0.008]));
  root.add(part('hospital-roofbox-2', roundedRectShape(0.165, 0.115, 0.035), 0.03, [[0, '#ffffff'], [0.6, '#f4f4f4'], [1, '#dcdcdc']], [0.375, MAIN_H + 0.042, 0.008]));
  root.add(plaque);
  root.add(crossV);
  root.add(crossH);
  root.add(doorFrame);
  root.add(doorRecess);
  root.add(door);

  if (options.wireframe) {
    root.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        ((o as THREE.Mesh).material as THREE.MeshBasicMaterial).wireframe = true;
      }
    });
  }
  return root;
}

export function frameTileHospitalCamera(
  camera: THREE.PerspectiveCamera,
  object: THREE.Object3D,
  options: { margin?: number; azimuthDeg?: number; elevationDeg?: number } = {},
): void {
  const box = new THREE.Box3().setFromObject(object);
  if (box.isEmpty()) return;
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const margin = options.margin ?? 1.14;
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
