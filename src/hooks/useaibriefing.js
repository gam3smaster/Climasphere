import { useState, useEffect, useRef } from 'react'
import { buildWeatherContext, generateBriefing } from '../services/ai'

// The briefing card renders twice in the dashboard, mobile reading and desktop
export function useAiBriefing(weather, location, userName) {
  const [status, setStatus] = useState('idle')
  const [text, setText]     = useState(null)

  // This tracks what conditions the current briefing was generated for,
  // so it regenerates on real change, not on every re-render
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

  return { status, text }
}