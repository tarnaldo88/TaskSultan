import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from './authContext'
import type { User } from '../types/user'
import type { Workspace } from '../types/workspace'

// Mock the auth service
jest.mock('../services/auth', () => ({
  login: jest.fn(),
  register: jest.fn(),
  fetchMe: jest.fn()
}))

import { login, register, fetchMe } from '../services/auth'

const mockLogin = login as jest.MockedFunction<typeof login>
const mockRegister = register as jest.MockedFunction<typeof register>
const mockFetchMe = fetchMe as jest.MockedFunction<typeof fetchMe>

// Test component to use the auth context
function TestComponent() {
  const { user, token, login: authLogin, register: authRegister, logout } = useAuth()
  
  return (
    <div>
      <div data-testid="user">{user?.name || 'No user'}</div>
      <div data-testid="token">{token || 'No token'}</div>
      <button onClick={() => authLogin({ email: 'test@example.com', password: 'password' })}>
        Login
      </button>
      <button onClick={() => authRegister({ name: 'Test', email: 'test@example.com', password: 'password' })}>
        Register
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

// Mock user data
const mockWorkspace: Workspace = { id: '1', name: 'Test Workspace' }
const mockUser: User = { 
  id: '1', 
  email: 'test@example.com', 
  name: 'Test User', 
  role: 'Member',
  workspaces: [mockWorkspace]
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    mockLogin.mockClear()
    mockRegister.mockClear()
    mockFetchMe.mockClear()
  })

  it('should provide initial state with no user and token', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('user')).toHaveTextContent('No user')
    expect(screen.getByTestId('token')).toHaveTextContent('No token')
  })

  it('should login successfully and update state', async () => {
    const user = userEvent.setup()
    
    mockLogin.mockResolvedValueOnce({
      token: 'test-token',
      user: mockUser
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await user.click(screen.getByText('Login'))

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User')
      expect(screen.getByTestId('token')).toHaveTextContent('test-token')
    })

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password'
    })
    expect(localStorage.getItem('token')).toBe('test-token')
  })

  it('should register successfully and update state', async () => {
    const user = userEvent.setup()
    
    mockRegister.mockResolvedValueOnce({
      token: 'test-token',
      user: mockUser
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await user.click(screen.getByText('Register'))

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User')
      expect(screen.getByTestId('token')).toHaveTextContent('test-token')
    })

    expect(mockRegister).toHaveBeenCalledWith({
      name: 'Test',
      email: 'test@example.com',
      password: 'password'
    })
  })

  it('should logout and clear state', async () => {
    const user = userEvent.setup()
    
    // Set initial logged in state
    localStorage.setItem('token', 'existing-token')
    mockFetchMe.mockResolvedValueOnce(mockUser)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Wait for initial auth check
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User')
    })

    await user.click(screen.getByText('Logout'))

    expect(screen.getByTestId('user')).toHaveTextContent('No user')
    expect(screen.getByTestId('token')).toHaveTextContent('No token')
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('should handle login failure', async () => {
    const user = userEvent.setup()
    
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await user.click(screen.getByText('Login'))

    // State should remain unchanged
    expect(screen.getByTestId('user')).toHaveTextContent('No user')
    expect(screen.getByTestId('token')).toHaveTextContent('No token')
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('should initialize with token from localStorage', async () => {
    localStorage.setItem('token', 'stored-token')
    mockFetchMe.mockResolvedValueOnce(mockUser)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User')
      expect(screen.getByTestId('token')).toHaveTextContent('stored-token')
    })

    expect(mockFetchMe).toHaveBeenCalledWith('stored-token')
  })

  it('should clear token if fetchMe fails', async () => {
    localStorage.setItem('token', 'invalid-token')
    mockFetchMe.mockRejectedValueOnce(new Error('Not authenticated'))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user')
      expect(screen.getByTestId('token')).toHaveTextContent('No token')
    })

    expect(localStorage.getItem('token')).toBeNull()
  })

  it('should throw error when useAuth is used outside AuthProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    
    expect(() => {
      render(<TestComponent />)
    }).toThrow('useAuth must be used within an AuthProvider')

    consoleSpy.mockRestore()
  })
})
