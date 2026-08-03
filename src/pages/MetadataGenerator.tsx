import { useState } from 'react'
import { useAuth } from '../lib/auth'
import { useToast } from '../lib/toast'
import { generateMetadata, generateMetadataWithAI } from '../lib/metadata'
import { PageHeader, Spinner } from '../components/ui'
import { FileText, Copy, Sparkles } from 'lucide-react'

export default function MetadataGenerator() {
  const { session } = useAuth()
  const { notify } = useToast()
  const [topic, setTopic] = useState('')
  const [bookType, setBookType] = useState<'puzzle' | 'coloring'>('puzzle')
  const [audience, setAudience] = useState('adult')
  const [difficulty, setDifficulty] = useState('easy')
  const [meta, setMeta] = useState<ReturnType<typeof generateMetadata> | null>(null)
  const [loading, setLoading] = useState(false)

  const generateAI = async () => {
    if (!topic.trim()) { notify('Enter a topic first.', 'error'); return }
    setLoading(true)
    try {
      const result = await generateMetadataWithAI({ topic: topic.trim(), bookType, audience, difficulty, accessToken: session?.access_token ?? null })
      setMeta(result)
      notify('AI metadata generated.', 'success')
    } catch (err: any) {
      notify(err.message ?? 'AI generation failed. Showing template fallback.', 'error')
      setMeta(generateMetadata({ topic, bookType, audience, difficulty }))
    } finally {
      setLoading(false)
    }
  }

  const generateTemplate = () => {
    setMeta(generateMetadata({ topic, bookType, audience, difficulty }))
    notify('Template metadata generated.', 'success')
  }

  const copyAll = () => {
    if (!meta) return
    const text = `Title: ${meta.title}\nSubtitle: ${meta.subtitle}\n\nDescription:\n${meta.description}\n\nKeywords: ${meta.keywords?.join(', ')}\nCategories: ${meta.categories?.join(', ')}`
    navigator.clipboard.writeText(text)
    notify('Metadata copied to clipboard.', 'success')
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      <PageHeader title="Metadata Generator" subtitle="Create optimized, KDP-compliant book metadata with AI" />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card p-5 space-y-4">
            <div><label className="label">Topic / Theme</label><input className="input" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Word Search, Mandala, Sudoku" /></div>
            <div><label className="label">Book Type</label><select className="input" value={bookType} onChange={(e) => setBookType(e.target.value as any)}><option value="puzzle">Puzzle Book</option><option value="coloring">Coloring Book</option></select></div>
            <div><label className="label">Audience</label><select className="input" value={audience} onChange={(e) => setAudience(e.target.value)}><option value="adult">Adult</option><option value="children">Children</option><option value="general">General</option></select></div>
            <div><label className="label">Difficulty</label><select className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></div>
            <div className="space-y-2">
              <button onClick={generateAI} disabled={loading} className="btn-primary w-full"><Sparkles className="w-4 h-4" /> {loading ? 'Generating...' : 'Generate with AI'}</button>
              <button onClick={generateTemplate} disabled={loading} className="btn-outline w-full"><FileText className="w-4 h-4" /> Quick Template</button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {loading ? (
            <div className="card p-10"><Spinner /></div>
          ) : meta ? (
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
            <div className="card p-10 text-center text-fg-muted text-sm">Enter your book details and click "Generate with AI" to create optimized metadata, or "Quick Template" for a structured starting point.</div>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (<div><div className="label">{label}</div><div className="card p-3 bg-bg-soft text-sm text-fg">{value}</div></div>)
}
