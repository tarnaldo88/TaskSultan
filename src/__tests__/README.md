# Testing Guide

This directory contains the test suite for the TaskSultan frontend application.

## Test Structure

### Unit Tests
- **Services**: `src/services/*.test.ts` - Tests for API service functions
- **Components**: `src/components/*.test.tsx` - Tests for React components
- **Contexts**: `src/store/*.test.tsx` - Tests for React Context providers

### Integration Tests
- **Flows**: `src/integration/*.test.tsx` - End-to-end user flow tests

## Running Tests

### Development Mode
```bash
npm test
```
Runs tests in watch mode for development.

### CI Mode
```bash
npm run test:ci
```
Runs all tests once with coverage reporting.

### Coverage Report
```bash
npm run test:coverage
```
Generates a detailed coverage report.

## Test Categories

### Service Tests
- **Auth Service**: Login, register, and user fetching
- **Task Service**: CRUD operations for tasks
- **Project Service**: Project management operations
- **Workspace Service**: Workspace operations

### Component Tests
- **LabelBadge**: Badge component rendering and styling
- **UI Components**: Reusable UI components

### Context Tests
- **AuthContext**: Authentication state management
- **WorkspaceContext**: Workspace state management

### Integration Tests
- **Auth Flow**: Complete login/logout workflow
- **Workspace Flow**: Workspace selection and management

## Testing Best Practices

1. **Mock External Dependencies**: Use jest.mock() for API calls and external modules
2. **Test User Interactions**: Use @testing-library/user-event for user actions
3. **Async Testing**: Use waitFor() for async operations
4. **Cleanup**: Clear mocks and localStorage in beforeEach
5. **Error Handling**: Test both success and error scenarios
6. **Accessibility**: Test component accessibility when applicable

## Coverage Requirements

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## Mock Data

All tests use consistent mock data defined at the top of each test file:
- Mock users, workspaces, projects, and tasks
- Consistent API response formats
- Proper TypeScript typing

## Debugging Tests

1. Use `screen.debug()` to inspect rendered output
2. Use `console.log` within tests for debugging
3. Run specific tests with `npm test -- --testNamePattern="test name"`
4. Use VS Code debugging with Jest extension
