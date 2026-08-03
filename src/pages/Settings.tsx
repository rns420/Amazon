import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { useTheme } from '../lib/theme'
import { useToast } from '../lib/toast'
import { PageHeader } from '../components/ui'
import { KDP_TRIM_SIZES } from '../lib/constants'
import { Ruler, Globe, Bell, Palette, FileDown } from 'lucide-react'

export default function Settings() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const { notify } = useToast()
  const [prefs, setPrefs] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('profiles').select('preferences').eq('id', user!.id).maybeSingle()
      setPrefs(data?.preferences ?? {})
      setLoading(false)
    })()
  }, [user])

  const save = async (newPrefs: any) => {
    setPrefs(newPrefs)
    await supabase.from('profiles').upsert({ id: user!.id, preferences: newPrefs })
    notify('Settings saved.', 'success')
  }

  if (loading) return <div className="p-10 text-fg-muted">Loading\u2026</div>

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto animate-fade-in">
      <PageHeader title="Settings" subtitle="Customize your KDP Studio workspace" />

      <div className="space-y-6">
        <Section icon={<Palette className="w-5 h-5" />} title="Appearance" desc="Theme and visual preferences">
          <div><label className="label">Theme</label>
            <div className="flex gap-2">
              <button onClick={() => setTheme('light')} className={`flex-1 p-3 rounded-lg border text-sm font-medium transition ${theme === 'light' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-border text-fg-soft'}`}>Light</button>
              <button onClick={() => setTheme('dark')} className={`flex-1 p-3 rounded-lg border text-sm font-medium transition ${theme === 'dark' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-border text-fg-soft'}`}>Dark</button>
            </div>
          </div>
        </Section>

        <Section icon={<Ruler className="w-5 h-5" />} title="Defaults" desc="Default trim size and units for new projects">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">Default Trim Size</label><select className="input" value={prefs.defaultTrimSize ?? '8.5x11'} onChange={(e) => save({ ...prefs, defaultTrimSize: e.target.value })}>{KDP_TRIM_SIZES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}</select></div>
            <div><label className="label">Units</label><select className="input" value={prefs.units ?? 'inches'} onChange={(e) => save({ ...prefs, units: e.target.value })}><option value="inches">Inches</option><option value="mm">Millimeters</option></select></div>
          </div>
        </Section>

        <Section icon={<Globe className="w-5 h-5" />} title="Language & Region" desc="Interface language and marketplace">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">Interface Language</label><select className="input" value={prefs.language ?? 'en'} onChange={(e) => save({ ...prefs, language: e.target.value })}><option value="en">English</option><option value="es">Spanish</option><option value="de">German</option><option value="fr">French</option></select></div>
            <div><label className="label">Default Marketplace</label><select className="input" value={prefs.marketplace ?? 'US'} onChange={(e) => save({ ...prefs, marketplace: e.target.value })}><option value="US">Amazon.com (US)</option><option value="UK">Amazon.co.uk (UK)</option><option value="DE">Amazon.de (Germany)</option><option value="CA">Amazon.ca (Canada)</option></select></div>
          </div>
        </Section>

        <Section icon={<FileDown className="w-5 h-5" />} title="Export Preferences" desc="Default export settings">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">PDF Quality</label><select className="input" value={prefs.pdfQuality ?? 'high'} onChange={(e) => save({ ...prefs, pdfQuality: e.target.value })}><option value="high">High (print-ready)</option><option value="medium">Medium</option><option value="draft">Draft</option></select></div>
            <div><label className="label">Include Solutions</label><select className="input" value={prefs.includeSolutions ?? 'yes'} onChange={(e) => save({ ...prefs, includeSolutions: e.target.value })}><option value="yes">Always include</option><option value="no">Never include</option></select></div>
          </div>
        </Section>

        <Section icon={<Bell className="w-5 h-5" />} title="Notifications" desc="Alert and notification preferences">
          <label className="flex items-center justify-between cursor-pointer"><span className="text-sm text-fg-soft">Toast notifications</span><input type="checkbox" defaultChecked={prefs.toasts !== false} onChange={(e) => save({ ...prefs, toasts: e.target.checked })} className="w-5 h-5 rounded" /></label>
          <label className="flex items-center justify-between cursor-pointer"><span className="text-sm text-fg-soft">Activity logging</span><input type="checkbox" defaultChecked={prefs.activityLog !== false} onChange={(e) => save({ ...prefs, activityLog: e.target.checked })} className="w-5 h-5 rounded" /></label>
        </Section>
      </div>
    </div>
  )
}

function Section({ icon, title, desc, children }: any) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">{icon}</div><div><h3 className="font-semibold text-fg">{title}</h3><p className="text-xs text-fg-muted">{desc}</p></div></div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}
