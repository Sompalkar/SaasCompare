"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Check, FileText, LineChart, Share2, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { formatPrice } from "@/lib/utils"
import { userAPI, compareAPI, reportsAPI } from "@/lib/api"
import Link from "next/link"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

export default function SavedComparisonPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("features")
  const [comparison, setComparison] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [potentialSavings, setPotentialSavings] = useState(0)

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        setIsLoading(true)
        // First get the saved comparison details
        const savedResponse = await userAPI.getSavedComparisonById(params.id as string)

        if (!savedResponse.data) {
          toast({
            title: "Error",
            description: "Comparison not found",
            variant: "destructive",
          })
          router.push("/dashboard")
          return
        }

        // Then get the full comparison data
        const comparisonResponse = await compareAPI.getComparisonById(savedResponse.data.comparisonId)
        setComparison(comparisonResponse.data)

        // Calculate potential savings
        if (comparisonResponse.data.tools) {
          const savings = calculateSavings(comparisonResponse.data.tools)
          setPotentialSavings(savings)
        }
      } catch (error) {
        console.error("Error fetching comparison:", error)
        toast({
          title: "Error",
          description: "Failed to load comparison. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchComparison()
    }
  }, [params.id, router, toast])

  const handleGenerateReport = async () => {
    if (!comparison) return

    setIsGeneratingReport(true)
    try {
      const response = await reportsAPI.generateReport(comparison.id, "PDF", true)
      toast({
        title: "Report generated",
        description: "Your comparison report is ready to download",
      })
      // Open the report in a new tab
      window.open(response.data.fileUrl, "_blank")
    } catch (error) {
      console.error("Error generating report:", error)
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingReport(false)
    }
  }

  // Helper function to calculate savings
  const calculateSavings = (tools: any[]) => {
    if (tools.length < 2) return 0

    const totalCost = tools.reduce((sum, tool) => {
      const price = tool.pricing?.pro?.price || 0
      return sum + (typeof price === "number" ? price : 0)
    }, 0)

    // Assume 15% savings for bundling or finding better alternatives
    return totalCost * 0.15
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to dashboard
            </Link>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        <Skeleton className="h-32 w-full" />

        <div>
          <Skeleton className="h-10 w-full mb-6" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (!comparison) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Comparison not found</h2>
          <p className="text-muted-foreground mb-6">
            The comparison you're looking for doesn't exist or has been deleted
          </p>
          <Link href="/dashboard">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{comparison.name || "Saved Comparison"}</h1>
          <p className="text-muted-foreground">Comparing {comparison.tools?.length || 0} tools</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={handleGenerateReport} disabled={isGeneratingReport}>
            <FileText className="h-4 w-4" />
            {isGeneratingReport ? "Generating..." : "Generate Report"}
          </Button>
          <Button variant="outline" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      {potentialSavings > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-100 dark:border-indigo-800">
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-indigo-100 dark:bg-indigo-900 p-2">
                  <LineChart className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-medium">Potential Cost Savings</h3>
                  <p className="text-sm text-muted-foreground">Based on your current selection and usage patterns</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {formatPrice(potentialSavings)}/year
                </div>
                <Button
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800"
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Tabs defaultValue="features" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="limitations">Limitations</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        <TabsContent value="features" className="mt-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 bg-muted/50 sticky left-0 min-w-[200px]">Feature</th>
                  {comparison.tools?.map((tool: any) => (
                    <th key={tool.id} className="text-center p-3 min-w-[180px]">
                      <div className="flex flex-col items-center">
                        <img
                          src={tool.logo || "/placeholder.svg"}
                          alt={tool.name}
                          className="h-10 w-10 rounded-md mb-2"
                        />
                        <span>{tool.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>{renderFeatureRows()}</tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="pricing" className="mt-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 bg-muted/50 sticky left-0 min-w-[200px]">Plan</th>
                  {comparison.tools?.map((tool: any) => (
                    <th key={tool.id} className="text-center p-3 min-w-[180px]">
                      <div className="flex flex-col items-center">
                        <img
                          src={tool.logo || "/placeholder.svg"}
                          alt={tool.name}
                          className="h-10 w-10 rounded-md mb-2"
                        />
                        <span>{tool.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 font-medium bg-muted/50 sticky left-0">Free</td>
                  {comparison.tools?.map((tool: any) => (
                    <td key={tool.id} className="p-3 text-center">
                      {tool.pricing.free ? (
                        <div>
                          <div className="font-medium">{formatPrice(tool.pricing.free.price)}</div>
                          <div className="text-sm text-muted-foreground">per user/month</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not available</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium bg-muted/50 sticky left-0">Starter</td>
                  {comparison.tools?.map((tool: any) => (
                    <td key={tool.id} className="p-3 text-center">
                      {tool.pricing.starter ? (
                        <div>
                          <div className="font-medium">{formatPrice(tool.pricing.starter.price)}</div>
                          <div className="text-sm text-muted-foreground">per user/month</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not available</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium bg-muted/50 sticky left-0">Pro</td>
                  {comparison.tools?.map((tool: any) => (
                    <td key={tool.id} className="p-3 text-center">
                      {tool.pricing.pro ? (
                        <div>
                          <div className="font-medium">{formatPrice(tool.pricing.pro.price)}</div>
                          <div className="text-sm text-muted-foreground">per user/month</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not available</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium bg-muted/50 sticky left-0">Enterprise</td>
                  {comparison.tools?.map((tool: any) => (
                    <td key={tool.id} className="p-3 text-center">
                      {tool.pricing.enterprise ? (
                        <div>
                          <div className="font-medium">{formatPrice(tool.pricing.enterprise.price)}</div>
                          <div className="text-sm text-muted-foreground">per user/month</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not available</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="limitations" className="mt-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 bg-muted/50 sticky left-0 min-w-[200px]">Plan</th>
                  {comparison.tools?.map((tool: any) => (
                    <th key={tool.id} className="text-center p-3 min-w-[180px]">
                      <div className="flex flex-col items-center">
                        <img
                          src={tool.logo || "/placeholder.svg"}
                          alt={tool.name}
                          className="h-10 w-10 rounded-md mb-2"
                        />
                        <span>{tool.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 font-medium bg-muted/50 sticky left-0">Free</td>
                  {comparison.tools?.map((tool: any) => (
                    <td key={tool.id} className="p-3">
                      {tool.pricing.free ? (
                        <ul className="list-disc pl-5 text-sm">
                          {tool.pricing.free.limitations.map((limitation: string, index: number) => (
                            <li key={index}>{limitation}</li>
                          ))}
                          {tool.pricing.free.limitations.length === 0 && (
                            <li className="text-muted-foreground">No significant limitations</li>
                          )}
                        </ul>
                      ) : (
                        <span className="text-muted-foreground">Not available</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium bg-muted/50 sticky left-0">Starter</td>
                  {comparison.tools?.map((tool: any) => (
                    <td key={tool.id} className="p-3">
                      {tool.pricing.starter ? (
                        <ul className="list-disc pl-5 text-sm">
                          {tool.pricing.starter.limitations.map((limitation: string, index: number) => (
                            <li key={index}>{limitation}</li>
                          ))}
                          {tool.pricing.starter.limitations.length === 0 && (
                            <li className="text-muted-foreground">No significant limitations</li>
                          )}
                        </ul>
                      ) : (
                        <span className="text-muted-foreground">Not available</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium bg-muted/50 sticky left-0">Pro</td>
                  {comparison.tools?.map((tool: any) => (
                    <td key={tool.id} className="p-3">
                      {tool.pricing.pro ? (
                        <ul className="list-disc pl-5 text-sm">
                          {tool.pricing.pro.limitations.map((limitation: string, index: number) => (
                            <li key={index}>{limitation}</li>
                          ))}
                          {tool.pricing.pro.limitations.length === 0 && (
                            <li className="text-muted-foreground">No significant limitations</li>
                          )}
                        </ul>
                      ) : (
                        <span className="text-muted-foreground">Not available</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="integrations" className="mt-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 bg-muted/50 sticky left-0 min-w-[200px]">Integration</th>
                  {comparison.tools?.map((tool: any) => (
                    <th key={tool.id} className="text-center p-3 min-w-[180px]">
                      <div className="flex flex-col items-center">
                        <img
                          src={tool.logo || "/placeholder.svg"}
                          alt={tool.name}
                          className="h-10 w-10 rounded-md mb-2"
                        />
                        <span>{tool.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>{renderIntegrationRows()}</tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )

  function renderFeatureRows() {
    // Collect all unique features across all tools and plans
    const allFeatures = new Set<string>()

    comparison.tools?.forEach((tool: any) => {
      Object.values(tool.pricing).forEach((plan: any) => {
        if (plan && plan.features) {
          plan.features.forEach((feature: string) => {
            allFeatures.add(feature)
          })
        }
      })
    })

    return Array.from(allFeatures).map((feature, index) => (
      <tr key={index} className="border-b">
        <td className="p-3 bg-muted/50 sticky left-0">{feature}</td>
        {comparison.tools?.map((tool: any) => {
          const hasFeature = Object.values(tool.pricing).some(
            (plan: any) => plan && plan.features && plan.features.includes(feature),
          )

          return (
            <td key={tool.id} className="p-3 text-center">
              {hasFeature ? (
                <Check className="h-5 w-5 text-green-500 mx-auto" />
              ) : (
                <X className="h-5 w-5 text-red-500 mx-auto" />
              )}
            </td>
          )
        })}
      </tr>
    ))
  }

  function renderIntegrationRows() {
    // Collect all unique integrations
    const allIntegrations = new Set<string>()

    comparison.tools?.forEach((tool: any) => {
      tool.integrations.forEach((integration: string) => {
        allIntegrations.add(integration)
      })
    })

    return Array.from(allIntegrations)
      .sort()
      .map((integration, index) => (
        <tr key={index} className="border-b">
          <td className="p-3 bg-muted/50 sticky left-0">{integration}</td>
          {comparison.tools?.map((tool: any) => {
            const hasIntegration = tool.integrations.includes(integration)

            return (
              <td key={tool.id} className="p-3 text-center">
                {hasIntegration ? (
                  <Check className="h-5 w-5 text-green-500 mx-auto" />
                ) : (
                  <X className="h-5 w-5 text-red-500 mx-auto" />
                )}
              </td>
            )
          })}
        </tr>
      ))
  }
}
