import { useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { ExternalModel } from './models/ExternalModel'
import { ProceduralDroneModel } from './models/ProceduralModels'
import { useSimStore } from '../store/simStore'
import { droneModelAssets } from '../utils/modelAssets'

const colorByType: Record<string, string> = {
  recon: '#8dd9ff',
  combat: '#f0c27b',
  hypersonic: '#f97084',
}

const modelByType: Record<string, string> = {
  recon: droneModelAssets[0].url,
  combat: droneModelAssets[1].url,
  hypersonic: droneModelAssets[2].url,
}

export const DroneInstances = () => {
  const camera = useThree((s) => s.camera)
  const drones = useSimStore((s) => s.drones)
  const selectedTargetId = useSimStore((s) => s.selectedTargetId)
  const setSelectedTarget = useSimStore((s) => s.setSelectedTarget)
  const alive = useMemo(() => drones.filter((d) => d.alive), [drones])
  const hiDetailIds = useMemo(() => {
    const sorted = [...alive]
      .map((drone) => {
        const dx = drone.position.x - camera.position.x
        const dy = drone.position.y - camera.position.y
        const dz = drone.position.z - camera.position.z
        return { id: drone.id, dist: Math.sqrt(dx * dx + dy * dy + dz * dz) }
      })
      .sort((a, b) => a.dist - b.dist)
    const near = sorted.filter((entry) => entry.dist < 170).slice(0, 10).map((entry) => entry.id)
    if (selectedTargetId && !near.includes(selectedTargetId)) near.unshift(selectedTargetId)
    return new Set(near)
  }, [alive, camera.position.x, camera.position.y, camera.position.z, selectedTargetId])

  return (
    <>
      {alive.map((drone) => {
        const dx = drone.position.x - camera.position.x
        const dy = drone.position.y - camera.position.y
        const dz = drone.position.z - camera.position.z
        const distanceToCamera = Math.sqrt(dx * dx + dy * dy + dz * dz)
        const yaw = -Math.atan2(drone.heading.z, drone.heading.x)
        const pitch = Math.atan2(
          drone.heading.y,
          Math.hypot(drone.heading.x, drone.heading.z),
        )
        const selected = drone.id === selectedTargetId
        const hiDetail = hiDetailIds.has(drone.id)
        const farScale = hiDetail ? 1 : Math.min(2.1, Math.max(1, distanceToCamera / 185))
        const baseScale = drone.type === 'hypersonic' ? 1.18 : 1

        return (
          <group
            key={drone.id}
            position={[drone.position.x, drone.position.y, drone.position.z]}
            rotation={[0, yaw, pitch]}
            scale={baseScale * farScale}
            onClick={(event) => {
              event.stopPropagation()
              setSelectedTarget(drone.id)
            }}
          >
            {hiDetail ? (
              <ExternalModel
                url={modelByType[drone.type]}
                scale={drone.type === 'hypersonic' ? 0.95 : 1.2}
                fallback={<ProceduralDroneModel type={drone.type} selected={selected} />}
              />
            ) : (
              <group>
                <mesh castShadow>
                  <capsuleGeometry args={[0.26, 2.1, 4, 8]} />
                  <meshStandardMaterial
                    color={selected ? '#e2e8f0' : colorByType[drone.type] ?? '#8dd9ff'}
                    metalness={0.28}
                    roughness={0.52}
                  />
                </mesh>
                <mesh castShadow position={[-0.15, 0, 0]}>
                  <boxGeometry args={[0.55, 0.06, 1.5]} />
                  <meshStandardMaterial color="#64748b" metalness={0.22} roughness={0.62} />
                </mesh>
                <mesh castShadow position={[-1.05, 0.3, 0]}>
                  <boxGeometry args={[0.16, 0.5, 0.08]} />
                  <meshStandardMaterial color="#334155" metalness={0.2} roughness={0.62} />
                </mesh>
              </group>
            )}
            {selected && (
              <mesh position={[0, -1.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <torusGeometry args={[2.1, 0.08, 10, 28]} />
                <meshBasicMaterial color="#a5f3fc" transparent opacity={0.75} />
              </mesh>
            )}
          </group>
        )
      })}
    </>
  )
}
