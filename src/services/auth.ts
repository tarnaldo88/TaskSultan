import type { User } from '../types/user'

export interface AuthResponse {
  token: string
  user: User
}

export async function login({ email, password }: { email: string; password: string }): Promise<AuthResponse> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  if (!res.ok) throw new Error((await res.json()).error || 'Login failed')
  return res.json()
}

export async function register({ name, email, password }: { name: string; email: string; password: string }): Promise<AuthResponse> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  })
  if (!res.ok) throw new Error((await res.json()).error || 'Registration failed')
  return res.json()
}

export async function fetchMe(token: string): Promise<User> {
  const res = await fetch('/api/user/me', {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Not authenticated')
  const { user } = await res.json()
  return user
}
