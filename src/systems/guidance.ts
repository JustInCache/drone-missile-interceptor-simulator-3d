import type { GuidanceMode, MissileState, Vec3, DroneState } from '../entities/types'
import { add, distance, mul, normalize, sub, v3, dot } from '../utils/math'

const relativeKinematics = (missile: MissileState, target: DroneState) => {
  const relPos = sub(target.position, missile.position)
  const relVel = sub(target.velocity, missile.velocity)
  const range = Math.max(distance(target.position, missile.position), 1e-6)
  return { relPos, relVel, range }
}

const purePursuitDirection = (missile: MissileState, target: DroneState): Vec3 =>
  // Pure pursuit points directly at the current target location.
  normalize(sub(target.position, missile.position))

const leadPursuitDirection = (missile: MissileState, target: DroneState): Vec3 => {
  const rel = relativeKinematics(missile, target)
  const missileSpeed = Math.max(1, Math.hypot(missile.velocity.x, missile.velocity.y, missile.velocity.z))
  const lookAhead = Math.min(3.2, rel.range / missileSpeed)
  // Lead pursuit predicts where the target will be after a short TOF estimate.
  const aimPoint = add(target.position, mul(target.velocity, lookAhead))
  return normalize(sub(aimPoint, missile.position))
}

const proportionalNavigationDirection = (missile: MissileState, target: DroneState): Vec3 => {
  const { relPos, relVel, range } = relativeKinematics(missile, target)
  const los = normalize(relPos)
  const closingSpeed = -dot(relVel, los)
  const navConstant = 3.2

  // PN commands lateral acceleration proportional to LOS angular rate and closing velocity.
  const losRate = sub(relVel, mul(los, dot(relVel, los)))
  const normalAccel = mul(losRate, (navConstant * Math.max(0.1, closingSpeed)) / Math.max(range, 1))
  const targetVector = add(mul(los, Math.max(5, closingSpeed)), normalAccel)
  return normalize(targetVector)
}

export const getGuidanceDirection = (
  mode: GuidanceMode,
  missile: MissileState,
  target: DroneState,
): Vec3 => {
  switch (mode) {
    case 'pure-pursuit':
      return purePursuitDirection(missile, target)
    case 'lead-pursuit':
      return leadPursuitDirection(missile, target)
    case 'proportional-navigation':
      return proportionalNavigationDirection(missile, target)
    default:
      return v3(1, 0, 0)
  }
}
