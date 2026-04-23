import { useMemo } from 'react'
import { useSimStore } from '../store/simStore'
import { distance, length, sub } from '../utils/math'
import { estimateHitProbability } from '../systems/physics'
import { ModelStatusCard } from './ModelStatusCard'

const statClass = 'rounded border border-slate-700/70 bg-slate-950/70 px-3 py-2'

export const HudOverlay = () => {
  const elapsed = useSimStore((s) => s.elapsed)
  const logs = useSimStore((s) => s.logs)
  const guidanceMode = useSimStore((s) => s.guidanceMode)
  const selectedTargetId = useSimStore((s) => s.selectedTargetId)
  const selectedMissileId = useSimStore((s) => s.selectedMissileId)
  const drones = useSimStore((s) => s.drones)
  const missiles = useSimStore((s) => s.missiles)

  const telemetry = useMemo(() => {
    const target = drones.find((d) => d.id === selectedTargetId && d.alive)
    const missile = missiles.find((m) => m.id === selectedMissileId && m.alive)
    if (!target || !missile) {
      return {
        distance: 0,
        relativeVelocity: 0,
        lockStatus: 'NO LOCK',
        fuel: 0,
        guidanceMode,
        hitProbability: 0,
      }
    }
    const range = distance(target.position, missile.position)
    const relVelocity = length(sub(target.velocity, missile.velocity))
    const lockQuality = target.radarSignature === 'high' ? 0.85 : 0.62
    const hitProbability = estimateHitProbability(range, relVelocity, lockQuality, missile.fuelRemaining)
    return {
      distance: range,
      relativeVelocity: relVelocity,
      lockStatus: hitProbability > 0.35 ? 'LOCKED' : 'SEARCHING',
      fuel: missile.fuelRemaining,
      guidanceMode,
      hitProbability,
    }
  }, [drones, guidanceMode, missiles, selectedMissileId, selectedTargetId])

  const latestLog = useMemo(() => logs[logs.length - 1], [logs])

  return (
    <div className="pointer-events-none absolute left-4 top-4 z-20 max-w-[48rem]">
      <div className="grid grid-cols-2 gap-2 text-xs text-slate-100 md:grid-cols-3">
        <div className={statClass}>
          <p className="opacity-70">Target Distance</p>
          <p className="text-base font-semibold">{telemetry.distance.toFixed(1)} m</p>
        </div>
        <div className={statClass}>
          <p className="opacity-70">Relative Velocity</p>
          <p className="text-base font-semibold">{telemetry.relativeVelocity.toFixed(1)} m/s</p>
        </div>
        <div className={statClass}>
          <p className="opacity-70">Lock Status</p>
          <p className="text-base font-semibold">{telemetry.lockStatus}</p>
        </div>
        <div className={statClass}>
          <p className="opacity-70">Missile Fuel</p>
          <p className="text-base font-semibold">{telemetry.fuel.toFixed(1)} s</p>
        </div>
        <div className={statClass}>
          <p className="opacity-70">Guidance</p>
          <p className="text-base font-semibold">{telemetry.guidanceMode}</p>
        </div>
        <div className={statClass}>
          <p className="opacity-70">Hit Probability</p>
          <p className="text-base font-semibold">{(telemetry.hitProbability * 100).toFixed(0)}%</p>
        </div>
      </div>

      <div className="mt-2 rounded border border-slate-700/70 bg-slate-950/70 px-3 py-2 text-xs text-slate-200">
        <p>t = {elapsed.toFixed(2)}s</p>
        {latestLog ? (
          <p className="mt-1 text-emerald-300">
            Last intercept: {latestLog.success ? 'HIT' : 'MISS'} | TOF {latestLog.timeToIntercept.toFixed(2)}s |
            miss distance {latestLog.missDistance.toFixed(2)}m
          </p>
        ) : (
          <p className="mt-1 opacity-70">No intercept events yet.</p>
        )}
      </div>

      <ModelStatusCard />
    </div>
  )
}
