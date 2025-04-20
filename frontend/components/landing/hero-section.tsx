"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Search } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-primary/5 to-background">
      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Find the <span className="text-primary">perfect SaaS tools</span> for your business
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Compare pricing, features, and limitations of 1000+ SaaS tools to make informed decisions and save money.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for SaaS tools (CRM, Marketing, etc.)"
                className="w-full pl-10 pr-4 py-3 rounded-lg border bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Link href={searchQuery ? `/search?q=${encodeURIComponent(searchQuery)}` : "/compare"}>
              <Button size="lg" className="w-full sm:w-auto">
                Compare Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 text-sm text-muted-foreground"
          >
            <p>Popular categories: CRM, Marketing, Project Management, Analytics, Customer Support</p>
          </motion.div>
        </div>

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
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/10 rounded-full filter blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full filter blur-3xl translate-x-1/4 translate-y-1/4"></div>
    </section>
  )
}
