import { create } from 'zustand'
import { makeDrone, makeMissile } from '../entities/factories'
import type {
  CameraMode,
  DroneState,
  GuidanceMode,
  InterceptLog,
  MissileState,
  ReplayFrame,
  ScenarioId,
  Vec3,
} from '../entities/types'
import { getGuidanceDirection } from '../systems/guidance'
import { updateMissileKinematics } from '../systems/physics'
import { updateDrone } from '../systems/droneBehavior'
import { defaultDroneConfig, defaultMissileConfig, defaultSimConfig, presets } from '../utils/scenarios'
import { add, distance, v3 } from '../utils/math'
import { makeId } from '../utils/id'
import { INTERCEPTOR_LAUNCH_POINT } from '../utils/engagementGeometry'

type Explosion = {
  id: string
  position: Vec3
  ttl: number
}

type SimStore = {
  running: boolean
  paused: boolean
  elapsed: number
  scenario: ScenarioId
  cameraMode: CameraMode
  dayMode: boolean
  selectedTargetId: string | null
  selectedMissileId: string | null
  drones: DroneState[]
  missiles: MissileState[]
  explosions: Explosion[]
  logs: InterceptLog[]
  guidanceMode: GuidanceMode
  replayFrames: ReplayFrame[]
  replayMode: boolean
  replayCursor: number
  recording: boolean
  recordAccumulator: number
  droneConfig: typeof defaultDroneConfig
  missileConfig: typeof defaultMissileConfig
  simConfig: typeof defaultSimConfig

  setCameraMode: (mode: CameraMode) => void
  toggleDayMode: () => void
  togglePause: () => void
  toggleRun: () => void
  resetSimulation: () => void
  loadScenario: (id: ScenarioId) => void
  setGuidanceMode: (mode: GuidanceMode) => void
  cycleGuidanceMode: () => void
  setSelectedTarget: (id: string | null) => void
  setSelectedMissile: (id: string | null) => void
  updateDroneConfig: (patch: Partial<typeof defaultDroneConfig>) => void
  updateMissileConfig: (patch: Partial<typeof defaultMissileConfig>) => void
  updateSimConfig: (patch: Partial<typeof defaultSimConfig>) => void
  launchMissile: () => void
  tick: (dt: number) => void
  toggleReplay: () => void
}

const spawnFromConfig = (
  droneConfig: typeof defaultDroneConfig,
  missileConfig: typeof defaultMissileConfig,
) => {
  const drones = Array.from({ length: droneConfig.count }, (_, idx) => makeDrone(droneConfig, idx))
  return {
    drones,
    missiles: [] as MissileState[],
    selectedTargetId: drones[0]?.id ?? null,
    selectedMissileId: null as string | null,
    guidanceMode: missileConfig.guidanceMode,
  }
}

const getNextAliveTarget = (drones: DroneState[], preferred: string | null): DroneState | null => {
  if (preferred) {
    const match = drones.find((d) => d.id === preferred && d.alive)
    if (match) return match
  }
  return drones.find((d) => d.alive) ?? null
}

const guidanceOrder: GuidanceMode[] = ['pure-pursuit', 'lead-pursuit', 'proportional-navigation']

