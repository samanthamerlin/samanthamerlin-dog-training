import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const tierSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  isActive: z.boolean().optional(),
});

// GET - List all tiers with modules and lessons (admin)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tiers = await prisma.contentTier.findMany({
      include: {
        modules: {
          include: {
            lessons: {
              orderBy: { sortOrder: "asc" },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ tiers });
  } catch (error) {
    console.error("Failed to fetch tiers:", error);
    return NextResponse.json(
      { error: "Failed to fetch tiers" },
      { status: 500 }
    );
  }
}

// POST - Create a new tier
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = tierSchema.parse(body);

    // Check if slug is unique
    const existingTier = await prisma.contentTier.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingTier) {
      return NextResponse.json(
        { error: "A tier with this slug already exists" },
        { status: 400 }
      );
    }

    const tier = await prisma.contentTier.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description || null,
        price: validatedData.price,
        isActive: validatedData.isActive ?? true,
      },
    });

    return NextResponse.json({ tier }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Failed to create tier:", error);
    return NextResponse.json(
      { error: "Failed to create tier" },
      { status: 500 }
    );
  }
}
