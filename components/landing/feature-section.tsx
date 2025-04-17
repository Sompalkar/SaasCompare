"use client"

import { motion } from "framer-motion"
import { BarChart3, Clock, CreditCard, FileText, Filter, LineChart, RefreshCw, Save, Zap } from "lucide-react"

const features = [
  {
    icon: <BarChart3 className="h-10 w-10 text-primary" />,
    title: "Side-by-Side Comparison",
    description: "Compare features, pricing, and limitations of multiple SaaS tools in a clean, easy-to-read format.",
  },
  {
    icon: <RefreshCw className="h-10 w-10 text-primary" />,
    title: "Real-Time Price Tracking",
    description: "Get the most up-to-date pricing information with our automated scraping system that refreshes daily.",
  },
  {
    icon: <Filter className="h-10 w-10 text-primary" />,
    title: "Advanced Filtering",
    description:
      "Filter tools by features, price range, integrations, and more to find the perfect match for your needs.",
  },
  {
    icon: <Save className="h-10 w-10 text-primary" />,
    title: "Save Comparisons",
    description: "Save your comparisons to revisit later or share with your team to make collaborative decisions.",
  },
  {
    icon: <LineChart className="h-10 w-10 text-primary" />,
    title: "Cost-Saving Reports",
    description: "Generate detailed reports showing potential cost savings when switching between different tools.",
  },
  {
    icon: <FileText className="h-10 w-10 text-primary" />,
    title: "PDF Export",
    description:
      "Export your comparisons as professional PDF reports to share with stakeholders or for offline reference.",
  },
  {
    icon: <Zap className="h-10 w-10 text-primary" />,
    title: "Integration Checks",
    description: "Verify if tools integrate with your existing tech stack to ensure seamless workflow transitions.",
  },
  {
    icon: <Clock className="h-10 w-10 text-primary" />,
    title: "Historical Pricing",
    description: "Track price changes over time to identify trends and make informed long-term decisions.",
  },
  {
    icon: <CreditCard className="h-10 w-10 text-primary" />,
    title: "Pricing Plan Analyzer",
    description: "Analyze which pricing tier offers the best value based on your specific feature requirements.",
  },
]

export default function FeatureSection() {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features to Make Informed Decisions</h2>
            <p className="text-xl text-muted-foreground">
              Our comprehensive comparison engine provides all the tools you need to evaluate and select the best SaaS
              solutions.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 rounded-xl border bg-card hover:shadow-md transition-shadow"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
