import { useState, useEffect, useMemo } from 'react'
import { ChevronRight, Navigation, Search, MapPin } from 'lucide-react'
import { useUiStore } from '../../store/uiStore'
import { useLocationStore } from '../../store/locationStore'
import { useGeolocation } from '../../hooks/useGeolocation'
import { searchLocations, reverseGeocode } from '../../services/geocoding'
import { debounce } from '../../lib/utils'

// Symbols for user avatar
const AVATARS = ['◎', '◈', '◍']

export function OnboardingModal() {
  const { onboarding, setUserProfile, completeOnboarding } = useUiStore()
  const { setActive } = useLocationStore()

  const [name,   setName]   = useState('')
  const [avatar, setAvatar] = useState(0)

  if (onboarding.complete) return null

  function handleNameContinue() {
    if (!name.trim()) return
    setUserProfile(name.trim(), AVATARS[avatar])
  }

  async function handleLocationChosen(location) {
    setActive(location)
    completeOnboarding()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'var(--bg-overlay)', backdropFilter: 'blur(16px)' }}>
      <div className="w-full max-w-md rounded-3xl p-8"
        style={{
          background: 'var(--bg-base)',
          border: '1px solid var(--border-default)',
        }}>
        {onboarding.step === 'name' ? (
          <NameStep
            name={name}
            avatar={avatar}
            onNameChange={setName}
            onAvatarChange={setAvatar}
            onContinue={handleNameContinue}
          />
        ) : (
          <LocationStep onLocationChosen={handleLocationChosen} />
        )}
      </div>
    </div>
  )
}

// Name
function NameStep({ name, avatar, onNameChange, onAvatarChange, onContinue }) {
  return (
    <div>
      <div className="mb-8">
        <img src="/climasphere-logo.png"
          alt="ClimaSphere"
          className="w-16 h-16 object-contain mb-4"
          style={{ background: '#000', borderRadius: 12 }}
        />
        <h1 className="text-2xl font-light mb-2" style={{ color: 'var(--text-primary)' }}>
          What should we call you?
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          The AI briefings feel more natural when they're addressed to you.
        </p>
      </div>

      {/* Avatar selector */}
      <div className="flex gap-3 mb-6">
        {AVATARS.map((symbol, i) => (
          <button className="w-12 h-12 rounded-2xl text-xl transition-all"
            key={i}
            onClick={() => onAvatarChange(i)}
            style={{
                background: avatar === i ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                border: `1px solid ${avatar === i ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                color: avatar === i ? 'var(--accent-primary)' : 'var(--text-muted)',
              }}>
            {symbol}
          </button>
        ))}
      </div>

      {/* Name input */}
      <input className="w-full px-4 py-3 rounded-xl text-sm outline-none mb-4"
        type="text"
        value={name}
        onChange={e => onNameChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onContinue()}
        placeholder="Your name"
        autoFocus
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          color: 'var(--text-primary)',
          caretColor: 'var(--accent-primary)',
        }}
      />

      <button
        onClick={onContinue}
        disabled={!name.trim()}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all"
        style={{
          background: name.trim() ? 'var(--accent-primary)' : 'var(--bg-elevated)',
          color: name.trim() ? '#000' : 'var(--text-muted)',
          cursor: name.trim() ? 'pointer' : 'not-allowed',
        }}>
        Continue
        <ChevronRight size={15} />
      </button>
    </div>
  )
}

// Location

function LocationStep({ onLocationChosen }) {
  const geo = useGeolocation()
  const [query,      setQuery]      = useState('')
  const [results,    setResults]    = useState([])
  const [isSearching, setSearching] = useState(false)

  // Waits 350ms after the user stops typing
  const doSearch = useMemo(() => debounce(async (q) => {
    if (!q.trim()) { setResults([]); return }
    setSearching(true)
    try {
      setResults(await searchLocations(q))
    } catch {
      setResults([])
    } finally {
      setSearching(false)
    }
  }, 350), [])

  // After geolocation succeeds
  useEffect(() => {
    if (geo.status !== 'granted' || !geo.coords) return
    reverseGeocode(geo.coords.lat, geo.coords.lon)
      .then(onLocationChosen)
      .catch(err => console.error('[ClimaSphere] Reverse geocode failed:', err))
  }, [geo.status, geo.coords?.lat, geo.coords?.lon])

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-data mb-2"
          style={{ color: 'var(--text-ghost)', letterSpacing: '2.5px' }}>
          STEP 2 OF 2
        </p>
        <h1 className="text-2xl font-light mb-2" style={{ color: 'var(--text-primary)' }}>
          Where are you?
        </h1>
      </div>

      {/* Use current location */}
      <button
        onClick={geo.request}
        disabled={geo.status === 'requesting'}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-4 text-sm text-left transition-all"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          color: geo.status === 'requesting' ? 'var(--text-muted)' : 'var(--text-primary)',
        }}>
        <Navigation size={15} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
        {geo.status === 'requesting' ? 'Detecting your location...' : 'Use my current location'}
      </button>

      {geo.error && (
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
          {geo.error}
        </p>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
        <span className="text-xs" style={{ color: 'var(--text-ghost)' }}>or search</span>
        <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
      </div>

      {/* Location search */}
      <div className="relative mb-2">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--text-muted)', pointerEvents: 'none' }}
        />
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); doSearch(e.target.value) }}
          placeholder="City, region, or country"
          className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
            caretColor: 'var(--accent-primary)',
          }}
        />
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid var(--border-default)' }}
        >
          {results.map((loc, i) => (
            <button
              key={loc.id ?? `${loc.lat},${loc.lon}`}
              onClick={() => onLocationChosen(loc)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-all"
              style={{
                background: 'transparent',
                borderTop: i > 0 ? '1px solid var(--border-subtle)' : 'none',
                color: 'var(--text-primary)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              <MapPin size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <span className="flex-1">{loc.name}</span>
              {loc.subtitle && (
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{loc.subtitle}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
