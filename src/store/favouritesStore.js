import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useFavouritesStore = create(
  persist(
    (set, get) => ({
      items: [],

      isFavourite(lat, lon) {
        return get().items.some(l => isSameLocation(l, lat, lon))
      },

      toggleFavourite(location) {
        const exists = get().items.some(l => isSameLocation(l, location.lat, location.lon))
        set({
          items: exists
            ? get().items.filter(l => !isSameLocation(l, location.lat, location.lon))
            : [...get().items, location],
        })
      },

      removeFavourite(lat, lon) {
        set({ items: get().items.filter(l => !isSameLocation(l, lat, lon)) })
      },
    }),
    {
      name: 'climasphere-favourites',
      partialize: state => ({ items: state.items }),
    }
  )
)

function isSameLocation(loc, lat, lon) {
  return Math.abs(loc.lat - lat) < 0.01 && Math.abs(loc.lon - lon) < 0.01
}