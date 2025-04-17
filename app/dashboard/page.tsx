"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, FileText, LineChart, Plus, Search, Star } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-provider"
import type { Comparison } from "@/lib/atoms"
import { formatDate } from "@/lib/utils"

export default function DashboardPage() {
  const { user } = useAuth()
  const [savedComparisons, setSavedComparisons] = useState<Comparison[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchComparisons = async () => {
      try {
        setIsLoading(true)
        // In a real app, this would be an API call
        // const { data } = await getUserComparisons();
        // setSavedComparisons(data.comparisons);

        // Mock data for demo
        setTimeout(() => {
          setSavedComparisons([
            {
              id: "1",
              name: "CRM Comparison",
              tools: [
                { id: "1", name: "Salesforce", logo: "/placeholder.svg?height=40&width=40", category: "CRM" },
                { id: "2", name: "HubSpot", logo: "/placeholder.svg?height=40&width=40", category: "CRM" },
                { id: "3", name: "Zoho CRM", logo: "/placeholder.svg?height=40&width=40", category: "CRM" },
              ],
              createdAt: new Date().toISOString(),
            },
            {
              id: "2",
              name: "Project Management Tools",
              tools: [
                { id: "4", name: "Asana", logo: "/placeholder.svg?height=40&width=40", category: "Project Management" },
                {
                  id: "5",
                  name: "Monday.com",
                  logo: "/placeholder.svg?height=40&width=40",
                  category: "Project Management",
                },
                {
                  id: "6",
                  name: "ClickUp",
                  logo: "/placeholder.svg?height=40&width=40",
                  category: "Project Management",
                },
              ],
              createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            },
          ] as Comparison[])
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching comparisons:", error)
        setIsLoading(false)
      }
    }

    fetchComparisons()
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name || "User"}! Here's an overview of your SaaS comparisons.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved Comparisons</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{savedComparisons.length}</div>
            <p className="text-xs text-muted-foreground">
              {user?.plan === "free" ? "3 max on Free plan" : "Unlimited on your plan"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generated Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              {user?.plan === "free" ? "Upgrade to generate reports" : "10 reports per month"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Savings</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0</div>
            <p className="text-xs text-muted-foreground">Compare tools to see potential savings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{user?.plan || "Free"}</div>
            {user?.plan === "free" && (
              <p className="text-xs text-muted-foreground">
                <Link href="/dashboard/subscription" className="text-primary hover:underline">
                  Upgrade for more features
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="recent">Recent Comparisons</TabsTrigger>
            <TabsTrigger value="popular">Popular Categories</TabsTrigger>
          </TabsList>
          <Link href="/dashboard/compare">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Comparison
            </Button>
          </Link>
        </div>
        <TabsContent value="recent" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : savedComparisons.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {savedComparisons.map((comparison) => (
                <Link key={comparison.id} href={`/dashboard/saved/${comparison.id}`}>
                  <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle>{comparison.name}</CardTitle>
                      <CardDescription>
                        {comparison.tools.length} tools • {formatDate(comparison.createdAt)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {comparison.tools.map((tool) => (
                          <div
                            key={tool.id}
                            className="flex items-center gap-1 text-sm bg-muted rounded-full px-3 py-1"
                          >
                            <img
                              src={tool.logo || "/placeholder.svg"}
                              alt={tool.name}
                              className="h-4 w-4 rounded-full"
                            />
                            <span>{tool.name}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
              <Card className="h-full border-dashed cursor-pointer hover:border-primary/50 transition-colors">
                <CardHeader className="items-center justify-center h-full">
                  <Link href="/dashboard/compare" className="flex flex-col items-center justify-center h-full py-8">
                    <div className="rounded-full bg-primary/10 p-3 mb-3">
                      <Plus className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl text-center">Create New Comparison</CardTitle>
                    <CardDescription className="text-center mt-2">
                      Compare features and pricing of SaaS tools
                    </CardDescription>
                  </Link>
                </CardHeader>
              </Card>
            </div>
          ) : (
            <Card>
              <CardHeader className="items-center justify-center text-center">
                <div className="rounded-full bg-primary/10 p-3 mb-3">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>No comparisons yet</CardTitle>
                <CardDescription>Start comparing SaaS tools to make informed decisions</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-6">
                <Link href="/dashboard/compare">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Comparison
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="popular">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {["CRM", "Project Management", "Marketing", "Analytics", "Customer Support", "Email Marketing"].map(
              (category, index) => (
                <Link key={index} href={`/dashboard/compare?category=${category}`}>
                  <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle>{category}</CardTitle>
                      <CardDescription>Compare popular {category.toLowerCase()} tools</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        Find the best {category.toLowerCase()} solution for your business needs
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ),
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
