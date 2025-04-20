import puppeteer, { type Browser } from "puppeteer"

// Define types
export interface PricingPlan {
  name: string
  price: number | null
  features: string[]
  limitations: string[]
}

export interface ScrapingResult {
  name: string
  description: string
  website: string
  pricingPlans: PricingPlan[]
  integrations: string[]
  categories: string[]
}

export const scrapePricingPage = async (url: string): Promise<ScrapingResult> => {
  let browser: Browser | null = null

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })

    const page = await browser.newPage()
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 })

    // Extract basic information
    const title = await page.title()
    let description = ""

    // Try to get description from meta tag
    const metaDescription = await page.$('meta[name="description"]')
    if (metaDescription) {
      description = await page.evaluate((el) => el.getAttribute("content") || "", metaDescription)
    }

    // If no meta description, try to get the first paragraph
    if (!description) {
      const firstParagraph = await page.$("p")
      if (firstParagraph) {
        description = await page.evaluate((el) => el.textContent || "", firstParagraph)
      }
    }

    // Extract pricing plans
    const pricingPlans: PricingPlan[] = []

    // Look for pricing plan containers
    const planContainers = await page.$$(".pricing-plan, .plan, .pricing-card, .price-card, .card")

    for (const container of planContainers) {
      // Extract plan name
      const planNameElement = await container.$("h2, h3, .plan-name, .pricing-title")
      const planName = planNameElement
        ? await page.evaluate((el) => el.textContent?.trim() || "", planNameElement)
        : "Unknown Plan"

      // Extract price
      const priceElement = await container.$(".price, .pricing, .amount, .cost")
      const priceText = priceElement ? await page.evaluate((el) => el.textContent?.trim() || "", priceElement) : "0"

      // Parse price from text
      let price: number | null = null
      const priceMatch = priceText.match(/(\d+(\.\d+)?)/)
      if (priceMatch) {
        price = Number.parseFloat(priceMatch[1])
      }

      // Extract features
      const features: string[] = []
      const featureElements = await container.$$("ul li.feature, .features li, .benefits li")

      for (const feature of featureElements) {
        const featureText = await page.evaluate((el) => el.textContent?.trim() || "", feature)
        if (featureText && !featureText.includes("✗") && !featureText.toLowerCase().includes("not included")) {
          features.push(featureText)
        }
      }

      // Extract limitations
      const limitations: string[] = []
      const limitationElements = await container.$$("ul li.limitation, .limitations li")

      for (const limitation of limitationElements) {
        const limitationText = await page.evaluate((el) => el.textContent?.trim() || "", limitation)
        if (limitationText) {
          limitations.push(limitationText)
        }
      }

      pricingPlans.push({
        name: planName,
        price,
        features,
        limitations,
      })
    }

    // Extract integrations
    const integrations: string[] = []
    const integrationElements = await page.$$(".integrations li, .integration-list li, .partners li")

    for (const item of integrationElements) {
      const integrationText = await page.evaluate((el) => el.textContent?.trim() || "", item)
      if (integrationText) {
        integrations.push(integrationText)
      }
    }

    // If no specific integration section, look for mentions in the page
    if (integrations.length === 0) {
      // Look for common integration keywords
      const integrationKeywords = [
        "integrates with",
        "integration with",
        "connects to",
        "works with",
        "compatible with",
        "syncs with",
        "integration for",
      ]

      for (const keyword of integrationKeywords) {
        const elements = await page.$$(`p:contains("${keyword}"), li:contains("${keyword}")`)
        for (const item of elements) {
          const featureText = await page.evaluate((el) => el.textContent?.trim() || "", item)
          if (featureText) {
            integrations.push(featureText)
          }
        }
      }
    }

    // Extract categories
    const categories: string[] = []
    const categoryElements = await page.$$(".categories li, .tags li, .category-list li")

    for (const item of categoryElements) {
      const categoryText = await page.evaluate((el) => el.textContent?.trim() || "", item)
      if (categoryText) {
        categories.push(categoryText)
      }
    }

    return {
      name: title,
      description,
      website: url,
      pricingPlans,
      integrations,
      categories,
    }
  } catch (error) {
    console.error("Error scraping pricing page:", error)
    throw new Error(`Failed to scrape pricing page: ${error instanceof Error ? error.message : String(error)}`)
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}
