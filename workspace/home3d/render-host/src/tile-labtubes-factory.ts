// tile-labtubes factory — P1 asset 4/7 (owner-home-v3 mockup, quick-action tile 3)
//
// Pixel ground truth (workspace/home3d/crops/tile-labtubes.png, 112x119):
//   - 3 glossy test tubes, rounded-closed tops, x centers ~38/62/87px
//     (tube 3 slightly taller), tube w ~14-19px, total tube h ~58px.
//   - vivid RED liquid (#CC0C0D core, lighter #E03030 top gloss) filling the
//     lower ~60% of each tube; white glass above with pink-tint reflections.
//   - white rounded rack slab under the tubes (x19-106, y~87-105).
//   - soft gray ground shadow line.
//
// Route: FLAT-VECTOR (proven shield/hospital route) — MeshBasic + authored
// gradient CanvasTextures + host remapuv normalization. Unlit.
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

// capsule: hemispherical bottom, soft top (test-tube profile)
function tubeShape(w: number, h: number): THREE.Shape {
  const rTop = w * 0.34;
  const rBot = w * 0.5; // hemispherical bottom (test tube)
  const x = -w / 2;
  const y = -h / 2;
  const s = new THREE.Shape();
  s.moveTo(x + rBot, y);
  s.lineTo(x + w - rBot, y);
  s.quadraticCurveTo(x + w, y, x + w, y + rBot);
  s.lineTo(x + w, y + h - rTop);
  s.quadraticCurveTo(x + w, y + h, x + w - rTop, y + h);
  s.lineTo(x + rTop, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - rTop);
  s.lineTo(x, y + rBot);
  s.quadraticCurveTo(x, y, x + rBot, y);
  return s;
}

