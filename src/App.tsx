import { ControlPanel } from './components/ControlPanel'
import { HudOverlay } from './components/HudOverlay'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { SimulationScene } from './scenes/SimulationScene'
import { useSimStore } from './store/simStore'

function App() {
  useKeyboardShortcuts()
  const cameraMode = useSimStore((s) => s.cameraMode)
  const setCameraMode = useSimStore((s) => s.setCameraMode)
  const toggleDayMode = useSimStore((s) => s.toggleDayMode)

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="relative flex h-full w-full">
        <div className="relative flex-1">
          <SimulationScene />
          <HudOverlay />

          <div className="pointer-events-auto absolute bottom-4 left-4 z-20 rounded border border-slate-700/80 bg-slate-950/70 px-3 py-2 text-xs backdrop-blur">
            <div className="mb-2 flex items-center gap-2">
              <button className="btn-ui" onClick={() => setCameraMode('orbit')}>
                Orbit
              </button>
              <button className="btn-ui" onClick={() => setCameraMode('target-lock')}>
                Lock
              </button>
              <button className="btn-ui" onClick={() => setCameraMode('first-person')}>
                FPS
              </button>
              <button className="btn-ui" onClick={() => setCameraMode('third-person')}>
                Chase
              </button>
              <button className="btn-ui" onClick={toggleDayMode}>
                Day/Night
              </button>
            </div>
            <p className="opacity-80">
              Keys: `Space` launch, `G` guidance, `1/2/3` camera, `P` pause, `R` reset | mode: {cameraMode}
            </p>
          </div>
        </div>
        <ControlPanel />
      </div>
    </div>
  )
}

export default App
