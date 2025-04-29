import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom'
import { AuthForm } from './components/auth/AuthForm'
import { ProjectDetail } from './components/ProjectDetail'
import { useAuth } from './store/authContext'
import { listProjects, createProject, getProject } from './services/project'
import { createWorkspace } from './services/workspace'
import type { Project } from './types/project'
import type { Workspace } from './types/workspace'
import { WorkspaceProvider, useWorkspace } from './store/workspaceContext'

function Dashboard() {
  const { user, token, logout, fetchMe } = useAuth()
  const { workspaces, activeWorkspaceId, setActiveWorkspaceId, reloadWorkspaces } = useWorkspace()
  const [creating, setCreating] = React.useState(false)
  const [newWorkspace, setNewWorkspace] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const navigate = useNavigate()

  async function handleCreateWorkspace(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!newWorkspace.trim() || !token) {
      setError('Workspace name and authentication required.')
      return
    }
    setCreating(true)
    try {
      const ws = await createWorkspace({ name: newWorkspace.trim(), token })
      await reloadWorkspaces()
      await fetchMe()
      setNewWorkspace('')
      setActiveWorkspaceId(ws.id)
    } catch (err: any) {
      setError(err.message || 'Failed to create workspace')
      console.error('Workspace creation error:', err)
      alert(`Workspace creation error: ${err.message || err}`)
    } finally {
      setCreating(false)
    }
  }

  function handleWorkspaceSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    setActiveWorkspaceId(e.target.value)
  }

  // Debug: log workspaces on every render
  console.log('Dashboard render workspaces:', workspaces)

  return (
    <div className="min-h-screen flex flex-col bg-white text-black dark:bg-gray-900 dark:text-white">
      <div className="flex flex-col items-center justify-center flex-1">
        <div className="bg-white dark:bg-gray-800 rounded shadow p-8 w-full max-w-md mt-8">
          {/* Dashboard header with logo and title */}
          <div className="flex items-center gap-3 mb-4">
            <img
              src="/img/LogoSultan.png"
              alt="TaskSultan Logo"
              width={50}
              height={50}
              className="h-[50px] w-[50px] object-contain drop-shadow order-1"
              draggable="false"
            />
            <h1 className="text-2xl font-bold order-2">Task Sultan</h1>
          </div>
          <p className="mb-4">Welcome, <span className="font-semibold">{user?.name}</span>!</p>
          <form className="flex gap-2 mb-4" onSubmit={handleCreateWorkspace}>
            <input
              type="text"
              value={newWorkspace}
              onChange={e => setNewWorkspace(e.target.value)}
              placeholder="New workspace name"
              className="px-3 py-2 rounded border dark:bg-gray-900 dark:text-white dark:border-gray-700"
              disabled={creating}
            />
            <button
              type="submit"
              className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white font-semibold disabled:opacity-50 shadow-lg shadow-purple-900/30 transition-all"
              disabled={creating || !newWorkspace.trim()}
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </form>
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          <div className="mb-2 font-semibold">Your Workspaces:</div>
          <ul className="space-y-1 mb-4">
            {workspaces.length === 0 && <li className="text-sm text-gray-500">No workspaces found.</li>}
            {workspaces.map(ws => (
              <li key={ws.id} className={`text-sm cursor-pointer rounded px-2 py-1 transition-colors ${ws.id === activeWorkspaceId ? 'bg-purple-100 dark:bg-purple-900/40 font-bold text-purple-700 dark:text-purple-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                onClick={() => {
                  setActiveWorkspaceId(ws.id);
                  navigate('/projects')
                }}
                aria-current={ws.id === activeWorkspaceId ? 'true' : undefined}
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setActiveWorkspaceId(ws.id) }}
                role="button"
              >
                {ws.name}
                {ws.id === activeWorkspaceId && <span className="ml-2 text-xs text-purple-500">(Current)</span>}
              </li>
            ))}
          </ul>
          <button className="px-4 py-2 rounded bg-primary text-white" onClick={logout}>Logout</button>
        </div>
      </div>
    </div>
  )
}

function Projects() {
  const { user, token } = useAuth()
  const { workspaces, activeWorkspaceId, setActiveWorkspaceId } = useWorkspace()
  const [projects, setProjects] = React.useState<Project[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [newProjectName, setNewProjectName] = React.useState('')
  const [newProjectDesc, setNewProjectDesc] = React.useState('')
  const [creating, setCreating] = React.useState(false)

  React.useEffect(() => {
    if (!activeWorkspaceId || !token) return
    setLoading(true)
    setError(null)
    listProjects({ workspaceId: activeWorkspaceId, token })
      .then(setProjects)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [activeWorkspaceId, token])

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!activeWorkspaceId || !token || !newProjectName.trim()) {
      setError('Workspace, name, and authentication required.')
      return
    }
    setCreating(true)
    try {
      const project = await createProject({ workspaceId: activeWorkspaceId, name: newProjectName.trim(), description: newProjectDesc.trim(), token })
      setProjects(p => [...p, project])
      setNewProjectName('')
      setNewProjectDesc('')
    } catch (err: any) {
      setError(err.message || 'Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  function handleWorkspaceSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    setActiveWorkspaceId(e.target.value)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-black dark:bg-gray-900 dark:text-white">
      <div className="flex flex-col items-center justify-center flex-1">
        <div className="bg-white dark:bg-gray-800 rounded shadow p-8 w-full max-w-xl mt-8">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-2xl font-bold">Projects</h1>
          </div>
          <div className="mb-2 font-semibold">Projects in Workspace:</div>
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : (
            <ul className="space-y-1 mb-4">
              {projects.length === 0 && <li className="text-sm text-gray-500">No projects found.</li>}
              {projects.map(prj => (
                <li key={prj.id} className="mb-4">
                  <Link
                    to={`/projects/${prj.id}`}
                    className="font-bold text-2xl md:text-3xl text-purple-600 hover:underline drop-shadow-sm tracking-tight"
                  >
                    {prj.name}
                  </Link>
                  {prj.description && (
                    <div className="text-gray-700 dark:text-gray-300 text-base mt-1 ml-1 whitespace-pre-line">
                      {prj.description}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
          <hr className="my-4 border-t border-gray-300 dark:border-gray-700" />
          <div className="mb-2 font-semibold text-xl text-white">Create Project</div>
          <form className="flex flex-col gap-2 mb-4" onSubmit={handleCreateProject}>
            <input
              type="text"
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
              placeholder="New project name"
              className="px-3 py-2 rounded border dark:bg-gray-900 dark:text-white dark:border-gray-700"
              disabled={creating || !activeWorkspaceId}
            />
            <input
              type="text"
              value={newProjectDesc}
              onChange={e => setNewProjectDesc(e.target.value)}
              placeholder="Description (optional)"
              className="px-3 py-2 rounded border dark:bg-gray-900 dark:text-white dark:border-gray-700"
              disabled={creating || !activeWorkspaceId}
            />
            <button
              type="submit"
              className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white font-semibold disabled:opacity-50 shadow-lg shadow-purple-900/30 transition-all"
              disabled={creating || !newProjectName.trim() || !activeWorkspaceId}
            >
              {creating ? 'Creating...' : 'Create Project'}
            </button>
          </form>
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        </div>
      </div>
    </div>
  )
}

function Profile() {
  const { user, token, fetchMe } = useAuth()
  const [avatarUrl, setAvatarUrl] = React.useState(user?.avatarUrl || '')
  const [uploading, setUploading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null)
    const file = e.target.files?.[0]
    if (!file || !token) return
    setUploading(true)
    try {
      const { url, success, error: uploadErr } = await import('./services/avatar').then(m => m.uploadAvatar({ file, token }))
      if (!success) {
        setError(uploadErr || 'Upload failed')
        return
      }
      setAvatarUrl(url)
      await fetchMe() // Refresh user info
    } catch (err: any) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-black dark:bg-gray-900 dark:text-white">
      <div className="flex flex-col items-center justify-center flex-1">
        <div className="bg-white dark:bg-gray-800 rounded shadow p-8 w-full max-w-md mt-8">
          <h1 className="text-2xl font-bold mb-4">Profile</h1>
          <div className="flex flex-col items-center mb-4">
            <img
              src={avatarUrl ? (avatarUrl.startsWith('http') ? avatarUrl : `http://localhost:4000${avatarUrl}`) : '/img/default-avatar.webp'}
              alt="User Avatar"
              className="w-24 h-24 rounded-full object-cover border-2 border-purple-400 shadow mb-2 bg-white"
              loading="lazy"
              width={96}
              height={96}
            />
            <label className="block">
              <span className="sr-only">Choose avatar</span>
              <input
                type="file"
                accept="image/*"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                onChange={handleAvatarChange}
                disabled={uploading}
              />
            </label>
            {uploading && <div className="text-purple-500 text-sm mt-2">Uploading...</div>}
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          </div>
          <p className="mb-4">Email: <span className="font-semibold">{user?.email}</span></p>
          <p>Name: <span className="font-semibold">{user?.name}</span></p>
        </div>
      </div>
    </div>
  )
}

function NavBar() {
  const { user } = useAuth()
  // Ensure avatar URL is always absolute for display
  const avatarUrl = user?.avatarUrl ? (user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://localhost:4000${user.avatarUrl}`) : '/img/default-avatar.webp'

  return (
    <nav className="w-full flex items-center justify-between px-8 py-4 bg-card bg dark:bg-gray-800 dark:text-white shadow">
      <div className="flex items-center gap-4">
        <img
          src="/img/LogoSultan.png"
          alt="TaskSultan Logo"
          width={36}
          height={36}
          className="h-9 w-9 object-contain drop-shadow order-1"
          draggable="false"
        />
        {/* Avatar to the left of Dashboard link */}
        <img
          src={avatarUrl}
          alt="Profile"
          className="h-8 w-8 rounded-full object-cover border-2 border-purple-400 shadow order-2 bg-white"
          style={{ marginLeft: 8, marginRight: 4 }}
        />
        <Link to="/dashboard" className="text-primary order-3">Dashboard</Link>
        <Link to="/projects" className="text-primary order-4">Projects</Link>
        <Link to="/profile" className="text-primary order-5">Profile</Link>
      </div>
      <div className="flex gap-4 items-center">
        <button className="ml-4 px-3 py-1 rounded bg-primary text-white" onClick={useAuth().logout}>Logout</button>
      </div>
    </nav>
  )
}

function AuthFormWithRedirect() {
  const { user } = useAuth()
  const navigate = useNavigate()
  React.useEffect(() => { if (user) navigate('/dashboard', { replace: true }) }, [user, navigate])
  return <AuthForm />
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function DarkModeToggle() {
  const [isDark, setIsDark] = React.useState(() => {
    if (typeof window === 'undefined') return false
    // Prefer localStorage, fallback to system
    const ls = localStorage.getItem('theme')
    if (ls) return ls === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  React.useEffect(() => {
    const html = document.documentElement
    if (isDark) {
      html.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      html.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  return (
    <button
      type="button"
      onClick={() => setIsDark(v => !v)}
      className="fixed bottom-8 right-8 z-50 px-6 py-4 rounded-2xl bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-100 font-semibold shadow-lg transition-all duration-200 focus:ring-2 focus:ring-blue-400 focus:outline-none"
      aria-label="Toggle dark mode"
    >
      {isDark ? '🌙 Dark' : '☀️ Light'}
    </button>
  )
}

function App() {
  return (
    <>
      <DarkModeToggle />
      <WorkspaceProvider>
        <BrowserRouter>
          <NavBar />
          <Routes>
            <Route path="/login" element={<AuthFormWithRedirect />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <Projects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:projectId"
              element={
                <ProtectedRoute>
                  <ProjectDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </WorkspaceProvider>
    </>
  )
}

export default App
