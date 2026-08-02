import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { useToast } from '../lib/toast'
import { PageHeader, EmptyState, Spinner } from '../components/ui'
import { Template } from '../lib/types'
import { Layers, Plus, Trash2 } from 'lucide-react'

const CATEGORIES = ['project', 'puzzle', 'coloring', 'cover', 'metadata']

export default function TemplateLibrary() {
  const { notify } = useToast()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('templates').select('*').order('created_at', { ascending: false })
    setTemplates((data ?? []) as Template[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const remove = async (t: Template) => {
    if (t.is_builtin) { notify('Built-in templates cannot be deleted.', 'error'); return }
    await supabase.from('templates').delete().eq('id', t.id)
    notify('Template deleted.', 'success')
    load()
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      <PageHeader
        title="Template Library"
        subtitle="Save and reuse puzzle, coloring, cover, and metadata presets"
        actions={<button onClick={() => setShowCreate(true)} className="btn-primary"><Plus className="w-4 h-4" /> New Template</button>}
      />

      {loading ? (
        <div className="card p-10"><Spinner /></div>
      ) : templates.length === 0 ? (
        <EmptyState icon={<Layers className="w-7 h-7" />} title="No templates" message="Create reusable templates to speed up your workflow." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <div key={t.id} className="card p-5 hover:shadow-pop transition group">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="font-medium text-fg">{t.name}</div>
                {t.is_builtin && <span className="badge bg-brand-50 text-brand-700 shrink-0">Built-in</span>}
              </div>
              <div className="text-xs text-fg-muted capitalize mb-3">{t.category} template</div>
              <div className="space-y-1">
                {Object.entries(t.config).slice(0, 4).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-fg-muted">{k}</span>
                    <span className="text-fg-soft">{String(v)}</span>
                  </div>
                ))}
              </div>
              {!t.is_builtin && (
                <button onClick={() => remove(t)} className="btn-ghost text-danger-500 text-xs mt-3 opacity-0 group-hover:opacity-100 transition">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showCreate && <CreateTemplateModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load() }} />}
    </div>
  )
}

function CreateTemplateModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { user } = useAuth()
  const { notify } = useToast()
  const [name, setName] = useState('')
  const [category, setCategory] = useState('project')
  const [configText, setConfigText] = useState('{}')

  const create = async () => {
    let config: Record<string, any>
    try { config = JSON.parse(configText) } catch { notify('Config must be valid JSON.', 'error'); return }
    const { error } = await supabase.from('templates').insert({ name, category, config, is_builtin: false, user_id: user!.id })
    if (error) { notify(error.message, 'error'); return }
    notify('Template created.', 'success')
    onCreated()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="card p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-fg mb-4">New Template</h2>
        <div className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Config (JSON)</label>
            <textarea className="input min-h-[100px] font-mono text-xs" value={configText} onChange={(e) => setConfigText(e.target.value)} />
          </div>
          <button onClick={create} className="btn-primary w-full">Create Template</button>
        </div>
      </div>
    </div>
  )
}
