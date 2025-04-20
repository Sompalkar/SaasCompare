import { atom } from "recoil"

// Define SaasTool type
export interface SaasTool {
  id: string
  name: string
  logo: string
  description: string
  category: string
  website: string
  pricing: {
    free: any
    starter: any
    pro: any
    enterprise?: any
  }
  integrations: string[]
  lastUpdated: string
}

// Define CloudProvider type
export interface CloudProvider {
  id: string
  name: string
  logo: string
  description: string
  website: string
  services: CloudService[]
  lastUpdated: string
}

export interface CloudService {
  id: string
  name: string
  type: string
  description: string
  pricing: any
}

// Categories state
export const categoriesState = atom({
  key: "categoriesState",
  default: [
    "CRM",
    "Marketing",
    "Project Management",
    "Communication",
    "HR",
    "Finance",
    "Customer Support",
    "Analytics",
    "Design",
    "Development",
  ],
})

// Selected tools state
export const selectedToolsState = atom<SaasTool[]>({
  key: "selectedToolsState",
  default: [],
})

// Search filters state
export const searchFiltersState = atom({
  key: "searchFiltersState",
  default: {
    query: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    integrations: "",
  },
})

// Selected cloud providers state
export const selectedProvidersState = atom<CloudProvider[]>({
  key: "selectedProvidersState",
  default: [],
})

// Selected service types state
export const selectedServiceTypesState = atom<string[]>({
  key: "selectedServiceTypesState",
  default: [],
})

// Cloud provider search filters state
export const cloudProviderFiltersState = atom({
  key: "cloudProviderFiltersState",
  default: {
    query: "",
    serviceType: "",
  },
})
