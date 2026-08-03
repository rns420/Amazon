import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { PageHeader, EmptyState, Spinner } from '../components/ui'
import { Asset } from '../lib/types'
import { Image as ImageIcon, Search, Tag } from 'lucide-react'

export default function AssetLibrary() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('assets').select('*').order('created_at', { ascending: false })
      setAssets((data ?? []) as Asset[])
      setLoading(false)
    })()
  }, [])

  const filtered = assets.filter((a) => {
    const matchQuery = a.name.toLowerCase().includes(query.toLowerCase()) || a.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
    const matchType = typeFilter === 'all' || a.type === typeFilter
    return matchQuery && matchType
  })

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      <PageHeader title="Asset Library" subtitle="Store and organize your images, covers, interiors, and exported files" />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" /><input className="input pl-9" placeholder="Search assets or tags\u2026" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
        <select className="input sm:w-44" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}><option value="all">All Types</option><option value="image">Images</option><option value="cover">Covers</option><option value="interior">Interiors</option><option value="export">Exports</option><option value="font">Fonts</option></select>
      </div>

      {loading ? (<div className="card p-10"><Spinner /></div>) : filtered.length === 0 ? (
        <EmptyState icon={<ImageIcon className="w-7 h-7" />} title="No assets yet" message="Assets you create or export will appear here. Generate a puzzle book or cover to populate your library." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((a) => (
            <div key={a.id} className="card p-4 hover:shadow-pop transition">
              <div className="w-full aspect-square bg-bg-soft rounded-lg flex items-center justify-center mb-3"><ImageIcon className="w-8 h-8 text-fg-muted" /></div>
              <div className="text-sm font-medium text-fg truncate">{a.name}</div>
              <div className="text-xs text-fg-muted mt-0.5 capitalize">{a.type}</div>
              {a.tags.length > 0 && (<div className="flex flex-wrap gap-1 mt-2">{a.tags.slice(0, 3).map((t) => <span key={t} className="badge bg-bg-soft text-fg-muted text-[10px]"><Tag className="w-2.5 h-2.5" />{t}</span>)}</div>)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
