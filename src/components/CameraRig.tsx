import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import { Vector3 } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { useSimStore } from '../store/simStore'

const tmp = new Vector3()
const chaseOffset = new Vector3(-20, 8, 0)
const firstOffset = new Vector3(1, 1.1, 0)

export const CameraRig = () => {
  const camera = useThree((s) => s.camera)
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const mode = useSimStore((s) => s.cameraMode)
  const targetId = useSimStore((s) => s.selectedTargetId)
  const missileId = useSimStore((s) => s.selectedMissileId)
  const drones = useSimStore((s) => s.drones)
  const missiles = useSimStore((s) => s.missiles)

  useFrame(() => {
    if (mode === 'orbit') {
      const controls = controlsRef.current
      if (!controls) return
      const focusTarget =
        drones.find((d) => d.id === targetId && d.alive) ?? missiles.find((m) => m.id === missileId && m.alive)
      if (focusTarget) {
        const nextTarget = new Vector3(focusTarget.position.x, focusTarget.position.y, focusTarget.position.z)
        controls.target.lerp(nextTarget, 0.08)
        controls.update()
      }
      return
    }
    const target = drones.find((d) => d.id === targetId && d.alive)
    const missile = missiles.find((m) => m.id === missileId && m.alive)

    if (mode === 'target-lock' && target) {
      tmp.set(target.position.x + 30, target.position.y + 20, target.position.z + 35)
      camera.position.lerp(tmp, 0.08)
      camera.lookAt(target.position.x, target.position.y, target.position.z)
      return
    }
    if ((mode === 'third-person' || mode === 'first-person') && missile) {
      const dir = tmp.set(missile.velocity.x, missile.velocity.y, missile.velocity.z).normalize()
      const offset = mode === 'first-person' ? firstOffset : chaseOffset
      const camPos = tmp
        .copy(dir)
        .multiplyScalar(offset.x)
        .add(new Vector3(0, offset.y, offset.z))
        .add(new Vector3(missile.position.x, missile.position.y, missile.position.z))
      camera.position.lerp(camPos, 0.2)
      const look = new Vector3(
        missile.position.x + dir.x * 30,
        missile.position.y + dir.y * 30,
        missile.position.z + dir.z * 30,
      )
      camera.lookAt(look)
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enabled={mode === 'orbit' || mode === 'target-lock'}
      minDistance={8}
      maxDistance={900}
      zoomSpeed={1.25}
      dampingFactor={0.08}
      enableDamping
      enablePan
      enableZoom
      enableRotate
      mouseButtons={{ LEFT: 0, MIDDLE: 1, RIGHT: 2 }}
    />
  )
}
