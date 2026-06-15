const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse'

// Search by query string — powers the location search input
export async function searchLocations(query) {
  if (!query.trim()) return []

  const params = new URLSearchParams({
    name:     query,
    count:    8,
    language: 'en',
    format:   'json',
  })

  const res = await fetch(`${GEOCODING_URL}?${params}`)
  if (!res.ok) throw new Error(`Location search failed (${res.status})`)

  const data = await res.json()
  return (data.results ?? []).map(normalizeResult)
}

// Reverse geocode coordinates → a human-readable place name.
// Used when the user grants browser geolocation permission.
export async function reverseGeocode(lat, lon) {
  const params = new URLSearchParams({
    lat,
    lon,
    format:            'json',
    zoom:              10,
    'accept-language': 'en',
  })

  const res = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: { 'User-Agent': 'ClimaSphere/1.0' },
  })
  if (!res.ok) throw new Error(`Reverse geocode failed (${res.status})`)

  const data = await res.json()

  // Prefer progressively smaller place names — city over county, etc.
  const name =
    data.address?.city    ??
    data.address?.town    ??
    data.address?.village ??
    data.address?.county  ??
    'Your Location'

  return {
    name,
    country:     data.address?.country ?? '',
    countryCode: data.address?.country_code?.toUpperCase() ?? '',
    subtitle:    data.address?.country ?? '',
    lat,
    lon,
  }
}

function normalizeResult(raw) {
  const parts = [raw.admin1, raw.country].filter(Boolean)
  return {
    id:          raw.id,
    name:        raw.name,
    subtitle:    parts.join(', '),
    lat:         raw.latitude,
    lon:         raw.longitude,
    country:     raw.country ?? '',
    countryCode: raw.country_code ?? '',
    timezone:    raw.timezone,
  }
}
