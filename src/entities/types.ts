export type Vec3 = {
  x: number
  y: number
  z: number
}

export type DroneType = 'recon' | 'combat' | 'hypersonic'
export type DroneBehavior =
  | 'straight'
  | 'zigzag'
  | 'random-evasive'
  | 'circular-loiter'
  | 'waypoint'
  | 'swarm'

export type MissileType = 'basic' | 'pn' | 'ai-assisted'
export type GuidanceMode = 'pure-pursuit' | 'lead-pursuit' | 'proportional-navigation'
export type LockMode = 'radar' | 'heat'
export type CameraMode = 'orbit' | 'target-lock' | 'first-person' | 'third-person'

export type Signature = 'low' | 'high'

export type DroneConfig = {
  type: DroneType
  behavior: DroneBehavior
  speed: number
  altitude: number
  acceleration: number
  turnRateDeg: number
  radarSignature: Signature
  zigZagAmplitude: number
  zigZagFrequency: number
  count: number
}

export type MissileConfig = {
  type: MissileType
  speed: number
  acceleration: number
  drag: number
  turnRateDeg: number
  fuelSeconds: number
  explosionRadius: number
  guidanceMode: GuidanceMode
  lockMode: LockMode
}

export type SimConfig = {
  timeScale: number
  terrainElevation: boolean
}

export type DroneState = {
  id: string
  type: DroneType
  behavior: DroneBehavior
  speed: number
  altitude: number
  acceleration: number
  turnRateDeg: number
  radarSignature: Signature
  position: Vec3
  source: Vec3
  destination: Vec3
  velocity: Vec3
  heading: Vec3
  phase: number
  waypoints: Vec3[]
  waypointIndex: number
  swarmAnchor: Vec3
  alive: boolean
}

export type MissileState = {
  id: string
  type: MissileType
  guidanceMode: GuidanceMode
  lockMode: LockMode
  targetId: string | null
  position: Vec3
  velocity: Vec3
  acceleration: Vec3
  alive: boolean
  launchedAt: number
  fuelRemaining: number
  distanceCovered: number
  terminalGuidance: boolean
}

export type InterceptLog = {
  missileId: string
  targetId: string
  success: boolean
  timeToIntercept: number
  distanceCovered: number
  missDistance: number
  guidanceMode: GuidanceMode
  timestamp: number
}

export type ReplayFrame = {
  t: number
  drones: Pick<DroneState, 'id' | 'position' | 'alive'>[]
  missiles: Pick<MissileState, 'id' | 'position' | 'alive' | 'fuelRemaining'>[]
}

export type ScenarioId = 'single' | 'swarm' | 'zigzag'
