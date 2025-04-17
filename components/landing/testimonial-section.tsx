"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "CTO at TechStart",
    avatar: "/placeholder.svg?height=40&width=40",
    content:
      "SaasCompare saved us thousands of dollars by helping us find the perfect project management tool that integrated with our existing stack. The comparison features are incredibly detailed.",
    stars: 5,
  },
  {
    name: "Michael Chen",
    role: "Founder at GrowthLabs",
    avatar: "/placeholder.svg?height=40&width=40",
    content:
      "As a startup founder, I need to be careful with our budget. This tool helped me compare different CRM options and find one that had all the features we needed at half the price we expected to pay.",
    stars: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Marketing Director",
    avatar: "/placeholder.svg?height=40&width=40",
    content:
      "The side-by-side comparison of marketing automation tools was exactly what our team needed. We could easily see which features were available at each price point.",
    stars: 4,
  },
  {
    name: "David Kim",
    role: "Product Manager",
    avatar: "/placeholder.svg?height=40&width=40",
    content:
      "I love how easy it is to filter tools based on specific features. The integration check feature saved me from making a costly mistake with incompatible software.",
    stars: 5,
  },
  {
    name: "Lisa Thompson",
    role: "Operations Lead",
    avatar: "/placeholder.svg?height=40&width=40",
    content:
      "The cost-saving reports are incredibly valuable. We were able to identify redundant tools and consolidate our tech stack, saving over $12,000 annually.",
    stars: 5,
  },
  {
    name: "James Wilson",
    role: "IT Director",
    avatar: "/placeholder.svg?height=40&width=40",
    content:
      "As someone responsible for our company's software budget, this tool has been invaluable. The PDF export feature makes it easy to share comparisons with stakeholders.",
    stars: 4,
  },
]

export default function TestimonialSection() {
  return (
    <section id="testimonials" className="py-20 bg-background">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Thousands of Companies</h2>
            <p className="text-xl text-muted-foreground">
              See what our users have to say about how SaasCompare has helped them make better decisions.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${i < testimonial.stars ? "text-yellow-400 fill-yellow-400" : "text-muted"}`}
                        />
                      ))}
                  </div>
                  <p className="mb-6 text-muted-foreground">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                      <AvatarFallback>
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
