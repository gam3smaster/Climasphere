import { useState, useMemo } from 'react'
import { ChevronDown } from 'lucide-react'
import { useWeather } from '../hooks/useWeather'
import { getWeatherMeta, getTempPalette, windDirLabel } from '../lib/weather'
import { formatDayShort, isToday } from '../lib/time'
import { WeatherIcon } from '../components/ui/WeatherIcon'
import { GlassCard } from '../components/ui/GlassCard'
import { SkeletonBlock } from '../components/ui/LoadingState'

export default function Forecast() {
  const { daily, hourly, isLoading, isReady, location } = useWeather()
  const [expandedDay, setExpandedDay] = useState(null)

  // Group hour by day
  const hourlyByDay = useMemo(() =>
    hourly.reduce((acc, h) => {
      const day = h.time.slice(0, 10)
      if (!acc[day]) acc[day] = []
      acc[day].push(h)
      return acc
    }, {})
  , [hourly])

  // Used to position each day's temerature bar
  const globalRange = useMemo(() => {
    if (!daily.length) return { min: 0, span: 1 }
    const min = Math.min(...daily.map(d => d.tempMin))
    const max = Math.max(...daily.map(d => d.tempMax))
    return { min, span: max - min || 1 }
  }, [daily])

  function toggle(date) {
    setExpandedDay(prev => prev === date ? null : date)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-light tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Forecast
        </h1>
        {location && (
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {location.name}, {location.country}
          </p>
        )}
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-16" />
          ))}
        </div>
      )}

      {isReady && (
        <GlassCard>
          {daily.map((day, i) => (
            <DayRow
              key={day.time}
              day={day}
              hourly={hourlyByDay[day.time] ?? []}
              isExpanded={expandedDay === day.time}
              onToggle={() => toggle(day.time)}
              isLast={i === daily.length - 1}
              globalRange={globalRange}
            />
          ))}
        </GlassCard>
      )}
    </div>
  )
}

function DayRow({ day, hourly, isExpanded, onToggle, isLast, globalRange }) {
  const meta = getWeatherMeta(day.code)
  const today = isToday(day.time)
  const minPct = ((day.tempMin - globalRange.min) / globalRange.span) * 100
  const maxPct = ((day.tempMax - globalRange.min) / globalRange.span) * 100

  return (
    <div style={{ borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)' }}>
      {/* Day summary row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 sm:gap-4 px-3 sm:px-5 py-4 text-left transition-all"
        style={{ background: isExpanded ? 'var(--bg-elevated)' : 'transparent' }}
        onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = 'var(--bg-surface)' }}
        onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = 'transparent' }}
      >
        {/* Day name and precip probability */}
        <div className="w-12 sm:w-[72px] flex-shrink-0">
          <p className="text-sm" style={{
            color: today ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: today ? 500 : 400,
          }}>
            {today ? 'Today' : formatDayShort(day.time)}
          </p>
          {day.precipProb > 0 && (
            <p className="text-xs font-data mt-0.5" style={{ color: '#38bdf8' }}>
              {day.precipProb}%
            </p>
          )}
        </div>

        {/* Condition */}
        <div className="flex items-center gap-2" style={{ width: 144, flexShrink: 0 }}>
          <WeatherIcon code={day.code} size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <span className="hidden sm:inline text-sm" style={{ color: 'var(--text-muted)' }}>
            {meta.label}
          </span>
        </div>

        {/* Temperature range bar */}
        <div className="flex-1 flex items-center gap-3">
          <span className="text-sm font-data"
            style={{ color: 'var(--text-muted)', width: 32, textAlign: 'right', flexShrink: 0 }}>
            {Math.round(day.tempMin)}°
          </span>
          <div className="flex-1 h-1 rounded-full" style={{ background: 'var(--border-default)' }}>
            <div className="h-full rounded-full"
              style={{
                marginLeft: `${minPct}%`,
                width: `${maxPct - minPct}%`,
                background: `linear-gradient(90deg,
                  ${getTempPalette(day.tempMin).accent},
                  ${getTempPalette(day.tempMax).accent}
                )`,
              }}
            />
          </div>
          <span className="text-sm font-data"
            style={{ color: 'var(--text-primary)', width: 32, flexShrink: 0 }}>
            {Math.round(day.tempMax)}°
          </span>
        </div>

        {/* Wind */}
        <div className="hidden sm:block text-right" style={{ width: 68, flexShrink: 0 }}>
          <p className="text-xs font-data" style={{ color: 'var(--text-muted)' }}>
            {windDirLabel(day.windDir)} {Math.round(day.windMax)}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-ghost)' }}>km/h</p>
        </div>

        <ChevronDown size={14} style={{
          color: 'var(--text-ghost)',
          flexShrink: 0,
          transform:  isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 250ms var(--ease-smooth)',
        }} />
      </button>

      {/* Expanded hourly strip */}
      {isExpanded && hourly.length > 0 && (
        <div
          className="overflow-x-auto"
          style={{
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
            padding: '12px 20px 16px',
          }}
        >
          <div className="flex gap-1.5" style={{ minWidth: 'max-content' }}>
            {hourly.map(h => (
              <HourCard key={h.time} hour={h} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function HourCard({ hour }) {
  const palette = getTempPalette(hour.temp)
  return (
    <div className="flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl"
      style={{ background: 'var(--bg-elevated)', minWidth: 54 }}
    >
      <span className="text-xs font-data" style={{ color: 'var(--text-ghost)' }}>
        {hour.time.slice(11, 16)}
      </span>
      <WeatherIcon code={hour.code} size={13} style={{ color: 'var(--text-muted)' }} />
      <span className="text-sm font-data" style={{ color: palette.accent }}>
        {Math.round(hour.temp)}°
      </span>
      {(hour.precipProb ?? 0) > 0 && (
        <span className="text-xs font-data" style={{ color: '#38bdf8' }}>
          {hour.precipProb}%
        </span>
      )}
    </div>
  )
}