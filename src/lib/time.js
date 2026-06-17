// Format an ISO string for time
export function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

// Format an ISO string for date
export function formatDayShort(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
  })
}

// Returns true if the ISO string represents a date in the local day
export function isToday(iso) {
  const d = new Date(iso)
  const now = new Date()
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  )
}

// Used to position the "now" cursor on the weather timeline.
export function dayProgress() {
  const now = new Date()
  return (now.getHours() * 60 + now.getMinutes()) / (24 * 60)
}

// Converts a Date object to its position in the same calendar day
export function dateToDayProgress(date) {
  const midnight = new Date(date)
  midnight.setHours(0, 0, 0, 0)
  const nextMidnight = new Date(midnight)
  nextMidnight.setDate(midnight.getDate() + 1)
  return (date - midnight) / (nextMidnight - midnight)
}
