"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  ChevronRight,
  Filter,
  Loader2,
  Plus,
  Search,
  X,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { useAuth } from "@/lib/auth-provider";

// Define types
interface SaasTool {
  id: string;
  name: string;
  logo: string;
  description: string;
  category: string;
  website: string;
  pricing: any;
  integrations: string[];
  lastUpdated: string;
}

export default function ComparePage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams
    ? searchParams.get("category") || ""
    : "";
  const { toast } = useToast();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [selectedTools, setSelectedTools] = useState<SaasTool[]>([]);

  const [searchFilters, setSearchFilters] = useState({
    query: "",
    category: initialCategory,
    minPrice: "",
    maxPrice: "",
    integrations: "",
  });

  const [filteredTools, setFilteredTools] = useState<SaasTool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>(
    []
  );
  const [availableIntegrations, setAvailableIntegrations] = useState<string[]>(
    []
  );
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [categories, setCategories] = useState<string[]>([
    "CRM",
    "Project Management",
    "Marketing",
    "Analytics",
    "Customer Support",
    "Sales",
    "Communication",
    "HR",
    "Finance",
    "IT",
    "Security",
  ]);
  const [isDataFetched, setIsDataFetched] = useState(false);

  // Maximum number of tools for comparison
  const maxTools = isAuthenticated ? 10 : 3;

  useEffect(() => {
    // Update search filters when category changes
    setSearchFilters({
      ...searchFilters,
      category: selectedCategory,
    });
  }, [selectedCategory]);

  // Memoize the fetchTools function to prevent infinite loops
  const fetchTools = useCallback(async () => {
    setIsLoading(true);
    try {
      // In a real app, this would call the API
      // Simulate API response for demo
      setTimeout(() => {
        const mockTools: SaasTool[] = [
          {
            id: "1",
            name: "Salesforce",
            logo: "/placeholder.svg",
            description: "CRM solution for sales, service, and marketing",
            category: "CRM",
            website: "https://salesforce.com",
            pricing: { monthly: 25, annually: 250 },
            integrations: ["Gmail", "Outlook", "Slack", "Zapier"],
            lastUpdated: "2023-05-15",
          },
          {
            id: "2",
            name: "HubSpot",
            logo: "/placeholder.svg",
            description: "Inbound marketing, sales, and service software",
            category: "CRM",
            website: "https://hubspot.com",
            pricing: { monthly: 20, annually: 200 },
            integrations: ["Gmail", "Outlook", "Zapier", "WordPress"],
            lastUpdated: "2023-05-18",
          },
          {
            id: "3",
            name: "Asana",
            logo: "/placeholder.svg",
            description: "Project management and collaboration tool",
            category: "Project Management",
            website: "https://asana.com",
            pricing: { monthly: 10, annually: 100 },
            integrations: [
              "Slack",
              "Google Drive",
              "Microsoft Teams",
              "Zapier",
            ],
            lastUpdated: "2023-05-20",
          },
          {
            id: "4",
            name: "Monday.com",
            logo: "/placeholder.svg",
            description: "Work OS for teams to plan, run, and track processes",
            category: "Project Management",
            website: "https://monday.com",
            pricing: { monthly: 8, annually: 80 },
            integrations: ["Slack", "Google Drive", "Zoom", "Zapier"],
            lastUpdated: "2023-05-10",
          },
          {
            id: "5",
            name: "Mailchimp",
            logo: "/placeholder.svg",
            description: "Email marketing platform",
            category: "Marketing",
            website: "https://mailchimp.com",
            pricing: { monthly: 15, annually: 150 },
            integrations: ["Shopify", "WordPress", "WooCommerce", "Zapier"],
            lastUpdated: "2023-05-05",
          },
          {
            id: "6",
            name: "Google Analytics",
            logo: "/placeholder.svg",
            description: "Web analytics service",
            category: "Analytics",
            website: "https://analytics.google.com",
            pricing: { monthly: 0, annually: 0 },
            integrations: [
              "Google Ads",
              "Google Tag Manager",
              "Shopify",
              "WordPress",
            ],
            lastUpdated: "2023-05-01",
          },
        ];

        // Filter based on search query, category, etc.
        const filtered = mockTools.filter((tool) => {
          const matchesQuery =
            !searchFilters.query ||
            tool.name
              .toLowerCase()
              .includes(searchFilters.query.toLowerCase()) ||
            tool.description
              .toLowerCase()
              .includes(searchFilters.query.toLowerCase());

          const matchesCategory =
            !searchFilters.category || tool.category === searchFilters.category;

          const integrationsFilter = searchFilters.integrations
            .split(",")
            .filter(Boolean);
          const matchesIntegrations =
            !integrationsFilter.length ||
            integrationsFilter.every((integration) =>
              tool.integrations.includes(integration)
            );

          const minPrice = searchFilters.minPrice
            ? parseInt(searchFilters.minPrice)
            : 0;
          const maxPrice = searchFilters.maxPrice
            ? parseInt(searchFilters.maxPrice)
            : Infinity;
          const matchesPrice =
            tool.pricing.monthly >= minPrice &&
            tool.pricing.monthly <= maxPrice;

          return (
            matchesQuery &&
            matchesCategory &&
            matchesIntegrations &&
            matchesPrice
          );
        });

        setFilteredTools(filtered);

        // Collect all available integrations for filters
        const integrations = new Set<string>();
        mockTools.forEach((tool) => {
          if (tool.integrations && Array.isArray(tool.integrations)) {
            tool.integrations.forEach((integration) => {
              integrations.add(integration);
            });
          }
        });
        setAvailableIntegrations(Array.from(integrations).sort());
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching tools:", error);
      toast({
        title: "Error",
        description: "Failed to load tools. Please try again.",
        variant: "destructive",
      });
      setFilteredTools([]);
      setAvailableIntegrations([]);
      setIsLoading(false);
    }
  }, [searchFilters, toast]);

  useEffect(() => {
    // Only fetch data if it hasn't been fetched yet or if filters change
    if (
      !isDataFetched ||
      searchFilters.query ||
      searchFilters.category ||
      searchFilters.minPrice ||
      searchFilters.maxPrice ||
      searchFilters.integrations
    ) {
      fetchTools();
      setIsDataFetched(true);
    }
  }, [fetchTools, isDataFetched, searchFilters]);

  const handleSelectTool = (tool: SaasTool) => {
    if (selectedTools.some((t) => t.id === tool.id)) {
      setSelectedTools(selectedTools.filter((t) => t.id !== tool.id));
    } else {
      if (selectedTools.length >= maxTools) {
        toast({
          title: `Maximum tools reached`,
          description: isAuthenticated
            ? `You can compare up to ${maxTools} tools.`
            : `You can compare up to ${maxTools} tools. Sign up for a free account to compare more.`,
          variant: "destructive",
        });
        return;
      }
      setSelectedTools([...selectedTools, tool]);
    }
  };

  const handleClearFilters = () => {
    setSearchFilters({
      query: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      integrations: "",
    });
    setPriceRange([0, 1000]);
    setSelectedIntegrations([]);
    setShowFilters(false);
  };

  const handleApplyFilters = () => {
    setSearchFilters({
      ...searchFilters,
      minPrice: priceRange[0].toString(),
      maxPrice: priceRange[1].toString(),
      integrations: selectedIntegrations.join(","),
    });
    setShowFilters(false);
  };

  const handleCompare = () => {
    if (selectedTools.length < 2) {
      toast({
        title: "Select more tools",
        description: "Please select at least 2 tools to compare.",
        variant: "destructive",
      });
      return;
    }

    // Redirect to comparison page
    router.push(
      `/compare/result?tools=${selectedTools.map((t) => t.id).join(",")}`
    );
  };

  return (
    <div className="container mx-auto py-8 pb-24">
      <div className="max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Compare SaaS Tools
        </h1>
        <p className="text-muted-foreground">
          Select up to {maxTools} tools to compare features, pricing, and more.
        </p>
      </div>

      <div className="flex flex-col gap-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for tools..."
              className="pl-9"
              value={searchFilters.query}
              onChange={(e) =>
                setSearchFilters({ ...searchFilters, query: e.target.value })
              }
            />
          </div>
          <Button
            variant="outline"
            className="md:w-auto"
            onClick={() => setShowFilters(true)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Category selector */}
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-3">Categories</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={!selectedCategory ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("")}
              className="rounded-full"
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Filters Sheet */}
        <Sheet open={showFilters} onOpenChange={setShowFilters}>
          <SheetContent className="w-[300px] sm:w-[450px] p-6">
            <SheetHeader className="mb-5">
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>Refine your search results</SheetDescription>
            </SheetHeader>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-3">Price Range</h3>
                <div className="px-2">
                  <Slider
                    value={priceRange}
                    min={0}
                    max={1000}
                    step={10}
                    onValueChange={setPriceRange}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>${priceRange[0]}/mo</span>
                    <span>${priceRange[1]}/mo</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-3">Integrations</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {availableIntegrations.map((integration) => (
                    <div
                      key={integration}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`integration-${integration}`}
                        checked={selectedIntegrations.includes(integration)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedIntegrations([
                              ...selectedIntegrations,
                              integration,
                            ]);
                          } else {
                            setSelectedIntegrations(
                              selectedIntegrations.filter(
                                (i) => i !== integration
                              )
                            );
                          }
                        }}
                      />
                      <Label htmlFor={`integration-${integration}`}>
                        {integration}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear All
                </Button>
                <Button onClick={handleApplyFilters}>Apply Filters</Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Tools List */}
        {isLoading ? (
          <div className="grid place-items-center py-12">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Loading tools...
              </p>
            </div>
          </div>
        ) : filteredTools.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No tools found matching your criteria.
            </p>
            <Button variant="link" onClick={handleClearFilters}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.map((tool) => {
              const isSelected = selectedTools.some((t) => t.id === tool.id);

              return (
                <Card
                  key={tool.id}
                  className={`transition-shadow hover:shadow-md cursor-pointer ${
                    isSelected ? "border-primary" : ""
                  }`}
                  onClick={() => handleSelectTool(tool)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-x-3">
                        <div className="h-10 w-10 rounded-md bg-gray-100 grid place-items-center">
                          {tool.logo ? (
                            <img
                              src={tool.logo}
                              alt={tool.name}
                              className="h-8 w-8 object-contain"
                            />
                          ) : (
                            <span className="text-lg font-bold">
                              {tool.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{tool.name}</h3>
                          <Badge variant="outline" className="mt-1">
                            {tool.category}
                          </Badge>
                        </div>
                      </div>
                      <div
                        className={`h-5 w-5 rounded-full grid place-items-center ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "border border-input"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {tool.description}
                    </p>
                    <div className="text-sm font-medium">
                      ${tool.pricing.monthly}/mo
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Selected Tools Banner */}
        {selectedTools.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg p-4 z-40">
            <div className="container mx-auto flex items-center justify-between">
              <div className="flex items-center gap-x-4">
                <div className="text-sm">
                  <span className="font-medium">{selectedTools.length}</span>{" "}
                  tools selected
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedTools.map((tool) => (
                    <Badge
                      key={tool.id}
                      variant="outline"
                      className="flex items-center gap-x-1 px-3 py-1"
                    >
                      {tool.name}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTools(
                            selectedTools.filter((t) => t.id !== tool.id)
                          );
                        }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                onClick={handleCompare}
                disabled={selectedTools.length < 2}
              >
                Compare <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
