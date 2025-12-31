import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createServiceRecordSchema = z.object({
  bookingRequestId: z.string().optional(),
  serviceTypeId: z.string(),
  dogId: z.string().optional(),
  serviceDate: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  duration: z.number(),
  unitPrice: z.number(),
  quantity: z.number().default(1),
  adjustments: z.number().default(0),
  notes: z.string().optional(),
});

// GET - List service records (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const invoiced = searchParams.get("invoiced");
    const limit = parseInt(searchParams.get("limit") || "100");

    const where: Record<string, unknown> = {};

    if (invoiced === "true") {
      where.invoiceItems = { some: {} };
    } else if (invoiced === "false") {
      where.invoiceItems = { none: {} };
    }

    const records = await prisma.serviceRecord.findMany({
      where,
      include: {
        serviceType: true,
        dog: {
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
          },
        },
        bookingRequest: {
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
          },
        },
        invoiceItems: true,
      },
      orderBy: { serviceDate: "desc" },
      take: limit,
    });

    return NextResponse.json({ records });
  } catch (error) {
    console.error("Failed to fetch service records:", error);
    return NextResponse.json(
      { error: "Failed to fetch service records" },
      { status: 500 }
    );
  }
}

// POST - Create a service record (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createServiceRecordSchema.parse(body);

    // Verify service type exists
    const serviceType = await prisma.serviceType.findUnique({
      where: { id: validatedData.serviceTypeId },
    });

    if (!serviceType) {
      return NextResponse.json({ error: "Service type not found" }, { status: 404 });
    }

    // Calculate total
    const quantity = validatedData.quantity || 1;
    const total = (validatedData.unitPrice * quantity) + (validatedData.adjustments || 0);

    // Create service record
    const record = await prisma.serviceRecord.create({
      data: {
        serviceTypeId: validatedData.serviceTypeId,
        bookingRequestId: validatedData.bookingRequestId,
        dogId: validatedData.dogId,
        serviceDate: new Date(validatedData.serviceDate),
        startTime: validatedData.startTime ? new Date(validatedData.startTime) : null,
        endTime: validatedData.endTime ? new Date(validatedData.endTime) : null,
        duration: validatedData.duration,
        unitPrice: validatedData.unitPrice,
        quantity: validatedData.quantity || 1,
        adjustments: validatedData.adjustments || 0,
        total,
        notes: validatedData.notes,
      },
      include: {
        serviceType: true,
        dog: {
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
          },
        },
        bookingRequest: {
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
          },
        },
      },
    });

    // If this was from a booking, update the booking status to COMPLETED
    if (validatedData.bookingRequestId) {
      await prisma.bookingRequest.update({
        where: { id: validatedData.bookingRequestId },
        data: { status: "COMPLETED" },
      });
    }

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Failed to create service record:", error);
    return NextResponse.json(
      { error: "Failed to create service record" },
      { status: 500 }
    );
  }
}
