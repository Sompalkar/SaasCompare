"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Check, FileText, LineChart, Save, Share2, X } from "lucide-react"
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
import PublicHeader from "@/components/public/public-header"

export default function ComparisonResultPage() {
  const [activeTab, setActiveTab] = useState("features")
  const [comparisonName, setComparisonName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  // Mock data for the comparison
  const [selectedTools, setSelectedTools] = useState([
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
  ])

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleSaveComparison = async () => {
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Sign up required",
        description: "Create an account to save comparisons",
      })

      // Redirect to sign up page
      router.push("/auth/register")
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
    setIsGeneratingReport(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Sign up required",
        description: "Create an account to generate reports",
      })

      // Redirect to sign up page
      router.push("/auth/register")
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

  if (isLoading) {
    return (
      <>
        <PublicHeader />
        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">Generating Comparison</h2>
              <p className="text-muted-foreground">Please wait while we analyze the selected tools...</p>
            </div>
          </div>
        </div>
      </>
    )
  }

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
              <p className="text-muted-foreground">Comparing {selectedTools.length} tools</p>
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
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    >
                      {isSaving ? "Saving..." : "Save Comparison"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-100 dark:border-indigo-800">
              <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-indigo-100 dark:bg-indigo-900 p-2">
                    <LineChart className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
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
                    <Button
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800"
                    >
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
            </TabsList>
            <TabsContent value="features" className="mt-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 bg-muted/50 sticky left-0 min-w-[200px]">Feature</th>
                      {selectedTools.map((tool) => (
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
                      {selectedTools.map((tool) => (
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
                      {selectedTools.map((tool) => (
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
                      {selectedTools.map((tool) => (
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
                      {selectedTools.map((tool) => (
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
                      {selectedTools.map((tool) => (
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
                      {selectedTools.map((tool) => (
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
                      {selectedTools.map((tool) => (
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
                      {selectedTools.map((tool) => (
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
                      {selectedTools.map((tool) => (
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
                      {selectedTools.map((tool) => (
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
          </Tabs>
        </div>
      </div>
    </>
  )

  function renderFeatureRows() {
    // Collect all unique features across all tools and plans
    const allFeatures = new Set<string>()

    selectedTools.forEach((tool) => {
      Object.values(tool.pricing).forEach((plan) => {
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
        {selectedTools.map((tool) => {
          const hasFeature = Object.values(tool.pricing).some(
            (plan) => plan && plan.features && plan.features.includes(feature),
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

    selectedTools.forEach((tool) => {
      tool.integrations.forEach((integration) => {
        allIntegrations.add(integration)
      })
    })

    return Array.from(allIntegrations)
      .sort()
      .map((integration, index) => (
        <tr key={index} className="border-b">
          <td className="p-3 bg-muted/50 sticky left-0">{integration}</td>
          {selectedTools.map((tool) => {
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
