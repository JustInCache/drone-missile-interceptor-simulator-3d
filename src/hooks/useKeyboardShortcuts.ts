import { useEffect } from 'react'
import { useSimStore } from '../store/simStore'
import type { CameraMode } from '../entities/types'

export const useKeyboardShortcuts = () => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const store = useSimStore.getState()
      const key = event.key.toLowerCase()

      if (key === ' ') {
        event.preventDefault()
        store.launchMissile()
      } else if (key === 'g') {
        store.cycleGuidanceMode()
      } else if (key === 'p') {
        store.togglePause()
      } else if (key === 'r') {
        store.resetSimulation()
      } else if (key === '1' || key === '2' || key === '3') {
        const modeMap: Record<string, CameraMode> = {
          '1': 'orbit',
          '2': 'third-person',
          '3': 'first-person',
        }
        store.setCameraMode(modeMap[key])
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
