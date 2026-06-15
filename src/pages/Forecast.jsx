import { GlassCard } from '../components/ui/GlassCard'

export default function Forecast() {
  return (
    <div className="p-6">
      <h1
        className="text-2xl font-light mb-6"
        style={{ color: 'var(--text-primary)' }}
      >
        Forecast
      </h1>
      <GlassCard className="p-10 text-center">
        <p style={{ color: 'var(--text-muted)' }}>Coming soon</p>
      </GlassCard>
    </div>
  )
}
