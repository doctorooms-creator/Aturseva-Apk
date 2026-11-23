// tile-video factory — P1 asset 5/7 (owner-home-v3 mockup, quick-action tile 4)
//
// Pixel ground truth (workspace/home3d/crops/tile-video.png, 133x105):
//   - laptop SCREEN: dark bezel (#101010) rounded rect x41-107 y30-75
//     (aspect ~1.47), periwinkle-blue screen fill (#80A0F0 family:
//     (128,160,240)/(112,144,240)), with a WHITE rounded 'avatar window'
//     inside (x65-81, y41-68) — the video-call UI read.
//   - laptop BASE: white/very-light trapezoid slab widening toward the
//     viewer (screen-width top edge -> wider bottom), keyboard hints
//     (light-gray + dark key rows), rounded front corners.
//   - soft shadow under the base.
//
// Route: FLAT-VECTOR (proven route) — MeshBasic + authored gradient
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

// trapezoid: laptop base widening toward the viewer
function trapezoidShape(topW: number, botW: number, h: number): THREE.Shape {
  const s = new THREE.Shape();
  const ht = topW / 2;
  const hb = botW / 2;
  s.moveTo(-ht, h / 2);
  s.lineTo(ht, h / 2);
  s.lineTo(hb, -h / 2);
  s.lineTo(-hb, -h / 2);
  s.closePath();
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

const SCREEN_W = 0.96;
const SCREEN_H = 0.50;
const BASE_TOP = 0.98; // base top edge width (= screen width)
const BASE_BOT = 1.08; // base bottom edge (wider, toward viewer)

export function createTileVideoModel(options: ProceduralModelOptions = {}): THREE.Group {
  const root = new THREE.Group();
  root.name = 'Tile Video';
  const z = 0.04;

  // ground shadow — flat-core linear (proven recipe)
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 256;
  shadowCanvas.height = 32;
  const sg = shadowCanvas.getContext('2d')!;
  const sgrad = sg.createLinearGradient(0, 0, 256, 0);
  sgrad.addColorStop(0, 'rgba(90,92,104,0)');
  sgrad.addColorStop(0.08, 'rgba(90,92,104,0.38)');
  sgrad.addColorStop(0.92, 'rgba(90,92,104,0.38)');
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
    new THREE.PlaneGeometry(1.34, 0.15),
    new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(shadowCanvas),
      transparent: true,
      depthWrite: false,
    }),
  );
  shadow.name = 'video-shadow';
  shadow.position.set(0, 0.09, 0.06);

  // laptop base: warm-white trapezoid slab + keyboard
  const base = part(
    'video-base',
    trapezoidShape(BASE_TOP, BASE_BOT, 0.34),
    0.04,
    [[0, '#ffffff'], [0.5, '#f7f6f4'], [1, '#e6e4e1']],
    [0, 0.30, 0.0],
  );
  // keyboard: light deck + thin dark key rows (mockup: white base, dark keys)
  const kb = part(
    'video-keyboard',
    trapezoidShape(0.78, 0.90, 0.15),
    0.015,
    [[0, '#f4f3f0'], [0.5, '#eceae6'], [1, '#dfddd8']],
    [0, 0.325, 0.045],
  );
  for (let k = 0; k < 4; k++) {
    root.add(part(
      `video-keyrow-${k}`,
      trapezoidShape(0.70 + k * 0.03, 0.78 + k * 0.03, 0.018),
      0.008,
      [[0, '#2e2e36'], [1, '#1e1e24']],
      [0, 0.36 - k * 0.032, 0.052],
    ));
  }
  const trackpad = part(
    'video-trackpad',
    trapezoidShape(0.26, 0.30, 0.07),
    0.01,
    [[0, '#f0efec'], [1, '#dedcd9']],
    [0, 0.195, 0.052],
  );
  // palm rest strip below keyboard
  const palm = part(
    'video-palmrest',
    trapezoidShape(0.84, 1.02, 0.09),
    0.015,
    [[0, '#faf9f7'], [1, '#ecebe8']],
    [0, 0.165, 0.045],
  );

  // screen: thin silver frame + dark inner bezel + blue screen + avatar bubble
  root.add(part(
    'video-frame',
    roundedRectShape(SCREEN_W * 1.03, SCREEN_H * 1.10, 0.045),
    0.02,
    [[0, '#e9e9ea'], [0.5, '#d7d7da'], [1, '#c4c4c8']],
    [0, 0.635, 0.015],
  ));
  const bezel = part(
    'video-bezel',
    roundedRectShape(SCREEN_W, SCREEN_H, 0.04),
    0.02,
    [[0, '#222228'], [0.5, '#14141a'], [1, '#1a1a20']],
    [0, 0.635, 0.03],
  );
  const screen = part(
    'video-screen',
    roundedRectShape(SCREEN_W * 0.96, SCREEN_H * 0.90, 0.028),
    0.015,
    [[0, '#7e9cf4'], [0.35, '#7090f0'], [0.75, '#6084ec'], [1, '#5478e4']],
    [0, 0.635, 0.048],
  );
  // white avatar bubble (bigger, rounder) + subtle person glyph
  const avatar = part(
    'video-avatar',
    roundedRectShape(0.30, 0.30, 0.09),
    0.012,
    [[0, '#ffffff'], [0.75, '#fbfbfb'], [1, '#f4f4f4']],
    [-0.04, 0.635, 0.06],
  );
  root.add(part(
    'video-avatar-head',
    roundedRectShape(0.09, 0.09, 0.045),
    0.008,
    [[0, '#c8d2ec'], [1, '#b4c0e4']],
    [-0.04, 0.675, 0.07],
  ));
  root.add(part(
    'video-avatar-body',
    roundedRectShape(0.16, 0.075, 0.037),
    0.008,
    [[0, '#c0cae6'], [1, '#aab8e0']],
    [-0.04, 0.598, 0.07],
  ));
  // small camera dot at the bezel top
  const cam = part(
    'video-camera',
    roundedRectShape(0.05, 0.022, 0.011),
    0.01,
    [[0, '#3a3a44'], [1, '#22222a']],
    [0, 0.865, 0.045],
  );

  root.add(shadow);
  root.add(base);
  root.add(kb);
  root.add(trackpad);
  root.add(palm);
  root.add(bezel);
  root.add(screen);
  root.add(avatar);
  root.add(cam);

  if (options.wireframe) {
    root.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        ((o as THREE.Mesh).material as THREE.MeshBasicMaterial).wireframe = true;
      }
    });
  }
  return root;
}

export function frameTileVideoCamera(
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
