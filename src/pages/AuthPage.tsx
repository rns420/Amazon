import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useToast } from '../lib/toast'
import { BookOpen, Mail, Lock, User } from 'lucide-react'

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const { signIn, signUp } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    if (mode === 'signup') {
      if (password.length < 6) { setError('Password must be at least 6 characters.'); setBusy(false); return }
      const { error } = await signUp(email, password, name)
      if (error) { setError(error); setBusy(false); return }
      notify('Account created! Welcome to KDP Studio.', 'success')
      navigate('/')
    } else {
      const { error } = await signIn(email, password)
      if (error) { setError(error); setBusy(false); return }
      notify('Signed in successfully.', 'success')
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-soft px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center text-white mb-4">
            <BookOpen className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-fg">KDP Publishing Studio</h1>
          <p className="text-sm text-fg-muted mt-1">Create, manage, and publish Amazon KDP books</p>
        </div>

        <div className="card p-6">
          <div className="flex gap-1 p-1 bg-bg-soft rounded-lg mb-6">
            <button onClick={() => setMode('signin')} className={`flex-1 py-2 rounded-md text-sm font-medium transition ${mode === 'signin' ? 'bg-bg text-fg shadow-card' : 'text-fg-muted'}`}>Sign In</button>
            <button onClick={() => setMode('signup')} className={`flex-1 py-2 rounded-md text-sm font-medium transition ${mode === 'signup' ? 'bg-bg text-fg shadow-card' : 'text-fg-muted'}`}>Sign Up</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="label">Display Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
                  <input className="input pl-9" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your author name" required />
                </div>
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
                <input type="email" className="input pl-9" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
                <input type="password" className="input pl-9" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" required />
              </div>
            </div>

            {error && <div className="text-sm text-danger-600 bg-danger-50 rounded-lg px-3 py-2">{error}</div>}

            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? 'Please wait\u2026' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-fg-muted mt-6">
          By signing up you agree to use this tool responsibly and comply with Amazon KDP terms.
        </p>
      </div>
    </div>
  )
}
