import type { Vec3 } from '../entities/types'

export const v3 = (x = 0, y = 0, z = 0): Vec3 => ({ x, y, z })

export const add = (a: Vec3, b: Vec3): Vec3 => v3(a.x + b.x, a.y + b.y, a.z + b.z)
export const sub = (a: Vec3, b: Vec3): Vec3 => v3(a.x - b.x, a.y - b.y, a.z - b.z)
export const mul = (a: Vec3, s: number): Vec3 => v3(a.x * s, a.y * s, a.z * s)
export const dot = (a: Vec3, b: Vec3): number => a.x * b.x + a.y * b.y + a.z * b.z
export const length = (a: Vec3): number => Math.sqrt(dot(a, a))
export const distance = (a: Vec3, b: Vec3): number => length(sub(a, b))
export const normalize = (a: Vec3): Vec3 => {
  const l = length(a)
  return l > 1e-6 ? mul(a, 1 / l) : v3(0, 0, 0)
}
export const clamp = (v: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, v))
export const lerp = (a: Vec3, b: Vec3, t: number): Vec3 => add(a, mul(sub(b, a), t))
export const deg2rad = (d: number): number => (d * Math.PI) / 180

export const rotateTowards = (from: Vec3, to: Vec3, maxRadiansDelta: number): Vec3 => {
  const f = normalize(from)
  const t = normalize(to)
  const cosine = clamp(dot(f, t), -1, 1)
  const angle = Math.acos(cosine)
  if (angle < 1e-6) return t

  const step = Math.min(1, maxRadiansDelta / angle)
  return normalize(lerp(f, t, step))
}

export const withMagnitude = (dir: Vec3, mag: number): Vec3 => mul(normalize(dir), mag)

export const randomRange = (min: number, max: number): number =>
  min + Math.random() * (max - min)

export const limitMagnitude = (vec: Vec3, maxMag: number): Vec3 => {
  const mag = length(vec)
  if (mag <= maxMag) return vec
  return mul(vec, maxMag / mag)
}
