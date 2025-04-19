import * as React from 'react'
import type { Label } from '../types/label'

interface LabelBadgeProps {
  label: Label
}

export function LabelBadge({ label }: LabelBadgeProps) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold mr-1"
      style={{ background: label.color, color: '#fff', border: `1px solid ${label.color}` }}
      title={label.name}
    >
      {label.name}
    </span>
  )
}
