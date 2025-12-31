import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const moduleSchema = z.object({
  tierId: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

// POST - Create a new module
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = moduleSchema.parse(body);

    // Check if tier exists
    const tier = await prisma.contentTier.findUnique({
      where: { id: validatedData.tierId },
    });

    if (!tier) {
      return NextResponse.json({ error: "Tier not found" }, { status: 404 });
    }

    // Get max sort order if not provided
    let sortOrder = validatedData.sortOrder;
    if (sortOrder === undefined) {
      const maxOrder = await prisma.contentModule.findFirst({
        where: { tierId: validatedData.tierId },
        orderBy: { sortOrder: "desc" },
        select: { sortOrder: true },
      });
      sortOrder = (maxOrder?.sortOrder ?? -1) + 1;
    }

    // Generate slug from title if not provided
    const slug = validatedData.slug || validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const module = await prisma.contentModule.create({
      data: {
        tierId: validatedData.tierId,
        title: validatedData.title,
        slug,
        description: validatedData.description || null,
        sortOrder,
      },
    });

    return NextResponse.json({ module }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Failed to create module:", error);
    return NextResponse.json(
      { error: "Failed to create module" },
      { status: 500 }
    );
  }
}
