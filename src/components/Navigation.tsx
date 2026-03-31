import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../store/authContext'
import { useWorkspace } from '../store/workspaceContext'

interface NavItemProps {
  to: string
  children: React.ReactNode
  icon?: React.ReactNode
}

function NavItem({ to, children, icon }: NavItemProps) {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link
      to={to}
      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
      }`}
    >
      {icon}
      <span>{children}</span>
    </Link>
  )
}

export function Navigation() {
  const { user, logout } = useAuth()
  const { workspaces, activeWorkspaceId } = useWorkspace()

  const currentWorkspace = workspaces.find(ws => ws.id === activeWorkspaceId)

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-3">
              <img
                src="/img/LogoSultan.png"
                alt="TaskSultan Logo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <span className="text-xl font-bold text-gray-900 dark:text-white">TaskSultan</span>
            </Link>

            {/* Main Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <NavItem 
                to="/dashboard"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                }
              >
                Dashboard
              </NavItem>
              <NavItem 
                to="/projects"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                }
              >
                Projects
              </NavItem>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Workspace Selector */}
            {currentWorkspace && (
              <div className="hidden md:flex items-center space-x-2 text-sm">
                <span className="text-gray-500 dark:text-gray-400">Workspace:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {currentWorkspace.name}
                </span>
              </div>
            )}

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <Link
                to="/profile"
                className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden md:block">{user?.name}</span>
              </Link>

              <button
                onClick={logout}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
