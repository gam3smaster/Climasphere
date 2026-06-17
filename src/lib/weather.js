// Weather code (Metadata)
export function getWeatherMeta(code) {
  const map = {
    0: { label: 'Clear Sky', category: 'clear', intensity: 0    },
    1: { label: 'Mainly Clear', category: 'clear', intensity: 0.1  },
    2: { label: 'Partly Cloudy', category: 'clouds', intensity: 0.35 },
    3: { label: 'Overcast', category: 'clouds', intensity: 0.8  },
    45: { label: 'Foggy', category: 'fog', intensity: 0.6  },
    48: { label: 'Icy Fog', category: 'fog', intensity: 0.85 },
    51: { label: 'Light Drizzle', category: 'drizzle', intensity: 0.2  },
    53: { label: 'Drizzle', category: 'drizzle', intensity: 0.45 },
    55: { label: 'Heavy Drizzle', category: 'drizzle', intensity: 0.65 },
    61: { label: 'Light Rain', category: 'rain', intensity: 0.3  },
    63: { label: 'Rain', category: 'rain', intensity: 0.6  },
    65: { label: 'Heavy Rain', category: 'rain', intensity: 0.92 },
    71: { label: 'Light Snow', category: 'snow', intensity: 0.3  },
    73: { label: 'Snow', category: 'snow', intensity: 0.6  },
    75: { label: 'Heavy Snow', category: 'snow', intensity: 0.92 },
    77: { label: 'Snow Grains', category: 'snow', intensity: 0.25 },
    80: { label: 'Light Showers', category: 'rain', intensity: 0.4  },
    81: { label: 'Showers', category: 'rain', intensity: 0.7  },
    82: { label: 'Violent Showers', category: 'rain', intensity: 1.0  },
    85: { label: 'Snow Showers', category: 'snow', intensity: 0.5  },
    86: { label: 'Heavy Snow Showers', category: 'snow', intensity: 0.75 },
    95: { label: 'Thunderstorm', category: 'thunder', intensity: 0.8  },
    96: { label: 'Thunderstorm', category: 'thunder', intensity: 0.9  },
    99: { label: 'Severe Thunderstorm', category: 'thunder', intensity: 1.0  },
  }

  return map[code] ?? { label: 'Unknown', category: 'clear', intensity: 0 }
}

// Temperature colour palette
export function getTempPalette(celsius) {
  if (celsius == null) return { accent: '#38bdf8', glow: 'rgba(56,189,248,0.14)' }

  if (celsius <= 0)  return { accent: '#818cf8', glow: 'rgba(129,140,248,0.14)' }
  if (celsius <= 8)  return { accent: '#38bdf8', glow: 'rgba(56,189,248,0.14)'  }
  if (celsius <= 16) return { accent: '#34d399', glow: 'rgba(52,211,153,0.14)'  }
  if (celsius <= 24) return { accent: '#fbbf24', glow: 'rgba(251,191,36,0.14)'  }
  if (celsius <= 32) return { accent: '#f97316', glow: 'rgba(249,115,22,0.14)'  }
  return                    { accent: '#ef4444', glow: 'rgba(239,68,68,0.14)'   }
}

// Wind direction label
export function windDirLabel(degrees) {
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW']
  return dirs[Math.round(degrees / 22.5) % 16]
}

// UV index
export function uvCategory(index) {
  if (index <= 2)  return { label: 'Low', color: '#4ade80' }
  if (index <= 5)  return { label: 'Moderate', color: '#facc15' }
  if (index <= 7)  return { label: 'High', color: '#fb923c' }
  if (index <= 10) return { label: 'Very High', color: '#f87171' }
  return                   { label: 'Extreme', color: '#c084fc' }
}

// European AQI scale
export function aqiCategory(aqi) {
  if (aqi <= 20) return { label: 'Good', color: '#4ade80' }
  if (aqi <= 40) return { label: 'Fair', color: '#a3e635' }
  if (aqi <= 60) return { label: 'Moderate', color: '#facc15' }
  if (aqi <= 80) return { label: 'Poor', color: '#fb923c' }
  if (aqi <= 100) return { label: 'Very Poor', color: '#f87171' }
  return                  { label: 'Hazardous', color: '#c084fc' }
}

// Description of weather code
export function describeWeatherCode(code) {
  return getWeatherMeta(code).label
}
