import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom'
import { AuthForm } from './components/auth/AuthForm'
import { useAuth } from './store/authContext'
import { listProjects } from './services/project'
import type { Project } from './types/project'

function Dashboard() {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black dark:bg-gray-900 dark:text-white">
      <NavBar />
      <div className="bg-white dark:bg-gray-800 rounded shadow p-8 w-full max-w-md mt-8">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p className="mb-4">Welcome, <span className="font-semibold">{user?.name}</span>!</p>
        <button className="px-4 py-2 rounded bg-primary text-white" onClick={logout}>Logout</button>
      </div>
    </div>
  )
}

function Projects() {
  const { user, token } = useAuth()
  const [projects, setProjects] = React.useState<Project[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // For demo, assume workspaceId is user's first workspace or a static string
  const workspaceId = user?.workspaces?.[0]?.id || 'demo-workspace-id'

  React.useEffect(() => {
    if (!workspaceId || !token) return
    setLoading(true)
    listProjects({ workspaceId, token })
      .then(setProjects)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [workspaceId, token])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black dark:bg-gray-900 dark:text-white">
      <NavBar />
      <div className="bg-white dark:bg-gray-800 rounded shadow p-8 w-full max-w-md mt-8">
        <h1 className="text-2xl font-bold mb-4">Projects</h1>
        {loading && <div>Loading projects...</div>}
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <ul className="space-y-2">
          {projects.map(p => (
            <li key={p.id} className="border rounded px-3 py-2">{p.name}</li>
          ))}
        </ul>
        {!loading && !error && projects.length === 0 && <div>No projects found.</div>}
      </div>
    </div>
  )
}

function Profile() {
  const { user } = useAuth()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black dark:bg-gray-900 dark:text-white">
      <NavBar />
      <div className="bg-white dark:bg-gray-800 rounded shadow p-8 w-full max-w-md mt-8">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <p className="mb-4">Email: <span className="font-semibold">{user?.email}</span></p>
        <p>Name: <span className="font-semibold">{user?.name}</span></p>
      </div>
    </div>
  )
}

function NavBar() {
  const { user, logout } = useAuth()
  if (!user) return null
  return (
    <nav className="w-full flex items-center justify-between px-8 py-4 bg-card shadow">
      <Link to="/dashboard" className="font-bold text-lg text-primary">TaskSultan</Link>
      <div className="flex gap-4 items-center">
        <Link to="/dashboard" className="text-primary">Dashboard</Link>
        <Link to="/projects" className="text-primary">Projects</Link>
        <Link to="/profile" className="text-primary">Profile</Link>
        <button className="ml-4 px-3 py-1 rounded bg-primary text-white" onClick={logout}>Logout</button>
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
  const [isDark, setIsDark] = React.useState(() =>
    typeof window !== 'undefined' ? document.body.classList.contains('dark') : false
  )

  React.useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return
    if (isDark) root.classList.add('dark')
    else root.classList.remove('dark')
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
      <BrowserRouter>
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
    </>
  )
}

export default App
