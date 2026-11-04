import test from 'node:test';
import assert from 'node:assert/strict';
import { movePlayer, WORLD_LIMIT, PLAYER_RADIUS } from '../src/movement.js';
test('diagonal movement is the same speed as straight movement', () => {
  const p = movePlayer({ x: 0, z: 0 }, { x: 1, z: 1 }, 3, []);
  assert.ok(Math.abs(Math.hypot(p.x, p.z) - 3) < 1e-10);
});
test('a narrow wall cannot be crossed even during a long step', () => {
  const p = movePlayer({ x: 0, z: 0 }, { x: 1, z: 0 }, 8, [{ minX: 2, maxX: 2.1, minZ: -2, maxZ: 2 }]);
  assert.ok(p.x <= 2 - PLAYER_RADIUS);
});
test('the player slides along an obstacle instead of getting stuck', () => {
  const p = movePlayer({ x: 0, z: 0 }, { x: 1, z: 1 }, 4, [{ minX: 1, maxX: 2, minZ: -5, maxZ: 5 }]);
  assert.ok(p.x < 1 - PLAYER_RADIUS);
  assert.ok(p.z > 2);
});
test('town bounds keep the player on the ground', () => {
  const p = movePlayer({ x: WORLD_LIMIT - 1, z: 0 }, { x: 1, z: 0 }, 9, []);
  assert.ok(p.x <= WORLD_LIMIT - PLAYER_RADIUS);
});
test('no input leaves the position unchanged', () => {
  assert.deepEqual(movePlayer({ x: 3, z: 4 }, { x: 0, z: 0 }, 1, []), { x: 3, z: 4 });
});
test('river is blocked while the bridge corridor remains passable', () => {
  const river = [{ minX: 23.3, maxX: 30.7, minZ: -45, maxZ: -3 }, { minX: 23.3, maxX: 30.7, minZ: 3, maxZ: 45 }];
  assert.ok(movePlayer({ x: 21, z: 10 }, { x: 1, z: 0 }, 12, river).x < 23.3);
  assert.ok(movePlayer({ x: 21, z: 0 }, { x: 1, z: 0 }, 12, river).x > 31);
});
test('expanded town allows walking beyond the original town bounds', () => {
  const p = movePlayer({ x: 43, z: 50 }, { x: 1, z: 0 }, 80, []);
  assert.ok(Math.abs(p.x - 123) < 1e-9);
});
test('expanded town retains both negative and positive outer boundaries', () => {
  assert.equal(WORLD_LIMIT * 2, 360);
  const p = movePlayer({ x: -179, z: 100 }, { x: -1, z: 0 }, 20, []);
  assert.ok(p.x >= -WORLD_LIMIT + PLAYER_RADIUS);
});
