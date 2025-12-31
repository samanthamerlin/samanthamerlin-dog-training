import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStripe, getStripeCustomerId } from "@/lib/stripe";

// GET - Get user's subscription status
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await prisma.subscription.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    if (!subscription) {
      return NextResponse.json({
        hasSubscription: false,
        subscription: null,
      });
    }

    // Check if subscription is still active
    const isActive = subscription.status === "ACTIVE" &&
      (!subscription.currentPeriodEnd || subscription.currentPeriodEnd > new Date());

    return NextResponse.json({
      hasSubscription: isActive,
      subscription: {
        status: subscription.status,
        type: subscription.type,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
      },
    });
  } catch (error) {
    console.error("Failed to fetch subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}

// POST - Create a new subscription checkout session
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user already has an active subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
        currentPeriodEnd: { gt: new Date() },
      },
    });

    if (existingSubscription) {
      return NextResponse.json(
        { error: "You already have an active subscription" },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    const customerId = await getStripeCustomerId(
      session.user.email!,
      session.user.name
    );

    // Get origin for success/cancel URLs
    const origin = request.headers.get("origin") || process.env.NEXTAUTH_URL || "http://localhost:3000";

    // Create Stripe checkout session for subscription
    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Live Support Subscription",
              description: "Monthly access to live training support and Q&A sessions",
            },
            unit_amount: 1900, // $19.00
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/dashboard/training?subscription=success`,
      cancel_url: `${origin}/dashboard/training?subscription=cancelled`,
      metadata: {
        type: "subscription",
        userId: session.user.id,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Failed to create subscription checkout:", error);
    return NextResponse.json(
      { error: "Failed to create subscription checkout" },
      { status: 500 }
    );
  }
}
