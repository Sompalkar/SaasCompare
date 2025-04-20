"use client";

import { useState, useEffect } from "react";
import { ToolsComparisonTable } from "@/components/dashboard/tools-comparison-table";

interface Tool {
  id: string;
  name: string;
  category: string;
  rating: number;
}

interface Comparison {
  id: string;
  date: string;
  tools: Tool[];
}

export function RecentComparisonsSection() {
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentComparisons = async () => {
      try {
        // In a real app, this would be an API call
        // const response = await compareAPI.getRecentComparisons();
        // setComparisons(response.data);

        // Mock data for demo
        setTimeout(() => {
          setComparisons([
            {
              id: "1",
              date: "10 Jun 2023",
              tools: [
                { id: "1", name: "AWS EC2", category: "IaaS", rating: 4.8 },
                { id: "2", name: "Azure VM", category: "IaaS", rating: 4.6 },
                {
                  id: "3",
                  name: "Google Compute Engine",
                  category: "IaaS",
                  rating: 4.5,
                },
              ],
            },
            {
              id: "2",
              date: "15 Jun 2023",
              tools: [
                {
                  id: "4",
                  name: "Kubernetes",
                  category: "Container Orchestration",
                  rating: 4.9,
                },
                {
                  id: "5",
                  name: "Docker Swarm",
                  category: "Container Orchestration",
                  rating: 4.3,
                },
                {
                  id: "6",
                  name: "Amazon ECS",
                  category: "Container Orchestration",
                  rating: 4.4,
                },
              ],
            },
            {
              id: "3",
              date: "22 Jun 2023",
              tools: [
                {
                  id: "7",
                  name: "MongoDB",
                  category: "Databases",
                  rating: 4.7,
                },
                {
                  id: "8",
                  name: "PostgreSQL",
                  category: "Databases",
                  rating: 4.8,
                },
                { id: "9", name: "MySQL", category: "Databases", rating: 4.6 },
              ],
            },
          ]);
          setIsLoading(false);
        }, 1500);
      } catch (error) {
        console.error("Error fetching recent comparisons:", error);
        setIsLoading(false);
      }
    };

    fetchRecentComparisons();
  }, []);

  return (
    <section>
      <ToolsComparisonTable comparisons={comparisons} />
    </section>
  );
}
