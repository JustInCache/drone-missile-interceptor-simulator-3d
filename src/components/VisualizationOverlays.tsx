import { Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import { useSimStore } from '../store/simStore'
import { add, distance, mul, sub } from '../utils/math'
import { INTERCEPTOR_LAUNCH_POINT } from '../utils/engagementGeometry'

type Point3 = [number, number, number]
type Segment = [Point3, Point3]

const toPoint = (p: { x: number; y: number; z: number }): Point3 => [p.x, p.y, p.z]
const colorForId = (id: string): string => {
  let hash = 0
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  const hue = hash % 360
  return `hsl(${hue} 85% 62%)`
}

export const VisualizationOverlays = () => {
  const drones = useSimStore((s) => s.drones)
  const missiles = useSimStore((s) => s.missiles)
  const selectedTargetId = useSimStore((s) => s.selectedTargetId)
  const selectedMissileId = useSimStore((s) => s.selectedMissileId)
  const trailsRef = useRef<Map<string, Point3[]>>(new Map())
  const sampleAccum = useRef(0)
  const [trailEntries, setTrailEntries] = useState<[string, Point3[]][]>([])

  const selectedTarget = drones.find((d) => d.id === selectedTargetId && d.alive)
  const selectedMissile = missiles.find((m) => m.id === selectedMissileId && m.alive)

  useFrame((_, delta) => {
    sampleAccum.current += delta
    if (sampleAccum.current < 0.08) return
    sampleAccum.current = 0

    const aliveSet = new Set<string>()
    let changed = false

    drones.forEach((drone) => {
      if (!drone.alive) return
      aliveSet.add(drone.id)
      const p = toPoint(drone.position)
      const existing = trailsRef.current.get(drone.id)
      if (!existing) {
        trailsRef.current.set(drone.id, [toPoint(drone.source), p])
        changed = true
        return
      }
      const last = existing[existing.length - 1]
      if (!last || distance({ x: last[0], y: last[1], z: last[2] }, drone.position) > 0.45) {
        existing.push(p)
        if (existing.length > 72) existing.shift()
        changed = true
      }
    })

    Array.from(trailsRef.current.keys()).forEach((id) => {
      if (!aliveSet.has(id)) {
        trailsRef.current.delete(id)
        changed = true
      }
    })

    if (changed) {
      const snapshot = Array.from(trailsRef.current.entries()).filter(([, points]) => points.length > 1)
      setTrailEntries(snapshot)
    }
  })

  const dronePrediction = useMemo(() => {
    if (!selectedTarget) return []
    return Array.from({ length: 32 }, (_, i) => {
      const t = i * 0.25
      const p = add(selectedTarget.position, mul(selectedTarget.velocity, t))
      return toPoint(p)
    })
  }, [selectedTarget])

  const missilePrediction = useMemo(() => {
    if (!selectedMissile) return []
    return Array.from({ length: 24 }, (_, i) => {
      const t = i * 0.2
      const p = add(selectedMissile.position, mul(selectedMissile.velocity, t))
      return toPoint(p)
    })
  }, [selectedMissile])

  const trackingLines = useMemo(
    () =>
      missiles
        .filter((m) => m.alive && m.targetId)
        .map((m) => {
          const target = drones.find((d) => d.id === m.targetId && d.alive)
          return target ? [toPoint(m.position), toPoint(target.position)] : null
        })
        .filter((line): line is Segment => line !== null),
    [drones, missiles],
  )

  const radarCone = useMemo(() => {
    if (!selectedMissile || !selectedTarget) return null
    const d = sub(selectedTarget.position, selectedMissile.position)
    const yaw = Math.atan2(d.z, d.x)
    return {
      position: toPoint(selectedMissile.position),
      rotation: [Math.PI / 2, -yaw, 0] as [number, number, number],
    }
  }, [selectedMissile, selectedTarget])

  const routeLine = useMemo(() => {
    if (!selectedTarget) return null
    return [toPoint(selectedTarget.source), toPoint(selectedTarget.destination)] as [Point3, Point3]
  }, [selectedTarget])

  const fallbackTrails = useMemo(
    () =>
      drones
        .filter((d) => d.alive && !trailEntries.some(([id]) => id === d.id))
        .map((d) => ({
          id: d.id,
          points: [toPoint(d.source), toPoint(d.position)] as Point3[],
        })),
    [drones, trailEntries],
  )

  return (
    <>
      {dronePrediction.length > 1 && <Line points={dronePrediction} color="#56CCF2" lineWidth={1.6} dashed />}
      {missilePrediction.length > 1 && <Line points={missilePrediction} color="#EB5757" lineWidth={2} />}
      {routeLine && <Line points={routeLine} color="#22d3ee" lineWidth={1.4} dashed />}
      {trailEntries.map(([id, points]) => (
        <Line
          key={`trail-${id}`}
          points={points}
          color={colorForId(id)}
          lineWidth={id === selectedTargetId ? 1.8 : 1.1}
          transparent
          opacity={id === selectedTargetId ? 0.95 : 0.6}
        />
      ))}
      {fallbackTrails.map((trail) => (
        <Line
          key={`fallback-trail-${trail.id}`}
          points={trail.points}
          color={colorForId(trail.id)}
          lineWidth={trail.id === selectedTargetId ? 1.8 : 1.1}
          transparent
          opacity={trail.id === selectedTargetId ? 0.95 : 0.6}
        />
      ))}
      {trackingLines.map((points, idx) => (
        <Line key={idx} points={points} color="#b8d6ff" lineWidth={0.8} transparent opacity={0.35} />
      ))}
      {selectedTarget && (
        <>
          <mesh position={toPoint(selectedTarget.source)}>
            <sphereGeometry args={[3.2, 16, 16]} />
            <meshBasicMaterial color="#4ade80" transparent opacity={0.82} />
          </mesh>
          <mesh position={toPoint(selectedTarget.destination)}>
            <sphereGeometry args={[3.2, 16, 16]} />
            <meshBasicMaterial color="#fb7185" transparent opacity={0.82} />
          </mesh>
        </>
      )}
      <mesh position={toPoint(INTERCEPTOR_LAUNCH_POINT)}>
        <cylinderGeometry args={[2.8, 4.4, 4.4, 18]} />
        <meshStandardMaterial color="#fbbf24" emissive="#422006" metalness={0.25} roughness={0.42} />
      </mesh>
      {radarCone && (
        <mesh position={radarCone.position} rotation={radarCone.rotation}>
          <coneGeometry args={[18, 42, 22, 1, true]} />
          <meshBasicMaterial color="#66fcf1" transparent opacity={0.08} side={2} />
        </mesh>
      )}
    </>
  )
}
