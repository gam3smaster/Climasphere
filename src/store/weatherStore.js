import { create } from 'zustand'
import { fetchWeather } from '../services/openMeteo'

export const useWeatherStore = create((set, get) => ({
  current:    null,
  hourly:     [],
  daily:      [],
  airQuality: null,

  status: 'idle', // 'idle' | 'loading' | 'success' | 'error'
  error:  null,

  // Track what we last fetched so navigation between pages
  // doesn't trigger redundant API calls for the same location
  lastFetchKey: null,

  async loadWeather(lat, lon) {
    const key = `${lat},${lon}`
    if (get().lastFetchKey === key) return

    set({ status: 'loading', error: null })

    try {
      const data = await fetchWeather(lat, lon)
      set({
        current:      data.current,
        hourly:       data.hourly,
        daily:        data.daily,
        airQuality:   data.airQuality,
        status:       'success',
        lastFetchKey: key,
      })
    } catch (err) {
      console.error('[ClimaSphere] Weather fetch failed:', err)
      set({ status: 'error', error: err.message })
    }
  },

  // Force a fresh fetch — used by a "refresh" button if we add one
  async refresh(lat, lon) {
    set({ lastFetchKey: null })
    return get().loadWeather(lat, lon)
  },
}))
