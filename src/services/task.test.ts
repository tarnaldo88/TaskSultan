import { listTasks, createTask, updateTask, deleteTask } from './task'
import type { Task } from '../types/task'

// Mock fetch
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>
global.fetch = mockFetch

// Mock task data
const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  description: 'Test Description',
  status: 'todo',
  priority: 'medium',
  dueDate: '2024-01-01',
  assigneeId: '1',
  assignee: {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    avatarUrl: null
  },
  projectId: '1',
  parentTaskId: undefined,
  labels: [{ id: '1', name: 'Urgent', color: '#ff0000', workspaceId: '1' }],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
}

describe('Task Service', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  describe('listTasks', () => {
    it('should fetch tasks successfully', async () => {
      const mockResponse = { tasks: [mockTask] }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await listTasks({ projectId: '1', token: 'test-token' })

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:4000/api/projects/1/tasks', {
        headers: { Authorization: 'Bearer test-token' }
      })
      expect(result).toEqual([mockTask])
    })

    it('should throw error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed to fetch tasks' })
      } as Response)

      await expect(listTasks({ projectId: '1', token: 'test-token' }))
        .rejects.toThrow('Failed to fetch tasks')
    })

    it('should throw generic error when no error message provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({})
      } as Response)

      await expect(listTasks({ projectId: '1', token: 'test-token' }))
        .rejects.toThrow('Failed to fetch tasks')
    })
  })

  describe('createTask', () => {
    it('should create task successfully', async () => {
      const mockResponse = { task: mockTask }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await createTask({
        projectId: '1',
        title: 'Test Task',
        description: 'Test Description',
        token: 'test-token',
        parentTaskId: 'parent-1',
        labels: ['label-1']
      })

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:4000/api/projects/1/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token'
        },
        body: JSON.stringify({
          title: 'Test Task',
          description: 'Test Description',
          parentTaskId: 'parent-1',
          labels: ['label-1']
        })
      })
      expect(result).toEqual(mockTask)
    })

    it('should create task with minimal data', async () => {
      const mockResponse = { task: mockTask }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await createTask({
        projectId: '1',
        title: 'Test Task',
        token: 'test-token'
      })

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:4000/api/projects/1/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token'
        },
        body: JSON.stringify({
          title: 'Test Task',
          description: undefined,
          parentTaskId: undefined,
          labels: undefined
        })
      })
      expect(result).toEqual(mockTask)
    })

    it('should throw error when creation fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Validation failed' })
      } as Response)

      await expect(createTask({
        projectId: '1',
        title: '',
        token: 'test-token'
      })).rejects.toThrow('Validation failed')
    })
  })

  describe('updateTask', () => {
    it('should update task successfully', async () => {
      const updatedTask = { ...mockTask, title: 'Updated Task' }
      const mockResponse = { task: updatedTask }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await updateTask({
        id: '1',
        token: 'test-token',
        title: 'Updated Task',
        status: 'in-progress',
        labels: ['label-1']
      })

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:4000/api/tasks/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token'
        },
        body: JSON.stringify({
          title: 'Updated Task',
          status: 'in-progress',
          labels: ['label-1']
        })
      })
      expect(result).toEqual(updatedTask)
    })

    it('should throw error when update fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Task not found' })
      } as Response)

      await expect(updateTask({
        id: 'invalid',
        token: 'test-token',
        title: 'Updated Task'
      })).rejects.toThrow('Task not found')
    })
  })

  describe('deleteTask', () => {
    it('should delete task successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true
      } as Response)

      await deleteTask({ id: '1', token: 'test-token' })

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:4000/api/tasks/1', {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer test-token'
        }
      })
    })

    it('should throw error when deletion fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Task not found' })
      } as Response)

      await expect(deleteTask({ id: 'invalid', token: 'test-token' }))
        .rejects.toThrow('Task not found')
    })

    it('should throw generic error when no error message provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({})
      } as Response)

      await expect(deleteTask({ id: 'invalid', token: 'test-token' }))
        .rejects.toThrow('Failed to delete task')
    })
  })
})
