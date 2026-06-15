import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudDrizzle,
  CloudLightning,
  CloudFog,
} from 'lucide-react'
import { getWeatherMeta } from '../../lib/weather'

const ICONS = {
  clear: Sun,
  clouds: Cloud,
  rain: CloudRain,
  drizzle: CloudDrizzle,
  snow: CloudSnow,
  thunder: CloudLightning,
  fog: CloudFog,
}

export function WeatherIcon({ code, size = 20, style, className }) {
  const { category } = getWeatherMeta(code)
  const Icon = ICONS[category] ?? Cloud
  return <Icon size={size} style={style} className={className} />
}
