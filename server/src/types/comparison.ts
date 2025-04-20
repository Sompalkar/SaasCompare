export interface PricingPlan {
    name: string
    price: number | null
    features: string[]
    limitations: string[]
  }
  
  export interface Tool {
    id: string
    name: string
    description: string
    website: string
    pricingPlans: PricingPlan[]
    features: string[]
    integrations: string[]
  }
  
  export interface ComparisonResult {
    tools: Tool[]
    features: string[]
  }
  