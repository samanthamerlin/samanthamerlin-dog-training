import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const type = session.metadata?.type;
        const invoiceId = session.metadata?.invoiceId;
        const tierId = session.metadata?.tierId;
        const userId = session.metadata?.userId;

        // Handle invoice payment
        if (invoiceId) {
          const amountPaid = (session.amount_total || 0) / 100; // Convert from cents

          // Update invoice
          await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
              status: "PAID",
              amountPaid,
              paidAt: new Date(),
            },
          });

          // Create payment record
          await prisma.payment.create({
            data: {
              invoiceId,
              amount: amountPaid,
              method: "STRIPE",
              status: "COMPLETED",
              stripePaymentId: session.payment_intent as string,
              paidAt: new Date(),
            },
          });

          console.log(`Invoice ${invoiceId} marked as paid via Stripe`);
        }

        // Handle tier purchase
        if (type === "tier_purchase" && tierId && userId) {
          const amountPaid = (session.amount_total || 0) / 100;

          // Check if purchase already exists
          const existingPurchase = await prisma.tierPurchase.findUnique({
            where: {
              userId_tierId: {
                userId,
                tierId,
              },
            },
          });

          if (!existingPurchase) {
            await prisma.tierPurchase.create({
              data: {
                userId,
                tierId,
                amount: amountPaid,
                stripePaymentId: session.payment_intent as string,
              },
            });

            console.log(`Tier ${tierId} purchased by user ${userId}`);
          }
        }

        // Handle subscription
        if (type === "subscription" && userId) {
          const stripeSubId = session.subscription as string;

          // Check if subscription already exists
          const existingSub = await prisma.subscription.findFirst({
            where: { stripeSubscriptionId: stripeSubId },
          });

          if (existingSub) {
            // Update existing subscription
            await prisma.subscription.update({
              where: { id: existingSub.id },
              data: {
                status: "ACTIVE",
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              },
            });
          } else {
            // Create new subscription
            await prisma.subscription.create({
              data: {
                userId,
                type: "LIVE_SUPPORT",
                status: "ACTIVE",
                stripeSubscriptionId: stripeSubId,
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              },
            });
          }

          console.log(`Subscription created for user ${userId}`);
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const invoiceId = paymentIntent.metadata?.invoiceId;

        if (invoiceId) {
          // Check if already processed
          const existingPayment = await prisma.payment.findFirst({
            where: {
              stripePaymentId: paymentIntent.id,
            },
          });

          if (!existingPayment) {
            const amountPaid = paymentIntent.amount / 100;

            await prisma.invoice.update({
              where: { id: invoiceId },
              data: {
                status: "PAID",
                amountPaid,
                paidAt: new Date(),
              },
            });

            await prisma.payment.create({
              data: {
                invoiceId,
                amount: amountPaid,
                method: "STRIPE",
                status: "COMPLETED",
                stripePaymentId: paymentIntent.id,
                paidAt: new Date(),
              },
            });

            console.log(`Invoice ${invoiceId} marked as paid via PaymentIntent`);
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment failed for ${paymentIntent.id}`);
        break;
      }

      case "customer.subscription.updated": {
        const stripeSubscription = event.data.object as Stripe.Subscription;

        const existingSub = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: stripeSubscription.id },
        });

        if (existingSub) {
          await prisma.subscription.update({
            where: { id: existingSub.id },
            data: {
              status: stripeSubscription.status === "active" ? "ACTIVE" : "CANCELLED",
            },
          });

          console.log(`Subscription ${stripeSubscription.id} updated`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: "CANCELLED",
            cancelledAt: new Date(),
          },
        });

        console.log(`Subscription ${subscription.id} cancelled`);
        break;
      }

      case "invoice.payment_succeeded": {
        // Raw event data for invoice
        const invoiceData = event.data.object as unknown as Record<string, unknown>;
        const subscriptionId = invoiceData.subscription as string | null;
        const billingReason = invoiceData.billing_reason as string | null;

        if (subscriptionId && billingReason === "subscription_cycle") {
          // This is a recurring subscription payment
          const periodStart = invoiceData.period_start as number | undefined;
          const periodEnd = invoiceData.period_end as number | undefined;

          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subscriptionId },
            data: {
              status: "ACTIVE",
              ...(periodStart && { currentPeriodStart: new Date(periodStart * 1000) }),
              ...(periodEnd && { currentPeriodEnd: new Date(periodEnd * 1000) }),
            },
          });

          console.log(`Subscription ${subscriptionId} renewed successfully`);
        }
        break;
      }

      case "invoice.payment_failed": {
        // Raw event data for invoice
        const invoiceData = event.data.object as unknown as Record<string, unknown>;
        const subscriptionId = invoiceData.subscription as string | null;

        if (subscriptionId) {
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subscriptionId },
            data: {
              status: "PAST_DUE",
            },
          });

          console.log(`Subscription ${subscriptionId} payment failed`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
