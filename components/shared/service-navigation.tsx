"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Cloud, Grid } from "lucide-react"

export default function ServiceNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [activeService, setActiveService] = useState<"saas" | "cloud">("saas")

  useEffect(() => {
    if (pathname?.includes("/cloud-providers")) {
      setActiveService("cloud")
    } else if (pathname?.includes("/compare") || pathname === "/dashboard/compare") {
      setActiveService("saas")
    }
  }, [pathname])

  const handleServiceChange = (service: "saas" | "cloud") => {
    setActiveService(service)

    // Determine if we're in the dashboard or public pages
    const isDashboard = pathname?.startsWith("/dashboard")

    if (service === "saas") {
      router.push(isDashboard ? "/dashboard/compare" : "/compare")
    } else {
      router.push(isDashboard ? "/dashboard/cloud-providers" : "/cloud-providers")
    }
  }

  return (
    <div className="flex justify-center mb-6">
      <div className="bg-muted p-1 rounded-lg flex">
        <Button
          variant="ghost"
          className={cn("relative px-4 py-2 rounded-md transition-all", activeService === "saas" && "text-primary")}
          onClick={() => handleServiceChange("saas")}
        >
          {activeService === "saas" && (
            <motion.div
              layoutId="service-pill"
              className="absolute inset-0 bg-white dark:bg-gray-800 rounded-md z-0"
              transition={{ type: "spring", duration: 0.5 }}
            />
          )}
          <span className="flex items-center gap-2 z-10 relative">
            <Grid className="h-4 w-4" />
            SaaS Tools
          </span>
        </Button>
        <Button
          variant="ghost"
          className={cn("relative px-4 py-2 rounded-md transition-all", activeService === "cloud" && "text-primary")}
          onClick={() => handleServiceChange("cloud")}
        >
          {activeService === "cloud" && (
            <motion.div
              layoutId="service-pill"
              className="absolute inset-0 bg-white dark:bg-gray-800 rounded-md z-0"
              transition={{ type: "spring", duration: 0.5 }}
            />
          )}
          <span className="flex items-center gap-2 z-10 relative">
            <Cloud className="h-4 w-4" />
            Cloud Providers
          </span>
        </Button>
      </div>
    </div>
  )
}
