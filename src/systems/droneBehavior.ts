import type { DroneConfig, DroneState } from '../entities/types'
import {
  add,
  clamp,
  dot,
  length,
  mul,
  normalize,
  randomRange,
  rotateTowards,
  sub,
  v3,
  withMagnitude,
} from '../utils/math'

type DroneStepArgs = {
  drone: DroneState
  dt: number
  elapsed: number
  config: DroneConfig
  swarmCenter: { x: number; y: number; z: number }
}

const desiredHeadingForBehavior = ({
  drone,
  elapsed,
  config,
  swarmCenter,
}: Omit<DroneStepArgs, 'dt'>): { x: number; y: number; z: number } => {
  const routeDir = normalize(sub(drone.destination, drone.source))
  const lateral = normalize(v3(-routeDir.z, 0, routeDir.x))

  switch (drone.behavior) {
    case 'straight':
      return routeDir
    case 'zigzag': {
      const sway = Math.sin(elapsed * config.zigZagFrequency + drone.phase) * config.zigZagAmplitude
      return normalize(add(routeDir, mul(lateral, sway * 0.03)))
    }
    case 'random-evasive': {
      const yaw = Math.sin(elapsed * 3 + drone.phase) * 0.8 + randomRange(-0.2, 0.2)
      const pitch = Math.sin(elapsed * 2 + drone.phase * 0.2) * 0.2
      return normalize(add(add(routeDir, mul(lateral, yaw * 0.35)), v3(0, pitch, 0)))
    }
    case 'circular-loiter': {
      const angle = elapsed * 0.45 + drone.phase
      const tangent = v3(-Math.sin(angle), 0, Math.cos(angle))
      return normalize(tangent)
    }
    case 'waypoint': {
      const current = drone.waypoints[drone.waypointIndex] ?? drone.waypoints[0] ?? v3(200, drone.altitude, 0)
      return normalize(sub(current, drone.position))
    }
    case 'swarm': {
      const cohesion = sub(swarmCenter, drone.position)
      const drift = normalize(add(routeDir, mul(lateral, Math.sin(elapsed + drone.phase) * 0.45)))
      return normalize(add(mul(cohesion, 0.12), drift))
    }
    default:
      return drone.heading
  }
}

export const updateDrone = (args: DroneStepArgs): DroneState => {
  const { drone, dt, elapsed, config, swarmCenter } = args
  if (!drone.alive) return drone

  const desiredHeading = desiredHeadingForBehavior({ drone, elapsed, config, swarmCenter })
  const maxTurnRad = (drone.turnRateDeg * Math.PI * dt) / 180
  const nextHeading = rotateTowards(drone.heading, desiredHeading, maxTurnRad)
  const desiredVelocity = withMagnitude(nextHeading, drone.speed)
  const accelGain = Math.min(1, dt * 2.2)
  const nextVelocity = add(drone.velocity, mul(sub(desiredVelocity, drone.velocity), accelGain))
  const nextPosition = add(drone.position, mul(nextVelocity, dt))
  nextPosition.y = Math.max(8, drone.altitude + Math.sin(elapsed * 0.6 + drone.phase) * 4)

  // Keep drones near their source->destination corridor so they do not drift out of playable framing.
  const route = sub(drone.destination, drone.source)
  const routeLen = Math.max(1, length(route))
  const routeDir = normalize(route)
  const lateralAxis = normalize(v3(-routeDir.z, 0, routeDir.x))
  const toPos = sub(nextPosition, drone.source)
  const along = clamp(dot(toPos, routeDir), 0, routeLen)
  const corridorCenter = add(drone.source, mul(routeDir, along))
  const lateralOffset = dot(sub(nextPosition, corridorCenter), lateralAxis)
  const maxLateral = 150
  if (Math.abs(lateralOffset) > maxLateral) {
    const clampedLateral = Math.sign(lateralOffset) * maxLateral
    const corrected = add(corridorCenter, mul(lateralAxis, clampedLateral))
    nextPosition.x = corrected.x
    nextPosition.z = corrected.z
  }

  let waypointIndex = drone.waypointIndex
  if (drone.behavior === 'waypoint') {
    const target = drone.waypoints[waypointIndex]
    if (target) {
      const d = Math.hypot(
        target.x - nextPosition.x,
        target.y - nextPosition.y,
        target.z - nextPosition.z,
      )
      if (d < 15) {
        waypointIndex = (waypointIndex + 1) % drone.waypoints.length
      }
    }
  }

  const destinationDistance = Math.hypot(
    drone.destination.x - nextPosition.x,
    drone.destination.y - nextPosition.y,
    drone.destination.z - nextPosition.z,
  )
  if (destinationDistance < 22) {
    nextPosition.x = drone.source.x
    nextPosition.y = drone.source.y
    nextPosition.z = drone.source.z
    waypointIndex = 0
  }

  if (
    nextPosition.x < -420 ||
    nextPosition.x > 420 ||
    nextPosition.y < 4 ||
    nextPosition.y > 260 ||
    nextPosition.z < -340 ||
    nextPosition.z > 340
  ) {
    nextPosition.x = drone.source.x
    nextPosition.y = drone.source.y
    nextPosition.z = drone.source.z
    waypointIndex = 0
  }

  return {
    ...drone,
    heading: nextHeading,
    velocity: nextVelocity,
    position: nextPosition,
    waypointIndex,
  }
}
