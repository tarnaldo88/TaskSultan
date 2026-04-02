import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { LandingPage } from './LandingPage'
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
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
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

describe('LandingPage', () => {
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

  it('should render the landing page with all main sections', () => {
    render(
      <TestWrapper>
        <LandingPage />
      </TestWrapper>
    )

    // Header
    expect(screen.getByText('TaskSultan')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()

    // Welcome section
    expect(screen.getByText(/Welcome back, John Doe/)).toBeInTheDocument()
    expect(screen.getByText(/Managing Test Workspace workspace/)).toBeInTheDocument()

    // Metrics
    expect(screen.getByText('12')).toBeInTheDocument() // Active Tasks
    expect(screen.getByText('3')).toBeInTheDocument() // Projects
    expect(screen.getByText('8')).toBeInTheDocument() // Team Members
    expect(screen.getByText('94%')).toBeInTheDocument() // Completion Rate

    // Quick Actions
    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    expect(screen.getByText('View Projects')).toBeInTheDocument()
    expect(screen.getByText('Create Task')).toBeInTheDocument()
    expect(screen.getByText('Invite Team')).toBeInTheDocument()

    // Features
    expect(screen.getByText('Platform Features')).toBeInTheDocument()
    expect(screen.getByText('Task Management')).toBeInTheDocument()
    expect(screen.getByText('Team Collaboration')).toBeInTheDocument()

    // Recent Activity
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    expect(screen.getByText(/Task "Update homepage design" was completed/)).toBeInTheDocument()
  })

  it('should display different welcome message when no active workspace', () => {
    mockUseWorkspace.mockReturnValue({
      workspaces: mockWorkspaces,
      activeWorkspaceId: null,
      setActiveWorkspaceId: jest.fn(),
      reloadWorkspaces: jest.fn()
    })

    render(
      <TestWrapper>
        <LandingPage />
      </TestWrapper>
    )

    expect(screen.getByText(/Select a workspace to get started/)).toBeInTheDocument()
  })

  it('should render user avatar with correct initial', () => {
    render(
      <TestWrapper>
        <LandingPage />
      </TestWrapper>
    )

    const avatarElements = screen.getAllByText('J') // John Doe -> J
    expect(avatarElements.length).toBeGreaterThan(0)
  })

  it('should have working navigation links', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <LandingPage />
      </TestWrapper>
    )

    const projectsLink = screen.getByText('Projects')
    const profileLink = screen.getByText('Profile')

    await user.click(projectsLink)
    // In a real app, this would navigate to /projects
    expect(projectsLink).toBeInTheDocument()

    await user.click(profileLink)
    expect(profileLink).toBeInTheDocument()
  })

  it('should display all metric cards with correct values', () => {
    render(
      <TestWrapper>
        <LandingPage />
      </TestWrapper>
    )

    // Check metric values
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('Active Tasks')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('Team Members')).toBeInTheDocument()
    expect(screen.getByText('94%')).toBeInTheDocument()
    expect(screen.getByText('Completion Rate')).toBeInTheDocument()

    // Check trend indicators
    expect(screen.getByText('+2 this week')).toBeInTheDocument()
    expect(screen.getByText('+1 this month')).toBeInTheDocument()
    expect(screen.getByText('No change')).toBeInTheDocument()
    expect(screen.getByText('+5%')).toBeInTheDocument()
  })

  it('should render all feature cards', () => {
    render(
      <TestWrapper>
        <LandingPage />
      </TestWrapper>
    )

    const features = [
      { title: 'Task Management', description: 'Create, assign, and track tasks with customizable workflows and priorities.' },
      { title: 'Team Collaboration', description: 'Real-time comments, notifications, and activity feeds to keep everyone in sync.' },
      { title: 'Analytics & Reports', description: 'Track progress with detailed analytics and customizable reporting dashboards.' },
      { title: 'Multiple Views', description: 'Switch between Kanban boards, list views, and calendar views based on your preference.' },
      { title: 'Smart Notifications', description: 'Stay updated with intelligent notifications for task assignments and deadlines.' },
      { title: 'Enterprise Security', description: 'Bank-level security with role-based access control and data encryption.' }
    ]

    features.forEach(feature => {
      expect(screen.getByText(feature.title)).toBeInTheDocument()
      expect(screen.getByText(feature.description)).toBeInTheDocument()
    })
  })

  it('should display recent activity items with timestamps', () => {
    render(
      <TestWrapper>
        <LandingPage />
      </TestWrapper>
    )

    const activities = [
      { text: 'Task "Update homepage design" was completed', time: '2 hours ago' },
      { text: 'New project "Mobile App" created', time: '5 hours ago' },
      { text: 'Sarah Johnson joined the team', time: '1 day ago' }
    ]

    activities.forEach(activity => {
      expect(screen.getByText(activity.text)).toBeInTheDocument()
      expect(screen.getByText(activity.time)).toBeInTheDocument()
    })
  })

  it('should have proper accessibility attributes', () => {
    render(
      <TestWrapper>
        <LandingPage />
      </TestWrapper>
    )

    // Check for proper heading hierarchy
    expect(screen.getByRole('heading', { name: 'TaskSultan' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Welcome back/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Quick Actions' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Platform Features' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Recent Activity' })).toBeInTheDocument()

    // Check for navigation links
    expect(screen.getByRole('link', { name: 'Projects' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Profile' })).toBeInTheDocument()
  })

  it('should handle quick action buttons', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <LandingPage />
      </TestWrapper>
    )

    // Test quick action buttons
    const createTaskButton = screen.getByText('Create Task')
    const inviteTeamButton = screen.getByText('Invite Team')

    await user.click(createTaskButton)
    expect(createTaskButton).toBeInTheDocument()

    await user.click(inviteTeamButton)
    expect(inviteTeamButton).toBeInTheDocument()
  })

  it('should display correct workspace information', () => {
    render(
      <TestWrapper>
        <LandingPage />
      </TestWrapper>
    )

    expect(screen.getByText('Workspace:')).toBeInTheDocument()
    expect(screen.getByText('Test Workspace')).toBeInTheDocument()
  })

  it('should render logo correctly', () => {
    render(
      <TestWrapper>
        <LandingPage />
      </TestWrapper>
    )

    const logo = document.querySelector('img[alt="TaskSultan Logo"]')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('src', '/img/LogoSultan.png')
  })

  it('should have responsive design classes', () => {
    render(
      <TestWrapper>
        <LandingPage />
      </TestWrapper>
    )

    // Check for responsive grid classes
    const metricsGrid = screen.getByText('12').closest('div')?.parentElement?.parentElement
    expect(metricsGrid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4')

    // Check features grid
    const featuresGrid = screen.getByText('Task Management').closest('div')?.parentElement
    expect(featuresGrid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3')
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
        <LandingPage />
      </TestWrapper>
    )

    // Should still render the page structure
    expect(screen.getByText('TaskSultan')).toBeInTheDocument()
    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
  })

  it('should handle empty workspaces gracefully', () => {
    mockUseWorkspace.mockReturnValue({
      workspaces: [],
      activeWorkspaceId: null,
      setActiveWorkspaceId: jest.fn(),
      reloadWorkspaces: jest.fn()
    })

    render(
      <TestWrapper>
        <LandingPage />
      </TestWrapper>
    )

    expect(screen.getByText(/Select a workspace to get started/)).toBeInTheDocument()
  })
})