function roundedRectShape(w: number, h: number, r: number): THREE.Shape {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
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

const TUBE_W = 0.155;
const TUBE_H = 0.68;

type TubeSpec = {
  x: number;
  h: number;
  redTop: number; // fraction of tube height where liquid starts
};

const TUBES: TubeSpec[] = [
  { x: -0.30, h: 1.0, redTop: 0.38 },
  { x: 0.0, h: 1.0, redTop: 0.36 },
  { x: 0.30, h: 1.07, redTop: 0.34 }, // tube 3 slightly taller (pixel-verified)
];

export function createTileLabtubesModel(options: ProceduralModelOptions = {}): THREE.Group {
  const root = new THREE.Group();
  root.name = 'Tile Labtubes';
  const zFace = 0.05;

  // ground shadow — flat-core linear gradient (the proven hospital recipe)
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 256;
  shadowCanvas.height = 32;
  const sg = shadowCanvas.getContext('2d')!;
  const sgrad = sg.createLinearGradient(0, 0, 256, 0);
  sgrad.addColorStop(0, 'rgba(90,92,104,0)');
  sgrad.addColorStop(0.08, 'rgba(90,92,104,0.32)');
  sgrad.addColorStop(0.92, 'rgba(90,92,104,0.32)');
  sgrad.addColorStop(1, 'rgba(90,92,104,0)');
  sg.fillStyle = sgrad;
  sg.fillRect(0, 0, 256, 32);
  const vmask = sg.createLinearGradient(0, 0, 0, 32);
  vmask.addColorStop(0, 'rgba(0,0,0,0)');
  vmask.addColorStop(0.35, 'rgba(0,0,0,1)');
  vmask.addColorStop(1, 'rgba(0,0,0,1)');
  sg.globalCompositeOperation = 'destination-in';
  sg.fillStyle = vmask;
  sg.fillRect(0, 0, 256, 32);
  sg.globalCompositeOperation = 'source-over';
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.96, 0.10),
    new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(shadowCanvas),
      transparent: true,
      depthWrite: false,
    }),
  );
  shadow.name = 'labtubes-shadow';
  shadow.position.set(0, 0.22, 0.06);

  const RACK_Y0 = 0.24; // rack bottom

  // two-tier rack (pixel: rows 22-23 top rail where tubes pass, rows 24-26
  // base tray with leg gaps) + small legs
  const rack = part(
    'labtubes-rack',
    roundedRectShape(1.0, 0.17, 0.075),
    0.05,
    [[0, '#ffffff'], [0.55, '#f6f6f6'], [1, '#e8e8e8']],
    [0, RACK_Y0 + 0.085, 0.0],
  );
  root.add(part('labtubes-leg-left', roundedRectShape(0.15, 0.07, 0.025), 0.04, [[0, '#f2f2f2'], [1, '#dfdfdf']], [-0.36, RACK_Y0 + 0.035, -0.01]));
  root.add(part('labtubes-leg-right', roundedRectShape(0.15, 0.07, 0.025), 0.04, [[0, '#f2f2f2'], [1, '#dfdfdf']], [0.36, RACK_Y0 + 0.035, -0.01]));
  // rack inner lip (subtle gray line on top face)
  const rackLip = part(
    'labtubes-racklip',
    roundedRectShape(0.86, 0.045, 0.02),
    0.02,
    [[0, '#efefef'], [1, '#dedede']],
    [0, RACK_Y0 + 0.165, 0.045],
  );

  // tubes: white glass capsule + flared rim cap + red liquid inset
  for (let i = 0; i < TUBES.length; i++) {
    const t = TUBES[i];
    const h = TUBE_H * t.h;
    const tubeCenterY = RACK_Y0 + 0.085 + h / 2 + 0.10; // tubes sink into rack
    root.add(part(
      `labtubes-glass-${i + 1}`,
      tubeShape(TUBE_W, h),
      0.04,
      [[0, '#ffffff'], [0.5, '#f5f4f4'], [0.8, '#f2ecec'], [1, '#e9e9e9']],
      [t.x, tubeCenterY, zFace],
    ));
    // flared trumpet rim: wide lip ring + cap (pixel: tube tops wider→narrow)
    root.add(part(
      `labtubes-rim-${i + 1}`,
      roundedRectShape(TUBE_W * 1.78, 0.075, 0.03),
      0.03,
      [[0, '#ffffff'], [1, '#ececec']],
      [t.x, tubeCenterY + h / 2 - 0.015, zFace + 0.008],
    ));
    root.add(part(
      `labtubes-rimring-${i + 1}`,
      roundedRectShape(TUBE_W * 1.3, 0.045, 0.018),
      0.026,
      [[0, '#ffffff'], [1, '#f0f0f0']],
      [t.x, tubeCenterY + h / 2 - 0.052, zFace + 0.012],
    ));
    // liquid: inset capsule in lower ~60%, meniscus fade at top
    const liqH = h * (1 - t.redTop);
    const liqCenterY = tubeCenterY - h / 2 + liqH / 2 + 0.01;
    root.add(part(
      `labtubes-liquid-${i + 1}`,
      tubeShape(TUBE_W * 0.82, liqH),
      0.02,
      [[0, '#f8cccc'], [0.08, '#ee9a9a'], [0.22, '#dd3030'], [0.7, '#c50e0f'], [1, '#b00a0b']],
      [t.x, liqCenterY, zFace + 0.02],
    ));
    // gloss: soft vertical highlight on the UPPER GLASS only (v3's full-height
    // band read as a 'rod through the red' — mockup gloss lives on the glass)
    root.add(part(
      `labtubes-gloss-${i + 1}`,
      roundedRectShape(TUBE_W * 0.34, h * 0.40, TUBE_W * 0.17),
      0.012,
      [[0, '#ffffff'], [0.35, '#f6f6f6'], [0.7, '#efefef'], [1, '#e8e8e8']],
      [t.x - TUBE_W * 0.14, tubeCenterY + h * 0.24, zFace + 0.03],
    ));
  }

  root.add(shadow);
  root.add(rack);
  root.add(rackLip);

  if (options.wireframe) {
    root.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        ((o as THREE.Mesh).material as THREE.MeshBasicMaterial).wireframe = true;
      }
    });
  }
  return root;
}

export function frameTileLabtubesCamera(
  camera: THREE.PerspectiveCamera,
  object: THREE.Object3D,
  options: { margin?: number; azimuthDeg?: number; elevationDeg?: number } = {},
): void {
  const box = new THREE.Box3().setFromObject(object);
  if (box.isEmpty()) return;
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const margin = options.margin ?? 1.06;
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
