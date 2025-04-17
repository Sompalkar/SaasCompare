"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Check, ChevronRight, Filter, Loader2, Plus, Search, X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import { useRecoilState } from "recoil"
import { type SaasTool, categoriesState, selectedToolsState, searchFiltersState } from "@/lib/atoms"
import { useAuth } from "@/lib/auth-provider"
import { getPlanLimits } from "@/lib/utils"
import { toolsAPI } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export default function ComparePage() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get("category") || ""
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [categories] = useRecoilState(categoriesState)
  const [selectedTools, setSelectedTools] = useRecoilState(selectedToolsState)
  const [searchFilters, setSearchFilters] = useRecoilState(searchFiltersState)

  const [filteredTools, setFilteredTools] = useState<SaasTool[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([])
  const [availableIntegrations, setAvailableIntegrations] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)

  const planLimits = getPlanLimits(user?.plan || "free")

  useEffect(() => {
    // Update search filters when category changes
    setSearchFilters({
      ...searchFilters,
      category: selectedCategory,
    })
  }, [selectedCategory])

  useEffect(() => {
    // Fetch tools based on filters
    const fetchTools = async () => {
      setIsLoading(true)
      try {
        const response = await toolsAPI.searchTools({
          query: searchFilters.query,
          category: searchFilters.category,
          minPrice: searchFilters.minPrice,
          maxPrice: searchFilters.maxPrice,
          integrations: searchFilters.integrations,
        })

        setFilteredTools(response.data)

        // Collect all available integrations for filters
        const integrations = new Set<string>()
        response.data.forEach((tool: SaasTool) => {
          tool.integrations.forEach((integration) => {
            integrations.add(integration)
          })
        })
        setAvailableIntegrations(Array.from(integrations).sort())
      } catch (error) {
        console.error("Error fetching tools:", error)
        toast({
          title: "Error",
          description: "Failed to load tools. Please try again.",
          variant: "destructive",
        })

        // Use mock data for demonstration
        setFilteredTools(getMockTools())

        // Extract mock integrations
        const integrations = new Set<string>()
        getMockTools().forEach((tool: any) => {
          tool.integrations.forEach((integration: string) => {
            integrations.add(integration)
          })
        })
        setAvailableIntegrations(Array.from(integrations).sort())
      } finally {
        setIsLoading(false)
      }
    }

    fetchTools()
  }, [searchFilters])

  const handleSelectTool = (tool: SaasTool) => {
    if (selectedTools.some((t) => t.id === tool.id)) {
      setSelectedTools(selectedTools.filter((t) => t.id !== tool.id))
    } else {
      if (selectedTools.length >= planLimits.tools) {
        toast({
          title: `Plan limit reached`,
          description: `You can compare up to ${planLimits.tools} tools on your current plan.`,
          variant: "destructive",
        })
        return
      }
      setSelectedTools([...selectedTools, tool])
    }
  }

  const handleClearFilters = () => {
    setSearchFilters({
      query: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      integrations: "",
    })
    setPriceRange([0, 1000])
    setSelectedIntegrations([])
    setShowFilters(false)
  }

  const handleApplyFilters = () => {
    setSearchFilters({
      ...searchFilters,
      minPrice: priceRange[0].toString(),
      maxPrice: priceRange[1].toString(),
      integrations: selectedIntegrations.join(","),
    })
    setShowFilters(false)
  }

  const handleCompareTools = () => {
    if (selectedTools.length < 2) {
      toast({
        title: "Select more tools",
        description: "Please select at least 2 tools to compare",
        variant: "destructive",
      })
      return
    }

    router.push("/dashboard/compare/result")
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  }

  // Mock data for demonstration
  const getMockTools = () => {
    return [
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
      {
        id: "3",
        name: "Asana",
        logo: "/placeholder.svg?height=48&width=48",
        description: "Work management platform for teams",
        category: "Project Management",
        website: "https://asana.com",
        pricing: {
          free: {
            price: 0,
            features: ["Task Management", "List View", "Board View"],
            limitations: ["Limited team members", "Basic reporting", "No custom fields"],
          },
          starter: {
            price: 10.99,
            features: ["Everything in Free", "Timeline View", "Custom Fields"],
            limitations: ["Limited dashboards", "No portfolios"],
          },
          pro: {
            price: 24.99,
            features: ["Everything in Starter", "Portfolios", "Advanced Reporting"],
            limitations: ["Limited goals"],
          },
        },
        integrations: ["Slack", "Google Workspace", "Microsoft Teams", "Zoom", "GitHub"],
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "4",
        name: "Monday.com",
        logo: "/placeholder.svg?height=48&width=48",
        description: "Work OS for teams to plan, track, and manage work",
        category: "Project Management",
        website: "https://monday.com",
        pricing: {
          free: {
            price: 0,
            features: ["Basic task management", "Limited boards", "200+ templates"],
            limitations: ["Limited items", "Limited storage", "No automations"],
          },
          starter: {
            price: 8,
            features: ["Everything in Free", "Unlimited boards", "Basic automations"],
            limitations: ["Limited integrations", "Limited dashboard views"],
          },
          pro: {
            price: 16,
            features: ["Everything in Starter", "Private boards", "Advanced automations"],
            limitations: ["Limited time tracking"],
          },
        },
        integrations: ["Slack", "Google Drive", "Zoom", "GitHub", "Jira", "Trello"],
        lastUpdated: new Date().toISOString(),
      },
    ]
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Compare SaaS Tools</h1>
        <p className="text-muted-foreground">Select tools to compare features, pricing, and limitations</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-2/3">
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for tools..."
                className="pl-9"
                value={searchFilters.query}
                onChange={(e) => setSearchFilters({ ...searchFilters, query: e.target.value })}
              />
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                  {(selectedIntegrations.length > 0 || priceRange[0] > 0 || priceRange[1] < 1000) && (
                    <Badge variant="secondary" className="ml-1">
                      {selectedIntegrations.length + (priceRange[0] > 0 || priceRange[1] < 1000 ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>Refine your search with these filters</SheetDescription>
                </SheetHeader>
                <div className="py-6 space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Price Range (Monthly)</h4>
                    <div className="space-y-4">
                      <Slider
                        defaultValue={priceRange}
                        min={0}
                        max={1000}
                        step={10}
                        value={priceRange}
                        onValueChange={(value) => setPriceRange(value as [number, number])}
                        className="py-4"
                      />
                      <div className="flex items-center justify-between">
                        <div className="text-sm">${priceRange[0]}</div>
                        <div className="text-sm">${priceRange[1]}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Integrations</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {availableIntegrations.map((integration) => (
                        <div key={integration} className="flex items-center space-x-2">
                          <Checkbox
                            id={`integration-${integration}`}
                            checked={selectedIntegrations.includes(integration)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedIntegrations([...selectedIntegrations, integration])
                              } else {
                                setSelectedIntegrations(selectedIntegrations.filter((i) => i !== integration))
                              }
                            }}
                          />
                          <Label htmlFor={`integration-${integration}`}>{integration}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={handleClearFilters}>
                      Clear All
                    </Button>
                    <Button onClick={handleApplyFilters}>Apply Filters</Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <Tabs defaultValue={initialCategory || "all"} onValueChange={setSelectedCategory}>
            <TabsList className="mb-4 w-full overflow-x-auto flex-nowrap justify-start">
              <TabsTrigger value="all">All Categories</TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="all" className="mt-0">
              {renderToolsList()}
            </TabsContent>
            {categories.map((category) => (
              <TabsContent key={category} value={category} className="mt-0">
                {renderToolsList()}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <div className="w-full md:w-1/3">
          <Card className="sticky top-20">
            <CardContent className="p-4">
              <h3 className="font-medium mb-4">
                Selected Tools ({selectedTools.length}/{planLimits.tools})
              </h3>
              <AnimatePresence>
                {selectedTools.length > 0 ? (
                  <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-3">
                    {selectedTools.map((tool) => (
                      <motion.div
                        key={tool.id}
                        variants={itemVariants}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex items-center justify-between bg-muted p-2 rounded-md"
                      >
                        <div className="flex items-center gap-2">
                          <img src={tool.logo || "/placeholder.svg"} alt={tool.name} className="h-8 w-8 rounded-md" />
                          <div>
                            <p className="font-medium">{tool.name}</p>
                            <p className="text-xs text-muted-foreground">{tool.category}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleSelectTool(tool)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                    <Button
                      className="w-full mt-4 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700"
                      disabled={selectedTools.length < 2}
                      onClick={handleCompareTools}
                    >
                      Compare Tools <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                    <div className="rounded-full bg-muted p-3 mx-auto w-fit mb-3">
                      <Plus className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="font-medium">No tools selected</p>
                    <p className="text-sm text-muted-foreground mt-1">Select at least 2 tools to compare</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  function renderToolsList() {
    if (isLoading) {
      return (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading tools...</p>
          </div>
        </div>
      )
    }

    if (filteredTools.length === 0) {
      return (
        <div className="text-center py-12 border rounded-lg">
          <div className="rounded-full bg-muted p-3 mx-auto w-fit mb-3">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-medium">No tools found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
          <Button variant="outline" className="mt-4" onClick={handleClearFilters}>
            Clear filters
          </Button>
        </div>
      )
    }

    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {filteredTools.map((tool) => {
          const isSelected = selectedTools.some((t) => t.id === tool.id)
          return (
            <motion.div key={tool.id} variants={itemVariants} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
              <Card
                className={`cursor-pointer hover:shadow-md transition-all ${isSelected ? "border-primary dark:border-primary" : ""}`}
                onClick={() => handleSelectTool(tool)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img src={tool.logo || "/placeholder.svg"} alt={tool.name} className="h-12 w-12 rounded-md" />
                      <div>
                        <h3 className="font-medium">{tool.name}</h3>
                        <p className="text-sm text-muted-foreground">{tool.category}</p>
                      </div>
                    </div>
                    <div
                      className={`rounded-full p-1 ${isSelected ? "bg-primary text-white dark:bg-primary" : "bg-muted"}`}
                    >
                      {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </div>
                  </div>
                  <p className="text-sm mt-3">{tool.description}</p>
                  <div className="mt-3">
                    <p className="text-sm font-medium">Pricing:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {tool.pricing.free && <Badge variant="outline">Free</Badge>}
                      {tool.pricing.starter && (
                        <Badge variant="outline">
                          Starter: $
                          {typeof tool.pricing.starter.price === "number" ? tool.pricing.starter.price : "Custom"}
                        </Badge>
                      )}
                      {tool.pricing.pro && (
                        <Badge variant="outline">
                          Pro: ${typeof tool.pricing.pro.price === "number" ? tool.pricing.pro.price : "Custom"}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm font-medium">Integrations:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tool.integrations.slice(0, 3).map((integration, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {integration}
                        </Badge>
                      ))}
                      {tool.integrations.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{tool.integrations.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>
    )
  }
}
