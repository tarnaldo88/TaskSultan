import * as React from 'react'
import { cn } from './utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

function Card(props: CardProps) {
  return <div {...props} className={cn('rounded-lg border bg-card text-card-foreground shadow-sm dark:bg-gray-900 dark:text-white dark:border-gray-700', props.className)} />
}

function CardHeader(props: CardProps) {
  return <div {...props} className={cn('p-6 border-b dark:border-gray-700', props.className)} />
}

function CardTitle(props: CardProps) {
  return <h2 {...props} className={cn('text-lg font-semibold dark:text-white', props.className)} />
}

function CardContent(props: CardProps) {
  return <div {...props} className={cn('p-6', props.className)} />
}

export { Card, CardHeader, CardTitle, CardContent }
