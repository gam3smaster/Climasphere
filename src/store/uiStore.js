import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUiStore = create(
  persist(
    (set, get) => ({
      onboarding: {
        complete: false,
        step: 'name',
      },

      userName: null,
      userAvatar: null,

      setUserProfile(name, avatar) {
        set({
          userName: name,
          userAvatar: avatar,
          onboarding: { ...get().onboarding, step: 'location' },
        })
      },

      completeOnboarding() {
        set({ onboarding: { complete: true, step: 'location' } })
      },

      // Go to location picker step without resetting name or avatar
      goToLocationStep() {
        set({ onboarding: { complete: false, step: 'location' } })
      },

      resetOnboarding() {
        set({
          onboarding: { complete: false, step: 'name' },
          userName: null,
          userAvatar: null,
        })
      },
    }),
    {
      name: 'climasphere-ui',
      partialize: state => ({
        onboarding: state.onboarding,
        userName: state.userName,
        userAvatar: state.userAvatar,
      }),
    }
  )
)