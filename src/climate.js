import * as THREE from 'three';

const seasons = {
  spring: { name: '春日', temperature: 18, sky: '#e4edde', ground: '#b7ce92', leaves: ['#9cbd7b', '#afc68a', '#e2b9c3'], water: '#94c4c0', wheat: '#aabd72', flowers: ['#e7a4bb', '#f2d0b0', '#d4b4da'], sun: '#fff1df' },
  summer: { name: '夏日', temperature: 28, sky: '#e6ebda', ground: '#b4c58a', leaves: ['#81985f', '#91a56a', '#a2b77b'], water: '#83b5b2', wheat: '#ddc57d', flowers: ['#d99591', '#edca7c', '#c0a0bd'], sun: '#fff0d0' },
  autumn: { name: '秋日', temperature: 15, sky: '#eadfca', ground: '#c2b080', leaves: ['#bb7448', '#cb9652', '#dcaf66'], water: '#91aca7', wheat: '#d3ad59', flowers: ['#bc8661', '#d9a558', '#a78c9c'], sun: '#ffdeae' },
  winter: { name: '冬日', temperature: -3, sky: '#dfe8ed', ground: '#e8eeed', leaves: ['#b8c9c5', '#cbd7d1', '#e3eae7'], water: '#a9c5ce', wheat: '#d6d9c7', flowers: ['#c6d1cf', '#dce1d8', '#cad2df'], sun: '#e9f2ff' },
};
const weathers = { clear: { name: '晴朗', icon: '☀' }, rain: { name: '细雨', icon: '☂' }, snow: { name: '飘雪', icon: '❄' } };
const originalLeaves = ['#81985f', '#91a56a', '#a2b77b'];
const originalFlowers = ['#d99591', '#edca7c', '#c0a0bd'];

