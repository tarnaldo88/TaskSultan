import { login, register, fetchMe } from './auth'
import type { AuthResponse } from './auth'
import type { User } from '../types/user'
import type { Workspace } from '../types/workspace'

// Mock fetch
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>
global.fetch = mockFetch

// Mock user data
const mockWorkspace: Workspace = { id: '1', name: 'Test Workspace' }
const mockUser: User = { 
  id: '1', 
  email: 'test@example.com', 
  name: 'Test User', 
  role: 'Member',
  workspaces: [mockWorkspace]
}

describe('Auth Service', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockResponse: AuthResponse = {
        token: 'test-token',
        user: mockUser
      }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await login({ email: 'test@example.com', password: 'password' })

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password' })
      })
      expect(result).toEqual(mockResponse)
    })

    it('should throw error with invalid credentials', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid credentials' })
      } as Response)

      await expect(login({ email: 'test@example.com', password: 'wrong' }))
        .rejects.toThrow('Invalid credentials')
    })

    it('should throw generic error when no error message provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({})
      } as Response)

      await expect(login({ email: 'test@example.com', password: 'wrong' }))
        .rejects.toThrow('Login failed')
    })
  })

  describe('register', () => {
    it('should successfully register with valid data', async () => {
      const mockResponse: AuthResponse = {
        token: 'test-token',
        user: mockUser
      }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await register({ 
        name: 'Test User', 
        email: 'test@example.com', 
        password: 'password' 
      })

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test User', email: 'test@example.com', password: 'password' })
      })
      expect(result).toEqual(mockResponse)
    })

    it('should throw error when registration fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Email already exists' })
      } as Response)

      await expect(register({ 
        name: 'Test User', 
        email: 'test@example.com', 
        password: 'password' 
      })).rejects.toThrow('Email already exists')
    })
  })

  describe('fetchMe', () => {
    it('should fetch user data with valid token', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User', role: 'Member' }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser })
      } as Response)

      const result = await fetchMe('test-token')

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:4000/api/user/me', {
        headers: { Authorization: 'Bearer test-token' }
      })
      expect(result).toEqual(mockUser)
    })

    it('should throw error when not authenticated', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false
      } as Response)

      await expect(fetchMe('invalid-token')).rejects.toThrow('Not authenticated')
    })
  })
})
