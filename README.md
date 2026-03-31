# TaskSultan

A modern SaaS task management platform inspired by Jira, built with React and TypeScript. TaskSultan provides teams with an intuitive interface for project management, task tracking, and collaboration.

## Overview

TaskSultan is a collaborative web-based application designed for teams and individuals to create, assign, and track tasks through customizable workflows. It combines the power of enterprise task management with a focus on simplicity and modern user experience.

## Features

### Core Functionality
- **User Authentication**: Email/password and OAuth login with role-based access control
- **Workspaces**: Organize teams, projects, and settings in dedicated workspaces
- **Project Management**: Multiple projects per workspace with granular permissions
- **Task Management**: Create, assign, and track tasks with customizable states and workflows
- **Multiple Views**: Kanban boards, list views, and calendar views for task visualization
- **Collaboration**: Real-time comments, notifications, and activity feeds
- **Customization**: Configurable task states, labels, and workflows

### Technical Features
- **TypeScript**: Full type safety across the application
- **React 18**: Modern React with hooks and concurrent features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **State Management**: React Context for authentication and workspace state
- **API Integration**: RESTful API with proper error handling
- **Testing**: Comprehensive test suite with Jest and React Testing Library

## Technology Stack

### Frontend
- **React 18.3.1** - UI framework
- **TypeScript 4.9.5** - Type safety
- **Tailwind CSS** - Styling framework
- **React Router DOM** - Client-side routing
- **React Hook Form** - Form management with Zod validation
- **Material UI** - Component library
- **Redux Toolkit** - State management
- **Axios** - HTTP client

### Testing
- **Jest** - Test runner
- **React Testing Library** - Component testing
- **Testing Library User Event** - User interaction testing
- **@types/jest** - TypeScript support for Jest

## Getting Started

### Prerequisites
- Node.js 16 or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd TaskSultan
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm start` - Run development server
- `npm build` - Build for production
- `npm test` - Run tests in watch mode
- `npm run test:ci` - Run tests once with coverage
- `npm run test:coverage` - Generate coverage report
- `npm run eject` - Eject from Create React App

## Project Structure

```
TaskSultan/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable React components
│   │   ├── auth/           # Authentication components
│   │   ├── task-comments/  # Task comment components
│   │   └── ui/             # UI component library
│   ├── integration/        # Integration tests
│   ├── pages/              # Page components
│   ├── services/           # API service functions
│   ├── store/              # React Context providers
│   ├── types/              # TypeScript type definitions
│   ├── App.tsx             # Main application component
│   ├── index.tsx           # Application entry point
│   └── setupTests.ts       # Test configuration
├── backend/                # Backend API (separate repository)
├── docs/                   # Documentation
└── README.md
```

## Testing

TaskSultan includes a comprehensive test suite covering:

- **Unit Tests**: Service functions and utility functions
- **Component Tests**: React component rendering and behavior
- **Integration Tests**: End-to-end user workflows
- **Context Tests**: State management logic

### Running Tests

```bash
# Development mode (watch)
npm test

# CI mode with coverage
npm run test:ci

# Coverage report only
npm run test:coverage
```

### Test Coverage

The test suite maintains high coverage across:
- Authentication services (100%)
- Task management services (100%)
- Project services (66.66%)
- React Context providers (85.56%)

## API Integration

TaskSultan communicates with a RESTful API backend. The frontend includes:

- **Service Layer**: Organized API calls in `/src/services/`
- **Error Handling**: Comprehensive error management
- **Type Safety**: Full TypeScript integration
- **Authentication**: JWT token management

## Development Guidelines

### Code Style
- TypeScript for all new code
- Functional components with hooks
- Descriptive variable names with auxiliary verbs
- Lowercase with dashes for directories
- Named exports for components

### Testing Guidelines
- Write tests for all new features
- Use React Testing Library for component tests
- Mock external dependencies
- Test both success and error scenarios
- Maintain 70% minimum coverage

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, questions, or contributions, please open an issue on the GitHub repository or contact the development team.

## Roadmap

Future enhancements planned for TaskSultan:
- Advanced reporting and analytics
- Workflow automation
- Third-party integrations (Slack, GitHub, etc.)
- Mobile applications
- Advanced permission management
- Time tracking capabilities
