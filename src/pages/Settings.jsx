import { useUiStore } from '../store/uiStore'
import { useLocationStore } from '../store/locationStore'
import { GlassCard } from '../components/ui/GlassCard'

export default function Settings() {
  const userName = useUiStore(s => s.userName)
  const resetOnboarding = useUiStore(s => s.resetOnboarding)
  const clearActive = useLocationStore(s => s.clearActive)

  function handleReplay() {
    clearActive()
    resetOnboarding()
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-light mb-6" style={{ color: 'var(--text-primary)' }}>
        Settings
      </h1>

      <div className="space-y-4 max-w-md">
        <GlassCard className="p-5">
          <p className="text-xs font-data mb-1.5" style={{ color: 'var(--text-ghost)', letterSpacing: '1.5px' }}>
            PROFILE
          </p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Signed in as {userName ?? 'Guest'}
          </p>
        </GlassCard>

        <GlassCard className="p-5">
          <p className="text-xs font-data mb-1.5" style={{ color: 'var(--text-ghost)', letterSpacing: '1.5px' }}>
            ONBOARDING
          </p>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            Replay the welcome flow to set a new name or pick a different location from scratch.
          </p>
          <button
            onClick={handleReplay}
            className="px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: 'var(--accent-primary)', color: '#000' }}>
            Replay onboarding
          </button>
        </GlassCard>
      </div>
    </div>
  )
}