import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider } from '../store/authContext'
import { WorkspaceProvider } from '../store/workspaceContext'
import { useAuth } from '../store/authContext'
import { useWorkspace } from '../store/workspaceContext'

// Mock fetch
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>
global.fetch = mockFetch

// Test component that simulates a simple login flow
function AuthFlowComponent() {
  const { user, token, login, logout } = useAuth()
  const { workspaces, activeWorkspaceId } = useWorkspace()
  
  return (
    <div>
      <div data-testid="auth-status">
        {user ? `Logged in as ${user.name}` : 'Not logged in'}
      </div>
      <div data-testid="token-status">
        {token ? 'Has token' : 'No token'}
      </div>
      <div data-testid="workspaces-count">
        {workspaces.length} workspaces
      </div>
      <div data-testid="active-workspace">
        {activeWorkspaceId || 'No active workspace'}
      </div>
      <button 
        onClick={() => login({ email: 'test@example.com', password: 'password' })}
        data-testid="login-button"
      >
        Login
      </button>
      <button 
        onClick={logout}
        data-testid="logout-button"
        disabled={!user}
      >
        Logout
      </button>
    </div>
  )
}

// Mock data
const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'Member',
  workspaces: [{ id: '1', name: 'Test Workspace' }]
}

const mockWorkspaces = [
  { id: '1', name: 'Test Workspace' },
  { id: '2', name: 'Another Workspace' }
]

describe('Auth Flow Integration', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    localStorage.clear()
  })

  it('should complete full authentication flow', async () => {
    const user = userEvent.setup()
    
    // Mock login API
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'test-token', user: mockUser })
    } as Response)

    // Mock workspaces API
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ workspaces: mockWorkspaces })
    } as Response)

    render(
      <AuthProvider>
        <WorkspaceProvider>
          <AuthFlowComponent />
        </WorkspaceProvider>
      </AuthProvider>
    )

    // Initial state
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not logged in')
    expect(screen.getByTestId('token-status')).toHaveTextContent('No token')
    expect(screen.getByTestId('workspaces-count')).toHaveTextContent('0 workspaces')

    // Login
    await user.click(screen.getByTestId('login-button'))

    // Wait for login to complete
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged in as Test User')
      expect(screen.getByTestId('token-status')).toHaveTextContent('Has token')
    })

    // Wait for workspaces to load
    await waitFor(() => {
      expect(screen.getByTestId('workspaces-count')).toHaveTextContent('2 workspaces')
      expect(screen.getByTestId('active-workspace')).toHaveTextContent('1')
    })

    // Verify API calls
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'password' })
      })
    )
  })

  it('should handle logout and clear all state', async () => {
    const user = userEvent.setup()
    
    // Mock login API
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'test-token', user: mockUser })
    } as Response)

    // Mock workspaces API
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ workspaces: mockWorkspaces })
    } as Response)

    render(
      <AuthProvider>
        <WorkspaceProvider>
          <AuthFlowComponent />
        </WorkspaceProvider>
      </AuthProvider>
    )

    // Login first
    await user.click(screen.getByTestId('login-button'))

    // Wait for login and workspaces
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged in as Test User')
      expect(screen.getByTestId('workspaces-count')).toHaveTextContent('2 workspaces')
    })

    // Logout
    await user.click(screen.getByTestId('logout-button'))

    // Verify state is cleared
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not logged in')
    expect(screen.getByTestId('token-status')).toHaveTextContent('No token')
    expect(screen.getByTestId('workspaces-count')).toHaveTextContent('0 workspaces')
    expect(screen.getByTestId('active-workspace')).toHaveTextContent('No active workspace')
  })

  it('should handle login failure gracefully', async () => {
    const user = userEvent.setup()
    
    // Mock failed login
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid credentials' })
    } as Response)

    render(
      <AuthProvider>
        <WorkspaceProvider>
          <AuthFlowComponent />
        </WorkspaceProvider>
      </AuthProvider>
    )

    await user.click(screen.getByTestId('login-button'))

    // State should remain unchanged
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not logged in')
    expect(screen.getByTestId('token-status')).toHaveTextContent('No token')
    expect(screen.getByTestId('workspaces-count')).toHaveTextContent('0 workspaces')
  })
})
