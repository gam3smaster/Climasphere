import { getWeatherMeta } from './weather'
import { isToday } from './time'

// Condiditions thresholds
const THRESHOLDS = {
  uvHigh: 8,
  windGusts: 50,  // km/h
  heatTemp: 38,  // °C
  frostTemp: 2,   // °C minimum
  poorAqi: 80,
  rainProb: 70,  // %
}

const LOOKAHEAD_HOURS = 6

// Builds the alert list from current conditions, the next few hours, today's daily summary, and air quality
export function deriveAlerts({ current, hourly, daily, airQuality }) {
  if (!current) return []

  const alerts = []
  const upcoming = hourly
    .filter(h => new Date(h.time) >= new Date(current.time))
    .slice(0, LOOKAHEAD_HOURS)

  const todayDaily = daily.find(d => isToday(d.time))

  if (current.uvIndex >= THRESHOLDS.uvHigh) {
    alerts.push({
      id: 'uv',
      severity: 'moderate',
      title: 'High UV Exposure',
      message: `UV index is ${Math.round(current.uvIndex)}. Limit direct sun and wear protection.`,
    })
  }

  if ((current.windGusts ?? 0) >= THRESHOLDS.windGusts) {
    alerts.push({
      id: 'wind',
      severity: 'moderate',
      title: 'Strong Wind Gusts',
      message: `Gusts up to ${Math.round(current.windGusts)} km/h are expected. Secure loose outdoor items.`,
    })
  }

  if (current.feelsLike >= THRESHOLDS.heatTemp) {
    alerts.push({
      id: 'heat',
      severity: 'severe',
      title: 'Extreme Heat',
      message: `Feels like ${Math.round(current.feelsLike)}°C. Stay hydrated and avoid prolonged sun exposure.`,
    })
  }

  if (todayDaily && todayDaily.tempMin <= THRESHOLDS.frostTemp) {
    alerts.push({
      id: 'frost',
      severity: 'moderate',
      title: 'Frost Risk',
      message: `Overnight low near ${Math.round(todayDaily.tempMin)}°C. Protect sensitive plants and pipes.`,
    })
  }

  if (airQuality && airQuality.aqi >= THRESHOLDS.poorAqi) {
    alerts.push({
      id: 'aqi',
      severity: 'moderate',
      title: 'Poor Air Quality',
      message: 'Consider limiting outdoor exertion, especially if you have negative respiratory reactions.',
    })
  }

  const rainHour = upcoming.find(h => (h.precipProb ?? 0) >= THRESHOLDS.rainProb)
  if (rainHour) {
    alerts.push({
      id: 'rain',
      severity: 'advisory',
      title: 'Heavy Rain Expected',
      message: `${rainHour.precipProb}% chance of rain within the next few hours.`,
    })
  }

  const stormHour = upcoming.find(h => getWeatherMeta(h.code).category === 'thunder')
  if (stormHour) {
    alerts.push({
      id: 'storm',
      severity: 'severe',
      title: 'Thunderstorm Risk',
      message: 'Thunderstorms are possible in the next few hours. Avoid open or elevated areas.',
    })
  }

  const severityRank = { severe: 0, moderate: 1, advisory: 2 }
  return alerts.sort((a, b) => severityRank[a.severity] - severityRank[b.severity])
}

export const SEVERITY_COLORS = {
  severe: '#f87171',
  moderate: '#fb923c',
  advisory: '#38bdf8',
}