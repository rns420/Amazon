import { useState } from 'react'
import { useToast } from '../lib/toast'
import { KDP_TRIM_SIZES, trimById, PAPERBACK_BLEED, calculateSpineWidth, canHaveSpineText } from '../lib/constants'
import { downloadCoverPDF } from '../lib/pdf'
import { validateCoverCompliance } from '../lib/validators'
import { PageHeader } from '../components/ui'
import { Download, BookImage, CircleCheck as CheckCircle2, CircleAlert as AlertCircle } from 'lucide-react'

const THEMES = [{ id: 'minimal', label: 'Minimal' }, { id: 'bold', label: 'Bold' }, { id: 'elegant', label: 'Elegant' }, { id: 'playful', label: 'Playful' }]
const COLORS = ['#3478f6', '#f97316', '#22c55e', '#dc2626', '#7c3aed', '#0891b2', '#1e293b', '#f43f5e']

export default function CoverCreator() {
  const { notify } = useToast()
  const [trimSize, setTrimSize] = useState('6x9')
  const [title, setTitle] = useState('My Awesome Book')
  const [subtitle, setSubtitle] = useState('A Guide to Something Great')
  const [author, setAuthor] = useState('Author Name')
  const [primaryColor, setPrimaryColor] = useState('#3478f6')
  const [theme, setTheme] = useState('minimal')
  const [pageCount, setPageCount] = useState(100)

  const trim = trimById(trimSize)
  const spineWidth = calculateSpineWidth(pageCount)
  const issues = validateCoverCompliance({ trimSize, title, author, subtitle, primaryColor, pageCount, theme })

  const handleExport = () => {
    downloadCoverPDF({ trimSize, title, author, subtitle, primaryColor, pageCount, theme })
    notify('Cover PDF exported.', 'success')
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      <PageHeader title="Cover Creator" subtitle="Design KDP-compliant covers with front, spine, and back"
        actions={<button onClick={handleExport} className="btn-primary"><Download className="w-4 h-4" /> Export Cover PDF</button>} />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-5 space-y-4">
            <div><label className="label">Trim Size</label><select className="input" value={trimSize} onChange={(e) => setTrimSize(e.target.value)}>{KDP_TRIM_SIZES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}</select></div>
            <div><label className="label">Title</label><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div><label className="label">Subtitle</label><input className="input" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} /></div>
            <div><label className="label">Author</label><input className="input" value={author} onChange={(e) => setAuthor(e.target.value)} /></div>
            <div><label className="label">Page Count (for spine width)</label><input type="number" min={24} className="input" value={pageCount} onChange={(e) => setPageCount(Number(e.target.value))} /></div>
            <div><label className="label">Theme</label><select className="input" value={theme} onChange={(e) => setTheme(e.target.value)}>{THEMES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}</select></div>
            <div>
              <label className="label">Primary Color</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (<button key={c} onClick={() => setPrimaryColor(c)} className={`w-8 h-8 rounded-lg border-2 transition ${primaryColor === c ? 'border-fg scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />))}
                <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-8 h-8 rounded-lg border border-border cursor-pointer" />
              </div>
            </div>
          </div>
          <div className="card p-4">
            <h4 className="text-sm font-semibold text-fg mb-2">Dimensions</h4>
            <div className="space-y-1 text-xs text-fg-muted">
              <div>Trim: {trim.label}</div>
              <div>Spine width: {spineWidth.toFixed(3)}"</div>
              <div>Full cover: {(trim.w * 2 + spineWidth + PAPERBACK_BLEED * 4).toFixed(2)}" \u00d7 {(trim.h + PAPERBACK_BLEED * 2).toFixed(2)}"</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4"><BookImage className="w-5 h-5 text-brand-600" /><h3 className="font-semibold text-fg">Cover Preview</h3></div>
            <div className="flex justify-center">
              <CoverPreview trimSize={trimSize} title={title} subtitle={subtitle} author={author} primaryColor={primaryColor} theme={theme} pageCount={pageCount} />
            </div>
          </div>
          <div className="card p-5">
            <h4 className="text-sm font-semibold text-fg mb-3">Compliance Check</h4>
            <div className="space-y-2">
              {issues.map((issue, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  {issue.level === 'pass' ? <CheckCircle2 className="w-4 h-4 text-success-500 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 text-warning-500 mt-0.5 shrink-0" />}
                  <div><span className="font-medium text-fg-soft">{issue.field}:</span> <span className="text-fg-muted">{issue.message}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CoverPreview({ trimSize, title, subtitle, author, primaryColor, theme, pageCount }: any) {
  const trim = trimById(trimSize)
  const spineWidth = calculateSpineWidth(pageCount)
  const scale = 2.2
  const fw = trim.w * scale
  const fh = trim.h * scale
  const sw = spineWidth * scale
  const totalW = fw * 2 + sw

  return (
    <div className="flex shadow-pop rounded overflow-hidden" style={{ width: totalW, height: fh }}>
      <div className="bg-white border-r border-border-soft flex items-center justify-center" style={{ width: fw, height: fh }}>
        <div className="text-center px-4">
          <div className="text-[10px] text-slate-400 mb-2">Back Cover</div>
          <div className="text-[9px] text-slate-500 leading-relaxed">{subtitle || 'Book description goes here on the back cover...'}</div>
          <div className="mt-auto pt-4"><div className="w-16 h-10 border border-slate-300 rounded mx-auto" /><div className="text-[7px] text-slate-400 mt-1">Barcode</div></div>
        </div>
      </div>
      <div className="flex items-center justify-center" style={{ width: sw, height: fh, backgroundColor: primaryColor }}>
        <div className="text-white text-[9px] font-bold whitespace-nowrap" style={{ transform: 'rotate(-90deg)' }}>{title} \u2014 {author}</div>
      </div>
      <div className="flex flex-col items-center justify-center text-center px-4" style={{ width: fw, height: fh, backgroundColor: primaryColor }}>
        <div className={`text-white font-bold ${theme === 'bold' ? 'text-lg' : 'text-base'} leading-tight`}>{title}</div>
        {subtitle && <div className="text-white/80 text-[10px] mt-1">{subtitle}</div>}
        <div className="text-white/90 text-[10px] mt-3">{author}</div>
      </div>
    </div>
  )
}
