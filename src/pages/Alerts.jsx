import { useMemo } from 'react'
import { ShieldCheck, AlertTriangle } from 'lucide-react'
import { useWeather } from '../hooks/useWeather'
import { deriveAlerts, SEVERITY_COLORS } from '../lib/alerts'
import { GlassCard } from '../components/ui/GlassCard'
import { SkeletonBlock } from '../components/ui/LoadingState'

export default function Alerts() {
  const weather = useWeather()

  const alerts = useMemo(() => deriveAlerts({
    current: weather.current,
    hourly: weather.hourly,
    daily: weather.daily,
    airQuality: weather.airQuality,
  }), [weather.current, weather.hourly, weather.daily, weather.airQuality])

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-light tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Alerts
        </h1>
        {weather.location && (
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {weather.location.name}
          </p>
        )}
      </div>

      {weather.isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-24" />
          ))}
        </div>
      )}

      {weather.isReady && alerts.length === 0 && (
        <GlassCard className="p-10 text-center max-w-md">
          <ShieldCheck size={22} className="mx-auto mb-3" style={{ color: '#4ade80' }} />
          <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
            Conditions are stable
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            No active alerts for this location right now.
          </p>
        </GlassCard>
      )}

      {weather.isReady && alerts.length > 0 && (
        <div className="space-y-3 max-w-2xl">
          {alerts.map(alert => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </div>
  )
}

function AlertCard({ alert }) {
  const color = SEVERITY_COLORS[alert.severity]

  return (
    <GlassCard className="p-5 flex items-start gap-4" style={{ borderColor: `${color}33` }}>
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}1f` }}>
        <AlertTriangle size={16} style={{ color }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {alert.title}
          </p>
          <span
            className="text-xs font-data px-1.5 py-0.5 rounded"
            style={{ color, background: `${color}1a`, letterSpacing: '0.5px' }}>
            {alert.severity.toUpperCase()}
          </span>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {alert.message}
        </p>
      </div>
    </GlassCard>
  )
}