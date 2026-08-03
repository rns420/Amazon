import { useState } from 'react'
import { useAuth } from '../lib/auth'
import { useToast } from '../lib/toast'
import { PageHeader, Spinner } from '../components/ui'
import { KeyRound, Search, CircleAlert as AlertCircle, Lightbulb } from 'lucide-react'

interface KeywordResult {
  keyword: string
  type: string
  difficulty: number
  intent: string
  volume: string
  relevance: number
  recommendation: string
}

interface KeywordData {
  keywords: KeywordResult[]
  recommendations: {
    primaryKeyword: string
    titleKeywords: string[]
    subtitleKeywords: string[]
    backendKeywords: string[]
  }
}

export default function KeywordResearch() {
  const { session } = useAuth()
  const { notify } = useToast()
  const [topic, setTopic] = useState('')
  const [bookType, setBookType] = useState('puzzle')
  const [audience, setAudience] = useState('adult')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<KeywordData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const research = async () => {
    if (!topic.trim()) { notify('Enter a topic to research.', 'error'); return }
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
        body: JSON.stringify({ type: 'keyword', query: topic.trim(), bookType, audience }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? `Request failed (${res.status})`)
      }
      const json = await res.json()
      if (!json.success || !json.data?.keywords) throw new Error('Invalid response from research service')
      setData(json.data as KeywordData)
      notify(`Found ${json.data.keywords.length} keywords.`, 'success')
    } catch (err: any) {
      setError(err.message ?? 'Failed to run research')
      notify('Research failed: ' + (err.message ?? 'Unknown error'), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      <PageHeader title="Keyword Research" subtitle="AI-powered keyword analysis for Amazon KDP" />

      <div className="card p-5 mb-6">
        <label className="label">Topic or seed keyword</label>
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" /><input className="input pl-9" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. word search, sudoku, coloring\u2026" onKeyDown={(e) => e.key === 'Enter' && research()} /></div>
          <select className="input sm:w-40" value={bookType} onChange={(e) => setBookType(e.target.value)}><option value="puzzle">Puzzle Book</option><option value="coloring">Coloring Book</option></select>
          <select className="input sm:w-40" value={audience} onChange={(e) => setAudience(e.target.value)}><option value="adult">Adult</option><option value="children">Children</option><option value="general">General</option></select>
          <button onClick={research} disabled={loading} className="btn-primary whitespace-nowrap"><KeyRound className="w-4 h-4" /> {loading ? 'Analyzing\u2026' : 'Research'}</button>
        </div>
      </div>

      {loading && <div className="card p-10"><Spinner /></div>}

      {error && (
        <div className="card p-4 mb-6 bg-danger-50 border-danger-500">
          <div className="flex items-start gap-2 text-sm text-danger-600"><AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /><div><div className="font-medium">Research Failed</div><div className="opacity-90">{error}</div></div></div>
        </div>
      )}

      {data && (
        <>
          {data.recommendations && (
            <div className="card p-5 mb-6">
              <h3 className="font-semibold text-fg mb-4 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-accent-500" /> AI Keyword Strategy</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><div className="label">Primary Keyword</div><div className="card p-3 bg-brand-50 text-brand-700 font-medium text-sm">{data.recommendations.primaryKeyword}</div></div>
                <div><div className="label">Title Keywords</div><div className="flex flex-wrap gap-1.5">{data.recommendations.titleKeywords?.map((k, i) => <span key={i} className="badge bg-brand-50 text-brand-700">{k}</span>)}</div></div>
                <div><div className="label">Subtitle Keywords</div><div className="flex flex-wrap gap-1.5">{data.recommendations.subtitleKeywords?.map((k, i) => <span key={i} className="badge bg-accent-50 text-accent-600">{k}</span>)}</div></div>
                <div><div className="label">Backend Keywords (max 7)</div><div className="flex flex-wrap gap-1.5">{data.recommendations.backendKeywords?.map((k, i) => <span key={i} className="badge bg-success-50 text-success-600">{k}</span>)}</div></div>
              </div>
            </div>
          )}

          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-bg-soft text-fg-muted text-xs uppercase"><tr><th className="text-left px-4 py-3 font-medium">Keyword</th><th className="text-left px-4 py-3 font-medium">Type</th><th className="text-left px-4 py-3 font-medium">Intent</th><th className="text-left px-4 py-3 font-medium">Volume</th><th className="text-left px-4 py-3 font-medium">Difficulty</th><th className="text-left px-4 py-3 font-medium">Relevance</th><th className="text-left px-4 py-3 font-medium">Recommendation</th></tr></thead>
              <tbody className="divide-y divide-border-soft">
                {data.keywords.map((k, i) => (
                  <tr key={i} className="hover:bg-bg-soft transition">
                    <td className="px-4 py-3 font-medium text-fg">{k.keyword}</td>
                    <td className="px-4 py-3"><span className={`badge ${k.type === 'Primary' ? 'bg-brand-50 text-brand-700' : k.type === 'Secondary' ? 'bg-accent-50 text-accent-600' : k.type === 'Long-tail' ? 'bg-success-50 text-success-600' : 'bg-bg-soft text-fg-muted'}`}>{k.type}</span></td>
                    <td className="px-4 py-3 text-fg-soft">{k.intent}</td>
                    <td className="px-4 py-3 text-fg-soft">{k.volume}</td>
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-16 h-1.5 bg-bg-soft rounded-full overflow-hidden"><div className={`h-full rounded-full ${k.difficulty < 25 ? 'bg-success-500' : k.difficulty < 45 ? 'bg-warning-500' : 'bg-danger-500'}`} style={{ width: `${k.difficulty}%` }} /></div><span className="text-xs text-fg-muted">{k.difficulty}</span></div></td>
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-12 h-1.5 bg-bg-soft rounded-full overflow-hidden"><div className="h-full bg-brand-400 rounded-full" style={{ width: `${k.relevance}%` }} /></div><span className="text-xs text-fg-muted">{k.relevance}</span></div></td>
                    <td className="px-4 py-3 text-xs text-fg-muted">{k.recommendation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!loading && !data && !error && (
        <div className="card p-10 text-center text-fg-muted text-sm">Enter a topic above and click "Research" to get AI-powered keyword analysis.</div>
      )}
    </div>
  )
}
