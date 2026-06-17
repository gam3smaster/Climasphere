import { useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'

export function AppShell({ children }) {
  const mainRef = useRef(null)
  const { pathname } = useLocation()

// So scroll position doesn't carry over to another page
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0)
  }, [pathname])

  return (
    <div
      className="flex flex-col lg:flex-row h-screen overflow-hidden"
      style={{ background: 'var(--bg-void)' }}
    >
      <Sidebar />

      <main ref={mainRef} className="flex-1 overflow-y-auto min-w-0">
        {children}
      </main>

      <MobileNav />
    </div>
  )
}