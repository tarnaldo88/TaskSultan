import React from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../store/authContext'
import { getProject } from '../services/project'
import { listTasks, createTask, updateTask, deleteTask } from '../services/task'
import { fetchComments, addComment, deleteComment } from '../services/comment'
import { listWorkspaceMembers } from '../services/workspace'
import { listLabels } from '../services/label'
import type { Task } from '../types/task'
import type { Comment } from '../types/comment'
import type { User } from '../types/user'
import type { Label } from '../types/label'
import { TaskComments } from './task-comments/TaskComments'
import { LabelSelect } from './LabelSelect'
import { LabelBadge } from './LabelBadge'
import { LabelManager } from './LabelManager'

function ProjectDetail() {
  const { projectId } = useParams()
  const { token } = useAuth()
  const [project, setProject] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [tasks, setTasks] = React.useState<Task[]>([])
  const [taskLoading, setTaskLoading] = React.useState(true)
  const [taskError, setTaskError] = React.useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = React.useState('')
  const [newTaskDesc, setNewTaskDesc] = React.useState('')
  const [creatingTask, setCreatingTask] = React.useState(false)
  const [subtaskParentId, setSubtaskParentId] = React.useState<string | null>(null)
  const [newTaskLabels, setNewTaskLabels] = React.useState<string[]>([])

  // --- Comments state ---
  const [commentsByTask, setCommentsByTask] = React.useState<Record<string, Comment[]>>({})
  const [commentsLoadingTaskId, setCommentsLoadingTaskId] = React.useState<string | null>(null)
  const [commentsErrorTaskId, setCommentsErrorTaskId] = React.useState<Record<string, string | null>>({})

  // --- Assignment state ---
  const [members, setMembers] = React.useState<User[]>([])
  const [membersLoading, setMembersLoading] = React.useState(false)
  const [membersError, setMembersError] = React.useState<string | null>(null)

  // --- Labels state ---
  const [labels, setLabels] = React.useState<Label[]>([])
  const [labelsLoading, setLabelsLoading] = React.useState(false)
  const [labelsError, setLabelsError] = React.useState<string | null>(null)

  // --- Project editing state ---
  const [editingProject, setEditingProject] = React.useState(false)
  const [projectName, setProjectName] = React.useState('')
  const [projectDesc, setProjectDesc] = React.useState('')
  const [projectSaveLoading, setProjectSaveLoading] = React.useState(false)
  const [projectSaveError, setProjectSaveError] = React.useState<string | null>(null)

  const handleLabelCreated = React.useCallback(() => {
    if (!project?.workspaceId || !token) return
    setLabelsLoading(true)
    setLabelsError(null)
    listLabels({ workspaceId: project.workspaceId, token })
      .then(setLabels)
      .catch(e => setLabelsError(e.message))
      .finally(() => setLabelsLoading(false))
  }, [project?.workspaceId, token])

  React.useEffect(() => {
    if (!projectId || !token) return
    setLoading(true)
    setError(null)
    getProject({ projectId, token })
      .then(setProject)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [projectId, token])

  React.useEffect(() => {
    if (!projectId || !token) return
    setTaskLoading(true)
    setTaskError(null)
    listTasks({ projectId, token })
      .then(setTasks)
      .catch(e => setTaskError(e.message))
      .finally(() => setTaskLoading(false))
  }, [projectId, token])

  React.useEffect(() => {
    async function fetchMembers() {
      if (!project?.workspaceId || !token) return
      setMembersLoading(true)
      setMembersError(null)
      try {
        const users = await listWorkspaceMembers({ workspaceId: project.workspaceId, token })
        setMembers(users)
      } catch (err: any) {
        setMembersError(err.message || 'Failed to load members')
      } finally {
        setMembersLoading(false)
      }
    }
    fetchMembers()
  }, [project?.workspaceId, token])

  React.useEffect(() => {
    if (!project?.workspaceId || !token) return
    setLabelsLoading(true)
    setLabelsError(null)
    listLabels({ workspaceId: project.workspaceId, token })
      .then(setLabels)
      .catch(e => setLabelsError(e.message))
      .finally(() => setLabelsLoading(false))
  }, [project?.workspaceId, token])

  React.useEffect(() => {
    if (project) {
      setProjectName(project.name)
      setProjectDesc(project.description || '')
    }
  }, [project])

  // Fetch comments for a given taskId
  async function fetchAndSetComments(taskId: string) {
    if (!taskId || !token) return
    setCommentsLoadingTaskId(taskId)
    setCommentsErrorTaskId(e => ({ ...e, [taskId]: null }))
    try {
      const comments = await fetchComments({ taskId, token })
      setCommentsByTask(prev => ({ ...prev, [taskId]: comments }))
    } catch (e: any) {
      setCommentsErrorTaskId(errs => ({ ...errs, [taskId]: e.message }))
    } finally {
      setCommentsLoadingTaskId(null)
    }
  }

  // Fetch comments for all tasks on load (could be optimized for visible/expanded tasks only)
  React.useEffect(() => {
    if (!token) return
    const taskIds = [projectId, ...tasks.flatMap(t => [t.id, ...(t.subtasks?.map(st => st.id) || [])])].filter(Boolean) as string[]
    taskIds.forEach(id => fetchAndSetComments(id))
  }, [projectId, token, tasks])

  async function handleAddComment(taskId: string, content: string) {
    if (!taskId || !token) return
    setCommentsLoadingTaskId(taskId)
    setCommentsErrorTaskId(e => ({ ...e, [taskId]: null }))
    try {
      const comment = await addComment({ taskId, content, token })
      setCommentsByTask(prev => ({ ...prev, [taskId]: [comment, ...(prev[taskId] || [])] }))
    } catch (e: any) {
      setCommentsErrorTaskId(errs => ({ ...errs, [taskId]: e.message }))
    } finally {
      setCommentsLoadingTaskId(null)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!token) return
    await deleteComment({ commentId, token })
    // Remove the comment from state for all tasks
    setCommentsByTask(prev => {
      const updated = { ...prev }
      for (const tid in updated) {
        updated[tid] = updated[tid].filter(c => c.id !== commentId)
      }
      return updated
    })
  }

  async function handleProjectSave() {
    if (!projectId || !token) return
    setProjectSaveLoading(true)
    setProjectSaveError(null)
    try {
      const res = await fetch(`http://localhost:4000/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: projectName.trim(), description: projectDesc.trim() })
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to update project')
      const data = await res.json()
      setProject(data.project)
      setEditingProject(false)
    } catch (err: any) {
      setProjectSaveError(err.message || 'Failed to update project')
    } finally {
      setProjectSaveLoading(false)
    }
  }

  async function handleDeleteTask(taskId: string) {
    if (!taskId || !token) {
      setTaskError('Task ID and authentication required.')
      return
    }
    setTaskError(null)
    try {
      await deleteTask({ id: taskId, token })
      setTasks(ts => ts.filter(t => t.id !== taskId))
    } catch (err: any) {
      setTaskError(err.message || 'Failed to delete task')
    }
  }

  function SubtaskTree({ subtasks, token, onUpdate }: { subtasks?: Task[]; token: string; onUpdate: (t: Task) => void }) {
    if (!subtasks || subtasks.length === 0) return null
    return (
      <ul className="ml-6 border-l border-gray-300 dark:border-gray-700 pl-4 mt-1">
        {subtasks.map(subtask => (
          <li key={subtask.id} className="mb-1">
            <TaskItem task={subtask} token={token} onUpdate={onUpdate} />
            <SubtaskTree subtasks={subtask.subtasks} token={token} onUpdate={onUpdate} />
          </li>
        ))}
      </ul>
    )
  }

  function TaskItem({ task, token, onUpdate }: { task: Task; token: string; onUpdate: (t: Task) => void }) {
    const [editing, setEditing] = React.useState(false)
    const [title, setTitle] = React.useState(task.title)
    const [description, setDescription] = React.useState(task.description || '')
    const [saving, setSaving] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [subtaskTitle, setSubtaskTitle] = React.useState('')
    const [subtaskDesc, setSubtaskDesc] = React.useState('')
    const [creatingSubtask, setCreatingSubtask] = React.useState(false)
    const [subtaskError, setSubtaskError] = React.useState<string | null>(null)
    const [editLabels, setEditLabels] = React.useState<string[]>(task.labels?.map(l => l.id) || [])

    const [showLabelSelect, setShowLabelSelect] = React.useState(false)
    const labelSelectRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      function handleClick(e: MouseEvent) {
        if (showLabelSelect && labelSelectRef.current && !labelSelectRef.current.contains(e.target as Node))
          setShowLabelSelect(false)
      }
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }, [showLabelSelect])

    function handleQuickLabelChange(ids: string[]) {
      setEditLabels(ids)
      updateTask({ id: task.id, token, labels: ids })
        .then(onUpdate)
        .finally(() => setShowLabelSelect(false))
    }

    async function handleCreateSubtask() {
      setSubtaskError(null)
      if (!projectId || !token || !subtaskTitle.trim()) {
        setSubtaskError('Subtask title and authentication required.')
        return
      }
      setCreatingSubtask(true)
      try {
        const subtask = await createTask({ projectId, title: subtaskTitle.trim(), description: subtaskDesc.trim(), parentTaskId: task.id, token })
        onUpdate({ ...task, subtasks: [...(task.subtasks || []), subtask] })
        setSubtaskTitle('')
        setSubtaskDesc('')
        setSubtaskParentId(null)
      } catch (err: any) {
        setSubtaskError(err.message || 'Failed to create subtask')
      } finally {
        setCreatingSubtask(false)
      }
    }

    function startEdit() {
      setEditing(true)
      setTitle(task.title)
      setDescription(task.description || '')
      setError(null)
    }

    async function saveEdit() {
      setSaving(true)
      setError(null)
      try {
        const updated = await updateTask({ id: task.id, token, title: title.trim(), description: description.trim(), labels: editLabels })
        onUpdate(updated)
        setEditing(false)
      } catch (err: any) {
        setError(err.message || 'Failed to update task')
      } finally {
        setSaving(false)
      }
    }

    function handleSubtaskUpdate(updatedSubtask: Task) {
      onUpdate({
        ...task,
        subtasks: (task.subtasks || []).map(st => st.id === updatedSubtask.id ? updatedSubtask : st)
      })
    }

    const isAddingSubtask = subtaskParentId === task.id

    if (editing) {
      return (
        <li className="text-sm border border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-900 rounded-xl shadow-sm py-4 px-8 mb-6 flex flex-col gap-2 transition-all max-w-3xl mx-auto w-full box-border">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="px-2 py-1 rounded border text-sm dark:bg-gray-900 dark:text-white dark:border-gray-700 w-32"
            disabled={saving}
          />
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="px-2 py-1 rounded border text-sm dark:bg-gray-900 dark:text-white dark:border-gray-700 w-full min-h-[80px] resize-y"
            disabled={saving}
            placeholder="Description (optional)"
          />
          <LabelSelect
            labels={labels}
            selected={editLabels}
            onChange={setEditLabels}
            disabled={saving || labelsLoading}
          />
          <button
            type="button"
            className="px-2 py-1 rounded bg-green-600 text-white text-xs font-semibold disabled:opacity-50"
            disabled={saving || !title.trim()}
            onClick={saveEdit}
          >
            Save
          </button>
          <button
            type="button"
            className="px-2 py-1 rounded bg-gray-300 text-gray-800 text-xs font-semibold ml-1"
            disabled={saving}
            onClick={() => setEditing(false)}
          >
            Cancel
          </button>
          {error && <span className="text-xs text-red-500 ml-2">{error}</span>}
        </li>
      )
    }

    return (
      <div
        className="text-sm border border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-900 rounded-xl shadow-sm py-4 px-8 mb-6 flex flex-col gap-2 transition-all max-w-3xl mx-auto w-full box-border"
        style={{ width: '100%', boxSizing: 'content-box' }}
      >
        {/* Task Title on top */}
        <div className="font-semibold text-lg md:text-xl text-purple-500/90 drop-shadow-sm tracking-tight mb-1">
          {task.title}
        </div>
        {/* Row with labels and controls */}
        <div className="flex items-center gap-4 mb-2 w-full">
          {Array.isArray(task.labels) && task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 items-center">
              {task.labels.map(label => (
                <LabelBadge key={label.id} label={label} />
              ))}
            </div>
          )}
          <button
            type="button"
            className="ml-1 px-2 py-1 rounded bg-purple-200 hover:bg-purple-400 text-purple-900 text-xs font-bold"
            title="Quick add/remove labels"
            onClick={() => setShowLabelSelect(v => !v)}
          >
            +
          </button>
          {showLabelSelect && (
            <div ref={labelSelectRef} className="absolute z-50 mt-8 ml-2 bg-white dark:bg-gray-900 border border-purple-300 dark:border-purple-700 rounded shadow-lg p-2">
              <LabelSelect
                labels={labels}
                selected={editLabels}
                onChange={handleQuickLabelChange}
                disabled={saving || labelsLoading}
              />
            </div>
          )}
          {/* Status Dropdown */}
          <select
            className="ml-4 px-2 py-1 rounded border text-xs dark:bg-gray-900 dark:text-white dark:border-gray-700"
            value={task.status}
            onChange={async e => {
              try {
                const updated = await updateTask({ id: task.id, token, status: e.target.value })
                onUpdate(updated)
              } catch (err: any) {
                setError(err.message || 'Failed to update status')
              }
            }}
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          {/* Assigned User Display */}
          {task.assignee && (
            <span className="ml-4 flex items-center gap-1 text-xs">
              {task.assignee.avatarUrl && (
                <img
                  src={task.assignee.avatarUrl}
                  alt={task.assignee.name}
                  className="w-6 h-6 rounded-full object-cover border border-gray-300 dark:border-gray-700"
                />
              )}
              <span className="font-medium text-gray-700 dark:text-gray-200">{task.assignee.name}</span>
            </span>
          )}
          {/* Assignment Dropdown */}
          <select
            className="ml-4 px-2 py-1 rounded border text-xs dark:bg-gray-900 dark:text-white dark:border-gray-700"
            value={task.assignee?.id || undefined}
            onChange={async e => {
              try {
                const updated = await updateTask({ id: task.id, token, assigneeId: e.target.value || undefined })
                onUpdate(updated)
              } catch (err: any) {
                setError(err.message || 'Failed to assign user')
              }
            }}
            disabled={membersLoading}
          >
            <option value="">Unassigned</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} {m.email ? `(${m.email})` : ''}
              </option>
            ))}
          </select>
          {/* Delete Task Button */}
          <button
            type="button"
            className="ml-2 px-2 py-1 rounded bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition"
            onClick={() => handleDeleteTask(task.id)}
            disabled={saving}
          >
            Delete
          </button>
          {/* End Delete Task Button */}
          <button
            type="button"
            className="ml-2 px-2 py-1 rounded bg-yellow-500 text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition"
            onClick={startEdit}
          >
            Edit
          </button>
          <button
            type="button"
            className="ml-2 px-1 py-1 rounded bg-purple-500 text-white text-xs font-semibold hover:bg-green-600 transition"
            onClick={() => setSubtaskParentId(task.id)}
          >
            + Subtask
          </button>
          <button
            type="button"
            className="ml-2 px-2 py-1 rounded bg-blue-500 text-white text-xs font-semibold hover:bg-purple-600 transition"
            onClick={() => setEditing(true)}
            aria-label="Edit Task"
          >
            Edit
          </button>
        </div>
        {task.description && (
          <div className="text-gray-700 dark:text-gray-300 text-sm mb-2 whitespace-pre-line">
            {task.description}
          </div>
        )}
        {isAddingSubtask && (
          <form
            className="flex flex-col gap-1 mt-2 ml-6"
            onSubmit={e => {
              e.preventDefault()
              handleCreateSubtask()
            }}
            autoComplete="off"
          >
            <input
              type="text"
              value={subtaskTitle}
              onChange={e => setSubtaskTitle(e.target.value)}
              placeholder="Subtask title"
              className="px-2 py-1 rounded border text-xs dark:bg-gray-900 dark:text-white dark:border-gray-700"
              disabled={creatingSubtask}
            />
            <input
              type="text"
              value={subtaskDesc}
              onChange={e => setSubtaskDesc(e.target.value)}
              placeholder="Description (optional)"
              className="px-2 py-1 rounded border text-xs dark:bg-gray-900 dark:text-white dark:border-gray-700"
              disabled={creatingSubtask}
            />
            <div className="flex gap-2 mt-1">
              <button
                type="submit"
                className="px-2 py-1 rounded bg-blue-600 text-white text-xs font-semibold disabled:opacity-50"
                disabled={creatingSubtask || !subtaskTitle.trim()}
              >
                {creatingSubtask ? 'Creating...' : 'Add Subtask'}
              </button>
              <button
                type="button"
                className="px-2 py-1 rounded bg-gray-400 text-white text-xs font-semibold"
                onClick={() => {
                  setSubtaskParentId(null)
                  setSubtaskTitle('')
                  setSubtaskDesc('')
                }}
              >
                Cancel
              </button>
            </div>
            {subtaskError && <span className="text-xs text-red-500 mt-1">{subtaskError}</span>}
          </form>
        )}
        <SubtaskTree subtasks={task.subtasks} token={token} onUpdate={handleSubtaskUpdate} />
        {error && <span className="text-xs text-red-500 ml-2">{error}</span>}
      </div>
    )
  }

  if (!projectId) return <div className="p-8 text-red-500">Invalid project URL: missing projectId.</div>

  if (loading) return <div className="p-8">Loading project...</div>
  if (error) return <div className="text-red-500 p-8">{error}</div>
  if (!project) return <div className="p-8">Project not found.</div>

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault()
    setTaskError(null)
    if (!projectId || !token || !newTaskTitle.trim()) {
      setTaskError('Task title and authentication required.')
      return
    }
    setCreatingTask(true)
    createTask({ projectId, title: newTaskTitle.trim(), description: newTaskDesc.trim(), token, labels: newTaskLabels })
      .then(task => {
        setTasks(t => [...t, task])
        setNewTaskTitle('')
        setNewTaskDesc('')
        setNewTaskLabels([])
      })
      .catch(err => setTaskError(err.message || 'Failed to create task'))
      .finally(() => setCreatingTask(false))
  }

  return (
    <div className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white">
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Project Info UI */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 mb-8 ">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-3xl font-bold text-purple-700 tracking-tight drop-shadow-lg flex-1">
              {editingProject ? (
                <input
                  type="text"
                  className="px-2 py-1 rounded border text-lg font-bold dark:bg-gray-900 dark:text-white dark:border-gray-700 w-64"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  disabled={projectSaveLoading}
                />
              ) : (
                project?.name || 'Project'
              )}
            </h1>
          </div>
          {project?.description && !editingProject && (
            <div className="text-gray-700 dark:text-gray-300 text-base mb-4 whitespace-pre-line">
              {project.description}
            </div>
          )}
          <div className="flex items-center gap-2 mb-4">
            <button
              type="button"
              className="px-2 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white font-semibold disabled:opacity-50 shadow transition-all"
              onClick={() => setEditingProject(e => !e)}
              disabled={projectSaveLoading}
            >
              {editingProject ? 'Cancel' : 'Edit'}
            </button>
            {editingProject && (
              <button
                type="button"
                className="ml-2 px-2 py-1 rounded bg-green-600 hover:bg-green-700 text-white font-semibold disabled:opacity-50 shadow transition-all"
                onClick={handleProjectSave}
                disabled={projectSaveLoading || !projectName.trim()}
              >
                {projectSaveLoading ? 'Saving...' : 'Save'}
              </button>
            )}
          </div>
          {editingProject && (
            <textarea
              className="block w-full mt-2 px-2 py-1 rounded border text-base dark:bg-gray-900 dark:text-white dark:border-gray-700"
              rows={2}
              value={projectDesc}
              onChange={e => setProjectDesc(e.target.value)}
              disabled={projectSaveLoading}
            />
          )}
          {projectSaveError && <div className="text-red-500 text-sm mt-2">{projectSaveError}</div>}
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 mb-12 border border-purple-200 dark:border-purple-700">
          <h2 className="text-xl font-semibold mb-2">Tasks</h2>
          {project?.workspaceId && token && (
            <LabelManager
              workspaceId={project.workspaceId}
              token={token}
              onLabelCreated={handleLabelCreated}
            />
          )}
          <form onSubmit={handleCreateTask} className="flex flex-col gap-2 mb-8">
            <input
              type="text"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              placeholder="Task title"
              className="px-2 py-1 rounded border dark:bg-gray-900 dark:text-white dark:border-gray-700"
              disabled={creatingTask}
            />
            <input
              type="text"
              value={newTaskDesc}
              onChange={e => setNewTaskDesc(e.target.value)}
              placeholder="Description (optional)"
              className="px-2 py-1 rounded border dark:bg-gray-900 dark:text-white dark:border-gray-700"
              disabled={creatingTask}
            />
            <LabelSelect
              labels={labels}
              selected={newTaskLabels}
              onChange={setNewTaskLabels}
              disabled={creatingTask || labelsLoading}
            />
            <button
              type="submit"
              className="px-2 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white font-semibold disabled:opacity-50 shadow transition-all"
              disabled={creatingTask || !newTaskTitle.trim()}
            >
              {creatingTask ? 'Creating...' : 'Add Task'}
            </button>
            {taskError && <div className="text-red-500 text-sm mb-2">{taskError}</div>}
          </form>
        </div>
        <hr className="border-t-2 border-purple-300 dark:border-purple-700 mb-10" />
        {taskLoading ? (
          <div className="text-gray-500">Loading tasks...</div>
        ) : (
          <>
            <ul className="space-y-1">
              {tasks.filter(task => task.status !== 'done').length === 0 && (
                <li className="text-sm text-gray-500">No tasks found.</li>
              )}
              {tasks.filter(task => task.status !== 'done').map(task => (
                <div key={task.id} className="mb-6">
                  <TaskItem
                    task={{
                      ...task,
                      status: task.status ?? 'todo',
                      description: task.description ?? ''
                    }}
                    token={token ?? ''}
                    onUpdate={updated => setTasks(ts => ts.map(t => t.id === updated?.id ? updated : t))}
                  />
                  <TaskComments
                    taskId={task.id}
                    comments={commentsByTask[task.id] || []}
                    onAddComment={content => handleAddComment(task.id, content)}
                    onDeleteComment={handleDeleteComment}
                    isLoading={commentsLoadingTaskId === task.id}
                  />
                  {commentsErrorTaskId[task.id] && <div className="text-red-500 text-sm mt-2">{commentsErrorTaskId[task.id]}</div>}
                  {/* Add 40px space below comments and before next task */}
                  <div style={{ height: 40 }} />
                </div>
              ))}
            </ul>
            <div className="mt-8">
              <h3 className="text-3xl md:text-4xl font-bold mb-6 text-green-700 tracking-tight drop-shadow-lg">Done</h3>
              <ul className="space-y-1">
                {tasks.filter(task => task.status === 'done').length === 0 && (
                  <li className="text-sm text-gray-500">No done tasks.</li>
                )}
                {tasks.filter(task => task.status === 'done').map(task => (
                  <div key={task.id} className="mb-6">
                    <TaskItem
                      task={{
                        ...task,
                        status: task.status ?? 'done',
                        description: task.description ?? ''
                      }}
                      token={token ?? ''}
                      onUpdate={updated => setTasks(ts => ts.map(t => t.id === updated?.id ? updated : t))}
                    />
                    <TaskComments
                      taskId={task.id}
                      comments={commentsByTask[task.id] || []}
                      onAddComment={content => handleAddComment(task.id, content)}
                      onDeleteComment={handleDeleteComment}
                      isLoading={commentsLoadingTaskId === task.id}
                    />
                    {commentsErrorTaskId[task.id] && <div className="text-red-500 text-sm mt-2">{commentsErrorTaskId[task.id]}</div>}
                    {/* Add 10px space below comments and before next task */}
                    <div style={{ height: 10 }} />
                  </div>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export { ProjectDetail }
