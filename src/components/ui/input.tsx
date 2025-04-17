import * as React from 'react'
import { cn } from './utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
  return (
    <input
      {...props}
      ref={ref}
      className={cn(
        'w-full px-8 py-6 rounded-2xl border border-input bg-background text-white placeholder:text-gray-400 text-3xl md:text-4xl focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-400 dark:border-gray-700',
        props.className
      )}
    />
  )
})

export { Input }
