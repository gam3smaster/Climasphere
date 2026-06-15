import { useState, useCallback } from 'react'

export function useGeolocation() {
  const [state, setState] = useState({
    status: 'idle', // 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable'
    coords: null,   // { lat, lon } on success
    error:  null,
  })

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setState({
        status: 'unavailable',
        coords: null,
        error:  'Geolocation is not supported by your browser.',
      })
      return
    }

    setState({ status: 'requesting', coords: null, error: null })

    navigator.geolocation.getCurrentPosition(
      pos => {
        setState({
          status: 'granted',
          coords: { lat: pos.coords.latitude, lon: pos.coords.longitude },
          error:  null,
        })
      },
      err => {
        setState({
          status: 'denied',
          coords: null,
          error: err.code === 1
            ? 'Location access was denied. Search for your city below.'
            : 'Could not determine your location. Please search manually.',
        })
      },
      { timeout: 8000, enableHighAccuracy: false }
    )
  }, [])

  return { ...state, request }
}
