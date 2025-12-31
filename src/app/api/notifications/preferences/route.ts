import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updatePreferencesSchema = z.object({
  bookingReminders: z.boolean().optional(),
  bookingUpdates: z.boolean().optional(),
  invoiceNotifications: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
  trainingUpdates: z.boolean().optional(),
});

// GET - Get user's notification preferences
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId: session.user.id },
    });

    // Return default preferences if none exist
    if (!preferences) {
      preferences = {
        id: "",
        userId: session.user.id,
        bookingReminders: true,
        bookingUpdates: true,
        invoiceNotifications: true,
        marketingEmails: true,
        trainingUpdates: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error("Failed to fetch preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

// PUT - Update notification preferences
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updatePreferencesSchema.parse(body);

    const preferences = await prisma.notificationPreference.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...validatedData,
      },
      update: validatedData,
    });

    return NextResponse.json({ preferences });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Failed to update preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
