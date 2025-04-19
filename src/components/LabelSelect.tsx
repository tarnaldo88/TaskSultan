import * as React from 'react'
import type { Label } from '../types/label'

interface LabelSelectProps {
  labels: Label[]
  selected: string[]
  onChange: (ids: string[]) => void
  disabled?: boolean
}

export function LabelSelect({ labels, selected, onChange, disabled }: LabelSelectProps) {
  function handleToggle(id: string) {
    if (selected.includes(id)) onChange(selected.filter(lid => lid !== id))
    else onChange([...selected, id])
  }

  if (!labels.length) return null

  return (
    <div className="flex flex-wrap gap-2 my-2">
      {labels.map(label => (
        <button
          key={label.id}
          type="button"
          disabled={disabled}
          className={`px-2 py-1 rounded text-xs font-medium border flex items-center gap-1 ${selected.includes(label.id) ? 'bg-purple-600 text-white border-purple-700' : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200'}`}
          style={{ borderColor: label.color, backgroundColor: selected.includes(label.id) ? label.color : undefined }}
          onClick={() => handleToggle(label.id)}
        >
          <span style={{ background: label.color }} className="inline-block w-3 h-3 rounded-full mr-1"></span>
          {label.name}
        </button>
      ))}
    </div>
  )
}
