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
ChevronRight,
} from 'lucide-react'
import { useUiStore } from '../../store/uiStore'
import { cn } from '../../lib/utils'

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/forecast', icon: CloudSun, label: 'Forecast' },
  { to: '/maps', icon: Map, label: 'Maps' },
  { to: '/radar', icon: Radio, label: 'Radar' },
  { to: '/air', icon: Wind, label: 'Air Quality' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
  { to: '/history', icon: TrendingUp, label: 'History' },
  { to: '/favs', icon: Star, label: 'Favorites' },
]

const NAV_BOTTOM = [
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/profile',  icon: User, label: 'Profile' },
]

export function Sidebar() {
  const { sidebarExpanded, toggleSidebar } = useUiStore()

  return (
    <aside className="relative flex flex-col h-screen flex-shrink-0 overflow-hidden"
      style={{
        width: sidebarExpanded ? 'var(--sidebar-expanded)' : 'var(--sidebar-width)',
        background: 'var(--bg-base)',
        borderRight: '1px solid var(--border-subtle)',
        transition: 'width var(--duration-slow) var(--ease-smooth)',
      }}>

      {/* Logo mark */}
      <div className="flex items-center gap-3 px-4 py-5 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
          style={{
            background: 'var(--accent-glow)',
            border: '1px solid var(--accent-dim)',
            color: 'var(--accent-primary)',
          }}>
          ◎
        </div>
        {sidebarExpanded && (
          <span className="text-sm font-medium whitespace-nowrap tracking-tight"
            style={{ color: 'var(--text-primary)' }}>
            ClimaSphere
          </span>
        )}
      </div>

      {/* Primary navigation */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {NAV.map(item => (
          <SidebarLink key={item.to} {...item} expanded={sidebarExpanded} />
        ))}
      </nav>

      {/* Bottom nav and expansion toggle */}
      <div
        className="px-2 pb-3 pt-3 flex-shrink-0"
        style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="space-y-0.5 mb-3">
          {NAV_BOTTOM.map(item => (
            <SidebarLink key={item.to} {...item} expanded={sidebarExpanded} />
          ))}
        </div>

        {/* Collapse / expand button */}
        <button className="flex items-center justify-center w-full h-8 rounded-xl transition-all"
          style={{
            background: 'var(--bg-surface)',
            color: 'var(--text-muted)',
          }}
          onClick={toggleSidebar}
          aria-label={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}>
          <ChevronRight
            size={14}
            style={{
              transform: sidebarExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform var(--duration-base) var(--ease-smooth)',
            }}
          />
        </button>
      </div>
    </aside>
  )
}

function SidebarLink({ to, icon: Icon, label, expanded }) {
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
      {expanded && (
        <span className="text-sm font-medium whitespace-nowrap">{label}</span>
      )}
    </NavLink>
  )
}
