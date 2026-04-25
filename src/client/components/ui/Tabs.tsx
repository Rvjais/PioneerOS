'use client'

import { ReactNode, useState, createContext, useContext } from 'react'
import { cn } from '@/shared/utils/cn'

interface TabsContextValue {
  activeTab: string
  setActiveTab: (tab: string) => void
  variant: 'default' | 'pills' | 'underline' | 'enclosed'
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider')
  }
  return context
}

interface TabsProps {
  defaultValue: string
  value?: string
  onValueChange?: (value: string) => void
  children: ReactNode
  variant?: 'default' | 'pills' | 'underline' | 'enclosed'
  className?: string
}

/**
 * Tabs container component
 */
export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  variant = 'default',
  className,
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const activeTab = value !== undefined ? value : internalValue

  const setActiveTab = (tab: string) => {
    if (value === undefined) {
      setInternalValue(tab)
    }
    onValueChange?.(tab)
  }

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, variant }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

interface TabsListProps {
  children: ReactNode
  className?: string
}

/**
 * Container for tab triggers
 */
export function TabsList({ children, className }: TabsListProps) {
  const { variant } = useTabsContext()

  const variants = {
    default: 'flex gap-1 bg-slate-800/50 dark:bg-slate-800 p-1 rounded-lg',
    pills: 'flex gap-2',
    underline: 'flex gap-4 border-b border-white/10 dark:border-slate-700',
    enclosed: 'flex gap-1 bg-slate-800/50 dark:bg-slate-800 p-1 rounded-t-lg border-b-0',
  }

  return (
    <div className={cn(variants[variant], className)} role="tablist">
      {children}
    </div>
  )
}

interface TabsTriggerProps {
  value: string
  children: ReactNode
  disabled?: boolean
  className?: string
  icon?: ReactNode
  badge?: string | number
}

/**
 * Tab trigger button
 */
export function TabsTrigger({
  value,
  children,
  disabled,
  className,
  icon,
  badge,
}: TabsTriggerProps) {
  const { activeTab, setActiveTab, variant } = useTabsContext()
  const isActive = activeTab === value

  const baseClasses = 'relative inline-flex items-center gap-2 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900'

  const variants = {
    default: cn(
      'px-4 py-2 text-sm rounded-md',
      isActive
        ? 'glass-card dark:bg-slate-700 text-white dark:text-white shadow-none'
        : 'text-slate-300 dark:text-slate-400 hover:text-white dark:hover:text-white'
    ),
    pills: cn(
      'px-4 py-2 text-sm rounded-full',
      isActive
        ? 'bg-blue-600 text-white'
        : 'bg-slate-800/50 dark:bg-slate-800 text-slate-300 dark:text-slate-400 hover:bg-white/10 dark:hover:bg-slate-700'
    ),
    underline: cn(
      'px-1 pb-3 text-sm border-b-2 -mb-px',
      isActive
        ? 'border-blue-600 text-blue-400 dark:text-blue-400'
        : 'border-transparent text-slate-400 dark:text-slate-400 hover:text-slate-200 dark:hover:text-slate-300 hover:border-white/20 dark:hover:border-slate-600'
    ),
    enclosed: cn(
      'px-4 py-2 text-sm rounded-t-md',
      isActive
        ? 'glass-card dark:bg-slate-900 text-white dark:text-white border border-white/10 dark:border-slate-700 border-b-white dark:border-b-slate-900'
        : 'text-slate-300 dark:text-slate-400 hover:text-white dark:hover:text-white'
    ),
  }

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${value}`}
      disabled={disabled}
      onClick={() => setActiveTab(value)}
      className={cn(
        baseClasses,
        variants[variant],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {icon}
      {children}
      {badge !== undefined && (
        <span className={cn(
          'ml-1 px-1.5 py-0.5 text-xs rounded-full',
          isActive
            ? 'bg-blue-500/20 text-blue-500'
            : 'bg-white/10 dark:bg-slate-700 text-slate-300 dark:text-slate-400'
        )}>
          {badge}
        </span>
      )}
    </button>
  )
}

interface TabsContentProps {
  value: string
  children: ReactNode
  className?: string
  forceMount?: boolean
}

/**
 * Tab content panel
 */
export function TabsContent({
  value,
  children,
  className,
  forceMount = false,
}: TabsContentProps) {
  const { activeTab } = useTabsContext()
  const isActive = activeTab === value

  if (!isActive && !forceMount) {
    return null
  }

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
      hidden={!isActive}
      className={cn('mt-4', className)}
    >
      {children}
    </div>
  )
}

// Simple tabs component for quick use
interface SimpleTab {
  id: string
  label: string
  content: ReactNode
  icon?: ReactNode
  badge?: string | number
  disabled?: boolean
}

interface SimpleTabsProps {
  tabs: SimpleTab[]
  defaultTab?: string
  variant?: 'default' | 'pills' | 'underline' | 'enclosed'
  className?: string
  tabListClassName?: string
  tabContentClassName?: string
}

/**
 * Simple tabs component - all-in-one solution
 */
export function SimpleTabs({
  tabs,
  defaultTab,
  variant = 'default',
  className,
  tabListClassName,
  tabContentClassName,
}: SimpleTabsProps) {
  const defaultValue = defaultTab || tabs[0]?.id || ''

  return (
    <Tabs defaultValue={defaultValue} variant={variant} className={className}>
      <TabsList className={tabListClassName}>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            icon={tab.icon}
            badge={tab.badge}
            disabled={tab.disabled}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className={tabContentClassName}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}

export default Tabs
