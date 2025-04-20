"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, ExternalLink, Search, Plus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FeatureMatrixProps {
  tools: any[];
}

export default function FeatureMatrix({ tools }: FeatureMatrixProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showDifferencesOnly, setShowDifferencesOnly] = useState(false);

  // Extract all unique features across tools
  const extractFeatures = () => {
    const allFeatures = new Set<string>();
    const featureCategories = new Set<string>();

    tools.forEach((tool) => {
      if (tool.features && Array.isArray(tool.features)) {
        tool.features.forEach((feature: any) => {
          if (typeof feature === "string") {
            allFeatures.add(feature);
          } else if (feature.name) {
            allFeatures.add(feature.name);
            if (feature.category) {
              featureCategories.add(feature.category);
            }
          }
        });
      }
    });

    return {
      features: Array.from(allFeatures).sort(),
      categories: Array.from(featureCategories).sort(),
    };
  };

  const { features, categories } = extractFeatures();

  // Check if a tool has a specific feature
  const hasFeature = (tool: any, featureName: string) => {
    if (!tool.features || !Array.isArray(tool.features)) {
      return false;
    }

    return tool.features.some((feature: any) => {
      if (typeof feature === "string") {
        return feature.toLowerCase() === featureName.toLowerCase();
      }
      return (
        feature.name && feature.name.toLowerCase() === featureName.toLowerCase()
      );
    });
  };

  // Get feature details (like description, limitations)
  const getFeatureDetails = (tool: any, featureName: string) => {
    if (!tool.features || !Array.isArray(tool.features)) {
      return null;
    }

    const feature = tool.features.find((feature: any) => {
      if (typeof feature === "object" && feature.name) {
        return feature.name.toLowerCase() === featureName.toLowerCase();
      }
      return false;
    });

    return feature ? feature : null;
  };

  // Get feature category
  const getFeatureCategory = (featureName: string) => {
    for (const tool of tools) {
      if (tool.features && Array.isArray(tool.features)) {
        const feature = tool.features.find((f: any) => {
          if (typeof f === "object" && f.name) {
            return f.name.toLowerCase() === featureName.toLowerCase();
          }
          return false;
        });

        if (feature && feature.category) {
          return feature.category;
        }
      }
    }
    return "General";
  };

  // Filter features based on search and category
  const filteredFeatures = features.filter((feature) => {
    // Filter by search query
    const matchesSearch =
      searchQuery === "" ||
      feature.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by category
    const category = getFeatureCategory(feature);
    const matchesCategory =
      categoryFilter === "all" ||
      category.toLowerCase() === categoryFilter.toLowerCase();

    // Filter by differences (if enabled)
    let isDifferent = false;
    if (showDifferencesOnly) {
      const hasFeatureCounts = tools.reduce((count, tool) => {
        return count + (hasFeature(tool, feature) ? 1 : 0);
      }, 0);
      // It's a difference if some tools have it and some don't
      isDifferent = hasFeatureCounts > 0 && hasFeatureCounts < tools.length;
    }

    return (
      matchesSearch && matchesCategory && (!showDifferencesOnly || isDifferent)
    );
  });

  // Render feature value (Yes/No/Limited)
  const renderFeatureValue = (tool: any, feature: string) => {
    if (!hasFeature(tool, feature)) {
      return (
        <div className="flex justify-center">
          <X className="h-5 w-5 text-destructive" />
        </div>
      );
    }

    const details = getFeatureDetails(tool, feature);

    if (details && details.limited) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex justify-center">
                <Badge
                  variant="outline"
                  className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                >
                  Limited
                </Badge>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                {details.limitations || "Some limitations apply"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <div className="flex justify-center">
        <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
      </div>
    );
  };

  return (
    <Card className="border border-border bg-card">
      <CardHeader>
        <CardTitle className="text-xl">Feature Comparison Matrix</CardTitle>
        <CardDescription>
          Compare features across multiple tools to find the best fit for your
          needs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex-1">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 whitespace-nowrap">
              <input
                type="checkbox"
                id="show-differences"
                checked={showDifferencesOnly}
                onChange={() => setShowDifferencesOnly(!showDifferencesOnly)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="show-differences" className="text-sm font-medium">
                Show differences only
              </label>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[250px]">Feature</TableHead>
                  {tools.map((tool) => (
                    <TableHead key={tool.id} className="text-center">
                      <div className="flex flex-col items-center">
                        <span>{tool.name}</span>
                        {tool.website && (
                          <a
                            href={tool.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground flex items-center hover:text-primary"
                          >
                            Website
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeatures.length > 0 ? (
                  filteredFeatures.map((feature) => (
                    <TableRow key={feature}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <span>{feature}</span>
                          {categoryFilter === "all" && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {getFeatureCategory(feature)}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      {tools.map((tool) => (
                        <TableCell key={`${tool.id}-${feature}`}>
                          {renderFeatureValue(tool, feature)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={tools.length + 1}
                      className="h-24 text-center"
                    >
                      No features found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
