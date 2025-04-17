// "use client"

// import { useState } from "react"
// import { useRecoilValue } from "recoil"
// import { selectedToolsState } from "@/lib/atoms"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent } from "@/components/ui/card"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { ArrowLeft, Check, FileText, LineChart, Save, Share2, X } from "lucide-react"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { useToast } from "@/components/ui/use-toast"
// import { formatPrice, calculateSavings } from "@/lib/utils"
// import { useAuth } from "@/lib/auth-provider"
// import Link from "next/link"

// export default function ComparisonResultPage() {
//   const selectedTools = useRecoilValue(selectedToolsState)
//   const [activeTab, setActiveTab] = useState("features")
//   const [comparisonName, setComparisonName] = useState("")
//   const [isSaving, setIsSaving] = useState(false)
//   const [isGeneratingReport, setIsGeneratingReport] = useState(false)
//   const { toast } = useToast()
//   const { user } = useAuth()

//   // Redirect if no tools are selected
//   if (selectedTools.length < 2) {
//     return (
//       <div className="flex flex-col items-center justify-center py-12">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold mb-2">No tools selected</h2>
//           <p className="text-muted-foreground mb-6">Please select at least 2 tools to compare</p>
//           <Link href="/dashboard/compare">
//             <Button>
//               <ArrowLeft className="mr-2 h-4 w-4" />
//               Back to Selection
//             </Button>
//           </Link>
//         </div>
//       </div>
//     )
//   }

//   const handleSaveComparison = async () => {
//     if (!comparisonName.trim()) {
//       toast({
//         title: "Name required",
//         description: "Please enter a name for your comparison",
//         variant: "destructive",
//       })
//       return
//     }

//     setIsSaving(true)
//     // In a real app, this would be an API call
//     setTimeout(() => {
//       toast({
//         title: "Comparison saved",
//         description: `"${comparisonName}" has been saved to your account`,
//       })
//       setIsSaving(false)
//     }, 1000)
//   }

//   const handleGenerateReport = async () => {
//     if (user?.plan === "free") {
//       toast({
//         title: "Upgrade required",
//         description: "Report generation is available on Pro and Enterprise plans",
//         variant: "destructive",
//       })
//       return
//     }

//     setIsGeneratingReport(true)
//     // In a real app, this would be an API call
//     setTimeout(() => {
//       toast({
//         title: "Report generated",
//         description: "Your comparison report is ready to download",
//       })
//       setIsGeneratingReport(false)
//     }, 2000)
//   }

//   const potentialSavings = calculateSavings(selectedTools)

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <Link
//             href="/dashboard/compare"
//             className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
//           >
//             <ArrowLeft className="mr-1 h-4 w-4" />
//             Back to selection
//           </Link>
//           <h1 className="text-3xl font-bold tracking-tight">Comparison Results</h1>
//           <p className="text-muted-foreground">Comparing {selectedTools.length} tools</p>
//         </div>
//         <div className="flex flex-wrap gap-2">
//           <Dialog>
//             <DialogTrigger asChild>
//               <Button variant="outline" className="gap-2">
//                 <Save className="h-4 w-4" />
//                 Save
//               </Button>
//             </DialogTrigger>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Save Comparison</DialogTitle>
//                 <DialogDescription>Save this comparison to access it later from your dashboard.</DialogDescription>
//               </DialogHeader>
//               <div className="py-4">
//                 <Label htmlFor="name" className="text-right">
//                   Comparison Name
//                 </Label>
//                 <Input
//                   id="name"
//                   placeholder="e.g., CRM Tools Comparison"
//                   value={comparisonName}
//                   onChange={(e) => setComparisonName(e.target.value)}
//                   className="mt-2"
//                 />
//               </div>
//               <DialogFooter>
//                 <Button onClick={handleSaveComparison} disabled={isSaving}>
//                   {isSaving ? "Saving..." : "Save Comparison"}
//                 </Button>
//               </DialogFooter>
//             </DialogContent>
//           </Dialog>
//           <Button variant="outline" className="gap-2" onClick={handleGenerateReport} disabled={isGeneratingReport}>
//             <FileText className="h-4 w-4" />
//             {isGeneratingReport ? "Generating..." : "Generate Report"}
//           </Button>
//           <Button variant="outline" className="gap-2">
//             <Share2 className="h-4 w-4" />
//             Share
//           </Button>
//         </div>
//       </div>

