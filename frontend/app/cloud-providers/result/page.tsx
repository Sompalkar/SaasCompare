"use client"

import React from "react"
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
  Server,
  Database,
  HardDrive,
  Network,
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
import { cloudProvidersAPI } from "@/lib/api"
import { useAppState } from "@/lib/state-provider" // Updated import
import { useAuth } from "@/lib/auth-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
// import PublicHeader from "@/components/public/public-header"
import { PublicHeader } from "@/components/public/public-header"
import ServiceNavigation from "@/components/shared/service-navigation"

export default function CloudProviderComparisonPage() {
  const [activeTab, setActiveTab] = useState("services")
  const [comparisonName, setComparisonName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [comparisonData, setComparisonData] = useState<any>(null)
  const [reportFormat, setReportFormat] = useState("pdf")
  const [reportType, setReportType] = useState("detailed")
  const [recommendations, setRecommendations] = useState<any>(null)
  const [comparisonId, setComparisonId] = useState<string | null>(null)

  const { selectedProviders, selectedServiceTypes } = useAppState() // Updated to use our context
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
          const response = await cloudProvidersAPI.getComparisonById(id)
          setComparisonData(response.data)
          setComparisonId(id)
        } else if (selectedProviders.length >= 2 && selectedServiceTypes.length > 0) {
          // Otherwise, create a new comparison from selected providers
          const providerIds = selectedProviders.map((provider) => provider.id)
          const response = await cloudProvidersAPI.compareProviders(providerIds, selectedServiceTypes)
          setComparisonData(response.data)
          setComparisonId(response.data.id)
        } else {
          // Not enough providers selected and no ID provided
          toast({
            title: "Error",
            description: "Please select at least 2 providers and one service type to compare",
            variant: "destructive",
          })
          router.push("/cloud-providers")
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
  }, [id, selectedProviders, selectedServiceTypes])

  const generateRecommendations = () => {
    // This would ideally be done server-side with more sophisticated logic
    // For now, we'll use a simple algorithm based on services, pricing, and features

    // Using mock data for demonstration
    const mockProviders = getMockComparisonData().providers

    if (!mockProviders || mockProviders.length < 2) return

    const recommendations = {
      bestOverall: {
        provider: mockProviders[0],
        reason: "Offers the most comprehensive service portfolio with competitive pricing",
      },
      bestValue: {
        provider: mockProviders[1],
        reason: "Provides essential cloud services at the most affordable price point",
      },
      bestForEnterprise: {
        provider: mockProviders[0],
        reason: "Offers advanced enterprise features and global infrastructure",
      },
      bestForStartups: {
        provider: mockProviders[1],
        reason: "Simple interface with generous free tier suitable for startups",
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

      await cloudProvidersAPI.saveComparison(comparisonId, comparisonName)

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

      const response = await cloudProvidersAPI.generateReport(comparisonId, reportFormat, includeCharts)

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
      providers: [
        {
          id: "1",
          name: "AWS",
          logo: "/placeholder.svg?height=40&width=40",
          description: "Amazon Web Services - Cloud computing services",
          website: "https://aws.amazon.com",
          services: [
            {
              id: "aws-ec2",
              name: "EC2",
              type: "Compute",
              description: "Virtual servers in the cloud",
              pricing: {
                free: {
                  price: 0,
                  features: ["750 hours per month of t2.micro", "30GB of EBS storage"],
                  limitations: ["12 months only", "Limited instance types"],
                },
                basic: {
                  price: 0.0116,
                  features: ["On-demand instances", "Pay per hour", "Multiple instance types"],
                  limitations: ["No reserved capacity", "No savings plans"],
                },
                standard: null,
                premium: null,
                enterprise: null,
              },
            },
            {
              id: "aws-s3",
              name: "S3",
              type: "Storage",
              description: "Scalable storage in the cloud",
              pricing: {
                free: {
                  price: 0,
                  features: ["5GB of standard storage", "20,000 GET requests", "2,000 PUT requests"],
                  limitations: ["12 months only", "Limited request types"],
                },
                basic: {
                  price: 0.023,
                  features: ["Standard storage", "Pay per GB", "Unlimited requests"],
                  limitations: ["Higher cost for frequent access"],
                },
                standard: {
                  price: 0.0125,
                  features: ["Standard Infrequent Access", "Lower storage cost", "Higher retrieval cost"],
                  limitations: ["Minimum 30-day storage duration"],
                },
                premium: null,
                enterprise: null,
              },
            },
            {
              id: "aws-rds",
              name: "RDS",
              type: "Database",
              description: "Managed relational database service",
              pricing: {
                free: {
                  price: 0,
                  features: ["750 hours of db.t2.micro", "20GB of storage"],
                  limitations: ["12 months only", "Limited instance types"],
                },
                basic: {
                  price: 0.017,
                  features: ["On-demand instances", "Multiple database engines", "Automated backups"],
                  limitations: ["No reserved capacity", "No multi-AZ deployment"],
                },
                standard: {
                  price: 0.034,
                  features: ["Multi-AZ deployment", "Enhanced durability", "Automated failover"],
                  limitations: ["Higher cost than single-AZ"],
                },
                premium: {
                  price: 0.068,
                  features: ["Multi-AZ with read replicas", "Enhanced performance", "Scaling capabilities"],
                  limitations: ["Highest cost option"],
                },
                enterprise: null,
              },
            },
          ],
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Microsoft Azure",
          logo: "/placeholder.svg?height=40&width=40",
          description: "Microsoft's cloud computing platform",
          website: "https://azure.microsoft.com",
          services: [
            {
              id: "azure-vm",
              name: "Virtual Machines",
              type: "Compute",
              description: "Scalable cloud computing resources",
              pricing: {
                free: {
                  price: 0,
                  features: ["750 hours of B1S VM", "5 GB of storage"],
                  limitations: ["12 months only", "Limited VM types"],
                },
                basic: {
                  price: 0.0208,
                  features: ["Pay-as-you-go", "Multiple VM sizes", "Linux and Windows"],
                  limitations: ["No reserved instances", "No hybrid benefit"],
                },
                standard: {
                  price: 0.0146,
                  features: ["Reserved instances", "1-year commitment", "Upfront payment options"],
                  limitations: ["Commitment required"],
                },
                premium: {
                  price: 0.0104,
                  features: ["Reserved instances", "3-year commitment", "Maximum savings"],
                  limitations: ["Long-term commitment required"],
                },
                enterprise: null,
              },
            },
            {
              id: "azure-blob",
              name: "Blob Storage",
              type: "Storage",
              description: "Massively scalable object storage",
              pricing: {
                free: {
                  price: 0,
                  features: ["5GB of storage", "20,000 read operations", "10,000 write operations"],
                  limitations: ["12 months only", "Limited operation types"],
                },
                basic: {
                  price: 0.0184,
                  features: ["Hot access tier", "Unlimited storage", "Geo-redundancy options"],
                  limitations: ["Higher cost for frequent access"],
                },
                standard: {
                  price: 0.01,
                  features: ["Cool access tier", "Lower storage cost", "Higher access cost"],
                  limitations: ["30-day minimum storage duration"],
                },
                premium: {
                  price: 0.15,
                  features: ["Premium performance", "High throughput", "Low latency"],
                  limitations: ["Highest cost option"],
                },
                enterprise: null,
              },
            },
            {
              id: "azure-sql",
              name: "Azure SQL",
              type: "Database",
              description: "Managed SQL database service",
              pricing: {
                free: {
                  price: 0,
                  features: ["250GB of storage", "Basic compute tier"],
                  limitations: ["12 months only", "Limited performance"],
                },
                basic: {
                  price: 0.0202,
                  features: ["DTU-based purchasing model", "Basic tier", "5 DTUs"],
                  limitations: ["Limited performance", "No scaling"],
                },
                standard: {
                  price: 0.1008,
                  features: ["Standard tier", "10-100 DTUs", "Scaling options"],
                  limitations: ["Medium performance"],
                },
                premium: {
                  price: 0.5,
                  features: ["Premium tier", "125-4000 DTUs", "High performance"],
                  limitations: ["High cost"],
                },
                enterprise: {
                  price: 1.2,
                  features: ["Business Critical tier", "Maximum performance", "In-memory technology"],
                  limitations: ["Highest cost option"],
                },
              },
            },
          ],
          lastUpdated: new Date().toISOString(),
        },
      ],
      serviceTypes: ["Compute", "Storage", "Database"],
      createdAt: new Date().toISOString(),
    }
  }

  if (isLoading) {
    return (
      <>
        <PublicHeader />
        <ServiceNavigation />
        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">Generating Comparison</h2>
              <p className="text-muted-foreground">Please wait while we analyze the selected cloud providers...</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  const providers = comparisonData?.providers || []
  const serviceTypes = comparisonData?.serviceTypes || []

  return (
    <>
      <PublicHeader />
      <ServiceNavigation />
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Link
                href="/cloud-providers"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to selection
              </Link>
              <h1 className="text-3xl font-bold tracking-tight">Cloud Provider Comparison</h1>
              <p className="text-muted-foreground">
                Comparing {providers.length} providers across {serviceTypes.length} service types
              </p>
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
                      placeholder="e.g., AWS vs Azure Comparison"
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
                          src={recommendations.bestOverall.provider.logo || "/placeholder.svg"}
                          alt={recommendations.bestOverall.provider.name}
                          className="h-8 w-8 mr-2 rounded"
                        />
                        <span className="font-medium">{recommendations.bestOverall.provider.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{recommendations.bestOverall.reason}</p>
                    </div>

                    <div className="p-4 bg-background rounded-lg border">
                      <h3 className="font-medium text-lg mb-2 flex items-center">
                        <Badge className="mr-2 bg-green-600">Best Value</Badge>
                      </h3>
                      <div className="flex items-center mb-2">
                        <img
                          src={recommendations.bestValue.provider.logo || "/placeholder.svg"}
                          alt={recommendations.bestValue.provider.name}
                          className="h-8 w-8 mr-2 rounded"
                        />
                        <span className="font-medium">{recommendations.bestValue.provider.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{recommendations.bestValue.reason}</p>
                    </div>

                    <div className="p-4 bg-background rounded-lg border">
                      <h3 className="font-medium text-lg mb-2 flex items-center">
                        <Badge className="mr-2 bg-blue-600">Best for Enterprise</Badge>
                      </h3>
                      <div className="flex items-center mb-2">
                        <img
                          src={recommendations.bestForEnterprise.provider.logo || "/placeholder.svg"}
                          alt={recommendations.bestForEnterprise.provider.name}
                          className="h-8 w-8 mr-2 rounded"
                        />
                        <span className="font-medium">{recommendations.bestForEnterprise.provider.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{recommendations.bestForEnterprise.reason}</p>
                    </div>

                    <div className="p-4 bg-background rounded-lg border">
                      <h3 className="font-medium text-lg mb-2 flex items-center">
                        <Badge className="mr-2 bg-orange-500">Best for Startups</Badge>
                      </h3>
                      <div className="flex items-center mb-2">
                        <img
                          src={recommendations.bestForStartups.provider.logo || "/placeholder.svg"}
                          alt={recommendations.bestForStartups.provider.name}
                          className="h-8 w-8 mr-2 rounded"
                        />
                        <span className="font-medium">{recommendations.bestForStartups.provider.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{recommendations.bestForStartups.reason}</p>
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

          <Tabs defaultValue="services" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="limitations">Limitations</TabsTrigger>
              <TabsTrigger value="charts">Charts</TabsTrigger>
            </TabsList>

            <TabsContent value="services" className="mt-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 bg-muted/50 sticky left-0 min-w-[200px]">Service</th>
                      {providers.map((provider: any) => (
                        <th key={provider.id} className="text-center p-3 min-w-[180px]">
                          <div className="flex flex-col items-center">
                            <img
                              src={provider.logo || "/placeholder.svg?height=40&width=40"}
                              alt={provider.name}
                              className="h-10 w-10 rounded-md mb-2"
                            />
                            <span>{provider.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>{renderServiceRows()}</tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="mt-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 bg-muted/50 sticky left-0 min-w-[200px]">Service / Plan</th>
                      {providers.map((provider: any) => (
                        <th key={provider.id} className="text-center p-3 min-w-[180px]">
                          <div className="flex flex-col items-center">
                            <img
                              src={provider.logo || "/placeholder.svg?height=40&width=40"}
                              alt={provider.name}
                              className="h-10 w-10 rounded-md mb-2"
                            />
                            <span>{provider.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>{renderPricingRows()}</tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="features" className="mt-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 bg-muted/50 sticky left-0 min-w-[200px]">Service / Features</th>
                      {providers.map((provider: any) => (
                        <th key={provider.id} className="text-center p-3 min-w-[180px]">
                          <div className="flex flex-col items-center">
                            <img
                              src={provider.logo || "/placeholder.svg?height=40&width=40"}
                              alt={provider.name}
                              className="h-10 w-10 rounded-md mb-2"
                            />
                            <span>{provider.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>{renderFeatureRows()}</tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="limitations" className="mt-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 bg-muted/50 sticky left-0 min-w-[200px]">Service / Limitations</th>
                      {providers.map((provider: any) => (
                        <th key={provider.id} className="text-center p-3 min-w-[180px]">
                          <div className="flex flex-col items-center">
                            <img
                              src={provider.logo || "/placeholder.svg?height=40&width=40"}
                              alt={provider.name}
                              className="h-10 w-10 rounded-md mb-2"
                            />
                            <span>{provider.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>{renderLimitationRows()}</tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="charts" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <BarChart className="h-5 w-5 mr-2 text-primary" />
                      Service Availability
                    </h3>
                    <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                      <p className="text-muted-foreground text-sm">Service availability chart visualization</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <PieChart className="h-5 w-5 mr-2 text-primary" />
                      Pricing Comparison
                    </h3>
                    <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                      <p className="text-muted-foreground text-sm">Pricing comparison chart visualization</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <LineChart className="h-5 w-5 mr-2 text-primary" />
                      Cost Analysis
                    </h3>
                    <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                      <p className="text-muted-foreground text-sm">Cost analysis chart visualization</p>
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

  function renderServiceRows() {
    // Group services by type
    const servicesByType: Record<string, any[]> = {}

    // Collect all services from all providers
    providers.forEach((provider: any) => {
      provider.services.forEach((service: any) => {
        if (!servicesByType[service.type]) {
          servicesByType[service.type] = []
        }

        // Add service if not already in the list
        const existingService = servicesByType[service.type].find((s) => s.name === service.name)
        if (!existingService) {
          servicesByType[service.type].push(service)
        }
      })
    })

    // Render rows for each service type
    return Object.entries(servicesByType).map(([type, services]) => (
      <React.Fragment key={type}>
        <tr className="border-b bg-muted/30">
          <td colSpan={providers.length + 1} className="p-3 font-medium">
            <div className="flex items-center">
              {type === "Compute" && <Server className="h-4 w-4 mr-2" />}
              {type === "Storage" && <HardDrive className="h-4 w-4 mr-2" />}
              {type === "Database" && <Database className="h-4 w-4 mr-2" />}
              {type === "Networking" && <Network className="h-4 w-4 mr-2" />}
              {type}
            </div>
          </td>
        </tr>
        {services.map((service) => (
          <tr key={service.id} className="border-b">
            <td className="p-3 bg-muted/50 sticky left-0">
              <div>
                <p className="font-medium">{service.name}</p>
                <p className="text-xs text-muted-foreground">{service.description}</p>
              </div>
            </td>
            {providers.map((provider: any) => {
              const hasService = provider.services.some((s: any) => s.name === service.name)
              return (
                <td key={provider.id} className="p-3 text-center">
                  {hasService ? (
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  ) : (
                    <X className="h-5 w-5 text-red-500 mx-auto" />
                  )}
                </td>
              )
            })}
          </tr>
        ))}
      </React.Fragment>
    ))
  }

  function renderPricingRows() {
    // Group services by type
    const servicesByType: Record<string, any[]> = {}

    // Collect all services from all providers
    providers.forEach((provider: any) => {
      provider.services.forEach((service: any) => {
        if (!servicesByType[service.type]) {
          servicesByType[service.type] = []
        }

        // Add service if not already in the list
        const existingService = servicesByType[service.type].find((s) => s.name === service.name)
        if (!existingService) {
          servicesByType[service.type].push(service)
        }
      })
    })

    // Pricing tiers to display
    const pricingTiers = ["free", "basic", "standard", "premium", "enterprise"]

    // Render rows for each service type and pricing tier
    return Object.entries(servicesByType).map(([type, services]) => (
      <React.Fragment key={type}>
        <tr className="border-b bg-muted/30">
          <td colSpan={providers.length + 1} className="p-3 font-medium">
            <div className="flex items-center">
              {type === "Compute" && <Server className="h-4 w-4 mr-2" />}
              {type === "Storage" && <HardDrive className="h-4 w-4 mr-2" />}
              {type === "Database" && <Database className="h-4 w-4 mr-2" />}
              {type === "Networking" && <Network className="h-4 w-4 mr-2" />}
              {type}
            </div>
          </td>
        </tr>
        {services.map((service) => (
          <React.Fragment key={service.id}>
            {pricingTiers.map((tier) => (
              <tr key={`${service.id}-${tier}`} className="border-b">
                <td className="p-3 bg-muted/50 sticky left-0">
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-xs text-muted-foreground">{tier.charAt(0).toUpperCase() + tier.slice(1)}</p>
                  </div>
                </td>
                {providers.map((provider: any) => {
                  const providerService = provider.services.find((s: any) => s.name === service.name)
                  const pricing = providerService?.pricing?.[tier]

                  return (
                    <td key={provider.id} className="p-3 text-center">
                      {pricing ? (
                        <div>
                          <div className="font-medium">{formatPrice(pricing.price)}</div>
                          <div className="text-xs text-muted-foreground">per hour/GB</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not available</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </React.Fragment>
        ))}
      </React.Fragment>
    ))
  }

  function renderFeatureRows() {
    // Group services by type
    const servicesByType: Record<string, any[]> = {}

    // Collect all services from all providers
    providers.forEach((provider: any) => {
      provider.services.forEach((service: any) => {
        if (!servicesByType[service.type]) {
          servicesByType[service.type] = []
        }

        // Add service if not already in the list
        const existingService = servicesByType[service.type].find((s) => s.name === service.name)
        if (!existingService) {
          servicesByType[service.type].push(service)
        }
      })
    })

    // Render rows for each service type
    return Object.entries(servicesByType).map(([type, services]) => (
      <React.Fragment key={type}>
        <tr className="border-b bg-muted/30">
          <td colSpan={providers.length + 1} className="p-3 font-medium">
            <div className="flex items-center">
              {type === "Compute" && <Server className="h-4 w-4 mr-2" />}
              {type === "Storage" && <HardDrive className="h-4 w-4 mr-2" />}
              {type === "Database" && <Database className="h-4 w-4 mr-2" />}
              {type === "Networking" && <Network className="h-4 w-4 mr-2" />}
              {type}
            </div>
          </td>
        </tr>
        {services.map((service) => (
          <tr key={service.id} className="border-b">
            <td className="p-3 bg-muted/50 sticky left-0">
              <div>
                <p className="font-medium">{service.name}</p>
                <p className="text-xs text-muted-foreground">Key Features</p>
              </div>
            </td>
            {providers.map((provider: any) => {
              const providerService = provider.services.find((s: any) => s.name === service.name)

              // Collect all features from all pricing tiers
              const allFeatures: string[] = []
              if (providerService) {
                Object.values(providerService.pricing).forEach((tier: any) => {
                  if (tier && tier.features) {
                    tier.features.forEach((feature: string) => {
                      if (!allFeatures.includes(feature)) {
                        allFeatures.push(feature)
                      }
                    })
                  }
                })
              }

              return (
                <td key={provider.id} className="p-3">
                  {providerService ? (
                    <ul className="list-disc pl-5 text-sm">
                      {allFeatures.slice(0, 3).map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                      {allFeatures.length > 3 && (
                        <li className="text-muted-foreground">+{allFeatures.length - 3} more features</li>
                      )}
                      {allFeatures.length === 0 && <li className="text-muted-foreground">No features listed</li>}
                    </ul>
                  ) : (
                    <span className="text-muted-foreground">Service not available</span>
                  )}
                </td>
              )
            })}
          </tr>
        ))}
      </React.Fragment>
    ))
  }

  function renderLimitationRows() {
    // Group services by type
    const servicesByType: Record<string, any[]> = {}

    // Collect all services from all providers
    providers.forEach((provider: any) => {
      provider.services.forEach((service: any) => {
        if (!servicesByType[service.type]) {
          servicesByType[service.type] = []
        }

        // Add service if not already in the list
        const existingService = servicesByType[service.type].find((s) => s.name === service.name)
        if (!existingService) {
          servicesByType[service.type].push(service)
        }
      })
    })

    // Render rows for each service type
    return Object.entries(servicesByType).map(([type, services]) => (
      <React.Fragment key={type}>
        <tr className="border-b bg-muted/30">
          <td colSpan={providers.length + 1} className="p-3 font-medium">
            <div className="flex items-center">
              {type === "Compute" && <Server className="h-4 w-4 mr-2" />}
              {type === "Storage" && <HardDrive className="h-4 w-4 mr-2" />}
              {type === "Database" && <Database className="h-4 w-4 mr-2" />}
              {type === "Networking" && <Network className="h-4 w-4 mr-2" />}
              {type}
            </div>
          </td>
        </tr>
        {services.map((service) => (
          <tr key={service.id} className="border-b">
            <td className="p-3 bg-muted/50 sticky left-0">
              <div>
                <p className="font-medium">{service.name}</p>
                <p className="text-xs text-muted-foreground">Limitations</p>
              </div>
            </td>
            {providers.map((provider: any) => {
              const providerService = provider.services.find((s: any) => s.name === service.name)

              // Collect all limitations from all pricing tiers
              const allLimitations: string[] = []
              if (providerService) {
                Object.values(providerService.pricing).forEach((tier: any) => {
                  if (tier && tier.limitations) {
                    tier.limitations.forEach((limitation: string) => {
                      if (!allLimitations.includes(limitation)) {
                        allLimitations.push(limitation)
                      }
                    })
                  }
                })
              }

              return (
                <td key={provider.id} className="p-3">
                  {providerService ? (
                    <ul className="list-disc pl-5 text-sm">
                      {allLimitations.slice(0, 3).map((limitation, index) => (
                        <li key={index}>{limitation}</li>
                      ))}
                      {allLimitations.length > 3 && (
                        <li className="text-muted-foreground">+{allLimitations.length - 3} more limitations</li>
                      )}
                      {allLimitations.length === 0 && (
                        <li className="text-muted-foreground">No significant limitations</li>
                      )}
                    </ul>
                  ) : (
                    <span className="text-muted-foreground">Service not available</span>
                  )}
                </td>
              )
            })}
          </tr>
        ))}
      </React.Fragment>
    ))
  }
}
