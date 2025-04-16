import * as React from 'react'
import { cn } from './utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

function Button(props: ButtonProps) {
  return (
    <button {...props} className={cn('px-4 py-2 rounded bg-primary text-white font-medium disabled:opacity-50', props.className)} />
  )
}

export { Button }
