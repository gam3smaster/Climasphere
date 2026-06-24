import { useMemo } from 'react'
import { getTempPalette, getWeatherMeta, windDirLabel } from '../../lib/weather'
import { mapRange } from '../../lib/utils'

// Condition-reactive color palettes for the sphere (Claude saved me)
function getConditionPalette(category, isDay) {
  const palettes = {
    clear:   isDay
      ? { core: '#FF8C00', mid: '#C85A00', edge: '#6B2800', glow: 'rgba(255,140,0,0.55)', shimmer: 'rgba(255,200,80,0.18)' }
      : { core: '#1A2B5E', mid: '#0D1933', edge: '#050D1A', glow: 'rgba(80,120,255,0.35)', shimmer: 'rgba(120,160,255,0.10)' },
    cloudy: { core: '#4A5568', mid: '#2D3748', edge: '#1A202C', glow: 'rgba(120,140,170,0.35)', shimmer: 'rgba(180,200,220,0.10)' },
    drizzle: { core: '#2B6CB0', mid: '#1A4A7A', edge: '#0D2440', glow: 'rgba(66,153,225,0.45)', shimmer: 'rgba(100,180,255,0.12)' },
    rain: { core: '#1E4E8C', mid: '#0F3060', edge: '#070F1E', glow: 'rgba(50,130,220,0.50)', shimmer: 'rgba(80,160,255,0.14)' },
    snow: { core: '#B8D4F0', mid: '#7BA8D4', edge: '#3D6899', glow: 'rgba(180,210,255,0.40)', shimmer: 'rgba(220,235,255,0.20)' },
    thunder: { core: '#44337A', mid: '#2D2060', edge: '#160D33', glow: 'rgba(128,90,213,0.55)', shimmer: 'rgba(180,130,255,0.15)' },
    fog: { core: '#4A5568', mid: '#2D3748', edge: '#1A202C', glow: 'rgba(160,175,190,0.30)', shimmer: 'rgba(200,210,220,0.10)' },
  }
  return palettes[category] ?? palettes.cloudy
}

