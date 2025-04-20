"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart, LineChart, PieChart } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface PricingChartProps {
  tools: any[];
  historicalData?: any;
}

export default function PricingChart({
  tools,
  historicalData,
}: PricingChartProps) {
  const [chartType, setChartType] = useState("bar");
  const [tierType, setTierType] = useState("starter");
  const [periodType, setPeriodType] = useState("monthly");

  // Define color palette that matches the app theme
  const colorPalette = [
    "rgba(99, 102, 241, 0.8)", // Indigo
    "rgba(168, 85, 247, 0.8)", // Purple
    "rgba(236, 72, 153, 0.8)", // Pink
    "rgba(59, 130, 246, 0.8)", // Blue
    "rgba(16, 185, 129, 0.8)", // Green
    "rgba(245, 158, 11, 0.8)", // Amber
  ];

  const borderColors = [
    "rgba(99, 102, 241, 1)", // Indigo
    "rgba(168, 85, 247, 1)", // Purple
    "rgba(236, 72, 153, 1)", // Pink
    "rgba(59, 130, 246, 1)", // Blue
    "rgba(16, 185, 129, 1)", // Green
    "rgba(245, 158, 11, 1)", // Amber
  ];

  // Get the pricing data for the selected tier and period
  const getPricingData = () => {
    return tools
      .map((tool) => {
        try {
          if (
            tool.pricing &&
            tool.pricing[tierType] &&
            tool.pricing[tierType][periodType]
          ) {
            return {
              name: tool.name,
              price:
                parseFloat(
                  tool.pricing[tierType][periodType].replace(/[^0-9.]/g, "")
                ) || 0,
            };
          }
          return { name: tool.name, price: 0 };
        } catch (error) {
          console.error(`Error getting pricing for ${tool.name}:`, error);
          return { name: tool.name, price: 0 };
        }
      })
      .filter((item) => item.price > 0); // Only include tools with valid pricing
  };

  // Get historical pricing data for trend chart
  const getHistoricalData = () => {
    if (!historicalData) return { labels: [], datasets: [] };

    const labels = historicalData.dates || [];
    const datasets = tools.map((tool, index) => {
      const data =
        historicalData.prices?.[tool.id]?.[tierType]?.[periodType] || [];
      return {
        label: tool.name,
        data,
        borderColor: borderColors[index % borderColors.length],
        backgroundColor: colorPalette[index % colorPalette.length],
        tension: 0.3,
      };
    });

    return { labels, datasets };
  };

  // Prepare bar chart data
  const barChartData = () => {
    const pricingData = getPricingData();
    return {
      labels: pricingData.map((item) => item.name),
      datasets: [
        {
          label: `${tierType} tier (${periodType})`,
          data: pricingData.map((item) => item.price),
          backgroundColor: pricingData.map(
            (_, i) => colorPalette[i % colorPalette.length]
          ),
          borderColor: pricingData.map(
            (_, i) => borderColors[i % borderColors.length]
          ),
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare line chart data for historical trends
  const lineChartData = () => {
    if (historicalData) {
      return getHistoricalData();
    }

    // If no historical data, use current pricing
    const pricingData = getPricingData();
    return {
      labels: ["Current Price"],
      datasets: pricingData.map((item, index) => ({
        label: item.name,
        data: [item.price],
        borderColor: borderColors[index % borderColors.length],
        backgroundColor: colorPalette[index % colorPalette.length],
      })),
    };
  };

  // Prepare pie chart data
  const pieChartData = () => {
    const pricingData = getPricingData();
    return {
      labels: pricingData.map((item) => item.name),
      datasets: [
        {
          data: pricingData.map((item) => item.price),
          backgroundColor: pricingData.map(
            (_, i) => colorPalette[i % colorPalette.length]
          ),
          borderColor: pricingData.map(
            (_, i) => borderColors[i % borderColors.length]
          ),
          borderWidth: 1,
        },
      ],
    };
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `Pricing Comparison - ${
          tierType.charAt(0).toUpperCase() + tierType.slice(1)
        } Tier (${periodType})`,
      },
    },
  };

  // Render the appropriate chart based on selected type
  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return <Bar data={barChartData()} options={options} height={300} />;
      case "line":
        return <Line data={lineChartData()} options={options} height={300} />;
      case "pie":
        return <Pie data={pieChartData()} options={options} height={300} />;
      default:
        return <Bar data={barChartData()} options={options} height={300} />;
    }
  };

  // Available pricing tiers
  const tiers = [
    { value: "free", label: "Free Tier" },
    { value: "starter", label: "Starter Tier" },
    { value: "professional", label: "Professional Tier" },
    { value: "enterprise", label: "Enterprise Tier" },
  ];

  return (
    <Card className="border border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <BarChart className="mr-2 h-5 w-5 text-indigo-500" />
          Visual Pricing Comparison
        </CardTitle>
        <CardDescription>
          Compare pricing across different tools, tiers, and billing periods.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">
                Pricing Tier
              </label>
              <Select value={tierType} onValueChange={setTierType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  {tiers.map((tier) => (
                    <SelectItem key={tier.value} value={tier.value}>
                      {tier.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">
                Billing Period
              </label>
              <Select value={periodType} onValueChange={setPeriodType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs
            defaultValue="bar"
            value={chartType}
            onValueChange={setChartType}
          >
            <TabsList className="grid grid-cols-3 w-full max-w-md mb-4">
              <TabsTrigger value="bar" className="flex items-center">
                <BarChart className="h-4 w-4 mr-2" />
                Bar Chart
              </TabsTrigger>
              <TabsTrigger value="line" className="flex items-center">
                <LineChart className="h-4 w-4 mr-2" />
                Trend Chart
              </TabsTrigger>
              <TabsTrigger value="pie" className="flex items-center">
                <PieChart className="h-4 w-4 mr-2" />
                Pie Chart
              </TabsTrigger>
            </TabsList>
            <div className="h-[350px] w-full">{renderChart()}</div>
          </Tabs>

          <div className="text-xs text-muted-foreground mt-4">
            Note: Chart displays pricing data for the selected tier and billing
            period.
            {chartType === "line" &&
              " Trend chart shows historical price changes when available."}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
