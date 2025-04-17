import * as React from 'react'
import { cn } from './utils'

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  onValueChange: (value: string) => void
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  tabValue?: string
  setTabValue?: (value: string) => void
  children: React.ReactNode
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  tabValue?: string
  children: React.ReactNode
}

function Tabs({ value, onValueChange, className, children, ...props }: TabsProps) {
  return (
    <div {...props} className={cn('w-full', className)}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child) &&
          (child.type === TabsTrigger || child.type === TabsContent))
          return React.cloneElement(child, { tabValue: value, setTabValue: onValueChange })
        return child
      })}
    </div>
  )
}

function TabsList({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn('flex gap-2', className)}>{children}</div>
}

function TabsTrigger({ value, tabValue, setTabValue, children, className, ...props }: TabsTriggerProps) {
  const isActive = tabValue === value
  // Remove tabValue and setTabValue from props before spreading to button
  const { tabValue: _tabValue, setTabValue: _setTabValue, ...rest } = props as any
  return (
    <button
      type="button"
      {...rest}
      className={cn('px-4 py-2 rounded', isActive ? 'bg-primary text-white' : 'bg-muted', className)}
      onClick={() => setTabValue && setTabValue(value)}
    >
      {children}
    </button>
  )
}

function TabsContent({ value, tabValue, children, ...props }: TabsContentProps) {
  if (tabValue !== value) return null
  // Remove tabValue and setTabValue from props before spreading to div
  const { tabValue: _tabValue, setTabValue: _setTabValue, ...rest } = props as any
  return <div {...rest}>{children}</div>
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
