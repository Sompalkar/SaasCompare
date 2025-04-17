"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { RecoilRoot } from "recoil"
import { AuthProvider } from "@/lib/auth-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <RecoilRoot>
      <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </RecoilRoot>
  )
}
