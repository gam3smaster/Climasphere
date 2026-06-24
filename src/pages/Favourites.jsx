import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, X, MapPin } from 'lucide-react'
import { useFavouritesStore } from '../store/favouritesStore'
import { useLocationStore } from '../store/locationStore'
import { fetchWeather } from '../services/openMeteo'
import { getTempPalette } from '../lib/weather'
import { GlassCard } from '../components/ui/GlassCard'
import { WeatherIcon } from '../components/ui/WeatherIcon'
import { LoadingDots } from '../components/ui/LoadingState'

export default function Favourites() {
  const items = useFavouritesStore(s => s.items)
  const removeFavourite = useFavouritesStore(s => s.removeFavourite)
  const setActive = useLocationStore(s => s.setActive)
  const navigate = useNavigate()

  function openLocation(location) {
    setActive(location)
    navigate('/')
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-light tracking-tight mb-6" style={{ color: 'var(--text-primary)' }}>
        Favourites
      </h1>

      {items.length === 0 ? (
        <GlassCard className="p-10 text-center max-w-md">
          <Star size={22} className="mx-auto mb-3" style={{ color: 'var(--text-ghost)' }} />
          <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
            No favourites yet
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Tap the star next to a location on the Dashboard to save it here.
          </p>
        </GlassCard>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          {items.map(loc => (
            <FavouriteCard
              key={`${loc.lat},${loc.lon}`}
              location={loc}
              onOpen={() => openLocation(loc)}
              onRemove={() => removeFavourite(loc.lat, loc.lon)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FavouriteCard({ location, onOpen, onRemove }) {
  const [weather, setWeather] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchWeather(location.lat, location.lon)
      .then(data => { if (!cancelled) setWeather(data) })
      .catch(()  => { if (!cancelled) setFailed(true) })
    return () => { cancelled = true }
  }, [location.lat, location.lon])

  const palette = weather ? getTempPalette(weather.current.temp) : null

  return (
    <GlassCard className="p-5 relative group">
      <button
        onClick={e => { e.stopPropagation(); onRemove() }}
        className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
        style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
        aria-label="Remove favourite">
        <X size={12} />
      </button>

      <button onClick={onOpen} className="w-full text-left">
        <div className="flex items-center gap-1.5 mb-3">
          <MapPin size={11} style={{ color: 'var(--text-ghost)', flexShrink: 0 }} />
          <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
            {location.name}
          </p>
        </div>

        {weather && (
          <div className="flex items-center gap-3">
            <WeatherIcon code={weather.current.code} size={22} style={{ color: palette.accent }} />
            <span className="text-2xl font-light font-data" style={{ color: 'var(--text-primary)' }}>
              {Math.round(weather.current.temp)}°
            </span>
          </div>
        )}

        {!weather && !failed && (
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <LoadingDots />
          </div>
        )}

        {failed && (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Could not load conditions
          </p>
        )}
      </button>
    </GlassCard>
  )
}