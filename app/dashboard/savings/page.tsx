"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, BarChart3, Download, LineChart, Plus, TrendingDown } from "lucide-react"
import { useAuth } from "@/lib/auth-provider"
import { formatPrice } from "@/lib/utils"
import Link from "next/link"

// Import recharts components
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

// Mock data for savings
const savingsData = [
  { month: "Jan", savings: 0 },
  { month: "Feb", savings: 0 },
  { month: "Mar", savings: 0 },
  { month: "Apr", savings: 0 },
  { month: "May", savings: 0 },
  { month: "Jun", savings: 0 },
  { month: "Jul", savings: 0 },
  { month: "Aug", savings: 0 },
  { month: "Sep", savings: 0 },
  { month: "Oct", savings: 0 },
  { month: "Nov", savings: 0 },
  { month: "Dec", savings: 1200 },
]

const categoryData = [
  { name: "CRM", current: 1200, recommended: 600 },
  { name: "Marketing", current: 800, recommended: 500 },
  { name: "Project Management", current: 600, recommended: 300 },
  { name: "Analytics", current: 400, recommended: 400 },
  { name: "Customer Support", current: 300, recommended: 200 },
]

export default function SavingsPage() {
  const { user } = useAuth()
  const [timeframe, setTimeframe] = useState("yearly")

  // Check if user can access advanced savings features
  const canAccessAdvancedFeatures = user?.plan !== "free"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cost Savings</h1>
        <p className="text-muted-foreground">Track potential savings across your SaaS stack</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Potential Savings</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(1200)}/year</div>
            <p className="text-xs text-muted-foreground">Based on your current comparisons</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current SaaS Spend</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(3300)}/year</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recommended Spend</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(2100)}/year</div>
            <p className="text-xs text-muted-foreground">Based on optimal tools</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Percentage</CardTitle>
            <Badge className="bg-green-500">36%</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">36%</div>
            <p className="text-xs text-muted-foreground">Potential cost reduction</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="by-category">By Category</TabsTrigger>
            <TabsTrigger value="recommendations" disabled={!canAccessAdvancedFeatures}>
              Recommendations
              {!canAccessAdvancedFeatures && (
                <Badge variant="outline" className="ml-2 text-xs">
                  Pro
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Link href="/dashboard/compare">
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Comparison
              </Button>
            </Link>
          </div>
        </div>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Savings Over Time</CardTitle>
              <CardDescription>Potential savings based on your comparisons</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={savingsData}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `${value}`} />
                    <Tooltip formatter={(value) => [`${value}`, "Savings"]} />
                    <Area type="monotone" dataKey="savings" stroke="#10b981" fill="#10b98133" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Saving Opportunities</CardTitle>
                <CardDescription>Categories with highest potential savings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.slice(0, 3).map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-muted-foreground">Current: {formatPrice(category.current)}/year</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-500">
                          Save {formatPrice(category.current - category.recommended)}/year
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {Math.round(((category.current - category.recommended) / category.current) * 100)}% reduction
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Link href="/dashboard/compare">
                    <Button variant="outline" className="w-full">
                      View All Categories
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Savings Summary</CardTitle>
                <CardDescription>Breakdown of potential savings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Current Annual Spend</p>
                    <p className="font-medium">{formatPrice(3300)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Recommended Annual Spend</p>
                    <p className="font-medium">{formatPrice(2100)}</p>
                  </div>
                  <div className="flex items-center justify-between border-t pt-4">
                    <p className="font-bold">Total Annual Savings</p>
                    <p className="font-bold text-green-500">{formatPrice(1200)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Monthly Savings</p>
                    <p className="text-sm font-medium text-green-500">{formatPrice(100)}/mo</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">5-Year Savings</p>
                    <p className="text-sm font-medium text-green-500">{formatPrice(6000)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="by-category" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Savings by Category</CardTitle>
              <CardDescription>Compare current vs. recommended spend across categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${value}`} />
                    <Tooltip formatter={(value) => [`${value}`, ""]} />
                    <Legend />
                    <Bar dataKey="current" name="Current Spend" fill="#6366f1" />
                    <Bar dataKey="recommended" name="Recommended Spend" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categoryData.map((category, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle>{category.name}</CardTitle>
                  <CardDescription>
                    {Math.round(((category.current - category.recommended) / category.current) * 100)}% potential
                    savings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Current:</span>
                      <span className="font-medium">{formatPrice(category.current)}/year</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Recommended:</span>
                      <span className="font-medium">{formatPrice(category.recommended)}/year</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-medium">Savings:</span>
                      <span className="font-medium text-green-500">
                        {formatPrice(category.current - category.recommended)}/year
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="recommendations" className="space-y-4">
          {canAccessAdvancedFeatures ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Personalized Recommendations</CardTitle>
                  <CardDescription>Based on your usage patterns and requirements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <h3 className="text-lg font-medium mb-2">CRM Recommendation</h3>
                      <p className="mb-2">
                        Switch from Salesforce Enterprise ($150/user/month) to HubSpot Professional ($80/user/month) for
                        your team of 10.
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-green-500 font-medium">Save $8,400/year</span>
                        <Button size="sm">View Comparison</Button>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <h3 className="text-lg font-medium mb-2">Project Management Recommendation</h3>
                      <p className="mb-2">
                        Consolidate your Asana and Monday.com subscriptions to ClickUp Business ($12/user/month) for
                        your team of 25.
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-green-500 font-medium">Save $6,000/year</span>
                        <Button size="sm">View Comparison</Button>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <h3 className="text-lg font-medium mb-2">Marketing Tools Recommendation</h3>
                      <p className="mb-2">
                        Replace your separate email marketing and social media tools with an all-in-one solution like
                        HubSpot Marketing Hub.
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-green-500 font-medium">Save $4,800/year</span>
                        <Button size="sm">View Comparison</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Implementation Plan</CardTitle>
                  <CardDescription>Suggested timeline for implementing recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex">
                      <div className="flex flex-col items-center mr-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                          <span className="text-indigo-600 dark:text-indigo-400 font-medium">1</span>
                        </div>
                        <div className="h-full w-0.5 bg-indigo-100 dark:bg-indigo-900 mt-2"></div>
                      </div>
                      <div className="pb-6">
                        <h3 className="text-lg font-medium">Month 1: CRM Migration</h3>
                        <p className="text-muted-foreground mt-1">
                          Begin data migration from Salesforce to HubSpot. Run both systems in parallel for 30 days.
                        </p>
                        <Button variant="outline" size="sm" className="mt-2">
                          View Migration Guide
                        </Button>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="flex flex-col items-center mr-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                          <span className="text-indigo-600 dark:text-indigo-400 font-medium">2</span>
                        </div>
                        <div className="h-full w-0.5 bg-indigo-100 dark:bg-indigo-900 mt-2"></div>
                      </div>
                      <div className="pb-6">
                        <h3 className="text-lg font-medium">Month 2-3: Project Management Consolidation</h3>
                        <p className="text-muted-foreground mt-1">
                          Set up ClickUp workspaces and migrate projects from Asana and Monday.com.
                        </p>
                        <Button variant="outline" size="sm" className="mt-2">
                          View Migration Guide
                        </Button>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="flex flex-col items-center mr-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                          <span className="text-indigo-600 dark:text-indigo-400 font-medium">3</span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">Month 4: Marketing Tools Integration</h3>
                        <p className="text-muted-foreground mt-1">
                          Implement HubSpot Marketing Hub and migrate email lists and campaigns.
                        </p>
                        <Button variant="outline" size="sm" className="mt-2">
                          View Migration Guide
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <LineChart className="h-6 w-6 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Upgrade to Access Recommendations</h2>
              <p className="text-muted-foreground max-w-md mb-6">
                Get personalized recommendations and implementation plans to maximize your cost savings.
              </p>
              <Link href="/dashboard/subscription">
                <Button>Upgrade to Pro</Button>
              </Link>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
