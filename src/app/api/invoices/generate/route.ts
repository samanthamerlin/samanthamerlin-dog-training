import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const generateInvoiceSchema = z.object({
  clientId: z.string(),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
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

// POST - Generate invoice from uninvoiced service records
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = generateInvoiceSchema.parse(body);

    // Verify client exists
    const client = await prisma.clientProfile.findUnique({
      where: { id: validatedData.clientId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Build date range filter
    const dateFilter: Record<string, unknown> = {};
    if (validatedData.periodStart) {
      dateFilter.gte = new Date(validatedData.periodStart);
    }
    if (validatedData.periodEnd) {
      dateFilter.lte = new Date(validatedData.periodEnd);
    }

    // Find uninvoiced service records for this client
    // Service records are linked to clients via dogs or booking requests
    const uninvoicedRecords = await prisma.serviceRecord.findMany({
      where: {
        invoiceItems: { none: {} },
        OR: [
          {
            dog: {
              clientId: validatedData.clientId,
            },
          },
          {
            bookingRequest: {
              clientId: validatedData.clientId,
            },
          },
        ],
        ...(Object.keys(dateFilter).length > 0 && { serviceDate: dateFilter }),
      },
      include: {
        serviceType: true,
        dog: true,
      },
      orderBy: { serviceDate: "asc" },
    });

    if (uninvoicedRecords.length === 0) {
      return NextResponse.json(
        { error: "No uninvoiced service records found for this client" },
        { status: 400 }
      );
    }

    // Calculate period from records if not provided
    const periodStart = validatedData.periodStart
      ? new Date(validatedData.periodStart)
      : new Date(Math.min(...uninvoicedRecords.map((r) => r.serviceDate.getTime())));

    const periodEnd = validatedData.periodEnd
      ? new Date(validatedData.periodEnd)
      : new Date(Math.max(...uninvoicedRecords.map((r) => r.serviceDate.getTime())));

    // Due date: 30 days from now
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    // Calculate totals
    const subtotal = uninvoicedRecords.reduce(
      (sum, record) => sum + parseFloat(record.total.toString()),
      0
    );
    const tax = 0;
    const total = subtotal + tax;

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // Create invoice with items
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        clientId: validatedData.clientId,
        periodStart,
        periodEnd,
        dueDate,
        subtotal,
        tax,
        total,
        status: "DRAFT",
        items: {
          create: uninvoicedRecords.map((record) => ({
            serviceRecordId: record.id,
            description: `${record.serviceType.name}${record.dog ? ` - ${record.dog.name}` : ""} (${record.serviceDate.toLocaleDateString()})`,
            quantity: parseFloat(record.quantity.toString()),
            unitPrice: parseFloat(record.unitPrice.toString()),
            total: parseFloat(record.total.toString()),
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
            serviceRecord: {
              include: {
                serviceType: true,
                dog: true,
              },
            },
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
    console.error("Failed to generate invoice:", error);
    return NextResponse.json(
      { error: "Failed to generate invoice" },
      { status: 500 }
    );
  }
}
