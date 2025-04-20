"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-provider";

export function UserGreeting() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("day");

  // Move date operations to useEffect to run only on client side
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("morning");
    else if (hour < 18) setGreeting("afternoon");
    else setGreeting("evening");
  }, []);

  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight">
        Good {greeting}, {user?.name || "User"}
      </h1>
      <p className="text-muted-foreground mt-1">
        {user?.plan === "pro"
          ? "Welcome to your Pro dashboard. Enjoy all premium features!"
          : "Welcome to your dashboard. Explore tools and services to compare."}
      </p>
    </div>
  );
}
