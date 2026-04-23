export type ModelAsset = {
  key: string
  label: string
  url: string
}

export const droneModelAssets: ModelAsset[] = [
  { key: 'drone-recon', label: 'Drone Recon', url: '/models/drones/recon.glb' },
  { key: 'drone-combat', label: 'Drone Combat', url: '/models/drones/combat.glb' },
  { key: 'drone-hypersonic', label: 'Drone Hypersonic', url: '/models/drones/hypersonic.glb' },
]

export const missileModelAssets: ModelAsset[] = [
  { key: 'missile-interceptor', label: 'Missile Interceptor', url: '/models/missiles/interceptor.glb' },
]

export const allModelAssets: ModelAsset[] = [...droneModelAssets, ...missileModelAssets]
