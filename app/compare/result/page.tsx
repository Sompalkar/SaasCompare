"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Check,
  Download,
  FileText,
  LineChart,
  Save,
  Share2,
  X,
  BarChart,
  PieChart,
  Award,
  AlertTriangle,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"
import Link from "next/link"
import { compareAPI } from "@/lib/api"
import { useRecoilValue } from "recoil"
import { selectedToolsState } from "@/lib/atoms"
import { useAuth } from "@/lib/auth-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import PublicHeader from "@/components/public/public-header"

export default function ComparisonResultPage() {
  const [activeTab, setActiveTab] = useState("features")
  const [comparisonName, setComparisonName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [comparisonData, setComparisonData] = useState<any>(null)
  const [reportFormat, setReportFormat] = useState("pdf")
  const [reportType, setReportType] = useState("detailed")
  const [recommendations, setRecommendations] = useState<any>(null)
  const [comparisonId, setComparisonId] = useState<string | null>(null)

  const selectedTools = useRecoilValue(selectedToolsState)
  const searchParams = useSearchParams()
  const id = searchParams.get("id")
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    const fetchComparisonData = async () => {
      setIsLoading(true)
      try {
        // If we have an ID in the URL, fetch that comparison
        if (id) {
          const response = await compareAPI.getComparisonById(id)
          setComparisonData(response.data)
          setComparisonId(id)
        } else if (selectedTools.length >= 2) {
          // Otherwise, create a new comparison from selected tools
          const toolIds = selectedTools.map((tool) => tool.id)
          const response = await compareAPI.compareTools(toolIds)
          setComparisonData(response.data)
          setComparisonId(response.data.id)
        } else {
          // Not enough tools selected and no ID provided
          toast({
            title: "Error",
            description: "Please select at least 2 tools to compare",
            variant: "destructive",
          })
          router.push("/compare")
          return
        }

        // Generate recommendations
        generateRecommendations()
      } catch (error) {
        console.error("Error fetching comparison data:", error)
        toast({
          title: "Error",
          description: "Failed to load comparison data. Please try again.",
          variant: "destructive",
        })

        // If API fails, use mock data for demo purposes
        setComparisonData(getMockComparisonData())
        generateRecommendations()
      } finally {
        setIsLoading(false)
      }
    }

    fetchComparisonData()
  }, [id, selectedTools])

  const generateRecommendations = () => {
    // This would ideally be done server-side with more sophisticated logic
    // For now, we'll use a simple algorithm based on features, pricing, and limitations

    // Using mock data for demonstration
    const mockTools = getMockComparisonData().tools

    if (!mockTools || mockTools.length < 2) return

    const recommendations = {
      bestOverall: {
        tool: mockTools[0],
        reason: "Offers the most comprehensive feature set with competitive pricing",
      },
      bestValue: {
        tool: mockTools[1],
        reason: "Provides essential features at the most affordable price point",
      },
      bestForEnterprise: {
        tool: mockTools[0],
        reason: "Offers advanced customization and scalability needed for large organizations",
      },
      bestForSmallBusiness: {
        tool: mockTools[1],
        reason: "Simple interface with all necessary features at a price point suitable for small teams",
      },
    }

    setRecommendations(recommendations)
  }

  const handleSaveComparison = async () => {
    if (!comparisonId) {
      toast({
        title: "Error",
        description: "No comparison data available to save",
        variant: "destructive",
      })
      return
    }

    if (!comparisonName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your comparison",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      if (!user) {
        toast({
          title: "Sign up required",
          description: "Create an account to save comparisons",
        })
        router.push("/auth/register")
        return
      }

      await compareAPI.saveComparison(comparisonId, comparisonName)

      toast({
        title: "Comparison saved",
        description: "Your comparison has been saved successfully",
      })
    } catch (error) {
      console.error("Error saving comparison:", error)
      toast({
        title: "Error",
        description: "Failed to save comparison. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleGenerateReport = async () => {
    if (!comparisonId) {
      toast({
        title: "Error",
        description: "No comparison data available for report generation",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingReport(true)
    try {
      if (!user) {
        toast({
          title: "Sign up required",
          description: "Create an account to generate reports",
        })
        router.push("/auth/register")
        return
      }

      const includeCharts = reportType === "detailed" || reportType === "visual"

      const response = await compareAPI.generateReport(comparisonId, reportFormat, includeCharts)

      // If successful, download the report
      if (response.data && response.data.reportUrl) {
        window.open(response.data.reportUrl, "_blank")
      }

      toast({
        title: "Report generated",
        description: `Your ${reportType} report has been generated successfully`,
      })
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

  const formatPrice = (price: any) => {
    if (price === null || price === undefined) return "N/A"
    if (typeof price === "string") return price
    return `$${price}`
  }

  // Mock data for demonstration purposes
  const getMockComparisonData = () => {
    return {
      id: "mock-comparison-id",
      tools: [
        {
          id: "1",
          name: "Salesforce",
          logo: "/placeholder.svg?height=48&width=48",
          description: "CRM solution for sales, service, marketing, and more",
          category: "CRM",
          website: "https://salesforce.com",
          pricing: {
            free: null,
            starter: {
              price: 25,
              features: ["Contact Management", "Lead Management", "Opportunity Management"],
              limitations: ["Limited storage", "No advanced analytics", "Limited customization"],
            },
            pro: {
              price: 75,
              features: ["Everything in Starter", "Advanced Analytics", "Workflow Automation"],
              limitations: ["Limited API calls", "No Einstein AI"],
            },
            enterprise: {
              price: 150,
              features: ["Everything in Pro", "Einstein AI", "Unlimited Customization"],
              limitations: [],
            },
          },
          integrations: ["Slack", "Google Workspace", "Microsoft Office", "DocuSign", "Mailchimp"],
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "2",
          name: "HubSpot",
          logo: "/placeholder.svg?height=48&width=48",
          description: "Inbound marketing, sales, and service software",
          category: "CRM",
          website: "https://hubspot.com",
          pricing: {
            free: {
              price: 0,
              features: ["Contact Management", "Email Marketing", "Forms"],
              limitations: ["Limited contacts", "HubSpot branding", "Limited reporting"],
            },
            starter: {
              price: 45,
              features: ["Everything in Free", "Custom Properties", "Simple Automation"],
              limitations: ["Limited automation", "Limited users"],
            },
            pro: {
              price: 800,
              features: ["Everything in Starter", "Advanced Automation", "Advanced Reporting"],
              limitations: ["Limited custom objects"],
            },
            enterprise: {
              price: 3200,
              features: ["Everything in Pro", "Custom Objects", "Predictive Lead Scoring"],
              limitations: [],
            },
          },
          integrations: ["Gmail", "Outlook", "Slack", "Zoom", "WordPress", "Shopify"],
          lastUpdated: new Date().toISOString(),
        },
      ],
      features: ["Contact Management", "Lead Management", "Email Marketing"],
      createdAt: new Date().toISOString(),
    }
  }

  if (isLoading) {
    return (
      <>
        <PublicHeader />
        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">Generating Comparison</h2>
              <p className="text-muted-foreground">Please wait while we analyze the selected tools...</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  const tools = comparisonData?.tools || []

  return (
    <>
      <PublicHeader />
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Link
                href="/compare"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to selection
              </Link>
              <h1 className="text-3xl font-bold tracking-tight">Comparison Results</h1>
              <p className="text-muted-foreground">Comparing {tools.length} tools</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save Comparison</DialogTitle>
                    <DialogDescription>Save this comparison to access it later from your dashboard.</DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Label htmlFor="name" className="text-right">
                      Comparison Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g., CRM Tools Comparison"
                      value={comparisonName}
                      onChange={(e) => setComparisonName(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleSaveComparison}
                      disabled={isSaving}
                      className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700"
                    >
                      {isSaving ? "Saving..." : "Save Comparison"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Generate Report
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Generate Report</DialogTitle>
                    <DialogDescription>Create a detailed report of your comparison.</DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div>
                      <Label htmlFor="report-type">Report Type</Label>
                      <Select value={reportType} onValueChange={setReportType}>
                        <SelectTrigger id="report-type" className="mt-2">
                          <SelectValue placeholder="Select report type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="summary">Summary (Basic overview)</SelectItem>
                          <SelectItem value="detailed">Detailed (Complete analysis)</SelectItem>
                          <SelectItem value="visual">Visual (Chart-focused)</SelectItem>
                          <SelectItem value="recommendation">Recommendation (Decision-focused)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="report-format">Format</Label>
                      <Select value={reportFormat} onValueChange={setReportFormat}>
                        <SelectTrigger id="report-format" className="mt-2">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF Document</SelectItem>
                          <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                          <SelectItem value="ppt">PowerPoint Presentation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleGenerateReport}
                      disabled={isGeneratingReport}
                      className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700"
                    >
                      {isGeneratingReport ? (
                        <>
                          <span className="animate-spin mr-2">
                            <svg className="h-4 w-4" viewBox="0 0 24 24">
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                          </span>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Generate & Download
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button variant="outline" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>

          {/* Recommendations Section */}
          {recommendations && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <Card className="bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/20">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4 flex items-center">
                    <Award className="mr-2 h-6 w-6 text-primary" />
                    Recommendations
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-background rounded-lg border">
                      <h3 className="font-medium text-lg mb-2 flex items-center">
                        <Badge className="mr-2 bg-primary">Best Overall</Badge>
                      </h3>
                      <div className="flex items-center mb-2">
                        <img
                          src={recommendations.bestOverall.tool.logo || "/placeholder.svg"}
                          alt={recommendations.bestOverall.tool.name}
                          className="h-8 w-8 mr-2 rounded"
                        />
                        <span className="font-medium">{recommendations.bestOverall.tool.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{recommendations.bestOverall.reason}</p>
                    </div>

                    <div className="p-4 bg-background rounded-lg border">
                      <h3 className="font-medium text-lg mb-2 flex items-center">
                        <Badge className="mr-2 bg-green-600">Best Value</Badge>
                      </h3>
                      <div className="flex items-center mb-2">
                        <img
                          src={recommendations.bestValue.tool.logo || "/placeholder.svg"}
                          alt={recommendations.bestValue.tool.name}
                          className="h-8 w-8 mr-2 rounded"
                        />
                        <span className="font-medium">{recommendations.bestValue.tool.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{recommendations.bestValue.reason}</p>
                    </div>

                    <div className="p-4 bg-background rounded-lg border">
                      <h3 className="font-medium text-lg mb-2 flex items-center">
                        <Badge className="mr-2 bg-blue-600">Best for Enterprise</Badge>
                      </h3>
                      <div className="flex items-center mb-2">
                        <img
                          src={recommendations.bestForEnterprise.tool.logo || "/placeholder.svg"}
                          alt={recommendations.bestForEnterprise.tool.name}
                          className="h-8 w-8 mr-2 rounded"
                        />
                        <span className="font-medium">{recommendations.bestForEnterprise.tool.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{recommendations.bestForEnterprise.reason}</p>
                    </div>

                    <div className="p-4 bg-background rounded-lg border">
                      <h3 className="font-medium text-lg mb-2 flex items-center">
                        <Badge className="mr-2 bg-orange-500">Best for Small Business</Badge>
                      </h3>
                      <div className="flex items-center mb-2">
                        <img
                          src={recommendations.bestForSmallBusiness.tool.logo || "/placeholder.svg"}
                          alt={recommendations.bestForSmallBusiness.tool.name}
                          className="h-8 w-8 mr-2 rounded"
                        />
                        <span className="font-medium">{recommendations.bestForSmallBusiness.tool.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{recommendations.bestForSmallBusiness.reason}</p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-amber-800 dark:text-amber-300">
                        These recommendations are based on general analysis. Your specific needs may vary. Consider
                        generating a detailed report for a more personalized recommendation.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/20">
              <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 dark:bg-primary/20 p-2">
                    <LineChart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Unlock Premium Features</h3>
                    <p className="text-sm text-muted-foreground">
                      Sign up to save comparisons and generate detailed reports
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Link href="/auth/register">
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      Sign Up Free
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <Tabs defaultValue="features" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="limitations">Limitations</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="charts">Charts</TabsTrigger>
            </TabsList>

            <TabsContent value="features" className="mt-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 bg-muted/50 sticky left-0 min-w-[200px]">Feature</th>
                      {tools.map((tool: any) => (
                        <th key={tool.id} className="text-center p-3 min-w-[180px]">
                          <div className="flex flex-col items-center">
                            <img
                              src={tool.logo || "/placeholder.svg?height=40&width=40"}
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
                      {tools.map((tool: any) => (
                        <th key={tool.id} className="text-center p-3 min-w-[180px]">
                          <div className="flex flex-col items-center">
                            <img
                              src={tool.logo || "/placeholder.svg?height=40&width=40"}
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
                      {tools.map((tool: any) => (
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
                      {tools.map((tool: any) => (
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
                      {tools.map((tool: any) => (
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
                      {tools.map((tool: any) => (
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
                      {tools.map((tool: any) => (
                        <th key={tool.id} className="text-center p-3 min-w-[180px]">
                          <div className="flex flex-col items-center">
                            <img
                              src={tool.logo || "/placeholder.svg?height=40&width=40"}
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
                      {tools.map((tool: any) => (
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
                      {tools.map((tool: any) => (
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
                      {tools.map((tool: any) => (
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
                      {tools.map((tool: any) => (
                        <th key={tool.id} className="text-center p-3 min-w-[180px]">
                          <div className="flex flex-col items-center">
                            <img
                              src={tool.logo || "/placeholder.svg?height=40&width=40"}
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

            <TabsContent value="charts" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <BarChart className="h-5 w-5 mr-2 text-primary" />
                      Feature Comparison
                    </h3>
                    <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                      <p className="text-muted-foreground text-sm">Feature comparison chart visualization</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <PieChart className="h-5 w-5 mr-2 text-primary" />
                      Pricing Breakdown
                    </h3>
                    <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                      <p className="text-muted-foreground text-sm">Pricing breakdown chart visualization</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <LineChart className="h-5 w-5 mr-2 text-primary" />
                      Value Analysis
                    </h3>
                    <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                      <p className="text-muted-foreground text-sm">Value analysis chart visualization</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )

  function renderFeatureRows() {
    // Collect all unique features across all tools and plans
    const allFeatures = new Set<string>()

    tools.forEach((tool: any) => {
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
        {tools.map((tool: any) => {
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

    tools.forEach((tool: any) => {
      tool.integrations.forEach((integration: string) => {
        allIntegrations.add(integration)
      })
    })

    return Array.from(allIntegrations)
      .sort()
      .map((integration, index) => (
        <tr key={index} className="border-b">
          <td className="p-3 bg-muted/50 sticky left-0">{integration}</td>
          {tools.map((tool: any) => {
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
