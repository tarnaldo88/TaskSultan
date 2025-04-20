import React from 'react'
import type { Comment } from '../../types/comment'

interface TaskCommentsProps {
  taskId: string
  comments: Comment[]
  onAddComment: (content: string) => void
  onDeleteComment?: (commentId: string) => void
  isLoading?: boolean
}

function TaskComments({ taskId, comments, onAddComment, onDeleteComment, isLoading }: TaskCommentsProps) {
  const [value, setValue] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!value.trim()) return
    setSubmitting(true)
    Promise.resolve(onAddComment(value.trim()))
      .finally(() => {
        setValue('')
        setSubmitting(false)
      })
  }

  return (
    <div className="mt-6">
      <h3 className="font-semibold mb-2">Comments</h3>
      <ul className="space-y-3 mb-4">
        {comments.length === 0 && <li className="text-gray-400 text-sm">No comments yet.</li>}
        {comments.map(comment => (
          <li key={comment.id} className="bg-gray-100 dark:bg-gray-800 rounded p-3 relative">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{comment.authorName}</span>
              <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
              {onDeleteComment && (
                <button
                  type="button"
                  className="ml-2 px-2 py-1 rounded bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition absolute right-2 top-2"
                  onClick={() => {
                    setDeletingId(comment.id)
                    Promise.resolve(onDeleteComment(comment.id)).finally(() => setDeletingId(null))
                  }}
                  disabled={deletingId === comment.id}
                  aria-label="Delete Comment"
                >
                  {deletingId === comment.id ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </div>
            <div className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-line">{comment.content}</div>
          </li>
        ))}
      </ul>
      <form className="flex gap-2" onSubmit={handleSubmit}>
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 px-3 py-2 rounded border dark:bg-gray-900 dark:text-white dark:border-gray-700"
          disabled={submitting || isLoading}
        />
        <button
          type="submit"
          className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white font-semibold disabled:opacity-50 shadow-lg shadow-purple-900/30 transition-all"
          disabled={submitting || isLoading || !value.trim()}
        >
          {submitting ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  )
}

export { TaskComments }
export type { TaskCommentsProps }
