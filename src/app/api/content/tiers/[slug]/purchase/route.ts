import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStripe, getStripeCustomerId } from "@/lib/stripe";

// POST - Create Stripe checkout session for tier purchase
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;

    const tier = await prisma.contentTier.findUnique({
      where: { slug },
    });

    if (!tier || !tier.isActive) {
      return NextResponse.json({ error: "Tier not found" }, { status: 404 });
    }

    // Check if already purchased
    const existingPurchase = await prisma.tierPurchase.findUnique({
      where: {
        userId_tierId: {
          userId: session.user.id,
          tierId: tier.id,
        },
      },
    });

    if (existingPurchase) {
      return NextResponse.json(
        { error: "You already own this tier" },
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

    // Create Stripe checkout session
    const checkoutSession = await getStripe().checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${tier.name} Training Tier`,
              description: tier.description || `Access to ${tier.name} training content`,
            },
            unit_amount: Math.round(parseFloat(tier.price.toString()) * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/dashboard/training/${tier.slug}?purchase=success`,
      cancel_url: `${origin}/dashboard/training?purchase=cancelled`,
      metadata: {
        type: "tier_purchase",
        tierId: tier.id,
        tierSlug: tier.slug,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Failed to create checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
