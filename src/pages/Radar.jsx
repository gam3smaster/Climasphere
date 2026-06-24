import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import { Play, Pause } from 'lucide-react'
import { useWeather } from '../hooks/useWeather'
import { fetchRadarFrames, buildRadarTileUrl } from '../services/rainviewer'
import { GlassCard } from '../components/ui/GlassCard'
import { LocationMarker } from '../components/maps/LocationMarker'

const DARK_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const DARK_ATTRIBUTION = '&copy; OpenStreetMap contributors &copy; CARTO'

// The time each frame takes
const FRAME_INTERVAL_MS = 600

export default function Radar() {
  const { location } = useWeather()
  const [radar, setRadar] = useState(null)
  const [frameIndex, setFrameIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const timerRef = useRef(null)

  useEffect(() => {
    fetchRadarFrames()
      .then(data => {
        setRadar(data)
        setFrameIndex(data.presentIndex)
      })
      .catch(err => console.error('[ClimaSphere] Radar fetch failed:', err))
  }, [])

  // Playback loop (starts afresh after reaching the end)
  useEffect(() => {
    if (!isPlaying || !radar) return

    timerRef.current = setInterval(() => {
      setFrameIndex(prev => (prev + 1) % radar.frames.length)
    }, FRAME_INTERVAL_MS)

    return () => clearInterval(timerRef.current)
  }, [isPlaying, radar])

  if (!location) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-light mb-6" style={{ color: 'var(--text-primary)' }}>
          Radar
        </h1>
        <GlassCard className="p-10 text-center">
          <p style={{ color: 'var(--text-muted)' }}>Set a location to view radar</p>
        </GlassCard>
      </div>
    )
  }

  const frame = radar?.frames?.[frameIndex]
  const isFuture = radar && frameIndex > radar.presentIndex

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-4 flex-shrink-0">
        <h1 className="text-2xl font-light" style={{ color: 'var(--text-primary)' }}>
          Radar
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {location.name}
        </p>
      </div>

      <div className="flex-1 rounded-2xl overflow-hidden relative"
        style={{ border: '1px solid var(--border-default)', minHeight: 420 }}
      >
        <MapContainer
          center={[location.lat, location.lon]}
          zoom={7}
          style={{ width: '100%', height: '100%', background: '#0b0f18' }}
          zoomControl={false}
        >
          <TileLayer url={DARK_TILES} attribution={DARK_ATTRIBUTION} />

          {frame && (
            <TileLayer
              key={frame.time}
              url={buildRadarTileUrl(radar.host, frame)}
              opacity={0.6}
              zIndex={10}
              maxNativeZoom={7}
            />
          )}

          <LocationMarker lat={location.lat} lon={location.lon} />
        </MapContainer>

        {/* Forecast badge */}
        {isFuture && (
          <div
            className="absolute top-3 left-3 z-[1000] px-3 py-1.5 rounded-lg text-xs font-data"
            style={{
              background: 'var(--accent-glow)',
              border: '1px solid var(--accent-dim)',
              color: 'var(--accent-primary)',
            }}
          >
            FORECAST
          </div>
        )}
      </div>

      {/* Playback controls */}
      {radar && (
        <div className="mt-4 flex-shrink-0">
          <GlassCard className="p-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsPlaying(p => !p)}
                className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
                style={{ background: 'var(--accent-primary)', color: '#000' }}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>

              {/* Scrubber */}
              <div className="flex-1">
                <input
                  type="range"
                  min={0}
                  max={radar.frames.length - 1}
                  value={frameIndex}
                  onChange={e => {
                    setIsPlaying(false)
                    setFrameIndex(Number(e.target.value))
                  }}
                  className="w-full"
                  style={{ accentColor: 'var(--accent-primary)' }}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs font-data" style={{ color: 'var(--text-ghost)' }}>
                    -2h
                  </span>
                  <span className="text-xs font-data" style={{ color: 'var(--accent-primary)' }}>
                    {frame ? formatFrameTime(frame.time) : ''}
                  </span>
                  <span className="text-xs font-data" style={{ color: 'var(--text-ghost)' }}>
                    +30m
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  )
}

function formatFrameTime(unixSeconds) {
  return new Date(unixSeconds * 1000).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}