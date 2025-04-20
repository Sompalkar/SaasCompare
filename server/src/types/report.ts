import type { Prisma } from "@prisma/client"

// Define the Report metadata type
export type ReportMetadata = {
  filePath: string
  includesAI: boolean
  generatedAt: string
  sections?: string[]
  customFields?: Record<string, any>
}

// Extend Prisma's Report type to include properly typed metadata
export type ReportWithMetadata = Prisma.ReportGetPayload<{
  include: { comparison: true }
}> & {
  metadata: ReportMetadata
}
