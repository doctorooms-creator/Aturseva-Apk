// Generic render host for img2threejs factories (bundled; factory loads at runtime).
// Params: model, mode, azimuth, elevation, w, h, margin, transparent, shadow, plain,
//         wireframe, bg, exposure, tonemap(none|linear), lightscale, whitelights,
//         envscale, flatlight
import * as THREE from 'three';

const q = new URLSearchParams(location.search);
const MODEL = q.get('model') || './dist/shield-factory.js';
const MODE = q.get('mode') || 'neutral';
const AZ = parseFloat(q.get('azimuth') || '0');
const EL = parseFloat(q.get('elevation') || '0');
const W = parseInt(q.get('w') || '512');
const H = parseInt(q.get('h') || '512');
const TRANSPARENT = q.get('transparent') === '1';
const SHADOW = q.get('shadow') === '1';
const PLAIN = q.get('plain') === '1';
const WIREFRAME = q.get('wireframe') === '1';
const BG = q.get('bg') || null;
const EXPOSURE = parseFloat(q.get('exposure') || '1.0');
const LIGHTSCALE = parseFloat(q.get('lightscale') || '1.0');
const ENVSCALE = parseFloat(q.get('envscale') || '1.0');
const MARGIN = parseFloat(q.get('margin') || '1.12');

window.__IMG2THREEJS_READY__ = false;
window.__IMG2THREEJS_HOST_ERROR__ = null;

