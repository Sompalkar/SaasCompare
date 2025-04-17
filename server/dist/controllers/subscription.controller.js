"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWebhook = exports.updateSubscription = exports.cancelSubscription = exports.createCheckoutSession = exports.getCurrentSubscription = void 0;
const client_1 = require("@prisma/client");
const stripe_1 = __importDefault(require("stripe"));
const appError_1 = require("../utils/appError");
const logger_1 = require("../utils/logger");
const prisma = new client_1.PrismaClient();
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2023-10-16",
});
// Get current subscription
const getCurrentSubscription = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                subscription: true,
            },
        });
        if (!user) {
            return next(new appError_1.AppError("User not found", 404));
        }
        res.status(200).json({
            status: "success",
            data: {
                plan: user.plan,
                subscription: user.subscription,
            },
        });
    }
    catch (error) {
        logger_1.logger.error("Get current subscription error:", error);
        next(error);
    }
};
exports.getCurrentSubscription = getCurrentSubscription;
// Create checkout session
const createCheckoutSession = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { planId, successUrl, cancelUrl } = req.body;
        // Get plan details
        const plan = await getPlanDetails(planId);
        if (!plan) {
            return next(new appError_1.AppError("Invalid plan", 400));
        }
        // Create or get Stripe customer
        let stripeCustomerId = req.user.stripeCustomerId;
        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: req.user.email,
                name: req.user.name,
                metadata: {
                    userId,
                },
            });
            stripeCustomerId = customer.id;
            // Update user with Stripe customer ID
            await prisma.user.update({
                where: { id: userId },
                data: {
                    stripeCustomerId,
                },
            });
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
        });
        res.status(200).json({
            status: "success",
            data: {
                sessionId: session.id,
                url: session.url,
            },
        });
    }
    catch (error) {
        logger_1.logger.error("Create checkout session error:", error);
        next(error);
    }
};
exports.createCheckoutSession = createCheckoutSession;
// Cancel subscription
const cancelSubscription = async (req, res, next) => {
    try {
        const userId = req.user.id;
        // Get user's subscription
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                subscription: true,
            },
        });
        if (!user || !user.subscription) {
            return next(new appError_1.AppError("No active subscription found", 404));
        }
        // Cancel subscription in Stripe
        if (user.subscription.stripeSubscriptionId) {
            await stripe.subscriptions.cancel(user.subscription.stripeSubscriptionId);
        }
        // Update subscription status in database
        await prisma.subscription.update({
            where: { id: user.subscription.id },
            data: {
                status: "CANCELED",
                canceledAt: new Date(),
            },
        });
        // Update user plan to FREE
        await prisma.user.update({
            where: { id: userId },
            data: {
                plan: client_1.UserPlan.FREE,
            },
        });
        res.status(200).json({
            status: "success",
            message: "Subscription canceled successfully",
        });
    }
    catch (error) {
        logger_1.logger.error("Cancel subscription error:", error);
        next(error);
    }
};
exports.cancelSubscription = cancelSubscription;
// Update subscription
const updateSubscription = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { planId } = req.body;
        // Get user's subscription
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                subscription: true,
            },
        });
        if (!user || !user.subscription) {
            return next(new appError_1.AppError("No active subscription found", 404));
        }
        // Get plan details
        const plan = await getPlanDetails(planId);
        if (!plan) {
            return next(new appError_1.AppError("Invalid plan", 400));
        }
        // Update subscription in Stripe
        if (user.subscription.stripeSubscriptionId) {
            // Get current subscription items
            const subscription = await stripe.subscriptions.retrieve(user.subscription.stripeSubscriptionId);
            const subscriptionItemId = subscription.items.data[0].id;
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
            });
        }
        // Update subscription in database
        await prisma.subscription.update({
            where: { id: user.subscription.id },
            data: {
                planId,
                updatedAt: new Date(),
            },
        });
        // Update user plan
        await prisma.user.update({
            where: { id: userId },
            data: {
                plan: planId === "pro" ? client_1.UserPlan.PRO : client_1.UserPlan.ENTERPRISE,
            },
        });
        res.status(200).json({
            status: "success",
            message: "Subscription updated successfully",
        });
    }
    catch (error) {
        logger_1.logger.error("Update subscription error:", error);
        next(error);
    }
};
exports.updateSubscription = updateSubscription;
// Handle Stripe webhook
const handleWebhook = async (req, res, next) => {
    try {
        const signature = req.headers["stripe-signature"];
        if (!signature) {
            return next(new appError_1.AppError("Stripe signature missing", 400));
        }
        const event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET || "");
        // Handle different event types
        switch (event.type) {
            case "checkout.session.completed":
                await handleCheckoutSessionCompleted(event.data.object);
                break;
            case "invoice.paid":
                await handleInvoicePaid(event.data.object);
                break;
            case "customer.subscription.updated":
                await handleSubscriptionUpdated(event.data.object);
                break;
            case "customer.subscription.deleted":
                await handleSubscriptionDeleted(event.data.object);
                break;
            default:
                logger_1.logger.info(`Unhandled event type: ${event.type}`);
        }
        res.status(200).json({ received: true });
    }
    catch (error) {
        logger_1.logger.error("Webhook error:", error);
        res.status(400).json({ error: `Webhook error: ${error.message}` });
    }
};
exports.handleWebhook = handleWebhook;
// Helper function to handle checkout.session.completed event
const handleCheckoutSessionCompleted = async (session) => {
    try {
        const { userId, planId } = session.metadata;
        if (!userId || !planId) {
            logger_1.logger.error("Missing metadata in checkout session");
            return;
        }
        // Get subscription details from Stripe
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        // Create or update subscription in database
        await prisma.subscription.upsert({
            where: {
                userId,
            },
            create: {
                userId,
                planId,
                stripeSubscriptionId: subscription.id,
                stripeCustomerId: subscription.customer,
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
        });
        // Update user plan
        await prisma.user.update({
            where: { id: userId },
            data: {
                plan: planId === "pro" ? client_1.UserPlan.PRO : client_1.UserPlan.ENTERPRISE,
            },
        });
    }
    catch (error) {
        logger_1.logger.error("Error handling checkout.session.completed:", error);
    }
};
// Helper function to handle invoice.paid event
const handleInvoicePaid = async (invoice) => {
    try {
        if (!invoice.subscription) {
            return;
        }
        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
        const customerId = subscription.customer;
        // Find user by Stripe customer ID
        const user = await prisma.user.findFirst({
            where: { stripeCustomerId: customerId },
        });
        if (!user) {
            logger_1.logger.error(`No user found with Stripe customer ID: ${customerId}`);
            return;
        }
        // Update subscription period in database
        await prisma.subscription.update({
            where: { userId: user.id },
            data: {
                status: "ACTIVE",
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
        });
    }
    catch (error) {
        logger_1.logger.error("Error handling invoice.paid:", error);
    }
};
// Helper function to handle customer.subscription.updated event
const handleSubscriptionUpdated = async (subscription) => {
    try {
        const customerId = subscription.customer;
        // Find user by Stripe customer ID
        const user = await prisma.user.findFirst({
            where: { stripeCustomerId: customerId },
        });
        if (!user) {
            logger_1.logger.error(`No user found with Stripe customer ID: ${customerId}`);
            return;
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
        });
    }
    catch (error) {
        logger_1.logger.error("Error handling customer.subscription.updated:", error);
    }
};
// Helper function to handle customer.subscription.deleted event
const handleSubscriptionDeleted = async (subscription) => {
    try {
        const customerId = subscription.customer;
        // Find user by Stripe customer ID
        const user = await prisma.user.findFirst({
            where: { stripeCustomerId: customerId },
        });
        if (!user) {
            logger_1.logger.error(`No user found with Stripe customer ID: ${customerId}`);
            return;
        }
        // Update subscription in database
        await prisma.subscription.update({
            where: { userId: user.id },
            data: {
                status: "CANCELED",
                canceledAt: new Date(),
            },
        });
        // Update user plan to FREE
        await prisma.user.update({
            where: { id: user.id },
            data: {
                plan: client_1.UserPlan.FREE,
            },
        });
    }
    catch (error) {
        logger_1.logger.error("Error handling customer.subscription.deleted:", error);
    }
};
// Helper function to get plan details
const getPlanDetails = async (planId) => {
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
    };
    return plans[planId];
};
