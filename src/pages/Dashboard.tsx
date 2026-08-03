import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { PageHeader, StatCard, EmptyState, Spinner } from '../components/ui'
import { WORKFLOW_STAGES } from '../lib/constants'
import { Project, ActivityEntry } from '../lib/types'
import { FolderKanban, BookCheck, FileEdit, Rocket, Plus, ArrowRight, Activity, CheckCircle2, Clock } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [activity, setActivity] = useState<ActivityEntry[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    (async () => {
      const [{ data: p }, { data: a }] = await Promise.all([
        supabase.from('projects').select('*').order('updated_at', { ascending: false }).limit(6),
        supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(8),
      ])
      setProjects((p ?? []) as Project[])
      setActivity((a ?? []) as ActivityEntry[])
      setLoading(false)
    })()
  }, [])

  const drafts = projects.filter((p) => p.status === 'draft')
  const completed = projects.filter((p) => p.status === 'completed')
  const ready = projects.filter((p) => p.status === 'ready')
  const stageLabel = (id: string) => WORKFLOW_STAGES.find((s) => s.id === id)?.label ?? id

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      <PageHeader
        title="Welcome back"
        subtitle="Your KDP publishing command center"
        actions={<button onClick={() => navigate('/projects')} className="btn-primary"><Plus className="w-4 h-4" /> New Project</button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Projects" value={projects.length} icon={<FolderKanban className="w-5 h-5" />} />
        <StatCard label="Drafts" value={drafts.length} icon={<FileEdit className="w-5 h-5" />} accent="bg-warning-50 text-warning-600" />
        <StatCard label="Completed" value={completed.length} icon={<BookCheck className="w-5 h-5" />} accent="bg-success-50 text-success-600" />
        <StatCard label="Ready for KDP" value={ready.length} icon={<Rocket className="w-5 h-5" />} accent="bg-accent-50 text-accent-600" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-fg">Recent Projects</h2>
            <Link to="/projects" className="text-sm text-brand-600 hover:underline flex items-center gap-1">View all <ArrowRight className="w-3.5 h-3.5" /></Link>
          </div>
          {loading ? (
            <div className="card p-10"><Spinner /></div>
          ) : projects.length === 0 ? (
            <EmptyState icon={<FolderKanban className="w-7 h-7" />} title="No projects yet" message="Create your first KDP book project to get started."
              action={<button onClick={() => navigate('/projects')} className="btn-primary"><Plus className="w-4 h-4" /> Create Project</button>} />
          ) : (
            <div className="space-y-3">
              {projects.map((p) => {
                const stageIdx = WORKFLOW_STAGES.findIndex((s) => s.id === p.current_stage)
                const progress = Math.round(((stageIdx + 1) / WORKFLOW_STAGES.length) * 100)
                return (
                  <Link key={p.id} to={`/projects/${p.id}`} className="card p-4 hover:shadow-pop transition block">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium text-fg truncate">{p.title}</div>
                        <div className="text-sm text-fg-muted mt-0.5">{p.book_type === 'puzzle' ? 'Puzzle Book' : 'Coloring Book'} \u00b7 {stageLabel(p.current_stage)}</div>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-fg-muted mb-1"><span>Workflow progress</span><span>{progress}%</span></div>
                      <div className="h-1.5 bg-bg-soft rounded-full overflow-hidden"><div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-semibold text-fg mb-4">Recent Activity</h2>
          {activity.length === 0 ? (
            <div className="card p-6 text-sm text-fg-muted">No activity yet.</div>
          ) : (
            <div className="card divide-y divide-border-soft">
              {activity.map((a) => (
                <div key={a.id} className="p-3.5 flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-bg-soft flex items-center justify-center shrink-0"><Activity className="w-4 h-4 text-fg-muted" /></div>
                  <div className="min-w-0">
                    <div className="text-sm text-fg">{a.action}</div>
                    {a.detail && <div className="text-xs text-fg-muted truncate">{a.detail}</div>}
                    <div className="text-[11px] text-fg-muted mt-0.5">{timeAgo(a.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="card p-4 mt-6">
            <h3 className="font-semibold text-fg text-sm mb-3">Publishing Checklist</h3>
            <div className="space-y-2">
              {[
                { label: 'Market research', done: projects.some((p) => p.current_stage !== 'market-research') },
                { label: 'Interior created', done: projects.some((p) => ['interior-creation','cover-creation','metadata-creation','quality-validation','compliance-validation','export','ready-for-kdp'].includes(p.current_stage)) },
                { label: 'Cover designed', done: projects.some((p) => ['cover-creation','metadata-creation','quality-validation','compliance-validation','export','ready-for-kdp'].includes(p.current_stage)) },
                { label: 'Metadata written', done: projects.some((p) => ['metadata-creation','quality-validation','compliance-validation','export','ready-for-kdp'].includes(p.current_stage)) },
                { label: 'Book exported', done: projects.some((p) => ['export','ready-for-kdp'].includes(p.current_stage)) },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-sm">
                  {item.done ? <CheckCircle2 className="w-4 h-4 text-success-500" /> : <Clock className="w-4 h-4 text-fg-muted" />}
                  <span className={item.done ? 'text-fg' : 'text-fg-muted'}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    draft: { label: 'Draft', cls: 'bg-bg-soft text-fg-muted' },
    active: { label: 'Active', cls: 'bg-brand-50 text-brand-700' },
    completed: { label: 'Completed', cls: 'bg-success-50 text-success-600' },
    ready: { label: 'Ready', cls: 'bg-accent-50 text-accent-600' },
  }
  const s = map[status] ?? map.draft
  return <span className={`badge ${s.cls} shrink-0`}>{s.label}</span>
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
