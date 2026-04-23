import { useFrame } from '@react-three/fiber'
import { useSimStore } from '../store/simStore'

export const useSimulationLoop = () => {
  useFrame((_, delta) => {
    useSimStore.getState().tick(Math.min(0.05, delta))
  })
}
