import { useState } from 'react'
import { useAuth } from '../lib/auth'
import { useToast } from '../lib/toast'
import { PageHeader, Spinner } from '../components/ui'
import { KDP_MARKETPLACES, KDP_CATEGORIES } from '../lib/constants'
import { TrendingUp, Star, DollarSign, ChartBar as BarChart3, Filter, Search, CircleAlert as AlertCircle, Lightbulb } from 'lucide-react'

interface MarketData {
  avgPrice: number
  opportunityScore: number
  difficultyScore: number
  estMonthlyRevenue: number
  bestSellers: { title: string; price: string; reviews: number; bsr: string; estSales: number; rating: number }[]
  gaps: { area: string; detail: string; opportunity: string }[]
  trends: { trend: string; direction: string; detail: string }[]
  recommendations: string[]
}

export default function MarketResearch() {
  const { session } = useAuth()
  const { notify } = useToast()
  const [category, setCategory] = useState('Puzzles & Games')
  const [marketplace, setMarketplace] = useState('US')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<MarketData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runResearch = async () => {
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/research`
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'market', query: category, country: KDP_MARKETPLACES.find((m) => m.code === marketplace)?.label }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? `Request failed (${res.status})`)
      }
      const json = await res.json()
      if (!json.success || !json.data) throw new Error('Invalid response from research service')
      setData(json.data as MarketData)
      notify('Market research complete.', 'success')
    } catch (err: any) {
      setError(err.message ?? 'Failed to run research')
      notify('Research failed: ' + (err.message ?? 'Unknown error'), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      <PageHeader title="Market Research" subtitle="AI-powered Amazon KDP marketplace analysis" />

      <div className="card p-5 mb-6">
        <div className="flex items-center gap-2 mb-4"><Filter className="w-4 h-4 text-fg-muted" /><h3 className="text-sm font-semibold text-fg">Research Parameters</h3></div>
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <div><label className="label">Category</label><select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>{KDP_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label className="label">Marketplace</label><select className="input" value={marketplace} onChange={(e) => setMarketplace(e.target.value)}>{KDP_MARKETPLACES.map((m) => <option key={m.code} value={m.code}>{m.label}</option>)}</select></div>
        </div>
        <button onClick={runResearch} disabled={loading} className="btn-primary"><Search className="w-4 h-4" /> {loading ? 'Analyzing\u2026' : 'Run AI Research'}</button>
      </div>

      {loading && <div className="card p-10"><Spinner /></div>}

      {error && (
        <div className="card p-4 mb-6 bg-danger-50 border-danger-500">
          <div className="flex items-start gap-2 text-sm text-danger-600"><AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /><div><div className="font-medium">Research Failed</div><div className="opacity-90">{error}</div></div></div>
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard label="Avg. Price" value={`$${data.avgPrice.toFixed(2)}`} icon={<DollarSign className="w-5 h-5" />} />
            <MetricCard label="Opportunity Score" value={`${data.opportunityScore}/100`} icon={<TrendingUp className="w-5 h-5" />} accent="bg-success-50 text-success-600" />
            <MetricCard label="Difficulty Score" value={`${data.difficultyScore}/100`} icon={<BarChart3 className="w-5 h-5" />} accent="bg-warning-50 text-warning-600" />
            <MetricCard label="Est. Monthly Revenue" value={`$${data.estMonthlyRevenue.toLocaleString()}`} icon={<Star className="w-5 h-5" />} accent="bg-accent-50 text-accent-600" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <div className="card p-5">
              <h3 className="font-semibold text-fg mb-4">Bestselling Books</h3>
              <div className="space-y-3">
                {data.bestSellers?.map((b, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-bg-soft rounded-lg">
                    <div><div className="text-sm font-medium text-fg">{b.title}</div><div className="text-xs text-fg-muted">{b.price} \u00b7 {b.reviews} reviews \u00b7 {b.bsr} BSR \u00b7 {b.rating}\u2605</div></div>
                    <div className="text-sm font-semibold text-success-600">{b.estSales}/mo</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-5">
              <h3 className="font-semibold text-fg mb-4">Gap Analysis</h3>
              <div className="space-y-3">
                {data.gaps?.map((g, i) => (
                  <div key={i} className="p-3 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-1"><div className="text-sm font-medium text-fg">{g.area}</div><span className={`badge ${g.opportunity === 'high' ? 'bg-success-50 text-success-600' : g.opportunity === 'medium' ? 'bg-warning-50 text-warning-600' : 'bg-bg-soft text-fg-muted'}`}>{g.opportunity}</span></div>
                    <div className="text-xs text-fg-muted">{g.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {data.trends && data.trends.length > 0 && (
            <div className="card p-5 mb-6">
              <h3 className="font-semibold text-fg mb-4">Market Trends</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.trends.map((t, i) => (
                  <div key={i} className="p-3 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-1"><div className="text-sm font-medium text-fg">{t.trend}</div><span className={`badge ${t.direction === 'growing' ? 'bg-success-50 text-success-600' : t.direction === 'declining' ? 'bg-danger-50 text-danger-600' : 'bg-bg-soft text-fg-muted'}`}>{t.direction}</span></div>
                    <div className="text-xs text-fg-muted">{t.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.recommendations && data.recommendations.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-fg mb-4 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-accent-500" /> AI Recommendations</h3>
              <div className="space-y-2">
                {data.recommendations.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-fg-soft"><span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">{i + 1}</span><span>{r}</span></div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!loading && !data && !error && (
        <div className="card p-10 text-center text-fg-muted text-sm">Select a category and marketplace, then click "Run AI Research" to get started.</div>
      )}
    </div>
  )
}

function MetricCard({ label, value, icon, accent }: any) {
  return (<div className="card p-5"><div className="flex items-center justify-between"><div><div className="text-sm text-fg-muted">{label}</div><div className="text-xl font-bold text-fg mt-1">{value}</div></div><div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent ?? 'bg-brand-50 text-brand-600'}`}>{icon}</div></div></div>)
}
