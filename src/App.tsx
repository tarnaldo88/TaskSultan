import React from 'react'
import { AuthForm } from './components/auth/AuthForm'
import { useAuth } from './store/authContext'

function Dashboard() {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted">
      <div className="bg-white rounded shadow p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p className="mb-4">Welcome, <span className="font-semibold">{user?.name}</span>!</p>
        <button className="px-4 py-2 rounded bg-primary text-white" onClick={logout}>Logout</button>
      </div>
    </div>
  )
}

function App() {
  const { user } = useAuth()
  if (!user) return <AuthForm />
  return <Dashboard />
}

export default App
