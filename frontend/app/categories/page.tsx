"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Grid,
  Card,
  Text,
  Title,
  Badge,
  Group,
  Button,
  Center,
  Loader,
} from "@mantine/core";
import { toolsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  // Define icons for categories
  const categoryIcons: Record<string, string> = {
    CRM: "🤝",
    "Project Management": "📋",
    Communication: "💬",
    Productivity: "⚡",
    HR: "👥",
    Analytics: "📊",
    IaaS: "🖥️",
    PaaS: "🔌",
    SaaS: "☁️",
    Database: "💾",
    Kubernetes: "🚢",
    DevOps: "🔄",
    Security: "🔒",
    Marketing: "📢",
    Finance: "💰",
    Sales: "💼",
    Support: "🎯",
    Development: "👨‍💻",
    Design: "🎨",
  };

  // Define colors for category cards
  const categoryColors = [
    "blue",
    "teal",
    "green",
    "lime",
    "yellow",
    "orange",
    "red",
    "pink",
    "violet",
    "indigo",
  ];

  useEffect(() => {
    async function fetchCategories() {
      try {
        setIsLoading(true);
        const response = await toolsAPI.getToolCategories();
        if (response.success && response.data) {
          setCategories(response.data);
        } else {
          throw new Error("Failed to fetch categories");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast({
          title: "Error",
          description: "Failed to load categories. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategories();
  }, [toast]);

  const handleCategoryClick = (category: string) => {
    router.push(`/categories/${encodeURIComponent(category)}`);
  };

  if (isLoading) {
    return (
      <Container my="xl">
        <Center style={{ height: "calc(100vh - 200px)" }}>
          <Loader />
        </Center>
      </Container>
    );
  }

  return (
    <Container my="xl">
      <Title mb="xl">Tool Categories</Title>
      <Text mb="xl" color="dimmed">
        Browse tools by categories to find the perfect solution for your needs.
        We organize tools into various categories to make your search easier.
      </Text>

      <Grid>
        {categories.map((category, index) => (
          <Grid.Col key={category} span={{ base: 12, sm: 6, md: 4 }}>
            <Card
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                borderLeft: `4px solid var(--mantine-color-${
                  categoryColors[index % categoryColors.length]
                }-6)`,
              }}
              onClick={() => handleCategoryClick(category)}
            >
              <Card.Section withBorder inheritPadding py="xs">
                <Group justify="space-between">
                  <Text fw={700} size="lg">
                    {categoryIcons[category] || "🔧"} {category}
                  </Text>
                  <Badge color={categoryColors[index % categoryColors.length]}>
                    Explore
                  </Badge>
                </Group>
              </Card.Section>

              <Text mt="md" size="sm" color="dimmed">
                {getCategoryDescription(category)}
              </Text>

              <Button
                variant="light"
                color={categoryColors[index % categoryColors.length]}
                fullWidth
                mt="auto"
              >
                View {category} Tools
              </Button>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
}

function getCategoryDescription(category: string): string {
  const descriptions: Record<string, string> = {
    CRM: "Customer Relationship Management tools to help manage interactions with customers and potential customers.",
    "Project Management":
      "Tools to help plan, organize, and manage resources to complete projects successfully.",
    Communication:
      "Tools designed to facilitate communication within teams and with customers.",
    Productivity:
      "Tools that help individuals and teams be more efficient and get more done.",
    HR: "Human Resources tools for recruitment, onboarding, and employee management.",
    Analytics:
      "Tools to collect, analyze, and visualize data for business intelligence.",
    IaaS: "Infrastructure as a Service - cloud-based infrastructure services.",
    PaaS: "Platform as a Service - cloud-based platform services for developers.",
    SaaS: "Software as a Service - cloud-based application services.",
    Database:
      "Database management systems and database as a service platforms.",
    Kubernetes: "Container orchestration tools and Kubernetes-based services.",
    DevOps: "Tools for software development and IT operations integration.",
    Security:
      "Tools for cybersecurity, identity management, and data protection.",
    Marketing:
      "Tools for digital marketing, email marketing, and marketing automation.",
    Finance:
      "Financial management tools for accounting, budgeting, and reporting.",
    Sales:
      "Tools for sales teams to manage leads, opportunities, and customer relationships.",
    Support: "Customer support and help desk software for service teams.",
    Development:
      "Software development tools, IDEs, and version control systems.",
    Design:
      "Tools for graphic design, UI/UX design, and digital asset management.",
  };

  return (
    descriptions[category] ||
    `Explore ${category} tools and services for your business needs.`
  );
}
