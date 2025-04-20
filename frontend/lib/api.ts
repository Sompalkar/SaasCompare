import axios from "axios"

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  withCredentials: true, // Important for cookies
  timeout: 10000, // Add timeout to prevent long-hanging requests
})

// Add a request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    // Only run on client side
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (token) {
        // Ensure token is properly formatted
        const trimmedToken = token.trim()
        config.headers.Authorization = `Bearer ${trimmedToken}`
        console.log("Setting Authorization header:", `Bearer ${trimmedToken.substring(0, 10)}...`)
      } else {
        console.log("No token found in localStorage")
      }
    }
    return config
  },
  (error) => {
    console.error("Request interceptor error:", error)
    return Promise.reject(error)
  }
)

// Add a response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // If no error config exists, return the error
    if (!originalRequest) {
      console.error("No original request config found in error", error)
      return Promise.reject(error)
    }

    // Check if error was caused by network issues
    if (error.message === "Network Error" && !originalRequest._retry) {
      originalRequest._retry = true
      console.log("Network error detected, retrying request...")
      
      // Wait 1 second before retry to allow server connection to stabilize
      await new Promise(resolve => setTimeout(resolve, 1000))
      return apiClient(originalRequest)
    }

    // Handle CORS errors
    if (error.message && error.message.includes('CORS')) {
      console.error('CORS error detected:', error.message)
    }

    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: async (name: string, email: string, password: string) => {
    try {
      const response = await apiClient.post("/auth/register", { name, email, password })
      console.log("Register API response:", response.data)
      return {
        success: true,
        data: response.data.data
      }
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  },

  login: async (email: string, password: string) => {
    try {
      // For debugging
      console.log(`Attempting login with endpoint: ${apiClient.defaults.baseURL}/auth/login`)
      
      const response = await apiClient.post("/auth/login", { email, password })
      console.log("Login API response:", response.data)
      return {
        success: true,
        data: response.data.data
      }
    } catch (error: any) {
      console.error("Login error:", error)
      // Enhance error message
      if (error.message === "Network Error") {
        console.error("Network error: Server might be down or unreachable")
      }
      throw error
    }
  },

  logout: async () => {
    try {
      const response = await apiClient.post("/auth/logout")
      return response.data
    } catch (error) {
      console.error("Logout error:", error)
      throw error
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await apiClient.get("/auth/me")
      console.log("getCurrentUser API response:", response.data)
      return {
        success: true,
        user: response.data.data
      }
    } catch (error) {
      console.error("Get current user error:", error)
      throw error
    }
  },
}

// Tools API
export const toolsAPI = {
  getAllTools: async () => {
    try {
      const response = await apiClient.get("/tools")
      return response.data
    } catch (error) {
      console.error("Get all tools error:", error)
      throw error
    }
  },

  searchTools: async (params: any) => {
    try {
      const response = await apiClient.get("/tools/search", { params })
      return response.data
    } catch (error) {
      console.error("Search tools error:", error)
      throw error
    }
  },

  getToolById: async (id: string) => {
    try {
      const response = await apiClient.get(`/tools/${id}`)
      return response.data
    } catch (error) {
      console.error("Get tool by ID error:", error)
      throw error
    }
  },

  getToolCategories: async () => {
    try {
      const response = await apiClient.get("/tools/categories")
      return response.data
    } catch (error) {
      console.error("Get tool categories error:", error)
      throw error
    }
  },

  getToolsByCategory: async (category: string) => {
    try {
      const response = await apiClient.get(`/tools/category/${encodeURIComponent(category)}`)
      return response.data
    } catch (error) {
      console.error(`Get tools by category ${category} error:`, error)
      throw error
    }
  },

  scrapeToolData: async (url: string, toolName?: string) => {
    try {
      const response = await apiClient.post("/scraping/tools/scrape", { url, toolName })
      return response.data
    } catch (error) {
      console.error("Scrape tool data error:", error)
      throw error
    }
  },
}

// Compare API
export const compareAPI = {
  compareTools: async (toolIds: string[]) => {
    try {
      const response = await apiClient.post("/compare", { toolIds })
      return response.data
    } catch (error) {
      console.error("Compare tools error:", error)
      throw error
    }
  },

  getComparisonById: async (id: string) => {
    try {
      const response = await apiClient.get(`/compare/${id}`)
      return response.data
    } catch (error) {
      console.error("Get comparison by ID error:", error)
      throw error
    }
  },

  saveComparison: async (data: { name: string, tools: string[] }) => {
    try {
      const response = await apiClient.post("/compare/save", data)
      console.log("Save comparison response:", response.data)
      return response.data
    } catch (error) {
      console.error("Save comparison error:", error)
      throw error
    }
  },

  generateReport: async (comparisonId: string, format: "PDF" | "EXCEL" | "CSV", includeAIInsights: boolean) => {
    try {
      const response = await apiClient.post("/reports/generate", { comparisonId, format, includeAIInsights })
      return response.data
    } catch (error) {
      console.error("Generate report error:", error)
      throw error
    }
  },

  getUserReports: async () => {
    try {
      const response = await apiClient.get("/reports/user")
      return response.data
    } catch (error) {
      console.error("Get user reports error:", error)
      throw error
    }
  },

  getReportById: async (id: string) => {
    try {
      const response = await apiClient.get(`/reports/${id}`)
      return response.data
    } catch (error) {
      console.error("Get report by ID error:", error)
      throw error
    }
  },

  downloadReport: async (id: string) => {
    try {
      const response = await apiClient.get(`/reports/${id}/download`, { responseType: "blob" })
      return response.data
    } catch (error) {
      console.error("Download report error:", error)
      throw error
    }
  },

  deleteReport: async (id: string) => {
    try {
      const response = await apiClient.delete(`/reports/${id}`)
      return response.data
    } catch (error) {
      console.error("Delete report error:", error)
      throw error
    }
  },
}

