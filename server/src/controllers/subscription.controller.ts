import type { Request, Response } from "express"
import Stripe from "stripe"
import fetch from "node-fetch"
import { prisma } from "../utils/prisma"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2022-11-15", // Updated to match expected version
})

// Get all subscription plans
export const getPlans = async (req: Request, res: Response) => {
  try {
    const plans = await prisma.subscription.findMany({
      where: {
        status: {
          in: ["ACTIVE"],
        },
      },
    })

    return res.status(200).json({ success: true, data: plans })
  } catch (error) {
    console.error("Error fetching plans:", error)
    return res.status(500).json({ success: false, message: "Failed to fetch plans" })
  }
}

// Get user subscription
export const getUserSubscription = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: {
          in: ["ACTIVE"],
        },
      },
    })

    if (!subscription) {
      return res.status(404).json({ success: false, message: "No active subscription found" })
    }

    return res.status(200).json({ success: true, data: subscription })
  } catch (error) {
    console.error("Error fetching user subscription:", error)
    return res.status(500).json({ success: false, message: "Failed to fetch user subscription" })
  }
}

// Create checkout session
export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { planId } = req.body
    const userId = req.user.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    // Get plan details
    const plan = await getPlanDetails(planId)
    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found" })
    }

    // Create or get Stripe customer
    let customerId = user.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id,
        },
      })
      customerId = customer.id

      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      })
    }

    // Get available plans from Stripe
    const stripePlans = await getStripePlans()
    let priceId = ""

    // Find matching price ID
    for (const stripePlan of stripePlans) {
      if (stripePlan.nickname === plan.name) {
        priceId = stripePlan.id
        break
      }
    }

    // If price doesn't exist, create it
    if (!priceId) {
      const product = await stripe.products.create({
        name: plan.name,
        metadata: {
          planId: plan.id,
        },
      })

      const price = await stripe.prices.create({
        unit_amount: Math.round(plan.price * 100), // Convert to cents
        currency: "usd",
        recurring: { interval: "month" },
        product: product.id,
        metadata: {
          planId: plan.id,
        },
      })

      priceId = price.id
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.FRONTEND_URL}/dashboard/subscription?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard/subscription?canceled=true`,
      metadata: {
        userId,
        planId,
      },
    })

    return res.status(200).json({ success: true, url: session.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return res.status(500).json({ success: false, message: "Failed to create checkout session" })
  }
}

// Helper function to get plan details
const getPlanDetails = async (planId: string) => {
  try {
    // Fetch plan details from your database or API
    const response = await fetch(`${process.env.API_URL}/plans/${planId}`)
    const data = await response.json()

    if (data.success) {
      return data.data
    }
    return null
  } catch (error) {
    console.error("Error fetching plan details:", error)
    return null
  }
}

// Helper function to get Stripe plans
const getStripePlans = async () => {
  try {
    const prices = await stripe.prices.list({
      active: true,
      expand: ["data.product"],
    })

    return prices.data
  } catch (error) {
    console.error("Error fetching Stripe plans:", error)
    return []
  }
}

// Create a portal session
export const createPortalSession = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || !user.stripeCustomerId) {
      return res.status(404).json({ success: false, message: "User not found or no Stripe customer ID" })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/dashboard/subscription`,
    })

    return res.status(200).json({ success: true, url: session.url })
  } catch (error) {
    console.error("Error creating portal session:", error)
    return res.status(500).json({ success: false, message: "Failed to create portal session" })
  }
}

// Webhook handler for Stripe events
export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string

  if (!sig) {
    return res.status(400).json({ success: false, message: "Missing stripe-signature header" })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || "")
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error.message)
    return res.status(400).json({ success: false, message: `Webhook Error: ${error.message}` })
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      await handleCheckoutSessionCompleted(session)
      break
    }
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription
      await handleSubscriptionUpdated(subscription)
      break
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription
      await handleSubscriptionDeleted(subscription)
      break
    }
    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return res.status(200).json({ received: true })
}

