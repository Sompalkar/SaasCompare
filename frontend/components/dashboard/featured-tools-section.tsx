"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Tool {
  id: string;
  name: string;
  logo: string;
  category: string;
  rating: number;
  price: string;
  description: string;
  isFeatured: boolean;
}

export function FeaturedToolsSection() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedTools = async () => {
      try {
        // In a real app, this would be an API call
        // const response = await toolsAPI.getFeaturedTools();
        // setTools(response.data);

        // Mock data for demo
        setTimeout(() => {
          setTools([
            {
              id: "1",
              name: "AWS EC2",
              logo: "/images/tools/aws-ec2.png",
              category: "IaaS",
              rating: 4.8,
              price: "Starting at $0.0116/hour",
              description: "Secure and resizable compute capacity in the cloud",
              isFeatured: true,
            },
            {
              id: "2",
              name: "Azure Virtual Machines",
              logo: "/images/tools/azure-vm.png",
              category: "IaaS",
              rating: 4.6,
              price: "Starting at $0.0113/hour",
              description:
                "Provision Windows and Linux virtual machines in seconds",
              isFeatured: true,
            },
            {
              id: "3",
              name: "Google Kubernetes Engine",
              logo: "/images/tools/gke.png",
              category: "Kubernetes",
              rating: 4.7,
              price: "Starting at $0.10/hour per cluster",
              description: "Managed Kubernetes service with autopilot mode",
              isFeatured: true,
            },
            {
              id: "4",
              name: "Salesforce Sales Cloud",
              logo: "/images/tools/salesforce.png",
              category: "CRM",
              rating: 4.5,
              price: "Starting at $25/user/month",
              description:
                "Complete CRM solution for sales and customer support",
              isFeatured: true,
            },
          ]);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching featured tools:", error);
        setIsLoading(false);
      }
    };

    fetchFeaturedTools();
  }, []);

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Featured Tools
            </h2>
            <p className="text-muted-foreground">
              Popular tools across various categories
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-md" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Featured Tools</h2>
          <p className="text-muted-foreground">
            Popular tools across various categories
          </p>
        </div>
        <Link href="/tools" className="text-primary hover:underline">
          View all tools
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {tools.map((tool) => (
          <Card
            key={tool.id}
            className="overflow-hidden hover:shadow-md transition-shadow"
          >
            <CardContent className="p-0">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 relative rounded-md overflow-hidden bg-slate-50 flex items-center justify-center">
                    {tool.logo ? (
                      <Image
                        src={tool.logo}
                        alt={tool.name}
                        fill
                        className="object-contain p-1"
                      />
                    ) : (
                      <div className="text-lg font-bold text-center">
                        {tool.name.substring(0, 2)}
                      </div>
                    )}
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {tool.category}
                  </Badge>
                </div>
                <h3 className="font-semibold">{tool.name}</h3>
                <div className="flex items-center gap-1 mt-1 mb-2">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-muted-foreground">
                    {tool.rating}/5
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {tool.description}
                </p>
                <div className="text-sm font-medium mt-3">{tool.price}</div>
              </div>
              <div className="bg-muted p-3 border-t">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    asChild
                  >
                    <Link href={`/tools/${tool.id}`}>Details</Link>
                  </Button>
                  <Button size="sm" className="w-full">
                    Compare
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