//       {potentialSavings > 0 && (
//         <Card className="bg-primary/5 border-primary/20">
//           <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//             <div className="flex items-center gap-3">
//               <div className="rounded-full bg-primary/10 p-2">
//                 <LineChart className="h-5 w-5 text-primary" />
//               </div>
//               <div>
//                 <h3 className="font-medium">Potential Cost Savings</h3>
//                 <p className="text-sm text-muted-foreground">Based on your current selection and usage patterns</p>
//               </div>
//             </div>
//             <div className="flex items-center gap-4">
//               <div className="text-2xl font-bold text-primary">{formatPrice(potentialSavings)}/year</div>
//               <Button size="sm">View Details</Button>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       <Tabs defaultValue="features" value={activeTab} onValueChange={setActiveTab}>
//         <TabsList className="w-full justify-start overflow-x-auto">
//           <TabsTrigger value="features">Features</TabsTrigger>
//           <TabsTrigger value="pricing">Pricing</TabsTrigger>
//           <TabsTrigger value="limitations">Limitations</TabsTrigger>
//           <TabsTrigger value="integrations">Integrations</TabsTrigger>
//         </TabsList>
//         <TabsContent value="features" className="mt-6">
//           <div className="overflow-x-auto">
//             <table className="w-full border-collapse">
//               <thead>
//                 <tr className="border-b">
//                   <th className="text-left p-3 bg-muted/50 sticky left-0 min-w-[200px]">Feature</th>
//                   {selectedTools.map((tool) => (
//                     <th key={tool.id} className="text-center p-3 min-w-[180px]">
//                       <div className="flex flex-col items-center">
//                         <img
//                           src={tool.logo || "/placeholder.svg"}
//                           alt={tool.name}
//                           className="h-10 w-10 rounded-md mb-2"
//                         />
//                         <span>{tool.name}</span>
//                       </div>
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>{renderFeatureRows()}</tbody>
//             </table>
//           </div>
//         </TabsContent>
//         <TabsContent value="pricing" className="mt-6">
//           <div className="overflow-x-auto">
//             <table className="w-full border-collapse">
//               <thead>
//                 <tr className="border-b">
//                   <th className="text-left p-3 bg-muted/50 sticky left-0 min-w-[200px]">Plan</th>
//                   {selectedTools.map((tool) => (
//                     <th key={tool.id} className="text-center p-3 min-w-[180px]">
//                       <div className="flex flex-col items-center">
//                         <img
//                           src={tool.logo || "/placeholder.svg"}
//                           alt={tool.name}
//                           className="h-10 w-10 rounded-md mb-2"
//                         />
//                         <span>{tool.name}</span>
//                       </div>
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 <tr className="border-b">
//                   <td className="p-3 font-medium bg-muted/50 sticky left-0">Free</td>
//                   {selectedTools.map((tool) => (
//                     <td key={tool.id} className="p-3 text-center">
//                       {tool.pricing.free ? (
//                         <div>
//                           <div className="font-medium">{formatPrice(tool.pricing.free.price)}</div>
//                           <div className="text-sm text-muted-foreground">per user/month</div>
//                         </div>
//                       ) : (
//                         <span className="text-muted-foreground">Not available</span>
//                       )}
//                     </td>
//                   ))}
//                 </tr>
//                 <tr className="border-b">
//                   <td className="p-3 font-medium bg-muted/50 sticky left-0">Starter</td>
//                   {selectedTools.map((tool) => (
//                     <td key={tool.id} className="p-3 text-center">
//                       {tool.pricing.starter ? (
//                         <div>
//                           <div className="font-medium">{formatPrice(tool.pricing.starter.price)}</div>
//                           <div className="text-sm text-muted-foreground">per user/month</div>
//                         </div>
//                       ) : (
//                         <span className="text-muted-foreground">Not available</span>
//                       )}
//                     </td>
//                   ))}
//                 </tr>
//                 <tr className="border-b">
//                   <td className="p-3 font-medium bg-muted/50 sticky left-0">Pro</td>
//                   {selectedTools.map((tool) => (
//                     <td key={tool.id} className="p-3 text-center">
//                       {tool.pricing.pro ? (
//                         <div>
//                           <div className="font-medium">{formatPrice(tool.pricing.pro.price)}</div>
//                           <div className="text-sm text-muted-foreground">per user/month</div>
//                         </div>
//                       ) : (
//                         <span className="text-muted-foreground">Not available</span>
//                       )}
//                     </td>
//                   ))}
//                 </tr>
//                 <tr className="border-b">
//                   <td className="p-3 font-medium bg-muted/50 sticky left-0">Enterprise</td>
//                   {selectedTools.map((tool) => (
//                     <td key={tool.id} className="p-3 text-center">
//                       {tool.pricing.enterprise ? (
//                         <div>
//                           <div className="font-medium">{formatPrice(tool.pricing.enterprise.price)}</div>
//                           <div className="text-sm text-muted-foreground">per user/month</div>
//                         </div>
//                       ) : (
//                         <span className="text-muted-foreground">Not available</span>
//                       )}
//                     </td>
//                   ))}
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//         </TabsContent>
//         <TabsContent value="limitations" className="mt-6">
//           <div className="overflow-x-auto">
//             <table className="w-full border-collapse">
//               <thead>
//                 <tr className="border-b">
//                   <th className="text-left p-3 bg-muted/50 sticky left-0 min-w-[200px]">Plan</th>
//                   {selectedTools.map((tool) => (
//                     <th key={tool.id} className="text-center p-3 min-w-[180px]">
//                       <div className="flex flex-col items-center">
//                         <img
//                           src={tool.logo || "/placeholder.svg"}
//                           alt={tool.name}
//                           className="h-10 w-10 rounded-md mb-2"
//                         />
//                         <span>{tool.name}</span>
//                       </div>
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 <tr className="border-b">
//                   <td className="p-3 font-medium bg-muted/50 sticky left-0">Free</td>
//                   {selectedTools.map((tool) => (
//                     <td key={tool.id} className="p-3">
//                       {tool.pricing.free ? (
//                         <ul className="list-disc pl-5 text-sm">
//                           {tool.pricing.free.limitations.map((limitation, index) => (
//                             <li key={index}>{limitation}</li>
//                           ))}
//                           {tool.pricing.free.limitations.length === 0 && (
//                             <li className="text-muted-foreground">No significant limitations</li>
//                           )}
//                         </ul>
//                       ) : (
//                         <span className="text-muted-foreground">Not available</span>
//                       )}
//                     </td>
//                   ))}
//                 </tr>
//                 <tr className="border-b">
//                   <td className="p-3 font-medium bg-muted/50 sticky left-0">Starter</td>
//                   {selectedTools.map((tool) => (
//                     <td key={tool.id} className="p-3">
//                       {tool.pricing.starter ? (
//                         <ul className="list-disc pl-5 text-sm">
//                           {tool.pricing.starter.limitations.map((limitation, index) => (
//                             <li key={index}>{limitation}</li>
//                           ))}
//                           {tool.pricing.starter.limitations.length === 0 && (
//                             <li className="text-muted-foreground">No significant limitations</li>
//                           )}
//                         </ul>
//                       ) : (
//                         <span className="text-muted-foreground">Not available</span>
//                       )}
//                     </td>
//                   ))}
//                 </tr>
//                 <tr className="border-b">
//                   <td className="p-3 font-medium bg-muted/50 sticky left-0">Pro</td>
//                   {selectedTools.map((tool) => (
//                     <td key={tool.id} className="p-3">
//                       {tool.pricing.pro ? (
//                         <ul className="list-disc pl-5 text-sm">
//                           {tool.pricing.pro.limitations.map((limitation, index) => (
//                             <li key={index}>{limitation}</li>
//                           ))}
//                           {tool.pricing.pro.limitations.length === 0 && (
//                             <li className="text-muted-foreground">No significant limitations</li>
//                           )}
//                         </ul>
//                       ) : (
//                         <span className="text-muted-foreground">Not available</span>
//                       )}
//                     </td>
//                   ))}
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//         </TabsContent>
//         <TabsContent value="integrations" className="mt-6">
//           <div className="overflow-x-auto">
//             <table className="w-full border-collapse">
//               <thead>
//                 <tr className="border-b">
//                   <th className="text-left p-3 bg-muted/50 sticky left-0 min-w-[200px]">Integration</th>
//                   {selectedTools.map((tool) => (
//                     <th key={tool.id} className="text-center p-3 min-w-[180px]">
//                       <div className="flex flex-col items-center">
//                         <img
//                           src={tool.logo || "/placeholder.svg"}
//                           alt={tool.name}
//                           className="h-10 w-10 rounded-md mb-2"
//                         />
//                         <span>{tool.name}</span>
//                       </div>
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>{renderIntegrationRows()}</tbody>
//             </table>
//           </div>
//         </TabsContent>
//       </Tabs>
//     </div>
//   )

