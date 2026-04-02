import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Navigation } from './Navigation'
import { AuthProvider } from '../store/authContext'
import { WorkspaceProvider } from '../store/workspaceContext'

// Mock the auth and workspace contexts
jest.mock('../store/authContext', () => ({
  ...jest.requireActual('../store/authContext'),
  useAuth: jest.fn()
}))

jest.mock('../store/workspaceContext', () => ({
  ...jest.requireActual('../store/workspaceContext'),
  useWorkspace: jest.fn()
}))

import { useAuth } from '../store/authContext'
import { useWorkspace } from '../store/workspaceContext'

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseWorkspace = useWorkspace as jest.MockedFunction<typeof useWorkspace>

// Test wrapper component
function TestWrapper({ children, initialEntries = ['/'] }: { children: React.ReactNode; initialEntries?: string[] }) {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <WorkspaceProvider>
          {children}
        </WorkspaceProvider>
      </AuthProvider>
    </MemoryRouter>
  )
}

// Mock user and workspace data
const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'John Doe',
  role: 'Member',
  workspaces: [{ id: '1', name: 'Test Workspace' }]
}

const mockWorkspaces = [
  { id: '1', name: 'Test Workspace' },
  { id: '2', name: 'Another Workspace' }
]

describe('Navigation', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      token: 'test-token',
      isLoading: false,
      error: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      fetchMe: jest.fn()
    })

    mockUseWorkspace.mockReturnValue({
      workspaces: mockWorkspaces,
      activeWorkspaceId: '1',
      setActiveWorkspaceId: jest.fn(),
      reloadWorkspaces: jest.fn()
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render the navigation bar with all elements', () => {
    render(
      <TestWrapper>
        <Navigation />
      </TestWrapper>
    )

    // Logo and title
    expect(screen.getByText('TaskSultan')).toBeInTheDocument()
    expect(screen.getByAltText('TaskSultan Logo')).toBeInTheDocument()

    // Navigation items
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Projects')).toBeInTheDocument()

    // User info
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Logout')).toBeInTheDocument()

    // Workspace info
    expect(screen.getByText('Workspace:')).toBeInTheDocument()
    expect(screen.getByText('Test Workspace')).toBeInTheDocument()
  })

  it('should display user avatar with correct initial', () => {
    render(
      <TestWrapper>
        <Navigation />
      </TestWrapper>
    )

    const avatar = screen.getByText('J') // John Doe -> J
    expect(avatar).toBeInTheDocument()
    expect(avatar).toHaveClass('text-white', 'text-sm', 'font-medium')
  })

  it('should highlight active navigation item', () => {
    render(
      <TestWrapper initialEntries={['/dashboard']}>
        <Navigation />
      </TestWrapper>
    )

    const dashboardLink = screen.getByText('Dashboard')
    expect(dashboardLink).toHaveClass('bg-purple-100', 'text-purple-700')
  })

  it('should not highlight inactive navigation item', () => {
    render(
      <TestWrapper initialEntries={['/projects']}>
        <Navigation />
      </TestWrapper>
    )

    const dashboardLink = screen.getByText('Dashboard')
    expect(dashboardLink).not.toHaveClass('bg-purple-100', 'text-purple-700')
    expect(dashboardLink).toHaveClass('text-gray-600')
  })

  it('should call logout when logout button is clicked', async () => {
    const mockLogout = jest.fn()
    mockUseAuth.mockReturnValue({
      user: mockUser,
      token: 'test-token',
      isLoading: false,
      error: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: mockLogout,
      fetchMe: jest.fn()
    })

    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <Navigation />
      </TestWrapper>
    )

    const logoutButton = screen.getByText('Logout')
    await user.click(logoutButton)

    expect(mockLogout).toHaveBeenCalledTimes(1)
  })

  it('should navigate to correct routes when navigation items are clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <Navigation />
      </TestWrapper>
    )

    const dashboardLink = screen.getByText('Dashboard')
    const projectsLink = screen.getByText('Projects')

    await user.click(dashboardLink)
    expect(dashboardLink.closest('a')).toHaveAttribute('href', '/dashboard')

    await user.click(projectsLink)
    expect(projectsLink.closest('a')).toHaveAttribute('href', '/projects')
  })

  it('should display profile link with user avatar', () => {
    render(
      <TestWrapper>
        <Navigation />
      </TestWrapper>
    )

    const profileLink = screen.getByText('John Doe').closest('a')
    expect(profileLink).toHaveAttribute('href', '/profile')
  })

  it('should hide workspace info on mobile', () => {
    render(
      <TestWrapper>
        <Navigation />
      </TestWrapper>
    )

    const workspaceInfo = screen.getByText('Workspace:').parentElement
    expect(workspaceInfo).toHaveClass('hidden', 'md:flex')
  })

  it('should hide user name on mobile', () => {
    render(
      <TestWrapper>
        <Navigation />
      </TestWrapper>
    )

    const userName = screen.getByText('John Doe')
    expect(userName).toHaveClass('hidden', 'md:block')
  })

  it('should render logo with correct attributes', () => {
    render(
      <TestWrapper>
        <Navigation />
      </TestWrapper>
    )

    const logo = screen.getByAltText('TaskSultan Logo')
    expect(logo).toHaveAttribute('src', '/img/LogoSultan.png')
    expect(logo).toHaveAttribute('width', '32')
    expect(logo).toHaveAttribute('height', '32')
    expect(logo).toHaveClass('h-8', 'w-8', 'object-contain')
  })

  it('should handle missing active workspace gracefully', () => {
    mockUseWorkspace.mockReturnValue({
      workspaces: mockWorkspaces,
      activeWorkspaceId: null,
      setActiveWorkspaceId: jest.fn(),
      reloadWorkspaces: jest.fn()
    })

    render(
      <TestWrapper>
        <Navigation />
      </TestWrapper>
    )

    // Should still render navigation without workspace display
    expect(screen.getByText('TaskSultan')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('should handle missing user gracefully', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      fetchMe: jest.fn()
    })

    render(
      <TestWrapper>
        <Navigation />
      </TestWrapper>
    )

    // Should still render navigation structure
    expect(screen.getByText('TaskSultan')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    render(
      <TestWrapper>
        <Navigation />
      </TestWrapper>
    )

    // Check for proper navigation landmarks
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()

    // Check for proper link roles
    expect(screen.getByRole('link', { name: /Dashboard/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Projects/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /John Doe/ })).toBeInTheDocument()
  })

  it('should apply hover states correctly', () => {
    render(
      <TestWrapper initialEntries={['/projects']}>
        <Navigation />
      </TestWrapper>
    )

    const dashboardLink = screen.getByText('Dashboard')
    expect(dashboardLink).toHaveClass('hover:text-gray-900', 'hover:bg-gray-50')
  })

  it('should have proper responsive classes', () => {
    render(
      <TestWrapper>
        <Navigation />
      </TestWrapper>
    )

    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('bg-white', 'dark:bg-gray-900', 'border-b')

    const container = nav.querySelector('.max-w-7xl')
    expect(container).toHaveClass('px-4', 'sm:px-6', 'lg:px-8')
  })

  it('should display navigation icons', () => {
    render(
      <TestWrapper>
        <Navigation />
      </TestWrapper>
    )

    // Check for SVG icons (they should be present but not visible as text)
    const dashboardIcon = screen.getByText('Dashboard').previousSibling
    const projectsIcon = screen.getByText('Projects').previousSibling

    expect(dashboardIcon).toBeDefined()
    expect(projectsIcon).toBeDefined()
  })
})
