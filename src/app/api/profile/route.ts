import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
});

// GET - Get current user's profile
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        clientProfile: {
          select: {
            phone: true,
            address: true,
            city: true,
            state: true,
            zipCode: true,
            emergencyContact: true,
            emergencyPhone: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      profile: {
        name: user.name || "",
        email: user.email,
        phone: user.clientProfile?.phone || "",
        address: user.clientProfile?.address || "",
        city: user.clientProfile?.city || "",
        state: user.clientProfile?.state || "CA",
        zipCode: user.clientProfile?.zipCode || "",
        emergencyContact: user.clientProfile?.emergencyContact || "",
        emergencyPhone: user.clientProfile?.emergencyPhone || "",
      },
    });
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PUT - Update current user's profile
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    // Update user name if provided
    if (validatedData.name !== undefined) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name: validatedData.name },
      });
    }

    // Get or create client profile
    let clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!clientProfile) {
      clientProfile = await prisma.clientProfile.create({
        data: {
          userId: session.user.id,
          phone: validatedData.phone,
          address: validatedData.address,
          city: validatedData.city,
          state: validatedData.state || "CA",
          zipCode: validatedData.zipCode,
          emergencyContact: validatedData.emergencyContact,
          emergencyPhone: validatedData.emergencyPhone,
        },
      });
    } else {
      clientProfile = await prisma.clientProfile.update({
        where: { userId: session.user.id },
        data: {
          phone: validatedData.phone,
          address: validatedData.address,
          city: validatedData.city,
          state: validatedData.state,
          zipCode: validatedData.zipCode,
          emergencyContact: validatedData.emergencyContact,
          emergencyPhone: validatedData.emergencyPhone,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Failed to update profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
