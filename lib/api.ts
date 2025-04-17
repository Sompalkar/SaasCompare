import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password })
    return response.data
  },
  register: async (name: string, email: string, password: string) => {
    const response = await api.post("/auth/register", { name, email, password })
    return response.data
  },
  logout: async () => {
    const response = await api.post("/auth/logout")
    return response.data
  },
  getCurrentUser: async () => {
    const response = await api.get("/auth/me")
    return response.data
  },
  refreshToken: async () => {
    const response = await api.post("/auth/refresh-token")
    return response.data
  },
  forgotPassword: async (email: string) => {
    const response = await api.post("/auth/forgot-password", { email })
    return response.data
  },
  resetPassword: async (token: string, password: string) => {
    const response = await api.post("/auth/reset-password", { token, password })
    return response.data
  },
}

// Tools API
export const toolsAPI = {
  getAllTools: async (page = 1, limit = 10) => {
    const response = await api.get(`/tools?page=${page}&limit=${limit}`)
    return response.data
  },
  getToolById: async (id: string) => {
    const response = await api.get(`/tools/${id}`)
    return response.data
  },
  getToolsByCategory: async (category: string, page = 1, limit = 10) => {
    const response = await api.get(`/tools/category/${category}?page=${page}&limit=${limit}`)
    return response.data
  },
  searchTools: async (params: any) => {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value as string)
      }
    })
    const response = await api.get(`/tools/search?${queryParams.toString()}`)
    return response.data
  },
}

// Compare API
export const compareAPI = {
  compareTools: async (toolIds: string[], features?: string[]) => {
    const response = await api.post("/compare", { toolIds, features })
    return response.data
  },
  getComparisonById: async (id: string) => {
    const response = await api.get(`/compare/${id}`)
    return response.data
  },
}

// User API
export const userAPI = {
  getUserComparisons: async () => {
    const response = await api.get("/user/comparisons")
    return response.data
  },
  getSavedComparisonById: async (id: string) => {
    const response = await api.get(`/user/comparisons/${id}`)
    return response.data
  },
  saveComparison: async (comparisonId: string, name: string) => {
    const response = await api.post("/user/comparisons", { comparisonId, name })
    return response.data
  },
  deleteComparison: async (id: string) => {
    const response = await api.delete(`/user/comparisons/${id}`)
    return response.data
  },
  updateUserProfile: async (data: any) => {
    const response = await api.patch("/user/profile", data)
    return response.data
  },
  getUserReports: async () => {
    const response = await api.get("/user/reports")
    return response.data
  },
}

// Subscription API
export const subscriptionAPI = {
  getCurrentSubscription: async () => {
    const response = await api.get("/subscription")
    return response.data
  },
  createCheckoutSession: async (planId: string, successUrl: string, cancelUrl: string) => {
    const response = await api.post("/subscription/checkout", { planId, successUrl, cancelUrl })
    return response.data
  },
  cancelSubscription: async () => {
    const response = await api.post("/subscription/cancel")
    return response.data
  },
  updateSubscription: async (planId: string) => {
    const response = await api.patch("/subscription", { planId })
    return response.data
  },
}

// Reports API
export const reportsAPI = {
  generateReport: async (comparisonId: string, format: string, includeCharts = false) => {
    const response = await api.post("/reports/generate", { comparisonId, format, includeCharts })
    return response.data
  },
  getReports: async () => {
    const response = await api.get("/reports")
    return response.data
  },
  getReportById: async (id: string) => {
    const response = await api.get(`/reports/${id}`)
    return response.data
  },
  downloadReport: async (id: string) => {
    window.open(`${API_URL}/reports/${id}/download`, "_blank")
  },
}

// Admin API
export const adminAPI = {
  // Tools management
  createTool: async (data: any) => {
    const response = await api.post("/admin/tools", data)
    return response.data
  },
  updateTool: async (id: string, data: any) => {
    const response = await api.patch(`/admin/tools/${id}`, data)
    return response.data
  },
  deleteTool: async (id: string) => {
    const response = await api.delete(`/admin/tools/${id}`)
    return response.data
  },

  // User management
  getAllUsers: async () => {
    const response = await api.get("/admin/users")
    return response.data
  },
  getUserById: async (id: string) => {
    const response = await api.get(`/admin/users/${id}`)
    return response.data
  },
  updateUser: async (id: string, data: any) => {
    const response = await api.patch(`/admin/users/${id}`, data)
    return response.data
  },
  deleteUser: async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`)
    return response.data
  },

  // Scraping management
  createScrapingJob: async (data: any) => {
    const response = await api.post("/scraping/jobs", data)
    return response.data
  },
  getAllScrapingJobs: async () => {
    const response = await api.get("/scraping/jobs")
    return response.data
  },
  getScrapingJobStatus: async (id: string) => {
    const response = await api.get(`/scraping/jobs/${id}`)
    return response.data
  },
}

// Cloud Providers API
export const cloudProvidersAPI = {
  getAllProviders: async () => {
    const response = await api.get("/cloud-providers")
    return response.data
  },
  getProviderById: async (id: string) => {
    const response = await api.get(`/cloud-providers/${id}`)
    return response.data
  },
  compareProviders: async (providerIds: string[], serviceTypes?: string[]) => {
    const response = await api.post("/cloud-providers/compare", { providerIds, serviceTypes })
    return response.data
  },
  getServiceTypes: async () => {
    const response = await api.get("/cloud-providers/service-types")
    return response.data
  },
}

export default api
