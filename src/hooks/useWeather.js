import { useEffect } from 'react'
import { useWeatherStore } from '../store/weatherStore'
import { useLocationStore } from '../store/locationStore'

// The primary data hook. Components use this instead of subscribing to stores directly. 
// It handles the fetch trigger and gives back a consistent and clean shape.
export function useWeather() {
  const store = useWeatherStore()
  const location = useLocationStore(s => s.active)

  useEffect(() => {
    if (location?.lat != null && location?.lon != null) {
      store.loadWeather(location.lat, location.lon)
    }
  }, [location?.lat, location?.lon])

  return {
    current: store.current,
    hourly: store.hourly,
    daily: store.daily,
    airQuality: store.airQuality,
    location,
    isLoading: store.status === 'loading',
    isError: store.status === 'error',
    isReady: store.status === 'success' && store.current != null,
    error: store.error,
  }
}
