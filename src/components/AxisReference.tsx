import { Text } from '@react-three/drei'

export const AxisReference = () => {
  return (
    <group position={[0, 0.2, 0]}>
      <axesHelper args={[80]} />

      <mesh position={[84, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[1.4, 4, 14]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <mesh position={[0, 84, 0]}>
        <coneGeometry args={[1.4, 4, 14]} />
        <meshStandardMaterial color="#10b981" />
      </mesh>
      <mesh position={[0, 0, 84]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[1.4, 4, 14]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>

      <Text position={[89, 1.3, 0]} fontSize={4.2} color="#fca5a5" anchorX="center" anchorY="middle">
        X
      </Text>
      <Text position={[0, 89, 0]} fontSize={4.2} color="#6ee7b7" anchorX="center" anchorY="middle">
        Y
      </Text>
      <Text position={[0, 1.3, 89]} fontSize={4.2} color="#93c5fd" anchorX="center" anchorY="middle">
        Z
      </Text>
    </group>
  )
}
