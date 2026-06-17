import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import { Layers, Crosshair } from 'lucide-react'
import { useWeather } from '../hooks/useWeather'
import { fetchRadarFrames, buildRadarTileUrl } from '../services/rainviewer'
import { GlassCard } from '../components/ui/GlassCard'
import { LocationMarker } from '../components/maps/LocationMarker'

const DARK_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const DARK_ATTRIBUTION = '&copy; OpenStreetMap contributors &copy; CARTO'

export default function Maps() {
  const { location } = useWeather()
  const [showRadar, setShowRadar] = useState(true)
  const [radar, setRadar] = useState(null)

  useEffect(() => {
    fetchRadarFrames()
      .then(setRadar)
      .catch(err => console.error('[ClimaSphere] Radar fetch failed:', err))
  }, [])

  if (!location) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-light mb-6" style={{ color: 'var(--text-primary)' }}>
          Maps
        </h1>
        <GlassCard className="p-10 text-center">
          <p style={{ color: 'var(--text-muted)' }}>Set a location to view the map</p>
        </GlassCard>
      </div>
    )
  }

  const latestFrame = radar?.frames?.[radar.presentIndex]

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between flex-shrink-0">
        <h1 className="text-2xl font-light" style={{ color: 'var(--text-primary)' }}>
          Maps
        </h1>

        <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-data"
          onClick={() => setShowRadar(v => !v)}
          style={{
            background: showRadar ? 'var(--accent-glow)' : 'var(--bg-surface)',
            border: `1px solid ${showRadar ? 'var(--accent-dim)' : 'var(--border-default)'}`,
            color: showRadar ? 'var(--accent-primary)' : 'var(--text-muted)',
          }}
        >
          <Layers size={13} />
          RADAR {showRadar ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="flex-1 rounded-2xl overflow-hidden relative"
        style={{ border: '1px solid var(--border-default)', minHeight: 480 }}
      >
        <MapContainer
          center={[location.lat, location.lon]}
          zoom={8}
          style={{ width: '100%', height: '100%', background: '#0b0f18' }}
          zoomControl={false}
        >
          <TileLayer url={DARK_TILES} attribution={DARK_ATTRIBUTION} />

          {showRadar && latestFrame && (
            <TileLayer
              url={buildRadarTileUrl(radar.host, latestFrame)}
              opacity={0.55}
              zIndex={10}
              maxNativeZoom={7}
            />
          )}

          <LocationMarker lat={location.lat} lon={location.lon} />
          <RecenterButton lat={location.lat} lon={location.lon} />
        </MapContainer>
      </div>
    </div>
  )
}

// Custom recenter button rendered inside the map
function RecenterButton({ lat, lon }) {
  const map = useMap()

  return (
    <button
      onClick={() => map.setView([lat, lon], 8)}
      className="absolute z-[1000] flex items-center justify-center w-9 h-9 rounded-xl"
      style={{
        top: 12,
        right: 12,
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-default)',
        color: 'var(--text-secondary)',
      }}
      aria-label="Recenter map"
    >
      <Crosshair size={15} />
    </button>
  )
}