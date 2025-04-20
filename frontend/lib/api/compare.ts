import { apiClient } from './client'

export const compareAPI = {
  /**
   * Compare multiple tools
   */
  compareTools: async (toolIds: string[]) => {
    try {
      const response = await apiClient.post('/api/compare', { toolIds })
      return response.data
    } catch (error) {
      console.error('Error comparing tools:', error)
      return { success: false, error: 'Failed to compare tools' }
    }
  },

  /**
   * Save a comparison
   */
  saveComparison: async (data: { name: string, tools: string[], userId: string }) => {
    try {
      const response = await apiClient.post('/api/compare/save', data)
      return response.data
    } catch (error) {
      console.error('Error saving comparison:', error)
      return { success: false, error: 'Failed to save comparison' }
    }
  },

  /**
   * Get a saved comparison by ID
   */
  getComparisonById: async (id: string) => {
    try {
      const response = await apiClient.get(`/api/compare/${id}`)
      return response.data
    } catch (error) {
      console.error('Error getting comparison:', error)
      return { success: false, error: 'Failed to get comparison' }
    }
  },

  /**
   * Get user's saved comparisons
   */
  getSavedComparisons: async () => {
    try {
      const response = await apiClient.get('/api/compare/saved')
      return response.data
    } catch (error) {
      console.error('Error getting saved comparisons:', error)
      return { success: false, error: 'Failed to get saved comparisons' }
    }
  },

  /**
   * Delete a saved comparison
   */
  deleteComparison: async (id: string) => {
    try {
      const response = await apiClient.delete(`/api/compare/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting comparison:', error)
      return { success: false, error: 'Failed to delete comparison' }
    }
  },

  /**
   * Export a comparison to PDF, Excel, or other formats
   */
  exportComparison: async (data: { format: string, tools: any[] }) => {
    try {
      const response = await apiClient.post('/api/compare/export', data)
      return response.data
    } catch (error) {
      console.error('Error exporting comparison:', error)
      return { success: false, error: 'Failed to export comparison' }
    }
  },

  /**
   * Get historical pricing data for tools
   */
  getHistoricalData: async (toolIds: string[]) => {
    try {
      const response = await apiClient.post('/api/compare/historical', { toolIds })
      return response.data
    } catch (error) {
      console.error('Error getting historical data:', error)
      return { success: false, error: 'Failed to get historical data' }
    }
  }
} 