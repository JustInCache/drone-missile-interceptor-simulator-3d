import { useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { useSimStore } from '../store/simStore'
import { ExternalModel } from './models/ExternalModel'
import { ProceduralMissileModel } from './models/ProceduralModels'
import { missileModelAssets } from '../utils/modelAssets'

const missileModelUrl = missileModelAssets[0].url

export const MissileMeshes = () => {
  const camera = useThree((s) => s.camera)
  const missiles = useSimStore((s) => s.missiles)
  const setSelectedMissile = useSimStore((s) => s.setSelectedMissile)
  const selectedMissileId = useSimStore((s) => s.selectedMissileId)

  const rendered = useMemo(
    () => missiles.filter((missile) => missile.alive),
    [missiles],
  )

  return (
    <>
      {rendered.map((missile) => (
        (() => {
          const selected = missile.id === selectedMissileId
          const dx = missile.position.x - camera.position.x
          const dy = missile.position.y - camera.position.y
          const dz = missile.position.z - camera.position.z
          const distanceToCamera = Math.sqrt(dx * dx + dy * dy + dz * dz)
          const hiDetail = selected || distanceToCamera < 220

          return (
            <group
              key={missile.id}
              position={[missile.position.x, missile.position.y, missile.position.z]}
              rotation={[
                0,
                -Math.atan2(missile.velocity.z, missile.velocity.x),
                Math.atan2(missile.velocity.y, Math.hypot(missile.velocity.x, missile.velocity.z)),
              ]}
              onClick={(event) => {
                event.stopPropagation()
                setSelectedMissile(missile.id)
              }}
            >
              {hiDetail ? (
                <ExternalModel
                  url={missileModelUrl}
                  scale={1.05}
                  fallback={<ProceduralMissileModel selected={selected} />}
                />
              ) : (
                <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.18, 0.28, 2.8, 8]} />
                  <meshStandardMaterial color={selected ? '#fde68a' : '#cbd5e1'} metalness={0.42} roughness={0.45} />
                </mesh>
              )}
            </group>
          )
        })()
      ))}
    </>
  )
}

export const ExplosionBursts = () => {
  const explosions = useSimStore((s) => s.explosions)
  return (
    <>
      {explosions.map((exp) => (
        <FireExplosion key={exp.id} ttl={exp.ttl} position={[exp.position.x, exp.position.y, exp.position.z]} />
      ))}
    </>
  )
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))
const fract = (v: number) => v - Math.floor(v)
const noise = (v: number) => fract(Math.sin(v * 12.9898) * 43758.5453)

const FireExplosion = ({
  ttl,
  position,
}: {
  ttl: number
  position: [number, number, number]
}) => {
  const life = 2.2
  const t = clamp01((life - ttl) / life)
  const fade = 1 - t
  const seed = position[0] * 0.173 + position[1] * 0.317 + position[2] * 0.613
  const flamePulse = 1 + Math.sin((1 - ttl) * 22 + seed) * 0.08

  const sparkDirs = useMemo(
    () =>
      Array.from({ length: 12 }, (_, idx) => {
        const n1 = noise(seed + idx * 1.13)
        const n2 = noise(seed + idx * 2.71 + 9.1)
        const yaw = n1 * Math.PI * 2
        const pitch = (n2 - 0.5) * 0.7
        const c = Math.cos(pitch)
        return [Math.cos(yaw) * c, Math.sin(pitch), Math.sin(yaw) * c] as [number, number, number]
      }),
    [seed],
  )

  return (
    <group position={position}>
      <pointLight color="#ff8a3d" intensity={10 * fade} distance={55} decay={2} />

      <mesh>
        <sphereGeometry args={[(2.6 + t * 14) * flamePulse, 24, 24]} />
        <meshStandardMaterial
          color="#ff8a1e"
          emissive="#ff4300"
          emissiveIntensity={2.5 * fade}
          transparent
          opacity={0.85 * fade}
          depthWrite={false}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[4.6 + t * 20, 20, 20]} />
        <meshBasicMaterial color="#ffca75" transparent opacity={0.42 * fade} depthWrite={false} />
      </mesh>

      <mesh position={[0, t * 4.2, 0]}>
        <sphereGeometry args={[2 + t * 15, 18, 18]} />
        <meshStandardMaterial
          color="#2b2b2b"
          emissive="#120d0a"
          emissiveIntensity={0.3}
          transparent
          opacity={0.45 * Math.sqrt(fade)}
          roughness={1}
          metalness={0}
          depthWrite={false}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.35, 0]}>
        <torusGeometry args={[3 + t * 26, 0.44, 12, 44]} />
        <meshBasicMaterial color="#ffdca8" transparent opacity={0.5 * fade} depthWrite={false} />
      </mesh>

      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[4 + t * 10, 5.2 + t * 16, 1.8 + t * 2, 20]} />
        <meshBasicMaterial color="#ff6a00" transparent opacity={0.24 * fade} depthWrite={false} />
      </mesh>

      {sparkDirs.map((dir, idx) => {
        const d = 3 + t * 28
        const sparkSize = 0.14 + (idx % 4) * 0.04
        return (
          <mesh key={idx} position={[dir[0] * d, dir[1] * d + 0.6, dir[2] * d]}>
            <sphereGeometry args={[sparkSize, 8, 8]} />
            <meshBasicMaterial color="#ffe08a" transparent opacity={0.85 * fade} />
          </mesh>
        )
      })}
    </group>
  )
}
