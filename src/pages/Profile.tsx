import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { useToast } from '../lib/toast'
import { PageHeader, Spinner } from '../components/ui'
import { User, Mail, Save } from 'lucide-react'

export default function Profile() {
  const { user } = useAuth()
  const { notify } = useToast()
  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', user!.id).maybeSingle()
      setDisplayName(data?.display_name ?? '')
      setAvatarUrl(data?.avatar_url ?? '')
      setLoading(false)
    })()
  }, [user])

  const save = async () => {
    setSaving(true)
    await supabase.from('profiles').upsert({ id: user!.id, display_name: displayName, avatar_url: avatarUrl })
    setSaving(false)
    notify('Profile updated.', 'success')
  }

  if (loading) return <div className="p-10"><Spinner /></div>

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto animate-fade-in">
      <PageHeader title="Profile" subtitle="Manage your account and author profile" />

      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-2xl font-semibold">
            {(displayName || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-fg text-lg">{displayName || 'Author'}</div>
            <div className="text-sm text-fg-muted">{user?.email}</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Display Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
              <input className="input pl-9" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your author name" />
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
              <input className="input pl-9 opacity-60" value={user?.email ?? ''} disabled />
            </div>
          </div>
          <div>
            <label className="label">Avatar URL (optional)</label>
            <input className="input" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://…" />
          </div>
          <button onClick={save} disabled={saving} className="btn-primary"><Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Profile'}</button>
        </div>
      </div>

      <div className="card p-5 mt-6">
        <h3 className="font-semibold text-fg mb-3">Account Stats</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-fg">{new Date(user?.created_at ?? Date.now()).getFullYear()}</div>
            <div className="text-xs text-fg-muted">Member since</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-fg">{user?.id?.slice(0, 4) ?? 'N/A'}</div>
            <div className="text-xs text-fg-muted">User ID prefix</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-fg">Active</div>
            <div className="text-xs text-fg-muted">Account status</div>
          </div>
        </div>
      </div>
    </div>
  )
}
