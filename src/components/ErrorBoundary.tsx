import { Component, ReactNode, ErrorInfo, useState } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })
    // Log error to monitoring service in production
    if (import.meta.env.PROD) {
      console.error('Error caught by boundary:', error, errorInfo)
    }
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-bg px-4">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-full bg-danger-50 text-danger-500 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-fg mb-2">Something went wrong</h1>
            <p className="text-fg-muted mb-6">
              We encountered an unexpected error. Please try refreshing the page or return to the dashboard.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <details className="text-left mb-6 p-4 bg-bg-soft rounded-lg text-sm">
                <summary className="font-medium text-fg cursor-pointer mb-2">Error Details (Dev Only)</summary>
                <pre className="text-danger-600 overflow-auto whitespace-pre-wrap">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="btn-primary"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
              <Link to="/" className="btn-outline">
                <Home className="w-4 h-4" />
                Go Home
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for error handling in components
export function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null)

  const handleError = (err: Error | string) => {
    const error = typeof err === 'string' ? new Error(err) : err
    setError(error)
    throw error
  }

  const clearError = () => setError(null)

  return { error, handleError, clearError }
}

// Simple error logger for production
export function logError(error: Error, context?: Record<string, unknown>) {
  if (import.meta.env.PROD) {
    // In production, send to error tracking service
    console.error('[Production Error]', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    })
  }
}

// Network error handler
export function handleNetworkError(error: unknown): string {
  if (error instanceof Response) {
    return `Server error: ${error.status} ${error.statusText}`
  }
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'Network error. Please check your internet connection.'
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred. Please try again.'
}
