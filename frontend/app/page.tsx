"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Check,
  ChevronRight,
  LineChart,
  Search,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-provider";
import { useRouter } from "next/navigation";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

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
  };

  const features = [
    {
      title: "Side-by-Side Comparison",
      description:
        "Compare features, pricing, and limitations of multiple SaaS tools in a clean, easy-to-read format.",
      icon: (
        <div className="rounded-full bg-indigo-100 p-3 dark:bg-indigo-900">
          <LineChart className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        </div>
      ),
    },
    {
      title: "Real-Time Price Tracking",
      description:
        "Get the most up-to-date pricing information with our automated scraping system that refreshes daily.",
      icon: (
        <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900">
          <Search className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </div>
      ),
    },
    {
      title: "Cost-Saving Reports",
      description:
        "Generate detailed reports showing potential cost savings when switching between different tools.",
      icon: (
        <div className="rounded-full bg-pink-100 p-3 dark:bg-pink-900">
          <Star className="h-6 w-6 text-pink-600 dark:text-pink-400" />
        </div>
      ),
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CTO at TechStart",
      avatar: "/placeholder.svg?height=40&width=40",
      content:
        "SaasCompare saved us thousands of dollars by helping us find the perfect project management tool that integrated with our existing stack.",
    },
    {
      name: "Michael Chen",
      role: "Founder at GrowthLabs",
      avatar: "/placeholder.svg?height=40&width=40",
      content:
        "As a startup founder, I need to be careful with our budget. This tool helped me compare different CRM options and find one that had all the features we needed at half the price.",
    },
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: 0,
      description: "Basic access for individuals",
      features: [
        "Compare up to 3 tools",
        "Basic filtering",
        "3 saved comparisons",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      price: 9,
      description: "Advanced features for teams",
      features: [
        "Unlimited comparisons",
        "Advanced filtering",
        "PDF export",
        "Email support",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <LineChart className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xl font-bold">SaasCompare</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#testimonials"
              className="text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Testimonials
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                >
                  Dashboard
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                  >
                    Sign up
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-950">
          <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
          <div className="container relative z-10">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="max-w-3xl mx-auto text-center mb-12"
            >
              <motion.h1
                variants={itemVariants}
                className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
              >
                Find the{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                  perfect SaaS tools
                </span>{" "}
                for your business
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="text-xl text-muted-foreground mb-8"
              >
                Compare pricing, features, and limitations of 1000+ SaaS tools
                to make informed decisions and save money.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto"
              >
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search for SaaS tools (CRM, Marketing, etc.)"
                    className="w-full pl-10 pr-4 py-6 rounded-lg border bg-background"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                  onClick={() =>
                    router.push(
                      searchQuery
                        ? `/search?q=${encodeURIComponent(searchQuery)}`
                        : "/compare"
                    )
                  }
                >
                  Compare Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="mt-8 flex flex-wrap justify-center gap-2"
              >
                {[
                  "CRM",
                  "Marketing",
                  "Project Management",
                  "Analytics",
                  "Customer Support",
                ].map((category) => (
                  <Badge key={category} variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="relative mx-auto max-w-5xl rounded-lg border bg-background shadow-lg overflow-hidden"
            >
              <div className="p-1 bg-muted">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                  <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                </div>
              </div>
              <div className="p-4">
                <img
                  src="/placeholder.svg?height=500&width=800"
                  alt="SaaS Comparison Dashboard"
                  className="w-full rounded border"
                />
              </div>
            </motion.div>
          </div>

          {/* Background elements */}
          <div className="absolute top-1/2 left-0 w-64 h-64 bg-indigo-300/20 dark:bg-indigo-600/10 rounded-full filter blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300/20 dark:bg-purple-600/10 rounded-full filter blur-3xl translate-x-1/4 translate-y-1/4"></div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white dark:bg-gray-950">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Powerful Features
                </h2>
                <p className="text-xl text-muted-foreground">
                  Our comprehensive comparison engine provides all the tools you
                  need to evaluate and select the best SaaS solutions.
                </p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-6 rounded-xl border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section
          id="testimonials"
          className="py-20 bg-gradient-to-b from-white to-indigo-50 dark:from-gray-950 dark:to-gray-900"
        >
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Trusted by Thousands
                </h2>
                <p className="text-xl text-muted-foreground">
                  See what our users have to say about how SaasCompare has
                  helped them make better decisions.
                </p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className="flex mb-4">
                        {Array(5)
                          .fill(0)
                          .map((_, i) => (
                            <Star
                              key={i}
                              className="h-5 w-5 text-yellow-400 fill-yellow-400"
                            />
                          ))}
                      </div>
                      <p className="mb-6 text-muted-foreground">
                        "{testimonial.content}"
                      </p>
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage
                            src={testimonial.avatar || "/placeholder.svg"}
                            alt={testimonial.name}
                          />
                          <AvatarFallback>
                            {testimonial.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {testimonial.role}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-white dark:bg-gray-950">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Simple, Transparent Pricing
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Choose the plan that fits your needs. No hidden fees or
                  surprises.
                </p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {pricingPlans.map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    className={`relative h-full flex flex-col ${
                      plan.popular ? "border-indigo-500 shadow-lg" : ""
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/3">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                          Most Popular
                        </div>
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-2xl font-bold">{plan.name}</h3>
                      <p className="text-muted-foreground mb-4">
                        {plan.description}
                      </p>
                      <div className="mb-6">
                        <span className="text-4xl font-bold">
                          ${plan.price}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-muted-foreground ml-1">
                            / month
                          </span>
                        )}
                      </div>
                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        className={`w-full ${
                          plan.popular
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                            : ""
                        }`}
                        variant={plan.popular ? "default" : "outline"}
                        asChild
                      >
                        <Link
                          href={
                            plan.name === "Free"
                              ? "/auth/register"
                              : "/auth/register?plan=pro"
                          }
                        >
                          {plan.cta} <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to find the perfect SaaS tools for your business?
              </h2>
              <p className="text-xl opacity-90 mb-8">
                Join thousands of companies making smarter software decisions
                with SaasCompare.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/compare">
                    Start Comparing <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-white text-white hover:bg-white hover:text-indigo-600"
                  asChild
                >
                  <Link href="/auth/register">Create Free Account</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-gray-950">
        <div className="container py-8 md:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <LineChart className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-lg font-bold">SaasCompare</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Find the best SaaS tools for your business by comparing pricing,
                features, and limitations.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#features"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/compare"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Compare Tools
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/privacy"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2024 SaasCompare. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
