const droneColorByType: Record<string, string> = {
  recon: '#8dd9ff',
  combat: '#f0c27b',
  hypersonic: '#f97084',
}

export const ProceduralDroneModel = ({ type, selected }: { type: string; selected: boolean }) => {
  const bodyColor = selected ? '#f8fafc' : droneColorByType[type] ?? '#8dd9ff'
  const detailColor = selected ? '#93c5fd' : '#334155'
  const wingColor = selected ? '#cbd5e1' : '#64748b'

  if (type === 'hypersonic') {
    return (
      <group>
        <mesh castShadow>
          <cylinderGeometry args={[0.34, 0.42, 4.8, 18]} />
          <meshStandardMaterial color={bodyColor} metalness={0.62} roughness={0.25} />
        </mesh>
        <mesh castShadow position={[2.85, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.38, 1.35, 16]} />
          <meshStandardMaterial color={bodyColor} metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh castShadow position={[0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[2.1, 1.9, 3]} />
          <meshStandardMaterial color={wingColor} metalness={0.24} roughness={0.6} />
        </mesh>
        <mesh castShadow position={[-2.15, 0.45, 0]}>
          <boxGeometry args={[0.28, 0.85, 0.06]} />
          <meshStandardMaterial color={detailColor} metalness={0.25} roughness={0.55} />
        </mesh>
      </group>
    )
  }

  return (
    <group>
      <mesh castShadow>
        <capsuleGeometry args={[0.36, 3.2, 8, 16]} />
        <meshStandardMaterial color={bodyColor} metalness={0.42} roughness={0.35} />
      </mesh>
      <mesh castShadow position={[2.35, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.38, 1.2, 16]} />
        <meshStandardMaterial color={bodyColor} metalness={0.4} roughness={0.38} />
      </mesh>
      <mesh castShadow position={[0.1, 0, 0]}>
        <boxGeometry args={[1.1, 0.08, 3.1]} />
        <meshStandardMaterial color={wingColor} metalness={0.2} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[-1.7, 0.5, 0]}>
        <boxGeometry args={[0.2, 0.9, 0.12]} />
        <meshStandardMaterial color={detailColor} metalness={0.2} roughness={0.6} />
      </mesh>
      <mesh castShadow position={[-1.6, 0.15, 0]}>
        <boxGeometry args={[0.42, 0.09, 1.1]} />
        <meshStandardMaterial color={detailColor} metalness={0.2} roughness={0.6} />
      </mesh>
      {type !== 'combat' ? (
        <mesh position={[0, 0.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.15, 0.045, 10, 22]} />
          <meshStandardMaterial color="#93c5fd" emissive="#0f172a" metalness={0.25} roughness={0.45} />
        </mesh>
      ) : (
        <mesh position={[0, 0.64, 0]}>
          <boxGeometry args={[2.4, 0.05, 0.22]} />
          <meshStandardMaterial color="#1e293b" metalness={0.12} roughness={0.8} />
        </mesh>
      )}
    </group>
  )
}

export const ProceduralMissileModel = ({ selected }: { selected: boolean }) => {
  const bodyColor = selected ? '#f8fafc' : '#e2e8f0'
  const accent = selected ? '#fcd34d' : '#ef4444'

  return (
    <group>
      <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.34, 0.42, 5.4, 20]} />
        <meshStandardMaterial color={bodyColor} metalness={0.75} roughness={0.22} />
      </mesh>
      <mesh castShadow position={[3.2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.39, 1.5, 20]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.55} roughness={0.25} />
      </mesh>
      <mesh castShadow position={[-2.65, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.23, 0.28, 0.7, 14]} />
        <meshStandardMaterial color="#334155" metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh castShadow position={[-1.95, 0.34, 0]}>
        <boxGeometry args={[0.9, 0.05, 0.9]} />
        <meshStandardMaterial color={accent} metalness={0.2} roughness={0.5} />
      </mesh>
      <mesh castShadow position={[-1.95, -0.34, 0]}>
        <boxGeometry args={[0.9, 0.05, 0.9]} />
        <meshStandardMaterial color={accent} metalness={0.2} roughness={0.5} />
      </mesh>
      <mesh castShadow position={[-1.95, 0, 0.34]} rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.9, 0.05, 0.9]} />
        <meshStandardMaterial color={accent} metalness={0.2} roughness={0.5} />
      </mesh>
      <mesh castShadow position={[-1.95, 0, -0.34]} rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.9, 0.05, 0.9]} />
        <meshStandardMaterial color={accent} metalness={0.2} roughness={0.5} />
      </mesh>
      <mesh position={[-3.1, 0, 0]}>
        <sphereGeometry args={[0.24, 12, 12]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.82} />
      </mesh>
    </group>
  )
}
