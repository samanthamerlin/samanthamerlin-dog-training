import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createBookingSchema = z.object({
  serviceTypeId: z.string(),
  requestedDate: z.string(),
  requestedTime: z.string().optional(),
  duration: z.number().optional(),
  dogIds: z.array(z.string()).min(1, "Please select at least one dog"),
  notes: z.string().optional(),
});

// GET - List bookings for current user (or all for admin)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build where clause
    const where: Record<string, unknown> = {};

    // Non-admins can only see their own bookings
    if (session.user.role !== "ADMIN") {
      const clientProfile = await prisma.clientProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!clientProfile) {
        return NextResponse.json({ bookings: [] });
      }

      where.clientId = clientProfile.id;
    }

    if (status) {
      where.status = status;
    }

    const bookings = await prisma.bookingRequest.findMany({
      where,
      include: {
        serviceType: true,
        dogs: {
          include: {
            dog: true,
          },
        },
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
      orderBy: { requestedDate: "desc" },
      take: limit,
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// POST - Create a new booking request
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createBookingSchema.parse(body);

    // Get or create client profile
    let clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!clientProfile) {
      clientProfile = await prisma.clientProfile.create({
        data: {
          userId: session.user.id,
        },
      });
    }

    // Verify dogs belong to this client
    const dogs = await prisma.dog.findMany({
      where: {
        id: { in: validatedData.dogIds },
        clientId: clientProfile.id,
      },
    });

    if (dogs.length !== validatedData.dogIds.length) {
      return NextResponse.json(
        { error: "One or more dogs not found" },
        { status: 400 }
      );
    }

    // Verify service exists and is active
    const service = await prisma.serviceType.findUnique({
      where: { id: validatedData.serviceTypeId },
    });

    if (!service || !service.isActive) {
      return NextResponse.json(
        { error: "Service not available" },
        { status: 400 }
      );
    }

    // Create booking request with dogs
    const booking = await prisma.bookingRequest.create({
      data: {
        clientId: clientProfile.id,
        serviceTypeId: validatedData.serviceTypeId,
        requestedDate: new Date(validatedData.requestedDate),
        requestedTime: validatedData.requestedTime,
        duration: validatedData.duration || service.duration,
        notes: validatedData.notes,
        status: "PENDING",
        dogs: {
          create: validatedData.dogIds.map((dogId) => ({
            dogId,
          })),
        },
      },
      include: {
        serviceType: true,
        dogs: {
          include: {
            dog: true,
          },
        },
      },
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Failed to create booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
