import { useMemo } from 'react'
import { getTempPalette } from '../../lib/weather'
import { formatTime, dayProgress, dateToDayProgress, isToday } from '../../lib/time'

// Hour Labels
const HOUR_MARKS = [
  { h: 0, label: '12 AM' },
  { h: 6, label: '6 AM' },
  { h: 12, label: '12 PM' },
  { h: 18, label: '6 PM' },
  { h: 24, label: '12 AM' },
]

export function WeatherTimeline({ hourly, sunCalc }) {
  const nowPct = dayProgress() * 100
  const todayHrs  = useMemo(() => getTodayHours(hourly), [hourly])
  const events = useMemo(() => buildEvents(todayHrs, sunCalc), [todayHrs, sunCalc])
  const tempCurve = useMemo(() => buildTempCurve(todayHrs), [todayHrs])

  if (!todayHrs.length) return null

  return (
    <div className="select-none">

      {/* Hour markers */}
      <div className="relative flex justify-between mb-3 px-0.5">
        {HOUR_MARKS.map(({ h, label }) => (
          <span
            key={h}
            className="text-xs font-data"
            style={{ color: 'var(--text-ghost)', letterSpacing: '0.5px' }}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Temperature curve and event labels for tracking */}
      <div className="relative mb-2" style={{ height: 48 }}>
        <TempCurve points={tempCurve} />
        <div
          className="absolute w-full"
          style={{ top: 28, height: 1, background: 'var(--border-default)' }}
        />
        {events.map(ev => (
          <EventNode key={ev.type} event={ev} />
        ))}

        <NowCursor pct={nowPct} />
      </div>

      <div className="relative" style={{ height: 44 }}>
        {events.map(ev => (
          <EventLabel key={ev.type} event={ev} />
        ))}
      </div>
    </div>
  )
}

// Other components

function NowCursor({ pct }) {
  return (
    <div
      className="absolute"
      style={{ left: `${pct}%`, top: 20, transform: 'translateX(-50%)' }}
    >
      {/* Pulse ring */}
      <div
        className="absolute rounded-full"
        style={{
          width: 16, height: 16,
          top: -4, left: -4,
          background: 'var(--accent-primary)',
          opacity: 0.2,
          animation: 'cursor-pulse 2.4s ease-in-out infinite',
        }}
      />
      <div
        className="relative w-2 h-2 rounded-full z-10"
        style={{
          background: 'var(--accent-primary)',
          boxShadow: '0 0 8px var(--accent-primary)',
        }}
      />
      <span
        className="absolute font-data whitespace-nowrap"
        style={{
          fontSize: 9,
          top: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'var(--accent-primary)',
          letterSpacing: '1px',
        }}
      >
        NOW
      </span>
    </div>
  )
}

function EventNode({ event }) {
  const pct = dateToDayProgress(event.time) * 100
  return (
    <div
      className="absolute"
      style={{ left: `${pct}%`, top: 24, transform: 'translateX(-50%)' }}
    >
      <div
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: EVENT_COLORS[event.type] ?? 'var(--text-muted)' }}
      />
    </div>
  )
}

function EventLabel({ event }) {
  const pct = dateToDayProgress(event.time) * 100
  const isPast = event.time < new Date()
  const color = EVENT_COLORS[event.type] ?? 'var(--text-muted)'

  return (
    <div
      className="absolute flex flex-col items-center gap-0.5"
      style={{
        left: `${pct}%`,
        top: 0,
        transform: 'translateX(-50%)',
        opacity: isPast ? 0.38 : 1,
        animation: 'event-rise 0.4s ease-out both',
      }}
    >
      <span className="text-xs font-medium whitespace-nowrap" style={{ color }}>
        {event.label}
      </span>
      <span
        className="text-xs font-data whitespace-nowrap"
        style={{ color: 'var(--text-muted)', fontSize: 10 }}
      >
        {formatTime(event.time.toISOString())}
      </span>
    </div>
  )
}

// SVG temperature curve behind the track
function TempCurve({ points }) {
  if (points.length < 2) return null

  const W = 1000
  const H = 28
  const pad = 4

  const svgPts = points.map((p, i) => {
    const x = (i / (points.length - 1)) * W
    const y = pad + (1 - p.norm) * (H - pad * 2)
    return `${x},${y}`
  }).join(' ')

  return (
    <svg
      className="absolute inset-0 w-full"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ height: H, top: 0 }}
    >
      <defs>
        <linearGradient id="tl-temp-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          {points.map((p, i) => (
            <stop
              key={i}
              offset={`${(i / (points.length - 1)) * 100}%`}
              stopColor={p.color}
              stopOpacity="0.4"
            />
          ))}
        </linearGradient>
      </defs>
      <polyline
        points={svgPts}
        fill="none"
        stroke="url(#tl-temp-grad)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Data helpers

function getTodayHours(hourly) {
  return hourly.filter(h => isToday(h.time))
}

function buildEvents(todayHrs, sunCalc) {
  const events = []

  if (sunCalc?.sunrise) {
    events.push({ type: 'sunrise', time: sunCalc.sunrise, label: 'Sunrise' })
  }
  if (sunCalc?.sunset) {
    events.push({ type: 'sunset', time: sunCalc.sunset, label: 'Sunset' })
  }

  // First hour when rain probability crosses 40%
  const rainHour = todayHrs.find(h => (h.precipProb ?? 0) >= 40)
  if (rainHour) {
    events.push({
      type: 'rain',
      time: new Date(rainHour.time),
      label: `Rain ${rainHour.precipProb}%`,
    })
  }

  // The hour with the highest temperature
  const peakHour = todayHrs.reduce(
    (best, h) => (h.temp > (best?.temp ?? -Infinity) ? h : best),
    null
  )
  if (peakHour) {
    events.push({
      type: 'temp-peak',
      time: new Date(peakHour.time),
      label: `Peak ${Math.round(peakHour.temp)}°`,
    })
  }

  return events.sort((a, b) => a.time - b.time)
}

function buildTempCurve(todayHrs) {
  if (!todayHrs.length) return []

  const temps = todayHrs.map(h => h.temp)
  const minT = Math.min(...temps)
  const maxT = Math.max(...temps)
  const rangeT = maxT - minT || 1

  return todayHrs.map(h => ({
    norm: (h.temp - minT) / rangeT,
    color: getTempPalette(h.temp).accent,
  }))
}

const EVENT_COLORS = {
  sunrise: '#fbbf24',
  sunset: '#f97316',
  rain: '#38bdf8',
  'temp-peak': '#f87171',
}
