import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const tierUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  isActive: z.boolean().optional(),
});

// PUT - Update a tier
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = tierUpdateSchema.parse(body);

    // Check if tier exists
    const existingTier = await prisma.contentTier.findUnique({
      where: { id },
    });

    if (!existingTier) {
      return NextResponse.json({ error: "Tier not found" }, { status: 404 });
    }

    // Check slug uniqueness if changing
    if (validatedData.slug && validatedData.slug !== existingTier.slug) {
      const slugExists = await prisma.contentTier.findUnique({
        where: { slug: validatedData.slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "A tier with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const tier = await prisma.contentTier.update({
      where: { id },
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
        price: validatedData.price,
        isActive: validatedData.isActive,
      },
    });

    return NextResponse.json({ tier });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Failed to update tier:", error);
    return NextResponse.json(
      { error: "Failed to update tier" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a tier
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if tier exists
    const existingTier = await prisma.contentTier.findUnique({
      where: { id },
      include: {
        purchases: true,
      },
    });

    if (!existingTier) {
      return NextResponse.json({ error: "Tier not found" }, { status: 404 });
    }

    // Warn if there are purchases
    if (existingTier.purchases.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete tier with existing purchases. Deactivate it instead." },
        { status: 400 }
      );
    }

    // Delete tier (cascades to modules and lessons via Prisma)
    await prisma.contentTier.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete tier:", error);
    return NextResponse.json(
      { error: "Failed to delete tier" },
      { status: 500 }
    );
  }
}
