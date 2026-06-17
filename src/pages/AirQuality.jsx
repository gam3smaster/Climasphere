import {
AreaChart,
Area,
XAxis,
YAxis,
Tooltip,
ResponsiveContainer,
} from 'recharts'
import { useWeather } from '../hooks/useWeather'
import { aqiCategory } from '../lib/weather'
import { GlassCard } from '../components/ui/GlassCard'
import { SkeletonBlock } from '../components/ui/LoadingState'

const HEALTH_ADVICE = {
  Good: 'Air quality is ideal. No precautions needed for outdoor activity.',
  Fair: 'Air quality is acceptable. Sensitive groups may notice minor effects during prolonged exertion.',
  Moderate: 'Sensitive groups should consider reducing prolonged or intense outdoor exertion.',
  Poor: 'Reduce prolonged outdoor exertion. Sensitive groups should limit time outside.',
  'Very Poor': 'Avoid outdoor exertion. Consider keeping windows closed and using an air purifier indoors.',
  Hazardous: 'Stay indoors. Avoid all outdoor physical activity until conditions improve.',
}

const POLLUTANTS = [
  { key: 'pm25', label: 'PM2.5', unit: 'μg/m³', note: 'Fine particles, penetrate deep into lungs' },
  { key: 'pm10', label: 'PM10', unit: 'μg/m³', note: 'Coarse particles, dust, pollen, mold' },
  { key: 'no2', label: 'NO₂', unit: 'μg/m³', note: 'Mainly from vehicle exhaust and industry' },
  { key: 'o3', label: 'O₃', unit: 'μg/m³', note: 'Ground-level ozone, higher on hot days' },
  { key: 'co', label: 'CO', unit: 'μg/m³', note: 'Carbon monoxide from combustion' },
]

export default function AirQuality() {
  const { airQuality, location, isLoading, isReady } = useWeather()

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-light tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Air Quality
        </h1>
        {location && (
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {location.name}, {location.country}
          </p>
        )}
      </div>

      {isLoading && (
        <div className="space-y-4">
          <SkeletonBlock className="h-56" />
          <SkeletonBlock className="h-40" />
          <SkeletonBlock className="h-64" />
        </div>
      )}

      {isReady && airQuality && (
        <div className="space-y-5">
          <HeroGauge airQuality={airQuality} />
          <TrendChart hourly={airQuality.hourly} />
          <PollutantGrid airQuality={airQuality} />
        </div>
      )}
    </div>
  )
}

function HeroGauge({ airQuality }) {
  const category = aqiCategory(airQuality.aqi)
  const advice = HEALTH_ADVICE[category.label] ?? ''

  return (
    <GlassCard className="p-8 flex items-center gap-10 flex-wrap">
      <LargeArc aqi={airQuality.aqi} color={category.color} />

      <div className="flex-1 min-w-[220px]">
        <p className="text-xs font-data mb-2" style={{ color: 'var(--text-ghost)', letterSpacing: '1.5px' }}>
          CURRENT CONDITIONS
        </p>
        <h2 className="text-2xl font-light mb-3" style={{ color: category.color }}>
          {category.label}
        </h2>
        <p className="text-sm leading-relaxed max-w-md" style={{ color: 'var(--text-secondary)' }}>
          {advice}
        </p>
      </div>
    </GlassCard>
  )
}

// Larger version of the arc guage in the dashboard page
function LargeArc({ aqi, color }) {
  const R = 72
  const cx = 90
  const cy = 96
  const circ = 2 * Math.PI * R
  const arc = circ * (240 / 360)
  const gap = circ - arc

  const progress = Math.min((aqi ?? 0) / 100, 1)
  const filled = arc * progress

  return (
    <svg viewBox="0 0 180 176" width={180} height={176} className="flex-shrink-0">
      <defs>
        <filter id="aqi-large-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      <circle
        cx={cx} cy={cy} r={R}
        fill="none"
        stroke="var(--border-default)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${arc} ${gap}`}
        transform={`rotate(150 ${cx} ${cy})`}
      />

      <circle
        cx={cx} cy={cy} r={R}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${circ - filled}`}
        transform={`rotate(150 ${cx} ${cy})`}
        style={{ transition: 'stroke-dasharray 900ms var(--ease-smooth), stroke 400ms ease' }}
      />

      {filled > 4 && (
        <circle
          cx={cx} cy={cy} r={R}
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={`2 ${circ - 2}`}
          strokeDashoffset={-(filled - 1)}
          transform={`rotate(150 ${cx} ${cy})`}
          opacity="0.4"
          filter="url(#aqi-large-glow)"
        />
      )}

      <text x={cx} y={cy - 8}
        textAnchor="middle" dominantBaseline="middle"
        fill="var(--text-primary)"
        fontSize="40" fontWeight="200"
        fontFamily="'JetBrains Mono', monospace">
        {aqi ?? '—'}
      </text>

      <text x={cx} y={cy + 22}
        textAnchor="middle"
        fill="var(--text-muted)"
        fontSize="10" letterSpacing="2.5"
        fontFamily="Inter, system-ui">
        EUROPEAN AQI
      </text>
    </svg>
  )
}

function TrendChart({ hourly }) {
  if (!hourly?.length) return null

  const data = hourly.slice(0, 24).map(h => ({
    time: h.time.slice(11, 16),
    aqi:  h.aqi ?? 0,
  }))

  const tickTimes = data.filter((_, i) => i % 4 === 0).map(d => d.time)

  return (
    <GlassCard className="p-5">
      <p className="text-xs font-data mb-4" style={{ color: 'var(--text-ghost)', letterSpacing: '1.5px' }}>
        24-HOUR TREND
      </p>

      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={data} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="aqi-trend-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#a3e635" stopOpacity={0.32} />
              <stop offset="95%" stopColor="#a3e635" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="time"
            ticks={tickTimes}
            tick={{ fill: 'rgba(238,242,255,0.28)', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'rgba(238,242,255,0.28)', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip content={<TrendTooltip />} cursor={false} />

          <Area
            type="monotone"
            dataKey="aqi"
            stroke="#a3e635"
            strokeWidth={1.5}
            fill="url(#aqi-trend-gradient)"
            dot={false}
            activeDot={{ r: 3, fill: '#a3e635', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </GlassCard>
  )
}

function TrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const { aqi } = payload[0].payload
  const category = aqiCategory(aqi)

  return (
    <div className="px-3 py-2 rounded-xl"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
      <p className="text-xs font-data mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-sm font-data" style={{ color: category.color }}>
        AQI {aqi} · {category.label}
      </p>
    </div>
  )
}

function PollutantGrid({ airQuality }) {
  return (
    <GlassCard className="p-5">
      <p className="text-xs font-data mb-4" style={{ color: 'var(--text-ghost)', letterSpacing: '1.5px' }}>
        POLLUTANT BREAKDOWN
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {POLLUTANTS.map(p => (
          <div key={p.key} className="p-4 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
            <p className="text-xs font-data mb-1.5" style={{ color: 'var(--text-muted)' }}>
              {p.label}
            </p>
            <p className="text-lg font-data mb-1.5" style={{ color: 'var(--text-primary)' }}>
              {airQuality[p.key] != null ? `${Math.round(airQuality[p.key])}` : '—'}
              <span className="text-xs ml-1" style={{ color: 'var(--text-ghost)' }}>{p.unit}</span>
            </p>
            <p className="text-xs leading-snug" style={{ color: 'var(--text-ghost)' }}>
              {p.note}
            </p>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}