//   function renderFeatureRows() {
//     // Collect all unique features across all tools and plans
//     const allFeatures = new Set<string>()

//     selectedTools.forEach((tool) => {
//       Object.values(tool.pricing).forEach((plan) => {
//         if (plan && plan.features) {
//           plan.features.forEach((feature) => {
//             allFeatures.add(feature)
//           })
//         }
//       })
//     })

//     return Array.from(allFeatures).map((feature, index) => (
//       <tr key={index} className="border-b">
//         <td className="p-3 bg-muted/50 sticky left-0">{feature}</td>
//         {selectedTools.map((tool) => {
//           const hasFeature = Object.values(tool.pricing).some(
//             (plan) => plan && plan.features && plan.features.includes(feature),
//           )

//           return (
//             <td key={tool.id} className="p-3 text-center">
//               {hasFeature ? (
//                 <Check className="h-5 w-5 text-green-500 mx-auto" />
//               ) : (
//                 <X className="h-5 w-5 text-red-500 mx-auto" />
//               )}
//             </td>
//           )
//         })}
//       </tr>
//     ))
//   }

//   function renderIntegrationRows() {
//     // Collect all unique integrations
//     const allIntegrations = new Set<string>()

//     selectedTools.forEach((tool) => {
//       tool.integrations.forEach((integration) => {
//         allIntegrations.add(integration)
//       })
//     })

