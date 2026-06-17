import { GlassCard } from '../ui/GlassCard'
import { formatTime } from '../../lib/time'

export function SunMoonCard({ sunCalc, isDay }) {
  if (!sunCalc) return null

  return (
    <GlassCard className="p-5">
      <p className="text-xs font-data mb-3" style={{ color: 'var(--text-ghost)', letterSpacing: '1.5px' }}>
        SUN & MOON
      </p>

      <SunArc
        progress={sunCalc.sunProgress}
        isDay={isDay}
        sunrise={sunCalc.sunrise}
        sunset={sunCalc.sunset}
      />

      <div className="my-4" style={{ height: 1, background: 'var(--border-subtle)' }} />

      {/* Moon */}
      <div className="flex items-center gap-3">
        <MoonDisc
          fraction={sunCalc.moon.fraction}
          phase={sunCalc.moon.phase}
          size={30}
        />
        <div>
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
            {sunCalc.moon.phaseName}
          </p>
          <p className="text-xs font-data mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {Math.round(sunCalc.moon.fraction * 100)}% illuminated
          </p>
        </div>
        {!sunCalc.moon.aboveHorizon && (
          <span className="ml-auto text-xs" style={{ color: 'var(--text-ghost)' }}>
            below horizon
          </span>
        )}
      </div>
    </GlassCard>
  )
}

// The arc showing the path from sunrise to sunset
function SunArc({ progress, isDay, sunrise, sunset }) {
  const cx = 130
  const cy = 100
  const r  = 82

  // Map progress
  const angle = Math.PI * (1 - progress)
  const sunX = cx + r * Math.cos(angle)
  const sunY = cy - r * Math.sin(angle)

  const arcPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`

  return (
    <svg viewBox="0 0 260 114" width="100%" style={{ height: 114 }}>
      <defs>
        <filter id="sun-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Dashed arc track */}
      <path d={arcPath}
        fill="none"
        stroke="var(--border-default)"
        strokeWidth="1.5"
        strokeDasharray="3 6"
      />

      {/* Horizon line */}
      <line x1={14} y1={cy} x2={246} y2={cy}
        stroke="var(--border-subtle)"
        strokeWidth="1"
      />

      {/* Sun glow */}
      {isDay ? (
        <>
          <circle cx={sunX} cy={sunY} r={15}
            fill="rgba(251,191,36,0.15)"
            filter="url(#sun-glow)"
          />
          <circle cx={sunX} cy={sunY} r={5}
            fill="#fbbf24"
          />
        </>
      ) : (
        // During nighttime
        <circle cx={sunX} cy={sunY} r={4}
          fill="rgba(148,163,184,0.3)"
        />
      )}

      {/* Sunrise label */}
      <text x={cx - r} y={cy + 16}
        textAnchor="middle"
        fill="var(--text-ghost)"
        fontSize="10"
        fontFamily="'JetBrains Mono', monospace">
        {formatTime(sunrise.toISOString())}
      </text>

      {/* Sunset label */}
      <text x={cx + r} y={cy + 16}
        textAnchor="middle"
        fill="var(--text-ghost)"
        fontSize="10"
        fontFamily="'JetBrains Mono', monospace">
        {formatTime(sunset.toISOString())}
      </text>
    </svg>
  )
}

// SVG moon phase disc
function MoonDisc({ fraction, phase, size = 30 }) {
  const r = (size - 2) / 2
  const cx = size / 2
  const cy = size / 2

  const isWaxing = phase <= 0.5
  const isGibbous = fraction > 0.5

  const innerRx = r * Math.abs(1 - 2 * fraction)

  const litSide  = isWaxing ? 'right' : 'left'
  const darkSide = isWaxing ? 'left'  : 'right'

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
      <defs>
        <clipPath id="moon-lit-clip">
          {litSide === 'right'
            ? <rect x={cx} y={0} width={cx + r} height={size} />
            : <rect x={0} y={0} width={cx} height={size} />
          }
        </clipPath>
        <clipPath id="moon-dark-clip">
          {darkSide === 'left'
            ? <rect x={0} y={0} width={cx} height={size} />
            : <rect x={cx} y={0} width={cx + r} height={size} />
          }
        </clipPath>
      </defs>

      {/* Base */}
      <circle cx={cx} cy={cy} r={r} fill="rgba(12,18,35,0.95)" />

      <circle cx={cx} cy={cy} r={r}
        fill="rgba(255,248,200,0.82)"
        clipPath="url(#moon-lit-clip)"
      />

      {!isGibbous
        // Moon crescent
        ? <ellipse cx={cx} cy={cy} rx={innerRx} ry={r}
            fill="rgba(12,18,35,0.95)"
            clipPath="url(#moon-lit-clip)"
          />
        : <ellipse cx={cx} cy={cy} rx={innerRx} ry={r}
            fill="rgba(255,248,200,0.82)"
            clipPath="url(#moon-dark-clip)"
          />
      }

      {/* The rim */}
      <circle cx={cx} cy={cy} r={r}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="0.5"
      />
    </svg>
  )
}