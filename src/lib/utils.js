import { clsx } from 'clsx'

// Merge class names, resolving duplicates and falsy values.
// Used everywhere we conditionally combine Tailwind classes.
export function cn(...inputs) {
  return clsx(inputs)
}

// Clamp a value within [min, max]
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

// Map a value from one range to another.
// e.g. mapRange(50, 0, 100, 0, 1) → 0.5
export function mapRange(value, inMin, inMax, outMin, outMax) {
  const ratio = (value - inMin) / (inMax - inMin)
  return outMin + clamp(ratio, 0, 1) * (outMax - outMin)
}

// Debounce — delays fn until ms have passed since the last call.
// Returns a stable function reference (doesn't recreate on each call).
export function debounce(fn, ms) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}
