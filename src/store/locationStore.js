import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useLocationStore = create(
  persist(
    (set) => ({
      // The location currently showing weather
      active: null,

      recent: [],

      setActive(location) {
        set(state => ({
          active: location,
          recent: [
            location,
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
      name: 'climasphere-location',
      partialize: state => ({ active: state.active, recent: state.recent }),
    }
  )
)
