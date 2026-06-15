import { cn } from '../../lib/utils'

export function GlassCard({ children, className, elevated = false, ...props }) {
  return (
    <div
      className={cn(elevated ? 'glass-elevated' : 'glass', 'rounded-2xl', className)}
      {...props}
    >
      {children}
    </div>
  )
}
