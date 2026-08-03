import { useState } from 'react'
import { useToast } from '../lib/toast'
import { generateMetadata } from '../lib/metadata'
import { PageHeader } from '../components/ui'
import { FileText, Copy } from 'lucide-react'

export default function MetadataGenerator() {
  const { notify } = useToast()
  const [topic, setTopic] = useState('Word Search')
  const [bookType, setBookType] = useState<'puzzle' | 'coloring'>('puzzle')
  const [audience, setAudience] = useState('adult')
  const [difficulty, setDifficulty] = useState('easy')
  const [meta, setMeta] = useState<ReturnType<typeof generateMetadata> | null>(null)

  const generate = () => {
    setMeta(generateMetadata({ topic, bookType, audience, difficulty }))
    notify('Metadata generated.', 'success')
  }

  const copyAll = () => {
    if (!meta) return
    const text = `Title: ${meta.title}\nSubtitle: ${meta.subtitle}\n\nDescription:\n${meta.description}\n\nKeywords: ${meta.keywords?.join(', ')}\nCategories: ${meta.categories?.join(', ')}`
    navigator.clipboard.writeText(text)
    notify('Metadata copied to clipboard.', 'success')
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      <PageHeader title="Metadata Generator" subtitle="Create optimized, KDP-compliant book metadata" />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card p-5 space-y-4">
            <div><label className="label">Topic / Theme</label><input className="input" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Word Search, Mandala, Sudoku" /></div>
            <div><label className="label">Book Type</label><select className="input" value={bookType} onChange={(e) => setBookType(e.target.value as any)}><option value="puzzle">Puzzle Book</option><option value="coloring">Coloring Book</option></select></div>
            <div><label className="label">Audience</label><select className="input" value={audience} onChange={(e) => setAudience(e.target.value)}><option value="adult">Adult</option><option value="children">Children</option><option value="general">General</option></select></div>
            <div><label className="label">Difficulty</label><select className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></div>
            <button onClick={generate} className="btn-primary w-full"><FileText className="w-4 h-4" /> Generate Metadata</button>
          </div>
        </div>

        <div className="lg:col-span-2">
          {meta ? (
            <div className="card p-6 space-y-5">
              <div className="flex items-center justify-between"><h3 className="font-semibold text-fg">Generated Metadata</h3><button onClick={copyAll} className="btn-outline text-sm"><Copy className="w-4 h-4" /> Copy All</button></div>
              <Field label="Title" value={meta.title ?? ''} />
              {meta.subtitle && <Field label="Subtitle" value={meta.subtitle} />}
              <div><div className="label">Short Description</div><div className="card p-4 bg-bg-soft text-sm text-fg">{meta.short_description ?? ''}</div></div>
              <div><div className="label">Full Description</div><div className="card p-4 bg-bg-soft whitespace-pre-wrap text-sm text-fg-soft leading-relaxed">{meta.description}</div></div>
              <div><div className="label">Backend Keywords ({meta.keywords?.length})</div><div className="flex flex-wrap gap-2">{meta.keywords?.map((k, i) => <span key={i} className="badge bg-bg-soft text-fg-soft">{k}</span>)}</div></div>
              <div><div className="label">Categories</div><div className="space-y-1">{meta.categories?.map((c, i) => <div key={i} className="text-sm text-fg-soft">{c}</div>)}</div></div>
              <div className="grid grid-cols-3 gap-3"><Field label="Language" value={meta.language ?? ''} /><Field label="Reading Age" value={meta.reading_age ?? ''} /><Field label="Audience" value={meta.audience ?? ''} /></div>
            </div>
          ) : (
            <div className="card p-10 text-center text-fg-muted text-sm">Configure your book details and click Generate to create optimized metadata.</div>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (<div><div className="label">{label}</div><div className="card p-3 bg-bg-soft text-sm text-fg">{value}</div></div>)
}
