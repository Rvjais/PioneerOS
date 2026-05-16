'use client'

import { useMobileNav } from './MobileNavContext'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface MobileSidebarProps {
  children: React.ReactNode
}

export function MobileSidebar({ children }: MobileSidebarProps) {
  const { isOpen, close } = useMobileNav()
  const pathname = usePathname()

  // Close sidebar when route changes
  useEffect(() => {
    close()
  }, [pathname, close])

  // Prevent scrolling when mobile nav is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={close}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </aside>
    </>
  )
}
