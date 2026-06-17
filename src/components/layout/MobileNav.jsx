import { NavLink } from 'react-router-dom'
import { NAV, NAV_BOTTOM } from './Sidebar'

const MOBILE_ROUTES = ['/', '/forecast', '/maps', '/radar', '/air', '/settings']
const ALL_ITEMS = [...NAV, ...NAV_BOTTOM]
const MOBILE_ITEMS = MOBILE_ROUTES.map(to => ALL_ITEMS.find(item => item.to === to))

export function MobileNav() {
  return (
    <nav
      className="flex lg:hidden items-stretch justify-around flex-shrink-0"
      style={{
        height: 'calc(56px + env(safe-area-inset-bottom))',
        paddingBottom: 'env(safe-area-inset-bottom)',
        background: 'var(--bg-base)',
        borderTop: '1px solid var(--border-subtle)',
      }}>
      {MOBILE_ITEMS.map(item => (
        <MobileLink key={item.to} {...item} />
      ))}
    </nav>
  )
}

function MobileLink({ to, icon: Icon }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className="flex items-center justify-center flex-1"
      style={({ isActive }) => ({
        color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
      })}>
      <Icon size={20} />
    </NavLink>
  )
}