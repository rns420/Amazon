import { ReactNode, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, Grid3x3, Palette, BookImage, FileText, TrendingUp, Search, KeyRound, Image, Layers, ChartBar as BarChart3, Settings, Shield, User, LogOut, Menu, X, Sun, Moon, BookOpen } from 'lucide-react'
import { useTheme } from '../lib/theme'
import { useAuth } from '../lib/auth'

const NAV = [
  { section: 'Overview', items: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/projects', label: 'Projects', icon: FolderKanban },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  ]},
  { section: 'Research', items: [
    { to: '/market-research', label: 'Market Research', icon: TrendingUp },
    { to: '/niche-finder', label: 'Niche Finder', icon: Search },
    { to: '/keyword-research', label: 'Keyword Research', icon: KeyRound },
  ]},
  { section: 'Creation', items: [
    { to: '/puzzle-generator', label: 'Puzzle Generator', icon: Grid3x3 },
    { to: '/coloring-generator', label: 'Coloring Generator', icon: Palette },
    { to: '/cover-creator', label: 'Cover Creator', icon: BookImage },
    { to: '/metadata', label: 'Metadata Generator', icon: FileText },
  ]},
  { section: 'Library', items: [
    { to: '/assets', label: 'Asset Library', icon: Image },
    { to: '/templates', label: 'Templates', icon: Layers },
  ]},
  { section: 'System', items: [
    { to: '/settings', label: 'Settings', icon: Settings },
    { to: '/admin', label: 'Admin Panel', icon: Shield },
    { to: '/profile', label: 'Profile', icon: User },
  ]},
]

export default function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const { theme, toggle } = useTheme()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className={`${open ? 'translate-x-0' : '-translate-x-full'} fixed lg:static lg:translate-x-0 z-40 w-64 h-full bg-bg-soft border-r border-border flex flex-col transition-transform`}>
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-border shrink-0">
          <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-fg leading-tight">KDP Studio</div>
            <div className="text-[11px] text-fg-muted">Publishing Automation</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {NAV.map((group) => (
            <div key={group.section}>
              <div className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-fg-muted">{group.section}</div>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive ? 'bg-brand-600 text-white font-medium' : 'text-fg-soft hover:bg-bg hover:text-fg'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-border shrink-0">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-semibold shrink-0">
              {(user?.email ?? 'U')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-fg truncate">{user?.email}</div>
            </div>
            <button onClick={handleSignOut} className="text-fg-muted hover:text-danger-500 p-1.5 rounded-lg hover:bg-bg" title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-bg flex items-center justify-between px-4 lg:px-6 shrink-0">
          <button className="lg:hidden text-fg-soft" onClick={() => setOpen(!open)}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2">
            <button onClick={toggle} className="btn-ghost p-2 rounded-lg" title="Toggle theme">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <NavLink to="/profile" className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-semibold hover:bg-brand-200 transition">
              {(user?.email ?? 'U')[0].toUpperCase()}
            </NavLink>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-bg">{children}</main>
      </div>
    </div>
  )
}
