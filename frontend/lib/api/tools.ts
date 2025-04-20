import { apiClient } from './client'

export const toolsAPI = {
  /**
   * Search for tools based on various criteria
   */
  searchTools: async (params: {
    query?: string
    category?: string
    minPrice?: string
    maxPrice?: string
    integrations?: string
  }) => {
    try {
      const response = await apiClient.get('/api/tools/search', { params })
      return response.data
    } catch (error) {
      console.error('Error searching tools:', error)
      return { success: false, error: 'Failed to search tools' }
    }
  },

  /**
   * Get a tool by ID
   */
  getToolById: async (id: string) => {
    try {
      const response = await apiClient.get(`/api/tools/${id}`)
      return response.data
    } catch (error) {
      console.error('Error getting tool:', error)
      return { success: false, error: 'Failed to get tool' }
    }
  },

  /**
   * Get historical pricing data for a tool
   */
  getToolHistoricalData: async (id: string) => {
    try {
      const response = await apiClient.get(`/api/tools/${id}/historical`)
      return response.data
    } catch (error) {
      console.error('Error getting historical data:', error)
      return { success: false, error: 'Failed to get historical data' }
    }
  },

  /**
   * Get featured tools
   */
  getFeaturedTools: async () => {
    try {
      const response = await apiClient.get('/api/tools/featured')
      return response.data
    } catch (error) {
      console.error('Error getting featured tools:', error)
      return { success: false, error: 'Failed to get featured tools' }
    }
  },

  /**
   * Get popular tools
   */
  getPopularTools: async () => {
    try {
      const response = await apiClient.get('/api/tools/popular')
      return response.data
    } catch (error) {
      console.error('Error getting popular tools:', error)
      return { success: false, error: 'Failed to get popular tools' }
    }
  }
} 