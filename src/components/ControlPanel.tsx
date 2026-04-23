import type { ReactNode } from 'react'
import { presets } from '../utils/scenarios'
import { useSimStore } from '../store/simStore'
import type { DroneBehavior, DroneType, GuidanceMode, LockMode, MissileType } from '../entities/types'

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="mb-3 block text-xs text-slate-300">
    <span className="mb-1 block font-medium tracking-wide text-slate-200">{label}</span>
    {children}
  </label>
)

const inputCls =
  'w-full rounded border border-slate-700 bg-slate-900/80 px-2 py-1 text-xs text-slate-100 outline-none focus:border-cyan-400'

export const ControlPanel = () => {
  const {
    running,
    paused,
    scenario,
    droneConfig,
    missileConfig,
    simConfig,
    guidanceMode,
    loadScenario,
    updateDroneConfig,
    updateMissileConfig,
    updateSimConfig,
    toggleRun,
    togglePause,
    resetSimulation,
    launchMissile,
    setGuidanceMode,
    toggleReplay,
  } = useSimStore()

  return (
    <aside className="pointer-events-auto w-[320px] max-w-[38vw] overflow-y-auto border-l border-slate-700/70 bg-slate-950/75 p-4 backdrop-blur-sm">
      <h2 className="mb-4 text-sm font-semibold tracking-wide text-cyan-300">Simulation Controls</h2>

      <Row label="Scenario">
        <select
          className={inputCls}
          value={scenario}
          onChange={(e) => loadScenario(e.target.value as 'single' | 'swarm' | 'zigzag')}
        >
          {presets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </Row>

      <section className="mb-4 rounded border border-slate-700/70 bg-slate-900/35 p-3">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-200">Drone Config</h3>
        <Row label="Type">
          <select
            className={inputCls}
            value={droneConfig.type}
            onChange={(e) => updateDroneConfig({ type: e.target.value as DroneType })}
          >
            <option value="recon">Recon</option>
            <option value="combat">Combat</option>
            <option value="hypersonic">Hypersonic</option>
          </select>
        </Row>
        <Row label="Behavior">
          <select
            className={inputCls}
            value={droneConfig.behavior}
            onChange={(e) => updateDroneConfig({ behavior: e.target.value as DroneBehavior })}
          >
            <option value="straight">Straight Path</option>
            <option value="zigzag">Zig-zag</option>
            <option value="random-evasive">Random Evasive</option>
            <option value="circular-loiter">Circular Loiter</option>
            <option value="waypoint">Waypoint Nav</option>
            <option value="swarm">Swarm</option>
          </select>
        </Row>
        <Row label={`Speed: ${droneConfig.speed.toFixed(0)} m/s`}>
          <input
            className="w-full accent-cyan-400"
            type="range"
            min={20}
            max={180}
            value={droneConfig.speed}
            onChange={(e) => updateDroneConfig({ speed: Number(e.target.value) })}
          />
        </Row>
        <Row label={`Drones: ${droneConfig.count}`}>
          <input
            className="w-full accent-cyan-400"
            type="range"
            min={1}
            max={50}
            value={droneConfig.count}
            onChange={(e) => updateDroneConfig({ count: Number(e.target.value) })}
          />
        </Row>
      </section>

      <section className="mb-4 rounded border border-slate-700/70 bg-slate-900/35 p-3">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-200">Missile Config</h3>
        <Row label="Type">
          <select
            className={inputCls}
            value={missileConfig.type}
            onChange={(e) => updateMissileConfig({ type: e.target.value as MissileType })}
          >
            <option value="basic">Basic Interceptor</option>
            <option value="pn">PN Missile</option>
            <option value="ai-assisted">AI Assisted</option>
          </select>
        </Row>
        <Row label="Guidance">
          <select
            className={inputCls}
            value={guidanceMode}
            onChange={(e) => setGuidanceMode(e.target.value as GuidanceMode)}
          >
            <option value="pure-pursuit">Pure Pursuit</option>
            <option value="lead-pursuit">Lead Pursuit</option>
            <option value="proportional-navigation">Proportional Navigation</option>
          </select>
        </Row>
        <Row label="Lock Mode">
          <select
            className={inputCls}
            value={missileConfig.lockMode}
            onChange={(e) => updateMissileConfig({ lockMode: e.target.value as LockMode })}
          >
            <option value="radar">Radar Guided</option>
            <option value="heat">Heat Seeking</option>
          </select>
        </Row>
        <Row label={`Max Speed: ${missileConfig.speed.toFixed(0)} m/s`}>
          <input
            className="w-full accent-rose-400"
            type="range"
            min={80}
            max={280}
            value={missileConfig.speed}
            onChange={(e) => updateMissileConfig({ speed: Number(e.target.value) })}
          />
        </Row>
      </section>

      <section className="rounded border border-slate-700/70 bg-slate-900/35 p-3">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-200">Simulation</h3>
        <Row label={`Time Scale: ${simConfig.timeScale.toFixed(2)}x`}>
          <input
            className="w-full accent-emerald-400"
            type="range"
            min={0.2}
            max={2}
            step={0.05}
            value={simConfig.timeScale}
            onChange={(e) => updateSimConfig({ timeScale: Number(e.target.value) })}
          />
        </Row>
        <Row label="Terrain">
          <label className="inline-flex items-center gap-2 text-xs text-slate-200">
            <input
              type="checkbox"
              checked={simConfig.terrainElevation}
              onChange={(e) => updateSimConfig({ terrainElevation: e.target.checked })}
            />
            Enable elevation
          </label>
        </Row>

        <div className="grid grid-cols-2 gap-2">
          <button className="btn-ui" onClick={toggleRun}>
            {running ? 'Stop' : 'Start'}
          </button>
          <button className="btn-ui" onClick={togglePause}>
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button className="btn-ui" onClick={launchMissile}>
            Launch
          </button>
          <button className="btn-ui" onClick={resetSimulation}>
            Reset
          </button>
          <button className="btn-ui col-span-2" onClick={toggleReplay}>
            Replay Playback
          </button>
        </div>
      </section>
    </aside>
  )
}
