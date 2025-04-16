import * as React from 'react'
import { cn } from './utils'

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  onValueChange: (value: string) => void
}

function Tabs({ value, onValueChange, className, children, ...props }: TabsProps) {
  return (
    <div {...props} className={cn('w-full', className)}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { tabValue: value, setTabValue: onValueChange })
        }
        return child
      })}
    </div>
  )
}

function TabsList({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn('flex gap-2', className)}>{children}</div>
}

function TabsTrigger({ value, tabValue, setTabValue, children, className, ...props }: any) {
  const isActive = tabValue === value
  return (
    <button
      type="button"
      {...props}
      className={cn('px-4 py-2 rounded', isActive ? 'bg-primary text-white' : 'bg-muted', className)}
      onClick={() => setTabValue(value)}
    >
      {children}
    </button>
  )
}

function TabsContent({ value, tabValue, children, ...props }: any) {
  if (tabValue !== value) return null
  return <div {...props}>{children}</div>
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
