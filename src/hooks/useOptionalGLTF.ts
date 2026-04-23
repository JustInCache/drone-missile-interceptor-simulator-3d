import { useEffect, useSyncExternalStore } from 'react'
import { Group, LoadingManager } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const cache = new Map<string, Group | null>()
const statusCache = new Map<string, AssetLoadStatus>()
const pendingLoads = new Set<string>()
const listeners = new Set<() => void>()

export type AssetLoadStatus = 'idle' | 'loading' | 'loaded' | 'fallback'

const notify = () => {
  listeners.forEach((listener) => listener())
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const ensureLoad = (url: string) => {
  if (cache.has(url) || pendingLoads.has(url)) return
  pendingLoads.add(url)
  statusCache.set(url, 'loading')
  notify()

  const manager = new LoadingManager()
  const loader = new GLTFLoader(manager)

  loader.load(
    url,
    (gltf) => {
      cache.set(url, gltf.scene)
      statusCache.set(url, 'loaded')
      pendingLoads.delete(url)
      notify()
    },
    undefined,
    () => {
      cache.set(url, null)
      statusCache.set(url, 'fallback')
      pendingLoads.delete(url)
      notify()
    },
  )
}

export const useOptionalGLTF = (url: string): Group | null => {
  useEffect(() => {
    ensureLoad(url)
  }, [url])

  return useSyncExternalStore(
    subscribe,
    () => cache.get(url) ?? null,
    () => cache.get(url) ?? null,
  )
}

export const useOptionalGLTFStatus = (url: string): AssetLoadStatus => {
  useEffect(() => {
    ensureLoad(url)
  }, [url])

  return useSyncExternalStore(
    subscribe,
    () => statusCache.get(url) ?? (pendingLoads.has(url) ? 'loading' : 'idle'),
    () => statusCache.get(url) ?? (pendingLoads.has(url) ? 'loading' : 'idle'),
  )
}
