import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom'
import { AuthForm } from './components/auth/AuthForm'
import { useAuth } from './store/authContext'

function Dashboard() {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted">
      <NavBar />
      <div className="bg-white rounded shadow p-8 w-full max-w-md mt-8">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p className="mb-4">Welcome, <span className="font-semibold">{user?.name}</span>!</p>
        <button className="px-4 py-2 rounded bg-primary text-white" onClick={logout}>Logout</button>
      </div>
    </div>
  )
}

function Projects() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted">
      <NavBar />
      <div className="bg-white rounded shadow p-8 w-full max-w-md mt-8">
        <h1 className="text-2xl font-bold mb-4">Projects</h1>
        <p className="mb-4">Project list and management coming soon.</p>
      </div>
    </div>
  )
}

function Profile() {
  const { user } = useAuth()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted">
      <NavBar />
      <div className="bg-white rounded shadow p-8 w-full max-w-md mt-8">
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

function App() {
  return (
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
  )
}

export default App