// Cloud Providers API
export const cloudProvidersAPI = {
  getServiceTypes: async () => {
    try {
      const response = await apiClient.get("/cloud-providers/service-types")
      return response.data
    } catch (error) {
      console.error("Get service types error:", error)
      throw error
    }
  },

  getProviderDetails: async (provider: string) => {
    try {
      const response = await apiClient.get(`/cloud-providers/providers/${provider}`)
      return response.data
    } catch (error) {
      console.error("Get provider details error:", error)
      throw error
    }
  },

  compareProviders: async (providers: string[], serviceTypes: string[]) => {
    try {
      const response = await apiClient.post("/cloud-providers/compare", { providers, serviceTypes })
      return response.data
    } catch (error) {
      console.error("Compare providers error:", error)
      throw error
    }
  },

  getComparisonById: async (id: string) => {
    try {
      const response = await apiClient.get(`/cloud-providers/comparisons/${id}`)
      return response.data
    } catch (error) {
      console.error("Get cloud comparison by ID error:", error)
      throw error
    }
  },

  saveComparison: async (id: string, name: string) => {
    try {
      const response = await apiClient.patch(`/cloud-providers/comparisons/${id}`, { name })
      return response.data
    } catch (error) {
      console.error("Save cloud comparison error:", error)
      throw error
    }
  },
}

// Price Alert API
export const priceAlertAPI = {
  subscribeToPriceAlerts: async (params: { toolId?: string, threshold?: number }) => {
    try {
      const response = await apiClient.post("/price-alerts/subscribe", params)
      return response.data
    } catch (error) {
      console.error("Error subscribing to price alerts:", error)
      return { success: false, message: "Failed to subscribe to price alerts" }
    }
  },

  unsubscribeFromPriceAlerts: async (params: { toolId?: string }) => {
    try {
      const response = await apiClient.post("/price-alerts/unsubscribe", params)
      return response.data
    } catch (error) {
      console.error("Error unsubscribing from price alerts:", error)
      return { success: false, message: "Failed to unsubscribe from price alerts" }
    }
  },

  updatePriceAlertThreshold: async (threshold: number) => {
    try {
      const response = await apiClient.patch("/price-alerts/threshold", { threshold })
      return response.data
    } catch (error) {
      console.error("Error updating price alert threshold:", error)
      return { success: false, message: "Failed to update price alert threshold" }
    }
  },

  getPriceAlertPreferences: async () => {
    try {
      const response = await apiClient.get("/price-alerts/preferences")
      return response.data
    } catch (error) {
      console.error("Error getting price alert preferences:", error)
      return { success: false, message: "Failed to get price alert preferences" }
    }
  },
}

// AI API
export const aiAPI = {
  generateInsights: async (comparisonId: string) => {
    try {
      const response = await apiClient.post(`/ai/insights`, { comparisonId })
      return response.data
    } catch (error) {
      console.error("Generate AI insights error:", error)
      throw error
    }
  },

  extractDataFromImage: async (imageBase64: string) => {
    try {
      const response = await apiClient.post(`/ai/extract-image`, { image: imageBase64 })
      return response.data
    } catch (error) {
      console.error("Extract data from image error:", error)
      throw error
    }
  },

  extractDataFromPDF: async (pdfBase64: string) => {
    try {
      const response = await apiClient.post(`/ai/extract-pdf`, { pdf: pdfBase64 })
      return response.data
    } catch (error) {
      console.error("Extract data from PDF error:", error)
      throw error
    }
  },
}

// Profile API
export const profileAPI = {
  getUserProfile: async () => {
    try {
      const response = await apiClient.get("/user/profile")
      return response.data
    } catch (error) {
      console.error("Get user profile error:", error)
      throw error
    }
  },

  updateUserProfile: async (data: any) => {
    try {
      const response = await apiClient.patch("/user/profile", data)
      return response.data
    } catch (error) {
      console.error("Update user profile error:", error)
      throw error
    }
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      const response = await apiClient.post("/user/change-password", { currentPassword, newPassword })
      return response.data
    } catch (error) {
      console.error("Change password error:", error)
      throw error
    }
  },

  deleteAccount: async (password: string) => {
    try {
      const response = await apiClient.post("/user/delete-account", { password })
      return response.data
    } catch (error) {
      console.error("Delete account error:", error)
      throw error
    }
  }
}

// System API - for health checks and status
export const systemAPI = {
  healthCheck: async () => {
    try {
      const response = await apiClient.get("/health", { timeout: 3000 })
      return {
        success: true,
        status: response.status,
        data: response.data
      }
    } catch (error) {
      console.error("API Health check failed:", error)
      return {
        success: false,
        error: error
      }
    }
  }
}

// Export the raw client for advanced use cases
export { apiClient }
