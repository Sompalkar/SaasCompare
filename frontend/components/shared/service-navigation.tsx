"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const ServiceNavigation = () => {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  return (
    <div className="bg-muted py-2">
      <div className="container mx-auto px-4">
        <nav className="flex overflow-x-auto pb-2 hide-scrollbar">
          <ul className="flex space-x-6">
            <li>
              <Link
                href="/compare"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive("/compare") ? "text-primary" : "text-muted-foreground",
                )}
              >
                SaaS Tools
              </Link>
            </li>
            <li>
              <Link
                href="/cloud-providers"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive("/cloud-providers") ? "text-primary" : "text-muted-foreground",
                )}
              >
                Cloud Providers
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}

export default ServiceNavigation
