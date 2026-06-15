import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useLocationStore = create(
  persist(
    (set) => ({
      // The location we're currently showing weather for
      active: null, // { name, subtitle, lat, lon, country, countryCode }

      // Last 5 searched locations — shown as quick picks in the search UI
      recent: [],

      setActive(location) {
        set(state => ({
          active: location,
          recent: [
            location,
            // Remove any previous entry for the same coordinates
            ...state.recent.filter(
              l => !(Math.abs(l.lat - location.lat) < 0.01 && Math.abs(l.lon - location.lon) < 0.01)
            ),
          ].slice(0, 5),
        }))
      },

      clearActive() {
        set({ active: null })
      },
    }),
    {
      name:        'climasphere-location',
      partialize:  state => ({ active: state.active, recent: state.recent }),
    }
  )
)
