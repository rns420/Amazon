import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { useToast } from '../lib/toast'
import { PageHeader, EmptyState, Spinner } from '../components/ui'
import { WORKFLOW_STAGES, BOOK_TYPES, PUZZLE_TYPES, COLORING_THEMES } from '../lib/constants'
import { Project } from '../lib/types'
import { Plus, FolderKanban, Search, Archive, Copy, Trash2, X } from 'lucide-react'

export default function Projects() {
  const { user } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'draft' | 'active' | 'completed' | 'ready' | 'archived'>('all')
  const [showCreate, setShowCreate] = useState(false)

  const load = async () => {
    setLoading(true)
    let q = supabase.from('projects').select('*').order('updated_at', { ascending: false })
    if (filter === 'archived') q = q.eq('archived', true)
    else q = q.eq('archived', false)
    const { data } = await q
    setProjects((data ?? []) as Project[])
    setLoading(false)
  }

  useEffect(() => { load() }, [filter])

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    (p.metadata?.title ?? '').toLowerCase().includes(query.toLowerCase())
  )

  const duplicate = async (p: Project) => {
    const { data } = await supabase.from('projects').insert({
      user_id: user!.id, title: `${p.title} (Copy)`, book_type: p.book_type,
      status: 'draft', current_stage: 'market-research', stage_progress: {},
      config: p.config, metadata: p.metadata, cover_config: p.cover_config,
    }).select().single()
    if (data) { notify('Project duplicated.', 'success'); load() }
  }

  const archive = async (p: Project) => {
    await supabase.from('projects').update({ archived: !p.archived }).eq('id', p.id)
    notify(p.archived ? 'Project restored.' : 'Project archived.', 'success')
    load()
  }

  const remove = async (p: Project) => {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return
    await supabase.from('projects').delete().eq('id', p.id)
    notify('Project deleted.', 'success')
    load()
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      <PageHeader title="Projects" subtitle="Manage your KDP book projects"
        actions={<button onClick={() => setShowCreate(true)} className="btn-primary"><Plus className="w-4 h-4" /> New Project</button>} />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
          <input className="input pl-9" placeholder="Search projects\u2026" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select className="input sm:w-48" value={filter} onChange={(e) => setFilter(e.target.value as any)}>
          <option value="all">All</option><option value="draft">Drafts</option><option value="active">Active</option>
          <option value="completed">Completed</option><option value="ready">Ready</option><option value="archived">Archived</option>
        </select>
      </div>

      {loading ? (
        <div className="card p-10"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<FolderKanban className="w-7 h-7" />} title="No projects found" message="Create a new project to start building your KDP book."
          action={<button onClick={() => setShowCreate(true)} className="btn-primary"><Plus className="w-4 h-4" /> New Project</button>} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const stageIdx = WORKFLOW_STAGES.findIndex((s) => s.id === p.current_stage)
            const progress = Math.round(((stageIdx + 1) / WORKFLOW_STAGES.length) * 100)
            return (
              <div key={p.id} className="card p-5 hover:shadow-pop transition group">
                <Link to={`/projects/${p.id}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="font-medium text-fg line-clamp-2">{p.title}</div>
                  </div>
                  <div className="text-xs text-fg-muted mb-3">{p.book_type === 'puzzle' ? 'Puzzle Book' : 'Coloring Book'} \u00b7 {WORKFLOW_STAGES[stageIdx]?.label}</div>
                  <div className="flex items-center justify-between text-xs text-fg-muted mb-1"><span>{p.status}</span><span>{progress}%</span></div>
                  <div className="h-1.5 bg-bg-soft rounded-full overflow-hidden"><div className="h-full bg-brand-500 rounded-full" style={{ width: `${progress}%` }} /></div>
                </Link>
                <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => duplicate(p)} className="btn-ghost p-2 text-xs" title="Duplicate"><Copy className="w-3.5 h-3.5" /></button>
                  <button onClick={() => archive(p)} className="btn-ghost p-2 text-xs" title={p.archived ? 'Restore' : 'Archive'}><Archive className="w-3.5 h-3.5" /></button>
                  <button onClick={() => remove(p)} className="btn-ghost p-2 text-xs text-danger-500" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreated={(id) => { setShowCreate(false); navigate(`/projects/${id}`) }} />}
    </div>
  )
}

function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const { user } = useAuth()
  const { notify } = useToast()
  const [title, setTitle] = useState('')
  const [bookType, setBookType] = useState<'puzzle' | 'coloring'>('puzzle')
  const [puzzleType, setPuzzleType] = useState('wordsearch')
  const [coloringTheme, setColoringTheme] = useState('animals')
  const [busy, setBusy] = useState(false)

  const create = async () => {
    if (!title.trim()) { notify('Please enter a project title.', 'error'); return }
    setBusy(true)
    const config = bookType === 'puzzle'
      ? { puzzleType, difficulty: 'easy', largePrint: false, pageCount: 60, trimSize: '8.5x11' }
      : { coloringTheme, audience: 'adult', pageCount: 50, trimSize: '8.5x11' }
    const { data, error } = await supabase.from('projects').insert({
      user_id: user!.id, title: title.trim(), book_type: bookType, status: 'draft',
      current_stage: 'market-research', stage_progress: {}, config, metadata: {},
      cover_config: { trimSize: '6x9', theme: 'minimal', primaryColor: '#3478f6' },
    }).select().single()
    setBusy(false)
    if (error) { notify(error.message, 'error'); return }
    await supabase.from('activity_log').insert({ user_id: user!.id, project_id: data.id, action: 'Created project', detail: title.trim() })
    notify('Project created.', 'success')
    onCreated(data.id)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="card p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-fg">New Project</h2>
          <button onClick={onClose} className="text-fg-muted hover:text-fg"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="label">Project Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Large Print Word Search for Adults" autoFocus />
          </div>
          <div>
            <label className="label">Book Type</label>
            <div className="grid grid-cols-2 gap-2">
              {BOOK_TYPES.map((t) => (
                <button key={t.id} onClick={() => setBookType(t.id as any)} className={`p-3 rounded-lg border text-sm font-medium transition ${bookType === t.id ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-border text-fg-soft hover:bg-bg-soft'}`}>{t.label}</button>
              ))}
            </div>
          </div>
          {bookType === 'puzzle' ? (
            <div>
              <label className="label">Puzzle Type</label>
              <select className="input" value={puzzleType} onChange={(e) => setPuzzleType(e.target.value)}>
                {PUZZLE_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
          ) : (
            <div>
              <label className="label">Coloring Theme</label>
              <select className="input" value={coloringTheme} onChange={(e) => setColoringTheme(e.target.value)}>
                {COLORING_THEMES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
          )}
          <button onClick={create} disabled={busy} className="btn-primary w-full">{busy ? 'Creating\u2026' : 'Create Project'}</button>
        </div>
      </div>
    </div>
  )
}
