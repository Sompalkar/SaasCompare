import { Metadata } from "next";
import DashboardTabs from "@/components/dashboard/dashboard-tabs";
import { ServiceCategoriesGrid } from "@/components/dashboard/service-categories-grid";
import { CloudProvidersCarousel } from "@/components/dashboard/cloud-providers-carousel";
import { FeaturedToolsSection } from "@/components/dashboard/featured-tools-section";
import { RecentComparisonsSection } from "@/components/dashboard/recent-comparisons-section";
import { UserGreeting } from "@/components/dashboard/user-greeting";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View your dashboard with all tools and services",
};

const serviceCategories = [
  {
    id: "iaas",
    name: "Infrastructure as a Service (IaaS)",
    description:
      "Cloud computing infrastructure services including virtual machines, storage, networks, and more",
    icon: "server",
    count: 50,
  },
  {
    id: "paas",
    name: "Platform as a Service (PaaS)",
    description:
      "Development and deployment environments for building, testing, and launching applications",
    icon: "layers",
    count: 42,
  },
  {
    id: "saas",
    name: "Software as a Service (SaaS)",
    description: "Cloud-based applications delivered over the internet",
    icon: "cloud",
    count: 120,
  },
  {
    id: "crm",
    name: "Customer Relationship Management",
    description:
      "Tools to manage company relationships and interactions with customers and potential customers",
    icon: "users",
    count: 35,
  },
  {
    id: "hrms",
    name: "Human Resources Management",
    description:
      "Software solutions for managing HR functions such as recruitment, performance, and payroll",
    icon: "user-plus",
    count: 28,
  },
  {
    id: "pm",
    name: "Project Management",
    description:
      "Tools to plan, organize, and manage project resources and develop resource estimates",
    icon: "trello",
    count: 45,
  },
  {
    id: "analytics",
    name: "Analytics & Business Intelligence",
    description: "Platforms for analyzing data and deriving business insights",
    icon: "bar-chart-2",
    count: 38,
  },
  {
    id: "kubernetes",
    name: "Kubernetes & Containers",
    description: "Container orchestration and management tools",
    icon: "box",
    count: 22,
  },
  {
    id: "databases",
    name: "Databases & Caching",
    description: "SQL, NoSQL databases and caching solutions like Redis",
    icon: "database",
    count: 32,
  },
  {
    id: "ai",
    name: "AI & Machine Learning",
    description:
      "Tools and platforms for building, training, and deploying AI and ML models",
    icon: "cpu",
    count: 25,
  },
  {
    id: "devops",
    name: "DevOps & CI/CD",
    description: "Continuous integration, delivery, and deployment tools",
    icon: "git-branch",
    count: 30,
  },
  {
    id: "security",
    name: "Security & Compliance",
    description: "Tools for securing applications, data, and infrastructure",
    icon: "shield",
    count: 27,
  },
];

const cloudProviders = [
  {
    id: "aws",
    name: "Amazon Web Services",
    logo: "/images/providers/aws.png",
    serviceCount: 200,
  },
  {
    id: "azure",
    name: "Microsoft Azure",
    logo: "/images/providers/azure.png",
    serviceCount: 180,
  },
  {
    id: "gcp",
    name: "Google Cloud Platform",
    logo: "/images/providers/gcp.png",
    serviceCount: 160,
  },
  {
    id: "ibm",
    name: "IBM Cloud",
    logo: "/images/providers/ibm.png",
    serviceCount: 120,
  },
  {
    id: "oracle",
    name: "Oracle Cloud",
    logo: "/images/providers/oracle.png",
    serviceCount: 100,
  },
  {
    id: "digitalocean",
    name: "DigitalOcean",
    logo: "/images/providers/digitalocean.png",
    serviceCount: 40,
  },
  {
    id: "alibaba",
    name: "Alibaba Cloud",
    logo: "/images/providers/alibaba.png",
    serviceCount: 140,
  },
  {
    id: "salesforce",
    name: "Salesforce",
    logo: "/images/providers/salesforce.png",
    serviceCount: 80,
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 pb-12">
      <UserGreeting />

      <DashboardTabs />

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Cloud Providers
            </h2>
            <p className="text-muted-foreground">
              Compare services across major cloud providers
            </p>
          </div>
          <a
            href="/dashboard/cloud-providers"
            className="text-primary hover:underline"
          >
            View all providers
          </a>
        </div>

        <CloudProvidersCarousel providers={cloudProviders} />
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Service Categories
            </h2>
            <p className="text-muted-foreground">
              Browse tools and services by category
            </p>
          </div>
          <a
            href="/dashboard/categories"
            className="text-primary hover:underline"
          >
            View all categories
          </a>
        </div>

        <ServiceCategoriesGrid categories={serviceCategories} />
      </section>

      <FeaturedToolsSection />

      <RecentComparisonsSection />
    </div>
  );
}