// Handle checkout session completed
const handleCheckoutSessionCompleted = async (session: Stripe.Checkout.Session) => {
  try {
    const { userId, planId } = session.metadata || {}

    if (!userId || !planId) {
      console.error("Missing userId or planId in session metadata")
      return
    }

    // Get subscription details from Stripe
    const subscriptionId = session.subscription as string
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    // Create subscription in database
    await prisma.subscription.create({
      data: {
        userId,
        planId,
        stripeSubscriptionId: subscriptionId,
        stripeCustomerId: session.customer as string,
        status: subscription.status === "trialing" ? "ACTIVE" : "ACTIVE", // Map Stripe status to your enum
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    })

    // Update user plan
    await prisma.user.update({
      where: { id: userId },
      data: { plan: "PRO" }, // Adjust based on the plan
    })
  } catch (error) {
    console.error("Error handling checkout session completed:", error)
  }
}

// Handle subscription updated
const handleSubscriptionUpdated = async (subscription: Stripe.Subscription) => {
  try {
    const customerId = subscription.customer as string
    const status = subscription.status

    // Find user by Stripe customer ID
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
    })

    if (!user) {
      console.error(`No user found with Stripe customer ID: ${customerId}`)
      return
    }

    // Update subscription in database
    await prisma.subscription.updateMany({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        status: status === "trialing" ? "ACTIVE" : status === "active" ? "ACTIVE" : "CANCELED",
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    })
  } catch (error) {
    console.error("Error handling subscription updated:", error)
  }
}

// Handle subscription deleted
const handleSubscriptionDeleted = async (subscription: Stripe.Subscription) => {
  try {
    // Update subscription status to canceled
    await prisma.subscription.updateMany({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        status: "CANCELED",
        canceledAt: new Date(),
      },
    })

    // Find user by subscription
    const sub = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    })

    if (sub) {
      // Downgrade user plan
      await prisma.user.update({
        where: { id: sub.userId },
        data: { plan: "FREE" },
      })
    }
  } catch (error) {
    console.error("Error handling subscription deleted:", error)
  }
}

// Cancel subscription
export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: {
          in: ["ACTIVE"],
        },
      },
    })

    if (!subscription) {
      return res.status(404).json({ success: false, message: "No active subscription found" })
    }

    if (!subscription.stripeSubscriptionId) {
      return res.status(400).json({ success: false, message: "No Stripe subscription ID found" })
    }

    // Cancel at period end
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    })

    // Update subscription in database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: "ACTIVE", // Still active until the end of the period
      },
    })

    return res
      .status(200)
      .json({ success: true, message: "Subscription will be canceled at the end of the billing period" })
  } catch (error) {
    console.error("Error canceling subscription:", error)
    return res.status(500).json({ success: false, message: "Failed to cancel subscription" })
  }
}

// Resume subscription
export const resumeSubscription = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: {
          in: ["ACTIVE"],
        },
      },
    })

    if (!subscription) {
      return res.status(404).json({ success: false, message: "No active subscription found" })
    }

    if (!subscription.stripeSubscriptionId) {
      return res.status(400).json({ success: false, message: "No Stripe subscription ID found" })
    }

    // Resume subscription
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    })

    // Update subscription in database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: "ACTIVE",
      },
    })

    return res.status(200).json({ success: true, message: "Subscription resumed successfully" })
  } catch (error) {
    console.error("Error resuming subscription:", error)
    return res.status(500).json({ success: false, message: "Failed to resume subscription" })
  }
}

// Get subscription details
export const getSubscriptionDetails = async (req: Request, res: Response) => {
  try {
    const subscriptionId = req.params.id

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    })

    if (!subscription) {
      return res.status(404).json({ success: false, message: "Subscription not found" })
    }

    // Get additional details from Stripe if needed
    let stripeSubscription = null
    if (subscription.stripeSubscriptionId) {
      stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId)
    }

    return res.status(200).json({
      success: true,
      data: {
        ...subscription,
        stripeDetails: stripeSubscription,
      },
    })
  } catch (error) {
    console.error("Error fetching subscription details:", error)
    return res.status(500).json({ success: false, message: "Failed to fetch subscription details" })
  }
}
