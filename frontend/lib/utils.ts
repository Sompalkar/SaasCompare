import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | string): string {
  if (typeof price === "string") {
    return price
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(price)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + "..."
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export function getPlanLimits(plan: string) {
  const limits = {
    free: {
      comparisons: 3,
      tools: 5,
      reports: 0,
    },
    pro: {
      comparisons: 20,
      tools: 20,
      reports: 10,
    },
    enterprise: {
      comparisons: 100,
      tools: 100,
      reports: 50,
    },
    custom: {
      comparisons: 1000,
      tools: 1000,
      reports: 1000,
    },
  }

  return limits[plan as keyof typeof limits] || limits.free
}

export function calculateSavings(tools: any[]): number {
  // Simple calculation - in a real app this would be more sophisticated
  if (tools.length < 2) return 0

  const totalCost = tools.reduce((sum, tool) => {
    const price = tool.pricing?.pro?.price || 0
    return sum + (typeof price === "number" ? price : 0)
  }, 0)

  // Assume 15% savings for bundling or finding better alternatives
  return totalCost * 0.15
}
