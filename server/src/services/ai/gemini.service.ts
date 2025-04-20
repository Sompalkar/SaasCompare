import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai"
import { logger } from "../../utils/logger"

export interface AIServiceConfig {
  apiKey: string
  modelName?: string
  maxOutputTokens?: number
  temperature?: number
}

export interface ComparisonData {
  tools: Array<{
    id: string
    name: string
    description: string
    website: string
    pricingPlans: Array<{
      name: string
      price: number | null
      features: string[]
      limitations: string[]
    }>
    features: string[]
    integrations: string[]
  }>
  features: string[]
}

export interface UserRequirements {
  budget?: number
  mustHaveFeatures?: string[]
  niceToHaveFeatures?: string[]
  industry?: string
  companySize?: string
  useCase?: string
}

export interface AIGeneratedReport {
  executiveSummary: string
  detailedAnalysis: string
  recommendations: string
  pricingAnalysis: string
  featureComparison: string
  marketPositioning: string
  futureTrends?: string
}

export class GeminiAIService {
  private genAI: GoogleGenerativeAI
  private model: GenerativeModel
  private visionModel: GenerativeModel

  constructor(config: AIServiceConfig) {
    this.genAI = new GoogleGenerativeAI(config.apiKey)

    this.model = this.genAI.getGenerativeModel({
      model: config.modelName || "gemini-pro",
      generationConfig: {
        maxOutputTokens: config.maxOutputTokens || 8192,
        temperature: config.temperature || 0.7,
      },
    })

    this.visionModel = this.genAI.getGenerativeModel({
      model: "gemini-pro-vision",
      generationConfig: {
        maxOutputTokens: config.maxOutputTokens || 8192,
        temperature: config.temperature || 0.7,
      },
    })
  }

