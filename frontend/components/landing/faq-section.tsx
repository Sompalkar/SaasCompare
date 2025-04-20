"use client"

import { motion } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "How accurate is the pricing data?",
    answer:
      "Our pricing data is updated daily through automated scraping and manual verification. We strive for 99% accuracy, but prices can change without notice. We always link to the official pricing page so you can verify the most current information.",
  },
  {
    question: "How many tools can I compare at once?",
    answer:
      "Free users can compare up to 3 tools at once, while Pro and Enterprise users can compare an unlimited number of tools simultaneously. However, for the best user experience, we recommend comparing no more than 5-7 tools at a time.",
  },
  {
    question: "Can I export my comparisons?",
    answer:
      "Yes, Pro and Enterprise users can export their comparisons as PDF reports. These reports include all comparison data, potential cost savings, and recommendations. Free users can view comparisons online but cannot export them.",
  },
  {
    question: "How do you calculate potential cost savings?",
    answer:
      "Our cost-saving calculations consider several factors, including current pricing, feature requirements, team size, and potential bundle discounts. We analyze which features you actually need and identify tools that provide those features at the best price point.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Yes, we offer a 14-day money-back guarantee for all paid plans. If you're not satisfied with our service, contact our support team within 14 days of your purchase for a full refund.",
  },
  {
    question: "How do I cancel my subscription?",
    answer:
      "You can cancel your subscription at any time from your account settings. After cancellation, you'll continue to have access to paid features until the end of your current billing period.",
  },
  {
    question: "Can I suggest a tool to be added to your database?",
    answer:
      "We welcome suggestions for new tools to add to our database. Please use the 'Suggest a Tool' form in your dashboard, and our team will review your suggestion.",
  },
  {
    question: "How do integration checks work?",
    answer:
      "Our integration check feature verifies if tools in your comparison integrate with your existing tech stack. We maintain a database of known integrations between popular SaaS tools, including native integrations and those available through platforms like Zapier.",
  },
]

export default function FaqSection() {
  return (
    <section id="faq" className="py-20 bg-primary/5">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground">
              Find answers to common questions about our SaaS comparison platform.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Still have questions?{" "}
            <a href="/contact" className="text-primary hover:underline">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
