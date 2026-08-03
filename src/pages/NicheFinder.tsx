import { useState } from 'react'
import { PageHeader } from '../components/ui'
import { Search, TrendingUp, Target, DollarSign } from 'lucide-react'

const SAMPLE_NICHES = [
  { name: 'Large Print Word Search for Seniors', demand: 'High', competition: 'Medium', profitability: 'High', trend: 'Stable', score: 82, bookType: 'Puzzle Book' },
  { name: 'Mandala Coloring Books for Adults', demand: 'High', competition: 'High', profitability: 'Medium', trend: 'Growing', score: 71, bookType: 'Coloring Book' },
  { name: 'Kids Sudoku 4x4 Activity Book', demand: 'Medium', competition: 'Low', profitability: 'High', trend: 'Growing', score: 88, bookType: 'Puzzle Book' },
  { name: 'Maze Books for Kids 6-8', demand: 'Medium', competition: 'Low', profitability: 'Medium', trend: 'Stable', score: 76, bookType: 'Puzzle Book' },
  { name: 'Cryptogram Puzzle Book', demand: 'Low', competition: 'Low', profitability: 'Medium', trend: 'Emerging', score: 69, bookType: 'Puzzle Book' },
  { name: 'Animal Coloring Book for Toddlers', demand: 'High', competition: 'Medium', profitability: 'High', trend: 'Stable', score: 80, bookType: 'Coloring Book' },
  { name: 'Logic Puzzles for Adults', demand: 'Medium', competition: 'Low', profitability: 'High', trend: 'Growing', score: 84, bookType: 'Puzzle Book' },
  { name: 'Mixed Activity Book for Travel', demand: 'Medium', competition: 'Medium', profitability: 'Medium', trend: 'Stable', score: 72, bookType: 'Mixed Book' },
]

const demandColor: Record<string, string> = { High: 'bg-success-50 text-success-600', Medium: 'bg-warning-50 text-warning-600', Low: 'bg-danger-50 text-danger-600' }

export default function NicheFinder() {
  const [query, setQuery] = useState('')
  const filtered = SAMPLE_NICHES.filter((n) => n.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      <PageHeader title="Niche Finder" subtitle="Discover profitable niches with manageable competition" />

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
        <input className="input pl-9" placeholder="Search niche ideas\u2026" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((n) => (
          <div key={n.name} className="card p-5 hover:shadow-pop transition">
            <div className="flex items-start justify-between gap-2 mb-3"><h3 className="font-semibold text-fg text-sm leading-snug">{n.name}</h3><span className="badge bg-brand-50 text-brand-700 shrink-0">{n.score}</span></div>
            <div className="text-xs text-fg-muted mb-3">{n.bookType}</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between"><span className="text-fg-muted flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Demand</span><span className={`badge ${demandColor[n.demand]}`}>{n.demand}</span></div>
              <div className="flex items-center justify-between"><span className="text-fg-muted flex items-center gap-1"><Target className="w-3 h-3" /> Competition</span><span className={`badge ${demandColor[n.competition]}`}>{n.competition}</span></div>
              <div className="flex items-center justify-between"><span className="text-fg-muted flex items-center gap-1"><DollarSign className="w-3 h-3" /> Profitability</span><span className={`badge ${demandColor[n.profitability]}`}>{n.profitability}</span></div>
              <div className="flex items-center justify-between"><span className="text-fg-muted">Trend</span><span className="text-fg-soft">{n.trend}</span></div>
            </div>
            <div className="mt-3 pt-3 border-t border-border-soft">
              <div className="flex items-center justify-between text-xs"><span className="text-fg-muted">Opportunity Score</span>
                <div className="flex items-center gap-2"><div className="w-20 h-1.5 bg-bg-soft rounded-full overflow-hidden"><div className="h-full bg-brand-500 rounded-full" style={{ width: `${n.score}%` }} /></div><span className="font-semibold text-fg">{n.score}/100</span></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
