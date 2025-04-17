"use client"

import type { ReactNode } from "react";
// import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
// import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { RecoilRoot } from "recoil";
import { AuthProvider } from "@/lib/auth-provider";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthProvider>
      <RecoilRoot>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex min-h-screen flex-col">
            <DashboardHeader />
            <div className="flex flex-1">
              <DashboardSidebar />
              <main className="flex-1 p-6 md:p-8">{children}</main>
            </div>
            <Toaster />
          </div>
        </ThemeProvider>
      </RecoilRoot>
    </AuthProvider>
  );
}
