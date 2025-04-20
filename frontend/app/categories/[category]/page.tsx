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
  Image,
  Center,
  Loader,
} from "@mantine/core";
import { toolsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface Tool {
  id: string;
  name: string;
  description: string;
  logo: string;
  website: string;
  category: string;
  pricing: Record<string, any>;
  integrations: string[];
  lastUpdated: string;
}

export default function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const category = decodeURIComponent(params.category);

  useEffect(() => {
    async function fetchToolsByCategory() {
      try {
        setIsLoading(true);
        const response = await toolsAPI.getToolsByCategory(category);
        if (response.success && response.data) {
          setTools(response.data);
        } else {
          throw new Error("Failed to fetch tools");
        }
      } catch (error) {
        console.error(`Error fetching tools for category ${category}:`, error);
        toast({
          title: "Error",
          description: "Failed to load tools. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchToolsByCategory();
  }, [category, toast]);

  const handleToolClick = (id: string) => {
    router.push(`/tools/${id}`);
  };

  const handleCompareClick = (event: React.MouseEvent, id: string) => {
    event.stopPropagation();
    router.push(`/compare?tools=${id}`);
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
      <Button variant="outline" mb="md" component={Link} href="/categories">
        ← Back to Categories
      </Button>

      <Title mb="sm">{category} Tools</Title>
      <Text mb="xl" color="dimmed">
        Explore {tools.length} {category} tools and services for your business
        needs.
      </Text>

      <Grid>
        {tools.map((tool) => (
          <Grid.Col key={tool.id} span={{ base: 12, sm: 6, md: 4 }}>
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
              }}
              onClick={() => handleToolClick(tool.id)}
            >
              <Card.Section withBorder inheritPadding py="md">
                <Group>
                  <Image
                    src={tool.logo}
                    alt={tool.name}
                    width={40}
                    height={40}
                    fallbackSrc="/placeholder.svg"
                  />
                  <div>
                    <Text fw={700} size="lg">
                      {tool.name}
                    </Text>
                    <Badge color="blue">{tool.category}</Badge>
                  </div>
                </Group>
              </Card.Section>

              <Text mt="md" size="sm" lineClamp={3} style={{ flexGrow: 1 }}>
                {tool.description}
              </Text>

              <Group mt="md">
                {tool.pricing.free && <Badge color="green">Free Tier</Badge>}
                {Object.keys(tool.pricing).length > 0 &&
                  Object.values(tool.pricing).some(
                    (tier) =>
                      typeof tier === "object" &&
                      tier.price &&
                      tier.price !== "Contact for pricing"
                  ) && (
                    <Badge>
                      From $
                      {Math.min(
                        ...Object.values(tool.pricing)
                          .filter(
                            (tier: any) =>
                              typeof tier === "object" &&
                              tier.price &&
                              tier.price !== "Contact for pricing"
                          )
                          .map((tier: any) => Number(tier.price))
                      )}
                      /mo
                    </Badge>
                  )}
                {tool.integrations.length > 0 && (
                  <Badge color="grape">
                    {tool.integrations.length} Integrations
                  </Badge>
                )}
              </Group>

              <Group mt="md" grow>
                <Button
                  variant="light"
                  component="a"
                  href={tool.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  Website
                </Button>
                <Button
                  variant="outline"
                  onClick={(e) => handleCompareClick(e, tool.id)}
                >
                  Compare
                </Button>
              </Group>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      {tools.length === 0 && (
        <Center py="xl">
          <div style={{ textAlign: "center" }}>
            <Title order={3} mb="md">
              No tools found
            </Title>
            <Text color="dimmed">
              No tools found in the {category} category.
            </Text>
            <Button mt="xl" component={Link} href="/categories">
              Browse Other Categories
            </Button>
          </div>
        </Center>
      )}
    </Container>
  );
}
