import { GlassCard } from '../ui/GlassCard'
import { aqiCategory } from '../../lib/weather'

const POLLUTANTS = [
  { key: 'pm25', label: 'PM2.5', unit: 'μg/m³' },
  { key: 'pm10', label: 'PM10', unit: 'μg/m³' },
  { key: 'no2', label: 'NO₂', unit: 'μg/m³' },
  { key: 'o3', label: 'O₃', unit: 'μg/m³' },
]

export function AqiWidget({ airQuality }) {
  if (!airQuality) return null

  const category = aqiCategory(airQuality.aqi)

  return (
    <GlassCard className="p-5">
      <p className="text-xs font-data mb-4" style={{ color: 'var(--text-ghost)', letterSpacing: '1.5px' }}>
        AIR QUALITY
      </p>

      <div className="flex items-center gap-5">
        <ArcGauge aqi={airQuality.aqi} color={category.color} />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium mb-3" style={{ color: category.color }}>
            {category.label}
          </p>
          <div className="space-y-2">
            {POLLUTANTS.map(p => (
              <div key={p.key} className="flex items-center justify-between gap-2">
                <span className="text-xs font-data" style={{ color: 'var(--text-muted)' }}>
                  {p.label}
                </span>
                <span className="text-xs font-data" style={{ color: 'var(--text-secondary)' }}>
                  {airQuality[p.key] != null
                    ? `${Math.round(airQuality[p.key])} ${p.unit}`
                    : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  )
}

// Arc guage
function ArcGauge({ aqi, color }) {
  const R = 46
  const cx = 60
  const cy = 64
  const circ = 2 * Math.PI * R
  const arc = circ * (240 / 360)
  const gap = circ - arc

  const progress = Math.min((aqi ?? 0) / 100, 1)
  const filled = arc * progress

  return (
    <svg viewBox="0 0 120 118" width={120} height={118} className="flex-shrink-0">
      <defs>
        <filter id="aqi-tip-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* Track */}
      <circle
        cx={cx} cy={cy} r={R}
        fill="none"
        stroke="var(--border-default)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={`${arc} ${gap}`}
        transform={`rotate(150 ${cx} ${cy})`}
      />

      {/* Fill */}
      <circle
        cx={cx} cy={cy} r={R}
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${circ - filled}`}
        transform={`rotate(150 ${cx} ${cy})`}
        style={{ transition: 'stroke-dasharray 900ms var(--ease-smooth), stroke 400ms ease' }}
      />

      {/* Glowing tip at the end of the fill */}
      {filled > 4 && (
        <circle
          cx={cx} cy={cy} r={R}
          fill="none"
          stroke={color}
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={`2 ${circ - 2}`}
          strokeDashoffset={-(filled - 1)}
          transform={`rotate(150 ${cx} ${cy})`}
          opacity="0.45"
          filter="url(#aqi-tip-glow)"
        />
      )}

      {/* Index number */}
      <text x={cx} y={cy - 5}
        textAnchor="middle" dominantBaseline="middle"
        fill="var(--text-primary)"
        fontSize="26" fontWeight="300"
        fontFamily="'JetBrains Mono', monospace">
        {aqi ?? '—'}
      </text>

      {/* Label */}
      <text x={cx} y={cy + 16}
        textAnchor="middle"
        fill="var(--text-muted)"
        fontSize="8.5" letterSpacing="2"
        fontFamily="Inter, system-ui">
        INDEX
      </text>
    </svg>
  )
}