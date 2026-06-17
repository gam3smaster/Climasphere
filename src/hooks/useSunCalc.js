import { useMemo } from 'react'
import SunCalc from 'suncalc'

export function useSunCalc(lat, lon) {
  return useMemo(() => {
    if (lat == null || lon == null) return null

    const now = new Date()
    const times = SunCalc.getTimes(now, lat, lon)
    const illum = SunCalc.getMoonIllumination(now)
    const pos = SunCalc.getMoonPosition(now, lat, lon)

    return {
      sunrise: times.sunrise,
      sunset: times.sunset,
      solarNoon: times.solarNoon,
      goldenHourMorning: times.goldenHourEnd,
      goldenHourEvening: times.goldenHour,

      // The sun's progress
      sunProgress: computeSunProgress(times.sunrise, times.sunset),

      moon: {
        fraction: illum.fraction,
        phase: illum.phase,
        phaseName: getMoonPhaseName(illum.phase),
        aboveHorizon: pos.altitude > 0,
      },
    }
  }, [lat, lon])
}

function computeSunProgress(sunrise, sunset) {
  const now = Date.now()
  const start = sunrise.getTime()
  const end = sunset.getTime()
  if (now <= start) return 0
  if (now >= end) return 1
  return (now - start) / (end - start)
}

function getMoonPhaseName(phase) {
  if (phase < 0.03 || phase >= 0.97) return 'New Moon'
  if (phase < 0.22) return 'Waxing Crescent'
  if (phase < 0.28) return 'First Quarter'
  if (phase < 0.47) return 'Waxing Gibbous'
  if (phase < 0.53) return 'Full Moon'
  if (phase < 0.72) return 'Waning Gibbous'
  if (phase < 0.78) return 'Last Quarter'
  return 'Waning Crescent'
}
