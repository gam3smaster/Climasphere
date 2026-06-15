import { cn } from '../../lib/utils'

// Three styled dots for loading messages
export function LoadingDots({ className }) {
  return (
    <div className={cn('flex items-center gap-1', className)} aria-label="Loading">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1 h-1 rounded-full bg-current"
          style={{
            animation: 'pulse 1.4s ease-in-out infinite',
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  )
}

// Rectangular block for content that hasn't loaded yet
export function SkeletonBlock({ className }) {
  return (
    <div
      className={cn('rounded-xl animate-pulse', className)}
      style={{ background: 'var(--bg-elevated)' }}
      aria-hidden="true"
    />
  )
}
