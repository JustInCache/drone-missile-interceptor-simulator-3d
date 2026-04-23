import type {
  DroneBehavior,
  DroneConfig,
  DroneState,
  DroneType,
  MissileConfig,
  MissileState,
  Vec3,
} from './types'
import { makeId } from '../utils/id'
import { normalize, randomRange, v3 } from '../utils/math'

const defaultSpeedByType: Record<DroneType, number> = {
  recon: 32,
  combat: 58,
  hypersonic: 120,
}

const headingFrom = (from: Vec3, to: Vec3) => normalize(v3(to.x - from.x, to.y - from.y, to.z - from.z))

export const makeDrone = (
  config: DroneConfig,
  index: number,
  behaviorOverride?: DroneBehavior,
): DroneState => {
  const typeSpeed = defaultSpeedByType[config.type]
  const speed = config.speed || typeSpeed
  const row = Math.floor(index / 10)
  const col = index % 10
  const laneZ = -130 + row * 22 + randomRange(-8, 8)
  const source = v3(320 + col * 10 + randomRange(-6, 6), config.altitude + row * 4, laneZ)
  const destination = v3(-320 - randomRange(0, 40), config.altitude + randomRange(-8, 8), laneZ + randomRange(-16, 16))
  const spawn = v3(source.x, source.y, source.z)
  const anchor = v3(spawn.x + randomRange(-40, 40), spawn.y, spawn.z + randomRange(-40, 40))
  const wpA = v3(spawn.x - randomRange(80, 140), config.altitude + randomRange(-20, 20), laneZ + randomRange(-50, 50))
  const wpB = v3(wpA.x - randomRange(70, 120), config.altitude + randomRange(-10, 30), laneZ + randomRange(-70, 70))
  const wpC = v3(wpB.x - randomRange(60, 120), destination.y + randomRange(-20, 20), destination.z)
  const heading = headingFrom(spawn, wpA)

  return {
    id: makeId('drone'),
    type: config.type,
    behavior: behaviorOverride ?? config.behavior,
    speed,
    altitude: config.altitude,
    acceleration: config.acceleration,
    turnRateDeg: config.turnRateDeg,
    radarSignature: config.radarSignature,
    position: spawn,
    source,
    destination,
    velocity: v3(heading.x * speed, heading.y * speed, heading.z * speed),
    heading,
    phase: randomRange(0, Math.PI * 2),
    waypoints: [wpA, wpB, wpC],
    waypointIndex: 0,
    swarmAnchor: anchor,
    alive: true,
  }
}

export const makeMissile = (
  config: MissileConfig,
  launchPoint: Vec3,
  targetId: string | null,
  now: number,
): MissileState => {
  const initialDirection = v3(1, 0.15, 0)
  return {
    id: makeId('msl'),
    type: config.type,
    guidanceMode: config.guidanceMode,
    lockMode: config.lockMode,
    targetId,
    position: launchPoint,
    velocity: v3(
      initialDirection.x * Math.max(10, config.speed * 0.3),
      initialDirection.y * Math.max(10, config.speed * 0.3),
      initialDirection.z * Math.max(10, config.speed * 0.3),
    ),
    acceleration: v3(0, 0, 0),
    alive: true,
    launchedAt: now,
    fuelRemaining: config.fuelSeconds,
    distanceCovered: 0,
    terminalGuidance: false,
  }
}
