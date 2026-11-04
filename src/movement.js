export const WORLD_LIMIT = 180;
export const PLAYER_RADIUS = 0.45;

export function movePlayer(position, direction, distance, obstacles, radius = PLAYER_RADIUS, isBlocked = () => false) {
  const length = Math.hypot(direction.x, direction.z);
  if (!length) return { ...position };
  const dx = direction.x / length * distance;
  const dz = direction.z / length * distance;
  const result = { ...position };
  // Substeps prevent sprinting through a narrow obstacle after a slow frame.
  const steps = Math.max(1, Math.ceil(distance / 0.2));
  const blocked = (x, z) => Math.abs(x) > WORLD_LIMIT - radius || Math.abs(z) > WORLD_LIMIT - radius || isBlocked(x, z) || obstacles.some(o => x > o.minX - radius && x < o.maxX + radius && z > o.minZ - radius && z < o.maxZ + radius);
  for (let i = 0; i < steps; i++) {
    if (!blocked(result.x + dx / steps, result.z)) result.x += dx / steps;
    if (!blocked(result.x, result.z + dz / steps)) result.z += dz / steps;
  }
  return result;
}
