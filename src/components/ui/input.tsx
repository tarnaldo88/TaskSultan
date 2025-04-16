import * as React from 'react'
import { cn } from './utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

function Input(props: InputProps) {
  return (
    <input {...props} className={cn('w-full px-3 py-2 rounded border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary', props.className)} />
  )
}

export { Input }
