const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const AQI_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality'
const ARCHIVE_URL = 'https://archive-api.open-meteo.com/v1/archive'

// Fetches weather and AQI together
export async function fetchWeather(lat, lon) {
  const [weather, aqi] = await Promise.all([
    fetchForecast(lat, lon),
    fetchAirQuality(lat, lon),
  ])

  return { ...weather, airQuality: aqi }
}

async function fetchForecast(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'precipitation',
      'weather_code',
      'cloud_cover',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
      'surface_pressure',
      'visibility',
      'is_day',
      'uv_index',
    ].join(','),
    hourly: [
      'temperature_2m',
      'apparent_temperature',
      'precipitation_probability',
      'precipitation',
      'weather_code',
      'cloud_cover',
      'wind_speed_10m',
      'wind_direction_10m',
      'uv_index',
      'is_day',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'apparent_temperature_max',
      'apparent_temperature_min',
      'sunrise',
      'sunset',
      'uv_index_max',
      'precipitation_sum',
      'precipitation_probability_max',
      'wind_speed_10m_max',
      'wind_direction_10m_dominant',
    ].join(','),
    wind_speed_unit: 'kmh',
    forecast_days: 10,
    timezone: 'auto',
  })

  const res = await fetch(`${FORECAST_URL}?${params}`)
  if (!res.ok) throw new Error(`Weather fetch failed (${res.status})`)

  const raw = await res.json()
  return parseWeatherResponse(raw)
}

async function fetchAirQuality(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: ['pm10', 'pm2_5', 'carbon_monoxide', 'nitrogen_dioxide', 'ozone', 'european_aqi'].join(','),
    hourly: ['pm10', 'pm2_5', 'european_aqi'].join(','),
    forecast_days: 1,
    timezone: 'auto',
  })

  const res = await fetch(`${AQI_URL}?${params}`)
  if (!res.ok) throw new Error(`AQI fetch failed (${res.status})`)

  const raw = await res.json()
  return parseAqiResponse(raw)
}

// Parsers

function parseWeatherResponse(raw) {
  const c = raw.current

  return {
    current: {
      temp: c.temperature_2m,
      feelsLike: c.apparent_temperature,
      humidity: c.relative_humidity_2m,
      precipitation: c.precipitation,
      code: c.weather_code,
      clouds: c.cloud_cover,
      windSpeed: c.wind_speed_10m,
      windDir: c.wind_direction_10m,
      windGusts: c.wind_gusts_10m,
      pressure: c.surface_pressure,
      visibility: c.visibility,
      isDay: c.is_day === 1,
      uvIndex: c.uv_index,
      time: c.time,
      timezone: raw.timezone,
    },
    hourly: parseHourly(raw.hourly),
    daily: parseDaily(raw.daily),
  }
}

function parseHourly(h) {
  return h.time.map((time, i) => ({
    time,
    temp: h.temperature_2m[i],
    feelsLike: h.apparent_temperature[i],
    precipProb: h.precipitation_probability[i],
    precip: h.precipitation[i],
    code: h.weather_code[i],
    clouds: h.cloud_cover[i],
    windSpeed: h.wind_speed_10m[i],
    windDir: h.wind_direction_10m[i],
    uvIndex: h.uv_index[i],
    isDay: h.is_day[i] === 1,
  }))
}

function parseDaily(d) {
  return d.time.map((time, i) => ({
    time,
    code: d.weather_code[i],
    tempMax: d.temperature_2m_max[i],
    tempMin: d.temperature_2m_min[i],
    feelsMax: d.apparent_temperature_max[i],
    feelsMin: d.apparent_temperature_min[i],
    sunrise: d.sunrise[i],
    sunset: d.sunset[i],
    uvMax: d.uv_index_max[i],
    precipSum: d.precipitation_sum[i],
    precipProb: d.precipitation_probability_max[i],
    windMax: d.wind_speed_10m_max[i],
    windDir: d.wind_direction_10m_dominant[i],
  }))
}

function parseAqiResponse(raw) {
  const c = raw.current
  return {
    aqi: c.european_aqi,
    pm10: c.pm10,
    pm25: c.pm2_5,
    co: c.carbon_monoxide,
    no2: c.nitrogen_dioxide,
    o3: c.ozone,
    hourly: raw.hourly.time.map((time, i) => ({
      time,

      aqi: raw.hourly.european_aqi[i],
      pm10: raw.hourly.pm10[i],
      pm25: raw.hourly.pm2_5[i],
    })),
  }
}

// Past weather for a date range — backed by Open-Meteo's ERA5 reanalysis
// archive, which covers any date back to 1940 with no API key.
export async function fetchHistory(lat, lon, startDate, endDate) {
  const params = new URLSearchParams({
    latitude:   lat,
    longitude:  lon,
    start_date: startDate,
    end_date:   endDate,
    daily: [
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
    ].join(','),
    timezone: 'auto',
  })

  const res = await fetch(`${ARCHIVE_URL}?${params}`)
  if (!res.ok) throw new Error(`History fetch failed (${res.status})`)

  const raw = await res.json()
  return raw.daily.time.map((time, i) => ({
    time,
    tempMax:   raw.daily.temperature_2m_max[i],
    tempMin:   raw.daily.temperature_2m_min[i],
    precipSum: raw.daily.precipitation_sum[i],
  }))
}