import * as React from 'react'
import { cn } from './utils'

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  onValueChange: (value: string) => void
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  children: React.ReactNode
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  children: React.ReactNode
}

// Context for tab state
interface TabsContextType {
  tabValue: string
  setTabValue: (value: string) => void
}
const TabsContext = React.createContext<TabsContextType | undefined>(undefined)

function Tabs({ value, onValueChange, className, children, ...props }: TabsProps) {
  return (
    <TabsContext.Provider value={{ tabValue: value, setTabValue: onValueChange }}>
      <div {...props} className={cn('w-full', className)}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

function TabsList({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn('flex gap-2', className)}>{children}</div>
}

function TabsTrigger({ value, children, className, ...props }: TabsTriggerProps) {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error('TabsTrigger must be used within Tabs')
  const isActive = ctx.tabValue === value
  return (
    <button
      type="button"
      {...props}
      className={cn(
        // Distinct style for tab buttons: pill shape, smaller, muted bg, no shadow
        'px-6 py-3 rounded-full font-medium text-base transition-colors duration-150',
        isActive ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
        'focus:outline-none focus:ring-2 focus:ring-blue-400',
        className
      )}
      onClick={() => ctx.setTabValue(value)}
    >
      {children}
    </button>
  )
}
TabsTrigger.displayName = 'TabsTrigger'

function TabsContent({ value, children, ...props }: TabsContentProps) {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error('TabsContent must be used within Tabs')
  if (ctx.tabValue !== value) return null
  return <div {...props}>{children}</div>
}
TabsContent.displayName = 'TabsContent'

export { Tabs, TabsList, TabsTrigger, TabsContent }
