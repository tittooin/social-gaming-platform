// Track layouts for racing module
export const tracks = {
  forest_road_rash: {
    id: 'forest_road_rash',
    displayName: 'Forest Road (Road Rash)',
    waypoints: [
      { x: 0, y: 0, z: 0 }, { x: 50, y: 0, z: 10 }, { x: 120, y: 0, z: 40 },
      { x: 200, y: 0, z: 90 }, { x: 260, y: 0, z: 150 }, { x: 300, y: 0, z: 220 },
      { x: 260, y: 0, z: 300 }, { x: 200, y: 0, z: 360 }, { x: 120, y: 0, z: 400 },
      { x: 50, y: 0, z: 420 }, { x: 0, y: 0, z: 450 },
    ],
    checkpointIndices: [2, 5, 8, 10],
    speedZones: [
      { from: 3, to: 5, maxSpeed: 22 },
      { from: 7, to: 9, maxSpeed: 24 },
    ],
    minFinishMs: 30_000,
    maxNitro: 5,
  },
  desert_highway: {
    id: 'desert_highway',
    displayName: 'Desert Highway',
    waypoints: [
      { x: 0, y: 0, z: 0 }, { x: 80, y: 0, z: -10 }, { x: 160, y: 0, z: -20 },
      { x: 240, y: 0, z: -30 }, { x: 320, y: 0, z: -40 }, { x: 380, y: 0, z: -60 },
      { x: 420, y: 0, z: -90 }, { x: 460, y: 0, z: -140 }, { x: 500, y: 0, z: -200 },
    ],
    checkpointIndices: [3, 6, 9],
    speedZones: [ { from: 4, to: 6, maxSpeed: 28 } ],
    minFinishMs: 25_000,
    maxNitro: 6,
  },
  city_loop_nfs: {
    id: 'city_loop_nfs',
    displayName: 'City Loop (NFS)',
    waypoints: [
      { x: 0, y: 0, z: 0 }, { x: 40, y: 0, z: 40 }, { x: 80, y: 0, z: 0 },
      { x: 120, y: 0, z: -40 }, { x: 160, y: 0, z: 0 }, { x: 200, y: 0, z: 40 },
      { x: 240, y: 0, z: 0 }, { x: 200, y: 0, z: -40 }, { x: 160, y: 0, z: -80 },
      { x: 120, y: 0, z: -120 }, { x: 80, y: 0, z: -80 }, { x: 40, y: 0, z: -40 },
      { x: 0, y: 0, z: 0 },
    ],
    checkpointIndices: [4, 8, 12],
    speedZones: [ { from: 2, to: 4, maxSpeed: 20 }, { from: 9, to: 11, maxSpeed: 22 } ],
    minFinishMs: 35_000,
    maxNitro: 4,
  }
};

export function getTrack(trackId) {
  const t = tracks[trackId];
  if (!t) throw new Error('Unknown track');
  return t;
}