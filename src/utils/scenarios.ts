import type { DroneConfig, MissileConfig, ScenarioId, SimConfig } from '../entities/types'

export type ScenarioPreset = {
  id: ScenarioId
  name: string
  drone: DroneConfig
  missile: MissileConfig
  sim: SimConfig
}

export const defaultDroneConfig: DroneConfig = {
  type: 'combat',
  behavior: 'straight',
  speed: 58,
  altitude: 70,
  acceleration: 35,
  turnRateDeg: 45,
  radarSignature: 'high',
  zigZagAmplitude: 25,
  zigZagFrequency: 0.8,
  count: 1,
}

export const defaultMissileConfig: MissileConfig = {
  type: 'pn',
  speed: 160,
  acceleration: 180,
  drag: 0.06,
  turnRateDeg: 140,
  fuelSeconds: 24,
  explosionRadius: 10,
  guidanceMode: 'proportional-navigation',
  lockMode: 'radar',
}

export const defaultSimConfig: SimConfig = {
  timeScale: 1,
  terrainElevation: false,
}

export const presets: ScenarioPreset[] = [
  {
    id: 'single',
    name: 'Single Drone vs Missile',
    drone: { ...defaultDroneConfig, behavior: 'straight', count: 1, type: 'recon', speed: 40 },
    missile: { ...defaultMissileConfig, guidanceMode: 'pure-pursuit', type: 'basic' },
    sim: { ...defaultSimConfig },
  },
  {
    id: 'swarm',
    name: 'Swarm vs Interceptor',
    drone: { ...defaultDroneConfig, behavior: 'swarm', count: 24, type: 'combat', speed: 62 },
    missile: { ...defaultMissileConfig, guidanceMode: 'proportional-navigation', type: 'pn' },
    sim: { ...defaultSimConfig },
  },
  {
    id: 'zigzag',
    name: 'Zig-zag Evasive Drone',
    drone: {
      ...defaultDroneConfig,
      behavior: 'zigzag',
      count: 1,
      type: 'hypersonic',
      speed: 130,
      zigZagAmplitude: 40,
      zigZagFrequency: 1.4,
    },
    missile: { ...defaultMissileConfig, guidanceMode: 'lead-pursuit', type: 'ai-assisted' },
    sim: { ...defaultSimConfig, timeScale: 0.85 },
  },
]
