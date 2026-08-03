import { useState } from 'react'
import { useAuth } from '../lib/auth'
import { useToast } from '../lib/toast'
import { PageHeader, Spinner } from '../components/ui'
import { BOOK_TYPES } from '../lib/constants'
import { Search, TrendingUp, Target, DollarSign, CircleAlert as AlertCircle, Sparkles } from 'lucide-react'

interface Niche {
  name: string
  demand: string
  competition: string
  profitability: string
  trend: string
  score: number
  bookType: string
  reasoning: string
  targetAudience: string
  suggestedPageCount: number
  suggestedPriceRange: string
}

export default function NicheFinder() {
  const { session } = useAuth()
  const { notify } = useToast()
  const [query, setQuery] = useState('')
  const [bookType, setBookType] = useState('puzzle')
  const [loading, setLoading] = useState(false)
  const [niches, setNiches] = useState<Niche[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runResearch = async () => {
    if (!query.trim()) { notify('Enter a topic to research.', 'error'); return }
    setLoading(true)
    setError(null)
    setNiches(null)
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/research`
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'niche', query: query.trim(), bookType }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? `Request failed (${res.status})`)
      }
      const json = await res.json()
      if (!json.success || !json.data?.niches) throw new Error('Invalid response from research service')
      setNiches(json.data.niches as Niche[])
      notify(`Found ${json.data.niches.length} niche opportunities.`, 'success')
    } catch (err: any) {
      setError(err.message ?? 'Failed to run research')
      notify('Research failed: ' + (err.message ?? 'Unknown error'), 'error')
    } finally {
      setLoading(false)
    }
  }

  const demandColor: Record<string, string> = { High: 'bg-success-50 text-success-600', Medium: 'bg-warning-50 text-warning-600', Low: 'bg-danger-50 text-danger-600' }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      <PageHeader title="Niche Finder" subtitle="AI-powered niche discovery for profitable KDP books" />

      <div className="card p-5 mb-6">
        <label className="label">Topic or keyword</label>
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" /><input className="input pl-9" placeholder="e.g. word search, sudoku, coloring, maze\u2026" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && runResearch()} /></div>
          <select className="input w-40" value={bookType} onChange={(e) => setBookType(e.target.value)}>{BOOK_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}</select>
          <button onClick={runResearch} disabled={loading} className="btn-primary whitespace-nowrap"><Sparkles className="w-4 h-4" /> {loading ? 'Analyzing\u2026' : 'Find Niches'}</button>
        </div>
      </div>

      {loading && <div className="card p-10"><Spinner /></div>}

      {error && (
        <div className="card p-4 mb-6 bg-danger-50 border-danger-500">
          <div className="flex items-start gap-2 text-sm text-danger-600"><AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /><div><div className="font-medium">Research Failed</div><div className="opacity-90">{error}</div></div></div>
        </div>
      )}

      {niches && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {niches.map((n) => (
            <div key={n.name} className="card p-5 hover:shadow-pop transition">
              <div className="flex items-start justify-between gap-2 mb-3"><h3 className="font-semibold text-fg text-sm leading-snug">{n.name}</h3><span className="badge bg-brand-50 text-brand-700 shrink-0">{n.score}</span></div>
              <div className="text-xs text-fg-muted mb-2">{n.bookType}</div>
              <p className="text-xs text-fg-soft mb-3 leading-relaxed">{n.reasoning}</p>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between"><span className="text-fg-muted flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Demand</span><span className={`badge ${demandColor[n.demand] ?? ''}`}>{n.demand}</span></div>
                <div className="flex items-center justify-between"><span className="text-fg-muted flex items-center gap-1"><Target className="w-3 h-3" /> Competition</span><span className={`badge ${demandColor[n.competition] ?? ''}`}>{n.competition}</span></div>
                <div className="flex items-center justify-between"><span className="text-fg-muted flex items-center gap-1"><DollarSign className="w-3 h-3" /> Profitability</span><span className={`badge ${demandColor[n.profitability] ?? ''}`}>{n.profitability}</span></div>
                <div className="flex items-center justify-between"><span className="text-fg-muted">Trend</span><span className="text-fg-soft">{n.trend}</span></div>
              </div>
              <div className="mt-3 pt-3 border-t border-border-soft space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-fg-muted">Audience</span><span className="text-fg-soft">{n.targetAudience}</span></div>
                <div className="flex justify-between"><span className="text-fg-muted">Suggested pages</span><span className="text-fg-soft">{n.suggestedPageCount}</span></div>
                <div className="flex justify-between"><span className="text-fg-muted">Price range</span><span className="text-fg-soft">{n.suggestedPriceRange}</span></div>
              </div>
              <div className="mt-3 pt-3 border-t border-border-soft">
                <div className="flex items-center justify-between text-xs"><span className="text-fg-muted">Opportunity Score</span>
                  <div className="flex items-center gap-2"><div className="w-20 h-1.5 bg-bg-soft rounded-full overflow-hidden"><div className="h-full bg-brand-500 rounded-full" style={{ width: `${n.score}%` }} /></div><span className="font-semibold text-fg">{n.score}/100</span></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !niches && !error && (
        <div className="card p-10 text-center text-fg-muted text-sm">Enter a topic above and click "Find Niches" to discover AI-analyzed opportunities.</div>
      )}
    </div>
  )
}
