import { useState } from 'react'
import { PageHeader } from '../components/ui'
import { TrendingUp, Star, DollarSign, ChartBar as BarChart3, Filter } from 'lucide-react'

const COUNTRIES = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Japan']
const CATEGORIES = ['Puzzles & Games', 'Coloring Books', 'Activity Books', 'Children\'s Books', 'Crafts & Hobbies']

export default function MarketResearch() {
  const [country, setCountry] = useState('United States')
  const [category, setCategory] = useState('Puzzles & Games')
  const [minPrice, setMinPrice] = useState(5)
  const [maxPrice, setMaxPrice] = useState(15)

  // Simulated market data
  const data = generateMarketData(category, country)

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      <PageHeader title="Market Research" subtitle="Analyze the Amazon marketplace for publishing opportunities" />

      <div className="card p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-fg-muted" />
          <h3 className="text-sm font-semibold text-fg">Filters</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="label">Country</label>
            <select className="input" value={country} onChange={(e) => setCountry(e.target.value)}>
              {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Min Price ($)</label>
            <input type="number" className="input" value={minPrice} onChange={(e) => setMinPrice(Number(e.target.value))} />
          </div>
          <div>
            <label className="label">Max Price ($)</label>
            <input type="number" className="input" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Avg. Price" value={`$${data.avgPrice.toFixed(2)}`} icon={<DollarSign className="w-5 h-5" />} />
        <MetricCard label="Opportunity Score" value={`${data.opportunity}/100`} icon={<TrendingUp className="w-5 h-5" />} accent="bg-success-50 text-success-600" />
        <MetricCard label="Difficulty Score" value={`${data.difficulty}/100`} icon={<BarChart3 className="w-5 h-5" />} accent="bg-warning-50 text-warning-600" />
        <MetricCard label="Est. Monthly Revenue" value={`$${data.revenue.toLocaleString()}`} icon={<Star className="w-5 h-5" />} accent="bg-accent-50 text-accent-600" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold text-fg mb-4">Bestselling Books</h3>
          <div className="space-y-3">
            {data.bestSellers.map((b, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-bg-soft rounded-lg">
                <div>
                  <div className="text-sm font-medium text-fg">{b.title}</div>
                  <div className="text-xs text-fg-muted">{b.price} · {b.reviews} reviews · {b.bsr} BSR</div>
                </div>
                <div className="text-sm font-semibold text-success-600">{b.estSales}/mo</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-fg mb-4">Gap Analysis</h3>
          <div className="space-y-3">
            {data.gaps.map((g, i) => (
              <div key={i} className="p-3 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium text-fg">{g.area}</div>
                  <span className="badge bg-success-50 text-success-600">Opportunity</span>
                </div>
                <div className="text-xs text-fg-muted">{g.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, icon, accent }: any) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-fg-muted">{label}</div>
          <div className="text-xl font-bold text-fg mt-1">{value}</div>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent ?? 'bg-brand-50 text-brand-600'}`}>{icon}</div>
      </div>
    </div>
  )
}

function generateMarketData(category: string, country: string) {
  const seed = category.length + country.length
  const rand = (n: number) => Math.floor((Math.sin(seed + n) * 10000) % 1000) / 10
  const avgPrice = 6.99 + (seed % 5)
  return {
    avgPrice,
    opportunity: 65 + (seed % 30),
    difficulty: 40 + (seed % 40),
    revenue: 2000 + (seed * 100),
    bestSellers: [
      { title: `${category} Mega Collection`, price: `$${(avgPrice + 2).toFixed(2)}`, reviews: 1200 + (seed * 7), bsr: `#${1000 + seed * 13}`, estSales: 450 + seed },
      { title: `Large Print ${category}`, price: `$${avgPrice.toFixed(2)}`, reviews: 850 + (seed * 3), bsr: `#${2000 + seed * 7}`, estSales: 320 + seed },
      { title: `Adult ${category} Book`, price: `$${(avgPrice - 1).toFixed(2)}`, reviews: 620 + seed, bsr: `#${3500 + seed}`, estSales: 280 },
      { title: `Kids ${category} Activity`, price: `$${(avgPrice + 0.5).toFixed(2)}`, reviews: 430, bsr: `#${5000 + seed * 2}`, estSales: 190 },
    ],
    gaps: [
      { area: 'Large print niche', detail: 'Few competitors offering large-print versions in this category.' },
      { area: 'Themed collections', detail: 'Seasonal and themed collections are underserved.' },
      { area: 'Beginner difficulty', detail: 'Most books target advanced users; beginner gap exists.' },
    ],
  }
}
