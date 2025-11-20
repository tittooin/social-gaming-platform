// Simple AI engine for CPU opponents
// Implements path-following, aggression, attack chance, rubber-banding, and speed variance

export function updateAI(dt, aiState, track) {
  // aiState: { pos:{x,y,z}, vel:number, targetIndex:number, aggression:0..3, difficulty:0..2, distanceToPlayer:number }
  const waypoints = track.waypoints;
  const target = waypoints[aiState.targetIndex % waypoints.length];
  const dx = target.x - aiState.pos.x;
  const dz = target.z - aiState.pos.z;
  const dist = Math.sqrt(dx*dx + dz*dz) || 1;
  const dirx = dx / dist;
  const dirz = dz / dist;

  // Base speed with variance
  const baseSpeed = 18 + (aiState.difficulty * 2) + (Math.random() * 1.5 - 0.75);

  // Rubber-banding: if far behind, get boost; if far ahead, slow
  if (aiState.distanceToPlayer > 50) {
    aiState.vel += 4; // catch-up boost
  } else if (aiState.distanceToPlayer < -30) {
    aiState.vel -= 3; // reduce speed when far ahead
  }

  // Aggression: more aggressive → more speed bursts and attack chance
  const aggressionBoost = aiState.aggression * 1.5;
  aiState.vel = Math.max(10, Math.min(baseSpeed + aggressionBoost, 30));

  // Move towards target
  aiState.pos.x += dirx * aiState.vel * dt;
  aiState.pos.z += dirz * aiState.vel * dt;

  // If close to waypoint, advance
  if (dist < 5) {
    aiState.targetIndex = (aiState.targetIndex + 1) % waypoints.length;
  }

  // Attack chance: simple probability if near the player
  let didAttack = false;
  if (aiState.distanceToPlayer >= 0 && aiState.distanceToPlayer < 5) {
    const chance = 0.05 + 0.05 * aiState.aggression; // 5% to 20%
    if (Math.random() < chance) {
      didAttack = true; // game should apply slow-down to player on hit
    }
  }

  return { ...aiState, didAttack };
}