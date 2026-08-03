import { Link } from 'react-router-dom'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-[120px] font-bold text-bg-soft leading-none mb-4">404</div>
        <h1 className="text-2xl font-bold text-fg mb-2">Page Not Found</h1>
        <p className="text-fg-muted mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Link to="/" className="btn-primary">
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
          <button onClick={() => window.history.back()} className="btn-outline">
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
        
        <div className="text-sm text-fg-muted">
          <p className="mb-2">You might want to try:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link to="/projects" className="text-brand-600 hover:underline">Projects</Link>
            <span className="text-border-soft">•</span>
            <Link to="/puzzle-generator" className="text-brand-600 hover:underline">Puzzle Generator</Link>
            <span className="text-border-soft">•</span>
            <Link to="/market-research" className="text-brand-600 hover:underline">Market Research</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
