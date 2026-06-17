import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUiStore = create(
  persist(
    (set, get) => ({
      // Onboarding tracks which step the user is on.
      // `complete` becomes true after they pick a location.
      onboarding: {
        complete: false,
        step:     'name', // 'name' | 'location'
      },

      userName:   null,
      userAvatar: null, // one of the symbols defined in OnboardingModal

      setUserProfile(name, avatar) {
        set({
          userName:   name,
          userAvatar: avatar,
          onboarding: { ...get().onboarding, step: 'location' },
        })
      },

      completeOnboarding() {
        set({ onboarding: { complete: true, step: 'location' } })
      },

      resetOnboarding() {
        set({
          onboarding: { complete: false, step: 'name' },
          userName:   null,
          userAvatar: null,
        })
      },
    }),
    {
      name:       'climasphere-ui',
      partialize: state => ({
        onboarding:  state.onboarding,
        userName:    state.userName,
        userAvatar:  state.userAvatar,
      }),
    }
  )
)