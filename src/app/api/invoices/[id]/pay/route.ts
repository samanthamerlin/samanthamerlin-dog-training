import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStripe, getStripeCustomerId } from "@/lib/stripe";

// POST - Create Stripe checkout session for invoice payment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        client: {
          include: {
            user: true,
          },
        },
        items: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Verify user owns this invoice (unless admin)
    if (session.user.role !== "ADMIN") {
      const clientProfile = await prisma.clientProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!clientProfile || invoice.clientId !== clientProfile.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    // Check if already paid
    if (invoice.status === "PAID") {
      return NextResponse.json(
        { error: "Invoice already paid" },
        { status: 400 }
      );
    }

    // Check if cancelled
    if (invoice.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Invoice has been cancelled" },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    const customerId = await getStripeCustomerId(
      invoice.client.user.email!,
      invoice.client.user.name
    );

    // Calculate amount due (total - amount paid)
    const amountDue = parseFloat(invoice.total.toString()) - parseFloat(invoice.amountPaid.toString());

    if (amountDue <= 0) {
      return NextResponse.json(
        { error: "No amount due" },
        { status: 400 }
      );
    }

    // Create line items for Stripe
    const lineItems = invoice.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.description,
        },
        unit_amount: Math.round(parseFloat(item.unitPrice.toString()) * 100), // Convert to cents
      },
      quantity: Math.round(parseFloat(item.quantity.toString())),
    }));

    // Get origin for success/cancel URLs
    const origin = request.headers.get("origin") || process.env.NEXTAUTH_URL || "http://localhost:3000";

    // Create Stripe checkout session
    const checkoutSession = await getStripe().checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/dashboard/invoices/${invoice.id}?payment=success`,
      cancel_url: `${origin}/dashboard/invoices/${invoice.id}?payment=cancelled`,
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
      },
      payment_intent_data: {
        metadata: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
        },
      },
    });

    // Update invoice with Stripe session info
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        stripeInvoiceId: checkoutSession.id,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Failed to create checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create payment session" },
      { status: 500 }
    );
  }
}
