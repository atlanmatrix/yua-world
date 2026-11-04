import * as THREE from 'three';
import { movePlayer } from './movement.js';
import { createClimate } from './climate.js';

const loading = document.querySelector('#loading');
try {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#e6ebda');
  scene.fog = new THREE.Fog('#e6ebda', 65, 145);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  document.querySelector('#world').appendChild(renderer.domElement);
  const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 220);
  const ambient = new THREE.HemisphereLight('#fff7df', '#788859', 2.4);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight('#fff0d0', 3.1);
  sun.position.set(-25, 45, 20);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -55, right: 55, top: 55, bottom: -55, near: 1, far: 130 });
  sun.shadow.normalBias = 0.04;
  scene.add(sun);
  const materials = new Map();
  const roofs = [];
  const mat = color => {
    if (!materials.has(color)) materials.set(color, new THREE.MeshStandardMaterial({ color, roughness: 0.95, flatShading: true }));
    return materials.get(color);
  };
  function mesh(geometry, color, x, y, z, parent = scene) {
    const object = new THREE.Mesh(geometry, mat(color));
    object.position.set(x, y, z);
    object.castShadow = object.receiveShadow = true;
    parent.add(object);
    return object;
  }
  const box = (w, h, d, color, x, y, z, parent) => mesh(new THREE.BoxGeometry(w, h, d), color, x, y, z, parent);
  const sphere = (r, color, x, y, z, parent) => mesh(new THREE.IcosahedronGeometry(r, 1), color, x, y, z, parent);
  const cylinder = (r1, r2, h, color, x, y, z, parent) => mesh(new THREE.CylinderGeometry(r1, r2, h, 8), color, x, y, z, parent);
  const obstacles = [];
  function obstacle(x, z, w, d) { obstacles.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 }); }
  // A seeded generator gives every visit the same landscape.
  let seed = 124;
  const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  box(90, 1.6, 90, '#97ac72', 0, -0.85, 0);
  box(88, 0.08, 88, '#b4c58a', 0, 0, 0);
  box(7, 0.07, 87, '#dccba3', 0, 0.07, 0);
  box(87, 0.07, 5, '#dccba3', 0, 0.08, 0);
  box(48, 0.07, 3, '#dccba3', -8, 0.08, -23);
  const plaza = cylinder(8, 8, 0.12, '#e4d7b7', 0, 0.1, 0);
  plaza.geometry = new THREE.CylinderGeometry(8, 8, 0.12, 32);
  // River and its bridge occupy the east side; banks block walking into water.
  box(7, 0.05, 88, '#83b5b2', 27, 0.1, 0);
  box(0.7, 0.18, 88, '#a2b37e', 23.2, 0.08, 0);
  box(0.7, 0.18, 88, '#a2b37e', 30.8, 0.08, 0);
  obstacle(27, -24, 7.4, 42);
  obstacle(27, 24, 7.4, 42);
  for (let i = 0; i < 16; i++) box(0.55, 0.15, 5.6, '#b99a70', 22.5 + i * 0.6, 0.19, 0);
  for (const z of [-2.6, 2.6]) {
    box(9.6, 0.13, 0.13, '#f2e4c7', 27, 1.2, z);
    for (let x = 23; x <= 31; x += 2) box(0.15, 1.25, 0.15, '#f2e4c7', x, 0.75, z);
    obstacle(27, z, 9.6, 0.15);
  }
  function house(x, z, w, d, color, roofColor, angle = 0) {
    const group = new THREE.Group(); group.position.set(x, 0, z); group.rotation.y = angle; scene.add(group);
    const h = 3.2;
    box(w + 0.4, 0.25, d + 0.4, '#c4b594', 0, 0.15, 0, group);
    box(w, h, d, color, 0, h / 2 + 0.25, 0, group);
    const roof = new THREE.Shape(); roof.moveTo(-w / 2 - 0.4, 0); roof.lineTo(0, 2.5); roof.lineTo(w / 2 + 0.4, 0); roof.closePath();
    const roofMesh = mesh(new THREE.ExtrudeGeometry(roof, { depth: d + 0.8, bevelEnabled: false }), roofColor, 0, h + 0.2, -d / 2 - 0.4, group);
    roofMesh.castShadow = true;
    roofMesh.material = roofMesh.material.clone();
    roofs.push({ material: roofMesh.material, color: roofColor });
    box(0.6, 1.9, 0.6, '#d7c6a8', w * 0.28, h + 1.65, 0.7, group);
    box(1, 2.1, 0.12, '#766a51', 0, 1.3, d / 2 + 0.08, group);
    sphere(0.055, '#edcd7d', 0.3, 1.2, d / 2 + 0.17, group);
    for (const wx of [-w * 0.3, w * 0.3]) {
      box(1.1, 1.15, 0.15, '#f4e8cf', wx, 2.25, d / 2 + 0.08, group);
      box(0.85, 0.9, 0.17, '#7b9c9c', wx, 2.25, d / 2 + 0.12, group);
      box(0.07, 0.9, 0.2, '#e9e4cd', wx, 2.25, d / 2 + 0.15, group);
      box(0.85, 0.07, 0.2, '#e9e4cd', wx, 2.25, d / 2 + 0.15, group);
      box(1.25, 0.3, 0.45, '#8b7356', wx, 1.62, d / 2 + 0.23, group);
      for (let j = 0; j < 4; j++) sphere(0.17, j % 2 ? '#d8b36e' : '#c48578', wx - 0.4 + j * 0.27, 1.88, d / 2 + 0.26, group);
    }
    const swapped = Math.abs(Math.sin(angle)) > 0.5;
    obstacle(x, z, (swapped ? d : w) + 0.4, (swapped ? w : d) + 0.4);
  }
  house(-11, -10, 6, 5, '#e8d9ae', '#a96245');
  house(11, -11, 5.6, 5, '#ede1c4', '#748a7a');
  house(-12, 11, 6.5, 5.5, '#e5c6a7', '#ae7053', Math.PI);
  house(12, 12, 5, 5, '#e4deb9', '#858365', Math.PI);
  house(-23, -11, 5, 5, '#e8dfc8', '#9b654c');
  house(-24, 12, 5, 6, '#e0d1ad', '#827968', Math.PI / 2);
  house(12, -29, 5, 5, '#eedcc0', '#b27f58');
  // Fountain in the village square.
  cylinder(2, 2.2, 0.6, '#b7bbaa', 0, 0.35, 0);
  cylinder(1.8, 1.8, 0.08, '#91bcc1', 0, 0.69, 0);
  cylinder(0.3, 0.5, 1.3, '#d9d6bc', 0, 1.2, 0);
  cylinder(1.1, 0.3, 0.25, '#d9d6bc', 0, 1.9, 0);
  const waterDrop = sphere(0.22, '#b3d7d6', 0, 2.3, 0);
  obstacle(0, 0, 4.1, 4.1);
  // Windmill with moving sails.
  cylinder(1.6, 2.2, 7, '#e7dfc1', -15, 3.6, -29);
  mesh(new THREE.ConeGeometry(2.2, 2.7, 8), '#976b4f', -15, 8.2, -29);
  const sails = new THREE.Group(); sails.position.set(-15, 6, -26.9); scene.add(sails);
  for (let i = 0; i < 4; i++) {
    const arm = new THREE.Group(); arm.rotation.z = i * Math.PI / 2;
    box(0.18, 4.8, 0.18, '#786b51', 0, 1.9, 0, arm);
    box(0.8, 2.8, 0.1, '#f1e7c8', 0.35, 2.6, 0.08, arm); sails.add(arm);
  }
  sphere(0.35, '#88704b', 0, 0, 0.15, sails);
  obstacle(-15, -29, 4.4, 4.4);
  // Wheat fields: rows of small golden plants.
  box(10, 0.08, 13, '#b29c6a', -29, 0.1, -28);
  for (let row = 0; row < 9; row++) for (let col = 0; col < 12; col++) {
    const x = -33 + row, z = -33.5 + col;
    box(0.08, 0.7, 0.08, '#a9924e', x, 0.5, z);
    mesh(new THREE.ConeGeometry(0.17, 0.5, 4), '#ddc57d', x, 0.98, z);
  }
  function tree(x, z, scale = 1) {
    const group = new THREE.Group(); group.position.set(x, 0, z); group.scale.setScalar(scale); scene.add(group);
    cylinder(0.22, 0.35, 2.4, '#8c7854', 0, 1.2, 0, group);
    sphere(1.75, random() > 0.5 ? '#81985f' : '#91a56a', 0, 3.3, 0, group);
    sphere(1.25, '#a2b77b', -0.65, 3.5, 0.3, group);
    obstacle(x, z, 0.6 * scale, 0.6 * scale);
  }
  for (let i = 0; i < 105; i++) {
    const x = (random() - 0.5) * 83, z = (random() - 0.5) * 83;
    if (Math.abs(x) < 5 || Math.abs(z) < 5 || (x > 20 && x < 33) || Math.abs(z + 23) < 3 || (x < -8 && z < -20)) continue;
    if (obstacles.some(o => x > o.minX - 2 && x < o.maxX + 2 && z > o.minZ - 2 && z < o.maxZ + 2)) continue;
    tree(x, z, 0.75 + random() * 0.45);
  }
  // Little garden, benches and lamps.
  for (const x of [9, 13, 17]) for (const z of [24, 27, 30]) {
    box(2.5, 0.25, 2, '#947e5b', x, 0.2, z);
    for (let i = 0; i < 5; i++) {
      const fx = x + (random() - 0.5) * 1.8, fz = z + (random() - 0.5) * 1.4;
      cylinder(0.035, 0.035, 0.5, '#78985f', fx, 0.6, fz);
      sphere(0.22, ['#d99591', '#edca7c', '#c0a0bd'][i % 3], fx, 0.9, fz);
    }
  }
  for (const x of [-6, 6]) for (const z of [-5, 6]) {
    box(2, 0.18, 0.7, '#a28b61', x, 0.8, z);
    box(2, 0.65, 0.12, '#a28b61', x, 1.15, z - 0.3);
    for (const dx of [-0.7, 0.7]) box(0.12, 0.75, 0.55, '#6d7961', x + dx, 0.4, z);
    obstacle(x, z, 2, 0.8);
  }
  for (const z of [-19, -7, 9, 22]) for (const x of [-4, 4]) {
    cylinder(0.06, 0.1, 3.2, '#69735c', x, 1.6, z);
    box(0.45, 0.6, 0.45, '#f0dfac', x, 3.25, z);
    mesh(new THREE.ConeGeometry(0.4, 0.3, 4), '#69735c', x, 3.7, z);
  }
  for (let i = 0; i < 150; i++) {
    const x = (random() - 0.5) * 83, z = (random() - 0.5) * 83;
    if (Math.abs(x) < 5 || Math.abs(z) < 4 || (x > 22 && x < 32)) continue;
    sphere(0.09 + random() * 0.08, random() > 0.5 ? '#eadba2' : '#d0ad92', x, 0.12, z);
  }
  // Friendly visitor in a mustard shirt and a straw hat.
  const player = new THREE.Group(); scene.add(player);
  const body = new THREE.Group(); player.add(body);
  box(0.65, 0.75, 0.4, '#d7a65a', 0, 1.12, 0, body);
  sphere(0.33, '#e8c3a0', 0, 1.8, 0, body);
  cylinder(0.58, 0.58, 0.08, '#ddc18a', 0, 2.04, 0, body);
  cylinder(0.34, 0.38, 0.3, '#e3ca94', 0, 2.17, 0, body);
  box(0.58, 0.07, 0.07, '#887457', 0, 2.07, 0.33, body);
  box(0.5, 0.5, 0.22, '#7c8c74', 0, 1.2, -0.3, body);
  const limbs = [];
  for (const side of [-1, 1]) {
    const leg = new THREE.Group(); leg.position.set(side * 0.19, 0.78, 0); body.add(leg);
    box(0.25, 0.6, 0.28, '#647c7b', 0, -0.3, 0, leg);
    box(0.27, 0.18, 0.42, '#6b6555', 0, -0.64, 0.07, leg);
    const arm = new THREE.Group(); arm.position.set(side * 0.44, 1.45, 0); body.add(arm);
    box(0.2, 0.5, 0.23, '#d7a65a', 0, -0.22, 0, arm);
    sphere(0.13, '#e8c3a0', 0, -0.52, 0, arm);
    limbs.push({ leg, arm, side });
  }
  const climate = createClimate({ scene, sun, ambient, materials, roofs, renderer });
  const keys = new Set();
  const touch = new Set();
  const controls = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift'];
  addEventListener('keydown', e => { if (controls.includes(e.key.toLowerCase()) && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) { e.preventDefault(); keys.add(e.key.toLowerCase()); } });
  addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));
  const clearInput = () => { keys.clear(); touch.clear(); };
  addEventListener('blur', clearInput);
  document.addEventListener('visibilitychange', clearInput);
  for (const button of document.querySelectorAll('[data-move]')) {
    button.addEventListener('pointerdown', e => { e.preventDefault(); button.setPointerCapture(e.pointerId); touch.add(button.dataset.move); });
    for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(name, () => touch.delete(button.dataset.move));
  }
  let yaw = Math.PI / 5, pitch = 0.78, drag = null;
  renderer.domElement.addEventListener('pointerdown', e => { drag = { id: e.pointerId, x: e.clientX, y: e.clientY }; renderer.domElement.setPointerCapture(e.pointerId); });
  renderer.domElement.addEventListener('pointermove', e => {
    if (!drag || drag.id !== e.pointerId) return;
    yaw -= (e.clientX - drag.x) * 0.005;
    pitch = THREE.MathUtils.clamp(pitch + (e.clientY - drag.y) * 0.003, 0.35, 1.15);
    drag.x = e.clientX; drag.y = e.clientY;
  });
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) renderer.domElement.addEventListener(name, () => { drag = null; });
  const landmarks = [
    { x: 0, z: 0, name: '中央喷泉', title: '听见水声，便到了广场', text: '午后的阳光落在喷泉上。找一张长椅，让时间慢一点。' },
    { x: -15, z: -29, name: '麦田风车', title: '风经过，麦浪就有了形状', text: '老风车仍在不紧不慢地转动，金色的麦田正等着秋天。' },
    { x: 27, z: 0, name: '河畔木桥', title: '沿着水流，寻找远方', text: '过了小桥，是另一片树荫。小河把整个下午都映成了蓝色。' },
    { x: 13, z: 27, name: '乡间花园', title: '每一朵花，都有自己的季节', text: '村民们照料的小花园，藏着这个小镇最温柔的颜色。' },
    { x: -11, z: -10, name: '暖阳小屋', title: '炊烟升起的地方', text: '红屋顶、木窗和窗台的花。平凡的日子，也值得被珍藏。' },
  ];
  let activeLandmark = -2;
  function updateLocation() {
    let nearest = -1, distance = 9;
    landmarks.forEach((l, i) => { const d = Math.hypot(player.position.x - l.x, player.position.z - l.z); if (d < distance) { distance = d; nearest = i; } });
    if (nearest === activeLandmark) return;
    activeLandmark = nearest;
    const l = landmarks[nearest];
    document.querySelector('#location').textContent = l?.name ?? '乡间小路';
    document.querySelector('#landmark-index').textContent = nearest < 0 ? 'YUA / WORLD' : `${String(nearest + 1).padStart(2, '0')} / 05`;
    document.querySelector('#landmark-title').textContent = l?.title ?? '不赶路，只感受路';
    document.querySelector('#landmark-text').textContent = l?.text ?? '沿着田间小路，寻找风车、花园和河畔。每个转角都值得停留。';
  }
  function cameraTarget() {
    return new THREE.Vector3(player.position.x + Math.sin(yaw) * Math.cos(pitch) * 31, 1.3 + Math.sin(pitch) * 31, player.position.z + Math.cos(yaw) * Math.cos(pitch) * 31);
  }
  function reset() { clearInput(); player.position.set(0, 0.22, 15); player.rotation.y = Math.PI; yaw = Math.PI / 5; pitch = 0.78; camera.position.copy(cameraTarget()); updateLocation(); }
  document.querySelector('#reset').addEventListener('click', reset);
  reset();
  addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); });
  const clock = new THREE.Clock(); let elapsed = 0;
  const lookAt = new THREE.Vector3();
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05); elapsed += dt;
    const forward = Number(keys.has('w') || keys.has('arrowup') || touch.has('up')) - Number(keys.has('s') || keys.has('arrowdown') || touch.has('down'));
    const right = Number(keys.has('d') || keys.has('arrowright') || touch.has('right')) - Number(keys.has('a') || keys.has('arrowleft') || touch.has('left'));
    const direction = { x: -Math.sin(yaw) * forward + Math.cos(yaw) * right, z: -Math.cos(yaw) * forward - Math.sin(yaw) * right };
    const previous = player.position.clone();
    const next = movePlayer(player.position, direction, dt * (keys.has('shift') ? 8 : 4.5), obstacles);
    player.position.x = next.x; player.position.z = next.z;
    const walking = previous.distanceTo(player.position) > 0.001;
    if (walking) {
      const target = Math.atan2(direction.x, direction.z);
      player.rotation.y += Math.atan2(Math.sin(target - player.rotation.y), Math.cos(target - player.rotation.y)) * Math.min(1, dt * 14);
    }
    for (const { leg, arm, side } of limbs) { const swing = walking ? Math.sin(elapsed * (keys.has('shift') ? 16 : 11)) * 0.55 * side : 0; leg.rotation.x = swing; arm.rotation.x = -swing; }
    body.position.y = walking ? Math.abs(Math.sin(elapsed * 11)) * 0.06 : Math.sin(elapsed * 2) * 0.018;
    sails.rotation.z -= dt * 0.35;
    waterDrop.position.y = 2.3 + Math.sin(elapsed * 3) * 0.12;
    climate.update(dt, elapsed, player.position);
    camera.position.lerp(cameraTarget(), 1 - Math.exp(-dt * 5));
    lookAt.set(player.position.x, 1.1, player.position.z);
    camera.lookAt(lookAt);
    updateLocation();
    renderer.render(scene, camera);
    loading.hidden = true;
  });
  renderer.domElement.addEventListener('webglcontextlost', e => { e.preventDefault(); loading.hidden = false; loading.textContent = '图形连接已中断，请刷新页面重新进入小镇。'; });
} catch (error) {
  console.error(error);
  loading.hidden = false;
  loading.textContent = '小镇暂时无法加载。请确认浏览器支持 WebGL，开启硬件加速后刷新页面。';
}
