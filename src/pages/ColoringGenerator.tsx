import { useState } from 'react'
import { useToast } from '../lib/toast'
import { COLORING_THEMES, KDP_TRIM_SIZES } from '../lib/constants'
import { PageHeader } from '../components/ui'
import { Palette, Download, RefreshCw } from 'lucide-react'

const AUDIENCES = [{ id: 'children', label: 'Children' }, { id: 'adult', label: 'Adult' }]

export default function ColoringGenerator() {
  const { notify } = useToast()
  const [theme, setTheme] = useState('mandala')
  const [audience, setAudience] = useState('adult')
  const [pageCount, setPageCount] = useState(50)
  const [trimSize, setTrimSize] = useState('8.5x8.5')
  const [singleSided, setSingleSided] = useState(true)
  const [seed, setSeed] = useState(0)
  const patterns = generateColoringPattern(theme, seed)

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      <PageHeader title="Coloring Book Generator" subtitle="Create printable coloring book interiors with clean line art"
        actions={<button onClick={() => notify('Coloring book PDF export uses the interior generator.', 'info')} className="btn-primary"><Download className="w-4 h-4" /> Export PDF</button>} />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-5 space-y-4">
            <div><label className="label">Theme</label><select className="input" value={theme} onChange={(e) => setTheme(e.target.value)}>{COLORING_THEMES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}</select></div>
            <div><label className="label">Audience</label><select className="input" value={audience} onChange={(e) => setAudience(e.target.value)}>{AUDIENCES.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}</select></div>
            <div><label className="label">Page Count</label><input type="number" min={24} max={200} className="input" value={pageCount} onChange={(e) => setPageCount(Number(e.target.value))} /></div>
            <div><label className="label">Trim Size</label><select className="input" value={trimSize} onChange={(e) => setTrimSize(e.target.value)}>{KDP_TRIM_SIZES.filter((t) => t.bleed).map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}</select></div>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={singleSided} onChange={(e) => setSingleSided(e.target.checked)} className="rounded" /><span className="text-sm text-fg-soft">Single-sided pages</span></label>
          </div>
          <button onClick={() => setSeed((s) => s + 1)} className="btn-outline w-full"><RefreshCw className="w-4 h-4" /> Regenerate Preview</button>
        </div>

        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4"><Palette className="w-5 h-5 text-brand-600" /><h3 className="font-semibold text-fg">Page Preview</h3></div>
            <div className="bg-white rounded-lg border border-border p-8 flex items-center justify-center min-h-[400px]">
              <svg viewBox="0 0 300 300" className="w-full max-w-md" style={{ filter: 'drop-shadow(0 1px 2px rgb(0 0 0 / 0.05))' }}>
                {patterns.map((d, i) => (<path key={i} d={d} fill="none" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />))}
              </svg>
            </div>
            <p className="text-xs text-fg-muted mt-3 text-center">Preview is a sample line-art pattern. The exported PDF includes {pageCount} pages of {COLORING_THEMES.find((t) => t.id === theme)?.label.toLowerCase()} designs{singleSided ? ' (single-sided)' : ''}.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function generateColoringPattern(theme: string, seed: number): string[] {
  const paths: string[] = []
  const cx = 150, cy = 150
  if (theme === 'mandala') {
    for (let r = 1; r <= 6; r++) {
      const radius = r * 20
      paths.push(`M ${cx - radius} ${cy} A ${radius} ${radius} 0 1 0 ${cx + radius} ${cy} A ${radius} ${radius} 0 1 0 ${cx - radius} ${cy}`)
      const petals = 8 + r * 2
      for (let p = 0; p < petals; p++) {
        const angle = (p / petals) * Math.PI * 2 + (seed * 0.1)
        paths.push(`M ${cx} ${cy} L ${cx + Math.cos(angle) * radius} ${cy + Math.sin(angle) * radius}`)
      }
    }
  } else if (theme === 'flowers') {
    for (let i = 0; i < 5; i++) {
      const fx = 60 + (i % 3) * 90 + (seed % 20)
      const fy = 60 + Math.floor(i / 3) * 120
      paths.push(`M ${fx} ${fy + 30} L ${fx} ${fy + 80}`)
      for (let p = 0; p < 6; p++) {
        const a = (p / 6) * Math.PI * 2
        paths.push(`M ${fx} ${fy} Q ${fx + Math.cos(a) * 25} ${fy + Math.sin(a) * 25 - 10} ${fx + Math.cos(a) * 30} ${fy + Math.sin(a) * 30}`)
      }
      paths.push(`M ${fx - 8} ${fy} A 8 8 0 1 0 ${fx + 8} ${fy} A 8 8 0 1 0 ${fx - 8} ${fy}`)
    }
  } else if (theme === 'animals') {
    paths.push(`M 100 120 L 90 80 L 120 100 L 180 100 L 210 80 L 200 120 L 210 180 L 190 220 L 110 220 L 90 180 Z`)
    paths.push(`M 130 140 A 5 5 0 1 0 140 140 A 5 5 0 1 0 130 140`)
    paths.push(`M 160 140 A 5 5 0 1 0 170 140 A 5 5 0 1 0 160 140`)
    paths.push(`M 145 165 L 150 170 L 155 165`)
    paths.push(`M 140 175 Q 150 185 160 175`)
  } else {
    for (let i = 0; i < 8; i++) {
      const offset = i * 15 + (seed % 10)
      paths.push(`M ${offset} 0 L ${300 - offset} 300`)
      paths.push(`M 0 ${offset} L 300 ${300 - offset}`)
    }
    for (let r = 20; r <= 140; r += 20) {
      paths.push(`M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy}`)
    }
  }
  return paths
}
