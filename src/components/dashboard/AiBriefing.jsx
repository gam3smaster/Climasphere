import { Sparkles } from 'lucide-react'
import { GlassCard } from '../ui/GlassCard'
import { LoadingDots } from '../ui/LoadingState'
import { cn } from '../../lib/utils'

export function AiBriefing({ status, text, className }) {
  return (
    <GlassCard className={cn('p-5', className)}>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={13} style={{ color: 'var(--accent-primary)' }} />
        <span className="text-xs font-data" style={{ color: 'var(--text-ghost)', letterSpacing: '1.5px' }}>
          DAILY BRIEFING
        </span>
      </div>

      <Content status={status} text={text} />
    </GlassCard>
  )
}

function Content({ status, text }) {
  if (status === 'loading') {
    return (
      <div
        className="flex items-center gap-2 text-sm"
        style={{ color: 'var(--text-muted)' }}
      >
        <LoadingDots />
        <span>Analyzing conditions...</span>
      </div>
    )
  }

  if (status === 'done' && text) {
    return (
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {text}
      </p>
    )
  }

  if (status === 'unconfigured') {
    return (
      <div>
        <p className="text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>
          Add a Gemini or Groq API key to enable AI briefings.
        </p>
        <p className="text-xs font-data" style={{ color: 'var(--text-ghost)' }}>
          VITE_GEMINI_API_KEY in your .env file
        </p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        Briefing unavailable. Check your API key configuration.
      </p>
    )
  }

  return null
}