export const useSimStore = create<SimStore>((set, get) => {
  const initialSpawn = spawnFromConfig(defaultDroneConfig, defaultMissileConfig)
  return {
    running: false,
    paused: false,
    elapsed: 0,
    scenario: 'single',
    cameraMode: 'orbit',
    dayMode: true,
    selectedTargetId: initialSpawn.selectedTargetId,
    selectedMissileId: initialSpawn.selectedMissileId,
    drones: initialSpawn.drones,
    missiles: initialSpawn.missiles,
    explosions: [],
    logs: [],
    guidanceMode: initialSpawn.guidanceMode,
    replayFrames: [],
    replayMode: false,
    replayCursor: 0,
    recording: true,
    recordAccumulator: 0,
    droneConfig: defaultDroneConfig,
    missileConfig: defaultMissileConfig,
    simConfig: defaultSimConfig,

    setCameraMode: (mode) => set({ cameraMode: mode }),
    toggleDayMode: () => set((s) => ({ dayMode: !s.dayMode })),
    togglePause: () => set((s) => ({ paused: !s.paused })),
    toggleRun: () => set((s) => ({ running: !s.running, paused: false })),
    setGuidanceMode: (mode) =>
      set((s) => ({ guidanceMode: mode, missileConfig: { ...s.missileConfig, guidanceMode: mode } })),
    cycleGuidanceMode: () =>
      set((s) => {
        const idx = guidanceOrder.indexOf(s.guidanceMode)
        const next = guidanceOrder[(idx + 1) % guidanceOrder.length]
        return { guidanceMode: next, missileConfig: { ...s.missileConfig, guidanceMode: next } }
      }),
    setSelectedTarget: (id) => set({ selectedTargetId: id }),
    setSelectedMissile: (id) => set({ selectedMissileId: id }),
    updateDroneConfig: (patch) => set((s) => ({ droneConfig: { ...s.droneConfig, ...patch } })),
    updateMissileConfig: (patch) =>
      set((s) => ({
        missileConfig: { ...s.missileConfig, ...patch },
        guidanceMode: patch.guidanceMode ?? s.guidanceMode,
      })),
    updateSimConfig: (patch) => set((s) => ({ simConfig: { ...s.simConfig, ...patch } })),
    loadScenario: (id) =>
      set(() => {
        const preset = presets.find((p) => p.id === id) ?? presets[0]
        const spawned = spawnFromConfig(preset.drone, preset.missile)
        return {
          scenario: preset.id,
          droneConfig: preset.drone,
          missileConfig: preset.missile,
          simConfig: preset.sim,
          guidanceMode: preset.missile.guidanceMode,
          drones: spawned.drones,
          missiles: [],
          logs: [],
          explosions: [],
          selectedTargetId: spawned.selectedTargetId,
          selectedMissileId: null,
          elapsed: 0,
          replayFrames: [],
          replayMode: false,
          replayCursor: 0,
          running: false,
          paused: false,
          recordAccumulator: 0,
        }
      }),
    resetSimulation: () =>
      set((s) => {
        const spawned = spawnFromConfig(s.droneConfig, s.missileConfig)
        return {
          drones: spawned.drones,
          missiles: [],
          explosions: [],
          logs: [],
          selectedTargetId: spawned.selectedTargetId,
          selectedMissileId: null,
          elapsed: 0,
          replayFrames: [],
          replayMode: false,
          replayCursor: 0,
          running: false,
          paused: false,
          recordAccumulator: 0,
        }
      }),
    launchMissile: () =>
      set((s) => {
        const target = getNextAliveTarget(s.drones, s.selectedTargetId)
        const missile = makeMissile(
          { ...s.missileConfig, guidanceMode: s.guidanceMode },
          INTERCEPTOR_LAUNCH_POINT,
          target?.id ?? null,
          s.elapsed,
        )
        return {
          missiles: [...s.missiles, missile],
          selectedMissileId: missile.id,
          running: true,
          paused: false,
        }
      }),
    toggleReplay: () =>
      set((s) => ({
        replayMode: !s.replayMode,
        replayCursor: 0,
        running: s.replayFrames.length > 0 ? false : s.running,
      })),
    tick: (rawDt) => {
      const state = get()
      if (state.replayMode) {
        if (state.replayFrames.length === 0) return
        const nextCursor = Math.min(
          state.replayFrames.length - 1,
          state.replayCursor + Math.max(1, Math.floor(rawDt * 30)),
        )
        set({ replayCursor: nextCursor })
        return
      }
      if (!state.running || state.paused) return

      const dt = rawDt * state.simConfig.timeScale
      const elapsed = state.elapsed + dt

      const aliveDrones = state.drones.filter((d) => d.alive)
      const swarmCenter =
        aliveDrones.length > 0
          ? aliveDrones.reduce((acc, d) => add(acc, d.position), v3(0, 0, 0))
          : v3(0, 0, 0)
      if (aliveDrones.length > 0) {
        swarmCenter.x /= aliveDrones.length
        swarmCenter.y /= aliveDrones.length
        swarmCenter.z /= aliveDrones.length
      }

      const drones = state.drones.map((drone) =>
        updateDrone({ drone, dt, elapsed, config: state.droneConfig, swarmCenter }),
      )

      const dronesById = new Map(drones.map((d) => [d.id, d]))
      const logs = [...state.logs]
      const missEvents: InterceptLog[] = []
      const explosions = state.explosions
        .map((e) => ({ ...e, ttl: e.ttl - dt }))
        .filter((e) => e.ttl > 0)
      const destroyedTargets = new Set<string>()

      let missiles = state.missiles
        .map((missile) => {
          if (!missile.alive) return missile
          const target =
            (missile.targetId ? dronesById.get(missile.targetId) : null) ??
            getNextAliveTarget(drones, state.selectedTargetId)
          if (!target || !target.alive) {
            missEvents.push({
              missileId: missile.id,
              targetId: missile.targetId ?? 'none',
              success: false,
              timeToIntercept: elapsed - missile.launchedAt,
              distanceCovered: missile.distanceCovered,
              missDistance: 999,
              guidanceMode: state.guidanceMode,
              timestamp: Date.now(),
            })
            return { ...missile, alive: false }
          }

          // lock quality emulates seeker degradation with distance/signature.
          const range = distance(missile.position, target.position)
          const sig = target.radarSignature === 'high' ? 1 : 0.65
          const modePenalty =
            missile.lockMode === 'heat'
              ? target.type === 'hypersonic'
                ? 0.9
                : 1
              : target.type === 'recon'
                ? 0.85
                : 1
          const lockQuality = Math.max(0, Math.min(1, (1 - range / 500) * sig * modePenalty))
          if (lockQuality < 0.08 || missile.fuelRemaining <= 0) {
            missEvents.push({
              missileId: missile.id,
              targetId: target.id,
              success: false,
              timeToIntercept: elapsed - missile.launchedAt,
              distanceCovered: missile.distanceCovered,
              missDistance: range,
              guidanceMode: state.guidanceMode,
              timestamp: Date.now(),
            })
            return { ...missile, alive: false, fuelRemaining: Math.max(0, missile.fuelRemaining - dt) }
          }

          const desiredDirection = getGuidanceDirection(state.guidanceMode, missile, target)
          const guided = updateMissileKinematics(
            { ...missile, targetId: target.id, guidanceMode: state.guidanceMode },
            dt,
            desiredDirection,
            state.missileConfig,
          )
          const hitDistance = distance(guided.position, target.position)
          const hit = hitDistance <= state.missileConfig.explosionRadius
          if (hit) {
            destroyedTargets.add(target.id)
            explosions.push({ id: makeId('exp'), position: target.position, ttl: 2.2 })
            logs.push({
              missileId: guided.id,
              targetId: target.id,
              success: true,
              timeToIntercept: elapsed - guided.launchedAt,
              distanceCovered: guided.distanceCovered,
              missDistance: hitDistance,
              guidanceMode: state.guidanceMode,
              timestamp: Date.now(),
            })
            return { ...guided, alive: false }
          }
          return guided
        })
        .filter((missile) => {
          if (!missile.alive) return false
          const p = missile.position
          const inBounds = p.x < 500 && p.x > -400 && p.y > -5 && p.y < 360 && p.z > -380 && p.z < 380
          if (!inBounds) {
            missEvents.push({
              missileId: missile.id,
              targetId: missile.targetId ?? 'none',
              success: false,
              timeToIntercept: elapsed - missile.launchedAt,
              distanceCovered: missile.distanceCovered,
              missDistance: 1200,
              guidanceMode: state.guidanceMode,
              timestamp: Date.now(),
            })
          }
          return inBounds
        })

      const updatedDrones = drones.map((drone) =>
        destroyedTargets.has(drone.id) ? { ...drone, alive: false } : drone,
      )
      const remainingTargets = updatedDrones.filter((d) => d.alive)

      if (remainingTargets.length === 0 && missiles.length === 0) {
        missiles = []
      }

      const selectedTargetId =
        remainingTargets.find((d) => d.id === state.selectedTargetId)?.id ?? remainingTargets[0]?.id ?? null
      const selectedMissileId =
        missiles.find((m) => m.id === state.selectedMissileId)?.id ?? missiles[0]?.id ?? null

      const newAccumulator = state.recordAccumulator + dt
      let replayFrames = state.replayFrames
      if (state.recording && newAccumulator >= 1 / 12) {
        replayFrames = [
          ...replayFrames,
          {
            t: elapsed,
            drones: updatedDrones.map((d) => ({ id: d.id, position: d.position, alive: d.alive })),
            missiles: missiles.map((m) => ({
              id: m.id,
              position: m.position,
              alive: m.alive,
              fuelRemaining: m.fuelRemaining,
            })),
          },
        ].slice(-1400)
      }

      const shouldAutoPause = missiles.length === 0 && state.missiles.length > 0 && explosions.length === 0
      set({
        elapsed,
        drones: updatedDrones,
        missiles,
        logs: [...logs, ...missEvents],
        explosions,
        selectedTargetId,
        selectedMissileId,
        recordAccumulator: state.recording && newAccumulator >= 1 / 12 ? 0 : newAccumulator,
        replayFrames,
        running: shouldAutoPause ? false : state.running,
      })
    },
  }
})
