import { create } from 'zustand'
import { fetchWeather } from '../services/openMeteo'

export const useWeatherStore = create((set, get) => ({
  current: null,
  hourly: [],
  daily: [],
  airQuality: null,
  status: 'idle',
  error: null,
  lastFetchKey: null,

  async loadWeather(lat, lon) {
    const key = `${lat},${lon}`
    if (get().lastFetchKey === key) return

    set({ status: 'loading', error: null })

    try {
      const data = await fetchWeather(lat, lon)
      set({
        current: data.current,
        hourly: data.hourly,
        daily: data.daily,
        airQuality: data.airQuality,
        status: 'success',
        lastFetchKey: key,
      })
    } catch (err) {
      console.error('[ClimaSphere] Weather fetch failed:', err)
      set({ status: 'error', error: err.message })
    }
  },

  // Force refresh
  async refresh(lat, lon) {
    set({ lastFetchKey: null })
    return get().loadWeather(lat, lon)
  },
}))
