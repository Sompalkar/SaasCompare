"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { useAuth } from "@/lib/auth-provider"

export default function PricingSection() {
  const [annual, setAnnual] = useState(true)
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  const plans = [
    {
      name: "Free",
      description: "Basic comparison for individuals",
      price: { monthly: 0, annual: 0 },
      features: [
        "Compare up to 3 tools at once",
        "Basic feature comparison",
        "Limited report generation",
        "Public tools only",
        "Community support",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      description: "Advanced comparison for professionals",
      price: { monthly: 19, annual: 190 },
      features: [
        "Compare up to 10 tools at once",
        "Advanced feature comparison",
        "Unlimited report generation",
        "Access to premium tools",
        "Export to PDF/Excel",
        "Email support",
        "Save comparisons",
      ],
      cta: "Upgrade to Pro",
      popular: true,
    },
    {
      name: "Enterprise",
      description: "Custom solutions for teams",
      price: { monthly: 49, annual: 490 },
      features: [
        "Compare unlimited tools",
        "Custom comparison metrics",
        "White-labeled reports",
        "API access",
        "Team collaboration",
        "Priority support",
        "Custom integrations",
        "Dedicated account manager",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ]

  const handleGetStarted = (plan: string) => {
    if (isAuthenticated) {
      router.push("/dashboard/subscription")
    } else {
      router.push("/auth/login")
    }
  }

  return (
    <section id="pricing" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-xl text-muted-foreground">
            Choose the plan that's right for you and start comparing SaaS tools today.
          </p>

          <div className="flex items-center justify-center mt-8">
            <div className="relative flex items-center p-1 bg-muted rounded-full">
              <button
                onClick={() => setAnnual(false)}
                className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  !annual ? "text-white" : "text-muted-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  annual ? "text-white" : "text-muted-foreground"
                }`}
              >
                Annual
                <Badge variant="secondary" className="ml-2 absolute -top-2 -right-2 px-1 py-0 text-[10px]">
                  Save 20%
                </Badge>
              </button>
              <div
                className={`absolute inset-0 m-1 rounded-full bg-gradient-to-r from-primary to-purple-600 transition-all duration-200 ${
                  annual ? "translate-x-full" : ""
                }`}
                style={{ width: "50%", height: "85%" }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`flex flex-col ${
                plan.popular
                  ? "border-primary shadow-lg dark:shadow-primary/20 relative overflow-hidden"
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-gradient-to-r from-primary to-purple-600 text-white text-xs font-bold px-3 py-1 transform rotate-45 translate-x-2 -translate-y-1 shadow-md">
                    Popular
                  </div>
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="mb-6">
                  <span className="text-4xl font-bold">${annual ? plan.price.annual : plan.price.monthly}</span>
                  {plan.price.monthly > 0 && (
                    <span className="text-muted-foreground ml-2">/{annual ? "year" : "month"}</span>
                  )}
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleGetStarted(plan.name)}
                  className={`w-full ${
                    plan.popular
                      ? "bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700"
                      : ""
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