  /**
   * Generate comprehensive insights for a comparison
   */
  async generateComparisonInsights(comparisonData: ComparisonData): Promise<string> {
    try {
      const prompt = this.buildComparisonPrompt(comparisonData)
      const result = await this.model.generateContent(prompt)
      return result.response.text()
    } catch (error) {
      logger.error("Error generating comparison insights:", error)
      throw new Error(
        `Failed to generate comparison insights: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Generate personalized recommendations based on user requirements
   */
  async generateRecommendations(userRequirements: UserRequirements, comparisonData: ComparisonData): Promise<string> {
    try {
      const prompt = this.buildRecommendationPrompt(userRequirements, comparisonData)
      const result = await this.model.generateContent(prompt)
      return result.response.text()
    } catch (error) {
      logger.error("Error generating recommendations:", error)
      throw new Error(`Failed to generate recommendations: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Generate an executive summary for a comparison
   */
  async generateExecutiveSummary(comparisonData: ComparisonData): Promise<string> {
    try {
      const prompt = this.buildExecutiveSummaryPrompt(comparisonData)
      const result = await this.model.generateContent(prompt)
      return result.response.text()
    } catch (error) {
      logger.error("Error generating executive summary:", error)
      throw new Error(`Failed to generate executive summary: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Generate pricing analysis for compared tools
   */
  async generatePricingAnalysis(comparisonData: ComparisonData): Promise<string> {
    try {
      const prompt = this.buildPricingAnalysisPrompt(comparisonData)
      const result = await this.model.generateContent(prompt)
      return result.response.text()
    } catch (error) {
      logger.error("Error generating pricing analysis:", error)
      throw new Error(`Failed to generate pricing analysis: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Generate feature comparison analysis
   */
  async generateFeatureComparison(comparisonData: ComparisonData): Promise<string> {
    try {
      const prompt = this.buildFeatureComparisonPrompt(comparisonData)
      const result = await this.model.generateContent(prompt)
      return result.response.text()
    } catch (error) {
      logger.error("Error generating feature comparison:", error)
      throw new Error(
        `Failed to generate feature comparison: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Generate market positioning analysis
   */
  async generateMarketPositioning(comparisonData: ComparisonData): Promise<string> {
    try {
      const prompt = this.buildMarketPositioningPrompt(comparisonData)
      const result = await this.model.generateContent(prompt)
      return result.response.text()
    } catch (error) {
      logger.error("Error generating market positioning:", error)
      throw new Error(
        `Failed to generate market positioning: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Generate future trends analysis
   */
  async generateFutureTrends(comparisonData: ComparisonData): Promise<string> {
    try {
      const prompt = this.buildFutureTrendsPrompt(comparisonData)
      const result = await this.model.generateContent(prompt)
      return result.response.text()
    } catch (error) {
      logger.error("Error generating future trends:", error)
      throw new Error(`Failed to generate future trends: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Generate a complete report with all sections
   */
  async generateCompleteReport(
    comparisonData: ComparisonData,
    userRequirements?: UserRequirements,
  ): Promise<AIGeneratedReport> {
    try {
      // Generate all sections in parallel for efficiency
      const [
        executiveSummary,
        detailedAnalysis,
        pricingAnalysis,
        featureComparison,
        marketPositioning,
        recommendations,
        futureTrends,
      ] = await Promise.all([
        this.generateExecutiveSummary(comparisonData),
        this.generateComparisonInsights(comparisonData),
        this.generatePricingAnalysis(comparisonData),
        this.generateFeatureComparison(comparisonData),
        this.generateMarketPositioning(comparisonData),
        userRequirements ? this.generateRecommendations(userRequirements, comparisonData) : Promise.resolve(""),
        this.generateFutureTrends(comparisonData),
      ])

      return {
        executiveSummary,
        detailedAnalysis,
        recommendations,
        pricingAnalysis,
        featureComparison,
        marketPositioning,
        futureTrends,
      }
    } catch (error) {
      logger.error("Error generating complete report:", error)
      throw new Error(`Failed to generate complete report: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Extract structured data from a pricing page screenshot
   */
  async extractDataFromScreenshot(imageBase64: string): Promise<any> {
    try {
      const prompt =
        "Analyze this pricing page screenshot and extract all pricing tiers, features, and limitations in a structured JSON format. Include the following fields for each pricing tier: name, price (as a number or null if it's custom pricing), features (as an array of strings), and limitations (as an array of strings)."

      const result = await this.visionModel.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageBase64,
          },
        },
      ])

      const responseText = result.response.text()

      // Extract JSON from response
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/)
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1])
      }

      throw new Error("Failed to extract structured data from image")
    } catch (error) {
      logger.error("Error extracting data from screenshot:", error)
      throw new Error(
        `Failed to extract data from screenshot: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Extract structured data from a PDF document
   */
  async extractDataFromPDF(pdfText: string): Promise<any> {
    try {
      const prompt = `
        Analyze the following text extracted from a PDF document and extract all pricing information, features, and limitations in a structured JSON format:
        
        ${pdfText.substring(0, 15000)} // Limit text length to avoid token limits
        
        Return the data in the following JSON format:
        {
          "pricingTiers": [
            {
              "name": "tier name",
              "price": number or null,
              "features": ["feature 1", "feature 2"],
              "limitations": ["limitation 1", "limitation 2"]
            }
          ],
          "additionalInformation": "any other relevant information"
        }
      `

      const result = await this.model.generateContent(prompt)
      const responseText = result.response.text()

      // Extract JSON from response
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/)
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1])
      }

      // If no JSON block found, try to parse the entire response
      try {
        return JSON.parse(responseText)
      } catch (e) {
        throw new Error("Failed to extract structured data from PDF")
      }
    } catch (error) {
      logger.error("Error extracting data from PDF:", error)
      throw new Error(`Failed to extract data from PDF: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Private methods for building prompts

  private buildComparisonPrompt(comparisonData: ComparisonData): string {
    return `
      Analyze the following SaaS tools comparison data and provide detailed insights:
      ${JSON.stringify(comparisonData, null, 2)}
      
      Please include:
      1. Key differentiators between the tools
      2. Strengths and weaknesses of each tool
      3. Value proposition analysis
      4. Pricing efficiency (features per dollar)
      5. Target audience for each tool
      
      Format your response with clear headings and bullet points for readability.
    `
  }

  private buildRecommendationPrompt(userRequirements: UserRequirements, comparisonData: ComparisonData): string {
    return `
      Based on the following user requirements and comparison data, provide personalized recommendations:
      
      User Requirements: ${JSON.stringify(userRequirements, null, 2)}
      Comparison Data: ${JSON.stringify(comparisonData, null, 2)}
      
      Please include:
      1. Top 3 recommended tools with justification
      2. Features that match user requirements
      3. Potential limitations or concerns
      4. Cost-benefit analysis
      5. Implementation considerations
      
      Format your response with clear headings and bullet points for readability.
    `
  }

  private buildExecutiveSummaryPrompt(comparisonData: ComparisonData): string {
    return `
      Create a concise executive summary of the following SaaS tools comparison:
      ${JSON.stringify(comparisonData, null, 2)}
      
      The summary should be business-focused and include:
      1. Overview of compared tools (${comparisonData.tools.map((t) => t.name).join(", ")})
      2. Key findings and insights
      3. Strategic recommendations
      4. Potential ROI and business impact
      5. Next steps for decision makers
      
      Keep the summary under 500 words and format it for executive readability.
    `
  }

  private buildPricingAnalysisPrompt(comparisonData: ComparisonData): string {
    return `
      Analyze the pricing models of the following SaaS tools:
      ${JSON.stringify(
        comparisonData.tools.map((t) => ({
          name: t.name,
          pricingPlans: t.pricingPlans,
        })),
        null,
        2,
      )}
      
      Please include:
      1. Pricing tier comparison across tools
      2. Value for money analysis
      3. Hidden costs and considerations
      4. Pricing strategy insights
      5. Recommendations for different business sizes
      
      Format your response with clear headings, tables where appropriate, and bullet points for readability.
    `
  }

  private buildFeatureComparisonPrompt(comparisonData: ComparisonData): string {
    return `
      Create a detailed feature comparison for the following SaaS tools:
      ${JSON.stringify(comparisonData, null, 2)}
      
      Please include:
      1. Feature parity analysis
      2. Unique features of each tool
      3. Feature quality and implementation differences
      4. Feature gaps and limitations
      5. Feature roadmap considerations (if available)
      
      Format your response with clear headings and use tables or bullet points for feature comparisons.
    `
  }

  private buildMarketPositioningPrompt(comparisonData: ComparisonData): string {
    return `
      Analyze the market positioning of the following SaaS tools:
      ${JSON.stringify(
        comparisonData.tools.map((t) => ({
          name: t.name,
          description: t.description,
        })),
        null,
        2,
      )}
      
      Please include:
      1. Target market segments for each tool
      2. Competitive positioning analysis
      3. Unique selling propositions
      4. Brand perception and market presence
      5. Market share and growth trajectory (if discernible)
      
      Format your response with clear headings and bullet points for readability.
    `
  }

  private buildFutureTrendsPrompt(comparisonData: ComparisonData): string {
    return `
      Based on the following SaaS tools and market data, predict future trends in this space:
      ${JSON.stringify(
        comparisonData.tools.map((t) => t.name),
        null,
        2,
      )}
      
      Please include:
      1. Emerging features and capabilities
      2. Pricing model evolution
      3. Market consolidation predictions
      4. Technology adoption trends
      5. Regulatory and compliance considerations
      
      Format your response with clear headings and bullet points for readability.
    `
  }
}
