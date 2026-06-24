import { useMemo } from 'react'
import { Star } from 'lucide-react'
import { useWeather } from '../hooks/useWeather'
import { useSunCalc } from '../hooks/useSunCalc'
import { useAiBriefing } from '../hooks/useAiBriefing'
import { useUiStore } from '../store/uiStore'
import { useFavouritesStore } from '../store/favouritesStore'
import { getTempPalette } from '../lib/weather'
import { ClimateSphere } from '../components/sphere/ClimateSphere'
import { WeatherTimeline } from '../components/timeline/WeatherTimeline'
import { StatsRow } from '../components/dashboard/StatsRow'
import { TenDayForecast } from '../components/dashboard/TenDayForecast'
import { AiBriefing } from '../components/dashboard/AiBriefing'
import { AqiWidget } from '../components/dashboard/AqiWidget'
import { SunMoonCard } from '../components/dashboard/SunMoonCard'
import { PrecipChart } from '../components/dashboard/PrecipChart'
import { SkeletonBlock } from '../components/ui/LoadingState'

export default function Dashboard() {
  const weather = useWeather()
  const sunCalc = useSunCalc(weather.location?.lat, weather.location?.lon)
  const userName = useUiStore(s => s.userName)

  const items = useFavouritesStore(s => s.items)
  const storeFavToggle = useFavouritesStore(s => s.toggleFavourite)

  const upcomingHours = useMemo(() => {
    if (!weather.hourly.length || !weather.current) return []
    const now = new Date(weather.current.time)
    return weather.hourly.filter(h => new Date(h.time) >= now).slice(0, 24)
  }, [weather.hourly, weather.current])

  const palette = getTempPalette(weather.current?.temp ?? null)

  const briefing = useAiBriefing(
    { current: weather.current, hourly: weather.hourly, daily: weather.daily },
    weather.location,
    userName
  )

  const isFavourite = useMemo(() => {
    if (!weather.location) return false
    return items.some(
      i => Math.abs(i.lat - weather.location.lat) < 0.01 &&
           Math.abs(i.lon - weather.location.lon) < 0.01
    )
  }, [items, weather.location])

  function handleFavStar() {
    if (!weather.location) return
    storeFavToggle(weather.location)
  }

  if (weather.isError) {
    return (
      <div className="flex items-center justify-center h-full p-8 text-center">
        <div className="max-w-xs">
          <p className="text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
            Could not load weather data.
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {weather.error ?? 'Please check your connection and try again.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-full p-4 sm:p-6"
      style={{
        '--accent-primary': palette.accent,
        '--accent-glow': palette.glow,
        '--accent-dim': palette.glow.replace('0.14', '0.32'),
      }}
    >

      {/* Location header */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-5x1 font-data mb-1" style={{ color: 'var(--text-ghost)', letterSpacing: '2px' }}>
              <a href="/">CLIMASPHERE</a>
            </p>
            <h1
              className="text-5xl font-light tracking-tight"
              style={{
                color: 'var(--text-primary)',
                fontFamily: "'Space Grotesk', Inter, system-ui, sans-serif",
                fontWeight: 500,
                letterSpacing: '-0.01em',
              }}
            >
              {weather.location?.name ?? (weather.isLoading ? '' : 'Somewhere')}
            </h1>
            {weather.location?.country && (
              <p
                className="text-sm mt-0.5"
                style={{
                  color: 'var(--text-muted)',
                  fontFamily: "'Space Grotesk', Inter, system-ui, sans-serif",
                  fontWeight: 400,
                }}
              >
                {weather.location.subtitle || weather.location.country}
              </p>
            )}
          </div>

          {/* Favourite star */}
          {weather.location && (
            <button
              onClick={handleFavStar}
              className="mt-0.5 p-1.5 rounded-full transition-transform hover:scale-110 active:scale-95"
              aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
              style={{ color: isFavourite ? 'var(--accent-primary)' : 'var(--text-ghost)' }}
            >
              <Star
                size={17}
                fill={isFavourite ? 'currentColor' : 'none'}
                strokeWidth={1.8}
              />
            </button>
          )}
        </div>

        {weather.current && (
          <p className="text-xs font-data" style={{ color: 'var(--text-primary)' }}>
            {new Date(weather.current.time).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        )}
      </div>

      {/* Main columns */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr_340px]">

        {/* Left column */}
        <div className="space-y-5">
          <div className="flex justify-center py-2 overflow-hidden px-4">
            <div className="w-full max-w-[220px] sm:max-w-[280px] lg:max-w-[340px] mx-auto">
              <ClimateSphere current={weather.current} size={340} />
            </div>
          </div>

          <AiBriefing status={briefing.status} text={briefing.text} className="lg:hidden" />

          <div className="p-5 rounded-2xl"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
            }}
          >
            <p className="text-xs font-data mb-4"
              style={{ color: 'var(--text-ghost)', letterSpacing: '1.5px' }}
            >
              TODAY'S TRAJECTORY
            </p>
            {upcomingHours.length > 0
              ? <WeatherTimeline hourly={upcomingHours} sunCalc={sunCalc} />
              : <SkeletonBlock className="h-20" />
            }
          </div>

          {weather.isReady && upcomingHours.length > 0 && (
            <PrecipChart hourly={upcomingHours} />
          )}
          {weather.isLoading && <SkeletonBlock className="h-40" />}

          {weather.isReady && <StatsRow current={weather.current} />}
          {weather.isLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-20" />
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <AiBriefing status={briefing.status} text={briefing.text} className="hidden lg:block" />

          {weather.isReady && (
            <SunMoonCard sunCalc={sunCalc} isDay={weather.current?.isDay ?? true} />
          )}

          {weather.isReady && <AqiWidget airQuality={weather.airQuality} />}

          {weather.isReady && <TenDayForecast daily={weather.daily} />}

          {weather.isLoading && (
            <>
              <SkeletonBlock className="h-28" />
              <SkeletonBlock className="h-44" />
              <SkeletonBlock className="h-36" />
              <SkeletonBlock className="h-80" />
            </>
          )}
        </div>
      </div>
    </div>
  )
}