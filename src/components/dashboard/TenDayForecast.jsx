import { GlassCard } from '../ui/GlassCard'
import { WeatherIcon } from '../ui/WeatherIcon'
import { getTempPalette } from '../../lib/weather'
import { formatDayShort, isToday } from '../../lib/time'

export function TenDayForecast({ daily }) {
  if (!daily.length) return null

  // All bars to match the global temperature range for the week
  const allTemps  = daily.flatMap(d => [d.tempMin, d.tempMax])
  const globalMin = Math.min(...allTemps)
  const globalMax = Math.max(...allTemps)
  const globalRange = globalMax - globalMin || 1

  return (
    <GlassCard className="p-5">
      <p
        className="text-xs font-data mb-4"
        style={{ color: 'var(--text-ghost)', letterSpacing: '1.5px' }}>
        10-DAY OUTLOOK
      </p>

      <div className="space-y-2.5">
        {daily.map(day => (
          <DayRow
            key={day.time}
            day={day}
            globalMin={globalMin}
            globalRange={globalRange}
          />
        ))}
      </div>
    </GlassCard>
  )
}

function DayRow({ day, globalMin, globalRange }) {
  const today = isToday(day.time)
  const minPct = ((day.tempMin - globalMin) / globalRange) * 100
  const maxPct = ((day.tempMax - globalMin) / globalRange) * 100
  const midTemp = (day.tempMin + day.tempMax) / 2

  return (
    <div className="grid items-center gap-3" style={{ gridTemplateColumns: '72px 20px 1fr 56px' }}>

      {/* Day label */}
      <span className="text-sm" style={{
        color: today ? 'var(--text-primary)' : 'var(--text-secondary)',
        fontWeight: today ? 500 : 400,
        }}>
        {today ? 'Today' : formatDayShort(day.time)}
      </span>

      {/* Condition icon */}
      <WeatherIcon
        code={day.code}
        size={15}
        style={{ color: 'var(--text-muted)', flexShrink: 0 }}
      />

      {/* Temperature range bar */}
      <div
        className="relative h-1 rounded-full overflow-hidden"
        style={{ background: 'var(--border-default)' }}>
        <div
          className="absolute h-full rounded-full"
          style={{
            left: `${minPct}%`,
            right: `${100 - maxPct}%`,
            background: `linear-gradient(90deg,
              ${getTempPalette(day.tempMin).accent},
              ${getTempPalette(day.tempMax).accent}
            )`,
          }}
        />
      </div>

      {/* Min/Max temperatures */}
      <div className="flex justify-between text-sm font-data">
        <span style={{ color: 'var(--text-muted)' }}>
          {Math.round(day.tempMin)}°
        </span>
        <span style={{ color: 'var(--text-primary)' }}>
          {Math.round(day.tempMax)}°
        </span>
      </div>
    </div>
  )
}
