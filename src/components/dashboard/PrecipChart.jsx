import {
AreaChart,
Area,
XAxis,
YAxis,
Tooltip,
ResponsiveContainer,
} from 'recharts'
import { GlassCard } from '../ui/GlassCard'

export function PrecipChart({ hourly }) {
  const data = hourly.slice(0, 24).map(h => ({
    time: h.time.slice(11, 16),
    prob: h.precipProb ?? 0,
    mm: h.precip ?? 0,
  }))

  // Label only every 4 hours
  const tickTimes = data.filter((_, i) => i % 4 === 0).map(d => d.time)

  const maxProb = Math.max(...data.map(d => d.prob), 10)

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-data" style={{ color: 'var(--text-ghost)', letterSpacing: '1.5px' }}>
          PRECIPITATION · NEXT 24H
        </p>
        <p className="text-xs font-data" style={{ color: 'var(--text-muted)' }}>
          % chance
        </p>
      </div>

      <ResponsiveContainer width="100%" height={96}>
        <AreaChart data={data} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="precip-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.02} />
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
            domain={[0, 100]}
            ticks={[0, 50, 100]}
            tick={{ fill: 'rgba(238,242,255,0.28)', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip content={<PrecipTooltip />} cursor={false} />

          <Area
            type="monotone"
            dataKey="prob"
            stroke="#38bdf8"
            strokeWidth={1.5}
            fill="url(#precip-gradient)"
            dot={false}
            activeDot={{ r: 3, fill: '#38bdf8', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </GlassCard>
  )
}

function PrecipTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  const { prob, mm } = payload[0].payload

  return (
    <div className="px-3 py-2 rounded-xl"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-default)',
      }}>
      <p className="text-xs font-data mb-1" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
      <p className="text-sm font-data" style={{ color: '#38bdf8' }}>
        {prob}% chance
      </p>
      {mm > 0 && (
        <p className="text-xs font-data mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {mm.toFixed(1)} mm
        </p>
      )}
    </div>
  )
}