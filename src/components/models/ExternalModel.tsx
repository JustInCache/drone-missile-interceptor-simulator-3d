import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { Group } from 'three'
import { useOptionalGLTF } from '../../hooks/useOptionalGLTF'

export const ExternalModel = ({
  url,
  scale = 1,
  fallback,
}: {
  url: string
  scale?: number
  fallback: ReactNode
}) => {
  const source = useOptionalGLTF(url)
  const clone = useMemo(() => (source ? (source.clone(true) as Group) : null), [source])

  if (!clone) return <>{fallback}</>
  return <primitive object={clone} scale={scale} />
}
