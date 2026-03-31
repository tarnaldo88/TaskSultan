import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WorkspaceProvider, useWorkspace } from './workspaceContext'
import { AuthProvider, useAuth } from './authContext'
import type { Workspace } from '../types/workspace'

// Mock fetch
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>
global.fetch = mockFetch

// Test component to use the workspace context
function TestComponent() {
  const { workspaces, activeWorkspaceId, setActiveWorkspaceId, reloadWorkspaces } = useWorkspace()
  
  return (
    <div>
      <div data-testid="workspaces-count">{workspaces.length}</div>
      <div data-testid="active-workspace">{activeWorkspaceId || 'No active workspace'}</div>
      <button 
        onClick={() => setActiveWorkspaceId('1')}
        disabled={workspaces.length === 0}
      >
        Set Active Workspace
      </button>
      <button onClick={reloadWorkspaces}>Reload Workspaces</button>
    </div>
  )
}

// Wrapper component that provides both contexts
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        {children}
      </WorkspaceProvider>
    </AuthProvider>
  )
}

// Mock workspace data
const mockWorkspaces: Workspace[] = [
  { id: '1', name: 'Workspace 1' },
  { id: '2', name: 'Workspace 2' }
]

describe('WorkspaceContext', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    localStorage.clear()
  })

  it('should provide initial state with no workspaces', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    expect(screen.getByTestId('workspaces-count')).toHaveTextContent('0')
    expect(screen.getByTestId('active-workspace')).toHaveTextContent('No active workspace')
  })

  it('should fetch workspaces and update state', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ workspaces: mockWorkspaces })
    } as Response)

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByTestId('workspaces-count')).toHaveTextContent('2')
      expect(screen.getByTestId('active-workspace')).toHaveTextContent('1')
    })

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:4000/api/workspaces', {
      headers: { Authorization: 'Bearer undefined' }
    })
  })

  it('should set active workspace', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ workspaces: mockWorkspaces })
    } as Response)

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByTestId('workspaces-count')).toHaveTextContent('2')
    })

    await user.click(screen.getByText('Set Active Workspace'))

    expect(screen.getByTestId('active-workspace')).toHaveTextContent('1')
  })

  it('should reload workspaces', async () => {
    const user = userEvent.setup()
    
    // Initial fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ workspaces: mockWorkspaces })
    } as Response)

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByTestId('workspaces-count')).toHaveTextContent('2')
    })

    // Reload fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ workspaces: [mockWorkspaces[0]] })
    } as Response)

    await user.click(screen.getByText('Reload Workspaces'))

    await waitFor(() => {
      expect(screen.getByTestId('workspaces-count')).toHaveTextContent('1')
    })
  })

  it('should handle fetch workspaces failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false
    } as Response)

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByTestId('workspaces-count')).toHaveTextContent('0')
    })
  })

  it('should throw error when useWorkspace is used outside WorkspaceProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    
    expect(() => {
      render(<TestComponent />)
    }).toThrow('useWorkspace must be used within WorkspaceProvider')

    consoleSpy.mockRestore()
  })
})
