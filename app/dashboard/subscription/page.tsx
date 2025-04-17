"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, CreditCard, HelpCircle, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-provider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const pricingPlans = [
  {
    id: "free",
    name: "Free",
    price: { monthly: 0, annual: 0 },
    description: "Basic access for individuals and small teams",
    features: [
      "Compare up to 3 tools at once",
      "Access to 50+ SaaS tools",
      "Basic filtering options",
      "3 saved comparisons",
      "Ad-supported experience",
    ],
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: { monthly: 9, annual: 90 },
    description: "Advanced features for startups and growing teams",
    features: [
      "Compare unlimited tools",
      "Access to 500+ SaaS tools",
      "Advanced filtering options",
      "Unlimited saved comparisons",
      "Integration checks",
      "PDF export",
      "No ads",
      "Email support",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: { monthly: "Custom", annual: "Custom" },
    description: "Custom solutions for large organizations",
    features: [
      "Everything in Pro",
      "Custom pricing tiers",
      "API access",
      "Team collaboration",
      "Dedicated support",
      "Service Level Agreement",
      "Custom onboarding",
      "Priority feature requests",
    ],
    popular: false,
  },
]

export default function SubscriptionPage() {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "annual">("annual")
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  const handleUpgrade = async (planId: string) => {
    if (planId === user?.plan) {
      toast({
        title: "Already subscribed",
        description: `You are already on the ${planId} plan.`,
      })
      return
    }

    setIsLoading(planId)

    // In a real app, this would be an API call to create a checkout session
    setTimeout(() => {
      toast({
        title: "Redirecting to checkout",
        description: "You'll be redirected to complete your purchase.",
      })
      setIsLoading(null)

      // Simulate redirect to checkout
      // window.location.href = "/checkout";
    }, 1500)
  }

  const handleContactSales = () => {
    toast({
      title: "Contact request sent",
      description: "Our sales team will contact you shortly.",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and billing</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>You are currently on the {user?.plan || "Free"} plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold capitalize">{user?.plan || "Free"}</h3>
              <p className="text-muted-foreground">
                {user?.plan === "free"
                  ? "Basic access with limited features"
                  : user?.plan === "pro"
                    ? "Advanced features for teams"
                    : "Custom enterprise solution"}
              </p>
            </div>
            {user?.plan !== "free" && (
              <Button variant="outline" className="gap-2">
                <CreditCard className="h-4 w-4" />
                Manage Billing
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <h2 className="text-2xl font-bold text-center">Upgrade Your Plan</h2>
          <p className="text-muted-foreground text-center max-w-2xl">
            Choose the plan that best fits your needs. All plans include access to our comparison engine.
          </p>

          <div className="flex items-center space-x-2 bg-muted p-1 rounded-full">
            <button
              onClick={() => setBillingInterval("monthly")}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                billingInterval === "monthly" ? "bg-background shadow-sm" : "text-muted-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval("annual")}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                billingInterval === "annual" ? "bg-background shadow-sm" : "text-muted-foreground"
              }`}
            >
              Annual <span className="text-xs text-primary">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative h-full flex flex-col ${plan.popular ? "border-primary shadow-lg" : ""}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/3">
                  <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  {typeof plan.price[billingInterval] === "number" ? (
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold">${plan.price[billingInterval]}</span>
                      {plan.price[billingInterval] > 0 && (
                        <span className="text-sm text-muted-foreground ml-1">
                          / {billingInterval === "annual" ? "year" : "month"}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-4xl font-bold">{plan.price[billingInterval]}</div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-primary shrink-0 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {plan.id === "enterprise" ? (
                  <Button className="w-full" variant="outline" onClick={handleContactSales}>
                    Contact Sales
                  </Button>
                ) : (
                  <Button
                    className={`w-full ${plan.popular ? "bg-primary hover:bg-primary/90" : ""}`}
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isLoading === plan.id || plan.id === user?.plan}
                  >
                    {isLoading === plan.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : plan.id === user?.plan ? (
                      "Current Plan"
                    ) : plan.id === "free" ? (
                      "Downgrade to Free"
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex items-center text-sm text-muted-foreground">
                  <span>Need a custom plan?</span>
                  <HelpCircle className="h-4 w-4 ml-1" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  We offer custom plans for agencies, consultants, and enterprises with specific needs. Contact our
                  sales team for a tailored solution.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <p className="mt-2">
            <Button variant="link" onClick={handleContactSales}>
              Contact our sales team
            </Button>
          </p>
        </div>
      </div>
    </div>
  )
}
