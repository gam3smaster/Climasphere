import { useState, useEffect, useRef } from 'react'
import { Sparkles } from 'lucide-react'
import { GlassCard } from '../ui/GlassCard'
import { LoadingDots } from '../ui/LoadingState'
import { buildWeatherContext, generateBriefing } from '../../services/ai'

export function AiBriefing({ weather, location, userName }) {
  const [status, setStatus] = useState('idle')
  const [text, setText]   = useState(null)

  // Track what conditions the current briefing was generated for
  // and regenerates if the location or weather code changes, but not everytime it gets rendered again
  const generatedKey = useRef(null)

  useEffect(() => {
    if (!weather?.current || !location) return

    const key = `${location.lat.toFixed(2)},${location.lon.toFixed(2)},${weather.current.code}`
    if (generatedKey.current === key) return
    generatedKey.current = key

    async function run() {
      setStatus('loading')
      setText(null)

      try {
        const ctx = buildWeatherContext(weather, location)
        const result = await generateBriefing(ctx, userName)

        if (result === null) {
          setStatus('unconfigured')
        } else {
          setText(result)
          setStatus('done')
        }
      } catch (err) {
        console.error('[ClimaSphere AI] Briefing failed:', err)
        setStatus('error')
      }
    }

    run()
  }, [weather?.current?.code, location?.lat, location?.lon, userName])

  return (
    <GlassCard className="p-5">
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
