"use client";

import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import UniversalNavbar from "@/components/shared/universal-navbar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <>
      <UniversalNavbar />
      <div className="container mx-auto py-6 md:py-8 max-w-7xl">
        {children}
        <Toaster />
      </div>
    </>
  );
}
