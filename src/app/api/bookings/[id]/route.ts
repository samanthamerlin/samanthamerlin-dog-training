import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateBookingSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "REJECTED", "CANCELLED", "COMPLETED", "NO_SHOW"]).optional(),
  confirmedDate: z.string().optional(),
  confirmedTime: z.string().optional(),
  adminNotes: z.string().optional(),
  rejectionReason: z.string().optional(),
});

// GET - Get a single booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const booking = await prisma.bookingRequest.findUnique({
      where: { id },
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
        serviceRecord: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Non-admins can only view their own bookings
    if (session.user.role !== "ADMIN") {
      const clientProfile = await prisma.clientProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!clientProfile || booking.clientId !== clientProfile.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("Failed to fetch booking:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

// PATCH - Update booking (admin only for status changes)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateBookingSchema.parse(body);

    const booking = await prisma.bookingRequest.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check permissions
    const isAdmin = session.user.role === "ADMIN";
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: session.user.id },
    });
    const isOwner = clientProfile?.id === booking.clientId;

    // Non-admins can only cancel their own pending bookings
    if (!isAdmin) {
      if (!isOwner) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      if (validatedData.status && validatedData.status !== "CANCELLED") {
        return NextResponse.json(
          { error: "You can only cancel your bookings" },
          { status: 403 }
        );
      }

      if (booking.status !== "PENDING") {
        return NextResponse.json(
          { error: "Can only cancel pending bookings" },
          { status: 400 }
        );
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (validatedData.status) {
      updateData.status = validatedData.status;
    }

    if (validatedData.confirmedDate) {
      updateData.confirmedDate = new Date(validatedData.confirmedDate);
    }

    if (validatedData.confirmedTime) {
      updateData.confirmedTime = new Date(validatedData.confirmedTime);
    }

    if (validatedData.adminNotes !== undefined) {
      updateData.adminNotes = validatedData.adminNotes;
    }

    if (validatedData.rejectionReason !== undefined) {
      updateData.rejectionReason = validatedData.rejectionReason;
    }

    const updatedBooking = await prisma.bookingRequest.update({
      where: { id },
      data: updateData,
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
    });

    return NextResponse.json({ booking: updatedBooking });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Failed to update booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

// DELETE - Cancel/delete booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const booking = await prisma.bookingRequest.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check permissions
    const isAdmin = session.user.role === "ADMIN";
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: session.user.id },
    });
    const isOwner = clientProfile?.id === booking.clientId;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Non-admins can only cancel pending bookings
    if (!isAdmin && booking.status !== "PENDING") {
      return NextResponse.json(
        { error: "Can only cancel pending bookings" },
        { status: 400 }
      );
    }

    // Soft delete by setting status to CANCELLED
    await prisma.bookingRequest.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete booking:", error);
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}
