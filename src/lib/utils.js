import { clsx } from 'clsx'

export function cn(...inputs) {
  return clsx(inputs)
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export function mapRange(value, inMin, inMax, outMin, outMax) {
  const ratio = (value - inMin) / (inMax - inMin)
  return outMin + clamp(ratio, 0, 1) * (outMax - outMin)
}

// Returns a stable function reference
export function debounce(fn, ms) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}
