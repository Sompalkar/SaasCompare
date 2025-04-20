"use client"

import type React from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { AppStateProvider } from "@/lib/state-provider"
import { AuthProvider } from "@/lib/auth-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <AppStateProvider>{children}</AppStateProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
