"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, Loader2, Plus, Share2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-provider"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

type Report = {
  id: string
  name: string
  description: string
  createdAt: string
  tools: { id: string; name: string; logo: string }[]
  downloadUrl: string
}

export default function ReportsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [reports, setReports] = useState<Report[]>([])

  // Check if user can access reports
  const canAccessReports = user?.plan !== "free"

  if (!canAccessReports) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Generate and download detailed comparison reports</p>
        </div>

        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto w-fit rounded-full bg-muted p-3 mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Upgrade to Access Reports</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Report generation is available on Pro and Enterprise plans. Upgrade to create detailed PDF reports of your
              comparisons.
            </p>
            <Link href="/dashboard/subscription">
              <Button>Upgrade Now</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Mock data for reports
  const mockReports: Report[] = [
    {
      id: "1",
      name: "CRM Tools Comparison",
      description: "Detailed comparison of Salesforce, HubSpot, and Zoho CRM",
      createdAt: new Date().toISOString(),
      tools: [
        { id: "1", name: "Salesforce", logo: "/placeholder.svg?height=40&width=40" },
        { id: "2", name: "HubSpot", logo: "/placeholder.svg?height=40&width=40" },
        { id: "3", name: "Zoho CRM", logo: "/placeholder.svg?height=40&width=40" },
      ],
      downloadUrl: "#",
    },
    {
      id: "2",
      name: "Project Management Tools",
      description: "Analysis of Asana, Monday.com, and ClickUp",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      tools: [
        { id: "4", name: "Asana", logo: "/placeholder.svg?height=40&width=40" },
        { id: "5", name: "Monday.com", logo: "/placeholder.svg?height=40&width=40" },
        { id: "6", name: "ClickUp", logo: "/placeholder.svg?height=40&width=40" },
      ],
      downloadUrl: "#",
    },
  ]

  const handleDownload = (reportId: string) => {
    setIsLoading(true)
    // In a real app, this would be an API call to download the report
    setTimeout(() => {
      toast({
        title: "Report downloaded",
        description: "Your report has been downloaded successfully.",
      })
      setIsLoading(false)
    }, 1500)
  }

  const handleShare = (reportId: string) => {
    // In a real app, this would generate a shareable link
    toast({
      title: "Share link generated",
      description: "A shareable link has been copied to your clipboard.",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Generate and download detailed comparison reports</p>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Reports</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>
          <Link href="/dashboard/compare">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Comparison
            </Button>
          </Link>
        </div>
        <TabsContent value="all" className="space-y-4">
          {mockReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockReports.map((report) => (
                <Card key={report.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{report.name}</CardTitle>
                        <CardDescription>{report.description}</CardDescription>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {formatDate(report.createdAt)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex flex-wrap gap-2">
                      {report.tools.map((tool) => (
                        <div key={tool.id} className="flex items-center gap-1 text-sm bg-muted rounded-full px-3 py-1">
                          <img src={tool.logo || "/placeholder.svg"} alt={tool.name} className="h-4 w-4 rounded-full" />
                          <span>{tool.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => handleShare(report.id)}>
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                    <Button size="sm" className="gap-2" onClick={() => handleDownload(report.id)} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          Download PDF
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              <Card className="h-full border-dashed cursor-pointer hover:border-primary/50 transition-colors">
                <CardHeader className="items-center justify-center h-full">
                  <Link href="/dashboard/compare" className="flex flex-col items-center justify-center h-full py-8">
                    <div className="rounded-full bg-primary/10 p-3 mb-3">
                      <Plus className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl text-center">Generate New Report</CardTitle>
                    <CardDescription className="text-center mt-2">
                      Create a comparison first, then generate a report
                    </CardDescription>
                  </Link>
                </CardHeader>
              </Card>
            </div>
          ) : (
            <Card>
              <CardHeader className="items-center justify-center text-center">
                <div className="rounded-full bg-primary/10 p-3 mb-3">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>No reports yet</CardTitle>
                <CardDescription>Create a comparison and generate your first report</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-6">
                <Link href="/dashboard/compare">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Comparison
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="recent">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockReports.slice(0, 1).map((report) => (
              <Card key={report.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{report.name}</CardTitle>
                      <CardDescription>{report.description}</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {formatDate(report.createdAt)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex flex-wrap gap-2">
                    {report.tools.map((tool) => (
                      <div key={tool.id} className="flex items-center gap-1 text-sm bg-muted rounded-full px-3 py-1">
                        <img src={tool.logo || "/placeholder.svg"} alt={tool.name} className="h-4 w-4 rounded-full" />
                        <span>{tool.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => handleShare(report.id)}>
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  <Button size="sm" className="gap-2" onClick={() => handleDownload(report.id)} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Download PDF
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
