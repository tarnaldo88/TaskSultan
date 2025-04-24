import * as React from 'react'
import type { Label } from '../types/label'
import { listLabels } from '../services/label'

interface LabelManagerProps {
  workspaceId: string
  token: string
  onLabelCreated?: () => void
}

export function LabelManager({ workspaceId, token, onLabelCreated }: LabelManagerProps) {
  const [labels, setLabels] = React.useState<Label[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [name, setName] = React.useState('')
  const [color, setColor] = React.useState('#6d28d9')
  const [creating, setCreating] = React.useState(false)

  async function fetchLabels() {
    setLoading(true)
    setError(null)
    try {
      const res = await listLabels({ workspaceId, token })
      setLabels(res)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { fetchLabels() }, [workspaceId, token])

  async function handleCreateLabel(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setError(null)
    try {
      const res = await fetch(`http://localhost:4000/api/workspaces/${workspaceId}/labels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, color })
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to create label')
      setName('')
      setColor('#6d28d9')
      fetchLabels()
      if (onLabelCreated) onLabelCreated()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setCreating(false)
    }
  }

  // TODO: Add label editing/deleting if needed

  return (
    <div className="mb-6">
      <h3 className="font-bold mb-2 text-purple-700">Manage Labels</h3>
      <form onSubmit={handleCreateLabel} className="flex gap-2 mb-2">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Label name"
          className="px-2 py-1 rounded border dark:bg-gray-900 dark:text-white dark:border-gray-700"
          required
          disabled={creating}
        />
        <input
          type="color"
          value={color}
          onChange={e => setColor(e.target.value)}
          className="w-10 h-10 p-0 border-none"
          disabled={creating}
        />
        <button
          type="submit"
          className="px-3 py-1 rounded bg-purple-600 text-white font-semibold disabled:opacity-50"
          disabled={creating || !name.trim()}
        >
          {creating ? 'Adding...' : 'Add'}
        </button>
      </form>
      {error && <div className="text-red-500 text-xs mb-2">{error}</div>}
      <div className="flex flex-wrap gap-2 mt-2">
        {labels.map(label => (
          <span key={label.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold" style={{ background: label.color, color: '#fff', border: `1px solid ${label.color}` }}>
            {label.name}
          </span>
        ))}
      </div>
    </div>
  )
}