try {
  const mod = await import(new URL(MODEL, location.href).href);
  const factoryName = Object.keys(mod).find(k => /^create.*Model$/.test(k));
  if (!factoryName) throw new Error('no create*Model export in ' + MODEL);
  const createModel = mod[factoryName];
  const frameName = Object.keys(mod).find(k => /^frame.*Camera$/.test(k));
  const lightsName = Object.keys(mod).find(k => /^create.*LookDevLights$/.test(k));
  const envName = Object.keys(mod).find(k => /^create.*Environment$/.test(k));
  const configureName = Object.keys(mod).find(k => /^configure.*Renderer$/.test(k));

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: TRANSPARENT, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(W, H);
  if (TRANSPARENT) renderer.setClearColor(0x000000, 0);
  else if (BG) renderer.setClearColor(parseInt(BG.replace('#',''), 16), 1);
  else renderer.setClearColor(0xf2f2f4, 1);
  if (configureName) mod[configureName](renderer);
  renderer.toneMappingExposure = EXPOSURE;
  if (q.get('tonemap') === 'none') renderer.toneMapping = THREE.NoToneMapping;
  if (q.get('tonemap') === 'linear') renderer.toneMapping = THREE.LinearToneMapping;
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  if (envName && ENVSCALE > 0) scene.environment = mod[envName](renderer);

  const model = createModel({ qualityPriority: 'reference-fidelity', wireframe: WIREFRAME });
  if (PLAIN) model.traverse(o => { if (o.isMesh) o.material = new THREE.MeshStandardMaterial({ color: 0x5a6ee8, roughness: 0.35, wireframe: WIREFRAME }); });
  const HIDE = q.get('hide');
  if (HIDE) model.traverse(o => { if (o.isMesh && o.name && o.name.toLowerCase().includes(HIDE.toLowerCase())) o.visible = false; });
  if (q.get('basic') === '1') {
    // flat-vector render: unlit MeshBasic with the authored maps — the mockup IS flat-style
    model.traverse(o => {
      if (!o.isMesh) return;
      const tex = o.material && o.material.map ? o.material.map : null;
      const plainColor = tex ? null : (o.material && o.material.color ? o.material.color : new THREE.Color(0xffffff));
      o.material = new THREE.MeshBasicMaterial(tex ? { map: tex } : { color: plainColor });
    });
  }
  if (q.get('remapuv') === '1') {
    // normalize raw profile-coord UVs to [0,1] over each mesh's own uv bbox
    model.traverse(o => {
      if (!o.isMesh || !o.geometry || !o.geometry.attributes.uv) return;
      if (!o.material || !o.material.map) return;
      const uv = o.geometry.attributes.uv;
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (let i = 0; i < uv.count; i++) {
        const u = uv.getX(i), v = uv.getY(i);
        if (u < minX) minX = u; if (u > maxX) maxX = u;
        if (v < minY) minY = v; if (v > maxY) maxY = v;
      }
      const sx = maxX - minX || 1, sy = maxY - minY || 1;
      for (let i = 0; i < uv.count; i++) {
        uv.setXY(i, (uv.getX(i) - minX) / sx, (uv.getY(i) - minY) / sy);
      }
      uv.needsUpdate = true;
      if (o.geometry.index) o.geometry.index.needsUpdate = true;
      o.material.map.wrapS = THREE.ClampToEdgeWrapping;
      o.material.map.wrapT = THREE.ClampToEdgeWrapping;
      o.material.map.needsUpdate = true;
    });
  }
  if (q.get('uvcheck') === '1') {
    const uc = document.createElement('canvas'); uc.width = uc.height = 64;
    const ug = uc.getContext('2d');
    const grad = ug.createLinearGradient(0, 0, 64, 0);
    grad.addColorStop(0, '#000000'); grad.addColorStop(1, '#ff0000');
    ug.fillStyle = grad; ug.fillRect(0, 0, 64, 64);
    const grad2 = ug.createLinearGradient(0, 0, 0, 64);
    grad2.addColorStop(0, '#000000'); grad2.addColorStop(1, '#00ff00');
    ug.globalCompositeOperation = 'lighter'; ug.fillStyle = grad2; ug.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(uc);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    model.traverse(o => { if (o.isMesh) { o.material = new THREE.MeshBasicMaterial({ map: tex }); } });
  }
  if (ENVSCALE !== 1.0) model.traverse(o => { if (o.isMesh && o.material && 'envMapIntensity' in o.material) o.material.envMapIntensity *= ENVSCALE; });
  scene.add(model);

  if (q.get('flatlight') === '1') {
    scene.add(new THREE.AmbientLight(0xffffff, 0.98));
  } else if (lightsName) {
    const lg = mod[lightsName](MODE);
    if (LIGHTSCALE !== 1.0) lg.traverse(o => { if (o.isLight) o.intensity *= LIGHTSCALE; });
    if (q.get('whitelights') === '1') lg.traverse(o => {
      if (o.isLight && o.color) {
        const mx = Math.max(o.color.r, o.color.g, o.color.b);
        if (mx > 0) o.color.setRGB(mx, mx, mx);
      }
    });
    scene.add(lg);
  }

  if (SHADOW) {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(128,128,10,128,128,120);
    grad.addColorStop(0,'rgba(30,30,40,0.30)'); grad.addColorStop(1,'rgba(30,30,40,0)');
    g.fillStyle = grad; g.fillRect(0,0,256,256);
    const tex = new THREE.CanvasTexture(c);
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(0.85,0.85),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    const box = new THREE.Box3().setFromObject(model);
    const ctr = box.getCenter(new THREE.Vector3());
    plane.position.set(ctr.x, box.min.y - 0.012, ctr.z);
    plane.rotation.x = -Math.PI/2;
    scene.add(plane);
  }

  const camera = new THREE.PerspectiveCamera(40, W/H, 0.01, 100);
  if (frameName) mod[frameName](camera, model, { azimuthDeg: AZ, elevationDeg: EL, margin: MARGIN });

  let frames = 0;
  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
    frames++;
    if (frames >= 2) window.__IMG2THREEJS_READY__ = true;
  });
  window.__IMG2THREEJS_CAPTURE__ = { setCamera(spec){}, frameCount: () => frames };
} catch (e) {
  window.__IMG2THREEJS_HOST_ERROR__ = String(e && e.stack || e);
  console.error(e);
}
