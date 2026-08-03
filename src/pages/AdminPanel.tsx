import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { PageHeader, StatCard, Spinner } from '../components/ui'
import { FolderKanban, Activity, User } from 'lucide-react'

export default function AdminPanel() {
  const { user } = useAuth()
  const [stats, setStats] = useState<{ projects: number; activity: number; assets: number; templates: number } | null>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      const [pRes, aRes, actRes, astRes, tplRes] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('activity_log').select('*', { count: 'exact', head: true }),
        supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(15),
        supabase.from('assets').select('*', { count: 'exact', head: true }),
        supabase.from('templates').select('*', { count: 'exact', head: true }),
      ])
      if (pRes.error || aRes.error || actRes.error) {
        setError('Failed to load admin data. Please try again.')
        setLoading(false)
        return
      }
      setStats({
        projects: pRes.count ?? 0,
        activity: aRes.count ?? 0,
        assets: astRes.count ?? 0,
        templates: tplRes.count ?? 0,
      })
      setRecentActivity(actRes.data ?? [])
      setLoading(false)
    })()
  }, [])

  if (loading) return <div className="p-10"><Spinner /></div>

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      <PageHeader title="Admin Panel" subtitle="Your workspace overview and usage statistics" />

      {error ? (
        <div className="card p-6 text-center text-danger-600 text-sm">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Projects" value={stats!.projects} icon={<FolderKanban className="w-5 h-5" />} />
            <StatCard label="Activity Entries" value={stats!.activity} icon={<Activity className="w-5 h-5" />} accent="bg-accent-50 text-accent-600" />
            <StatCard label="Assets" value={stats!.assets} icon={<FolderKanban className="w-5 h-5" />} accent="bg-warning-50 text-warning-600" />
            <StatCard label="Templates" value={stats!.templates} icon={<FolderKanban className="w-5 h-5" />} accent="bg-success-50 text-success-600" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <h3 className="font-semibold text-fg mb-4">Account Information</h3>
              <div className="space-y-2 text-sm">
                <InfoRow label="Signed in as" value={user?.email ?? 'Unknown'} />
                <InfoRow label="User ID" value={user?.id?.slice(0, 8) ?? 'Unknown'} />
                <InfoRow label="Account created" value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'} />
              </div>
            </div>
            <div className="card p-5">
              <h3 className="font-semibold text-fg mb-4">Recent Activity</h3>
              {recentActivity.length === 0 ? (
                <p className="text-sm text-fg-muted text-center py-6">No activity recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {recentActivity.slice(0, 8).map((a) => (
                    <div key={a.id} className="flex items-center justify-between text-sm py-2 border-b border-border-soft last:border-0">
                      <div><span className="text-fg">{a.action}</span>{a.detail && <span className="text-fg-muted"> \u2014 {a.detail}</span>}</div>
                      <span className="text-xs text-fg-muted">{new Date(a.created_at).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card p-5 mt-6">
            <h3 className="font-semibold text-fg mb-4 flex items-center gap-2"><User className="w-4 h-4" /> All Activity Log</h3>
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
        </>
      )}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (<div className="flex justify-between py-2 border-b border-border-soft last:border-0"><span className="text-fg-muted">{label}</span><span className="text-fg font-medium">{value}</span></div>)
}
