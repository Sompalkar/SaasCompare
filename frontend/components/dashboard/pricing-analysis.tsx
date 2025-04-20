"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, LineChart, ArrowRight, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { aiAPI } from "@/lib/api";

interface PricingAnalysisProps {
  tool: any;
  historicalData?: any;
}

export default function PricingAnalysis({
  tool,
  historicalData,
}: PricingAnalysisProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAnalyzePricing = async () => {
    if (!tool) {
      toast({
        title: "Tool required",
        description: "Please select a tool to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const response = await aiAPI.analyzePricingTrends(
        tool,
        historicalData || []
      );

      if (response.success && response.data) {
        setAnalysisResult(response.data);
      } else {
        toast({
          title: "Analysis failed",
          description: "Failed to analyze pricing trends. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error analyzing pricing trends:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <LineChart className="mr-2 h-5 w-5 text-green-500" />
          AI Pricing Analysis
        </CardTitle>
        <CardDescription>
          Get intelligent insights on pricing trends and cost optimization
          recommendations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!analysisResult ? (
          <div className="text-center py-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <LineChart className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-xl font-medium">Analyze Pricing Trends</h3>
              <p className="text-muted-foreground max-w-md">
                Get AI-powered insights on this tool's pricing strategy, value
                for money, and recommendations for cost optimization.
              </p>

              <div className="w-full max-w-xs mt-4">
                <Card className="bg-muted/40 p-4 border-dashed">
                  <div className="text-left">
                    <h4 className="font-medium">{tool.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {tool.category}
                    </p>
                    <div className="mt-2 text-sm">
                      {tool.pricing?.starter?.monthly && (
                        <div className="flex justify-between">
                          <span>Starter:</span>
                          <span className="font-medium">
                            {tool.pricing.starter.monthly}
                          </span>
                        </div>
                      )}
                      {tool.pricing?.professional?.monthly && (
                        <div className="flex justify-between">
                          <span>Professional:</span>
                          <span className="font-medium">
                            {tool.pricing.professional.monthly}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>

              <Button
                onClick={handleAnalyzePricing}
                className="mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze Pricing
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap">{analysisResult}</div>
          </div>
        )}
      </CardContent>
      {analysisResult && (
        <CardFooter className="flex justify-end border-t pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAnalysisResult(null)}
          >
            <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
            Analyze Another Tool
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
