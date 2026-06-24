// Rainviewer's API doesn't require a key
const FRAMES_URL = 'https://api.rainviewer.com/public/weather-maps.json'

export async function fetchRadarFrames() {
  const res = await fetch(FRAMES_URL)
  if (!res.ok) throw new Error(`RainViewer fetch failed (${res.status})`)

  const data = await res.json()
  const host = data.host

  const past = data.radar?.past ?? []
  const nowcast = data.radar?.nowcast  ?? []
  const allFrames = [...past, ...nowcast]

  return {
    host,
    frames: allFrames.map(f => ({
      time: f.time,
      path: f.path,
    })),
    presentIndex: past.length - 1,
  }
}

export function buildRadarTileUrl(host, frame, { size = 256, color = 4, smooth = 1 } = {}) {
  return `${host}${frame.path}/${size}/{z}/{x}/{y}/${color}/${smooth}_1.png`
}
