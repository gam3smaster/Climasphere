import { GlassCard } from '../ui/GlassCard'
import { windDirLabel, uvCategory, aqiCategory } from '../../lib/weather'

// Each of the stats defines how to derive its value from the current weather object
const STATS = [
  {
    key: 'humidity',
    label: 'HUMIDITY',
    value: c => `${c.humidity}%`,
    note: c => c.humidity > 80 ? 'High' : c.humidity < 30 ? 'Dry' : 'Comfortable',
    color: () => null,
  },
  {
    key: 'wind',
    label: 'WIND',
    value: c => `${Math.round(c.windSpeed)} km/h`,
    note: c => windDirLabel(c.windDir),
    color: () => null,
  },
  {
    key: 'pressure',
    label: 'PRESSURE',
    value: c => `${Math.round(c.pressure)} hPa`,
    note: c => c.pressure < 1000 ? 'Low' : c.pressure > 1020 ? 'High' : 'Normal',
    color: () => null,
  },
  {
    key: 'visibility',
    label: 'VISIBILITY',
    value: c => `${(c.visibility / 1000).toFixed(1)} km`,
    note: c => {
      const km = c.visibility / 1000
      if (km < 1)  return 'Very poor'
      if (km < 4)  return 'Poor'
      if (km < 10) return 'Moderate'
      return 'Clear'
    },
    color: () => null,
  },
  {
    key: 'uv',
    label: 'UV INDEX',
    value: c => c.uvIndex,
    note: c => uvCategory(c.uvIndex).label,
    color: c => uvCategory(c.uvIndex).color,
  },
]

export function StatsRow({ current }) {
  if (!current) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {STATS.map(stat => (
        <StatCard key={stat.key} stat={stat} current={current} />
      ))}
    </div>
  )
}

function StatCard({ stat, current }) {
  const value = stat.value(current)
  const note = stat.note(current)
  const accentColor = stat.color(current)

  return (
    <GlassCard className="p-4">
      <p
        className="text-xs font-data mb-2.5"
        style={{ color: 'var(--text-ghost)', letterSpacing: '1.5px' }}>
        {stat.label}
      </p>
      <p
        className="text-xl font-display font-light mb-1 font-data"
        style={{ color: 'var(--text-primary)' }}>
        {value}
      </p>
      <p
        className="text-xs"
        style={{ color: accentColor ?? 'var(--text-secondary)' }}>
        {note}
      </p>
    </GlassCard>
  )
}
