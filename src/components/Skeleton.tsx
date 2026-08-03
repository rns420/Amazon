// Skeleton loaders for better loading states

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export function Skeleton({ className = '', variant = 'text', width, height }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-bg-soft'
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }
  
  const style: React.CSSProperties = {
    width: width ?? (variant === 'text' ? '100%' : '100%'),
    height: height ?? (variant === 'text' ? '1em' : undefined),
  }
  
  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  )
}

// Card skeleton
export function CardSkeleton() {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <Skeleton width="60%" height={20} />
        <Skeleton width={80} height={24} variant="rectangular" />
      </div>
      <Skeleton width="40%" height={16} />
      <div className="space-y-2 mt-4">
        <Skeleton width="100%" height={8} />
        <Skeleton width="100%" height={8} />
        <Skeleton width="70%" height={8} />
      </div>
    </div>
  )
}

// Table skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card overflow-hidden">
      <div className="bg-bg-soft px-4 py-3">
        <div className="flex gap-4">
          <Skeleton width="20%" height={16} />
          <Skeleton width="15%" height={16} />
          <Skeleton width="25%" height={16} />
          <Skeleton width="15%" height={16} />
        </div>
      </div>
      <div className="divide-y divide-border-soft">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-4 py-3 flex gap-4">
            <Skeleton width="20%" height={16} />
            <Skeleton width="15%" height={16} />
            <Skeleton width="25%" height={16} />
            <Skeleton width="15%" height={16} />
          </div>
        ))}
      </div>
    </div>
  )
}

// Grid skeleton for project cards
export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

// Stat card skeleton
export function StatCardSkeleton() {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton width={80} height={14} />
          <Skeleton width={60} height={28} />
        </div>
        <Skeleton width={44} height={44} variant="rectangular" />
      </div>
    </div>
  )
}

// Chart skeleton
export function ChartSkeleton() {
  return (
    <div className="card p-5">
      <Skeleton width={150} height={20} className="mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton width={100} height={14} />
            <div className="flex-1">
              <Skeleton width={`${60 + Math.random() * 30}%`} height={16} />
            </div>
            <Skeleton width={30} height={14} />
          </div>
        ))}
      </div>
    </div>
  )
}

// Full page loading skeleton
export function PageSkeleton() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton width={200} height={32} />
          <Skeleton width={300} height={16} />
        </div>
        <Skeleton width={120} height={40} variant="rectangular" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <GridSkeleton count={3} />
    </div>
  )
}
