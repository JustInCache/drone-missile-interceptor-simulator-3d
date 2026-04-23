import { Grid, Sky, Stars } from '@react-three/drei'
import { useMemo } from 'react'
import { BufferAttribute, PlaneGeometry } from 'three'
import { useSimStore } from '../store/simStore'
import { AxisReference } from './AxisReference'

const ElevatedTerrain = () => {
  const elevated = useSimStore((s) => s.simConfig.terrainElevation)
  const geometry = useMemo(() => {
    const g = new PlaneGeometry(1200, 1200, 120, 120)
    if (elevated) {
      const position = g.getAttribute('position')
      for (let i = 0; i < position.count; i += 1) {
        const x = position.getX(i)
        const y = position.getY(i)
        const z = Math.sin(x * 0.025) * 2.8 + Math.cos(y * 0.03) * 2.2
        position.setZ(i, z)
      }
      g.setAttribute('position', position as BufferAttribute)
      g.computeVertexNormals()
    }
    return g
  }, [elevated])

  return (
    <mesh rotation-x={-Math.PI / 2} geometry={geometry} receiveShadow>
      <meshStandardMaterial color={elevated ? '#2b4538' : '#355a42'} roughness={0.98} metalness={0.02} />
    </mesh>
  )
}

export const World = () => {
  const dayMode = useSimStore((s) => s.dayMode)
  return (
    <>
      <color attach="background" args={[dayMode ? '#88b6e6' : '#030712']} />
      <fog attach="fog" args={[dayMode ? '#9ec5ed' : '#020617', 220, 980]} />

      {dayMode ? (
        <Sky
          distance={450000}
          sunPosition={[140, 90, 70]}
          turbidity={2.2}
          rayleigh={1.1}
          mieCoefficient={0.006}
          mieDirectionalG={0.72}
        />
      ) : (
        <Stars radius={500} depth={180} count={2500} factor={4} saturation={0} fade speed={0.4} />
      )}

      <ambientLight intensity={dayMode ? 0.28 : 0.18} />
      <hemisphereLight intensity={dayMode ? 0.48 : 0.22} groundColor={dayMode ? '#2b4538' : '#0b1220'} />
      <directionalLight
        castShadow
        intensity={dayMode ? 0.95 : 0.36}
        position={dayMode ? [130, 180, 90] : [-50, 120, -60]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <ElevatedTerrain />

      <Grid
        args={[1200, 1200]}
        cellSize={20}
        cellThickness={0.5}
        sectionSize={100}
        sectionThickness={1.5}
        fadeDistance={500}
        fadeStrength={1}
        infiniteGrid
        position={[0, 0.03, 0]}
      />

      <AxisReference />
    </>
  )
}
