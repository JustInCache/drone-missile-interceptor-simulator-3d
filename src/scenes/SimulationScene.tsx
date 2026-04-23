import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { CameraRig } from '../components/CameraRig'
import { DroneInstances } from '../components/DroneInstances'
import { ExplosionBursts, MissileMeshes } from '../components/MissileMeshes'
import { VisualizationOverlays } from '../components/VisualizationOverlays'
import { World } from '../components/World'
import { useSimulationLoop } from '../hooks/useSimulationLoop'

const SimulationContent = () => {
  useSimulationLoop()

  return (
    <>
      <World />
      <DroneInstances />
      <MissileMeshes />
      <ExplosionBursts />
      <VisualizationOverlays />
      <CameraRig />
    </>
  )
}

export const SimulationScene = () => (
  <Canvas shadows camera={{ position: [-110, 80, 160], fov: 54 }}>
    <Suspense fallback={null}>
      <SimulationContent />
    </Suspense>
  </Canvas>
)
