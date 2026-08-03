import { ReactNode } from 'react'

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-fg">{title}</h1>
        {subtitle && <p className="text-sm text-fg-muted mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

export function StatCard({ label, value, icon, accent }: { label: string; value: ReactNode; icon: ReactNode; accent?: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-fg-muted">{label}</div>
          <div className="text-2xl font-bold text-fg mt-1">{value}</div>
        </div>
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${accent ?? 'bg-brand-50 text-brand-600'}`}>{icon}</div>
      </div>
    </div>
  )
}

export function EmptyState({ icon, title, message, action }: { icon: ReactNode; title: string; message: string; action?: ReactNode }) {
  return (
    <div className="card p-10 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-bg-soft flex items-center justify-center text-fg-muted mb-4">{icon}</div>
      <h3 className="font-semibold text-fg">{title}</h3>
      <p className="text-sm text-fg-muted mt-1 max-w-sm">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Spinner() {
  return <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
}
