import { listProjects, createProject } from './project'
import type { Project } from '../types/project'

// Mock fetch
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>
global.fetch = mockFetch

// Mock project data
const mockProject: Project = {
  id: '1',
  name: 'Test Project',
  description: 'Test Description',
  workspaceId: '1'
}

describe('Project Service', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  describe('listProjects', () => {
    it('should fetch projects successfully', async () => {
      const mockResponse = { projects: [mockProject] }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await listProjects({ workspaceId: '1', token: 'test-token' })

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:4000/api/workspaces/1/projects', {
        headers: { Authorization: 'Bearer test-token' }
      })
      expect(result).toEqual([mockProject])
    })

    it('should throw error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed to fetch projects' })
      } as Response)

      await expect(listProjects({ workspaceId: '1', token: 'test-token' }))
        .rejects.toThrow('Failed to fetch projects')
    })

    it('should throw generic error when no error message provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({})
      } as Response)

      await expect(listProjects({ workspaceId: '1', token: 'test-token' }))
        .rejects.toThrow('Failed to fetch projects')
    })
  })

  describe('createProject', () => {
    it('should create project successfully', async () => {
      const mockResponse = { project: mockProject }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await createProject({
        workspaceId: '1',
        name: 'Test Project',
        description: 'Test Description',
        token: 'test-token'
      })

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:4000/api/workspaces/1/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token'
        },
        body: JSON.stringify({
          name: 'Test Project',
          description: 'Test Description'
        })
      })
      expect(result).toEqual(mockProject)
    })

    it('should create project with minimal data', async () => {
      const mockResponse = { project: mockProject }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await createProject({
        workspaceId: '1',
        name: 'Test Project',
        token: 'test-token'
      })

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:4000/api/workspaces/1/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token'
        },
        body: JSON.stringify({
          name: 'Test Project',
          description: undefined
        })
      })
      expect(result).toEqual(mockProject)
    })

    it('should throw error when creation fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Validation failed' })
      } as Response)

      await expect(createProject({
        workspaceId: '1',
        name: '',
        token: 'test-token'
      })).rejects.toThrow('Validation failed')
    })

    it('should throw generic error when no error message provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({})
      } as Response)

      await expect(createProject({
        workspaceId: '1',
        name: 'Test Project',
        token: 'test-token'
      })).rejects.toThrow('Failed to create project')
    })
  })
})
