import { Marker } from 'react-leaflet'
import L from 'leaflet'

// Custom pulsing dots
function buildIcon() {
  return L.divIcon({
    className: 'cs-location-marker',
    html: `
      <div style="position: relative; width: 20px; height: 20px;">
        <div style="
          position: absolute; inset: 0;
          border-radius: 50%;
          background: #38bdf8;
          opacity: 0.25;
          animation: cursor-pulse 2.4s ease-in-out infinite;
        "></div>
        <div style="
          position: absolute; top: 6px; left: 6px;
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #38bdf8;
          box-shadow: 0 0 8px #38bdf8;
        "></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

export function LocationMarker({ lat, lon }) {
  return <Marker position={[lat, lon]} icon={buildIcon()} />
}