export function ClimateSphere({ current, size = 360 }) {
  if (!current) return <SphereSkeleton size={size} />

  const { temp, feelsLike, clouds, windSpeed, windDir, isDay, code } = current

  const palette = getTempPalette(temp)
  const meta = getWeatherMeta(code)
  const cPalette = getConditionPalette(meta.category, isDay)

  const visual = useMemo(() => ({
    cloudOpacity: mapRange(clouds, 0, 100, 0, 0.62),
    hasPrecip: ['rain', 'drizzle', 'snow'].includes(meta.category),
    precipType: meta.category === 'snow' ? 'snow' : 'rain',
    precipCount: Math.round(meta.intensity * 24) + 4,
    hasFog: meta.category === 'fog',
    hasLightning: meta.category === 'thunder',
    atmosphereOpacity: mapRange(windSpeed, 0, 60, 0.18, 0.40),
    coreOpacity: isDay ? 0.62 : 0.35,
  }), [clouds, meta, isDay, windSpeed])

  const cx = size / 2
  const cy = size / 2
  const r = size * 0.375

  return (
    <div
      className="relative flex items-center justify-center select-none w-full mx-auto"
      style={{ maxWidth: size, aspectRatio: '1 / 1' }}
    >
      {/* Outer glow halo */}
      <div
        style={{
          position: 'absolute',
          width: '82%',
          height: '82%',
          borderRadius: '50%',
          background: 'transparent',
          boxShadow: `0 0 32px 10px ${cPalette.glow}`,
          animation: 'sphere-pulse 4s ease-in-out infinite',
          pointerEvents: 'none',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      <svg
        viewBox={`0 0 ${size} ${size}`}
        width="100%"
        height="100%"
        style={{ overflow: 'visible' }}
        role="img"
        aria-label={`${Math.round(temp)}°C, ${meta.label}`}
      >
        <SvgDefs
          cx={cx} cy={cy} r={r}
          palette={palette}
          cPalette={cPalette}
          isDay={isDay}
          coreOpacity={visual.coreOpacity}
        />

        {/* Outer bloom ring */}
        <circle
          cx={cx} cy={cy} r={r + size * 0.115}
          fill="none"
          stroke={cPalette.core}
          strokeWidth="1"
          opacity={visual.atmosphereOpacity * 0.55}
          filter="url(#cs-bloom)"
          style={{ animation: 'atmosphere-breathe 7s ease-in-out infinite' }}
        />

        {/* Inner atmosphere ring */}
        <circle
          cx={cx} cy={cy} r={r + size * 0.055}
          fill="none"
          stroke={cPalette.core}
          strokeWidth="1"
          opacity={visual.atmosphereOpacity}
        />

        {/* Sphere base */}
        <circle cx={cx} cy={cy} r={r} fill="url(#cs-base)" />

        {/* Rotating shimmer layer */}
        <g clipPath="url(#cs-clip)">
          <ellipse
            cx={cx - r * 0.1}
            cy={cy - r * 0.1}
            rx={r * 0.85}
            ry={r * 0.5}
            fill="url(#cs-shimmer)"
            style={{
              transformOrigin: `${cx}px ${cy}px`,
              animation: 'shimmer-rotate 18s linear infinite',
            }}
          />
        </g>

        {/* Day/night sheen */}
        <circle
          cx={cx} cy={cy} r={r}
          fill={isDay ? 'url(#cs-daysheen)' : 'url(#cs-nightsheen)'}
          opacity="0.45"
        />

        {/* Cloud rings */}
        <g clipPath="url(#cs-clip)">
          <g style={{
            transformOrigin: `${cx}px ${cy}px`,
            animation: `cloud-drift ${visual.cloudOpacity < 0.2 ? '90s' : '55s'} linear infinite`,
          }}>
            <CloudWisps cx={cx} cy={cy} r={r} opacity={visual.cloudOpacity} seed={1} />
          </g>
          <g style={{
            transformOrigin: `${cx}px ${cy}px`,
            animation: `cloud-drift-reverse ${visual.cloudOpacity < 0.2 ? '120s' : '75s'} linear infinite`,
          }}>
            <CloudWisps cx={cx} cy={cy} r={r} opacity={visual.cloudOpacity * 0.5} seed={3} />
          </g>
        </g>

        {/* Fog haze */}
        {visual.hasFog && (
          <g clipPath="url(#cs-clip)">
            <FogLayer cx={cx} cy={cy} r={r} />
          </g>
        )}

        {/* Precipitation */}
        {visual.hasPrecip && (
          <g clipPath="url(#cs-clip)">
            <PrecipLayer cx={cx} cy={cy} r={r} type={visual.precipType} count={visual.precipCount} />
          </g>
        )}

        {/* Lightning */}
        {visual.hasLightning && (
          <g clipPath="url(#cs-clip)">
            <LightningBolt cx={cx} cy={cy} r={r} />
          </g>
        )}

        {/* Edge highlight */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1.5"
        />

        {/* Top-left reflection */}
        <ellipse
          cx={cx - r * 0.28}
          cy={cy - r * 0.32}
          rx={r * 0.22}
          ry={r * 0.12}
          fill="rgba(255,255,255,0.09)"
          transform={`rotate(-25, ${cx}, ${cy})`}
        />

        {/* Temperature */}
        <text
          x={cx} y={cy - 4}
          textAnchor="middle" dominantBaseline="middle"
          fill="rgba(255,255,255,0.92)"
          fontSize={size * 0.175}
          fontWeight="200"
          fontFamily="'Space Grotesk', Inter, system-ui, sans-serif"
          letterSpacing="-2"
        >
          {Math.round(temp)}°
        </text>

        {/* Feels like */}
        <text
          x={cx} y={cy + size * 0.09}
          textAnchor="middle"
          fill="rgba(255,255,255,0.38)"
          fontSize={size * 0.038}
          fontFamily="'JetBrains Mono', monospace"
          letterSpacing="1"
        >
          FEELS {Math.round(feelsLike)}°
        </text>

        {/* Condition label */}
        <text
          x={cx} y={cy + size * 0.155}
          textAnchor="middle"
          fill="rgba(255,255,255,0.28)"
          fontSize={size * 0.032}
          fontFamily="'Space Grotesk', Inter, system-ui, sans-serif"
          letterSpacing="3"
        >
          {meta.label.toUpperCase()}
        </text>

        {/* Wind arc */}
        {windSpeed >= 8 && (
          <WindArc cx={cx} cy={cy} r={r} dir={windDir} speed={windSpeed} cPalette={cPalette} size={size} />
        )}
      </svg>
    </div>
  )
}

function SvgDefs({ cx, cy, r, cPalette, isDay, coreOpacity }) {
  const lightX = isDay ? cx - r * 0.28 : cx + r * 0.2
  const lightY = isDay ? cy - r * 0.32 : cy + r * 0.05

  return (
    <defs>
      <clipPath id="cs-clip">
        <circle cx={cx} cy={cy} r={r - 0.5} />
      </clipPath>

      {/* Condition-reactive sphere base */}
      <radialGradient id="cs-base" gradientUnits="userSpaceOnUse" cx={lightX} cy={lightY} r={r * 1.5}>
        <stop offset="0%" stopColor={cPalette.core} stopOpacity={coreOpacity * 1.1} />
        <stop offset="40%" stopColor={cPalette.mid} stopOpacity={coreOpacity * 0.75} />
        <stop offset="100%" stopColor={cPalette.edge} stopOpacity="0.92" />
      </radialGradient>

      {/* Rotating shimmer */}
      <radialGradient id="cs-shimmer" gradientUnits="userSpaceOnUse" cx={cx} cy={cy - r * 0.3} r={r * 0.9}>
        <stop offset="0%" stopColor={cPalette.shimmer} />
        <stop offset="100%" stopColor="transparent" />
      </radialGradient>

      {/* Daytime sheen */}
      <radialGradient id="cs-daysheen" gradientUnits="userSpaceOnUse" cx={cx - r * 0.3} cy={cy - r * 0.4} r={r * 1.1}>
        <stop offset="0%" stopColor="rgba(255,248,220,0.22)" />
        <stop offset="100%" stopColor="transparent" />
      </radialGradient>

      {/* Night sheen */}
      <radialGradient id="cs-nightsheen" gradientUnits="userSpaceOnUse" cx={cx + r * 0.35} cy={cy + r * 0.4} r={r * 1.2}>
        <stop offset="0%" stopColor="rgba(10,20,60,0.55)" />
        <stop offset="100%" stopColor="transparent" />
      </radialGradient>

      <filter id="cs-cloud" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="5" />
      </filter>

      <filter id="cs-bloom" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="14" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <filter id="cs-fog" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="8" />
        <feDisplacementMap in="SourceGraphic" scale="10" />
        <feGaussianBlur stdDeviation="5" />
      </filter>
    </defs>
  )
}

function CloudWisps({ cx, cy, r, opacity, seed }) {
  const wisps = useMemo(() => {
    if (opacity < 0.02) return []
    const count = Math.ceil(opacity * 9) + 2
    return Array.from({ length: count }, (_, i) => {
      const angle = ((i * 137.508 + seed * 55) % 360) * (Math.PI / 180)
      const dist  = r * (0.35 + ((i * seed * 7 + 11) % 8) / 20)
      return {
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist * 0.55,
        rx: r * (0.12 + ((i * seed * 3 + 5) % 5) / 25),
        ry: r * (0.045 + ((i + seed) % 4) / 60),
        rotation: (i * seed * 19 + seed * 31) % 360,
      }
    })
  }, [cx, cy, r, opacity, seed])

  return (
    <g opacity={opacity}>
      {wisps.map((w, i) => (
        <ellipse
          key={i}
          cx={w.x} cy={w.y}
          rx={w.rx} ry={w.ry}
          transform={`rotate(${w.rotation}, ${w.x}, ${w.y})`}
          fill="rgba(255,255,255,0.88)"
          filter="url(#cs-cloud)"
        />
      ))}
    </g>
  )
}

function PrecipLayer({ cx, cy, r, type, count }) {
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: (cx - r * 0.78) + ((i * 137.5) % (r * 1.56)),
      delay: (i * 0.13) % 2.4,
      duration: type === 'rain' ? 1.1 + (i % 5) * 0.22 : 2.2 + (i % 4) * 0.4,
    })),
  [cx, cy, r, type, count])

  if (type === 'rain') {
    return (
      <g>
        {particles.map(p => (
          <line
            key={p.id}
            x1={p.x} y1={cy - r * 0.82}
            x2={p.x - 2} y2={cy - r * 0.68}
            stroke="rgba(148,210,255,0.52)"
            strokeWidth="1.5"
            strokeLinecap="round"
            style={{
              animation: `rain-fall ${p.duration}s linear infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </g>
    )
  }

  return (
    <g>
      {particles.map(p => (
        <circle
          key={p.id}
          cx={p.x} cy={cy - r * 0.78}
          r="1.8"
          fill="rgba(220,238,255,0.72)"
          style={{
            animation: `snow-drift ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </g>
  )
}

function FogLayer({ cx, cy, r }) {
  return (
    <>
      {[0, 0.35, 0.7].map((offset, i) => (
        <ellipse
          key={i}
          cx={cx}
          cy={cy + r * (offset * 0.5 - 0.2)}
          rx={r * 0.88}
          ry={r * 0.19}
          fill="rgba(195,210,225,0.88)"
          filter="url(#cs-fog)"
          style={{
            animation:      `fog-shift ${4.5 + i * 1.8}s ease-in-out infinite`,
            animationDelay: `${i * 0.9}s`,
          }}
        />
      ))}
    </>
  )
}

function LightningBolt({ cx, cy, r }) {
  const path = [
    `M ${cx - 10} ${cy - r * 0.28}`,
    `L ${cx + 6}  ${cy + r * 0.02}`,
    `L ${cx - 4}  ${cy + r * 0.06}`,
    `L ${cx + 12} ${cy + r * 0.36}`,
  ].join(' ')

  return (
    <path
      d={path}
      stroke="rgba(250,244,120,0.95)"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ animation: 'lightning-flash 5s ease-in-out infinite' }}
    />
  )
}

function WindArc({ cx, cy, r, dir, speed, cPalette, size }) {
  const arcR = r + size * 0.075
  const arcSpanDeg = Math.min((speed / 80) * 110, 110)

  const toRad = deg => (deg * Math.PI) / 180
  const start = toRad(90 + dir - arcSpanDeg / 2)
  const end = toRad(90 + dir + arcSpanDeg / 2)

  const x1 = cx + arcR * Math.cos(start)
  const y1 = cy + arcR * Math.sin(start)
  const x2 = cx + arcR * Math.cos(end)
  const y2 = cy + arcR * Math.sin(end)

  const midAngle = (start + end) / 2
  const labelX = cx + (arcR + 14) * Math.cos(midAngle)
  const labelY = cy + (arcR + 14) * Math.sin(midAngle)

  return (
    <g opacity="0.50">
      <path
        d={`M ${x1} ${y1} A ${arcR} ${arcR} 0 0 1 ${x2} ${y2}`}
        fill="none"
        stroke={cPalette.core}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <text
        x={labelX} y={labelY + 4}
        textAnchor="middle"
        fill={cPalette.core}
        fontSize="9"
        fontFamily="'JetBrains Mono', monospace"
        letterSpacing="0.5"
      >
        {windDirLabel(dir)} {Math.round(speed)}
      </text>
    </g>
  )
}

function SphereSkeleton({ size }) {
  return (
    <div
      className="rounded-full animate-pulse w-full mx-auto"
      style={{
        maxWidth: size * 0.75,
        aspectRatio: '1 / 1',
        background: 'var(--bg-elevated)',
      }}
    />
  )
}