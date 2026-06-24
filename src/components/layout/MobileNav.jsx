import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { MoreHorizontal } from 'lucide-react'
import { X } from 'lucide-react'
import { NAV, NAV_BOTTOM } from './Sidebar'

const PRIMARY_ROUTES  = ['/', '/forecast', '/air', '/favs', '/settings' ]
const OVERFLOW_ROUTES = ['/maps', '/radar', '/alerts', '/history', '']

const ALL_ITEMS = [...NAV, ...NAV_BOTTOM]

const PRIMARY_ITEMS  = PRIMARY_ROUTES.map(to => ALL_ITEMS.find(i => i.to === to)).filter(Boolean)
const OVERFLOW_ITEMS = OVERFLOW_ROUTES.map(to => ALL_ITEMS.find(i => i.to === to)).filter(Boolean)

export function MobileNav() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => { setSheetOpen(false) }, [pathname])

  const overflowActive = OVERFLOW_ITEMS.some(i => i.to === pathname)

  return (
    <>
      {/* Backdrop */}
      {sheetOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSheetOpen(false)}
        />
      )}

      {/* Bottom sheet */}
      <div
        className="fixed left-0 right-0 z-50 lg:hidden rounded-t-3xl transition-transform duration-300"
        style={{
          bottom: 'calc(56px + env(safe-area-inset-bottom))',
          background: 'var(--bg-base)',
          border: '1px solid var(--border-default)',
          borderBottom: 'none',
          transform: sheetOpen ? 'translateY(0)' : 'translateY(110%)',
        }}
      >
        <div
          className="flex items-center justify-between px-5 pt-5 pb-3"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <p
            className="text-xs font-data"
            style={{ color: 'var(--text-ghost)', letterSpacing: '1.5px' }}
          >
            MORE
          </p>
          <button onClick={() => setSheetOpen(false)}>
            <X size={16} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        <div className="p-3 pb-5">
          {OVERFLOW_ITEMS.map(item => (
            <SheetLink key={item.to} {...item} />
          ))}
        </div>
      </div>

      {/* Nav bar */}
      <nav
        className="flex lg:hidden items-stretch justify-around flex-shrink-0 relative z-50"
        style={{
          height: 'calc(56px + env(safe-area-inset-bottom))',
          paddingBottom: 'env(safe-area-inset-bottom)',
          background: 'var(--bg-base)',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        {PRIMARY_ITEMS.map(item => (
          <MobileLink key={item.to} {...item} />
        ))}

        <button
          className="flex items-center justify-center flex-1"
          onClick={() => setSheetOpen(v => !v)}
          style={{ color: overflowActive || sheetOpen ? 'var(--accent-primary)' : 'var(--text-muted)' }}
        >
          <MoreHorizontal size={20} />
        </button>
      </nav>
    </>
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
      })}
    >
      <Icon size={20} />
    </NavLink>
  )
}

function SheetLink({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl w-full"
      style={({ isActive }) => ({
        background: isActive ? 'var(--bg-elevated)' : 'transparent',
        color: isActive ? 'var(--accent-primary)' : 'var(--text-primary)',
      })}
    >
      <Icon size={18} />
      <span className="text-sm">{label}</span>
    </NavLink>
  )
}