export function createClimate({ scene, sun, ambient, materials, roofs, renderer }) {
  let season = 'summer', weather = 'clear';
  try {
    const saved = JSON.parse(localStorage.getItem('yua-climate'));
    if (saved && Object.hasOwn(seasons, saved.season)) season = saved.season;
    if (saved && Object.hasOwn(weathers, saved.weather)) weather = saved.weather;
  } catch { /* Storage is optional, including in private browsing. */ }

  // Allocate both effects once, then reuse the buffers for every switch.
  const rainCount = 1400, snowCount = 900, range = 64, height = 28;
  const rainPositions = new Float32Array(rainCount * 6);
  const snowPositions = new Float32Array(snowCount * 3);
  for (let i = 0; i < rainCount; i++) {
    const j = i * 6, x = (Math.random() - 0.5) * range, y = Math.random() * height, z = (Math.random() - 0.5) * range;
    rainPositions.set([x, y, z, x + 0.12, y - 0.9, z], j);
  }
  for (let i = 0; i < snowCount * 3; i += 3) snowPositions.set([(Math.random() - 0.5) * range, Math.random() * height, (Math.random() - 0.5) * range], i);
  const rainGeometry = new THREE.BufferGeometry();
  rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3).setUsage(THREE.DynamicDrawUsage));
  const rain = new THREE.LineSegments(rainGeometry, new THREE.LineBasicMaterial({ color: '#c0d8e3', transparent: true, opacity: 0.65, depthWrite: false }));
  const snowGeometry = new THREE.BufferGeometry();
  snowGeometry.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3).setUsage(THREE.DynamicDrawUsage));
  const flake = document.createElement('canvas'); flake.width = flake.height = 32;
  const context = flake.getContext('2d');
  const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 15);
  gradient.addColorStop(0, '#ffffff'); gradient.addColorStop(0.5, '#fffffff0'); gradient.addColorStop(1, '#ffffff00');
  context.fillStyle = gradient; context.fillRect(0, 0, 32, 32);
  const snow = new THREE.Points(snowGeometry, new THREE.PointsMaterial({ color: '#ffffff', size: 0.23, map: new THREE.CanvasTexture(flake), transparent: true, opacity: 0.92, depthWrite: false }));
  rain.frustumCulled = snow.frustumCulled = false;
  scene.add(rain, snow);
  const tint = (original, color) => materials.get(original)?.color.set(color);
  function apply() {
    const palette = seasons[season], snowy = season === 'winter';
    tint('#b4c58a', palette.ground);
    tint('#97ac72', snowy ? '#b6c6c7' : palette.leaves[0]);
    tint('#a2b37e', snowy ? '#e0e9e5' : palette.ground);
    originalLeaves.forEach((original, i) => tint(original, palette.leaves[i]));
    originalFlowers.forEach((original, i) => tint(original, palette.flowers[i]));
    tint('#83b5b2', palette.water);
    tint('#ddc57d', palette.wheat);
    tint('#a9924e', snowy ? '#b7c4be' : season === 'spring' ? '#8d9d5e' : '#a9924e');
    tint('#dccba3', snowy ? '#d2dcda' : weather === 'rain' ? '#b4ab96' : '#dccba3');
    tint('#e4d7b7', snowy ? '#dce4e1' : weather === 'rain' ? '#beb9a7' : '#e4d7b7');
    for (const roof of roofs) roof.material.color.set(snowy ? '#edf1f0' : roof.color);
    const sky = weather === 'rain' ? '#b3c1c8' : weather === 'snow' ? '#cbd6de' : palette.sky;
    scene.background.set(sky); scene.fog.color.set(sky);
    scene.fog.near = weather === 'clear' ? 65 : 35;
    scene.fog.far = weather === 'clear' ? 145 : 110;
    sun.color.set(palette.sun);
    sun.intensity = weather === 'clear' ? 3.1 : weather === 'rain' ? 0.8 : 1.25;
    ambient.intensity = weather === 'clear' ? 2.4 : 2;
    ambient.groundColor.set(snowy ? '#aabdc5' : '#788859');
    renderer.toneMappingExposure = weather === 'clear' ? 1.25 : 1.12;
    rain.visible = weather === 'rain'; snow.visible = weather === 'snow';
    for (const button of document.querySelectorAll('[data-season]')) button.setAttribute('aria-pressed', String(button.dataset.season === season));
    for (const button of document.querySelectorAll('[data-weather]')) button.setAttribute('aria-pressed', String(button.dataset.weather === weather));
    document.querySelector('#weather-icon').textContent = weathers[weather].icon;
    document.querySelector('#weather-label').textContent = palette.name + weathers[weather].name;
    document.querySelector('#temperature').textContent = `${weather === 'snow' ? Math.min(palette.temperature, -1) : palette.temperature - (weather === 'rain' ? 4 : 0)}°C`;
    try { localStorage.setItem('yua-climate', JSON.stringify({ season, weather })); } catch { /* Keep working when storage is unavailable. */ }
  }
  for (const button of document.querySelectorAll('[data-season]')) button.addEventListener('click', () => { season = button.dataset.season; apply(); });
  for (const button of document.querySelectorAll('[data-weather]')) button.addEventListener('click', () => { weather = button.dataset.weather; apply(); });
  apply();
  return {
    update(dt, elapsed, position) {
      // The weather follows the visitor, so distant parts of the town remain covered.
      rain.position.set(position.x, 0, position.z); snow.position.copy(rain.position);
      if (rain.visible) {
        for (let i = 0; i < rainPositions.length; i += 6) {
          rainPositions[i + 1] -= dt * 21;
          if (rainPositions[i + 1] < 0) rainPositions[i + 1] += height;
          rainPositions[i + 4] = rainPositions[i + 1] - 0.9;
        }
        rainGeometry.attributes.position.needsUpdate = true;
      }
      if (snow.visible) {
        for (let i = 0; i < snowPositions.length; i += 3) {
          snowPositions[i] += Math.sin(elapsed * 0.7 + i) * dt * 0.45;
          snowPositions[i + 1] -= dt * (1.5 + (i % 7) * 0.18);
          if (snowPositions[i + 1] < 0) snowPositions[i + 1] += height;
          if (snowPositions[i] > range / 2) snowPositions[i] -= range;
          if (snowPositions[i] < -range / 2) snowPositions[i] += range;
        }
        snowGeometry.attributes.position.needsUpdate = true;
      }
    },
  };
}
