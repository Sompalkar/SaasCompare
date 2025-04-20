import { apiClient } from './client'

export const aiAPI = {
  /**
   * Get AI-powered recommendations based on user requirements
   */
  getRecommendations: async (data: {
    category?: string
    budget?: number
    features?: string[]
    teamSize?: number
    industry?: string
  }) => {
    try {
      const response = await apiClient.post('/api/ai/recommendations', data)
      return response.data
    } catch (error) {
      console.error('Error getting AI recommendations:', error)
      return { success: false, error: 'Failed to get recommendations' }
    }
  },

  /**
   * Get AI-powered comparison insights for multiple tools
   */
  compareTools: async (tools: any[]) => {
    try {
      const response = await apiClient.post('/api/ai/compare', { tools })
      return response.data
    } catch (error) {
      console.error('Error getting AI comparison:', error)
      return { success: false, error: 'Failed to get comparison insights' }
    }
  },

  /**
   * Get AI-powered pricing trend analysis and cost-saving recommendations
   */
  analyzePricingTrends: async (tool: any, historicalData: any[] = []) => {
    try {
      const response = await apiClient.post('/api/ai/pricing-analysis', {
        tool,
        historicalData
      })
      return response.data
    } catch (error) {
      console.error('Error analyzing pricing trends:', error)
      return { success: false, error: 'Failed to analyze pricing trends' }
    }
  }
} 