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
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { aiAPI } from "@/lib/api";

const categories = [
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
];

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Retail",
  "Manufacturing",
  "Hospitality",
  "Entertainment",
  "Real Estate",
  "Nonprofit",
];

export default function AIRecommendationsCard() {
  const [budget, setBudget] = useState<number>(100);
  const [category, setCategory] = useState<string>("");
  const [industry, setIndustry] = useState<string>("");
  const [teamSize, setTeamSize] = useState<string>("");
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<any>(null);
  const { toast } = useToast();

  const handleAddFeature = () => {
    if (!featureInput.trim()) return;
    setFeatures([...features, featureInput.trim()]);
    setFeatureInput("");
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleGetRecommendations = async () => {
    if (!category) {
      toast({
        title: "Category required",
        description: "Please select a category to get recommendations",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setRecommendations(null);

    try {
      const response = await aiAPI.getRecommendations({
        category,
        budget,
        features,
        teamSize: teamSize ? parseInt(teamSize) : undefined,
        industry,
      });

      if (response.success && response.data) {
        // Try to parse the response if it's in JSON format
        try {
          const jsonData = JSON.parse(response.data);
          setRecommendations(jsonData);
        } catch {
          // If parsing fails, use the raw text
          setRecommendations({ rawText: response.data });
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to get AI recommendations. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error getting AI recommendations:", error);
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
    <div className="space-y-6">
      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Sparkles className="mr-2 h-5 w-5 text-purple-500" />
            AI-Powered Tool Recommendations
          </CardTitle>
          <CardDescription>
            Tell us what you need, and our AI will suggest the best SaaS tools
            for your requirements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Category
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="budget" className="text-sm font-medium">
              Monthly Budget: ${budget}
            </label>
            <Slider
              id="budget"
              min={0}
              max={1000}
              step={10}
              value={[budget]}
              onValueChange={(value) => setBudget(value[0])}
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="industry" className="text-sm font-medium">
              Industry
            </label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger id="industry">
                <SelectValue placeholder="Select your industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((ind) => (
                  <SelectItem key={ind} value={ind}>
                    {ind}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="teamSize" className="text-sm font-medium">
              Team Size
            </label>
            <Input
              id="teamSize"
              type="number"
              placeholder="Number of users"
              value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="features" className="text-sm font-medium">
              Required Features
            </label>
            <div className="flex gap-2">
              <Input
                id="features"
                placeholder="Add a required feature"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
              />
              <Button type="button" onClick={handleAddFeature} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {features.map((feature, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1 py-1 px-2"
                >
                  {feature}
                  <button
                    onClick={() => handleRemoveFeature(index)}
                    className="ml-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleGetRecommendations}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Getting Recommendations...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Get AI Recommendations
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {recommendations && (
        <Card className="border border-border bg-card animate-in fade-in-50 duration-300">
          <CardHeader>
            <CardTitle>AI Recommendations</CardTitle>
            <CardDescription>
              Based on your requirements, here are the best tools for your
              needs:
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recommendations.rawText ? (
              <div className="whitespace-pre-wrap">
                {recommendations.rawText}
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.recommendations?.map(
                  (tool: any, index: number) => (
                    <div key={index} className="p-4 border rounded-md">
                      <h3 className="text-lg font-bold">{tool.name}</h3>
                      <p className="text-muted-foreground">
                        {tool.description}
                      </p>
                      <div className="mt-2">
                        <span className="font-medium">Key Strengths:</span>
                        <ul className="ml-5 list-disc">
                          {tool.strengths?.map(
                            (strength: string, i: number) => (
                              <li key={i}>{strength}</li>
                            )
                          )}
                        </ul>
                      </div>
                      <div className="mt-2">
                        <span className="font-medium">Pricing:</span>{" "}
                        {tool.pricing}
                      </div>
                    </div>
                  )
                )}
                {recommendations.reasoning && (
                  <div className="mt-4 p-4 bg-muted rounded-md">
                    <h3 className="font-bold">AI Reasoning</h3>
                    <p>{recommendations.reasoning}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
