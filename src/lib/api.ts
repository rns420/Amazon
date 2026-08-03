// API utilities with timeout, retry logic, and error handling

const DEFAULT_TIMEOUT = 30000 // 30 seconds
const DEFAULT_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

interface RequestConfig extends RequestInit {
  timeout?: number
  retries?: number
  retryDelay?: number
}

interface ApiError extends Error {
  status?: number
  statusText?: string
  data?: unknown
}

class ApiError extends Error {
  constructor(message: string, status?: number, statusText?: string, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.statusText = statusText
    this.data = data
  }
}

// Simple exponential backoff delay
async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Check if we should retry based on the error
function shouldRetry(error: unknown, retriesLeft: number): boolean {
  if (retriesLeft <= 0) return false
  
  // Network errors are retryable
  if (error instanceof TypeError && error.message.includes('fetch')) return true
  
  // Server errors (5xx) are retryable
  if (error instanceof ApiError && error.status && error.status >= 500) return true
  
  // Rate limiting (429) is retryable
  if (error instanceof ApiError && error.status === 429) return true
  
  return false
}

// Execute a fetch with timeout
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

// Main API request function with retry logic
export async function apiRequest<T = unknown>(
  url: string,
  config: RequestConfig = {}
): Promise<T> {
  const {
    timeout = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES,
    retryDelay = RETRY_DELAY,
    ...fetchOptions
  } = config

  let lastError: unknown
  
  for (let attempt = retries; attempt >= 0; attempt--) {
    try {
      const response = await fetchWithTimeout(url, fetchOptions, timeout)
      
      if (!response.ok) {
        let errorData: unknown
        try {
          errorData = await response.json()
        } catch {
          errorData = await response.text()
        }
        
        const error = new ApiError(
          `Request failed: ${response.status} ${response.statusText}`,
          response.status,
          response.statusText,
          errorData
        )
        
        if (!shouldRetry(error, attempt)) {
          throw error
        }
        
        lastError = error
      } else {
        // Parse JSON response
        const contentType = response.headers.get('content-type')
        if (contentType?.includes('application/json')) {
          return await response.json()
        }
        return await response.text() as unknown as T
      }
    } catch (error) {
      lastError = error
      
      if (!shouldRetry(error, attempt)) {
        throw error
      }
      
      // Wait before retrying with exponential backoff
      const backoffDelay = retryDelay * (DEFAULT_RETRIES - attempt)
      await delay(backoffDelay)
    }
  }
  
  throw lastError
}

// Convenience methods for common HTTP methods
export const api = {
  get: <T = unknown>(url: string, config?: RequestConfig) =>
    apiRequest<T>(url, { ...config, method: 'GET' }),
  
  post: <T = unknown>(url: string, body?: unknown, config?: RequestConfig) =>
    apiRequest<T>(url, {
      ...config,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...config?.headers },
      body: body ? JSON.stringify(body) : undefined,
    }),
  
  put: <T = unknown>(url: string, body?: unknown, config?: RequestConfig) =>
    apiRequest<T>(url, {
      ...config,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...config?.headers },
      body: body ? JSON.stringify(body) : undefined,
    }),
  
  patch: <T = unknown>(url: string, body?: unknown, config?: RequestConfig) =>
    apiRequest<T>(url, {
      ...config,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...config?.headers },
      body: body ? JSON.stringify(body) : undefined,
    }),
  
  delete: <T = unknown>(url: string, config?: RequestConfig) =>
    apiRequest<T>(url, { ...config, method: 'DELETE' }),
}

// Wrapper for Supabase requests with better error handling
export async function supabaseRequest<T>(
  promise: Promise<{ data: T | null; error: { message: string; details?: string } | null }>
): Promise<T> {
  const { data, error } = await promise
  
  if (error) {
    throw new ApiError(
      error.message || 'An error occurred',
      undefined,
      undefined,
      error.details
    )
  }
  
  return data as T
}

// Format error for display
export function formatApiError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.data && typeof error.data === 'object' && 'message' in error.data) {
      return String((error.data as { message: string }).message)
    }
    return error.message
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'An unexpected error occurred'
}
