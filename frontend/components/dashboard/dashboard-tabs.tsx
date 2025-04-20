"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-provider";

export default function DashboardTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const isPro = user?.plan === "pro";

  const handleTabChange = (value: string) => {
    switch (value) {
      case "overview":
        router.push("/dashboard");
        break;
      case "compare":
        router.push("/dashboard/compare");
        break;
      case "saved":
        router.push("/dashboard/saved");
        break;
      case "reports":
        router.push("/dashboard/reports");
        break;
      case "providers":
        router.push("/dashboard/cloud-providers");
        break;
      case "price-alerts":
        router.push("/dashboard/price-alerts");
        break;
      case "profile":
        router.push("/dashboard/profile");
        break;
      default:
        router.push("/dashboard");
    }
  };

  const getCurrentTab = () => {
    if (pathname === "/dashboard") return "overview";
    if (pathname.includes("/dashboard/compare")) return "compare";
    if (pathname.includes("/dashboard/saved")) return "saved";
    if (pathname.includes("/dashboard/reports")) return "reports";
    if (pathname.includes("/dashboard/cloud-providers")) return "providers";
    if (pathname.includes("/dashboard/price-alerts")) return "price-alerts";
    if (pathname.includes("/dashboard/profile")) return "profile";
    return "overview";
  };

  return (
    <Tabs
      value={getCurrentTab()}
      onValueChange={handleTabChange}
      className="w-full"
    >
      <TabsList className="grid grid-cols-4 lg:grid-cols-7">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="compare">Compare</TabsTrigger>
        <TabsTrigger value="saved">Saved</TabsTrigger>
        <TabsTrigger value="reports" disabled={!isPro}>
          Reports {!isPro && "(Pro)"}
        </TabsTrigger>
        <TabsTrigger value="providers">Providers</TabsTrigger>
        <TabsTrigger value="price-alerts" disabled={!isPro}>
          Price Alerts {!isPro && "(Pro)"}
        </TabsTrigger>
        <TabsTrigger value="profile">Profile</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
