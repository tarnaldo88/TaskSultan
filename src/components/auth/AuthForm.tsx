import React, { useState } from 'react'
import { useAuth } from '../store/authContext'

function AuthForm() {
  const { login, register, isLoading, error, user } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (mode === 'login') await login({ email: form.email, password: form.password })
    else await register({ name: form.name, email: form.email, password: form.password })
  }

  return (
    <div className="max-w-sm mx-auto mt-20 p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">{mode === 'login' ? 'Sign In' : 'Register'}</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {mode === 'register' && (
          <input
            className="input input-bordered"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
          />
        )}
        <input
          className="input input-bordered"
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          className="input input-bordered"
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button className="btn btn-primary w-full" type="submit" disabled={isLoading}>
          {isLoading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Register'}
        </button>
        <button
          type="button"
          className="text-blue-600 text-sm mt-2"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        >
          {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Sign In'}
        </button>
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        {user && <div className="text-green-600 text-sm text-center">Welcome, {user.name}</div>}
      </form>
    </div>
  )
}

export { AuthForm }
