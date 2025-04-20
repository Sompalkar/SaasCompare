"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiService = void 0;
const generative_ai_1 = require("@google/generative-ai");
const logger_1 = require("../utils/logger");
class AIService {
    constructor() {
        // Initialize the Google Generative AI with API key from environment variables
        const API_KEY = process.env.GEMINI_API_KEY;
        if (!API_KEY) {
            logger_1.logger.error('Missing GEMINI_API_KEY in environment variables');
            throw new Error('Gemini API key is required');
        }
        this.genAI = new generative_ai_1.GoogleGenerativeAI(API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    }
    /**
     * Get AI recommendations for SaaS tools based on user requirements
     */
    async getRecommendations(userRequirements) {
        try {
            const prompt = this.buildRecommendationPrompt(userRequirements);
            const result = await this.model.generateContent(prompt);
            const response = result.response;
            return {
                success: true,
                data: response.text(),
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting AI recommendations', error);
            return {
                success: false,
                error: 'Failed to generate recommendations',
            };
        }
    }
    /**
     * Compare two or more tools and provide insights
     */
    async compareTools(toolsData) {
        try {
            const prompt = this.buildComparisonPrompt(toolsData);
            const result = await this.model.generateContent(prompt);
            const response = result.response;
            return {
                success: true,
                data: response.text(),
            };
        }
        catch (error) {
            logger_1.logger.error('Error comparing tools with AI', error);
            return {
                success: false,
                error: 'Failed to generate comparison insights',
            };
        }
    }
    /**
     * Analyze pricing trends and provide cost-saving recommendations
     */
    async analyzePricingTrends(toolData, historicalData) {
        try {
            const prompt = this.buildPricingAnalysisPrompt(toolData, historicalData);
            const result = await this.model.generateContent(prompt);
            const response = result.response;
            return {
                success: true,
                data: response.text(),
            };
        }
        catch (error) {
            logger_1.logger.error('Error analyzing pricing trends', error);
            return {
                success: false,
                error: 'Failed to analyze pricing trends',
            };
        }
    }
    /**
     * Build a prompt for getting recommendations
     */
    buildRecommendationPrompt(userRequirements) {
        return `
      You are an expert SaaS advisor. Based on the following requirements, recommend the best SaaS tools:
      
      Category: ${userRequirements.category || 'Any'}
      Budget: ${userRequirements.budget ? '$' + userRequirements.budget : 'Not specified'}
      Required Features: ${userRequirements.features?.join(', ') || 'Not specified'}
      Team Size: ${userRequirements.teamSize || 'Not specified'}
      Industry: ${userRequirements.industry || 'Not specified'}
      
      Provide a list of recommended tools with brief descriptions, key strengths, and pricing information.
      Format your response as a structured JSON with recommendations and reasoning.
    `;
    }
    /**
     * Build a prompt for comparing tools
     */
    buildComparisonPrompt(toolsData) {
        const toolNames = toolsData.map(tool => tool.name).join(', ');
        let prompt = `
      You are an expert SaaS advisor. Compare the following tools: ${toolNames}.
      
      For each tool, I'll provide details about features, pricing, and other relevant information:
      
    `;
        toolsData.forEach(tool => {
            prompt += `
        Tool: ${tool.name}
        Description: ${tool.description || 'Not provided'}
        Category: ${tool.category || 'Not specified'}
        Features: ${JSON.stringify(tool.features) || 'Not specified'}
        Pricing: ${JSON.stringify(tool.pricing) || 'Not specified'}
        Integrations: ${tool.integrations?.join(', ') || 'Not specified'}
      `;
        });
        prompt += `
      Provide a detailed comparison analysis covering:
      1. Feature comparison (strengths and weaknesses)
      2. Pricing comparison and value analysis
      3. Best use cases for each tool
      4. Recommendation based on different user needs (small business, enterprise, etc.)
      
      Format your response as a structured analysis that's easy to read.
    `;
        return prompt;
    }
    /**
     * Build a prompt for pricing analysis
     */
    buildPricingAnalysisPrompt(toolData, historicalData) {
        return `
      You are an expert SaaS pricing analyst. Analyze the pricing trends for ${toolData.name}.
      
      Current Pricing Information:
      ${JSON.stringify(toolData.pricing) || 'Not provided'}
      
      Historical Pricing Data:
      ${JSON.stringify(historicalData) || 'Not provided'}
      
      Provide analysis on:
      1. Price changes over time
      2. Value for money compared to competitors
      3. Predictions for future pricing
      4. Cost-saving recommendations
      
      Format your response as a structured analysis with clear sections.
    `;
    }
}
exports.aiService = new AIService();
