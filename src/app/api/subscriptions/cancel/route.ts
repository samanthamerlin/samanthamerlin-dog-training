import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

// POST - Cancel subscription
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await prisma.subscription.findFirst({
      where: { userId: session.user.id, status: "ACTIVE" },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 404 }
      );
    }

    if (subscription.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Subscription is not active" },
        { status: 400 }
      );
    }

    // Cancel in Stripe if there's a subscription ID
    if (subscription.stripeSubscriptionId) {
      const stripe = getStripe();
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    }

    // Update local subscription status
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to cancel subscription:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
