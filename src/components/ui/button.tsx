import * as React from 'react'
import { cn } from './utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

function Button(props: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        'px-8 py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-lg md:text-xl shadow-lg shadow-purple-900/30 transition-all duration-200 border-0 focus:ring-2 focus:ring-purple-400 focus:outline-none disabled:opacity-50 dark:bg-purple-500 dark:hover:bg-purple-700 dark:text-white',
        props.className
      )}
    />
  )
}

export { Button }
