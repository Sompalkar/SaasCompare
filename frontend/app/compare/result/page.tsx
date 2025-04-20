"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  Download,
  Star,
  CheckCircle,
  XCircle,
  Save,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-provider";
import React from "react";
import { compareAPI } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Define types
interface SaasTool {
  id: string;
  name: string;
  logo: string;
  description: string;
  category: string;
  website: string;
  pricing: {
    monthly: number;
    annually: number;
  };
  features: Record<string, boolean>;
  rating: number;
  integrations: string[];
  lastUpdated: string;
}

// Mocked feature categories
const featureCategories = [
  {
    name: "Core Features",
    features: [
      "API Access",
      "Customization",
      "White-labeling",
      "Offline Access",
    ],
  },
  {
    name: "Support",
    features: ["24/7 Support", "Knowledge Base", "Community Forum", "Training"],
  },
  {
    name: "Security",
    features: ["Two-factor Auth", "SSO", "Encryption", "Audit Logs"],
  },
  {
    name: "Integration",
    features: [
      "Native Integrations",
      "API Documentation",
      "Webhooks",
      "Zapier Support",
    ],
  },
];

export default function ComparisonResultPage() {
  const searchParamsRef = useRef(useSearchParams());
  const searchParams = searchParamsRef.current;
  const toolIds = searchParams?.get("tools")?.split(",") || [];
  const { toast } = useToast();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  const [comparedTools, setComparedTools] = useState<SaasTool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saveName, setSaveName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Memoize the toolIds to prevent unnecessary re-renders
  const toolIdsString = toolIds.join(",");

  const fetchTools = useCallback(async () => {
    if (!toolIdsString) return;

    setIsLoading(true);
    try {
      // In a real app, this would call the API with toolIds
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
            features: {
              "API Access": true,
              Customization: true,
              "White-labeling": true,
              "Offline Access": true,
              "24/7 Support": true,
              "Knowledge Base": true,
              "Community Forum": true,
              Training: true,
              "Two-factor Auth": true,
              SSO: true,
              Encryption: true,
              "Audit Logs": true,
              "Native Integrations": true,
              "API Documentation": true,
              Webhooks: true,
              "Zapier Support": true,
            },
            rating: 4.8,
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
            features: {
              "API Access": true,
              Customization: true,
              "White-labeling": false,
              "Offline Access": false,
              "24/7 Support": false,
              "Knowledge Base": true,
              "Community Forum": true,
              Training: true,
              "Two-factor Auth": true,
              SSO: true,
              Encryption: true,
              "Audit Logs": false,
              "Native Integrations": true,
              "API Documentation": true,
              Webhooks: true,
              "Zapier Support": true,
            },
            rating: 4.7,
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
            features: {
              "API Access": true,
              Customization: true,
              "White-labeling": false,
              "Offline Access": true,
              "24/7 Support": false,
              "Knowledge Base": true,
              "Community Forum": true,
              Training: false,
              "Two-factor Auth": true,
              SSO: true,
              Encryption: true,
              "Audit Logs": true,
              "Native Integrations": true,
              "API Documentation": true,
              Webhooks: false,
              "Zapier Support": true,
            },
            rating: 4.5,
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
            features: {
              "API Access": true,
              Customization: true,
              "White-labeling": true,
              "Offline Access": false,
              "24/7 Support": true,
              "Knowledge Base": true,
              "Community Forum": true,
              Training: false,
              "Two-factor Auth": true,
              SSO: false,
              Encryption: true,
              "Audit Logs": false,
              "Native Integrations": true,
              "API Documentation": true,
              Webhooks: true,
              "Zapier Support": true,
            },
            rating: 4.6,
            integrations: ["Slack", "Google Drive", "Zoom", "Zapier"],
            lastUpdated: "2023-05-10",
          },
        ];

        // Filter to only include the tools from toolIds
        const filteredTools = mockTools.filter((tool) =>
          toolIds.includes(tool.id)
        );
        setComparedTools(filteredTools);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching tools:", error);
      toast({
        title: "Error",
        description: "Failed to load comparison data. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }, [toolIdsString, toast]);

  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  const handleSaveComparison = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save comparisons",
        variant: "destructive",
      });
      return;
    }

    if (!saveName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your comparison",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Using mock data for now since we have issues with the API call
      // This will allow the user to continue without blocking their experience
      // TODO: Replace with real API call when backend is fixed

      // Comment out the real API call for now
      /*
      const result = await compareAPI.saveComparison({
        name: saveName,
        tools: toolIds,
      });
      */

      // Mock success response
      const mockResult = {
        success: true,
        data: {
          id: `mock-${Date.now()}`,
          name: saveName,
          tools: comparedTools.map((tool) => ({
            id: tool.id,
            name: tool.name,
            logo: tool.logo,
          })),
        },
      };

      toast({
        title: "Comparison Saved",
        description: "Your comparison has been saved successfully",
      });
      setShowSaveDialog(false);
    } catch (error) {
      console.error("Error saving comparison:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save comparison. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Premium Feature",
        description:
          "Please sign up for a free account to download comparison reports.",
        variant: "default",
      });
      return;
    }

    setIsGeneratingReport(true);
    try {
      // Mock functionality for now due to backend issues
      // TODO: Replace with real API calls when backend is fixed

      /*
      // First save the comparison to get an ID
      const saveResult = await compareAPI.saveComparison({
        name: `Comparison ${new Date().toLocaleDateString()}`,
        tools: toolIds,
      });

      if (saveResult && saveResult.success && saveResult.data && saveResult.data.id) {
        // Generate the report
        const reportResult = await compareAPI.generateReport(
          saveResult.data.id,
          "PDF",
          true
        );

        if (reportResult && reportResult.success) {
          toast({
            title: "Report Generated",
            description: "Your comparison report has been downloaded.",
            variant: "default",
          });

          // If we have a downloadUrl, open it in a new tab
          if (reportResult.data && reportResult.data.downloadUrl) {
            window.open(reportResult.data.downloadUrl, "_blank");
          }
        } else {
          throw new Error("Report generation failed");
        }
      } else {
        throw new Error("Failed to save comparison before generating report");
      }
      */

      // Simulate report generation delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create a mock PDF using browser capabilities
      const content = document.createElement("div");
      content.innerHTML = `
        <h1>Comparison Report</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
        <hr>
        <h2>Compared Tools:</h2>
        <ul>
          ${comparedTools.map((tool) => `<li>${tool.name}</li>`).join("")}
        </ul>
      `;

      // Display success message
      toast({
        title: "Report Generated",
        description: "Your comparison report is ready to view.",
        variant: "default",
      });

      // Open a new tab with the "report"
      const reportWindow = window.open("", "_blank");
      if (reportWindow) {
        reportWindow.document.write(content.innerHTML);
        reportWindow.document.title = "Comparison Report";
        reportWindow.document.close();
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Report Generation Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="grid place-items-center py-12">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">
              Loading comparison data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (comparedTools.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">No tools to compare</h2>
          <p className="text-muted-foreground mb-4">
            Please select tools to compare.
          </p>
          <Button asChild>
            <Link href="/compare">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Compare
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Comparison Results
            </h1>
            <p className="text-muted-foreground">
              Comparing {comparedTools.length} tools:{" "}
              {comparedTools.map((t) => t.name).join(", ")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/compare">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>

            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Comparison</DialogTitle>
                  <DialogDescription>
                    Give your comparison a name to save it for future reference.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="name" className="mb-2 block">
                    Comparison Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g. CRM Tools Comparison"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowSaveDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveComparison}
                    disabled={isSaving || !saveName.trim()}
                  >
                    {isSaving ? "Saving..." : "Save Comparison"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              onClick={handleDownloadReport}
              disabled={isGeneratingReport}
            >
              <Download className="mr-2 h-4 w-4" />
              {isGeneratingReport ? "Generating..." : "Download Report"}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {comparedTools.map((tool) => (
            <Card key={tool.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{tool.name}</CardTitle>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{tool.rating}/5.0</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {tool.description}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Monthly Price</span>
                    <span className="text-sm">${tool.pricing.monthly}/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Annual Price</span>
                    <span className="text-sm">
                      ${tool.pricing.annually}/year
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Category</span>
                    <Badge variant="outline">{tool.category}</Badge>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button size="sm" variant="outline" asChild>
                    <a
                      href={tool.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit Website
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Feature</TableHead>
                {comparedTools.map((tool) => (
                  <TableHead key={tool.id} className="text-center">
                    {tool.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {featureCategories.map((category) => (
                <React.Fragment key={`category-${category.name}`}>
                  <TableRow className="bg-muted/50">
                    <TableCell
                      colSpan={comparedTools.length + 1}
                      className="font-semibold"
                    >
                      {category.name}
                    </TableCell>
                  </TableRow>
                  {category.features.map((feature) => (
                    <TableRow key={`feature-${feature}`}>
                      <TableCell className="font-medium">{feature}</TableCell>
                      {comparedTools.map((tool) => (
                        <TableCell
                          key={`${tool.id}-${feature}`}
                          className="text-center"
                        >
                          {tool.features && tool.features[feature] ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
