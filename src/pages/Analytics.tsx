import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { PageHeader, StatCard, Spinner } from '../components/ui'
import { WORKFLOW_STAGES } from '../lib/constants'
import { FolderKanban, BookCheck, Rocket, FileEdit, TrendingUp, Clock } from 'lucide-react'

export default function Analytics() {
  const [projects, setProjects] = useState<any[]>([])
  const [activity, setActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const [{ data: p }, { data: a }] = await Promise.all([
        supabase.from('projects').select('*'),
        supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(20),
      ])
      setProjects(p ?? [])
      setActivity(a ?? [])
      setLoading(false)
    })()
  }, [])

  if (loading) return <div className="p-10"><Spinner /></div>

  const drafts = projects.filter((p) => p.status === 'draft')
  const completed = projects.filter((p) => p.status === 'completed')
  const ready = projects.filter((p) => p.status === 'ready')
  const puzzleBooks = projects.filter((p) => p.book_type === 'puzzle')
  const coloringBooks = projects.filter((p) => p.book_type === 'coloring')

  const stageCounts = WORKFLOW_STAGES.map((s) => ({ label: s.label, count: projects.filter((p) => p.current_stage === s.id).length }))
  const maxStageCount = Math.max(1, ...stageCounts.map((s) => s.count))

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      <PageHeader title="Analytics" subtitle="Track your publishing productivity and project metrics" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Projects" value={projects.length} icon={<FolderKanban className="w-5 h-5" />} />
        <StatCard label="Drafts" value={drafts.length} icon={<FileEdit className="w-5 h-5" />} accent="bg-warning-50 text-warning-600" />
        <StatCard label="Completed" value={completed.length} icon={<BookCheck className="w-5 h-5" />} accent="bg-success-50 text-success-600" />
        <StatCard label="Ready for KDP" value={ready.length} icon={<Rocket className="w-5 h-5" />} accent="bg-accent-50 text-accent-600" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-5">
          <h3 className="font-semibold text-fg mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-brand-600" /> Projects by Book Type</h3>
          <div className="space-y-3">
            <TypeBar label="Puzzle Books" count={puzzleBooks.length} total={projects.length} color="bg-brand-500" />
            <TypeBar label="Coloring Books" count={coloringBooks.length} total={projects.length} color="bg-accent-500" />
          </div>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-fg mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-brand-600" /> Projects by Workflow Stage</h3>
          <div className="space-y-2">
            {stageCounts.map((s) => (
              <div key={s.label} className="flex items-center gap-2 text-xs">
                <div className="w-28 text-fg-muted truncate">{s.label}</div>
                <div className="flex-1 h-4 bg-bg-soft rounded-full overflow-hidden"><div className="h-full bg-brand-400 rounded-full" style={{ width: `${(s.count / maxStageCount) * 100}%` }} /></div>
                <div className="w-6 text-right text-fg-soft">{s.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-fg mb-4">Recent Activity</h3>
        {activity.length === 0 ? (<p className="text-sm text-fg-muted">No activity recorded yet.</p>) : (
          <div className="space-y-2">
            {activity.map((a) => (
              <div key={a.id} className="flex items-center justify-between text-sm py-2 border-b border-border-soft last:border-0">
                <div><span className="text-fg">{a.action}</span>{a.detail && <span className="text-fg-muted"> \u2014 {a.detail}</span>}</div>
                <span className="text-xs text-fg-muted">{new Date(a.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TypeBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1"><span className="text-fg-soft">{label}</span><span className="text-fg-muted">{count} ({pct}%)</span></div>
      <div className="h-2.5 bg-bg-soft rounded-full overflow-hidden"><div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} /></div>
    </div>
  )
}
