import { useState, useEffect } from 'react'
import {
ComposedChart,
Area,
Line,
Bar,
XAxis,
YAxis,
Tooltip,
ResponsiveContainer,
} from 'recharts'
import { useWeather } from '../hooks/useWeather'
import { fetchHistory } from '../services/openMeteo'
import { GlassCard } from '../components/ui/GlassCard'
import { SkeletonBlock } from '../components/ui/LoadingState'
import { formatDayShort } from '../lib/time'

const RANGES = [
  { label: '7D', days: 7 },
  { label: '14D', days: 14 },
  { label: '30D', days: 30 },
]

export default function History() {
  const { location } = useWeather()
  const [days, setDays] = useState(7)
  const [history, setHistory] = useState(null)
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    if (!location) return

    setStatus('loading')
    const { start, end } = dateRange(days)

    fetchHistory(location.lat, location.lon, start, end)
      .then(data => { setHistory(data); setStatus('done') })
      .catch(err => {
        console.error('[ClimaSphere] History fetch failed:', err)
        setStatus('error')
      })
  }, [location?.lat, location?.lon, days])

  return (
    <div className="p-6">
      <div className="mb-6 flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-light tracking-tight" style={{ color: 'var(--text-primary)' }}>
            History
          </h1>
          {location && (
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {location.name}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          {RANGES.map(r => (
            <button
              key={r.days}
              onClick={() => setDays(r.days)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-data"
              style={{
                background: days === r.days ? 'var(--accent-glow)' : 'var(--bg-surface)',
                border: `1px solid ${days === r.days ? 'var(--accent-dim)' : 'var(--border-default)'}`,
                color: days === r.days ? 'var(--accent-primary)' : 'var(--text-muted)',
              }}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {status === 'loading' && <SkeletonBlock className="h-80" />}

      {status === 'error' && (
        <GlassCard className="p-10 text-center max-w-md">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Could not load historical data for this location.
          </p>
        </GlassCard>
      )}

      {status === 'done' && history && (
        <GlassCard className="p-5">
          <p className="text-xs font-data mb-4" style={{ color: 'var(--text-ghost)', letterSpacing: '1.5px' }}>
            TEMPERATURE &amp; PRECIPITATION
          </p>

          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={chartData(history)} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="hist-temp-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#fb923c" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#fb923c" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="label"
                tick={{ fill: 'rgba(238,242,255,0.28)', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
                axisLine={false}
                tickLine={false}
                interval={days > 14 ? 2 : 0}
              />
              <YAxis
                yAxisId="temp"
                tick={{ fill: 'rgba(238,242,255,0.28)', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <YAxis
                yAxisId="precip"
                orientation="right"
                tick={{ fill: 'rgba(56,189,248,0.4)', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip content={<HistoryTooltip />} cursor={false} />

              <Bar yAxisId="precip" dataKey="precipSum" fill="#38bdf8" opacity={0.35} radius={[3, 3, 0, 0]} />
              <Area yAxisId="temp" type="monotone" dataKey="tempMax" stroke="#fb923c" strokeWidth={1.5} fill="url(#hist-temp-gradient)" dot={false} />
              <Line yAxisId="temp" type="monotone" dataKey="tempMin" stroke="#38bdf8" strokeWidth={1.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>

          <div className="flex items-center gap-4 mt-3">
            <Legend color="#fb923c" label="High" />
            <Legend color="#38bdf8" label="Low" />
            <Legend color="#38bdf8" label="Precipitation" dim />
          </div>
        </GlassCard>
      )}
    </div>
  )
}

function Legend({ color, label, dim }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full" style={{ background: color, opacity: dim ? 0.35 : 1 }} />
      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
    </div>
  )
}

function HistoryTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload

  return (
    <div className="px-3 py-2 rounded-xl"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
      <p className="text-xs font-data mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-sm font-data"
          style={{ color: '#fb923c' }}>{Math.round(d.tempMax)}° / <span style={{ color: '#38bdf8' }}>{Math.round(d.tempMin)}°</span></p>
      {d.precipSum > 0 && (
        <p className="text-xs font-data mt-0.5"
        style={{ color: 'var(--text-muted)' }}>{d.precipSum.toFixed(1)} mm rain</p>
      )}
    </div>
  )
}

function dateRange(days) {
  const end = new Date()
  end.setDate(end.getDate() - 1)
  const start = new Date(end)
  start.setDate(start.getDate() - (days - 1))

  return { start: toDateString(start), end: toDateString(end) }
}

function toDateString(date) {
  return date.toISOString().slice(0, 10)
}

function chartData(history) {
  return history.map(d => ({ ...d, label: formatDayShort(d.time) }))
}