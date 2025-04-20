"use client";

import type React from "react";

import { createContext, useContext, useState } from "react";

// Define types
export interface SaasTool {
  id: string;
  name: string;
  logo?: string;
  description: string;
  category: string;
  website: string;
  pricing: {
    free?: {
      price: number | null;
      features: string[];
      limitations: string[];
    } | null;
    starter?: {
      price: number | string | null;
      features: string[];
      limitations: string[];
    } | null;
    pro?: {
      price: number | string | null;
      features: string[];
      limitations: string[];
    } | null;
    enterprise?: {
      price: number | string | null;
      features: string[];
      limitations: string[];
    } | null;
  };
  integrations: string[];
  lastUpdated: string;
}

export interface CloudProvider {
  id: string;
  name: string;
  logo?: string;
  description: string;
  website: string;
  services: CloudService[];
  lastUpdated: string;
}

export interface CloudService {
  id: string;
  name: string;
  type: string;
  description: string;
  pricing: {
    free?: {
      price: number | null;
      features: string[];
      limitations: string[];
    } | null;
    basic?: {
      price: number | string | null;
      features: string[];
      limitations: string[];
    } | null;
    standard?: {
      price: number | string | null;
      features: string[];
      limitations: string[];
    } | null;
    premium?: {
      price: number | string | null;
      features: string[];
      limitations: string[];
    } | null;
    enterprise?: {
      price: number | string | null;
      features: string[];
      limitations: string[];
    } | null;
  };
}

interface AppState {
  categories: string[];
  cloudServiceTypes: string[];
  selectedTools: SaasTool[];
  selectedCloudProviders: CloudProvider[];
  setSelectedTools: (tools: SaasTool[]) => void;
  setSelectedCloudProviders: (providers: CloudProvider[]) => void;
  addTool: (tool: SaasTool) => void;
  removeTool: (toolId: string) => void;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<string[]>([
    "CRM",
    "Project Management",
    "Marketing",
    "Communication",
    "Design",
    "Development",
    "Finance",
    "HR",
    "Customer Support",
  ]);

  const [cloudServiceTypes, setCloudServiceTypes] = useState<string[]>([
    "Compute",
    "Storage",
    "Database",
    "Networking",
    "AI/ML",
    "Serverless",
    "Containers",
    "Security",
  ]);

  const [selectedTools, setSelectedTools] = useState<SaasTool[]>([]);
  const [selectedCloudProviders, setSelectedCloudProviders] = useState<
    CloudProvider[]
  >([]);

  // Add a tool to the selected tools list
  const addTool = (tool: SaasTool) => {
    setSelectedTools((prevTools) => [...prevTools, tool]);
  };

  // Remove a tool from the selected tools list
  const removeTool = (toolId: string) => {
    setSelectedTools((prevTools) =>
      prevTools.filter((tool) => tool.id !== toolId)
    );
  };

  return (
    <AppStateContext.Provider
      value={{
        categories,
        cloudServiceTypes,
        selectedTools,
        selectedCloudProviders,
        setSelectedTools,
        setSelectedCloudProviders,
        addTool,
        removeTool,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
}
