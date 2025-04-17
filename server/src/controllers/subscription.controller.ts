import type { Request, Response, NextFunction } from "express"
import { PrismaClient, UserPlan } from "@prisma/client"
import Stripe from "stripe"
import { AppError } from "../utils/appError"
import { logger } from "../utils/logger"

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
})

// Get current subscription
export const getCurrentSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
      },
    })

    if (!user) {
      return next(new AppError("User not found", 404))
    }

    res.status(200).json({
      status: "success",
      data: {
        plan: user.plan,
        subscription: user.subscription,
      },
    })
  } catch (error) {
    logger.error("Get current subscription error:", error)
    next(error)
  }
}

// Create checkout session
export const createCheckoutSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id
    const { planId, successUrl, cancelUrl } = req.body

    // Get plan details
    const plan = await getPlanDetails(planId)

    if (!plan) {
      return next(new AppError("Invalid plan", 400))
    }

    // Create or get Stripe customer
    let stripeCustomerId = req.user.stripeCustomerId

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
        metadata: {
          userId,
        },
      })

      stripeCustomerId = customer.id

      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: userId },
        data: {
          stripeCustomerId,
        },
      })
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `SaaS Compare ${plan.name} Plan`,
              description: plan.description,
            },
            unit_amount: plan.price * 100, // Stripe uses cents
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        planId,
      },
    })

    res.status(200).json({
      status: "success",
      data: {
        sessionId: session.id,
        url: session.url,
      },
    })
  } catch (error) {
    logger.error("Create checkout session error:", error)
    next(error)
  }
}

// Cancel subscription
export const cancelSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id

    // Get user's subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
      },
    })

    if (!user || !user.subscription) {
      return next(new AppError("No active subscription found", 404))
    }

    // Cancel subscription in Stripe
    if (user.subscription.stripeSubscriptionId) {
      await stripe.subscriptions.cancel(user.subscription.stripeSubscriptionId)
    }

    // Update subscription status in database
    await prisma.subscription.update({
      where: { id: user.subscription.id },
      data: {
        status: "CANCELED",
        canceledAt: new Date(),
      },
    })

    // Update user plan to FREE
    await prisma.user.update({
      where: { id: userId },
      data: {
        plan: UserPlan.FREE,
      },
    })

    res.status(200).json({
      status: "success",
      message: "Subscription canceled successfully",
    })
  } catch (error) {
    logger.error("Cancel subscription error:", error)
    next(error)
  }
}

// Update subscription
export const updateSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id
    const { planId } = req.body

    // Get user's subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
      },
    })

    if (!user || !user.subscription) {
      return next(new AppError("No active subscription found", 404))
    }

    // Get plan details
    const plan = await getPlanDetails(planId)

    if (!plan) {
      return next(new AppError("Invalid plan", 400))
    }

    // Update subscription in Stripe
    if (user.subscription.stripeSubscriptionId) {
      // Get current subscription items
      const subscription = await stripe.subscriptions.retrieve(user.subscription.stripeSubscriptionId)
      const subscriptionItemId = subscription.items.data[0].id

      // Update subscription with new price
      await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
        items: [
          {
            id: subscriptionItemId,
            price_data: {
              currency: "usd",
              product_data: {
                name: `SaaS Compare ${plan.name} Plan`,
                description: plan.description,
              },
              unit_amount: plan.price * 100, // Stripe uses cents
              recurring: {
                interval: "month",
              },
            },
          },
        ],
      })
    }

    // Update subscription in database
    await prisma.subscription.update({
      where: { id: user.subscription.id },
      data: {
        planId,
        updatedAt: new Date(),
      },
    })

    // Update user plan
    await prisma.user.update({
      where: { id: userId },
      data: {
        plan: planId === "pro" ? UserPlan.PRO : UserPlan.ENTERPRISE,
      },
    })

    res.status(200).json({
      status: "success",
      message: "Subscription updated successfully",
    })
  } catch (error) {
    logger.error("Update subscription error:", error)
    next(error)
  }
}

