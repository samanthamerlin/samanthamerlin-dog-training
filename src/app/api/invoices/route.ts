import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createInvoiceSchema = z.object({
  clientId: z.string(),
  periodStart: z.string(),
  periodEnd: z.string(),
  dueDate: z.string(),
  notes: z.string().optional(),
  items: z.array(z.object({
    serviceRecordId: z.string().optional(),
    description: z.string(),
    quantity: z.number().default(1),
    unitPrice: z.number(),
  })).min(1, "At least one item required"),
});

// Helper to generate invoice number
async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.invoice.count({
    where: {
      invoiceNumber: {
        startsWith: `INV-${year}`,
      },
    },
  });
  return `INV-${year}-${String(count + 1).padStart(4, "0")}`;
}

// GET - List invoices
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const clientId = searchParams.get("clientId");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: Record<string, unknown> = {};

    // Non-admins can only see their own invoices
    if (session.user.role !== "ADMIN") {
      const clientProfile = await prisma.clientProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!clientProfile) {
        return NextResponse.json({ invoices: [] });
      }

      where.clientId = clientProfile.id;
      // Clients can only see sent/paid invoices, not drafts
      where.status = { not: "DRAFT" };
    } else if (clientId) {
      where.clientId = clientId;
    }

    if (status) {
      where.status = status;
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        client: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        items: {
          include: {
            serviceRecord: true,
          },
        },
        payments: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error("Failed to fetch invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

// POST - Create a new invoice (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createInvoiceSchema.parse(body);

    // Verify client exists
    const client = await prisma.clientProfile.findUnique({
      where: { id: validatedData.clientId },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Calculate totals
    const subtotal = validatedData.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const tax = 0; // No tax for now
    const total = subtotal + tax;

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // Create invoice with items
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        clientId: validatedData.clientId,
        periodStart: new Date(validatedData.periodStart),
        periodEnd: new Date(validatedData.periodEnd),
        dueDate: new Date(validatedData.dueDate),
        subtotal,
        tax,
        total,
        notes: validatedData.notes,
        status: "DRAFT",
        items: {
          create: validatedData.items.map((item) => ({
            serviceRecordId: item.serviceRecordId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        client: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        items: {
          include: {
            serviceRecord: true,
          },
        },
      },
    });

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Failed to create invoice:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
