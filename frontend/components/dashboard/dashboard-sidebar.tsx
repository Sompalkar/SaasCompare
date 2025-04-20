"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth-provider";
import { useMobile } from "@/hooks/use-mobile";
import {
  BarChart3,
  Bell,
  ChevronRight,
  CreditCard,
  FileText,
  Home,
  Menu,
  PieChart,
  Search,
  Settings,
  Users,
} from "lucide-react";

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  isActive: boolean;
  isPro?: boolean;
  onClick?: () => void;
}

const SidebarItem = ({
  href,
  icon,
  title,
  isActive,
  isPro = false,
  onClick,
}: SidebarItemProps) => {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
        isActive
          ? "bg-purple-100 text-purple-900 dark:bg-purple-800 dark:text-purple-50"
          : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
      )}
      onClick={onClick}
    >
      {icon}
      <span>{title}</span>
      {isPro && (
        <span className="ml-auto rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-2 py-0.5 text-xs text-white">
          PRO
        </span>
      )}
    </Link>
  );
};

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isMobile = useMobile();
  const [open, setOpen] = useState(false);

  const isAdmin = user?.role === "ADMIN";
  const isPro = user?.plan === "PRO" || user?.plan === "ENTERPRISE";

  const sidebarContent = (
    <>
      <div className="px-3 py-4">
        <Link href="/" className="flex items-center gap-2 px-2">
          <span className="text-xl font-bold text-purple-600">
            SaaS Compare
          </span>
        </Link>
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1">
          <SidebarItem
            href="/dashboard"
            icon={<Home className="h-4 w-4" />}
            title="Dashboard"
            isActive={pathname === "/dashboard"}
            onClick={() => setOpen(false)}
          />
          <SidebarItem
            href="/dashboard/compare"
            icon={<Search className="h-4 w-4" />}
            title="Compare Tools"
            isActive={
              pathname === "/dashboard/compare" ||
              pathname.startsWith("/dashboard/compare/")
            }
            onClick={() => setOpen(false)}
          />
          <SidebarItem
            href="/dashboard/reports"
            icon={<FileText className="h-4 w-4" />}
            title="Reports"
            isActive={pathname === "/dashboard/reports"}
            isPro={true}
            onClick={() => setOpen(false)}
          />
          <SidebarItem
            href="/dashboard/price-alerts"
            icon={<Bell className="h-4 w-4" />}
            title="Price Alerts"
            isActive={pathname === "/dashboard/price-alerts"}
            isPro={false}
            onClick={() => setOpen(false)}
          />
          <SidebarItem
            href="/dashboard/savings"
            icon={<PieChart className="h-4 w-4" />}
            title="Cost Savings"
            isActive={pathname === "/dashboard/savings"}
            isPro={true}
            onClick={() => setOpen(false)}
          />
          <SidebarItem
            href="/dashboard/subscription"
            icon={<CreditCard className="h-4 w-4" />}
            title="Subscription"
            isActive={pathname === "/dashboard/subscription"}
            onClick={() => setOpen(false)}
          />
        </div>

        {isAdmin && (
          <div className="mt-6">
            <h3 className="mb-2 px-4 text-xs font-semibold uppercase text-gray-500">
              Admin
            </h3>
            <div className="space-y-1">
              <SidebarItem
                href="/dashboard/admin/tools"
                icon={<BarChart3 className="h-4 w-4" />}
                title="Manage Tools"
                isActive={pathname === "/dashboard/admin/tools"}
                onClick={() => setOpen(false)}
              />
              <SidebarItem
                href="/dashboard/admin/users"
                icon={<Users className="h-4 w-4" />}
                title="Manage Users"
                isActive={pathname === "/dashboard/admin/users"}
                onClick={() => setOpen(false)}
              />
              <SidebarItem
                href="/dashboard/admin/scraping"
                icon={<ChevronRight className="h-4 w-4" />}
                title="Scraping Jobs"
                isActive={pathname === "/dashboard/admin/scraping"}
                onClick={() => setOpen(false)}
              />
            </div>
          </div>
        )}
      </ScrollArea>
      <div className="mt-auto border-t px-3 py-4">
        <SidebarItem
          href="/dashboard/settings"
          icon={<Settings className="h-4 w-4" />}
          title="Settings"
          isActive={pathname === "/dashboard/settings"}
          onClick={() => setOpen(false)}
        />
        <Button
          variant="ghost"
          className="mt-2 w-full justify-start text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          onClick={() => {
            logout();
            setOpen(false);
          }}
        >
          <span>Log out</span>
        </Button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex w-72 flex-col p-0">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="hidden w-64 flex-col border-r bg-white md:flex">
      {sidebarContent}
    </div>
  );
}