// Handle Stripe webhook
export const handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers["stripe-signature"] as string

    if (!signature) {
      return next(new AppError("Stripe signature missing", 400))
    }

    const event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET || "")

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object)
        break
      case "invoice.paid":
        await handleInvoicePaid(event.data.object)
        break
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object)
        break
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object)
        break
      default:
        logger.info(`Unhandled event type: ${event.type}`)
    }

    res.status(200).json({ received: true })
  } catch (error) {
    logger.error("Webhook error:", error)
    res.status(400).json({ error: `Webhook error: ${(error as Error).message}` })
  }
}

// Helper function to handle checkout.session.completed event
const handleCheckoutSessionCompleted = async (session: any) => {
  try {
    const { userId, planId } = session.metadata

    if (!userId || !planId) {
      logger.error("Missing metadata in checkout session")
      return
    }

    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(session.subscription)

    // Create or update subscription in database
    await prisma.subscription.upsert({
      where: {
        userId,
      },
      create: {
        userId,
        planId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        status: "ACTIVE",
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
      update: {
        planId,
        stripeSubscriptionId: subscription.id,
        status: "ACTIVE",
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        canceledAt: null,
      },
    })

    // Update user plan
    await prisma.user.update({
      where: { id: userId },
      data: {
        plan: planId === "pro" ? UserPlan.PRO : UserPlan.ENTERPRISE,
      },
    })
  } catch (error) {
    logger.error("Error handling checkout.session.completed:", error)
  }
}

// Helper function to handle invoice.paid event
const handleInvoicePaid = async (invoice: any) => {
  try {
    if (!invoice.subscription) {
      return
    }

    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
    const customerId = subscription.customer as string

    // Find user by Stripe customer ID
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
    })

    if (!user) {
      logger.error(`No user found with Stripe customer ID: ${customerId}`)
      return
    }

    // Update subscription period in database
    await prisma.subscription.update({
      where: { userId: user.id },
      data: {
        status: "ACTIVE",
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    })
  } catch (error) {
    logger.error("Error handling invoice.paid:", error)
  }
}

// Helper function to handle customer.subscription.updated event
const handleSubscriptionUpdated = async (subscription: any) => {
  try {
    const customerId = subscription.customer as string

    // Find user by Stripe customer ID
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
    })

    if (!user) {
      logger.error(`No user found with Stripe customer ID: ${customerId}`)
      return
    }

    // Update subscription in database
    await prisma.subscription.update({
      where: { userId: user.id },
      data: {
        status: subscription.status.toUpperCase(),
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
      },
    })
  } catch (error) {
    logger.error("Error handling customer.subscription.updated:", error)
  }
}

// Helper function to handle customer.subscription.deleted event
const handleSubscriptionDeleted = async (subscription: any) => {
  try {
    const customerId = subscription.customer as string

    // Find user by Stripe customer ID
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
    })

    if (!user) {
      logger.error(`No user found with Stripe customer ID: ${customerId}`)
      return
    }

    // Update subscription in database
    await prisma.subscription.update({
      where: { userId: user.id },
      data: {
        status: "CANCELED",
        canceledAt: new Date(),
      },
    })

    // Update user plan to FREE
    await prisma.user.update({
      where: { id: user.id },
      data: {
        plan: UserPlan.FREE,
      },
    })
  } catch (error) {
    logger.error("Error handling customer.subscription.deleted:", error)
  }
}

// Helper function to get plan details
const getPlanDetails = async (planId: string) => {
  const plans = {
    pro: {
      id: "pro",
      name: "Pro",
      description: "Advanced features for startups and teams",
      price: 9,
    },
    enterprise: {
      id: "enterprise",
      name: "Enterprise",
      description: "Custom pricing tiers, API access, and team collaboration",
      price: 49,
    },
  }

  return plans[planId as keyof typeof plans]
}
