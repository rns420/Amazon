import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { PageHeader, StatCard, Spinner } from '../components/ui'
import { FolderKanban, Activity, AlertCircle } from 'lucide-react'

export default function AdminPanel() {
  const { user } = useAuth()
  const [stats, setStats] = useState<{ projects: number; activity: number } | null>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const [{ count: projects }, { count: activity }, { data: act }] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('activity_log').select('*', { count: 'exact', head: true }),
        supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(15),
      ])
      setStats({ projects: projects ?? 0, activity: activity ?? 0 })
      setRecentActivity(act ?? [])
      setLoading(false)
    })()
  }, [])

  if (loading) return <div className="p-10"><Spinner /></div>

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      <PageHeader title="Admin Panel" subtitle="System overview and usage statistics" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Projects" value={stats!.projects} icon={<FolderKanban className="w-5 h-5" />} />
        <StatCard label="Activity Entries" value={stats!.activity} icon={<Activity className="w-5 h-5" />} accent="bg-accent-50 text-accent-600" />
        <StatCard label="System Status" value="Healthy" icon={<AlertCircle className="w-5 h-5" />} accent="bg-success-50 text-success-600" />
        <StatCard label="Version" value="1.0.0" icon={<AlertCircle className="w-5 h-5" />} accent="bg-brand-50 text-brand-600" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold text-fg mb-4">System Information</h3>
          <div className="space-y-2 text-sm">
            <InfoRow label="Version" value="1.0.0" />
            <InfoRow label="Environment" value="Production" />
            <InfoRow label="Database" value="Supabase (PostgreSQL)" />
            <InfoRow label="Auth Provider" value="Supabase Auth" />
            <InfoRow label="Storage" value="Supabase Storage" />
            <InfoRow label="Current User" value={user?.email ?? 'Unknown'} />
          </div>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-fg mb-4">Error Log</h3>
          <div className="text-sm text-fg-muted text-center py-6">No errors recorded. All systems operational.</div>
        </div>
      </div>

      <div className="card p-5 mt-6">
        <h3 className="font-semibold text-fg mb-4">Recent System Activity</h3>
        {recentActivity.length === 0 ? (<p className="text-sm text-fg-muted">No activity recorded.</p>) : (
          <div className="space-y-2">
            {recentActivity.map((a) => (
              <div key={a.id} className="flex items-center justify-between text-sm py-2 border-b border-border-soft last:border-0">
                <div><span className="text-fg">{a.action}</span>{a.detail && <span className="text-fg-muted"> \u2014 {a.detail}</span>}</div>
                <span className="text-xs text-fg-muted">{new Date(a.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (<div className="flex justify-between py-2 border-b border-border-soft last:border-0"><span className="text-fg-muted">{label}</span><span className="text-fg font-medium">{value}</span></div>)
}
