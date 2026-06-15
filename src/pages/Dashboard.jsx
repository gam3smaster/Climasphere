import { useMemo } from 'react'
import { useWeather } from '../hooks/useWeather'
import { useSunCalc } from '../hooks/useSunCalc'
import { useUiStore } from '../store/uiStore'
import { getTempPalette } from '../lib/weather'
import { ClimateSphere } from '../components/sphere/ClimateSphere'
import { WeatherTimeline } from '../components/timeline/WeatherTimeline'
import { StatsRow } from '../components/dashboard/StatsRow'
import { TenDayForecast } from '../components/dashboard/TenDayForecast'
import { AiBriefing } from '../components/dashboard/AiBriefing'
import { SkeletonBlock } from '../components/ui/LoadingState'

export default function Dashboard() {
  const weather  = useWeather()
  const sunCalc  = useSunCalc(weather.location?.lat, weather.location?.lon)
  const userName = useUiStore(s => s.userName)

  // Hourly data starting from present time
  const upcomingHours = useMemo(() => {
    if (!weather.hourly.length || !weather.current)
      return []
    const now = new Date(weather.current.time)
    return weather.hourly.filter(h => new Date(h.time) >= now).slice(0, 24)
  }, [weather.hourly, weather.current])

  // Update the CSS accent color whenever temperature changes
  const palette = getTempPalette(weather.current?.temp ?? null)

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
      className="min-h-full p-6"
      style={{
        // All the child components should use temperature-reactive accent color var(--accent-primary)
        '--accent-primary': palette.accent,
        '--accent-glow':    palette.glow,
        '--accent-dim':     palette.glow.replace('0.14', '0.32'),
      }}>

      {/* Location header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1
            className="text-2xl font-light tracking-tight"
            style={{ color: 'var(--text-primary)' }}>
            {weather.location?.name ?? (weather.isLoading ? '' : 'Somewhere')}
          </h1>
          {weather.location?.country && (
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {weather.location.subtitle || weather.location.country}
            </p>
          )}
        </div>
        {weather.current && (
          <p className="text-xs font-data" style={{ color: 'var(--text-ghost)' }}>
            {new Date(weather.current.time).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        )}
      </div>

      {/* Main columns grids */}
      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: '1fr 340px' }}>

        {/* Left column */}
        <div className="space-y-5">
          {/* The sphere (Hero) */}
          <div className="flex justify-center py-2">
            <ClimateSphere current={weather.current} size={340} />
          </div>

          {/* Weather timeline */}
          <div
            className="p-5 rounded-2xl"
            style={{
              background: 'var(--bg-surface)',
              border:     '1px solid var(--border-default)',
            }}
          >
            <p className="text-xs font-data mb-4" style={{ color: 'var(--text-ghost)', letterSpacing: '1.5px'}}>
              TODAY'S TRAJECTORY
            </p>
            {upcomingHours.length > 0
              ? <WeatherTimeline hourly={upcomingHours} sunCalc={sunCalc} />
              : <SkeletonBlock className="h-20" />
            }
          </div>

          {/* Atmospheric stats */}
          {weather.isReady && (
            <StatsRow current={weather.current} />
          )}
          {weather.isLoading && (
            <div className="grid grid-cols-5 gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-20" />
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <AiBriefing
            weather={{
              current: weather.current,
              hourly: weather.hourly,
              daily: weather.daily
            }}
            location={weather.location}
            userName={userName}
          />

          {weather.isReady && <TenDayForecast daily={weather.daily} />}
          {weather.isLoading && (
            <>
              <SkeletonBlock className="h-28" />
              <SkeletonBlock className="h-80" />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
