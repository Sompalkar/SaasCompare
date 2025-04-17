"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Check, ChevronRight, Loader2, Plus, Search, X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import MainHeader from "@/components/shared/main-header"
import ServiceNavigation from "@/components/shared/service-navigation"

// Define types
interface CloudProvider {
  id: string
  name: string
  logo: string
  description: string
  website: string
  services: CloudService[]
  lastUpdated: string
}

interface CloudService {
  id: string
  name: string
  type: string
  description: string
  pricing: any
}

export default function CloudProvidersPage() {
  const searchParams = useSearchParams()
  const initialServiceType = searchParams.get("serviceType") || ""
  const { toast } = useToast()
  const router = useRouter()

  const [selectedProviders, setSelectedProviders] = useState<CloudProvider[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [providers, setProviders] = useState<CloudProvider[]>([])
  const [filteredProviders, setFilteredProviders] = useState<CloudProvider[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>(
    initialServiceType ? [initialServiceType] : [],
  )
  const [serviceTypes, setServiceTypes] = useState<string[]>([])
  const [selectedServiceType, setSelectedServiceType] = useState(initialServiceType || "all")

  // Maximum number of providers to compare
  const maxProviders = 3

  useEffect(() => {
    // Fetch cloud providers and service types
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // In a real app, we would call the API
        // const providersResponse = await cloudProvidersAPI.getAllProviders();
        // const serviceTypesResponse = await cloudProvidersAPI.getServiceTypes();
        // setProviders(providersResponse.data);
        // setServiceTypes(serviceTypesResponse.data);

        // For now, we'll use mock data
        const mockProviders = [
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
          {
            id: "3",
            name: "Google Cloud Platform",
            logo: "/placeholder.svg?height=40&width=40",
            description: "Google's suite of cloud computing services",
            website: "https://cloud.google.com",
            services: [
              {
                id: "gcp-compute",
                name: "Compute Engine",
                type: "Compute",
                description: "Virtual machines running in Google's data centers",
                pricing: {
                  free: {
                    price: 0,
                    features: ["1 e2-micro VM instance", "30GB HDD storage"],
                    limitations: ["Always free tier limitations", "US regions only"],
                  },
                  basic: {
                    price: 0.0208,
                    features: ["On-demand instances", "Per-second billing", "Custom machine types"],
                    limitations: ["No committed use discounts", "No sustained use discounts"],
                  },
                  standard: {
                    price: 0.0146,
                    features: ["Committed use discounts", "1-year commitment", "Predictable workloads"],
                    limitations: ["Commitment required"],
                  },
                  premium: {
                    price: 0.0104,
                    features: ["Committed use discounts", "3-year commitment", "Maximum savings"],
                    limitations: ["Long-term commitment required"],
                  },
                  enterprise: null,
                },
              },
              {
                id: "gcp-storage",
                name: "Cloud Storage",
                type: "Storage",
                description: "Object storage for companies of all sizes",
                pricing: {
                  free: {
                    price: 0,
                    features: ["5GB of storage", "5,000 Class A operations", "50,000 Class B operations"],
                    limitations: ["Always free tier limitations", "US regions only"],
                  },
                  basic: {
                    price: 0.02,
                    features: ["Standard storage", "Global availability", "Unlimited storage"],
                    limitations: ["Higher cost for frequent access"],
                  },
                  standard: {
                    price: 0.01,
                    features: ["Nearline storage", "Lower storage cost", "Higher retrieval cost"],
                    limitations: ["30-day minimum storage duration"],
                  },
                  premium: {
                    price: 0.007,
                    features: ["Coldline storage", "Very low storage cost", "Higher retrieval cost"],
                    limitations: ["90-day minimum storage duration"],
                  },
                  enterprise: {
                    price: 0.004,
                    features: ["Archive storage", "Lowest storage cost", "Highest retrieval cost"],
                    limitations: ["365-day minimum storage duration"],
                  },
                },
              },
              {
                id: "gcp-sql",
                name: "Cloud SQL",
                type: "Database",
                description: "Fully managed relational database service",
                pricing: {
                  free: null,
                  basic: {
                    price: 0.0105,
                    features: ["Shared-core machine", "0.6GB RAM", "10GB storage"],
                    limitations: ["Limited performance", "No high availability"],
                  },
                  standard: {
                    price: 0.0526,
                    features: ["1 vCPU", "3.75GB RAM", "High availability option"],
                    limitations: ["Medium performance"],
                  },
                  premium: {
                    price: 0.1776,
                    features: ["4 vCPU", "15GB RAM", "High performance"],
                    limitations: ["Higher cost"],
                  },
                  enterprise: {
                    price: 0.3551,
                    features: ["8 vCPU", "30GB RAM", "Maximum performance"],
                    limitations: ["Highest cost option"],
                  },
                },
              },
            ],
            lastUpdated: new Date().toISOString(),
          },
        ]

        const mockServiceTypes = ["Compute", "Storage", "Database", "Networking", "AI/ML", "Serverless"]

        setProviders(mockProviders)
        setServiceTypes(mockServiceTypes)
        setFilteredProviders(mockProviders)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load cloud providers. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  useEffect(() => {
    // Filter providers based on search query and selected service types
    if (providers.length > 0) {
      let filtered = [...providers]

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filtered = filtered.filter(
          (provider) =>
            provider.name.toLowerCase().includes(query) || provider.description.toLowerCase().includes(query),
        )
      }

      // Apply service type filter
      if (selectedServiceType !== "all") {
        filtered = filtered.filter((provider) =>
          provider.services.some((service) => service.type === selectedServiceType),
        )
      }

      setFilteredProviders(filtered)
    }
  }, [searchQuery, selectedServiceType, providers])

  const handleSelectProvider = (provider: CloudProvider) => {
    if (selectedProviders.some((p) => p.id === provider.id)) {
      setSelectedProviders(selectedProviders.filter((p) => p.id !== provider.id))
    } else {
      if (selectedProviders.length >= maxProviders) {
        toast({
          title: `Maximum providers reached`,
          description: `You can compare up to ${maxProviders} providers. Sign up for a free account to compare more.`,
          variant: "destructive",
        })
        return
      }
      setSelectedProviders([...selectedProviders, provider])
    }
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

  return (
    <>
      <MainHeader />
      <ServiceNavigation />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Compare Cloud Providers</h1>
          <p className="text-muted-foreground">Select cloud providers to compare services, pricing, and features</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-2/3">
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for cloud providers..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <Tabs defaultValue={initialServiceType || "all"} onValueChange={setSelectedServiceType}>
              <TabsList className="mb-4 w-full overflow-x-auto flex-nowrap justify-start">
                <TabsTrigger value="all">All Services</TabsTrigger>
                {serviceTypes.map((type) => (
                  <TabsTrigger key={type} value={type}>
                    {type}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="all" className="mt-0">
                {renderProvidersList()}
              </TabsContent>
              {serviceTypes.map((type) => (
                <TabsContent key={type} value={type} className="mt-0">
                  {renderProvidersList()}
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <div className="w-full md:w-1/3">
            <Card className="sticky top-20">
              <CardContent className="p-4">
                <h3 className="font-medium mb-4">
                  Selected Providers ({selectedProviders.length}/{maxProviders})
                </h3>
                <AnimatePresence>
                  {selectedProviders.length > 0 ? (
                    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-3">
                      {selectedProviders.map((provider) => (
                        <motion.div
                          key={provider.id}
                          variants={itemVariants}
                          exit={{ opacity: 0, x: -10 }}
                          className="flex items-center justify-between bg-muted p-2 rounded-md"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={provider.logo || "/placeholder.svg?height=32&width=32"}
                              alt={provider.name}
                              className="h-8 w-8 rounded-md"
                            />
                            <div>
                              <p className="font-medium">{provider.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {provider.services.length} services available
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleSelectProvider(provider)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      ))}

                      <div className="space-y-2 mt-4">
                        <p className="text-sm font-medium">Select service types to compare:</p>
                        <div className="space-y-2">
                          {serviceTypes.map((type) => (
                            <div key={type} className="flex items-center space-x-2">
                              <Checkbox
                                id={`service-${type}`}
                                checked={selectedServiceTypes.includes(type)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedServiceTypes([...selectedServiceTypes, type])
                                  } else {
                                    setSelectedServiceTypes(selectedServiceTypes.filter((t) => t !== type))
                                  }
                                }}
                              />
                              <Label htmlFor={`service-${type}`}>{type}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button
                        className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                        disabled={selectedProviders.length < 2 || selectedServiceTypes.length === 0}
                        onClick={() => router.push("/cloud-providers/result")}
                      >
                        Compare Providers <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                      <div className="rounded-full bg-muted p-3 mx-auto w-fit mb-3">
                        <Plus className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="font-medium">No providers selected</p>
                      <p className="text-sm text-muted-foreground mt-1">Select at least 2 providers to compare</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )

  function renderProvidersList() {
    if (isLoading) {
      return (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading cloud providers...</p>
          </div>
        </div>
      )
    }

    if (filteredProviders.length === 0) {
      return (
        <div className="text-center py-12 border rounded-lg">
          <div className="rounded-full bg-muted p-3 mx-auto w-fit mb-3">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-medium">No providers found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
          <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
            Clear search
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
        {filteredProviders.map((provider) => {
          const isSelected = selectedProviders.some((p) => p.id === provider.id)
          const relevantServices =
            selectedServiceType === "all"
              ? provider.services
              : provider.services.filter((service) => service.type === selectedServiceType)

          return (
            <motion.div key={provider.id} variants={itemVariants} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
              <Card
                className={`cursor-pointer hover:shadow-md transition-all ${isSelected ? "border-purple-500 dark:border-purple-400" : ""}`}
                onClick={() => handleSelectProvider(provider)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={provider.logo || "/placeholder.svg?height=40&width=40"}
                        alt={provider.name}
                        className="h-12 w-12 rounded-md"
                      />
                      <div>
                        <h3 className="font-medium">{provider.name}</h3>
                        <p className="text-sm text-muted-foreground">{provider.services.length} services available</p>
                      </div>
                    </div>
                    <div
                      className={`rounded-full p-1 ${isSelected ? "bg-purple-500 text-white dark:bg-purple-400" : "bg-muted"}`}
                    >
                      {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </div>
                  </div>
                  <p className="text-sm mt-3">{provider.description}</p>

                  <div className="mt-3">
                    <p className="text-sm font-medium">Available services:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {relevantServices.slice(0, 3).map((service) => (
                        <Badge key={service.id} variant="secondary" className="text-xs">
                          {service.name} ({service.type})
                        </Badge>
                      ))}
                      {relevantServices.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{relevantServices.length - 3} more
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
