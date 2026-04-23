import { allModelAssets } from '../utils/modelAssets'
import { useOptionalGLTFStatus, type AssetLoadStatus } from '../hooks/useOptionalGLTF'

const statusStyle: Record<AssetLoadStatus, string> = {
  idle: 'text-slate-300',
  loading: 'text-amber-300',
  loaded: 'text-emerald-300',
  fallback: 'text-rose-300',
}

const statusLabel: Record<AssetLoadStatus, string> = {
  idle: 'IDLE',
  loading: 'LOADING',
  loaded: 'LOADED',
  fallback: 'FALLBACK',
}

export const ModelStatusCard = () => {
  return (
    <div className="mt-2 rounded border border-slate-700/70 bg-slate-950/70 px-3 py-2 text-xs text-slate-200">
      <p className="font-semibold tracking-wide text-slate-100">Model Status</p>
      <div className="mt-1 space-y-1">
        {allModelAssets.map((asset) => (
          <ModelStatusRow key={asset.key} label={asset.label} url={asset.url} />
        ))}
      </div>
    </div>
  )
}

const ModelStatusRow = ({ label, url }: { label: string; url: string }) => {
  const status = useOptionalGLTFStatus(url)

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="truncate opacity-85">{label}</span>
      <span className={statusStyle[status]}>{statusLabel[status]}</span>
    </div>
  )
}
