import { atom } from "recoil"

export interface SaasTool {
  id: string
  name: string
  logo: string
  description: string
  category: string
  website: string
  pricing: any
  integrations: string[]
  lastUpdated: string
}

export interface Comparison {
  id: string
  name: string
  tools: { id: string; name: string; logo: string; category: string }[]
  createdAt: string
}

// Selected tools for comparison
export const selectedToolsState = atom<SaasTool[]>({
  key: "selectedToolsState",
  default: [],
})

// Comparison result
export const comparisonResultState = atom<any>({
  key: "comparisonResultState",
  default: null,
})

// Search filters
export const searchFiltersState = atom<{
  query: string
  category: string
  minPrice: string
  maxPrice: string
  integrations: string
}>({
  key: "searchFiltersState",
  default: {
    query: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    integrations: "",
  },
})

// User subscription
export const userSubscriptionState = atom<any>({
  key: "userSubscriptionState",
  default: null,
})

// Saved comparisons
export const savedComparisonsState = atom<any[]>({
  key: "savedComparisonsState",
  default: [],
})

// User reports
export const userReportsState = atom<any[]>({
  key: "userReportsState",
  default: [],
})

export const categoriesState = atom<string[]>({
  key: "categoriesState",
  default: [
    "CRM",
    "Project Management",
    "Marketing",
    "Analytics",
    "Customer Support",
    "Sales",
    "Communication",
    "HR",
    "Finance",
    "IT",
    "Security",
  ],
})
