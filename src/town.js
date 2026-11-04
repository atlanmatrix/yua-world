import * as THREE from 'three';

export const DISTRICT_SIZE = 90;
export const DISTRICT_OFFSETS = [-135, -45, 45, 135];
export const SPAWN = { x: -45, z: -30 };

export function expandTown(scene, obstacles, sails, waterDrop) {
  scene.updateMatrixWorld(true);
  const sources = scene.children.filter(object => object.isMesh || object.isGroup);
  const buckets = new Map();
  // Bake static objects into material batches. All 16 districts share geometry
  // and materials; each district can still be culled separately by the camera.
  for (const source of sources) {
    if (source === sails || source === waterDrop) continue;
    source.traverse(object => {
      if (!object.isMesh) return;
      const geometry = object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone();
      geometry.applyMatrix4(object.matrixWorld);
      if (!buckets.has(object.material)) buckets.set(object.material, []);
      buckets.get(object.material).push(geometry);
    });
  }
  const batches = [];
  for (const [material, geometries] of buckets) {
    const count = geometries.reduce((sum, geometry) => sum + geometry.attributes.position.count, 0);
    const positions = new Float32Array(count * 3), normals = new Float32Array(count * 3);
    let offset = 0;
    for (const geometry of geometries) {
      positions.set(geometry.attributes.position.array, offset);
      normals.set(geometry.attributes.normal.array, offset);
      offset += geometry.attributes.position.array.length;
      geometry.dispose();
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    geometry.computeBoundingSphere();
    const batch = new THREE.Mesh(geometry, material);
    batch.castShadow = batch.receiveShadow = true;
    batches.push(batch);
  }
  for (const source of sources) scene.remove(source);
  const originalObstacles = obstacles.splice(0);
  const windmills = [], fountains = [], districts = [];
  for (const x of DISTRICT_OFFSETS) for (const z of DISTRICT_OFFSETS) {
    const district = new THREE.Group();
    district.name = `district-${x}-${z}`;
    district.position.set(x, 0, z);
    for (const batch of batches) district.add(batch.clone());
    const windmill = sails.clone(); district.add(windmill); windmills.push(windmill);
    const fountain = waterDrop.clone(); district.add(fountain); fountains.push(fountain);
    scene.add(district); districts.push(district);
    for (const obstacle of originalObstacles) obstacles.push({ minX: obstacle.minX + x, maxX: obstacle.maxX + x, minZ: obstacle.minZ + z, maxZ: obstacle.maxZ + z });
  }
  return {
    districts,
    update(dt, elapsed, position) {
      for (let i = 0; i < districts.length; i++) {
        const district = districts[i];
        // Hide whole distant districts from both render and shadow passes.
        district.visible = Math.abs(district.position.x - position.x) < 145 && Math.abs(district.position.z - position.z) < 145;
        windmills[i].rotation.z -= dt * 0.35;
        fountains[i].position.y = 2.3 + Math.sin(elapsed * 3) * 0.12;
      }
    },
  };
}