//     return Array.from(allIntegrations)
//       .sort()
//       .map((integration, index) => (
//         <tr key={index} className="border-b">
//           <td className="p-3 bg-muted/50 sticky left-0">{integration}</td>
//           {selectedTools.map((tool) => {
//             const hasIntegration = tool.integrations.includes(integration)

//             return (
//               <td key={tool.id} className="p-3 text-center">
//                 {hasIntegration ? (
//                   <Check className="h-5 w-5 text-green-500 mx-auto" />
//                 ) : (
//                   <X className="h-5 w-5 text-red-500 mx-auto" />
//                 )}
//               </td>
//             )
//           })}
//         </tr>
//       ))
//   }
// }














































"use client"

import { useState, useEffect } from "react"
import { useRecoilValue } from "recoil"
import { selectedToolsState } from "@/lib/atoms"
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
import { formatPrice, calculateSavings } from "@/lib/utils"
import { useAuth } from "@/lib/auth-provider"
import { compareAPI, userAPI, reportsAPI } from "@/lib/api"
import Link from "next/link"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

export default function ComparisonResultPage() {
  const selectedTools = useRecoilValue(selectedToolsState)
  const [activeTab, setActiveTab] = useState("features")
  const [comparisonName, setComparisonName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [comparisonResult, setComparisonResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast
  const { user } = useAuth()
  const router = useRouter()

  // Redirect if no tools are selected
  useEffect(() => {
    if (selectedTools.length < 2) {
      router.push("/dashboard/compare")
    } else {
      fetchComparisonData()
    }
  }, [selectedTools, router])

  const fetchComparisonData = async () => {
    try {
      setIsLoading(true)
      const toolIds = selectedTools.map((tool) => tool.id)
      const response = await compareAPI.compareTools(toolIds)
      setComparisonResult(response.data)
    } catch (error) {
      console.error("Error fetching comparison data:", error)
      toast({
        title: "Error",
        description: "Failed to generate comparison. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveComparison = async () => {
    if (!comparisonResult) return

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
      await userAPI.saveComparison(comparisonResult.id, comparisonName)
      toast({
        title: "Comparison saved",
        description: `"${comparisonName}" has been saved to your account`,
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
    if (!comparisonResult) return

    if (user?.plan === "FREE") {
      toast({
        title: "Upgrade required",
        description: "Report generation is available on Pro and Enterprise plans",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingReport(true)
    try {
      const response = await reportsAPI.generateReport(comparisonResult.id, "PDF", true)
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

  const potentialSavings = calculateSavings(selectedTools)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Generating Comparison</h2>
          <p className="text-muted-foreground">Please wait while we analyze the selected tools...</p>
        </div>
      </div>
    )
  }

  if (selectedTools.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No tools selected</h2>
          <p className="text-muted-foreground mb-6">Please select at least 2 tools to compare</p>
          <Link href="/dashboard/compare">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Selection
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
            href="/dashboard/compare"
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
                  {selectedTools.map((tool) => (
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
                  {selectedTools.map((tool) => (
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
