import { useState } from 'react'
import { PageHeader } from '../components/ui'
import { KeyRound, Search } from 'lucide-react'

export default function KeywordResearch() {
  const [topic, setTopic] = useState('word search')
  const [results, setResults] = useState<any[] | null>(null)

  const research = () => {
    const base = topic.trim().toLowerCase() || 'puzzle book'
    setResults([
      { keyword: base, type: 'Primary', difficulty: 45, intent: 'Commercial', volume: '12,000/mo' },
      { keyword: `${base} book`, type: 'Primary', difficulty: 52, intent: 'Commercial', volume: '8,500/mo' },
      { keyword: `${base} for adults`, type: 'Secondary', difficulty: 38, intent: 'Commercial', volume: '6,200/mo' },
      { keyword: `large print ${base}`, type: 'Secondary', difficulty: 31, intent: 'Commercial', volume: '4,100/mo' },
      { keyword: `${base} with solutions`, type: 'Long-tail', difficulty: 22, intent: 'Commercial', volume: '1,800/mo' },
      { keyword: `${base} for seniors`, type: 'Long-tail', difficulty: 18, intent: 'Commercial', volume: '2,400/mo' },
      { keyword: `easy ${base} for beginners`, type: 'Long-tail', difficulty: 15, intent: 'Informational', volume: '950/mo' },
      { keyword: `printable ${base}`, type: 'Long-tail', difficulty: 28, intent: 'Informational', volume: '3,200/mo' },
      { keyword: `${base} gift`, type: 'Backend', difficulty: 12, intent: 'Transactional', volume: '1,100/mo' },
      { keyword: `${base} travel size`, type: 'Backend', difficulty: 9, intent: 'Commercial', volume: '780/mo' },
    ])
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      <PageHeader title="Keyword Research" subtitle="Find primary, secondary, long-tail, and backend keywords" />

      <div className="card p-5 mb-6">
        <label className="label">Topic or seed keyword</label>
        <div className="flex gap-2">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" /><input className="input pl-9" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. word search, sudoku, coloring\u2026" onKeyDown={(e) => e.key === 'Enter' && research()} /></div>
          <button onClick={research} className="btn-primary"><KeyRound className="w-4 h-4" /> Research</button>
        </div>
      </div>

      {results && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bg-soft text-fg-muted text-xs uppercase"><tr><th className="text-left px-4 py-3 font-medium">Keyword</th><th className="text-left px-4 py-3 font-medium">Type</th><th className="text-left px-4 py-3 font-medium">Search Intent</th><th className="text-left px-4 py-3 font-medium">Volume</th><th className="text-left px-4 py-3 font-medium">Difficulty</th></tr></thead>
            <tbody className="divide-y divide-border-soft">
              {results.map((k, i) => (
                <tr key={i} className="hover:bg-bg-soft transition">
                  <td className="px-4 py-3 font-medium text-fg">{k.keyword}</td>
                  <td className="px-4 py-3"><span className={`badge ${k.type === 'Primary' ? 'bg-brand-50 text-brand-700' : k.type === 'Secondary' ? 'bg-accent-50 text-accent-600' : k.type === 'Long-tail' ? 'bg-success-50 text-success-600' : 'bg-bg-soft text-fg-muted'}`}>{k.type}</span></td>
                  <td className="px-4 py-3 text-fg-soft">{k.intent}</td>
                  <td className="px-4 py-3 text-fg-soft">{k.volume}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-16 h-1.5 bg-bg-soft rounded-full overflow-hidden"><div className={`h-full rounded-full ${k.difficulty < 25 ? 'bg-success-500' : k.difficulty < 45 ? 'bg-warning-500' : 'bg-danger-500'}`} style={{ width: `${k.difficulty}%` }} /></div><span className="text-xs text-fg-muted">{k.difficulty}</span></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
