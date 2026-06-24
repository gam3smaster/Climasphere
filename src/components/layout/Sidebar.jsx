import { NavLink } from 'react-router-dom'
import {
LayoutDashboard,
CloudSun,
Map,
Radio,
Wind,
Bell,
TrendingUp,
Star,
Settings,
User,
} from 'lucide-react'
import { cn } from '../../lib/utils'

export const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/forecast', icon: CloudSun, label: 'Forecast' },
  { to: '/maps', icon: Map, label: 'Maps' },
  { to: '/radar', icon: Radio, label: 'Radar' },
  { to: '/air', icon: Wind, label: 'Air Quality' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
  { to: '/history', icon: TrendingUp, label: 'History' },
  { to: '/favs', icon: Star, label: 'Favourites' },
]

export const NAV_BOTTOM = [
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  return (
    <aside className="relative hidden lg:flex flex-col h-screen flex-shrink-0 overflow-hidden"
      style={{
        width: 'var(--sidebar-width)',
        background: 'var(--bg-base)',
        borderRight: '1px solid var(--border-subtle)',
      }}>
        {/* Logo mark */}
        <div className="flex items-center gap-3 px-3 py-4 flex-shrink-0">
          <img src="/climasphere-logo.png"
            alt="ClimaSphere"
            className="object-contain"
            style={{ height: 40, width: 'auto', maxWidth: 160 }}
          />
        </div>
      {/* Primary navigation */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {NAV.map(item => (
          <SidebarLink key={item.to} {...item} />
        ))}
      </nav>
      {/* Bottom nav */}
      <div
        className="px-2 pb-3 pt-3 flex-shrink-0"
        style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="space-y-0.5 mb-3">
          {NAV_BOTTOM.map(item => (
            <SidebarLink key={item.to} {...item} />
          ))}
        </div>
      </div>
    </aside>
  )
}

function SidebarLink({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-2.5 py-2 rounded-xl transition-all',
          isActive ? 'text-primary' : 'hover:text-primary'
        )
      }
      style={({ isActive }) => ({
        background: isActive ? 'var(--bg-elevated)' : 'transparent',
        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
      })}>
      <Icon size={18} className="flex-shrink-0" />
      <span className="text-sm font-medium whitespace-nowrap">{label}</span>
    </NavLink>
  )
}