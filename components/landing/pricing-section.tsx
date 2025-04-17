"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, HelpCircle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const pricingPlans = [
  {
    name: "Free",
    price: 0,
    description: "Basic access for individuals and small teams",
    features: [
      "Compare up to 3 tools at once",
      "Access to 50+ SaaS tools",
      "Basic filtering options",
      "3 saved comparisons",
      "Ad-supported experience",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: 9,
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
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
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
    cta: "Contact Sales",
    popular: false,
  },
]

export default function PricingSection() {
  const [annual, setAnnual] = useState(true)

  return (
    <section id="pricing" className="py-20 bg-primary/5">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Choose the plan that fits your needs. No hidden fees or surprises.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center mb-8"
          >
            <div className="flex items-center space-x-2 bg-muted p-1 rounded-full">
              <button
                onClick={() => setAnnual(false)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  !annual ? "bg-background shadow-sm" : "text-muted-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  annual ? "bg-background shadow-sm" : "text-muted-foreground"
                }`}
              >
                Annual <span className="text-xs text-primary">Save 20%</span>
              </button>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className={`relative h-full flex flex-col ${plan.popular ? "border-primary shadow-lg" : ""}`}>
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
                    {typeof plan.price === "number" ? (
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold">${plan.price}</span>
                        {plan.price > 0 && (
                          <>
                            <span className="text-sm text-muted-foreground ml-1">/ {annual ? "year" : "month"}</span>
                            {annual && <span className="ml-2 text-xs text-primary font-medium">20% off</span>}
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="text-4xl font-bold">{plan.price}</div>
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
                  <Button
                    className={`w-full ${plan.popular ? "bg-primary hover:bg-primary/90" : ""}`}
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link href={plan.name === "Enterprise" ? "/contact" : "/register"}>{plan.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
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
            <Link href="/contact" className="text-primary hover:underline">
              Contact our sales team
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
