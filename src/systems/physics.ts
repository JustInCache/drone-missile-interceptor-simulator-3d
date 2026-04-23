import type { MissileConfig, MissileState, Vec3 } from '../entities/types'
import { add, length, mul, rotateTowards, sub, withMagnitude } from '../utils/math'

export const updateMissileKinematics = (
  missile: MissileState,
  dt: number,
  desiredDirection: Vec3,
  cfg: MissileConfig,
): MissileState => {
  if (!missile.alive) return missile

  const maxTurn = (cfg.turnRateDeg * Math.PI * dt) / 180
  const currentDirection = withMagnitude(missile.velocity, 1)
  const turned = rotateTowards(currentDirection, desiredDirection, maxTurn)

  const currentSpeed = Math.max(1, length(missile.velocity))
  const nextSpeed = Math.max(5, currentSpeed + cfg.acceleration * dt - cfg.drag * currentSpeed * dt)
  const velocity = withMagnitude(turned, Math.min(cfg.speed, nextSpeed))

  const accel = mul(sub(velocity, missile.velocity), 1 / Math.max(dt, 1e-3))
  const position = add(missile.position, mul(velocity, dt))
  const traveled = length(sub(position, missile.position))

  return {
    ...missile,
    velocity,
    acceleration: accel,
    position,
    fuelRemaining: Math.max(0, missile.fuelRemaining - dt),
    distanceCovered: missile.distanceCovered + traveled,
    terminalGuidance: missile.targetId !== null && missile.fuelRemaining < 5,
  }
}

export const estimateHitProbability = (
  range: number,
  relSpeed: number,
  lockQuality: number,
  fuelRemaining: number,
): number => {
  const rangeFactor = Math.max(0, 1 - range / 450)
  const speedPenalty = Math.min(1, relSpeed / 350)
  const fuelFactor = Math.min(1, fuelRemaining / 8)
  const p = 0.05 + 0.5 * rangeFactor + 0.3 * lockQuality + 0.25 * fuelFactor - 0.25 * speedPenalty
  return Math.max(0, Math.min(0.99, p))
}
